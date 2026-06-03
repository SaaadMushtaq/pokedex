import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function SpinningIconLoader() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("@/assets/images/icon.png")}
        style={[
          styles.icon,
          {
            transform: [
              { rotate: spin },
              { rotateZ: "8deg" }, // Tilt to the right
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
