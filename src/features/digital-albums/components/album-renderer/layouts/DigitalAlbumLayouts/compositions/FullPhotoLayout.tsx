import type { Parts } from "../types";

export default function FullPhotoLayout({
  photo,
}: Parts) {
  return (
    <>
      {photo(
        0
      )}
    </>
  );
}
