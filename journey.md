# Journey projektu Arkanoid

Ten dokument jest skrótem `history.md`: zamiast pełnej listy poleceń zbiera najważniejsze etapy rozwoju gry, typowe trudności i najcenniejsze wnioski z całego procesu.

## Esencja projektu w punktach

- Projekt zaczął się od bardzo prostego eksperymentu z odbijającą się piłką, a dopiero potem skręcił w pełnoprawnego `Arkanoida`.
- Największa część pracy nie polegała na „dodaniu jednej dużej funkcji”, tylko na setkach małych korekt gameplayu, UI i balansu.
- Gra rozwijała się iteracyjnie: mechanika, wygląd i UX były regularnie testowane, korygowane i często zawracane, jeśli coś tylko „teoretycznie” było lepsze, ale praktycznie psuło flow.
- Z prostego front-endu HTML/CSS/JS powstała dojrzała, stanowa gra z poziomami, bonusami, trwałymi kaflami, layoutami ścian, leaderboardem online, lokalizacją i trwałością stanu.
- Historia pokazuje bardzo wyraźnie, że w tego typu grze detale są równie ważne jak „duże ficzery”: szybkość paletki, odstępy między kaflami, pozycja HUD-u, fallback audio czy sposób kończenia levelu potrafią zmienić odbiór całości.

## Główne etapy rozwoju

### 1. Od prototypu do gry arcade

Na początku powstał prosty ekran z piłką i pierwsze cegły. Bardzo szybko projekt przeszedł w klasyczną grę typu brick breaker, a nacisk poszedł na charakter wizualny: neonowe logo, trójwymiarowe kafle, HUD i bardziej „growy” klimat.

To był moment, w którym projekt z demonstracji technicznej stał się produktem z własną tożsamością.

### 2. Bonusy jako serce rozgrywki

Kolejny duży etap to budowa systemu bonusów: wydłużanie i skracanie paletki, klej, armata, zmiany prędkości piłki, dodatkowe życie, a potem także bardziej zaawansowane „super-bonusy”.

Najważniejsze było tu nie samo dodanie efektów, tylko ich współdziałanie:

- bonusy miały się sumować,
- pozytywne i negatywne miały się wzajemnie równoważyć,
- utrata życia miała czyścić stany,
- wygląd paletki i spadających bonusów musiał od razu komunikować aktywny efekt.

W praktyce właśnie tutaj zaczęła się prawdziwa złożoność gry.

### 3. Plansza, proporcje i mobilność

Bardzo dużo iteracji dotyczyło geometrii planszy:

- liczby kafli,
- proporcji siatki,
- szerokości i wysokości kanwy,
- miejsca dla HUD-u i logo,
- zachowania na iPhonie i Safari,
- rozmieszczenia paletki względem dolnej części planszy.

To doprowadziło do obecnego modelu: kwadratowa kanwa, siatka `8 x 26`, rzeczywiste pole gry lekko wcięte do środka, pięć rzędów cegieł zawieszonych niżej i spójna geometria dla desktopu i mobile.

### 4. Progresja poziomów i specjalne kafle

Z czasem gra dostała pełną strukturę poziomów:

- wzrost bazowej prędkości,
- trwałe kafle o różnych materiałach,
- układy ścian zależne od levelu,
- coraz bardziej złożone bonusy przypisane do specjalnych bloków.

Najpierw pojawił się beton, potem kryształ, potem czarny diament. Każdy z nich nie był tylko „trudniejszą cegłą”, ale też nośnikiem innej nagrody i innego stylu gry.

To był moment przejścia od „rozbijania cegieł” do faktycznej progresji systemowej.

### 5. UX, overlaye i stany gry

Bardzo dużo pracy poszło w przepływ stanów:

- start gry,
- start nowego poziomu,
- kontynuację po stracie życia,
- pauzę,
- game over,
- leaderboard.

W praktyce oznaczało to ciągłe porządkowanie tego, kiedy gra jest aktywna, kiedy zatrzymana, kto może wznowić rundę i który overlay ma pierwszeństwo.

Najważniejszy wniosek z tego etapu: w grach przeglądarkowych nie wystarczy „mieć stan” — trzeba jeszcze bardzo jasno zdefiniować, kto nim zarządza i kiedy wolno przejść do kolejnego.

### 6. Audio i prawdziwe problemy platformowe

Jednym z najtrudniejszych obszarów okazało się audio, szczególnie na iPhonie i Safari. Historia pokazuje kilka prób:

- wzmacnianie odblokowania Web Audio,
- fallbacki,
- eksperymenty z HTMLAudio,
- rollbacki,
- ograniczanie opóźnień i nadmiernych hacków.

To ważny etap, bo dobrze pokazuje jedną rzecz: czasem najdojrzalsza decyzja to nie dalsze komplikowanie systemu, tylko kontrolowany rollback do prostszego, stabilniejszego rozwiązania.

### 7. Leaderboard, backend i trwałość danych

Leaderboard przechodził kilka etapów:

- najpierw `localStorage`,
- potem Google Sheets przez Apps Script,
- później lokalna kopia wyników jako cache,
- finalnie migracja na Supabase.

Do tego doszły:

- normalizacja imion,
- ikonki typu urządzenia,
- limity top 10,
- pamiętanie ostatniego imienia,
- zapis i odtwarzanie stanu gry z `localStorage`.

W tym momencie gra przestała być tylko sesyjną zabawką, a zaczęła mieć własną ciągłość między uruchomieniami.

### 8. Lokalizacja i porządki architektury

Na późnym etapie wszystkie teksty interfejsu zostały wyciągnięte do `locales/*.js`, doszły kolejne języki, a fallback został ustawiony na angielski.

Potem przyszło dalsze porządkowanie:

- usunięcie starych odniesień do poprzednich nazw i backendów,
- przeniesienie konfiguracji Supabase do bootstrapu,
- czyszczenie twardo wpisanych tekstów z `script.js`,
- dokumentacja techniczna dla przyszłych sesji.

To jest dobry przykład tego, że nawet w małym projekcie porządek architektoniczny zaczyna mieć znaczenie dopiero wtedy, gdy funkcji zrobi się naprawdę dużo.

## Co sprawiało największe trudności

### Balans i „czucie” gry

Najtrudniejsze rzeczy bardzo często nie były algorytmicznie skomplikowane, tylko trudne do wyczucia:

- jak szybka ma być piłka,
- jak szybka ma być klawiatura,
- kiedy bonus jest jeszcze satysfakcjonujący, a kiedy już psuje balans,
- które układy ścian są ciekawe, a które tylko irytujące.

To był obszar ciągłego strojenia, nie jednorazowej implementacji.

### Responsywność i Safari/iPhone

Druga trudna warstwa to urządzenia mobilne, szczególnie Safari:

- przycinanie planszy,
- złe liczenie wysokości,
- niewygodne sterowanie,
- scroll w overlayach,
- audio,
- tap/click poza kanwą.

Te problemy były zwykle bardziej praktyczne niż teoretyczne: kod „działał”, ale UX nie był jeszcze poprawny.

### Złożoność stanów

Im więcej mechanik dochodziło, tym bardziej rosła trudność w obszarze stanu:

- bonusy nałożone jednocześnie,
- przechodzenie między poziomami,
- ostatni kafel z bonusem,
- strata życia tuż po wyczyszczeniu planszy,
- pauza,
- przywracanie zapisanej rozgrywki.

W pewnym momencie najważniejsze stało się nie tyle dodawanie nowych ficzerów, co pilnowanie, żeby istniejące stany nie wchodziły ze sobą w konflikt.

### Pokusa nadmiernego komplikowania

Historia pokazuje kilka miejsc, gdzie system zrobił się zbyt złożony:

- fizyka piłki z „podkręceniem”,
- niektóre eksperymenty audio,
- wcześniejsze warianty layoutów i bonusów.

Wnioskiem było to, że prostsza mechanika często daje lepszy rezultat niż efektowna, ale trudna do kontrolowania złożoność.

## Najważniejsze ogólne wnioski

- Najlepsze rozwiązania w tej grze powstawały iteracyjnie, nie od razu.
- Małe poprawki UX miały często większy wpływ niż duże funkcje.
- W grach przeglądarkowych ogromne znaczenie ma precyzyjne zarządzanie stanem.
- Mobile i Safari wymuszają praktyczne kompromisy oraz dodatkowe testy manualne.
- Dokumentowanie decyzji na bieżąco okazało się bardzo wartościowe — bez `history.md` wiele późniejszych zmian byłoby dużo trudniejszych do uzasadnienia i utrzymania.
- Lokalizacja, backend i persistence weszły późno, ale znacząco podniosły dojrzałość projektu.
- Największy postęp następował wtedy, gdy po eksperymencie następowało uproszczenie i porządkowanie.

## Podsumowanie

Ta gra nie powstała jako jeden zaprojektowany od początku system. Powstała przez ciągłe dopracowywanie, zawracanie, testowanie, upraszczanie i ponowne składanie całości.

Najpierw był prototyp. Potem była grywalność. Potem balans, mobilność, audio, leaderboard, lokalizacja i trwałość stanu. Ostatecznie z prostego eksperymentu wyrosła spójna, przeglądarkowa gra arcade z własną historią decyzji i całkiem dojrzałą architekturą jak na projekt bez bundlera i bez frameworka.
