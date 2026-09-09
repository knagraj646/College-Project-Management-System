import mongoose from "mongoose";

export const dbConnection = async () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "My_management_system",
    })
    .then(() => {
      console.log("Connected successfully !");
    })
    .catch((err) => {
      console.log("Connection failed ", err);
    });
};
