module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: { onlyCategories: ['performance'] },
    },
    assert: { assertions: { 'categories:performance': ['error', { minScore: 0.9 }] } },
    upload: { target: 'temporary-public-storage' },
  },
};
