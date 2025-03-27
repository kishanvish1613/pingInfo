const cron = require('node-cron');
const ping = require('ping');
const nodemailer = require('nodemailer');
const Ping = require('../models/ping-model');
const Mail = require('../models/mail-model');
const path = require('path');
const fs = require('fs');
const { readLogFiles } = require('../controllers/read-logs-controller');
const { EMAIL_ID, EMAIL_PASS } = require('../config/serverConfig');

let intervalIds = {};

// Midnight cron job to restart all ping monitors
cron.schedule('0 0 * * *', async () => {
    console.log('🕛 Midnight cron job: Restarting all ping monitors for new day...');

    // Stop all running ping monitors
    for (const host in intervalIds) {
        clearInterval(intervalIds[host]);
        delete intervalIds[host];
    }

    // Restart all monitors from database
    const hosts = await Ping.find({});
    const emails = (await Mail.find({})).map(email => email.mailId);

    hosts.forEach(host => {
        startPingForHost(host.host, emails);
    });

    console.log('✅ All ping monitors restarted for the new day.');
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

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
        const pingData = readLogFiles(logDir);
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

    if (intervalIds[host]) {
        req.flash('error', `Ping monitoring is already running for ${host}.`);
        return res.redirect('/api/v1/dashboard');
    }

    try {
        const emails = (await Mail.find({})).map(email => email.mailId);
        startPingForHost(host, emails);
        req.flash('success', `Ping monitoring started for ${host}.`);
    } catch (error) {
        req.flash('error', `Failed to start monitoring: ${error.message}`);
    }
    res.redirect('/api/v1/dashboard');
};

const startPingForHost = (host, emailRecipients) => {
    const currentDate = new Date();
    const folderName = `${host}__${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const folderPath = path.join(__dirname, '..', '..', 'logs', folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

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
                if (err) console.error(`Error writing to log: ${err}`);
            });

            if (!response.alive) {
                failureCount++;
                if (failureCount >= 10) {
                    sendFailureEmail(host, emailRecipients);
                    failureCount = 0;
                }
            } else {
                failureCount = 0;
            }

            console.log(`Logged: ${logMessage}`);
        } catch (error) {
            console.error(`Error pinging ${host}: ${error.message}`);
        }
    }, 4000);

    intervalIds[host] = intervalId;
    console.log(`Ping monitoring started for ${host}.`);
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
    const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.in',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_ID,
            pass: EMAIL_PASS
        }
    });

    const mailOptions = {
        from: EMAIL_ID,
        to: emailRecipients.join(','),
        subject: `Host ${host} is unreachable`,
        text: `The host ${host} has been unreachable for 10 consecutive times at site-4 Itpark. Please check .`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Email send error:', error);
        else console.log('Email sent:', info.response);
    });
};

const deleteHost = async (req, res) => {
    try {
        const hostName = req.body;
        const response = await Ping.deleteOne(hostName);
        req.flash('success', 'Host record deleted');
        req.flash('data', response);
    } catch (error) {
        req.flash('error', `Error: Not able to delete a host - ${error.message}`);
    }
    res.redirect('/api/v1/dashboard');
};

module.exports = {
    pingCreate,
    findAllPing,
    startPingMonitoring,
    stopPingMonitoring,
    deleteHost
};