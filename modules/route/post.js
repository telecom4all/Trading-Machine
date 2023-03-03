const ps = require('ps-node');
const { fork } = require('child_process');
//const fs = require('fs');
const path = require('path');

const logger = require('../logger');
const checkAuth = require('../auth');
const utilities = require('../utilities');
const process_bot = require('../bot/bot_utilities/process_bot');
const mysqlUtil = require('../mysql');
const { off } = require('process');
const config = require('../config');
const fs = require('fs');

const postRoutes = (app) => {
    
  
  
  

    app.post('/save_config', checkAuth, async (req, res) => {
      try {
          var update_file = await utilities.update_config_bot_json_file(req.body )
          res.send({status: true, message: update_file});
      } catch (err) {
          res.send({status: false, message: err.message});
      }
    });
    

    app.post('/processe_infos', (req, res) => {
      let { pid, title } = req.body
     
      ps.lookup({ pid: pid }, function(err, resultList ) {
          if (err) {
              logger.error( err);
              res.send({ status: false, message: err });
              return;
          }
          if(resultList.length === 0){
              logger.error(title + " avec le PID : "+ pid + " n'a pas été trouvé");
              res.send({ status: false, message: 'Erreur: ' +  title + ' avec le PID ' + pid + ' n a pas été trouvé.' });
              return;
          }
          let processInfo = resultList[0];
          //logger.info(`PID: ${processInfo.pid}`);
          //logger.info(`Title: ${processInfo.command}`);
          //logger.info(`Memory usage: ${processInfo.pmem}`);
          //logger.info(`Uptime: ${processInfo.elapsed}`);
          res.send(processInfo);
      });
    });


    


    app.post('/processe_delete', async (req, res) => {
      let { pid, title } = req.body
      let processFile;
      if(title == "Bot"){
        processFile = path.join(__dirname, '../../jsons/data/processBots.json');
      }
      if(title == "Trade Manuel"){
        processFile = path.join(__dirname, '../../jsons/data/processTrades.json');
      }
      const infosProcess = await utilities.readFile(processFile);
      const infosProcessJson = JSON.parse(infosProcess);
      
      const infos = infosProcess.toString('utf8');
      let infosJson = JSON.parse(infos);
      if(infosJson == false){
        logger.error(title + " Erreur de lecture du fichier : " + processFile)
        res.send(`Erreur de lecture du fichier ${processFile}`);
        return;
      }
      
      if (!(pid in infosJson)) {
        logger.error(`${title} avec le ${pid} n'a pas été trouvé dans processBots.json`)
        res.send(`${title} avec le ${pid} n'a pas été trouvé dans processBots.json`);
        return;
      }

      try {
        process.kill(pid);
      } catch (error) {
        logger.error(`${title} Erreur lors de l'arret du ${title} : ${error}`)
       
      }
      delete infosJson[pid];

      let isUpdated = await utilities.writeFile(processFile, infosJson);

      
      res.send(isUpdated);
      
    });

   const colorTable = {
  '30': 'black',
  '31': 'red',
  '32': 'green',
  '33': 'yellow',
  '34': 'blue',
  '35': 'magenta',
  '36': 'cyan',
  '37': 'white'
};

app.post('/get_log', async (req, res) => {
  let logFile = path.join(__dirname, '../../logs/pm2.log');
  let logs = fs.readFileSync(logFile, 'utf8');
  let logsArray = logs.split('\n');
  let last200Lines = logsArray.slice(-200).join('\n');

  if(last200Lines == "false"){
    res.send(false);
  }
  else{
    
    let str = last200Lines.replace(/\x1B\[31merror\x1B\[39m/g, '<span style="color: red;">error</span>');
    let str2 = str.replace(/\x1B\[32minfo\x1B\[39m/g, '<span style="color: green;">info</span>');
    let str3 = str2.replace(/\x1B\[(\d+)m(.*?): \x1B\[0m/g, (match, code, label) => {
      const color = colorTable[code];
      return `<span style="color: ${color};">${label}</span>`;
    });
    
    let str4 = str3.replace(/\x1B\[35m([\s\S]*?)\x1B\[0m/g, '<span style="color: magenta;">$1</span>');


    let str5 = str4.replace(/\x1B\[38;2;255;165;0mTrade Manuel :\x1B\[0m/g, '<span style="color: rgb(255, 165, 0);"> Trade Manuel :</span>');
    let str6 = str5.replace(/\n/g, '<br>');

    //console.log(str6)
    res.send(str6);
  }
});

    /*  Trading Bot */
    app.post('/start_bot', (req, res) => {
      let child;
      let title = "Bot: ";
      // Lancer la fonction monitor_price dans un nouveau processus
      let data = JSON.stringify(req.body)
      const parentDir = path.join(__dirname, '../..');
      child = fork(parentDir + '/modules/bot/bot_start.js', [data]);
  
      try {
          // Récupérer les informations du processus
          ps.lookup({ pid: child.pid }, function(err, resultList ) {
              if (err) {
                  logger.error('Erreur: ' + err);
                  res.send({ status: false, message: err });
                  return;
              }
              if(resultList.length === 0){
                  logger.error('Erreur: Le processus avec PID: ' + child.pid + 'n\'a pas été trouvé.') ;
                  res.send({ status: false, message: 'Erreur: Le Bot avec PID ' + child.pid + ' n\'a pas été trouvé.' });
                  return;
              }
              let processInfo = resultList[0];
              logger.info(`${title}PID: ${processInfo.pid}`);
              logger.info(`${title}Titre: ${processInfo.command}`);
              logger.info(`${title}Utilisation de la mémoire: ${processInfo.pmem}`);
              logger.info(`${title}Temps d'activité: ${processInfo.elapsed}`);
              // Mettre à jour le fichier JSON
              //var update_file_process = utilities.update_json_file_trade(processInfo, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair )
              res.send({status: true, processInfo});
          });
      } catch (err) {
          res.send({status: false, message: err.message});
      }
    });



    app.post('/processes_bots', async (req, res) => {
      
      try {
          const configFile = path.join(__dirname, '../../jsons/data/processBots.json');
          const infosProcess = await utilities.readFile(configFile);
          const infosProcessJson = JSON.parse(infosProcess);
          const updatedInfosProcessJson = {};
          for (const [key, value] of Object.entries(infosProcessJson)) {
              const historiqueFile = path.join(__dirname, `../../jsons/data/historiques/${value.soldeFile}`);
              const infosSoldes = await utilities.readFile(historiqueFile);
              if(infosSoldes != false){
                  const infosSoldesJson = JSON.parse(infosSoldes.toString('utf8'));
                  
                  if(value.isMysql == true){
                    const sanitizedBotname = utilities.replaceSpecialCharacters(value.botName);
                    const infosMysql = await mysqlUtil.readDataFromTables("wallet_"+sanitizedBotname, "trades_"+sanitizedBotname);
                    updatedInfosProcessJson[key] = { ...value, historiques: { mysql: infosMysql , json: infosSoldesJson.evolution }   };
                  }
                  else{
                      updatedInfosProcessJson[key] = { ...value, historiques: { json: infosSoldesJson.evolution } };
                  }
              }
              else{
                  if(value.isMysql == true){
                     const sanitizedBotname = utilities.replaceSpecialCharacters(value.botName);
                     const infosMysql = await mysqlUtil.readDataFromTables("wallet_"+sanitizedBotname, "trades_"+sanitizedBotname);
                     updatedInfosProcessJson[key] = { ...value, historiques: { mysql: infosMysql , json: [] }   };
                  }
                  else{
                      updatedInfosProcessJson[key] = { ...value, historiques: { json: [] } };
                  }
              }
          }
          res.send(updatedInfosProcessJson);
      } catch (error) {
          logger.error(error);
      }
    });

    


    /* Place Trade */
    app.post('/get_price', async (req, res) => {
     try {
        const { pair, exchange } = req.body
        let exchangeUtils;
        let exchangeSelected;
        if(exchange == "bitget"){
          exchangeUtils = require('../bot/exchanges/bitget');
          exchangeSelected = exchangeUtils.initBitget(config, "");
          
        }
        if(exchange == "binance"){
          exchangeUtils = require('../bot/exchanges/binance');
          exchangeSelected = exchangeUtils.initBinance(config, "");
          
        }

        let price = await exchangeUtils.getPriceToken(exchangeSelected, pair + ":" + config.parametre_strategie_generaux.stableCoin, config)
        if(price != false){
            res.send({ status: true, message: price });
        }
        else{
            res.send({ status: false, message: price });
        }
      } catch (err) {
        res.send({ status: false, message: err.message });
      }
    });


    app.post('/processes_trades', async (req, res) => {
      const configFile = path.join(__dirname, '../../jsons/data/processTrades.json');
      const infosTrades = await utilities.readFile(configFile);
      const infosProcessJson = JSON.parse(infosTrades);
      
      res.send(infosProcessJson);
    });


    app.post('/trade', (req, res) => {
      let child;
      const { timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange } = req.body
      console.log(`timeframe: ${timeframe}, price: ${price}, position: ${position}, amount: ${amount}, tp_percentage: ${tp_percentage}, tp_amount: ${tp_amount}, sl_percentage: ${sl_percentage}, tp_switch: ${tp_switch}, sl_switch: ${sl_switch}, pair: ${pair}, exchange: ${exchange}`);
      
      const parentDir = path.join(__dirname, '../..');
      
      // Lancer la fonction monitor_price dans un nouveau processus
      child = fork(parentDir + '/modules/trades/monitor_price.js', [timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair , exchange]);
      
       
      try {
          // Récupérer les informations du processus
          ps.lookup({ pid: child.pid }, function(err, resultList ) {
              if (err) {
                  logger.error("Erreur:", err);
                  res.send({ status: false, message: err });
                  return;
              }
              if(resultList.length === 0){
                  logger.error("Erreur: Le processus avec PID", child.pid, "n'a pas été trouvé.");
                  res.send({ status: false, message: `Erreur: Le processus avec PID ${child.pid} n'a pas été trouvé.` });
                  return;
              }
              let processInfo = resultList[0];
              logger.info(`PID: ${processInfo.pid}`);
              logger.info(`Titre: ${processInfo.command}`);
              logger.info(`Utilisation de la mémoire: ${processInfo.pmem}`);
              logger.info(`Temps d'activité: ${processInfo.elapsed}`);
              // Mettre à jour le fichier JSON
              var update_file_process = utilities.update_json_file_trade(processInfo, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair )
              res.send({status: true, update_file_process});
          });
      } catch (err) {
          res.send({status: false, message: err.message});
      }
    });

  };
  
  module.exports = postRoutes;