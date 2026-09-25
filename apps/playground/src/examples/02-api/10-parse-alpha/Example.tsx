import { parseAlpha } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseAlpha() {
  return <FunctionExample params={[{ name: "value", label: "Alpha", type: "text", defaultValue: "75%", optional: true }]} run={parseAlpha} />;
}
