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
53. `zmien TechHub Arkanoid na aktualna nazwe gry`
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
83. `fatalne to logo, uzyjmy oficjalnego logo marki - najlepiej w svg`
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
122. `napisz prosze ladne readme w jezyku polskim co to za program, instrukcje gry itd.`
123. `startowo paletka + 10% dlugosci`
124. `dostosuj predkosc pilki zaleznie od "przerwy" miedzy paletka a dolnym rzedem kafli - im wieksza odleglosc tym szybsza pilka`
125. `nie do konca o to chodzi - chodzi o to zeby na pionowych ekranach pilka byla szybsza niz na poziomych`
126. `do hiscore piktogram czy komorka czy komputer czy tablet - zgadywane na podstawie rozdzielczosci`
127. `typ dajmy do ostatniej kolumny`
128. `optymalizacja na mniejszych uzadzeniach - wolniejsza pilka, na iphone jest troche trudno`
129. `poprosze + ciut dluzsza +10% paletka dla malych uzadzen`
130. `ikona tabletu jest bardzo nieladna, popraw zeby byla podobna bardziej do tej od telefonu i kompa`
131. `wprowadzamy nowa mechanike - betonowy kafelek - trzeba go uderzyc 2x zeby go zbic - ilosc proporcjonalna do poziomu, 1 level = 0 betonowych, 2 level = 1 betonowy itd., wazne - bonusy musza zostac, wiec dla wyzszych leveli nadal musi zostac miejsce na "zlote" kafle bonusowe. Wyglad betonowego - taki jak pozostale - 3d, ale szary z kropeczkami (jak beton)`
132. `widze beton po uderzeniu robi sie jasniejszy, powinien robic sie popekany`
133. `kilka zmian w mechanice: 1. bonus dodatkowego zycia i "bomba" sa losowo tylko w betonowym kaflu, po zniszczeniu go calkowicie - nie ma ich w pozostalych zlotych kaflach. 2. predkosc pilki wzrasta o 7% na poziom (nie 10%). 3. dlugosc paletki na najmniejszych urzadzeniach powinna byc jeszcze 10% wieksza. 4. bonus spowolnienia/ przyspieszenia: spowalniamy dwukrotnie (graficznie wieksze smuzenie), przyspieszamy o 25% (bez zmian) - graficznie smuzenie ma kolor czerwony w takim wypadku. 5. Bonus strzelania nie powinien znikac po 15s. 6. Dlugosc paletki i posiadanie armaty przechodza miedzy poziomami.`
134. `zwiekszanie i zmniejszanie dlugosci paletki - 11 poziomow (stan"0" - oryginalna dlugosc - 5 zwiekszajacych dlugosc i 5 zmniejszajacych w krokach zdefiniowanyj ponizej). Czyli od stanu "0" mozemy uzyskac powiekszenie dlugosci paletki 5 razy czyli 0: 100%, 1: 150%, 2: 200%, 3:250%, 4: 300%, 5: 350%. Zmniejszanie dlugosci paletki od poziomu "0" -1: 90%, -2: 70%, -3: 50%, -4: 30%, -5: 20%. Praca przy zmniejszonej lub zmniejszonej paletce, przyklad: paletka jest zmniejszona o 1 poziom (do -1) - bonus zwiekszajacy daje poziom "0", przyklad 2: paletka jest zwiekszona do poziomu 2 (200%) - zmniejszenie o 1 daje poziom 1 (150%)`
135. `wazna zmiana mechaniki - ilosc zlotych kafli rowna sumie bonusow pozytywnych i negatywnych - na kazdym levelu dostepny kazdy bonus.`
136. `w zlotych kaflach z bonusami nie powinno byc "fireball" i zycie +1, druga rzecz: poziomy dlugosci paletki: 1: 125%, 2: 150%, 3: 175%, 4:200%, 5: 250%`
137. `nazywajmy bonusy w betonowych blokach "super-bonusami", dodajemy dwa negatywne bonusy -> nagla smierc (ikona czaszki), reset paletki (rozmiar poczatkowy, brak armaty i kleju) - ikona X`
138. `zmiana mechaniki - jesli ostatni kafel ma bonus - konczymy gre dopiero kiedy zleci na sam dol`
139. `nagla smierc - po prostu zabiera 1 zycie - jest rownoznaczne z upuszczeniem pilki a nie koncem calej gry`
140. `dodajmy dzwieki - styl kosmiczny`
141. `dzwieki bonusu, superbonusu powinny sie roznic dla negatywnych i pozytywnych`
142. `wprowadzamy dodatkowy diamentowy kafelek - podobny jak betonowy, ale zeby go rozbic trzeba uderzyc trzy razy - podobnie jak betonowy dostarcza superbonusy. Krysztalowe pojawiaja sie od poziomu 3 co +1 co 3 poziomy. Zmiana w betonowych - pojawiaja sie od poziomu 2 +1 co 3 poziom.`
143. `zmiana mechaniki - zlote kafle nie powinny byc oznaczone - tzn. mamy bonusy "zwykle" poukrywane losowo w zwyklych kaflach`
144. `w krysztalowych kaflach tylko pozytywne super-bonusy`
145. `pojawianie sie betonowych kafli - 2,4,6,8,10...itd. poziom, krysztalowe - 3,6,9,12... itd`
146. `wprowadzamy "layout" planszy - dodatkowe niezniszczalne sciany. Obecnie mamy uklad kafli 5x8 - wirtualnie o 2 ponizej, dokladne wspolzedne (od gory: 8, od lewa: 2) i (8,6) wprowadzamy dwa niezniszczalne (jasnoszare) scianki o wielkosci kafelka`
147. `dobra, to teraz docelowe layouty plansz - plansza 1: bez scian, plansza 2: sciany (8,2), (8,7), plansza 3: sciany (8,2), (9,2), (8,7), (9,7), plansza 4: (8,2), (9,2), (8,3), (8,7), (9,7), (8,6)`
148. `zmiana layoutu: 1: bez scian, plansza 2: (8,2), (8,7), plansza 3: jak "2", plansza 4: (8,2), (9,2), (8,7), (9,7), plansza 5: jak "4", plansza "6": (8,2), (9,2), (10, 2), (8,7), (9,7), (10,7)`
149. `zmiana mechaniki fireball - niszczy nawet sciany (jasnoszare)`
150. `dodaj tymczasowa opcje - nacisniecie CTRL i plus zwieksza level o 1`
151. `zmiana layoutu: 1: bez scian, plansza 2: (8,2), (8,7), plansza 3: jak "2", plansza 4: (8,2), (10,2), (8,7), (10,7), plansza 5: jak "4", plansza "6": (8,2), (9,2), (10, 2), (8,7), (9,7), (10,7), plansza 7 jak "6", plansza "8": (8,2), (11,2), (8,7), (11,7), plansza "9" jak 8, plansza 10: (8,2), (9,2), (11, 2), (8,7), (9,7), (11,7), plansza 11 jak 10, 12: (8,2), (9,2), (10, 7), (11, 2), (8,7), (9,7), (10,7) (11,7) kolejne plansze powtarzaja cykl`
152. `dobra poprawka plansz: plansza 1 - brak scian, 2,3: sciana pojedyncza, 4,5: sciana z 2 klockow, 6,7: sciana z 3 klockow, 8,9: sciana z 4 klockow i potem cykl`
153. `usun ctrl++`
154. `Porzadkujemy wytrzymale kafle i super-bonusy: ceglane 2x, od lvl 2 po 2 szt. i x2 co 2 levele, bonusy +1 zycie / utrata zycia; betonowe 3x, od lvl 3 po 2 szt. i x2 co 3 levele, bonusy fireball / pilka pingpongowa; krysztalowe 4x, od lvl 4 po 1 szt. i x2 co 4 levele, zawsze +1 zycie + fireball`
155. `rework scian - zaczynamy sciany od poziomu 3 najpierw w rzedzie 7 - pozycja (7,1) co 3 poziomy pojawiaja sie kolejne (7,8) potem (7,2), (7,7), (7,3), (7,6), (7,4), (7,5) i na tym sie konczy`
156. `fix: po utracie zycia wszystkie bonusy negatywne znikaja`
157. `kanwa zawsze kwadratowa; siatka 8x26, kafle bez marginesow, 5 rzedow kafli od rzedu 2, startowa paletka ma szerokosc 1 kafla i wysokosc pol kafla`
158. `czyscimy mechanike predkosci - bazowa predkosc pilki ok. 50% nizsza, na mniejszych ekranach jeszcze mniejsza, a przyrost na poziom wynosi 5%`
159. `2x fix: kanwa wycentrowana takze w pionie w dostepnej przestrzeni, a tap/click pod kanwa na iPhonie tez uruchamia akcje/strzal`
160. `bazowa predkosc pilki +10%`
161. `predkosc spadania bonusow skorelowana z predkoscia pilki`
162. `kafli zwyczajnych skrywajacych bonusy jest dokladnie tyle ile bonusow standardowych; na kazdej planszy kazdy taki bonus wystepuje tylko raz`
163. `fix: klikanie/tap poza kanwa tez powoduje strzal z armaty`
164. `tlo calej aplikacji ma ten sam kolor co obecna kanwa gry`
165. `usuwamy shrinkthird`
166. `kolory tla aplikacji i kanwy sa takie same; wspolny gradient od ciemnego u gory do ok. 15% jasniejszego na dole`
167. `usunmy gradient - tlo body takie samo jak ciemniejszy kolor kanwy`
168. `fix: usun mozliwosc zaznaczania kanwy`
169. `fix: blokujemy dragstart/selectstart kanwy, bo po zaznaczaniu gra wygladala jakby znikala`
170. `fix: mocniej blokujemy domyslne akcje touch/pointer/contextmenu na kanwie, bo poprzednia blokada nie wystarczyla`
171. `fix: tlo samej kanwy tez jest jednolite i takie samo jak tlo body`
172. `sterowanie klawiszami jest teraz za szybkie, zwolnijmy o 25%`
173. `fix: przywracamy sfx przez globalne odblokowanie audio na pierwszym geście uzytkownika`
174. `odbicie od scian powinno dawac ten sam dzwiek co odbicie od rakietki`
174. `fix: playSound sam wznawia AudioContext i dopiero potem odtwarza sfx`
175. `porzadkujemy numeracje historii po fixie audio`
176. `2 fixy: blur na stronie robi pauze; gdy ostatni kafel jest zbity i jeszcze spada bonus, pilka moze dalej leciec i utrata zycia / game over dziala normalnie`
177. `badge wersji malutki, bez obramowki, ale zawierajacy date i godzine ostatniej zmiany`
178. `4 fixy: probujemy przywrocic dzwieki przez mocniejsze odblokowanie i priming audio; badge wersji jeszcze mniejszy; nowe logo to nowoczesny napis Arkanoid z kwadracikow i bez pauzy po kliknieciu; startowa predkosc na malych ekranach nadal zalezy od rozmiaru, ale jest wyzsza niz w poprzedniej wersji`
179. `2 fixy: delikatna jasniejsza obwodka wokol kwadratowej planszy gry; startowa predkosc pilki mniejsza o 10%`
180. `3 fixy: plansza gry ma delikatnie zaokraglone rogi; kafle startuja od trzeciego rzedu; rakietka wisi w przedostatnim rzedzie`
181. `2 fixy: kafle maja odrobine wiekszy padding; obramowanie planszy ma kolor w skali tla, ale ok. 20% jasniejszy`
182. `2 fixy: dodajemy dekoracyjny wewnetrzny padding w obramowaniu kanwy; obramowanie planszy jest jeszcze odrobine jasniejsze`
183. `fix: zwiekszamy dekoracyjny wewnetrzny padding w obramowaniu kanwy`
184. `fix: dekoracyjny wewnetrzny padding planszy jest teraz rysowany bezposrednio na tle kanwy, zeby byl faktycznie widoczny`
185. `fix: rezygnujemy z udawanego efektu; prawdziwe pole gry jest mniejsze o 4px z kazdej strony wewnatrz kanwy`
186. `2 fixy: zostawiamy tylko zewnetrzna obwodke planszy bez wewnetrznej widocznej ramki; rakietka wraca na dol planszy`
187. `fix: logo Arkanoid jest odrobine wieksze i ma spokojny bialy blask zamiast teczowego efektu`
188. `fix: kafle startuja od piatego rzedu siatki`
189. `fix: cofamy start kafli na drugi rzad siatki`
190. `2 fixy: HUD i plansza maja ten sam kolor obwodki oraz ten sam border-radius; wzmacniamy odblokowanie Web Audio pod iPhone Safari przez cichy buffer source i dodatkowe gesty end/up`
191. `fix: jeszcze mocniej wzmacniamy audio na iPhone Safari przez audioSession=playback oraz ukryty silent audio unlock w realnym geście`
192. `fix: na iPhone/iOS dodajemy fallback SFX przez generowane WAV-y odtwarzane jako HTMLAudio/media channel zamiast polegac tylko na Web Audio`
193. `fix: optymalizujemy wydajnosc audio na iPhone przez mniejsza polifonie i mocniejszy throttling najczestszych SFX zamiast probowac odtwarzac wszystkie naraz`
194. `fix: wycofujemy opozniajace odtwarzanie SFX przez HTMLAudio; HTMLAudio zostaje tylko do odblokowania iOS, a same efekty znow ida przez low-latency Web Audio`
195. `fix: przestajemy czekac na wolniejsze media unlock przy samym resume Web Audio, zeby pierwszy SFX nie byl opozniany przez handshake iOS`
196. `fix: iPhone silent/media unlock wykonuje sie tylko do pierwszego skutecznego odblokowania i nie odpala sie ponownie przy kolejnych akcjach`
197. `fix: rozdzielamy iOS media unlock od zwyklego Web Audio resume; wolniejszy unlock kanału media uruchamia sie tylko z pierwszego gestu i nie dokleja sie do kazdej akcji`
198. `fix: radykalny rollback audio - wracamy do pierwszej wersji SFX z 1.4.0 i usuwamy pozniejsze hacki odblokowania/fallbacku, ktore dokladaly opoznienie`
199. `2 fixy: cegly wisza o jeden rzad nizej i zostawiaja nad soba dwa puste rzędy; layout scian przechodzi na 12-poziomowy cykl z pozycjami (2,9), (7,9), (4,10), (5,10), (2,11), (7,11)`
200. `fix: zlapany bonus smierci nie moze juz zawiesic gry po wyczyszczeniu planszy; po loseLife przerywamy dalsza obsluge bonusow i przejscia poziomu w tej samej klatce`
201. `fix: spowalniamy ruch paletki sterowanej klawiszami o 25%`
202. `fix: jeszcze bardziej spowalniamy ruch paletki sterowanej klawiszami`
203. `fix: usuwamy z repo wszystkie pozostalosci starej nazwy marki, lacznie z tytulem, README, historia i kluczem cache leaderboardu`
204. `fix: jeszcze raz wyraznie spowalniamy ruch paletki sterowanej klawiszami`
205. `fix: poprzednie zmiany predkosci klawiatury byly nadpisywane przy resize; wprowadzamy osobna stala speedu klawiatury oparta o kafle i realnie zwalniamy paletke`
206. `2 fixy UX: pauza wlacza sie juz tylko przez blur albo ESC i wraca tylko z przycisku interfejsu; start gry i kolejnych plansz dziala tylko z przyciskow UI, nie ze spacji ani klikniecia`
207. `docs: dodajemy na poczatku README link do publicznej wersji gry https://milejko.github.io/arkanoid/`
208. `rework bonusu krysztalowego: zamiast serca+fireballa daje super-armate na 30 sekund; czerwone strzaly niszcza sciany i kazdy niszczalny kafel jednym trafieniem`
209. `porzadkujemy kafle specjalne: od poziomow 2/4/6 mamy stale po 1 sztuce ceglanego/betonowego/krysztalowego z bonusami +1 zycie / fireball / super-armata; znikaja negatywne super-bonusy utrata zycia i ping-pong`
210. `2 poprawki balansu: super-armata z krysztalu trwa 15 sekund; sciany layoutu zaczynaja pojawiac sie dopiero od poziomu 5`
211. `fix: sciany dostaja wiecej roznych wzorow w cyklu poziomow 5-12 zamiast prostego dokladania jednego ukladu`
212. `fix: dopracowujemy wzory scian, zeby byly bardziej charakterystyczne - np. brama, filary, klepsydra i zygzak`
213. `fix: zwykle kafle dostaja bardziej teczowa palete, ale odsunieta od kolorow ceglanego, betonowego, krysztalowego i scian`
214. `fix: dolny rzad zwyklych kafli dostaje zloty wariant`
215. `debug: na ekranie startowym dodajemy skrot Ctrl+Cmd+L, ktory podnosi poziom o 1`
216. `fix: betonowy kafel dostaje neutralnie szare cieniowanie bez fioletowej poswiaty`
217. `fix: sciany dostaja 11 roznych ukladow dla poziomow 5-15, a od poziomu 5 wystepuja juz zawsze i tylko zapetlaja wzor`
218. `fix: wszystkie wzory scian w cyklu od poziomu 5 robimy lustrzanie symetryczne`
219. `tuning: zmniejszamy symetryczne wzory scian przypisane do poziomow 8 i 11`
220. `tuning: zmniejszamy tez symetryczne wzory scian przypisane do poziomow 13 i 14`
