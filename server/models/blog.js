'use strict';
// const { saveBlog } = require('./utils');

module.exports = function(Blog) {
  // Blog.saveblog = function(req, res){
  //   saveBlog(req.body, Blog, req.cookies.token).then(response=>{
  //     res.send(response);
  //   }).catch(e=>{
  //     console.log(e);
  //     res.sendStatus(500);
  //   })

  // }

  // Blog.remoteMethod(
  //   'saveblog', {
  //     http: {
  //       path: '/saveblog',
  //       verb: 'post'
  //     },
  //     accepts: [{
  //       arg: 'req', type: 'object', 'http': {source: 'req'}
  //     },{
  //       arg: 'res', type: 'object', 'http': {source: 'res'}
  //     }],
  //     // returns: {
  //     //   arg: 'res', type: 'object', 'http': {source: 'res'}
  //     // }
  //   }
  // );
};
