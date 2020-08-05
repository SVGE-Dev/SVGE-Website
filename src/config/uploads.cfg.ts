import { Options, memoryStorage, diskStorage } from "multer";
import { Request } from "express";

export type File = Express.Multer.File;
type Callback = (error : Error | null, acceptFile : boolean) => void;

export namespace Uploads
{
    export const imgUploads : Options = {
        storage: memoryStorage(),
        fileFilter: (req : Request, file : File, acceptFile : Callback) => {
            const allowedMimeTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/bmp",
                "image/tiff"
            ];
            acceptFile(null, allowedMimeTypes.includes(file.mimetype));
        },
        limits: {
            fileSize: 1024 * 1024 * 8, // 8MB max file size
            files: 5 // max of five files at a time; this is more about ensuring endpoint is restful.
        }
    };
}