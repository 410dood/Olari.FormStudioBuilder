# Development Guide

## Build and Verify
1. Install dependencies:
   `npm install`
2. Run lint to catch syntax/style regressions before packaging:
   `npm run lint`
3. Run a build:
   `npm run build`
4. (Optional) Create release artifacts:
   `npm run release`

## Rename/Metadata Consistency
When renaming this widget, keep these in sync:
- `package.json` (`name`, `widgetName`, `mxpackage.name`, `mxpackage.mpkName`)
- `src/*.xml` widget id/module names
- `package.xml` and `src/package.xml` file references
- source file names under `src/` and generated runtime folder under `com/olari/widget/web/`

## Important Files
- `src/RjsfFormBuilder.tsx`: main runtime widget implementation
- `src/RjsfFormBuilder.editorPreview.tsx`: Studio Pro editor preview
- `src/RjsfFormBuilder.xml`: widget property model
- `src/package.xml`: Mendix widget package manifest source
- `docs/CODEX_KNOWLEDGE.md`: project-specific architecture, UX conventions, and document-output notes

## Typical Release Flow
1. Make code/metadata changes in `src/`.
2. Update `package.json`, `package.xml`, `src/package.xml`, `README.md`, `docs/CODEX_KNOWLEDGE.md`, and `RELEASE_NOTES.md` for the next version/behavior.
3. Update relevant `src/*.xml` property descriptions when the Studio Pro configuration surface changes materially.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Run `npm run release` for the widget packaging/publish-equivalent flow.
7. Validate generated output under `dist/`.
8. Commit source, metadata, and generated release changes.
9. Push to `origin/main`.

## Repository Notes
- Branch: `main`
- Remote: `origin` (`https://github.com/Olari-LLC/Mendix-RJSF-Form-Builder.git`)
