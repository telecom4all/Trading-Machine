const logger = require('../../logger');

async function open_long(row, config, indicatorsValues) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;

    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    if (debug_detail === true) {
        logger.info(etiquette_bot + "---------------  open_long  --------------- ");
        logger.info(etiquette_bot + "close_n1:" +  row.close_n1 + " bbands_upper_n1:" + row.bbands_upper_n1 );
        logger.info(etiquette_bot + " close:" + row.close + " bbands_upper:" + row.bbands_upper );
        logger.info(etiquette_bot + "bbands_upper_n1:" + row.bbands_upper_n1 + " bbands_lower_n1:" + row.bbands_lower_n1 + " min_bol_spread_bollinger:" + config.min_bol_spread_bollinger );
        logger.info(etiquette_bot + "long_ma:" + row.long_ma);
    }

    if(
        (row.close_n1 < row.bbands_upper_n1) 
        &&(row.close > row.bbands_upper) 
        &&(( (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1 ) > config.min_bol_spread_bollinger)
        &&(row.close > row.long_ma)
    ){
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Long True");
        } 
        return true;
    }
    else{
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Long true");
        }  
        return false;
    }
    
}


async function close_long(row, config, indicatorsValues) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    if (debug_detail === true) {
        logger.info(etiquette_bot + "---------------  close_long  --------------- ");
        logger.info(etiquette_bot + " close:" + row.close + " long_ma:" + row.long_ma );
    }
    if(
        (row.close < row.long_ma)
    ){
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Close Long True");
        }
        return true;
    }
    else{
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Close Long False");
        }  
        return false;
    }

}

async function open_short(row, config, indicatorsValues) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    if (debug_detail === true) {
        logger.info(etiquette_bot + "---------------  open_short  --------------- ");
        logger.info(etiquette_bot + "close_n1:" +  row.close_n1 + " bbands_upper_n1:" + row.bbands_upper_n1 );
        logger.info(etiquette_bot + "close:" + row.close + " bbands_upper:" + row.bbands_upper );
        logger.info(etiquette_bot + "bbands_upper_n1:" + row.bbands_upper_n1 + " bbands_lower_n1:" + row.bbands_lower_n1 + " min_bol_spread_bollinger:" + config.min_bol_spread_bollinger );
        logger.info(etiquette_bot + "long_ma:" + row.long_ma);
    }
    if(
        (row.close_n1 > row.bbands_lower_n1) 
        &&(row.close < row.bbands_lower) 
        &&(( (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1 ) > config.min_bol_spread_bollinger)
        &&(row.close < row.long_ma)
    ){
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Short True");
        }
        return true;
    }
    else{
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Short False");
        }  
        return false;
    }

}

async function close_short(row, config, indicatorsValues) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    
    if (debug_detail === true) {
        logger.info(etiquette_bot + "---------------  close_short  --------------- ");
        logger.info(etiquette_bot + " close:" + row.close + " long_ma:" + row.long_ma );
    }
    if(
        (row.close > row.long_ma)
    ){
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Close Short True");
        }
        return true;
    }
    else{
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Close Short False");
        }  
        return false;
    }
}
module.exports = { open_long, close_long, open_short, close_short };