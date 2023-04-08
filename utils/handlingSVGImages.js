const fs = require("fs");
const path = require("path");

async function getSVGImages(imagesFilePath) {
    const fullPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullPath);

    let XMLs = [];

    for (let file in files) {
        const mySVGImage = fs.readFileSync(`${fullPath}/${files[file]}`).toString();
        XMLs.push(mySVGImage);
    }

    return XMLs;
}

async function getSVGImagesURI(imagesFilePath) {
    const fullPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullPath);

    const URIs = [];

    for (let idx in files) {
        const currURI = fs.readFileSync(`${fullPath}/${files[idx]}`, "base64").toString();
        URIs.push(currURI);
    }

    return URIs;
}

module.exports = { getSVGImages, getSVGImagesURI };