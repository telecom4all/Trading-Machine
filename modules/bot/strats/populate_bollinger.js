const ta = require("ta-lib");
const logger = require('../../logger');
const DataFrame = require("pandas-js").DataFrame;
var tulind = require('tulind');

const get_n_columns = (df, columns, n = 1) => {
    const dt = JSON.parse(JSON.stringify(df));
    for (const col of columns) {
      //  dt[n${n}_${col}] = dt[col][n];
    }
    return dt;
};

function getIndicatorsValue(strategie, stratSelect){
    console.log(strategie)
    const selected = strategie.filter(item => item.name === stratSelect)[0];
        
    return selected;
}


async function getIndicators(dfList, config, indicatorsValues){
    const debug = config.parametres_generaux.debug;
    const debug_detail = config.parametres_generaux.debug_detail;
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";

    try {
        for (const coin in dfList) {
            let timestamp = dfList[coin].get('timestamp');
            if (!Array.isArray(timestamp)) {
                timestamp = Array.from(timestamp);
            }
            let open = dfList[coin].get('open');
            if (!Array.isArray(open)) {
                open = Array.from(open);
            }
            let high = dfList[coin].get('high');
            if (!Array.isArray(high)) {
                high = Array.from(high);
            }
            let low = dfList[coin].get('low');
            if (!Array.isArray(low)) {
                low = Array.from(low);
            }

            let close = dfList[coin].get('close');
            if (!Array.isArray(close)) {
                close = Array.from(close);
            }
            
            let volume = dfList[coin].get('volume');
            if (!Array.isArray(volume)) {
                volume = Array.from(volume);
            }
            let datetime = dfList[coin].get('datetime');
            if (!Array.isArray(datetime)) {
                datetime = Array.from(datetime);
            }
            
            let long_ma;
            let bbands_lower;
            let bbands_middle;
            let bbands_upper;

            await tulind.indicators.sma.indicator([close], [parseInt(indicatorsValues.long_ma_window_bollinger)], function(err, results) {
                if(err) logger.error(etiquette_bot + err);
                long_ma = results[0];
                for (let i = 0; i < close.length; i++) {
                    if (typeof long_ma[i] === 'undefined' || isNaN(long_ma[i])) {
                      long_ma[i] = long_ma[i - 1];
                    }
                  }
                dfList[coin].long_ma = long_ma;
            });

            await tulind.indicators.bbands.indicator([close], [parseInt(indicatorsValues.bol_window_bollinger), parseFloat(indicatorsValues.bol_std_bollinger)], function(err, results) {
                if(err) logger.error(etiquette_bot + err);
                bbands_lower = results[0];
                bbands_middle = results[1];
                bbands_upper = results[2];
                for (let i = 0; i < close.length; i++) {
                    if (typeof bbands_lower[i] === 'undefined' || isNaN(bbands_lower[i])) {
                        bbands_lower[i] = bbands_lower[i - 1];
                    }
                }
                for (let i = 0; i < close.length; i++) {
                    if (typeof bbands_middle[i] === 'undefined' || isNaN(bbands_middle[i])) {
                        bbands_middle[i] = bbands_middle[i - 1];
                    }
                }
                for (let i = 0; i < close.length; i++) {
                    if (typeof bbands_upper[i] === 'undefined' || isNaN(bbands_upper[i])) {
                        bbands_upper[i] = bbands_upper[i - 1];
                    }
                }
            });
          
            const fullResult = [timestamp, open, high, low, close, volume, datetime, long_ma, bbands_lower, bbands_middle, bbands_upper];
                
            const df = new DataFrame([fullResult], ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'datetime', 'long_ma', 'bbands_lower', 'bbands_middle', 'bbands_upper' ]);
            let nouveaux_noms = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'datetime', 'long_ma', 'bbands_lower', 'bbands_middle', 'bbands_upper'];
            df.columns = nouveaux_noms;
            

           
            dfList[coin] = df;
            

        }
        return dfList;
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return "error";
    }
}



module.exports = { getIndicators, getIndicatorsValue };