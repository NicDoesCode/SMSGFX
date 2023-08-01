const { exec } = require('node:child_process');

const rxGone = /:\sgone\]/;
const rxInUse = /^\*\s/;
const rxBranch = /^\s+([^\s]+)/;

async function deleteBranches() {
    console.log('Removing branches no longer on origin');
    const branches = await getBranches();
    if (branches.length > 0) {
        branches.forEach((branchName) => {
            exec(`git branch -d "${branchName}"`, (error, stdout, stderr) => {
                if (stderr || error) {
                    console.error(`> Error when deleting branch: ${branchName}`, stderr);
                } else if (stdout) {
                    console.log(`> Deleted: ${branchName}`);
                }
            });
        });
    } else {
        console.log('> No branches to remove');
    }
}

/**
 * @returns {Promise<string[]>}
 */
async function getBranches() {
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

deleteBranches();