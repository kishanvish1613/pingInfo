const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{timestamps: true});

userSchema.pre('save', function(next){
    const user = this;
    const salt = bcrypt.genSaltSync(9);
    const encryptedPassword = bcrypt.hashSync(user.password, salt);
    user.password = encryptedPassword;
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

userSchema.methods.genJWT = function generate() {
    return jwt.sign({
        id: this._id,
        userId: this.userId
    }, 'ttbs_secret', { expiresIn: '1h' }); // 1m 3d, 360d
};

const User = mongoose.model('User', userSchema);

module.exports = User;
