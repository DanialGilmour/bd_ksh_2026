# Changelog

## Unreleased

- Translated the site, configuration, and documentation into English.
- Redesigned the experience: night-sky theme, gift-box intro, chat-window message, polaroid photo frame, and automatic fireworks at the big reveal. The original balloon animation is kept.
- Added interactive features: a scrollable scattered Polaroid memory wall with aesthetic tape & photo filters, poppable balloons with a live scoreboard & Web Audio pop sound, an interactive Islamic Du'a Lantern (Fanoos) that illuminates with Noor when tapped ("Illuminate & Say Aamiin") and automatically unlocks and opens the Secret Du'a Letter modal, 3D tilt on every Polaroid card, magic stardust cursor trail, and a live theme switcher (`🌙 / 🌸 / ✨`).
- Added optional `startTitle`, `startHint`, `startButtonLabel`, `photoCaption`, `galleryHint`, `continueButtonLabel`, `polaroids`, `cakePrompt`, `cakeWishGranted`, `letterButtonLabel`, `letterTitle`, `letterBody`, and `letterSignoff` fields.
- Fixed `npm run preview` ignoring its command-line arguments and Windows `npm.cmd` test spawning.

## 2.1.0-beta.1

- Added the repository-scoped `happy-birthday-maker` Codex Skill.
- Added a configuration schema, validation command, safe site generator, and localhost preview command.
- Added `classic`, `warm`, and `minimal` themes while keeping legacy configuration fields compatible.
- Modernized the Rspack build, bundled GSAP, and emitted a complete static `dist/` directory.
- Added tests, CI, security guidance, contribution guidance, and dependency automation.

## 2.0.0

- Added Rspack, font configuration, fireworks, and improved music controls.
