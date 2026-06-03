import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
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

function TypeBadge({ type }: { type: string }) {
  const color = colorsByType[type] ?? "#888";
  return (
    <View style={[styles.typeBadge, { backgroundColor: color + "33" }]}>
      <Text style={[styles.typeBadgeText, { color }]}>{capitalize(type)}</Text>
    </View>
  );
}

function StatBar({ stat }: { stat: Stat }) {
  const label = statLabels[stat.stat.name] ?? stat.stat.name;
  const color = statColors[stat.stat.name] ?? "#aaa";
  const pct = Math.min(stat.base_stat / 255, 1);

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{stat.base_stat}</Text>
      <View style={styles.statTrack}>
        <View
          style={[
            styles.statFill,
            {
              width: `${Math.round(pct * 100)}%` as any,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function Details() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load Pokémon.</Text>
      </View>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const headerBg = (colorsByType[primaryType] ?? "#aaa") + "30";
  const levelUpMoves = getLevelUpMoves(pokemon.moves);
  const totalStats = pokemon.stats.reduce((s, x) => s + x.base_stat, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={styles.dexNumber}>
          #{String(pokemon.id).padStart(3, "0")}
        </Text>
        <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>
        <View style={styles.typeRow}>
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>
        <Image
          source={{
            uri: pokemon.sprites.other["official-artwork"].front_default,
          }}
          style={styles.artwork}
        />
        <Image
          source={{
            uri: pokemon.sprites.other["official-artwork"].front_shiny,
          }}
          style={styles.artwork}
        />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Height</Text>
          <Text style={styles.infoValue}>
            {(pokemon.height / 10).toFixed(1)} m
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Weight</Text>
          <Text style={styles.infoValue}>
            {(pokemon.weight / 10).toFixed(1)} kg
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Base exp</Text>
          <Text style={styles.infoValue}>{pokemon.base_experience}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base stats</Text>
        {pokemon.stats.map((s) => (
          <StatBar key={s.stat.name} stat={s} />
        ))}
        <View style={[styles.statRow, styles.totalRow]}>
          <Text style={[styles.statLabel, styles.totalLabel]}>Total</Text>
          <Text style={[styles.statValue, styles.totalLabel]}>
            {totalStats}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        {pokemon.abilities.map((a) => (
          <View key={a.ability.name} style={styles.abilityRow}>
            <Text style={styles.abilityName}>{capitalize(a.ability.name)}</Text>
            {a.is_hidden && (
              <View style={styles.hiddenBadge}>
                <Text style={styles.hiddenText}>Hidden</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Level-up moves</Text>
        <View style={styles.moveHeader}>
          <Text style={styles.moveHeaderText}>Move</Text>
          <Text style={styles.moveHeaderText}>Level</Text>
        </View>
        {levelUpMoves.map((m) => (
          <View key={m.name} style={styles.moveRow}>
            <Text style={styles.moveName}>{capitalize(m.name)}</Text>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>
                {m.level === 0 ? "—" : `Lv ${m.level}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  dexNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    alignSelf: "flex-start",
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: "700",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 99,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  artwork: {
    width: 180,
    height: 180,
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    width: 36,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    width: 30,
    textAlign: "right",
  },
  statTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  statFill: {
    height: 6,
    borderRadius: 99,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: {
    color: "#333",
    fontWeight: "700",
  },

  abilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  abilityName: {
    fontSize: 15,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  hiddenBadge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hiddenText: {
    fontSize: 11,
    color: "#856404",
    fontWeight: "600",
  },

  moveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  moveHeaderText: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  moveName: {
    fontSize: 14,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  levelPill: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  levelText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
});
