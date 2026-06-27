import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  twoFactorAuthValidityMinutes: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
  twoFactorAuthValidityMinutes: Number(process.env.TWOFA_VALIDITY_MINUTES) || 1,
};

export default config;
