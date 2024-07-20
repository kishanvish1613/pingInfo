const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    EMAIL_ID: process.env.EMAIL_ID,
    EMAIL_PASS: process.env.EMAIL_PASS,
    MONGO_URL: process.env.MONGO_URL,
    EMAIL_RECIPIENTS: process.env.EMAIL_RECIPIENTS
}