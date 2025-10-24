import express from "express";
import { allUsers, changePassword, forgetPassword, getUserById, login, logout, register,  reVerify,  verifyUser, verityOTP } from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middleware/IsAuthonticated.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);

router.post("/reVerify", reVerify);
router.post("/login", login);
router.post("/logout",isAuthenticated, logout);
router.post("/forgot-password",forgetPassword )
router.post("/verify-otp/:email",verityOTP )
router.post("/change-password/:email",changePassword )
router.get("/all-user",isAuthenticated,isAdmin,allUsers)
router.get("/get-user/:userId",getUserById)

export default  router;