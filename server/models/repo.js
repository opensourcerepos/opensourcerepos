'use strict';
const Octokit = require('@octokit/rest');
const { searchRepoLocal } = require('./utils');

module.exports = function(Repo) {
  Repo['searchRepo'] = async function(q, req, res) {
    const token = req.cookies.token;
    try{
      const clientWithAuth = new Octokit({
        auth: token
      })
      const result = await clientWithAuth.search.repos({
        q,
        per_page: 5
      })
      const { items } = result.data;
      res.send(items);
    }catch(e){
      console.log(e);
      res.send([])
      // return ['','not logged in']
    }

  };
  Repo.remoteMethod(
    'searchRepo', {
      http: {
        path: '/search/repos',
        verb: 'get'
      },
      accepts: [{
        arg: 'q',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'req', type: 'object', 'http': {source: 'req'}
      },{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );

  Repo['listtags'] = async function(owner, repo, req, res) {
    const token = req.cookies.token;
    try{
      const clientWithAuth = new Octokit({
        auth: token
      })
      const result = await clientWithAuth.repos.listTags({
        owner,
        repo
      })
      res.send(result);
    }catch(e){
      console.log(e);
      res.send([])
      // return ['','not logged in']
    }

  };
  Repo.remoteMethod(
    'listtags', {
      http: {
        path: '/list/tags',
        verb: 'get'
      },
      accepts: [{
        arg: 'owner',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'repo',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'req', type: 'object', 'http': {source: 'req'}
      },{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );

  Repo['listbranches'] = async function(owner, repo, req, res) {
    const token = req.cookies.token;
    try{
      const clientWithAuth = new Octokit({
        auth: token
      })
      const result = await clientWithAuth.repos.listBranches({
        owner,
        repo
      })
      res.send(result);
    }catch(e){
      console.log(e);
      res.send([])
      // return ['','not logged in']
    }

  };
  Repo.remoteMethod(
    'listbranches', {
      http: {
        path: '/list/branches',
        verb: 'get'
      },
      accepts: [{
        arg: 'owner',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'repo',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'req', type: 'object', 'http': {source: 'req'}
      },{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );

  Repo['searchReposLocal'] = async function(query, req, res) {
    try{
      const response = await searchRepoLocal(query, Repo)
      res.send(response);
    }catch(e){
      console.log(e);
      res.send([])
      // return ['','not logged in']
    }

  };
  Repo.remoteMethod(
    'searchReposLocal', {
      http: {
        path: '/searchlocal',
        verb: 'get'
      },
      accepts: [{
        arg: 'query',
        type: 'string',
        required: true,
        http: { source: 'query' }
      },{
        arg: 'req', type: 'object', 'http': {source: 'req'}
      },{
        arg: 'res', type: 'object', 'http': {source: 'res'}
      }],
      // returns: {
      //   arg: 'res', type: 'object', 'http': {source: 'res'}
      // }
    }
  );
};
