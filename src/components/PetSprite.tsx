import { getPet } from "@/lib/pets";

interface Props {
  petId?: string | null;
  size?: number;
  className?: string;
  float?: boolean;
}
export function PetSprite({ petId, size = 96, className = "", float = true }: Props) {
  const pet = getPet(petId);
  return (
    <img
      src={pet.image}
      alt={pet.name}
      width={size}
      height={size}
      loading="lazy"
      className={`${float ? "animate-float-soft" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
