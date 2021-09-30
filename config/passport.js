const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'EmailAddress',
            passwordField: 'Password'
        }, (email, password, done) => {
            console.log(email, password)
            User.findOne({
                where: {
                    EmailAddress: email
                }
            }).then(user => {
                if (!user) {
                    return done(null, false, {
                        message: 'That email is not registered'
                    });
                }

                bcrypt.compare(password, user.Password, function(err, res) {
                    if (err){
                      // handle error
                      console.log(err);
                    }
                    if (res) {
                      // success!
                      console.log("success");
                      return done(null, user);
                    } else {
                      // fail!
                      console.log("fail");
                      return done(null, false, {
                        message: 'Password incorrect'
                    });
                    }
                  });

            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((user, done) => {
        User.findAll({
            where: {
                id: user.id
            }
        }).then((user) => {
            done(null, user)

        }).catch((err) => {
            console.log(err)
            done(err, null)

        })
    })

}