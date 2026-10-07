# not-found CSS preload — 2026-10-02

## Naknadno rješenje — primijenjeno uz odobrenje

Korisnik je nakon audita odobrio zamjenu 404 CSS Modulea postojećim Tailwind klasama uz očuvanje izgleda. `not-found.tsx` sada koristi ekvivalentne utility klase; neiskorišteni `not-found.module.css` uklonjen je. To je ciljani aplikacijski workaround, ne popravak Nextova preload mehanizma. Pravila sada pripadaju postojećem zajedničkom Tailwind stylesheetu, pa nema zasebnog 404 CSS chunka za preload. Nema izmjene Next konfiguracije, routinga, inline styles ili gašenja prefetch/preload funkcionalnosti.

TimePicker adapter u `ProjectEventScheduleSection` sada mapira `null` u `""`, što već odgovara form defaults/schema/payload pravilima. Nisu mijenjani shared picker, DB niti RPC ugovori.

Provjere nakon izmjena:
- TypeScript i production `next build`: prolaze, bez isključivanja provjera.
- ESLint dviju promijenjenih TSX datoteka: prolazi.
- Postojeći testovi: 19/19 prolazi.
- Dev HTTP odgovor više nema `src_app_not-found_module_...css` link.
- Novi production build pokrenut kroz `next start`: `/` vraća 200; nepostojeća ruta vraća 404 i renderira postojeći 404 sadržaj. Obje koriste zajednički stylesheet, bez zasebnog 404 CSS linka.
- U production CSS-u potvrđeni su 6rem/2rem font, max-width 500px, visina gumba 44px i line-height 1.7. Nije provedena screenshot/browser-console usporedba.
- Drugi Next-generated CSS preloadovi i dalje postoje; ovo nije tvrdnja da su uklonjena sva moguća preload upozorenja.

Upstream kontekst: [Next.js rasprava #89303](https://github.com/vercel/next.js/discussions/89303), odgovor člana Next tima objašnjava preload globalne 404 stranice radi izbjegavanja blokirane navigacije pri notFound grešci. Nije pronađen potvrđen release fix koji bismo ovdje primijenili.

Preostali tekst čuva nalaz **prije izmjene** i tadašnju odluku.

## Zaključak

Preload generira Next.js 16.3.5 / njegov React RSC renderer za CSS root not-found boundaryja. Nije ručni resource hint aplikacije niti je za reprodukciju potreban Link prefetch ili Fast Refresh. Atribut `as="style"` već je ispravan.

## Potvrđeni lanac

1. Jedini app not-found je `src/app/not-found.tsx`, koji importira `./not-found.module.css` i `next/link`. CSS nema dodatne importe.
2. Nextov `server/app-render/create-component-tree.js:106` priprema NotFound i njegove stilove kao fallback u stablu rute.
3. `create-component-styles-and-scripts.js` dohvaća CSS iz manifesta i poziva `renderCssResource`; rezultat su stylesheet elementi s precedenceom.
4. U uključenom React RSC rendereru `react-server-dom-turbopack-server.node.development.js:373`, obrada `link` elementa s `rel="stylesheet"` poziva `preload(href, "style", ...)`. To objašnjava hint čak i za fallback element koji se serializira, ali se ne prikaže. Ovaj boundary helper ne prosljeđuje preloadCallbacks; nije nužno riječ o eksplicitnom Next `preloadStyle` callbacku za layout assets.
5. HTTPAccessFallbackBoundary prikazuje notFound tek kad postoji odgovarajući triggeredStatus. Na normalnoj stranici ostaju children, pa fallbackov stylesheet nije aktiviran.

Browserovo upozorenje odnosi se na unaprijed dohvaćeni resource koji nije ubrzo iskorišten kao stylesheet. Ne znači da nedostaje CSS za prikazanu normalnu stranicu; cijena je potencijalno nepotreban rani download 404 stilova.

## HTTP reprodukcija bez browser JavaScripta

| Server | Ruta | Status | 404 CSS |
|---|---|---|---|
| next dev, localhost:3000 | / | 200 | preload, as=style; bez aktivnog stylesheet linka za taj CSS |
| next dev, localhost:3000 | /audit-missing-page-928 | 404 | rel=stylesheet; renderirana 404 stranica |
| next start, localhost:3101 | / | 200 | preload, as=style; bez aktivnog stylesheet linka za taj CSS |
| next start, localhost:3101 | /audit-missing-page-928 | 404 | rel=stylesheet; renderirana 404 stranica |

Dev resource: `/_next/static/chunks/src_app_not-found_module_1lyfnlz.css`.
Production resource: `/_next/static/chunks/3n-hdymk6u8jo.css`; sadržaj je provjeren kao not-found CSS.

Production provjera koristila je već postojeći build `EPbqkG4ugkZUZO0XQvxPX` od 28. rujna 2026. Privremeni next start server zatim je zaustavljen. Novi build aktualnog working treeja nakon mrežnog retryja uspješno je kompajliran, ali typecheck zaustavlja postojeća greška `ProjectEventScheduleSection.tsx:25` (`string | null` nije `string`). Zato nije potvrđen next start potpuno novog builda. Typecheck nije isključen. Console warning nije zasebno snimljen u browseru; potvrđeni su njegovi resource/link preduvjeti i razlika normalne/404 stranice kroz HTTP odgovore.

## Isključeni aplikacijski uzroci

- Root layout importira globals.css i Inter; nema ručnog preload linka.
- Locale layout koristi notFound za neispravan locale, ali ne importira 404 CSS niti emitira resource hintove.
- Dashboard/public/auth/templates layouti nemaju ručne CSS preloadove; nema drugih not-found.tsx granica.
- Nisu pronađeni ručni preload/ReactDOM preload/next-head resource hintovi u aplikaciji.
- next.config.ts sadrži next-intl plugin, CDN image remotePattern i serverActions bodySizeLimit; nema CSS/preload overridea.
- Link prefetch može izazvati dodatna učitavanja ruta, ali ovaj konkretni preload već postoji u početnom HTTP HTML-u bez izvršavanja browser JS-a. Nije primarni uzrok.

## Izvorna odluka nakon audita (prije naknadnog odobrenja)

Bez runtime izmjena. Ne gasiti prefetch, ne prepravljati generirane asset linkove, ne seliti 404 CSS globalno samo radi utišavanja warninga i ne mijenjati 404 routing. Nalaz je potvrđeno ponašanje instaliranog frameworka, a ne tvrdnja o određenom upstream issueu ili verziji koja ga popravlja.
