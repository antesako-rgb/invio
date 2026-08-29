export function getInitials(
  value: string,
  maxLength = 2
): string {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, maxLength)
      .toUpperCase() || "?"
  );
}