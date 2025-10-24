import { User } from "../models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../email/emailVerify.js";
import { Session } from "../models/sessionModel.js";
import { sendOtpEmail } from "../email/sendOtpMail.js";
export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        success: false,
        messagge: "all fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        messagge: "user already exists",
      });
    }
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({ firstname, lastname, email, password: hash });

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    verifyEmail(token, email); //send  email here
    newUser.token = token;
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "user registered successfully",
      newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "Verification token has expired",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }

    // Find user by decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user verification
    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).jjson({
        success: false,
        message: "user not found",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    verifyEmail(token, email);
    user.token = token;
    console.log("token ", token);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "verification email sent agina successfully",
      token: user.token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fieds are requried",
      });
    }
    const exisitingUser = await User.findOne({ email });
    if (!exisitingUser) {
      return res.status(400).json({
        success: false,
        message: "user not found,please register first",
      });
    }

    const ispasswordValid = bcrypt.compareSync(
      password,
      exisitingUser.password
    );
    if (!ispasswordValid) {
      return res.status(400).json({
        success: false,
        message: "invalid credentials",
      });
    }
    if (exisitingUser.isVerified === false) {  
      return res.status(400).json({
        success: false,
        message: "email not verified,please verify your email",
      });
    }
    const accesToken = jwt.sign(
      { id: exisitingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );
    const refressToken = jwt.sign(
      { id: exisitingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );
    exisitingUser.isLoggedIn = true;
    await exisitingUser.save();
    //cheack if session already exists,if exists delete it
    const exisitingUserSession = await Session.findOne({
      userId: exisitingUser._id,
    });
    if (exisitingUserSession) {
      await Session.deleteOne({ userId: exisitingUser._id });
    }
    //create a new one
    await Session.create({userId: exisitingUser._id });

    return res.status(200).json({
      success: true,
      message: `welcome back ${exisitingUser.firstname}`,
      accesToken,
      refressToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout=async(req,res)=>{
  try {
    const userId=req.id
    
    await Session.deleteMany({userId})
    await User.findByIdAndUpdate(userId,{isLoggedIn:false})
    return res.status(200).json({
      success:true,
      message:"logged out successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}

export const forgetPassword=async(req,res)=>{
  try {
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }
    const otp=Math.floor(100000+ Math.random()*900000).toString();
    user.otp=otp;
    user.otpExpiry=Date.now()+10*60*1000;
    await user.save()
    //send email
    await sendOtpEmail(otp,email)
    return res.status(200).json({
      success:true,
      message:"otp sent to your email successfully"
    })
  } catch (error) {
    
  }
}
export const verityOTP=async(req,res)=>{
    try {
        const {otp}=req.body;
        const {email}=req.params
        if(!otp){
            return res.status(400).json({
                success:false,
                message:"please provite the opt"
            })
        }
        const user= await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"user not found"
            })
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({
                success:false,
                message:"Opt is not generated or already used"
            })
        }
        if(user.otpExpiry < new Date()){
             return res.status(400).json({
                success:false,
                message:"OTP expired,please request a new one"
            })
        }

        if(user.opt !==user.opt){
             return res.status(400).json({
                success:false,
                message:"Opt is invalid"
            })
        }
        user.otp=null;
        user.otpExpiry=null;
        await user.save();
         return res.status(200).json({
                success:true,
                message:"OTP verified successfully"
            })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const changePassword=async(req,res)=>{
    try {
      const {newPassword,conFirmPassword}=req.body;
      const {email}=req.params
      const user=await User.findOne({email})

      if(!user){
        return res.status(400).json({
          success:false,
          message:"User not found"
        })

      }
      if(!newPassword || !conFirmPassword){
         return res.status(400).json({
          success:false,
          message:"all fields are required"
        })
      }
      if(newPassword !== conFirmPassword){
        return res.status(400).json({
          success:false,
          message:"passwords do not match"
        })
      }
      const hash=await bcrypt.hash(newPassword,10)
     user.password=hash
      await user.save()
       return res.status(200).json({
          success:true,
          message:"Password changed successfully"
        })


    } catch (error) {
      return res.status(500).json({
      success:false,
      message:error.message
    })
    }
}

export const allUsers=async(req,res)=>{
  try {
    const user=await User.find()
    return res.status(200).json({
      success:true,
      user
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}

export const getUserById=async(req,res)=>{
  try {
    const {userId}=req.params;
    const user=await User.findById(userId).select("-password -otp -otpExpiry -token");
    if(!user){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }
    return res.status(200).json({
      success:true,
      user
    })
    
  } catch (error) {
    
  }
}
