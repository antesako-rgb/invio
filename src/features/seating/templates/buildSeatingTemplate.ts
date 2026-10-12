import { appearanceOf } from "../appearance/model";
import { elementDocument, type SeatingElement } from "../elements/model";
import type { SeatingTable } from "../types";
import { seatingTemplateDocumentSchema } from "./seatingTemplate.schema";
import { normalizePreset } from "../appearance/presets";

/** New templates use v2. Stable geometry only: no guest identity, assignment,
 * database ID, project ID, revision, attendance or RSVP data is exported. */
export function buildSeatingTemplate(width: number, height: number, tables: readonly SeatingTable[], elements: readonly SeatingElement[], roomAppearance:unknown={}) {
  return seatingTemplateDocumentSchema.parse({ width_cm: width, height_cm: height, appearance:normalizePreset("room",roomAppearance),
    tables: tables.map(table => { const {name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg}=table;return {name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg}; }),
    elements: elements.map(e=>({...elementDocument(e),appearance:normalizePreset(e.kind,appearanceOf(e))})),
  });
}
