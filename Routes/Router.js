import { Router } from "express";
import {
  addPropertyForDeletePost,
  addPropertyForUpdatePost,
  createCommentPost,
  createDislikePost,
  createLikePost,
  createPropertyPost,
  fetchAllPropertiesGet,
  fetchPropertiesGet,
  fetchPropertyPost,
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
router.get("/properties/:id", fetchPropertiesGet);
router.post("/property", fetchPropertyPost);
router.get("/all/properties", fetchAllPropertiesGet);
router.post("/property/delete", addPropertyForDeletePost);
router.post(
  "/property/update",
  upload.array("photos", 10),
  addPropertyForUpdatePost
);
router.post("/property/like", createLikePost);
router.post("/property/dislike", createDislikePost);
router.post("/property/comment", createCommentPost);

export default router;
