/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { curDate, validateMongoID } from '../helpers/utils';
import SocialService from '../database/services/SocialService';
import Social from '../database/mongodb/models/Social';

class SocialController {

  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async createSocial(req, res) {
    const { email, password, title } = req.body;
    const user_id = req.user._id;
    const data = {
      email, password, user_id, title

    };

    const social = new SocialService();
    try {
      const createsocial = await social.createSocial(data);

      Response.send(res, codes.success, {
        data: createsocial,
      });
    } catch (error) { Response.handleError(res, error); }
  }


  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async updateSocial(req, res) {
    const { email, password, title } = req.body;
    const data = {
      email,
      password,

    };

    if (!validateMongoID(req.params._id)) {
      return Response.send(res, codes.badRequest, {
        error: 'Record not found.',
      });
    }

    try {
      const card = await Social.findOne({ _id: req.params._id });
      if (!card) {
        return Response.send(res, codes.badRequest, {
          error: 'Record not found.',
        });
      }
      card.title = title || card.title;
      card.email = email || card.email;
      card.password = password || card.password;

      await card.save();
      Response.send(res, codes.success, {
        data: card,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async allSocials(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const social = new SocialService();
      const result = await social.setID(req.user._id).allSocial(page, limit);

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
      const social = new SocialService();
      const result = await social.setID(req.params._id).setUser(req.user._id).allSocial(page, limit);

      Response.send(res, codes.success, {
        data: result[0],
      });
    } catch (error) { Response.handleError(res, error); }
  }
  /**
   * 
   * @param {*express.Request} req Express request param
   * @param {*express.Response} res Express response param
   * @returns 
   */
  async deleteSocial(req, res) {
    console.log("id", req.params._id)
    if (!validateMongoID(req.params._id)) {
      return Response.send(res, codes.badRequest, {
        error: 'Record not found.',
      });
    }
    try {
      await Social.deleteOne({ _id: req.params._id });
      return Response.send(res, codes.success, {
        data: {
          message: 'Record deleted successfully.',
        },
      });
    } catch (error) { return Response.handleError(res, error); }
  }


}

export default new SocialController();