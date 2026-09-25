import { parseFunctionalComponents } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseFunctionalComponents() {
  return <FunctionExample params={[{ name: "body", label: "Function body", type: "text", defaultValue: "255 0 0 / 50%" }]} run={parseFunctionalComponents} />;
}
