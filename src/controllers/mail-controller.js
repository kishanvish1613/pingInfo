const Mail = require('../models/mail-model');

const createMail = async (req, res) => {
    try {
        const response = await Mail.create({ mailId: req.body.mailId });
        req.flash('success', 'New Email Added');
        req.flash('data', response);
        res.redirect('/api/v1/dashboard');
    } catch (error) {
        req.flash('error', 'Not able to add Email');
        res.redirect('/api/v1/dashboard');
    }
};

const findAllEmail = async (req, res, next) => {
    try {
        const result = await Mail.find({});
        req.emails = result;
        next();
    } catch (error) {
        req.flash('error', 'Not able to fetch Emails');
        res.redirect('/api/v1/dashboard');
    }
};

const deleteEmail = async (req, res) => {
    try {
        const emailId = req.body;
        const response = await Mail.deleteOne(emailId);
        req.flash('success', 'Email record deleted');
        req.flash('data', response);
        res.redirect('/api/v1/dashboard');
    } catch (error) {
        req.flash('error', `Error: Not able to delete a email - ${error.message}`);
        res.redirect('/api/v1/dashboard');
    }
}

module.exports = {
    createMail,
    findAllEmail,
    deleteEmail,
};

