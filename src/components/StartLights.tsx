import type { CSSProperties } from "react";

const lights = Array.from({ length: 5 }, (_, index) => index);

export function StartLights() {
  return (
    <div className="start-lights" aria-label="Opening signal lights">
      {lights.map((light) => (
        <span
          key={light}
          className="start-light"
          style={{ "--light-index": light } as CSSProperties}
        />
      ))}
    </div>
  );
}
