// site implements a small service hosting bentheelder.io
// TODO(bentheelder): improve error handling / logging
package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"
)

func verifyGitHubHook(secret, receivedSignature, body []byte) bool {
	var gitHubSignaturePrefix = []byte("sha1=")
	const signatureHexLength = 40
	const decodedSignatureLength = 20

	if !bytes.HasPrefix(receivedSignature, gitHubSignaturePrefix) ||
		len(receivedSignature) != signatureHexLength+len(gitHubSignaturePrefix) {
		return false
	}
	actualReceived := make([]byte, decodedSignatureLength)
	hex.Decode(actualReceived, []byte(receivedSignature[len(gitHubSignaturePrefix):]))

	hasher := hmac.New(sha1.New, secret)
	hasher.Write(body)
	computedSignature := hasher.Sum(nil)

	return hmac.Equal(actualReceived, computedSignature)
}

func addGitHubHookHandler(path string, secret []byte, onHook func()) {
	http.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
		receivedSignature := []byte(r.Header.Get("X-Hub-Signature"))
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Print(err)
			http.Error(w, "couldn't read body", http.StatusInternalServerError)
			return
		}
		if !verifyGitHubHook(secret, receivedSignature, body) {
			log.Printf("Got bad signature: %v\n", receivedSignature)
			http.Error(w, "bad signature", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
		go onHook()
	})
}

func dupeRequest(original *http.Request) *http.Request {
	r2 := new(http.Request)
	*r2 = *original
	r2.URL = new(url.URL)
	*r2.URL = *original.URL
	return r2
}

func defaultExtension(extension string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if path.Ext(r.URL.Path) == "" {
			r2 := dupeRequest(r)
			r2.URL.Path = r.URL.Path + extension
			h.ServeHTTP(w, r2)
		} else {
			h.ServeHTTP(w, r)
		}
	})
}

func interceptExact(
	exactPath string,
	interceptHandler http.Handler,
	defaultHandler http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == exactPath {
			interceptHandler.ServeHTTP(w, r)
		} else {
			defaultHandler.ServeHTTP(w, r)
		}
	})
}

func redirectPrefix(
	prefix string,
	replacementPrefix string,
	defaultHandler http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, prefix) {
			r2 := dupeRequest(r)
			r2.URL.Path = strings.Replace(r2.URL.Path, prefix, replacementPrefix, 1)
			http.Redirect(w, r2, r2.URL.String(), http.StatusMovedPermanently)
		} else {
			defaultHandler.ServeHTTP(w, r)
		}
	})
}

// handle custom 404 page etc by intercepting WriteHeader calls
type errorResponseWriter struct {
	next           http.ResponseWriter
	request        *http.Request
	errorHandler   http.Handler
	headerDisabled bool
	writeDisabled  bool
}

func (w *errorResponseWriter) WriteHeader(status int) {
	if status == http.StatusNotFound {
		// clear out error headers
		w.next.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.next.Header().Del("X-Content-Type-Options")
		// still set the status
		w.next.WriteHeader(status)
		w.headerDisabled = true
		// serve the error page
		r2 := dupeRequest(w.request)
		r2.URL.Path = fmt.Sprintf("%d.html", status)
		w.errorHandler.ServeHTTP(w, r2)
		// stop access to the underyling writer from other handlers
		w.writeDisabled = true
	} else if !w.headerDisabled {
		w.next.WriteHeader(status)
	}
}

func (w *errorResponseWriter) Write(b []byte) (int, error) {
	if !w.writeDisabled {
		return w.next.Write(b)
	}
	return len(b), nil
}

func (w *errorResponseWriter) Header() http.Header {
	return w.next.Header()
}

// inject custom error page handler using custom http.ResponseWriter above
func injectCustomErrorWriter(errorHandler http.Handler, defaultHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defaultHandler.ServeHTTP(&errorResponseWriter{w, r, errorHandler, false, false}, r)
	})
}

func main() {
	gitHubSiteSecret := []byte(os.Getenv("GITHUB_SITE_HOOK_SECRET"))
	// updates / regenerates the static content to the latest version
	updateSite := func() {
		log.Print("Updating Site.")
		cmd := exec.Command("bash", "-c", "./on_hook.sh")
		cmd.Run()
		log.Print("Updating Site Complete.")
	}
	// periodically run site update in the background
	// TODO(bentheelder): what should the tick rate really be?
	go func() {
		updateSite()
		for _ = range time.Tick(10 * time.Minute) {
			log.Print("Periodic Background Update.")
			updateSite()
		}
	}()
	// setup http handlers
	addGitHubHookHandler("/github-hook-site", gitHubSiteSecret, func() {
		log.Print("Received /github-hook-site")
		updateSite()
	})
	// setup content handling
	fileServer := defaultExtension(".html", http.FileServer(http.Dir("./www")))
	http.Handle("/",
		injectCustomErrorWriter(
			fileServer,
			interceptExact("/",
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					http.ServeFile(w, r, "./www/index.html")
				}),
				redirectPrefix(
					"/blog",
					"/posts",
					fileServer))),
	)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
