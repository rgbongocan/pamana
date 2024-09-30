import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { DeckGL } from 'deck.gl';
import { DeckProps } from '@deck.gl/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL } from 'deck.gl';

// import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
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
// Instantiate the asynchronus version of DuckDB-wasm

// const DeckGLOverlay = (props: DeckProps) => {
//   const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

const STADIA_API_KEY = "c81c2124-dce0-44b3-ac15-2f2e4a9559d2";
const INITIAL_VIEW_STATE = {
  latitude: 11.6978351,
  longitude: 122.6217542,
  zoom: 5,
}
const App = () => {
  // const [count, setCount] = useState(0)
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const loadFromDuckDB = async () => {
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      const conn = await db.connect();
      setLayers([]);
    }
  });

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={layers}
    >
      <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
    </DeckGL>

  )
}

export default App
