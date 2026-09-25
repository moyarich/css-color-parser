import { extractCssColors } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ExtractCssColors() {
  return <FunctionExample params={[{ name: "source", label: "Source text", type: "text", defaultValue: "color: #06c; background: rebeccapurple;" }]} run={extractCssColors} />;
}
