var config = {};

config.secret = process.env.secret

config.sqldb = process.env.sqldb
config.sqlhost = process.env.sqlhost
config.sqlpass = process.env.sqlpass
config.sqluser = process.env.sqluser

config.ProductBuyingWebhookURL = process.env.ProductBuyingWebhookURL

module.exports = config;
