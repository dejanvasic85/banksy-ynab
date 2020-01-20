import { Config } from './types';

const config: Config = {
  sendgridKey: process.env.SENDGRID_API_KEY,
};

export { config };
