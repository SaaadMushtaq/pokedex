import { Image, StyleSheet, View } from "react-native";

export default function LogoHeader() {
  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
