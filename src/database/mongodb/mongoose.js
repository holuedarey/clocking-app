/**
 * Creates connection with the local mongodb
 * on "monitor" database
 */
 import mongoose from 'mongoose';

 // const mongoConnectionUrl = `mongodb://${process.env.MDB_HOST}:${process.env.MDB_PORT}/${process.env.MDB_DB}`;
 const mongoConnectionUrl = `mongodb://cluster0-i3it2.mongodb.net:27017/rolphta`;
 
 mongoose.set('useCreateIndex', true);
 mongoose.connect('mongodb+srv://jummie:crNCNKttQkUdyqn9@cluster0.wmexc.mongodb.net/judy?retryWrites=true&w=majority');
 

 const db = mongoose.connection;
 mongoose.set('debug', true);
 // eslint-disable-next-line no-console
 db.on('error', console.error.bind(console, 'connection error:'));
 // db.once('connected successfully')
 // eslint-disable-next-line import/prefer-default-export
 export { mongoose };