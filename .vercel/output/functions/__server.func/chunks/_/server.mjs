import { AsyncLocalStorage } from "node:async_hooks";
import { jsx } from "react/jsx-runtime";
import { defineHandlerCallback, renderRouterToStream } from "@tanstack/react-router/ssr/server";
import { RouterProvider } from "@tanstack/react-router";
function StartServer(props) {
  return /* @__PURE__ */ jsx(RouterProvider, { router: props.router });
}
const defaultStreamHandler = defineHandlerCallback(
  ({ request, router, responseHeaders }) => renderRouterToStream({
    request,
    router,
    responseHeaders,
    children: /* @__PURE__ */ jsx(StartServer, { router })
  })
);
const stateIndexKey = "__TSR_index";
function createHistory(opts) {
  let location = opts.getLocation();
  const subscribers = /* @__PURE__ */ new Set();
  const notify = (action) => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber({ location, action }));
  };
  const handleIndexChange = (action) => {
    if (opts.notifyOnIndexChange ?? true) notify(action);
    else location = opts.getLocation();
  };
  const tryNavigation = async ({
    task,
    navigateOpts,
    ...actionInfo
  }) => {
    const ignoreBlocker = navigateOpts?.ignoreBlocker ?? false;
    if (ignoreBlocker) {
      task();
      return;
    }
    const blockers = opts.getBlockers?.() ?? [];
    const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
    if (typeof document !== "undefined" && blockers.length && isPushOrReplace) {
      for (const blocker of blockers) {
        const nextLocation = parseHref(actionInfo.path, actionInfo.state);
        const isBlocked = await blocker.blockerFn({
          currentLocation: location,
          nextLocation,
          action: actionInfo.type
        });
        if (isBlocked) {
          opts.onBlocked?.();
          return;
        }
      }
    }
    task();
  };
  return {
    get location() {
      return location;
    },
    get length() {
      return opts.getLength();
    },
    subscribers,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex + 1, state);
      tryNavigation({
        task: () => {
          opts.pushState(path, state);
          notify({ type: "PUSH" });
        },
        navigateOpts,
        type: "PUSH",
        path,
        state
      });
    },
    replace: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex, state);
      tryNavigation({
        task: () => {
          opts.replaceState(path, state);
          notify({ type: "REPLACE" });
        },
        navigateOpts,
        type: "REPLACE",
        path,
        state
      });
    },
    go: (index, navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.go(index);
          handleIndexChange({ type: "GO", index });
        },
        navigateOpts,
        type: "GO"
      });
    },
    back: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.back(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "BACK" });
        },
        navigateOpts,
        type: "BACK"
      });
    },
    forward: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.forward(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "FORWARD" });
        },
        navigateOpts,
        type: "FORWARD"
      });
    },
    canGoBack: () => location.state[stateIndexKey] !== 0,
    createHref: (str) => opts.createHref(str),
    block: (blocker) => {
      if (!opts.setBlockers) return () => {
      };
      const blockers = opts.getBlockers?.() ?? [];
      opts.setBlockers([...blockers, blocker]);
      return () => {
        const blockers2 = opts.getBlockers?.() ?? [];
        opts.setBlockers?.(blockers2.filter((b2) => b2 !== blocker));
      };
    },
    flush: () => opts.flush?.(),
    destroy: () => opts.destroy?.(),
    notify
  };
}
function assignKeyAndIndex(index, state) {
  if (!state) {
    state = {};
  }
  const key = createRandomKey();
  return {
    ...state,
    key,
    // TODO: Remove in v2 - use __TSR_key instead
    __TSR_key: key,
    [stateIndexKey]: index
  };
}
function createMemoryHistory(opts = {
  initialEntries: ["/"]
}) {
  const entries = opts.initialEntries;
  let index = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
  const states = entries.map(
    (_entry, index2) => assignKeyAndIndex(index2, void 0)
  );
  const getLocation = () => parseHref(entries[index], states[index]);
  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path, state) => {
      if (index < entries.length - 1) {
        entries.splice(index + 1);
        states.splice(index + 1);
      }
      states.push(state);
      entries.push(path);
      index = Math.max(entries.length - 1, 0);
    },
    replaceState: (path, state) => {
      states[index] = state;
      entries[index] = path;
    },
    back: () => {
      index = Math.max(index - 1, 0);
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1);
    },
    go: (n) => {
      index = Math.min(Math.max(index + n, 0), entries.length - 1);
    },
    createHref: (path) => path
  });
}
function parseHref(href, state) {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  const addedKey = createRandomKey();
  return {
    href,
    pathname: href.substring(
      0,
      hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length
    ),
    hash: hashIndex > -1 ? href.substring(hashIndex) : "",
    search: searchIndex > -1 ? href.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || { [stateIndexKey]: 0, key: addedKey, __TSR_key: addedKey }
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}
function splitSetCookieString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c2) => splitSetCookieString(c2));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}
function toHeadersInstance(init) {
  if (init instanceof Headers) {
    return new Headers(init);
  } else if (Array.isArray(init)) {
    return new Headers(init);
  } else if (typeof init === "object") {
    return new Headers(init);
  } else {
    return new Headers();
  }
}
function mergeHeaders(...headers) {
  return headers.reduce((acc, header) => {
    const headersInstance = toHeadersInstance(header);
    for (const [key, value] of headersInstance.entries()) {
      if (key === "set-cookie") {
        const splitCookies = splitSetCookieString(value);
        splitCookies.forEach((cookie) => acc.append("set-cookie", cookie));
      } else {
        acc.set(key, value);
      }
    }
    return acc;
  }, new Headers());
}
var isProduction = process.env.NODE_ENV === "production";
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  if (isProduction) {
    throw new Error(prefix);
  }
  var provided = typeof message === "function" ? message() : message;
  var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
  throw new Error(value);
}
function isNotFound(obj) {
  return !!obj?.isNotFound;
}
const rootRouteId = "__root__";
function redirect(opts) {
  opts.statusCode = opts.statusCode || opts.code || 307;
  if (!opts.reloadDocument && typeof opts.href === "string") {
    try {
      new URL(opts.href);
      opts.reloadDocument = true;
    } catch {
    }
  }
  const headers = new Headers(opts.headers);
  if (opts.href && headers.get("Location") === null) {
    headers.set("Location", opts.href);
  }
  const response = new Response(null, {
    status: opts.statusCode,
    headers
  });
  response.options = opts;
  if (opts.throw) {
    throw response;
  }
  return response;
}
function isRedirect(obj) {
  return obj instanceof Response && !!obj.options;
}
function isResolvedRedirect(obj) {
  return isRedirect(obj) && !!obj.options.href;
}
function parseRedirect(obj) {
  if (obj !== null && typeof obj === "object" && obj.isSerializedRedirect) {
    return redirect(obj);
  }
  return void 0;
}
function executeRewriteInput(rewrite, url) {
  const res = rewrite?.input?.({ url });
  if (res) {
    if (typeof res === "string") {
      return new URL(res);
    } else if (res instanceof URL) {
      return res;
    }
  }
  return url;
}
var L = ((i) => (i[i.AggregateError = 1] = "AggregateError", i[i.ArrowFunction = 2] = "ArrowFunction", i[i.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", i[i.ObjectAssign = 8] = "ObjectAssign", i[i.BigIntTypedArray = 16] = "BigIntTypedArray", i[i.RegExp = 32] = "RegExp", i))(L || {});
var N = Symbol.asyncIterator, fr = Symbol.hasInstance, I = Symbol.isConcatSpreadable, b = Symbol.iterator, Sr = Symbol.match, mr = Symbol.matchAll, pr = Symbol.replace, dr = Symbol.search, gr = Symbol.species, yr = Symbol.split, Nr = Symbol.toPrimitive, P$1 = Symbol.toStringTag, br = Symbol.unscopables;
var qr = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, Ce = { [N]: 0, [fr]: 1, [I]: 2, [b]: 3, [Sr]: 4, [mr]: 5, [pr]: 6, [dr]: 7, [gr]: 8, [yr]: 9, [Nr]: 10, [P$1]: 11, [br]: 12 }, Xr = { 0: N, 1: fr, 2: I, 3: b, 4: Sr, 5: mr, 6: pr, 7: dr, 8: gr, 9: yr, 10: Nr, 11: P$1, 12: br }, Qr = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, o = void 0, et = { 2: true, 3: false, 1: o, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN };
var ve = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, rt = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function c(e, r, t, n, a, s, i, u2, l, g, S, d) {
  return { t: e, i: r, s: t, c: n, m: a, p: s, e: i, a: u2, f: l, b: g, o: S, l: d };
}
function D(e) {
  return c(2, o, e, o, o, o, o, o, o, o, o, o);
}
var Z = D(2), $ = D(3), Ae = D(1), Re = D(0), tt = D(4), nt = D(5), ot = D(6), at = D(7);
function sn(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return o;
  }
}
function y(e) {
  let r = "", t = 0, n;
  for (let a = 0, s = e.length; a < s; a++) n = sn(e[a]), n && (r += e.slice(t, a) + n, t = a + 1);
  return t === 0 ? r = e : r += e.slice(t), r;
}
function un(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function F(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, un);
}
var U = "__SEROVAL_REFS__", ce = "$R", Ee = `self.${ce}`;
function ln(e) {
  return `(${Ee}=${Ee}||{})["${y(e)}"]=[]`;
}
var Cr = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Map();
function vr(e) {
  return Cr.has(e);
}
function fn(e) {
  return j.has(e);
}
function st(e) {
  if (vr(e)) return Cr.get(e);
  throw new Ie(e);
}
function it(e) {
  if (fn(e)) return j.get(e);
  throw new Pe(e);
}
typeof globalThis != "undefined" ? Object.defineProperty(globalThis, U, { value: j, configurable: true, writable: false, enumerable: false }) : typeof window != "undefined" ? Object.defineProperty(window, U, { value: j, configurable: true, writable: false, enumerable: false }) : typeof self != "undefined" ? Object.defineProperty(self, U, { value: j, configurable: true, writable: false, enumerable: false }) : typeof global != "undefined" && Object.defineProperty(global, U, { value: j, configurable: true, writable: false, enumerable: false });
function xe(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function Sn(e) {
  let r = ve[xe(e)];
  return e.name !== r ? { name: e.name } : e.constructor.name !== r ? { name: e.constructor.name } : {};
}
function q(e, r) {
  let t = Sn(e), n = Object.getOwnPropertyNames(e);
  for (let a = 0, s = n.length, i; a < s; a++) i = n[a], i !== "name" && i !== "message" && (i === "stack" ? r & 4 && (t = t || {}, t[i] = e[i]) : (t = t || {}, t[i] = e[i]));
  return t;
}
function Te(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function Oe(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return nt;
    case Number.NEGATIVE_INFINITY:
      return ot;
  }
  return e !== e ? at : Object.is(e, -0) ? tt : c(0, o, e, o, o, o, o, o, o, o, o, o);
}
function X(e) {
  return c(1, o, y(e), o, o, o, o, o, o, o, o, o);
}
function we(e) {
  return c(3, o, "" + e, o, o, o, o, o, o, o, o, o);
}
function lt(e) {
  return c(4, e, o, o, o, o, o, o, o, o, o, o);
}
function he(e, r) {
  let t = r.valueOf();
  return c(5, e, t !== t ? "" : r.toISOString(), o, o, o, o, o, o, o, o, o);
}
function ze(e, r) {
  return c(6, e, o, y(r.source), r.flags, o, o, o, o, o, o, o);
}
function ct(e, r) {
  return c(17, e, Ce[r], o, o, o, o, o, o, o, o, o);
}
function ft(e, r) {
  return c(18, e, y(st(r)), o, o, o, o, o, o, o, o, o);
}
function fe(e, r, t) {
  return c(25, e, t, y(r), o, o, o, o, o, o, o, o);
}
function _e(e, r, t) {
  return c(9, e, o, o, o, o, o, t, o, o, Te(r), o);
}
function ke(e, r) {
  return c(21, e, o, o, o, o, o, o, r, o, o, o);
}
function De(e, r, t) {
  return c(15, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.length);
}
function Fe(e, r, t) {
  return c(16, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Be(e, r, t) {
  return c(20, e, o, o, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Me(e, r, t) {
  return c(13, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Ve(e, r, t) {
  return c(14, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Le(e, r) {
  return c(7, e, o, o, o, o, o, r, o, o, o, o);
}
function Ue(e, r) {
  return c(28, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function je(e, r) {
  return c(30, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function Ye(e, r, t) {
  return c(31, e, o, o, o, o, o, t, r, o, o, o);
}
function We(e, r) {
  return c(32, e, o, o, o, o, o, o, r, o, o, o);
}
function Ge(e, r) {
  return c(33, e, o, o, o, o, o, o, r, o, o, o);
}
function Ke(e, r) {
  return c(34, e, o, o, o, o, o, o, r, o, o, o);
}
var mn = { parsing: 1, serialization: 2, deserialization: 3 };
function pn(e) {
  return `Seroval Error (step: ${mn[e]})`;
}
var dn = (e, r) => pn(e), Se = class extends Error {
  constructor(t, n) {
    super(dn(t));
    this.cause = n;
  }
}, z = class extends Se {
  constructor(r) {
    super("parsing", r);
  }
}, He = class extends Se {
  constructor(r) {
    super("deserialization", r);
  }
};
function _(e) {
  return `Seroval Error (specific: ${e})`;
}
var x = class extends Error {
  constructor(t) {
    super(_(1));
    this.value = t;
  }
}, O = class extends Error {
  constructor(r) {
    super(_(2));
  }
}, Q = class extends Error {
  constructor(r) {
    super(_(3));
  }
}, B = class extends Error {
  constructor(r) {
    super(_(4));
  }
}, Ie = class extends Error {
  constructor(t) {
    super(_(5));
    this.value = t;
  }
}, Pe = class extends Error {
  constructor(r) {
    super(_(6));
  }
}, Je = class extends Error {
  constructor(r) {
    super(_(7));
  }
}, w$1 = class w extends Error {
  constructor(r) {
    super(_(8));
  }
}, ee$1 = class ee extends Error {
  constructor(r) {
    super(_(9));
  }
};
var Y = class {
  constructor(r, t) {
    this.value = r;
    this.replacement = t;
  }
};
var re$1 = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((r, t) => {
    e.s = r, e.f = t;
  }), e;
}, gn = (e, r) => {
  e.s(r), e.p.s = 1, e.p.v = r;
}, yn = (e, r) => {
  e.f(r), e.p.s = 2, e.p.v = r;
}, mt = re$1.toString(), pt = gn.toString(), dt = yn.toString(), Rr = () => {
  let e = [], r = [], t = true, n = false, a = 0, s = (l, g, S) => {
    for (S = 0; S < a; S++) r[S] && r[S][g](l);
  }, i = (l, g, S, d) => {
    for (g = 0, S = e.length; g < S; g++) d = e[g], !t && g === S - 1 ? l[n ? "return" : "throw"](d) : l.next(d);
  }, u2 = (l, g) => (t && (g = a++, r[g] = l), i(l), () => {
    t && (r[g] = r[a], r[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (l) => u2(l), next: (l) => {
    t && (e.push(l), s(l, "next"));
  }, throw: (l) => {
    t && (e.push(l), s(l, "throw"), t = false, n = false, r.length = 0);
  }, return: (l) => {
    t && (e.push(l), s(l, "return"), t = false, n = true, r.length = 0);
  } };
}, gt = Rr.toString(), Er = (e) => (r) => () => {
  let t = 0, n = { [e]: () => n, next: () => {
    if (t > r.d) return { done: true, value: void 0 };
    let a = t++, s = r.v[a];
    if (a === r.t) throw s;
    return { done: a === r.d, value: s };
  } };
  return n;
}, yt = Er.toString(), Ir = (e, r) => (t) => () => {
  let n = 0, a = -1, s = false, i = [], u2 = [], l = (S = 0, d = u2.length) => {
    for (; S < d; S++) u2[S].s({ done: true, value: void 0 });
  };
  t.on({ next: (S) => {
    let d = u2.shift();
    d && d.s({ done: false, value: S }), i.push(S);
  }, throw: (S) => {
    let d = u2.shift();
    d && d.f(S), l(), a = i.length, s = true, i.push(S);
  }, return: (S) => {
    let d = u2.shift();
    d && d.s({ done: true, value: S }), l(), a = i.length, i.push(S);
  } });
  let g = { [e]: () => g, next: () => {
    if (a === -1) {
      let H = n++;
      if (H >= i.length) {
        let $r = r();
        return u2.push($r), $r.p;
      }
      return { done: false, value: i[H] };
    }
    if (n > a) return { done: true, value: void 0 };
    let S = n++, d = i[S];
    if (S !== a) return { done: false, value: d };
    if (s) throw d;
    return { done: true, value: d };
  } };
  return g;
}, Nt = Ir.toString(), Pr = (e) => {
  let r = atob(e), t = r.length, n = new Uint8Array(t);
  for (let a = 0; a < t; a++) n[a] = r.charCodeAt(a);
  return n.buffer;
}, bt = Pr.toString();
var Ct = {}, vt = {};
var At = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Rt = { 0: "[]", 1: mt, 2: pt, 3: dt, 4: gt, 5: bt };
function M(e) {
  return "__SEROVAL_STREAM__" in e;
}
function te() {
  return Rr();
}
function Ze(e) {
  let r = te(), t = e[N]();
  async function n() {
    try {
      let a = await t.next();
      a.done ? r.return(a.value) : (r.next(a.value), await n());
    } catch (a) {
      r.throw(a);
    }
  }
  return n().catch(() => {
  }), r;
}
var Nn = Ir(N, re$1);
function Et(e) {
  return Nn(e);
}
function $e(e) {
  let r = [], t = -1, n = -1, a = e[b]();
  for (; ; ) try {
    let s = a.next();
    if (r.push(s.value), s.done) {
      n = r.length - 1;
      break;
    }
  } catch (s) {
    t = r.length, r.push(s);
  }
  return { v: r, t, d: n };
}
var bn = Er(b);
function It(e) {
  return bn(e);
}
async function xr(e) {
  try {
    return [1, await e];
  } catch (r) {
    return [0, r];
  }
}
function pe(e, r) {
  return { plugins: r.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (r.disabledFeatures || 0), refs: r.refs || /* @__PURE__ */ new Map(), depthLimit: r.depthLimit || 1e3 };
}
function de(e, r) {
  e.marked.add(r);
}
function Tr(e, r) {
  let t = e.refs.size;
  return e.refs.set(r, t), t;
}
function qe(e, r) {
  let t = e.refs.get(r);
  return t != null ? (de(e, t), { type: 1, value: lt(t) }) : { type: 0, value: Tr(e, r) };
}
function W(e, r) {
  let t = qe(e, r);
  return t.type === 1 ? t : vr(r) ? { type: 2, value: ft(t.value, r) } : t;
}
function E(e, r) {
  let t = W(e, r);
  if (t.type !== 0) return t.value;
  if (r in Ce) return ct(t.value, r);
  throw new x(r);
}
function k(e, r) {
  let t = qe(e, At[r]);
  return t.type === 1 ? t.value : c(26, t.value, r, o, o, o, o, o, o, o, o, o);
}
function Xe(e) {
  let r = qe(e, Ct);
  return r.type === 1 ? r.value : c(27, r.value, o, o, o, o, o, o, E(e, b), o, o, o);
}
function Qe(e) {
  let r = qe(e, vt);
  return r.type === 1 ? r.value : c(29, r.value, o, o, o, o, o, [k(e, 1), E(e, N)], o, o, o, o);
}
function er(e, r, t, n) {
  return c(t ? 11 : 10, e, o, o, o, n, o, o, o, o, Te(r), o);
}
function rr(e, r, t, n) {
  return c(8, r, o, o, o, o, { k: t, v: n }, o, k(e, 0), o, o, o);
}
function xt(e, r, t) {
  return c(22, r, t, o, o, o, o, o, k(e, 1), o, o, o);
}
function tr(e, r, t) {
  let n = new Uint8Array(t), a = "";
  for (let s = 0, i = n.length; s < i; s++) a += String.fromCharCode(n[s]);
  return c(19, r, y(btoa(a)), o, o, o, o, o, k(e, 5), o, o, o);
}
function ne(e, r) {
  return { base: pe(e, r), child: void 0 };
}
var wr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return C(this._p, this.depth, r);
  }
};
async function vn(e, r, t) {
  let n = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n[a] = await C(e, r, t[a]) : n[a] = 0;
  return n;
}
async function An(e, r, t, n) {
  return _e(t, n, await vn(e, r, n));
}
async function hr(e, r, t) {
  let n = Object.entries(t), a = [], s = [];
  for (let i = 0, u2 = n.length; i < u2; i++) a.push(y(n[i][0])), s.push(await C(e, r, n[i][1]));
  return b in t && (a.push(E(e.base, b)), s.push(Ue(Xe(e.base), await C(e, r, $e(t))))), N in t && (a.push(E(e.base, N)), s.push(je(Qe(e.base), await C(e, r, Ze(t))))), P$1 in t && (a.push(E(e.base, P$1)), s.push(X(t[P$1]))), I in t && (a.push(E(e.base, I)), s.push(t[I] ? Z : $)), { k: a, v: s };
}
async function Or(e, r, t, n, a) {
  return er(t, n, a, await hr(e, r, n));
}
async function Rn(e, r, t, n) {
  return ke(t, await C(e, r, n.valueOf()));
}
async function En(e, r, t, n) {
  return De(t, n, await C(e, r, n.buffer));
}
async function In(e, r, t, n) {
  return Fe(t, n, await C(e, r, n.buffer));
}
async function Pn(e, r, t, n) {
  return Be(t, n, await C(e, r, n.buffer));
}
async function Tt(e, r, t, n) {
  let a = q(n, e.base.features);
  return Me(t, n, a ? await hr(e, r, a) : o);
}
async function xn(e, r, t, n) {
  let a = q(n, e.base.features);
  return Ve(t, n, a ? await hr(e, r, a) : o);
}
async function Tn(e, r, t, n) {
  let a = [], s = [];
  for (let [i, u2] of n.entries()) a.push(await C(e, r, i)), s.push(await C(e, r, u2));
  return rr(e.base, t, a, s);
}
async function On(e, r, t, n) {
  let a = [];
  for (let s of n.keys()) a.push(await C(e, r, s));
  return Le(t, a);
}
async function Ot(e, r, t, n) {
  let a = e.base.plugins;
  if (a) for (let s = 0, i = a.length; s < i; s++) {
    let u2 = a[s];
    if (u2.parse.async && u2.test(n)) return fe(t, u2.tag, await u2.parse.async(n, new wr(e, r), { id: t }));
  }
  return o;
}
async function wn(e, r, t, n) {
  let [a, s] = await xr(n);
  return c(12, t, a, o, o, o, o, o, await C(e, r, s), o, o, o);
}
function hn(e, r, t, n, a) {
  let s = [], i = t.on({ next: (u2) => {
    de(this.base, r), C(this, e, u2).then((l) => {
      s.push(We(r, l));
    }, (l) => {
      a(l), i();
    });
  }, throw: (u2) => {
    de(this.base, r), C(this, e, u2).then((l) => {
      s.push(Ge(r, l)), n(s), i();
    }, (l) => {
      a(l), i();
    });
  }, return: (u2) => {
    de(this.base, r), C(this, e, u2).then((l) => {
      s.push(Ke(r, l)), n(s), i();
    }, (l) => {
      a(l), i();
    });
  } });
}
async function zn(e, r, t, n) {
  return Ye(t, k(e.base, 4), await new Promise(hn.bind(e, r, t, n)));
}
async function _n(e, r, t, n) {
  if (Array.isArray(n)) return An(e, r, t, n);
  if (M(n)) return zn(e, r, t, n);
  let a = n.constructor;
  if (a === Y) return C(e, r, n.replacement);
  let s = await Ot(e, r, t, n);
  if (s) return s;
  switch (a) {
    case Object:
      return Or(e, r, t, n, false);
    case o:
      return Or(e, r, t, n, true);
    case Date:
      return he(t, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return Tt(e, r, t, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return Rn(e, r, t, n);
    case ArrayBuffer:
      return tr(e.base, t, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return En(e, r, t, n);
    case DataView:
      return Pn(e, r, t, n);
    case Map:
      return Tn(e, r, t, n);
    case Set:
      return On(e, r, t, n);
  }
  if (a === Promise || n instanceof Promise) return wn(e, r, t, n);
  let i = e.base.features;
  if (i & 32 && a === RegExp) return ze(t, n);
  if (i & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return In(e, r, t, n);
  }
  if (i & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n instanceof AggregateError)) return xn(e, r, t, n);
  if (n instanceof Error) return Tt(e, r, t, n);
  if (b in n || N in n) return Or(e, r, t, n, !!a);
  throw new x(n);
}
async function kn(e, r, t) {
  let n = W(e.base, t);
  if (n.type !== 0) return n.value;
  let a = await Ot(e, r, n.value, t);
  if (a) return a;
  throw new x(t);
}
async function C(e, r, t) {
  switch (typeof t) {
    case "boolean":
      return t ? Z : $;
    case "undefined":
      return Ae;
    case "string":
      return X(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n = W(e.base, t);
        return n.type === 0 ? await _n(e, r + 1, n.value, t) : n.value;
      }
      return Re;
    }
    case "symbol":
      return E(e.base, t);
    case "function":
      return kn(e, r, t);
    default:
      throw new x(t);
  }
}
async function oe(e, r) {
  try {
    return await C(e, 0, r);
  } catch (t) {
    throw t instanceof z ? t : new z(t);
  }
}
var ae = ((t) => (t[t.Vanilla = 1] = "Vanilla", t[t.Cross = 2] = "Cross", t))(ae || {});
function Js(e) {
  return e;
}
function wt(e, r) {
  for (let t = 0, n = r.length; t < n; t++) {
    let a = r[t];
    e.has(a) || (e.add(a), a.extends && wt(e, a.extends));
  }
}
function A(e) {
  if (e) {
    let r = /* @__PURE__ */ new Set();
    return wt(r, e), [...r];
  }
}
function ht(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new Je(e);
  }
}
var Dn = 1e6, Fn = 1e4, Bn = 2e4;
function _t(e, r) {
  switch (r) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var Mn = 1e3;
function kt(e, r) {
  var t;
  return { mode: e, plugins: r.plugins, refs: r.refs || /* @__PURE__ */ new Map(), features: (t = r.features) != null ? t : 63 ^ (r.disabledFeatures || 0), depthLimit: r.depthLimit || Mn };
}
function Dt(e) {
  return { mode: 1, base: kt(1, e), child: o, state: { marked: new Set(e.markedRefs) } };
}
var zr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  deserialize(r) {
    return p$1(this._p, this.depth, r);
  }
};
function Bt(e, r) {
  if (r < 0 || !Number.isFinite(r) || !Number.isInteger(r)) throw new w$1({ t: 4, i: r });
  if (e.refs.has(r)) throw new Error("Conflicted ref id: " + r);
}
function Vn(e, r, t) {
  return Bt(e.base, r), e.state.marked.has(r) && e.base.refs.set(r, t), t;
}
function Ln(e, r, t) {
  return Bt(e.base, r), e.base.refs.set(r, t), t;
}
function v(e, r, t) {
  return e.mode === 1 ? Vn(e, r, t) : Ln(e, r, t);
}
function _r(e, r, t) {
  if (Object.hasOwn(r, t)) return r[t];
  throw new w$1(e);
}
function Un(e, r) {
  return v(e, r.i, it(F(r.s)));
}
function jn(e, r, t) {
  let n = t.a, a = n.length, s = v(e, t.i, new Array(a));
  for (let i = 0, u2; i < a; i++) u2 = n[i], u2 && (s[i] = p$1(e, r, u2));
  return _t(s, t.o), s;
}
function Yn(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function Wn(e) {
  switch (e) {
    case N:
    case I:
    case P$1:
    case b:
      return true;
    default:
      return false;
  }
}
function zt(e, r, t) {
  Yn(r) ? e[r] = t : Object.defineProperty(e, r, { value: t, configurable: true, enumerable: true, writable: true });
}
function Gn(e, r, t, n, a) {
  if (typeof n == "string") zt(t, n, p$1(e, r, a));
  else {
    let s = p$1(e, r, n);
    switch (typeof s) {
      case "string":
        zt(t, s, p$1(e, r, a));
        break;
      case "symbol":
        Wn(s) && (t[s] = p$1(e, r, a));
        break;
      default:
        throw new w$1(n);
    }
  }
}
function Mt(e, r, t, n) {
  let a = t.k;
  if (a.length > 0) for (let i = 0, u2 = t.v, l = a.length; i < l; i++) Gn(e, r, n, a[i], u2[i]);
  return n;
}
function Kn(e, r, t) {
  let n = v(e, t.i, t.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return Mt(e, r, t.p, n), _t(n, t.o), n;
}
function Hn(e, r) {
  return v(e, r.i, new Date(r.s));
}
function Jn(e, r) {
  if (e.base.features & 32) {
    let t = F(r.c);
    if (t.length > Bn) throw new w$1(r);
    return v(e, r.i, new RegExp(t, r.m));
  }
  throw new O(r);
}
function Zn(e, r, t) {
  let n = v(e, t.i, /* @__PURE__ */ new Set());
  for (let a = 0, s = t.a, i = s.length; a < i; a++) n.add(p$1(e, r, s[a]));
  return n;
}
function $n(e, r, t) {
  let n = v(e, t.i, /* @__PURE__ */ new Map());
  for (let a = 0, s = t.e.k, i = t.e.v, u2 = s.length; a < u2; a++) n.set(p$1(e, r, s[a]), p$1(e, r, i[a]));
  return n;
}
function qn(e, r) {
  if (r.s.length > Dn) throw new w$1(r);
  return v(e, r.i, Pr(F(r.s)));
}
function Xn(e, r, t) {
  var u2;
  let n = ht(t.c), a = p$1(e, r, t.f), s = (u2 = t.b) != null ? u2 : 0;
  if (s < 0 || s > a.byteLength) throw new w$1(t);
  return v(e, t.i, new n(a, s, t.l));
}
function Qn(e, r, t) {
  var i;
  let n = p$1(e, r, t.f), a = (i = t.b) != null ? i : 0;
  if (a < 0 || a > n.byteLength) throw new w$1(t);
  return v(e, t.i, new DataView(n, a, t.l));
}
function Vt(e, r, t, n) {
  if (t.p) {
    let a = Mt(e, r, t.p, {});
    Object.defineProperties(n, Object.getOwnPropertyDescriptors(a));
  }
  return n;
}
function eo(e, r, t) {
  let n = v(e, t.i, new AggregateError([], F(t.m)));
  return Vt(e, r, t, n);
}
function ro(e, r, t) {
  let n = _r(t, rt, t.s), a = v(e, t.i, new n(F(t.m)));
  return Vt(e, r, t, a);
}
function to(e, r, t) {
  let n = re$1(), a = v(e, t.i, n.p), s = p$1(e, r, t.f);
  return t.s ? n.s(s) : n.f(s), a;
}
function no(e, r, t) {
  return v(e, t.i, Object(p$1(e, r, t.f)));
}
function oo(e, r, t) {
  let n = e.base.plugins;
  if (n) {
    let a = F(t.c);
    for (let s = 0, i = n.length; s < i; s++) {
      let u2 = n[s];
      if (u2.tag === a) return v(e, t.i, u2.deserialize(t.s, new zr(e, r), { id: t.i }));
    }
  }
  throw new Q(t.c);
}
function ao(e, r) {
  return v(e, r.i, v(e, r.s, re$1()).p);
}
function so(e, r, t) {
  let n = e.base.refs.get(t.i);
  if (n) return n.s(p$1(e, r, t.a[1])), o;
  throw new B("Promise");
}
function io(e, r, t) {
  let n = e.base.refs.get(t.i);
  if (n) return n.f(p$1(e, r, t.a[1])), o;
  throw new B("Promise");
}
function uo(e, r, t) {
  p$1(e, r, t.a[0]);
  let n = p$1(e, r, t.a[1]);
  return It(n);
}
function lo(e, r, t) {
  p$1(e, r, t.a[0]);
  let n = p$1(e, r, t.a[1]);
  return Et(n);
}
function co(e, r, t) {
  let n = v(e, t.i, te()), a = t.a, s = a.length;
  if (s) for (let i = 0; i < s; i++) p$1(e, r, a[i]);
  return n;
}
function fo(e, r, t) {
  let n = e.base.refs.get(t.i);
  if (n && M(n)) return n.next(p$1(e, r, t.f)), o;
  throw new B("Stream");
}
function So(e, r, t) {
  let n = e.base.refs.get(t.i);
  if (n && M(n)) return n.throw(p$1(e, r, t.f)), o;
  throw new B("Stream");
}
function mo(e, r, t) {
  let n = e.base.refs.get(t.i);
  if (n && M(n)) return n.return(p$1(e, r, t.f)), o;
  throw new B("Stream");
}
function po(e, r, t) {
  return p$1(e, r, t.f), o;
}
function go(e, r, t) {
  return p$1(e, r, t.a[1]), o;
}
function p$1(e, r, t) {
  if (r > e.base.depthLimit) throw new ee$1(e.base.depthLimit);
  switch (r += 1, t.t) {
    case 2:
      return _r(t, et, t.s);
    case 0:
      return Number(t.s);
    case 1:
      return F(String(t.s));
    case 3:
      if (String(t.s).length > Fn) throw new w$1(t);
      return BigInt(t.s);
    case 4:
      return e.base.refs.get(t.i);
    case 18:
      return Un(e, t);
    case 9:
      return jn(e, r, t);
    case 10:
    case 11:
      return Kn(e, r, t);
    case 5:
      return Hn(e, t);
    case 6:
      return Jn(e, t);
    case 7:
      return Zn(e, r, t);
    case 8:
      return $n(e, r, t);
    case 19:
      return qn(e, t);
    case 16:
    case 15:
      return Xn(e, r, t);
    case 20:
      return Qn(e, r, t);
    case 14:
      return eo(e, r, t);
    case 13:
      return ro(e, r, t);
    case 12:
      return to(e, r, t);
    case 17:
      return _r(t, Xr, t.s);
    case 21:
      return no(e, r, t);
    case 25:
      return oo(e, r, t);
    case 22:
      return ao(e, t);
    case 23:
      return so(e, r, t);
    case 24:
      return io(e, r, t);
    case 28:
      return uo(e, r, t);
    case 30:
      return lo(e, r, t);
    case 31:
      return co(e, r, t);
    case 32:
      return fo(e, r, t);
    case 33:
      return So(e, r, t);
    case 34:
      return mo(e, r, t);
    case 27:
      return po(e, r, t);
    case 29:
      return go(e, r, t);
    default:
      throw new O(t);
  }
}
function nr(e, r) {
  try {
    return p$1(e, 0, r);
  } catch (t) {
    throw new He(t);
  }
}
var yo = () => T, No = yo.toString(), Lt = /=>/.test(No);
function or(e, r) {
  return Lt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (r.startsWith("{") ? "(" + r + ")" : r) : "function(" + e.join(",") + "){return " + r + "}";
}
function Ut(e, r) {
  return Lt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + r + "}" : "function(" + e.join(",") + "){" + r + "}";
}
var Wt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", jt = Wt.length, Gt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Yt = Gt.length;
function kr(e) {
  let r = e % jt, t = Wt[r];
  for (e = (e - r) / jt; e > 0; ) r = e % Yt, t += Gt[r], e = (e - r) / Yt;
  return t;
}
var bo = /^[$A-Z_][0-9A-Z_$]*$/i;
function Dr(e) {
  let r = e[0];
  return (r === "$" || r === "_" || r >= "A" && r <= "Z" || r >= "a" && r <= "z") && bo.test(e);
}
function ye(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function Co(e) {
  let r = [], t = e[0];
  for (let n = 1, a = e.length, s, i = t; n < a; n++) s = e[n], s.t === 0 && s.v === i.v ? t = { t: 0, s: s.s, k: o, v: ye(t) } : s.t === 2 && s.s === i.s ? t = { t: 2, s: ye(t), k: s.k, v: s.v } : s.t === 1 && s.s === i.s ? t = { t: 1, s: ye(t), k: o, v: s.v } : s.t === 3 && s.s === i.s ? t = { t: 3, s: ye(t), k: s.k, v: o } : (r.push(t), t = s), i = s;
  return r.push(t), r;
}
function qt(e) {
  if (e.length) {
    let r = "", t = Co(e);
    for (let n = 0, a = t.length; n < a; n++) r += ye(t[n]) + ",";
    return r;
  }
  return o;
}
var vo = "Object.create(null)", Ao = "new Set", Ro = "new Map", Eo = "Promise.resolve", Io = "Promise.reject", Po = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: o };
function Xt(e, r) {
  return { mode: e, plugins: r.plugins, features: r.features, marked: new Set(r.markedRefs), stack: [], flags: [], assignments: [] };
}
function sr(e) {
  return { mode: 2, base: Xt(2, e), state: e, child: o };
}
var Fr = class {
  constructor(r) {
    this._p = r;
  }
  serialize(r) {
    return f(this._p, r);
  }
};
function To(e, r) {
  let t = e.valid.get(r);
  t == null && (t = e.valid.size, e.valid.set(r, t));
  let n = e.vars[t];
  return n == null && (n = kr(t), e.vars[t] = n), n;
}
function Oo(e) {
  return ce + "[" + e + "]";
}
function m(e, r) {
  return e.mode === 1 ? To(e.state, r) : Oo(r);
}
function h(e, r) {
  e.marked.add(r);
}
function Br(e, r) {
  return e.marked.has(r);
}
function Vr(e, r, t) {
  r !== 0 && (h(e.base, t), e.base.flags.push({ type: r, value: m(e, t) }));
}
function wo(e) {
  let r = "";
  for (let t = 0, n = e.flags, a = n.length; t < a; t++) {
    let s = n[t];
    r += Po[s.type] + "(" + s.value + "),";
  }
  return r;
}
function Qt(e) {
  let r = qt(e.assignments), t = wo(e);
  return r ? t ? r + t : r : t;
}
function en(e, r, t) {
  e.assignments.push({ t: 0, s: r, k: o, v: t });
}
function ho(e, r, t) {
  e.base.assignments.push({ t: 1, s: m(e, r), k: o, v: t });
}
function ge(e, r, t, n) {
  e.base.assignments.push({ t: 2, s: m(e, r), k: t, v: n });
}
function Kt(e, r, t) {
  e.base.assignments.push({ t: 3, s: m(e, r), k: t, v: o });
}
function Ne(e, r, t, n) {
  en(e.base, m(e, r) + "[" + t + "]", n);
}
function Mr(e, r, t, n) {
  en(e.base, m(e, r) + "." + t, n);
}
function V(e, r) {
  return r.t === 4 && e.stack.includes(r.i);
}
function se(e, r, t) {
  return e.mode === 1 && !Br(e.base, r) ? t : m(e, r) + "=" + t;
}
function zo(e) {
  return U + '.get("' + e.s + '")';
}
function Ht(e, r, t, n) {
  return t ? V(e.base, t) ? (h(e.base, r), Ne(e, r, n, m(e, t.i)), "") : f(e, t) : "";
}
function _o(e, r) {
  let t = r.i, n = r.a, a = n.length;
  if (a > 0) {
    e.base.stack.push(t);
    let s = Ht(e, t, n[0], 0), i = s === "";
    for (let u2 = 1, l; u2 < a; u2++) l = Ht(e, t, n[u2], u2), s += "," + l, i = l === "";
    return e.base.stack.pop(), Vr(e, r.o, r.i), "[" + s + (i ? ",]" : "]");
  }
  return "[]";
}
function Jt(e, r, t, n) {
  if (typeof t == "string") {
    let a = Number(t), s = a >= 0 && a.toString() === t || Dr(t);
    if (V(e.base, n)) {
      let i = m(e, n.i);
      return h(e.base, r.i), s && a !== a ? Mr(e, r.i, t, i) : Ne(e, r.i, s ? t : '"' + t + '"', i), "";
    }
    return (s ? t : '"' + t + '"') + ":" + f(e, n);
  }
  return "[" + f(e, t) + "]:" + f(e, n);
}
function rn(e, r, t) {
  let n = t.k, a = n.length;
  if (a > 0) {
    let s = t.v;
    e.base.stack.push(r.i);
    let i = Jt(e, r, n[0], s[0]);
    for (let u2 = 1, l = i; u2 < a; u2++) l = Jt(e, r, n[u2], s[u2]), i += (l && i && ",") + l;
    return e.base.stack.pop(), "{" + i + "}";
  }
  return "{}";
}
function ko(e, r) {
  return Vr(e, r.o, r.i), rn(e, r, r.p);
}
function Do(e, r, t, n) {
  let a = rn(e, r, t);
  return a !== "{}" ? "Object.assign(" + n + "," + a + ")" : n;
}
function Fo(e, r, t, n, a) {
  let s = e.base, i = f(e, a), u2 = Number(n), l = u2 >= 0 && u2.toString() === n || Dr(n);
  if (V(s, a)) l && u2 !== u2 ? Mr(e, r.i, n, i) : Ne(e, r.i, l ? n : '"' + n + '"', i);
  else {
    let g = s.assignments;
    s.assignments = t, l && u2 !== u2 ? Mr(e, r.i, n, i) : Ne(e, r.i, l ? n : '"' + n + '"', i), s.assignments = g;
  }
}
function Bo(e, r, t, n, a) {
  if (typeof n == "string") Fo(e, r, t, n, a);
  else {
    let s = e.base, i = s.stack;
    s.stack = [];
    let u2 = f(e, a);
    s.stack = i;
    let l = s.assignments;
    s.assignments = t, Ne(e, r.i, f(e, n), u2), s.assignments = l;
  }
}
function Mo(e, r, t) {
  let n = t.k, a = n.length;
  if (a > 0) {
    let s = [], i = t.v;
    e.base.stack.push(r.i);
    for (let u2 = 0; u2 < a; u2++) Bo(e, r, s, n[u2], i[u2]);
    return e.base.stack.pop(), qt(s);
  }
  return o;
}
function Lr(e, r, t) {
  if (r.p) {
    let n = e.base;
    if (n.features & 8) t = Do(e, r, r.p, t);
    else {
      h(n, r.i);
      let a = Mo(e, r, r.p);
      if (a) return "(" + se(e, r.i, t) + "," + a + m(e, r.i) + ")";
    }
  }
  return t;
}
function Vo(e, r) {
  return Vr(e, r.o, r.i), Lr(e, r, vo);
}
function Lo(e) {
  return 'new Date("' + e.s + '")';
}
function Uo(e, r) {
  if (e.base.features & 32) return "/" + r.c + "/" + r.m;
  throw new O(r);
}
function Zt(e, r, t) {
  let n = e.base;
  return V(n, t) ? (h(n, r), ho(e, r, m(e, t.i)), "") : f(e, t);
}
function jo(e, r) {
  let t = Ao, n = r.a, a = n.length, s = r.i;
  if (a > 0) {
    e.base.stack.push(s);
    let i = Zt(e, s, n[0]);
    for (let u2 = 1, l = i; u2 < a; u2++) l = Zt(e, s, n[u2]), i += (l && i && ",") + l;
    e.base.stack.pop(), i && (t += "([" + i + "])");
  }
  return t;
}
function $t(e, r, t, n, a) {
  let s = e.base;
  if (V(s, t)) {
    let i = m(e, t.i);
    if (h(s, r), V(s, n)) {
      let l = m(e, n.i);
      return ge(e, r, i, l), "";
    }
    if (n.t !== 4 && n.i != null && Br(s, n.i)) {
      let l = "(" + f(e, n) + ",[" + a + "," + a + "])";
      return ge(e, r, i, m(e, n.i)), Kt(e, r, a), l;
    }
    let u2 = s.stack;
    return s.stack = [], ge(e, r, i, f(e, n)), s.stack = u2, "";
  }
  if (V(s, n)) {
    let i = m(e, n.i);
    if (h(s, r), t.t !== 4 && t.i != null && Br(s, t.i)) {
      let l = "(" + f(e, t) + ",[" + a + "," + a + "])";
      return ge(e, r, m(e, t.i), i), Kt(e, r, a), l;
    }
    let u2 = s.stack;
    return s.stack = [], ge(e, r, f(e, t), i), s.stack = u2, "";
  }
  return "[" + f(e, t) + "," + f(e, n) + "]";
}
function Yo(e, r) {
  let t = Ro, n = r.e.k, a = n.length, s = r.i, i = r.f, u2 = m(e, i.i), l = e.base;
  if (a > 0) {
    let g = r.e.v;
    l.stack.push(s);
    let S = $t(e, s, n[0], g[0], u2);
    for (let d = 1, H = S; d < a; d++) H = $t(e, s, n[d], g[d], u2), S += (H && S && ",") + H;
    l.stack.pop(), S && (t += "([" + S + "])");
  }
  return i.t === 26 && (h(l, i.i), t = "(" + f(e, i) + "," + t + ")"), t;
}
function Wo(e, r) {
  return G(e, r.f) + '("' + r.s + '")';
}
function Go(e, r) {
  return "new " + r.c + "(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function Ko(e, r) {
  return "new DataView(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function Ho(e, r) {
  let t = r.i;
  e.base.stack.push(t);
  let n = Lr(e, r, 'new AggregateError([],"' + r.m + '")');
  return e.base.stack.pop(), n;
}
function Jo(e, r) {
  return Lr(e, r, "new " + ve[r.s] + '("' + r.m + '")');
}
function Zo(e, r) {
  let t, n = r.f, a = r.i, s = r.s ? Eo : Io, i = e.base;
  if (V(i, n)) {
    let u2 = m(e, n.i);
    t = s + (r.s ? "().then(" + or([], u2) + ")" : "().catch(" + Ut([], "throw " + u2) + ")");
  } else {
    i.stack.push(a);
    let u2 = f(e, n);
    i.stack.pop(), t = s + "(" + u2 + ")";
  }
  return t;
}
function $o(e, r) {
  return "Object(" + f(e, r.f) + ")";
}
function G(e, r) {
  let t = f(e, r);
  return r.t === 4 ? t : "(" + t + ")";
}
function qo(e, r) {
  if (e.mode === 1) throw new O(r);
  return "(" + se(e, r.s, G(e, r.f) + "()") + ").p";
}
function Xo(e, r) {
  if (e.mode === 1) throw new O(r);
  return G(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function Qo(e, r) {
  if (e.mode === 1) throw new O(r);
  return G(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function ea(e, r) {
  let t = e.base.plugins;
  if (t) for (let n = 0, a = t.length; n < a; n++) {
    let s = t[n];
    if (s.tag === r.c) return e.child == null && (e.child = new Fr(e)), s.serialize(r.s, e.child, { id: r.i });
  }
  throw new Q(r.c);
}
function ra(e, r) {
  let t = "", n = false;
  return r.f.t !== 4 && (h(e.base, r.f.i), t = "(" + f(e, r.f) + ",", n = true), t += se(e, r.i, "(" + yt + ")(" + m(e, r.f.i) + ")"), n && (t += ")"), t;
}
function ta(e, r) {
  return G(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function na(e, r) {
  let t = r.a[0], n = r.a[1], a = e.base, s = "";
  t.t !== 4 && (h(a, t.i), s += "(" + f(e, t)), n.t !== 4 && (h(a, n.i), s += (s ? "," : "(") + f(e, n)), s && (s += ",");
  let i = se(e, r.i, "(" + Nt + ")(" + m(e, n.i) + "," + m(e, t.i) + ")");
  return s ? s + i + ")" : i;
}
function oa(e, r) {
  return G(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function aa(e, r) {
  let t = se(e, r.i, G(e, r.f) + "()"), n = r.a.length;
  if (n) {
    let a = f(e, r.a[0]);
    for (let s = 1; s < n; s++) a += "," + f(e, r.a[s]);
    return "(" + t + "," + a + "," + m(e, r.i) + ")";
  }
  return t;
}
function sa(e, r) {
  return m(e, r.i) + ".next(" + f(e, r.f) + ")";
}
function ia(e, r) {
  return m(e, r.i) + ".throw(" + f(e, r.f) + ")";
}
function ua(e, r) {
  return m(e, r.i) + ".return(" + f(e, r.f) + ")";
}
function la(e, r) {
  switch (r.t) {
    case 17:
      return qr[r.s];
    case 18:
      return zo(r);
    case 9:
      return _o(e, r);
    case 10:
      return ko(e, r);
    case 11:
      return Vo(e, r);
    case 5:
      return Lo(r);
    case 6:
      return Uo(e, r);
    case 7:
      return jo(e, r);
    case 8:
      return Yo(e, r);
    case 19:
      return Wo(e, r);
    case 16:
    case 15:
      return Go(e, r);
    case 20:
      return Ko(e, r);
    case 14:
      return Ho(e, r);
    case 13:
      return Jo(e, r);
    case 12:
      return Zo(e, r);
    case 21:
      return $o(e, r);
    case 22:
      return qo(e, r);
    case 25:
      return ea(e, r);
    case 26:
      return Rt[r.s];
    default:
      throw new O(r);
  }
}
function f(e, r) {
  switch (r.t) {
    case 2:
      return Qr[r.s];
    case 0:
      return "" + r.s;
    case 1:
      return '"' + r.s + '"';
    case 3:
      return r.s + "n";
    case 4:
      return m(e, r.i);
    case 23:
      return Xo(e, r);
    case 24:
      return Qo(e, r);
    case 27:
      return ra(e, r);
    case 28:
      return ta(e, r);
    case 29:
      return na(e, r);
    case 30:
      return oa(e, r);
    case 31:
      return aa(e, r);
    case 32:
      return sa(e, r);
    case 33:
      return ia(e, r);
    case 34:
      return ua(e, r);
    default:
      return se(e, r.i, la(e, r));
  }
}
function ur(e, r) {
  let t = f(e, r), n = r.i;
  if (n == null) return t;
  let a = Qt(e.base), s = m(e, n), i = e.state.scopeId, u2 = i == null ? "" : ce, l = a ? "(" + t + "," + a + s + ")" : t;
  if (u2 === "") return r.t === 10 && !a ? "(" + l + ")" : l;
  let g = i == null ? "()" : "(" + ce + '["' + y(i) + '"])';
  return "(" + or([u2], l) + ")" + g;
}
var jr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return R(this._p, this.depth, r);
  }
}, Yr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return R(this._p, this.depth, r);
  }
  parseWithError(r) {
    return K(this._p, this.depth, r);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Jr(this._p);
  }
  popPendingState() {
    be(this._p);
  }
  onParse(r) {
    ie(this._p, r);
  }
  onError(r) {
    Kr(this._p, r);
  }
};
function ca(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Wr(e) {
  return { type: 2, base: pe(2, e), state: ca(e) };
}
function fa(e, r, t) {
  let n = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n[a] = R(e, r, t[a]) : n[a] = 0;
  return n;
}
function Sa(e, r, t, n) {
  return _e(t, n, fa(e, r, n));
}
function Gr(e, r, t) {
  let n = Object.entries(t), a = [], s = [];
  for (let i = 0, u2 = n.length; i < u2; i++) a.push(y(n[i][0])), s.push(R(e, r, n[i][1]));
  return b in t && (a.push(E(e.base, b)), s.push(Ue(Xe(e.base), R(e, r, $e(t))))), N in t && (a.push(E(e.base, N)), s.push(je(Qe(e.base), R(e, r, e.type === 1 ? te() : Ze(t))))), P$1 in t && (a.push(E(e.base, P$1)), s.push(X(t[P$1]))), I in t && (a.push(E(e.base, I)), s.push(t[I] ? Z : $)), { k: a, v: s };
}
function Ur(e, r, t, n, a) {
  return er(t, n, a, Gr(e, r, n));
}
function ma(e, r, t, n) {
  return ke(t, R(e, r, n.valueOf()));
}
function pa(e, r, t, n) {
  return De(t, n, R(e, r, n.buffer));
}
function da(e, r, t, n) {
  return Fe(t, n, R(e, r, n.buffer));
}
function ga(e, r, t, n) {
  return Be(t, n, R(e, r, n.buffer));
}
function tn(e, r, t, n) {
  let a = q(n, e.base.features);
  return Me(t, n, a ? Gr(e, r, a) : o);
}
function ya(e, r, t, n) {
  let a = q(n, e.base.features);
  return Ve(t, n, a ? Gr(e, r, a) : o);
}
function Na(e, r, t, n) {
  let a = [], s = [];
  for (let [i, u2] of n.entries()) a.push(R(e, r, i)), s.push(R(e, r, u2));
  return rr(e.base, t, a, s);
}
function ba(e, r, t, n) {
  let a = [];
  for (let s of n.keys()) a.push(R(e, r, s));
  return Le(t, a);
}
function Ca(e, r, t, n) {
  let a = Ye(t, k(e.base, 4), []);
  return e.type === 1 || (Jr(e), n.on({ next: (s) => {
    if (e.state.alive) {
      let i = K(e, r, s);
      i && ie(e, We(t, i));
    }
  }, throw: (s) => {
    if (e.state.alive) {
      let i = K(e, r, s);
      i && ie(e, Ge(t, i));
    }
    be(e);
  }, return: (s) => {
    if (e.state.alive) {
      let i = K(e, r, s);
      i && ie(e, Ke(t, i));
    }
    be(e);
  } })), a;
}
function va(e, r, t) {
  if (this.state.alive) {
    let n = K(this, r, t);
    n && ie(this, c(23, e, o, o, o, o, o, [k(this.base, 2), n], o, o, o, o)), be(this);
  }
}
function Aa(e, r, t) {
  if (this.state.alive) {
    let n = K(this, r, t);
    n && ie(this, c(24, e, o, o, o, o, o, [k(this.base, 3), n], o, o, o, o));
  }
  be(this);
}
function Ra(e, r, t, n) {
  let a = Tr(e.base, {});
  return e.type === 2 && (Jr(e), n.then(va.bind(e, a, r), Aa.bind(e, a, r))), xt(e.base, t, a);
}
function Ea(e, r, t, n, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u2 = a[s];
    if (u2.parse.sync && u2.test(n)) return fe(t, u2.tag, u2.parse.sync(n, new jr(e, r), { id: t }));
  }
  return o;
}
function Ia(e, r, t, n, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u2 = a[s];
    if (u2.parse.stream && u2.test(n)) return fe(t, u2.tag, u2.parse.stream(n, new Yr(e, r), { id: t }));
  }
  return o;
}
function nn(e, r, t, n) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? Ea(e, r, t, n, a) : Ia(e, r, t, n, a) : o;
}
function Pa(e, r, t, n, a) {
  switch (a) {
    case Object:
      return Ur(e, r, t, n, false);
    case o:
      return Ur(e, r, t, n, true);
    case Date:
      return he(t, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return tn(e, r, t, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return ma(e, r, t, n);
    case ArrayBuffer:
      return tr(e.base, t, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return pa(e, r, t, n);
    case DataView:
      return ga(e, r, t, n);
    case Map:
      return Na(e, r, t, n);
    case Set:
      return ba(e, r, t, n);
  }
  if (a === Promise || n instanceof Promise) return Ra(e, r, t, n);
  let s = e.base.features;
  if (s & 32 && a === RegExp) return ze(t, n);
  if (s & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return da(e, r, t, n);
  }
  if (s & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n instanceof AggregateError)) return ya(e, r, t, n);
  if (n instanceof Error) return tn(e, r, t, n);
  if (b in n || N in n) return Ur(e, r, t, n, !!a);
  throw new x(n);
}
function xa(e, r, t, n) {
  if (Array.isArray(n)) return Sa(e, r, t, n);
  if (M(n)) return Ca(e, r, t, n);
  let a = n.constructor;
  if (a === Y) return R(e, r, n.replacement);
  let s = nn(e, r, t, n);
  return s || Pa(e, r, t, n, a);
}
function Ta(e, r, t) {
  let n = W(e.base, t);
  if (n.type !== 0) return n.value;
  let a = nn(e, r, n.value, t);
  if (a) return a;
  throw new x(t);
}
function R(e, r, t) {
  if (r >= e.base.depthLimit) throw new ee$1(e.base.depthLimit);
  switch (typeof t) {
    case "boolean":
      return t ? Z : $;
    case "undefined":
      return Ae;
    case "string":
      return X(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n = W(e.base, t);
        return n.type === 0 ? xa(e, r + 1, n.value, t) : n.value;
      }
      return Re;
    }
    case "symbol":
      return E(e.base, t);
    case "function":
      return Ta(e, r, t);
    default:
      throw new x(t);
  }
}
function ie(e, r) {
  e.state.initial ? e.state.buffer.push(r) : Hr(e, r, false);
}
function Kr(e, r) {
  if (e.state.onError) e.state.onError(r);
  else throw r instanceof z ? r : new z(r);
}
function on(e) {
  e.state.onDone && e.state.onDone();
}
function Hr(e, r, t) {
  try {
    e.state.onParse(r, t);
  } catch (n) {
    Kr(e, n);
  }
}
function Jr(e) {
  e.state.pending++;
}
function be(e) {
  --e.state.pending <= 0 && on(e);
}
function K(e, r, t) {
  try {
    return R(e, r, t);
  } catch (n) {
    return Kr(e, n), o;
  }
}
function Zr(e, r) {
  let t = K(e, 0, r);
  t && (Hr(e, t, true), e.state.initial = false, Oa(e, e.state), e.state.pending <= 0 && lr(e));
}
function Oa(e, r) {
  for (let t = 0, n = r.buffer.length; t < n; t++) Hr(e, r.buffer[t], false);
}
function lr(e) {
  e.state.alive && (on(e), e.state.alive = false);
}
async function Zi(e, r = {}) {
  let t = A(r.plugins), n = ne(2, { plugins: t, disabledFeatures: r.disabledFeatures, refs: r.refs });
  return await oe(n, e);
}
function an(e, r) {
  let t = A(r.plugins), n = Wr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, onParse(a, s) {
    let i = sr({ plugins: t, features: n.base.features, scopeId: r.scopeId, markedRefs: n.base.marked }), u2;
    try {
      u2 = ur(i, a);
    } catch (l) {
      r.onError && r.onError(l);
      return;
    }
    r.onSerialize(u2, s);
  }, onError: r.onError, onDone: r.onDone });
  return Zr(n, e), lr.bind(null, n);
}
function $i(e, r) {
  let t = A(r.plugins), n = Wr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, onParse: r.onParse, onError: r.onError, onDone: r.onDone });
  return Zr(n, e), lr.bind(null, n);
}
function du(e, r = {}) {
  var i;
  let t = A(r.plugins), n = r.disabledFeatures || 0, a = (i = e.f) != null ? i : 63, s = Dt({ plugins: t, markedRefs: e.m, features: a & ~n, disabledFeatures: n });
  return nr(s, e.t);
}
const GLOBAL_TSR = "$_TSR";
const TSR_SCRIPT_BARRIER_ID = "$tsr-stream-barrier";
function createSerializationAdapter(opts) {
  return opts;
}
function makeSsrSerovalPlugin(serializationAdapter, options) {
  return Js({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: {
      stream(value, ctx) {
        return ctx.parse(serializationAdapter.toSerializable(value));
      }
    },
    serialize(node, ctx) {
      options.didRun = true;
      return GLOBAL_TSR + '.t.get("' + serializationAdapter.key + '")(' + ctx.serialize(node) + ")";
    },
    // we never deserialize on the server during SSR
    deserialize: void 0
  });
}
function makeSerovalPlugin(serializationAdapter) {
  return Js({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: {
      sync(value, ctx) {
        return ctx.parse(serializationAdapter.toSerializable(value));
      },
      async async(value, ctx) {
        return await ctx.parse(serializationAdapter.toSerializable(value));
      },
      stream(value, ctx) {
        return ctx.parse(serializationAdapter.toSerializable(value));
      }
    },
    // we don't generate JS code outside of SSR (for now)
    serialize: void 0,
    deserialize(node, ctx) {
      return serializationAdapter.fromSerializable(ctx.deserialize(node));
    }
  });
}
var p = {}, P = (e) => new ReadableStream({ start: (r) => {
  e.on({ next: (a) => {
    try {
      r.enqueue(a);
    } catch (t) {
    }
  }, throw: (a) => {
    r.error(a);
  }, return: () => {
    try {
      r.close();
    } catch (a) {
    }
  } });
} }), ee2 = Js({ tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === p;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize() {
  return P.toString();
}, deserialize() {
  return p;
} });
function w2(e) {
  let r = te(), a = e.getReader();
  async function t() {
    try {
      let n = await a.read();
      n.done ? r.return(n.value) : (r.next(n.value), await t());
    } catch (n) {
      r.throw(n);
    }
  }
  return t().catch(() => {
  }), r;
}
var re = Js({ tag: "seroval/plugins/web/ReadableStream", extends: [ee2], test(e) {
  return typeof ReadableStream == "undefined" ? false : e instanceof ReadableStream;
}, parse: { sync(e, r) {
  return { factory: r.parse(p), stream: r.parse(te()) };
}, async async(e, r) {
  return { factory: await r.parse(p), stream: await r.parse(w2(e)) };
}, stream(e, r) {
  return { factory: r.parse(p), stream: r.parse(w2(e)) };
} }, serialize(e, r) {
  return "(" + r.serialize(e.factory) + ")(" + r.serialize(e.stream) + ")";
}, deserialize(e, r) {
  let a = r.deserialize(e.stream);
  return P(a);
} }), u = re;
const ShallowErrorPlugin = /* @__PURE__ */ Js({
  tag: "$TSR/Error",
  test(value) {
    return value instanceof Error;
  },
  parse: {
    sync(value, ctx) {
      return {
        message: ctx.parse(value.message)
      };
    },
    async async(value, ctx) {
      return {
        message: await ctx.parse(value.message)
      };
    },
    stream(value, ctx) {
      return {
        message: ctx.parse(value.message)
      };
    }
  },
  serialize(node, ctx) {
    return "new Error(" + ctx.serialize(node.message) + ")";
  },
  deserialize(node, ctx) {
    return new Error(ctx.deserialize(node.message));
  }
});
class RawStream {
  constructor(stream, options) {
    this.stream = stream;
    this.hint = options?.hint ?? "binary";
  }
}
const BufferCtor = globalThis.Buffer;
const hasNodeBuffer = !!BufferCtor && typeof BufferCtor.from === "function";
function uint8ArrayToBase64(bytes) {
  if (bytes.length === 0) return "";
  if (hasNodeBuffer) {
    return BufferCtor.from(bytes).toString("base64");
  }
  const CHUNK_SIZE = 32768;
  const chunks = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode.apply(null, chunk));
  }
  return btoa(chunks.join(""));
}
function base64ToUint8Array(base64) {
  if (base64.length === 0) return new Uint8Array(0);
  if (hasNodeBuffer) {
    const buf = BufferCtor.from(base64, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
const RAW_STREAM_FACTORY_BINARY = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_TEXT = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY = (stream) => new ReadableStream({
  start(controller) {
    stream.on({
      next(base64) {
        try {
          controller.enqueue(base64ToUint8Array(base64));
        } catch {
        }
      },
      throw(error) {
        controller.error(error);
      },
      return() {
        try {
          controller.close();
        } catch {
        }
      }
    });
  }
});
const textEncoderForFactory = new TextEncoder();
const RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT = (stream) => {
  return new ReadableStream({
    start(controller) {
      stream.on({
        next(value) {
          try {
            if (typeof value === "string") {
              controller.enqueue(textEncoderForFactory.encode(value));
            } else {
              controller.enqueue(base64ToUint8Array(value.$b64));
            }
          } catch {
          }
        },
        throw(error) {
          controller.error(error);
        },
        return() {
          try {
            controller.close();
          } catch {
          }
        }
      });
    }
  });
};
const FACTORY_BINARY = `(s=>new ReadableStream({start(c){s.on({next(b){try{const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}catch(_){}},throw(e){c.error(e)},return(){try{c.close()}catch(_){}}})}}))`;
const FACTORY_TEXT = `(s=>{const e=new TextEncoder();return new ReadableStream({start(c){s.on({next(v){try{if(typeof v==='string'){c.enqueue(e.encode(v))}else{const d=atob(v.$b64),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}}catch(_){}},throw(x){c.error(x)},return(){try{c.close()}catch(_){}}})}})})`;
function toBinaryStream(readable) {
  const stream = te();
  const reader = readable.getReader();
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          stream.return(void 0);
          break;
        }
        stream.next(uint8ArrayToBase64(value));
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
function toTextStream(readable) {
  const stream = te();
  const reader = readable.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          try {
            const remaining = decoder.decode();
            if (remaining.length > 0) {
              stream.next(remaining);
            }
          } catch {
          }
          stream.return(void 0);
          break;
        }
        try {
          const text = decoder.decode(value, { stream: true });
          if (text.length > 0) {
            stream.next(text);
          }
        } catch {
          stream.next({ $b64: uint8ArrayToBase64(value) });
        }
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
const RawStreamFactoryBinaryPlugin = Js({
  tag: "tss/RawStreamFactory",
  test(value) {
    return value === RAW_STREAM_FACTORY_BINARY;
  },
  parse: {
    sync() {
      return void 0;
    },
    async() {
      return Promise.resolve(void 0);
    },
    stream() {
      return void 0;
    }
  },
  serialize() {
    return FACTORY_BINARY;
  },
  deserialize() {
    return RAW_STREAM_FACTORY_BINARY;
  }
});
const RawStreamFactoryTextPlugin = Js({
  tag: "tss/RawStreamFactoryText",
  test(value) {
    return value === RAW_STREAM_FACTORY_TEXT;
  },
  parse: {
    sync() {
      return void 0;
    },
    async() {
      return Promise.resolve(void 0);
    },
    stream() {
      return void 0;
    }
  },
  serialize() {
    return FACTORY_TEXT;
  },
  deserialize() {
    return RAW_STREAM_FACTORY_TEXT;
  }
});
const RawStreamSSRPlugin = Js({
  tag: "tss/RawStream",
  extends: [RawStreamFactoryBinaryPlugin, RawStreamFactoryTextPlugin],
  test(value) {
    return value instanceof RawStream;
  },
  parse: {
    sync(value, ctx) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      return {
        hint: value.hint,
        factory: ctx.parse(factory),
        stream: ctx.parse(te())
      };
    },
    async async(value, ctx) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: value.hint,
        factory: await ctx.parse(factory),
        stream: await ctx.parse(encodedStream)
      };
    },
    stream(value, ctx) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: value.hint,
        factory: ctx.parse(factory),
        stream: ctx.parse(encodedStream)
      };
    }
  },
  serialize(node, ctx) {
    return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
  },
  deserialize(node, ctx) {
    const stream = ctx.deserialize(node.stream);
    return node.hint === "text" ? RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT(stream) : RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY(stream);
  }
});
function createRawStreamRPCPlugin(onRawStream) {
  let nextStreamId = 1;
  return Js({
    tag: "tss/RawStream",
    test(value) {
      return value instanceof RawStream;
    },
    parse: {
      async(value) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return Promise.resolve({ streamId });
      },
      stream(value) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return { streamId };
      }
    },
    serialize() {
      throw new Error(
        "RawStreamRPCPlugin.serialize should not be called. RPC uses JSON serialization, not JS code generation."
      );
    },
    deserialize() {
      throw new Error(
        "RawStreamRPCPlugin.deserialize should not be called. Use createRawStreamDeserializePlugin on client."
      );
    }
  });
}
const defaultSerovalPlugins = [
  ShallowErrorPlugin,
  // RawStreamSSRPlugin must come before ReadableStreamPlugin to match first
  RawStreamSSRPlugin,
  // ReadableStreamNode is not exported by seroval
  u
];
const TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
const TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
const TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for(
  "TSS_SERVER_FUNCTION_FACTORY"
);
const X_TSS_SERIALIZED = "x-tss-serialized";
const X_TSS_RAW_RESPONSE = "x-tss-raw";
const TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
const FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
const FRAME_HEADER_SIZE = 9;
const TSS_FRAMED_PROTOCOL_VERSION = 1;
const TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=${TSS_FRAMED_PROTOCOL_VERSION}`;
const GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
const globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_STORAGE_KEY]) {
  globalObj$1[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
}
const startStorage = globalObj$1[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn2) {
  return startStorage.run(context, fn2);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) {
    throw new Error(
      `No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return context;
}
const getStartOptions = () => getStartContext().startOptions;
const getStartContextServerOnly = getStartContext;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) {
      if (isSafeKey(key)) result[key] = target[key];
    }
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) {
      if (isSafeKey(key)) result[key] = source[key];
    }
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) {
    if (isSafeKey(key)) obj[key] = source[key];
  }
  return obj;
}
const createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") {
    resolvedOptions.method = "GET";
  }
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m2) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m2) {
          if (m2.options.middleware) {
            newMiddleware.push(...m2.options.middleware);
          }
        } else {
          newMiddleware.push(m2);
        }
      });
      const newOptions = {
        ...resolvedOptions,
        middleware: newMiddleware
      };
      const res2 = createServerFn(void 0, newOptions);
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      const newOptions = { ...resolvedOptions, inputValidator };
      return createServerFn(void 0, newOptions);
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = { ...resolvedOptions, extractedFn, serverFn };
      const resolvedMiddleware = [
        ...newOptions.middleware || [],
        serverFnBaseToMiddleware(newOptions)
      ];
      return Object.assign(
        async (opts) => {
          const result = await executeMiddleware$1(resolvedMiddleware, "client", {
            ...extractedFn,
            ...newOptions,
            data: opts?.data,
            headers: opts?.headers,
            signal: opts?.signal,
            context: createNullProtoObject()
          });
          const redirect2 = parseRedirect(result.error);
          if (redirect2) {
            throw redirect2;
          }
          if (result.error) throw result.error;
          return result.result;
        },
        {
          // This copies over the URL, function ID
          ...extractedFn,
          // The extracted function on the server-side calls
          // this function
          __executeServer: async (opts, signal) => {
            const startContext = getStartContextServerOnly();
            const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
            const ctx = {
              ...extractedFn,
              ...opts,
              context: safeObjectMerge(
                serverContextAfterGlobalMiddlewares,
                opts.context
              ),
              signal,
              request: startContext.request
            };
            const result = await executeMiddleware$1(
              resolvedMiddleware,
              "server",
              ctx
            ).then((d) => ({
              // Only send the result and sendContext back to the client
              result: d.result,
              error: d.error,
              context: d.sendContext
            }));
            return result;
          }
        }
      );
    }
  };
  const fun = (options2) => {
    const newOptions = {
      ...resolvedOptions,
      ...options2
    };
    return createServerFn(void 0, newOptions);
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  const globalMiddlewares = getStartOptions()?.functionMiddleware || [];
  let flattenedMiddlewares = flattenMiddlewares([
    ...globalMiddlewares,
    ...middlewares
  ]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) {
      flattenedMiddlewares = flattenedMiddlewares.filter(
        (m2) => !startContext.executedRequestMiddlewares.has(m2)
      );
    }
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) {
      return ctx;
    }
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") {
        ctx.data = await execValidator(
          nextMiddleware.options.inputValidator,
          ctx.data
        );
      }
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) {
          middlewareFn = nextMiddleware.options.client;
        }
      } else if ("server" in nextMiddleware.options) {
        middlewareFn = nextMiddleware.options.server;
      }
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const nextCtx = {
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          };
          try {
            return await callNextMiddleware(nextCtx);
          } catch (error) {
            return {
              ...nextCtx,
              error
            };
          }
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) {
          return {
            ...ctx,
            error: result
          };
        }
        if (result instanceof Response) {
          return {
            ...ctx,
            result
          };
        }
        if (!result) {
          throw new Error(
            "User middleware returned undefined. You must call next() or return a result in your middlewares."
          );
        }
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject()
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) {
      throw new Error(
        `Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`
      );
    }
    middleware.forEach((m2) => {
      if (m2.options.middleware) {
        recurse(m2.options.middleware, depth + 1);
      }
      if (!seen.has(m2)) {
        seen.add(m2);
        flattened.push(m2);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues)
      throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) {
    return validator.parse(input);
  }
  if (typeof validator === "function") {
    return validator(input);
  }
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, ...ctx }) => {
        const payload = {
          ...ctx,
          // switch the sendContext over to context
          context: sendContext
        };
        const res = await options.extractedFn?.(payload);
        return next(res);
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  const start = getStartOptions();
  const adapters = start?.serializationAdapters;
  return [
    ...adapters?.map(makeSerovalPlugin) ?? [],
    ...defaultSerovalPlugins
  ];
}
const minifiedTsrBootStrapScript = "self.$_TSR={h(){this.hydrated=!0,this.c()},e(){this.streamEnded=!0,this.c()},c(){this.hydrated&&this.streamEnded&&(delete self.$_TSR,delete self.$R.tsr)},p(e){this.initialized?e():this.buffer.push(e)},buffer:[]};\n";
const SCOPE_ID = "tsr";
function dehydrateMatch(match) {
  const dehydratedMatch = {
    i: match.id,
    u: match.updatedAt,
    s: match.status
  };
  const properties = [
    ["__beforeLoadContext", "b"],
    ["loaderData", "l"],
    ["error", "e"],
    ["ssr", "ssr"]
  ];
  for (const [key, shorthand] of properties) {
    if (match[key] !== void 0) {
      dehydratedMatch[shorthand] = match[key];
    }
  }
  return dehydratedMatch;
}
const INITIAL_SCRIPTS = [
  ln(SCOPE_ID),
  minifiedTsrBootStrapScript
];
class ScriptBuffer {
  constructor(router) {
    this._scriptBarrierLifted = false;
    this._cleanedUp = false;
    this._pendingMicrotask = false;
    this.router = router;
    this._queue = INITIAL_SCRIPTS.slice();
  }
  enqueue(script) {
    if (this._cleanedUp) return;
    this._queue.push(script);
    if (this._scriptBarrierLifted && !this._pendingMicrotask) {
      this._pendingMicrotask = true;
      queueMicrotask(() => {
        this._pendingMicrotask = false;
        this.injectBufferedScripts();
      });
    }
  }
  liftBarrier() {
    if (this._scriptBarrierLifted || this._cleanedUp) return;
    this._scriptBarrierLifted = true;
    if (this._queue.length > 0 && !this._pendingMicrotask) {
      this._pendingMicrotask = true;
      queueMicrotask(() => {
        this._pendingMicrotask = false;
        this.injectBufferedScripts();
      });
    }
  }
  /**
   * Flushes any pending scripts synchronously.
   * Call this before emitting onSerializationFinished to ensure all scripts are injected.
   *
   * IMPORTANT: Only injects if the barrier has been lifted. Before the barrier is lifted,
   * scripts should remain in the queue so takeBufferedScripts() can retrieve them
   */
  flush() {
    if (!this._scriptBarrierLifted) return;
    if (this._cleanedUp) return;
    this._pendingMicrotask = false;
    const scriptsToInject = this.takeAll();
    if (scriptsToInject && this.router?.serverSsr) {
      this.router.serverSsr.injectScript(scriptsToInject);
    }
  }
  takeAll() {
    const bufferedScripts = this._queue;
    this._queue = [];
    if (bufferedScripts.length === 0) {
      return void 0;
    }
    return bufferedScripts.join(";") + ";document.currentScript.remove()";
  }
  injectBufferedScripts() {
    if (this._cleanedUp) return;
    if (this._queue.length === 0) return;
    const scriptsToInject = this.takeAll();
    if (scriptsToInject && this.router?.serverSsr) {
      this.router.serverSsr.injectScript(scriptsToInject);
    }
  }
  cleanup() {
    this._cleanedUp = true;
    this._queue = [];
    this.router = void 0;
  }
}
function attachRouterServerSsrUtils({
  router,
  manifest: manifest2
}) {
  router.ssr = {
    manifest: manifest2
  };
  let _dehydrated = false;
  let _serializationFinished = false;
  const renderFinishedListeners = [];
  const serializationFinishedListeners = [];
  const scriptBuffer = new ScriptBuffer(router);
  let injectedHtmlBuffer = [];
  router.serverSsr = {
    injectHtml: (html) => {
      if (!html) return;
      injectedHtmlBuffer.push(html);
      router.emit({
        type: "onInjectedHtml"
      });
    },
    injectScript: (script) => {
      if (!script) return;
      const html = `<script${router.options.ssr?.nonce ? ` nonce='${router.options.ssr.nonce}'` : ""}>${script}<\/script>`;
      router.serverSsr.injectHtml(html);
    },
    dehydrate: async () => {
      invariant(!_dehydrated, "router is already dehydrated!");
      let matchesToDehydrate = router.state.matches;
      if (router.isShell()) {
        matchesToDehydrate = matchesToDehydrate.slice(0, 1);
      }
      const matches = matchesToDehydrate.map(dehydrateMatch);
      let manifestToDehydrate = void 0;
      if (manifest2) {
        const currentRouteIds = new Set(
          router.state.matches.map((k2) => k2.routeId)
        );
        const filteredRoutes = Object.fromEntries(
          Object.entries(manifest2.routes).flatMap(
            ([routeId, routeManifest]) => {
              if (currentRouteIds.has(routeId)) {
                return [[routeId, routeManifest]];
              } else if (routeManifest.assets && routeManifest.assets.length > 0) {
                return [
                  [
                    routeId,
                    {
                      assets: routeManifest.assets
                    }
                  ]
                ];
              }
              return [];
            }
          )
        );
        manifestToDehydrate = {
          routes: filteredRoutes
        };
      }
      const dehydratedRouter = {
        manifest: manifestToDehydrate,
        matches
      };
      const lastMatchId = matchesToDehydrate[matchesToDehydrate.length - 1]?.id;
      if (lastMatchId) {
        dehydratedRouter.lastMatchId = lastMatchId;
      }
      const dehydratedData = await router.options.dehydrate?.();
      if (dehydratedData) {
        dehydratedRouter.dehydratedData = dehydratedData;
      }
      _dehydrated = true;
      const trackPlugins = { didRun: false };
      const serializationAdapters = router.options.serializationAdapters;
      const plugins = serializationAdapters ? serializationAdapters.map((t) => makeSsrSerovalPlugin(t, trackPlugins)).concat(defaultSerovalPlugins) : defaultSerovalPlugins;
      const signalSerializationComplete = () => {
        _serializationFinished = true;
        try {
          serializationFinishedListeners.forEach((l) => l());
          router.emit({ type: "onSerializationFinished" });
        } catch (err) {
          console.error("Serialization listener error:", err);
        } finally {
          serializationFinishedListeners.length = 0;
          renderFinishedListeners.length = 0;
        }
      };
      an(dehydratedRouter, {
        refs: /* @__PURE__ */ new Map(),
        plugins,
        onSerialize: (data, initial) => {
          let serialized = initial ? GLOBAL_TSR + ".router=" + data : data;
          if (trackPlugins.didRun) {
            serialized = GLOBAL_TSR + ".p(()=>" + serialized + ")";
          }
          scriptBuffer.enqueue(serialized);
        },
        scopeId: SCOPE_ID,
        onDone: () => {
          scriptBuffer.enqueue(GLOBAL_TSR + ".e()");
          scriptBuffer.flush();
          signalSerializationComplete();
        },
        onError: (err) => {
          console.error("Serialization error:", err);
          signalSerializationComplete();
        }
      });
    },
    isDehydrated() {
      return _dehydrated;
    },
    isSerializationFinished() {
      return _serializationFinished;
    },
    onRenderFinished: (listener) => renderFinishedListeners.push(listener),
    onSerializationFinished: (listener) => serializationFinishedListeners.push(listener),
    setRenderFinished: () => {
      try {
        renderFinishedListeners.forEach((l) => l());
      } catch (err) {
        console.error("Error in render finished listener:", err);
      } finally {
        renderFinishedListeners.length = 0;
      }
      scriptBuffer.liftBarrier();
    },
    takeBufferedScripts() {
      const scripts = scriptBuffer.takeAll();
      const serverBufferedScript = {
        tag: "script",
        attrs: {
          nonce: router.options.ssr?.nonce,
          className: "$tsr",
          id: TSR_SCRIPT_BARRIER_ID
        },
        children: scripts
      };
      return serverBufferedScript;
    },
    liftScriptBarrier() {
      scriptBuffer.liftBarrier();
    },
    takeBufferedHtml() {
      if (injectedHtmlBuffer.length === 0) {
        return void 0;
      }
      const buffered = injectedHtmlBuffer.join("");
      injectedHtmlBuffer = [];
      return buffered;
    },
    cleanup() {
      if (!router.serverSsr) return;
      renderFinishedListeners.length = 0;
      serializationFinishedListeners.length = 0;
      injectedHtmlBuffer = [];
      scriptBuffer.cleanup();
      router.serverSsr = void 0;
    }
  };
}
function getOrigin(request) {
  const originHeader = request.headers.get("Origin");
  if (originHeader) {
    try {
      new URL(originHeader);
      return originHeader;
    } catch {
    }
  }
  try {
    return new URL(request.url).origin;
  } catch {
  }
  return "http://localhost";
}
const NullProtoObj = /* @__PURE__ */ (() => {
  const e = function() {
  };
  return e.prototype = /* @__PURE__ */ Object.create(null), Object.freeze(e.prototype), e;
})();
function lazyInherit(target, source, sourceKey) {
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (!targetDesc?.value && typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const FastURL = /* @__PURE__ */ (() => {
  const NativeURL = globalThis.URL;
  const FastURL$1 = class URL {
    #url;
    #href;
    #protocol;
    #host;
    #pathname;
    #search;
    #searchParams;
    #pos;
    constructor(url) {
      if (typeof url === "string") this.#href = url;
      else {
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#pathname = url.pathname;
        this.#search = url.search;
      }
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeURL;
    }
    get _url() {
      if (this.#url) return this.#url;
      this.#url = new NativeURL(this.href);
      this.#href = void 0;
      this.#protocol = void 0;
      this.#host = void 0;
      this.#pathname = void 0;
      this.#search = void 0;
      this.#searchParams = void 0;
      this.#pos = void 0;
      return this.#url;
    }
    get href() {
      if (this.#url) return this.#url.href;
      if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
      return this.#href;
    }
    #getPos() {
      if (!this.#pos) {
        const url = this.href;
        const protoIndex = url.indexOf("://");
        const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
        this.#pos = [
          protoIndex,
          pathnameIndex,
          pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex)
        ];
      }
      return this.#pos;
    }
    get pathname() {
      if (this.#url) return this.#url.pathname;
      if (this.#pathname === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.pathname;
        this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
      }
      return this.#pathname;
    }
    get search() {
      if (this.#url) return this.#url.search;
      if (this.#search === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.search;
        const url = this.href;
        this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
      }
      return this.#search;
    }
    get searchParams() {
      if (this.#url) return this.#url.searchParams;
      if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
      return this.#searchParams;
    }
    get protocol() {
      if (this.#url) return this.#url.protocol;
      if (this.#protocol === void 0) {
        const [protocolIndex] = this.#getPos();
        if (protocolIndex === -1) return this._url.protocol;
        this.#protocol = this.href.slice(0, protocolIndex + 1);
      }
      return this.#protocol;
    }
    toString() {
      return this.href;
    }
    toJSON() {
      return this.href;
    }
  };
  lazyInherit(FastURL$1.prototype, NativeURL.prototype, "_url");
  Object.setPrototypeOf(FastURL$1.prototype, NativeURL.prototype);
  Object.setPrototypeOf(FastURL$1, NativeURL);
  return FastURL$1;
})();
const NodeResponse = /* @__PURE__ */ (() => {
  const NativeResponse = globalThis.Response;
  const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
  class NodeResponse$1 {
    #body;
    #init;
    #headers;
    #response;
    constructor(body, init) {
      this.#body = body;
      this.#init = init;
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeResponse;
    }
    get status() {
      return this.#response?.status || this.#init?.status || 200;
    }
    get statusText() {
      return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
    }
    get headers() {
      if (this.#response) return this.#response.headers;
      if (this.#headers) return this.#headers;
      const initHeaders = this.#init?.headers;
      return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
    }
    get ok() {
      if (this.#response) return this.#response.ok;
      const status = this.status;
      return status >= 200 && status < 300;
    }
    get _response() {
      if (this.#response) return this.#response;
      this.#response = new NativeResponse(this.#body, this.#headers ? {
        ...this.#init,
        headers: this.#headers
      } : this.#init);
      this.#init = void 0;
      this.#headers = void 0;
      this.#body = void 0;
      return this.#response;
    }
    _toNodeResponse() {
      const status = this.status;
      const statusText = this.statusText;
      let body;
      let contentType;
      let contentLength;
      if (this.#response) body = this.#response.body;
      else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
      else if (typeof this.#body === "string") {
        body = this.#body;
        contentType = "text/plain; charset=UTF-8";
        contentLength = Buffer.byteLength(this.#body);
      } else if (this.#body instanceof ArrayBuffer) {
        body = Buffer.from(this.#body);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Uint8Array) {
        body = this.#body;
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof DataView) {
        body = Buffer.from(this.#body.buffer);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Blob) {
        body = this.#body.stream();
        contentType = this.#body.type;
        contentLength = this.#body.size;
      } else if (typeof this.#body.pipe === "function") body = this.#body;
      else body = this._response.body;
      const headers = [];
      const initHeaders = this.#init?.headers;
      const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k2, v2]) => [k2.toLowerCase(), v2]) : void 0);
      let hasContentTypeHeader;
      let hasContentLength;
      if (headerEntries) for (const [key, value] of headerEntries) {
        if (Array.isArray(value)) for (const v2 of value) headers.push([key, v2]);
        else headers.push([key, value]);
        if (key === "content-type") hasContentTypeHeader = true;
        else if (key === "content-length") hasContentLength = true;
      }
      if (contentType && !hasContentTypeHeader) headers.push(["content-type", contentType]);
      if (contentLength && !hasContentLength) headers.push(["content-length", String(contentLength)]);
      this.#init = void 0;
      this.#headers = void 0;
      this.#response = void 0;
      this.#body = void 0;
      return {
        status,
        statusText,
        headers,
        body
      };
    }
  }
  lazyInherit(NodeResponse$1.prototype, NativeResponse.prototype, "_response");
  Object.setPrototypeOf(NodeResponse$1, NativeResponse);
  Object.setPrototypeOf(NodeResponse$1.prototype, NativeResponse.prototype);
  return NodeResponse$1;
})();
const kEventNS = "h3.internal.event.";
const kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
const kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var H3Event = class {
  app;
  req;
  url;
  context;
  static __is_event__ = true;
  constructor(req, context, app) {
    this.context = context || req.context || new NullProtoObj();
    this.req = req;
    this.app = app;
    const _url = req._url;
    this.url = _url && _url instanceof URL ? _url : new FastURL(req.url);
  }
  get res() {
    return this[kEventRes] ||= new H3EventResponse();
  }
  get runtime() {
    return this.req.runtime;
  }
  waitUntil(promise) {
    this.req.waitUntil?.(promise);
  }
  toString() {
    return `[${this.req.method}] ${this.req.url}`;
  }
  toJSON() {
    return this.toString();
  }
  get node() {
    return this.req.runtime?.node;
  }
  get headers() {
    return this.req.headers;
  }
  get path() {
    return this.url.pathname + this.url.search;
  }
  get method() {
    return this.req.method;
  }
};
var H3EventResponse = class {
  status;
  statusText;
  get headers() {
    return this[kEventResHeaders] ||= new Headers();
  }
};
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) return defaultStatusCode;
  if (typeof statusCode === "string") statusCode = +statusCode;
  if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
  return statusCode;
}
var HTTPError = class HTTPError2 extends Error {
  get name() {
    return "HTTPError";
  }
  status;
  statusText;
  headers;
  cause;
  data;
  body;
  unhandled;
  static isError(input) {
    return input instanceof Error && input?.name === "HTTPError";
  }
  static status(status, statusText, details) {
    return new HTTPError2({
      ...details,
      statusText,
      status
    });
  }
  constructor(arg1, arg2) {
    let messageInput;
    let details;
    if (typeof arg1 === "string") {
      messageInput = arg1;
      details = arg2;
    } else details = arg1;
    const status = sanitizeStatusCode(details?.status || details?.cause?.status || details?.status || details?.statusCode, 500);
    const statusText = sanitizeStatusMessage(details?.statusText || details?.cause?.statusText || details?.statusText || details?.statusMessage);
    const message = messageInput || details?.message || details?.cause?.message || details?.statusText || details?.statusMessage || [
      "HTTPError",
      status,
      statusText
    ].filter(Boolean).join(" ");
    super(message, { cause: details });
    this.cause = details;
    Error.captureStackTrace?.(this, this.constructor);
    this.status = status;
    this.statusText = statusText || void 0;
    const rawHeaders = details?.headers || details?.cause?.headers;
    this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
    this.unhandled = details?.unhandled ?? details?.cause?.unhandled ?? void 0;
    this.data = details?.data;
    this.body = details?.body;
  }
  get statusCode() {
    return this.status;
  }
  get statusMessage() {
    return this.statusText;
  }
  toJSON() {
    const unhandled = this.unhandled;
    return {
      status: this.status,
      statusText: this.statusText,
      unhandled,
      message: unhandled ? "HTTPError" : this.message,
      data: unhandled ? void 0 : this.data,
      ...unhandled ? void 0 : this.body
    };
  }
};
function isJSONSerializable(value, _type) {
  if (value === null || value === void 0) return true;
  if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
  if (typeof value.toJSON === "function") return true;
  if (Array.isArray(value)) return true;
  if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
  if (value instanceof NullProtoObj) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
const kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
const kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
  if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
  const response = prepareResponse(val, event, config);
  if (typeof response?.then === "function") return toResponse(response, event, config);
  const { onResponse: onResponse$1 } = config;
  return onResponse$1 ? Promise.resolve(onResponse$1(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
  #headers;
  #init;
  body;
  constructor(body, init) {
    this.body = body;
    this.#init = init;
  }
  get status() {
    return this.#init?.status || 200;
  }
  get statusText() {
    return this.#init?.statusText || "OK";
  }
  get headers() {
    return this.#headers ||= new Headers(this.#init?.headers);
  }
};
function prepareResponse(val, event, config, nested) {
  if (val === kHandled) return new NodeResponse(null);
  if (val === kNotFound) val = new HTTPError({
    status: 404,
    message: `Cannot find any route matching [${event.req.method}] ${event.url}`
  });
  if (val && val instanceof Error) {
    const isHTTPError = HTTPError.isError(val);
    const error = isHTTPError ? val : new HTTPError(val);
    if (!isHTTPError) {
      error.unhandled = true;
      if (val?.stack) error.stack = val.stack;
    }
    if (error.unhandled && !config.silent) console.error(error);
    const { onError: onError$1 } = config;
    return onError$1 && !nested ? Promise.resolve(onError$1(error, event)).catch((error$1) => error$1).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug);
  }
  const preparedRes = event[kEventRes];
  const preparedHeaders = preparedRes?.[kEventResHeaders];
  event[kEventRes] = void 0;
  if (!(val instanceof Response)) {
    const res = prepareResponseBody(val, event, config);
    const status = res.status || preparedRes?.status;
    return new NodeResponse(nullBody(event.req.method, status) ? null : res.body, {
      status,
      statusText: res.statusText || preparedRes?.statusText,
      headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
    });
  }
  if (!preparedHeaders || nested || !val.ok) return val;
  try {
    mergeHeaders$1(val.headers, preparedHeaders, val.headers);
    return val;
  } catch {
    return new NodeResponse(nullBody(event.req.method, val.status) ? null : val.body, {
      status: val.status,
      statusText: val.statusText,
      headers: mergeHeaders$1(val.headers, preparedHeaders)
    });
  }
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
  for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
  else target.set(name, value);
  return target;
}
const frozenHeaders = () => {
  throw new Error("Headers are frozen");
};
var FrozenHeaders = class extends Headers {
  constructor(init) {
    super(init);
    this.set = this.append = this.delete = frozenHeaders;
  }
};
const emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
const jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
  if (val === null || val === void 0) return {
    body: "",
    headers: emptyHeaders
  };
  const valType = typeof val;
  if (valType === "string") return { body: val };
  if (val instanceof Uint8Array) {
    event.res.headers.set("content-length", val.byteLength.toString());
    return { body: val };
  }
  if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
  if (isJSONSerializable(val, valType)) return {
    body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
    headers: jsonHeaders
  };
  if (valType === "bigint") return {
    body: val.toString(),
    headers: jsonHeaders
  };
  if (val instanceof Blob) {
    const headers = new Headers({
      "content-type": val.type,
      "content-length": val.size.toString()
    });
    let filename = val.name;
    if (filename) {
      filename = encodeURIComponent(filename);
      headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
    }
    return {
      body: val.stream(),
      headers
    };
  }
  if (valType === "symbol") return { body: val.toString() };
  if (valType === "function") return { body: `${val.name}()` };
  return { body: val };
}
function nullBody(method, status) {
  return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug) {
  return new NodeResponse(JSON.stringify({
    ...error.toJSON(),
    stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
  }, void 0, debug ? 2 : void 0), {
    status: error.status,
    statusText: error.statusText,
    headers: error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders)
  });
}
const GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
const globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) {
  globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
}
const eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") {
    return headersWithSetCookie.getSetCookie();
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) {
    return;
  }
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) {
    return;
  }
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) {
    response.headers.append("set-cookie", cookie);
  }
  for (const cookie of eventSetCookies) {
    response.headers.append("set-cookie", cookie);
  }
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) {
    return value.then((resolved) => {
      if (resolved instanceof Response) {
        mergeEventResponseHeaders(resolved, event);
      }
      return resolved;
    });
  }
  if (value instanceof Response) {
    mergeEventResponseHeaders(value, event);
  }
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    const h3Event = new H3Event(request);
    const response = eventStorage.run(
      { h3Event },
      () => handler(request, requestOpts)
    );
    return toResponse(attachResponseHeaders(response, h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) {
    throw new Error(
      `No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return event.h3Event;
}
function getResponse() {
  const event = getH3Event();
  return event.res;
}
async function getStartManifest() {
  const { tsrStartManifest } = await import("./_tanstack-start-manifest_v-FNBe15dN.mjs");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let script = `import('${startManifest.clientEntry}')`;
  rootRoute.assets.push({
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  });
  const manifest2 = {
    routes: Object.fromEntries(
      Object.entries(startManifest.routes).flatMap(([k2, v2]) => {
        const result = {};
        let hasData = false;
        if (v2.preloads && v2.preloads.length > 0) {
          result["preloads"] = v2.preloads;
          hasData = true;
        }
        if (v2.assets && v2.assets.length > 0) {
          result["assets"] = v2.assets;
          hasData = true;
        }
        if (!hasData) {
          return [];
        }
        return [[k2, result]];
      })
    )
  };
  return manifest2;
}
const textEncoder$1 = new TextEncoder();
const EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder$1.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder$1.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams) {
  let activePumps = 1 + rawStreams.size;
  let controllerRef = null;
  let cancelled = false;
  const cancelReaders = [];
  const safeEnqueue = (chunk) => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.enqueue(chunk);
    } catch {
    }
  };
  const safeError = (err) => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.error(err);
    } catch {
    }
  };
  const safeClose = () => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.close();
    } catch {
    }
  };
  const checkComplete = () => {
    activePumps--;
    if (activePumps === 0) {
      safeClose();
    }
  };
  return new ReadableStream({
    start(controller) {
      controllerRef = controller;
      cancelReaders.length = 0;
      const pumpJSON = async () => {
        const reader = jsonStream.getReader();
        cancelReaders.push(() => {
          reader.cancel().catch(() => {
          });
        });
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (cancelled) break;
            if (done) break;
            safeEnqueue(encodeJSONFrame(value));
          }
        } catch (error) {
          safeError(error);
        } finally {
          reader.releaseLock();
          checkComplete();
        }
      };
      const pumpRawStream = async (streamId, stream) => {
        const reader = stream.getReader();
        cancelReaders.push(() => {
          reader.cancel().catch(() => {
          });
        });
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (cancelled) break;
            if (done) {
              safeEnqueue(encodeEndFrame(streamId));
              break;
            }
            safeEnqueue(encodeChunkFrame(streamId, value));
          }
        } catch (error) {
          safeEnqueue(encodeErrorFrame(streamId, error));
        } finally {
          reader.releaseLock();
          checkComplete();
        }
      };
      pumpJSON();
      for (const [streamId, stream] of rawStreams) {
        pumpRawStream(streamId, stream);
      }
    },
    cancel() {
      cancelled = true;
      controllerRef = null;
      for (const cancelReader of cancelReaders) {
        cancelReader();
      }
      cancelReaders.length = 0;
    }
  });
}
const manifest = { "c9d51a5243700889c80f82ed57a4ce74b25f188e5ebd534c9c64965dc44e8e8d": {
  functionName: "getTodos_createServerFn_handler",
  importer: () => import("./start.server-funcs-DjKTawU7.mjs")
}, "34a400ef155cae4517b50b99a6f1db6819e2090dea5a8bc25de22b442e6347a4": {
  functionName: "addTodo_createServerFn_handler",
  importer: () => import("./start.server-funcs-DjKTawU7.mjs")
}, "f74da881407a186b78a7af058df21dafb0126eb11e5a4d54fd322e8feb5038f1": {
  functionName: "getPunkSongs_createServerFn_handler",
  importer: () => import("./demo.punk-songs-k4axmk-r.mjs")
} };
async function getServerFnById(id) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = await serverFnInfo.importer();
  if (!fnModule) {
    console.info("serverFnInfo", serverFnInfo);
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    console.info("serverFnInfo", serverFnInfo);
    console.info("fnModule", fnModule);
    throw new Error(
      `Server function module export not resolved for serverFn ID: ${id}`
    );
  }
  return action;
}
let serovalPlugins = void 0;
const textEncoder = new TextEncoder();
const FORM_DATA_CONTENT_TYPES = [
  "multipart/form-data",
  "application/x-www-form-urlencoded"
];
const MAX_PAYLOAD_SIZE = 1e6;
const handleServerAction = async ({
  request,
  context,
  serverFnId
}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort);
  const method = request.method;
  const methodLower = method.toLowerCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) {
    serovalPlugins = getDefaultSerovalPlugins();
  }
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    const parsedPayload = du(payload, { plugins: serovalPlugins });
    return parsedPayload;
  }
  const response = await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          const rawStreamPlugin = createRawStreamRPCPlugin(
            (id, stream2) => {
              rawStreams.set(id, stream2);
            }
          );
          const plugins = [rawStreamPlugin, ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          $i(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          if (done && rawStreams.size === 0) {
            return new Response(
              nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0,
              {
                status: alsResponse.status,
                statusText: alsResponse.statusText,
                headers: {
                  "Content-Type": "application/json",
                  [X_TSS_SERIALIZED]: "true"
                }
              }
            );
          }
          if (rawStreams.size > 0) {
            const jsonStream = new ReadableStream({
              start(controller2) {
                callbacks.onParse = (value) => {
                  controller2.enqueue(JSON.stringify(value) + "\n");
                };
                callbacks.onDone = () => {
                  try {
                    controller2.close();
                  } catch {
                  }
                };
                callbacks.onError = (error) => controller2.error(error);
                if (nonStreamingBody !== void 0) {
                  callbacks.onParse(nonStreamingBody);
                }
              }
            });
            const multiplexedStream = createMultiplexedStream(
              jsonStream,
              rawStreams
            );
            return new Response(multiplexedStream, {
              status: alsResponse.status,
              statusText: alsResponse.statusText,
              headers: {
                "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
                [X_TSS_SERIALIZED]: "true"
              }
            });
          }
          const stream = new ReadableStream({
            start(controller2) {
              callbacks.onParse = (value) => controller2.enqueue(
                textEncoder.encode(JSON.stringify(value) + "\n")
              );
              callbacks.onDone = () => {
                try {
                  controller2.close();
                } catch (error) {
                  controller2.error(error);
                }
              };
              callbacks.onError = (error) => controller2.error(error);
              if (nonStreamingBody !== void 0) {
                callbacks.onParse(nonStreamingBody);
              }
            }
          });
          return new Response(stream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/x-ndjson",
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some(
          (type) => contentType && contentType.includes(type)
        )) {
          invariant(
            methodLower !== "get",
            "GET requests with FormData payloads are not supported"
          );
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData
          };
          if (typeof serializedContext === "string") {
            try {
              const parsedContext = JSON.parse(serializedContext);
              const deserializedContext = du(parsedContext, {
                plugins: serovalPlugins
              });
              if (typeof deserializedContext === "object" && deserializedContext) {
                params.context = safeObjectMerge(
                  context,
                  deserializedContext
                );
              }
            } catch (e) {
              if (process.env.NODE_ENV === "development") {
                console.warn("Failed to parse FormData context:", e);
              }
            }
          }
          return await action(params, signal);
        }
        if (methodLower === "get") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) {
            throw new Error("Payload too large");
          }
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(context, payload2.context);
          return await action(payload2, signal);
        }
        if (methodLower !== "post") {
          throw new Error("expected POST method");
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) {
          jsonPayload = await request.json();
        }
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        return await action(payload, signal);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) {
        res = isNotFoundResponse(res);
      }
      if (!isServerFn) {
        return unwrapped;
      }
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) {
          return unwrapped;
        }
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      if (isNotFound(error)) {
        return isNotFoundResponse(error);
      }
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(
        await Promise.resolve(
          Zi(error, {
            refs: /* @__PURE__ */ new Map(),
            plugins: serovalPlugins
          })
        )
      );
      const response2 = getResponse();
      return new Response(serializedError, {
        status: response2.status ?? 500,
        statusText: response2.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
  request.signal.removeEventListener("abort", abort);
  return response;
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
const HEADERS = {
  TSS_SHELL: "X-TSS_SHELL"
};
const createServerRpc = (functionId, splitImportFn) => {
  return Object.assign(splitImportFn, {
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v2) => {
    if (typeof v2 !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v2)) return false;
    return !!v2[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ functionId }) => ({ functionId }),
  fromSerializable: ({ functionId }) => {
    const fn2 = async (opts, signal) => {
      const serverFn = await getServerFnById(functionId);
      const result = await serverFn(opts ?? {}, signal);
      return result.result;
    };
    return createServerRpc(functionId, fn2);
  }
});
function getStartResponseHeaders(opts) {
  const headers = mergeHeaders(
    {
      "Content-Type": "text/html; charset=utf-8"
    },
    ...opts.router.state.matches.map((match) => {
      return match.headers;
    })
  );
  return headers;
}
let cachedStartEntry = null;
let cachedRouterEntry = null;
let cachedManifest = null;
async function getEntries() {
  if (cachedRouterEntry === null) {
    cachedRouterEntry = await import("./router-BiReTygo.mjs").then((n) => n.z);
  }
  if (cachedStartEntry === null) {
    cachedStartEntry = await import("./start-HYkvq4Ni.mjs");
  }
  return {
    startEntry: cachedStartEntry,
    routerEntry: cachedRouterEntry
  };
}
async function getManifest() {
  if (cachedManifest === null) {
    cachedManifest = await getStartManifest();
  }
  return cachedManifest;
}
const ROUTER_BASEPATH = "/";
const SERVER_FN_BASE = "/_serverFn/";
const IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
const IS_SHELL_ENV = process.env.TSS_SHELL === "true";
const IS_DEV = process.env.NODE_ENV === "development";
const ERR_NO_RESPONSE = IS_DEV ? `It looks like you forgot to return a response from your server route handler. If you want to defer to the app router, make sure to have a component set in this route.` : "Internal Server Error";
const ERR_NO_DEFER = IS_DEV ? `You cannot defer to the app router if there is no component defined on this route.` : "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) {
    return { response: result };
  }
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) {
        ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      }
      for (const key of Object.keys(nextCtx)) {
        if (key !== "context") {
          ctx[key] = nextCtx[key];
        }
      }
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({ ...ctx, next });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) {
        ctx.response = normalized.response;
      }
      if (normalized.context) {
        ctx.context = safeObjectMerge(ctx.context, normalized.context);
      }
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) {
    return handler;
  }
  return async (ctx) => {
    const response = await handler({ ...ctx, next: throwIfMayNotDefer });
    if (!response) {
      throwRouteHandlerError();
    }
    return response;
  };
}
function createStartHandler(cb) {
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let cbWillCleanup = false;
    try {
      const url = new URL(request.url);
      const href = url.href.replace(url.origin, "");
      const origin = getOrigin(request);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(
        flattenedRequestMiddlewares
      );
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) {
          isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        }
        const history = createMemoryHistory({
          initialEntries: [href]
        });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          ...{
            defaultSsr: requestStartOptions.defaultSsr,
            serializationAdapters: [
              ...requestStartOptions.serializationAdapters,
              ...router.options.serializationAdapters || []
            ]
          },
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) {
          throw new Error("Invalid server action param for serverFnId");
        }
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext(
            {
              getRouter,
              startOptions: requestStartOptions,
              contextAfterGlobalMiddlewares: context,
              request,
              executedRequestMiddlewares
            },
            () => handleServerAction({
              request,
              context: requestOpts?.context,
              serverFnId
            })
          );
        };
        const middlewares2 = flattenedRequestMiddlewares.map(
          (d) => d.options.server
        );
        const ctx2 = await executeMiddleware([...middlewares2, serverFnHandler], {
          request,
          context: createNullProtoObject(requestOpts?.context)
        });
        return handleRedirectResponse(ctx2.response, request, getRouter);
      }
      const executeRouter = async (serverContext) => {
        const acceptHeader = request.headers.get("Accept") || "*/*";
        const acceptParts = acceptHeader.split(",");
        const supportedMimeTypes = ["*/*", "text/html"];
        const isSupported = supportedMimeTypes.some(
          (mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType))
        );
        if (!isSupported) {
          return Response.json(
            { error: "Only HTML requests are supported here" },
            { status: 500 }
          );
        }
        const manifest2 = await getManifest();
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) {
          return routerInstance.state.redirect;
        }
        await routerInstance.serverSsr.dehydrate();
        const responseHeaders = getStartResponseHeaders({
          router: routerInstance
        });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext(
          {
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares
          },
          async () => {
            try {
              return await handleServerRoutes({
                getRouter,
                request,
                url,
                executeRouter,
                context,
                executedRequestMiddlewares
              });
            } catch (err) {
              if (err instanceof Response) {
                return err;
              }
              throw err;
            }
          }
        );
      };
      const middlewares = flattenedRequestMiddlewares.map(
        (d) => d.options.server
      );
      const ctx = await executeMiddleware(
        [...middlewares, requestHandlerMiddleware],
        { request, context: createNullProtoObject(requestOpts?.context) }
      );
      return handleRedirectResponse(ctx.response, request, getRouter);
    } finally {
      if (router && !cbWillCleanup) {
        router.serverSsr?.cleanup();
      }
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) {
    return response;
  }
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") {
      return Response.json(
        { ...response.options, isSerializedRedirect: true },
        { headers: response.headers }
      );
    }
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) {
    throw new Error(
      `Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`
    );
  }
  if (["params", "search", "hash"].some(
    (d) => typeof opts[d] === "function"
  )) {
    throw new Error(
      `Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(
        opts
      ).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`
    );
  }
  const router = await getRouter();
  const redirect2 = router.resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") {
    return Response.json(
      { ...response.options, isSerializedRedirect: true },
      { headers: response.headers }
    );
  }
  return redirect2;
}
async function handleServerRoutes({
  getRouter,
  request,
  url,
  executeRouter,
  context,
  executedRequestMiddlewares
}) {
  const router = await getRouter();
  const rewrittenUrl = executeRewriteInput(router.rewrite, url);
  const pathname = rewrittenUrl.pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m2 of flattened) {
        if (!executedRequestMiddlewares.has(m2)) {
          routeMiddlewares.push(m2.options.server);
        }
      }
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = handlers[requestMethod] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") {
        routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      } else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m2 of handlerMiddlewares) {
            routeMiddlewares.push(m2.options.server);
          }
        }
        if (handler.handler) {
          routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
        }
      }
    }
  }
  routeMiddlewares.push((ctx2) => executeRouter(ctx2.context));
  const ctx = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  });
  return ctx.response;
}
const fetch$1 = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return {
    async fetch(...args) {
      return await entry.fetch(...args);
    }
  };
}
const server = createServerEntry({ fetch: fetch$1 });
export {
  TSS_SERVER_FUNCTION as T,
  createServerRpc as a,
  createServerFn as c,
  createServerEntry,
  server as default,
  getServerFnById as g
};
