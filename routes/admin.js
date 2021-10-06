if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const config = require("../config");
const { ensureAuthenticated, checkExistingTransaction, checkExistingSpecification, isAdmin } = require('../config/auth')

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Op } = require("sequelize");
const axios = require('axios');
const moment = require('moment');

const User = require('../models/User');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const Specification = require('../models/Specification');
/* ================== ADMIN DASHBOARD ================== */

router.get('/dashboard', ensureAuthenticated, isAdmin, async (req, res, next) => {

  /*
    1. get all rows from transactions which are WAITING
    2. translate ProductID to Course Name
    3. translate userID to User name, User organization, User Phone Number and to NumberOfCourseParticipants & ExpiredCourseTimeDate (specifications table)
    4. render an array of json objects that contain User Id, User name, User organization, User Phone Number, NumberOfCourseParticipants, ExpiredCourseTimeDate and Course Name
  */

  let result = []

  // step 1
  let Transactions = await Transaction.findAll({
    where: {
      Status: "WAITING"
    }
  })
  Transactions = JSON.parse(JSON.stringify(Transactions, null, 2))

  // step 2
  let Courses = await Course.findAll()
  Courses = JSON.parse(JSON.stringify(Courses, null, 2))

  for (let i = 0; i < Transactions.length; i++) {
    let Transaction = Transactions[i];
    let TransactionCopy = { ...Transaction }

    let Userr = await User.findAll({
      limit: 1,
      where: {
        id: TransactionCopy["UserID"]
      }
    })
    Userr = JSON.parse(JSON.stringify(Userr, null, 2))[0]

    let Specificationn = await Specification.findAll({
      limit: 1,
      where: {
        UserID: TransactionCopy["UserID"],
        ProductID: TransactionCopy["ProductID"]
      }
    })
    let Specifications = JSON.parse(JSON.stringify(Specificationn, null, 2))

    // User Id, User name, User organization, User Phone Number, NumberOfCourseParticipants, ExpiredCourseTimeDate and Course Name
    TransactionCopy["CourseName"] = Courses.find(Course => Course.id === TransactionCopy["ProductID"])["Name"]
    TransactionCopy["UserName"] = Userr.FullName
    TransactionCopy["UserOrganization"] = Userr.OrganizationName
    TransactionCopy["UserPhoneNumber"] = Userr.PhoneNumber

    if (Specifications.length > 0) {


      TransactionCopy["NumberOfCourseParticipants"] = Specificationn.NumberOfCourseParticipants
      let normalizedExpiredCourseTimeDate = moment(Specificationn.ExpiredCourseTimeDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
      TransactionCopy["ExpiredCourseTimeDate"] = normalizedExpiredCourseTimeDate

      result.push(TransactionCopy)

    }

  }

  console.log(result)

  res.render('admin/dashboard', {
    baseURL: req.protocol + '://' + req.get('host'),
    Transactions: result,
  });
});

router.post('/ChangeTranscationStatus', ensureAuthenticated, async function (req, res, next) {
  // body should contain: TransactionID, isAllowed
  /*
    * Change the Transaction status from WAITING to ACCEPTED
  */
  req.body = JSON.parse(Object.keys(req.body)[0])
  let {
    TransactionID,
    isAllowed
  } = req.body

  let CurrentUser = res.locals.currentUser

  if (!isAllowed) res.json({ "code": 500 })

  Transaction.update(
    { Status: 'ACCEPTED' },
    {
      where: {
        id: TransactionID,
        UserID: CurrentUser.id,
      }
    }
  )
    .then((rows) => {
      res.json({
        "code": 200
      })
    })
    .catch((err) => {
      res.json({
        "code": 500,
      })
    })

});

module.exports = router;