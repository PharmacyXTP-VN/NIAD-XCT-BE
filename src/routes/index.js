const express = require("express");
const router = express.Router();
const UserRouter = require("./user.route");
const NewsRouter = require("./news.route");
const CarRouter = require("./product.route"); 


router.use("/user", UserRouter);
router.use("/news", NewsRouter);
router.use("/car", CarRouter); 

module.exports = router;