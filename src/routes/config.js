import express from 'express';
import validateInputs2 from 'json-request-validator';
import ConfigController from '../controllers/ConfigController';
import validateInputs from '../middlewares/validateInputs';
import { isAdmin } from '../middlewares/authentication';
import {
  configItemRules, 
} from '../middlewares/validationRules';

/**
 * Routes of '/config'
 */
const configRouter = express.Router();

configRouter.get('/', ConfigController.getConfigs);
configRouter.post('/', isAdmin(), validateInputs2(configItemRules), ConfigController.setConfigItem);

export default configRouter;
