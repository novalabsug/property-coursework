import { Router } from "express";
import {
  createPropertyPost,
  fetchPropertiesGet,
  registerPost,
  signinPost,
} from "../controller/Controller.js";
import multer from "multer";
import { v4 as uniqueString } from "uuid";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, uniqueString() + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/register", registerPost);
router.post("/signin", signinPost);
router.post("/property/new", upload.array("photos", 10), createPropertyPost);
router.get("/properties", fetchPropertiesGet);

export default router;
