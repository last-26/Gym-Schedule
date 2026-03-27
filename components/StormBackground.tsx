import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const RAINDROP_COUNT = 40;

interface RaindropConfig {
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  height: number;
}

interface BoltSegment {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: string;
}

interface BranchSegment extends BoltSegment {
  opacity: number;
}

interface BoltData {
  segments: BoltSegment[];
  branches: BranchSegment[];
  key: number;
}

function generateBolt(): BoltData {
  const segments: BoltSegment[] = [];
  const branches: BranchSegment[] = [];
  let x = SCREEN_WIDTH * 0.15 + Math.random() * SCREEN_WIDTH * 0.7;
  let y = 0;
  // End between 75% and 95% of screen height — always different
  const endY = SCREEN_HEIGHT * (0.85 + Math.random() * 0.1);
  const totalSegments = 10 + Math.floor(Math.random() * 8);
  const segmentHeight = endY / totalSegments;

  for (let i = 0; i < totalSegments; i++) {
    const offsetX = (Math.random() - 0.5) * 90;
    const nextX = x + offsetX;
    const nextY = y + segmentHeight;

    const dx = nextX - x;
    const dy = nextY - y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dx, dy) * (180 / Math.PI);

    segments.push({
      x: x,
      y: y,
      width: 2.5 - (i * 0.12),
      height: length,
      rotate: `${-angle}deg`,
    });

    // Random branch
    if (Math.random() > 0.6) {
      const branchOffsetX = (Math.random() - 0.5) * 70;
      const branchLength = segmentHeight * (0.5 + Math.random() * 0.7);
      const branchAngle = Math.atan2(branchOffsetX, branchLength) * (180 / Math.PI);

      branches.push({
        x: (x + nextX) / 2,
        y: (y + nextY) / 2,
        width: 1.5,
        height: branchLength,
        rotate: `${-branchAngle}deg`,
        opacity: 0.5 + Math.random() * 0.3,
      });
    }

    x = nextX;
    y = nextY;
  }

  return { segments, branches, key: Date.now() };
}

function Raindrop({ config }: { config: RaindropConfig }) {
  const translateY = useRef(new Animated.Value(-config.height)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(-config.height);
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT + 20,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.raindrop,
        {
          left: config.left,
          height: config.height,
          opacity: config.opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function StormBackground() {
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const [bolt, setBolt] = useState<BoltData | null>(null);

  useEffect(() => {
    const strike = () => {
      const delay = 4000 + Math.random() * 7000;
      setTimeout(() => {
        setBolt(generateBolt());

        Animated.sequence([
          // Bolt + bright flash
          Animated.parallel([
            Animated.timing(boltOpacity, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(flashOpacity, {
              toValue: 0.3,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
          // Quick dim
          Animated.parallel([
            Animated.timing(flashOpacity, {
              toValue: 0.03,
              duration: 90,
              useNativeDriver: true,
            }),
            Animated.timing(boltOpacity, {
              toValue: 0.3,
              duration: 90,
              useNativeDriver: true,
            }),
          ]),
          // Second flash (aftershock)
          Animated.parallel([
            Animated.timing(flashOpacity, {
              toValue: 0.18,
              duration: 40,
              useNativeDriver: true,
            }),
            Animated.timing(boltOpacity, {
              toValue: 0.85,
              duration: 40,
              useNativeDriver: true,
            }),
          ]),
          // Fade out
          Animated.parallel([
            Animated.timing(flashOpacity, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(boltOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => strike());
      }, delay);
    };
    strike();
  }, []);

  const raindrops: RaindropConfig[] = useRef(
    Array.from({ length: RAINDROP_COUNT }, () => ({
      left: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 2000,
      duration: 600 + Math.random() * 600,
      opacity: 0.15 + Math.random() * 0.25,
      height: 15 + Math.random() * 25,
    })),
  ).current;

  return (
    <View style={styles.container} pointerEvents="none">
      {raindrops.map((config, i) => (
        <Raindrop key={i} config={config} />
      ))}

      {/* Lightning bolt */}
      {bolt && (
        <Animated.View
          key={bolt.key}
          style={[StyleSheet.absoluteFill, { opacity: boltOpacity }]}
        >
          {/* Main bolt segments */}
          {bolt.segments.map((seg, i) => (
            <View
              key={`s${i}`}
              style={[
                styles.boltSegment,
                {
                  left: seg.x,
                  top: seg.y,
                  width: seg.width,
                  height: seg.height,
                  transform: [{ rotate: seg.rotate }],
                },
              ]}
            />
          ))}
          {/* Glow behind main bolt */}
          {bolt.segments.map((seg, i) => (
            <View
              key={`g${i}`}
              style={[
                styles.boltGlow,
                {
                  left: seg.x - 4,
                  top: seg.y,
                  width: seg.width + 8,
                  height: seg.height,
                  transform: [{ rotate: seg.rotate }],
                },
              ]}
            />
          ))}
          {/* Branch segments */}
          {bolt.branches.map((br, i) => (
            <View
              key={`b${i}`}
              style={[
                styles.boltBranch,
                {
                  left: br.x,
                  top: br.y,
                  width: br.width,
                  height: br.height,
                  opacity: br.opacity,
                  transform: [{ rotate: br.rotate }],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {/* Screen flash */}
      <Animated.View
        style={[styles.flash, { opacity: flashOpacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  raindrop: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(150, 180, 255, 0.4)',
    borderRadius: 1,
  },
  boltSegment: {
    position: 'absolute',
    backgroundColor: 'rgba(210, 230, 255, 0.95)',
    borderRadius: 1,
    transformOrigin: 'top center',
  },
  boltGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(150, 190, 255, 0.25)',
    borderRadius: 4,
    transformOrigin: 'top center',
  },
  boltBranch: {
    position: 'absolute',
    backgroundColor: 'rgba(190, 210, 255, 0.7)',
    borderRadius: 1,
    transformOrigin: 'top center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C8DCFF',
  },
});
