const sequelize = require('sequelize');
const moment = require('moment');

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
        defaultValue: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    },
    CourseInstructorName: {
        type: sequelize.STRING,
        required: true
    },
    CourseInstructorPhone: {
        type: sequelize.STRING,
        required: true
    },
    CourseInstructorEmail: {
        type: sequelize.STRING,
        required: true
    },
    ExpiredCourseTimeDate: {
        type: sequelize.DATE,
        required: true,
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