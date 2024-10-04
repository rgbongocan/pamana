import './App.css'
import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DeckGL } from 'deck.gl'
// @ts-ignore
import { initialState as initialViewState } from "./store/viewStateSlice"
import { useMapHooks } from "./utils/useMapHooks"
import DummyH3Layer from "./layers/DummyH3Layer"
import { initializeDuckDb, getDuckDB } from "duckdb-wasm-kit"
import { useAsync } from "react-async-hook"
import SlippyTileLayer from "./layers/SlippyTileLayer"


const App = () => {
  const { result, loading: dbInitializing, error} = useAsync(async () => {
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
  }, []);

  const layers: any[] = [
    SlippyTileLayer(),
    DummyH3Layer(),
  ];
  const { debouncedHandleViewStateChange } = useMapHooks();
  return (
    !dbInitializing ?
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layers}
        onViewStateChange={debouncedHandleViewStateChange}
      >
        <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
      </DeckGL> :
      null
  )
}

export default App;
