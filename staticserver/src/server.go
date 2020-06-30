package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/gofiber/fiber"
	"gocloud.dev/blob"
	"gocloud.dev/blob/fileblob"
)

var (
	addr = flag.String("addr", "0.0.0.0:8003", "TCP address to listen to")
	dir  = flag.String("dir", "/data/newsletters/", "Directory to store/serve newsletters from")
)

func main() {
	fmt.Println("Running newsletter server...")
	fmt.Println("Serving files from:", dir)

	if err := os.MkdirAll(*dir, 0777); err != nil {
		panic("Couldn't create newsletters upload directory")
	}
	bucket, err := fileblob.OpenBucket(*dir, nil)
	if err != nil {
		panic("Couldn't open file bucket")
	}
	defer bucket.Close()

	app := fiber.New()

	// Match any route
	app.Use(func(c *fiber.Ctx) {
		// fmt.Println("First middleware")
		c.Next()
	})

	app.Get("/newsletters/delete/*", func(c *fiber.Ctx) {
		files := bucket.List(&blob.ListOptions{Prefix: c.Params("*")})

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

		err := bucket.WriteAll(context.Background(), request.RelativePath, []byte(request.Content), nil)
		if err != nil {
			panic("Error writing to file")
		}
		c.JSON(Response{URI: request.RelativePath})
	})

	app.Static("/", *dir, fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    true,
	})

	app.Listen(*addr)
}
