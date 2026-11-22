/**
 * ESLint 配置：在 Expo 官方规则之上，用 import 限制强制分层（见技术方案 5.1、17）。
 * - 领域层：纯 TypeScript，不能依赖 React、Expo 或任何上层模块；
 * - 页面、功能组件、设计系统：不能直接访问数据库和系统能力，只能通过服务层与平台层；
 * - 当前时间只能从 platform/clock 获取，方便测试与"时间旅行"。
 */
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

const NO_CURRENT_TIME = [
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: '请通过 platform/clock 获取当前时间，不要直接 new Date()。',
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: '请通过 platform/clock 获取当前时间，不要直接 Date.now()。',
  },
];

module.exports = defineConfig([
  globalIgnores(['dist/*', 'ios/*', 'android/*', '.expo/*', 'src/ui/icons/generated/*', 'docs/*']),
  expoConfig,
  prettierRecommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_CURRENT_TIME],
      // React Compiler 规则还不理解 Reanimated SharedValue / 启动期 bootstrap，先关掉避免误报
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/platform/clock.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-*', 'expo', 'expo-*', '@expo/*', '@shopify/*'], message: '领域层必须是纯 TypeScript。' },
            {
              group: ['@/data/*', '@/services/*', '@/stores/*', '@/features/*', '@/ui/*', '@/platform/*', '@/app/*'],
              message: '领域层不能依赖上层模块。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/data/*', 'expo-sqlite', 'expo-sqlite/*', 'drizzle-orm', 'drizzle-orm/*'], message: '界面层请通过服务层读写数据。' },
            { group: ['expo-notifications', 'expo-file-system', 'expo-file-system/*', 'expo-sharing'], message: '界面层请通过 platform/ 调用系统能力。' },
          ],
        },
      ],
    },
  },
]);
