/**
 * App 版本信息。原生版本号取不到时（开发服务器下）退回到配置里的版本。
 */
import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const appVersion: string = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '0.0.0';
export const appBuild: string = Application.nativeBuildVersion ?? '1';
