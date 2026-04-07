import { uploadToCloudinary } from "../helpers/cloudinaryHelper.js";
import Image from "../models/Image.js";
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { url, public_id } = await uploadToCloudinary(req.file.path);
    const newImage = new Image({
      url,
      publicId: public_id,
      uploadedBy: req.user._id,
    });
    await newImage.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Image uploaded successfully",
        image: newImage,
      });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: "Error uploading image" });
  }
};


const getAllImages = async (req, res) => {
    try {
        const images = await Image.find({});
        res.status(200).json({ success: true, images });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ success: false, error: "Error fetching images" });
    }
};

export { uploadImage, getAllImages };
