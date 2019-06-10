module.exports = function(app) {
  app.set('views','server/app/views')
  app.set('view engine', 'ejs');
  const cookieParser = require('cookie-parser')
  const _ = require('lodash');
  const fse = require('fs-extra');
  const path = require('path');
  const multer  = require('multer');
  const multerS3 = require('multer-s3')
  const aws = require('aws-sdk')
  const spacesEndpoint = new aws.Endpoint('sfo2.digitaloceanspaces.com');
  const { github_credentials, base_url } = require('../app/misc/constants');
  const bodyParser = require('body-parser')
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())
  // aws.config.update({
  //   secretAccessKey: 'Hrx1uwtkL+UUlf4ou9HnDG9t0LpaW/r8oTGyPSi8fTY',
  //   accessKeyId: 'QH3IZ37TWO7KQ7P3RJ6U'
  // });
  var s3 = new aws.S3({
    endpoint: spacesEndpoint,
    credentials: new aws.Credentials({
    accessKeyId: 'XEKCGBLUY3MMFFGZ52AC',
    secretAccessKey: 'knF5NOqv82gGQSCb7lIUaH3tj1CYNpZTbSz4at3ZP3U'
    })
  });

  var params = {
    Bucket: "https://opensourcerepos.sfo2.digitaloceanspaces.com"
  };

  var upload = multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: 'opensourcerepos',
      key: function (req, file, cb) {
        console.log(file);
        // cb(null, file.originalname)
        cb(null, Date.now().toString())
      }
    })
  })
  // }).array('file',1);

  const { getBlogsList, getBlog, getBlogsFromLocalRepos, getProfileData, getBlogsListForUser, getDraftBlogsListForUser, writeBlogsToFile } = require('./utils');
  app.use(cookieParser())
  // const indexRouter = require('../app/routes/index');
  // const loginRouter = require('../app/routes/login');
  const router = app.loopback.Router();
  app.use(function(req, res, next){
    console.log(req.originalUrl)
    next();
  })
  router.get('/', async function(req, res) {
    // const query = req.query.repo;
    try{
      // if(_.isEmpty(query)){
      //   var blogs = await getBlogsList(app, query);
      // }else{
      //   var blogs = await getBlogsFromLocalRepos(app, query);
      // }
      var blogs = await getBlogsList(app, '');
      res.render('index', {
        data: blogs,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      res.render('error', {
        error: e,
        message: 'error'
      });
    }
  });

  router.get('/search', async function(req, res) {
    const query = req.query.repo;
    try{
      if(_.isEmpty(query)){
        var blogs = await getBlogsList(app, query);
      }else{
        var blogs = await getBlogsFromLocalRepos(app, query);
      }

      res.render('index', {
        data: blogs,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      res.render('error', {
        error: e,
        message: 'error',
        github: github_credentials,
        base_url: base_url
      });
    }
  });

  router.get('/preview/:id/:title', async function(req, res){
    try{
      var id = req.params.id;
      var blog = await getBlog(app.models.Blog, id, true);
      res.render('blog', {
        blog,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      res.render('error', {
        message: 'Error',
        error: e,
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/preview-draft/:id/:title', async function(req, res){
    try{
      var id = req.params.id;
      var blog = await getBlog(app.models.BlogDraft, id, true);
      res.render('blog', {
        blog,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      res.render('error', {
        message: 'Error',
        error: e,
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/blog/:id/:title', async function(req, res){
    try{
      var id = req.params.id;
      var blog = await getBlog(app.models.Blog, id);
      res.render('blog', {
        blog,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      res.render('error', {
        message: 'Error',
        error: e,
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/blog/edit/:id/:title', async function(req, res){
    try{
      var id = req.params.id;
      var blog = await getBlog(app.models.Blog, id);
      blog.edit = true;
      res.render('project-editor', {
        blog: blog,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      console.log(e);
      res.render('error', {
        message: 'Error',
        error: e,
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/blog/edit-draft/:id/:title', async function(req, res){
    try{
      var id = req.params.id;
      var blog = await getBlog(app.models.BlogDraft, id);
      blog.edit = true;
      res.render('project-editor', {
        blog: blog,
        github: github_credentials,
        base_url: base_url
      });
    }catch(e){
      console.log(e);
      res.render('error', {
        message: 'Error',
        error: e,
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/publish-blogs', async function(req, res){
    try{
      await writeBlogsToFile(app);
      // var blogs = await getBlogsList(app);
      // await fse.ensureDir(path.join(__dirname, '../../blogs'));
      // const indexFilePath = path.join(__dirname, '../../blogs/index.html');
      // writeFile('./server/app/views/index.ejs', indexFilePath, {
      //   data: blogs
      // })
      // _.forEach(blogs, async blog => {
      //   const result = await getBlog(app, blog.id);
      //   const folderPath = path.join(__dirname, `../../blogs/blog/${blog.id}`)
      //   const blogName = _.kebabCase(blog.title);
      //   await fse.ensureDir(folderPath);
      //   writeFile('./server/app/views/blog.ejs',`${folderPath}/${blogName}.html`, {
      //     blog: result
      //   })
      // })
      await fse.ensureDir(path.join(__dirname, `../../blogs/javascripts`));
      await fse.ensureDir(path.join(__dirname, `../../blogs/stylesheets`));
      await fse.ensureDir(path.join(__dirname, `../../blogs/images`));
      await fse.copy(path.join(__dirname, `../../client/javascripts`),  path.join(__dirname, `../../blogs/javascripts`))
      await fse.copy(path.join(__dirname, `../../client/stylesheets`),  path.join(__dirname, `../../blogs/stylesheets`))
      await fse.copy(path.join(__dirname, `../../client/images`),  path.join(__dirname, `../../blogs/images`))
      res.send('All static files published')
    }catch(e){
      res.render('error', {
        error: e,
        message: 'error',
        github: github_credentials,
        base_url: base_url
      });
    }
  })

  router.get('/new-blog', function(req,res){
    res.render('project-editor', {
      blog: {},
      github: github_credentials,
      base_url: base_url
    })
  })
  router.get('/about', function(req,res){
    res.render('about', {
      github: github_credentials,
      base_url: base_url
    })
  })

  // router.post('/imageupload', upload.single('file'), function (req, res, next) {

  //   const tempPath = req.file.path;
  //   const targetPath = path.join(__dirname, "../../uploads/image.png");

  //   if (path.extname(req.file.originalname).toLowerCase() === ".png") {
  //     fse.rename(tempPath, targetPath, err => {
  //       if (err) {
  //         console.log(err);
  //         return res
  //         .status(500)
  //         .contentType("text/plain")
  //         .end("Oops! Something went wrong!");
  //       }

  //       res.send({
  //         location: '/uploads/image.png'
  //       })
  //     });
  //   } else {
  //     fse.unlink(tempPath, err => {
  //       if (err){
  //         console.log(err);
  //         return res
  //           .status(500)
  //           .contentType("text/plain")
  //           .end("Oops! Something went wrong!");
  //       }

  //       res
  //         .status(403)
  //         .contentType("text/plain")
  //         .end("Only .png files are allowed!");
  //     });
  //   }
  //   // req.file is the `avatar` file
  //   // req.body will hold the text fields, if there were any
  // })

  router.post('/imageupload', upload.single('file'), function (req, res, next) {
    const { location } = req.file;
    res.send({
      location
    })
    // upload(req, res, (error, response) => {
    //   if (error) {
    //     console.log(error);
    //     return res.status(500).send(error);
    //   }
    //   console.log(req.file.key);
    //   console.log('File uploaded successfully.');
    //   res.send("success");
    // });
  })

  router.get('/bucket', function(req, res, next){
    s3.listBuckets({}, function(err, data) {
      if (err) console.log(err, err.stack);
          else {
              data['Buckets'].forEach(function(space) {
              console.log(space['Name']);
          })};
          res.send('done')
      });
  })

  router.get('/profile', async function(req, res, next){
    const token = req.cookies.token;
    try{
      const profileData = await getProfileData(app, token);
      if(profileData){
        const blogsList = await getBlogsListForUser(app, profileData.id);
        res.render('profile', {
          profileData,
          blogsList,
          github: github_credentials,
          base_url: base_url
        })
      }else{
        res.send('No user found')
      }

    }catch(e){

    }

  })

  router.get('/profile/my-blogs', async function(req, res, next){
    const token = req.cookies.token;
    try{
      const profileData = await getProfileData(app, token);
      if(profileData){
        const blogsList = await getBlogsListForUser(app, profileData.id);
        res.render('my-blogs', {
          profileData,
          data: blogsList,
          github: github_credentials,
          base_url: base_url
        })
      }else{
        res.send('No user found')
      }
    }catch(e){
    }
  })

  router.get('/profile/my-blogs/draft', async function(req, res, next){
    const token = req.cookies.token;
    try{
      const profileData = await getProfileData(app, token);
      if(profileData){
        const blogsList = await getDraftBlogsListForUser(app, profileData.id);
        res.render('my-blogs', {
          profileData,
          data: blogsList,
          github: github_credentials,
          base_url: base_url
        })
      }else{
        res.send('No user found')
      }
    }catch(e){
    }
  })

  app.use('/app',router);
  const blogRouter = require('../app/blogs/blog');
  app.use('/app/blogs', blogRouter);
}
