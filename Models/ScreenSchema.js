const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rows: {
        type: Array,
        required: true
    },
    screenType: {
        type: String, // Example: "Standard", "IMAX", "VIP", etc.
        required: true
    },
    movieSchedules: [
        {
            movieId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Movie', // Reference to the Movie model
                required: true
            },
            showTime: String,
            notAvailableSeats: [{
                // { row: 'D', col: 0, seat_id: '10', price: 300 }
                rowname: String,
                seat_id: String,

            }],
            showDate: Date
        }
    ]
});

const Screen = mongoose.model('Screen', screenSchema);

module.exports = Screen;
