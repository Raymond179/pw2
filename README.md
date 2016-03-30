# Bundlin (PW2)


## Aanpassingen
#### Performance (Performance matters)
Overzicht:
- HTML semantischer
- Critical CSS
- Reduced images

Alle tijden zijn gemeten met 4G (4mb/s 20ms RTT).

###### Before
DOM: 1810ms <br />
First Paint: 3500ms <br />
Load event: 8640ms

![alt tag](https://github.com/RaymondKorrel/pw2/blob/student/raymond/readme/before.jpg)

###### HTML semantischer
HTML tags toepasselijker gemaakt.

DOM: 897ms <br />
First Paint: 3560ms <br />
Load event: 8710ms

![alt tag](https://github.com/RaymondKorrel/pw2/blob/student/raymond/readme/html.jpg)

###### Critical CSS
Above the fold CSS toegepast. De header CSS wordt inline geladen en de rest asynchroon.

DOM: 762ms <br />
First Paint: 3550ms <br />
Load event: 8730ms

![alt tag](https://github.com/RaymondKorrel/pw2/blob/student/raymond/readme/css.jpg)

###### Reduced images
Afbeeldingen kleiner maken met behulp van Grunt imagemin (met de plugins Pngquant en Mozjpeg). Alleen de kwaliteit verlaagd.

DOM: 538ms <br />
First Paint: 1810ms <br />
Load event: 7510ms <br />
Images: van 3.23mb naar 1.72mb

![alt tag](https://github.com/RaymondKorrel/pw2/blob/student/raymond/readme/img.jpg)

#### Accessibility (Browser Technologies)
Overzicht:
- ajfdakd
- adk

###### HTML semantischer
