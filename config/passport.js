const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'EmailAddress',
            passwordField: 'Password'
        }, (email, password, done) => {
            // Match user
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

                if (user.verified == 0) {
                    return done(null, false, {
                        message: 'That user isn\'t verified'
                    })
                }

                bcrypt.hash(password, user.Salt, (err, hash) => {
                    let hashed = hash.substring(0, hash.length - 15)
                    console.log(hash, hashed)
                    console.log(user.Password)

                    if (hash == user.Password) {
                        return done(null, user);
                    } else {
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