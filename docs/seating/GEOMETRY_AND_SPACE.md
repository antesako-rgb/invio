# Geometrija i objekti prostora

## Jedinice

x_cm/y_cm su centar objekta u centimetrima, ishodište prostorije gore lijevo. X raste desno, Y dolje. Width/height su dimenzije prije rotacije. Rotation_deg je u smjeru kazaljke na satu oko centra. SQL i TS koriste isti AABB rotiranog pravokutnika: halfX=(|cos|*width+|sin|*height)/2, halfY=(|sin|*width+|cos|*height)/2. Za round obje poluosi su radius i ne ovise o rotaciji. Tolerancija za trig rounding je 0.0000001 cm. Cijeli objekt mora stati u prostoriju, ne samo centar. Shrink prostorije provjerava svaki rotirani stol istim pravilom.

Primjeri predložaka koriste centre. Renderer koristi center origin/pivot; x/y ne predstavlja kut. U editoru stolovi imaju standardnu geometriju, pomicanje i rotaciju. Okrugli čuvaju promjer, pravokutni počinju kvadratom s 8 mjesta i od 9. mjesta produljuju lokalnu širinu prema kapacitetu uz nepromijenjenu dubinu. Stolice su centrirane na svakoj stranici s jednakim razmacima između njih i od krajeva; najviše dvije su na svakom kratkom kraju. Uspravni natpis računa veličinu iz kraće stranice, bez promjene fonta pri rotaciji. Slobodni resize stolova uklonjen je; postojeće različite dimenzije mogu se izričito ujednačiti uz istu provjeru rotiranih granica. Width/height ostaju u modelu za predloške, standardne veličine i tu provjeru.

## Predlošci

DB katalog sprema prostoriju i stolove; copy RPC stvara neovisni plan. Trenutačni version 1 template validator namjerno odbija dodatna polja. Ulaz/podij/pozornica trenutno se ne mogu spremiti u template JSON kao da su stolovi.

## Ulaz, podij i pozornica

Za njih je predviđen zaseban seating_elements sloj: id, project_id, plan_id, kind (entrance/dance_floor/stage), name i center x/y, width/height, rotation. Nemaju capacity, sudionike ni seating assignments. Composite FK veže element na isti projekt/plan; plan deletion cascade, member SELECT i autorizirani revision RPC upisi kao stolovi. Ista geometrija pravokutnika vrijedi i za njih. Ulaz je oznaka unutar tlocrta, ne model otvora u zidu ili građevinske geometrije.

U template document version 2 dodali bismo elements niz, a copy RPC atomskim postupkom kopirao i stolove i elemente s novim ID-evima. V1 dokument ostaje podržan kao elements=[]; ne mijenjati značenje već postojećeg version 1. Podržat ćemo te objekte ovim odvojenim modelom, ali schema/RPC/editor za elements nisu dio trenutačnog install paketa. Nema lažnih stolova s kapacitetom 0. Ovaj dokument definira sljedeću doradu; ne tvrdi da je već implementirana.
