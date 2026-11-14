## 0.12.0 (designer: Check, rules in plain words, Preview as, edge resize)
Designer only; the viewer (portal, signing, staff document editor) is unchanged. All four are view state: nothing new is saved in the definition.
- NEW: **Check.** A Check button next to Save runs the checks on the form as it stands: duplicate field key, a choice (dropdown / radio) with no options, a visibility rule whose source field is not on the form, and a `{prefix.token}` that is not in the token catalog (with "Did you mean ..." when a close match exists; skipped when no token catalog is loaded). A red "N problems" pill with previous / next steps through them; a green "No problems" pill when clean. Each problem shows as a red message and outline on its field, and in a new Problems list in the right panel (click an entry to select the field). Check opens that list and jumps to the first problem. Save is never blocked; saving also turns the marks on.
- NEW: **Rules in plain words.** A field with a visibility rule shows a chip such as `Shown when "Has allergies" is Yes` (every operator in words; several rules read "... and 2 more", or "or" in any-mode). A field that other fields read shows "Controls N fields". Selecting a field outlines the field(s) it reads from (dashed amber, "Source of the selected field") and the fields that read it (dashed blue, "Depends on the selected field"). The right panel has a new Logic list with every rule as a sentence; a rule whose source is gone says "(missing)". Click an entry to select the field.
- NEW: **Design | Preview** at the top of the canvas, and the existing Preview tab uses the same preview. Preview has Desktop | Phone width (a 390 px device frame that really switches to the narrow `fs-formpane` layout), "Preview as" (Staff filling it in / Client, signing mode = staff-only questions left out exactly as with audience "client" / Printed output = the PDF document output for the answers given) and Start again. Answers given in Preview are local to the designer: they are no longer written to the form data attribute (the old Preview tab did write them). The Document Output preview prints the Preview answers once there are any.
- NEW: **Resize by the right edge.** Each field in the designer has an edge handle (`role="slider"`): drag to snap to third (4/12), half (6/12) or full (12/12) by how far across the row the pointer is (with "Snap to resize" off it follows the pointer in single columns); a badge shows the width while dragging; ArrowLeft / ArrowRight step third, half, full. The width is applied on release, so a drag is one undo step, and it is the same `columnSpan` that is saved in the definition (the handle's `aria-valuetext` and the JSON Editor show it; there is no separate Properties control for a field's width). An existing finer width (for example 8/12) is left alone unless you drag or step it. This replaces the corner grip on fields; section column grips are unchanged.
- FIX (found in the browser test): the Desktop preview frame shrank to its content (about 400 px in a 614 px canvas, almost the same as Phone); it now fills the canvas. The "Preview as" label no longer wraps onto two lines; the whole group wraps instead.
- FIX: **Preview runs through the real answer path.** Preview used to keep raw form answers, so a calculated total stayed 0, score bands and rules keyed on a total never fired, and Printed output printed no score. Preview answers now go through the same normalisation as the real fill form (one shared function: section-switch carry-over, sanitize incl. totals, staff-only lock), then into local state only. Preview also has its own section switches and section counts: switching a section off in Preview no longer writes `__sectionVisibility` into the real form data, "Start again" undoes it, and Printed output leaves the section out. The fill form itself is unchanged (same order of operations, same saved answers).
- FIX: **The right panel follows the canvas.** Selecting a field on the canvas (also the one already selected), or adding one from the palette, now shows Properties even when Check had left the panel on Problems. Clicking an entry in the Problems or Logic list keeps that list open (it used to switch to Properties).
- FIX: **Edge resize no longer loses fine widths.** A press or wobble on the handle (under about 12 px of movement) changes nothing, and a drag that ends on the stop nearest the field's starting width (third, half, full) leaves an in-between width such as 3/12 or 8/12 as it was. A real drag to another stop still snaps and is still one undo step; keyboard stepping is unchanged. `snapColumnSpan` takes an optional list of stops, and the drag snap, the snap-off drag and the handle's `aria-valuenow` use it instead of separate hand-written thresholds.
- On the designer canvas a field with a visibility rule shows the "Shown when ..." sentence only; the eye badge is no longer shown next to it.
- Cleanup (no behaviour change): the token check uses `extractTemplateTokens` (so `{% ... %}` and `{! ... !}` references are checked too) and `resolveComputedTokenValue` instead of its own parser and `sys.*` list; the known-token set and "Did you mean" answers are built once per catalog and the check is off in the viewer; strings without a brace are not scanned; the selected field's source / dependant outlines come from the rule scan instead of a second pass; one rule-chip block; one `renderSegment` for the four segment buttons; one preview flag; `withoutStaffOnlyComponents` shared by the client audience and the client Preview; Preview's form context and widget map are built once; stable empty maps for the viewer; the old corner-grip CSS, a duplicate tab block and hard-coded tints / greens are gone (the Check pill green is now the existing "done" green).
- No widget XML change.

## 0.11.1 (viewer housekeeping, no behaviour change)
- The two after-every-render DOM passes of the viewer (missing-answer marks, locked fields) now leave at once when `showMissingRequired` / `lockClientAnswers` are off and nothing was ever marked, so ordinary viewers (staff editor, PDF capture, legacy pages) no longer scan their fill form on every render.
- The stacked read-only preview HTML (`previewAnswerLayout = stacked`) is memoized.
- Lock mode change handler: one serialization of the stored answers per change instead of two, and the staff-only answer keys are worked out once per definition.
- One `isMissingRequired` predicate behind both "next required question" and the missing-answer marks.
- No widget XML change.

## 0.11.0 ("Staff only" questions)
- NEW (designer): per-question setting "Staff only" (Validation tab, next to Required): "Staff only: hidden from the client when the client fills in this form." Stored on the component as `staffOnly: true` (written only when true) and mirrored in `fieldsManifest`. Works on every component, text blocks included. Ticking it on a field of a repeatable group applies to the whole group (a group's rows are one answer); a calculated total that adds up a staff-only question is saved as staff only too. Staff-only items carry a small "Staff only" marker on the designer canvas and in the fill form.
- NEW (viewer, XML property `audience`, default `staff`): `client` takes the staff-only components out of the definition the instance works with, so they are not rendered in the fill form or the document preview, not counted (section stats, required, missing-answer marks) and not prefilled. Their stored answers are kept aside and written back unchanged with every save; an audience-filtered definition is never written back.
- NEW (viewer, XML expression property `lockClientAnswers`, default false): fill form in which only staff-only questions can be edited. Every other question is rendered inert with a locked look and keeps its stored value (also enforced in the change handler); prefill and missing-answer marks apply to the staff-only questions only.
- Prefill from a chart token (`prefillTokenKey`) now also works for a multi-select choice question when the chart value is one of its options (by value or label); an empty multi-select answer (`[]`) no longer counts as answered for prefill.
- Widget XML change: two properties added at the end (`audience`, `lockClientAnswers`). Existing placements keep today's behaviour; PDF output is unchanged for forms without staff-only questions.

## 0.8.6 (multi-select default values)
- FIX: "Default value" for a multi-select dropdown / checkbox-list field was a free-text box whose input was normalized on every keystroke against the option values, so partial text was dropped and the box could never be typed into. Choice fields with options now get a real picker in Value & prefill: a checklist of the field's options for multi-select (stored as string[] in option order, labels shown, values stored) and a dropdown with "None" for single-select. Other field types keep the text box. No definition JSON format change; schema generation already emitted array defaults.
- FIX: clearing every option on a multi-select field that has configured defaults now sticks. The dropdown widget emits [] instead of undefined, and sanitizeFormData keeps an explicit [] for such fields, so RJSF no longer re-applies the schema default and re-checks the cleared options.
- Value & prefill group peek shows "N defaults" for array defaults.
- Changing a choice field's default (checklist or dropdown) also mirrors the value into the designer canvas data (updateComponentDefaultValue), so Live Preview / Preview show the new default immediately instead of whatever RJSF captured on the first click.
- No widget XML change.

## 0.1.35 (shared fields prefill from registry value)
- Shared-field placements (`sharedFieldRef`) now prefill in the viewer from the token context like `prefillTokenKey` fields do — the context carries the newest shared answer (server resolves it via FormAnswer), so "reads from intake" works on first open. Same weak semantics: applied only while the field has no answer.

## 0.1.34 (token system unification — one grammar, one catalog, split bindings)
Implements the widget side of `.concord/plans/token-system-unification-spec.md` (greenfield; pairs with the FormStudio registry rework of the same date).
- ONE catalog parser: `parseTokenCatalog()` reads catalog schema v2 (`{"version":2,"tokens":[{key,kind,label,fieldType,options,canonical,source?}]}`). Legacy map/JSON-schema catalog shapes and both old parsers (`parseTokenCatalogSchemaJson`, `parseSharedFieldCatalog`) are removed. All three pickers (Default-from-token, Shared Fields palette, doc-output token search) are filters over this one catalog by `kind` (client|doc|computed|sharedField).
- Prefix-partitioned token scope (`buildTokenScope`): bare keys resolve ONLY from the form's own data; dotted keys ONLY from the registry context. A client/doc token can no longer silently shadow a form field (the old `{...formTokens, ...context}` merge is gone). Field keys remain structurally dot-free (`normalizeKey`).
- Computed tokens are `sys.date` / `sys.time` / `sys.datetime` (catalog-driven with built-in fallback); `__currentdate|time|datetime|today|now|nowtime` kept as resolver aliases for one release.
- Component binding split: `prefillTokenKey` (weak; seeds a value on open) vs `sharedFieldRef` (strong; the field IS the shared field). Legacy `tokenKey` is parsed (shared.* → sharedFieldRef, else prefillTokenKey) and never written back.
- Shared-field placements get a REDUCED properties panel: Key, Type, options, multi-select, Placeholder, Default value, Default from token, validation and repeat-group are hidden (definition-owned); Label, label display, Required (Validation tab), Description, visibility rules and layout stay editable.
- Shared-field source `templateCode` is provenance/display only ("reads from …"); `fieldKey`/the `shared.*` key is the identity (spec amendment: template Code de-load-beared).
- No widget XML change.

## 0.1.33 (content-block polish: heading hierarchy, Hide label default, no Signature palette item)
- FIX ("subheader reverts to header"): the app theme sizes h2 (26px) and h3 (24px) almost identically, so a Subheader was visually indistinguishable from a Header in the live form and document preview. The block was stored correctly as `<h3>` all along. Widget CSS now gives authored rich text a clear hierarchy in `.rjsf-builder__content-block` and `.rjsf-builder__document-preview-body`: h2 22px/700, h3 16px/600.
- Content Block components are created with "Hide label" checked by default (palette insert, drop, and type-switch to Content Block); existing components keep their stored setting.
- Removed "Signature" from the designer palette (Special group) — signatures are handled at the form/document level. The `signature` field TYPE remains fully supported so existing templates keep rendering, and it still appears in the Type dropdown for such fields.
- No widget XML change.

## 0.1.32 (rich-text formatting for Document Output + Content Block)
- NEW (designer): the per-field "Document output template" editor is now a rich-text editor (contentEditable) with a formatting toolbar — Header/Subheader/Normal paragraph styles, Bold, Italic, Underline, Strikethrough, bulleted/numbered lists, and Clear formatting (legacy form-builder parity). Templates are stored as HTML; `asHtmlSnippet` already passed HTML through to preview and PDF, so no renderer change was needed. Existing plain-text templates load unchanged (escaped, newlines → `<br />`) and stay plain text until formatted. Token chips still insert `{token}` at the caret (`insertText` via a saved selection range).
- NEW (designer): the Content Block "Content" editor uses the same rich editor — a free-form formattable text element that covers the legacy Header/SubHeader elements (H/h toolbar buttons emit `<h2>`/`<h3>`; ContentBlockWidget already renders raw HTML in the fill form and document output).
- No widget XML change (no re-registration needed).

## 0.1.31 (checkbox tokens print Yes/No)
- Document-output tokens for checkbox fields now resolve through formatValueForPrint ("Yes"/"No") instead of raw "true"/"false" — matches yesno/switch behaviour. Needed for narrative templates like "{client.firstName}'s reply was {wish_to_be_dead}".

## 0.1.30 (OLA-1485 print system templates)
- Document Output / PDF (resolveDocumentOutputHtml) now renders systemDatagrid2 components from systemSectionHtmlJson slot HTML (withdrawalScale, vitals, meds, allergies, diagnoses). Previously system template sections were silently skipped in every generated PDF.

## 0.1.29 (OLA-1485 snippets)
- NEW (viewer fill form only): SNIPPETS â€” canned-text insertion on text and textarea inputs. Two new OPTIONAL properties on the Form context object: `snippetsJsonAttr` (String attribute, Data) supplying a JSON array `[{id,name,text,scope}]` (server-side pre-filtered; `name`/`text` arrive URI-encoded via Mendix urlEncode and are decoded with `decodeURIComponent`, falling back to the raw value; invalid/empty JSON = feature fully off, zero UI change), and `onManageSnippets` (action, Events) which, when set, renders a "Manage library" link in the popover footer. While a text/textarea field is focused a quiet pill button ("âš¡ Snippets") floats under the field's right edge; clicking it (or typing `/` in an EMPTY field) opens an anchored popover: search, Mine/Team scope pills (Mine = scope "Personal"), keyboard navigation (ArrowUp/Down, Enter inserts, Esc closes and refocuses the field). Insertion happens at the cursor (append when no cursor), prefixes a space when the preceding character isn't whitespace, keeps focus in the field, and dispatches a native `input` event so React/RJSF onChange (and autosave) fire. Implemented DOM-side over the viewer fill container, so it also works for text inputs inside repeat groups and datagrid text cells; date/time/select/checkbox widgets are untouched (`input[type=text]` + `textarea` only). Designer, preview panel, and document output are untouched.

## 0.1.28 (OLA-1679)
- FIX (designer, OLA-1679 item 2 "Multiple columns does not work"): multi-column sections now have an explicit "Drop here for column N" drop zone at the bottom of every column lane. Previously an empty column had NO drop target: the only no-target drop zone was the section-level one, and both `addComponentInSection` and `moveComponentToSection` defaulted a target-less drop to column 1 â€” so fields could never be placed directly into column 2+ (users had to stack fields in one column, resize the section, then drag between existing fields). Palette drops and existing-field drags both accept the new per-lane zone; the explicit column index flows through `handleDropOnTarget` â†’ `onPreviewDropField`/`onPreviewMoveComponent` (new optional trailing `sectionColumn` argument â€” backward compatible). `resolveSectionMeta` also now resolves a section's column count as the MAX `sectionColumns` across the section's components instead of the first/target component only, so drops into partially-updated sections keep the multi-column layout.
- FIX (OLA-1679 item 7 "Date in form can write more than the YYYY"): new `DateInputWidget` (registered as the `date` widget on all three Form instances) clamps the year segment of a typed date to 4 digits in `onChange` (controlled write-back) and sets `max="9999-12-31"` on the input. Applies to form date fields, repeat-group date fields, and datagrid date columns (all resolve the `date` widget name).
- NEW (OLA-1679 item 6): `Time` datagrid column type (`{ type: "time" }` â€” HH:mm). The form-level `Time` field type already existed since 0.1.2x; this adds the missing DataGrid column option: palette entry in the column type dropdown, `format: "time"` schema, `ui:widget: "time"`, and document-output/PDF cells already format via `formatValueForPrint(..., "time")` (12h AM/PM display). `DataGridColumnType` already included `time`, so stored definitions are unaffected.
- VERIFIED (OLA-1679 item 3 "form always starts with the first option"): reproduces only on widget builds older than 0.1.17. Since 0.1.17 all three Form instances pass `experimental_defaultFormStateBehavior={{ constAsDefaults: "skipOneOf" }}`, so untouched selects/radios/yesno/matrix write NOTHING into AnswersJson, and the RJSF SelectWidget renders a leading blank placeholder option whenever the field has no explicit default (verified by rendering `@rjsf/core@6.3.1` against this widget's exact `oneOf`-const schema: blank `<option value="" selected>` present, `getDefaultFormState` returns `{}`). Explicit designer defaults still apply (`schema.default`), stored answers still hydrate, scoring unaffected. NOTE: documents saved under pre-0.1.17 builds may already contain silently-seeded first-option answers in AnswersJson â€” those are real stored data and are NOT rewritten.
- VERIFIED (OLA-1679 item 1): an output-capable static text component already exists â€” `Content Block` (palette group "Special"). Renders while filling (read-only, token-substituted, raw HTML passthrough so `<h1>`/`<h2>` header/subheader markup works) and prints in document output (default output template = its content). Stores no answer.

## 0.1.27
- FIX (correctness, clinical PDF): the document-output/preview renderers (`resolveDocumentOutputHtml` for the preview bodyHtml and `buildPrintDocumentHtml` for the print/PDF html) now evaluate per-component `visibilityRules` via `isComponentVisibleForSummary` â€” the same evaluator the live form renderer uses. Previously only section-switch visibility was honoured, so e.g. every PHQ-9 interpretation contentBlock band printed simultaneously in a locked PDF regardless of the score.

## 0.1.26
- Designer: fields whose `tokenKey` matches a SHARED catalog entry (fieldType + code:fieldKey source) now LOCK Key, Type and the "Default from token" binding in the Properties panel (disabled controls with explanatory tooltips; the help line under the binding explains what stays editable). Per-placement properties - label, required, placeholder, description, layout, visibility - remain editable. Ordinary fields and client-record token bindings (e.g. client.dob) are unchanged; the token dropdown stays the escape hatch there. The JSON editor can still bypass the lock - the Mendix publish gate remains the authoritative check (incl. the new reader-side type validation).

## 0.1.25
- NEW: "Shared fields" palette group in the designer toolbox, fed by `tokenCatalogSchemaJsonAttr`. The token catalog map now supports rich object values (`{"<tokenKey>": {label, fieldType, defaultLabel, options, canonical, source, sourceType}}`) alongside the legacy `{"<tokenKey>": "Display name"}` string format. Entries with a `fieldType` and a `code:fieldKey` `source` render as draggable/clickable palette items; inserting one produces a fully configured component Ã¢â‚¬â€ key (from the source fieldKey, uniquified), type, label (`defaultLabel`), select/radio options (+ per-option labels), and the `tokenKey` binding Ã¢â‚¬â€ with zero manual property edits. Each entry shows its ownership: "reads from &lt;template code&gt;" for standard shared reads, "canonical" for `IsCanonical` definitions. Inserting a token that is already bound on the form selects the existing field instead of duplicating it.
- The "Default from token" dropdown is unchanged (escape hatch for cross-template binding); it now also accepts `label` on object-valued catalog entries.
- Renaming the key of a token-bound field in the Properties panel now shows a warning (not a block Ã¢â‚¬â€ the authoritative gate is the Mendix publish flow, which validates renames, type drift, and canonical key collisions).

## 0.1.24
- NEW: Viewer document-preview mode. New optional expression property `showDocumentPreview` (Behavior, defaults false). Viewer only: when the expression is true, the viewer renders the resolved document output narrative (`buildResolvedOutputArtifacts(...).bodyHtml`) in a read-only `.rjsf-builder__document-preview` card instead of the fill form. The viewer header behavior is unchanged; when the resolved html is empty a muted "No document output template content yet." placeholder is shown.
- FIX: Matrix answers were applied at the form ROOT instead of the matrix component key, so selecting a matrix radio in the viewer never persisted (and could strip previously saved matrix answers on the next change). `MatrixGridField` now follows the RJSF v6 field `onChange` contract Ã¢â‚¬â€ `(formData, path, errorSchema, id)` Ã¢â‚¬â€ passing `fieldPathId.path`/`$id` so the change lands on the component key (`{<key>: {rowKey: optionValue}}`). Falls back to the legacy single-argument call when `fieldPathId` is absent.

## 0.1.23
- Added two new designer field types for palette parity with the .NET builder:
  - `Matrix / rating grid` (`matrix`): PHQ-9-style question grid Ã¢â‚¬â€ N question rows (`matrixRows: [{key,label}]`) sharing one option column set (the standard `options`/`optionLabels`/`optionScores` conventions from 0.1.19, edited with the same Options grid incl. the Score column). Renders as a table with one radio per row/option cell (custom `matrixGrid` RJSF field, `ui:field: "matrixGrid"`); narrow widths get horizontal scrolling. Schema is `type: "object"` with one `type: "string"` + `oneOf` property per row, so the `constAsDefaults: "skipOneOf"` guard keeps untouched grids unchecked and nothing is written into AnswersJson until the user answers (empty matrix objects are stripped on save). Answers are stored under the component key as `{rowKey: optionValue}`.
  - A required matrix emits `required: [<all row keys>]` inside the object schema and counts as complete (section/overall completion) only when every row has an answer.
  - `Calculated total` sums the selected option's score across ALL matrix rows (PHQ-9 totals); unscored matrices fall back to summing numeric option values per row. Matrix rows are excluded from repeat groups and from the "Default from token" prefill dropdown (like datagrid/system templates).
  - Matrix rows are editable in the Properties panel (add/remove/reorder, label + stable row key); per-row tokens `{<key>_<rowKey>}` / `{<key>_<rowKey>_label}` are available in document output templates, the default template prints one `Row label: Answer` line per row, and PDF HTML prints a `Question | Answer` table. Import accepts `matrixRows`, `x-matrix-rows`, `rows`, or `questions` arrays (objects with `key`/`label`-style fields or plain strings).
  - `Slider` (`slider`): a numeric range input (`type: "number"` schema with `minimum`/`maximum`/`multipleOf`, `ui:widget: "range"` Ã¢â‚¬â€ the RJSF RangeWidget, which shows the current value next to the track). Min/Max/Step are editable in the right panel's Validation tab and default to 0/10/1. Sliders are summable in Calculated total, support "Default from token" prefill (numeric coercion), work as visibility-rule sources with the numeric operators from 0.1.21, and print their numeric value.

## 0.1.22
- System templates are now model-extensible (no more hard-coded-only XML slots):
  - New optional attribute `systemTemplatesConfigJsonAttr` (Data group) accepts a JSON array (or `{templates:[...]}`) of extra template definitions: `{type, label, titlePrefix?, keyBase?, slotProperty?|systemTemplateSlotProperty?|slotKey?, rowIdKey?, documentOutputTemplate?, columns:[{key,label,type?,required?,columnSpan?,options?}]}`. Defaults: `keyBase` is camelized from `type`, `slotProperty` is `<keyBase>Datagrid2`, column types fall back to `text`. Entries colliding with a built-in type or duplicated within the config are ignored; built-ins always win.
  - Config templates appear in the designer toolbox SYSTEM TEMPLATES group and in the System Template slot dropdown exactly like the six built-ins, and inserting one creates a `systemDatagrid2` component with the configured columns.
  - At runtime a config template's slot has no dedicated widget XML slot, so the placeholder now renders model-supplied HTML from the existing `systemSectionHtmlJsonAttr` map keyed by the template's `slotProperty` (same trust model as document output). Built-in slots keep their configured widget snippets; the HTML fallback also applies to built-ins whose slot has no widget configured.
  - `SystemTemplateType`/`SystemTemplateSlotProperty` are widened to accept config-defined values; all template lookups (type, slot property, key inference, schema/output building) consult the merged registry.

## 0.1.21
- Added six visibility-rule operators for parity with the .NET builder (now 10 total): `Greater than`, `Less than`, `Greater or equal`, `Less or equal` (numeric comparisons; the rule value must parse as a number, otherwise the rule never matches), and `Contains` / `Starts with` (case-sensitive string comparisons; on multi-select fields `Contains` matches when the value is one of the selected options and `Starts with` when any selected option starts with the value).
- Conditional show/hide is still driven through the generated JSON Schema: numeric operators emit `exclusiveMinimum`/`exclusiveMaximum`/`minimum`/`maximum` bounds and the string operators emit escaped `pattern` constraints, so SchemaJson/UiSchemaJson consumers see standard keywords. Completion counters and section summaries use the same operator semantics.
- The rule Value input now shows for every operator except `Truthy`/`Falsy`.

## 0.1.20
- Added per-field token prefill binding ("Default from token", .NET `x-token-key` parity):
  - Choice of token comes from the same catalog that feeds the Document Output token picker (`tokenCatalogSchemaJsonAttr` labels plus any runtime `tokenContext` keys). Stored as `tokenKey` on the component; `x-token-key`, `xTokenKey` and `defaultFromToken` are accepted on import for .NET compatibility.
  - In viewer mode the widget resolves the token against the runtime token context (`tokenContextJsonAttr` / `tokenContextSource`) at render time and shows it as the field's value Ã¢â‚¬â€ but ONLY while the field has no saved answer, and nothing is written into form data (AnswersJson) until the user actually edits the form (no phantom-answer regression; the first real edit persists the visible prefills together with the edit).
  - Values are coerced per field type: yes/no and switch/checkbox accept yes/no/true/false-style values, dates are normalized to YYYY-MM-DD, times to HH:MM (12-hour input accepted), numbers parsed (integers truncated), and dropdown/radio prefills apply only when the token value matches an option value or label. Unmatchable values are ignored.
  - Not available on Calculated total, Data grid, System datagrid, Content block, Signature, multi-select fields, or fields inside repeat groups. Prefill is skipped entirely when the form data attribute is read-only (e.g. locked documents).
  - Completion counters and required tracking still reflect saved data only Ã¢â‚¬â€ a prefilled-but-untouched field counts as unanswered until the user edits the form.

## 0.1.19
- Added per-option scoring for choice fields (.NET builder parity):
  - Dropdown and Radio group options now have an optional numeric `Score` column in the Properties options editor; Yes/No fields get a compact "Scores (optional)" block with Yes/No score inputs.
  - Scores are stored as an `optionScores` map (`{"<option value>": <number>}`) on the component; per-option `score`/`points` keys inside imported option objects and a component-level `optionScores`/`optionScoreMap`/`scores` map are also parsed for .NET-import compatibility.
  - `Calculated total` fields now sum the score of the selected option for any scored choice field (multi-select sums the scores of all selected options); unscored choice fields keep the previous behavior of parsing numeric option values. Yes/No fields are now valid total sources.
  - Untouched scored fields contribute nothing (the `constAsDefaults: "skipOneOf"` guard from 0.1.17 still applies).

## 0.1.18
- Added four new designer field types for palette parity with the .NET builder (OLA-1679):
  - `Yes/No` (`yesno`): a fixed two-option choice rendered as Yes/No radio buttons. Schema is `type: "string"` with `oneOf: [{const:"yes",title:"Yes"},{const:"no",title:"No"}]` and `ui:widget: "radio"`, so it follows the same `constAsDefaults: "skipOneOf"` guard as other choice fields Ã¢â‚¬â€ untouched fields write nothing into form data. Values are stored as `"yes"`/`"no"`; document output and PDF print render them as `Yes`/`No`.
  - `Switch` (`switch`): a boolean toggle. Schema is `type: "boolean"` (same as checkbox) and it renders through the standard checkbox widget styled as a toggle pill via the `rjsf-builder__field--switch` class. Prints as `Yes`/`No`.
  - `Time` (`time`): a time-of-day input. Schema is `type: "string", format: "time"` with `ui:widget: "time"` (native RJSF TimeWidget). Prints as 12-hour time (e.g. `2:30 PM`).
  - `Content Block` (`contentBlock`): a static text block with a multiline `contentText` property edited in the Properties panel. Renders in viewer/preview as static content with the standard token substitution (`{token_key}`, `{%token_key%}`, `{!token_key!}`) applied against form and client tokens. It stores no answer: it is excluded from saved form data (AnswersJson), from required tracking, and from section/overall completion counters. Its resolved content still flows into document output and PDF HTML via the document output template (defaults to the content itself).

## 0.1.17
- Fixed radio groups and selects rendering with the first option pre-selected (and silently writing that option into the saved form data) when the field had no value. Root cause: RJSF v6 treats `const` values inside `oneOf` choice schemas as defaults (`constAsDefaults: "always"` is the library default), so `getDefaultFormState` seeded every untouched choice field with its first option. Fixed by passing `experimental_defaultFormStateBehavior={{ constAsDefaults: "skipOneOf" }}` to all three Form instances (viewer, preview, full preview).

## 0.1.16
- Added "Hide form title and description" toggle on the Document Output config panel to optionally exclude the form title and description from the PDF HTML output.
- Extracted PDF document output styles into a standalone CSS file (`RjsfFormBuilder-pdf.css`). Add to your Mendix theme folder to style PDF HTML rendered outside the widget.
- Restored `rjsf-builder__pdf-html` and `rjsf-builder__pdf-body` classes on the generated HTML document tags.
- Added missing `.rjsf-builder__pdf-block--table` and `.rjsf-builder__pdf-block--system` modifier classes to the external CSS file.

## 0.1.15
- Fixed form data hydration so previously saved answers are restored when reopening a form in viewer mode. Root cause was a race condition between definition and form data hydration effects that caused saved values to be sanitized against an empty state.

## 0.1.14
- Added live form completion metrics as optional Integer output attributes inside the Form context datasource:
  - `Field count`: total number of fields in the form definition
  - `Required field count`: number of required fields
  - `Section count`: number of distinct sections
  - `Completion percent`: percentage (0Ã¢â‚¬â€œ100) of trackable fields that have a value
  - All four update live as the user fills in the form or modifies the definition
- Simplified the Layout toolbox to two starters: `Section (1 column)` and `Data grid (compact rows)`. Removed `Columns (2)`, `Columns (3)`, and `Collapsible panel` since columns can be adjusted after adding a section and every section already supports collapsing natively.
- New sections now default to collapsible (`Section collapsible` is checked by default when adding a section).

## 0.1.13
- Added `Show viewer header` so the full viewer header row can be shown or hidden from widget properties.
- Moved the Studio Pro editor-preview placeholder for `Viewer header widget` to the top of the preview card so it better matches the runtime layout.

## 0.1.12
- Added a PDF-oriented output pipeline on top of the existing document-output renderer:
  - writes full print-shell HTML to `resolvedPdfHtmlAttr`
  - supports system-template HTML injection via `systemSectionHtmlJsonAttr`
  - adds optional viewer-side `On export PDF` action and `Export PDF button text`
- Added a top-level builder `Document Output` workspace for assembled print preview, with `Rendered` / `HTML` modes and form-level PDF header/footer template editing.
- Added form-level PDF header/footer templates with token resolution and optional `hide if empty` behavior.
- Added an optional `Viewer header widget` property so Mendix content can be placed in the viewer header next to the Save button.
- Matched PDF section-column rendering to the form layout so multi-column sections render as multi-column print output where possible.
- Added PDF print-layout fallbacks for wide content and improved page-break behavior for section titles, tables, and structured blocks.
- Viewer mode can now optionally render the left navigation panel while still respecting `Show components panel` and `Show section panel` Studio Pro settings.
- Simplified the viewer left navigation panel:
  - removed the redundant per-field card list
  - kept section chips only
  - added section progress text like `1 of 2`
  - added orange warning state for sections with incomplete required fields
- Removed `Column 1`, `Column 2`, and similar lane labels from preview and viewer mode while preserving them for editable designer-only layout affordances.

## 0.1.11
- Added viewer-mode bulk section controls so end users can `Expand all` and `Collapse all` sections without switching back to preview.
- Improved viewer section presentation to better match designer preview with clearer section cards and reduced internal spacing.
- Tightened runtime form density across viewer/preview:
  - reduced field, section, and grid gaps
  - reduced label/help spacing and control padding
  - shortened default textarea height for dense clinical forms
- Locked textarea resizing to vertical while keeping textarea width pinned to the parent container.
- Reworked repeatable array group rendering:
  - replaced brittle stock array layout with widget-owned row/card templates
  - aligned add/remove/reorder actions consistently
  - removed root-only section controls from nested repeat-group rows
- Added repeatable-group field ordering tools in Properties:
  - explicit `Up` / `Down` ordering within a repeatable group
  - drag-and-drop ordering with a dedicated field-order handle
- Refined repeatable-group styling so row controls, row headers, and add-row actions render consistently in both builder and runtime preview.
- Fixed checkbox rendering regression introduced by the denser spacing pass by scoping compact input rules away from checkbox/radio controls and restoring boolean-field layout/sizing.

## 0.1.10
- Added default field document-output templates so new and existing fields show `Label: Answer` output until a form admin customizes the template.
- Added `Reset to Default` beside the `Template` editor to restore the standard document-output template after custom edits.
- Refined right-panel UX with 3 tabs: `Properties`, `Document Output`, and `Validation`.
- Redesigned Document Output token inserter for narrow panels:
  - single `Token source` selector (`Form Data`, `Client Data`, `Computed tokens`)
  - single searchable token list
  - recent token chips for quick reinsert
  - taller template editor textarea for easier authoring
- Added computed token source option in token picker:
  - `__currentdate`
  - `__currenttime`
  - `__currentdatetime`
- Added builder-only token catalog support via `tokenCatalogSchemaJsonAttr`:
  - accepts JSON schema/catalog (including `type: object` + `properties`)
  - uses schema keys/titles to populate `Client Data` token options in builder
  - does not supply runtime token values
- Clarified token data property descriptions in widget configuration:
  - `tokenContextJsonAttr` / `tokenContextSource` are runtime value providers
  - `tokenCatalogSchemaJsonAttr` is builder-only token metadata for picker UX
- Added non-technical token insert UX for `Document output template`:
  - searchable `Form Data tokens` picker
  - searchable `Client Data tokens` picker
  - one-click inline insertion at cursor position in the template textbox using `{token_key}` syntax
- Added token picker support for form fields, datagrid field/column helper tokens, and client/context tokens provided by Mendix.
- Removed the default fallback description text (`System template widget slot.`) for `systemDatagrid2` fields; descriptions now render only when explicitly configured by the form admin.
- Renamed the builder field type label from `System Datagrid2 Placeholder` to `System Template`.
- Removed snippet-specific legacy handling from system template fields (`systemTemplateSnippet`), so rendering now relies only on the configured system template slot.
- Updated system template helper copy to clarify that any Mendix widget can be placed in each system template slot.
- Locked `systemDatagrid2` component type in the Properties panel so system template fields cannot be accidentally changed to regular question types.
- Added developer-configurable Mendix widget placeholders for all system datagrid templates:
  - `Active Medications Datagrid2`
  - `Active Allergies Datagrid2`
  - `Chart Diagnosis Datagrid2`
  - `Billing Diagnosis Datagrid2`
  - `Active Billing Codes Datagrid2`
  - `Most Recent Drug Test Datagrid2`
- Wired system template placeholders to render configured Mendix widgets in builder preview and viewer runtime when present, with placeholder fallback when not configured.
- Updated the widget icon (`RjsfFormBuilder.icon.png` / `.dark.png`).
- Moved datagrid configuration out of the right-side Properties panel into a dedicated popup editor:
  - added `Datagrid settings` quick-action button on datagrid items in Live Preview
  - added compact `Open datagrid settings` launcher in Properties
  - added modal dialog for full datagrid column configuration (row identity key, columns, types, options, reorder, add/remove)
  - supports close via backdrop click and `Esc`
- Added datagrid-oriented template building support:
  - new layout template: `Data grid (compact rows)`
  - new system template starter: `Active Medications`
  - new repeat-group option: `Use data grid row layout (RJSF v6 Layout Grid)`
  - repeat-group uiSchema now supports RJSF v6 `LayoutGridField` + `ui:layoutGrid` for compact row rendering while preserving add/edit/delete behavior
- RJSF v6 compatibility hardening for Live Preview:
  - restored section grouping/rendering by resolving preview field keys from v6 path/id shapes
  - restored drag/drop reorder and resize handles by matching preview keys against component metadata
  - hardened root object-template detection and formContext access for v5/v6 compatibility
- Added dropdown multi-select mode:
  - new `Multi-Select dropdown` option for `select` fields
  - schema/uiSchema generation for array-based select values
  - default value normalization and safe coercion between single-select and multi-select
  - improved empty-output handling for multi-select values in document rendering
- Added radio multi-select mode:
  - new `Multi-select radio options` toggle for `radio` fields
  - schema/uiSchema generation for array-based radio values
  - radio multi-select renders as checkbox group while preserving single-select radio mode
- Improved options editor behavior:
  - moved `Options (one per line)` directly below `Type`
  - switched to draft editing with normalization on blur so typing spaces/newlines is not disrupted
- Upgraded choice options editor UX:
  - replaced single textarea editing with structured rows (`Order`, `Label`, `Value`, `Remove`)
  - added row reordering (`Up`/`Down`) and quick add/remove controls
  - added label/value mapping support in schema via `oneOf` (`const` + `title`)
- Added core `datagrid` field type (array-of-objects):
  - new `Datagrid` field type in toolbox
  - schema generation as `type: array` with `items: { type: object, properties... }`
  - per-column builder configuration (`key`, `label`, `type`, `required`, `span`, `options`)
  - per-column reorder/add/delete controls in properties panel
  - optional row identity key (`Row identity key`) to support bidirectional updates
  - row rendering via RJSF v6 `LayoutGridField` + `ui:layoutGrid` for compact grid rows
  - datagrid row data normalization/sanitization integrated into form-data handling
- Updated system template reference implementation:
  - `Active Medications` now inserts a dedicated `systemDatagrid2` placeholder field with predefined columns
- Updated system template integration for datagrid placeholders:
  - removed the token-output placeholder mode for system datagrid templates
  - added a dedicated `systemDatagrid2` component type for placeholders that host Mendix DataGrid2 snippets
  - replaced the old token placeholder UI with a specialized placeholder card that preserves column/row-id context
- Expanded document output rich-text support:
  - added RTF color table parsing (`\colortbl`) and color runs (`\cfN ... \cf0`)
  - improved handling of inline bold/italic/underline control words
- Simplified field properties:
  - removed `Section column index` and `Column span (1-12)` inputs from the panel (layout handled via drag/resize tools)
- Refined checkbox rendering in preview/viewer:
  - explicit checkbox sizing, border, checkmark, focus, and theme contrast styles
  - fixed duplicate checkbox visuals by disabling host-theme pseudo-element overlays in scoped boolean field labels
- Updated section toggle copy to `Allow user to hide/show this section`.
- Preserved user-entered spacing for text inputs where intended (`placeholder`, `pattern`, repeat-group title).

## 0.1.8
- Moved section-level controls from the Properties panel into each section header menu in Live Preview:
  - `Section collapsible`
  - `Section collapsed by default`
  - `Allow viewer to hide/show this section`
  - `Section (name/title key)`
  - `Section order`
  - `Section columns`
- Reduced right-panel clutter by removing duplicate section controls now managed in the section menu.
- Moved `Label display` directly under `Label` in Properties.
- Converted `Label display` into a compact single-row layout (hide-label toggle + position select) without a surrounding border.
- Added inline tooltip help (`?`) for `Hide field output if empty` to clarify finalized document behavior.

## 0.1.7
- Added section-level visibility switching for end users in Viewer/Preview mode.
- Added per-field `Allow viewer to hide/show this section` control under Document output template settings.
- Added section visibility persistence in form data (`__sectionVisibility`) and final document output filtering by section visibility.
- Added per-field `Hide field output if empty` control for final document rendering.
- Added per-field label display controls:
  - hide/show label
  - field-level label position override (default, above, in front)
- Wired field label controls into generated uiSchema via class-based rendering rules.
- Added basic RTF-like support in document output rendering:
  - line breaks (`\\line`, `\\par`)
  - bold (`\\b ... \\b0` or `{\\b ...}`)
  - italic (`\\i ... \\i0` or `{\\i ...}`)
  - underline (`\\ul ... \\ul0` or `{\\ul ...}`)

## 0.1.6
- Added a dedicated `Validation` panel in field properties with per-field validation controls.
- Added numeric validation options (`minimum`, `maximum`, `multipleOf`) for `number` and `integer` fields.
- Added string validation options (`minLength`, `maxLength`, `pattern`) for `text`, `textarea`, and `email` fields.
- Moved `Show layout tools` from runtime toolbar toggle into Studio Pro Designer properties.
- Added `Show section panel` Designer setting to control section shortcut chips in the Components panel.
- Converted Designer visibility settings and `Live validate` to optional Boolean expressions with safe defaults when unset (`true` for Designer visibility flags, `false` for live validation).
- Tightened repeatable-group action styling so move/remove/add controls render consistently in a compact aligned bar.

## 0.1.5
- Fixed multi-column live-preview resizing so field `columnSpan` is applied and editable inside section columns.
- Added section-level column resize control in the section header (drag to adjust section columns up to 12).
- Standardized section column handling across parser, normalizer, editor, and preview to support up to 12 columns consistently.
- Improved section lane assignment stability by assigning deterministic `sectionColumn` values when missing.
- Prevented cross-section and in-section reorder/move operations from unintentionally resetting field `columnSpan`.

## 0.1.4
- Replaced the `Document output template` hover tooltip with an expandable in-panel token help accordion.
- Added full token behavior guidance in the accordion, including syntax, precedence, and computed-token support.
- Added collapsible support for all titled sections in builder preview.
- Added preview-level bulk actions to collapse or expand all sections.

## 0.1.3
- Fixed live-preview drag-and-drop reordering so existing fields update immediately after drop.
- Improved preview ordering stability by honoring component order metadata during render.
- Fixed Undo behavior by making snapshot pop/apply deterministic.
- Added an inline info tooltip beside `Document output template` describing token syntax and save-time resolution behavior.
- Stabilized preview drop targets to reduce layout disruption during reorder/resize interactions.

## 0.1.2
- Added token-aware document output template support in field properties and preview rendering.
- Added optional mapped form-level title and description support with safer persistence behavior.
- Fixed form-definition persistence regression when reopening existing forms.
- Improved designer layout density and section contrast for better readability.
- Added clickable `COMPONENTS` section chips that scroll to the matching preview section with target highlighting.
- Preserved user-entered spacing for configurable text fields where trailing spaces are intentional.

## 0.1.1
- Updated project documentation with setup, build, and maintenance guidance.
- Added `docs/DEVELOPMENT.md`.
- Expanded README with project structure, scripts, and Mendix tooling configuration notes.

## 0.1.0
- Recovered pluggable widget source structure from packaged artifact.
- Renamed widget project from `PdfRjsfFormBuilder` to `RjsfFormBuilder`.
- Rebuilt and validated the widget build pipeline.

