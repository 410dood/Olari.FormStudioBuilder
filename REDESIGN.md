# FormStudioBuilder — redesign roadmap

Cloned from olari.RjsfFormBuilder v0.1.38 (2026-08-03). Same features; new identity so both widgets
coexist while this one is iterated. Widget id: olari.formstudiobuilder.FormStudioBuilder.

## Why a redesign
The v1 widget talks to Mendix in 7 stringly-typed JSON blobs (DefinitionJson, AnswersJson,
TokenContextJson, PdfTokenContextJson, SystemSectionHtmlJson, SnippetsJson, token catalog). Every
server-side bug class of 2026-07-31 (string-surgery parsing, escaping corruption, HTML injection,
count drift) lived on the server side of that contract because microflows are a bad place to
produce/consume JSON. The redesign makes the widget speak Mendix natively.

## Iteration plan (in order)
1. ✅ DONE (0.2.0, commit b533f20) Token catalog via datasource — `tokenCatalogSource` + key/label/
   kind/fieldType/defaultLabel/optionsJson/canonical/sourcePath attrs. `tokenCatalogSchemaJsonAttr`
   is now a deprecated fallback, used only when the datasource is absent/unavailable (an empty
   datasource is a real empty catalog and does NOT fall back). Kind accepts widget kinds
   (client/doc/computed/sharedField) or Mendix TokenSourceType names (Computed/DerivedFromEntity/
   FormAnswer/UserEntered), else is derived from the key prefix. Server side: `FormStudio.
   DS_TokenDef_Catalog` (active TokenDefs, Category+DisplayName sort, User+Admin) added — wire it to
   the widget's Token catalog datasource, mapping Catalog: source path → TokenDef.SourcePath.
   WIRED 2026-08-04 on `FormStudio.Template_Designer`: widget swapped to this one (widgetId set +
   App → Tools → Update Widgets), Token catalog datasource → DS_TokenDef_Catalog. Runtime verified:
   designer loads from this bundle (widgets/olari/formstudiobuilder/FormStudioBuilder.js), template
   opens with all fields/panels, no regression.
   FULLY WIRED + RUNTIME-VERIFIED 2026-08-04 (second pass): the 7 attribute bindings were applied
   via pg_patch_page on the LightPage object keys (tokenCatalogKeyAttr=TokenKey, Label=DisplayName,
   FieldType, DefaultLabel, OptionsJson, Canonical=IsCanonical, SourcePath) — this is the API route
   that WORKS; ped deep-sets on WidgetProperty values land on renumbered slots. "kind or source type"
   left unbound by design (kind derives from key prefix). PROOF the datasource path is live: React
   fiber inspection of the mounted widget shows tokenCatalogSource status=available, 15 items, keys
   readable via the bound ListAttributeValue (client.full_name, ...). The JSON fallback is therefore
   skipped. SUB_Tokens_BuildCatalogJson is now RETIRABLE (server side) once Bill confirms the picker
   UX; keep the fallback prop through the migration window.
   DEBT: the page carries duplicate (empty) WidgetProperty entries from Update Widgets; harmless, not
   removable via API; Studio Pro should normalize on next UI edit of the widget.
2. ✅ WIDGET + SERVER DONE (0.2.0, 2026-08-04) Snippets via datasource — `snippetsSource` +
   snippetNameAttr/snippetTextAttr/snippetScopeAttr (id = Mendix object id). JSON attr is the
   deprecated fallback (same undefined-vs-empty semantics as the catalog). Server:
   `FormStudio.DS_Snippet_ForDocument(ADoc)` reproduces SUB_FormDocument_BuildSnippetsJson's
   visibility rules exactly (Team-or-owner check, DocumentTypesCsv filter, role targeting via
   Snippet_UserRole_Staff + RolesCsv fallback) and returns the filtered Snippet list, Name-sorted.
   NOT YET WIRED: snippets only matter in VIEWER fill mode; no viewer page runs this widget yet.
   Wire when a viewer page (e.g. Form_Editor_Tabs) is swapped — CAUTION: Form_Editor_Tabs contains a
   DocumentViewer with a file-type prop; do that swap in Studio Pro, NOT via pg_patch (known wipe
   hazard). Datasource: ctx = FormDocument data view → DS_Snippet_ForDocument. After wiring +
   verification, SUB_FormDocument_BuildSnippetsJson and FormDocument.SnippetsJson are retirable.
3. ✅ WIDGET DONE (0.2.0, 2026-08-04) System sections as data, not HTML — new Form-context
   attribute `systemSectionDataJsonAttr` (appended at END of the nested property list; ordering
   rule). Contract: {slotKey: {title?, columns:[...], rows:[[cell,...]], emptyText?, meta?}}.
   The widget renders the table itself — every cell/title/meta goes through escapeHtml, so
   injection is impossible by construction — and emits the SAME fs-live-vitals/fs-vitals-table
   markup+classes as the legacy server HTML, so styling and the PDF pipeline are untouched.
   Per-slot precedence: data slots OVERRIDE systemSectionHtmlJsonAttr slots; both may coexist
   during migration.
   SERVER NOT YET BUILT (deliberate): a SUB_FormDocument_BuildSystemSectionData producing the rows
   contract replaces the 5 SUB_SystemHtml_* builders — but building it now would mean maintaining
   both paths with no consumer; it lands WITH the viewer-page swap milestone (Form_Editor_Tabs swap
   must happen in Studio Pro — DocumentViewer file-prop hazard). Until then the escaping-hardened
   HTML builders remain the live path. UNTESTED at runtime for the same reason (no viewer page runs
   this widget); logic is TS-checked and mirrors the legacy markup exactly.
4. ✅ DONE + RUNTIME-VERIFIED (0.2.0, 2026-08-04) Fields manifest — every designer save now writes
   `fieldsManifestVersion: 1` + `fieldsManifest: [{key,type,label,required,options?,tokenKey?,
   prefillTokenKey?,multiSelect?,section?,sectionOrder?,systemTemplateType?}]` alongside the
   component tree (serialized LAST; named fieldsManifest because parseDefinition claims a top-level
   `fields` array as legacy components; tokenKey = sharedFieldRef || legacy tokenKey). Readers
   ignore it; round-trip verified in the designer. Server: SUB_TemplateFields_Snapshot now anchors
   its '"key"' walk AFTER the fieldsManifest marker when present — manifest entries only (no more
   datagrid-column keys or double counting; a manifest-bearing draft snapshotted 18 rows on the old
   parser, exactly 9 on the new one; 43 legacy versions unchanged at 1571 rows). Full version bump
   of "version" deferred until a real shape change.
5. ✅ MOSTLY DONE (0.2.0, 2026-08-04) Widget-native toasts — top-level `toastMessageAttr`
   (Behavior; bound to the context entity's LastToastMessage): the widget parses
   'text|success|timestamp' (|error|/|info|), renders its own toast stack
   (.rjsf-builder__toasts, click-to-dismiss, 4.5s auto-hide), dedupes by timestamp via ref +
   sessionStorage, and does NOT write the attribute back (clearing marks the context object dirty
   and re-triggers change machinery — observed as a double toast; dedupe alone is the fix).
   WIRED on Template_Designer (toastMessageAttr → FormTemplateVersion.LastToastMessage) and the
   page's jsToastRelay JS-snippet widget is REMOVED. Runtime-verified 'Template saved' renders from
   the widget; the double-fire was reproduced and fixed (single-toast RETESTED after the fix: exactly one
   'Template saved' toast). NOTE the attribute channel itself remains (Mendix has no other microflow→widget push);
   the side-channel is now contained: no page JS, one display path, dedupe enforced.
   WIRING NOTE: top-level widget-object keys persist via pg_patch ONLY after Studio Pro has loaded
   the new .mpk — F5 (build+run) is the reliable reload; F4 and App→Tools→Update Widgets were NOT
   sufficient/verified for this (see Bill's correction 2026-08-04).
6. ✅ DONE (warn-only) (2026-08-04) Formalize AnswersJson — documented (see "AnswersJson contract"
   below) + runtime-asserted: `assertAnswersShape` walks the top-level entries right before every
   `formDataAttr` write (both the `persist` and `persistDataOnly` paths) and `console.warn`s once
   per key when a value is a non-array plain object (nested object = contract breach for the
   FormAnswer pipeline). Warn-only by design: the value is kept unchanged (no data loss); HARD
   enforcement (rejecting/flattening the value) is DEFERRED until the step-7 single-write-path work
   lands and the server consumers are confirmed manifest-aware. `__sectionVisibility` (widget-
   internal map) is exempt.
7. ✅ RESOLVED 2026-08-04 (no change needed) — audit confirmed ACT_FormDocumentSection_SaveAnswers
   is already minimal: AnswersJson commit (canonical trigger; BCo handler rides it) + LastAutoSavedAt
   + one RecomputeRequired call that is the SOLE maintainer of the doc-level AllRequiredComplete flag
   (kept by design). All other recompute call sites audited: each remaining call is necessary (gates
   on the fresh return value or flips the doc flag after adding a section). Runtime-verified: autosave
   marker landed in AnswersJson + FormAnswer rows via the before-commit handler. FLAGGED (not fixed):
   RecomputeRequired's per-section loop re-commits sections → BCo runs twice per autosave (identical
   data, harmless); surgical fix if ever wanted = stop re-committing unchanged sections inside
   SUB_Section_ComputeRequiredComplete, NOT touching SaveAnswers.
8. Split the 15.9k-line monolith (RjsfFormBuilder.tsx) into modules: designer/, viewer/, pdf/,
   tokens/, schema/. Mechanical but big; do after the contract changes so churn happens once.
9. ✅ DONE (2026-08-04) Builder-enforced governance — shared-bound fields
   (sharedFieldRef set) now HARD-BLOCK key renames (was a warn-and-allow) and type changes in the
   properties panel, with a message pointing at unbinding first; mirrors the server publish guard.
   OPTIONS APPEND-ONLY DONE (2026-08-04): enforced at the single chokepoint
   `persistChoiceOptionsDraft` (every options-editor mutation funnels through it) via a
   set-difference check — any previously-persisted option VALUE missing from the next set is
   blocked with a message and the draft rows re-sync to the persisted options.
   BLOCKED on shared-bound fields: removing an option row (X button); renaming an option's
   canonical value (Value input); editing the Label of a row whose Value column is blank (there
   the label IS the canonical value). ALLOWED: adding new options (+ Add another); Up/Down
   reordering (order is not identity); Label edits on rows with an explicit Value (stored in
   optionLabels, not options); Score edits (optionScores).
   STILL OPEN (tracked, not step 9's scope anymore): 'published-anywhere' awareness for
   NON-shared fields (needs published-usage data the widget doesn't have yet — could ride the
   TemplateField datasource). Runtime test pending (needs a template with a shared-bound field).

## AnswersJson contract
The serialized answers object (written to `formDataAttr`) is a FLAT map keyed by field key.
- Keys: field keys, charset `[a-zA-Z0-9_]` (normalizeKey output). `__sectionVisibility` is a
  reserved widget-internal key (section-rule state) and is NOT an answer.
- Values: string | number | boolean | string[] | array of flat row objects. Consumers stringify
  values as needed — the widget does not pre-stringify scalars.
- Multi-select fields: encoded as a string array of option values.
- Datagrid / repeat-group fields: encoded as an array of row objects; each row is itself a flat
  {columnKey: scalar} map (no deeper nesting).
- No other top-level non-array objects are allowed; `assertAnswersShape` warns (once per key per
  session) when one appears, but currently keeps the value (warn-only, hard enforcement deferred).
- Server consumers depending on this shape: FormAnswer materialization, carry-forward probes, and
  required-count checks.

## Viewer milestone — DONE 2026-08-04 (evening)
Form_Editor_Tabs swapped to this widget (ped widgetId set; CE0463 cleared via Error List right-click
"Update widget" — App>Tools>"Update Widgets..." is the MARKETPLACE updater, wrong tool). Wired via
targeted pg: snippetsSource → DS_Snippet_ForDocument (ADoc auto-resolves from context) + name/text/
scope attrs; toastMessageAttr needed an ASSOCIATION-PATH AttributeRef (widget sits in a
FormDocumentSection listview → steps FormDocumentSection_FormDocument → LastToastMessage).
jsToastRelay removed. HAZARD CONFIRMED: even targeted pg ops on that page wipe the DocumentViewer's
file prop — repaired twice via UIA (Select Entity → dvLockedPdf/DocPdf). Server:
FormDocument.SystemSectionDataJson attr + SUB_FormDocument_BuildSystemSectionData (5 slots, data
rows, escaped) called at start of BuildSystemSectionHtml. RUNTIME VERIFIED: new bundle serves the
doc editor, sections render, autosave works, SystemSectionDataJson = valid JSON with 5 slots and
real rows, single 'Document created' toast. Steps 2+3 wiring therefore COMPLETE except the one
manual nested binding: systemSectionDataJsonAttr inside Form context (Studio Pro only). Retirements
still blocked: BuildCatalogJson (PrepareForDesigner writes TokenCatalogJson), BuildSnippetsJson
(ACT_FormDocument_Open + Form_Editor_Tabs_2 still on old widget).

## QA fixes 2026-08-04
- Snippets popover close-on-blur: SnippetsLayer now closes on any outside pointerdown
  (document-level capture listener while open; clicks inside the portaled popover/trigger root are
  ignored, a click on the target field just closes the popover), closes when focus lands outside the
  popover/target field (document-level focusin — container focusout never fires once focus is inside
  the portal), and clears fully when the target field unmounts (MutationObserver on the widget
  container). Esc/Enter/arrow behavior unchanged. Fixes the popover lingering through sign/void
  flows and matching [role=dialog] queries while stale.
- Viewer a11y label associations: custom widgets now carry the RJSF field id so the library-rendered
  <label for=...> resolves — SignatureWidget (id on canvas in draw mode, id+name on the typed-name
  input in type mode), ContentBlockWidget and SystemDatagrid2PlaceholderWidget (id on root div).
  MatrixGridField title was a <label> associated with nothing → now a span with a stable
  `${fieldId}__title` id referenced by role="group" + aria-labelledby on the matrix container
  (radio cells keep their aria-labels). Snippets search input gained name + aria-label. Not fixable
  here: label-for on RJSF's own radio/checkboxes groups points at the library's container div, and
  matrix radios have no per-cell <label> elements (aria-label only) — both are @rjsf/core rendering,
  out of widget scope without restructuring.

## Build/deploy
npm install; npm run build → dist/<version>/olari.FormStudioBuilder.mpk (also auto-copied to the
Mendix project's widgets/ if configured). Deploy: copy .mpk to Olari-main/widgets, F5 in Studio Pro.
