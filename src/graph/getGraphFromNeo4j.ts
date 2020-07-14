import * as neo4j from "neo4j-driver";
import {
  getGraphFromNeo4jResult,
  Options as _Options,
} from "./getGraphFromNeo4jResult";
import { getResultFromNeo4j } from "../utils/getResultFromNeo4j";

export interface Options extends _Options {
  url: string;
  auth: string;
}

export const getGraphFromNeo4j = async (options: Partial<Options>) => {
  const _options = Object.assign(
    {
      url: "bolt://localhost:7687",
      auth: neo4j.auth.basic("neo4j", "test"),
    },
    options
  );
  return getGraphFromNeo4jResult(await getResultFromNeo4j(_options), _options);
};
