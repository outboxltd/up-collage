const sequelize = require('sequelize');
const moment = require('moment');

const db = require('../config/seq-setup')

const Transaction = db.define('transactions', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductID: {
        type: sequelize.INTEGER,
        required: true
    },
    UserID: {
        type: sequelize.INTEGER,
        required: true
    },
    PurchaseDate: {
        type: sequelize.DATE,
        required: true,
        defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
    },
    Status: {
        type: sequelize.STRING, // ENUM('WAITING', 'ACCEPTED')
        required: true,
        defaultValue: 'WAITING',
    },
    ChangedStatusDate: {
        type: sequelize.DATE,
        required: true,
        defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
    },
    times: {
        type: sequelize.INTEGER,
        required: true,
    }
})


module.exports = Transaction