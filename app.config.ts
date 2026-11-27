/**
 * 应用配置（技术方案 3、15）。构建类型由环境变量 EXPO_PUBLIC_APP_VARIANT 决定：
 * - development：开发版，包名带 .dev 后缀，含组件陈列、时间旅行等开发工具；
 * - preview：内测版，包名带 .preview 后缀；
 * - production：正式版。
 * 三种构建包名不同，可以同时装在一台手机上互不覆盖。
 * 包名中的 com.bloom.habit 为占位，开通 Apple 开发者账号后替换成自己的反向域名，之后不要再改。
 */
import type { ConfigContext, ExpoConfig } from 'expo/config';

type Variant = 'development' | 'preview' | 'production';

const variant: Variant = (process.env.EXPO_PUBLIC_APP_VARIANT as Variant | undefined) ?? 'development';
const BASE_ID = 'com.bloom.habit';
const suffix = variant === 'production' ? '' : `.${variant === 'development' ? 'dev' : 'preview'}`;
const displayName = variant === 'production' ? 'Bloom' : variant === 'preview' ? 'Bloom 内测' : 'Bloom 开发';

const PAPER = '#FFF8F3';
const NIGHT = '#211A1E';
const enableRemoteNotifications = process.env.BLOOM_LOCAL_IOS_PERSONAL_TEAM !== '1';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: displayName,
  slug: 'bloom',
  scheme: 'bloom',
  version: '0.2.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  backgroundColor: PAPER,
  ios: {
    supportsTablet: false,
    bundleIdentifier: BASE_ID + suffix,
    buildNumber: '2',
    appleTeamId: '9849JR8DZU',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDocumentTypes: [
        {
          CFBundleTypeName: 'Bloom Backup',
          CFBundleTypeRole: 'Editor',
          LSHandlerRank: 'Owner',
          LSItemContentTypes: ['com.bloom.habit.backup'],
        },
      ],
      UTExportedTypeDeclarations: [
        {
          UTTypeIdentifier: 'com.bloom.habit.backup',
          UTTypeDescription: 'Bloom backup',
          UTTypeConformsTo: ['public.data', 'public.archive'],
          UTTypeTagSpecification: {
            'public.filename-extension': ['bloom'],
            'public.mime-type': 'application/x-bloom-backup',
          },
        },
      ],
    },
  },
  android: {
    package: BASE_ID + suffix,
    versionCode: 2,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: false,
        data: [
          { scheme: 'content', mimeType: 'application/x-bloom-backup' },
          { scheme: 'file', mimeType: 'application/x-bloom-backup' },
          { scheme: 'content', pathPattern: '.*\\.bloom' },
          { scheme: 'file', pathPattern: '.*\\.bloom' },
        ],
        category: ['DEFAULT', 'BROWSABLE'],
      },
    ],
    adaptiveIcon: {
      backgroundColor: '#FF8FB8',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-font',
    'expo-sharing',
    [
      'expo-notifications',
      {
        color: '#FF8FB8',
        enableRemoteNotifications,
      },
    ],
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: PAPER,
        dark: { image: './assets/images/splash-icon-dark.png', backgroundColor: NIGHT },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: '允许 Bloom 访问相册，给心情配上照片。',
        cameraPermission: '允许 Bloom 使用相机，拍一张照片记下此刻的心情。',
        microphonePermission: false,
      },
    ],
    ['expo-file-system', { enableFileSharing: true, supportsOpeningDocumentsInPlace: true }],
    [
      'expo-build-properties',
      {
        ios: { deploymentTarget: '17.0' },
        android: { minSdkVersion: 26 },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appVariant: variant,
  },
});
