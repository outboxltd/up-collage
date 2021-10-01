const sequelize = require('sequelize');
const db = require('../config/seq-setup')

const Specification = db.define('specifications', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TransactionID: {
        type: sequelize.INTEGER,
        required: true
    },
    ProductID: {
        type: sequelize.INTEGER,
        required: true
    },
    UserID: {
        type: sequelize.INTEGER,
        required: true
    },
    Date: {
        type: sequelize.DATE,
        required: true,
        defaultValue: new Date(),
    },
    CourseGuiderName: {
        type: sequelize.STRING,
        required: true
    },
    CourseGuiderName: {
        type: sequelize.STRING,
        required: true
    },
    CourseGuiderEmail: {
        type: sequelize.STRING,
        required: true
    },
    CourseTimeDate: {
        type: sequelize.DATE,
        required: true,
        defaultValue: new Date(),
    },
    Address: {
        type: sequelize.STRING,
        required: true
    },
    NumberOfCourseParticipants: {
        type: sequelize.STRING,
        required: true
    },
    GeneralNotes: {
        type: sequelize.STRING,
        required: true
    },
})


module.exports = Specification