
import fs from 'fs'
import { Buffer } from 'buffer'
import mergeImg from 'merge-img'
import path from 'path'
import os from 'os'

const Jimp = require('jimp');

function loadImageFromDataUrl(dataUrl) {
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    return Jimp.read(buffer);
}

async function combineImages(imageDataUrls) {
    const images = await Promise.all(imageDataUrls.map(url => Jimp.read(loadImageFromDataUrl(url))));

    // Calculate the dimensions of the combined image
    const combinedWidth = images[0].getWidth();
    const combinedHeight = images.reduce((height, img) => height + img.getHeight(), 0);

    // Create a new Jimp image with the combined dimensions
    const combinedImage = new Jimp(combinedWidth, combinedHeight);

    // Combine the images vertically
    let y = 0;
    images.forEach(img => {
        combinedImage.blit(img, 0, y);
        y += img.getHeight();
    });

    // Convert the combined image to a data URL
    const combinedDataUrl = await combinedImage.getBase64Async(Jimp.AUTO);

    return combinedDataUrl;
}

// Example usage
// const imageDataUrls = [
//     'data:image/png;base64,...', // Replace with actual image data URLs
//     'data:image/png;base64,...',
//     'data:image/png;base64,...'
// ];

// combineImages(imageDataUrls)
//     .then(dataUrl => {
//         console.log('Combined image data URL:', dataUrl);
//     })
//     .catch(error => {
//         console.error('Error combining images:', error);
//     });


export default async function handler(req, res) {
    try {
        const file = `./data/CRN112211.json`

        switch (req.method) {
            case "GET": {
                const raw = await fs.promises.readFile(file, 'utf8')
                const attendance = JSON.parse(raw);
                const dataURLs = attendance.filter(std => std.faceData).map(student => student.faceData);
                const retImg = await combineImages(dataURLs);
                res.status(200).json(retImg)
                break;
            }


            default:
                res.status(405).json({ error: "Method not supported" })
                break;
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: "An error occured. Check server console" })
    }
}










































// import fs from 'fs'
// import { Buffer } from 'buffer'
// import mergeImg from 'merge-img'
// import path from 'path'
// import os from 'os'

// export default async function handler(req, res) {
//     try {
//         const file = `./data/CRN112211.json`

//         switch (req.method) {
//             case "GET": {
//                 const raw = await fs.promises.readFile(file, 'utf8')
//                 const attendance = JSON.parse(raw);
//                 //console.log(attendance);

//                 const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-img-'));
//                 const dataURLs = attendance.filter(std => std.faceData).map(student => student.faceData);
//                 //console.log()
//                 // Convert each Data URL to a temporary image file
//                 const imagePaths = dataURLs.map((dataURL, index) => {
//                     const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
//                     const imagePath = path.join(tempDir, `image_${index}.png`);
//                     fs.writeFileSync(imagePath, base64Data, 'base64');
//                     return imagePath;
//                 });

//                 const image = await mergeImg(imagePaths)
//                 const dataUrl = await image.getBase64Async()
//                 fs.rmdirSync(tempDir, { recursive: true });
//                 res.status(200).json(dataUrl)
//                 break;
//             }


//             default:
//                 res.status(405).json({ error: "Method not supported" })
//                 break;
//         }
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({ error: "An error occured. Check server console" })
//     }
// }