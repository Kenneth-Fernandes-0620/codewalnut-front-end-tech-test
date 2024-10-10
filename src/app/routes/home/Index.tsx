"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import PokemonCard from "./PokemonCard";
import externalStyles from "./styles.module.css";
import { PokemonType } from "./pokemonType";

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: { type: { name: PokemonType } }[];
}

const MAX_ITEMS_PER_LOAD = 50; // Load 100 items per request

export default function IndexPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0); // Track the offset for pagination
  const [hasMore, setHasMore] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPokemonElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prev) => prev + MAX_ITEMS_PER_LOAD);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${MAX_ITEMS_PER_LOAD}&offset=${offset}`,
        );
        const data = await response.json();
        const detailedPokemonPromises = data.results.map(
          async (pokemon: { url: string }) => {
            const pokeResponse = await fetch(pokemon.url);
            return pokeResponse.json();
          },
        );
        const detailedPokemonList: Pokemon[] = await Promise.all(
          detailedPokemonPromises,
        );

        setPokemonList((prevList) => [...prevList, ...detailedPokemonList]);
        setHasMore(detailedPokemonList.length === MAX_ITEMS_PER_LOAD);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchPokemon();
  }, [offset]); // Fetch new Pokémon when offset changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCardClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPokemon(null);
  };

  const filteredPokemonList = query
    ? pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query.toLowerCase()),
      )
    : pokemonList;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #3a6186, #89253e)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: "flex", margin: "20px" }}
        >
          <input
            type="text"
            placeholder="Search for Pokémon"
            value={query}
            onChange={handleInputChange}
            style={{
              color: "black",
              width: "300px",
              padding: "10px 20px",
              fontSize: "16px",
              border: "2px solid #000",
              borderRadius: "25px",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          />
          <IconButton aria-label="search">
            <SearchIcon sx={{ color: "white" }} />
          </IconButton>
        </form>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", margin: "20px" }}
        >
          <CircularProgress sx={{ color: "white" }} />
        </div>
      ) : (
        <div className={externalStyles.pokemonitems}>
          {filteredPokemonList.length === 0 ? (
            <h1
              style={{
                color: "white",
                textAlign: "center",
                gridColumn: "1 / -1",
              }}
            >
              No Pokémon Found
            </h1>
          ) : (
            filteredPokemonList.map((pokemon, index) => {
              const cardProps = {
                name: pokemon.name,
                height: pokemon.height,
                weight: pokemon.weight,
                image: pokemon.sprites.front_default,
                types: pokemon.types.map((typeInfo) => typeInfo.type.name),
                onClick: () => handleCardClick(pokemon),
              };

              return index === filteredPokemonList.length - 1 ? (
                <PokemonCard
                  ref={lastPokemonElementRef}
                  {...cardProps}
                  key={pokemon.id}
                />
              ) : (
                <PokemonCard {...cardProps} key={pokemon.id} />
              );
            })
          )}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          {(selectedPokemon?.name?.charAt(0).toUpperCase() || "") +
            (selectedPokemon?.name?.slice(1) || "")}{" "}
          Details
        </DialogTitle>
        <DialogContent>
          {selectedPokemon && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={selectedPokemon.sprites.front_default}
                alt={selectedPokemon.name}
                style={{ width: "100px", height: "100px", marginRight: "20px" }}
              />
              <div>
                <p>
                  <strong>Name:</strong> {selectedPokemon.name}
                </p>
                <p>
                  <strong>Height:</strong> {selectedPokemon.height / 10} m
                </p>
                <p>
                  <strong>Weight:</strong> {selectedPokemon.weight / 10} kg
                </p>
                <p>
                  <strong>ID:</strong> {selectedPokemon.id}
                </p>
                <p>
                  <strong>Types:</strong>{" "}
                  {selectedPokemon.types
                    .map((type) => type.type.name)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
