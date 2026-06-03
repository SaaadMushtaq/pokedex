import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function ShimmerLoader() {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.skeleton, animatedStyle]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#13132a",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  skeletonImage: {
    height: 150,
    backgroundColor: "#1e1e38",
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#1e1e38",
    borderRadius: 4,
    marginBottom: 8,
  },
});
