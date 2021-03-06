'use strict';

const jsdom  = require("jsdom");
const fs     = require("fs");
const jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");
// var jquery = fs.readFileSync("/home/scripts/manganext-bot/node_modules/jquery/dist/jquery.js", "utf-8");
const moment = require("moment");

const parse = function(scope)
{
    const title = scope.find('strong').text();
    let text  = scope.text();
    text      = text.replace(title, '').trim();
    text      = text.substring(1).trim();// remove caract ':'
    text      = text.replace( /\s\s+/g, ' ' );// remove multi space

    return text.replace(title, '').trim();
};
const parse_link = function($, scope)
{
    let link = [];
    scope.find('a').each(function() {
        link.push($(this).text().trim());
    });

    return link.join();
};

const date_fr = function(value){
  value = value.toLowerCase();
  return value.replace('fevrier', 'février').replace('aout', 'août').replace('decembre', 'décembre');
};

module.exports = function()
{
    this.urls  = [];
    this.posts = [];

    this.listing = function(url, callback)
    {
        const self = this;
        jsdom.env({
          url: url,
          // scripts: ["http://code.jquery.com/jquery.js"],
          src: [jquery],
          done: (errors, window) => {
            const $ = window.$;

            $("#planning tr").each(function() {
                const href = $(this).find('td:nth-child(2) a').attr('href');

                if(href) {
                    self.urls.push(href);
                }
            });

            callback();
          }
        });
    };

    this.extracts = function(callback)
    {
        this.urls.reverse();

        const url = this.urls[this.urls.length-1];
        this.urls.pop();
        this.extract(url, callback);
    };

    this.extract = function(uri, callback)
    {
        const self = this;
        jsdom.env({
          url: uri,
          src: [jquery],
          done: (errors, window) => {
            const $     = window.$;
            // var p     = new post();
            let p     = {};

            p.title                = $('h1 > a').text();

            p.volume               = $('h1').text();
            p.volume               = p.volume.replace(p.title, '').trim();

            p.vo_title             = parse($('#topinfo').find("li:contains('Titre VO')"));
            p.content              = $('#summary').find('p:first').text();
            p.content_display      = $('#summary').find('p:first').html();
            p.translate_title      = parse($('#topinfo').find("li:contains('Titre traduit')"));
            p.designer             = parse($('#topinfo').find("li:contains('Dessin')"));
            p.author               = parse($('#topinfo').find("li:contains('Scénario')"));
            p.collection           = parse($('#topinfo').find("li:contains('Collection')"));
            p.type                 = parse($('#topinfo').find("li:contains('Type')"));
            p.genre                = parse($('#topinfo').find("li:contains('Genre')"));
            p.editor               = parse_link($, $('#topinfo').find("li:contains('Editeur VF')"));
            p.vo_editor            = parse($('#topinfo').find("li:contains('Editeur VO')"));
            p.preprint             = parse($('#topinfo').find("li:contains('Prépublication')"));
            p.age_number           = $('#agenumber').find("a").text().trim();

            let block = $($('#sidebar').html()).find('#numberblock');
            if(block.find('a').length) {
              block = block.find('a').removeAttr('href').removeAttr('title').parent().html().replace('<a>', '').replace('</a>', '');
            }
            else {
                block = block.html();
            }


            if(block != '') {
              block = block.replace(/(\r\n|\n|\r)/gm,"");
              block = block.replace(/ +(?= )/g, '');
            }

            p.outputs_number       = block;

            if($('#topinfo').find("li:contains('Date de publication') meta").length){
                // p.first_publication_at = moment( parse($('#topinfo').find("li:contains('Date de publication')")), "Do MMMM YYYY", 'fr').format();
                p.first_publication_at = moment( $('#topinfo').find("li:contains('Date de publication') meta").attr('content'), "YYYY-MM-DD", 'fr').format();
            }

            if($('#topinfo').find("li:contains('Date de publication 2')").length){
                p.publication_at   = moment( date_fr(parse($('#topinfo').find("li:contains('Date de publication 2')"))), "Do MMMM YYYY", 'fr').format();
            }
            else if(p.first_publication_at) {
                p.publication_at = p.first_publication_at;
            }

            p.illustration         = parse($('#topinfo').find("li:contains('Illustration')"));
            p.origin               = parse($('#topinfo').find("li:contains('Origine')"));
            p.ean                  = parse($('#topinfo').find("li:contains('Code EAN')"));
            p.price_code           = parse($('#topinfo').find("li:contains('Code prix')"));
            p.price                = $('#prixnumber').text().trim();
            p.source_url           = window.location.href;
            p.image                = $('#picinfo').find('a').attr('href');

            self.posts.push(p);
            // console.log(p);

            if(self.urls.length)
            {
                const url = self.urls[self.urls.length-1];
                self.urls.pop();
                self.extract(url, callback);
            }
            else {
                callback(self.posts);
            }
          }
        });
    };
};
