# Includes - Header & Footer

Acest folder conține componentele reutilizabile pentru header și footer.

## Fișiere:

- **header.html** - Conținutul complet al header-ului (navigare, logo, contacte)
- **footer.html** - Conținutul complet al footer-ului (linkuri, contact, social)
- **loader.js** - Script care încarcă automat header-ul și footer-ul pe toate paginile

## Cum funcționează:

1. Pe fiecare pagină HTML, adaugă:
   ```html
   <script src="includes/loader.js"></script>
   ```

2. Înlocuiește tag-ul `<header>...</header>` cu:
   ```html
   <div id="header-placeholder"></div>
   ```

3. Înlocuiește tag-ul `<footer>...</footer>` cu:
   ```html
   <div id="footer-placeholder"></div>
   ```

## Avantaje:

- ✅ **O singură sursă de adevăr** - modifici header/footer o singură dată
- ✅ **Întreținere ușoară** - nu mai trebuie să actualizezi fiecare pagină
- ✅ **Consistență** - toate paginile au același header și footer
- ✅ **Actualizări rapide** - schimbări în header.html se aplică automat peste tot

## Cum să modifici header-ul sau footer-ul:

1. Deschide `includes/header.html` sau `includes/footer.html`
2. Fă modificările dorite
3. Salvează fișierul
4. Toate paginile vor avea automat noile modificări!
