// Jimp is a little retarded
import Jimp from 'jimp';
// tslint:disable-next-line: no-var-requires
const jimp : Jimp = require('jimp');

export const cropAndResize = async (targetWidth : number, targetHeight : number, file : Buffer) : Promise<Jimp> =>
{
    let img = await jimp.read(file);

    const width = img.getWidth();
    const height = img.getHeight();
    const currAr = width / height; // image's current aspect ratio
    const targetAr = targetWidth/targetHeight;

    img = (currAr > targetAr) ? img.resize(jimp.AUTO, targetHeight) : img.resize(targetWidth, jimp.AUTO);
    img = img.crop(
        (img.getWidth() - targetWidth) / 2,
        (img.getHeight() - targetHeight) / 2,
        targetWidth,
        targetHeight
        );
    return img;
};