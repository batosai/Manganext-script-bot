'use strict';

const core       = require("./core.js");
const creatDir   = require('./creatDir.js');
const moment     = require("moment");
const request    = require('request');
const connection = require('../config').db;
const slug       = require('slug');
const fs         = require("fs");
const path       = require('path');
const http       = require("http");
const gm         = require('gm').subClass({imageMagick: true});
const Log        = require('log'), log                = new Log('debug', fs.createWriteStream('debug.log'));


const d = new Date();
const n = d.getMonth() + 1;
const y = d.getFullYear();

const download = './public/images/' + y + '-' + n;
const downloadFull = download + '/full/';
const downloadSmall = download + '/215/';
creatDir(download);
creatDir(downloadFull);
creatDir(downloadSmall);

const index = process.argv[2];

if(typeof index !== 'undefined')
{
  let links = [];
  let posts = [];
  const c   = new core();

  for (let i = 0; i < 6; i++) {
      let t = moment().add(i, 'months');
      links.push('http://www.manga-news.com/index.php/planning?p_year=' + t.format('YYYY') + '&p_month=' + t.format('M'));
  };

  c.listing(links[index], () => {
      c.extracts((posts) => {
          // console.log(JSON.stringify(posts));

          // request({
          //   // uri: 'http://admin:opsone@localhost/manganext-wp/api/v21/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
          //   uri: 'http://madmin:L!nk1701@api.manganext-app.com/api/v21/posts?token=ea5af636cd2c0c07242ee43c07cbefb3',
          //   method: 'POST',
          //   json: posts
          // });

          (function editor(index) {
            if(posts[index] && posts[index].editor !== 'undefined'){
              connection.query('SELECT * from editors WHERE name=?', [posts[index].editor],  (err, rows, fields) => {
                if(!rows.length) {
                  connection.query('INSERT INTO editors SET name=?', posts[index].editor, () => {
                    editor(index+1);
                  });
                }
                else
                  editor(index+1);
              });
            }
          })(0);

          for (let post of posts) {
            if(post.ean == undefined || post.ean == '') continue;

            connection.query('SELECT * from books WHERE ean=?', [post.ean],  (err, rows, fields) => {
              if (!err) {

                if(post.image !== ''){
                  try {
                    const image = slug(post.title + '-' + post.volume + '-' + post.publication_at) + path.extname(post.image);
                    const file  = fs.createWriteStream(downloadFull + image);

                    http.get(post.image, (res) => {
                      res.pipe(file);
                      res.on('end', () => {

                        gm(downloadFull + image)
                        .resize(450, 625, '!')
                        .noProfile()
                        .write(downloadFull + image, (err) => {
                          if (!err){
                            gm(downloadFull + image)
                            .resize(215, 300, '!')
                            .noProfile()
                            .write(downloadSmall + image, (err) => {
                              if (!err) {
                                console.log('done');
                                post.image_name = image;
                                post.image_path = download.replace('./public', '');

                                if(rows.length) {
                                  connection.query("UPDATE books SET ? WHERE ean=?", [post, post.ean]);
                                }
                                else {
                                  connection.query('INSERT INTO books SET ?', post);
                                }
                              }
                            });
                          }
                        });

                      });
                      res.resume();
                    });
                  } catch (e) {
                    log.error('Get page error try: %s', e.message);
                  }
                }

              }
            });
            // connection.end();
          }

      }); // extracts posts
  }); // listing urls for links[index]

}
