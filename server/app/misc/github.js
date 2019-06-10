
module.exports = function(app){
  const router = app.loopback.Router();
  const Octokit = require('@octokit/rest')
  const { github_credentials } = require('./constants');

  router.get('/callback', (req, res) => {
    const code = req.query.code;
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      data: {
        client_id: github_credentials.clientId,
        client_secret: github_credentials.clientSecret,
        code: code,
        accept: 'json'
      }
    }).then(response=>{
      console.log(response);
      res.send(`
        <div>
          Go to url http://localhost:3000/github/user/:access_token<br/>
          Go to url http://localhost:3000/github/repos/:access_token
        </div>
        <div>
        ${response.data}
        </div>
      `)
    }).catch(e=>{
      console.log("error ", e)
      res.send({
        error: "error"
      })
    })

  })

  router.get('/user/:access_token', async (req, res)=>{
    const access_token = req.params.access_token;
    const clientWithAuth = new Octokit({
      auth: access_token
    })
    try{
      const response = await clientWithAuth.users.getAuthenticated();
      res.send(response);
    }catch(e){
      res.send(e);
    }
  })

  router.get('/repos/:access_token', async (req, res) => {
    const access_token = req.params.access_token;
    const clientWithAuth = new Octokit({
      auth: access_token
    })
    try{
      const response = await clientWithAuth.repos.list();
      res.send(response);
    }catch(e){
      res.send(e);
    }
  })

  router.get('/check-collaborator/:access_token/:owner/:repo/:username', async (req,res) => {
    const { access_token, owner, repo, username } = req.params;
    const clientWithAuth = new Octokit({
      auth: access_token
    })
    console.log(access_token, owner, repo, username);
    try{
      const response = await clientWithAuth.repos.getCollaboratorPermissionLevel({
        owner, // sant0shg
        repo, // opensourcerepos-repolist
        username // sant0shg
      });
      res.send(response);
    }catch(e){
      res.send(e);
    }
  })
}
