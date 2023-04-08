const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

// PINNING ONLY IMAGE TO IPFS
async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    let responses = [];

    for (let idx in files) {
        const currDog = `${fullImagesPath}/${files[idx]}`;
        const streamFile = fs.createReadStream(currDog);

        const options = {
            pinataMetadata: {
                name : files[idx],
            },
        };
        
        try {
            // response will conatiain the ipfs hash of uploaded files, pin size and timestamp
            // format: IpfsHash, PinSize, Timestamp
            const response = await pinata.pinFileToIPFS(streamFile, options);
            responses.push(response);
        }
        catch(err) {
            console.log(err);
        }
    }

    return { responses, files };
}


// PINNING THE WHOLE METADATA of THE IMAGE CONTAINING ITS IPFS HASH that was obtained from the above function call
async function storeMetadata(metadata) {
    try {
        const options = {
            pinataMetadata: {
                name: metadata.name
            }
        }

        const response = await pinata.pinJSONToIPFS(metadata, options);
        return response;
    }
    catch(err) {
        console.log(err);
    }

    return null;
}

module.exports = { storeImages, storeMetadata };