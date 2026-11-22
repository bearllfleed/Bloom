/**
 * 吉祥物"朵朵"（设计规范第 2 节）：奶白色小兔，左耳别一朵粉色小花，可可色 3px 墨线。
 * 6 种表情 + 招手 / 捧种子 / 躺云朵 / 睡觉 4 个姿势；8 种配饰用于"我的"页头像（附录 B 第 3 节）。
 * 深色模式下整体加奶油色外描边，避免墨线融进背景。
 */
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';

export type DuoduoMood = 'expectant' | 'happy' | 'cheer' | 'surprised' | 'sleepy' | 'puzzled';
export type DuoduoPose = 'none' | 'wave' | 'seed' | 'cloud' | 'sleep';
export type DuoduoAccessory =
  'plain' | 'strawHat' | 'headband' | 'headphones' | 'glasses' | 'flower' | 'scarf' | 'gradCap';

/** 8 个头像的顺序与中文名 */
export const DUODUO_AVATARS: readonly { id: DuoduoAccessory; name: string }[] = [
  { id: 'plain', name: '朵朵' },
  { id: 'strawHat', name: '戴草帽' },
  { id: 'headband', name: '戴发箍' },
  { id: 'headphones', name: '戴耳机' },
  { id: 'glasses', name: '戴眼镜' },
  { id: 'flower', name: '抱花' },
  { id: 'scarf', name: '戴围巾' },
  { id: 'gradCap', name: '戴学士帽' },
];

const INK = '#3F2A33';
const WHITE = '#FFFFFF';
const EAR = '#FFC7DB';
const BLUSH = '#FFA3C3';
const PETAL = '#FF8FB8';
const LEMON = '#FFD66B';
const MINT = '#7EDCC2';
const SODA = '#8FD0FF';
const CLOUD = '#E3F3FF';

const EAR_L = 'M43 50C34 30 35 9 45 7c10-2 12 20 10 42';
const EAR_R = 'M77 50C86 30 85 9 75 7c-10-2-12 20-10 42';

/** 身体轮廓（头、耳、身体、小爪），外描边层与正常层共用 */
function Silhouette({ fill, stroke, width }: { fill: string; stroke: string; width: number }) {
  return (
    <G fill={fill} stroke={stroke} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
      <Path d={EAR_L} />
      <Path d={EAR_R} />
      <Ellipse cx={60} cy={100} rx={26} ry={15} />
      <Ellipse cx={60} cy={70} rx={34} ry={29} />
      <Ellipse cx={49} cy={106} rx={7} ry={5} />
      <Ellipse cx={71} cy={106} rx={7} ry={5} />
    </G>
  );
}

function Eyes({ mood }: { mood: DuoduoMood }) {
  const dot = (cx: number, r = 3.6) => (
    <G key={cx}>
      <Circle cx={cx} cy={68} r={r} fill={INK} />
      <Circle cx={cx + 1.2} cy={66.6} r={r / 3} fill={WHITE} />
    </G>
  );
  const arc = (x: number, up: boolean) => (
    <Path
      key={x}
      d={up ? `M${x} 70q5-6 10 0` : `M${x} 68q5 4 10 0`}
      stroke={INK}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  );
  switch (mood) {
    case 'happy':
      return <>{[arc(42, true), arc(68, true)]}</>;
    case 'sleepy':
      return <>{[arc(42, false), arc(68, false)]}</>;
    case 'surprised':
      return <>{[dot(47, 4.6), dot(73, 4.6)]}</>;
    case 'cheer':
      return (
        <>
          {dot(47)}
          {dot(73)}
          <Path d="M41 58l9 3M79 58l-9 3" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </>
      );
    case 'puzzled':
      return (
        <>
          {dot(47)}
          {arc(68, true)}
          <Path d="M89 50c3 4 3 7 0 8-3-1-3-4 0-8z" fill={SODA} stroke={INK} strokeWidth={1.6} />
        </>
      );
    default:
      return <>{[dot(47), dot(73)]}</>;
  }
}

function Mouth({ mood }: { mood: DuoduoMood }) {
  if (mood === 'happy' || mood === 'cheer') {
    return <Path d="M55 76q5 8 10 0z" fill={PETAL} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />;
  }
  if (mood === 'surprised') return <Ellipse cx={60} cy={79} rx={3} ry={3.8} fill={INK} />;
  if (mood === 'sleepy') return <Circle cx={60} cy={78} r={2} fill={INK} />;
  if (mood === 'puzzled')
    return <Path d="M55 78q2.5-2 5 0t5 0" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />;
  return <Path d="M56 77q4 4 8 0" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />;
}

function EarFlower() {
  const petals = [-90, -18, 54, 126, 198].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [39 + 4.4 * Math.cos(r), 14 + 4.4 * Math.sin(r)];
  });
  return (
    <G stroke={INK} strokeWidth={1.6}>
      {petals.map(([x, y]) => (
        <Circle key={`${x}`} cx={x} cy={y} r={3.6} fill={PETAL} />
      ))}
      <Circle cx={39} cy={14} r={2.4} fill={LEMON} />
    </G>
  );
}

function Pose({ pose }: { pose: DuoduoPose }) {
  if (pose === 'wave') {
    return (
      <G stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <Ellipse cx={94} cy={78} rx={6.5} ry={8.5} fill={WHITE} transform="rotate(-25 94 78)" />
        <Path d="M103 64l4-3M105 72l5 0" strokeWidth={2.4} fill="none" />
      </G>
    );
  }
  if (pose === 'seed') {
    return (
      <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        <Path d="M60 100v-5" fill="none" />
        <Path d="M60 96c-4-1-6-4-6-7 4 0 6 3 6 7z" fill={MINT} />
        <Path d="M60 100c-5 0-7 4-6 8 1 3 11 3 12 0 1-4-1-8-6-8z" fill="#B99273" />
      </G>
    );
  }
  if (pose === 'sleep') {
    // 头顶冒出的 Z 字（线条画出，不用文字）
    return (
      <G stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M88 30h8l-8 9h8" />
        <Path d="M100 14h6l-6 7h6" strokeWidth={2.2} />
      </G>
    );
  }
  return null;
}

/** 头像配饰 */
function Accessory({ kind }: { kind: DuoduoAccessory }) {
  switch (kind) {
    case 'strawHat':
      return (
        <G stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
          <Ellipse cx={60} cy={45} rx={41} ry={7} fill="#D8B79A" />
          <Path d="M37 45c0-12 10-19 23-19s23 7 23 19z" fill="#F6EDE4" />
          <Path d="M38 40h44" stroke="#FF8FB8" strokeWidth={4} />
        </G>
      );
    case 'headband':
      return (
        <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
          <Path d="M29 54c4-15 16-23 31-23s27 8 31 23" stroke="#FF8FB8" strokeWidth={5} fill="none" />
          <Path d="M74 33l-8-6v12zM74 33l8-6v12z" fill="#FFA3C3" />
          <Circle cx={74} cy={33} r={2.6} fill="#FFD66B" />
        </G>
      );
    case 'headphones':
      return (
        <G stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
          <Path d="M25 68c0-25 15-36 35-36s35 11 35 36" stroke="#5DAFEA" strokeWidth={5} fill="none" />
          <Ellipse cx={26} cy={70} rx={7} ry={11} fill="#8FD0FF" />
          <Ellipse cx={94} cy={70} rx={7} ry={11} fill="#8FD0FF" />
        </G>
      );
    case 'glasses':
      return (
        <G stroke={INK} strokeWidth={2.4} fill="none">
          <Circle cx={47} cy={68} r={9} fill="#FFFFFF" fillOpacity={0.35} />
          <Circle cx={73} cy={68} r={9} fill="#FFFFFF" fillOpacity={0.35} />
          <Path d="M56 67q4-3 8 0" strokeLinecap="round" />
        </G>
      );
    case 'flower':
      return (
        <G stroke={INK} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
          <Path d="M52 112l6-16M60 112v-18M68 112l-6-16" stroke="#4DBF9F" fill="none" />
          <Circle cx={56} cy={92} r={6} fill="#FF8FB8" />
          <Circle cx={66} cy={90} r={6} fill="#FFD66B" />
          <Circle cx={61} cy={100} r={6} fill="#C6A2FF" />
          <Path d="M50 104h20l-3 9H53z" fill="#FFFFFF" />
        </G>
      );
    case 'scarf':
      return (
        <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
          <Path d="M32 88c12 7 44 7 56 0l-1 8c-13 7-41 7-54 0z" fill="#FF8A8A" />
          <Path d="M70 94l4 15 8-2-4-15z" fill="#FF8A8A" />
          <Path d="M73 102l7-2" stroke="#FFFFFF" strokeWidth={2} />
        </G>
      );
    case 'gradCap':
      return (
        <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
          <Path d="M42 40v8c10 5 26 5 36 0v-8" fill="#3F2A33" />
          <Path d="M28 36l32-13 32 13-32 13z" fill="#3F2A33" />
          <Path d="M88 38v12" stroke="#FFD66B" strokeWidth={2.6} />
          <Circle cx={88} cy={52} r={3} fill="#FFD66B" />
        </G>
      );
    default:
      return null;
  }
}

function CloudBed() {
  return (
    <Path
      d="M18 112c-8 0-12-7-8-13 2-4 7-5 10-4 1-7 9-11 16-8 4-6 14-7 19-1 6-4 16-2 18 5 6-3 14 0 15 7 7 0 11 7 8 12-2 3-5 4-8 4z"
      fill={CLOUD}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}

export interface DuoduoProps {
  size?: number;
  mood?: DuoduoMood;
  pose?: DuoduoPose;
  accessory?: DuoduoAccessory;
  /** head：只取头部，用于头像 */
  crop?: 'full' | 'head';
  /** 空状态里的轻微呼吸（幅度 2%，设计规范 9.2 允许的少数循环之一） */
  breathing?: boolean;
}

export function Duoduo({
  size = 140,
  mood = 'expectant',
  pose = 'none',
  accessory = 'plain',
  crop = 'full',
  breathing = false,
}: DuoduoProps) {
  const { scheme } = useTheme();
  const reduced = useMotionReduced();
  const breath = useSharedValue(1);

  useEffect(() => {
    if (!breathing || reduced) {
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 1600 }), withTiming(1, { duration: 1600 })),
      -1,
      false,
    );
  }, [breath, breathing, reduced]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: breath.value }], transformOrigin: 'bottom' }));
  const outlineColor = scheme === 'dark' ? 'rgba(255,248,243,0.9)' : null;

  return (
    <Animated.View
      style={[{ width: size, height: size }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox={crop === 'head' ? '12 6 96 96' : '0 0 120 120'}>
        {pose === 'cloud' ? <CloudBed /> : null}
        {outlineColor ? <Silhouette fill={outlineColor} stroke={outlineColor} width={9} /> : null}
        <Silhouette fill={WHITE} stroke={INK} width={3} />
        <Path d="M45 43c-4-12-4-24 0-29 4-1 6 12 5 29z" fill={EAR} />
        <Path d="M75 43c4-12 4-24 0-29-4-1-6 12-5 29z" fill={EAR} />
        <EarFlower />
        <Ellipse cx={39} cy={79} rx={6} ry={3.6} fill={BLUSH} opacity={0.6} />
        <Ellipse cx={81} cy={79} rx={6} ry={3.6} fill={BLUSH} opacity={0.6} />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <Accessory kind={accessory} />
        <Pose pose={pose} />
      </Svg>
    </Animated.View>
  );
}
