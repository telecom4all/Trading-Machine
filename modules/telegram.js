const path = require('path');
const fs = require('fs');
const logger = require('../modules/logger');
const { Telegraf } = require('telegraf')

const path_bot = path.resolve(__dirname, '..');

const configFile = path.join(path_bot, 'jsons/configs/config_secret.json');
const configSecret = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const botTelegram = new Telegraf(configSecret.telegram.token);



module.exports = function(message) {
    try {
               
        botTelegram.telegram.sendMessage(configSecret.telegram.id, message);
       
        return true;
    } catch (error) {
        logger.error('Erreur: ' + error);
        return false   
    }
    
};
