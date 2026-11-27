/**
 * 五种心情表情（设计规范 7.5、动效 M30）：
 * 超开心（星星眼）、开心（弯眼笑）、平静（眯眼微笑）、有点累（下垂眼 + 汗滴）、难过（泪滴），
 * 脸底依次为柠檬、莓果、薄荷、汽水、葡萄色。
 * - size < 32 只画静态表情（列表、记录行的小图标不循环）；
 * - 选中时放大到 1.15 并上跳 4px，其余变 60% 透明（M30 由 MoodFacePicker 负责）；
 * - 待机时脸轻轻晃（≤ 2px），页面不在前台或减弱动态时停止。
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

import type { MoodFace } from '@/domain/mood';
import { useIdleMotion } from '@/ui/motion/idle';
const INK = '#3F2A33';

interface FaceColors {
  /** 脸底 */
  base: string;
  /** 脸底深一档（下缘阴影） */
  deep: string;
  /** 五官与装饰的主色 */
  feature: string;
}

/** 与设计规范 7.5 一一对应 */
const FACE_COLORS: Record<MoodFace, FaceColors> = {
  ecstatic: { base: '#FFD66B', deep: '#EBB53B', feature: '#B8740A' },
  happy: { base: '#FF8FB8', deep: '#E8669A', feature: '#C93D72' },
  calm: { base: '#7EDCC2', deep: '#4DBF9F', feature: '#1F8A6C' },
  tired: { base: '#8FD0FF', deep: '#5DAFEA', feature: '#2F6FA8' },
  sad: { base: '#C6A2FF', deep: '#A27BEA', feature: '#6B44B8' },
};

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return <Path d={`M${points.join('L')}Z`} fill={fill} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
}

/** 只看表情本身，供 52pt 选择器、56pt 详情、16pt 迷你标记共用 */
function FaceArt({ face }: { face: MoodFace }) {
  const c = FACE_COLORS[face];
  const eye = (cx: number) =>
    face === 'ecstatic' ? (
      <Star cx={cx} cy={54} r={9} fill="#FFFFFF" />
    ) : face === 'happy' ? (
      <Path
        d={`M${cx - 8} 56 Q ${cx} 46 ${cx + 8} 56`}
        stroke={INK}
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
      />
    ) : face === 'calm' ? (
      <Path
        d={`M${cx - 8} 54 Q ${cx} 59 ${cx + 8} 54`}
        stroke={INK}
        strokeWidth={3.2}
        fill="none"
        strokeLinecap="round"
      />
    ) : face === 'tired' ? (
      <G>
        <Path
          d={`M${cx - 9} 50 Q ${cx} 57 ${cx + 9} 52`}
          stroke={INK}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx - 8} 49 l-3-3 M${cx} 48 l-1-4 M${cx + 8} 50 l3-3`}
          stroke={INK}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>
    ) : (
      <G>
        <Path
          d={`M${cx - 9} 52 Q ${cx - 2} 58 ${cx + 4} 52`}
          stroke={INK}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx - 1} 57 q3 6 0 8 q-3 -2 0 -8z`}
          fill="#8FD0FF"
          stroke={INK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </G>
    );
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      <G strokeLinejoin="round">
        <Circle cx={50} cy={52} r={40} fill={c.base} stroke={INK} strokeWidth={3} />
        <Path d="M16 64c2 16 16 27 34 27s32-11 34-27c-4 12-17 19-34 19s-30-7-34-19z" fill={c.deep} opacity={0.35} />
        <Ellipse cx={30} cy={70} rx={7} ry={4.4} fill="#FFA3C3" opacity={0.55} />
        <Ellipse cx={70} cy={70} rx={7} ry={4.4} fill="#FFA3C3" opacity={0.55} />
        {eye(34)}
        {eye(66)}
        {face === 'ecstatic' ? (
          <Path d="M41 72 Q 50 84 59 72 Z" fill={INK} strokeLinecap="round" />
        ) : face === 'happy' ? (
          <Path d="M42 70 Q 50 80 58 70" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        ) : face === 'calm' ? (
          <Path d="M45 74 Q 50 77 55 74" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        ) : face === 'tired' ? (
          <G>
            <Path d="M42 75 q4 -4 8 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            {/* 汗滴 */}
            <Path d="M80 34 q5 8 0 11 q-5 -3 0 -11z" fill="#8FD0FF" stroke={INK} strokeWidth={1.6} />
          </G>
        ) : (
          <Path d="M42 76 Q 50 70 58 76" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        )}
      </G>
    </Svg>
  );
}

export interface MoodFaceIconProps {
  face: MoodFace;
  size?: number;
  /** 待机轻晃；只在大尺寸（≥ 32）且页面前台时播放 */
  idle?: boolean;
}

/** 单个表情 */
export function MoodFaceIcon({ face, size = 52, idle = false }: MoodFaceIconProps) {
  const canIdle = useIdleMotion() && idle && size >= 32;
  const wobble = useSharedValue(0);
  useEffect(() => {
    if (!canIdle) {
      wobble.value = 0;
      return;
    }
    wobble.value = withRepeat(
      withSequence(withTiming(1, { duration: 1900 }), withTiming(-1, { duration: 1900 })),
      -1,
      true,
    );
  }, [canIdle, wobble]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: wobble.value * 1.2 }, { rotate: `${wobble.value * 2}deg` }],
  }));
  return (
    <Animated.View
      style={[{ width: size, height: size }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <FaceArt face={face} />
    </Animated.View>
  );
}
