import SpinningIconLoader from "@/components/SpinningIconLoader";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Stat = {
  base_stat: number;
  stat: { name: string };
};

type Ability = {
  ability: { name: string };
  is_hidden: boolean;
};

type Move = {
  move: { name: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
    version_group: { name: string };
  }[];
};

type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    other: {
      "official-artwork": { front_default: string; front_shiny: string };
    };
  };
  types: { type: { name: string } }[];
  stats: Stat[];
  abilities: Ability[];
  moves: Move[];
};

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

const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "Sp.A",
  "special-defense": "Sp.D",
  speed: "SPD",
};

const statColors: Record<string, string> = {
  hp: "#FF6B6B",
  attack: "#FFA94D",
  defense: "#FFE066",
  "special-attack": "#74C0FC",
  "special-defense": "#8CE99A",
  speed: "#F783AC",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function getLevelUpMoves(moves: Move[]) {
  const result: { name: string; level: number }[] = [];
  for (const m of moves) {
    const levelUpEntries = m.version_group_details.filter(
      (d) => d.move_learn_method.name === "level-up",
    );
    if (levelUpEntries.length === 0) continue;
    const latest = levelUpEntries[levelUpEntries.length - 1];
    result.push({ name: m.move.name, level: latest.level_learned_at });
  }
  return result.sort((a, b) => a.level - b.level);
}

function TypeBadge({ type, color }: { type: string; color: string }) {
  return (
    <View
      style={[
        styles.typeBadge,
        { borderColor: color + "80", backgroundColor: color + "22" },
      ]}
    >
      <Text style={[styles.typeBadgeText, { color }]}>{capitalize(type)}</Text>
    </View>
  );
}

function AnimatedStatBar({
  stat,
  delay,
  typeColor,
}: {
  stat: Stat;
  delay: number;
  typeColor: string;
}) {
  const label = statLabels[stat.stat.name] ?? stat.stat.name;
  const color = statColors[stat.stat.name] ?? typeColor;
  const pct = Math.min(stat.base_stat / 255, 1);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: pct,
      delay,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, []);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{stat.base_stat}</Text>
      <View style={styles.statTrack}>
        <Animated.View
          style={[
            styles.statFill,
            {
              width: animatedWidth,
              backgroundColor: color,
              shadowColor: color,
              shadowOpacity: 0.6,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      </View>
    </View>
  );
}

function FadeSlideIn({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function Details() {
  const router = useRouter();

  const { name } = useLocalSearchParams<{ name: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shiny, setShiny] = useState(false);
  const imageScale = useRef(new Animated.Value(0.7)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const fetchPokemonDetails = useCallback(async () => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data: PokemonDetail = await res.json();
      setPokemon(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchPokemonDetails();
  }, [fetchPokemonDetails]);

  const animateImage = () => {
    imageScale.setValue(0.7);
    imageOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(imageScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (pokemon) animateImage();
  }, [pokemon]);

  useEffect(() => {
    animateImage();
  }, [shiny]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SpinningIconLoader />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#888" }}>Failed to load Pokémon.</Text>
      </View>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const primaryColor = colorsByType[primaryType] ?? "#aaa";
  const levelUpMoves = getLevelUpMoves(pokemon.moves);
  const totalStats = pokemon.stats.reduce((s, x) => s + x.base_stat, 0);
  const artworkUri = shiny
    ? pokemon.sprites.other["official-artwork"].front_shiny
    : pokemon.sprites.other["official-artwork"].front_default;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Pokédex</Text>
        </View>
      </LinearGradient>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <FadeSlideIn delay={0}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={["#1a1a2e", "#16213e", primaryColor + "30"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View
                style={[
                  styles.glowOrb,
                  { backgroundColor: primaryColor + "25" },
                ]}
              />
              <View
                style={[
                  styles.glowOrbSmall,
                  { backgroundColor: primaryColor + "15" },
                ]}
              />

              <Text style={styles.dexNumber}>
                #{String(pokemon.id).padStart(3, "0")}
              </Text>
              <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>

              <View style={styles.typeRow}>
                {pokemon.types.map((t) => (
                  <TypeBadge
                    key={t.type.name}
                    type={t.type.name}
                    color={colorsByType[t.type.name] ?? "#888"}
                  />
                ))}
              </View>

              <Animated.Image
                source={{ uri: artworkUri }}
                style={[
                  styles.artwork,
                  {
                    transform: [{ scale: imageScale }],
                    opacity: imageOpacity,
                  },
                ]}
              />

              <View style={styles.shinyToggle}>
                <Pressable
                  style={[
                    styles.shinyBtn,
                    !shiny && {
                      backgroundColor: primaryColor + "40",
                      borderColor: primaryColor,
                    },
                  ]}
                  onPress={() => setShiny(false)}
                >
                  <Text
                    style={[
                      styles.shinyBtnText,
                      !shiny && { color: primaryColor },
                    ]}
                  >
                    Normal
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.shinyBtn,
                    shiny && {
                      backgroundColor: "#FFD70040",
                      borderColor: "#FFD700",
                    },
                  ]}
                  onPress={() => setShiny(true)}
                >
                  <Text
                    style={[styles.shinyBtnText, shiny && { color: "#FFD700" }]}
                  >
                    ✦ Shiny
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={100}>
          <View style={styles.infoRow}>
            {[
              {
                label: "Height",
                value: `${(pokemon.height / 10).toFixed(1)} m`,
              },
              {
                label: "Weight",
                value: `${(pokemon.weight / 10).toFixed(1)} kg`,
              },
              { label: "Base Exp", value: String(pokemon.base_experience) },
            ].map((item) => (
              <View
                key={item.label}
                style={[styles.infoCard, { borderColor: primaryColor + "30" }]}
              >
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: primaryColor }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={180}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionAccent,
                  { backgroundColor: primaryColor },
                ]}
              />
              <Text style={styles.sectionTitle}>Base Stats</Text>
              <Text
                style={[
                  styles.totalBadge,
                  { backgroundColor: primaryColor + "22", color: primaryColor },
                ]}
              >
                {totalStats} total
              </Text>
            </View>
            {pokemon.stats.map((s, i) => (
              <AnimatedStatBar
                key={s.stat.name}
                stat={s}
                delay={i * 60}
                typeColor={primaryColor}
              />
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={260}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionAccent,
                  { backgroundColor: primaryColor },
                ]}
              />
              <Text style={styles.sectionTitle}>Abilities</Text>
            </View>
            {pokemon.abilities.map((a) => (
              <View
                key={a.ability.name}
                style={[
                  styles.abilityRow,
                  { borderColor: primaryColor + "20" },
                ]}
              >
                <View
                  style={[styles.abilityDot, { backgroundColor: primaryColor }]}
                />
                <Text style={styles.abilityName}>
                  {capitalize(a.ability.name)}
                </Text>
                {a.is_hidden && (
                  <View style={styles.hiddenBadge}>
                    <Text style={styles.hiddenText}>Hidden</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={340}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionAccent,
                  { backgroundColor: primaryColor },
                ]}
              />
              <Text style={styles.sectionTitle}>Level-up Moves</Text>
              <Text
                style={[
                  styles.totalBadge,
                  { backgroundColor: primaryColor + "22", color: primaryColor },
                ]}
              >
                {levelUpMoves.length}
              </Text>
            </View>
            <View style={styles.moveHeader}>
              <Text style={styles.moveHeaderText}>Move</Text>
              <Text style={styles.moveHeaderText}>Level</Text>
            </View>
            {levelUpMoves.map((m, i) => (
              <View
                key={m.name}
                style={[
                  styles.moveRow,
                  {
                    backgroundColor:
                      i % 2 === 0 ? primaryColor + "08" : "transparent",
                  },
                ]}
              >
                <Text style={styles.moveName}>{capitalize(m.name)}</Text>
                <View
                  style={[
                    styles.levelPill,
                    {
                      backgroundColor: primaryColor + "22",
                      borderColor: primaryColor + "40",
                    },
                  ]}
                >
                  <Text style={[styles.levelText, { color: primaryColor }]}>
                    {m.level === 0 ? "Evo" : `Lv ${m.level}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FadeSlideIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0d0d1a",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  container: {
    paddingBottom: 40,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0d0d1a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  heroSection: {
    marginBottom: 4,
  },
  heroGradient: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  glowOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -80,
    right: -60,
  },
  glowOrbSmall: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 20,
    left: -40,
  },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  backBtnText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 20,
  },
  dexNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  artwork: {
    width: 210,
    height: 210,
    resizeMode: "contain",
    marginVertical: 8,
  },
  shinyToggle: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 4,
    borderRadius: 99,
  },
  shinyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "transparent",
  },
  shinyBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#13132a",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  section: {
    backgroundColor: "#13132a",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionAccent: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    flex: 1,
  },
  totalBadge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
    width: 36,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    width: 32,
    textAlign: "right",
  },
  statTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#1e1e38",
    overflow: "hidden",
  },
  statFill: {
    height: 6,
    borderRadius: 99,
  },

  abilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  abilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  abilityName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ddd",
    flex: 1,
  },
  hiddenBadge: {
    backgroundColor: "#3a2e0a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFD70040",
  },
  hiddenText: {
    fontSize: 11,
    color: "#FFD700",
    fontWeight: "700",
  },

  moveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  moveHeaderText: {
    fontSize: 11,
    color: "#444",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  moveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  moveName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
