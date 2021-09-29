if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const config = require("../config")

const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { Op } = require("sequelize");

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

  let errors = [];

  // Check if all fields are empty
  if (Object.values(req.body).includes("")) errors.push("FIELDS_EMPTY");

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
          Salt: null,
        });

        //Hash pass
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.Password, salt, (err, hash) => {
            if (err) throw err;

            console.log(salt, hash)

            newUser.Salt = salt

            newUser.Password = hash

            newUser.save()
              .then(user => {
                // req.flash('warning_msg', 'Verification email was sent, if not sent check spam.')
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


module.exports = router;