import express from "express";
import conn from "./connection/conn.js";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorHandler } from "./middleware/middlewares.js";
import { TryCatch } from "./utils/utils.js";
import router from "./Routes/Router.js";

const app = express();
const PORT = 3501;

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/", router);

TryCatch(conn);

app.get("/signin", (req, res) => res.render("signin"));

app.listen(PORT, () => console.log(`server running on ${PORT}`));

app.use(ErrorHandler);
