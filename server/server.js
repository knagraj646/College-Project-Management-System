import { dbConnection } from "./config/db.js";
import app from "./app.js";

//DATABASE Connection

dbConnection();

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server run on port:${PORT}`);
});

//Error handling
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection:${err.message}`);
  server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception:${err.message}`);
  process.exit(1);
});
export default server;
