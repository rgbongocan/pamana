import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { getDuckDB, initializeDuckDb } from "duckdb-wasm-kit";

const preloadDuckDB = async () => {
  await initializeDuckDb({ config: { allowUnsignedExtensions: true }, debug: true });
  const db = await getDuckDB();
  if (db) {
    const conn = await db.connect();
    await conn.query(`INSTALL spatial`);
    await conn.query(`LOAD spatial`);
    await conn.query(`INSTALL parquet`);
    await conn.query(`LOAD parquet`);
    await conn.query(`SET custom_extension_repository='https://pub-cc26a6fd5d8240078bd0c2e0623393a5.r2.dev';`);
    await conn.query(`INSTALL h3;`)
    await conn.query(`LOAD h3;`);
    // const [fileHandle] = await window.showOpenFilePicker();
    // await db.registerFileHandle('mapamana.parquet', fileHandle, DuckDBDataProtocol.BROWSER_FILEREADER, true)
    const url = 'https://pamana-bucket.s3.ap-southeast-1.amazonaws.com/mapamana.parquet';
    await db.registerFileURL('mapamana.parquet', url, DuckDBDataProtocol.HTTP, false);
    await conn.query(`
      CREATE TABLE pamana AS
          SELECT *, h3_latlng_to_cell(ST_Y(geometry), ST_X(geometry), 13) h3
          FROM '${url}'
    `);
    // @ts-ignore
    console.debug('creating table');
  }
}

export default preloadDuckDB;