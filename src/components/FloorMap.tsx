import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg';
import { beacons, floorMap } from '../data';
import { colors } from '../theme/colors';
import type { Point } from '../types';

type Props = {
  width: number;
  height: number;
  userPosition?: Point | null;
  routePoints?: Point[];
  destination?: Point | null;
  showBeacons?: boolean;
  showNodes?: boolean;
};

export function FloorMapView({
  width,
  height,
  userPosition,
  routePoints = [],
  destination,
  showBeacons = true,
  showNodes = false,
}: Props) {
  const scale = useMemo(() => {
    const sx = width / floorMap.width;
    const sy = height / floorMap.height;
    return Math.min(sx, sy);
  }, [width, height]);

  const mapW = floorMap.width * scale;
  const mapH = floorMap.height * scale;
  const offsetX = (width - mapW) / 2;
  const offsetY = (height - mapH) / 2;

  const tx = (x: number) => offsetX + x * scale;
  const ty = (y: number) => offsetY + y * scale;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={colors.corridor} />
        <Rect
          x={offsetX}
          y={offsetY}
          width={mapW}
          height={mapH}
          fill="#E8EEF3"
          stroke={colors.border}
          strokeWidth={2}
        />

        {/* Main corridors */}
        <Rect
          x={tx(10.5)}
          y={ty(10)}
          width={18 * scale}
          height={7 * scale}
          fill="#F7FAFC"
        />
        <Rect
          x={tx(18.5)}
          y={ty(16)}
          width={3 * scale}
          height={12 * scale}
          fill="#F7FAFC"
        />

        {floorMap.rooms.map((room) => (
          <React.Fragment key={room.id}>
            <Rect
              x={tx(room.x)}
              y={ty(room.y)}
              width={room.width * scale}
              height={room.height * scale}
              fill={room.fill}
              stroke="#94A3B8"
              strokeWidth={1}
              rx={2}
            />
            <Text
              x={tx(room.x + room.width / 2)}
              y={ty(room.y + room.height / 2)}
              fill={colors.text}
              fontSize={Math.max(8, 9 * (scale / 12))}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {room.name}
            </Text>
          </React.Fragment>
        ))}

        {showNodes &&
          floorMap.nodes.map((node) => (
            <Circle
              key={node.id}
              cx={tx(node.x)}
              cy={ty(node.y)}
              r={2.5}
              fill="#94A3B8"
            />
          ))}

        {routePoints.length > 1 &&
          routePoints.slice(0, -1).map((p, i) => (
            <Line
              key={`seg-${i}`}
              x1={tx(p.x)}
              y1={ty(p.y)}
              x2={tx(routePoints[i + 1].x)}
              y2={ty(routePoints[i + 1].y)}
              stroke={colors.route}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

        {showBeacons &&
          beacons.map((b) => (
            <React.Fragment key={b.id}>
              <Circle cx={tx(b.x)} cy={ty(b.y)} r={5} fill={colors.beacon} opacity={0.85} />
              <Circle
                cx={tx(b.x)}
                cy={ty(b.y)}
                r={10}
                fill="none"
                stroke={colors.beacon}
                strokeWidth={1}
                opacity={0.35}
              />
            </React.Fragment>
          ))}

        {destination && (
          <Circle
            cx={tx(destination.x)}
            cy={ty(destination.y)}
            r={7}
            fill={colors.accent}
            stroke="#fff"
            strokeWidth={2}
          />
        )}

        {userPosition && (
          <>
            <Circle
              cx={tx(userPosition.x)}
              cy={ty(userPosition.y)}
              r={12}
              fill={colors.user}
              opacity={0.2}
            />
            <Circle
              cx={tx(userPosition.x)}
              cy={ty(userPosition.y)}
              r={6}
              fill={colors.user}
              stroke="#fff"
              strokeWidth={2}
            />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.corridor,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
