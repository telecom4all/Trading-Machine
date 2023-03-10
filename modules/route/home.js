const checkAuth = require('../auth');
const fs = require('fs');
const path = require('path');


const homeRoute = (app) => {
 
  app.get('/', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    
    
    let configFile = path.join(__dirname, '../../jsons/configs/config_interface.json');
    let configInterface = JSON.parse(fs.readFileSync(configFile, 'utf-8'));


    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashbord Bots</title>
            <!-- Inclusion du fichier CSS -->
            <link rel="stylesheet" type="text/css" href="/style.css">
        </head>
        <body>
            <!-- Ajout d'un menu en haut de la page -->
            <nav>
            <a href="/">Page principale</a>
            <a href="/configuration">Configuration Bot</a>
            <a href="/configuration_interface">Configuration Interface</a>
            <a href="/place_trade">Trade Manuel</a>
            <a href="/deconnection" class="logout-link">Deconnection</a>
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
            <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"></script>
            <script src="/home.js"></script>
            <script>

                setInterval(function() {
                    get_log_bots();
                }, ${configInterface.parametres_generaux.delai_log*1000});

                setInterval(function() {
                    update_list_bot();   
                }, ${configInterface.parametres_generaux.delai_interface*1000});
                
            </script>
        </body>
        </html>
    `);
  });
};

module.exports = homeRoute;