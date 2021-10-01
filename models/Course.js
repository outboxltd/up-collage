const sequelize = require('sequelize');
const db = require('../config/seq-setup')

const Course = db.define('courses', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: {
        type: sequelize.STRING,
        required: true
    },
})


module.exports = Course