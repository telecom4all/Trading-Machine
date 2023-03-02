
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
      
        const parentDir = path.join(__dirname, '../');
        let file = parentDir + 'jsons/data/processTrades.json'
    
        let data = {};
        // read existing json file
        if (fs.existsSync(file)) {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
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
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return data;
    } catch (err) {
        return err.message
    }
}




const Table = require('cli-table');
async function resumeLogsConditions(){
  //OPENSHORT
  const open_short = path.join(__dirname, '../logs/conditions/open_short.json');
  // Charger les données depuis le fichier JSON
  const jsonDataOpenShort = JSON.parse(fs.readFileSync(open_short));

  // Créer un tableau pour stocker les données à afficher
  const tableOpenShort = new Table({
    head:['Type','Pair', 'Date', 'Close (n-1)', 'BBands Lower (n-1)', 'Close', 'BBands Lower', 'CalculBand', 'Long MA', 'close_n1 > bbands_lower_n1', 'close < bbands_lower', 'calculBand > min_bol_spread', 'close < long_ma'],
    colAligns: ['center','center','center','center','center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center']
  });

  // Parcourir les données de chaque paire de trading
  for (const pair in jsonDataOpenShort) {
    const pairData = jsonDataOpenShort[pair].data;

    // Parcourir les données de chaque période pour cette paire de trading
    for (const period of pairData) {
      // Ajouter les données de chaque période à la table
      tableOpenShort.push([
        "open_short",
        pair,
        period.dateStartString,
        period.close_n1,
        period.bbands_upper_n1,
        period.close,
        period.bbands_upper,
        period.calculBand,
        period.long_ma,
        period.cond1,
        period.cond2,
        period.cond3,
        period.cond4
      ]);
    }
  }


  //OPENLONG
  const open_long = path.join(__dirname, '../logs/conditions/open_long.json');
  // Charger les données depuis le fichier JSON
  const jsonDataOpenLong = JSON.parse(fs.readFileSync(open_long));

  // Créer un tableau pour stocker les données à afficher
  const tableOpenLong = new Table({
    head:['Type','Pair', 'Date', 'Close (n-1)', 'BBands Upper (n-1)', 'Close', 'BBands Upper', 'CalculBand', 'Long MA', 'close_n1 < bbands_upper_n1', 'close > bbands_upper', 'calculBand > min_bol_spread', 'close > long_ma'],
    colAligns: ['center','center','center','center','center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center']
  });

  // Parcourir les données de chaque paire de trading
  for (const pair in jsonDataOpenLong) {
    const pairData = jsonDataOpenLong[pair].data;

    // Parcourir les données de chaque période pour cette paire de trading
    for (const period of pairData) {
      // Ajouter les données de chaque période à la table
      tableOpenLong.push([
        "open_long",
        pair,
        period.dateStartString,
        period.close_n1,
        period.bbands_upper_n1,
        period.close,
        period.bbands_upper,
        period.calculBand,
        period.long_ma,
        period.cond1,
        period.cond2,
        period.cond3,
        period.cond4
      ]);
    }
  }



  //CLOSELONG
  const close_long = path.join(__dirname, '../logs/conditions/close_long.json');
  // Charger les données depuis le fichier JSON
  const jsonDataCloseLong = JSON.parse(fs.readFileSync(close_long));

  // Créer un tableau pour stocker les données à afficher
  const tableCloseLong = new Table({
    head:['Type','Pair', 'Date',  'Close', 'Long MA', 'close < long_ma'],
    colAligns: ['center','center','center','center','center', 'center']
  });

  // Parcourir les données de chaque paire de trading
  for (const pair in jsonDataCloseLong) {
    const pairData = jsonDataCloseLong[pair].data;

    // Parcourir les données de chaque période pour cette paire de trading
    for (const period of pairData) {
      // Ajouter les données de chaque période à la table
      tableCloseLong.push([
        "close_long",
        pair,
        period.dateStartString,
        period.close_n1,
        period.bbands_upper_n1,
        period.close
      ]);
    }
  }


  //CLOSESHORT
  const close_short = path.join(__dirname, '../logs/conditions/close_short.json');
  // Charger les données depuis le fichier JSON
  const jsonDataCloseShort = JSON.parse(fs.readFileSync(close_short));

  // Créer un tableau pour stocker les données à afficher
  const tableCloseShort = new Table({
    head:['Type','Pair', 'Date',  'Close', 'Long MA', 'close < long_ma'],
    colAligns: ['center','center','center','center','center', 'center']
  });

  // Parcourir les données de chaque paire de trading
  for (const pair in jsonDataCloseShort) {
    const pairData = jsonDataCloseShort[pair].data;

    // Parcourir les données de chaque période pour cette paire de trading
    for (const period of pairData) {
      // Ajouter les données de chaque période à la table
      tableCloseShort.push([
        "close_long",
        pair,
        period.dateStartString,
        period.close_n1,
        period.bbands_upper_n1,
        period.close
       
      ]);
    }
  }


  // Écrire les tableaux dans le fichier de log
  const logFilePath = path.join(__dirname, '../logs/conditions_logs.log');
  fs.writeFileSync(logFilePath, tableOpenShort.toString() + "\n\n");
  fs.appendFileSync(logFilePath, tableOpenLong.toString() + "\n\n");
  fs.appendFileSync(logFilePath, tableCloseLong.toString() + "\n\n");
  fs.appendFileSync(logFilePath, tableCloseShort.toString() + "\n\n");

  console.log("Le fichier de log des conditions a été mis à jour.");

  }

  async function logConditions(type, dataLogConditions) {
    const filename = path.join(__dirname, '../logs/conditions/'+type+'.json');

    let logData = {};
    try {
      const fileData = fs.readFileSync(filename, 'utf8');
      logData = JSON.parse(fileData);
    } catch (error) {
      console.error(`Error reading log file: ${error.message}`);
    }

    const [pair, dateStartString, close_n1, bbands_upper_n1, close, bbands_upper, calculBand, long_ma, cond1, cond2, cond3, cond4] = dataLogConditions[0];

    const entry = {
      dateStartString,
      close_n1,
      bbands_upper_n1,
      close,
      bbands_upper,
      calculBand,
      long_ma,
      cond1, 
      cond2, 
      cond3, 
      cond4
    };


    if (!logData[pair]) {
      logData[pair] = {
        data: []
      };
    }

    logData[pair].data.push(entry);


    fs.writeFile(filename, JSON.stringify(logData, null, 4), (err) => {
      if (err) {
        console.error(`Error writing log file: ${err.message}`);
      } else {
        console.log(`Log file ${filename} updated successfully.`);
      }
    });
}




module.exports = { update_config_bot_json_file, readFile, replaceSpecialCharacters, writeFile, update_json_file_trade , logConditions, resumeLogsConditions};