import {
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  isValidElement,
  createElement,
  forwardRef,
  Fragment,
  ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import type {
  ActionValue,
  DynamicValue,
  EditableValue,
  ListAttributeValue,
  ListValue,
  ObjectItem
} from "mendix";
import { Big } from "big.js";
import Form from "@rjsf/core";
import { getTemplate } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import "./ui/FormStudioBuilder.css";
import "./ui/FormStudioBuilder-pdf.css";
type JsonObject = Record<string, any>;
type ViewMode = "designer" | "viewer";
type SystemTemplateSlotProperty =
  | "activeMedicationsDatagrid2"
  | "activeAllergiesDatagrid2"
  | "chartDiagnosisDatagrid2"
  | "billingDiagnosisDatagrid2"
  | "activeBillingCodesDatagrid2"
  | "recentDrugTestDatagrid2"
  | (string & {});
type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "integer"
  | "checkbox"
  | "date"
  | "email"
  | "select"
  | "radio"
  | "yesno"
  | "switch"
  | "time"
  | "datetime"
  | "contentBlock"
  | "datagrid"
  | "systemDatagrid2"
  | "signature"
  | "total"
  | "matrix"
  | "slider";
type DataGridColumnType = Exclude<
  FieldType,
  | "datagrid"
  | "signature"
  | "total"
  | "contentBlock"
  | "matrix"
  | "slider"
  | "datetime"
>;
/** Date fields: which part of a date the field captures. */
type DateGranularity = "full" | "monthYear" | "month" | "year" | "day";
/** Date fields: how the captured date prints in narratives/documents. */
type DateDisplayFormat = "numeric" | "long" | "iso";
type TimeDisplayFormat = "12h" | "24h";
type LayoutTemplateType = "layout_section" | "layout_datagrid_compact";
type SystemTemplateType =
  | "active_medications"
  | "active_allergies"
  | "chart_diagnosis"
  | "billing_diagnosis"
  | "active_billing_codes"
  | "recent_drug_test"
  | (string & {});
type LabelLayout = "block" | "inline";
type VisibilityOperator =
  | "equals"
  | "notEquals"
  | "truthy"
  | "falsy"
  | "greaterThan"
  | "lessThan"
  | "greaterOrEqual"
  | "lessOrEqual"
  | "contains"
  | "startsWith";
const VISIBILITY_OPERATORS: readonly VisibilityOperator[] = [
  "equals",
  "notEquals",
  "truthy",
  "falsy",
  "greaterThan",
  "lessThan",
  "greaterOrEqual",
  "lessOrEqual",
  "contains",
  "startsWith"
];
const NUMERIC_VISIBILITY_OPERATORS: ReadonlySet<VisibilityOperator> = new Set([
  "greaterThan",
  "lessThan",
  "greaterOrEqual",
  "lessOrEqual"
] as VisibilityOperator[]);
function compareVisibilityNumbers(
  operator: VisibilityOperator,
  actual: number,
  expected: number
): boolean {
  switch (operator) {
    case "greaterThan":
      return actual > expected;
    case "lessThan":
      return actual < expected;
    case "greaterOrEqual":
      return actual >= expected;
    case "lessOrEqual":
      return actual <= expected;
    default:
      return false;
  }
}
type ConditionMode = "all" | "any";
type ThemePreset = "clean" | "compact" | "contrast" | "mendix";
type BuilderTab = "designer" | "json" | "preview" | "documentOutput";
type RightPanelTab = "properties" | "documentOutput" | "validation";
type TokenPickerSource = "form" | "client" | "computed";
type DropPlacement = "before" | "after";
type SectionMoveDirection = "up" | "down";
type SectionSettingsUpdate = {
  sectionTitle?: string;
  sectionOrder?: number;
  sectionCollapsible?: boolean;
  sectionCollapsedByDefault?: boolean;
  sectionSwitchEnabled?: boolean;
};
interface DataSourceItem {
  formDefinitionAttr?: EditableValue<string>;
  formTitleAttr?: EditableValue<string>;
  formDescriptionAttr?: EditableValue<string>;
  tokenContextJsonAttr?: EditableValue<string>;
  snippetsJsonAttr?: EditableValue<string>;
  tokenCatalogSchemaJsonAttr?: EditableValue<string>;
  systemTemplatesConfigJsonAttr?: EditableValue<string>;
  systemSectionDataJsonAttr?: EditableValue<string>;
  resolvedOutputHtmlAttr?: EditableValue<string>;
  resolvedPdfHtmlAttr?: EditableValue<string>;
  formDataAttr?: EditableValue<string>;
  fieldCountAttr?: EditableValue<Big>;
  requiredFieldCountAttr?: EditableValue<Big>;
  sectionCountAttr?: EditableValue<Big>;
  completionPercentAttr?: EditableValue<Big>;
  onChangeAction?: ActionValue;
  onSaveAction?: ActionValue;
  onExportPdfAction?: ActionValue;
  onManageSnippets?: ActionValue;
  publishFieldKeyAttr?: EditableValue<string>;
  onPublishFieldAction?: ActionValue;
}
export interface FormStudioBuilderProps {
  name: string;
  class: string;
  style?: CSSProperties;
  tabIndex?: number;
  dataSource?: DataSourceItem[];
  tokenContextSource?: ListValue;
  tokenContextKeyAttr?: ListAttributeValue<string | Big>;
  tokenContextValueAttr?: ListAttributeValue<string | Big | boolean | Date>;
  tokenCatalogSource?: ListValue;
  tokenCatalogKeyAttr?: ListAttributeValue<string>;
  tokenCatalogLabelAttr?: ListAttributeValue<string>;
  tokenCatalogKindAttr?: ListAttributeValue<string>;
  tokenCatalogFieldTypeAttr?: ListAttributeValue<string>;
  tokenCatalogDefaultLabelAttr?: ListAttributeValue<string>;
  tokenCatalogOptionsJsonAttr?: ListAttributeValue<string>;
  tokenCatalogCanonicalAttr?: ListAttributeValue<boolean>;
  tokenCatalogSourcePathAttr?: ListAttributeValue<string>;
  snippetsSource?: ListValue;
  snippetNameAttr?: ListAttributeValue<string>;
  snippetTextAttr?: ListAttributeValue<string>;
  snippetScopeAttr?: ListAttributeValue<string>;
  toastMessageAttr?: EditableValue<string>;
  signatureImageAttr?: EditableValue<string>;
  viewMode?: ViewMode;
  showPalettePanel?: boolean | DynamicValue<boolean>;
  showComponentsPanel?: boolean | DynamicValue<boolean>;
  showSectionPanel?: boolean | DynamicValue<boolean>;
  showPropertiesPanel?: boolean | DynamicValue<boolean>;
  showPreviewPanel?: boolean | DynamicValue<boolean>;
  showLayoutTools?: boolean | DynamicValue<boolean>;
  showViewerHeader?: boolean | DynamicValue<boolean>;
  showDocumentPreview?: boolean | DynamicValue<boolean>;
  previewFlow?: "cards" | "continuous";
  formLiveValidate?: boolean | DynamicValue<boolean>;
  saveButtonText?: string;
  exportPdfButtonText?: string;
  viewerHeaderWidget?: ReactNode;
  designerHeaderWidget?: ReactNode;
  viewerThemePreset?: ThemePreset;
  activeMedicationsDatagrid2?: ReactNode;
  activeAllergiesDatagrid2?: ReactNode;
  chartDiagnosisDatagrid2?: ReactNode;
  billingDiagnosisDatagrid2?: ReactNode;
  activeBillingCodesDatagrid2?: ReactNode;
  recentDrugTestDatagrid2?: ReactNode;
}
interface VisibilityRule {
  id: string;
  whenKey?: string;
  operator?: VisibilityOperator;
  value?: string;
}
interface VisibilityConfig {
  mode?: ConditionMode;
  rules: VisibilityRule[];
}
interface MatrixRowConfig {
  key: string;
  label: string;
}
interface RepeatGroupConfig {
  key: string;
  title?: string;
  minItems?: number;
  maxItems?: number;
  defaultItems?: number;
  asDataGrid?: boolean;
}
interface FormComponent {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  documentOutputTemplate?: string;
  /** Per-answer document output: option value -> narrative template ("" omits the field). */
  optionOutputTexts?: Record<string, string>;
  placeholder?: string;
  defaultValue?:
    | string
    | number
    | boolean
    | string[]
    | JsonObject[]
    | JsonObject;
  /** Weak reference: seeds a value from the token context when the form opens. */
  prefillTokenKey?: string;
  /** Strong reference: this field IS the shared field (key/type/options locked). */
  sharedFieldRef?: string;
  /** @deprecated legacy single-attribute binding; parsed into the two above. */
  tokenKey?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customErrorMessage?: string;
  hideOutputIfEmpty?: boolean;
  hideLabel?: boolean;
  labelLayoutOverride?: LabelLayout;
  /** "modern": segmented-button radios / boxed checkboxes. "switch": toggle
   *  rendering for checkbox (absorbs the former "switch" field type). */
  optionStyle?: "modern" | "switch";
  /** Number fields: how the numeric input renders. undefined = plain input;
   *  "stepper": −/+ counter; "slider": range track (absorbs the former
   *  "slider" field type); "scale": segmented buttons from min..max by step. */
  numberStyle?: "stepper" | "slider" | "scale";
  /** Number fields: restrict answers to whole numbers (absorbs the former
   *  "integer" field type). */
  wholeNumber?: boolean;
  sectionSwitchEnabled?: boolean;
  multiSelect?: boolean;
  contentText?: string;
  options?: string[];
  optionLabels?: Record<string, string>;
  optionScores?: Record<string, number>;
  matrixRows?: MatrixRowConfig[];
  /** Matrix-only: a required matrix counts as answered only when EVERY row has
   *  a value (default: any one row). Serialized alongside matrixRowKeysFlat so
   *  the server-side required counter can enforce the same rule. */
  matrixRequireAllRows?: boolean;
  /** Derived on serialize: pipe-joined row keys, present only when
   *  matrixRequireAllRows is on. Read by SUB_TemplateFields_Snapshot. */
  matrixRowKeysFlat?: string;
  datagridColumns?: DataGridColumn[];
  datagridRowIdKey?: string;
  /** Datagrid: "table" renders one shared header row of column labels with
   *  compact label-less rows; undefined keeps the stacked per-row labels. */
  datagridDisplay?: "table";
  systemTemplateType?: SystemTemplateType;
  systemTemplateSlotProperty?: SystemTemplateSlotProperty;
  /** Date/datetime: which part of the date is captured (default "full").
   *  Values store as: full "YYYY-MM-DD", monthYear "YYYY-MM", month "MM",
   *  year "YYYY", day "DD"; datetime always full, "YYYY-MM-DD HH:mm". */
  dateGranularity?: DateGranularity;
  /** Date/datetime: narrative/print format (default "numeric", e.g. 8/20/2026;
   *  "long" = August 20, 2026; "iso" = 2026-08-20). */
  dateDisplayFormat?: DateDisplayFormat;
  /** Time/datetime: narrative/print format (default "12h"). */
  timeDisplayFormat?: TimeDisplayFormat;
  sumSources?: string[];
  /** Total-only: interpretation bands, e.g. 10-14 -> "Moderate depression".
   *  The matched label is exposed as the {key_band} token. */
  scoreBands?: Array<{ min: number; max: number; label: string }>;
  /** Total-only: render the total as "n / N" where N is the maximum possible
   *  score derived from the scored source fields. */
  showMaxScore?: boolean;
  section?: string;
  /**
   * Stable section identity. Shared by every component in the same section;
   * survives section renames (the title is display text only once this is
   * set). Assigned on designer save; absent on legacy definitions, which
   * keep title-derived section keys.
   */
  sectionId?: string;
  sectionOrder?: number;
  sectionColumns?: number;
  sectionColumn?: number;
  sectionCollapsible?: boolean;
  sectionCollapsedByDefault?: boolean;
  columnSpan?: number;
  repeatGroup?: RepeatGroupConfig;
  visibility?: VisibilityConfig;
}
interface FormDefinition {
  version: number;
  title?: string;
  description?: string;
  pdfHeaderTemplate?: string;
  pdfFooterTemplate?: string;
  hidePdfHeaderIfEmpty?: boolean;
  hidePdfFooterIfEmpty?: boolean;
  hidePdfTitleBlock?: boolean;
  builderOptions?: BuilderOptions;
  components: FormComponent[];
}
interface ChoiceOptionDraft {
  id: string;
  label: string;
  value: string;
  score: string;
}
interface TokenPickerOption {
  key: string;
  label: string;
}
interface DataGridColumn {
  id: string;
  key: string;
  label: string;
  type: DataGridColumnType;
  required?: boolean;
  columnSpan?: number;
  options?: string[];
}
interface SystemTemplateColumnDefinition {
  key: string;
  label: string;
  type: DataGridColumnType;
  required?: boolean;
  columnSpan?: number;
  options?: string[];
}
interface SystemTemplateDefinition {
  type: SystemTemplateType;
  label: string;
  titlePrefix: string;
  keyBase: string;
  datagrid2Snippet: string;
  rowIdKey?: string;
  systemTemplateSlotProperty: SystemTemplateSlotProperty;
  documentOutputTemplate?: string;
  columns: SystemTemplateColumnDefinition[];
  /* Kept for rendering existing placements but not offered in the palette. */
  hiddenFromPalette?: boolean;
}
interface UndoSnapshot {
  definition: FormDefinition;
  formData: JsonObject;
  selectedId: string | null;
}
interface PrintLayoutItem {
  html: string;
  sectionColumn?: number;
  span: number;
  fullWidth?: boolean;
}
interface BuilderOptions {
  snapToGrid: boolean;
  snapToResize: boolean;
  labelLayout: LabelLayout;
  /** Inline-label column width in twelfths of the field row (2–6).
   *  Undefined keeps the built-in 220px cap (≈ Mendix's default col-3). */
  labelWidth?: number;
  showLayoutSection: boolean;
  /** "wizard" fills one section per page with gated Next; "scroll" is the
   *  classic continuous form. */
  fillMode: "scroll" | "wizard";
}
const DEFAULT_BUILDER_OPTIONS: BuilderOptions = {
  snapToGrid: true,
  snapToResize: true,
  labelLayout: "block",
  showLayoutSection: true,
  fillMode: "scroll"
};
const DEFAULT_FORM: FormDefinition = {
  version: 1,
  title: "Untitled Form",
  description: "",
  pdfHeaderTemplate: undefined,
  pdfFooterTemplate: undefined,
  hidePdfHeaderIfEmpty: false,
  hidePdfFooterIfEmpty: false,
  hidePdfTitleBlock: false,
  builderOptions: DEFAULT_BUILDER_OPTIONS,
  components: []
};
const UNDO_STACK_LIMIT = 100;
const FIELD_TYPES: Array<{ type: FieldType; label: string }> = [
  { type: "text", label: "Text input" },
  { type: "textarea", label: "Textarea" },
  { type: "number", label: "Number" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "email", label: "Email" },
  { type: "select", label: "Dropdown" },
  { type: "radio", label: "Radio group" },
  { type: "yesno", label: "Yes/No" },
  { type: "switch", label: "Switch" },
  { type: "time", label: "Time" },
  { type: "datetime", label: "Date & time" },
  { type: "contentBlock", label: "Content Block" },
  { type: "datagrid", label: "Datagrid" },
  { type: "systemDatagrid2", label: "System Template" },
  { type: "signature", label: "Signature" },
  { type: "total", label: "Calculated total" },
  { type: "matrix", label: "Matrix / rating grid" }
];
const DATAGRID_COLUMN_TYPES: Array<{
  type: DataGridColumnType;
  label: string;
}> = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Textarea" },
  { type: "number", label: "Number" },
  { type: "integer", label: "Integer" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "time", label: "Time" },
  { type: "email", label: "Email" },
  { type: "select", label: "Dropdown" },
  { type: "radio", label: "Radio group" }
];
const LAYOUT_TEMPLATES: Array<{
  type: LayoutTemplateType;
  label: string;
  columns: number;
  collapsible?: boolean;
  titlePrefix: string;
}> = [
  {
    type: "layout_section",
    label: "Section (1 column)",
    columns: 1,
    collapsible: true,
    titlePrefix: "Section"
  },
  {
    type: "layout_datagrid_compact",
    label: "Data grid (compact rows)",
    columns: 1,
    titlePrefix: "Data Grid"
  }
];
const SYSTEM_TEMPLATES: SystemTemplateDefinition[] = [
  {
    type: "active_medications",
    label: "Active Medications",
    titlePrefix: "Active Medications",
    keyBase: "activeMedications",
    systemTemplateSlotProperty: "activeMedicationsDatagrid2",
    datagrid2Snippet: "snippet_active_medications_datagrid2",
    rowIdKey: "id",
    columns: [
      {
        key: "medicationName",
        label: "Medication",
        type: "text",
        required: true,
        columnSpan: 4
      },
      { key: "dose", label: "Dose", type: "text", columnSpan: 2 },
      { key: "frequency", label: "Frequency", type: "text", columnSpan: 2 },
      {
        key: "route",
        label: "Route",
        type: "select",
        columnSpan: 2,
        options: ["PO", "IM", "IV", "SubQ", "Topical", "Other"]
      },
      { key: "isActive", label: "Active", type: "checkbox", columnSpan: 2 }
    ]
  },
  {
    type: "active_allergies",
    label: "Active Allergies",
    titlePrefix: "Active Allergies",
    keyBase: "activeAllergies",
    systemTemplateSlotProperty: "activeAllergiesDatagrid2",
    datagrid2Snippet: "snippet_active_allergies_datagrid2",
    rowIdKey: "id",
    columns: [
      {
        key: "allergen",
        label: "Allergen",
        type: "text",
        required: true,
        columnSpan: 4
      },
      { key: "reaction", label: "Reaction", type: "text", columnSpan: 4 },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        columnSpan: 2,
        options: ["Minor", "Moderate", "Severe", "Life Threatening"]
      },
      { key: "active", label: "Active", type: "checkbox", columnSpan: 2 }
    ]
  },
  {
    type: "chart_diagnosis",
    label: "Chart Diagnosis",
    titlePrefix: "Chart Diagnosis",
    hiddenFromPalette: true,
    keyBase: "chartDiagnosis",
    systemTemplateSlotProperty: "chartDiagnosisDatagrid2",
    datagrid2Snippet: "snippet_chart_diagnosis_datagrid2",
    rowIdKey: "id",
    columns: [
      {
        key: "diagnosisCode",
        label: "Diagnosis code",
        type: "text",
        required: true,
        columnSpan: 3
      },
      {
        key: "diagnosisName",
        label: "Diagnosis",
        type: "text",
        required: true,
        columnSpan: 5
      },
      { key: "onsetDate", label: "Onset date", type: "date", columnSpan: 2 },
      {
        key: "status",
        label: "Status",
        type: "select",
        columnSpan: 2,
        options: ["Active", "Resolved", "Inactive"]
      }
    ]
  },
  {
    type: "billing_diagnosis",
    label: "Assessment / Diagnoses",
    titlePrefix: "Assessment / Diagnoses",
    keyBase: "billingDiagnosis",
    systemTemplateSlotProperty: "billingDiagnosisDatagrid2",
    datagrid2Snippet: "snippet_billing_diagnosis_datagrid2",
    rowIdKey: "id",
    columns: [
      {
        key: "icd10Code",
        label: "ICD-10",
        type: "text",
        required: true,
        columnSpan: 3
      },
      {
        key: "diagnosisName",
        label: "Diagnosis",
        type: "text",
        required: true,
        columnSpan: 5
      },
      { key: "priority", label: "Priority", type: "integer", columnSpan: 2 },
      { key: "billable", label: "Billable", type: "checkbox", columnSpan: 2 }
    ]
  },
  {
    type: "active_billing_codes",
    label: "Plan / Billing Codes",
    titlePrefix: "Plan / Billing Codes",
    keyBase: "activeBillingCodes",
    systemTemplateSlotProperty: "activeBillingCodesDatagrid2",
    datagrid2Snippet: "snippet_active_billing_codes_datagrid2",
    rowIdKey: "id",
    columns: [
      {
        key: "code",
        label: "Code",
        type: "text",
        required: true,
        columnSpan: 3
      },
      {
        key: "description",
        label: "Description",
        type: "text",
        required: true,
        columnSpan: 5
      },
      { key: "units", label: "Units", type: "number", columnSpan: 2 },
      { key: "active", label: "Active", type: "checkbox", columnSpan: 2 }
    ]
  },
  {
    type: "recent_drug_test",
    label: "Most Recent Drug Test",
    titlePrefix: "Most Recent Drug Test",
    keyBase: "mostRecentDrugTest",
    systemTemplateSlotProperty: "recentDrugTestDatagrid2",
    datagrid2Snippet: "snippet_recent_drug_test_datagrid2",
    rowIdKey: "id",
    documentOutputTemplate:
      "{testDate} Client showed {result} for {substances}.",
    columns: [
      {
        key: "testDate",
        label: "Date",
        type: "date",
        required: true,
        columnSpan: 3
      },
      {
        key: "substances",
        label: "Substances",
        type: "text",
        required: true,
        columnSpan: 5
      },
      {
        key: "result",
        label: "Result",
        type: "select",
        required: true,
        columnSpan: 4,
        options: ["Positive", "Negative", "Inconclusive"]
      }
    ]
  }
];
const FIELD_PALETTE_GROUPS: Array<{
  key: string;
  label: string;
  types: FieldType[];
}> = [
  {
    key: "basic",
    label: "Basic",
    types: [
      "text",
      "textarea",
      "number",
      "date",
      "time",
      "datetime",
      "email"
    ]
  },
  {
    key: "choice",
    label: "Choice",
    types: ["select", "radio", "yesno", "checkbox", "matrix"]
  },
  {
    key: "special",
    label: "Special",
    // "signature" removed from the palette (signatures are handled at the
    // form/document level now); the type itself stays supported so existing
    // templates with signature fields keep working.
    types: ["contentBlock", "datagrid", "total"]
  }
];
const YES_NO_OPTIONS = ["yes", "no"];
const YES_NO_OPTION_LABELS: Record<string, string> = {
  yes: "Yes",
  no: "No"
};
function normalizeYesNoValue(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }
  const normalized = clean(value).toLowerCase();
  if (["yes", "y", "true", "1"].includes(normalized)) {
    return "yes";
  }
  if (["no", "n", "false", "0"].includes(normalized)) {
    return "no";
  }
  return undefined;
}
const FIELD_TYPE_SET = new Set(FIELD_TYPES.map((item) => item.type));
const DATAGRID_COLUMN_TYPE_SET = new Set(
  DATAGRID_COLUMN_TYPES.map((item) => item.type)
);
const LAYOUT_TEMPLATE_SET = new Set(LAYOUT_TEMPLATES.map((item) => item.type));
const SYSTEM_TEMPLATE_SET = new Set(SYSTEM_TEMPLATES.map((item) => item.type));
const SYSTEM_TEMPLATE_SLOT_PROPERTIES = [
  "activeMedicationsDatagrid2",
  "activeAllergiesDatagrid2",
  "chartDiagnosisDatagrid2",
  "billingDiagnosisDatagrid2",
  "activeBillingCodesDatagrid2",
  "recentDrugTestDatagrid2"
] as const;
const SYSTEM_TEMPLATE_SLOT_PROPERTY_SET = new Set(
  SYSTEM_TEMPLATE_SLOT_PROPERTIES as readonly string[]
);
let EXTRA_SYSTEM_TEMPLATES: SystemTemplateDefinition[] = [];
let extraSystemTemplatesFingerprint: string | null = null;
function setExtraSystemTemplates(
  templates: SystemTemplateDefinition[],
  fingerprint: string
): void {
  if (fingerprint === extraSystemTemplatesFingerprint) {
    return;
  }
  extraSystemTemplatesFingerprint = fingerprint;
  EXTRA_SYSTEM_TEMPLATES = templates;
}
function allSystemTemplates(): SystemTemplateDefinition[] {
  return EXTRA_SYSTEM_TEMPLATES.length
    ? [...SYSTEM_TEMPLATES, ...EXTRA_SYSTEM_TEMPLATES]
    : SYSTEM_TEMPLATES;
}
function camelizeTemplateKeyBase(type: string): string {
  const camel = type
    .replace(/[^A-Za-z0-9]+(.)?/g, (_match, chr: string) =>
      chr ? chr.toUpperCase() : ""
    )
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
  return camel || "systemTemplate";
}
function parseSystemTemplatesConfigJson(raw?: string): {
  templates: SystemTemplateDefinition[];
  fingerprint: string;
} {
  const value = raw == null ? "" : String(raw).trim();
  if (!value) {
    return { templates: [], fingerprint: "" };
  }
  try {
    const parsed = JSON.parse(value);
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.templates)
      ? parsed.templates
      : [];
    const templates: SystemTemplateDefinition[] = [];
    const seenTypes = new Set<string>();
    list.forEach((item: any, index: number) => {
      const type =
        item?.type == null && item?.key == null
          ? ""
          : String(item?.type ?? item?.key).trim();
      if (!type || seenTypes.has(type)) {
        return;
      }
      if (SYSTEM_TEMPLATE_SET.has(type as SystemTemplateType)) {
        return;
      }
      const label =
        (item?.label == null && item?.name == null
          ? ""
          : String(item?.label ?? item?.name).trim()) || type;
      const keyBase =
        (item?.keyBase == null ? "" : String(item.keyBase).trim()) ||
        camelizeTemplateKeyBase(type) ||
        `systemTemplate${index + 1}`;
      const slotProperty =
        (item?.systemTemplateSlotProperty == null &&
        item?.slotProperty == null &&
        item?.slotKey == null
          ? ""
          : String(
              item?.systemTemplateSlotProperty ??
                item?.slotProperty ??
                item?.slotKey
            ).trim()) || `${keyBase}Datagrid2`;
      const columnsRaw = Array.isArray(item?.columns) ? item.columns : [];
      const columns: SystemTemplateColumnDefinition[] = columnsRaw.map(
        (col: any, colIndex: number) => {
          const key =
            (col?.key == null ? "" : String(col.key).trim()) ||
            `col_${colIndex + 1}`;
          const colLabel =
            (col?.label == null ? "" : String(col.label).trim()) || key;
          const colTypeRaw = col?.type == null ? "" : String(col.type).trim();
          const colType = DATAGRID_COLUMN_TYPE_SET.has(
            colTypeRaw as DataGridColumnType
          )
            ? (colTypeRaw as DataGridColumnType)
            : "text";
          const span = Number(col?.columnSpan);
          return {
            key,
            label: colLabel,
            type: colType,
            required: col?.required === true,
            columnSpan: Number.isFinite(span)
              ? Math.min(12, Math.max(1, Math.floor(span)))
              : undefined,
            options: Array.isArray(col?.options)
              ? col.options
                  .map((option: unknown) =>
                    option == null ? "" : String(option)
                  )
                  .filter(Boolean)
              : undefined
          };
        }
      );
      seenTypes.add(type);
      templates.push({
        type: type as SystemTemplateType,
        label,
        titlePrefix:
          (item?.titlePrefix == null ? "" : String(item.titlePrefix).trim()) ||
          label,
        keyBase,
        systemTemplateSlotProperty: slotProperty as SystemTemplateSlotProperty,
        datagrid2Snippet:
          (item?.datagrid2Snippet == null
            ? ""
            : String(item.datagrid2Snippet).trim()) ||
          `snippet_${type}_datagrid2`,
        rowIdKey:
          (item?.rowIdKey == null ? "" : String(item.rowIdKey).trim()) ||
          undefined,
        documentOutputTemplate:
          (item?.documentOutputTemplate == null
            ? ""
            : String(item.documentOutputTemplate)) || undefined,
        columns
      });
    });
    return { templates, fingerprint: value };
  } catch {
    return { templates: [], fingerprint: value };
  }
}
const DRAG_TYPE_NEW = "application/x-olari-new-field";
const DRAG_TYPE_LAYOUT = "application/x-olari-new-layout";
const DRAG_TYPE_SYSTEM = "application/x-olari-new-system-template";
const DRAG_TYPE_SHARED = "application/x-olari-new-shared-field";
const DRAG_TYPE_CLIENT = "application/x-olari-new-client-field";
const DRAG_TYPE_COMPONENT = "application/x-olari-component";
const DRAG_TYPE_PREVIEW_KEY = "application/x-olari-preview-key";
const DRAG_TYPE_REPEAT_GROUP_COMPONENT =
  "application/x-olari-repeat-group-component";
const DRAG_TEXT_PREFIX = "olari-dnd::";
const CONDITION_MODES: Array<{ value: ConditionMode; label: string }> = [
  { value: "all", label: "AND (all rules)" },
  { value: "any", label: "OR (any rule)" }
];
const LABEL_LAYOUT_OPTIONS: Array<{ value: LabelLayout; label: string }> = [
  { value: "block", label: "Block (top)" },
  { value: "inline", label: "Inline (left)" }
];
const COLUMN_SPAN_SNAP_STOPS = [1, 2, 3, 4, 6, 12];
const SECTION_VISIBILITY_DATA_KEY = "__sectionVisibility";
const PDF_PRINT_SHELL_STYLES = `
  @page {
    size: Letter;
    margin: 0.55in;
  }

  html.rjsf-builder__pdf-html,
  body.rjsf-builder__pdf-body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  body.rjsf-builder__pdf-body,
  .rjsf-builder__pdf-document {
    font-family: "Segoe UI", Arial, sans-serif;
    color: #14213d;
    font-size: 12px;
    line-height: 1.45;
  }

  .rjsf-builder__pdf-document {
    max-width: 7.4in;
    margin: 0 auto;
  }

  .rjsf-builder__pdf-header {
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 2px solid #d9e1ef;
  }

  .rjsf-builder__pdf-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: #0f2f63;
  }

  .rjsf-builder__pdf-description {
    margin: 10px 0 0;
    font-size: 13px;
    color: #526176;
  }

  .rjsf-builder__pdf-form-header {
    margin: 0 0 18px;
    padding: 12px 14px;
    border: 1px solid #d9e1ef;
    border-radius: 10px;
    background: #f8fbff;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rjsf-builder__pdf-form-header > :first-child,
  .rjsf-builder__pdf-form-footer > :first-child {
    margin-top: 0;
  }

  .rjsf-builder__pdf-form-header > :last-child,
  .rjsf-builder__pdf-form-footer > :last-child {
    margin-bottom: 0;
  }

  .rjsf-builder__pdf-form-footer {
    margin: 24px 0 0;
    padding-top: 12px;
    border-top: 1px solid #d9e1ef;
    color: #526176;
    font-size: 11px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rjsf-builder__pdf-section {
    margin: 0 0 24px;
  }

  .rjsf-builder__pdf-columns {
    display: grid;
    gap: 14px;
    align-items: start;
  }

  .rjsf-builder__pdf-columns-segment {
    margin: 0 0 14px;
    break-inside: auto;
    page-break-inside: auto;
  }

  .rjsf-builder__pdf-column {
    min-width: 0;
  }

  .rjsf-builder__pdf-column-content {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 10px;
    min-width: 0;
    align-items: start;
  }

  .rjsf-builder__pdf-layout-item {
    min-width: 0;
    break-inside: avoid;
  }

  .rjsf-builder__pdf-layout-item .rjsf-builder__pdf-block {
    margin: 0;
    height: 100%;
  }

  .rjsf-builder__pdf-full-width {
    margin: 0 0 14px;
    break-inside: auto;
    page-break-inside: auto;
  }

  .rjsf-builder__pdf-full-width .rjsf-builder__pdf-block {
    margin: 0;
  }

  .rjsf-builder__pdf-section-title {
    margin: 0 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #d9e1ef;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #274672;
    break-after: avoid;
    page-break-after: avoid;
  }

  .rjsf-builder__pdf-block {
    margin: 0 0 14px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rjsf-builder__pdf-block--table,
  .rjsf-builder__pdf-block--system {
    break-inside: auto;
    page-break-inside: auto;
  }

  .rjsf-builder__pdf-block-title {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 700;
    color: #14213d;
    break-after: avoid;
    page-break-after: avoid;
  }

  .rjsf-builder__pdf-block-description {
    margin: 0 0 8px;
    font-size: 12px;
    color: #607089;
  }

  .rjsf-builder__pdf-content > :first-child,
  .rjsf-builder__pdf-system-snippet > :first-child {
    margin-top: 0;
  }

  .rjsf-builder__pdf-content > :last-child,
  .rjsf-builder__pdf-system-snippet > :last-child {
    margin-bottom: 0;
  }

  .rjsf-builder__pdf-content p,
  .rjsf-builder__pdf-system-snippet p {
    margin: 0 0 8px;
  }

  .rjsf-builder__pdf-content ul,
  .rjsf-builder__pdf-content ol,
  .rjsf-builder__pdf-system-snippet ul,
  .rjsf-builder__pdf-system-snippet ol {
    margin: 0 0 8px 18px;
    padding: 0;
  }

  .rjsf-builder__pdf-table,
  .rjsf-builder__pdf-system-snippet table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    break-inside: auto;
    page-break-inside: auto;
  }

  .rjsf-builder__pdf-table thead,
  .rjsf-builder__pdf-system-snippet thead {
    display: table-header-group;
  }

  .rjsf-builder__pdf-table th,
  .rjsf-builder__pdf-table td,
  .rjsf-builder__pdf-system-snippet th,
  .rjsf-builder__pdf-system-snippet td {
    border: 1px solid #dfe6f0;
    padding: 8px 10px;
    vertical-align: top;
    text-align: left;
    word-break: break-word;
  }

  .rjsf-builder__pdf-table th,
  .rjsf-builder__pdf-system-snippet th {
    background: #f4f7fb;
    color: #29456f;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .rjsf-builder__pdf-table tr,
  .rjsf-builder__pdf-system-snippet tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rjsf-builder__pdf-empty {
    padding: 14px;
    border: 1px dashed #c9d5e7;
    border-radius: 10px;
    background: #f9fbff;
    color: #607089;
  }

  .rjsf-builder__pdf-signature-draw {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 96px;
    min-width: 240px;
    max-width: 100%;
    padding: 8px 10px;
    border: 1px solid #d9e1ef;
    border-radius: 10px;
    background: #ffffff;
  }

  .rjsf-builder__pdf-signature-draw img {
    display: block;
    max-width: 100%;
    max-height: 110px;
  }

  .rjsf-builder__pdf-signature-type {
    display: inline-block;
    min-width: 240px;
    padding: 8px 0 4px;
    border-bottom: 1px solid #c8d3e3;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 22px;
    color: #0f2f63;
  }
`;
function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1000000)}`;
}
function str(value: unknown): string {
  return value == null ? "" : String(value);
}
function clean(value: unknown): string {
  return str(value).trim();
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
}
function normalizeStatus(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "available";
}
function resolveSectionKey(section?: string): string {
  return normalizeSectionName(section) || "__default";
}
// Section key resolution: stable id when present (designer-saved
// definitions), else the legacy title key. Grouping, visibility maps, DOM
// stamps, and nav-rail keys all flow from this one resolver.
function resolveComponentSectionKey(component: {
  section?: string;
  sectionId?: string;
}): string {
  return clean(component.sectionId) || resolveSectionKey(component.section);
}
function resolveLabelLayoutOverride(value: unknown): LabelLayout | undefined {
  const normalized = clean(value).toLowerCase();
  if (normalized === "inline") {
    return "inline";
  }
  if (normalized === "block" || normalized === "top") {
    return "block";
  }
  return undefined;
}
function parseSectionVisibilityMap(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: Record<string, boolean> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
    const normalizedKey = clean(key);
    if (!normalizedKey) {
      return;
    }
    map[normalizedKey] = toBoolean(raw);
  });
  return map;
}
// Legacy AnswersJson visibility maps are keyed by section TITLE. Definitions
// saved with sectionIds key sections by id instead. When an id-keyed lookup
// would miss but the legacy title key holds a value, mirror the title value
// onto the id key so previously saved answers keep hiding/showing the right
// sections. Id-keyed entries always win (they are written by newer sessions).
function applySectionVisibilityLegacyFallback(
  map: Record<string, boolean>,
  components: FormComponent[]
): Record<string, boolean> {
  let result = map;
  components.forEach((component) => {
    const idKey = clean(component.sectionId);
    if (!idKey || result[idKey] !== undefined) {
      return;
    }
    const titleKey = resolveSectionKey(component.section);
    if (titleKey !== "__default" && map[titleKey] !== undefined) {
      if (result === map) {
        result = { ...map };
      }
      result[idKey] = map[titleKey];
    }
  });
  return result;
}
function resolveBooleanSetting(
  value: boolean | DynamicValue<boolean> | undefined,
  defaultValue: boolean
): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (!value || normalizeStatus((value as any).status) !== "available") {
    return defaultValue;
  }
  if ((value as DynamicValue<boolean>).value == null) {
    return defaultValue;
  }
  return Boolean((value as DynamicValue<boolean>).value);
}
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function stringifyTokenValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toLocaleString("en-US");
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyTokenValue(item))
      .filter((item) => clean(item))
      .join(", ");
  }
  if (
    typeof value === "object" &&
    value &&
    typeof (value as { toString?: () => string }).toString === "function"
  ) {
    const rendered = (value as { toString: () => string }).toString();
    return rendered === "[object Object]" ? "" : rendered;
  }
  return "";
}
function addToken(
  target: Record<string, string>,
  key: string,
  value: unknown
): void {
  const normalizedKey = clean(key);
  if (!normalizedKey) {
    return;
  }
  const text = stringifyTokenValue(value);
  target[normalizedKey] = text;
  target[normalizedKey.toLowerCase()] = text;
}
function humanizeTokenKey(key: string): string {
  return clean(key)
    .replace(/[_\-.]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dedupeTokenOptions(options: TokenPickerOption[]): TokenPickerOption[] {
  const seen = new Set<string>();
  const deduped: TokenPickerOption[] = [];
  options.forEach((option) => {
    const key = clean(option.key);
    if (!key) {
      return;
    }
    const normalized = key.toLowerCase();
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    deduped.push({
      key,
      label: clean(option.label) || humanizeTokenKey(key) || key
    });
  });
  return deduped.sort((a, b) => a.label.localeCompare(b.label));
}
function filterTokenOptions(
  options: TokenPickerOption[],
  query: string,
  limit = 30
): TokenPickerOption[] {
  const normalizedQuery = clean(query).toLowerCase();
  if (!normalizedQuery) {
    return options.slice(0, limit);
  }
  return options
    .filter(
      (option) =>
        option.key.toLowerCase().includes(normalizedQuery) ||
        option.label.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit);
}
function parseTokenContextJson(raw?: string): Record<string, string> {
  if (!clean(raw)) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw as string);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const tokens: Record<string, string> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(
      ([key, value]) => {
        addToken(tokens, key, value);
      }
    );
    return tokens;
  } catch (_error) {
    return {};
  }
}
interface SnippetItem {
  id: string;
  name: string;
  text: string;
  scope: string;
}
function decodeSnippetPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch (_error) {
    return value;
  }
}
function parseSnippetsJson(raw?: string): SnippetItem[] {
  if (!clean(raw)) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw as string);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const snippets: SnippetItem[] = [];
    parsed.forEach((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return;
      }
      const record = entry as Record<string, unknown>;
      const name =
        typeof record.name === "string"
          ? decodeSnippetPart(record.name).trim()
          : "";
      const text =
        typeof record.text === "string" ? decodeSnippetPart(record.text) : "";
      if (!name || !text.trim()) {
        return;
      }
      const id =
        typeof record.id === "string" && record.id.trim()
          ? record.id
          : `snippet-${index}`;
      const scope =
        typeof record.scope === "string" && record.scope.trim()
          ? record.scope.trim()
          : "Personal";
      snippets.push({ id, name, text, scope });
    });
    return snippets;
  } catch (_error) {
    return [];
  }
}
// Datasource snippets (redesign step 2). Preferred over parseSnippetsJson's
// urlEncoded JSON blob; rows come from FormStudio.Snippet via a DS microflow
// that applies the same visibility rules the JSON builder used.
function buildSnippetsFromDatasource(
  source?: ListValue,
  nameAttr?: ListAttributeValue<string>,
  textAttr?: ListAttributeValue<string>,
  scopeAttr?: ListAttributeValue<string>
): SnippetItem[] | undefined {
  // undefined = "not configured, fall back to JSON". Empty array = real empty.
  if (!source || !nameAttr || !textAttr) {
    return undefined;
  }
  const sourceStatus = normalizeStatus((source as any).status);
  if (sourceStatus === "loading" || sourceStatus === "unavailable") {
    return undefined;
  }
  const snippets: SnippetItem[] = [];
  (source.items || []).forEach((item, index) => {
    const name = readListString(nameAttr, item);
    const text = readListString(textAttr, item);
    if (!name || !text) {
      return;
    }
    snippets.push({
      id: (item as any).id || `snippet-${index}`,
      name,
      text,
      scope: readListString(scopeAttr, item) || "Personal"
    });
  });
  return snippets;
}
type CatalogTokenKind = "client" | "doc" | "computed" | "sharedField";
interface CatalogToken {
  key: string;
  kind: CatalogTokenKind;
  label: string;
  fieldType: string;
  defaultLabel: string;
  options: unknown[];
  canonical: boolean;
  source?: { templateCode: string; fieldKey: string };
}
const CATALOG_TOKEN_KINDS: ReadonlySet<string> = new Set([
  "client",
  "doc",
  "computed",
  "sharedField"
]);
// The ONE catalog parser (spec: token-system-unification). Accepts catalog
// schema v2: {"version":2,"tokens":[{key,kind,label,...,source?}]}. Anything
// else (legacy map/JSON-schema shapes) parses to an empty catalog — greenfield.
function parseTokenCatalog(raw?: string): CatalogToken[] {
  if (!clean(raw)) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw as string);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [];
    }
    const tokensRaw = (parsed as Record<string, unknown>).tokens;
    if (!Array.isArray(tokensRaw)) {
      return [];
    }
    const tokens: CatalogToken[] = [];
    tokensRaw.forEach((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return;
      }
      const record = entry as Record<string, unknown>;
      const key = clean(record.key);
      const kind = clean(record.kind);
      if (!key || !CATALOG_TOKEN_KINDS.has(kind)) {
        return;
      }
      const sourceRaw =
        record.source &&
        typeof record.source === "object" &&
        !Array.isArray(record.source)
          ? (record.source as Record<string, unknown>)
          : undefined;
      const templateCode = clean(sourceRaw?.templateCode);
      // templateCode is provenance metadata only (spec amendment 2026-08-03);
      // fieldKey (or the shared.* key itself) is the identity.
      const fieldKey =
        clean(sourceRaw?.fieldKey) ||
        (clean(record.key).startsWith("shared.")
          ? clean(record.key).slice("shared.".length)
          : "");
      tokens.push({
        key,
        kind: kind as CatalogTokenKind,
        label:
          clean(record.label) ||
          clean(record.defaultLabel) ||
          humanizeTokenKey(key) ||
          key,
        fieldType: clean(record.fieldType),
        defaultLabel: clean(record.defaultLabel),
        options: Array.isArray(record.options) ? record.options : [],
        canonical: record.canonical === true,
        source: fieldKey ? { templateCode, fieldKey } : undefined
      });
    });
    return tokens.sort((a, b) => a.label.localeCompare(b.label));
  } catch (_error) {
    return [];
  }
}
// Datasource catalog (redesign step 1). Preferred over parseTokenCatalog's JSON
// blob: rows come straight from FormStudio.TokenDef, so no server-side JSON is
// built and nothing can be corrupted by an unescaped quote in a display name.
function deriveCatalogKind(key: string, rawKind: string, hasFieldKey: boolean): CatalogTokenKind {
  const kind = clean(rawKind);
  if (CATALOG_TOKEN_KINDS.has(kind)) {
    return kind as CatalogTokenKind;
  }
  // Mendix TokenSourceType enum names.
  const lowered = kind.toLowerCase();
  if (lowered === "formanswer") {
    return "sharedField";
  }
  if (lowered === "computed") {
    return "computed";
  }
  if (lowered === "derivedfromentity") {
    return clean(key).toLowerCase().startsWith("client.") ? "client" : "doc";
  }
  // No usable kind supplied — infer from the key, then from provenance.
  const loweredKey = clean(key).toLowerCase();
  if (loweredKey.startsWith("client.")) {
    return "client";
  }
  if (
    loweredKey.startsWith("document.") ||
    loweredKey.startsWith("provider.") ||
    loweredKey.startsWith("printed.") ||
    loweredKey.startsWith("doc.")
  ) {
    return "doc";
  }
  return hasFieldKey ? "sharedField" : "computed";
}
function readListString(
  attr: ListAttributeValue<string> | undefined,
  item: ObjectItem
): string {
  if (!attr) {
    return "";
  }
  const value = attr.get(item) as any;
  if (!value || normalizeStatus(value.status) !== "available") {
    return "";
  }
  return clean(value.value);
}
function buildTokenCatalogFromDatasource(
  source?: ListValue,
  keyAttr?: ListAttributeValue<string>,
  labelAttr?: ListAttributeValue<string>,
  kindAttr?: ListAttributeValue<string>,
  fieldTypeAttr?: ListAttributeValue<string>,
  defaultLabelAttr?: ListAttributeValue<string>,
  optionsJsonAttr?: ListAttributeValue<string>,
  canonicalAttr?: ListAttributeValue<boolean>,
  sourcePathAttr?: ListAttributeValue<string>
): CatalogToken[] | undefined {
  // undefined = "not configured, fall back to JSON". An empty array is a real
  // (empty) catalog and suppresses the fallback.
  if (!source || !keyAttr) {
    return undefined;
  }
  const sourceStatus = normalizeStatus((source as any).status);
  if (sourceStatus === "loading" || sourceStatus === "unavailable") {
    return undefined;
  }
  const tokens: CatalogToken[] = [];
  (source.items || []).forEach((item) => {
    const key = readListString(keyAttr, item);
    if (!key) {
      return;
    }
    const sourcePath = readListString(sourcePathAttr, item);
    const colonIdx = sourcePath.indexOf(":");
    const templateCode = colonIdx > 0 ? sourcePath.slice(0, colonIdx) : "";
    const fieldKey =
      colonIdx >= 0
        ? sourcePath.slice(colonIdx + 1)
        : key.startsWith("shared.")
          ? key.slice("shared.".length)
          : "";
    let options: unknown[] = [];
    const optionsRaw = readListString(optionsJsonAttr, item);
    if (optionsRaw) {
      try {
        const parsed = JSON.parse(optionsRaw);
        options = Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        options = [];
      }
    }
    let canonical = false;
    if (canonicalAttr) {
      const canonicalValue = canonicalAttr.get(item) as any;
      canonical =
        !!canonicalValue &&
        normalizeStatus(canonicalValue.status) === "available" &&
        canonicalValue.value === true;
    }
    const defaultLabel = readListString(defaultLabelAttr, item);
    tokens.push({
      key,
      kind: deriveCatalogKind(key, readListString(kindAttr, item), !!fieldKey),
      label:
        readListString(labelAttr, item) ||
        defaultLabel ||
        humanizeTokenKey(key) ||
        key,
      fieldType: readListString(fieldTypeAttr, item),
      defaultLabel,
      options,
      canonical,
      source: fieldKey ? { templateCode, fieldKey } : undefined
    });
  });
  return tokens.sort((a, b) => a.label.localeCompare(b.label));
}
interface SharedFieldCatalogEntry {
  tokenKey: string;
  label: string;
  fieldType: string;
  defaultLabel: string;
  options: unknown[];
  canonical: boolean;
  sourceCode: string;
  sourceKey: string;
}
interface ClientFieldCatalogEntry {
  tokenKey: string;
  label: string;
  fieldType: string;
  defaultLabel: string;
}
// Fallback when the registry row carries no usable FieldType for a client
// token; checked after entry.fieldType, before the "text" default.
const CLIENT_TOKEN_FIELD_TYPES: Record<string, FieldType> = {
  "client.dob": "date"
};
// System sections as DATA rows (redesign step 3). The server ships
// {slotKey: {title?, columns, rows, emptyText?, meta?}} and the widget renders
// the table itself — every cell goes through escapeHtml, so injection is
// impossible by construction. Emits the same fs-live-vitals markup/classes the
// legacy server HTML used, so existing styling and the PDF pipeline are
// unchanged. Sole system-section channel since 0.2.2 (legacy HTML prop removed).
function renderSystemSectionDataToHtml(raw?: string): Record<string, string> {
  if (!clean(raw)) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw as string);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const next: Record<string, string> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      const normalizedKey = clean(key);
      if (
        !normalizedKey ||
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return;
      }
      const record = value as Record<string, unknown>;
      const title = clean(record.title);
      const emptyText = clean(record.emptyText) || "No data";
      const meta = clean(record.meta);
      const columns = Array.isArray(record.columns)
        ? (record.columns as unknown[]).map((c) => escapeHtml(String(c ?? "")))
        : [];
      const rows = Array.isArray(record.rows)
        ? (record.rows as unknown[]).filter((r) => Array.isArray(r))
        : [];
      let body: string;
      if (!rows.length) {
        body = `<div class=fs-vitals-empty>${escapeHtml(emptyText)}</div>`;
      } else {
        const header = columns.length
          ? `<tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr>`
          : "";
        const bodyRows = rows
          .map(
            (r) =>
              `<tr>${(r as unknown[])
                .map((cell) => `<td>${escapeHtml(String(cell ?? ""))}</td>`)
                .join("")}</tr>`
          )
          .join("");
        body = `<table class=fs-vitals-table>${header}${bodyRows}</table>`;
      }
      const html =
        `<div class=fs-live-vitals>` +
        (title ? `<div class=fs-vitals-title>${escapeHtml(title)}</div>` : "") +
        body +
        (meta ? `<div class=fs-vitals-meta>${escapeHtml(meta)}</div>` : "") +
        `</div>`;
      next[normalizedKey] = html;
      next[normalizedKey.toLowerCase()] = html;
    });
    return next;
  } catch (_error) {
    return {};
  }
}
function buildTokenContextFromDatasource(
  source?: ListValue,
  keyAttr?: ListAttributeValue<string | Big>,
  valueAttr?: ListAttributeValue<string | Big | boolean | Date>
): Record<string, string> {
  if (!source || !keyAttr || !valueAttr) {
    return {};
  }
  const sourceStatus = normalizeStatus((source as any).status);
  if (sourceStatus === "loading" || sourceStatus === "unavailable") {
    return {};
  }
  const tokens: Record<string, string> = {};
  const items = source.items || [];
  items.forEach((item) => {
    const keyValue = keyAttr.get(item) as any;
    const valueValue = valueAttr.get(item) as any;
    if (
      !keyValue ||
      normalizeStatus(keyValue.status) !== "available" ||
      !valueValue ||
      normalizeStatus(valueValue.status) !== "available"
    ) {
      return;
    }
    addToken(tokens, keyValue.value, valueValue.value);
  });
  return tokens;
}
function resolveComputedTokenValue(tokenKey: string): string | undefined {
  const normalized = clean(tokenKey).toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const now = new Date();
  if (
    normalized === "sys.date" ||
    normalized === "__currentdate" ||
    normalized === "__today"
  ) {
    return now.toLocaleDateString("en-US");
  }
  if (
    normalized === "sys.time" ||
    normalized === "__currenttime" ||
    normalized === "__nowtime"
  ) {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }
  if (
    normalized === "sys.datetime" ||
    normalized === "__currentdatetime" ||
    normalized === "__now"
  ) {
    return `${now.toLocaleDateString("en-US")} ${now.toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )}`;
  }
  return undefined;
}
function resolveTokenValue(
  tokenKey: string,
  tokenValues: Record<string, string>
): string {
  const key = clean(tokenKey);
  if (!key) {
    return "";
  }
  const direct = tokenValues[key];
  if (direct !== undefined) {
    return direct;
  }
  const lower = tokenValues[key.toLowerCase()];
  if (lower !== undefined) {
    return lower;
  }
  return resolveComputedTokenValue(key) || "";
}
const TOKEN_PREFILL_EXCLUDED_TYPES: ReadonlySet<FieldType> = new Set<FieldType>(
  [
    "total",
    "datagrid",
    "systemDatagrid2",
    "contentBlock",
    "signature",
    "matrix"
  ]
);
function coerceTokenPrefillValue(
  component: FormComponent,
  raw: string
): string | number | boolean | undefined {
  const value = clean(raw);
  if (!value) {
    return undefined;
  }
  switch (component.type) {
    case "checkbox":
    case "switch": {
      const normalized = value.toLowerCase();
      if (["true", "yes", "y", "1", "on"].includes(normalized)) {
        return true;
      }
      if (["false", "no", "n", "0", "off"].includes(normalized)) {
        return false;
      }
      return undefined;
    }
    case "yesno":
      return normalizeYesNoValue(value);
    case "number":
    case "integer":
    case "slider": {
      const numeric = Number(value.replace(/,/g, ""));
      if (!Number.isFinite(numeric)) {
        return undefined;
      }
      return isWholeNumberComponent(component) ? Math.trunc(numeric) : numeric;
    }
    case "date": {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return undefined;
      }
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${parsed.getFullYear()}-${month}-${day}`;
    }
    case "time": {
      const direct = value.match(/^([01]?\d|2[0-3]):([0-5]\d)/);
      if (direct) {
        return `${direct[1].padStart(2, "0")}:${direct[2]}`;
      }
      const meridiem = value.match(/^(\d{1,2}):([0-5]\d)\s*([AaPp])\.?[Mm]?/);
      if (!meridiem) {
        return undefined;
      }
      let hours = Number(meridiem[1]) % 12;
      if (meridiem[3].toLowerCase() === "p") {
        hours += 12;
      }
      return `${String(hours).padStart(2, "0")}:${meridiem[2]}`;
    }
    case "datetime": {
      const direct = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
      if (direct) {
        return `${direct[1]} ${direct[2]}`;
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return undefined;
      }
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      const hours = String(parsed.getHours()).padStart(2, "0");
      const minutes = String(parsed.getMinutes()).padStart(2, "0");
      return `${parsed.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
    }
    case "select":
    case "radio": {
      const options = component.options || [];
      if (options.includes(value)) {
        return value;
      }
      const lowered = value.toLowerCase();
      const byValue = options.find(
        (option) => option.toLowerCase() === lowered
      );
      if (byValue !== undefined) {
        return byValue;
      }
      const byLabel = options.find(
        (option) =>
          (component.optionLabels?.[option] || "").toLowerCase() === lowered
      );
      return byLabel;
    }
    default:
      return value;
  }
}
function hasExistingAnswer(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  return true;
}
function applyTokenPrefill(
  data: JsonObject,
  definition: FormDefinition,
  tokenValues: Record<string, string>
): JsonObject {
  let next: JsonObject | null = null;
  definition.components.forEach((component) => {
    // Shared placements prefill from their registry value (newest shared
    // answer, resolved server-side into the context) — same weak semantics.
    const tokenKey =
      clean(component.prefillTokenKey) || clean(component.sharedFieldRef);
    if (
      !tokenKey ||
      TOKEN_PREFILL_EXCLUDED_TYPES.has(component.type) ||
      component.multiSelect ||
      component.repeatGroup
    ) {
      return;
    }
    if (hasExistingAnswer((next || data)[component.key])) {
      return;
    }
    const resolvedRaw = resolveTokenValue(tokenKey, tokenValues);
    if (!clean(resolvedRaw)) {
      return;
    }
    const coerced = coerceTokenPrefillValue(component, resolvedRaw);
    if (coerced === undefined) {
      return;
    }
    if (!next) {
      next = { ...data };
    }
    next[component.key] = coerced;
  });
  return next || data;
}
// Keys seeded from the chart THIS session: empty in the saved answers but
// carrying the token value in the displayed (post-prefill) data. Strict on
// purpose — claiming a hand-entered value came from the chart is worse for
// provenance than dropping the caption once the answer persists.
function computePrefilledKeys(
  savedData: JsonObject,
  displayedData: JsonObject,
  definition: FormDefinition,
  tokenValues: Record<string, string>
): Set<string> {
  const keys = new Set<string>();
  definition.components.forEach((component) => {
    const tokenKey =
      clean(component.prefillTokenKey) || clean(component.sharedFieldRef);
    if (
      !tokenKey ||
      TOKEN_PREFILL_EXCLUDED_TYPES.has(component.type) ||
      component.multiSelect ||
      component.repeatGroup
    ) {
      return;
    }
    if (hasExistingAnswer(savedData[component.key])) {
      return;
    }
    const resolvedRaw = resolveTokenValue(tokenKey, tokenValues);
    if (!clean(resolvedRaw)) {
      return;
    }
    const coerced = coerceTokenPrefillValue(component, resolvedRaw);
    if (coerced === undefined) {
      return;
    }
    const current = displayedData[component.key];
    if (
      current === coerced ||
      (current != null && String(current) === String(coerced))
    ) {
      keys.add(component.key);
    }
  });
  return keys;
}
// Stable identity for the disabled path so downstream memos don't churn.
const EMPTY_PREFILLED_KEYS: ReadonlySet<string> = new Set<string>();
function replaceOutputTokens(
  template: string,
  tokenValues: Record<string, string>
): string {
  if (!template) {
    return "";
  }
  const replaceRaw = (input: string): string =>
    input.replace(
      /\{!\s*([A-Za-z0-9_.-]+)\s*!\}/g,
      (_match, tokenName: string) => resolveTokenValue(tokenName, tokenValues)
    );
  const replaceCurlyPercent = (input: string): string =>
    input.replace(/\{%\s*([^%{}]+?)\s*%\}/g, (_match, tokenName: string) =>
      escapeHtml(resolveTokenValue(tokenName, tokenValues))
    );
  const replaceCurlySimple = (input: string): string =>
    input.replace(/\{\s*([A-Za-z0-9_.-]+)\s*\}/g, (_match, tokenName: string) =>
      escapeHtml(resolveTokenValue(tokenName, tokenValues))
    );
  return replaceCurlySimple(replaceCurlyPercent(replaceRaw(template)));
}
function extractTemplateTokens(template: string): string[] {
  if (!template) {
    return [];
  }
  const keys = new Set<string>();
  const rawPattern = /\{!\s*([A-Za-z0-9_.-]+)\s*!\}/g;
  const percentPattern = /\{%\s*([^%{}]+?)\s*%\}/g;
  const simplePattern = /\{\s*([A-Za-z0-9_.-]+)\s*\}/g;
  let match: RegExpExecArray | null = null;
  while ((match = rawPattern.exec(template)) !== null) {
    const key = clean(match[1]);
    if (key) {
      keys.add(key);
    }
  }
  while ((match = percentPattern.exec(template)) !== null) {
    const key = clean(match[1]);
    if (key) {
      keys.add(key);
    }
  }
  while ((match = simplePattern.exec(template)) !== null) {
    const key = clean(match[1]);
    if (key) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}
function getComponentTokenValue(
  component: FormComponent,
  data: JsonObject
): string {
  if (component.type === "datagrid") {
    const rows = sanitizeDataGridRows(data[component.key], component) || [];
    const columns =
      normalizeDataGridColumns(component.datagridColumns) ||
      createDefaultDataGridColumns(component.key);
    const summaries = rows
      .map((row) => {
        const parts = columns
          .map((column) => {
            const value = row[column.key];
            if (column.type === "checkbox") {
              return value ? column.label || column.key : "";
            }
            return stringifyTokenValue(value);
          })
          .filter((value) => clean(value));
        return parts.join(", ");
      })
      .filter((value) => clean(value));
    return summaries.join(" | ");
  }
  if (component.type === "matrix") {
    const rows = getMatrixRows(component);
    const answers = sanitizeMatrixValue(component, data[component.key]) || {};
    return rows
      .map((row) => {
        const answer = clean(answers[row.key]);
        if (!answer) {
          return "";
        }
        const answerLabel = clean(component.optionLabels?.[answer]) || answer;
        return `${row.label || row.key}: ${answerLabel}`;
      })
      .filter((item) => clean(item))
      .join(" | ");
  }
  if (component.repeatGroup?.key) {
    const rows = Array.isArray(data[component.repeatGroup.key])
      ? (data[component.repeatGroup.key] as unknown[])
      : [];
    const values = rows
      .map((row) =>
        row && typeof row === "object" && !Array.isArray(row)
          ? stringifyTokenValue((row as JsonObject)[component.key])
          : ""
      )
      .filter((value) => clean(value));
    return values.join(", ");
  }
  if (
    component.type === "yesno" ||
    component.type === "switch" ||
    component.type === "checkbox" ||
    component.type === "time" ||
    component.type === "date" ||
    component.type === "datetime"
  ) {
    return formatValueForPrint(
      data[component.key],
      component.type,
      component.optionLabels,
      {
        dateGranularity: component.dateGranularity,
        dateDisplayFormat: component.dateDisplayFormat,
        timeDisplayFormat: component.timeDisplayFormat
      }
    );
  }
  return stringifyTokenValue(data[component.key]);
}
// A custom narrative template whose value tokens ALL resolve empty renders as a
// dangling sentence fragment ("has a birthday on"). Hide the whole snippet in
// that case. Label tokens (*_label) don't count as values, and templates with
// no tokens at all (static content) are always kept. Default label/value
// templates are NOT run through this — legacy preview shows empty labels, and
// per-component hiding stays opt-in via hideOutputIfEmpty.
function isNarrativeWithAllValueTokensEmpty(
  template: string,
  tokenValues: Record<string, string>
): boolean {
  const valueTokens = extractTemplateTokens(template).filter(
    (key) => !key.endsWith("_label")
  );
  if (valueTokens.length === 0) {
    return false;
  }
  return valueTokens.every(
    (key) => !clean(resolveTokenValue(key, tokenValues))
  );
}
function hasExplicitDocumentOutputTemplate(component: FormComponent): boolean {
  return component.documentOutputTemplate != null;
}
function getDefaultDocumentOutputTemplate(component: FormComponent): string {
  if (component.type === "systemDatagrid2") {
    return "";
  }
  if (component.type === "contentBlock") {
    return str(component.contentText);
  }
  // Default narrative mirrors the legacy PDF generator: bold label, answer
  // inline on the same line. {\b ...} is the template bold syntax handled by
  // asHtmlSnippet (tokens are replaced before the RTF-style pass runs).
  const labelToken = `{\\b {${component.key}_label}:}`;
  if (component.type === "matrix") {
    const rows = getMatrixRows(component);
    const rowLines = rows
      .map(
        (row) =>
          `{\\b {${component.key}_${row.key}_label}:} {${component.key}_${row.key}}`
      )
      .join("\n");
    return rowLines
      ? `${labelToken}\n${rowLines}`
      : `${labelToken} {${component.key}}`;
  }
  if (component.type === "datagrid") {
    const columns =
      normalizeDataGridColumns(component.datagridColumns) ||
      createDefaultDataGridColumns(component.key);
    const rowTemplate = columns
      .map((column) => `{\\b {${column.key}_label}:} {${column.key}}`)
      .join("\n");
    return rowTemplate
      ? `${labelToken}\n${rowTemplate}`
      : `${labelToken} {${component.key}}`;
  }
  return `${labelToken} {${component.key}}`;
}
function getEffectiveDocumentOutputTemplate(component: FormComponent): string {
  return hasExplicitDocumentOutputTemplate(component)
    ? str(component.documentOutputTemplate)
    : getDefaultDocumentOutputTemplate(component);
}
function supportsPerAnswerOutput(component: FormComponent): boolean {
  return (
    (component.type === "radio" ||
      component.type === "select" ||
      component.type === "yesno") &&
    !component.multiSelect
  );
}
/**
 * Per-answer document output. Returns the narrative template mapped to the
 * current answer, "" when the mapping explicitly omits the field, or null when
 * no mapping applies (fall back to the component's regular template).
 */
function getPerAnswerOutputTemplate(
  component: FormComponent,
  data: JsonObject
): string | null {
  if (!supportsPerAnswerOutput(component) || !component.optionOutputTexts) {
    return null;
  }
  const raw = data[component.key];
  const answer =
    typeof raw === "boolean"
      ? raw
        ? "Yes"
        : "No"
      : clean(stringifyTokenValue(raw));
  if (!answer) {
    return null;
  }
  if (
    !Object.prototype.hasOwnProperty.call(component.optionOutputTexts, answer)
  ) {
    return null;
  }
  return str(component.optionOutputTexts[answer]);
}
function hasExplicitPdfHeaderTemplate(definition: FormDefinition): boolean {
  return definition.pdfHeaderTemplate != null;
}
function hasExplicitPdfFooterTemplate(definition: FormDefinition): boolean {
  return definition.pdfFooterTemplate != null;
}
// Prefix-partitioned token scope (spec: token-system-unification): bare keys
// come ONLY from the form's own data; dotted keys come ONLY from the registry
// context. A registry token can never shadow a form field or vice versa.
function buildTokenScope(
  definition: FormDefinition,
  data: JsonObject,
  context: Record<string, string>
): Record<string, string> {
  const scope: Record<string, string> = {};
  Object.entries(buildFormTokenValues(definition, data)).forEach(
    ([key, value]) => {
      if (!key.includes(".")) {
        scope[key] = value;
      }
    }
  );
  Object.entries(context).forEach(([key, value]) => {
    if (key.includes(".")) {
      scope[key] = value;
    }
  });
  return scope;
}
// Authored labels often end with ":" while output templates add their own
// ("{\b {key_label}:} {key}") — strip it from the token value so narratives
// never print "Label::". Form rendering uses component.label directly and is
// unaffected.
function stripTrailingColon(value: string): string {
  return str(value).replace(/\s*:\s*$/, "");
}
function buildFormTokenValues(
  definition: FormDefinition,
  data: JsonObject
): Record<string, string> {
  const tokens: Record<string, string> = {};
  addToken(tokens, "formtitle", definition.title || "");
  addToken(tokens, "form_title", definition.title || "");
  addToken(tokens, "formdescription", definition.description || "");
  addToken(tokens, "form_description", definition.description || "");
  definition.components.forEach((component) => {
    const value = getComponentTokenValue(component, data);
    addToken(tokens, component.key, value);
    addToken(
      tokens,
      `${component.key}_label`,
      stripTrailingColon(component.label || component.key)
    );
    if (component.type === "total" && component.scoreBands?.length) {
      const numericTotal = toNumericValue(data[component.key]) ?? 0;
      addToken(
        tokens,
        `${component.key}_band`,
        resolveScoreBandLabel(component.scoreBands, numericTotal)
      );
    }
    if (component.type === "matrix") {
      const rows = getMatrixRows(component);
      const answers = sanitizeMatrixValue(component, data[component.key]) || {};
      rows.forEach((row) => {
        const answer = clean(answers[row.key]);
        const answerLabel = answer
          ? clean(component.optionLabels?.[answer]) || answer
          : "";
        addToken(tokens, `${component.key}_${row.key}`, answerLabel);
        addToken(
          tokens,
          `${component.key}_${row.key}_label`,
          stripTrailingColon(row.label || row.key)
        );
      });
    }
    if (component.type === "datagrid") {
      const rows = sanitizeDataGridRows(data[component.key], component) || [];
      const columns =
        normalizeDataGridColumns(component.datagridColumns) ||
        createDefaultDataGridColumns(component.key);
      addToken(tokens, `${component.key}_count`, rows.length);
      columns.forEach((column) => {
        const columnValue = rows
          .map((row) => stringifyTokenValue(row[column.key]))
          .filter((item) => clean(item))
          .join(", ");
        addToken(tokens, `${component.key}_${column.key}`, columnValue);
        addToken(
          tokens,
          `${component.key}_${column.key}_label`,
          stripTrailingColon(column.label || column.key)
        );
      });
    }
  });
  return tokens;
}
function resolveDataGridTemplateHtml(
  component: FormComponent,
  template: string,
  data: JsonObject,
  baseTokens: Record<string, string>
): string {
  if (component.type !== "datagrid") {
    return "";
  }
  const rows = sanitizeDataGridRows(data[component.key], component) || [];
  if (!rows.length) {
    return "";
  }
  const columns =
    normalizeDataGridColumns(component.datagridColumns) ||
    createDefaultDataGridColumns(component.key);
  const rowIdKey = clean(component.datagridRowIdKey);
  const snippets = rows
    .map((row, rowIndex) => {
      const rowTokens: Record<string, string> = { ...baseTokens };
      addToken(rowTokens, "rowindex", rowIndex);
      addToken(rowTokens, "row_number", rowIndex + 1);
      if (rowIdKey) {
        addToken(rowTokens, rowIdKey, row[rowIdKey]);
      }
      columns.forEach((column) => {
        addToken(rowTokens, column.key, row[column.key]);
        addToken(
          rowTokens,
          `${column.key}_label`,
          stripTrailingColon(column.label || column.key)
        );
        addToken(rowTokens, `${component.key}_${column.key}`, row[column.key]);
        addToken(
          rowTokens,
          `${component.key}_${column.key}_label`,
          stripTrailingColon(column.label || column.key)
        );
      });
      return asHtmlSnippet(replaceOutputTokens(template, rowTokens));
    })
    .filter((snippet) => clean(snippet));
  return snippets.join("\n");
}
function parseRtfColorTable(value: string): Record<number, string> {
  const colorMap: Record<number, string> = {};
  const match = /\{\\colortbl([\s\S]*?)\}/i.exec(value);
  if (!match) {
    return colorMap;
  }
  const body = match[1] || "";
  const hasLeadingAutoColor = /^\s*;/.test(body);
  body.split(";").forEach((entry, index) => {
    const redMatch = /\\red(\d{1,3})/i.exec(entry);
    const greenMatch = /\\green(\d{1,3})/i.exec(entry);
    const blueMatch = /\\blue(\d{1,3})/i.exec(entry);
    if (!redMatch || !greenMatch || !blueMatch) {
      return;
    }
    const red = clamp(Number(redMatch[1]), 0, 255);
    const green = clamp(Number(greenMatch[1]), 0, 255);
    const blue = clamp(Number(blueMatch[1]), 0, 255);
    const toHex = (channel: number): string =>
      channel.toString(16).padStart(2, "0");
    const colorIndex = hasLeadingAutoColor ? index : index + 1;
    colorMap[colorIndex] = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  });
  return colorMap;
}
function applyRtfColorFormatting(value: string): string {
  const colorMap = parseRtfColorTable(value);
  const withNoColorTable = value.replace(/\{\\colortbl[\s\S]*?\}/gi, "");
  const wrapColor = (colorIndexRaw: string, content: string): string => {
    const color = colorMap[Math.floor(Number(colorIndexRaw))];
    if (!color) {
      return content;
    }
    return `<span style="color: ${color};">${content}</span>`;
  };
  return withNoColorTable
    .replace(/\{\\cf(\d+)\s+([^{}]+)\}/gi, (_m, colorIndex, content) =>
      wrapColor(colorIndex, content)
    )
    .replace(/\\cf(\d+)\s+([\s\S]*?)\\cf0\b/gi, (_m, colorIndex, content) =>
      wrapColor(colorIndex, content)
    )
    .replace(/\\cf\d+\b/gi, "");
}
function asHtmlSnippet(value: string): string {
  const normalized = applyRtfColorFormatting(value)
    .replace(/\\line\b/gi, "\n")
    .replace(/\\par[d]?\b/gi, "\n\n")
    .replace(/\{\\b\s+([^{}]+?)\\b0\}/gi, "<strong>$1</strong>")
    .replace(/\{\\i\s+([^{}]+?)\\i0\}/gi, "<em>$1</em>")
    .replace(/\{\\ul\s+([^{}]+?)\\ul0\}/gi, "<u>$1</u>")
    .replace(/\{\\b\s+([^{}]+)\}/gi, "<strong>$1</strong>")
    .replace(/\{\\i\s+([^{}]+)\}/gi, "<em>$1</em>")
    .replace(/\{\\ul\s+([^{}]+)\}/gi, "<u>$1</u>")
    .replace(/\\b\s+([^\\]+?)\\b0/gi, "<strong>$1</strong>")
    .replace(/\\i\s+([^\\]+?)\\i0/gi, "<em>$1</em>")
    .replace(/\\ul\s+([^\\]+?)\\ul0/gi, "<u>$1</u>")
    .replace(/\\(?:b0|i0|ul0|b|i|ul)\b/gi, "")
    .replace(/[{}]/g, "");
  const trimmed = normalized.trim();
  if (!trimmed) {
    return "";
  }
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    // Only fully-authored HTML (block-level tags) skips the paragraph wrapper.
    // Inline-only markup (e.g. <strong> from {\b ...}) still needs the <p> and
    // newline conversion or consecutive field snippets collapse onto one line.
    const hasBlockTags =
      /<\/?(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|header|footer|figure|blockquote|pre|hr|dl|dt|dd|img|svg|canvas)\b/i.test(
        trimmed
      );
    if (hasBlockTags) {
      return trimmed;
    }
  }
  return `<p>${trimmed.replace(/\r?\n/g, "<br />")}</p>`;
}
function resolveDocumentOutputHtml(
  definition: FormDefinition,
  data: JsonObject,
  contextTokens: Record<string, string>,
  systemSectionHtmlBySlot: Record<string, string> = {}
): string {
  const sectionSwitchableByKey = buildSectionSwitchableMap(definition);
  const sectionVisibilityByKey = applySectionVisibilityLegacyFallback(
    parseSectionVisibilityMap(data[SECTION_VISIBILITY_DATA_KEY]),
    definition.components
  );
  const tokenValues = buildTokenScope(definition, data, contextTokens);
  const componentsByKey = new Map(
    definition.components.map((component) => [component.key, component])
  );
  const snippets = definition.components
    .map((component) => {
      const perAnswerTemplate = getPerAnswerOutputTemplate(component, data);
      if (perAnswerTemplate != null && !clean(perAnswerTemplate)) {
        return "";
      }
      const template =
        perAnswerTemplate != null
          ? perAnswerTemplate
          : getEffectiveDocumentOutputTemplate(component);
      if (!template && component.type !== "systemDatagrid2") {
        return "";
      }
      const sectionKey = resolveComponentSectionKey(component);
      const sectionIsSwitchable = Boolean(sectionSwitchableByKey[sectionKey]);
      const sectionIsVisible =
        !sectionIsSwitchable || sectionVisibilityByKey[sectionKey] !== false;
      if (!sectionIsVisible) {
        return "";
      }
      if (!isComponentVisibleForSummary(component, data, componentsByKey)) {
        return "";
      }
      if (component.hideOutputIfEmpty && !hasOutputValue(component, data)) {
        return "";
      }
      if (
        (perAnswerTemplate != null ||
          hasExplicitDocumentOutputTemplate(component) ||
          component.type === "contentBlock") &&
        component.type !== "systemDatagrid2" &&
        component.type !== "datagrid" &&
        isNarrativeWithAllValueTokensEmpty(template, tokenValues)
      ) {
        return "";
      }
      if (component.type === "systemDatagrid2") {
        const slotKey = clean(component.systemTemplateSlotProperty);
        const snippet = slotKey
          ? systemSectionHtmlBySlot[slotKey] ||
            systemSectionHtmlBySlot[slotKey.toLowerCase()] ||
            ""
          : "";
        if (!hasMeaningfulHtml(snippet)) {
          return "";
        }
        const label = clean(component.label);
        const labelHtml =
          label && !component.hideLabel
            ? `<div class="rjsf-builder__pdf-field-label">${escapeHtml(
                label
              )}</div>`
            : "";
        return `<div class="rjsf-builder__pdf-system-block">${labelHtml}${snippet}</div>`;
      }
      if (component.type === "datagrid") {
        return resolveDataGridTemplateHtml(
          component,
          template,
          data,
          tokenValues
        );
      }
      return asHtmlSnippet(replaceOutputTokens(template, tokenValues));
    })
    .filter((snippet) => clean(snippet));
  return snippets.join("\n");
}
function hasMeaningfulHtml(value: string): boolean {
  if (!clean(value)) {
    return false;
  }
  if (/<(img|svg|canvas|table|figure|ul|ol|dl)\b/i.test(value)) {
    return true;
  }
  const withoutTags = value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ");
  return clean(withoutTags).length > 0;
}
const MONTH_LONG_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
interface TemporalPrintOptions {
  dateGranularity?: DateGranularity;
  dateDisplayFormat?: DateDisplayFormat;
  timeDisplayFormat?: TimeDisplayFormat;
}
function formatDateValueForPrint(
  value: string,
  granularity?: DateGranularity,
  style?: DateDisplayFormat
): string {
  const trimmed = clean(value);
  const resolvedStyle = style || "numeric";
  const monthName = (month: number) => MONTH_LONG_NAMES[month - 1] || "";
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (full && (!granularity || granularity === "full")) {
    const [, y, m, d] = full;
    if (resolvedStyle === "iso") {
      return trimmed;
    }
    if (resolvedStyle === "long") {
      return `${monthName(Number(m))} ${Number(d)}, ${y}`;
    }
    return `${Number(m)}/${Number(d)}/${y}`;
  }
  const monthYear = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (monthYear) {
    const [, y, m] = monthYear;
    if (resolvedStyle === "iso") {
      return trimmed;
    }
    if (resolvedStyle === "long") {
      return `${monthName(Number(m))} ${y}`;
    }
    return `${Number(m)}/${y}`;
  }
  if (granularity === "month" && /^\d{1,2}$/.test(trimmed)) {
    return resolvedStyle === "long" || resolvedStyle === "numeric"
      ? monthName(Number(trimmed)) || trimmed
      : trimmed;
  }
  // year / day granularities (and anything unparsed) print as stored
  return trimmed;
}
function formatTimeValueForPrint(
  value: string,
  style?: TimeDisplayFormat
): string {
  const trimmed = clean(value);
  const match = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const hours = Number(match[1]);
  const minutes = match[2];
  if (!Number.isFinite(hours) || hours > 23) {
    return trimmed;
  }
  if (style === "24h") {
    return `${match[1]}:${minutes}`;
  }
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${meridiem}`;
}
function formatDateTimeValueForPrint(
  value: string,
  options?: TemporalPrintOptions
): string {
  const trimmed = clean(value);
  const match = /^(\d{4}-\d{2}-\d{2})[T ]?(\d{2}:\d{2})?$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const datePart = formatDateValueForPrint(
    match[1],
    "full",
    options?.dateDisplayFormat
  );
  if (!match[2]) {
    return datePart;
  }
  const timePart = formatTimeValueForPrint(
    match[2],
    options?.timeDisplayFormat
  );
  return `${datePart} ${timePart}`;
}
function formatValueForPrint(
  value: unknown,
  type?: FieldType | DataGridColumnType,
  optionLabels?: Record<string, string>,
  temporal?: TemporalPrintOptions
): string {
  if (value == null) {
    return "";
  }
  if (type === "checkbox" || type === "switch") {
    return toBoolean(value) ? "Yes" : "No";
  }
  if (type === "yesno") {
    const normalized = normalizeYesNoValue(value);
    if (!normalized) {
      return "";
    }
    return (
      clean(optionLabels?.[normalized]) ||
      YES_NO_OPTION_LABELS[normalized] ||
      normalized
    );
  }
  if (type === "time" && typeof value === "string") {
    return formatTimeValueForPrint(value, temporal?.timeDisplayFormat);
  }
  if (type === "datetime" && typeof value === "string") {
    return formatDateTimeValueForPrint(value, temporal);
  }
  if (
    (type === "select" || type === "radio") &&
    Array.isArray(value) &&
    value.length
  ) {
    return value
      .map((item) => {
        const key = clean(item);
        return optionLabels?.[key] || key;
      })
      .filter(Boolean)
      .join(", ");
  }
  if (type === "date" && typeof value === "string") {
    return formatDateValueForPrint(
      value,
      temporal?.dateGranularity,
      temporal?.dateDisplayFormat
    );
  }
  const text = stringifyTokenValue(value);
  if ((type === "select" || type === "radio") && optionLabels) {
    const normalized = clean(text);
    if (normalized && optionLabels[normalized]) {
      return optionLabels[normalized];
    }
  }
  return text;
}
function renderPrintBlock(
  title: string | undefined,
  contentHtml: string,
  description?: string,
  variant = ""
): string {
  if (!hasMeaningfulHtml(contentHtml)) {
    return "";
  }
  const classes = [
    "rjsf-builder__pdf-block",
    variant ? `rjsf-builder__pdf-block--${variant}` : ""
  ]
    .filter(Boolean)
    .join(" ");
  const titleHtml = clean(title)
    ? `<div class="rjsf-builder__pdf-block-title">${escapeHtml(
        clean(title)
      )}</div>`
    : "";
  const descriptionHtml = clean(description)
    ? `<div class="rjsf-builder__pdf-block-description">${escapeHtml(
        clean(description)
      ).replace(/\r?\n/g, "<br />")}</div>`
    : "";
  return `<div class="${classes}">${titleHtml}${descriptionHtml}<div class="rjsf-builder__pdf-content">${contentHtml}</div></div>`;
}
function renderPrintTableBlock(
  title: string | undefined,
  headers: string[],
  rows: string[][],
  description?: string
): string {
  const normalizedHeaders = headers.map((header) => escapeHtml(clean(header)));
  const meaningfulRows = rows.filter((row) =>
    row.some((cell) => clean(cell).length > 0)
  );
  if (!normalizedHeaders.length || !meaningfulRows.length) {
    return "";
  }
  const headHtml = normalizedHeaders
    .map((header) => `<th>${header}</th>`)
    .join("");
  const bodyHtml = meaningfulRows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell || "&nbsp;"}</td>`).join("")}</tr>`
    )
    .join("");
  return renderPrintBlock(
    title,
    `<table class="rjsf-builder__pdf-table"><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`,
    description,
    "table"
  );
}
function renderPrintSectionLayout(
  items: PrintLayoutItem[],
  sectionColumns?: number
): string {
  if (!items.length) {
    return "";
  }
  if (!sectionColumns || sectionColumns <= 1) {
    return items.map((item) => item.html).join("");
  }
  const renderColumnSegment = (segmentItems: PrintLayoutItem[]): string =>
    `<div class="rjsf-builder__pdf-columns-segment"><div class="rjsf-builder__pdf-columns" style="grid-template-columns: repeat(${sectionColumns}, minmax(0, 1fr));">${Array.from(
      { length: sectionColumns },
      (_, index) => {
        const columnIndex = index + 1;
        const laneItems = segmentItems.filter(
          (item) => (item.sectionColumn || 1) === columnIndex
        );
        const laneHtml = laneItems
          .map((item) => {
            const span = clamp(Math.floor(Number(item.span) || 12), 1, 12);
            return `<div class="rjsf-builder__pdf-layout-item" style="grid-column: span ${span};">${item.html}</div>`;
          })
          .join("");
        return `<div class="rjsf-builder__pdf-column"><div class="rjsf-builder__pdf-column-content">${laneHtml}</div></div>`;
      }
    ).join("")}</div></div>`;
  const segments: Array<
    | { type: "columns"; items: PrintLayoutItem[] }
    | { type: "full"; item: PrintLayoutItem }
  > = [];
  let pendingColumnItems: PrintLayoutItem[] = [];
  items.forEach((item) => {
    if (item.fullWidth) {
      if (pendingColumnItems.length) {
        segments.push({ type: "columns", items: pendingColumnItems });
        pendingColumnItems = [];
      }
      segments.push({ type: "full", item });
      return;
    }
    pendingColumnItems.push(item);
  });
  if (pendingColumnItems.length) {
    segments.push({ type: "columns", items: pendingColumnItems });
  }
  return segments
    .map((segment) =>
      segment.type === "columns"
        ? renderColumnSegment(segment.items)
        : `<div class="rjsf-builder__pdf-full-width">${segment.item.html}</div>`
    )
    .join("");
}
function shouldRenderPrintItemFullWidth(
  component: FormComponent | undefined,
  html: string,
  options?: { repeatGroup?: boolean }
): boolean {
  if (options?.repeatGroup) {
    return true;
  }
  if (!component) {
    return /<(table|figure|img|svg|canvas|pre)\b/i.test(html);
  }
  if (component.type === "datagrid" || component.type === "systemDatagrid2") {
    return true;
  }
  if (
    component.type === "signature" &&
    /rjsf-builder__pdf-signature-draw|<img\b/i.test(html)
  ) {
    return true;
  }
  return /<(table|figure|img|svg|canvas|pre)\b/i.test(html);
}
function buildPrintDocumentHtml(
  definition: FormDefinition,
  data: JsonObject,
  contextTokens: Record<string, string>,
  systemSectionHtmlBySlot: Record<string, string>
): string {
  const sectionSwitchableByKey = buildSectionSwitchableMap(definition);
  const sectionVisibilityByKey = applySectionVisibilityLegacyFallback(
    parseSectionVisibilityMap(data[SECTION_VISIBILITY_DATA_KEY]),
    definition.components
  );
  const tokenValues = buildTokenScope(definition, data, contextTokens);
  const printComponentsByKey = new Map(
    definition.components.map((component) => [component.key, component])
  );
  const sections = definition.components.reduce(
    (
      map: Record<
        string,
        {
          key: string;
          title?: string;
          order: number;
          firstIndex: number;
          columns?: number;
          components: FormComponent[];
        }
      >,
      component,
      index
    ) => {
      const sectionKey = resolveComponentSectionKey(component);
      const sectionTitle = normalizeSectionName(component.section);
      const rawSectionColumns = Number(component.sectionColumns);
      const inferredSectionColumns = inferSectionColumnsFromTitle(sectionTitle);
      const candidateColumns = Number.isFinite(rawSectionColumns)
        ? clamp(Math.floor(rawSectionColumns), 1, 12)
        : inferredSectionColumns;
      const sectionOrder = Number.isFinite(Number(component.sectionOrder))
        ? Math.floor(Number(component.sectionOrder))
        : index;
      if (!map[sectionKey]) {
        map[sectionKey] = {
          key: sectionKey,
          title: sectionTitle,
          order: sectionOrder,
          firstIndex: index,
          columns:
            candidateColumns && candidateColumns > 1
              ? candidateColumns
              : undefined,
          components: [component]
        };
        return map;
      }
      map[sectionKey].components.push(component);
      map[sectionKey].order = Math.min(map[sectionKey].order, sectionOrder);
      map[sectionKey].firstIndex = Math.min(map[sectionKey].firstIndex, index);
      if (
        candidateColumns &&
        candidateColumns > 1 &&
        candidateColumns > Number(map[sectionKey].columns || 1)
      ) {
        map[sectionKey].columns = candidateColumns;
      }
      if (!map[sectionKey].title && sectionTitle) {
        map[sectionKey].title = sectionTitle;
      }
      return map;
    },
    {}
  );
  const orderedSections = Object.values(sections).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.firstIndex - b.firstIndex;
  });
  const sectionHtml = orderedSections
    .map((section) => {
      const sectionIsSwitchable = Boolean(sectionSwitchableByKey[section.key]);
      const sectionIsVisible =
        !sectionIsSwitchable || sectionVisibilityByKey[section.key] !== false;
      if (!sectionIsVisible) {
        return "";
      }
      const renderedRepeatGroups = new Set<string>();
      let sectionColumnCursor = 0;
      const resolvePrintSectionColumn = (
        component?: FormComponent
      ): number | undefined => {
        if (!section.columns || section.columns <= 1) {
          return undefined;
        }
        if (Number.isFinite(Number(component?.sectionColumn))) {
          return clamp(
            Math.floor(Number(component?.sectionColumn)),
            1,
            section.columns
          );
        }
        const assigned = (sectionColumnCursor % section.columns) + 1;
        sectionColumnCursor += 1;
        return assigned;
      };
      const blocks = section.components
        .map<PrintLayoutItem | undefined>((component) => {
          if (
            !isComponentVisibleForSummary(component, data, printComponentsByKey)
          ) {
            return undefined;
          }
          const repeatGroupKey = clean(component.repeatGroup?.key);
          if (repeatGroupKey) {
            if (renderedRepeatGroups.has(repeatGroupKey)) {
              return undefined;
            }
            renderedRepeatGroups.add(repeatGroupKey);
            const groupComponents = section.components.filter(
              (item) => clean(item.repeatGroup?.key) === repeatGroupKey
            );
            const rawRows = Array.isArray(data[repeatGroupKey])
              ? (data[repeatGroupKey] as unknown[])
              : [];
            const normalizedRows = rawRows
              .filter(
                (row) => row && typeof row === "object" && !Array.isArray(row)
              )
              .map((row) => {
                const nextRow = row as JsonObject;
                return groupComponents.map((groupComponent) =>
                  escapeHtml(
                    formatValueForPrint(
                      nextRow[groupComponent.key],
                      groupComponent.type,
                      groupComponent.optionLabels
                    )
                  )
                );
              })
              .filter((row) => row.some((cell) => clean(cell).length > 0));
            const groupTableHtml = renderPrintTableBlock(
              clean(groupComponents[0]?.repeatGroup?.title) ||
                clean(groupComponents[0]?.label) ||
                humanizeTokenKey(repeatGroupKey),
              groupComponents.map(
                (groupComponent) => groupComponent.label || groupComponent.key
              ),
              normalizedRows
            );
            return groupTableHtml
              ? {
                  html: groupTableHtml,
                  sectionColumn: resolvePrintSectionColumn(groupComponents[0]),
                  span: 12,
                  fullWidth: true
                }
              : undefined;
          }
          if (component.type === "systemDatagrid2") {
            const slotKey = clean(component.systemTemplateSlotProperty);
            const snippet = slotKey
              ? systemSectionHtmlBySlot[slotKey] ||
                systemSectionHtmlBySlot[slotKey.toLowerCase()] ||
                ""
              : "";
            const systemHtml = renderPrintBlock(
              component.label,
              snippet,
              component.description,
              "system"
            );
            return systemHtml
              ? {
                  html: systemHtml,
                  sectionColumn: resolvePrintSectionColumn(component),
                  span: 12,
                  fullWidth: true
                }
              : undefined;
          }
          if (component.type === "datagrid") {
            const rows =
              sanitizeDataGridRows(data[component.key], component) || [];
            const rowIdKey = normalizeKey(
              clean(component.datagridRowIdKey || "")
            );
            const normalizedRows = rows
              .filter((row) => Object.keys(row).some((key) => key !== rowIdKey))
              .map((row) => {
                const columns =
                  normalizeDataGridColumns(component.datagridColumns) ||
                  createDefaultDataGridColumns(component.key);
                return columns.map((column) =>
                  escapeHtml(formatValueForPrint(row[column.key], column.type))
                );
              });
            const datagridHtml = renderPrintTableBlock(
              component.label || component.key,
              (
                normalizeDataGridColumns(component.datagridColumns) ||
                createDefaultDataGridColumns(component.key)
              ).map((column) => column.label || column.key),
              normalizedRows,
              component.description
            );
            return datagridHtml
              ? {
                  html: datagridHtml,
                  sectionColumn: resolvePrintSectionColumn(component),
                  span: 12,
                  fullWidth: true
                }
              : undefined;
          }
          if (component.type === "matrix") {
            const matrixRows = getMatrixRows(component);
            const answers =
              sanitizeMatrixValue(component, data[component.key]) || {};
            const answeredAny = matrixRows.some((row) =>
              clean(answers[row.key])
            );
            if (component.hideOutputIfEmpty && !answeredAny) {
              return undefined;
            }
            const normalizedRows = matrixRows.map((row) => {
              const answer = clean(answers[row.key]);
              const answerLabel = answer
                ? clean(component.optionLabels?.[answer]) || answer
                : "";
              return [
                escapeHtml(row.label || row.key),
                escapeHtml(answerLabel)
              ];
            });
            const matrixHtml = renderPrintTableBlock(
              component.label || component.key,
              ["Question", "Answer"],
              normalizedRows,
              component.description
            );
            return matrixHtml
              ? {
                  html: matrixHtml,
                  sectionColumn: resolvePrintSectionColumn(component),
                  span: 12,
                  fullWidth: true
                }
              : undefined;
          }
          if (component.type === "signature") {
            const signature = parseSignatureValue(data[component.key]);
            const typedName = clean(signature.typedName);
            const drawDataUrl = clean(signature.drawDataUrl);
            if (!typedName && !drawDataUrl && component.hideOutputIfEmpty) {
              return undefined;
            }
            const signatureHtml = drawDataUrl
              ? `<div class="rjsf-builder__pdf-signature-draw"><img src="${escapeHtml(
                  drawDataUrl
                )}" alt="${escapeHtml(
                  component.label || component.key
                )}" /></div>`
              : typedName
              ? `<div class="rjsf-builder__pdf-signature-type">${escapeHtml(
                  typedName
                )}</div>`
              : `<div class="rjsf-builder__pdf-signature-type">&nbsp;</div>`;
            const blockHtml = renderPrintBlock(
              component.label || component.key,
              signatureHtml,
              component.description
            );
            return blockHtml
              ? {
                  html: blockHtml,
                  sectionColumn: resolvePrintSectionColumn(component),
                  span: clamp(
                    component.columnSpan || defaultColumnSpan(component.type),
                    1,
                    12
                  ),
                  fullWidth: shouldRenderPrintItemFullWidth(
                    component,
                    blockHtml
                  )
                }
              : undefined;
          }
          const perAnswerTemplate = getPerAnswerOutputTemplate(
            component,
            data
          );
          if (perAnswerTemplate != null && !clean(perAnswerTemplate)) {
            return undefined;
          }
          const template =
            perAnswerTemplate != null
              ? perAnswerTemplate
              : getEffectiveDocumentOutputTemplate(component);
          if (!template) {
            return undefined;
          }
          if (component.hideOutputIfEmpty && !hasOutputValue(component, data)) {
            return undefined;
          }
          if (
            (perAnswerTemplate != null ||
              hasExplicitDocumentOutputTemplate(component) ||
              component.type === "contentBlock") &&
            isNarrativeWithAllValueTokensEmpty(template, tokenValues)
          ) {
            return undefined;
          }
          const blockHtml = renderPrintBlock(
            undefined,
            asHtmlSnippet(replaceOutputTokens(template, tokenValues))
          );
          return blockHtml
            ? {
                html: blockHtml,
                sectionColumn: resolvePrintSectionColumn(component),
                span: clamp(
                  component.columnSpan || defaultColumnSpan(component.type),
                  1,
                  12
                ),
                fullWidth: shouldRenderPrintItemFullWidth(component, blockHtml)
              }
            : undefined;
        })
        .filter((block): block is PrintLayoutItem =>
          Boolean(block && clean(block.html))
        );
      if (!blocks.length) {
        return "";
      }
      const contentHtml = renderPrintSectionLayout(blocks, section.columns);
      const titleHtml =
        section.key !== "__default" && clean(section.title)
          ? `<div class="rjsf-builder__pdf-section-title">${escapeHtml(
              clean(section.title)
            )}</div>`
          : "";
      return `<section class="rjsf-builder__pdf-section">${titleHtml}${contentHtml}</section>`;
    })
    .filter((item) => clean(item))
    .join("");
  const title =
    clean(definition.title) || DEFAULT_FORM.title || "Untitled Form";
  const description = clean(definition.description);
  const descriptionHtml = description
    ? `<div class="rjsf-builder__pdf-description">${escapeHtml(
        description
      ).replace(/\r?\n/g, "<br />")}</div>`
    : "";
  const customHeaderTemplate = str(definition.pdfHeaderTemplate);
  const customHeaderHtml = clean(customHeaderTemplate)
    ? asHtmlSnippet(replaceOutputTokens(customHeaderTemplate, tokenValues))
    : "";
  const customHeaderBlock =
    clean(customHeaderTemplate) &&
    (!definition.hidePdfHeaderIfEmpty || hasMeaningfulHtml(customHeaderHtml))
      ? `<div class="rjsf-builder__pdf-form-header">${customHeaderHtml}</div>`
      : "";
  const customFooterTemplate = str(definition.pdfFooterTemplate);
  const customFooterHtml = clean(customFooterTemplate)
    ? asHtmlSnippet(replaceOutputTokens(customFooterTemplate, tokenValues))
    : "";
  const customFooterBlock =
    clean(customFooterTemplate) &&
    (!definition.hidePdfFooterIfEmpty || hasMeaningfulHtml(customFooterHtml))
      ? `<footer class="rjsf-builder__pdf-form-footer">${customFooterHtml}</footer>`
      : "";
  const bodyHtml = hasMeaningfulHtml(sectionHtml)
    ? sectionHtml
    : `<div class="rjsf-builder__pdf-empty">No printable content available for this form.</div>`;
  const titleBlock = definition.hidePdfTitleBlock
    ? ""
    : `<header class="rjsf-builder__pdf-header"><h1 class="rjsf-builder__pdf-title">${escapeHtml(
        title
      )}</h1>${descriptionHtml}</header>`;
  return `<!DOCTYPE html><html class="rjsf-builder__pdf-html"><head><style>${PDF_PRINT_SHELL_STYLES}</style></head><body class="rjsf-builder__pdf-body"><article class="rjsf-builder__pdf-document">${titleBlock}${customHeaderBlock}${bodyHtml}${customFooterBlock}</article></body></html>`;
}
function buildResolvedOutputArtifacts(
  definition: FormDefinition,
  data: JsonObject,
  contextTokens: Record<string, string>,
  systemSectionHtmlBySlot: Record<string, string>
): { bodyHtml: string; pdfHtml: string } {
  return {
    bodyHtml: resolveDocumentOutputHtml(
      definition,
      data,
      contextTokens,
      systemSectionHtmlBySlot
    ),
    pdfHtml: buildPrintDocumentHtml(
      definition,
      data,
      contextTokens,
      systemSectionHtmlBySlot
    )
  };
}
function normalizeFieldType(value: unknown): FieldType {
  const raw = clean(value);
  if (!raw) {
    return "text";
  }
  if (FIELD_TYPE_SET.has(raw as FieldType)) {
    return raw as FieldType;
  }
  // Legacy types no longer offered in the palette but still valid on load;
  // normalizeComponent folds them into "number".
  if (raw === "integer" || raw === "slider") {
    return raw as FieldType;
  }
  const lower = raw.toLowerCase();
  const matched = FIELD_TYPES.find((item) => item.type.toLowerCase() === lower);
  return matched?.type || "text";
}
function normalizeDataGridColumnType(value: unknown): DataGridColumnType {
  const raw = clean(value);
  if (!raw) {
    return "text";
  }
  if (DATAGRID_COLUMN_TYPE_SET.has(raw as DataGridColumnType)) {
    return raw as DataGridColumnType;
  }
  const lower = raw.toLowerCase();
  const matched = DATAGRID_COLUMN_TYPES.find(
    (item) => item.type.toLowerCase() === lower
  );
  return matched?.type || "text";
}
function defaultColumnSpan(type: FieldType): number {
  if (type === "datagrid") {
    return 12;
  }
  if (type === "systemDatagrid2") {
    return 12;
  }
  if (type === "checkbox" || type === "switch") {
    return 4;
  }
  if (
    type === "textarea" ||
    type === "radio" ||
    type === "signature" ||
    type === "contentBlock" ||
    type === "matrix"
  ) {
    return 12;
  }
  return 6;
}
function normalizeKey(raw: string): string {
  const normalized = raw
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^[^a-zA-Z_]+/, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "field";
}
function makeUniqueKey(
  baseKey: string,
  components: FormComponent[],
  currentId?: string
): string {
  const base = normalizeKey(baseKey);
  const keys = new Set(
    components.filter((item) => item.id !== currentId).map((item) => item.key)
  );
  if (!keys.has(base)) {
    return base;
  }
  let i = 2;
  while (keys.has(`${base}_${i}`)) {
    i += 1;
  }
  return `${base}_${i}`;
}
function makeUniqueRepeatGroupKey(
  components: FormComponent[],
  currentId?: string,
  baseKey = "group"
): string {
  const base = normalizeKey(baseKey);
  const keys = new Set(
    components
      .filter((item) => item.id !== currentId)
      .map((item) => item.repeatGroup?.key)
      .filter((value): value is string => Boolean(value))
  );
  if (!keys.has(base)) {
    return base;
  }
  let i = 2;
  while (keys.has(`${base}_${i}`)) {
    i += 1;
  }
  return `${base}_${i}`;
}
function makeUniqueDataGridColumnKey(
  baseKey: string,
  columns: DataGridColumn[],
  currentId?: string
): string {
  const base = normalizeKey(baseKey);
  const keys = new Set(
    columns.filter((item) => item.id !== currentId).map((item) => item.key)
  );
  if (!keys.has(base)) {
    return base;
  }
  let i = 2;
  while (keys.has(`${base}_${i}`)) {
    i += 1;
  }
  return `${base}_${i}`;
}
function createDefaultDataGridColumns(baseKey = "row"): DataGridColumn[] {
  const nameKey = normalizeKey(`${baseKey}_name`);
  const valueKey = normalizeKey(`${baseKey}_value`);
  const statusKey = normalizeKey(`${baseKey}_status`);
  return [
    {
      id: makeId("col"),
      key: nameKey,
      label: "Name",
      type: "text",
      required: true,
      columnSpan: 4
    },
    {
      id: makeId("col"),
      key: valueKey,
      label: "Value",
      type: "text",
      required: false,
      columnSpan: 5
    },
    {
      id: makeId("col"),
      key: statusKey,
      label: "Status",
      type: "select",
      required: false,
      columnSpan: 3,
      options: ["Active", "Inactive"]
    }
  ];
}
function createDataGridColumnsFromTemplate(
  template: SystemTemplateDefinition
): DataGridColumn[] {
  const columns: DataGridColumn[] = [];
  template.columns.forEach((column) => {
    const key = makeUniqueDataGridColumnKey(column.key, columns);
    columns.push({
      id: makeId("col"),
      key,
      label: clean(column.label) || key,
      type: normalizeDataGridColumnType(column.type),
      required: Boolean(column.required),
      columnSpan: clamp(
        Math.floor(Number(column.columnSpan) || defaultColumnSpan(column.type)),
        1,
        12
      ),
      options:
        column.type === "select" || column.type === "radio"
          ? parseOptions(column.options).options
          : undefined
    });
  });
  return columns.length
    ? columns
    : createDefaultDataGridColumns(template.keyBase);
}
function isLayoutTemplateType(value: string): value is LayoutTemplateType {
  return LAYOUT_TEMPLATE_SET.has(value as LayoutTemplateType);
}
function isSystemTemplateType(value: string): value is SystemTemplateType {
  return (
    SYSTEM_TEMPLATE_SET.has(value as SystemTemplateType) ||
    EXTRA_SYSTEM_TEMPLATES.some((template) => template.type === value)
  );
}
function isSystemTemplateSlotProperty(
  value: string
): value is SystemTemplateSlotProperty {
  return (
    SYSTEM_TEMPLATE_SLOT_PROPERTY_SET.has(value) ||
    EXTRA_SYSTEM_TEMPLATES.some(
      (template) => template.systemTemplateSlotProperty === value
    )
  );
}
function getSystemTemplateSlotProperty(
  templateType?: SystemTemplateType
): SystemTemplateSlotProperty | undefined {
  const template = getSystemTemplateDefinition(templateType);
  return template?.systemTemplateSlotProperty;
}
function getSystemTemplateDefinitionBySlotProperty(
  slotProperty?: string
): SystemTemplateDefinition | undefined {
  const cleanSlot = clean(slotProperty);
  if (!isSystemTemplateSlotProperty(cleanSlot)) {
    return undefined;
  }
  return allSystemTemplates().find(
    (template) => template.systemTemplateSlotProperty === cleanSlot
  );
}
function normalizeTemplateLookupKey(raw: unknown): string {
  return clean(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
function inferSystemTemplateDefinitionFromKey(
  componentKey?: string
): SystemTemplateDefinition | undefined {
  const normalized = normalizeTemplateLookupKey(componentKey);
  if (!normalized) {
    return undefined;
  }
  const templates = allSystemTemplates();
  const exactMatch = templates.find(
    (template) =>
      normalizeTemplateLookupKey(template.keyBase) === normalized ||
      normalizeTemplateLookupKey(template.systemTemplateSlotProperty) ===
        normalized
  );
  if (exactMatch) {
    return exactMatch;
  }
  const trimmed = normalized.replace(/\d+$/, "");
  if (trimmed && trimmed !== normalized) {
    const trimmedMatch = templates.find(
      (template) =>
        normalizeTemplateLookupKey(template.keyBase) === trimmed ||
        normalizeTemplateLookupKey(template.systemTemplateSlotProperty) ===
          trimmed
    );
    if (trimmedMatch) {
      return trimmedMatch;
    }
  }
  return templates.find((template) =>
    normalized.startsWith(normalizeTemplateLookupKey(template.keyBase))
  );
}
function getSystemTemplateDefinition(
  templateType?: SystemTemplateType
): SystemTemplateDefinition | undefined {
  if (!templateType) {
    return undefined;
  }
  return allSystemTemplates().find(
    (template) => template.type === templateType
  );
}
type SlotRenderer = () => ReactNode | null;
function normalizeWidgetRenderResult(raw: unknown): ReactNode | null {
  if (raw == null || raw === false) {
    return null;
  }
  if (Array.isArray(raw)) {
    return raw as ReactNode;
  }
  if (isValidElement(raw)) {
    return raw;
  }
  if (typeof raw === "string" || typeof raw === "number") {
    return raw;
  }
  return null;
}
function toWidgetRenderer(raw: unknown): SlotRenderer | undefined {
  if (!raw) {
    return undefined;
  }
  if (Array.isArray(raw)) {
    return () => normalizeWidgetRenderResult(raw);
  }
  if (
    isValidElement(raw) ||
    typeof raw === "string" ||
    typeof raw === "number"
  ) {
    return () => normalizeWidgetRenderResult(raw);
  }
  if (typeof raw === "function") {
    const renderer = raw as (props?: Record<string, unknown>) => ReactNode;
    return () => normalizeWidgetRenderResult(createElement(renderer, {}));
  }
  if (typeof raw === "object" && "renderer" in raw) {
    return toWidgetRenderer((raw as { renderer?: unknown }).renderer);
  }
  return undefined;
}
function setDragData(
  dataTransfer: DataTransfer,
  type: string,
  value: string
): void {
  if (!value) {
    return;
  }
  dataTransfer.setData(type, value);
  dataTransfer.setData(
    "text/plain",
    `${DRAG_TEXT_PREFIX}${type}:${encodeURIComponent(value)}`
  );
}
function getDragData(dataTransfer: DataTransfer, type: string): string {
  const direct = dataTransfer.getData(type);
  if (direct) {
    return direct;
  }
  const fallback = dataTransfer.getData("text/plain");
  const prefix = `${DRAG_TEXT_PREFIX}${type}:`;
  if (!fallback.startsWith(prefix)) {
    return "";
  }
  try {
    return decodeURIComponent(fallback.slice(prefix.length));
  } catch (_error) {
    return fallback.slice(prefix.length);
  }
}
function nextSectionOrder(components: FormComponent[]): number {
  const orders = components
    .map((component) => component.sectionOrder)
    .filter((value): value is number => Number.isFinite(Number(value)))
    .map((value) => Math.floor(Number(value)));
  return orders.length ? Math.max(...orders) + 1 : 0;
}
function makeUniqueSectionTitle(
  components: FormComponent[],
  prefix: string
): string {
  const cleanPrefix = clean(prefix) || "Section";
  const existing = new Set(
    components.map((component) => clean(component.section)).filter(Boolean)
  );
  if (!existing.has(cleanPrefix)) {
    return cleanPrefix;
  }
  let i = 2;
  while (existing.has(`${cleanPrefix} ${i}`)) {
    i += 1;
  }
  return `${cleanPrefix} ${i}`;
}
function inferSectionColumnsFromTitle(
  sectionTitle?: string
): number | undefined {
  const title = clean(sectionTitle).toLowerCase();
  if (!title) {
    return undefined;
  }
  const match = title.match(/(\d+)\s*colu?m?n?s?/);
  if (match?.[1]) {
    const parsed = Math.floor(Number(match[1]));
    return parsed >= 1 ? clamp(parsed, 1, 12) : undefined;
  }
  if (title.includes("three column")) {
    return 3;
  }
  if (title.includes("two column")) {
    return 2;
  }
  if (title.includes("three colum")) {
    return 3;
  }
  if (title.includes("two colum")) {
    return 2;
  }
  if (title.includes("four column")) {
    return 4;
  }
  if (title.includes("four colum")) {
    return 4;
  }
  return undefined;
}
function normalizeSectionName(value?: string): string | undefined {
  const normalized = clean(value);
  return normalized || undefined;
}
function resolveInsertIndex(
  components: FormComponent[],
  section: string | undefined,
  targetKey?: string,
  placement: DropPlacement = "after"
): number {
  if (targetKey) {
    const targetIndex = components.findIndex(
      (component) => component.key === targetKey
    );
    if (targetIndex >= 0) {
      return placement === "before" ? targetIndex : targetIndex + 1;
    }
  }
  const normalizedSection = normalizeSectionName(section);
  let lastIndex = -1;
  components.forEach((component, index) => {
    if (normalizeSectionName(component.section) === normalizedSection) {
      lastIndex = index;
    }
  });
  return lastIndex >= 0 ? lastIndex + 1 : components.length;
}
function resolveSectionMeta(
  components: FormComponent[],
  section: string | undefined,
  targetKey?: string
): Pick<
  FormComponent,
  | "section"
  | "sectionId"
  | "sectionOrder"
  | "sectionColumns"
  | "sectionCollapsible"
  | "sectionCollapsedByDefault"
> {
  const maxSectionColumns = (sectionName: string | undefined): number => {
    if (!sectionName) {
      return 0;
    }
    return components.reduce((max, component) => {
      if (normalizeSectionName(component.section) !== sectionName) {
        return max;
      }
      const cols = Number(component.sectionColumns);
      return Number.isFinite(cols) && Math.floor(cols) > max
        ? Math.floor(cols)
        : max;
    }, 0);
  };
  const target = targetKey
    ? components.find((component) => component.key === targetKey)
    : undefined;
  if (target) {
    const targetSection = normalizeSectionName(target.section);
    const sectionWideColumns = maxSectionColumns(targetSection);
    return {
      section: targetSection,
      // Moving into a section means adopting its stable identity.
      sectionId: targetSection ? clean(target.sectionId) || undefined : undefined,
      sectionOrder: target.sectionOrder,
      sectionColumns:
        sectionWideColumns > 1 ? sectionWideColumns : target.sectionColumns,
      sectionCollapsible: target.sectionCollapsible,
      sectionCollapsedByDefault: target.sectionCollapsedByDefault
    };
  }
  const normalizedSection = normalizeSectionName(section);
  if (!normalizedSection) {
    return {
      section: undefined,
      sectionId: undefined,
      sectionOrder: undefined,
      sectionColumns: undefined,
      sectionCollapsible: false,
      sectionCollapsedByDefault: false
    };
  }
  const existing = components.find(
    (component) => normalizeSectionName(component.section) === normalizedSection
  );
  const sectionWideColumns = maxSectionColumns(normalizedSection);
  return {
    section: normalizedSection,
    sectionId: clean(existing?.sectionId) || undefined,
    sectionOrder: existing?.sectionOrder ?? nextSectionOrder(components),
    sectionColumns:
      sectionWideColumns > 1
        ? sectionWideColumns
        : existing?.sectionColumns ??
          inferSectionColumnsFromTitle(normalizedSection),
    sectionCollapsible: existing?.sectionCollapsible ?? true,
    sectionCollapsedByDefault: existing?.sectionCollapsedByDefault ?? false
  };
}
function getSectionKey(component: FormComponent): string {
  return clean(component.sectionId) || component.section || "";
}
let choiceOptionDraftId = 0;
function createChoiceOptionDraft(
  label = "",
  value = "",
  score = ""
): ChoiceOptionDraft {
  choiceOptionDraftId += 1;
  return { id: `opt_${choiceOptionDraftId}`, label, value, score };
}
// Multi-line paste into the options editor: one option per line; tab or "|"
// splits label / value / score, so a spreadsheet paste maps columns directly.
function parsePastedOptionLines(
  text: string
): Array<{ label: string; value: string; score: string }> {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\t|\s*\|\s*/);
      return {
        label: clean(parts[0]),
        value: clean(parts[1] ?? ""),
        score: clean(parts[2] ?? "")
      };
    })
    .filter((entry) => entry.label);
}
function parseOptionScoreMap(
  value: unknown
): Record<string, number> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const map: Record<string, number> = {};
  Object.entries(value as Record<string, unknown>).forEach(
    ([rawKey, rawScore]) => {
      const key = clean(rawKey);
      const score = Number(rawScore);
      if (!key || !Number.isFinite(score)) {
        return;
      }
      map[key] = score;
    }
  );
  return Object.keys(map).length ? map : undefined;
}
function parseOptionLabelMap(
  value: unknown
): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const map: Record<string, string> = {};
  Object.entries(value as Record<string, unknown>).forEach(
    ([rawKey, rawLabel]) => {
      const key = clean(rawKey);
      const label = clean(rawLabel);
      if (!key || !label) {
        return;
      }
      map[key] = label;
    }
  );
  return Object.keys(map).length ? map : undefined;
}
function parseOptions(
  value: unknown,
  optionLabelsValue?: unknown,
  optionScoresValue?: unknown
): {
  options?: string[];
  optionLabels?: Record<string, string>;
  optionScores?: Record<string, number>;
} {
  const labelMap = parseOptionLabelMap(optionLabelsValue);
  const scoreMap = parseOptionScoreMap(optionScoresValue) || {};
  if (!Array.isArray(value)) {
    return {
      options: undefined,
      optionLabels: labelMap,
      optionScores: Object.keys(scoreMap).length ? scoreMap : undefined
    };
  }
  const seen = new Set<string>();
  const options: string[] = [];
  const optionLabels: Record<string, string> = {};
  const optionScores: Record<string, number> = { ...scoreMap };
  value.forEach((item) => {
    let valueText = "";
    let labelText = "";
    let scoreValue: number | undefined;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const objectItem = item as Record<string, unknown>;
      valueText = clean(objectItem.value ?? objectItem.key ?? objectItem.id);
      labelText = clean(
        objectItem.label ?? objectItem.title ?? objectItem.name
      );
      const rawScore = Number(objectItem.score ?? objectItem.points);
      if (
        (objectItem.score != null || objectItem.points != null) &&
        Number.isFinite(rawScore)
      ) {
        scoreValue = rawScore;
      }
    } else {
      valueText = clean(item);
    }
    const resolvedValue = valueText || labelText;
    if (!resolvedValue || seen.has(resolvedValue)) {
      return;
    }
    seen.add(resolvedValue);
    options.push(resolvedValue);
    const resolvedLabel =
      labelText || clean(labelMap?.[resolvedValue]) || resolvedValue;
    if (resolvedLabel && resolvedLabel !== resolvedValue) {
      optionLabels[resolvedValue] = resolvedLabel;
    }
    if (scoreValue != null && optionScores[resolvedValue] == null) {
      optionScores[resolvedValue] = scoreValue;
    }
  });
  if (labelMap) {
    options.forEach((optionValue) => {
      if (optionLabels[optionValue]) {
        return;
      }
      const mappedLabel = clean(labelMap[optionValue]);
      if (mappedLabel && mappedLabel !== optionValue) {
        optionLabels[optionValue] = mappedLabel;
      }
    });
  }
  return {
    options: options.length ? options : undefined,
    optionLabels: Object.keys(optionLabels).length ? optionLabels : undefined,
    optionScores: Object.keys(optionScores).length ? optionScores : undefined
  };
}
function buildChoiceOptionDrafts(
  component: FormComponent
): ChoiceOptionDraft[] {
  const values = component.options || [];
  if (!values.length) {
    return [createChoiceOptionDraft()];
  }
  return values.map((value) =>
    createChoiceOptionDraft(
      clean(component.optionLabels?.[value]) || value,
      value,
      component.optionScores?.[value] != null
        ? String(component.optionScores[value])
        : ""
    )
  );
}
function normalizeChoiceOptionDrafts(rows: ChoiceOptionDraft[]): {
  rows: ChoiceOptionDraft[];
  options?: string[];
  optionLabels?: Record<string, string>;
  optionScores?: Record<string, number>;
} {
  const seen = new Set<string>();
  const normalizedRows: ChoiceOptionDraft[] = [];
  const options: string[] = [];
  const optionLabels: Record<string, string> = {};
  const optionScores: Record<string, number> = {};
  rows.forEach((row) => {
    const label = clean(row.label);
    const value = clean(row.value) || label;
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    const nextLabel = label || value;
    options.push(value);
    if (nextLabel !== value) {
      optionLabels[value] = nextLabel;
    }
    const scoreText = clean(row.score);
    const score = Number(scoreText);
    const hasScore = scoreText !== "" && Number.isFinite(score);
    if (hasScore) {
      optionScores[value] = score;
    }
    normalizedRows.push(
      createChoiceOptionDraft(nextLabel, value, hasScore ? String(score) : "")
    );
  });
  return {
    rows: normalizedRows.length ? normalizedRows : [createChoiceOptionDraft()],
    options: options.length ? options : undefined,
    optionLabels: Object.keys(optionLabels).length ? optionLabels : undefined,
    optionScores: Object.keys(optionScores).length ? optionScores : undefined
  };
}
function makeUniqueMatrixRowKey(
  baseKey: string,
  rows: MatrixRowConfig[]
): string {
  const base = normalizeKey(baseKey);
  const keys = new Set(rows.map((row) => row.key));
  if (!keys.has(base)) {
    return base;
  }
  let i = 2;
  while (keys.has(`${base}_${i}`)) {
    i += 1;
  }
  return `${base}_${i}`;
}
function createDefaultMatrixRows(baseKey = "matrix"): MatrixRowConfig[] {
  return [
    { key: normalizeKey(`${baseKey}_q1`), label: "Question 1" },
    { key: normalizeKey(`${baseKey}_q2`), label: "Question 2" }
  ];
}
function normalizeMatrixRows(value: unknown): MatrixRowConfig[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const rows: MatrixRowConfig[] = [];
  value.forEach((item, index) => {
    let keyText = "";
    let labelText = "";
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const raw = item as Record<string, unknown>;
      keyText = clean(raw.key ?? raw.value ?? raw.id ?? raw.name);
      labelText = clean(raw.label ?? raw.title ?? raw.question ?? raw.text);
    } else {
      labelText = clean(item);
    }
    const seed = keyText || labelText || `row_${index + 1}`;
    const key = makeUniqueMatrixRowKey(seed, rows);
    rows.push({ key, label: labelText || keyText || key });
  });
  return rows.length ? rows : undefined;
}
function getMatrixRows(component: FormComponent): MatrixRowConfig[] {
  return (
    normalizeMatrixRows(component.matrixRows) ||
    createDefaultMatrixRows(component.key)
  );
}
function sanitizeMatrixValue(
  component: FormComponent,
  value: unknown
): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const rows = getMatrixRows(component);
  const allowed = new Set((component.options || []).map((item) => clean(item)));
  const source = value as JsonObject;
  const next: JsonObject = {};
  rows.forEach((row) => {
    const answer = clean(source[row.key]);
    if (!answer) {
      return;
    }
    if (allowed.size && !allowed.has(answer)) {
      return;
    }
    next[row.key] = answer;
  });
  return Object.keys(next).length ? next : undefined;
}
function resolveSliderBounds(component: FormComponent): {
  minimum: number;
  maximum: number;
  multipleOf: number;
} {
  const minimum = parseOptionalNumber(component.minimum) ?? 0;
  const maximumRaw = parseOptionalNumber(component.maximum) ?? 10;
  const maximum = maximumRaw < minimum ? minimum : maximumRaw;
  const multipleOf = parseOptionalPositiveNumber(component.multipleOf) ?? 1;
  return { minimum, maximum, multipleOf };
}
/** Number fields: effective render style, folding the legacy "slider" field
 *  type into the unified number style set. */
function numberStyleOf(
  component: FormComponent
): "input" | "stepper" | "slider" | "scale" {
  if (component.type === "slider") {
    return "slider";
  }
  if (component.type !== "number") {
    return "input";
  }
  return component.numberStyle || "input";
}
/** Number fields: whole-numbers-only, folding the legacy "integer" type in. */
function isWholeNumberComponent(component: FormComponent): boolean {
  return (
    component.type === "integer" ||
    (component.type === "number" && Boolean(component.wholeNumber))
  );
}
function normalizeDataGridColumns(
  value: unknown
): DataGridColumn[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const columns = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return undefined;
      }
      const raw = item as Record<string, unknown>;
      const type = normalizeDataGridColumnType(raw.type);
      const parsedOptions = parseOptions(
        Array.isArray(raw.optionItems) ? raw.optionItems : raw.options
      );
      const provisional: DataGridColumn = {
        id: clean(raw.id) || makeId("col"),
        key: normalizeKey(
          clean(raw.key) || clean(raw.name) || `column_${index + 1}`
        ),
        label: clean(raw.label) || clean(raw.title) || "",
        type,
        required: toBoolean(raw.required),
        columnSpan: clamp(
          Math.floor(
            Number(raw.columnSpan ?? raw.width) || defaultColumnSpan(type)
          ),
          1,
          12
        ),
        options:
          type === "select" || type === "radio"
            ? parsedOptions.options
            : undefined
      };
      if (!provisional.label) {
        provisional.label = provisional.key;
      }
      return provisional;
    })
    .filter((column): column is DataGridColumn => Boolean(column));
  if (!columns.length) {
    return undefined;
  }
  return columns.map((column) => ({
    ...column,
    key: makeUniqueDataGridColumnKey(column.key, columns, column.id)
  }));
}
function buildDataGridColumnsLayoutGrid(columns: DataGridColumn[]): JsonObject {
  const children = columns.map((column) => {
    const span = clamp(
      column.columnSpan || defaultColumnSpan(column.type),
      1,
      12
    );
    return {
      "ui:col": {
        className: `col-xs-12 col-sm-${span}`,
        children: [column.key]
      }
    };
  });
  return {
    "ui:row": { className: "row rjsf-builder__datagrid-row", children }
  };
}
function normalizeMultiSelectValues(
  value: unknown,
  options?: string[]
): string[] | undefined {
  const allowed = new Set((options || []).map((item) => clean(item)));
  const normalized = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(/\r?\n|,/)
    : value == null
    ? []
    : [value];
  const values = normalized
    .map((item) => clean(item))
    .filter(Boolean)
    .filter((item) => !allowed.size || allowed.has(item));
  return values.length ? Array.from(new Set(values)) : undefined;
}
function buildChoiceSchemaOptions(
  component: FormComponent
): JsonObject[] | undefined {
  const values = component.options || [];
  if (!values.length) {
    return undefined;
  }
  return values
    .map((value) => clean(value))
    .filter(Boolean)
    .map((value) => ({
      const: value,
      title: clean(component.optionLabels?.[value]) || value
    }));
}
function buildDataGridColumnSchema(column: DataGridColumn): JsonObject {
  if (column.type === "checkbox") {
    return { type: "boolean", title: column.label || column.key };
  }
  if (column.type === "number") {
    return { type: "number", title: column.label || column.key };
  }
  if (column.type === "integer") {
    return { type: "integer", title: column.label || column.key };
  }
  const schema: JsonObject = {
    type: "string",
    title: column.label || column.key
  };
  if (column.type === "date") {
    schema.format = "date";
  }
  if (column.type === "time") {
    schema.format = "time";
  }
  if (column.type === "email") {
    schema.format = "email";
  }
  if (
    (column.type === "select" || column.type === "radio") &&
    column.options?.length
  ) {
    schema.enum = column.options;
  }
  return schema;
}
function sanitizeDataGridColumnValue(
  column: DataGridColumn,
  value: unknown
): string | number | boolean | undefined {
  if (value == null) {
    return undefined;
  }
  if (column.type === "checkbox") {
    return toBoolean(value);
  }
  if (column.type === "number") {
    const numValue = Number(value);
    return Number.isFinite(numValue) ? numValue : undefined;
  }
  if (column.type === "integer") {
    const numValue = Number(value);
    return Number.isFinite(numValue) ? Math.floor(numValue) : undefined;
  }
  if (Array.isArray(value) || typeof value === "object") {
    return undefined;
  }
  const text = String(value);
  if (column.type === "select" || column.type === "radio") {
    if (!column.options?.length) {
      return clean(text) || undefined;
    }
    const match = column.options.find((option) => option === clean(text));
    return match || undefined;
  }
  return text;
}
function sanitizeDataGridRows(
  value: unknown,
  component: FormComponent
): JsonObject[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const columns =
    normalizeDataGridColumns(component.datagridColumns) ||
    createDefaultDataGridColumns(component.key);
  const rowIdKey = normalizeKey(clean(component.datagridRowIdKey || ""));
  const rows = value
    .filter((row) => row && typeof row === "object" && !Array.isArray(row))
    .map((row) => {
      const source = row as JsonObject;
      const next: JsonObject = {};
      if (rowIdKey && source[rowIdKey] != null) {
        const idText = clean(source[rowIdKey]);
        if (idText) {
          next[rowIdKey] = idText;
        }
      }
      columns.forEach((column) => {
        const normalized = sanitizeDataGridColumnValue(
          column,
          source[column.key]
        );
        if (normalized !== undefined) {
          next[column.key] = normalized;
        }
      });
      return next;
    });
  return rows;
}
function parseSumSources(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((item) => clean(item)).filter(Boolean);
    return items.length ? Array.from(new Set(items)) : undefined;
  }
  const asText = clean(value);
  if (!asText) {
    return undefined;
  }
  const items = asText
    .split(/\r?\n|,/)
    .map((item) => clean(item))
    .filter(Boolean);
  return items.length ? Array.from(new Set(items)) : undefined;
}
function firstArrayStringValue(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }
  const first = value[0];
  return typeof first === "string" ? first : "";
}
function isSummableFieldType(type: FieldType): boolean {
  return (
    type === "number" ||
    type === "integer" ||
    type === "slider" ||
    type === "radio" ||
    type === "select" ||
    type === "yesno" ||
    type === "matrix"
  );
}
function toNumericValue(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const asText = clean(value);
  if (!asText) {
    return undefined;
  }
  const parsed = Number(asText);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function parseOptionalInteger(value: unknown): number | undefined {
  const numeric = toNumericValue(value);
  return numeric == null ? undefined : Math.floor(numeric);
}
function parseOptionalNumber(value: unknown): number | undefined {
  return toNumericValue(value);
}
function parseOptionalNonNegativeInteger(value: unknown): number | undefined {
  const parsed = parseOptionalInteger(value);
  return parsed != null && parsed >= 0 ? parsed : undefined;
}
function parseOptionalPositiveNumber(value: unknown): number | undefined {
  const parsed = parseOptionalNumber(value);
  return parsed != null && parsed > 0 ? parsed : undefined;
}
function normalizeIntegerBounds(
  minimumValue: unknown,
  maximumValue: unknown
): { minimum?: number; maximum?: number } {
  const minimum = parseOptionalInteger(minimumValue);
  const maximum = parseOptionalInteger(maximumValue);
  if (minimum != null && maximum != null && maximum < minimum) {
    return { minimum, maximum: minimum };
  }
  return { minimum, maximum };
}
function normalizeNumberBounds(
  minimumValue: unknown,
  maximumValue: unknown
): { minimum?: number; maximum?: number } {
  const minimum = parseOptionalNumber(minimumValue);
  const maximum = parseOptionalNumber(maximumValue);
  if (minimum != null && maximum != null && maximum < minimum) {
    return { minimum, maximum: minimum };
  }
  return { minimum, maximum };
}
function normalizeLengthBounds(
  minLengthValue: unknown,
  maxLengthValue: unknown
): { minLength?: number; maxLength?: number } {
  const minLength = parseOptionalNonNegativeInteger(minLengthValue);
  const maxLength = parseOptionalNonNegativeInteger(maxLengthValue);
  if (minLength != null && maxLength != null && maxLength < minLength) {
    return { minLength, maxLength: minLength };
  }
  return { minLength, maxLength };
}
function applyIntegerBounds(
  value: number,
  minimum?: number,
  maximum?: number
): number {
  let next = Math.floor(value);
  if (minimum != null) {
    next = Math.max(next, minimum);
  }
  if (maximum != null) {
    next = Math.min(next, maximum);
  }
  return next;
}
function applyNumberBounds(
  value: number,
  minimum?: number,
  maximum?: number
): number {
  let next = value;
  if (minimum != null) {
    next = Math.max(next, minimum);
  }
  if (maximum != null) {
    next = Math.min(next, maximum);
  }
  return next;
}
function buildFieldClassNames(component: FormComponent): string | undefined {
  const classes: string[] = [];
  if (component.hideLabel) {
    classes.push("rjsf-builder__field-label-hidden");
  }
  if (component.labelLayoutOverride === "inline") {
    classes.push("rjsf-builder__field-label-inline");
  }
  if (component.labelLayoutOverride === "block") {
    classes.push("rjsf-builder__field-label-block");
  }
  if (component.optionStyle === "modern") {
    classes.push("rjsf-builder__field--opt-modern");
  }
  if (
    (component.type === "radio" || component.type === "select") &&
    component.multiSelect
  ) {
    /* Multi-select renders as an array field (checkboxes widget); this marker
       lets the label-layout CSS treat it like any other choice field instead
       of excluding it with datagrids/repeat groups. */
    classes.push("rjsf-builder__field--choice-multi");
  }
  if (
    component.type === "switch" ||
    (component.type === "checkbox" && component.optionStyle === "switch")
  ) {
    classes.push("rjsf-builder__field--switch");
  }
  if (component.type === "contentBlock") {
    classes.push("rjsf-builder__field--content-block");
  }
  if (component.type === "matrix") {
    classes.push("rjsf-builder__field--matrix");
  }
  const numStyle = numberStyleOf(component);
  if (numStyle === "slider") {
    classes.push("rjsf-builder__field--slider");
  }
  if (numStyle === "stepper") {
    classes.push("rjsf-builder__field--num-stepper");
  }
  if (numStyle === "scale") {
    classes.push("rjsf-builder__field--num-scale");
  }
  return classes.length ? classes.join(" ") : undefined;
}
function hasOutputValue(component: FormComponent, data: JsonObject): boolean {
  if (component.type === "contentBlock") {
    return clean(component.contentText).length > 0;
  }
  const hasPrimitive = (value: unknown): boolean => {
    if (value == null) {
      return false;
    }
    if (typeof value === "string") {
      return clean(value).length > 0;
    }
    if (typeof value === "number") {
      return Number.isFinite(value);
    }
    if (typeof value === "boolean") {
      return value;
    }
    return false;
  };
  const hasMultiSelect = (value: unknown): boolean =>
    Boolean(normalizeMultiSelectValues(value, component.options)?.length);
  const hasDataGridRows = (value: unknown): boolean => {
    const rows = sanitizeDataGridRows(value, component) || [];
    const rowIdKey = normalizeKey(clean(component.datagridRowIdKey || ""));
    return rows.some((row) =>
      Object.entries(row).some(
        ([key, cellValue]) => key !== rowIdKey && hasPrimitive(cellValue)
      )
    );
  };
  if (component.type === "datagrid") {
    if (component.repeatGroup?.key) {
      const rows = Array.isArray(data[component.repeatGroup.key])
        ? (data[component.repeatGroup.key] as unknown[])
        : [];
      return rows.some((row) =>
        hasDataGridRows((row as JsonObject)?.[component.key])
      );
    }
    return hasDataGridRows(data[component.key]);
  }
  if (component.type === "matrix") {
    const rows = getMatrixRows(component);
    if (!rows.length) {
      return false;
    }
    const answers = sanitizeMatrixValue(component, data[component.key]) || {};
    // Default: any answered row counts (matches the server-side required
    // counter). "Require every row" is the per-field opt-in.
    return component.matrixRequireAllRows === true
      ? rows.every((row) => hasPrimitive(answers[row.key]))
      : rows.some((row) => hasPrimitive(answers[row.key]));
  }
  if (component.repeatGroup?.key) {
    const rows = Array.isArray(data[component.repeatGroup.key])
      ? (data[component.repeatGroup.key] as unknown[])
      : [];
    return rows.some((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        return false;
      }
      const rowValue = (row as JsonObject)[component.key];
      return (component.type === "select" || component.type === "radio") &&
        component.multiSelect
        ? hasMultiSelect(rowValue)
        : hasPrimitive(rowValue);
    });
  }
  return (component.type === "select" || component.type === "radio") &&
    component.multiSelect
    ? hasMultiSelect(data[component.key])
    : hasPrimitive(data[component.key]);
}
function resolveVisibilityCurrentValue(data: JsonObject, key: string): unknown {
  const normalizedKey = clean(key);
  if (!normalizedKey) {
    return undefined;
  }
  return data[normalizedKey];
}
function evaluateVisibilityRuleAgainstData(
  rule: VisibilityRule,
  data: JsonObject,
  componentsByKey?: Map<string, FormComponent>
): boolean {
  const whenKey = clean(rule.whenKey);
  if (!whenKey) {
    return true;
  }
  const targetComponent = componentsByKey?.get(whenKey);
  const rawValue = resolveVisibilityCurrentValue(data, whenKey);
  const operator = rule.operator || "equals";
  if (
    (targetComponent?.type === "select" || targetComponent?.type === "radio") &&
    targetComponent.multiSelect
  ) {
    const selectedValues = normalizeMultiSelectValues(
      rawValue,
      targetComponent.options
    );
    if (operator === "truthy") {
      return Boolean(selectedValues?.length);
    }
    if (operator === "falsy") {
      return !selectedValues?.length;
    }
    if (NUMERIC_VISIBILITY_OPERATORS.has(operator)) {
      return false;
    }
    const expected = clean(
      coerceVisibilityRuleValue(rule.value, targetComponent)
    );
    if (operator === "startsWith") {
      return (
        Boolean(expected) &&
        Boolean(selectedValues?.some((item) => item.startsWith(expected)))
      );
    }
    const matches =
      Boolean(expected) && Boolean(selectedValues?.includes(expected));
    return operator === "notEquals" ? !matches : matches;
  }
  if (operator === "truthy") {
    return Array.isArray(rawValue)
      ? rawValue.length > 0
      : typeof rawValue === "string"
      ? clean(rawValue).length > 0
      : Boolean(rawValue);
  }
  if (operator === "falsy") {
    return Array.isArray(rawValue)
      ? rawValue.length === 0
      : typeof rawValue === "string"
      ? clean(rawValue).length === 0
      : !rawValue;
  }
  if (NUMERIC_VISIBILITY_OPERATORS.has(operator)) {
    const actual = toNumericValue(rawValue);
    const expected = toNumericValue(rule.value);
    if (actual == null || expected == null) {
      return false;
    }
    return compareVisibilityNumbers(operator, actual, expected);
  }
  if (operator === "contains" || operator === "startsWith") {
    const expectedText = clean(rule.value);
    if (!expectedText) {
      return false;
    }
    if (Array.isArray(rawValue)) {
      return operator === "contains"
        ? rawValue.some((item) => str(item) === expectedText)
        : rawValue.some((item) => str(item).startsWith(expectedText));
    }
    const actualText = rawValue == null ? "" : str(rawValue);
    return operator === "contains"
      ? actualText.includes(expectedText)
      : actualText.startsWith(expectedText);
  }
  const expectedValue = coerceVisibilityRuleValue(rule.value, targetComponent);
  const matches = rawValue === expectedValue;
  return operator === "notEquals" ? !matches : matches;
}
function isComponentVisibleForSummary(
  component: FormComponent,
  data: JsonObject,
  componentsByKey?: Map<string, FormComponent>
): boolean {
  if (!component.visibility?.rules?.length) {
    return true;
  }
  const matches = component.visibility.rules.map((rule) =>
    evaluateVisibilityRuleAgainstData(rule, data, componentsByKey)
  );
  return component.visibility.mode === "any"
    ? matches.some(Boolean)
    : matches.every(Boolean);
}
function isTrackableSectionSummaryComponent(component: FormComponent): boolean {
  return (
    component.type !== "systemDatagrid2" &&
    component.type !== "total" &&
    component.type !== "contentBlock"
  );
}
function buildSectionSwitchableMap(
  definition: FormDefinition
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  definition.components.forEach((component) => {
    if (!component.sectionSwitchEnabled) {
      return;
    }
    const key = resolveComponentSectionKey(component);
    map[key] = true;
  });
  return map;
}
function resolveCalculatedSourceKeys(
  component: FormComponent,
  components: FormComponent[]
): string[] {
  const available = components.filter(
    (candidate) =>
      candidate.id !== component.id &&
      !candidate.repeatGroup &&
      candidate.type !== "total" &&
      isSummableFieldType(candidate.type)
  );
  const availableKeys = new Set(available.map((candidate) => candidate.key));
  const explicit = (component.sumSources || [])
    .map((item) => clean(item))
    .filter((item) => availableKeys.has(item));
  if (explicit.length) {
    return Array.from(new Set(explicit));
  }
  return available.map((candidate) => candidate.key);
}
function normalizeScoreBands(
  raw: any
): Array<{ min: number; max: number; label: string }> | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const bands = raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const min = Number((entry as JsonObject).min);
      const max = Number((entry as JsonObject).max);
      const label = clean((entry as JsonObject).label);
      if (!Number.isFinite(min) || !Number.isFinite(max) || !label) {
        return null;
      }
      return { min: Math.min(min, max), max: Math.max(min, max), label };
    })
    .filter(Boolean) as Array<{ min: number; max: number; label: string }>;
  return bands.length ? bands.sort((a, b) => a.min - b.min) : undefined;
}
function resolveScoreBandLabel(
  bands: Array<{ min: number; max: number; label: string }> | undefined,
  total: number
): string {
  if (!bands?.length || !Number.isFinite(total)) {
    return "";
  }
  const match = bands.find((band) => total >= band.min && total <= band.max);
  return match?.label || "";
}
function calculateComponentTotal(
  component: FormComponent,
  components: FormComponent[],
  data: JsonObject
): number {
  const sourceKeys = resolveCalculatedSourceKeys(component, components);
  const componentsByKey = new Map(
    components.map((candidate) => [candidate.key, candidate])
  );
  const total = sourceKeys.reduce((sum, key) => {
    const source = componentsByKey.get(key);
    const scores = source?.optionScores;
    if (scores && Object.keys(scores).length) {
      const raw = data[key];
      const values =
        source?.type === "matrix"
          ? raw && typeof raw === "object" && !Array.isArray(raw)
            ? Object.values(raw as JsonObject)
            : []
          : Array.isArray(raw)
          ? raw
          : raw == null
          ? []
          : [raw];
      const scoreSum = values.reduce((acc: number, item) => {
        const score = scores[clean(item)];
        return typeof score === "number" && Number.isFinite(score)
          ? acc + score
          : acc;
      }, 0);
      return sum + scoreSum;
    }
    if (source?.type === "matrix") {
      const raw = data[key];
      const rowValues =
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? Object.values(raw as JsonObject)
          : [];
      const matrixSum = rowValues.reduce((acc: number, item) => {
        const numeric = toNumericValue(item);
        return numeric == null ? acc : acc + numeric;
      }, 0);
      return sum + matrixSum;
    }
    const numericValue = toNumericValue(data[key]);
    return numericValue == null ? sum : sum + numericValue;
  }, 0);
  return Number.isFinite(total) ? total : 0;
}
/** Maximum achievable score for a Calculated total: per source field, the top
 *  option score (matrix: top score x row count; multi-select: sum of positive
 *  scores). Unscored numeric sources contribute their configured maximum. */
function calculateComponentMaxScore(
  component: FormComponent,
  components: FormComponent[]
): number {
  const sourceKeys = resolveCalculatedSourceKeys(component, components);
  const componentsByKey = new Map(
    components.map((candidate) => [candidate.key, candidate])
  );
  const max = sourceKeys.reduce((sum, key) => {
    const source = componentsByKey.get(key);
    if (!source) {
      return sum;
    }
    const scores = Object.values(source.optionScores || {}).filter(
      (score) => typeof score === "number" && Number.isFinite(score)
    ) as number[];
    if (scores.length) {
      const top = Math.max(...scores, 0);
      if (source.type === "matrix") {
        return sum + top * getMatrixRows(source).length;
      }
      if (
        (source.type === "select" || source.type === "radio") &&
        source.multiSelect
      ) {
        return (
          sum + scores.filter((score) => score > 0).reduce((a, b) => a + b, 0)
        );
      }
      return sum + top;
    }
    if (source.type === "matrix") {
      // Unscored matrix: option VALUES are the scores (e.g. "0".."3").
      const numericOptions = (source.options || [])
        .map((option) => toNumericValue(option))
        .filter((value): value is number => value != null);
      const top = numericOptions.length ? Math.max(...numericOptions, 0) : 0;
      return sum + top * getMatrixRows(source).length;
    }
    const numericMax = toNumericValue(source.maximum);
    return numericMax != null && numericMax > 0 ? sum + numericMax : sum;
  }, 0);
  return Number.isFinite(max) ? max : 0;
}
function normalizeBuilderOptions(value: any): BuilderOptions {
  const normalizedLabelLayout =
    clean(value?.labelLayout).toLowerCase() === "inline" ? "inline" : "block";
  return {
    snapToGrid: value?.snapToGrid !== false,
    snapToResize: value?.snapToResize !== false,
    labelLayout: normalizedLabelLayout,
    labelWidth: (() => {
      const parsed = Math.round(Number(value?.labelWidth));
      return Number.isFinite(parsed) && parsed >= 2 && parsed <= 6
        ? parsed
        : undefined;
    })(),
    showLayoutSection: value?.showLayoutSection !== false,
    fillMode: clean(value?.fillMode).toLowerCase() === "wizard" ? "wizard" : "scroll"
  };
}
function snapColumnSpan(rawValue: number, snapEnabled: boolean): number {
  const clamped = clamp(Math.floor(Number(rawValue) || 1), 1, 12);
  if (!snapEnabled) {
    return clamped;
  }
  return COLUMN_SPAN_SNAP_STOPS.reduce((closest, current) =>
    Math.abs(current - clamped) < Math.abs(closest - clamped)
      ? current
      : closest
  );
}
function normalizeRepeatGroup(value: any): RepeatGroupConfig | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const rawKey = clean(
    value?.key ||
      value?.groupKey ||
      value?.repeatGroupKey ||
      value?.repeatableGroupKey
  );
  if (!rawKey) {
    return undefined;
  }
  const key = normalizeKey(rawKey);
  const minItems = Number.isFinite(Number(value?.minItems))
    ? Math.max(0, Math.floor(Number(value.minItems)))
    : undefined;
  const maxItems = Number.isFinite(Number(value?.maxItems))
    ? Math.max(0, Math.floor(Number(value.maxItems)))
    : undefined;
  const defaultItems = Number.isFinite(Number(value?.defaultItems))
    ? Math.max(0, Math.floor(Number(value.defaultItems)))
    : undefined;
  const asDataGrid = toBoolean(
    value?.asDataGrid ?? value?.layoutGrid ?? value?.renderAsGrid
  );
  return {
    key,
    title:
      value?.title == null || String(value.title) === ""
        ? undefined
        : String(value.title),
    minItems,
    maxItems,
    defaultItems,
    asDataGrid
  };
}
function normalizeVisibilityRule(value: any): VisibilityRule | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const rule: VisibilityRule = {
    id: clean(value.id) || makeId("rule"),
    whenKey: clean(value.whenKey || value.visibleWhenKey) || undefined,
    operator:
      (clean(
        value.operator || value.visibleWhenOperator
      ) as VisibilityOperator) || "equals",
    value: clean(value.value || value.visibleWhenValue) || undefined
  };
  if (!rule.whenKey) {
    return undefined;
  }
  if (
    !VISIBILITY_OPERATORS.includes((rule.operator || "") as VisibilityOperator)
  ) {
    rule.operator = "equals";
  }
  return rule;
}
function normalizeVisibility(value: any): VisibilityConfig | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value.rules)) {
    const rules = value.rules
      .map((rule: unknown) => normalizeVisibilityRule(rule))
      .filter((rule: VisibilityRule | undefined): rule is VisibilityRule =>
        Boolean(rule)
      );
    if (!rules.length) {
      return undefined;
    }
    const mode = clean(value.mode).toLowerCase() === "any" ? "any" : "all";
    return { mode, rules };
  }
  const legacyRule = normalizeVisibilityRule(value);
  if (!legacyRule) {
    return undefined;
  }
  return { mode: "all", rules: [legacyRule] };
}
function normalizeComponent(item: any, index: number): FormComponent {
  // "switch" merged into "checkbox" (2026-08-14): legacy switch components
  // become checkboxes with the switch option style.
  // "integer" and "slider" merged into "number" (2026-08-21): legacy fields
  // become numbers with the whole-number flag / slider option style.
  const rawType = normalizeFieldType(item?.type);
  const isLegacySwitch = rawType === "switch";
  const isLegacyInteger = rawType === "integer";
  const isLegacySlider = rawType === "slider";
  const type = isLegacySwitch
    ? "checkbox"
    : isLegacyInteger || isLegacySlider
    ? "number"
    : rawType;
  const wholeNumber =
    type === "number" && (isLegacyInteger || toBoolean(item?.wholeNumber));
  const numberStyle: FormComponent["numberStyle"] =
    type !== "number"
      ? undefined
      : isLegacySlider || clean(item?.numberStyle) === "slider"
      ? "slider"
      : clean(item?.numberStyle) === "stepper"
      ? "stepper"
      : clean(item?.numberStyle) === "scale"
      ? "scale"
      : undefined;
  const keySeed = clean(item?.key) || `field_${index + 1}`;
  const key = normalizeKey(keySeed);
  const labelRaw = item?.label == null ? "" : String(item.label);
  const label = labelRaw !== "" ? labelRaw : key;
  const explicitSystemTemplateType =
    (type === "datagrid" || type === "systemDatagrid2") &&
    isSystemTemplateType(clean(item?.systemTemplateType))
      ? (clean(item?.systemTemplateType) as SystemTemplateType)
      : undefined;
  const explicitSystemTemplateSlotProperty =
    (type === "datagrid" || type === "systemDatagrid2") &&
    isSystemTemplateSlotProperty(clean(item?.systemTemplateSlotProperty))
      ? (clean(item?.systemTemplateSlotProperty) as SystemTemplateSlotProperty)
      : undefined;
  const templateFromType = getSystemTemplateDefinition(
    explicitSystemTemplateType
  );
  const templateFromSlot = getSystemTemplateDefinitionBySlotProperty(
    explicitSystemTemplateSlotProperty
  );
  const templateFromKey = inferSystemTemplateDefinitionFromKey(key);
  const templateDefinition =
    templateFromType || templateFromSlot || templateFromKey;
  const visibilitySource = item?.visibility
    ? item.visibility
    : Array.isArray(item?.visibilityRules)
    ? { mode: item?.visibilityMode, rules: item.visibilityRules }
    : item;
  const repeatGroup =
    normalizeRepeatGroup(item?.repeatGroup) ||
    (clean(item?.repeatGroupKey || item?.repeatableGroupKey || item?.groupKey)
      ? normalizeRepeatGroup({
          key:
            item?.repeatGroupKey || item?.repeatableGroupKey || item?.groupKey,
          title: item?.repeatGroupTitle || item?.groupTitle,
          minItems: item?.repeatGroupMinItems,
          maxItems: item?.repeatGroupMaxItems,
          defaultItems: item?.repeatGroupDefaultItems,
          asDataGrid:
            item?.repeatGroupAsDataGrid ??
            item?.repeatGroupLayoutGrid ??
            item?.repeatGroupRenderAsGrid
        })
      : undefined);
  const sumSources = parseSumSources(
    item?.sumSources || item?.sumSourceKeys || item?.calculation?.sourceKeys
  );
  const numericBounds =
    wholeNumber
      ? normalizeIntegerBounds(
          item?.minimum ?? item?.min ?? item?.minValue,
          item?.maximum ?? item?.max ?? item?.maxValue
        )
      : type === "number"
      ? normalizeNumberBounds(
          item?.minimum ?? item?.min ?? item?.minValue,
          item?.maximum ?? item?.max ?? item?.maxValue
        )
      : { minimum: undefined, maximum: undefined };
  const isTextValidationType =
    type === "text" || type === "textarea" || type === "email";
  const lengthBounds = isTextValidationType
    ? normalizeLengthBounds(item?.minLength, item?.maxLength)
    : { minLength: undefined, maxLength: undefined };
  const multipleOf =
    type === "number"
      ? parseOptionalPositiveNumber(item?.multipleOf ?? item?.step)
      : undefined;
  const multiSelect =
    type === "select" || type === "radio"
      ? toBoolean(
          item?.multiSelect ??
            item?.isMultiSelect ??
            item?.allowMultiple ??
            item?.multiple
        )
      : false;
  const parsedOptions = parseOptions(
    Array.isArray(item?.optionItems) ? item.optionItems : item?.options,
    item?.optionLabels,
    item?.optionScores ?? item?.optionScoreMap ?? item?.scores
  );
  const options =
    type === "yesno" ? [...YES_NO_OPTIONS] : parsedOptions.options;
  const optionLabels =
    type === "yesno"
      ? { ...YES_NO_OPTION_LABELS, ...(parsedOptions.optionLabels || {}) }
      : parsedOptions.optionLabels;
  const optionScores =
    (type === "select" ||
      type === "radio" ||
      type === "yesno" ||
      type === "matrix") &&
    !multiSelect
      ? parsedOptions.optionScores
      : undefined;
  const matrixRows =
    type === "matrix"
      ? normalizeMatrixRows(
          item?.matrixRows ??
            item?.["x-matrix-rows"] ??
            item?.xMatrixRows ??
            item?.rows ??
            item?.questions
        ) || createDefaultMatrixRows(key)
      : undefined;
  const sharedFieldRef =
    clean(
      item?.sharedFieldRef ??
        // Legacy single-attribute binding: shared.* keys were identity bindings.
        (typeof item?.tokenKey === "string" &&
        item.tokenKey.startsWith("shared.")
          ? item.tokenKey
          : undefined)
    ) || undefined;
  const prefillTokenKeySource =
    item?.prefillTokenKey ??
    (typeof item?.tokenKey === "string" && !item.tokenKey.startsWith("shared.")
      ? item.tokenKey
      : undefined) ??
    item?.["x-token-key"] ??
    item?.xTokenKey ??
    item?.defaultFromToken;
  const prefillTokenKey =
    TOKEN_PREFILL_EXCLUDED_TYPES.has(type) || sharedFieldRef
      ? undefined
      : clean(prefillTokenKeySource) || undefined;
  const contentTextSource =
    item?.contentText ?? item?.content ?? item?.contentHtml;
  const contentText =
    type === "contentBlock" && contentTextSource != null
      ? String(contentTextSource)
      : undefined;
  const systemTemplateType =
    type === "datagrid" || type === "systemDatagrid2"
      ? explicitSystemTemplateType || templateDefinition?.type
      : undefined;
  const systemTemplateSlotProperty =
    type === "datagrid" || type === "systemDatagrid2"
      ? explicitSystemTemplateSlotProperty ||
        getSystemTemplateSlotProperty(systemTemplateType)
      : undefined;
  const datagridColumns =
    type === "datagrid" || type === "systemDatagrid2"
      ? normalizeDataGridColumns(
          Array.isArray(item?.datagridColumns)
            ? item.datagridColumns
            : Array.isArray(item?.gridColumns)
            ? item.gridColumns
            : item?.columns
        ) ||
        (type === "systemDatagrid2" && templateDefinition
          ? createDataGridColumnsFromTemplate(templateDefinition)
          : createDefaultDataGridColumns(key))
      : undefined;
  const datagridRowIdKey =
    type === "datagrid" || type === "systemDatagrid2"
      ? clean(item?.datagridRowIdKey ?? item?.rowIdKey ?? item?.identityKey) ||
        clean(templateDefinition?.rowIdKey) ||
        undefined
      : undefined;
  const defaultValue =
    (type === "select" || type === "radio") && multiSelect
      ? normalizeMultiSelectValues(item?.defaultValue, options)
      : type === "yesno"
      ? normalizeYesNoValue(item?.defaultValue)
      : type === "contentBlock" || type === "matrix"
      ? undefined
      : item?.defaultValue;
  const dateGranularity: DateGranularity | undefined = (() => {
    if (type !== "date") {
      return undefined;
    }
    const raw = clean(item?.dateGranularity);
    return raw === "monthYear" ||
      raw === "month" ||
      raw === "year" ||
      raw === "day"
      ? raw
      : undefined; // "full" is the default; store nothing
  })();
  const dateDisplayFormat: DateDisplayFormat | undefined = (() => {
    if (type !== "date" && type !== "datetime") {
      return undefined;
    }
    const raw = clean(item?.dateDisplayFormat);
    return raw === "long" || raw === "iso" ? raw : undefined; // default numeric
  })();
  const timeDisplayFormat: TimeDisplayFormat | undefined = (() => {
    if (type !== "time" && type !== "datetime") {
      return undefined;
    }
    return clean(item?.timeDisplayFormat) === "24h" ? "24h" : undefined; // default 12h
  })();
  const customErrorMessageSource =
    item?.customErrorMessage ?? item?.validate?.customMessage;
  const customErrorMessage =
    customErrorMessageSource == null || String(customErrorMessageSource) === ""
      ? undefined
      : String(customErrorMessageSource);
  const rawDocumentOutputTemplate =
    item?.documentOutputTemplate == null
      ? item?.documentOutput == null
        ? undefined
        : String(item?.documentOutput)
      : String(item?.documentOutputTemplate);
  const optionOutputTexts = (() => {
    const rawMap = item?.optionOutputTexts ?? item?.optionOutputs;
    if (
      !rawMap ||
      typeof rawMap !== "object" ||
      Array.isArray(rawMap) ||
      multiSelect ||
      (type !== "radio" && type !== "select" && type !== "yesno")
    ) {
      return undefined;
    }
    const map: Record<string, string> = {};
    Object.entries(rawMap as Record<string, unknown>).forEach(
      ([optionValue, text]) => {
        const cleanValue = clean(optionValue);
        if (cleanValue && typeof text === "string") {
          map[cleanValue] = text;
        }
      }
    );
    return Object.keys(map).length ? map : undefined;
  })();
  return {
    id: clean(item?.id) || `cmp_${index + 1}_${key}`,
    key,
    label,
    type,
    required:
      type === "total" || type === "systemDatagrid2" || type === "contentBlock"
        ? false
        : toBoolean(item?.required),
    description:
      item?.description == null ? undefined : String(item?.description),
    documentOutputTemplate: rawDocumentOutputTemplate,
    optionOutputTexts,
    placeholder:
      item?.placeholder == null || String(item?.placeholder) === ""
        ? undefined
        : String(item?.placeholder),
    defaultValue,
    prefillTokenKey,
    sharedFieldRef,
    minimum: numericBounds.minimum,
    maximum: numericBounds.maximum,
    multipleOf,
    minLength: lengthBounds.minLength,
    maxLength: lengthBounds.maxLength,
    pattern:
      isTextValidationType &&
      item?.pattern != null &&
      String(item?.pattern) !== ""
        ? String(item?.pattern)
        : undefined,
    customErrorMessage:
      type === "text" || type === "textarea" ? customErrorMessage : undefined,
    hideOutputIfEmpty: toBoolean(
      item?.hideOutputIfEmpty ?? item?.outputHideIfEmpty ?? item?.hideIfEmpty
    ),
    hideLabel: toBoolean(item?.hideLabel ?? item?.labelHidden),
    labelLayoutOverride: resolveLabelLayoutOverride(
      item?.labelLayoutOverride ?? item?.labelPosition
    ),
    optionStyle:
      clean(item?.optionStyle) === "modern"
        ? "modern"
        : clean(item?.optionStyle) === "switch" || isLegacySwitch
        ? "switch"
        : undefined,
    numberStyle,
    wholeNumber: wholeNumber || undefined,
    sectionSwitchEnabled: toBoolean(
      item?.sectionSwitchEnabled ??
        item?.allowSectionToggle ??
        item?.allowSectionSwitch
    ),
    multiSelect,
    contentText,
    options,
    optionLabels,
    optionScores,
    matrixRows,
    matrixRequireAllRows:
      type === "matrix" && toBoolean(item?.matrixRequireAllRows)
        ? true
        : undefined,
    datagridColumns,
    datagridRowIdKey,
    datagridDisplay:
      type === "datagrid" && clean(item?.datagridDisplay) === "table"
        ? "table"
        : undefined,
    systemTemplateSlotProperty,
    systemTemplateType,
    dateGranularity,
    dateDisplayFormat,
    timeDisplayFormat,
    sumSources: type === "total" ? sumSources : undefined,
    scoreBands:
      type === "total" ? normalizeScoreBands(item?.scoreBands) : undefined,
    showMaxScore:
      type === "total" && toBoolean(item?.showMaxScore) ? true : undefined,
    section: clean(item?.section) || undefined,
    // Stable section identity only makes sense alongside a section.
    sectionId: clean(item?.section)
      ? clean(item?.sectionId) || undefined
      : undefined,
    sectionOrder: Number.isFinite(Number(item?.sectionOrder))
      ? Math.floor(Number(item.sectionOrder))
      : undefined,
    sectionColumns: (() => {
      const rawColumns = Number(item?.sectionColumns || item?.layoutColumns);
      if (!Number.isFinite(rawColumns)) {
        return undefined;
      }
      const normalized = Math.floor(rawColumns);
      return normalized >= 1 && normalized <= 12 ? normalized : undefined;
    })(),
    sectionColumn: Number.isFinite(
      Number(item?.sectionColumn || item?.columnIndex || item?.layoutColumn)
    )
      ? clamp(
          Math.floor(
            Number(
              item?.sectionColumn || item?.columnIndex || item?.layoutColumn
            )
          ),
          1,
          12
        )
      : undefined,
    sectionCollapsible: toBoolean(item?.sectionCollapsible),
    sectionCollapsedByDefault: toBoolean(item?.sectionCollapsedByDefault),
    columnSpan: clamp(
      Math.floor(Number(item?.columnSpan) || defaultColumnSpan(type)),
      1,
      12
    ),
    repeatGroup:
      type === "total" ||
      type === "datagrid" ||
      type === "contentBlock" ||
      type === "matrix"
        ? undefined
        : repeatGroup,
    visibility: normalizeVisibility(visibilitySource)
  };
}
// Redesign step 4: flat fields manifest, written alongside the component tree
// on every save. Server-side consumers (TemplateField snapshot, publish
// validation) can read this simple array instead of parsing the nested
// component tree. Purely additive: readers ignore it; `components` stays the
// source of truth in the designer. Named fieldsManifest (NOT `fields`) because
// parseDefinition treats a top-level `fields` array as legacy components.
const FIELDS_MANIFEST_VERSION = 1;
interface FieldManifestEntry {
  key: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  tokenKey?: string;
  prefillTokenKey?: string;
  multiSelect?: boolean;
  section?: string;
  sectionOrder?: number;
  systemTemplateType?: string;
}
function buildFieldsManifest(definition: FormDefinition): FieldManifestEntry[] {
  return (definition.components || [])
    .filter((component) => clean(component.key))
    .map((component) => {
      const entry: FieldManifestEntry = {
        key: component.key,
        type: String(component.type || ""),
        label: component.label == null ? "" : String(component.label),
        required: component.required === true
      };
      if (Array.isArray(component.options) && component.options.length) {
        entry.options = component.options.map((option) => String(option));
      }
      const tokenKey = clean(component.sharedFieldRef) || clean(component.tokenKey);
      if (tokenKey) {
        entry.tokenKey = tokenKey;
      }
      if (clean(component.prefillTokenKey)) {
        entry.prefillTokenKey = clean(component.prefillTokenKey);
      }
      if (component.multiSelect === true) {
        entry.multiSelect = true;
      }
      if (clean(component.section)) {
        entry.section = clean(component.section);
      }
      if (typeof component.sectionOrder === "number") {
        entry.sectionOrder = component.sectionOrder;
      }
      if (component.systemTemplateType) {
        entry.systemTemplateType = String(component.systemTemplateType);
      }
      return entry;
    });
}
function makeSectionId(title?: string): string {
  const slug = clean(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 8);
  return slug ? `sec_${slug}_${suffix}` : `sec_${suffix}`;
}
// Designer-save-only: give every sectioned component a stable sectionId so
// the group identity survives title renames. Components sharing a section
// (same title key) share the same id; existing ids win (first in document
// order — a field moved between sections already adopted the target id via
// resolveSectionMeta); ids are only GENERATED for sections that have none
// yet. Components without a section carry no id. Legacy definitions are
// untouched until a designer save runs through here.
function ensureSectionIds(definition: FormDefinition): FormDefinition {
  const idBySectionTitle: Record<string, string> = {};
  definition.components.forEach((component) => {
    const titleKey = resolveSectionKey(component.section);
    if (titleKey === "__default" || idBySectionTitle[titleKey]) {
      return;
    }
    const existing = clean(component.sectionId);
    if (existing) {
      idBySectionTitle[titleKey] = existing;
    }
  });
  let changed = false;
  const nextComponents = definition.components.map((component) => {
    const titleKey = resolveSectionKey(component.section);
    if (titleKey === "__default") {
      if (clean(component.sectionId)) {
        changed = true;
        return { ...component, sectionId: undefined };
      }
      return component;
    }
    let sectionId = idBySectionTitle[titleKey];
    if (!sectionId) {
      sectionId = makeSectionId(component.section);
      idBySectionTitle[titleKey] = sectionId;
    }
    if (clean(component.sectionId) === sectionId) {
      return component;
    }
    changed = true;
    return { ...component, sectionId };
  });
  return changed ? { ...definition, components: nextComponents } : definition;
}
function serializeDefinitionWithManifest(definition: FormDefinition): string {
  // matrixRowKeysFlat is derived, not edited: recompute from the current rows
  // on every save so the server-side snapshot never sees a stale row list.
  const components = definition.components.map((component) => {
    if (component.type !== "matrix") {
      return component;
    }
    if (component.matrixRequireAllRows !== true) {
      return component.matrixRowKeysFlat
        ? { ...component, matrixRowKeysFlat: undefined }
        : component;
    }
    const flat = getMatrixRows(component)
      .map((row) => clean(row.key))
      .filter(Boolean)
      .join("|");
    // Key order matters: the server-side snapshot slices each component from
    // its "key" to the NEXT "key" occurrence, and matrix ROW objects contain
    // "key" too — so this prop must serialize BEFORE matrixRows or it gets
    // cut out of the slice.
    const { matrixRows, matrixRowKeysFlat, ...rest } = component;
    void matrixRowKeysFlat;
    return {
      ...rest,
      matrixRowKeysFlat: flat || undefined,
      matrixRows
    };
  });
  return JSON.stringify(
    {
      ...definition,
      components,
      fieldsManifestVersion: FIELDS_MANIFEST_VERSION,
      fieldsManifest: buildFieldsManifest(definition)
    },
    null,
    2
  );
}
function parseDefinition(raw?: string): {
  value: FormDefinition;
  error?: string;
} {
  if (!clean(raw)) {
    return { value: DEFAULT_FORM };
  }
  try {
    const parsed = JSON.parse(raw as string);
    const list = Array.isArray(parsed?.components)
      ? parsed.components
      : Array.isArray(parsed?.fields)
      ? parsed.fields
      : [];
    const components: FormComponent[] = list.map((entry: any, index: number) =>
      normalizeComponent(entry, index)
    );
    const keySet = new Set<string>();
    const deduped: FormComponent[] = components.map(
      (component: FormComponent) => {
        const uniqueKey = keySet.has(component.key)
          ? makeUniqueKey(
              component.key,
              components.map((item: FormComponent) => ({
                ...item,
                id: item.id === component.id ? "__self__" : item.id
              })),
              "__self__"
            )
          : component.key;
        keySet.add(uniqueKey);
        return { ...component, key: uniqueKey };
      }
    );
    const repeatGroupUseCount = deduped.reduce((counts, component) => {
      if (component.repeatGroup?.key) {
        counts[component.repeatGroup.key] =
          (counts[component.repeatGroup.key] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);
    const sanitizedComponents = deduped.map((component) => {
      const repeatGroup = component.repeatGroup;
      if (!repeatGroup) {
        return component;
      }
      const looksAutoGenerated =
        repeatGroup.key === component.key &&
        !repeatGroup.title &&
        repeatGroup.minItems == null &&
        repeatGroup.maxItems == null &&
        repeatGroup.defaultItems == null;
      const isSingleFieldGroup =
        (repeatGroupUseCount[repeatGroup.key] || 0) <= 1;
      if (looksAutoGenerated && isSingleFieldGroup) {
        return { ...component, repeatGroup: undefined };
      }
      return component;
    });
    const sectionColumnsByName = sanitizedComponents.reduce(
      (map, component) => {
        const section = normalizeSectionName(component.section);
        if (!section) {
          return map;
        }
        const explicitColumns = Number.isFinite(
          Number(component.sectionColumns)
        )
          ? clamp(Math.floor(Number(component.sectionColumns)), 1, 12)
          : undefined;
        const trustedExplicitColumns =
          explicitColumns && explicitColumns > 1 && explicitColumns <= 12
            ? explicitColumns
            : undefined;
        const inferredColumns = inferSectionColumnsFromTitle(section);
        const columns = trustedExplicitColumns
          ? trustedExplicitColumns
          : inferredColumns;
        if (columns && columns > 1) {
          map[section] = Math.max(map[section] || 1, columns);
        }
        return map;
      },
      {} as Record<string, number>
    );
    const sectionColumnCursorByName: Record<string, number> = {};
    const normalizedComponents = sanitizedComponents.map((component) => {
      const section = normalizeSectionName(component.section);
      if (!section) {
        return {
          ...component,
          section: undefined,
          sectionColumns: undefined,
          sectionColumn: undefined
        };
      }
      const sectionColumns = sectionColumnsByName[section];
      if (!sectionColumns || sectionColumns <= 1) {
        return {
          ...component,
          section,
          sectionColumns: undefined,
          sectionColumn: undefined
        };
      }
      const explicitSectionColumn = Number.isFinite(
        Number(component.sectionColumn)
      )
        ? clamp(Math.floor(Number(component.sectionColumn)), 1, sectionColumns)
        : (() => {
            const currentCursor = sectionColumnCursorByName[section] || 0;
            const assigned = (currentCursor % sectionColumns) + 1;
            sectionColumnCursorByName[section] = currentCursor + 1;
            return assigned;
          })();
      return {
        ...component,
        section,
        sectionColumns,
        sectionColumn: explicitSectionColumn,
        columnSpan: clamp(
          component.columnSpan || defaultColumnSpan(component.type),
          1,
          12
        )
      };
    });
    return {
      value: {
        version: 1,
        title:
          parsed?.title == null ? DEFAULT_FORM.title : String(parsed?.title),
        description:
          parsed?.description == null ? "" : String(parsed?.description),
        pdfHeaderTemplate:
          parsed?.pdfHeaderTemplate == null &&
          parsed?.documentHeaderTemplate == null &&
          parsed?.documentOutputHeaderTemplate == null
            ? undefined
            : String(
                parsed?.pdfHeaderTemplate ??
                  parsed?.documentHeaderTemplate ??
                  parsed?.documentOutputHeaderTemplate
              ),
        pdfFooterTemplate:
          parsed?.pdfFooterTemplate == null &&
          parsed?.documentFooterTemplate == null &&
          parsed?.documentOutputFooterTemplate == null
            ? undefined
            : String(
                parsed?.pdfFooterTemplate ??
                  parsed?.documentFooterTemplate ??
                  parsed?.documentOutputFooterTemplate
              ),
        hidePdfHeaderIfEmpty: toBoolean(
          parsed?.hidePdfHeaderIfEmpty ?? parsed?.documentHeaderHideIfEmpty
        ),
        hidePdfFooterIfEmpty: toBoolean(
          parsed?.hidePdfFooterIfEmpty ?? parsed?.documentFooterHideIfEmpty
        ),
        hidePdfTitleBlock: toBoolean(parsed?.hidePdfTitleBlock),
        builderOptions: normalizeBuilderOptions(parsed?.builderOptions),
        components: normalizedComponents
      }
    };
  } catch (error) {
    return {
      value: DEFAULT_FORM,
      error:
        error instanceof Error
          ? `Invalid form definition JSON: ${error.message}`
          : "Invalid form definition JSON."
    };
  }
}
function parseFormData(raw?: string): { value: JsonObject; error?: string } {
  if (!clean(raw)) {
    return { value: {} };
  }
  try {
    const parsed = JSON.parse(raw as string);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { value: {}, error: "Form data must be a JSON object." };
    }
    return { value: parsed as JsonObject };
  } catch (error) {
    return {
      value: {},
      error:
        error instanceof Error
          ? `Invalid form data JSON: ${error.message}`
          : "Invalid form data JSON."
    };
  }
}
function cloneFormDefinition(value: FormDefinition): FormDefinition {
  return JSON.parse(JSON.stringify(value)) as FormDefinition;
}
function cloneFormData(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value || {})) as JsonObject;
}
function sanitizeValueForComponent(
  component: FormComponent,
  value: unknown
):
  | string
  | number
  | boolean
  | string[]
  | JsonObject[]
  | JsonObject
  | undefined {
  if (component.type === "contentBlock") {
    return undefined;
  }
  if (value == null) {
    return undefined;
  }
  if (component.type === "datagrid") {
    return sanitizeDataGridRows(value, component);
  }
  if (component.type === "matrix") {
    return sanitizeMatrixValue(component, value);
  }
  if (component.type === "slider") {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) {
      return undefined;
    }
    const bounds = resolveSliderBounds(component);
    return applyNumberBounds(numValue, bounds.minimum, bounds.maximum);
  }
  if (component.type === "yesno") {
    return normalizeYesNoValue(value);
  }
  if (component.type === "select" || component.type === "radio") {
    if (component.multiSelect) {
      return normalizeMultiSelectValues(value, component.options);
    }
    if (Array.isArray(value)) {
      const first = clean(value[0]);
      return first || undefined;
    }
  }
  if (component.type === "checkbox" || component.type === "switch") {
    return toBoolean(value);
  }
  if (component.type === "number") {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) {
      return undefined;
    }
    const style = numberStyleOf(component);
    const whole = isWholeNumberComponent(component);
    if (style === "slider" || style === "scale") {
      const bounds = resolveSliderBounds(component);
      const clamped = applyNumberBounds(
        numValue,
        bounds.minimum,
        bounds.maximum
      );
      return whole ? Math.trunc(clamped) : clamped;
    }
    if (whole) {
      const bounds = normalizeIntegerBounds(
        component.minimum,
        component.maximum
      );
      return applyIntegerBounds(numValue, bounds.minimum, bounds.maximum);
    }
    const bounds = normalizeNumberBounds(component.minimum, component.maximum);
    return applyNumberBounds(numValue, bounds.minimum, bounds.maximum);
  }
  if (component.type === "integer") {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) {
      return undefined;
    }
    const bounds = normalizeIntegerBounds(component.minimum, component.maximum);
    return applyIntegerBounds(numValue, bounds.minimum, bounds.maximum);
  }
  if (component.type === "total") {
    const numValue = Number(value);
    return Number.isFinite(numValue) ? numValue : 0;
  }
  if (Array.isArray(value) || typeof value === "object") {
    return undefined;
  }
  return String(value);
}
function sanitizeFormData(
  rawData: JsonObject,
  definition: FormDefinition
): JsonObject {
  const source =
    rawData && typeof rawData === "object" && !Array.isArray(rawData)
      ? rawData
      : {};
  const nextData: JsonObject = {};
  const groupedComponents = definition.components.reduce((map, component) => {
    if (!component.repeatGroup?.key) {
      const normalized = sanitizeValueForComponent(
        component,
        source[component.key]
      );
      if (normalized !== undefined) {
        nextData[component.key] = normalized;
      }
      return map;
    }
    const groupKey = component.repeatGroup.key;
    if (!map[groupKey]) {
      map[groupKey] = [];
    }
    map[groupKey].push(component);
    return map;
  }, {} as Record<string, FormComponent[]>);
  Object.entries(groupedComponents).forEach(([groupKey, components]) => {
    const rawRows = source[groupKey];
    if (!Array.isArray(rawRows)) {
      return;
    }
    const normalizedRows = rawRows
      .filter((row) => row && typeof row === "object" && !Array.isArray(row))
      .map((row) => {
        const normalizedRow: JsonObject = {};
        components.forEach((component) => {
          const normalized = sanitizeValueForComponent(
            component,
            (row as JsonObject)[component.key]
          );
          if (normalized !== undefined) {
            normalizedRow[component.key] = normalized;
          }
        });
        return normalizedRow;
      });
    if (normalizedRows.length) {
      nextData[groupKey] = normalizedRows;
    }
  });
  definition.components.forEach((component) => {
    if (component.repeatGroup?.key || component.type !== "total") {
      return;
    }
    nextData[component.key] = calculateComponentTotal(
      component,
      definition.components,
      nextData
    );
  });
  const sectionVisibility = parseSectionVisibilityMap(
    source[SECTION_VISIBILITY_DATA_KEY]
  );
  if (Object.keys(sectionVisibility).length) {
    nextData[SECTION_VISIBILITY_DATA_KEY] = sectionVisibility;
  }
  return nextData;
}
// Redesign step 6: AnswersJson contract runtime-assert (warn-only for now;
// hard enforcement deferred). The serialized answers object must be a FLAT
// map keyed by field key whose values are string | number | boolean |
// string[] (multi-select) | array of flat row objects (datagrid rows). A
// top-level value that is a non-array object breaks the server-side
// FormAnswer materialization / carry-forward probes / required-count checks.
// We log once per key and keep the value unchanged (no data loss).
// SECTION_VISIBILITY_DATA_KEY is widget-internal and exempt by design.
const warnedNestedAnswerKeys = new Set<string>();
function assertAnswersShape(data: JsonObject): JsonObject {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }
  Object.keys(data).forEach((key) => {
    if (key === SECTION_VISIBILITY_DATA_KEY) {
      return;
    }
    const value = data[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !warnedNestedAnswerKeys.has(key)
    ) {
      warnedNestedAnswerKeys.add(key);
      console.warn(
        `FormStudioBuilder: answer "${key}" is a nested object — flat values expected by the FormAnswer pipeline`
      );
    }
  });
  return data;
}
function buildFieldSchema(component: FormComponent): JsonObject {
  const title = component.label || component.key;
  if (component.type === "datagrid") {
    const columns =
      normalizeDataGridColumns(component.datagridColumns) ||
      createDefaultDataGridColumns(component.key);
    const properties = columns.reduce((map, column) => {
      map[column.key] = buildDataGridColumnSchema(column);
      return map;
    }, {} as JsonObject);
    const required = columns
      .filter((column) => Boolean(column.required))
      .map((column) => column.key);
    const rowIdKey = clean(component.datagridRowIdKey);
    if (
      rowIdKey &&
      !Object.prototype.hasOwnProperty.call(properties, rowIdKey)
    ) {
      properties[rowIdKey] = { type: "string", title: rowIdKey };
    }
    const schema: JsonObject = {
      type: "array",
      title,
      items: { type: "object", properties, additionalProperties: false }
    };
    if (required.length) {
      (schema.items as JsonObject).required = required;
    }
    if (component.description) {
      schema.description = component.description;
    }
    return schema;
  }
  if (component.type === "matrix") {
    const rows = getMatrixRows(component);
    const choiceSchemaOptions = buildChoiceSchemaOptions(component);
    const properties = rows.reduce((map, row) => {
      const rowSchema: JsonObject = {
        type: "string",
        title: row.label || row.key
      };
      if (choiceSchemaOptions?.length) {
        rowSchema.oneOf = choiceSchemaOptions;
      }
      map[row.key] = rowSchema;
      return map;
    }, {} as JsonObject);
    const schema: JsonObject = {
      type: "object",
      title,
      properties,
      additionalProperties: false
    };
    if (component.required && rows.length) {
      schema.required = rows.map((row) => row.key);
    }
    if (component.description) {
      schema.description = component.description;
    }
    return schema;
  }
  if (component.type === "slider") {
    const bounds = resolveSliderBounds(component);
    const defaultValue = toNumericValue(component.defaultValue);
    return {
      type: "number",
      title,
      default:
        defaultValue != null
          ? applyNumberBounds(defaultValue, bounds.minimum, bounds.maximum)
          : undefined,
      minimum: bounds.minimum,
      maximum: bounds.maximum,
      multipleOf: bounds.multipleOf,
      description: component.description || undefined
    };
  }
  if (component.type === "systemDatagrid2") {
    const schema: JsonObject = {
      type: "string",
      title,
      readOnly: true,
      default: ""
    };
    if (component.description) {
      schema.description = component.description;
    }
    return schema;
  }
  if (component.type === "contentBlock") {
    const schema: JsonObject = { type: "string", title, readOnly: true };
    if (component.description) {
      schema.description = component.description;
    }
    return schema;
  }
  if (component.type === "checkbox" || component.type === "switch") {
    return {
      type: "boolean",
      title,
      default: toBoolean(component.defaultValue)
    };
  }
  if (component.type === "yesno") {
    const schema: JsonObject = {
      type: "string",
      title,
      oneOf: YES_NO_OPTIONS.map((value) => ({
        const: value,
        title:
          clean(component.optionLabels?.[value]) ||
          YES_NO_OPTION_LABELS[value] ||
          value
      }))
    };
    const defaultValue = normalizeYesNoValue(component.defaultValue);
    if (defaultValue) {
      schema.default = defaultValue;
    }
    if (component.description) {
      schema.description = component.description;
    }
    return schema;
  }
  if (component.type === "number") {
    const style = numberStyleOf(component);
    const whole = isWholeNumberComponent(component);
    // Slider/scale need concrete bounds to render; fall back to 0–10 step 1.
    const bounds =
      style === "slider" || style === "scale"
        ? resolveSliderBounds(component)
        : whole
        ? normalizeIntegerBounds(component.minimum, component.maximum)
        : normalizeNumberBounds(component.minimum, component.maximum);
    const multipleOf =
      style === "slider" || style === "scale"
        ? (bounds as { multipleOf?: number }).multipleOf
        : parseOptionalPositiveNumber(component.multipleOf);
    return {
      type: whole ? "integer" : "number",
      title,
      default:
        typeof component.defaultValue === "number"
          ? whole
            ? applyIntegerBounds(
                component.defaultValue,
                bounds.minimum,
                bounds.maximum
              )
            : applyNumberBounds(
                component.defaultValue,
                bounds.minimum,
                bounds.maximum
              )
          : undefined,
      minimum: bounds.minimum,
      maximum: bounds.maximum,
      multipleOf,
      description: component.description || undefined
    };
  }
  if (component.type === "integer") {
    const bounds = normalizeIntegerBounds(component.minimum, component.maximum);
    const multipleOf = parseOptionalPositiveNumber(component.multipleOf);
    return {
      type: "integer",
      title,
      default:
        typeof component.defaultValue === "number"
          ? applyIntegerBounds(
              component.defaultValue,
              bounds.minimum,
              bounds.maximum
            )
          : undefined,
      minimum: bounds.minimum,
      maximum: bounds.maximum,
      multipleOf
    };
  }
  if (component.type === "total") {
    return {
      type: "number",
      title,
      default: 0,
      readOnly: true,
      description: component.description || undefined
    };
  }
  if (
    (component.type === "select" || component.type === "radio") &&
    component.multiSelect
  ) {
    const enumOptions = component.options?.length
      ? component.options
      : undefined;
    const choiceSchemaOptions = buildChoiceSchemaOptions(component);
    const defaultValues = normalizeMultiSelectValues(
      component.defaultValue,
      enumOptions
    );
    const base: JsonObject = {
      type: "array",
      title,
      items: choiceSchemaOptions?.length
        ? { type: "string", oneOf: choiceSchemaOptions }
        : enumOptions
        ? { type: "string", enum: enumOptions }
        : { type: "string" },
      uniqueItems: true
    };
    if (defaultValues?.length) {
      base.default = defaultValues;
    }
    if (component.description) {
      base.description = component.description;
    }
    return base;
  }
  const base: JsonObject = { type: "string", title };
  if (
    component.type === "date" &&
    (!component.dateGranularity || component.dateGranularity === "full")
  ) {
    // Partial granularities (YYYY-MM, YYYY, ...) stay plain strings so ajv's
    // "date" format validation doesn't reject them.
    base.format = "date";
  }
  if (component.type === "time") {
    base.format = "time";
  }
  if (component.type === "email") {
    base.format = "email";
  }
  if (component.type === "select" || component.type === "radio") {
    const choiceSchemaOptions = buildChoiceSchemaOptions(component);
    if (choiceSchemaOptions?.length) {
      base.oneOf = choiceSchemaOptions;
    }
  }
  if (typeof component.defaultValue === "string" && component.defaultValue) {
    base.default = component.defaultValue;
  }
  const lengthBounds = normalizeLengthBounds(
    component.minLength,
    component.maxLength
  );
  if (lengthBounds.minLength != null) {
    base.minLength = lengthBounds.minLength;
  }
  if (lengthBounds.maxLength != null) {
    base.maxLength = lengthBounds.maxLength;
  }
  if (clean(component.pattern)) {
    base.pattern = clean(component.pattern);
  }
  if (component.description) {
    base.description = component.description;
  }
  return base;
}
function parseBooleanText(value: unknown): boolean | undefined {
  const normalized = clean(value).toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }
  return undefined;
}
function coerceVisibilityRuleValue(
  value: unknown,
  component: FormComponent | undefined
): string | number | boolean {
  const raw = value ?? "";
  if (!component) {
    return str(raw);
  }
  if (
    component.type === "number" ||
    component.type === "integer" ||
    component.type === "total"
  ) {
    const numeric = toNumericValue(raw);
    if (numeric != null) {
      return isWholeNumberComponent(component) ? Math.floor(numeric) : numeric;
    }
    return str(raw);
  }
  if (component.type === "checkbox" || component.type === "switch") {
    return parseBooleanText(raw) ?? str(raw);
  }
  if (component.type === "yesno") {
    return normalizeYesNoValue(raw) ?? str(raw);
  }
  return str(raw);
}
function buildRuleCondition(
  rule: VisibilityRule,
  componentsByKey?: Map<string, FormComponent>
): JsonObject | null {
  if (!rule.whenKey) {
    return null;
  }
  const key = rule.whenKey;
  const operator = rule.operator || "equals";
  const targetComponent = componentsByKey?.get(key);
  const conditionValue = coerceVisibilityRuleValue(rule.value, targetComponent);
  if (operator === "equals") {
    return {
      properties: { [key]: { const: conditionValue } },
      required: [key]
    };
  }
  if (operator === "notEquals") {
    return {
      properties: { [key]: { not: { const: conditionValue } } },
      required: [key]
    };
  }
  if (NUMERIC_VISIBILITY_OPERATORS.has(operator)) {
    const numericValue = toNumericValue(rule.value);
    if (numericValue == null) {
      return { not: {} };
    }
    const bound =
      operator === "greaterThan"
        ? { exclusiveMinimum: numericValue }
        : operator === "lessThan"
        ? { exclusiveMaximum: numericValue }
        : operator === "greaterOrEqual"
        ? { minimum: numericValue }
        : { maximum: numericValue };
    return {
      properties: { [key]: { type: "number", ...bound } },
      required: [key]
    };
  }
  if (operator === "contains" || operator === "startsWith") {
    const text = str(conditionValue);
    if (!text) {
      return { not: {} };
    }
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      properties: {
        [key]: {
          type: "string",
          pattern: operator === "startsWith" ? `^${escaped}` : escaped
        }
      },
      required: [key]
    };
  }
  if (operator === "truthy") {
    return { properties: { [key]: { const: true } }, required: [key] };
  }
  return { properties: { [key]: { const: false } }, required: [key] };
}
function buildCondition(
  config: VisibilityConfig | undefined,
  componentsByKey?: Map<string, FormComponent>
): JsonObject | null {
  if (!config?.rules?.length) {
    return null;
  }
  const conditions = config.rules
    .map((rule) => buildRuleCondition(rule, componentsByKey))
    .filter((condition): condition is JsonObject => Boolean(condition));
  if (!conditions.length) {
    return null;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }
  return config.mode === "any" ? { anyOf: conditions } : { allOf: conditions };
}
function appendComponentToSchemaContainer(
  component: FormComponent,
  properties: JsonObject,
  required: string[],
  allOf: JsonObject[],
  componentsByKey: Map<string, FormComponent>,
  ignoreVisibility = false
): void {
  const fieldSchema = buildFieldSchema(component);
  const condition = ignoreVisibility
    ? null
    : buildCondition(component.visibility, componentsByKey);
  const isRequirable =
    component.type !== "systemDatagrid2" && component.type !== "contentBlock";
  if (!condition) {
    properties[component.key] = fieldSchema;
    if (component.required && isRequirable) {
      required.push(component.key);
    }
    return;
  }
  const thenBranch: JsonObject = {
    properties: { [component.key]: fieldSchema }
  };
  if (component.required && isRequirable) {
    thenBranch.required = [component.key];
  }
  allOf.push({ if: condition, then: thenBranch });
}
function buildSchema(
  definition: FormDefinition,
  ignoreVisibility = false
): JsonObject {
  const properties: JsonObject = {};
  const required: string[] = [];
  const allOf: JsonObject[] = [];
  const componentsByKey = new Map(
    definition.components.map((component) => [component.key, component])
  );
  const groupedComponents: Record<
    string,
    { config: RepeatGroupConfig; components: FormComponent[] }
  > = {};
  definition.components.forEach((component) => {
    if (!component.repeatGroup?.key) {
      appendComponentToSchemaContainer(
        component,
        properties,
        required,
        allOf,
        componentsByKey,
        ignoreVisibility
      );
      return;
    }
    const groupKey = component.repeatGroup.key;
    if (!groupedComponents[groupKey]) {
      groupedComponents[groupKey] = {
        config: component.repeatGroup,
        components: []
      };
    }
    groupedComponents[groupKey].components.push(component);
  });
  Object.entries(groupedComponents).forEach(([groupKey, group]) => {
    const itemProperties: JsonObject = {};
    const itemRequired: string[] = [];
    const itemAllOf: JsonObject[] = [];
    group.components.forEach((component) =>
      appendComponentToSchemaContainer(
        component,
        itemProperties,
        itemRequired,
        itemAllOf,
        componentsByKey,
        ignoreVisibility
      )
    );
    const itemSchema: JsonObject = {
      type: "object",
      properties: itemProperties
    };
    if (itemRequired.length) {
      itemSchema.required = itemRequired;
    }
    if (itemAllOf.length) {
      itemSchema.allOf = itemAllOf;
    }
    const minItems = Number.isFinite(Number(group.config.minItems))
      ? Math.max(0, Math.floor(Number(group.config.minItems)))
      : undefined;
    const maxItems = Number.isFinite(Number(group.config.maxItems))
      ? Math.max(0, Math.floor(Number(group.config.maxItems)))
      : undefined;
    const boundedMax =
      maxItems != null && minItems != null && maxItems < minItems
        ? minItems
        : maxItems;
    const defaultItems = Number.isFinite(Number(group.config.defaultItems))
      ? Math.max(0, Math.floor(Number(group.config.defaultItems)))
      : undefined;
    const arraySchema: JsonObject = {
      type: "array",
      title: group.config.title || groupKey,
      items: itemSchema
    };
    if (minItems != null) {
      arraySchema.minItems = minItems;
    }
    if (boundedMax != null) {
      arraySchema.maxItems = boundedMax;
    }
    let starterCount = defaultItems != null ? defaultItems : minItems;
    if (starterCount != null) {
      if (minItems != null) {
        starterCount = Math.max(starterCount, minItems);
      }
      if (boundedMax != null) {
        starterCount = Math.min(starterCount, boundedMax);
      }
    }
    if (starterCount != null && starterCount > 0) {
      arraySchema.default = Array.from({ length: starterCount }, () => ({}));
    }
    properties[groupKey] = arraySchema;
  });
  const schema: JsonObject = {
    type: "object",
    title: definition.title || undefined,
    description: definition.description || undefined,
    properties
  };
  if (required.length) {
    schema.required = required;
  }
  if (allOf.length) {
    schema.allOf = allOf;
  }
  return schema;
}
function buildRepeatGroupLayoutGrid(components: FormComponent[]): JsonObject {
  const children = components.map((component) => {
    const span = clamp(
      component.columnSpan || defaultColumnSpan(component.type),
      1,
      12
    );
    return {
      "ui:col": {
        className: `col-xs-12 col-sm-${span}`,
        children: [component.key]
      }
    };
  });
  return {
    "ui:row": { className: "row rjsf-builder__datagrid-row", children }
  };
}
function buildUiSchema(definition: FormDefinition): JsonObject {
  const uiSchema: JsonObject = {};
  const groupedComponents: Record<
    string,
    { config: RepeatGroupConfig; components: FormComponent[] }
  > = {};
  definition.components.forEach((component) => {
    if (component.repeatGroup?.key) {
      const groupKey = component.repeatGroup.key;
      if (!groupedComponents[groupKey]) {
        groupedComponents[groupKey] = {
          config: component.repeatGroup,
          components: []
        };
      }
      groupedComponents[groupKey].components.push(component);
      return;
    }
    const fieldUi: JsonObject = {
      "ui:options": {
        section: component.section || "",
        sectionId: component.sectionId || "",
        sectionOrder: component.sectionOrder ?? 999,
        sectionColumns: component.sectionColumns ?? undefined,
        sectionColumn: component.sectionColumn ?? undefined,
        sectionCollapsible: Boolean(component.sectionCollapsible),
        sectionCollapsedByDefault: Boolean(component.sectionCollapsedByDefault),
        columnSpan: clamp(
          component.columnSpan || defaultColumnSpan(component.type),
          1,
          12
        )
      }
    };
    if (component.type === "systemDatagrid2") {
      const templateDefinition =
        getSystemTemplateDefinition(component.systemTemplateType) ||
        getSystemTemplateDefinitionBySlotProperty(
          component.systemTemplateSlotProperty
        ) ||
        inferSystemTemplateDefinitionFromKey(component.key);
      const columns = templateDefinition
        ? createDataGridColumnsFromTemplate(templateDefinition)
        : normalizeDataGridColumns(component.datagridColumns) ||
          createDefaultDataGridColumns(component.key);
      fieldUi["ui:widget"] = "systemDatagrid2Placeholder";
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        systemTemplateType:
          component.systemTemplateType || templateDefinition?.type || "",
        systemTemplateLabel: templateDefinition?.label || component.label,
        systemTemplateSlotProperty:
          component.systemTemplateSlotProperty ||
          templateDefinition?.systemTemplateSlotProperty ||
          "",
        columns,
        rowIdKey: component.datagridRowIdKey || ""
      };
      fieldUi["ui:readonly"] = true;
      if (component.hideLabel) {
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          label: false
        };
      }
      uiSchema[component.key] = fieldUi;
      return;
    }
    if (component.type === "datagrid") {
      const columns =
        normalizeDataGridColumns(component.datagridColumns) ||
        createDefaultDataGridColumns(component.key);
      const itemsUi = columns.reduce((map, column) => {
        const columnUi: JsonObject = {
          "ui:options": {
            columnSpan: clamp(
              column.columnSpan || defaultColumnSpan(column.type),
              1,
              12
            )
          }
        };
        if (column.type === "textarea") {
          columnUi["ui:widget"] = "textarea";
        }
        if (column.type === "date") {
          columnUi["ui:widget"] = "date";
        }
        if (column.type === "time") {
          columnUi["ui:widget"] = "time";
        }
        if (column.type === "radio") {
          columnUi["ui:widget"] = "radio";
        }
        map[column.key] = columnUi;
        return map;
      }, {} as JsonObject);
      const rowIdKey = clean(component.datagridRowIdKey);
      if (rowIdKey) {
        itemsUi[rowIdKey] = { "ui:widget": "hidden" };
      }
      itemsUi["ui:field"] = "LayoutGridField";
      itemsUi["ui:layoutGrid"] = buildDataGridColumnsLayoutGrid(columns);
      if (component.datagridDisplay === "table") {
        // ArrayFieldItemTemplate reads the ITEM uiSchema, not the array's —
        // mirror the display mode there so rows render the compact branch.
        itemsUi["ui:options"] = {
          ...((itemsUi["ui:options"] as JsonObject) || {}),
          arrayDisplay: "table"
        };
      }
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        addable: true,
        removable: true,
        orderable: true,
        arrayStyle: "datagrid",
        arrayItemLabel: "Row",
        arrayAddLabel: "Add row",
        arrayDisplay:
          component.datagridDisplay === "table" ? "table" : undefined,
        datagridHeaderColumns:
          component.datagridDisplay === "table"
            ? columns.map((column) => ({
                key: column.key,
                label: column.label || column.key,
                required: column.required === true,
                span: clamp(
                  column.columnSpan || defaultColumnSpan(column.type),
                  1,
                  12
                )
              }))
            : undefined
      };
      fieldUi.items = itemsUi;
      const fieldClassNames = buildFieldClassNames(component);
      if (fieldClassNames) {
        fieldUi["ui:classNames"] = fieldClassNames;
      }
      if (component.hideLabel) {
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          label: false
        };
      }
      uiSchema[component.key] = fieldUi;
      return;
    }
    if (component.placeholder) {
      fieldUi["ui:placeholder"] = component.placeholder;
    }
    if (component.type === "textarea") {
      fieldUi["ui:widget"] = "textarea";
    }
    if (component.type === "select" && component.multiSelect) {
      fieldUi["ui:widget"] = "select";
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        multiple: true
      };
    }
    if (component.type === "radio") {
      fieldUi["ui:widget"] = component.multiSelect ? "checkboxes" : "radio";
    }
    if (component.type === "yesno") {
      fieldUi["ui:widget"] = "radio";
    }
    if (component.type === "slider") {
      fieldUi["ui:widget"] = "range";
    }
    if (component.type === "number") {
      const numStyle = numberStyleOf(component);
      if (numStyle === "slider") {
        fieldUi["ui:widget"] = "range";
      } else if (numStyle === "stepper") {
        fieldUi["ui:widget"] = "numberStepper";
      } else if (numStyle === "scale") {
        fieldUi["ui:widget"] = "numberScale";
      }
    }
    if (component.type === "matrix") {
      fieldUi["ui:field"] = "matrixGrid";
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        matrixRows: getMatrixRows(component),
        matrixOptions: component.options || [],
        matrixOptionLabels: component.optionLabels || {}
      };
    }
    if (component.type === "date") {
      fieldUi["ui:widget"] = "date";
      if (component.dateGranularity && component.dateGranularity !== "full") {
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          dateGranularity: component.dateGranularity
        };
      }
    }
    if (component.type === "time") {
      fieldUi["ui:widget"] = "time";
    }
    if (component.type === "datetime") {
      fieldUi["ui:widget"] = "datetime";
    }
    if (component.type === "signature") {
      fieldUi["ui:widget"] = "signatureCanvas";
    }
    if (component.type === "contentBlock") {
      fieldUi["ui:widget"] = "contentBlock";
      fieldUi["ui:readonly"] = true;
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        contentText: str(component.contentText)
      };
    }
    const fieldClassNames = buildFieldClassNames(component);
    if (fieldClassNames) {
      fieldUi["ui:classNames"] = fieldClassNames;
    }
    if (component.hideLabel) {
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        label: false
      };
    }
    if (component.type === "total") {
      fieldUi["ui:readonly"] = true;
      fieldUi["ui:disabled"] = true;
      if (component.scoreBands?.length || component.showMaxScore) {
        fieldUi["ui:widget"] = "scoreTotal";
      }
      fieldUi["ui:options"] = {
        ...(fieldUi["ui:options"] || {}),
        calculation: "sum",
        sourceKeys: component.sumSources || undefined,
        scoreBands: component.scoreBands || undefined,
        showMaxScore: component.showMaxScore || undefined,
        maxScore: component.showMaxScore
          ? calculateComponentMaxScore(component, definition.components)
          : undefined
      };
    }
    uiSchema[component.key] = fieldUi;
  });
  Object.entries(groupedComponents).forEach(([groupKey, group]) => {
    const itemsUi: JsonObject = {};
    group.components.forEach((component) => {
      const fieldUi: JsonObject = {
        "ui:options": {
          section: component.section || "",
          sectionOrder: component.sectionOrder ?? 999,
          sectionColumns: component.sectionColumns ?? undefined,
          sectionColumn: component.sectionColumn ?? undefined,
          sectionCollapsible: Boolean(component.sectionCollapsible),
          sectionCollapsedByDefault: Boolean(
            component.sectionCollapsedByDefault
          ),
          columnSpan: clamp(
            component.columnSpan || defaultColumnSpan(component.type),
            1,
            12
          )
        }
      };
      if (component.placeholder) {
        fieldUi["ui:placeholder"] = component.placeholder;
      }
      if (component.type === "textarea") {
        fieldUi["ui:widget"] = "textarea";
      }
      if (component.type === "select" && component.multiSelect) {
        fieldUi["ui:widget"] = "select";
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          multiple: true
        };
      }
      if (component.type === "radio") {
        fieldUi["ui:widget"] = component.multiSelect ? "checkboxes" : "radio";
      }
      if (component.type === "yesno") {
        fieldUi["ui:widget"] = "radio";
      }
      if (component.type === "slider") {
        fieldUi["ui:widget"] = "range";
      }
      if (component.type === "number") {
        const numStyle = numberStyleOf(component);
        if (numStyle === "slider") {
          fieldUi["ui:widget"] = "range";
        } else if (numStyle === "stepper") {
          fieldUi["ui:widget"] = "numberStepper";
        } else if (numStyle === "scale") {
          fieldUi["ui:widget"] = "numberScale";
        }
      }
      if (component.type === "date") {
        fieldUi["ui:widget"] = "date";
        if (
          component.dateGranularity &&
          component.dateGranularity !== "full"
        ) {
          fieldUi["ui:options"] = {
            ...(fieldUi["ui:options"] || {}),
            dateGranularity: component.dateGranularity
          };
        }
      }
      if (component.type === "time") {
        fieldUi["ui:widget"] = "time";
      }
      if (component.type === "datetime") {
        fieldUi["ui:widget"] = "datetime";
      }
      if (component.type === "signature") {
        fieldUi["ui:widget"] = "signatureCanvas";
      }
      const fieldClassNames = buildFieldClassNames(component);
      if (fieldClassNames) {
        fieldUi["ui:classNames"] = fieldClassNames;
      }
      if (component.hideLabel) {
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          label: false
        };
      }
      if (component.type === "total") {
        fieldUi["ui:readonly"] = true;
        fieldUi["ui:disabled"] = true;
        fieldUi["ui:options"] = {
          ...(fieldUi["ui:options"] || {}),
          calculation: "sum",
          sourceKeys: component.sumSources || undefined
        };
      }
      itemsUi[component.key] = fieldUi;
    });
    const itemsContainer: JsonObject = { ...itemsUi };
    if (group.config.asDataGrid && group.components.length > 1) {
      itemsContainer["ui:field"] = "LayoutGridField";
      itemsContainer["ui:layoutGrid"] = buildRepeatGroupLayoutGrid(
        group.components
      );
    }
    uiSchema[groupKey] = {
      "ui:options": {
        addable: true,
        removable: true,
        orderable: true,
        arrayStyle: "repeat-group",
        arrayItemLabel: "Entry",
        arrayAddLabel: "Add row"
      },
      items: itemsContainer
    };
  });
  return uiSchema;
}
function reorderComponentsWithinRepeatGroup(
  components: FormComponent[],
  groupKey: string,
  sourceId: string,
  targetId: string,
  placement: DropPlacement = "before"
): FormComponent[] {
  const normalizedGroupKey = clean(groupKey);
  if (
    !normalizedGroupKey ||
    !clean(sourceId) ||
    !clean(targetId) ||
    sourceId === targetId
  ) {
    return components;
  }
  const groupEntries = components
    .map((component, index) => ({ component, index }))
    .filter(
      (entry) => clean(entry.component.repeatGroup?.key) === normalizedGroupKey
    );
  if (groupEntries.length < 2) {
    return components;
  }
  const sourceIndex = groupEntries.findIndex(
    (entry) => entry.component.id === sourceId
  );
  const targetIndex = groupEntries.findIndex(
    (entry) => entry.component.id === targetId
  );
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return components;
  }
  const reorderedGroupComponents = groupEntries.map((entry) => entry.component);
  const [moved] = reorderedGroupComponents.splice(sourceIndex, 1);
  const targetIndexAfterRemoval = reorderedGroupComponents.findIndex(
    (component) => component.id === targetId
  );
  if (targetIndexAfterRemoval < 0) {
    return components;
  }
  const insertIndex = targetIndexAfterRemoval + (placement === "after" ? 1 : 0);
  reorderedGroupComponents.splice(insertIndex, 0, moved);
  if (
    reorderedGroupComponents.every(
      (component, index) => component.id === groupEntries[index].component.id
    )
  ) {
    return components;
  }
  const nextComponents = [...components];
  groupEntries.forEach((entry, index) => {
    nextComponents[entry.index] = reorderedGroupComponents[index];
  });
  return nextComponents;
}
function resolveFieldKeyFromErrorProperty(
  property: unknown,
  candidateKeys: Set<string>
): string | undefined {
  if (!candidateKeys.size) {
    return undefined;
  }
  const normalized = str(property)
    .replace(/^\.?root\.?/i, "")
    .replace(/\[(\d+)\]/g, ".$1");
  if (!normalized) {
    return undefined;
  }
  const segments = normalized
    .split(".")
    .map((segment) => clean(segment))
    .filter(Boolean);
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const candidate = segments[index];
    if (candidateKeys.has(candidate)) {
      return candidate;
    }
  }
  return undefined;
}
function listPropertyKeyVariants(raw: unknown): string[] {
  const source = str(raw);
  if (!source) {
    return [];
  }
  const variants: string[] = [];
  const push = (value: unknown): void => {
    const normalized = clean(value);
    if (!normalized || variants.includes(normalized)) {
      return;
    }
    variants.push(normalized);
  };
  push(source);
  const withoutRootPrefix = source
    .replace(/^\$?root[._]/i, "")
    .replace(/^\$?root$/i, "");
  push(withoutRootPrefix);
  const normalizedPath = withoutRootPrefix
    .replace(/\[(\d+)\]/g, ".$1")
    .replace(/^\./, "");
  push(normalizedPath);
  const pathSegments = normalizedPath
    .split(".")
    .map((segment) => clean(segment))
    .filter(Boolean);
  if (pathSegments.length) {
    push(pathSegments[pathSegments.length - 1]);
  }
  return variants;
}
function resolvePreviewPropertyKey(
  property: any,
  componentMetaByKey: Record<string, unknown>
): string {
  const knownKeys = new Set(Object.keys(componentMetaByKey || {}));
  const rawCandidates = [
    property?.name,
    property?.fieldPathId?.$id,
    property?.idSchema?.$id,
    property?.content?.props?.name,
    property?.content?.props?.fieldPathId?.$id,
    property?.content?.props?.idSchema?.$id,
    Array.isArray(property?.fieldPathId?.path)
      ? property.fieldPathId.path[property.fieldPathId.path.length - 1]
      : undefined,
    Array.isArray(property?.content?.props?.fieldPathId?.path)
      ? property.content.props.fieldPathId.path[
          property.content.props.fieldPathId.path.length - 1
        ]
      : undefined
  ];
  const fallbackCandidates: string[] = [];
  rawCandidates.forEach((candidate) => {
    listPropertyKeyVariants(candidate).forEach((variant) => {
      if (!fallbackCandidates.includes(variant)) {
        fallbackCandidates.push(variant);
      }
    });
  });
  if (knownKeys.size) {
    const matched = fallbackCandidates.find((candidate) =>
      knownKeys.has(candidate)
    );
    if (matched) {
      return matched;
    }
  }
  return fallbackCandidates[0] || "";
}
function writeAttribute(
  attr: EditableValue<string> | undefined,
  value: string
): void {
  if (!attr || attr.readOnly || attr.status !== "available") {
    return;
  }
  if (attr.value === value) {
    return;
  }
  attr.setValue(value);
}
function writeIntegerAttribute(
  attr: EditableValue<Big> | undefined,
  value: number
): void {
  if (!attr || attr.readOnly || attr.status !== "available") {
    return;
  }
  const bigValue = new Big(value);
  if (attr.value && attr.value.eq(bigValue)) {
    return;
  }
  attr.setValue(bigValue);
}
function runAction(action?: ActionValue): void {
  if (!action || !action.canExecute || action.isExecuting) {
    return;
  }
  action.execute();
}
const SIGNATURE_DRAW_PREFIX = "__sig_draw__";
const SIGNATURE_TYPED_PREFIX = "__sig_typed__";
function parseSignatureValue(raw: unknown): {
  mode: "draw" | "type";
  drawDataUrl?: string;
  typedName?: string;
} {
  const value = str(raw);
  if (!value) {
    return { mode: "draw" };
  }
  if (value.startsWith(SIGNATURE_TYPED_PREFIX)) {
    return {
      mode: "type",
      typedName: value.slice(SIGNATURE_TYPED_PREFIX.length)
    };
  }
  if (value.startsWith(SIGNATURE_DRAW_PREFIX)) {
    return {
      mode: "draw",
      drawDataUrl: value.slice(SIGNATURE_DRAW_PREFIX.length)
    };
  }
  if (value.startsWith("data:image/")) {
    return { mode: "draw", drawDataUrl: value };
  }
  return { mode: "type", typedName: value };
}
function toSignatureDrawValue(dataUrl: string): string {
  return dataUrl ? `${SIGNATURE_DRAW_PREFIX}${dataUrl}` : "";
}
function toSignatureTypedValue(name: string): string {
  return name ? `${SIGNATURE_TYPED_PREFIX}${name}` : "";
}
function SystemDatagrid2PlaceholderWidget(props: any): ReactElement {
  const options = (props?.options || {}) as {
    systemTemplateType?: string;
    systemTemplateLabel?: string;
    systemTemplateSlotProperty?: string;
    columns?: DataGridColumn[];
    rowIdKey?: string;
  };
  const fieldKey = clean(props?.name);
  const template =
    getSystemTemplateDefinition(
      clean(options.systemTemplateType) as SystemTemplateType
    ) ||
    getSystemTemplateDefinitionBySlotProperty(
      clean(options.systemTemplateSlotProperty)
    ) ||
    inferSystemTemplateDefinitionFromKey(fieldKey);
  const slotProperty =
    clean(options.systemTemplateSlotProperty) ||
    template?.systemTemplateSlotProperty ||
    "";
  const formContext =
    (props?.formContext as
      | {
          systemTemplateSlotRenderers?: Record<string, unknown>;
          systemSectionHtmlBySlot?: Record<string, string>;
        }
      | undefined
      | null) ||
    (props?.registry?.formContext as
      | {
          systemTemplateSlotRenderers?: Record<string, unknown>;
          systemSectionHtmlBySlot?: Record<string, string>;
        }
      | undefined
      | null) ||
    undefined;
  const slotRendererMap = formContext?.systemTemplateSlotRenderers || {};
  const slotHtmlMap = formContext?.systemSectionHtmlBySlot || {};
  const slotRenderer = slotProperty
    ? toWidgetRenderer(slotRendererMap[slotProperty])
    : undefined;
  const slotHtml = slotProperty
    ? slotHtmlMap[slotProperty] || slotHtmlMap[slotProperty.toLowerCase()] || ""
    : "";
  const columns = template
    ? createDataGridColumnsFromTemplate(template)
    : normalizeDataGridColumns(options.columns) || [];
  const widgetContent = slotRenderer ? slotRenderer() : null;
  const footnote = slotProperty
    ? slotRenderer
      ? "Configured widget renders from this system template slot."
      : `No widget configured for slot "${slotProperty}" in widget properties.`
    : "No system template slot is mapped. Select one in Properties.";

  if (widgetContent) {
    return (
      <div id={props?.id} className="rjsf-builder__system-template-placeholder">
        <div className="rjsf-builder__system-template-placeholder__widget">
          {widgetContent}
        </div>
      </div>
    );
  }

  if (slotHtml) {
    return (
      <div id={props?.id} className="rjsf-builder__system-template-placeholder">
        <div
          className="rjsf-builder__system-template-placeholder__widget"
          dangerouslySetInnerHTML={{ __html: slotHtml }}
        />
      </div>
    );
  }

  return (
    <div id={props?.id} className="rjsf-builder__system-template-placeholder">
      <div className="rjsf-builder__system-template-placeholder__grid">
        {columns.length ? (
          <div className="rjsf-builder__system-template-placeholder__row rjsf-builder__system-template-placeholder__row--header">
            {columns.map((column) => (
              <span key={column.key}>{column.label || column.key}</span>
            ))}
          </div>
        ) : null}
        <div className="rjsf-builder__system-template-placeholder__row rjsf-builder__system-template-placeholder__row--sample">
          {columns.length ? (
            columns.map((column) => (
              <span key={`${column.key}-sample`}>{"<value>"}</span>
            ))
          ) : (
            <span>No columns configured.</span>
          )}
        </div>
      </div>
      <div className="rjsf-builder__system-template-placeholder__footnote">
        {footnote}
      </div>
    </div>
  );
}
function MatrixGridField(props: any): ReactElement {
  const uiOptions = ((props?.uiSchema || {})["ui:options"] || {}) as {
    matrixRows?: unknown;
    matrixOptions?: unknown;
    matrixOptionLabels?: unknown;
    label?: unknown;
  };
  const rows = normalizeMatrixRows(uiOptions.matrixRows) || [];
  const optionValues = Array.isArray(uiOptions.matrixOptions)
    ? (uiOptions.matrixOptions as unknown[])
        .map((item) => clean(item))
        .filter(Boolean)
    : [];
  const optionLabels =
    uiOptions.matrixOptionLabels &&
    typeof uiOptions.matrixOptionLabels === "object" &&
    !Array.isArray(uiOptions.matrixOptionLabels)
      ? (uiOptions.matrixOptionLabels as Record<string, string>)
      : {};
  const answers =
    props?.formData &&
    typeof props.formData === "object" &&
    !Array.isArray(props.formData)
      ? (props.formData as JsonObject)
      : {};
  const disabled = Boolean(props?.disabled || props?.readonly);
  const fieldId = clean(props?.idSchema?.$id) || clean(props?.name) || "matrix";
  const title = clean(props?.schema?.title) || clean(props?.name);
  const description = clean(props?.schema?.description);
  const hideLabel = uiOptions.label === false;
  const onSelect = (rowKey: string, optionValue: string): void => {
    if (disabled || typeof props?.onChange !== "function") {
      return;
    }
    const nextValue = { ...answers, [rowKey]: optionValue };
    // RJSF v6 field onChange contract is (formData, path, errorSchema, id);
    // omitting the path applies the change at the form root.
    if (props?.fieldPathId?.path != null) {
      props.onChange(
        nextValue,
        props.fieldPathId.path,
        undefined,
        props.fieldPathId.$id
      );
    } else {
      props.onChange(nextValue);
    }
  };
  const showTitle = Boolean(!hideLabel && title);
  return (
    <div
      className="rjsf-builder__matrix"
      role="group"
      aria-labelledby={showTitle ? `${fieldId}__title` : undefined}
    >
      {showTitle ? (
        <span
          id={`${fieldId}__title`}
          className="control-label rjsf-builder__matrix-title"
        >
          {title}
          {props?.required ? <span className="required">{" *"}</span> : null}
        </span>
      ) : null}
      {description ? (
        <div className="rjsf-builder__matrix-description">{description}</div>
      ) : null}
      {rows.length && optionValues.length ? (
        <div className="rjsf-builder__matrix-scroll">
          <table className="rjsf-builder__matrix-table">
            <thead>
              <tr>
                <th className="rjsf-builder__matrix-question-header" />
                {optionValues.map((optionValue) => (
                  <th key={optionValue} scope="col">
                    {clean(optionLabels[optionValue]) || optionValue}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="rjsf-builder__matrix-question">
                    {row.label || row.key}
                  </th>
                  {optionValues.map((optionValue) => (
                    <td key={optionValue}>
                      <input
                        type="radio"
                        name={`${fieldId}_${row.key}`}
                        value={optionValue}
                        checked={clean(answers[row.key]) === optionValue}
                        disabled={disabled}
                        aria-label={`${row.label || row.key}: ${
                          clean(optionLabels[optionValue]) || optionValue
                        }`}
                        onChange={() => onSelect(row.key, optionValue)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rjsf-builder__matrix-empty">
          Add rows and options in the Properties panel to configure this matrix.
        </div>
      )}
    </div>
  );
}
const FORM_FIELDS = { matrixGrid: MatrixGridField };
function ScoreTotalWidget(props: any): ReactElement {
  const bands = normalizeScoreBands(props.options?.scoreBands);
  const numeric = toNumericValue(props.value) ?? 0;
  const bandLabel = resolveScoreBandLabel(bands, numeric);
  const maxScore = toNumericValue(props.options?.maxScore);
  const showMax = Boolean(props.options?.showMaxScore) && maxScore != null;
  return (
    <div className="rjsf-builder__score-total">
      <input
        id={props.id}
        className="form-control"
        type="text"
        readOnly
        disabled
        value={
          showMax
            ? `${props.value ?? 0} / ${maxScore}`
            : String(props.value ?? 0)
        }
      />
      {bandLabel ? (
        <span
          className="rjsf-builder__score-band"
          title={`Score ${numeric}: ${bandLabel}`}
        >
          {bandLabel}
        </span>
      ) : null}
    </div>
  );
}
function ContentBlockWidget(props: any): ReactElement {
  const options = (props?.options || {}) as { contentText?: unknown };
  const formContext =
    (props?.formContext as
      | {
          contentBlockTokens?: Record<string, string>;
          previewReorderEnabled?: boolean;
        }
      | undefined
      | null) ||
    (props?.registry?.formContext as
      | {
          contentBlockTokens?: Record<string, string>;
          previewReorderEnabled?: boolean;
        }
      | undefined
      | null) ||
    undefined;
  const contentText = str(options.contentText);
  if (!clean(contentText)) {
    if (formContext?.previewReorderEnabled) {
      return (
        <div
          id={props?.id}
          className="rjsf-builder__content-block rjsf-builder__content-block--empty"
        >
          Content block: add text in the Properties panel.
        </div>
      );
    }
    return <div id={props?.id} className="rjsf-builder__content-block" />;
  }
  const tokens = formContext?.contentBlockTokens || {};
  const html = asHtmlSnippet(replaceOutputTokens(contentText, tokens));
  return (
    <div
      id={props?.id}
      className="rjsf-builder__content-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
// Clamps the year segment of a YYYY-MM-DD date string to 4 digits. Browser
// date inputs accept 5-6 digit years (up to 275760); clamping in onChange and
// writing the value back keeps the controlled input at a 4-digit year.
function clampDateInputValue(value: unknown): string | undefined {
  const text = clean(value);
  if (!text) {
    return undefined;
  }
  const match = text.match(/^(\d{4})\d+(-\d{2}-\d{2}.*)$/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }
  return text;
}
/** Number fields, "stepper" style: −/+ counter around a numeric input. */
function NumberStepperWidget(props: any): ReactElement {
  const { onChange, schema } = props;
  const disabled = Boolean(props?.disabled || props?.readonly);
  const min = typeof schema?.minimum === "number" ? schema.minimum : undefined;
  const max = typeof schema?.maximum === "number" ? schema.maximum : undefined;
  const step =
    typeof schema?.multipleOf === "number" && schema.multipleOf > 0
      ? schema.multipleOf
      : 1;
  const numeric = typeof props?.value === "number" ? props.value : undefined;
  const clampValue = (next: number): number => {
    let bounded = next;
    if (min != null && bounded < min) {
      bounded = min;
    }
    if (max != null && bounded > max) {
      bounded = max;
    }
    // Snap to the step grid; toFixed kills float drift (0.1 + 0.2 style).
    return Number((Math.round(bounded / step) * step).toFixed(6));
  };
  const nudge = (direction: number): void => {
    const next = numeric == null ? min ?? 0 : numeric + direction * step;
    onChange(clampValue(next));
  };
  return (
    <div className="rjsf-builder__num-stepper">
      <button
        type="button"
        className="rjsf-builder__num-stepper-btn"
        aria-label="Decrease"
        disabled={disabled || (numeric != null && min != null && numeric <= min)}
        onClick={() => nudge(-1)}
      >
        −
      </button>
      <input
        id={props.id}
        type="number"
        className="form-control rjsf-builder__num-stepper-input"
        value={numeric ?? ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        inputMode="decimal"
        aria-label={props?.label || "Number"}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(undefined);
            return;
          }
          const parsed = Number(raw);
          if (Number.isFinite(parsed)) {
            onChange(parsed);
          }
        }}
      />
      <button
        type="button"
        className="rjsf-builder__num-stepper-btn"
        aria-label="Increase"
        disabled={disabled || (numeric != null && max != null && numeric >= max)}
        onClick={() => nudge(1)}
      >
        +
      </button>
    </div>
  );
}
/** Number fields, "scale" style: one button per value from min..max by step
 *  (pain/rating scales). Clicking the selected value clears the answer. */
function NumberScaleWidget(props: any): ReactElement {
  const { onChange, schema } = props;
  const disabled = Boolean(props?.disabled || props?.readonly);
  const min = typeof schema?.minimum === "number" ? schema.minimum : 0;
  const maxRaw = typeof schema?.maximum === "number" ? schema.maximum : 10;
  const max = maxRaw < min ? min : maxRaw;
  const step =
    typeof schema?.multipleOf === "number" && schema.multipleOf > 0
      ? schema.multipleOf
      : 1;
  const scaleValues: number[] = [];
  for (
    let value = min;
    value <= max + 1e-9 && scaleValues.length < 50;
    value += step
  ) {
    scaleValues.push(Number(value.toFixed(6)));
  }
  const numeric = typeof props?.value === "number" ? props.value : undefined;
  return (
    <div
      className="rjsf-builder__num-scale"
      role="radiogroup"
      aria-label={props?.label || "Scale"}
    >
      {scaleValues.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={numeric === option}
          className={
            "rjsf-builder__num-scale-btn" +
            (numeric === option ? " is-selected" : "")
          }
          disabled={disabled}
          onClick={() => onChange(numeric === option ? undefined : option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
function DateInputWidget(props: any): ReactElement {
  const { onChange, options, registry } = props;
  const granularity: DateGranularity =
    (options?.dateGranularity as DateGranularity) || "full";
  const BaseInputTemplate = getTemplate(
    "BaseInputTemplate",
    registry,
    options
  ) as any;
  const handleChange = useCallback(
    (value: unknown) => onChange(clampDateInputValue(value)),
    [onChange]
  );
  const isDisabled = Boolean(props?.disabled || props?.readonly);
  const value = clean(props?.value);
  if (granularity === "month") {
    return (
      <select
        id={props.id}
        className="form-control rjsf-builder__temporal-select"
        value={value}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value || undefined)}
        aria-label={props?.label || "Month"}
      >
        <option value="">Select month…</option>
        {MONTH_LONG_NAMES.map((name, index) => (
          <option key={name} value={String(index + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  if (granularity === "year" || granularity === "day") {
    const isYear = granularity === "year";
    return (
      <input
        id={props.id}
        type="number"
        className="form-control rjsf-builder__temporal-number"
        value={value}
        disabled={isDisabled}
        min={isYear ? 1900 : 1}
        max={isYear ? 2100 : 31}
        step={1}
        placeholder={isYear ? "YYYY" : "Day (1–31)"}
        aria-label={props?.label || (isYear ? "Year" : "Day of month")}
        onChange={(event) => {
          const raw = event.target.value;
          if (!raw) {
            onChange(undefined);
            return;
          }
          const numeric = Math.trunc(Number(raw));
          if (!Number.isFinite(numeric)) {
            return;
          }
          onChange(
            isYear ? String(numeric) : String(numeric).padStart(2, "0")
          );
        }}
      />
    );
  }
  if (granularity === "monthYear") {
    return (
      <BaseInputTemplate
        max="9999-12"
        {...props}
        type="month"
        onChange={(next: unknown) => onChange(clean(next) || undefined)}
      />
    );
  }
  return (
    <BaseInputTemplate
      max="9999-12-31"
      {...props}
      type="date"
      onChange={handleChange}
    />
  );
}
/** Combined date + time capture: two native inputs side by side storing one
 *  "YYYY-MM-DD HH:mm" string (date-only while the time is still empty). */
function DateTimeInputWidget(props: any): ReactElement {
  const { onChange } = props;
  const parsed = useMemo(() => {
    const match = /^(\d{4}-\d{2}-\d{2})?[T ]?(\d{2}:\d{2})?/.exec(
      clean(props?.value)
    );
    return { date: match?.[1] || "", time: match?.[2] || "" };
  }, [props?.value]);
  const isDisabled = Boolean(props?.disabled || props?.readonly);
  const commit = useCallback(
    (date: string, time: string) => {
      if (!date && !time) {
        onChange(undefined);
        return;
      }
      onChange(time ? `${date} ${time}`.trim() : date);
    },
    [onChange]
  );
  return (
    <div className="rjsf-builder__datetime">
      <input
        id={props.id}
        type="date"
        className="form-control rjsf-builder__datetime-date"
        value={parsed.date}
        max="9999-12-31"
        disabled={isDisabled}
        aria-label={props?.label ? `${props.label} — date` : "Date"}
        onChange={(event) =>
          commit(clampDateInputValue(event.target.value) || "", parsed.time)
        }
      />
      <input
        type="time"
        className="form-control rjsf-builder__datetime-time"
        value={parsed.time}
        disabled={isDisabled}
        aria-label={props?.label ? `${props.label} — time` : "Time"}
        onChange={(event) => commit(parsed.date, clean(event.target.value))}
      />
    </div>
  );
}
function SignatureWidget(props: any): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const parsedSignature = useMemo(
    () => parseSignatureValue(props?.value),
    [props?.value]
  );
  const [mode, setMode] = useState<"draw" | "type">(parsedSignature.mode);
  const [typedName, setTypedName] = useState<string>(
    parsedSignature.typedName || ""
  );
  const [drawDataUrl, setDrawDataUrl] = useState<string>(
    parsedSignature.drawDataUrl || ""
  );
  useEffect(() => {
    setMode(parsedSignature.mode);
    setTypedName(parsedSignature.typedName || "");
    setDrawDataUrl(parsedSignature.drawDataUrl || "");
  }, [
    parsedSignature.drawDataUrl,
    parsedSignature.mode,
    parsedSignature.typedName
  ]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mode !== "draw" || !drawDataUrl) {
      return;
    }
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = drawDataUrl;
  }, [drawDataUrl, mode]);
  const isDisabled = Boolean(props?.disabled || props?.readonly);
  const drawStart = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (mode !== "draw" || isDisabled) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      drawingRef.current = true;
      canvas.setPointerCapture(event.pointerId);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1f2937";
      ctx.beginPath();
      ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    },
    [isDisabled, mode]
  );
  const drawMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (mode !== "draw" || isDisabled) {
        return;
      }
      if (!drawingRef.current) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
      ctx.stroke();
    },
    [isDisabled, mode]
  );
  const drawEnd = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (mode !== "draw") {
        return;
      }
      const canvas = canvasRef.current;
      if (!drawingRef.current) {
        return;
      }
      drawingRef.current = false;
      if (!canvas) {
        return;
      }
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      const dataUrl = canvas.toDataURL("image/png");
      setDrawDataUrl(dataUrl);
      props.onChange?.(toSignatureDrawValue(dataUrl));
    },
    [mode, props]
  );
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (isDisabled) {
      return;
    }
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawDataUrl("");
    setTypedName("");
    props.onChange?.("");
  }, [isDisabled, props]);
  const onModeChange = useCallback(
    (nextMode: "draw" | "type") => {
      setMode(nextMode);
      if (nextMode === "type") {
        props.onChange?.(toSignatureTypedValue(typedName));
      } else {
        props.onChange?.(toSignatureDrawValue(drawDataUrl));
      }
    },
    [drawDataUrl, props, typedName]
  );
  return (
    <div className="rjsf-builder__signature">
      {" "}
      <div className="rjsf-builder__signature-mode">
        {" "}
        <button
          type="button"
          className={`rjsf-builder__button rjsf-builder__button--small${
            mode === "draw" ? " rjsf-builder__button--primary" : ""
          }`}
          onClick={() => onModeChange("draw")}
          disabled={isDisabled}
        >
          {" "}
          Draw{" "}
        </button>{" "}
        <button
          type="button"
          className={`rjsf-builder__button rjsf-builder__button--small${
            mode === "type" ? " rjsf-builder__button--primary" : ""
          }`}
          onClick={() => onModeChange("type")}
          disabled={isDisabled}
        >
          {" "}
          Type{" "}
        </button>{" "}
      </div>{" "}
      <canvas
        ref={canvasRef}
        id={mode === "draw" ? props?.id : undefined}
        width={420}
        height={120}
        className="rjsf-builder__signature-canvas"
        onPointerDown={drawStart}
        onPointerMove={drawMove}
        onPointerUp={drawEnd}
        onPointerLeave={drawEnd}
        style={{ display: mode === "draw" ? "block" : "none" }}
      />{" "}
      {mode === "type" ? (
        <div className="rjsf-builder__signature-typed">
          {" "}
          <input
            type="text"
            id={props?.id}
            name={props?.id}
            className="rjsf-builder__input"
            placeholder="Type full name"
            value={typedName}
            disabled={isDisabled}
            onChange={(event) => {
              const nextName = event.target.value;
              setTypedName(nextName);
              props.onChange?.(toSignatureTypedValue(nextName));
            }}
          />{" "}
          <div className="rjsf-builder__signature-script-preview">
            {" "}
            {typedName || "Typed signature preview"}{" "}
          </div>{" "}
        </div>
      ) : null}{" "}
      <button
        type="button"
        className="rjsf-builder__button rjsf-builder__button--small"
        onClick={clear}
        disabled={isDisabled}
      >
        {" "}
        Clear signature{" "}
      </button>{" "}
    </div>
  );
}
function ArrayFieldTemplate(props: any): ReactElement {
  const {
    canAdd,
    className,
    disabled,
    fieldPathId,
    items,
    onAddClick,
    optionalDataControl,
    readonly,
    required,
    schema,
    title,
    uiSchema
  } = props;
  const uiOptions =
    uiSchema &&
    typeof uiSchema === "object" &&
    !Array.isArray(uiSchema) &&
    uiSchema["ui:options"] &&
    typeof uiSchema["ui:options"] === "object" &&
    !Array.isArray(uiSchema["ui:options"])
      ? (uiSchema["ui:options"] as JsonObject)
      : {};
  const titleText = clean(uiOptions.title) || clean(title);
  const description = uiOptions.description ?? schema?.description;
  const addLabel = clean(uiOptions.arrayAddLabel) || "Add row";
  const isTableDisplay =
    clean(uiOptions.arrayDisplay) === "table" &&
    Array.isArray(uiOptions.datagridHeaderColumns) &&
    (uiOptions.datagridHeaderColumns as JsonObject[]).length > 0;
  const headerColumns = isTableDisplay
    ? (uiOptions.datagridHeaderColumns as Array<{
        key: string;
        label: string;
        required?: boolean;
        span: number;
      }>)
    : [];
  return (
    <fieldset
      className={`${className || ""} rjsf-builder__array-field${
        isTableDisplay ? " rjsf-builder__array-field--table" : ""
      }`}
      id={fieldPathId?.$id}
    >
      {" "}
      {titleText || optionalDataControl ? (
        <div className="rjsf-builder__array-header">
          {" "}
          {titleText ? (
            <div className="rjsf-builder__array-title">
              {" "}
              <span>{titleText}</span>{" "}
              {required ? (
                <span className="rjsf-builder__array-title-required">*</span>
              ) : null}{" "}
            </div>
          ) : null}{" "}
          {optionalDataControl ? (
            <div className="rjsf-builder__array-optional-control">
              {" "}
              {optionalDataControl}{" "}
            </div>
          ) : null}{" "}
        </div>
      ) : null}{" "}
      {description ? (
        isValidElement(description) ? (
          <div className="rjsf-builder__array-description">{description}</div>
        ) : (
          <div className="rjsf-builder__array-description">
            {str(description)}
          </div>
        )
      ) : null}{" "}
      {isTableDisplay && (items?.length || 0) > 0 ? (
        <div className="rjsf-builder__array-table-head">
          {" "}
          <div className="row rjsf-builder__datagrid-row rjsf-builder__array-table-head-row">
            {" "}
            {headerColumns.map((column) => (
              <div
                key={`head-${column.key}`}
                className={`col-xs-12 col-sm-${column.span} rjsf-builder__array-table-head-cell`}
              >
                {" "}
                {column.label}
                {column.required ? (
                  <span className="rjsf-builder__array-title-required">*</span>
                ) : null}{" "}
              </div>
            ))}{" "}
          </div>{" "}
          <div className="rjsf-builder__array-table-head-actions" />{" "}
        </div>
      ) : null}{" "}
      <div className="rjsf-builder__array-list">{items}</div>{" "}
      {canAdd ? (
        <div className="rjsf-builder__array-add">
          {" "}
          <button
            type="button"
            className="rjsf-builder__button rjsf-builder__button--small rjsf-builder__array-add-button"
            onClick={onAddClick}
            disabled={disabled || readonly}
          >
            {" "}
            {addLabel}{" "}
          </button>{" "}
        </div>
      ) : null}{" "}
    </fieldset>
  );
}
function ArrayFieldItemTemplate(props: any): ReactElement {
  const {
    buttonsProps,
    children,
    className,
    hasToolbar,
    index,
    itemKey,
    parentUiSchema
  } = props;
  const parentOptions =
    parentUiSchema &&
    typeof parentUiSchema === "object" &&
    !Array.isArray(parentUiSchema) &&
    parentUiSchema["ui:options"] &&
    typeof parentUiSchema["ui:options"] === "object" &&
    !Array.isArray(parentUiSchema["ui:options"])
      ? (parentUiSchema["ui:options"] as JsonObject)
      : {};
  const itemLabelBase =
    clean(parentOptions.arrayItemLabel) ||
    (clean(parentOptions.arrayStyle) === "repeat-group" ? "Entry" : "Row");
  const ownUiSchema = (props as JsonObject)?.uiSchema;
  const ownOptions =
    ownUiSchema &&
    typeof ownUiSchema === "object" &&
    !Array.isArray(ownUiSchema) &&
    (ownUiSchema as JsonObject)["ui:options"] &&
    typeof (ownUiSchema as JsonObject)["ui:options"] === "object"
      ? ((ownUiSchema as JsonObject)["ui:options"] as JsonObject)
      : {};
  if (
    clean(parentOptions.arrayDisplay) === "table" ||
    clean(ownOptions.arrayDisplay) === "table"
  ) {
    // Table display: no per-row header — the array renders one shared header
    // of column labels; rows are compact with an icon toolbar on the right.
    return (
      <div
        className={`${className || ""} rjsf-builder__array-item rjsf-builder__array-item--table`}
        data-array-item-key={itemKey}
      >
        {" "}
        <div className="rjsf-builder__array-item-table-content">
          {children}
        </div>{" "}
        {hasToolbar ? (
          <div className="rjsf-builder__array-item-table-toolbar">
            {" "}
            {(buttonsProps?.hasMoveUp || buttonsProps?.hasMoveDown) && (
              <Fragment>
                {" "}
                <button
                  type="button"
                  className="rjsf-builder__col-action"
                  title={`Move ${itemLabelBase.toLowerCase()} ${index + 1} up`}
                  onClick={buttonsProps?.onMoveUpItem}
                  disabled={
                    buttonsProps?.disabled ||
                    buttonsProps?.readonly ||
                    !buttonsProps?.hasMoveUp
                  }
                >
                  ↑
                </button>{" "}
                <button
                  type="button"
                  className="rjsf-builder__col-action"
                  title={`Move ${itemLabelBase.toLowerCase()} ${
                    index + 1
                  } down`}
                  onClick={buttonsProps?.onMoveDownItem}
                  disabled={
                    buttonsProps?.disabled ||
                    buttonsProps?.readonly ||
                    !buttonsProps?.hasMoveDown
                  }
                >
                  ↓
                </button>{" "}
              </Fragment>
            )}{" "}
            {buttonsProps?.hasRemove ? (
              <button
                type="button"
                className="rjsf-builder__col-action rjsf-builder__col-action--danger"
                title={`Remove ${itemLabelBase.toLowerCase()} ${index + 1}`}
                onClick={buttonsProps?.onRemoveItem}
                disabled={buttonsProps?.disabled || buttonsProps?.readonly}
              >
                ✕
              </button>
            ) : null}{" "}
          </div>
        ) : null}{" "}
      </div>
    );
  }
  return (
    <div
      className={`${className || ""} rjsf-builder__array-item`}
      data-array-item-key={itemKey}
    >
      {" "}
      <div className="rjsf-builder__array-item-header">
        {" "}
        <div className="rjsf-builder__array-item-title">
          {itemLabelBase} {index + 1}
        </div>{" "}
        {hasToolbar ? (
          <div className="rjsf-builder__array-item-toolbar">
            {" "}
            {(buttonsProps?.hasMoveUp || buttonsProps?.hasMoveDown) && (
              <Fragment>
                {" "}
                <button
                  type="button"
                  className="rjsf-builder__button rjsf-builder__button--small"
                  onClick={buttonsProps?.onMoveUpItem}
                  disabled={
                    buttonsProps?.disabled ||
                    buttonsProps?.readonly ||
                    !buttonsProps?.hasMoveUp
                  }
                >
                  {" "}
                  Up{" "}
                </button>{" "}
                <button
                  type="button"
                  className="rjsf-builder__button rjsf-builder__button--small"
                  onClick={buttonsProps?.onMoveDownItem}
                  disabled={
                    buttonsProps?.disabled ||
                    buttonsProps?.readonly ||
                    !buttonsProps?.hasMoveDown
                  }
                >
                  {" "}
                  Down{" "}
                </button>{" "}
              </Fragment>
            )}{" "}
            {buttonsProps?.hasCopy ? (
              <button
                type="button"
                className="rjsf-builder__button rjsf-builder__button--small"
                onClick={buttonsProps?.onCopyItem}
                disabled={buttonsProps?.disabled || buttonsProps?.readonly}
              >
                {" "}
                Duplicate{" "}
              </button>
            ) : null}{" "}
            {buttonsProps?.hasRemove ? (
              <button
                type="button"
                className="rjsf-builder__button rjsf-builder__button--small rjsf-builder__array-item-button--danger"
                onClick={buttonsProps?.onRemoveItem}
                disabled={buttonsProps?.disabled || buttonsProps?.readonly}
              >
                {" "}
                Remove{" "}
              </button>
            ) : null}{" "}
          </div>
        ) : null}{" "}
      </div>{" "}
      <div className="rjsf-builder__array-item-body">{children}</div>{" "}
    </div>
  );
}
function ObjectTemplate(props: any): ReactElement {
  const sections: Record<
    string,
    {
      key: string;
      title: string;
      order: number;
      columns?: number;
      collapsible: boolean;
      collapsedByDefault: boolean;
      items: any[];
    }
  > = {};
  const formContext = (props?.registry?.formContext ||
    props?.formContext ||
    {}) as {
    instanceIdPrefix?: string;
    labelLayout?: LabelLayout;
    sectionSwitchableByKey?: Record<string, boolean>;
    sectionVisibilityByKey?: Record<string, boolean>;
    showSectionVisibilityToggle?: boolean;
    onSectionVisibilityChange?: (
      sectionKey: string,
      isVisible: boolean
    ) => void;
    componentMetaByKey?: Record<
      string,
      {
        id?: string;
        orderIndex?: number;
        section?: string;
        sectionId?: string;
        sectionOrder?: number;
        sectionColumns?: number;
        sectionColumn?: number;
        sectionCollapsible?: boolean;
        sectionCollapsedByDefault?: boolean;
        columnSpan?: number;
      }
    >;
    previewReorderEnabled?: boolean;
    previewReorderKeys?: string[];
    onPreviewReorder?: (
      sourceKey: string,
      targetKey: string,
      placement?: DropPlacement
    ) => void;
    previewResizeEnabled?: boolean;
    onPreviewResize?: (targetKey: string, nextSpan: number) => void;
    onPreviewResizeSection?: (sectionKey: string, nextColumns: number) => void;
    onPreviewMoveSection?: (
      sectionKey: string,
      direction: SectionMoveDirection
    ) => void;
    onPreviewDropField?: (
      fieldType: FieldType,
      section: string | undefined,
      targetKey?: string,
      placement?: DropPlacement,
      sectionColumn?: number
    ) => void;
    onPreviewMoveComponent?: (
      componentId: string,
      section: string | undefined,
      targetKey?: string,
      placement?: DropPlacement,
      sectionColumn?: number
    ) => void;
    selectedPreviewKey?: string;
    onPreviewSelectKey?: (key: string) => void;
    snapToGrid?: boolean;
    snapToResize?: boolean;
    forceAllSectionsCollapsible?: boolean;
    showSectionBulkToggle?: boolean;
    previewSectionSettingsEnabled?: boolean;
    onPreviewUpdateSectionSettings?: (
      sectionKey: string,
      updates: SectionSettingsUpdate
    ) => void;
    previewDataGridKeys?: string[];
    onPreviewOpenDataGridSettings?: (key: string) => void;
    previewScrollToSectionKey?: string;
    previewScrollRequest?: number;
    sectionStatsByKey?: Record<
      string,
      {
        reqTotal: number;
        reqDone: number;
        prefilled: number;
        fields: number;
        completed: number;
      }
    >;
    activeSectionKey?: string;
    onActiveSectionChange?: (sectionKey: string) => void;
    /** Designer canvas only: powers the selected-field action toolbar. */
    onPreviewFieldAction?: (action: "duplicate" | "copy" | "delete") => void;
    wizard?: {
      enabled: boolean;
      activeKey: string | null;
      onNavigate: (sectionKey: string | null) => void;
    };
  };
  const snapToGrid = formContext.snapToGrid !== false;
  const snapToResize = formContext.snapToResize !== false;
  const forceAllSectionsCollapsible =
    formContext.forceAllSectionsCollapsible !== false;
  const showSectionBulkToggle = Boolean(formContext.showSectionBulkToggle);
  const showSectionVisibilityToggle = Boolean(
    formContext.showSectionVisibilityToggle
  );
  const sectionSwitchableByKey = formContext.sectionSwitchableByKey || {};
  const sectionVisibilityByKey = formContext.sectionVisibilityByKey || {};
  const onSectionVisibilityChange =
    typeof formContext.onSectionVisibilityChange === "function"
      ? formContext.onSectionVisibilityChange
      : undefined;
  const previewSectionSettingsEnabled = Boolean(
    formContext.previewSectionSettingsEnabled
  );
  const onPreviewUpdateSectionSettings =
    typeof formContext.onPreviewUpdateSectionSettings === "function"
      ? formContext.onPreviewUpdateSectionSettings
      : undefined;
  const labelLayout: LabelLayout =
    formContext.labelLayout === "inline" ? "inline" : "block";
  const isRootObjectTemplate = (() => {
    const fieldPath = props?.fieldPathId?.path;
    if (Array.isArray(fieldPath) && fieldPath.length === 0) {
      return true;
    }
    // With a per-instance idPrefix, the root node's $id is the prefix itself
    // (e.g. "fsbabc123_root"), not the RJSF default "root".
    const rootId = clean(formContext.instanceIdPrefix).toLowerCase() || "root";
    const fieldPathId = clean(props?.fieldPathId?.$id).toLowerCase();
    if (fieldPathId === rootId || fieldPathId === "root") {
      return true;
    }
    const legacyIdSchemaId = clean(props?.idSchema?.$id).toLowerCase();
    return legacyIdSchemaId === rootId || legacyIdSchemaId === "root";
  })();
  const reorderEnabled =
    Boolean(formContext.previewReorderEnabled) && isRootObjectTemplate;
  const resizeEnabled =
    Boolean(formContext.previewResizeEnabled) && isRootObjectTemplate;
  const showColumnLaneTitles =
    isRootObjectTemplate &&
    (reorderEnabled || resizeEnabled || previewSectionSettingsEnabled);
  const reorderableKeys = useMemo(
    () =>
      new Set(
        Array.isArray(formContext.previewReorderKeys)
          ? formContext.previewReorderKeys
          : []
      ),
    [formContext.previewReorderKeys]
  );
  const onPreviewReorder =
    typeof formContext.onPreviewReorder === "function"
      ? formContext.onPreviewReorder
      : undefined;
  const onPreviewResize =
    typeof formContext.onPreviewResize === "function"
      ? formContext.onPreviewResize
      : undefined;
  const onPreviewResizeSection =
    typeof formContext.onPreviewResizeSection === "function"
      ? formContext.onPreviewResizeSection
      : undefined;
  const onPreviewMoveSection =
    typeof formContext.onPreviewMoveSection === "function"
      ? formContext.onPreviewMoveSection
      : undefined;
  const onPreviewDropField =
    typeof formContext.onPreviewDropField === "function"
      ? formContext.onPreviewDropField
      : undefined;
  const onPreviewMoveComponent =
    typeof formContext.onPreviewMoveComponent === "function"
      ? formContext.onPreviewMoveComponent
      : undefined;
  const onPreviewSelectKey =
    typeof formContext.onPreviewSelectKey === "function"
      ? formContext.onPreviewSelectKey
      : undefined;
  const onPreviewOpenDataGridSettings =
    typeof formContext.onPreviewOpenDataGridSettings === "function"
      ? formContext.onPreviewOpenDataGridSettings
      : undefined;
  const previewDataGridKeys = useMemo(
    () =>
      new Set(
        Array.isArray(formContext.previewDataGridKeys)
          ? formContext.previewDataGridKeys
          : []
      ),
    [formContext.previewDataGridKeys]
  );
  const selectedPreviewKey = clean(formContext.selectedPreviewKey);
  const previewBadgeMetaByKey = (formContext.componentMetaByKey || {}) as Record<
    string,
    { hasVisibilityRules?: boolean; sharedFieldRef?: string }
  >;
  const previewScrollToSectionKey = clean(
    formContext.previewScrollToSectionKey
  );
  const previewScrollRequest = Number.isFinite(
    Number(formContext.previewScrollRequest)
  )
    ? Number(formContext.previewScrollRequest)
    : 0;
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  // Inline insert seam: which field's "+" palette is open, and its filter.
  const [insertAfterKey, setInsertAfterKey] = useState<string | null>(null);
  const [insertSearch, setInsertSearch] = useState("");
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const [sectionResizingKey, setSectionResizingKey] = useState<string | null>(
    null
  );
  const [dragOverSectionKey, setDragOverSectionKey] = useState<string | null>(
    null
  );
  const [dragOverColumnKey, setDragOverColumnKey] = useState<string | null>(
    null
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrolledSectionKey, setScrolledSectionKey] = useState<string | null>(
    null
  );
  useEffect(() => {
    if (!previewScrollToSectionKey || !previewScrollRequest) {
      return;
    }
    const target = sectionRefs.current[previewScrollToSectionKey];
    if (!target) {
      return;
    }
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    setScrolledSectionKey(previewScrollToSectionKey);
    const timerId = window.setTimeout(() => {
      setScrolledSectionKey((current) =>
        current === previewScrollToSectionKey ? null : current
      );
    }, 1400);
    return () => window.clearTimeout(timerId);
  }, [previewScrollRequest, previewScrollToSectionKey]);
  const orderedProperties = [...(props?.properties || [])].sort(
    (a: any, b: any) => {
      const componentMetaByKey = formContext.componentMetaByKey || {};
      const aKey = resolvePreviewPropertyKey(a, componentMetaByKey);
      const bKey = resolvePreviewPropertyKey(b, componentMetaByKey);
      const aMeta = componentMetaByKey[aKey];
      const bMeta = componentMetaByKey[bKey];
      const aOrder = Number.isFinite(Number(aMeta?.orderIndex))
        ? Number(aMeta?.orderIndex)
        : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(Number(bMeta?.orderIndex))
        ? Number(bMeta?.orderIndex)
        : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return aKey.localeCompare(bKey);
    }
  );
  const sectionColumnCursor: Record<string, number> = {};
  orderedProperties.forEach((property: any, index: number) => {
    if (property?.hidden) {
      return;
    }
    const key = resolvePreviewPropertyKey(
      property,
      formContext.componentMetaByKey || {}
    );
    const meta = formContext.componentMetaByKey?.[key];
    const options = property?.uiSchema?.["ui:options"] || {};
    // Group key: stable sectionId when the definition carries one, else the
    // legacy title key. The TITLE stays the display text either way.
    const sectionKey =
      clean(meta?.sectionId ?? options.sectionId) ||
      clean(meta?.section ?? options.section) ||
      "__default";
    const sectionTitle = clean(meta?.section ?? options.section);
    const rawSectionColumns = (() => {
      const rawColumns = Number(meta?.sectionColumns ?? options.sectionColumns);
      if (!Number.isFinite(rawColumns)) {
        return inferSectionColumnsFromTitle(sectionTitle);
      }
      const normalized = Math.floor(rawColumns);
      return normalized >= 1 && normalized <= 12
        ? normalized
        : inferSectionColumnsFromTitle(sectionTitle);
    })();
    const sectionOrder = Number.isFinite(Number(meta?.sectionOrder))
      ? Number(meta?.sectionOrder)
      : Number.isFinite(Number(options.sectionOrder))
      ? Number(options.sectionOrder)
      : index;
    const sectionCollapsible =
      typeof meta?.sectionCollapsible === "boolean"
        ? meta.sectionCollapsible
        : Boolean(options.sectionCollapsible);
    const sectionCollapsedByDefault =
      typeof meta?.sectionCollapsedByDefault === "boolean"
        ? meta.sectionCollapsedByDefault
        : Boolean(options.sectionCollapsedByDefault);
    if (!sections[sectionKey]) {
      sections[sectionKey] = {
        key: sectionKey,
        title: sectionTitle,
        order: sectionOrder,
        columns:
          rawSectionColumns && rawSectionColumns > 1
            ? rawSectionColumns
            : undefined,
        collapsible: sectionCollapsible,
        collapsedByDefault: sectionCollapsedByDefault,
        items: []
      };
    } else {
      const currentColumns = sections[sectionKey].columns || 1;
      const candidateColumns =
        rawSectionColumns && rawSectionColumns > 1 ? rawSectionColumns : 1;
      if (candidateColumns > currentColumns) {
        sections[sectionKey].columns = clamp(candidateColumns, 1, 12);
      }
      if (!sections[sectionKey].title && sectionTitle) {
        sections[sectionKey].title = sectionTitle;
      }
      sections[sectionKey].collapsible =
        sections[sectionKey].collapsible || sectionCollapsible;
      sections[sectionKey].collapsedByDefault =
        sections[sectionKey].collapsedByDefault || sectionCollapsedByDefault;
    }
    const sectionColumns = sections[sectionKey].columns;
    const rawSpan = Number.isFinite(Number(meta?.columnSpan))
      ? clamp(Math.floor(Number(meta?.columnSpan)), 1, 12)
      : clamp(Math.floor(Number(options.columnSpan) || 12), 1, 12);
    const resolvedSpan = rawSpan;
    const resolvedSectionColumn =
      sectionColumns && sectionColumns > 1
        ? Number.isFinite(Number(meta?.sectionColumn ?? options.sectionColumn))
          ? clamp(
              Math.floor(Number(meta?.sectionColumn ?? options.sectionColumn)),
              1,
              sectionColumns
            )
          : (() => {
              const cursor = sectionColumnCursor[sectionKey] || 0;
              const assigned = (cursor % sectionColumns) + 1;
              sectionColumnCursor[sectionKey] = cursor + 1;
              return assigned;
            })()
        : undefined;
    sections[sectionKey].items.push({
      ...property,
      previewKey: key,
      span: resolvedSpan,
      sectionColumn: resolvedSectionColumn
    });
  });
  Object.values(sections).forEach((section) => {
    if (section.columns && section.columns > 1) {
      return;
    }
    const inferredByTitle = inferSectionColumnsFromTitle(section.title);
    if (inferredByTitle && inferredByTitle > 1) {
      section.columns = inferredByTitle;
    }
  });
  const orderedSections = Object.values(sections).sort(
    (a, b) => a.order - b.order
  );
  const collapsibleSectionKeys = useMemo(
    () =>
      orderedSections
        .filter(
          (section) =>
            Boolean(clean(section.title)) &&
            ((isRootObjectTemplate && forceAllSectionsCollapsible) ||
              section.collapsible)
        )
        .map((section) => section.key),
    [forceAllSectionsCollapsible, isRootObjectTemplate, orderedSections]
  );
  const collapsibleSectionKeySet = useMemo(
    () => new Set(collapsibleSectionKeys),
    [collapsibleSectionKeys]
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () =>
      new Set(
        orderedSections
          .filter(
            (section) =>
              collapsibleSectionKeySet.has(section.key) &&
              section.collapsedByDefault
          )
          .map((section) => section.key)
      )
  );
  const [sectionTitleDrafts, setSectionTitleDrafts] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    setCollapsed((prev) => {
      const next = new Set<string>();
      orderedSections.forEach((section) => {
        if (!collapsibleSectionKeySet.has(section.key)) {
          return;
        }
        if (prev.has(section.key)) {
          next.add(section.key);
        } else if (section.collapsedByDefault) {
          next.add(section.key);
        }
      });
      return next;
    });
  }, [collapsibleSectionKeySet, orderedSections]);
  // Report which group box is currently most visible so the viewer nav rail
  // can highlight it while the user scrolls. Root template only; observers
  // are per widget instance (sectionRefs are instance-local).
  const onActiveSectionChange = formContext.onActiveSectionChange;
  const orderedSectionKeySignature = orderedSections
    .map((section) => section.key)
    .join("\u0001");
  useEffect(() => {
    if (
      !isRootObjectTemplate ||
      typeof onActiveSectionChange !== "function" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const nodes = orderedSectionKeySignature
      .split("\u0001")
      .filter(Boolean)
      // Switch-hidden sections have no rail row, so they must not win the
      // active-section race (their dashed stub still renders at full size).
      .filter(
        (key) =>
          !(
            sectionSwitchableByKey[key] &&
            sectionVisibilityByKey[key] === false
          )
      )
      .map((key) => [key, sectionRefs.current[key]] as const)
      .filter(([, node]) => Boolean(node));
    if (!nodes.length) {
      return;
    }
    // Rank by visible height in pixels, not intersectionRatio: ratio biases
    // toward short boxes (a fully-visible stub beats a tall section filling
    // the viewport) and makes very tall sections unreachable.
    const visiblePx = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = (entry.target as HTMLElement).dataset.sectionKey;
          if (!key) {
            return;
          }
          visiblePx.set(
            key,
            entry.isIntersecting ? entry.intersectionRect.height : 0
          );
        });
        let bestKey = "";
        let bestPx = 0;
        nodes.forEach(([key]) => {
          const px = visiblePx.get(key) || 0;
          if (px > bestPx) {
            bestPx = px;
            bestKey = key;
          }
        });
        // Empty string clears the highlight when no section is on screen
        // (keeps multiple ListView instances from all showing an active row).
        onActiveSectionChange(bestKey);
      },
      { threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1] }
    );
    nodes.forEach(([, node]) => observer.observe(node as HTMLDivElement));
    return () => observer.disconnect();
  }, [
    isRootObjectTemplate,
    onActiveSectionChange,
    orderedSectionKeySignature,
    sectionSwitchableByKey,
    sectionVisibilityByKey
  ]);
  const canAcceptPreviewDrop = Boolean(
    onPreviewReorder || onPreviewDropField || onPreviewMoveComponent
  );
  const handleDropOnTarget = useCallback(
    (
      event: DragEvent<HTMLElement>,
      section: string | undefined,
      targetKey?: string,
      placement: DropPlacement = "after",
      sectionColumn?: number
    ) => {
      event.preventDefault();
      event.stopPropagation();
      const sourcePreviewKey = getDragData(
        event.dataTransfer,
        DRAG_TYPE_PREVIEW_KEY
      );
      if (sourcePreviewKey) {
        if (targetKey && onPreviewReorder) {
          if (sourcePreviewKey !== targetKey) {
            onPreviewReorder(sourcePreviewKey, targetKey, placement);
          }
          setDragOverKey(null);
          setDragOverSlot(null);
          setDragOverSectionKey(null);
          return;
        }
        const sourcePreviewId =
          formContext.componentMetaByKey?.[sourcePreviewKey]?.id;
        if (sourcePreviewId && onPreviewMoveComponent) {
          onPreviewMoveComponent(
            sourcePreviewId,
            section,
            targetKey,
            placement,
            sectionColumn
          );
          setDragOverKey(null);
          setDragOverSlot(null);
          setDragOverSectionKey(null);
          return;
        }
      }
      const newFieldType = getDragData(
        event.dataTransfer,
        DRAG_TYPE_NEW
      ) as FieldType;
      if (FIELD_TYPE_SET.has(newFieldType) && onPreviewDropField) {
        onPreviewDropField(
          newFieldType,
          section,
          targetKey,
          placement,
          sectionColumn
        );
        setDragOverKey(null);
        setDragOverSlot(null);
        setDragOverSectionKey(null);
        return;
      }
      const componentId = getDragData(event.dataTransfer, DRAG_TYPE_COMPONENT);
      if (componentId && onPreviewMoveComponent) {
        onPreviewMoveComponent(
          componentId,
          section,
          targetKey,
          placement,
          sectionColumn
        );
      }
      setDragOverKey(null);
      setDragOverSlot(null);
      setDragOverSectionKey(null);
    },
    [
      formContext.componentMetaByKey,
      onPreviewDropField,
      onPreviewMoveComponent,
      onPreviewReorder
    ]
  );
  const handleResizePointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLDivElement>,
      itemKey: string,
      startSpan: number
    ) => {
      if (!onPreviewResize) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const handle = event.currentTarget;
      const grid = handle.closest(
        ".rjsf-builder__grid, .rjsf-builder__column-content"
      ) as HTMLElement | null;
      if (!grid) {
        return;
      }
      const gridRect = grid.getBoundingClientRect();
      if (!Number.isFinite(gridRect.width) || gridRect.width <= 0) {
        return;
      }
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const pxPerColumn = gridRect.width / 12;
      setResizingKey(itemKey);
      handle.setPointerCapture(pointerId);
      const onPointerMove = (moveEvent: PointerEvent): void => {
        const deltaColumns = Math.round(
          (moveEvent.clientX - startX) / pxPerColumn
        );
        const rawSpan = clamp(startSpan + deltaColumns, 1, 12);
        onPreviewResize(itemKey, snapColumnSpan(rawSpan, snapToResize));
      };
      const onPointerDone = (): void => {
        setResizingKey((current) => (current === itemKey ? null : current));
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerDone);
        window.removeEventListener("pointercancel", onPointerDone);
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerDone);
      window.addEventListener("pointercancel", onPointerDone);
    },
    [onPreviewResize, snapToResize]
  );
  const handleSectionResizePointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      sectionKey: string,
      startColumns: number
    ) => {
      if (!onPreviewResizeSection) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const handle = event.currentTarget;
      const sectionNode = handle.closest(
        ".rjsf-builder__section"
      ) as HTMLElement | null;
      if (!sectionNode) {
        return;
      }
      const sectionRect = sectionNode.getBoundingClientRect();
      if (!Number.isFinite(sectionRect.width) || sectionRect.width <= 0) {
        return;
      }
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const pxPerColumn = sectionRect.width / 12;
      setSectionResizingKey(sectionKey);
      handle.setPointerCapture(pointerId);
      const onPointerMove = (moveEvent: PointerEvent): void => {
        const deltaColumns = Math.round(
          (moveEvent.clientX - startX) / pxPerColumn
        );
        const rawColumns = clamp(startColumns + deltaColumns, 1, 12);
        onPreviewResizeSection(sectionKey, rawColumns);
      };
      const onPointerDone = (): void => {
        setSectionResizingKey((current) =>
          current === sectionKey ? null : current
        );
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerDone);
        window.removeEventListener("pointercancel", onPointerDone);
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerDone);
      window.addEventListener("pointercancel", onPointerDone);
    },
    [onPreviewResizeSection]
  );
  const renderPreviewItem = useCallback(
    (
      item: any,
      section: { key: string; title: string },
      itemSpan: number,
      forceFullWidth = false
    ) => {
      const itemKey = str(item?.previewKey || item?.name);
      const slotBefore = `${itemKey}:before`;
      const slotAfter = `${itemKey}:after`;
      const isReorderable = reorderEnabled && reorderableKeys.has(itemKey);
      const isResizable =
        !forceFullWidth && resizeEnabled && reorderableKeys.has(itemKey);
      const isSelected = itemKey === selectedPreviewKey;
      const isDataGridItem = previewDataGridKeys.has(itemKey);
      const handleSelect = onPreviewSelectKey
        ? () => onPreviewSelectKey(itemKey)
        : undefined;
      const spanStyle = {
        gridColumn: `span ${forceFullWidth ? 12 : itemSpan}`
      };
      return (
        <div
          key={`${itemKey || item.name}_wrap`}
          className={`rjsf-builder__col${
            isReorderable ? " rjsf-builder__col--draggable" : ""
          }${dragOverKey === itemKey ? " rjsf-builder__col--drag-over" : ""}${
            resizingKey === itemKey ? " rjsf-builder__col--resizing" : ""
          }${isSelected ? " rjsf-builder__col--selected" : ""}`}
          style={spanStyle}
          onMouseDownCapture={handleSelect}
          onFocusCapture={handleSelect}
          onClick={handleSelect}
          onDragOver={
            canAcceptPreviewDrop
              ? (event) => {
                  event.preventDefault();
                  setDragOverKey(itemKey);
                  setDragOverSlot(null);
                  setDragOverSectionKey(section.key);
                }
              : undefined
          }
          onDragLeave={
            canAcceptPreviewDrop
              ? () =>
                  setDragOverKey((current) =>
                    current === itemKey ? null : current
                  )
              : undefined
          }
          onDrop={
            canAcceptPreviewDrop
              ? (event) =>
                  handleDropOnTarget(
                    event,
                    section.title || undefined,
                    itemKey,
                    "after"
                  )
              : undefined
          }
        >
          {" "}
          {canAcceptPreviewDrop ? (
            <Fragment>
              {" "}
              <div
                className={`rjsf-builder__inline-dropzone rjsf-builder__inline-dropzone--before${
                  dragOverSlot === slotBefore ? " is-active" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragOverSlot(slotBefore);
                  setDragOverKey(null);
                  setDragOverSectionKey(section.key);
                }}
                onDragLeave={() =>
                  setDragOverSlot((current) =>
                    current === slotBefore ? null : current
                  )
                }
                onDrop={(event) => {
                  event.stopPropagation();
                  handleDropOnTarget(
                    event,
                    section.title || undefined,
                    itemKey,
                    "before"
                  );
                }}
              />{" "}
              <div
                className={`rjsf-builder__inline-dropzone rjsf-builder__inline-dropzone--after${
                  dragOverSlot === slotAfter ? " is-active" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragOverSlot(slotAfter);
                  setDragOverKey(null);
                  setDragOverSectionKey(section.key);
                }}
                onDragLeave={() =>
                  setDragOverSlot((current) =>
                    current === slotAfter ? null : current
                  )
                }
                onDrop={(event) => {
                  event.stopPropagation();
                  handleDropOnTarget(
                    event,
                    section.title || undefined,
                    itemKey,
                    "after"
                  );
                }}
              />{" "}
            </Fragment>
          ) : null}{" "}
          {isReorderable ? (
            <div
              className="rjsf-builder__drag-handle"
              title="Drag to reorder. Columns auto-size."
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                setDragData(event.dataTransfer, DRAG_TYPE_PREVIEW_KEY, itemKey);
              }}
              onDragEnd={() => {
                setDragOverKey(null);
                setDragOverSlot(null);
              }}
            >
              {" "}
              :::{" "}
            </div>
          ) : null}{" "}
          {isSelected &&
          reorderEnabled &&
          typeof formContext.onPreviewFieldAction === "function" ? (
            <div className="rjsf-builder__col-actions">
              {" "}
              <button
                type="button"
                className="rjsf-builder__col-action"
                title="Duplicate field (Ctrl+D)"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  formContext.onPreviewFieldAction?.("duplicate");
                }}
              >
                ⧉
              </button>{" "}
              <button
                type="button"
                className="rjsf-builder__col-action"
                title="Copy field (Ctrl+C) — paste into this or another form with Ctrl+V"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  formContext.onPreviewFieldAction?.("copy");
                }}
              >
                ⎘
              </button>{" "}
              <button
                type="button"
                className="rjsf-builder__col-action rjsf-builder__col-action--danger"
                title="Delete field (Del)"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  formContext.onPreviewFieldAction?.("delete");
                }}
              >
                ✕
              </button>{" "}
            </div>
          ) : null}{" "}
          {reorderEnabled &&
          (previewBadgeMetaByKey[itemKey]?.hasVisibilityRules ||
            previewBadgeMetaByKey[itemKey]?.sharedFieldRef) ? (
            <div className="rjsf-builder__field-badges">
              {" "}
              {previewBadgeMetaByKey[itemKey]?.hasVisibilityRules ? (
                <span
                  className="rjsf-builder__field-badge rjsf-builder__field-badge--visibility"
                  title="Conditional visibility rules apply to this field"
                >
                  {" "}
                  &#128065;{" "}
                </span>
              ) : null}{" "}
              {previewBadgeMetaByKey[itemKey]?.sharedFieldRef ? (
                <span
                  className="rjsf-builder__field-badge rjsf-builder__field-badge--shared"
                  title={`Shared field: ${previewBadgeMetaByKey[itemKey]?.sharedFieldRef}`}
                >
                  {" "}
                  {previewBadgeMetaByKey[itemKey]?.sharedFieldRef}{" "}
                </span>
              ) : null}{" "}
            </div>
          ) : null}{" "}
          {isDataGridItem && onPreviewOpenDataGridSettings ? (
            <button
              type="button"
              className="rjsf-builder__item-action rjsf-builder__item-action--datagrid"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onPreviewSelectKey?.(itemKey);
                onPreviewOpenDataGridSettings(itemKey);
              }}
            >
              {" "}
              Datagrid settings{" "}
            </button>
          ) : null}{" "}
          {isResizable ? (
            <div
              className="rjsf-builder__resize-handle"
              title={
                snapToResize
                  ? "Drag to resize (snap enabled)."
                  : "Drag to resize."
              }
              onPointerDown={(event) =>
                handleResizePointerDown(event, itemKey, itemSpan)
              }
            />
          ) : null}{" "}
          {item.content}{" "}
          {reorderEnabled && onPreviewDropField ? (
            <div
              className={`rjsf-builder__insert${
                insertAfterKey === itemKey ? " is-open" : ""
              }`}
              onClick={(event) => event.stopPropagation()}
              onMouseDownCapture={(event) => event.stopPropagation()}
            >
              {" "}
              <span className="rjsf-builder__insert-rule" />{" "}
              <button
                type="button"
                className="rjsf-builder__insert-plus"
                title="Insert a field here"
                onClick={(event) => {
                  event.stopPropagation();
                  setInsertSearch("");
                  setInsertAfterKey((current) =>
                    current === itemKey ? null : itemKey
                  );
                }}
              >
                +
              </button>{" "}
              {insertAfterKey === itemKey ? (
                <div className="rjsf-builder__insert-pal">
                  {" "}
                  <input
                    className="rjsf-builder__input"
                    autoFocus
                    placeholder="Search field types..."
                    value={insertSearch}
                    onChange={(event) => setInsertSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setInsertAfterKey(null);
                      }
                    }}
                  />{" "}
                  <div className="rjsf-builder__insert-grid">
                    {" "}
                    {FIELD_TYPES.filter(
                      (entry) =>
                        entry.type !== "switch" &&
                        entry.type !== "systemDatagrid2" &&
                        entry.label
                          .toLowerCase()
                          .includes(insertSearch.trim().toLowerCase())
                    ).map((entry) => (
                      <button
                        key={entry.type}
                        type="button"
                        onClick={() => {
                          onPreviewDropField(
                            entry.type,
                            section.title || undefined,
                            itemKey,
                            "after"
                          );
                          setInsertAfterKey(null);
                        }}
                      >
                        {entry.label}
                      </button>
                    ))}{" "}
                  </div>{" "}
                </div>
              ) : null}{" "}
            </div>
          ) : null}{" "}
        </div>
      );
    },
    [
      canAcceptPreviewDrop,
      dragOverKey,
      dragOverSlot,
      handleDropOnTarget,
      handleResizePointerDown,
      insertAfterKey,
      insertSearch,
      onPreviewDropField,
      onPreviewSelectKey,
      onPreviewOpenDataGridSettings,
      previewBadgeMetaByKey,
      previewDataGridKeys,
      reorderEnabled,
      reorderableKeys,
      resizeEnabled,
      resizingKey,
      selectedPreviewKey,
      snapToResize
    ]
  );
  const wizard =
    isRootObjectTemplate && formContext.wizard?.enabled
      ? formContext.wizard
      : undefined;
  const wizardActiveKey = wizard
    ? orderedSections.some((section) => section.key === wizard.activeKey)
      ? (wizard.activeKey as string)
      : orderedSections[0]?.key
    : undefined;
  const wizardActiveIndex = wizard
    ? orderedSections.findIndex((section) => section.key === wizardActiveKey)
    : -1;
  const wizardActiveStats =
    wizard && wizardActiveKey
      ? formContext.sectionStatsByKey?.[wizardActiveKey]
      : undefined;
  const wizardNextBlocked = Boolean(
    wizardActiveStats && wizardActiveStats.reqDone < wizardActiveStats.reqTotal
  );
  return (
    <div
      className={`rjsf-builder__object${
        labelLayout === "inline" ? " rjsf-builder__object--labels-inline" : ""
      }`}
    >
      {" "}
      {!wizard &&
      showSectionBulkToggle &&
      isRootObjectTemplate &&
      collapsibleSectionKeys.length ? (
        <div className="rjsf-builder__section-bulk">
          {" "}
          <button
            type="button"
            className="rjsf-builder__button rjsf-builder__button--small"
            onClick={() => setCollapsed(new Set(collapsibleSectionKeys))}
          >
            {" "}
            Collapse all{" "}
          </button>{" "}
          <button
            type="button"
            className="rjsf-builder__button rjsf-builder__button--small"
            onClick={() => setCollapsed(new Set())}
          >
            {" "}
            Expand all{" "}
          </button>{" "}
        </div>
      ) : null}{" "}
      {orderedSections.map((section, sectionIndex) => {
        const sectionIsCollapsible = collapsibleSectionKeySet.has(section.key);
        const sectionIsCollapsed =
          sectionIsCollapsible && collapsed.has(section.key);
        const sectionColumnsValue = clamp(
          Math.floor(Number(section.columns) || 1),
          1,
          12
        );
        const sectionIsResizable =
          Boolean(onPreviewResizeSection) && resizeEnabled;
        const sectionCanMove =
          isRootObjectTemplate && Boolean(onPreviewMoveSection);
        const canMoveSectionUp = sectionCanMove && sectionIndex > 0;
        const canMoveSectionDown =
          sectionCanMove && sectionIndex < orderedSections.length - 1;
        const sectionSupportsViewerSwitch = Boolean(
          sectionSwitchableByKey[section.key]
        );
        const sectionIsSwitchable = Boolean(
          isRootObjectTemplate &&
            showSectionVisibilityToggle &&
            sectionSupportsViewerSwitch
        );
        const sectionIsVisibleBySwitch =
          !sectionIsSwitchable || sectionVisibilityByKey[section.key] !== false;
        const canEditSectionSettings =
          isRootObjectTemplate &&
          previewSectionSettingsEnabled &&
          Boolean(onPreviewUpdateSectionSettings);
        // Root only: nested ObjectTemplates (repeat-group rows) share the same
        // section keys, and whole-section aggregates are wrong at row scope.
        const sectionStats = isRootObjectTemplate
          ? formContext.sectionStatsByKey?.[section.key]
          : undefined;
        const sectionIsActive =
          isRootObjectTemplate &&
          Boolean(formContext.activeSectionKey) &&
          formContext.activeSectionKey === section.key;
        return (
          <div
            key={section.key}
            ref={(node) => {
              sectionRefs.current[section.key] = node;
            }}
            data-section-key={section.key}
            data-section-title={section.title || undefined}
            data-req-total={sectionStats ? String(sectionStats.reqTotal) : undefined}
            data-req-done={sectionStats ? String(sectionStats.reqDone) : undefined}
            data-prefilled={sectionStats ? String(sectionStats.prefilled) : undefined}
            data-active={sectionIsActive ? "true" : undefined}
            className={`rjsf-builder__section${
              section.title
                ? " rjsf-builder__section--titled"
                : " rjsf-builder__section--untitled"
            }${
              scrolledSectionKey === section.key
                ? " rjsf-builder__section--jumped"
                : ""
            }${
              sectionResizingKey === section.key
                ? " rjsf-builder__section--resizing"
                : ""
            }${
              sectionIsSwitchable && !sectionIsVisibleBySwitch
                ? " rjsf-builder__section--switch-off"
                : ""
            }${
              wizard && section.key !== wizardActiveKey
                ? " rjsf-builder__section--wizard-hidden"
                : ""
            }`}
          >
            {" "}
            {section.title ? (
              <div className="rjsf-builder__section-header">
                {" "}
                <div className="rjsf-builder__section-title">
                  {" "}
                  {section.title}{" "}
                </div>{" "}
                {sectionStats ? (
                  <div className="rjsf-builder__section-meta">
                    {[
                      sectionStats.reqTotal > 0
                        ? `${sectionStats.reqTotal} required`
                        : "",
                      `${sectionStats.fields} field${
                        sectionStats.fields === 1 ? "" : "s"
                      }`,
                      sectionStats.prefilled > 0
                        ? `${sectionStats.prefilled} prefilled from chart`
                        : "",
                      sectionStats.fields > 0 && sectionStats.completed === 0
                        ? "not started"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                ) : null}{" "}
                <div className="rjsf-builder__section-actions">
                  {" "}
                  {sectionCanMove ? (
                    <Fragment>
                      {" "}
                      <button
                        type="button"
                        className="rjsf-builder__section-toggle"
                        title="Move section up"
                        onClick={() =>
                          onPreviewMoveSection?.(section.key, "up")
                        }
                        disabled={!canMoveSectionUp}
                      >
                        {" "}
                        Up{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className="rjsf-builder__section-toggle"
                        title="Move section down"
                        onClick={() =>
                          onPreviewMoveSection?.(section.key, "down")
                        }
                        disabled={!canMoveSectionDown}
                      >
                        {" "}
                        Down{" "}
                      </button>{" "}
                    </Fragment>
                  ) : null}{" "}
                  {sectionIsResizable ? (
                    <button
                      type="button"
                      className="rjsf-builder__section-resize"
                      title="Drag to resize section columns."
                      onPointerDown={(event) =>
                        handleSectionResizePointerDown(
                          event,
                          section.key,
                          sectionColumnsValue
                        )
                      }
                    >
                      {" "}
                      Cols {sectionColumnsValue} ::::{" "}
                    </button>
                  ) : null}{" "}
                  {sectionIsCollapsible ? (
                    <button
                      type="button"
                      className="rjsf-builder__section-toggle"
                      onClick={() =>
                        setCollapsed((prev) => {
                          const next = new Set(prev);
                          if (next.has(section.key)) {
                            next.delete(section.key);
                          } else {
                            next.add(section.key);
                          }
                          return next;
                        })
                      }
                    >
                      {" "}
                      {sectionIsCollapsed ? "Expand" : "Collapse"}{" "}
                    </button>
                  ) : null}{" "}
                  {canEditSectionSettings ? (
                    <details
                      className="rjsf-builder__section-menu"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {" "}
                      <summary className="rjsf-builder__section-menu-trigger">
                        {" "}
                        Section settings{" "}
                      </summary>{" "}
                      <div className="rjsf-builder__section-menu-panel">
                        {" "}
                        <label className="rjsf-builder__field rjsf-builder__section-menu-field">
                          {" "}
                          <span>Section (name/title key)</span>{" "}
                          <input
                            className="rjsf-builder__input"
                            value={
                              sectionTitleDrafts[section.key] ?? section.title
                            }
                            onChange={(event) =>
                              setSectionTitleDrafts((current) => ({
                                ...current,
                                [section.key]: event.target.value
                              }))
                            }
                            onBlur={() => {
                              const rawValue =
                                sectionTitleDrafts[section.key] ??
                                section.title;
                              const nextTitle = clean(rawValue);
                              setSectionTitleDrafts((current) => {
                                if (!(section.key in current)) {
                                  return current;
                                }
                                const next = { ...current };
                                delete next[section.key];
                                return next;
                              });
                              if (
                                nextTitle &&
                                nextTitle !== clean(section.title)
                              ) {
                                onPreviewUpdateSectionSettings?.(section.key, {
                                  sectionTitle: nextTitle
                                });
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                (
                                  event.currentTarget as HTMLInputElement
                                ).blur();
                              }
                            }}
                          />{" "}
                        </label>{" "}
                        <label className="rjsf-builder__field rjsf-builder__section-menu-field">
                          {" "}
                          <span>Section order</span>{" "}
                          <input
                            type="number"
                            className="rjsf-builder__input"
                            value={
                              Number.isFinite(Number(section.order))
                                ? Math.floor(Number(section.order))
                                : 0
                            }
                            onChange={(event) =>
                              onPreviewUpdateSectionSettings?.(section.key, {
                                sectionOrder: Math.floor(
                                  Number(event.target.value) || 0
                                )
                              })
                            }
                          />{" "}
                        </label>{" "}
                        <label className="rjsf-builder__field rjsf-builder__section-menu-field">
                          {" "}
                          <span>Section columns</span>{" "}
                          <input
                            type="number"
                            min={1}
                            max={12}
                            className="rjsf-builder__input"
                            value={sectionColumnsValue}
                            onChange={(event) =>
                              onPreviewResizeSection?.(
                                section.key,
                                clamp(
                                  Math.floor(Number(event.target.value) || 1),
                                  1,
                                  12
                                )
                              )
                            }
                            disabled={!onPreviewResizeSection}
                          />{" "}
                        </label>{" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={Boolean(section.collapsible)}
                            onChange={(event) =>
                              onPreviewUpdateSectionSettings?.(section.key, {
                                sectionCollapsible: event.target.checked,
                                sectionCollapsedByDefault: event.target.checked
                                  ? Boolean(section.collapsedByDefault)
                                  : false
                              })
                            }
                          />{" "}
                          <span>Section collapsible</span>{" "}
                        </label>{" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={Boolean(section.collapsedByDefault)}
                            disabled={!section.collapsible}
                            onChange={(event) =>
                              onPreviewUpdateSectionSettings?.(section.key, {
                                sectionCollapsedByDefault: event.target.checked,
                                sectionCollapsible: event.target.checked
                                  ? true
                                  : Boolean(section.collapsible)
                              })
                            }
                          />{" "}
                          <span>Section collapsed by default</span>{" "}
                        </label>{" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={sectionSupportsViewerSwitch}
                            onChange={(event) =>
                              onPreviewUpdateSectionSettings?.(section.key, {
                                sectionSwitchEnabled: event.target.checked
                              })
                            }
                          />{" "}
                          <span>Allow user to hide/show this section</span>{" "}
                        </label>{" "}
                      </div>{" "}
                    </details>
                  ) : null}{" "}
                  {sectionIsSwitchable ? (
                    <button
                      type="button"
                      className="rjsf-builder__section-toggle rjsf-builder__section-toggle--visibility"
                      onClick={() =>
                        onSectionVisibilityChange?.(
                          section.key,
                          !sectionIsVisibleBySwitch
                        )
                      }
                      disabled={!onSectionVisibilityChange}
                      title={
                        sectionIsVisibleBySwitch
                          ? "Hide section from output"
                          : "Show section in output"
                      }
                    >
                      {" "}
                      {sectionIsVisibleBySwitch
                        ? "Hide section"
                        : "Show section"}{" "}
                    </button>
                  ) : null}{" "}
                </div>{" "}
              </div>
            ) : null}{" "}
            {sectionIsVisibleBySwitch && !sectionIsCollapsed ? (
              section.columns && section.columns > 1 ? (
                <div
                  className={`rjsf-builder__columns${
                    snapToGrid ? " rjsf-builder__columns--snap" : ""
                  }`}
                  style={{
                    gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))`
                  }}
                >
                  {" "}
                  {Array.from({ length: section.columns }, (_, index) => {
                    const columnIndex = index + 1;
                    const laneItems = section.items.filter((item: any) => {
                      const explicit = Number.isFinite(
                        Number(item.sectionColumn)
                      )
                        ? clamp(
                            Math.floor(Number(item.sectionColumn)),
                            1,
                            section.columns as number
                          )
                        : undefined;
                      return (explicit || 1) === columnIndex;
                    });
                    const laneDropKey = `${section.key}::${columnIndex}`;
                    return (
                      <div
                        key={`${section.key}_col_${columnIndex}`}
                        className="rjsf-builder__column-lane"
                      >
                        {" "}
                        {showColumnLaneTitles ? (
                          <div className="rjsf-builder__column-title">
                            {" "}
                            Column {columnIndex}{" "}
                          </div>
                        ) : null}{" "}
                        <div
                          className={`rjsf-builder__column-content${
                            snapToGrid ? " rjsf-builder__grid--snap" : ""
                          }`}
                        >
                          {" "}
                          {laneItems.map((item: any) =>
                            renderPreviewItem(
                              item,
                              { key: section.key, title: section.title },
                              clamp(Math.floor(Number(item.span) || 12), 1, 12)
                            )
                          )}{" "}
                        </div>{" "}
                        {canAcceptPreviewDrop ? (
                          <div
                            className={`rjsf-builder__column-drop${
                              dragOverColumnKey === laneDropKey
                                ? " is-active"
                                : ""
                            }`}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setDragOverColumnKey(laneDropKey);
                              setDragOverSectionKey(null);
                              setDragOverKey(null);
                              setDragOverSlot(null);
                            }}
                            onDragLeave={() =>
                              setDragOverColumnKey((current) =>
                                current === laneDropKey ? null : current
                              )
                            }
                            onDrop={(event) => {
                              setDragOverColumnKey(null);
                              handleDropOnTarget(
                                event,
                                section.title || undefined,
                                undefined,
                                "after",
                                columnIndex
                              );
                            }}
                          >
                            {" "}
                            Drop here for column {columnIndex}{" "}
                          </div>
                        ) : null}{" "}
                      </div>
                    );
                  })}{" "}
                </div>
              ) : (
                <div
                  className={`rjsf-builder__grid${
                    snapToGrid ? " rjsf-builder__grid--snap" : ""
                  }`}
                >
                  {" "}
                  {section.items.map((item: any) =>
                    renderPreviewItem(
                      item,
                      { key: section.key, title: section.title },
                      clamp(Math.floor(Number(item.span) || 12), 1, 12)
                    )
                  )}{" "}
                </div>
              )
            ) : null}{" "}
            {!sectionIsVisibleBySwitch ? (
              <div className="rjsf-builder__section-off-note">
                {" "}
                Section hidden in viewer and final output.{" "}
              </div>
            ) : null}{" "}
            {sectionIsVisibleBySwitch &&
            !sectionIsCollapsed &&
            canAcceptPreviewDrop ? (
              <div
                className={`rjsf-builder__section-drop${
                  dragOverSectionKey === section.key ? " is-active" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverSectionKey(section.key);
                  setDragOverKey(null);
                  setDragOverSlot(null);
                }}
                onDragLeave={() =>
                  setDragOverSectionKey((current) =>
                    current === section.key ? null : current
                  )
                }
                onDrop={(event) =>
                  handleDropOnTarget(event, section.title || undefined)
                }
              >
                {" "}
                Drop here to append in this section{" "}
              </div>
            ) : null}{" "}
          </div>
        );
      })}{" "}
      {wizard && orderedSections.length > 1 ? (
        <div className="rjsf-builder__wizard-nav">
          {" "}
          <button
            type="button"
            className="rjsf-builder__button"
            disabled={wizardActiveIndex <= 0}
            onClick={() =>
              wizard.onNavigate?.(
                orderedSections[Math.max(0, wizardActiveIndex - 1)]?.key || null
              )
            }
          >
            {" "}
            &larr; Back{" "}
          </button>{" "}
          <div className="rjsf-builder__wizard-progress">
            {" "}
            <span>
              Section {wizardActiveIndex + 1} of {orderedSections.length}
            </span>{" "}
            <span className="rjsf-builder__wizard-progress-track">
              <span
                className="rjsf-builder__wizard-progress-fill"
                style={{
                  width: `${Math.round(
                    ((wizardActiveIndex + 1) / orderedSections.length) * 100
                  )}%`
                }}
              />
            </span>{" "}
            {wizardNextBlocked && wizardActiveStats ? (
              <span className="rjsf-builder__wizard-remaining">
                {wizardActiveStats.reqTotal - wizardActiveStats.reqDone}{" "}
                required left
              </span>
            ) : null}{" "}
          </div>{" "}
          {wizardActiveIndex < orderedSections.length - 1 ? (
            <button
              type="button"
              className="rjsf-builder__button rjsf-builder__button--primary"
              disabled={wizardNextBlocked}
              title={
                wizardNextBlocked
                  ? "Complete the required fields in this section to continue"
                  : undefined
              }
              onClick={() =>
                wizard.onNavigate?.(
                  orderedSections[
                    Math.min(orderedSections.length - 1, wizardActiveIndex + 1)
                  ]?.key || null
                )
              }
            >
              {" "}
              Next &rarr;{" "}
            </button>
          ) : (
            <span className="rjsf-builder__wizard-done">
              {wizardNextBlocked
                ? "Required fields remain in this section"
                : "End of form"}
            </span>
          )}{" "}
        </div>
      ) : null}{" "}
    </div>
  );
}
const FORM_TEMPLATES = {
  ObjectFieldTemplate: ObjectTemplate,
  ArrayFieldTemplate,
  ArrayFieldItemTemplate
} as any;
type SnippetTargetField = HTMLInputElement | HTMLTextAreaElement;
function isSnippetTargetField(node: unknown): node is SnippetTargetField {
  if (node instanceof HTMLTextAreaElement) {
    return !node.readOnly && !node.disabled;
  }
  if (node instanceof HTMLInputElement) {
    const type = (node.getAttribute("type") || "text").toLowerCase();
    return type === "text" && !node.readOnly && !node.disabled;
  }
  return false;
}
function insertSnippetIntoField(field: SnippetTargetField, text: string): void {
  const value = field.value || "";
  const start =
    typeof field.selectionStart === "number"
      ? field.selectionStart
      : value.length;
  const end =
    typeof field.selectionEnd === "number" ? field.selectionEnd : start;
  const before = value.slice(0, start);
  const needsSpace = before.length > 0 && !/\s$/.test(before);
  const inserted = (needsSpace ? " " : "") + text;
  const nextValue = before + inserted + value.slice(end);
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (setter) {
    setter.call(field, nextValue);
  } else {
    field.value = nextValue;
  }
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.focus();
  const caret = before.length + inserted.length;
  try {
    field.setSelectionRange(caret, caret);
  } catch (_error) {
    /* input types that reject selection ranges */
  }
}
interface SnippetsLayerProps {
  snippets: SnippetItem[];
  containerRef: { current: HTMLDivElement | null };
  onManage?: () => void;
}
interface RichTemplateEditorHandle {
  insertText: (text: string) => void;
}
interface RichTemplateEditorProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}
function templateValueToEditorHtml(value: string): string {
  const raw = value == null ? "" : String(value);
  if (!raw.trim()) {
    return "";
  }
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }
  return escapeHtml(raw).replace(/\r?\n/g, "<br />");
}
function editorHtmlToTemplateValue(html: string): string {
  const textOnly = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/<[^>]+>/g, "");
  return textOnly.trim() ? html : "";
}
const RICH_TEMPLATE_TOOLS: Array<{
  command: string;
  arg?: string;
  label: string;
  title: string;
  className?: string;
}> = [
  {
    command: "formatBlock",
    arg: "<h2>",
    label: "H",
    title: "Header",
    className: "is-h1"
  },
  {
    command: "formatBlock",
    arg: "<h3>",
    label: "h",
    title: "Subheader",
    className: "is-h2"
  },
  {
    command: "formatBlock",
    arg: "<p>",
    label: "¶",
    title: "Normal text"
  },
  { command: "bold", label: "B", title: "Bold (Ctrl+B)", className: "is-bold" },
  {
    command: "italic",
    label: "I",
    title: "Italic (Ctrl+I)",
    className: "is-italic"
  },
  {
    command: "underline",
    label: "U",
    title: "Underline (Ctrl+U)",
    className: "is-underline"
  },
  {
    command: "strikeThrough",
    label: "S",
    title: "Strikethrough",
    className: "is-strike"
  },
  { command: "insertUnorderedList", label: "• List", title: "Bulleted list" },
  { command: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { command: "removeFormat", label: "Tx", title: "Clear formatting" }
];
const RichTemplateEditor = forwardRef<
  RichTemplateEditorHandle,
  RichTemplateEditorProps
>(function RichTemplateEditor(props, ref): ReactElement {
  const { value, onChange, ariaLabel, placeholder } = props;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (lastEmittedRef.current !== null && value === lastEmittedRef.current) {
      return;
    }
    const html = templateValueToEditorHtml(value);
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
      savedRangeRef.current = null;
    }
    lastEmittedRef.current = value;
  }, [value]);
  const debounceTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  const emit = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    dirtyRef.current = false;
    const next = editorHtmlToTemplateValue(editor.innerHTML);
    if (next === lastEmittedRef.current) {
      return;
    }
    lastEmittedRef.current = next;
    onChange(next);
  }, [onChange]);
  /* Committing serializes and persists the whole definition (plus one undo
     snapshot), so typing commits on a pause instead of per keystroke.
     Toolbar actions and blur flush immediately. */
  const scheduleEmit = useCallback(() => {
    dirtyRef.current = true;
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      emit();
    }, 600);
  }, [emit]);
  useEffect(
    () => () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (dirtyRef.current) {
        emit();
      }
    },
    [emit]
  );
  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);
  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) {
      return;
    }
    const hasSelectionInEditor =
      selection.rangeCount > 0 &&
      editor.contains(selection.getRangeAt(0).commonAncestorContainer);
    if (hasSelectionInEditor) {
      return;
    }
    const range = savedRangeRef.current;
    selection.removeAllRanges();
    if (range && editor.contains(range.commonAncestorContainer)) {
      selection.addRange(range);
      return;
    }
    const endRange = document.createRange();
    endRange.selectNodeContents(editor);
    endRange.collapse(false);
    selection.addRange(endRange);
  }, []);
  const exec = useCallback(
    (command: string, arg?: string) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      restoreSelection();
      try {
        // prefer <b>/<i>/<u> tags over style spans in the stored template
        document.execCommand("styleWithCSS", false, "false");
        document.execCommand(command, false, arg);
      } catch (error) {
        // execCommand is best-effort; ignore unsupported commands
      }
      saveSelection();
      emit();
    },
    [emit, restoreSelection, saveSelection]
  );
  useImperativeHandle(
    ref,
    () => ({
      insertText: (text: string) => exec("insertText", text)
    }),
    [exec]
  );
  return (
    <div className="rjsf-builder__rich-editor">
      <div
        className="rjsf-builder__rich-toolbar"
        role="toolbar"
        aria-label="Text formatting"
      >
        {RICH_TEMPLATE_TOOLS.map((tool) => (
          <button
            key={`${tool.command}:${tool.arg || ""}`}
            type="button"
            className={`rjsf-builder__rich-tool${
              tool.className ? ` ${tool.className}` : ""
            }`}
            title={tool.title}
            aria-label={tool.title}
            onMouseDown={(event) => {
              // keep the editor selection alive while clicking the toolbar
              event.preventDefault();
            }}
            onClick={() => exec(tool.command, tool.arg)}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="rjsf-builder__rich-surface rjsf-builder__template-editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        data-placeholder={placeholder || ""}
        onInput={scheduleEmit}
        onBlur={() => {
          saveSelection();
          emit();
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
});
function SnippetsLayer(props: SnippetsLayerProps): ReactElement | null {
  const { snippets, containerRef, onManage } = props;
  const [field, setField] = useState<SnippetTargetField | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine" | "team">(
    "all"
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [, setPositionTick] = useState(0);
  const fieldRef = useRef<SnippetTargetField | null>(null);
  const openRef = useRef(false);
  const uiRootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const blurTimerRef = useRef<number | null>(null);
  fieldRef.current = field;
  openRef.current = open;
  const closePopover = useCallback((refocus: boolean) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    if (refocus && fieldRef.current) {
      fieldRef.current.focus();
    }
  }, []);
  const clearAll = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    setField(null);
  }, []);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const isInsideUi = (node: unknown): boolean => {
      const root = uiRootRef.current;
      return Boolean(root && node instanceof Node && root.contains(node));
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      const target = event.target;
      if (isInsideUi(target)) {
        return;
      }
      if (isSnippetTargetField(target)) {
        if (target !== fieldRef.current) {
          setOpen(false);
          setQuery("");
          setActiveIndex(0);
          setField(target);
        }
      } else if (!openRef.current) {
        setField(null);
      }
    };
    const handleFocusOut = () => {
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
      }
      blurTimerRef.current = window.setTimeout(() => {
        blurTimerRef.current = null;
        const active = document.activeElement;
        if (active === fieldRef.current || isInsideUi(active)) {
          return;
        }
        clearAll();
      }, 120);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target;
        if (
          isSnippetTargetField(target) &&
          !isInsideUi(target) &&
          (target.value || "") === ""
        ) {
          event.preventDefault();
          event.stopPropagation();
          setField(target);
          setQuery("");
          setActiveIndex(0);
          setOpen(true);
        }
      }
    };
    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);
    container.addEventListener("keydown", handleKeyDown, true);
    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
      container.removeEventListener("keydown", handleKeyDown, true);
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
    };
  }, [containerRef, clearAll]);
  useEffect(() => {
    if (!field) {
      return;
    }
    if (!field.isConnected) {
      clearAll();
      return;
    }
    const reposition = () => setPositionTick((tick) => tick + 1);
    // Close everything when the target field is removed from the DOM (for
    // example a sign/void flow swaps the form out). Container-level focusout
    // cannot catch this once focus lives inside the portaled popover.
    const observer = new MutationObserver(() => {
      const current = fieldRef.current;
      if (current && !current.isConnected) {
        clearAll();
      }
    });
    observer.observe(containerRef.current || document.body, {
      childList: true,
      subtree: true
    });
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [field, clearAll, containerRef]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const isInsideUi = (node: unknown): boolean => {
      const root = uiRootRef.current;
      return Boolean(root && node instanceof Node && root.contains(node));
    };
    const isTargetField = (node: unknown): boolean => {
      const target = fieldRef.current;
      return Boolean(
        target &&
          node instanceof Node &&
          (node === target || target.contains(node))
      );
    };
    // Close on any outside pointerdown while open; clicks inside the popover
    // (or on the trigger, which shares uiRootRef) are ignored.
    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (isInsideUi(target)) {
        return;
      }
      if (isTargetField(target)) {
        closePopover(false);
        return;
      }
      clearAll();
    };
    // Close when focus lands anywhere outside the popover and target field
    // (document-level: container focusout never fires once focus is portaled).
    const handleDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (isInsideUi(target) || isTargetField(target)) {
        return;
      }
      clearAll();
    };
    document.addEventListener("pointerdown", handleDocumentPointerDown, true);
    document.addEventListener("focusin", handleDocumentFocusIn, true);
    return () => {
      document.removeEventListener(
        "pointerdown",
        handleDocumentPointerDown,
        true
      );
      document.removeEventListener("focusin", handleDocumentFocusIn, true);
    };
  }, [open, closePopover, clearAll]);
  useEffect(() => {
    if (open) {
      const frame = window.requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [open]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return snippets.filter((snippet) => {
      const isMine = snippet.scope === "Personal";
      if (scopeFilter === "mine" && !isMine) {
        return false;
      }
      if (scopeFilter === "team" && isMine) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        snippet.name.toLowerCase().includes(term) ||
        snippet.text.toLowerCase().includes(term)
      );
    });
  }, [snippets, query, scopeFilter]);
  useEffect(() => {
    setActiveIndex((current) =>
      filtered.length ? Math.min(current, filtered.length - 1) : 0
    );
  }, [filtered.length]);
  const insertSnippet = useCallback(
    (snippet: SnippetItem) => {
      const target = fieldRef.current;
      if (!target || !target.isConnected) {
        clearAll();
        return;
      }
      insertSnippetIntoField(target, snippet.text);
      closePopover(false);
    },
    [clearAll, closePopover]
  );
  const handlePopoverKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closePopover(true);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) =>
          filtered.length ? Math.min(current + 1, filtered.length - 1) : 0
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        const snippet = filtered[activeIndex];
        if (snippet) {
          insertSnippet(snippet);
        }
      }
    },
    [filtered, activeIndex, insertSnippet, closePopover]
  );
  if (!snippets.length || !field || !field.isConnected) {
    return null;
  }
  const rect = field.getBoundingClientRect();
  const buttonStyle: CSSProperties = {
    position: "fixed",
    top: Math.round(rect.bottom + 4),
    left: Math.round(Math.max(rect.right - 96, rect.left)),
    zIndex: 9000
  };
  const popoverWidth = 340;
  const popoverLeft = Math.round(
    Math.min(
      Math.max(rect.left, 8),
      Math.max(window.innerWidth - popoverWidth - 8, 8)
    )
  );
  const popoverStyle: CSSProperties = {
    position: "fixed",
    top: Math.round(rect.bottom + 6),
    left: popoverLeft,
    width: popoverWidth,
    zIndex: 9001
  };
  return createPortal(
    <div ref={uiRootRef} className="rjsf-snippets__layer">
      {!open ? (
        <button
          type="button"
          className="rjsf-snippets__trigger"
          style={buttonStyle}
          tabIndex={-1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery("");
            setActiveIndex(0);
            setOpen(true);
          }}
          title="Insert snippet (type / in an empty field)"
        >
          <span aria-hidden="true" className="rjsf-snippets__bolt">
            ⚡
          </span>{" "}
          Snippets
        </button>
      ) : (
        <div
          className="rjsf-snippets__popover"
          style={popoverStyle}
          role="dialog"
          aria-label="Insert snippet"
          onKeyDown={handlePopoverKeyDown}
        >
          <input
            ref={searchRef}
            type="text"
            className="rjsf-snippets__search"
            name="rjsf-snippets-search"
            aria-label="Search snippets"
            placeholder="Search snippets…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
          />
          <div className="rjsf-snippets__pills">
            <button
              type="button"
              className={`rjsf-snippets__pill${
                scopeFilter === "mine" ? " is-active" : ""
              }`}
              onClick={() =>
                setScopeFilter((current) =>
                  current === "mine" ? "all" : "mine"
                )
              }
            >
              Mine
            </button>
            <button
              type="button"
              className={`rjsf-snippets__pill${
                scopeFilter === "team" ? " is-active" : ""
              }`}
              onClick={() =>
                setScopeFilter((current) =>
                  current === "team" ? "all" : "team"
                )
              }
            >
              Team
            </button>
          </div>
          <div className="rjsf-snippets__list" role="listbox">
            {filtered.length ? (
              filtered.map((snippet, index) => (
                <button
                  key={snippet.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`rjsf-snippets__item${
                    index === activeIndex ? " is-active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => insertSnippet(snippet)}
                >
                  <span className="rjsf-snippets__item-main">
                    <span className="rjsf-snippets__item-name">
                      {snippet.name}
                    </span>
                    <span className="rjsf-snippets__item-preview">
                      {snippet.text}
                    </span>
                  </span>
                  <span className="rjsf-snippets__item-scope">
                    {snippet.scope}
                  </span>
                </button>
              ))
            ) : (
              <div className="rjsf-snippets__empty">No snippets match.</div>
            )}
          </div>
          <div className="rjsf-snippets__footer">
            <span className="rjsf-snippets__hint">
              ↑↓ navigate · Enter insert · Esc close
            </span>
            {onManage ? (
              <button
                type="button"
                className="rjsf-snippets__manage"
                onClick={() => {
                  closePopover(false);
                  onManage();
                }}
              >
                Manage library
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
// Redesign step 5: widget-native toasts. Microflows keep writing
// 'text|success|timestamp' to the toast attribute, but the widget displays and
// clears it itself — no page-level JS relay, and timestamp dedupe kills the
// double-toast class. Type segment: success | error | info (default info).
interface WidgetToast {
  id: string;
  text: string;
  kind: "success" | "error" | "info";
}
function WidgetToasts({ attr }: { attr?: EditableValue<string> }): ReactElement | null {
  const [toasts, setToasts] = useState<WidgetToast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const raw = attr && attr.status === "available" ? clean(attr.value) : "";
  useEffect(() => {
    if (!raw) {
      return;
    }
    const parts = raw.split("|");
    const text = clean(parts[0]);
    const kindRaw = clean(parts[1]).toLowerCase();
    const stamp = clean(parts[2]) || raw;
    if (!text) {
      return;
    }
    const seenKey = `fsb-toast-${stamp}-${text}`;
    let alreadyShown = seenRef.current.has(seenKey);
    try {
      alreadyShown = alreadyShown || sessionStorage.getItem(seenKey) === "1";
      sessionStorage.setItem(seenKey, "1");
    } catch (_error) {
      // sessionStorage unavailable — ref dedupe still applies.
    }
    seenRef.current.add(seenKey);
    if (alreadyShown) {
      return;
    }
    const kind: WidgetToast["kind"] =
      kindRaw === "success" || kindRaw === "error" ? (kindRaw as WidgetToast["kind"]) : "info";
    const id = `${seenKey}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, text, kind }]);
    // Deliberately NOT clearing the attribute: writing back marks the context
    // object dirty and re-triggers change machinery (observed double-toast).
    // Timestamp dedupe (ref + sessionStorage) prevents any re-fire instead.
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [raw, attr]);
  if (!toasts.length) {
    return null;
  }
  return (
    <div className="rjsf-builder__toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rjsf-builder__toast rjsf-builder__toast--${toast.kind}`}
          onClick={() =>
            setToasts((current) => current.filter((t) => t.id !== toast.id))
          }
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
function SignatureImageView({
  attr
}: {
  attr: EditableValue<string>;
}): ReactElement {
  const raw = (attr.value ?? "").trim();
  // Typed-only signatures store no/short image data — render nothing so the
  // script-font name in .fs-pdf-sig-box stays the visible signature.
  if (raw.length <= 100) {
    return <Fragment />;
  }
  const src = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
  return (
    <img
      className="fs-sig-image"
      src={src}
      alt="Signature"
      style={{ maxHeight: 80, display: "block" }}
    />
  );
}

export default function FormStudioBuilder(
  props: FormStudioBuilderProps
): ReactElement {
  // Signature-image mode: the binding is fixed at design time, so this branch
  // never flips at runtime and the hook order below stays stable.
  if (props.signatureImageAttr) {
    return <SignatureImageView attr={props.signatureImageAttr} />;
  }
  const source = props.dataSource?.[0];
  // Per-widget-instance RJSF id prefix. The widget can be instantiated once
  // per ListView row; RJSF's default "root" prefix would then emit duplicate
  // DOM ids (#root_<fieldKey>) across instances, so id-based lookups
  // (jumpToNextRequired) could scroll/focus the wrong instance's field.
  const instanceIdPrefix = useMemo(
    () => `fsb${Math.random().toString(36).slice(2, 8)}_root`,
    []
  );
  const [definition, setDefinition] = useState<FormDefinition>(DEFAULT_FORM);
  const [formData, setFormData] = useState<JsonObject>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(
    null
  );
  const [draggingRepeatGroupFieldId, setDraggingRepeatGroupFieldId] = useState<
    string | null
  >(null);
  const [repeatGroupOrderDropTarget, setRepeatGroupOrderDropTarget] = useState<{
    targetId: string;
    placement: DropPlacement;
  } | null>(null);
  const [builderTab, setBuilderTab] = useState<BuilderTab>("designer");
  const [rightPanelTab, setRightPanelTab] =
    useState<RightPanelTab>("properties");
  const [paletteFilter, setPaletteFilter] = useState<string>("");
  const [jsonDefinitionDraft, setJsonDefinitionDraft] = useState<string>("");
  const [jsonDataDraft, setJsonDataDraft] = useState<string>("");
  const [jsonMessage, setJsonMessage] = useState<string>("");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState<boolean>(false);
  // Group key currently in view (viewer mode) — highlights the nav rail row.
  const [activeViewerSectionKey, setActiveViewerSectionKey] = useState<
    string | null
  >(null);
  // While a rail click's smooth scroll is in flight, observer callbacks fire
  // for every intermediate section; ignore them so the clicked row holds.
  const suppressActiveUntilRef = useRef<number>(0);
  const handleActiveSectionChange = useCallback((sectionKey: string) => {
    if (Date.now() < suppressActiveUntilRef.current) {
      return;
    }
    setActiveViewerSectionKey(sectionKey || null);
  }, []);
  const [rightPanelCollapsed, setRightPanelCollapsed] =
    useState<boolean>(false);
  // Responsive builder: the widget's own width drives layout adaptations
  // (viewport queries lie when the widget sits in a padded page column).
  // State-backed callback ref: viewer mode's first commits are placeholder
  // returns WITHOUT the ref, so a mount-once effect on a plain ref would
  // observe null forever. The state ref re-runs the effect when the real
  // root finally mounts.
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
  const [builderWidth, setBuilderWidth] = useState<number>(0);
  useEffect(() => {
    if (!rootNode || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (typeof width === "number" && width > 0) {
        setBuilderWidth(width);
      }
    });
    observer.observe(rootNode);
    return () => observer.disconnect();
  }, [rootNode]);
  const isNarrowBuilder = builderWidth > 0 && builderWidth < 1140;
  const isPhoneBuilder = builderWidth > 0 && builderWidth < 620;
  // Crossing into narrow: park both side panels as icon rails (they reopen as
  // overlays); crossing back to wide restores them. User toggles still work.
  const prevNarrowRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (builderWidth === 0 || prevNarrowRef.current === isNarrowBuilder) {
      return;
    }
    prevNarrowRef.current = isNarrowBuilder;
    setLeftPanelCollapsed(isNarrowBuilder);
    setRightPanelCollapsed(isNarrowBuilder);
  }, [builderWidth, isNarrowBuilder]);
  // Phone-width designer opens straight into Preview (test-fill works there);
  // one-shot so the user can still switch back to Designer deliberately.
  const phoneAutoPreviewRef = useRef<boolean>(false);
  const viewModeIsViewer = props.viewMode === "viewer";
  useEffect(() => {
    if (viewModeIsViewer || !isPhoneBuilder || phoneAutoPreviewRef.current) {
      return;
    }
    phoneAutoPreviewRef.current = true;
    setBuilderTab("preview");
  }, [isPhoneBuilder, viewModeIsViewer]);
  // Narrow toolbar: form settings live in a popover behind one button.
  const [formSettingsOpen, setFormSettingsOpen] = useState<boolean>(false);
  const formSettingsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!formSettingsOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!formSettingsRef.current?.contains(event.target as Node)) {
        setFormSettingsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [formSettingsOpen]);
  const [tokenPreviewMode, setTokenPreviewMode] = useState<"html" | "rendered">(
    "rendered"
  );
  const [documentPreviewMode, setDocumentPreviewMode] = useState<
    "html" | "rendered"
  >("rendered");
  const [documentTemplateTarget, setDocumentTemplateTarget] = useState<
    "header" | "footer"
  >("header");
  const [tokenHelpExpanded, setTokenHelpExpanded] = useState<boolean>(false);
  const [batteryLabelsDraft, setBatteryLabelsDraft] = useState<string>("");
  const [batteryExpanded, setBatteryExpanded] = useState<boolean>(false);
  const [showDatagridConfigModal, setShowDatagridConfigModal] =
    useState<boolean>(false);
  const [tokenPickerSource, setTokenPickerSource] =
    useState<TokenPickerSource>("form");
  const [tokenSearch, setTokenSearch] = useState<string>("");
  const [recentTemplateTokens, setRecentTemplateTokens] = useState<string[]>(
    []
  );
  const choiceDragIndexRef = useRef<number | null>(null);
  const [choiceDragOverIndex, setChoiceDragOverIndex] = useState<number | null>(
    null
  );
  const [choiceOptionsDraft, setChoiceOptionsDraft] = useState<
    ChoiceOptionDraft[]
  >([]);
  const [matrixRowsDraft, setMatrixRowsDraft] = useState<
    Array<{ id: string; key: string; label: string }>
  >([]);
  const [previewScrollToSectionKey, setPreviewScrollToSectionKey] = useState<
    string | null
  >(null);
  const [previewScrollRequest, setPreviewScrollRequest] = useState<number>(0);
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const undoStackRef = useRef<UndoSnapshot[]>([]);
  const definitionRef = useRef<FormDefinition>(DEFAULT_FORM);
  const formDataRef = useRef<JsonObject>({});
  const selectedIdRef = useRef<string | null>(null);
  const richTemplateEditorRef = useRef<RichTemplateEditorHandle | null>(null);
  const pdfHeaderTemplateTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pdfFooterTemplateTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const systemTemplateSlotRenderers = useMemo<Record<string, unknown>>(
    () => ({
      activeMedicationsDatagrid2: props.activeMedicationsDatagrid2,
      activeAllergiesDatagrid2: props.activeAllergiesDatagrid2,
      chartDiagnosisDatagrid2: props.chartDiagnosisDatagrid2,
      billingDiagnosisDatagrid2: props.billingDiagnosisDatagrid2,
      activeBillingCodesDatagrid2: props.activeBillingCodesDatagrid2,
      recentDrugTestDatagrid2: props.recentDrugTestDatagrid2
    }),
    [
      props.activeMedicationsDatagrid2,
      props.activeAllergiesDatagrid2,
      props.chartDiagnosisDatagrid2,
      props.billingDiagnosisDatagrid2,
      props.activeBillingCodesDatagrid2,
      props.recentDrugTestDatagrid2
    ]
  );
  const hasHydratedDefinitionRef = useRef<boolean>(false);
  const lastIncomingDefinitionValueRef = useRef<string>("");
  const lastIncomingTitleValueRef = useRef<string>("");
  const lastIncomingDescriptionValueRef = useRef<string>("");
  const lastIncomingFormDataValueRef = useRef<string>("");
  useEffect(() => {
    definitionRef.current = definition;
  }, [definition]);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    undoStackRef.current = undoStack;
  }, [undoStack]);
  useEffect(() => {
    if (!source?.formDefinitionAttr) {
      hasHydratedDefinitionRef.current = false;
      lastIncomingDefinitionValueRef.current = "";
      lastIncomingTitleValueRef.current = "";
      lastIncomingDescriptionValueRef.current = "";
      lastIncomingFormDataValueRef.current = "";
      setUndoStack([]);
      undoStackRef.current = [];
      return;
    }
    const formDefinitionAttr = source?.formDefinitionAttr;
    const formTitleAttr = source?.formTitleAttr;
    const formDescriptionAttr = source?.formDescriptionAttr;
    if (
      (formDefinitionAttr && formDefinitionAttr.status !== "available") ||
      (formTitleAttr && formTitleAttr.status !== "available") ||
      (formDescriptionAttr && formDescriptionAttr.status !== "available")
    ) {
      hasHydratedDefinitionRef.current = false;
      lastIncomingDefinitionValueRef.current = "";
      lastIncomingTitleValueRef.current = "";
      lastIncomingDescriptionValueRef.current = "";
      lastIncomingFormDataValueRef.current = "";
      setUndoStack([]);
      undoStackRef.current = [];
      return;
    }
    const incomingDefinitionValue = source?.formDefinitionAttr?.value || "";
    const incomingTitleValue = source?.formTitleAttr?.value || "";
    const incomingDescriptionValue = source?.formDescriptionAttr?.value || "";
    if (
      hasHydratedDefinitionRef.current &&
      incomingDefinitionValue === lastIncomingDefinitionValueRef.current &&
      incomingTitleValue === lastIncomingTitleValueRef.current &&
      incomingDescriptionValue === lastIncomingDescriptionValueRef.current
    ) {
      return;
    }
    const parsed = parseDefinition(source?.formDefinitionAttr?.value);
    const mappedTitle = source?.formTitleAttr?.value;
    const mappedDescription = source?.formDescriptionAttr?.value;
    const nextDefinition: FormDefinition = {
      ...parsed.value,
      title:
        mappedTitle != null && mappedTitle !== ""
          ? mappedTitle
          : parsed.value.title || DEFAULT_FORM.title,
      description:
        mappedDescription != null
          ? mappedDescription
          : parsed.value.description || ""
    };
    setDefinition(nextDefinition);
    const incomingFormData = parseFormData(source?.formDataAttr?.value);
    const hydratedData = sanitizeFormData(
      incomingFormData.value,
      nextDefinition
    );
    setFormData(hydratedData);
    lastIncomingFormDataValueRef.current = source?.formDataAttr?.value || "";
    if (incomingFormData.error) {
      setMessage(incomingFormData.error);
    }
    if (parsed.error) {
      setMessage(parsed.error);
    }
    setSelectedId((prev) =>
      prev && nextDefinition.components.some((item) => item.id === prev)
        ? prev
        : nextDefinition.components[0]?.id || null
    );
    lastIncomingDefinitionValueRef.current = incomingDefinitionValue;
    lastIncomingTitleValueRef.current = incomingTitleValue;
    lastIncomingDescriptionValueRef.current = incomingDescriptionValue;
    setUndoStack([]);
    undoStackRef.current = [];
    hasHydratedDefinitionRef.current = true;
  }, [
    source?.formDefinitionAttr,
    source?.formTitleAttr,
    source?.formDescriptionAttr,
    source?.formDefinitionAttr?.status,
    source?.formDefinitionAttr?.value,
    source?.formTitleAttr?.status,
    source?.formTitleAttr?.value,
    source?.formDescriptionAttr?.status,
    source?.formDescriptionAttr?.value,
    source?.formDataAttr?.value
  ]);
  useEffect(() => {
    if (!hasHydratedDefinitionRef.current) {
      return;
    }
    if (source?.formDataAttr && source.formDataAttr.status !== "available") {
      return;
    }
    const incomingDataValue = source?.formDataAttr?.value || "";
    if (incomingDataValue === lastIncomingFormDataValueRef.current) {
      return;
    }
    const parsed = parseFormData(source?.formDataAttr?.value);
    setFormData(sanitizeFormData(parsed.value, definitionRef.current));
    lastIncomingFormDataValueRef.current = incomingDataValue;
    if (parsed.error) {
      setMessage(parsed.error);
    }
  }, [
    source?.formDataAttr,
    source?.formDataAttr?.status,
    source?.formDataAttr?.value
  ]);
  const tokenContextFromJson = useMemo(
    () => parseTokenContextJson(source?.tokenContextJsonAttr?.value),
    [source?.tokenContextJsonAttr?.value]
  );
  const viewerSnippets = useMemo(
    () => {
      const fromDatasource = buildSnippetsFromDatasource(
        props.snippetsSource,
        props.snippetNameAttr,
        props.snippetTextAttr,
        props.snippetScopeAttr
      );
      if (fromDatasource) {
        return fromDatasource;
      }
      return parseSnippetsJson(source?.snippetsJsonAttr?.value);
    },
    [
      props.snippetsSource,
      props.snippetNameAttr,
      props.snippetTextAttr,
      props.snippetScopeAttr,
      source?.snippetsJsonAttr?.value
    ]
  );
  const viewerFillRef = useRef<HTMLDivElement | null>(null);
  const manageSnippetsAction = source?.onManageSnippets;
  const handleManageSnippets = useCallback(() => {
    if (manageSnippetsAction?.canExecute) {
      manageSnippetsAction.execute();
    }
  }, [manageSnippetsAction]);
  const tokenContextFromDatasource = useMemo(
    () =>
      buildTokenContextFromDatasource(
        props.tokenContextSource,
        props.tokenContextKeyAttr,
        props.tokenContextValueAttr
      ),
    [
      props.tokenContextSource,
      props.tokenContextKeyAttr,
      props.tokenContextValueAttr
    ]
  );
  const tokenContext = useMemo(
    () => ({ ...tokenContextFromJson, ...tokenContextFromDatasource }),
    [tokenContextFromJson, tokenContextFromDatasource]
  );
  const systemSectionHtmlBySlot = useMemo(
    () => renderSystemSectionDataToHtml(source?.systemSectionDataJsonAttr?.value),
    [source?.systemSectionDataJsonAttr?.value]
  );
  const tokenCatalog = useMemo(() => {
    // Datasource wins when configured; the JSON attribute is the deprecated
    // migration fallback (redesign step 1).
    const fromDatasource = buildTokenCatalogFromDatasource(
      props.tokenCatalogSource,
      props.tokenCatalogKeyAttr,
      props.tokenCatalogLabelAttr,
      props.tokenCatalogKindAttr,
      props.tokenCatalogFieldTypeAttr,
      props.tokenCatalogDefaultLabelAttr,
      props.tokenCatalogOptionsJsonAttr,
      props.tokenCatalogCanonicalAttr,
      props.tokenCatalogSourcePathAttr
    );
    if (fromDatasource) {
      return fromDatasource;
    }
    return parseTokenCatalog(source?.tokenCatalogSchemaJsonAttr?.value);
  }, [
    props.tokenCatalogSource,
    props.tokenCatalogKeyAttr,
    props.tokenCatalogLabelAttr,
    props.tokenCatalogKindAttr,
    props.tokenCatalogFieldTypeAttr,
    props.tokenCatalogDefaultLabelAttr,
    props.tokenCatalogOptionsJsonAttr,
    props.tokenCatalogCanonicalAttr,
    props.tokenCatalogSourcePathAttr,
    source?.tokenCatalogSchemaJsonAttr?.value
  ]);
  const tokenCatalogSchemaOptions = useMemo(
    () =>
      tokenCatalog
        .filter((token) => token.kind === "client" || token.kind === "doc")
        .map((token) => ({ key: token.key, label: token.label })),
    [tokenCatalog]
  );
  const catalogComputedOptions = useMemo(
    () =>
      tokenCatalog
        .filter((token) => token.kind === "computed")
        .map((token) => ({ key: token.key, label: token.label })),
    [tokenCatalog]
  );
  const sharedFieldCatalog = useMemo<SharedFieldCatalogEntry[]>(
    () =>
      tokenCatalog
        .filter(
          (token) =>
            token.kind === "sharedField" && token.fieldType && token.source
        )
        .map((token) => ({
          tokenKey: token.key,
          label: token.label,
          fieldType: token.fieldType,
          defaultLabel: token.defaultLabel,
          options: token.options,
          canonical: token.canonical,
          sourceCode: token.source!.templateCode,
          sourceKey: token.source!.fieldKey
        })),
    [tokenCatalog]
  );
  const clientFieldCatalog = useMemo<ClientFieldCatalogEntry[]>(
    () =>
      tokenCatalog
        .filter((token) => token.kind === "client")
        .map((token) => ({
          tokenKey: token.key,
          label: token.label,
          fieldType: token.fieldType,
          defaultLabel: token.defaultLabel
        })),
    [tokenCatalog]
  );
  const extraSystemTemplatesParsed = useMemo(
    () =>
      parseSystemTemplatesConfigJson(
        source?.systemTemplatesConfigJsonAttr?.value
      ),
    [source?.systemTemplatesConfigJsonAttr?.value]
  );
  // Module-level registry so the pure template-lookup helpers (used during
  // definition parsing/schema building) see model-defined templates too.
  setExtraSystemTemplates(
    extraSystemTemplatesParsed.templates,
    extraSystemTemplatesParsed.fingerprint
  );
  const tokenPrefillEnabled =
    props.viewMode === "viewer" &&
    source?.formDataAttr != null &&
    source.formDataAttr.readOnly !== true;
  const viewerFormData = useMemo(
    () =>
      tokenPrefillEnabled
        ? applyTokenPrefill(formData, definition, tokenContext)
        : formData,
    [tokenPrefillEnabled, formData, definition, tokenContext]
  );
  const prefilledKeys = useMemo(
    () =>
      tokenPrefillEnabled
        ? computePrefilledKeys(formData, viewerFormData, definition, tokenContext)
        : EMPTY_PREFILLED_KEYS,
    [tokenPrefillEnabled, formData, viewerFormData, definition, tokenContext]
  );
  useEffect(() => {
    if (builderTab === "json") {
      return;
    }
    setJsonDefinitionDraft(JSON.stringify(definition, null, 2));
    setJsonDataDraft(JSON.stringify(formData, null, 2));
  }, [builderTab, definition, formData]);
  const persist = useCallback(
    (
      rawNextDefinition: FormDefinition,
      nextData: JsonObject,
      triggerChange: boolean
    ) => {
      // Stable section ids are assigned by the DESIGNER save path only —
      // viewer saves persist answers and must not rewrite legacy
      // definitions onto id-based section keys mid-session.
      const nextDefinition =
        props.viewMode === "viewer"
          ? rawNextDefinition
          : ensureSectionIds(rawNextDefinition);
      const sanitizedData = sanitizeFormData(nextData, nextDefinition);
      setDefinition(nextDefinition);
      setFormData(sanitizedData);
      if (
        !hasHydratedDefinitionRef.current ||
        source?.formDefinitionAttr?.status !== "available"
      ) {
        return;
      }
      const nextDefinitionJson = serializeDefinitionWithManifest(nextDefinition);
      writeAttribute(source?.formDefinitionAttr, nextDefinitionJson);
      const rawTitle =
        nextDefinition.title == null ? "" : String(nextDefinition.title);
      const nextTitleValue = rawTitle.trim()
        ? rawTitle
        : String(DEFAULT_FORM.title || "Untitled Form");
      writeAttribute(source?.formTitleAttr, nextTitleValue);
      const nextDescriptionValue =
        nextDefinition.description == null
          ? ""
          : String(nextDefinition.description);
      writeAttribute(source?.formDescriptionAttr, nextDescriptionValue);
      // Record what we just wrote so the hydration effect recognizes the
      // Mendix prop echo as our own write — otherwise it re-hydrates and
      // clears the undo stack on every edit. Only for attributes that are
      // actually wired: writeAttribute no-ops on missing ones, so their
      // echo keeps the previous value.
      if (source?.formDefinitionAttr) {
        lastIncomingDefinitionValueRef.current = nextDefinitionJson;
      }
      if (source?.formTitleAttr) {
        lastIncomingTitleValueRef.current = nextTitleValue;
      }
      if (source?.formDescriptionAttr) {
        lastIncomingDescriptionValueRef.current = nextDescriptionValue;
      }
      if (!triggerChange) {
        const outputArtifacts = buildResolvedOutputArtifacts(
          nextDefinition,
          sanitizedData,
          tokenContext,
          systemSectionHtmlBySlot
        );
        writeAttribute(
          source?.resolvedOutputHtmlAttr,
          outputArtifacts.bodyHtml
        );
        writeAttribute(source?.resolvedPdfHtmlAttr, outputArtifacts.pdfHtml);
      }
      const nextDataJson = JSON.stringify(
        assertAnswersShape(sanitizedData),
        null,
        2
      );
      writeAttribute(source?.formDataAttr, nextDataJson);
      if (source?.formDataAttr) {
        lastIncomingFormDataValueRef.current = nextDataJson;
      }
      if (triggerChange) {
        runAction(source?.onChangeAction);
      }
    },
    [
      source?.formDefinitionAttr,
      source?.formTitleAttr,
      source?.formDescriptionAttr,
      source?.resolvedOutputHtmlAttr,
      source?.resolvedPdfHtmlAttr,
      source?.formDataAttr,
      source?.onChangeAction,
      tokenContext,
      systemSectionHtmlBySlot,
      props.viewMode
    ]
  );
  const persistDataOnly = useCallback(
    (nextData: JsonObject, triggerChange: boolean) => {
      const sanitizedData = sanitizeFormData(nextData, definitionRef.current);
      setFormData(sanitizedData);
      if (
        !hasHydratedDefinitionRef.current ||
        source?.formDefinitionAttr?.status !== "available"
      ) {
        return;
      }
      const nextDataJson = JSON.stringify(
        assertAnswersShape(sanitizedData),
        null,
        2
      );
      writeAttribute(source?.formDataAttr, nextDataJson);
      if (source?.formDataAttr) {
        lastIncomingFormDataValueRef.current = nextDataJson;
      }
      if (triggerChange) {
        runAction(source?.onChangeAction);
      }
    },
    [
      source?.formDataAttr,
      source?.formDefinitionAttr?.status,
      source?.onChangeAction
    ]
  );
  const pushUndoSnapshot = useCallback(
    (
      definitionSnapshot: FormDefinition,
      formDataSnapshot: JsonObject,
      selectedSnapshot: string | null
    ) => {
      setUndoStack((previous) => {
        const next = [
          ...previous,
          {
            definition: cloneFormDefinition(definitionSnapshot),
            formData: cloneFormData(formDataSnapshot),
            selectedId: selectedSnapshot
          }
        ];
        const capped =
          next.length > UNDO_STACK_LIMIT
            ? next.slice(next.length - UNDO_STACK_LIMIT)
            : next;
        undoStackRef.current = capped;
        return capped;
      });
    },
    []
  );
  const updateDefinition = useCallback(
    (updater: (current: FormDefinition) => FormDefinition) => {
      if (!hasHydratedDefinitionRef.current) {
        return;
      }
      const currentDefinition = definitionRef.current;
      const nextDefinition = updater(currentDefinition);
      if (nextDefinition === currentDefinition) {
        return;
      }
      pushUndoSnapshot(
        currentDefinition,
        formDataRef.current,
        selectedIdRef.current
      );
      persist(nextDefinition, formDataRef.current, true);
    },
    [persist, pushUndoSnapshot]
  );
  const updateFormData = useCallback(
    (nextData: JsonObject) => {
      if (!hasHydratedDefinitionRef.current) {
        return;
      }
      const currentSectionVisibility = parseSectionVisibilityMap(
        formDataRef.current[SECTION_VISIBILITY_DATA_KEY]
      );
      const nextDataWithSectionVisibility: JsonObject = { ...nextData };
      if (
        !Object.prototype.hasOwnProperty.call(
          nextDataWithSectionVisibility,
          SECTION_VISIBILITY_DATA_KEY
        ) &&
        Object.keys(currentSectionVisibility).length
      ) {
        nextDataWithSectionVisibility[SECTION_VISIBILITY_DATA_KEY] =
          currentSectionVisibility;
      }
      const sanitizedNext = sanitizeFormData(
        nextDataWithSectionVisibility,
        definitionRef.current
      );
      const sanitizedCurrent = sanitizeFormData(
        formDataRef.current,
        definitionRef.current
      );
      if (JSON.stringify(sanitizedNext) === JSON.stringify(sanitizedCurrent)) {
        return;
      }
      persistDataOnly(sanitizedNext, true);
    },
    [persistDataOnly]
  );
  const selectedComponent = useMemo(
    () =>
      definition.components.find((component) => component.id === selectedId) ||
      null,
    [definition.components, selectedId]
  );
  const selectedIndex = useMemo(
    () =>
      selectedComponent
        ? definition.components.findIndex(
            (component) => component.id === selectedComponent.id
          )
        : -1,
    [definition.components, selectedComponent]
  );
  const selectedComponentSharedEntry = useMemo(() => {
    const sharedRef = clean(selectedComponent?.sharedFieldRef);
    if (!sharedRef) {
      return undefined;
    }
    return sharedFieldCatalog.find((entry) => entry.tokenKey === sharedRef);
  }, [selectedComponent, sharedFieldCatalog]);
  const selectedRepeatGroupKey = clean(selectedComponent?.repeatGroup?.key);
  const selectedRepeatGroupComponents = useMemo(
    () =>
      selectedRepeatGroupKey
        ? definition.components.filter(
            (component) =>
              clean(component.repeatGroup?.key) === selectedRepeatGroupKey
          )
        : [],
    [definition.components, selectedRepeatGroupKey]
  );
  const isPropertiesTab = rightPanelTab === "properties";
  const isDocumentOutputTab = rightPanelTab === "documentOutput";
  const isValidationTab = rightPanelTab === "validation";
  useEffect(() => {
    if (
      selectedComponent &&
      (selectedComponent.type === "select" ||
        selectedComponent.type === "radio" ||
        selectedComponent.type === "matrix")
    ) {
      setChoiceOptionsDraft(buildChoiceOptionDrafts(selectedComponent));
    } else {
      setChoiceOptionsDraft([]);
    }
    if (selectedComponent && selectedComponent.type === "matrix") {
      setMatrixRowsDraft(
        getMatrixRows(selectedComponent).map((row) => ({
          id: makeId("mrow"),
          key: row.key,
          label: row.label
        }))
      );
    } else {
      setMatrixRowsDraft([]);
    }
  }, [selectedComponent]);
  useEffect(() => {
    setTokenHelpExpanded(false);
  }, [selectedComponent?.id]);
  useEffect(() => {
    setTokenSearch("");
    setTokenPickerSource("form");
    setRightPanelTab("properties");
  }, [selectedComponent?.id]);
  useEffect(() => {
    setDraggingRepeatGroupFieldId(null);
    setRepeatGroupOrderDropTarget(null);
  }, [selectedRepeatGroupKey]);
  useEffect(() => {
    if (!showDatagridConfigModal) {
      return;
    }
    if (!selectedComponent || selectedComponent.type !== "datagrid") {
      setShowDatagridConfigModal(false);
    }
  }, [selectedComponent, showDatagridConfigModal]);
  useEffect(() => {
    if (!showDatagridConfigModal) {
      return;
    }
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setShowDatagridConfigModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showDatagridConfigModal]);
  const totalSourceCandidates = useMemo(
    () =>
      !selectedComponent || selectedComponent.type !== "total"
        ? []
        : definition.components.filter(
            (component) =>
              component.id !== selectedComponent.id &&
              !component.repeatGroup &&
              component.type !== "total" &&
              isSummableFieldType(component.type)
          ),
    [definition.components, selectedComponent]
  );
  const selectedDataGridColumns = useMemo(() => {
    if (!selectedComponent || selectedComponent.type !== "datagrid") {
      return [] as DataGridColumn[];
    }
    return (
      normalizeDataGridColumns(selectedComponent.datagridColumns) ||
      createDefaultDataGridColumns(selectedComponent.key)
    );
  }, [selectedComponent]);
  const formTokenOptions = useMemo(() => {
    const options: TokenPickerOption[] = [
      { key: "formtitle", label: "Form title" },
      { key: "form_title", label: "Form title" },
      { key: "formdescription", label: "Form description" },
      { key: "form_description", label: "Form description" }
    ];
    definition.components.forEach((component) => {
      if (
        component.type === "systemDatagrid2" ||
        component.type === "contentBlock"
      ) {
        return;
      }
      const componentLabel = clean(component.label) || component.key;
      options.push({ key: component.key, label: componentLabel });
      options.push({
        key: `${component.key}_label`,
        label: `${componentLabel} label`
      });
      if (component.type === "matrix") {
        getMatrixRows(component).forEach((row) => {
          const rowLabel = clean(row.label) || row.key;
          options.push({
            key: `${component.key}_${row.key}`,
            label: `${componentLabel} / ${rowLabel}`
          });
          options.push({
            key: `${component.key}_${row.key}_label`,
            label: `${componentLabel} / ${rowLabel} label`
          });
        });
      }
      if (component.type === "datagrid") {
        options.push({
          key: `${component.key}_count`,
          label: `${componentLabel} row count`
        });
        const columns =
          normalizeDataGridColumns(component.datagridColumns) ||
          createDefaultDataGridColumns(component.key);
        columns.forEach((column) => {
          const columnLabel = clean(column.label) || column.key;
          options.push({
            key: `${component.key}_${column.key}`,
            label: `${componentLabel} / ${columnLabel}`
          });
          options.push({
            key: `${component.key}_${column.key}_label`,
            label: `${componentLabel} / ${columnLabel} label`
          });
        });
      }
    });
    return dedupeTokenOptions(options);
  }, [definition.components]);
  const clientTokenOptions = useMemo(
    () =>
      dedupeTokenOptions([
        ...tokenCatalogSchemaOptions,
        ...Object.keys(tokenContext).map((key) => ({
          key,
          label: humanizeTokenKey(key)
        }))
      ]),
    [tokenCatalogSchemaOptions, tokenContext]
  );
  const computedTokenOptions = useMemo(
    () =>
      dedupeTokenOptions(
        catalogComputedOptions.length
          ? catalogComputedOptions
          : [
              { key: "sys.date", label: "Current date" },
              { key: "sys.time", label: "Current time" },
              { key: "sys.datetime", label: "Current date/time" }
            ]
      ),
    [catalogComputedOptions]
  );
  const activeTokenOptions = useMemo(
    () =>
      tokenPickerSource === "client"
        ? clientTokenOptions
        : tokenPickerSource === "computed"
        ? computedTokenOptions
        : formTokenOptions,
    [
      clientTokenOptions,
      computedTokenOptions,
      formTokenOptions,
      tokenPickerSource
    ]
  );
  const filteredTokenOptions = useMemo(
    () => filterTokenOptions(activeTokenOptions, tokenSearch),
    [activeTokenOptions, tokenSearch]
  );
  const recentTokenOptions = useMemo(() => {
    if (!recentTemplateTokens.length) {
      return [] as TokenPickerOption[];
    }
    const optionMap = new Map(
      [...formTokenOptions, ...clientTokenOptions, ...computedTokenOptions].map(
        (option) => [option.key.toLowerCase(), option]
      )
    );
    return recentTemplateTokens
      .map((key) => optionMap.get(key.toLowerCase()) || { key, label: key })
      .slice(0, 5);
  }, [
    clientTokenOptions,
    computedTokenOptions,
    formTokenOptions,
    recentTemplateTokens
  ]);
  const insertTemplateToken = useCallback(
    (tokenKey: string) => {
      const normalizedTokenKey = clean(tokenKey);
      if (
        !normalizedTokenKey ||
        !selectedComponent ||
        selectedComponent.type === "systemDatagrid2"
      ) {
        return;
      }
      const tokenText = `{${normalizedTokenKey}}`;
      richTemplateEditorRef.current?.insertText(tokenText);
      setRecentTemplateTokens((current) => {
        const next = [
          normalizedTokenKey,
          ...current.filter((item) => item !== normalizedTokenKey)
        ];
        return next.slice(0, 5);
      });
    },
    [selectedComponent]
  );
  const onPickToken = useCallback(
    (tokenKey: string) => {
      insertTemplateToken(tokenKey);
      setTokenSearch("");
    },
    [insertTemplateToken]
  );
  const formPdfHeaderTemplateValue = useMemo(
    () => str(definition.pdfHeaderTemplate),
    [definition.pdfHeaderTemplate]
  );
  const formPdfFooterTemplateValue = useMemo(
    () => str(definition.pdfFooterTemplate),
    [definition.pdfFooterTemplate]
  );
  const insertDocumentTemplateToken = useCallback(
    (tokenKey: string) => {
      const normalizedTokenKey = clean(tokenKey);
      if (!normalizedTokenKey) {
        return;
      }
      const tokenText = `{${normalizedTokenKey}}`;
      const isFooterTarget = documentTemplateTarget === "footer";
      const textarea = isFooterTarget
        ? pdfFooterTemplateTextareaRef.current
        : pdfHeaderTemplateTextareaRef.current;
      const currentTemplate = isFooterTarget
        ? formPdfFooterTemplateValue
        : formPdfHeaderTemplateValue;
      const selectionStart = textarea?.selectionStart;
      const selectionEnd = textarea?.selectionEnd;
      const start =
        typeof selectionStart === "number"
          ? clamp(selectionStart, 0, currentTemplate.length)
          : currentTemplate.length;
      const end =
        typeof selectionEnd === "number"
          ? clamp(selectionEnd, start, currentTemplate.length)
          : start;
      const nextTemplate = `${currentTemplate.slice(
        0,
        start
      )}${tokenText}${currentTemplate.slice(end)}`;
      const nextCaretPosition = start + tokenText.length;
      updateDefinition((current) => ({
        ...current,
        pdfHeaderTemplate: isFooterTarget
          ? current.pdfHeaderTemplate
          : nextTemplate,
        pdfFooterTemplate: isFooterTarget
          ? nextTemplate
          : current.pdfFooterTemplate
      }));
      window.setTimeout(() => {
        const nextTextarea = isFooterTarget
          ? pdfFooterTemplateTextareaRef.current
          : pdfHeaderTemplateTextareaRef.current;
        if (!nextTextarea) {
          return;
        }
        nextTextarea.focus();
        nextTextarea.setSelectionRange(nextCaretPosition, nextCaretPosition);
      }, 0);
      setRecentTemplateTokens((current) => {
        const next = [
          normalizedTokenKey,
          ...current.filter((item) => item !== normalizedTokenKey)
        ];
        return next.slice(0, 5);
      });
    },
    [
      documentTemplateTarget,
      formPdfFooterTemplateValue,
      formPdfHeaderTemplateValue,
      updateDefinition
    ]
  );
  const onPickDocumentTemplateToken = useCallback(
    (tokenKey: string) => {
      insertDocumentTemplateToken(tokenKey);
      setTokenSearch("");
    },
    [insertDocumentTemplateToken]
  );
  const selectedComponentTemplateValue = useMemo(
    () =>
      selectedComponent
        ? getEffectiveDocumentOutputTemplate(selectedComponent)
        : "",
    [selectedComponent]
  );
  const selectedComponentTokenPreview = useMemo(() => {
    if (!selectedComponent) {
      return {
        outputHtml: "",
        tokenRows: [] as Array<{ key: string; value: string }>
      };
    }
    const template = selectedComponentTemplateValue;
    if (!template) {
      return {
        outputHtml: "",
        tokenRows: [] as Array<{ key: string; value: string }>
      };
    }
    if (selectedComponent.type === "systemDatagrid2") {
      return { outputHtml: "", tokenRows: [] };
    }
    const tokenValues = buildTokenScope(definition, formData, tokenContext);
    if (selectedComponent.type === "datagrid") {
      const rows =
        sanitizeDataGridRows(
          formData[selectedComponent.key],
          selectedComponent
        ) || [];
      const firstRow = rows[0];
      if (firstRow) {
        addToken(tokenValues, "rowindex", 0);
        addToken(tokenValues, "row_number", 1);
        const rowIdKey = clean(selectedComponent.datagridRowIdKey);
        if (rowIdKey) {
          addToken(tokenValues, rowIdKey, firstRow[rowIdKey]);
        }
        selectedDataGridColumns.forEach((column) => {
          addToken(tokenValues, column.key, firstRow[column.key]);
          addToken(
            tokenValues,
            `${column.key}_label`,
            stripTrailingColon(column.label || column.key)
          );
          addToken(
            tokenValues,
            `${selectedComponent.key}_${column.key}`,
            firstRow[column.key]
          );
        });
      }
    }
    const tokenRows = extractTemplateTokens(template).map((key) => ({
      key,
      value: resolveTokenValue(key, tokenValues)
    }));
    const outputHtml =
      selectedComponent.type === "datagrid"
        ? resolveDataGridTemplateHtml(
            selectedComponent,
            template,
            formData,
            tokenValues
          )
        : asHtmlSnippet(replaceOutputTokens(template, tokenValues));
    return { outputHtml, tokenRows };
  }, [
    selectedComponent,
    selectedComponentTemplateValue,
    definition,
    formData,
    tokenContext,
    selectedDataGridColumns
  ]);
  const finalDocumentOutputHtml = useMemo(
    () =>
      buildResolvedOutputArtifacts(
        definition,
        formData,
        tokenContext,
        systemSectionHtmlBySlot
      ).pdfHtml,
    [definition, formData, tokenContext, systemSectionHtmlBySlot]
  );
  const documentPreviewBodyHtml = useMemo(
    () =>
      buildResolvedOutputArtifacts(
        definition,
        formData,
        tokenContext,
        systemSectionHtmlBySlot
      ).bodyHtml,
    [definition, formData, tokenContext, systemSectionHtmlBySlot]
  );
  const documentOutputWorkspace = (
    <div className="rjsf-builder__document-output-layout">
      {" "}
      <div className="rjsf-builder__document-output-config">
        {" "}
        <div className="rjsf-builder__block">
          {" "}
          <div className="rjsf-builder__subtitle">
            {" "}
            PDF header and footer templates{" "}
          </div>{" "}
          <div className="rjsf-builder__help">
            {" "}
            These templates wrap the full print-ready document. Click into the
            header or footer editor, then use the token picker to insert form,
            client, or computed tokens.{" "}
          </div>{" "}
          <div className="rjsf-builder__token-picker-toolbar">
            {" "}
            <label className="rjsf-builder__field">
              {" "}
              <span>Token source</span>{" "}
              <select
                className="rjsf-builder__select"
                value={tokenPickerSource}
                onChange={(event) =>
                  setTokenPickerSource(
                    event.target.value === "client"
                      ? "client"
                      : event.target.value === "computed"
                      ? "computed"
                      : "form"
                  )
                }
              >
                {" "}
                <option value="form">Form Data</option>{" "}
                <option value="client">Client Data</option>{" "}
                <option value="computed">Computed tokens</option>{" "}
              </select>{" "}
            </label>{" "}
            <label className="rjsf-builder__field">
              {" "}
              <span>Search token</span>{" "}
              <input
                className="rjsf-builder__input"
                placeholder="Search token..."
                value={tokenSearch}
                onChange={(event) => setTokenSearch(event.target.value)}
              />{" "}
            </label>{" "}
          </div>{" "}
          <div className="rjsf-builder__help">
            {" "}
            Token syntax matches field templates: <code>{`{token_key}`}</code>,{" "}
            <code>{`{%token_key%}`}</code>, and <code>{`{!token_key!}`}</code>{" "}
            for raw HTML.{" "}
          </div>{" "}
          {recentTokenOptions.length ? (
            <div className="rjsf-builder__token-picker-recents">
              {" "}
              {recentTokenOptions.map((option) => (
                <button
                  key={`document-recent-token-${option.key}`}
                  type="button"
                  className="rjsf-builder__token-chip"
                  onClick={() => onPickDocumentTemplateToken(option.key)}
                  title={`Insert {${option.key}}`}
                >
                  {" "}
                  <code>{`{${option.key}}`}</code>{" "}
                </button>
              ))}{" "}
            </div>
          ) : null}{" "}
          <div className="rjsf-builder__token-picker-results">
            {" "}
            {filteredTokenOptions.length ? (
              filteredTokenOptions.map((option) => (
                <button
                  key={`document-token-${option.key}`}
                  type="button"
                  className="rjsf-builder__token-picker-item"
                  onClick={() => onPickDocumentTemplateToken(option.key)}
                  title={`Insert {${option.key}}`}
                >
                  {" "}
                  <span>
                    {option.label}
                  </span> <code>{`{${option.key}}`}</code>{" "}
                </button>
              ))
            ) : (
              <div className="rjsf-builder__token-picker-empty">
                {tokenPickerSource === "client"
                  ? "No client tokens available."
                  : tokenPickerSource === "computed"
                  ? "No computed tokens available."
                  : "No matching form tokens."}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="rjsf-builder__block rjsf-builder__document-output-editors">
          {" "}
          <label className="rjsf-builder__field">
            {" "}
            <span className="rjsf-builder__field-label-row">
              {" "}
              <span>PDF header template</span>{" "}
              <button
                type="button"
                className="rjsf-builder__button rjsf-builder__button--small"
                disabled={!hasExplicitPdfHeaderTemplate(definition)}
                onClick={() =>
                  updateDefinition((current) => ({
                    ...current,
                    pdfHeaderTemplate: undefined
                  }))
                }
              >
                {" "}
                Reset{" "}
              </button>{" "}
            </span>{" "}
            <textarea
              ref={pdfHeaderTemplateTextareaRef}
              className="rjsf-builder__input rjsf-builder__input--multiline rjsf-builder__template-editor"
              value={formPdfHeaderTemplateValue}
              placeholder="Optional HTML/text inserted below the form title block."
              onFocus={() => setDocumentTemplateTarget("header")}
              onChange={(event) =>
                updateDefinition((current) => ({
                  ...current,
                  pdfHeaderTemplate: event.target.value
                }))
              }
            />{" "}
          </label>{" "}
          <label className="rjsf-builder__toggle">
            {" "}
            <input
              type="checkbox"
              checked={Boolean(definition.hidePdfHeaderIfEmpty)}
              onChange={(event) =>
                updateDefinition((current) => ({
                  ...current,
                  hidePdfHeaderIfEmpty: event.target.checked
                }))
              }
            />{" "}
            <span>Hide PDF header if empty</span>{" "}
          </label>{" "}
          <label className="rjsf-builder__field">
            {" "}
            <span className="rjsf-builder__field-label-row">
              {" "}
              <span>PDF footer template</span>{" "}
              <button
                type="button"
                className="rjsf-builder__button rjsf-builder__button--small"
                disabled={!hasExplicitPdfFooterTemplate(definition)}
                onClick={() =>
                  updateDefinition((current) => ({
                    ...current,
                    pdfFooterTemplate: undefined
                  }))
                }
              >
                {" "}
                Reset{" "}
              </button>{" "}
            </span>{" "}
            <textarea
              ref={pdfFooterTemplateTextareaRef}
              className="rjsf-builder__input rjsf-builder__input--multiline rjsf-builder__template-editor"
              value={formPdfFooterTemplateValue}
              placeholder="Optional HTML/text inserted after the form body."
              onFocus={() => setDocumentTemplateTarget("footer")}
              onChange={(event) =>
                updateDefinition((current) => ({
                  ...current,
                  pdfFooterTemplate: event.target.value
                }))
              }
            />{" "}
          </label>{" "}
          <label className="rjsf-builder__toggle">
            {" "}
            <input
              type="checkbox"
              checked={Boolean(definition.hidePdfFooterIfEmpty)}
              onChange={(event) =>
                updateDefinition((current) => ({
                  ...current,
                  hidePdfFooterIfEmpty: event.target.checked
                }))
              }
            />{" "}
            <span>Hide PDF footer if empty</span>{" "}
          </label>{" "}
          <label className="rjsf-builder__toggle">
            {" "}
            <input
              type="checkbox"
              checked={Boolean(definition.hidePdfTitleBlock)}
              onChange={(event) =>
                updateDefinition((current) => ({
                  ...current,
                  hidePdfTitleBlock: event.target.checked
                }))
              }
            />{" "}
            <span>Hide form title and description</span>{" "}
          </label>{" "}
        </div>{" "}
      </div>{" "}
      <div className="rjsf-builder__document-output-preview">
        {" "}
        <div className="rjsf-builder__token-preview">
          {" "}
          <div className="rjsf-builder__token-preview-title">
            {" "}
            Final PDF HTML preview{" "}
          </div>{" "}
          <div className="rjsf-builder__help">
            {" "}
            Uses the current form data, document output templates, PDF
            header/footer templates, section visibility, system section HTML
            snippets, and runtime tokens. This is the same print-ready HTML
            written to <code>resolvedPdfHtmlAttr</code>.{" "}
          </div>{" "}
          {finalDocumentOutputHtml ? (
            <div className="rjsf-builder__token-preview-body">
              {" "}
              <div className="rjsf-builder__token-preview-tabs">
                {" "}
                <button
                  type="button"
                  className={`rjsf-builder__button rjsf-builder__button--small rjsf-builder__token-preview-tab${
                    documentPreviewMode === "rendered" ? " is-active" : ""
                  }`}
                  onClick={() => setDocumentPreviewMode("rendered")}
                >
                  {" "}
                  Rendered{" "}
                </button>{" "}
                <button
                  type="button"
                  className={`rjsf-builder__button rjsf-builder__button--small rjsf-builder__token-preview-tab${
                    documentPreviewMode === "html" ? " is-active" : ""
                  }`}
                  onClick={() => setDocumentPreviewMode("html")}
                >
                  {" "}
                  HTML{" "}
                </button>{" "}
              </div>{" "}
              {documentPreviewMode === "rendered" ? (
                <iframe
                  title="Final PDF document preview"
                  className="rjsf-builder__token-preview-frame"
                  srcDoc={finalDocumentOutputHtml}
                />
              ) : (
                <label className="rjsf-builder__field">
                  {" "}
                  <span>Print-ready HTML document</span>{" "}
                  <textarea
                    className="rjsf-builder__input rjsf-builder__input--multiline rjsf-builder__token-preview-output"
                    value={finalDocumentOutputHtml}
                    readOnly
                  />{" "}
                </label>
              )}{" "}
            </div>
          ) : (
            <div className="rjsf-builder__help">
              {" "}
              No printable document output yet. Add document output templates,
              PDF header/footer templates, system section HTML, or fill values
              to preview the assembled PDF document HTML.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
  const sectionCount = useMemo(
    () =>
      new Set(
        definition.components
          .map((component) => normalizeSectionName(component.section))
          .filter((section): section is string => Boolean(section))
      ).size,
    [definition.components]
  );
  const requiredCount = useMemo(
    () =>
      definition.components.reduce(
        (count, component) => (component.required ? count + 1 : count),
        0
      ),
    [definition.components]
  );
  const componentsByKey = useMemo(
    () =>
      new Map(
        definition.components.map((component) => [component.key, component])
      ),
    [definition.components]
  );
  const sectionSwitchableByKey = useMemo(
    () => buildSectionSwitchableMap(definition),
    [definition]
  );
  const sectionVisibilityByKey = useMemo(
    () =>
      applySectionVisibilityLegacyFallback(
        parseSectionVisibilityMap(formData[SECTION_VISIBILITY_DATA_KEY]),
        definition.components
      ),
    [formData, definition.components]
  );
  const isSectionSwitchHidden = useCallback(
    (component: Pick<FormComponent, "section" | "sectionId">) => {
      const key = resolveComponentSectionKey(component);
      return (
        Boolean(sectionSwitchableByKey[key]) &&
        sectionVisibilityByKey[key] === false
      );
    },
    [sectionSwitchableByKey, sectionVisibilityByKey]
  );
  const sectionSummaries = useMemo(() => {
    const summary: Record<
      string,
      { key: string; name: string; count: number }
    > = {};
    definition.components.forEach((component) => {
      const normalizedSection = normalizeSectionName(component.section);
      const sectionKey = resolveComponentSectionKey(component);
      const sectionName = normalizedSection || "Unsectioned";
      if (!summary[sectionKey]) {
        summary[sectionKey] = { key: sectionKey, name: sectionName, count: 0 };
      }
      summary[sectionKey].count += 1;
    });
    return Object.values(summary).sort((a, b) => a.name.localeCompare(b.name));
  }, [definition.components]);
  const viewerSectionSummaries = useMemo(() => {
    const summary: Record<
      string,
      {
        key: string;
        name: string;
        count: number;
        order: number;
        trackableCount: number;
        completedCount: number;
        requiredCount: number;
        requiredIncompleteCount: number;
        prefilledCount: number;
        renderedCount: number;
      }
    > = {};
    // Counts run against viewerFormData (token prefill applied) so the rail
    // agrees with what the user sees before the first autosave lands.
    definition.components.forEach((component, index) => {
      const normalizedSection = normalizeSectionName(component.section);
      const sectionKey = resolveComponentSectionKey(component);
      const sectionName = normalizedSection || "Unsectioned";
      if (!summary[sectionKey]) {
        summary[sectionKey] = {
          key: sectionKey,
          name: sectionName,
          count: 0,
          order: index,
          trackableCount: 0,
          completedCount: 0,
          requiredCount: 0,
          requiredIncompleteCount: 0,
          prefilledCount: 0,
          renderedCount: 0
        };
      }
      const sectionSummary = summary[sectionKey];
      sectionSummary.count += 1;
      const isVisible = isComponentVisibleForSummary(
        component,
        viewerFormData,
        componentsByKey
      );
      if (isVisible) {
        // Any visible component means the section box actually renders —
        // rows for fully rule-hidden sections would navigate nowhere.
        sectionSummary.renderedCount += 1;
      }
      if (!isTrackableSectionSummaryComponent(component)) {
        return;
      }
      if (!isVisible) {
        return;
      }
      sectionSummary.trackableCount += 1;
      if (prefilledKeys.has(component.key)) {
        sectionSummary.prefilledCount += 1;
      }
      const isComplete = hasOutputValue(component, viewerFormData);
      if (isComplete) {
        sectionSummary.completedCount += 1;
      }
      if (component.required) {
        sectionSummary.requiredCount += 1;
        if (!isComplete) {
          sectionSummary.requiredIncompleteCount += 1;
        }
      }
    });
    return Object.values(summary)
      .sort((a, b) => a.order - b.order)
      .map((section) => {
        const completionPercent =
          section.trackableCount > 0
            ? Math.round(
                (section.completedCount / section.trackableCount) * 100
              )
            : 100;
        return {
          ...section,
          requiredCompleteCount:
            section.requiredCount - section.requiredIncompleteCount,
          notStarted:
            section.trackableCount > 0 && section.completedCount === 0,
          displayCount:
            section.trackableCount > 0
              ? `${section.completedCount} of ${section.trackableCount}`
              : String(section.count),
          completionPercent,
          hasWarning: section.requiredIncompleteCount > 0
        };
      });
  }, [componentsByKey, definition.components, viewerFormData, prefilledKeys]);
  const sectionStatsByKey = useMemo(() => {
    const map: Record<
      string,
      {
        reqTotal: number;
        reqDone: number;
        prefilled: number;
        fields: number;
        completed: number;
      }
    > = {};
    viewerSectionSummaries.forEach((section) => {
      map[section.key] = {
        reqTotal: section.requiredCount,
        reqDone: section.requiredCompleteCount,
        prefilled: section.prefilledCount,
        fields: section.trackableCount,
        completed: section.completedCount
      };
    });
    return map;
  }, [viewerSectionSummaries]);
  // Wizard fill mode: one section per page. The active section key lives
  // here; the ObjectTemplate resolves ordering, renders the nav bar, and
  // calls back through formContext.wizard.onNavigate.
  // Applies to the viewer and the Preview tab; the designer canvas always
  // shows every section (it doesn't receive this context).
  const wizardEnabled = definition.builderOptions?.fillMode === "wizard";
  const [wizardSectionKey, setWizardSectionKey] = useState<string | null>(null);
  useEffect(() => {
    if (!wizardEnabled) {
      setWizardSectionKey(null);
    }
  }, [wizardEnabled]);
  const wizardContext = useMemo(
    () =>
      wizardEnabled
        ? {
            enabled: true,
            activeKey: wizardSectionKey,
            onNavigate: setWizardSectionKey
          }
        : undefined,
    [wizardEnabled, wizardSectionKey]
  );
  const overallCompletionPercent = useMemo(() => {
    let trackable = 0;
    let completed = 0;
    // viewerFormData keeps this consistent with the rail/section counts —
    // otherwise a prefilled form shows green rows next to a 0% header.
    definition.components.forEach((component) => {
      if (!isTrackableSectionSummaryComponent(component)) {
        return;
      }
      if (
        !isComponentVisibleForSummary(component, viewerFormData, componentsByKey)
      ) {
        return;
      }
      trackable += 1;
      if (hasOutputValue(component, viewerFormData)) {
        completed += 1;
      }
    });
    return trackable > 0 ? Math.round((completed / trackable) * 100) : 100;
  }, [componentsByKey, definition.components, viewerFormData]);
  useEffect(() => {
    if (!hasHydratedDefinitionRef.current || !source) {
      return;
    }
    const fieldCount = definition.components.length;
    writeIntegerAttribute(source.fieldCountAttr, fieldCount);
    writeIntegerAttribute(source.requiredFieldCountAttr, requiredCount);
    writeIntegerAttribute(source.sectionCountAttr, sectionCount);
    writeIntegerAttribute(
      source.completionPercentAttr,
      overallCompletionPercent
    );
  }, [
    definition.components.length,
    requiredCount,
    sectionCount,
    overallCompletionPercent,
    source
  ]);
  const scrollPreviewToSection = useCallback((sectionKey: string) => {
    setPreviewScrollToSectionKey(sectionKey);
    setPreviewScrollRequest((current) => current + 1);
  }, []);
  const firstMissingRequired = useMemo(
    () =>
      definition.components.find(
        (component) =>
          component.required &&
          isTrackableSectionSummaryComponent(component) &&
          // Switch-hidden sections are excluded from output; jumping the
          // user into their unrendered stub is a dead end.
          !isSectionSwitchHidden(component) &&
          isComponentVisibleForSummary(
            component,
            viewerFormData,
            componentsByKey
          ) &&
          !hasOutputValue(component, viewerFormData)
      ),
    [definition.components, viewerFormData, componentsByKey, isSectionSwitchHidden]
  );
  const jumpToNextRequired = useCallback(() => {
    const target = firstMissingRequired;
    if (!target) {
      return;
    }
    const sectionKey = resolveComponentSectionKey(target);
    scrollPreviewToSection(sectionKey);
    window.setTimeout(() => {
      const element =
        document.getElementById(`${instanceIdPrefix}_${target.key}`) ||
        document.querySelector<HTMLElement>(
          `[id^="${instanceIdPrefix}_${target.key}"]`
        );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof element.focus === "function") {
          element.focus({ preventScroll: true });
        }
      }
    }, 350);
  }, [firstMissingRequired, scrollPreviewToSection, instanceIdPrefix]);
  const toolboxFilter = clean(paletteFilter).toLowerCase();
  const filteredLayoutTemplates = useMemo(
    () =>
      LAYOUT_TEMPLATES.filter((item) => {
        if (!toolboxFilter) {
          return true;
        }
        const haystack =
          `${item.label} ${item.type} ${item.titlePrefix}`.toLowerCase();
        return haystack.includes(toolboxFilter);
      }),
    [toolboxFilter]
  );
  const filteredSystemTemplates = useMemo(
    () =>
      allSystemTemplates().filter((item) => {
        if (item.hiddenFromPalette) {
          return false;
        }
        if (!toolboxFilter) {
          return true;
        }
        const haystack = `${item.label} ${item.type}`.toLowerCase();
        return haystack.includes(toolboxFilter);
      }),
    [toolboxFilter, extraSystemTemplatesParsed]
  );
  const filteredSharedFields = useMemo(
    () =>
      sharedFieldCatalog.filter((item) => {
        if (!toolboxFilter) {
          return true;
        }
        const haystack =
          `${item.label} ${item.tokenKey} ${item.sourceKey} ${item.sourceCode} ${item.fieldType}`.toLowerCase();
        return haystack.includes(toolboxFilter);
      }),
    [sharedFieldCatalog, toolboxFilter]
  );
  const filteredClientFields = useMemo(
    () =>
      clientFieldCatalog.filter((item) => {
        if (!toolboxFilter) {
          return true;
        }
        const haystack =
          `${item.label} ${item.tokenKey} ${item.fieldType}`.toLowerCase();
        return haystack.includes(toolboxFilter);
      }),
    [clientFieldCatalog, toolboxFilter]
  );
  const filteredFieldGroups = useMemo(
    () =>
      FIELD_PALETTE_GROUPS.map((group) => ({
        ...group,
        items: group.types
          .map((type) => FIELD_TYPES.find((item) => item.type === type))
          .filter((item): item is { type: FieldType; label: string } =>
            Boolean(item)
          )
          .filter((item) => {
            if (!toolboxFilter) {
              return true;
            }
            const haystack =
              `${item.label} ${item.type} ${group.label}`.toLowerCase();
            return haystack.includes(toolboxFilter);
          })
      })).filter((group) => group.items.length > 0),
    [toolboxFilter]
  );
  const updateSelectedComponent = useCallback(
    (updater: (component: FormComponent) => FormComponent) => {
      if (!selectedComponent) {
        return;
      }
      updateDefinition((current) => ({
        ...current,
        components: current.components.map((component) =>
          component.id === selectedComponent.id ? updater(component) : component
        )
      }));
    },
    [selectedComponent, updateDefinition]
  );
  const updateBuilderOptions = useCallback(
    (updater: (options: BuilderOptions) => BuilderOptions) => {
      updateDefinition((current) => ({
        ...current,
        builderOptions: updater(normalizeBuilderOptions(current.builderOptions))
      }));
    },
    [updateDefinition]
  );
  const persistChoiceOptionsDraft = useCallback(
    (componentId: string, rows: ChoiceOptionDraft[]) => {
      const normalized = normalizeChoiceOptionDrafts(rows);
      // Redesign step 9: options are append-only on shared-bound fields.
      // Every options mutation (value rename on blur, remove, reorder,
      // add) funnels through here, so one set-difference check enforces
      // the rule: any previously-persisted option value missing from the
      // next set means a remove or a canonical-value rename — block it,
      // matching the key-rename hard block. Adding options passes (the
      // next set is a superset); reorder passes (same set — order is not
      // identity); label edits stored in optionLabels pass (they never
      // touch the options array). NOTE a label edit on a row with a blank
      // Value column DOES change the canonical option string, so it is
      // correctly blocked too.
      const target = definition.components.find(
        (component) => component.id === componentId
      );
      const sharedRef = clean(target?.sharedFieldRef);
      if (target && sharedRef) {
        const nextValues = new Set(normalized.options || []);
        const lostValues = (target.options || []).filter(
          (value) => !nextValues.has(value)
        );
        if (lostValues.length) {
          setMessage(
            `Shared field "${sharedRef}" options are append-only — removing or renaming an option orphans historic answers. Adding new options is allowed.`
          );
          // Re-sync the draft rows to the (unchanged) persisted options so
          // the editor does not keep showing the blocked edit.
          setChoiceOptionsDraft(buildChoiceOptionDrafts(target));
          return;
        }
      }
      setChoiceOptionsDraft(normalized.rows);
      updateDefinition((current) => ({
        ...current,
        components: current.components.map((component) => {
          if (component.id !== componentId) {
            return component;
          }
          const isMultiChoice =
            (component.type === "select" || component.type === "radio") &&
            component.multiSelect;
          return {
            ...component,
            options: normalized.options,
            optionLabels: normalized.optionLabels,
            optionScores: normalized.optionScores,
            defaultValue: isMultiChoice
              ? normalizeMultiSelectValues(
                  component.defaultValue,
                  normalized.options
                ) || []
              : component.defaultValue
          };
        })
      }));
    },
    [definition.components, updateDefinition]
  );
  const persistMatrixRowsDraft = useCallback(
    (
      componentId: string,
      rows: Array<{ id: string; key: string; label: string }>
    ) => {
      const normalized: MatrixRowConfig[] = [];
      rows.forEach((row, index) => {
        const label = clean(row.label);
        const keySeed = clean(row.key) || label || `row_${index + 1}`;
        if (!clean(row.key) && !label) {
          return;
        }
        const key = makeUniqueMatrixRowKey(keySeed, normalized);
        normalized.push({ key, label: label || key });
      });
      const nextRows = normalized.length
        ? normalized
        : createDefaultMatrixRows("matrix");
      setMatrixRowsDraft(
        nextRows.map((row) => ({
          id: makeId("mrow"),
          key: row.key,
          label: row.label
        }))
      );
      updateDefinition((current) => ({
        ...current,
        components: current.components.map((component) =>
          component.id === componentId
            ? { ...component, matrixRows: nextRows }
            : component
        )
      }));
    },
    [updateDefinition]
  );
  const schema = useMemo(() => buildSchema(definition), [definition]);
  const [simulateRules, setSimulateRules] = useState<boolean>(false);
  // Designer canvas shows every field (rule-gated ones included) unless the
  // author opts into simulating the runtime visibility rules.
  const designerPreviewSchema = useMemo(
    () => (simulateRules ? buildSchema(definition) : buildSchema(definition, true)),
    [definition, simulateRules]
  );
  const uiSchema = useMemo(() => buildUiSchema(definition), [definition]);
  const contentBlockTokenValues = useMemo(() => {
    if (
      !definition.components.some(
        (component) => component.type === "contentBlock"
      )
    ) {
      return {} as Record<string, string>;
    }
    return buildTokenScope(definition, formData, tokenContext);
  }, [definition, formData, tokenContext]);
  const componentMetaByKey = useMemo(
    () =>
      definition.components.reduce((map, component, index) => {
        map[component.key] = {
          id: component.id,
          orderIndex: index,
          section: component.section,
          sectionId: clean(component.sectionId) || undefined,
          sectionOrder: component.sectionOrder,
          sectionColumns: component.sectionColumns,
          sectionColumn: component.sectionColumn,
          sectionCollapsible: component.sectionCollapsible,
          sectionCollapsedByDefault: component.sectionCollapsedByDefault,
          columnSpan: component.columnSpan,
          hasVisibilityRules: Boolean(component.visibility?.rules?.length),
          sharedFieldRef: clean(component.sharedFieldRef) || undefined
        };
        return map;
      }, {} as Record<string, { id?: string; orderIndex?: number; section?: string; sectionId?: string; sectionOrder?: number; sectionColumns?: number; sectionColumn?: number; sectionCollapsible?: boolean; sectionCollapsedByDefault?: boolean; columnSpan?: number; hasVisibilityRules?: boolean; sharedFieldRef?: string }>),
    [definition.components]
  );
  const componentIdByKey = useMemo(
    () =>
      definition.components.reduce((map, component) => {
        map[component.key] = component.id;
        return map;
      }, {} as Record<string, string>),
    [definition.components]
  );
  const previewDataGridKeys = useMemo(
    () =>
      definition.components
        .filter((component) => component.type === "datagrid")
        .map((component) => component.key),
    [definition.components]
  );
  const openDataGridSettingsByKey = useCallback(
    (key: string) => {
      const componentId = componentIdByKey[key];
      if (!componentId) {
        return;
      }
      setSelectedId(componentId);
      setRightPanelCollapsed(false);
      setShowDatagridConfigModal(true);
    },
    [componentIdByKey]
  );
  const closeDataGridSettingsModal = useCallback(() => {
    setShowDatagridConfigModal(false);
  }, []);
  const validationMessageMetaByKey = useMemo(
    () =>
      definition.components.reduce((map, component) => {
        if (component.type !== "text" && component.type !== "textarea") {
          return map;
        }
        const customErrorMessage = clean(component.customErrorMessage);
        if (!customErrorMessage) {
          return map;
        }
        map[component.key] = customErrorMessage;
        return map;
      }, {} as Record<string, string>),
    [definition.components]
  );
  const validationMessageKeys = useMemo(
    () => new Set(Object.keys(validationMessageMetaByKey)),
    [validationMessageMetaByKey]
  );
  const transformValidationErrors = useCallback(
    (errors: any[]): any[] => {
      if (!Array.isArray(errors) || !validationMessageKeys.size) {
        return errors;
      }
      return errors.map((error) => {
        const key = resolveFieldKeyFromErrorProperty(
          error?.property,
          validationMessageKeys
        );
        if (!key) {
          return error;
        }
        const customMessage = clean(validationMessageMetaByKey[key]);
        if (!customMessage) {
          return error;
        }
        const nextError = { ...error };
        nextError.message = customMessage;
        return nextError;
      });
    },
    [validationMessageKeys, validationMessageMetaByKey]
  );
  const ensureValueShape = useCallback(
    (
      component: FormComponent,
      value: unknown
    ): string | number | boolean | string[] | JsonObject[] | JsonObject => {
      if (component.type === "datagrid") {
        return sanitizeDataGridRows(value, component) || [];
      }
      if (component.type === "matrix") {
        return sanitizeMatrixValue(component, value) || {};
      }
      if (component.type === "slider") {
        const numValue = Number(value);
        const bounds = resolveSliderBounds(component);
        return Number.isFinite(numValue)
          ? applyNumberBounds(numValue, bounds.minimum, bounds.maximum)
          : bounds.minimum;
      }
      if (
        (component.type === "select" || component.type === "radio") &&
        component.multiSelect
      ) {
        return normalizeMultiSelectValues(value, component.options) || [];
      }
      if (component.type === "checkbox" || component.type === "switch") {
        return toBoolean(value);
      }
      if (component.type === "yesno") {
        return normalizeYesNoValue(value) || "";
      }
      if (component.type === "integer") {
        const numValue = Number(value);
        const bounds = normalizeIntegerBounds(
          component.minimum,
          component.maximum
        );
        return Number.isFinite(numValue)
          ? applyIntegerBounds(numValue, bounds.minimum, bounds.maximum)
          : bounds.minimum ?? 0;
      }
      if (component.type === "number") {
        const numValue = Number(value);
        const style = numberStyleOf(component);
        const whole = isWholeNumberComponent(component);
        if (style === "slider" || style === "scale") {
          const bounds = resolveSliderBounds(component);
          const clamped = Number.isFinite(numValue)
            ? applyNumberBounds(numValue, bounds.minimum, bounds.maximum)
            : bounds.minimum;
          return whole ? Math.trunc(clamped) : clamped;
        }
        if (whole) {
          const bounds = normalizeIntegerBounds(
            component.minimum,
            component.maximum
          );
          return Number.isFinite(numValue)
            ? applyIntegerBounds(numValue, bounds.minimum, bounds.maximum)
            : bounds.minimum ?? 0;
        }
        const bounds = normalizeNumberBounds(
          component.minimum,
          component.maximum
        );
        return Number.isFinite(numValue)
          ? applyNumberBounds(numValue, bounds.minimum, bounds.maximum)
          : bounds.minimum ?? 0;
      }
      if (component.type === "total") {
        const numValue = Number(value);
        return Number.isFinite(numValue) ? numValue : 0;
      }
      return str(value);
    },
    []
  );
  const addLayoutTemplate = useCallback(
    (layoutType: LayoutTemplateType) => {
      const template = LAYOUT_TEMPLATES.find(
        (item) => item.type === layoutType
      );
      if (!template) {
        return;
      }
      updateDefinition((current) => {
        if (layoutType === "layout_datagrid_compact") {
          const section = makeUniqueSectionTitle(
            current.components,
            "Data Grid"
          );
          const sectionOrder = nextSectionOrder(current.components);
          const groupKey = makeUniqueRepeatGroupKey(
            current.components,
            undefined,
            `${section}_rows`
          );
          const groupConfig: RepeatGroupConfig = {
            key: groupKey,
            title: `${section} rows`,
            defaultItems: 1,
            asDataGrid: true
          };
          const specs: Array<{
            keyBase: string;
            label: string;
            type: FieldType;
            columnSpan: number;
          }> = [
            {
              keyBase: "eventDate",
              label: "Date",
              type: "date",
              columnSpan: 3
            },
            {
              keyBase: "summary",
              label: "Summary",
              type: "text",
              columnSpan: 4
            },
            {
              keyBase: "details",
              label: "Details",
              type: "textarea",
              columnSpan: 5
            }
          ];
          const nextComponents = [...current.components];
          specs.forEach((spec, index) => {
            const key = makeUniqueKey(spec.keyBase, nextComponents);
            const component: FormComponent = {
              id: makeId("cmp"),
              key,
              label: spec.label,
              type: spec.type,
              required: false,
              section,
              sectionOrder,
              sectionColumns: undefined,
              sectionColumn: undefined,
              sectionCollapsible: true,
              sectionCollapsedByDefault: false,
              columnSpan: snapColumnSpan(
                spec.columnSpan,
                current.builderOptions?.snapToResize !== false
              ),
              repeatGroup: groupConfig
            };
            nextComponents.push(component);
            if (index === 0) {
              setSelectedId(component.id);
            }
          });
          setMessage("");
          return { ...current, components: nextComponents };
        }
        const section = makeUniqueSectionTitle(
          current.components,
          template.titlePrefix
        );
        const sectionOrder = nextSectionOrder(current.components);
        const nextComponents = [...current.components];
        for (let i = 0; i < template.columns; i += 1) {
          const keyBase = template.columns > 1 ? `column_${i + 1}` : "field";
          const key = makeUniqueKey(keyBase, nextComponents);
          const columnSpan = 12;
          const component: FormComponent = {
            id: makeId("cmp"),
            key,
            label: key,
            type: "text",
            required: false,
            section,
            sectionOrder,
            sectionColumns: template.columns > 1 ? template.columns : undefined,
            sectionColumn: template.columns > 1 ? i + 1 : undefined,
            sectionCollapsible: Boolean(template.collapsible),
            sectionCollapsedByDefault: false,
            columnSpan: snapColumnSpan(
              columnSpan,
              current.builderOptions?.snapToResize !== false
            )
          };
          nextComponents.push(component);
          if (i === 0) {
            setSelectedId(component.id);
          }
        }
        setMessage("");
        return { ...current, components: nextComponents };
      });
    },
    [updateDefinition]
  );
  const addSystemTemplate = useCallback(
    (templateType: SystemTemplateType) => {
      const template = allSystemTemplates().find(
        (item) => item.type === templateType
      );
      if (!template) {
        return;
      }
      updateDefinition((current) => {
        const section = makeUniqueSectionTitle(
          current.components,
          template.titlePrefix
        );
        const sectionOrder = nextSectionOrder(current.components);
        const key = makeUniqueKey(template.keyBase, current.components);
        const component: FormComponent = {
          id: makeId("cmp"),
          key,
          label: template.label,
          type: "systemDatagrid2",
          required: false,
          section,
          sectionOrder,
          sectionColumns: undefined,
          sectionColumn: undefined,
          sectionCollapsible: true,
          sectionCollapsedByDefault: false,
          columnSpan: snapColumnSpan(
            12,
            current.builderOptions?.snapToResize !== false
          ),
          systemTemplateType: template.type,
          documentOutputTemplate:
            clean(template.documentOutputTemplate) || undefined,
          datagridRowIdKey: clean(template.rowIdKey) || undefined,
          systemTemplateSlotProperty: template.systemTemplateSlotProperty,
          datagridColumns: createDataGridColumnsFromTemplate(template)
        };
        setMessage("");
        setSelectedId(component.id);
        return { ...current, components: [...current.components, component] };
      });
    },
    [updateDefinition]
  );
  const addComponent = useCallback(
    (type: FieldType) => {
      updateDefinition((current) => {
        const key = makeUniqueKey(type, current.components);
        const label =
          type === "total"
            ? "Total score"
            : type === "contentBlock"
            ? "Content block"
            : key;
        const component: FormComponent = {
          id: makeId("cmp"),
          key,
          label,
          type,
          required: false,
          columnSpan: snapColumnSpan(
            defaultColumnSpan(type),
            current.builderOptions?.snapToResize !== false
          ),
          options:
            type === "select" || type === "radio"
              ? ["Option 1", "Option 2"]
              : type === "matrix"
              ? ["Option 1", "Option 2", "Option 3"]
              : type === "yesno"
              ? [...YES_NO_OPTIONS]
              : undefined,
          optionLabels:
            type === "yesno" ? { ...YES_NO_OPTION_LABELS } : undefined,
          matrixRows:
            type === "matrix" ? createDefaultMatrixRows(key) : undefined,
          minimum: type === "slider" ? 0 : undefined,
          maximum: type === "slider" ? 10 : undefined,
          multipleOf: type === "slider" ? 1 : undefined,
          contentText: type === "contentBlock" ? "" : undefined,
          hideLabel: type === "contentBlock" ? true : undefined,
          datagridColumns:
            type === "datagrid" ? createDefaultDataGridColumns(key) : undefined
        };
        setSelectedId(component.id);
        setMessage("");
        return { ...current, components: [...current.components, component] };
      });
    },
    [updateDefinition]
  );
  const addSharedField = useCallback(
    (entry: SharedFieldCatalogEntry) => {
      updateDefinition((current) => {
        const existing = current.components.find(
          (component) => clean(component.sharedFieldRef) === entry.tokenKey
        );
        if (existing) {
          setSelectedId(existing.id);
          setMessage(
            `"${entry.label}" is already on this form (field key "${existing.key}").`
          );
          return current;
        }
        const fieldType = FIELD_TYPE_SET.has(entry.fieldType as FieldType)
          ? (entry.fieldType as FieldType)
          : "text";
        const desiredKey =
          clean(entry.sourceKey) ||
          entry.tokenKey.replace(/[^A-Za-z0-9_]/g, "_");
        const key = makeUniqueKey(desiredKey, current.components);
        const optionValues: string[] = [];
        const optionLabels: Record<string, string> = {};
        entry.options.forEach((option) => {
          if (typeof option === "string" && clean(option)) {
            optionValues.push(option);
            return;
          }
          if (option && typeof option === "object" && !Array.isArray(option)) {
            const record = option as Record<string, unknown>;
            const value = clean(record.value);
            if (value) {
              optionValues.push(value);
              const optionLabel = clean(record.label);
              if (optionLabel && optionLabel !== value) {
                optionLabels[value] = optionLabel;
              }
            }
          }
        });
        const isChoice = fieldType === "select" || fieldType === "radio";
        const component: FormComponent = {
          id: makeId("cmp"),
          key,
          label: entry.defaultLabel || entry.label,
          type: fieldType,
          required: false,
          columnSpan: snapColumnSpan(
            defaultColumnSpan(fieldType),
            current.builderOptions?.snapToResize !== false
          ),
          options:
            isChoice && optionValues.length
              ? optionValues
              : isChoice
              ? ["Option 1", "Option 2"]
              : fieldType === "yesno"
              ? [...YES_NO_OPTIONS]
              : undefined,
          optionLabels:
            isChoice && Object.keys(optionLabels).length
              ? optionLabels
              : fieldType === "yesno"
              ? { ...YES_NO_OPTION_LABELS }
              : undefined,
          sharedFieldRef: entry.tokenKey
        };
        setSelectedId(component.id);
        setMessage("");
        return { ...current, components: [...current.components, component] };
      });
    },
    [updateDefinition]
  );
  const addClientField = useCallback(
    (entry: ClientFieldCatalogEntry) => {
      updateDefinition((current) => {
        const existing = current.components.find(
          (component) => clean(component.prefillTokenKey) === entry.tokenKey
        );
        if (existing) {
          setSelectedId(existing.id);
          setMessage(
            `"${entry.label}" is already on this form (field key "${existing.key}").`
          );
          return current;
        }
        const fieldType = FIELD_TYPE_SET.has(entry.fieldType as FieldType)
          ? (entry.fieldType as FieldType)
          : CLIENT_TOKEN_FIELD_TYPES[entry.tokenKey] ?? "text";
        const desiredKey = entry.tokenKey.replace(/[^A-Za-z0-9_]/g, "_");
        const key = makeUniqueKey(desiredKey, current.components);
        const component: FormComponent = {
          id: makeId("cmp"),
          key,
          label: entry.defaultLabel || entry.label,
          type: fieldType,
          required: false,
          columnSpan: snapColumnSpan(
            defaultColumnSpan(fieldType),
            current.builderOptions?.snapToResize !== false
          ),
          prefillTokenKey: entry.tokenKey
        };
        setSelectedId(component.id);
        setMessage("");
        return { ...current, components: [...current.components, component] };
      });
    },
    [updateDefinition]
  );
  const duplicateSelectedComponent = useCallback(() => {
    const selected = selectedIdRef.current;
    if (!selected) {
      return;
    }
    updateDefinition((current) => {
      const index = current.components.findIndex(
        (component) => component.id === selected
      );
      if (index < 0) {
        return current;
      }
      const clone = current.components[index];
      const duplicate: FormComponent = {
        ...(JSON.parse(JSON.stringify(clone)) as FormComponent),
        id: makeId("cmp"),
        key: makeUniqueKey(clone.key, current.components),
        label: `${clone.label} Copy`
      };
      setSelectedId(duplicate.id);
      const next = [...current.components];
      next.splice(index + 1, 0, duplicate);
      return { ...current, components: next };
    });
  }, [updateDefinition]);
  const deleteSelectedComponent = useCallback(() => {
    const selected = selectedIdRef.current;
    if (!selected) {
      return;
    }
    updateDefinition((current) => {
      const next = current.components.filter(
        (component) => component.id !== selected
      );
      if (next.length === current.components.length) {
        return current;
      }
      setSelectedId(next[0]?.id || null);
      return { ...current, components: next };
    });
  }, [updateDefinition]);
  const moveSelectedComponent = useCallback(
    (direction: -1 | 1) => {
      const selected = selectedIdRef.current;
      if (!selected) {
        return;
      }
      updateDefinition((current) => {
        const from = current.components.findIndex(
          (component) => component.id === selected
        );
        const to = from + direction;
        if (from < 0 || to < 0 || to >= current.components.length) {
          return current;
        }
        const next = [...current.components];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...current, components: next };
      });
    },
    [updateDefinition]
  );
  // Clipboard copy/paste of fields. navigator.clipboard carries the field
  // across forms/tabs; the ref is a same-session fallback when clipboard
  // access is denied.
  const copiedComponentRef = useRef<FormComponent | null>(null);
  const copySelectedComponent = useCallback(() => {
    const selected = selectedIdRef.current;
    const component = definitionRef.current.components.find(
      (item) => item.id === selected
    );
    if (!component) {
      return;
    }
    copiedComponentRef.current = component;
    const payload = JSON.stringify({
      fsFieldClipboard: 1,
      component
    });
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(payload).catch(() => undefined);
    }
    setMessage(`Copied "${component.label}" — paste with Ctrl+V.`);
  }, []);
  const pasteComponent = useCallback(async () => {
    let raw: any = null;
    if (navigator.clipboard?.readText) {
      try {
        // The permission prompt can suspend readText indefinitely — race it
        // so the in-session fallback still works.
        const text = (await Promise.race([
          navigator.clipboard.readText(),
          new Promise<never>((_resolve, reject) =>
            setTimeout(() => reject(new Error("clipboard timeout")), 800)
          )
        ])) as string;
        const parsed = JSON.parse(text);
        if (parsed && parsed.fsFieldClipboard === 1 && parsed.component) {
          raw = parsed.component;
        }
      } catch (_error) {
        // fall through to the in-session fallback
      }
    }
    if (!raw && copiedComponentRef.current) {
      raw = copiedComponentRef.current;
    }
    if (!raw) {
      setMessage("Nothing to paste — copy a field first.");
      return;
    }
    updateDefinition((current) => {
      const normalized = normalizeComponent(raw, current.components.length);
      const pasted: FormComponent = {
        ...normalized,
        id: makeId("cmp"),
        key: makeUniqueKey(normalized.key, current.components)
      };
      const selectedIndex = current.components.findIndex(
        (component) => component.id === selectedIdRef.current
      );
      const insertAt =
        selectedIndex >= 0 ? selectedIndex + 1 : current.components.length;
      setSelectedId(pasted.id);
      setMessage(`Pasted "${pasted.label}".`);
      const next = [...current.components];
      next.splice(insertAt, 0, pasted);
      return { ...current, components: next };
    });
  }, [updateDefinition]);
  const onPreviewFieldAction = useCallback(
    (action: "duplicate" | "copy" | "delete") => {
      if (action === "duplicate") {
        duplicateSelectedComponent();
      } else if (action === "copy") {
        copySelectedComponent();
      } else {
        deleteSelectedComponent();
      }
    },
    [duplicateSelectedComponent, copySelectedComponent, deleteSelectedComponent]
  );
  // Designer keyboard shortcuts: Ctrl+D duplicate, Ctrl+C/V copy/paste,
  // Delete remove, Ctrl+Arrow move. Skipped while typing in any form control
  // so normal editing (and normal copy/paste of text) is untouched.
  useEffect(() => {
    if (props.viewMode !== "designer") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === "d") {
        event.preventDefault();
        duplicateSelectedComponent();
        return;
      }
      if (mod && key === "c") {
        if (window.getSelection()?.toString()) {
          return; // let a real text selection copy normally
        }
        event.preventDefault();
        copySelectedComponent();
        return;
      }
      if (mod && key === "v") {
        event.preventDefault();
        void pasteComponent();
        return;
      }
      if (mod && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        moveSelectedComponent(event.key === "ArrowUp" ? -1 : 1);
        return;
      }
      if (event.key === "Delete") {
        event.preventDefault();
        deleteSelectedComponent();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    props.viewMode,
    duplicateSelectedComponent,
    copySelectedComponent,
    pasteComponent,
    moveSelectedComponent,
    deleteSelectedComponent
  ]);
  const reorderComponents = useCallback(
    (dragId: string, dropId: string) => {
      updateDefinition((current) => {
        const from = current.components.findIndex((item) => item.id === dragId);
        const to = current.components.findIndex((item) => item.id === dropId);
        if (from < 0 || to < 0 || from === to) {
          return current;
        }
        const next = [...current.components];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...current, components: next };
      });
    },
    [updateDefinition]
  );
  const moveComponentWithinRepeatGroup = useCallback(
    (
      groupKey: string,
      componentId: string,
      direction: SectionMoveDirection
    ) => {
      updateDefinition((current) => {
        const groupComponents = current.components.filter(
          (component) => clean(component.repeatGroup?.key) === clean(groupKey)
        );
        const currentGroupIndex = groupComponents.findIndex(
          (component) => component.id === componentId
        );
        if (currentGroupIndex < 0) {
          return current;
        }
        const sibling =
          direction === "up"
            ? groupComponents[currentGroupIndex - 1]
            : groupComponents[currentGroupIndex + 1];
        if (!sibling) {
          return current;
        }
        const nextComponents = reorderComponentsWithinRepeatGroup(
          current.components,
          groupKey,
          componentId,
          sibling.id,
          direction === "up" ? "before" : "after"
        );
        return nextComponents === current.components
          ? current
          : { ...current, components: nextComponents };
      });
    },
    [updateDefinition]
  );
  const clearRepeatGroupOrderDragState = useCallback(() => {
    setDraggingRepeatGroupFieldId(null);
    setRepeatGroupOrderDropTarget(null);
  }, []);
  const handleRepeatGroupOrderDragOver = useCallback(
    (event: DragEvent<HTMLElement>, targetId: string) => {
      if (
        !draggingRepeatGroupFieldId ||
        draggingRepeatGroupFieldId === targetId
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      const rect = event.currentTarget.getBoundingClientRect();
      const placement: DropPlacement =
        event.clientY >= rect.top + rect.height / 2 ? "after" : "before";
      setRepeatGroupOrderDropTarget((current) =>
        current?.targetId === targetId && current.placement === placement
          ? current
          : { targetId, placement }
      );
    },
    [draggingRepeatGroupFieldId]
  );
  const handleRepeatGroupOrderDrop = useCallback(
    (event: DragEvent<HTMLElement>, groupKey: string, targetId: string) => {
      event.preventDefault();
      event.stopPropagation();
      const dragId =
        getDragData(event.dataTransfer, DRAG_TYPE_REPEAT_GROUP_COMPONENT) ||
        draggingRepeatGroupFieldId;
      const placement =
        repeatGroupOrderDropTarget?.targetId === targetId
          ? repeatGroupOrderDropTarget.placement
          : "before";
      clearRepeatGroupOrderDragState();
      if (!dragId || dragId === targetId || !clean(groupKey)) {
        return;
      }
      updateDefinition((current) => {
        const nextComponents = reorderComponentsWithinRepeatGroup(
          current.components,
          groupKey,
          dragId,
          targetId,
          placement
        );
        return nextComponents === current.components
          ? current
          : { ...current, components: nextComponents };
      });
      setSelectedId(dragId);
    },
    [
      clearRepeatGroupOrderDragState,
      draggingRepeatGroupFieldId,
      repeatGroupOrderDropTarget,
      updateDefinition
    ]
  );
  const reorderByPreviewKey = useCallback(
    (
      sourceKey: string,
      targetKey: string,
      placement: DropPlacement = "after"
    ) => {
      updateDefinition((current) => {
        const sourceIndex = current.components.findIndex(
          (component) => !component.repeatGroup && component.key === sourceKey
        );
        const targetIndex = current.components.findIndex(
          (component) => !component.repeatGroup && component.key === targetKey
        );
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
          return current;
        }
        const sourceComponent = current.components[sourceIndex];
        const targetComponent = current.components[targetIndex];
        const sourceSection = getSectionKey(sourceComponent);
        const targetSection = getSectionKey(targetComponent);
        const next = [...current.components];
        const [moved] = next.splice(sourceIndex, 1);
        const targetIndexInNext = next.findIndex(
          (component) => !component.repeatGroup && component.key === targetKey
        );
        const insertIndex =
          targetIndexInNext >= 0
            ? targetIndexInNext + (placement === "after" ? 1 : 0)
            : next.length;
        const targetSectionColumns =
          Number.isFinite(Number(targetComponent.sectionColumns)) &&
          Number(targetComponent.sectionColumns) > 1
            ? clamp(Math.floor(Number(targetComponent.sectionColumns)), 1, 12)
            : undefined;
        const nextMoved =
          sourceSection === targetSection
            ? {
                ...moved,
                sectionColumns: targetSectionColumns,
                sectionColumn:
                  targetSectionColumns && targetSectionColumns > 1
                    ? clamp(
                        Math.floor(
                          Number(
                            targetComponent.sectionColumn ||
                              moved.sectionColumn ||
                              1
                          )
                        ),
                        1,
                        targetSectionColumns
                      )
                    : undefined
              }
            : (() => {
                const sectionMeta = resolveSectionMeta(
                  next,
                  targetComponent.section,
                  targetKey
                );
                const sectionColumn =
                  sectionMeta.sectionColumns && sectionMeta.sectionColumns > 1
                    ? clamp(
                        Math.floor(
                          Number(
                            targetComponent.sectionColumn ||
                              moved.sectionColumn ||
                              1
                          )
                        ),
                        1,
                        sectionMeta.sectionColumns
                      )
                    : undefined;
                return {
                  ...moved,
                  section: sectionMeta.section,
                  sectionId: sectionMeta.sectionId,
                  sectionOrder: sectionMeta.sectionOrder,
                  sectionColumns: sectionMeta.sectionColumns,
                  sectionColumn,
                  columnSpan: clamp(
                    moved.columnSpan || defaultColumnSpan(moved.type),
                    1,
                    12
                  ),
                  sectionCollapsible: sectionMeta.sectionCollapsible,
                  sectionCollapsedByDefault:
                    sectionMeta.sectionCollapsedByDefault
                };
              })();
        next.splice(insertIndex, 0, nextMoved);
        return { ...current, components: next };
      });
    },
    [updateDefinition]
  );
  const resizeByPreviewKey = useCallback(
    (targetKey: string, nextSpan: number) => {
      updateDefinition((current) => {
        const snappedSpan = snapColumnSpan(
          nextSpan,
          current.builderOptions?.snapToResize !== false
        );
        let changed = false;
        const nextComponents = current.components.map((component) => {
          if (component.repeatGroup || component.key !== targetKey) {
            return component;
          }
          const existingSpan = clamp(
            component.columnSpan || defaultColumnSpan(component.type),
            1,
            12
          );
          if (existingSpan === snappedSpan) {
            return component;
          }
          changed = true;
          return { ...component, columnSpan: snappedSpan };
        });
        return changed ? { ...current, components: nextComponents } : current;
      });
    },
    [updateDefinition]
  );
  const resizeSectionByPreviewKey = useCallback(
    (sectionKey: string, nextColumns: number) => {
      const normalizedColumns = clamp(
        Math.floor(Number(nextColumns) || 1),
        1,
        12
      );
      updateDefinition((current) => {
        let changed = false;
        const sectionColumnCursor: Record<string, number> = {};
        const nextComponents = current.components.map((component) => {
          if (component.repeatGroup) {
            return component;
          }
          const componentSectionKey = getSectionKey(component) || "__default";
          if (componentSectionKey !== sectionKey) {
            return component;
          }
          const nextSectionColumns =
            normalizedColumns > 1 ? normalizedColumns : undefined;
          const nextSectionColumn =
            nextSectionColumns && nextSectionColumns > 1
              ? (() => {
                  const explicit = Number.isFinite(
                    Number(component.sectionColumn)
                  )
                    ? clamp(
                        Math.floor(Number(component.sectionColumn)),
                        1,
                        nextSectionColumns
                      )
                    : undefined;
                  if (explicit) {
                    return explicit;
                  }
                  const cursor = sectionColumnCursor[sectionKey] || 0;
                  const assigned = (cursor % nextSectionColumns) + 1;
                  sectionColumnCursor[sectionKey] = cursor + 1;
                  return assigned;
                })()
              : undefined;
          if (
            component.sectionColumns === nextSectionColumns &&
            component.sectionColumn === nextSectionColumn
          ) {
            return component;
          }
          changed = true;
          return {
            ...component,
            sectionColumns: nextSectionColumns,
            sectionColumn: nextSectionColumn
          };
        });
        return changed ? { ...current, components: nextComponents } : current;
      });
    },
    [updateDefinition]
  );
  const reorderSectionByPreviewKey = useCallback(
    (sectionKey: string, direction: SectionMoveDirection) => {
      updateDefinition((current) => {
        type SectionEntry = { key: string; order: number; firstIndex: number };
        const sectionMap: Record<string, SectionEntry> = {};
        current.components.forEach((component, index) => {
          const key = getSectionKey(component) || "__default";
          if (sectionMap[key]) {
            return;
          }
          sectionMap[key] = {
            key,
            order: Number.isFinite(Number(component.sectionOrder))
              ? Number(component.sectionOrder)
              : Number.MAX_SAFE_INTEGER,
            firstIndex: index
          };
        });
        const orderedSections = Object.values(sectionMap).sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.firstIndex - b.firstIndex;
        });
        if (orderedSections.length < 2) {
          return current;
        }
        const currentIndex = orderedSections.findIndex(
          (section) => section.key === sectionKey
        );
        if (currentIndex < 0) {
          return current;
        }
        const targetIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= orderedSections.length) {
          return current;
        }
        const nextSections = [...orderedSections];
        const [movingSection] = nextSections.splice(currentIndex, 1);
        nextSections.splice(targetIndex, 0, movingSection);
        const nextOrderBySection = nextSections.reduce(
          (map, section, index) => {
            map[section.key] = (index + 1) * 10;
            return map;
          },
          {} as Record<string, number>
        );
        let changed = false;
        const nextComponents = current.components.map((component) => {
          const componentSectionKey = getSectionKey(component) || "__default";
          const nextOrder = nextOrderBySection[componentSectionKey];
          if (component.sectionOrder === nextOrder) {
            return component;
          }
          changed = true;
          return { ...component, sectionOrder: nextOrder };
        });
        return changed ? { ...current, components: nextComponents } : current;
      });
    },
    [updateDefinition]
  );
  const updateSectionSettingsByPreviewKey = useCallback(
    (sectionKey: string, updates: SectionSettingsUpdate) => {
      const normalizedSectionKey = clean(sectionKey) || "__default";
      const hasSectionOrderUpdate = Number.isFinite(
        Number(updates.sectionOrder)
      );
      const hasSectionTitleUpdate = updates.sectionTitle != null;
      if (
        !hasSectionTitleUpdate &&
        !hasSectionOrderUpdate &&
        updates.sectionCollapsible == null &&
        updates.sectionCollapsedByDefault == null &&
        updates.sectionSwitchEnabled == null
      ) {
        return;
      }
      const normalizedSectionTitle = hasSectionTitleUpdate
        ? clean(updates.sectionTitle)
        : undefined;
      const normalizedSectionOrder = hasSectionOrderUpdate
        ? Math.floor(Number(updates.sectionOrder))
        : undefined;
      updateDefinition((current) => {
        let changed = false;
        const nextComponents = current.components.map((component) => {
          // Match by resolved key (sectionId when present) so a RENAME finds
          // the section by its stable id — the ...component spread below
          // preserves sectionId, which is the whole point of Task 2.
          if (resolveComponentSectionKey(component) !== normalizedSectionKey) {
            return component;
          }
          const nextSection = hasSectionTitleUpdate
            ? normalizedSectionTitle || undefined
            : component.section;
          const nextSectionOrder = hasSectionOrderUpdate
            ? normalizedSectionOrder
            : component.sectionOrder;
          const nextSectionCollapsible =
            updates.sectionCollapsible == null
              ? Boolean(component.sectionCollapsible)
              : updates.sectionCollapsible;
          const nextSectionCollapsedByDefault =
            (updates.sectionCollapsedByDefault == null
              ? Boolean(component.sectionCollapsedByDefault)
              : updates.sectionCollapsedByDefault) && nextSectionCollapsible;
          const nextSectionSwitchEnabled =
            updates.sectionSwitchEnabled == null
              ? Boolean(component.sectionSwitchEnabled)
              : updates.sectionSwitchEnabled;
          if (
            (component.section || "") === (nextSection || "") &&
            component.sectionOrder === nextSectionOrder &&
            Boolean(component.sectionCollapsible) === nextSectionCollapsible &&
            Boolean(component.sectionCollapsedByDefault) ===
              nextSectionCollapsedByDefault &&
            Boolean(component.sectionSwitchEnabled) === nextSectionSwitchEnabled
          ) {
            return component;
          }
          changed = true;
          return {
            ...component,
            section: nextSection,
            sectionOrder: nextSectionOrder,
            sectionCollapsible: nextSectionCollapsible,
            sectionCollapsedByDefault: nextSectionCollapsedByDefault,
            sectionSwitchEnabled: nextSectionSwitchEnabled
          };
        });
        return changed ? { ...current, components: nextComponents } : current;
      });
    },
    [updateDefinition]
  );
  const addComponentInSection = useCallback(
    (
      type: FieldType,
      section: string | undefined,
      targetKey?: string,
      placement: DropPlacement = "after",
      explicitSectionColumn?: number
    ) => {
      updateDefinition((current) => {
        const key = makeUniqueKey(type, current.components);
        const label =
          type === "total"
            ? "Total score"
            : type === "contentBlock"
            ? "Content block"
            : key;
        const sectionMeta = resolveSectionMeta(
          current.components,
          section,
          targetKey
        );
        const targetComponent = targetKey
          ? current.components.find((component) => component.key === targetKey)
          : undefined;
        const sectionColumn =
          sectionMeta.sectionColumns && sectionMeta.sectionColumns > 1
            ? clamp(
                Math.floor(
                  Number(
                    explicitSectionColumn || targetComponent?.sectionColumn || 1
                  )
                ),
                1,
                sectionMeta.sectionColumns
              )
            : undefined;
        const insertIndex = resolveInsertIndex(
          current.components,
          sectionMeta.section,
          targetKey,
          placement
        );
        const component: FormComponent = {
          id: makeId("cmp"),
          key,
          label,
          type,
          required: false,
          section: sectionMeta.section,
          sectionId: sectionMeta.sectionId,
          sectionOrder: sectionMeta.sectionOrder,
          sectionColumns: sectionMeta.sectionColumns,
          sectionColumn,
          sectionCollapsible: sectionMeta.sectionCollapsible,
          sectionCollapsedByDefault: sectionMeta.sectionCollapsedByDefault,
          columnSpan: snapColumnSpan(
            defaultColumnSpan(type),
            current.builderOptions?.snapToResize !== false
          ),
          options:
            type === "select" || type === "radio"
              ? ["Option 1", "Option 2"]
              : type === "matrix"
              ? ["Option 1", "Option 2", "Option 3"]
              : type === "yesno"
              ? [...YES_NO_OPTIONS]
              : undefined,
          optionLabels:
            type === "yesno" ? { ...YES_NO_OPTION_LABELS } : undefined,
          matrixRows:
            type === "matrix" ? createDefaultMatrixRows(key) : undefined,
          minimum: type === "slider" ? 0 : undefined,
          maximum: type === "slider" ? 10 : undefined,
          multipleOf: type === "slider" ? 1 : undefined,
          contentText: type === "contentBlock" ? "" : undefined,
          hideLabel: type === "contentBlock" ? true : undefined,
          datagridColumns:
            type === "datagrid" ? createDefaultDataGridColumns(key) : undefined
        };
        const next = [...current.components];
        next.splice(insertIndex, 0, component);
        setSelectedId(component.id);
        setMessage("");
        return { ...current, components: next };
      });
    },
    [updateDefinition]
  );
  const moveComponentToSection = useCallback(
    (
      componentId: string,
      section: string | undefined,
      targetKey?: string,
      placement: DropPlacement = "after",
      explicitSectionColumn?: number
    ) => {
      updateDefinition((current) => {
        const sourceIndex = current.components.findIndex(
          (component) => component.id === componentId
        );
        if (sourceIndex < 0) {
          return current;
        }
        const moving = current.components[sourceIndex];
        if (targetKey && moving.key === targetKey) {
          return current;
        }
        const remaining = [...current.components];
        remaining.splice(sourceIndex, 1);
        const sectionMeta = resolveSectionMeta(remaining, section, targetKey);
        const targetComponent = targetKey
          ? remaining.find((component) => component.key === targetKey)
          : undefined;
        const sectionColumn =
          sectionMeta.sectionColumns && sectionMeta.sectionColumns > 1
            ? clamp(
                Math.floor(
                  Number(
                    explicitSectionColumn ||
                      targetComponent?.sectionColumn ||
                      moving.sectionColumn ||
                      1
                  )
                ),
                1,
                sectionMeta.sectionColumns
              )
            : undefined;
        const insertIndex = resolveInsertIndex(
          remaining,
          sectionMeta.section,
          targetKey,
          placement
        );
        const nextComponent: FormComponent = {
          ...moving,
          section: sectionMeta.section,
          sectionId: sectionMeta.sectionId,
          sectionOrder: sectionMeta.sectionOrder,
          sectionColumns: sectionMeta.sectionColumns,
          sectionColumn,
          columnSpan: clamp(
            moving.columnSpan || defaultColumnSpan(moving.type),
            1,
            12
          ),
          sectionCollapsible: sectionMeta.sectionCollapsible,
          sectionCollapsedByDefault: sectionMeta.sectionCollapsedByDefault
        };
        remaining.splice(insertIndex, 0, nextComponent);
        return { ...current, components: remaining };
      });
    },
    [updateDefinition]
  );
  const onDropPaletteType = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      const type = getDragData(event.dataTransfer, DRAG_TYPE_NEW) as FieldType;
      if (FIELD_TYPE_SET.has(type)) {
        addComponent(type);
        return;
      }
      const layoutType = getDragData(event.dataTransfer, DRAG_TYPE_LAYOUT);
      if (isLayoutTemplateType(layoutType)) {
        addLayoutTemplate(layoutType);
        return;
      }
      const systemTemplateType = getDragData(
        event.dataTransfer,
        DRAG_TYPE_SYSTEM
      );
      if (isSystemTemplateType(systemTemplateType)) {
        addSystemTemplate(systemTemplateType);
        return;
      }
      const sharedTokenKey = getDragData(event.dataTransfer, DRAG_TYPE_SHARED);
      if (sharedTokenKey) {
        const sharedEntry = sharedFieldCatalog.find(
          (item) => item.tokenKey === sharedTokenKey
        );
        if (sharedEntry) {
          addSharedField(sharedEntry);
          return;
        }
      }
      const clientTokenKey = getDragData(event.dataTransfer, DRAG_TYPE_CLIENT);
      if (clientTokenKey) {
        const clientEntry = clientFieldCatalog.find(
          (item) => item.tokenKey === clientTokenKey
        );
        if (clientEntry) {
          addClientField(clientEntry);
          return;
        }
      }
      const dragId = getDragData(event.dataTransfer, DRAG_TYPE_COMPONENT);
      if (dragId && definition.components.length) {
        reorderComponents(
          dragId,
          definition.components[definition.components.length - 1].id
        );
      }
    },
    [
      addComponent,
      addLayoutTemplate,
      addSystemTemplate,
      addSharedField,
      sharedFieldCatalog,
      addClientField,
      clientFieldCatalog,
      definition.components,
      reorderComponents
    ]
  );
  const onUndoClick = useCallback(() => {
    const previous = undoStackRef.current;
    if (!previous.length) {
      return;
    }
    const snapshotValue = previous[previous.length - 1];
    const nextUndoStack = previous.slice(0, -1);
    undoStackRef.current = nextUndoStack;
    setUndoStack(nextUndoStack);
    persist(snapshotValue.definition, snapshotValue.formData, true);
    const nextSelectedId =
      snapshotValue.selectedId &&
      snapshotValue.definition.components.some(
        (component) => component.id === snapshotValue.selectedId
      )
        ? snapshotValue.selectedId
        : snapshotValue.definition.components[0]?.id || null;
    setSelectedId(nextSelectedId);
    setMessage("Undid last change.");
    if (builderTab === "json") {
      setJsonDefinitionDraft(JSON.stringify(snapshotValue.definition, null, 2));
      setJsonDataDraft(JSON.stringify(snapshotValue.formData, null, 2));
      setJsonMessage("Undo applied.");
    }
  }, [builderTab, persist]);
  const onSaveClick = useCallback(() => {
    if (!hasHydratedDefinitionRef.current) {
      setMessage("Form is still loading. Try saving again in a moment.");
      return;
    }
    persist(definitionRef.current, formDataRef.current, false);
    runAction(source?.onSaveAction);
  }, [persist, source?.onSaveAction]);
  const onExportPdfClick = useCallback(() => {
    if (!hasHydratedDefinitionRef.current) {
      setMessage("Form is still loading. Try exporting again in a moment.");
      return;
    }
    persist(definitionRef.current, formDataRef.current, false);
    runAction(source?.onExportPdfAction);
  }, [persist, source?.onExportPdfAction]);
  const onPreviewSelectKey = useCallback(
    (key: string) => {
      const id = componentIdByKey[key];
      if (id) {
        setSelectedId(id);
      }
    },
    [componentIdByKey]
  );
  const loadJsonDraftFromCurrent = useCallback(() => {
    setJsonDefinitionDraft(JSON.stringify(definitionRef.current, null, 2));
    setJsonDataDraft(JSON.stringify(formDataRef.current, null, 2));
    setJsonMessage("");
  }, []);
  const formatJsonDrafts = useCallback(() => {
    try {
      const parsedDefinition = JSON.parse(jsonDefinitionDraft);
      const parsedData = JSON.parse(jsonDataDraft);
      setJsonDefinitionDraft(JSON.stringify(parsedDefinition, null, 2));
      setJsonDataDraft(JSON.stringify(parsedData, null, 2));
      setJsonMessage("JSON formatted.");
    } catch (error) {
      setJsonMessage(
        `Cannot format JSON: ${(error as Error)?.message || "Unknown error"}`
      );
    }
  }, [jsonDefinitionDraft, jsonDataDraft]);
  const applyJsonDrafts = useCallback(() => {
    let parsedDefinitionText: string;
    let parsedDataText: string;
    try {
      parsedDefinitionText = JSON.stringify(JSON.parse(jsonDefinitionDraft));
    } catch (error) {
      setJsonMessage(
        `Definition JSON is invalid: ${
          (error as Error)?.message || "Unknown error"
        }`
      );
      return;
    }
    try {
      parsedDataText = JSON.stringify(JSON.parse(jsonDataDraft));
    } catch (error) {
      setJsonMessage(
        `Form data JSON is invalid: ${
          (error as Error)?.message || "Unknown error"
        }`
      );
      return;
    }
    const parsedDefinition = parseDefinition(parsedDefinitionText);
    const parsedData = parseFormData(parsedDataText);
    const nextDefinition = parsedDefinition.value;
    const nextData = sanitizeFormData(parsedData.value, nextDefinition);
    const currentDefinition = definitionRef.current;
    const currentData = sanitizeFormData(
      formDataRef.current,
      definitionRef.current
    );
    const definitionChanged =
      JSON.stringify(nextDefinition) !== JSON.stringify(currentDefinition);
    const dataChanged =
      JSON.stringify(nextData) !== JSON.stringify(currentData);
    if (definitionChanged || dataChanged) {
      pushUndoSnapshot(currentDefinition, currentData, selectedIdRef.current);
    }
    persist(nextDefinition, nextData, true);
    setSelectedId((prev) =>
      prev && nextDefinition.components.some((item) => item.id === prev)
        ? prev
        : nextDefinition.components[0]?.id || null
    );
    const notes = [parsedDefinition.error, parsedData.error].filter(Boolean);
    const nextMessage = notes.length
      ? notes.join(" ")
      : "JSON changes applied.";
    setJsonMessage(nextMessage);
    setMessage(nextMessage);
  }, [jsonDefinitionDraft, jsonDataDraft, persist, pushUndoSnapshot]);
  const isViewer = props.viewMode === "viewer";
  const themePreset: ThemePreset = props.viewerThemePreset || "clean";
  const className = [
    "rjsf-builder",
    props.class,
    isViewer ? `rjsf-builder--theme-${themePreset}` : "",
    isViewer && props.previewFlow === "continuous"
      ? "rjsf-builder--preview-continuous"
      : "",
    isNarrowBuilder ? "rjsf-builder--narrow" : "",
    isPhoneBuilder ? "rjsf-builder--phone" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const showPalettePanel = resolveBooleanSetting(props.showPalettePanel, true);
  const showComponentsPanel = resolveBooleanSetting(
    props.showComponentsPanel,
    true
  );
  const showSectionPanel = resolveBooleanSetting(props.showSectionPanel, true);
  const showPropertiesPanel = resolveBooleanSetting(
    props.showPropertiesPanel,
    true
  );
  const showPreviewPanel = resolveBooleanSetting(props.showPreviewPanel, true);
  const showLayoutTools = resolveBooleanSetting(props.showLayoutTools, true);
  const showViewerHeader = resolveBooleanSetting(props.showViewerHeader, true);
  const showDocumentPreview = resolveBooleanSetting(
    props.showDocumentPreview,
    false
  );
  const formLiveValidate = resolveBooleanSetting(props.formLiveValidate, false);
  const onSectionVisibilityChange = useCallback(
    (sectionKey: string, isVisible: boolean) => {
      const normalizedKey = clean(sectionKey);
      if (!normalizedKey) {
        return;
      }
      const current = parseSectionVisibilityMap(
        formDataRef.current[SECTION_VISIBILITY_DATA_KEY]
      );
      const nextData: JsonObject = {
        ...formDataRef.current,
        [SECTION_VISIBILITY_DATA_KEY]: {
          ...current,
          [normalizedKey]: isVisible
        }
      };
      updateFormData(nextData);
    },
    [updateFormData]
  );
  const showLeftPanel = showPalettePanel || showComponentsPanel;
  const showRightPanel = showPropertiesPanel;
  const showViewerComponentsPanel =
    isViewer && showComponentsPanel && showSectionPanel;
  // Rail rows: keep every group except ones the user hid via the section
  // switch (those are excluded from output, so navigation to them is noise).
  const railSections = useMemo(
    () =>
      viewerSectionSummaries.filter(
        (section) =>
          // No visible component -> no section box in the DOM -> a rail row
          // would navigate nowhere (fully rule-hidden sections).
          section.renderedCount > 0 &&
          !(
            sectionSwitchableByKey[section.key] &&
            sectionVisibilityByKey[section.key] === false
          )
      ),
    [viewerSectionSummaries, sectionSwitchableByKey, sectionVisibilityByKey]
  );
  const layoutColumns = [
    showLeftPanel ? (leftPanelCollapsed ? "42px" : "minmax(220px, 280px)") : "",
    showPreviewPanel ? "minmax(460px, 1fr)" : "",
    showRightPanel
      ? rightPanelCollapsed
        ? "42px"
        : "minmax(340px, 440px)"
      : ""
  ]
    .filter(Boolean)
    .join(" ");
  const layoutClassName = [
    "rjsf-builder__layout",
    !showLeftPanel ? "rjsf-builder__layout--no-left" : "",
    !showPreviewPanel ? "rjsf-builder__layout--no-preview" : "",
    !showRightPanel ? "rjsf-builder__layout--no-right" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const layoutStyle = { "--rb-layout-columns": layoutColumns } as CSSProperties;
  const viewerLayoutClassName = [
    "rjsf-builder__viewer-layout",
    !showViewerComponentsPanel ? "rjsf-builder__viewer-layout--no-left" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const viewerLayoutStyle = showViewerComponentsPanel
    ? ({
        "--rb-viewer-columns": leftPanelCollapsed
          ? "42px minmax(0, 1fr)"
          : "minmax(220px, 280px) minmax(0, 1fr)"
      } as CSSProperties)
    : undefined;
  if (!source?.formDefinitionAttr) {
    return (
      <div className={className} style={props.style} tabIndex={props.tabIndex}>
        {" "}
        <div className="rjsf-builder__alert">
          {" "}
          Configure `dataSource.formDefinitionAttr` to store the builder JSON.{" "}
        </div>{" "}
      </div>
    );
  }
  // Expression-typed display settings resolve a frame or more after the
  // datasource attrs on a cold load; resolveBooleanSetting falls back to its
  // default during those frames, so a PDF page (showDocumentPreview=true via
  // expression) briefly renders the interactive viewer — wizard nav, progress
  // bar — and the document-generation capture can land on that frame. Hold
  // back the viewer until every wired expression setting has resolved.
  const displaySettingsResolving = [
    props.showPalettePanel,
    props.showComponentsPanel,
    props.showSectionPanel,
    props.showPropertiesPanel,
    props.showPreviewPanel,
    props.showLayoutTools,
    props.showViewerHeader,
    props.showDocumentPreview,
    props.formLiveValidate
  ].some(
    (setting) =>
      setting != null &&
      typeof setting !== "boolean" &&
      normalizeStatus((setting as any).status) === "loading"
  );
  if (isViewer && displaySettingsResolving) {
    return <div className={className} style={props.style} />;
  }
  const labelWidthTwelfths = definition.builderOptions?.labelWidth;
  const rootStyle: CSSProperties | undefined = labelWidthTwelfths
    ? ({
        ...props.style,
        "--rb-label-col": `${((labelWidthTwelfths / 12) * 100).toFixed(3)}%`
      } as CSSProperties)
    : props.style;
  // Form-level settings controls, rendered inline on wide builders and inside
  // the "Form settings" popover on narrow ones (same handlers, one source).
  const formSettingsControls = !isViewer ? (
    <Fragment>
      <label className="rjsf-builder__toggle">
        {" "}
        <input
          type="checkbox"
          checked={definition.builderOptions?.snapToGrid !== false}
          onChange={(event) =>
            updateBuilderOptions((options) => ({
              ...options,
              snapToGrid: event.target.checked
            }))
          }
        />{" "}
        <span>Snap to grid</span>{" "}
      </label>
      <label className="rjsf-builder__toggle">
        {" "}
        <input
          type="checkbox"
          checked={definition.builderOptions?.snapToResize !== false}
          onChange={(event) =>
            updateBuilderOptions((options) => ({
              ...options,
              snapToResize: event.target.checked
            }))
          }
        />{" "}
        <span>Snap resize</span>{" "}
      </label>
      <label className="rjsf-builder__toolbar-field rjsf-builder__toolbar-field--compact">
        {" "}
        <span>Label layout</span>{" "}
        <select
          className="rjsf-builder__select rjsf-builder__select--compact"
          value={
            definition.builderOptions?.labelLayout === "inline"
              ? "inline"
              : "block"
          }
          onChange={(event) =>
            updateBuilderOptions((options) => ({
              ...options,
              labelLayout:
                event.target.value === "inline" ? "inline" : "block"
            }))
          }
        >
          {" "}
          {LABEL_LAYOUT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {" "}
              {option.label}{" "}
            </option>
          ))}{" "}
        </select>{" "}
      </label>
      <label className="rjsf-builder__toolbar-field rjsf-builder__toolbar-field--compact">
        {" "}
        <span>Label width</span>{" "}
        <select
          className="rjsf-builder__select rjsf-builder__select--compact"
          value={String(definition.builderOptions?.labelWidth ?? "")}
          onChange={(event) => {
            const parsed = Math.round(Number(event.target.value));
            updateBuilderOptions((options) => ({
              ...options,
              labelWidth:
                Number.isFinite(parsed) && parsed >= 2 && parsed <= 6
                  ? parsed
                  : undefined
            }));
          }}
        >
          {" "}
          <option value="">Default (fixed)</option>{" "}
          <option value="2">2 / 12 (narrow)</option>{" "}
          <option value="3">3 / 12</option>{" "}
          <option value="4">4 / 12</option>{" "}
          <option value="5">5 / 12</option>{" "}
          <option value="6">6 / 12 (half)</option>{" "}
        </select>{" "}
      </label>
      <label className="rjsf-builder__toolbar-field rjsf-builder__toolbar-field--compact">
        {" "}
        <span>Fill mode</span>{" "}
        <select
          className="rjsf-builder__select rjsf-builder__select--compact"
          value={
            definition.builderOptions?.fillMode === "wizard"
              ? "wizard"
              : "scroll"
          }
          onChange={(event) =>
            updateBuilderOptions((options) => ({
              ...options,
              fillMode: event.target.value === "wizard" ? "wizard" : "scroll"
            }))
          }
        >
          {" "}
          <option value="scroll">Continuous (scroll)</option>{" "}
          <option value="wizard">Wizard (one section per page)</option>{" "}
        </select>{" "}
      </label>
    </Fragment>
  ) : null;
  // Phone-width viewer: the sections rail renders as sticky chips and ignores
  // the collapsed state (there is no rail column to collapse into).
  const viewerNavCollapsed = leftPanelCollapsed && !isPhoneBuilder;
  const formDescriptionField = !isViewer ? (
    <label className="rjsf-builder__toolbar-field rjsf-builder__toolbar-field--wide">
      {" "}
      <span>Form description</span>{" "}
      <input
        className="rjsf-builder__input"
        value={definition.description || ""}
        onChange={(event) =>
          updateDefinition((current) => ({
            ...current,
            description: event.target.value
          }))
        }
      />{" "}
    </label>
  ) : null;
  return (
    <div
      className={className}
      style={rootStyle}
      tabIndex={props.tabIndex}
      ref={setRootNode}
    >
      <WidgetToasts attr={props.toastMessageAttr} />
      {" "}
      {!isViewer || showViewerHeader ? (
        <div className="rjsf-builder__toolbar">
          {" "}
          <div className="rjsf-builder__toolbar-left">
            {" "}
            <label className="rjsf-builder__toolbar-field">
              {" "}
              <span>Form title</span>{" "}
              <input
                className="rjsf-builder__input"
                value={definition.title || ""}
                onChange={(event) =>
                  updateDefinition((current) => ({
                    ...current,
                    title: event.target.value
                  }))
                }
              />{" "}
            </label>{" "}
            {!isNarrowBuilder ? formDescriptionField : null}{" "}
          </div>{" "}
          <div className="rjsf-builder__toolbar-right">
            {" "}
            {!isViewer && !isNarrowBuilder ? (
              <div className="rjsf-builder__toolbar-toggles">
                {formSettingsControls}
              </div>
            ) : null}{" "}
            {!isViewer && isNarrowBuilder ? (
              <div
                className="rjsf-builder__toolbar-settings"
                ref={formSettingsRef}
              >
                {" "}
                <button
                  type="button"
                  className="rjsf-builder__button"
                  aria-expanded={formSettingsOpen}
                  aria-haspopup="true"
                  onClick={() => setFormSettingsOpen((current) => !current)}
                >
                  {" "}
                  Form settings ▾{" "}
                </button>{" "}
                {formSettingsOpen ? (
                  <div className="rjsf-builder__toolbar-settings-pop">
                    {formDescriptionField}
                    {formSettingsControls}
                  </div>
                ) : null}{" "}
              </div>
            ) : null}{" "}
            {!isViewer ? (
              <button
                type="button"
                className="rjsf-builder__button"
                onClick={onUndoClick}
                disabled={!undoStack.length}
                title="Undo last change"
              >
                {" "}
                Undo{" "}
              </button>
            ) : null}{" "}
            {isViewer && props.viewerHeaderWidget ? (
              <div className="rjsf-builder__toolbar-slot rjsf-builder__toolbar-slot--viewer">
                {" "}
                {props.viewerHeaderWidget}{" "}
              </div>
            ) : null}{" "}
            <button
              type="button"
              className="rjsf-builder__button rjsf-builder__button--primary"
              onClick={onSaveClick}
            >
              {" "}
              {clean(props.saveButtonText) || "Save form"}{" "}
            </button>{" "}
            {!isViewer && props.designerHeaderWidget ? (
              <div className="rjsf-builder__toolbar-slot rjsf-builder__toolbar-slot--designer">
                {" "}
                {props.designerHeaderWidget}{" "}
              </div>
            ) : null}{" "}
            {isViewer && source?.onExportPdfAction ? (
              <button
                type="button"
                className="rjsf-builder__button"
                onClick={onExportPdfClick}
                disabled={
                  source.onExportPdfAction.isExecuting ||
                  source.onExportPdfAction.canExecute === false
                }
              >
                {" "}
                {clean(props.exportPdfButtonText) || "Export PDF"}{" "}
              </button>
            ) : null}{" "}
          </div>{" "}
        </div>
      ) : null}{" "}
      {!isViewer ? (
        <div className="rjsf-builder__topline">
          {" "}
          <div
            className="rjsf-builder__modes"
            role="tablist"
            aria-label="Builder modes"
          >
            {" "}
            <button
              type="button"
              role="tab"
              aria-selected={builderTab === "designer"}
              className={`rjsf-builder__mode${
                builderTab === "designer" ? " is-active" : ""
              }`}
              onClick={() => {
                setBuilderTab("designer");
                setJsonMessage("");
              }}
            >
              {" "}
              Designer{" "}
            </button>{" "}
            <button
              type="button"
              role="tab"
              aria-selected={builderTab === "json"}
              className={`rjsf-builder__mode${
                builderTab === "json" ? " is-active" : ""
              }`}
              onClick={() => {
                setBuilderTab("json");
                loadJsonDraftFromCurrent();
              }}
            >
              {" "}
              JSON Editor{" "}
            </button>{" "}
            <button
              type="button"
              role="tab"
              aria-selected={builderTab === "preview"}
              className={`rjsf-builder__mode${
                builderTab === "preview" ? " is-active" : ""
              }`}
              onClick={() => {
                setBuilderTab("preview");
                setJsonMessage("");
              }}
            >
              {" "}
              Preview{" "}
            </button>{" "}
            <button
              type="button"
              role="tab"
              aria-selected={builderTab === "documentOutput"}
              className={`rjsf-builder__mode${
                builderTab === "documentOutput" ? " is-active" : ""
              }`}
              onClick={() => {
                setBuilderTab("documentOutput");
                setJsonMessage("");
              }}
            >
              {" "}
              Document Output{" "}
            </button>{" "}
          </div>{" "}
          <div className="rjsf-builder__stats">
            {" "}
            <span className="rjsf-builder__stat">
              {" "}
              {definition.components.length} fields{" "}
            </span>{" "}
            <span className="rjsf-builder__stat">{requiredCount} required</span>{" "}
            <span className="rjsf-builder__stat">{sectionCount} sections</span>{" "}
          </div>{" "}
        </div>
      ) : null}{" "}
      {!isViewer && isPhoneBuilder ? (
        <div className="rjsf-builder__phone-note">
          {" "}
          Editing this template needs a larger screen. Use Preview to test-fill
          here, or open on a desktop to edit.{" "}
        </div>
      ) : null}{" "}
      {message ? <div className="rjsf-builder__alert">{message}</div> : null}{" "}
      {isViewer && showDocumentPreview ? (
        <div
          className={`rjsf-builder__document-preview${
            props.previewFlow === "continuous"
              ? " rjsf-builder__document-preview--continuous"
              : ""
          }`}
        >
          {props.previewFlow === "continuous" && definition.title ? (
            <div className="rjsf-builder__document-preview-heading">
              {definition.title}
            </div>
          ) : null}
          {hasMeaningfulHtml(documentPreviewBodyHtml) ? (
            <div
              className="rjsf-builder__document-preview-body"
              dangerouslySetInnerHTML={{ __html: documentPreviewBodyHtml }}
            />
          ) : (
            <div className="rjsf-builder__document-preview-empty">
              No document output template content yet.
            </div>
          )}
        </div>
      ) : isViewer ? (
        <div className={viewerLayoutClassName} style={viewerLayoutStyle}>
          {" "}
          {showViewerComponentsPanel ? (
            <aside
              className={`rjsf-builder__panel rjsf-builder__panel--left rjsf-builder__panel--viewer-nav${
                viewerNavCollapsed ? " is-collapsed" : ""
              }`}
            >
              {" "}
              <div className="rjsf-builder__panel-head">
                {" "}
                {!viewerNavCollapsed ? (
                  <div className="rjsf-builder__title">Sections</div>
                ) : null}{" "}
                <button
                  type="button"
                  className="rjsf-builder__panel-toggle"
                  title={
                    viewerNavCollapsed
                      ? "Expand sections panel"
                      : "Collapse sections panel"
                  }
                  aria-label={
                    viewerNavCollapsed
                      ? "Expand sections panel"
                      : "Collapse sections panel"
                  }
                  onClick={() => setLeftPanelCollapsed((current) => !current)}
                >
                  {" "}
                  {viewerNavCollapsed ? ">" : "<"}{" "}
                </button>{" "}
              </div>{" "}
              {!viewerNavCollapsed ? (
                <div className="rjsf-builder__block">
                  {" "}
                  {railSections.length ? (
                    <ul className="rjsf-builder__nav-rail" role="list">
                      {" "}
                      {railSections.map((section) => (
                        <li key={section.key}>
                          <button
                            type="button"
                            className={`rjsf-builder__nav-item${
                              activeViewerSectionKey === section.key
                                ? " is-active"
                                : ""
                            }${
                              section.hasWarning ? " has-todo" : ""
                            }${
                              section.requiredCount > 0 && !section.hasWarning
                                ? " is-done"
                                : ""
                            }`}
                            onClick={() => {
                              suppressActiveUntilRef.current =
                                Date.now() + 1000;
                              setActiveViewerSectionKey(section.key);
                              scrollPreviewToSection(section.key);
                            }}
                            title={
                              section.trackableCount > 0
                                ? section.hasWarning
                                  ? `${section.name}: ${
                                      section.completedCount
                                    } of ${section.trackableCount} completed (${
                                      section.completionPercent
                                    }%). ${
                                      section.requiredIncompleteCount
                                    } required field${
                                      section.requiredIncompleteCount === 1
                                        ? ""
                                        : "s"
                                    } still incomplete.`
                                  : `${section.name}: ${section.completedCount} of ${section.trackableCount} completed (${section.completionPercent}%).`
                                : `Scroll to ${section.name}`
                            }
                          >
                            <span className="rjsf-builder__nav-name">
                              {section.name}
                            </span>
                            <span className="rjsf-builder__nav-count">
                              {section.requiredCount > 0
                                ? `${section.requiredCompleteCount}/${section.requiredCount}`
                                : "–"}
                            </span>
                          </button>
                        </li>
                      ))}{" "}
                    </ul>
                  ) : null}{" "}
                  {firstMissingRequired ? (
                    <button
                      type="button"
                      className="rjsf-builder__button rjsf-builder__button--small"
                      onClick={jumpToNextRequired}
                      title={`Scroll to "${
                        firstMissingRequired.label || firstMissingRequired.key
                      }"`}
                    >
                      {" "}
                      Jump to next required{" "}
                    </button>
                  ) : null}{" "}
                </div>
              ) : null}{" "}
            </aside>
          ) : null}{" "}
          <div className="rjsf-builder__viewer" ref={viewerFillRef}>
            {/* in-viewer "Jump to next required" bar removed 2026-08-12: the
                FormStudio editor page renders its own jump button in the
                Sections panel, so this one was a duplicate (Bill request). */}
            {" "}
            <Form
              schema={schema as any}
              uiSchema={uiSchema as any}
              formData={viewerFormData}
              validator={validator}
              idPrefix={instanceIdPrefix}
              experimental_defaultFormStateBehavior={{
                constAsDefaults: "skipOneOf"
              }}
              formContext={{
                instanceIdPrefix,
                componentMetaByKey,
                previewReorderEnabled: false,
                previewResizeEnabled: false,
                onPreviewDropField: undefined,
                onPreviewMoveComponent: undefined,
                onPreviewResizeSection: undefined,
                onPreviewMoveSection: undefined,
                onPreviewSelectKey: undefined,
                showSectionBulkToggle: true,
                showSectionVisibilityToggle: true,
                previewSectionSettingsEnabled: false,
                onPreviewUpdateSectionSettings: undefined,
                sectionSwitchableByKey,
                sectionVisibilityByKey,
                onSectionVisibilityChange,
                systemTemplateSlotRenderers,
                systemSectionHtmlBySlot,
                contentBlockTokens: contentBlockTokenValues,
                selectedPreviewKey: undefined,
                previewScrollToSectionKey: showViewerComponentsPanel
                  ? previewScrollToSectionKey
                  : undefined,
                previewScrollRequest: showViewerComponentsPanel
                  ? previewScrollRequest
                  : 0,
                sectionStatsByKey,
                wizard: wizardContext,
                activeSectionKey: activeViewerSectionKey || undefined,
                // Always on in viewer: the page-level rail reads the active
                // group from the data-active stamp even when the widget's
                // own panel is hidden.
                onActiveSectionChange: handleActiveSectionChange,
                snapToGrid: false,
                snapToResize: false,
                labelLayout:
                  definition.builderOptions?.labelLayout === "inline"
                    ? "inline"
                    : "block"
              }}
              widgets={{
                date: DateInputWidget,
                datetime: DateTimeInputWidget,
                signatureCanvas: SignatureWidget,
                contentBlock: ContentBlockWidget,
                systemDatagrid2Placeholder: SystemDatagrid2PlaceholderWidget,
                scoreTotal: ScoreTotalWidget,
                numberStepper: NumberStepperWidget,
                numberScale: NumberScaleWidget
              }}
              fields={FORM_FIELDS}
              templates={FORM_TEMPLATES}
              liveValidate={formLiveValidate}
              noHtml5Validate
              showErrorList={false}
              transformErrors={transformValidationErrors}
              onChange={(event: any) => {
                const nextData = (event?.formData || {}) as JsonObject;
                if (
                  JSON.stringify(nextData) === JSON.stringify(viewerFormData)
                ) {
                  return;
                }
                updateFormData(nextData);
              }}
            >
              {" "}
              <button
                className="rjsf-builder__hidden-submit"
                type="submit"
                tabIndex={-1}
                aria-hidden="true"
              />{" "}
            </Form>{" "}
            {viewerSnippets.length ? (
              <SnippetsLayer
                snippets={viewerSnippets}
                containerRef={viewerFillRef}
                onManage={
                  source?.onManageSnippets?.canExecute
                    ? handleManageSnippets
                    : undefined
                }
              />
            ) : null}{" "}
          </div>{" "}
        </div>
      ) : builderTab === "json" ? (
        <div className="rjsf-builder__json">
          {" "}
          <section className="rjsf-builder__panel">
            {" "}
            <div className="rjsf-builder__title">Form definition JSON</div>{" "}
            <textarea
              className="rjsf-builder__input rjsf-builder__json-textarea"
              value={jsonDefinitionDraft}
              onChange={(event) => setJsonDefinitionDraft(event.target.value)}
            />{" "}
          </section>{" "}
          <section className="rjsf-builder__panel">
            {" "}
            <div className="rjsf-builder__title">Form data JSON</div>{" "}
            <textarea
              className="rjsf-builder__input rjsf-builder__json-textarea"
              value={jsonDataDraft}
              onChange={(event) => setJsonDataDraft(event.target.value)}
            />{" "}
            <div className="rjsf-builder__button-row">
              {" "}
              <button
                type="button"
                className="rjsf-builder__button"
                onClick={loadJsonDraftFromCurrent}
              >
                {" "}
                Reload current{" "}
              </button>{" "}
              <button
                type="button"
                className="rjsf-builder__button"
                onClick={formatJsonDrafts}
              >
                {" "}
                Format JSON{" "}
              </button>{" "}
              <button
                type="button"
                className="rjsf-builder__button rjsf-builder__button--primary"
                onClick={applyJsonDrafts}
              >
                {" "}
                Apply JSON{" "}
              </button>{" "}
            </div>{" "}
            {jsonMessage ? (
              <div className="rjsf-builder__help">{jsonMessage}</div>
            ) : null}{" "}
          </section>{" "}
          <section className="rjsf-builder__panel">
            {" "}
            <div className="rjsf-builder__title">
              {" "}
              Generated schema (read-only){" "}
            </div>{" "}
            <textarea
              className="rjsf-builder__input rjsf-builder__json-textarea"
              value={JSON.stringify(schema, null, 2)}
              readOnly
            />{" "}
          </section>{" "}
          <section className="rjsf-builder__panel">
            {" "}
            <div className="rjsf-builder__title">
              {" "}
              Generated uiSchema (read-only){" "}
            </div>{" "}
            <textarea
              className="rjsf-builder__input rjsf-builder__json-textarea"
              value={JSON.stringify(uiSchema, null, 2)}
              readOnly
            />{" "}
          </section>{" "}
        </div>
      ) : builderTab === "preview" ? (
        <section className="rjsf-builder__panel rjsf-builder__panel--preview-full">
          {" "}
          <div className="rjsf-builder__title">
            Preview (RJSF renderer)
          </div>{" "}
          <div className="rjsf-builder__help">
            {" "}
            End-user preview mode using the same RJSF schema/uiSchema output.{" "}
          </div>{" "}
          <Form
            schema={schema as any}
            uiSchema={uiSchema as any}
            formData={formData}
            validator={validator}
            idPrefix={instanceIdPrefix}
            experimental_defaultFormStateBehavior={{
              constAsDefaults: "skipOneOf"
            }}
            formContext={{
              instanceIdPrefix,
              componentMetaByKey,
              previewReorderEnabled: false,
              previewResizeEnabled: false,
              onPreviewDropField: undefined,
              onPreviewMoveComponent: undefined,
              onPreviewResizeSection: undefined,
              onPreviewMoveSection: undefined,
              onPreviewSelectKey: undefined,
              showSectionBulkToggle: true,
              showSectionVisibilityToggle: true,
              previewSectionSettingsEnabled: false,
              onPreviewUpdateSectionSettings: undefined,
              sectionSwitchableByKey,
              sectionVisibilityByKey,
              onSectionVisibilityChange,
              systemTemplateSlotRenderers,
              systemSectionHtmlBySlot,
              contentBlockTokens: contentBlockTokenValues,
              selectedPreviewKey: undefined,
              sectionStatsByKey,
              wizard: wizardContext,
              snapToGrid: false,
              snapToResize: false,
              labelLayout:
                definition.builderOptions?.labelLayout === "inline"
                  ? "inline"
                  : "block"
            }}
            widgets={{
              date: DateInputWidget,
                datetime: DateTimeInputWidget,
              signatureCanvas: SignatureWidget,
              contentBlock: ContentBlockWidget,
              systemDatagrid2Placeholder: SystemDatagrid2PlaceholderWidget,
                scoreTotal: ScoreTotalWidget,
              numberStepper: NumberStepperWidget,
              numberScale: NumberScaleWidget
            }}
            fields={FORM_FIELDS}
            templates={FORM_TEMPLATES}
            liveValidate={formLiveValidate}
            noHtml5Validate
            showErrorList={false}
            transformErrors={transformValidationErrors}
            onChange={(event: any) =>
              updateFormData((event?.formData || {}) as JsonObject)
            }
          >
            {" "}
            <button
              className="rjsf-builder__hidden-submit"
              type="submit"
              tabIndex={-1}
              aria-hidden="true"
            />{" "}
          </Form>{" "}
        </section>
      ) : builderTab === "documentOutput" ? (
        <section className="rjsf-builder__panel rjsf-builder__panel--preview-full">
          {" "}
          {documentOutputWorkspace}{" "}
        </section>
      ) : (
        <Fragment>
          {" "}
          <div className={layoutClassName} style={layoutStyle}>
            {" "}
            {showLeftPanel ? (
              <aside
                className={`rjsf-builder__panel rjsf-builder__panel--left${
                  leftPanelCollapsed ? " is-collapsed" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDropPaletteType}
              >
                {" "}
                <div className="rjsf-builder__panel-head">
                  {" "}
                  {!leftPanelCollapsed ? (
                    <div className="rjsf-builder__title">Builder panels</div>
                  ) : null}{" "}
                  <button
                    type="button"
                    className="rjsf-builder__panel-toggle"
                    title={
                      leftPanelCollapsed
                        ? "Expand left panel"
                        : "Collapse left panel to the left"
                    }
                    aria-label={
                      leftPanelCollapsed
                        ? "Expand left panel"
                        : "Collapse left panel to the left"
                    }
                    onClick={() => setLeftPanelCollapsed((current) => !current)}
                  >
                    {" "}
                    {leftPanelCollapsed ? ">" : "<"}{" "}
                  </button>{" "}
                </div>{" "}
                {!leftPanelCollapsed && showPalettePanel ? (
                  <div className="rjsf-builder__block">
                    {" "}
                    <div className="rjsf-builder__title">Toolbox</div>{" "}
                    <label className="rjsf-builder__field">
                      {" "}
                      <span>Search toolbox</span>{" "}
                      <input
                        className="rjsf-builder__input"
                        placeholder="Find question type..."
                        value={paletteFilter}
                        onChange={(event) =>
                          setPaletteFilter(event.target.value)
                        }
                      />{" "}
                    </label>{" "}
                    <div className="rjsf-builder__palette">
                      {" "}
                      {showLayoutTools ? (
                        <Fragment>
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            Layout
                          </div>{" "}
                          {filteredLayoutTemplates.map((item) => (
                            <button
                              key={item.type}
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--ghost"
                              draggable
                              onDragStart={(event) =>
                                setDragData(
                                  event.dataTransfer,
                                  DRAG_TYPE_LAYOUT,
                                  item.type
                                )
                              }
                              onClick={() => addLayoutTemplate(item.type)}
                            >
                              {" "}
                              + {item.label}{" "}
                            </button>
                          ))}{" "}
                        </Fragment>
                      ) : null}{" "}
                      <div className="rjsf-builder__subtitle">Questions</div>{" "}
                      {filteredFieldGroups.map((group) => (
                        <div
                          key={group.key}
                          className="rjsf-builder__palette-group"
                        >
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            {" "}
                            {group.label}{" "}
                          </div>{" "}
                          {group.items.map((item) => (
                            <button
                              key={item.type}
                              type="button"
                              className="rjsf-builder__button"
                              draggable
                              onDragStart={(event) =>
                                setDragData(
                                  event.dataTransfer,
                                  DRAG_TYPE_NEW,
                                  item.type
                                )
                              }
                              onClick={() => addComponent(item.type)}
                            >
                              {" "}
                              + {item.label}{" "}
                            </button>
                          ))}{" "}
                        </div>
                      ))}{" "}
                      {filteredSystemTemplates.length ? (
                        <Fragment>
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            {" "}
                            System templates{" "}
                          </div>{" "}
                          {filteredSystemTemplates.map((item) => (
                            <button
                              key={item.type}
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--ghost"
                              draggable
                              onDragStart={(event) =>
                                setDragData(
                                  event.dataTransfer,
                                  DRAG_TYPE_SYSTEM,
                                  item.type
                                )
                              }
                              onClick={() => addSystemTemplate(item.type)}
                            >
                              {" "}
                              + {item.label}{" "}
                            </button>
                          ))}{" "}
                        </Fragment>
                      ) : null}{" "}
                      {filteredSharedFields.length ? (
                        <Fragment>
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            {" "}
                            Shared fields{" "}
                          </div>{" "}
                          {filteredSharedFields.map((item) => (
                            <button
                              key={item.tokenKey}
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--ghost rjsf-builder__button--shared"
                              draggable
                              title={
                                item.canonical
                                  ? `Canonical shared field (${item.tokenKey}) - any form carrying it can update the shared value.`
                                  : `Reads from "${item.sourceCode || "shared registry"}" (${item.tokenKey}) - values typed on other forms do not update it.`
                              }
                              onDragStart={(event) =>
                                setDragData(
                                  event.dataTransfer,
                                  DRAG_TYPE_SHARED,
                                  item.tokenKey
                                )
                              }
                              onClick={() => addSharedField(item)}
                            >
                              {" "}
                              + {item.label}{" "}
                              <span className="rjsf-builder__shared-owner">
                                {item.canonical
                                  ? "canonical"
                                  : `reads from ${item.sourceCode || "shared registry"}`}
                              </span>{" "}
                            </button>
                          ))}{" "}
                        </Fragment>
                      ) : null}{" "}
                      {filteredClientFields.length ? (
                        <Fragment>
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            {" "}
                            Client fields{" "}
                          </div>{" "}
                          {filteredClientFields.map((item) => (
                            <button
                              key={item.tokenKey}
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--ghost rjsf-builder__button--shared"
                              draggable
                              title={`Prefills from client data (${item.tokenKey}) when the form opens; the user can edit the value.`}
                              onDragStart={(event) =>
                                setDragData(
                                  event.dataTransfer,
                                  DRAG_TYPE_CLIENT,
                                  item.tokenKey
                                )
                              }
                              onClick={() => addClientField(item)}
                            >
                              {" "}
                              + {item.label}{" "}
                              <span className="rjsf-builder__shared-owner">
                                prefills from client
                              </span>{" "}
                            </button>
                          ))}{" "}
                        </Fragment>
                      ) : null}{" "}
                      {!filteredLayoutTemplates.length &&
                      !filteredSystemTemplates.length &&
                      !filteredFieldGroups.length ? (
                        <div className="rjsf-builder__empty">
                          {" "}
                          No toolbox items match your search.{" "}
                        </div>
                      ) : null}{" "}
                    </div>{" "}
                    <div className="rjsf-builder__help">
                      {" "}
                      Drag toolbox items into Preview/Components, or click to
                      append.{" "}
                    </div>{" "}
                    <div className="rjsf-builder__help rjsf-builder__help--shortcuts">
                      {" "}
                      <b>Shortcuts:</b> Ctrl+D duplicate &middot; Ctrl+C /
                      Ctrl+V copy &amp; paste field &middot; Del delete &middot;
                      Ctrl+&uarr;/&darr; move &middot; Ctrl+Z undo{" "}
                    </div>{" "}
                  </div>
                ) : null}{" "}
                {!leftPanelCollapsed && showComponentsPanel ? (
                  <div className="rjsf-builder__block">
                    {" "}
                    <div className="rjsf-builder__title">Components</div>{" "}
                    {showSectionPanel && sectionSummaries.length ? (
                      <div className="rjsf-builder__chips">
                        {" "}
                        {sectionSummaries.map((section) => (
                          <button
                            key={section.key}
                            type="button"
                            className="rjsf-builder__chip rjsf-builder__chip--interactive"
                            onClick={() => scrollPreviewToSection(section.key)}
                            title={`Scroll to ${section.name}`}
                          >
                            {" "}
                            {section.name}: {section.count}{" "}
                          </button>
                        ))}{" "}
                      </div>
                    ) : null}{" "}
                    <div className="rjsf-builder__components">
                      {" "}
                      {definition.components.map((component) => (
                        <button
                          key={component.id}
                          type="button"
                          className={`rjsf-builder__component${
                            selectedComponent?.id === component.id
                              ? " is-selected"
                              : ""
                          }`}
                          draggable
                          onClick={() => setSelectedId(component.id)}
                          onDragStart={(event) => {
                            setDraggingComponentId(component.id);
                            setDragData(
                              event.dataTransfer,
                              DRAG_TYPE_COMPONENT,
                              component.id
                            );
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const dragId =
                              getDragData(
                                event.dataTransfer,
                                DRAG_TYPE_COMPONENT
                              ) || draggingComponentId;
                            if (dragId) {
                              reorderComponents(dragId, component.id);
                            }
                            setDraggingComponentId(null);
                          }}
                          onDragEnd={() => setDraggingComponentId(null)}
                        >
                          {" "}
                          <span className="rjsf-builder__component-main">
                            {" "}
                            <span className="rjsf-builder__component-title">
                              {" "}
                              {component.label || component.key}{" "}
                            </span>{" "}
                            <span className="rjsf-builder__component-key">
                              {" "}
                              {component.key}{" "}
                            </span>{" "}
                          </span>{" "}
                          <span className="rjsf-builder__component-type">
                            {" "}
                            {component.type}{" "}
                          </span>{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                ) : null}{" "}
              </aside>
            ) : null}{" "}
            {showPreviewPanel ? (
              <section className="rjsf-builder__panel rjsf-builder__panel--preview">
                {" "}
                <div className="rjsf-builder__title">Live preview</div>{" "}
                <div className="rjsf-builder__help">
                  {" "}
                  Drag ::: to reorder. Drag corner grips to resize fields or
                  section columns.{" "}
                </div>{" "}
                <label className="rjsf-builder__toggle">
                  {" "}
                  <input
                    type="checkbox"
                    checked={simulateRules}
                    onChange={(event) =>
                      setSimulateRules(event.target.checked)
                    }
                  />{" "}
                  <span className="rjsf-builder__toggle-label">
                    {" "}
                    Simulate visibility rules{" "}
                    <span
                      className="rjsf-builder__tooltip-icon"
                      tabIndex={0}
                      title="Off: every field renders here so you can reach rule-gated ones (marked with an eye badge). On: the canvas hides and shows fields exactly as the runtime will."
                      aria-label="Off: every field renders here so you can reach rule-gated ones. On: the canvas behaves like the runtime."
                    >
                      {" "}
                      ?{" "}
                    </span>{" "}
                  </span>{" "}
                </label>{" "}
                <Form
                  schema={designerPreviewSchema as any}
                  uiSchema={uiSchema as any}
                  formData={formData}
                  validator={validator}
                  idPrefix={instanceIdPrefix}
                  experimental_defaultFormStateBehavior={{
                    constAsDefaults: "skipOneOf"
                  }}
                  formContext={{
                    instanceIdPrefix,
                    componentMetaByKey,
                    previewReorderEnabled: true,
                    previewResizeEnabled: true,
                    previewReorderKeys: definition.components
                      .filter((component) => !component.repeatGroup)
                      .map((component) => component.key),
                    onPreviewReorder: reorderByPreviewKey,
                    onPreviewResize: resizeByPreviewKey,
                    onPreviewResizeSection: resizeSectionByPreviewKey,
                    onPreviewMoveSection: reorderSectionByPreviewKey,
                    onPreviewDropField: addComponentInSection,
                    onPreviewMoveComponent: moveComponentToSection,
                    onPreviewSelectKey,
                    onPreviewFieldAction,
                    showSectionBulkToggle: true,
                    showSectionVisibilityToggle: false,
                    previewSectionSettingsEnabled: true,
                    onPreviewUpdateSectionSettings:
                      updateSectionSettingsByPreviewKey,
                    previewDataGridKeys,
                    onPreviewOpenDataGridSettings: openDataGridSettingsByKey,
                    sectionSwitchableByKey,
                    sectionVisibilityByKey,
                    onSectionVisibilityChange,
                    systemTemplateSlotRenderers,
                    systemSectionHtmlBySlot,
                    contentBlockTokens: contentBlockTokenValues,
                    selectedPreviewKey: selectedComponent?.key,
                    previewScrollToSectionKey,
                    previewScrollRequest,
                    snapToGrid: definition.builderOptions?.snapToGrid !== false,
                    snapToResize:
                      definition.builderOptions?.snapToResize !== false,
                    labelLayout:
                      definition.builderOptions?.labelLayout === "inline"
                        ? "inline"
                        : "block"
                  }}
                  widgets={{
                    date: DateInputWidget,
                datetime: DateTimeInputWidget,
                    signatureCanvas: SignatureWidget,
                    contentBlock: ContentBlockWidget,
                    systemDatagrid2Placeholder: SystemDatagrid2PlaceholderWidget,
                scoreTotal: ScoreTotalWidget,
                    numberStepper: NumberStepperWidget,
                    numberScale: NumberScaleWidget
                  }}
                  fields={FORM_FIELDS}
                  templates={FORM_TEMPLATES}
                  liveValidate={formLiveValidate}
                  noHtml5Validate
                  showErrorList={false}
                  transformErrors={transformValidationErrors}
                  onChange={(event: any) =>
                    updateFormData((event?.formData || {}) as JsonObject)
                  }
                >
                  {" "}
                  <button
                    className="rjsf-builder__hidden-submit"
                    type="submit"
                    tabIndex={-1}
                    aria-hidden="true"
                  />{" "}
                </Form>{" "}
              </section>
            ) : null}{" "}
            {showRightPanel ? (
              <aside
                className={`rjsf-builder__panel rjsf-builder__panel--right${
                  rightPanelCollapsed ? " is-collapsed" : ""
                }`}
              >
                {" "}
                <div className="rjsf-builder__panel-head">
                  {" "}
                  {!rightPanelCollapsed ? (
                    <div className="rjsf-builder__title">Properties</div>
                  ) : null}{" "}
                  <button
                    type="button"
                    className="rjsf-builder__panel-toggle"
                    title={
                      rightPanelCollapsed
                        ? "Expand right panel"
                        : "Collapse right panel to the right"
                    }
                    aria-label={
                      rightPanelCollapsed
                        ? "Expand right panel"
                        : "Collapse right panel to the right"
                    }
                    onClick={() =>
                      setRightPanelCollapsed((current) => !current)
                    }
                  >
                    {" "}
                    {rightPanelCollapsed ? "<" : ">"}{" "}
                  </button>{" "}
                </div>{" "}
                {rightPanelCollapsed ? null : selectedComponent ? (
                  <div className="rjsf-builder__form">
                    {" "}
                    <div className="rjsf-builder__panel-tabs">
                      {" "}
                      <button
                        type="button"
                        className={`rjsf-builder__panel-tab${
                          isPropertiesTab ? " is-active" : ""
                        }`}
                        onClick={() => setRightPanelTab("properties")}
                      >
                        {" "}
                        Properties{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className={`rjsf-builder__panel-tab${
                          isDocumentOutputTab ? " is-active" : ""
                        }`}
                        onClick={() => setRightPanelTab("documentOutput")}
                      >
                        {" "}
                        Document Output{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className={`rjsf-builder__panel-tab${
                          isValidationTab ? " is-active" : ""
                        }`}
                        onClick={() => setRightPanelTab("validation")}
                      >
                        {" "}
                        Validation{" "}
                      </button>{" "}
                    </div>{" "}
                    {isPropertiesTab ? (
                      <details
                        key={`grp-setup-${selectedComponent.id}`}
                        className="rjsf-builder__group"
                        open
                      >
                        <summary>
                          <span className="rjsf-builder__group-chev">▶</span>
                          Field setup
                          <span className="rjsf-builder__group-peek">
                            {`${selectedComponent.key} · ${
                              FIELD_TYPES.find(
                                (entry) => entry.type === selectedComponent.type
                              )?.label || selectedComponent.type
                            }`}
                          </span>
                        </summary>
                        <div className="rjsf-builder__group-body">
                      <Fragment>
                        {" "}
                        {selectedComponentSharedEntry ? null : (
                        <label className="rjsf-builder__field">
                          {" "}
                          <span>Key</span>{" "}
                          <input
                            className="rjsf-builder__input"
                            value={selectedComponent.key}
                            onChange={(event) => {
                              const raw = normalizeKey(event.target.value);
                              if (!raw) {
                                return;
                              }
                              if (
                                clean(selectedComponent.sharedFieldRef) &&
                                raw !== selectedComponent.key
                              ) {
                                // Redesign step 9: enforce, don't warn. The
                                // server guard would block this at publish;
                                // stop the user here instead.
                                setMessage(
                                  `This field is bound to shared field "${clean(
                                    selectedComponent.sharedFieldRef
                                  )}" — its key is locked. Unbind the shared field first if you really need to rename it.`
                                );
                                return;
                              }
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) =>
                                    component.id === selectedComponent.id
                                      ? {
                                          ...component,
                                          key: makeUniqueKey(
                                            raw,
                                            current.components,
                                            component.id
                                          )
                                        }
                                      : component
                                )
                              }));
                            }}
                          />{" "}
                        </label>
                        )}{" "}
                        <label className="rjsf-builder__field">
                          {" "}
                          <span>Label</span>{" "}
                          <input
                            className="rjsf-builder__input"
                            value={selectedComponent.label}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) =>
                                    component.id === selectedComponent.id
                                      ? {
                                          ...component,
                                          label: event.target.value
                                        }
                                      : component
                                )
                              }))
                            }
                          />{" "}
                        </label>{" "}
                        {selectedComponent.type !== "total" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__subtitle">
                              {" "}
                              Label display{" "}
                            </div>{" "}
                            <div className="rjsf-builder__label-display-row">
                              {" "}
                              <label className="rjsf-builder__toggle rjsf-builder__label-display-toggle">
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={Boolean(selectedComponent.hideLabel)}
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                hideLabel: event.target.checked
                                              }
                                            : component
                                      )
                                    }))
                                  }
                                />{" "}
                                <span>Hide label</span>{" "}
                              </label>{" "}
                              <label className="rjsf-builder__field rjsf-builder__label-display-position">
                                {" "}
                                <span>Position</span>{" "}
                                <select
                                  className="rjsf-builder__select"
                                  value={
                                    selectedComponent.labelLayoutOverride ||
                                    "default"
                                  }
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                labelLayoutOverride:
                                                  event.target.value ===
                                                  "inline"
                                                    ? "inline"
                                                    : event.target.value ===
                                                      "block"
                                                    ? "block"
                                                    : undefined
                                              }
                                            : component
                                      )
                                    }))
                                  }
                                >
                                  {" "}
                                  <option value="default">
                                    {" "}
                                    Default (use form label layout){" "}
                                  </option>{" "}
                                  <option value="block">
                                    Above field
                                  </option>{" "}
                                  <option value="inline">
                                    In front of field
                                  </option>{" "}
                                </select>{" "}
                              </label>{" "}
                            </div>{" "}
                            {selectedComponent.type === "radio" ||
                            selectedComponent.type === "yesno" ||
                            selectedComponent.type === "checkbox" ? (
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Option style</span>{" "}
                                <select
                                  className="rjsf-builder__select"
                                  value={
                                    selectedComponent.optionStyle || "standard"
                                  }
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                optionStyle:
                                                  event.target.value ===
                                                  "modern"
                                                    ? "modern"
                                                    : event.target.value ===
                                                      "switch"
                                                    ? "switch"
                                                    : undefined
                                              }
                                            : component
                                      )
                                    }))
                                  }
                                >
                                  {" "}
                                  <option value="standard">
                                    Standard (radios / checkboxes)
                                  </option>{" "}
                                  <option value="modern">
                                    Modern (buttons / boxed)
                                  </option>{" "}
                                  {selectedComponent.type === "checkbox" ? (
                                    <option value="switch">
                                      Switch (toggle)
                                    </option>
                                  ) : null}{" "}
                                </select>{" "}
                              </label>
                            ) : null}{" "}
                            {selectedComponent.type === "number" ? (
                              <Fragment>
                                <label className="rjsf-builder__field">
                                  {" "}
                                  <span>Option style</span>{" "}
                                  <select
                                    className="rjsf-builder__select"
                                    value={
                                      selectedComponent.numberStyle || "input"
                                    }
                                    onChange={(event) =>
                                      updateDefinition((current) => ({
                                        ...current,
                                        components: current.components.map(
                                          (component) => {
                                            if (
                                              component.id !==
                                              selectedComponent.id
                                            ) {
                                              return component;
                                            }
                                            const raw = event.target.value;
                                            const nextStyle =
                                              raw === "stepper" ||
                                              raw === "slider" ||
                                              raw === "scale"
                                                ? raw
                                                : undefined;
                                            return {
                                              ...component,
                                              numberStyle: nextStyle,
                                              // Slider/stepper/scale are
                                              // step-driven; default to whole
                                              // numbers unless already chosen.
                                              wholeNumber:
                                                nextStyle &&
                                                component.wholeNumber == null
                                                  ? true
                                                  : component.wholeNumber
                                            };
                                          }
                                        )
                                      }))
                                    }
                                  >
                                    {" "}
                                    <option value="input">
                                      Input (standard)
                                    </option>{" "}
                                    <option value="stepper">
                                      Stepper (− / + counter)
                                    </option>{" "}
                                    <option value="slider">
                                      Slider (drag track)
                                    </option>{" "}
                                    <option value="scale">
                                      Scale (numbered buttons)
                                    </option>{" "}
                                  </select>{" "}
                                </label>
                                <label className="rjsf-builder__toggle">
                                  {" "}
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      selectedComponent.wholeNumber
                                    )}
                                    onChange={(event) =>
                                      updateDefinition((current) => ({
                                        ...current,
                                        components: current.components.map(
                                          (component) =>
                                            component.id ===
                                            selectedComponent.id
                                              ? {
                                                  ...component,
                                                  wholeNumber: event.target
                                                    .checked
                                                    ? true
                                                    : undefined,
                                                  defaultValue:
                                                    event.target.checked &&
                                                    typeof component.defaultValue ===
                                                      "number"
                                                      ? Math.trunc(
                                                          component.defaultValue
                                                        )
                                                      : component.defaultValue
                                                }
                                              : component
                                        )
                                      }))
                                    }
                                  />{" "}
                                  <span>Whole numbers only</span>{" "}
                                </label>
                                {(selectedComponent.numberStyle === "slider" ||
                                  selectedComponent.numberStyle ===
                                    "scale") && (
                                  <span className="rjsf-builder__help">
                                    Uses Min / Max / Step from Validation
                                    (defaults 0–10, step 1).
                                  </span>
                                )}
                              </Fragment>
                            ) : null}{" "}
                          </div>
                        ) : null}{" "}
                        {selectedComponentSharedEntry ? null : (
                        <label className="rjsf-builder__field">
                          {" "}
                          <span>Type</span>{" "}
                          <select
                            className="rjsf-builder__select"
                            value={selectedComponent.type}
                            disabled={
                              selectedComponent.type === "systemDatagrid2"
                            }
                            title={
                              selectedComponent.type === "systemDatagrid2"
                                ? "System template fields keep a fixed type."
                                : undefined
                            }
                            onChange={(event) => {
                              // Redesign step 9: type is locked while bound to
                              // a shared field (server publish guard enforces
                              // the same; stop the user here).
                              if (clean(selectedComponent.sharedFieldRef)) {
                                setMessage(
                                  `This field is bound to shared field "${clean(
                                    selectedComponent.sharedFieldRef
                                  )}" — its type is locked. Unbind the shared field first to change it.`
                                );
                                return;
                              }
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (component.id !== selectedComponent.id) {
                                      return component;
                                    }
                                    const nextType = normalizeFieldType(
                                      event.target.value
                                    );
                                    const isChoiceType =
                                      nextType === "select" ||
                                      nextType === "radio";
                                    const isTotalType = nextType === "total";
                                    const isDataGridType =
                                      nextType === "datagrid" ||
                                      nextType === "systemDatagrid2";
                                    const isSystemDatagrid2Type =
                                      nextType === "systemDatagrid2";
                                    const isContentBlockType =
                                      nextType === "contentBlock";
                                    const isYesNoType = nextType === "yesno";
                                    const isMatrixType = nextType === "matrix";
                                    const isNumericType =
                                      nextType === "integer" ||
                                      nextType === "number" ||
                                      nextType === "slider";
                                    const isTextValidationType =
                                      nextType === "text" ||
                                      nextType === "textarea" ||
                                      nextType === "email";
                                    const nextMultiSelect =
                                      nextType === "select" ||
                                      nextType === "radio"
                                        ? Boolean(component.multiSelect)
                                        : false;
                                    const nextDefaultValue = (() => {
                                      if (
                                        isTotalType ||
                                        isContentBlockType ||
                                        isMatrixType
                                      ) {
                                        return undefined;
                                      }
                                      if (isYesNoType) {
                                        return normalizeYesNoValue(
                                          component.defaultValue
                                        );
                                      }
                                      if (
                                        (nextType === "select" ||
                                          nextType === "radio") &&
                                        nextMultiSelect
                                      ) {
                                        return (
                                          normalizeMultiSelectValues(
                                            component.defaultValue,
                                            component.options
                                          ) || []
                                        );
                                      }
                                      if (
                                        Array.isArray(component.defaultValue)
                                      ) {
                                        return firstArrayStringValue(
                                          component.defaultValue
                                        );
                                      }
                                      return component.defaultValue;
                                    })();
                                    return {
                                      ...component,
                                      type: nextType,
                                      required:
                                        isTotalType ||
                                        isSystemDatagrid2Type ||
                                        isContentBlockType
                                          ? false
                                          : component.required,
                                      placeholder: isTotalType
                                        ? undefined
                                        : component.placeholder,
                                      defaultValue: nextDefaultValue,
                                      minimum: isNumericType
                                        ? component.minimum
                                        : undefined,
                                      maximum: isNumericType
                                        ? component.maximum
                                        : undefined,
                                      multipleOf: isNumericType
                                        ? component.multipleOf
                                        : undefined,
                                      numberStyle:
                                        nextType === "number"
                                          ? component.numberStyle
                                          : undefined,
                                      wholeNumber:
                                        nextType === "number"
                                          ? component.wholeNumber
                                          : undefined,
                                      minLength: isTextValidationType
                                        ? component.minLength
                                        : undefined,
                                      maxLength: isTextValidationType
                                        ? component.maxLength
                                        : undefined,
                                      pattern: isTextValidationType
                                        ? component.pattern
                                        : undefined,
                                      repeatGroup:
                                        isTotalType ||
                                        isDataGridType ||
                                        isContentBlockType ||
                                        isMatrixType
                                          ? undefined
                                          : component.repeatGroup,
                                      columnSpan:
                                        component.columnSpan ||
                                        defaultColumnSpan(nextType),
                                      options: isChoiceType
                                        ? component.options?.length
                                          ? component.options
                                          : ["Option 1", "Option 2"]
                                        : isMatrixType
                                        ? component.options?.length
                                          ? component.options
                                          : ["Option 1", "Option 2", "Option 3"]
                                        : isYesNoType
                                        ? [...YES_NO_OPTIONS]
                                        : undefined,
                                      optionLabels:
                                        isChoiceType || isMatrixType
                                          ? component.optionLabels
                                          : isYesNoType
                                          ? { ...YES_NO_OPTION_LABELS }
                                          : undefined,
                                      optionScores:
                                        isChoiceType ||
                                        isYesNoType ||
                                        isMatrixType
                                          ? component.optionScores
                                          : undefined,
                                      matrixRows: isMatrixType
                                        ? normalizeMatrixRows(
                                            component.matrixRows
                                          ) ||
                                          createDefaultMatrixRows(component.key)
                                        : undefined,
                                      contentText: isContentBlockType
                                        ? component.contentText ?? ""
                                        : undefined,
                                      hideLabel:
                                        isContentBlockType &&
                                        component.type !== "contentBlock"
                                          ? true
                                          : component.hideLabel,
                                      datagridColumns: isDataGridType
                                        ? normalizeDataGridColumns(
                                            component.datagridColumns
                                          ) ||
                                          createDefaultDataGridColumns(
                                            component.key
                                          )
                                        : undefined,
                                      systemTemplateType: isSystemDatagrid2Type
                                        ? component.systemTemplateType
                                        : undefined,
                                      systemTemplateSlotProperty:
                                        isSystemDatagrid2Type
                                          ? component.systemTemplateSlotProperty
                                          : undefined,
                                      datagridRowIdKey: isDataGridType
                                        ? component.datagridRowIdKey
                                        : undefined,
                                      datagridDisplay:
                                        nextType === "datagrid"
                                          ? component.datagridDisplay
                                          : undefined,
                                      multiSelect: nextMultiSelect,
                                      dateGranularity:
                                        nextType === "date"
                                          ? component.dateGranularity
                                          : undefined,
                                      dateDisplayFormat:
                                        nextType === "date" ||
                                        nextType === "datetime"
                                          ? component.dateDisplayFormat
                                          : undefined,
                                      timeDisplayFormat:
                                        nextType === "time" ||
                                        nextType === "datetime"
                                          ? component.timeDisplayFormat
                                          : undefined,
                                      sumSources: isTotalType
                                        ? component.sumSources
                                        : undefined
                                    };
                                  }
                                )
                              }));
                            }}
                          >
                            {" "}
                            {FIELD_TYPES.filter(
                              (item) => item.type !== "switch"
                            ).map((item) => (
                              <option key={item.type} value={item.type}>
                                {" "}
                                {item.label}{" "}
                              </option>
                            ))}{" "}
                          </select>{" "}
                        </label>
                        )}{" "}
                        {selectedComponent.type === "date" ||
                        selectedComponent.type === "time" ||
                        selectedComponent.type === "datetime" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            {selectedComponent.type === "date" ? (
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Date detail</span>{" "}
                                <select
                                  className="rjsf-builder__select"
                                  value={
                                    selectedComponent.dateGranularity || "full"
                                  }
                                  onChange={(event) => {
                                    const raw = event.target.value;
                                    const nextGranularity =
                                      raw === "monthYear" ||
                                      raw === "month" ||
                                      raw === "year" ||
                                      raw === "day"
                                        ? (raw as DateGranularity)
                                        : undefined;
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                dateGranularity:
                                                  nextGranularity,
                                                // stored value shape changes
                                                // with the detail level
                                                defaultValue:
                                                  nextGranularity ===
                                                  (component.dateGranularity ||
                                                    undefined)
                                                    ? component.defaultValue
                                                    : undefined
                                              }
                                            : component
                                      )
                                    }));
                                  }}
                                >
                                  <option value="full">Full date</option>
                                  <option value="monthYear">
                                    Month &amp; year
                                  </option>
                                  <option value="month">Month only</option>
                                  <option value="year">Year only</option>
                                  <option value="day">Day of month</option>
                                </select>{" "}
                              </label>
                            ) : null}{" "}
                            {(selectedComponent.type === "date" &&
                              (!selectedComponent.dateGranularity ||
                                selectedComponent.dateGranularity === "full" ||
                                selectedComponent.dateGranularity ===
                                  "monthYear")) ||
                            selectedComponent.type === "datetime" ? (
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Date format (documents)</span>{" "}
                                <select
                                  className="rjsf-builder__select"
                                  value={
                                    selectedComponent.dateDisplayFormat ||
                                    "numeric"
                                  }
                                  onChange={(event) => {
                                    const raw = event.target.value;
                                    const nextFormat =
                                      raw === "long" || raw === "iso"
                                        ? (raw as DateDisplayFormat)
                                        : undefined;
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                dateDisplayFormat: nextFormat
                                              }
                                            : component
                                      )
                                    }));
                                  }}
                                >
                                  <option value="numeric">
                                    Numeric — 8/20/2026
                                  </option>
                                  <option value="long">
                                    Written out — August 20, 2026
                                  </option>
                                  <option value="iso">ISO — 2026-08-20</option>
                                </select>{" "}
                              </label>
                            ) : null}{" "}
                            {selectedComponent.type === "time" ||
                            selectedComponent.type === "datetime" ? (
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Time format (documents)</span>{" "}
                                <select
                                  className="rjsf-builder__select"
                                  value={
                                    selectedComponent.timeDisplayFormat || "12h"
                                  }
                                  onChange={(event) => {
                                    const nextFormat =
                                      event.target.value === "24h"
                                        ? ("24h" as TimeDisplayFormat)
                                        : undefined;
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                timeDisplayFormat: nextFormat
                                              }
                                            : component
                                      )
                                    }));
                                  }}
                                >
                                  <option value="12h">
                                    12-hour — 2:30 PM
                                  </option>
                                  <option value="24h">24-hour — 14:30</option>
                                </select>{" "}
                              </label>
                            ) : null}{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              {selectedComponent.type === "datetime"
                                ? "Captures a date and a time side by side. Formats control how the answer prints in narratives and documents."
                                : "Formats control how the answer prints in narratives and documents; the on-form input follows the browser's locale."}{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        {!selectedComponentSharedEntry &&
                        (selectedComponent.type === "select" ||
                          selectedComponent.type === "radio" ||
                          selectedComponent.type === "matrix") ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__subtitle">
                              Options
                            </div>{" "}
                            <div className="rjsf-builder__choice-grid rjsf-builder__choice-grid--draggable">
                              {" "}
                              <div className="rjsf-builder__choice-grid-header">
                                {" "}
                                <span /> <span>Label</span>{" "}
                                <span>Value</span> <span>Score</span>{" "}
                                <span />{" "}
                              </div>{" "}
                              {choiceOptionsDraft.map((row, rowIndex) => (
                                <div
                                  className={`rjsf-builder__choice-grid-row${
                                    choiceDragOverIndex === rowIndex
                                      ? " is-drag-over"
                                      : ""
                                  }`}
                                  key={row.id}
                                  onDragOver={(event) => {
                                    if (choiceDragIndexRef.current == null) {
                                      return;
                                    }
                                    event.preventDefault();
                                    setChoiceDragOverIndex(rowIndex);
                                  }}
                                  onDrop={(event) => {
                                    const from = choiceDragIndexRef.current;
                                    choiceDragIndexRef.current = null;
                                    setChoiceDragOverIndex(null);
                                    if (from == null || from === rowIndex) {
                                      return;
                                    }
                                    event.preventDefault();
                                    const nextRows = [...choiceOptionsDraft];
                                    const [moved] = nextRows.splice(from, 1);
                                    nextRows.splice(rowIndex, 0, moved);
                                    setChoiceOptionsDraft(nextRows);
                                    persistChoiceOptionsDraft(
                                      selectedComponent.id,
                                      nextRows
                                    );
                                  }}
                                >
                                  {" "}
                                  <span
                                    className="rjsf-builder__choice-drag"
                                    title="Drag to reorder"
                                    draggable
                                    onDragStart={(event) => {
                                      choiceDragIndexRef.current = rowIndex;
                                      event.dataTransfer.effectAllowed =
                                        "move";
                                    }}
                                    onDragEnd={() => {
                                      choiceDragIndexRef.current = null;
                                      setChoiceDragOverIndex(null);
                                    }}
                                  >
                                    ⋮⋮
                                  </span>{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    value={row.label}
                                    placeholder="Option label"
                                    onPaste={(event) => {
                                      const text =
                                        event.clipboardData.getData("text");
                                      if (!text.includes("\n")) {
                                        return;
                                      }
                                      event.preventDefault();
                                      const parsed =
                                        parsePastedOptionLines(text);
                                      if (!parsed.length) {
                                        return;
                                      }
                                      const newRows = parsed.map((entry) =>
                                        createChoiceOptionDraft(
                                          entry.label,
                                          entry.value,
                                          entry.score
                                        )
                                      );
                                      const nextRows = [...choiceOptionsDraft];
                                      const isEmptyRow =
                                        !clean(row.label) &&
                                        !clean(row.value) &&
                                        !clean(row.score);
                                      nextRows.splice(
                                        rowIndex + (isEmptyRow ? 0 : 1),
                                        isEmptyRow ? 1 : 0,
                                        ...newRows
                                      );
                                      setChoiceOptionsDraft(nextRows);
                                      persistChoiceOptionsDraft(
                                        selectedComponent.id,
                                        nextRows
                                      );
                                      setMessage(
                                        `Added ${newRows.length} options from the pasted list.`
                                      );
                                    }}
                                    onChange={(event) =>
                                      setChoiceOptionsDraft((current) =>
                                        current.map((item) =>
                                          item.id === row.id
                                            ? {
                                                ...item,
                                                label: event.target.value
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    onBlur={() =>
                                      persistChoiceOptionsDraft(
                                        selectedComponent.id,
                                        choiceOptionsDraft
                                      )
                                    }
                                  />{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    value={row.value}
                                    placeholder="Option value"
                                    onChange={(event) =>
                                      setChoiceOptionsDraft((current) =>
                                        current.map((item) =>
                                          item.id === row.id
                                            ? {
                                                ...item,
                                                value: event.target.value
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    onBlur={() =>
                                      persistChoiceOptionsDraft(
                                        selectedComponent.id,
                                        choiceOptionsDraft
                                      )
                                    }
                                  />{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    type="number"
                                    step="any"
                                    value={row.score}
                                    placeholder="—"
                                    onChange={(event) =>
                                      setChoiceOptionsDraft((current) =>
                                        current.map((item) =>
                                          item.id === row.id
                                            ? {
                                                ...item,
                                                score: event.target.value
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    onBlur={() =>
                                      persistChoiceOptionsDraft(
                                        selectedComponent.id,
                                        choiceOptionsDraft
                                      )
                                    }
                                  />{" "}
                                  <button
                                    type="button"
                                    className="rjsf-builder__col-action rjsf-builder__col-action--danger"
                                    title="Remove option"
                                    onClick={() => {
                                      const nextRows =
                                        choiceOptionsDraft.filter(
                                          (item) => item.id !== row.id
                                        );
                                      persistChoiceOptionsDraft(
                                        selectedComponent.id,
                                        nextRows
                                      );
                                    }}
                                  >
                                    ✕
                                  </button>{" "}
                                </div>
                              ))}{" "}
                            </div>{" "}
                            <div className="rjsf-builder__button-row">
                              {" "}
                              <button
                                type="button"
                                className="rjsf-builder__button rjsf-builder__button--small"
                                onClick={() => {
                                  const nextRows = [
                                    ...choiceOptionsDraft,
                                    createChoiceOptionDraft()
                                  ];
                                  setChoiceOptionsDraft(nextRows);
                                }}
                              >
                                {" "}
                                + Add another{" "}
                              </button>{" "}
                            </div>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Drag ⋮⋮ to reorder. Paste a multi-line list into
                              any Label box to add one option per line — tabs
                              or &ldquo;|&rdquo; split label, value, and score,
                              so a spreadsheet paste just works. Leave value
                              blank to use the label. Scored options feed
                              Calculated total fields.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        {selectedComponent.type === "matrix" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__subtitle">
                              Matrix rows
                            </div>{" "}
                            <div className="rjsf-builder__matrix-rows-grid">
                              {" "}
                              <div className="rjsf-builder__matrix-rows-header">
                                {" "}
                                <span>Order</span> <span>Label</span>{" "}
                                <span>Key</span> <span>Remove</span>{" "}
                              </div>{" "}
                              {matrixRowsDraft.map((row, rowIndex) => (
                                <div
                                  className="rjsf-builder__matrix-rows-row"
                                  key={row.id}
                                >
                                  {" "}
                                  <div className="rjsf-builder__choice-order">
                                    {" "}
                                    <button
                                      type="button"
                                      className="rjsf-builder__button rjsf-builder__button--small"
                                      disabled={rowIndex === 0}
                                      onClick={() => {
                                        const nextRows = [...matrixRowsDraft];
                                        const [moved] = nextRows.splice(
                                          rowIndex,
                                          1
                                        );
                                        nextRows.splice(rowIndex - 1, 0, moved);
                                        persistMatrixRowsDraft(
                                          selectedComponent.id,
                                          nextRows
                                        );
                                      }}
                                    >
                                      {" "}
                                      Up{" "}
                                    </button>{" "}
                                    <button
                                      type="button"
                                      className="rjsf-builder__button rjsf-builder__button--small"
                                      disabled={
                                        rowIndex >= matrixRowsDraft.length - 1
                                      }
                                      onClick={() => {
                                        const nextRows = [...matrixRowsDraft];
                                        const [moved] = nextRows.splice(
                                          rowIndex,
                                          1
                                        );
                                        nextRows.splice(rowIndex + 1, 0, moved);
                                        persistMatrixRowsDraft(
                                          selectedComponent.id,
                                          nextRows
                                        );
                                      }}
                                    >
                                      {" "}
                                      Down{" "}
                                    </button>{" "}
                                  </div>{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    value={row.label}
                                    placeholder="Question text"
                                    onChange={(event) =>
                                      setMatrixRowsDraft((current) =>
                                        current.map((item) =>
                                          item.id === row.id
                                            ? {
                                                ...item,
                                                label: event.target.value
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    onBlur={() =>
                                      persistMatrixRowsDraft(
                                        selectedComponent.id,
                                        matrixRowsDraft
                                      )
                                    }
                                  />{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    value={row.key}
                                    placeholder="row_key"
                                    onChange={(event) =>
                                      setMatrixRowsDraft((current) =>
                                        current.map((item) =>
                                          item.id === row.id
                                            ? {
                                                ...item,
                                                key: event.target.value
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    onBlur={() =>
                                      persistMatrixRowsDraft(
                                        selectedComponent.id,
                                        matrixRowsDraft
                                      )
                                    }
                                  />{" "}
                                  <button
                                    type="button"
                                    className="rjsf-builder__button rjsf-builder__button--small rjsf-builder__button--danger"
                                    disabled={matrixRowsDraft.length <= 1}
                                    onClick={() => {
                                      const nextRows = matrixRowsDraft.filter(
                                        (item) => item.id !== row.id
                                      );
                                      persistMatrixRowsDraft(
                                        selectedComponent.id,
                                        nextRows
                                      );
                                    }}
                                  >
                                    {" "}
                                    X{" "}
                                  </button>{" "}
                                </div>
                              ))}{" "}
                            </div>{" "}
                            <div className="rjsf-builder__button-row">
                              {" "}
                              <button
                                type="button"
                                className="rjsf-builder__button rjsf-builder__button--small"
                                onClick={() => {
                                  setMatrixRowsDraft((current) => [
                                    ...current,
                                    {
                                      id: makeId("mrow"),
                                      key: "",
                                      label: ""
                                    }
                                  ]);
                                }}
                              >
                                {" "}
                                + Add row{" "}
                              </button>{" "}
                            </div>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Each row is one question sharing the option
                              columns above. Answers are stored per row key.
                              Leave key blank to derive it from the label.{" "}
                            </div>{" "}
                            <label className="rjsf-builder__toggle">
                              {" "}
                              <input
                                type="checkbox"
                                checked={
                                  selectedComponent.matrixRequireAllRows ===
                                  true
                                }
                                onChange={(event) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              matrixRequireAllRows: event
                                                .target.checked
                                                ? true
                                                : undefined
                                            }
                                          : component
                                    )
                                  }))
                                }
                              />{" "}
                              <span>Require every row answered</span>{" "}
                            </label>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              When on, a required matrix only counts as
                              complete once every row has an answer.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        {selectedComponent.type === "yesno" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__subtitle">
                              Scores (optional)
                            </div>{" "}
                            <div className="rjsf-builder__yesno-scores">
                              {" "}
                              {YES_NO_OPTIONS.map((optionValue) => (
                                <label
                                  key={optionValue}
                                  className="rjsf-builder__field"
                                >
                                  {" "}
                                  <span>
                                    {YES_NO_OPTION_LABELS[optionValue] ||
                                      optionValue}{" "}
                                    score
                                  </span>{" "}
                                  <input
                                    className="rjsf-builder__input"
                                    type="number"
                                    step="any"
                                    placeholder="—"
                                    value={
                                      selectedComponent.optionScores?.[
                                        optionValue
                                      ] != null
                                        ? String(
                                            selectedComponent.optionScores[
                                              optionValue
                                            ]
                                          )
                                        : ""
                                    }
                                    onChange={(event) => {
                                      const rawText = event.target.value;
                                      const parsedScore = Number(rawText);
                                      updateDefinition((current) => ({
                                        ...current,
                                        components: current.components.map(
                                          (component) => {
                                            if (
                                              component.id !==
                                              selectedComponent.id
                                            ) {
                                              return component;
                                            }
                                            const nextScores = {
                                              ...(component.optionScores || {})
                                            };
                                            if (
                                              rawText === "" ||
                                              !Number.isFinite(parsedScore)
                                            ) {
                                              delete nextScores[optionValue];
                                            } else {
                                              nextScores[optionValue] =
                                                parsedScore;
                                            }
                                            return {
                                              ...component,
                                              optionScores: Object.keys(
                                                nextScores
                                              ).length
                                                ? nextScores
                                                : undefined
                                            };
                                          }
                                        )
                                      }));
                                    }}
                                  />{" "}
                                </label>
                              ))}{" "}
                            </div>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Scored answers feed Calculated total fields.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        {!selectedComponentSharedEntry &&
                        (selectedComponent.type === "select" ||
                          selectedComponent.type === "radio") ? (
                          <label className="rjsf-builder__toggle">
                            {" "}
                            <input
                              type="checkbox"
                              checked={Boolean(selectedComponent.multiSelect)}
                              onChange={(event) =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) => {
                                      if (
                                        component.id !== selectedComponent.id
                                      ) {
                                        return component;
                                      }
                                      const nextMultiSelect =
                                        event.target.checked;
                                      return {
                                        ...component,
                                        multiSelect: nextMultiSelect,
                                        defaultValue: nextMultiSelect
                                          ? normalizeMultiSelectValues(
                                              component.defaultValue,
                                              component.options
                                            ) || []
                                          : Array.isArray(
                                              component.defaultValue
                                            )
                                          ? firstArrayStringValue(
                                              component.defaultValue
                                            )
                                          : component.defaultValue
                                      };
                                    }
                                  )
                                }))
                              }
                            />{" "}
                            <span>
                              {" "}
                              {selectedComponent.type === "select"
                                ? "Multi-select dropdown"
                                : "Multi-select radio options"}{" "}
                            </span>{" "}
                          </label>
                        ) : null}{" "}
                        {selectedComponent.type === "datagrid" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__subtitle">
                              Datagrid
                            </div>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Configure datagrid columns and row template in a
                              popup editor.{" "}
                            </div>{" "}
                            <button
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--small"
                              onClick={() => setShowDatagridConfigModal(true)}
                            >
                              {" "}
                              Open datagrid settings{" "}
                            </button>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Display</span>{" "}
                              <select
                                className="rjsf-builder__select"
                                value={
                                  selectedComponent.datagridDisplay === "table"
                                    ? "table"
                                    : "stacked"
                                }
                                onChange={(event) => {
                                  const nextDisplay =
                                    event.target.value === "table"
                                      ? ("table" as const)
                                      : undefined;
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              datagridDisplay: nextDisplay
                                            }
                                          : component
                                    )
                                  }));
                                }}
                              >
                                <option value="stacked">
                                  Stacked rows (labels in each row)
                                </option>
                                <option value="table">
                                  Table (single header row)
                                </option>
                              </select>{" "}
                            </label>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Table works best when column widths total 12 so
                              each entry fits on one line.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        {selectedComponent.type === "contentBlock" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <div className="rjsf-builder__field">
                              {" "}
                              <span>Content</span>{" "}
                              <RichTemplateEditor
                                value={selectedComponent.contentText || ""}
                                ariaLabel="Content block text"
                                placeholder="Write the text shown on the form. Use H / h for a header or subheader, or format selected text."
                                onChange={(next) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              contentText: next
                                            }
                                          : component
                                    )
                                  }))
                                }
                              />{" "}
                            </div>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Static text rendered in the form. Tokens like{" "}
                              <code>{`{token_key}`}</code> are resolved from
                              form and client data. This block stores no answer.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                        <label className="rjsf-builder__field">
                          {" "}
                          <span>Description</span>{" "}
                          <textarea
                            className="rjsf-builder__input rjsf-builder__input--multiline"
                            value={selectedComponent.description || ""}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) =>
                                    component.id === selectedComponent.id
                                      ? {
                                          ...component,
                                          description: event.target.value
                                        }
                                      : component
                                )
                              }))
                            }
                          />{" "}
                        </label>{" "}
                        {selectedComponent.type === "systemDatagrid2" ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>System template slot</span>{" "}
                              <select
                                className="rjsf-builder__input"
                                value={
                                  selectedComponent.systemTemplateSlotProperty ||
                                  ""
                                }
                                onChange={(event) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) => {
                                        if (
                                          component.id !== selectedComponent.id
                                        ) {
                                          return component;
                                        }
                                        const nextSlot = clean(
                                          event.target.value
                                        );
                                        const templateDefinition =
                                          getSystemTemplateDefinitionBySlotProperty(
                                            nextSlot
                                          );
                                        return {
                                          ...component,
                                          systemTemplateSlotProperty:
                                            isSystemTemplateSlotProperty(
                                              nextSlot
                                            )
                                              ? (nextSlot as SystemTemplateSlotProperty)
                                              : undefined,
                                          systemTemplateType:
                                            templateDefinition?.type ||
                                            component.systemTemplateType,
                                          datagridRowIdKey:
                                            component.datagridRowIdKey ||
                                            clean(
                                              templateDefinition?.rowIdKey
                                            ) ||
                                            undefined,
                                          datagridColumns: component
                                            .datagridColumns?.length
                                            ? component.datagridColumns
                                            : templateDefinition
                                            ? createDataGridColumnsFromTemplate(
                                                templateDefinition
                                              )
                                            : component.datagridColumns
                                        };
                                      }
                                    )
                                  }))
                                }
                              >
                                {" "}
                                <option value="">Choose a slot...</option>{" "}
                                {allSystemTemplates().map((template) => (
                                  <option
                                    key={template.systemTemplateSlotProperty}
                                    value={template.systemTemplateSlotProperty}
                                  >
                                    {" "}
                                    {template.label}{" "}
                                  </option>
                                ))}{" "}
                              </select>{" "}
                            </label>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              This component renders a configured System
                              Template widget slot and does not contribute
                              direct document text.{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                      </Fragment>
                        </div>
                      </details>
                    ) : null}{" "}
                    {isDocumentOutputTab ? (
                      selectedComponent.type === "systemDatagrid2" ? (
                        <div className="rjsf-builder__help">
                          {" "}
                          System template fields do not use document output
                          templates.{" "}
                        </div>
                      ) : (
                        <div className="rjsf-builder__block">
                          {" "}
                          <div className="rjsf-builder__subtitle">
                            {" "}
                            Document output template{" "}
                          </div>{" "}
                          <div className="rjsf-builder__token-picker-toolbar">
                            {" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Token source</span>{" "}
                              <select
                                className="rjsf-builder__select"
                                value={tokenPickerSource}
                                onChange={(event) =>
                                  setTokenPickerSource(
                                    event.target.value === "client"
                                      ? "client"
                                      : event.target.value === "computed"
                                      ? "computed"
                                      : "form"
                                  )
                                }
                              >
                                {" "}
                                <option value="form">Form Data</option>{" "}
                                <option value="client">Client Data</option>{" "}
                                <option value="computed">
                                  Computed tokens
                                </option>{" "}
                              </select>{" "}
                            </label>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Search token</span>{" "}
                              <input
                                className="rjsf-builder__input"
                                placeholder="Search token..."
                                value={tokenSearch}
                                onChange={(event) =>
                                  setTokenSearch(event.target.value)
                                }
                              />{" "}
                            </label>{" "}
                          </div>{" "}
                          {recentTokenOptions.length ? (
                            <div className="rjsf-builder__token-picker-recents">
                              {" "}
                              {recentTokenOptions.map((option) => (
                                <button
                                  key={`recent-token-${option.key}`}
                                  type="button"
                                  className="rjsf-builder__token-chip"
                                  onClick={() => onPickToken(option.key)}
                                  title={`Insert {${option.key}}`}
                                >
                                  {" "}
                                  <code>{`{${option.key}}`}</code>{" "}
                                </button>
                              ))}{" "}
                            </div>
                          ) : null}{" "}
                          <div className="rjsf-builder__token-picker-results">
                            {" "}
                            {filteredTokenOptions.length ? (
                              filteredTokenOptions.map((option) => (
                                <button
                                  key={`token-${option.key}`}
                                  type="button"
                                  className="rjsf-builder__token-picker-item"
                                  onClick={() => onPickToken(option.key)}
                                  title={`Insert {${option.key}}`}
                                >
                                  {" "}
                                  <span>{option.label}</span>{" "}
                                  <code>{`{${option.key}}`}</code>{" "}
                                </button>
                              ))
                            ) : (
                              <div className="rjsf-builder__token-picker-empty">
                                {tokenPickerSource === "client"
                                  ? "No client tokens available."
                                  : tokenPickerSource === "computed"
                                  ? "No computed tokens available."
                                  : "No matching form tokens."}
                              </div>
                            )}{" "}
                          </div>{" "}
                          {/* div, not label: a label forwards clicks on the
                              contentEditable editor to its first labelable
                              control — the Reset to Default button — wiping
                              the user's edits on every click into the box. */}
                          <div className="rjsf-builder__field">
                            {" "}
                            <span className="rjsf-builder__field-label-row">
                              {" "}
                              <span>Template</span>{" "}
                              <button
                                type="button"
                                className="rjsf-builder__button rjsf-builder__button--small"
                                disabled={
                                  !hasExplicitDocumentOutputTemplate(
                                    selectedComponent
                                  )
                                }
                                onClick={() =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              documentOutputTemplate: undefined
                                            }
                                          : component
                                    )
                                  }))
                                }
                              >
                                {" "}
                                Reset to Default{" "}
                              </button>{" "}
                            </span>{" "}
                            <RichTemplateEditor
                              ref={richTemplateEditorRef}
                              value={selectedComponentTemplateValue}
                              ariaLabel="Document output template"
                              placeholder="Write the narrative for this field. Select text to make it bold, italic, or underlined; click a token to insert it."
                              onChange={(next) =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) =>
                                      component.id === selectedComponent.id
                                        ? {
                                            ...component,
                                            documentOutputTemplate: next
                                          }
                                        : component
                                  )
                                }))
                              }
                            />{" "}
                          </div>{" "}
                          <label className="rjsf-builder__toggle">
                            {" "}
                            <input
                              type="checkbox"
                              checked={Boolean(
                                selectedComponent.hideOutputIfEmpty
                              )}
                              onChange={(event) =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) =>
                                      component.id === selectedComponent.id
                                        ? {
                                            ...component,
                                            hideOutputIfEmpty:
                                              event.target.checked
                                          }
                                        : component
                                  )
                                }))
                              }
                            />{" "}
                            <span className="rjsf-builder__toggle-label">
                              {" "}
                              Hide field output if empty{" "}
                              <span
                                className="rjsf-builder__tooltip-icon"
                                tabIndex={0}
                                title="When this option is selected and the user leaves this field blank, it will be omitted from the finalized document output."
                                aria-label="When this option is selected and the user leaves this field blank, it will be omitted from the finalized document output."
                              >
                                {" "}
                                ?{" "}
                              </span>{" "}
                            </span>{" "}
                          </label>{" "}
                          {supportsPerAnswerOutput(selectedComponent) &&
                          (selectedComponent.options || []).length ? (
                            <div className="rjsf-builder__field">
                              {" "}
                              <span className="rjsf-builder__field-label-row">
                                {" "}
                                <span>Per-answer output</span>{" "}
                              </span>{" "}
                              <div className="rjsf-builder__help">
                                {" "}
                                Optional narrative per answer. Text here
                                replaces the template above when that answer is
                                selected; check &quot;Omit&quot; to drop the
                                field from the document for that answer. Tokens
                                like <code>{"{client.first_name}"}</code> work
                                here too.{" "}
                              </div>{" "}
                              {(selectedComponent.options || []).map(
                                (optionValue) => (
                                  <div
                                    key={`per-answer-${optionValue}`}
                                    className="rjsf-builder__field"
                                  >
                                    {" "}
                                    <span className="rjsf-builder__field-label-row">
                                      {" "}
                                      <span>
                                        {clean(
                                          selectedComponent.optionLabels?.[
                                            optionValue
                                          ]
                                        ) || optionValue}
                                      </span>{" "}
                                      <label className="rjsf-builder__toggle">
                                        {" "}
                                        <input
                                          type="checkbox"
                                          checked={
                                            selectedComponent
                                              .optionOutputTexts?.[
                                              optionValue
                                            ] === ""
                                          }
                                          onChange={(event) => {
                                            const omit = event.target.checked;
                                            updateDefinition((current) => ({
                                              ...current,
                                              components:
                                                current.components.map(
                                                  (component) => {
                                                    if (
                                                      component.id !==
                                                      selectedComponent.id
                                                    ) {
                                                      return component;
                                                    }
                                                    const map = {
                                                      ...(component.optionOutputTexts ||
                                                        {})
                                                    };
                                                    if (omit) {
                                                      map[optionValue] = "";
                                                    } else {
                                                      delete map[optionValue];
                                                    }
                                                    return {
                                                      ...component,
                                                      optionOutputTexts:
                                                        Object.keys(map).length
                                                          ? map
                                                          : undefined
                                                    };
                                                  }
                                                )
                                            }));
                                          }}
                                        />{" "}
                                        <span className="rjsf-builder__toggle-label">
                                          Omit
                                        </span>{" "}
                                      </label>{" "}
                                    </span>{" "}
                                    <textarea
                                      className="rjsf-builder__input"
                                      rows={2}
                                      placeholder="Default output"
                                      value={
                                        selectedComponent.optionOutputTexts?.[
                                          optionValue
                                        ] ?? ""
                                      }
                                      onChange={(event) => {
                                        const nextText = event.target.value;
                                        updateDefinition((current) => ({
                                          ...current,
                                          components: current.components.map(
                                            (component) => {
                                              if (
                                                component.id !==
                                                selectedComponent.id
                                              ) {
                                                return component;
                                              }
                                              const map = {
                                                ...(component.optionOutputTexts ||
                                                  {})
                                              };
                                              if (nextText) {
                                                map[optionValue] = nextText;
                                              } else {
                                                delete map[optionValue];
                                              }
                                              return {
                                                ...component,
                                                optionOutputTexts: Object.keys(
                                                  map
                                                ).length
                                                  ? map
                                                  : undefined
                                              };
                                            }
                                          )
                                        }));
                                      }}
                                    />{" "}
                                  </div>
                                )
                              )}{" "}
                            </div>
                          ) : null}{" "}
                        </div>
                      )
                    ) : null}{" "}
                    {isDocumentOutputTab &&
                    selectedComponent.type !== "systemDatagrid2" ? (
                      <Fragment>
                        {" "}
                        <div
                          className={`rjsf-builder__token-help${
                            tokenHelpExpanded ? " is-open" : ""
                          }`}
                        >
                          {" "}
                          <button
                            type="button"
                            className="rjsf-builder__token-help-toggle"
                            onClick={() =>
                              setTokenHelpExpanded((current) => !current)
                            }
                            aria-expanded={tokenHelpExpanded}
                          >
                            {" "}
                            <span className="rjsf-builder__token-help-summary">
                              {" "}
                              <span>
                                {" "}
                                Use <code>{`{%token_key%}`}</code> or{" "}
                                <code>{`{token_key}`}</code>. Use{" "}
                                <code>{`{!token_key!}`}</code> for raw HTML.{" "}
                              </span>{" "}
                              <span>
                                {" "}
                                Form tokens: field keys,{" "}
                                <code>{`{field_key_label}`}</code>,{" "}
                                <code>{`{formtitle}`}</code>,{" "}
                                <code>{`{formdescription}`}</code>.{" "}
                              </span>{" "}
                            </span>{" "}
                            <span
                              className={`rjsf-builder__token-help-chevron${
                                tokenHelpExpanded ? " is-open" : ""
                              }`}
                              aria-hidden="true"
                            >
                              {" "}
                              v{" "}
                            </span>{" "}
                          </button>{" "}
                          {tokenHelpExpanded ? (
                            <div className="rjsf-builder__token-help-body">
                              {" "}
                              <div className="rjsf-builder__token-help-title">
                                {" "}
                                Token behavior:{" "}
                              </div>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  Supported token syntax:{" "}
                                  <code>{`{%token_key%}`}</code> and{" "}
                                  <code>{`{token_key}`}</code> and{" "}
                                  <code>{`{!token_key!}`}</code>{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>{`{%...%}`}</code> /{" "}
                                  <code>{`{...}`}</code> HTML-escape token
                                  values. <code>{`{! ... !}`}</code> injects raw
                                  HTML.{" "}
                                </li>{" "}
                                <li>Tokens are case-insensitive.</li>{" "}
                                <li>Unknown tokens resolve to empty string.</li>{" "}
                              </ul>{" "}
                              <div className="rjsf-builder__token-help-subtitle">
                                {" "}
                                Form tokens available automatically:{" "}
                              </div>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  <code>formtitle</code>,{" "}
                                  <code>form_title</code>{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>formdescription</code>,{" "}
                                  <code>form_description</code>{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>{`<fieldKey>`}</code> (field value){" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>{`<fieldKey>_label`}</code> (field
                                  label){" "}
                                </li>{" "}
                              </ul>{" "}
                              <div className="rjsf-builder__token-help-subtitle">
                                {" "}
                                Context tokens come from:{" "}
                              </div>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  <code>tokenContextJsonAttr</code> (runtime
                                  token values){" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>tokenContextSource</code> (runtime
                                  key/value datasource){" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>tokenCatalogSchemaJsonAttr</code>{" "}
                                  (builder-only token catalog for Client Data
                                  picker labels/options){" "}
                                </li>{" "}
                              </ul>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  If keys collide, context tokens override form
                                  tokens.{" "}
                                </li>{" "}
                              </ul>{" "}
                              <div className="rjsf-builder__token-help-subtitle">
                                {" "}
                                Datagrid template tokens:{" "}
                              </div>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  For `datagrid` fields, the template is
                                  evaluated per row.{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  Use column keys directly (for example{" "}
                                  <code>{`{testDate}`}</code>,{" "}
                                  <code>{`{substances}`}</code>).{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  Row helpers: <code>{`{row_number}`}</code>,{" "}
                                  <code>{`{rowindex}`}</code>.{" "}
                                </li>{" "}
                              </ul>{" "}
                              <div className="rjsf-builder__token-help-subtitle">
                                {" "}
                                Computed tokens supported:{" "}
                              </div>{" "}
                              <ul>
                                {" "}
                                <li>
                                  {" "}
                                  <code>__currentdate</code> /{" "}
                                  <code>__today</code>{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>__currenttime</code> /{" "}
                                  <code>__nowtime</code>{" "}
                                </li>{" "}
                                <li>
                                  {" "}
                                  <code>__currentdatetime</code> /{" "}
                                  <code>__now</code>{" "}
                                </li>{" "}
                              </ul>{" "}
                            </div>
                          ) : null}{" "}
                        </div>{" "}
                        <div className="rjsf-builder__token-preview">
                          {" "}
                          <div className="rjsf-builder__token-preview-title">
                            {" "}
                            Token preview{" "}
                          </div>{" "}
                          {selectedComponentTokenPreview.outputHtml ? (
                            <div className="rjsf-builder__token-preview-body">
                              {" "}
                              <div className="rjsf-builder__token-preview-tabs">
                                {" "}
                                <button
                                  type="button"
                                  className={`rjsf-builder__button rjsf-builder__button--small rjsf-builder__token-preview-tab${
                                    tokenPreviewMode === "rendered"
                                      ? " is-active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setTokenPreviewMode("rendered")
                                  }
                                >
                                  {" "}
                                  Rendered{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  className={`rjsf-builder__button rjsf-builder__button--small rjsf-builder__token-preview-tab${
                                    tokenPreviewMode === "html"
                                      ? " is-active"
                                      : ""
                                  }`}
                                  onClick={() => setTokenPreviewMode("html")}
                                >
                                  {" "}
                                  HTML{" "}
                                </button>{" "}
                              </div>{" "}
                              {tokenPreviewMode === "rendered" ? (
                                <div
                                  className="rjsf-builder__token-preview-rendered"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      selectedComponentTokenPreview.outputHtml
                                  }}
                                />
                              ) : (
                                <label className="rjsf-builder__field">
                                  {" "}
                                  <span>Resolved output (HTML)</span>{" "}
                                  <textarea
                                    className="rjsf-builder__input rjsf-builder__input--multiline rjsf-builder__token-preview-output"
                                    value={
                                      selectedComponentTokenPreview.outputHtml
                                    }
                                    readOnly
                                  />{" "}
                                </label>
                              )}{" "}
                              {selectedComponentTokenPreview.tokenRows
                                .length ? (
                                <div className="rjsf-builder__token-preview-tokens">
                                  {" "}
                                  {selectedComponentTokenPreview.tokenRows.map(
                                    (item) => (
                                      <div
                                        className="rjsf-builder__token-preview-token"
                                        key={item.key}
                                      >
                                        {" "}
                                        <code>{item.key}</code>{" "}
                                        <span>{item.value || "(empty)"}</span>{" "}
                                      </div>
                                    )
                                  )}{" "}
                                </div>
                              ) : null}{" "}
                            </div>
                          ) : (
                            <div className="rjsf-builder__help">
                              {" "}
                              Add a document output template to preview resolved
                              tokens.{" "}
                            </div>
                          )}{" "}
                        </div>{" "}
                      </Fragment>
                    ) : null}{" "}
                    {isPropertiesTab &&
                    selectedComponent.type !== "total" &&
                    selectedComponent.type !== "systemDatagrid2" &&
                    selectedComponent.type !== "contentBlock" ? (
                      <details
                        key={`grp-value-${selectedComponent.id}`}
                        className="rjsf-builder__group"
                      >
                        <summary>
                          <span className="rjsf-builder__group-chev">▶</span>
                          Value &amp; prefill
                          <span className="rjsf-builder__group-peek">
                            {clean(selectedComponent.prefillTokenKey) ||
                              (selectedComponent.defaultValue != null &&
                              selectedComponent.defaultValue !== ""
                                ? "default set"
                                : "none")}
                          </span>
                        </summary>
                        <div className="rjsf-builder__group-body">
                    {!selectedComponentSharedEntry &&
                    selectedComponent.type !== "datagrid" &&
                    selectedComponent.type !== "matrix" &&
                    numberStyleOf(selectedComponent) !== "slider" &&
                    numberStyleOf(selectedComponent) !== "scale" ? (
                      <label className="rjsf-builder__field">
                        {" "}
                        <span>Placeholder</span>{" "}
                        <input
                          className="rjsf-builder__input"
                          value={selectedComponent.placeholder || ""}
                          onChange={(event) =>
                            updateDefinition((current) => ({
                              ...current,
                              components: current.components.map((component) =>
                                component.id === selectedComponent.id
                                  ? {
                                      ...component,
                                      placeholder:
                                        event.target.value === ""
                                          ? undefined
                                          : event.target.value
                                    }
                                  : component
                              )
                            }))
                          }
                        />{" "}
                      </label>
                    ) : null}{" "}
                    {isPropertiesTab &&
                    !selectedComponentSharedEntry &&
                    selectedComponent.type !== "datagrid" &&
                    selectedComponent.type !== "matrix" ? (
                      <label className="rjsf-builder__field">
                        {" "}
                        <span>Default value</span>{" "}
                        <input
                          className="rjsf-builder__input"
                          value={str(selectedComponent.defaultValue ?? "")}
                          onChange={(event) =>
                            updateDefinition((current) => ({
                              ...current,
                              components: current.components.map((component) =>
                                component.id === selectedComponent.id
                                  ? {
                                      ...component,
                                      defaultValue: ensureValueShape(
                                        component,
                                        event.target.value
                                      )
                                    }
                                  : component
                              )
                            }))
                          }
                        />{" "}
                      </label>
                    ) : null}{" "}
                    {isPropertiesTab && selectedComponentSharedEntry ? (
                      <span className="rjsf-builder__help">
                        {`Shared field - reads from "${selectedComponentSharedEntry.sourceCode || "shared registry"}". Key, type, options, defaults and validation are managed by the definition; label, required and layout stay editable here.`}
                      </span>
                    ) : null}{" "}
                    {isPropertiesTab &&
                    !selectedComponentSharedEntry &&
                    source?.publishFieldKeyAttr &&
                    source?.onPublishFieldAction &&
                    !selectedComponent.multiSelect &&
                    !selectedComponent.repeatGroup ? (
                      <div className="rjsf-builder__field">
                        {" "}
                        <button
                          type="button"
                          className="rjsf-builder__button rjsf-builder__button--small"
                          title="Register this field in the shared registry so other templates can reuse it and answers carry forward"
                          onClick={() => {
                            writeAttribute(
                              source.publishFieldKeyAttr,
                              selectedComponent.key
                            );
                            window.setTimeout(
                              () => runAction(source.onPublishFieldAction),
                              0
                            );
                          }}
                        >
                          {" "}
                          Publish as shared field{" "}
                        </button>{" "}
                      </div>
                    ) : null}{" "}
                    {isPropertiesTab &&
                    !selectedComponentSharedEntry &&
                    !TOKEN_PREFILL_EXCLUDED_TYPES.has(selectedComponent.type) &&
                    !selectedComponent.multiSelect &&
                    !selectedComponent.repeatGroup ? (
                      <label className="rjsf-builder__field">
                        {" "}
                        <span>Default from token</span>{" "}
                        <select
                          className="rjsf-builder__input"
                          value={selectedComponent.prefillTokenKey ?? ""}
                          onChange={(event) => {
                            const nextTokenKey =
                              event.target.value === ""
                                ? undefined
                                : event.target.value;
                            updateDefinition((current) => ({
                              ...current,
                              components: current.components.map((component) =>
                                component.id === selectedComponent.id
                                  ? {
                                      ...component,
                                      prefillTokenKey: nextTokenKey
                                    }
                                  : component
                              )
                            }));
                          }}
                        >
                          {" "}
                          <option value="">None</option>{" "}
                          {(selectedComponent.prefillTokenKey &&
                          !clientTokenOptions.some(
                            (option) =>
                              option.key === selectedComponent.prefillTokenKey
                          )
                            ? [
                                {
                                  key: selectedComponent.prefillTokenKey,
                                  label: selectedComponent.prefillTokenKey
                                },
                                ...clientTokenOptions
                              ]
                            : clientTokenOptions
                          ).map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label} ({option.key})
                            </option>
                          ))}{" "}
                        </select>{" "}
                        <span className="rjsf-builder__help">
                          Prefills this field from client/document data when the
                          form opens. Applied only while the field has no
                          answer; nothing is saved until the user edits the
                          form.
                        </span>{" "}
                      </label>
                    ) : null}{" "}
                        </div>
                      </details>
                    ) : null}{" "}
                    {isValidationTab && selectedComponentSharedEntry ? (
                      <span className="rjsf-builder__help">
                        Validation for shared fields is managed by the shared
                        definition.
                      </span>
                    ) : null}{" "}
                    {isValidationTab &&
                    !selectedComponentSharedEntry &&
                    selectedComponent.type !== "total" &&
                    selectedComponent.type !== "datagrid" &&
                    selectedComponent.type !== "contentBlock" ? (
                      <div className="rjsf-builder__block">
                        {" "}
                        <div className="rjsf-builder__subtitle">
                          Validation
                        </div>{" "}
                        {selectedComponent.type === "integer" ||
                        selectedComponent.type === "number" ||
                        selectedComponent.type === "slider" ? (
                          <Fragment>
                            {" "}
                            <div className="rjsf-builder__split">
                              {" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Min value</span>{" "}
                                <input
                                  type="number"
                                  step={
                                    isWholeNumberComponent(selectedComponent)
                                      ? 1
                                      : "any"
                                  }
                                  className="rjsf-builder__input"
                                  value={selectedComponent.minimum ?? ""}
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) => {
                                          if (
                                            component.id !==
                                            selectedComponent.id
                                          ) {
                                            return component;
                                          }
                                          const isInteger =
                                            isWholeNumberComponent(component);
                                          const nextMinimum = isInteger
                                            ? parseOptionalInteger(
                                                event.target.value
                                              )
                                            : parseOptionalNumber(
                                                event.target.value
                                              );
                                          const currentMaximum = isInteger
                                            ? parseOptionalInteger(
                                                component.maximum
                                              )
                                            : parseOptionalNumber(
                                                component.maximum
                                              );
                                          const nextMaximum =
                                            currentMaximum != null &&
                                            nextMinimum != null &&
                                            currentMaximum < nextMinimum
                                              ? nextMinimum
                                              : currentMaximum;
                                          return {
                                            ...component,
                                            minimum: nextMinimum,
                                            maximum: nextMaximum,
                                            defaultValue:
                                              typeof component.defaultValue ===
                                              "number"
                                                ? isInteger
                                                  ? applyIntegerBounds(
                                                      component.defaultValue,
                                                      nextMinimum,
                                                      nextMaximum
                                                    )
                                                  : applyNumberBounds(
                                                      component.defaultValue,
                                                      nextMinimum,
                                                      nextMaximum
                                                    )
                                                : component.defaultValue
                                          };
                                        }
                                      )
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Max value</span>{" "}
                                <input
                                  type="number"
                                  step={
                                    isWholeNumberComponent(selectedComponent)
                                      ? 1
                                      : "any"
                                  }
                                  className="rjsf-builder__input"
                                  value={selectedComponent.maximum ?? ""}
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) => {
                                          if (
                                            component.id !==
                                            selectedComponent.id
                                          ) {
                                            return component;
                                          }
                                          const isInteger =
                                            isWholeNumberComponent(component);
                                          const nextMaximumRaw = isInteger
                                            ? parseOptionalInteger(
                                                event.target.value
                                              )
                                            : parseOptionalNumber(
                                                event.target.value
                                              );
                                          const currentMinimum = isInteger
                                            ? parseOptionalInteger(
                                                component.minimum
                                              )
                                            : parseOptionalNumber(
                                                component.minimum
                                              );
                                          const nextMaximum =
                                            nextMaximumRaw != null &&
                                            currentMinimum != null &&
                                            nextMaximumRaw < currentMinimum
                                              ? currentMinimum
                                              : nextMaximumRaw;
                                          return {
                                            ...component,
                                            maximum: nextMaximum,
                                            defaultValue:
                                              typeof component.defaultValue ===
                                              "number"
                                                ? isInteger
                                                  ? applyIntegerBounds(
                                                      component.defaultValue,
                                                      currentMinimum,
                                                      nextMaximum
                                                    )
                                                  : applyNumberBounds(
                                                      component.defaultValue,
                                                      currentMinimum,
                                                      nextMaximum
                                                    )
                                                : component.defaultValue
                                          };
                                        }
                                      )
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                            </div>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Multiple of (step)</span>{" "}
                              <input
                                type="number"
                                min={0}
                                step={
                                  isWholeNumberComponent(selectedComponent)
                                    ? 1
                                    : "any"
                                }
                                className="rjsf-builder__input"
                                value={selectedComponent.multipleOf ?? ""}
                                onChange={(event) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              multipleOf:
                                                parseOptionalPositiveNumber(
                                                  event.target.value
                                                )
                                            }
                                          : component
                                    )
                                  }))
                                }
                              />{" "}
                            </label>{" "}
                          </Fragment>
                        ) : null}{" "}
                        {selectedComponent.type === "text" ||
                        selectedComponent.type === "textarea" ||
                        selectedComponent.type === "email" ? (
                          <Fragment>
                            {" "}
                            <div className="rjsf-builder__split">
                              {" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Min length</span>{" "}
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  className="rjsf-builder__input"
                                  value={selectedComponent.minLength ?? ""}
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) => {
                                          if (
                                            component.id !==
                                            selectedComponent.id
                                          ) {
                                            return component;
                                          }
                                          const nextMinLength =
                                            parseOptionalNonNegativeInteger(
                                              event.target.value
                                            );
                                          const currentMaxLength =
                                            parseOptionalNonNegativeInteger(
                                              component.maxLength
                                            );
                                          const nextMaxLength =
                                            currentMaxLength != null &&
                                            nextMinLength != null &&
                                            currentMaxLength < nextMinLength
                                              ? nextMinLength
                                              : currentMaxLength;
                                          return {
                                            ...component,
                                            minLength: nextMinLength,
                                            maxLength: nextMaxLength
                                          };
                                        }
                                      )
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Max length</span>{" "}
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  className="rjsf-builder__input"
                                  value={selectedComponent.maxLength ?? ""}
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) => {
                                          if (
                                            component.id !==
                                            selectedComponent.id
                                          ) {
                                            return component;
                                          }
                                          const nextMaxLengthRaw =
                                            parseOptionalNonNegativeInteger(
                                              event.target.value
                                            );
                                          const currentMinLength =
                                            parseOptionalNonNegativeInteger(
                                              component.minLength
                                            );
                                          const nextMaxLength =
                                            nextMaxLengthRaw != null &&
                                            currentMinLength != null &&
                                            nextMaxLengthRaw < currentMinLength
                                              ? currentMinLength
                                              : nextMaxLengthRaw;
                                          return {
                                            ...component,
                                            maxLength: nextMaxLength
                                          };
                                        }
                                      )
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                            </div>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Pattern (regex)</span>{" "}
                              <input
                                className="rjsf-builder__input"
                                placeholder="e.g. ^[A-Za-z0-9_-]+$"
                                value={selectedComponent.pattern || ""}
                                onChange={(event) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              pattern:
                                                event.target.value === ""
                                                  ? undefined
                                                  : event.target.value
                                            }
                                          : component
                                    )
                                  }))
                                }
                              />{" "}
                            </label>{" "}
                            {selectedComponent.type === "text" ||
                            selectedComponent.type === "textarea" ? (
                              <label className="rjsf-builder__field">
                                {" "}
                                <span className="rjsf-builder__toggle-label">
                                  {" "}
                                  Validation Message (optional){" "}
                                  <span
                                    className="rjsf-builder__tooltip-icon"
                                    tabIndex={0}
                                    title="Optionally override the default validation message"
                                    aria-label="Optionally override the default validation message"
                                  >
                                    {" "}
                                    ?{" "}
                                  </span>{" "}
                                </span>{" "}
                                <input
                                  className="rjsf-builder__input"
                                  placeholder="Overrides default validation text"
                                  value={
                                    selectedComponent.customErrorMessage || ""
                                  }
                                  onChange={(event) =>
                                    updateDefinition((current) => ({
                                      ...current,
                                      components: current.components.map(
                                        (component) =>
                                          component.id === selectedComponent.id
                                            ? {
                                                ...component,
                                                customErrorMessage:
                                                  event.target.value === ""
                                                    ? undefined
                                                    : event.target.value
                                              }
                                            : component
                                      )
                                    }))
                                  }
                                />{" "}
                              </label>
                            ) : null}{" "}
                          </Fragment>
                        ) : null}{" "}
                        {selectedComponent.type !== "integer" &&
                        selectedComponent.type !== "number" &&
                        selectedComponent.type !== "slider" &&
                        selectedComponent.type !== "text" &&
                        selectedComponent.type !== "textarea" &&
                        selectedComponent.type !== "email" ? (
                          <div className="rjsf-builder__help">
                            {" "}
                            No additional validation options for this field
                            type.{" "}
                          </div>
                        ) : null}{" "}
                      </div>
                    ) : null}{" "}
                    {isPropertiesTab && selectedComponent.type === "total" ? (
                      <details
                        key={`grp-score-${selectedComponent.id}`}
                        className="rjsf-builder__group"
                        open
                      >
                        <summary>
                          <span className="rjsf-builder__group-chev">▶</span>
                          Score &amp; interpretation
                          <span className="rjsf-builder__group-peek">
                            {selectedComponent.scoreBands?.length
                              ? `${selectedComponent.scoreBands.length} band${
                                  selectedComponent.scoreBands.length === 1
                                    ? ""
                                    : "s"
                                }`
                              : "no bands"}
                          </span>
                        </summary>
                        <div className="rjsf-builder__group-body">
                      <div className="rjsf-builder__block">
                        {" "}
                        <div className="rjsf-builder__subtitle">
                          Fields to sum
                        </div>{" "}
                        <div className="rjsf-builder__help">
                          {" "}
                          {selectedComponent.sumSources?.length
                            ? `Summing ${selectedComponent.sumSources.length} selected field${
                                selectedComponent.sumSources.length === 1
                                  ? ""
                                  : "s"
                              }.`
                            : "Auto: summing every number/integer/radio/dropdown field."}{" "}
                        </div>{" "}
                        {(() => {
                          const setSumSources = (
                            next: string[] | undefined
                          ) =>
                            updateDefinition((current) => ({
                              ...current,
                              components: current.components.map(
                                (component) =>
                                  component.id === selectedComponent.id
                                    ? {
                                        ...component,
                                        sumSources:
                                          next && next.length
                                            ? Array.from(new Set(next))
                                            : undefined
                                      }
                                    : component
                              )
                            }));
                          const selected =
                            selectedComponent.sumSources || [];
                          const knownKeys = totalSourceCandidates.map(
                            (candidate) => candidate.key
                          );
                          const orphanKeys = selected.filter(
                            (key) => !knownKeys.includes(key)
                          );
                          return (
                            <div className="rjsf-builder__sum-picker">
                              <div className="rjsf-builder__sum-picker-head">
                                <button
                                  type="button"
                                  className="rjsf-builder__button rjsf-builder__button--ghost"
                                  onClick={() => setSumSources(knownKeys)}
                                >
                                  Select all
                                </button>
                                <button
                                  type="button"
                                  className="rjsf-builder__button rjsf-builder__button--ghost"
                                  onClick={() => setSumSources(undefined)}
                                >
                                  Clear (auto)
                                </button>
                              </div>
                              <div className="rjsf-builder__sum-picker-list">
                                {totalSourceCandidates.map((candidate) => (
                                  <label
                                    key={`sum-${selectedComponent.id}-${candidate.key}`}
                                    className="rjsf-builder__toggle rjsf-builder__sum-picker-item"
                                    title={candidate.key}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected.includes(
                                        candidate.key
                                      )}
                                      onChange={(event) =>
                                        setSumSources(
                                          event.target.checked
                                            ? [...selected, candidate.key]
                                            : selected.filter(
                                                (key) =>
                                                  key !== candidate.key
                                              )
                                        )
                                      }
                                    />
                                    <span className="rjsf-builder__sum-picker-text">
                                      {candidate.label || candidate.key}
                                    </span>
                                  </label>
                                ))}
                                {orphanKeys.map((key) => (
                                  <label
                                    key={`sum-orphan-${selectedComponent.id}-${key}`}
                                    className="rjsf-builder__toggle rjsf-builder__sum-picker-item rjsf-builder__sum-picker-item--orphan"
                                    title="This key no longer matches a summable field on the form"
                                  >
                                    <input
                                      type="checkbox"
                                      checked
                                      onChange={() =>
                                        setSumSources(
                                          selected.filter(
                                            (item) => item !== key
                                          )
                                        )
                                      }
                                    />
                                    <span className="rjsf-builder__sum-picker-text">
                                      {key} (missing)
                                    </span>
                                  </label>
                                ))}
                                {!totalSourceCandidates.length &&
                                !orphanKeys.length ? (
                                  <div className="rjsf-builder__help">
                                    No summable fields on this form yet.
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })()}{" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={
                              selectedComponent.showMaxScore === true
                            }
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) =>
                                    component.id === selectedComponent.id
                                      ? {
                                          ...component,
                                          showMaxScore: event.target.checked
                                            ? true
                                            : undefined
                                        }
                                      : component
                                )
                              }))
                            }
                          />{" "}
                          <span>
                            Show max possible score (e.g. &ldquo;7 /
                            21&rdquo;)
                          </span>{" "}
                        </label>{" "}
                        <div className="rjsf-builder__subtitle rjsf-builder__subtitle--spaced">
                          Score interpretation
                        </div>{" "}
                        <div className="rjsf-builder__help">
                          {" "}
                          Turn the raw total into a clinical reading. The
                          matched label shows next to the live score and prints
                          in narratives as{" "}
                          <code>{`{${selectedComponent.key}_band}`}</code>. For
                          example, PHQ&#8209;9: 0&ndash;4 Minimal, 5&ndash;9
                          Mild, 10&ndash;14 Moderate, 15&ndash;27 Severe.{" "}
                        </div>{" "}
                        {(selectedComponent.scoreBands || []).map(
                          (band, bandIndex) => (
                            <div
                              key={`band-${selectedComponent.id}-${bandIndex}-${band.min}-${band.max}-${band.label}`}
                              className="rjsf-builder__band-row"
                            >
                              {" "}
                              <input
                                type="number"
                                className="rjsf-builder__input rjsf-builder__band-num"
                                aria-label="Band minimum"
                                defaultValue={band.min}
                                onBlur={(event) => {
                                  const next = Number(event.target.value);
                                  if (
                                    !Number.isFinite(next) ||
                                    next === band.min
                                  ) {
                                    return;
                                  }
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              scoreBands: normalizeScoreBands(
                                                (
                                                  component.scoreBands || []
                                                ).map((item, index) =>
                                                  index === bandIndex
                                                    ? { ...item, min: next }
                                                    : item
                                                )
                                              )
                                            }
                                          : component
                                    )
                                  }));
                                }}
                              />{" "}
                              <span className="rjsf-builder__band-sep">to</span>{" "}
                              <input
                                type="number"
                                className="rjsf-builder__input rjsf-builder__band-num"
                                aria-label="Band maximum"
                                defaultValue={band.max}
                                onBlur={(event) => {
                                  const next = Number(event.target.value);
                                  if (
                                    !Number.isFinite(next) ||
                                    next === band.max
                                  ) {
                                    return;
                                  }
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              scoreBands: normalizeScoreBands(
                                                (
                                                  component.scoreBands || []
                                                ).map((item, index) =>
                                                  index === bandIndex
                                                    ? { ...item, max: next }
                                                    : item
                                                )
                                              )
                                            }
                                          : component
                                    )
                                  }));
                                }}
                              />{" "}
                              <input
                                type="text"
                                className="rjsf-builder__input rjsf-builder__band-label"
                                aria-label="Band label"
                                placeholder="e.g. Moderate depression"
                                defaultValue={band.label}
                                onBlur={(event) => {
                                  const next = clean(event.target.value);
                                  if (!next || next === band.label) {
                                    return;
                                  }
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              scoreBands: normalizeScoreBands(
                                                (
                                                  component.scoreBands || []
                                                ).map((item, index) =>
                                                  index === bandIndex
                                                    ? { ...item, label: next }
                                                    : item
                                                )
                                              )
                                            }
                                          : component
                                    )
                                  }));
                                }}
                              />{" "}
                              <button
                                type="button"
                                className="rjsf-builder__col-action rjsf-builder__col-action--danger"
                                title="Remove this band"
                                onClick={() =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.id === selectedComponent.id
                                          ? {
                                              ...component,
                                              scoreBands: normalizeScoreBands(
                                                (
                                                  component.scoreBands || []
                                                ).filter(
                                                  (_item, index) =>
                                                    index !== bandIndex
                                                )
                                              )
                                            }
                                          : component
                                    )
                                  }))
                                }
                              >
                                ✕
                              </button>{" "}
                            </div>
                          )
                        )}{" "}
                        <button
                          type="button"
                          className="rjsf-builder__button rjsf-builder__button--ghost"
                          onClick={() =>
                            updateDefinition((current) => ({
                              ...current,
                              components: current.components.map((component) =>
                                component.id === selectedComponent.id
                                  ? {
                                      ...component,
                                      scoreBands: [
                                        ...(component.scoreBands || []),
                                        {
                                          min:
                                            (component.scoreBands?.length
                                              ? Math.max(
                                                  ...component.scoreBands.map(
                                                    (item) => item.max
                                                  )
                                                )
                                              : -1) + 1,
                                          max:
                                            (component.scoreBands?.length
                                              ? Math.max(
                                                  ...component.scoreBands.map(
                                                    (item) => item.max
                                                  )
                                                )
                                              : -1) + 10,
                                          label: ""
                                        }
                                      ]
                                    }
                                  : component
                              )
                            }))
                          }
                        >
                          {" "}
                          + Add score band{" "}
                        </button>{" "}
                      </div>
                        </div>
                      </details>
                    ) : null}{" "}
                    {isValidationTab ? (
                      <div className="rjsf-builder__split">
                        {" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={
                              selectedComponent.type === "systemDatagrid2"
                                ? false
                                : selectedComponent.type === "total"
                                ? false
                                : selectedComponent.type === "contentBlock"
                                ? false
                                : selectedComponent.required
                            }
                            disabled={
                              selectedComponent.type === "total" ||
                              selectedComponent.type === "systemDatagrid2" ||
                              selectedComponent.type === "contentBlock"
                            }
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) =>
                                    component.id === selectedComponent.id
                                      ? {
                                          ...component,
                                          required: event.target.checked
                                        }
                                      : component
                                )
                              }))
                            }
                          />{" "}
                          <span>Required</span>{" "}
                        </label>{" "}
                      </div>
                    ) : null}{" "}
                    {isPropertiesTab &&
                    !selectedComponentSharedEntry &&
                    selectedComponent.type !== "total" &&
                    selectedComponent.type !== "datagrid" &&
                    selectedComponent.type !== "contentBlock" &&
                    selectedComponent.type !== "matrix" ? (
                      <details
                        key={`grp-repeat-${selectedComponent.id}`}
                        className="rjsf-builder__group"
                        open={Boolean(selectedComponent.repeatGroup?.key)}
                      >
                        <summary>
                          <span className="rjsf-builder__group-chev">▶</span>
                          Repeatable group
                          <span className="rjsf-builder__group-peek">
                            {selectedComponent.repeatGroup?.key
                              ? selectedComponent.repeatGroup.key
                              : "off"}
                          </span>
                        </summary>
                        <div className="rjsf-builder__group-body">
                      <div className="rjsf-builder__block">
                        {" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={Boolean(
                              selectedComponent.repeatGroup?.key
                            )}
                            onChange={(event) =>
                              updateSelectedComponent((component) => {
                                if (!event.target.checked) {
                                  return {
                                    ...component,
                                    repeatGroup: undefined
                                  };
                                }
                                const fallbackKey = component.section
                                  ? makeUniqueRepeatGroupKey(
                                      definition.components,
                                      component.id,
                                      component.section
                                    )
                                  : makeUniqueRepeatGroupKey(
                                      definition.components,
                                      component.id,
                                      "group"
                                    );
                                return {
                                  ...component,
                                  repeatGroup: {
                                    key: fallbackKey,
                                    title: component.section || fallbackKey,
                                    minItems: 1,
                                    defaultItems: 1
                                  }
                                };
                              })
                            }
                          />{" "}
                          <span>
                            {" "}
                            Store this field in a repeatable array group{" "}
                          </span>{" "}
                        </label>{" "}
                        {selectedComponent.repeatGroup?.key ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <label className="rjsf-builder__toggle">
                              {" "}
                              <input
                                type="checkbox"
                                checked={Boolean(
                                  selectedComponent.repeatGroup.asDataGrid
                                )}
                                onChange={(event) =>
                                  updateDefinition((current) => ({
                                    ...current,
                                    components: current.components.map(
                                      (component) =>
                                        component.repeatGroup?.key ===
                                        selectedComponent.repeatGroup?.key
                                          ? {
                                              ...component,
                                              repeatGroup: {
                                                ...(component.repeatGroup as RepeatGroupConfig),
                                                asDataGrid: event.target.checked
                                              }
                                            }
                                          : component
                                    )
                                  }))
                                }
                              />{" "}
                              <span>
                                {" "}
                                Use data grid row layout (RJSF v6 Layout Grid){" "}
                              </span>{" "}
                            </label>{" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              Applies to all fields in this repeatable group.{" "}
                            </div>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Group key</span>{" "}
                              <input
                                className="rjsf-builder__input"
                                value={selectedComponent.repeatGroup.key}
                                onChange={(event) =>
                                  updateSelectedComponent((component) => ({
                                    ...component,
                                    repeatGroup: {
                                      ...(component.repeatGroup as RepeatGroupConfig),
                                      key: makeUniqueRepeatGroupKey(
                                        definition.components,
                                        component.id,
                                        event.target.value
                                      )
                                    }
                                  }))
                                }
                              />{" "}
                            </label>{" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Group title</span>{" "}
                              <input
                                className="rjsf-builder__input"
                                value={
                                  selectedComponent.repeatGroup.title || ""
                                }
                                onChange={(event) =>
                                  updateSelectedComponent((component) => ({
                                    ...component,
                                    repeatGroup: {
                                      ...(component.repeatGroup as RepeatGroupConfig),
                                      title:
                                        event.target.value === ""
                                          ? undefined
                                          : event.target.value
                                    }
                                  }))
                                }
                              />{" "}
                            </label>{" "}
                            <div className="rjsf-builder__split rjsf-builder__split--triple">
                              {" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Min items</span>{" "}
                                <input
                                  type="number"
                                  min={0}
                                  className="rjsf-builder__input"
                                  value={
                                    selectedComponent.repeatGroup.minItems ?? 0
                                  }
                                  onChange={(event) =>
                                    updateSelectedComponent((component) => ({
                                      ...component,
                                      repeatGroup: {
                                        ...(component.repeatGroup as RepeatGroupConfig),
                                        minItems: Math.max(
                                          0,
                                          Math.floor(
                                            Number(event.target.value) || 0
                                          )
                                        )
                                      }
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Max items</span>{" "}
                                <input
                                  type="number"
                                  min={0}
                                  className="rjsf-builder__input"
                                  value={
                                    selectedComponent.repeatGroup.maxItems ?? 0
                                  }
                                  onChange={(event) =>
                                    updateSelectedComponent((component) => ({
                                      ...component,
                                      repeatGroup: {
                                        ...(component.repeatGroup as RepeatGroupConfig),
                                        maxItems:
                                          event.target.value === ""
                                            ? undefined
                                            : Math.max(
                                                0,
                                                Math.floor(
                                                  Number(event.target.value) ||
                                                    0
                                                )
                                              )
                                      }
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                              <label className="rjsf-builder__field">
                                {" "}
                                <span>Default rows</span>{" "}
                                <input
                                  type="number"
                                  min={0}
                                  className="rjsf-builder__input"
                                  value={
                                    selectedComponent.repeatGroup
                                      .defaultItems ?? 0
                                  }
                                  onChange={(event) =>
                                    updateSelectedComponent((component) => ({
                                      ...component,
                                      repeatGroup: {
                                        ...(component.repeatGroup as RepeatGroupConfig),
                                        defaultItems: Math.max(
                                          0,
                                          Math.floor(
                                            Number(event.target.value) || 0
                                          )
                                        )
                                      }
                                    }))
                                  }
                                />{" "}
                              </label>{" "}
                            </div>{" "}
                            <div className="rjsf-builder__block">
                              {" "}
                              <div className="rjsf-builder__subtitle">
                                {" "}
                                Field order{" "}
                              </div>{" "}
                              <div className="rjsf-builder__help">
                                {" "}
                                This controls the field order inside each
                                repeatable row.{" "}
                              </div>{" "}
                              {selectedRepeatGroupComponents.length > 1 ? (
                                <div className="rjsf-builder__repeat-group-order">
                                  {" "}
                                  {selectedRepeatGroupComponents.map(
                                    (groupComponent, groupIndex) => (
                                      <div
                                        key={groupComponent.id}
                                        className={`rjsf-builder__repeat-group-order-item${
                                          groupComponent.id ===
                                          selectedComponent.id
                                            ? " is-selected"
                                            : ""
                                        }${
                                          groupComponent.id ===
                                          draggingRepeatGroupFieldId
                                            ? " is-dragging"
                                            : ""
                                        }${
                                          repeatGroupOrderDropTarget?.targetId ===
                                          groupComponent.id
                                            ? repeatGroupOrderDropTarget.placement ===
                                              "after"
                                              ? " is-drag-over-after"
                                              : " is-drag-over-before"
                                            : ""
                                        }`}
                                        onDragOver={(event) =>
                                          handleRepeatGroupOrderDragOver(
                                            event,
                                            groupComponent.id
                                          )
                                        }
                                        onDrop={(event) =>
                                          handleRepeatGroupOrderDrop(
                                            event,
                                            selectedRepeatGroupKey,
                                            groupComponent.id
                                          )
                                        }
                                      >
                                        {" "}
                                        <button
                                          type="button"
                                          className="rjsf-builder__repeat-group-order-main"
                                          onClick={() =>
                                            setSelectedId(groupComponent.id)
                                          }
                                        >
                                          {" "}
                                          <span className="rjsf-builder__repeat-group-order-index">
                                            {" "}
                                            {groupIndex + 1}{" "}
                                          </span>{" "}
                                          <span className="rjsf-builder__repeat-group-order-text">
                                            {" "}
                                            <span className="rjsf-builder__repeat-group-order-title">
                                              {" "}
                                              {groupComponent.label ||
                                                groupComponent.key}{" "}
                                            </span>{" "}
                                            <span className="rjsf-builder__repeat-group-order-meta">
                                              {" "}
                                              {groupComponent.key}{" "}
                                            </span>{" "}
                                          </span>{" "}
                                        </button>{" "}
                                        <div className="rjsf-builder__repeat-group-order-actions">
                                          {" "}
                                          <div
                                            className="rjsf-builder__repeat-group-order-handle"
                                            title="Drag to reorder within this repeatable group"
                                            draggable
                                            onDragStart={(event) => {
                                              event.dataTransfer.effectAllowed =
                                                "move";
                                              setDraggingRepeatGroupFieldId(
                                                groupComponent.id
                                              );
                                              setRepeatGroupOrderDropTarget(
                                                null
                                              );
                                              setDragData(
                                                event.dataTransfer,
                                                DRAG_TYPE_REPEAT_GROUP_COMPONENT,
                                                groupComponent.id
                                              );
                                            }}
                                            onDragEnd={() =>
                                              clearRepeatGroupOrderDragState()
                                            }
                                          >
                                            {" "}
                                            :::{" "}
                                          </div>{" "}
                                          <button
                                            type="button"
                                            className="rjsf-builder__button rjsf-builder__button--small"
                                            disabled={groupIndex === 0}
                                            onClick={() => {
                                              setSelectedId(groupComponent.id);
                                              moveComponentWithinRepeatGroup(
                                                selectedRepeatGroupKey,
                                                groupComponent.id,
                                                "up"
                                              );
                                            }}
                                          >
                                            {" "}
                                            Up{" "}
                                          </button>{" "}
                                          <button
                                            type="button"
                                            className="rjsf-builder__button rjsf-builder__button--small"
                                            disabled={
                                              groupIndex >=
                                              selectedRepeatGroupComponents.length -
                                                1
                                            }
                                            onClick={() => {
                                              setSelectedId(groupComponent.id);
                                              moveComponentWithinRepeatGroup(
                                                selectedRepeatGroupKey,
                                                groupComponent.id,
                                                "down"
                                              );
                                            }}
                                          >
                                            {" "}
                                            Down{" "}
                                          </button>{" "}
                                        </div>{" "}
                                      </div>
                                    )
                                  )}{" "}
                                </div>
                              ) : (
                                <div className="rjsf-builder__empty">
                                  {" "}
                                  Add another field to this repeatable group to
                                  change the order.{" "}
                                </div>
                              )}{" "}
                            </div>{" "}
                          </div>
                        ) : null}{" "}
                      </div>
                        </div>
                      </details>
                    ) : null}{" "}
                    {isPropertiesTab ? (
                      <details
                        key={`grp-vis-${selectedComponent.id}`}
                        className="rjsf-builder__group"
                        open={Boolean(
                          selectedComponent.visibility?.rules?.length
                        )}
                      >
                        <summary>
                          <span className="rjsf-builder__group-chev">▶</span>
                          Conditional visibility
                          <span className="rjsf-builder__group-peek">
                            {selectedComponent.visibility?.rules?.length
                              ? `${selectedComponent.visibility.rules.length} rule${
                                  selectedComponent.visibility.rules.length ===
                                  1
                                    ? ""
                                    : "s"
                                }`
                              : "no rules"}
                          </span>
                        </summary>
                        <div className="rjsf-builder__group-body">
                      <div className="rjsf-builder__block">
                        {" "}
                        <label className="rjsf-builder__toggle">
                          {" "}
                          <input
                            type="checkbox"
                            checked={Boolean(
                              selectedComponent.visibility?.rules?.length
                            )}
                            onChange={(event) =>
                              updateSelectedComponent((component) => {
                                if (!event.target.checked) {
                                  return {
                                    ...component,
                                    visibility: undefined
                                  };
                                }
                                const firstTarget = definition.components.find(
                                  (item) => item.id !== component.id
                                )?.key;
                                return {
                                  ...component,
                                  visibility: {
                                    mode: "all",
                                    rules: [
                                      {
                                        id: makeId("rule"),
                                        whenKey: firstTarget,
                                        operator: "equals",
                                        value: ""
                                      }
                                    ]
                                  }
                                };
                              })
                            }
                          />{" "}
                          <span>Enable visibility rules</span>{" "}
                        </label>{" "}
                        {selectedComponent.visibility?.rules?.length ? (
                          <div className="rjsf-builder__block">
                            {" "}
                            <label className="rjsf-builder__field">
                              {" "}
                              <span>Match mode</span>{" "}
                              <select
                                className="rjsf-builder__select"
                                value={
                                  selectedComponent.visibility.mode || "all"
                                }
                                onChange={(event) =>
                                  updateSelectedComponent((component) => ({
                                    ...component,
                                    visibility: {
                                      ...(component.visibility as VisibilityConfig),
                                      mode:
                                        event.target.value === "any"
                                          ? "any"
                                          : "all"
                                    }
                                  }))
                                }
                              >
                                {" "}
                                {CONDITION_MODES.map((mode) => (
                                  <option key={mode.value} value={mode.value}>
                                    {" "}
                                    {mode.label}{" "}
                                  </option>
                                ))}{" "}
                              </select>{" "}
                            </label>{" "}
                            {selectedComponent.visibility.rules.map((rule) => (
                              <div
                                key={rule.id}
                                className="rjsf-builder__condition-row"
                              >
                                {" "}
                                <label className="rjsf-builder__field">
                                  {" "}
                                  <span>Field</span>{" "}
                                  <select
                                    className="rjsf-builder__select"
                                    value={rule.whenKey || ""}
                                    onChange={(event) =>
                                      updateSelectedComponent((component) => ({
                                        ...component,
                                        visibility: {
                                          ...(component.visibility as VisibilityConfig),
                                          rules: (
                                            component.visibility?.rules || []
                                          ).map((candidate) =>
                                            candidate.id === rule.id
                                              ? {
                                                  ...candidate,
                                                  whenKey:
                                                    event.target.value ||
                                                    undefined
                                                }
                                              : candidate
                                          )
                                        }
                                      }))
                                    }
                                  >
                                    {" "}
                                    <option value="">Select field</option>{" "}
                                    {definition.components
                                      .filter(
                                        (component) =>
                                          component.id !== selectedComponent.id
                                      )
                                      .map((component) => (
                                        <option
                                          key={component.id}
                                          value={component.key}
                                        >
                                          {" "}
                                          {component.label} ({component.key}){" "}
                                        </option>
                                      ))}{" "}
                                  </select>{" "}
                                </label>{" "}
                                <label className="rjsf-builder__field">
                                  {" "}
                                  <span>Operator</span>{" "}
                                  <select
                                    className="rjsf-builder__select"
                                    value={rule.operator || "equals"}
                                    onChange={(event) =>
                                      updateSelectedComponent((component) => ({
                                        ...component,
                                        visibility: {
                                          ...(component.visibility as VisibilityConfig),
                                          rules: (
                                            component.visibility?.rules || []
                                          ).map((candidate) =>
                                            candidate.id === rule.id
                                              ? {
                                                  ...candidate,
                                                  operator: event.target
                                                    .value as VisibilityOperator
                                                }
                                              : candidate
                                          )
                                        }
                                      }))
                                    }
                                  >
                                    {" "}
                                    <option value="equals">Equals</option>{" "}
                                    <option value="notEquals">
                                      Not equals
                                    </option>{" "}
                                    <option value="truthy">Truthy</option>{" "}
                                    <option value="falsy">Falsy</option>{" "}
                                    <option value="greaterThan">
                                      Greater than
                                    </option>{" "}
                                    <option value="lessThan">Less than</option>{" "}
                                    <option value="greaterOrEqual">
                                      Greater or equal
                                    </option>{" "}
                                    <option value="lessOrEqual">
                                      Less or equal
                                    </option>{" "}
                                    <option value="contains">Contains</option>{" "}
                                    <option value="startsWith">
                                      Starts with
                                    </option>{" "}
                                  </select>{" "}
                                </label>{" "}
                                {(rule.operator || "equals") !== "truthy" &&
                                (rule.operator || "equals") !== "falsy" ? (
                                  <label className="rjsf-builder__field">
                                    {" "}
                                    <span>Value</span>{" "}
                                    <input
                                      className="rjsf-builder__input"
                                      value={rule.value || ""}
                                      onChange={(event) =>
                                        updateSelectedComponent(
                                          (component) => ({
                                            ...component,
                                            visibility: {
                                              ...(component.visibility as VisibilityConfig),
                                              rules: (
                                                component.visibility?.rules ||
                                                []
                                              ).map((candidate) =>
                                                candidate.id === rule.id
                                                  ? {
                                                      ...candidate,
                                                      value: event.target.value
                                                    }
                                                  : candidate
                                              )
                                            }
                                          })
                                        )
                                      }
                                    />{" "}
                                  </label>
                                ) : (
                                  <div className="rjsf-builder__condition-empty" />
                                )}{" "}
                                <button
                                  type="button"
                                  className="rjsf-builder__button rjsf-builder__button--small rjsf-builder__button--danger"
                                  onClick={() =>
                                    updateSelectedComponent((component) => {
                                      const rules = (
                                        component.visibility?.rules || []
                                      ).filter(
                                        (candidate) => candidate.id !== rule.id
                                      );
                                      return {
                                        ...component,
                                        visibility: rules.length
                                          ? {
                                              ...(component.visibility as VisibilityConfig),
                                              rules
                                            }
                                          : undefined
                                      };
                                    })
                                  }
                                  disabled={
                                    selectedComponent.visibility?.rules
                                      .length === 1
                                  }
                                >
                                  {" "}
                                  Remove{" "}
                                </button>{" "}
                              </div>
                            ))}{" "}
                            <button
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--small"
                              onClick={() =>
                                updateSelectedComponent((component) => ({
                                  ...component,
                                  visibility: {
                                    ...(component.visibility as VisibilityConfig),
                                    mode: component.visibility?.mode || "all",
                                    rules: [
                                      ...(component.visibility?.rules || []),
                                      {
                                        id: makeId("rule"),
                                        whenKey: definition.components.find(
                                          (item) => item.id !== component.id
                                        )?.key,
                                        operator: "equals",
                                        value: ""
                                      }
                                    ]
                                  }
                                }))
                              }
                            >
                              {" "}
                              + Add rule{" "}
                            </button>{" "}
                          </div>
                        ) : null}{" "}
                      </div>
                        </div>
                      </details>
                    ) : null}{" "}
                    <div className="rjsf-builder__button-row">
                      {" "}
                      <button
                        type="button"
                        className="rjsf-builder__button"
                        disabled={selectedIndex <= 0}
                        onClick={() =>
                          reorderComponents(
                            selectedComponent.id,
                            definition.components[selectedIndex - 1].id
                          )
                        }
                      >
                        {" "}
                        Move up{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className="rjsf-builder__button"
                        disabled={
                          selectedIndex < 0 ||
                          selectedIndex >= definition.components.length - 1
                        }
                        onClick={() =>
                          reorderComponents(
                            selectedComponent.id,
                            definition.components[selectedIndex + 1].id
                          )
                        }
                      >
                        {" "}
                        Move down{" "}
                      </button>{" "}
                    </div>{" "}
                    <div className="rjsf-builder__button-row">
                      {" "}
                      <button
                        type="button"
                        className="rjsf-builder__button"
                        title="Ctrl+D"
                        onClick={duplicateSelectedComponent}
                      >
                        {" "}
                        Duplicate{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className="rjsf-builder__button"
                        title="Copy field to clipboard (Ctrl+C) — paste into this or another form"
                        onClick={copySelectedComponent}
                      >
                        {" "}
                        Copy{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className="rjsf-builder__button"
                        title="Paste a copied field after the selection (Ctrl+V)"
                        onClick={() => void pasteComponent()}
                      >
                        {" "}
                        Paste{" "}
                      </button>{" "}
                      <button
                        type="button"
                        className="rjsf-builder__button rjsf-builder__button--danger"
                        title="Delete key"
                        onClick={deleteSelectedComponent}
                      >
                        {" "}
                        Delete{" "}
                      </button>{" "}
                    </div>{" "}
                    {selectedComponent.type !== "systemDatagrid2" &&
                    selectedComponent.type !== "contentBlock" ? (
                      <div className="rjsf-builder__field">
                        {" "}
                        <button
                          type="button"
                          className="rjsf-builder__token-help-toggle"
                          onClick={() =>
                            setBatteryExpanded((current) => !current)
                          }
                          aria-expanded={batteryExpanded}
                        >
                          {" "}
                          Duplicate for each label…{" "}
                        </button>{" "}
                        {batteryExpanded ? (
                          <Fragment>
                            {" "}
                            <div className="rjsf-builder__help">
                              {" "}
                              One label per line. Each line becomes a copy of
                              this field (same type, options, required,
                              section) placed right after it — built for
                              question batteries like SBIRT or PHQ-9.{" "}
                            </div>{" "}
                            <textarea
                              className="rjsf-builder__input"
                              rows={5}
                              placeholder={
                                "Have you lost friends because of using?\nHave you ever experienced blackouts?"
                              }
                              value={batteryLabelsDraft}
                              onChange={(event) =>
                                setBatteryLabelsDraft(event.target.value)
                              }
                            />{" "}
                            <button
                              type="button"
                              className="rjsf-builder__button"
                              disabled={
                                !batteryLabelsDraft
                                  .split("\n")
                                  .some((line) => clean(line))
                              }
                              onClick={() => {
                                const labels = batteryLabelsDraft
                                  .split("\n")
                                  .map((line) => clean(line))
                                  .filter(Boolean);
                                if (!labels.length) {
                                  return;
                                }
                                updateDefinition((current) => {
                                  const sourceIndex =
                                    current.components.findIndex(
                                      (component) =>
                                        component.id === selectedComponent.id
                                    );
                                  if (sourceIndex < 0) {
                                    return current;
                                  }
                                  const source =
                                    current.components[sourceIndex];
                                  const next = [...current.components];
                                  const clones: FormComponent[] = [];
                                  labels.forEach((labelText) => {
                                    const key = makeUniqueKey(labelText, [
                                      ...next,
                                      ...clones
                                    ]);
                                    clones.push({
                                      ...source,
                                      id: makeId("cmp"),
                                      key,
                                      label: labelText,
                                      // Identity-bound and value fields must not
                                      // be copied into battery clones.
                                      sharedFieldRef: undefined,
                                      prefillTokenKey: undefined,
                                      defaultValue: undefined
                                    });
                                  });
                                  next.splice(sourceIndex + 1, 0, ...clones);
                                  return { ...current, components: next };
                                });
                                setBatteryLabelsDraft("");
                                setBatteryExpanded(false);
                              }}
                            >
                              {" "}
                              Create fields{" "}
                            </button>{" "}
                          </Fragment>
                        ) : null}{" "}
                      </div>
                    ) : null}{" "}
                  </div>
                ) : (
                  <div className="rjsf-builder__empty">
                    {" "}
                    Select a component to edit field settings.{" "}
                  </div>
                )}{" "}
              </aside>
            ) : null}{" "}
          </div>{" "}
          {showDatagridConfigModal && selectedComponent?.type === "datagrid" ? (
            <div
              className="rjsf-builder__modal-backdrop"
              onClick={closeDataGridSettingsModal}
            >
              {" "}
              <div
                className="rjsf-builder__modal rjsf-builder__modal--datagrid"
                role="dialog"
                aria-modal="true"
                aria-label="Datagrid settings"
                onClick={(event) => event.stopPropagation()}
              >
                {" "}
                <div className="rjsf-builder__modal-header">
                  {" "}
                  <div>
                    {" "}
                    <div className="rjsf-builder__title">
                      Datagrid settings
                    </div>{" "}
                    <div className="rjsf-builder__help">
                      {" "}
                      {selectedComponent.label || selectedComponent.key}{" "}
                    </div>{" "}
                  </div>{" "}
                  <button
                    type="button"
                    className="rjsf-builder__button rjsf-builder__button--small"
                    onClick={closeDataGridSettingsModal}
                  >
                    {" "}
                    Close{" "}
                  </button>{" "}
                </div>{" "}
                <div className="rjsf-builder__modal-body">
                  {" "}
                  <div className="rjsf-builder__block">
                    {" "}
                    <label className="rjsf-builder__field">
                      {" "}
                      <span>Row identity key (optional)</span>{" "}
                      <input
                        className="rjsf-builder__input"
                        value={selectedComponent.datagridRowIdKey || ""}
                        placeholder="id"
                        onChange={(event) =>
                          updateDefinition((current) => ({
                            ...current,
                            components: current.components.map((component) =>
                              component.id === selectedComponent.id
                                ? {
                                    ...component,
                                    datagridRowIdKey:
                                      event.target.value === ""
                                        ? undefined
                                        : normalizeKey(event.target.value)
                                  }
                                : component
                            )
                          }))
                        }
                      />{" "}
                    </label>{" "}
                    <div className="rjsf-builder__datagrid-columns">
                      {" "}
                      <div className="rjsf-builder__datagrid-columns-header">
                        {" "}
                        <span>Column</span> <span>Label</span> <span>Type</span>{" "}
                        <span>Req</span> <span>Span</span> <span>Options</span>{" "}
                        <span>Actions</span>{" "}
                      </div>{" "}
                      {selectedDataGridColumns.map((column, index) => (
                        <div
                          className="rjsf-builder__datagrid-columns-row"
                          key={column.id}
                        >
                          {" "}
                          <input
                            className="rjsf-builder__input"
                            value={column.key}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (
                                      component.id !== selectedComponent.id ||
                                      component.type !== "datagrid"
                                    ) {
                                      return component;
                                    }
                                    const columns =
                                      normalizeDataGridColumns(
                                        component.datagridColumns
                                      ) ||
                                      createDefaultDataGridColumns(
                                        component.key
                                      );
                                    const nextColumns = columns.map((item) =>
                                      item.id === column.id
                                        ? {
                                            ...item,
                                            key: makeUniqueDataGridColumnKey(
                                              event.target.value || item.key,
                                              columns,
                                              item.id
                                            )
                                          }
                                        : item
                                    );
                                    return {
                                      ...component,
                                      datagridColumns: nextColumns
                                    };
                                  }
                                )
                              }))
                            }
                          />{" "}
                          <input
                            className="rjsf-builder__input"
                            value={column.label}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (
                                      component.id !== selectedComponent.id ||
                                      component.type !== "datagrid"
                                    ) {
                                      return component;
                                    }
                                    const columns =
                                      normalizeDataGridColumns(
                                        component.datagridColumns
                                      ) ||
                                      createDefaultDataGridColumns(
                                        component.key
                                      );
                                    return {
                                      ...component,
                                      datagridColumns: columns.map((item) =>
                                        item.id === column.id
                                          ? {
                                              ...item,
                                              label: event.target.value
                                            }
                                          : item
                                      )
                                    };
                                  }
                                )
                              }))
                            }
                          />{" "}
                          <select
                            className="rjsf-builder__select"
                            value={column.type}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (
                                      component.id !== selectedComponent.id ||
                                      component.type !== "datagrid"
                                    ) {
                                      return component;
                                    }
                                    const columns =
                                      normalizeDataGridColumns(
                                        component.datagridColumns
                                      ) ||
                                      createDefaultDataGridColumns(
                                        component.key
                                      );
                                    return {
                                      ...component,
                                      datagridColumns: columns.map((item) =>
                                        item.id === column.id
                                          ? {
                                              ...item,
                                              type: normalizeDataGridColumnType(
                                                event.target.value
                                              ),
                                              options:
                                                event.target.value ===
                                                  "select" ||
                                                event.target.value === "radio"
                                                  ? item.options?.length
                                                    ? item.options
                                                    : ["Option 1", "Option 2"]
                                                  : undefined
                                            }
                                          : item
                                      )
                                    };
                                  }
                                )
                              }))
                            }
                          >
                            {" "}
                            {DATAGRID_COLUMN_TYPES.map((item) => (
                              <option key={item.type} value={item.type}>
                                {" "}
                                {item.label}{" "}
                              </option>
                            ))}{" "}
                          </select>{" "}
                          <label className="rjsf-builder__toggle rjsf-builder__toggle--compact">
                            {" "}
                            <input
                              type="checkbox"
                              checked={Boolean(column.required)}
                              onChange={(event) =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) => {
                                      if (
                                        component.id !== selectedComponent.id ||
                                        component.type !== "datagrid"
                                      ) {
                                        return component;
                                      }
                                      const columns =
                                        normalizeDataGridColumns(
                                          component.datagridColumns
                                        ) ||
                                        createDefaultDataGridColumns(
                                          component.key
                                        );
                                      return {
                                        ...component,
                                        datagridColumns: columns.map((item) =>
                                          item.id === column.id
                                            ? {
                                                ...item,
                                                required: event.target.checked
                                              }
                                            : item
                                        )
                                      };
                                    }
                                  )
                                }))
                              }
                            />{" "}
                          </label>{" "}
                          <input
                            type="number"
                            min={1}
                            max={12}
                            className="rjsf-builder__input"
                            value={column.columnSpan ?? 6}
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (
                                      component.id !== selectedComponent.id ||
                                      component.type !== "datagrid"
                                    ) {
                                      return component;
                                    }
                                    const columns =
                                      normalizeDataGridColumns(
                                        component.datagridColumns
                                      ) ||
                                      createDefaultDataGridColumns(
                                        component.key
                                      );
                                    return {
                                      ...component,
                                      datagridColumns: columns.map((item) =>
                                        item.id === column.id
                                          ? {
                                              ...item,
                                              columnSpan: clamp(
                                                Math.floor(
                                                  Number(event.target.value) ||
                                                    1
                                                ),
                                                1,
                                                12
                                              )
                                            }
                                          : item
                                      )
                                    };
                                  }
                                )
                              }))
                            }
                          />{" "}
                          <input
                            className="rjsf-builder__input"
                            value={(column.options || []).join(", ")}
                            disabled={
                              column.type !== "select" &&
                              column.type !== "radio"
                            }
                            placeholder="Option 1, Option 2"
                            onChange={(event) =>
                              updateDefinition((current) => ({
                                ...current,
                                components: current.components.map(
                                  (component) => {
                                    if (
                                      component.id !== selectedComponent.id ||
                                      component.type !== "datagrid"
                                    ) {
                                      return component;
                                    }
                                    const columns =
                                      normalizeDataGridColumns(
                                        component.datagridColumns
                                      ) ||
                                      createDefaultDataGridColumns(
                                        component.key
                                      );
                                    return {
                                      ...component,
                                      datagridColumns: columns.map((item) => {
                                        if (item.id !== column.id) {
                                          return item;
                                        }
                                        if (
                                          item.type !== "select" &&
                                          item.type !== "radio"
                                        ) {
                                          return {
                                            ...item,
                                            options: undefined
                                          };
                                        }
                                        const options = Array.from(
                                          new Set(
                                            event.target.value
                                              .split(/\r?\n|,/)
                                              .map((value) => clean(value))
                                              .filter(Boolean)
                                          )
                                        );
                                        return {
                                          ...item,
                                          options: options.length
                                            ? options
                                            : undefined
                                        };
                                      })
                                    };
                                  }
                                )
                              }))
                            }
                          />{" "}
                          <div className="rjsf-builder__button-row">
                            {" "}
                            <button
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--small"
                              disabled={index === 0}
                              onClick={() =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) => {
                                      if (
                                        component.id !== selectedComponent.id ||
                                        component.type !== "datagrid"
                                      ) {
                                        return component;
                                      }
                                      const columns =
                                        normalizeDataGridColumns(
                                          component.datagridColumns
                                        ) ||
                                        createDefaultDataGridColumns(
                                          component.key
                                        );
                                      const next = [...columns];
                                      const [moved] = next.splice(index, 1);
                                      next.splice(index - 1, 0, moved);
                                      return {
                                        ...component,
                                        datagridColumns: next
                                      };
                                    }
                                  )
                                }))
                              }
                            >
                              {" "}
                              Up{" "}
                            </button>{" "}
                            <button
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--small"
                              disabled={
                                index >= selectedDataGridColumns.length - 1
                              }
                              onClick={() =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) => {
                                      if (
                                        component.id !== selectedComponent.id ||
                                        component.type !== "datagrid"
                                      ) {
                                        return component;
                                      }
                                      const columns =
                                        normalizeDataGridColumns(
                                          component.datagridColumns
                                        ) ||
                                        createDefaultDataGridColumns(
                                          component.key
                                        );
                                      const next = [...columns];
                                      const [moved] = next.splice(index, 1);
                                      next.splice(index + 1, 0, moved);
                                      return {
                                        ...component,
                                        datagridColumns: next
                                      };
                                    }
                                  )
                                }))
                              }
                            >
                              {" "}
                              Down{" "}
                            </button>{" "}
                            <button
                              type="button"
                              className="rjsf-builder__button rjsf-builder__button--small rjsf-builder__button--danger"
                              onClick={() =>
                                updateDefinition((current) => ({
                                  ...current,
                                  components: current.components.map(
                                    (component) => {
                                      if (
                                        component.id !== selectedComponent.id ||
                                        component.type !== "datagrid"
                                      ) {
                                        return component;
                                      }
                                      const columns =
                                        normalizeDataGridColumns(
                                          component.datagridColumns
                                        ) ||
                                        createDefaultDataGridColumns(
                                          component.key
                                        );
                                      const next = columns.filter(
                                        (item) => item.id !== column.id
                                      );
                                      return {
                                        ...component,
                                        datagridColumns: next.length
                                          ? next
                                          : createDefaultDataGridColumns(
                                              component.key
                                            )
                                      };
                                    }
                                  )
                                }))
                              }
                            >
                              {" "}
                              X{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                    <button
                      type="button"
                      className="rjsf-builder__button rjsf-builder__button--small"
                      onClick={() =>
                        updateDefinition((current) => ({
                          ...current,
                          components: current.components.map((component) => {
                            if (
                              component.id !== selectedComponent.id ||
                              component.type !== "datagrid"
                            ) {
                              return component;
                            }
                            const columns =
                              normalizeDataGridColumns(
                                component.datagridColumns
                              ) || createDefaultDataGridColumns(component.key);
                            const provisionalKey = makeUniqueDataGridColumnKey(
                              "column",
                              columns
                            );
                            return {
                              ...component,
                              datagridColumns: [
                                ...columns,
                                {
                                  id: makeId("col"),
                                  key: provisionalKey,
                                  label: provisionalKey,
                                  type: "text",
                                  required: false,
                                  columnSpan: 4
                                }
                              ]
                            };
                          })
                        }))
                      }
                    >
                      {" "}
                      + Add column{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ) : null}{" "}
        </Fragment>
      )}{" "}
    </div>
  );
}
