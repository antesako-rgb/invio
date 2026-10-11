/** Keep SQL failure details on the server; the editor receives only a known code. */
export function getSeatingErrorCode(error: unknown) {
    if (!error || typeof error !== "object") return "SEATING_FAILED" as const;
    if ("code" in error && error.code === "40001") return "REVISION_CONFLICT" as const;
    if (!("message" in error)) return "SEATING_FAILED" as const;
    switch (error.message) {
        case "Seat occupied": return "SEAT_OCCUPIED" as const;
        case "Seat outside table capacity":
        case "Seat requires a table": return "SEAT_RANGE" as const;
        case "Seat would be removed": return "SEAT_CAPACITY" as const;
        case "Seated guests prevent shape change": return "SEAT_SHAPE" as const;
        case "Participant missing": return "PARTICIPANT_MISSING" as const;
        case "Table full":
        case "Capacity below occupancy": return "CAPACITY" as const;
        case "Active person missing":
        case "Person archived": return "ARCHIVED" as const;
        default: return "SEATING_FAILED" as const;
    }
}

export type SeatingErrorCode = ReturnType<typeof getSeatingErrorCode>;

/** A transport/gateway failure can arrive after COMMIT; reload before another assignment. */
export function getSeatingAssignmentErrorCode(error: unknown, status: number) {
    const hasSqlState = !!error && typeof error === "object" && "code" in error &&
        typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code);
    if (status === 0 || (status >= 500 && !hasSqlState)) return "SEATING_UNCONFIRMED" as const;
    return getSeatingErrorCode(error);
}
