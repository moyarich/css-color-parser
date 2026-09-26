import { hslToRgb } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function HslToRgb() {
  return <FunctionExample params={[
    { name: "hue", label: "Hue", type: "number", defaultValue: "220" },
    { name: "saturation", label: "Saturation", type: "number", defaultValue: "80" },
    { name: "lightness", label: "Lightness", type: "number", defaultValue: "50" },
  ]} run={hslToRgb} />;
}
