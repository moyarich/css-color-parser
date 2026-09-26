import { parseHslColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseHslColor() {
  return <FunctionExample params={[{ name: "value", label: "HSL color", type: "text", defaultValue: "hsl(220 80% 50% / 0.8)" }]} run={parseHslColor} />;
}
