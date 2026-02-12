package models

import "time"

//jakie pola powinien mieć dokument do przetargów?
type TenderAttachment struct {
	ID          int64     `json:"id"`
	TenderID    int64     `json:"tender_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Link        string    `json:"link"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

