if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const config = require("../config");
const { ensureAuthenticated } = require('../config/auth')

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Op } = require("sequelize");
const axios = require('axios');

const User = require('../models/User');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const Specification = require('../models/Specification');

/* ================== TEST ================== */

router.post('/test', (req, res) => {

  let {
    HashedPassword,
    TestedPassword
  } = req.body;

  console.log(req.body)

  bcrypt.compare(TestedPassword, HashedPassword, function (err, res) {
    if (err) {
      // handle error
      console.log(err);
    }
    if (res) {
      // success!
      console.log("success");
    } else {
      // fail!
      console.log("fail");
    }
  });

  res.send("Y")

})

/* ================== REGISTER ================== */

router.get('/', function (req, res, next) {
  res.render('registerPage');
});

router.post('/', (req, res) => {
  let {
    FullName,
    OrganizationName,
    PhoneNumber,
    EmailAddress,
    TeamsAtOrganization,
    GeneralNotes,
    Password,
    Password2
  } = req.body;

  let body_without_GeneralNotes = { ...req.body }
  delete body_without_GeneralNotes.GeneralNotes;

  let errors = [];

  // Check if all fields are empty(except GeneralNotes)
  if (Object.values(body_without_GeneralNotes).includes("")) errors.push("FIELDS_EMPTY");

  // Check if FullName has a space
  if (!req.body["FullName"].includes(" ")) errors.push("PARTIAL_FULLNAME");

  // Validate Phone Number
  let PhoneValidationRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
  if (!PhoneValidationRegex.test(req.body["PhoneNumber"])) errors.push("PHONE_INVALID");

  // Validate Email Address
  let EmailValidationRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!EmailValidationRegex.test(req.body["EmailAddress"])) errors.push("EMAIL_INVALID")

  // Check if password's length is fine
  if (req.body["Password"].length < 6 || req.body["Password2"].length < 6) errors.push("SHORT_PASSWORD");

  // Check if 2 passwords are equal
  if (req.body["Password"] !== req.body["Password2"]) errors.push("PASSWORDS_AINT_SAME");


  console.log(errors);

  if (errors.length > 0) {
    res.render('registerPage', {
      errors: errors,
      FullName: FullName,
      OrganizationName: OrganizationName,
      PhoneNumber: PhoneNumber,
      EmailAddress: EmailAddress,
      TeamsAtOrganization: TeamsAtOrganization,
      GeneralNotes: GeneralNotes,
      Password: Password,
      Password2: Password2
    })

  } else {
    User.findAll({
      limit: 1,
      where: {
        [Op.or]: [
          { EmailAddress: EmailAddress },
          { PhoneNumber: PhoneNumber }
        ]
      }
    }).then(user => {
      if (user.length > 0) { // theres a user
        errors.push("Email/Phone number is already registered")

        res.render('registerPage', {
          errors: errors,
          FullName: FullName,
          OrganizationName: OrganizationName,
          PhoneNumber: PhoneNumber,
          EmailAddress: EmailAddress,
          TeamsAtOrganization: TeamsAtOrganization,
          GeneralNotes: GeneralNotes,
          Password: Password,
          Password2: Password2
        })
      } else {

        const newUser = new User({
          FullName: FullName,
          OrganizationName: OrganizationName,
          PhoneNumber: PhoneNumber,
          EmailAddress: EmailAddress,
          TeamsAtOrganization: TeamsAtOrganization,
          GeneralNotes: GeneralNotes,
          Password: Password,
        });

        //Hash pass
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.Password, salt, (err, hash) => {
            if (err) throw err;

            console.log(salt, hash)

            newUser.Password = hash

            newUser.save()
              .then(user => {
                res.redirect('/login')
              })
              .catch(err => console.log(err))
          });
        });
      }
    });
  }
})

/* ================== LOGIN ================== */

router.get('/login', function (req, res, next) {
  res.render('loginPage');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
})

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('warning_msg', 'You are logged out')
  res.redirect('/users/login');
})

/* ================== USER DASHBOARD ================== */

router.get('/dashboard', ensureAuthenticated, async function (req, res, next) {

  /*
    * • get available courses!
    * • status of transactions!
    * • get all specifications!
  */

  let Courses = await Course.findAll()
  Courses = JSON.parse(JSON.stringify(Courses, null, 2)) // [{"id": 1, "Name": "שם"}, ...]

  let Transactions = await Transaction.findAll({
    where: {
      UserID: res.locals.currentUser.id
    }
  }).then(Transactionss => {
    return Transactionss;
  })
  Transactions = JSON.parse(JSON.stringify(Transactions, null, 2))

  let Specifications = await Specification.findAll({
    where: {
      UserID: res.locals.currentUser.id
    }
  }).then(Specificationss => {
    return Specificationss;
  })
  Specifications = JSON.parse(JSON.stringify(Specifications, null, 2))

  res.render('dashboard', {
    Courses: Courses,
    Transactions: Transactions,
    Specifications: Specifications,
    UserID: res.locals.currentUser.id,
  });
});

router.post('/registerTransaction', ensureAuthenticated, async function (req, res, next) {
  // body should contain: UserID, CourseID
  /*
    * Post to the webHook, should include params FullUserName, PhoneNumber, CourseName in body
    * Create new Transaction in db.
  */
  req.body = JSON.parse(Object.keys(req.body)[0])
  let {
    UserID,
    CourseID
  } = req.body

  let webHookURL = config.ProductBuyingWebhookURL

  let Courses = await Course.findAll({
    limit: 1,
    where: {
      id: CourseID
    }
  })
  CourseName = JSON.parse(JSON.stringify(Courses, null, 2))[0].Name

  let webHookRequest = await axios.post(webHookURL, {
    FullUserName: res.locals.currentUser.FullName,
    PhoneNumber: res.locals.currentUser.PhoneNumber,
    CourseName: CourseName
  }).then((response) => { return response }).catch((error) => { return error }); // webHookRequest.status(httpcodes)

  const newTransaction = new Transaction({
    ProductID: CourseID,
    UserID: UserID,
  });

  const newTransactionRequest = await newTransaction.save().then(Transaction => { return true }).catch(err => { return err }) // isSuccess(if not true then err)

  // if the webhookRequest and the newTransactionRequest worked then return {"code": 200} else {"code": 500, err payload(s)} 

  let webHookRequestSucceed = webHookRequest.status === 200 ? true : false
  let newTransactionRequestSucceed = newTransactionRequest === true ? true : false

  if (webHookRequestSucceed && newTransactionRequestSucceed) {
    res.json({
      "code": 200
    })
  } else {
    let resObject = {
      "code": 500,
    }
    if (!webHookRequestSucceed) errPayloads["WebHookPayload"] = webHookRequest
    if (!newTransactionRequestSucceed) errPayloads["newTransactionPayload"] = newTransactionRequest
    res.json(resObject)
  }


});

module.exports = router;