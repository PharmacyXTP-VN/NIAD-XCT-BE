const express = require("express");
const bodyParser = require("body-parser");
const newsController = require("../controllers/news.controller");
const upload = require("../middlewares/upload");

const newsRouter = express.Router();
newsRouter.use(bodyParser.json());

newsRouter.get("/list", newsController.listNews);

newsRouter.get("/get/:id", newsController.getNewsDetailById);

newsRouter.post(
  "/create",
  upload.single("thumbnail"),
  newsController.createNews
);

newsRouter.put(
  "/update/:id",
  upload.single("thumbnail"),
  newsController.updateNews
);

newsRouter.delete("/delete/:id", newsController.deleteNews);

//get thumbnail by id
newsRouter.get("/thumbnail/:id", newsController.getThumbnailById);

module.exports = newsRouter;