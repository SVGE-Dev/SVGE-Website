import { Options as MulterOptions, memoryStorage, FileFilterCallback } from "multer";
import { Request } from "express";

export type File = Express.Multer.File;

export const imgUploadOptions : MulterOptions = {
	storage: memoryStorage(),
	fileFilter: (req : Request, file : File, acceptFile : FileFilterCallback) => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/png",
			//"image/gif",
			//"image/bmp",
			//"image/tiff"
		];
		acceptFile(null, allowedMimeTypes.includes(file.mimetype));
	},
	limits: {
		fileSize: 1024 * 1024 * 8, // 8MB max file size
		files: 2 // max of five files at a time; this is more about ensuring endpoint is restful.
	}
};