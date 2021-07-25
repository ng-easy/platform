const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  coverageReporters: ['html'],
  projects: [...getJestProjects(), '<rootDir>/libs/semantic-release-angular'],
};
