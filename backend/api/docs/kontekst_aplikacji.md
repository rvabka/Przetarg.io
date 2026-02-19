# Agent – Kontekst Aplikacji

## 1. Cel systemu

Aplikacja służy do inteligentnego wyszukiwania, analizy i dopasowywania przetargów do przedsiębiorstw. Jej głównym celem jest zwiększenie skuteczności firm w pozyskiwaniu kontraktów poprzez wykorzystanie modeli AI do rozumienia kontekstu zarówno po stronie przetargów, jak i działalności użytkowników.

System nie jest jedynie wyszukiwarką ogłoszeń. Jest narzędziem decyzyjnym, które:

* analizuje treść przetargów semantycznie,
* rozumie profil działalności firmy,
* ocenia poziom dopasowania,
* wspiera użytkownika w podjęciu decyzji o starcie w postępowaniu.

---

## 2. Problem rynkowy

Przedsiębiorcy mierzą się z następującymi trudnościami:

* duża liczba ogłoszeń o niskiej trafności,
* konieczność ręcznego czytania długich dokumentów (SIWZ, OPZ, załączniki),
* trudność w ocenie realnych szans wygranej,
* brak narzędzi analizujących historię skuteczności,
* brak personalizacji wyników.

Obecne rozwiązania działają głównie na filtrach słów kluczowych i kodach CPV, co nie pozwala na zrozumienie kontekstu biznesowego.

---

## 3. Założenie strategiczne

System wykorzystuje AI do budowy reprezentacji semantycznej:

* przetargów,
* firm,
* historii aktywności użytkowników.

Dzięki temu możliwe jest dopasowanie oparte na znaczeniu treści, a nie wyłącznie na słowach kluczowych.

Aplikacja ma działać jak "agent przetargowy" reprezentujący interes firmy.

---

## 4. Kontekst przetargu

Każdy przetarg jest analizowany wielowymiarowo:

### 4.1. Warstwa strukturalna

* tytuł
* opis
* CPV
* budżet
* lokalizacja
* terminy
* wymagania formalne

### 4.2. Warstwa semantyczna

* rzeczywisty zakres prac
* typ projektu (utrzymanie, wdrożenie, dostawa, usługa)
* poziom złożoności
* wymagane kompetencje
* potencjalne ryzyka
* skala organizacyjna zamawiającego

### 4.3. Warstwa predykcyjna (docelowo)

* przewidywana liczba konkurentów
* poziom trudności formalnej
* estymacja szans wygranej dla danego typu firmy

---

## 5. Kontekst przedsiębiorstwa

Profil firmy składa się z kilku warstw:

### 5.1. Dane deklaratywne

* opis działalności
* branża / PKD
* region działania
* wielkość firmy
* referencje
* certyfikaty

### 5.2. Dane historyczne

* przetargi, w których startowała
* przetargi wygrane
* budżety projektów
* segmenty klientów

### 5.3. Dane behawioralne

* kliknięcia
* zapisane ogłoszenia
* ignorowane przetargi
* czas spędzony na analizie

Na tej podstawie tworzony jest dynamiczny profil semantyczny firmy.

---

## 6. Mechanizm dopasowania

Dopasowanie przetargu do firmy odbywa się w trzech etapach:

1. Filtrowanie twarde (lokalizacja, budżet, branża, wymogi formalne).
2. Dopasowanie semantyczne (analiza kontekstu działalności i zakresu przetargu).
3. Ranking oparty o scoring uwzględniający historię skuteczności i preferencje firmy.

System generuje wynik dopasowania oraz uzasadnienie rekomendacji.

---

## 7. Rola Agenta AI

Agent AI:

* analizuje nowe przetargi w tle,
* tworzy podsumowania w języku biznesowym,
* wskazuje kluczowe wymagania,
* identyfikuje potencjalne ryzyka,
* sugeruje, czy warto startować,
* może generować checklistę przygotowania oferty.

W przyszłości agent może wspierać generowanie elementów oferty.

---

## 8. Model rozwoju produktu

### Etap 1 – MVP

* agregacja przetargów
* podstawowa klasyfikacja
* dopasowanie semantyczne
* ranking

### Etap 2 – Personalizacja

* aktualizacja profilu na podstawie zachowania
* analiza skuteczności
* segmentacja firm

### Etap 3 – Predykcja

* model szans wygranej
* analiza konkurencji
* scoring ryzyka

### Etap 4 – Inteligentny Agent

* aktywne rekomendacje
* automatyczne raporty
* wsparcie w przygotowaniu ofert

---

## 9. Przewaga konkurencyjna

Przewaga systemu budowana jest na:

* rozumieniu kontekstu zamiast słów kluczowych,
* danych historycznych i pętli uczenia,
* analizie semantycznej dokumentów przetargowych,
* personalizacji wyników dla każdej firmy,
* modelach predykcyjnych.

---

## 10. Wizja

Celem długoterminowym jest stworzenie systemu, który:

* automatycznie filtruje rynek zamówień publicznych,
* maksymalizuje skuteczność firm,
* redukuje koszt analizy przetargów,
* staje się cyfrowym doradcą strategicznym w obszarze zamówień publicznych.
