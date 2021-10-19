const SupportExtention = {
  JPEG: 'jpeg',
  JPG: 'jpg',
  PNG: 'png',
} as const;

export type SupportedExtention =
  typeof SupportExtention[keyof typeof SupportExtention];

export const isSupported = (extetion: string): boolean =>
  Object.values(SupportExtention).some((ext) => ext === extetion);
