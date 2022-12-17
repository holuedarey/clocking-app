import Social from "../mongodb/models/Social";
import { mongoose } from "../mongodb/mongoose";


class SocialService {
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

  async createSocial(data){
    const cat = new Social(data);
    await cat.save();
    return cat;
  }

  /**
   * This gets all terminals for given filter
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Array} terminals
   */
  async allSocial(page = 1, limit = 30) {
    const offset = (page - 1) * limit;

    const filter = { ...this.match };
    let categories = await Social.aggregate([
      { $match: filter },
      { $skip: offset },
      { $limit: limit },
    ]);
    
    return categories;
  }


}

export default SocialService;
