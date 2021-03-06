if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const config = require("../config");
const { ensureAuthenticated, ifLoggedIn, checkExistingTransaction, checkExistingSpecification, isUser } = require('../config/auth')

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const db = require('../config/seq-setup')
const { Op, QueryTypes } = require("sequelize");
const axios = require('axios');
const moment = require('moment');
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

router.get('/', ifLoggedIn, (req, res, next) => {
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
  // let PhoneValidationRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
  // if (!PhoneValidationRegex.test(req.body["PhoneNumber"])) errors.push("PHONE_INVALID");

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
                req.flash('success_msg', "?????????? ???????? ????????????")
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

router.get('/login', ifLoggedIn, (req, res, next) => {
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
  req.flash('warning_msg', '???????????? ??????????????')
  res.redirect('/login');
})

/* ================== USER DASHBOARD ================== */

router.get('/dashboard', ensureAuthenticated, isUser, async function (req, res, next) {

  /*
    * ??? get available courses!
    * ??? status of transactions!
    * ??? get all specifications!
  */

  let Courses = await Course.findAll()
  Courses = JSON.parse(JSON.stringify(Courses, null, 2)) // [{"id": 1, "Name": "????"}, ...]

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
    UserName: res.locals.currentUser.FullName,
  });
});

router.post('/registerTransaction', ensureAuthenticated, async function (req, res, next) {
  // body should contain: UserID, CourseID
  /*
    * check if: there is an existing transaction with same userid and productid
    * Post to the webHook, should include params FullUserName, PhoneNumber, CourseName in body
    * Create new Transaction in db.
  */
  req.body = JSON.parse(Object.keys(req.body)[0])
  let {
    UserID,
    CourseID
  } = req.body

  let webHookURL = config.ProductBuyingWebhookURL
  let CurrentUser = res.locals.currentUser

  // check if there is an existing transaction with same userid and productid
  let CheckExistingTransaction_ = await checkExistingTransaction(UserID, CourseID)
  let isExistingTransaction = CheckExistingTransaction_[0]

  if (isExistingTransaction) { // there is an existing transaction! BAD
    req.flash('info_msg', "?????? ???????????? ???????? ???????? ?????????? ??????????, ???? ???????? ???????? ?????? ??????")
    res.redirect('/dashboard')

  } else {

    let Courses = await Course.findAll({
      limit: 1,
      where: {
        id: CourseID
      }
    })
    let CourseName = JSON.parse(JSON.stringify(Courses, null, 2))[0].Name

    let webHookRequest = await axios.post(webHookURL, {
      FullUserName: CurrentUser.FullName,
      PhoneNumber: CurrentUser.PhoneNumber,
      CourseName: CourseName
    }).then((response) => { return response }).catch((error) => { return error }); // webHookRequest.status(httpcodes)

    const newTransaction = new Transaction({
      ProductID: CourseID,
      UserID: UserID,
      times: 1,
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
      // if (!webHookRequestSucceed) errPayloads["WebHookPayload"] = webHookRequest
      // if (!newTransactionRequestSucceed) errPayloads["newTransactionPayload"] = newTransactionRequest
      res.json(resObject)
    }

  }

});

/* ================== ORDER DETAILS SPECIFICATIONS ================== */

router.get('/specificateorder', ensureAuthenticated, async function (req, res, next) {

  let courseID = req.query.courseID
  let CourseCounter = req.query.CourseCounter === undefined ? 1 : req.query.CourseCounter
  let CurrentUser = res.locals.currentUser

  /* 
    * Check if there is an existing transaction with same userid and productid(true -> pass)
    * Check if there is an existing specification with same userid and productid(true -> fail)
  */

  let CheckExistingTransaction_ = await checkExistingTransaction(CurrentUser.id, courseID)
  let isExistingTransaction = CheckExistingTransaction_[0]
  let ExistingTransaction = isExistingTransaction ? CheckExistingTransaction_[1][0] : null

  if (isExistingTransaction) { // there is an existing transaction! GOOD

    let SelectedTransaction = ExistingTransaction

    let CheckExistingSpecification_ = await checkExistingSpecification(CurrentUser.id, courseID, CourseCounter)
    let isExistingSpecification = CheckExistingSpecification_[0]
    let ExistingSpecification = isExistingSpecification ? CheckExistingSpecification_[1][0] : null

    // if (isExistingSpecification) { // there is an existing specification! BAD

    //   req.flash('info_msg', "?????? ???????? ???????????? ???????? ???????? ????, ???? ???????? ???????????? ?????? ???? ??????????")
    //   res.redirect('/dashboard')

    // } else { // there isnt an existing specification! GOOD

    if (isExistingSpecification) ExistingSpecification["ExpiredCourseTimeDate"] = moment(ExistingSpecification["ExpiredCourseTimeDate"]).subtract(2, 'hours').subtract(0, 'days').format("DD/MM/YYYY HH:mm")

    res.render('order-details', {
      Transaction: SelectedTransaction,
      UserID: CurrentUser.id,
      isExistingSpecification: isExistingSpecification,
      ExistingSpecification: ExistingSpecification
    });

    // }

  } else {
    req.flash('info_msg', "?????? ????????: ???????? ???? ????????")
    res.redirect('/dashboard')
  }
});

router.post('/specificateorder', ensureAuthenticated, async function (req, res, next) {

  let {
    CourseInstructorName,
    CourseInstructorPhone,
    CourseInstructorEmail,
    ExpiredCourseTimeDate,
    Address,
    NumberOfCourseParticipants,
    GeneralNotes,
    ProductID,
    TransactionID,
    Number,
  } = req.body;
  let CurrentUser = res.locals.currentUser

  console.log(req.body, CourseInstructorName)

  let body_without_GeneralNotes = { ...req.body }
  delete body_without_GeneralNotes.GeneralNotes;

  let errors = [];

  // check if there is already an existing transaction for this userid and productid(true->pass)
  // check if there is already an existing specification for this userid and productid(true->fail)

  let CheckExistingTransaction_ = await checkExistingTransaction(CurrentUser.id, ProductID)
  let isExistingTransaction = CheckExistingTransaction_[0]

  if (isExistingTransaction) { // there is an existing transaction! GOOD

    let CheckExistingSpecification_ = await checkExistingSpecification(CurrentUser.id, ProductID, Number)
    let isExistingSpecification = CheckExistingSpecification_[0]

    if (isExistingSpecification) { // there is an existing specification! BAD

      req.flash('info_msg', "?????? ???????? ???????????? ???????? ???????? ????, ???? ???????? ???????????? ?????? ???? ??????????")
      res.redirect('/dashboard')

    } else { // there isnt an existing specification! GOOD

      // Check if all fields are empty(except GeneralNotes)
      if (Object.values(body_without_GeneralNotes).includes("")) errors.push("???????? ???????? ?????????? ??????????");

      // Check if FullName has a space
      if (!CourseInstructorName.includes(" ")) errors.push("???? ?????????? ?????????? ???????? ???????? ???? ??????????/?????? ???????? ?????? ??????????");

      // Validate Phone Number
      let PhoneValidationRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
      if (!PhoneValidationRegex.test(CourseInstructorPhone)) errors.push("???????? ???????????? ???????? ???????? ???? ??????, ????/' ???????????? ???????? ?????????? ???????????? ??????-????????????");

      // Validate Email Address
      let EmailValidationRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!EmailValidationRegex.test(CourseInstructorEmail)) errors.push("?????????? ?????????????? ???????? ??????????/????????")

      if (errors.length > 0) {
        res.render('order-details', {
          errors: errors,
          CourseInstructorName: CourseInstructorName,
          CourseInstructorPhone: CourseInstructorPhone,
          CourseInstructorEmail: CourseInstructorEmail,
          ExpiredCourseTimeDate: ExpiredCourseTimeDate,
          Address: Address,
          NumberOfCourseParticipants: NumberOfCourseParticipants,
          GeneralNotes: GeneralNotes,
          Number: Number,
        })

      } else {

        // create a new specification in db, redirect to dashboard

        let normalizedExpiredCourseTimeDate = moment(ExpiredCourseTimeDate, "DD/MM/YYYY HH:mm").add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
        let newSpecification = new Specification({
          TransactionID: TransactionID,
          ProductID: ProductID,
          UserID: CurrentUser.id,
          CourseInstructorName: CourseInstructorName,
          CourseInstructorPhone: CourseInstructorPhone,
          CourseInstructorEmail: CourseInstructorEmail,
          ExpiredCourseTimeDate: normalizedExpiredCourseTimeDate,
          Address: Address,
          NumberOfCourseParticipants: NumberOfCourseParticipants,
          GeneralNotes: GeneralNotes,
          Number: Number,
        })

        newSpecification.save()
          .then(Specification => {
            res.redirect('/dashboard')
          })
          .catch(err => {
            req.flash('error_msg', "???????????? ???? ????????, ?????????? ????????, ?????? ?????? ?????????? ??????????")
            res.redirect('/dashboard')
            console.log(err)
          })

      }

    }

  } else {
    req.flash('info_msg', "?????? ????????: ???????? ???? ????????")
    res.redirect('/dashboard')
  }

});

/* ================== COURSE PAGE ================== */

router.get('/coursePage', ensureAuthenticated, async function (req, res, next) {

  let courseID = req.query.courseID
  let CurrentUser = res.locals.currentUser
  // check if there is already an existing transaction for this userid and productid(true->pass)
  // check if there is already an existing specification for this userid and productid(true->pass)

  let CheckExistingTransaction_ = await checkExistingTransaction(CurrentUser.id, courseID)
  let isExistingTransaction = CheckExistingTransaction_[0]

  if (isExistingTransaction) { // there is an existing transaction! GOOD

    let CheckExistingSpecification_ = await checkExistingSpecification(CurrentUser.id, courseID, "PASS!", true, true)
    let isExistingSpecification = CheckExistingSpecification_[0]
    let SelectedSpecifications = isExistingSpecification ? CheckExistingSpecification_[1] : null

    if (isExistingSpecification) { // there is an existing specification! GOOD

      console.log(new Date(SelectedSpecifications[0].ExpiredCourseTimeDate))

      // Check Specification expire date for the product id.
      let FormattedExpiredCourseTimeDate = moment(new Date(SelectedSpecifications[0].ExpiredCourseTimeDate), 'YYYY-MM-DD HH:mm:ss').subtract(2, "hours")
      let Now = moment()

      console.log(FormattedExpiredCourseTimeDate)

      let OneHourBefore = moment(FormattedExpiredCourseTimeDate).subtract(1, "hours")
      let ThreeHoursAfter = moment(FormattedExpiredCourseTimeDate).add(3, "hours")

      console.log(FormattedExpiredCourseTimeDate.format("DD.MM.YYYY HH:mm"), OneHourBefore.format("DD.MM.YYYY HH:mm"), ThreeHoursAfter.format("DD.MM.YYYY HH:mm"))

      let isBefore_BeforeOneHour = Now.diff(OneHourBefore, "minutes", true) > 0;
      let isBefore_AfterThreeHours = Now.diff(ThreeHoursAfter, "minutes", true) > 0;

      let isExpired = !isBefore_BeforeOneHour || isBefore_AfterThreeHours

      if (isExpired) {

        // req.flash('error_msg', "?????????? ?????????? ???? ???????? / ?????????? ???? ????????, ?????? ?????? ?????????? ??????????")
        // res.redirect('/dashboard')

        // bad parctice
        FormattedExpiredCourseTimeDate = moment(FormattedExpiredCourseTimeDate).format("DD.MM.YYYY HH:mm")

        res.render('coursePage', {
          ExpireDate: FormattedExpiredCourseTimeDate,
          UserID: res.locals.currentUser.id,
          UserName: res.locals.currentUser.FullName
        });

        // bad parctice

      } else {

        FormattedExpiredCourseTimeDate = moment(FormattedExpiredCourseTimeDate).format("DD.MM.YYYY HH:mm")

        res.render('coursePage', {
          ExpireDate: FormattedExpiredCourseTimeDate,
          UserID: res.locals.currentUser.id,
          UserName: res.locals.currentUser.FullName
        });

      }

    } else {
      req.flash('info_msg', "?????? ????????: ?????????? ???? ?????? ????????????, ?????? ?????????? ????????????")
      res.redirect('/dashboard')
    }

  } else {
    req.flash('info_msg', "?????? ????????: ???????? ???? ????????")
    res.redirect('/dashboard')
  }


});



module.exports = router;