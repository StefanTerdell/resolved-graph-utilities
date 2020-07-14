import { getGraphFromNeo4j, Options as _Options } from "./getGraphFromNeo4j";
import { writeFileSync } from "fs";

export interface Options extends _Options {
  fileName: string;
}

export const writeGraphFileFromNeo4j = (options?: Partial<Options>) => {
  const _options = Object.assign(
    { fileName: "results/graph.json" },
    options || {}
  );
  getGraphFromNeo4j(_options).then((graph) =>
    writeFileSync(_options.fileName, JSON.stringify(graph, null, 2))
  );
};

writeGraphFileFromNeo4j({
  fileName: "Movies.json",
  nameOfLinkTypePropInData: "type",
  nameOfNodeLabelsPropInData: "type",
  extractFirstNodeLabel: true,
});
