
const fs = require('fs');
const path = require('path');

async function update_config_bot_json_file(newData) {
    try {
        const configFile = path.join(__dirname, '../jsons/configs/config.json');
        const data = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

        data.strategies = newData.strategies;
        data.parametres_generaux = newData.parametres_generaux;
        data.retour_telegram = newData.retour_telegram;
        data.parametre_strategie_generaux = newData.parametre_strategie_generaux;
        data.historique = newData.historique;
        
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
        return data;
    } catch (err) {
        return err.message
    }
  }

async function readFile(file) {
    try {
        await fs.promises.access(file, fs.constants.F_OK);
        const data = await fs.promises.readFile(file);
        return data;
    } catch (err) {
        //console.error(`Le fichier ${file} n'existe pas`);
        return false;
    }
}

async function writeFile(file, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, JSON.stringify(data, null, 4), (err) => {
        if (err) {
          reject(`Erreur lors de la mise à jour du fichier ${file}: ${err}`);
        } else {
          resolve(true);
        }
      });
    }).catch((err) => {
      console.error(`Le fichier ${file} n'existe pas: ${err}`);
      return false;
    });
  }

function replaceSpecialCharacters(str) {
    return str.replace(/[^a-zA-Z0-9]+/g, "_");
}


function update_json_file_trade(processInfo, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair ){
    try {
        let data = {};
        // read existing json file
        if (fs.existsSync('jsons/data/processTrades.json')) {
            data = JSON.parse(fs.readFileSync('jsons/data/processTrades.json', 'utf8'));
        }  
        // add new data to json object
        data[processInfo.pid] = {
            processInfo,
            timeframe,
            price,
            position,
            amount,
            tp_percentage,
            tp_amount,
            sl_percentage,
            tp_switch,
            sl_switch,
            pair,
            date: new Date()
        };
        // write json object to file
        fs.writeFileSync('jsons/data/processTrades.json', JSON.stringify(data, null, 2));
        return data;
    } catch (err) {
        return err.message
    }
}

module.exports = { update_config_bot_json_file, readFile, replaceSpecialCharacters, writeFile, update_json_file_trade };