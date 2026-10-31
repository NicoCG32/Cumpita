import { describe, expect, it } from "vitest";
import { osmCategory } from "@/lib/categories";

describe("osmCategory", () => {
  it("papelerías y fotocopiadoras son librerías", () => {
    expect(osmCategory({ shop: "stationery" })).toBe("libreria");
    expect(osmCategory({ shop: "copyshop" })).toBe("libreria");
  });
  it("almacenes, supermercados y tiendas de servicentro son minimarkets", () => {
    expect(osmCategory({ shop: "convenience" })).toBe("minimarket");
    expect(osmCategory({ shop: "supermarket" })).toBe("minimarket");
    expect(osmCategory({ amenity: "fuel", shop: "convenience", brand: "Copec" })).toBe(
      "minimarket",
    );
  });
  it("servicentro sin tienda no aparece", () => {
    expect(osmCategory({ amenity: "fuel" })).toBeNull();
  });
  it("ferreterías y tiendas de bricolaje son ferreterías", () => {
    expect(osmCategory({ shop: "hardware" })).toBe("ferreteria");
    expect(osmCategory({ shop: "doityourself" })).toBe("ferreteria");
  });
});
