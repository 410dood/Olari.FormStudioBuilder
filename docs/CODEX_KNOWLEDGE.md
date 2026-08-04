# Codex Project Knowledge

## Purpose
`RjsfFormBuilder` is a Mendix pluggable widget that does two jobs:

1. Designer mode: build and edit JSON-schema-driven forms inside the widget.
2. Viewer mode: render those forms at runtime with the same section/group structure and widget-owned styling.

The project is private/internal, so project-specific Olari language is fine.

## Primary Files
- `src/RjsfFormBuilder.tsx`
  Single main implementation file. It owns form definition normalization, schema/uiSchema generation, preview/viewer rendering, document output resolution, token preview, repeatable groups, and builder-side editing UI.
- `src/ui/RjsfFormBuilder.css`
  Single widget-owned stylesheet. Most visual regressions are here.
- `src/RjsfFormBuilder.xml`
  Studio Pro property model and design-time configuration surface.
- `README.md`, `docs/DEVELOPMENT.md`, `RELEASE_NOTES.md`
  Keep these aligned when behavior changes materially or a release is cut.

## Current UX/Architecture Conventions

### Builder vs Viewer
- Designer mode exposes palette/components/properties/preview panels based on widget settings.
- Viewer mode is intentionally read-only except for actual form interaction and section visibility toggles.
- Viewer can optionally show the left navigation panel when `showComponentsPanel` is enabled in Studio Pro.
- Viewer section chips must still respect `showSectionPanel`.
- Viewer left navigation is section-only now; do not reintroduce the old per-field card list unless explicitly requested.
- Viewer section chips show progress counts and should warn when required fields in that section are still incomplete.
- Viewer header can host an optional Mendix widget slot next to the Save button (`viewerHeaderWidget`).
- Viewer header visibility is separately controlled by `showViewerHeader`; when it is off, the whole header row is hidden.

### Styling
- Prefer widget-owned CSS over bootstrap/RJSF defaults.
- Dense vertical spacing in viewer/preview is intentional. Avoid generic `input` rules that accidentally affect checkboxes/radios.
- Repeatable array groups use custom row/card templates. Do not fall back to stock RJSF array markup unless there is a strong reason.

### Repeatable Groups
- Repeatable array groups are modeled as arrays of objects.
- Ordering of fields inside a repeatable group is group-local and now supports drag-and-drop in the properties panel.
- Row add/remove/reorder UI should remain aligned in the widget template, not delegated to default RJSF controls.

## Document Output Model

### Current Behavior
- Document output is resolved per field/component.
- The widget also assembles a full print-ready HTML document for PDF export and stores it in `resolvedPdfHtmlAttr`.
- Default field template is:

```text
{field_key_label}:
{field_key}
```

- Explicit custom templates override the default.
- `Reset to Default` works by clearing the explicit template and falling back to generated defaults.
- `systemDatagrid2` fields do not emit document text directly; they render configured Mendix widget slots in preview/viewer only.
- `datagrid` fields evaluate the template once per row and join row snippets together.
- `Hide field output if empty` suppresses blank field output.
- Section visibility (`__sectionVisibility`) is respected when composing final document output.
- System-template PDF content can be injected from `systemSectionHtmlJsonAttr`.
- The builder has a top-level `Document Output` tab for the assembled print preview plus form-level PDF header/footer templates.

### Token Sources
- Form tokens are generated automatically for each field:
  - `{fieldKey}`
  - `{fieldKey_label}`
  - `{formtitle}`, `{formdescription}`
- Runtime context tokens can come from:
  - `tokenContextJsonAttr`
  - `tokenContextSource`
  - `tokenCatalogSchemaJsonAttr` for builder-side token discovery/catalog UX
- Context tokens override form tokens on key collision.
- Computed tokens currently include:
  - `__currentdate` / `__today`
  - `__currenttime` / `__nowtime`
  - `__currentdatetime` / `__now`

### Rendering Rules
- `{token}` and `{%token%}` HTML-escape values.
- `{!token!}` injects raw HTML.
- Basic RTF-like formatting is supported:
  - `\line`, `\par`
  - `\b`, `\i`, `\ul`
  - limited color-table parsing

## Recommended Direction For Document Output

### Keep The Existing Per-Field Template
This is the right primitive. It keeps the builder understandable and lets form admins override only the fields that need custom phrasing.

### Add Optional Higher-Level Composition Later
If document output needs to become more narrative, the next useful layer is not replacing field templates. It is adding optional wrappers:
- Form header template
- Section header template
- Section separator / spacing rule
- Form footer template

That would allow:
- default field output for most fields
- narrative wrappers around sections
- better control of blank lines and section titles

### Presets Would Help More Than More Syntax
Useful preset templates:
- `Label + answer` (default)
- `Label: answer` inline
- `Answer only`
- `Bullet item`
- `Section narrative`
- `Datagrid compact row`

This is likely higher-value than introducing a full logic language.

### Be Careful With Logic/Conditionals
Avoid adding a large templating language unless there is a clear need. The current token model is easy to explain. If conditionals become necessary, prefer a very small helper model such as:
- emit only when token has value
- optional prefix/suffix behavior

Do not jump straight to Handlebars-class complexity unless the project actually needs nested loops/branching.

### Suggested Future UX
- Add a form-level “Final document preview” panel that shows the fully assembled output, not just field-level token preview.
- Consider a section-level document output setting that can optionally include/exclude the section title.
- For datagrids/repeat groups, consider row-template presets with one-click starters.

## Release/Verification Workflow
- Normal verification: `npm run build`
- Release packaging: `npm run release`
- When releasing, keep version and docs aligned:
  - `package.json`
  - `package.xml`
  - `src/package.xml`
  - `README.md`
  - `docs/DEVELOPMENT.md`
  - `RELEASE_NOTES.md`

## Current Project Decisions Worth Preserving
- Viewer spacing is intentionally tighter than early versions.
- Viewer can optionally render the left section-navigation panel.
- Viewer left navigation should stay section-focused with completion/warning chips, not a field inventory.
- Textareas should resize vertically only.
- Repeatable groups use widget-owned array templates and row action layout.
- Checkbox styling must stay isolated from dense text-input rules.
