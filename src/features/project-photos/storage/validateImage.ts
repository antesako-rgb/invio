import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "../upload/constants/photoUpload.constants";

export function validateImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Podržani su JPG, PNG i WEBP formati.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Slika ne smije biti veća od ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
    );
  }
}
