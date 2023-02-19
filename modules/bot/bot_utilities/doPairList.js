module.exports = function(strategie, stratSelect, stableCoin, config) {
    const botName = config.parametres_generaux.botname;
    let etiquette_bot = "\x1b[34m"+botName+": \x1b[0m ";
    try {

        const selected = strategie.filter(item => item.name === stratSelect)[0];
        let list = selected.pair_list;
        
        const items = list.split(',');
        let pairList = [];

        for (let i = 0; i < items.length; i++) {
            pair = items[i] + "/" + stableCoin;
            pairList.push(pair);
        }
        return pairList;
    } catch (error) {
        logger.error(etiquette_bot + 'Erreur: ' + error);
        return false   
    }
    
};