import "./App.css"
import { Counter } from "./features/counter/Counter"
import { Quotes } from "./features/quotes/Quotes"
import logo from "./logo.svg"
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import './App.css'
import { DeckProps } from '@deck.gl/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL } from 'deck.gl';
import { PolygonLayer, TextLayer } from '@deck.gl/layers';
// @ts-ignore
import { TileLayer, Tile2DHeader } from '@deck.gl/geo-layers';
import { initialState as initialViewState, updateViewState } from "./store/viewStateSlice"
import { useMapHooks } from "./utils/useMapHooks"
import DummyH3Layer from "./layers/DummyH3Layer"
import { DuckDBConfig } from "@duckdb/duckdb-wasm"
// import { initializeDuckDb, useDuckDbQuery } from "duckdb-wasm-kit"
import initDB from "./utils/duckdb"


const getSlippyLayer = () => {
  return new TileLayer({
    id: 'slippy-tile-layer',
    data: null,
    pickable: false,
    // maxZoom: steppedZoom,
    // onViewportLoad: (tiles: Tile2DHeader[]) => {
    //   if (Array.isArray(tiles) && tiles.length > 0) {
    //     const { z } = tiles[0].index;
    //     const [steppedZ, res] = getSteppedZoomResolutionPair(z);
    //     if (res !== h3Resolution) {
    //       dispatch(setZIndex(steppedZ));
    //       dispatch(setH3Resolution(res));
    //     }
    //   }
    // },
    // @ts-ignore
    renderSubLayers: (props: any) => [
      new PolygonLayer(props, {
        id: `${props.id}-bounds`,
        // dummy data otherwise the layer doesn't render
        data: [{}],
        pickable: false,
        stroked: true,
        filled: false,
        getPolygon: (object) => {
          const [[w, s], [e, n]] = props.tile.boundingBox;
          const polygon = [[
            [w, s],
            [e, s],
            [e, n],
            [w, n],
            [w, s],
          ]];
          return polygon;
        },
        getLineColor: [255, 255, 102],
        getLineWidth: 2,
        lineWidthMinPixels: 2,
      }),
      new TextLayer({
        id: `${props.id}-text`,
        // dummy data otherwise the layer doesn't render
        data: [{}],
        getPosition: (object) => {
          const [[w, s], [e, n]] = props.tile.boundingBox;
          return [(w + e) / 2, (s + n) / 2];
        },
        getText: (object) => {
          const { z, x, y } = props.tile.index;
          return `z:${z} x:${x} y:${y}`;
        },
        getSize: 16,
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
      }),
    ],
  });
}


const App = () => {
  useEffect(() => {
    initDB();
  }, []);
  // useEffect(() => {
  //   const config: DuckDBConfig = {
  //     // @ts-ignore
  //     allowUnsignedExtensions: true,
  //   }
  //   initializeDuckDb({ debug: true, config });
  // }, []);

  // useDuckDbQuery(`
  //   INSTALL spatial;
  //   LOAD spatial;
  // `);

  // useDuckDbQuery(`
  //   SET custom_extension_repository='https://storage.googleapis.com/duckdb-extensions';
  //   INSTALL h3ext;
  //   LOAD h3ext;
  // `)
  useEffect(() => {
    initDB();
  }, []);

  const layers: any[] = [
    getSlippyLayer(),
    DummyH3Layer(),
  ];
  const { debouncedHandleViewStateChange } = useMapHooks();
  return (
    <DeckGL
      initialViewState={initialViewState}
      controller
      layers={layers}
      onViewStateChange={debouncedHandleViewStateChange}
    >
      <Map mapStyle="https://tiles.stadiamaps.com/styles/stamen_toner_lite.json" />
    </DeckGL>

  )
}

export default App;
