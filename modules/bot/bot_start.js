
const logger = require('../logger');
const telegram = require('../telegram');
const doPairList = require('../bot/bot_utilities/doPairList');
const row = require('../bot/strats/row');
const processBot = require('../bot/bot_utilities/process_bot');
const DataFrame = require("pandas-js").DataFrame;
const cron = require("node-cron");
const bilan = require('../bot/bot_utilities/bilan');
const config_bots = require('../config')
const place_trade = require('../bot/bot_utilities/place_trade')
const take_profit = require('../bot/bot_utilities/take_profit');
const stop_loss = require('../bot/bot_utilities/stop_loss');
const path = require('path');
const utilities = require('../utilities');
const parentDir = path.join(__dirname, '../../');

function replaceSpecialCharacters(str) {
    return str.replace(/[^a-zA-Z0-9]+/g, "_");
}

const sleepMilliSec = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const sleepSec = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, (sec * 1000));
    });
};
async function bot_start() {
    const str_data = process.argv[2];
    const data = JSON.parse(str_data);


    //console.log(data)
    // Récupération des variables 
    const pid = process.pid;
    const dateStart = new Date();
    const dateStartString = dateStart.toLocaleDateString() + " " + dateStart.toLocaleTimeString();

    //Paramètres Généraux
    const botName = data.parametres_generaux.botname;
    const botVersion = data.parametres_generaux.botversion;
    const production = data.parametres_generaux.production;
    const debug = data.parametres_generaux.debug;
    const debug_detail = data.parametres_generaux.debug_detail;
    const stratSelected = data.parametres_generaux.strat_active;
    const exchangeSelected = data.parametres_generaux.exchange_active;
    const delay_coin = data.parametres_generaux.delay_coin;
    const isMysql = data.parametres_generaux.mysql;
    
    //Paramètres Télégram
    const telegram_on = data.retour_telegram.telegram_on;
    const alwaysNotifTelegram = data.retour_telegram.alwaysNotifTelegram;
    const notifTelegramOnChangeOnly = data.retour_telegram.notifTelegramOnChangeOnly;
    const notifBilanDePerformance = data.retour_telegram.notifBilanDePerformance;
    const notifBilanEvolutionContinue = data.retour_telegram.notifBilanEvolutionContinue;

    //Paramètres Trading Généreaux
    const stableCoin = data.parametre_strategie_generaux.stableCoin;
    const timeframeBot = data.parametre_strategie_generaux.timeframe;
    const nbOfCandles = data.parametre_strategie_generaux.nbOfCandles;
    const leverage = data.parametre_strategie_generaux.leverage;
    const is_tp = data.parametre_strategie_generaux.is_tp;
    const nb_tp = data.parametre_strategie_generaux.nb_tp;
    const tp_1 = data.parametre_strategie_generaux.tp_1;
    const tp_2 = data.parametre_strategie_generaux.tp_2;
    const is_sl = data.parametre_strategie_generaux.is_sl;
    const sl = data.parametre_strategie_generaux.sl;
    const maxOpenPosition = data.parametre_strategie_generaux.maxOpenPosition;
    const typeTrade = data.parametre_strategie_generaux.type;

    //Historique
    const totalInvestment = data.historique.totalInvestment;
    const soldeFile = data.historique.soldeFile;
    let fichier_historique = parentDir + "jsons/data/historiques/"+soldeFile

    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    
    let messageTelegram = "++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n"
    messageTelegram += "DEMARAGE DU BOT " + botName + " le " + dateStartString +   "\n\n";
    let exchangeUtils
    let exchange;
    let mysql;
    let pairList;

    const sanitizedBotname = replaceSpecialCharacters(botName);

    // Rechercher l'intervalle de temps correspondant à la période sélectionnée
    const selectedTimeFrame = config_bots.timeFrames.find(tf => tf.abbreviation === timeframeBot);
    if (!selectedTimeFrame) {
        console.error(`Error: Invalid time frame selection: ${config_bots.timeframeBot}`);
        return;
    }
    // Fin de la récupération des variables 

    // enregistrement dans le fichier process.json
    let isRecordNewProcess = await processBot.newBotProcess(data, pid, dateStartString)
  






    logger.info(etiquette_bot + "Bot de Trading " + botName + " démaré avec le pid :" + pid + " le " + dateStartString + " dans sa version : " + botVersion);
    logger.info(etiquette_bot + "Exchange : " + exchangeSelected);
    logger.info(etiquette_bot + "Stratégies : " + stratSelected);

    // Choix de l'exchange 
    if(exchangeSelected === "BITGET"){
        exchangeUtils = require('../bot/exchanges/bitget');
        try {
            exchange = exchangeUtils.initBitget(data, true);
            if(debug == true){
                logger.info(etiquette_bot + 'Bitget initialisé avecsuccess');  
            }
        } catch (error) {
        logger.error(etiquette_bot + error);
        return; 
        }
    }
    if(exchangeSelected === "BINANCE"){
        exchangeUtils = require('../bot/exchanges/binance');
        try {
            exchange = exchangeUtils.initBinance(data, true);
            if(debug == true){
                logger.info(etiquette_bot + 'Binance initialisé avecsuccess');  
            }
        } catch (error) {
        logger.error(etiquette_bot + error);
        return; 
        }
    }
    // Fin choix de l'exchange 

    // Mysql 
    if(isMysql == true){
        if(telegram_on == true){
            messageTelegram += "Exchange: " + exchangeSelected + " Stratégie: " + stratSelected + " Mysql Activé" +"\n\n";
        }
        try {
            mysql = require("../mysql");
            // Pour vérifier et créer les tables "wallet" et "trades" si elles n'existent pas :
            mysql.checkAndCreateTable("wallet_"+sanitizedBotname, "trades_"+sanitizedBotname).then(() => {
                logger.info(etiquette_bot + "Tables crée avec success ou déjà existante");
            }).catch((error) => {
                logger.error(etiquette_bot + "Erreur dans la création des tables:" +  error);
            });
           // mysql.checkAndCreateTable("wallet_"+sanitizedBotname, "trades_"+sanitizedBotname);
        } catch (error) {
            logger.error(etiquette_bot + "Error : " + error);
        }
    }
    else{
        if(telegram_on == true){
            messageTelegram += "Exchange: " + exchangeSelected + " Stratégie: " + stratSelected  +"\n\n";
        }
    }
    // Fin Mysql 

    // definition des pairs 
    pairList = doPairList(data.strategies, stratSelected, stableCoin, data);
    if(pairList == false){
        return;
    }
    if(debug == true){
        logger.info(etiquette_bot + "PairList: " + pairList);  
    }
    //Fin definition des pairs 

    messageTelegram += "TimeFrame: " + selectedTimeFrame.name + "\n\n";
    messageTelegram += "Liste de pair : \n";
    messageTelegram += pairList 

    messageTelegram += "\n\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n\n"

    let usdBalanceInit = await exchangeUtils.getBalance(exchange, data);
    const roundedUsdBalanceInit = parseFloat(usdBalanceInit).toFixed(2); 
    const dateInit = new Date();
    const dateExecStringInit = dateInit.toLocaleDateString() + " " + dateInit.toLocaleTimeString();
    if(isMysql == true){
        mysql.addDataToWallet("wallet_"+sanitizedBotname, {
            id: "",
            montant: roundedUsdBalanceInit,
            dateheure: dateExecStringInit,
            etiquette_bot:etiquette_bot
        });
    }
    let isBilanInit = await bilan.getBilan(data, roundedUsdBalanceInit, fichier_historique, etiquette_bot);

    if(telegram_on == true){
        telegram(messageTelegram);
    }
    
    
    
    
    // Planifiez la tâche cron
    cron.schedule(selectedTimeFrame.cronSyntax, async () => {
        messageTelegram = "*******************************************************";
        //cette variable nous servira à la fin pour déterminer si on a fait des actions ou pas
        //si la variable est toujours à 0 c'est qu'il n'y a eu aucun changement et qu'on ne prévient pas le bot telegram de nous notifier
        let changement=0
        
        const dateExec = new Date();
        const dateExecString = dateExec.toLocaleDateString() + " " + dateExec.toLocaleTimeString();
        logger.info(etiquette_bot + "Exécution du bot: " + botName + " le " + dateExecString);  

        if(telegram_on == true){
            messageTelegram += "  " + dateExecString + "  \n";
            messageTelegram += "Bot de Trading " + botName + " version : " + botVersion + "\n\n"
            messageTelegram += "Démaré avec le pid :" + pid + " le " + dateStartString  + "\n"   
        }

        // Get Balance 
        let balanceWallet = await exchangeUtils.getBalance(exchange, data);
        logger.info(etiquette_bot + "Balance Wallet: " + balanceWallet + " " + stableCoin);  

        //Get Data Exchange 
        var isMarketLoaded = await exchangeUtils.loadMarkets(exchange, data)
        if(isMarketLoaded == true){
            logger.info(etiquette_bot + "Marché Chargé")
        }
        else{
            logger.error(etiquette_bot + isMarketLoaded);
        }
            
        // Chargement des donnée de l'exchange     
        logger.info(etiquette_bot + "Collecte des Data de l'exchange");                 
        let dfList = await exchangeUtils.getDataExchange(pairList, exchange, data)
        

        // Collecte des indicateurs 
        
        logger.info(etiquette_bot + "Collecte des indicateurs");  
        let indicators;
        let indicatorsValues;
        if(stratSelected == "BOLLINGER"){
            indicators = require('../bot/strats/populate_bollinger');

            indicatorsValues = await indicators.getIndicatorsValue(data.strategies, stratSelected);
            if(debug_detail == true){
                console.log(indicatorsValues);  
            }
            dfList = await indicators.getIndicators(dfList, data, indicatorsValues)
        
        }
        
        //==================================================
        //          EXECUTION PRINCIPALE DU BOT : 
        //=================================================
        if(telegram_on == true){
            messageTelegram += "\nActions prises par le bot :\n\n";
        }
        logger.info(etiquette_bot + "Execution de la Strat sur les Tokens")
        
        try {
            for (const coin in dfList){
                let lastRow;
                let conditions;
                let nbTotalOpenPositions = await exchangeUtils.getNbOpenPositionAll(exchange, data)
                let allOpenPositionData = await exchangeUtils.getAllOpenPositionDatas(exchange, data)
                
                let pair_message = coin+"/"+stableCoin;
                let pair = coin+"/"+stableCoin+":"+stableCoin;
                //console.log( allOpenPositionData)
                const listPosition = await allOpenPositionData.filter(d => d.symbol === pair).map(d => ({
                                        side: d.side, 
                                        size: (d.contracts), 
                                        market_price: d.info.marketPrice, 
                                        usd_size: parseFloat(d.contractSize) * parseFloat(d.info.marketPrice), 
                                        open_price: d.entryPrice
                                    }));

                


                if( stratSelected == "BOLLINGER"){
                    lastRow = await row.getRowDfListBollinger(dfList[coin], -2, data);
                    conditions = require('../bot/strats/conditions_bollinger');
                }

                if (debug_detail === true) {
                    logger.info(etiquette_bot + "---------------  lastRow  --------------- ");
                    console.log(lastRow);
                }

                //let currentPrice = await exchangeUtils.getPriceToken(exchangeSelected, pair + ":" + stableCoin, data)
      
                if (listPosition.length > 0) {
                    let position = listPosition[0];
                    if (debug === true) {
                        logger.info(etiquette_bot + "Current position :");
                        console.log(position);
                    }

                    //Close Long
                    if((position.side === "long") && (await conditions.close_long(pair, lastRow, data, indicatorsValues) === true)){

                        let currentPrice = await exchangeUtils.getPriceToken(exchange, pair, data)
                        
                        let close_long_market_price = currentPrice; //await exchangeUtils.convert_price_to_precision(exchange, pair, lastRow.close, data);
                        let close_long_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, position.size, data)
                        let exchange_close_long_quantity = close_long_quantity * close_long_market_price;
                        
                        if(production == true){
                            try {
                                let trade = await place_trade.closeTrade(exchangeUtils, exchange, pair, "sell", close_long_quantity, currentPrice, data, etiquette_bot);
                                if(trade != false){
                                    if(isMysql == true){
                                        mysql.addDataToTrades("trades_"+sanitizedBotname, {
                                            id: "",
                                            type: 'Close Long',
                                            montantCrypto: close_long_quantity,
                                            montantUsd: exchange_close_long_quantity,
                                            symbol: coin+"/"+stableCoin,
                                            prix: close_long_market_price,
                                            dateheure: dateExecString,
                                            etiquette_bot:etiquette_bot
                                        });
                                    }  
                                    messageTelegram += "\:nPlace Close Long Market Order pour: " + pair_message + " Quantité: " + close_long_quantity + " pour un montant de: " + exchange_close_long_quantity + " au prix de : " + close_long_market_price+ "\n";
                                    if(debug_detail == true){
                                        console.log(trade);
                                    }
                                }
                                else{
                                    logger.error(etiquette_bot + "Erreur lors de la création du trade");
                                    messageTelegram += "Trade pour : " + pair_message + " n'a pas su être placé\n";
                                    return;
                                }    
                            } catch (error) {
                                logger.error(etiquette_bot + isMarketLoaded);
                                return;
                            }
                            
                            changement=changement+1  
                        } 
                    }
                    //Close Short
                    else if((position.side === "short") && (await conditions.close_short(pair, lastRow, data, indicatorsValues) === true)){
                        let currentPrice = await exchangeUtils.getPriceToken(exchange, pair, data)
                        let close_short_market_price = await exchangeUtils.convert_price_to_precision(exchange, pair, lastRow.close, data);
                        let close_short_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, position.size, data)
                        let exchange_close_short_quantity = close_short_quantity * close_short_market_price;
                        
                        
                        if(production == true){
                            try {
                                let trade = await place_trade.closeTrade(exchangeUtils, exchange, pair, "buy", close_short_quantity, currentPrice, data, etiquette_bot);
                                if(trade != false){
                                    if(isMysql == true){
                                        mysql.addDataToTrades("trades_"+sanitizedBotname, {
                                            id: "",
                                            type: 'Close Short',
                                            montantCrypto: close_short_quantity,
                                            montantUsd: exchange_close_short_quantity,
                                            symbol: coin+"/"+stableCoin,
                                            prix: close_short_market_price,
                                            dateheure: dateExecString,
                                            etiquette_bot:etiquette_bot
                                        });
                                    }  
                                    messageTelegram += "\nPlace Close Short Market Order pour: " + pair_message + " Quantité: " + close_short_quantity + " pour un montant de: " + exchange_close_short_quantity + " au prix de : " + currentPrice+ "\n";
                                    if(debug_detail == true){
                                        console.log(trade);
                                    }
                                }
                                else{
                                    logger.error(etiquette_bot + "Erreur lors de la création du trade");
                                    messageTelegram += "Trade pour : " + pair_message + " n'a pas su être placé\n";
                                    return;
                                }    
                            } catch (error) {
                                logger.error(etiquette_bot + isMarketLoaded);
                                return;
                            }

                            changement=changement+1  
                        }    
                    }
                    else{ 
                        logger.info(etiquette_bot + "On garde :");  
                        logger.info(etiquette_bot + "Position: " + coin + " " + position.side + " Qte: " + position.size  + " QteUsd: " + position.usd_size  + "$ Prix Achat: "+ position.open_price + "$ Prix Actuel:"+ position.market_price  +  "$");  
                        if(telegram_on == true){
                            messageTelegram +=  "\nOn garde " + pair_message + " : \n";
                            messageTelegram +=  "Position: " + coin + " " + position.side + " Qte: " + position.size  + " QteUsd: " + position.usd_size  + "$ Prix Achat: "+ position.open_price + "$ Prix Actuel:"+ position.market_price  +  "$\n\n";
            
                        } 
                    }
                }
                else{
                    if (debug === true) {
                        logger.info(etiquette_bot + "No active position for : " + coin);
                    } 
                    //Open Long
                    
                    if(typeTrade == "both" || typeTrade == "long"){
                        
                        //console.log(conditions.open_long(lastRow, data, indicatorsValues))
                        if(await conditions.open_long(pair, lastRow, data, indicatorsValues) === true ){
                            if(nbTotalOpenPositions < maxOpenPosition){
                                let long_market_price = await exchangeUtils.convert_price_to_precision(exchange, pair, lastRow.close, data);
                                let currentPrice = await exchangeUtils.getPriceToken(exchange, pair, data)
                                let usdBalance = await exchangeUtils.getBalance(exchange, data);
                                let buyQuantityInUsd = usdBalance * 1/(maxOpenPosition-nbTotalOpenPositions)
                                buyQuantityInUsd = 0.95 * buyQuantityInUsd
                                //let long_quantity_in_usd = buyQuantityInUsd * leverage
                                let long_quantity_in_usd = buyQuantityInUsd 
                                let open_long_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, long_quantity_in_usd/long_market_price, data)
                                let long_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, open_long_quantity, data);
                                let exchange_long_quantity = long_quantity * long_market_price
                                
                                if(production == true){
                                    try {
                                        let trade = await place_trade.openTrade(exchangeUtils, exchange, pair, "buy", long_quantity, currentPrice, data, etiquette_bot);
                                        if(trade != false){
                                            if(isMysql == true){
                                                await mysql.addDataToTrades("trades_"+sanitizedBotname, {
                                                    id: "",
                                                    type: 'Open Long',
                                                    montantCrypto: long_quantity,
                                                    montantUsd: exchange_long_quantity,
                                                    symbol: coin+"/"+stableCoin,
                                                    prix: long_market_price,
                                                    dateheure: dateExecString,
                                                    etiquette_bot:etiquette_bot
                                                });
                                            }  
                                            messageTelegram += "\nPlace Open Long Market Order pour: " + pair_message + " Quantité: " + long_quantity + " pour un montant de: " + exchange_long_quantity + " au prix de : " + currentPrice+ "\n";
                                            if(debug_detail == true){
                                                console.log(trade);
                                            }

                                            if(is_tp == true){
                                                let tpTrade = await take_profit.placeTakeProfit(exchangeUtils, exchange, pair, "long", long_quantity, currentPrice, data, etiquette_bot)
                                                if(tpTrade == true){
                                                    messageTelegram += "\n Take Profit placer avec success pour le short sur : " + pair;
                                                }
                                                else{
                                                    messageTelegram += "\n !!! Take Profit n'a pas été placer avec success pour le short sur : " + pair;
                                                }
                                            }


                                            if(is_sl == true){
                                                let slTrade = await stop_loss.placeStopLoss(exchangeUtils, exchange, pair, "long", long_quantity, currentPrice, data, etiquette_bot)
                                                if(slTrade == true){
                                                    messageTelegram += "\n Stop Loss placer avec success pour le long sur : " + pair;
                                                }
                                                else{
                                                    messageTelegram += "\n !!! Stop Loss n'a pas été placer avec success pour le long sur : " + pair;
                                                }
                                            }
                                            
                                        }
                                        else{
                                            logger.error(etiquette_bot + "Erreur lors de la création du trade");
                                            messageTelegram += "Trade pour : " + pair_message + " n'a pas su être placé\n";
                                            return;
                                        }    
                                    } catch (error) {
                                        logger.error(etiquette_bot + isMarketLoaded);
                                        return;
                                    }

                                 
                                    changement=changement+1  
                                }
                            }
                            else{
                                logger.info(etiquette_bot + "maximum de position ouverte")
                            }
                        }
                    }
                    if(typeTrade == "both" || typeTrade == "short"){
                        if(await conditions.open_short(pair, lastRow, data, indicatorsValues) === true ){
                            if(nbTotalOpenPositions < maxOpenPosition){
                                let currentPrice = await exchangeUtils.getPriceToken(exchange, pair, data)
                                let short_market_price = await exchangeUtils.convert_price_to_precision(exchange, pair, lastRow.close, data);
                                let usdBalance = await exchangeUtils.getBalance(exchange, data);
                                let buyQuantityInUsd = usdBalance * 1/(maxOpenPosition-nbTotalOpenPositions)
                                buyQuantityInUsd = 0.95 * buyQuantityInUsd
                                //let short_quantity_in_usd = buyQuantityInUsd * leverage
                                let short_quantity_in_usd = buyQuantityInUsd 
                                let open_short_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, short_quantity_in_usd/short_market_price, data)
                                let short_quantity = await exchangeUtils.convert_amount_to_precision(exchange, pair, open_short_quantity, data);
                                let exchange_short_quantity = short_quantity * short_market_price;
                                
                                
                                if(production == true){
                                    try {
                                        let trade = await place_trade.openTrade(exchangeUtils, exchange, pair, "sell", short_quantity, currentPrice, data, etiquette_bot);
                                        if(trade != false){
                                            if(isMysql == true){
                                                await mysql.addDataToTrades("trades_"+sanitizedBotname, {
                                                    id: "",
                                                    type: 'Open Short',
                                                    montantCrypto: short_quantity,
                                                    montantUsd: exchange_short_quantity,
                                                    symbol: coin+"/"+stableCoin,
                                                    prix: short_market_price,
                                                    dateheure: dateExecString,
                                                    etiquette_bot:etiquette_bot
                                                });
                                            } 
                                            messageTelegram += "\nPlace Open Long Market Order pour: " + pair_message + " Quantité: " + short_quantity + " pour un montant de: " + exchange_short_quantity + " au prix de : " + currentPrice+ "\n";
                                            if(debug_detail == true){
                                                console.log(trade);
                                            }
                                            if(is_tp == true){
                                                let tpTrade = await take_profit.placeTakeProfit(exchangeUtils, exchange, pair, "short", short_quantity, currentPrice, data, etiquette_bot)
                                                if(tpTrade == true){
                                                    messageTelegram += "\n Take Profit placer avec success pour le short sur : " + pair;
                                                }
                                                else{
                                                    messageTelegram += "\n !!! Take Profit n'a pas été placer avec success pour le short sur : " + pair;
                                                }
                                            }
                                            
                                            if(is_sl == true){
                                                let slTrade = await stop_loss.placeStopLoss(exchangeUtils, exchange, pair, "short", short_quantity, currentPrice, data, etiquette_bot)
                                                if(slTrade == true){
                                                    messageTelegram += "\n Stop Loss placer avec success pour le short sur : " + pair;
                                                }
                                                else{
                                                    messageTelegram += "\n !!! Stop Loss n'a pas été placer avec success pour le short sur : " + pair;
                                                }
                                            }

                                        }
                                        else{
                                            logger.error(etiquette_bot + "Erreur lors de la création du trade");
                                            messageTelegram += "Trade pour : " + pair_message + " n'a pas su être placé\n";
                                            return;
                                        }    
                                    } catch (error) {
                                        logger.error(etiquette_bot + isMarketLoaded);
                                        return;
                                    }
                                 
                                    changement=changement+1  
                                }
                            }
                            else{
                                logger.info(etiquette_bot + "maximum de position ouverte")
                            }                    
                        }
                    }
                    

                }


            }    
        } catch (error) {
            logger.error(etiquette_bot + error);    
        }

        let usdBalanceFinal = await exchangeUtils.getBalance(exchange, data);
        const roundedUsdBalanceFinal = parseFloat(usdBalanceFinal).toFixed(2); 

        if(isMysql == true){
            mysql.addDataToWallet("wallet_"+sanitizedBotname, {
                id: "",
                montant: roundedUsdBalanceFinal,
                dateheure: dateExecString,
                etiquette_bot:etiquette_bot
            });
        }

        // Partie Telegram 
        
        
 
        let isBilan = await bilan.getBilan(data, roundedUsdBalanceFinal, fichier_historique, etiquette_bot);
        if(notifBilanDePerformance === true){
            let isBilanPerf = await bilan.getBilanPerf(data, isBilan, etiquette_bot);
            messageTelegram += isBilanPerf;
        }

        if(notifBilanEvolutionContinue === true){
            let isEvolutionContinue = await bilan.getEvolutionContinue(data, isBilan, etiquette_bot);
            messageTelegram += isEvolutionContinue;
        }

        let isResume = await bilan.getResume(data, isBilan, etiquette_bot);
        messageTelegram += isResume;


        messageTelegram += "\n*******************************************************\n";

        // Envoie message télégram  
        if(telegram_on == true){
            if(alwaysNotifTelegram == true){
                telegram(messageTelegram);
            }
            else if(notifTelegramOnChangeOnly == true && changement>0){
                telegram(messageTelegram);
            }
            else{
                logger.info(etiquette_bot + "Aucune information n'a été envoyé à Telegram");
            }
        }


        messageTelegram = ""; 
        logger.info("--------------------------------------------------");
        logger.info("--------------------------------------------------");

        if(debug_detail == true){
            utilities.resumeLogsConditions();
        }
        
    });
   
}
  


bot_start();
