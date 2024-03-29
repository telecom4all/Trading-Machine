const checkAuth = require('../auth');
const configSecret = require('../config_secret');

const fs = require('fs');
const path = require('path');

const configurationRoute = (app) => {
  app.get('/configuration', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');

    let configFile = path.join(__dirname, '../../jsons/configs/config.json');
    let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    let strategiesHTML = '';
    for (const strategy of config.strategies) {
        strategiesHTML += `<div id="${strategy.name}" class="div_strat">
                <h3>${strategy.name}</h3>
            `;
            for (const key in strategy) {
                if(key == "name"){
                    strategiesHTML += `<div>${key}: <input id="${key}" class="input_select strategie" style="color:white" type="text" data-stratname="${strategy.name}" value="${strategy[key]}" disabled /></div>`;
                }
                else{
                    strategiesHTML += `<div>${key}: <input id="${key}" class="input_select strategie" type="text" data-stratname="${strategy.name}" value="${strategy[key]}" /></div>`;
                }
                                
            }
        strategiesHTML += '</div>';
    }
 
    
    let generalHTML = '<div>';
        generalHTML += '<div>Nom du Bot: <input id="botname" type="text" class="input_select" value="'+config.parametres_generaux.botname+'" /></div>';
        generalHTML += '<div>Version Bot: <input id="botversion" type="text" class="input_select" value="'+config.parametres_generaux.botversion+'" /></div>';
        generalHTML += '<div>Production: <input id="production" class="input_select" type="checkbox" value="'+config.parametres_generaux.production+'" ' + (config.parametres_generaux.production ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Debug : <input id="debug" class="input_select" type="checkbox" value="'+config.parametres_generaux.debug+'" ' + (config.parametres_generaux.debug ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Debug Détail: <input id="debug_detail" class="input_select" type="checkbox" value="'+config.parametres_generaux.debug_detail+'" ' + (config.parametres_generaux.debug_detail ? 'checked' : '') + ' /></div>';
        generalHTML += '<div>Strat Active: <select id="strat_active" class="input_select">';
        for (const strategy of config.strategies) {
            generalHTML += `<option value="${strategy.name}" ${strategy.name === config.parametres_generaux.strat_active ? 'selected' : ''}>${strategy.name}</option>`;
        }
        generalHTML += '</select></div>';
        generalHTML += '<div>Exchange Active: <select id="exchange_active" class="input_select">';

        for (const exchange of configSecret.exchanges) {
            
            generalHTML += '<option value="' + exchange.name + '" ' + (exchange.name === config.parametres_generaux.exchange_active ? 'selected' : '') + '>' + exchange.name + '</option>';
        }
        generalHTML += '</select></div>';
        generalHTML += '<div>Delai Exchange: <input id="delay_coin" type="text" class="input_select" value="'+config.parametres_generaux.delay_coin+'" /></div>';
        generalHTML += '<div>Mysql: <input id="mysql" class="input_select" type="checkbox" value="'+config.parametres_generaux.mysql+'" ' + (config.parametres_generaux.mysql ? 'checked' : '') + ' /></div>';
        
    generalHTML += '</div>';

    

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

        let value_tp1_span = (config.parametre_strategie_generaux.tp_1*100).toFixed(2) + '%' 
        stratGeneralHTML += '<div>TP 1 pourcentage cible: <input id="tp_1" type="text" class="input_select" value="'+config.parametre_strategie_generaux.tp_1+'" /></div>';
        stratGeneralHTML += '<input type="range" min="0" max="2" step="0.01" id="tp_1_slide" name="" value="'+config.parametre_strategie_generaux.tp_1+'"><span id="tp_1Value">'+value_tp1_span+'</span>'
       
        let value_tp2_span = (config.parametre_strategie_generaux.tp_2*100).toFixed(2) + '%' 
        stratGeneralHTML += '<div>TP 2 pourcentage cible: <input id="tp_2" type="text" class="input_select" value="'+config.parametre_strategie_generaux.tp_2+'" /></div>';
        stratGeneralHTML += '<input type="range" min="0" max="2" step="0.01" id="tp_2_slide" name="" value="'+config.parametre_strategie_generaux.tp_2+'"><span id="tp_2Value">'+value_tp2_span+'</span>'
       
        
        stratGeneralHTML += '<div>Stop Loss Activé: <input id="is_sl" class="input_select" type="checkbox" value="'+config.parametre_strategie_generaux.is_sl+'" ' + (config.parametre_strategie_generaux.is_sl ? 'checked' : '') + ' /></div>';
        let value_sl_span = (config.parametre_strategie_generaux.sl*100).toFixed(2) + '%' 
        stratGeneralHTML += '<div>SL  pourcentage cible: <input id="sl" type="text" class="input_select" value="'+config.parametre_strategie_generaux.sl+'" /></div>';
        stratGeneralHTML += '<input type="range" min="0" max="2" step="0.01" id="sl_slide" name="" value="'+config.parametre_strategie_generaux.sl+'"><span id="slValue">'+value_sl_span+'</span>'
     
        stratGeneralHTML += '<div>Position Maximum ouverte en même temps: <input id="maxOpenPosition" type="text" class="input_select" value="'+config.parametre_strategie_generaux.maxOpenPosition+'" /></div>';
        
        stratGeneralHTML += '<div>Type de Trade authorisé: ';
        stratGeneralHTML += '<select id="type" class="input_select">';
        stratGeneralHTML += '<option value="long"' + (config.parametre_strategie_generaux.type === 'long' ? ' selected' : '') + '>long</option>';
        stratGeneralHTML += '<option value="short"' + (config.parametre_strategie_generaux.type === 'short' ? ' selected' : '') + '>short</option>';
        stratGeneralHTML += '<option value="both"' + (config.parametre_strategie_generaux.type === 'both' ? ' selected' : '') + '>both</option>';
        stratGeneralHTML += '</select></div>';
        stratGeneralHTML += '<div>Investissement de base: <input id="totalInvestment" type="text" class="input_select" value="'+config.historique.totalInvestment+'" /> USD</div>';
    stratGeneralHTML += '</div>';

    
    let telegramHTML = '<div>';
        telegramHTML += '<div>Telegram Activé: <input id="telegram_on" class="input_select" type="checkbox" value="'+config.retour_telegram.telegram_on+'" ' + (config.retour_telegram.telegram_on ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram pour tout: <input id="alwaysNotifTelegram" class="input_select" type="checkbox" value="'+config.retour_telegram.alwaysNotifTelegram+'" ' + (config.retour_telegram.notifTelegramOnChangeOnly ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram si changement: <input id="notifTelegramOnChangeOnly" class="input_select" type="checkbox" value="'+config.retour_telegram.notifTelegramOnChangeOnly+'" ' + (config.retour_telegram.notifTelegramOnChangeOnly ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram avec bilan de performance: <input id="notifBilanDePerformance" class="input_select" type="checkbox" value="'+config.retour_telegram.notifBilanDePerformance+'" ' + (config.retour_telegram.notifBilanDePerformance ? 'checked' : '') + ' /></div>';
        telegramHTML += '<div>Notif Télégram avec bilan de l\'évolution: <input id="notifBilanEvolutionContinue" class="input_select" type="checkbox" value="'+config.retour_telegram.notifBilanEvolutionContinue+'" ' + (config.retour_telegram.notifBilanEvolutionContinue ? 'checked' : '') + ' /></div>';
    telegramHTML += '</div>';


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
            <a href="/configuration">Configuration Bot</a>
            <a href="/configuration_interface">Configuration Interface</a>
            <a href="/place_trade">Trade Manuel</a>
            <a href="/deconnection" class="logout-link">Deconnection</a>
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
                        <h2>Configuration Général pour les strats</h2>
                        ${stratGeneralHTML}
                    </div>
                    <div class="div_input">
                        <div class="div_input">
                            <h2>Configuration Télégram</h2>
                            ${telegramHTML}
                        </div>
                        <div class="div_input">
                            <h2>Action</h2>
                            <button id="save-button">Save</button><br>
                            <button id="start-button">Start Bot</button>
                        </div>
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