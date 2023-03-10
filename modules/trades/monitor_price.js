const ccxt = require('ccxt');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');
const telegram = require('../telegram');
const cron = require("node-cron");

const config = require('../config');
const path_file = path.resolve(__dirname, '..', '..');
const configFile = path.join(path_file, './jsons/configs/config_secret.json');
const configSecret = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const tradesFile = path.join(path_file, './jsons/data/processTrades.json');

let etiquette_bot = "\x1b[38;2;255;165;0mTrade Manuel :\x1b[0m ";
let task_trade;

const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };


async function placeTrade(currentPrice, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange, pid, exchangeSelected, exchangeUtils, etiquette_bot) {
  let pair_process = pair;
  pair = pair+":USDT";
  let isTelegram = config.retour_telegram.telegram_on
  let messageTelegram = "";
  let debug = config.parametres_generaux.debug;
  let stableCoin = config.parametre_strategie_generaux.stableCoin;
  console.log(" timeframe: " + timeframe)
  console.log(" price: " + price)
  console.log(" position: " + position)
  console.log(" amount: " + amount)
  console.log(" tp_percentage: " + tp_percentage)
  console.log(" tp_amount: " + tp_amount)
  console.log(" sl_percentage: " + sl_percentage)
  console.log(" tp_switch: " + tp_switch)
  console.log(" sl_switch: " + sl_switch)
  console.log(" pair: " + pair)
  console.log(" pid: " + pid)
  
  /* Get Balance */
  let balanceWallet = await exchangeUtils.getBalance(exchangeSelected, etiquette_bot);
  logger.info(etiquette_bot + "Balance Wallet: " + balanceWallet + " " + stableCoin);  


  /* Get Data Exchange */
  var isMarketLoaded = await exchangeUtils.loadMarkets(exchangeSelected, etiquette_bot)
  if(isMarketLoaded == true){
      logger.info(etiquette_bot + "Marché Chargé")
  }
  else{
      logger.error(etiquette_bot + isMarketLoaded);
  }

  let side;
  let targetPrice;
  let quantity;

  try {
    quantity =  await exchangeUtils.convert_amount_to_precision(exchangeSelected, pair, amount / price, "");
    targetPrice = await exchangeUtils.convert_price_to_precision(exchangeSelected, pair, price, "")
    
    if(position === 'long'){
        side = "buy";
    }
    else if(position === 'short'){
        side ="sell";
    }
  } catch (error) {
    logger.error(etiquette_bot + error);
  }
  
  try {
    logger.info(`pair: ${pair} side: ${side} quantity: ${quantity} targetPrice: ${targetPrice}`);
    let trade = await exchangeUtils.createMarketOrder(exchangeSelected, pair, side, quantity, targetPrice, etiquette_bot) 
    if(trade != false){
        logger.info(etiquette_bot + 'Trade effectué avec succès :');
        messageTelegram += "Trade pour : " + pair + " placer avec succéss\n";
        if(debug == true){
            console.log(trade);
        }
    }
    else{
        logger.error(etiquette_bot + "Erreur lors de la création du trade");
        messageTelegram += "Trade pour : " + pair + " n'a pas su être placé\n";
        return;
    }
  } catch (error) {
    logger.error(etiquette_bot + 'Erreur lors du placement du trade : ' + error);
    messageTelegram += "Trade pour : " + pair + " n'a pas su être placé\n";
  }

  await sleep(250);
  if(tp_switch) {
    try {
        let tpPrice;
        if(position === 'long'){
            tpPrice =  parseFloat(currentPrice) + (parseFloat(tp_percentage) * parseFloat(currentPrice));
        }
        else if(position === 'short'){
            tpPrice = parseFloat(currentPrice )- (parseFloat(tp_percentage) * parseFloat(currentPrice));
        }   
        tpPrice = await exchangeUtils.convert_price_to_precision(exchangeSelected, pair, tpPrice, "")
        let quantity_tp =  await exchangeUtils.convert_amount_to_precision(exchangeSelected, pair, tp_amount / tpPrice, "");

        const takeProfit = await exchangeUtils.createTakeProfitMarkerOrder(exchangeSelected, pair, side, quantity_tp, tpPrice, etiquette_bot);
        if(takeProfit != false){
            logger.info(etiquette_bot + 'Take Profit placé avec succès :');
            messageTelegram += "TP pour : " + pair + " placer avec succéss\n";
            if(debug == true){
                console.log(takeProfit);
            }
        }
        else{
            logger.error(etiquette_bot + "Erreur lors de la création du TP");
            messageTelegram += "TP pour : " + pair + " n'a pas su être placé\n";
            //return;
        }
        

    } catch (error) {
        logger.error(etiquette_bot + 'Erreur lors du placement du TP : ' + error);  
        messageTelegram += "TP pour : " + pair + " n'a pas su être placé\n";  
    }
 }

 await sleep(250);
 if(sl_switch) {
    try {
        let slPrice;
        if(position === 'long'){
            slPrice = parseFloat(currentPrice) - (parseFloat(sl_percentage) * parseFloat(currentPrice));
        }
        else if(position === 'short'){
            slPrice = parseFloat(currentPrice)+ (parseFloat(sl_percentage) * parseFloat(currentPrice));
        }
        slPrice = await exchangeUtils.convert_price_to_precision(exchangeSelected, pair, slPrice, "")
        let quantity_sl =  await exchangeUtils.convert_amount_to_precision(exchangeSelected, pair, amount / slPrice, "");
        const stopLoss = await exchangeUtils.createStopLostMarkerOrder(exchangeSelected, pair, side, quantity_sl, slPrice, etiquette_bot);
        if(stopLoss != false){
            logger.info(etiquette_bot + 'Stop Loss placé avec succès :');
            messageTelegram += "SL pour : " + pair + " placer avec succéss\n";
            if(debug == true){
                console.log(stopLoss);
            }
        }
        else{
            messageTelegram += "SL pour : " + pair + " n'a pas su être placé\n";  
            logger.error(etiquette_bot + "Erreur lors de la création du SL");
            //return;
        }
        
    } catch (error) {
        messageTelegram += "SL pour : " + pair + " n'a pas su être placé\n";  
        logger.error(etiquette_bot + 'Erreur lors du placement du SL : ' + error);    
    }
    task_trade.stop();    
 }

 delete_pid(pid);
 if(isTelegram == true){
    telegram(messageTelegram);
    messageTelegram = "";
 }
 
}


async function delete_pid(pid){
  
  fs.readFile(tradesFile, (err, data) => {
    if (err) {
        logger.error(etiquette_bot + 'Erreur lors de la lecture du fichier processTrades.json : ' + err);  
        return;     
    }
    const trades = JSON.parse(data);
    try {
        delete list[pid];
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur lors de la suppression du trade avec l id: ' + pid + ' dans processTrades.json : ' + err); 
    }
    console.log(trades)
    fs.writeFile(tradesFile, JSON.stringify(trades, null, 4), (err) => {
        if (err){
            logger.error(etiquette_bot + 'Erreur lors de l enregistrement du fichier processTrades.json : ' + err);  
            return;     
        }
        logger.info(etiquette_bot + 'Trade supprimé avec success'); 
    });
    
  });
}

async function monitor_price(timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchangeReq) {
    const pid = process.pid;
    etiquette_bot = etiquette_bot + " PID: " + pid + " ";
    let debug = config.parametres_generaux.debug;
    let exchangeUtils;
    let exchangeSelected;

    const exchangeInfo = configSecret.exchanges.find(exchange => exchange.name === exchangeReq);
    config.exchangeInfo = exchangeInfo;


    if(exchangeInfo.exchange  == "BITGET"){
        exchangeUtils = require('../bot/exchanges/bitget');
        try {
            exchangeSelected = exchangeUtils.initBitget(config, "");   
            logger.info(etiquette_bot + 'Bitget initialisé avec success');  
        } catch (error) {
            logger.error(etiquette_bot + error);    
            return;
        }
    }
    if(exchangeInfo.exchange  == "BINANCE"){
        exchangeUtils = require('../bot/exchanges/binance');
        try {
            exchangeSelected = exchangeUtils.initBinance(config, "");   
            logger.info(etiquette_bot + 'Binance initialisé avec success');  
        } catch (error) {
            logger.error(etiquette_bot + error);    
            return;
        }
    }
    

    const selectedTimeFrame = config.timeFrames.find(tf => tf.abbreviation === timeframe);
    if (!selectedTimeFrame) {
        console.error(`Error: Invalid time frame selection: ${config.timeFrames}`);
        return;
    }
    

    // Boucle infinie pour surveiller le prix en temps réel
    //let isRuning = true;
    task_trade = cron.schedule(selectedTimeFrame.cronSyntax, async () => {
        // Récupération du dernier prix du ticker
      let currentPrice = await exchangeUtils.getPriceToken(exchangeSelected, pair + ":" + config.parametre_strategie_generaux.stableCoin, config)
      try {
        const candle = await exchangeUtils.getDataTradeManuel(exchangeSelected, pair + ":" + config.parametre_strategie_generaux.stableCoin, timeframe, config);
        if(candle == false){
            logger.error(etiquette_bot + "erreur lors de la récupération des data de l'exchange");
            return;
        }
            // Récupération de la dernière bougie
        const lastCandle = candle[candle.length - 1];
        // Récupération de la bougie précédente
        const prevCandle = candle[candle.length - 2];
        
        if(debug == true){
           logger.info(etiquette_bot + "Pair:" + pair + " Current Price: " + currentPrice + " Target Price:" + price ); 
        }
        

        // Vérification si le prix actuel est supérieur ou inférieur (en fonction de la position) au prix cible
        // Et si la dernière bougie s'est clôturée au-dessus ou en dessous (en fonction de la position) du prix cible
        // Et si la bougie précédente s'est clôturée au-dessus ou en dessous (en fonction de la position) du prix cible
        if (
            (position === "long" && currentPrice >= price && lastCandle[4] >= price && prevCandle[4] <= price) ||
            (position === "short" && currentPrice <= price && lastCandle[4] <= price && prevCandle[4] >= price)
        ){
            try {
                // Appel de la fonction placeTrade si les conditions ci-dessus sont remplies 
                placeTrade(
                    currentPrice,
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
                    exchange,
                    pid,
                    exchangeSelected,
                    exchangeUtils,
                    etiquette_bot
                    );

                        
            } catch (error) {
                // En cas d'erreur lors de la récupération des données OHLCV, affichage d'un message d'erreur
                logger.error(`Erreur lors de la récupération des données OHLCV : ${error}`);      
            }    
        }

        } catch (error) {
            // En cas d'erreur lors de la récupération des données OHLCV, affichage d'un message d'erreur
            logger.error(`Erreur lors de la récupération des données OHLCV : ${error}`);  
        }
        // Temporisation de 5 secondes avant la prochaine itération de la boucle
        await new Promise(resolve => setTimeout(resolve, 5000));
    });
   // while (isRuning) {
      
   // }
  }
  


monitor_price(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7], process.argv[8], process.argv[9], process.argv[10], process.argv[11], process.argv[12]);