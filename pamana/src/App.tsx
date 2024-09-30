import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { DeckGL } from 'deck.gl';
import { DeckProps } from '@deck.gl/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Map, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL } from 'deck.gl';

// const DeckGLOverlay = (props: DeckProps) => {
//   const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

const STADIA_API_KEY = "c81c2124-dce0-44b3-ac15-2f2e4a9559d2";

const App = () => {
  // const [count, setCount] = useState(0)
  const layers: any = [];

  return (
    <DeckGL
     initialViewState={{
        longitude: 0.45,
        latitude: 51.47,
        zoom: 11
      }}
      controller
      layers={layers}
    >
      <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
    </DeckGL>

  )
}

export default App
