const { isEmpty, omit, keys } = require('lodash');
const Octokit = require('@octokit/rest');
const schedule = require('node-schedule');
const app = require('../../server.js');

function getUserFromToken(AppUsers, token){
  return new Promise((resolve, reject) => {
    // this is not working
    AppUsers.find({
      where: {
        access_token: token
      }
    }, function(err, response){
      if(err) return reject({});
      if(isEmpty(response)){
        return resolve({})
      }
      return resolve(response[0].id)
    })
  })
}

function searchForRepo(repoIdentifier, model){
  return new Promise((resolve, reject)=>{
    model.findOne({
      where: {
        repoIdentifier
      }
    },function(err,response){

      console.log("error", err, "response", response)
      if(err) return reject({});
      if(isEmpty(response)){
        return resolve({})
      }
      return resolve(response.id)
    })
  })

}

function createNewRepo(repoIdentifier, model, token){
  return new Promise(async (resolve, reject)=>{
    try{
      const clientWithAuth = new Octokit({
        auth: token
      })
      const result = await clientWithAuth.request('GET /repositories/:id', {id: repoIdentifier})
      const { data } = result;
      const { id, name, full_name, html_url, description, license, created_at, owner } = data;
      model.upsert({
        name,
        full_name,
        url: html_url,
        description,
        license,
        owner,
        "repo_created_at": created_at,
        "created_at": (new Date()).getTime(),
        repoIdentifier: id,
        "type_of_vcs": "github"
      }, (err, response)=>{
        if(err) reject(err);
        return resolve(response.id)
      })

    }catch(e){
      console.log(e);
      return reject({})
      // return ['','not logged in']
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
      fields: ['repoIdentifier']
    }, (err, response)=>{
      if(err) return reject(err);
      resolve(response);
    })
  })
}

function saveBlog(blog, model, token){
  return new Promise(async (resolve, reject)=>{
    const { repo_id } = blog;

    const { Repo, AppUsers } = app.models;
    try{
      let createdUserId = "";
      let repoIdentifier = "";
      createdUserId = await getUserFromToken(AppUsers, token);
      if(!isEmpty(repo_id)){
        repoIdentifier = await searchForRepo(repo_id, Repo)
        if(isEmpty(repoIdentifier)){
          repoIdentifier = await createNewRepo(repo_id, Repo, token);
        }
      }
      const updatedBlogObject = {
        ...blog,
        ...{
          repo_id: repoIdentifier
        },
        ...{
          created_user_id: createdUserId
        }
      }

      if(blog.publish_date){
        const publishDateTime = new Date(blog.publish_date);
        if(publishDateTime.getTime() > (new Date()).getTime()){
          blog.status = "draft";
          schedule.scheduleJob(publishDateTime, publishBlog.bind(null, updatedBlogObject, model))
        }
      }
      model.upsert(updatedBlogObject
      ,(err, response)=>{
        if(err) reject(err)
        resolve(response)
      })
    }catch(e){
      console.log(e);
      reject(e);
    }

  })
}

function publishBlog(blog, model){
  const { id } = blog;
  model.upsert({
    ...blog,
    ...{
      status: 'published'
    }
  },(err, response)=>{
    if(err) reject(err)
    console.log('blog '+blog.id+' published')
  })

}



module.exports = {
  searchForRepo,
  createNewRepo,
  saveBlog,
  searchRepoLocal
}
