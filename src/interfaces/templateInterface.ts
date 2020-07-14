export const templateInterfacesFromDictionary = (
  dictionary: { [key: string]: any },
  startDepth = 0
) => {
  return Object.entries(dictionary.nodes)
    .map(([name, type]) => templateInterface(name, type, startDepth))
    .concat(
      Object.entries(dictionary.edges).map(([name, type]) =>
        templateInterface(name, type, startDepth)
      )
    )
    .join("\n\n");
};

export const templateInterface = (name, obj, startDepth) => {
  const getIndent = (d) => "  ".repeat(d);
  const getProps = (obj, depth) =>
    typeof obj === "string"
      ? `${getIndent(depth)}${obj}`
      : Object.keys(obj)
          .map((key) => {
            const value = obj[key];
            const indent = getIndent(depth);
            if (typeof value === "string") {
              return `${indent}${key}: ${value}`;
            } else if (Array.isArray(value)) {
              return `${indent}${key}: [\n${getProps(
                value[0],
                depth + 1
              )}\n${indent}]`;
            } else {
              return `${indent}${key}: {\n${getProps(
                value,
                depth + 1
              )}\n${indent}}`;
            }
          })
          .join("\n");

  return Object.keys(obj).length === 0
    ? `${getIndent(startDepth)}interface ${name} {}`
    : `${getIndent(startDepth)}interface ${name} {\n${getProps(
        obj,
        1 + startDepth
      )}\n${getIndent(startDepth)}}`;
};
