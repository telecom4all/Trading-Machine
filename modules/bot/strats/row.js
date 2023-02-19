const DataFrame = require("pandas-js").DataFrame;
const logger = require('../../logger');

async function getRowDfListBollinger(dfList, loc ,config) {
    const delay_coin = config.parametres_generaux.delay_coin;
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
/*

n1_lower_band          0.504350
n1_higher_band         0.599304
*/
    try {
        let timestamp = dfList.get('timestamp');
        if (!Array.isArray(timestamp)) {
            timestamp = Array.from(timestamp);
        }
        const lastValueTimestamp = timestamp[0][timestamp[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueTimestamp = " + lastValueTimestamp);  
        }
       

        let open = dfList.get('open');
        if (!Array.isArray(open)) {
            open = Array.from(open);
        }
        const lastValueOpen = open[0][open[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueOpen = " + lastValueOpen);  
        }
       

        let high = dfList.get('high');
        if (!Array.isArray(high)) {
            high = Array.from(high);
        }
        const lastValueHigh = high[0][high[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueHigh = " + lastValueHigh);  
        }

        let low = dfList.get('low');
        if (!Array.isArray(low)) {
            low = Array.from(low);
        }
        const lastValueLow = low[0][low[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueLow = " + lastValueLow);  
        }

        let close = dfList.get('close');
        if (!Array.isArray(close)) {
            close = Array.from(close);
        }
        const lastValueClose = close[0][close[0].length - 1];
        let i_close = 2;
        let lastValueClose_n1 = close[0][close[0].length - i_close];
        
        while (lastValueClose === lastValueClose_n1) {
            i_close++;
            lastValueClose_n1 = close[0][close[0].length - i_close];
        }
        if(debug_detail == true){
            logger.info("lastValueClose = " + lastValueClose);
            logger.info("lastValueClose_n1 = " + lastValueClose_n1);    
        }

        let volume = dfList.get('volume');
        if (!Array.isArray(volume)) {
            volume = Array.from(volume);
        }
        const lastValueVolume = volume[0][volume[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueVolume = " + lastValueVolume);  
        }

        let datetime = dfList.get('datetime');
        if (!Array.isArray(datetime)) {
            datetime = Array.from(datetime);
        }
        const lastValueDatetime = datetime[0][datetime[0].length - 1];
        if(debug_detail == true){
            logger.info("lastValueDatetime = " + lastValueDatetime);  
        }

        let long_ma = dfList.get('long_ma');
        if (!Array.isArray(long_ma)) {
            long_ma = Array.from(long_ma);
        }
        const lastValueLong_ma = long_ma[0][long_ma[0].length - 1];
        let i_long_ma = 2;
        let lastValueLong_ma_n1 = long_ma[0][long_ma[0].length - i_long_ma];
        while (lastValueLong_ma === lastValueLong_ma_n1) {
            i_long_ma++;
            lastValueLong_ma_n1 = long_ma[0][long_ma[0].length - i_long_ma];
        }
        if(debug_detail == true){
            logger.info("lastValueLong_ma = " + lastValueLong_ma);  
            logger.info("lastValueLong_ma_n1 = " + lastValueLong_ma_n1);  
        }

        let bbands_lower = dfList.get('bbands_lower');
        if (!Array.isArray(bbands_lower)) {
            bbands_lower = Array.from(bbands_lower);
        }
        const lastValueBbands_lower = bbands_lower[0][bbands_lower[0].length - 1];
        let i_bbands_lower_n1 = 2;
        let lastValueBbands_lower_n1 = bbands_lower[0][bbands_lower[0].length - i_bbands_lower_n1];
        
        while (lastValueBbands_lower === lastValueBbands_lower_n1) {
            i_bbands_lower_n1++;
            lastValueBbands_lower_n1 = bbands_lower[0][bbands_lower[0].length - i_bbands_lower_n1];
        }
        if(debug_detail == true){
            logger.info("lastValueBbands_lower = " + lastValueBbands_lower);  
            logger.info("lastValueBbands_lower_n1 = " + lastValueBbands_lower_n1);  
        }

        let bbands_middle = dfList.get('bbands_middle');
        if (!Array.isArray(bbands_middle)) {
            bbands_middle = Array.from(bbands_middle);
        }
        const lastValueBbands_middle = bbands_middle[0][bbands_middle[0].length - 1];
        let i_bbands_middle = 2;
        let lastValueBbands_middle_n1 = bbands_middle[0][bbands_middle[0].length - i_bbands_middle];
        while (lastValueBbands_middle === lastValueBbands_middle_n1) {
            i_bbands_middle++;
            lastValueBbands_middle_n1 = bbands_middle[0][bbands_middle[0].length - i_bbands_middle];
        }
        if(debug_detail == true){
            logger.info("lastValueBbands_middle = " + lastValueBbands_middle);
            logger.info("lastValueBbands_middle_n1 = " + lastValueBbands_middle_n1);  
        }

        let bbands_upper = dfList.get('bbands_upper');
        if (!Array.isArray(bbands_upper)) {
            bbands_upper = Array.from(bbands_upper);
        }
        const lastValueBbands_upper = bbands_upper[0][bbands_upper[0].length - 1];
        let i_bbands_upper = 2;
        let lastValueBbands_upper_n1 = bbands_upper[0][bbands_upper[0].length - i_bbands_upper];
        
        while (lastValueBbands_upper === lastValueBbands_upper_n1) {
            i_bbands_upper++;
            lastValueBbands_upper_n1 = bbands_upper[0][bbands_upper[0].length - i_bbands_upper];
        }
        if(debug_detail == true){
            logger.info("lastValueBbands_upper = " + lastValueBbands_upper); 
            logger.info("lastValueBbands_upper_n1 = " + lastValueBbands_upper_n1);  
        }

        let row = {
            "timestamp":lastValueTimestamp,
            "open":lastValueOpen,
            "high":lastValueHigh,
            "low":lastValueLow,
            "close":lastValueClose,
            "close_n1":lastValueClose_n1,
            "volume":lastValueVolume,
            "datetime":lastValueDatetime,
            "long_ma":lastValueLong_ma,
            "long_ma_n1":lastValueLong_ma_n1,
            "bbands_lower":lastValueBbands_lower,
            "bbands_lower_n1":lastValueBbands_lower_n1,
            "bbands_middle":lastValueBbands_middle,
            "bbands_middle_n1":lastValueBbands_middle_n1,
            "bbands_upper":lastValueBbands_upper,
            "bbands_upper_n1":lastValueBbands_upper_n1
        }

        return row;     
        
    } catch (error) {
        logger.error(error);
    }
  
}

module.exports = { getRowDfListBollinger };