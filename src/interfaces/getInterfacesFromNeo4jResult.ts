import { mutateDeepLeft } from "../utils/mutateDeepLeft";
import { QueryResult } from "neo4j-driver";

export interface Options {
  destructureNumberObjects: boolean;
  startDepth: number;
  additionalProps: {
    nodes?: { [propertyName: string]: string };
    edges?: { [propertyName: string]: string };
  };
}

export const getInterfacesFromNeo4jResult = (
  result: QueryResult,
  options?: Partial<Options>
): { [name: string]: { [property: string]: string | object } } => {
  const _options = Object.assign(
    {
      destructureNumberObjects: false,
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
              _options.destructureNumberObjects
            ),
          },
        },
      });
    }
  }

  return dictionary;
};

const getPropertyType = (prop, destructureNumberObjects: boolean) => {
  if (typeof prop === "object") {
    if (
      destructureNumberObjects &&
      Object.keys(prop).length === 2 &&
      prop.hasOwnProperty("high") &&
      prop.hasOwnProperty("low") &&
      typeof prop.high === "number" &&
      typeof prop.low === "number"
    ) {
      return "number";
    } else if (Array.isArray(prop)) {
      return `${getPropertyType(prop[0], destructureNumberObjects)}[]`;
    } else {
      return Object.keys(prop).reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: getPropertyType(prop[curr], destructureNumberObjects),
        }),
        {}
      );
    }
  } else {
    return typeof prop;
  }
};
