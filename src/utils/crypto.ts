import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config/config.js';
import twofactor from 'node-2fa';

async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, 10);
}

async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateJWT(payload: Object): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

function generateTempJWT(payload: Object): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '5m' });
}

function verifyToken(token: string): [boolean, JwtPayload | null] {
  try {
    const tokenData = jwt.verify(token, config.jwtSecret);
    if (typeof tokenData === 'object') {
      return [true, tokenData];
    }
  } catch (Error) {
    return [false, null];
  }
  return [false, null];
}

function generate2FASecret(payload: { name: string; account: string }): string {
  const secretObj = twofactor.generateSecret(payload);
  return secretObj.secret;
}

function verify2FACode(secret: string, code: string) {
  const status = twofactor.verifyToken(
    secret,
    code,
    config.twoFactorAuthValidityMinutes,
  );

  if (status == null) {
    return false;
  }

  const { delta } = status;

  if (!delta || (delta && delta != 0)) {
    return false;
  }

  return true;
}

export {
  hashPassword,
  comparePasswords,
  generateJWT,
  generateTempJWT,
  verifyToken,
  generate2FASecret,
  verify2FACode,
};
