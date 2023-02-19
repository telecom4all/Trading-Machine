const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const configSecret = require('./config_secret');

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

if (configSecret.node.isSSL) {
  const options = {
    key: fs.readFileSync(configSecret.node.sslKeyPath),
    cert: fs.readFileSync(configSecret.node.sslCertPath)
  };
  const server = https.createServer(options, app);
  server.listen(configSecret.node.port_web_ssl, function() {
    console.log(`Server listening on port ${configSecret.node.port_web_ssl} with HTTPS`);
  });
} else {
  const server = http.createServer(app);
  server.listen(configSecret.node.port_web, function() {
    console.log(`Server listening on port ${configSecret.node.port_web} with HTTP`);
  });
}


module.exports = app;
