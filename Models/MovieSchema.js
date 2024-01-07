const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    portraitImgUrl: {
        type: String,
        required: true
    },
    landscapeImgUrl: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    cast: {
        type: [String],
        required: true
    },
    releasedate: {
        type: Date,
        required: true
    },
    rated: {
        type: String,
        required: true
    },
    genre: {
        type: [String], // You can store multiple genres as an array of strings
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },

});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
