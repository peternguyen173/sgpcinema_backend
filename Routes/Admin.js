// adminRoutes.js

const express = require('express');
const router = express.Router();
const Admin = require('../Models/AdminSchema'); // Import the Admin model
const User = require('../Models/UserSchema'); // Import the User model
const Booking = require('../Models/BookingSchema'); // Import the Booking model

const bcrypt = require('bcrypt');
const errorHandler = require('../Middlewares/errorMiddleware');
const adminTokenHandler = require('../Middlewares/checkAdminToken');

const jwt = require('jsonwebtoken');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if the admin with the same email already exists
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json(createResponse(false, 'Admin with this email already exists'));
        }

        // Hash the admin's password before saving it to the database


        const newAdmin = new Admin({
            name,
            email,
            password
        });

        await newAdmin.save(); // Await the save operation

        res.status(201).json(createResponse(true, 'Admin registered successfully'));
    } catch (err) {
        // Pass the error to the error middleware
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json(createResponse(false, 'Invalid admin credentials'));
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid admin credentials'));
        }

        // Generate an authentication token for the admin
        const adminAuthToken = jwt.sign({ adminId: admin._id }, process.env.JWT_ADMIN_SECRET_KEY, { expiresIn: '60m' });

        res.cookie('adminAuthToken', adminAuthToken, { httpOnly: true });
        res.status(200).json(createResponse(true, 'Admin login successful', { adminAuthToken }));
    } catch (err) {
        next(err);
    }
});



router.get('/checklogin', adminTokenHandler, async (req, res) => {
    res.json({
        adminId: req.adminId,
        ok: true,
        message: 'Admin authenticated successfully'
    })
})

router.get('/logout', async (req, res) => {
    res.clearCookie('adminAuthToken'); // Xóa cookie 'adminAuthToken'
    res.json({
        ok: true,
        message: 'Admin logged out successfully'
    })
})

router.get('/getuserbyname/:name', async (req, res, next) => {
    try {
        const username = req.params.name;

        const user = await User.find({ name: { $regex: new RegExp(username) } });

        if (user.length === 0) {
            return res.status(404).json({
                ok: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'User found successfully',
            data: user,
        });
    } catch (error) {
        next(error); // Chuyển mọi lỗi đến middleware xử lý lỗi
    }
});

router.get('/getuserbyemail/:email', async (req, res, next) => {
    try {
        const userEmail = req.params.email;

        const user = await User.find({ email: { $regex: new RegExp(userEmail, 'i') } });

        if (user.length === 0) {
            return res.status(404).json({
                ok: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'User found successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
});


router.get('/getuserbyid/:userid', async (req, res, next) => {
    try {
        const userid = req.params.userid;

        const user = await User.findOne({ _id: userid });

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'User found successfully',
            data: user,
        });
    } catch (error) {
        next(error); // Chuyển mọi lỗi đến middleware xử lý lỗi
    }
});

router.post('/updateuserbyid/:userid', adminTokenHandler, async (req, res, next) => {
    try {
        const { name, email, password, phonenumber, dob, gender } = req.body;
        const updatedFields = {};
        const userid = req.params.userid
        if (name) {
            updatedFields.name = name;
        }
        if (email) {
            updatedFields.email = email;
        }
        if (password) {
            updatedFields.password = password;
        }
        if (phonenumber) {
            updatedFields.phonenumber = phonenumber;
        }
        if (dob) {
            updatedFields.dob = dob;
        }
        if (gender) {
            updatedFields.gender = gender;
        }

        const user = await User.findOneAndUpdate({ _id: userid }, { $set: updatedFields }, { new: true });

        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }

        res.status(200).json(createResponse(true, 'User updated successfully', user));
    } catch (err) {
        next(err);
    }
});

router.get('/getuserbookingsbyid/:userid', adminTokenHandler, async (req, res, next) => {
    try {
        const userid = req.params.userid
        const user = await User.findById(userid).populate('bookings');
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found', null));
        }

        let bookings = [];
        // user.bookings.forEach(async booking => {
        //     let bookingobj = await Booking.findById(booking._id);
        //     bookings.push(bookingobj);
        // })

        for (let i = 0; i < user.bookings.length; i++) {
            let bookingobj = await Booking.findById(user.bookings[i]._id);
            bookings.push(bookingobj);
        }

        res.status(200).json(createResponse(true, 'User bookings retrieved successfully', bookings));
        // res.status(200).json(createResponse(true, 'User bookings retrieved successfully', user.bookings));
    } catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})

router.use(errorHandler)

module.exports = router;