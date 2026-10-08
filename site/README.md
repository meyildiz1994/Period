# nilemy.com

The landing page: one screen, no scroll, Turkish and English (follows the browser, TR | EN switch).

- `index.html` is self-contained (inline CSS/JS, the logo inlined as SVG). Fonts come from Google Fonts.
- `assets/screens/` are real app screens (390×797 pt at 2×, under a drawn status bar). Regenerate them from a web export of the app when the app's look changes.
- The store buttons are marked "Yakında / Soon" and go nowhere. When the app is live, replace them with Apple's and Google's official badges and links.
- `CNAME` holds the custom domain. `.github/workflows/site.yml` publishes this folder with GitHub Pages on every change to `main`.
