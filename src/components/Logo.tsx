import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, G, Mask, Path, RadialGradient, Stop } from 'react-native-svg';

// Brand mark: the "N" (left drop, ribbon, right drop) and the dot above it, from the logo the
// user exported from Figma (node 40:374) without the "nilemy" wordmark. Coordinates are the
// export's; the square viewBox centres the mark.
const VIEW_BOX = '117.5 -27.5 380 380';

const GRADIENTS = {
  left: { cx: 339, cy: -20.3, r: 360.8, stops: [[0.526, '#D87982'], [0.621, '#DE8289'], [0.716, '#E68D93'], [0.81, '#EA989C'], [0.905, '#EC9EA1'], [1, '#EB9B9E']] },
  right: { cx: 543, cy: 101, r: 194.8, stops: [[0.487, '#F8B3AF'], [0.692, '#F7B0AD'], [0.795, '#F4A9A8'], [0.897, '#F1A0A1'], [1, '#EC9598']] },
  dot: { cx: 467.8, cy: 18, r: 85.2, stops: [[0.272, '#F2A8A7'], [0.563, '#F1A5A5'], [0.709, '#EFA0A1'], [0.854, '#EC9A9C'], [1, '#E89296']] },
  ribbon: { cx: 73.5, cy: 64, r: 449.7, stops: [[0.149, '#FABEB7'], [0.32, '#FDD1C8'], [0.49, '#FDCDC4'], [0.66, '#FDC9C1'], [1, '#FDC8C0']] },
} as const;

type Part = 'left' | 'ribbon' | 'right';

const SHAPES: Record<Part, string> = {
  left: 'M195 310.5C181.32 311.83 169.13 306.02 159.01 297.32C154.15 293.15 150.89 288.34 147.58 282.92C146.37 280.93 144.94 279.08 143.88 276.99C133.85 257.25 133.69 232.15 138.9 211.05C142.88 194.88 149.39 180.47 149.65 163.48C149.86 148.97 146.47 135.15 141.55 121.56C134.59 102.37 125.22 83.53 126.57 62.55C126.69 60.69 128.88 50.88 129.85 49.75C130.38 49.14 131.14 49.13 131.85 49.39C136.04 50.92 137.13 56.23 139.32 59.59C140.68 61.66 142.65 63.97 144.49 65.62C154.51 74.65 166.35 81.3 178.04 87.86C193.98 96.81 210.25 105.12 225.2 115.7C228.3 117.89 231.59 119.93 234.51 122.36C236.84 124.3 238.57 126.73 240.65 128.89C241.93 130.22 243.44 131.24 244.74 132.52C246.28 134.02 247.48 135.86 248.85 137.51C251.59 140.79 256.15 146.09 257.54 150.08C258.51 152.84 251.53 145.31 251.28 145.09C246.93 141.25 242.53 137.46 238.03 133.81C237.01 132.97 236.19 131.89 235.08 131.16C234.69 130.9 234.06 130.51 233.56 130.69C232.52 131.08 234.64 132.93 234.93 133.21C244.86 142.97 251.81 154.47 257.98 166.83C262.75 176.39 266.02 186.6 268.13 197.05C275.27 232.32 264.22 260.72 239.83 286.32C228.1 298.62 212.21 308.83 195 310.5Z',
  right: 'M459.48 272.05C454.98 272.87 450.1 272.1 445.64 271.39C422.64 267.73 407.14 255.89 391.11 239.86C385.3 234.05 378.46 226.66 374.24 219.61C372.92 217.41 372.5 215.02 371.6 212.66C369.89 208.14 367.86 203.85 366.72 199.11C366.59 198.57 365.85 195.11 366.38 194.98C366.82 194.86 367.43 196.05 367.61 196.31C370.03 199.86 372.47 203.44 374.79 207.06C375.77 208.59 376.49 210.3 377.72 211.66C377.96 211.93 378.5 212.55 378.95 212.4C379.39 212.24 379.1 211.42 379.01 211.15C377.88 207.69 376.3 204.35 375.1 200.9C373.43 196.07 372.91 190.73 372.58 185.65C371.45 167.98 374.45 153.22 381.67 137.11C384.45 130.91 387.72 124.77 392.13 119.57C395.5 115.59 398.55 111.53 402.43 108.01C418.76 93.2 434.87 94.58 447.43 112.94C451.56 118.98 454.42 125.85 457.52 132.44C462.63 143.31 467.76 154.09 472.17 165.26C481.17 188.02 488.34 210.05 488.54 234.83C488.59 241.61 488.24 248.99 485.6 255.27C484.74 257.33 485.04 259.87 483.7 261.77C483.14 262.56 482.26 263.12 481.52 263.73C475.24 268.93 467.3 270.63 459.48 272.05Z',
  ribbon: 'M418.5 311.01C379.15 313.52 348.58 292.62 327.26 260.89C313.31 240.15 303.23 217.23 290.53 195.77C279.15 176.52 265.64 158.65 249.03 143.61C244.77 139.75 240.39 135.66 235.78 132.23C234.8 131.5 233.71 131.8 233.05 131.26C231.97 130.36 231.12 129.2 230 128.31C223.58 123.21 216.67 118.59 209.73 114.24C200.17 108.26 190.16 102.99 180.28 97.55C163.71 88.42 138.3 76.19 130.01 58.41C129.48 57.26 128.4 56.01 128.24 54.74C127.89 51.9 129.51 49.38 130.72 47C131.55 45.38 131.96 43.58 132.86 42C136.24 36.03 141.51 30.73 146.96 26.62C163.3 14.27 183.98 9.91 204.08 13.33C220.25 16.08 235.6 21.65 249.94 29.55C258.02 33.99 266.16 38.98 273.26 44.89C276.46 47.55 279.35 50.58 282.38 53.42C284.81 55.69 287.43 57.81 289.64 60.29C292.2 63.14 294.36 66.32 296.76 69.3C298.34 71.24 300.13 72.98 301.66 74.96C309.18 84.7 315.73 95.18 321.84 105.84C324.15 109.87 326.05 114.16 328.24 118.26C331.91 125.11 335.93 131.85 339.3 138.86C343.25 147.07 346.88 155.43 350.86 163.64C352.02 166.04 353.48 168.26 354.7 170.62C356.23 173.56 357.45 176.66 358.95 179.61C360.92 183.46 363.16 187.15 365.13 190.99C369.04 198.64 374.26 205.56 379.16 212.55C379.88 213.58 380.2 214.85 380.89 215.91C383.28 219.61 386.17 223.19 388.97 226.58C404.04 244.83 424.52 261.51 448.72 264.33C452 264.71 455.35 265.01 458.66 264.65C468.67 263.57 473.55 260.37 481.18 254.35C481.99 253.71 483.04 253.18 484.03 253.78C487.34 255.78 484.59 261.04 483.59 263.6C472.75 291.47 448.35 309.11 418.5 311.01Z',
};

// The dot is drawn as a circle so the animation can grow it.
const DOT = { cx: 424, cy: 49.8, r: 34.4 };

// Paths the animation "draws" along, one per part (in drawing order), with a stroke wide
// enough to cover the part and the path's length. They start and end outside the shapes so
// the butt caps never show.
const STROKES: Record<Part, { d: string; width: number; length: number }> = {
  left: { d: 'M205 345 C212 250 180 200 168 150 C158 110 140 80 118 10', width: 170, length: 349 },
  ribbon: { d: 'M92 62 C150 25 220 25 268 72 C315 120 335 190 375 235 C410 275 450 295 515 240', width: 125, length: 549 },
  right: { d: 'M478 312 C425 240 412 180 420 140 C425 110 430 100 424 60', width: 150, length: 268 },
};

// Back to front, so the ribbon sits over the left drop like in the logo.
const ORDER: Part[] = ['left', 'right', 'ribbon'];

function Gradients({ id }: { id: string }) {
  return (
    <>
      {(Object.keys(GRADIENTS) as (keyof typeof GRADIENTS)[]).map((k) => {
        const g = GRADIENTS[k];
        return (
          <RadialGradient key={k} id={`${id}-${k}`} gradientUnits="userSpaceOnUse" cx={g.cx} cy={g.cy} r={g.r}>
            {g.stops.map(([offset, c]) => <Stop key={offset} offset={offset} stopColor={c} />)}
          </RadialGradient>
        );
      })}
    </>
  );
}

/** The mark on its own (A1, About, the lock screen). */
export function LogoMark({ size }: { size: number }) {
  const id = 'logo';
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs><Gradients id={id} /></Defs>
      {ORDER.map((p) => <Path key={p} d={SHAPES[p]} fill={`url(#${id}-${p})`} />)}
      <Circle {...DOT} fill={`url(#${id}-dot)`} />
    </Svg>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// I1 timeline (ms): the N is drawn like a path, left drop → ribbon → right drop, then the dot pops in.
const TIMING: Record<Part | 'dot', { delay: number; duration: number }> = {
  left: { delay: 0, duration: 420 },
  ribbon: { delay: 320, duration: 680 },
  right: { delay: 900, duration: 380 },
  dot: { delay: 1220, duration: 420 },
};
export const LOGO_ANIMATION_MS = TIMING.dot.delay + TIMING.dot.duration;

/** Splash mark that draws itself; shown finished straight away when Reduce Motion is on. */
export function AnimatedLogoMark({ size, onDone }: { size: number; onDone?: () => void }) {
  const [progress] = useState(() => ({
    left: new Animated.Value(0), ribbon: new Animated.Value(0), right: new Animated.Value(0), dot: new Animated.Value(0),
  }));

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          Object.values(progress).forEach((v) => v.setValue(1));
          onDone?.();
          return;
        }
        const draw = (p: Part) =>
          Animated.timing(progress[p], { toValue: 1, ...TIMING[p], easing: Easing.inOut(Easing.cubic), useNativeDriver: false });
        Animated.parallel([
          draw('left'), draw('ribbon'), draw('right'),
          Animated.timing(progress.dot, { toValue: 1, ...TIMING.dot, easing: Easing.out(Easing.back(2.4)), useNativeDriver: false }),
        ]).start(({ finished }) => finished && onDone?.());
      });
    return () => {
      cancelled = true;
    };
    // onDone is read once; the animation runs on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const id = 'splash';
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <Gradients id={id} />
        {ORDER.map((p) => (
          <Mask key={p} id={`${id}-mask-${p}`} maskUnits="userSpaceOnUse" x={100} y={-40} width={440} height={400}>
            <AnimatedPath
              d={STROKES[p].d}
              stroke="#fff"
              strokeWidth={STROKES[p].width}
              fill="none"
              strokeDasharray={[STROKES[p].length, STROKES[p].length]}
              strokeDashoffset={progress[p].interpolate({ inputRange: [0, 1], outputRange: [STROKES[p].length, 0] })}
            />
          </Mask>
        ))}
      </Defs>
      {ORDER.map((p) => (
        <G key={p} mask={`url(#${id}-mask-${p})`}>
          <Path d={SHAPES[p]} fill={`url(#${id}-${p})`} />
        </G>
      ))}
      <AnimatedCircle cx={DOT.cx} cy={DOT.cy} r={progress.dot.interpolate({ inputRange: [0, 1], outputRange: [0, DOT.r] })} fill={`url(#${id}-dot)`} />
    </Svg>
  );
}
