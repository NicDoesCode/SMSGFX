const AzureStorageBlob = require('@azure/storage-blob');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const instanceFileRegex = /\.instance\.[A-z0-9]{1,20}$/i;

require('dotenv').config();

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING_dev;
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME_dev;
const deployFilePath = './wwwroot';

async function main() {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    console.log(`Delete existing files from container '${containerName}':`);
    console.log();
    
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
        if (!blobIsInstanceConfig(blob.name)) {
            console.log(`> Deleting blob: ${blob.name}`)
            await containerClient.deleteBlob(blob.name);
        }
    }
    
    console.log('Finished!');
    console.log();

    console.log(`Upload new files from '${deployFilePath}' to container '${containerName}':`);
    console.log();

    const files = getAllFilesRecursive(deployFilePath);
    const basePath = path.join(__dirname, deployFilePath);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.startsWith(__dirname)) {
            const blobName = file.substring(basePath.length + 1);
            if (!blobIsInstanceConfig(blobName)) {
                console.log(`> Uploading blob: ${blobName}`)
                const blobClient = containerClient.getBlockBlobClient(blobName);
                await blobClient.uploadFile(file);
            }
        }
    }
    
    console.log('Finished!');
    console.log();
}

/**
 * Performs a recursive search for files.
 * @param {string} scanDirectory - Directory to read from, relative to the current directory.
 * @param {string[]|null|undefined} outputArray - Optional. Array to add files to.
 * @returns {string[]}
 */
function getAllFilesRecursive(scanDirectory, outputArray) {
    if (!outputArray) outputArray = [];
    let fileNames = fs.readdirSync(scanDirectory);
    fileNames.forEach(fileName => {
        const relativePath = `${scanDirectory}/${fileName}`;
        const stat = fs.statSync(relativePath);
        if (stat.isDirectory()) {
            outputArray = getAllFilesRecursive(relativePath, outputArray);
        } else {
            outputArray.push(path.join(__dirname, scanDirectory, '/', fileName));
        }
    });
    return outputArray;
}

/**
 * Gets whether or not the blob is an instance config item.
 * @param {string} blobName - Name of the blob to evaluate.
 * @returns {boolean}
 */
function blobIsInstanceConfig(blobName) {
    if (!blobName) return false;
    const nameParts = blobName.split('/');
    if (nameParts.length === 0) return false;

    const fileName = nameParts[nameParts.length - 1];
    return instanceFileRegex.test(fileName);
}

main();