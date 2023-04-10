/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import LocationServices from '../database/services/LocationServices'

class LocationController {

  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async createLocation(req, res) {
    const { name, datLocation_date_time, Location_purpose, } = req.body;
    const user = req.user;
    const data = {
      name,
    };

    const cardy = new LocationServices();
    try {
      const createCard = await cardy.createLocation(data);
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
  async allLocation(req, res) {

    let {
      page, limit, startdate, enddate
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 60 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const cards = new LocationServices();
      const result = await cards.setDate(startdate, enddate).allLocations(page, limit);

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
  async myLocation(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const Locations = new LocationServices();
      const result = await Locations.setUser(req.user._id).myLocations(page, limit);

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
      const Location = new LocationServices();
      const result = await Location.setID(req.params._id).viewLocation(page, limit);

      Response.send(res, codes.success, {
        data: result,
      });
    } catch (error) { Response.handleError(res, error); }
  }
}

export default new LocationController();