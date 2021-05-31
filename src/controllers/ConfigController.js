/* eslint-disable no-use-before-define */
// eslint-disable-next-line no-unused-vars
import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import Switch from '../database/mongodb/models/Switch';
import ConfigService from '../database/services/ConfigService';
import { getRegExp, validateEmail } from '../helpers/utils';

/**
* Configuration Controller
*/
class ConfigController {
  /**
  * This handles setting Same-Day Settlement Configuration.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setSDSettlementConfig(req, res) {
    /**
    * Input can be single merchant_id and settlement_count, OR
    * Stringified array of merchant_d and settlement_count as data
    */
    const {
      merchant_id, settlement_count, account, data, added_msc = 0,
    } = req.body;
    const configData = [];
    const confData = Array.isArray(data) ? data : [];

    if (data && !Object.keys(confData[0] || {}).join(', ').includes('merchant_id, settlement_count')) {
      return Response.send(res, codes.badRequest, {
        error: 'data must contain settlement_count and merchant_id.',
      });
    }

    if (merchant_id && settlement_count) {
      confData.push({ merchant_id, settlement_count, account });
    } else if (!confData.length) {
      return Response.send(res, codes.badRequest, {
        error: 'data or settlement_count and merchant_id is required.',
      });
    }

    for (const item of confData) {
      const merIds = `${item.merchant_id || ''}`.split(' ').filter(id => id);
      for (const mId of merIds) {
        configData.push({
          merchant_id: mId,
          frequency: item.settlement_count,
          account_no: item.account,
        });
      }
    }

    // Settlement_count must be a factor of 24 to enable even daily settlement.
    if (!confData && (24 % settlement_count)) {
      return Response.validationError(res, { settlement_count: 'Settlement count must be a factor of 24.' });
    }

    const validData = configData.filter(item => item.frequency && !(24 % item.frequency));
    const invalidDataMids = configData.filter(item => !item.frequency || (24 % item.frequency)).map(item => item.merchant_id);
    const merchantIds = validData.map(item => item.merchant_id);

    try {
      // Get merchants to verify that they exists.
      const merchants = merchantIds.length ? await MerchantService.getMerchantsForIds(merchantIds) : [];

      const configs = [];
      for (const merchant of merchants) {
        const config = validData.find(item => item.merchant_id === merchant.merchant_id);
        if (!config) continue;
        let count = config.frequency;
        let hour = 0;
        const interval = Math.ceil(24 / config.frequency);

        const hours = [];
        while (count) {
          hours.push(hour);
          hour += interval;
          count--;
        }

        const merchDetails = {
          merchant_id: merchant.merchant_id,
          settlement_count: config.frequency,
          account_no: config.account_no,
          added_msc,
          settlement_hours: hours,
          interval,
          merchant_name: merchant.merchant_name,
        };

        await SettlementSDConfig.updateOne({ merchant_id: merchant.merchant_id }, {
          $set: merchDetails,
          $push: {
            changed_by: { user_id: req.user._id, date: new Date() },
          },
        }, { upsert: true });

        configs.push({
          merchant_id: merchant.merchant_id,
          merchant_name: merchant.merchant_name,
          account_no: merchDetails.account_no,
          interval,
          settlement_count,
        });
      }

      const notFoundMerchants = merchantIds.filter(id => !merchants.find(item => item.merchant_id === id));
      const notFoundMsg = notFoundMerchants.length ? `The merchant ID(s): ${notFoundMerchants.join(', ')}, could not be found.` : '';
      const invalidMsg = invalidDataMids.length ? `The frequencies for merchant ID(s): ${invalidDataMids.join(', ')}, must be a factor of 24.` : '';
      const message = `${configs.length} Merchant(s) successfully configured. ${notFoundMsg} ${invalidMsg}`;

      return Response.send(res, codes.success, {
        data: configs,
        message,
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  /**
  * This handles veiwing Same-Day Settlement Configurations.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async viewSDSettlementConfig(req, res) {
    let { page, limit } = req.query;
    const { merchant } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    const offset = limit * (page - 1);

    try {
      const filter = merchant ? { merchant_id: merchant } : {};
      const fields = 'interval merchant_id settlement_count account_no merchant_name -_id';
      const merchants = await SettlementSDConfig.find(filter).select(fields).skip(offset).limit(limit);

      Response.send(res, codes.success, {
        data: merchants,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles veiwing Settlement Switches.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async getSwitches(req, res) {
    let { type } = req.params;
    if (!['dispute', 'terminal','terminal-update', 'settlement'].includes(type)) type = 'settlement';

    try {
      let sSwitches = await Switch.find({ type }).select('name rawColumns columnCount headerRowNumber commonColumns');
      if (type === 'name') sSwitches = sSwitches.map(item => item.name);
      Response.send(res, codes.success, {
        data: sSwitches,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles deleting Settlement Switches.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async deleteSwitch(req, res) {
    try {
      const { name } = req.params;
      let { type } = req.params;
      if (!['dispute', 'terminal', 'settlement'].includes(type)) type = 'settlement';

      await Switch.deleteOne({ type, name: { $regex: getRegExp(name) } });
      Response.send(res, codes.success, {
        message: `${name} deleted successfully.`,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles getting Settlement Switch details.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async getSwitch(req, res) {
    try {
      const { name } = req.params;
      let { type } = req.params;
      if (!['dispute', 'terminal', 'terminal-update', 'settlement'].includes(type)) type = 'settlement';

      const data = await Switch.findOne({ type, name: { $regex: getRegExp(name) } }).select('name rawColumns columnCount headerRowNumber commonColumns');
      if (!data) {
        Response.send(res, codes.notFound, {
          error: 'Switch not found.',
        });
        return;
      }
      Response.send(res, codes.success, {
        data,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles setting Switches.
  * Could be PATCH or POST for Editing and Creating respectively.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setTransSwitch(req, res) {
    const {
      name, headers, merchantName, merchantAddress, merchantId, terminalId, STAN, transactionTime, amount, maskedPan, messageReason, responseCode, header_row_number,
    } = req.body;

    const type = 'transaction';

    if (req.method === 'POST') {
      const exists = await Switch.findOne({ type, name: { $regex: getRegExp(name) } });
      if (exists) return Response.validationError(res, { name: 'The name already exists.' }, true);
    }

    const renameColumns = {
      merchantName, merchantAddress, merchantId, terminalId, STAN, transactionTime, amount, maskedPan, messageReason, responseCode,
    };

    try {
      const sSwitch = await saveSwitch(type, headers, name, header_row_number, renameColumns);

      return Response.send(res, codes.success, {
        data: sSwitch,
        message: 'Switch configured successfully.',
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  /**
  * This handles setting Switches.
  * Could be PATCH or POST for Editing and Creating respectively.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setSwitch(req, res) {
    const {
      name, headers, transaction_date, rrn, merchant_id, merchant_name,
      terminal_id, merchant_account_nr, pan, transaction_amount,
      charge, settlement_amount, header_row_number, stan,
    } = req.body;

    const isDispute = req.params.type === 'dispute';
    const type = isDispute ? 'dispute' : 'settlement';

    if (req.method === 'POST') {
      const exists = await Switch.findOne({ type, name: { $regex: getRegExp(name) } });
      if (exists) return Response.validationError(res, { name: 'The name already exists.' }, true);
    }

    const rawColumns = headers.split(',').map(item => item.trim()).filter(item => item);
    const columns = rawColumns.map(item => item.toLowerCase().replace(/\s/g, '_'));

    const renameColumns = {
      transaction_date,
      rrn,
      stan,
      merchant_id,
      merchant_name,
      terminal_id,
      merchant_account_nr,
      pan,
      transaction_amount,
      charge,
      settlement_amount,
    };

    const renamedColumns = {};
    for (const key in renameColumns) {
      if (!renameColumns[key] || renameColumns[key] === key) {
        delete renameColumns[key];
        continue;
      }
      renamedColumns[key] = `${renameColumns[key]}`.trim().toLowerCase().replace(/\s/g, '_');
    }

    try {
      await Switch.updateOne({ type, name: { $regex: getRegExp(name) } }, {
        name,
        type,
        columns,
        rawColumns,
        columnCount: columns.length,
        headerRowNumber: header_row_number,
        renamedColumns,
        commonColumns: renameColumns,
      }, { upsert: true });
      const sSwitch = await Switch.findOne({ type, name }).select('name rawColumns columnCount headerRowNumber commonColumns');

      return Response.send(res, codes.success, {
        data: sSwitch,
        message: 'Switch configured successfully.',
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  /**
  * This handles setting account number to use and replace settled merchant's account number.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setAccountNo(req, res) {
    const { account_no } = req.body;

    try {
      const config = await ConfigService.setKeyValue('settlement_bank_account_no', account_no, req.user);

      Response.send(res, codes.success, {
        data: { settlement_bank_account_no: config.value },
        message: 'Account successfully set.',
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles setting time to range for online terminals.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setOnlineTermTime(req, res) {
    const { online_seconds } = req.body;

    try {
      const config = await ConfigService.setKeyValue('online_terminal_seconds', online_seconds, req.user);

      Response.send(res, codes.success, {
        data: { online_terminal_seconds: config.value },
        message: 'Terminal online time successfully set.',
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles setting time to range for active terminals.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setActiveTermTime(req, res) {
    const { active_seconds } = req.body;

    try {
      const config = await ConfigService.setKeyValue('active_terminal_seconds', active_seconds, req.user);

      Response.send(res, codes.success, {
        data: { active_terminal_seconds: config.value },
        message: 'Terminal active time successfully set.',
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles setting emails that will receive Same-Day settlement advice.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setEmail(req, res) {
    const isDelete = req.method === 'DELETE';
    const { type } = req.params;
    const { email } = isDelete ? req.params : req.body;
    const invalidEmails = [];

    try {
      const emails = email.split(',').map((item) => {
        item = item.trim().toLowerCase();
        if (validateEmail(item)) return item;
        invalidEmails.push(item);
        return null;
      }).filter(item => item);

      let emailData = await ConfigService.getKeyValue(type) || [];
      emailData = emailData.filter(item => item);

      if (isDelete) emailData = emailData.filter(item => !emails.find(rec => rec === item));
      else emailData = emailData.concat(emails);
      emailData = [...new Set(emailData)].join(',');

      const config = await ConfigService.setKeyValue(type, emailData, req.user, 'array');

      const error = invalidEmails.length ? `Emails: ${invalidEmails.join(', ')} are invalid.` : '';

      if (!emails.length) {
        return Response.send(res, codes.badRequest, {
          error,
        });
      }

      return Response.send(res, codes.success, {
        data: { sd_advice_emails: `${config.value || ''}`.split(',').filter(rec => rec) },
        message: `Email(s) ${isDelete ? 'removed' : 'added'} successfully.`,
        error,
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  /**
  * This handles setting emails that will receive Same-Day settlement advice.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setSDAdviceEmail(req, res) {
    const isDelete = req.method === 'DELETE';
    const { email } = isDelete ? req.params : req.body;
    const invalidEmails = [];

    try {
      const emails = email.split(',').map((item) => {
        item = item.trim().toLowerCase();
        if (validateEmail(item)) return item;
        invalidEmails.push(item);
        return null;
      }).filter(item => item);

      let emailData = await ConfigService.getKeyValue('sd_advice_emails') || [];
      emailData = emailData.filter(item => item);

      if (isDelete) emailData = emailData.filter(item => !emails.find(rec => rec === item));
      else emailData = emailData.concat(emails);
      emailData = [...new Set(emailData)].join(',');

      const config = await ConfigService.setKeyValue('sd_advice_emails', emailData, req.user, 'array');

      const error = invalidEmails.length ? `Emails: ${invalidEmails.join(', ')} are invalid.` : '';

      if (!emails.length) {
        return Response.send(res, codes.badRequest, {
          error,
        });
      }

      return Response.send(res, codes.success, {
        data: { sd_advice_emails: `${config.value || ''}`.split(',').filter(rec => rec) },
        message: `Email(s) ${isDelete ? 'removed' : 'added'} successfully.`,
        error,
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  /**
  * This handles getting all configs.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async getConfigs(req, res) {
    try {
      const configData = await ConfigService.getConfigs();

      Response.send(res, codes.success, {
        data: configData,
      });
    } catch (error) { Response.handleError(res, error); }
  }

  /**
  * This handles getting all configs.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setConfigItem(req, res) {
    const data = req.body;

    const configKeys = [
      'low_battery_level',
      'low_network_level',
      'notify_bad_printer',
      'notify_inactive_terminal',
      'notify_inactive_terminal_days',
    ];
    const unknownKeys = [];
    const knownKeys = [];
    let message;
    let error;

    try {
      for (const key in data) {
        if (configKeys.includes(key)) {
          await ConfigService.setKeyValue(key, data[key]);
          knownKeys.push(key);
        } else unknownKeys.push(key);
      }

      if (knownKeys.length) message = `${knownKeys.join(', ')} set successfully.`;
      if (unknownKeys.length) error = `Invalid keys: ${unknownKeys.join(', ')}.`;

      Response.send(res, message ? codes.success : codes.badRequest, {
        message, error,
      });
    } catch (err) { Response.handleError(res, err); }
  }

  /**
  * This handles setting Switches.
  * Could be PATCH or POST for Editing and Creating respectively.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async setTermSwitch(req, res) {
    const {
      name, headers, header_row_number, merchant_name, merchant_email, merchant_phone, merchant_id, terminal_id, merchant_account_nr, merchant_contact, merchant_address, mcc, state_code, lga, merchant_account_name, ptsp, serial, device_name, device_type, app_name, app_version, network_type, bank_code, bank_branch, category,
    } = req.body;

    const type = 'terminal';

    if (req.method === 'POST') {
      const exists = await Switch.findOne({ type, name: { $regex: getRegExp(name) } });
      if (exists) return Response.validationError(res, { name: 'The name already exists.' }, true);
    }

    const renameColumns = {
      merchant_name, merchant_email, merchant_phone, merchant_id, terminal_id, merchant_account_nr, merchant_contact, merchant_address, mcc, state_code, lga, merchant_account_name, ptsp, serial, device_name, device_type, app_name, app_version, network_type, bank_code, bank_branch, category,
    };

    try {
      const sSwitch = await saveSwitch(type, headers, name, header_row_number, renameColumns);

      return Response.send(res, codes.success, {
        data: sSwitch,
        message: 'Switch configured successfully.',
      });
    } catch (error) { return Response.handleError(res, error); }
  }

  
  /**
  * This handles setting Switches.
  * Could be PATCH or POST for Editing and Creating respectively.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
 async setTermUpdateSwitch(req, res) {
  const {
    name, headers, header_row_number, merchant_id, terminal_id, branch, region, zone
  } = req.body;

  console.log(req.body);
  // return;
  const type = 'terminal-update';

  if (req.method === 'POST') {
    const exists = await Switch.findOne({ type, name: { $regex: getRegExp(name) } });
    if (exists) return Response.validationError(res, { name: 'The name already exists.' }, true);
  }

  const renameColumns = {
   merchant_id, terminal_id, region, zone, branch
  };

  try {
    const sSwitch = await saveSwitch(type, headers, name, header_row_number, renameColumns);

    return Response.send(res, codes.success, {
      data: sSwitch,
      message: 'Switch configured successfully.',
    });
  } catch (error) { return Response.handleError(res, error); }
}

}

const saveSwitch = async (type, headers, name, header_row_number, renameColumns) => {
  const rawColumns = headers.split(',').map(item => item.trim()).filter(item => item);
  const columns = rawColumns.map(item => item.toLowerCase().replace(/\s/g, '_'));
  const renamedColumns = {};

  for (const key in renameColumns) {
    if (!renameColumns[key] || renameColumns[key] === key) {
      delete renameColumns[key];
      continue;
    }
    renamedColumns[key] = `${renameColumns[key]}`.trim().toLowerCase().replace(/\s/g, '_');
  }

  await Switch.updateOne({ type, name: { $regex: getRegExp(name) } }, {
    name,
    type,
    columns,
    rawColumns,
    columnCount: columns.length,
    headerRowNumber: header_row_number,
    renamedColumns,
    commonColumns: renameColumns,
  }, { upsert: true });
  const sSwitch = await Switch.findOne({ type, name }).select('name rawColumns columnCount headerRowNumber commonColumns');

  return sSwitch;
};

export default new ConfigController();
