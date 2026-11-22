/**
 * 此文件由 scripts/svg-build.ts 根据 assets/svg 生成，请勿手改。
 */
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export interface UiIconProps {
  size?: number;
  /** 描边颜色，通常取当前文字色 */
  color: string;
  /** 选中态填充色，默认使用图标自带的糖果色 */
  accent?: string;
  /** 是否显示选中态填充块 */
  active?: boolean;
}

function Alert({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 7.8v5" />
      <Circle cx="12" cy="16" r="1" fill={color} stroke="none" />
    </Svg>
  );
}

function Back({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  );
}

function Battery({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="3.5" y="7.5" width="15" height="9" rx="2.5" />
      <Path d="M21 10.5v3m-14-3v3m3-3v3" />
    </Svg>
  );
}

function Bell({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.8h-15z" fill={accent ?? '#FFC7DB'} stroke="none" /> : null}
      <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.8h-15z" />
      <Path d="M10 20.5a2 2 0 0 0 4 0" />
    </Svg>
  );
}

function Calendar({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="4" y="5.5" width="16" height="14.5" rx="3.5" />
      <Path d="M8.5 3.5v4m7-4v4M4 10.5h16" />
    </Svg>
  );
}

function Camera({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <Circle cx="12" cy="12.5" r="3.4" />
    </Svg>
  );
}

function Check({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 12.5 9.5 17 19 7.5" />
    </Svg>
  );
}

function ChevronDown({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m7 10 5 5 5-5" />
    </Svg>
  );
}

function ChevronLeft({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m14 7-5 5 5 5" />
    </Svg>
  );
}

function ChevronRight({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m10 7 5 5-5 5" />
    </Svg>
  );
}

function ChevronUp({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m7 14 5-5 5 5" />
    </Svg>
  );
}

function Close({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m6.5 6.5 11 11m0-11-11 11" />
    </Svg>
  );
}

function Cloud({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path
          d="M7.5 18.5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.6 1.15 3.4 3.4 0 0 1-.5 6.8z"
          fill={accent ?? '#C6A2FF'}
          stroke="none"
        />
      ) : null}
      <Path d="M7.5 18.5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.6 1.15 3.4 3.4 0 0 1-.5 6.8z" />
    </Svg>
  );
}

function Dice({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Rect x="4" y="4" width="16" height="16" rx="4.5" fill={accent ?? '#FFC7DB'} stroke="none" /> : null}
      <Rect x="4" y="4" width="16" height="16" rx="4.5" />
      <Circle cx="8.8" cy="8.8" r="1.2" fill={color} stroke="none" />
      <Circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
      <Circle cx="15.2" cy="15.2" r="1.2" fill={color} stroke="none" />
    </Svg>
  );
}

function DragHandle({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="9" cy="7" r="1.3" fill={color} stroke="none" />
      <Circle cx="15" cy="7" r="1.3" fill={color} stroke="none" />
      <Circle cx="9" cy="12" r="1.3" fill={color} stroke="none" />
      <Circle cx="15" cy="12" r="1.3" fill={color} stroke="none" />
      <Circle cx="9" cy="17" r="1.3" fill={color} stroke="none" />
      <Circle cx="15" cy="17" r="1.3" fill={color} stroke="none" />
    </Svg>
  );
}

function Edit({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m4.5 19.5 1-4.4L15.6 5a2.1 2.1 0 0 1 3 0l.4.4a2.1 2.1 0 0 1 0 3L8.9 18.5z" />
      <Path d="m13.6 7 3.4 3.4" />
    </Svg>
  );
}

function Export({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4.5 12.5v5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
      <Path d="M12 15V4M8 8l4-4 4 4" />
    </Svg>
  );
}

function File({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5" />
      <Path d="M13 3.5v5h5" />
    </Svg>
  );
}

function Flame({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path
          d="M12 20.5c-3.6 0-6-2.4-6-5.6 0-3.4 3-5.2 3.6-9.4 2.4 1.4 3.4 3.6 3.2 5.6 1-.6 1.8-1.6 2-2.8 2 1.6 3.2 3.8 3.2 6.6 0 3.2-2.4 5.6-6 5.6"
          fill={accent ?? '#FFB088'}
          stroke="none"
        />
      ) : null}
      <Path d="M12 20.5c-3.6 0-6-2.4-6-5.6 0-3.4 3-5.2 3.6-9.4 2.4 1.4 3.4 3.6 3.2 5.6 1-.6 1.8-1.6 2-2.8 2 1.6 3.2 3.8 3.2 6.6 0 3.2-2.4 5.6-6 5.6" />
    </Svg>
  );
}

function Graduation({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Path d="M2.5 9.5 12 5l9.5 4.5L12 14z" fill={accent ?? '#FFD66B'} stroke="none" /> : null}
      <Path d="M2.5 9.5 12 5l9.5 4.5L12 14z" />
      <Path d="M6.5 11.5V16c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4v-4.5m4-2v5" />
    </Svg>
  );
}

function History({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 8v4.2l2.6 1.6" />
    </Svg>
  );
}

function Hourglass({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M7 4h10M7 20h10" />
      <Path d="M8 4c0 4 8 4 8 8s-8 4-8 8m8-16c0 4-8 4-8 8s8 4 8 8" />
    </Svg>
  );
}

function Import({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4.5 12.5v5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
      <Path d="M12 4v11m-4-4 4 4 4-4" />
    </Svg>
  );
}

function Lock({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="5" y="10.5" width="14" height="10" rx="3" />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <Path d="M12 14.5v2" />
    </Svg>
  );
}

function Minus({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 12h14" />
    </Svg>
  );
}

function Moon({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path d="M19 14.2A7.5 7.5 0 1 1 9.8 5a6 6 0 0 0 9.2 9.2" fill={accent ?? '#C6A2FF'} stroke="none" />
      ) : null}
      <Path d="M19 14.2A7.5 7.5 0 1 1 9.8 5a6 6 0 0 0 9.2 9.2" />
    </Svg>
  );
}

function More({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="6" cy="12" r="1.5" fill={color} stroke="none" />
      <Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <Circle cx="18" cy="12" r="1.5" fill={color} stroke="none" />
    </Svg>
  );
}

function Note({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M6 4h9l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6 4" />
      <Path d="M14.5 4v4.5H19M8.5 12h7m-7 3.5h5" />
    </Svg>
  );
}

function Photo({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="3.5" y="5" width="17" height="14" rx="3" />
      <Circle cx="9" cy="10" r="1.6" />
      <Path d="m4 17 4.5-4.5L12 16l2.5-2.5L20 19" />
    </Svg>
  );
}

function Plus({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 5v14m-7-7h14" />
    </Svg>
  );
}

function Repeat({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M17 4.5 19.5 7 17 9.5" />
      <Path d="M5 11.5V10a3 3 0 0 1 3-3h11.5" />
      <Path d="M7 19.5 4.5 17 7 14.5" />
      <Path d="M19 12.5V14a3 3 0 0 1-3 3H4.5" />
    </Svg>
  );
}

function Search({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 3.8 3.8" />
    </Svg>
  );
}

function Settings({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="2.6" />
      <Path d="M12 3.5c1.4 0 1.6 2 2.6 2.4s2.6-.9 3.6.1-.3 2.6.1 3.6 2.4 1.2 2.4 2.6-2 1.6-2.4 2.6.9 2.6-.1 3.6-2.6-.3-3.6.1-1.2 2.4-2.6 2.4-1.6-2-2.6-2.4-2.6.9-3.6-.1.3-2.6-.1-3.6-2.2-1.4-2.2-2.8 2-1.6 2.4-2.6S5 6.8 6 5.8s2.6.3 3.6-.1 1-2.2 2.4-2.2" />
    </Svg>
  );
}

function Share({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m20.5 3.5-17 7 6.5 2.8 2.8 6.7z" />
      <Path d="M20.5 3.5 10 13.3" />
    </Svg>
  );
}

function Sort({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M8 5v14M5 8l3-3 3 3m5 11V5m-3 11 3 3 3-3" />
    </Svg>
  );
}

function Star({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path
          d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"
          fill={accent ?? '#FFD66B'}
          stroke="none"
        />
      ) : null}
      <Path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />
    </Svg>
  );
}

function Success({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="8" />
      <Path d="m8.3 12.3 2.6 2.6 4.8-5" />
    </Svg>
  );
}

function Sun({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Circle cx="12" cy="12" r="4" fill={accent ?? '#FFD66B'} stroke="none" /> : null}
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 3v2m0 14v2m-9-9h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m-12.8 0L7 17M17 7l1.4-1.4" />
    </Svg>
  );
}

function TabAchievements({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Circle cx="12" cy="15" r="5.5" fill={accent ?? '#FFC7DB'} stroke="none" /> : null}
      <Path d="m8 3 2.6 6.4M16 3l-2.6 6.4" />
      <Circle cx="12" cy="15" r="5.5" />
      <Path d="m12 12.6.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z" />
    </Svg>
  );
}

function TabMe({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Circle cx="12" cy="14.5" r="6" fill={accent ?? '#FFC7DB'} stroke="none" /> : null}
      <Path d="M9.4 9.2c-1-3-.9-5.6.2-5.9s1.9 2.4 2 5.4m3 .5c1-3 .9-5.6-.2-5.9s-1.9 2.4-2 5.4" />
      <Circle cx="12" cy="14.5" r="6" />
      <Path d="M10 14v.01m4-.01v.01" />
      <Path d="M11 16.6q1 .8 2 0" />
    </Svg>
  );
}

function TabProjects({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path d="M6.5 13.5h11l-1.3 6.2a1 1 0 0 1-1 .8H8.8a1 1 0 0 1-1-.8z" fill={accent ?? '#FFC7DB'} stroke="none" />
      ) : null}
      <Path d="M6.5 13.5h11l-1.3 6.2a1 1 0 0 1-1 .8H8.8a1 1 0 0 1-1-.8z" />
      <Path d="M5 13.5h14" />
      <Path d="M12 13.5V8" />
      <Path d="M12 10.5c-2.6 0-4.2-1.6-4.2-3.8 2.6 0 4.2 1.6 4.2 3.8" />
      <Path d="M12 9c0-2.3 1.6-4 4-4 0 2.3-1.7 4-4 4" />
    </Svg>
  );
}

function TabStats({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <Path d="M7.5 14h9l-1.1 6a1 1 0 0 1-1 .8H9.6a1 1 0 0 1-1-.8z" fill={accent ?? '#FFC7DB'} stroke="none" />
      ) : null}
      <Path d="M7.5 14h9l-1.1 6a1 1 0 0 1-1 .8H9.6a1 1 0 0 1-1-.8z" />
      <Path d="M9.5 14v-4m2.5 4V6.5m2.5 7.5V8.5" />
      <Circle cx="9.5" cy="8.6" r="1.4" />
      <Circle cx="12" cy="5" r="1.4" />
      <Circle cx="14.5" cy="7.1" r="1.4" />
    </Svg>
  );
}

function TabToday({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? <Rect x="3.5" y="5" width="17" height="15.5" rx="4" fill={accent ?? '#FFC7DB'} stroke="none" /> : null}
      <Rect x="3.5" y="5" width="17" height="15.5" rx="4" />
      <Path d="M8 3v4m8-4v4" />
      <Path d="m9.5 11.2 1.25 1L12 10.6l1.25 1.6 1.25-1v1.6a2.5 2.5 0 0 1-5 0z" />
      <Path d="M12 15.3v2" />
    </Svg>
  );
}

function TodayPin({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 21s-6-5.4-6-10.2a6 6 0 0 1 12 0c0 4.8-6 10.2-6 10.2" />
      <Circle cx="12" cy="10.6" r="2.2" />
    </Svg>
  );
}

function Trash({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 7h14m-9-3h4" />
      <Path d="m7 7 .8 11.6A1.6 1.6 0 0 0 9.4 20h5.2a1.6 1.6 0 0 0 1.6-1.4L17 7" />
      <Path d="M10 11v5.5m4-5.5v5.5" />
    </Svg>
  );
}

function Undo({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m9 6.5-4 4 4 4" />
      <Path d="M5 10.5h9.5a4.5 4.5 0 0 1 0 9H12" />
    </Svg>
  );
}

function ViewToggle({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="4" y="4.5" width="16" height="15" rx="3.5" />
      <Path d="M4 9.5h16m-10.5 0v10m5-10v10" />
    </Svg>
  );
}

export const uiIcons = {
  alert: Alert,
  back: Back,
  battery: Battery,
  bell: Bell,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  close: Close,
  cloud: Cloud,
  dice: Dice,
  'drag-handle': DragHandle,
  edit: Edit,
  export: Export,
  file: File,
  flame: Flame,
  graduation: Graduation,
  history: History,
  hourglass: Hourglass,
  import: Import,
  lock: Lock,
  minus: Minus,
  moon: Moon,
  more: More,
  note: Note,
  photo: Photo,
  plus: Plus,
  repeat: Repeat,
  search: Search,
  settings: Settings,
  share: Share,
  sort: Sort,
  star: Star,
  success: Success,
  sun: Sun,
  'tab-achievements': TabAchievements,
  'tab-me': TabMe,
  'tab-projects': TabProjects,
  'tab-stats': TabStats,
  'tab-today': TabToday,
  'today-pin': TodayPin,
  trash: Trash,
  undo: Undo,
  'view-toggle': ViewToggle,
} as const;

export type UiIconName = keyof typeof uiIcons;
