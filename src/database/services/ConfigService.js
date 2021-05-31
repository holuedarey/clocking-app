import Config from '../mongodb/models/Config';

/**
 * @class Configuration Service
 * Handle queries and processes data related to Config Model
 */
class ConfigService {
  /**
   * Create or Updates a set of key value
   * @param {String} key
   * @param {String} value
   * @param {Object} user
   * @param {String} type
   * @returns {Object}
   */
  async setKeyValue(key, value, user, type = 'string') {
    if (typeof value === 'boolean') {
      value = (value === 'false' || !value) ? 0 : 1;
      type = 'boolean';
    }
    const doc = { $set: { key, value, type } };
    if (user) doc.$push = { changed_by: { user_id: user._id, date: new Date() } };
    await Config.updateOne({ key }, doc, { upsert: true });

    const data = await Config.findOne({ key });
    return data;
  }

  /**
   * Get the value for a given key
   * @param {String} key
   * @returns {String}
   */
  async getKeyValue(key) {
    let config = await Config.findOne({ key });
    if (!config) return null;

    config = config.toObject();
    let value = Number.isNaN(Number(config.value)) ? config.value : Number(config.value);
    if (config.type === 'array') value = `${value || ''}`.split(',').filter(rec => rec);
    else if (config.type === 'boolean') value = !!value;

    return value;
  }

  /**
   * Gets all key value configs
   * @returns {Object}
   */
  async getConfigs() {
    const configs = await Config.find({});
    const configData = {};
    for (const item of configs) {
      let value = Number.isNaN(Number(item.value)) ? item.value : Number(item.value);
      if (item.type === 'array') {
        value = `${value || ''}`.split(',').filter(rec => rec);
      } else if (item.type === 'boolean') {
        value = !!value;
      }
      configData[item.key] = value;
    }

    return configData;
  }
}

export default new ConfigService();
