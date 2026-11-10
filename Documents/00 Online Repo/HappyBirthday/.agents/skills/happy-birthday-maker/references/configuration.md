# Configuration reference

`customize.json` remains the public configuration file. Existing text fields, `imagePath`, `music`, and `fonts` continue to work. Add an optional `theme` field with one of:

- `classic` — existing visual treatment and default.
- `warm` — softer celebration colors.
- `minimal` — reduced decorative density.

The recipient name should be assigned to `name`. Use `wishText` for the main message and `textInChatBox` for the short animated message.

Optional interactive fields are also supported:
- `startTitle`, `startHint`, `startButtonLabel` — intro gift card text.
- `photoCaption`, `galleryHint`, `continueButtonLabel` — Polaroid memory wall caption, scroll hint, and transition button.
- `polaroids` — array of `{ imagePath?, caption?, date?, filter? }` (`warm`, `vintage`, `dreamy`, `golden`, `rose`) for the scrollable scattered Polaroid wall.
- `cakePrompt`, `cakeWishGranted` — Du'a Lantern click prompt and post-illumination message.
- `letterButtonLabel`, `letterTitle`, `letterBody`, `letterSignoff` — secret Du'a letter modal content.

## Asset limits

| Asset | Supported types | Limit |
| --- | --- | --- |
| Image | PNG, JPEG, WebP, GIF | 10 MiB |
| Music | MP3, OGG, WAV, M4A | 25 MiB |
| Font | TTF, OTF, WOFF, WOFF2 | 10 MiB |

Use a local path inside the configuration directory whenever possible. Remote resources must be HTTPS. Do not use `data:`, `file:`, `javascript:`, relative parent paths, or arbitrary shell expressions.
