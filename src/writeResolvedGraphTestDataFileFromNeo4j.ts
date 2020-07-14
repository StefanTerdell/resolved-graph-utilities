import { getGraphFromNeo4jResult } from "./graph/getGraphFromNeo4jResult";
import { getInterfacesFromNeo4jResult } from "./interfaces/getInterfacesFromNeo4jResult";
import { templateInterfacesFromDictionary } from "./interfaces/templateInterface";
import { getResultFromNeo4j } from "./utils/getResultFromNeo4j";
import { writeFileSync } from "fs";

export const writeResolvedGraphTestDataFileFromNeo4j = (
  fileName: string = "results/rg-testdata.ts"
) =>
  getResultFromNeo4j().then((result) => {
    const interfaces = getInterfacesFromNeo4jResult(result, {
      destructureNumberObjects: true,
      startDepth: 1,
      nameOfLinkTypePropInData: "type",
      nameOfNodeLabelsPropInData: "type",
    });
    const graph = getGraphFromNeo4jResult(result, {
      nameOfLinkTypePropInData: "type",
      nameOfNodeLabelsPropInData: "type",
      extractFirstNodeLabel: true,
      destructureNumberObjects: true,
    });

    const template = `import { ResolvedGraph } from 'resolved-graph'

${templateInterfacesFromDictionary(interfaces)}

export default function() {
  return new ResolvedGraph<${Object.keys(interfaces.nodes).join(
    " | "
  )}, ${Object.keys(interfaces.edges).join(" | ")}>(${JSON.stringify(
      graph,
      null,
      2
    )
      .split("\n")
      .join("\n    ")})
}
`;

    writeFileSync(fileName, template);
  });

writeResolvedGraphTestDataFileFromNeo4j();
