const checkAuth = require('../auth');
const config = require('../config');

const configurationRoute = (app) => {
  app.get('/configuration', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');

    let strategiesHTML = '';
    let generalHTML = '';
    let telegramHTML ='';
    let stratGeneralHTML = '';
    let historiqueHTML = '';
    
    res.send(`
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
        </body>
        </html>
    `);
  });
};

module.exports = configurationRoute;