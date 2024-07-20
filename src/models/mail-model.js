const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    mailId: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;

