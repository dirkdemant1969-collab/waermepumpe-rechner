# 🚀 Deinen Wärmepumpen-Rechner online stellen — Schritt für Schritt

Diese Anleitung bringt deinen Rechner ins Internet, unter einer eigenen Web-Adresse.
Du brauchst **kein** Programmierwissen. Plane etwa **30 Minuten** ein.

Wir benutzen **Vercel** — einen kostenlosen Dienst, der genau für so etwas gemacht ist.

---

## Was du bekommst

Am Ende hast du eine Adresse wie:
- `dein-projektname.vercel.app` (kostenlos, sofort)
- oder später `rechner.deinefirma.de` (deine eigene Wunsch-Adresse)

---

## Schritt 1: Den Projektordner herunterladen

Du hast von mir den Ordner **`waermepumpe-rechner`** bekommen.
Lade ihn herunter und merke dir, wo er auf deinem Computer liegt (z.B. im Ordner „Downloads").

**Wichtig:** Falls der Ordner als ZIP-Datei kommt → mit Rechtsklick „Entpacken" / „Alle extrahieren".

---

## Schritt 2: Kostenloses Konto bei GitHub anlegen

Vercel braucht einen „Zwischenspeicher" für deine Dateien. Dieser heißt **GitHub**.

1. Gehe auf **https://github.com**
2. Klicke oben rechts auf **Sign up**
3. E-Mail eingeben, Passwort wählen, Benutzername wählen → fertig
4. E-Mail bestätigen (Mail von GitHub öffnen, Link klicken)

> 💡 Merke dir E-Mail und Passwort gut — du brauchst sie gleich nochmal.

---

## Schritt 3: Den Ordner zu GitHub hochladen

1. Auf GitHub oben links auf das **+** klicken → **New repository**
2. Bei „Repository name" schreibst du: `waermepumpe-rechner`
3. Wähle **Public** (oder Private, beides geht)
4. Klick auf **Create repository**
5. Auf der nächsten Seite siehst du den Link **„uploading an existing file"** — klick darauf
6. Jetzt **ziehst du alle Dateien aus deinem Ordner** in das Browser-Fenster
   - ⚠️ **WICHTIG:** Ziehe den *Inhalt* des Ordners hinein, nicht den Ordner selbst.
     Also: `package.json`, `index.html`, `vite.config.js` UND den Unterordner `src`.
7. Unten auf den grünen Knopf **Commit changes** klicken

✅ Geschafft — deine Dateien liegen jetzt bei GitHub.

---

## Schritt 4: Bei Vercel anmelden

1. Gehe auf **https://vercel.com**
2. Klicke auf **Sign Up**
3. Wähle **„Continue with GitHub"** — damit verbindest du beide Konten automatisch
4. Erlaube Vercel den Zugriff (Knopf „Authorize")

---

## Schritt 5: Den Rechner veröffentlichen

1. In Vercel klickst du auf **Add New…** → **Project**
2. Du siehst dein `waermepumpe-rechner` aus GitHub → klick auf **Import**
3. Vercel erkennt automatisch, dass es eine Vite-/React-App ist.
   **Du musst nichts einstellen.** Lass alle Felder so wie sie sind.
4. Klick auf **Deploy**
5. Warte 1–2 Minuten ⏳ — Vercel baut deinen Rechner zusammen.

🎉 **Fertig!** Du siehst jetzt deinen Rechner und eine Adresse wie
`waermepumpe-rechner-xyz.vercel.app`. Diese kannst du sofort teilen.

---

## Schritt 6 (optional): Deine eigene Wunsch-Adresse

Wenn du `rechner.deinefirma.de` statt der `.vercel.app`-Adresse möchtest:

1. In Vercel: dein Projekt öffnen → oben auf **Settings** → links **Domains**
2. Deine Wunsch-Adresse eintippen, z.B. `rechner.deinefirma.de` → **Add**
3. Vercel zeigt dir dann **einen Eintrag** (einen sogenannten „CNAME"), den du
   bei deinem Domain-Anbieter (da wo du deine Website hast) eintragen musst.
4. Diesen Eintrag gibst du dort in die **DNS-Einstellungen** ein.

> 💡 Das ist der einzige etwas technische Schritt. Wenn du unsicher bist:
> Schick deinem Domain-Anbieter (oder mir) einfach den CNAME-Eintrag,
> den Vercel dir anzeigt — der Support kann das in 2 Minuten für dich eintragen.

---

## Änderungen später?

Wenn du den Rechner anpassen willst:
1. Neue `App.jsx` von mir herunterladen
2. Bei GitHub in deinem Repository die alte `src/App.jsx` ersetzen
   (Datei anklicken → Stift-Symbol → alten Inhalt löschen → neuen einfügen → Commit)
3. Vercel baut **automatisch** die neue Version. Nichts weiter zu tun.

---

## Wenn etwas hakt

- **„Build failed" bei Vercel?** → Meistens fehlt eine Datei beim Hochladen.
  Prüfe, ob `package.json`, `index.html`, `vite.config.js` und der `src`-Ordner
  (mit `main.jsx` und `App.jsx`) wirklich bei GitHub liegen.
- **Seite bleibt weiß?** → 2 Minuten warten und neu laden (F5).
- Bei Fragen: einfach den Fehlertext kopieren und mir schicken.

---

**Kosten:** Alles oben ist im kostenlosen Tarif von GitHub und Vercel enthalten.
Für einen Verkaufsrechner mit normalem Besucheraufkommen fallen **keine Gebühren** an.
