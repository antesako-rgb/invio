# Definicije za spremanje u SQL Editor

Jedna mapa po tablici kao u postojećoj organizaciji: table.sql, constraints.sql, indexes.sql, rls.sql, grants.sql, trigger.sql, verify.sql i funkcije. Ovo je predloženo konačno stanje nakon install paketa, ne stanje već instalirane baze. CREATE/ALTER/GRANT definicije spremi za pregled, nemoj ih ponovno izvršavati. Samo verify.sql je read-only.

Postojeće invitation_guests: novi project_guest_id, tri constraints, person trigger, izmijenjeni create/update/delete RPC-i. Postojeći ID, recipient/group/primary i timestamp ponašanje ostaju. rsvp_response_guests: samo dodatni composite UNIQUE. rsvp_responses: get_public_rsvp output/definicija ostaje isti. invitation_recipients i invitation_guest_groups: prikazane neizmijenjene definicije radi orijentacije; installer ih ne kreira niti resetira prava.

seating_templates je nova tablica za admin katalog; member SELECT samo aktivnih, template write samo postgres/service_role, copy RPC member-autoriziran.
