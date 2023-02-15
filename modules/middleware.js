const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const MemoryStore = require('memorystore')(session);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//app.use(express.static(__dirname + '/public'));
const publicDirectory = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDirectory));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: false, sameSite: 'none' }  // si http seulement
  //  cookie: { secure: true, sameSite: 'lax' } // si on active le https 
  store: new MemoryStore({
    checkPeriod: 86400000 // purge expired entries every 24h
  })
}));

module.exports = app;
