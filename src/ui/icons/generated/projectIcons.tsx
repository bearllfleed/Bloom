/**
 * 此文件由 scripts/svg-build.ts 根据 assets/svg 生成，请勿手改。
 */
import Svg, { Path, Circle, Rect, Ellipse, G } from 'react-native-svg';

export interface ProjectIconProps {
  size?: number;
  /** 贴纸外描边颜色；不传则不画外描边 */
  outline?: string;
  /** 灰度显示（暂停、禁用） */
  mono?: boolean;
}

function CollectBalloon({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M32 49c-3.5 4 3.5 6 0 10" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M29.5 46h5L32 49.5z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M32 7c9.5 0 17 7.5 17 17 0 11.5-9.5 20.5-17 22.5-7.5-2-17-11-17-22.5 0-9.5 7.5-17 17-17"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M23 18a11 11 0 0 1 6-5" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 49c-3.5 4 3.5 6 0 10" />
        <Path d="M29.5 46h5L32 49.5z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path
          d="M32 7c9.5 0 17 7.5 17 17 0 11.5-9.5 20.5-17 22.5-7.5-2-17-11-17-22.5 0-9.5 7.5-17 17-17"
          fill={mono ? '#C4C0C2' : '#FF8FB8'}
        />
        <Path d="M23 18a11 11 0 0 1 6-5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function CollectClover({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M33 34c4 8 4 15 11 23" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="24" cy="22" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="42" cy="22" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="24" cy="40" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="42" cy="40" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="33" cy="31" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M19 18a6 6 0 0 1 4-3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M33 34c4 8 4 15 11 23" />
        <Circle cx="24" cy="22" r="9" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Circle cx="42" cy="22" r="9" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Circle cx="24" cy="40" r="9" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Circle cx="42" cy="40" r="9" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Circle cx="33" cy="31" r="4" fill={mono ? '#B1ADAF' : '#7FBF52'} />
        <Path d="M19 18a6 6 0 0 1 4-3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function CollectCrown({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m9 22 11 11 12-17 12 17 11-11-4 29H13z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M13 44h38" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="37" r="3.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="9" cy="20" r="2.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="13" r="2.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="55" cy="20" r="2.5" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m9 22 11 11 12-17 12 17 11-11-4 29H13z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M13 44h38" />
        <Circle cx="32" cy="37" r="3.5" fill={mono ? '#B9B5B7' : '#FF7BA9'} />
        <Circle cx="9" cy="20" r="2.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="32" cy="13" r="2.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="55" cy="20" r="2.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
      </G>
    </Svg>
  );
}

function CollectFlower({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="32" cy="20" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="43.4" cy="28.3" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="39.1" cy="41.7" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="24.9" cy="41.7" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="20.6" cy="28.3" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="32" r="7" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="32" cy="20" r="9" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="43.4" cy="28.3" r="9" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="39.1" cy="41.7" r="9" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="24.9" cy="41.7" r="9" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="20.6" cy="28.3" r="9" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="32" cy="32" r="7" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Ellipse
          cx="28.5"
          cy="16.5"
          rx="3"
          ry="1.8"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".7"
          transform="rotate(-25 28.5 16.5)"
        />
      </G>
    </Svg>
  );
}

function CollectHeart({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 52C14 40.5 8.5 30.5 12 21.5S26.5 12 32 20c5.5-8 16.5-7.5 20 1.5s-2 19-20 30.5"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M32 52C14 40.5 8.5 30.5 12 21.5S26.5 12 32 20c5.5-8 16.5-7.5 20 1.5s-2 19-20 30.5"
          fill={mono ? '#C4C0C2' : '#FF8FB8'}
        />
        <Ellipse
          cx="20.5"
          cy="22"
          rx="4"
          ry="2.4"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".7"
          transform="rotate(-35 20.5 22)"
        />
      </G>
    </Svg>
  );
}

function CollectRainbow({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M8 46a24 24 0 0 1 48 0h-8a16 16 0 0 0-32 0z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M16 46a16 16 0 0 1 32 0h-7a9 9 0 0 0-18 0z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M23 46a9 9 0 0 1 18 0z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M4 50a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8H7a4 4 0 0 1-3-5"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path
            d="M44 50a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8H47a4 4 0 0 1-3-5"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M8 46a24 24 0 0 1 48 0h-8a16 16 0 0 0-32 0z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path d="M16 46a16 16 0 0 1 32 0h-7a9 9 0 0 0-18 0z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M23 46a9 9 0 0 1 18 0z" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Path d="M4 50a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8H7a4 4 0 0 1-3-5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path
          d="M44 50a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8H47a4 4 0 0 1-3-5"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
        />
      </G>
    </Svg>
  );
}

function CollectRocket({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m27 42 5 15 5-15z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m22 32-8 10 8 2zm20 0 8 10-8 2z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 7c9 6 13 17 10 35H22c-3-18 1-29 10-35" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="24" r="5.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M27 14a12 12 0 0 1 3-3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m27 42 5 15 5-15z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="m22 32-8 10 8 2zm20 0 8 10-8 2z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path d="M32 7c9 6 13 17 10 35H22c-3-18 1-29 10-35" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="32" cy="24" r="5.5" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Path d="M27 14a12 12 0 0 1 3-3" stroke={mono ? '#F5F1F3' : '#FFE6F0'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

function CollectStar({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="m32 12 5.9 13.9 15 1.3-11.4 9.9 3.4 14.7L32 44l-12.9 7.8 3.4-14.7-11.4-9.9 15-1.3z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="m32 12 5.9 13.9 15 1.3-11.4 9.9 3.4 14.7L32 44l-12.9 7.8 3.4-14.7-11.4-9.9 15-1.3z"
          fill={mono ? '#E0DCDE' : '#FFD66B'}
        />
        <Ellipse
          cx="25"
          cy="29"
          rx="2.6"
          ry="1.6"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".7"
          transform="rotate(-30 25 29)"
        />
      </G>
    </Svg>
  );
}

function HabitBriefcase({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M24 22v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="9" y="22" width="46" height="31" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M9 35h46" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="27.5" y="31" width="9" height="8" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M14 27h6" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M24 22v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" />
        <Rect x="9" y="22" width="46" height="31" rx="5" fill={mono ? '#C2BEC0' : '#A3ADFF'} />
        <Path d="M9 35h46" />
        <Rect x="27.5" y="31" width="9" height="8" rx="2" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M14 27h6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function HabitCoffeeOff({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 9c-2 3 2 5 0 8m8-8c-2 3 2 5 0 8" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M40 27h4a5 5 0 0 1 0 10h-4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M10 22h30v14a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M16 28v5" fill="none" stroke={outline} strokeWidth="9" />
          <Circle cx="47" cy="47" r="10" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m43 43 8 8m0-8-8 8" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M21 9c-2 3 2 5 0 8m8-8c-2 3 2 5 0 8" />
        <Path d="M40 27h4a5 5 0 0 1 0 10h-4" />
        <Path d="M10 22h30v14a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill={mono ? '#CCC8CA' : '#D8B79A'} />
        <Path d="M16 28v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
        <Circle cx="47" cy="47" r="10" fill={mono ? '#9B9799' : '#F2555A'} />
        <Path d="m43 43 8 8m0-8-8 8" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

function HabitOwl({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m15 14 7 10m27-10-7 10" fill="none" stroke={outline} strokeWidth="9" />
          <Path
            d="M13 37c0-12 8.5-20 19-20s19 8 19 20-8.5 20-19 20-19-8-19-20"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M22 47c3 3 17 3 20 0" fill="none" stroke={outline} strokeWidth="9" />
          <Circle cx="24.5" cy="33" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="39.5" cy="33" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="24.5" cy="33" r="2.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="39.5" cy="33" r="2.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m29.5 41 2.5 3.5 2.5-3.5z" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m15 14 7 10m27-10-7 10" strokeWidth="3" />
        <Path d="M13 37c0-12 8.5-20 19-20s19 8 19 20-8.5 20-19 20-19-8-19-20" fill={mono ? '#C2BEC0' : '#A3ADFF'} />
        <Path d="M22 47c3 3 17 3 20 0" stroke={mono ? '#F4F0F2' : '#E9EBFF'} strokeWidth="3" />
        <Circle cx="24.5" cy="33" r="7.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="39.5" cy="33" r="7.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="24.5" cy="33" r="2.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Circle cx="39.5" cy="33" r="2.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Path d="m29.5 41 2.5 3.5 2.5-3.5z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
      </G>
    </Svg>
  );
}

function HabitPhoneOff({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="18" y="7" width="24" height="44" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="22" y="13" width="16" height="28" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="45" cy="46" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m41.5 42.5 7 7m0-7-7 7" fill="none" stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="18" y="7" width="24" height="44" rx="5" fill={mono ? '#C2BEC0' : '#A3ADFF'} />
        <Rect x="22" y="13" width="16" height="28" rx="2" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="30" cy="46" r="1.6" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="45" cy="46" r="9" fill={mono ? '#BDB9BB' : '#FF8A8A'} />
        <Path d="m41.5 42.5 7 7m0-7-7 7" />
      </G>
    </Svg>
  );
}

function HealthAlarm({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m19 50-4 5m30-5 4 5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M11 21a9 9 0 0 1 12-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M53 21a9 9 0 0 0-12-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="35" r="18" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="35" r="13" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 27v8l5 4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M24 26a11 11 0 0 1 5-3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m19 50-4 5m30-5 4 5" />
        <Path d="M11 21a9 9 0 0 1 12-9z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M53 21a9 9 0 0 0-12-9z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Circle cx="32" cy="35" r="18" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Circle cx="32" cy="35" r="13" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M32 27v8l5 4" />
        <Path d="M24 26a11 11 0 0 1 5-3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function HealthApple({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 21c-6-5-20-4-20 12 0 13.5 10 23.5 20 19.5 10 4 20-6 20-19.5 0-16-14-17-20-12"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M32 21c0-5 1-9 4-11.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M34.5 15c3.5-6 11-5.5 12.5-2.5C43.5 17 37.5 18 34.5 15"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M32 21c-6-5-20-4-20 12 0 13.5 10 23.5 20 19.5 10 4 20-6 20-19.5 0-16-14-17-20-12"
          fill={mono ? '#BDB9BB' : '#FF8A8A'}
        />
        <Path d="M32 21c0-5 1-9 4-11.5" />
        <Path d="M34.5 15c3.5-6 11-5.5 12.5-2.5C43.5 17 37.5 18 34.5 15" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Ellipse
          cx="20.5"
          cy="30"
          rx="3"
          ry="5"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".6"
          transform="rotate(20 20.5 30)"
        />
      </G>
    </Svg>
  );
}

function HealthMilk({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M25 8h14v6H25z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="m20 24 5-10h14l5 10v30a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M20 34h24v20a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M20 24h24" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M29 43c0-3 6-3 6 0s-6 3-6 0" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M24.5 28v2" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M25 8h14v6H25z" fill={mono ? '#F6F2F4' : '#E3F3FF'} />
        <Path d="m20 24 5-10h14l5 10v30a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M20 34h24v20a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Path d="M20 24h24" />
        <Path d="M29 43c0-3 6-3 6 0s-6 3-6 0" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M24.5 28v2" stroke={mono ? '#F6F2F4' : '#E3F3FF'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

function HealthMoon({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M42 11a22 22 0 1 0 12 30 18 18 0 0 1-12-30" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M30 41q2.5 2 5 0" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="m50 12 1.4 3 3 1.4-3 1.4L50 21l-1.4-3-3-1.4 3-1.4z"
            fill={outline}
            stroke={outline}
            strokeWidth="8"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M42 11a22 22 0 1 0 12 30 18 18 0 0 1-12-30" fill={mono ? '#C2BEC0' : '#A3ADFF'} />
        <Circle cx="24" cy="36" r="2" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Path d="M30 41q2.5 2 5 0" />
        <Ellipse cx="21" cy="41" rx="3" ry="1.8" fill={mono ? '#C4C0C2' : '#FF8FB8'} stroke="none" opacity=".6" />
        <Path
          d="m50 12 1.4 3 3 1.4-3 1.4L50 21l-1.4-3-3-1.4 3-1.4z"
          fill={mono ? '#E0DCDE' : '#FFD66B'}
          strokeWidth="2"
        />
        <Ellipse
          cx="21"
          cy="24"
          rx="3.6"
          ry="2"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".6"
          transform="rotate(-40 21 24)"
        />
      </G>
    </Svg>
  );
}

function HealthPill({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="19" y="20" width="26" height="36" rx="6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="17" y="9" width="30" height="11" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="24" y="30" width="16" height="16" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M28.5 38h7M32 34.5v7" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M23 25v3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="19" y="20" width="26" height="36" rx="6" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Rect x="17" y="9" width="30" height="11" rx="3" fill={mono ? '#CFCBCD' : '#FFA3C3'} />
        <Rect x="24" y="30" width="16" height="16" rx="3" fill={mono ? '#F6F2F4' : '#E3F3FF'} />
        <Path d="M28.5 38h7M32 34.5v7" stroke={mono ? '#A19D9F' : '#F0588F'} />
        <Path d="M23 25v3" stroke={mono ? '#F6F2F4' : '#E3F3FF'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

function HealthSun({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 7v7m0 36v7M7 32h7m36 0h7M14.3 14.3l5 5m25.4 25.4 5 5m-35.4 0 5-5m25.4-25.4 5-5"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="32" cy="32" r="13" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M25.5 29a7.5 7.5 0 0 1 4.5-4.5" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 7v7m0 36v7M7 32h7m36 0h7M14.3 14.3l5 5m25.4 25.4 5 5m-35.4 0 5-5m25.4-25.4 5-5" />
        <Circle cx="32" cy="32" r="13" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M25.5 29a7.5 7.5 0 0 1 4.5-4.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function HealthWaterCup({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path
            d="M18 16h28l-4 36.5a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m37 16 6-10h6" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M24.5 21v6" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M18 16h28l-4 36.5a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z"
          fill={mono ? '#F6F2F4' : '#E3F3FF'}
          stroke="none"
        />
        <Path
          d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0l-2.4 22a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z"
          fill={mono ? '#CFCBCD' : '#8FD0FF'}
          stroke="none"
        />
        <Path d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0" />
        <Path d="M18 16h28l-4 36.5a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z" />
        <Path d="m37 16 6-10h6" />
        <Path d="M24.5 21v6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function HobbyCamera({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m22 21 4-7h12l4 7" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="9" y="20" width="46" height="31" rx="6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="35.5" r="10.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="35.5" r="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="47" cy="27" r="1.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M28 33a4 4 0 0 1 3-2" fill="none" stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m22 21 4-7h12l4 7" fill={mono ? '#F5F1F3' : '#F2EAFF'} />
        <Rect x="9" y="20" width="46" height="31" rx="6" fill={mono ? '#C6C2C4' : '#C6A2FF'} />
        <Circle cx="32" cy="35.5" r="10.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="32" cy="35.5" r="5" fill={mono ? '#A7A3A5' : '#A27BEA'} />
        <Circle cx="47" cy="27" r="1.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Path d="M28 33a4 4 0 0 1 3-2" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
      </G>
    </Svg>
  );
}

function HobbyCupcake({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 36h28l-4 19H22z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m26 40 1.5 11M32 40v11m6-11-1.5 11" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M13 36c0-8 7-14 12.5-12 2-6.5 11-6.5 13 0C44 22 51 28 51 36z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="32" cy="15" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M21 30a6 6 0 0 1 4-3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M18 36h28l-4 19H22z" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="m26 40 1.5 11M32 40v11m6-11-1.5 11" />
        <Path d="M13 36c0-8 7-14 12.5-12 2-6.5 11-6.5 13 0C44 22 51 28 51 36z" fill={mono ? '#E4E0E2' : '#FFC7DB'} />
        <Circle cx="32" cy="15" r="4" fill={mono ? '#9B9799' : '#F2555A'} />
        <Path d="M21 30a6 6 0 0 1 4-3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function HobbyMusicDisc({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="32" cy="32" r="22" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M19 26a14 14 0 0 1 7-7m19 19a14 14 0 0 1-7 7" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="32" r="8.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="32" r="2.2" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="32" cy="32" r="22" fill={mono ? '#868284' : '#7A6470'} />
        <Path d="M19 26a14 14 0 0 1 7-7m19 19a14 14 0 0 1-7 7" stroke={mono ? '#B9B5B7' : '#B3A2AA'} />
        <Circle cx="32" cy="32" r="8.5" fill={mono ? '#C6C2C4' : '#C6A2FF'} />
        <Circle cx="32" cy="32" r="2.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
      </G>
    </Svg>
  );
}

function HobbyPalette({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 10C18 10 8 20 8 32s10 22 22 22c4 0 5-3 3-6s0-6 4-6h7c7 0 12-5 12-12 0-12-11-20-24-20"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="22" cy="25" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="33" cy="19" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="44" cy="25" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="18" cy="37" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M32 10C18 10 8 20 8 32s10 22 22 22c4 0 5-3 3-6s0-6 4-6h7c7 0 12-5 12-12 0-12-11-20-24-20"
          fill={mono ? '#F5F1F3' : '#F2EAFF'}
        />
        <Circle cx="22" cy="25" r="4" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Circle cx="33" cy="19" r="4" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Circle cx="44" cy="25" r="4" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Circle cx="18" cy="37" r="4" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Ellipse
          cx="16"
          cy="22"
          rx="2"
          ry="3.4"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".8"
          transform="rotate(30 16 22)"
        />
      </G>
    </Svg>
  );
}

function HobbyPottedPlant({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M32 38V22" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M32 30c-9 0-13-6-13-13 9 0 13 6 13 13" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 25c0-8 5-13 13-13 0 8-5 13-13 13" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M17 38h30l-4 18H21z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M17 38h30v5H17z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M25 47v4" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 38V22" />
        <Path d="M32 30c-9 0-13-6-13-13 9 0 13 6 13 13" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Path d="M32 25c0-8 5-13 13-13 0 8-5 13-13 13" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Path d="M17 38h30l-4 18H21z" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="M17 38h30v5H17z" fill={mono ? '#B5B1B3' : '#EE8A5E'} />
        <Path d="M25 47v4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function LifeBroom({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M44 7 31 33" fill="none" stroke={outline} strokeWidth="10" />
          <Path d="M44 7 31 33" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m24 31 14 6.5-4 18c-7 0-15-4.5-19-10.5z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m21 44.5 9 4.5m-4.5-11L36 43" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m27 34 6 3" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M44 7 31 33" stroke={mono ? '#ADA9AB' : '#B99273'} strokeWidth="4" />
        <Path d="M44 7 31 33" />
        <Path d="m24 31 14 6.5-4 18c-7 0-15-4.5-19-10.5z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="m21 44.5 9 4.5m-4.5-11L36 43" />
        <Path d="m27 34 6 3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function LifeCatBowl({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M14 40c2-7 8-10 18-10s16 3 18 10z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M9 40h46l-5 14H14z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="48" r="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="27" cy="44" r="1.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="42.5" r="1.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="37" cy="44" r="1.6" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M14 40c2-7 8-10 18-10s16 3 18 10z" fill={mono ? '#CCC8CA' : '#D8B79A'} />
        <Circle cx="24" cy="34" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Circle cx="35" cy="33" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Circle cx="42" cy="36" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Path d="M9 40h46l-5 14H14z" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Circle cx="32" cy="48" r="3" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="27" cy="44" r="1.6" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="32" cy="42.5" r="1.6" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="37" cy="44" r="1.6" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
      </G>
    </Svg>
  );
}

function LifePan({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M41 30.5 57.5 24l2 5.5L43 36z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="26" cy="34" r="17" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="26" cy="34" r="12" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M19 31c2-6 12-6 14 0s-2.5 10-7 10-9-4-7-10" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="26" cy="34" r="4" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M41 30.5 57.5 24l2 5.5L43 36z" fill={mono ? '#ADA9AB' : '#B99273'} />
        <Circle cx="26" cy="34" r="17" fill={mono ? '#868284' : '#7A6470'} />
        <Circle cx="26" cy="34" r="12" fill={mono ? '#B9B5B7' : '#B3A2AA'} />
        <Path d="M19 31c2-6 12-6 14 0s-2.5 10-7 10-9-4-7-10" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="26" cy="34" r="4" fill={mono ? '#E0DCDE' : '#FFD66B'} />
      </G>
    </Svg>
  );
}

function LifePiggyBank({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="32" cy="11" r="6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M10 36c0-10 9-16 20-16s21 6 21 16c0 6-3 10-8 12v6h-6v-4H27v4h-6v-6c-6-2-11-6-11-12"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m24 18 4 4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M27 25h8" fill="none" stroke={outline} strokeWidth="8.5" />
          <Ellipse cx="51" cy="36" rx="3.5" ry="4.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="42" cy="31" r="1.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M17 33a8 8 0 0 1 4-5" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="32" cy="11" r="6" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path
          d="M10 36c0-10 9-16 20-16s21 6 21 16c0 6-3 10-8 12v6h-6v-4H27v4h-6v-6c-6-2-11-6-11-12"
          fill={mono ? '#E4E0E2' : '#FFC7DB'}
        />
        <Path d="m24 18 4 4" />
        <Path d="M27 25h8" />
        <Ellipse cx="51" cy="36" rx="3.5" ry="4.5" fill={mono ? '#CFCBCD' : '#FFA3C3'} />
        <Circle cx="42" cy="31" r="1.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Path d="M17 33a8 8 0 0 1 4-5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function LifeWateringCan({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m40 34 13-12 3.5 3.5L42 41" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M16 28h24v20a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M16 32c-8 0-8 14 0 14" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M20 28c0-10 16-10 16 0" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M21 33v10" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m40 34 13-12 3.5 3.5L42 41" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Path d="M16 28h24v20a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Path d="M16 32c-8 0-8 14 0 14" />
        <Path d="M20 28c0-10 16-10 16 0" />
        <Circle cx="57" cy="32" r="1.8" fill={mono ? '#CFCBCD' : '#8FD0FF'} stroke="none" />
        <Circle cx="55" cy="38" r="1.8" fill={mono ? '#CFCBCD' : '#8FD0FF'} stroke="none" />
        <Path d="M21 33v10" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function MindLotus({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 47c6 6 34 6 40 0" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 47c-8-2-16-10-18-21 8 2 15 8 18 21" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 47c8-2 16-10 18-21-8 2-15 8-18 21" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 17c-6 8-6 21 0 30 6-9 6-22 0-30" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M30 26c-.8 3-.8 7 0 10" fill="none" stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M12 47c6 6 34 6 40 0" fill={mono ? '#CBC7C9' : '#7EDCC2'} />
        <Path d="M32 47c-8-2-16-10-18-21 8 2 15 8 18 21" fill={mono ? '#E4E0E2' : '#FFC7DB'} />
        <Path d="M32 47c8-2 16-10 18-21-8 2-15 8-18 21" fill={mono ? '#E4E0E2' : '#FFC7DB'} />
        <Path d="M32 17c-6 8-6 21 0 30 6-9 6-22 0-30" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path d="M30 26c-.8 3-.8 7 0 10" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" opacity=".8" />
      </G>
    </Svg>
  );
}

function MindLoveLetter({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="9" y="17" width="46" height="32" rx="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m9 21 23 15 23-15" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M32 41c-3-4-9.5-2.5-8.5 2.5 1 4 8.5 8.5 8.5 8.5s7.5-4.5 8.5-8.5c1-5-5.5-6.5-8.5-2.5"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M14 43v2" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="9" y="17" width="46" height="32" rx="4" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="m9 21 23 15 23-15" />
        <Path
          d="M32 41c-3-4-9.5-2.5-8.5 2.5 1 4 8.5 8.5 8.5 8.5s7.5-4.5 8.5-8.5c1-5-5.5-6.5-8.5-2.5"
          fill={mono ? '#B9B5B7' : '#FF7BA9'}
        />
        <Path d="M14 43v2" stroke={mono ? '#F6F2F4' : '#E1F7F0'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

function MindSmileSun({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="32" cy="32" r="15" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="26.5" cy="30" r="1.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="37.5" cy="30" r="1.8" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M27 36q5 5 10 0" fill="none" stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2" />
        <Circle cx="32" cy="32" r="15" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Circle cx="26.5" cy="30" r="1.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Circle cx="37.5" cy="30" r="1.8" fill={mono ? '#545052' : '#3F2A33'} />
        <Path d="M27 36q5 5 10 0" />
        <Ellipse cx="23" cy="35.5" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Ellipse cx="41" cy="35.5" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
      </G>
    </Svg>
  );
}

function MindSoftCloud({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M16 48c-6 0-10-4.5-10-10 0-5 4-9.5 9-9.5 1-7 7-12 14-12 6 0 11 3.5 13 9 1-.5 2.5-.5 3.5-.5 6 0 12 5 12 11.5s-5 11.5-11 11.5z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M24 34q2 2 4 0m8 0q2 2 4 0" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M30 40q2 1.5 4 0" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M14 36a5 5 0 0 1 3-4" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M16 48c-6 0-10-4.5-10-10 0-5 4-9.5 9-9.5 1-7 7-12 14-12 6 0 11 3.5 13 9 1-.5 2.5-.5 3.5-.5 6 0 12 5 12 11.5s-5 11.5-11 11.5z"
          fill={mono ? '#F6F2F4' : '#E1F7F0'}
        />
        <Path d="M24 34q2 2 4 0m8 0q2 2 4 0" />
        <Path d="M30 40q2 1.5 4 0" />
        <Ellipse cx="21" cy="39" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Ellipse cx="43" cy="39" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Path d="M14 36a5 5 0 0 1 3-4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function SportBasketball({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="32" cy="32" r="21" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M11 32h42M32 11v42M17.5 17c6 6.5 6 23.5 0 30m29-30c-6 6.5-6 23.5 0 30"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M20 22a14 14 0 0 1 5-5" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="32" cy="32" r="21" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="M11 32h42M32 11v42M17.5 17c6 6.5 6 23.5 0 30m29-30c-6 6.5-6 23.5 0 30" />
        <Path d="M20 22a14 14 0 0 1 5-5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function SportBicycle({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="17" cy="42" r="10" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="47" cy="42" r="10" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="m17 42 9-15h14l7 15M26 27l7 15H17m23-15-3-7h-6m-9 1h7"
            fill="none"
            stroke={outline}
            strokeWidth="9"
          />
          <Circle cx="33" cy="42" r="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="17" cy="42" r="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="47" cy="42" r="2" fill={outline} stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="17" cy="42" r="10" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="47" cy="42" r="10" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path
          d="m17 42 9-15h14l7 15M26 27l7 15H17m23-15-3-7h-6m-9 1h7"
          stroke={mono ? '#B5B1B3' : '#EE8A5E'}
          strokeWidth="3"
        />
        <Circle cx="33" cy="42" r="3" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="17" cy="42" r="2" fill={mono ? '#545052' : '#3F2A33'} />
        <Circle cx="47" cy="42" r="2" fill={mono ? '#545052' : '#3F2A33'} />
      </G>
    </Svg>
  );
}

function SportDumbbell({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="22" y="28.5" width="20" height="7" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="7" y="23" width="8" height="18" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="15" y="17" width="8" height="30" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="41" y="17" width="8" height="30" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="49" y="23" width="8" height="18" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M19 22v6m26-6v6" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="22" y="28.5" width="20" height="7" rx="2" fill={mono ? '#B9B5B7' : '#B3A2AA'} />
        <Rect x="7" y="23" width="8" height="18" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Rect x="15" y="17" width="8" height="30" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Rect x="41" y="17" width="8" height="30" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Rect x="49" y="23" width="8" height="18" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="M19 22v6m26-6v6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function SportFootprints({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M21 30c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="14.5" cy="25" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="19" cy="21.5" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="24" cy="22" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M43 18c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Circle cx="36.5" cy="13" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="41" cy="9.5" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="46" cy="10" r="2.6" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M18 36v4m22-16v4" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M21 30c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="14.5" cy="25" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="19" cy="21.5" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="24" cy="22" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="M43 18c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="36.5" cy="13" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="41" cy="9.5" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Circle cx="46" cy="10" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="M18 36v4m22-16v4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function SportSneaker({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M8 43.5h47a4 4 0 0 1 0 8H12a4 4 0 0 1-4-4z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M10 43.5V28a4 4 0 0 1 4-4h7l7 7 10 2.5c8 2 14 5 16 10z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m25 31.5 3-3m2 4.5 3-3m2 4.5 2.5-2.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M14 37h12" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M8 43.5h47a4 4 0 0 1 0 8H12a4 4 0 0 1-4-4z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M10 43.5V28a4 4 0 0 1 4-4h7l7 7 10 2.5c8 2 14 5 16 10z" fill={mono ? '#D0CCCE' : '#FFB088'} />
        <Path d="m25 31.5 3-3m2 4.5 3-3m2 4.5 2.5-2.5" />
        <Path d="M14 37h12" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function StudyBook({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M8 19v32c8-3 18-3 24 1.5C38 48 48 48 56 51V19" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 18c-6-4-16-4-22-1.5v30C16 44 26 44 32 48z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 18c6-4 16-4 22-1.5v30C48 44 38 44 32 48z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 18v30" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M15 25c4-1 9-1 12 .5M15 31c4-1 9-1 12 .5m10-6c3-1.5 8-1.5 12-.5m-12 6.5c3-1.5 8-1.5 12-.5"
            fill="none"
            stroke={outline}
            strokeWidth="8"
          />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M8 19v32c8-3 18-3 24 1.5C38 48 48 48 56 51V19" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M32 18c-6-4-16-4-22-1.5v30C16 44 26 44 32 48z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M32 18c6-4 16-4 22-1.5v30C48 44 38 44 32 48z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M32 18v30" />
        <Path
          d="M15 25c4-1 9-1 12 .5M15 31c4-1 9-1 12 .5m10-6c3-1.5 8-1.5 12-.5m-12 6.5c3-1.5 8-1.5 12-.5"
          strokeWidth="2"
        />
      </G>
    </Svg>
  );
}

function StudyDiary({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M38 50v9l3.5-2.5L45 59v-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="16" y="8" width="32" height="44" rx="4" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M22 8v44" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="28" y="18" width="14" height="9" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M31 22.5h8" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M27 36c2-3 6-3 8 0" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M38 50v9l3.5-2.5L45 59v-9z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Rect x="16" y="8" width="32" height="44" rx="4" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M22 8v44" />
        <Rect x="28" y="18" width="14" height="9" rx="2" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M31 22.5h8" />
        <Path d="M27 36c2-3 6-3 8 0" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function StudyHeadphones({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M13 40v-6a19 19 0 0 1 38 0v6" fill="none" stroke={outline} strokeWidth="9.5" />
          <Rect x="9" y="36" width="12" height="18" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="43" y="36" width="12" height="18" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M13 41v6m34-6v6" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M13 40v-6a19 19 0 0 1 38 0v6" strokeWidth="3.5" />
        <Rect x="9" y="36" width="12" height="18" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Rect x="43" y="36" width="12" height="18" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M13 41v6m34-6v6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" opacity=".8" />
      </G>
    </Svg>
  );
}

function StudyLaptop({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="13" y="13" width="38" height="28" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="17.5" y="17.5" width="29" height="19" rx="1.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M7 49h50l-5-8H12z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M28 23.5 24 27l4 3.5m8-7 4 3.5-4 3.5" fill="none" stroke={outline} strokeWidth="8.5" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="13" y="13" width="38" height="28" rx="3" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Rect x="17.5" y="17.5" width="29" height="19" rx="1.5" fill={mono ? '#F6F2F4' : '#E3F3FF'} />
        <Path d="M7 49h50l-5-8H12z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M28 23.5 24 27l4 3.5m8-7 4 3.5-4 3.5" />
      </G>
    </Svg>
  );
}

function StudyWordCard({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="22" y="8" width="32" height="40" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="10" y="16" width="32" height="40" rx="5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m19 45 7-18 7 18m-11.2-6.5h8.4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M15 22h6" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="22" y="8" width="32" height="40" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Rect x="10" y="16" width="32" height="40" rx="5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="m19 45 7-18 7 18m-11.2-6.5h8.4" />
        <Path d="M15 22h6" stroke={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="3" />
      </G>
    </Svg>
  );
}

export const projectIcons = {
  'collect/balloon': CollectBalloon,
  'collect/clover': CollectClover,
  'collect/crown': CollectCrown,
  'collect/flower': CollectFlower,
  'collect/heart': CollectHeart,
  'collect/rainbow': CollectRainbow,
  'collect/rocket': CollectRocket,
  'collect/star': CollectStar,
  'habit/briefcase': HabitBriefcase,
  'habit/coffee-off': HabitCoffeeOff,
  'habit/owl': HabitOwl,
  'habit/phone-off': HabitPhoneOff,
  'health/alarm': HealthAlarm,
  'health/apple': HealthApple,
  'health/milk': HealthMilk,
  'health/moon': HealthMoon,
  'health/pill': HealthPill,
  'health/sun': HealthSun,
  'health/water-cup': HealthWaterCup,
  'hobby/camera': HobbyCamera,
  'hobby/cupcake': HobbyCupcake,
  'hobby/music-disc': HobbyMusicDisc,
  'hobby/palette': HobbyPalette,
  'hobby/potted-plant': HobbyPottedPlant,
  'life/broom': LifeBroom,
  'life/cat-bowl': LifeCatBowl,
  'life/pan': LifePan,
  'life/piggy-bank': LifePiggyBank,
  'life/watering-can': LifeWateringCan,
  'mind/lotus': MindLotus,
  'mind/love-letter': MindLoveLetter,
  'mind/smile-sun': MindSmileSun,
  'mind/soft-cloud': MindSoftCloud,
  'sport/basketball': SportBasketball,
  'sport/bicycle': SportBicycle,
  'sport/dumbbell': SportDumbbell,
  'sport/footprints': SportFootprints,
  'sport/sneaker': SportSneaker,
  'study/book': StudyBook,
  'study/diary': StudyDiary,
  'study/headphones': StudyHeadphones,
  'study/laptop': StudyLaptop,
  'study/word-card': StudyWordCard,
} as const;

export type ProjectIconId = keyof typeof projectIcons;

export const projectIconCategories = [
  {
    id: 'health',
    name: '健康作息',
    color: 'soda',
  },
  {
    id: 'sport',
    name: '运动健身',
    color: 'peach',
  },
  {
    id: 'study',
    name: '学习成长',
    color: 'lemon',
  },
  {
    id: 'hobby',
    name: '兴趣爱好',
    color: 'grape',
  },
  {
    id: 'life',
    name: '生活日常',
    color: 'matcha',
  },
  {
    id: 'mind',
    name: '心灵花园',
    color: 'mint',
  },
  {
    id: 'habit',
    name: '自律戒除',
    color: 'blueberry',
  },
  {
    id: 'collect',
    name: '收集闪光',
    color: 'strawberry',
  },
] as const;

export const projectIconRegistry: readonly {
  id: ProjectIconId;
  category: string;
  name: string;
  keywords: readonly string[];
}[] = [
  { id: 'collect/balloon', category: 'collect', name: '气球', keywords: ['庆祝', '生日', '飞'] },
  { id: 'collect/clover', category: 'collect', name: '四叶草', keywords: ['幸运', '叶子', '草'] },
  { id: 'collect/crown', category: 'collect', name: '皇冠', keywords: ['王冠', '第一', '最棒'] },
  { id: 'collect/flower', category: 'collect', name: '小花', keywords: ['花', '默认', '开心'] },
  { id: 'collect/heart', category: 'collect', name: '爱心', keywords: ['心', '爱', '喜欢'] },
  { id: 'collect/rainbow', category: 'collect', name: '彩虹', keywords: ['雨后', '开心', '颜色'] },
  { id: 'collect/rocket', category: 'collect', name: '火箭', keywords: ['冲', '飞', '目标'] },
  { id: 'collect/star', category: 'collect', name: '星星', keywords: ['星', '闪光', '夸夸'] },
  { id: 'habit/briefcase', category: 'habit', name: '按时下班', keywords: ['公文包', '工作', '下班'] },
  { id: 'habit/coffee-off', category: 'habit', name: '戒咖啡', keywords: ['咖啡', '戒', '提神'] },
  { id: 'habit/owl', category: 'habit', name: '不熬夜', keywords: ['猫头鹰', '熬夜', '晚睡'] },
  { id: 'habit/phone-off', category: 'habit', name: '少玩手机', keywords: ['手机', '屏幕', '戒'] },
  { id: 'health/alarm', category: 'health', name: '早起', keywords: ['闹钟', '起床', '早上'] },
  { id: 'health/apple', category: 'health', name: '吃水果', keywords: ['苹果', '水果', '健康'] },
  { id: 'health/milk', category: 'health', name: '喝牛奶', keywords: ['牛奶', '早餐', '补钙'] },
  { id: 'health/moon', category: 'health', name: '早睡', keywords: ['睡觉', '月亮', '晚安', '熬夜'] },
  { id: 'health/pill', category: 'health', name: '吃维生素', keywords: ['药', '维生素', '保健'] },
  { id: 'health/sun', category: 'health', name: '晒太阳', keywords: ['太阳', '户外', '阳光'] },
  { id: 'health/water-cup', category: 'health', name: '喝水', keywords: ['水', '杯子', '饮水'] },
  { id: 'hobby/camera', category: 'hobby', name: '摄影', keywords: ['相机', '拍照', '照片'] },
  { id: 'hobby/cupcake', category: 'hobby', name: '烘焙', keywords: ['蛋糕', '甜点', '做饭'] },
  { id: 'hobby/music-disc', category: 'hobby', name: '听音乐', keywords: ['唱片', '音乐', '歌'] },
  { id: 'hobby/palette', category: 'hobby', name: '画画', keywords: ['调色盘', '绘画', '美术'] },
  { id: 'hobby/potted-plant', category: 'hobby', name: '养绿植', keywords: ['盆栽', '植物', '花草'] },
  { id: 'life/broom', category: 'life', name: '整理房间', keywords: ['扫把', '打扫', '收拾'] },
  { id: 'life/cat-bowl', category: 'life', name: '喂猫', keywords: ['猫', '宠物', '猫粮'] },
  { id: 'life/pan', category: 'life', name: '做饭', keywords: ['平底锅', '厨房', '煎蛋'] },
  { id: 'life/piggy-bank', category: 'life', name: '存钱', keywords: ['储蓄罐', '省钱', '理财'] },
  { id: 'life/watering-can', category: 'life', name: '浇花', keywords: ['洒水壶', '植物', '绿植'] },
  { id: 'mind/lotus', category: 'mind', name: '冥想', keywords: ['莲花', '放松', '呼吸'] },
  { id: 'mind/love-letter', category: 'mind', name: '感恩', keywords: ['信', '谢谢', '爱心'] },
  { id: 'mind/smile-sun', category: 'mind', name: '好心情', keywords: ['微笑', '太阳', '开心'] },
  { id: 'mind/soft-cloud', category: 'mind', name: '不发脾气', keywords: ['云', '温柔', '情绪'] },
  { id: 'sport/basketball', category: 'sport', name: '篮球', keywords: ['球', '投篮', '运动'] },
  { id: 'sport/bicycle', category: 'sport', name: '骑行', keywords: ['自行车', '单车', '运动'] },
  { id: 'sport/dumbbell', category: 'sport', name: '力量训练', keywords: ['哑铃', '健身', '运动', '撸铁'] },
  { id: 'sport/footprints', category: 'sport', name: '散步', keywords: ['脚印', '走路', '步数'] },
  { id: 'sport/sneaker', category: 'sport', name: '跑步', keywords: ['跑鞋', '运动', '健身'] },
  { id: 'study/book', category: 'study', name: '读书', keywords: ['书', '阅读', '学习'] },
  { id: 'study/diary', category: 'study', name: '写日记', keywords: ['日记', '本子', '记录'] },
  { id: 'study/headphones', category: 'study', name: '听播客', keywords: ['耳机', '听力', '播客'] },
  { id: 'study/laptop', category: 'study', name: '编程', keywords: ['电脑', '代码', '工作'] },
  { id: 'study/word-card', category: 'study', name: '背单词', keywords: ['单词', '英语', '卡片', '外语'] },
];
