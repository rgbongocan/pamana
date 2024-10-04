import {
  Tileset2D,
  geohash_layer_default,
  great_circle_layer_default,
  h3_cluster_layer_default,
  h3_hexagon_layer_default,
  mvt_layer_default,
  quadkey_layer_default,
  s2_layer_default,
  scenegraph_layer_default,
  simple_mesh_layer_default,
  terrain_layer_default,
  tile_3d_layer_default,
  tile_layer_default,
  trips_layer_default
} from "./chunk-5YKWLUGJ.js";
import {
  AmbientLight,
  Attribute,
  AttributeManager,
  COORDINATE_SYSTEM,
  Controller,
  CubeGeometry,
  DeckRenderer,
  DirectionalLight,
  FirstPersonController,
  FirstPersonViewport,
  FlyToInterpolator,
  Geometry,
  GlobeController,
  GlobeViewport,
  LayerManager,
  LightingEffect,
  LinearInterpolator,
  MapController,
  Model,
  OPERATION,
  OrbitController,
  OrbitViewport,
  OrthographicController,
  OrthographicViewport,
  PointLight,
  PostProcessEffect,
  TRANSITION_EVENTS,
  Tesselator,
  TextureTransform,
  TransitionInterpolator,
  UNIT,
  VERSION,
  View,
  arc_layer_default,
  assert4 as assert,
  bitmap_layer_default,
  column_layer_default,
  compareProps,
  composite_layer_default,
  createIterable,
  deck_default,
  deepEqual,
  first_person_view_default,
  fp64LowPart,
  fp64arithmetic,
  geojson_layer_default,
  getShaderAssembler,
  globe_view_default,
  gouraudLighting,
  grid_cell_layer_default,
  icon_layer_default,
  layer_default,
  layer_extension_default,
  line_layer_default,
  log_default,
  map_view_default,
  mergeShaders,
  orbit_view_default,
  orthographic_view_default,
  path_layer_default,
  phongLighting,
  picking_default,
  point_cloud_layer_default,
  polygon_layer_default,
  project32_default,
  project_default,
  scatterplot_layer_default,
  shadow_default,
  solid_polygon_layer_default,
  text_layer_default,
  viewport_default,
  web_mercator_viewport_default
} from "./chunk-HIHN4OKJ.js";
import {
  require_react
} from "./chunk-7JZAKNLV.js";
import {
  __toESM
} from "./chunk-2TUXWMP5.js";

// node_modules/@deck.gl/aggregation-layers/dist/utils/aggregation-operation-utils.js
var AGGREGATION_OPERATION = {
  SUM: 1,
  MEAN: 2,
  MIN: 3,
  MAX: 4
};
function sumReducer(accu, cur) {
  return accu + cur;
}
function maxReducer(accu, cur) {
  return cur > accu ? cur : accu;
}
function minReducer(accu, cur) {
  return cur < accu ? cur : accu;
}
function getMean(pts, accessor) {
  if (Number.isFinite(accessor)) {
    return pts.length ? accessor : null;
  }
  const filtered = pts.map(accessor).filter(Number.isFinite);
  return filtered.length ? filtered.reduce(sumReducer, 0) / filtered.length : null;
}
function getSum(pts, accessor) {
  if (Number.isFinite(accessor)) {
    return pts.length ? pts.length * accessor : null;
  }
  const filtered = pts.map(accessor).filter(Number.isFinite);
  return filtered.length ? filtered.reduce(sumReducer, 0) : null;
}
function getMax(pts, accessor) {
  if (Number.isFinite(accessor)) {
    return pts.length ? accessor : null;
  }
  const filtered = pts.map(accessor).filter(Number.isFinite);
  return filtered.length ? filtered.reduce(maxReducer, -Infinity) : null;
}
function getMin(pts, accessor) {
  if (Number.isFinite(accessor)) {
    return pts.length ? accessor : null;
  }
  const filtered = pts.map(accessor).filter(Number.isFinite);
  return filtered.length ? filtered.reduce(minReducer, Infinity) : null;
}
function getValueFunc(aggregation, accessor, context) {
  const op = AGGREGATION_OPERATION[aggregation] || AGGREGATION_OPERATION.SUM;
  accessor = wrapAccessor(accessor, context);
  switch (op) {
    case AGGREGATION_OPERATION.MIN:
      return (pts) => getMin(pts, accessor);
    case AGGREGATION_OPERATION.SUM:
      return (pts) => getSum(pts, accessor);
    case AGGREGATION_OPERATION.MEAN:
      return (pts) => getMean(pts, accessor);
    case AGGREGATION_OPERATION.MAX:
      return (pts) => getMax(pts, accessor);
    default:
      return null;
  }
}
function wrapAccessor(accessor, context = {}) {
  if (Number.isFinite(accessor)) {
    return accessor;
  }
  return (pt) => {
    context.index = pt.index;
    return accessor(pt.source, context);
  };
}
function wrapGetValueFunc(getValue, context = {}) {
  return (pts) => {
    context.indices = pts.map((pt) => pt.index);
    return getValue(pts.map((pt) => pt.source), context);
  };
}

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/gpu-grid-aggregator-constants.js
var DEFAULT_RUN_PARAMS = {
  projectPoints: false,
  viewport: null,
  createBufferObjects: true,
  moduleSettings: {}
};
var MAX_32_BIT_FLOAT = 3402823466e29;
var MIN_BLEND_EQUATION = [32775, 32774];
var MAX_BLEND_EQUATION = [32776, 32774];
var MAX_MIN_BLEND_EQUATION = [32776, 32775];
var EQUATION_MAP = {
  [AGGREGATION_OPERATION.SUM]: 32774,
  [AGGREGATION_OPERATION.MEAN]: 32774,
  [AGGREGATION_OPERATION.MIN]: MIN_BLEND_EQUATION,
  [AGGREGATION_OPERATION.MAX]: MAX_BLEND_EQUATION
};
var DEFAULT_WEIGHT_PARAMS = {
  size: 1,
  operation: AGGREGATION_OPERATION.SUM,
  needMin: false,
  needMax: false,
  combineMaxMin: false
};
var PIXEL_SIZE = 4;

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/aggregate-to-grid-vs.glsl.js
var aggregate_to_grid_vs_glsl_default = `#version 300 es
#define SHADER_NAME gpu-aggregation-to-grid-vs
in vec3 positions;
in vec3 positions64Low;
in vec3 weights;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform bool projectPoints;
uniform vec2 translation;
uniform vec3 scaling;
out vec3 vWeights;
vec2 project_to_pixel(vec4 pos) {
vec4 result;
pos.xy = pos.xy/pos.w;
result = pos + vec4(translation, 0., 0.);
result.xy = scaling.z > 0. ? result.xy * scaling.xy : result.xy;
return result.xy;
}
void main(void) {
vWeights = weights;
vec4 windowPos = vec4(positions, 1.);
if (projectPoints) {
windowPos = project_position_to_clipspace(positions, positions64Low, vec3(0));
}
vec2 pos = project_to_pixel(windowPos);
vec2 pixelXY64[2];
pixelXY64[0] = vec2(pos.x, 0.);
pixelXY64[1] = vec2(pos.y, 0.);
vec2 gridXY64[2];
gridXY64[0] = div_fp64(pixelXY64[0], vec2(cellSize.x, 0));
gridXY64[1] = div_fp64(pixelXY64[1], vec2(cellSize.y, 0));
float x = floor(gridXY64[0].x);
float y = floor(gridXY64[1].x);
pos = vec2(x, y);
pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);
vec2 offset = 1.0 / gridSize;
pos = pos + offset;
gl_Position = vec4(pos, 0.0, 1.0);
gl_PointSize = 1.0;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/aggregate-to-grid-fs.glsl.js
var aggregate_to_grid_fs_glsl_default = `#version 300 es
#define SHADER_NAME gpu-aggregation-to-grid-fs
precision highp float;
in vec3 vWeights;
out vec4 fragColor;
void main(void) {
fragColor = vec4(vWeights, 1.0);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/aggregate-all-vs.glsl.js
var aggregate_all_vs_glsl_default = `#version 300 es
#define SHADER_NAME gpu-aggregation-all-vs-64
in vec2 position;
uniform ivec2 gridSize;
out vec2 vTextureCoord;
void main(void) {
vec2 pos = vec2(-1.0, -1.0);
vec2 offset = 1.0 / vec2(gridSize);
pos = pos + offset;
gl_Position = vec4(pos, 0.0, 1.0);
int yIndex = gl_InstanceID / gridSize[0];
int xIndex = gl_InstanceID - (yIndex * gridSize[0]);
vec2 yIndexFP64 = vec2(float(yIndex), 0.);
vec2 xIndexFP64 = vec2(float(xIndex), 0.);
vec2 gridSizeYFP64 = vec2(gridSize[1], 0.);
vec2 gridSizeXFP64 = vec2(gridSize[0], 0.);
vec2 texCoordXFP64 = div_fp64(yIndexFP64, gridSizeYFP64);
vec2 texCoordYFP64 = div_fp64(xIndexFP64, gridSizeXFP64);
vTextureCoord = vec2(texCoordYFP64.x, texCoordXFP64.x);
gl_PointSize = 1.0;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/aggregate-all-fs.glsl.js
var aggregate_all_fs_glsl_default = `#version 300 es
#define SHADER_NAME gpu-aggregation-all-fs
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform bool combineMaxMin;
out vec4 fragColor;
void main(void) {
vec4 textureColor = texture(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
if (textureColor.a == 0.) {
discard;
}
fragColor.rgb = textureColor.rgb;
fragColor.a = combineMaxMin ? textureColor.r : textureColor.a;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/transform-mean-vs.glsl.js
var transform_mean_vs_glsl_default = `#version 300 es
#define SHADER_NAME gpu-aggregation-transform-mean-vs
in vec4 aggregationValues;
out vec4 meanValues;
void main()
{
bool isCellValid = bool(aggregationValues.w > 0.);
meanValues.xyz = isCellValid ? aggregationValues.xyz/aggregationValues.w : vec3(0, 0, 0);
meanValues.w = aggregationValues.w;
gl_PointSize = 1.0;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/utils/resource-utils.js
var DEFAULT_PARAMETERS = {
  minFilter: "nearest",
  magFilter: "nearest"
};
function getFloatTexture(device, opts) {
  const { width = 1, height = 1, data = null, parameters = DEFAULT_PARAMETERS } = opts;
  const texture = device.createTexture({
    data,
    format: "rgba32float",
    // device.info.type === 'webgl2' ? 'rgba32float' : GL.RGBA,
    // type: GL.FLOAT,
    // border: 0,
    mipmaps: false,
    sampler: parameters,
    // dataFormat: GL.RGBA,
    width,
    height
    // ts-expect-error
    // unpackFlipY
  });
  return texture;
}
function getFramebuffer(device, opts) {
  const { id, width = 1, height = 1, texture } = opts;
  const fb = device.createFramebuffer({
    id,
    width,
    height,
    colorAttachments: [texture]
  });
  return fb;
}

// node_modules/@deck.gl/aggregation-layers/dist/utils/gpu-grid-aggregation/gpu-grid-aggregator.js
var BUFFER_NAMES = ["aggregationBuffer", "maxMinBuffer", "minBuffer", "maxBuffer"];
var ARRAY_BUFFER_MAP = {
  maxData: "maxBuffer",
  minData: "minBuffer",
  maxMinData: "maxMinBuffer"
};
var REQUIRED_FEATURES = [
  "float32-renderable-webgl",
  "texture-blend-float-webgl"
];
var GPUGridAggregator = class {
  // Decode and return aggregation data of given pixel.
  static getAggregationData({ aggregationData, maxData, minData, maxMinData, pixelIndex }) {
    const index = pixelIndex * PIXEL_SIZE;
    const results = {};
    if (aggregationData) {
      results.cellCount = aggregationData[index + 3];
      results.cellWeight = aggregationData[index];
    }
    if (maxMinData) {
      results.maxCellWieght = maxMinData[0];
      results.minCellWeight = maxMinData[3];
    } else {
      if (maxData) {
        results.maxCellWieght = maxData[0];
        results.totalCount = maxData[3];
      }
      if (minData) {
        results.minCellWeight = minData[0];
        results.totalCount = minData[3];
      }
    }
    return results;
  }
  // Decodes and retuns counts and weights of all cells
  static getCellData({ countsData, size = 1 }) {
    const numCells = countsData.length / 4;
    const cellWeights = new Float32Array(numCells * size);
    const cellCounts = new Uint32Array(numCells);
    for (let i3 = 0; i3 < numCells; i3++) {
      for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
        cellWeights[i3 * size + sizeIndex] = countsData[i3 * 4 + sizeIndex];
      }
      cellCounts[i3] = countsData[i3 * 4 + 3];
    }
    return { cellCounts, cellWeights };
  }
  static isSupported(device) {
    return REQUIRED_FEATURES.every((feature) => device.features.has(feature));
  }
  constructor(device, props = {}) {
    this.state = {
      // per weight GPU resources
      weightAttributes: {},
      textures: {},
      meanTextures: {},
      buffers: {},
      framebuffers: {},
      maxMinFramebuffers: {},
      minFramebuffers: {},
      maxFramebuffers: {},
      equations: {},
      shaderOptions: {},
      modelDirty: false,
      // common resources to be deleted
      resources: {},
      // results
      results: {}
    };
    this.id = props.id || "gpu-grid-aggregator";
    this.device = device;
    const REQUIRED_FEATURES2 = [
      "float32-renderable-webgl"
      // render to float texture
    ];
    this._hasGPUSupport = REQUIRED_FEATURES2.every((feature) => device.features.has(feature));
    if (this._hasGPUSupport) {
      this._setupModels();
    }
  }
  // Delete owned resources.
  delete() {
    const { gridAggregationModel, allAggregationModel, meanTransform } = this;
    const { textures, framebuffers, maxMinFramebuffers, minFramebuffers, maxFramebuffers, meanTextures, resources } = this.state;
    gridAggregationModel == null ? void 0 : gridAggregationModel.destroy();
    allAggregationModel == null ? void 0 : allAggregationModel.destroy();
    meanTransform == null ? void 0 : meanTransform.destroy();
    deleteResources([
      framebuffers,
      textures,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      meanTextures,
      resources
    ]);
  }
  // Perform aggregation and retun the results
  run(opts = {}) {
    this.setState({ results: {} });
    const aggregationParams = this._normalizeAggregationParams(opts);
    return this._runAggregation(aggregationParams);
  }
  // Reads aggregation data into JS Array object
  // For WebGL1, data is available in JS Array objects already.
  // For WebGL2, data is read from Buffer objects and cached for subsequent queries.
  getData(weightId) {
    const data = {};
    const results = this.state.results;
    if (!results[weightId].aggregationData) {
      results[weightId].aggregationData = results[weightId].aggregationBuffer.getData();
    }
    data.aggregationData = results[weightId].aggregationData;
    for (const arrayName in ARRAY_BUFFER_MAP) {
      const bufferName = ARRAY_BUFFER_MAP[arrayName];
      if (results[weightId][arrayName] || results[weightId][bufferName]) {
        results[weightId][arrayName] = results[weightId][arrayName] || results[weightId][bufferName].getData();
        data[arrayName] = results[weightId][arrayName];
      }
    }
    return data;
  }
  updateShaders(shaderOptions = {}) {
    this.setState({ shaderOptions, modelDirty: true });
  }
  // PRIVATE
  _normalizeAggregationParams(opts) {
    const aggregationParams = { ...DEFAULT_RUN_PARAMS, ...opts };
    const { weights } = aggregationParams;
    if (weights) {
      aggregationParams.weights = normalizeWeightParams(weights);
    }
    return aggregationParams;
  }
  // Update priveate state
  setState(updateObject) {
    Object.assign(this.state, updateObject);
  }
  // GPU Aggregation methods
  _getAggregateData(opts) {
    const results = {};
    const { textures, framebuffers, maxMinFramebuffers, minFramebuffers, maxFramebuffers, resources } = this.state;
    const { weights } = opts;
    for (const id in weights) {
      results[id] = {};
      const { needMin, needMax, combineMaxMin } = weights[id];
      results[id].aggregationTexture = textures[id];
      results[id].aggregationBuffer = this.device.readPixelsToBufferWebGL(framebuffers[id], {
        target: weights[id].aggregationBuffer,
        // update if a buffer is provided
        sourceType: 5126
      });
      if (needMin && needMax && combineMaxMin) {
        results[id].maxMinBuffer = this.device.readPixelsToBufferWebGL(maxMinFramebuffers[id], {
          target: weights[id].maxMinBuffer,
          // update if a buffer is provided
          sourceType: 5126
        });
        results[id].maxMinTexture = resources[`${id}-maxMinTexture`];
      } else {
        if (needMin) {
          results[id].minBuffer = this.device.readPixelsToBufferWebGL(minFramebuffers[id], {
            target: weights[id].minBuffer,
            // update if a buffer is provided
            sourceType: 5126
          });
          results[id].minTexture = resources[`${id}-minTexture`];
        }
        if (needMax) {
          results[id].maxBuffer = this.device.readPixelsToBufferWebGL(maxFramebuffers[id], {
            target: weights[id].maxBuffer,
            // update if a buffer is provided
            sourceType: 5126
          });
          results[id].maxTexture = resources[`${id}-maxTexture`];
        }
      }
    }
    this._trackGPUResultBuffers(results, weights);
    return results;
  }
  _renderAggregateData(opts) {
    const { cellSize, projectPoints, attributes, moduleSettings, numCol, numRow, weights, translation, scaling } = opts;
    const { maxMinFramebuffers, minFramebuffers, maxFramebuffers } = this.state;
    const gridSize = [numCol, numRow];
    const parameters = {
      blend: true,
      depthTest: false,
      blendFunc: [1, 1]
    };
    const uniforms = {
      cellSize,
      gridSize,
      projectPoints,
      translation,
      scaling
    };
    for (const id in weights) {
      const { needMin, needMax } = weights[id];
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      this._renderToWeightsTexture({
        id,
        parameters,
        moduleSettings,
        uniforms,
        gridSize,
        attributes,
        weights
      });
      if (combineMaxMin) {
        this._renderToMaxMinTexture({
          id,
          parameters: { ...parameters, blendEquation: MAX_MIN_BLEND_EQUATION },
          gridSize,
          minOrMaxFb: maxMinFramebuffers[id],
          clearParams: { clearColor: [0, 0, 0, MAX_32_BIT_FLOAT] },
          combineMaxMin
        });
      } else {
        if (needMin) {
          this._renderToMaxMinTexture({
            id,
            parameters: { ...parameters, blendEquation: MIN_BLEND_EQUATION },
            gridSize,
            minOrMaxFb: minFramebuffers[id],
            clearParams: { clearColor: [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0] },
            combineMaxMin
          });
        }
        if (needMax) {
          this._renderToMaxMinTexture({
            id,
            parameters: { ...parameters, blendEquation: MAX_BLEND_EQUATION },
            gridSize,
            minOrMaxFb: maxFramebuffers[id],
            clearParams: { clearColor: [0, 0, 0, 0] },
            combineMaxMin
          });
        }
      }
    }
  }
  // render all aggregated grid-cells to generate Min, Max or MaxMin data texture
  _renderToMaxMinTexture(opts) {
    const { id, gridSize, minOrMaxFb, combineMaxMin, clearParams = {} } = opts;
    const { framebuffers } = this.state;
    const { allAggregationModel } = this;
    this.device.withParametersWebGL({
      ...clearParams,
      framebuffer: minOrMaxFb,
      viewport: [0, 0, gridSize[0], gridSize[1]]
    }, () => {
      this.device.clearWebGL({ color: true });
      allAggregationModel.setUniforms({ gridSize, combineMaxMin });
      allAggregationModel.setBindings({ uSampler: framebuffers[id].texture });
      allAggregationModel.draw();
    });
  }
  // render all data points to aggregate weights
  _renderToWeightsTexture(opts) {
    const { id, parameters, moduleSettings, uniforms, gridSize, weights } = opts;
    const { framebuffers, equations, weightAttributes } = this.state;
    const { gridAggregationModel } = this;
    const { operation } = weights[id];
    const clearColor = operation === AGGREGATION_OPERATION.MIN ? [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0] : [0, 0, 0, 0];
    this.device.withParametersWebGL({
      framebuffer: framebuffers[id],
      viewport: [0, 0, gridSize[0], gridSize[1]],
      clearColor
    }, () => {
      this.device.clearWebGL({ color: true });
      const attributes = { weights: weightAttributes[id] };
      gridAggregationModel.draw({
        parameters: { ...parameters, blendEquation: equations[id] },
        moduleSettings,
        uniforms,
        attributes
      });
    });
    if (operation === AGGREGATION_OPERATION.MEAN) {
      const { meanTextures, textures } = this.state;
      const transformOptions = {
        _sourceTextures: { aggregationValues: meanTextures[id] },
        // contains aggregated data
        _targetTexture: textures[id],
        // store mean values,
        elementCount: textures[id].width * textures[id].height
      };
      if (this.meanTransform) {
        this.meanTransform.update(transformOptions);
      } else {
        this.meanTransform = getMeanTransform(this.device, transformOptions);
      }
      this.meanTransform.run({
        parameters: {
          blend: false,
          depthTest: false
        }
      });
      framebuffers[id].attach({ [36064]: textures[id] });
    }
  }
  _runAggregation(opts) {
    this._updateModels(opts);
    this._setupFramebuffers(opts);
    this._renderAggregateData(opts);
    const results = this._getAggregateData(opts);
    this.setState({ results });
    return results;
  }
  // set up framebuffer for each weight
  /* eslint-disable complexity, max-depth, max-statements*/
  _setupFramebuffers(opts) {
    const { textures, framebuffers, maxMinFramebuffers, minFramebuffers, maxFramebuffers, meanTextures, equations } = this.state;
    const { weights } = opts;
    const { numCol, numRow } = opts;
    const framebufferSize = { width: numCol, height: numRow };
    for (const id in weights) {
      const { needMin, needMax, combineMaxMin, operation } = weights[id];
      textures[id] = weights[id].aggregationTexture || textures[id] || getFloatTexture(this.device, { id: `${id}-texture`, width: numCol, height: numRow });
      textures[id].resize(framebufferSize);
      let texture = textures[id];
      if (operation === AGGREGATION_OPERATION.MEAN) {
        meanTextures[id] = meanTextures[id] || getFloatTexture(this.device, { id: `${id}-mean-texture`, width: numCol, height: numRow });
        meanTextures[id].resize(framebufferSize);
        texture = meanTextures[id];
      }
      if (framebuffers[id]) {
        framebuffers[id].attach({ [36064]: texture });
      } else {
        framebuffers[id] = getFramebuffer(this.device, {
          id: `${id}-fb`,
          width: numCol,
          height: numRow,
          texture
        });
      }
      framebuffers[id].resize(framebufferSize);
      equations[id] = EQUATION_MAP[operation] || EQUATION_MAP[AGGREGATION_OPERATION.SUM];
      if (needMin || needMax) {
        if (needMin && needMax && combineMaxMin) {
          if (!maxMinFramebuffers[id]) {
            texture = weights[id].maxMinTexture || this._getMinMaxTexture(`${id}-maxMinTexture`);
            maxMinFramebuffers[id] = getFramebuffer(this.device, { id: `${id}-maxMinFb`, texture });
          }
        } else {
          if (needMin) {
            if (!minFramebuffers[id]) {
              texture = weights[id].minTexture || this._getMinMaxTexture(`${id}-minTexture`);
              minFramebuffers[id] = getFramebuffer(this.device, {
                id: `${id}-minFb`,
                texture
              });
            }
          }
          if (needMax) {
            if (!maxFramebuffers[id]) {
              texture = weights[id].maxTexture || this._getMinMaxTexture(`${id}-maxTexture`);
              maxFramebuffers[id] = getFramebuffer(this.device, {
                id: `${id}-maxFb`,
                texture
              });
            }
          }
        }
      }
    }
  }
  /* eslint-enable complexity, max-depth, max-statements */
  _getMinMaxTexture(name) {
    const { resources } = this.state;
    if (!resources[name]) {
      resources[name] = getFloatTexture(this.device, { id: "resourceName" });
    }
    return resources[name];
  }
  _setupModels({ numCol = 0, numRow = 0 } = {}) {
    var _a;
    const { shaderOptions } = this.state;
    (_a = this.gridAggregationModel) == null ? void 0 : _a.destroy();
    this.gridAggregationModel = getAggregationModel(this.device, shaderOptions);
    if (!this.allAggregationModel) {
      const instanceCount = numCol * numRow;
      this.allAggregationModel = getAllAggregationModel(this.device, instanceCount);
    }
  }
  // set up buffers for all weights
  _setupWeightAttributes(opts) {
    const { weightAttributes } = this.state;
    const { weights } = opts;
    for (const id in weights) {
      weightAttributes[id] = opts.attributes[id];
    }
  }
  /** GPU Aggregation results are provided in Buffers, if new Buffer objects are created track them for later deletion. */
  /* eslint-disable max-depth */
  _trackGPUResultBuffers(results, weights) {
    const { resources } = this.state;
    for (const id in results) {
      if (results[id]) {
        for (const bufferName of BUFFER_NAMES) {
          if (results[id][bufferName] && weights[id][bufferName] !== results[id][bufferName]) {
            const name = `gpu-result-${id}-${bufferName}`;
            if (resources[name]) {
              resources[name].delete();
            }
            resources[name] = results[id][bufferName];
          }
        }
      }
    }
  }
  /* eslint-enable max-depth */
  _updateModels(opts) {
    const { vertexCount, attributes, numCol, numRow } = opts;
    const { modelDirty } = this.state;
    if (modelDirty) {
      this._setupModels(opts);
      this.setState({ modelDirty: false });
    }
    this._setupWeightAttributes(opts);
    this.gridAggregationModel.setVertexCount(vertexCount);
    this.gridAggregationModel.setAttributes(attributes);
    this.allAggregationModel.setInstanceCount(numCol * numRow);
  }
};
function normalizeWeightParams(weights) {
  const result = {};
  for (const id in weights) {
    result[id] = { ...DEFAULT_WEIGHT_PARAMS, ...weights[id] };
  }
  return result;
}
function deleteResources(resources) {
  resources = Array.isArray(resources) ? resources : [resources];
  resources.forEach((obj) => {
    for (const name in obj) {
      obj[name].delete();
    }
  });
}
function getAggregationModel(device, shaderOptions) {
  const shaders = mergeShaders({
    vs: aggregate_to_grid_vs_glsl_default,
    fs: aggregate_to_grid_fs_glsl_default,
    modules: [fp64arithmetic, project32_default]
  }, shaderOptions);
  return new Model(device, {
    id: "Grid-Aggregation-Model",
    vertexCount: 1,
    drawMode: 0,
    shaderAssembler: getShaderAssembler(),
    ...shaders
  });
}
function getAllAggregationModel(device, instanceCount) {
  return new Model(device, {
    id: "All-Aggregation-Model",
    vs: aggregate_all_vs_glsl_default,
    fs: aggregate_all_fs_glsl_default,
    modules: [fp64arithmetic],
    vertexCount: 1,
    topology: "point-list",
    isInstanced: true,
    instanceCount,
    attributes: {
      // @ts-expect-error
      position: [0, 0]
    }
  });
}
function getMeanTransform(device, opts) {
  return new TextureTransform(device, {
    vs: transform_mean_vs_glsl_default,
    _targetTextureVarying: "meanValues",
    ...opts
  });
}

// node_modules/@deck.gl/aggregation-layers/dist/utils/color-utils.js
var defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
function colorRangeToFlatArray(colorRange, normalize = false, ArrayType = Float32Array) {
  let flatArray;
  if (Number.isFinite(colorRange[0])) {
    flatArray = new ArrayType(colorRange);
  } else {
    flatArray = new ArrayType(colorRange.length * 4);
    let index = 0;
    for (let i3 = 0; i3 < colorRange.length; i3++) {
      const color = colorRange[i3];
      flatArray[index++] = color[0];
      flatArray[index++] = color[1];
      flatArray[index++] = color[2];
      flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
    }
  }
  if (normalize) {
    for (let i3 = 0; i3 < flatArray.length; i3++) {
      flatArray[i3] /= 255;
    }
  }
  return flatArray;
}

// node_modules/@deck.gl/aggregation-layers/dist/screen-grid-layer/screen-grid-layer-vertex.glsl.js
var screen_grid_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6
in vec3 positions;
in vec3 instancePositions;
in vec4 instanceCounts;
in vec3 instancePickingColors;
uniform float opacity;
uniform vec3 cellScale;
uniform vec4 minColor;
uniform vec4 maxColor;
uniform vec4 colorRange[RANGE_COUNT];
uniform vec2 colorDomain;
uniform bool shouldUseMinMax;
uniform sampler2D maxTexture;
out vec4 vColor;
out float vSampleCount;
vec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {
vec4 outColor = vec4(0., 0., 0., 0.);
if (value >= domain.x && value <= domain.y) {
float domainRange = domain.y - domain.x;
if (domainRange <= 0.) {
outColor = colorRange[0];
} else {
float rangeCount = float(RANGE_COUNT);
float rangeStep = domainRange / rangeCount;
float idx = floor((value - domain.x) / rangeStep);
idx = clamp(idx, 0., rangeCount - 1.);
int intIdx = int(idx);
outColor = colorRange[intIdx];
}
}
outColor = outColor / 255.;
return outColor;
}
void main(void) {
vSampleCount = instanceCounts.a;
float weight = instanceCounts.r;
float maxWeight = texture(maxTexture, vec2(0.5)).r;
float step = weight / maxWeight;
vec4 minMaxColor = mix(minColor, maxColor, step) / 255.;
vec2 domain = colorDomain;
float domainMaxValid = float(colorDomain.y != 0.);
domain.y = mix(maxWeight, colorDomain.y, domainMaxValid);
vec4 rangeColor = quantizeScale(domain, colorRange, weight);
float rangeMinMax = float(shouldUseMinMax);
vec4 color = mix(rangeColor, minMaxColor, rangeMinMax);
vColor = vec4(color.rgb, color.a * opacity);
picking_setPickingColor(instancePickingColors);
gl_Position = vec4(instancePositions + positions * cellScale, 1.);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/screen-grid-layer/screen-grid-layer-fragment.glsl.js
var screen_grid_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME screen-grid-layer-fragment-shader
precision highp float;
in vec4 vColor;
in float vSampleCount;
out vec4 fragColor;
void main(void) {
if (vSampleCount <= 0.0) {
discard;
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/screen-grid-layer/screen-grid-cell-layer.js
var DEFAULT_MINCOLOR = [0, 0, 0, 0];
var DEFAULT_MAXCOLOR = [0, 255, 0, 255];
var COLOR_PROPS = ["minColor", "maxColor", "colorRange", "colorDomain"];
var defaultProps = {
  cellSizePixels: { type: "number", value: 100, min: 1 },
  cellMarginPixels: { type: "number", value: 2, min: 0, max: 5 },
  colorDomain: null,
  colorRange: defaultColorRange
};
var ScreenGridCellLayer = class extends layer_default {
  getShaders() {
    return { vs: screen_grid_layer_vertex_glsl_default, fs: screen_grid_layer_fragment_glsl_default, modules: [picking_default] };
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      instancePositions: { size: 3, update: this.calculateInstancePositions },
      instanceCounts: { size: 4, noAlloc: true }
    });
    this.setState({
      model: this._getModel()
    });
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  updateState(params) {
    super.updateState(params);
    const { oldProps, props, changeFlags } = params;
    const attributeManager = this.getAttributeManager();
    if (props.numInstances !== oldProps.numInstances) {
      attributeManager.invalidateAll();
    } else if (oldProps.cellSizePixels !== props.cellSizePixels) {
      attributeManager.invalidate("instancePositions");
    }
    this._updateUniforms(oldProps, props, changeFlags);
  }
  draw({ uniforms }) {
    const { parameters, maxTexture } = this.props;
    const minColor = this.props.minColor || DEFAULT_MINCOLOR;
    const maxColor = this.props.maxColor || DEFAULT_MAXCOLOR;
    const colorDomain = this.props.colorDomain || [1, 0];
    const model = this.state.model;
    model.setUniforms(uniforms);
    model.setBindings({
      maxTexture
    });
    model.setUniforms({
      // @ts-expect-error stricter luma gl types
      minColor,
      // @ts-expect-error stricter luma gl types
      maxColor,
      colorDomain
    });
    model.setParameters({
      depthWriteEnabled: false,
      // How to specify depth mask in WebGPU?
      // depthMask: false,
      ...parameters
    });
    model.draw(this.context.renderPass);
  }
  calculateInstancePositions(attribute, { numInstances }) {
    const { width, height } = this.context.viewport;
    const { cellSizePixels } = this.props;
    const numCol = Math.ceil(width / cellSizePixels);
    const { value, size } = attribute;
    for (let i3 = 0; i3 < numInstances; i3++) {
      const x2 = i3 % numCol;
      const y2 = Math.floor(i3 / numCol);
      value[i3 * size + 0] = x2 * cellSizePixels / width * 2 - 1;
      value[i3 * size + 1] = 1 - y2 * cellSizePixels / height * 2;
      value[i3 * size + 2] = 0;
    }
  }
  // Private Methods
  _getModel() {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new Geometry({
        topology: "triangle-list",
        attributes: {
          // prettier-ignore
          positions: new Float32Array([
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            1,
            0
          ])
        }
      }),
      isInstanced: true
    });
  }
  _shouldUseMinMax() {
    const { minColor, maxColor, colorDomain, colorRange } = this.props;
    if (minColor || maxColor) {
      log_default.deprecated("ScreenGridLayer props: minColor and maxColor", "colorRange, colorDomain")();
      return true;
    }
    if (colorDomain || colorRange) {
      return false;
    }
    return true;
  }
  _updateUniforms(oldProps, props, changeFlags) {
    const model = this.state.model;
    if (COLOR_PROPS.some((key) => oldProps[key] !== props[key])) {
      model.setUniforms({ shouldUseMinMax: this._shouldUseMinMax() });
    }
    if (oldProps.colorRange !== props.colorRange) {
      model.setUniforms({ colorRange: colorRangeToFlatArray(props.colorRange) });
    }
    if (oldProps.cellMarginPixels !== props.cellMarginPixels || oldProps.cellSizePixels !== props.cellSizePixels || changeFlags.viewportChanged) {
      const { width, height } = this.context.viewport;
      const { cellSizePixels, cellMarginPixels } = this.props;
      const margin = cellSizePixels > cellMarginPixels ? cellMarginPixels : 0;
      const cellScale = new Float32Array([
        (cellSizePixels - margin) / width * 2,
        -(cellSizePixels - margin) / height * 2,
        1
      ]);
      model.setUniforms({ cellScale });
    }
  }
};
ScreenGridCellLayer.layerName = "ScreenGridCellLayer";
ScreenGridCellLayer.defaultProps = defaultProps;
var screen_grid_cell_layer_default = ScreenGridCellLayer;

// node_modules/@deck.gl/aggregation-layers/dist/utils/prop-utils.js
function filterProps(props, filterKeys) {
  const filteredProps = {};
  for (const key in props) {
    if (!filterKeys.includes(key)) {
      filteredProps[key] = props[key];
    }
  }
  return filteredProps;
}

// node_modules/@deck.gl/aggregation-layers/dist/aggregation-layer.js
var AggregationLayer = class extends composite_layer_default {
  initializeAggregationLayer(dimensions) {
    super.initializeState(this.context);
    this.setState({
      // Layer props , when changed doesn't require updating aggregation
      ignoreProps: filterProps(this.constructor._propTypes, dimensions.data.props),
      dimensions
    });
  }
  updateState(opts) {
    super.updateState(opts);
    const { changeFlags } = opts;
    if (changeFlags.extensionsChanged) {
      const shaders = this.getShaders({});
      if (shaders && shaders.defines) {
        shaders.defines.NON_INSTANCED_MODEL = 1;
      }
      this.updateShaders(shaders);
    }
    this._updateAttributes();
  }
  updateAttributes(changedAttributes) {
    this.setState({ changedAttributes });
  }
  getAttributes() {
    return this.getAttributeManager().getAttributes();
  }
  getModuleSettings() {
    const { viewport, mousePosition, device } = this.context;
    const moduleSettings = Object.assign(Object.create(this.props), {
      viewport,
      mousePosition,
      picking: {
        isActive: 0
      },
      // @ts-expect-error TODO - assuming WebGL context
      devicePixelRatio: device.canvasContext.cssToDeviceRatio()
    });
    return moduleSettings;
  }
  updateShaders(shaders) {
  }
  /**
   * Checks if aggregation is dirty
   * @param {Object} updateOpts - object {props, oldProps, changeFlags}
   * @param {Object} params - object {dimension, compareAll}
   * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
   * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
   * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
   **/
  isAggregationDirty(updateOpts, params = {}) {
    const { props, oldProps, changeFlags } = updateOpts;
    const { compareAll = false, dimension } = params;
    const { ignoreProps } = this.state;
    const { props: dataProps, accessors = [] } = dimension;
    const { updateTriggersChanged } = changeFlags;
    if (changeFlags.dataChanged) {
      return true;
    }
    if (updateTriggersChanged) {
      if (updateTriggersChanged.all) {
        return true;
      }
      for (const accessor of accessors) {
        if (updateTriggersChanged[accessor]) {
          return true;
        }
      }
    }
    if (compareAll) {
      if (changeFlags.extensionsChanged) {
        return true;
      }
      return compareProps({
        oldProps,
        newProps: props,
        ignoreProps,
        propTypes: this.constructor._propTypes
      });
    }
    for (const name of dataProps) {
      if (props[name] !== oldProps[name]) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks if an attribute is changed
   * @param {String} name - name of the attribute
   * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
   *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
   **/
  isAttributeChanged(name) {
    const { changedAttributes } = this.state;
    if (!name) {
      return !isObjectEmpty(changedAttributes);
    }
    return changedAttributes && changedAttributes[name] !== void 0;
  }
  // Private
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
};
AggregationLayer.layerName = "AggregationLayer";
var aggregation_layer_default = AggregationLayer;
function isObjectEmpty(obj) {
  let isEmpty = true;
  for (const key in obj) {
    isEmpty = false;
    break;
  }
  return isEmpty;
}

// node_modules/@deck.gl/aggregation-layers/dist/utils/scale-utils.js
function getScale(domain, range, scaleFunction) {
  const scale = scaleFunction;
  scale.domain = () => domain;
  scale.range = () => range;
  return scale;
}
function getQuantizeScale(domain, range) {
  const scaleFunction = (value) => quantizeScale(domain, range, value);
  return getScale(domain, range, scaleFunction);
}
function getLinearScale(domain, range) {
  const scaleFunction = (value) => linearScale(domain, range, value);
  return getScale(domain, range, scaleFunction);
}
function getQuantileScale(domain, range) {
  const sortedDomain = domain.sort(ascending);
  let i3 = 0;
  const n2 = Math.max(1, range.length);
  const thresholds = new Array(n2 - 1);
  while (++i3 < n2) {
    thresholds[i3 - 1] = threshold(sortedDomain, i3 / n2);
  }
  const scaleFunction = (value) => thresholdsScale(thresholds, range, value);
  scaleFunction.thresholds = () => thresholds;
  return getScale(domain, range, scaleFunction);
}
function ascending(a2, b2) {
  return a2 - b2;
}
function threshold(domain, fraction) {
  const domainLength = domain.length;
  if (fraction <= 0 || domainLength < 2) {
    return domain[0];
  }
  if (fraction >= 1) {
    return domain[domainLength - 1];
  }
  const domainFraction = (domainLength - 1) * fraction;
  const lowIndex = Math.floor(domainFraction);
  const low = domain[lowIndex];
  const high = domain[lowIndex + 1];
  return low + (high - low) * (domainFraction - lowIndex);
}
function bisectRight(a2, x2) {
  let lo = 0;
  let hi = a2.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (ascending(a2[mid], x2) > 0) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
function thresholdsScale(thresholds, range, value) {
  return range[bisectRight(thresholds, value)];
}
function ordinalScale(domain, domainMap, range, value) {
  const key = `${value}`;
  let d2 = domainMap.get(key);
  if (d2 === void 0) {
    d2 = domain.push(value);
    domainMap.set(key, d2);
  }
  return range[(d2 - 1) % range.length];
}
function getOrdinalScale(domain, range) {
  const domainMap = /* @__PURE__ */ new Map();
  const uniqueDomain = [];
  for (const d2 of domain) {
    const key = `${d2}`;
    if (!domainMap.has(key)) {
      domainMap.set(key, uniqueDomain.push(d2));
    }
  }
  const scaleFunction = (value) => ordinalScale(uniqueDomain, domainMap, range, value);
  return getScale(domain, range, scaleFunction);
}
function quantizeScale(domain, range, value) {
  const domainRange = domain[1] - domain[0];
  if (domainRange <= 0) {
    log_default.warn("quantizeScale: invalid domain, returning range[0]")();
    return range[0];
  }
  const step = domainRange / range.length;
  const idx = Math.floor((value - domain[0]) / step);
  const clampIdx = Math.max(Math.min(idx, range.length - 1), 0);
  return range[clampIdx];
}
function linearScale(domain, range, value) {
  return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
}
function notNullOrUndefined(d2) {
  return d2 !== void 0 && d2 !== null;
}
function unique(values) {
  const results = [];
  values.forEach((v2) => {
    if (!results.includes(v2) && notNullOrUndefined(v2)) {
      results.push(v2);
    }
  });
  return results;
}
function getTruthyValues(data, valueAccessor) {
  const values = typeof valueAccessor === "function" ? data.map(valueAccessor) : data;
  return values.filter(notNullOrUndefined);
}
function getQuantileDomain(data, valueAccessor) {
  return getTruthyValues(data, valueAccessor);
}
function getOrdinalDomain(data, valueAccessor) {
  return unique(getTruthyValues(data, valueAccessor));
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function getScaleFunctionByScaleType(scaleType) {
  switch (scaleType) {
    case "quantize":
      return getQuantizeScale;
    case "linear":
      return getLinearScale;
    case "quantile":
      return getQuantileScale;
    case "ordinal":
      return getOrdinalScale;
    default:
      return getQuantizeScale;
  }
}

// node_modules/@deck.gl/aggregation-layers/dist/utils/bin-sorter.js
var defaultGetValue = (points) => points.length;
var MAX_32_BIT_FLOAT2 = 3402823466e29;
var defaultGetPoints = (bin) => bin.points;
var defaultGetIndex = (bin) => bin.index;
var ascending2 = (a2, b2) => a2 < b2 ? -1 : a2 > b2 ? 1 : a2 >= b2 ? 0 : NaN;
var defaultProps2 = {
  getValue: defaultGetValue,
  getPoints: defaultGetPoints,
  getIndex: defaultGetIndex,
  filterData: null
};
var BinSorter = class {
  constructor(bins = [], props = defaultProps2) {
    this.aggregatedBins = this.getAggregatedBins(bins, props);
    this._updateMinMaxValues();
    this.binMap = this.getBinMap();
  }
  /**
   * Get an array of object with aggregated values and index of bins
   * Array object will be sorted by value optionally.
   * @param {Array} bins
   * @param {Function} getValue
   * @return {Array} array of values and index lookup
   */
  getAggregatedBins(bins, props) {
    const { getValue = defaultGetValue, getPoints = defaultGetPoints, getIndex = defaultGetIndex, filterData } = props;
    const hasFilter = typeof filterData === "function";
    const binCount = bins.length;
    const aggregatedBins = [];
    let index = 0;
    for (let binIndex = 0; binIndex < binCount; binIndex++) {
      const bin = bins[binIndex];
      const points = getPoints(bin);
      const i3 = getIndex(bin);
      const filteredPoints = hasFilter ? points.filter(filterData) : points;
      bin.filteredPoints = hasFilter ? filteredPoints : null;
      const value = filteredPoints.length ? getValue(filteredPoints) : null;
      if (value !== null && value !== void 0) {
        aggregatedBins[index] = {
          i: Number.isFinite(i3) ? i3 : binIndex,
          value,
          counts: filteredPoints.length
        };
        index++;
      }
    }
    return aggregatedBins;
  }
  _percentileToIndex(percentileRange) {
    const len = this.sortedBins.length;
    if (len < 2) {
      return [0, 0];
    }
    const [lower, upper] = percentileRange.map((n2) => clamp(n2, 0, 100));
    const lowerIdx = Math.ceil(lower / 100 * (len - 1));
    const upperIdx = Math.floor(upper / 100 * (len - 1));
    return [lowerIdx, upperIdx];
  }
  /**
   * Get a mapping from cell/hexagon index to sorted bin
   * This is used to retrieve bin value for color calculation
   * @return {Object} bin index to aggregatedBins
   */
  getBinMap() {
    const binMap = {};
    for (const bin of this.aggregatedBins) {
      binMap[bin.i] = bin;
    }
    return binMap;
  }
  // Private
  /**
   * Get ths max count of all bins
   */
  _updateMinMaxValues() {
    let maxCount = 0;
    let maxValue = 0;
    let minValue = MAX_32_BIT_FLOAT2;
    let totalCount = 0;
    for (const x2 of this.aggregatedBins) {
      maxCount = maxCount > x2.counts ? maxCount : x2.counts;
      maxValue = maxValue > x2.value ? maxValue : x2.value;
      minValue = minValue < x2.value ? minValue : x2.value;
      totalCount += x2.counts;
    }
    this.maxCount = maxCount;
    this.maxValue = maxValue;
    this.minValue = minValue;
    this.totalCount = totalCount;
  }
  /**
   * Get range of values of all bins
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
   * @return {Array} array of new value range
   */
  getValueRange(percentileRange) {
    if (!this.sortedBins) {
      this.sortedBins = this.aggregatedBins.sort((a2, b2) => ascending2(a2.value, b2.value));
    }
    if (!this.sortedBins.length) {
      return [];
    }
    let lowerIdx = 0;
    let upperIdx = this.sortedBins.length - 1;
    if (Array.isArray(percentileRange)) {
      const idxRange = this._percentileToIndex(percentileRange);
      lowerIdx = idxRange[0];
      upperIdx = idxRange[1];
    }
    return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
  }
  getValueDomainByScale(scale, [lower = 0, upper = 100] = []) {
    if (!this.sortedBins) {
      this.sortedBins = this.aggregatedBins.sort((a2, b2) => ascending2(a2.value, b2.value));
    }
    if (!this.sortedBins.length) {
      return [];
    }
    const indexEdge = this._percentileToIndex([lower, upper]);
    return this._getScaleDomain(scale, indexEdge);
  }
  _getScaleDomain(scaleType, [lowerIdx, upperIdx]) {
    const bins = this.sortedBins;
    switch (scaleType) {
      case "quantize":
      case "linear":
        return [bins[lowerIdx].value, bins[upperIdx].value];
      case "quantile":
        return getQuantileDomain(bins.slice(lowerIdx, upperIdx + 1), (d2) => d2.value);
      case "ordinal":
        return getOrdinalDomain(bins, (d2) => d2.value);
      default:
        return [bins[lowerIdx].value, bins[upperIdx].value];
    }
  }
};

// node_modules/@deck.gl/aggregation-layers/dist/utils/grid-aggregation-utils.js
var R_EARTH = 6378e3;
function toFinite(n2) {
  return Number.isFinite(n2) ? n2 : 0;
}
function getBoundingBox(attributes, vertexCount) {
  const positions = attributes.positions.value;
  let yMin = Infinity;
  let yMax = -Infinity;
  let xMin = Infinity;
  let xMax = -Infinity;
  let y2;
  let x2;
  for (let i3 = 0; i3 < vertexCount; i3++) {
    x2 = positions[i3 * 3];
    y2 = positions[i3 * 3 + 1];
    yMin = y2 < yMin ? y2 : yMin;
    yMax = y2 > yMax ? y2 : yMax;
    xMin = x2 < xMin ? x2 : xMin;
    xMax = x2 > xMax ? x2 : xMax;
  }
  const boundingBox = {
    xMin: toFinite(xMin),
    xMax: toFinite(xMax),
    yMin: toFinite(yMin),
    yMax: toFinite(yMax)
  };
  return boundingBox;
}
function getTranslation(boundingBox, gridOffset, coordinateSystem, viewport) {
  const { width, height } = viewport;
  const worldOrigin = coordinateSystem === COORDINATE_SYSTEM.CARTESIAN ? [-width / 2, -height / 2] : [-180, -90];
  log_default.assert(coordinateSystem === COORDINATE_SYSTEM.CARTESIAN || coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.DEFAULT);
  const { xMin, yMin } = boundingBox;
  return [
    // Align origin to match grid cell boundaries in CPU and GPU aggregations
    -1 * (alignToCell(xMin - worldOrigin[0], gridOffset.xOffset) + worldOrigin[0]),
    -1 * (alignToCell(yMin - worldOrigin[1], gridOffset.yOffset) + worldOrigin[1])
  ];
}
function alignToCell(inValue, cellSize) {
  const sign = inValue < 0 ? -1 : 1;
  let value = sign < 0 ? Math.abs(inValue) + cellSize : Math.abs(inValue);
  value = Math.floor(value / cellSize) * cellSize;
  return value * sign;
}
function getGridOffset(boundingBox, cellSize, convertToMeters = true) {
  if (!convertToMeters) {
    return { xOffset: cellSize, yOffset: cellSize };
  }
  const { yMin, yMax } = boundingBox;
  const centerLat = (yMin + yMax) / 2;
  return calculateGridLatLonOffset(cellSize, centerLat);
}
function getGridParams(boundingBox, cellSize, viewport, coordinateSystem) {
  const gridOffset = getGridOffset(boundingBox, cellSize, coordinateSystem !== COORDINATE_SYSTEM.CARTESIAN);
  const translation = getTranslation(boundingBox, gridOffset, coordinateSystem, viewport);
  const { xMin, yMin, xMax, yMax } = boundingBox;
  const width = xMax - xMin + gridOffset.xOffset;
  const height = yMax - yMin + gridOffset.yOffset;
  const numCol = Math.ceil(width / gridOffset.xOffset);
  const numRow = Math.ceil(height / gridOffset.yOffset);
  return { gridOffset, translation, width, height, numCol, numRow };
}
function calculateGridLatLonOffset(cellSize, latitude) {
  const yOffset = calculateLatOffset(cellSize);
  const xOffset = calculateLonOffset(latitude, cellSize);
  return { yOffset, xOffset };
}
function calculateLatOffset(dy) {
  return dy / R_EARTH * (180 / Math.PI);
}
function calculateLonOffset(lat, dx) {
  return dx / R_EARTH * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
}

// node_modules/@deck.gl/aggregation-layers/dist/cpu-grid-layer/grid-aggregator.js
function pointToDensityGridDataCPU(props, aggregationParams) {
  const hashInfo = pointsToGridHashing(props, aggregationParams);
  const result = getGridLayerDataFromGridHash(hashInfo);
  return {
    gridHash: hashInfo.gridHash,
    gridOffset: hashInfo.gridOffset,
    data: result
  };
}
function pointsToGridHashing(props, aggregationParams) {
  const { data = [], cellSize } = props;
  const { attributes, viewport, projectPoints, numInstances } = aggregationParams;
  const positions = attributes.positions.value;
  const { size } = attributes.positions.getAccessor();
  const boundingBox = aggregationParams.boundingBox || getPositionBoundingBox(attributes.positions, numInstances);
  const offsets = aggregationParams.posOffset || [180, 90];
  const gridOffset = aggregationParams.gridOffset || getGridOffset(boundingBox, cellSize);
  if (gridOffset.xOffset <= 0 || gridOffset.yOffset <= 0) {
    return { gridHash: {}, gridOffset, offsets: [0, 0] };
  }
  const { width, height } = viewport;
  const numCol = Math.ceil(width / gridOffset.xOffset);
  const numRow = Math.ceil(height / gridOffset.yOffset);
  const gridHash = {};
  const { iterable, objectInfo } = createIterable(data);
  const position = new Array(3);
  for (const pt of iterable) {
    objectInfo.index++;
    position[0] = positions[objectInfo.index * size];
    position[1] = positions[objectInfo.index * size + 1];
    position[2] = size >= 3 ? positions[objectInfo.index * size + 2] : 0;
    const [x2, y2] = projectPoints ? viewport.project(position) : position;
    if (Number.isFinite(x2) && Number.isFinite(y2)) {
      const yIndex = Math.floor((y2 + offsets[1]) / gridOffset.yOffset);
      const xIndex = Math.floor((x2 + offsets[0]) / gridOffset.xOffset);
      if (!projectPoints || // when doing screen space agggregation (projectPoints = true), filter points outside of the viewport range.
      xIndex >= 0 && xIndex < numCol && yIndex >= 0 && yIndex < numRow) {
        const key = `${yIndex}-${xIndex}`;
        gridHash[key] = gridHash[key] || { count: 0, points: [], lonIdx: xIndex, latIdx: yIndex };
        gridHash[key].count += 1;
        gridHash[key].points.push({
          source: pt,
          index: objectInfo.index
        });
      }
    }
  }
  return { gridHash, gridOffset, offsets: [offsets[0] * -1, offsets[1] * -1] };
}
function getGridLayerDataFromGridHash({ gridHash, gridOffset, offsets }) {
  const data = new Array(Object.keys(gridHash).length);
  let i3 = 0;
  for (const key in gridHash) {
    const idxs = key.split("-");
    const latIdx = parseInt(idxs[0], 10);
    const lonIdx = parseInt(idxs[1], 10);
    const index = i3++;
    data[index] = {
      index,
      position: [
        offsets[0] + gridOffset.xOffset * lonIdx,
        offsets[1] + gridOffset.yOffset * latIdx
      ],
      ...gridHash[key]
    };
  }
  return data;
}
function getPositionBoundingBox(positionAttribute, numInstance) {
  const positions = positionAttribute.value;
  const { size } = positionAttribute.getAccessor();
  let yMin = Infinity;
  let yMax = -Infinity;
  let xMin = Infinity;
  let xMax = -Infinity;
  let y2;
  let x2;
  for (let i3 = 0; i3 < numInstance; i3++) {
    x2 = positions[i3 * size];
    y2 = positions[i3 * size + 1];
    if (Number.isFinite(x2) && Number.isFinite(y2)) {
      yMin = y2 < yMin ? y2 : yMin;
      yMax = y2 > yMax ? y2 : yMax;
      xMin = x2 < xMin ? x2 : xMin;
      xMax = x2 > xMax ? x2 : xMax;
    }
  }
  return { xMin, xMax, yMin, yMax };
}

// node_modules/@deck.gl/aggregation-layers/dist/grid-aggregation-layer.js
var GridAggregationLayer = class extends aggregation_layer_default {
  initializeAggregationLayer({ dimensions }) {
    super.initializeAggregationLayer(dimensions);
    this.setState({
      // CPU aggregation results
      layerData: {},
      gpuGridAggregator: new GPUGridAggregator(this.context.device, {
        id: `${this.id}-gpu-aggregator`
      }),
      cpuGridAggregator: pointToDensityGridDataCPU
    });
  }
  updateState(opts) {
    super.updateState(opts);
    this.updateAggregationState(opts);
    const { aggregationDataDirty, aggregationWeightsDirty, gpuAggregation } = this.state;
    if (this.getNumInstances() <= 0) {
      return;
    }
    let aggregationDirty = false;
    if (aggregationDataDirty || gpuAggregation && aggregationWeightsDirty) {
      this._updateAggregation(opts);
      aggregationDirty = true;
    }
    if (!gpuAggregation && (aggregationDataDirty || aggregationWeightsDirty)) {
      this._updateWeightBins();
      this._uploadAggregationResults();
      aggregationDirty = true;
    }
    this.setState({ aggregationDirty });
  }
  finalizeState(context) {
    var _a;
    const { count } = this.state.weights;
    if (count && count.aggregationBuffer) {
      count.aggregationBuffer.delete();
    }
    (_a = this.state.gpuGridAggregator) == null ? void 0 : _a.delete();
    super.finalizeState(context);
  }
  updateShaders(shaders) {
    if (this.state.gpuAggregation) {
      this.state.gpuGridAggregator.updateShaders(shaders);
    }
  }
  // Methods that can be overriden by subclasses for customizations
  updateAggregationState(opts) {
    log_default.assert(false);
  }
  allocateResources(numRow, numCol) {
    if (this.state.numRow !== numRow || this.state.numCol !== numCol) {
      const dataBytes = numCol * numRow * 4 * 4;
      const { weights } = this.state;
      for (const name in weights) {
        const weight = weights[name];
        if (weight.aggregationBuffer) {
          weight.aggregationBuffer.delete();
        }
        weight.aggregationBuffer = this.context.device.createBuffer({
          byteLength: dataBytes,
          // @ts-expect-error legacy
          accessor: {
            size: 4,
            type: 5126,
            divisor: 1
          }
        });
      }
    }
  }
  updateResults({ aggregationData, maxMinData, maxData, minData }) {
    const { count } = this.state.weights;
    if (count) {
      count.aggregationData = aggregationData;
      count.maxMinData = maxMinData;
      count.maxData = maxData;
      count.minData = minData;
    }
  }
  // Private
  _updateAggregation(opts) {
    const { cpuGridAggregator, gpuGridAggregator, gridOffset, posOffset, translation = [0, 0], scaling = [0, 0, 0], boundingBox, projectPoints, gpuAggregation, numCol, numRow } = this.state;
    const { props } = opts;
    const { viewport } = this.context;
    const attributes = this.getAttributes();
    const vertexCount = this.getNumInstances();
    if (!gpuAggregation) {
      const result = cpuGridAggregator(props, {
        gridOffset,
        projectPoints,
        attributes,
        viewport,
        posOffset,
        boundingBox
      });
      this.setState({
        layerData: result
      });
    } else {
      const { weights } = this.state;
      gpuGridAggregator.run({
        weights,
        cellSize: [gridOffset.xOffset, gridOffset.yOffset],
        numCol,
        numRow,
        translation,
        scaling,
        vertexCount,
        projectPoints,
        attributes,
        moduleSettings: this.getModuleSettings()
      });
    }
  }
  _updateWeightBins() {
    const { getValue } = this.state;
    const sortedBins = new BinSorter(this.state.layerData.data || [], { getValue });
    this.setState({ sortedBins });
  }
  _uploadAggregationResults() {
    const { numCol, numRow } = this.state;
    const { data } = this.state.layerData;
    const { aggregatedBins, minValue, maxValue, totalCount } = this.state.sortedBins;
    const ELEMENTCOUNT = 4;
    const aggregationSize = numCol * numRow * ELEMENTCOUNT;
    const aggregationData = new Float32Array(aggregationSize).fill(0);
    for (const bin of aggregatedBins) {
      const { lonIdx, latIdx } = data[bin.i];
      const { value, counts } = bin;
      const cellIndex = (lonIdx + latIdx * numCol) * ELEMENTCOUNT;
      aggregationData[cellIndex] = value;
      aggregationData[cellIndex + ELEMENTCOUNT - 1] = counts;
    }
    const maxMinData = new Float32Array([maxValue, 0, 0, minValue]);
    const maxData = new Float32Array([maxValue, 0, 0, totalCount]);
    const minData = new Float32Array([minValue, 0, 0, totalCount]);
    this.updateResults({ aggregationData, maxMinData, maxData, minData });
  }
};
GridAggregationLayer.layerName = "GridAggregationLayer";
var grid_aggregation_layer_default = GridAggregationLayer;

// node_modules/@deck.gl/aggregation-layers/dist/screen-grid-layer/screen-grid-layer.js
var defaultProps3 = {
  ...screen_grid_cell_layer_default.defaultProps,
  getPosition: { type: "accessor", value: (d2) => d2.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: false,
  // TODO(v9): Re-enable GPU aggregation.
  aggregation: "SUM"
};
var POSITION_ATTRIBUTE_NAME = "positions";
var DIMENSIONS = {
  data: {
    props: ["cellSizePixels"]
  },
  weights: {
    props: ["aggregation"],
    accessors: ["getWeight"]
  }
};
var ScreenGridLayer = class extends grid_aggregation_layer_default {
  initializeState() {
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS,
      // @ts-expect-error
      getCellSize: (props) => props.cellSizePixels
      // TODO
    });
    const weights = {
      count: {
        size: 1,
        operation: AGGREGATION_OPERATION.SUM,
        needMax: true,
        maxTexture: getFloatTexture(this.context.device, { id: `${this.id}-max-texture` })
      }
    };
    this.setState({
      supported: true,
      projectPoints: true,
      // aggregation in screen space
      weights,
      subLayerData: { attributes: {} },
      maxTexture: weights.count.maxTexture,
      positionAttributeName: "positions",
      posOffset: [0, 0],
      translation: [1, -1]
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME]: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      count: { size: 3, accessor: "getWeight" }
    });
  }
  shouldUpdateState({ changeFlags }) {
    return this.state.supported && changeFlags.somethingChanged;
  }
  updateState(opts) {
    super.updateState(opts);
  }
  renderLayers() {
    if (!this.state.supported) {
      return [];
    }
    const { maxTexture, numRow, numCol, weights } = this.state;
    const { updateTriggers } = this.props;
    const { aggregationBuffer } = weights.count;
    const CellLayerClass = this.getSubLayerClass("cells", screen_grid_cell_layer_default);
    return new CellLayerClass(this.props, this.getSubLayerProps({
      id: "cell-layer",
      updateTriggers
    }), {
      data: { attributes: { instanceCounts: aggregationBuffer } },
      maxTexture,
      numInstances: numRow * numCol
    });
  }
  finalizeState(context) {
    super.finalizeState(context);
    const { aggregationBuffer, maxBuffer, maxTexture } = this.state;
    aggregationBuffer == null ? void 0 : aggregationBuffer.delete();
    maxBuffer == null ? void 0 : maxBuffer.delete();
    maxTexture == null ? void 0 : maxTexture.delete();
  }
  getPickingInfo({ info }) {
    const { index } = info;
    if (index >= 0) {
      const { gpuGridAggregator, gpuAggregation, weights } = this.state;
      const aggregationResults = gpuAggregation ? gpuGridAggregator.getData("count") : weights.count;
      info.object = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...aggregationResults
      });
    }
    return info;
  }
  // Aggregation Overrides
  updateResults({ aggregationData, maxData }) {
    const { count } = this.state.weights;
    count.aggregationData = aggregationData;
    count.aggregationBuffer.write(aggregationData);
    count.maxData = maxData;
    count.maxTexture.setImageData({ data: maxData });
  }
  /* eslint-disable complexity, max-statements */
  updateAggregationState(opts) {
    const cellSize = opts.props.cellSizePixels;
    const cellSizeChanged = opts.oldProps.cellSizePixels !== cellSize;
    const { viewportChanged } = opts.changeFlags;
    let gpuAggregation = opts.props.gpuAggregation;
    if (this.state.gpuAggregation !== opts.props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.device)) {
        log_default.warn("GPU Grid Aggregation not supported, falling back to CPU")();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });
    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME);
    const { dimensions } = this.state;
    const { data, weights } = dimensions;
    const aggregationDataDirty = positionsChanged || gpuAggregationChanged || viewportChanged || this.isAggregationDirty(opts, {
      compareAll: gpuAggregation,
      // check for all (including extentions props) when using gpu aggregation
      dimension: data
    });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, { dimension: weights });
    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });
    const { viewport } = this.context;
    if (viewportChanged || cellSizeChanged) {
      const { width, height } = viewport;
      const numCol = Math.ceil(width / cellSize);
      const numRow = Math.ceil(height / cellSize);
      this.allocateResources(numRow, numCol);
      this.setState({
        // transformation from clipspace to screen(pixel) space
        scaling: [width / 2, -height / 2, 1],
        gridOffset: { xOffset: cellSize, yOffset: cellSize },
        width,
        height,
        numCol,
        numRow
      });
    }
    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
  }
  /* eslint-enable complexity, max-statements */
  // Private
  _updateAccessors(opts) {
    const { getWeight, aggregation, data } = opts.props;
    const { count } = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({ getValue: getValueFunc(aggregation, getWeight, { data }) });
  }
  _resetResults() {
    const { count } = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }
};
ScreenGridLayer.layerName = "ScreenGridLayer";
ScreenGridLayer.defaultProps = defaultProps3;
var screen_grid_layer_default = ScreenGridLayer;

// node_modules/@deck.gl/aggregation-layers/dist/utils/cpu-aggregator.js
function noop() {
}
var dimensionSteps = ["getBins", "getDomain", "getScaleFunc"];
var defaultDimensions = [
  {
    key: "fillColor",
    accessor: "getFillColor",
    pickingInfo: "colorValue",
    getBins: {
      triggers: {
        value: {
          prop: "getColorValue",
          updateTrigger: "getColorValue"
        },
        weight: {
          prop: "getColorWeight",
          updateTrigger: "getColorWeight"
        },
        aggregation: {
          prop: "colorAggregation"
        },
        filterData: {
          prop: "_filterData",
          updateTrigger: "_filterData"
        }
      }
    },
    getDomain: {
      triggers: {
        lowerPercentile: {
          prop: "lowerPercentile"
        },
        upperPercentile: {
          prop: "upperPercentile"
        },
        scaleType: {
          prop: "colorScaleType"
        }
      }
    },
    getScaleFunc: {
      triggers: {
        domain: { prop: "colorDomain" },
        range: { prop: "colorRange" }
      },
      onSet: {
        props: "onSetColorDomain"
      }
    },
    nullValue: [0, 0, 0, 0]
  },
  {
    key: "elevation",
    accessor: "getElevation",
    pickingInfo: "elevationValue",
    getBins: {
      triggers: {
        value: {
          prop: "getElevationValue",
          updateTrigger: "getElevationValue"
        },
        weight: {
          prop: "getElevationWeight",
          updateTrigger: "getElevationWeight"
        },
        aggregation: {
          prop: "elevationAggregation"
        },
        filterData: {
          prop: "_filterData",
          updateTrigger: "_filterData"
        }
      }
    },
    getDomain: {
      triggers: {
        lowerPercentile: {
          prop: "elevationLowerPercentile"
        },
        upperPercentile: {
          prop: "elevationUpperPercentile"
        },
        scaleType: {
          prop: "elevationScaleType"
        }
      }
    },
    getScaleFunc: {
      triggers: {
        domain: { prop: "elevationDomain" },
        range: { prop: "elevationRange" }
      },
      onSet: {
        props: "onSetElevationDomain"
      }
    },
    nullValue: -1
  }
];
var defaultGetCellSize = (props) => props.cellSize;
var CPUAggregator = class {
  constructor(opts) {
    this.state = {
      layerData: {
        data: void 0
      },
      dimensions: {
        // color: {
        //   getValue: null,
        //   domain: null,
        //   sortedBins: null,
        //   scaleFunc: noop
        // },
        // elevation: {
        //   getValue: null,
        //   domain: null,
        //   sortedBins: null,
        //   scaleFunc: noop
        // }
      }
    };
    this.changeFlags = {};
    this.dimensionUpdaters = {};
    this._getCellSize = opts.getCellSize || defaultGetCellSize;
    this._getAggregator = opts.getAggregator;
    this._addDimension(opts.dimensions || defaultDimensions);
  }
  static defaultDimensions() {
    return defaultDimensions;
  }
  updateState(opts, aggregationParams) {
    const { oldProps, props, changeFlags } = opts;
    this.updateGetValueFuncs(oldProps, props, changeFlags);
    const reprojectNeeded = this.needsReProjectPoints(oldProps, props, changeFlags);
    let aggregationDirty = false;
    if (changeFlags.dataChanged || reprojectNeeded) {
      this.getAggregatedData(props, aggregationParams);
      aggregationDirty = true;
    } else {
      const dimensionChanges = this.getDimensionChanges(oldProps, props, changeFlags) || [];
      dimensionChanges.forEach((f3) => typeof f3 === "function" && f3());
      aggregationDirty = true;
    }
    this.setState({ aggregationDirty });
    return this.state;
  }
  // Update private state
  setState(updateObject) {
    this.state = { ...this.state, ...updateObject };
  }
  // Update private state.dimensions
  setDimensionState(key, updateObject) {
    this.setState({
      dimensions: {
        ...this.state.dimensions,
        [key]: { ...this.state.dimensions[key], ...updateObject }
      }
    });
  }
  normalizeResult(result = {}) {
    if (result.hexagons) {
      return { data: result.hexagons, ...result };
    } else if (result.layerData) {
      return { data: result.layerData, ...result };
    }
    return result;
  }
  getAggregatedData(props, aggregationParams) {
    const aggregator = this._getAggregator(props);
    const result = aggregator(props, aggregationParams);
    this.setState({
      layerData: this.normalizeResult(result)
    });
    this.changeFlags = {
      layerData: true
    };
    this.getSortedBins(props);
  }
  updateGetValueFuncs(oldProps, props, changeFlags) {
    for (const key in this.dimensionUpdaters) {
      const { value, weight, aggregation } = this.dimensionUpdaters[key].getBins.triggers;
      let getValue = props[value.prop];
      const getValueChanged = this.needUpdateDimensionStep(this.dimensionUpdaters[key].getBins, oldProps, props, changeFlags);
      if (getValueChanged) {
        if (getValue) {
          getValue = wrapGetValueFunc(getValue, { data: props.data });
        } else {
          getValue = getValueFunc(props[aggregation.prop], props[weight.prop], { data: props.data });
        }
      }
      if (getValue) {
        this.setDimensionState(key, { getValue });
      }
    }
  }
  needsReProjectPoints(oldProps, props, changeFlags) {
    return this._getCellSize(oldProps) !== this._getCellSize(props) || this._getAggregator(oldProps) !== this._getAggregator(props) || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPosition);
  }
  // Adds dimensions
  addDimension(dimensions) {
    this._addDimension(dimensions);
  }
  _addDimension(dimensions = []) {
    dimensions.forEach((dimension) => {
      const { key } = dimension;
      this.dimensionUpdaters[key] = this.getDimensionUpdaters(dimension);
      this.state.dimensions[key] = {
        getValue: null,
        domain: null,
        sortedBins: null,
        scaleFunc: noop
      };
    });
  }
  getDimensionUpdaters({ key, accessor, pickingInfo, getBins, getDomain, getScaleFunc, nullValue }) {
    return {
      key,
      accessor,
      pickingInfo,
      getBins: { updater: this.getDimensionSortedBins.bind(this), ...getBins },
      getDomain: { updater: this.getDimensionValueDomain.bind(this), ...getDomain },
      getScaleFunc: { updater: this.getDimensionScale.bind(this), ...getScaleFunc },
      attributeAccessor: this.getSubLayerDimensionAttribute(key, nullValue)
    };
  }
  needUpdateDimensionStep(dimensionStep, oldProps, props, changeFlags) {
    return Object.values(dimensionStep.triggers).some((item) => {
      if (item.updateTrigger) {
        return changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged[item.updateTrigger]);
      }
      return oldProps[item.prop] !== props[item.prop];
    });
  }
  getDimensionChanges(oldProps, props, changeFlags) {
    const updaters = [];
    for (const key in this.dimensionUpdaters) {
      const needUpdate = dimensionSteps.find((step) => this.needUpdateDimensionStep(this.dimensionUpdaters[key][step], oldProps, props, changeFlags));
      if (needUpdate) {
        updaters.push(this.dimensionUpdaters[key][needUpdate].updater.bind(this, props, this.dimensionUpdaters[key]));
      }
    }
    return updaters.length ? updaters : null;
  }
  getUpdateTriggers(props) {
    const _updateTriggers = props.updateTriggers || {};
    const updateTriggers = {};
    for (const key in this.dimensionUpdaters) {
      const { accessor } = this.dimensionUpdaters[key];
      updateTriggers[accessor] = {};
      dimensionSteps.forEach((step) => {
        Object.values(this.dimensionUpdaters[key][step].triggers).forEach(({ prop, updateTrigger }) => {
          if (updateTrigger) {
            const fromProp = _updateTriggers[updateTrigger];
            if (typeof fromProp === "object" && !Array.isArray(fromProp)) {
              Object.assign(updateTriggers[accessor], fromProp);
            } else if (fromProp !== void 0) {
              updateTriggers[accessor][prop] = fromProp;
            }
          } else {
            updateTriggers[accessor][prop] = props[prop];
          }
        });
      });
    }
    return updateTriggers;
  }
  getSortedBins(props) {
    for (const key in this.dimensionUpdaters) {
      this.getDimensionSortedBins(props, this.dimensionUpdaters[key]);
    }
  }
  getDimensionSortedBins(props, dimensionUpdater) {
    const { key } = dimensionUpdater;
    const { getValue } = this.state.dimensions[key];
    const sortedBins = new BinSorter(this.state.layerData.data || [], {
      getValue,
      filterData: props._filterData
    });
    this.setDimensionState(key, { sortedBins });
    this.getDimensionValueDomain(props, dimensionUpdater);
  }
  getDimensionValueDomain(props, dimensionUpdater) {
    const { getDomain, key } = dimensionUpdater;
    const { triggers: { lowerPercentile, upperPercentile, scaleType } } = getDomain;
    const valueDomain = this.state.dimensions[key].sortedBins.getValueDomainByScale(props[scaleType.prop], [props[lowerPercentile.prop], props[upperPercentile.prop]]);
    this.setDimensionState(key, { valueDomain });
    this.getDimensionScale(props, dimensionUpdater);
  }
  getDimensionScale(props, dimensionUpdater) {
    const { key, getScaleFunc, getDomain } = dimensionUpdater;
    const { domain, range } = getScaleFunc.triggers;
    const { scaleType } = getDomain.triggers;
    const { onSet } = getScaleFunc;
    const dimensionRange = props[range.prop];
    const dimensionDomain = props[domain.prop] || this.state.dimensions[key].valueDomain;
    const getScaleFunction = getScaleFunctionByScaleType(scaleType && props[scaleType.prop]);
    const scaleFunc = getScaleFunction(dimensionDomain, dimensionRange);
    if (typeof onSet === "object" && typeof props[onSet.props] === "function") {
      props[onSet.props](scaleFunc.domain());
    }
    this.setDimensionState(key, { scaleFunc });
  }
  getSubLayerDimensionAttribute(key, nullValue) {
    return (cell) => {
      const { sortedBins, scaleFunc } = this.state.dimensions[key];
      const bin = sortedBins.binMap[cell.index];
      if (bin && bin.counts === 0) {
        return nullValue;
      }
      const cv = bin && bin.value;
      const domain = scaleFunc.domain();
      const isValueInDomain = cv >= domain[0] && cv <= domain[domain.length - 1];
      return isValueInDomain ? scaleFunc(cv) : nullValue;
    };
  }
  getSubLayerAccessors(props) {
    const accessors = {};
    for (const key in this.dimensionUpdaters) {
      const { accessor } = this.dimensionUpdaters[key];
      accessors[accessor] = this.getSubLayerDimensionAttribute(props, key);
    }
    return accessors;
  }
  getPickingInfo({ info }) {
    const isPicked = info.picked && info.index > -1;
    let object = null;
    if (isPicked) {
      const cell = this.state.layerData.data[info.index];
      const binInfo = {};
      for (const key in this.dimensionUpdaters) {
        const { pickingInfo } = this.dimensionUpdaters[key];
        const { sortedBins } = this.state.dimensions[key];
        const value = sortedBins.binMap[cell.index] && sortedBins.binMap[cell.index].value;
        binInfo[pickingInfo] = value;
      }
      object = Object.assign(binInfo, cell, {
        points: cell.filteredPoints || cell.points
      });
    }
    info.picked = Boolean(object);
    info.object = object;
    return info;
  }
  getAccessor(dimensionKey) {
    if (!this.dimensionUpdaters.hasOwnProperty(dimensionKey)) {
      return noop;
    }
    return this.dimensionUpdaters[dimensionKey].attributeAccessor;
  }
};

// node_modules/@deck.gl/aggregation-layers/dist/cpu-grid-layer/cpu-grid-layer.js
function nop() {
}
var defaultProps4 = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  upperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: nop,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationLowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  elevationUpperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationScaleType: "linear",
  onSetElevationDomain: nop,
  gridAggregator: pointToDensityGridDataCPU,
  // grid
  cellSize: { type: "number", min: 0, max: 1e3, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x2) => x2.position },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true,
  // data filter
  _filterData: { type: "function", value: null, optional: true }
};
var CPUGridLayer = class extends aggregation_layer_default {
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: (props) => props.gridAggregator,
      getCellSize: (props) => props.cellSize
    });
    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: { size: 3, type: "float64", accessor: "getPosition" }
    });
  }
  updateState(opts) {
    super.updateState(opts);
    this.setState({
      // make a copy of the internal state of cpuAggregator for testing
      aggregatorState: this.state.cpuAggregator.updateState(opts, {
        viewport: this.context.viewport,
        attributes: this.getAttributes(),
        numInstances: this.getNumInstances()
      })
    });
  }
  getPickingInfo({ info }) {
    return this.state.cpuAggregator.getPickingInfo({ info });
  }
  // create a method for testing
  _onGetSublayerColor(cell) {
    return this.state.cpuAggregator.getAccessor("fillColor")(cell);
  }
  // create a method for testing
  _onGetSublayerElevation(cell) {
    return this.state.cpuAggregator.getAccessor("elevation")(cell);
  }
  _getSublayerUpdateTriggers() {
    return this.state.cpuAggregator.getUpdateTriggers(this.props);
  }
  renderLayers() {
    const { elevationScale, extruded, cellSize, coverage, material, transitions } = this.props;
    const { cpuAggregator } = this.state;
    const SubLayerClass = this.getSubLayerClass("grid-cell", grid_cell_layer_default);
    const updateTriggers = this._getSublayerUpdateTriggers();
    return new SubLayerClass({
      cellSize,
      coverage,
      material,
      elevationScale,
      extruded,
      getFillColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      }
    }, this.getSubLayerProps({
      id: "grid-cell",
      updateTriggers
    }), {
      data: cpuAggregator.state.layerData.data
    });
  }
};
CPUGridLayer.layerName = "CPUGridLayer";
CPUGridLayer.defaultProps = defaultProps4;
var cpu_grid_layer_default = CPUGridLayer;

// node_modules/d3-hexbin/src/hexbin.js
var thirdPi = Math.PI / 3;
var angles = [0, thirdPi, 2 * thirdPi, 3 * thirdPi, 4 * thirdPi, 5 * thirdPi];
function pointX(d2) {
  return d2[0];
}
function pointY(d2) {
  return d2[1];
}
function hexbin_default() {
  var x0 = 0, y0 = 0, x1 = 1, y1 = 1, x2 = pointX, y2 = pointY, r2, dx, dy;
  function hexbin(points) {
    var binsById = {}, bins = [], i3, n2 = points.length;
    for (i3 = 0; i3 < n2; ++i3) {
      if (isNaN(px = +x2.call(null, point = points[i3], i3, points)) || isNaN(py = +y2.call(null, point, i3, points))) continue;
      var point, px, py, pj = Math.round(py = py / dy), pi = Math.round(px = px / dx - (pj & 1) / 2), py1 = py - pj;
      if (Math.abs(py1) * 3 > 1) {
        var px1 = px - pi, pi2 = pi + (px < pi ? -1 : 1) / 2, pj2 = pj + (py < pj ? -1 : 1), px2 = px - pi2, py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
      }
      var id = pi + "-" + pj, bin = binsById[id];
      if (bin) bin.push(point);
      else {
        bins.push(bin = binsById[id] = [point]);
        bin.x = (pi + (pj & 1) / 2) * dx;
        bin.y = pj * dy;
      }
    }
    return bins;
  }
  function hexagon(radius) {
    var x02 = 0, y02 = 0;
    return angles.map(function(angle) {
      var x12 = Math.sin(angle) * radius, y12 = -Math.cos(angle) * radius, dx2 = x12 - x02, dy2 = y12 - y02;
      x02 = x12, y02 = y12;
      return [dx2, dy2];
    });
  }
  hexbin.hexagon = function(radius) {
    return "m" + hexagon(radius == null ? r2 : +radius).join("l") + "z";
  };
  hexbin.centers = function() {
    var centers = [], j2 = Math.round(y0 / dy), i3 = Math.round(x0 / dx);
    for (var y3 = j2 * dy; y3 < y1 + r2; y3 += dy, ++j2) {
      for (var x3 = i3 * dx + (j2 & 1) * dx / 2; x3 < x1 + dx / 2; x3 += dx) {
        centers.push([x3, y3]);
      }
    }
    return centers;
  };
  hexbin.mesh = function() {
    var fragment = hexagon(r2).slice(0, 4).join("l");
    return hexbin.centers().map(function(p2) {
      return "M" + p2 + "m" + fragment;
    }).join("");
  };
  hexbin.x = function(_2) {
    return arguments.length ? (x2 = _2, hexbin) : x2;
  };
  hexbin.y = function(_2) {
    return arguments.length ? (y2 = _2, hexbin) : y2;
  };
  hexbin.radius = function(_2) {
    return arguments.length ? (r2 = +_2, dx = r2 * 2 * Math.sin(thirdPi), dy = r2 * 1.5, hexbin) : r2;
  };
  hexbin.size = function(_2) {
    return arguments.length ? (x0 = y0 = 0, x1 = +_2[0], y1 = +_2[1], hexbin) : [x1 - x0, y1 - y0];
  };
  hexbin.extent = function(_2) {
    return arguments.length ? (x0 = +_2[0][0], y0 = +_2[0][1], x1 = +_2[1][0], y1 = +_2[1][1], hexbin) : [[x0, y0], [x1, y1]];
  };
  return hexbin.radius(1);
}

// node_modules/@deck.gl/aggregation-layers/dist/hexagon-layer/hexagon-aggregator.js
function pointToHexbin(props, aggregationParams) {
  const { data, radius } = props;
  const { viewport, attributes } = aggregationParams;
  const centerLngLat = data.length ? getPointsCenter(data, aggregationParams) : null;
  const radiusCommon = getRadiusInCommon(radius, viewport, centerLngLat);
  const screenPoints = [];
  const { iterable, objectInfo } = createIterable(data);
  const positions = attributes.positions.value;
  const { size } = attributes.positions.getAccessor();
  for (const object of iterable) {
    objectInfo.index++;
    const posIndex = objectInfo.index * size;
    const position = [positions[posIndex], positions[posIndex + 1]];
    const arrayIsFinite = Number.isFinite(position[0]) && Number.isFinite(position[1]);
    if (arrayIsFinite) {
      screenPoints.push({
        screenCoord: viewport.projectFlat(position),
        source: object,
        index: objectInfo.index
      });
    } else {
      log_default.warn("HexagonLayer: invalid position")();
    }
  }
  const newHexbin = hexbin_default().radius(radiusCommon).x((d2) => d2.screenCoord[0]).y((d2) => d2.screenCoord[1]);
  const hexagonBins = newHexbin(screenPoints);
  return {
    hexagons: hexagonBins.map((hex, index) => ({
      position: viewport.unprojectFlat([hex.x, hex.y]),
      points: hex,
      index
    })),
    radiusCommon
  };
}
function getPointsCenter(data, aggregationParams) {
  const { attributes } = aggregationParams;
  const positions = attributes.positions.value;
  const { size } = attributes.positions.getAccessor();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let i3;
  for (i3 = 0; i3 < size * data.length; i3 += size) {
    const x2 = positions[i3];
    const y2 = positions[i3 + 1];
    const arrayIsFinite = Number.isFinite(x2) && Number.isFinite(y2);
    if (arrayIsFinite) {
      minX = Math.min(x2, minX);
      maxX = Math.max(x2, maxX);
      minY = Math.min(y2, minY);
      maxY = Math.max(y2, maxY);
    }
  }
  return [minX, minY, maxX, maxY].every(Number.isFinite) ? [(minX + maxX) / 2, (minY + maxY) / 2] : null;
}
function getRadiusInCommon(radius, viewport, center) {
  const { unitsPerMeter } = viewport.getDistanceScales(center);
  return radius * unitsPerMeter[0];
}

// node_modules/@deck.gl/aggregation-layers/dist/hexagon-layer/hexagon-layer.js
function nop2() {
}
var defaultProps5 = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calcuated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", value: 0, min: 0, max: 100 },
  upperPercentile: { type: "number", value: 100, min: 0, max: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: nop2,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calcuated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationLowerPercentile: { type: "number", value: 0, min: 0, max: 100 },
  elevationUpperPercentile: { type: "number", value: 100, min: 0, max: 100 },
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationScaleType: "linear",
  onSetElevationDomain: nop2,
  radius: { type: "number", value: 1e3, min: 1 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: { type: "accessor", value: (x2) => x2.position },
  // Optional material for 'lighting' shader module
  material: true,
  // data filter
  _filterData: { type: "function", value: null, optional: true }
};
var HexagonLayer = class extends aggregation_layer_default {
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: (props) => props.hexagonAggregator,
      getCellSize: (props) => props.radius
    });
    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state,
      vertices: null
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: { size: 3, type: "float64", accessor: "getPosition" }
    });
  }
  updateState(opts) {
    super.updateState(opts);
    if (opts.changeFlags.propsOrDataChanged) {
      const aggregatorState = this.state.cpuAggregator.updateState(opts, {
        viewport: this.context.viewport,
        attributes: this.getAttributes()
      });
      if (this.state.aggregatorState.layerData !== aggregatorState.layerData) {
        const { hexagonVertices } = aggregatorState.layerData || {};
        this.setState({
          vertices: hexagonVertices && this.convertLatLngToMeterOffset(hexagonVertices)
        });
      }
      this.setState({
        // make a copy of the internal state of cpuAggregator for testing
        aggregatorState
      });
    }
  }
  convertLatLngToMeterOffset(hexagonVertices) {
    const { viewport } = this.context;
    if (Array.isArray(hexagonVertices) && hexagonVertices.length === 6) {
      const vertex0 = hexagonVertices[0];
      const vertex3 = hexagonVertices[3];
      const centroid = [(vertex0[0] + vertex3[0]) / 2, (vertex0[1] + vertex3[1]) / 2];
      const centroidFlat = viewport.projectFlat(centroid);
      const { metersPerUnit } = viewport.getDistanceScales(centroid);
      const vertices = hexagonVertices.map((vt) => {
        const vtFlat = viewport.projectFlat(vt);
        return [
          (vtFlat[0] - centroidFlat[0]) * metersPerUnit[0],
          (vtFlat[1] - centroidFlat[1]) * metersPerUnit[1]
        ];
      });
      return vertices;
    }
    log_default.error("HexagonLayer: hexagonVertices needs to be an array of 6 points")();
    return null;
  }
  getPickingInfo({ info }) {
    return this.state.cpuAggregator.getPickingInfo({ info });
  }
  // create a method for testing
  _onGetSublayerColor(cell) {
    return this.state.cpuAggregator.getAccessor("fillColor")(cell);
  }
  // create a method for testing
  _onGetSublayerElevation(cell) {
    return this.state.cpuAggregator.getAccessor("elevation")(cell);
  }
  _getSublayerUpdateTriggers() {
    return this.state.cpuAggregator.getUpdateTriggers(this.props);
  }
  renderLayers() {
    const { elevationScale, extruded, coverage, material, transitions } = this.props;
    const { aggregatorState, vertices } = this.state;
    const SubLayerClass = this.getSubLayerClass("hexagon-cell", column_layer_default);
    const updateTriggers = this._getSublayerUpdateTriggers();
    const geometry = vertices ? { vertices, radius: 1 } : {
      // default geometry
      // @ts-expect-error TODO - undefined property?
      radius: aggregatorState.layerData.radiusCommon || 1,
      radiusUnits: "common",
      angle: 90
    };
    return new SubLayerClass({
      ...geometry,
      diskResolution: 6,
      elevationScale,
      extruded,
      coverage,
      material,
      getFillColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      }
    }, this.getSubLayerProps({
      id: "hexagon-cell",
      updateTriggers
    }), {
      data: aggregatorState.layerData.data
    });
  }
};
HexagonLayer.layerName = "HexagonLayer";
HexagonLayer.defaultProps = defaultProps5;
var hexagon_layer_default = HexagonLayer;

// node_modules/@deck.gl/aggregation-layers/dist/contour-layer/marching-squares-codes.js
var HALF = 0.5;
var ONE6TH = 1 / 6;
var OFFSET = {
  N: [0, HALF],
  // NORTH
  E: [HALF, 0],
  // EAST
  S: [0, -HALF],
  // SOUTH
  W: [-HALF, 0],
  // WEST
  // CORNERS
  NE: [HALF, HALF],
  NW: [-HALF, HALF],
  SE: [HALF, -HALF],
  SW: [-HALF, -HALF]
};
var SW_TRIANGLE = [OFFSET.W, OFFSET.SW, OFFSET.S];
var SE_TRIANGLE = [OFFSET.S, OFFSET.SE, OFFSET.E];
var NE_TRIANGLE = [OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_TRIANGLE = [OFFSET.NW, OFFSET.W, OFFSET.N];
var SW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF]
];
var SE_TRAPEZOID = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var NE_TRAPEZOID = [
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var S_RECTANGLE = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E];
var E_RECTANGLE = [OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_RECTANGLE = [OFFSET.NW, OFFSET.W, OFFSET.E, OFFSET.NE];
var W_RECTANGLE = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.N];
var EW_RECTANGEL = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var SN_RECTANGEL = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var SQUARE = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.NE];
var SW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.E, OFFSET.N];
var SE_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.NE, OFFSET.N];
var NE_PENTAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.NE];
var NW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE];
var NW_N_PENTAGON = [OFFSET.NW, OFFSET.W, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var NE_E_PENTAGON = [[-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_S_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.E];
var SW_W_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [ONE6TH, HALF], [-ONE6TH, HALF]];
var NW_W_PENTAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.N];
var NE_N_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_E_PENTAGON = [OFFSET.S, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var SW_S_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH]];
var S_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var E_HEXAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_HEXAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE];
var W_HEXAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var SW_NE_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_SE_HEXAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.E, OFFSET.N];
var NE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  OFFSET.E,
  OFFSET.NE,
  OFFSET.N
];
var SW_HEPTAGON = [
  OFFSET.W,
  OFFSET.SW,
  OFFSET.S,
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_HEPTAGON = [
  OFFSET.NW,
  OFFSET.W,
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  OFFSET.N
];
var SE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  OFFSET.S,
  OFFSET.SE,
  OFFSET.E,
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var OCTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var ISOLINES_CODE_OFFSET_MAP = {
  // key is equal to the code of 4 vertices (invert the code specified in wiki)
  // value can be an array or an Object
  // Array : [line] or [line, line], where each line is [start-point, end-point], and each point is [x, y]
  // Object : to handle saddle cases, whos output depends on mean value of all 4 corners
  //  key: code of mean value (0 or 1)
  //  value: Array , as above defines one or two line segments
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: {
    0: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ]
  },
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: {
    0: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ]
  },
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};
function ternaryToIndex(ternary) {
  return parseInt(ternary, 4);
}
var ISOBANDS_CODE_OFFSET_MAP = {
  // Below list of cases, follow the same order as in above mentioned wiki page.
  // Each case has its code on first commented line // T,TR,R,C
  // where T: Top, TR: Top-right, R: Right and C: current, each will be either 0, 1 or 2
  // final code is binary representation of above code , where takes 2 digits
  // for example:  code 2-2-2-1 => 10-10-10-01 => 10101001 => 169
  // no contours
  [ternaryToIndex("0000")]: [],
  [ternaryToIndex("2222")]: [],
  // single triangle
  [ternaryToIndex("2221")]: [SW_TRIANGLE],
  [ternaryToIndex("2212")]: [SE_TRIANGLE],
  [ternaryToIndex("2122")]: [NE_TRIANGLE],
  [ternaryToIndex("1222")]: [NW_TRIANGLE],
  [ternaryToIndex("0001")]: [SW_TRIANGLE],
  [ternaryToIndex("0010")]: [SE_TRIANGLE],
  [ternaryToIndex("0100")]: [NE_TRIANGLE],
  [ternaryToIndex("1000")]: [NW_TRIANGLE],
  // single trapezoid
  [ternaryToIndex("2220")]: [SW_TRAPEZOID],
  [ternaryToIndex("2202")]: [SE_TRAPEZOID],
  [ternaryToIndex("2022")]: [NE_TRAPEZOID],
  [ternaryToIndex("0222")]: [NW_TRAPEZOID],
  [ternaryToIndex("0002")]: [SW_TRAPEZOID],
  [ternaryToIndex("0020")]: [SE_TRAPEZOID],
  [ternaryToIndex("0200")]: [NE_TRAPEZOID],
  [ternaryToIndex("2000")]: [NW_TRAPEZOID],
  // single rectangle
  [ternaryToIndex("0011")]: [S_RECTANGLE],
  [ternaryToIndex("0110")]: [E_RECTANGLE],
  [ternaryToIndex("1100")]: [N_RECTANGLE],
  [ternaryToIndex("1001")]: [W_RECTANGLE],
  [ternaryToIndex("2211")]: [S_RECTANGLE],
  [ternaryToIndex("2112")]: [E_RECTANGLE],
  [ternaryToIndex("1122")]: [N_RECTANGLE],
  [ternaryToIndex("1221")]: [W_RECTANGLE],
  [ternaryToIndex("2200")]: [EW_RECTANGEL],
  [ternaryToIndex("2002")]: [SN_RECTANGEL],
  [ternaryToIndex("0022")]: [EW_RECTANGEL],
  [ternaryToIndex("0220")]: [SN_RECTANGEL],
  // single square
  // 1111
  [ternaryToIndex("1111")]: [SQUARE],
  // single pentagon
  [ternaryToIndex("1211")]: [SW_PENTAGON],
  [ternaryToIndex("2111")]: [SE_PENTAGON],
  [ternaryToIndex("1112")]: [NE_PENTAGON],
  [ternaryToIndex("1121")]: [NW_PENTAGON],
  [ternaryToIndex("1011")]: [SW_PENTAGON],
  [ternaryToIndex("0111")]: [SE_PENTAGON],
  [ternaryToIndex("1110")]: [NE_PENTAGON],
  [ternaryToIndex("1101")]: [NW_PENTAGON],
  [ternaryToIndex("1200")]: [NW_N_PENTAGON],
  [ternaryToIndex("0120")]: [NE_E_PENTAGON],
  [ternaryToIndex("0012")]: [SE_S_PENTAGON],
  [ternaryToIndex("2001")]: [SW_W_PENTAGON],
  [ternaryToIndex("1022")]: [NW_N_PENTAGON],
  [ternaryToIndex("2102")]: [NE_E_PENTAGON],
  [ternaryToIndex("2210")]: [SE_S_PENTAGON],
  [ternaryToIndex("0221")]: [SW_W_PENTAGON],
  [ternaryToIndex("1002")]: [NW_W_PENTAGON],
  [ternaryToIndex("2100")]: [NE_N_PENTAGON],
  [ternaryToIndex("0210")]: [SE_E_PENTAGON],
  [ternaryToIndex("0021")]: [SW_S_PENTAGON],
  [ternaryToIndex("1220")]: [NW_W_PENTAGON],
  [ternaryToIndex("0122")]: [NE_N_PENTAGON],
  [ternaryToIndex("2012")]: [SE_E_PENTAGON],
  [ternaryToIndex("2201")]: [SW_S_PENTAGON],
  // single hexagon
  [ternaryToIndex("0211")]: [S_HEXAGON],
  [ternaryToIndex("2110")]: [E_HEXAGON],
  [ternaryToIndex("1102")]: [N_HEXAGON],
  [ternaryToIndex("1021")]: [W_HEXAGON],
  [ternaryToIndex("2011")]: [S_HEXAGON],
  [ternaryToIndex("0112")]: [E_HEXAGON],
  [ternaryToIndex("1120")]: [N_HEXAGON],
  [ternaryToIndex("1201")]: [W_HEXAGON],
  [ternaryToIndex("2101")]: [SW_NE_HEXAGON],
  [ternaryToIndex("0121")]: [SW_NE_HEXAGON],
  [ternaryToIndex("1012")]: [NW_SE_HEXAGON],
  [ternaryToIndex("1210")]: [NW_SE_HEXAGON],
  // 6-sided polygons based on mean weight
  // NOTE: merges mean value codes for extreme changes (as per above Wiki doc)
  [ternaryToIndex("0101")]: {
    0: [SW_TRIANGLE, NE_TRIANGLE],
    1: [SW_NE_HEXAGON],
    2: [SW_NE_HEXAGON]
  },
  [ternaryToIndex("1010")]: {
    0: [NW_TRIANGLE, SE_TRIANGLE],
    1: [NW_SE_HEXAGON],
    2: [NW_SE_HEXAGON]
  },
  [ternaryToIndex("2121")]: {
    0: [SW_NE_HEXAGON],
    1: [SW_NE_HEXAGON],
    2: [SW_TRIANGLE, NE_TRIANGLE]
  },
  [ternaryToIndex("1212")]: {
    0: [NW_SE_HEXAGON],
    1: [NW_SE_HEXAGON],
    2: [NW_TRIANGLE, SE_TRIANGLE]
  },
  // 7-sided polygons based on mean weight
  [ternaryToIndex("2120")]: {
    0: [NE_HEPTAGON],
    1: [NE_HEPTAGON],
    2: [SW_TRAPEZOID, NE_TRIANGLE]
  },
  [ternaryToIndex("2021")]: {
    0: [SW_HEPTAGON],
    1: [SW_HEPTAGON],
    2: [SW_TRIANGLE, NE_TRAPEZOID]
  },
  [ternaryToIndex("1202")]: {
    0: [NW_HEPTAGON],
    1: [NW_HEPTAGON],
    2: [NW_TRIANGLE, SE_TRAPEZOID]
  },
  [ternaryToIndex("0212")]: {
    0: [SE_HEPTAGON],
    1: [SE_HEPTAGON],
    2: [SE_TRIANGLE, NW_TRAPEZOID]
  },
  [ternaryToIndex("0102")]: {
    0: [SW_TRAPEZOID, NE_TRIANGLE],
    1: [NE_HEPTAGON],
    2: [NE_HEPTAGON]
  },
  [ternaryToIndex("0201")]: {
    0: [SW_TRIANGLE, NE_TRAPEZOID],
    1: [SW_HEPTAGON],
    2: [SW_HEPTAGON]
  },
  [ternaryToIndex("1020")]: {
    0: [NW_TRIANGLE, SE_TRAPEZOID],
    1: [NW_HEPTAGON],
    2: [NW_HEPTAGON]
  },
  [ternaryToIndex("2010")]: {
    0: [SE_TRIANGLE, NW_TRAPEZOID],
    1: [SE_HEPTAGON],
    2: [SE_HEPTAGON]
  },
  // 8-sided polygons based on mean weight
  [ternaryToIndex("2020")]: {
    0: [NW_TRAPEZOID, SE_TRAPEZOID],
    1: [OCTAGON],
    2: [SW_TRAPEZOID, NE_TRAPEZOID]
  },
  [ternaryToIndex("0202")]: {
    0: [NE_TRAPEZOID, SW_TRAPEZOID],
    1: [OCTAGON],
    2: [NW_TRAPEZOID, SE_TRAPEZOID]
  }
};

// node_modules/@deck.gl/aggregation-layers/dist/contour-layer/marching-squares.js
var CONTOUR_TYPE = {
  ISO_LINES: 1,
  ISO_BANDS: 2
};
var DEFAULT_THRESHOLD_DATA = {
  zIndex: 0,
  zOffset: 5e-3
};
function getVertexCode(weight, threshold2) {
  if (Array.isArray(threshold2)) {
    if (weight < threshold2[0]) {
      return 0;
    }
    return weight < threshold2[1] ? 1 : 2;
  }
  return weight >= threshold2 ? 1 : 0;
}
function getCode(opts) {
  const { cellWeights, x: x2, y: y2, width, height } = opts;
  let threshold2 = opts.threshold;
  if (opts.thresholdValue) {
    log_default.deprecated("thresholdValue", "threshold")();
    threshold2 = opts.thresholdValue;
  }
  const isLeftBoundary = x2 < 0;
  const isRightBoundary = x2 >= width - 1;
  const isBottomBoundary = y2 < 0;
  const isTopBoundary = y2 >= height - 1;
  const isBoundary = isLeftBoundary || isRightBoundary || isBottomBoundary || isTopBoundary;
  const weights = {};
  const codes = {};
  if (isLeftBoundary || isTopBoundary) {
    codes.top = 0;
  } else {
    weights.top = cellWeights[(y2 + 1) * width + x2];
    codes.top = getVertexCode(weights.top, threshold2);
  }
  if (isRightBoundary || isTopBoundary) {
    codes.topRight = 0;
  } else {
    weights.topRight = cellWeights[(y2 + 1) * width + x2 + 1];
    codes.topRight = getVertexCode(weights.topRight, threshold2);
  }
  if (isRightBoundary || isBottomBoundary) {
    codes.right = 0;
  } else {
    weights.right = cellWeights[y2 * width + x2 + 1];
    codes.right = getVertexCode(weights.right, threshold2);
  }
  if (isLeftBoundary || isBottomBoundary) {
    codes.current = 0;
  } else {
    weights.current = cellWeights[y2 * width + x2];
    codes.current = getVertexCode(weights.current, threshold2);
  }
  const { top, topRight, right, current } = codes;
  let code = -1;
  if (Number.isFinite(threshold2)) {
    code = top << 3 | topRight << 2 | right << 1 | current;
  }
  if (Array.isArray(threshold2)) {
    code = top << 6 | topRight << 4 | right << 2 | current;
  }
  let meanCode = 0;
  if (!isBoundary) {
    meanCode = getVertexCode((weights.top + weights.topRight + weights.right + weights.current) / 4, threshold2);
  }
  return { code, meanCode };
}
function getVertices(opts) {
  const { gridOrigin, cellSize, x: x2, y: y2, code, meanCode, type = CONTOUR_TYPE.ISO_LINES } = opts;
  const thresholdData = { ...DEFAULT_THRESHOLD_DATA, ...opts.thresholdData };
  let offsets = type === CONTOUR_TYPE.ISO_BANDS ? ISOBANDS_CODE_OFFSET_MAP[code] : ISOLINES_CODE_OFFSET_MAP[code];
  if (!Array.isArray(offsets)) {
    offsets = offsets[meanCode];
  }
  const vZ = thresholdData.zIndex * thresholdData.zOffset;
  const rX = (x2 + 1) * cellSize[0];
  const rY = (y2 + 1) * cellSize[1];
  const refVertexX = gridOrigin[0] + rX;
  const refVertexY = gridOrigin[1] + rY;
  if (type === CONTOUR_TYPE.ISO_BANDS) {
    const polygons = [];
    offsets.forEach((polygonOffsets) => {
      const polygon = [];
      polygonOffsets.forEach((xyOffset) => {
        const vX = refVertexX + xyOffset[0] * cellSize[0];
        const vY = refVertexY + xyOffset[1] * cellSize[1];
        polygon.push([vX, vY, vZ]);
      });
      polygons.push(polygon);
    });
    return polygons;
  }
  const lines = [];
  offsets.forEach((xyOffsets) => {
    xyOffsets.forEach((offset) => {
      const vX = refVertexX + offset[0] * cellSize[0];
      const vY = refVertexY + offset[1] * cellSize[1];
      lines.push([vX, vY, vZ]);
    });
  });
  return lines;
}

// node_modules/@deck.gl/aggregation-layers/dist/contour-layer/contour-utils.js
function generateContours({ thresholdData, cellWeights, gridSize, gridOrigin, cellSize }) {
  const contourSegments = [];
  const contourPolygons = [];
  const width = gridSize[0];
  const height = gridSize[1];
  let segmentIndex = 0;
  let polygonIndex = 0;
  for (const data of thresholdData) {
    const { contour } = data;
    const { threshold: threshold2 } = contour;
    for (let x2 = -1; x2 < width; x2++) {
      for (let y2 = -1; y2 < height; y2++) {
        const { code, meanCode } = getCode({
          cellWeights,
          threshold: threshold2,
          x: x2,
          y: y2,
          width,
          height
        });
        const opts = {
          type: CONTOUR_TYPE.ISO_BANDS,
          gridOrigin,
          cellSize,
          x: x2,
          y: y2,
          width,
          height,
          code,
          meanCode,
          thresholdData: data
        };
        if (Array.isArray(threshold2)) {
          opts.type = CONTOUR_TYPE.ISO_BANDS;
          const polygons = getVertices(opts);
          for (const polygon of polygons) {
            contourPolygons[polygonIndex++] = {
              vertices: polygon,
              contour
            };
          }
        } else {
          opts.type = CONTOUR_TYPE.ISO_LINES;
          const vertices = getVertices(opts);
          for (let i3 = 0; i3 < vertices.length; i3 += 2) {
            contourSegments[segmentIndex++] = {
              start: vertices[i3],
              end: vertices[i3 + 1],
              contour
            };
          }
        }
      }
    }
  }
  return { contourSegments, contourPolygons };
}

// node_modules/@deck.gl/aggregation-layers/dist/contour-layer/contour-layer.js
var DEFAULT_COLOR = [255, 255, 255, 255];
var DEFAULT_STROKE_WIDTH = 1;
var DEFAULT_THRESHOLD = 1;
var defaultProps6 = {
  // grid aggregation
  cellSize: { type: "number", min: 1, max: 1e3, value: 1e3 },
  getPosition: { type: "accessor", value: (x2) => x2.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: false,
  // TODO(v9): Re-enable GPU aggregation.
  aggregation: "SUM",
  // contour lines
  contours: {
    type: "object",
    value: [{ threshold: DEFAULT_THRESHOLD }],
    optional: true,
    compare: 3
  },
  zOffset: 5e-3
};
var POSITION_ATTRIBUTE_NAME2 = "positions";
var DIMENSIONS2 = {
  data: {
    props: ["cellSize"]
  },
  weights: {
    props: ["aggregation"],
    accessors: ["getWeight"]
  }
};
var ContourLayer = class extends grid_aggregation_layer_default {
  initializeState() {
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS2
    });
    this.setState({
      contourData: {},
      projectPoints: false,
      weights: {
        count: {
          size: 1,
          operation: AGGREGATION_OPERATION.SUM
        }
      }
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME2]: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      count: { size: 3, accessor: "getWeight" }
    });
  }
  updateState(opts) {
    super.updateState(opts);
    let contoursChanged = false;
    const { oldProps, props } = opts;
    const { aggregationDirty } = this.state;
    if (oldProps.contours !== props.contours || oldProps.zOffset !== props.zOffset) {
      contoursChanged = true;
      this._updateThresholdData(opts.props);
    }
    if (this.getNumInstances() > 0 && (aggregationDirty || contoursChanged)) {
      this._generateContours();
    }
  }
  renderLayers() {
    const { contourSegments, contourPolygons } = this.state.contourData;
    const LinesSubLayerClass = this.getSubLayerClass("lines", line_layer_default);
    const BandsSubLayerClass = this.getSubLayerClass("bands", solid_polygon_layer_default);
    const lineLayer = contourSegments && contourSegments.length > 0 && new LinesSubLayerClass(this.getSubLayerProps({
      id: "lines"
    }), {
      data: this.state.contourData.contourSegments,
      getSourcePosition: (d2) => d2.start,
      getTargetPosition: (d2) => d2.end,
      getColor: (d2) => d2.contour.color || DEFAULT_COLOR,
      getWidth: (d2) => d2.contour.strokeWidth || DEFAULT_STROKE_WIDTH
    });
    const bandsLayer = contourPolygons && contourPolygons.length > 0 && new BandsSubLayerClass(this.getSubLayerProps({
      id: "bands"
    }), {
      data: this.state.contourData.contourPolygons,
      getPolygon: (d2) => d2.vertices,
      getFillColor: (d2) => d2.contour.color || DEFAULT_COLOR
    });
    return [lineLayer, bandsLayer];
  }
  // Aggregation Overrides
  /* eslint-disable max-statements, complexity */
  updateAggregationState(opts) {
    const { props, oldProps } = opts;
    const { cellSize, coordinateSystem } = props;
    const { viewport } = this.context;
    const cellSizeChanged = oldProps.cellSize !== cellSize;
    let gpuAggregation = props.gpuAggregation;
    if (this.state.gpuAggregation !== props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.device)) {
        log_default.warn("GPU Grid Aggregation not supported, falling back to CPU")();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });
    const { dimensions } = this.state;
    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME2);
    const { data, weights } = dimensions;
    let { boundingBox } = this.state;
    if (positionsChanged) {
      boundingBox = getBoundingBox(this.getAttributes(), this.getNumInstances());
      this.setState({ boundingBox });
    }
    if (positionsChanged || cellSizeChanged) {
      const { gridOffset, translation, width, height, numCol, numRow } = getGridParams(boundingBox, cellSize, viewport, coordinateSystem);
      this.allocateResources(numRow, numCol);
      this.setState({
        gridOffset,
        boundingBox,
        translation,
        posOffset: translation.slice(),
        // Used for CPU aggregation, to offset points
        gridOrigin: [-1 * translation[0], -1 * translation[1]],
        width,
        height,
        numCol,
        numRow
      });
    }
    const aggregationDataDirty = positionsChanged || gpuAggregationChanged || this.isAggregationDirty(opts, {
      dimension: data,
      compareAll: gpuAggregation
      // check for all (including extentions props) when using gpu aggregation
    });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, {
      dimension: weights
    });
    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });
  }
  /* eslint-enable max-statements, complexity */
  // Private (Aggregation)
  _updateAccessors(opts) {
    const { getWeight, aggregation, data } = opts.props;
    const { count } = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({ getValue: getValueFunc(aggregation, getWeight, { data }) });
  }
  _resetResults() {
    const { count } = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }
  // Private (Contours)
  _generateContours() {
    const { numCol, numRow, gridOrigin, gridOffset, thresholdData } = this.state;
    const { count } = this.state.weights;
    let { aggregationData } = count;
    if (!aggregationData) {
      aggregationData = count.aggregationBuffer.readSyncWebGL();
      count.aggregationData = aggregationData;
    }
    const { cellWeights } = GPUGridAggregator.getCellData({ countsData: aggregationData });
    const contourData = generateContours({
      thresholdData,
      cellWeights,
      gridSize: [numCol, numRow],
      gridOrigin,
      cellSize: [gridOffset.xOffset, gridOffset.yOffset]
    });
    this.setState({ contourData });
  }
  _updateThresholdData(props) {
    const { contours, zOffset } = props;
    const count = contours.length;
    const thresholdData = new Array(count);
    for (let i3 = 0; i3 < count; i3++) {
      const contour = contours[i3];
      thresholdData[i3] = {
        contour,
        zIndex: contour.zIndex || i3,
        zOffset
      };
    }
    this.setState({ thresholdData });
  }
};
ContourLayer.layerName = "ContourLayer";
ContourLayer.defaultProps = defaultProps6;
var contour_layer_default = ContourLayer;

// node_modules/@deck.gl/aggregation-layers/dist/gpu-grid-layer/gpu-grid-cell-layer-vertex.glsl.js
var gpu_grid_cell_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME gpu-grid-cell-layer-vertex-shader
#define RANGE_COUNT 6
in vec3 positions;
in vec3 normals;
in vec4 colors;
in vec4 elevations;
in vec3 instancePickingColors;
uniform vec2 offset;
uniform bool extruded;
uniform float cellSize;
uniform float coverage;
uniform float opacity;
uniform float elevationScale;
uniform ivec2 gridSize;
uniform vec2 gridOrigin;
uniform vec2 gridOriginLow;
uniform vec2 gridOffset;
uniform vec2 gridOffsetLow;
uniform vec4 colorRange[RANGE_COUNT];
uniform vec2 elevationRange;
uniform vec2 colorDomain;
uniform bool colorDomainValid;
uniform vec2 elevationDomain;
uniform bool elevationDomainValid;
layout(std140) uniform;
uniform ColorData
{
vec4 maxMinCount;
} colorData;
uniform ElevationData
{
vec4 maxMinCount;
} elevationData;
#define EPSILON 0.00001
out vec4 vColor;
vec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {
vec4 outColor = vec4(0., 0., 0., 0.);
if (value >= (domain.x - EPSILON) && value <= (domain.y + EPSILON)) {
float domainRange = domain.y - domain.x;
if (domainRange <= 0.) {
outColor = colorRange[0];
} else {
float rangeCount = float(RANGE_COUNT);
float rangeStep = domainRange / rangeCount;
float idx = floor((value - domain.x) / rangeStep);
idx = clamp(idx, 0., rangeCount - 1.);
int intIdx = int(idx);
outColor = colorRange[intIdx];
}
}
return outColor;
}
float linearScale(vec2 domain, vec2 range, float value) {
if (value >= (domain.x - EPSILON) && value <= (domain.y + EPSILON)) {
return ((value - domain.x) / (domain.y - domain.x)) * (range.y - range.x) + range.x;
}
return -1.;
}
void main(void) {
vec2 clrDomain = colorDomainValid ? colorDomain : vec2(colorData.maxMinCount.a, colorData.maxMinCount.r);
vec4 color = quantizeScale(clrDomain, colorRange, colors.r);
float elevation = 0.0;
if (extruded) {
vec2 elvDomain = elevationDomainValid ? elevationDomain : vec2(elevationData.maxMinCount.a, elevationData.maxMinCount.r);
elevation = linearScale(elvDomain, elevationRange, elevations.r);
elevation = elevation  * (positions.z + 1.0) / 2.0 * elevationScale;
}
float shouldRender = float(color.r > 0.0 && elevations.r >= 0.0);
float dotRadius = cellSize / 2. * coverage * shouldRender;
int yIndex = (gl_InstanceID / gridSize[0]);
int xIndex = gl_InstanceID - (yIndex * gridSize[0]);
vec2 instancePositionXFP64 = mul_fp64(vec2(gridOffset[0], gridOffsetLow[0]), vec2(float(xIndex), 0.));
instancePositionXFP64 = sum_fp64(instancePositionXFP64, vec2(gridOrigin[0], gridOriginLow[0]));
vec2 instancePositionYFP64 = mul_fp64(vec2(gridOffset[1], gridOffsetLow[1]), vec2(float(yIndex), 0.));
instancePositionYFP64 = sum_fp64(instancePositionYFP64, vec2(gridOrigin[1], gridOriginLow[1]));
vec3 centroidPosition = vec3(instancePositionXFP64[0], instancePositionYFP64[0], elevation);
vec3 centroidPosition64Low = vec3(instancePositionXFP64[1], instancePositionYFP64[1], 0.0);
geometry.worldPosition = centroidPosition;
vec3 pos = vec3(project_size(positions.xy + offset) * dotRadius, 0.);
picking_setPickingColor(instancePickingColors);
gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
vec3 normals_commonspace = project_normal(normals);
if (extruded) {
vec3 lightColor = lighting_getLightColor(color.rgb, project_uCameraPosition, geometry.position.xyz, normals_commonspace);
vColor = vec4(lightColor, color.a * opacity) / 255.;
} else {
vColor = vec4(color.rgb, color.a * opacity) / 255.;
}
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/gpu-grid-layer/gpu-grid-cell-layer-fragment.glsl.js
var gpu_grid_cell_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME gpu-grid-cell-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
fragColor = picking_filterColor(fragColor);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/gpu-grid-layer/gpu-grid-cell-layer.js
var COLOR_DATA_UBO_INDEX = 0;
var ELEVATION_DATA_UBO_INDEX = 1;
var defaultProps7 = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  elevationScale: { type: "number", min: 0, value: 1 },
  // grid
  gridSize: { type: "array", value: [1, 1] },
  gridOrigin: { type: "array", value: [0, 0] },
  gridOffset: { type: "array", value: [0, 0] },
  cellSize: { type: "number", min: 0, max: 1e3, value: 1e3 },
  offset: { type: "array", value: [1, 1] },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  extruded: true,
  material: true
  // Use lighting module defaults
};
var GPUGridCellLayer = class extends layer_default {
  getShaders() {
    return super.getShaders({
      vs: gpu_grid_cell_layer_vertex_glsl_default,
      fs: gpu_grid_cell_layer_fragment_glsl_default,
      modules: [project32_default, gouraudLighting, picking_default, fp64arithmetic]
    });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      colors: {
        size: 4,
        noAlloc: true
      },
      elevations: {
        size: 4,
        noAlloc: true
      }
    });
    const model = this._getModel();
    this._setupUniformBuffer(model);
    this.setState({ model });
  }
  _getModel() {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new CubeGeometry(),
      isInstanced: true
    });
  }
  draw({ uniforms }) {
    const { cellSize, offset, extruded, elevationScale, coverage, gridSize, gridOrigin, gridOffset, elevationRange, colorMaxMinBuffer, elevationMaxMinBuffer } = this.props;
    const model = this.state.model;
    const gridOriginLow = [fp64LowPart(gridOrigin[0]), fp64LowPart(gridOrigin[1])];
    const gridOffsetLow = [fp64LowPart(gridOffset[0]), fp64LowPart(gridOffset[1])];
    const domainUniforms = this.getDomainUniforms();
    const colorRange = colorRangeToFlatArray(this.props.colorRange);
    this.bindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer);
    model.setUniforms(uniforms);
    model.setUniforms(domainUniforms);
    model.setUniforms({
      cellSize,
      offset,
      extruded,
      elevationScale,
      coverage,
      gridSize,
      gridOrigin,
      gridOriginLow,
      gridOffset,
      gridOffsetLow,
      colorRange,
      elevationRange
    });
    model.draw(this.context.renderPass);
    this.unbindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer);
  }
  bindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer) {
    colorMaxMinBuffer.bind({ target: 35345, index: COLOR_DATA_UBO_INDEX });
    elevationMaxMinBuffer.bind({ target: 35345, index: ELEVATION_DATA_UBO_INDEX });
  }
  unbindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer) {
    colorMaxMinBuffer.unbind({ target: 35345, index: COLOR_DATA_UBO_INDEX });
    elevationMaxMinBuffer.unbind({ target: 35345, index: ELEVATION_DATA_UBO_INDEX });
  }
  getDomainUniforms() {
    const { colorDomain, elevationDomain } = this.props;
    const domainUniforms = {};
    if (colorDomain !== null) {
      domainUniforms.colorDomainValid = true;
      domainUniforms.colorDomain = colorDomain;
    } else {
      domainUniforms.colorDomainValid = false;
    }
    if (elevationDomain !== null) {
      domainUniforms.elevationDomainValid = true;
      domainUniforms.elevationDomain = elevationDomain;
    } else {
      domainUniforms.elevationDomainValid = false;
    }
    return domainUniforms;
  }
  _setupUniformBuffer(model) {
    const programHandle = model.pipeline.handle;
    const gl = this.context.gl;
    const colorIndex = gl.getUniformBlockIndex(programHandle, "ColorData");
    const elevationIndex = gl.getUniformBlockIndex(programHandle, "ElevationData");
    gl.uniformBlockBinding(programHandle, colorIndex, COLOR_DATA_UBO_INDEX);
    gl.uniformBlockBinding(programHandle, elevationIndex, ELEVATION_DATA_UBO_INDEX);
  }
};
GPUGridCellLayer.layerName = "GPUGridCellLayer";
GPUGridCellLayer.defaultProps = defaultProps7;
var gpu_grid_cell_layer_default = GPUGridCellLayer;

// node_modules/@deck.gl/aggregation-layers/dist/gpu-grid-layer/gpu-grid-layer.js
var defaultProps8 = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationScale: { type: "number", min: 0, value: 1 },
  // grid
  cellSize: { type: "number", min: 1, max: 1e3, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x2) => x2.position },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true
};
var DIMENSIONS3 = {
  data: {
    props: ["cellSize", "colorAggregation", "elevationAggregation"]
  }
  // rest of the changes are detected by `state.attributesChanged`
};
var POSITION_ATTRIBUTE_NAME3 = "positions";
var GPUGridLayer = class extends grid_aggregation_layer_default {
  initializeState({ device }) {
    const isSupported = GPUGridAggregator.isSupported(device);
    if (!isSupported) {
      log_default.error("GPUGridLayer is not supported on this browser, use GridLayer instead")();
    }
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS3
    });
    this.setState({
      gpuAggregation: false,
      // TODO(v9): Re-enable GPU aggregation.
      projectPoints: false,
      // aggregation in world space
      isSupported,
      weights: {
        color: {
          needMin: true,
          needMax: true,
          combineMaxMin: true,
          maxMinBuffer: device.createBuffer({
            byteLength: 4 * 4,
            // @ts-expect-error webgl-legacy
            accessor: { size: 4, type: 5126, divisor: 1 }
          })
        },
        elevation: {
          needMin: true,
          needMax: true,
          combineMaxMin: true,
          maxMinBuffer: device.createBuffer({
            byteLength: 4 * 4,
            // @ts-expect-error
            accessor: { size: 4, type: 5126, divisor: 1 }
          })
        }
      },
      positionAttributeName: "positions"
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME3]: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      color: { size: 3, accessor: "getColorWeight" },
      elevation: { size: 3, accessor: "getElevationWeight" }
    });
  }
  updateState(opts) {
    if (this.state.isSupported === false) {
      return;
    }
    super.updateState(opts);
    const { aggregationDirty } = this.state;
    if (aggregationDirty) {
      this.setState({
        gridHash: null
      });
    }
  }
  getHashKeyForIndex(index) {
    const { numRow, numCol, boundingBox, gridOffset } = this.state;
    const gridSize = [numCol, numRow];
    const gridOrigin = [boundingBox.xMin, boundingBox.yMin];
    const cellSize = [gridOffset.xOffset, gridOffset.yOffset];
    const yIndex = Math.floor(index / gridSize[0]);
    const xIndex = index - yIndex * gridSize[0];
    const latIdx = Math.floor((yIndex * cellSize[1] + gridOrigin[1] + 90 + cellSize[1] / 2) / cellSize[1]);
    const lonIdx = Math.floor((xIndex * cellSize[0] + gridOrigin[0] + 180 + cellSize[0] / 2) / cellSize[0]);
    return `${latIdx}-${lonIdx}`;
  }
  getPositionForIndex(index) {
    const { numRow, numCol, boundingBox, gridOffset } = this.state;
    const gridSize = [numCol, numRow];
    const gridOrigin = [boundingBox.xMin, boundingBox.yMin];
    const cellSize = [gridOffset.xOffset, gridOffset.yOffset];
    const yIndex = Math.floor(index / gridSize[0]);
    const xIndex = index - yIndex * gridSize[0];
    const yPos = yIndex * cellSize[1] + gridOrigin[1];
    const xPos = xIndex * cellSize[0] + gridOrigin[0];
    return [xPos, yPos];
  }
  getPickingInfo({ info, mode }) {
    const { index } = info;
    let object = null;
    if (index >= 0) {
      const gpuGridAggregator = this.state.gpuGridAggregator;
      const position = this.getPositionForIndex(index);
      const colorInfo = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...gpuGridAggregator.getData("color")
      });
      const elevationInfo = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...gpuGridAggregator.getData("elevation")
      });
      object = {
        colorValue: colorInfo.cellWeight,
        elevationValue: elevationInfo.cellWeight,
        count: colorInfo.cellCount || elevationInfo.cellCount,
        position,
        totalCount: colorInfo.totalCount || elevationInfo.totalCount
      };
      if (mode !== "hover") {
        const { props } = this;
        let { gridHash } = this.state;
        if (!gridHash) {
          const { gridOffset, translation, boundingBox } = this.state;
          const { viewport } = this.context;
          const attributes = this.getAttributes();
          const cpuAggregation = pointToDensityGridDataCPU(props, {
            gridOffset,
            attributes,
            viewport,
            translation,
            boundingBox
          });
          gridHash = cpuAggregation.gridHash;
          this.setState({ gridHash });
        }
        const key = this.getHashKeyForIndex(index);
        const cpuAggregationData = gridHash[key];
        Object.assign(object, cpuAggregationData);
      }
    }
    info.picked = Boolean(object);
    info.object = object;
    return info;
  }
  renderLayers() {
    if (!this.state.isSupported) {
      return null;
    }
    const { elevationScale, extruded, cellSize: cellSizeMeters, coverage, material, elevationRange, colorDomain, elevationDomain } = this.props;
    const { weights, numRow, numCol, gridOrigin, gridOffset } = this.state;
    const { color, elevation } = weights;
    const colorRange = colorRangeToFlatArray(this.props.colorRange);
    const SubLayerClass = this.getSubLayerClass("gpu-grid-cell", gpu_grid_cell_layer_default);
    return new SubLayerClass({
      gridSize: [numCol, numRow],
      gridOrigin,
      gridOffset: [gridOffset.xOffset, gridOffset.yOffset],
      colorRange,
      elevationRange,
      colorDomain,
      elevationDomain,
      cellSize: cellSizeMeters,
      coverage,
      material,
      elevationScale,
      extruded
    }, this.getSubLayerProps({
      id: "gpu-grid-cell"
    }), {
      data: {
        attributes: {
          colors: color.aggregationBuffer,
          elevations: elevation.aggregationBuffer
        }
      },
      colorMaxMinBuffer: color.maxMinBuffer,
      elevationMaxMinBuffer: elevation.maxMinBuffer,
      numInstances: numCol * numRow
    });
  }
  finalizeState(context) {
    const { color, elevation } = this.state.weights;
    [color, elevation].forEach((weight) => {
      const { aggregationBuffer, maxMinBuffer } = weight;
      maxMinBuffer == null ? void 0 : maxMinBuffer.destroy();
      aggregationBuffer == null ? void 0 : aggregationBuffer.destroy();
    });
    super.finalizeState(context);
  }
  // Aggregation Overrides
  updateAggregationState(opts) {
    const { props, oldProps } = opts;
    const { cellSize, coordinateSystem } = props;
    const { viewport } = this.context;
    const cellSizeChanged = oldProps.cellSize !== cellSize;
    const { dimensions } = this.state;
    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME3);
    const attributesChanged = positionsChanged || this.isAttributeChanged();
    let { boundingBox } = this.state;
    if (positionsChanged) {
      boundingBox = getBoundingBox(this.getAttributes(), this.getNumInstances());
      this.setState({ boundingBox });
    }
    if (positionsChanged || cellSizeChanged) {
      const { gridOffset, translation, width, height, numCol, numRow } = getGridParams(boundingBox, cellSize, viewport, coordinateSystem);
      this.allocateResources(numRow, numCol);
      this.setState({
        gridOffset,
        translation,
        gridOrigin: [-1 * translation[0], -1 * translation[1]],
        width,
        height,
        numCol,
        numRow
      });
    }
    const aggregationDataDirty = attributesChanged || this.isAggregationDirty(opts, {
      dimension: dimensions.data,
      compareAll: true
    });
    if (aggregationDataDirty) {
      this._updateAccessors(opts);
    }
    this.setState({
      aggregationDataDirty
    });
  }
  // Private
  _updateAccessors(opts) {
    const { colorAggregation, elevationAggregation } = opts.props;
    const { color, elevation } = this.state.weights;
    color.operation = AGGREGATION_OPERATION[colorAggregation];
    elevation.operation = AGGREGATION_OPERATION[elevationAggregation];
  }
};
GPUGridLayer.layerName = "GPUGridLayer";
GPUGridLayer.defaultProps = defaultProps8;
var gpu_grid_layer_default = GPUGridLayer;

// node_modules/@deck.gl/aggregation-layers/dist/grid-layer/grid-layer.js
var defaultProps9 = {
  ...gpu_grid_layer_default.defaultProps,
  ...cpu_grid_layer_default.defaultProps,
  gpuAggregation: false
};
var GridLayer = class extends composite_layer_default {
  initializeState() {
    this.state = {
      useGPUAggregation: false
      // TODO(v9): Re-enable GPU aggregation.
    };
  }
  updateState({ props }) {
    this.setState({
      // TODO(v9): Re-enable GPU aggregation.
      // useGPUAggregation: this.canUseGPUAggregation(props)
      useGPUAggregation: false
    });
  }
  renderLayers() {
    const { data, updateTriggers } = this.props;
    const id = this.state.useGPUAggregation ? "GPU" : "CPU";
    const LayerType = this.state.useGPUAggregation ? this.getSubLayerClass("GPU", gpu_grid_layer_default) : this.getSubLayerClass("CPU", cpu_grid_layer_default);
    return new LayerType(this.props, this.getSubLayerProps({
      id,
      updateTriggers
    }), {
      data
    });
  }
  // Private methods
  canUseGPUAggregation(props) {
    const { gpuAggregation, lowerPercentile, upperPercentile, getColorValue, getElevationValue, colorScaleType } = props;
    if (!gpuAggregation) {
      return false;
    }
    if (!GPUGridAggregator.isSupported(this.context.device)) {
      return false;
    }
    if (lowerPercentile !== 0 || upperPercentile !== 100) {
      return false;
    }
    if (getColorValue !== null || getElevationValue !== null) {
      return false;
    }
    if (colorScaleType === "quantile" || colorScaleType === "ordinal") {
      return false;
    }
    return true;
  }
};
GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = defaultProps9;
var grid_layer_default = GridLayer;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/heatmap-layer-utils.js
function getBounds(points) {
  const x2 = points.map((p2) => p2[0]);
  const y2 = points.map((p2) => p2[1]);
  const xMin = Math.min.apply(null, x2);
  const xMax = Math.max.apply(null, x2);
  const yMin = Math.min.apply(null, y2);
  const yMax = Math.max.apply(null, y2);
  return [xMin, yMin, xMax, yMax];
}
function boundsContain(currentBounds, targetBounds) {
  if (targetBounds[0] >= currentBounds[0] && targetBounds[2] <= currentBounds[2] && targetBounds[1] >= currentBounds[1] && targetBounds[3] <= currentBounds[3]) {
    return true;
  }
  return false;
}
var scratchArray = new Float32Array(12);
function packVertices(points, dimensions = 2) {
  let index = 0;
  for (const point of points) {
    for (let i3 = 0; i3 < dimensions; i3++) {
      scratchArray[index++] = point[i3] || 0;
    }
  }
  return scratchArray;
}
function scaleToAspectRatio(boundingBox, width, height) {
  const [xMin, yMin, xMax, yMax] = boundingBox;
  const currentWidth = xMax - xMin;
  const currentHeight = yMax - yMin;
  let newWidth = currentWidth;
  let newHeight = currentHeight;
  if (currentWidth / currentHeight < width / height) {
    newWidth = width / height * currentHeight;
  } else {
    newHeight = height / width * currentWidth;
  }
  if (newWidth < width) {
    newWidth = width;
    newHeight = height;
  }
  const xCenter = (xMax + xMin) / 2;
  const yCenter = (yMax + yMin) / 2;
  return [
    xCenter - newWidth / 2,
    yCenter - newHeight / 2,
    xCenter + newWidth / 2,
    yCenter + newHeight / 2
  ];
}
function getTextureCoordinates(point, bounds) {
  const [xMin, yMin, xMax, yMax] = bounds;
  return [(point[0] - xMin) / (xMax - xMin), (point[1] - yMin) / (yMax - yMin)];
}

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/triangle-layer-vertex.glsl.js
var triangle_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader
uniform sampler2D maxTexture;
uniform float intensity;
uniform vec2 colorDomain;
uniform float threshold;
uniform float aggregationMode;
in vec3 positions;
in vec2 texCoords;
out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;
void main(void) {
gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
vTexCoords = texCoords;
vec4 maxTexture = texture(maxTexture, vec2(0.5));
float maxValue = aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
float minValue = maxValue * threshold;
if (colorDomain[1] > 0.) {
maxValue = colorDomain[1];
minValue = colorDomain[0];
}
vIntensityMax = intensity / maxValue;
vIntensityMin = intensity / minValue;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/triangle-layer-fragment.glsl.js
var triangle_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME triangle-layer-fragment-shader
precision highp float;
uniform float opacity;
uniform sampler2D weightsTexture;
uniform sampler2D colorTexture;
uniform float aggregationMode;
in vec2 vTexCoords;
in float vIntensityMin;
in float vIntensityMax;
out vec4 fragColor;
vec4 getLinearColor(float value) {
float factor = clamp(value * vIntensityMax, 0., 1.);
vec4 color = texture(colorTexture, vec2(factor, 0.5));
color.a *= min(value * vIntensityMin, 1.0);
return color;
}
void main(void) {
vec4 weights = texture(weightsTexture, vTexCoords);
float weight = weights.r;
if (aggregationMode > 0.5) {
weight /= max(1.0, weights.a);
}
if (weight <= 0.) {
discard;
}
vec4 linearColor = getLinearColor(weight);
linearColor.a *= opacity;
fragColor = linearColor;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/triangle-layer.js
var TriangleLayer = class extends layer_default {
  getShaders() {
    return { vs: triangle_layer_vertex_glsl_default, fs: triangle_layer_fragment_glsl_default, modules: [project32_default] };
  }
  initializeState({ device }) {
    this.setState({ model: this._getModel(device) });
  }
  _getModel(device) {
    const { vertexCount, data, weightsTexture, maxTexture, colorTexture } = this.props;
    return new Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      bindings: { weightsTexture, maxTexture, colorTexture },
      attributes: data.attributes,
      bufferLayout: [
        { name: "positions", format: "float32x3" },
        { name: "texCoords", format: "float32x2" }
      ],
      topology: "triangle-fan-webgl",
      vertexCount
    });
  }
  draw({ uniforms }) {
    const { model } = this.state;
    const { intensity, threshold: threshold2, aggregationMode, colorDomain } = this.props;
    model.setUniforms({
      ...uniforms,
      intensity,
      threshold: threshold2,
      aggregationMode,
      colorDomain
    });
    model.draw(this.context.renderPass);
  }
};
TriangleLayer.layerName = "TriangleLayer";
var triangle_layer_default = TriangleLayer;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/weights-vs.glsl.js
var weights_vs_glsl_default = `#version 300 es
in vec3 positions;
in vec3 positions64Low;
in float weights;
out vec4 weightsTexture;
uniform float radiusPixels;
uniform float textureWidth;
uniform vec4 commonBounds;
uniform float weightsScale;
void main()
{
weightsTexture = vec4(weights * weightsScale, 0., 0., 1.);
float radiusTexels = project_pixel_size(radiusPixels) * textureWidth / (commonBounds.z - commonBounds.x);
gl_PointSize = radiusTexels * 2.;
vec3 commonPosition = project_position(positions, positions64Low);
gl_Position.xy = (commonPosition.xy - commonBounds.xy) / (commonBounds.zw - commonBounds.xy) ;
gl_Position.xy = (gl_Position.xy * 2.) - (1.);
gl_Position.w = 1.0;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/weights-fs.glsl.js
var weights_fs_glsl_default = `#version 300 es
in vec4 weightsTexture;
out vec4 fragColor;
float gaussianKDE(float u){
return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
void main()
{
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
discard;
}
fragColor = weightsTexture * gaussianKDE(2. * dist);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/max-vs.glsl.js
var max_vs_glsl_default = `#version 300 es
uniform sampler2D inTexture;
uniform float textureSize;
out vec4 outTexture;
void main()
{
int yIndex = gl_VertexID / int(textureSize);
int xIndex = gl_VertexID - (yIndex * int(textureSize));
vec2 uv = (0.5 + vec2(float(xIndex), float(yIndex))) / textureSize;
outTexture = texture(inTexture, uv);
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 1.0;
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/max-fs.glsl.js
var max_fs_glsl_default = `#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
fragColor = outTexture;
fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;

// node_modules/@deck.gl/aggregation-layers/dist/heatmap-layer/heatmap-layer.js
var RESOLUTION = 2;
var TEXTURE_PROPS = {
  format: "rgba8unorm",
  mipmaps: false,
  sampler: {
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  }
};
var DEFAULT_COLOR_DOMAIN = [0, 0];
var AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};
var defaultProps10 = {
  getPosition: { type: "accessor", value: (x2) => x2.position },
  getWeight: { type: "accessor", value: 1 },
  intensity: { type: "number", min: 0, value: 1 },
  radiusPixels: { type: "number", min: 1, max: 100, value: 50 },
  colorRange: defaultColorRange,
  threshold: { type: "number", min: 0, max: 1, value: 0.05 },
  colorDomain: { type: "array", value: null, optional: true },
  // 'SUM' or 'MEAN'
  aggregation: "SUM",
  weightsTextureSize: { type: "number", min: 128, max: 2048, value: 2048 },
  debounceTimeout: { type: "number", min: 0, max: 1e3, value: 500 }
};
var FLOAT_TARGET_FEATURES = [
  "float32-renderable-webgl",
  // ability to render to float texture
  "texture-blend-float-webgl"
  // ability to blend when rendering to float texture
];
var DIMENSIONS4 = {
  data: {
    props: ["radiusPixels"]
  }
};
var HeatmapLayer = class extends aggregation_layer_default {
  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS4);
    this.setState({ colorDomain: DEFAULT_COLOR_DOMAIN });
    this._setupTextureParams();
    this._setupAttributes();
    this._setupResources();
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  /* eslint-disable max-statements,complexity */
  updateState(opts) {
    super.updateState(opts);
    this._updateHeatmapState(opts);
  }
  _updateHeatmapState(opts) {
    const { props, oldProps } = opts;
    const changeFlags = this._getChangeFlags(opts);
    if (changeFlags.dataChanged || changeFlags.viewportChanged) {
      changeFlags.boundsChanged = this._updateBounds(changeFlags.dataChanged);
      this._updateTextureRenderingBounds();
    }
    if (changeFlags.dataChanged || changeFlags.boundsChanged) {
      clearTimeout(this.state.updateTimer);
      this.setState({ isWeightMapDirty: true });
    } else if (changeFlags.viewportZoomChanged) {
      this._debouncedUpdateWeightmap();
    }
    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }
    if (this.state.isWeightMapDirty) {
      this._updateWeightmap();
    }
    this.setState({ zoom: opts.context.viewport.zoom });
  }
  renderLayers() {
    const { weightsTexture, triPositionBuffer, triTexCoordBuffer, maxWeightsTexture, colorTexture, colorDomain } = this.state;
    const { updateTriggers, intensity, threshold: threshold2, aggregation } = this.props;
    const TriangleLayerClass = this.getSubLayerClass("triangle", triangle_layer_default);
    return new TriangleLayerClass(this.getSubLayerProps({
      id: "triangle-layer",
      updateTriggers
    }), {
      // position buffer is filled with world coordinates generated from viewport.unproject
      // i.e. LNGLAT if geospatial, CARTESIAN otherwise
      coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
      data: {
        attributes: {
          positions: triPositionBuffer,
          texCoords: triTexCoordBuffer
        }
      },
      vertexCount: 4,
      maxTexture: maxWeightsTexture,
      colorTexture,
      aggregationMode: AGGREGATION_MODE[aggregation] || 0,
      weightsTexture,
      intensity,
      threshold: threshold2,
      colorDomain
    });
  }
  finalizeState(context) {
    super.finalizeState(context);
    const { weightsTransform, weightsTexture, maxWeightTransform, maxWeightsTexture, triPositionBuffer, triTexCoordBuffer, colorTexture, updateTimer } = this.state;
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTexture == null ? void 0 : weightsTexture.destroy();
    maxWeightTransform == null ? void 0 : maxWeightTransform.destroy();
    maxWeightsTexture == null ? void 0 : maxWeightsTexture.destroy();
    triPositionBuffer == null ? void 0 : triPositionBuffer.destroy();
    triTexCoordBuffer == null ? void 0 : triTexCoordBuffer.destroy();
    colorTexture == null ? void 0 : colorTexture.destroy();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
  }
  // PRIVATE
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
  _getChangeFlags(opts) {
    const changeFlags = {};
    const { dimensions } = this.state;
    changeFlags.dataChanged = this.isAttributeChanged() && "attribute changed" || // if any attribute is changed
    this.isAggregationDirty(opts, {
      compareAll: true,
      dimension: dimensions.data
    }) && "aggregation is dirty";
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;
    const { zoom } = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }
    return changeFlags;
  }
  _createTextures() {
    const { textureSize, format } = this.state;
    this.setState({
      weightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: textureSize,
        height: textureSize,
        format
      }),
      maxWeightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: 1,
        height: 1,
        format
      })
    });
  }
  _setupAttributes() {
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: { size: 3, type: "float64", accessor: "getPosition" },
      weights: { size: 1, accessor: "getWeight" }
    });
    this.setState({ positionAttributeName: "positions" });
  }
  _setupTextureParams() {
    const { device } = this.context;
    const { weightsTextureSize } = this.props;
    const textureSize = Math.min(weightsTextureSize, device.limits.maxTextureDimension2D);
    const floatTargetSupport = FLOAT_TARGET_FEATURES.every((feature) => device.features.has(feature));
    const format = floatTargetSupport ? "rgba32float" : "rgba8unorm";
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({ textureSize, format, weightsScale });
    if (!floatTargetSupport) {
      log_default.warn(`HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`)();
    }
  }
  _createWeightsTransform(shaders) {
    let { weightsTransform } = this.state;
    const { weightsTexture } = this.state;
    const attributeManager = this.getAttributeManager();
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTransform = new TextureTransform(this.context.device, {
      id: `${this.id}-weights-transform`,
      bufferLayout: attributeManager.getBufferLayouts(),
      vertexCount: 1,
      targetTexture: weightsTexture,
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: "add",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      },
      topology: "point-list",
      ...shaders
    });
    this.setState({ weightsTransform });
  }
  _setupResources() {
    this._createTextures();
    const { device } = this.context;
    const { textureSize, weightsTexture, maxWeightsTexture } = this.state;
    const weightsTransformShaders = this.getShaders({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default
    });
    this._createWeightsTransform(weightsTransformShaders);
    const maxWeightsTransformShaders = this.getShaders({ vs: max_vs_glsl_default, fs: max_fs_glsl_default });
    const maxWeightTransform = new TextureTransform(device, {
      id: `${this.id}-max-weights-transform`,
      bindings: { inTexture: weightsTexture },
      uniforms: { textureSize },
      targetTexture: maxWeightsTexture,
      ...maxWeightsTransformShaders,
      vertexCount: textureSize * textureSize,
      topology: "point-list",
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: "max",
        blendAlphaOperation: "max",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      }
    });
    this.setState({
      weightsTexture,
      maxWeightsTexture,
      maxWeightTransform,
      zoom: null,
      triPositionBuffer: device.createBuffer({ byteLength: 48 }),
      triTexCoordBuffer: device.createBuffer({ byteLength: 48 })
    });
  }
  // overwrite super class method to update transform model
  updateShaders(shaderOptions) {
    this._createWeightsTransform({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default,
      ...shaderOptions
    });
  }
  _updateMaxWeightValue() {
    const { maxWeightTransform } = this.state;
    maxWeightTransform.run({
      parameters: { viewport: [0, 0, 1, 1] },
      clearColor: [0, 0, 0, 0]
    });
  }
  // Computes world bounds area that needs to be processed for generate heatmap
  _updateBounds(forceUpdate = false) {
    const { viewport } = this.context;
    const viewportCorners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([viewport.width, viewport.height]),
      viewport.unproject([0, viewport.height])
    ].map((p2) => p2.map(Math.fround));
    const visibleWorldBounds = getBounds(viewportCorners);
    const newState = { visibleWorldBounds, viewportCorners };
    let boundsChanged = false;
    if (forceUpdate || !this.state.worldBounds || !boundsContain(this.state.worldBounds, visibleWorldBounds)) {
      const scaledCommonBounds = this._worldToCommonBounds(visibleWorldBounds);
      const worldBounds = this._commonToWorldBounds(scaledCommonBounds);
      if (this.props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        worldBounds[1] = Math.max(worldBounds[1], -85.051129);
        worldBounds[3] = Math.min(worldBounds[3], 85.051129);
        worldBounds[0] = Math.max(worldBounds[0], -360);
        worldBounds[2] = Math.min(worldBounds[2], 360);
      }
      const normalizedCommonBounds = this._worldToCommonBounds(worldBounds);
      newState.worldBounds = worldBounds;
      newState.normalizedCommonBounds = normalizedCommonBounds;
      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }
  _updateTextureRenderingBounds() {
    const { triPositionBuffer, triTexCoordBuffer, normalizedCommonBounds, viewportCorners } = this.state;
    const { viewport } = this.context;
    triPositionBuffer.write(packVertices(viewportCorners, 3));
    const textureBounds = viewportCorners.map((p2) => getTextureCoordinates(viewport.projectPosition(p2), normalizedCommonBounds));
    triTexCoordBuffer.write(packVertices(textureBounds, 2));
  }
  _updateColorTexture(opts) {
    const { colorRange } = opts.props;
    let { colorTexture } = this.state;
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
    if (colorTexture && (colorTexture == null ? void 0 : colorTexture.width) === colorRange.length) {
      colorTexture.setSubImageData({ data: colors });
    } else {
      colorTexture == null ? void 0 : colorTexture.destroy();
      colorTexture = this.context.device.createTexture({
        ...TEXTURE_PROPS,
        data: colors,
        width: colorRange.length,
        height: 1
      });
    }
    this.setState({ colorTexture });
  }
  _updateWeightmap() {
    const { radiusPixels, colorDomain, aggregation } = this.props;
    const { worldBounds, textureSize, weightsScale } = this.state;
    const weightsTransform = this.state.weightsTransform;
    this.state.isWeightMapDirty = false;
    const commonBounds = this._worldToCommonBounds(worldBounds, {
      useLayerCoordinateSystem: true
    });
    if (colorDomain && aggregation === "SUM") {
      const { viewport } = this.context;
      const metersPerPixel = viewport.distanceScales.metersPerUnit[2] * (commonBounds[2] - commonBounds[0]) / textureSize;
      this.state.colorDomain = colorDomain.map((x2) => x2 * metersPerPixel * weightsScale);
    } else {
      this.state.colorDomain = colorDomain || DEFAULT_COLOR_DOMAIN;
    }
    const attributeManager = this.getAttributeManager();
    const attributes = attributeManager.getAttributes();
    const moduleSettings = this.getModuleSettings();
    const uniforms = { radiusPixels, commonBounds, textureWidth: textureSize, weightsScale };
    this._setModelAttributes(weightsTransform.model, attributes);
    weightsTransform.model.setVertexCount(this.getNumInstances());
    weightsTransform.model.setUniforms(uniforms);
    weightsTransform.model.updateModuleSettings(moduleSettings);
    weightsTransform.run({
      parameters: { viewport: [0, 0, textureSize, textureSize] },
      clearColor: [0, 0, 0, 0]
    });
    this._updateMaxWeightValue();
  }
  _debouncedUpdateWeightmap(fromTimer = false) {
    let { updateTimer } = this.state;
    const { debounceTimeout } = this.props;
    if (fromTimer) {
      updateTimer = null;
      this._updateBounds(true);
      this._updateTextureRenderingBounds();
      this.setState({ isWeightMapDirty: true });
    } else {
      this.setState({ isWeightMapDirty: false });
      clearTimeout(updateTimer);
      updateTimer = setTimeout(this._debouncedUpdateWeightmap.bind(this, true), debounceTimeout);
    }
    this.setState({ updateTimer });
  }
  // input: worldBounds: [minLong, minLat, maxLong, maxLat]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [minX, minY, maxX, maxY] scaled to fit the current texture
  _worldToCommonBounds(worldBounds, opts = {}) {
    const { useLayerCoordinateSystem = false } = opts;
    const [minLong, minLat, maxLong, maxLat] = worldBounds;
    const { viewport } = this.context;
    const { textureSize } = this.state;
    const { coordinateSystem } = this.props;
    const offsetMode = useLayerCoordinateSystem && (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS || coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS);
    const offsetOriginCommon = offsetMode ? viewport.projectPosition(this.props.coordinateOrigin) : [0, 0];
    const size = textureSize * RESOLUTION / viewport.scale;
    let bottomLeftCommon;
    let topRightCommon;
    if (useLayerCoordinateSystem && !offsetMode) {
      bottomLeftCommon = this.projectPosition([minLong, minLat, 0]);
      topRightCommon = this.projectPosition([maxLong, maxLat, 0]);
    } else {
      bottomLeftCommon = viewport.projectPosition([minLong, minLat, 0]);
      topRightCommon = viewport.projectPosition([maxLong, maxLat, 0]);
    }
    return scaleToAspectRatio([
      bottomLeftCommon[0] - offsetOriginCommon[0],
      bottomLeftCommon[1] - offsetOriginCommon[1],
      topRightCommon[0] - offsetOriginCommon[0],
      topRightCommon[1] - offsetOriginCommon[1]
    ], size, size);
  }
  // input commonBounds: [xMin, yMin, xMax, yMax]
  // output worldBounds: [minLong, minLat, maxLong, maxLat]
  _commonToWorldBounds(commonBounds) {
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const { viewport } = this.context;
    const bottomLeftWorld = viewport.unprojectPosition([xMin, yMin]);
    const topRightWorld = viewport.unprojectPosition([xMax, yMax]);
    return bottomLeftWorld.slice(0, 2).concat(topRightWorld.slice(0, 2));
  }
};
HeatmapLayer.layerName = "HeatmapLayer";
HeatmapLayer.defaultProps = defaultProps10;
var heatmap_layer_default = HeatmapLayer;

// node_modules/@deck.gl/react/dist/deckgl.js
var React2 = __toESM(require_react(), 1);
var import_react5 = __toESM(require_react(), 1);

// node_modules/@deck.gl/react/dist/utils/use-isomorphic-layout-effect.js
var import_react = __toESM(require_react(), 1);
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
var use_isomorphic_layout_effect_default = useIsomorphicLayoutEffect;

// node_modules/@deck.gl/react/dist/utils/extract-jsx-layers.js
var React = __toESM(require_react(), 1);
var import_react3 = __toESM(require_react(), 1);

// node_modules/@deck.gl/react/dist/utils/inherits-from.js
function inheritsFrom(Type, ParentType) {
  while (Type) {
    if (Type === ParentType) {
      return true;
    }
    Type = Object.getPrototypeOf(Type);
  }
  return false;
}

// node_modules/@deck.gl/react/dist/utils/evaluate-children.js
var import_react2 = __toESM(require_react(), 1);
var MAP_STYLE = { position: "absolute", zIndex: -1 };
function evaluateChildren(children, childProps) {
  if (typeof children === "function") {
    return children(childProps);
  }
  if (Array.isArray(children)) {
    return children.map((child) => evaluateChildren(child, childProps));
  }
  if (isComponent(children)) {
    if (isReactMap(children)) {
      childProps.style = MAP_STYLE;
      return (0, import_react2.cloneElement)(children, childProps);
    }
    if (needsDeckGLViewProps(children)) {
      return (0, import_react2.cloneElement)(children, childProps);
    }
  }
  return children;
}
function isComponent(child) {
  return child && typeof child === "object" && "type" in child || false;
}
function isReactMap(child) {
  var _a;
  return (_a = child.props) == null ? void 0 : _a.mapStyle;
}
function needsDeckGLViewProps(child) {
  const componentClass = child.type;
  return componentClass && componentClass.deckGLViewProps;
}

// node_modules/@deck.gl/react/dist/utils/extract-jsx-layers.js
function wrapInView(node) {
  if (typeof node === "function") {
    return (0, import_react3.createElement)(View, {}, node);
  }
  if (Array.isArray(node)) {
    return node.map(wrapInView);
  }
  if (isComponent(node)) {
    if (node.type === React.Fragment) {
      return wrapInView(node.props.children);
    }
    if (inheritsFrom(node.type, View)) {
      return node;
    }
  }
  return node;
}
function extractJSXLayers({ children, layers = [], views = null }) {
  const reactChildren = [];
  const jsxLayers = [];
  const jsxViews = {};
  React.Children.forEach(wrapInView(children), (reactElement) => {
    if (isComponent(reactElement)) {
      const ElementType = reactElement.type;
      if (inheritsFrom(ElementType, layer_default)) {
        const layer = createLayer(ElementType, reactElement.props);
        jsxLayers.push(layer);
      } else {
        reactChildren.push(reactElement);
      }
      if (inheritsFrom(ElementType, View) && ElementType !== View && reactElement.props.id) {
        const view = new ElementType(reactElement.props);
        jsxViews[view.id] = view;
      }
    } else if (reactElement) {
      reactChildren.push(reactElement);
    }
  });
  if (Object.keys(jsxViews).length > 0) {
    if (Array.isArray(views)) {
      views.forEach((view) => {
        jsxViews[view.id] = view;
      });
    } else if (views) {
      jsxViews[views.id] = views;
    }
    views = Object.values(jsxViews);
  }
  layers = jsxLayers.length > 0 ? [...jsxLayers, ...layers] : layers;
  return { layers, children: reactChildren, views };
}
function createLayer(LayerType, reactProps) {
  const props = {};
  const defaultProps11 = LayerType.defaultProps || {};
  for (const key in reactProps) {
    if (defaultProps11[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }
  return new LayerType(props);
}

// node_modules/@deck.gl/react/dist/utils/position-children-under-views.js
var import_react4 = __toESM(require_react(), 1);
function positionChildrenUnderViews({ children, deck, ContextProvider }) {
  const { viewManager } = deck || {};
  if (!viewManager || !viewManager.views.length) {
    return [];
  }
  const views = {};
  const defaultViewId = viewManager.views[0].id;
  for (const child of children) {
    let viewId = defaultViewId;
    let viewChildren = child;
    if (isComponent(child) && inheritsFrom(child.type, View)) {
      viewId = child.props.id || defaultViewId;
      viewChildren = child.props.children;
    }
    const viewport = viewManager.getViewport(viewId);
    const viewState = viewManager.getViewState(viewId);
    if (viewport) {
      viewState.padding = viewport.padding;
      const { x: x2, y: y2, width, height } = viewport;
      viewChildren = evaluateChildren(viewChildren, {
        x: x2,
        y: y2,
        width,
        height,
        viewport,
        viewState
      });
      if (!views[viewId]) {
        views[viewId] = {
          viewport,
          children: []
        };
      }
      views[viewId].children.push(viewChildren);
    }
  }
  return Object.keys(views).map((viewId) => {
    const { viewport, children: viewChildren } = views[viewId];
    const { x: x2, y: y2, width, height } = viewport;
    const style = {
      position: "absolute",
      left: x2,
      top: y2,
      width,
      height
    };
    const key = `view-${viewId}`;
    const viewElement = (0, import_react4.createElement)("div", { key, id: key, style }, ...viewChildren);
    if (ContextProvider) {
      const contextValue = {
        viewport,
        // @ts-expect-error accessing protected property
        container: deck.canvas.offsetParent,
        // @ts-expect-error accessing protected property
        eventManager: deck.eventManager,
        onViewStateChange: (params) => {
          params.viewId = viewId;
          deck._onViewStateChange(params);
        }
      };
      return (0, import_react4.createElement)(ContextProvider, { key, value: contextValue }, viewElement);
    }
    return viewElement;
  });
}

// node_modules/@deck.gl/react/dist/utils/extract-styles.js
var CANVAS_ONLY_STYLES = {
  mixBlendMode: null
};
function extractStyles({ width, height, style }) {
  const containerStyle = {
    position: "absolute",
    zIndex: 0,
    left: 0,
    top: 0,
    width,
    height
  };
  const canvasStyle = {
    left: 0,
    top: 0
  };
  if (style) {
    for (const key in style) {
      if (key in CANVAS_ONLY_STYLES) {
        canvasStyle[key] = style[key];
      } else {
        containerStyle[key] = style[key];
      }
    }
  }
  return { containerStyle, canvasStyle };
}

// node_modules/@deck.gl/react/dist/deckgl.js
function getRefHandles(thisRef) {
  return {
    get deck() {
      return thisRef.deck;
    },
    // The following method can only be called after ref is available, by which point deck is defined in useEffect
    pickObject: (opts) => thisRef.deck.pickObject(opts),
    pickMultipleObjects: (opts) => thisRef.deck.pickMultipleObjects(opts),
    pickObjects: (opts) => thisRef.deck.pickObjects(opts)
  };
}
function redrawDeck(thisRef) {
  if (thisRef.redrawReason) {
    thisRef.deck._drawLayers(thisRef.redrawReason);
    thisRef.redrawReason = null;
  }
}
function createDeckInstance(thisRef, DeckClass, props) {
  const deck = new DeckClass({
    ...props,
    // The Deck's animation loop is independent from React's render cycle, causing potential
    // synchronization issues. We provide this custom render function to make sure that React
    // and Deck update on the same schedule.
    _customRender: (redrawReason) => {
      thisRef.redrawReason = redrawReason;
      const viewports = deck.getViewports();
      if (thisRef.lastRenderedViewports !== viewports) {
        thisRef.forceUpdate();
      } else {
        redrawDeck(thisRef);
      }
    }
  });
  return deck;
}
function DeckGLWithRef(props, ref) {
  const [version, setVersion] = (0, import_react5.useState)(0);
  const _thisRef = (0, import_react5.useRef)({
    control: null,
    version,
    forceUpdate: () => setVersion((v2) => v2 + 1)
  });
  const thisRef = _thisRef.current;
  const containerRef = (0, import_react5.useRef)(null);
  const canvasRef = (0, import_react5.useRef)(null);
  const jsxProps = (0, import_react5.useMemo)(() => extractJSXLayers(props), [props.layers, props.views, props.children]);
  let inRender = true;
  const handleViewStateChange = (params) => {
    var _a;
    if (inRender && props.viewState) {
      thisRef.viewStateUpdateRequested = params;
      return null;
    }
    thisRef.viewStateUpdateRequested = null;
    return (_a = props.onViewStateChange) == null ? void 0 : _a.call(props, params);
  };
  const handleInteractionStateChange = (params) => {
    var _a;
    if (inRender) {
      thisRef.interactionStateUpdateRequested = params;
    } else {
      thisRef.interactionStateUpdateRequested = null;
      (_a = props.onInteractionStateChange) == null ? void 0 : _a.call(props, params);
    }
  };
  const deckProps = (0, import_react5.useMemo)(() => {
    const forwardProps = {
      ...props,
      // Override user styling props. We will set the canvas style in render()
      style: null,
      width: "100%",
      height: "100%",
      parent: containerRef.current,
      canvas: canvasRef.current,
      layers: jsxProps.layers,
      views: jsxProps.views,
      onViewStateChange: handleViewStateChange,
      onInteractionStateChange: handleInteractionStateChange
    };
    delete forwardProps._customRender;
    if (thisRef.deck) {
      thisRef.deck.setProps(forwardProps);
    }
    return forwardProps;
  }, [props]);
  (0, import_react5.useEffect)(() => {
    const DeckClass = props.Deck || deck_default;
    thisRef.deck = createDeckInstance(thisRef, DeckClass, {
      ...deckProps,
      parent: containerRef.current,
      canvas: canvasRef.current
    });
    return () => {
      var _a;
      return (_a = thisRef.deck) == null ? void 0 : _a.finalize();
    };
  }, []);
  use_isomorphic_layout_effect_default(() => {
    redrawDeck(thisRef);
    const { viewStateUpdateRequested, interactionStateUpdateRequested } = thisRef;
    if (viewStateUpdateRequested) {
      handleViewStateChange(viewStateUpdateRequested);
    }
    if (interactionStateUpdateRequested) {
      handleInteractionStateChange(interactionStateUpdateRequested);
    }
  });
  (0, import_react5.useImperativeHandle)(ref, () => getRefHandles(thisRef), []);
  const currentViewports = thisRef.deck && thisRef.deck.isInitialized ? thisRef.deck.getViewports() : void 0;
  const { ContextProvider, width = "100%", height = "100%", id, style } = props;
  const { containerStyle, canvasStyle } = (0, import_react5.useMemo)(() => extractStyles({ width, height, style }), [width, height, style]);
  if (!thisRef.viewStateUpdateRequested && thisRef.lastRenderedViewports === currentViewports || // case 2
  thisRef.version !== version) {
    thisRef.lastRenderedViewports = currentViewports;
    thisRef.version = version;
    const childrenUnderViews = positionChildrenUnderViews({
      children: jsxProps.children,
      deck: thisRef.deck,
      ContextProvider
    });
    const canvas = (0, import_react5.createElement)("canvas", {
      key: "canvas",
      id: id || "deckgl-overlay",
      ref: canvasRef,
      style: canvasStyle
    });
    thisRef.control = (0, import_react5.createElement)("div", { id: `${id || "deckgl"}-wrapper`, ref: containerRef, style: containerStyle }, [canvas, childrenUnderViews]);
  }
  inRender = false;
  return thisRef.control;
}
var DeckGL = React2.forwardRef(DeckGLWithRef);
var deckgl_default = DeckGL;

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var o;
var r;
var f;
var e;
var c;
var s;
var a;
var h = {};
var v = [];
var p = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var y = Array.isArray;
function d(n2, l2) {
  for (var u3 in l2) n2[u3] = l2[u3];
  return n2;
}
function w(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u3, t2) {
  var i3, o2, r2, f3 = {};
  for (r2 in u3) "key" == r2 ? i3 = u3[r2] : "ref" == r2 ? o2 = u3[r2] : f3[r2] = u3[r2];
  if (arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (r2 in l2.defaultProps) void 0 === f3[r2] && (f3[r2] = l2.defaultProps[r2]);
  return g(l2, f3, i3, o2, null);
}
function g(n2, t2, i3, o2, r2) {
  var f3 = { type: n2, props: t2, key: i3, ref: o2, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == r2 ? ++u : r2, __i: -1, __u: 0 };
  return null == r2 && null != l.vnode && l.vnode(f3), f3;
}
function b(n2) {
  return n2.children;
}
function k(n2, l2) {
  this.props = n2, this.context = l2;
}
function x(n2, l2) {
  if (null == l2) return n2.__ ? x(n2.__, n2.__i + 1) : null;
  for (var u3; l2 < n2.__k.length; l2++) if (null != (u3 = n2.__k[l2]) && null != u3.__e) return u3.__e;
  return "function" == typeof n2.type ? x(n2) : null;
}
function C(n2) {
  var l2, u3;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u3 = n2.__k[l2]) && null != u3.__e) {
      n2.__e = n2.__c.base = u3.__e;
      break;
    }
    return C(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !P.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(P);
}
function P() {
  var n2, u3, t2, o2, r2, e2, c2, s2;
  for (i.sort(f); n2 = i.shift(); ) n2.__d && (u3 = i.length, o2 = void 0, e2 = (r2 = (t2 = n2).__v).__e, c2 = [], s2 = [], t2.__P && ((o2 = d({}, r2)).__v = r2.__v + 1, l.vnode && l.vnode(o2), O(t2.__P, o2, r2, t2.__n, t2.__P.namespaceURI, 32 & r2.__u ? [e2] : null, c2, null == e2 ? x(r2) : e2, !!(32 & r2.__u), s2), o2.__v = r2.__v, o2.__.__k[o2.__i] = o2, j(c2, o2, s2), o2.__e != e2 && C(o2)), i.length > u3 && i.sort(f));
  P.__r = 0;
}
function S(n2, l2, u3, t2, i3, o2, r2, f3, e2, c2, s2) {
  var a2, p2, y2, d2, w2, _2 = t2 && t2.__k || v, g2 = l2.length;
  for (u3.__d = e2, $(u3, l2, _2), e2 = u3.__d, a2 = 0; a2 < g2; a2++) null != (y2 = u3.__k[a2]) && (p2 = -1 === y2.__i ? h : _2[y2.__i] || h, y2.__i = a2, O(n2, y2, p2, i3, o2, r2, f3, e2, c2, s2), d2 = y2.__e, y2.ref && p2.ref != y2.ref && (p2.ref && N(p2.ref, null, y2), s2.push(y2.ref, y2.__c || d2, y2)), null == w2 && null != d2 && (w2 = d2), 65536 & y2.__u || p2.__k === y2.__k ? e2 = I(y2, e2, n2) : "function" == typeof y2.type && void 0 !== y2.__d ? e2 = y2.__d : d2 && (e2 = d2.nextSibling), y2.__d = void 0, y2.__u &= -196609);
  u3.__d = e2, u3.__e = w2;
}
function $(n2, l2, u3) {
  var t2, i3, o2, r2, f3, e2 = l2.length, c2 = u3.length, s2 = c2, a2 = 0;
  for (n2.__k = [], t2 = 0; t2 < e2; t2++) null != (i3 = l2[t2]) && "boolean" != typeof i3 && "function" != typeof i3 ? (r2 = t2 + a2, (i3 = n2.__k[t2] = "string" == typeof i3 || "number" == typeof i3 || "bigint" == typeof i3 || i3.constructor == String ? g(null, i3, null, null, null) : y(i3) ? g(b, { children: i3 }, null, null, null) : void 0 === i3.constructor && i3.__b > 0 ? g(i3.type, i3.props, i3.key, i3.ref ? i3.ref : null, i3.__v) : i3).__ = n2, i3.__b = n2.__b + 1, o2 = null, -1 !== (f3 = i3.__i = L(i3, u3, r2, s2)) && (s2--, (o2 = u3[f3]) && (o2.__u |= 131072)), null == o2 || null === o2.__v ? (-1 == f3 && a2--, "function" != typeof i3.type && (i3.__u |= 65536)) : f3 !== r2 && (f3 == r2 - 1 ? a2-- : f3 == r2 + 1 ? a2++ : (f3 > r2 ? a2-- : a2++, i3.__u |= 65536))) : i3 = n2.__k[t2] = null;
  if (s2) for (t2 = 0; t2 < c2; t2++) null != (o2 = u3[t2]) && 0 == (131072 & o2.__u) && (o2.__e == n2.__d && (n2.__d = x(o2)), V(o2, o2));
}
function I(n2, l2, u3) {
  var t2, i3;
  if ("function" == typeof n2.type) {
    for (t2 = n2.__k, i3 = 0; t2 && i3 < t2.length; i3++) t2[i3] && (t2[i3].__ = n2, l2 = I(t2[i3], l2, u3));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !u3.contains(l2) && (l2 = x(n2)), u3.insertBefore(n2.__e, l2 || null), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 === l2.nodeType);
  return l2;
}
function L(n2, l2, u3, t2) {
  var i3 = n2.key, o2 = n2.type, r2 = u3 - 1, f3 = u3 + 1, e2 = l2[u3];
  if (null === e2 || e2 && i3 == e2.key && o2 === e2.type && 0 == (131072 & e2.__u)) return u3;
  if (t2 > (null != e2 && 0 == (131072 & e2.__u) ? 1 : 0)) for (; r2 >= 0 || f3 < l2.length; ) {
    if (r2 >= 0) {
      if ((e2 = l2[r2]) && 0 == (131072 & e2.__u) && i3 == e2.key && o2 === e2.type) return r2;
      r2--;
    }
    if (f3 < l2.length) {
      if ((e2 = l2[f3]) && 0 == (131072 & e2.__u) && i3 == e2.key && o2 === e2.type) return f3;
      f3++;
    }
  }
  return -1;
}
function T(n2, l2, u3) {
  "-" === l2[0] ? n2.setProperty(l2, null == u3 ? "" : u3) : n2[l2] = null == u3 ? "" : "number" != typeof u3 || p.test(l2) ? u3 : u3 + "px";
}
function A(n2, l2, u3, t2, i3) {
  var o2;
  n: if ("style" === l2) if ("string" == typeof u3) n2.style.cssText = u3;
  else {
    if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u3 && l2 in u3 || T(n2.style, l2, "");
    if (u3) for (l2 in u3) t2 && u3[l2] === t2[l2] || T(n2.style, l2, u3[l2]);
  }
  else if ("o" === l2[0] && "n" === l2[1]) o2 = l2 !== (l2 = l2.replace(/(PointerCapture)$|Capture$/i, "$1")), l2 = l2.toLowerCase() in n2 || "onFocusOut" === l2 || "onFocusIn" === l2 ? l2.toLowerCase().slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + o2] = u3, u3 ? t2 ? u3.u = t2.u : (u3.u = e, n2.addEventListener(l2, o2 ? s : c, o2)) : n2.removeEventListener(l2, o2 ? s : c, o2);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u3 ? "" : u3;
      break n;
    } catch (n3) {
    }
    "function" == typeof u3 || (null == u3 || false === u3 && "-" !== l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u3 ? "" : u3));
  }
}
function F(n2) {
  return function(u3) {
    if (this.l) {
      var t2 = this.l[u3.type + n2];
      if (null == u3.t) u3.t = e++;
      else if (u3.t < t2.u) return;
      return t2(l.event ? l.event(u3) : u3);
    }
  };
}
function O(n2, u3, t2, i3, o2, r2, f3, e2, c2, s2) {
  var a2, h2, v2, p2, w2, _2, g2, m, x2, C2, M2, P2, $2, I2, H, L2, T2 = u3.type;
  if (void 0 !== u3.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), r2 = [e2 = u3.__e = t2.__e]), (a2 = l.__b) && a2(u3);
  n: if ("function" == typeof T2) try {
    if (m = u3.props, x2 = "prototype" in T2 && T2.prototype.render, C2 = (a2 = T2.contextType) && i3[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i3, t2.__c ? g2 = (h2 = u3.__c = t2.__c).__ = h2.__E : (x2 ? u3.__c = h2 = new T2(m, M2) : (u3.__c = h2 = new k(m, M2), h2.constructor = T2, h2.render = q), C2 && C2.sub(h2), h2.props = m, h2.state || (h2.state = {}), h2.context = M2, h2.__n = i3, v2 = h2.__d = true, h2.__h = [], h2._sb = []), x2 && null == h2.__s && (h2.__s = h2.state), x2 && null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = d({}, h2.__s)), d(h2.__s, T2.getDerivedStateFromProps(m, h2.__s))), p2 = h2.props, w2 = h2.state, h2.__v = u3, v2) x2 && null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), x2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (x2 && null == T2.getDerivedStateFromProps && m !== p2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(m, M2), !h2.__e && (null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(m, h2.__s, M2) || u3.__v === t2.__v)) {
        for (u3.__v !== t2.__v && (h2.props = m, h2.state = h2.__s, h2.__d = false), u3.__e = t2.__e, u3.__k = t2.__k, u3.__k.some(function(n3) {
          n3 && (n3.__ = u3);
        }), P2 = 0; P2 < h2._sb.length; P2++) h2.__h.push(h2._sb[P2]);
        h2._sb = [], h2.__h.length && f3.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(m, h2.__s, M2), x2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(p2, w2, _2);
      });
    }
    if (h2.context = M2, h2.props = m, h2.__P = n2, h2.__e = false, $2 = l.__r, I2 = 0, x2) {
      for (h2.state = h2.__s, h2.__d = false, $2 && $2(u3), a2 = h2.render(h2.props, h2.state, h2.context), H = 0; H < h2._sb.length; H++) h2.__h.push(h2._sb[H]);
      h2._sb = [];
    } else do {
      h2.__d = false, $2 && $2(u3), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++I2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i3 = d(d({}, i3), h2.getChildContext())), x2 && !v2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(p2, w2)), S(n2, y(L2 = null != a2 && a2.type === b && null == a2.key ? a2.props.children : a2) ? L2 : [L2], u3, t2, i3, o2, r2, f3, e2, c2, s2), h2.base = u3.__e, u3.__u &= -161, h2.__h.length && f3.push(h2), g2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u3.__v = null, c2 || null != r2) {
      for (u3.__u |= c2 ? 160 : 32; e2 && 8 === e2.nodeType && e2.nextSibling; ) e2 = e2.nextSibling;
      r2[r2.indexOf(e2)] = null, u3.__e = e2;
    } else u3.__e = t2.__e, u3.__k = t2.__k;
    l.__e(n3, u3, t2);
  }
  else null == r2 && u3.__v === t2.__v ? (u3.__k = t2.__k, u3.__e = t2.__e) : u3.__e = z(t2.__e, u3, t2, i3, o2, r2, f3, c2, s2);
  (a2 = l.diffed) && a2(u3);
}
function j(n2, u3, t2) {
  u3.__d = void 0;
  for (var i3 = 0; i3 < t2.length; i3++) N(t2[i3], t2[++i3], t2[++i3]);
  l.__c && l.__c(u3, n2), n2.some(function(u4) {
    try {
      n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
        n3.call(u4);
      });
    } catch (n3) {
      l.__e(n3, u4.__v);
    }
  });
}
function z(u3, t2, i3, o2, r2, f3, e2, c2, s2) {
  var a2, v2, p2, d2, _2, g2, m, b2 = i3.props, k2 = t2.props, C2 = t2.type;
  if ("svg" === C2 ? r2 = "http://www.w3.org/2000/svg" : "math" === C2 ? r2 = "http://www.w3.org/1998/Math/MathML" : r2 || (r2 = "http://www.w3.org/1999/xhtml"), null != f3) {
    for (a2 = 0; a2 < f3.length; a2++) if ((_2 = f3[a2]) && "setAttribute" in _2 == !!C2 && (C2 ? _2.localName === C2 : 3 === _2.nodeType)) {
      u3 = _2, f3[a2] = null;
      break;
    }
  }
  if (null == u3) {
    if (null === C2) return document.createTextNode(k2);
    u3 = document.createElementNS(r2, C2, k2.is && k2), c2 && (l.__m && l.__m(t2, f3), c2 = false), f3 = null;
  }
  if (null === C2) b2 === k2 || c2 && u3.data === k2 || (u3.data = k2);
  else {
    if (f3 = f3 && n.call(u3.childNodes), b2 = i3.props || h, !c2 && null != f3) for (b2 = {}, a2 = 0; a2 < u3.attributes.length; a2++) b2[(_2 = u3.attributes[a2]).name] = _2.value;
    for (a2 in b2) if (_2 = b2[a2], "children" == a2) ;
    else if ("dangerouslySetInnerHTML" == a2) p2 = _2;
    else if (!(a2 in k2)) {
      if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
      A(u3, a2, null, _2, r2);
    }
    for (a2 in k2) _2 = k2[a2], "children" == a2 ? d2 = _2 : "dangerouslySetInnerHTML" == a2 ? v2 = _2 : "value" == a2 ? g2 = _2 : "checked" == a2 ? m = _2 : c2 && "function" != typeof _2 || b2[a2] === _2 || A(u3, a2, _2, b2[a2], r2);
    if (v2) c2 || p2 && (v2.__html === p2.__html || v2.__html === u3.innerHTML) || (u3.innerHTML = v2.__html), t2.__k = [];
    else if (p2 && (u3.innerHTML = ""), S(u3, y(d2) ? d2 : [d2], t2, i3, o2, "foreignObject" === C2 ? "http://www.w3.org/1999/xhtml" : r2, f3, e2, f3 ? f3[0] : i3.__k && x(i3, 0), c2, s2), null != f3) for (a2 = f3.length; a2--; ) w(f3[a2]);
    c2 || (a2 = "value", "progress" === C2 && null == g2 ? u3.removeAttribute("value") : void 0 !== g2 && (g2 !== u3[a2] || "progress" === C2 && !g2 || "option" === C2 && g2 !== b2[a2]) && A(u3, a2, g2, b2[a2], r2), a2 = "checked", void 0 !== m && m !== u3[a2] && A(u3, a2, m, b2[a2], r2));
  }
  return u3;
}
function N(n2, u3, t2) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == u3 || (n2.__u = n2(u3));
    } else n2.current = u3;
  } catch (n3) {
    l.__e(n3, t2);
  }
}
function V(n2, u3, t2) {
  var i3, o2;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current !== n2.__e || N(i3, null, u3)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, u3);
    }
    i3.base = i3.__P = null;
  }
  if (i3 = n2.__k) for (o2 = 0; o2 < i3.length; o2++) i3[o2] && V(i3[o2], u3, t2 || "function" != typeof n2.type);
  t2 || w(n2.__e), n2.__c = n2.__ = n2.__e = n2.__d = void 0;
}
function q(n2, l2, u3) {
  return this.constructor(n2, u3);
}
function B(u3, t2, i3) {
  var o2, r2, f3, e2;
  l.__ && l.__(u3, t2), r2 = (o2 = "function" == typeof i3) ? null : i3 && i3.__k || t2.__k, f3 = [], e2 = [], O(t2, u3 = (!o2 && i3 || t2).__k = _(b, null, [u3]), r2 || h, h, t2.namespaceURI, !o2 && i3 ? [i3] : r2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, f3, !o2 && i3 ? i3 : r2 ? r2.__e : t2.firstChild, o2, e2), j(f3, u3, e2);
}
n = v.slice, l = { __e: function(n2, l2, u3, t2) {
  for (var i3, o2, r2; l2 = l2.__; ) if ((i3 = l2.__c) && !i3.__) try {
    if ((o2 = i3.constructor) && null != o2.getDerivedStateFromError && (i3.setState(o2.getDerivedStateFromError(n2)), r2 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t2 || {}), r2 = i3.__d), r2) return i3.__E = i3;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && null == n2.constructor;
}, k.prototype.setState = function(n2, l2) {
  var u3;
  u3 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = d({}, this.state), "function" == typeof n2 && (n2 = n2(d({}, u3), this.props)), n2 && d(u3, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M(this));
}, k.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, k.prototype.render = b, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, P.__r = 0, e = 0, c = F(false), s = F(true), a = 0;

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f2 = 0;
var i2 = Array.isArray;
function u2(e2, t2, n2, o2, i3, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i3, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// node_modules/@deck.gl/widgets/dist/components.js
var IconButton = (props) => {
  const { className, label, onClick } = props;
  return u2("div", { className: "deck-widget-button", children: u2("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick, title: label, children: u2("div", { className: "deck-widget-icon" }) }) });
};
var ButtonGroup = (props) => {
  const { children, orientation } = props;
  return u2("div", { className: `deck-widget-button-group ${orientation}`, children });
};
var GroupedIconButton = (props) => {
  const { className, label, onClick } = props;
  return u2("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick, title: label, children: u2("div", { className: "deck-widget-icon" }) });
};

// node_modules/@deck.gl/widgets/dist/fullscreen-widget.js
var FullscreenWidget = class {
  constructor(props) {
    this.id = "fullscreen";
    this.placement = "top-left";
    this.fullscreen = false;
    this.id = props.id || "fullscreen";
    this.placement = props.placement || "top-left";
    props.enterLabel = props.enterLabel || "Enter Fullscreen";
    props.exitLabel = props.exitLabel || "Exit Fullscreen";
    props.style = props.style || {};
    this.props = props;
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const el = document.createElement("div");
    el.classList.add("deck-widget", "deck-widget-fullscreen");
    if (className)
      el.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => el.style.setProperty(key, value));
    }
    this.deck = deck;
    this.element = el;
    this.update();
    document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
    return el;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
    document.removeEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
  }
  update() {
    const { enterLabel, exitLabel } = this.props;
    const el = this.element;
    if (!el) {
      return;
    }
    const ui = u2(IconButton, { onClick: this.handleClick.bind(this), label: this.fullscreen ? exitLabel : enterLabel, className: this.fullscreen ? "deck-widget-fullscreen-exit" : "deck-widget-fullscreen-enter" });
    B(ui, el);
  }
  setProps(props) {
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className)
          el.classList.remove(oldProps.className);
        if (props.className)
          el.classList.add(props.className);
      }
      if (!deepEqual(oldProps.style, props.style, 1)) {
        if (oldProps.style) {
          Object.entries(oldProps.style).map(([key]) => el.style.removeProperty(key));
        }
        if (props.style) {
          Object.entries(props.style).map(([key, value]) => el.style.setProperty(key, value));
        }
      }
    }
    Object.assign(this.props, props);
  }
  getContainer() {
    var _a, _b;
    return this.props.container || ((_b = (_a = this.deck) == null ? void 0 : _a.getCanvas()) == null ? void 0 : _b.parentElement);
  }
  onFullscreenChange() {
    const prevFullscreen = this.fullscreen;
    const fullscreen = document.fullscreenElement === this.getContainer();
    if (prevFullscreen !== fullscreen) {
      this.fullscreen = !this.fullscreen;
    }
    this.update();
  }
  async handleClick() {
    if (this.fullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    this.update();
  }
  async requestFullscreen() {
    const container = this.getContainer();
    if (container == null ? void 0 : container.requestFullscreen) {
      await container.requestFullscreen({ navigationUI: "hide" });
    } else {
      this.togglePseudoFullscreen();
    }
  }
  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      this.togglePseudoFullscreen();
    }
  }
  togglePseudoFullscreen() {
    var _a;
    (_a = this.getContainer()) == null ? void 0 : _a.classList.toggle("deck-pseudo-fullscreen");
  }
};

// node_modules/@deck.gl/widgets/dist/compass-widget.js
var CompassWidget = class {
  constructor(props) {
    this.id = "compass";
    this.placement = "top-left";
    this.viewId = null;
    this.viewports = {};
    this.id = props.id || "compass";
    this.viewId = props.viewId || null;
    this.placement = props.placement || "top-left";
    props.transitionDuration = props.transitionDuration || 200;
    props.label = props.label || "Compass";
    props.style = props.style || {};
    this.props = props;
  }
  setProps(props) {
    Object.assign(this.props, props);
  }
  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
    this.update();
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-compass");
    if (className)
      element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => element.style.setProperty(key, value));
    }
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }
  getRotation(viewport) {
    if (viewport instanceof web_mercator_viewport_default) {
      return [-viewport.bearing, viewport.pitch];
    } else if (viewport instanceof GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, viewport.latitude))];
    }
    return [0, 0];
  }
  update() {
    var _a;
    const viewId = this.viewId || ((_a = Object.values(this.viewports)[0]) == null ? void 0 : _a.id) || "default-view";
    const viewport = this.viewports[viewId];
    const [rz, rx] = this.getRotation(viewport);
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = u2("div", { className: "deck-widget-button", style: { perspective: 100 }, children: u2("button", { type: "button", onClick: () => {
      for (const viewport2 of Object.values(this.viewports)) {
        this.handleCompassReset(viewport2);
      }
    }, label: this.props.label, style: { transform: `rotateX(${rx}deg)` }, children: u2("svg", { fill: "none", width: "100%", height: "100%", viewBox: "0 0 26 26", children: u2("g", { transform: `rotate(${rz},13,13)`, children: [u2("path", { d: "M10 13.0001L12.9999 5L15.9997 13.0001H10Z", fill: "var(--icon-compass-north-color, #F05C44)" }), u2("path", { d: "M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z", fill: "var(--icon-compass-south-color, #C2C2CC)" })] }) }) }) });
    B(ui, element);
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  handleCompassReset(viewport) {
    const viewId = this.viewId || viewport.id || "default-view";
    if (viewport instanceof web_mercator_viewport_default) {
      const nextViewState = {
        ...viewport,
        bearing: 0,
        ...this.getRotation(viewport)[0] === 0 ? { pitch: 0 } : {},
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new FlyToInterpolator()
      };
      this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
    }
  }
};

// node_modules/@deck.gl/widgets/dist/zoom-widget.js
var ZoomWidget = class {
  constructor(props) {
    this.id = "zoom";
    this.placement = "top-left";
    this.orientation = "vertical";
    this.viewId = null;
    this.viewports = {};
    this.id = props.id || "zoom";
    this.viewId = props.viewId || null;
    this.placement = props.placement || "top-left";
    this.orientation = props.orientation || "vertical";
    props.transitionDuration = props.transitionDuration || 200;
    props.zoomInLabel = props.zoomInLabel || "Zoom In";
    props.zoomOutLabel = props.zoomOutLabel || "Zoom Out";
    props.style = props.style || {};
    this.props = props;
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-zoom");
    if (className)
      element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => element.style.setProperty(key, value));
    }
    const ui = u2(ButtonGroup, { orientation: this.orientation, children: [u2(GroupedIconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), u2(GroupedIconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] });
    B(ui, element);
    this.deck = deck;
    this.element = element;
    return element;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  setProps(props) {
    Object.assign(this.props, props);
  }
  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }
  handleZoom(viewport, nextZoom) {
    const viewId = this.viewId || (viewport == null ? void 0 : viewport.id) || "default-view";
    const nextViewState = {
      ...viewport,
      zoom: nextZoom,
      transitionDuration: this.props.transitionDuration,
      transitionInterpolator: new FlyToInterpolator()
    };
    this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
  }
  handleZoomIn() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom + 1);
    }
  }
  handleZoomOut() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom - 1);
    }
  }
};
export {
  AGGREGATION_OPERATION,
  AmbientLight,
  arc_layer_default as ArcLayer,
  Attribute,
  AttributeManager,
  bitmap_layer_default as BitmapLayer,
  COORDINATE_SYSTEM,
  cpu_grid_layer_default as CPUGridLayer,
  column_layer_default as ColumnLayer,
  CompassWidget,
  composite_layer_default as CompositeLayer,
  contour_layer_default as ContourLayer,
  Controller,
  deck_default as Deck,
  deckgl_default as DeckGL,
  DeckRenderer,
  DirectionalLight,
  FirstPersonController,
  first_person_view_default as FirstPersonView,
  FirstPersonViewport,
  FlyToInterpolator,
  FullscreenWidget,
  gpu_grid_layer_default as GPUGridLayer,
  geojson_layer_default as GeoJsonLayer,
  geohash_layer_default as GeohashLayer,
  great_circle_layer_default as GreatCircleLayer,
  grid_cell_layer_default as GridCellLayer,
  grid_layer_default as GridLayer,
  h3_cluster_layer_default as H3ClusterLayer,
  h3_hexagon_layer_default as H3HexagonLayer,
  heatmap_layer_default as HeatmapLayer,
  hexagon_layer_default as HexagonLayer,
  icon_layer_default as IconLayer,
  layer_default as Layer,
  layer_extension_default as LayerExtension,
  LayerManager,
  LightingEffect,
  line_layer_default as LineLayer,
  LinearInterpolator,
  mvt_layer_default as MVTLayer,
  MapController,
  map_view_default as MapView,
  OPERATION,
  OrbitController,
  orbit_view_default as OrbitView,
  OrbitViewport,
  OrthographicController,
  orthographic_view_default as OrthographicView,
  OrthographicViewport,
  path_layer_default as PathLayer,
  point_cloud_layer_default as PointCloudLayer,
  PointLight,
  polygon_layer_default as PolygonLayer,
  PostProcessEffect,
  quadkey_layer_default as QuadkeyLayer,
  s2_layer_default as S2Layer,
  scatterplot_layer_default as ScatterplotLayer,
  scenegraph_layer_default as ScenegraphLayer,
  screen_grid_layer_default as ScreenGridLayer,
  simple_mesh_layer_default as SimpleMeshLayer,
  solid_polygon_layer_default as SolidPolygonLayer,
  TRANSITION_EVENTS,
  terrain_layer_default as TerrainLayer,
  Tesselator,
  text_layer_default as TextLayer,
  tile_3d_layer_default as Tile3DLayer,
  tile_layer_default as TileLayer,
  TransitionInterpolator,
  trips_layer_default as TripsLayer,
  UNIT,
  VERSION,
  View,
  viewport_default as Viewport,
  web_mercator_viewport_default as WebMercatorViewport,
  ZoomWidget,
  GlobeController as _GlobeController,
  globe_view_default as _GlobeView,
  GlobeViewport as _GlobeViewport,
  Tileset2D as _Tileset2D,
  assert,
  createIterable,
  deckgl_default as default,
  fp64LowPart,
  getShaderAssembler,
  gouraudLighting,
  log_default as log,
  phongLighting,
  picking_default as picking,
  project_default as project,
  project32_default as project32,
  shadow_default as shadow
};
//# sourceMappingURL=deck__gl.js.map
