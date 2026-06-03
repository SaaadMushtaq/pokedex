import { StyleSheet, Text, View } from "react-native";

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
  type: string;
  size?: "small" | "medium" | "large";
};

export default function TypeBadge({ type, size = "medium" }: Props) {
  const color = colorsByType[type] || "#999";

  const sizes = {
    small: { padding: 6, fontSize: 11 },
    medium: { padding: 8, fontSize: 12 },
    large: { padding: 10, fontSize: 14 },
  };

  const currentSize = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingHorizontal: currentSize.padding,
          paddingVertical: currentSize.padding / 2,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: currentSize.fontSize }]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
