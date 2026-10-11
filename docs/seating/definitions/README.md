# Definicije za spremanje u SQL Editor

Jedna mapa po tablici kao u postojećoj organizaciji: table.sql, constraints.sql, indexes.sql, rls.sql, grants.sql, trigger.sql, verify.sql i funkcije. Ovo je predloženo konačno stanje nakon osnovnog install paketa 001–004 i nadogradnje 006. Osnovni model već je instaliran; 006 još nije izvršen na live bazi od strane agenta. CREATE/ALTER/GRANT definicije spremi za pregled, nemoj ih ponovno izvršavati. Samo verify.sql je read-only.

Postojeće invitation_guests: novi project_guest_id, tri constraints, person trigger, izmijenjeni create/update/delete RPC-i. Postojeći ID, recipient/group/primary i timestamp ponašanje ostaju. rsvp_response_guests: samo dodatni composite UNIQUE. rsvp_responses: get_public_rsvp output/definicija ostaje isti. invitation_recipients i invitation_guest_groups: prikazane neizmijenjene definicije radi orijentacije; installer ih ne kreira niti resetira prava.

seating_templates je nova tablica za admin katalog; member SELECT samo aktivnih, template write samo postgres/service_role, copy RPC member-autoriziran.


006 dodaje seating_assignments.seat_number, range/unique constraints, private assignment helper/guard i public.assign_seating_guest_to_seat. public.assign_seating_guest je kompatibilni wrapper; seating_tables dobiva private.seating_table_seat_guard i trigger. manage_seating_table tijelo nije promijenjeno: novi guard štiti postojeći UPDATE. Grants i verify u obje mape usklađeni su s nadogradnjom. Ostale definitions ostaju kakve jesu.

Za već instaliranu bazu izvršava se samo [006 paket prema install README-u](../install/README.md), nikada CREATE/ALTER definicije pojedinačno. Originalni INSTALL_ALL_REVIEW.sql namjerno ostaje početni 001–004 paket; nije proširen ni ponovno izvršen. Nakon korisnikove instalacije i verifyja regenerirati DB tipove.
