/**
 * Switch Model
 * Store Swithes Configurations
 */
import { mongoose } from '../mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  name: String,
  type: String,
  columnCount: Number,
  headerRowNumber: Number,
  columns: [String],
  rawColumns: [String],
  commonColumns: Object,
  renamedColumns: Object,
}, {
  timestamps: true,
});
schema.index({ name: 1, type: 1 }, { unique: true });

const Switch = mongoose.model('Switch', schema);

export default Switch;
