function project_init(){
  // var isEditForm = jQuery('#project-edit').val();
  // if(!isEditForm){
  //   saveFormAsDraft();
  // }
  // saveFormAsDraft();
  disableRepoBranchVersion();
}



function submitForm(type){
  if(type === 'draft' || type === 'preview'){
    saveFormAsDraft();
  }else{
    saveForm()
  }
}

function getFormDetails(){
  var ids = [
    '#project-title',
    '#project-description',
    '#project-repository-id',
    '#project-blog-id',
    '#project-repository-repo-version',
    '#project-repository-repo-branch',
    '#project-repository-blog-url',
    '#project-repository-publish-date',
    '#project-repository-excerpt-seo',
    '#project-edit'
  ]
  // var data = _.map(ids,id => jQuery(id).val());
  var data = _.reduce(ids, (result, value)=>{
    var id = value.match(/#(.*)+/)[1];
    if(id === "project-description"){
      result[id] = tinyMCE.get('project-description').getContent()
    }else{
      result[id] = jQuery(value).val();
    }
    return result;
  }, {});
  // if(!_.isUndefined(data['project-edit']) && data['project-edit']){
  //   data['status'] = 'published';
  // }else{
  //   data['status'] = 'draft';
  // }
  return data;
}

function getBodyFromFormDetails(){
  var data = getFormDetails();
  var body = {
    "title": data['project-title'],
    "excerpt": data['project-description'],
    "created_at": moment().format(),
    "last_updated_at": moment().format(),
    "meta_title": data['project-title'],
    "meta_description": data['project-repository-excerpt-seo'],
    "repo_version": data['project-repository-repo-version'] || "",
    "repo_branch": data['project-repository-repo-branch'] || "",
    "publish_date": data['project-repository-publish-date'],
    "og_image": data['project-repository-background-img'],
    "og_title": data['project-title'],
    "og_description": data['project-description'],
    "twitter_image": data['project-repository-background-img'],
    "twitter_title": data['project-title'],
    "twitter_description": data['project-description'],
    "canonical_url": data['project-repository-blog-url'],
    "repo_id": data['project-repository-id'],
    "tag1": "",
    "tag2": "",
    "tag3": "",
    "tag4": "",
    "tag5": ""
  }
  if(data['project-blog-id']){
    body['id'] = data['project-blog-id']
  }
  return body
}

function saveFormAsDraft(){
  var data = getBodyFromFormDetails('draft');
  // blog draft id is primary key for drafts
  // if(data.blog_draft_id){
  //   data['id'] = data.blog_draft_id
  // }
  axios({
    url: '/app/blogs/saveblogdraft',
    method: 'POST',
    data: data
  }).then(response=>{
    jQuery('#project-blog-id').attr('value',response.data.id)
    jQuery('#preview-blog').attr('href', '/preview/'+response.data.id+'/preview');
    setTimeout(function(){
      saveFormAsDraft()
    },1000)
  })
}

function saveForm(){
  var data = getBodyFromFormDetails('published');
  // if(data.id){
  //   blog.blog_draft_id = data.id;
  // }
  data["status"] = "published";
  axios({
    url: '/app/blogs/saveblog',
    method: 'POST',
    data: data
  }).then(response=>{
    jQuery('#project-blog-status').html('Blog saved successfully')
    jQuery('#project-blog-status').removeClass('d-none')
  })
}

var repositoryResults = [];
var selectedRepository = {};
function addRepo(repoId){
  selectedRepository = _.find(repositoryResults, (repo)=>repo.id == repoId);
  jQuery('#project-repository-results').html('');
  jQuery('#project-repository-id').attr('value',repoId)
  jQuery("#project-repository-selected").html('<button type="button" class="btn btn-secondary btn-sm">'+selectedRepository.full_name+'</button>')
  getRepoBranchesVersion(selectedRepository);
  enableRepoBranchVersion();
}

function enableRepoBranchVersion(type){
  if(type === 'repo'){
    jQuery('#project-repository-repo-branch').removeAttr('disabled');
  }else if(type === 'branch'){
    jQuery('#project-repository-repo-version').removeAttr('disabled');
  }else{
    jQuery('#project-repository-repo-branch').removeAttr('disabled');
    jQuery('#project-repository-repo-version').removeAttr('disabled');
  }
}

function disableRepoBranchVersion(type){
  if(type === 'repo'){
    jQuery('#project-repository-repo-branch').attr('disabled',true);
  }else if(type === 'branch'){
    jQuery('#project-repository-repo-version').attr('disabled', true);
  }else{
    jQuery('#project-repository-repo-branch').attr('disabled',true);
    jQuery('#project-repository-repo-version').attr('disabled', true);
  }
}

function clearSearchResults(e){
  jQuery("#project-repository-results").html('')
}


function renderSearchResults(){
  var html = '';
  _.forEach(repositoryResults, repo=>{
    html += `
      <div class="project-repository-results-item" onclick="addRepo(${repo.id})">${repo.full_name}</div>
    `
  })

  jQuery('#project-repository-results').html(html)
}

function renderEmptyState(){
  jQuery('#project-repository-results').html(`
    <div class="alert alert-info mt-2" role="alert">
    No repositories found. <a href="/onboard-new-repository" target="_blank">Onboard new repository</a>
    </div>
  `)
}

function renderErrorState(){
  jQuery('#project-repository-results').html(`
    <div class="alert alert-danger mt-2" role="alert">
      Error fetching results
    </div>`)
}
var searchRepository = _.debounce(function(){
  var searchText = jQuery('#project-repository').val();
  axios({
    url: '/api/repos/search/repos?q='+searchText,
    method: 'GET'
  }).then(function(response){
    if(_.isEmpty(response.data)){
      renderEmptyState();
    }else{
      repositoryResults = response.data;
      renderSearchResults();
    }

  }).catch(function(error){
    renderErrorState();

  })
  repositoryResults = [
    {
      "id": 10270250,
      "node_id": "MDEwOlJlcG9zaXRvcnkxMDI3MDI1MA==",
      "name": "react",
      "full_name": "facebook/react",
      "private": false,
      "owner": {
        "login": "facebook",
        "id": 69631,
        "node_id": "MDEyOk9yZ2FuaXphdGlvbjY5NjMx",
        "avatar_url": "https://avatars3.githubusercontent.com/u/69631?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/facebook",
        "html_url": "https://github.com/facebook",
        "followers_url": "https://api.github.com/users/facebook/followers",
        "following_url": "https://api.github.com/users/facebook/following{/other_user}",
        "gists_url": "https://api.github.com/users/facebook/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/facebook/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/facebook/subscriptions",
        "organizations_url": "https://api.github.com/users/facebook/orgs",
        "repos_url": "https://api.github.com/users/facebook/repos",
        "events_url": "https://api.github.com/users/facebook/events{/privacy}",
        "received_events_url": "https://api.github.com/users/facebook/received_events",
        "type": "Organization",
        "site_admin": false
      },
      "html_url": "https://github.com/facebook/react",
      "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      "fork": false,
      "url": "https://api.github.com/repos/facebook/react",
      "forks_url": "https://api.github.com/repos/facebook/react/forks",
      "keys_url": "https://api.github.com/repos/facebook/react/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/facebook/react/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/facebook/react/teams",
      "hooks_url": "https://api.github.com/repos/facebook/react/hooks",
      "issue_events_url": "https://api.github.com/repos/facebook/react/issues/events{/number}",
      "events_url": "https://api.github.com/repos/facebook/react/events",
      "assignees_url": "https://api.github.com/repos/facebook/react/assignees{/user}",
      "branches_url": "https://api.github.com/repos/facebook/react/branches{/branch}",
      "tags_url": "https://api.github.com/repos/facebook/react/tags",
      "blobs_url": "https://api.github.com/repos/facebook/react/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/facebook/react/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/facebook/react/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/facebook/react/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/facebook/react/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/facebook/react/languages",
      "stargazers_url": "https://api.github.com/repos/facebook/react/stargazers",
      "contributors_url": "https://api.github.com/repos/facebook/react/contributors",
      "subscribers_url": "https://api.github.com/repos/facebook/react/subscribers",
      "subscription_url": "https://api.github.com/repos/facebook/react/subscription",
      "commits_url": "https://api.github.com/repos/facebook/react/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/facebook/react/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/facebook/react/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/facebook/react/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/facebook/react/contents/{+path}",
      "compare_url": "https://api.github.com/repos/facebook/react/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/facebook/react/merges",
      "archive_url": "https://api.github.com/repos/facebook/react/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/facebook/react/downloads",
      "issues_url": "https://api.github.com/repos/facebook/react/issues{/number}",
      "pulls_url": "https://api.github.com/repos/facebook/react/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/facebook/react/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/facebook/react/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/facebook/react/labels{/name}",
      "releases_url": "https://api.github.com/repos/facebook/react/releases{/id}",
      "deployments_url": "https://api.github.com/repos/facebook/react/deployments",
      "created_at": "2013-05-24T16:15:54Z",
      "updated_at": "2019-05-11T09:43:28Z",
      "pushed_at": "2019-05-11T08:21:30Z",
      "git_url": "git://github.com/facebook/react.git",
      "ssh_url": "git@github.com:facebook/react.git",
      "clone_url": "https://github.com/facebook/react.git",
      "svn_url": "https://github.com/facebook/react",
      "homepage": "https://reactjs.org",
      "size": 141777,
      "stargazers_count": 128803,
      "watchers_count": 128803,
      "language": "JavaScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "forks_count": 23620,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 661,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "forks": 23620,
      "open_issues": 661,
      "watchers": 128803,
      "default_branch": "master",
      "permissions": {
        "admin": false,
        "push": false,
        "pull": true
      },
      "score": 91.03488
    },
    {
      "full_name": "reactphp/react",
      "id": 4287921
    },
    {
      "full_name": "duxianwei520/react",
      "id": 75396575
    },
    {
      "full_name": "discountry/react",
      "id": 90759930
    },
    {
      "full_name": "Cathy0807/react",
      "id": 72628285
    }
  ]
  renderSearchResults(repositoryResults);
}, 250, { 'maxWait': 1000 })

function openProjectMenu(){
  jQuery(".custom-sidebar-wrapper").addClass("open")
  jQuery(".custom-modal-backdrop").addClass("show")
}

function closeProjectMenu(){
  jQuery(".custom-sidebar-wrapper").removeClass("open")
  jQuery(".custom-modal-backdrop").removeClass("show")
}

function renderOptions(result, id){
  var options = '';
  for(var i=0;i<result.data.length;i++){
    options += '<option>'+result.data[i].name+'</option>';
  }
  jQuery(id).html(options);
}

function getRepoBranchesVersion(selectedRepository){
  var owner = selectedRepository.owner.login;
  var repo = selectedRepository.name;
  axios({
    url: '/api/repos/list/tags?owner='+owner+'&repo='+repo,
    method: 'GET'
  }).then(function(response){
    if(_.isEmpty(response.data)){
      disableRepoBranchVersion('repo');
    }else{
      enableRepoBranchVersion('repo');
      renderOptions(response.data, '#project-repository-repo-version');
    }

  }).catch(function(error){
    disableRepoBranchVersion('repo');
  })

  axios({
    url: '/api/repos/list/branches?owner='+owner+'&repo='+repo,
    method: 'GET'
  }).then(function(response){
    if(_.isEmpty(response.data)){
      // jQuery('#project-repository-repo-branch')
      disableRepoBranchVersion('branch')
    }else{
      enableRepoBranchVersion('branch')
      renderOptions(response.data, '#project-repository-repo-branch');
    }

  }).catch(function(error){
    // renderErrorState();
    disableRepoBranchVersion('branch')
  })

}

jQuery(document).ready(() => {
  jQuery(".custom-modal-backdrop").click(() => {
    closeProjectMenu();
  })
})

var confirmOnPageExit = function (e) {
if(jQuery("#project-blog-status").text() === "Blog saved successfully"){
  return false;
}
// If we haven't been passed the event get the window.event
e = e || window.event;

var message = "Are you sure you want to navigate away from this page? All unsaved changes will be lost.";

// For IE6-8 and Firefox prior to version 4
if (e)
{
    e.returnValue = message;
}

// For Chrome, Safari, IE8+ and Opera 12+
return message;
};
window.onbeforeunload = confirmOnPageExit;
