const { getJestProjects } = require('@nrwl/jest');

export default {
  coverageReporters: ['html', 'lcov'],
  projects: [...getJestProjects()],
};
