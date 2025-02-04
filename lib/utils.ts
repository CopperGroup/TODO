import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to calculate the brightness of a hex color
function getBrightness(hex: string): number {
  // Remove the hash (#) if it exists
  if (hex.startsWith('#')) hex = hex.slice(1);

  // Convert the hex color to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate brightness using the luminance formula
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return brightness;
}

// Function to determine whether to use white or black text
export function getTextColorBasedOnBackground(hexColor: string): string {
  const brightness = getBrightness(hexColor);

  // If brightness is below a threshold, use white text, otherwise use black text
  return brightness < 128 ? 'white' : 'black';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}