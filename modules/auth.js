const checkAuth = (req, res, next) => {
    if (!req.session.auth_web) {
      res.redirect('/login');
    } else {
      next();
    }
  };
  
module.exports = checkAuth;