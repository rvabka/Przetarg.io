package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"

	"log"

	"github.com/gofiber/fiber/v2"
	"przetarg.io/api/src/datasources"
	"przetarg.io/api/src/models"
)

func main() {
	//inicjalizacja bazny danych
	var err error
	models.DB, err = sql.Open("sqlite3", "./przetargi.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer models.DB.Close()

	if err := models.InitTables(); err != nil {
		log.Fatalf("Failed to initialize tables: %v", err)
	}

	//inicjalizacja handlerów

	//Konstruktor automatycznie uruchamia pobieranie w tle
	//_ = datasources.NewPlatformaZakupowaHandler("./platformazakupowa")
	
	ezamowieniaHandler := datasources.NewEzamowieniaHandler()

	//inicjalizacja api
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Get("/api/v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	app.Get("/api/v1/ezamowienia", func(c *fiber.Ctx) error {
		query := new(datasources.EzamowieniaQuery)

		if err := c.QueryParser(query); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse query",
			})
		}

		if err := validate.Struct(query); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(), // Returns detailed validation errors
			})
		}

		tenders, err := ezamowieniaHandler.FetchTenders(query.DateFrom, query.DateTo)
		if err != nil {
			return c.Status(500).SendString(err.Error())
		}
		return c.JSON(tenders)
	})

	log.Fatal(app.Listen(":3000"))
}