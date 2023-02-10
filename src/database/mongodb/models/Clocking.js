/**
* Clocking Model
* Stores Clocking details
*/
import { ObjectID } from 'bson';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  site_name : String, 
  clocking_date_time: {type : Date, default : Date.now() },
  clocking_purpose: String, 
  user_id: ObjectID
}, {
  timestamps: true,
  strict: false,
});

const Clocking = mongoose.model('Clocking', schema);

export default Clocking;
