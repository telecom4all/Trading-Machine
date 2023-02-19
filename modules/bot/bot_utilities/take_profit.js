
const logger = require('../../logger');


const sleepSec = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, (sec * 1000));
    });
};


async function placeTakeProfit(exchangeUtils, exchange, pair, type_trade, quantity_total, currentPrice, data, etiquette_bot){
    if(data.parametre_strategie_generaux.nb_tp == 1){
        let quantity;
        let tpPrice;
        let side;
        if(type_trade == "long"){
            let quantity_tp_1 = quantity_total / 2                                 
            let pct_quantity_tp_1 = (quantity_tp_1 * 5) / 100 
            let quantity_tp_1_final = quantity_tp_1 - pct_quantity_tp_1
            let ActualPrice = currentPrice
            let price = ActualPrice + (data.parametre_strategie_generaux.tp_1 * ActualPrice);
            tpPrice = await exchangeUtils.convert_price_to_precision(exchange, pair, price  , data)
            quantity = quantity_tp_1_final * tpPrice;
            side = "buy";
             
        }
        if(type_trade == "short"){
            console.log("TP Short")
            let quantity_tp_1 = quantity_total / 2                                 
            let pct_quantity_tp_1 = (quantity_tp_1 * 5) / 100 
            let quantity_tp_1_final = quantity_tp_1 - pct_quantity_tp_1
        
            let ActualPrice = currentPrice
            let price = ActualPrice - (data.parametre_strategie_generaux.tp_1 * ActualPrice);
            tpPrice = await exchangeUtils.convert_price_to_precision(exchange, pair, price  , data)
            quantity = quantity_tp_1_final * tpPrice
            side = "sell";
        }

        try {
            let maxTentative = 3;
            for (let tentative = 0; tentative < maxTentative; tentative++) {
                logger.info(etiquette_bot + 'Placement du Take Profit pour : ' + type_trade + ' sur ' + pair + ' tentative : ' + tentative);
                const takeProfit = await exchangeUtils.createTakeProfitMarkerOrder(exchange, pair, side, quantity, tpPrice, etiquette_bot);
                if(takeProfit != false){
                    logger.info(etiquette_bot + 'Take Profit pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
                    if(data.parametres_generaux.debug == true){
                        console.log(takeProfit);
                    }
                    return true;
                }
                else{
                    logger.error(etiquette_bot + "Erreur lors de la création du TP Tentative + " + tentative + " pour " + pair);

                    if(tentative == maxTentative){
                        logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity + ' pour : ' + pair + " Abandon ...");
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

    if(data.parametre_strategie_generaux.nb_tp == 2){
        let quantity1;
        let tpPrice1;
        let quantity2;
        let tpPrice2;
        let side;
        if(type_trade == "long"){
            side = "buy";
            let quantity_tp_1 = quantity_total / 3                                 
            let pct_quantity_tp_1 = (quantity_tp_1 * 5) / 100 
            let quantity_tp_1_final = quantity_tp_1 - pct_quantity_tp_1
            let ActualPrice = currentPrice
            
            let price1 = ActualPrice + (data.parametre_strategie_generaux.tp_1 * ActualPrice);
            tpPrice1 = await exchangeUtils.convert_price_to_precision(exchange, pair, price1  , data)
            quantity1 = quantity_tp_1_final * tpPrice1;

            let price2 = ActualPrice + (data.parametre_strategie_generaux.tp_2 * ActualPrice);
            tpPrice2 = await exchangeUtils.convert_price_to_precision(exchange, pair, price2  , data)
            quantity2 = quantity_tp_1_final * tpPrice2;
        }
        if(type_trade == "short"){
            side = "sell";
            let quantity_tp_1 = quantity_total / 3                                 
            let pct_quantity_tp_1 = (quantity_tp_1 * 5) / 100 
            let quantity_tp_1_final = quantity_tp_1 - pct_quantity_tp_1
            let ActualPrice = currentPrice
            
            let price1 = ActualPrice - (data.parametre_strategie_generaux.tp_1 * ActualPrice);
            tpPrice1 = await exchangeUtils.convert_price_to_precision(exchange, pair, price1  , data)
            quantity1 = quantity_tp_1_final * tpPrice1;

            let price2 = ActualPrice - (data.parametre_strategie_generaux.tp_2 * ActualPrice);
            tpPrice2 = await exchangeUtils.convert_price_to_precision(exchange, pair, price2  , data)
            quantity2 = quantity_tp_1_final * tpPrice2;
        }

        let isTP1;
        let isTP2;


        try {
            let maxTentative = 3;
            for (let tentative = 0; tentative < maxTentative; tentative++) {
                logger.info(etiquette_bot + 'Placement du Take Profit pour : ' + type_trade + ' sur ' + pair + ' tentative : ' + tentative);
                const takeProfit = await exchangeUtils.createTakeProfitMarkerOrder(exchange, pair, side, quantity1, tpPrice1, etiquette_bot);
                if(takeProfit != false){
                    logger.info(etiquette_bot + 'Take Profit pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
                    if(data.parametres_generaux.debug == true){
                        console.log(takeProfit);
                    }
                    isTP1 = true;
                    break; // Sortir de la boucle for
                }
                else{
                    logger.error(etiquette_bot + "Erreur lors de la création du TP Tentative + " + tentative + " pour " + pair);

                    if(tentative == maxTentative){
                        logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity1 + ' pour : ' + pair + " Abandon ...");
                        isTP1 = false;    
                    }else{
                        sleepSec(data.parametres_generaux.delay_coin + tentative);

                    }
                    
                
                }
            } 
        } catch (error) {
            logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity + ' pour : ' + pair + " Abandon");
            console.log(error);
            isTP1 = false;
        }

        try {
            let maxTentative = 3;
            for (let tentative = 0; tentative < maxTentative; tentative++) {
                logger.info(etiquette_bot + 'Placement du Take Profit pour : ' + type_trade + ' sur ' + pair + ' tentative : ' + tentative);
                const takeProfit = await exchangeUtils.createTakeProfitMarkerOrder(exchange, pair, side, quantity2, tpPrice2, etiquette_bot);
                if(takeProfit != false){
                    logger.info(etiquette_bot + 'Take Profit pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
                    if(data.parametres_generaux.debug == true){
                        console.log(takeProfit);
                    }
                    isTP2 = true;
                    break; // Sortir de la boucle for
                }
                else{
                    logger.error(etiquette_bot + "Erreur lors de la création du TP Tentative + " + tentative + " pour " + pair);

                    if(tentative == maxTentative){
                        logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity2 + ' pour : ' + pair + " Abandon ...");
                        isTP2 = false;    
                    }else{
                        sleepSec(data.parametres_generaux.delay_coin + tentative );

                    }
                    
                
                }
            } 
        } catch (error) {
            logger.error(etiquette_bot + "Impossible de placer le TP, Qte :" + quantity + ' pour : ' + pair + " Abandon");
            console.log(error);
            isTP2 = false;
        }


        if(isTP1 == true && isTP2 == true){
            return true;
        }
        if(isTP1 == false && isTP2 == true){
            logger.info(etiquette_bot + 'Take Profit 1 pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
            logger.error(etiquette_bot + "Erreur lors de la création du TP 2  pour " + pair);
            return true;
        }
        if(isTP1 == true && isTP2 == false){
            logger.info(etiquette_bot + 'Take Profit 2 pour : ' + type_trade + ' sur ' + pair + ' placé avec succès :');
            logger.error(etiquette_bot + "Erreur lors de la création du TP 1  pour " + pair);
            return true;
        }
        if(isTP1 == false && isTP2 == false){
            return false;
        }

    }


    
      
}



module.exports = { placeTakeProfit };

