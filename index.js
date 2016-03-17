'use strict';

var core    = require("./core.js");
var moment  = require("moment");
var request = require('request');

var index = process.argv[2];

if(typeof index !== 'undefined')
{
  var links = [];
  var posts = [];
  var c     = new core();

  for (var i = 0; i < 6; i++) {
      var d = moment().add(i, 'months');
      links.push('http://www.manga-news.com/index.php/planning?p_year=' + d.format('YYYY') + '&p_month=' + d.format('M'));
  };

  // links.push('http://www.manga-news.com/index.php/planning?p_year=2015&p_month=5');
  // links.push('http://www.manga-news.com/index.php/planning?p_year=2015&p_month=6');
  // links.push('http://www.manga-news.com/index.php/planning?p_year=2015&p_month=7');

  // c.extract('http://www.manga-news.com/index.php/manga/Inazuma-Eleven-GO-Roman/vol-8', function(){});

  c.listing(links[index], function(){
      c.extracts(function(p){
          posts = p;
          // console.log(JSON.stringify(p));

          request({
            // uri: 'http://admin:opsone@localhost/manganext-wp/api/v21/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
            uri: 'http://madmin:L!nk1701@api.manganext-app.com/api/v21/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
            method: 'POST',
            json: posts
          });

      }); // extracts posts
  }); // listing urls for links[index]

}
