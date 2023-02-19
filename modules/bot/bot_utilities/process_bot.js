const logger = require('../../logger');
const fs = require('fs');
const ps = require('ps-node');
const path = require('path');

async function newBotProcess(config, pid, dateStartString){
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    
    ps.lookup({ pid: pid }, function(err, resultList ) {
        if (err) {
            logger.error(etiquette_bot + "Error: " + err);
            return { status: false, message: 'Error: ' + err  };
        }
        if(resultList.length === 0){
            logger.error("Error: Process with PID "+ pid + " not found.");
            return { status: false, message: 'Error: Process with PID ' + pid + ' not found.' };
           
        }
        
        let processInfo = resultList[0];
        logger.info(etiquette_bot + `PID: ${processInfo.pid}`);
        logger.info(etiquette_bot + `Title: ${processInfo.command}`);
        logger.info(etiquette_bot + `Memory usage: ${processInfo.pmem}`);
        logger.info(etiquette_bot + `Uptime: ${processInfo.elapsed}`);

        try {
            let data = {};
            // read existing json file
            const parentDir = path.join(__dirname, '../../../');
            let file_json_bots = parentDir + 'jsons/data/processBots.json'
            
            if (fs.existsSync(file_json_bots)) {
                data = JSON.parse(fs.readFileSync(file_json_bots, 'utf8'));
            }
            //Paramètres Généraux
            
            const production = config.parametres_generaux.production;
            
            const stratSelected = config.parametres_generaux.strat_active;
            const exchangeSelected = config.parametres_generaux.exchange_active;
            const isMysql = config.parametres_generaux.mysql;
            const telegram_on = config.retour_telegram.telegram_on;
            
            //Paramètres Trading Généreaux
            const stableCoin = config.parametre_strategie_generaux.stableCoin;
            const timeframeBot = config.parametre_strategie_generaux.timeframe;
            const nbOfCandles = config.parametre_strategie_generaux.nbOfCandles;
            const leverage = config.parametre_strategie_generaux.leverage;
            const is_tp = config.parametre_strategie_generaux.is_tp;
            const is_sl = config.parametre_strategie_generaux.is_sl;
            const maxOpenPosition = config.parametre_strategie_generaux.maxOpenPosition;
            const typeTrade = config.parametre_strategie_generaux.type;

            //Historique
            const totalInvestment = config.historique.totalInvestment;
            const soldeFile = config.historique.soldeFile;

            let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
            // add new data to json object
            data[pid] = {
                pid,
                dateStartString,
                botName,
                production,
                stratSelected,
                exchangeSelected,
                isMysql,
                telegram_on,
                stableCoin,
                timeframeBot,
                leverage,
                nbOfCandles,
                is_tp,
                is_sl,
                maxOpenPosition,
                typeTrade,
                totalInvestment,
                soldeFile,
                date: new Date()
            };
            // write json object to file
            fs.writeFileSync(file_json_bots, JSON.stringify(data, null, 4));
            return { status: true, message: data };
            
        } catch (error) {
            logger.error(etiquette_bot + "Error:" + error);
            return { status: false, message: error };
            
        }



        
    });
}

module.exports = { newBotProcess };
