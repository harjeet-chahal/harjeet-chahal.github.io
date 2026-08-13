# harjeet-chahal.github.io

Personal portfolio with a "Zen Garden" design: off-white paper background whose light
shifts from morning to afternoon as you scroll, falling cherry-blossom petals and
birch leaves drifting behind frosted-glass cards, and thin, airy Inter typography.

**Live:** https://harjeet-chahal.github.io/

## Structure

| Path | Purpose |
|---|---|
| `index.html` | All content (hero, about, experience, projects, skills, education, contact) |
| `styles.css` | Design system: colors, glassmorphism, timeline, grids, responsive rules |
| `main.js` | Petal canvas, scroll-driven sky cross-fade, reveal-on-scroll, project filters, résumé menu |
| `images/` | Web-optimized photos (`profile.jpg`; the full-res original stays untracked) |
| `resume/` | Three tailored résumé PDFs: AI, ML, SWE (the site links the SWE one) |
| `Harjeet_Singh_Chahal_Resume_MSCS.pdf` | Legacy path kept alive for old links (copy of the SWE résumé) |

## Updating content

- **Résumés:** replace the PDFs in `resume/` (keep the same filenames), and refresh
  the legacy root PDF: `cp resume/Harjeet_Singh_Chahal_Resume_SWE.pdf Harjeet_Singh_Chahal_Resume_MSCS.pdf`
- **Projects:** edit the cards in `index.html` (`#projects`). Tags on each card
  (`data-tags="ml ai systems"`) drive the filter chips.
- **Everything else** is plain HTML in `index.html`.

## Local preview

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. There is no build step; GitHub Pages serves the repo as-is.

## Notes

- Animations respect `prefers-reduced-motion` (petals off, reveals instant).
- The petal canvas sits between the background and the content, so petals blur
  as they pass behind the frosted-glass cards.
