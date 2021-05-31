/**
 * Configuarion Model
 * Stores 'key value' configurations
 */
import { mongoose } from '../mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  key: {
    type: String,
    unique: true,
  },
  value: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    default: 'string',
  },
  changed_by: [Object],
}, {
  timestamps: true,
});

const Config = mongoose.model('Config', schema);

export default Config;
