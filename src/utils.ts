import { selectorsConfig } from './config';

export const getConfig = (url: string) => {
  const [siteName] = url.match(/[^https://](\w+)/) || [''];

  return selectorsConfig[siteName];
};
