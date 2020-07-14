import * as neo4j from "neo4j-driver";

export interface Options {
  url: string;
  auth: string;
  query: string;
}

export const getResultFromNeo4j = async (options?: Partial<Options>) => {
  const _options = Object.assign(
    {
      url: "bolt://localhost:7687",
      auth: neo4j.auth.basic("neo4j", "test"),
      query: "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m",
    },
    options || {}
  );
  const driver = neo4j.driver(_options.url, _options.auth);
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });
  const result = await session.run(_options.query);
  session.close();
  driver.close();
  return result;
};
