/**
 * 国产系统的后台运行引导。识别品牌，给出三步说明；跳转失败时打开本 App 的系统设置。
 */
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';

export interface OemGuide {
  id: string;
  brand: string;
  steps: readonly string[];
}

const GUIDES: readonly OemGuide[] = [
  {
    id: 'xiaomi',
    brand: '小米',
    steps: ['设置 → 应用设置 → 应用管理 → Bloom', '省电策略 → 无限制', '自启动 → 打开'],
  },
  {
    id: 'huawei',
    brand: '华为',
    steps: ['设置 → 应用和服务 → 应用管理 → Bloom', '耗电详情 → 启动管理 → 手动管理', '允许自启动、关联启动、后台活动'],
  },
  {
    id: 'honor',
    brand: '荣耀',
    steps: ['设置 → 应用 → 应用管理 → Bloom', '耗电详情 → 启动管理 → 手动管理', '允许自启动和后台活动'],
  },
  {
    id: 'oppo',
    brand: 'OPPO',
    steps: ['设置 → 应用 → 应用管理 → Bloom', '耗电管理 → 允许完全后台行为', '自启动 → 打开'],
  },
  {
    id: 'vivo',
    brand: 'vivo',
    steps: ['设置 → 应用与权限 → 应用管理 → Bloom', '电池 → 后台耗电管理 → 允许高耗电', '权限 → 自启动 → 打开'],
  },
  {
    id: 'samsung',
    brand: '三星',
    steps: ['设置 → 应用程序 → Bloom', '电池 → 不受限制', '从休眠应用列表里移出 Bloom'],
  },
];

export function oemGuide(): OemGuide | null {
  const blob = `${Device.brand ?? ''} ${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.toLowerCase();
  if (blob.includes('xiaomi') || blob.includes('redmi') || blob.includes('小米')) return GUIDES[0];
  if (blob.includes('honor') || blob.includes('荣耀')) return GUIDES[2];
  if (blob.includes('huawei') || blob.includes('华为')) return GUIDES[1];
  if (blob.includes('oppo') || blob.includes('oneplus') || blob.includes('realme')) return GUIDES[3];
  if (blob.includes('vivo') || blob.includes('iqoo')) return GUIDES[4];
  if (blob.includes('samsung') || blob.includes('三星')) return GUIDES[5];
  return null;
}

export async function openAppSettings(): Promise<void> {
  await Linking.openSettings();
}
