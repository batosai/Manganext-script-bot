'use strict';

var jsdom  = require("jsdom");
// var post   = require("./post.js");
var fs     = require("fs");
var jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");
var moment = require("moment");

var parse = function(scope)
{
    var title = scope.find('strong').text();
    var text  = scope.text();
    text      = text.replace(title, '').trim();
    text      = text.substring(1).trim();// remove caract ':'
    text = text.replace( /\s\s+/g, ' ' );// remove multi space

    return text.replace(title, '').trim();
};
var parse_link = function($, scope)
{
    var link = [];
    scope.find('a').each(function() {
        link.push($(this).text().trim());
    });

    return link.join();
};

module.exports = function()
{
    this.urls  = [];
    this.posts = [];

    this.listing = function(url, callback)
    {
        var self = this;
        jsdom.env({
          url: url,
          // scripts: ["http://code.jquery.com/jquery.js"],
          src: [jquery],
          done: function (errors, window) {
            var $ = window.$;

            $("#planning tr").each(function() {
                var href = $(this).find('td:nth-child(2) a').attr('href');

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

        var url = this.urls[this.urls.length-1];
        this.urls.pop();
        this.extract(url, callback);
    };

    this.extract = function(uri, callback)
    {
        var self = this;
        jsdom.env({
          url: uri,
          src: [jquery],
          done: function (errors, window) {
            var $     = window.$;
            // var p     = new post();
            var p     = {};

            p.title           = $('h1 > a').text();

            p.volume          = $('h1').text();
            p.volume          = p.volume.replace(p.title, '').trim();

            p.vo_title        = parse($('#topinfo').find("li:contains('Titre VO')"));
            p.content         = $('#summary').find('p:first').text();
            p.translate_title = parse($('#topinfo').find("li:contains('Titre traduit')"));
            p.designer        = parse($('#topinfo').find("li:contains('Dessin')"));
            p.author          = parse($('#topinfo').find("li:contains('Scénario')"));
            p.collection      = parse($('#topinfo').find("li:contains('Collection')"));
            p.type            = parse($('#topinfo').find("li:contains('Type')"));
            p.genre           = parse($('#topinfo').find("li:contains('Genre')"));
            p.editor          = parse_link($, $('#topinfo').find("li:contains('Editeur VF')"));
            p.vo_editor       = parse($('#topinfo').find("li:contains('Editeur VO')"));
            p.preprint        = parse($('#topinfo').find("li:contains('Prépublication')"));
            p.publication_at  = moment( parse($('#topinfo').find("li:contains('Date de publication')")), "Do MMMM YYYY", 'fr').format();
            p.illustration    = parse($('#topinfo').find("li:contains('Illustration')"));
            p.origin          = parse($('#topinfo').find("li:contains('Origine')"));
            p.ean             = parse($('#topinfo').find("li:contains('Code EAN')"));
            p.price_code      = parse($('#topinfo').find("li:contains('Code prix')"));
            p.price           = $('#prixnumber').text().trim();
            p.source_url      = window.location.href;
            p.image           = $('#picinfo').find('a').attr('href');

            self.posts.push(p);
            // console.log(p);

            if(self.urls.length)
            {
                var url = self.urls[self.urls.length-1];
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

