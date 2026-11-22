/**
 * 设计变量出口。组件请从这里取值，不要直接引用 palette。
 */
export { colorSchemes, heatColors, type ColorScheme, type SemanticColors } from './colors';
export {
  projectColors,
  PROJECT_COLOR_IDS,
  ON_PROJECT_COLOR,
  type ProjectColorId,
  type ProjectColor,
} from './projectColors';
export * from './layout';
export * from './typography';
export * from './motion';
