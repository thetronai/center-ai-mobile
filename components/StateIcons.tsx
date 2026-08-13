// Minimal inline line icons matching the Global States frames' style.
// No image assets used, per the client's note that none are needed for this screen.
import Svg, { Circle, Path } from "react-native-svg";

type IconProps = { color: string; size?: number };

export function WifiOffIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 3.5-2.5M19 12.5a10 10 0 0 0-2.7-2.2M12 20h.01M12 6.5c2.4 0 4.7.6 6.7 1.8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AlertIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path d="M12 8v5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 16h.01" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function InboxIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12h4l1.5 3h5L16 12h4M4 12l1.5-6.5A1 1 0 0 1 6.5 4.7h11a1 1 0 0 1 1 .8L20 12M4 12v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
