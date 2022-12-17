/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { curDate, validateMongoID } from '../helpers/utils';
import CardServices from '../database/services/CardServices';
import Card from '../database/mongodb/models/Card';

class CardController {

  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async createCard(req, res) {
    const { card, expirydate, CCV, cardholdername } = req.body;
    const user_id = req.user._id;
    const data = {
      card, expirydate, CCV, cardholdername, user_id
    };

    const cardy = new CardServices();
    try {
      const createCard = await cardy.createCard(data);

      Response.send(res, codes.success, {
        data: createCard,
      });
    } catch (error) { Response.handleError(res, error); }
  }


  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async updateCard(req, res) {
    const { card, expirydate, CCV, cardholdername } = req.body;
    const data = {
      card, expirydate, CCV, cardholdername
    };

    if (!validateMongoID(req.params._id)) {
      return Response.send(res, codes.badRequest, {
        error: 'Record not found.',
      });
    }

    try {
      const cardy = await Card.findOne({ _id: req.params._id });
      if (!cardy) {
        return Response.send(res, codes.badRequest, {
          error: 'Record not found.',
        });
      }
      cardy.card = card || cardy.card;
      cardy.expirydate = expirydate || cardy.expirydate;
      cardy.CCV = CCV || cardy.CVV;
      cardy.cardholdername  = cardholdername || cardy.cardholdername;
      await cardy.save();
      Response.send(res, codes.success, {
        data: cardy,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async allCard(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const cards = new CardServices();
      const result = await cards.setID(req.user._id).allCards(page, limit);

      Response.send(res, codes.success, {
        data: result,
      });
    } catch (error) { Response.handleError(res, error); }
  }


  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async viewOne(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const cards = new CardServices();
      const result = await cards.setUser(req.user._id).setID(req.params._id).allCards(page, limit);

      Response.send(res, codes.success, {
        data: result,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
 * 
 * @param {*express.Request} req Express request param
 * @param {*express.Response} res Express response param
 * @returns 
 */
  async deleteCard(req, res) {
    console.log("id", req.params._id)
    if (!validateMongoID(req.params._id)) {
      return Response.send(res, codes.badRequest, {
        error: 'Record not found.',
      });
    }
    try {
      await Card.deleteOne({ _id: req.params._id });
      return Response.send(res, codes.success, {
        data: {
          message: 'Record deleted successfully.',
        },
      });
    } catch (error) { return Response.handleError(res, error); }
  }
}

export default new CardController();