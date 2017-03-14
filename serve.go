//Super simple localhost http server for testing.
// `go run serve.go` or:
// `go build serve.go && ./serve`
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("Serving files in the current directory on port 8090")
	http.Handle("/", http.FileServer(http.Dir(".")))
	err := http.ListenAndServe(":8090", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
