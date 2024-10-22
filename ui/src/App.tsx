import './App.css'
import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DeckGL, Layer, MapViewState, PickingInfo } from 'deck.gl'
// @ts-ignore
import { initialState as initialViewState } from "./store/viewStateSlice"
import { useMapHooks } from "./utils/useMapHooks"
import DummyH3Layer from "./layers/DummyH3Layer"
import { useAsync } from "react-async-hook"
import TileBoundariesLayer from "./layers/SlippyTileLayer"
import preloadDuckDB from './utils/preloadDuckDB'
import { useCallback } from 'react'
import PH_BBOX from './constants/coordinates'


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
    handleViewStateChange,
    handleHover,
    handleCursor,
    handleTooltip,
  } = useMapHooks();

  const [w, s, e, n] = PH_BBOX;
  const [minZoom, maxZoom] = [4.8, 13]
  const applyViewStateConstraints = useCallback((viewState: MapViewState) => {
    const ret = {
      ...viewState,
      longitude: Math.min(e, Math.max(w, viewState.longitude)),
      latitude: Math.min(n, Math.max(s, viewState.latitude)),
      zoom: Math.min(maxZoom, Math.max(viewState.zoom, minZoom)),
    }
    // console.info(ret);
    return ret;
  }, []);

  return (
    !dbInitializing ?
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layers}
        onHover={handleHover}
        getCursor={handleCursor}
        getTooltip={handleTooltip as any}
        // @ts-ignore
        onViewStateChange={
          // @ts-ignore
          ({ viewState }) => (applyViewStateConstraints(viewState))
        }
      >
        <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
      </DeckGL> :
      null
  )
}

export default App;
