# HappyBirthday 🎉

A configurable birthday surprise microsite built with HTML, CSS, and JavaScript. The recipient opens a gift box and gets a short animated story: a greeting, a message being typed, a few heartfelt lines, a big reveal with their photo, rising balloons, and fireworks.

## Personalize it in 2 minutes

Everything the recipient reads lives in [`customize.json`](./customize.json). The fields you'll most likely want to change:

| Field | What it is |
| --- | --- |
| `name` | The recipient's name, shown as "Hey **name**". |
| `greetingText` | The line under the greeting. |
| `textInChatBox` | The message that types itself in the chat window. |
| `text2` … `text5Content` | The short story lines before the big reveal. |
| `imagePath` | Their main photo (e.g. `img/photo.jpg`). Square-ish photos look best. |
| `photoCaption` | The handwritten caption under the main photo. |
| `polaroids` | An array of scattered Polaroid cards (`{ imagePath, caption, filter, badge, tilt, offsetX }`) shown in the scrollable memory wall. |
| `wishHeading` / `wishText` | The main heading (e.g. `"Barakallahu Fi Umrik!"`) and your Du'a / blessing. |
| `cakePrompt` / `cakeWishGranted` | The prompt below the interactive Du'a Lantern (Fanoos) and the message shown once the lantern is illuminated. |
| `letterButtonLabel` / `letterTitle` / `letterBody` / `letterSignoff` | The secret Du'a letter modal that automatically pops open after illuminating the lantern and saying Aamiin. |
| `outroText` / `replayText` | The closing lines. |
| `startTitle` / `startHint` / `startButtonLabel` | The intro screen with the gift box. |
| `music` | Background music (MP3/OGG/WAV/M4A). |
| `theme` | `classic` (night sky, default), `warm` (soft cream and pink), or `minimal`. |

Then validate your changes:

```bash
npm run validate -- --config customize.json
```

## Local development

Requires Node.js 20 or later.

```bash
npm ci
npm run dev
```

Build and verify the deployable site:

```bash
npm run build
npm run check-dist
npm run preview -- --site .
```

Then open http://127.0.0.1:4173.

## Asset rules

For local assets, use PNG/JPEG/WebP/GIF images up to 10 MiB, MP3/OGG/WAV/M4A audio up to 25 MiB, and TTF/OTF/WOFF/WOFF2 fonts up to 10 MiB. Remote resources must use HTTPS. The validator rejects dangerous protocols and paths that escape the configuration directory.

The design loads its typefaces (Playfair Display, Dancing Script, Quicksand) from Google Fonts. Without a network connection the page falls back to system fonts. To use a custom font, add it to `fonts` in `customize.json`.

## Create a separate personalized site

Put your configuration and optional local assets in one directory, then run:

```bash
npm run create -- --config ./my-birthday/customize.json --output ./generated/avery-birthday
npm run preview -- --site ./generated/avery-birthday
```

The generator never overwrites an existing directory. It copies local assets into the generated project, builds `dist/`, and does not deploy or read credentials. Deploy `generated/avery-birthday/dist/` manually to GitHub Pages, Netlify, Vercel, or another static host.

## Use the agent Skill

When running an agent from this repository, invoke:

```text
$happy-birthday-maker Create a warm birthday page for Avery using ./photo.png and ./song.mp3.
```

The Skill is stored in `.agents/skills/happy-birthday-maker/`. It treats local assets and user text as data, writes only to a new directory, and asks before retaining an external HTTPS resource. It does not deploy, upload assets, read secrets, or call any external API.

## Contributing and security

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before sending a reusable upstream change. Keep personal content in your own fork. See [SECURITY.md](./SECURITY.md) for reporting and trust-boundary guidance.

This project is derived from [faahim/happy-birthday](https://github.com/faahim/happy-birthday) and preserves its MIT license and attribution.
