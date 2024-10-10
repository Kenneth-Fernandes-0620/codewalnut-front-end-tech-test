import React, { forwardRef } from "react";
import externalStyles from "./styles.module.css";
import { PokemonType } from "./pokemonType";
import typeColors from "./typeColors";

interface PokemonCardProps {
  name: string;
  height: number;
  weight: number;
  image: string;
  onClick: () => void;
  types: PokemonType[];
}

const PokemonCard = forwardRef<HTMLDivElement, PokemonCardProps>(
  ({ name, height, weight, image, types, onClick }, ref) => {
    return (
      <div ref={ref} className={externalStyles.pokemonCard} onClick={onClick}>
        <h2>{name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}</h2>
        <img src={image} alt={name} />
        <p>Height: {height / 10} meters</p>
        <p>Weight: {weight / 10} kgs</p>
        <div>
          {types.map((type) => (
            <span
              key={type}
              style={{
                backgroundColor: typeColors[type],
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "15px",
                margin: "5px",
                display: "inline-block",
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalize */}
            </span>
          ))}
        </div>
      </div>
    );
  }
);

export default PokemonCard;
