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

  c.listing(links[index], function(){
      c.extracts(function(p){
          posts = p;
          // console.log(JSON.stringify(p));

          request({
            uri: 'http://admin:opsone@localhost/manganext-wp/api/v2/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
            // uri: 'http://madmin:L!nk1701@admin.manganext-app.com/api/v2/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
            method: 'POST',
            json: posts
          });

      }); // extracts posts
  }); // listing urls for links[index]

}
