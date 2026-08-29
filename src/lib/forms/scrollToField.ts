export function scrollToField(
  id: string
) {
  const element =
    document.getElementById(id);

  element?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}