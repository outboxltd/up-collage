const sequelize = require('sequelize');
const db = require('../config/seq-setup')

const User = db.define('user', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    FullName: {
        type: sequelize.STRING,
        required: true
    },
    OrganizationName: {
        type: sequelize.STRING,
        required: true
    },
    PhoneNumber: {
        type: sequelize.STRING,
        required: true
    },
    EmailAddress: {
        type: sequelize.STRING,
        required: true
    },
    TeamsAtOrganization: {
        type: sequelize.INTEGER,
        required: true
    },
    GeneralNotes: {
        type: sequelize.STRING,
        required: true
    },
    Password: {
        type: sequelize.STRING,
        required: true
    },
    IsAdmin: {
        type: sequelize.BOOLEAN,
        required: true,
        defaultValue: 0
    },
})


module.exports = User