module.exports = function(app){
  const github = require('./github');
  app.use('/github', github)
}
