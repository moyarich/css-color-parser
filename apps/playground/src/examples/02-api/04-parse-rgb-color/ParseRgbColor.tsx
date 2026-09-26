import { parseRgbColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseRgbColor() {
  return <FunctionExample params={[{ name: "value", label: "RGB color", type: "text", defaultValue: "rgb(255 0 0 / 50%)" }]} run={parseRgbColor} />;
}
