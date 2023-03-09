import axios from "axios";
const nodemailer = require('nodemailer');
/**
 * Sends email and SMS using Jamila's API
 * @param {Object} payload
 */
const sendEmailSms = (payload) => {
  const data = {};
  if (payload.emailRecipients) {
    data.email = [{
      sender: '',
      recipients: payload.emailRecipients,
      cc: [],
      bcc: [],
      body: payload.emailBody,
      html: payload.emailBody,
      subject: payload.emailSubject,
      details: {
        recipientsName: '',
        body: '',
      },
      attachments: payload.attachments || [],
    }];
  }
  if (!data.sms && !data.email) {
    // eslint-disable-next-line no-throw-literal
    throw { message: 'Data must contain emailRecipients or smsRecipients' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sngcheckin@gmail.com',
      pass: 'nzouayykfdjlirwe'
    }
  });
  
  const mailOptions = {
    from: 'hello@Southnorthgroup.com',
    to: payload.emailRecipients,
    subject: payload.emailSubject,
    text: payload.emailBody,
    html: payload.emailBody
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
   console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // do something useful
    }
  });
 

};

export default sendEmailSms;
