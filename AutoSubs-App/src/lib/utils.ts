import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, "")
}

export function sanitizeValue(value: string) {
  return value.replace(/[;{}\\\\<>]/g, "")
}
