/**
 * Public runtime API for @moyarich/css-color-parser.
 *
 * Everything exported from this module is part of the package's supported
 * consumer-facing API and should be documented in the README and playground.
 */

// Source extraction.
export { extractCssColors } from "./extractCssColors";

// Named-color data.
export { CSS_NAMED_COLORS } from "./namedColors";

// Color parsing and conversion helpers.
export {
  hslToRgb,
  parseAlpha,
  parseCssColor,
  parseFunctionalComponents,
  parseHexColor,
  parseHslColor,
  parseHue,
  parseNamedColor,
  parsePercentage,
  parseRgbChannel,
  parseRgbColor,
} from "./parseCssColor";

// Public types.
export type {
  FunctionalComponents,
  ParsedCssColor,
} from "./parseCssColor";

export type {
  CssColorFormat,
  CssColorMatch,
  RgbaColor,
} from "./types";
