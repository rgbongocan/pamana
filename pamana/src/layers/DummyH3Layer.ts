import { H3HexagonLayer, TileLayer } from "deck.gl";
import { hexToRgb } from "../utils/colors";
// import getDuckDB from "../utils/duckdb";
import getSteppedZoomResolutionPair from "../utils/getSteppedResolutionZoomPair";
import { getDuckDB } from "duckdb-wasm-kit";


const DummyH3Layer = () => new TileLayer({
  id: 'h3-tile-layer',
  getTileData: async (tile) => {
    const resolution = getSteppedZoomResolutionPair(tile.index.z)[1]
    // @ts-ignore
    const { east, north, south, west } = tile.bbox;
    const db = await getDuckDB();
    const conn = await db.connect();
    const stmt = await conn.prepare(`
      SELECT
        h3_h3_to_string(
          UNNEST(h3_polygon_wkt_to_cells(
            ST_AsText(
              ST_MakePolygon(ST_MakeLine(ARRAY[
                ST_Point($2, $1),
                ST_Point($3, $1),
                ST_Point($3, $4),
                ST_Point($2, $4),
                ST_Point($2, $1),
              ]))
            ),
            CAST($5 AS INTEGER)
          ))
        ) h3;
    `);
    const res = await stmt.query(north, east, west, south, resolution);
    let rows = res.toArray().map((row) => row.toJSON());
    rows.columns = res.schema.fields.map((d) => d.name);
    const h3 = rows.map((r) => r.h3);
    return h3;
  },
  renderSubLayers: (props: object) => [
    new H3HexagonLayer(props, {
      getHexagon: (d: string) => d,
      stroked: true,
      lineWidthMinPixels: 1,
      getLineColor: [...hexToRgb('#1e88e5'), 120],
      getFillColor: [...hexToRgb('#1e88e5'), 40],
      filled: true,
      extruded: false,
    })
  ],
});

export default DummyH3Layer;