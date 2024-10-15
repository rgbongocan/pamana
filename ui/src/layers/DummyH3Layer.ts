import { H3HexagonLayer, TileLayer } from "deck.gl";
import { hexToRgb } from "../utils/colors";
// import getDuckDB from "../utils/duckdb";
import getSteppedZoomResolutionPair from "../utils/getSteppedResolutionZoomPair";
import { getDuckDB } from "duckdb-wasm-kit";

type DataType = {
  h3: string;
  count: number;
}

const DummyH3Layer = () => new TileLayer({
  id: 'h3-tile-layer',
  getTileData: async (tile) => {
    const resolution = getSteppedZoomResolutionPair(tile.index.z)[1]
    // @ts-ignore
    const { east, north, south, west } = tile.bbox;
    const db = await getDuckDB();
    const conn = await db.connect();
    const stmt = await conn.prepare(`
      WITH fill AS (
        SELECT UNNEST(h3_polygon_wkt_to_cells(
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
        )) h3
      )
      SELECT h3_h3_to_string(fill.h3) h3, COUNT(fill.h3) count FROM fill
      JOIN pamana ON fill.h3 = h3_cell_to_parent(pamana.h3, CAST($5 AS INTEGER))
      GROUP BY fill.h3;
    `);
    // const stmt = await conn.prepare(`
    //   WITH fill AS (
    //     SELECT UNNEST(h3_polygon_wkt_to_cells(
    //       ST_AsText(
    //         ST_MakePolygon(ST_MakeLine(ARRAY[
    //           ST_Point($2, $1),
    //           ST_Point($3, $1),
    //           ST_Point($3, $4),
    //           ST_Point($2, $4),
    //           ST_Point($2, $1),
    //         ]))
    //       ),
    //       CAST($5 AS INTEGER)
    //     )) h3
    //   )
    //   SELECT h3_h3_to_string(fill.h3) h3 FROM fill;
    // `);
    // console.info(tile.index, north, east, west, south);
    const res = await stmt.query(north, east, west, south, resolution);
    let rows = res.toArray().map((row) => row.toJSON());
    // @ts-ignore
    rows.columns = res.schema.fields.map((d) => d.name);
    // console.info(rows);
    // const h3 = rows.map((r) => r.h3);
    return rows;
  },
  renderSubLayers: (props: object) => [
    new H3HexagonLayer<DataType>(props, {
      getHexagon: (d: DataType) => {
        console.info(d);
        return d.h3;
      },
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