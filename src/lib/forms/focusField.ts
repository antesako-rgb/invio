export function focusField(
  id: string
) {
  const element =
    document.getElementById(id);

  element?.focus();
}