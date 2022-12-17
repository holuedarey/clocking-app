import express from 'express';
import AuthController from '../controllers/AuthController';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {
  registerRules, loginRules, changePasswordRules, resetPasswordRules, questionRules,
} from '../middlewares/validationRules';

/**
 * Routes of '/auth'
 */
const authRouter = express.Router();

authRouter.route('/signup').post(trimInputs, validateInputs(registerRules), AuthController.signup);
authRouter.route('/login').post(trimInputs, validateInputs(loginRules), AuthController.login);
authRouter.route('/authorze').post(trimInputs, validateInputs(questionRules), AuthController.securityQuestion);
authRouter.route('/reset').post(trimInputs, validateInputs(resetPasswordRules), AuthController.requestResetPassword);
authRouter.route('/reset').patch(trimInputs, validateInputs(changePasswordRules), AuthController.resetPassword);

export default authRouter;
