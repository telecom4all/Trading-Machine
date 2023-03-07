
const logger = require('../../logger');

async function getRowDfListBollinger(dfList, loc ,config) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;

    
    try {
        const lastRow = dfList.pop();

       return lastRow; 
    } catch (error) {
        logger.error(error);
    }
  
}

module.exports = { getRowDfListBollinger };