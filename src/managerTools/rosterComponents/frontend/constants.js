// Colour variables
export const textColour = 'var(--color-text-primary)';
export const headerColour = 'var(--color-text-primary)';
export const backgroundColour = 'var(--color-background)';
export const accentColour = 'var(--color-primary)';
export const secondaryColour = 'var(--color-secondary)';
export const primaryColour = 'var(--color-highlight)';

// Generate 24 hour options ("00:00" ... "23:00")
export const hourOptions = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

export const dayStatusOptions = [
  { value: 'leave day', label: 'Leave Day' },
  { value: 'sick day', label: 'Sick Day' }
];
