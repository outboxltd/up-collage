const User = require('../models/User');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const Specification = require('../models/Specification');
const db = require('../config/seq-setup')

module.exports = {
    isUser: function (req, res, next) {
        let CurrentUser = res.locals.currentUser
        if (CurrentUser.IsAdmin) {
            // res.redirect('/admin/confirmPayments')
            res.redirect('/admin/specifications')
        } else {
            return next();
        }
    },
    isAdmin: function (req, res, next) {
        let CurrentUser = res.locals.currentUser
        if (CurrentUser.IsAdmin) {
            return next();
        } else {
            res.redirect('/dashboard')
        }
    },
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('info_msg', "Please log in to view the dashboard")
        res.redirect('/login')
    },
    ifLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/dashboard')
        } else {
            return next()
        }
    },
    checkExistingTransaction: async function (UserID, ProductID) {
        let Transactions = await Transaction.findAll({
            limit: 1,
            where: {
                UserID: UserID,
                ProductID: ProductID,
            }
        })
        Transactions = JSON.parse(JSON.stringify(Transactions, null, 2))
        return [Object.keys(Transactions).length > 0, Transactions]
    },
    checkExistingSpecification: async function (UserID, ProductID, CourseNumber, allSpecifications, orderByDate) {
        let Specifications;
        if (orderByDate === true) {
            Specifications = await db.query(`SELECT * FROM \`specifications\` WHERE UserID = \"${UserID}\" ORDER BY ABS( TIMEDIFF( ExpiredCourseTimeDate, NOW() ) )`, { type: db.QueryTypes.SELECT })
        } else {
            let whereObj = {
                UserID: UserID,
                ProductID: ProductID,
            }
            if (CourseNumber && CourseNumber !== "PASS!") whereObj["Number"] = CourseNumber
            let SpecificationFindJson = {
                where: whereObj
            }
            if (allSpecifications !== true || !allSpecifications) SpecificationFindJson["limit"] = 1
            Specifications = await Specification.findAll(SpecificationFindJson)
            Specifications = JSON.parse(JSON.stringify(Specifications, null, 2))
        }

        return [Object.keys(Specifications).length > 0, Specifications]
    }
}