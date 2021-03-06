import { QueryResult } from "neo4j-driver";
import { Graph } from "resolved-graph";

export interface Options {
  nameOfLinkTypePropInData: string;
  nameOfNodeLabelsPropInData: string;
  extractFirstNodeLabel: boolean;
  destructureNumberObjects: boolean;
}

export const getGraphFromNeo4jResult = (
  neo4jResult: QueryResult,
  options?: Partial<Options>
): Graph => {
  const _options: Options = Object.assign(
    {
      nameOfLinkTypePropInData: "_neo4j_type",
      nameOfNodeLabelsPropInData: "_neo4j_labels",
      extractFirstNodeLabel: false,
      destructureNumberObjects: false,
    },
    options || {}
  );

  const result = {
    nodes: {},
    links: {},
  };
  for (const record of neo4jResult.records) {
    for (const key of record.keys) {
      const entity = record.get(key);

      if (entity.start && entity.end) {
        const link = getLinkFromNeoEdge(
          entity,
          _options.nameOfLinkTypePropInData,
          _options.destructureNumberObjects
        );
        result.links[link.id] = link;
      } else {
        const node = getNodeFromNeoNode(
          entity,
          _options.nameOfNodeLabelsPropInData,
          _options.extractFirstNodeLabel,
          _options.destructureNumberObjects
        );
        result.nodes[node.id] = node;
      }
    }
  }
  return {
    nodes: Object.values(result.nodes),
    links: Object.values(result.links),
  };
};

const getDataFromNeoProps = (neoProp, destructureNumberObjects) => {
  if (
    destructureNumberObjects &&
    neoProp.low !== undefined &&
    neoProp.high !== undefined &&
    typeof neoProp.low === "number" &&
    typeof neoProp.high === "number" &&
    Object.keys(neoProp).length === 2
  ) {
    return neoProp.low + neoProp.high;
  } else if (typeof neoProp === "object") {
    if (Array.isArray(neoProp)) {
      return neoProp.map((v) =>
        getDataFromNeoProps(v, destructureNumberObjects)
      );
    } else {
      return Object.keys(neoProp).reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: getDataFromNeoProps(neoProp[curr], destructureNumberObjects),
        }),
        {}
      );
    }
  } else {
    return neoProp;
  }
};

const getNodeFromNeoNode = (
  neoNode,
  nameOfLabelsPropInData,
  extractFirstLabel,
  destructureNumberObjects
) => {
  return {
    id: (neoNode.identity.high + neoNode.identity.low).toString(),
    data: nameOfLabelsPropInData
      ? {
          [nameOfLabelsPropInData]: extractFirstLabel
            ? neoNode.labels[0]
            : neoNode.labels,
          ...getDataFromNeoProps(neoNode.properties, destructureNumberObjects),
        }
      : getDataFromNeoProps(neoNode.properties, destructureNumberObjects),
  };
};

const getLinkFromNeoEdge = (
  neoEdge,
  nameOfTypePropInData,
  destructureNumberObjects
) => {
  return {
    id: (neoEdge.identity.high + neoEdge.identity.low).toString(),
    from: (neoEdge.start.high + neoEdge.start.low).toString(),
    to: (neoEdge.end.high + neoEdge.end.low).toString(),
    data: nameOfTypePropInData
      ? {
          [nameOfTypePropInData]: neoEdge.type,
          ...getDataFromNeoProps(neoEdge.properties, destructureNumberObjects),
        }
      : getDataFromNeoProps(neoEdge.properties, destructureNumberObjects),
  };
};
