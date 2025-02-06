const cron = require('node-cron');
const ping = require('ping');
const nodemailer = require('nodemailer');
const Ping = require('../models/ping-model');
const path = require('path');
const fs = require('fs');
const {readLogFiles} = require('../controllers/read-logs-controller')

const { EMAIL_ID, EMAIL_PASS } = require('../config/serverConfig');
const { findAllEmail } = require('../controllers/mail-controller');



let intervalIds = {};

const pingCreate = async (req, res) => {
    try {
        const { host, description } = req.body;
        const record = await Ping.create({ host, description });
        req.flash('success', 'New Ping record added');
        req.flash('data', record);
        res.redirect('/api/v1/dashboard');
    } catch (error) {
        req.flash('error', `Error: Not able to create a pinging host - ${error.message}`);
        res.redirect('/api/v1/dashboard');
    }
};

const findAllPing = async (req, res, next) => {
    try {
        const hosts = await Ping.find({});
        const logDir = path.join(__dirname, '..', '..', 'logs');
        const pingData = readLogFiles(logDir); // Use the imported readLogFiles function
        req.pingData = pingData;
        req.hosts = hosts;
        next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to retrieve hosts.');
        res.redirect('/api/v1/dashboard');
    }
};


const startPingMonitoring = async (req, res) => {
    const host = req.body.host;
    const interval = 4000; // Default interval of 4 seconds

    // Check if ping monitoring is already running for the host
    if (intervalIds[host]) {
        req.flash('error', `Ping monitoring is already running for ${host}.`);
        return res.redirect('/api/v1/dashboard');
    }

    await findAllEmail(req, res, async () => {
        const emailRecipients = req.emails.map(email => email.mailId);

        startPingForHost(host, emailRecipients);

        req.flash('success', `Ping monitoring started for ${host}.`);
        res.redirect('/api/v1/dashboard');
    });
};

const startPingForHost = (host, emailRecipients) => {
    const currentDateTime = new Date();
    const folderName = `${host}__${currentDateTime.getFullYear()}-${currentDateTime.getMonth() + 1}-${currentDateTime.getDate()}`;
    const folderPath = path.join(__dirname, '..', '..', 'logs', folderName);

    fs.mkdirSync(folderPath, { recursive: true });

    const filePath = path.join(folderPath, `${host}-ping.log`);
    let failureCount = 0;

    const intervalId = setInterval(async () => {
        try {
            const response = await ping.promise.probe(host);
            const formattedDateTime = new Date().toLocaleString();

            const logMessage = response.alive
                ? `Host: ${host} - Time: ${response.time}ms - Date&Time: ${formattedDateTime}\n`
                : `Host: ${host} - Unreachable - Date&Time: ${formattedDateTime}\n`;

            fs.appendFile(filePath, logMessage, (err) => {
                if (err) throw err;
            });

            if (!response.alive) {
                failureCount++;
                if (failureCount >= 10) {
                    sendFailureEmail(host, emailRecipients);
                    failureCount = 0; // Reset counter after sending the email
                }
            } else {
                failureCount = 0; // Reset counter if host is reachable
            }

            console.log(`Logged: ${logMessage}`);
        } catch (error) {
            console.error(`Error pinging ${host}: ${error.message}`);
        }
    }, 4000);

    console.log(`Ping monitoring started for ${host}.`);

    intervalIds[host] = intervalId;
};

const stopPingMonitoring = async (req, res) => {
    const host = req.body.host;
    if (intervalIds[host]) {
        clearInterval(intervalIds[host]);
        delete intervalIds[host];

        await Ping.updateOne({ host }, { status: 'inactive' });

        req.flash('success', `Ping monitoring stopped for ${host}.`);
    } else {
        req.flash('error', `Ping monitoring is not running for ${host}.`);
    }
    res.redirect('/api/v1/dashboard');
};

const sendFailureEmail = (host, emailRecipients) => {
    let transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.in',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_ID,
            pass: EMAIL_PASS
        }
    });

    let mailOptions = {
        from: EMAIL_ID,
        to: emailRecipients.join(','), // Use the array of email recipients
        subject: `Host ${host} is unreachable`,
        text: `The host ${host} has been unreachable for 10 consecutive times at site-4 Itpark. Please check the server.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

const deleteHost = async (req, res) => {
    try {
        const hostName = req.body;
        const response = await Ping.deleteOne(hostName);
        req.flash('success', 'Host record deleted');
        req.flash('data', response);
        res.redirect('/api/v1/dashboard');
    } catch (error) {
        req.flash('error', `Error: Not able to delete a host - ${error.message}`);
        res.redirect('/api/v1/dashboard');
    }
};

// Schedule a task to run at midnight
// for mid night -> 0 0 * * *
cron.schedule('0 0 * * *', async () => {
    const hosts = await Ping.find({ status: 'active' });
    const emailRecipients = (await findAllEmail()).map(email => email.mailId);

    hosts.forEach(host => {
        startPingForHost(host.host, emailRecipients);
    });
});

module.exports = {
    pingCreate,
    findAllPing,
    startPingMonitoring,
    stopPingMonitoring,
    deleteHost
};
