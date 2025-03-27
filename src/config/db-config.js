const mongoose = require('mongoose');
const { MONGO_URL } = require('../config/serverConfig');

const connect = async () => {
    await mongoose.connect(MONGO_URL);
}

module.exports = connect;