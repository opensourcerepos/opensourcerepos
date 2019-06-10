module.exports = function(app){
  const router = app.loopback.Router();
  router.get('/', function(req, res) {
    res.render('index');
  });
  router.get('/new-blog', function(req,res){
    res.render('project-editor')
  })
}
