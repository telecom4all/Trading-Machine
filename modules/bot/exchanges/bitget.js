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
        
        let exchange = new ccxt.bitget({
            apiKey: configSecret.bitget.apiKey,
            secret: configSecret.bitget.secret,
            password: configSecret.bitget.password,
            options: {
                defaultType: 'swap'
            }
        });
        exchange.enableRateLimit = true
        // enable either of the following two lines
        exchange.options['warnOnFetchOHLCVLimitArgument'] = false

       // exchange.options['tradesLimit'] = 5000
      //  exchange.options['OHLCVLimit'] = 5000
      //  exchange.options['ordersLimit'] = 5000


        return exchange;
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


function get_timeframe_in_millis(timeframe) {
    const timeframes = require('../../config').timeFrames
    const result = timeframes.find((t) => t.abbreviation === timeframe);
    if (!result) {
      throw new Error(`Invalid timeframe abbreviation: ${timeframe}`);
    }
    return result.interval;
  }

async function getMoreLastHistoricalAsync(exchange, symbol, timeframe, limit, config) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
   
    const maxLimit = 1000; // Nombre maximum de bougies que l'on peut récupérer en une seule requête
    const interval = get_timeframe_in_millis(timeframe)
    const fetchLimit = Math.min(limit, maxLimit); // Le nombre de bougies à récupérer par requête
    let remainingLimit = limit; // Le nombre de bougies restant à récupérer
    let latestTimestamp = Date.now(); // Le timestamp de la bougie la plus récente récupérée

    const dataExchange = []; // Initialisation du tableau qui stockera toutes les données récupérées
    
    
    for (let i = limit; i > 0; i -= 100) { // Boucle pour récupérer toutes les données, de 100 en 100
        const since = latestTimestamp - (100 * interval);

        const sinceTimestamp = new Date(since);
        const formatted_datesince = `${sinceTimestamp.getDate().toString().padStart(2, '0')}/${(sinceTimestamp.getMonth() + 1).toString().padStart(2, '0')}/${sinceTimestamp.getFullYear()}-${sinceTimestamp.getHours().toString().padStart(2, '0')}:${sinceTimestamp.getMinutes().toString().padStart(2, '0')}:${sinceTimestamp.getSeconds().toString().padStart(2, '0')}`;
        
        const result = await exchange.fetchOHLCV(
            symbol, timeframe, since, 100 
          );
          const lastTimestamp = result.pop()[0];
          const firstTimestamp = result.shift()[0];
          
          const datelastTimestamp = new Date(lastTimestamp);
          const formatted_datelastTimestamp = `${datelastTimestamp.getDate().toString().padStart(2, '0')}/${(datelastTimestamp.getMonth() + 1).toString().padStart(2, '0')}/${datelastTimestamp.getFullYear()}-${datelastTimestamp.getHours().toString().padStart(2, '0')}:${datelastTimestamp.getMinutes().toString().padStart(2, '0')}:${datelastTimestamp.getSeconds().toString().padStart(2, '0')}`;
        
          const datefirstTimestamp = new Date(firstTimestamp);
          const formatted_datefirstTimestamp = `${datefirstTimestamp.getDate().toString().padStart(2, '0')}/${(datefirstTimestamp.getMonth() + 1).toString().padStart(2, '0')}/${datefirstTimestamp.getFullYear()}-${datefirstTimestamp.getHours().toString().padStart(2, '0')}:${datefirstTimestamp.getMinutes().toString().padStart(2, '0')}:${datefirstTimestamp.getSeconds().toString().padStart(2, '0')}`;
  
          // Ajout des données récupérées dans le tableau full_result
          dataExchange.push(result);
  
          latestTimestamp = firstTimestamp;

     
    }
  
    let dataFiltrer = [];
    for (const tableau in dataExchange) {
       
        
          for (let i = 0; i < dataExchange[tableau].length; i++) {
           // console.log("****************************")
              let item = dataExchange[tableau][i];
              //console.log(item)
              dataFiltrer.push(item)
            //  console.log("****************************")
          }
        
      }
    const result = dataFiltrer.map((data, index, array) => {
      const date = new Date(data[0]);
      const formatted_date = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}-${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      
      return {
        timestamp: data[0],
        date: formatted_date,
        open: data[1],
        high: data[2],
        low: data[3],
        close: data[4],
        volume: data[5],
        open_n1: (index > 0) ? array[index-1][1] : null,
        high_n1: (index > 0) ? array[index-1][2] : null,
        low_n1: (index > 0) ? array[index-1][3] : null,
        close_n1: (index > 0) ? array[index-1][4] : null,
        volume_n1: (index > 0) ? array[index-1][5] : null,
        open_n2: (index > 1) ? array[index-2][1] : null,
        high_n2: (index > 1) ? array[index-2][2] : null,
        low_n2: (index > 1) ? array[index-2][3] : null,
        close_n2: (index > 1) ? array[index-2][4] : null,
        volume_n2: (index > 1) ? array[index-2][5] : null
      };
    });

    // Tri des données par timestamp
    result.sort((a, b) => a.timestamp - b.timestamp);
    // Retourner l'objet JSON contenant les données triées
    return result;
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
/*
async function cancelOrderOpen(exchange, pair, config) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    let openOrder = await exchange.getOpenOrder(pair);
    if (openOrder.length > 0) {
        for (const order of openOrder) {
            await exchange.cancelOrderById(order['info']['orderId'], pair);
        }
    }
}*/ 

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

async function closePositionMarketOrder(exchange, pair, side, quantity, etiquette_bot) {
    try {
        //let trade = await exchange.createOrder(pair, 'market', 'sell', exchange.amount_to_precision(pair, position.size), undefined, {"reduceOnly": true});
        let trade = await exchange.createOrder(pair, 'market', side, quantity, undefined, {"reduceOnly": true});
        return trade; 
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false;   
    }
}

async function closePositionLimitOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) {
    try {
        let trade = await exchange.createOrder(pair, 'limit', side, quantity, targetPrice, {"reduceOnly": true});  
        return trade; 
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        console.log(error)
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

async function createLimitOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) {
    try {
        
        let trade = await exchange.createOrder(pair, 'limit', side, quantity, targetPrice); 
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
        logger.error(etiquette_bot + error);
        return false;   
    }
}

async function createStopLostMarkerOrder(exchange, pair, side, quantity, slPrice, etiquette_bot) {
    try {
        let sl = await exchange.createOrder(pair, 'market', side, quantity, slPrice, {'stopLossPrice': slPrice });
        return sl; 
    } catch (error) {
        logger.error(etiquette_bot  + error);
        return false;   
    }
}

async function cancelOrderOpen(exchange, configuration, pair, etiquette_bot) {
    try {
      const openOrders = await exchange.fetchOpenOrders(pair);
      if (openOrders.length > 0) {
        for (const order of openOrders) {
          await exchange.cancelOrder(order.id, pair);
        }
        return true;
      }
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
    cancelOrderOpen,
    closePositionLimitOrder,
    closePositionMarketOrder,
    createLimitOrder

};