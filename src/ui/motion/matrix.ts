/**
 * SVG 图层的仿射矩阵（技术方案第 14 节）。
 * react-native-svg 只在 JS 侧把 transform 换算成原生的 matrix，Reanimated 在 UI 线程更新属性时不经过这一步，
 * 所以图层动画在 worklet 里直接算好 matrix 交给 AnimatedG。
 * 顺序：先绕 (originX, originY) 缩放、再旋转，最后平移。
 */

/** 与 SVG 的 matrix(a b c d e f) 相同：x' = a·x + c·y + e，y' = b·x + d·y + f */
export type SvgMatrix = [number, number, number, number, number, number];

export interface PartTransform {
  /** 角度，顺时针为正 */
  rotate?: number;
  scale?: number;
  /** 单独指定时覆盖 scale */
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
}

export function partMatrix(originX: number, originY: number, t: PartTransform): SvgMatrix {
  'worklet';
  const rad = ((t.rotate ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const sx = t.scaleX ?? t.scale ?? 1;
  const sy = t.scaleY ?? t.scale ?? 1;
  const a = cos * sx;
  const b = sin * sx;
  const c = -sin * sy;
  const d = cos * sy;
  const e = originX + (t.translateX ?? 0) - (a * originX + c * originY);
  const f = originY + (t.translateY ?? 0) - (b * originX + d * originY);
  return [a, b, c, d, e, f];
}
