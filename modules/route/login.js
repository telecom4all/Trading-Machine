const config = require('../config');
const configSecret = require('../config_secret');
const checkAuth = require('../auth');
const bcrypt = require('bcrypt');
const mail = require('../mail')

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

  app.post('/login', async (req, res) => {
    if (configSecret.twoFA.is2fa == true) {
      if (bcrypt.compareSync(req.body.password, configSecret.node.password_web)) {
        const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const message = `Votre code d'authentification est :  ${code}`;
        await mail.sendEmail(message, 'Code d\'authentification');
        req.session.auth_pending = true;
        req.session.auth_code = code;
        res.redirect('/validate-code');
      } else {
        res.redirect('/login');
      }
    } else {
      if (bcrypt.compareSync(req.body.password, configSecret.node.password_web)) {
        req.session.auth_web = true;
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    }
  });

  app.get('/validate-code', (req, res) => {
    if (req.session.auth_pending) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Validate code</title>
            <!-- Inclusion du fichier CSS -->
            <link rel="stylesheet" type="text/css" href="/style.css">
          </head>
          <body style="display: block;align-items: center;height: 100vh; margin-top:25%">
            <form id="form_validate_code" action="/validate-code" method="post" autocomplete="off">
              <input type="text" name="code" placeholder="Authentication code">
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
    } else {
      res.redirect('/login');
    }
  });


  app.post('/validate-code', (req, res) => {
    if (req.session.auth_pending && req.body.code === req.session.auth_code) {
      req.session.auth_web = true;
      delete req.session.auth_pending;
      delete req.session.auth_code;
      res.redirect('/');
    } else {
      delete req.session.auth_pending;
      delete req.session.auth_code;
      res.redirect('/login');
    }
  });
  /*
  app.post('/login', (req, res) => {
    if (bcrypt.compareSync(req.body.password, configSecret.node.password_web)) {
      req.session.auth_web = true;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
*/
  app.get('/deconnection', async (req, res) => {
    try {
      
      req.session.destroy(); // Détruire la session enregistrée
      res.redirect('/login'); // Rediriger l'utilisateur vers la page de connexion
    } catch (err) {
      res.send({status: false, message: err.message});
    }
  });
};

module.exports = loginRoute;