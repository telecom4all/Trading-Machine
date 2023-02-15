const checkAuth = require('../auth');
const config = require('../config');

const homeRoute = (app) => {
 
  app.get('/', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    
    res.send(`
        <html>
        <head>
            <title>Bot MultiCoin MultiStrat</title>
            <!-- Inclusion du fichier CSS -->
            <link rel="stylesheet" type="text/css" href="/style.css">
        </head>
        <body>
            <!-- Ajout d'un menu en haut de la page -->
            <nav>
            <a href="/">Page principale</a>
            <a href="/configuration">Configuration Bot</a>
            <a href="/place_trade">Trade Manuel</a>
            </nav>
            <!-- Fin du menu -->
            <h1>Bots de Trading</h1>
            <div id="main">
                
                <div id="list_bots" class="bot_node">
                    <h2>Liste des Bots de Trading</h2>
                    <div id="list_bots_content"></div>   
                </div>
                <!-- Logs de winston -->
                <div id="log_node" class="bot_node">
                    <h2>Logs du Node</h2>
                    <div id="log_node_content"></div>   
                </div>
            </div>
        </body>
        </html>
    `);
  });
};

module.exports = homeRoute;