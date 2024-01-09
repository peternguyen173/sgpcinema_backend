const express = require('express');
const router = express.Router();


const User = require('../Models/UserSchema')
const Movie = require('../Models/MovieSchema')
const Booking = require('../Models/BookingSchema')
const Screen = require('../Models/ScreenSchema')
const Promotion = require('../Models/PromotionSchema')

const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const adminTokenHandler = require('../Middlewares/checkAdminToken');


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.get('/test', async (req, res) => {
    res.json({
        message: "Movie api is working"
    })
})


// admin access
router.post('/createmovie', adminTokenHandler, async (req, res, next) => {
    try {
        const { title, description, portraitImgUrl, landscapeImgUrl, language, director, cast, releasedate, rated, genre, duration } = req.body;

        const newMovie = new Movie({ title, description, portraitImgUrl, landscapeImgUrl, language, director, cast, releasedate, rated, genre, duration })
        await newMovie.save();
        res.status(201).json({
            ok: true,
            message: "Movie added successfully"
        });
    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})

router.post('/createscreen', adminTokenHandler, async (req, res, next) => {
    try {
        const { name, rows, screenType } = req.body;
        const newScreen = new Screen({
            name,
            rows,
            screenType,
            movieSchedules: []
        });

        await newScreen.save();


        res.status(201).json({
            ok: true,
            message: "Screen added successfully"
        });
    }
    catch (err) {
        console.log(err);
        next(err); // Pass any errors to the error handling middleware
    }
})

router.post('/updatescreen/:screenid', adminTokenHandler, async (req, res, next) => {
    try {
        const { name, rows, screenType } = req.body;
        const newScreen = new Screen({
            name,
            rows,
            screenType,
            movieSchedules: []
        });

        await newScreen.save();


        res.status(201).json({
            ok: true,
            message: "Screen added successfully"
        });
    }
    catch (err) {
        console.log(err);
        next(err); // Pass any errors to the error handling middleware
    }
})

router.put('/updatescreen/:screenid', adminTokenHandler, async (req, res, next) => {
    try {
        const screenId = req.params.screenid;
        const { name, rows, screenType } = req.body;

        // Tìm màn hình cần cập nhật trong cơ sở dữ liệu
        const screenToUpdate = await Screen.findById(screenId);

        if (!screenToUpdate) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        // Cập nhật thông tin mới
        screenToUpdate.name = name;
        screenToUpdate.rows = rows;
        screenToUpdate.screenType = screenType;

        // Lưu thông tin đã cập nhật vào cơ sở dữ liệu
        await screenToUpdate.save();

        res.status(200).json({
            ok: true,
            message: 'Screen updated successfully',
            updatedScreen: screenToUpdate // Gửi thông tin màn hình đã được cập nhật trở lại
        });
    } catch (err) {
        console.error(err);
        next(err); // Pass any errors to the error handling middleware
    }
});

router.post('/addmoviescheduletoscreen', adminTokenHandler, async (req, res, next) => {
    console.log("Inside addmoviescheduletoscreen")
    try {
        const { screenId, movieId, showTime, showDate } = req.body;
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({
                ok: false,
                message: "Screen not found"
            });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                ok: false,
                message: "Movie not found"
            });
        }

        screen.movieSchedules.push({
            movieId,
            showTime,
            notavailableseats: [],
            showDate
        });

        await screen.save();

        res.status(201).json({
            ok: true,
            message: "Movie schedule added successfully"
        });

    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})


// user access
router.post('/bookticket', authTokenHandler, async (req, res, next) => {
    try {
        const { showTime, showDate, movieId, screenId, seats, totalPrice, paymentId, paymentType, cornquantity, waterquantity } = req.body;
        console.log(req.body);

        // You can create a function to verify payment id

        const screen = await Screen.findById(screenId);

        if (!screen) {
            return res.status(404).json({
                ok: false,
                message: "Theatre not found"
            });
        }



        const movieSchedule = screen.movieSchedules.find(schedule => {
            console.log(schedule);
            let showDate1 = new Date(schedule.showDate);
            let showDate2 = new Date(showDate);
            if (showDate1.getUTCDay() === showDate2.getUTCDay() &&
                showDate1.getUTCMonth() === showDate2.getUTCMonth() &&
                showDate1.getUTCFullYear() === showDate2.getUTCFullYear() &&
                schedule.showTime === showTime &&
                schedule.movieId == movieId) {
                return true;
            }
            return false;
        });

        if (!movieSchedule) {
            return res.status(404).json({
                ok: false,
                message: "Movie schedule not found"
            });
        }

        const user = await User.findById(req.userId);
        const movie1 = await Movie.findById(movieId);
        const screen1 = await Screen.findById(screenId);
        console.log(movie1);

        if (!movie1) {
            return res.status(404).json({
                ok: false,
                message: "User not found"
            });
        }
        if (!movie1) {
            return res.status(404).json({
                ok: false,
                message: "User not found"
            });
        }
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "User not found"
            });
        }
        console.log('before newBooking done');
        const newBooking = new Booking({ userId: req.userId, showTime, showDate, moviename: movie1.title, bookDate: new Date(), screenname: screen1.name, seats, totalPrice, paymentId, paymentType, cornquantity, waterquantity })
        await newBooking.save();
        console.log('newBooking done');



        movieSchedule.notAvailableSeats.push(...seats);
        await screen.save();
        console.log('screen saved');

        user.bookings.push(newBooking._id);
        await user.save();
        console.log('user saved');
        res.status(201).json({
            ok: true,
            message: "Booking successful"
        });

    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})


router.get('/movies', async (req, res, next) => {
    try {
        const movies = await Movie.find();

        // Return the list of movies as JSON response
        res.status(200).json({
            ok: true,
            data: movies,
            message: 'Movies retrieved successfully'
        });
    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})
router.get('/movies/:id', async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const movie = await Movie.findById(movieId);
        if (!movie) {
            // If the movie is not found, return a 404 Not Found response
            return res.status(404).json({
                ok: false,
                message: 'Movie not found'
            });
        }

        res.status(200).json({
            ok: true,
            data: movie,
            message: 'Movie retrieved successfully'
        });
    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})

router.put('/updatemovie/:id', adminTokenHandler, async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const { title, description, portraitImgUrl, landscapeImgUrl, language, director, cast, releasedate, rated, genre, duration } = req.body;

        // Tìm phim cần cập nhật
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                ok: false,
                message: 'Movie not found',
            });
        }

        // Cập nhật thông tin phim
        movie.title = title;
        movie.description = description;
        movie.portraitImgUrl = portraitImgUrl;
        movie.landscapeImgUrl = landscapeImgUrl;
        movie.language = language;
        movie.director = director;
        movie.cast = cast;
        movie.releasedate = releasedate;
        movie.rated = rated;
        movie.genre = genre;
        movie.duration = duration;

        await movie.save();

        res.status(200).json({
            ok: true,
            message: 'Movie updated successfully',
            data: movie,
        });
    } catch (err) {
        next(err); // Chuyển các lỗi tới middleware xử lý lỗi
    }
});

router.delete('/deletemovie/:id', async (req, res, next) => {
    try {
        const movieId = req.params.id;

        // Tìm phim dựa trên ID và xóa nó
        const deletedMovie = await Movie.findByIdAndDelete(movieId);

        if (!deletedMovie) {
            return res.status(404).json({
                ok: false,
                message: "Movie not found"
            });
        }

        res.status(200).json({
            ok: true,
            message: "Movie deleted successfully"
        });
    } catch (err) {
        next(err); // Chuyển mọi lỗi đến middleware xử lý lỗi
    }
});

router.get('/getscreens/', async (req, res, next) => {

    try {
        const screens = await Screen.find();
        if (!screens || screens.length === 0) {
            return res.status(404).json(createResponse(false, 'No screens found', null));
        }

        res.status(200).json(createResponse(true, 'Screens retrieved successfully', screens));
    }
    catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
});

router.get('/getscreenbyid/:screenId', async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        res.status(200).json(createResponse(true, 'Screen retrieved successfully', screen));
    } catch (error) {
        console.error(error);
    }
});

router.get('/screensbymovieschedule/undefined/:date/:movieid', async (req, res, next) => {
    try {
        const date = req.params.date;
        const movieId = req.params.movieid;

        // Lấy tất cả màn hình
        const screens = await Screen.find();

        // Kiểm tra xem có màn hình nào không
        if (!screens || screens.length === 0) {
            return res.status(404).json(createResponse(false, 'Không tìm thấy màn hình', null));
        }

        let temp = []
        // Lọc màn hình dựa trên ngày và ID phim
        screens.forEach(screen => {
            screen.movieSchedules.forEach(schedule => {
                let showDate = new Date(schedule.showDate);
                let bodyDate = new Date(date);

                if (
                    showDate.getDay() === bodyDate.getDay() &&
                    showDate.getMonth() === bodyDate.getMonth() &&
                    showDate.getFullYear() === bodyDate.getFullYear() &&
                    schedule.movieId == movieId
                ) {
                    temp.push(screen);
                }
            })
        });

        console.log(temp);

        res.status(200).json(createResponse(true, 'Lấy danh sách màn hình thành công', temp));

    } catch (err) {
        next(err); // Chuyển mọi lỗi đến middleware xử lý lỗi
    }
});



router.get('/schedulebymovie/:screenid/:date/:showtime/:movieid', async (req, res, next) => {
    const screenId = req.params.screenid;
    const date = req.params.date;
    const movieId = req.params.movieid;
    const showtime = req.params.showtime;

    const screen = await Screen.findById(screenId);

    if (!screen) {
        return res.status(404).json(createResponse(false, 'Screen not found', null));
    }

    const movieSchedules = screen.movieSchedules.filter(schedule => {
        let showDate = new Date(schedule.showDate);
        let bodyDate = new Date(date);
        if (showDate.getUTCDay() == bodyDate.getUTCDay() &&
            showDate.getUTCMonth() == bodyDate.getUTCMonth() &&
            showDate.getUTCFullYear() == bodyDate.getUTCFullYear() &&
            schedule.movieId == movieId
            && schedule.showTime === showtime) {
            return true;
        }
        return false;
    });
    console.log(movieSchedules)

    if (!movieSchedules) {
        return res.status(404).json(createResponse(false, 'Movie schedule not found', null));
    }

    res.status(200).json(createResponse(true, 'Movie schedule retrieved successfully', {
        screen,
        movieSchedulesforDate: movieSchedules,
        date
    }));

});

router.get('/schedules/:screenId', async (req, res) => {
    try {
        const { screenId } = req.params;

        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        const schedules = screen.movieSchedules.map(schedule => ({
            _id: schedule._id,
            movieTitle: schedule.movieTitle, // Thay bằng tên trường thực tế của phim
            screenName: screen.name, // Tên màn hình
            showDate: schedule.showDate, // Thay bằng tên trường thực tế của ngày chiếu
            showTime: schedule.showTime, // Thay bằng tên trường thực tế của giờ chiếu
        }));

        return res.status(200).json({ schedules });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching schedules', error: error.message });
    }
});

router.delete('/deleteschedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;

        const screen = await Screen.findOneAndUpdate(
            { 'movieSchedules._id': scheduleId },
            { $pull: { movieSchedules: { _id: scheduleId } } },
            { new: true }
        );

        if (!screen) {
            return res.status(404).json({ ok: false, message: 'Schedule not found' });
        }

        res.status(200).json({ ok: true, message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: 'Server error' });
    }
});



router.delete('/deletescreen/:screenid', async (req, res) => {
    const { screenid } = req.params;

    try {
        const deletedScreen = await Screen.findByIdAndDelete(screenid);
        if (!deletedScreen) {
            return res.status(404).json({ message: "Phòng chiếu không tồn tại." });
        }
        res.status(200).json({ message: "Xóa phòng chiếu thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xảy ra khi xóa phòng chiếu." });
    }

});

router.get('/getuserbookings', authTokenHandler, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate('bookings');
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

router.get('/getuserbookings/:id', authTokenHandler, async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json(createResponse(false, 'Booking not found', null));
        }

        res.status(200).json(createResponse(true, 'Booking retrieved successfully', booking));
    } catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
})

router.post('/createpromotion', adminTokenHandler, async (req, res, next) => {
    try {
        const { title, type, description, discount, startDate, expiryDate } = req.body;

        const newPromotion = new Promotion({ title, type, description, discount, startDate, expiryDate });
        await newPromotion.save();

        res.status(201).json({
            ok: true,
            message: "Promotion created successfully"
        });
    } catch (err) {
        next(err); // Chuyển các lỗi tới middleware xử lý lỗi
    }
});

router.get('/getpromotions', async (req, res, next) => {
    try {
        const promotions = await Promotion.find();

        if (!promotions || promotions.length === 0) {
            return res.status(404).json(createResponse(false, 'No promotions found', null));
        }

        res.status(200).json(createResponse(true, 'Promotions retrieved successfully', promotions));
    } catch (err) {
        next(err); // Pass any errors to the error handling middleware
    }
});

router.delete('/deletepromotion/:promotionId', adminTokenHandler, async (req, res, next) => {
    try {
        const promotionId = req.params.promotionId;

        // Tìm và xóa khuyến mãi dựa trên ID
        const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            return res.status(404).json({
                ok: false,
                message: "Promotion not found"
            });
        }

        res.status(200).json({
            ok: true,
            message: "Promotion deleted successfully"
        });
    } catch (err) {
        next(err); // Chuyển mọi lỗi đến middleware xử lý lỗi
    }
});




router.use(errorHandler)

module.exports = router;
