import Booking from "../mongodb/models/Service";


class BookingService {

  constructor() {
    this.configData = [
      {
        jumia: {
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
      {
        amazon: {
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

  async getResultFromDom(type) {
    const parseUrl = `${url}`
    await request(parseUrl, function (error, response, html) {
      // console.log(`error ${error} response ${response} Data ${html}`);

      if (response) {
        var $ = cheerio.load(html);

        var title, release, rating, url;
        var json = { title: "", release: "", rating: "" };

        $('.thumb').filter(function () {
          var data = $(this);
          title = data.children().children().first().attr('src');

          release = data.children().children().children().attr('href')

          json.title = title;
          json.release = release;
        })

        console.log('url', release);

        // Since the rating is in a different section of the DOM, we'll have to write a new jQuery filter to extract this information.

        $('.thumb-under ').filter(function () {
          var data = $(this);

          // The .star-box-giga-star class was exactly where we wanted it to be.
          // To get the rating, we can simply just get the .text(), no need to traverse the DOM any further

          rating = data.children().children().get('a');

          json.rating = rating;
        })

        console.log(json);
        return json;
      }
    })
  }


}

export default BookingService;
