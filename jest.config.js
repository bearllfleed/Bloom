/**
 * Jest 配置：领域层与组件测试。
 * 固定时区为上海，保证与"逻辑日期"相关的用例在任何机器上结果一致。
 */
process.env.TZ = 'Asia/Shanghai';

module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/**/index.ts'],
  coverageThreshold: {
    './src/domain/': { lines: 90, branches: 85, functions: 90, statements: 90 },
  },
};
