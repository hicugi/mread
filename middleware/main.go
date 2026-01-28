package main

import (
	"fmt"
	"net/http"

	"mreadmiddleware/internal/Home"
	"mreadmiddleware/internal/Config"
)

type Handler func(w http.ResponseWriter, req *http.Request)
func handleReq(path string, callback Handler) {
	http.HandleFunc(path, (func(w http.ResponseWriter, req *http.Request) {
		fmt.Printf("GET: %s\n", path)
		callback(w, req)
	}))
}

func main() {
	myIp, err := config.GetIP()
	if err != nil {
		fmt.Println("Error getting interface addresses:", err)
	}

	handleReq("/", home.Home)

	fmt.Printf("Starting server on http://%v:%v\n", myIp, config.SERVER_PORT)
	http.ListenAndServe(fmt.Sprintf(":%v", config.SERVER_PORT), nil)
}
