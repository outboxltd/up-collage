if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const session = require('express-session');
// const expressLayouts = require('express-ejs-layouts')

const express = require('express')
const app = express()

const cookieParser = require('cookie-parser');
const path = require("path");
const flash = require('connect-flash');
const passport = require('passport')
const fileUpload = require('express-fileupload');

const config = require("./config.js")

const indexRouter = require("./routes/index.js");
const adminsRouter = require("./routes/admin.js");

app.use(express.urlencoded({
    extended: false
}));

app.set('views', path.join(__dirname, '/views'));

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/partials', express.static(__dirname + '/views/partials'));

app.use(cookieParser());
app.use(fileUpload());

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true
}))


app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport)

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.warning_msg = req.flash('warning_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.currentUser = req.user ? JSON.parse(JSON.stringify(req.user, null, 2))[0] : null
    next();
})


// MySQL setup - just to see there are no errors with connecting to the db

// const connection = mysql.createConnection({
//   host: config.sqlhost,
//   user: config.sqluser,
//   database: config.sqldb,
//   password: config.sqlpass
// })

// MySQL is not necessary

// Sequelize
const db = require('./config/seq-setup')

db.authenticate()
    .then(() => console.log('db connected!'))
    .catch(err => console.error(err))


app.use('/', indexRouter);
app.use('/admin/', adminsRouter);

module.exports = app;