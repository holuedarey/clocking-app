import express from 'express';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {cardRules} from '../middlewares/validationRules';
import ClockingController from '../controllers/ClockingController';


/**
 * Routes of '/auth'
 */
const clockingRouter = express.Router();

clockingRouter.route('/').get(ClockingController.allClocking);
clockingRouter.route('/view/:_id').get(ClockingController.viewOne);
clockingRouter.route('/create').post(trimInputs, validateInputs(cardRules), ClockingController.createClocking);
clockingRouter.route('/my_clocking/').patch(trimInputs, validateInputs(cardRules), ClockingController.myClocking);
export default clockingRouter;
