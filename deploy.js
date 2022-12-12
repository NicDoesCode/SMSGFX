const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const instanceFileRegex = /\.instance\.[A-z0-9]{1,20}$/i;


// Load environment variables

require('dotenv').config();


// Get environment variables

const environment = getEnvironment();
if (!environment) {
    console.error(`ERROR: Please specify an environment using the '-environment XXX' or '--e XXX' parameter.`);
    process.exit();
}

const connStr = process.env[`AZURE_STORAGE_CONNECTION_STRING_${environment}`];
if (!connStr) {
    console.error(`ERROR: No connection string set in 'AZURE_STORAGE_CONNECTION_STRING_${environment}' environment variable.`);
    process.exit();
}

const containerName = process.env[`AZURE_STORAGE_CONTAINER_NAME_${environment}`];
if (!containerName) {
    console.error(`ERROR: No container name set in 'AZURE_STORAGE_CONTAINER_NAME_${environment}' environment variable.`);
    process.exit();
}


// Set client

const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
const localDeployPath = './wwwroot';


/**
 * Main method.
 */
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

    console.log(`Upload new files from '${localDeployPath}' to container '${containerName}':`);
    console.log();

    const files = getAllFilesRecursive(localDeployPath);
    const basePath = path.join(__dirname, localDeployPath);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.startsWith(__dirname)) {
            const blobName = file.substring(basePath.length + 1);
            if (!blobIsInstanceConfig(blobName)) {
                console.log(`> Uploading blob: ${blobName}`)
                const blobClient = containerClient.getBlockBlobClient(blobName);
                const contentType = getContentType(file);
                await blobClient.uploadFile(file, { blobHTTPHeaders: { 'blobContentType': contentType } });
            }
        }
    }

    console.log('Finished!');
    console.log();
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

/**
 * Gets the environment from the '-environment' or '--e' parameter.
 * @returns {string}
 */
function getEnvironment() {
    let result = null;
    process.argv.forEach((arg, index, args) => {
        if (arg === '-environment' || arg === '--e') {
            if (index + 1 < args.length) {
                const env = args[index + 1];
                if (!env.startsWith('-')) {
                     result = env;
                }
            }
        }
    });
    return result;
}


// Call main function
main();