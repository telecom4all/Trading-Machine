const fs = require('fs');
const path = require('path');


const configFile = path.join(__dirname, '../jsons/configs/config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

module.exports = config;