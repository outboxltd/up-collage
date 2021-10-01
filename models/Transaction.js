const sequelize = require('sequelize');
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
        defaultValue: new Date(),
    },
    Status: {
        type: sequelize.STRING, // ENUM('WAITING', 'ACCEPTED')
        required: true,
        defaultValue: 'WAITING',
    },
})


module.exports = Transaction