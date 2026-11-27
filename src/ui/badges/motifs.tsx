/**
 * 72 枚徽章的可辨识图案（设计规范 7.3）。
 * 每枚由"共同底形 + 专属部件"组成：共同底形保证系列统一，专属部件和签名让每一枚都能单独辨认。
 * 所有坐标都在 200×200 画板内，图案区域约 50–146；禁止文本、emoji 和位图。
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { BadgeTierColors } from './tokens';
import { BADGE_PALETTE as C } from './tokens';

export interface BadgeMotifProps {
  /** 图案主色，跟随等级 */
  color: string;
  /** 图案深色，用于细部和阴影 */
  deep: string;
  /** 墨线色；未获得时与 primary 相同，形成剪影 */
  ink: string;
  /** 内芯浅色，用于花瓣和纸张 */
  soft: string;
}

export interface BadgeMotifLayerProps {
  motif: string;
  colors: BadgeTierColors;
  /** 未获得：图案与底座同色，形成可辨认的剪影 */
  silhouette?: boolean;
}

const W = 2.6;

function inkStroke(ink: string, width = W) {
  return { stroke: ink, strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
}

function Petals({
  color,
  ink,
  cx = 100,
  cy = 100,
  r = 15,
  count = 5,
}: Pick<BadgeMotifProps, 'color' | 'ink'> & { cx?: number; cy?: number; r?: number; count?: number }) {
  return (
    <G {...inkStroke(ink, 2)}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        return <Circle key={i} cx={cx + Math.cos(angle) * r} cy={cy + Math.sin(angle) * r} r={r * 0.62} fill={color} />;
      })}
      <Circle cx={cx} cy={cy} r={r * 0.4} fill={C.lemon} />
    </G>
  );
}

function Stem({ ink, color, d }: Pick<BadgeMotifProps, 'ink' | 'color'> & { d: string }) {
  return (
    <G fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} stroke={ink} strokeWidth={2.4} />
      <Path d={d} stroke={color} strokeWidth={1.2} />
    </G>
  );
}

/** 每枚徽章的专属图形；key 与领域层稳定 key 一致 */
export const BADGE_MOTIF_COMPONENTS: Record<string, (props: BadgeMotifProps) => ReactNode> = {
  first_project: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Ellipse cx={100} cy={132} rx={22} ry={8} fill={C.milktea} />
      <Path d="M100 126C96 112 96 100 98 88C104 96 106 108 104 124Z" fill={color} />
      <Circle cx={99} cy={78} r={8} fill={color} />
      <Path d="M94 64C98 58 104 58 106 64C103 68 97 68 94 64Z" fill={C.mint} />
      <Path d="M84 128C91 122 96 122 100 128" fill="none" />
      <Path d="M116 128C109 122 104 122 100 128" fill="none" />
    </G>
  ),
  first_checkin: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 132C102 120 102 108 100 98" fill="none" strokeWidth={2.4} />
      <Path d="M100 102C82 96 82 76 91 66C101 70 107 84 103 100Z" fill={C.mint} />
      <Path d="M100 102C118 98 124 80 116 70C106 72 98 84 97 100Z" fill={color} />
      <Circle cx={100} cy={94} r={7} fill={C.lemon} />
    </G>
  ),
  first_note: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={58} y={70} width={52} height={38} rx={5} fill={soft} transform="rotate(-8 84 89)" />
      <Path d="M64 86L92 82M64 94L88 90M64 102L84 98" stroke={ink} strokeWidth={1.7} />
      <Path d="M104 78L126 134L121 128L116 136L110 112L104 120Z" fill={color} />
      <Path d="M104 78L116 136" stroke={ink} strokeWidth={1.6} />
      <Circle cx={120} cy={132} r={6} fill={C.berry} />
    </G>
  ),
  first_reminder: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={104} r={24} fill={soft} />
      <Circle cx={100} cy={104} r={20} fill={C.white} />
      <Path d="M100 92V104L109 112" fill="none" />
      <Path d="M80 84L72 76M120 84L128 76" fill="none" />
      <Path d="M85 132L80 144M115 132L120 144" fill="none" />
      <Path d="M89 74L97 74C95 84 89 84 89 74Z" fill={color} />
      <Path d="M111 74L103 74C105 84 111 84 111 74Z" fill={color} />
      <Circle cx={100} cy={71} r={5} fill={color} />
    </G>
  ),
  first_mood: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={57} y={80} width={86} height={52} rx={7} fill={soft} />
      <Path d="M57 85L100 112L143 85" fill="none" />
      <Path d="M100 68C88 54 67 63 75 78C81 88 94 96 100 102C106 96 119 88 125 78C133 63 112 54 100 68Z" fill={color} />
      <Circle cx={122} cy={126} r={6} fill={C.berry} />
    </G>
  ),
  first_photo: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={56} y={68} width={72} height={62} rx={5} fill={C.white} transform="rotate(-6 92 99)" />
      <Rect x={70} y={80} width={74} height={56} rx={5} fill={soft} transform="rotate(5 107 108)" />
      <Rect x={78} y={87} width={58} height={36} rx={3} fill={C.soda} />
      <Circle cx={92} cy={99} r={5} fill={C.lemon} />
      <Path d="M80 118L101 103L113 113L124 106L134 118Z" fill={color} />
      <Path d="M73 72L89 70" stroke={C.white} strokeWidth={4} opacity={0.7} />
      <Circle cx={126} cy={72} r={4} fill={C.lemon} />
    </G>
  ),
  first_backup: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={86} width={76} height={44} rx={5} fill={soft} />
      <Rect x={62} y={74} width={76} height={18} rx={4} fill={color} />
      <Path d="M100 74V130M88 130V164M112 130V164" fill="none" />
      <Path d="M88 164L80 154M112 164L120 154" fill="none" />
      <Path
        d="M100 102C94 96 84 100 88 108C91 113 97 117 100 120C103 117 109 113 112 108C116 100 106 96 100 102Z"
        fill={C.berry}
      />
    </G>
  ),
  first_widget: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={88} width={76} height={52} rx={4} fill={soft} />
      <Rect x={74} y={74} width={52} height={42} rx={3} fill={C.soda} />
      <Path d="M98 116C98 98 106 82 118 74C120 94 114 108 100 116Z" fill={C.mint} />
      <Path d="M98 116C96 100 88 90 78 86C80 100 86 110 97 116Z" fill={color} />
      <Path d="M88 132H112" fill="none" />
      <Circle cx={100} cy={144} r={4} fill={C.lemon} />
    </G>
  ),
  streak_3: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M64 128C76 120 88 120 100 128C112 120 124 120 136 128" fill="none" />
      {[64, 86, 108].map((x) => (
        <G key={x}>
          <Circle cx={x + 14} cy={108} r={11} fill={color} />
          <Circle cx={x + 14} cy={108} r={4} fill={C.lemon} />
        </G>
      ))}
    </G>
  ),
  streak_5: ({ color, ink }) => (
    <G>
      <Stem ink={ink} color={color} d="M100 138C100 126 100 116 100 106" />
      <Petals color={color} ink={ink} cy={100} r={14} count={5} />
    </G>
  ),
  streak_7: ({ color, ink }) => (
    <G>
      <Stem ink={ink} color={color} d="M100 140C100 128 100 116 100 104" />
      <Petals color={color} ink={ink} cy={100} r={13} count={7} />
    </G>
  ),
  streak_10: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M76 124C70 106 74 92 84 82C90 76 100 76 106 82C116 92 120 106 114 124Z" fill={C.lemon} />
      <Rect x={76} y={62} width={48} height={16} fill={C.paper} />
      <Rect x={76} y={62} width={48} height={16} fill="none" />
      <Circle cx={86} cy={70} r={3} fill={C.berry} />
      <Rect x={82} y={84} width={7} height={34} rx={3.5} fill={color} />
      <Path d="M104 84H120V90H104Z" fill={color} />
      <Path d="M96 84H120V118H114V90H96Z" fill={color} />
      <Path d="M82 132C88 126 112 126 118 132" fill="none" />
    </G>
  ),
  streak_14: ({ color, ink }) => (
    <G>
      <Circle cx={100} cy={100} r={34} fill="none" stroke={C.mint} strokeWidth={7} />
      <Circle cx={100} cy={100} r={25} fill="none" stroke={color} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        return (
          <Circle
            key={i}
            cx={100 + Math.cos(a) * 43}
            cy={100 + Math.sin(a) * 43}
            r={5}
            fill={i % 2 ? C.lemon : C.berry}
            stroke={ink}
            strokeWidth={1.6}
          />
        );
      })}
    </G>
  ),
  streak_21: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 136C98 120 98 106 100 92" fill="none" />
      <Path d="M100 104C88 104 76 98 70 88C82 82 94 88 100 98Z" fill={C.mint} />
      <Path d="M100 100C112 98 124 90 128 80C116 76 104 82 100 94Z" fill={C.mint} />
      <Circle cx={82} cy={76} r={8} fill={color} />
      <Circle cx={100} cy={70} r={10} fill={color} />
      <Circle cx={118} cy={76} r={8} fill={color} />
      <Circle cx={72} cy={108} r={6} fill={C.berry} />
      <Circle cx={128} cy={106} r={6} fill={C.lemon} />
    </G>
  ),
  streak_30: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={84} r={24} fill={C.lemon} />
      <Circle cx={94} cy={80} r={20} fill={color} opacity={0.6} />
      <Path d="M72 140C78 120 88 110 100 110C112 110 122 120 128 140Z" fill={C.mint} />
      <Circle cx={88} cy={132} r={5} fill={C.berry} />
      <Circle cx={112} cy={132} r={5} fill={C.berry} />
      <Circle cx={100} cy={136} r={4} fill={C.lemon} />
      <Path d="M78 104C88 100 112 100 122 104" fill="none" stroke={C.lemon} strokeWidth={3} />
    </G>
  ),
  streak_60: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M78 136L116 112M118 136L82 112" fill="none" />
      <Circle cx={78} cy={96} r={8} fill={color} />
      <Circle cx={92} cy={88} r={8} fill={color} />
      <Circle cx={106} cy={84} r={9} fill={C.berry} />
      <Circle cx={120} cy={92} r={8} fill={color} />
      <Circle cx={80} cy={108} r={7} fill={C.berry} />
      <Path d="M78 136L74 148M118 136L122 148" fill="none" />
    </G>
  ),
  streak_90: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={100} r={36} fill={C.paper} />
      <Path d="M100 100C100 74 124 68 134 82C138 98 122 100 100 100Z" fill={C.mint} />
      <Path d="M100 100C100 126 76 132 66 118C62 102 78 100 100 100Z" fill={C.lemon} />
      <Path d="M100 100C126 100 132 124 118 134C102 138 100 122 100 100Z" fill={color} />
      <Path d="M100 100C74 100 68 76 82 66C98 62 100 78 100 100Z" fill={C.berry} />
      <Circle cx={100} cy={100} r={8} fill={C.white} />
    </G>
  ),
  week_2: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={68} y={64} width={60} height={68} rx={5} fill={soft} transform="rotate(-5 98 98)" />
      <Rect x={96} y={62} width={46} height={60} rx={4} fill={C.white} transform="rotate(6 119 92)" />
      <Path d="M104 82H134M104 94H130M104 106H126" stroke={ink} strokeWidth={1.6} />
      <Circle cx={82} cy={102} r={7} fill={color} />
    </G>
  ),
  week_4: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={58} y={65} width={84} height={70} rx={5} fill={soft} />
      <Path d="M58 82H142M58 104H142M58 126H142M92 65V135M120 65V135" stroke={ink} strokeWidth={1.5} fill="none" />
      {[74, 98, 126].map((y) => (
        <Path key={y} d={`M74 ${y}L78 ${y + 5}L86 ${y - 4}`} fill="none" stroke={color} strokeWidth={3} />
      ))}
      <Circle cx={80} cy={76} r={3} fill={C.berry} />
    </G>
  ),
  week_8: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={57} y={72} width={86} height={60} rx={5} fill={soft} />
      <Path d="M57 90H143" fill="none" />
      <Stem ink={ink} color={color} d="M100 128C100 118 100 110 100 102" />
      <Circle cx={100} cy={102} r={10} fill={color} />
      <Path d="M100 112C92 108 86 110 84 116C92 118 97 116 100 112Z" fill={C.mint} />
      <Circle cx={78} cy={92} r={3} fill={C.lemon} />
      <Circle cx={122} cy={100} r={3} fill={color} />
    </G>
  ),
  week_12: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={57} y={72} width={86} height={60} rx={5} fill={soft} />
      <Path d="M57 90H143" fill="none" />
      <Path d="M72 132C82 106 118 106 128 132C118 126 82 126 72 132Z" fill={C.soda} />
      <Path d="M76 130C86 112 114 112 124 130" fill="none" stroke={C.berry} strokeWidth={4} />
      <Circle cx={100} cy={122} r={6} fill={color} />
    </G>
  ),
  month_1: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Rect x={64} y={62} width={72} height={80} rx={5} fill={C.white} />
      <Circle cx={100} cy={98} r={20} fill={C.lemon} />
      <Circle cx={93} cy={91} r={18} fill={C.white} />
      <Path d="M76 122H124M76 130H116" stroke={ink} strokeWidth={1.4} />
      <Circle cx={126} cy={70} r={4} fill={color} />
    </G>
  ),
  month_3: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={64} width={76} height={74} rx={5} fill={soft} />
      <Path d="M62 84H138" fill="none" />
      {[80, 100, 120].map((x, i) => (
        <Path
          key={x}
          d={`M${x} 104L${x + 4} 112L${x + 12} 112L${x + 6} 118L${x + 8} 126L${x} 121L${x - 8} 126L${x - 6} 118L${x - 12} 112L${x - 4} 112Z`}
          fill={i === 1 ? C.lemon : color}
        />
      ))}
    </G>
  ),
  total_10: ({ color, ink }) => (
    <G>
      <Stem ink={ink} color={color} d="M84 140L100 112L116 140" />
      {[86, 100, 114].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={104 - i * 4} r={9} fill={i === 1 ? C.berry : color} />
          <Circle cx={x} cy={104 - i * 4} r={3} fill={C.lemon} />
        </G>
      ))}
      <Path d="M92 116L100 108L108 116" fill="none" stroke={C.mint} strokeWidth={4} />
    </G>
  ),
  total_30: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M74 136C82 108 118 108 126 136Z" fill={soft} />
      <Circle cx={88} cy={100} r={10} fill={color} />
      <Circle cx={104} cy={94} r={11} fill={C.berry} />
      <Circle cx={118} cy={104} r={9} fill={C.lemon} />
      <Path d="M100 136C98 146 96 152 92 160M100 136C104 146 108 152 112 158" fill="none" />
      <Path d="M92 160L86 152M112 158L118 150" fill="none" />
    </G>
  ),
  total_100: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M62 100H138C138 132 122 144 100 144C78 144 62 132 62 100Z" fill={soft} />
      <Path d="M62 100C72 90 86 96 100 92C114 96 128 90 138 100" fill="none" />
      <Circle cx={82} cy={88} r={10} fill={color} />
      <Circle cx={100} cy={82} r={11} fill={C.berry} />
      <Circle cx={118} cy={88} r={10} fill={C.lemon} />
      <Path d="M80 144L74 154M120 144L126 154" fill="none" />
      <Path d="M92 132H108" stroke={ink} strokeWidth={2} />
    </G>
  ),
  total_200: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M54 136C66 126 74 128 84 136C94 144 106 144 116 136C126 128 134 126 146 136" fill="none" />
      {[64, 84, 104, 124].map((x, i) => (
        <G key={x}>
          <Path d={`M${x} 136L${x} 118`} fill="none" />
          <Circle cx={x} cy={110} r={7} fill={i % 2 ? C.berry : color} />
        </G>
      ))}
      <Circle cx={144} cy={98} r={12} fill={C.lemon} />
      <Path d="M138 92C142 86 148 86 152 92" fill="none" />
    </G>
  ),
  total_300: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={78} r={18} fill={C.lemon} />
      <Path
        d="M100 50V42M100 114V122M72 78H64M136 78H144M80 58L74 52M126 100L132 106M80 100L74 106M126 56L132 50"
        fill="none"
        stroke={C.lemon}
        strokeWidth={3}
      />
      <Path d="M58 148C68 124 84 116 100 116C116 116 132 124 142 148Z" fill={C.mint} />
      {[76, 92, 108, 124].map((x, i) => (
        <Circle key={x} cx={x} cy={130} r={5} fill={i % 2 ? color : C.berry} />
      ))}
    </G>
  ),
  total_520: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 142C80 128 58 116 58 96C58 80 76 76 86 88L100 104L114 88C124 76 142 80 142 96C142 116 120 128 100 142Z"
        fill={color}
      />
      <Path
        d="M100 126C86 118 72 108 72 96C72 86 84 84 90 92L100 104L110 92C116 84 128 86 128 96C128 108 114 118 100 126Z"
        fill={C.berrySoft}
      />
      <Stem ink={ink} color={C.lemon} d="M100 104C104 96 108 92 114 94" />
    </G>
  ),
  days_3: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M68 112C68 94 93 90 108 100C123 110 131 105 135 96C141 108 129 125 108 122C91 120 79 126 74 137C68 129 68 120 68 112Z"
        fill={C.soda}
      />
      <Path d="M105 110C109 104 113 102 118 104C114 110 110 112 105 110Z" fill={color} />
      <Path d="M101 110C98 104 98 99 101 95C105 99 106 104 105 109Z" fill={C.mint} />
      <Circle cx={108} cy={112} r={3} fill={C.berry} />
      <Path d="M70 112C78 118 84 120 90 120" fill="none" />
    </G>
  ),
  days_7: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={60} y={68} width={80} height={64} rx={5} fill={soft} />
      <Path d="M60 86H140M60 108H140M80 68V132M100 68V132M120 68V132" stroke={ink} strokeWidth={1.4} fill="none" />
      {[70, 92, 114].map((y, i) => (
        <Circle key={y} cx={70 + i * 20} cy={y + 10} r={4} fill={i === 1 ? C.berry : color} />
      ))}
    </G>
  ),
  days_15: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 62C74 76 64 104 76 126C88 146 112 146 124 126C136 104 126 76 100 62Z" fill={C.lemon} />
      <Path d="M100 62C88 84 86 108 96 132C80 136 68 122 68 106C68 88 80 72 100 62Z" fill={C.berrySoft} />
      <Circle cx={116} cy={90} r={4} fill={C.lemon} />
      <Circle cx={122} cy={110} r={3} fill={C.lemon} />
      <Path d="M74 140H126" fill="none" stroke={color} strokeWidth={2} />
    </G>
  ),
  days_30: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={64} width={62} height={78} rx={5} fill={soft} transform="rotate(-4 93 103)" />
      <Rect x={74} y={72} width={62} height={78} rx={5} fill={C.white} transform="rotate(4 105 111)" />
      <Path d="M86 88H122M86 100H118M86 112H124M86 124H112" stroke={ink} strokeWidth={1.6} />
      <Circle cx={128} cy={136} r={9} fill={color} />
    </G>
  ),
  days_50: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M78 64H122V140L100 127L78 140Z" fill={C.lemon} />
      <Path d="M78 64H122V80H78Z" fill={C.berry} />
      <Circle cx={100} cy={96} r={9} fill={C.white} />
      <Path d="M100 88V104M92 96H108" fill="none" stroke={color} strokeWidth={3} />
      <Path d="M76 64L100 84L124 64" fill="none" />
    </G>
  ),
  days_100: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M76 64H124V140L100 126L76 140Z" fill={soft} />
      <Stem ink={ink} color={color} d="M100 132C100 116 100 102 100 90" />
      <Circle cx={100} cy={88} r={9} fill={C.berry} />
      <Circle cx={91} cy={98} r={7} fill={color} />
      <Circle cx={109} cy={98} r={7} fill={C.lemon} />
      <Circle cx={100} cy={86} r={3} fill={C.lemon} />
    </G>
  ),
  perfect_1: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 144C78 128 62 112 62 94C62 78 80 72 92 84L100 94L108 84C120 72 138 78 138 94C138 112 122 128 100 144Z"
        fill={color}
      />
      <Petals color={C.lemon} ink={ink} cy={94} r={7} count={5} />
      <Path
        d="M100 124C94 118 88 114 88 108C88 102 96 100 100 106C104 100 112 102 112 108C112 114 106 118 100 124Z"
        fill={C.berrySoft}
      />
    </G>
  ),
  perfect_7: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      {[66, 82, 100, 118, 134].map((x, i) => (
        <Path
          key={x}
          d={`M${x} ${100 + (i % 2) * 8}C${x - 8} ${96 + (i % 2) * 8} ${x - 10} ${110 + (i % 2) * 8} ${x} ${116 + (i % 2) * 8}C${x + 10} ${110 + (i % 2) * 8} ${x + 8} ${96 + (i % 2) * 8} ${x} ${100 + (i % 2) * 8}Z`}
          fill={i % 2 ? C.berry : color}
        />
      ))}
      <Path d="M72 130C86 138 114 138 128 130" fill="none" stroke={C.lemon} strokeWidth={3} />
    </G>
  ),
  perfect_30: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={100} r={36} fill="none" stroke={color} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 36;
        const y = 100 + Math.sin(a) * 36;
        return <Path key={i} d={`M${x} ${y}C${x - 5} ${y} ${x - 5} ${y + 10} ${x} ${y + 8}Z`} fill={C.berry} />;
      })}
      <Circle cx={100} cy={100} r={9} fill={C.lemon} />
    </G>
  ),
  perfect_streak_3: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      {[78, 100, 122].map((x, i) => (
        <Path
          key={x}
          d={`M${x} 90C${x - 10} 84 ${x - 14} 102 ${x} 110C${x + 14} 102 ${x + 10} 84 ${x} 90Z`}
          fill={i === 1 ? color : C.berrySoft}
        />
      ))}
      <Path d="M78 112L100 130L122 112" fill="none" stroke={color} strokeWidth={4} />
    </G>
  ),
  perfect_streak_7: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M62 126C76 98 90 88 100 88C110 88 124 98 138 126" fill="none" stroke={C.berry} strokeWidth={6} />
      <Path d="M66 136C80 108 94 98 100 98C106 98 120 108 134 136" fill="none" stroke={C.soda} strokeWidth={6} />
      <Path d="M70 146C84 118 96 108 100 108C104 108 116 118 130 146" fill="none" stroke={color} strokeWidth={6} />
      <Path d="M88 92C92 84 96 80 100 80C104 80 108 84 112 92" fill="none" />
      <Circle cx={100} cy={76} r={6} fill={C.lemon} />
    </G>
  ),
  perfect_month: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={100} r={32} fill={C.lemon} />
      <Path d="M100 68C86 86 86 114 100 132C114 114 114 86 100 68Z" fill={C.berrySoft} />
      <Circle cx={82} cy={86} r={8} fill={C.berry} />
      <Circle cx={118} cy={112} r={8} fill={C.berry} />
      <Path d="M86 120C94 114 106 114 114 120" fill="none" />
    </G>
  ),
  early_1: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={86} cy={96} r={22} fill={C.lemon} />
      <Path
        d="M86 74V66M86 126V118M64 96H56M108 96H116M70 80L64 74M102 112L108 118"
        fill="none"
        stroke={C.lemon}
        strokeWidth={3}
      />
      <Ellipse cx={112} cy={104} rx={17} ry={13} fill={color} />
      <Path d="M129 104L138 100L132 110Z" fill={C.lemon} />
      <Circle cx={117} cy={100} r={2.8} fill={ink} />
      <Path d="M100 118L106 130L112 118" fill="none" stroke={ink} strokeWidth={2} />
    </G>
  ),
  early_20: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M82 134H118C124 106 120 84 100 64C80 84 76 106 82 134Z" fill={soft} />
      <Path d="M82 134C84 112 88 92 100 72" fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={94} cy={118} r={7} fill={C.lemon} />
      <Circle cx={106} cy={106} r={5} fill={color} />
      <Ellipse cx={98} cy={90} rx={5} ry={9} fill={C.lemon} transform="rotate(-20 98 90)" />
      <Path d="M84 58L90 66M112 58L106 66" fill="none" stroke={C.lemon} strokeWidth={3} />
      <Circle cx={100} cy={28} r={6} fill={C.lemon} />
    </G>
  ),
  night_1: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={104} r={28} fill={C.lemon} />
      <Circle cx={92} cy={96} r={26} fill={C.paper} />
      <Circle cx={91} cy={98} r={2.5} fill={ink} />
      <Path d="M80 72C86 62 98 58 108 64C100 74 88 76 80 72Z" fill={color} />
      <Circle cx={108} cy={66} r={5} fill={C.berrySoft} />
      <Path d="M80 118C86 124 96 126 102 122" fill="none" />
    </G>
  ),
  ontime_10: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={96} r={26} fill={soft} />
      <Circle cx={100} cy={96} r={21} fill={C.white} />
      <Path d="M100 82V96L110 104" fill="none" />
      <Path d="M82 70L74 62M118 70L126 62M82 124L76 132M118 124L124 132" fill="none" />
      <Path
        d="M100 124C92 118 84 116 84 108C84 100 94 98 100 106C106 98 116 100 116 108C116 116 108 118 100 124Z"
        fill={color}
      />
    </G>
  ),
  monday_4: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={88} cy={100} r={22} fill={C.lemon} />
      <Path d="M88 78V70M88 130V122M66 100H58M110 100H118" fill="none" stroke={C.lemon} strokeWidth={3} />
      <Circle cx={88} cy={100} r={7} fill={color} />
      <Path d="M114 80V122M114 80H122M114 122H122" fill="none" stroke={color} strokeWidth={5} />
    </G>
  ),
  weekend_4: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 60L106 80L126 72L116 92L136 100L116 108L126 128L106 120L100 140L94 120L74 128L84 108L64 100L84 92L74 72L94 80Z"
        fill={C.lemon}
      />
      <Rect x={88} y={94} width={10} height={14} rx={3} fill={ink} />
      <Rect x={104} y={94} width={10} height={14} rx={3} fill={ink} />
      <Path d="M102 99H104M92 99L88 94" fill="none" stroke={ink} strokeWidth={2} />
      <Circle cx={92} cy={120} r={4} fill={color} />
    </G>
  ),
  projects_3: ({ color, ink }) => (
    <G>
      <Stem ink={ink} color={C.mint} d="M100 140C100 126 100 116 100 102" />
      <Circle cx={84} cy={104} r={11} fill={color} stroke={ink} strokeWidth={2} />
      <Circle cx={100} cy={94} r={12} fill={C.berry} stroke={ink} strokeWidth={2} />
      <Circle cx={116} cy={104} r={11} fill={C.lemon} stroke={ink} strokeWidth={2} />
      <Circle cx={100} cy={104} r={6} fill={C.white} stroke={ink} strokeWidth={2} />
    </G>
  ),
  day_3: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M72 138C78 116 90 106 100 106C110 106 122 116 128 138Z" fill={color} />
      <Path d="M82 138C86 122 94 114 100 114C106 114 114 122 118 138Z" fill={C.berrySoft} />
      <Circle cx={100} cy={96} r={10} fill={C.lemon} />
      <Path d="M92 138H108" fill="none" />
      <Path d="M72 138L64 146M128 138L136 146" fill="none" />
    </G>
  ),
  day_5: ({ color, ink }) => (
    <G>
      {[
        [-72, C.berry],
        [-36, C.lemon],
        [0, C.mint],
        [36, C.soda],
        [72, color],
      ].map(([deg, fill]) => {
        const a = ((deg as number) * Math.PI) / 180;
        return (
          <Circle
            key={deg as number}
            cx={100 + Math.cos(a) * 22}
            cy={98 + Math.sin(a) * 22}
            r={12}
            fill={fill as string}
            stroke={ink}
            strokeWidth={2}
          />
        );
      })}
      <Circle cx={100} cy={98} r={10} fill={C.lemon} stroke={ink} strokeWidth={2} />
    </G>
  ),
  categories_3: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 78C86 62 64 70 68 90C72 110 88 122 100 132C112 122 128 110 132 90C136 70 114 62 100 78Z"
        fill={soft}
      />
      <Circle cx={84} cy={90} r={8} fill={color} />
      <Circle cx={102} cy={84} r={8} fill={C.lemon} />
      <Circle cx={118} cy={96} r={8} fill={C.soda} />
      <Path d="M74 118C92 110 108 110 126 118" fill="none" />
    </G>
  ),
  multi_full_7: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M78 92C78 74 122 74 122 92C122 108 108 118 100 130C92 118 78 108 78 92Z" fill={C.lemon} />
      <Path d="M80 96H120M82 108H118M88 120H112" fill="none" stroke={ink} strokeWidth={1.5} />
      <Ellipse cx={80} cy={90} rx={12} ry={7} fill={C.soda} transform="rotate(-25 80 90)" />
      <Ellipse cx={120} cy={90} rx={12} ry={7} fill={C.soda} transform="rotate(25 120 90)" />
      <Path d="M86 84C84 80 84 76 86 72M96 80C94 76 94 72 96 68" fill="none" stroke={color} strokeWidth={3} />
    </G>
  ),
  grad_1: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M64 82H128V128C128 136 122 140 114 140H78C70 140 64 136 64 128Z" fill={soft} />
      <Path d="M64 82C72 90 82 94 96 94C110 94 120 90 128 82" fill="none" />
      <Circle cx={96} cy={110} r={9} fill={color} />
      <Path d="M120 82C128 76 136 78 140 84C134 90 126 92 120 88Z" fill={C.berry} />
    </G>
  ),
  grad_30_80: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={96} r={24} fill={C.lemon} />
      <Circle cx={92} cy={90} r={22} fill={C.paper} />
      <Path d="M100 58L114 66H86Z" fill={color} />
      <Path d="M86 66H114" fill="none" />
      <Path d="M110 68L126 74M126 74L124 84" fill="none" stroke={C.berry} strokeWidth={2.5} />
      <Rect x={112} y={74} width={14} height={18} rx={2} fill={C.white} transform="rotate(8 119 83)" />
      <Path d="M116 82L119 86L124 78" fill="none" stroke={C.success} strokeWidth={2} />
    </G>
  ),
  grad_perfect: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 70L126 80L100 90L74 80Z" fill={color} />
      <Path d="M82 86V104C82 111 91 116 100 116C109 116 118 111 118 104V86" fill={C.lemon} />
      <Path d="M126 80V104M126 104L120 114M126 104L132 114" fill="none" stroke={C.berry} strokeWidth={2.5} />
      <Circle cx={100} cy={88} r={4} fill={C.lemon} />
      <Path d="M76 128C84 122 116 122 124 128" fill="none" stroke={C.success} strokeWidth={3} />
    </G>
  ),
  grad_90: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 62L126 72L100 82L74 72Z" fill={color} />
      <Path d="M82 78V96C82 103 90 108 100 108C110 108 118 103 118 96V78" fill={soft} />
      <Path d="M126 72V96" fill="none" stroke={C.berry} strokeWidth={2.5} />
      <Path d="M120 98C126 114 138 120 146 118" fill="none" stroke={C.berry} strokeWidth={4} />
      <Path d="M119 102C124 116 134 124 144 124" fill="none" stroke={C.lemon} strokeWidth={4} />
      <Path d="M118 106C122 120 130 128 140 130" fill="none" stroke={C.soda} strokeWidth={4} />
      <Path d="M86 130C92 124 108 124 114 130" fill="none" />
    </G>
  ),
  grad_again: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M60 104C76 100 90 106 100 118C110 106 124 100 140 104C134 122 118 134 100 138C82 134 66 122 60 104Z"
        fill={soft}
      />
      <Path d="M64 96C76 106 86 112 100 116C114 112 124 106 136 96" fill="none" />
      <Path d="M80 96C82 88 88 86 94 90M120 96C118 88 112 86 106 90" fill="none" stroke={color} strokeWidth={3} />
      <Circle cx={76} cy={112} r={5} fill={C.berry} />
      <Circle cx={124} cy={112} r={5} fill={C.lemon} />
    </G>
  ),
  mood_7: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      {[C.berry, C.lemon, C.mint, C.soda, C.grape, color, C.milktea].map((fill, i) => (
        <Rect
          key={i}
          x={68 + (i % 4) * 18}
          y={80 + Math.floor(i / 4) * 18}
          width={14}
          height={14}
          rx={3}
          fill={fill}
          transform={`rotate(${(i % 3) - 1} ${75 + (i % 4) * 18} ${87 + Math.floor(i / 4) * 18})`}
        />
      ))}
      <Path d="M88 120C92 114 108 114 112 120" fill="none" />
    </G>
  ),
  mood_30: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={64} y={82} width={72} height={54} rx={4} fill={soft} transform="rotate(-4 100 109)" />
      <Rect x={70} y={74} width={72} height={54} rx={4} fill={C.white} transform="rotate(3 106 101)" />
      <Path d="M82 90H126M82 102H120M82 114H124" stroke={ink} strokeWidth={1.5} />
      <Path d="M126 74L138 82L126 90" fill={color} />
    </G>
  ),
  mood_streak_7: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      {[68, 84, 100, 116, 132].map((x, i) => (
        <Path
          key={x}
          d={`M${x} ${86 + (i % 2) * 10}H${x + 10}C${x + 14} ${86 + (i % 2) * 10} ${x + 14} ${102 + (i % 2) * 10} ${x + 10} ${102 + (i % 2) * 10}H${x + 4}L${x} ${108 + (i % 2) * 10}Z`}
          fill={i % 2 ? C.soda : color}
        />
      ))}
      <Circle cx={102} cy={118} r={4} fill={C.berry} />
    </G>
  ),
  mood_long: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={64} y={74} width={72} height={76} rx={3} fill={soft} />
      <Path d="M64 74L100 92L136 74" fill="none" />
      <Path d="M78 104H122M78 114H118M78 124H112" stroke={ink} strokeWidth={1.6} />
      <Path d="M136 74L148 86L136 98" fill={color} />
    </G>
  ),
  mood_photos_20: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={66} width={76} height={64} rx={4} fill={soft} />
      <Rect x={72} y={74} width={25} height={20} rx={2} fill={C.soda} />
      <Rect x={102} y={74} width={25} height={20} rx={2} fill={C.lemon} />
      <Rect x={72} y={100} width={25} height={20} rx={2} fill={C.mint} />
      <Path d="M102 100H127V120H102Z" fill={color} />
      <Path d="M100 132V144M100 132L94 138M100 132L106 138" fill="none" />
    </G>
  ),
  mood_palette: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 66C76 66 60 84 60 104C60 124 78 138 98 136C108 135 108 126 102 120C96 114 102 106 110 108C122 111 132 102 128 88C124 74 112 66 100 66Z"
        fill={soft}
      />
      <Circle cx={80} cy={90} r={7} fill={C.berry} />
      <Circle cx={96} cy={80} r={7} fill={C.lemon} />
      <Circle cx={114} cy={86} r={7} fill={C.mint} />
      <Circle cx={122} cy={104} r={7} fill={C.soda} />
      <Circle cx={86} cy={116} r={7} fill={color} />
    </G>
  ),
  comeback: ({ color, ink }) => (
    <G>
      <Stem ink={ink} color={C.mint} d="M64 124L100 96L136 124" />
      <Circle cx={64} cy={118} r={12} fill={color} />
      <Circle cx={136} cy={118} r={12} fill={C.berry} />
      <Circle cx={64} cy={118} r={4} fill={C.lemon} />
      <Circle cx={136} cy={118} r={4} fill={C.lemon} />
      <Path d="M76 128C84 134 92 136 100 132C108 136 116 134 124 128" fill="none" stroke={ink} strokeWidth={2} />
      <Path d="M88 104L94 98M112 104L106 98" fill="none" stroke={C.lemon} strokeWidth={3} />
    </G>
  ),
  any_30: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M66 100C66 82 134 82 134 100C134 118 122 126 100 126C78 126 66 118 66 100Z" fill={C.soda} />
      <Path d="M100 84V126M100 84C86 88 80 96 80 104M100 84C114 88 120 96 120 104" fill="none" />
      <Path d="M100 126C100 136 100 142 100 150" fill="none" stroke={ink} strokeWidth={3} />
      <Circle cx={100} cy={106} r={9} fill={color} />
      <Circle cx={94} cy={116} r={6} fill={C.berry} />
      <Circle cx={106} cy={116} r={6} fill={C.lemon} />
    </G>
  ),
  pause_resume: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M100 140C92 126 82 118 82 106C82 94 94 90 100 100C106 90 118 94 118 106C118 118 108 126 100 140Z"
        fill={color}
      />
      <Path d="M86 82C78 72 82 62 92 60M114 82C122 72 118 62 108 60" fill="none" stroke={C.lemon} strokeWidth={4} />
      <Circle cx={100} cy={104} r={4} fill={C.lemon} />
      <Path d="M72 118C64 114 60 106 64 100M128 118C136 114 140 106 136 100" fill="none" stroke={ink} strokeWidth={2} />
    </G>
  ),
  makeup: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Ellipse cx={96} cy={106} rx={30} ry={22} fill={soft} />
      <Circle cx={68} cy={92} r={8} fill={soft} />
      <Circle cx={68} cy={92} r={3} fill={ink} />
      <Circle cx={90} cy={102} r={3} fill={ink} />
      <Circle cx={108} cy={102} r={3} fill={ink} />
      <Path d="M82 114C90 120 102 120 110 112" fill="none" />
      <Path d="M104 82L112 94L124 88L118 100L128 108L116 108L112 120" fill="none" stroke={color} strokeWidth={3} />
      <Circle cx={102} cy={88} r={4} fill={C.berry} />
    </G>
  ),
  new_year: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Circle cx={100} cy={102} r={14} fill={color} />
      <Path
        d="M100 102L82 74M100 102L118 74M100 102L70 92M100 102L130 92"
        fill="none"
        stroke={C.lemon}
        strokeWidth={3}
      />
      <Circle cx={82} cy={74} r={4} fill={C.berry} />
      <Circle cx={118} cy={74} r={4} fill={C.soda} />
      <Circle cx={70} cy={92} r={4} fill={C.mint} />
      <Circle cx={130} cy={92} r={4} fill={C.berry} />
      <Stem ink={ink} color={C.mint} d="M100 116C100 126 100 134 100 142" />
      <Circle cx={92} cy={124} r={5} fill={C.lemon} />
      <Circle cx={108} cy={128} r={5} fill={color} />
    </G>
  ),
  date_520: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path
        d="M76 142C64 132 56 120 56 108C56 96 70 92 78 102L86 112L94 102C102 92 116 96 116 108C116 120 108 132 96 142Z"
        fill={color}
      />
      <Path
        d="M120 102C120 94 128 90 134 96C140 102 138 114 130 124"
        fill="none"
        stroke={C.berrySoft}
        strokeWidth={6}
      />
      <Circle cx={128} cy={130} r={8} fill={C.lemon} />
      <Path d="M124 130L128 134L134 124" fill="none" stroke={ink} strokeWidth={2} />
    </G>
  ),
  undo_5: ({ color, ink }) => (
    <G {...inkStroke(ink)}>
      <Path d="M100 138C100 124 100 116 100 106" fill="none" />
      <Path d="M100 106C86 102 78 92 80 82C92 80 100 88 100 102Z" fill={C.mint} />
      <Path d="M100 106C114 104 122 94 120 84C108 82 100 90 100 102Z" fill={color} />
      <Circle cx={100} cy={96} r={7} fill={C.lemon} />
      <Path d="M100 88C98 82 104 78 108 82" fill="none" />
      <Path d="M80 136C88 130 112 130 120 136" fill="none" />
    </G>
  ),
  tap_10: ({ color, ink }) => (
    <G>
      {[70, 88, 106, 124].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={110 - i * 4} r={9} fill={i % 2 ? C.berry : color} stroke={ink} strokeWidth={2} />
          <Circle cx={x} cy={110 - i * 4} r={3} fill={C.lemon} stroke={ink} strokeWidth={1.5} />
        </G>
      ))}
      <Path d="M62 128C84 138 116 138 138 128" fill="none" stroke={ink} strokeWidth={2} />
    </G>
  ),
  triple_unlock: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Path d="M68 88H132V136C132 142 127 146 121 146H79C73 146 68 142 68 136Z" fill={soft} />
      <Path d="M68 88C68 78 84 74 100 74C116 74 132 78 132 88" fill={color} />
      <Path d="M68 108H132M86 88V146M114 88V146" fill="none" />
      <Circle cx={100} cy={64} r={5} fill={C.lemon} />
      <Path d="M76 68L72 60M124 68L128 60" fill="none" stroke={C.berry} strokeWidth={3} />
    </G>
  ),
  mystery_gift: ({ color, ink, soft }) => (
    <G {...inkStroke(ink)}>
      <Rect x={62} y={96} width={76} height={48} rx={5} fill={soft} />
      <Rect x={58} y={82} width={84} height={20} rx={4} fill={color} />
      <Path d="M100 82V144M86 144V82M114 144V82" fill="none" />
      <Path
        d="M100 82C82 82 70 72 74 62C80 54 96 62 100 82ZM100 82C118 82 130 72 126 62C120 54 104 62 100 82Z"
        fill={color}
      />
      <Circle cx={100} cy={118} r={11} fill={C.lemon} />
      <Path d="M96 114C98 109 104 111 103 116C102 119 100 119 100 123" fill="none" />
      <Circle cx={100} cy={127} r={1.6} fill={ink} />
    </G>
  ),
};

export function BadgeMotif({ motif, colors, silhouette = false }: BadgeMotifLayerProps) {
  const Component = BADGE_MOTIF_COMPONENTS[motif];
  if (!Component) throw new Error(`未知徽章图案：${motif}`);
  const palette = silhouette
    ? { color: colors.primary, deep: colors.primary, ink: colors.primary, soft: colors.soft }
    : { color: colors.primary, deep: colors.deep, ink: colors.ink, soft: colors.soft };
  return <Component {...palette} />;
}
