const  _  = require('lodash')
const moment = require('moment');
const fs = require('fs');
const fse = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const app = require('../server');

const { github_credentials, base_url } = require('../app/misc/constants');

function writeBlogsToFile(app){
  return new Promise(async (resolve, reject)=>{
    try{
      var blogs = await getBlogsList(app);
      await fse.ensureDir(path.join(__dirname, '../../blogs'));
      const indexFilePath = path.join(__dirname, '../../blogs/index.html');
      writeFile('./server/app/views/index.ejs', indexFilePath, {
        data: blogs,
        github: github_credentials,
        base_url: base_url
      })
      _.forEach(blogs, async blog => {
        const result = await getBlog(app.models.Blog, blog.id);
        const folderPath = path.join(__dirname, `../../blogs/blog/${blog.id}`)
        const blogName = _.kebabCase(blog.title);
        await fse.ensureDir(folderPath);
        writeFile('./server/app/views/blog.ejs',`${folderPath}/${blogName}.html`, {
          blog: result,
          github: github_credentials,
          base_url: base_url
        })
      })
      resolve()
    }catch(e){
      reject(e);
    }

  })
}

function writeSingleBlogToFile(blog){
  return new Promise(async (resolve, reject)=>{
    try{

      var blogs = await getBlogsList(app);
      await fse.ensureDir(path.join(__dirname, '../../blogs'));
      const indexFilePath = path.join(__dirname, '../../blogs/index.html');
      writeFile('./server/app/views/index.ejs', indexFilePath, {
        data: blogs,
        github: github_credentials,
        base_url: base_url
      })

      const result = await getBlog(app.models.Blog, blog.id);
      const folderPath = path.join(__dirname, `../../blogs/blog/${blog.id}`)
      const blogName = _.kebabCase(blog.title);
      await fse.ensureDir(folderPath);
      writeFile('./server/app/views/blog.ejs',`${folderPath}/${blogName}.html`, {
        blog: result,
        github: github_credentials,
        base_url: base_url
      })

      resolve()
    }catch(e){
      reject(e);
    }

  })
}

function writeFile(templatePath, filePath, content){
  const ejsTemplate = fs.readFileSync(templatePath,'utf-8');
  let template = ejs.compile(ejsTemplate, {
    filename: templatePath
  });
  // const html = template({ title:title, blog: post});
  const html = template(content);
  // fs.writeFile(path.join(__dirname, '../../client/blogs/'+fileName+'.html'), html, (err) => {
  fs.writeFile(filePath, html, (err) => {
    if (err) console.log(err);
    console.log(`${filePath} - The file has been saved!`);
  });
}

function getProfileData(app, access_token){
  return new Promise((resolve, reject)=>{
    const { AppUsers } = app.models
    AppUsers.findOne({
      where:{
        access_token
      }
    }, function(err, response){
      if(err){
        reject(err);
        return;
      }
      resolve(response);
    })
  })
}

function getBlogsListForUser(app, userId){
  return new Promise((resolve, reject)=>{
    const Blog = app.models.Blog;
    const modelQueryOptions = {
      where: {
        created_user_id: userId
      },
      include: 'repo',
    }
    Blog.find(modelQueryOptions, function(err, response){
      if(err){
        // res.render('error', {
        //   message: 'Error loading page',
        //   error: err
        // })
        reject(err);
        return;
      }
      for(var i=0;i<response.length;i++){
        response[i] = response[i].toJSON();
        response[i].url = '/app/blog/'+response[i].id+'/'+_.kebabCase(response[i].title);
        response[i].previewurl = '/app/preview/'+response[i].id+'/'+_.kebabCase(response[i].title);
        response[i].editurl = '/app/edit/'+response[i].id+'/'+_.kebabCase(response[i].title || "draft");
        response[i].created_at_friendly = moment(response[i].created_at).format('MMMM Do YYYY, H:mm');
        response[i].last_updated_at_friendly = moment(response[i].last_updated_at).format('MMMM Do YYYY, H:mm');
      }
      resolve(response);
    })
} )
}

function getRepoForBlogId(app, id){
  return new Promise((resolve, reject)=>{
    const { Repo } = app.models;
    Repo.findOne({
      where: {
        id
      }
    }, function(err, response){
      if(err) return reject(err);
      resolve(response);
    })
  })
}

function getDraftBlogsListForUser(app, userId){
  return new Promise((resolve, reject)=>{
    // const BlogDraft = app.models.BlogDraft;
    const opensourcerepos = app.datasources.opensourcerepos;
    opensourcerepos.connector.execute(`select * from blog_draft where created_user_id=$1 and 'id' NOT IN (select blog_draft_id from blog where created_user_id=$1 and blog_draft_id is NOT NULL)`,
    [userId], async function(err, response){
      if(err){
        // res.render('error', {
        //   message: 'Error loading page',
        //   error: err
        // })
        reject(err);
        return;
      }
      for(var i=0;i<response.length;i++){
        // response[i] = response[i].toJSON();
        response[i].repo = await getRepoForBlogId(app, response[i].repo_id);
        response[i].url = '/app/blog/'+response[i].id+'/'+_.kebabCase(response[i].title || "draft");
        response[i].previewurl = '/app/preview-draft/'+response[i].id+'/'+_.kebabCase(response[i].title || "draft");
        response[i].editurl = '/app/edit-draft/'+response[i].id+'/'+_.kebabCase(response[i].title || "draft");
        response[i].created_at_friendly = moment(response[i].created_at).format('MMMM Do YYYY, H:mm');
        response[i].last_updated_at_friendly = moment(response[i].last_updated_at).format('MMMM Do YYYY, H:mm');
      }
      resolve(response);
    })
} )
}

function getBlogsList(app, repoIds){
  return new Promise((resolve, reject)=>{
    const Blog = app.models.Blog;
    const modelQueryOptions = {
      where: {
        "status": "published"
      },
      include: 'repo',
    }
    if(repoIds){
      modelQueryOptions.where.repo_id = {
        inq: repoIds
      }
    }
    Blog.find(modelQueryOptions, function(err, response){
      if(err){
        // res.render('error', {
        //   message: 'Error loading page',
        //   error: err
        // })
        reject(err);
        return;
      }
      for(var i=0;i<response.length;i++){
        response[i] = response[i].toJSON();
        response[i].url = '/app/blog/'+response[i].id+'/'+_.kebabCase(response[i].title);
        response[i].previewurl = '/app/preview/'+response[i].id+'/'+_.kebabCase(response[i].title);
        response[i].editurl = '/app/edit/'+response[i].id+'/'+_.kebabCase(response[i].title || "draft");
        response[i].created_at_friendly = moment(response[i].created_at).format('MMMM Do YYYY, H:mm');
        response[i].last_updated_at_friendly = moment(response[i].last_updated_at).format('MMMM Do YYYY, H:mm');
      }
      resolve(response);
    })
} )
}

function getBlog(Blog, paramId, preview){
  return new Promise((resolve, reject) =>{
    try{

      const id = paramId;
      const option = {
        where: {
          "id": id
        },
        include: 'repo',
      }
      if(preview){
        delete option.where.status
      }
      Blog.findOne(option, function(err, response){
        if(err) return reject(err);
        if(!response) return reject({})
        response = response.toJSON();
        response.url = '/app/blog/'+parseInt(response.id)+'/'+_.kebabCase(response.title);
        response.editurl = '/app/blog/edit/'+parseInt(response.id)+'/'+_.kebabCase(response.title);
        response.unpublishurl = '/app/blog/unpublish/'+parseInt(response.id)+'/'+_.kebabCase(response.title);
        response.created_at_friendly = moment(response.created_at).format('MMMM Do YYYY, H:mm');
        response.last_updated_at_friendly = moment(response.last_updated_at).format('MMMM Do YYYY, H:mm');
        return resolve(response)
      })

    }catch(e){
      console.log(e);
      reject(e)
    }
  })
}


function searchRepoLocal(query, model){
  return new Promise((resolve, reject)=>{
    model.find({
      where:{
        full_name: {
          ilike: '%'+query+'%'
        }
      },
      fields: ['id']
    }, (err, response)=>{
      if(err) return reject(err);
      resolve(response);
    })
  })
}

function getBlogsFromLocalRepos(app, query){
  return new Promise( async (resolve, reject)=>{
    try{
      const response = await searchRepoLocal(query, app.models.Repo);
      const repoIds = _.map(response, res=>_.parseInt(res.id))
      const blogs = await getBlogsList(app, repoIds);
      resolve(blogs);
    }catch(e){
      reject(e);
    }

  })
}

module.exports = {
  writeFile,
  getBlogsList,
  getBlog,
  searchRepoLocal,
  getBlogsFromLocalRepos,
  getProfileData,
  getBlogsListForUser,
  getDraftBlogsListForUser,
  writeBlogsToFile,
  writeSingleBlogToFile
}
