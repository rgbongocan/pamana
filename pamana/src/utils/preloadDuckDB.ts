import { getDuckDB, initializeDuckDb } from "duckdb-wasm-kit";

const preloadDuckDB = async () => {
  await initializeDuckDb({ config: { allowUnsignedExtensions: true }, debug: false });
  const db = await getDuckDB();
  if (db) {
    const conn = await db.connect();
    await conn.query(`INSTALL spatial`);
    await conn.query(`LOAD spatial`);
    await conn.query(`SET custom_extension_repository='https://pub-cc26a6fd5d8240078bd0c2e0623393a5.r2.dev';`);
    await conn.query(`INSTALL h3;`)
    await conn.query(`LOAD h3;`);
  }
}

export default preloadDuckDB;