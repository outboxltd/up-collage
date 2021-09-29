module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('info_msg', "Please log in to view the dashboard")
        res.redirect('/login')
    }
}