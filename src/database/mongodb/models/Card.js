/**
* Terminal Model
* Stores Terminal details
*/
import { ObjectID } from 'bson';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const schema = new Schema({
  card : String, 
  expirydate: String,
  CCV: String, 
  cardholdername:String,
  user_id: ObjectID
}, {
  timestamps: true,
  strict: false,
});

const Card = mongoose.model('Card', schema);

export default Card;
