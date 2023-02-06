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
      id =  mongoose.Types.ObjectId(id);
      this.$match.user_id = id;
    }
    return this;
  }

  setID(id) {
    if (id) {
      id =  mongoose.Types.ObjectId(id);
      this.$match._id = id;
    }
    return this;
  }

  async createClocking(data){
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

    const filter = { ...this.match };
    let clockings = await Clocking.aggregate([
      { $match: filter },
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
    async myClockings(page = 1, limit = 30) {
      const offset = (page - 1) * limit;
      let clockings = await Clocking.aggregate([
        { $match},
        { $skip: offset },
        { $limit: limit },
      ]);
      
      return clockings;
    }


}

export default ClockingService;
