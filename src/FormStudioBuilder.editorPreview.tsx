import {
  createElement,
  isValidElement,
  type ReactNode,
  type ReactElement
} from "react";
import type { FormStudioBuilderPreviewProps } from "../typings/FormStudioBuilderProps";
import "./ui/FormStudioBuilder.css";

function resolveSlotRenderer(raw: unknown): ReactNode {
  if (raw == null || raw === false) {
    return null;
  }
  if (Array.isArray(raw)) {
    return raw as ReactNode;
  }
  if (
    isValidElement(raw) ||
    typeof raw === "string" ||
    typeof raw === "number"
  ) {
    return raw;
  }
  if (typeof raw === "function") {
    const renderer = raw as (props?: Record<string, unknown>) => ReactNode;
    return resolveSlotRenderer(createElement(renderer, {}));
  }
  if (typeof raw === "object" && raw && "renderer" in raw) {
    return resolveSlotRenderer((raw as { renderer?: unknown }).renderer);
  }
  return null;
}

const SYSTEM_TEMPLATE_SLOTS = [
  { key: "activeMedicationsDatagrid2", label: "Active Medications" },
  { key: "activeAllergiesDatagrid2", label: "Active Allergies" },
  { key: "billingDiagnosisDatagrid2", label: "Assessment / Diagnoses" },
  { key: "activeBillingCodesDatagrid2", label: "Plan / Billing Codes" },
  { key: "recentDrugTestDatagrid2", label: "Most Recent Drug Test" },
  { key: "recentVitalsDatagrid2", label: "Most Recent Vitals" }
] as const;

export function preview(props: FormStudioBuilderPreviewProps): ReactElement {
  const showViewerHeader =
    String((props as unknown as Record<string, unknown>).showViewerHeader) !==
    "false";
  const viewerHeaderRenderer = resolveSlotRenderer(
    (props as unknown as Record<string, unknown>).viewerHeaderWidget
  );
  return (
    <div className="rjsf-builder rjsf-builder--preview">
      <div className="rjsf-builder__preview-card">
        <div className="rjsf-builder__preview-title">RJSF Form Builder</div>
        {showViewerHeader ? (
          <div className="rjsf-builder__preview-header-slot">
            <div className="rjsf-builder__system-template-placeholder__title">
              Viewer header widget
            </div>
            <div className="rjsf-builder__system-template-placeholder__meta">
              Renders in viewer mode before the Save button
            </div>
            <div className="rjsf-builder__system-template-placeholder__widget rjsf-builder__preview-header-slot-widget">
              {viewerHeaderRenderer || (
                <div className="rjsf-builder__preview-header-slot-empty">
                  No header widget configured
                </div>
              )}
            </div>
          </div>
        ) : null}
        <div className="rjsf-builder__preview-line" />
        <div className="rjsf-builder__preview-line" />
        <div className="rjsf-builder__preview-line rjsf-builder__preview-line--short" />
        <div className="rjsf-builder__system-template-placeholder rjsf-builder__preview-template-list">
          <div className="rjsf-builder__system-template-placeholder__title">
            System datagrid placeholders
          </div>
          <div className="rjsf-builder__system-template-placeholder__meta">
            Configure in widget properties (Mendix widgets)
          </div>
          {SYSTEM_TEMPLATE_SLOTS.map((slot) => {
            const slotRenderer = resolveSlotRenderer(
              (props as unknown as Record<string, unknown>)[slot.key]
            );
            return (
              <div
                className="rjsf-builder__system-template-placeholder__row rjsf-builder__system-template-placeholder__row--header"
                key={slot.key}
              >
                <span>{slot.label}</span>
                <span>{slotRenderer ? "Configured" : "Not configured"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
