const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const os = require('os');
const path = require('path');
// const Git = require('nodegit');
const gitClone = require('git-clone/promise');
const { exec } = require('node:child_process');

const instanceFileRegex = /\.instance\.[A-z0-9]{1,20}$/i;


// Load environment variables

require('dotenv').config();


// Get environment variables

const CONTAINER_CONN_STRING = process.env[`AZURE_STORAGE_CONNECTION_STRING`];
if (!CONTAINER_CONN_STRING) {
    console.error(`ERROR: No connection string set in 'AZURE_STORAGE_CONNECTION_STRING' environment variable.`);
    process.exit();
}

const CONTAINER_NAME = process.env[`AZURE_STORAGE_CONTAINER_NAME`];
if (!CONTAINER_NAME) {
    console.error(`ERROR: No container name set in 'AZURE_STORAGE_CONTAINER_NAME' environment variable.`);
    process.exit();
}

const GIT_URL = process.env[`GIT_URL`];
if (!GIT_URL) {
    console.error(`ERROR: No Git URL set in 'GIT_URL' environment variable.`);
    process.exit();
}

const GIT_BRANCH = process.env[`GIT_BRANCH`];
if (!GIT_BRANCH) {
    console.error(`ERROR: No Git branch set in 'GIT_BRANCH' environment variable.`);
    process.exit();
}


// Set client

const appPrefix = 'smsgfx';
const blobServiceClient = BlobServiceClient.fromConnectionString(CONTAINER_CONN_STRING);
const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

/**
 * Main method.
 */
async function main() {

    if (!tmpdir) {
        console.error(`No tempory directory was given!`);
        return;
    }

    console.log(`Clone GIT repo '${GIT_URL}' '${GIT_BRANCH}' branch to '${tmpdir}'.`);

    // await Git.Clone.clone(GIT_URL, tmpdir, { checkoutBranch: GIT_BRANCH });
    await gitClone(GIT_URL, tmpdir, { checkout: GIT_BRANCH })

    console.log(`NPM install...`);

    await runProcess('npm install', tmpdir);

    console.log(`NPM build...`);

    await runProcess('npm run build', tmpdir);

    console.log(`Delete existing files from container '${CONTAINER_NAME}':`);

    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
        if (!blobIsInstanceConfig(blob.name)) {
            console.log(`> Deleting blob: ${blob.name}`)
            await containerClient.deleteBlob(blob.name);
        }
    }

    const localDeployPath = path.join(tmpdir, 'dist');

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

    console.log(`Remove temp directory '${tmpdir}'.`);

    if (fs.existsSync(tmpdir)) {
        fs.rmSync(tmpdir, { recursive: true });
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

/**
 * Runs a process using Promise.
 * @param {string} command - Command to execute.
 * @param {string} workingDirectory - Working directory (CWD).
 * @returns {Promise}
 */
async function runProcess(command, workingDirectory) {
    return new Promise((resolve, reject) => {
        const process = exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}


// Call main function
main();