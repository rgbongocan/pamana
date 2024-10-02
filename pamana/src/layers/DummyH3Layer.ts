import { H3HexagonLayer, TileLayer } from "deck.gl";
import { hexToRgb } from "../utils/colors";

const DummyH3Layer = () => {
  return new TileLayer({
    id: 'h3-tile-layer',
    getTileData: (tile) => {
      // console.log(tile);
      // const { db } = useDuckDb();
    },
    // renderSubLayers: (props: any) => [
    //   new H3HexagonLayer({
    //     renderSubLayers: (props: object) => new H3HexagonLayer(props, {
    //       getHexagon: (d: string) => d,
    //       stroked: true,
    //       lineWidthMinPixels: 1,
    //       getLineColor: [...hexToRgb('#1e88e5'), 120],
    //       getFillColor: [...hexToRgb('#1e88e5'), 160],
    //       filled: true,
    //       extruded: false,
    //     }),
    //     // updateTriggers: {
    //     //   id: [selectedDataset?.id, location?.place_id],
    //     //   minZoom: [steppedZoom],
    //     //   maxZoom: [steppedZoom],
    //     // },
    //   })
    // ]
  })
};

export default DummyH3Layer;