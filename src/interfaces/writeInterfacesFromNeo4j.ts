import {
  getInterfacesFromNeo4j,
  Options as _Options,
} from "./getInterfacesFromNeo4j";
import { writeFileSync } from "fs";
import { templateInterfacesFromDictionary } from "./templateInterface";

export interface Options extends _Options {
  fileName: string;
}

export const writeGraphFileFromNeo4j = (options?: Partial<Options>) => {
  const _options = Object.assign(
    { fileName: "results/interfaces.ts" },
    options || {}
  );
  getInterfacesFromNeo4j(_options).then((result) =>
    writeFileSync(_options.fileName, templateInterfacesFromDictionary(result))
  );
};

writeGraphFileFromNeo4j();
