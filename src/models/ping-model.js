const mongoose = require('mongoose');

const pingSchema = new mongoose.Schema({
    host: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
},{timeseries: true});

const Ping = mongoose.model('Ping', pingSchema);


module.exports = Ping;
