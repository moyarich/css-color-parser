import { parseCssColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseCssColor() {
  return <FunctionExample params={[{ name: "value", label: "CSS color value", type: "text", defaultValue: "oklch(60% 0.15 250)" }]} run={parseCssColor} />;
}
