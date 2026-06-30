import { usersRepo } from '../repositories/users.js';
import type { User } from '../models/user.js';
import { generate2FASecret, hashPassword } from './crypto.js';

async function insertDefaultUser(username: string, password: string) {
  const passwordHash = await hashPassword(password);
  const userSecret = generate2FASecret({
    name: "Miriam's portfolio",
    account: username,
  });
  const usersRepoInstance = new usersRepo();

  const defaultUser = {
    username: 'miriam',
    password: passwordHash,
    role: 'admin',
    secret: userSecret,
  } as User;

  usersRepoInstance.insert(defaultUser);

  console.log(
    'Inserted default user ' +
      username +
      ':' +
      password +
      'with role admin and with 2FA secret ' +
      userSecret,
  );
}
