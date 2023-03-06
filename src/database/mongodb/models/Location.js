/**
* Terminal Model
* Stores Terminal details
*/
import { ObjectID } from 'bson';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  name : String, 
  description : {default : "", type: String},
  user_id: ObjectID
}, {
  timestamps: true,
  strict: false,
});

const Location = mongoose.model('Location', schema);

export default Location;
