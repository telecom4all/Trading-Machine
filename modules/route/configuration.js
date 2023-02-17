const checkAuth = require('../auth');
const config = require('../config');

const configurationRoute = (app) => {
  app.get('/configuration', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');

    let strategiesHTML = '';
    for (const strategy of config.strategies) {
        strategiesHTML += `<div id="${strategy.name}" class="div_strat">
                <h3>${strategy.name}</h3>
            `;
            for (const key in strategy) {
                strategiesHTML += `<div>${key}: <input id="${key}" class="input_select strategie" type="text" data-stratname="${strategy.name}" value="${strategy[key]}" /></div>`;
            }
        strategiesHTML += '</div>';
    }

    let generalHTML = '<div>';
        generalHTML += '<div>Nom du Bot: <input id="botname" type="text" class="input_select" value="'+config.parametres_generaux.botname+'" /></div>';
        generalHTML += '<div>Version Bot: <input id="botversion" type="text" class="input_select" value="'+config.parametres_generaux.botversion+'" /></div>';
        generalHTML += '<div>Délai retour logs: <input id="delai_log" class="input_select" type="text" value="'+config.parametres_generaux.delai_log+'" /> Sec</div>';
        generalHTML += '<div>Délai refresh page: <input id="delai_interface" class="input_select" type="text" value="'+config.parametres_generaux.delai_interface+'" /> Sec</div>';
        generalHTML += '<div>Délai refresh price: <input id="delai_price" class="input_select" type="text" value="'+config.parametres_generaux.delai_price+'" /> Sec</div>';
        generalHTML += '<div>Production: <input id="production" class="input_select" type="checkbox" value="'+config.parametres_generaux.production+'" ' + (config.parametres_generaux.production ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Debug : <input id="debug" class="input_select" type="checkbox" value="'+config.parametres_generaux.debug+'" ' + (config.parametres_generaux.debug ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Debug Détail: <input id="debug_detail" class="input_select" type="checkbox" value="'+config.parametres_generaux.debug_detail+'" ' + (config.parametres_generaux.debug_detail ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Strat Active: <select id="strat_active" class="input_select">';
        for (const strategy of config.strategies) {
            generalHTML += `<option value="${strategy.name}" ${strategy.name === config.parametres_generaux.strat_active ? 'selected' : ''}>${strategy.name}</option>`;
        }
        generalHTML += '</select></div>';
        generalHTML += '<div>Exchange Active: <select id="exchange_active" class="input_select">';
        for (const exchange of config.exchanges) {
            generalHTML += '<option value="' + exchange.name + '" ' + (exchange.name === config.parametres_generaux.exchange_active ? 'selected' : '') + '>' + exchange.name + '</option>';
        }
        generalHTML += '</select></div>';
        generalHTML += '<div>Delai Exchange: <input id="delay_coin" type="text" class="input_select" value="'+config.parametres_generaux.delay_coin+'" /></div>';
        generalHTML += '<div>Mysql: <input id="mysql" class="input_select" type="checkbox" value="'+config.parametres_generaux.mysql+'" ' + (config.parametres_generaux.mysql ? 'checked' : '') + ' /></div>';
        
    generalHTML += '</div>';

    let telegramHTML = '<div>';
        telegramHTML += '<div>Telegram Activé: <input id="telegram_on" class="input_select" type="checkbox" value="'+config.retour_telegram.telegram_on+'" ' + (config.retour_telegram.telegram_on ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram pour tout: <input id="alwaysNotifTelegram" class="input_select" type="checkbox" value="'+config.retour_telegram.alwaysNotifTelegram+'" ' + (config.retour_telegram.notifTelegramOnChangeOnly ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram si changement: <input id="notifTelegramOnChangeOnly" class="input_select" type="checkbox" value="'+config.retour_telegram.notifTelegramOnChangeOnly+'" ' + (config.retour_telegram.notifTelegramOnChangeOnly ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram avec bilan de performance: <input id="notifBilanDePerformance" class="input_select" type="checkbox" value="'+config.retour_telegram.notifBilanDePerformance+'" ' + (config.retour_telegram.notifBilanDePerformance ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram avec bilan de l\'évolution: <input id="notifBilanEvolutionContinue" class="input_select" type="checkbox" value="'+config.retour_telegram.notifBilanEvolutionContinue+'" ' + (config.retour_telegram.notifBilanEvolutionContinue ? 'checked' : '') + ' /></div>';
    telegramHTML += '</div>';

    let stratGeneralHTML = '<div>';
        stratGeneralHTML += '<div>Stable Coin: <input id="stableCoin" type="text" class="input_select" value="'+config.parametre_strategie_generaux.stableCoin+'" /></div>';
        
        stratGeneralHTML += '<div>Timeframe: <select id="timeframe" class="input_select">';

        for (let i = 0; i < config.timeFrames.length; i++) {
        let selected = "";
        if (config.timeFrames[i].abbreviation === config.parametre_strategie_generaux.timeframe) {
            selected = "selected";
        }
        stratGeneralHTML += '<option value="' + config.timeFrames[i].abbreviation + '" ' + selected + '>' + config.timeFrames[i].name + '</option>';
        }

        stratGeneralHTML += '</select></div>';

        stratGeneralHTML += '<div>Nombre de Changelles: <input id="nbOfCandles" type="text" class="input_select" value="'+config.parametre_strategie_generaux.nbOfCandles+'" /></div>';
        stratGeneralHTML += '<div>Leverage: <input id="leverage" type="text" class="input_select" value="'+config.parametre_strategie_generaux.leverage+'" /></div>';
        stratGeneralHTML += '<div>Take Profit Activé: <input id="is_tp" class="input_select" type="checkbox" value="'+config.parametre_strategie_generaux.is_tp+'" ' + (config.parametre_strategie_generaux.is_tp ? 'checked' : '') + ' /></div>';
        stratGeneralHTML += '<div>Nombre de TP: <select id="nb_tp" class="input_select">';
        stratGeneralHTML += '<option value="1"' + (config.parametre_strategie_generaux.nb_tp == 1 ? ' selected' : '') + '>1</option>';
        stratGeneralHTML += '<option value="2"' + (config.parametre_strategie_generaux.nb_tp == 2 ? ' selected' : '') + '>2</option>';
        stratGeneralHTML += '</select></div>';

        stratGeneralHTML += '<div>TP 1 pourcentage cible: <input id="tp_1" type="text" class="input_select" value="'+config.parametre_strategie_generaux.tp_1+'" /></div>';
        stratGeneralHTML += '<div>TP 2 pourcentage cible: <input id="tp_2" type="text" class="input_select" value="'+config.parametre_strategie_generaux.tp_2+'" /></div>';
        stratGeneralHTML += '<div>Stop Loss Activé: <input id="is_sl" class="input_select" type="checkbox" value="'+config.parametre_strategie_generaux.is_sl+'" ' + (config.parametre_strategie_generaux.is_sl ? 'checked' : '') + ' /></div>';
        stratGeneralHTML += '<div>SL pourcentage cible: <input id="sl" type="text" class="input_select" value="'+config.parametre_strategie_generaux.sl+'" /></div>';
        stratGeneralHTML += '<div>Position Maximum ouverte en même temps: <input id="maxOpenPosition" type="text" class="input_select" value="'+config.parametre_strategie_generaux.maxOpenPosition+'" /></div>';
        
        stratGeneralHTML += '<div>Type de Trade authorisé: ';
        stratGeneralHTML += '<select id="type" class="input_select">';
        stratGeneralHTML += '<option value="long"' + (config.parametre_strategie_generaux.type === 'long' ? ' selected' : '') + '>long</option>';
        stratGeneralHTML += '<option value="short"' + (config.parametre_strategie_generaux.type === 'short' ? ' selected' : '') + '>short</option>';
        stratGeneralHTML += '<option value="both"' + (config.parametre_strategie_generaux.type === 'both' ? ' selected' : '') + '>both</option>';
        stratGeneralHTML += '</select></div>';
    stratGeneralHTML += '</div>';

    let historiqueHTML = '<div>';
        historiqueHTML += '<div>Investissement de base: <input id="totalInvestment" type="text" class="input_select" value="'+config.historique.totalInvestment+'" /></div>';
        historiqueHTML += '<div>Fichier Historique: <input id="soldeFile" type="text" class="input_select" value="'+config.historique.soldeFile+'" /></div>';
    historiqueHTML += '</div>';    
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Configuration du bot</title>
            <link rel="stylesheet" type="text/css" href="/style.css">
        </head>
        <body>
            <nav>
            <a href="/">Page principale</a>
            <a href="/configuration">Configuration</a>
            <a href="/place_trade">Trade Manuel</a>
            </nav>
            <h1>Configuration du Bot de Trading</h1>
            <section id="config-form">
                <div id="main_config_input">
                    
                    <div class="div_input">
                        <h2>Configuration Strategies</h2>
                        ${strategiesHTML}
                    </div>
                    
                    <div class="div_input">
                        <h2>Configuration Général</h2>
                        ${generalHTML}
                    </div>
                    <div class="div_input">
                        <h2>Configuration Télégram</h2>
                        ${telegramHTML}
                    </div>
                    <div class="div_input">
                        <h2>Configuration Général pour les strats</h2>
                        ${stratGeneralHTML}
                    </div>
                    <div class="div_input">
                        <h2>Configuration historique</h2>
                        ${historiqueHTML}
                    </div>
                    <div class="div_input">
                    <button id="save-button">Save</button><br>
                    <button id="start-button">Start Bot</button>
                    </div>
                </div>
            </section>
            <script src="/configuration.js"></script>

        </body>
        </html>
    `);
  });
};

module.exports = configurationRoute;