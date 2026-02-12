package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"

	"log"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"przetarg.io/api/src/datasources"
	"przetarg.io/api/src/models"
)

type EzamowieniaQuery struct {
	DateFrom string `query:"date_from" validate:"required,datetime=2006-01-02"`
	DateTo   string `query:"date_to" validate:"required,datetime=2006-01-02"`
}

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
	
	_ = datasources.NewPlatformaZakupowaHandler("./platformazakupowa")
	ezamowieniaHandler := datasources.NewEzamowieniaHandler()

	// Walidator
	validate := validator.New()

	//inicjalizacja api
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Get("/api/v1/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	app.Get("/api/v1/tenders/:id/html", func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid ID format")
		}

		htmlContent, err := models.GetTenderDescription(int64(id))
		if err != nil {
			if err == sql.ErrNoRows {
				return c.Status(fiber.StatusNotFound).SendString("Tender not found")
			}
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.SendString(htmlContent)
	})

	app.Get("/api/v1/ezamowienia", func(c *fiber.Ctx) error {
		query := new(EzamowieniaQuery)

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