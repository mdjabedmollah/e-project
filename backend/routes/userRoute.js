import express from "express";
import { register, verifyUser } from "../controllers/userController.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);

export default  router;