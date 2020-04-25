
'use strict';

const CronJob = require('cron').CronJob;
const notificationsWorker = require('./workers/notificationsWorker');
const moment = require('moment');

const schedulerFactory = function() {
return {
  start: function() {
    var date = new Date();
    console.log("Started cronjob for 5 minutes @ " + date.toString());
    new CronJob('*/5 * * * *', function() {
      console.log('Running Send Notifications Worker for ' + moment().format());
      notificationsWorker.run();
    }, null, true, '');
  },
};
};

module.exports = schedulerFactory();
