
import codes from '../helpers/statusCodes';
import Response from '../helpers/Response';
import authRouter from './auth';
import { authenticated } from '../middlewares/authentication';
import FileController from '../controllers/FileController';
import usersRouter from './users';
import clockingRouter from './clocking';
import locationRouter from './location';

/**
 * Router
 */
const route = (app) => {
  app.use('/api/v1/users', authenticated, usersRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/clocking', authenticated, clockingRouter);
  app.use('/api/v1/location', locationRouter);

  app.get('/api/v1/send-email', (req, res) => {
    
    // sendEmailSms({ emailRecipients: ["holudare1976@gmail.com"], emailBody: "First Introduction mesage", emailSubject: 'Reset Password Confirmation' })
    const event = new ClockingEvent();
    event.emit('complete', { emailRecipients: ["holudare1976@gmail.com"], emailBody: "First Introduction mesage", emailSubject: 'Reset Password Confirmation' })
    Response.send(res, codes.success, {
      message: 'This is version 1.0.1!',
    })
  });



  //endpoint to get data from vas transaction

  app.get('/api/v1/files/*', FileController.download);
  app.get('/', (req, res) => Response.send(res, codes.success, {
    message: 'This app is running!!!',
  }));
  app.get('/api', (req, res) => Response.send(res, codes.success, {
    message: 'This app is running!!!',
  }));
  app.get('/api/v1', (req, res) => Response.send(res, codes.success, {
    message: 'This is version 1.0.1!',
  }));

  app.get('*', (req, res) => Response.send(res, codes.notFound, {
    error: 'Endpoint not found.',
  }));
};

export default route;
