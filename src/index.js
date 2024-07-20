const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const ejs = require('ejs');
const path = require('path');
const routes = require('./routes/index');
const connect = require('./config/db-config');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const { PORT } = require('./config/serverConfig');


// ejs
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// cors
app.use(cors());

// cookieParser
app.use(cookieParser());

// flash
app.use(session({
    secret: 'ttbs_secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log(`server started at ${PORT}`);
    connect();
    console.log(`db connecated successfully`);
});