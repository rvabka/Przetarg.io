package datasources

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"

	"przetarg.io/api/src/models"
)

// PlatformaZakupowaHandler zajmuje się logiką powiązaną z platformą zakupową
type PlatformaZakupowaHandler struct {
	BaseURL     string
	DownloadDir string
}

const PlatformaZakupowaURL = "https://platformazakupowa.pl/transakcje-ON-eksport.csv"

// NewPlatformaZakupowaHandler tworzy nową instancję handlera i od razu uruchamia pobieranie
func NewPlatformaZakupowaHandler(downloadDir string) *PlatformaZakupowaHandler {
	handler := &PlatformaZakupowaHandler{
		BaseURL:     PlatformaZakupowaURL,
		DownloadDir: downloadDir,
	}

	// Uruchomienie workera w tle w konstruktorze
	go handler.Start()

	return handler
}

// Start to główna pętla handlera - uruchamiana w goroutine
func (h *PlatformaZakupowaHandler) Start() {
	// Ustalona minuta, w której ma się odbywać pobieranie (np. 15 po pełnej godzinie)
	const targetMinute = 15
	log.Printf("Starting periodic processing for %s (saving to %s). Schedule: XX:%02d", h.BaseURL, h.DownloadDir, targetMinute)

	// Wykonaj pobranie od razu przy uruchomieniu
	log.Println("Starting initial download...")
	if filename, err := h.downloadFile(); err != nil {
		log.Printf("Error during initial download: %v", err)
	} else {
		log.Printf("Details: Initial file %s downloaded successfully.", filename)
		if err := h.processFile(filename); err != nil {
			log.Printf("Error processing file %s: %v", filename, err)
		} else {
			log.Printf("Successfully processed file %s", filename)
		}
	}

	for {
		now := time.Now()
		// Ustal czas następnego uruchomienia na bieżącą godzinę i zadaną minutę
		nextRun := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), targetMinute, 0, 0, now.Location())

		// Jeśli ten czas już minął, zaplanuj na następną godzinę
		if nextRun.Before(now) {
			nextRun = nextRun.Add(1 * time.Hour)
		}

		duration := time.Until(nextRun)
		log.Printf("Next download scheduled for: %s (in %v)", nextRun.Format("15:04:05"), duration)

		// Czekaj do wyznaczonego czasu
		time.Sleep(duration)

		log.Println("Starting scheduled download...")
		if filename, err := h.downloadFile(); err != nil {
			log.Printf("Error downloading file: %v", err)
		} else {
			log.Printf("Details: File %s downloaded successfully.", filename)
			if err := h.processFile(filename); err != nil {
				log.Printf("Error processing file %s: %v", filename, err)
			} else {
				log.Printf("Successfully processed file %s", filename)
			}
		}
	}
}

func (h *PlatformaZakupowaHandler) downloadFile() (string, error) {
	resp, err := http.Get(h.BaseURL)

	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	// Generowanie nazwy pliku: platformazakupowa-dd-mm-yyyy-hh:mm
	t := time.Now()
	// Windows filename cannot contain colon
	filename := fmt.Sprintf("platformazakupowa-%02d-%02d-%d-%02d_%02d.csv", t.Day(), t.Month(), t.Year(), t.Hour(), t.Minute())

	fmt.Println(filename)

	if err := os.MkdirAll(h.DownloadDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create directory %s: %w", h.DownloadDir, err)
	}

	fullPath := filepath.Join(h.DownloadDir, filename)
	out, err := os.Create(fullPath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}
	return fullPath, nil
}

func (h *PlatformaZakupowaHandler) processFile(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Assuming the CSV has a header
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) < 2 {
		return nil // Empty or just header
	}

	// data_rozpoczecia,data_zakonczenia,firma_wystawiajaca,nazwisko_i_imie_wystawiajacego,email,telefon,nazwa,link,termin_platnosci,najwczesniejszy_termin_dostawy,napozniejszy_termin_dostawy,opcja_transportu,adres_dostawy,wymagania_dodatkowe,opis_dodatkowy_ON,przedmiot_zapytania,id_zapytania,opis_i_specyfikacja

	for i, record := range records {
		if i == 0 {
			continue // Skip header
		}

		if len(record) < 18 {
			log.Printf("Skipping row %d due to insufficient columns", i)
			continue
		}

		// Parse dates: "2026-01-13 15:26:00"
		layout := "2006-01-02 15:04:05"
		pubDate, _ := time.Parse(layout, record[0])
		deadLine, _ := time.Parse(layout, record[1])

		tender := models.Tender{
			Source:              "platformazakupowa",
			SourceID:            record[16], // id_zapytania
			Title:               record[6],  // nazwa
			Description:         record[17], // opis_i_specyfikacja
			OrganizationName:    record[2],  // firma_wystawiajaca
			OrganizationContact: record[3],  // nazwisko_i_imie_wystawiajacego
			OrganizationEmail:   record[4],  // email
			OrganizationPhone:   record[5],  // telefon
			CPVCode:             "",         // Not available in CSV
			PublicationDate:     pubDate,
			SubmissionDeadline:  deadLine,
			Link:                record[7],  // link
			AdditionalInfo:      record[15], // przedmiot_zapytania or others
		}

		saved, err := models.SaveTender(tender)
		if err != nil {
			log.Printf("Failed to save tender %s: %v", tender.SourceID, err)
		} else if saved {
			log.Printf("Processed tender %s: saved/updated (Hash: %s)", tender.SourceID, tender.ContentHash)
		} else {
			log.Printf("Skipped tender %s: no changes detected (Hash match)", tender.SourceID)
		}

		h.downloadDocuments(tender.SourceID)
	}
	return nil
}

func (h *PlatformaZakupowaHandler) downloadDocuments(tenderID string) error {
	url := "https://platformazakupowa.pl/transakcja/" + tenderID
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch tender page: %w", err)
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to parse HTML: %w", err)
	}

	// Create directory for this tender
	tenderDir := filepath.Join(h.DownloadDir, tenderID)
	if err := os.MkdirAll(tenderDir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", tenderDir, err)
	}

	doc.Find("a.proceeding-file-download").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}

		// Fix protocol-relative URLs
		if strings.HasPrefix(href, "//") {
			href = "https:" + href
		}

		// Download the file
		filename := filepath.Base(href)
		// Remove query parameters if any
		if idx := strings.Index(filename, "?"); idx != -1 {
			filename = filename[:idx]
		}

		log.Printf("Downloading document: %s", href)
		if err := h.downloadFileFromURL(href, filepath.Join(tenderDir, filename)); err != nil {
			log.Printf("Failed to download %s: %v", href, err)
		}
	})

	return nil
}

func (h *PlatformaZakupowaHandler) downloadFileFromURL(url, destPath string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	out, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}
