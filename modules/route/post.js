const postRoutes = (app) => {
    app.post('/get_log', (req, res) => {
      res.send("ok")
    });
  
    app.post('/get_price', async (req, res) => {
      res.send("ok")
    });
  };
  
  module.exports = postRoutes;