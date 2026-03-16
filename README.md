# Arkanoid

Nowoczesna, przeglądarkowa wariacja na temat klasycznego **Arkanoida**. Projekt jest napisany w czystym HTML, CSS i JavaScript, bez bundlera i bez frameworków. Gra działa jako pojedyncza strona, ma responsywny interfejs, system poziomów, bonusy, pauzę oraz tablicę wyników opartą o Google Sheets.

Zagraj online: [https://milejko.github.io/arkanoid/](https://milejko.github.io/arkanoid/) — publiczna wersja gry dostępna w przeglądarce.

## Co to za projekt

`Arkanoid` to lekka gra arcade uruchamiana bezpośrednio w przeglądarce. Gracz steruje paletką, odbija piłkę i czyści planszę z cegieł. Po zniszczeniu całej planszy przechodzi na kolejny poziom, a bazowa prędkość piłki rośnie.

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
- betonowe, kryształowe i czarne diamentowe cegły wymagające wielu trafień na wyższych poziomach,
- system bonusów pozytywnych i negatywnych,
- syntetyczne efekty dźwiękowe w kosmicznym stylu, w tym osobne SFX dla dobrych i złych bonusów,
- pauza uruchamiana klawiszem `P` oraz automatycznie po utracie fokusu karty,
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
- **Ceglane kafle** pojawiają się od poziomu `2`.
- **Betonowe kafle** pojawiają się od poziomu `4`.
- **Kryształowe kafle** pojawiają się od poziomu `6`.
- **Czarne diamenty** pojawiają się od poziomu `8`.
- Kanwa gry jest zawsze kwadratowa, a układ opiera się na siatce `8` kolumn i `26` rzędów.
- Wewnątrz kanwy pole gry jest minimalnie mniejsze (`4px` inset z każdej strony), dzięki czemu zewnętrzna obwódka planszy pozostaje czytelna.
- Kafle mają subtelny odstęp między sobą, a pięć rzędów cegieł zaczyna się od `3.` rzędu siatki, więc nad nimi zostają dwa puste rzędy.
- Startowa paletka ma szerokość `1` kafla i wysokość `1/2` kafla.
- Paletka startowo wisi w dolnym rzędzie aktywnego pola gry.
- Plansza ma też progresję **niezniszczalnych jasnoszarych ścian**: poziomy `1-4` są bez ścian, poziomy `5-15` mają różne, ale zawsze symetryczne układy, a od tego momentu wzory zapętlają się już na każdym kolejnym poziomie.
- Po utracie życia aktywne bonusy znikają.
- Po zakończeniu gry możesz zapisać wynik, ale tylko wtedy, gdy trafia do **pierwszej dziesiątki**.

## Sterowanie

### Klawiatura

- `←` / `A` — ruch paletki w lewo
- `→` / `D` — ruch paletki w prawo
- `Spacja` — akcja tylko w trakcie aktywnej rundy, np. strzał z działa albo wypuszczenie przyklejonej piłki
- `Esc` — pauza

### Mysz i touch

- ruch kursora lub palca steruje pozycją paletki,
- start gry, start planszy i wyjście z pauzy działają tylko z przycisków interfejsu,
- klik / tap na planszy nie uruchamia już startu nowej rundy,
- na ekranach mobilnych overlay tablicy wyników przewija się dotykiem.

## Bonusy

Standardowe bonusy są ukryte losowo w zwykłych kaflach i wypadają dopiero po ich zniszczeniu. W grze występują zarówno bonusy pozytywne, jak i negatywne. Na każdym poziomie dostępny jest pełny zestaw standardowych bonusów, ale bez **+1 życia** i **super piłki**. Każdy standardowy bonus pojawia się na planszy dokładnie raz i ma przypisany dokładnie jeden zwykły kafel.

Na wyższych poziomach część zwykłych cegieł zastępowana jest przez cztery klasy trwałych bloków. Od poziomu `2` pojawia się zawsze dokładnie jeden **ceglany** kafel z bonusem `+1 życie`. Od poziomu `4` dochodzi zawsze dokładnie jeden **betonowy** kafel z bonusem `fireball`. Od poziomu `6` dochodzi zawsze dokładnie jeden **kryształowy** kafel z bonusem **super-armaty**. Od poziomu `8` dochodzi zawsze dokładnie jeden **czarny diament** z `5` punktami wytrzymałości i bonusem **potrójnej armaty**. Potrójna armata trwa `15` sekund i strzela trzema pociskami: środkowy jest super-armatą, a dwa boczne to zwykłe strzały z lewej i prawej części rakietki. Super-armata trwa `15` sekund, a jej czerwone strzały rozwalają ściany oraz każdy niszczalny kafel jednym trafieniem. Ściany layoutu startują od poziomu `5`, poziomy `5-15` mają własne symetryczne wzory, a potem ten zestaw zapętla się już bez przerw na kolejnych levelach. Aktywna **super piłka / fireball** potrafi zniszczyć również te jasnoszare ściany.

### Pozytywne

- **Wydłużenie paletki** — zwiększa szerokość paletki o jeden krok na 11-stopniowej skali (`100% → 125% → 150% → 175% → 200% → 250%`).
- **Klej** — piłka przykleja się do paletki po kontakcie; efekt trwa 15 sekund, a przyklejona piłka i tak odpali się automatycznie po 3 sekundach.
- **Działo** — paletka może strzelać pociskami i zachowuje tę możliwość także po wejściu na kolejny poziom.
- **+1 życie** — zwiększa liczbę żyć, maksymalnie do 3.
- **Fireball** — przez 5 sekund piłka przebija cegły i niszczy nawet jasnoszare ściany layoutu.
- **Super-armata** — przez `15` sekund daje czerwone strzały, które niszczą ściany oraz każdy niszczalny kafel jednym trafieniem.
- **Potrójna armata** — przez `15` sekund daje trzy lufy: czerwony super-strzał w środku oraz dwa zwykłe strzały po bokach rakietki.
- **Spowolnienie piłki** — tymczasowo zmniejsza prędkość aż o połowę i daje mocniejsze smużenie.

### Negatywne

- **Skrócenie paletki** — zmniejsza szerokość paletki o jeden krok na tej samej skali (`100% → 90% → 70% → 50% → 30% → 20%`).
- **Przyspieszenie piłki** — tymczasowo zwiększa prędkość o 25% i nadaje smudze czerwony kolor.

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

Projekt rozwijany iteracyjnie jako przeglądarkowa gra typu arcade z naciskiem na prostą, szybką rozgrywkę.
