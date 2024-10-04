import { H3HexagonLayer, TileLayer } from "deck.gl";
import { hexToRgb } from "../utils/colors";
import getDuckDB from "../utils/duckdb";
import * as arrow from 'apache-arrow';
import { useDuckDb, useDuckDbQuery } from "duckdb-wasm-kit";

// const getTileData = async (tile) => {
//   const { db } = useDuckDb();
//   if (db) {
//     const conn = await db.connect()
//     // const db = await getDuckDB();
//     // const conn = await db.connect();
//     const res  = await conn.query(`
//       SELECT h3_cell_to_latlng('822d57fffffffff')
//     `);
//     console.debug(res);
//   }
// }

const DummyH3Layer = () => {
  // const { db } = useDuckDb();
  // const foob = () => {
  //   const { arrow, loading, error } = useDuckDbQuery(`
  //     SELECT h3_cell_to_latlng('822d57fffffffff')
  //   `);
  //   console.info(arrow);
  // }
  // foob();
  const foo = async () => {
    const db = await getDuckDB();
    const conn = await db.connect();
    const res = await conn.query(`
      SELECT h3_cell_to_latlng('822d57fffffffff')
    `);
    console.info(res.toArray().map((row) => row.toJSON()));
    let rows = res.toArray().map(Object.fromEntries);
    rows.columns = res.schema.fields.map((d) => d.name);
    console.info(res);
    // const arrow = await conn.query(`
    //   SELECT h3_cell_to_latlng('822d57fffffffff')
    // `);
    // const arrow = await conn.query<{ v: arrow.Int }>(`
    //     SELECT * FROM generate_series(1, 100) t(v)
    // `);

    // console.debug(arrow);
  }
  return new TileLayer({
    id: 'h3-tile-layer',
    getTileData: async (tile) => {
      // await foo();
      const { z, x, y } = tile.index;
      const { east, north, south, west } = tile.bbox;
      console.info(east, north, south, west);
      const db = await getDuckDB();
      const conn = await db.connect();
      // const stmt = await conn.prepare(
      //   `
      //   SELECT ST_GeomFromText('POLYGON($1 $2, $1 $3, $4 $3, $4 $2, $1 $2)')
      //   `
      // );
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
              4
            ))
          ) h3;
      `);
      const res = await stmt.query(north, east, west, south);
      let rows = res.toArray().map((row) => row.toJSON());
      rows.columns = res.schema.fields.map((d) => d.name);
      const h3 = rows.map((r) => r.h3);
      return h3;
    },

      // let rows = res.toArray().map(Object.fromEntries);
      // // @ts-ignore
      // rows.columns = res.schema.fields.map((d) => d.name);
      // console.debug(rows);
    // },
    // renderSubLayers: (props: any) => [
    //   new H3HexagonLayer({
    renderSubLayers: (props: object) => [
      new H3HexagonLayer(props, {
        getHexagon: (d: string) => d,
        stroked: true,
        lineWidthMinPixels: 1,
        getLineColor: [...hexToRgb('#1e88e5'), 120],
        getFillColor: [...hexToRgb('#1e88e5'), 160],
        filled: true,
        extruded: false,
      })
    ],
    // updateTriggers: {
    //   id: [selectedDataset?.id, location?.place_id],
    //   minZoom: [steppedZoom],
    //   maxZoom: [steppedZoom],
    // },
    //   })
    // ]
  })
};

export default DummyH3Layer;