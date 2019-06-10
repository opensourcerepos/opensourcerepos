// const app = require('loopback')();
// const router = app.loopback.Router();
const app = require('../../server.js');
const router = app.loopback.Router();
const _ = require('lodash');
const { saveBlog } = require('./utils');
const { writeSingleBlogToFile } = require('../../boot/utils');

router.post('/saveblogdraft', function(req, res){
  saveBlog(req.body, app.models.Blog, req.cookies.token).then(response=>{
    res.send(response);
  }).catch(e=>{
    console.log(e);
    res.sendStatus(500);
  })
})

router.post('/saveblog', function(req, res){
  saveBlog(req.body, app.models.Blog, req.cookies.token).then(response=>{
    writeSingleBlogToFile(req.body);
    res.send(response);
  }).catch(e=>{
    console.log(e);
    res.sendStatus(500);
  })
})

router.post('/get_actions_content', (req, res)=>{
  const { id, title, created_user_id } = req.body;
  const { token } = req.cookies;
  const { AppUsers } = app.models;
  AppUsers.findOne({
    where: {
      access_token: token
    }
  }, function(err, result){
    if(err) return res.send('');
    if(result && parseInt(created_user_id) === result.id){
      const editurl = '/app/blog/edit/'+parseInt(id)+'/'+_.kebabCase(title);
      const unpublishurl = '/app/blog/unpublish/'+parseInt(id)+'/'+_.kebabCase(title);
      return res.send(`<h5>Actions</h5>
      <div class="row">

          <div class="col-md-12 mt-2 mb-2">
              <a class="btn btn-sm btn-outline-primary" href="${editurl}">Edit blog</a>

          </div>
          <div class="col-md-12 mt-2 mb-2">
              <a class="btn btn-sm btn-outline-danger"  href="${unpublishurl}">Unpublish blog</a>
          </div>
      </div>`);
    }else{
      return res.send('');
    }
  })
})

module.exports = router;


