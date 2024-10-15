import { H3HexagonLayer, TileLayer } from "deck.gl";
import { colorBins, hexToRgb } from "../utils/colors";
// import getDuckDB from "../utils/duckdb";
import getSteppedZoomResolutionPair from "../utils/getSteppedResolutionZoomPair";
import { getDuckDB } from "duckdb-wasm-kit";
import { OR_YEL } from "../constants/colors";
import { renderToStaticMarkup } from "react-dom/server";
import { render } from "@testing-library/react";

type DataType = {
  h3: string;
  count: number;
}

const getColor = colorBins({
  attr: 'count',
  domains: [10,25,50,75,100],
  colors: OR_YEL.map(hexToRgb),
});

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
    const res = await stmt.query(north, east, west, south, resolution);
    let rows = res.toArray().map((row) => {
      const json = row.toJSON();
      json.count = Number(json.count);
      return json;
    });
    // @ts-ignore
    rows.columns = res.schema.fields.map((d) => d.name);
    return rows;
  },
  renderSubLayers: (props: object) => [
    new H3HexagonLayer<DataType>(props, {
      getHexagon: (d: DataType) => {
        return d.h3;
      },
      stroked: true,
      lineWidthMinPixels: 1,
      // @ts-ignore
      getFillColor: (d: DataType) => [...getColor(d), 200],
      // @ts-ignore
      getLineColor: (d: DataType) => [...getColor(d), 160],
      filled: true,
      extruded: false,
    })
  ],
  pickable: true,
  onHover: (info: any) => {
    if (info.object?.h3) {
      info.object.html = renderToStaticMarkup(
        <div>
          Cultural properties:
          {' '}
          {info.object.count}
        </div>
      );
    }
  },
});

export default DummyH3Layer;