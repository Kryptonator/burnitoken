// tools/github-auth-checker.js
const { Octokit } = require('@octokit/rest');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function checkGitHubAuth() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not found in .env file.');
    return;
  }
  console.log('🔑 Found GITHUB_TOKEN. Attempting to authenticate...');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  try {
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Successfully authenticated as ${user.login}`);
  } catch (error) {
    console.error(`❌ GitHub authentication failed: ${error.message}`);
    console.log('Please check if your GITHUB_TOKEN is correct and has the necessary permissions.');
  }
}

checkGitHubAuth();
