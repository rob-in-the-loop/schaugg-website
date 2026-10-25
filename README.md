# Tech & so — Website (Simon & Robin Schaugg)

Statische Website ohne Build-Schritt: `index.html`, `assets/styles.css`, `assets/main.js`.

## Lokal ansehen

Ordner öffnen und `index.html` im Browser starten – oder mit einem kleinen Server:

```sh
python3 -m http.server 8000
# dann http://localhost:8000
```

## Veröffentlichen

Den gesamten Ordner hochladen, z. B.:

- **Netlify / Cloudflare Pages:** Ordner per Drag & Drop hochladen, eigene Domain verbinden.
- **GitHub Pages:** Dateien in ein Repository legen, unter *Settings → Pages* den Branch aktivieren.
- **Eigenes Webhosting:** Dateien per FTP/SFTP ins Web-Verzeichnis kopieren.

## Vor dem Livegang ergänzen

Alle Platzhalter lassen sich mit der Suche nach `DOMAIN`, `PLATZHALTER`, `TODO` und `[` finden.

- [ ] Domain in `index.html` (canonical, og:url, JSON-LD), `robots.txt`, `sitemap.xml`
- [x] LinkedIn-URLs von Simon und Robin eingetragen
- [ ] E-Mail-Adresse im Kontaktbereich
- [x] Portrait Simon eingesetzt (`assets/simon.jpg`)
- [x] Portrait Robin eingesetzt (`assets/robin.jpg`)
- [x] YOLD- und NeuHier-Fotos eingesetzt (aus simonschaugg.de übernommen)
- [ ] Social-Vorschaubild `assets/og-image.jpg` (1200 × 630) und `og:image` einkommentieren
- [x] YOLD-Kennzahlen kommen live aus der Datenbank (`assets/yold-stats.js`, dieselbe Quelle wie yold.info und simonschaugg.de); nur „Begegnungen, die weiterwirken“ (41) ist statisch
- [x] Pressespiegel mit Links (aus simonschaugg.de/Presse.dc.html); neue Beiträge dort und hier im Abschnitt `#presse` ergänzen
- [ ] Kontaktformular: Versand in `assets/main.js` → `sendInquiry()` anbinden (DSGVO-konformer Dienst)
- [ ] Impressum und Datenschutzerklärung vollständig ausfüllen (rechtlich prüfen lassen)
- [ ] Google Fonts für DSGVO lokal einbinden (z. B. über google-webfonts-helper) statt vom Google-Server laden

## Animationen

- Hero: kurze Einblend-Sequenz beim Laden.
- Scroll: Abschnitte blenden sanft ein, die These „Technologie ist selten das eigentliche Problem.“ wird Wort für Wort hell, die Prozesslinie zeichnet sich, die Venn-Kreise bewegen sich aufeinander zu, Lesefortschritt unter dem Header, Kennzahlen zählen hoch.
- Umgesetzt mit CSS Scroll-driven Animations (Chrome, Edge, Safari 26+). Browser ohne Unterstützung (z. B. Firefox) zeigen die Seite vollständig, nur ohne Scroll-Effekte.
- Bei aktivierter Systemeinstellung „Bewegung reduzieren“ sind alle Animationen aus.

## Englische Version

Später als `/en/index.html` anlegen, `lang="en"` setzen und die `hreflang`-Links im `<head>` beider Seiten ergänzen.
