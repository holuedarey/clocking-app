import moment from "moment-timezone";

import Location from "../mongodb/models/Location";
import { mongoose } from "../mongodb/mongoose";


class LocationService {
  constructor() {
    this.$match = {};
    this.$limit = 50;
    this.$skip = 0;
  }
  setUser(id) {
    if (id) {
      id = mongoose.Types.ObjectId(id);
      this.$match.user_id = id;
    }
    return this;
  }

  setID(id) {
    if (id) {
      id = mongoose.Types.ObjectId(id);
      this.$match._id = id;
    }
    return this;
  }

  setDate(start, end, range = "d") {
    if (start) {
      this.$match['createdAt'] = {
        $gte: moment(start, "YYYY-MM-DD")
          // .tz('Europe/London')
          .startOf("day")
          .toDate(),
        $lte: moment(end || start, "YYYY-MM-DD")
          // .tz('Europe/London')
          .endOf("day")
          .toDate(),
      };
    }
    return this;
  }

  async createLocation(data) {
    const location = new Location(data);
    await location.save();
    return location;
  }

  /**
   * This gets all terminals for given filter
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Array} terminals
   */
  async allLocations(page = 1, limit = 30) {
    const offset = (page - 1) * limit;

    let Locations = await Location.aggregate([
      { $match: this.$match },
      { $skip: offset },
      { $limit: limit },
    ]);

    return Locations;
  }



  /**
* This gets all terminals for given filter
* @param {Number} page
* @param {Number} limit
* @param {String} search
* @returns {Array} terminals
*/
  async viewLocation(page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    let locations = await Location.aggregate([
      { $match : this.$match},
      { $skip: offset },
      { $limit: limit },
    ]);

    return locations[0];
  }


}

export default LocationService;
