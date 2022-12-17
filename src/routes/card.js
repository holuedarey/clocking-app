import express from 'express';
import trimInputs from '../middlewares/trimInputs';
import validateInputs from '../middlewares/validateInputs';
import {cardRules} from '../middlewares/validationRules';
import CardController from '../controllers/CardController';


/**
 * Routes of '/auth'
 */
const cardRouter = express.Router();

cardRouter.route('/').get(CardController.allCard);
cardRouter.route('/view/:_id').get(CardController.viewOne);
cardRouter.route('/create').post(trimInputs, validateInputs(cardRules), CardController.createCard);
cardRouter.route('/update/:_id').patch(trimInputs, validateInputs(cardRules), CardController.updateCard);
cardRouter.route('/delete/:_id').delete(CardController.deleteCard);

export default cardRouter;
