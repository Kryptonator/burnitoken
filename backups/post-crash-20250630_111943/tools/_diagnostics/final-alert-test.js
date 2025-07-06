// Function to clear the require cache for a specific module
const clearRequireCache = (modulePath) => {
  try {
    const resolvedPath = require.resolve(modulePath);
    if (require.cache[resolvedPath]) {
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  delete require.cache[resolvedPath];
};
      console.log(`Cache cleared for ${modulePath}`);
    }
  } catch (e) {
    // Module not found, which is fine if it's not a dependency everywhere
    // console.log(`Module ${modulePath} not found in cache, skipping.`);
  }
};

// Clear cache before requiring the modules
clearRequireCache('../alert-service');
clearRequireCache('../github-issue-creator');

const alertService = require('../alert-service');

async function runTest() {
  console.log('Starting final alert system test...');

  const testData = {
    level: 'critical',
    message: 'Final Test: Critical system failure detected.',
    details:
      'This is a test alert to verify the end-to-end functionality of the alerting system, including email, webhook, and GitHub issue creation.',
    timestamp: new Date().toISOString(),
  };

  try {
    await alertService.sendAlert(testData);
    console.log('Final alert test completed successfully.');
  } catch (error) {
    console.error('Final alert test failed:', error);
  }
}

runTest();
