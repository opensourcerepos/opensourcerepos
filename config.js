const aws = require('aws-sdk');

module.exports = {
  github_credentials: {
    'clientId': '86c62f3ed3258e96e6a0',
    'clientSecret': 'c97f024588da7ac20b0c2820397dfcb371c6ad2f',
  },
  datasource: {
    'host': 'localhost',
    'port': 5432,
    'url': 'postgres://postgres:postgres@localhost:5432/opensourcerepos?ssl=false',
    'database': 'opensourcerepos',
    'password': 'postgres',
    'name': 'opensourcerepos',
    'user': 'postgres',
    'connector': 'postgresql',
    'ssl': false,
  },
  fileUpload: {
    endpoint: new aws.Endpoint(''),
    credentials: new aws.Credentials({
      accessKeyId: '',
      secretAccessKey: '',
    }),
  },
};
