export function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.trim().replace("#", "");
  const sixDigitHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalizedHex;

  if (!/^[\da-fA-F]{6}$/.test(sixDigitHex)) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  const parsedHex = Number.parseInt(sixDigitHex, 16);
  const red = (parsedHex >> 16) & 255;
  const green = (parsedHex >> 8) & 255;
  const blue = parsedHex & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
