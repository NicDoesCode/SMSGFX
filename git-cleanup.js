const { exec } = require('node:child_process');

const rxGone = /:\sgone\]/;
const rxInUse = /^\*\s/;
const rxBranch = /^\s+([^\s]+)/;

async function pruneAsync() {
    console.log('> Pruning branches');
    return new Promise((resolve, reject) => {
        exec('git remote prune origin', (error, stdout, stderr) => {
            if (stderr || error) {
                reject('Error when pruning branches.');
            } else if (stdout) {
                resolve();
            }
        });
    });
}

/**
 * @returns {Promise<string[]>}
 */
async function getBranchesNoLongerOnOriginAsync() {
    console.log('> Getting branches no longer on origin');
    return new Promise((resolve, reject) => {
        exec('git branch -vv', (error, stdout, stderr) => {
            if (stderr || error) {
                reject('Error when getting branches.');
            } else if (stdout) {
                const lines = stdout.replace('\r', '').split('\n')
                    .filter((line) => rxGone.test(line))
                    .filter((line) => !rxInUse.test(line))
                    .filter((line) => rxBranch.test(line));
                resolve(lines.map((line) => rxBranch.exec(line)[1]));
            }
        });
    });
}

/**
 * @param {string[]} arrayOfBranches 
 */
async function deleteBranchesAsync(arrayOfBranches) {
    console.log('> Removing branches no longer on origin');
    if (arrayOfBranches.length > 0) {
        arrayOfBranches.forEach((branchName) => {
            exec(`git branch -d "${branchName}"`, (error, stdout, stderr) => {
                if (stderr || error) {
                    console.error(`  - Error when deleting branch: ${branchName}`, stderr);
                } else if (stdout) {
                    console.log(`  - Deleted: ${branchName}`);
                }
            });
        });
    } else {
        console.log('> No branches to remove');
    }
}

async function runAsync() {
    await pruneAsync();
    const branches = await getBranchesNoLongerOnOriginAsync();
    await deleteBranchesAsync(branches);
}

runAsync();