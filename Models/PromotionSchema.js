const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
