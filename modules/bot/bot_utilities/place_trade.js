
const logger = require('../../logger');


const sleepSec = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, (sec * 1000));
    });
};


async function closeTrade(exchangeUtils, exchange, pair, side, quantity, targetPrice, data, etiquette_bot){

    let isCancelOrders = await exchangeUtils.cancelOrderOpen(exchange, data, pair, "etiquette_bot")
    if(isCancelOrders == false){
        logger.error(etiquette_bot + "Impossible de Fermer les position Ouverte Tentative 1");
        sleepSec(data.parametres_generaux.delay_coin);
        let isCancelOrders = await exchangeUtils.cancelOrderOpen(exchange, data, pair, etiquette_bot)
        if(isCancelOrders == false){
            logger.error(etiquette_bot + "Impossible de Fermer les position Ouverte Tentative 2");
            sleepSec(data.parametres_generaux.delay_coin + 1);
            let isCancelOrders = await exchangeUtils.cancelOrderOpen(exchange, data, pair, etiquette_bot)
            if(isCancelOrders == false){
                logger.error(etiquette_bot + "Impossible de Fermer les position Ouverte Tentative 3");
            }
        }
    }

    let trade = await exchangeUtils.closePositionMarketOrder(exchange, pair, side, quantity, etiquette_bot) ;
    if(trade == false){
        logger.error(etiquette_bot + "Impossible de placer le trade Close Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 1");
        sleepSec(data.parametres_generaux.delay_coin);
        let trade = await exchangeUtils.closePositionMarketOrder(exchange, pair, side, quantity, etiquette_bot) ;
        if(trade == false){
            logger.error(etiquette_bot + "Impossible de placer le trade Close Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 2");
            sleepSec(data.parametres_generaux.delay_coin + 1 );
            let trade = await exchangeUtils.closePositionMarketOrder(exchange, pair, side, quantity, etiquette_bot) ;
            if(trade == false){
                logger.error(etiquette_bot + "Impossible de placer le trade Close Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 3");
                sleepSec(data.parametres_generaux.delay_coin + 2);
                logger.info(etiquette_bot + "Tentative de placer le trade en Close Limit Order " + side + " Qte :" + quantity + ' pour : ' + pair );
                let trade = await exchangeUtils.closePositionLimitOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) ;
                if(trade == false){
                    logger.error(etiquette_bot + "Impossible de placer le trade Close Limit Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Abandon");
                    return false;
                }
                else{
                    logger.info(etiquette_bot + "Trade Limit Close Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
                    return trade;
                }
            }
            else{
                logger.info(etiquette_bot + "Trade Market Close Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
                return trade;
            }
        }
        else{
            logger.info(etiquette_bot + "Trade Market Close Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
            return trade;
        }
    }
    else{
        logger.info(etiquette_bot + "Trade Market Close Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
        return trade;
    }

}



async function openTrade(exchangeUtils, exchange, pair, side, quantity, targetPrice, data, etiquette_bot){
    let trade = await exchangeUtils.createMarketOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) ;
    if(trade == false){
        logger.error(etiquette_bot + "Impossible de placer le trade Open Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 1");
        sleepSec(data.parametres_generaux.delay_coin);
        let trade = await exchangeUtils.createMarketOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) ;
        if(trade == false){
            logger.error(etiquette_bot + "Impossible de placer le trade Open Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 2");
            sleepSec(data.parametres_generaux.delay_coin + 1);
            let trade = await exchangeUtils.createMarketOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) ;
            if(trade == false){
                logger.error(etiquette_bot + "Impossible de placer le trade Open Market Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Tentative 3");
                sleepSec(data.parametres_generaux.delay_coin + 2);
                logger.info(etiquette_bot + "Tentative de placer le trade en Open Limit Order " + side + " Qte :" + quantity + ' pour : ' + pair );
                
                let trade = await exchangeUtils.createLimitOrder(exchange, pair, side, quantity, targetPrice, etiquette_bot) ;
                if(trade == false){
                    logger.error(etiquette_bot + "Impossible de placer le trade Open Limit Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Abandon");
                    return false;
                }
                else{
                    logger.info(etiquette_bot + "Trade Limit Open Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
                    return trade;
                }
            }
            else{
                logger.info(etiquette_bot + "Trade Market Open Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
                return trade;
            }
        }
        else{
            logger.info(etiquette_bot + "Trade Market Open Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
            return trade;
        }
    }
    else{
        logger.info(etiquette_bot + "Trade Market Open Order " + side + " Qte :" + quantity + ' pour : ' + pair + " Placer avec Success");
        return trade;
    }
}
module.exports = { closeTrade, openTrade};

