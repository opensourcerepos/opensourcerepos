function addUser(response, app){

}

module.exports = function(app){

  // Login['github-callback'] = async function(code) {
  //   try{
  //     // cb(null, {
  //     //   code: code,
  //     //   github_credentials: github_credentials
  //     // })
  //     const response = await axios({
  //       method: 'POST',
  //       url: 'https://github.com/login/oauth/access_token',
  //       data: {
  //         client_id: github_credentials.clientId,
  //         client_secret: github_credentials.clientSecret,
  //         code: code,
  //         accept: 'json'
  //       }
  //     })
  //     return response.data
  //   }catch(e){
  //     return {
  //       error: e
  //     }
  //   }

  // };
  // Login.remoteMethod(
  //   'github-callback', {
  //     http: {
  //       path: '/github/callback',
  //       verb: 'get'
  //     },
  //     accepts: {
  //       arg: 'code',
  //       type: 'string',
  //       required: true,
  //       http: { source: 'query' }
  //     },
  //     returns: {
  //       arg: 'status',
  //       type: 'any'
  //     }
  //   }
  // );
}
