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

export function isValidUrl(url:string):boolean {
  try {
    new URL(url);

    return true;
    
  } catch (error) {
    return false;
  }
}
