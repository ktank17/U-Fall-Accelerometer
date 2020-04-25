'use strict';

const db = require('../configure/dbConfig.js');
const Twilio = require('twilio');

/**
 * Send message to all users that need to take medicine shortly.
 */



function sendSms(schedules) {
    const twilioAccountSid = ""; /*twilioAccountSid*/
    const twilioAuthToken = ""; /*twilioAuthToken*/
    const twilioPhoneNumber = ""; /*twilioPhoneNumber*/
    const client = new Twilio(twilioAccountSid, twilioAuthToken);
    schedules.forEach(function(event) {
        // Create options to send the message
        var hours = Math.floor(event.time / 60) % 12;
        var minutes = event.time % 60;
        var amPm = (event.time >= 720) ? "PM" : "AM";
        var time = hours.toString() + ":" + minutes.toString() + " " + amPm;
        const options = {
            to: `+1 ${event.phonenumber}`,
            from: twilioPhoneNumber,
            body: `Hi ${event.name}, Please take quantity ${event.quantity} of ${event.medicine} for ${event.disease} @ ${time}.`,
        };

        console.log(`Sending message to Phone = ${event.phonenumber} MSG = ${options.body}`);

        // // Send the message!
        client.messages.create(options, function(err, response) {
            if (err) {
            //Just log it for now
                console.error(err);
            } else {
                 console.log(`Message sent to ${event.phonenumber}`);
            }
        });
    });
}

function sendNotifications() {
  var currentDate = new Date();
  var currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
  var nextNotifyTime = (currentTime + 5) % (24 * 60); // next 5 hours

  console.log("currentTime = " + currentTime + " nextNotifyTime = " + nextNotifyTime);

  var sql;
  if (currentTime < nextNotifyTime) {
      sql = "select pd.phonenumber, prof.name, med.disease, med.medicine, med.quantity, med.time from profile as prof, patient_medication as med, patient_details as pd where prof.id=pd.id AND prof.id=med.id1 AND med.time > ?  AND med.time <= ? ORDER BY pd.phonenumber, prof.name, med.time";
  }
  else {
      sql = "select pd.phonenumber, prof.name, med.disease, med.medicine, med.quantity, med.time from profile as prof, patient_medication as med, patient_details as pd where prof.id=pd.id AND prof.id=med.id1 AND (med.time > ?  OR med.time <= ?) ORDER BY pd.phonenumber, prof.name, med.time";
  }

  db.query(sql, [currentTime, nextNotifyTime], (err, result, fields) => {
    if (err) {
      console.log("Error in querying for notification" + err);
    } else {
      //console.log(JSON.stringify(result));
      sendSms(JSON.parse(JSON.stringify(result)));
    }
  });
}

const notificationWorkerFactory = function() {
  return {
    run: function() {
      sendNotifications();
    },
  };
};

module.exports = notificationWorkerFactory();
