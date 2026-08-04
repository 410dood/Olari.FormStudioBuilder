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
   the widget; the double-fire was reproduced and fixed (final single-toast retest pending next
   deploy). NOTE the attribute channel itself remains (Mendix has no other microflow→widget push);
   the side-channel is now contained: no page JS, one display path, dedupe enforced.
   WIRING NOTE: top-level widget-object keys persist via pg_patch ONLY after Studio Pro has loaded
   the new .mpk — F5 (build+run) is the reliable reload; F4 and App→Tools→Update Widgets were NOT
   sufficient/verified for this (see Bill's correction 2026-08-04).
6. Formalize AnswersJson — document + runtime-assert: flat map, string values, stable key charset,
   documented multi-select encoding. Server (FormAnswer materialization + carry-forward probes)
   depends on this shape.
7. One write path for answers — widget commits AnswersJson directly AND pages call SaveAnswers;
   pick the widget's direct commit as canonical (the FormDocumentSection before-commit handler now
   recomputes counts + materializes FormAnswer rows on any commit) and slim SaveAnswers to UX only.
8. Split the 15.9k-line monolith (RjsfFormBuilder.tsx) into modules: designer/, viewer/, pdf/,
   tokens/, schema/. Mechanical but big; do after the contract changes so churn happens once.
9. Builder-enforced governance — options append-only once published; disable key/type edits on
   published fields (server guards exist; the UI should stop users before the error).

## Build/deploy
npm install; npm run build → dist/<version>/olari.FormStudioBuilder.mpk (also auto-copied to the
Mendix project's widgets/ if configured). Deploy: copy .mpk to Olari-main/widgets, F5 in Studio Pro.
