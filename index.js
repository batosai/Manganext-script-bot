const express = require('express');
const cronJob = require('cron').CronJob;
const api     = require('./api/v21');
const bot     = require('./bot/index');

// serveur
const app  = express();
const port = process.env.PORT || 3000;

app.use('/api/v2.1', api);
app.use(express.static('public'));

app.listen(port);

// cron
new cronJob('0 * 2 * * *', function() {
  bot(0);
}, null, true);

new cronJob('0 * 3 * * *', function() {
  bot(1);
}, null, true);

new cronJob('0 * 4 * * *', function() {
  bot(2);
}, null, true);
