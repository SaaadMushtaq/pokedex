import AnimatedCard from "@/components/AnimatedCard";
import ShimmerLoader from "@/components/ShimmerLoader";
import SpinningIconLoader from "@/components/SpinningIconLoader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Pokemon = {
  name: string;
  url: string;
};

export type PokemonDetailed = {
  name: string;
  image: string;
  types: PokemonType[];
};

type PokemonType = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

const PAGE_SIZE = 10;

export default function Index() {
  const router = useRouter();
  const [pokemons, setPokemons] = useState<PokemonDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const isScrollingRef = useRef(false);

  const fetchPokemons = async (offset: number, append: boolean) => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      const data = await response.json();

      if (data.results.length < PAGE_SIZE) hasMoreRef.current = false;

      const detailed = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.other["official-artwork"].front_default,
            types: details.types,
          };
        }),
      );

      setPokemons((prev) => (append ? [...prev, ...detailed] : detailed));
      offsetRef.current = offset + PAGE_SIZE;
    } catch (e) {
      console.log(e);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    fetchPokemons(0, false);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!search) fetchPokemons(offsetRef.current, true);
  }, [search]);

  const handleCardPress = useCallback(
    (name: string) => {
      if (isScrollingRef.current) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({ pathname: "/details", params: { name } });
    },
    [router],
  );

  const filteredPokemons = search.trim()
    ? pokemons.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : pokemons;

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {search.trim()
          ? `No Pokémon found for "${search}"`
          : "No Pokémon found"}
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }: { item: PokemonDetailed; index: number }) => (
      <AnimatedCard
        name={item.name}
        type={item.types[0].type.name}
        image={item.image}
        onPress={() => handleCardPress(item.name)}
        index={index}
        delay={index < PAGE_SIZE ? index * 80 : 0}
      />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: PokemonDetailed) => item.name, []);

  const ListHeader = (
    <LinearGradient
      colors={["#1a1a2e", "#16213e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Pokédex</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokémon…"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
    </LinearGradient>
  );

  const ListFooter = loadingMore ? <SpinningIconLoader /> : null;

  if (loading) {
    return (
      <View style={styles.screen}>
        {ListHeader}
        <ShimmerLoader />
        <ShimmerLoader />
        <ShimmerLoader />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredPokemons}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={ListEmpty}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={10}
      initialNumToRender={PAGE_SIZE}
      onScrollBeginDrag={() => (isScrollingRef.current = true)}
      onScrollEndDrag={() => {
        setTimeout(() => (isScrollingRef.current = false), 150);
      }}
      onMomentumScrollBegin={() => (isScrollingRef.current = true)}
      onMomentumScrollEnd={() => {
        setTimeout(() => (isScrollingRef.current = false), 150);
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0d0d1a",
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
    paddingBottom: 32,
    backgroundColor: "#0d0d1a",
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },

  searchContainer: {
    marginTop: 14,
  },
  searchInput: {
    backgroundColor: "#13132a",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  footerLoader: {
    marginVertical: 20,
  },
});
