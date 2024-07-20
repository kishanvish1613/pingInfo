const User = require('../models/user-model');

const create = async (req, res) => {
    try {
        const data = await User.create(req.body);
        return res.status(201).json({
            data: data,
            message: 'Successfully created a user',
            err: {},
            success: true
        });
    } catch (error) {
        return res.status(201).json({
            data: {},
            message: 'Not able to create a user',
            err: error,
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Find user by userId only
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).render('login', {
                message: 'No user found',
                success: false,
                data: {}
            });
        }

        // Compare the provided password with the stored hashed password
        if (!user.comparePassword(password)) {
            return res.status(401).render('login', {
                message: 'Incorrect password',
                success: false,
                data: {}
            });
        }

        const token = user.genJWT();
        console.log(token);

        res.cookie('token', token, { httpOnly: true }); // Cookies setup

        return res.status(200).redirect('/api/v1/dashboard');
    } catch (error) {
        return res.render('login', {
            data: {},
            success: false,
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/api/v1/login');
};

const updateUserPassword = async (req, res) => {
    try {
        const currentPassword = req.body;
    } catch (error) {
        return res.render('login', {
            data: {},
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    create,
    login,
    logout
};
