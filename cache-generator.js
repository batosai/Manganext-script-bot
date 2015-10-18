'use strict';

var request = require('request');

var i, y;
i = y = 0;

var cache = function(type)
{
  var url;
  if(type == 'now') {
    url = 'http://api.manganext-app.com/api/v2.1/posts/?token=ea5af636cd2c0c07242ee43c07cbefb3&order=DESC&per_page=10&offset='+i+'&list=now&s=';
  }
  else {
    url = 'http://api.manganext-app.com/api/v2.1/posts/?token=ea5af636cd2c0c07242ee43c07cbefb3&order=ASC&per_page=10&offset='+y+'&list=next&s=';
  }

  (function(type){
    console.log(url);
    request(url, function (error, response, body)
    {
      if (!error && response.statusCode == 200)
      {
        var data = JSON.parse(body);
        // console.log(data.posts.length);

        if(type == 'now') {
          i += data.posts.length;
        }
        else {
          y += data.posts.length;
        }

        if(data.posts.length) {
          cache(type);
        }
      }
    });
  })(type);
};

cache('now');
cache('next');
