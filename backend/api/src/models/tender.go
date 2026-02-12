package models

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"
)

var DB *sql.DB

// Tender represents a unified structure for tenders from different sources.
type Tender struct {
	ID                  int64     `json:"id"`
	Source              string    `json:"source"`               // e.g. "platformazakupowa", "ezamowienia"
	SourceID            string    `json:"source_id"`            // Unique ID in the source system
	Title               string    `json:"title"`                // Name of the tender
	Description         string    `json:"description"`          // HTML or text description
	OrganizationName    string    `json:"organization_name"`    // Issuer company
	OrganizationContact string    `json:"organization_contact"` // Contact person name
	OrganizationEmail   string    `json:"organization_email"`   // Contact email
	OrganizationPhone   string    `json:"organization_phone"`   // Contact phone
	CPVCode             string    `json:"cpv_code"`             // Common Procurement Vocabulary code
	PublicationDate     time.Time `json:"publication_date"`     // When it was published
	SubmissionDeadline  time.Time `json:"submission_deadline"`  // Deadline for submissions
	Link                string    `json:"link"`                 // Direct link to the tender
	AdditionalInfo      string    `json:"additional_info"`      // JSON or text with extra fields
	ContentHash         string    `json:"content_hash"`         // SHA256 hash of the content
}

// InitTables creates the tables if they don't exist.
func InitTables() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS tenders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		source TEXT NOT NULL,
		source_id TEXT NOT NULL,
		title TEXT,
		description TEXT,
		organization_name TEXT,
		organization_contact TEXT,
		organization_email TEXT,
		organization_phone TEXT,
		cpv_code TEXT,
		publication_date DATETIME,
		submission_deadline DATETIME,
		link TEXT,
		additional_info TEXT,
		content_hash TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(source, source_id)
	);`

	_, err := DB.Exec(createTableSQL)
	return err
}

// CalculateHash computes a SHA256 hash of the tender's content fields.
func (t *Tender) CalculateHash() string {
	data := fmt.Sprintf("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s",
		t.Title, t.Description, t.OrganizationName, t.OrganizationContact,
		t.OrganizationEmail, t.OrganizationPhone, t.CPVCode,
		t.PublicationDate.Format(time.RFC3339), t.SubmissionDeadline.Format(time.RFC3339),
		t.Link, t.AdditionalInfo,
	)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// SaveTender inserts or updates a tender in the database.
// Returns true if the tender was inserted or updated, false if skipped due to matching content hash.
func SaveTender(t Tender) (bool, error) {
	// Ensure hash is calculated
	if t.ContentHash == "" {
		t.ContentHash = t.CalculateHash()
	}

	query := `
	INSERT INTO tenders (
		source, source_id, title, description,
		organization_name, organization_contact, organization_email, organization_phone,
		cpv_code, publication_date, submission_deadline, link, additional_info, content_hash
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	ON CONFLICT(source, source_id) DO UPDATE SET
		title=excluded.title,
		description=excluded.description,
		organization_name=excluded.organization_name,
		organization_contact=excluded.organization_contact,
		organization_email=excluded.organization_email,
		organization_phone=excluded.organization_phone,
		cpv_code=excluded.cpv_code,
		publication_date=excluded.publication_date,
		submission_deadline=excluded.submission_deadline,
		link=excluded.link,
		additional_info=excluded.additional_info,
		content_hash=excluded.content_hash,
		updated_at=CURRENT_TIMESTAMP
	WHERE tenders.content_hash != excluded.content_hash;
	`
	result, err := DB.Exec(query,
		t.Source, t.SourceID, t.Title, t.Description,
		t.OrganizationName, t.OrganizationContact, t.OrganizationEmail, t.OrganizationPhone,
		t.CPVCode, t.PublicationDate, t.SubmissionDeadline, t.Link, t.AdditionalInfo, t.ContentHash,
	)
	if err != nil {
		return false, err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rows > 0, nil
}

// GetTenderDescription retrieves the description (HTML) of a tender by its ID.
func GetTenderDescription(id int64) (string, error) {
	var description string
	query := "SELECT description FROM tenders WHERE id = ?"
	err := DB.QueryRow(query, id).Scan(&description)
	if err != nil {
		return "", err
	}
	return description, nil
}
