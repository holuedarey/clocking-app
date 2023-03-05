/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { curDate, validateMongoID } from '../helpers/utils';
import ClockingServices from '../database/services/ClockingServices';
import Card from '../database/mongodb/models/Clocking';
import ClockingEvent from '../events/clocking';

class ClockingController {

  /**
* This handles getting transaction history.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
  async createClocking(req, res) {
    const { site_name, datclocking_date_time, clocking_purpose, } = req.body;
    const user_id = req.user._id;
    const data = {
      site_name, datclocking_date_time, clocking_purpose, user_id
    };

    const cardy = new ClockingServices();
    try {
      const createCard = await cardy.createClocking(data);
      const event = new ClockingEvent();
      const message = `
      <div><img style="height: 35px; display: block; margin: auto" src="${process.env.UI_URL}/assets/img/trackmoney.png"/></div>
      <p>Hello <b>${user.firstname},</b><p>
      <p style="margin-bottom: 0">Your account on ${process.env.APP_NAME} has been created. You can login using your email and password.</p>
      <p style="margin-bottom: 0">Email: <code>${user.email}</code></p>
      <p style="margin-top: 0">Password: <code>${pass}</code></p>
      <p><small>You can change your password when you login.</small></p>
      <a href="${process.env.UI_URL}/login">
      <button style="background-color:green; color:white; padding: 3px 8px; outline:0">Login Here</button></a>
      <p style="margin-bottom: 0">You can copy and paste to browser if above link is not clickable.</p>
      <code>${process.env.UI_URL}/login</code>
      <br>
      <p>${process.env.APP_NAME} &copy; ${new Date().getFullYear()}</p>`;
      event.emit('complete', { emailRecipients: [req.user.email], emailBody: message, emailSubject: 'New Clocking for ' })
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
  async allClocking(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const cards = new ClockingServices();
      const result = await cards.setID(req.user._id).allClockings(page, limit);

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
  async myClocking(req, res) {

    let {
      page, limit,
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const clockings = new ClockingServices();
      const result = await clockings.setUser(req.user._id).myClockings(page, limit);

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
      const clocking = new ClockingServices();
      const result = await clocking.setID(req.params._id).viewClocking(page, limit);

      Response.send(res, codes.success, {
        data: result,
      });
    } catch (error) { Response.handleError(res, error); }
  }
}

export default new ClockingController();