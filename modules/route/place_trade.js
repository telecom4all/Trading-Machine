const checkAuth = require('../auth');
const config = require('../config');
const configSecret = require('../config_secret');

const placeTradeRoute = (app) => {
  app.get('/place_trade', checkAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    
    let listExchanges;
    for (const exchange of configSecret.exchanges) {
        listExchanges += '<option value="' + exchange.name + '" ' + (exchange.name === config.parametres_generaux.exchange_active ? 'selected' : '') + '>' + exchange.name + '</option>';
    }
 
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Trade Manuel</title>
        <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <body>
        <nav>
        <a href="/">Page principale</a>
        <a href="/configuration">Configuration</a>
        <a href="/place_trade">Trade Manuel</a>
        <a href="/defi">DEFI</a>
        <a href="/deconnection" class="logout-link">Deconnection</a>
        </nav>
        <h1>Trade Manuel</h1>
        <div id="main_trade">
            <div id="list_process" class="list-process">
                <h3>List Trade  en attente</h3>
                <div id="content_process"></div>
            </div>
            
            <div id="form" class="form">
                <div>
                    <label for="currentPrice">Current Price: <span id="currentPrice" onclick="put_price_on_pair(this.innerText)"></span> ${config.parametre_strategie_generaux.stableCoin}</label>
                </div> 
                <div class="form-grid">
                    <table class="tableau_general_trade_manuel">
                        <tr class="tr_tableau_general_trade_manuel">
                            <td class="td_tableau_general_trade_manuel_gauche">
                                <label for="pair">Pair:</label>
                                <input type="text" id="pair" name="pair"  placeholder="BTC/USDT" >
                            </td>
                            <td class="td_tableau_general_trade_manuel_droite">
                                
                                <label for="exchange">Exchange:</label>
                                <select id="exchange_active" class="input_select">
                                    ${listExchanges}
                                </select>
                            </td>
                        </tr>

                        <tr class="tr_tableau_general_trade_manuel">
                            <td class="td_tableau_general_trade_manuel_gauche">
                                <label for="timeframe">Timeframe:</label>
                                <select id="timeframe" name="timeframe">
                                    ${config.timeFrames.map(timeframe => `<option value="${timeframe.abbreviation}">${timeframe.name}</option>`).join('')}
                                </select>
                            </td>
                            <td class="td_tableau_general_trade_manuel_droite">
                                <label for="price">Target Price:</label>
                                <input type="text" id="price" name="price">
                            </td>
                        </tr>
                       
                        <tr class="tr_tableau_general_trade_manuel">
                            <td class="td_tableau_general_trade_manuel_gauche">
                                <label for="position">Position:</label>
                                <select id="position" name="position">
                                    <option value="long">Long</option>
                                    <option value="short">Short</option>
                                </select>
                            </td>
                            <td class="td_tableau_general_trade_manuel_droite">
                                <label for="amount">Amount (USD):</label>
                                <input type="text" id="amount" name="amount">   
                            </td>
                        </tr>
                       
                        <tr class="tr_tableau_general_trade_manuel">
                            <td class="td_tableau_general_trade_manuel_gauche">
                                <label for="tp_switch">Take Profit :</label>
                                <input type="checkbox" id="tp_switch" name="tp_switch"  ><br>
                                
                            
                                <label for="tp">Take Profit ( <span id="tpValue">10%</span>):</label><br>
                                <input type="range" min="0" max="2" step="0.01" id="tp" name="tp_percentage" value="0.1">
                                <span id="tpPercentage"></span>%<br>
                            
                                <label for="tp_amount">Take Profit Amount (USD):</label>
                                <input type="text" id="tp_amount" name="tp_amount">
                            </td>
                            <td class="td_tableau_general_trade_manuel_droite">
                                <label for="sl_switch">Stop Loss :</label>
                                <input type="checkbox" id="sl_switch" name="sl_switch"><br>
                                
                                <label for="sl">Stop Loss ( <span id="slValue">10%</span>):</label><br>
                                <input type="range" min="0" max="2" step="0.01" id="sl" name="sl_percentage" value="0.1">
                                <span id="slPercentage"></span>%<br>
                            
                            </td>
                        </tr>
                    </table>
                </div>
                <input type="button" value="Submit" class="submit-button" onclick="send_trade()">
            </div>
            <!-- Logs de winston -->
            <div id="log_node" class="bot_node trade_log">
                <h2>Logs du Node</h2>
                <div id="log_node_content"></div>   
            </div>
            
        </div>
        <script src="/place_trade.js"></script>
        <script>
            setInterval(function() {
                getListProcess();   
            }, ${config.parametres_generaux.delai_interface*1000});

            setInterval(function() {
                get_price();
            }, ${config.parametres_generaux.delai_price*1000});

            setInterval(function() {
                get_log_bots();
            }, ${config.parametres_generaux.delai_log*1000});

            
        </script>
    </body>
    </html>
    `);
  });
};

module.exports = placeTradeRoute;