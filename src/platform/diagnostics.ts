/**
 * 导出诊断日志：把设备信息与本地日志打包成一个文本文件，交给系统分享（关于页使用）。
 * 文件中只有技术信息，不包含任何项目名、记录或心情内容。
 */
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { appVariant } from './appVariant';
import { clock } from './clock';
import { readAllLogs } from './logger';

export function buildDiagnosticsText(): string {
  const header = [
    'Bloom 诊断信息',
    `导出时间：${new Date(clock.now()).toISOString()}${clock.isSimulated() ? '（时间旅行中）' : ''}`,
    `App 版本：${Application.nativeApplicationVersion ?? '未知'}（${Application.nativeBuildVersion ?? '未知'}）`,
    `构建类型：${appVariant}`,
    `系统：${Platform.OS} ${Device.osVersion ?? ''}`,
    `机型：${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`,
    '',
    '---- 日志 ----',
  ].join('\n');
  return `${header}\n${readAllLogs()}`;
}

/** 生成诊断文件并打开系统分享 */
export async function shareDiagnostics(): Promise<void> {
  const stamp = new Date(clock.now()).toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const file = new File(Paths.cache, `Bloom诊断_${stamp}.txt`);
  if (file.exists) file.delete();
  file.create();
  file.writeSync(buildDiagnosticsText());
  await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: '导出诊断日志' });
}
