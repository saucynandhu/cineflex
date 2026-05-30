import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUpcoming(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const releaseDate = new Date(dateString);
  const today = new Date();
  
  // Set times to midnight for accurate day comparison
  releaseDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return releaseDate > today;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Coming Soon';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
