export const ResponseCodeMap: { [key: string]: string } = {
  RESPONSE_OK: '200',
  RESPONSE_NOTFOUND: '404',
  RESPONSE_ERROR: '403',
  RESPONSE_ORIGINAL: '304',
} as const;

export type ResponseCode = typeof ResponseCodeMap[keyof typeof ResponseCodeMap];
