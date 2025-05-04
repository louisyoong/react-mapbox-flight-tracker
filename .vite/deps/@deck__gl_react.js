import {
  require_react
} from "./chunk-6GAV2S6I.js";
import {
  FlyToInterpolator,
  GlobeViewport,
  LinearInterpolator,
  View,
  applyStyles,
  deck_default,
  deepEqual,
  layer_default,
  log_default,
  removeStyles,
  web_mercator_viewport_default
} from "./chunk-UUN2JTKM.js";
import {
  __toESM
} from "./chunk-DC5AMYBS.js";

// node_modules/@deck.gl/react/dist/deckgl.js
var React2 = __toESM(require_react(), 1);
var import_react6 = __toESM(require_react(), 1);

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
  const defaultProps = LayerType.defaultProps || {};
  for (const key in reactProps) {
    if (defaultProps[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }
  return new LayerType(props);
}

// node_modules/@deck.gl/react/dist/utils/position-children-under-views.js
var import_react5 = __toESM(require_react(), 1);

// node_modules/@deck.gl/react/dist/utils/deckgl-context.js
var import_react4 = __toESM(require_react(), 1);
var DeckGlContext = (0, import_react4.createContext)();

// node_modules/@deck.gl/react/dist/utils/position-children-under-views.js
function positionChildrenUnderViews({ children, deck, ContextProvider = DeckGlContext.Provider }) {
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
    const viewElement = (0, import_react5.createElement)("div", { key, id: key, style }, ...viewChildren);
    const contextValue = {
      deck,
      viewport,
      // @ts-expect-error accessing protected property
      container: deck.canvas.offsetParent,
      // @ts-expect-error accessing protected property
      eventManager: deck.eventManager,
      onViewStateChange: (params) => {
        params.viewId = viewId;
        deck._onViewStateChange(params);
      },
      widgets: []
    };
    const providerKey = `view-${viewId}-context`;
    return (0, import_react5.createElement)(ContextProvider, { key: providerKey, value: contextValue }, viewElement);
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
  var _a, _b, _c;
  const deck = new DeckClass({
    ...props,
    // The Deck's animation loop is independent from React's render cycle, causing potential
    // synchronization issues. We provide this custom render function to make sure that React
    // and Deck update on the same schedule.
    // TODO(ibgreen) - Hack to enable WebGPU as it needs to render quickly to avoid CanvasContext texture from going stale
    _customRender: ((_c = (_b = (_a = props.deviceProps) == null ? void 0 : _a.adapters) == null ? void 0 : _b[0]) == null ? void 0 : _c.type) === "webgpu" ? void 0 : (redrawReason) => {
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
  const [version, setVersion] = (0, import_react6.useState)(0);
  const _thisRef = (0, import_react6.useRef)({
    control: null,
    version,
    forceUpdate: () => setVersion((v2) => v2 + 1)
  });
  const thisRef = _thisRef.current;
  const containerRef = (0, import_react6.useRef)(null);
  const canvasRef = (0, import_react6.useRef)(null);
  const jsxProps = (0, import_react6.useMemo)(() => extractJSXLayers(props), [props.layers, props.views, props.children]);
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
  const deckProps = (0, import_react6.useMemo)(() => {
    const forwardProps = {
      widgets: [],
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
  (0, import_react6.useEffect)(() => {
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
  (0, import_react6.useImperativeHandle)(ref, () => getRefHandles(thisRef), []);
  const currentViewports = thisRef.deck && thisRef.deck.isInitialized ? thisRef.deck.getViewports() : void 0;
  const { ContextProvider, width = "100%", height = "100%", id, style } = props;
  const { containerStyle, canvasStyle } = (0, import_react6.useMemo)(() => extractStyles({ width, height, style }), [width, height, style]);
  if (!thisRef.viewStateUpdateRequested && thisRef.lastRenderedViewports === currentViewports || // case 2
  thisRef.version !== version) {
    thisRef.lastRenderedViewports = currentViewports;
    thisRef.version = version;
    const childrenUnderViews = positionChildrenUnderViews({
      children: jsxProps.children,
      deck: thisRef.deck,
      ContextProvider
    });
    const canvas = (0, import_react6.createElement)("canvas", {
      key: "canvas",
      id: id || "deckgl-overlay",
      ref: canvasRef,
      style: canvasStyle
    });
    thisRef.control = (0, import_react6.createElement)("div", { id: `${id || "deckgl"}-wrapper`, ref: containerRef, style: containerStyle }, [canvas, childrenUnderViews]);
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
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var y = [];
var v = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var w = Array.isArray;
function d(n2, l2) {
  for (var u3 in l2) n2[u3] = l2[u3];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u3, t2) {
  var i3, r2, o2, e2 = {};
  for (o2 in u3) "key" == o2 ? i3 = u3[o2] : "ref" == o2 ? r2 = u3[o2] : e2[o2] = u3[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) null == e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return m(l2, e2, i3, r2, null);
}
function m(n2, t2, i3, r2, o2) {
  var e2 = { type: n2, props: t2, key: i3, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u : o2, __i: -1, __u: 0 };
  return null == o2 && null != l.vnode && l.vnode(e2), e2;
}
function k(n2) {
  return n2.children;
}
function x(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (null == l2) return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u3; l2 < n2.__k.length; l2++) if (null != (u3 = n2.__k[l2]) && null != u3.__e) return u3.__e;
  return "function" == typeof n2.type ? S(n2) : null;
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
  (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)($);
}
function $() {
  for (var n2, u3, t2, r2, o2, f3, c2, s2 = 1; i.length; ) i.length > s2 && i.sort(e), n2 = i.shift(), s2 = i.length, n2.__d && (t2 = void 0, o2 = (r2 = (u3 = n2).__v).__e, f3 = [], c2 = [], u3.__P && ((t2 = d({}, r2)).__v = r2.__v + 1, l.vnode && l.vnode(t2), O(u3.__P, t2, r2, u3.__n, u3.__P.namespaceURI, 32 & r2.__u ? [o2] : null, f3, null == o2 ? S(r2) : o2, !!(32 & r2.__u), c2), t2.__v = r2.__v, t2.__.__k[t2.__i] = t2, z(f3, t2, c2), t2.__e != o2 && C(t2)));
  $.__r = 0;
}
function I(n2, l2, u3, t2, i3, r2, o2, e2, f3, c2, s2) {
  var a2, h2, v2, w2, d2, g2, _2 = t2 && t2.__k || y, m2 = l2.length;
  for (f3 = P(u3, l2, _2, f3, m2), a2 = 0; a2 < m2; a2++) null != (v2 = u3.__k[a2]) && (h2 = -1 == v2.__i ? p : _2[v2.__i] || p, v2.__i = a2, g2 = O(n2, v2, h2, i3, r2, o2, e2, f3, c2, s2), w2 = v2.__e, v2.ref && h2.ref != v2.ref && (h2.ref && q(h2.ref, null, v2), s2.push(v2.ref, v2.__c || w2, v2)), null == d2 && null != w2 && (d2 = w2), 4 & v2.__u || h2.__k === v2.__k ? f3 = A(v2, f3, n2) : "function" == typeof v2.type && void 0 !== g2 ? f3 = g2 : w2 && (f3 = w2.nextSibling), v2.__u &= -7);
  return u3.__e = d2, f3;
}
function P(n2, l2, u3, t2, i3) {
  var r2, o2, e2, f3, c2, s2 = u3.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i3), r2 = 0; r2 < i3; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? (f3 = r2 + h2, (o2 = n2.__k[r2] = "string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? m(null, o2, null, null, null) : w(o2) ? m(k, { children: o2 }, null, null, null) : null == o2.constructor && o2.__b > 0 ? m(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : o2).__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = L(o2, u3, f3, a2)) && (a2--, (e2 = u3[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i3 > s2 ? h2-- : i3 < s2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f3 && (c2 == f3 - 1 ? h2-- : c2 == f3 + 1 ? h2++ : (c2 > f3 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2) for (r2 = 0; r2 < s2; r2++) null != (e2 = u3[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S(e2)), B(e2, e2));
  return t2;
}
function A(n2, l2, u3) {
  var t2, i3;
  if ("function" == typeof n2.type) {
    for (t2 = n2.__k, i3 = 0; t2 && i3 < t2.length; i3++) t2[i3] && (t2[i3].__ = n2, l2 = A(t2[i3], l2, u3));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !u3.contains(l2) && (l2 = S(n2)), u3.insertBefore(n2.__e, l2 || null), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function L(n2, l2, u3, t2) {
  var i3, r2, o2 = n2.key, e2 = n2.type, f3 = l2[u3];
  if (null === f3 && null == n2.key || f3 && o2 == f3.key && e2 == f3.type && 0 == (2 & f3.__u)) return u3;
  if (t2 > (null != f3 && 0 == (2 & f3.__u) ? 1 : 0)) for (i3 = u3 - 1, r2 = u3 + 1; i3 >= 0 || r2 < l2.length; ) {
    if (i3 >= 0) {
      if ((f3 = l2[i3]) && 0 == (2 & f3.__u) && o2 == f3.key && e2 == f3.type) return i3;
      i3--;
    }
    if (r2 < l2.length) {
      if ((f3 = l2[r2]) && 0 == (2 & f3.__u) && o2 == f3.key && e2 == f3.type) return r2;
      r2++;
    }
  }
  return -1;
}
function T(n2, l2, u3) {
  "-" == l2[0] ? n2.setProperty(l2, null == u3 ? "" : u3) : n2[l2] = null == u3 ? "" : "number" != typeof u3 || v.test(l2) ? u3 : u3 + "px";
}
function j(n2, l2, u3, t2, i3) {
  var r2;
  n: if ("style" == l2) if ("string" == typeof u3) n2.style.cssText = u3;
  else {
    if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u3 && l2 in u3 || T(n2.style, l2, "");
    if (u3) for (l2 in u3) t2 && u3[l2] == t2[l2] || T(n2.style, l2, u3[l2]);
  }
  else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(f, "$1")), l2 = l2.toLowerCase() in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? l2.toLowerCase().slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u3, u3 ? t2 ? u3.u = t2.u : (u3.u = c, n2.addEventListener(l2, r2 ? a : s, r2)) : n2.removeEventListener(l2, r2 ? a : s, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u3 ? "" : u3;
      break n;
    } catch (n3) {
    }
    "function" == typeof u3 || (null == u3 || false === u3 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u3 ? "" : u3));
  }
}
function F(n2) {
  return function(u3) {
    if (this.l) {
      var t2 = this.l[u3.type + n2];
      if (null == u3.t) u3.t = c++;
      else if (u3.t < t2.u) return;
      return t2(l.event ? l.event(u3) : u3);
    }
  };
}
function O(n2, u3, t2, i3, r2, o2, e2, f3, c2, s2) {
  var a2, h2, p2, y2, v2, _2, m2, b, S2, C2, M2, $2, P2, A2, H, L2, T2, j2 = u3.type;
  if (null != u3.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f3 = u3.__e = t2.__e]), (a2 = l.__b) && a2(u3);
  n: if ("function" == typeof j2) try {
    if (b = u3.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i3[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i3, t2.__c ? m2 = (h2 = u3.__c = t2.__c).__ = h2.__E : (S2 ? u3.__c = h2 = new j2(b, M2) : (u3.__c = h2 = new x(b, M2), h2.constructor = j2, h2.render = D), C2 && C2.sub(h2), h2.props = b, h2.state || (h2.state = {}), h2.context = M2, h2.__n = i3, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && null == h2.__s && (h2.__s = h2.state), S2 && null != j2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = d({}, h2.__s)), d(h2.__s, j2.getDerivedStateFromProps(b, h2.__s))), y2 = h2.props, v2 = h2.state, h2.__v = u3, p2) S2 && null == j2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), S2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (S2 && null == j2.getDerivedStateFromProps && b !== y2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(b, M2), !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(b, h2.__s, M2) || u3.__v == t2.__v) {
        for (u3.__v != t2.__v && (h2.props = b, h2.state = h2.__s, h2.__d = false), u3.__e = t2.__e, u3.__k = t2.__k, u3.__k.some(function(n3) {
          n3 && (n3.__ = u3);
        }), $2 = 0; $2 < h2._sb.length; $2++) h2.__h.push(h2._sb[$2]);
        h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(b, h2.__s, M2), S2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(y2, v2, _2);
      });
    }
    if (h2.context = M2, h2.props = b, h2.__P = n2, h2.__e = false, P2 = l.__r, A2 = 0, S2) {
      for (h2.state = h2.__s, h2.__d = false, P2 && P2(u3), a2 = h2.render(h2.props, h2.state, h2.context), H = 0; H < h2._sb.length; H++) h2.__h.push(h2._sb[H]);
      h2._sb = [];
    } else do {
      h2.__d = false, P2 && P2(u3), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++A2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i3 = d(d({}, i3), h2.getChildContext())), S2 && !p2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(y2, v2)), L2 = a2, null != a2 && a2.type === k && null == a2.key && (L2 = N(a2.props.children)), f3 = I(n2, w(L2) ? L2 : [L2], u3, t2, i3, r2, o2, e2, f3, c2, s2), h2.base = u3.__e, u3.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u3.__v = null, c2 || null != o2) if (n3.then) {
      for (u3.__u |= c2 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
      o2[o2.indexOf(f3)] = null, u3.__e = f3;
    } else for (T2 = o2.length; T2--; ) g(o2[T2]);
    else u3.__e = t2.__e, u3.__k = t2.__k;
    l.__e(n3, u3, t2);
  }
  else null == o2 && u3.__v == t2.__v ? (u3.__k = t2.__k, u3.__e = t2.__e) : f3 = u3.__e = V(t2.__e, u3, t2, i3, r2, o2, e2, c2, s2);
  return (a2 = l.diffed) && a2(u3), 128 & u3.__u ? void 0 : f3;
}
function z(n2, u3, t2) {
  for (var i3 = 0; i3 < t2.length; i3++) q(t2[i3], t2[++i3], t2[++i3]);
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
function N(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : w(n2) ? n2.map(N) : d({}, n2);
}
function V(u3, t2, i3, r2, o2, e2, f3, c2, s2) {
  var a2, h2, y2, v2, d2, _2, m2, b = i3.props, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (a2 = 0; a2 < e2.length; a2++) if ((d2 = e2[a2]) && "setAttribute" in d2 == !!x2 && (x2 ? d2.localName == x2 : 3 == d2.nodeType)) {
      u3 = d2, e2[a2] = null;
      break;
    }
  }
  if (null == u3) {
    if (null == x2) return document.createTextNode(k2);
    u3 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l.__m && l.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) b === k2 || c2 && u3.data == k2 || (u3.data = k2);
  else {
    if (e2 = e2 && n.call(u3.childNodes), b = i3.props || p, !c2 && null != e2) for (b = {}, a2 = 0; a2 < u3.attributes.length; a2++) b[(d2 = u3.attributes[a2]).name] = d2.value;
    for (a2 in b) if (d2 = b[a2], "children" == a2) ;
    else if ("dangerouslySetInnerHTML" == a2) y2 = d2;
    else if (!(a2 in k2)) {
      if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
      j(u3, a2, null, d2, o2);
    }
    for (a2 in k2) d2 = k2[a2], "children" == a2 ? v2 = d2 : "dangerouslySetInnerHTML" == a2 ? h2 = d2 : "value" == a2 ? _2 = d2 : "checked" == a2 ? m2 = d2 : c2 && "function" != typeof d2 || b[a2] === d2 || j(u3, a2, d2, b[a2], o2);
    if (h2) c2 || y2 && (h2.__html == y2.__html || h2.__html == u3.innerHTML) || (u3.innerHTML = h2.__html), t2.__k = [];
    else if (y2 && (u3.innerHTML = ""), I("template" == t2.type ? u3.content : u3, w(v2) ? v2 : [v2], t2, i3, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f3, e2 ? e2[0] : i3.__k && S(i3, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) g(e2[a2]);
    c2 || (a2 = "value", "progress" == x2 && null == _2 ? u3.removeAttribute("value") : null != _2 && (_2 !== u3[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a2]) && j(u3, a2, _2, b[a2], o2), a2 = "checked", null != m2 && m2 != u3[a2] && j(u3, a2, m2, b[a2], o2));
  }
  return u3;
}
function q(n2, u3, t2) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == u3 || (n2.__u = n2(u3));
    } else n2.current = u3;
  } catch (n3) {
    l.__e(n3, t2);
  }
}
function B(n2, u3, t2) {
  var i3, r2;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || q(i3, null, u3)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, u3);
    }
    i3.base = i3.__P = null;
  }
  if (i3 = n2.__k) for (r2 = 0; r2 < i3.length; r2++) i3[r2] && B(i3[r2], u3, t2 || "function" != typeof n2.type);
  t2 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function D(n2, l2, u3) {
  return this.constructor(n2, u3);
}
function E(u3, t2, i3) {
  var r2, o2, e2, f3;
  t2 == document && (t2 = document.documentElement), l.__ && l.__(u3, t2), o2 = (r2 = "function" == typeof i3) ? null : i3 && i3.__k || t2.__k, e2 = [], f3 = [], O(t2, u3 = (!r2 && i3 || t2).__k = _(k, null, [u3]), o2 || p, p, t2.namespaceURI, !r2 && i3 ? [i3] : o2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, !r2 && i3 ? i3 : o2 ? o2.__e : t2.firstChild, r2, f3), z(e2, u3, f3);
}
n = y.slice, l = { __e: function(n2, l2, u3, t2) {
  for (var i3, r2, o2; l2 = l2.__; ) if ((i3 = l2.__c) && !i3.__) try {
    if ((r2 = i3.constructor) && null != r2.getDerivedStateFromError && (i3.setState(r2.getDerivedStateFromError(n2)), o2 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t2 || {}), o2 = i3.__d), o2) return i3.__E = i3;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && null == n2.constructor;
}, x.prototype.setState = function(n2, l2) {
  var u3;
  u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = d({}, this.state), "function" == typeof n2 && (n2 = n2(d({}, u3), this.props)), n2 && d(u3, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f2 = 0;
var i2 = Array.isArray;
function u2(e2, t2, n2, o2, i3, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i3, __self: u3 };
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
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ...props,
      enterLabel: props.enterLabel ?? "Enter Fullscreen",
      exitLabel: props.exitLabel ?? "Exit Fullscreen",
      style: props.style ?? {}
    };
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const el = document.createElement("div");
    el.classList.add("deck-widget", "deck-widget-fullscreen");
    if (className)
      el.classList.add(className);
    applyStyles(el, style);
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
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = u2(IconButton, { onClick: this.handleClick.bind(this), label: this.fullscreen ? exitLabel : enterLabel, className: this.fullscreen ? "deck-widget-fullscreen-exit" : "deck-widget-fullscreen-enter" });
    E(ui, element);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
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
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
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
    this.id = props.id ?? this.id;
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ...props,
      transitionDuration: props.transitionDuration ?? 200,
      label: props.label ?? "Reset Compass",
      style: props.style ?? {}
    };
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
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
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
  }
  onViewportChange(viewport) {
    if (!viewport.equals(this.viewports[viewport.id])) {
      this.viewports[viewport.id] = viewport;
      this.update();
    }
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-compass");
    if (className)
      element.classList.add(className);
    applyStyles(element, style);
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
    }, title: this.props.label, style: { transform: `rotateX(${rx}deg)` }, children: u2("svg", { fill: "none", width: "100%", height: "100%", viewBox: "0 0 26 26", children: u2("g", { transform: `rotate(${rz},13,13)`, children: [u2("path", { d: "M10 13.0001L12.9999 5L15.9997 13.0001H10Z", fill: "var(--icon-compass-north-color, #F05C44)" }), u2("path", { d: "M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z", fill: "var(--icon-compass-south-color, #C2C2CC)" })] }) }) }) });
    E(ui, element);
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
var ZoomWidget = class _ZoomWidget {
  constructor(props = {}) {
    this.id = "zoom";
    this.placement = "top-left";
    this.viewId = null;
    this.viewports = {};
    this.id = props.id ?? this.id;
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ..._ZoomWidget.defaultProps,
      ...props
    };
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-zoom");
    if (className)
      element.classList.add(className);
    applyStyles(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
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
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
  }
  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }
  handleZoom(viewport, nextZoom) {
    const viewId = this.viewId || (viewport == null ? void 0 : viewport.id) || "default-view";
    const nextViewState = {
      ...viewport,
      zoom: nextZoom
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator = "latitude" in nextViewState ? new FlyToInterpolator() : new LinearInterpolator();
    }
    this.setViewState(viewId, nextViewState);
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
  /**
   * @todo - move to deck or widget manager
   */
  setViewState(viewId, viewState) {
    this.deck._onViewStateChange({ viewId, viewState, interactionState: {} });
  }
  update() {
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = u2(ButtonGroup, { orientation: this.props.orientation, children: [u2(GroupedIconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), u2(GroupedIconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] });
    E(ui, element);
  }
};
ZoomWidget.defaultProps = {
  id: "zoom-widget",
  style: {},
  placement: "top-left",
  className: void 0,
  orientation: "vertical",
  transitionDuration: 200,
  zoomInLabel: "Zoom In",
  zoomOutLabel: "Zoom Out",
  viewId: void 0
};

// node_modules/@deck.gl/widgets/dist/widget-impl.js
var WidgetImpl = class {
  constructor(props) {
    this.id = props.id || "widget";
    this.props = props;
  }
  onAdd({ deck }) {
    this.deck = deck;
    const { style, className } = this.props;
    const el = this._createRootElement({
      widgetClassName: this.className,
      className,
      style
    });
    this.element = el;
    this.onRenderHTML();
    return this.element;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
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
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.onRenderHTML();
  }
  _createRootElement(props) {
    const { widgetClassName, className, style } = props;
    const element = document.createElement("div");
    ["deck-widget", widgetClassName, className].filter((cls) => typeof cls === "string" && cls.length > 0).forEach((className2) => element.classList.add(className2));
    applyStyles(element, style);
    return element;
  }
};
WidgetImpl.defaultProps = {
  id: "widget",
  style: {},
  className: ""
};

// node_modules/@deck.gl/widgets/dist/screenshot-widget.js
var ScreenshotWidget = class _ScreenshotWidget extends WidgetImpl {
  constructor(props = {}) {
    super({ ..._ScreenshotWidget.defaultProps, ...props });
    this.className = "deck-widget-screenshot";
    this.placement = "top-left";
    this.placement = props.placement ?? this.placement;
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }
  onRenderHTML() {
    const element = this.element;
    if (!element)
      return;
    E(u2(IconButton, { className: "deck-widget-camera", label: this.props.label, onClick: this.handleClick.bind(this) }), element);
  }
  handleClick() {
    if (this.props.onCapture) {
      this.props.onCapture(this);
      return;
    }
    const dataURL = this.captureScreenToDataURL(this.props.imageFormat);
    if (dataURL) {
      this.downloadDataURL(dataURL, this.props.filename);
    }
  }
  /** @note only captures canvas contents, not HTML DOM or CSS styles */
  captureScreenToDataURL(imageFormat) {
    var _a;
    const canvas = (_a = this.deck) == null ? void 0 : _a.getCanvas();
    return canvas == null ? void 0 : canvas.toDataURL(imageFormat);
  }
  /** Download a data URL */
  downloadDataURL(dataURL, filename) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    link.click();
  }
};
ScreenshotWidget.defaultProps = {
  ...WidgetImpl.defaultProps,
  id: "screenshot",
  placement: "top-left",
  label: "Screenshot",
  filename: "screenshot.png",
  imageFormat: "image/png",
  onCapture: void 0
};

// node_modules/@deck.gl/widgets/dist/reset-view-widget.js
var ResetViewWidget = class _ResetViewWidget extends WidgetImpl {
  constructor(props = {}) {
    super({ ..._ResetViewWidget.defaultProps, ...props });
    this.className = "deck-widget-reset-view";
    this.placement = "top-left";
    this.placement = props.placement ?? this.placement;
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }
  onRenderHTML() {
    const element = this.element;
    if (!element)
      return;
    E(u2(IconButton, { className: "deck-widget-reset-focus", label: this.props.label, onClick: this.handleClick.bind(this) }), element);
  }
  handleClick() {
    var _a;
    const initialViewState = this.props.initialViewState || ((_a = this.deck) == null ? void 0 : _a.props.initialViewState);
    this.setViewState(initialViewState);
  }
  setViewState(viewState) {
    const viewId = this.props.viewId || (viewState == null ? void 0 : viewState.id) || "default-view";
    const nextViewState = {
      ...viewState
      // only works for geospatial?
      // transitionDuration: this.props.transitionDuration,
      // transitionInterpolator: new FlyToInterpolator()
    };
    this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
  }
};
ResetViewWidget.defaultProps = {
  ...WidgetImpl.defaultProps,
  id: "reset-view",
  placement: "top-left",
  label: "Reset View",
  initialViewState: void 0,
  viewId: void 0
};

// node_modules/@deck.gl/react/dist/utils/use-widget.js
var import_react7 = __toESM(require_react(), 1);
function useWidget(WidgetClass, props) {
  const context = (0, import_react7.useContext)(DeckGlContext);
  const { widgets, deck } = context;
  (0, import_react7.useEffect)(() => {
    const internalWidgets = deck == null ? void 0 : deck.props.widgets;
    if ((widgets == null ? void 0 : widgets.length) && (internalWidgets == null ? void 0 : internalWidgets.length) && !deepEqual(internalWidgets, widgets, 1)) {
      log_default.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }
    return () => {
      const index = widgets == null ? void 0 : widgets.indexOf(widget);
      if (index && index !== -1) {
        widgets == null ? void 0 : widgets.splice(index, 1);
        deck == null ? void 0 : deck.setProps({ widgets });
      }
    };
  }, []);
  const widget = (0, import_react7.useMemo)(() => new WidgetClass(props), [WidgetClass]);
  widgets == null ? void 0 : widgets.push(widget);
  widget.setProps(props);
  (0, import_react7.useEffect)(() => {
    deck == null ? void 0 : deck.setProps({ widgets });
  }, [widgets]);
  return widget;
}

// node_modules/@deck.gl/react/dist/widgets/compass-widget.js
var CompassWidget2 = (props = {}) => {
  const widget = useWidget(CompassWidget, props);
  return null;
};

// node_modules/@deck.gl/react/dist/widgets/fullscreen-widget.js
var FullscreenWidget2 = (props = {}) => {
  const widget = useWidget(FullscreenWidget, props);
  return null;
};

// node_modules/@deck.gl/react/dist/widgets/zoom-widget.js
var ZoomWidget2 = (props = {}) => {
  const widget = useWidget(ZoomWidget, props);
  return null;
};
export {
  CompassWidget2 as CompassWidget,
  deckgl_default as DeckGL,
  FullscreenWidget2 as FullscreenWidget,
  ZoomWidget2 as ZoomWidget,
  deckgl_default as default,
  useWidget
};
//# sourceMappingURL=@deck__gl_react.js.map
