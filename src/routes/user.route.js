const express = require("express");
const bodyParser = require("body-parser");
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.get("/getAll", userController.getAllUser);

userRouter.get("/get/:userId", userController.getUserById);

userRouter.get("/role/:roleName", userController.getUserByRole);

userRouter.get("/active/:isActive", userController.getUserByIsActive);

userRouter.delete("/delete/:userId", userController.deleteUserById);

userRouter.post("/add", upload.single("image"), userController.addNewUser);

userRouter.post("/login", userController.login);

userRouter.get("/all-role", userController.getRoleName);

userRouter.put(
  "/update/:id",
  upload.single("image"),
  userController.updateUserByAdmin
);

userRouter.get("/profile/:id", userController.viewProfile);

userRouter.put(
  "/profile/update/:id",
  upload.single("image"),
  userController.editProfile
);

userRouter.put("/profile/change-password/:id", userController.changePassword);

userRouter.put("/status/:id", userController.activateDeactivateUser);

userRouter.get("/search", userController.searchUser);

userRouter.put("/assign-role/:id", userController.assignRole);

userRouter.get("/image/:id", userController.getImageById);

userRouter.get("/getByCode/:code", userController.getUserByCode);

module.exports = userRouter;