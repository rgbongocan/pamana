import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
};

// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

let db: duckdb.AsyncDuckDB | null = null;

const getDuckDB = async () => {
  if (db) {
    return db;
  }
  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  await db.open({
    allowUnsignedExtensions: true,
  });
  const conn = await db.connect();
  await conn.query(`INSTALL spatial`);
  await conn.query(`LOAD spatial`);
  await conn.query(`SET custom_extension_repository='https://pub-cc26a6fd5d8240078bd0c2e0623393a5.r2.dev'`);
  await conn.query(`INSTALL h3;`)
  await conn.query(`LOAD h3;`);
  return db;
}


export default getDuckDB;
