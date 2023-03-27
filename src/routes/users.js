import express from 'express';
import validateInputs2 from 'json-request-validator';
import UserController from '../controllers/UserController';
import { setProfileRules, setRoleRules } from '../middlewares/validationRules';

/**
 * Routes of '/users'
 */
const usersRouter = express.Router();

usersRouter.get('/', UserController.getUsers);
usersRouter.patch('/',  validateInputs2(setRoleRules), UserController.setUserRole);
usersRouter.patch('/profile',  validateInputs2(setProfileRules), UserController.setUserProfile);
usersRouter.delete('/:id',  UserController.deleteUser);

export default usersRouter;
