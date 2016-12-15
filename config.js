
module.exports = {
  db: require('mysql').createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'manganext_api'
  }),
  baseUrl : 'http://localhost:3000'
};

// scp -r api root@163.172.132.179:~/manganext
// sudo systemctl start nginx
