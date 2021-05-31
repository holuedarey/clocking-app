import https from 'https';
import axios from 'axios';
import Logger from '../helpers/Logger';;

class HttpClient {
  static async send(resourceUrl, httpMethod, body, headers) {
    try {
      const axiosRequestConfig = {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        method: httpMethod,
        url: resourceUrl,
      };
      if(headers){
        axiosRequestConfig.header = headers;
      }
      if (
        httpMethod.toUpperCase() === 'POST' ||
        httpMethod.toUpperCase() === 'PUT' ||
        httpMethod.toUpperCase() === 'PATCH'
      ) {
        axiosRequestConfig.data = body;
      }
      // console.log('options :', axiosRequestConfig);
      const response = await axios(axiosRequestConfig);
      // Logger.log(
      //   `${response.statusText} ${response.status} Response from ${resourceUrl} : ${JSON.stringify(response.data)}`,
      // );

      return response.data;
    } catch (error) {
      // console.log('error response : ', error);
      HttpClient.logError(error, resourceUrl);
      throw error;
    }
  }

  static logError(error, resourceUrl) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      Logger.log(
        `Response Message 1 ${error.response.statusText} ${error.response.status} Error in response from ${resourceUrl} : ${JSON.stringify(error.response.data)}`
      );
      // Logger.log(error.message);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of http.ClientRequest in node.js
      Logger.log(`Response Message 2  Request Error ${resourceUrl.substring(0, 100)} : ${error}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      Logger.log(`Response Message 3 Axios Client Error ${resourceUrl.substring(0, 100)} :}`);
      Logger.log(error.message);
      Logger.log(error.config);
    }
  }
}

export default HttpClient;
