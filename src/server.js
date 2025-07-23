require("dotenv").config(); // Để sử dụng các biến môi trường từ file .env
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const httpErrors = require("http-errors");
const cookieParser = require("cookie-parser"); // Dùng để xử lý cookie
const bodyParser = require("body-parser");
const db = require("./models/index"); // Import phần kết nối cơ sở dữ liệu
const routes = require("./routes/index"); // Import tất cả các route từ file routes
const app = express();

// Cấu hình CORS cho phép client truy cập
const corsOptions = {
  origin: "*", // Các domain được phép
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Các phương thức được phép
  allowedHeaders: "*", // Các header được phép
  credentials: true, // Cần thiết nếu bạn sử dụng cookie hoặc thông tin xác thực
};

// Sử dụng middleware CORS
app.use(cors(corsOptions));

// Sử dụng cookie-parser để xử lý cookie
app.use(cookieParser());

// Sử dụng body-parser để parse JSON request body
app.use(bodyParser.json());

// Sử dụng morgan để ghi log các request
app.use(morgan("dev"));

// Định nghĩa route chính cho ứng dụng
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to RestFul API",
  });
});

// Tất cả các route từ phía client sẽ được xử lý qua "/api"
app.use("/api", routes);

// Xử lý các URL không xác định (404)
app.use(async (req, res, next) => {
  next(httpErrors.NotFound());
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

// Kết nối cơ sở dữ liệu và khởi động server
const PORT = process.env.PORT || 8080; // Đặt PORT từ biến môi trường hoặc mặc định là 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  db.connectDB(); // Kết nối cơ sở dữ liệu khi server được khởi động
});