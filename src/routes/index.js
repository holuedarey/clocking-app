
import codes from '../helpers/statusCodes';
import Response from '../helpers/Response';
import authRouter from './auth';
import { authenticated } from '../middlewares/authentication';
import FileController from '../controllers/FileController';
import usersRouter from './users';
import cardRouter from './card';
import socialRouter from './social';

/**
 * Router
 */
const route = (app) => {
  app.use('/api/v1/users', authenticated, usersRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/card', authenticated, cardRouter);
  app.use('/api/v1/social', authenticated, socialRouter);


  
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

  
  app.get('/api/v1/response', (req, res) => Response.send(res, codes.success, {
    message: {data : req.body},
  }));

  app.get('/api/v1/recive', (req, res) => Response.send(res, codes.success, {
    message: {data : req.body},
  }));

  app.get('*', (req, res) => Response.send(res, codes.notFound, {
    error: 'Endpoint not found.',
  }));
};

export default route;
