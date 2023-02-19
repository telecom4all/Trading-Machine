const config = require('./modules/config');
const configSecret = require('./modules/config_secret');

const configurationRoute = require('./modules/route/configuration');
const homeRoute = require('./modules/route/home');
const placeTradeRoute = require('./modules/route/place_trade');
const loginRoute = require('./modules/route/login');
const postRoutes = require('./modules/route/post');

const app = require('./modules/middleware');
configurationRoute(app);
homeRoute(app);
placeTradeRoute(app);
loginRoute(app);
postRoutes(app);



//app.listen(configSecret.node.port_web, () => console.log('Server running on port ' + configSecret.node.port_web))