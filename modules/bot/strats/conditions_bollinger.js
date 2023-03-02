const logger = require('../../logger');
const utilities = require('../../utilities');

const code_av = "\x1b[35m";
const code_ap = "\x1b[0m "

const path = require('path');
const parentDir = path.join(__dirname, '../../../logs/');


async function open_long(pair, row, config, indicatorsValues) {
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
        ${parentDir}
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

        const dataLogConditions_open_long = [  [ pair, dateStartString,  row.close_n1, row.bbands_upper_n1, row.close, row.bbands_upper, calculBand, row.long_ma, (row.close_n1 < row.bbands_upper_n1), row.close > row.bbands_upper, (calculBand > indicatorsValues.min_bol_spread_bollinger), (row.close > row.long_ma)]];

        await utilities.logConditions("open_long", dataLogConditions_open_long)
      

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


async function close_long(pair, row, config, indicatorsValues) {
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

     
        const dataLogConditions = [  [ pair, dateStartString,  row.close, row.long_ma, (row.close < row.long_ma), "", "", "", "", "", "", ""]];
        await utilities.logConditions("close_long", dataLogConditions)
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

async function open_short(pair, row, config, indicatorsValues) {
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

        logger.info(etiquette_bot  + " " + (row.close_n1 > row.bbands_lower_n1))
        logger.info(etiquette_bot  + " " + (row.close < row.bbands_lower))
        logger.info(etiquette_bot  + " " + (calculBand > indicatorsValues.min_bol_spread_bollinger))
        logger.info(etiquette_bot  + " " + (row.close < row.long_ma))

        logger.info(etiquette_bot  + "====================================================================")

        const dataLogConditions_open_short = [  [ pair, dateStartString,  row.close_n1, row.bbands_lower_n1 , row.close,row.bbands_lower ,calculBand , row.long_ma,(row.close_n1 > row.bbands_lower_n1), row.close < row.bbands_lower, (calculBand > indicatorsValues.min_bol_spread_bollinger), (row.close < row.long_ma)]];

        await utilities.logConditions("open_short", dataLogConditions_open_short)

    }
    if(
        (row.close_n1 > row.bbands_lower_n1) 
        &&(row.close < row.bbands_lower) 
        &&(calculBand > indicatorsValues.min_bol_spread_bollinger)
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


async function close_short(pair, row, config, indicatorsValues) {
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

        const headers = ['type', 'Pair', 'Date', 'Close','Long MA', 'close > long_ma'];
        const dataLogConditions = [  [  pair, dateStartString,  row.close, row.long_ma, (row.close > row.long_ma)]];
        utilities.logConditions("close_short", dataLogConditions)

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