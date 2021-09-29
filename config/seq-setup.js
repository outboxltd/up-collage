if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const config = require("../config.js")

const sequelize = require('sequelize');
module.exports = new sequelize(config.sqldb, config.sqluser, config.sqlpass, {
    host: config.sqlhost,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false
    }
});