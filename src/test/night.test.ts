import { describe, it, expect } from "vitest";
import { is24h, isServicentro, norm, ZONES } from "@/lib/places";

describe("madrugada y zonas", () => {
  it("detecta 24 horas solo con horario 24/7", () => {
    expect(is24h({ openingHours: "24/7" })).toBe(true);
    expect(is24h({ openingHours: "Mo-Su 08:00-23:00" })).toBe(false);
  });
  it("reconoce tiendas de servicentro", () => {
    expect(isServicentro({ name: "Pronto Copec Balmaceda" })).toBe(true);
    expect(isServicentro({ name: "Spacio1" })).toBe(true);
    expect(isServicentro({ name: "Almacén Doña Rosa" })).toBe(false);
  });
  it("busca sin tildes", () => expect(norm("Peñuelas Ávila")).toBe("penuelas avila"));
  it("incluye Coquimbo como ciudad", () => expect(ZONES.filter((z) => z.city === "Coquimbo").length).toBe(5));
});
