# So7o Brut

A display typeface cut out of one image. Five cuts, 102 glyphs, no curves — every
form is a polygon of rectangles and 45° chamfers.

**[Browse the specimen →](https://jan5o7o.github.io/so7o-brut/)** ·
**[Type with it →](https://jan5o7o.github.io/so7o-brut/type.html)**

| cut | what changes | file |
|---|---|---|
| Slab | chamfered 45° corners | `fonts/So7oBrutSlab-Regular.ttf` |
| Square | hard 90° corners | `fonts/So7oBrutSquare-Regular.ttf` |
| Condensed | 80% width | `fonts/So7oBrutCondensed-Regular.ttf` |
| Wide | 125% width | `fonts/So7oBrutWide-Regular.ttf` |
| Light | stem 166 instead of 210 | `fonts/So7oBrutLight-Regular.ttf` |

All five in one file: [`download/so7o-brut-fonts.zip`](download/so7o-brut-fonts.zip).

## What this repo is

The published half of the project: the specimen and the type page, plus the fonts
they need. The generator that draws the glyphs, the poster maker and the SVG
maker live in a private repo, so this tree is generated — `fonts/`, `assets/glyphs.json`
and the `@font-face` block in `assets/site.css` come out of `python3 build.py`
there, and `MANIFEST.sha256` records what was published.

## Using it

```html
@font-face {
  font-family: "So7o Brut Slab";
  src: url("https://jan5o7o.github.io/so7o-brut/fonts/So7oBrutSlab-Regular.ttf") format("truetype");
  font-display: block;
}
.headline { font-family: "So7o Brut Slab", Impact, sans-serif; }
```

The five CSS families are `So7o Brut Slab`, `So7o Brut Square`,
`So7o Brut Condensed`, `So7o Brut Wide`, `So7o Brut Light`. Lowercase is mapped
onto the capitals: the face is unicase. There is no kerning table in the file and
no italic; the family has one weight per cut.

## Licence

Fonts: SIL OFL 1.1, Reserved Font Name **So7o Brut** — see [LICENSE.md](LICENSE.md)
and [OFL.txt](OFL.txt). Site code: MIT.

## Credit

The T, E, A and M skeletons were measured from the TEAM wordmark
(`assets/team-source.jpg`). Everything else — the rest of the alphabet, the
digits, the punctuation, the light cut — was drawn for So7o Brut.
