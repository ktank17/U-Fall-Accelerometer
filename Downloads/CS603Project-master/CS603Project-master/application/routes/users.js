/**
 * @module
 * this class will be used to handle get requests for issue
 */
const express = require('express');
const db = require('../configure/dbConfig.js');
const validator = require('express-validator');
var path = require('path');
var fs = require('fs');


//create router
const router = express.Router();
var session = '';

// route for authentication
router.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  // Write a query to fetch the details from db based on email.
  const queryString = "select * from profile where email = ?";
  db.query(queryString, [email], (err, results) => {
    if (err) {
      return res.status(400).send({err});
      }
    else {
      console.log("Results = " + JSON.stringify(results));
      if (results.length <= 0) {
        res.status(401).end('User not found.');
      }
      else {
        const userDetail = results[0];

        if (password != userDetail.password) {
          res.status(401).end('Invalid Credentials.');
        }
        else {
          req.session.user = userDetail.email;
          req.session.userid = userDetail.id;
          req.session.role = userDetail.role;
          req.session.name = userDetail.name;

          if (userDetail.role == "doctor") {
            res.render('doctorprofile', {doctorProfile : userDetail});
            session: req.session ? req.session : ''
          }
          else {
              var patientid = req.session.userid;
              console.log(patientid);
              const sql = "select * from patient_medication where id1 = ? order by disease, medicine, time";
              console.log(sql);
              db.query(sql, [patientid],(err, result, fields) => {
                  if (err) {
                    console.log("Error in obtaining patient details" + err);
                    res.send(err);
                  } else {
                    var patientMedication = result;

                    for (medication of patientMedication ) {
                        var hours = Math.floor(medication.time / 60) % 12;
                        var minutes = medication.time % 60;
                        var amPm = (medication.time >= 720) ? "PM" : "AM";
                        var time = hours.toString() + ":" + minutes.toString().padStart(2, '0') + " " + amPm;

                        medication.time = time;
                    }

                    var result = null;
                    var resultlist = [];
                    for (medication of patientMedication ) {
                      if (result == null) {
                        // First input row. Create a new output row.
                        result = {};
                        result['disease'] = medication['disease'];
                        result['medicine'] = medication['medicine'];
                        result['times'] = [medication['time']];
                      } else {
                        // Check if this input row matches previous input row on disease and medicine.
                        if (result['disease'] == medication['disease'] &&
                            result['medicine'] == medication['medicine']) {
                              // Same as previous row. Just append the time.
                            result['times'].push(medication['time']);
                        } else {
                            // different disease or medication. Start a new output row.
                            resultlist.push(result);

                            result = {};
                            result['disease'] = medication['disease'];
                            result['medicine'] = medication['medicine'];
                            result['times'] = [medication['time']];
                        }
                      }
                    }

                    if (result != null) {
                      resultlist.push(result);
                    }

                    console.log(resultlist);

                    res.render('medication', {
                        patientMedication: resultlist,
                        name : req.session.name
                    });
                  }
              });
          }
        }
      }
    }
  });
});

router.post('/logout', function(req, res) {
    req.session.destroy(function() {
        console.log("user logged out.")
    });
    res.render('index');
});

// route for registering new user
router.post('/register',(req, res) => {
  var user = {
    name : req.body.name,
    email : req.body.email,
    password : req.body.password,
    role : req.body.role,
  };

  console.log("Creating New User = " + JSON.stringify(user));
  db.query('INSERT INTO profile SET ?', user, (err, results) => {
    if (err) {
      console.log("Insert into patient table failed." + err);
      res.send(err);
    } else {
      console.log('user registered sucessfully');
      res.render('index');
    }
  });
});

router.get('/patientProfile', (req, res) => {
  var userid = req.session.userid;
  console.log("userid", userid);
  const sql = "SELECT profile.name, profile.email, patient_details.height, patient_details.weight, patient_details.phonenumber, patient_details.blood_type FROM profile JOIN patient_details WHERE profile.id = patient_details.id AND profile.id = ?";

  db.query(sql, [userid], (err, result, fields) => {
    if (err) throw err;
    var patientProfile = result[0];
    console.log(JSON.stringify(patientProfile));
    res.render('patientProfile', {
      patientProfile: patientProfile,
      session: req.session ? req.session : ''
    });
  });
});

router.get('/doctorprofile', (req, res) => {
  var name = req.session.name;
  res.render('doctorprofile', {
    doctorprofile : name,
    session: req.session ? req.session : ''
  });
});

router.get('/patientdetails', (req, res) => {
  var name = req.session.name;
  res.render('patientdetails', {
    patientdetails : name,
    session: req.session ? req.session : ''
  });
});

// Create patient details.
router.post('/patientdetails', (req, res) => {
  var userid = req.session.userid;
  var page = "Patient";
  var patientdetails = {
    height : req.body.height,
    weight : req.body.weight,
    phonenumber : req.body.phonenumber,
    blood_type : req.body.blood,
  };

  console.log("Create Patientdetails = " + JSON.stringify(patientdetails));
  db.query('update patient_details SET ?  where id = ?', [patientdetails, req.body.id], (err, results) => {
    if (err) {
      console.log("Insert into patient_details table failed. " + err);
      res.send(err);
    } else {
      console.log('patient details inserted sucessfully');
      var userid = req.session.userid;
      console.log("userid", userid);
      const sql = "SELECT profile.name, profile.email, patient_details.height, patient_details.weight, patient_details.phonenumber, patient_details.blood_type FROM profile JOIN patient_details WHERE profile.id = patient_details.id AND profile.id = ?";

      db.query(sql, [userid], (err, result, fields) => {
        if (err) throw err;
        var patientProfile = result[0];
        console.log(JSON.stringify(patientProfile));
        res.render('patientProfile', {
          patientProfile: patientProfile,
          session: req.session ? req.session : ''
        });
      });
    }
  })
});

module.exports = router
