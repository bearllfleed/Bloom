/** 纯状态判断，供所有待机循环和聚焦/后台回归测试共用。 */
export function idleMotionAllowed(reduced: boolean, appActive: boolean, screenActive: boolean): boolean {
  return !reduced && appActive && screenActive;
}
