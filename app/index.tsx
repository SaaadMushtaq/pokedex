import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

type Pokemon = {
  name: string;
  url: string;
};

export type PokemonDetailed = {
  name: string;
  image: string;
  shinyImage: string;
  types: PokemonType[];
};

type PokemonType = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

const colorsByType = {
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

export default function Index() {
  const [pokemons, setPokemons] = useState<PokemonDetailed[]>([]);
  const fetchPokemons = async () => {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20",
      );
      const data = await response.json();

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();

          return {
            name: pokemon.name,
            image: details.sprites.other["official-artwork"].front_default,
            shinyImage: details.sprites.other["official-artwork"].front_shiny,
            types: details.types,
          };
        }),
      );
      setPokemons(detailedPokemons);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchPokemons();
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {pokemons.map((pokemon) => (
        <Link
          href={{ pathname: "/details", params: { name: pokemon.name } }}
          key={pokemon.name}
          style={[
            styles.card,
            {
              backgroundColor:
                colorsByType[
                  pokemon.types[0].type.name as keyof typeof colorsByType
                ] + "50",
            },
          ]}
        >
          <View>
            <Text style={styles.name}>{pokemon.name}</Text>
            <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: pokemon.image }} style={styles.image} />
              <Image
                source={{ uri: pokemon.shinyImage }}
                style={styles.image}
              />
            </View>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  image: {
    width: 150,
    height: 150,
  },
});
