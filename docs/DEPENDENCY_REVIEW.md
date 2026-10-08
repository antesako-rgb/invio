# Dependency provjera — 2026-10-08

Node v24.21.0 / npm 11.19.1. Projektni engines ostaje 24.x. Konva 10.7.1 i react-konva 19.2.7 nisu mijenjani.

## Ciljane nadogradnje

- next 16.3.5 → 16.3.8; verzija je sada izričito pinana.
- eslint-config-next 16.3.2 → 16.3.8, usklađen s Nextom.
- sharp 0.35.4 → 0.35.5.
- Transitive source-map-js 1.2.1 → 1.2.2.
- Transitive brace-expansion 1.1.18 → 1.1.21 i 5.0.9 → 5.0.12.

Instalacija i transitive update izvršeni s --ignore-scripts. Nije korišten audit fix niti --force, nema nasumičnih overrides ili downgradea. Postojeći OpenPageFlip patchevi primijenjeni zasebnim pregledanim npm run postinstall; oba PASS. Ostale direktne dependency verzije nisu mijenjane.

## Install scripts

Pregledani izvori i npm install-scripts ls. package.json allowScripts sada izričito zabranjuje @parcel/watcher, @swc/core i unrs-resolver. Nije odobrena niti izvršena njihova install/postinstall skripta. npm install-scripts ls: nema nepregledanih skripti.

- @parcel/watcher 2.6.0: lokalni build-from-source shim može pokrenuti node-gyp; nativni watcher uspješno subscribe/unsubscribe bez skripte.
- @swc/core 1.15.47: postinstall provjerava nativnu biblioteku i može instalirati WASM fallback; TypeScript transform uspješan bez skripte.
- unrs-resolver 1.12.2: napi-postinstall priprema nativni binding; resolve react paketa uspješan bez skripte.

Odluka provjerena na ovom Windows okruženju. Pri promjeni platforme ili verzije ponovno provjeriti prebuilt bindingove; ne odobravati skripte globalno samo radi upozorenja.

## Audit i provjere

- Prije: 11 zahvaćenih paketa, 1 critical + 10 high.
- Nakon: production npm audit --omit=dev ima 0 ranjivosti.
- Puni audit: 7 high, svi razvojni lanci iz braces 3.0.3. Zahvaćeni braces, micromatch, fast-glob, @next/eslint-plugin-next, eslint-config-next, find-yarn-workspace-root i patch-package. Nema zakrpane objavljene braces verzije na registru u trenutku provjere; braces 3.0.3, micromatch 4.0.8 i patch-package 8.0.1 su aktualne objavljene verzije. Ne primjenjivati auditove breaking downgrade prijedloge. Ponoviti audit kada upstream objavi zakrpu. Ovo nije tvrdnja da razvojni alati nemaju rizika.
- tsc --noEmit: PASS.
- npm run build pod Node 24 / Next 16.3.8: PASS.
- Sharp: sintetički JPG/PNG/WebP → WebP, širina 1600, očuvani omjer, bez povećanja malih slika i odbijanje nevaljanog sadržaja: PASS. Nema stvarnih uploadova ili vanjskih PUT/DELETE poziva.
- Puni npm run lint: postojeće 6 grešaka (BackToTop, PageContainer/Page, FilePicker, Skeleton, tooltip, AuthProvider) i 4 img upozorenja u drugim featureima. Nisu mijenjane te komponente.

Npm je prijavio EPERM pri uklanjanju stare privremene Next SWC DLL mape, što može značiti da postojeći dev proces još drži biblioteku. Instalirane nove verzije i novi build su uspješni. Ponovno pokrenuti postojeći dev server prije korištenja zakrpanog Nexta. Nije nasilno prekinut korisnikov proces.

Privremena runtime-check skripta uklonjena nakon provjere. Baza, hosted environment i seating editor nisu mijenjani; nema commita/deploya.
