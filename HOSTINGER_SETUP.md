# Uppladdning till Hostinger — steg för steg

Hela sajten (publik sida + bokningssystem + admin) ligger nu i en zip-fil som
du laddar upp till Hostinger. Databasen är redan skapad åt dig.

---

## 1. Ladda upp zip-filen

1. Logga in på **hPanel** (hpanel.hostinger.com).
2. Gå till **Files → File Manager**.
3. Öppna mappen **`public_html`**.
4. Om det ligger gamla filer där (t.ex. en `default.php` eller Hostingers
   startsida) — markera och radera dem först.
5. Klicka på **Upload** (uppåtpilen uppe till höger) och välj
   `sepehr-designs.zip`.
6. När filen syns i listan: **högerklicka på den → Extract** (Packa upp).
   Välj att packa upp i samma mapp (`public_html`).
7. Radera själva zip-filen efteråt (den behövs inte längre).

Nu ska `public_html` innehålla: `index.html`, `style.css`, `script.js`,
`config.php`, `.htaccess`, samt mapparna `api/` och `admin/`.

> **Obs:** `.htaccess` börjar med en punkt och kan vara dold. Slå på
> "Show hidden files" i File Manager-inställningarna om du vill se den.

---

## 2. Testa att sajten fungerar

Öppna: **https://sandybrown-spoonbill-276023.hostingersite.com**

- Sajten ska visas precis som tidigare.
- Klicka **Book a Call** → du ska scrollas ner till bokningssektionen.
- Välj ett datum → lediga tider (12:00–18:00) ska dyka upp.
- Gör en testbokning med din egen mejladress.

Om tiderna inte laddas: se felsökning längst ner.

---

## 3. Sätt ditt admin-lösenord (görs en gång)

1. Öppna:
   ```
   https://sandybrown-spoonbill-276023.hostingersite.com/admin/?setup=mFf5zDMEeTQqsNUm4EggnB5rVkmJUJZ9DU9ciQLL
   ```
2. Välj ett lösenord (minst 10 tecken) och upprepa det.
3. Klicka **Create password**.

Klart. Från och med nu loggar du bara in på `/admin/` med ditt lösenord —
setup-länken slutar fungera automatiskt så fort lösenordet är satt.

**Kom ihåg lösenordet.** Skulle du glömma det: radera raden i tabellen
`admin_user` via hPanel → Databases → phpMyAdmin, så kan du köra
setup-länken igen.

---

## 4. Slå på mejlnotiser (valfritt, men rekommenderat)

Bokningar fungerar direkt — men du får inget mejl förrän du gör det här.

1. Skapa ett konto på **resend.com** med **sepehrrajaiyan@gmail.com**.
2. Gå till **API Keys → Create API Key**, kopiera nyckeln.
3. I hPanel File Manager: öppna **`config.php`**, hitta raden
   ```php
   const RESEND_API_KEY = '';
   ```
   och klistra in nyckeln mellan apostroferna:
   ```php
   const RESEND_API_KEY = 're_xxxxxxxxxxxx';
   ```
4. Spara filen.

**Viktigt om Resend:** utan en verifierad egen domän kan avsändaren
`onboarding@resend.dev` bara leverera till den mejladress ditt Resend-konto är
registrerat med. Eftersom notiserna går till samma adress
(sepehrrajaiyan@gmail.com) fungerar det direkt.

---

## Vad som redan är klart

- **Databasen** `u435079708_bookings` är skapad och kopplad till din domän.
  Inloggningsuppgifterna ligger i `config.php`. Vill du byta lösenord gör du
  det i hPanel → Databases, och uppdaterar sedan `DB_PASS` i `config.php`.
- **Tabellerna** skapas automatiskt första gången någon öppnar sajten — du
  behöver inte importera någon SQL.
- **Dubbelbokning** är omöjlig: databasen har en unik regel på
  datum + tid. Två personer som bokar exakt samma tid samtidigt → bara den
  första går igenom, den andra får "den tiden togs precis".
- **Avbokade tider blir lediga igen** och kan bokas av någon annan.

---

## Säkerhet — hur det hänger ihop

- `config.php` innehåller databaslösenord och API-nyckel. Den filen körs av
  PHP och skickas **aldrig** till besökarens webbläsare. `.htaccess` blockerar
  dessutom direkt åtkomst till den.
- Admin-lösenordet sparas **aldrig i klartext** — bara som en bcrypt-hash i
  databasen.
- Inloggningen sker helt på servern (PHP-session). Ingen kan komma åt
  bokningar genom att ändra JavaScript i webbläsaren — sidan skickar inte ut
  någon bokningsdata alls förrän sessionen är verifierad.
- Alla databasanrop använder förberedda frågor (skydd mot SQL-injektion), och
  all text som visas escapas (skydd mot XSS).
- Admin-sidan är märkt `noindex` så den inte hamnar i Google.

---

## Felsökning

**"Could not load times" i bokningsformuläret**
Öppna `https://din-sajt.se/api/availability.php?date=2026-10-01` direkt i
webbläsaren. Får du JSON med tider är backend igång. Får du ett felmeddelande
är det oftast databasuppgifterna i `config.php` — kontrollera
`DB_NAME`, `DB_USER` och `DB_PASS` mot hPanel → Databases.

**Databasfel**
Står det att servern inte kan nås, prova att byta
```php
const DB_HOST = 'localhost';
```
till
```php
const DB_HOST = 'srv2292.hstgr.io';
```

**Admin-sidan visar "First-time setup" trots att du satt ett lösenord**
Då kunde den inte nå databasen — se punkten ovan.

---

## Om du senare vill samla in telefonnummer

Bokningsformuläret frågar i dag efter namn, mejl och meddelande — inte
telefonnummer. Databasen och admin-vyn har redan en kolumn för telefon
förberedd (visas som "—" så länge). Säg till så lägger jag till fältet i
formuläret.
