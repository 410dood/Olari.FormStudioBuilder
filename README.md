# RjsfFormBuilder

Mendix pluggable widget for building and rendering JSON Schema forms with RJSF.

## Latest Updates
- Added "Hide form title and description" toggle on the Document Output config panel to optionally exclude the title/description header from the generated PDF HTML.
- Extracted PDF document output styles into a standalone CSS file (`RjsfFormBuilder-pdf.css`) for use outside the widget. Add this file to your Mendix theme folder to style `resolvedPdfHtmlAttr` HTML rendered in external HTML element widgets.
- Fixed form data not restoring when reopening a previously saved form in viewer mode. Saved field values now correctly appear in form fields on reload.
- Added live form completion metrics as optional output attributes: `Field count`, `Required field count`, `Section count`, and `Completion percent` (0–100). Bind Integer attributes from your form entity to receive live-updating values usable in progress bars, conditional visibility, or microflows.
- Simplified the Layout toolbox to `Section (1 column)` and `Data grid (compact rows)`. Removed `Columns (2)`, `Columns (3)`, and `Collapsible panel` starters since columns can be adjusted after adding a section and every section already supports collapsing.
- New sections now default to collapsible (`Section collapsible` checked by default).
- Added `Show viewer header` so the full viewer header row can be shown or hidden from widget properties.
- Moved the Studio Pro preview placeholder for `Viewer header widget` to the top of the editor preview so it matches the runtime placement.
- Added a full PDF-output pipeline in the widget:
  - writes `resolvedPdfHtmlAttr` with print-ready HTML
  - supports optional `systemSectionHtmlJsonAttr` injection for system template sections
  - supports an optional viewer-side `Export PDF` action after refreshed HTML output is written
  - adds a top-level `Document Output` tab for full assembled print preview plus form-level PDF header/footer templates
- Added an optional `Viewer header widget` placeholder so Mendix content can render in the viewer header next to the save button.
- Viewer mode can now optionally render a left section-navigation panel that respects Studio Pro settings and shows section progress like `Energy Level: 1 of 2`.
- Viewer section navigation chips now highlight incomplete required sections in orange and remove the redundant per-field card list from the left panel.
- Viewer mode now has stronger section differentiation, `Expand all` / `Collapse all` controls, tighter runtime spacing, and textarea resizing locked to vertical so fields keep their container width.
- Repeatable array groups were rebuilt with clearer row cards, aligned add/remove/reorder controls, and an in-group `Field order` editor that supports both `Up` / `Down` moves and drag-and-drop ordering.
- Fixed checkbox rendering after the compact spacing pass by keeping dense spacing rules scoped to text-like inputs instead of boolean controls.
- Document Output templates now default to showing the field label and answer, with a `Reset to Default` action beside the `Template` editor for quick recovery after custom edits.
- Added first-pass datagrid support using RJSF v6 `LayoutGridField` for repeatable array groups:
  - new Layout toolbox starter: `Data grid (compact rows)`
  - new System template starter: `Active Medications`
  - repeatable-group toggle: `Use data grid row layout (RJSF v6 Layout Grid)`
  - keeps array add/edit/delete behavior while rendering row fields in a compact grid
- Moved section-specific settings into each section header `Section settings` menu in Live Preview:
  - `Section collapsible`, `Section collapsed by default`, `Allow viewer to hide/show this section`
  - `Section (name/title key)`, `Section order`, and `Section columns`
- Removed duplicate section controls from the right-side Properties panel to reduce UI clutter.
- Moved `Label display` directly under `Label` and compacted it into a single inline row.
- Added an inline tooltip for `Hide field output if empty`.
- Added section-level end-user visibility switching in Viewer mode, with hidden sections excluded from final document output.
- Added per-field document output controls for `Hide field output if empty` and `Allow viewer to hide/show this section`.
- Added per-field label controls for hide/show and label position override (default, above, in front).
- Added basic RTF-like support in document output templates (`\line`, `\par`, `\b`, `\i`, `\ul`).
- Added a dedicated field-level `Validation` panel in the Designer properties editor.
- Added numeric validation rules (`minimum`, `maximum`, `multipleOf`) for number/integer fields.
- Added text/email validation rules (`minLength`, `maxLength`, `pattern`) for string fields.
- Moved `Show layout tools` from in-widget toolbar UX to Studio Pro Designer settings.
- Added `Show section panel` Designer setting for section shortcut chips in the Components panel.
- Updated Designer/Behavior booleans to optional expression-based configuration with safe defaults when unset.
- Added token-aware document output templates and token preview support in the builder.
- Added mapped form-level metadata support for `title` and `description`.
- Fixed form-definition persistence issues when reopening previously saved forms.
- Added clickable `COMPONENTS` chips that smoothly scroll to the matching section in live preview.
- Improved section spacing, contrast, and visual differentiation in the designer.
- Added a `Calculated total` field type (RJSF-compatible) that can sum numeric answers from other fields.
- Added source-key configuration for totals in the Properties panel:
  - provide keys explicitly, or
  - leave blank to auto-sum all non-repeatable `number`, `integer`, `radio`, and `dropdown` fields.
- Total fields are emitted as read-only numeric fields in generated schema/uiSchema.
- Improved builder panel styling/alignment, including collapsible side panels.
- Fixed preview section/column title clipping (for example, leading character in `SECTION`).

## Datagrid Direction (Recommended Approach)
For structured clinical lists (Medications, Allergies, Diagnosis, Billing Codes, Drug Test), the recommended architecture is:

1. Use an array-of-objects model for row CRUD behavior (`Add/Edit/Delete`).
2. Use RJSF v6 `LayoutGridField` for compact row layout and column alignment.
3. Keep row identity fields (for example `id`) to support bidirectional Mendix sync on save.
4. Use template presets to stamp common system forms quickly, then let users edit fields.
5. Use row-level document output templates for compact final output strings (for example `2/18/2026 Client showed positive for BENZ, COC`).

Suggested implementation phases:
1. Core datagrid field model (schema/uiSchema + builder editing + preview/viewer behavior).
2. System templates (Active Medications, Active Allergies, Chart/Billing Diagnosis, Billing Codes, Most Recent Drug Test).
3. Document output row-template rendering and hide-if-empty behavior for rows.
4. Optional advanced behavior (row validation, source-specific template guards, audit metadata).

## System Template Widget Placeholders
How it renders now:

In widget properties, set any of:
- `activeMedicationsDatagrid2`
- `activeAllergiesDatagrid2`
- `chartDiagnosisDatagrid2`
- `billingDiagnosisDatagrid2`
- `activeBillingCodesDatagrid2`
- `recentDrugTestDatagrid2`

When that matching system template field is on the form, the configured Mendix widget renders inside that section in preview/viewer. If not configured, you see the placeholder card.

## Project Structure
- `src/`: source code and widget metadata used by Mendix widget tooling
- `dist/tmp/widgets/olari/rjsfformbuilder/`: generated runtime files produced by `npm run build` / `npm run release`
- `dist/`: build output generated by `npm run build` / `npm run release`
- `docs/`: supplemental project documentation

## Requirements
- Node.js 16+
- npm
- Mendix pluggable widget tooling (`@mendix/pluggable-widgets-tools`, installed via `npm install`)

## Setup
1. Install dependencies:
   `npm install`
2. Build once to verify setup:
   `npm run build`

## Scripts
- `npm run dev`: run web widget development build/watch
- `npm run build`: produce web widget build output in `dist/`
- `npm run release`: create release package output
- `npm run lint`: run lint checks
- `npm run lint:fix`: run lint checks with auto-fixes

## Release Output
With current version `0.1.16`, release creates:
- `dist/0.1.16/olari.RjsfFormBuilder.mpk`

## Mendix Tooling Config
`package.json` contains a `config` block used by Mendix widget tooling:
- `projectPath`
- `mendixHost`
- `developmentPort`

Update these values for your local Mendix environment before running dev workflows.

## More Docs
See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for a focused development and maintenance guide.
