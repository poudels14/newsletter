package main

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"encoding/base64"

	"flag"

	"gocloud.dev/blob"
	"gocloud.dev/blob/fileblob"
)

var (
	server = flag.String("server", "http://localhost:8003", "Server to upload the files to")
)

func getStaticServer() string {
	staticserver := os.Getenv("STATICSERVER")
	if staticserver == "" {
		staticserver = *server
	}
	return staticserver
}

func uploadFile(url string, filename string, content string) {
	jsonString := fmt.Sprintf(`{"relativePath": "%s", "base64Content" : "%s"}`, filename, content)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(jsonString)))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	_, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
}

func main() {
	flag.Parse()

	staticDirectory := os.Getenv("STATICFILES_DIRECTORY")
	if len(staticDirectory) == 0 {
		panic("Static directory should be specified")
	}

	fmt.Println("Uploading files from: ", staticDirectory)

	bucket, err := fileblob.OpenBucket(staticDirectory, nil)
	if err != nil {
		panic("Couldn't open file bucket")
	}
	defer bucket.Close()

	files := bucket.List(&blob.ListOptions{Prefix: ""})

	staticserver := getStaticServer()
	fmt.Println("staticserver", staticserver)
	uploadURL := fmt.Sprintf("%s/upload", staticserver)
	fmt.Println(fmt.Sprintf("Uploading files to: %s", uploadURL))
	ctxt := context.Background()
	for {
		file, _ := files.Next(ctxt)
		if file == nil {
			break
		}
		fmt.Println("Uploading file: ", file.Key)
		content, err := bucket.ReadAll(context.Background(), file.Key)
		if err != nil {
			panic("Error writing to file")
		}

		filename := fmt.Sprintf("/public/%s", file.Key)
		contentBase64 := base64.StdEncoding.EncodeToString(content)
		uploadFile(uploadURL, filename, contentBase64)
	}
}
