import express from 'express';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {socialRules} from '../middlewares/validationRules';
import SocialController from '../controllers/SocialController';


/**
 * Routes of '/auth'
 */
const socialRouter = express.Router();

socialRouter.route('/').get(SocialController.allSocials);
socialRouter.route('/view/:_id').get(SocialController.viewOne);
socialRouter.route('/create').post(trimInputs, validateInputs(socialRules), SocialController.createSocial);
socialRouter.route('/update/:_id').patch(trimInputs, validateInputs(socialRules), SocialController.updateSocial);
socialRouter.route('/delete/:_id').delete(SocialController.deleteSocial);

export default socialRouter;
