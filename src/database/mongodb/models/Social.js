/**
* Terminal Model
* Stores Terminal details
*/
import { ObjectID } from 'bson';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  email : String, 
  title : String, 
  password: String,
  user_id: ObjectID
}, {
  timestamps: true,
  strict: false,
});

const Social = mongoose.model('Social', schema);

export default Social;
