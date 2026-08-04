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
1. Token catalog via datasource — replace tokenCatalogSchemaJsonAttr with a TokenDef datasource
   (key/label/fieldType/defaultLabel/options/canonical attrs). Server deletes SUB_Tokens_BuildCatalogJson.
   Keep the JSON attr as deprecated fallback during migration.
2. Snippets via datasource — same treatment for snippetsJsonAttr (Snippet datasource: id/name/text/scope).
3. System sections as data, not HTML — server currently ships hand-escaped HTML inside
   SystemSectionHtmlJson. The widget already supports per-slot Mendix widget containers
   (activeMedicationsDatagrid2 etc.) — prefer those everywhere; for PDF output, accept ROWS
   (JSON data: columns+values) and render the table in React. Kills the 5 copy-paste
   SUB_SystemHtml_* microflows and the injection class permanently.
4. Versioned DefinitionJson contract — treat "version" as a real contract; bump on shape changes;
   emit a flat fields manifest (key/type/label/required/options/tokenKey/section/sectionOrder)
   alongside the component tree so FormStudio.SUB_TemplateFields_Snapshot becomes a trivial loop
   instead of a string parser.
5. Kill the LastToastMessage side-channel — use proper action props + a transient message; the
   'text|success|timestamp' attribute bus caused the double-toast bug and pollutes FormDocument rows.
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
