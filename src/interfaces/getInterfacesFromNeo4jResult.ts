import { mutateDeepLeft } from "../utils/mutateDeepLeft";
import { QueryResult } from "neo4j-driver";

export interface Options {
  destructureNumbersObject: boolean;
  startDepth: number;
  additionalProps: {
    nodes: { [propertyName: string]: string };
    edges: { [propertyName: string]: string };
  };
}

export const getInterfacesFromNeo4jResult = (
  result: QueryResult,
  options?: Partial<Options>
) => {
  const _options = Object.assign(
    {
      destructureNumbersObject: false,
      startDepth: 0,
      additionalProps: { nodes: {}, edges: {} },
    },
    options || {}
  );
  const dictionary = { nodes: {}, edges: {} };
  let i = 0;
  for (const record of result.records) {
    for (const key of record.keys) {
      const entity = record.get(key);
      const typeKey = entity.type === undefined ? "nodes" : "edges";
      const name =
        entity.type || (entity.labels && entity.labels[0]) || `unknown${++i}`;

      mutateDeepLeft(dictionary, {
        [typeKey]: {
          [name]: {
            ..._options.additionalProps[typeKey],
            ...getPropertyType(
              entity.properties,
              _options.destructureNumbersObject
            ),
          },
        },
      });
    }
  }

  return dictionary;
};

const getPropertyType = (prop, destructureNumbersObject: boolean) => {
  if (typeof prop === "object") {
    if (
      destructureNumbersObject &&
      Object.keys(prop).length === 2 &&
      prop.hasOwnProperty("high") &&
      prop.hasOwnProperty("low") &&
      typeof prop.high === "number" &&
      typeof prop.low === "number"
    ) {
      return "number";
    } else if (Array.isArray(prop)) {
      return `${getPropertyType(prop[0], destructureNumbersObject)}[]`;
    } else {
      return Object.keys(prop).reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: getPropertyType(prop[curr], destructureNumbersObject),
        }),
        {}
      );
    }
  } else {
    return typeof prop;
  }
};
