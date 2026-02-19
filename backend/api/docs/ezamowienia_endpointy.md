### pobranie przetargów
```url
https://ezamowienia.gov.pl/mp-readmodels/api/Search/SearchTenders?SortingColumnName=InitiationDate&SortingDirection=DESC&PageNumber=1&PageSize=10
```

- max page size dla tego endpointu to 100

### dokumenty danego przetargu 
```url
https://ezamowienia.gov.pl/mp-readmodels/api/Search/GetTenderDocuments?tenderId=ocds-148610-598f6c05-68d8-44a3-9b19-a391459b3f51
```

Przykładowa odpowiedź API:
```json
[
    {
            "objectId": "ocds-148610-598f6c05-68d8-44a3-9b19-a391459b3f51_6",
            "name": "Rozstrzygniecie postepowania",
            "url": "https://ezamowienia.gov.pl/mp-client/search/tenderdocument/ocds-148610-598f6c05-68d8-44a3-9b19-a391459b3f51/ocds-148610-598f6c05-68d8-44a3-9b19-a391459b3f51_6",
            "tenderDocumentState": "DeletedAutomatically",
            "createDate": "2024-12-11T13:22:05.763Z",
            "fileName": "Rozstrzygniecie postepowania.pdf",
            "publishedDate": null,
            "deleteDate": null,
            "deleteReason": null
    }
]
```

### notice do danego przetargu:
```url
https://ezamowienia.gov.pl/mp-readmodels/api/Search/GetTenderLinkedNotices?tenderId=ocds-148610-598f6c05-68d8-44a3-9b19-a391459b3f51
```

ten endpoint zwraca pusty array JSON: []

### pobieranie załącznika
```url
https://ezamowienia.gov.pl/mp-readmodels/api/Tender/DownloadDocument/ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c/ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_9
```
- ten endpoint bezpośrednio zwraca plik do pobrania
- trzeba podać nie id przetargu a id dokumentu

### pobranie przetargu ze wszystkimi dokumentami:
```url
https://ezamowienia.gov.pl/mp-readmodels/api/Search/GetTender?id=ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c
``` 

Przykładowa odpowiedź API:
```json
{
    "canEdit": false,
    "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c",
    "tenderType": "1.1.1",
    "concessionType": null,
    "state": "Initiated",
    "initiationDate": "2026-02-19T14:20:31.209Z",
    "cancellationDate": null,
    "createdDate": "2026-02-19T11:17:45.228Z",
    "referenceNumber": "IZP.271.3.2026",
    "noticeNumber": null,
    "title": "Dostawa urządzeń i oprogramowania zwiększających \nodporność na cyberataki wraz z wdrożeniem w ramach realizacji projektu „Cyberbezpieczna Gmina Jeżowe”.",
    "submissionDate": null,
    "openDate": null,
    "notificationCount": 0,
    "userId": "28d47e2a-bf55-4df8-aaaa-1e346036bdfd",
    "organizationId": "9427",
    "organizationName": "Gmina Jeżowe",
    "organizationPartName": null,
    "organizationCity": "Jeżowe",
    "organizationProvince": "Podkarpackie",
    "tenderPlanOrganizationId": null,
    "tenderPlanItemsIds": [
        "08de68a7-35f5-7004-bbe7-1e0001c491a9_4"
    ],
    "isTenderAmountBelowEU": true,
    "positionRemoved": false,
    "terms": [
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_1",
            "termType": "SubmissionOffersDate",
            "term": "2026-02-27T09:00:00Z",
            "isValid": true
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_2",
            "termType": "OpenOffersDate",
            "term": "2026-02-27T09:30:00Z",
            "isValid": true
        }
    ],
    "tenderDocuments": [
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_1",
            "name": "SWZ Cyberbezpieczna Gmina Jeżowe",
            "url": null,
            "tenderDocumentState": "Archived",
            "createDate": "2026-02-19T14:11:15.882Z",
            "attachment": {
                "fileName": "SWZ Cyberbezpieczna Gmina Jeżowe - 19.02.2026-sig.pdf",
                "mimeType": "application/pdf",
                "uniqueAttachmentIdentifier": "0fa5c0c7e6194b0fb6ea7433918e1780",
                "hash": "6e40727953bf4555aee528629036bbe7e80c077c014ddeff6aef8dca21d3718a",
                "isDeleted": true,
                "fileSize": 1086200
            },
            "publishedDate": null,
            "deleteDate": "2026-02-19T14:11:59.883Z",
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_2",
            "name": "Załącznik nr 1 do SWZ - szczegółowy opis przedmiotu zamówienia",
            "url": null,
            "tenderDocumentState": "Archived",
            "createDate": "2026-02-19T14:11:28.778Z",
            "attachment": {
                "fileName": "Załącznik nr 1 do SWZ - szczegółowy opis przedmiotu zamówienia_Gm. Jeżowe V1.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "5b8efdad9c974c399648288681ecc76a",
                "hash": "165e1982d755e6a6fd85071be0bf269d284cbcec521cbd272edfca1c07b50f4c",
                "isDeleted": true,
                "fileSize": 128976
            },
            "publishedDate": null,
            "deleteDate": "2026-02-19T14:11:51.579Z",
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_3",
            "name": "Załącznik_nr 10 do SWZ _Klauzula_informacyjna_FERC",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:12:29.564Z",
            "attachment": {
                "fileName": "Załącznik_nr 10  do SWZ _Klauzula_informacyjna_FERC_t_j.pdf",
                "mimeType": "application/pdf",
                "uniqueAttachmentIdentifier": "b8864990b5614067a09264a0e73c51a8",
                "hash": "d3eda5c7237ca26eb746a3dcc6f97e8d0e980ab179995acd65ec37d7e8ed6ef5",
                "isDeleted": false,
                "fileSize": 176120
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_4",
            "name": "Załącznik nr 9 do SWZ - oświadczenie grupa kapitałowa",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:12:51.603Z",
            "attachment": {
                "fileName": "Załącznik nr 9  do SWZ - oświadczenie grupa kapitałowa.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "b92cfe67e0154ca1bb19f2a85db2880c",
                "hash": "08b21770a34f3abe58498be1b8369058150efa03449e26955d8bffcc6a17e636",
                "isDeleted": false,
                "fileSize": 199686
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_5",
            "name": "Załącznik nr 8 do SWZ - Projektowane postanowienia umowy",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:13:03.194Z",
            "attachment": {
                "fileName": "Załącznik nr 8 do SWZ - Projektowane postanowienia umowy.doc",
                "mimeType": "application/msword",
                "uniqueAttachmentIdentifier": "0abe9b3f2426470ab1b3dcdac26a484d",
                "hash": "5486824d0f4fc64f6b2dccda8ef57701c09eaf36b1dc42f6c3174b83e1a140ad",
                "isDeleted": false,
                "fileSize": 355840
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_6",
            "name": "Załącznik nr 7 do SWZ - wykaz dostaw i usług",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:13:16.547Z",
            "attachment": {
                "fileName": "Załącznik nr 7 do SWZ - wykaz dostaw i usług.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "8d48f0dee1aa4468b84d5374364760cf",
                "hash": "594db94c945d10cef2711c5c2a8a24c7bae54de2cff6fc4a032e958362cd583b",
                "isDeleted": false,
                "fileSize": 202559
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_7",
            "name": "Załącznik nr 6 do SWZ - oświadczenie z art. 117 ust 4 ustawy PZP",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:13:28.508Z",
            "attachment": {
                "fileName": "Załącznik nr 6 do SWZ - oświadczenie  z art. 117 ust 4 ustawy PZP.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "6d94ce8909714a5298d09feb60fdbd08",
                "hash": "9b703f305596e20bd932c96e03537cf5edee8c1a76c4ca6f4cab2127246d22ab",
                "isDeleted": false,
                "fileSize": 201351
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_8",
            "name": "Załącznik nr 5 do SWZ - oświadczenie podmiotu trzeciego",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:13:58.86Z",
            "attachment": {
                "fileName": "Załącznik nr 5 do SWZ - oświadczenie podmiotu trzeciego.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "cf6eb1ce181442edbf9311777530263b",
                "hash": "2ff11431bc8b6fc1c540ec302d16a2658a00c4007a3c0ca934cf50769e7ae3b8",
                "isDeleted": false,
                "fileSize": 205465
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_9",
            "name": "Załącznik nr 4 do SWZ - zobowiązanie podmiotu trzeciego",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:14:14.573Z",
            "attachment": {
                "fileName": "Załącznik nr 4 do SWZ - zobowiązanie podmiotu trzeciego.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "b8de33592afb4c028f396d5e767d6c33",
                "hash": "8c77071f15049984bf2152fd750755996f7bbbc25869163e8f0d80d6654bd954",
                "isDeleted": false,
                "fileSize": 201824
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_10",
            "name": "Załącznik nr 3 do SWZ - oświadczenie o niepodleganiu wykluczeniu",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:14:26.904Z",
            "attachment": {
                "fileName": "Załącznik nr 3 do SWZ - oświadczenie o niepodleganiu wykluczeniu.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "d40737e04050409180a9a1bbbf616774",
                "hash": "f80a64c4605005a63cfb05db383951434020f11ccdb7a2366560e25fb884d175",
                "isDeleted": false,
                "fileSize": 205643
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_11",
            "name": "Załącznik nr 2 do SWZ - wzór oferty",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:14:40.75Z",
            "attachment": {
                "fileName": "Załącznik nr 2 do SWZ - wzór oferty.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "2cfd1d3da2ff4a9baa018fafe52842c0",
                "hash": "bacb33c48eba9bbbed59d07b7400e30787146c8a746e1000f863ed75369f68f3",
                "isDeleted": false,
                "fileSize": 215387
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_12",
            "name": "Załącznik nr 1 do SWZ - szczegółowy opis przedmiotu zamówienia_Gm. Jeżowe",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:14:56.924Z",
            "attachment": {
                "fileName": "Załącznik nr 1 do SWZ - szczegółowy opis przedmiotu zamówienia_Gm. Jeżowe V1.docx",
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "uniqueAttachmentIdentifier": "1f9f4ba74b45466fa0c6c26ffd589e1e",
                "hash": "165e1982d755e6a6fd85071be0bf269d284cbcec521cbd272edfca1c07b50f4c",
                "isDeleted": false,
                "fileSize": 128976
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        },
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_13",
            "name": "SWZ Cyberbezpieczna Gmina Jeżowe",
            "url": null,
            "tenderDocumentState": "Published",
            "createDate": "2026-02-19T14:15:12.104Z",
            "attachment": {
                "fileName": "SWZ Cyberbezpieczna Gmina Jeżowe - 19.02.2026-sig.pdf",
                "mimeType": "application/pdf",
                "uniqueAttachmentIdentifier": "f226b522bd904f10a925191bfe7a7fa7",
                "hash": "6e40727953bf4555aee528629036bbe7e80c077c014ddeff6aef8dca21d3718a",
                "isDeleted": false,
                "fileSize": 1086200
            },
            "publishedDate": "2026-02-19T14:20:43.29Z",
            "deleteDate": null,
            "deleteReason": null
        }
    ],
    "stage": "CollectingOffers",
    "lots": [],
    "isPartial": false,
    "numberOfLots": 0,
    "currentStageReason": null,
    "bzpNumber": "2026/BZP 00120293/01",
    "competitionType": null,
    "competitionKind": null,
    "noticeConcerns": "Order",
    "amountToFinanced": null,
    "amountToFinancedCurrency": null,
    "amountToFinancedCurrencyText": null,
    "isAmountToFinancedPublished": false,
    "phases": [
        {
            "objectId": "ocds-148610-7b5793c5-6ca8-4bb3-afe7-4dcbcf47f66c_0",
            "phaseNumber": 1,
            "phaseType": "oferty",
            "createdDate": "2026-02-19T14:20:31.242Z",
            "createdBy": "28d47e2a-bf55-4df8-aaaa-1e346036bdfd",
            "openOffersDate": null,
            "submissionOffersDate": null,
            "totalOffers": null,
            "withdrawnOffers": null,
            "completed": null,
            "isOffersRead": false,
            "deanonymizationReason": null,
            "resultDate": null,
            "isOpened": false
        }
    ],
    "offers": [],
    "additionalInformation": null,
    "noticeBzpNumberOfTenderResult": null,
    "tedContractNoticeNumber": null,
    "contractAwardNoticeNumbers": [],
    "isPublic": true,
    "isProceedingOnPlatform": true,
    "organizationsWithAccess": [],
    "competitionAliases": [],
    "validCompetitionAliases": null,
    "hasAtLeastOneNoticePublished": false
}
```
## Endpoint notice

### `GET /notice`

```url
http://ezamowienia.gov.pl/mo-board/api/v1/notice
```

Zwraca listę ogłoszeń spełniających podane kryteria.

---

### 2.1 Parametry zapytania

| Parametr | Wymagany | Opis |
|-----------|----------|------|
| `NoticeType` | ✅ Tak | Rodzaj ogłoszenia |
| `PublicationDateFrom` | ✅ Tak | Data początkowa (format: `YYYY-MM-DDThh:mm:ss`) |
| `PublicationDateTo` | ✅ Tak | Data końcowa (format: `YYYY-MM-DDThh:mm:ss`) |
| `PageSize` | ✅ Tak | Liczba rekordów na stronę (zakres: 1–500) |
| `NoticeNumber` | ❌ Nie | Numer ogłoszenia (wyszukiwanie po frazie lub całości) |
| `ClientType` | ❌ Nie | Typ zamawiającego (wg słownika `SL.MO.013`) |
| `OrderType` | ❌ Nie | Rodzaj zamówienia / konkursu (`ENUM.002`, `SL.MO.042`) |
| `TenderType` | ❌ Nie | Tryb postępowania (`ENUM.017`, `ENUM.018`, `ENUM.019`) |
| `OrderObject` | ❌ Nie | Nazwa zamówienia / konkursu |
| `CpvCode` | ❌ Nie | Główny kod CPV |
| `OrganizationName` | ❌ Nie | Nazwa zamawiającego |
| `OrganizationCity` | ❌ Nie | Miejscowość |
| `OrganizationProvince` | ❌ Nie | Województwo (`SL.MT.007`) |
| `SearchAfter` | ❌ Nie | Do paginacji (wartość `objectId` z poprzedniego wyniku) |

---

### 2.2 Dozwolone wartości `NoticeType`

```
ContractNotice
AgreementIntentionNotice
TenderResultNotice
CompetitionNotice
CompetitionResultNotice
NoticeUpdateNotice
AgreementUpdateNotice
ContractPerformingNotice
CircumstancesFulfillmentNotice
SmallContractNotice
ConcessionNotice
ConcessionIntentionAgreementNotice
NoticeUpdateConcession
ConcessionAgreementNotice
ConcessionUpdateAgreementNotice
```

---

### 2.3 Przykład zapytania

```
GET /notice?NoticeType=ContractNotice
  &TenderType=1.1.1
  &PublicationDateFrom=2021-01-01T00:00:00
  &PublicationDateTo=2021-01-31T23:59:59
  &PageSize=100
```

---

### 2.4 Struktura odpowiedzi (200 OK)

Zwracana jest lista obiektów ogłoszeń.

### Główne pola:

| Pole | Opis |
|------|------|
| `objectId` | Identyfikator ogłoszenia |
| `clientType` | Rodzaj zamawiającego |
| `tenderType` | Tryb postępowania |
| `noticeType` | Rodzaj ogłoszenia |
| `noticeNumber` | Numer ogłoszenia |
| `bzpNumber` | Numer BZP |
| `isTenderAmountBelowEU` | Krajowe / unijne |
| `publicationDate` | Data publikacji |
| `orderObject` | Nazwa zamówienia |
| `cpvCode` | Kod CPV |
| `submittingOffersDate` | Termin składania ofert |
| `procedureResult` | Wynik postępowania |
| `organizationName` | Nazwa zamawiającego |
| `organizationCity` | Miasto |
| `organizationProvince` | Województwo |
| `organizationCountry` | Kraj |
| `organizationNationalId` | Numer identyfikacyjny |
| `organizationId` | Id organizacji |
| `tenderId` | Id postępowania |
| `htmlBody` | Treść ogłoszenia (HTML) |
| `contractors` | Lista wykonawców |

### Struktura wykonawcy (`contractors[]`)

| Pole | Opis |
|------|------|
| `contractorName` | Nazwa wykonawcy |
| `contractorCity` | Miasto |
| `contractorProvince` | Województwo |
| `contractorCountry` | Kraj |
| `contractorNationalId` | Numer identyfikacyjny |

---

### 2.5 Paginacja

- `PageSize` – określa liczbę wyników
- `SearchAfter` – przekazujemy `objectId` ostatniego elementu z poprzedniej strony

Pierwsze zapytanie:
```
SearchAfter=
```

Kolejne zapytanie:
```
SearchAfter=<objectId_z_poprzedniego_wyniku>
```

---