/**
 * @module
 * this class will be used to handle get requests for issue
 */

const express = require('express');
const db = require('../configure/dbConfig.js');
var path = require('path');

//create router
const router = express.Router();

//route for authentication
router.get(['/', '/index'], (req, res) => {
    console.log('--Inside check session--');
    console.log('req.session : ' + JSON.stringify(req.session));
    res.render('index', {
        session: req.session ? req.session : ''
    });
});

router.get('/user', (req, res) => {
    res.render('user', {
        session: req.session ? req.session : ''
    });
});

router.get('/medicaldetails', (req, res) => {
  var name = req.session.name;
  res.render('medicaldetails', {
      name : name,
      session: req.session ? req.session : ''
  });
});

router.get('/table', (req, res) => {
  var name = req.session.name;
  console.log("name", name);
  res.render('table', {
      name : name,
      session: req.session ? req.session : ''
  });
});

router.post('/medicaldetails', (req,res) => {
  console.log("Hello medicaldetails");
  var name = req.session.name;

  arr = req.body.time.split(':');
  var time = parseInt(arr[0])*60 + parseInt(arr[1]);

  var medicinedetails = {
    id1 : req.body.patientid,
    disease : req.body.disease,
    medicine : req.body.medicine,
    quantity : req.body.quantity,
    time : time,
    id: 110
  };
  console.log("medicinedetails = " + JSON.stringify(medicinedetails));

  db.query('INSERT INTO patient_medication SET ?', medicinedetails, (err, results) => {
    if (err) {
      console.log("Insert into patient_medication table failed." + err);
      res.send(err);
    } else {
        const queryString = "select * from profile where name = ?";
        db.query(queryString, [name], (err, results) => {
            if (err) {
                return res.status(400).send({err});
            }
            else {
                const userDetail = results[0];
                req.session.user = userDetail.email;
                req.session.userid = userDetail.id;
                req.session.role = userDetail.role;
                req.session.name = userDetail.name;

                res.render('doctorprofile', {doctorProfile : userDetail});
                session: req.session ? req.session : ''
            }
        });
      console.log('Medicaldetails updated sucessfully');
      console.log(req.session.name);
    }
  });
});

router.get('/', function(req, res, next) {

  db.query('select profile.name,patient_details.phonenumber, patient_medication.medicine,patient_medication.quantity from profile join patient_details join patient_medication where profile.id = patient_details.id and profile.id = patient_medication.id1 and patient_medication.time = SUBTIME(CURRENT_TIME(), "0:-15:0")' , (err, results) => {
    if (err) {
      console.log("Errorr in select sql statement." + err);
      res.send(err);
    } else {
      //res.send("Results " + JSON.stringify(results));
      var messagedetails = {
        name : rname,
        disease : req.body.disease,
        medicine : req.body.medicine,
        quantity : req.body.quantity,
        time : req.body.time,
      };
    res.render('table',{
      name : name,
      Page : page
    });
      //res.send('Medicaldetails updated sucessfully');
      console.log('Medicaldetails updated sucessfully');
    }
  });
});



module.exports = router;
