import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

const worker_url = URL.createObjectURL(
  new Blob([`importScripts("${bundle.mainWorker!}");`], {type: 'text/javascript'})
);

const initDB = async () => {
  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  console.debug(duckdb.PACKAGE_VERSION);
  console.debug(await db.getVersion());
  URL.revokeObjectURL(worker_url);
  await db.open({
    allowUnsignedExtensions: true,
  });
  const conn = await db.connect();
  await conn.query(
    `
    SET custom_extension_repository='https://pub-cc26a6fd5d8240078bd0c2e0623393a5.r2.dev';
    `
  );
  await conn.query(
    `INSTALL h3;`
  )
  await conn.query(`LOAD h3;`);
  return db;
}


export default initDB;