const express = require("express");
const router = express.Router();
const UserRouter = require("./user.route");
const NewsRouter = require("./news.route");
const CarRouter = require("./product.route");

const FooterContentRouter = require("./footer-content.route");
const ImageSettingRouter = require("./image.setting.route");

router.use("/user", UserRouter);
router.use("/news", NewsRouter);
router.use("/car", CarRouter);

router.use("/images", ImageSettingRouter);
router.use("/footer-content", FooterContentRouter);

module.exports = router;