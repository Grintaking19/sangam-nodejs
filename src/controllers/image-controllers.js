import { uploadToCloudinary } from "../helpers/cloudinaryHelper.js";
import Image from "../models/Image.js";
import cloudinary from "../config/cloudinary.js";
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { url, public_id } = await uploadToCloudinary(req.file.path);
    const newImage = new Image({
      url,
      publicId: public_id,
      uploadedBy: req.user.userId,
    });
    await newImage.save();
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: "Error uploading image" });
  }
};

// Implement Pagination and sorting in getAllImages
const getAllImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const images = await Image.find({})
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ success: false, error: "Error fetching images" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if image exists`
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }
    // Check if the user is the owner of the image
    if (image.uploadedBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized to delete this image" });
    }
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete the image from the database
    await Image.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, error: "Error deleting image" });
  }
};

export { uploadImage, getAllImages, deleteImage };
