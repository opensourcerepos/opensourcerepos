const { datasource } = require('../config');

module.exports = {
  "opensourcerepos": datasource,
  "memdb": {
    "name": "memdb",
    "localStorage": "",
    "file": "",
    "connector": "memory"
  }
}
