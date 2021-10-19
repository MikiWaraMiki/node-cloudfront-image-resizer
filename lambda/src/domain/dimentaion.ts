export type Dimention = {
  width: number;
  height: number;
};

const AllowDimention: { [key: string]: Dimention } = {
  PIXEL_100: { width: 100, height: 100 },
  PIXEL_300: { width: 300, height: 300 },
} as const;

export type AllowDimentionType =
  typeof AllowDimention[keyof typeof AllowDimention];

export const isAllowCombination = (width: number, height: number): boolean =>
  Object.values(AllowDimention).some(
    (dimention) => dimention.width === width && dimention.height === height,
  );

export const of = (width: number, height: number): Dimention => {
  const dimention = Object.values(AllowDimention).find(
    (dimentionSet) =>
      dimentionSet.width === width && dimentionSet.height === height,
  );
  if (!dimention) {
    throw new Error('invalid parmaeter set');
  }

  return dimention;
};
