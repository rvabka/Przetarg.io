package datasources

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// EzamowieniaHandler acts as a relay for the Ezamowienia API.
type EzamowieniaHandler struct {
	BaseURL string
}

const EzamowieniaURL = "https://ezamowienia.gov.pl/mo-board/api/v1/notice"

// EzamowieniaTender represents the structure of the data returned by the API.
type EzamowieniaTender struct {
	ClientType             string      `json:"clientType"`
	OrderType              string      `json:"orderType"`
	TenderType             string      `json:"tenderType"`
	NoticeType             string      `json:"noticeType"`
	NoticeNumber           string      `json:"noticeNumber"`
	BzpNumber              string      `json:"bzpNumber"`
	IsTenderAmountBelowEU  bool        `json:"isTenderAmountBelowEU"`
	PublicationDate        time.Time   `json:"publicationDate"`
	OrderObject            string      `json:"orderObject"`
	CpvCode                string      `json:"cpvCode"`
	SubmittingOffersDate   time.Time   `json:"submittingOffersDate"`
	ProcedureResult        interface{} `json:"procedureResult"`
	OrganizationName       string      `json:"organizationName"`
	OrganizationCity       string      `json:"organizationCity"`
	OrganizationProvince   string      `json:"organizationProvince"`
	OrganizationCountry    string      `json:"organizationCountry"`
	OrganizationNationalId string      `json:"organizationNationalId"`
	OrganizationId         string      `json:"organizationId"`
	TenderId               string      `json:"tenderId"`
	HtmlBody               string      `json:"htmlBody"`
	Contractors            interface{} `json:"contractors"`
	ObjectId               string      `json:"objectId"`
}

// NewEzamowieniaHandler creates a new handler instance.
func NewEzamowieniaHandler() *EzamowieniaHandler {
	return &EzamowieniaHandler{
		BaseURL: EzamowieniaURL,
	}
}

func (h *EzamowieniaHandler) FetchTenders(dateFrom, dateTo string) ([]EzamowieniaTender, error) {
	url := fmt.Sprintf("%s?PageSize=20&NoticeType=ContractNotice&PublicationDateFrom=%s&PublicationDateTo=%s", h.BaseURL, dateFrom, dateTo)
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bad status: %s", resp.Status)
	}

	var tenders []EzamowieniaTender
	if err := json.NewDecoder(resp.Body).Decode(&tenders); err != nil {
		return nil, fmt.Errorf("failed to decode json: %w", err)
	}

	return tenders, nil
}
