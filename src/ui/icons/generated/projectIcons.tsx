/**
 * 此文件由 scripts/svg-build.ts 根据 assets/svg 生成，请勿手改。
 */
import type { ComponentType, ReactNode } from 'react';
import Svg, { Path, Circle, Rect, Ellipse, G } from 'react-native-svg';

export interface IconPartProps {
  /** data-part 的名字，如 leaf、star */
  name: string;
  /** 旋转、缩放中心（data-origin，画板坐标） */
  originX: number;
  originY: number;
  children: ReactNode;
}

export type IconPartComponent = ComponentType<IconPartProps>;

function StaticPart({ children }: IconPartProps) {
  return <G>{children}</G>;
}

export interface ProjectIconProps {
  size?: number;
  /** 贴纸外描边颜色；不传则不画外描边 */
  outline?: string;
  /** 灰度显示（暂停、禁用） */
  mono?: boolean;
  /** 可动部件的渲染组件；不传时部件静止。正常层和外描边层各渲染一次 */
  part?: IconPartComponent;
}

function CollectBalloon({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M32 50c-3.5 3.5 3.5 5.5 0 9" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="balloon" originX={32} originY={49}>
            <Path d="M25 33.5c2.5 3 6 4.5 10 4" fill="none" stroke={outline} strokeWidth="7.6" />
            <Path
              d="M32 7c9.5 0 17 7.5 17 17 0 11.5-9.5 20.5-17 22.5-7.5-2-17-11-17-22.5 0-9.5 7.5-17 17-17"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M29 46.5h6L32 50z" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M21.5 19.5A11.5 11.5 0 0 1 28 12" fill="none" stroke={outline} strokeWidth="9" />
          </P>
          <P name="sparkle-a" originX={11} originY={12}>
            <Path
              d="M11 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={52} originY={45}>
            <Path
              d="M52 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 50c-3.5 3.5 3.5 5.5 0 9" />
        <P name="balloon" originX={32} originY={49}>
          <Path
            d="M32 7c9.5 0 17 7.5 17 17 0 11.5-9.5 20.5-17 22.5-7.5-2-17-11-17-22.5 0-9.5 7.5-17 17-17"
            fill={mono ? '#C4C0C2' : '#FF8FB8'}
            stroke="none"
          />
          <Path
            d="M38 8.2c6.5 2.3 11 8.6 11 15.8 0 11.5-9.5 20.5-17 22.5 8-6 12-23 6-38.3"
            fill={mono ? '#A7A3A5' : '#E8669A'}
            stroke="none"
          />
          <Path d="M25 33.5c2.5 3 6 4.5 10 4" stroke={mono ? '#F5F1F3' : '#FFE6F0'} strokeWidth="1.6" opacity=".7" />
          <Path d="M32 7c9.5 0 17 7.5 17 17 0 11.5-9.5 20.5-17 22.5-7.5-2-17-11-17-22.5 0-9.5 7.5-17 17-17" />
          <Path d="M29 46.5h6L32 50z" fill={mono ? '#A7A3A5' : '#E8669A'} strokeWidth="2" />
          <Path d="M21.5 19.5A11.5 11.5 0 0 1 28 12" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
          <Circle cx="20.8" cy="25" r="1.4" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={11} originY={12}>
          <Path
            d="M11 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={52} originY={45}>
          <Path
            d="M52 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectClover({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M33 35c3 8 4 14 10 21" fill="none" stroke={outline} strokeWidth="12" />
          <Path d="M33 35c3 8 4 14 10 21" fill="none" stroke={outline} strokeWidth="9" />
          <P name="leaf" originX={33} originY={35}>
            <Path
              d="M30.5 28.5 26 24m9.5 4.5L40 24m-9.5 9.5L26 38m9.5-4.5L40 38"
              fill="none"
              stroke={outline}
              strokeWidth="7.6"
            />
            <Circle cx="24" cy="22" r="8.5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Circle cx="42" cy="22" r="8.5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Circle cx="24" cy="40" r="8.5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Circle cx="42" cy="40" r="8.5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Circle cx="33" cy="31" r="3.5" fill={outline} stroke={outline} strokeWidth="8" />
          </P>
          <P name="sparkle-a" originX={53} originY={50}>
            <Path
              d="M53 47c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={54}>
            <Path
              d="M11 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M33 35c3 8 4 14 10 21" strokeWidth="6" />
        <Path d="M33 35c3 8 4 14 10 21" stroke={mono ? '#CECACC' : '#A8DB7E'} strokeWidth="3" />
        <P name="leaf" originX={33} originY={35}>
          <Circle cx="24" cy="22" r="8.5" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Circle cx="42" cy="22" r="8.5" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Circle cx="24" cy="40" r="8.5" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Circle cx="42" cy="40" r="8.5" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Path
            d="M30 16a8.5 8.5 0 0 1-12 12 10 10 0 0 0 12-12m18 0a8.5 8.5 0 0 1-12 12 10 10 0 0 0 12-12M30 34a8.5 8.5 0 0 1-12 12 10 10 0 0 0 12-12m18 0a8.5 8.5 0 0 1-12 12 10 10 0 0 0 12-12"
            fill={mono ? '#B1ADAF' : '#7FBF52'}
            stroke="none"
          />
          <Path
            d="M30.5 28.5 26 24m9.5 4.5L40 24m-9.5 9.5L26 38m9.5-4.5L40 38"
            stroke={mono ? '#B1ADAF' : '#7FBF52'}
            strokeWidth="1.6"
          />
          <Circle cx="24" cy="22" r="8.5" />
          <Circle cx="42" cy="22" r="8.5" />
          <Circle cx="24" cy="40" r="8.5" />
          <Circle cx="42" cy="40" r="8.5" />
          <Circle cx="33" cy="31" r="3.5" fill={mono ? '#B1ADAF' : '#7FBF52'} strokeWidth="2" />
          <Ellipse
            cx="20.5"
            cy="18.5"
            rx="2.4"
            ry="1.4"
            transform="rotate(-40 20.5 18.5)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".85"
          />
          <Circle cx="19" cy="23.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={53} originY={50}>
          <Path
            d="M53 47c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={54}>
          <Path
            d="M11 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectCrown({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m10 24 10 10 12-16 12 16 10-10-3.5 26h-37z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M12.4 42h39.2" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="22" cy="46" r="2.3" fill={outline} stroke={outline} strokeWidth="7.8" />
          <Circle cx="32" cy="46" r="2.3" fill={outline} stroke={outline} strokeWidth="7.8" />
          <Circle cx="42" cy="46" r="2.3" fill={outline} stroke={outline} strokeWidth="7.8" />
          <Path d="m32 26.5 4 5-4 5-4-5z" fill={outline} stroke={outline} strokeWidth="8" />
          <Path d="m30.8 30.2 1.2-1.5" fill="none" stroke={outline} strokeWidth="7.2" />
          <Circle cx="10" cy="21" r="3" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="32" cy="15" r="3" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="54" cy="21" r="3" fill={outline} stroke={outline} strokeWidth="8" />
          <Path d="m15 31.5 3.5 3.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="sparkle-a" originX={51} originY={10}>
            <Path
              d="M51 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
          <P name="sparkle-b" originX={7} originY={45}>
            <Path
              d="M7 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m10 24 10 10 12-16 12 16 10-10-3.5 26h-37z" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="m44 34 10-10-3.5 26H42z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Path d="M12.4 42h39.2l-1.1 8h-37z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Path d="m10 24 10 10 12-16 12 16 10-10-3.5 26h-37z" />
        <Path d="M12.4 42h39.2" />
        <Circle cx="22" cy="46" r="2.3" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="1.8" />
        <Circle cx="32" cy="46" r="2.3" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="1.8" />
        <Circle cx="42" cy="46" r="2.3" fill={mono ? '#CBC7C9' : '#7EDCC2'} strokeWidth="1.8" />
        <Path d="m32 26.5 4 5-4 5-4-5z" fill={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="2" />
        <Path d="m30.8 30.2 1.2-1.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.2" />
        <Circle cx="10" cy="21" r="3" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="2" />
        <Circle cx="32" cy="15" r="3" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="2" />
        <Circle cx="54" cy="21" r="3" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="2" />
        <Path d="m15 31.5 3.5 3.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="15" cy="38.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle-a" originX={51} originY={10}>
          <Path
            d="M51 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
        <P name="sparkle-b" originX={7} originY={45}>
          <Path
            d="M7 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectFlower({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M32 31v27" fill="none" stroke={outline} strokeWidth="12" />
          <Path d="M32 31v27" fill="none" stroke={outline} strokeWidth="9" />
          <P name="leaf-left" originX={32} originY={53}>
            <Path d="M32 53c-1-6-6-9-12-8 1 6 6 9 12 8" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="M20 45c4 2 8 5 12 8" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="leaf-right" originX={32} originY={49}>
            <Path d="M32 49c1-6 6-9 12-8-1 6-6 9-12 8" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="M44 41c-4 2-8 5-12 8" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="head" originX={32} originY={31}>
            <Circle cx="32" cy="13" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="41.5" cy="19.9" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="37.9" cy="31.1" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="26.1" cy="31.1" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="22.5" cy="19.9" r="7.5" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="32" cy="23" r="6.5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M31 25.2c.6.6 1.4.6 2 0" fill="none" stroke={outline} strokeWidth="7.4" />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M32 31v27" strokeWidth="6" />
        <Path d="M32 31v27" stroke={mono ? '#CECACC' : '#A8DB7E'} strokeWidth="3" />
        <P name="leaf-left" originX={32} originY={53}>
          <Path d="M32 53c-1-6-6-9-12-8 1 6 6 9 12 8" fill={mono ? '#CECACC' : '#A8DB7E'} />
          <Path d="M20 45c4 2 8 5 12 8" stroke={mono ? '#B1ADAF' : '#7FBF52'} strokeWidth="1.5" />
        </P>
        <P name="leaf-right" originX={32} originY={49}>
          <Path d="M32 49c1-6 6-9 12-8-1 6-6 9-12 8" fill={mono ? '#CECACC' : '#A8DB7E'} />
          <Path d="M44 41c-4 2-8 5-12 8" stroke={mono ? '#B1ADAF' : '#7FBF52'} strokeWidth="1.5" />
        </P>
        <P name="head" originX={32} originY={31}>
          <Circle cx="32" cy="13" r="7.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
          <Circle cx="41.5" cy="19.9" r="7.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
          <Circle cx="37.9" cy="31.1" r="7.5" fill={mono ? '#A7A3A5' : '#E8669A'} />
          <Circle cx="26.1" cy="31.1" r="7.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
          <Circle cx="22.5" cy="19.9" r="7.5" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
          <Circle cx="32" cy="23" r="6.5" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
          <Path
            d="M36.6 18.4a6.5 6.5 0 0 1-9.2 9.2 7.8 7.8 0 0 0 9.2-9.2"
            fill={mono ? '#C6C2C4' : '#EBB53B'}
            stroke="none"
          />
          <Circle cx="32" cy="23" r="6.5" />
          <Circle cx="29.6" cy="22.3" r="1.1" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Circle cx="34.4" cy="22.3" r="1.1" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Path d="M31 25.2c.6.6 1.4.6 2 0" strokeWidth="1.4" />
          <Ellipse
            cx="29"
            cy="10.5"
            rx="2.4"
            ry="1.4"
            transform="rotate(-25 29 10.5)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".85"
          />
          <Circle cx="19" cy="18.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
      </G>
    </Svg>
  );
}

function CollectHeart({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="heart" originX={32} originY={52}>
            <Path
              d="M32 52C14 40.5 8.5 30.5 12 21.5S26.5 12 32 20c5.5-8 16.5-7.5 20 1.5s-2 19-20 30.5"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M29.5 34.5c1.4 1.5 3.6 1.5 5 0" fill="none" stroke={outline} strokeWidth="7.8" />
          </P>
          <P name="sparkle-a" originX={53} originY={10}>
            <Path
              d="M53 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
          <P name="sparkle-b" originX={10} originY={47}>
            <Path
              d="M10 44c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="heart" originX={32} originY={52}>
          <Path
            d="M32 52C14 40.5 8.5 30.5 12 21.5S26.5 12 32 20c5.5-8 16.5-7.5 20 1.5s-2 19-20 30.5"
            fill={mono ? '#C4C0C2' : '#FF8FB8'}
            stroke="none"
          />
          <Path
            d="M44 13.5c4 .6 6.8 3.3 8 8 3.5 9-2 19-20 30.5 9-9 14-24 12-38.5"
            fill={mono ? '#A7A3A5' : '#E8669A'}
            stroke="none"
          />
          <Path d="M32 52C14 40.5 8.5 30.5 12 21.5S26.5 12 32 20c5.5-8 16.5-7.5 20 1.5s-2 19-20 30.5" />
          <Circle cx="25.5" cy="30" r="1.8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Circle cx="38.5" cy="30" r="1.8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Path d="M29.5 34.5c1.4 1.5 3.6 1.5 5 0" strokeWidth="1.8" />
          <Ellipse
            cx="22.5"
            cy="34.5"
            rx="2.2"
            ry="1.3"
            fill={mono ? '#F5F1F3' : '#FFE6F0'}
            stroke="none"
            opacity=".9"
          />
          <Ellipse
            cx="41.5"
            cy="34.5"
            rx="2.2"
            ry="1.3"
            fill={mono ? '#F5F1F3' : '#FFE6F0'}
            stroke="none"
            opacity=".9"
          />
          <Ellipse
            cx="19.5"
            cy="22"
            rx="3.6"
            ry="2"
            transform="rotate(-35 19.5 22)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".9"
          />
          <Circle cx="17" cy="28.5" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={53} originY={10}>
          <Path
            d="M53 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
        <P name="sparkle-b" originX={10} originY={47}>
          <Path
            d="M10 44c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectRainbow({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M6.3 39.5a24 24 0 0 1 48 0h-5.5a18.5 18.5 0 0 0-37 0z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path
            d="M11.8 39.5a18.5 18.5 0 0 1 37 0h-5.5a13 13 0 0 0-26 0z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path
            d="M17.3 39.5a13 13 0 0 1 26 0h-5.5a7.5 7.5 0 0 0-15 0z"
            fill={outline}
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M9.6 34.5a21.25 21.25 0 0 1 5.7-10" fill="none" stroke={outline} strokeWidth="8.2" />
          <P name="cloud-left" originX={10.3} originY={43.5}>
            <Path
              d="M2.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <P name="cloud-right" originX={50.3} originY={43.5}>
            <Path
              d="M42.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <P name="sparkle-a" originX={52} originY={14}>
            <Path
              d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={16}>
            <Path
              d="M11 13c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M6.3 39.5a24 24 0 0 1 48 0h-5.5a18.5 18.5 0 0 0-37 0z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path d="M11.8 39.5a18.5 18.5 0 0 1 37 0h-5.5a13 13 0 0 0-26 0z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M17.3 39.5a13 13 0 0 1 26 0h-5.5a7.5 7.5 0 0 0-15 0z" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Path d="M9.6 34.5a21.25 21.25 0 0 1 5.7-10" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <Circle cx="19.3" cy="22" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="cloud-left" originX={10.3} originY={43.5}>
          <Path
            d="M2.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
          />
          <Path
            d="M3.8 45.5h14a3.8 3.8 0 0 1-1.5 3h-11a3.2 3.2 0 0 1-1.5-3"
            fill={mono ? '#EAE6E8' : '#E9DFE3'}
            stroke="none"
          />
          <Path d="M2.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5" />
        </P>
        <P name="cloud-right" originX={50.3} originY={43.5}>
          <Path
            d="M42.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
          />
          <Path
            d="M43.8 45.5h14a3.8 3.8 0 0 1-1.5 3h-11a3.2 3.2 0 0 1-1.5-3"
            fill={mono ? '#EAE6E8' : '#E9DFE3'}
            stroke="none"
          />
          <Path d="M42.3 43.5a5 5 0 0 1 7-5 5 5 0 0 1 9 2 4 4 0 0 1-1 8h-12a4 4 0 0 1-3-5" />
        </P>
        <P name="sparkle-a" originX={52} originY={14}>
          <Path
            d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={16}>
          <Path
            d="M11 13c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectRocket({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="flame" originX={32} originY={46}>
            <Path
              d="M27.5 45c0 5.5 2.5 9 4.5 12.5 2-3.5 4.5-7 4.5-12.5z"
              fill={outline}
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <Path d="M22.5 31 14 41.5l8.8 1.5z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M41.5 31 50 41.5 41.2 43z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 7c9 6 13 17 10 35H22c-3-18 1-29 10-35" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M25.8 15.5h12.4" fill="none" stroke={outline} strokeWidth="8" />
          <Circle cx="32" cy="26" r="5.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="25.5" y="42" width="13" height="4" rx="1.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <P name="sparkle-a" originX={52} originY={14}>
            <Path
              d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={12} originY={22}>
            <Path
              d="M12 19c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="flame" originX={32} originY={46}>
          <Path d="M27.5 45c0 5.5 2.5 9 4.5 12.5 2-3.5 4.5-7 4.5-12.5z" fill={mono ? '#D0CCCE' : '#FFB088'} />
          <Path d="M30 45c0 3.5 1 6 2 8 1-2 2-4.5 2-8z" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        </P>
        <Path d="M22.5 31 14 41.5l8.8 1.5z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        <Path d="M41.5 31 50 41.5 41.2 43z" fill={mono ? '#A7A3A5' : '#E8669A'} />
        <Path d="M32 7c9 6 13 17 10 35H22c-3-18 1-29 10-35" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="M32 7c9 6 13 17 10 35h-5c2.5-15 1-27-5-35" fill={mono ? '#EAE6E8' : '#E9DFE3'} stroke="none" />
        <Path
          d="M25.8 15.5c1.6-3.4 3.6-6.2 6.2-8.5 2.6 2.3 4.6 5.1 6.2 8.5z"
          fill={mono ? '#C4C0C2' : '#FF8FB8'}
          stroke="none"
        />
        <Path d="M32 7c9 6 13 17 10 35H22c-3-18 1-29 10-35" />
        <Path d="M25.8 15.5h12.4" strokeWidth="2" />
        <Circle cx="32" cy="26" r="5.5" fill={mono ? '#CFCBCD' : '#8FD0FF'} stroke="none" />
        <Path
          d="M35.9 22.1a5.5 5.5 0 0 1-7.8 7.8 6.6 6.6 0 0 0 7.8-7.8"
          fill={mono ? '#B0ACAE' : '#5DAFEA'}
          stroke="none"
        />
        <Circle cx="32" cy="26" r="5.5" />
        <Circle cx="30.3" cy="24.3" r="1.3" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Rect x="25.5" y="42" width="13" height="4" rx="1.5" fill={mono ? '#B9B5B7' : '#B3A2AA'} />
        <P name="sparkle-a" originX={52} originY={14}>
          <Path
            d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={12} originY={22}>
          <Path
            d="M12 19c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function CollectStar({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="star" originX={32} originY={34}>
            <Path
              d="m32 12 5.9 13.9 15 1.3-11.4 9.9 3.4 14.7L32 44l-12.9 7.8 3.4-14.7-11.4-9.9 15-1.3z"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M30 37c1.2 1.3 2.8 1.3 4 0" fill="none" stroke={outline} strokeWidth="7.8" />
          </P>
          <P name="sparkle-a" originX={51} originY={14}>
            <Path
              d="M51 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={13} originY={45}>
            <Path
              d="M13 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="star" originX={32} originY={34}>
          <Path
            d="m32 12 5.9 13.9 15 1.3-11.4 9.9 3.4 14.7L32 44l-12.9 7.8 3.4-14.7-11.4-9.9 15-1.3z"
            fill={mono ? '#C6C2C4' : '#EBB53B'}
            stroke="none"
          />
          <Path
            d="m31.16 13.96 5.192 12.232 13.2 1.144-10.032 8.712 2.992 12.936L31.16 42.12l-11.352 6.864L22.8 36.048l-10.032-8.712 13.2-1.144z"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            stroke="none"
          />
          <Path d="m32 12 5.9 13.9 15 1.3-11.4 9.9 3.4 14.7L32 44l-12.9 7.8 3.4-14.7-11.4-9.9 15-1.3z" />
          <Circle cx="27.5" cy="33" r="1.7" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Circle cx="36.5" cy="33" r="1.7" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
          <Path d="M30 37c1.2 1.3 2.8 1.3 4 0" strokeWidth="1.8" />
          <Ellipse cx="26" cy="37.3" rx="1.8" ry="1.1" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" opacity=".8" />
          <Ellipse cx="38" cy="37.3" rx="1.8" ry="1.1" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" opacity=".8" />
          <Ellipse
            cx="22.5"
            cy="28.5"
            rx="2.6"
            ry="1.5"
            transform="rotate(-25 22.5 28.5)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".85"
          />
          <Circle cx="31" cy="21" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={51} originY={14}>
          <Path
            d="M51 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={13} originY={45}>
          <Path
            d="M13 42c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function HabitBriefcase({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M24 21v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="9" y="21" width="46" height="30" rx="6" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M9 34h46" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M14 26.5h5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="clasp" originX={32} originY={34}>
            <Rect x="27.5" y="30" width="9" height="8" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="M30 33h2" fill="none" stroke={outline} strokeWidth="7.6" />
          </P>
          <P name="sparkle-a" originX={52} originY={11}>
            <Path
              d="M52 6.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={12} originY={13}>
            <Path
              d="M12 10c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M24 21v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" />
        <Rect x="9" y="21" width="46" height="30" rx="6" fill={mono ? '#C2BEC0' : '#A3ADFF'} stroke="none" />
        <Path d="M44 21h5a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-5z" fill={mono ? '#A39FA1' : '#7A86EE'} stroke="none" />
        <Path d="M9 34h46v3H9z" fill={mono ? '#A39FA1' : '#7A86EE'} stroke="none" />
        <Rect x="9" y="21" width="46" height="30" rx="6" />
        <Path d="M9 34h46" />
        <Path d="M14 26.5h5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="22.5" cy="26.5" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="clasp" originX={32} originY={34}>
          <Rect x="27.5" y="30" width="9" height="8" rx="2" fill={mono ? '#E0DCDE' : '#FFD66B'} />
          <Path d="M30 33h2" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.6" />
        </P>
        <P name="sparkle-a" originX={52} originY={11}>
          <Path
            d="M52 6.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={12} originY={13}>
          <Path
            d="M12 10c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HabitCoffeeOff({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="steam" originX={25.5} originY={15}>
            <Path d="M21 11c-2 3 2 5 0 8m9-8c-2 3 2 5 0 8" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <Path d="M41 28h3a5.5 5.5 0 0 1 0 11h-3.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M11 24h30v12a13 13 0 0 1-13 13h-4a13 13 0 0 1-13-13z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M11 27.5h30" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="M16 31v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="badge" originX={46} originY={44}>
            <Circle cx="46" cy="44" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="m42.5 40.5 7 7m0-7-7 7" fill="none" stroke={outline} strokeWidth="9" />
          </P>
          <P name="sparkle-a" originX={52} originY={14}>
            <Path
              d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="steam" originX={25.5} originY={15}>
          <Path d="M21 11c-2 3 2 5 0 8m9-8c-2 3 2 5 0 8" stroke={mono ? '#B9B5B7' : '#B3A2AA'} />
        </P>
        <Path d="M41 28h3a5.5 5.5 0 0 1 0 11h-3.5" />
        <Path
          d="M11 24h30v12a13 13 0 0 1-13 13h-4a13 13 0 0 1-13-13z"
          fill={mono ? '#C2BEC0' : '#A3ADFF'}
          stroke="none"
        />
        <Path
          d="M35 24h6v12a13 13 0 0 1-9.5 12.5C34 45 35 41 35 36z"
          fill={mono ? '#A39FA1' : '#7A86EE'}
          stroke="none"
        />
        <Path d="M11 24h30v3.5H11z" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Path d="M11 24h30v12a13 13 0 0 1-13 13h-4a13 13 0 0 1-13-13z" />
        <Path d="M11 27.5h30" strokeWidth="2" />
        <Path d="M16 31v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="16" cy="40" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="badge" originX={46} originY={44}>
          <Circle cx="46" cy="44" r="9" fill={mono ? '#9B9799' : '#F2555A'} />
          <Path d="m42.5 40.5 7 7m0-7-7 7" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
        </P>
        <P name="sparkle-a" originX={52} originY={14}>
          <Path
            d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
      </G>
    </Svg>
  );
}

function HabitOwl({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m17 11.5 6 9.5m24-9.5L41 21" fill="none" stroke={outline} strokeWidth="9" />
          <Path d="M28.5 43.5 30 45l1.5-1.5m1 0L34 45l1.5-1.5" fill="none" stroke={outline} strokeWidth="7.5" />
          <Path
            d="M13 34c0-12 8.5-20 19-20s19 8 19 20-8.5 20-19 20-19-8-19-20"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M18.5 22.5A12 12 0 0 1 22 19" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="24.5" cy="31" r="7" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Circle cx="39.5" cy="31" r="7" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m29.5 38 2.5 3.5 2.5-3.5z" fill={outline} stroke={outline} strokeWidth="8" />
          <P name="wing-left" originX={15} originY={33}>
            <Path d="M14.5 33c4 1.5 6.5 6 6 11.5-4-1.5-6.5-6-6-11.5" fill={outline} stroke={outline} strokeWidth="8" />
          </P>
          <P name="wing-right" originX={49} originY={33}>
            <Path d="M49.5 33c-4 1.5-6.5 6-6 11.5 4-1.5 6.5-6 6-11.5" fill={outline} stroke={outline} strokeWidth="8" />
          </P>
          <P name="sparkle-a" originX={54} originY={12}>
            <Path
              d="M54 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={10} originY={15}>
            <Path
              d="M10 12c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m17 11.5 6 9.5m24-9.5L41 21" strokeWidth="3" />
        <Path
          d="M13 34c0-12 8.5-20 19-20s19 8 19 20-8.5 20-19 20-19-8-19-20"
          fill={mono ? '#C2BEC0' : '#A3ADFF'}
          stroke="none"
        />
        <Path
          d="M40 16c6.5 3 11 9.8 11 18 0 12-8.5 20-19 20-2.5 0-5-.5-7-1.3C38 52 45 44 45 33c0-7-2-12.5-5-17"
          fill={mono ? '#A39FA1' : '#7A86EE'}
          stroke="none"
        />
        <Ellipse cx="32" cy="45" rx="8.5" ry="5.5" fill={mono ? '#F4F0F2' : '#E9EBFF'} stroke="none" />
        <Path d="M28.5 43.5 30 45l1.5-1.5m1 0L34 45l1.5-1.5" stroke={mono ? '#C2BEC0' : '#A3ADFF'} strokeWidth="1.5" />
        <Path d="M13 34c0-12 8.5-20 19-20s19 8 19 20-8.5 20-19 20-19-8-19-20" />
        <Path d="M18.5 22.5A12 12 0 0 1 22 19" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="24.5" cy="31" r="7" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="39.5" cy="31" r="7" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Circle cx="25" cy="31.5" r="2.8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="40" cy="31.5" r="2.8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="26" cy="30.4" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="41" cy="30.4" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="m29.5 38 2.5 3.5 2.5-3.5z" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2" />
        <P name="wing-left" originX={15} originY={33}>
          <Path
            d="M14.5 33c4 1.5 6.5 6 6 11.5-4-1.5-6.5-6-6-11.5"
            fill={mono ? '#A39FA1' : '#7A86EE'}
            strokeWidth="2"
          />
        </P>
        <P name="wing-right" originX={49} originY={33}>
          <Path
            d="M49.5 33c-4 1.5-6.5 6-6 11.5 4-1.5 6.5-6 6-11.5"
            fill={mono ? '#C2BEC0' : '#A3ADFF'}
            strokeWidth="2"
          />
        </P>
        <P name="sparkle-a" originX={54} originY={12}>
          <Path
            d="M54 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={10} originY={15}>
          <Path
            d="M10 12c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HabitPhoneOff({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="13" y="9" width="24" height="42" rx="5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="17" y="14" width="16" height="27" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M19.8 17.5V21" fill="none" stroke={outline} strokeWidth="8.2" />
          <Path d="M19.8 26q1.8 1.6 3.6 0m3.2 0q1.8 1.6 3.6 0" fill="none" stroke={outline} strokeWidth="7.8" />
          <Path d="M24 31h2" fill="none" stroke={outline} strokeWidth="7.8" />
          <Path d="M22.5 11.5h5" fill="none" stroke={outline} strokeWidth="7.8" />
          <P name="badge" originX={43} originY={45}>
            <Circle cx="43" cy="45" r="9" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="m39.5 41.5 7 7m0-7-7 7" fill="none" stroke={outline} strokeWidth="9" />
          </P>
          <P name="sparkle-a" originX={51} originY={13}>
            <Path
              d="M51 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={7} originY={28}>
            <Path
              d="M7 25c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="13" y="9" width="24" height="42" rx="5" fill={mono ? '#C2BEC0' : '#A3ADFF'} stroke="none" />
        <Path d="M31 9h1a5 5 0 0 1 5 5v32a5 5 0 0 1-5 5h-1z" fill={mono ? '#A39FA1' : '#7A86EE'} stroke="none" />
        <Rect x="13" y="9" width="24" height="42" rx="5" />
        <Rect x="17" y="14" width="16" height="27" rx="2" fill={mono ? '#F4F0F2' : '#E9EBFF'} />
        <Path d="M19.8 17.5V21" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <Path d="M19.8 26q1.8 1.6 3.6 0m3.2 0q1.8 1.6 3.6 0" strokeWidth="1.8" />
        <Path d="M24 31h2" strokeWidth="1.8" />
        <Ellipse cx="20.5" cy="29.5" rx="1.6" ry="1" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Ellipse cx="29.5" cy="29.5" rx="1.6" ry="1" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Path d="M22.5 11.5h5" strokeWidth="1.8" />
        <Circle cx="25" cy="46" r="1.6" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <P name="badge" originX={43} originY={45}>
          <Circle cx="43" cy="45" r="9" fill={mono ? '#9B9799' : '#F2555A'} />
          <Path d="m39.5 41.5 7 7m0-7-7 7" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
        </P>
        <P name="sparkle-a" originX={51} originY={13}>
          <Path
            d="M51 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={7} originY={28}>
          <Path
            d="M7 25c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HealthAlarm({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m20 50-4 5m28-5 4 5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="bell-left" originX={18} originY={20}>
            <Path d="M11 21a9 9 0 0 1 12-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          </P>
          <P name="bell-right" originX={46} originY={20}>
            <Path d="M53 21a9 9 0 0 0-12-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          </P>
          <Circle cx="32" cy="14.5" r="2.2" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="32" cy="35" r="18" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="32" cy="35" r="12.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 25v2m10 8h-2m-8 10v-2m-10-8h2" fill="none" stroke={outline} strokeWidth="7.8" />
          <Path d="M32 28.5V35l4.5 3.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M17.4 29.7a15.5 15.5 0 0 1 6.9-8.1" fill="none" stroke={outline} strokeWidth="8.6" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m20 50-4 5m28-5 4 5" />
        <P name="bell-left" originX={18} originY={20}>
          <Path d="M11 21a9 9 0 0 1 12-9z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
          <Circle cx="14.6" cy="16.4" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="bell-right" originX={46} originY={20}>
          <Path d="M53 21a9 9 0 0 0-12-9z" fill={mono ? '#C6C2C4' : '#EBB53B'} />
        </P>
        <Circle cx="32" cy="14.5" r="2.2" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="2" />
        <Circle cx="32" cy="35" r="18" fill={mono ? '#CFCBCD' : '#8FD0FF'} stroke="none" />
        <Path
          d="M44.7 22.3a18 18 0 0 1-25.4 25.4 21 21 0 0 0 25.4-25.4"
          fill={mono ? '#B0ACAE' : '#5DAFEA'}
          stroke="none"
        />
        <Circle cx="32" cy="35" r="18" />
        <Circle cx="32" cy="35" r="12.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M32 25v2m10 8h-2m-8 10v-2m-10-8h2" stroke={mono ? '#B9B5B7' : '#B3A2AA'} strokeWidth="1.8" />
        <Path d="M32 28.5V35l4.5 3.5" />
        <Circle cx="32" cy="35" r="1.5" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Path d="M17.4 29.7a15.5 15.5 0 0 1 6.9-8.1" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.6" />
        <Circle cx="16.7" cy="36.2" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
      </G>
    </Svg>
  );
}

function HealthApple({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 21c-6-5-20-4-20 12 0 13.5 10 23.5 20 19.5 10 4 20-6 20-19.5 0-16-14-17-20-12"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M32 21c0-5 1-9 4-11.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="leaf" originX={35} originY={15}>
            <Path
              d="M34.5 15c3.5-6 11-5.5 12.5-2.5C43.5 17 37.5 18 34.5 15"
              fill={outline}
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M35.5 14.6c3.5-1.2 7-2 11.2-2.1" fill="none" stroke={outline} strokeWidth="7.4" />
          </P>
          <Path d="M30 39c1.2 1.3 2.8 1.3 4 0" fill="none" stroke={outline} strokeWidth="7.8" />
          <P name="sparkle" originX={13} originY={13}>
            <Path
              d="M13 10c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
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
          stroke="none"
        />
        <Path
          d="M42 18.5c6 1.5 10 6 10 14.5 0 13.5-10 23.5-20 19.5 8-5 14-17 10-34"
          fill={mono ? '#A09C9E' : '#E86464'}
          stroke="none"
        />
        <Path d="M32 21c-6-5-20-4-20 12 0 13.5 10 23.5 20 19.5 10 4 20-6 20-19.5 0-16-14-17-20-12" />
        <Path d="M32 21c0-5 1-9 4-11.5" />
        <P name="leaf" originX={35} originY={15}>
          <Path d="M34.5 15c3.5-6 11-5.5 12.5-2.5C43.5 17 37.5 18 34.5 15" fill={mono ? '#CECACC' : '#A8DB7E'} />
          <Path d="M35.5 14.6c3.5-1.2 7-2 11.2-2.1" stroke={mono ? '#B1ADAF' : '#7FBF52'} strokeWidth="1.4" />
        </P>
        <Circle cx="26.5" cy="35" r="1.7" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="37.5" cy="35" r="1.7" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Path d="M30 39c1.2 1.3 2.8 1.3 4 0" strokeWidth="1.8" />
        <Ellipse cx="23.5" cy="39.5" rx="2" ry="1.2" fill={mono ? '#F4F0F2' : '#FFE5E3'} stroke="none" opacity=".9" />
        <Ellipse cx="40.5" cy="39.5" rx="2" ry="1.2" fill={mono ? '#F4F0F2' : '#FFE5E3'} stroke="none" opacity=".9" />
        <Ellipse
          cx="19"
          cy="28.5"
          rx="2.2"
          ry="3.8"
          transform="rotate(25 19 28.5)"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
          opacity=".85"
        />
        <Circle cx="18.2" cy="36" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle" originX={13} originY={13}>
          <Path
            d="M13 10c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function HealthMilk({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="m26.2 24 5-10h14l5 10v30a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M26.2 24h24m-24 10h24" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="33.2" y="8" width="10" height="6" rx="1.5" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M29.7 38.5V43" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="drop" originX={17.2} originY={28}>
            <Path
              d="M17.2 21.5c-2.5 3.2-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0c0-1.5-1-3.3-3.5-6.5"
              fill={outline}
              stroke={outline}
              strokeWidth="8"
            />
            <Path d="M18.4 29.4a1.6 1.6 0 0 1-1.2.6" fill="none" stroke={outline} strokeWidth="7.2" />
          </P>
          <P name="sparkle" originX={52} originY={14}>
            <Path
              d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
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
          d="m26.2 24 5-10h14l5 10v30a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2z"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
        />
        <Path d="M31.2 14h14l5 10h-24z" fill={mono ? '#F6F2F4' : '#E3F3FF'} stroke="none" />
        <Path d="M44.2 24h6v30a2 2 0 0 1-2 2h-4z" fill={mono ? '#EAE6E8' : '#E9DFE3'} stroke="none" />
        <Path d="M26.2 34h24v20a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2z" fill={mono ? '#CFCBCD' : '#8FD0FF'} stroke="none" />
        <Path d="M44.2 34h6v20a2 2 0 0 1-2 2h-4z" fill={mono ? '#B0ACAE' : '#5DAFEA'} stroke="none" />
        <Path
          d="M38.2 44.6c-1-1.6-3.6-1-3.6 1 0 1.8 3.6 4 3.6 4s3.6-2.2 3.6-4c0-2-2.6-2.6-3.6-1"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          stroke="none"
        />
        <Path d="m26.2 24 5-10h14l5 10v30a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2z" />
        <Path d="M26.2 24h24m-24 10h24" />
        <Rect x="33.2" y="8" width="10" height="6" rx="1.5" fill={mono ? '#CFCBCD' : '#8FD0FF'} />
        <Path d="M29.7 38.5V43" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="29.7" cy="47" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="drop" originX={17.2} originY={28}>
          <Path
            d="M17.2 21.5c-2.5 3.2-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0c0-1.5-1-3.3-3.5-6.5"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            strokeWidth="2"
          />
          <Path d="M18.4 29.4a1.6 1.6 0 0 1-1.2.6" stroke={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="1.2" />
        </P>
        <P name="sparkle" originX={52} originY={14}>
          <Path
            d="M52 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
      </G>
    </Svg>
  );
}

function HealthMoon({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="moon" originX={30} originY={32}>
            <Path d="M42 11a22 22 0 1 0 12 30 18 18 0 0 1-12-30" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M19.5 32.5q2 1.8 4 0m4.5 1q2 1.8 4 0" fill="none" stroke={outline} strokeWidth="7.8" />
            <Path d="M24.5 39.5q1.5 1.2 3 0" fill="none" stroke={outline} strokeWidth="7.6" />
          </P>
          <P name="sparkle-a" originX={50} originY={14}>
            <Path
              d="M50 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={57} originY={30}>
            <Path
              d="M57 27c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
          <P name="cloud" originX={46} originY={54}>
            <Path
              d="M40 54a4 4 0 0 1 5.5-4 4 4 0 0 1 7.5 1.5 3.2 3.2 0 0 1-.8 6.5h-9.7a3 3 0 0 1-2.5-4"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="moon" originX={30} originY={32}>
          <Path d="M42 11a22 22 0 1 0 12 30 18 18 0 0 1-12-30" fill={mono ? '#C2BEC0' : '#A3ADFF'} stroke="none" />
          <Path
            d="M49.6 47.1a22 22 0 0 1-31.2 0 26 26 0 0 0 31.2 0"
            fill={mono ? '#A39FA1' : '#7A86EE'}
            stroke="none"
          />
          <Path d="M42 11a22 22 0 1 0 12 30 18 18 0 0 1-12-30" />
          <Path d="M19.5 32.5q2 1.8 4 0m4.5 1q2 1.8 4 0" strokeWidth="1.8" />
          <Path d="M24.5 39.5q1.5 1.2 3 0" strokeWidth="1.6" />
          <Ellipse cx="18.5" cy="37" rx="2.2" ry="1.3" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" opacity=".8" />
          <Ellipse cx="33" cy="38.5" rx="2.2" ry="1.3" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" opacity=".8" />
          <Ellipse
            cx="20"
            cy="21.5"
            rx="3.2"
            ry="1.8"
            transform="rotate(-40 20 21.5)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".85"
          />
          <Circle cx="15.2" cy="27.5" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={50} originY={14}>
          <Path
            d="M50 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={57} originY={30}>
          <Path
            d="M57 27c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
        <P name="cloud" originX={46} originY={54}>
          <Path
            d="M40 54a4 4 0 0 1 5.5-4 4 4 0 0 1 7.5 1.5 3.2 3.2 0 0 1-.8 6.5h-9.7a3 3 0 0 1-2.5-4"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
          />
          <Path
            d="M41.2 56h11.6a2.6 2.6 0 0 1-.6 2h-9.7a2.4 2.4 0 0 1-1.3-2"
            fill={mono ? '#EAE6E8' : '#E9DFE3'}
            stroke="none"
          />
          <Path d="M40 54a4 4 0 0 1 5.5-4 4 4 0 0 1 7.5 1.5 3.2 3.2 0 0 1-.8 6.5h-9.7a3 3 0 0 1-2.5-4" />
        </P>
      </G>
    </Svg>
  );
}

function HealthPill({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="12.2" y="20" width="26" height="36" rx="6" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="17.2" y="30" width="16" height="16" rx="3" fill={outline} stroke={outline} strokeWidth="8" />
          <Path d="M21.7 38h7m-3.5-3.5v7" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="10.2" y="9" width="30" height="11" rx="3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M20.2 12.5v4m5-4v4m5-4v4" fill="none" stroke={outline} strokeWidth="7.6" />
          <Path d="M16.7 25v3.5" fill="none" stroke={outline} strokeWidth="9" />
          <P name="capsule" originX={46.2} originY={44}>
            <Rect
              x="39.2"
              y="40.5"
              width="14"
              height="7"
              rx="3.5"
              transform="rotate(-40 46.2 44)"
              fill="none"
              stroke={outline}
              strokeWidth="8"
            />
            <Path d="m43.95 41.319 4.5 5.362" fill="none" stroke={outline} strokeWidth="7.8" />
            <Path d="m42.236 45.499 1.532-1.286" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="sparkle" originX={10} originY={36}>
            <Path
              d="M10 33c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="12.2" y="20" width="26" height="36" rx="6" fill={mono ? '#F6F2F4' : '#E3F3FF'} stroke="none" />
        <Path
          d="M31.2 20h1a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6h-1z"
          fill={mono ? '#CFCBCD' : '#8FD0FF'}
          stroke="none"
          opacity=".6"
        />
        <Rect x="12.2" y="20" width="26" height="36" rx="6" />
        <Rect x="17.2" y="30" width="16" height="16" rx="3" fill={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <Path d="M21.7 38h7m-3.5-3.5v7" stroke={mono ? '#A19D9F' : '#F0588F'} />
        <Rect x="10.2" y="9" width="30" height="11" rx="3" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Path d="M33.2 9h4a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4z" fill={mono ? '#A19D9F' : '#F0588F'} stroke="none" />
        <Rect x="10.2" y="9" width="30" height="11" rx="3" />
        <Path d="M20.2 12.5v4m5-4v4m5-4v4" stroke={mono ? '#A19D9F' : '#F0588F'} strokeWidth="1.6" />
        <Circle cx="14.2" cy="12.8" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="M16.7 25v3.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
        <Circle cx="16.7" cy="50.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="capsule" originX={46.2} originY={44}>
          <Path
            d="m41.27 43.569 2.68-2.25 4.5 5.362-2.681 2.25a3.5 3.5 0 0 1-4.5-5.362"
            fill={mono ? '#C4C0C2' : '#FF8FB8'}
            stroke="none"
          />
          <Path
            d="m43.95 41.319 2.681-2.25a3.5 3.5 0 0 1 4.5 5.362l-2.681 2.25z"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
          />
          <Rect x="39.2" y="40.5" width="14" height="7" rx="3.5" transform="rotate(-40 46.2 44)" strokeWidth="2" />
          <Path d="m43.95 41.319 4.5 5.362" strokeWidth="1.8" />
          <Path d="m42.236 45.499 1.532-1.286" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.5" />
        </P>
        <P name="sparkle" originX={10} originY={36}>
          <Path
            d="M10 33c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function HealthSun({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="rays" originX={32} originY={32}>
            <Path
              d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2"
              fill="none"
              stroke={outline}
              strokeWidth="12.5"
            />
            <Path
              d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2"
              fill="none"
              stroke={outline}
              strokeWidth="9"
            />
          </P>
          <Circle cx="32" cy="32" r="13" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M24.5 28.5a8 8 0 0 1 4-4.5" fill="none" stroke={outline} strokeWidth="9" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="rays" originX={32} originY={32}>
          <Path
            d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2"
            strokeWidth="6.5"
          />
          <Path
            d="M32 6v6m0 40v6M6 32h6m40 0h6M13.6 13.6l4.2 4.2m28.4 28.4 4.2 4.2m-36.8 0 4.2-4.2m28.4-28.4 4.2-4.2"
            stroke={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="3"
          />
        </P>
        <Circle cx="32" cy="32" r="13" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path
          d="M41.2 22.8a13 13 0 0 1-18.4 18.4 15.5 15.5 0 0 0 18.4-18.4"
          fill={mono ? '#C6C2C4' : '#EBB53B'}
          stroke="none"
        />
        <Circle cx="32" cy="32" r="13" />
        <Path d="M24.5 28.5a8 8 0 0 1 4-4.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
        <Circle cx="23.8" cy="33.5" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
      </G>
    </Svg>
  );
}

function HealthWaterCup({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18.4 19.5h27.2" fill="none" stroke={outline} strokeWidth="7.5" />
          <Path d="m34.5 50 5-32L45 8h4" fill="none" stroke={outline} strokeWidth="12" />
          <Path d="m34.5 50 5-32L45 8h4" fill="none" stroke={outline} strokeWidth="9" />
          <Path d="m34.8 48 2.7-17" fill="none" stroke={outline} strokeWidth="9" />
          <P name="wave" originX={32} originY={30.5}>
            <Path
              d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M22.5 34c2.2-1.2 4.2.9 6.3 0" fill="none" stroke={outline} strokeWidth="7.6" />
          </P>
          <Path
            d="M18 16h28l-4 36.5a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m23.3 22.5.5 4" fill="none" stroke={outline} strokeWidth="9" />
          <P name="lemon" originX={20} originY={16}>
            <Path d="M13 16a7 7 0 0 1 14 0z" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Path d="M20 15v-3.6m0 3.6-2.7-2.4M20 15l2.7-2.4" fill="none" stroke={outline} strokeWidth="7.2" />
          </P>
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
        <Path d="M18.4 19.5h27.2" stroke={mono ? '#B9B5B7' : '#B3A2AA'} strokeWidth="1.5" />
        <Path d="m34.5 50 5-32L45 8h4" strokeWidth="6" />
        <Path d="m34.5 50 5-32L45 8h4" stroke={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="3" />
        <Path
          d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0l-2.4 22a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z"
          fill={mono ? '#CFCBCD' : '#8FD0FF'}
          stroke="none"
        />
        <Path
          d="M38.2 30.5c3.1-2.2 4.5 1.4 6.2 0l-2.4 22a4 4 0 0 1-4 3.5h-3.5c2.6-6 3.7-15 3.7-25.5"
          fill={mono ? '#B0ACAE' : '#5DAFEA'}
          stroke="none"
        />
        <Path d="m34.8 48 2.7-17" stroke={mono ? '#A19D9F' : '#F0588F'} strokeWidth="3" opacity=".5" />
        <P name="bubbles" originX={27} originY={44}>
          <Circle cx="27" cy="45" r="1.8" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" opacity=".85" />
          <Circle cx="30.5" cy="50" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" opacity=".85" />
          <Circle cx="25.5" cy="39" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" opacity=".85" />
        </P>
        <P name="wave" originX={32} originY={30.5}>
          <Path d="M19.6 30.5c3.1-2.2 6.2 2.2 9.3 0s6.2 2.2 9.3 0 4.5 1.4 6.2 0" />
          <Path d="M22.5 34c2.2-1.2 4.2.9 6.3 0" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.6" opacity=".8" />
        </P>
        <Path d="M18 16h28l-4 36.5a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5z" />
        <Path d="m23.3 22.5.5 4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
        <P name="lemon" originX={20} originY={16}>
          <Path d="M13 16a7 7 0 0 1 14 0z" fill={mono ? '#E0DCDE' : '#FFD66B'} />
          <Path d="M15.6 15a4.4 4.4 0 0 1 8.8 0z" fill={mono ? '#FBF7F9' : '#FFF6D9'} stroke="none" />
          <Path d="M20 15v-3.6m0 3.6-2.7-2.4M20 15l2.7-2.4" stroke={mono ? '#C6C2C4' : '#EBB53B'} strokeWidth="1.2" />
        </P>
      </G>
    </Svg>
  );
}

function HobbyCamera({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m22 20 3.5-6h13l3.5 6z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="9" y="20" width="46" height="31" rx="6" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M14 25.5v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="43.5" y="24.5" width="6" height="3.5" rx="1.5" fill={outline} stroke={outline} strokeWidth="8" />
          <P name="lens" originX={32} originY={35.5}>
            <Circle cx="32" cy="35.5" r="11" fill={outline} stroke={outline} strokeWidth="8.5" />
            <Circle cx="32" cy="35.5" r="6.5" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M29 33.5a3.6 3.6 0 0 1 2.5-2" fill="none" stroke={outline} strokeWidth="8" />
          </P>
          <P name="sparkle-a" originX={53} originY={12}>
            <Path
              d="M53 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={13}>
            <Path
              d="M11 10c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m22 20 3.5-6h13l3.5 6z" fill={mono ? '#F5F1F3' : '#F2EAFF'} />
        <Rect x="9" y="20" width="46" height="31" rx="6" fill={mono ? '#C6C2C4' : '#C6A2FF'} stroke="none" />
        <Path d="M47 20h2a6 6 0 0 1 6 6v19a6 6 0 0 1-6 6h-2z" fill={mono ? '#A7A3A5' : '#A27BEA'} stroke="none" />
        <Rect x="9" y="20" width="46" height="31" rx="6" />
        <Path d="M14 25.5v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="14" cy="34" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Rect x="43.5" y="24.5" width="6" height="3.5" rx="1.5" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2" />
        <P name="lens" originX={32} originY={35.5}>
          <Circle cx="32" cy="35.5" r="11" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
          <Circle cx="32" cy="35.5" r="6.5" fill={mono ? '#A7A3A5' : '#A27BEA'} strokeWidth="2" />
          <Path d="M29 33.5a3.6 3.6 0 0 1 2.5-2" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
          <Circle cx="35" cy="38.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={53} originY={12}>
          <Path
            d="M53 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={13}>
          <Path
            d="M11 10c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HobbyCupcake({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 35h28l-4 19H22z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m26 39 1.5 11M32 39v11m6-11-1.5 11" fill="none" stroke={outline} strokeWidth="8" />
          <Path
            d="M13 35c0-8 7-14 12.5-12 2-6.5 11-6.5 13 0C44 21 51 27 51 35z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M20.5 30a6 6 0 0 1 4-3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m29 28.5 2-1m4.5 2.5 1.2 1.5" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="m25 32.5 1.8.6M43 29.5l.8-1.6" fill="none" stroke={outline} strokeWidth="8" />
          <P name="cherry" originX={32} originY={18}>
            <Path d="M32 11c.4-2 1.8-3.6 4-4.3" fill="none" stroke={outline} strokeWidth="8" />
            <Circle cx="32" cy="15" r="4" fill={outline} stroke={outline} strokeWidth="8.2" />
          </P>
          <P name="sparkle-a" originX={52} originY={15}>
            <Path
              d="M52 10.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={20}>
            <Path
              d="M11 17c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M18 35h28l-4 19H22z" fill={mono ? '#C6C2C4' : '#C6A2FF'} stroke="none" />
        <Path d="M38 35h8l-4 19h-6z" fill={mono ? '#A7A3A5' : '#A27BEA'} stroke="none" />
        <Path d="M18 35h28l-4 19H22z" />
        <Path d="m26 39 1.5 11M32 39v11m6-11-1.5 11" strokeWidth="2" />
        <Path
          d="M13 35c0-8 7-14 12.5-12 2-6.5 11-6.5 13 0C44 21 51 27 51 35z"
          fill={mono ? '#E4E0E2' : '#FFC7DB'}
          stroke="none"
        />
        <Path
          d="M41.5 23.2C47 24 51 29 51 35H41c1.4-4 1.6-8 .5-11.8"
          fill={mono ? '#CFCBCD' : '#FFA3C3'}
          stroke="none"
        />
        <Path d="M13 35c0-8 7-14 12.5-12 2-6.5 11-6.5 13 0C44 21 51 27 51 35z" />
        <Path d="M20.5 30a6 6 0 0 1 4-3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Path d="m29 28.5 2-1m4.5 2.5 1.2 1.5" stroke={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2" />
        <Path d="m25 32.5 1.8.6M43 29.5l.8-1.6" stroke={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="2" />
        <P name="cherry" originX={32} originY={18}>
          <Path d="M32 11c.4-2 1.8-3.6 4-4.3" strokeWidth="2" />
          <Circle cx="32" cy="15" r="4" fill={mono ? '#9B9799' : '#F2555A'} strokeWidth="2.2" />
          <Circle cx="30.6" cy="13.6" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={52} originY={15}>
          <Path
            d="M52 10.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={20}>
          <Path
            d="M11 17c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HobbyMusicDisc({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="30" cy="35" r="20" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M14 29.2a17 17 0 0 1 6.3-8.1" fill="none" stroke={outline} strokeWidth="8.2" />
          <Path
            d="M17.8 30.6a13 13 0 0 1 5.7-6.9m18.7 15.7a13 13 0 0 1-5.7 6.9"
            fill="none"
            stroke={outline}
            strokeWidth="8"
          />
          <Circle cx="30" cy="35" r="7.5" fill="none" stroke={outline} strokeWidth="8" />
          <Circle cx="30" cy="35" r="2" fill={outline} stroke={outline} strokeWidth="7.5" />
          <P name="note-a" originX={52} originY={14}>
            <Path d="M52.5 19V8.5c1.6 1.6 3.4 2.2 5 2.6" fill="none" stroke={outline} strokeWidth="8.2" />
            <Ellipse
              cx="49.6"
              cy="19.2"
              rx="3.2"
              ry="2.5"
              transform="rotate(-20 49.6 19.2)"
              fill={outline}
              stroke={outline}
              strokeWidth="8"
            />
          </P>
          <P name="sparkle-a" originX={12} originY={12}>
            <Path
              d="M12 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Circle cx="30" cy="35" r="20" fill={mono ? '#868284' : '#7A6470'} />
        <Path d="M14 29.2a17 17 0 0 1 6.3-8.1" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" opacity=".6" />
        <Path
          d="M17.8 30.6a13 13 0 0 1 5.7-6.9m18.7 15.7a13 13 0 0 1-5.7 6.9"
          stroke={mono ? '#B9B5B7' : '#B3A2AA'}
          strokeWidth="2"
        />
        <Circle cx="30" cy="35" r="7.5" fill={mono ? '#C6C2C4' : '#C6A2FF'} stroke="none" />
        <Path d="M30 27.5a7.5 7.5 0 0 1 0 15z" fill={mono ? '#A7A3A5' : '#A27BEA'} stroke="none" />
        <Circle cx="30" cy="35" r="7.5" strokeWidth="2" />
        <Circle cx="30" cy="35" r="2" fill={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.5" />
        <P name="note-a" originX={52} originY={14}>
          <Path d="M52.5 19V8.5c1.6 1.6 3.4 2.2 5 2.6" strokeWidth="2.2" />
          <Ellipse
            cx="49.6"
            cy="19.2"
            rx="3.2"
            ry="2.5"
            transform="rotate(-20 49.6 19.2)"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="2"
          />
        </P>
        <P name="sparkle-a" originX={12} originY={12}>
          <Path
            d="M12 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
      </G>
    </Svg>
  );
}

function HobbyPalette({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 10C18 10 8 20 8 32s10 22 22 22c4 0 5-3 3-6s0-6 4-6h7c7 0 12-5 12-12 0-12-11-20-24-20"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M12.5 27a16 16 0 0 1 3.5-6.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="22" cy="25" r="4" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="32.5" cy="18.5" r="4" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="43.5" cy="24" r="4" fill={outline} stroke={outline} strokeWidth="8" />
          <Circle cx="17.5" cy="37" r="4" fill={outline} stroke={outline} strokeWidth="8" />
          <P name="sparkle-a" originX={55} originY={10}>
            <Path
              d="M55 7c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
          <P name="sparkle-b" originX={10} originY={52}>
            <Path
              d="M10 49c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
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
          stroke="none"
        />
        <Path
          d="M50 17c4 3.5 6 9 6 13 0 7-5 12-12 12h-7c-1.5 0-2.6.4-3.4 1H44c6 0 10-5 10-11 0-5-1.5-10-4-15"
          fill={mono ? '#C6C2C4' : '#C6A2FF'}
          stroke="none"
        />
        <Path d="M32 10C18 10 8 20 8 32s10 22 22 22c4 0 5-3 3-6s0-6 4-6h7c7 0 12-5 12-12 0-12-11-20-24-20" />
        <Path d="M12.5 27a16 16 0 0 1 3.5-6.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="22" cy="25" r="4" fill={mono ? '#C4C0C2' : '#FF8FB8'} strokeWidth="2" />
        <Circle cx="20.7" cy="23.7" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="32.5" cy="18.5" r="4" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2" />
        <Circle cx="31.2" cy="17.2" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="43.5" cy="24" r="4" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="2" />
        <Circle cx="42.2" cy="22.7" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="17.5" cy="37" r="4" fill={mono ? '#CECACC' : '#A8DB7E'} strokeWidth="2" />
        <Circle cx="16.2" cy="35.7" r=".9" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle-a" originX={55} originY={10}>
          <Path
            d="M55 7c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
        <P name="sparkle-b" originX={10} originY={52}>
          <Path
            d="M10 49c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function HobbyPottedPlant({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 34c2-3 20-3 22 0z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 35V24" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="leaf-left" originX={32} originY={29}>
            <Path d="M32 29c-10 1-15-5-15-13 9-1 14 4 15 13" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M17 16c4 5 9 10 15 13" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="leaf-right" originX={32} originY={24}>
            <Path d="M32 24c0-8 5-13 13-13 0 8-5 13-13 13" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M45 11c-4 5-8 9-13 13" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <Path
            d="M19 41h26l-3 14.5a3 3 0 0 1-3 2.5H25a3 3 0 0 1-3-2.5z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m23.2 46.5.9 4.6" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="16" y="34" width="32" height="7" rx="2.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M19.5 37.5h5" fill="none" stroke={outline} strokeWidth="8" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M21 34c2-3 20-3 22 0z" fill={mono ? '#ADA9AB' : '#B99273'} />
        <Circle cx="37" cy="32.8" r=".8" fill={mono ? '#CCC8CA' : '#D8B79A'} stroke="none" />
        <Path d="M32 35V24" />
        <P name="leaf-left" originX={32} originY={29}>
          <Path d="M32 29c-10 1-15-5-15-13 9-1 14 4 15 13" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Path d="M32 29c-10 1-15-5-15-13 4 5 9 10 15 13" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
          <Path d="M32 29c-10 1-15-5-15-13 9-1 14 4 15 13" />
          <Path d="M17 16c4 5 9 10 15 13" strokeWidth="1.5" />
          <Ellipse
            cx="23.5"
            cy="18.5"
            rx="2.2"
            ry="1.2"
            transform="rotate(35 23.5 18.5)"
            fill={mono ? '#FFFFFF' : '#FFFFFF'}
            stroke="none"
            opacity=".8"
          />
        </P>
        <P name="leaf-right" originX={32} originY={24}>
          <Path d="M32 24c0-8 5-13 13-13 0 8-5 13-13 13" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
          <Path d="M32 24c8 0 13-5 13-13-4 5-8 9-13 13" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
          <Path d="M32 24c0-8 5-13 13-13 0 8-5 13-13 13" />
          <Path d="M45 11c-4 5-8 9-13 13" strokeWidth="1.5" />
        </P>
        <Path
          d="M19 41h26l-3 14.5a3 3 0 0 1-3 2.5H25a3 3 0 0 1-3-2.5z"
          fill={mono ? '#D0CCCE' : '#FFB088'}
          stroke="none"
        />
        <Path d="M38 41h7l-3 14.5a3 3 0 0 1-3 2.5h-3z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Path d="M19 41h26l-.5 2.5h-25z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Path
          d="M31 48.6c-1-1.6-3.6-1-3.6 1 0 1.8 3.6 4 3.6 4s3.6-2.2 3.6-4c0-2-2.6-2.6-3.6-1"
          fill={mono ? '#F7F3F5' : '#FFEDE2'}
          stroke="none"
        />
        <Path d="M19 41h26l-3 14.5a3 3 0 0 1-3 2.5H25a3 3 0 0 1-3-2.5z" />
        <Path d="m23.2 46.5.9 4.6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="24.6" cy="54" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Rect x="16" y="34" width="32" height="7" rx="2.5" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
        <Path
          d="M40 34h5.5a2.5 2.5 0 0 1 2.5 2.5v2a2.5 2.5 0 0 1-2.5 2.5H40z"
          fill={mono ? '#B5B1B3' : '#EE8A5E'}
          stroke="none"
        />
        <Rect x="16" y="34" width="32" height="7" rx="2.5" />
        <Path d="M19.5 37.5h5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
      </G>
    </Svg>
  );
}

function LifeBroom({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M45 7 32 32" fill="none" stroke={outline} strokeWidth="12.5" />
          <Path d="M45 7 32 32" fill="none" stroke={outline} strokeWidth="9.5" />
          <Path d="m23 34 15 7-4 15c-7 0-15-4.5-19-10.5z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m19 46 9 4.5M23.5 40 34 45" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="m18.5 43 1.4 2" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="m25 30 15 7-2 4-15-7z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m27.5 32.5 3.5 1.6" fill="none" stroke={outline} strokeWidth="7.8" />
          <P name="cloud-dust" originX={45} originY={51}>
            <Circle cx="43" cy="53" r="2.6" fill={outline} stroke={outline} strokeWidth="7.5" />
            <Circle cx="47.5" cy="48.5" r="1.8" fill={outline} stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="sparkle-a" originX={14} originY={14}>
            <Path
              d="M14 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={54} originY={25}>
            <Path
              d="M54 22c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M45 7 32 32" strokeWidth="6.5" />
        <Path d="M45 7 32 32" stroke={mono ? '#ADA9AB' : '#B99273'} strokeWidth="3.5" />
        <Path d="m23 34 15 7-4 15c-7 0-15-4.5-19-10.5z" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="m34 39.1 4 1.9-4 15c-1.5 0-3-.2-4.5-.5z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Path d="m23 34 15 7-4 15c-7 0-15-4.5-19-10.5z" />
        <Path d="m19 46 9 4.5M23.5 40 34 45" strokeWidth="2" />
        <Path d="m18.5 43 1.4 2" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <Path d="m25 30 15 7-2 4-15-7z" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
        <Path d="M36.5 35.4 40 37l-2 4-3.5-1.6z" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
        <Path d="m25 30 15 7-2 4-15-7z" />
        <Path d="m27.5 32.5 3.5 1.6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.8" />
        <P name="cloud-dust" originX={45} originY={51}>
          <Circle
            cx="43"
            cy="53"
            r="2.6"
            fill={mono ? '#F6F2F4' : '#F5EEF1'}
            stroke={mono ? '#B9B5B7' : '#B3A2AA'}
            strokeWidth="1.5"
          />
          <Circle
            cx="47.5"
            cy="48.5"
            r="1.8"
            fill={mono ? '#F6F2F4' : '#F5EEF1'}
            stroke={mono ? '#B9B5B7' : '#B3A2AA'}
            strokeWidth="1.5"
          />
        </P>
        <P name="sparkle-a" originX={14} originY={14}>
          <Path
            d="M14 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={54} originY={25}>
          <Path
            d="M54 22c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function LifeCatBowl({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="fish" originX={31.5} originY={15}>
            <Path d="m37 15 5.5-4v8z" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M21 15c4-5 12-5 16 0-4 5-12 5-16 0" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M26.5 13.6q2.2-1 4.5-.9" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <Path d="M15 32c2-7 8-10 17-10s15 3 17 10z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path
            d="M9 32h46l-4.5 17.5a4 4 0 0 1-3.9 3H17.4a4 4 0 0 1-3.9-3z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="m14 37.5 1.1 4.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="sparkle-a" originX={53} originY={16}>
            <Path
              d="M53 11.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={19}>
            <Path
              d="M11 16c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="fish" originX={31.5} originY={15}>
          <Path d="m37 15 5.5-4v8z" fill={mono ? '#B0ACAE' : '#5DAFEA'} strokeWidth="2" />
          <Path d="M21 15c4-5 12-5 16 0-4 5-12 5-16 0" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="2" />
          <Path d="M26.5 13.6q2.2-1 4.5-.9" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.5" />
          <Circle cx="25.2" cy="15" r="1.1" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        </P>
        <Path d="M15 32c2-7 8-10 17-10s15 3 17 10z" fill={mono ? '#CCC8CA' : '#D8B79A'} />
        <Circle cx="24" cy="27.5" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Circle cx="34" cy="26" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Circle cx="41" cy="29" r="2" fill={mono ? '#ADA9AB' : '#B99273'} stroke="none" />
        <Path
          d="M9 32h46l-4.5 17.5a4 4 0 0 1-3.9 3H17.4a4 4 0 0 1-3.9-3z"
          fill={mono ? '#CECACC' : '#A8DB7E'}
          stroke="none"
        />
        <Path
          d="M45 32h10l-4.5 17.5a4 4 0 0 1-3.9 3H42c2.5-6 3-13 3-20.5"
          fill={mono ? '#B1ADAF' : '#7FBF52'}
          stroke="none"
        />
        <Path d="M9 32h46l-.8 3H9.8z" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
        <Path d="M9 32h46l-4.5 17.5a4 4 0 0 1-3.9 3H17.4a4 4 0 0 1-3.9-3z" />
        <Ellipse cx="30" cy="46" rx="3.4" ry="2.7" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="25.8" cy="42" r="1.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="28.6" cy="40" r="1.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="31.4" cy="40" r="1.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="34.2" cy="42" r="1.5" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="m14 37.5 1.1 4.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="16" cy="45.5" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle-a" originX={53} originY={16}>
          <Path
            d="M53 11.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={19}>
          <Path
            d="M11 16c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function LifePan({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M39 28.5 55.5 22l2 5.5L41 34z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m45 28.2 7.5-3" fill="none" stroke={outline} strokeWidth="7.6" />
          <Path d="M36.3 23.4a15 15 0 0 1-17.4 22.7" fill="none" stroke={outline} strokeWidth="9.5" />
          <Circle cx="24" cy="32" r="17" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M11 25.5a14.5 14.5 0 0 1 5-6.5" fill="none" stroke={outline} strokeWidth="8.2" />
          <Circle cx="24" cy="32" r="12.5" fill={outline} stroke={outline} strokeWidth="8" />
          <P name="egg" originX={24} originY={32}>
            <Path d="M17 29c2-6 12-6 14 0s-2.5 10-7 10-9-4-7-10" fill={outline} stroke={outline} strokeWidth="8" />
            <Circle cx="24" cy="32" r="4" fill={outline} stroke={outline} strokeWidth="8" />
          </P>
          <P name="sparkle-a" originX={46} originY={12}>
            <Path
              d="M46 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={52} originY={40}>
            <Path
              d="M52 37c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M39 28.5 55.5 22l2 5.5L41 34z" fill={mono ? '#ADA9AB' : '#B99273'} />
        <Path d="m45 28.2 7.5-3" stroke={mono ? '#CCC8CA' : '#D8B79A'} strokeWidth="1.6" />
        <Circle cx="24" cy="32" r="17" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
        <Path d="M36.3 23.4a15 15 0 0 1-17.4 22.7" stroke={mono ? '#B1ADAF' : '#7FBF52'} strokeWidth="3.5" />
        <Circle cx="24" cy="32" r="17" />
        <Path d="M11 25.5a14.5 14.5 0 0 1 5-6.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <Circle cx="24" cy="32" r="12.5" fill={mono ? '#868284' : '#7A6470'} strokeWidth="2" />
        <P name="egg" originX={24} originY={32}>
          <Path d="M17 29c2-6 12-6 14 0s-2.5 10-7 10-9-4-7-10" fill={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
          <Circle cx="24" cy="32" r="4" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2" />
          <Circle cx="22.6" cy="30.6" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={46} originY={12}>
          <Path
            d="M46 7.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={52} originY={40}>
          <Path
            d="M52 37c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function LifePiggyBank({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="coin" originX={32} originY={13.5}>
            <Circle cx="32" cy="13.5" r="6" fill={outline} stroke={outline} strokeWidth="8.2" />
            <Circle cx="32" cy="13.5" r="3.5" fill="none" stroke={outline} strokeWidth="7.5" />
            <Path d="M27.7 11.9a4.6 4.6 0 0 1 2-2.4" fill="none" stroke={outline} strokeWidth="7.5" />
          </P>
          <Path d="m22 24.5 2-6 6 4z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M42.5 28.5c3.5 2.5 6 6 6 10 0 3.5-1.5 6-4 7.8" fill="none" stroke={outline} strokeWidth="9.5" />
          <Path
            d="M10 38.5c0-10 9-16 20-16s21 6 21 16c0 6-3 10-8 12v6h-6v-4H27v4h-6v-6c-6-2-11-6-11-12"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path d="M28 26.5h8" fill="none" stroke={outline} strokeWidth="8.5" />
          <Ellipse cx="51" cy="38.5" rx="3.5" ry="4.5" fill={outline} stroke={outline} strokeWidth="8.2" />
          <Path d="M17 35.5a8 8 0 0 1 4-5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="sparkle-a" originX={51} originY={13}>
            <Path
              d="M51 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={12} originY={17}>
            <Path
              d="M12 14c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="coin" originX={32} originY={13.5}>
          <Circle cx="32" cy="13.5" r="6" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2.2" />
          <Circle cx="32" cy="13.5" r="3.5" stroke={mono ? '#C6C2C4' : '#EBB53B'} strokeWidth="1.5" />
          <Path d="M27.7 11.9a4.6 4.6 0 0 1 2-2.4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.5" />
        </P>
        <Path d="m22 24.5 2-6 6 4z" fill={mono ? '#CFCBCD' : '#FFA3C3'} />
        <Path
          d="M10 38.5c0-10 9-16 20-16s21 6 21 16c0 6-3 10-8 12v6h-6v-4H27v4h-6v-6c-6-2-11-6-11-12"
          fill={mono ? '#E4E0E2' : '#FFC7DB'}
          stroke="none"
        />
        <Path
          d="M42.5 28.5c3.5 2.5 6 6 6 10 0 3.5-1.5 6-4 7.8"
          stroke={mono ? '#CFCBCD' : '#FFA3C3'}
          strokeWidth="3.5"
        />
        <Path d="M37 51h6v5.5h-6z" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Path d="M10 38.5c0-10 9-16 20-16s21 6 21 16c0 6-3 10-8 12v6h-6v-4H27v4h-6v-6c-6-2-11-6-11-12" />
        <Path d="M28 26.5h8" />
        <Ellipse cx="51" cy="38.5" rx="3.5" ry="4.5" fill={mono ? '#CFCBCD' : '#FFA3C3'} strokeWidth="2.2" />
        <Circle cx="50.3" cy="37" r=".8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="50.3" cy="40" r=".8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="42" cy="33.5" r="1.8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="42.6" cy="32.9" r=".6" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Ellipse cx="40" cy="38.8" rx="2.4" ry="1.4" fill={mono ? '#C4C0C2' : '#FF8FB8'} stroke="none" />
        <Path d="M17 35.5a8 8 0 0 1 4-5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="16" cy="40" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle-a" originX={51} originY={13}>
          <Path
            d="M51 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={12} originY={17}>
          <Path
            d="M12 14c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function LifeWateringCan({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M11.5 28.5c-7 0-7 14 0 14" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M15.5 24.5c0-13 16-13 16 0" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M35.5 31 47 20.5l3 3L35.5 37z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="m44.5 18.5 2-2 8 8-2 2z" fill={outline} stroke={outline} strokeWidth="8.2" />
          <Path d="M11.5 24.5h24v20a5 5 0 0 1-5 5h-14a5 5 0 0 1-5-5z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M16 31v8" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="drop" originX={55} originY={34}>
            <Circle cx="56" cy="31.5" r="1.8" fill={outline} stroke={outline} strokeWidth="7.5" />
            <Circle cx="52.5" cy="36" r="1.6" fill={outline} stroke={outline} strokeWidth="7.5" />
            <Circle cx="57.5" cy="38" r="1.4" fill={outline} stroke={outline} strokeWidth="7.5" />
          </P>
          <P name="sparkle-a" originX={8} originY={12}>
            <Path
              d="M8 9c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M11.5 28.5c-7 0-7 14 0 14" />
        <Path d="M15.5 24.5c0-13 16-13 16 0" />
        <Path d="M35.5 31 47 20.5l3 3L35.5 37z" fill={mono ? '#CECACC' : '#A8DB7E'} />
        <Path d="m44.5 18.5 2-2 8 8-2 2z" fill={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2.2" />
        <Path d="M11.5 24.5h24v20a5 5 0 0 1-5 5h-14a5 5 0 0 1-5-5z" fill={mono ? '#CECACC' : '#A8DB7E'} stroke="none" />
        <Path d="M29.5 24.5h6v20a5 5 0 0 1-5 5h-1z" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
        <Path d="M11.5 24.5h24v3h-24z" fill={mono ? '#B1ADAF' : '#7FBF52'} stroke="none" />
        <Path d="M11.5 24.5h24v20a5 5 0 0 1-5 5h-14a5 5 0 0 1-5-5z" />
        <Path
          d="M23.5 36.5c-1-1.6-3.6-1-3.6 1 0 1.8 3.6 4 3.6 4s3.6-2.2 3.6-4c0-2-2.6-2.6-3.6-1"
          fill={mono ? '#F9F5F7' : '#EEF8E2'}
          stroke="none"
        />
        <Path d="M16 31v8" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="16" cy="43" r="1.2" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="drop" originX={55} originY={34}>
          <Circle cx="56" cy="31.5" r="1.8" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="1.5" />
          <Circle cx="52.5" cy="36" r="1.6" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="1.5" />
          <Circle cx="57.5" cy="38" r="1.4" fill={mono ? '#CFCBCD' : '#8FD0FF'} strokeWidth="1.5" />
        </P>
        <P name="sparkle-a" originX={8} originY={12}>
          <Path
            d="M8 9c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function MindLotus({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Ellipse cx="32" cy="47" rx="21" ry="5.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M16.5 45.2q3-1.6 6.5-2" fill="none" stroke={outline} strokeWidth="7.8" />
          <P name="leaf-left" originX={32} originY={46}>
            <Path
              d="M32 46c-9-1.5-17-9.5-19-20.5 8.5 1.5 16 8 19 20.5"
              fill={outline}
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <P name="leaf-right" originX={32} originY={46}>
            <Path
              d="M32 46c9-1.5 17-9.5 19-20.5-8.5 1.5-16 8-19 20.5"
              fill={outline}
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <Path d="M32 14c-6.5 8-6.5 22 0 32 6.5-10 6.5-24 0-32" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M29.6 24c-.7 3-.7 7 0 10" fill="none" stroke={outline} strokeWidth="8.2" />
          <P name="sparkle-a" originX={48} originY={14}>
            <Path
              d="M48 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={15} originY={16}>
            <Path
              d="M15 13c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Ellipse cx="32" cy="47" rx="21" ry="5.5" fill={mono ? '#CBC7C9' : '#7EDCC2'} stroke="none" />
        <Path d="M11 47a21 5.5 0 0 0 42 0z" fill={mono ? '#ACA8AA' : '#4DBF9F'} stroke="none" />
        <Ellipse cx="32" cy="47" rx="21" ry="5.5" />
        <Path d="M16.5 45.2q3-1.6 6.5-2" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.8" />
        <P name="leaf-left" originX={32} originY={46}>
          <Path d="M32 46c-9-1.5-17-9.5-19-20.5 8.5 1.5 16 8 19 20.5" fill={mono ? '#E4E0E2' : '#FFC7DB'} />
        </P>
        <P name="leaf-right" originX={32} originY={46}>
          <Path d="M32 46c9-1.5 17-9.5 19-20.5-8.5 1.5-16 8-19 20.5" fill={mono ? '#CFCBCD' : '#FFA3C3'} />
        </P>
        <Path d="M32 14c-6.5 8-6.5 22 0 32 6.5-10 6.5-24 0-32" fill={mono ? '#C4C0C2' : '#FF8FB8'} stroke="none" />
        <Path d="M32 14c6.5 8 6.5 22 0 32 3-9 3-23 0-32" fill={mono ? '#A7A3A5' : '#E8669A'} stroke="none" />
        <Path d="M32 14c-6.5 8-6.5 22 0 32 6.5-10 6.5-24 0-32" />
        <Path d="M29.6 24c-.7 3-.7 7 0 10" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <P name="sparkle-a" originX={48} originY={14}>
          <Path
            d="M48 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={15} originY={16}>
          <Path
            d="M15 13c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function MindLoveLetter({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="m9 45 15-10.5M55 45 40 34.5" fill="none" stroke={outline} strokeWidth="8" />
          <Rect x="9" y="17" width="46" height="30" rx="4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m9 21 23 15 23-15" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m14 23.5 4 2.6" fill="none" stroke={outline} strokeWidth="8" />
          <P name="heart" originX={32} originY={41}>
            <Path
              d="M32 36.5c-2.6-3.4-8.2-2.2-7.4 2.2.8 3.4 7.4 7.4 7.4 7.4s6.6-4 7.4-7.4c.8-4.4-4.8-5.6-7.4-2.2"
              fill={outline}
              stroke={outline}
              strokeWidth="8.2"
            />
          </P>
          <P name="sparkle-a" originX={52} originY={11}>
            <Path
              d="M52 6.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={12} originY={11}>
            <Path
              d="M12 8c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="9" y="17" width="46" height="30" rx="4" fill={mono ? '#F6F2F4' : '#E1F7F0'} stroke="none" />
        <Path d="m9 21 23 15 23-15a4 4 0 0 0-4-4H13a4 4 0 0 0-4 4" fill={mono ? '#CBC7C9' : '#7EDCC2'} stroke="none" />
        <Path d="m32 36 23-15a4 4 0 0 0-4-4H32z" fill={mono ? '#ACA8AA' : '#4DBF9F'} stroke="none" />
        <Path d="m9 45 15-10.5M55 45 40 34.5" strokeWidth="2" />
        <Rect x="9" y="17" width="46" height="30" rx="4" />
        <Path d="m9 21 23 15 23-15" />
        <Path d="m14 23.5 4 2.6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <P name="heart" originX={32} originY={41}>
          <Path
            d="M32 36.5c-2.6-3.4-8.2-2.2-7.4 2.2.8 3.4 7.4 7.4 7.4 7.4s6.6-4 7.4-7.4c.8-4.4-4.8-5.6-7.4-2.2"
            fill={mono ? '#B9B5B7' : '#FF7BA9'}
            strokeWidth="2.2"
          />
          <Circle cx="28.4" cy="37.8" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={52} originY={11}>
          <Path
            d="M52 6.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={12} originY={11}>
          <Path
            d="M12 8c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function MindSmileSun({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="rays" originX={32} originY={32}>
            <Path
              d="M32 5v6m0 42v6M5 32h6m42 0h6M12.9 12.9l4.2 4.2m29.8 29.8 4.2 4.2m-38.2 0 4.2-4.2m29.8-29.8 4.2-4.2"
              fill="none"
              stroke={outline}
              strokeWidth="11.5"
            />
            <Path
              d="M32 5v6m0 42v6M5 32h6m42 0h6M12.9 12.9l4.2 4.2m29.8 29.8 4.2 4.2m-38.2 0 4.2-4.2m29.8-29.8 4.2-4.2"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
          </P>
          <Path d="M43.3 25.5a13 13 0 0 1-15.7 18.7" fill="none" stroke={outline} strokeWidth="9.5" />
          <Circle cx="32" cy="32" r="15.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M21.5 25a12 12 0 0 1 4-4.5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M27.5 35.5q4.5 4 9 0" fill="none" stroke={outline} strokeWidth="8.2" />
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="rays" originX={32} originY={32}>
          <Path
            d="M32 5v6m0 42v6M5 32h6m42 0h6M12.9 12.9l4.2 4.2m29.8 29.8 4.2 4.2m-38.2 0 4.2-4.2m29.8-29.8 4.2-4.2"
            strokeWidth="5.5"
          />
          <Path
            d="M32 5v6m0 42v6M5 32h6m42 0h6M12.9 12.9l4.2 4.2m29.8 29.8 4.2 4.2m-38.2 0 4.2-4.2m29.8-29.8 4.2-4.2"
            stroke={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="2.5"
          />
        </P>
        <Circle cx="32" cy="32" r="15.5" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="M43.3 25.5a13 13 0 0 1-15.7 18.7" stroke={mono ? '#C6C2C4' : '#EBB53B'} strokeWidth="3.5" />
        <Circle cx="32" cy="32" r="15.5" />
        <Path d="M21.5 25a12 12 0 0 1 4-4.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="26.5" cy="30" r="1.9" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="37.5" cy="30" r="1.9" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="27.1" cy="29.3" r=".6" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="38.1" cy="29.3" r=".6" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="M27.5 35.5q4.5 4 9 0" strokeWidth="2.2" />
        <Ellipse cx="23" cy="35.5" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        <Ellipse cx="41" cy="35.5" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
      </G>
    </Svg>
  );
}

function MindSoftCloud({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="cloud" originX={32} originY={32}>
            <Path
              d="M16 48c-6 0-10-4.5-10-10 0-5 4-9.5 9-9.5 1-7 7-12 14-12 6 0 11 3.5 13 9 1-.5 2.5-.5 3.5-.5 6 0 12 5 12 11.5s-5 11.5-11 11.5z"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Path d="M13.5 35.5a5 5 0 0 1 3-4m8-9.5a10 10 0 0 1 5-2.8" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M24 34q2 2 4 0m8 0q2 2 4 0" fill="none" stroke={outline} strokeWidth="8.2" />
            <Path d="M30 39.5q2 1.5 4 0" fill="none" stroke={outline} strokeWidth="8.2" />
          </P>
          <P name="sparkle-a" originX={53} originY={13}>
            <Path
              d="M53 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={12} originY={15}>
            <Path
              d="M12 12c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.5"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="cloud" originX={32} originY={32}>
          <Path
            d="M16 48c-6 0-10-4.5-10-10 0-5 4-9.5 9-9.5 1-7 7-12 14-12 6 0 11 3.5 13 9 1-.5 2.5-.5 3.5-.5 6 0 12 5 12 11.5s-5 11.5-11 11.5z"
            fill={mono ? '#F6F2F4' : '#E1F7F0'}
            stroke="none"
          />
          <Path
            d="M9.5 42.5C11 46 13.5 48 16 48h30.5c3 0 6.2-1.8 8.3-4.6-7.8 2.1-32.8 2.1-45.3-.9"
            fill={mono ? '#CBC7C9' : '#7EDCC2'}
            stroke="none"
          />
          <Path d="M16 48c-6 0-10-4.5-10-10 0-5 4-9.5 9-9.5 1-7 7-12 14-12 6 0 11 3.5 13 9 1-.5 2.5-.5 3.5-.5 6 0 12 5 12 11.5s-5 11.5-11 11.5z" />
          <Path
            d="M13.5 35.5a5 5 0 0 1 3-4m8-9.5a10 10 0 0 1 5-2.8"
            stroke={mono ? '#FFFFFF' : '#FFFFFF'}
            strokeWidth="2.5"
          />
          <Path d="M24 34q2 2 4 0m8 0q2 2 4 0" strokeWidth="2.2" />
          <Path d="M30 39.5q2 1.5 4 0" strokeWidth="2.2" />
          <Ellipse cx="21" cy="39" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
          <Ellipse cx="43" cy="39" rx="2.6" ry="1.6" fill={mono ? '#CFCBCD' : '#FFA3C3'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={53} originY={13}>
          <Path
            d="M53 8.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={12} originY={15}>
          <Path
            d="M12 12c.4 1.9 1.1 2.6 3 3-1.9.4-2.6 1.1-3 3-.4-1.9-1.1-2.6-3-3 1.9-.4 2.6-1.1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.5"
          />
        </P>
      </G>
    </Svg>
  );
}

function SportBasketball({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="ball" originX={32} originY={53}>
            <Path
              d="M11 32h42M32 11v42M17.5 17c6 6.5 6 23.5 0 30m29-30c-6 6.5-6 23.5 0 30"
              fill="none"
              stroke={outline}
              strokeWidth="8.2"
            />
            <Circle cx="32" cy="32" r="21" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M15.5 25.5a17 17 0 0 1 5-7" fill="none" stroke={outline} strokeWidth="9" />
          </P>
          <P name="sparkle-a" originX={55} originY={10}>
            <Path
              d="M55 5.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={9} originY={54}>
            <Path
              d="M9 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="ball" originX={32} originY={53}>
          <Circle cx="32" cy="32" r="21" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
          <Path
            d="M46.8 17.2a21 21 0 0 1-29.6 29.6 24 24 0 0 0 29.6-29.6"
            fill={mono ? '#B5B1B3' : '#EE8A5E'}
            stroke="none"
          />
          <Path d="M11 32h42M32 11v42M17.5 17c6 6.5 6 23.5 0 30m29-30c-6 6.5-6 23.5 0 30" strokeWidth="2.2" />
          <Circle cx="32" cy="32" r="21" />
          <Path d="M15.5 25.5a17 17 0 0 1 5-7" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="3" />
          <Circle cx="14.6" cy="31" r="1.1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={55} originY={10}>
          <Path
            d="M55 5.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={9} originY={54}>
          <Path
            d="M9 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function SportBicycle({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="speed" originX={8.5} originY={20}>
            <Path d="M6.5 17h5m-6 6h4" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <Path d="M18.5 30v16m-8-8h16m22-8v16m-8-8h16" fill="none" stroke={outline} strokeWidth="7.4" />
          <Circle cx="18.5" cy="38" r="10" fill="none" stroke={outline} strokeWidth="8.5" />
          <Circle cx="48.5" cy="38" r="10" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M11.9 33.5a8 8 0 0 1 3-3.4" fill="none" stroke={outline} strokeWidth="8.2" />
          <Path
            d="m18.5 38 9-15h14l7 15m-21-15 7 15h-16m23-15-3-7h-5m-6 7L26 17m-3.5 0h7"
            fill="none"
            stroke={outline}
            strokeWidth="12.5"
          />
          <Path
            d="m18.5 38 9-15h14l7 15m-21-15 7 15h-16m23-15-3-7h-5m-6 7L26 17m-3.5 0h7"
            fill="none"
            stroke={outline}
            strokeWidth="9"
          />
          <Path d="M29.5 23h4" fill="none" stroke={outline} strokeWidth="7.4" />
          <Circle cx="34.5" cy="38" r="3.2" fill={outline} stroke={outline} strokeWidth="8" />
          <P name="sparkle-a" originX={53} originY={14}>
            <Path
              d="M53 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="speed" originX={8.5} originY={20}>
          <Path d="M6.5 17h5m-6 6h4" stroke={mono ? '#B9B5B7' : '#B3A2AA'} />
        </P>
        <Circle cx="18.5" cy="38" r="10" fill={mono ? '#F7F3F5' : '#FFEDE2'} stroke="none" />
        <Circle cx="48.5" cy="38" r="10" fill={mono ? '#F7F3F5' : '#FFEDE2'} stroke="none" />
        <Path d="M18.5 30v16m-8-8h16m22-8v16m-8-8h16" stroke={mono ? '#B9B5B7' : '#B3A2AA'} strokeWidth="1.4" />
        <Circle cx="18.5" cy="38" r="10" />
        <Circle cx="48.5" cy="38" r="10" />
        <Path d="M11.9 33.5a8 8 0 0 1 3-3.4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <Path d="m18.5 38 9-15h14l7 15m-21-15 7 15h-16m23-15-3-7h-5m-6 7L26 17m-3.5 0h7" strokeWidth="6.5" />
        <Path
          d="m18.5 38 9-15h14l7 15m-21-15 7 15h-16m23-15-3-7h-5m-6 7L26 17m-3.5 0h7"
          stroke={mono ? '#B5B1B3' : '#EE8A5E'}
          strokeWidth="3"
        />
        <Path d="M29.5 23h4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.4" />
        <Circle cx="34.5" cy="38" r="3.2" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
        <Circle cx="18.5" cy="38" r="2" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Circle cx="48.5" cy="38" r="2" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <P name="sparkle-a" originX={53} originY={14}>
          <Path
            d="M53 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
      </G>
    </Svg>
  );
}

function SportDumbbell({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="22" y="31.7" width="20" height="7" rx="2" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M28 34.2v2.5m4-2.5v2.5m4-2.5v2.5" fill="none" stroke={outline} strokeWidth="7.4" />
          <Rect x="7" y="26.2" width="8" height="18" rx="3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="15" y="20.2" width="8" height="30" rx="3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="41" y="20.2" width="8" height="30" rx="3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="49" y="26.2" width="8" height="18" rx="3" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M18 24.7v5m26-5v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M10 30.2v3" fill="none" stroke={outline} strokeWidth="8" />
          <P name="drop" originX={32} originY={20.2}>
            <Path
              d="M32 13.7c-2.5 3.2-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0c0-1.5-1-3.3-3.5-6.5"
              fill={outline}
              stroke={outline}
              strokeWidth="8"
            />
            <Path d="M30.6 19.8a1.8 1.8 0 0 0 1 1.6" fill="none" stroke={outline} strokeWidth="7.2" />
          </P>
          <P name="sparkle-a" originX={53} originY={10}>
            <Path
              d="M53 5.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={53}>
            <Path
              d="M11 50c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Rect x="22" y="31.7" width="20" height="7" rx="2" fill={mono ? '#EAE6E8' : '#E9DFE3'} />
        <Path d="M28 34.2v2.5m4-2.5v2.5m4-2.5v2.5" stroke={mono ? '#B9B5B7' : '#B3A2AA'} strokeWidth="1.4" />
        <Rect x="7" y="26.2" width="8" height="18" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
        <Path d="M11 26.2h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-1z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Rect x="7" y="26.2" width="8" height="18" rx="3" />
        <Rect x="15" y="20.2" width="8" height="30" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
        <Path d="M19 20.2h1a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3h-1z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Rect x="15" y="20.2" width="8" height="30" rx="3" />
        <Rect x="41" y="20.2" width="8" height="30" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
        <Path d="M45 20.2h1a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3h-1z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Rect x="41" y="20.2" width="8" height="30" rx="3" />
        <Rect x="49" y="26.2" width="8" height="18" rx="3" fill={mono ? '#D0CCCE' : '#FFB088'} stroke="none" />
        <Path d="M53 26.2h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-1z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Rect x="49" y="26.2" width="8" height="18" rx="3" />
        <Path d="M18 24.7v5m26-5v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="18" cy="33.7" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Circle cx="44" cy="33.7" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="M10 30.2v3" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <P name="drop" originX={32} originY={20.2}>
          <Path
            d="M32 13.7c-2.5 3.2-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0c0-1.5-1-3.3-3.5-6.5"
            fill={mono ? '#CFCBCD' : '#8FD0FF'}
            strokeWidth="2"
          />
          <Path d="M30.6 19.8a1.8 1.8 0 0 0 1 1.6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.2" />
        </P>
        <P name="sparkle-a" originX={53} originY={10}>
          <Path
            d="M53 5.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={53}>
          <Path
            d="M11 50c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function SportFootprints({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="foot-left" originX={20} originY={50}>
            <Path
              d="M21 30c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Circle cx="14.5" cy="25" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Circle cx="19" cy="21.5" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Circle cx="24" cy="22" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M17.5 35v4" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <P name="foot-right" originX={42} originY={38}>
            <Path
              d="M43 18c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
              fill="none"
              stroke={outline}
              strokeWidth="8.5"
            />
            <Circle cx="36.5" cy="13" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Circle cx="41" cy="9.5" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Circle cx="46" cy="10" r="2.6" fill={outline} stroke={outline} strokeWidth="8" />
            <Path d="M39.5 23v4" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <P name="sparkle-a" originX={53} originY={50}>
            <Path
              d="M53 45.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={10} originY={12}>
            <Path
              d="M10 9c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="foot-left" originX={20} originY={50}>
          <Path
            d="M21 30c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
            fill={mono ? '#D0CCCE' : '#FFB088'}
            stroke="none"
          />
          <Path
            d="M24 31c3 2 4.5 6 4 11s-4 10-8 10c3-2 5-6 5.5-11 .3-4-.3-7.5-1.5-10"
            fill={mono ? '#B5B1B3' : '#EE8A5E'}
            stroke="none"
          />
          <Path d="M21 30c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12" />
          <Circle cx="14.5" cy="25" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Circle cx="19" cy="21.5" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Circle cx="24" cy="22" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Path d="M17.5 35v4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
          <Circle cx="17.3" cy="42.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="foot-right" originX={42} originY={38}>
          <Path
            d="M43 18c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12"
            fill={mono ? '#D0CCCE' : '#FFB088'}
            stroke="none"
          />
          <Path
            d="M46 19c3 2 4.5 6 4 11s-4 10-8 10c3-2 5-6 5.5-11 .3-4-.3-7.5-1.5-10"
            fill={mono ? '#B5B1B3' : '#EE8A5E'}
            stroke="none"
          />
          <Path d="M43 18c5 0 8 5 7 12s-4 10-8 10-7-4-7-10 3-12 8-12" />
          <Circle cx="36.5" cy="13" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Circle cx="41" cy="9.5" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Circle cx="46" cy="10" r="2.6" fill={mono ? '#D0CCCE' : '#FFB088'} strokeWidth="2" />
          <Path d="M39.5 23v4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
          <Circle cx="39.3" cy="30.5" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        </P>
        <P name="sparkle-a" originX={53} originY={50}>
          <Path
            d="M53 45.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={10} originY={12}>
          <Path
            d="M10 9c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function SportSneaker({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="speed" originX={6} originY={32.5}>
            <Path d="M5 29.5h3m-4 6h4" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <Path
            d="M13 41V21a5 5 0 0 1 5-5h7l7 8 10 3c8 2.4 12 7 13 14z"
            fill="none"
            stroke={outline}
            strokeWidth="8.5"
          />
          <Path
            d="M47.27 29.22C51.81 31.85 54.25 35.75 55 41H45c-1-4-.7-8.6 2.27-11.78"
            fill={outline}
            stroke={outline}
            strokeWidth="8"
          />
          <Path d="m29.5 27 3.5-3.7m1.5 5.2 3.5-3.7m1 5.2 3.5-3.7" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="M19 32q6.75-2.1 13.5.6" fill="none" stroke={outline} strokeWidth="8.2" />
          <Path d="M17 21.5v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M11 41h44a4 4 0 0 1 0 8H15a4 4 0 0 1-4-4z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M14.5 45h41" fill="none" stroke={outline} strokeWidth="7.6" />
          <P name="sparkle-a" originX={53} originY={14}>
            <Path
              d="M53 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="speed" originX={6} originY={32.5}>
          <Path d="M5 29.5h3m-4 6h4" stroke={mono ? '#B9B5B7' : '#B3A2AA'} />
        </P>
        <Path
          d="M13 41V21a5 5 0 0 1 5-5h7l7 8 10 3c8 2.4 12 7 13 14z"
          fill={mono ? '#D0CCCE' : '#FFB088'}
          stroke="none"
        />
        <Path d="M13 37h32v4H13z" fill={mono ? '#B5B1B3' : '#EE8A5E'} stroke="none" />
        <Path d="M13 41V21a5 5 0 0 1 5-5h7l7 8 10 3c8 2.4 12 7 13 14z" />
        <Path
          d="M47.27 29.22C51.81 31.85 54.25 35.75 55 41H45c-1-4-.7-8.6 2.27-11.78"
          fill={mono ? '#F7F3F5' : '#FFEDE2'}
          strokeWidth="2"
        />
        <Path d="m29.5 27 3.5-3.7m1.5 5.2 3.5-3.7m1 5.2 3.5-3.7" strokeWidth="2" />
        <Path d="M19 32q6.75-2.1 13.5.6" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.2" />
        <Path d="M17 21.5v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Path d="M11 41h44a4 4 0 0 1 0 8H15a4 4 0 0 1-4-4z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M14.5 45h41" stroke={mono ? '#EAE6E8' : '#E9DFE3'} strokeWidth="1.6" />
        <P name="sparkle-a" originX={53} originY={14}>
          <Path
            d="M53 9.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
      </G>
    </Svg>
  );
}

function StudyBook({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="ribbon" originX={44.5} originY={44}>
            <Path d="M42 42.5v10l2.5-2 2.5 2v-10z" fill={outline} stroke={outline} strokeWidth="8" />
          </P>
          <Path d="M8 16v32c8-3 18-3 24 1.5C38 45 48 45 56 48V16" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 15c-6-4-16-4-22-1.5v30C16 41 26 41 32 45z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 15c6-4 16-4 22-1.5v30C48 41 38 41 32 45z" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Path d="M32 15v30" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path
            d="M15 22c4-1 9-1 12 .5M15 28c4-1 9-1 12 .5M15 34c3-.8 6-.8 8 0m14-11.5c3-1.5 8-1.5 12-.5m-12 6.5c3-1.5 8-1.5 12-.5"
            fill="none"
            stroke={outline}
            strokeWidth="7.8"
          />
          <Path
            d="M43 35.6c-.8-1.3-2.9-.8-2.9.8 0 1.4 2.9 3.2 2.9 3.2s2.9-1.8 2.9-3.2c0-1.6-2.1-2.1-2.9-.8"
            fill={outline}
            stroke={outline}
            strokeWidth="7.6"
          />
          <P name="sparkle-a" originX={52} originY={9}>
            <Path
              d="M52 4.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={11} originY={10}>
            <Path
              d="M11 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="ribbon" originX={44.5} originY={44}>
          <Path d="M42 42.5v10l2.5-2 2.5 2v-10z" fill={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="2" />
        </P>
        <Path d="M8 16v32c8-3 18-3 24 1.5C38 45 48 45 56 48V16" fill={mono ? '#E0DCDE' : '#FFD66B'} />
        <Path d="M32 15c-6-4-16-4-22-1.5v30C16 41 26 41 32 45z" fill={mono ? '#FFFFFF' : '#FFFFFF'} />
        <Path d="M32 15c6-4 16-4 22-1.5v30C48 41 38 41 32 45z" fill={mono ? '#FBF7F9' : '#FFF6D9'} />
        <Path d="M32 15v30" />
        <Path
          d="M15 22c4-1 9-1 12 .5M15 28c4-1 9-1 12 .5M15 34c3-.8 6-.8 8 0m14-11.5c3-1.5 8-1.5 12-.5m-12 6.5c3-1.5 8-1.5 12-.5"
          stroke={mono ? '#B9B5B7' : '#B3A2AA'}
          strokeWidth="1.8"
        />
        <Path
          d="M43 35.6c-.8-1.3-2.9-.8-2.9.8 0 1.4 2.9 3.2 2.9 3.2s2.9-1.8 2.9-3.2c0-1.6-2.1-2.1-2.9-.8"
          fill={mono ? '#C4C0C2' : '#FF8FB8'}
          strokeWidth="1.6"
        />
        <P name="sparkle-a" originX={52} originY={9}>
          <Path
            d="M52 4.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={11} originY={10}>
          <Path
            d="M11 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function StudyDiary({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="ribbon" originX={41.5} originY={51}>
            <Path d="M38 50v9l3.5-2.5L45 59v-9z" fill={outline} stroke={outline} strokeWidth="8.5" />
          </P>
          <Path
            d="M47 11h3.5a1.5 1.5 0 0 1 1.5 1.5v35a1.5 1.5 0 0 1-1.5 1.5H47"
            fill={outline}
            stroke={outline}
            strokeWidth="8"
          />
          <Rect x="16" y="8" width="32" height="44" rx="4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M22 8v44" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="28" y="16" width="14" height="9" rx="2" fill={outline} stroke={outline} strokeWidth="8" />
          <Path d="M31 20.5h8" fill="none" stroke={outline} strokeWidth="7.8" />
          <Path
            d="M35 35.6c-1-1.6-3.6-1-3.6 1 0 1.8 3.6 4 3.6 4s3.6-2.2 3.6-4c0-2-2.6-2.6-3.6-1"
            fill={outline}
            stroke={outline}
            strokeWidth="7.8"
          />
          <Path d="M26 31v5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="sparkle-a" originX={9} originY={20}>
            <Path
              d="M9 17c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
          <P name="sparkle-b" originX={55} originY={56}>
            <Path
              d="M55 53c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="ribbon" originX={41.5} originY={51}>
          <Path d="M38 50v9l3.5-2.5L45 59v-9z" fill={mono ? '#C4C0C2' : '#FF8FB8'} />
        </P>
        <Path
          d="M47 11h3.5a1.5 1.5 0 0 1 1.5 1.5v35a1.5 1.5 0 0 1-1.5 1.5H47"
          fill={mono ? '#FFFFFF' : '#FFFFFF'}
          strokeWidth="2"
        />
        <Rect x="16" y="8" width="32" height="44" rx="4" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="M20 8h2v44h-2a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Rect x="16" y="8" width="32" height="44" rx="4" />
        <Path d="M22 8v44" />
        <Rect x="28" y="16" width="14" height="9" rx="2" fill={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <Path d="M31 20.5h8" stroke={mono ? '#B9B5B7' : '#B3A2AA'} strokeWidth="1.8" />
        <Path
          d="M35 35.6c-1-1.6-3.6-1-3.6 1 0 1.8 3.6 4 3.6 4s3.6-2.2 3.6-4c0-2-2.6-2.6-3.6-1"
          fill={mono ? '#B9B5B7' : '#FF7BA9'}
          strokeWidth="1.8"
        />
        <Path d="M26 31v5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <Circle cx="26" cy="40" r="1" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <P name="sparkle-a" originX={9} originY={20}>
          <Path
            d="M9 17c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
        <P name="sparkle-b" originX={55} originY={56}>
          <Path
            d="M55 53c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function StudyHeadphones({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M13 40v-6a19 19 0 0 1 38 0v6" fill="none" stroke={outline} strokeWidth="13.5" />
          <Path d="M13 40v-6a19 19 0 0 1 38 0v6" fill="none" stroke={outline} strokeWidth="9.5" />
          <Path d="M16.5 27a17 17 0 0 1 6-8" fill="none" stroke={outline} strokeWidth="7.4" />
          <Rect x="20" y="39" width="3.5" height="12" rx="1.75" fill={outline} stroke={outline} strokeWidth="8" />
          <Rect x="40.5" y="39" width="3.5" height="12" rx="1.75" fill={outline} stroke={outline} strokeWidth="8" />
          <Rect x="9" y="36" width="12" height="18" rx="5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Rect x="43" y="36" width="12" height="18" rx="5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M13 40v4m34-4v4" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="note-a" originX={28} originY={31}>
            <Path d="M30 22v9m0-9c2 .5 3.5 2 3.5 4" fill="none" stroke={outline} strokeWidth="8" />
            <Ellipse cx="27.8" cy="31.3" rx="2.5" ry="2" fill={outline} stroke={outline} strokeWidth="7.8" />
          </P>
          <P name="note-b" originX={37} originY={33}>
            <Path d="M39 25v8m0-8c2 .5 3.5 2 3.5 4" fill="none" stroke={outline} strokeWidth="8" />
            <Ellipse cx="36.8" cy="33.3" rx="2.5" ry="2" fill={outline} stroke={outline} strokeWidth="7.8" />
          </P>
          <P name="sparkle" originX={56} originY={11}>
            <Path
              d="M56 8c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M13 40v-6a19 19 0 0 1 38 0v6" strokeWidth="7.5" />
        <Path d="M13 40v-6a19 19 0 0 1 38 0v6" stroke={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="3.5" />
        <Path d="M16.5 27a17 17 0 0 1 6-8" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.4" />
        <Rect x="20" y="39" width="3.5" height="12" rx="1.75" fill={mono ? '#CFCBCD' : '#FFA3C3'} strokeWidth="2" />
        <Rect x="40.5" y="39" width="3.5" height="12" rx="1.75" fill={mono ? '#CFCBCD' : '#FFA3C3'} strokeWidth="2" />
        <Rect x="9" y="36" width="12" height="18" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="M9 47h12v2a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Rect x="9" y="36" width="12" height="18" rx="5" />
        <Rect x="43" y="36" width="12" height="18" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="M43 47h12v2a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Rect x="43" y="36" width="12" height="18" rx="5" />
        <Path d="M13 40v4m34-4v4" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        <P name="note-a" originX={28} originY={31}>
          <Path d="M30 22v9m0-9c2 .5 3.5 2 3.5 4" strokeWidth="2" />
          <Ellipse cx="27.8" cy="31.3" rx="2.5" ry="2" fill={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="1.8" />
        </P>
        <P name="note-b" originX={37} originY={33}>
          <Path d="M39 25v8m0-8c2 .5 3.5 2 3.5 4" strokeWidth="2" />
          <Ellipse cx="36.8" cy="33.3" rx="2.5" ry="2" fill={mono ? '#C6C2C4' : '#C6A2FF'} strokeWidth="1.8" />
        </P>
        <P name="sparkle" originX={56} originY={11}>
          <Path
            d="M56 8c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function StudyLaptop({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Rect x="13" y="13" width="38" height="28" rx="3" fill={outline} stroke={outline} strokeWidth="8.5" />
          <Rect x="17.5" y="17.5" width="29" height="19" rx="1.5" fill={outline} stroke={outline} strokeWidth="8" />
          <Path d="m19.5 34 7-14.5m-3 14.5 5-10.5" fill="none" stroke={outline} strokeWidth="7.6" />
          <Path d="M29 23.5 25 27l4 3.5m6-7 4 3.5-4 3.5m-1.8-8-2.4 9" fill="none" stroke={outline} strokeWidth="8" />
          <P name="cursor" originX={42} originY={32}>
            <Path d="M41 33.5h3" fill="none" stroke={outline} strokeWidth="8.2" />
          </P>
          <Path d="M7 49h50l-5-8H12z" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M27.5 44.5h9" fill="none" stroke={outline} strokeWidth="8" />
          <Path d="m14.5 45.5 1.2-1.8" fill="none" stroke={outline} strokeWidth="8" />
          <P name="sparkle-a" originX={55} originY={9}>
            <Path
              d="M55 4.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
              fill={outline}
              stroke={outline}
              strokeWidth="7.8"
            />
          </P>
          <P name="sparkle-b" originX={8} originY={10}>
            <Path
              d="M8 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
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
        <Rect x="17.5" y="17.5" width="29" height="19" rx="1.5" fill={mono ? '#F6F2F4' : '#E3F3FF'} strokeWidth="2" />
        <Path d="m19.5 34 7-14.5m-3 14.5 5-10.5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="1.6" />
        <Circle cx="32" cy="15.3" r=".8" fill={mono ? '#545052' : '#3F2A33'} stroke="none" />
        <Path d="M29 23.5 25 27l4 3.5m6-7 4 3.5-4 3.5m-1.8-8-2.4 9" strokeWidth="2" />
        <P name="cursor" originX={42} originY={32}>
          <Path d="M41 33.5h3" stroke={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="2.2" />
        </P>
        <Path d="M7 49h50l-5-8H12z" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
        <Path d="M8.9 46h46.2l1.9 3H7z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
        <Path d="M7 49h50l-5-8H12z" />
        <Path d="M27.5 44.5h9" stroke={mono ? '#C6C2C4' : '#EBB53B'} strokeWidth="2" />
        <Path d="m14.5 45.5 1.2-1.8" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2" />
        <P name="sparkle-a" originX={55} originY={9}>
          <Path
            d="M55 4.5c.6 2.9 1.6 3.9 4.5 4.5-2.9.6-3.9 1.6-4.5 4.5-.6-2.9-1.6-3.9-4.5-4.5 2.9-.6 3.9-1.6 4.5-4.5"
            fill={mono ? '#E0DCDE' : '#FFD66B'}
            strokeWidth="1.8"
          />
        </P>
        <P name="sparkle-b" originX={8} originY={10}>
          <Path
            d="M8 7c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
      </G>
    </Svg>
  );
}

function StudyWordCard({ size = 64, outline, mono = false, part: P = StaticPart }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">
          <P name="card" originX={38} originY={48}>
            <Rect x="22" y="8" width="32" height="40" rx="5" fill="none" stroke={outline} strokeWidth="8.5" />
            <Path d="M26.5 11.8h5" fill="none" stroke={outline} strokeWidth="8.5" />
          </P>
          <Rect x="10" y="16" width="32" height="40" rx="5" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="m19 45 7-18 7 18m-11.2-6.5h8.4" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M18 50.5h16" fill="none" stroke={outline} strokeWidth="8.5" />
          <Path d="M15 21.5h5" fill="none" stroke={outline} strokeWidth="8.5" />
          <P name="sparkle" originX={51} originY={54}>
            <Path
              d="M51 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
              fill={outline}
              stroke={outline}
              strokeWidth="7.6"
            />
          </P>
        </G>
      ) : null}
      <G
        fill="none"
        stroke={mono ? '#545052' : '#3F2A33'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <P name="card" originX={38} originY={48}>
          <Rect x="22" y="8" width="32" height="40" rx="5" fill={mono ? '#E0DCDE' : '#FFD66B'} stroke="none" />
          <Path d="M49 8a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5z" fill={mono ? '#C6C2C4' : '#EBB53B'} stroke="none" />
          <Rect x="22" y="8" width="32" height="40" rx="5" />
          <Path d="M26.5 11.8h5" stroke={mono ? '#FFFFFF' : '#FFFFFF'} strokeWidth="2.5" />
        </P>
        <Rect x="10" y="16" width="32" height="40" rx="5" fill={mono ? '#FFFFFF' : '#FFFFFF'} stroke="none" />
        <Path d="M37 16a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5z" fill={mono ? '#F6F2F4' : '#F5EEF1'} stroke="none" />
        <Rect x="10" y="16" width="32" height="40" rx="5" />
        <Path d="m19 45 7-18 7 18m-11.2-6.5h8.4" />
        <Path d="M18 50.5h16" stroke={mono ? '#B9B5B7' : '#FF7BA9'} strokeWidth="2.5" />
        <Path d="M15 21.5h5" stroke={mono ? '#E0DCDE' : '#FFD66B'} strokeWidth="2.5" />
        <P name="sparkle" originX={51} originY={54}>
          <Path
            d="M51 51c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3"
            fill={mono ? '#CFCBCD' : '#FFA3C3'}
            strokeWidth="1.6"
          />
        </P>
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

/** 每个图标有哪些可动部件（按出现顺序） */
export const projectIconParts: Record<ProjectIconId, readonly string[]> = {
  'collect/balloon': ['balloon', 'sparkle-a', 'sparkle-b'],
  'collect/clover': ['leaf', 'sparkle-a', 'sparkle-b'],
  'collect/crown': ['sparkle-a', 'sparkle-b'],
  'collect/flower': ['leaf-left', 'leaf-right', 'head'],
  'collect/heart': ['heart', 'sparkle-a', 'sparkle-b'],
  'collect/rainbow': ['cloud-left', 'cloud-right', 'sparkle-a', 'sparkle-b'],
  'collect/rocket': ['flame', 'sparkle-a', 'sparkle-b'],
  'collect/star': ['star', 'sparkle-a', 'sparkle-b'],
  'habit/briefcase': ['clasp', 'sparkle-a', 'sparkle-b'],
  'habit/coffee-off': ['steam', 'badge', 'sparkle-a'],
  'habit/owl': ['wing-left', 'wing-right', 'sparkle-a', 'sparkle-b'],
  'habit/phone-off': ['badge', 'sparkle-a', 'sparkle-b'],
  'health/alarm': ['bell-left', 'bell-right'],
  'health/apple': ['leaf', 'sparkle'],
  'health/milk': ['drop', 'sparkle'],
  'health/moon': ['moon', 'sparkle-a', 'sparkle-b', 'cloud'],
  'health/pill': ['capsule', 'sparkle'],
  'health/sun': ['rays'],
  'health/water-cup': ['bubbles', 'wave', 'lemon'],
  'hobby/camera': ['lens', 'sparkle-a', 'sparkle-b'],
  'hobby/cupcake': ['cherry', 'sparkle-a', 'sparkle-b'],
  'hobby/music-disc': ['note-a', 'sparkle-a'],
  'hobby/palette': ['sparkle-a', 'sparkle-b'],
  'hobby/potted-plant': ['leaf-left', 'leaf-right'],
  'life/broom': ['cloud-dust', 'sparkle-a', 'sparkle-b'],
  'life/cat-bowl': ['fish', 'sparkle-a', 'sparkle-b'],
  'life/pan': ['egg', 'sparkle-a', 'sparkle-b'],
  'life/piggy-bank': ['coin', 'sparkle-a', 'sparkle-b'],
  'life/watering-can': ['drop', 'sparkle-a'],
  'mind/lotus': ['leaf-left', 'leaf-right', 'sparkle-a', 'sparkle-b'],
  'mind/love-letter': ['heart', 'sparkle-a', 'sparkle-b'],
  'mind/smile-sun': ['rays'],
  'mind/soft-cloud': ['cloud', 'sparkle-a', 'sparkle-b'],
  'sport/basketball': ['ball', 'sparkle-a', 'sparkle-b'],
  'sport/bicycle': ['speed', 'sparkle-a'],
  'sport/dumbbell': ['drop', 'sparkle-a', 'sparkle-b'],
  'sport/footprints': ['foot-left', 'foot-right', 'sparkle-a', 'sparkle-b'],
  'sport/sneaker': ['speed', 'sparkle-a'],
  'study/book': ['ribbon', 'sparkle-a', 'sparkle-b'],
  'study/diary': ['ribbon', 'sparkle-a', 'sparkle-b'],
  'study/headphones': ['note-a', 'note-b', 'sparkle'],
  'study/laptop': ['cursor', 'sparkle-a', 'sparkle-b'],
  'study/word-card': ['card', 'sparkle'],
};

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
