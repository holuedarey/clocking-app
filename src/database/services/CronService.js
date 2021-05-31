/* eslint-disable no-restricted-globals */
/* eslint-disable func-names */
import { Worker } from 'webworker-threads';
import cron from 'node-cron';
import moment from 'moment';
import sendEmailSms from '../../helpers/emailSender';
import Logger from '../../helpers/Logger';;
import { curDate, validateEmail, getRegExp } from '../../helpers/utils';
import ConfigService from './ConfigService';
import HttpClient from '../../network/HttpClient';
import cheerio from 'cheerio';
import fs from 'fs';
import { data } from 'cheerio/lib/api/attributes';
/**
* @class Cron Service
* Handle scheduled jobs and all cron related processes
*/
class CronService {

  constructor() {
    this.configData = [
      {
        jumia: {
          url: "https://www.jumia.com.ng/catalog/?q=",
          config: {
            name: '.info > .name',
            price: '.heading',
            image_url: '.title',
            rating: '.heading',
            product_url: '.action'
          },
          searchTerms: {
            0: 'Men T-shirt',
            1: 'Trousers',
            2: 'Jacket',
            3: 'Sunglasses',
            4: 'Watches',
            5: 'Women Dress',
            6: 'Handbags',
            7: 'Men Footwear',
            8: 'Women Footwear'
          }
        }
      },
      {
        amazon: {
          url: "https://www.amazon.com/s?k=",
          config: {
            name: '.title',
            price: '.heading',
            image_url: '.title',
            rating: '.heading',
            product_url: '.action'
          }
        }
      },
      {
        aliexpress: {
          url: "",
          config: {
            name: '.title',
            price: '.heading',
            image_url: '.title',
            rating: '.heading',
            product_url: '.action'
          }
        }
      },
    ];
    // this.$limit = 50;
    // this.$skip = 0;
  }

  async getResultFromDomJumia(type, searchTerms) {
    // console.log('----starting cron---')
    const theConfig = this.configData.filter(item => Object.keys(item) == type)[0];
    const credential = theConfig[type];
    const parseUrl = credential['url'];

    const runLoop = Object.values(credential['searchTerms']);
    const configCssClass = credential['config'];

    const html = await HttpClient.send(`${parseUrl}/${searchTerms}`, 'GET');
    // console.log('response from web ::', JSON.stringify(html));
    if (html) {
      const $ = cheerio.load(html);

      const totalItem = $('.-gy5.-phs').text();

      console.log('totalItem', totalItem.split(" ")[0]);

      const iterationLength = Math.ceil(parseInt(totalItem) / parseInt(48));
      for (let a = 0; a < iterationLength; a++) {
        let record = [];
        console.log('request Url :: ', `${parseUrl}${searchTerms}&page=${a + 1}`);
        const html = await HttpClient.send(`${parseUrl}/${searchTerms}&page=${a + 1}`, 'GET');
        // console.log('response from web ::', JSON.stringify(html));
        if (html) {
          const $ = cheerio.load(html);
          const products = $('article.prd._fb.col.c-prd > a');
          for (let i = 0; i < products.length; i++) {

            const json = { productId: "", productName: '', productPrice: '', productImage: '', productRating: '', productUrl: '' }

            const productUrl = $(products[i]).attr('href');
            const productId = $(products[i]).attr('data-id');
            const productName = $(products[i]).find('.info > .name').first().text();
            const productPrice = $(products[i]).children('.info').children('.prc').first().text();
            const productImage = $(products[i]).children('.img-c').children().first().attr('data-src');
            const productRating = $(products[i]).find('.stars._s').first().text();

            // We proceed, only if the element exists
            if (productId) {

              console.log('productId :: ', productId)

              json.productName = productName;
              json.productPrice = productPrice;
              json.productImage = productImage;
              json.productRating = productRating;
              json.productUrl = `https://www.jumia.com.ng${productUrl}`;
              json.productId = productId;
              record.push(json);


              let fileContent;
              fs.readFile(`${type}-${searchTerms}.json`, "utf8", function (err, data) {
                if (err) {
                  console.log('Error reading File', 'err');
                  fs.writeFile(`${type}-${searchTerms}.json`, JSON.stringify(record, null, 4), function (err) {
                    // console.log('File successfully written! - Check your project directory for the output.json file');
                  })
                } else {
                  // console.log('File', JSON.parse(data));
                  fileContent = JSON.parse(data);
                  if (fileContent.some(el => el.productId === productId)) {
                    console.log("Object found inside the array.");
                  } else {
                    fs.writeFile(`${type}-${searchTerms}.json`, JSON.stringify(fileContent.concat(record), null, 4), function (err) {
                      // console.log('File successfully written! - Check your project directory for the output.json file');
                    })
                  }

                }
              });
            }
          }
        }
      }
    }
  }


  /**
  * Starts the cron jobs in a worker thread
  */
  startCron() {

    const worker = new Worker(function () {
      this.onmessage = function (event) {
        this.postMessage(event);
        // eslint-disable-next-line no-undef
        self.close();
      };
    });
    worker.onmessage = () => {
      // Run cron for jumia Crawler

      cron.schedule('*/45  *  * * * *', async () => {
        // try { await this.getResultFromDomJumia('jumia', 'Men T-shirt'); } catch (error) { Logger.log(error.message); }
      });

      cron.schedule('*/45  * * * * *', async () => {
        // try { await this.getResultFromDomJumia('jumia', 'Trousers') } catch (error) { Logger.log(error.message); }
      });

      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Jacket') } catch (error) { Logger.log(error.message); }
      // });

      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Sunglasses') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Watches') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Women Dress') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 * * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Handbags') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Men Footwear') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomJumia('jumia', 'Women Footwear') } catch (error) { Logger.log(error.message); }
      // });


      // Run cron for Amazon Crawler
      
      // cron.schedule('*/45  * * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Men T-shirt'); } catch (error) { Logger.log(error.message); }
      // });

      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Trousers') } catch (error) { Logger.log(error.message); }
      // });

      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Jacket') } catch (error) { Logger.log(error.message); }
      // });

      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Sunglasses') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Watches') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 *  * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Women Dress') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5 * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Handbags') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Men Footwear') } catch (error) { Logger.log(error.message); }
      // });
      // cron.schedule('*/5  * * * *', async () => {
      //   try { await this.getResultFromDomAmazon('amazon', 'Women Footwear') } catch (error) { Logger.log(error.message); }
      // });

    };
    worker.postMessage({});
  }
}

/**
* Send Same Day Settlement advice email
* @param {Number} hour - Settlement hour
* @param {Array} settlements - Settlements
*/
const sendSDSAdviceEmail = async (hour, settlements) => {
  const emails = await ConfigService.getKeyValue('sd_advice_emails');
  if (!emails || !emails.length) return;

  const link = `${process.env.UI_URL}/settlements/same-day`;
  let settlementDetails = '';

  for (const settlement of settlements) {
    if (!settlement.total_value) continue;
    settlementDetails += `   <br> 
    <strong>Merchant ID:</strong> ${settlement.merchant_id}<br>
    <strong>Merchant Name:</strong> ${settlement.merchant_name}<br>
    <strong>Successful Transaction Amount:</strong> ${(settlement.successful_value || 0).toLocaleString('en-US', { style: 'currency', currency: 'NGN' })}
    <br>
    <strong>Successful Transaction Volume:</strong> ${(settlement.successful_volume || 0).toLocaleString()}<br>
    <strong>Failed Transaction Amount:</strong> ${(settlement.failed_value || 0).toLocaleString()}<br>
    <strong>Failed Transaction Volume:</strong> ${(settlement.failed_volume || 0).toLocaleString()}<br><br>
    <strong>Total Transaction Amount:</strong> ${(settlement.total_value || 0).toLocaleString()}<br>
    <strong>Total Transaction Volume:</strong> ${(settlement.total_volume || 0).toLocaleString()}<br>
    <strong>Interval:</strong> ${settlement.interval} hours<br>
    <strong>Date:</strong> ${settlement.transaction_date} hours<br>
    <br>`;
  }
  if (!settlementDetails) return;

  hour = `${hour}`.padStart(2, 0);
  const body = `
  <div style="font-size: 16px">
  <strong>Good Day,</strong><br>
  <br>
  Find below the details of the merchants to be settled.<br>
  <strong>Hour of the Day: ${hour}:00</strong><br>
  <br>
  <strong>Settlement Details:</strong><br>
  <br>
  
  ${settlementDetails}
  
  <br>
  Kindly confirm on the platform when you settle these merchants.<br>
  <a href="${link}">${link}</a><br>
  Thanks.<br>
  
  <br>
  © ${process.env.APP_NAME}<br>
  Powered by ITEX<br>
  </div>
  `;

  sendEmailSms({ emailRecipients: emails, emailBody: body, emailSubject: `Settlement Advice for the Hour: ${hour}:00.` });
};

export default new CronService();
