// site implements a small service hosting bentheelder.io
// TODO(bentheelder): improve error handling / logging
package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
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

func defaultExtension(extension string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if path.Ext(r.URL.Path) == "" {
			r2 := new(http.Request)
			*r2 = *r
			r2.URL = new(url.URL)
			*r2.URL = *r.URL
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

func main() {
	gitHubSiteSecret := []byte(os.Getenv("GITHUB_SITE_HOOK_SECRET"))
	addGitHubHookHandler("/github-hook-site", gitHubSiteSecret, func() {
		log.Print("Received Hook, Updating Site.")
		cmd := exec.Command("bash", "-c", "./on_hook.sh")
		cmd.Run()
		log.Print("Updating Site Complete.")
	})
	http.Handle("/",
		interceptExact("/",
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				http.ServeFile(w, r, "./www/index.html")
			}),
			defaultExtension(".html",
				http.FileServer(http.Dir("./www")))),
	)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
