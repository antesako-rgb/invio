import type { ProjectGuest } from "../types/database";

export function guestOptions(people: ProjectGuest[]) {
    const fullName = (person: ProjectGuest) => [person.first_name, person.last_name].filter(Boolean).join(" ");
    const key = (label: string) => label.normalize("NFC").trim().toLocaleLowerCase();
    const nameCounts = new Map<string, number>();
    for (const person of people) {
        const name = key(fullName(person));
        nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
    }
    const labels = people.map(person => {
        const name = fullName(person);
        const context = person.invitationNames?.join(", ");
        return { value: person.id, label: (nameCounts.get(key(name)) ?? 0) > 1 && context ? name + " — " + context : name };
    });
    const labelCounts = new Map<string, number>();
    for (const option of labels) {
        const label = key(option.label);
        labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
    }
    return labels.map(option => ({
        ...option,
        label: (labelCounts.get(key(option.label)) ?? 0) > 1
            ? option.label + " · " + option.value.slice(0, 8)
            : option.label,
    }));
}
