const logger = require('../../logger');

const code_av = "\x1b[35m";
const code_ap = "\x1b[0m "

async function open_long(row, config, indicatorsValues) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;

    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    const dateStart = new Date();
    const dateStartString = dateStart.toLocaleDateString() + " " + dateStart.toLocaleTimeString();
    let calculBand = (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1;


    if (debug_detail === true) {
        logger.info(etiquette_bot  + "====================================================================")
        let detail_log = `${code_av}
        ***********************************open_long: ${dateStartString}****************************************************************************
        ** 
        ** row.close_n1 < row.bbands_upper_n1                                             ->  ${row.close_n1} < ${row.bbands_upper_n1} ?                                   --> ${row.close_n1 < row.bbands_upper_n1}
        ** row.close > row.bbands_upper                                                   ->  ${row.close} > ${row.bbands_upper}                                           --> ${row.close > row.bbands_upper}
        ** calculBand = (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1 -> (${row.bbands_upper_n1} - ${row.bbands_lower_n1} ) / ${row.bbands_lower_n1}   --> ${(row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1}
        ** calculBand > indicatorsValues.min_bol_spread_bollinger                                   -> ${calculBand} > ${indicatorsValues.min_bol_spread_bollinger}                            --> ${calculBand > indicatorsValues.min_bol_spread_bollinger}  
        ** row.close > row.long_ma                                                        -> ${row.close} > ${row.long_ma}                                                 --> ${row.close > row.long_ma }
        *********************************************************************************************************************************************
        ${code_ap}`;
        
        logger.info(etiquette_bot  + detail_log)

        logger.info(etiquette_bot  + " " +  (row.close_n1 < row.bbands_upper_n1))
        logger.info(etiquette_bot  + " " +   (row.close > row.bbands_upper))
        logger.info(etiquette_bot  + " " +   (calculBand > indicatorsValues.min_bol_spread_bollinger))
        logger.info(etiquette_bot  + " " +   (row.close > row.long_ma))

        logger.info(etiquette_bot  + "====================================================================")

    }

    if(
        (row.close_n1 < row.bbands_upper_n1) 
        &&(row.close > row.bbands_upper) 
        &&(calculBand > indicatorsValues.min_bol_spread_bollinger)
        &&(row.close > row.long_ma)
    ){
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Long True");
        } 
        return true;
    }
    else{
        if (debug_detail === true) {
            logger.info(etiquette_bot + "Open Long False");
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

    const dateStart = new Date();
    const dateStartString = dateStart.toLocaleDateString() + " " + dateStart.toLocaleTimeString();
    
    if (debug_detail === true) {
        logger.info(etiquette_bot  + "====================================================================")
        let detail_log = `${code_av}
        ***********************************close_long: ${dateStartString}*****************************************
        ** 
        ** row.close < row.long_ma       ->  ${row.close} < ${row.long_ma} ?        --> ${row.close < row.long_ma}
        ************************************************************************************************************
        ${code_ap}`;
        
        logger.info(etiquette_bot  + detail_log)
        logger.info(etiquette_bot  + " " + (row.close < row.long_ma))
        
        logger.info(etiquette_bot  + "====================================================================")
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
    const dateStart = new Date();
    const dateStartString = dateStart.toLocaleDateString() + " " + dateStart.toLocaleTimeString();
    let calculBand = (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1;

    if (debug_detail === true) {
        logger.info(etiquette_bot  + "====================================================================")
        let detail_log = `${code_av}
        ***********************************open_short: ${dateStartString}****************************************************************************
        ** 
        ** row.close_n1 > row.bbands_lower_n1                                             ->  ${row.close_n1} > ${row.bbands_upper_n1} ?                                   --> ${row.close_n1 > row.bbands_upper_n1}
        ** row.close < row.bbands_lower                                                   ->  ${row.close} < ${row.bbands_lower}                                           --> ${row.close < row.bbands_lower}
        ** calculBand = (row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1 -> (${row.bbands_upper_n1} - ${row.bbands_lower_n1} ) / ${row.bbands_lower_n1}   --> ${(row.bbands_upper_n1 - row.bbands_lower_n1) / row.bbands_lower_n1}
        ** calculBand  > indicatorsValues.min_bol_spread_bollinger                                  -> ${calculBand} > ${indicatorsValues.min_bol_spread_bollinger}                            --> ${calculBand > indicatorsValues.min_bol_spread_bollinger}  
        ** row.close < row.long_ma                                                        -> ${row.close} < ${row.long_ma}                                                 --> ${row.close < row.long_ma }
        *********************************************************************************************************************************************
        ${code_ap}`;
        
        logger.info(etiquette_bot  + detail_log)

        logger.info(etiquette_bot  + " " + (row.close_n1 < row.bbands_upper_n1))
        logger.info(etiquette_bot  + " " + (row.close > row.bbands_upper))
        logger.info(etiquette_bot  + " " + (calculBand > indicatorsValues.min_bol_spread_bollinger))
        logger.info(etiquette_bot  + " " + (row.close > row.long_ma))

        logger.info(etiquette_bot  + "====================================================================")

    }
    if(
        (row.close_n1 > row.bbands_lower_n1) 
        &&(row.close < row.bbands_lower) 
        &&(calculBand  > indicatorsValues.min_bol_spread_bollinger)
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
    const dateStart = new Date();
    const dateStartString = dateStart.toLocaleDateString() + " " + dateStart.toLocaleTimeString();

    if (debug_detail === true) {
        logger.info(etiquette_bot  + "====================================================================")
        let detail_log = `${code_av}
        ***********************************close_short: ${dateStartString}*****************************************
        ** 
        ** row.close < row.long_ma       ->  ${row.close} < ${row.long_ma} ?        --> ${row.close < row.long_ma}
        ************************************************************************************************************
        ${code_ap}`;
        
        logger.info(etiquette_bot  + detail_log)
        logger.info(etiquette_bot  + " " + (row.close < row.long_ma))
        
        logger.info(etiquette_bot  + "====================================================================")
    }

    
    console.log("\x1b[34m**********************************************\x1b[0m ")
    console.log("\x1b[34mclose_short: " + dateStartString + "\x1b[0m ")
    console.log("\x1b[34mrow.close > row.long_ma >> "+row.close > row.long_ma+": \x1b[0m ")
   
    console.log("\x1b[34m**********************************************\x1b[0m ")
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