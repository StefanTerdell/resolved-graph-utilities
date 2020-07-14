import { mutateDeepLeft } from "../utils/mutateDeepLeft";
import { QueryResult } from "neo4j-driver";

export interface Options {
  destructureNumberObjects: boolean;
  startDepth: number;
  nameOfLinkTypePropInData?: string;
  nameOfNodeLabelsPropInData?: string;
  // additionalProps: {
  //   nodes?: { [propertyName: string]: string };
  //   edges?: { [propertyName: string]: string };
  // };
}

export const getInterfacesFromNeo4jResult = (
  result: QueryResult,
  options?: Partial<Options>
): { [name: string]: { [property: string]: string | object } } => {
  const _options = Object.assign(
    {
      destructureNumberObjects: false,
      startDepth: 0,
      nameOfLinkTypePropInData: undefined,
      nameOfNodeLabelsPropInData: undefined,
      // additionalProps: { nodes: {}, edges: {} },
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
        entity.type ||
        (entity.labels && entity.labels.length && entity.labels[0]) ||
        `unknown${++i}`;

      const result = getPropertyType(
        entity.properties,
        _options.destructureNumberObjects
      );

      if (
        entity.labels &&
        entity.labels.length &&
        _options.nameOfNodeLabelsPropInData
      )
        result[_options.nameOfNodeLabelsPropInData] = entity.labels
          .map((l) => `'${l}'`)
          .join(" | ");

      if (entity.type && _options.nameOfLinkTypePropInData)
        result[_options.nameOfLinkTypePropInData] = `'${entity.type}'`;

      mutateDeepLeft(dictionary, {
        [typeKey]: {
          [name]: result,
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
