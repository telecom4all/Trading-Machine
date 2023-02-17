const config = require('../config');
const configSecret = require('../config_secret');
const checkAuth = require('../auth');

const loginRoute = (app) => {
  app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Login</title>
            <!-- Inclusion du fichier CSS -->
            <link rel="stylesheet" type="text/css" href="/style.css">
            </head>
            <body style="display: flex;align-items: center;height: 100vh;">
            <form id="form_login" action="/login" method="post" autocomplete="off">
                <input type="password" name="password" placeholder="Password">
                <button type="submit">Submit</button>
            </form>
            </body>
        </html>
    `);
  });

  app.post('/login', (req, res) => {
    if (req.body.password === configSecret.node.password_web) {
      req.session.auth_web = true;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
};

module.exports = loginRoute;