var cronJob  = require('cron').CronJob;

new cronJob('0 */2 * * * *', function() {
  console.log('cron');
}, null, true);
