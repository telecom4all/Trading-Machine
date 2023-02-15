const config = require('./modules/config');
const app = require('./modules/middleware');
const configurationRoute = require('./modules/route/configuration');
const homeRoute = require('./modules/route/home');
const placeTradeRoute = require('./modules/route/place_trade');
const loginRoute = require('./modules/route/login');
const postRoutes = require('./modules/route/post');

configurationRoute(app);
homeRoute(app);
placeTradeRoute(app);
loginRoute(app);
postRoutes(app);

app.listen(config.parametres_generaux.port_web, () => console.log('Server running on port ' + config.parametres_generaux.port_web))