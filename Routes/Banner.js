const express = require('express');
const router = express.Router();
const Banner = require('../Models/BannerSchema');

router.post('/save', async (req, res) => {
    try {
        const { banners } = req.body;

        // Kiểm tra nếu mảng banners rỗng
        if (!banners || banners.length === 0) {
            return res.status(400).json({ message: 'Empty banners array' });
        }

        // Tạo một mảng chứa các document của banner để lưu vào cơ sở dữ liệu
        const bannerDocuments = banners.map((imageUrl) => ({
            imageUrl,
        }));

        // Sử dụng phương thức insertMany của Mongoose để lưu danh sách các banner vào cơ sở dữ liệu
        const savedBanners = await Banner.insertMany(bannerDocuments);

        res.status(201).json(savedBanners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.get('/getbanners', async (req, res) => {
    try {
        const banners = await Banner.find(); // Lấy tất cả các banners từ cơ sở dữ liệu

        res.status(200).json({ banners }); // Trả về danh sách banners nếu thành công
    } catch (error) {
        res.status(500).json({ message: error.message }); // Trả về thông báo lỗi nếu có lỗi xảy ra
    }
});

router.delete('/banners/:id', async (req, res) => {
    try {
        const bannerId = req.params.id;

        // Validate bannerId
        if (!bannerId) {
            return res.status(400).json({ error: 'Invalid banner ID' });
        }

        // Use Mongoose's findByIdAndDelete to remove the banner
        const deletedBanner = await Banner.findByIdAndDelete(bannerId);

        if (!deletedBanner) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
