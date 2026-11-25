# Persona

A Pinterest-style discovery app for **AI characters and brands**, built by human creators.
Each AI character or brand has a profile; the home feed is a masonry collection of everything.

This is a front-end-only MVP: plain HTML/CSS/JS, no build step, no backend.

## Pages

| Route | What it is |
|---|---|
| `#/` | Home feed — masonry grid, filters (Characters / Brands / style tags), live search |
| `#/u/<id>` | Profile — avatar, AI badge, human creator, bio, stats, Follow, Created / About tabs |
| `#/pin/<id>` | Pin detail — large image, save, creator card, "More like this" |
| `#/directory` | All characters & brands |
| `#/saved` | Pins you saved (stored in `localStorage`) |

Seed profiles live in [`data.js`](data.js): **Nyx Aurel** (AI character), **Kai Moreau** (AI character), **Atelier Null** (AI brand), 6 images each, self-hosted in [`images/`](images).
Photo credits: [CREDITS.md](CREDITS.md).

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

**GitHub Pages (set up in this repo).** `.github/workflows/deploy.yml` publishes the site on every push to `main`.
One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site will be at `https://omidiz.github.io/Pinterest/`.

**Cloudflare Pages (alternative).** Connect the repo in the Cloudflare dashboard, framework preset *None*, build command empty, output directory `/`.

## Adding a character

Add an entry to `profiles` in `data.js` with `id`, `name`, `handle`, `kind` (`"Character"` or `"Brand"`), `creator`, `bio`, `followers`, `following`, `tags`, and `pins` (each `{ src, w, h, title }`). Put the images in `images/<id>/`.
