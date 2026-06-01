import type { Request, Response } from "express";
import { userRepository, eventImageRepository } from "../repository/index";
import {
  ProfileImageUploadResponseDto,
  EventImageUploadResponseDto,
  MultipleEventImagesUploadResponseDto,
} from "../dto/response/upload.response.dto";

export class UploadController {
  static uploadProfileImage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const user = req.headers["user"] as any;
      const userId = user?.id || null;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const imageUrl = `/image/profile/${req.file.filename}`;

      const updatedUser = await userRepository.updateUser(userId, {
        profileImage: imageUrl,
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const responseData = new ProfileImageUploadResponseDto({
        filename: req.file.filename,
        url: imageUrl,
        size: req.file.size,
        user: updatedUser,
      });

      res.status(200).json({
        success: true,
        message: "Profile image uploaded and saved successfully",
        data: responseData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading profile image",
        error: error.message,
      });
    }
  };

  static uploadEventImages = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
        return;
      }

      const eventId = req.body.eventId
        ? Number.parseInt(req.body.eventId)
        : null;
      if (!eventId) {
        res.status(400).json({
          success: false,
          message: "Event ID is required",
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const imagesToSave = files.map((file) => ({
        imageUrl: `/image/event/${file.filename}`,
        caption: req.body.caption || null,
      }));

      const savedImages = await eventImageRepository.addImages(
        eventId,
        imagesToSave
      );

      const responseData = new MultipleEventImagesUploadResponseDto({
        eventId,
        count: savedImages.length,
        images: savedImages.map((img, index) => ({
          id: img.id,
          eventId,
          filename: files[index].filename,
          url: img.imageUrl,
          caption: img.caption,
          size: files[index].size,
        })),
      });

      res.status(200).json({
        success: true,
        message: `${savedImages.length} event image(s) uploaded and saved successfully`,
        data: responseData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading event images",
        error: error.message,
      });
    }
  };

  static uploadEventImage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const eventId = req.body.eventId
        ? Number.parseInt(req.body.eventId)
        : null;
      if (!eventId) {
        res.status(400).json({
          success: false,
          message: "Event ID is required",
        });
        return;
      }

      const imageUrl = `/image/event/${req.file.filename}`;
      const caption = req.body.caption || null;

      const savedImages = await eventImageRepository.addImages(eventId, [
        { imageUrl, caption },
      ]);

      const eventImage = savedImages[0];

      const responseData = new EventImageUploadResponseDto({
        id: eventImage.id,
        eventId,
        filename: req.file.filename,
        url: imageUrl,
        caption: eventImage.caption,
        size: req.file.size,
      });

      res.status(200).json({
        success: true,
        message: "Event image uploaded and saved successfully",
        data: responseData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading event image",
        error: error.message,
      });
    }
  };
}
