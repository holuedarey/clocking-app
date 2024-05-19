//app.js

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors =  require('cors');
const express = require("express");
const morgan = require("morgan");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const routes = require('../src/routes');

app.use(cors());
app.use(cookieParser());
app.use(morgann(':date *** :method :: :url ** :response-time'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));
app.use(express.static('files'))
routes(app);
router.get("/", (req, res) => {
    res.send("App is running..");
});

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);