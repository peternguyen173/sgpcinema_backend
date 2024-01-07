const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String
    },
    dob: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bookings: {
        type: Array,
        default: [],
    },

}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});
userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.password) {
        update.$set.password = await bcrypt.hash(update.$set.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;