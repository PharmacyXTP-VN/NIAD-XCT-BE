const { default: mongoose } = require("mongoose");
const db = require("../models");
const { user: User, news: News } = db;
const { GridFSBucket } = require("mongodb");
const { uploadProductImageToCloudinary } = require("../util/cloudinary.service");

//list news
async function listNews(req, res, next) {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    const total = await News.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const news = await News.find(filter, {
      title: 1,
      summary: 1,
      thumbnail: 1,
      publishedAt: 1,
      status: 1,
      tags: 1
    })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Get news successfully",
      data: news,
      total,
      totalPages,
      page,
      limit
    });
  } catch (error) {
    console.error("Error getting news", error);
    res.status(500).send({ message: error.message });
  }
}

//get news by id
async function getNewsDetailById(req, res, next) {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).send({ message: "News not found" });
    }
    res.status(200).json({
      message: "Get news successfully",
      data: news,
    });
  } catch (error) {
    console.error("Error getting news", error);
    res.status(500).send({ message: error.message });
  }
}

//create a news
async function createNews(req, res, next) {
  try {
    const { 
      title, content, summary, publishedAt, status, tags, 
      createdBy, updatedBy 
    } = req.body;
    const thumbnail = req.file;
    
    if (!title || !content || !thumbnail) {
      return res
        .status(400)
        .send({ message: "Title, content and thumbnail are required" });
    }

    // Parse tags nếu có
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' 
          ? JSON.parse(tags) 
          : tags;
      } catch (error) {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }

    // Tạo news object
    const newsData = {
      title: title,
      content: content,
      summary: summary || "",
      thumbnail: "",
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      status: status || "active",
      tags: parsedTags,
      createdBy: createdBy,
      updatedBy: updatedBy || createdBy,
    };

    const newNews = new News(newsData);

    // Upload thumbnail lên Cloudinary
    if (thumbnail) {
      const url = await uploadProductImageToCloudinary(thumbnail.buffer, `news/${newNews._id}`);
      newNews.thumbnail = url;
    }

    // Lưu bài viết vào MongoDB
    const savedNews = await newNews.save();

    // Trả về kết quả
    res.status(201).json({
      message: "News added successfully",
      news: savedNews,
    });
  } catch (error) {
    console.error("Error creating news", error);
    res.status(500).send({ message: error.message });
  }
}

//update a news with id
async function updateNews(req, res, next) {
  try {
    const { id } = req.params;
    const { 
      title, content, summary, publishedAt, status, tags, 
      updatedBy 
    } = req.body;
    const thumbnail = req.file;

    if (!title || !content) {
      return res
        .status(400)
        .send({ message: "Tiêu đề và nội dung là bắt buộc" });
    }
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).send({ message: "Không tìm thấy bài viết" });
    }

    // Cập nhật các trường cơ bản
    if (title) news.title = title;
    if (content) news.content = content;
    if (summary !== undefined) news.summary = summary;
    if (publishedAt) news.publishedAt = new Date(publishedAt);
    if (status) news.status = status;
    if (updatedBy) news.updatedBy = updatedBy;

    // Xử lý tags
    if (tags !== undefined) {
      try {
        news.tags = typeof tags === 'string' 
          ? JSON.parse(tags) 
          : tags;
      } catch (error) {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }

    // Upload thumbnail mới lên Cloudinary nếu có
    if (thumbnail) {
      const url = await uploadProductImageToCloudinary(thumbnail.buffer, `news/${id}`);
      news.thumbnail = url;
    }

    // Lưu bài viết sau khi cập nhật
    await news.save();

    res.status(200).json({
      message: "News updated successfully",
      news,
    });
  } catch (error) {
    console.error("Error updating news", error);
    res.status(500).send({ message: error.message });
  }
}

//delete a news with id
async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      return res.status(404).send({ message: "Không tìm thấy bài viết" });
    }
    res.status(200).json({
      message: "Xóa bài viết thành công",
      data: news,
    });
  } catch (error) {
    console.error("Error deleting news", error);
    res.status(500).send({ message: error.message });
  }
}

//get Thumbnail By Id
async function getThumbnailById(req, res, next) {
  const { id } = req.params;
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(id)
    );

    downloadStream.on("error", (err) => {
      res.status(404).json({ message: "Image not found", error: err });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving image", error });
  }
}
const NewsController = {
  listNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsDetailById,
  getThumbnailById,
};
module.exports = NewsController;