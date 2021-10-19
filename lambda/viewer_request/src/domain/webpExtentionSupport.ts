const WEBP_REQUEST_KEY = 'webp';

// eslint-disable-next-line import/prefer-default-export
export const isValidWebpRequest = (key: string): boolean =>
  WEBP_REQUEST_KEY === key;
