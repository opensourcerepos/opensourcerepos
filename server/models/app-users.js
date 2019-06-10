'use strict';
const axios = require('axios');
const { github_credentials } = require('../app/misc/constants');
const Octokit = require('@octokit/rest');
const { isEmpty } = require('lodash');

// userType can be admin or normal user. Admin user can edit other posts.
// by default all users are normal users.

function searchForUser(user, model){
  return new Promise((resolve, reject)=>{
    const { login, email } = user;
    model.findOne({
      where: {
        name: login,
        email: email
      }
    },function(err,response){

      console.log("error", err, "response", response)
      if(err) reject(err);
      if(isEmpty(response)){
        resolve({})
      }
      resolve(response)
    })
  })

}

function createNewUser(user, accesstoken, model){
  return new Promise((resolve, reject)=>{
    const { login, email, avatar_url } = user;
    model.upsert({
      name: login,
      email: email,
      source: "github",
      access_token: accesstoken,
      created_at: (new Date()).getTime(),
      image_url: avatar_url
    },function(err,response){
      if(err) reject(err);
      resolve(response)
    })
  })
}

function updateAccessTokenForUser(user, accesstoken, model){
  return new Promise((resolve, reject)=>{
    const { login, email, avatar_url } = user;
    model.upsertWithWhere({
      name: login,
      email: email,
    },{
      access_token: accesstoken,
      image_url: avatar_url
    },function(err,response){
      if(err) reject(err);
      resolve(response)
    })
  })
}

module.exports = function(Appusers) {

  Appusers['github-callback'] = async function(code, res) {
    try{
      const response = await axios({
        method: 'POST',
        url: 'https://github.com/login/oauth/access_token',
        data: {
          client_id: github_credentials.clientId,
          client_secret: github_credentials.clientSecret,
          code: code,
          accept: 'json'
        }
      })
      // const response = {
      //   data: "access_token=183d6dcea6e74daf235b4110c964c16412bb114b&scope=read%3Auser%2Cuser%3Aemail&token_type=bearer"
      // }
      const params = response.data.match(/access_token=([^&]*)/);
      const accessToken = params[1];
      const clientWithAuth = new Octokit({
        auth: accessToken
      })
      const userDetails = await clientWithAuth.users.getAuthenticated();
      const user = await searchForUser(userDetails.data, Appusers);
      console.log("user", user);
      if(isEmpty(user)){
        await createNewUser(userDetails.data, accessToken, Appusers);
        // await updateAccessTokenForUser(userDetails.data, accessToken, Appusers)
      }
        await updateAccessTokenForUser(userDetails.data, accessToken, Appusers)
      // res.set('Set-Cookie',`token=${accessToken};username=${userDetails.data.login}`);
      res.cookie('token',accessToken);
      res.cookie('username', userDetails.data.login);
      res.send(`<!Doctype html>
      <head>
      </head>
      <body>
      Redirecting ...
      <script>
        window.location.href = '/'
      </script>
      </body>
      </html>
      `)
      // res.send('hello world')
      // return [`token=${accessToken};username=${userDetails.data.login}`,'abc'];

    }catch(e){
      console.log(e);
      res.send(e)
      // return ['','not logged in']
    }

  };
  Appusers.remoteMethod(
    'github-callback', {
      http: {
        path: '/github/callback',
        verb: 'get'
      },
      accepts: [{
        arg: 'code',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );

  Appusers['logout'] = async function(res){
    try{
      res.clearCookie('token');
      res.clearCookie('username');
      res.send(`<!Doctype html>
      <head>
      </head>
      <body>
      Redirecting ...
      <script>
        window.location.href = '/'
      </script>
      </body>
      </html>
      `)
    }catch(e){
      res.send(500)
    }
  }

  Appusers.remoteMethod(
    'logout', {
      http: {
        path: '/logout',
        verb: 'get'
      },
      accepts: [{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );
};
