package datasources

// Datasource to interfejs definiujący źródło danych
// W tym przypadku jest to marker interface, ponieważ uruchomienie logiki następuje w konstruktorze
type Datasource interface {
	// Pusty interfejs lub metody, które powinny być publicznie dostępne,
	// jeśli chcemy np. wymusić pobranie danych na żądanie.
	// Wymaganie użytkownika sugeruje tylko konstruktor, ale interfejs jest potrzebny do typowania.
}
