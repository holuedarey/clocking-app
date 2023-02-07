import express from 'express';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {clockingRules} from '../middlewares/validationRules';
import ClockingController from '../controllers/ClockingController';


/**
 * Routes of '/auth'
 */
const clockingRouter = express.Router();

clockingRouter.route('/').get(ClockingController.allClocking);
clockingRouter.route('/view/:_id').get(ClockingController.viewOne);
clockingRouter.route('/create').post(trimInputs, validateInputs(clockingRules), ClockingController.createClocking);
clockingRouter.route('/my_clocking/').get(ClockingController.myClocking);
export default clockingRouter;
