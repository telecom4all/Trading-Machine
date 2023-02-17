const ccxt = require('ccxt');
const path = require('path');
const fs = require('fs');
const DataFrame = require("pandas-js").DataFrame;



const logger = require('../../logger');
const telegram = require('../../telegram');


const path_bot = path.resolve(__dirname, '..', '..', '..');

const configFile = path.join(path_bot, 'jsons/configs/config_secret.json');
const configSecret = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

 
// Initialisation de Bitget
function initBitget(config, start) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    try {
        if(start && start == true){
           logger.info(etiquette_bot + "CCXT Version : " + ccxt.version); 
        }
        
        return new ccxt.bitget({
            apiKey: configSecret.bitget.apiKey,
            secret: configSecret.bitget.secret,
            password: configSecret.bitget.password,
            options: {
                defaultType: 'swap'
            }
        });
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return "error";
    }
}




// Récupération du solde
async function getBalance(currentExchange, botName){
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    try {
        

        const balance = await currentExchange.fetchBalance();
        const usdEquity = balance.info[0].usdtEquity;
        return usdEquity;
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return "error";
    }
}

// Chargement des marchés
async function loadMarkets(currentExchange, botName) {
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    try {
        let ismarket = await currentExchange.loadMarkets();
        
        return true;
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return "error";
    }
}


async function getMoreLastHistoricalAsync(exchange, symbol, timeframe, limit, config) {
    const maxThreads = 4;
    const poolSize = Math.ceil(limit / 100);
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
   
        let fullResult = [];
    
        async function worker(i) {
            try {
                let timestamp = Math.round(Date.now() / 1000) - (i * 1000 * 60 * 60);
                await sleep(exchange.rateLimit);
                let dataWorker = await exchange.fetchOHLCV(symbol, timeframe);
                dataWorker.forEach(data => {
                    data[6] = new Date(data[0]).toLocaleString();
                });
                return dataWorker;
            } catch (err) {
                logger.error(etiquette_bot + 'Error on last historical for ' + symbol + " : " + err);
            }
        }
    
        const pool = [];
        for (let i = 0; i < poolSize; i++) {
            pool.push(worker(i));
        }
    
        fullResult = await Promise.all(pool);
        fullResult = fullResult.filter(value => value !== undefined);
        fullResult = fullResult.reduce((acc, cur) => acc.concat(cur), []);
    
        fullResult.sort((a, b) => a[0] - b[0]);
        
        const data = new DataFrame(fullResult, ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'datetime']);
     
        if (data.empty) {
            logger.error(etiquette_bot + 'Data frame is empty');
            return null;
        }
        
        let nouveaux_noms = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'datetime'];
        data.columns = nouveaux_noms;
        
        return data;
   
}





async function getDataExchange(pairList, exchange, config) {
    const stableCoin = config.parametre_strategie_generaux.stableCoin;
    const timeframe = config.parametre_strategie_generaux.timeframe;
    const nbOfCandles = config.parametre_strategie_generaux.nbOfCandles;
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const telegram_on = config.retour_telegram.telegram_on;

    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    let dfList = {};
    for (let i = 0; i < pairList.length; i++) {
        let pair = pairList[i];
        if (debug === true) {
            logger.info(etiquette_bot + 'Récupération des informations sur l\exchange pour ' + pair+":"+stableCoin);
        }
       
        //Essai 1
        if (debug_detail === true) {
            logger.info(etiquette_bot + 'Tentative de récupération des donnée pour : ' + pair+":"+stableCoin + " essaie 1" );
        }
        let candel = parseInt(nbOfCandles);
        let df = await getMoreLastHistoricalAsync(exchange, pair+":"+stableCoin, timeframe, candel, config);
        if (!df || df.empty) {
            if (debug === true) {
                logger.error(etiquette_bot + 'Erreur: Impossible de récupéré les donnée pour : ' + pair+":"+stableCoin + " essaie 1" );
            }
            await sleep(parseInt(delay_coin) + 1);
            //Essai 2
            if (debug_detail === true) {
                logger.info(etiquette_bot + 'Tentative de récupération des donnée pour : ' + pair+":"+stableCoin + " essaie 2" );
            }
            let candel = (parseInt(nbOfCandles) - parseInt(nbOfCandles * 0.5));
            let df = await getMoreLastHistoricalAsync(exchange, pair+":"+stableCoin, timeframe, candel, config);
            if (!df || df.empty) {
                if (debug === true) {
                    logger.error(etiquette_bot + 'Erreur: Impossible de récupéré les donnée pour : ' + pair+":"+stableCoin + " essaie 2" );
                }
                await sleep(parseInt(delay_coin) + 2);
                //Essai 3
                let candel = (parseInt(nbOfCandles) - parseInt(nbOfCandles * 0.75));
                let df = await getMoreLastHistoricalAsync(exchange, pair+":"+stableCoin, timeframe,  candel, config);
                if (!df || df.empty) {
                    if (debug === true) {
                        logger.error(etiquette_bot + 'Erreur: Impossible de récupéré les donnée pour : ' + pair+":"+stableCoin + " essaie 3" );
                    }
                    try {
                        if (debug === true) {
                            logger.error(etiquette_bot + "Trop de tentative on supprime de la liste pour cette itération la pair : " + pair+":"+stableCoin);
                            telegram("Trop de tentative on supprime de la liste pour cette itération la pair : " + pair+":"+stableCoin);  
                        }
                        delete dfList[pair+":"+stableCoin];
                    } catch (err) {
                        logger.error(etiquette_bot + err);
                        
                    }
                }
                else{
                    dfList[pair.replace("/USDT", "")] = df;
                }
            }
            else{
                dfList[pair.replace("/USDT", "")] = df;
            }

        }
        else{
            dfList[pair.replace("/USDT", "")] = df;
        }
        
    }
    return dfList;
}

async function getNbOpenPositionAll(exchange, config) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    try {
        const positions = await exchange.fetchPositions();
        const truePositions = [];
        positions.forEach(function(position) {
            if (parseFloat(position.contracts) > 0) {
                truePositions.push(position);
            }
        });
        await new Promise(resolve => setTimeout(resolve, parseInt(delay_coin)));

        const openPositions = truePositions.length;
        return openPositions;
    } catch (e) {
        logger.error(etiquette_bot + e);
    }
}

async function getAllOpenPositionDatas(exchange, config) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    try {
        const positions = await exchange.fetchPositions();
        const truePositions = [];
        positions.forEach(function(position) {
            if (parseFloat(position.contracts) > 0) {
                truePositions.push(position);
            }
        });
        await new Promise(resolve => setTimeout(resolve, parseInt(delay_coin)));
        
        return truePositions;
    } catch (e) {
        logger.error(etiquette_bot + e);
    }
}

async function getOpenPositionCoin(symbol, config) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    try {
        const positions = await self._session.fetchPositions(symbol);
        const truePositions = [];
        for (const position of positions) {
            if (parseFloat(position.contractSize) > 0) {
                truePositions.push(position);
            }
        }
        return truePositions;
    } catch (err) {
        logger.error( etiquette_bot +'An error occured in getOpenPosition: ');
        console.log(err);
    }
}

async function cancelOrderOpen(exchange, pair, config) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    let openOrder = await exchange.getOpenOrder(pair);
    if (openOrder.length > 0) {
        for (const order of openOrder) {
            await exchange.cancelOrderById(order['info']['orderId'], pair);
        }
    }
}

async function convert_amount_to_precision(exchange, symbol, amount, config) {
    return exchange.amount_to_precision(symbol, amount);
}

async function convert_price_to_precision(exchange, symbol, price, config) {
    return exchange.price_to_precision(symbol, price);
}

// Récupération du prix token
async function getPriceToken(exchange, pair, config){
 
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
     try {
        
        let ticker = await exchange.fetchTicker(pair );
        const currentPrice = ticker.last
        return currentPrice
     
        
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;
    }
}

async function getDataTradeManuel(exchange, pair, timeframe, config){
    
    try {
        let data = await exchange.fetchOHLCV(pair, timeframe, undefined, undefined,{ candleInterval: timeframe });
        return data;    
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;   
    }
}

async function createMarketOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) {
    try {
        let trade = await exchange.createOrder(pair, 'market', side, quantity, targetPrice); 
        return trade; 
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;   
    }
}

async function createTakeProfitMarkerOrder(exchange, pair, side, quantity_tp, tpPrice, etiquette_bot) {
    try {
        let tp = await exchange.createOrder(pair, 'market', side, quantity_tp, tpPrice, {'takeProfitPrice': tpPrice});
        return tp; 
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;   
    }
}

async function createStopLostMarkerOrder(exchange, pair, side, quantity, slPrice, etiquette_bot) {
    try {
        let sl = await exchange.createOrder(pair, 'market', side, quantity, slPrice, {'stopLossPrice': slPrice });
        return sl; 
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;   
    }
}


module.exports = { 
    initBitget,
    getBalance, 
    loadMarkets, 
    getMoreLastHistoricalAsync, 
    getDataExchange, 
    getNbOpenPositionAll, 
    getOpenPositionCoin, 
    cancelOrderOpen, 
    getAllOpenPositionDatas,
    convert_amount_to_precision,
    convert_price_to_precision,
    getPriceToken,
    getDataTradeManuel,
    createMarketOrder,
    createTakeProfitMarkerOrder,
    createStopLostMarkerOrder,
    

};