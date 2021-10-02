const User = require('../models/User');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const Specification = require('../models/Specification');

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('info_msg', "Please log in to view the dashboard")
        res.redirect('/login')
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
    checkExistingSpecification: async function (UserID, ProductID) {
        let Specifications = await Specification.findAll({
            limit: 1,
            where: {
                UserID: UserID,
                ProductID: ProductID,
            }
        })
        Specifications = JSON.parse(JSON.stringify(Specifications, null, 2))
        return [Object.keys(Specifications).length > 0, Specifications]
    }
}