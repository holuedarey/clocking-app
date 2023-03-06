import express from 'express';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {setLocationRules} from '../middlewares/validationRules';
import LocationController from '../controllers/LocationController';


/**
 * Routes of '/auth'
 */
const  locationRouter = express.Router();

locationRouter.route('/').get(LocationController.allLocation);
locationRouter.route('/view/:_id').get(LocationController.viewOne);
locationRouter.route('/create').post(trimInputs, validateInputs(setLocationRules), LocationController.createLocation);
locationRouter.route('/my_Location/').get(LocationController.myLocation);
export default locationRouter;
