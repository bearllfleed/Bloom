/**
 * 本地诊断日志（需求 S23、技术方案 E0-11）。
 * - 写入 App 文档目录 logs/app.log，超过 512KB 时轮转为 app.1.log，总量约 1MB；
 * - 只记录技术信息（模块、事件、错误堆栈），禁止写入项目名、心情等用户内容；
 * - 不上传任何地方，用户在"关于"页手动导出。
 */
import { Directory, File, Paths } from 'expo-file-system';

import { clock } from './clock';

type Level = 'info' | 'warn' | 'error';

const MAX_BYTES = 512 * 1024;
const logDir = new Directory(Paths.document, 'logs');
const current = new File(logDir, 'app.log');
const previous = new File(logDir, 'app.1.log');

function ensureDir() {
  if (!logDir.exists) logDir.create({ intermediates: true });
}

function rotateIfNeeded() {
  if (current.exists && current.size > MAX_BYTES) {
    if (previous.exists) previous.delete();
    current.move(previous);
  }
}

function serialize(detail: unknown): string {
  if (detail === undefined) return '';
  if (detail instanceof Error) return ` ${detail.name}: ${detail.message}\n${detail.stack ?? ''}`;
  try {
    return ` ${JSON.stringify(detail)}`;
  } catch {
    return ' [无法序列化]';
  }
}

function write(level: Level, scope: string, message: string, detail?: unknown) {
  const line = `${new Date(clock.now()).toISOString()} ${level.toUpperCase()} [${scope}] ${message}${serialize(detail)}\n`;
  if (__DEV__) console[level === 'info' ? 'log' : level](line.trimEnd());
  try {
    ensureDir();
    rotateIfNeeded();
    if (!current.exists) current.create();
    current.writeSync(line, { append: true });
  } catch {
    // 日志写入失败不能影响业务流程
  }
}

/** 按模块创建日志器，如 createLogger('db') */
export function createLogger(scope: string) {
  return {
    info: (message: string, detail?: unknown) => write('info', scope, message, detail),
    warn: (message: string, detail?: unknown) => write('warn', scope, message, detail),
    error: (message: string, detail?: unknown) => write('error', scope, message, detail),
  };
}

/** 读取全部日志（旧的在前） */
export function readAllLogs(): string {
  const parts: string[] = [];
  if (previous.exists) parts.push(previous.textSync());
  if (current.exists) parts.push(current.textSync());
  return parts.join('');
}
