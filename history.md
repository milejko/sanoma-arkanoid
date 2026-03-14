# Historia komend

Plik utrzymywany na bieżąco. Każde kolejne polecenie użytkownika w tej sesji będzie dopisywane poniżej.

## Komendy użytkownika

1. `Create a simple webpage where a ball bounces around the screen.`
2. `okay so if we have this ball bouncing, maybe let's do arkanoid style game`
3. `okay, I would like bricks to have 3d effect`
4. `chodzilo mi o efekt neonu czyli litery powinny miec podwojne krawedzie i rozne kolory, dodatkowo zachowaj wielkosci liter "TechHub ARCANOID"`
5. `kazda litera w innym kolorze i ciut wieksze`
6. `usun tez te blende z instrukcja z prawej strony`
7. `lewa blenda wyzej`
8. `dodajmy troche bonusow - okreslone kafelki - w sumie 10% daja bonusy -> wydluzenie rakietki, lub "klejaca rakietka" - pilka musi byc wyslana spacja, lub strzelajaca rakietka -> tez spacja`
9. `bonusy zawsze tajne - zloty kolor plytki, bez oznaczenia literowego`
10. `dlugosci moga sie sumowac czyli x2 x3 x4, nie powinny byc ograniczone czasowo, tak samo klej i strzelanie, spadajacy bonus tez powinien byc niespodzianka (plus animowany podczas spadania), dodatkowo jesli paletka jest klejaca powinna miec gradient do zielonego (klej) a jesli strzelajaca powinna miec wypustki w miejscach skad wylatuja strzaly`
11. `poprawka - bonusy sie sumuja - paletka moze byc dluga szeroka klejaca i strzelajaca, poprawka 2: jesli paletka jest klejaca pileczka przykleja sie w miejscu gdzie upadla (nie na srodku)`
12. `bug - przyklejenie dziala ok, ale po przesunieciu paletki przyklejona pilka przemieszcza sie do srodka`
13. `dwie sprawy - po utracie zycia bonusy przepadaja, wprowadzamy negatywne bonusy - skrocenie paletki do 1/2 i 1/3, przyspieszenie pileczki x2 x3 - ukryte w normalnych bonusach. Nowosc graficzna - spadajacy bonus - jak animacja spadajacej monety`
14. `bonusy negatywne powinny wchodzic stopniowo - czyli skrocenie najpierw 3/4 potem 1/2 potem 1/4. Powinny byc kasowane przez bonusy pozytywne czyli zwiekszenia. Podobnie predkosc pilki. Zmieniam zdanie - podczas lotu bonus pozytywny powinien miec bardziej czerwony kolor, a ten pozytywny bardziej zielony. Animacja obrotu - os obrotu monety w poziomie, nie w pionie, ciut wieksza moneta`
15. `wiecej bonusowych klockow + moneta powinna obracac sie wokol osi poziomej`
16. `bug: moneta niepotrzebnie zmienia swoja szerokosc podczas spadania`
17. `2 wiecej blokow nizsze i wezsze`
18. `wezsze kafle o 30%`
19. `ale na cala szerokosc ekranu`
20. `bug: po zgubieniu pilki powinny przepadac wszystkie bonusy - i pozytywne i negatywne`
21. `te kafelki nie powinny miec przerw pomiedzy, tylko byc sklejone`
22. `powinny miec niewielkie, rownomierne przerwy`
23. `3px`
24. `teraz layout to 5x11, chcialbym 6x 12 i odstep 5px`
25. `armata do strzelania na srodku rakietki`
26. `zmiana wygladu bonusow powinny byc oznaczone jednak i w ksztalcie podluznej tabletki`
27. `ta tabletka animowana podobnie jak byla ta moneta i ciut wieksza`
28. `ladnie, bonusy bardziej kolorowe - pozytywne: zloto zielone (gradient), negatywne: zloto-czerwone`
29. `ciagle blade`
30. `przy bonusie klej - nie jest potrzebny monit o spacji`
31. `zamiast liter na bonusach zaproponuj piktogram + jeszcze bardziej zielone i czerwone te tabletki`
32. `jeszcze wiecej kafli 6x15`
33. `to teraz popracujmy nad mechanika bonusow dlugosci i szybkosci. powiekszanie paletki zawsze +50%, zmniejszanie zawsze -50%. przyspieszanie pileczki +25%, spowalnianie -25%.`
34. `fix - mechanika "kleju" - po 5s pilka startuje sama`
35. `dobra, co do dlugosci i predkosci, zrobmy skokowo, czyli dlugosc +50% +100% +150% (max) -25% -50% -75%, predkosc od -75%, -50%, -25%, 0, +25%, +50%, +100%`
36. `klej powinien puszczac jednak po 3sekundach`
37. `bug: wolniejsza pilka to bonus pozytywny a szybsza to negatywny`
38. `zapanie bonusa pozytywnego +200 punktow, negatywnego +400 punktow, poprawka graficzna - logo wielkosci blendy, blenda wysrodkowana horyzontalnie z logo`
39. `logo po lewej, blenda po prawej wysrodkowane w poziomie - srodek wysokosci logo na srodku wysokosci HUD`
40. `prawie idealnie - logo do lewej, HUD do prawej`
41. `wolalbym logo zupelnie do lewej (oczywiscie z marginesem) a hud zupelnie do prawej z rownym marginesem jak logo`
42. `niech bonus klej i armata znikaja po 30s`
43. `okay znikanie kleju i armaty 15s`
44. `w hud bonusy z piktogramami`
45. `fix napisu Logo - TechHUB Arkanoid`
46. `usuwamy bonus z HUD`
47. `bardzo rzadki bonus (10%) +1 zycie z piktogramem`
48. `czy pilka moglaby lekko smuzyc?`
49. `dobra wprowadzamy levele po zbiciu wszystkich cegiel. Obecna, bazowa predkosc pilki zostaje w levelu 1, kazdy kolejny level podnosi poziom o 10%. Dodatkowo z planszy na danym poziomie znika losowo tyle kafelkow ktory mamy poziom`
50. `zmiana graficzna - level jest najwiekszy powinien byc pierwszy w HUD i numerek wieksza czcionka. zmiana mechaniki spowalniania/przyspieszania - przyspieszenie +25, spowolnienie -25% ale tylko na 15 sekund + oznaczenie graficzne - przyspieszona - mniej smuzy, spowolniona znacznie bardziej smuzy`
51. `usuwamy z hud ilosc cegiel, level ta sama wielkosc czcionki co wynik, ilosc zyc prezentujemy serduszkami max 3 zycia (bonus zyc nie dodaje powyzej 3). Czcionka o stalej szerokosci`
52. `zapisz do pliku MD np. history.md moje "komendy" i utrzymuj ich historie przy kolejnych komendach`
53. `zmien TechHub Arkanoid na Sanoma Arkanoid`
54. `poziomy sa za dlugie - 5 x 10 kafle`
55. `ilosc kafli zalezna od poziomu wedlug wzoru: wysokosc = 5+zaokraglij((poziom -1) / 5) , szerokosc = 8 + zaokraglij((poziom-1) / 2)`
56. `wysokosc 4 + round((level -1)/4) kafelki wyzsze niz poprzednio o 10%`
57. `bonus zycia mozemy dac rownie czesto co pozostale`
58. `zajmijmy sie piktogramami na tabletkach bonusu - wolalbym dla armaty - pistolet, dla zmniejszania predkosci strzaleczki w lewo, dla zwiekszania w prawo, zycie = serduszko, dlugosc paletki symbol <-> dla zwiekszania i >< dla skracania`
59. `usuwanie tych cegiel zgodne z poziomem wyglada jak blad, usunmy te funkcje`
60. `poprzednie ikony bardziej mi sie podobaly, zostawmy z nowych tylko pistolet`
61. `bug: ikonki przyspieszenia i spowolnienia sa na odwrot`
62. `ta ikona pistoletu jest nieczytelna, moze luk i strzala? no i ikona kleju jest niejasna, sprobujmy z inna`
63. `ruch klawiatura powinien byc szybszy o 50% niz obecnie`
64. `ikona serca na tabletce powinna byc "pelna" nie tylko kontur, ikona kleju inna, moze jako plama`
65. `po zakonczeniu gry robimy "hi-score" trzymamy go w local storage, dajemy opcje wpisu inicjalu max. 10 znakow. Tablica wynikow prezentowana jest na starcie i na koncu gry. zawiera - imie, level ilosc punktow`
66. `te serca na tabletkach w ogole nie przypominaja serca`
67. `podwyzsz odrobine pozycje rakietki i dodaj kontrolki dla mobile: guzik w lewo, start/strzal, guzik w prawo`
68. `Analyze this codebase and create a .github/copilot-instructions.md file to help future Copilot sessions work effectively in this repository.`
69. `zerknij na history.md to moja lista instarukcji`
70. `dobra wprowadzilem drobna zmiane z kontrolkami dla mobile - ona nie ma sensu wycofaj ja`
71. `ok, zapomniales zaktualizowac history.md`
72. `kolejna rzecz backend dla leaderboardu, zrobmy to na Google API w oparciu o arkusz kalkulacyjny, ktory jest udostepniony tu: https://docs.google.com/spreadsheets/d/1UaBU1XSWbO0gaPoZ6Xfx3qUPzQaZUZ92T-s9lPSnDo8/edit?usp=sharing`
73. `bug: na mobile logo / HUD zakrywaja cegly`
74. `usu prosze dynamiczna zmiane ilosci kafli zostawiamy 5x10`
75. `obecnie wyniki "online" wolno sie laduja, zrob prosze "kopie" w local storage do lokalnego wyswietlania, ktora bedziesz synchronizowal z Google`
76. `usun te labelki informacyjne Najlepsze globalne wyniki. Naciśnij Spację albo kliknij Start. Brak zapisanych wyników. Czas to zmienić.`
77. `Ładowanie globalnej tablicy wyników... zamiast tego animacja 3 kropek`
78. `te niebieskie statusy typu zapisywanie tez kropki`
79. `to niepotrzebne: "Wynik zapisany lokalnie i zsynchronizowany z Google." plus te kropki gdzies na dole tego okna statusowego (obok nowa gra, po lewej)`
80. `wprowadzmy mechanizm pauzy (rozmyty ekran podobnie jak przy hiscore) po nacisnieciu "p"`
81. `zmniejszmy ilosc kafli - 5x8`
82. `dwie rzeczy - obszar w ktorym odbija sie pilka nie powinien byc tam gdzie logo i HUD, powinien konczyc sie tam gdzie pierwszy rzad kafli`
83. `fatalne to logo, uzyjmy oficjalnego logo sanoma - najlepiej w svg`
84. `kolejna rzecz napis "Naciśnij P, aby wrócić do gry." - do usuniecia, "Nacisnij spacje by wystartowac" - do zamiany na ...`
85. `blendy startowe "Poziom X - ..." do zmiany na "Poziom X..." i styl blendy jak przy pauzie`
86. `wszystkie niebieskie napisy na blendach typu "HI-SCORE", "LEVEL", "GAME" zmien na "Arkanoid"`
87. `"Poziom X..." -> "Poziom X, zaczynamy?"`
88. `zamiast "Poziom X, zaczynamy?" -> "Poziom X" jako tytul i jako tekst: "Ilosc zyc: X"`
89. `zamiast ilosc zyc jednak zaczynamy? ale nie w tytule tylko w tekscie`
90. `opusc kafle o 1 rzad od gory, zeby stworzyla sie przestrzen miedzy krawedzia a pierwszym rzedem kafli patrzac od gory`
91. `na blendzie pauza w tekscie piktogramy 3x kaw`
92. `tabletki pozytywne bardziej zielone, negatywne bardziej czerwone`
93. `blenda startowa zamiast "zaczynamy?" "Zaczynamy?" + piktogram rakiety`
94. `5 rzedow kafelkow powinno miec nad soba przestrzen wysokosci 2 rzedow kafli, zeby pilka mogla wpasc nad kafle`
95. `nie zrozumiales - kanwa ma zostac jak w oryginale, tylko kafle musza wisiec jakby "w powietrzu"`
96. `dodatkowy superbonus, trwa 5s - pilka zabarwia sie na czerwono (smuga tez) i rozbija wszystkie kafle na drodze`
97. `albo lepiej ognia`
98. `bardziej ogniowy`
99. `dodaj numer wersji 1.0.X w prawym dolnym rogu, gdzie X = numer biezacego polecenia z history.md`
100. `animacja trzech kropek powinna byc jednak po prawej stronie od guzika i nie powinna "poruszac" guzikiem - przesuwac go`
101. `to jednak te kropki po lewej stronie a guzik do prawej, tak zeby nie ruszal sie jak pojawiaja sie i znikaja kropki`
102. `blenda poziom X - rozrozniamy start poziomu i kontynuacje po utracie zycia - nowy poziom = guzik start, po utracie zycia guzik "kontynuuj". Zmiana napisu przy kontynuacji z "Zaczynamy?" + rakieta na "Nic straconego." i ikonka usmiechu`
103. `dugosc paletki powinna byc proporcjonalna do szerokosci ekranu`
104. `super, ale startowo jest troszeczke za szeroka, zmniejszmy o 30%`
105. `kanwa powinna miec lewy i prawy margines zgodny z tym ktory maja logotyp i HUD`
106. `klikniecie w HUD robi pauze, dodatkowo - wszystkie bonusy sa usuwane po zmianie poziomu`
107. `to moze przycisk`
108. `fatalnie HUD jest teraz na srodku, wolalbym do prawej a przycisk wysokosci huda na lewo od niego`
109. `to moze zamiast przycisku klikalne logo jako pauza i na mobile i normalnie`
110. `logo i hudu MUSZA zawsze byc obok siebie - moze media query zeby na mniejszym ekranie byly mniejsze?`
111. `obcina teraz na iphone paletke - wychodzi poza ekran - kanwa musi byc mniejsza`
112. `wysokosc kanwy`
113. `u dolu ucina`
114. `teraz jest totalnie zle na safari`
115. `na safari na komputerze jest ok, na iphone kanwa jest za wysoka (od dolu), i za szeroka`
116. `zmiana liczenia wersji - numer z historii setki = major, dziesiatki = minor, jednosci = path`
117. `blenda z tablica wynikow, pauza, start poziomu i kontynuacja nie jest wycentrowana w pionie - jest troche za nisko, prawdopodobnie o wysokosc logo/hud`
118. `na mniejszych ekranach hiscore ze scrollem - widoczne 5 pierwszych pozycji`
119. `wyswietlamy (nawet na desktopie) tylko 10 wynikow, jesli nowy wynik jest gorszy niz w pierwszej 10tce, wyswietlamy tylko hi-score bez opcji wpisu`
120. `2x bug: 1. kanwa jest odrobine za szeroka na iphone (ucina kafle z prawej) 2. nie dziala scroll hi-score na iphone`
121. `2 usprawnienia - niech style.css i script.js beda dynamicznie zalezec od wersji (zeby uniknac stale cache)`
