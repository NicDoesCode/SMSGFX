/**
 * DEPLOY TO AZURE STORAGE
 * This script will build and deploy the site to an Azure storage account.
 * Files in the existing 
 * 
 * The following environment variables are required: 
 * - AZURE_STORAGE_CONNECTION_STRING = connection string to the Azure storage account.
 * - AZURE_STORAGE_CONTAINER_NAME = Container to deploy to.
 */
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const instanceFileRegex = /\.instance\.[A-z0-9]{1,20}$/i;


// Load environment variables

require('dotenv').config();

// Load parameters

let env = '';
process.argv.forEach((value, index, array) => {
    if (value === '--env' && typeof array[index + 1] !== 'undefined') {
        env = `_${array[index + 1]}`;
    }
});

// Get environment variables

const CONTAINER_CONN_STRING = process.env[`AZURE_STORAGE_CONNECTION_STRING${env}`];
if (!CONTAINER_CONN_STRING) {
    console.error(`ERROR: No connection string set in 'AZURE_STORAGE_CONNECTION_STRING${env}' environment variable.`);
    process.exit();
}

const CONTAINER_NAME = process.env[`AZURE_STORAGE_CONTAINER_NAME${env}`];
if (!CONTAINER_NAME) {
    console.error(`ERROR: No container name set in 'AZURE_STORAGE_CONTAINER_NAME${env}' environment variable.`);
    process.exit();
}

// Set client

const blobServiceClient = BlobServiceClient.fromConnectionString(CONTAINER_CONN_STRING);

/**
 * Main method.
 */
async function main() {

    console.log(`Delete existing files from container '${CONTAINER_NAME}':`);

    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
        if (!blobIsInstanceConfig(blob.name)) {
            console.log(`> Deleting blob: ${blob.name}`)
            await containerClient.deleteBlob(blob.name);
        }
    }

    const localDeployPath = path.join(__dirname, 'dist');

    console.log(`Upload new files from '${localDeployPath}' to container '${CONTAINER_NAME}':`);

    const files = getAllFilesRecursive(localDeployPath);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.startsWith(localDeployPath)) {
            const blobName = file.substring(localDeployPath.length + 1);
            if (!blobIsInstanceConfig(blobName)) {
                console.log(`> Uploading blob: ${blobName}`)
                const blobClient = containerClient.getBlockBlobClient(blobName);
                const contentType = getContentType(file);
                await blobClient.uploadFile(file, { blobHTTPHeaders: { 'blobContentType': contentType } });
            }
        }
    }

    console.log('Finished!');
}


/**
 * Gets the content type of a file.
 * @param {string} fileName - File name to query.
 * @returns {string}
 */
function getContentType(fileName) {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    switch (extension) {
        case '.html': case '.htm': return 'text/html';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.css': return 'text/css';
        case '.jpeg': case '.jpg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.png': return 'image/png';
        case '.svg': return 'image/svg+xml';
        case '.ico': return 'image/ico';
    }
    return 'application/octet-stream';
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
            outputArray.push(path.join(scanDirectory, '/', fileName));
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


// Call main function
main();