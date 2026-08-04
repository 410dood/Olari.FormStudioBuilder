# Repo Guidance

Read [docs/CODEX_KNOWLEDGE.md](docs/CODEX_KNOWLEDGE.md) before making non-trivial changes to this widget.

## Expectations
- This widget is private/internal to Olari. Project-specific terms, file names, and domain language are acceptable.
- Validate functional or styling changes with `npm run build`.
- Run `npm run release` only when the user explicitly asks for a release.
- When a release is requested, also update `README.md`, `docs/DEVELOPMENT.md`, `RELEASE_NOTES.md`, `package.json`, `package.xml`, and `src/package.xml`.

## Key Files
- `src/RjsfFormBuilder.tsx`: main builder/viewer runtime, schema generation, document-output logic.
- `src/ui/RjsfFormBuilder.css`: widget-owned styling for designer, preview, viewer, arrays, and panels.
- `src/RjsfFormBuilder.xml`: Mendix Studio Pro property model.
- `docs/CODEX_KNOWLEDGE.md`: project-specific architecture, conventions, and document-output notes.
