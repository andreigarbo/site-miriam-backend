import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config/config.js';

async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, 10);
}

async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateJWT(payload: string): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

function generateTempJWT(payload: string): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '5m' });
}

function verifyToken(token: string): JwtPayload | string {
  return jwt.verify(token, config.jwtSecret);
}

export {
  hashPassword,
  comparePasswords,
  generateJWT,
  generateTempJWT,
  verifyToken,
};
