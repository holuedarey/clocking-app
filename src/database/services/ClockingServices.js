import moment from "moment-timezone";

import Clocking from "../mongodb/models/Clocking";
import { mongoose } from "../mongodb/mongoose";


class ClockingService {
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

  setSearch(search) {
    const getSObj = (key) => {
      const obj = {};
      if (checkNumber(search)) obj[key] = { $eq: parseInt(search, 10) };
      else obj[key] = { $regex: getRegExp(search.toString()) };
      return obj;
    };

    if (search) {
      const $or = [];
      $or.push(getSObj("firstname"));
      $or.push(getSObj("lastname"));

      this.$match.$or = $or;
    }
    return this;
  }
  async createClocking(data) {
    const clocking = new Clocking(data);
    await clocking.save();
    return clocking;
  }

  /**
   * This gets all terminals for given filter
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Array} terminals
   */
  async allClockings(page = 1, limit = 30) {
    const offset = (page - 1) * limit;

    let clockings = await Clocking.aggregate([
      { $match: this.$match },
      { $sort: { _id: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup:
        {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind :{
          'path': '$user'
        }
      }
    ]);
    const count = await await Clocking.aggregate([
      { $match: this.$match },
      {$group: {'_id': 0, 'count': { '$sum': 1  } } }
    ]);
    return {
      "row" : clockings,
      "total" : count[0].count || 0
    };
  }

  /**
  * This gets all terminals for given filter
  * @param {Number} page
  * @param {Number} limit
  * @param {String} search
  * @returns {Array} terminals
  */
  async myClockings(page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    let clockings = await Clocking.aggregate([
      { $match  : this.$match},
      { $sort: { _id: -1 } },
      { $skip: offset },
      { $limit: limit },
    ]);

    return clockings;
  }


  /**
* This gets all terminals for given filter
* @param {Number} page
* @param {Number} limit
* @param {String} search
* @returns {Array} terminals
*/
  async viewClocking(page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    let clockings = await Clocking.aggregate([
      { $match : this.$match},
      { $skip: offset },
      { $limit: limit },
    ]);

    return clockings[0];
  }


}

export default ClockingService;
