import './App.css'
import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DeckGL, Layer, PickingInfo } from 'deck.gl'
// @ts-ignore
import { initialState as initialViewState } from "./store/viewStateSlice"
import { useMapHooks } from "./utils/useMapHooks"
import DummyH3Layer from "./layers/DummyH3Layer"
import { useAsync } from "react-async-hook"
import TileBoundariesLayer from "./layers/SlippyTileLayer"
import preloadDuckDB from './utils/preloadDuckDB'
import { useCallback, useState } from 'react'


const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  pointerEvents: 'none'
};

const App = () => {
  const { loading: dbInitializing, error } = useAsync(preloadDuckDB, []);
  console.error(error);
  const layers: Layer[] = [
    DummyH3Layer(),
    // TileBoundariesLayer(),
  ];
  const {
    handleHover,
    handleCursor,
    handleTooltip,
    debouncedHandleViewStateChange
  } = useMapHooks();

  return (
    !dbInitializing ?
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layers}
        onHover={handleHover}
        getCursor={handleCursor}
        getTooltip={handleTooltip as any}
        onViewStateChange={debouncedHandleViewStateChange}
      >
        <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
      </DeckGL> :
      null
  )
}

export default App;
