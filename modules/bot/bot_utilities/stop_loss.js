const logger = require('../../logger');


const sleepSec = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, (sec * 1000));
    });
};


async function placeStopLoss(exchangeUtils, exchange, pair, type_trade, quantity_total, currentPrice, data, etiquette_bot){
    let side;
    let quantity;
    let slPrice;

    if(type_trade == "long"){
        side = "buy";
        let pct_sl = data.parametre_strategie_generaux.sl
        let pct = (currentPrice * pct_sl)
        slPrice = currentPrice - pct
    }

    if(type_trade == "short"){
        side = "sell";
        let pct_sl = data.parametre_strategie_generaux.sl
        let pct = (currentPrice * pct_sl)
        slPrice = currentPrice + pct
    }
    
    
    try {
        let maxTentative = 3;
        for (let tentative = 0; tentative < maxTentative; tentative++) {
            logger.info(etiquette_bot + 'Placement du Stop Loss pour : ' + type_trade + ' sur ' + pair + ' tentative : ' + tentative);
            const stopLoss = await exchangeUtils.createStopLostMarkerOrder(exchange, pair, side, quantity_total, slPrice, etiquette_bot);
            if(stopLoss != false){
                logger.info(etiquette_bot + 'Stop Loss pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
                if(data.parametres_generaux.debug == true){
                    console.log(stopLoss);
                }
                return true;
            }
            else{
                logger.error(etiquette_bot + "Erreur lors de la création du SL Tentative + " + tentative + " pour " + pair);

                if(tentative == maxTentative){
                    logger.error(etiquette_bot + "Impossible de placer le SL, Qte :" + quantity + ' pour : ' + pair + " Abandon ...");
                    return false;    
                }else{
                    sleepSec(data.parametres_generaux.delay_coin + tentative );

                }
                
            
            }
        } 
    } catch (error) {
        logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity + ' pour : ' + pair + " Abandon");
        console.log(error);
        return false; 
    }

}


module.exports = { placeStopLoss };