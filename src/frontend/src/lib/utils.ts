import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a given ID is a backend ID (i.e., bigint as a string).
 * local id is UUID and its not not purely numeric.
 */
export function isBackendId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);

    return true;

  } catch (error) {
    return false;
  }
}

export function removeNonAlphaNumeric(text:string):string {
  return text.replace(/[^a-z0-9]+/g, "-");
}

export function slugify(text: string): string {
  return text
    .toString() // ensure string
    .normalize("NFD") // split accented letters
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ""); // remove leading/trailing dashes
}

export function slugifyLive(text: string): string {
  return text
    .toString()
    .normalize("NFD")                // break accented chars
    .replace(/[\u0300-\u036f]/g, "")  // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")     // allow letters, numbers, dash
    .replace(/^-+/, "");              // remove leading dashes only
}

