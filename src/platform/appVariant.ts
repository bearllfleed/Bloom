/**
 * 构建类型：开发版 / 内测版 / 正式版（技术方案 15.3）。
 * 由构建配置注入 EXPO_PUBLIC_APP_VARIANT；本地开发时默认为开发版。
 */
export type AppVariant = 'development' | 'preview' | 'production';

const raw = process.env.EXPO_PUBLIC_APP_VARIANT;

export const appVariant: AppVariant = raw === 'preview' || raw === 'production' ? raw : 'development';

/** 只有开发版提供组件陈列、徽章陈列、时间旅行等开发工具 */
export const isDevToolsEnabled = appVariant === 'development';
