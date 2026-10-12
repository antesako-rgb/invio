# Prijelazne lokalne Storage definicije

Nema ručnog održavanja SQL Editor foldera. Novi postupak je u
[supabase/README.md](../../../supabase/README.md); Storage još nije prenesen u
kanonski schemas inventar. Ove lokalne datoteke zadržane su za pregled i
postojeće generatore/testove. NE izvršavaj CREATE/REVOKE/GRANT ponovno.
Trigger datoteke sadrže samo Storage dodatke, nisu potpuna definicija drugih triggera.

Claim koristi SQL022; signed objekti SQL021. Cron job prikazuje potvrđeni raspored, ne radi novu instalaciju. Read-only live catalog provjera 2026-10-08: 17 lokalnih funkcijskih tijela odgovara bazi; album helper dopunjen live exportom. Raniji regex nalaz povučen: izravna prosrc provjera potvrđuje ispravan regex.
