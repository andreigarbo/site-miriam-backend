import { Router } from 'express';
import { userController } from '../controllers/users.js';

const router = Router();
const userControllerInstance = new userController();

router.post('/create', userControllerInstance.create);

router.get('/get', userControllerInstance.get);

router.delete('/remove', userControllerInstance.remove);

router.patch('/update', userControllerInstance.update);

export default router;
