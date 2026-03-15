# Sanoma Arkanoid

Nowoczesna, przeglądarkowa wariacja na temat klasycznego **Arkanoida**. Projekt jest napisany w czystym HTML, CSS i JavaScript, bez bundlera i bez frameworków. Gra działa jako pojedyncza strona, ma responsywny interfejs, system poziomów, bonusy, pauzę oraz tablicę wyników opartą o Google Sheets.

## Co to za projekt

`Sanoma Arkanoid` to lekka gra arcade uruchamiana bezpośrednio w przeglądarce. Gracz steruje paletką, odbija piłkę i czyści planszę z cegieł. Po zniszczeniu całej planszy przechodzi na kolejny poziom, a bazowa prędkość piłki rośnie.

Projekt powstał jako statyczna aplikacja front-endowa:

- `index.html` zawiera strukturę strony, HUD, overlaye i kanwę gry,
- `styles.css` odpowiada za wygląd, responsywność i warstwę wizualną,
- `script.js` zawiera całą logikę gry,
- `google-apps-script/Code.gs` obsługuje backend tablicy wyników.

## Najważniejsze funkcje

- klasyczna rozgrywka typu brick breaker / arkanoid,
- stały układ planszy oparty o kwadratową kanwę z siatką `8 x 26`,
- przechodzenie między poziomami,
- wzrost bazowej prędkości piłki o 5% na każdy kolejny poziom,
- betonowe i diamentowe cegły wymagające wielu trafień na wyższych poziomach,
- system bonusów pozytywnych i negatywnych,
- syntetyczne efekty dźwiękowe w kosmicznym stylu, w tym osobne SFX dla dobrych i złych bonusów,
- pauza uruchamiana klawiszem `P` lub kliknięciem logo,
- tablica wyników z limitem **top 10**,
- lokalna kopia hi-score w `localStorage`,
- synchronizacja wyników z Google Sheets przez Google Apps Script,
- responsywny interfejs dla desktopu i urządzeń mobilnych,
- wersjonowanie widoczne w prawym dolnym rogu.

## Zasady gry

Cel jest prosty: odbijaj piłkę, niszcz cegły i nie pozwól jej spaść pod paletkę.

- Startujesz z **3 życiami**.
- Po zbiciu wszystkich cegieł przechodzisz na następny poziom.
- Każdy kolejny poziom zwiększa bazową prędkość piłki o 5%.
- Bazowa prędkość piłki jest teraz wyraźnie niższa niż wcześniej, a na mniejszych ekranach dodatkowo jeszcze spada.
- **Ceglane kafle** pojawiają się od poziomu `2` w liczbie `2` i podwajają się co `2` poziomy.
- **Betonowe kafle** pojawiają się od poziomu `3` w liczbie `2` i podwajają się co `3` poziomy.
- **Kryształowe kafle** pojawiają się od poziomu `4` w liczbie `1` i podwajają się co `4` poziomy.
- Kanwa gry jest zawsze kwadratowa, a układ opiera się na siatce `8` kolumn i `26` rzędów.
- Kafle wypełniają szerokość kanwy bez marginesów, a pięć rzędów cegieł zaczyna się od `2.` rzędu siatki.
- Startowa paletka ma szerokość `1` kafla i wysokość `1/2` kafla.
- Plansza ma też progresję **niezniszczalnych jasnoszarych ścian**; startują od poziomu 3 i są dokładane pojedynczo co 3 levele w dolnym rzędzie layoutu.
- Po utracie życia aktywne bonusy znikają.
- Po zakończeniu gry możesz zapisać wynik, ale tylko wtedy, gdy trafia do **pierwszej dziesiątki**.

## Sterowanie

### Klawiatura

- `←` / `A` — ruch paletki w lewo
- `→` / `D` — ruch paletki w prawo
- `Spacja` — start piłki / akcja / strzał
- `P` — pauza

### Mysz i touch

- ruch kursora lub palca steruje pozycją paletki,
- kliknięcie / tap uruchamia akcję,
- kliknięcie logo działa jako pauza,
- na ekranach mobilnych overlay tablicy wyników przewija się dotykiem.

## Bonusy

Standardowe bonusy są ukryte losowo w zwykłych kaflach i wypadają dopiero po ich zniszczeniu. W grze występują zarówno bonusy pozytywne, jak i negatywne. Na każdym poziomie dostępny jest pełny zestaw standardowych bonusów, ale bez **+1 życia** i **super piłki**.

Na wyższych poziomach część zwykłych cegieł zastępowana jest przez trzy klasy trwałych bloków. **Ceglane** wymagają `2` trafień i ukrywają sprawiedliwie rozdzielone super-bonusy `+1 życie` oraz `utrata życia`. **Betonowe** wymagają `3` trafień i rozdzielają po równo `fireball` oraz negatywną `piłkę ping-pong`, która podwaja liczbę trafień potrzebnych do zbicia aktywnych kafli. **Kryształowe** wymagają `4` trafień i każdy z nich daje zawsze pozytywny bonus `+1 życie + fireball`. Ściany layoutu startują od poziomu `3` i dokładane są co `3` levele w kolejności: `(7,1)`, `(7,8)`, `(7,2)`, `(7,7)`, `(7,3)`, `(7,6)`, `(7,4)`, `(7,5)`. Po dojściu do pełnego rzędu nic więcej już nie dochodzi. Aktywna **super piłka / fireball** potrafi zniszczyć również te jasnoszare ściany.

### Pozytywne

- **Wydłużenie paletki** — zwiększa szerokość paletki o jeden krok na 11-stopniowej skali (`100% → 125% → 150% → 175% → 200% → 250%`).
- **Klej** — piłka przykleja się do paletki po kontakcie; efekt trwa 15 sekund, a przyklejona piłka i tak odpali się automatycznie po 3 sekundach.
- **Działo** — paletka może strzelać pociskami i zachowuje tę możliwość także po wejściu na kolejny poziom.
- **+1 życie** — zwiększa liczbę żyć, maksymalnie do 3.
- **Fireball** — przez 5 sekund piłka przebija cegły i niszczy nawet jasnoszare ściany layoutu.
- **Serce + ogień** — dodaje `+1 życie` i uruchamia fireball jednocześnie.
- **Spowolnienie piłki** — tymczasowo zmniejsza prędkość aż o połowę i daje mocniejsze smużenie.

### Negatywne

- **Skrócenie paletki** — zmniejsza szerokość paletki o jeden krok na tej samej skali (`100% → 90% → 70% → 50% → 30% → 20%`).
- **Przyspieszenie piłki** — tymczasowo zwiększa prędkość o 25% i nadaje smudze czerwony kolor.
- **Utrata życia** — zabiera dokładnie jedno życie, tak jak upuszczenie piłki.
- **Piłka ping-pong** — podwaja liczbę trafień potrzebnych do zbicia aktualnie żywych, niszczalnych kafli.

## Tablica wyników

Gra korzysta z dwóch warstw przechowywania wyników:

1. **Lokalna kopia** w `localStorage` — szybki odczyt i fallback, gdy sieć jest wolna albo backend chwilowo nie odpowiada.
2. **Google Sheets + Google Apps Script** — źródło online dla wspólnej tablicy wyników.

Najważniejsze zasady:

- wyświetlane jest maksymalnie **10 wyników**,
- zapisać można tylko wynik, który kwalifikuje się do top 10,
- nazwa gracza jest normalizowana: przycinana, zamieniana na wielkie litery i ograniczona do 10 znaków.

## Jak uruchomić projekt lokalnie

To statyczna aplikacja webowa, więc najprostsza opcja to otworzyć `index.html` w przeglądarce.

Możesz też uruchomić prosty serwer HTTP, jeśli wolisz testować projekt w bardziej zbliżonych warunkach:

```bash
python3 -m http.server
```

Następnie otwórz stronę pod lokalnym adresem serwera, np. `http://localhost:8000`.

## Struktura repozytorium

```text
.
├── google-apps-script/
│   └── Code.gs
├── history.md
├── index.html
├── README.md
├── script.js
└── styles.css
```

## Leaderboard online

Backend wyników znajduje się w:

- `google-apps-script/Code.gs`

Frontend komunikuje się z nim przez:

- `LEADERBOARD_API_URL` w `script.js`

Obecna implementacja:

- odczytuje top 10 przez `GET`,
- zapisuje wynik przez `POST`,
- przechowuje dane w arkuszu Google Sheets,
- zwraca wyniki posortowane po punktach, poziomie i nazwie.

Jeśli chcesz przenieść leaderboard na inne konto lub inny arkusz, trzeba zaktualizować:

- identyfikator arkusza w `google-apps-script/Code.gs`,
- URL wdrożonego web appa w `script.js`.

## Rozwój projektu

W repozytorium nie ma bundlera, test runnera ani lintera. To świadomie prosty projekt front-endowy, więc większość zmian najlepiej sprawdzać manualnie w przeglądarce.

Przy zmianach warto przetestować:

- sterowanie klawiaturą,
- sterowanie myszą i dotykiem,
- pause / start / continue overlaye,
- zachowanie bonusów,
- zapis i odczyt hi-score,
- wygląd na desktopie i mobile.

## Historia decyzji

Plik `history.md` zawiera kolejne polecenia i decyzje produktowe rozwijające grę. To główne źródło kontekstu dla dalszych zmian mechaniki, wyglądu i UX.

## Autorstwo

Projekt rozwijany iteracyjnie jako przeglądarkowa gra typu arcade z brandingiem **Sanoma** i naciskiem na prostą, szybką rozgrywkę.
