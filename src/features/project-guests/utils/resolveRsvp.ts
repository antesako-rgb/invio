export type GuestRsvpStatus = "attending" | "not_attending";
export function resolveGuestRsvp(personalized: GuestRsvpStatus | undefined, generic: {
    status: GuestRsvpStatus;
    submittedAt: string;
}[]) {
    const distinct = new Set(generic.map(g => g.status));
    if (personalized)
        return { status: personalized, conflict: generic.some(g => g.status !== personalized) };
    const ordered = [...generic].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
    if (!ordered.length)
        return { status: undefined, conflict: false };
    const newest = Date.parse(ordered[0].submittedAt);
    const tied = ordered.filter(g => Date.parse(g.submittedAt) === newest);
    return { status: new Set(tied.map(g => g.status)).size > 1 ? undefined : ordered[0].status, conflict: distinct.size > 1 };
}
