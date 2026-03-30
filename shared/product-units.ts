/** Standard product unit codes (UNECE/UN) for inventory and documents */
export const PRODUCT_UNITS = [
  { label: "Each", code: "EA" },
  { label: "Piece", code: "PC" },
  { label: "Unit", code: "UN" },
  { label: "Kilogram", code: "KG" },
  { label: "Gram", code: "G" },
  { label: "Milligram", code: "MG" },
  { label: "Liter", code: "L" },
  { label: "Milliliter", code: "ML" },
  { label: "Meter", code: "M" },
  { label: "Centimeter", code: "CM" },
  { label: "Millimeter", code: "MM" },
  { label: "Inch", code: "IN" },
  { label: "Foot", code: "FT" },
  { label: "Yard", code: "YD" },
  { label: "Square Meter", code: "M2" },
  { label: "Cubic Meter", code: "M3" },
  { label: "Dozen", code: "DZ" },
  { label: "Pack", code: "PK" },
  { label: "Box", code: "BX" },
  { label: "Carton", code: "CT" },
  { label: "Bundle", code: "BD" },
  { label: "Roll", code: "RL" },
  { label: "Set", code: "ST" },
  { label: "Pair", code: "PR" },
  { label: "Case", code: "CS" },
] as const;

export const PRODUCT_UNIT_CODES = new Set(
  PRODUCT_UNITS.map((u) => u.code)
);

export function defaultProductUnit(): string {
  return "EA";
}
