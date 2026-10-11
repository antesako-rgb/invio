# Definicije za spremanje u SQL Editor

Najnovije definicije uključuju `invitation_attendance_overrides` i `set_invitation_guest_attendance`, atomski `include_generic_seating_guest` te ažurirani `sync_seating_rsvp_guests` koji daje prednost ručnoj odluci. Grupe koriste postojeće tablice pozivnice. Za korisnikovu već postavljenu, naknadno ispražnjenu bazu slijedi [ATTENDANCE_AND_GROUPS.md](../ATTENDANCE_AND_GROUPS.md). Stari RSVP setup/verify ostaje zamrznut na prethodnoj verziji, a novi generator čita aktualne definicije.

Jedna mapa po tablici kao u postojećoj organizaciji: table.sql, constraints.sql, indexes.sql, rls.sql, grants.sql, trigger.sql, verify.sql i funkcije. Ovo je predloženo konačno stanje nakon osnovnog install paketa 001–004 i nadogradnje 006. Osnovni model već je instaliran; 006 još nije izvršen na live bazi od strane agenta. CREATE/ALTER/GRANT definicije spremi za pregled, nemoj ih ponovno izvršavati. Samo verify.sql je read-only.

Postojeće invitation_guests: novi project_guest_id, tri constraints, person trigger, izmijenjeni create/update/delete RPC-i. Postojeći ID, recipient/group/primary i timestamp ponašanje ostaju. rsvp_response_guests: samo dodatni composite UNIQUE. rsvp_responses: get_public_rsvp output/definicija ostaje isti. invitation_recipients i invitation_guest_groups: prikazane neizmijenjene definicije radi orijentacije; installer ih ne kreira niti resetira prava.

seating_templates je nova tablica za admin katalog; member SELECT samo aktivnih, template write samo postgres/service_role, copy RPC member-autoriziran.


006 dodaje seating_assignments.seat_number, range/unique constraints, private assignment helper/guard i public.assign_seating_guest_to_seat. public.assign_seating_guest je kompatibilni wrapper; seating_tables dobiva private.seating_table_seat_guard i trigger. manage_seating_table tijelo nije promijenjeno: novi guard štiti postojeći UPDATE. Grants i verify u obje mape usklađeni su s nadogradnjom. Ostale definitions ostaju kakve jesu.

Za već instaliranu bazu izvršava se samo [006 paket prema install README-u](../install/README.md), nikada CREATE/ALTER definicije pojedinačno. Originalni INSTALL_ALL_REVIEW.sql namjerno ostaje početni 001–004 paket; nije proširen ni ponovno izvršen. Nakon korisnikove instalacije i verifyja regenerirati DB tipove.


007 dodaje [seating_assignments/public.assign_seating_guests.sql](seating_assignments/public.assign_seating_guests.sql) i odgovarajući grant. Za izvršavanje koristiti numbered 007 instalaciju, ne definitions. Tablice, constraints i postojeći 006 RPC-i ostaju kompatibilni; nema guest backfilla. [BULK_SEATING.md](../BULK_SEATING.md) opisuje aktualni frontend.


008 dodaje seating_assignments/public.assign_seating_guests_to_seats.sql i grants/verify. Samo funkcija za ručni grupni odabir, bez tablica ili data migration. Instalacija ide kroz numbered 008 skriptu nakon 007.

Završni model za automatski RSVP tok dodaje privatnu [seating_rsvp_exclusions/table.sql](seating_rsvp_exclusions/table.sql), mijenja [manage_seating_participant](seating_plan_guests/public.manage_seating_participant.sql) bez promjene javnog potpisa i dodaje [sync_seating_rsvp_guests](seating_plan_guests/public.sync_seating_rsvp_guests.sql). Grants/verify usklađeni su u seating_plan_guests. Ovo je konačno stanje nakon [postave na zadržanim praznim tablicama](../RSVP_FLOW.md), a ne migracija/backfill gostiju. Originalni 001–008 paketi ostaju povijesni početni/kompatibilni paketi i ne izvršavaju se ponovno. Definitions se spremaju za pregled; postojeća baza dobiva cijeli APPLY_EMPTY_RSVP_MODEL jednom nakon preflighta.
