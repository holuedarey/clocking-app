/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { curDate, curDateTimeFormat, validateMongoID } from '../helpers/utils';
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
    const { site_name, clocking_date_time, clocking_purpose, } = req.body;
    const user = req.user;
    const user_id = req.user._id;
    const data = {
      site_name, clocking_date_time, clocking_purpose, user_id
    };

    const cardy = new ClockingServices();
    try {
      const createCard = await cardy.createClocking(data);
      const event = new ClockingEvent();
      const message = `
      <div><img style="height: 35px; display: block; margin: auto" src="https://southnorthgroup.com/wp-content/uploads/2022/12/ico.png"/></div>
      <p>Hello <b>${user.firstname},</b><p>
      <p style="margin-bottom: 0">New Clocking on South north Group.</p>
      <p style="margin-bottom: 0">Location: <code>${site_name}</code></p>
      <p style="margin-top: 0">Purppose: <code>${clocking_purpose}</code></p>
      <p style="margin-top: 0">Date and Time: <code>${new Date().toDateString()}</code></p>

      <p>South North group &copy; ${new Date().getFullYear()}</p>`;
      event.emit('complete', { emailRecipients: [req.user.email], emailBody: message, emailSubject: `New Clocking for ${req.user.email} ` });
      event.emit('complete', { emailRecipients: ['sngcheckin@gmail.com'], emailBody: message, emailSubject: `New Clocking for ${req.user.email} ` })

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
      page, limit, startdate, enddate
    } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 50 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    try {
      const cards = new ClockingServices();
      let result = await cards.setDate(startdate, enddate).allClockings(page, limit);
      console.log("result", result['row']);
      result['row'].map(el => {
        el['clocking_date_time'] = curDateTimeFormat(el.clocking_date_time);
        return el;
      })
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
      let result = await clockings.setUser(req.user._id).myClockings(page, limit);
      result.map(el => {
        el['clocking_date_time'] = curDateTimeFormat(el.clocking_date_time);
        return el;
      })


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