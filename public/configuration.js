const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', () => {
    
    // parametre généraux
    let botname = document.querySelector('#botname').value;
    let botversion = document.querySelector('#botversion').value;
    let delai_log = document.querySelector('#delai_log').value;
    let delai_interface = document.querySelector('#delai_interface').value;
    let delai_price = document.querySelector('#delai_price').value;
    
    let production = document.querySelector('#production').checked;
    let debug = document.querySelector('#debug').checked;
    let debug_detail = document.querySelector('#debug_detail').checked;
    let strat_active = document.querySelector('#strat_active').value;
    let exchange_active = document.querySelector('#exchange_active').value;
    let delay_coin = document.querySelector('#delay_coin').value;
    let mysql = document.querySelector('#mysql').checked;

    // telegram
    let telegram_on = document.querySelector('#telegram_on').checked;
    let alwaysNotifTelegram = document.querySelector('#alwaysNotifTelegram').checked;
    let notifTelegramOnChangeOnly = document.querySelector('#notifTelegramOnChangeOnly').checked;
    let notifBilanDePerformance = document.querySelector('#notifBilanDePerformance').checked;
    let notifBilanEvolutionContinue = document.querySelector('#notifBilanEvolutionContinue').checked;

    // trading général
    let stableCoin = document.querySelector('#stableCoin').value;
    let timeframe = document.querySelector('#timeframe').value;
    let nbOfCandles = document.querySelector('#nbOfCandles').value;
    let leverage = document.querySelector('#leverage').value;
    let is_tp = document.querySelector('#is_tp').checked;
    let nb_tp = document.querySelector('#nb_tp').value;
    let tp_1 = document.querySelector('#tp_1').value;
    let tp_2 = document.querySelector('#tp_2').value;
    let is_sl = document.querySelector('#is_sl').checked;
    let sl = document.querySelector('#sl').value;
    let maxOpenPosition = document.querySelector('#maxOpenPosition').value;
    let type = document.querySelector('#type').value;
    
    // historique
    let totalInvestment = document.querySelector('#totalInvestment').value;
    let soldeFile = document.querySelector('#soldeFile').value;

    var config_strats = [];
    var strats = document.getElementsByClassName("div_strat");
    for (var i = 0; i < strats.length; i++) {
        var strat = strats[i];
        let inputs = strat.getElementsByTagName("input");
        let inputData = {};
        for (let i = 0; i < inputs.length; i++) {
            inputData[inputs[i].id] = inputs[i].value;
        }

        config_strats.push(inputData);
        
    }
  
    var config = {
        "strategies":config_strats,
        "parametres_generaux" : {
            "botname": botname,
            "botversion": botversion,
            "delai_log": delai_log,
            "delai_interface": delai_interface,
            "delai_price": delai_price,
            "production": production,
            "debug": debug,
            "debug_detail": debug_detail,
            "strat_active": strat_active,
            "exchange_active": exchange_active,
            "delay_coin": delay_coin,
            "mysql":mysql
        },
        "retour_telegram" :{
            "telegram_on": telegram_on,
            "alwaysNotifTelegram": alwaysNotifTelegram,
            "notifTelegramOnChangeOnly": notifTelegramOnChangeOnly,
            "notifBilanDePerformance": notifBilanDePerformance,
            "notifBilanEvolutionContinue": notifBilanEvolutionContinue
        },
        "parametre_strategie_generaux": {
            "stableCoin": stableCoin,
            "timeframe": timeframe,
            "nbOfCandles": nbOfCandles,
            "leverage": leverage,
            "is_tp": is_tp,
            "nb_tp": nb_tp,
            "tp_1": tp_1,
            "tp_2": tp_2,
            "is_sl": is_sl,
            "sl": sl,
            "maxOpenPosition": maxOpenPosition,
            "type": type
        },
        "historique": {
            "totalInvestment": totalInvestment,
            "soldeFile": soldeFile
        }
        
    };

    fetch("/save_config", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        
        if(jsonObject.status == false){
            alert("Erreur : " + jsonObject.message)
        }
        else{
            alert("Configuration Sauvegardé")
        }
    })
    .catch(error => console.log("error", error));
    
});



const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    // parametre généraux
    let botname = document.querySelector('#botname').value;
    let botversion = document.querySelector('#botversion').value;
    let production = document.querySelector('#production').checked;
    let debug = document.querySelector('#debug').checked;
    let debug_detail = document.querySelector('#debug_detail').checked;
    let strat_active = document.querySelector('#strat_active').value;
    let exchange_active = document.querySelector('#exchange_active').value;
    let delay_coin = document.querySelector('#delay_coin').value;
    let mysql = document.querySelector('#mysql').checked;

    // telegram
    let telegram_on = document.querySelector('#telegram_on').checked;
    let alwaysNotifTelegram = document.querySelector('#alwaysNotifTelegram').checked;
    let notifTelegramOnChangeOnly = document.querySelector('#notifTelegramOnChangeOnly').checked;
    let notifBilanDePerformance = document.querySelector('#notifBilanDePerformance').checked;
    let notifBilanEvolutionContinue = document.querySelector('#notifBilanEvolutionContinue').checked;

    // trading général
    let stableCoin = document.querySelector('#stableCoin').value;
    let timeframe = document.querySelector('#timeframe').value;
    let nbOfCandles = document.querySelector('#nbOfCandles').value;
    let leverage = document.querySelector('#leverage').value;
    let is_tp = document.querySelector('#is_tp').checked;
    let nb_tp = document.querySelector('#nb_tp').value;
    let tp_1 = document.querySelector('#tp_1').value;
    let tp_2 = document.querySelector('#tp_2').value;
    let is_sl = document.querySelector('#is_sl').checked;
    let sl = document.querySelector('#sl').value;
    let maxOpenPosition = document.querySelector('#maxOpenPosition').value;
    let type = document.querySelector('#type').value;
    
    // historique
    let totalInvestment = document.querySelector('#totalInvestment').value;
    let soldeFile = document.querySelector('#soldeFile').value;

    var config_strats = [];
    var strats = document.getElementsByClassName("div_strat");
    for (var i = 0; i < strats.length; i++) {
        var strat = strats[i];
        let inputs = strat.getElementsByTagName("input");
        let inputData = {};
        for (let i = 0; i < inputs.length; i++) {
            inputData[inputs[i].id] = inputs[i].value;
        }

        config_strats.push(inputData);
        
    }
    
    var config = {
        "strategies":config_strats,
        "parametres_generaux" : {
            "botname": botname,
            "botversion": botversion,
            "production": production,
            "debug": debug,
            "debug_detail": debug_detail,
            "strat_active": strat_active,
            "exchange_active": exchange_active,
            "delay_coin": delay_coin,
            "mysql":mysql
        },
        "retour_telegram" :{
            "telegram_on": telegram_on,
            "alwaysNotifTelegram": alwaysNotifTelegram,
            "notifTelegramOnChangeOnly": notifTelegramOnChangeOnly,
            "notifBilanDePerformance": notifBilanDePerformance,
            "notifBilanEvolutionContinue": notifBilanEvolutionContinue
        },
        "parametre_strategie_generaux": {
            "stableCoin": stableCoin,
            "timeframe": timeframe,
            "nbOfCandles": nbOfCandles,
            "leverage": leverage,
            "is_tp": is_tp,
            "nb_tp": nb_tp,
            "tp_1": tp_1,
            "tp_2": tp_2,
            "is_sl": is_sl,
            "sl": sl,
            "maxOpenPosition": maxOpenPosition,
            "type": type
        },
        "historique": {
            "totalInvestment": totalInvestment,
            "soldeFile": soldeFile
        }
        
    };

    fetch("/start_bot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        
        if(jsonObject.status == false){
            alert("Erreur : " + jsonObject.message)
        }
        else{
            
            alert("Bot démaré avec le pid : " + jsonObject.processInfo.pid);
            window.location.href = window.location.origin;
        }


    })
    .catch(error => console.log("error", error));

});