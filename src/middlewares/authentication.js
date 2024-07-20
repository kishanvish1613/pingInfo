const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorised access",
        });
    }

    jwt.verify(token, 'ttbs_secret', (err, user) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorised",
            });
        }
        req.user = user;
        next();
    });
};

module.exports = {
  authenticate
};
