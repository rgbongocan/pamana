import { PolygonLayer, TextLayer, TileLayer } from "deck.gl";

const TileBoundariesLayer = () => new TileLayer({
  id: 'tile-boundaries-layer',
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

export default TileBoundariesLayer;