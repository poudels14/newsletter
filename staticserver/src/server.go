package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"os"

	"github.com/gofiber/fiber"
	"gocloud.dev/blob"
	"gocloud.dev/blob/fileblob"
)

var (
	host = flag.String("host", "0.0.0.0:8003", "TCP address to listen to")
	dir  = flag.String("dir", "/data/static/", "Directory to store/serve static files from from")
)

func saveFile(bucket *blob.Bucket, filename string, content *[]byte) string {
	err := bucket.WriteAll(context.Background(), filename, *content, nil)
	if err != nil {
		panic("Error writing to file")
	}
	return filename
}

func main() {
	flag.Parse()
	fmt.Println("Running static server...")
	fmt.Println("Serving files from:", *dir)

	if err := os.MkdirAll(*dir, 0777); err != nil {
		panic("Couldn't create static files upload directory")
	}
	bucket, err := fileblob.OpenBucket(*dir, nil)
	if err != nil {
		panic("Couldn't open file bucket")
	}
	defer bucket.Close()

	app := fiber.New()

	// Sample middleware
	app.Use(func(c *fiber.Ctx) {
		c.Next()
	})

	app.Get("/ok", func(c *fiber.Ctx) {
		c.Send("OK")
	})

	app.Get("/newsletters/delete/*", func(c *fiber.Ctx) {
		directoryToDelete := fmt.Sprintf("newsletters/%s", c.Params("*"))
		files := bucket.List(&blob.ListOptions{Prefix: directoryToDelete})

		ctxt := context.Background()
		for {
			file, _ := files.Next(ctxt)
			if file == nil {
				break
			}
			bucket.Delete(ctxt, file.Key)
		}
	})

	app.Post("/newsletters/upload", func(c *fiber.Ctx) {
		type Request struct {
			RelativePath string `json:"relativePath"`
			Content      string `json:"content"`
		}
		type Response struct {
			URI string `json:"uri"`
		}
		request := new(Request)
		c.BodyParser(request)

		b := []byte(request.Content)
		filename := saveFile(bucket, fmt.Sprintf("newsletters/%s", request.RelativePath), &b)
		c.JSON(Response{URI: filename})
	})

	app.Post("/upload", func(c *fiber.Ctx) {
		type Request struct {
			RelativePath  string `json:"relativePath"`
			Base64Content string `json:"base64Content"`
		}
		type Response struct {
			URI   string `json:"uri"`
			Error string `json:"error"`
		}
		request := new(Request)
		c.BodyParser(request)

		if request.Base64Content == "" {
			c.JSON(Response{Error: "Missing base64Content in the body JSON"})
			return
		}

		content, _ := base64.StdEncoding.DecodeString(request.Base64Content)
		filename := saveFile(bucket, request.RelativePath, &content)
		fmt.Println(fmt.Sprintf("File added: %s", filename))
		c.JSON(Response{URI: filename})
	})

	app.Static("/", "/data/", fiber.Static{
		Compress:  true,
		ByteRange: true,
		// Browse:    true,
	})

	app.Listen(*host)
}
