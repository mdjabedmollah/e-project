import mongoose from "mongoose";
const userSchmea = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "", //clodinary url
    },
    profilePicPublicId: {
      type: String,
      default: "", //clodinary url
    },
    email: {
      type: String,
      required: true,
      unigue: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: {
      type: String,
      default: null,
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
  },
  { timestamps: true }
);
export const User=mongoose.model("user", userSchmea);