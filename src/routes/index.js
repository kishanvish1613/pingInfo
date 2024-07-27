const express = require('express');
const { create, login, logout } = require('../controllers/user-controller');
const { pingCreate, findAllPing, startPingMonitoring, stopPingMonitoring, deleteHost } = require('../controllers/ping-controller');
const { authenticate } = require('../middlewares/authentication');
const { createMail, findAllEmail, deleteEmail } = require('../controllers/mail-controller');
const { readLogFiles, showAllFolderInsideLogs, readFileContents } = require('../controllers/read-logs-controller');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/create', create);
router.post('/login', login);
router.post('/logout', logout);

router.get('/dashboard', authenticate, findAllPing, findAllEmail, (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    const data = req.flash('data');
    const { pingData, hosts, emails } = req;
    const userId = req.user.userId;

    res.render('dashboard', {
        message: successMessage.length ? successMessage[0] : errorMessage.length ? errorMessage[0] : null,
        data: data.length ? data[0] : null,
        pingData,
        hosts,
        emails,
        userId
    });
});

router.post('/pingCreate', authenticate, pingCreate);
router.get('/listOfHost', authenticate, findAllPing);

router.post('/startPing', authenticate, startPingMonitoring);
router.post('/stopMonitoring', authenticate, stopPingMonitoring);
router.post('/deletehost', authenticate, deleteHost);

router.post('/addemail', authenticate, createMail);
router.post('/deleteemail', authenticate, deleteEmail);

router.get('/logsFiles', authenticate, showAllFolderInsideLogs);
router.get('/readFile', authenticate, readFileContents);

module.exports = router;

