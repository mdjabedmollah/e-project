import express from "express";
import { forgetPassword, login, logout, register,  reVerify,  verifyUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/IsAuthonticated.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);

router.post("/reVerify", reVerify);
router.post("/login", login);
router.post("/logout",isAuthenticated, logout);
router.post("/forgot-password",forgetPassword,forgetPassword )
export default  router;