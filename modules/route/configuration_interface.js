const checkAuth = require('../auth');
const fs = require('fs');
const path = require('path');


const configurationInterface = (app) => {
  app.get('/configuration_interface', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');

    let configFile = path.join(__dirname, '../../jsons/configs/config_interface.json');
    let configInterface = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    
    let generalHTML = '<div>';
        generalHTML += '<div>Délai retour logs: <input id="delai_log" class="input_select" type="text" value="'+configInterface.parametres_generaux.delai_log+'" /> Sec</div>';
        generalHTML += '<div>Délai refresh page: <input id="delai_interface" class="input_select" type="text" value="'+configInterface.parametres_generaux.delai_interface+'" /> Sec</div>';
        generalHTML += '<div>Délai refresh price: <input id="delai_price" class="input_select" type="text" value="'+configInterface.parametres_generaux.delai_price+'" /> Sec</div>';
    generalHTML += '</div>';    
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Configuration interface</title>
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
            <h1>Configuration de l'interface</h1>
            <section id="config-form">
                <div id="main_config_input" style="width:100%" >
                    <center>
                    <div class="div_input" style="margin-left:40%;margin-right:auto; min-width:600px;" >
                        ${generalHTML}
                        </ br>
                        <button id="save-button">Save</button>
                    </div>
                    </center>
                </div>
            </section>
            <script src="/configuration_interface.js"></script>

        </body>
        </html>
    `);
  });
};

module.exports = configurationInterface;