import { Router } from 'express';
import { authController } from '../controllers/auth.js';

const router = Router();
const authControllerInstance = new authController();

router.post('/login', authControllerInstance.login);

router.post('/2fa', authControllerInstance.validate2FA);

router.post('/refresh-token', authControllerInstance.refreshToken);

export default router;
