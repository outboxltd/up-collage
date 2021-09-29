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
            // console.log(email)
            User.findOne({
                where: {
                    EmailAddress: EmailAddress
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

                // Match password

                // bcrypt.hash(password, user.salt, (err, hash) => {
                //     console.log(hash.substring(0, hash.length - 15)) // I've cut it because for some reason the same-salted hash of the new password had 15 new characters
                // })

                bcrypt.hash(password, user.Salt, (err, hash) => {
                    let hashed = hash.substring(0, hash.length - 15)
                    // console.log(hashed)
                    // console.log(user.password)

                    if (hashed == user.Password) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }

                    // Again, compare for some reason didn't work
                    // bcrypt.compare(hashed, user.password, (err, isMatch) => {
                    //     // console.log(hash)
                    //     // console.log(user.password)
                    //     console.log(isMatch)
                    //     if (err) throw err;
                    //     if (isMatch) {
                    //         return done(null, user);
                    //     } else {
                    //         return done(null, false, {
                    //             message: 'Password incorrect'
                    //         });
                    //     }
                    // });
                });

            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((user, done) => {
        // console.log(user)
        User.findAll({
            where: {
                id: user.id
            }
        }).then((user) => {

            // console.log(user)
            done(null, user)

        }).catch((err) => {

            console.log(err)
            done(err, null)

        })
        // (id, (err, user) => {
        //     done(err, user)
        // })
    })

}