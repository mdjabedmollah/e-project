import mongoose from  "mongoose";

const database = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/e-project");
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
export default database;