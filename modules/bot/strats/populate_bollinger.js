const logger = require('../../logger');
const tulind = require('tulind');

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

    const BOL_WINDOW = parseInt(indicatorsValues.bol_window_bollinger) 
    const BOL_STD_DEV = parseFloat(indicatorsValues.bol_std_bollinger); 
    const BOL_MIN_SPREAD = 0; 
    const MA_WINDOW = parseInt(indicatorsValues.long_ma_window_bollinger);

  
    try {
        for (const symbol in dfList) {
            if (Array.isArray(dfList[symbol]) && dfList[symbol].length > 0) {
                const closes = dfList[symbol].map(d => d.close);
                
                let ma; 
                await tulind.indicators.sma.indicator([closes], [MA_WINDOW], function(err, results) {
                    if(err) console.log(err);
                    ma = results[0];
                });
                          let bbands_lower;
                let bbands_middle;
                let bbands_upper;
                await tulind.indicators.bbands.indicator([closes], [BOL_WINDOW, BOL_STD_DEV], function(err, results) {
                    if(err) logger.error(etiquette_bot + err);
                    bbands_lower = results[0];
                    bbands_middle = results[1];
                    bbands_upper = results[2];
                });

                for (let i = 0; i < dfList[symbol].length; i++) {
                    //console.log( ma[i - MA_WINDOW + 1])
                    dfList[symbol][i].long_ma = i < MA_WINDOW +1 ? null : ma[i - MA_WINDOW + 1];
                    dfList[symbol][i].long_ma_n1 = i < MA_WINDOW  ? null : ma[i  - MA_WINDOW ];
        
                    dfList[symbol][i].bbands_upper = i < BOL_WINDOW +1 ? null :  bbands_upper[i - BOL_WINDOW + 1];
                    dfList[symbol][i].bbands_upper_n1 = i < BOL_WINDOW  ? null :  bbands_upper[i - BOL_WINDOW ];
        
                    dfList[symbol][i].bbands_middle = i < BOL_WINDOW +1 ? null :  bbands_middle[i - BOL_WINDOW + 1];
                    dfList[symbol][i].bbands_middle_n1 = i < BOL_WINDOW  ? null :  bbands_middle[i - BOL_WINDOW ];
        
                    dfList[symbol][i].bbands_lower = i < BOL_WINDOW +1 ? null :  bbands_lower[i - BOL_WINDOW + 1];
                    dfList[symbol][i].bbands_lower_n1 = i < BOL_WINDOW  ? null :  bbands_lower[i - BOL_WINDOW ];
        
                }
              }   

        }
        return dfList;
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return "error";
    }
}
module.exports = { getIndicators, getIndicatorsValue };