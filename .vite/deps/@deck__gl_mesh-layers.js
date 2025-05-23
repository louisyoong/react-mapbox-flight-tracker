import {
  COORDINATE_SYSTEM,
  Geometry,
  GroupNode,
  ImageLoader,
  Matrix3,
  Matrix4,
  Model,
  ModelNode,
  Quaternion,
  ScenegraphNode,
  Texture,
  Vector3,
  assert,
  copyToArray,
  createIterable,
  deduceMeshField,
  getBinaryImageMetadata,
  getImageData,
  getJSModuleOrNull,
  getMeshBoundingBox,
  isImageFormatSupported,
  layer_default,
  loadLibrary,
  log,
  log_default,
  padToNBytes,
  parseFromContext,
  parseJSON,
  pbrMaterial,
  phongMaterial,
  picking_default,
  project32_default,
  registerJSModules,
  sliceArrayBuffer
} from "./chunk-UUN2JTKM.js";
import {
  __export,
  __publicField
} from "./chunk-DC5AMYBS.js";

// node_modules/@deck.gl/mesh-layers/dist/utils/matrix.js
var RADIAN_PER_DEGREE = Math.PI / 180;
var modelMatrix = new Float32Array(16);
var valueArray = new Float32Array(12);
function calculateTransformMatrix(targetMatrix, orientation, scale) {
  const pitch = orientation[0] * RADIAN_PER_DEGREE;
  const yaw = orientation[1] * RADIAN_PER_DEGREE;
  const roll = orientation[2] * RADIAN_PER_DEGREE;
  const sr = Math.sin(roll);
  const sp = Math.sin(pitch);
  const sw = Math.sin(yaw);
  const cr = Math.cos(roll);
  const cp = Math.cos(pitch);
  const cw = Math.cos(yaw);
  const scx = scale[0];
  const scy = scale[1];
  const scz = scale[2];
  targetMatrix[0] = scx * cw * cp;
  targetMatrix[1] = scx * sw * cp;
  targetMatrix[2] = scx * -sp;
  targetMatrix[3] = scy * (-sw * cr + cw * sp * sr);
  targetMatrix[4] = scy * (cw * cr + sw * sp * sr);
  targetMatrix[5] = scy * cp * sr;
  targetMatrix[6] = scz * (sw * sr + cw * sp * cr);
  targetMatrix[7] = scz * (-cw * sr + sw * sp * cr);
  targetMatrix[8] = scz * cp * cr;
}
function getExtendedMat3FromMat4(mat4) {
  mat4[0] = mat4[0];
  mat4[1] = mat4[1];
  mat4[2] = mat4[2];
  mat4[3] = mat4[4];
  mat4[4] = mat4[5];
  mat4[5] = mat4[6];
  mat4[6] = mat4[8];
  mat4[7] = mat4[9];
  mat4[8] = mat4[10];
  mat4[9] = mat4[12];
  mat4[10] = mat4[13];
  mat4[11] = mat4[14];
  return mat4.subarray(0, 12);
}
var MATRIX_ATTRIBUTES = {
  size: 12,
  accessor: ["getOrientation", "getScale", "getTranslation", "getTransformMatrix"],
  shaderAttributes: {
    instanceModelMatrixCol0: {
      size: 3,
      elementOffset: 0
    },
    instanceModelMatrixCol1: {
      size: 3,
      elementOffset: 3
    },
    instanceModelMatrixCol2: {
      size: 3,
      elementOffset: 6
    },
    instanceTranslation: {
      size: 3,
      elementOffset: 9
    }
  },
  update(attribute, { startRow, endRow }) {
    const { data, getOrientation, getScale, getTranslation, getTransformMatrix } = this.props;
    const arrayMatrix = Array.isArray(getTransformMatrix);
    const constantMatrix = arrayMatrix && getTransformMatrix.length === 16;
    const constantScale = Array.isArray(getScale);
    const constantOrientation = Array.isArray(getOrientation);
    const constantTranslation = Array.isArray(getTranslation);
    const hasMatrix = constantMatrix || !arrayMatrix && Boolean(getTransformMatrix(data[0]));
    if (hasMatrix) {
      attribute.constant = constantMatrix;
    } else {
      attribute.constant = constantOrientation && constantScale && constantTranslation;
    }
    const instanceModelMatrixData = attribute.value;
    if (attribute.constant) {
      let matrix;
      if (hasMatrix) {
        modelMatrix.set(getTransformMatrix);
        matrix = getExtendedMat3FromMat4(modelMatrix);
      } else {
        matrix = valueArray;
        const orientation = getOrientation;
        const scale = getScale;
        calculateTransformMatrix(matrix, orientation, scale);
        matrix.set(getTranslation, 9);
      }
      attribute.value = new Float32Array(matrix);
    } else {
      let i = startRow * attribute.size;
      const { iterable, objectInfo } = createIterable(data, startRow, endRow);
      for (const object of iterable) {
        objectInfo.index++;
        let matrix;
        if (hasMatrix) {
          modelMatrix.set(constantMatrix ? getTransformMatrix : getTransformMatrix(object, objectInfo));
          matrix = getExtendedMat3FromMat4(modelMatrix);
        } else {
          matrix = valueArray;
          const orientation = constantOrientation ? getOrientation : getOrientation(object, objectInfo);
          const scale = constantScale ? getScale : getScale(object, objectInfo);
          calculateTransformMatrix(matrix, orientation, scale);
          matrix.set(constantTranslation ? getTranslation : getTranslation(object, objectInfo), 9);
        }
        instanceModelMatrixData[i++] = matrix[0];
        instanceModelMatrixData[i++] = matrix[1];
        instanceModelMatrixData[i++] = matrix[2];
        instanceModelMatrixData[i++] = matrix[3];
        instanceModelMatrixData[i++] = matrix[4];
        instanceModelMatrixData[i++] = matrix[5];
        instanceModelMatrixData[i++] = matrix[6];
        instanceModelMatrixData[i++] = matrix[7];
        instanceModelMatrixData[i++] = matrix[8];
        instanceModelMatrixData[i++] = matrix[9];
        instanceModelMatrixData[i++] = matrix[10];
        instanceModelMatrixData[i++] = matrix[11];
      }
    }
  }
};
function shouldComposeModelMatrix(viewport, coordinateSystem) {
  return coordinateSystem === COORDINATE_SYSTEM.CARTESIAN || coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS || coordinateSystem === COORDINATE_SYSTEM.DEFAULT && !viewport.isGeospatial;
}

// node_modules/@deck.gl/mesh-layers/dist/simple-mesh-layer/simple-mesh-layer-uniforms.js
var uniformBlock = `uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;
var simpleMeshUniforms = {
  name: "simpleMesh",
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    sizeScale: "f32",
    composeModelMatrix: "f32",
    hasTexture: "f32",
    flatShading: "f32"
  }
};

// node_modules/@deck.gl/mesh-layers/dist/simple-mesh-layer/simple-mesh-layer-vertex.glsl.js
var simple_mesh_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-vs
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = texCoords;
geometry.pickingColor = instancePickingColors;
vTexCoord = texCoords;
cameraPosition = project.cameraPosition;
vColor = vec4(colors * instanceColors.rgb, instanceColors.a);
mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
vec3 pos = (instanceModelMatrix * positions) * simpleMesh.sizeScale + instanceTranslation;
if (simpleMesh.composeModelMatrix) {
DECKGL_FILTER_SIZE(pos, geometry);
normals_commonspace = project_normal(instanceModelMatrix * normals);
geometry.worldPosition += pos;
gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
geometry.position = position_commonspace;
}
else {
pos = project_size(pos);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
geometry.position = position_commonspace;
normals_commonspace = project_normal(instanceModelMatrix * normals);
}
geometry.normal = normals_commonspace;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// node_modules/@deck.gl/mesh-layers/dist/simple-mesh-layer/simple-mesh-layer-fragment.glsl.js
var simple_mesh_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-fs
precision highp float;
uniform sampler2D sampler;
in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
geometry.uv = vTexCoord;
vec3 normal;
if (simpleMesh.flatShading) {
normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
} else {
normal = normals_commonspace;
}
vec4 color = simpleMesh.hasTexture ? texture(sampler, vTexCoord) : vColor;
DECKGL_FILTER_COLOR(color, geometry);
vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
fragColor = vec4(lightColor, color.a * layer.opacity);
}
`;

// node_modules/@deck.gl/mesh-layers/dist/simple-mesh-layer/simple-mesh-layer.js
function normalizeGeometryAttributes(attributes) {
  const positionAttribute = attributes.positions || attributes.POSITION;
  log_default.assert(positionAttribute, 'no "postions" or "POSITION" attribute in mesh');
  const vertexCount = positionAttribute.value.length / positionAttribute.size;
  let colorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!colorAttribute) {
    colorAttribute = { size: 3, value: new Float32Array(vertexCount * 3).fill(1) };
  }
  let normalAttribute = attributes.NORMAL || attributes.normals;
  if (!normalAttribute) {
    normalAttribute = { size: 3, value: new Float32Array(vertexCount * 3).fill(0) };
  }
  let texCoordAttribute = attributes.TEXCOORD_0 || attributes.texCoords;
  if (!texCoordAttribute) {
    texCoordAttribute = { size: 2, value: new Float32Array(vertexCount * 2).fill(0) };
  }
  return {
    positions: positionAttribute,
    colors: colorAttribute,
    normals: normalAttribute,
    texCoords: texCoordAttribute
  };
}
function getGeometry(data) {
  if (data instanceof Geometry) {
    data.attributes = normalizeGeometryAttributes(data.attributes);
    return data;
  } else if (data.attributes) {
    return new Geometry({
      ...data,
      topology: "triangle-list",
      attributes: normalizeGeometryAttributes(data.attributes)
    });
  } else {
    return new Geometry({
      topology: "triangle-list",
      attributes: normalizeGeometryAttributes(data)
    });
  }
}
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps = {
  mesh: { type: "object", value: null, async: true },
  texture: { type: "image", value: null, async: true },
  sizeScale: { type: "number", value: 1, min: 0 },
  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR },
  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: { type: "accessor", value: [0, 0, 0] },
  getScale: { type: "accessor", value: [1, 1, 1] },
  getTranslation: { type: "accessor", value: [0, 0, 0] },
  // 4x4 matrix
  getTransformMatrix: { type: "accessor", value: [] },
  textureParameters: { type: "object", ignore: true, value: null }
};
var SimpleMeshLayer = class extends layer_default {
  getShaders() {
    return super.getShaders({
      vs: simple_mesh_layer_vertex_glsl_default,
      fs: simple_mesh_layer_fragment_glsl_default,
      modules: [project32_default, phongMaterial, picking_default, simpleMeshUniforms]
    });
  }
  getBounds() {
    var _a;
    if (this.props._instanced) {
      return super.getBounds();
    }
    let result = this.state.positionBounds;
    if (result) {
      return result;
    }
    const { mesh } = this.props;
    if (!mesh) {
      return null;
    }
    result = (_a = mesh.header) == null ? void 0 : _a.boundingBox;
    if (!result) {
      const { attributes } = getGeometry(mesh);
      attributes.POSITION = attributes.POSITION || attributes.positions;
      result = getMeshBoundingBox(attributes);
    }
    this.state.positionBounds = result;
    return result;
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        transition: true,
        type: "float64",
        fp64: this.use64bitPositions(),
        size: 3,
        accessor: "getPosition"
      },
      instanceColors: {
        type: "unorm8",
        transition: true,
        size: this.props.colorFormat.length,
        accessor: "getColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    if (props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      this.state.positionBounds = null;
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh);
        const attributes = props.mesh.attributes || props.mesh;
        this.setState({
          hasNormals: Boolean(attributes.NORMAL || attributes.normals)
        });
      }
      this.getAttributeManager().invalidateAll();
    }
    if (props.texture !== oldProps.texture && props.texture instanceof Texture) {
      this.setTexture(props.texture);
    }
    if (this.state.model) {
      this.state.model.setTopology(this.props.wireframe ? "line-strip" : "triangle-list");
    }
  }
  finalizeState(context) {
    super.finalizeState(context);
    this.state.emptyTexture.delete();
  }
  draw({ uniforms }) {
    const { model } = this.state;
    if (!model) {
      return;
    }
    const { viewport, renderPass } = this.context;
    const { sizeScale, coordinateSystem, _instanced } = this.props;
    const simpleMeshProps = {
      sizeScale,
      composeModelMatrix: !_instanced || shouldComposeModelMatrix(viewport, coordinateSystem),
      flatShading: !this.state.hasNormals
    };
    model.shaderInputs.setProps({ simpleMesh: simpleMeshProps });
    model.draw(renderPass);
  }
  get isLoaded() {
    var _a;
    return Boolean(((_a = this.state) == null ? void 0 : _a.model) && super.isLoaded);
  }
  getModel(mesh) {
    const model = new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: getGeometry(mesh),
      isInstanced: true
    });
    const { texture } = this.props;
    const { emptyTexture } = this.state;
    const simpleMeshProps = {
      sampler: texture || emptyTexture,
      hasTexture: Boolean(texture)
    };
    model.shaderInputs.setProps({ simpleMesh: simpleMeshProps });
    return model;
  }
  setTexture(texture) {
    const { emptyTexture, model } = this.state;
    if (model) {
      const simpleMeshProps = {
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      };
      model.shaderInputs.setProps({ simpleMesh: simpleMeshProps });
    }
  }
};
SimpleMeshLayer.defaultProps = defaultProps;
SimpleMeshLayer.layerName = "SimpleMeshLayer";
var simple_mesh_layer_default = SimpleMeshLayer;

// node_modules/@luma.gl/gltf/dist/pbr/parse-pbr-material.js
var GLEnum;
(function(GLEnum3) {
  GLEnum3[GLEnum3["FUNC_ADD"] = 32774] = "FUNC_ADD";
  GLEnum3[GLEnum3["ONE"] = 1] = "ONE";
  GLEnum3[GLEnum3["SRC_ALPHA"] = 770] = "SRC_ALPHA";
  GLEnum3[GLEnum3["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
  GLEnum3[GLEnum3["TEXTURE_MIN_FILTER"] = 10241] = "TEXTURE_MIN_FILTER";
  GLEnum3[GLEnum3["LINEAR"] = 9729] = "LINEAR";
  GLEnum3[GLEnum3["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
  GLEnum3[GLEnum3["UNPACK_FLIP_Y_WEBGL"] = 37440] = "UNPACK_FLIP_Y_WEBGL";
})(GLEnum || (GLEnum = {}));
function parsePBRMaterial(device, material, attributes, options) {
  const parsedMaterial = {
    defines: {
      // TODO: Use EXT_sRGB if available (Standard in WebGL 2.0)
      MANUAL_SRGB: 1,
      SRGB_FAST_APPROXIMATION: 1
    },
    bindings: {},
    uniforms: {
      // TODO: find better values?
      camera: [0, 0, 0],
      // Model should override
      metallicRoughnessValues: [1, 1]
      // Default is 1 and 1
    },
    parameters: {},
    glParameters: {},
    generatedTextures: []
  };
  parsedMaterial.defines.USE_TEX_LOD = 1;
  const { imageBasedLightingEnvironment } = options;
  if (imageBasedLightingEnvironment) {
    parsedMaterial.bindings.pbr_diffuseEnvSampler = imageBasedLightingEnvironment.diffuseEnvSampler.texture;
    parsedMaterial.bindings.pbr_specularEnvSampler = imageBasedLightingEnvironment.specularEnvSampler.texture;
    parsedMaterial.bindings.pbr_BrdfLUT = imageBasedLightingEnvironment.brdfLutTexture.texture;
    parsedMaterial.uniforms.scaleIBLAmbient = [1, 1];
  }
  if (options == null ? void 0 : options.pbrDebug) {
    parsedMaterial.defines.PBR_DEBUG = 1;
    parsedMaterial.uniforms.scaleDiffBaseMR = [0, 0, 0, 0];
    parsedMaterial.uniforms.scaleFGDSpec = [0, 0, 0, 0];
  }
  if (attributes.NORMAL)
    parsedMaterial.defines.HAS_NORMALS = 1;
  if (attributes.TANGENT && (options == null ? void 0 : options.useTangents))
    parsedMaterial.defines.HAS_TANGENTS = 1;
  if (attributes.TEXCOORD_0)
    parsedMaterial.defines.HAS_UV = 1;
  if (options == null ? void 0 : options.imageBasedLightingEnvironment)
    parsedMaterial.defines.USE_IBL = 1;
  if (options == null ? void 0 : options.lights)
    parsedMaterial.defines.USE_LIGHTS = 1;
  if (material) {
    parseMaterial(device, material, parsedMaterial);
  }
  return parsedMaterial;
}
function parseMaterial(device, material, parsedMaterial) {
  parsedMaterial.uniforms.unlit = Boolean(material.unlit);
  if (material.pbrMetallicRoughness) {
    parsePbrMetallicRoughness(device, material.pbrMetallicRoughness, parsedMaterial);
  }
  if (material.normalTexture) {
    addTexture(device, material.normalTexture, "pbr_normalSampler", "HAS_NORMALMAP", parsedMaterial);
    const { scale = 1 } = material.normalTexture;
    parsedMaterial.uniforms.normalScale = scale;
  }
  if (material.occlusionTexture) {
    addTexture(device, material.occlusionTexture, "pbr_occlusionSampler", "HAS_OCCLUSIONMAP", parsedMaterial);
    const { strength = 1 } = material.occlusionTexture;
    parsedMaterial.uniforms.occlusionStrength = strength;
  }
  if (material.emissiveTexture) {
    addTexture(device, material.emissiveTexture, "pbr_emissiveSampler", "HAS_EMISSIVEMAP", parsedMaterial);
    parsedMaterial.uniforms.emissiveFactor = material.emissiveFactor || [0, 0, 0];
  }
  switch (material.alphaMode) {
    case "MASK":
      const { alphaCutoff = 0.5 } = material;
      parsedMaterial.defines.ALPHA_CUTOFF = 1;
      parsedMaterial.uniforms.alphaCutoff = alphaCutoff;
      break;
    case "BLEND":
      log.warn("glTF BLEND alphaMode might not work well because it requires mesh sorting")();
      parsedMaterial.parameters.blendColorOperation = "add";
      parsedMaterial.parameters.blendColorSrcFactor = "src-alpha";
      parsedMaterial.parameters.blendColorDstFactor = "one-minus-src-alpha";
      parsedMaterial.parameters.blendAlphaOperation = "add";
      parsedMaterial.parameters.blendAlphaSrcFactor = "one";
      parsedMaterial.parameters.blendAlphaDstFactor = "one-minus-src-alpha";
      parsedMaterial.glParameters.blend = true;
      parsedMaterial.glParameters.blendEquation = GLEnum.FUNC_ADD;
      parsedMaterial.glParameters.blendFunc = [
        GLEnum.SRC_ALPHA,
        GLEnum.ONE_MINUS_SRC_ALPHA,
        GLEnum.ONE,
        GLEnum.ONE_MINUS_SRC_ALPHA
      ];
      break;
  }
}
function parsePbrMetallicRoughness(device, pbrMetallicRoughness, parsedMaterial) {
  if (pbrMetallicRoughness.baseColorTexture) {
    addTexture(device, pbrMetallicRoughness.baseColorTexture, "pbr_baseColorSampler", "HAS_BASECOLORMAP", parsedMaterial);
  }
  parsedMaterial.uniforms.baseColorFactor = pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1];
  if (pbrMetallicRoughness.metallicRoughnessTexture) {
    addTexture(device, pbrMetallicRoughness.metallicRoughnessTexture, "pbr_metallicRoughnessSampler", "HAS_METALROUGHNESSMAP", parsedMaterial);
  }
  const { metallicFactor = 1, roughnessFactor = 1 } = pbrMetallicRoughness;
  parsedMaterial.uniforms.metallicRoughnessValues = [metallicFactor, roughnessFactor];
}
function addTexture(device, gltfTexture, uniformName, define = null, parsedMaterial) {
  var _a, _b;
  const parameters = ((_b = (_a = gltfTexture == null ? void 0 : gltfTexture.texture) == null ? void 0 : _a.sampler) == null ? void 0 : _b.parameters) || {};
  const image = gltfTexture.texture.source.image;
  let textureOptions;
  let specialTextureParameters = {};
  if (image.compressed) {
    textureOptions = image;
    specialTextureParameters = {
      [GLEnum.TEXTURE_MIN_FILTER]: image.data.length > 1 ? GLEnum.LINEAR_MIPMAP_NEAREST : GLEnum.LINEAR
    };
  } else {
    textureOptions = { data: image };
  }
  const texture = device.createTexture({
    id: gltfTexture.uniformName || gltfTexture.id,
    parameters: {
      ...parameters,
      ...specialTextureParameters
    },
    pixelStore: {
      [GLEnum.UNPACK_FLIP_Y_WEBGL]: false
    },
    ...textureOptions
  });
  parsedMaterial.bindings[uniformName] = texture;
  if (define)
    parsedMaterial.defines[define] = 1;
  parsedMaterial.generatedTextures.push(texture);
}

// node_modules/@loaders.gl/textures/dist/lib/utils/version.js
var VERSION = true ? "4.3.2" : "latest";

// node_modules/@loaders.gl/textures/dist/lib/parsers/basis-module-loader.js
var BASIS_EXTERNAL_LIBRARIES = {
  /** Basis transcoder, javascript wrapper part */
  TRANSCODER: "basis_transcoder.js",
  /** Basis transcoder, compiled web assembly part */
  TRANSCODER_WASM: "basis_transcoder.wasm",
  /** Basis encoder, javascript wrapper part */
  ENCODER: "basis_encoder.js",
  /** Basis encoder, compiled web assembly part */
  ENCODER_WASM: "basis_encoder.wasm"
};
var loadBasisTranscoderPromise;
async function loadBasisTranscoderModule(options) {
  registerJSModules(options.modules);
  const basis = getJSModuleOrNull("basis");
  if (basis) {
    return basis;
  }
  loadBasisTranscoderPromise || (loadBasisTranscoderPromise = loadBasisTranscoder(options));
  return await loadBasisTranscoderPromise;
}
async function loadBasisTranscoder(options) {
  let BASIS = null;
  let wasmBinary = null;
  [BASIS, wasmBinary] = await Promise.all([
    await loadLibrary(BASIS_EXTERNAL_LIBRARIES.TRANSCODER, "textures", options),
    await loadLibrary(BASIS_EXTERNAL_LIBRARIES.TRANSCODER_WASM, "textures", options)
  ]);
  BASIS = BASIS || globalThis.BASIS;
  return await initializeBasisTranscoderModule(BASIS, wasmBinary);
}
function initializeBasisTranscoderModule(BasisModule, wasmBinary) {
  const options = {};
  if (wasmBinary) {
    options.wasmBinary = wasmBinary;
  }
  return new Promise((resolve) => {
    BasisModule(options).then((module) => {
      const { BasisFile, initializeBasis } = module;
      initializeBasis();
      resolve({ BasisFile });
    });
  });
}
var loadBasisEncoderPromise;
async function loadBasisEncoderModule(options) {
  const modules = options.modules || {};
  if (modules.basisEncoder) {
    return modules.basisEncoder;
  }
  loadBasisEncoderPromise = loadBasisEncoderPromise || loadBasisEncoder(options);
  return await loadBasisEncoderPromise;
}
async function loadBasisEncoder(options) {
  let BASIS_ENCODER = null;
  let wasmBinary = null;
  [BASIS_ENCODER, wasmBinary] = await Promise.all([
    await loadLibrary(BASIS_EXTERNAL_LIBRARIES.ENCODER, "textures", options),
    await loadLibrary(BASIS_EXTERNAL_LIBRARIES.ENCODER_WASM, "textures", options)
  ]);
  BASIS_ENCODER = BASIS_ENCODER || globalThis.BASIS;
  return await initializeBasisEncoderModule(BASIS_ENCODER, wasmBinary);
}
function initializeBasisEncoderModule(BasisEncoderModule, wasmBinary) {
  const options = {};
  if (wasmBinary) {
    options.wasmBinary = wasmBinary;
  }
  return new Promise((resolve) => {
    BasisEncoderModule(options).then((module) => {
      const { BasisFile, KTX2File, initializeBasis, BasisEncoder } = module;
      initializeBasis();
      resolve({ BasisFile, KTX2File, BasisEncoder });
    });
  });
}

// node_modules/@loaders.gl/textures/dist/lib/gl-extensions.js
var GL_EXTENSIONS_CONSTANTS = {
  // WEBGL_compressed_texture_s3tc
  COMPRESSED_RGB_S3TC_DXT1_EXT: 33776,
  COMPRESSED_RGBA_S3TC_DXT1_EXT: 33777,
  COMPRESSED_RGBA_S3TC_DXT3_EXT: 33778,
  COMPRESSED_RGBA_S3TC_DXT5_EXT: 33779,
  // WEBGL_compressed_texture_es3
  COMPRESSED_R11_EAC: 37488,
  COMPRESSED_SIGNED_R11_EAC: 37489,
  COMPRESSED_RG11_EAC: 37490,
  COMPRESSED_SIGNED_RG11_EAC: 37491,
  COMPRESSED_RGB8_ETC2: 37492,
  COMPRESSED_RGBA8_ETC2_EAC: 37493,
  COMPRESSED_SRGB8_ETC2: 37494,
  COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 37495,
  COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: 37496,
  COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: 37497,
  // WEBGL_compressed_texture_pvrtc
  COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 35840,
  COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: 35842,
  COMPRESSED_RGB_PVRTC_2BPPV1_IMG: 35841,
  COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 35843,
  // WEBGL_compressed_texture_etc1
  COMPRESSED_RGB_ETC1_WEBGL: 36196,
  // WEBGL_compressed_texture_atc
  COMPRESSED_RGB_ATC_WEBGL: 35986,
  COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL: 35987,
  COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL: 34798,
  // WEBGL_compressed_texture_astc
  COMPRESSED_RGBA_ASTC_4X4_KHR: 37808,
  COMPRESSED_RGBA_ASTC_5X4_KHR: 37809,
  COMPRESSED_RGBA_ASTC_5X5_KHR: 37810,
  COMPRESSED_RGBA_ASTC_6X5_KHR: 37811,
  COMPRESSED_RGBA_ASTC_6X6_KHR: 37812,
  COMPRESSED_RGBA_ASTC_8X5_KHR: 37813,
  COMPRESSED_RGBA_ASTC_8X6_KHR: 37814,
  COMPRESSED_RGBA_ASTC_8X8_KHR: 37815,
  COMPRESSED_RGBA_ASTC_10X5_KHR: 37816,
  COMPRESSED_RGBA_ASTC_10X6_KHR: 37817,
  COMPRESSED_RGBA_ASTC_10X8_KHR: 37818,
  COMPRESSED_RGBA_ASTC_10X10_KHR: 37819,
  COMPRESSED_RGBA_ASTC_12X10_KHR: 37820,
  COMPRESSED_RGBA_ASTC_12X12_KHR: 37821,
  COMPRESSED_SRGB8_ALPHA8_ASTC_4X4_KHR: 37840,
  COMPRESSED_SRGB8_ALPHA8_ASTC_5X4_KHR: 37841,
  COMPRESSED_SRGB8_ALPHA8_ASTC_5X5_KHR: 37842,
  COMPRESSED_SRGB8_ALPHA8_ASTC_6X5_KHR: 37843,
  COMPRESSED_SRGB8_ALPHA8_ASTC_6X6_KHR: 37844,
  COMPRESSED_SRGB8_ALPHA8_ASTC_8X5_KHR: 37845,
  COMPRESSED_SRGB8_ALPHA8_ASTC_8X6_KHR: 37846,
  COMPRESSED_SRGB8_ALPHA8_ASTC_8X8_KHR: 37847,
  COMPRESSED_SRGB8_ALPHA8_ASTC_10X5_KHR: 37848,
  COMPRESSED_SRGB8_ALPHA8_ASTC_10X6_KHR: 37849,
  COMPRESSED_SRGB8_ALPHA8_ASTC_10X8_KHR: 37850,
  COMPRESSED_SRGB8_ALPHA8_ASTC_10X10_KHR: 37851,
  COMPRESSED_SRGB8_ALPHA8_ASTC_12X10_KHR: 37852,
  COMPRESSED_SRGB8_ALPHA8_ASTC_12X12_KHR: 37853,
  // EXT_texture_compression_rgtc
  COMPRESSED_RED_RGTC1_EXT: 36283,
  COMPRESSED_SIGNED_RED_RGTC1_EXT: 36284,
  COMPRESSED_RED_GREEN_RGTC2_EXT: 36285,
  COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: 36286,
  // WEBGL_compressed_texture_s3tc_srgb
  COMPRESSED_SRGB_S3TC_DXT1_EXT: 35916,
  COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: 35917,
  COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: 35918,
  COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: 35919
};

// node_modules/@loaders.gl/textures/dist/lib/utils/texture-formats.js
var BROWSER_PREFIXES = ["", "WEBKIT_", "MOZ_"];
var WEBGL_EXTENSIONS = {
  /* eslint-disable camelcase */
  WEBGL_compressed_texture_s3tc: "dxt",
  WEBGL_compressed_texture_s3tc_srgb: "dxt-srgb",
  WEBGL_compressed_texture_etc1: "etc1",
  WEBGL_compressed_texture_etc: "etc2",
  WEBGL_compressed_texture_pvrtc: "pvrtc",
  WEBGL_compressed_texture_atc: "atc",
  WEBGL_compressed_texture_astc: "astc",
  EXT_texture_compression_rgtc: "rgtc"
  /* eslint-enable camelcase */
};
var formats = null;
function getSupportedGPUTextureFormats(gl) {
  if (!formats) {
    gl = gl || getWebGLContext() || void 0;
    formats = /* @__PURE__ */ new Set();
    for (const prefix of BROWSER_PREFIXES) {
      for (const extension in WEBGL_EXTENSIONS) {
        if (gl && gl.getExtension(`${prefix}${extension}`)) {
          const gpuTextureFormat = WEBGL_EXTENSIONS[extension];
          formats.add(gpuTextureFormat);
        }
      }
    }
  }
  return formats;
}
function getWebGLContext() {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl");
  } catch (error) {
    return null;
  }
}

// node_modules/ktx-parse/dist/ktx-parse.modern.js
var KHR_SUPERCOMPRESSION_NONE = 0;
var KHR_DF_KHR_DESCRIPTORTYPE_BASICFORMAT = 0;
var KHR_DF_VENDORID_KHRONOS = 0;
var KHR_DF_VERSION = 2;
var KHR_DF_MODEL_UNSPECIFIED = 0;
var KHR_DF_FLAG_ALPHA_STRAIGHT = 0;
var KHR_DF_TRANSFER_SRGB = 2;
var KHR_DF_PRIMARIES_BT709 = 1;
var KHR_DF_SAMPLE_DATATYPE_SIGNED = 64;
var VK_FORMAT_UNDEFINED = 0;
var KTX2Container = class {
  constructor() {
    this.vkFormat = VK_FORMAT_UNDEFINED;
    this.typeSize = 1;
    this.pixelWidth = 0;
    this.pixelHeight = 0;
    this.pixelDepth = 0;
    this.layerCount = 0;
    this.faceCount = 1;
    this.supercompressionScheme = KHR_SUPERCOMPRESSION_NONE;
    this.levels = [];
    this.dataFormatDescriptor = [{
      vendorId: KHR_DF_VENDORID_KHRONOS,
      descriptorType: KHR_DF_KHR_DESCRIPTORTYPE_BASICFORMAT,
      descriptorBlockSize: 0,
      versionNumber: KHR_DF_VERSION,
      colorModel: KHR_DF_MODEL_UNSPECIFIED,
      colorPrimaries: KHR_DF_PRIMARIES_BT709,
      transferFunction: KHR_DF_TRANSFER_SRGB,
      flags: KHR_DF_FLAG_ALPHA_STRAIGHT,
      texelBlockDimension: [0, 0, 0, 0],
      bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0],
      samples: []
    }];
    this.keyValue = {};
    this.globalData = null;
  }
};
var BufferReader = class {
  constructor(data, byteOffset, byteLength, littleEndian) {
    this._dataView = void 0;
    this._littleEndian = void 0;
    this._offset = void 0;
    this._dataView = new DataView(data.buffer, data.byteOffset + byteOffset, byteLength);
    this._littleEndian = littleEndian;
    this._offset = 0;
  }
  _nextUint8() {
    const value = this._dataView.getUint8(this._offset);
    this._offset += 1;
    return value;
  }
  _nextUint16() {
    const value = this._dataView.getUint16(this._offset, this._littleEndian);
    this._offset += 2;
    return value;
  }
  _nextUint32() {
    const value = this._dataView.getUint32(this._offset, this._littleEndian);
    this._offset += 4;
    return value;
  }
  _nextUint64() {
    const left = this._dataView.getUint32(this._offset, this._littleEndian);
    const right = this._dataView.getUint32(this._offset + 4, this._littleEndian);
    const value = left + 2 ** 32 * right;
    this._offset += 8;
    return value;
  }
  _nextInt32() {
    const value = this._dataView.getInt32(this._offset, this._littleEndian);
    this._offset += 4;
    return value;
  }
  _nextUint8Array(len) {
    const value = new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + this._offset, len);
    this._offset += len;
    return value;
  }
  _skip(bytes) {
    this._offset += bytes;
    return this;
  }
  _scan(maxByteLength, term = 0) {
    const byteOffset = this._offset;
    let byteLength = 0;
    while (this._dataView.getUint8(this._offset) !== term && byteLength < maxByteLength) {
      byteLength++;
      this._offset++;
    }
    if (byteLength < maxByteLength) this._offset++;
    return new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + byteOffset, byteLength);
  }
};
var NUL = new Uint8Array([0]);
var KTX2_ID = [
  // '´', 'K', 'T', 'X', '2', '0', 'ª', '\r', '\n', '\x1A', '\n'
  171,
  75,
  84,
  88,
  32,
  50,
  48,
  187,
  13,
  10,
  26,
  10
];
function decodeText(buffer) {
  return new TextDecoder().decode(buffer);
}
function read(data) {
  const id = new Uint8Array(data.buffer, data.byteOffset, KTX2_ID.length);
  if (id[0] !== KTX2_ID[0] || // '´'
  id[1] !== KTX2_ID[1] || // 'K'
  id[2] !== KTX2_ID[2] || // 'T'
  id[3] !== KTX2_ID[3] || // 'X'
  id[4] !== KTX2_ID[4] || // ' '
  id[5] !== KTX2_ID[5] || // '2'
  id[6] !== KTX2_ID[6] || // '0'
  id[7] !== KTX2_ID[7] || // 'ª'
  id[8] !== KTX2_ID[8] || // '\r'
  id[9] !== KTX2_ID[9] || // '\n'
  id[10] !== KTX2_ID[10] || // '\x1A'
  id[11] !== KTX2_ID[11]) {
    throw new Error("Missing KTX 2.0 identifier.");
  }
  const container = new KTX2Container();
  const headerByteLength = 17 * Uint32Array.BYTES_PER_ELEMENT;
  const headerReader = new BufferReader(data, KTX2_ID.length, headerByteLength, true);
  container.vkFormat = headerReader._nextUint32();
  container.typeSize = headerReader._nextUint32();
  container.pixelWidth = headerReader._nextUint32();
  container.pixelHeight = headerReader._nextUint32();
  container.pixelDepth = headerReader._nextUint32();
  container.layerCount = headerReader._nextUint32();
  container.faceCount = headerReader._nextUint32();
  const levelCount = headerReader._nextUint32();
  container.supercompressionScheme = headerReader._nextUint32();
  const dfdByteOffset = headerReader._nextUint32();
  const dfdByteLength = headerReader._nextUint32();
  const kvdByteOffset = headerReader._nextUint32();
  const kvdByteLength = headerReader._nextUint32();
  const sgdByteOffset = headerReader._nextUint64();
  const sgdByteLength = headerReader._nextUint64();
  const levelByteLength = levelCount * 3 * 8;
  const levelReader = new BufferReader(data, KTX2_ID.length + headerByteLength, levelByteLength, true);
  for (let i = 0; i < levelCount; i++) {
    container.levels.push({
      levelData: new Uint8Array(data.buffer, data.byteOffset + levelReader._nextUint64(), levelReader._nextUint64()),
      uncompressedByteLength: levelReader._nextUint64()
    });
  }
  const dfdReader = new BufferReader(data, dfdByteOffset, dfdByteLength, true);
  const dfd = {
    vendorId: dfdReader._skip(
      4
      /* totalSize */
    )._nextUint16(),
    descriptorType: dfdReader._nextUint16(),
    versionNumber: dfdReader._nextUint16(),
    descriptorBlockSize: dfdReader._nextUint16(),
    colorModel: dfdReader._nextUint8(),
    colorPrimaries: dfdReader._nextUint8(),
    transferFunction: dfdReader._nextUint8(),
    flags: dfdReader._nextUint8(),
    texelBlockDimension: [dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8()],
    bytesPlane: [dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8()],
    samples: []
  };
  const sampleStart = 6;
  const sampleWords = 4;
  const numSamples = (dfd.descriptorBlockSize / 4 - sampleStart) / sampleWords;
  for (let i = 0; i < numSamples; i++) {
    const sample = {
      bitOffset: dfdReader._nextUint16(),
      bitLength: dfdReader._nextUint8(),
      channelType: dfdReader._nextUint8(),
      samplePosition: [dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8()],
      sampleLower: -Infinity,
      sampleUpper: Infinity
    };
    if (sample.channelType & KHR_DF_SAMPLE_DATATYPE_SIGNED) {
      sample.sampleLower = dfdReader._nextInt32();
      sample.sampleUpper = dfdReader._nextInt32();
    } else {
      sample.sampleLower = dfdReader._nextUint32();
      sample.sampleUpper = dfdReader._nextUint32();
    }
    dfd.samples[i] = sample;
  }
  container.dataFormatDescriptor.length = 0;
  container.dataFormatDescriptor.push(dfd);
  const kvdReader = new BufferReader(data, kvdByteOffset, kvdByteLength, true);
  while (kvdReader._offset < kvdByteLength) {
    const keyValueByteLength = kvdReader._nextUint32();
    const keyData = kvdReader._scan(keyValueByteLength);
    const key = decodeText(keyData);
    container.keyValue[key] = kvdReader._nextUint8Array(keyValueByteLength - keyData.byteLength - 1);
    if (key.match(/^ktx/i)) {
      const text = decodeText(container.keyValue[key]);
      container.keyValue[key] = text.substring(0, text.lastIndexOf("\0"));
    }
    const kvPadding = keyValueByteLength % 4 ? 4 - keyValueByteLength % 4 : 0;
    kvdReader._skip(kvPadding);
  }
  if (sgdByteLength <= 0) return container;
  const sgdReader = new BufferReader(data, sgdByteOffset, sgdByteLength, true);
  const endpointCount = sgdReader._nextUint16();
  const selectorCount = sgdReader._nextUint16();
  const endpointsByteLength = sgdReader._nextUint32();
  const selectorsByteLength = sgdReader._nextUint32();
  const tablesByteLength = sgdReader._nextUint32();
  const extendedByteLength = sgdReader._nextUint32();
  const imageDescs = [];
  for (let i = 0; i < levelCount; i++) {
    imageDescs.push({
      imageFlags: sgdReader._nextUint32(),
      rgbSliceByteOffset: sgdReader._nextUint32(),
      rgbSliceByteLength: sgdReader._nextUint32(),
      alphaSliceByteOffset: sgdReader._nextUint32(),
      alphaSliceByteLength: sgdReader._nextUint32()
    });
  }
  const endpointsByteOffset = sgdByteOffset + sgdReader._offset;
  const selectorsByteOffset = endpointsByteOffset + endpointsByteLength;
  const tablesByteOffset = selectorsByteOffset + selectorsByteLength;
  const extendedByteOffset = tablesByteOffset + tablesByteLength;
  const endpointsData = new Uint8Array(data.buffer, data.byteOffset + endpointsByteOffset, endpointsByteLength);
  const selectorsData = new Uint8Array(data.buffer, data.byteOffset + selectorsByteOffset, selectorsByteLength);
  const tablesData = new Uint8Array(data.buffer, data.byteOffset + tablesByteOffset, tablesByteLength);
  const extendedData = new Uint8Array(data.buffer, data.byteOffset + extendedByteOffset, extendedByteLength);
  container.globalData = {
    endpointCount,
    selectorCount,
    imageDescs,
    endpointsData,
    selectorsData,
    tablesData,
    extendedData
  };
  return container;
}

// node_modules/@loaders.gl/textures/dist/lib/utils/extract-mipmap-images.js
function extractMipmapImages(data, options) {
  const images = new Array(options.mipMapLevels);
  let levelWidth = options.width;
  let levelHeight = options.height;
  let offset = 0;
  for (let i = 0; i < options.mipMapLevels; ++i) {
    const levelSize = getLevelSize(options, levelWidth, levelHeight, data, i);
    const levelData = getLevelData(data, i, offset, levelSize);
    images[i] = {
      compressed: true,
      format: options.internalFormat,
      data: levelData,
      width: levelWidth,
      height: levelHeight,
      levelSize
    };
    levelWidth = Math.max(1, levelWidth >> 1);
    levelHeight = Math.max(1, levelHeight >> 1);
    offset += levelSize;
  }
  return images;
}
function getLevelData(data, index, offset, levelSize) {
  if (!Array.isArray(data)) {
    return new Uint8Array(data.buffer, data.byteOffset + offset, levelSize);
  }
  return data[index].levelData;
}
function getLevelSize(options, levelWidth, levelHeight, data, index) {
  if (!Array.isArray(data)) {
    return options.sizeFunction(levelWidth, levelHeight);
  }
  return options.sizeFunction(data[index]);
}

// node_modules/@loaders.gl/textures/dist/lib/utils/ktx-format-helper.js
var VULKAN_TO_WEBGL_FORMAT_MAP = {
  131: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_S3TC_DXT1_EXT,
  132: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB_S3TC_DXT1_EXT,
  133: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
  134: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,
  135: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
  136: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,
  137: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
  138: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT,
  139: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RED_RGTC1_EXT,
  140: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SIGNED_RED_RGTC1_EXT,
  141: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RED_GREEN_RGTC2_EXT,
  142: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT,
  147: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB8_ETC2,
  148: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ETC2,
  149: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,
  150: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,
  151: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA8_ETC2_EAC,
  152: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,
  153: GL_EXTENSIONS_CONSTANTS.COMPRESSED_R11_EAC,
  154: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SIGNED_R11_EAC,
  155: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RG11_EAC,
  156: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SIGNED_RG11_EAC,
  // @ts-ignore
  157: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_4x4_KHR,
  // @ts-ignore
  158: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,
  // @ts-ignore
  159: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5x4_KHR,
  // @ts-ignore
  160: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_5X4_KHR,
  // @ts-ignore
  161: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5x5_KHR,
  // @ts-ignore
  162: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,
  // @ts-ignore
  163: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6x5_KHR,
  // @ts-ignore
  164: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,
  // @ts-ignore
  165: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6x6_KHR,
  // @ts-ignore
  166: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,
  // @ts-ignore
  167: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x5_KHR,
  // @ts-ignore
  168: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,
  // @ts-ignore
  169: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x6_KHR,
  // @ts-ignore
  170: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,
  // @ts-ignore
  171: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x8_KHR,
  // @ts-ignore
  172: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,
  // @ts-ignore
  173: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x5_KHR,
  // @ts-ignore
  174: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,
  // @ts-ignore
  175: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x6_KHR,
  // @ts-ignore
  176: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,
  // @ts-ignore
  177: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x8_KHR,
  // @ts-ignore
  178: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,
  // @ts-ignore
  179: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x10_KHR,
  // @ts-ignore
  180: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,
  // @ts-ignore
  181: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12x10_KHR,
  // @ts-ignore
  182: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,
  // @ts-ignore
  183: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12x12_KHR,
  // @ts-ignore
  184: GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR,
  1000054e3: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG,
  1000054001: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
  // @ts-ignore
  1000066e3: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_4x4_KHR,
  // @ts-ignore
  1000066001: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5x4_KHR,
  // @ts-ignore
  1000066002: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5x5_KHR,
  // @ts-ignore
  1000066003: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6x5_KHR,
  // @ts-ignore
  1000066004: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6x6_KHR,
  // @ts-ignore
  1000066005: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x5_KHR,
  // @ts-ignore
  1000066006: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x6_KHR,
  // @ts-ignore
  1000066007: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8x8_KHR,
  // @ts-ignore
  1000066008: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x5_KHR,
  // @ts-ignore
  1000066009: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x6_KHR,
  // @ts-ignore
  1000066010: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x8_KHR,
  // @ts-ignore
  1000066011: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10x10_KHR,
  // @ts-ignore
  1000066012: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12x10_KHR,
  // @ts-ignore
  1000066013: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12x12_KHR
};
function mapVkFormatToWebGL(vkFormat) {
  return VULKAN_TO_WEBGL_FORMAT_MAP[vkFormat];
}

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-ktx.js
var KTX2_ID2 = [
  // '´', 'K', 'T', 'X', '2', '0', 'ª', '\r', '\n', '\x1A', '\n'
  171,
  75,
  84,
  88,
  32,
  50,
  48,
  187,
  13,
  10,
  26,
  10
];
function isKTX(data) {
  const id = new Uint8Array(data);
  const notKTX = id.byteLength < KTX2_ID2.length || id[0] !== KTX2_ID2[0] || // '´'
  id[1] !== KTX2_ID2[1] || // 'K'
  id[2] !== KTX2_ID2[2] || // 'T'
  id[3] !== KTX2_ID2[3] || // 'X'
  id[4] !== KTX2_ID2[4] || // ' '
  id[5] !== KTX2_ID2[5] || // '2'
  id[6] !== KTX2_ID2[6] || // '0'
  id[7] !== KTX2_ID2[7] || // 'ª'
  id[8] !== KTX2_ID2[8] || // '\r'
  id[9] !== KTX2_ID2[9] || // '\n'
  id[10] !== KTX2_ID2[10] || // '\x1A'
  id[11] !== KTX2_ID2[11];
  return !notKTX;
}
function parseKTX(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const ktx = read(uint8Array);
  const mipMapLevels = Math.max(1, ktx.levels.length);
  const width = ktx.pixelWidth;
  const height = ktx.pixelHeight;
  const internalFormat = mapVkFormatToWebGL(ktx.vkFormat);
  return extractMipmapImages(ktx.levels, {
    mipMapLevels,
    width,
    height,
    sizeFunction: (level) => level.uncompressedByteLength,
    internalFormat
  });
}

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-basis.js
var OutputFormat = {
  etc1: {
    basisFormat: 0,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_ETC1_WEBGL
  },
  etc2: { basisFormat: 1, compressed: true },
  bc1: {
    basisFormat: 2,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_S3TC_DXT1_EXT
  },
  bc3: {
    basisFormat: 3,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT5_EXT
  },
  bc4: { basisFormat: 4, compressed: true },
  bc5: { basisFormat: 5, compressed: true },
  "bc7-m6-opaque-only": { basisFormat: 6, compressed: true },
  "bc7-m5": { basisFormat: 7, compressed: true },
  "pvrtc1-4-rgb": {
    basisFormat: 8,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG
  },
  "pvrtc1-4-rgba": {
    basisFormat: 9,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG
  },
  "astc-4x4": {
    basisFormat: 10,
    compressed: true,
    format: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_4X4_KHR
  },
  "atc-rgb": { basisFormat: 11, compressed: true },
  "atc-rgba-interpolated-alpha": { basisFormat: 12, compressed: true },
  rgba32: { basisFormat: 13, compressed: false },
  rgb565: { basisFormat: 14, compressed: false },
  bgr565: { basisFormat: 15, compressed: false },
  rgba4444: { basisFormat: 16, compressed: false }
};
async function parseBasis(data, options) {
  if (options.basis.containerFormat === "auto") {
    if (isKTX(data)) {
      const fileConstructors = await loadBasisEncoderModule(options);
      return parseKTX2File(fileConstructors.KTX2File, data, options);
    }
    const { BasisFile } = await loadBasisTranscoderModule(options);
    return parseBasisFile(BasisFile, data, options);
  }
  switch (options.basis.module) {
    case "encoder":
      const fileConstructors = await loadBasisEncoderModule(options);
      switch (options.basis.containerFormat) {
        case "ktx2":
          return parseKTX2File(fileConstructors.KTX2File, data, options);
        case "basis":
        default:
          return parseBasisFile(fileConstructors.BasisFile, data, options);
      }
    case "transcoder":
    default:
      const { BasisFile } = await loadBasisTranscoderModule(options);
      return parseBasisFile(BasisFile, data, options);
  }
}
function parseBasisFile(BasisFile, data, options) {
  const basisFile = new BasisFile(new Uint8Array(data));
  try {
    if (!basisFile.startTranscoding()) {
      throw new Error("Failed to start basis transcoding");
    }
    const imageCount = basisFile.getNumImages();
    const images = [];
    for (let imageIndex = 0; imageIndex < imageCount; imageIndex++) {
      const levelsCount = basisFile.getNumLevels(imageIndex);
      const levels = [];
      for (let levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
        levels.push(transcodeImage(basisFile, imageIndex, levelIndex, options));
      }
      images.push(levels);
    }
    return images;
  } finally {
    basisFile.close();
    basisFile.delete();
  }
}
function transcodeImage(basisFile, imageIndex, levelIndex, options) {
  const width = basisFile.getImageWidth(imageIndex, levelIndex);
  const height = basisFile.getImageHeight(imageIndex, levelIndex);
  const hasAlpha = basisFile.getHasAlpha(
    /* imageIndex, levelIndex */
  );
  const { compressed, format, basisFormat } = getBasisOptions(options, hasAlpha);
  const decodedSize = basisFile.getImageTranscodedSizeInBytes(imageIndex, levelIndex, basisFormat);
  const decodedData = new Uint8Array(decodedSize);
  if (!basisFile.transcodeImage(decodedData, imageIndex, levelIndex, basisFormat, 0, 0)) {
    throw new Error("failed to start Basis transcoding");
  }
  return {
    // standard loaders.gl image category payload
    width,
    height,
    data: decodedData,
    compressed,
    format,
    // Additional fields
    // Add levelSize field.
    hasAlpha
  };
}
function parseKTX2File(KTX2File, data, options) {
  const ktx2File = new KTX2File(new Uint8Array(data));
  try {
    if (!ktx2File.startTranscoding()) {
      throw new Error("failed to start KTX2 transcoding");
    }
    const levelsCount = ktx2File.getLevels();
    const levels = [];
    for (let levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
      levels.push(transcodeKTX2Image(ktx2File, levelIndex, options));
    }
    return [levels];
  } finally {
    ktx2File.close();
    ktx2File.delete();
  }
}
function transcodeKTX2Image(ktx2File, levelIndex, options) {
  const { alphaFlag, height, width } = ktx2File.getImageLevelInfo(levelIndex, 0, 0);
  const { compressed, format, basisFormat } = getBasisOptions(options, alphaFlag);
  const decodedSize = ktx2File.getImageTranscodedSizeInBytes(levelIndex, 0, 0, basisFormat);
  const decodedData = new Uint8Array(decodedSize);
  if (!ktx2File.transcodeImage(
    decodedData,
    levelIndex,
    0,
    0,
    basisFormat,
    0,
    -1,
    -1
    /* channel1 */
  )) {
    throw new Error("Failed to transcode KTX2 image");
  }
  return {
    // standard loaders.gl image category payload
    width,
    height,
    data: decodedData,
    compressed,
    // Additional fields
    levelSize: decodedSize,
    hasAlpha: alphaFlag,
    format
  };
}
function getBasisOptions(options, hasAlpha) {
  let format = options && options.basis && options.basis.format;
  if (format === "auto") {
    format = selectSupportedBasisFormat();
  }
  if (typeof format === "object") {
    format = hasAlpha ? format.alpha : format.noAlpha;
  }
  format = format.toLowerCase();
  return OutputFormat[format];
}
function selectSupportedBasisFormat() {
  const supportedFormats = getSupportedGPUTextureFormats();
  if (supportedFormats.has("astc")) {
    return "astc-4x4";
  } else if (supportedFormats.has("dxt")) {
    return {
      alpha: "bc3",
      noAlpha: "bc1"
    };
  } else if (supportedFormats.has("pvrtc")) {
    return {
      alpha: "pvrtc1-4-rgba",
      noAlpha: "pvrtc1-4-rgb"
    };
  } else if (supportedFormats.has("etc1")) {
    return "etc1";
  } else if (supportedFormats.has("etc2")) {
    return "etc2";
  }
  return "rgb565";
}

// node_modules/@loaders.gl/textures/dist/basis-loader.js
var BasisWorkerLoader = {
  dataType: null,
  batchType: null,
  name: "Basis",
  id: "basis",
  module: "textures",
  version: VERSION,
  worker: true,
  extensions: ["basis", "ktx2"],
  mimeTypes: ["application/octet-stream", "image/ktx2"],
  tests: ["sB"],
  binary: true,
  options: {
    basis: {
      format: "auto",
      libraryPath: "libs/",
      containerFormat: "auto",
      module: "transcoder"
    }
  }
};
var BasisLoader = {
  ...BasisWorkerLoader,
  parse: parseBasis
};

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-dds.js
var DDS_CONSTANTS = {
  MAGIC_NUMBER: 542327876,
  HEADER_LENGTH: 31,
  MAGIC_NUMBER_INDEX: 0,
  HEADER_SIZE_INDEX: 1,
  HEADER_FLAGS_INDEX: 2,
  HEADER_HEIGHT_INDEX: 3,
  HEADER_WIDTH_INDEX: 4,
  MIPMAPCOUNT_INDEX: 7,
  HEADER_PF_FLAGS_INDEX: 20,
  HEADER_PF_FOURCC_INDEX: 21,
  DDSD_MIPMAPCOUNT: 131072,
  DDPF_FOURCC: 4
};
var DDS_PIXEL_FORMATS = {
  DXT1: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_S3TC_DXT1_EXT,
  DXT3: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
  DXT5: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
  "ATC ": GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_ATC_WEBGL,
  ATCA: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
  ATCI: GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL
};
var getATCLevelSize = getDxt1LevelSize;
var getATCALevelSize = getDxtXLevelSize;
var getATCILevelSize = getDxtXLevelSize;
var DDS_SIZE_FUNCTIONS = {
  DXT1: getDxt1LevelSize,
  DXT3: getDxtXLevelSize,
  DXT5: getDxtXLevelSize,
  "ATC ": getATCLevelSize,
  ATCA: getATCALevelSize,
  ATCI: getATCILevelSize
};
function isDDS(data) {
  const header = new Uint32Array(data, 0, DDS_CONSTANTS.HEADER_LENGTH);
  const magic = header[DDS_CONSTANTS.MAGIC_NUMBER_INDEX];
  return magic === DDS_CONSTANTS.MAGIC_NUMBER;
}
function parseDDS(data) {
  const header = new Int32Array(data, 0, DDS_CONSTANTS.HEADER_LENGTH);
  const pixelFormatNumber = header[DDS_CONSTANTS.HEADER_PF_FOURCC_INDEX];
  assert(Boolean(header[DDS_CONSTANTS.HEADER_PF_FLAGS_INDEX] & DDS_CONSTANTS.DDPF_FOURCC), "DDS: Unsupported format, must contain a FourCC code");
  const fourCC = int32ToFourCC(pixelFormatNumber);
  const internalFormat = DDS_PIXEL_FORMATS[fourCC];
  const sizeFunction = DDS_SIZE_FUNCTIONS[fourCC];
  assert(internalFormat && sizeFunction, `DDS: Unknown pixel format ${pixelFormatNumber}`);
  let mipMapLevels = 1;
  if (header[DDS_CONSTANTS.HEADER_FLAGS_INDEX] & DDS_CONSTANTS.DDSD_MIPMAPCOUNT) {
    mipMapLevels = Math.max(1, header[DDS_CONSTANTS.MIPMAPCOUNT_INDEX]);
  }
  const width = header[DDS_CONSTANTS.HEADER_WIDTH_INDEX];
  const height = header[DDS_CONSTANTS.HEADER_HEIGHT_INDEX];
  const dataOffset = header[DDS_CONSTANTS.HEADER_SIZE_INDEX] + 4;
  const image = new Uint8Array(data, dataOffset);
  return extractMipmapImages(image, {
    mipMapLevels,
    width,
    height,
    sizeFunction,
    internalFormat
  });
}
function getDxt1LevelSize(width, height) {
  return (width + 3 >> 2) * (height + 3 >> 2) * 8;
}
function getDxtXLevelSize(width, height) {
  return (width + 3 >> 2) * (height + 3 >> 2) * 16;
}
function int32ToFourCC(value) {
  return String.fromCharCode(value & 255, value >> 8 & 255, value >> 16 & 255, value >> 24 & 255);
}

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-pvr.js
var PVR_CONSTANTS = {
  MAGIC_NUMBER: 55727696,
  MAGIC_NUMBER_EXTRA: 1347834371,
  HEADER_LENGTH: 13,
  HEADER_SIZE: 52,
  MAGIC_NUMBER_INDEX: 0,
  PIXEL_FORMAT_INDEX: 2,
  COLOUR_SPACE_INDEX: 4,
  HEIGHT_INDEX: 6,
  WIDTH_INDEX: 7,
  MIPMAPCOUNT_INDEX: 11,
  METADATA_SIZE_INDEX: 12
};
var PVR_PIXEL_FORMATS = {
  0: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG],
  1: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG],
  2: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG],
  3: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG],
  6: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_ETC1_WEBGL],
  7: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB_S3TC_DXT1_EXT],
  9: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT3_EXT],
  11: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_S3TC_DXT5_EXT],
  22: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB8_ETC2],
  23: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA8_ETC2_EAC],
  24: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2],
  25: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_R11_EAC],
  26: [GL_EXTENSIONS_CONSTANTS.COMPRESSED_RG11_EAC],
  27: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_4X4_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_4X4_KHR
  ],
  28: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5X4_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_5X4_KHR
  ],
  29: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_5X5_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_5X5_KHR
  ],
  30: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6X5_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_6X5_KHR
  ],
  31: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_6X6_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_6X6_KHR
  ],
  32: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8X5_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8X5_KHR
  ],
  33: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8X6_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8X6_KHR
  ],
  34: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_8X8_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_8X8_KHR
  ],
  35: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10X5_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10X5_KHR
  ],
  36: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10X6_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10X6_KHR
  ],
  37: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10X8_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10X8_KHR
  ],
  38: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_10X10_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_10X10_KHR
  ],
  39: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12X10_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_12X10_KHR
  ],
  40: [
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_RGBA_ASTC_12X12_KHR,
    GL_EXTENSIONS_CONSTANTS.COMPRESSED_SRGB8_ALPHA8_ASTC_12X12_KHR
  ]
};
var PVR_SIZE_FUNCTIONS = {
  0: pvrtc2bppSize,
  1: pvrtc2bppSize,
  2: pvrtc4bppSize,
  3: pvrtc4bppSize,
  6: dxtEtcSmallSize,
  7: dxtEtcSmallSize,
  9: dxtEtcAstcBigSize,
  11: dxtEtcAstcBigSize,
  22: dxtEtcSmallSize,
  23: dxtEtcAstcBigSize,
  24: dxtEtcSmallSize,
  25: dxtEtcSmallSize,
  26: dxtEtcAstcBigSize,
  27: dxtEtcAstcBigSize,
  28: atc5x4Size,
  29: atc5x5Size,
  30: atc6x5Size,
  31: atc6x6Size,
  32: atc8x5Size,
  33: atc8x6Size,
  34: atc8x8Size,
  35: atc10x5Size,
  36: atc10x6Size,
  37: atc10x8Size,
  38: atc10x10Size,
  39: atc12x10Size,
  40: atc12x12Size
};
function isPVR(data) {
  const header = new Uint32Array(data, 0, PVR_CONSTANTS.HEADER_LENGTH);
  const version = header[PVR_CONSTANTS.MAGIC_NUMBER_INDEX];
  return version === PVR_CONSTANTS.MAGIC_NUMBER || version === PVR_CONSTANTS.MAGIC_NUMBER_EXTRA;
}
function parsePVR(data) {
  const header = new Uint32Array(data, 0, PVR_CONSTANTS.HEADER_LENGTH);
  const pvrFormat = header[PVR_CONSTANTS.PIXEL_FORMAT_INDEX];
  const colourSpace = header[PVR_CONSTANTS.COLOUR_SPACE_INDEX];
  const pixelFormats = PVR_PIXEL_FORMATS[pvrFormat] || [];
  const internalFormat = pixelFormats.length > 1 && colourSpace ? pixelFormats[1] : pixelFormats[0];
  const sizeFunction = PVR_SIZE_FUNCTIONS[pvrFormat];
  const mipMapLevels = header[PVR_CONSTANTS.MIPMAPCOUNT_INDEX];
  const width = header[PVR_CONSTANTS.WIDTH_INDEX];
  const height = header[PVR_CONSTANTS.HEIGHT_INDEX];
  const dataOffset = PVR_CONSTANTS.HEADER_SIZE + header[PVR_CONSTANTS.METADATA_SIZE_INDEX];
  const image = new Uint8Array(data, dataOffset);
  return extractMipmapImages(image, {
    mipMapLevels,
    width,
    height,
    sizeFunction,
    internalFormat
  });
}
function pvrtc2bppSize(width, height) {
  width = Math.max(width, 16);
  height = Math.max(height, 8);
  return width * height / 4;
}
function pvrtc4bppSize(width, height) {
  width = Math.max(width, 8);
  height = Math.max(height, 8);
  return width * height / 2;
}
function dxtEtcSmallSize(width, height) {
  return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
}
function dxtEtcAstcBigSize(width, height) {
  return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
}
function atc5x4Size(width, height) {
  return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
}
function atc5x5Size(width, height) {
  return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
}
function atc6x5Size(width, height) {
  return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
}
function atc6x6Size(width, height) {
  return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
}
function atc8x5Size(width, height) {
  return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
}
function atc8x6Size(width, height) {
  return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
}
function atc8x8Size(width, height) {
  return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
}
function atc10x5Size(width, height) {
  return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
}
function atc10x6Size(width, height) {
  return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
}
function atc10x8Size(width, height) {
  return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
}
function atc10x10Size(width, height) {
  return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
}
function atc12x10Size(width, height) {
  return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
}
function atc12x12Size(width, height) {
  return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;
}

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-compressed-texture.js
function parseCompressedTexture(data) {
  if (isKTX(data)) {
    return parseKTX(data);
  }
  if (isDDS(data)) {
    return parseDDS(data);
  }
  if (isPVR(data)) {
    return parsePVR(data);
  }
  throw new Error("Texture container format not recognized");
}

// node_modules/@loaders.gl/textures/dist/compressed-texture-loader.js
var CompressedTextureWorkerLoader = {
  dataType: null,
  batchType: null,
  name: "Texture Containers",
  id: "compressed-texture",
  module: "textures",
  version: VERSION,
  worker: true,
  extensions: [
    "ktx",
    "ktx2",
    "dds",
    // WEBGL_compressed_texture_s3tc, WEBGL_compressed_texture_atc
    "pvr"
    // WEBGL_compressed_texture_pvrtc
  ],
  mimeTypes: [
    "image/ktx2",
    "image/ktx",
    "image/vnd-ms.dds",
    "image/x-dds",
    "application/octet-stream"
  ],
  binary: true,
  options: {
    "compressed-texture": {
      libraryPath: "libs/",
      useBasis: false
    }
  }
};
var CompressedTextureLoader = {
  ...CompressedTextureWorkerLoader,
  parse: async (arrayBuffer, options) => {
    var _a;
    if ((_a = options == null ? void 0 : options["compressed-texture"]) == null ? void 0 : _a.useBasis) {
      options.basis = {
        format: {
          alpha: "BC3",
          noAlpha: "BC1"
        },
        // @ts-expect-error TODO not allowed to modify inputs
        ...options.basis,
        containerFormat: "ktx2",
        module: "encoder"
      };
      const result = await parseBasis(arrayBuffer, options);
      return result[0];
    }
    return parseCompressedTexture(arrayBuffer);
  }
};

// node_modules/@loaders.gl/textures/dist/lib/parsers/parse-npy.js
var a = new Uint32Array([305419896]);
var b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
var isLittleEndian = !(b[0] === 18);
var LITTLE_ENDIAN_OS = isLittleEndian;
var DTYPES = {
  u1: Uint8Array,
  i1: Int8Array,
  u2: Uint16Array,
  i2: Int16Array,
  u4: Uint32Array,
  i4: Int32Array,
  f4: Float32Array,
  f8: Float64Array
};
function parseNPY(arrayBuffer, options) {
  var _a;
  const view = new DataView(arrayBuffer);
  const { header, headerEndOffset } = parseHeader(view);
  const numpyType = header.descr;
  const ArrayType = DTYPES[numpyType.slice(1, 3)];
  if (!ArrayType) {
    throw new Error(`Unimplemented type ${numpyType}`);
  }
  const nArrayElements = (_a = header.shape) == null ? void 0 : _a.reduce((a2, b2) => a2 * b2);
  const arrayByteLength = nArrayElements * ArrayType.BYTES_PER_ELEMENT;
  if (arrayBuffer.byteLength < headerEndOffset + arrayByteLength) {
    throw new Error("Buffer overflow");
  }
  const data = new ArrayType(arrayBuffer.slice(headerEndOffset, headerEndOffset + arrayByteLength));
  if (numpyType[0] === ">" && LITTLE_ENDIAN_OS || numpyType[0] === "<" && !LITTLE_ENDIAN_OS) {
    throw new Error("Incorrect endianness");
  }
  return {
    data,
    header
  };
}
function parseHeader(view) {
  const majorVersion = view.getUint8(6);
  let offset = 8;
  let headerLength;
  if (majorVersion >= 2) {
    headerLength = view.getUint32(offset, true);
    offset += 4;
  } else {
    headerLength = view.getUint16(offset, true);
    offset += 2;
  }
  const encoding = majorVersion <= 2 ? "latin1" : "utf-8";
  const decoder = new TextDecoder(encoding);
  const headerArray = new Uint8Array(view.buffer, offset, headerLength);
  const headerText = decoder.decode(headerArray);
  offset += headerLength;
  const header = JSON.parse(headerText.replace(/'/g, '"').replace("False", "false").replace("(", "[").replace(/,*\),*/g, "]"));
  return { header, headerEndOffset: offset };
}

// node_modules/@loaders.gl/textures/dist/npy-loader.js
var NPY_MAGIC_NUMBER = new Uint8Array([147, 78, 85, 77, 80, 89]);
var NPYWorkerLoader = {
  dataType: null,
  batchType: null,
  name: "NPY",
  id: "npy",
  module: "textures",
  version: VERSION,
  worker: true,
  extensions: ["npy"],
  mimeTypes: [],
  tests: [NPY_MAGIC_NUMBER.buffer],
  options: {
    npy: {}
  }
};
var NPYLoader = {
  ...NPYWorkerLoader,
  parseSync: parseNPY,
  parse: async (arrayBuffer, options) => parseNPY(arrayBuffer, options)
};

// node_modules/@luma.gl/gltf/dist/gltf/gltf-animator.js
var ATTRIBUTE_TYPE_TO_COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
};
var GLTFAnimation = class {
  constructor(props) {
    __publicField(this, "name");
    __publicField(this, "startTime", 0);
    __publicField(this, "playing", true);
    __publicField(this, "speed", 1);
    __publicField(this, "channels", []);
    Object.assign(this, props);
  }
  animate(timeMs) {
    if (!this.playing) {
      return;
    }
    const absTime = timeMs / 1e3;
    const time = (absTime - this.startTime) * this.speed;
    this.channels.forEach(({ sampler, target, path }) => {
      interpolate(time, sampler, target, path);
      applyTranslationRotationScale(target, target._node);
    });
  }
};
var GLTFAnimator = class {
  constructor(gltf) {
    __publicField(this, "animations");
    this.animations = gltf.animations.map((animation, index) => {
      const name12 = animation.name || `Animation-${index}`;
      const samplers = animation.samplers.map(({ input, interpolation = "LINEAR", output }) => ({
        input: accessorToJsArray(gltf.accessors[input]),
        interpolation,
        output: accessorToJsArray(gltf.accessors[output])
      }));
      const channels = animation.channels.map(({ sampler, target }) => ({
        sampler: samplers[sampler],
        target: gltf.nodes[target.node],
        path: target.path
      }));
      return new GLTFAnimation({ name: name12, channels });
    });
  }
  /** @deprecated Use .setTime(). Will be removed (deck.gl is using this) */
  animate(time) {
    this.setTime(time);
  }
  setTime(time) {
    this.animations.forEach((animation) => animation.animate(time));
  }
  getAnimations() {
    return this.animations;
  }
};
function accessorToJsArray(accessor) {
  if (!accessor._animation) {
    const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY[accessor.componentType];
    const components = ATTRIBUTE_TYPE_TO_COMPONENTS[accessor.type];
    const length = components * accessor.count;
    const { buffer, byteOffset } = accessor.bufferView.data;
    const array = new ArrayType(buffer, byteOffset + (accessor.byteOffset || 0), length);
    if (components === 1) {
      accessor._animation = Array.from(array);
    } else {
      const slicedArray = [];
      for (let i = 0; i < array.length; i += components) {
        slicedArray.push(Array.from(array.slice(i, i + components)));
      }
      accessor._animation = slicedArray;
    }
  }
  return accessor._animation;
}
var helperMatrix = new Matrix4();
function applyTranslationRotationScale(gltfNode, node) {
  node.matrix.identity();
  if (gltfNode.translation) {
    node.matrix.translate(gltfNode.translation);
  }
  if (gltfNode.rotation) {
    const rotationMatrix = helperMatrix.fromQuaternion(gltfNode.rotation);
    node.matrix.multiplyRight(rotationMatrix);
  }
  if (gltfNode.scale) {
    node.matrix.scale(gltfNode.scale);
  }
}
var quaternion = new Quaternion();
function linearInterpolate(target, path, start, stop, ratio) {
  if (path === "rotation") {
    quaternion.slerp({ start, target: stop, ratio });
    for (let i = 0; i < quaternion.length; i++) {
      target[path][i] = quaternion[i];
    }
  } else {
    for (let i = 0; i < start.length; i++) {
      target[path][i] = ratio * stop[i] + (1 - ratio) * start[i];
    }
  }
}
function cubicsplineInterpolate(target, path, { p0, outTangent0, inTangent1, p1, tDiff, ratio: t }) {
  for (let i = 0; i < target[path].length; i++) {
    const m0 = outTangent0[i] * tDiff;
    const m1 = inTangent1[i] * tDiff;
    target[path][i] = (2 * Math.pow(t, 3) - 3 * Math.pow(t, 2) + 1) * p0[i] + (Math.pow(t, 3) - 2 * Math.pow(t, 2) + t) * m0 + (-2 * Math.pow(t, 3) + 3 * Math.pow(t, 2)) * p1[i] + (Math.pow(t, 3) - Math.pow(t, 2)) * m1;
  }
}
function stepInterpolate(target, path, value) {
  for (let i = 0; i < value.length; i++) {
    target[path][i] = value[i];
  }
}
function interpolate(time, { input, interpolation, output }, target, path) {
  const maxTime = input[input.length - 1];
  const animationTime = time % maxTime;
  const nextIndex = input.findIndex((t) => t >= animationTime);
  const previousIndex = Math.max(0, nextIndex - 1);
  if (!Array.isArray(target[path])) {
    switch (path) {
      case "translation":
        target[path] = [0, 0, 0];
        break;
      case "rotation":
        target[path] = [0, 0, 0, 1];
        break;
      case "scale":
        target[path] = [1, 1, 1];
        break;
      default:
        log.warn(`Bad animation path ${path}`)();
    }
  }
  const previousTime = input[previousIndex];
  const nextTime = input[nextIndex];
  switch (interpolation) {
    case "STEP":
      stepInterpolate(target, path, output[previousIndex]);
      break;
    case "LINEAR":
      if (nextTime > previousTime) {
        const ratio = (animationTime - previousTime) / (nextTime - previousTime);
        linearInterpolate(target, path, output[previousIndex], output[nextIndex], ratio);
      }
      break;
    case "CUBICSPLINE":
      if (nextTime > previousTime) {
        const ratio = (animationTime - previousTime) / (nextTime - previousTime);
        const tDiff = nextTime - previousTime;
        const p0 = output[3 * previousIndex + 1];
        const outTangent0 = output[3 * previousIndex + 2];
        const inTangent1 = output[3 * nextIndex + 0];
        const p1 = output[3 * nextIndex + 1];
        cubicsplineInterpolate(target, path, { p0, outTangent0, inTangent1, p1, tDiff, ratio });
      }
      break;
    default:
      log.warn(`Interpolation ${interpolation} not supported`)();
      break;
  }
}

// node_modules/@luma.gl/gltf/dist/gltf/create-gltf-model.js
var SHADER = (
  /* WGSL */
  `
layout(0) positions: vec4; // in vec4 POSITION;

  #ifdef HAS_NORMALS
    in vec4 normals; // in vec4 NORMAL;
  #endif

  #ifdef HAS_TANGENTS
    in vec4 TANGENT;
  #endif

  #ifdef HAS_UV
    // in vec2 TEXCOORD_0;
    in vec2 texCoords;
  #endif

@vertex
  void main(void) {
    vec4 _NORMAL = vec4(0.);
    vec4 _TANGENT = vec4(0.);
    vec2 _TEXCOORD_0 = vec2(0.);

    #ifdef HAS_NORMALS
      _NORMAL = normals;
    #endif

    #ifdef HAS_TANGENTS
      _TANGENT = TANGENT;
    #endif

    #ifdef HAS_UV
      _TEXCOORD_0 = texCoords;
    #endif

    pbr_setPositionNormalTangentUV(positions, _NORMAL, _TANGENT, _TEXCOORD_0);
    gl_Position = u_MVPMatrix * positions;
  }

@fragment
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`
);
var vs = (
  /* glsl */
  `#version 300 es

  // in vec4 POSITION;
  in vec4 positions;

  #ifdef HAS_NORMALS
    // in vec4 NORMAL;
    in vec4 normals;
  #endif

  #ifdef HAS_TANGENTS
    in vec4 TANGENT;
  #endif

  #ifdef HAS_UV
    // in vec2 TEXCOORD_0;
    in vec2 texCoords;
  #endif

  void main(void) {
    vec4 _NORMAL = vec4(0.);
    vec4 _TANGENT = vec4(0.);
    vec2 _TEXCOORD_0 = vec2(0.);

    #ifdef HAS_NORMALS
      _NORMAL = normals;
    #endif

    #ifdef HAS_TANGENTS
      _TANGENT = TANGENT;
    #endif

    #ifdef HAS_UV
      _TEXCOORD_0 = texCoords;
    #endif

    pbr_setPositionNormalTangentUV(positions, _NORMAL, _TANGENT, _TEXCOORD_0);
    gl_Position = pbrProjection.modelViewProjectionMatrix * positions;
  }
`
);
var fs = (
  /* glsl */
  `#version 300 es
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`
);
function createGLTFModel(device, options) {
  const { id, geometry, material, vertexCount, materialOptions, modelOptions } = options;
  const parsedMaterial = parsePBRMaterial(device, material, geometry.attributes, materialOptions);
  log.info(4, "createGLTFModel defines: ", parsedMaterial.defines)();
  const managedResources = [];
  const parameters = {
    depthWriteEnabled: true,
    depthCompare: "less",
    depthFormat: "depth24plus",
    cullMode: "back"
  };
  const modelProps = {
    id,
    source: SHADER,
    vs,
    fs,
    geometry,
    topology: geometry.topology,
    vertexCount,
    modules: [pbrMaterial],
    ...modelOptions,
    defines: { ...parsedMaterial.defines, ...modelOptions.defines },
    parameters: { ...parameters, ...parsedMaterial.parameters, ...modelOptions.parameters }
  };
  const model = new Model(device, modelProps);
  const { camera, ...pbrMaterialProps } = {
    ...parsedMaterial.uniforms,
    ...modelOptions.uniforms,
    ...parsedMaterial.bindings,
    ...modelOptions.bindings
  };
  model.shaderInputs.setProps({ pbrMaterial: pbrMaterialProps, pbrProjection: { camera } });
  return new ModelNode({ managedResources, model });
}

// node_modules/@luma.gl/gltf/dist/gltf/gl-utils.js
var GLEnum2;
(function(GLEnum3) {
  GLEnum3[GLEnum3["POINTS"] = 0] = "POINTS";
  GLEnum3[GLEnum3["LINES"] = 1] = "LINES";
  GLEnum3[GLEnum3["LINE_LOOP"] = 2] = "LINE_LOOP";
  GLEnum3[GLEnum3["LINE_STRIP"] = 3] = "LINE_STRIP";
  GLEnum3[GLEnum3["TRIANGLES"] = 4] = "TRIANGLES";
  GLEnum3[GLEnum3["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
  GLEnum3[GLEnum3["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
})(GLEnum2 || (GLEnum2 = {}));
function convertGLDrawModeToTopology(drawMode) {
  switch (drawMode) {
    case GLEnum2.POINTS:
      return "point-list";
    case GLEnum2.LINES:
      return "line-list";
    case GLEnum2.LINE_STRIP:
      return "line-strip";
    case GLEnum2.TRIANGLES:
      return "triangle-list";
    case GLEnum2.TRIANGLE_STRIP:
      return "triangle-strip";
    default:
      throw new Error(String(drawMode));
  }
}

// node_modules/@luma.gl/gltf/dist/gltf/gltf-instantiator.js
var DEFAULT_OPTIONS = {
  modelOptions: {},
  pbrDebug: false,
  imageBasedLightingEnvironment: null,
  lights: true,
  useTangents: false
};
var GLTFInstantiator = class {
  constructor(device, options = {}) {
    __publicField(this, "device");
    __publicField(this, "options");
    __publicField(this, "gltf");
    this.device = device;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  instantiate(gltf) {
    this.gltf = deepCopy(gltf);
    const scenes = (this.gltf.scenes || []).map((scene) => this.createScene(scene));
    return scenes;
  }
  createAnimator() {
    if (Array.isArray(this.gltf.animations)) {
      return new GLTFAnimator(this.gltf);
    }
    return null;
  }
  createScene(gltfScene) {
    const gltfNodes = gltfScene.nodes || [];
    const nodes = gltfNodes.map((node) => this.createNode(node));
    const scene = new GroupNode({
      id: gltfScene.name || gltfScene.id,
      children: nodes
    });
    return scene;
  }
  createNode(gltfNode) {
    if (!gltfNode._node) {
      const gltfChildren = gltfNode.children || [];
      const children = gltfChildren.map((child) => this.createNode(child));
      if (gltfNode.mesh) {
        children.push(this.createMesh(gltfNode.mesh));
      }
      const node = new GroupNode({
        id: gltfNode.name || gltfNode.id,
        children
      });
      if (gltfNode.matrix) {
        node.setMatrix(gltfNode.matrix);
      } else {
        node.matrix.identity();
        if (gltfNode.translation) {
          node.matrix.translate(gltfNode.translation);
        }
        if (gltfNode.rotation) {
          const rotationMatrix = new Matrix4().fromQuaternion(gltfNode.rotation);
          node.matrix.multiplyRight(rotationMatrix);
        }
        if (gltfNode.scale) {
          node.matrix.scale(gltfNode.scale);
        }
      }
      gltfNode._node = node;
    }
    const topLevelNode = this.gltf.nodes.find((node) => node.id === gltfNode.id);
    topLevelNode._node = gltfNode._node;
    return gltfNode._node;
  }
  createMesh(gltfMesh) {
    if (!gltfMesh._mesh) {
      const gltfPrimitives = gltfMesh.primitives || [];
      const primitives = gltfPrimitives.map((gltfPrimitive, i) => this.createPrimitive(gltfPrimitive, i, gltfMesh));
      const mesh = new GroupNode({
        id: gltfMesh.name || gltfMesh.id,
        children: primitives
      });
      gltfMesh._mesh = mesh;
    }
    return gltfMesh._mesh;
  }
  createPrimitive(gltfPrimitive, i, gltfMesh) {
    const id = gltfPrimitive.name || `${gltfMesh.name || gltfMesh.id}-primitive-${i}`;
    const topology = convertGLDrawModeToTopology(gltfPrimitive.mode || 4);
    const vertexCount = gltfPrimitive.indices ? gltfPrimitive.indices.count : this.getVertexCount(gltfPrimitive.attributes);
    const modelNode = createGLTFModel(this.device, {
      id,
      geometry: this.createGeometry(id, gltfPrimitive, topology),
      material: gltfPrimitive.material,
      materialOptions: this.options,
      modelOptions: this.options.modelOptions,
      vertexCount
    });
    modelNode.bounds = [
      gltfPrimitive.attributes.POSITION.min,
      gltfPrimitive.attributes.POSITION.max
    ];
    return modelNode;
  }
  getVertexCount(attributes) {
    throw new Error("getVertexCount not implemented");
  }
  createGeometry(id, gltfPrimitive, topology) {
    const attributes = {};
    for (const [attributeName, attribute] of Object.entries(gltfPrimitive.attributes)) {
      const { components, size, value } = attribute;
      attributes[attributeName] = { size: size ?? components, value };
    }
    return new Geometry({
      id,
      topology,
      indices: gltfPrimitive.indices.value,
      attributes
    });
  }
  createBuffer(attribute, usage) {
    if (!attribute.bufferView) {
      attribute.bufferView = {};
    }
    const { bufferView } = attribute;
    if (!bufferView.lumaBuffers) {
      bufferView.lumaBuffers = {};
    }
    if (!bufferView.lumaBuffers[usage]) {
      bufferView.lumaBuffers[usage] = this.device.createBuffer({
        id: `from-${bufferView.id}`,
        // Draco decoded files have attribute.value
        data: bufferView.data || attribute.value
      });
    }
    return bufferView.lumaBuffers[usage];
  }
  // TODO - create sampler in WebGL2
  createSampler(gltfSampler) {
    return gltfSampler;
  }
  // Helper methods (move to GLTFLoader.resolve...?)
  needsPOT() {
    return false;
  }
};
function deepCopy(object) {
  if (ArrayBuffer.isView(object) || object instanceof ArrayBuffer || object instanceof ImageBitmap) {
    return object;
  }
  if (Array.isArray(object)) {
    return object.map(deepCopy);
  }
  if (object && typeof object === "object") {
    const result = {};
    for (const key in object) {
      result[key] = deepCopy(object[key]);
    }
    return result;
  }
  return object;
}

// node_modules/@luma.gl/gltf/dist/gltf/create-gltf-objects.js
function createScenegraphsFromGLTF(device, gltf, options) {
  const instantiator = new GLTFInstantiator(device, options);
  const scenes = instantiator.instantiate(gltf);
  const animator = instantiator.createAnimator();
  return { scenes, animator };
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_mesh_features.js
var EXT_mesh_features_exports = {};
__export(EXT_mesh_features_exports, {
  createExtMeshFeatures: () => createExtMeshFeatures,
  decode: () => decode,
  encode: () => encode,
  name: () => name
});

// node_modules/@loaders.gl/gltf/dist/lib/utils/assert.js
function assert2(condition, message) {
  if (!condition) {
    throw new Error(message || "assert failed: gltf");
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/gltf-utils/gltf-constants.js
var COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var BYTES = {
  5120: 1,
  // BYTE
  5121: 1,
  // UNSIGNED_BYTE
  5122: 2,
  // SHORT
  5123: 2,
  // UNSIGNED_SHORT
  5125: 4,
  // UNSIGNED_INT
  5126: 4
  // FLOAT
};

// node_modules/@loaders.gl/gltf/dist/lib/gltf-utils/gltf-utils.js
var TYPES = ["SCALAR", "VEC2", "VEC3", "VEC4"];
var ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT = [
  [Int8Array, 5120],
  [Uint8Array, 5121],
  [Int16Array, 5122],
  [Uint16Array, 5123],
  [Uint32Array, 5125],
  [Float32Array, 5126],
  [Float64Array, 5130]
];
var ARRAY_TO_COMPONENT_TYPE = new Map(ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT);
var ATTRIBUTE_TYPE_TO_COMPONENTS2 = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4
};
var ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY2 = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
};
function getAccessorTypeFromSize(size) {
  const type = TYPES[size - 1];
  return type || TYPES[0];
}
function getComponentTypeFromArray(typedArray) {
  const componentType = ARRAY_TO_COMPONENT_TYPE.get(typedArray.constructor);
  if (!componentType) {
    throw new Error("Illegal typed array");
  }
  return componentType;
}
function getAccessorArrayTypeAndLength(accessor, bufferView) {
  const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY2[accessor.componentType];
  const components = ATTRIBUTE_TYPE_TO_COMPONENTS2[accessor.type];
  const bytesPerComponent = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE[accessor.componentType];
  const length = accessor.count * components;
  const byteLength = accessor.count * components * bytesPerComponent;
  assert2(byteLength >= 0 && byteLength <= bufferView.byteLength);
  const componentByteSize = BYTES[accessor.componentType];
  const numberOfComponentsInElement = COMPONENTS[accessor.type];
  return { ArrayType, length, byteLength, componentByteSize, numberOfComponentsInElement };
}

// node_modules/@loaders.gl/gltf/dist/lib/gltf-utils/get-typed-array.js
function getTypedArrayForBufferView(json, buffers, bufferViewIndex) {
  const bufferView = json.bufferViews[bufferViewIndex];
  assert2(bufferView);
  const bufferIndex = bufferView.buffer;
  const binChunk = buffers[bufferIndex];
  assert2(binChunk);
  const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
  return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
}
function getTypedArrayForAccessor(json, buffers, accessor) {
  var _a, _b;
  const gltfAccessor = typeof accessor === "number" ? (_a = json.accessors) == null ? void 0 : _a[accessor] : accessor;
  if (!gltfAccessor) {
    throw new Error(`No gltf accessor ${JSON.stringify(accessor)}`);
  }
  const bufferView = (_b = json.bufferViews) == null ? void 0 : _b[gltfAccessor.bufferView || 0];
  if (!bufferView) {
    throw new Error(`No gltf buffer view for accessor ${bufferView}`);
  }
  const { arrayBuffer, byteOffset: bufferByteOffset } = buffers[bufferView.buffer];
  const byteOffset = (bufferByteOffset || 0) + (gltfAccessor.byteOffset || 0) + (bufferView.byteOffset || 0);
  const { ArrayType, length, componentByteSize, numberOfComponentsInElement } = getAccessorArrayTypeAndLength(gltfAccessor, bufferView);
  const elementByteSize = componentByteSize * numberOfComponentsInElement;
  const elementAddressScale = bufferView.byteStride || elementByteSize;
  if (typeof bufferView.byteStride === "undefined" || bufferView.byteStride === elementByteSize) {
    const result2 = new ArrayType(arrayBuffer, byteOffset, length);
    return result2;
  }
  const result = new ArrayType(length);
  for (let i = 0; i < gltfAccessor.count; i++) {
    const values = new ArrayType(arrayBuffer, byteOffset + i * elementAddressScale, numberOfComponentsInElement);
    result.set(values, i * numberOfComponentsInElement);
  }
  return result;
}

// node_modules/@loaders.gl/gltf/dist/lib/api/gltf-scenegraph.js
function makeDefaultGLTFJson() {
  return {
    asset: {
      version: "2.0",
      generator: "loaders.gl"
    },
    buffers: [],
    extensions: {},
    extensionsRequired: [],
    extensionsUsed: []
  };
}
var GLTFScenegraph = class {
  // TODO - why is this not GLTFWithBuffers - what happens to images?
  constructor(gltf) {
    // internal
    __publicField(this, "gltf");
    __publicField(this, "sourceBuffers");
    __publicField(this, "byteLength");
    this.gltf = {
      json: (gltf == null ? void 0 : gltf.json) || makeDefaultGLTFJson(),
      buffers: (gltf == null ? void 0 : gltf.buffers) || [],
      images: (gltf == null ? void 0 : gltf.images) || []
    };
    this.sourceBuffers = [];
    this.byteLength = 0;
    if (this.gltf.buffers && this.gltf.buffers[0]) {
      this.byteLength = this.gltf.buffers[0].byteLength;
      this.sourceBuffers = [this.gltf.buffers[0]];
    }
  }
  // Accessors
  get json() {
    return this.gltf.json;
  }
  getApplicationData(key) {
    const data = this.json[key];
    return data;
  }
  getExtraData(key) {
    const extras = this.json.extras || {};
    return extras[key];
  }
  hasExtension(extensionName) {
    const isUsedExtension = this.getUsedExtensions().find((name12) => name12 === extensionName);
    const isRequiredExtension = this.getRequiredExtensions().find((name12) => name12 === extensionName);
    return typeof isUsedExtension === "string" || typeof isRequiredExtension === "string";
  }
  getExtension(extensionName) {
    const isExtension = this.getUsedExtensions().find((name12) => name12 === extensionName);
    const extensions = this.json.extensions || {};
    return isExtension ? extensions[extensionName] : null;
  }
  getRequiredExtension(extensionName) {
    const isRequired = this.getRequiredExtensions().find((name12) => name12 === extensionName);
    return isRequired ? this.getExtension(extensionName) : null;
  }
  getRequiredExtensions() {
    return this.json.extensionsRequired || [];
  }
  getUsedExtensions() {
    return this.json.extensionsUsed || [];
  }
  getRemovedExtensions() {
    return this.json.extensionsRemoved || [];
  }
  getObjectExtension(object, extensionName) {
    const extensions = object.extensions || {};
    return extensions[extensionName];
  }
  getScene(index) {
    return this.getObject("scenes", index);
  }
  getNode(index) {
    return this.getObject("nodes", index);
  }
  getSkin(index) {
    return this.getObject("skins", index);
  }
  getMesh(index) {
    return this.getObject("meshes", index);
  }
  getMaterial(index) {
    return this.getObject("materials", index);
  }
  getAccessor(index) {
    return this.getObject("accessors", index);
  }
  // getCamera(index: number): object | null {
  //   return null; // TODO: fix thi: object  as null;
  // }
  getTexture(index) {
    return this.getObject("textures", index);
  }
  getSampler(index) {
    return this.getObject("samplers", index);
  }
  getImage(index) {
    return this.getObject("images", index);
  }
  getBufferView(index) {
    return this.getObject("bufferViews", index);
  }
  getBuffer(index) {
    return this.getObject("buffers", index);
  }
  getObject(array, index) {
    if (typeof index === "object") {
      return index;
    }
    const object = this.json[array] && this.json[array][index];
    if (!object) {
      throw new Error(`glTF file error: Could not find ${array}[${index}]`);
    }
    return object;
  }
  /**
   * Accepts buffer view index or buffer view object
   * @returns a `Uint8Array`
   */
  getTypedArrayForBufferView(bufferView) {
    bufferView = this.getBufferView(bufferView);
    const bufferIndex = bufferView.buffer;
    const binChunk = this.gltf.buffers[bufferIndex];
    assert2(binChunk);
    const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
    return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
  }
  /** Accepts accessor index or accessor object
   * @returns a typed array with type that matches the types
   */
  getTypedArrayForAccessor(accessor) {
    const gltfAccessor = this.getAccessor(accessor);
    return getTypedArrayForAccessor(this.gltf.json, this.gltf.buffers, gltfAccessor);
  }
  /** accepts accessor index or accessor object
   * returns a `Uint8Array`
   */
  getTypedArrayForImageData(image) {
    image = this.getAccessor(image);
    const bufferView = this.getBufferView(image.bufferView);
    const buffer = this.getBuffer(bufferView.buffer);
    const arrayBuffer = buffer.data;
    const byteOffset = bufferView.byteOffset || 0;
    return new Uint8Array(arrayBuffer, byteOffset, bufferView.byteLength);
  }
  // MODIFERS
  /**
   * Add an extra application-defined key to the top-level data structure
   */
  addApplicationData(key, data) {
    this.json[key] = data;
    return this;
  }
  /**
   * `extras` - Standard GLTF field for storing application specific data
   */
  addExtraData(key, data) {
    this.json.extras = this.json.extras || {};
    this.json.extras[key] = data;
    return this;
  }
  addObjectExtension(object, extensionName, data) {
    object.extensions = object.extensions || {};
    object.extensions[extensionName] = data;
    this.registerUsedExtension(extensionName);
    return this;
  }
  setObjectExtension(object, extensionName, data) {
    const extensions = object.extensions || {};
    extensions[extensionName] = data;
  }
  removeObjectExtension(object, extensionName) {
    const extensions = (object == null ? void 0 : object.extensions) || {};
    if (extensions[extensionName]) {
      this.json.extensionsRemoved = this.json.extensionsRemoved || [];
      const extensionsRemoved = this.json.extensionsRemoved;
      if (!extensionsRemoved.includes(extensionName)) {
        extensionsRemoved.push(extensionName);
      }
    }
    delete extensions[extensionName];
  }
  /**
   * Add to standard GLTF top level extension object, mark as used
   */
  addExtension(extensionName, extensionData = {}) {
    assert2(extensionData);
    this.json.extensions = this.json.extensions || {};
    this.json.extensions[extensionName] = extensionData;
    this.registerUsedExtension(extensionName);
    return extensionData;
  }
  /**
   * Standard GLTF top level extension object, mark as used and required
   */
  addRequiredExtension(extensionName, extensionData = {}) {
    assert2(extensionData);
    this.addExtension(extensionName, extensionData);
    this.registerRequiredExtension(extensionName);
    return extensionData;
  }
  /**
   * Add extensionName to list of used extensions
   */
  registerUsedExtension(extensionName) {
    this.json.extensionsUsed = this.json.extensionsUsed || [];
    if (!this.json.extensionsUsed.find((ext) => ext === extensionName)) {
      this.json.extensionsUsed.push(extensionName);
    }
  }
  /**
   * Add extensionName to list of required extensions
   */
  registerRequiredExtension(extensionName) {
    this.registerUsedExtension(extensionName);
    this.json.extensionsRequired = this.json.extensionsRequired || [];
    if (!this.json.extensionsRequired.find((ext) => ext === extensionName)) {
      this.json.extensionsRequired.push(extensionName);
    }
  }
  /**
   * Removes an extension from the top-level list
   */
  removeExtension(extensionName) {
    var _a;
    if ((_a = this.json.extensions) == null ? void 0 : _a[extensionName]) {
      this.json.extensionsRemoved = this.json.extensionsRemoved || [];
      const extensionsRemoved = this.json.extensionsRemoved;
      if (!extensionsRemoved.includes(extensionName)) {
        extensionsRemoved.push(extensionName);
      }
    }
    if (this.json.extensions) {
      delete this.json.extensions[extensionName];
    }
    if (this.json.extensionsRequired) {
      this._removeStringFromArray(this.json.extensionsRequired, extensionName);
    }
    if (this.json.extensionsUsed) {
      this._removeStringFromArray(this.json.extensionsUsed, extensionName);
    }
  }
  /**
   *  Set default scene which is to be displayed at load time
   */
  setDefaultScene(sceneIndex) {
    this.json.scene = sceneIndex;
  }
  /**
   * @todo: add more properties for scene initialization:
   *   name`, `extensions`, `extras`
   *   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-scene
   */
  addScene(scene) {
    const { nodeIndices } = scene;
    this.json.scenes = this.json.scenes || [];
    this.json.scenes.push({ nodes: nodeIndices });
    return this.json.scenes.length - 1;
  }
  /**
   * @todo: add more properties for node initialization:
   *   `name`, `extensions`, `extras`, `camera`, `children`, `skin`, `rotation`, `scale`, `translation`, `weights`
   *   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#node
   */
  addNode(node) {
    const { meshIndex, matrix } = node;
    this.json.nodes = this.json.nodes || [];
    const nodeData = { mesh: meshIndex };
    if (matrix) {
      nodeData.matrix = matrix;
    }
    this.json.nodes.push(nodeData);
    return this.json.nodes.length - 1;
  }
  /** Adds a mesh to the json part */
  addMesh(mesh) {
    const { attributes, indices, material, mode = 4 } = mesh;
    const accessors = this._addAttributes(attributes);
    const glTFMesh = {
      primitives: [
        {
          attributes: accessors,
          mode
        }
      ]
    };
    if (indices) {
      const indicesAccessor = this._addIndices(indices);
      glTFMesh.primitives[0].indices = indicesAccessor;
    }
    if (Number.isFinite(material)) {
      glTFMesh.primitives[0].material = material;
    }
    this.json.meshes = this.json.meshes || [];
    this.json.meshes.push(glTFMesh);
    return this.json.meshes.length - 1;
  }
  addPointCloud(attributes) {
    const accessorIndices = this._addAttributes(attributes);
    const glTFMesh = {
      primitives: [
        {
          attributes: accessorIndices,
          mode: 0
          // GL.POINTS
        }
      ]
    };
    this.json.meshes = this.json.meshes || [];
    this.json.meshes.push(glTFMesh);
    return this.json.meshes.length - 1;
  }
  /**
   * Adds a binary image. Builds glTF "JSON metadata" and saves buffer reference
   * Buffer will be copied into BIN chunk during "pack"
   * Currently encodes as glTF image
   * @param imageData
   * @param mimeType
   */
  addImage(imageData, mimeTypeOpt) {
    const metadata = getBinaryImageMetadata(imageData);
    const mimeType = mimeTypeOpt || (metadata == null ? void 0 : metadata.mimeType);
    const bufferViewIndex = this.addBufferView(imageData);
    const glTFImage = {
      bufferView: bufferViewIndex,
      mimeType
    };
    this.json.images = this.json.images || [];
    this.json.images.push(glTFImage);
    return this.json.images.length - 1;
  }
  /**
   * Add one untyped source buffer, create a matching glTF `bufferView`, and return its index
   * @param buffer
   */
  addBufferView(buffer, bufferIndex = 0, byteOffset = this.byteLength) {
    const byteLength = buffer.byteLength;
    assert2(Number.isFinite(byteLength));
    this.sourceBuffers = this.sourceBuffers || [];
    this.sourceBuffers.push(buffer);
    const glTFBufferView = {
      buffer: bufferIndex,
      // Write offset from the start of the binary body
      byteOffset,
      byteLength
    };
    this.byteLength += padToNBytes(byteLength, 4);
    this.json.bufferViews = this.json.bufferViews || [];
    this.json.bufferViews.push(glTFBufferView);
    return this.json.bufferViews.length - 1;
  }
  /**
   * Adds an accessor to a bufferView
   * @param bufferViewIndex
   * @param accessor
   */
  addAccessor(bufferViewIndex, accessor) {
    const glTFAccessor = {
      bufferView: bufferViewIndex,
      // @ts-ignore
      type: getAccessorTypeFromSize(accessor.size),
      // @ts-ignore
      componentType: accessor.componentType,
      // @ts-ignore
      count: accessor.count,
      // @ts-ignore
      max: accessor.max,
      // @ts-ignore
      min: accessor.min
    };
    this.json.accessors = this.json.accessors || [];
    this.json.accessors.push(glTFAccessor);
    return this.json.accessors.length - 1;
  }
  /**
   * Add a binary buffer. Builds glTF "JSON metadata" and saves buffer reference
   * Buffer will be copied into BIN chunk during "pack"
   * Currently encodes buffers as glTF accessors, but this could be optimized
   * @param sourceBuffer
   * @param accessor
   */
  addBinaryBuffer(sourceBuffer, accessor = { size: 3 }) {
    const bufferViewIndex = this.addBufferView(sourceBuffer);
    let minMax = { min: accessor.min, max: accessor.max };
    if (!minMax.min || !minMax.max) {
      minMax = this._getAccessorMinMax(sourceBuffer, accessor.size);
    }
    const accessorDefaults = {
      // @ts-ignore
      size: accessor.size,
      componentType: getComponentTypeFromArray(sourceBuffer),
      // @ts-ignore
      count: Math.round(sourceBuffer.length / accessor.size),
      min: minMax.min,
      max: minMax.max
    };
    return this.addAccessor(bufferViewIndex, Object.assign(accessorDefaults, accessor));
  }
  /**
   * Adds a texture to the json part
   * @todo: add more properties for texture initialization
   * `sampler`, `name`, `extensions`, `extras`
   * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#texture
   */
  addTexture(texture) {
    const { imageIndex } = texture;
    const glTFTexture = {
      source: imageIndex
    };
    this.json.textures = this.json.textures || [];
    this.json.textures.push(glTFTexture);
    return this.json.textures.length - 1;
  }
  /** Adds a material to the json part */
  addMaterial(pbrMaterialInfo) {
    this.json.materials = this.json.materials || [];
    this.json.materials.push(pbrMaterialInfo);
    return this.json.materials.length - 1;
  }
  /** Pack the binary chunk */
  createBinaryChunk() {
    var _a, _b;
    const totalByteLength = this.byteLength;
    const arrayBuffer = new ArrayBuffer(totalByteLength);
    const targetArray = new Uint8Array(arrayBuffer);
    let dstByteOffset = 0;
    for (const sourceBuffer of this.sourceBuffers || []) {
      dstByteOffset = copyToArray(sourceBuffer, targetArray, dstByteOffset);
    }
    if ((_b = (_a = this.json) == null ? void 0 : _a.buffers) == null ? void 0 : _b[0]) {
      this.json.buffers[0].byteLength = totalByteLength;
    } else {
      this.json.buffers = [{ byteLength: totalByteLength }];
    }
    this.gltf.binary = arrayBuffer;
    this.sourceBuffers = [arrayBuffer];
    this.gltf.buffers = [{ arrayBuffer, byteOffset: 0, byteLength: arrayBuffer.byteLength }];
  }
  // PRIVATE
  _removeStringFromArray(array, string) {
    let found = true;
    while (found) {
      const index = array.indexOf(string);
      if (index > -1) {
        array.splice(index, 1);
      } else {
        found = false;
      }
    }
  }
  /**
   * Add attributes to buffers and create `attributes` object which is part of `mesh`
   */
  _addAttributes(attributes = {}) {
    const result = {};
    for (const attributeKey in attributes) {
      const attributeData = attributes[attributeKey];
      const attrName = this._getGltfAttributeName(attributeKey);
      const accessor = this.addBinaryBuffer(attributeData.value, attributeData);
      result[attrName] = accessor;
    }
    return result;
  }
  /**
   * Add indices to buffers
   */
  _addIndices(indices) {
    return this.addBinaryBuffer(indices, { size: 1 });
  }
  /**
   * Deduce gltf specific attribue name from input attribute name
   */
  _getGltfAttributeName(attributeName) {
    switch (attributeName.toLowerCase()) {
      case "position":
      case "positions":
      case "vertices":
        return "POSITION";
      case "normal":
      case "normals":
        return "NORMAL";
      case "color":
      case "colors":
        return "COLOR_0";
      case "texcoord":
      case "texcoords":
        return "TEXCOORD_0";
      default:
        return attributeName;
    }
  }
  /**
   * Calculate `min` and `max` arrays of accessor according to spec:
   * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-accessor
   */
  _getAccessorMinMax(buffer, size) {
    const result = { min: null, max: null };
    if (buffer.length < size) {
      return result;
    }
    result.min = [];
    result.max = [];
    const initValues = buffer.subarray(0, size);
    for (const value of initValues) {
      result.min.push(value);
      result.max.push(value);
    }
    for (let index = size; index < buffer.length; index += size) {
      for (let componentIndex = 0; componentIndex < size; componentIndex++) {
        result.min[0 + componentIndex] = Math.min(
          // @ts-ignore
          result.min[0 + componentIndex],
          buffer[index + componentIndex]
        );
        result.max[0 + componentIndex] = Math.max(
          // @ts-ignore
          result.max[0 + componentIndex],
          buffer[index + componentIndex]
        );
      }
    }
    return result;
  }
};

// node_modules/@loaders.gl/gltf/dist/lib/extensions/utils/3d-tiles-utils.js
function emod(n) {
  return (n % 1 + 1) % 1;
}
var ATTRIBUTE_TYPE_TO_COMPONENTS3 = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
  BOOLEAN: 1,
  STRING: 1,
  ENUM: 1
};
var ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY3 = {
  INT8: Int8Array,
  UINT8: Uint8Array,
  INT16: Int16Array,
  UINT16: Uint16Array,
  INT32: Int32Array,
  UINT32: Uint32Array,
  INT64: BigInt64Array,
  UINT64: BigUint64Array,
  FLOAT32: Float32Array,
  FLOAT64: Float64Array
};
var ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2 = {
  INT8: 1,
  UINT8: 1,
  INT16: 2,
  UINT16: 2,
  INT32: 4,
  UINT32: 4,
  INT64: 8,
  UINT64: 8,
  FLOAT32: 4,
  FLOAT64: 8
};
function getArrayElementByteSize(attributeType, componentType) {
  return ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2[componentType] * ATTRIBUTE_TYPE_TO_COMPONENTS3[attributeType];
}
function getOffsetsForProperty(scenegraph, bufferViewIndex, offsetType, numberOfElements) {
  if (offsetType !== "UINT8" && offsetType !== "UINT16" && offsetType !== "UINT32" && offsetType !== "UINT64") {
    return null;
  }
  const arrayOffsetsBytes = scenegraph.getTypedArrayForBufferView(bufferViewIndex);
  const arrayOffsets = convertRawBufferToMetadataArray(
    arrayOffsetsBytes,
    "SCALAR",
    // offsets consist of ONE component
    offsetType,
    numberOfElements + 1
    // The number of offsets is equal to the property table `count` plus one.
  );
  if (arrayOffsets instanceof BigInt64Array || arrayOffsets instanceof BigUint64Array) {
    return null;
  }
  return arrayOffsets;
}
function convertRawBufferToMetadataArray(data, attributeType, componentType, elementCount = 1) {
  const numberOfComponents = ATTRIBUTE_TYPE_TO_COMPONENTS3[attributeType];
  const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY3[componentType];
  const size = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2[componentType];
  const length = elementCount * numberOfComponents;
  const byteLength = length * size;
  let buffer = data.buffer;
  let offset = data.byteOffset;
  if (offset % size !== 0) {
    const bufferArray = new Uint8Array(buffer);
    buffer = bufferArray.slice(offset, offset + byteLength).buffer;
    offset = 0;
  }
  return new ArrayType(buffer, offset, length);
}
function getPrimitiveTextureData(scenegraph, textureInfo, primitive) {
  var _a, _b, _c, _d, _e;
  const texCoordAccessorKey = `TEXCOORD_${textureInfo.texCoord || 0}`;
  const texCoordAccessorIndex = primitive.attributes[texCoordAccessorKey];
  const textureCoordinates = scenegraph.getTypedArrayForAccessor(texCoordAccessorIndex);
  const json = scenegraph.gltf.json;
  const textureIndex = textureInfo.index;
  const imageIndex = (_b = (_a = json.textures) == null ? void 0 : _a[textureIndex]) == null ? void 0 : _b.source;
  if (typeof imageIndex !== "undefined") {
    const mimeType = (_d = (_c = json.images) == null ? void 0 : _c[imageIndex]) == null ? void 0 : _d.mimeType;
    const parsedImage = (_e = scenegraph.gltf.images) == null ? void 0 : _e[imageIndex];
    if (parsedImage && typeof parsedImage.width !== "undefined") {
      const textureData = [];
      for (let index = 0; index < textureCoordinates.length; index += 2) {
        const value = getImageValueByCoordinates(parsedImage, mimeType, textureCoordinates, index, textureInfo.channels);
        textureData.push(value);
      }
      return textureData;
    }
  }
  return [];
}
function primitivePropertyDataToAttributes(scenegraph, attributeName, propertyData, featureTable, primitive) {
  if (!(propertyData == null ? void 0 : propertyData.length)) {
    return;
  }
  const featureIndices = [];
  for (const texelData of propertyData) {
    let index = featureTable.findIndex((item) => item === texelData);
    if (index === -1) {
      index = featureTable.push(texelData) - 1;
    }
    featureIndices.push(index);
  }
  const typedArray = new Uint32Array(featureIndices);
  const bufferIndex = scenegraph.gltf.buffers.push({
    arrayBuffer: typedArray.buffer,
    byteOffset: typedArray.byteOffset,
    byteLength: typedArray.byteLength
  }) - 1;
  const bufferViewIndex = scenegraph.addBufferView(typedArray, bufferIndex, 0);
  const accessorIndex = scenegraph.addAccessor(bufferViewIndex, {
    size: 1,
    componentType: getComponentTypeFromArray(typedArray),
    count: typedArray.length
  });
  primitive.attributes[attributeName] = accessorIndex;
}
function getImageValueByCoordinates(parsedImage, mimeType, textureCoordinates, index, channels = [0]) {
  const CHANNELS_MAP = {
    r: { offset: 0, shift: 0 },
    g: { offset: 1, shift: 8 },
    b: { offset: 2, shift: 16 },
    a: { offset: 3, shift: 24 }
  };
  const u = textureCoordinates[index];
  const v = textureCoordinates[index + 1];
  let components = 1;
  if (mimeType && (mimeType.indexOf("image/jpeg") !== -1 || mimeType.indexOf("image/png") !== -1))
    components = 4;
  const offset = coordinatesToOffset(u, v, parsedImage, components);
  let value = 0;
  for (const c of channels) {
    const map = typeof c === "number" ? Object.values(CHANNELS_MAP)[c] : CHANNELS_MAP[c];
    const imageOffset = offset + map.offset;
    const imageData = getImageData(parsedImage);
    if (imageData.data.length <= imageOffset) {
      throw new Error(`${imageData.data.length} <= ${imageOffset}`);
    }
    const imageValue = imageData.data[imageOffset];
    value |= imageValue << map.shift;
  }
  return value;
}
function coordinatesToOffset(u, v, parsedImage, componentsCount = 1) {
  const w = parsedImage.width;
  const iX = emod(u) * (w - 1);
  const indX = Math.round(iX);
  const h = parsedImage.height;
  const iY = emod(v) * (h - 1);
  const indY = Math.round(iY);
  const components = parsedImage.components ? parsedImage.components : componentsCount;
  const offset = (indY * w + indX) * components;
  return offset;
}
function parseVariableLengthArrayNumeric(valuesData, numberOfElements, arrayOffsets, valuesDataBytesLength, valueSize) {
  const attributeValueArray = [];
  for (let index = 0; index < numberOfElements; index++) {
    const arrayOffset = arrayOffsets[index];
    const arrayByteSize = arrayOffsets[index + 1] - arrayOffsets[index];
    if (arrayByteSize + arrayOffset > valuesDataBytesLength) {
      break;
    }
    const typedArrayOffset = arrayOffset / valueSize;
    const elementCount = arrayByteSize / valueSize;
    attributeValueArray.push(valuesData.slice(typedArrayOffset, typedArrayOffset + elementCount));
  }
  return attributeValueArray;
}
function parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount) {
  const attributeValueArray = [];
  for (let index = 0; index < numberOfElements; index++) {
    const elementOffset = index * arrayCount;
    attributeValueArray.push(valuesData.slice(elementOffset, elementOffset + arrayCount));
  }
  return attributeValueArray;
}
function getPropertyDataString(numberOfElements, valuesDataBytes, arrayOffsets, stringOffsets) {
  if (arrayOffsets) {
    throw new Error("Not implemented - arrayOffsets for strings is specified");
  }
  if (stringOffsets) {
    const stringsArray = [];
    const textDecoder = new TextDecoder("utf8");
    let stringOffset = 0;
    for (let index = 0; index < numberOfElements; index++) {
      const stringByteSize = stringOffsets[index + 1] - stringOffsets[index];
      if (stringByteSize + stringOffset <= valuesDataBytes.length) {
        const stringData = valuesDataBytes.subarray(stringOffset, stringByteSize + stringOffset);
        const stringAttribute = textDecoder.decode(stringData);
        stringsArray.push(stringAttribute);
        stringOffset += stringByteSize;
      }
    }
    return stringsArray;
  }
  return [];
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_mesh_features.js
var EXT_MESH_FEATURES_NAME = "EXT_mesh_features";
var name = EXT_MESH_FEATURES_NAME;
async function decode(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  decodeExtMeshFeatures(scenegraph, options);
}
function encode(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  encodeExtMeshFeatures(scenegraph, options);
  scenegraph.createBinaryChunk();
  return scenegraph.gltf;
}
function decodeExtMeshFeatures(scenegraph, options) {
  const json = scenegraph.gltf.json;
  if (!json.meshes) {
    return;
  }
  for (const mesh of json.meshes) {
    for (const primitive of mesh.primitives) {
      processMeshPrimitiveFeatures(scenegraph, primitive, options);
    }
  }
}
function processMeshPrimitiveFeatures(scenegraph, primitive, options) {
  var _a, _b, _c;
  if (!((_a = options == null ? void 0 : options.gltf) == null ? void 0 : _a.loadBuffers)) {
    return;
  }
  const extension = (_b = primitive.extensions) == null ? void 0 : _b[EXT_MESH_FEATURES_NAME];
  const featureIds = extension == null ? void 0 : extension.featureIds;
  if (!featureIds) {
    return;
  }
  for (const featureId of featureIds) {
    let featureIdData;
    if (typeof featureId.attribute !== "undefined") {
      const accessorKey = `_FEATURE_ID_${featureId.attribute}`;
      const accessorIndex = primitive.attributes[accessorKey];
      featureIdData = scenegraph.getTypedArrayForAccessor(accessorIndex);
    } else if (typeof featureId.texture !== "undefined" && ((_c = options == null ? void 0 : options.gltf) == null ? void 0 : _c.loadImages)) {
      featureIdData = getPrimitiveTextureData(scenegraph, featureId.texture, primitive);
    } else {
      featureIdData = [];
    }
    featureId.data = featureIdData;
  }
}
function encodeExtMeshFeatures(scenegraph, options) {
  const meshes = scenegraph.gltf.json.meshes;
  if (!meshes) {
    return;
  }
  for (const mesh of meshes) {
    for (const primitive of mesh.primitives) {
      encodeExtMeshFeaturesForPrimitive(scenegraph, primitive);
    }
  }
}
function createExtMeshFeatures(scenegraph, primitive, featureIdArray, propertyTableIndex) {
  if (!primitive.extensions) {
    primitive.extensions = {};
  }
  let extension = primitive.extensions[EXT_MESH_FEATURES_NAME];
  if (!extension) {
    extension = { featureIds: [] };
    primitive.extensions[EXT_MESH_FEATURES_NAME] = extension;
  }
  const { featureIds } = extension;
  const featureId = {
    featureCount: featureIdArray.length,
    propertyTable: propertyTableIndex,
    data: featureIdArray
  };
  featureIds.push(featureId);
  scenegraph.addObjectExtension(primitive, EXT_MESH_FEATURES_NAME, extension);
}
function encodeExtMeshFeaturesForPrimitive(scenegraph, primitive) {
  var _a;
  const extension = (_a = primitive.extensions) == null ? void 0 : _a[EXT_MESH_FEATURES_NAME];
  if (!extension) {
    return;
  }
  const featureIds = extension.featureIds;
  featureIds.forEach((featureId, elementIndex) => {
    if (featureId.data) {
      const { accessorKey, index } = createAccessorKey(primitive.attributes);
      const typedArray = new Uint32Array(featureId.data);
      featureIds[elementIndex] = {
        featureCount: typedArray.length,
        propertyTable: featureId.propertyTable,
        attribute: index
      };
      scenegraph.gltf.buffers.push({
        arrayBuffer: typedArray.buffer,
        byteOffset: typedArray.byteOffset,
        byteLength: typedArray.byteLength
      });
      const bufferViewIndex = scenegraph.addBufferView(typedArray);
      const accessorIndex = scenegraph.addAccessor(bufferViewIndex, {
        size: 1,
        componentType: getComponentTypeFromArray(typedArray),
        count: typedArray.length
      });
      primitive.attributes[accessorKey] = accessorIndex;
    }
  });
}
function createAccessorKey(attributes) {
  const prefix = "_FEATURE_ID_";
  const attrs = Object.keys(attributes).filter((item) => item.indexOf(prefix) === 0);
  let max = -1;
  for (const a2 of attrs) {
    const n = Number(a2.substring(prefix.length));
    if (n > max) {
      max = n;
    }
  }
  max++;
  const accessorKey = `${prefix}${max}`;
  return { accessorKey, index: max };
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_structural_metadata.js
var EXT_structural_metadata_exports = {};
__export(EXT_structural_metadata_exports, {
  createExtStructuralMetadata: () => createExtStructuralMetadata,
  decode: () => decode2,
  encode: () => encode2,
  name: () => name2
});
var EXT_STRUCTURAL_METADATA_NAME = "EXT_structural_metadata";
var name2 = EXT_STRUCTURAL_METADATA_NAME;
async function decode2(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  decodeExtStructuralMetadata(scenegraph, options);
}
function encode2(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  encodeExtStructuralMetadata(scenegraph, options);
  scenegraph.createBinaryChunk();
  return scenegraph.gltf;
}
function decodeExtStructuralMetadata(scenegraph, options) {
  var _a, _b;
  if (!((_a = options.gltf) == null ? void 0 : _a.loadBuffers)) {
    return;
  }
  const extension = scenegraph.getExtension(EXT_STRUCTURAL_METADATA_NAME);
  if (!extension) {
    return;
  }
  if ((_b = options.gltf) == null ? void 0 : _b.loadImages) {
    decodePropertyTextures(scenegraph, extension);
  }
  decodePropertyTables(scenegraph, extension);
}
function decodePropertyTextures(scenegraph, extension) {
  const propertyTextures = extension.propertyTextures;
  const json = scenegraph.gltf.json;
  if (propertyTextures && json.meshes) {
    for (const mesh of json.meshes) {
      for (const primitive of mesh.primitives) {
        processPrimitivePropertyTextures(scenegraph, propertyTextures, primitive, extension);
      }
    }
  }
}
function decodePropertyTables(scenegraph, extension) {
  const schema = extension.schema;
  if (!schema) {
    return;
  }
  const schemaClasses = schema.classes;
  const propertyTables = extension.propertyTables;
  if (schemaClasses && propertyTables) {
    for (const schemaName in schemaClasses) {
      const propertyTable = findPropertyTableByClass(propertyTables, schemaName);
      if (propertyTable) {
        processPropertyTable(scenegraph, schema, propertyTable);
      }
    }
  }
}
function findPropertyTableByClass(propertyTables, schemaClassName) {
  for (const propertyTable of propertyTables) {
    if (propertyTable.class === schemaClassName) {
      return propertyTable;
    }
  }
  return null;
}
function processPrimitivePropertyTextures(scenegraph, propertyTextures, primitive, extension) {
  var _a;
  if (!propertyTextures) {
    return;
  }
  const primitiveExtension = (_a = primitive.extensions) == null ? void 0 : _a[EXT_STRUCTURAL_METADATA_NAME];
  const primitivePropertyTextureIndices = primitiveExtension == null ? void 0 : primitiveExtension.propertyTextures;
  if (!primitivePropertyTextureIndices) {
    return;
  }
  for (const primitivePropertyTextureIndex of primitivePropertyTextureIndices) {
    const propertyTexture = propertyTextures[primitivePropertyTextureIndex];
    processPrimitivePropertyTexture(scenegraph, propertyTexture, primitive, extension);
  }
}
function processPrimitivePropertyTexture(scenegraph, propertyTexture, primitive, extension) {
  var _a;
  if (!propertyTexture.properties) {
    return;
  }
  if (!extension.dataAttributeNames) {
    extension.dataAttributeNames = [];
  }
  const className = propertyTexture.class;
  for (const propertyName in propertyTexture.properties) {
    const attributeName = `${className}_${propertyName}`;
    const textureInfoTopLevel = (_a = propertyTexture.properties) == null ? void 0 : _a[propertyName];
    if (!textureInfoTopLevel) {
      continue;
    }
    if (!textureInfoTopLevel.data) {
      textureInfoTopLevel.data = [];
    }
    const featureTextureTable = textureInfoTopLevel.data;
    const propertyData = getPrimitiveTextureData(scenegraph, textureInfoTopLevel, primitive);
    if (propertyData === null) {
      continue;
    }
    primitivePropertyDataToAttributes(scenegraph, attributeName, propertyData, featureTextureTable, primitive);
    textureInfoTopLevel.data = featureTextureTable;
    extension.dataAttributeNames.push(attributeName);
  }
}
function processPropertyTable(scenegraph, schema, propertyTable) {
  var _a, _b;
  const schemaClass = (_a = schema.classes) == null ? void 0 : _a[propertyTable.class];
  if (!schemaClass) {
    throw new Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${propertyTable.class}`);
  }
  const numberOfElements = propertyTable.count;
  for (const propertyName in schemaClass.properties) {
    const classProperty = schemaClass.properties[propertyName];
    const propertyTableProperty = (_b = propertyTable.properties) == null ? void 0 : _b[propertyName];
    if (propertyTableProperty) {
      const data = getPropertyDataFromBinarySource(scenegraph, schema, classProperty, numberOfElements, propertyTableProperty);
      propertyTableProperty.data = data;
    }
  }
}
function getPropertyDataFromBinarySource(scenegraph, schema, classProperty, numberOfElements, propertyTableProperty) {
  let data = [];
  const valuesBufferView = propertyTableProperty.values;
  const valuesDataBytes = scenegraph.getTypedArrayForBufferView(valuesBufferView);
  const arrayOffsets = getArrayOffsetsForProperty(scenegraph, classProperty, propertyTableProperty, numberOfElements);
  const stringOffsets = getStringOffsetsForProperty(scenegraph, propertyTableProperty, numberOfElements);
  switch (classProperty.type) {
    case "SCALAR":
    case "VEC2":
    case "VEC3":
    case "VEC4":
    case "MAT2":
    case "MAT3":
    case "MAT4": {
      data = getPropertyDataNumeric(classProperty, numberOfElements, valuesDataBytes, arrayOffsets);
      break;
    }
    case "BOOLEAN": {
      throw new Error(`Not implemented - classProperty.type=${classProperty.type}`);
    }
    case "STRING": {
      data = getPropertyDataString(numberOfElements, valuesDataBytes, arrayOffsets, stringOffsets);
      break;
    }
    case "ENUM": {
      data = getPropertyDataENUM(schema, classProperty, numberOfElements, valuesDataBytes, arrayOffsets);
      break;
    }
    default:
      throw new Error(`Unknown classProperty type ${classProperty.type}`);
  }
  return data;
}
function getArrayOffsetsForProperty(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
  if (classProperty.array && // `count` is a number of array elements. May only be defined when `array` is true.
  // If `count` is NOT defined, it's a VARIABLE-length array
  typeof classProperty.count === "undefined" && // `arrayOffsets` is an index of the buffer view containing offsets for variable-length arrays.
  typeof propertyTableProperty.arrayOffsets !== "undefined") {
    return getOffsetsForProperty(scenegraph, propertyTableProperty.arrayOffsets, propertyTableProperty.arrayOffsetType || "UINT32", numberOfElements);
  }
  return null;
}
function getStringOffsetsForProperty(scenegraph, propertyTableProperty, numberOfElements) {
  if (typeof propertyTableProperty.stringOffsets !== "undefined") {
    return getOffsetsForProperty(scenegraph, propertyTableProperty.stringOffsets, propertyTableProperty.stringOffsetType || "UINT32", numberOfElements);
  }
  return null;
}
function getPropertyDataNumeric(classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
  const isArray = classProperty.array;
  const arrayCount = classProperty.count;
  const elementSize = getArrayElementByteSize(classProperty.type, classProperty.componentType);
  const elementCount = valuesDataBytes.byteLength / elementSize;
  let valuesData;
  if (classProperty.componentType) {
    valuesData = convertRawBufferToMetadataArray(
      valuesDataBytes,
      classProperty.type,
      // The datatype of the element's components. Only applicable to `SCALAR`, `VECN`, and `MATN` types.
      classProperty.componentType,
      elementCount
    );
  } else {
    valuesData = valuesDataBytes;
  }
  if (isArray) {
    if (arrayOffsets) {
      return parseVariableLengthArrayNumeric(valuesData, numberOfElements, arrayOffsets, valuesDataBytes.length, elementSize);
    }
    if (arrayCount) {
      return parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount);
    }
    return [];
  }
  return valuesData;
}
function getPropertyDataENUM(schema, classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
  var _a;
  const enumType = classProperty.enumType;
  if (!enumType) {
    throw new Error("Incorrect data in the EXT_structural_metadata extension: classProperty.enumType is not set for type ENUM");
  }
  const enumEntry = (_a = schema.enums) == null ? void 0 : _a[enumType];
  if (!enumEntry) {
    throw new Error(`Incorrect data in the EXT_structural_metadata extension: schema.enums does't contain ${enumType}`);
  }
  const enumValueType = enumEntry.valueType || "UINT16";
  const elementSize = getArrayElementByteSize(classProperty.type, enumValueType);
  const elementCount = valuesDataBytes.byteLength / elementSize;
  let valuesData = convertRawBufferToMetadataArray(valuesDataBytes, classProperty.type, enumValueType, elementCount);
  if (!valuesData) {
    valuesData = valuesDataBytes;
  }
  if (classProperty.array) {
    if (arrayOffsets) {
      return parseVariableLengthArrayENUM({
        valuesData,
        numberOfElements,
        arrayOffsets,
        valuesDataBytesLength: valuesDataBytes.length,
        elementSize,
        enumEntry
      });
    }
    const arrayCount = classProperty.count;
    if (arrayCount) {
      return parseFixedLengthArrayENUM(valuesData, numberOfElements, arrayCount, enumEntry);
    }
    return [];
  }
  return getEnumsArray(valuesData, 0, numberOfElements, enumEntry);
}
function parseVariableLengthArrayENUM(params) {
  const { valuesData, numberOfElements, arrayOffsets, valuesDataBytesLength, elementSize, enumEntry } = params;
  const attributeValueArray = [];
  for (let index = 0; index < numberOfElements; index++) {
    const arrayOffset = arrayOffsets[index];
    const arrayByteSize = arrayOffsets[index + 1] - arrayOffsets[index];
    if (arrayByteSize + arrayOffset > valuesDataBytesLength) {
      break;
    }
    const typedArrayOffset = arrayOffset / elementSize;
    const elementCount = arrayByteSize / elementSize;
    const array = getEnumsArray(valuesData, typedArrayOffset, elementCount, enumEntry);
    attributeValueArray.push(array);
  }
  return attributeValueArray;
}
function parseFixedLengthArrayENUM(valuesData, numberOfElements, arrayCount, enumEntry) {
  const attributeValueArray = [];
  for (let index = 0; index < numberOfElements; index++) {
    const elementOffset = arrayCount * index;
    const array = getEnumsArray(valuesData, elementOffset, arrayCount, enumEntry);
    attributeValueArray.push(array);
  }
  return attributeValueArray;
}
function getEnumsArray(valuesData, offset, count, enumEntry) {
  const array = [];
  for (let i = 0; i < count; i++) {
    if (valuesData instanceof BigInt64Array || valuesData instanceof BigUint64Array) {
      array.push("");
    } else {
      const value = valuesData[offset + i];
      const enumObject = getEnumByValue(enumEntry, value);
      if (enumObject) {
        array.push(enumObject.name);
      } else {
        array.push("");
      }
    }
  }
  return array;
}
function getEnumByValue(enumEntry, value) {
  for (const enumValue of enumEntry.values) {
    if (enumValue.value === value) {
      return enumValue;
    }
  }
  return null;
}
var SCHEMA_CLASS_ID_DEFAULT = "schemaClassId";
function encodeExtStructuralMetadata(scenegraph, options) {
  var _a, _b;
  const extension = scenegraph.getExtension(EXT_STRUCTURAL_METADATA_NAME);
  if (!extension) {
    return;
  }
  if (extension.propertyTables) {
    for (const table of extension.propertyTables) {
      const classId = table.class;
      const schemaClass = (_b = (_a = extension.schema) == null ? void 0 : _a.classes) == null ? void 0 : _b[classId];
      if (table.properties && schemaClass) {
        encodeProperties(table, schemaClass, scenegraph);
      }
    }
  }
}
function encodeProperties(table, schemaClass, scenegraph) {
  for (const propertyName in table.properties) {
    const data = table.properties[propertyName].data;
    if (data) {
      const classProperty = schemaClass.properties[propertyName];
      if (classProperty) {
        const tableProperty = createPropertyTableProperty(data, classProperty, scenegraph);
        table.properties[propertyName] = tableProperty;
      }
    }
  }
}
function createExtStructuralMetadata(scenegraph, propertyAttributes, classId = SCHEMA_CLASS_ID_DEFAULT) {
  let extension = scenegraph.getExtension(EXT_STRUCTURAL_METADATA_NAME);
  if (!extension) {
    extension = scenegraph.addExtension(EXT_STRUCTURAL_METADATA_NAME);
  }
  extension.schema = createSchema(propertyAttributes, classId, extension.schema);
  const table = createPropertyTable(propertyAttributes, classId, extension.schema);
  if (!extension.propertyTables) {
    extension.propertyTables = [];
  }
  return extension.propertyTables.push(table) - 1;
}
function createSchema(propertyAttributes, classId, schemaToUpdate) {
  const schema = schemaToUpdate ?? {
    id: "schema_id"
  };
  const schemaClass = {
    properties: {}
  };
  for (const attribute of propertyAttributes) {
    const classProperty = {
      type: attribute.elementType,
      componentType: attribute.componentType
    };
    schemaClass.properties[attribute.name] = classProperty;
  }
  schema.classes = {};
  schema.classes[classId] = schemaClass;
  return schema;
}
function createPropertyTable(propertyAttributes, classId, schema) {
  var _a;
  const table = {
    class: classId,
    count: 0
  };
  let count = 0;
  const schemaClass = (_a = schema.classes) == null ? void 0 : _a[classId];
  for (const attribute of propertyAttributes) {
    if (count === 0) {
      count = attribute.values.length;
    }
    if (count !== attribute.values.length && attribute.values.length) {
      throw new Error("Illegal values in attributes");
    }
    const classProperty = schemaClass == null ? void 0 : schemaClass.properties[attribute.name];
    if (classProperty) {
      if (!table.properties) {
        table.properties = {};
      }
      table.properties[attribute.name] = { values: 0, data: attribute.values };
    }
  }
  table.count = count;
  return table;
}
function createPropertyTableProperty(values, classProperty, scenegraph) {
  const prop = { values: 0 };
  if (classProperty.type === "STRING") {
    const { stringData, stringOffsets } = createPropertyDataString(values);
    prop.stringOffsets = createBufferView(stringOffsets, scenegraph);
    prop.values = createBufferView(stringData, scenegraph);
  } else if (classProperty.type === "SCALAR" && classProperty.componentType) {
    const data = createPropertyDataScalar(values, classProperty.componentType);
    prop.values = createBufferView(data, scenegraph);
  }
  return prop;
}
var COMPONENT_TYPE_TO_ARRAY_CONSTRUCTOR = {
  INT8: Int8Array,
  UINT8: Uint8Array,
  INT16: Int16Array,
  UINT16: Uint16Array,
  INT32: Int32Array,
  UINT32: Uint32Array,
  INT64: Int32Array,
  UINT64: Uint32Array,
  FLOAT32: Float32Array,
  FLOAT64: Float64Array
};
function createPropertyDataScalar(array, componentType) {
  const numberArray = [];
  for (const value of array) {
    numberArray.push(Number(value));
  }
  const Construct = COMPONENT_TYPE_TO_ARRAY_CONSTRUCTOR[componentType];
  if (!Construct) {
    throw new Error("Illegal component type");
  }
  return new Construct(numberArray);
}
function createPropertyDataString(strings) {
  const utf8Encode = new TextEncoder();
  const arr = [];
  let len = 0;
  for (const str of strings) {
    const uint8Array = utf8Encode.encode(str);
    len += uint8Array.length;
    arr.push(uint8Array);
  }
  const strArray = new Uint8Array(len);
  const strOffsets = [];
  let offset = 0;
  for (const str of arr) {
    strArray.set(str, offset);
    strOffsets.push(offset);
    offset += str.length;
  }
  strOffsets.push(offset);
  const stringOffsetsTypedArray = new Uint32Array(strOffsets);
  return { stringData: strArray, stringOffsets: stringOffsetsTypedArray };
}
function createBufferView(typedArray, scenegraph) {
  scenegraph.gltf.buffers.push({
    arrayBuffer: typedArray.buffer,
    byteOffset: typedArray.byteOffset,
    byteLength: typedArray.byteLength
  });
  return scenegraph.addBufferView(typedArray);
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/deprecated/EXT_feature_metadata.js
var EXT_feature_metadata_exports = {};
__export(EXT_feature_metadata_exports, {
  decode: () => decode3,
  name: () => name3
});
var EXT_FEATURE_METADATA_NAME = "EXT_feature_metadata";
var name3 = EXT_FEATURE_METADATA_NAME;
async function decode3(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  decodeExtFeatureMetadata(scenegraph, options);
}
function decodeExtFeatureMetadata(scenegraph, options) {
  var _a, _b;
  if (!((_a = options.gltf) == null ? void 0 : _a.loadBuffers)) {
    return;
  }
  const extension = scenegraph.getExtension(EXT_FEATURE_METADATA_NAME);
  if (!extension) {
    return;
  }
  if ((_b = options.gltf) == null ? void 0 : _b.loadImages) {
    decodePropertyTextures2(scenegraph, extension);
  }
  decodePropertyTables2(scenegraph, extension);
}
function decodePropertyTextures2(scenegraph, extension) {
  const schema = extension.schema;
  if (!schema) {
    return;
  }
  const schemaClasses = schema.classes;
  const { featureTextures } = extension;
  if (schemaClasses && featureTextures) {
    for (const schemaName in schemaClasses) {
      const schemaClass = schemaClasses[schemaName];
      const featureTexture = findFeatureTextureByClass(featureTextures, schemaName);
      if (featureTexture) {
        handleFeatureTextureProperties(scenegraph, featureTexture, schemaClass);
      }
    }
  }
}
function decodePropertyTables2(scenegraph, extension) {
  const schema = extension.schema;
  if (!schema) {
    return;
  }
  const schemaClasses = schema.classes;
  const propertyTables = extension.featureTables;
  if (schemaClasses && propertyTables) {
    for (const schemaName in schemaClasses) {
      const propertyTable = findPropertyTableByClass2(propertyTables, schemaName);
      if (propertyTable) {
        processPropertyTable2(scenegraph, schema, propertyTable);
      }
    }
  }
}
function findPropertyTableByClass2(propertyTables, schemaClassName) {
  for (const propertyTableName in propertyTables) {
    const propertyTable = propertyTables[propertyTableName];
    if (propertyTable.class === schemaClassName) {
      return propertyTable;
    }
  }
  return null;
}
function findFeatureTextureByClass(featureTextures, schemaClassName) {
  for (const featureTexturesName in featureTextures) {
    const featureTable = featureTextures[featureTexturesName];
    if (featureTable.class === schemaClassName) {
      return featureTable;
    }
  }
  return null;
}
function processPropertyTable2(scenegraph, schema, propertyTable) {
  var _a, _b;
  if (!propertyTable.class) {
    return;
  }
  const schemaClass = (_a = schema.classes) == null ? void 0 : _a[propertyTable.class];
  if (!schemaClass) {
    throw new Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${propertyTable.class}`);
  }
  const numberOfElements = propertyTable.count;
  for (const propertyName in schemaClass.properties) {
    const classProperty = schemaClass.properties[propertyName];
    const propertyTableProperty = (_b = propertyTable.properties) == null ? void 0 : _b[propertyName];
    if (propertyTableProperty) {
      const data = getPropertyDataFromBinarySource2(scenegraph, schema, classProperty, numberOfElements, propertyTableProperty);
      propertyTableProperty.data = data;
    }
  }
}
function handleFeatureTextureProperties(scenegraph, featureTexture, schemaClass) {
  var _a;
  const attributeName = featureTexture.class;
  for (const propertyName in schemaClass.properties) {
    const featureTextureProperty = (_a = featureTexture == null ? void 0 : featureTexture.properties) == null ? void 0 : _a[propertyName];
    if (featureTextureProperty) {
      const data = getPropertyDataFromTexture(scenegraph, featureTextureProperty, attributeName);
      featureTextureProperty.data = data;
    }
  }
}
function getPropertyDataFromBinarySource2(scenegraph, schema, classProperty, numberOfFeatures, featureTableProperty) {
  let data = [];
  const bufferView = featureTableProperty.bufferView;
  const dataArray = scenegraph.getTypedArrayForBufferView(bufferView);
  const arrayOffsets = getArrayOffsetsForProperty2(scenegraph, classProperty, featureTableProperty, numberOfFeatures);
  const stringOffsets = getStringOffsetsForProperty2(scenegraph, classProperty, featureTableProperty, numberOfFeatures);
  if (classProperty.type === "STRING" || classProperty.componentType === "STRING") {
    data = getPropertyDataString(numberOfFeatures, dataArray, arrayOffsets, stringOffsets);
  } else if (isNumericProperty(classProperty)) {
    data = getPropertyDataNumeric2(classProperty, numberOfFeatures, dataArray, arrayOffsets);
  }
  return data;
}
function getArrayOffsetsForProperty2(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
  if (classProperty.type === "ARRAY" && // `componentCount` is a number of fixed-length array elements.
  // If `componentCount` is NOT defined, it's a VARIABLE-length array
  typeof classProperty.componentCount === "undefined" && // `arrayOffsetBufferView` is an index of the buffer view containing offsets for variable-length arrays.
  typeof propertyTableProperty.arrayOffsetBufferView !== "undefined") {
    return getOffsetsForProperty(
      scenegraph,
      propertyTableProperty.arrayOffsetBufferView,
      propertyTableProperty.offsetType || "UINT32",
      // offsetType is used both for stringOffsetBufferView and arrayOffsetBufferView
      numberOfElements
    );
  }
  return null;
}
function getStringOffsetsForProperty2(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
  if (typeof propertyTableProperty.stringOffsetBufferView !== "undefined") {
    return getOffsetsForProperty(
      scenegraph,
      propertyTableProperty.stringOffsetBufferView,
      propertyTableProperty.offsetType || "UINT32",
      // offsetType is used both for stringOffsetBufferView and arrayOffsetBufferView
      numberOfElements
    );
  }
  return null;
}
function isNumericProperty(schemaProperty) {
  const types = [
    "UINT8",
    "INT16",
    "UINT16",
    "INT32",
    "UINT32",
    "INT64",
    "UINT64",
    "FLOAT32",
    "FLOAT64"
  ];
  return types.includes(schemaProperty.type) || typeof schemaProperty.componentType !== "undefined" && types.includes(schemaProperty.componentType);
}
function getPropertyDataNumeric2(classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
  const isArray = classProperty.type === "ARRAY";
  const arrayCount = classProperty.componentCount;
  const attributeType = "SCALAR";
  const componentType = classProperty.componentType || classProperty.type;
  const elementSize = getArrayElementByteSize(attributeType, componentType);
  const elementCount = valuesDataBytes.byteLength / elementSize;
  const valuesData = convertRawBufferToMetadataArray(valuesDataBytes, attributeType, componentType, elementCount);
  if (isArray) {
    if (arrayOffsets) {
      return parseVariableLengthArrayNumeric(valuesData, numberOfElements, arrayOffsets, valuesDataBytes.length, elementSize);
    }
    if (arrayCount) {
      return parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount);
    }
    return [];
  }
  return valuesData;
}
function getPropertyDataFromTexture(scenegraph, featureTextureProperty, attributeName) {
  const json = scenegraph.gltf.json;
  if (!json.meshes) {
    return [];
  }
  const featureTextureTable = [];
  for (const mesh of json.meshes) {
    for (const primitive of mesh.primitives) {
      processPrimitiveTextures(scenegraph, attributeName, featureTextureProperty, featureTextureTable, primitive);
    }
  }
  return featureTextureTable;
}
function processPrimitiveTextures(scenegraph, attributeName, featureTextureProperty, featureTextureTable, primitive) {
  const textureInfoTopLevel = {
    channels: featureTextureProperty.channels,
    ...featureTextureProperty.texture
  };
  const propertyData = getPrimitiveTextureData(scenegraph, textureInfoTopLevel, primitive);
  if (!propertyData) {
    return;
  }
  primitivePropertyDataToAttributes(scenegraph, attributeName, propertyData, featureTextureTable, primitive);
}

// node_modules/@loaders.gl/gltf/dist/lib/utils/version.js
var VERSION2 = true ? "4.3.2" : "latest";

// node_modules/@loaders.gl/gltf/dist/lib/parsers/parse-glb.js
var LITTLE_ENDIAN = true;
var MAGIC_glTF = 1735152710;
var GLB_FILE_HEADER_SIZE = 12;
var GLB_CHUNK_HEADER_SIZE = 8;
var GLB_CHUNK_TYPE_JSON = 1313821514;
var GLB_CHUNK_TYPE_BIN = 5130562;
var GLB_V1_CONTENT_FORMAT_JSON = 0;
var GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED = 0;
var GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED = 1;
function getMagicString(dataView, byteOffset = 0) {
  return `${String.fromCharCode(dataView.getUint8(byteOffset + 0))}${String.fromCharCode(dataView.getUint8(byteOffset + 1))}${String.fromCharCode(dataView.getUint8(byteOffset + 2))}${String.fromCharCode(dataView.getUint8(byteOffset + 3))}`;
}
function isGLB(arrayBuffer, byteOffset = 0, options = {}) {
  const dataView = new DataView(arrayBuffer);
  const { magic = MAGIC_glTF } = options;
  const magic1 = dataView.getUint32(byteOffset, false);
  return magic1 === magic || magic1 === MAGIC_glTF;
}
function parseGLBSync(glb, arrayBuffer, byteOffset = 0, options = {}) {
  const dataView = new DataView(arrayBuffer);
  const type = getMagicString(dataView, byteOffset + 0);
  const version = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN);
  const byteLength = dataView.getUint32(byteOffset + 8, LITTLE_ENDIAN);
  Object.assign(glb, {
    // Put less important stuff in a header, to avoid clutter
    header: {
      byteOffset,
      // Byte offset into the initial arrayBuffer
      byteLength,
      hasBinChunk: false
    },
    type,
    version,
    json: {},
    binChunks: []
  });
  byteOffset += GLB_FILE_HEADER_SIZE;
  switch (glb.version) {
    case 1:
      return parseGLBV1(glb, dataView, byteOffset);
    case 2:
      return parseGLBV2(glb, dataView, byteOffset, options = {});
    default:
      throw new Error(`Invalid GLB version ${glb.version}. Only supports version 1 and 2.`);
  }
}
function parseGLBV1(glb, dataView, byteOffset) {
  assert(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
  const contentLength = dataView.getUint32(byteOffset + 0, LITTLE_ENDIAN);
  const contentFormat = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN);
  byteOffset += GLB_CHUNK_HEADER_SIZE;
  assert(contentFormat === GLB_V1_CONTENT_FORMAT_JSON);
  parseJSONChunk(glb, dataView, byteOffset, contentLength);
  byteOffset += contentLength;
  byteOffset += parseBINChunk(glb, dataView, byteOffset, glb.header.byteLength);
  return byteOffset;
}
function parseGLBV2(glb, dataView, byteOffset, options) {
  assert(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
  parseGLBChunksSync(glb, dataView, byteOffset, options);
  return byteOffset + glb.header.byteLength;
}
function parseGLBChunksSync(glb, dataView, byteOffset, options) {
  while (byteOffset + 8 <= glb.header.byteLength) {
    const chunkLength = dataView.getUint32(byteOffset + 0, LITTLE_ENDIAN);
    const chunkFormat = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN);
    byteOffset += GLB_CHUNK_HEADER_SIZE;
    switch (chunkFormat) {
      case GLB_CHUNK_TYPE_JSON:
        parseJSONChunk(glb, dataView, byteOffset, chunkLength);
        break;
      case GLB_CHUNK_TYPE_BIN:
        parseBINChunk(glb, dataView, byteOffset, chunkLength);
        break;
      // Backward compatibility for very old xviz files
      case GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED:
        if (!options.strict) {
          parseJSONChunk(glb, dataView, byteOffset, chunkLength);
        }
        break;
      case GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED:
        if (!options.strict) {
          parseBINChunk(glb, dataView, byteOffset, chunkLength);
        }
        break;
      default:
        break;
    }
    byteOffset += padToNBytes(chunkLength, 4);
  }
  return byteOffset;
}
function parseJSONChunk(glb, dataView, byteOffset, chunkLength) {
  const jsonChunk = new Uint8Array(dataView.buffer, byteOffset, chunkLength);
  const textDecoder = new TextDecoder("utf8");
  const jsonText = textDecoder.decode(jsonChunk);
  glb.json = JSON.parse(jsonText);
  return padToNBytes(chunkLength, 4);
}
function parseBINChunk(glb, dataView, byteOffset, chunkLength) {
  glb.header.hasBinChunk = true;
  glb.binChunks.push({
    byteOffset,
    byteLength: chunkLength,
    arrayBuffer: dataView.buffer
    // TODO - copy, or create typed array view?
  });
  return padToNBytes(chunkLength, 4);
}

// node_modules/@loaders.gl/gltf/dist/lib/gltf-utils/resolve-url.js
function resolveUrl(url, options) {
  const absolute = url.startsWith("data:") || url.startsWith("http:") || url.startsWith("https:");
  if (absolute) {
    return url;
  }
  const baseUrl = options.baseUri || options.uri;
  if (!baseUrl) {
    throw new Error(`'baseUri' must be provided to resolve relative url ${url}`);
  }
  return baseUrl.substr(0, baseUrl.lastIndexOf("/") + 1) + url;
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_meshopt_compression.js
var EXT_meshopt_compression_exports = {};
__export(EXT_meshopt_compression_exports, {
  decode: () => decode5,
  name: () => name4
});

// node_modules/@loaders.gl/gltf/dist/meshopt/meshopt-decoder.js
var wasm_base = "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";
var wasm_simd = "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";
var detector = new Uint8Array([
  0,
  97,
  115,
  109,
  1,
  0,
  0,
  0,
  1,
  4,
  1,
  96,
  0,
  0,
  3,
  3,
  2,
  0,
  0,
  5,
  3,
  1,
  0,
  1,
  12,
  1,
  0,
  10,
  22,
  2,
  12,
  0,
  65,
  0,
  65,
  0,
  65,
  0,
  252,
  10,
  0,
  0,
  11,
  7,
  0,
  65,
  0,
  253,
  15,
  26,
  11
]);
var wasmpack = new Uint8Array([
  32,
  0,
  65,
  253,
  3,
  1,
  2,
  34,
  4,
  106,
  6,
  5,
  11,
  8,
  7,
  20,
  13,
  33,
  12,
  16,
  128,
  9,
  116,
  64,
  19,
  113,
  127,
  15,
  10,
  21,
  22,
  14,
  255,
  66,
  24,
  54,
  136,
  107,
  18,
  23,
  192,
  26,
  114,
  118,
  132,
  17,
  77,
  101,
  130,
  144,
  27,
  87,
  131,
  44,
  45,
  74,
  156,
  154,
  70,
  167
]);
var FILTERS = {
  // legacy index-based enums for glTF
  0: "",
  1: "meshopt_decodeFilterOct",
  2: "meshopt_decodeFilterQuat",
  3: "meshopt_decodeFilterExp",
  // string-based enums for glTF
  NONE: "",
  OCTAHEDRAL: "meshopt_decodeFilterOct",
  QUATERNION: "meshopt_decodeFilterQuat",
  EXPONENTIAL: "meshopt_decodeFilterExp"
};
var DECODERS = {
  // legacy index-based enums for glTF
  0: "meshopt_decodeVertexBuffer",
  1: "meshopt_decodeIndexBuffer",
  2: "meshopt_decodeIndexSequence",
  // string-based enums for glTF
  ATTRIBUTES: "meshopt_decodeVertexBuffer",
  TRIANGLES: "meshopt_decodeIndexBuffer",
  INDICES: "meshopt_decodeIndexSequence"
};
async function meshoptDecodeGltfBuffer(target, count, size, source, mode, filter = "NONE") {
  const instance = await loadWasmInstance();
  decode4(instance, instance.exports[DECODERS[mode]], target, count, size, source, instance.exports[FILTERS[filter || "NONE"]]);
}
var wasmPromise;
async function loadWasmInstance() {
  if (!wasmPromise) {
    wasmPromise = loadWasmModule();
  }
  return wasmPromise;
}
async function loadWasmModule() {
  let wasm = wasm_base;
  if (WebAssembly.validate(detector)) {
    wasm = wasm_simd;
    console.log("Warning: meshopt_decoder is using experimental SIMD support");
  }
  const result = await WebAssembly.instantiate(unpack(wasm), {});
  await result.instance.exports.__wasm_call_ctors();
  return result.instance;
}
function unpack(data) {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    const ch = data.charCodeAt(i);
    result[i] = ch > 96 ? ch - 71 : ch > 64 ? ch - 65 : ch > 47 ? ch + 4 : ch > 46 ? 63 : 62;
  }
  let write = 0;
  for (let i = 0; i < data.length; ++i) {
    result[write++] = result[i] < 60 ? wasmpack[result[i]] : (result[i] - 60) * 64 + result[++i];
  }
  return result.buffer.slice(0, write);
}
function decode4(instance, fun, target, count, size, source, filter) {
  const sbrk = instance.exports.sbrk;
  const count4 = count + 3 & ~3;
  const tp = sbrk(count4 * size);
  const sp = sbrk(source.length);
  const heap = new Uint8Array(instance.exports.memory.buffer);
  heap.set(source, sp);
  const res = fun(tp, count, size, sp, source.length);
  if (res === 0 && filter) {
    filter(tp, count4, size);
  }
  target.set(heap.subarray(tp, tp + count * size));
  sbrk(tp - sbrk(0));
  if (res !== 0) {
    throw new Error(`Malformed buffer data: ${res}`);
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_meshopt_compression.js
var EXT_MESHOPT_COMPRESSION = "EXT_meshopt_compression";
var name4 = EXT_MESHOPT_COMPRESSION;
async function decode5(gltfData, options) {
  var _a, _b;
  const scenegraph = new GLTFScenegraph(gltfData);
  if (!((_a = options == null ? void 0 : options.gltf) == null ? void 0 : _a.decompressMeshes) || !((_b = options.gltf) == null ? void 0 : _b.loadBuffers)) {
    return;
  }
  const promises = [];
  for (const bufferViewIndex of gltfData.json.bufferViews || []) {
    promises.push(decodeMeshoptBufferView(scenegraph, bufferViewIndex));
  }
  await Promise.all(promises);
  scenegraph.removeExtension(EXT_MESHOPT_COMPRESSION);
}
async function decodeMeshoptBufferView(scenegraph, bufferView) {
  const meshoptExtension = scenegraph.getObjectExtension(bufferView, EXT_MESHOPT_COMPRESSION);
  if (meshoptExtension) {
    const { byteOffset = 0, byteLength = 0, byteStride, count, mode, filter = "NONE", buffer: bufferIndex } = meshoptExtension;
    const buffer = scenegraph.gltf.buffers[bufferIndex];
    const source = new Uint8Array(buffer.arrayBuffer, buffer.byteOffset + byteOffset, byteLength);
    const result = new Uint8Array(scenegraph.gltf.buffers[bufferView.buffer].arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
    await meshoptDecodeGltfBuffer(result, count, byteStride, source, mode, filter);
    scenegraph.removeObjectExtension(bufferView, EXT_MESHOPT_COMPRESSION);
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/EXT_texture_webp.js
var EXT_texture_webp_exports = {};
__export(EXT_texture_webp_exports, {
  name: () => name5,
  preprocess: () => preprocess
});
var EXT_TEXTURE_WEBP = "EXT_texture_webp";
var name5 = EXT_TEXTURE_WEBP;
function preprocess(gltfData, options) {
  const scenegraph = new GLTFScenegraph(gltfData);
  if (!isImageFormatSupported("image/webp")) {
    if (scenegraph.getRequiredExtensions().includes(EXT_TEXTURE_WEBP)) {
      throw new Error(`gltf: Required extension ${EXT_TEXTURE_WEBP} not supported by browser`);
    }
    return;
  }
  const { json } = scenegraph;
  for (const texture of json.textures || []) {
    const extension = scenegraph.getObjectExtension(texture, EXT_TEXTURE_WEBP);
    if (extension) {
      texture.source = extension.source;
    }
    scenegraph.removeObjectExtension(texture, EXT_TEXTURE_WEBP);
  }
  scenegraph.removeExtension(EXT_TEXTURE_WEBP);
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/KHR_texture_basisu.js
var KHR_texture_basisu_exports = {};
__export(KHR_texture_basisu_exports, {
  name: () => name6,
  preprocess: () => preprocess2
});
var KHR_TEXTURE_BASISU = "KHR_texture_basisu";
var name6 = KHR_TEXTURE_BASISU;
function preprocess2(gltfData, options) {
  const scene = new GLTFScenegraph(gltfData);
  const { json } = scene;
  for (const texture of json.textures || []) {
    const extension = scene.getObjectExtension(texture, KHR_TEXTURE_BASISU);
    if (extension) {
      texture.source = extension.source;
      scene.removeObjectExtension(texture, KHR_TEXTURE_BASISU);
    }
  }
  scene.removeExtension(KHR_TEXTURE_BASISU);
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/KHR_draco_mesh_compression.js
var KHR_draco_mesh_compression_exports = {};
__export(KHR_draco_mesh_compression_exports, {
  decode: () => decode6,
  encode: () => encode3,
  name: () => name7,
  preprocess: () => preprocess3
});

// node_modules/@loaders.gl/draco/dist/lib/utils/version.js
var VERSION3 = true ? "4.3.2" : "latest";

// node_modules/@loaders.gl/draco/dist/draco-loader.js
var DracoLoader = {
  dataType: null,
  batchType: null,
  name: "Draco",
  id: "draco",
  module: "draco",
  // shapes: ['mesh'],
  version: VERSION3,
  worker: true,
  extensions: ["drc"],
  mimeTypes: ["application/octet-stream"],
  binary: true,
  tests: ["DRACO"],
  options: {
    draco: {
      decoderType: typeof WebAssembly === "object" ? "wasm" : "js",
      // 'js' for IE11
      libraryPath: "libs/",
      extraAttributes: {},
      attributeNameEntry: void 0
    }
  }
};

// node_modules/@loaders.gl/draco/dist/lib/utils/get-draco-schema.js
function getDracoSchema(attributes, loaderData, indices) {
  const metadata = makeMetadata(loaderData.metadata);
  const fields = [];
  const namedLoaderDataAttributes = transformAttributesLoaderData(loaderData.attributes);
  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    const field = getArrowFieldFromAttribute(attributeName, attribute, namedLoaderDataAttributes[attributeName]);
    fields.push(field);
  }
  if (indices) {
    const indicesField = getArrowFieldFromAttribute("indices", indices);
    fields.push(indicesField);
  }
  return { fields, metadata };
}
function transformAttributesLoaderData(loaderData) {
  const result = {};
  for (const key in loaderData) {
    const dracoAttribute = loaderData[key];
    result[dracoAttribute.name || "undefined"] = dracoAttribute;
  }
  return result;
}
function getArrowFieldFromAttribute(attributeName, attribute, loaderData) {
  const metadataMap = loaderData ? makeMetadata(loaderData.metadata) : void 0;
  const field = deduceMeshField(attributeName, attribute, metadataMap);
  return field;
}
function makeMetadata(metadata) {
  Object.entries(metadata);
  const serializedMetadata = {};
  for (const key in metadata) {
    serializedMetadata[`${key}.string`] = JSON.stringify(metadata[key]);
  }
  return serializedMetadata;
}

// node_modules/@loaders.gl/draco/dist/lib/draco-parser.js
var DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP = {
  POSITION: "POSITION",
  NORMAL: "NORMAL",
  COLOR: "COLOR_0",
  TEX_COORD: "TEXCOORD_0"
};
var DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP = {
  1: Int8Array,
  2: Uint8Array,
  3: Int16Array,
  4: Uint16Array,
  5: Int32Array,
  6: Uint32Array,
  // 7: BigInt64Array,
  // 8: BigUint64Array,
  9: Float32Array
  // 10: Float64Array
  // 11: BOOL - What array type do we use for this?
};
var INDEX_ITEM_SIZE = 4;
var DracoParser = class {
  // draco - the draco decoder, either import `draco3d` or load dynamically
  constructor(draco) {
    __publicField(this, "draco");
    __publicField(this, "decoder");
    __publicField(this, "metadataQuerier");
    this.draco = draco;
    this.decoder = new this.draco.Decoder();
    this.metadataQuerier = new this.draco.MetadataQuerier();
  }
  /**
   * Destroy draco resources
   */
  destroy() {
    this.draco.destroy(this.decoder);
    this.draco.destroy(this.metadataQuerier);
  }
  /**
   * NOTE: caller must call `destroyGeometry` on the return value after using it
   * @param arrayBuffer
   * @param options
   */
  parseSync(arrayBuffer, options = {}) {
    const buffer = new this.draco.DecoderBuffer();
    buffer.Init(new Int8Array(arrayBuffer), arrayBuffer.byteLength);
    this._disableAttributeTransforms(options);
    const geometry_type = this.decoder.GetEncodedGeometryType(buffer);
    const dracoGeometry = geometry_type === this.draco.TRIANGULAR_MESH ? new this.draco.Mesh() : new this.draco.PointCloud();
    try {
      let dracoStatus;
      switch (geometry_type) {
        case this.draco.TRIANGULAR_MESH:
          dracoStatus = this.decoder.DecodeBufferToMesh(buffer, dracoGeometry);
          break;
        case this.draco.POINT_CLOUD:
          dracoStatus = this.decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
          break;
        default:
          throw new Error("DRACO: Unknown geometry type.");
      }
      if (!dracoStatus.ok() || !dracoGeometry.ptr) {
        const message = `DRACO decompression failed: ${dracoStatus.error_msg()}`;
        throw new Error(message);
      }
      const loaderData = this._getDracoLoaderData(dracoGeometry, geometry_type, options);
      const geometry = this._getMeshData(dracoGeometry, loaderData, options);
      const boundingBox = getMeshBoundingBox(geometry.attributes);
      const schema = getDracoSchema(geometry.attributes, loaderData, geometry.indices);
      const data = {
        loader: "draco",
        loaderData,
        header: {
          vertexCount: dracoGeometry.num_points(),
          boundingBox
        },
        ...geometry,
        schema
      };
      return data;
    } finally {
      this.draco.destroy(buffer);
      if (dracoGeometry) {
        this.draco.destroy(dracoGeometry);
      }
    }
  }
  // Draco specific "loader data"
  /**
   * Extract
   * @param dracoGeometry
   * @param geometry_type
   * @param options
   * @returns
   */
  _getDracoLoaderData(dracoGeometry, geometry_type, options) {
    const metadata = this._getTopLevelMetadata(dracoGeometry);
    const attributes = this._getDracoAttributes(dracoGeometry, options);
    return {
      geometry_type,
      num_attributes: dracoGeometry.num_attributes(),
      num_points: dracoGeometry.num_points(),
      num_faces: dracoGeometry instanceof this.draco.Mesh ? dracoGeometry.num_faces() : 0,
      metadata,
      attributes
    };
  }
  /**
   * Extract all draco provided information and metadata for each attribute
   * @param dracoGeometry
   * @param options
   * @returns
   */
  _getDracoAttributes(dracoGeometry, options) {
    const dracoAttributes = {};
    for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
      const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);
      const metadata = this._getAttributeMetadata(dracoGeometry, attributeId);
      dracoAttributes[dracoAttribute.unique_id()] = {
        unique_id: dracoAttribute.unique_id(),
        attribute_type: dracoAttribute.attribute_type(),
        data_type: dracoAttribute.data_type(),
        num_components: dracoAttribute.num_components(),
        byte_offset: dracoAttribute.byte_offset(),
        byte_stride: dracoAttribute.byte_stride(),
        normalized: dracoAttribute.normalized(),
        attribute_index: attributeId,
        metadata
      };
      const quantization = this._getQuantizationTransform(dracoAttribute, options);
      if (quantization) {
        dracoAttributes[dracoAttribute.unique_id()].quantization_transform = quantization;
      }
      const octahedron = this._getOctahedronTransform(dracoAttribute, options);
      if (octahedron) {
        dracoAttributes[dracoAttribute.unique_id()].octahedron_transform = octahedron;
      }
    }
    return dracoAttributes;
  }
  /**
   * Get standard loaders.gl mesh category data
   * Extracts the geometry from draco
   * @param dracoGeometry
   * @param options
   */
  _getMeshData(dracoGeometry, loaderData, options) {
    const attributes = this._getMeshAttributes(loaderData, dracoGeometry, options);
    const positionAttribute = attributes.POSITION;
    if (!positionAttribute) {
      throw new Error("DRACO: No position attribute found.");
    }
    if (dracoGeometry instanceof this.draco.Mesh) {
      switch (options.topology) {
        case "triangle-strip":
          return {
            topology: "triangle-strip",
            mode: 4,
            // GL.TRIANGLES
            attributes,
            indices: {
              value: this._getTriangleStripIndices(dracoGeometry),
              size: 1
            }
          };
        case "triangle-list":
        default:
          return {
            topology: "triangle-list",
            mode: 5,
            // GL.TRIANGLE_STRIP
            attributes,
            indices: {
              value: this._getTriangleListIndices(dracoGeometry),
              size: 1
            }
          };
      }
    }
    return {
      topology: "point-list",
      mode: 0,
      // GL.POINTS
      attributes
    };
  }
  _getMeshAttributes(loaderData, dracoGeometry, options) {
    const attributes = {};
    for (const loaderAttribute of Object.values(loaderData.attributes)) {
      const attributeName = this._deduceAttributeName(loaderAttribute, options);
      loaderAttribute.name = attributeName;
      const values = this._getAttributeValues(dracoGeometry, loaderAttribute);
      if (values) {
        const { value, size } = values;
        attributes[attributeName] = {
          value,
          size,
          byteOffset: loaderAttribute.byte_offset,
          byteStride: loaderAttribute.byte_stride,
          normalized: loaderAttribute.normalized
        };
      }
    }
    return attributes;
  }
  // MESH INDICES EXTRACTION
  /**
   * For meshes, we need indices to define the faces.
   * @param dracoGeometry
   */
  _getTriangleListIndices(dracoGeometry) {
    const numFaces = dracoGeometry.num_faces();
    const numIndices = numFaces * 3;
    const byteLength = numIndices * INDEX_ITEM_SIZE;
    const ptr = this.draco._malloc(byteLength);
    try {
      this.decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
      return new Uint32Array(this.draco.HEAPF32.buffer, ptr, numIndices).slice();
    } finally {
      this.draco._free(ptr);
    }
  }
  /**
   * For meshes, we need indices to define the faces.
   * @param dracoGeometry
   */
  _getTriangleStripIndices(dracoGeometry) {
    const dracoArray = new this.draco.DracoInt32Array();
    try {
      this.decoder.GetTriangleStripsFromMesh(dracoGeometry, dracoArray);
      return getUint32Array(dracoArray);
    } finally {
      this.draco.destroy(dracoArray);
    }
  }
  /**
   *
   * @param dracoGeometry
   * @param dracoAttribute
   * @param attributeName
   */
  _getAttributeValues(dracoGeometry, attribute) {
    const TypedArrayCtor = DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP[attribute.data_type];
    if (!TypedArrayCtor) {
      console.warn(`DRACO: Unsupported attribute type ${attribute.data_type}`);
      return null;
    }
    const numComponents = attribute.num_components;
    const numPoints = dracoGeometry.num_points();
    const numValues = numPoints * numComponents;
    const byteLength = numValues * TypedArrayCtor.BYTES_PER_ELEMENT;
    const dataType = getDracoDataType(this.draco, TypedArrayCtor);
    let value;
    const ptr = this.draco._malloc(byteLength);
    try {
      const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attribute.attribute_index);
      this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, dracoAttribute, dataType, byteLength, ptr);
      value = new TypedArrayCtor(this.draco.HEAPF32.buffer, ptr, numValues).slice();
    } finally {
      this.draco._free(ptr);
    }
    return { value, size: numComponents };
  }
  // Attribute names
  /**
   * DRACO does not store attribute names - We need to deduce an attribute name
   * for each attribute
  _getAttributeNames(
    dracoGeometry: Mesh | PointCloud,
    options: DracoParseOptions
  ): {[unique_id: number]: string} {
    const attributeNames: {[unique_id: number]: string} = {};
    for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
      const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);
      const attributeName = this._deduceAttributeName(dracoAttribute, options);
      attributeNames[attributeName] = attributeName;
    }
    return attributeNames;
  }
   */
  /**
   * Deduce an attribute name.
   * @note DRACO does not save attribute names, just general type (POSITION, COLOR)
   * to help optimize compression. We generate GLTF compatible names for the Draco-recognized
   * types
   * @param attributeData
   */
  _deduceAttributeName(attribute, options) {
    const uniqueId = attribute.unique_id;
    for (const [attributeName, attributeUniqueId] of Object.entries(options.extraAttributes || {})) {
      if (attributeUniqueId === uniqueId) {
        return attributeName;
      }
    }
    const thisAttributeType = attribute.attribute_type;
    for (const dracoAttributeConstant in DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP) {
      const attributeType = this.draco[dracoAttributeConstant];
      if (attributeType === thisAttributeType) {
        return DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP[dracoAttributeConstant];
      }
    }
    const entryName = options.attributeNameEntry || "name";
    if (attribute.metadata[entryName]) {
      return attribute.metadata[entryName].string;
    }
    return `CUSTOM_ATTRIBUTE_${uniqueId}`;
  }
  // METADATA EXTRACTION
  /** Get top level metadata */
  _getTopLevelMetadata(dracoGeometry) {
    const dracoMetadata = this.decoder.GetMetadata(dracoGeometry);
    return this._getDracoMetadata(dracoMetadata);
  }
  /** Get per attribute metadata */
  _getAttributeMetadata(dracoGeometry, attributeId) {
    const dracoMetadata = this.decoder.GetAttributeMetadata(dracoGeometry, attributeId);
    return this._getDracoMetadata(dracoMetadata);
  }
  /**
   * Extract metadata field values
   * @param dracoMetadata
   * @returns
   */
  _getDracoMetadata(dracoMetadata) {
    if (!dracoMetadata || !dracoMetadata.ptr) {
      return {};
    }
    const result = {};
    const numEntries = this.metadataQuerier.NumEntries(dracoMetadata);
    for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
      const entryName = this.metadataQuerier.GetEntryName(dracoMetadata, entryIndex);
      result[entryName] = this._getDracoMetadataField(dracoMetadata, entryName);
    }
    return result;
  }
  /**
   * Extracts possible values for one metadata entry by name
   * @param dracoMetadata
   * @param entryName
   */
  _getDracoMetadataField(dracoMetadata, entryName) {
    const dracoArray = new this.draco.DracoInt32Array();
    try {
      this.metadataQuerier.GetIntEntryArray(dracoMetadata, entryName, dracoArray);
      const intArray = getInt32Array(dracoArray);
      return {
        int: this.metadataQuerier.GetIntEntry(dracoMetadata, entryName),
        string: this.metadataQuerier.GetStringEntry(dracoMetadata, entryName),
        double: this.metadataQuerier.GetDoubleEntry(dracoMetadata, entryName),
        intArray
      };
    } finally {
      this.draco.destroy(dracoArray);
    }
  }
  // QUANTIZED ATTRIBUTE SUPPORT (NO DECOMPRESSION)
  /** Skip transforms for specific attribute types */
  _disableAttributeTransforms(options) {
    const { quantizedAttributes = [], octahedronAttributes = [] } = options;
    const skipAttributes = [...quantizedAttributes, ...octahedronAttributes];
    for (const dracoAttributeName of skipAttributes) {
      this.decoder.SkipAttributeTransform(this.draco[dracoAttributeName]);
    }
  }
  /**
   * Extract (and apply?) Position Transform
   * @todo not used
   */
  _getQuantizationTransform(dracoAttribute, options) {
    const { quantizedAttributes = [] } = options;
    const attribute_type = dracoAttribute.attribute_type();
    const skip = quantizedAttributes.map((type) => this.decoder[type]).includes(attribute_type);
    if (skip) {
      const transform = new this.draco.AttributeQuantizationTransform();
      try {
        if (transform.InitFromAttribute(dracoAttribute)) {
          return {
            quantization_bits: transform.quantization_bits(),
            range: transform.range(),
            min_values: new Float32Array([1, 2, 3]).map((i) => transform.min_value(i))
          };
        }
      } finally {
        this.draco.destroy(transform);
      }
    }
    return null;
  }
  _getOctahedronTransform(dracoAttribute, options) {
    const { octahedronAttributes = [] } = options;
    const attribute_type = dracoAttribute.attribute_type();
    const octahedron = octahedronAttributes.map((type) => this.decoder[type]).includes(attribute_type);
    if (octahedron) {
      const transform = new this.draco.AttributeQuantizationTransform();
      try {
        if (transform.InitFromAttribute(dracoAttribute)) {
          return {
            quantization_bits: transform.quantization_bits()
          };
        }
      } finally {
        this.draco.destroy(transform);
      }
    }
    return null;
  }
};
function getDracoDataType(draco, attributeType) {
  switch (attributeType) {
    case Float32Array:
      return draco.DT_FLOAT32;
    case Int8Array:
      return draco.DT_INT8;
    case Int16Array:
      return draco.DT_INT16;
    case Int32Array:
      return draco.DT_INT32;
    case Uint8Array:
      return draco.DT_UINT8;
    case Uint16Array:
      return draco.DT_UINT16;
    case Uint32Array:
      return draco.DT_UINT32;
    default:
      return draco.DT_INVALID;
  }
}
function getInt32Array(dracoArray) {
  const numValues = dracoArray.size();
  const intArray = new Int32Array(numValues);
  for (let i = 0; i < numValues; i++) {
    intArray[i] = dracoArray.GetValue(i);
  }
  return intArray;
}
function getUint32Array(dracoArray) {
  const numValues = dracoArray.size();
  const intArray = new Int32Array(numValues);
  for (let i = 0; i < numValues; i++) {
    intArray[i] = dracoArray.GetValue(i);
  }
  return intArray;
}

// node_modules/@loaders.gl/draco/dist/lib/draco-module-loader.js
var DRACO_DECODER_VERSION = "1.5.6";
var DRACO_ENCODER_VERSION = "1.4.1";
var STATIC_DECODER_URL = `https://www.gstatic.com/draco/versioned/decoders/${DRACO_DECODER_VERSION}`;
var DRACO_EXTERNAL_LIBRARIES = {
  /** The primary Draco3D encoder, javascript wrapper part */
  DECODER: "draco_wasm_wrapper.js",
  /** The primary draco decoder, compiled web assembly part */
  DECODER_WASM: "draco_decoder.wasm",
  /** Fallback decoder for non-webassebly environments. Very big bundle, lower performance */
  FALLBACK_DECODER: "draco_decoder.js",
  /** Draco encoder */
  ENCODER: "draco_encoder.js"
};
var DRACO_EXTERNAL_LIBRARY_URLS = {
  [DRACO_EXTERNAL_LIBRARIES.DECODER]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.DECODER}`,
  [DRACO_EXTERNAL_LIBRARIES.DECODER_WASM]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.DECODER_WASM}`,
  [DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER}`,
  [DRACO_EXTERNAL_LIBRARIES.ENCODER]: `https://raw.githubusercontent.com/google/draco/${DRACO_ENCODER_VERSION}/javascript/${DRACO_EXTERNAL_LIBRARIES.ENCODER}`
};
var loadDecoderPromise;
async function loadDracoDecoderModule(options) {
  const modules = options.modules || {};
  if (modules.draco3d) {
    loadDecoderPromise || (loadDecoderPromise = modules.draco3d.createDecoderModule({}).then((draco) => {
      return { draco };
    }));
  } else {
    loadDecoderPromise || (loadDecoderPromise = loadDracoDecoder(options));
  }
  return await loadDecoderPromise;
}
async function loadDracoDecoder(options) {
  let DracoDecoderModule;
  let wasmBinary;
  switch (options.draco && options.draco.decoderType) {
    case "js":
      DracoDecoderModule = await loadLibrary(DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER], "draco", options, DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER);
      break;
    case "wasm":
    default:
      [DracoDecoderModule, wasmBinary] = await Promise.all([
        await loadLibrary(DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER], "draco", options, DRACO_EXTERNAL_LIBRARIES.DECODER),
        await loadLibrary(DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER_WASM], "draco", options, DRACO_EXTERNAL_LIBRARIES.DECODER_WASM)
      ]);
  }
  DracoDecoderModule = DracoDecoderModule || globalThis.DracoDecoderModule;
  return await initializeDracoDecoder(DracoDecoderModule, wasmBinary);
}
function initializeDracoDecoder(DracoDecoderModule, wasmBinary) {
  const options = {};
  if (wasmBinary) {
    options.wasmBinary = wasmBinary;
  }
  return new Promise((resolve) => {
    DracoDecoderModule({
      ...options,
      onModuleLoaded: (draco) => resolve({ draco })
      // Module is Promise-like. Wrap in object to avoid loop.
    });
  });
}

// node_modules/@loaders.gl/draco/dist/index.js
var DracoLoader2 = {
  ...DracoLoader,
  parse
};
async function parse(arrayBuffer, options) {
  const { draco } = await loadDracoDecoderModule(options);
  const dracoParser = new DracoParser(draco);
  try {
    return dracoParser.parseSync(arrayBuffer, options == null ? void 0 : options.draco);
  } finally {
    dracoParser.destroy();
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/gltf-utils/gltf-attribute-utils.js
function getGLTFAccessors(attributes) {
  const accessors = {};
  for (const name12 in attributes) {
    const attribute = attributes[name12];
    if (name12 !== "indices") {
      const glTFAccessor = getGLTFAccessor(attribute);
      accessors[name12] = glTFAccessor;
    }
  }
  return accessors;
}
function getGLTFAccessor(attribute) {
  const { buffer, size, count } = getAccessorData(attribute);
  const glTFAccessor = {
    // glTF Accessor values
    // TODO: Instead of a bufferView index we could have an actual buffer (typed array)
    // bufferView: null,
    // TODO: Deprecate `value` in favor of bufferView?
    // @ts-ignore
    value: buffer,
    size,
    // Decoded `type` (e.g. SCALAR)
    byteOffset: 0,
    count,
    type: getAccessorTypeFromSize(size),
    componentType: getComponentTypeFromArray(buffer)
  };
  return glTFAccessor;
}
function getAccessorData(attribute) {
  let buffer = attribute;
  let size = 1;
  let count = 0;
  if (attribute && attribute.value) {
    buffer = attribute.value;
    size = attribute.size || 1;
  }
  if (buffer) {
    if (!ArrayBuffer.isView(buffer)) {
      buffer = toTypedArray(buffer, Float32Array);
    }
    count = buffer.length / size;
  }
  return { buffer, size, count };
}
function toTypedArray(array, ArrayType, convertTypedArrays = false) {
  if (!array) {
    return null;
  }
  if (Array.isArray(array)) {
    return new ArrayType(array);
  }
  if (convertTypedArrays && !(array instanceof ArrayType)) {
    return new ArrayType(array);
  }
  return array;
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/KHR_draco_mesh_compression.js
var KHR_DRACO_MESH_COMPRESSION = "KHR_draco_mesh_compression";
var name7 = KHR_DRACO_MESH_COMPRESSION;
function preprocess3(gltfData, options, context) {
  const scenegraph = new GLTFScenegraph(gltfData);
  for (const primitive of makeMeshPrimitiveIterator(scenegraph)) {
    if (scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION)) {
    }
  }
}
async function decode6(gltfData, options, context) {
  var _a;
  if (!((_a = options == null ? void 0 : options.gltf) == null ? void 0 : _a.decompressMeshes)) {
    return;
  }
  const scenegraph = new GLTFScenegraph(gltfData);
  const promises = [];
  for (const primitive of makeMeshPrimitiveIterator(scenegraph)) {
    if (scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION)) {
      promises.push(decompressPrimitive(scenegraph, primitive, options, context));
    }
  }
  await Promise.all(promises);
  scenegraph.removeExtension(KHR_DRACO_MESH_COMPRESSION);
}
function encode3(gltfData, options = {}) {
  const scenegraph = new GLTFScenegraph(gltfData);
  for (const mesh of scenegraph.json.meshes || []) {
    compressMesh(mesh, options);
    scenegraph.addRequiredExtension(KHR_DRACO_MESH_COMPRESSION);
  }
}
async function decompressPrimitive(scenegraph, primitive, options, context) {
  const dracoExtension = scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION);
  if (!dracoExtension) {
    return;
  }
  const buffer = scenegraph.getTypedArrayForBufferView(dracoExtension.bufferView);
  const bufferCopy = sliceArrayBuffer(buffer.buffer, buffer.byteOffset);
  const dracoOptions = { ...options };
  delete dracoOptions["3d-tiles"];
  const decodedData = await parseFromContext(bufferCopy, DracoLoader2, dracoOptions, context);
  const decodedAttributes = getGLTFAccessors(decodedData.attributes);
  for (const [attributeName, decodedAttribute] of Object.entries(decodedAttributes)) {
    if (attributeName in primitive.attributes) {
      const accessorIndex = primitive.attributes[attributeName];
      const accessor = scenegraph.getAccessor(accessorIndex);
      if ((accessor == null ? void 0 : accessor.min) && (accessor == null ? void 0 : accessor.max)) {
        decodedAttribute.min = accessor.min;
        decodedAttribute.max = accessor.max;
      }
    }
  }
  primitive.attributes = decodedAttributes;
  if (decodedData.indices) {
    primitive.indices = getGLTFAccessor(decodedData.indices);
  }
  scenegraph.removeObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION);
  checkPrimitive(primitive);
}
function compressMesh(attributes, indices, mode = 4, options, context) {
  var _a;
  if (!options.DracoWriter) {
    throw new Error("options.gltf.DracoWriter not provided");
  }
  const compressedData = options.DracoWriter.encodeSync({ attributes });
  const decodedData = (_a = context == null ? void 0 : context.parseSync) == null ? void 0 : _a.call(context, { attributes });
  const fauxAccessors = options._addFauxAttributes(decodedData.attributes);
  const bufferViewIndex = options.addBufferView(compressedData);
  const glTFMesh = {
    primitives: [
      {
        attributes: fauxAccessors,
        // TODO - verify with spec
        mode,
        // GL.POINTS
        extensions: {
          [KHR_DRACO_MESH_COMPRESSION]: {
            bufferView: bufferViewIndex,
            attributes: fauxAccessors
            // TODO - verify with spec
          }
        }
      }
    ]
  };
  return glTFMesh;
}
function checkPrimitive(primitive) {
  if (!primitive.attributes && Object.keys(primitive.attributes).length > 0) {
    throw new Error("glTF: Empty primitive detected: Draco decompression failure?");
  }
}
function* makeMeshPrimitiveIterator(scenegraph) {
  for (const mesh of scenegraph.json.meshes || []) {
    for (const primitive of mesh.primitives) {
      yield primitive;
    }
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/KHR_texture_transform.js
var KHR_texture_transform_exports = {};
__export(KHR_texture_transform_exports, {
  decode: () => decode7,
  name: () => name8
});
var KHR_TEXTURE_TRANSFORM = "KHR_texture_transform";
var name8 = KHR_TEXTURE_TRANSFORM;
var scratchVector = new Vector3();
var scratchRotationMatrix = new Matrix3();
var scratchScaleMatrix = new Matrix3();
async function decode7(gltfData, options) {
  var _a;
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const hasExtension = gltfScenegraph.hasExtension(KHR_TEXTURE_TRANSFORM);
  if (!hasExtension || !((_a = options.gltf) == null ? void 0 : _a.loadBuffers)) {
    return;
  }
  const materials = gltfData.json.materials || [];
  for (let i = 0; i < materials.length; i++) {
    transformTexCoords(i, gltfData);
  }
}
function transformTexCoords(materialIndex, gltfData) {
  var _a, _b, _c, _d;
  const material = (_a = gltfData.json.materials) == null ? void 0 : _a[materialIndex];
  const materialTextures = [
    (_b = material == null ? void 0 : material.pbrMetallicRoughness) == null ? void 0 : _b.baseColorTexture,
    material == null ? void 0 : material.emissiveTexture,
    material == null ? void 0 : material.normalTexture,
    material == null ? void 0 : material.occlusionTexture,
    (_c = material == null ? void 0 : material.pbrMetallicRoughness) == null ? void 0 : _c.metallicRoughnessTexture
  ];
  const processedTexCoords = [];
  for (const textureInfo of materialTextures) {
    if (textureInfo && ((_d = textureInfo == null ? void 0 : textureInfo.extensions) == null ? void 0 : _d[KHR_TEXTURE_TRANSFORM])) {
      transformPrimitives(gltfData, materialIndex, textureInfo, processedTexCoords);
    }
  }
}
function transformPrimitives(gltfData, materialIndex, texture, processedTexCoords) {
  const transformParameters = getTransformParameters(texture, processedTexCoords);
  if (!transformParameters) {
    return;
  }
  const meshes = gltfData.json.meshes || [];
  for (const mesh of meshes) {
    for (const primitive of mesh.primitives) {
      const material = primitive.material;
      if (Number.isFinite(material) && materialIndex === material) {
        transformPrimitive(gltfData, primitive, transformParameters);
      }
    }
  }
}
function getTransformParameters(texture, processedTexCoords) {
  var _a;
  const textureInfo = (_a = texture.extensions) == null ? void 0 : _a[KHR_TEXTURE_TRANSFORM];
  const { texCoord: originalTexCoord = 0 } = texture;
  const { texCoord = originalTexCoord } = textureInfo;
  const isProcessed = processedTexCoords.findIndex(([original, newTexCoord]) => original === originalTexCoord && newTexCoord === texCoord) !== -1;
  if (!isProcessed) {
    const matrix = makeTransformationMatrix(textureInfo);
    if (originalTexCoord !== texCoord) {
      texture.texCoord = texCoord;
    }
    processedTexCoords.push([originalTexCoord, texCoord]);
    return { originalTexCoord, texCoord, matrix };
  }
  return null;
}
function transformPrimitive(gltfData, primitive, transformParameters) {
  var _a, _b;
  const { originalTexCoord, texCoord, matrix } = transformParameters;
  const texCoordAccessor = primitive.attributes[`TEXCOORD_${originalTexCoord}`];
  if (Number.isFinite(texCoordAccessor)) {
    const accessor = (_a = gltfData.json.accessors) == null ? void 0 : _a[texCoordAccessor];
    if (accessor && accessor.bufferView) {
      const bufferView = (_b = gltfData.json.bufferViews) == null ? void 0 : _b[accessor.bufferView];
      if (bufferView) {
        const { arrayBuffer, byteOffset: bufferByteOffset } = gltfData.buffers[bufferView.buffer];
        const byteOffset = (bufferByteOffset || 0) + (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
        const { ArrayType, length } = getAccessorArrayTypeAndLength(accessor, bufferView);
        const bytes = BYTES[accessor.componentType];
        const components = COMPONENTS[accessor.type];
        const elementAddressScale = bufferView.byteStride || bytes * components;
        const result = new Float32Array(length);
        for (let i = 0; i < accessor.count; i++) {
          const uv = new ArrayType(arrayBuffer, byteOffset + i * elementAddressScale, 2);
          scratchVector.set(uv[0], uv[1], 1);
          scratchVector.transformByMatrix3(matrix);
          result.set([scratchVector[0], scratchVector[1]], i * components);
        }
        if (originalTexCoord === texCoord) {
          updateGltf(accessor, bufferView, gltfData.buffers, result);
        } else {
          createAttribute(texCoord, accessor, primitive, gltfData, result);
        }
      }
    }
  }
}
function updateGltf(accessor, bufferView, buffers, newTexCoordArray) {
  accessor.componentType = 5126;
  buffers.push({
    arrayBuffer: newTexCoordArray.buffer,
    byteOffset: 0,
    byteLength: newTexCoordArray.buffer.byteLength
  });
  bufferView.buffer = buffers.length - 1;
  bufferView.byteLength = newTexCoordArray.buffer.byteLength;
  bufferView.byteOffset = 0;
  delete bufferView.byteStride;
}
function createAttribute(newTexCoord, originalAccessor, primitive, gltfData, newTexCoordArray) {
  gltfData.buffers.push({
    arrayBuffer: newTexCoordArray.buffer,
    byteOffset: 0,
    byteLength: newTexCoordArray.buffer.byteLength
  });
  const bufferViews = gltfData.json.bufferViews;
  if (!bufferViews) {
    return;
  }
  bufferViews.push({
    buffer: gltfData.buffers.length - 1,
    byteLength: newTexCoordArray.buffer.byteLength,
    byteOffset: 0
  });
  const accessors = gltfData.json.accessors;
  if (!accessors) {
    return;
  }
  accessors.push({
    bufferView: (bufferViews == null ? void 0 : bufferViews.length) - 1,
    byteOffset: 0,
    componentType: 5126,
    count: originalAccessor.count,
    type: "VEC2"
  });
  primitive.attributes[`TEXCOORD_${newTexCoord}`] = accessors.length - 1;
}
function makeTransformationMatrix(extensionData) {
  const { offset = [0, 0], rotation = 0, scale = [1, 1] } = extensionData;
  const translationMatrix = new Matrix3().set(1, 0, 0, 0, 1, 0, offset[0], offset[1], 1);
  const rotationMatrix = scratchRotationMatrix.set(Math.cos(rotation), Math.sin(rotation), 0, -Math.sin(rotation), Math.cos(rotation), 0, 0, 0, 1);
  const scaleMatrix = scratchScaleMatrix.set(scale[0], 0, 0, 0, scale[1], 0, 0, 0, 1);
  return translationMatrix.multiplyRight(rotationMatrix).multiplyRight(scaleMatrix);
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/deprecated/KHR_lights_punctual.js
var KHR_lights_punctual_exports = {};
__export(KHR_lights_punctual_exports, {
  decode: () => decode8,
  encode: () => encode4,
  name: () => name9
});
var KHR_LIGHTS_PUNCTUAL = "KHR_lights_punctual";
var name9 = KHR_LIGHTS_PUNCTUAL;
async function decode8(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  const extension = gltfScenegraph.getExtension(KHR_LIGHTS_PUNCTUAL);
  if (extension) {
    gltfScenegraph.json.lights = extension.lights;
    gltfScenegraph.removeExtension(KHR_LIGHTS_PUNCTUAL);
  }
  for (const node of json.nodes || []) {
    const nodeExtension = gltfScenegraph.getObjectExtension(node, KHR_LIGHTS_PUNCTUAL);
    if (nodeExtension) {
      node.light = nodeExtension.light;
    }
    gltfScenegraph.removeObjectExtension(node, KHR_LIGHTS_PUNCTUAL);
  }
}
async function encode4(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  if (json.lights) {
    const extension = gltfScenegraph.addExtension(KHR_LIGHTS_PUNCTUAL);
    assert2(!extension.lights);
    extension.lights = json.lights;
    delete json.lights;
  }
  if (gltfScenegraph.json.lights) {
    for (const light of gltfScenegraph.json.lights) {
      const node = light.node;
      gltfScenegraph.addObjectExtension(node, KHR_LIGHTS_PUNCTUAL, light);
    }
    delete gltfScenegraph.json.lights;
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/deprecated/KHR_materials_unlit.js
var KHR_materials_unlit_exports = {};
__export(KHR_materials_unlit_exports, {
  decode: () => decode9,
  encode: () => encode5,
  name: () => name10
});
var KHR_MATERIALS_UNLIT = "KHR_materials_unlit";
var name10 = KHR_MATERIALS_UNLIT;
async function decode9(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  for (const material of json.materials || []) {
    const extension = material.extensions && material.extensions.KHR_materials_unlit;
    if (extension) {
      material.unlit = true;
    }
    gltfScenegraph.removeObjectExtension(material, KHR_MATERIALS_UNLIT);
  }
  gltfScenegraph.removeExtension(KHR_MATERIALS_UNLIT);
}
function encode5(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  if (gltfScenegraph.materials) {
    for (const material of json.materials || []) {
      if (material.unlit) {
        delete material.unlit;
        gltfScenegraph.addObjectExtension(material, KHR_MATERIALS_UNLIT, {});
        gltfScenegraph.addExtension(KHR_MATERIALS_UNLIT);
      }
    }
  }
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/deprecated/KHR_techniques_webgl.js
var KHR_techniques_webgl_exports = {};
__export(KHR_techniques_webgl_exports, {
  decode: () => decode10,
  encode: () => encode6,
  name: () => name11
});
var KHR_TECHNIQUES_WEBGL = "KHR_techniques_webgl";
var name11 = KHR_TECHNIQUES_WEBGL;
async function decode10(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  const extension = gltfScenegraph.getExtension(KHR_TECHNIQUES_WEBGL);
  if (extension) {
    const techniques = resolveTechniques(extension, gltfScenegraph);
    for (const material of json.materials || []) {
      const materialExtension = gltfScenegraph.getObjectExtension(material, KHR_TECHNIQUES_WEBGL);
      if (materialExtension) {
        material.technique = Object.assign(
          {},
          materialExtension,
          // @ts-ignore
          techniques[materialExtension.technique]
        );
        material.technique.values = resolveValues(material.technique, gltfScenegraph);
      }
      gltfScenegraph.removeObjectExtension(material, KHR_TECHNIQUES_WEBGL);
    }
    gltfScenegraph.removeExtension(KHR_TECHNIQUES_WEBGL);
  }
}
async function encode6(gltfData, options) {
}
function resolveTechniques(techniquesExtension, gltfScenegraph) {
  const { programs = [], shaders = [], techniques = [] } = techniquesExtension;
  const textDecoder = new TextDecoder();
  shaders.forEach((shader) => {
    if (Number.isFinite(shader.bufferView)) {
      shader.code = textDecoder.decode(gltfScenegraph.getTypedArrayForBufferView(shader.bufferView));
    } else {
      throw new Error("KHR_techniques_webgl: no shader code");
    }
  });
  programs.forEach((program) => {
    program.fragmentShader = shaders[program.fragmentShader];
    program.vertexShader = shaders[program.vertexShader];
  });
  techniques.forEach((technique) => {
    technique.program = programs[technique.program];
  });
  return techniques;
}
function resolveValues(technique, gltfScenegraph) {
  const values = Object.assign({}, technique.values);
  Object.keys(technique.uniforms || {}).forEach((uniform) => {
    if (technique.uniforms[uniform].value && !(uniform in values)) {
      values[uniform] = technique.uniforms[uniform].value;
    }
  });
  Object.keys(values).forEach((uniform) => {
    if (typeof values[uniform] === "object" && values[uniform].index !== void 0) {
      values[uniform].texture = gltfScenegraph.getTexture(values[uniform].index);
    }
  });
  return values;
}

// node_modules/@loaders.gl/gltf/dist/lib/api/gltf-extensions.js
var EXTENSIONS = [
  // 1.0
  // KHR_binary_gltf is handled separately - must be processed before other parsing starts
  // KHR_binary_gltf,
  // 2.0
  EXT_structural_metadata_exports,
  EXT_mesh_features_exports,
  EXT_meshopt_compression_exports,
  EXT_texture_webp_exports,
  // Basisu should come after webp, we want basisu to be preferred if both are provided
  KHR_texture_basisu_exports,
  KHR_draco_mesh_compression_exports,
  KHR_lights_punctual_exports,
  KHR_materials_unlit_exports,
  KHR_techniques_webgl_exports,
  KHR_texture_transform_exports,
  EXT_feature_metadata_exports
];
function preprocessExtensions(gltf, options = {}, context) {
  var _a;
  const extensions = EXTENSIONS.filter((extension) => useExtension(extension.name, options));
  for (const extension of extensions) {
    (_a = extension.preprocess) == null ? void 0 : _a.call(extension, gltf, options, context);
  }
}
async function decodeExtensions(gltf, options = {}, context) {
  var _a;
  const extensions = EXTENSIONS.filter((extension) => useExtension(extension.name, options));
  for (const extension of extensions) {
    await ((_a = extension.decode) == null ? void 0 : _a.call(extension, gltf, options, context));
  }
}
function useExtension(extensionName, options) {
  var _a;
  const excludes = ((_a = options == null ? void 0 : options.gltf) == null ? void 0 : _a.excludeExtensions) || {};
  const exclude = extensionName in excludes && !excludes[extensionName];
  return !exclude;
}

// node_modules/@loaders.gl/gltf/dist/lib/extensions/KHR_binary_gltf.js
var KHR_BINARY_GLTF = "KHR_binary_glTF";
function preprocess4(gltfData) {
  const gltfScenegraph = new GLTFScenegraph(gltfData);
  const { json } = gltfScenegraph;
  for (const image of json.images || []) {
    const extension = gltfScenegraph.getObjectExtension(image, KHR_BINARY_GLTF);
    if (extension) {
      Object.assign(image, extension);
    }
    gltfScenegraph.removeObjectExtension(image, KHR_BINARY_GLTF);
  }
  if (json.buffers && json.buffers[0]) {
    delete json.buffers[0].uri;
  }
  gltfScenegraph.removeExtension(KHR_BINARY_GLTF);
}

// node_modules/@loaders.gl/gltf/dist/lib/api/normalize-gltf-v1.js
var GLTF_ARRAYS = {
  accessors: "accessor",
  animations: "animation",
  buffers: "buffer",
  bufferViews: "bufferView",
  images: "image",
  materials: "material",
  meshes: "mesh",
  nodes: "node",
  samplers: "sampler",
  scenes: "scene",
  skins: "skin",
  textures: "texture"
};
var GLTF_KEYS = {
  accessor: "accessors",
  animations: "animation",
  buffer: "buffers",
  bufferView: "bufferViews",
  image: "images",
  material: "materials",
  mesh: "meshes",
  node: "nodes",
  sampler: "samplers",
  scene: "scenes",
  skin: "skins",
  texture: "textures"
};
var GLTFV1Normalizer = class {
  constructor() {
    __publicField(this, "idToIndexMap", {
      animations: {},
      accessors: {},
      buffers: {},
      bufferViews: {},
      images: {},
      materials: {},
      meshes: {},
      nodes: {},
      samplers: {},
      scenes: {},
      skins: {},
      textures: {}
    });
    __publicField(this, "json");
  }
  // constructor() {}
  /**
   * Convert (normalize) glTF < 2.0 to glTF 2.0
   * @param gltf - object with json and binChunks
   * @param options
   * @param options normalize Whether to actually normalize
   */
  normalize(gltf, options) {
    this.json = gltf.json;
    const json = gltf.json;
    switch (json.asset && json.asset.version) {
      // We are converting to v2 format. Return if there is nothing to do
      case "2.0":
        return;
      // This class is written to convert 1.0
      case void 0:
      case "1.0":
        break;
      default:
        console.warn(`glTF: Unknown version ${json.asset.version}`);
        return;
    }
    if (!options.normalize) {
      throw new Error("glTF v1 is not supported.");
    }
    console.warn("Converting glTF v1 to glTF v2 format. This is experimental and may fail.");
    this._addAsset(json);
    this._convertTopLevelObjectsToArrays(json);
    preprocess4(gltf);
    this._convertObjectIdsToArrayIndices(json);
    this._updateObjects(json);
    this._updateMaterial(json);
  }
  // asset is now required, #642 https://github.com/KhronosGroup/glTF/issues/639
  _addAsset(json) {
    json.asset = json.asset || {};
    json.asset.version = "2.0";
    json.asset.generator = json.asset.generator || "Normalized to glTF 2.0 by loaders.gl";
  }
  _convertTopLevelObjectsToArrays(json) {
    for (const arrayName in GLTF_ARRAYS) {
      this._convertTopLevelObjectToArray(json, arrayName);
    }
  }
  /** Convert one top level object to array */
  _convertTopLevelObjectToArray(json, mapName) {
    const objectMap = json[mapName];
    if (!objectMap || Array.isArray(objectMap)) {
      return;
    }
    json[mapName] = [];
    for (const id in objectMap) {
      const object = objectMap[id];
      object.id = object.id || id;
      const index = json[mapName].length;
      json[mapName].push(object);
      this.idToIndexMap[mapName][id] = index;
    }
  }
  /** Go through all objects in all top-level arrays and replace ids with indices */
  _convertObjectIdsToArrayIndices(json) {
    for (const arrayName in GLTF_ARRAYS) {
      this._convertIdsToIndices(json, arrayName);
    }
    if ("scene" in json) {
      json.scene = this._convertIdToIndex(json.scene, "scene");
    }
    for (const texture of json.textures) {
      this._convertTextureIds(texture);
    }
    for (const mesh of json.meshes) {
      this._convertMeshIds(mesh);
    }
    for (const node of json.nodes) {
      this._convertNodeIds(node);
    }
    for (const node of json.scenes) {
      this._convertSceneIds(node);
    }
  }
  _convertTextureIds(texture) {
    if (texture.source) {
      texture.source = this._convertIdToIndex(texture.source, "image");
    }
  }
  _convertMeshIds(mesh) {
    for (const primitive of mesh.primitives) {
      const { attributes, indices, material } = primitive;
      for (const attributeName in attributes) {
        attributes[attributeName] = this._convertIdToIndex(attributes[attributeName], "accessor");
      }
      if (indices) {
        primitive.indices = this._convertIdToIndex(indices, "accessor");
      }
      if (material) {
        primitive.material = this._convertIdToIndex(material, "material");
      }
    }
  }
  _convertNodeIds(node) {
    if (node.children) {
      node.children = node.children.map((child) => this._convertIdToIndex(child, "node"));
    }
    if (node.meshes) {
      node.meshes = node.meshes.map((mesh) => this._convertIdToIndex(mesh, "mesh"));
    }
  }
  _convertSceneIds(scene) {
    if (scene.nodes) {
      scene.nodes = scene.nodes.map((node) => this._convertIdToIndex(node, "node"));
    }
  }
  /** Go through all objects in a top-level array and replace ids with indices */
  _convertIdsToIndices(json, topLevelArrayName) {
    if (!json[topLevelArrayName]) {
      console.warn(`gltf v1: json doesn't contain attribute ${topLevelArrayName}`);
      json[topLevelArrayName] = [];
    }
    for (const object of json[topLevelArrayName]) {
      for (const key in object) {
        const id = object[key];
        const index = this._convertIdToIndex(id, key);
        object[key] = index;
      }
    }
  }
  _convertIdToIndex(id, key) {
    const arrayName = GLTF_KEYS[key];
    if (arrayName in this.idToIndexMap) {
      const index = this.idToIndexMap[arrayName][id];
      if (!Number.isFinite(index)) {
        throw new Error(`gltf v1: failed to resolve ${key} with id ${id}`);
      }
      return index;
    }
    return id;
  }
  /**
   *
   * @param {*} json
   */
  _updateObjects(json) {
    for (const buffer of this.json.buffers) {
      delete buffer.type;
    }
  }
  /**
   * Update material (set pbrMetallicRoughness)
   * @param {*} json
   */
  _updateMaterial(json) {
    var _a, _b, _c;
    for (const material of json.materials) {
      material.pbrMetallicRoughness = {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 1,
        roughnessFactor: 1
      };
      const textureId = ((_a = material.values) == null ? void 0 : _a.tex) || ((_b = material.values) == null ? void 0 : _b.texture2d_0) || ((_c = material.values) == null ? void 0 : _c.diffuseTex);
      const textureIndex = json.textures.findIndex((texture) => texture.id === textureId);
      if (textureIndex !== -1) {
        material.pbrMetallicRoughness.baseColorTexture = { index: textureIndex };
      }
    }
  }
};
function normalizeGLTFV1(gltf, options = {}) {
  return new GLTFV1Normalizer().normalize(gltf, options);
}

// node_modules/@loaders.gl/gltf/dist/lib/parsers/parse-gltf.js
async function parseGLTF(gltf, arrayBufferOrString, byteOffset = 0, options, context) {
  var _a, _b, _c;
  parseGLTFContainerSync(gltf, arrayBufferOrString, byteOffset, options);
  normalizeGLTFV1(gltf, { normalize: (_a = options == null ? void 0 : options.gltf) == null ? void 0 : _a.normalize });
  preprocessExtensions(gltf, options, context);
  if (((_b = options == null ? void 0 : options.gltf) == null ? void 0 : _b.loadBuffers) && gltf.json.buffers) {
    await loadBuffers(gltf, options, context);
  }
  if ((_c = options == null ? void 0 : options.gltf) == null ? void 0 : _c.loadImages) {
    await loadImages(gltf, options, context);
  }
  await decodeExtensions(gltf, options, context);
  return gltf;
}
function parseGLTFContainerSync(gltf, data, byteOffset, options) {
  if (options.uri) {
    gltf.baseUri = options.uri;
  }
  if (data instanceof ArrayBuffer && !isGLB(data, byteOffset, options)) {
    const textDecoder = new TextDecoder();
    data = textDecoder.decode(data);
  }
  if (typeof data === "string") {
    gltf.json = parseJSON(data);
  } else if (data instanceof ArrayBuffer) {
    const glb = {};
    byteOffset = parseGLBSync(glb, data, byteOffset, options.glb);
    assert2(glb.type === "glTF", `Invalid GLB magic string ${glb.type}`);
    gltf._glb = glb;
    gltf.json = glb.json;
  } else {
    assert2(false, "GLTF: must be ArrayBuffer or string");
  }
  const buffers = gltf.json.buffers || [];
  gltf.buffers = new Array(buffers.length).fill(null);
  if (gltf._glb && gltf._glb.header.hasBinChunk) {
    const { binChunks } = gltf._glb;
    gltf.buffers[0] = {
      arrayBuffer: binChunks[0].arrayBuffer,
      byteOffset: binChunks[0].byteOffset,
      byteLength: binChunks[0].byteLength
    };
  }
  const images = gltf.json.images || [];
  gltf.images = new Array(images.length).fill({});
}
async function loadBuffers(gltf, options, context) {
  var _a, _b;
  const buffers = gltf.json.buffers || [];
  for (let i = 0; i < buffers.length; ++i) {
    const buffer = buffers[i];
    if (buffer.uri) {
      const { fetch: fetch2 } = context;
      assert2(fetch2);
      const uri = resolveUrl(buffer.uri, options);
      const response = await ((_a = context == null ? void 0 : context.fetch) == null ? void 0 : _a.call(context, uri));
      const arrayBuffer = await ((_b = response == null ? void 0 : response.arrayBuffer) == null ? void 0 : _b.call(response));
      gltf.buffers[i] = {
        arrayBuffer,
        byteOffset: 0,
        byteLength: arrayBuffer.byteLength
      };
      delete buffer.uri;
    } else if (gltf.buffers[i] === null) {
      gltf.buffers[i] = {
        arrayBuffer: new ArrayBuffer(buffer.byteLength),
        byteOffset: 0,
        byteLength: buffer.byteLength
      };
    }
  }
}
async function loadImages(gltf, options, context) {
  const imageIndices = getReferencesImageIndices(gltf);
  const images = gltf.json.images || [];
  const promises = [];
  for (const imageIndex of imageIndices) {
    promises.push(loadImage(gltf, images[imageIndex], imageIndex, options, context));
  }
  return await Promise.all(promises);
}
function getReferencesImageIndices(gltf) {
  const imageIndices = /* @__PURE__ */ new Set();
  const textures = gltf.json.textures || [];
  for (const texture of textures) {
    if (texture.source !== void 0) {
      imageIndices.add(texture.source);
    }
  }
  return Array.from(imageIndices).sort();
}
async function loadImage(gltf, image, index, options, context) {
  let arrayBuffer;
  if (image.uri && !image.hasOwnProperty("bufferView")) {
    const uri = resolveUrl(image.uri, options);
    const { fetch: fetch2 } = context;
    const response = await fetch2(uri);
    arrayBuffer = await response.arrayBuffer();
    image.bufferView = {
      data: arrayBuffer
    };
  }
  if (Number.isFinite(image.bufferView)) {
    const array = getTypedArrayForBufferView(gltf.json, gltf.buffers, image.bufferView);
    arrayBuffer = sliceArrayBuffer(array.buffer, array.byteOffset, array.byteLength);
  }
  assert2(arrayBuffer, "glTF image has no data");
  let parsedImage = await parseFromContext(arrayBuffer, [ImageLoader, BasisLoader], {
    ...options,
    mimeType: image.mimeType,
    basis: options.basis || { format: selectSupportedBasisFormat() }
  }, context);
  if (parsedImage && parsedImage[0]) {
    parsedImage = {
      compressed: true,
      // @ts-expect-error
      mipmaps: false,
      width: parsedImage[0].width,
      height: parsedImage[0].height,
      data: parsedImage[0]
    };
  }
  gltf.images = gltf.images || [];
  gltf.images[index] = parsedImage;
}

// node_modules/@loaders.gl/gltf/dist/gltf-loader.js
var GLTFLoader = {
  dataType: null,
  batchType: null,
  name: "glTF",
  id: "gltf",
  module: "gltf",
  version: VERSION2,
  extensions: ["gltf", "glb"],
  mimeTypes: ["model/gltf+json", "model/gltf-binary"],
  text: true,
  binary: true,
  tests: ["glTF"],
  parse: parse2,
  options: {
    gltf: {
      normalize: true,
      // Normalize glTF v1 to glTF v2 format (not yet stable)
      loadBuffers: true,
      // Fetch any linked .BIN buffers, decode base64
      loadImages: true,
      // Create image objects
      decompressMeshes: true
      // Decompress Draco encoded meshes
    },
    // common?
    log: console
    // eslint-disable-line
  }
};
async function parse2(arrayBuffer, options = {}, context) {
  options = { ...GLTFLoader.options, ...options };
  options.gltf = { ...GLTFLoader.options.gltf, ...options.gltf };
  const { byteOffset = 0 } = options;
  const gltf = {};
  return await parseGLTF(gltf, arrayBuffer, byteOffset, options, context);
}

// node_modules/@loaders.gl/gltf/dist/lib/api/post-process-gltf.js
var COMPONENTS2 = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var BYTES2 = {
  5120: 1,
  // BYTE
  5121: 1,
  // UNSIGNED_BYTE
  5122: 2,
  // SHORT
  5123: 2,
  // UNSIGNED_SHORT
  5125: 4,
  // UNSIGNED_INT
  5126: 4
  // FLOAT
};
var GL_SAMPLER = {
  // Sampler parameters
  TEXTURE_MAG_FILTER: 10240,
  TEXTURE_MIN_FILTER: 10241,
  TEXTURE_WRAP_S: 10242,
  TEXTURE_WRAP_T: 10243,
  // Sampler default values
  REPEAT: 10497,
  LINEAR: 9729,
  NEAREST_MIPMAP_LINEAR: 9986
};
var SAMPLER_PARAMETER_GLTF_TO_GL = {
  magFilter: GL_SAMPLER.TEXTURE_MAG_FILTER,
  minFilter: GL_SAMPLER.TEXTURE_MIN_FILTER,
  wrapS: GL_SAMPLER.TEXTURE_WRAP_S,
  wrapT: GL_SAMPLER.TEXTURE_WRAP_T
};
var DEFAULT_SAMPLER_PARAMETERS = {
  [GL_SAMPLER.TEXTURE_MAG_FILTER]: GL_SAMPLER.LINEAR,
  [GL_SAMPLER.TEXTURE_MIN_FILTER]: GL_SAMPLER.NEAREST_MIPMAP_LINEAR,
  [GL_SAMPLER.TEXTURE_WRAP_S]: GL_SAMPLER.REPEAT,
  [GL_SAMPLER.TEXTURE_WRAP_T]: GL_SAMPLER.REPEAT
};
function makeDefaultSampler() {
  return {
    id: "default-sampler",
    parameters: DEFAULT_SAMPLER_PARAMETERS
  };
}
function getBytesFromComponentType(componentType) {
  return BYTES2[componentType];
}
function getSizeFromAccessorType(type) {
  return COMPONENTS2[type];
}
var GLTFPostProcessor = class {
  constructor() {
    __publicField(this, "baseUri", "");
    // @ts-expect-error
    __publicField(this, "jsonUnprocessed");
    // @ts-expect-error
    __publicField(this, "json");
    __publicField(this, "buffers", []);
    __publicField(this, "images", []);
  }
  postProcess(gltf, options = {}) {
    const { json, buffers = [], images = [] } = gltf;
    const { baseUri = "" } = gltf;
    assert2(json);
    this.baseUri = baseUri;
    this.buffers = buffers;
    this.images = images;
    this.jsonUnprocessed = json;
    this.json = this._resolveTree(gltf.json, options);
    return this.json;
  }
  // Convert indexed glTF structure into tree structure
  // cross-link index resolution, enum lookup, convenience calculations
  // eslint-disable-next-line complexity, max-statements
  _resolveTree(gltf, options = {}) {
    const json = { ...gltf };
    this.json = json;
    if (gltf.bufferViews) {
      json.bufferViews = gltf.bufferViews.map((bufView, i) => this._resolveBufferView(bufView, i));
    }
    if (gltf.images) {
      json.images = gltf.images.map((image, i) => this._resolveImage(image, i));
    }
    if (gltf.samplers) {
      json.samplers = gltf.samplers.map((sampler, i) => this._resolveSampler(sampler, i));
    }
    if (gltf.textures) {
      json.textures = gltf.textures.map((texture, i) => this._resolveTexture(texture, i));
    }
    if (gltf.accessors) {
      json.accessors = gltf.accessors.map((accessor, i) => this._resolveAccessor(accessor, i));
    }
    if (gltf.materials) {
      json.materials = gltf.materials.map((material, i) => this._resolveMaterial(material, i));
    }
    if (gltf.meshes) {
      json.meshes = gltf.meshes.map((mesh, i) => this._resolveMesh(mesh, i));
    }
    if (gltf.nodes) {
      json.nodes = gltf.nodes.map((node, i) => this._resolveNode(node, i));
      json.nodes = json.nodes.map((node, i) => this._resolveNodeChildren(node));
    }
    if (gltf.skins) {
      json.skins = gltf.skins.map((skin, i) => this._resolveSkin(skin, i));
    }
    if (gltf.scenes) {
      json.scenes = gltf.scenes.map((scene, i) => this._resolveScene(scene, i));
    }
    if (typeof this.json.scene === "number" && json.scenes) {
      json.scene = json.scenes[this.json.scene];
    }
    return json;
  }
  getScene(index) {
    return this._get(this.json.scenes, index);
  }
  getNode(index) {
    return this._get(this.json.nodes, index);
  }
  getSkin(index) {
    return this._get(this.json.skins, index);
  }
  getMesh(index) {
    return this._get(this.json.meshes, index);
  }
  getMaterial(index) {
    return this._get(this.json.materials, index);
  }
  getAccessor(index) {
    return this._get(this.json.accessors, index);
  }
  getCamera(index) {
    return this._get(this.json.cameras, index);
  }
  getTexture(index) {
    return this._get(this.json.textures, index);
  }
  getSampler(index) {
    return this._get(this.json.samplers, index);
  }
  getImage(index) {
    return this._get(this.json.images, index);
  }
  getBufferView(index) {
    return this._get(this.json.bufferViews, index);
  }
  getBuffer(index) {
    return this._get(this.json.buffers, index);
  }
  _get(array, index) {
    if (typeof index === "object") {
      return index;
    }
    const object = array && array[index];
    if (!object) {
      console.warn(`glTF file error: Could not find ${array}[${index}]`);
    }
    return object;
  }
  // PARSING HELPERS
  _resolveScene(scene, index) {
    return {
      ...scene,
      // @ts-ignore
      id: scene.id || `scene-${index}`,
      nodes: (scene.nodes || []).map((node) => this.getNode(node))
    };
  }
  _resolveNode(gltfNode, index) {
    const node = {
      ...gltfNode,
      // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: (gltfNode == null ? void 0 : gltfNode.id) || `node-${index}`
    };
    if (gltfNode.mesh !== void 0) {
      node.mesh = this.getMesh(gltfNode.mesh);
    }
    if (gltfNode.camera !== void 0) {
      node.camera = this.getCamera(gltfNode.camera);
    }
    if (gltfNode.skin !== void 0) {
      node.skin = this.getSkin(gltfNode.skin);
    }
    if (gltfNode.meshes !== void 0 && gltfNode.meshes.length) {
      node.mesh = gltfNode.meshes.reduce((accum, meshIndex) => {
        const mesh = this.getMesh(meshIndex);
        accum.id = mesh.id;
        accum.primitives = accum.primitives.concat(mesh.primitives);
        return accum;
      }, { primitives: [] });
    }
    return node;
  }
  _resolveNodeChildren(node) {
    if (node.children) {
      node.children = node.children.map((child) => this.getNode(child));
    }
    return node;
  }
  _resolveSkin(gltfSkin, index) {
    const inverseBindMatrices = typeof gltfSkin.inverseBindMatrices === "number" ? this.getAccessor(gltfSkin.inverseBindMatrices) : void 0;
    return {
      ...gltfSkin,
      id: gltfSkin.id || `skin-${index}`,
      inverseBindMatrices
    };
  }
  _resolveMesh(gltfMesh, index) {
    const mesh = {
      ...gltfMesh,
      id: gltfMesh.id || `mesh-${index}`,
      primitives: []
    };
    if (gltfMesh.primitives) {
      mesh.primitives = gltfMesh.primitives.map((gltfPrimitive) => {
        const primitive = {
          ...gltfPrimitive,
          attributes: {},
          indices: void 0,
          material: void 0
        };
        const attributes = gltfPrimitive.attributes;
        for (const attribute in attributes) {
          primitive.attributes[attribute] = this.getAccessor(attributes[attribute]);
        }
        if (gltfPrimitive.indices !== void 0) {
          primitive.indices = this.getAccessor(gltfPrimitive.indices);
        }
        if (gltfPrimitive.material !== void 0) {
          primitive.material = this.getMaterial(gltfPrimitive.material);
        }
        return primitive;
      });
    }
    return mesh;
  }
  _resolveMaterial(gltfMaterial, index) {
    const material = {
      ...gltfMaterial,
      // @ts-expect-error
      id: gltfMaterial.id || `material-${index}`
    };
    if (material.normalTexture) {
      material.normalTexture = { ...material.normalTexture };
      material.normalTexture.texture = this.getTexture(material.normalTexture.index);
    }
    if (material.occlusionTexture) {
      material.occlusionTexture = { ...material.occlusionTexture };
      material.occlusionTexture.texture = this.getTexture(material.occlusionTexture.index);
    }
    if (material.emissiveTexture) {
      material.emissiveTexture = { ...material.emissiveTexture };
      material.emissiveTexture.texture = this.getTexture(material.emissiveTexture.index);
    }
    if (!material.emissiveFactor) {
      material.emissiveFactor = material.emissiveTexture ? [1, 1, 1] : [0, 0, 0];
    }
    if (material.pbrMetallicRoughness) {
      material.pbrMetallicRoughness = { ...material.pbrMetallicRoughness };
      const mr = material.pbrMetallicRoughness;
      if (mr.baseColorTexture) {
        mr.baseColorTexture = { ...mr.baseColorTexture };
        mr.baseColorTexture.texture = this.getTexture(mr.baseColorTexture.index);
      }
      if (mr.metallicRoughnessTexture) {
        mr.metallicRoughnessTexture = { ...mr.metallicRoughnessTexture };
        mr.metallicRoughnessTexture.texture = this.getTexture(mr.metallicRoughnessTexture.index);
      }
    }
    return material;
  }
  _resolveAccessor(gltfAccessor, index) {
    const bytesPerComponent = getBytesFromComponentType(gltfAccessor.componentType);
    const components = getSizeFromAccessorType(gltfAccessor.type);
    const bytesPerElement = bytesPerComponent * components;
    const accessor = {
      ...gltfAccessor,
      // @ts-expect-error
      id: gltfAccessor.id || `accessor-${index}`,
      bytesPerComponent,
      components,
      bytesPerElement,
      value: void 0,
      bufferView: void 0,
      sparse: void 0
    };
    if (gltfAccessor.bufferView !== void 0) {
      accessor.bufferView = this.getBufferView(gltfAccessor.bufferView);
    }
    if (accessor.bufferView) {
      const buffer = accessor.bufferView.buffer;
      const { ArrayType, byteLength } = getAccessorArrayTypeAndLength(accessor, accessor.bufferView);
      const byteOffset = (accessor.bufferView.byteOffset || 0) + (accessor.byteOffset || 0) + buffer.byteOffset;
      let cutBuffer = buffer.arrayBuffer.slice(byteOffset, byteOffset + byteLength);
      if (accessor.bufferView.byteStride) {
        cutBuffer = this._getValueFromInterleavedBuffer(buffer, byteOffset, accessor.bufferView.byteStride, accessor.bytesPerElement, accessor.count);
      }
      accessor.value = new ArrayType(cutBuffer);
    }
    return accessor;
  }
  /**
   * Take values of particular accessor from interleaved buffer
   * various parts of the buffer
   * @param buffer
   * @param byteOffset
   * @param byteStride
   * @param bytesPerElement
   * @param count
   * @returns
   */
  _getValueFromInterleavedBuffer(buffer, byteOffset, byteStride, bytesPerElement, count) {
    const result = new Uint8Array(count * bytesPerElement);
    for (let i = 0; i < count; i++) {
      const elementOffset = byteOffset + i * byteStride;
      result.set(new Uint8Array(buffer.arrayBuffer.slice(elementOffset, elementOffset + bytesPerElement)), i * bytesPerElement);
    }
    return result.buffer;
  }
  _resolveTexture(gltfTexture, index) {
    return {
      ...gltfTexture,
      // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: gltfTexture.id || `texture-${index}`,
      sampler: typeof gltfTexture.sampler === "number" ? this.getSampler(gltfTexture.sampler) : makeDefaultSampler(),
      source: typeof gltfTexture.source === "number" ? this.getImage(gltfTexture.source) : void 0
    };
  }
  _resolveSampler(gltfSampler, index) {
    const sampler = {
      // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: gltfSampler.id || `sampler-${index}`,
      ...gltfSampler,
      parameters: {}
    };
    for (const key in sampler) {
      const glEnum = this._enumSamplerParameter(key);
      if (glEnum !== void 0) {
        sampler.parameters[glEnum] = sampler[key];
      }
    }
    return sampler;
  }
  _enumSamplerParameter(key) {
    return SAMPLER_PARAMETER_GLTF_TO_GL[key];
  }
  _resolveImage(gltfImage, index) {
    const image = {
      ...gltfImage,
      // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: gltfImage.id || `image-${index}`,
      image: null,
      bufferView: gltfImage.bufferView !== void 0 ? this.getBufferView(gltfImage.bufferView) : void 0
    };
    const preloadedImage = this.images[index];
    if (preloadedImage) {
      image.image = preloadedImage;
    }
    return image;
  }
  _resolveBufferView(gltfBufferView, index) {
    const bufferIndex = gltfBufferView.buffer;
    const arrayBuffer = this.buffers[bufferIndex].arrayBuffer;
    let byteOffset = this.buffers[bufferIndex].byteOffset || 0;
    if (gltfBufferView.byteOffset) {
      byteOffset += gltfBufferView.byteOffset;
    }
    const bufferView = {
      // // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: `bufferView-${index}`,
      ...gltfBufferView,
      // ...this.buffers[bufferIndex],
      buffer: this.buffers[bufferIndex],
      data: new Uint8Array(arrayBuffer, byteOffset, gltfBufferView.byteLength)
    };
    return bufferView;
  }
  _resolveCamera(gltfCamera, index) {
    const camera = {
      ...gltfCamera,
      // @ts-expect-error id could already be present, glTF standard does not prevent it
      id: gltfCamera.id || `camera-${index}`
    };
    if (camera.perspective) {
    }
    if (camera.orthographic) {
    }
    return camera;
  }
};
function postProcessGLTF(gltf, options) {
  return new GLTFPostProcessor().postProcess(gltf, options);
}

// node_modules/@deck.gl/mesh-layers/dist/scenegraph-layer/gltf-utils.js
async function waitForGLTFAssets(gltfObjects) {
  const remaining = [];
  gltfObjects.scenes.forEach((scene) => {
    scene.traverse((modelNode) => {
      Object.values(modelNode.model.uniforms).forEach((uniform) => {
        if (uniform.loaded === false) {
          remaining.push(uniform);
        }
      });
    });
  });
  return await waitWhileCondition(() => remaining.some((uniform) => !uniform.loaded));
}
async function waitWhileCondition(condition) {
  while (condition()) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

// node_modules/@deck.gl/mesh-layers/dist/scenegraph-layer/scenegraph-layer-uniforms.js
var uniformBlock2 = `uniform scenegraphUniforms {
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  mat4 sceneModelMatrix;
  bool composeModelMatrix;
} scenegraph;
`;
var scenegraphUniforms = {
  name: "scenegraph",
  vs: uniformBlock2,
  fs: uniformBlock2,
  uniformTypes: {
    sizeScale: "f32",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    sceneModelMatrix: "mat4x4<f32>",
    composeModelMatrix: "f32"
  }
};

// node_modules/@deck.gl/mesh-layers/dist/scenegraph-layer/scenegraph-layer-vertex.glsl.js
var scenegraph_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME scenegraph-layer-vertex-shader
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;
in vec3 positions;
#ifdef HAS_UV
in vec2 texCoords;
#endif
#ifdef LIGHTING_PBR
#ifdef HAS_NORMALS
in vec3 normals;
#endif
#endif
out vec4 vColor;
#ifndef LIGHTING_PBR
#ifdef HAS_UV
out vec2 vTEXCOORD_0;
#endif
#endif
void main(void) {
#if defined(HAS_UV) && !defined(LIGHTING_PBR)
vTEXCOORD_0 = texCoords;
geometry.uv = texCoords;
#endif
geometry.worldPosition = instancePositions;
geometry.pickingColor = instancePickingColors;
mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
vec3 normal = vec3(0.0, 0.0, 1.0);
#ifdef LIGHTING_PBR
#ifdef HAS_NORMALS
normal = instanceModelMatrix * (scenegraph.sceneModelMatrix * vec4(normals, 0.0)).xyz;
#endif
#endif
float originalSize = project_size_to_pixel(scenegraph.sizeScale);
float clampedSize = clamp(originalSize, scenegraph.sizeMinPixels, scenegraph.sizeMaxPixels);
vec3 pos = (instanceModelMatrix * (scenegraph.sceneModelMatrix * vec4(positions, 1.0)).xyz) * scenegraph.sizeScale * (clampedSize / originalSize) + instanceTranslation;
if(scenegraph.composeModelMatrix) {
DECKGL_FILTER_SIZE(pos, geometry);
geometry.normal = project_normal(normal);
geometry.worldPosition += pos;
gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
}
else {
pos = project_size(pos);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, geometry.position);
geometry.normal = project_normal(normal);
}
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
#ifdef LIGHTING_PBR
pbr_vPosition = geometry.position.xyz;
#ifdef HAS_NORMALS
pbr_vNormal = geometry.normal;
#endif
#ifdef HAS_UV
pbr_vUV = texCoords;
#else
pbr_vUV = vec2(0., 0.);
#endif
geometry.uv = pbr_vUV;
#endif
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// node_modules/@deck.gl/mesh-layers/dist/scenegraph-layer/scenegraph-layer-fragment.glsl.js
var scenegraph_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME scenegraph-layer-fragment-shader
in vec4 vColor;
out vec4 fragColor;
#ifndef LIGHTING_PBR
#if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
in vec2 vTEXCOORD_0;
uniform sampler2D pbr_baseColorSampler;
#endif
#endif
void main(void) {
#ifdef LIGHTING_PBR
fragColor = vColor * pbr_filterColor(vec4(0));
geometry.uv = pbr_vUV;
#else
#if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
fragColor = vColor * texture(pbr_baseColorSampler, vTEXCOORD_0);
geometry.uv = vTEXCOORD_0;
#else
fragColor = vColor;
#endif
#endif
fragColor.a *= layer.opacity;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// node_modules/@deck.gl/mesh-layers/dist/scenegraph-layer/scenegraph-layer.js
var DEFAULT_COLOR2 = [255, 255, 255, 255];
var defaultProps2 = {
  scenegraph: { type: "object", value: null, async: true },
  getScene: (gltf) => {
    if (gltf && gltf.scenes) {
      return typeof gltf.scene === "object" ? gltf.scene : gltf.scenes[gltf.scene || 0];
    }
    return gltf;
  },
  getAnimator: (scenegraph) => scenegraph && scenegraph.animator,
  _animations: null,
  sizeScale: { type: "number", value: 1, min: 0 },
  sizeMinPixels: { type: "number", min: 0, value: 0 },
  sizeMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR2 },
  // flat or pbr
  _lighting: "flat",
  // _lighting must be pbr for this to work
  _imageBasedLightingEnvironment: void 0,
  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: { type: "accessor", value: [0, 0, 0] },
  getScale: { type: "accessor", value: [1, 1, 1] },
  getTranslation: { type: "accessor", value: [0, 0, 0] },
  // 4x4 matrix
  getTransformMatrix: { type: "accessor", value: [] },
  loaders: [GLTFLoader]
};
var ScenegraphLayer = class extends layer_default {
  getShaders() {
    const defines = {};
    let pbr;
    if (this.props._lighting === "pbr") {
      pbr = pbrMaterial;
      defines.LIGHTING_PBR = 1;
    } else {
      pbr = { name: "pbrMaterial" };
    }
    const modules = [project32_default, picking_default, scenegraphUniforms, pbr];
    return super.getShaders({ defines, vs: scenegraph_layer_vertex_glsl_default, fs: scenegraph_layer_fragment_glsl_default, modules });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        accessor: "getPosition",
        transition: true
      },
      instanceColors: {
        type: "unorm8",
        size: this.props.colorFormat.length,
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR2,
        transition: true
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
  }
  updateState(params) {
    super.updateState(params);
    const { props, oldProps } = params;
    if (props.scenegraph !== oldProps.scenegraph) {
      this._updateScenegraph();
    } else if (props._animations !== oldProps._animations) {
      this._applyAnimationsProp(this.state.animator, props._animations);
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.scenegraph) == null ? void 0 : _a.destroy();
  }
  get isLoaded() {
    var _a;
    return Boolean(((_a = this.state) == null ? void 0 : _a.scenegraph) && super.isLoaded);
  }
  _updateScenegraph() {
    var _a;
    const props = this.props;
    const { device } = this.context;
    let scenegraphData = null;
    if (props.scenegraph instanceof ScenegraphNode) {
      scenegraphData = { scenes: [props.scenegraph] };
    } else if (props.scenegraph && typeof props.scenegraph === "object") {
      const gltf = props.scenegraph;
      const processedGLTF = gltf.json ? postProcessGLTF(gltf) : gltf;
      const gltfObjects = createScenegraphsFromGLTF(device, processedGLTF, this._getModelOptions());
      scenegraphData = { gltf: processedGLTF, ...gltfObjects };
      waitForGLTFAssets(gltfObjects).then(() => {
        this.setNeedsRedraw();
      }).catch((ex) => {
        this.raiseError(ex, "loading glTF");
      });
    }
    const options = { layer: this, device: this.context.device };
    const scenegraph = props.getScene(scenegraphData, options);
    const animator = props.getAnimator(scenegraphData, options);
    if (scenegraph instanceof GroupNode) {
      (_a = this.state.scenegraph) == null ? void 0 : _a.destroy();
      this._applyAnimationsProp(animator, props._animations);
      const models = [];
      scenegraph.traverse((node) => {
        if (node instanceof ModelNode) {
          models.push(node.model);
        }
      });
      this.setState({ scenegraph, animator, models });
      this.getAttributeManager().invalidateAll();
    } else if (scenegraph !== null) {
      log_default.warn("invalid scenegraph:", scenegraph)();
    }
  }
  _applyAnimationsProp(animator, animationsProp) {
    if (!animator || !animationsProp) {
      return;
    }
    const animations = animator.getAnimations();
    Object.keys(animationsProp).sort().forEach((key) => {
      const value = animationsProp[key];
      if (key === "*") {
        animations.forEach((animation) => {
          Object.assign(animation, value);
        });
      } else if (Number.isFinite(Number(key))) {
        const number = Number(key);
        if (number >= 0 && number < animations.length) {
          Object.assign(animations[number], value);
        } else {
          log_default.warn(`animation ${key} not found`)();
        }
      } else {
        const findResult = animations.find(({ name: name12 }) => name12 === key);
        if (findResult) {
          Object.assign(findResult, value);
        } else {
          log_default.warn(`animation ${key} not found`)();
        }
      }
    });
  }
  _getModelOptions() {
    const { _imageBasedLightingEnvironment } = this.props;
    let env;
    if (_imageBasedLightingEnvironment) {
      if (typeof _imageBasedLightingEnvironment === "function") {
        env = _imageBasedLightingEnvironment({ gl: this.context.gl, layer: this });
      } else {
        env = _imageBasedLightingEnvironment;
      }
    }
    return {
      imageBasedLightingEnvironment: env,
      modelOptions: {
        id: this.props.id,
        isInstanced: true,
        bufferLayout: this.getAttributeManager().getBufferLayouts(),
        ...this.getShaders()
      },
      // tangents are not supported
      useTangents: false
    };
  }
  draw({ context }) {
    if (!this.state.scenegraph)
      return;
    if (this.props._animations && this.state.animator) {
      this.state.animator.animate(context.timeline.getTime());
      this.setNeedsRedraw();
    }
    const { viewport, renderPass } = this.context;
    const { sizeScale, sizeMinPixels, sizeMaxPixels, coordinateSystem } = this.props;
    const numInstances = this.getNumInstances();
    this.state.scenegraph.traverse((node, { worldMatrix }) => {
      if (node instanceof ModelNode) {
        const { model } = node;
        model.setInstanceCount(numInstances);
        const pbrProjectionProps = {
          // Needed for PBR (TODO: find better way to get it)
          camera: model.uniforms.cameraPosition
        };
        const scenegraphProps = {
          sizeScale,
          sizeMinPixels,
          sizeMaxPixels,
          composeModelMatrix: shouldComposeModelMatrix(viewport, coordinateSystem),
          sceneModelMatrix: worldMatrix
        };
        model.shaderInputs.setProps({
          pbrProjection: pbrProjectionProps,
          scenegraph: scenegraphProps
        });
        model.draw(renderPass);
      }
    });
  }
};
ScenegraphLayer.defaultProps = defaultProps2;
ScenegraphLayer.layerName = "ScenegraphLayer";
var scenegraph_layer_default = ScenegraphLayer;
export {
  scenegraph_layer_default as ScenegraphLayer,
  simple_mesh_layer_default as SimpleMeshLayer
};
//# sourceMappingURL=@deck__gl_mesh-layers.js.map
