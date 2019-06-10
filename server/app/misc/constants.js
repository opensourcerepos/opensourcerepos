const { github_credentials } = require('../../../config');

const base_url = {
  "development": "http://localhost:8000",
  "production": "https://opensourcerepos.com",
}

module.exports = {
  github_credentials: github_credentials,
  base_url: base_url[process.env.NODE_ENV]
}
