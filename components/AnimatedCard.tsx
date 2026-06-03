import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import TypeBadge from "./TypeBadge";

const colorsByType: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

type Props = {
  name: string;
  type: string;
  image: string;
  index?: number;
  onPress: () => void;
  delay?: number;
};

export default function AnimatedCard({
  name,
  type,
  image,
  onPress,
  index = 0,
  delay = 0,
}: Props) {
  const translateX = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();

    onPress();
  };

  const typeColor = colorsByType[type] ?? "#888";
  const paddedIndex = String(index + 1).padStart(3, "0");

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateX }, { scale: cardScale }],
        },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View
          style={[styles.shadowLayer, { backgroundColor: `${typeColor}20` }]}
        />

        <LinearGradient
          colors={["#1a1a2e", "#16213e", `${typeColor}25`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View
            style={[styles.glowOrb, { backgroundColor: `${typeColor}18` }]}
          />

          <View
            style={[styles.glowOrbSmall, { backgroundColor: `${typeColor}10` }]}
          />

          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gloss}
          />

          <View style={styles.topRow}>
            <View>
              <Text style={styles.number}>#{paddedIndex}</Text>
              <Text style={styles.name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Text>
            </View>

            <TypeBadge type={type} size="small" />
          </View>

          <View style={styles.imageContainer}>
            <Animated.Image
              source={{ uri: image }}
              style={[
                styles.image,
                {
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },

  shadowLayer: {
    position: "absolute",
    top: 4,
    left: 2,
    right: -2,
    bottom: -4,
    borderRadius: 20,
    opacity: 0.4,
  },

  card: {
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
    backgroundColor: "#13132a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },

  glowOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -40,
    right: -30,
  },

  glowOrbSmall: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    top: 10,
    left: -20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  number: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    marginBottom: 2,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  imageContainer: {
    alignItems: "flex-end",
    height: 130,
    marginTop: -10,
  },

  image: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
});
