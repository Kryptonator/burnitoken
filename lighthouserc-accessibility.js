module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: { onlyCategories: ['accessibility'] },
    },
    assert: { assertions: { 'categories:accessibility': ['error', { minScore: 0.9 }] } },
    upload: { target: 'temporary-public-storage' },
  },
};
