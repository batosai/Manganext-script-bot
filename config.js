
module.exports = {
  db: require('mysql').createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'manganext_api'
  }),
  baseUrl : 'http://localhost:3000'
};
