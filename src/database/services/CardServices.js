import Category from "../mongodb/models/Card";
import { mongoose } from "../mongodb/mongoose";


class CardService {
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

  async createCard(data){
    const card = new Category(data);
    await card.save();
    return card;
  }

  /**
   * This gets all terminals for given filter
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Array} terminals
   */
  async allCards(page = 1, limit = 30) {
    const offset = (page - 1) * limit;

    const filter = { ...this.match };
    let cards = await Category.aggregate([
      { $match: filter },
      { $skip: offset },
      { $limit: limit },
    ]);
    
    return cards;
  }


}

export default CardService;
