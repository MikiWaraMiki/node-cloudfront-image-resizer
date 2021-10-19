const SupportExtention = {
  JPEG: 'jpeg',
  JPG: 'jpg',
} as const;

export type SupportedExtention =
  typeof SupportExtention[keyof typeof SupportExtention];

const isSupported = (extetion: string): boolean =>
  Object.values(SupportExtention).some((ext) => ext === extetion);

export const isFileSupported = (filePath: string): boolean => {
  const ext = filePath.split('.')[1];
  return isSupported(ext);
};
