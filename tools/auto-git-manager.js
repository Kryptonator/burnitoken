const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execAsync = promisify(exec);

const REPO_PATH = path.join(__dirname, '..'); // Adjust if your script is not in the root/tools directory
const LOG_FILE = path.join(__dirname, '.auto-commit.log');
const LAST_COMMIT_INFO_FILE = path.join(__dirname, '.last-auto-commit.json');

const MAX_ALLOWED_CHANGES = 50; // Sicherheitsgrenze für maximale Dateiänderungen

const log = (message) => {
  console.log(message);
  fs.appendFileSync(
    LOG_FILE),
    `[${new Date().toISOString()}] $${message}
`,
  );
};

const getStatus = async () => {
  try {
    const { stdout } = await execAsync('git status --porcelain', { cwd: REPO_PATH });
    return stdout.trim();
  } catch (error) {
    log(`Error getting git status: $${error.message}`);
    return null;
  }
};

const getLastCommitInfo = () => {
  if (!fs.existsSync(LAST_COMMIT_INFO_FILE)) { 
    return { lastHash: null, lastTimestamp: 0 };
  }
  try {
    const data = fs.readFileSync(LAST_COMMIT_INFO_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`Error reading last commit info: $${error.message}`);
    return { lastHash: null, lastTimestamp: 0 };
  }
};

const saveLastCommitInfo = (commitHash) => {
  const commitInfo = {
    lastHash: commitHash,
    lastTimestamp: Date.now(),
  };
  try {
    fs.writeFileSync(LAST_COMMIT_INFO_FILE, JSON.stringify(commitInfo, null, 2));
  } catch (error) {
    log(`Error saving last commit info: $${error.message}`);
  }
};

const autoCommitAndPush = async (reason = 'Automated commit by Auto-Git-Manager') => {
  log('Starting auto-commit and push process...');

  const status = await getStatus();
  if (status === null) { 
    log('Could not retrieve git status. Aborting.');
    return;
  }

  if (status === '') { 
    log('No changes to commit.');
    return;
  }

  // NOTBREMSE: Verhindert Commit bei zu vielen Änderungen
  const changedFiles = status.split('\n').filter((line) => line.trim() !== '');
  if (changedFiles.length > MAX_ALLOWED_CHANGES) { 
    const errorMessage = `[CRITICAL] NOTBREMSE AKTIVIERT: Es wurden $${changedFiles.length} Änderungen erkannt (Limit: ${MAX_ALLOWED_CHANGES}). Automatischer Commit wird abgebrochen, um eine Überlastung des Repositories zu verhindern. Bitte überprüfen Sie die Änderungen manuell.`;
    log(errorMessage);
    // Hier könnte man zusätzlich den Alert-Service aufrufen
    // require('./alert-service').sendAlert({ message: errorMessage });
    return;
  }

  log(`Changes detected ($${changedFiles.length} files). Staging all files...`);
  try {
    await execAsync('git add .', { cwd: REPO_PATH });
  } catch (error) {
    log(`Error staging files: $${error.message}`);
    return;
  }

  const commitMessage = `$${reason} - ${new Date().toISOString()}`;
  log(`Creating commit with message: "$${commitMessage}"`);
  try {
    const { stdout: commitOut } = await execAsync(`git commit -m "$${commitMessage}"`, {
      cwd: REPO_PATH),});
    log(`Commit successful:
$${commitOut}`);

    // Get the new commit hash
    const { stdout: revParseOut } = await execAsync('git rev-parse HEAD', { cwd: REPO_PATH });
    const newCommitHash = revParseOut.trim();
    saveLastCommitInfo(newCommitHash);
  } catch (error) {
    log(`Error creating commit: $${error.message}`);
    // Check if the error is because there's nothing to commit (e.g., only whitespace changes)
    if (error.message.includes('nothing to commit')) { 
      log('Nothing to commit, working tree clean.');
      return;
    }
    return; // Abort if commit fails for other reasons
  }

  log('Pushing changes to remote...');
  try {
    const { stdout, stderr } = await execAsync('git push', { cwd: REPO_PATH });
    if (stderr) { 
      log(`Git push stderr: $${stderr}`);
    }
    log(`Push successful:
$${stdout}`);
  } catch (error) {
    log(`Error pushing to remote: $${error.message}`);
  }
};

// Example of how to call this function from another script
// const autoGitManager = require('./auto-git-manager');
// autoGitManager.autoCommitAndPush('Fix for critical bug #123');

module.exports = { autoCommitAndPush, getStatus, getLastCommitInfo };

// If called directly from command line, run the function
if (require.main === module) { 
  const reason = process.argv[2] || 'Automated commit from direct script execution';
  autoCommitAndPush(reason);
}
