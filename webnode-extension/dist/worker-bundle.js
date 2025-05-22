(function () {
  'use strict';

  // https://bugs.chromium.org/p/chromium/issues/detail?id=825576
  // workaround: https://stackoverflow.com/questions/66546934/how-to-clear-closed-rtcpeerconnection-with-workaround
  function webrtcCleanup() {
    queueMicrotask(() => {
      console.warn("[WebRTC] doing heavy (around 50ms) GC for dangling peer connections");
      let img = document.createElement("img");
      img.src = window.URL.createObjectURL(new Blob([new ArrayBuffer(5e+7)])); // 50Mo or less or more depending as you wish to force/invoke GC cycle run
      img.onerror = function() {
        window.URL.revokeObjectURL(this.src);
        img = null;
      };
    });
  }

  function schedulePeriodicWebrtcCleanup() {
    setInterval(webrtcCleanup, 60 * 1000);
  }

  var __wbg_star0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    webrtcCleanup: webrtcCleanup,
    schedulePeriodicWebrtcCleanup: schedulePeriodicWebrtcCleanup
  });

  function load_module_workers_polyfill() {
      if(Worker._$P !== true) {
          let polyfill = "!function(e){if(!e||!0!==e._$P){if(e){var n,r=Object.defineProperty({},\"type\",{get:function(){n=!0}});try{var t=URL.createObjectURL(new Blob([\"\"],{type:\"text/javascript\"}));new e(t,r).terminate(),URL.revokeObjectURL(t)}catch(e){}if(!n)try{new e(\"data:text/javascript,\",r).terminate()}catch(e){}if(n)return;(self.Worker=function(n,r){return r&&\"module\"==r.type&&(r={name:n+\"\\n\"+(r.name||\"\")},n=\"undefined\"==typeof document?location.href:document.currentScript&&document.currentScript.src||(new Error).stack.match(/[(@]((file|https?):\\/\\/[^)]+?):\\d+(:\\d+)?(?:\\)|$)/m)[1]),new e(n,r)})._$P=!0}\"undefined\"==typeof document&&function(){var e={},n={};function r(e,n){for(n=n.replace(/^(\\.\\.\\/|\\.\\/)/,e.replace(/[^/]+$/g,\"\")+\"$1\");n!==(n=n.replace(/[^/]+\\/\\.\\.\\//g,\"\")););return n.replace(/\\.\\//g,\"\")}var t=[],s=t.push.bind(t);addEventListener(\"message\",s);var a=self.name.match(/^[^\\n]+/)[0];self.name=self.name.replace(/^[^\\n]*\\n/g,\"\"),function t(s,a){var u,o=s;return a&&(s=r(a,s)),e[s]||(e[s]=fetch(s).then((function(a){if((o=a.url)!==s){if(null!=e[o])return e[o];e[o]=e[s]}return a.text().then((function(e){if(!a.ok)throw e;var c={exports:{}};u=n[o]||(n[o]=c.exports);var i=function(e){return t(e,o)},f=[];return e=function(e,n){n=n||[];var r,t=[],a=0;function u(e,n){for(var s,a=/(?:^|,)\\s*([\\w$]+)(?:\\s+as\\s+([\\w$]+))?\\s*/g,u=[];s=a.exec(e);)n?t.push((s[2]||s[1])+\":\"+s[1]):u.push((s[2]||s[1])+\"=\"+r+\".\"+s[1]);return u}return(e=e.replace(/(^\\s*|[;}\\s\\n]\\s*)import\\s*(?:(?:([\\w$]+)(?:\\s*\\,\\s*\\{([^}]+)\\})?|(?:\\*\\s*as\\s+([\\w$]+))|\\{([^}]*)\\})\\s*from)?\\s*(['\"])(.+?)\\6/g,(function(e,t,s,o,c,i,f,p){return n.push(p),t+=\"var \"+(r=\"$im$\"+ ++a)+\"=$require(\"+f+p+f+\")\",s&&(t+=\";var \"+s+\" = 'default' in \"+r+\" ? \"+r+\".default : \"+r),c&&(t+=\";var \"+c+\" = \"+r),(o=o||i)&&(t+=\";var \"+u(o,!1)),t})).replace(/((?:^|[;}\\s\\n])\\s*)export\\s*(?:\\s+(default)\\s+|((?:async\\s+)?function\\s*\\*?|class|const\\s|let\\s|var\\s)\\s*([a-zA-Z0-9$_{[]+))/g,(function(e,n,r,s,u){if(r){var o=\"$im$\"+ ++a;return t.push(\"default:\"+o),n+\"var \"+o+\"=\"}return t.push(u+\":\"+u),n+s+\" \"+u})).replace(/((?:^|[;}\\s\\n])\\s*)export\\s*\\{([^}]+)\\}\\s*;?/g,(function(e,n,r){return u(r,!0),n})).replace(/((?:^|[^a-zA-Z0-9$_@`'\".])\\s*)(import\\s*\\([\\s\\S]+?\\))/g,\"$1$$$2\")).replace(/((?:^|[^a-zA-Z0-9$_@`'\".])\\s*)import\\.meta\\.url/g,\"$1\"+JSON.stringify(s))+\"\\n$module.exports={\"+t.join(\",\")+\"}\"}(e,f),Promise.all(f.map((function(e){var s=r(o,e);return s in n?n[s]:t(s)}))).then((function(n){e+=\"\\n//# sourceURL=\"+s;try{var r=new Function(\"$import\",\"$require\",\"$module\",\"$exports\",e)}catch(n){var t=n.line-1,a=n.column,o=e.split(\"\\n\"),p=(o[t-2]||\"\")+\"\\n\"+o[t-1]+\"\\n\"+(null==a?\"\":new Array(a).join(\"-\")+\"^\\n\")+(o[t]||\"\"),l=new Error(n.message+\"\\n\\n\"+p,s,t);throw l.sourceURL=l.fileName=s,l.line=t,l.column=a,l}var m=r(i,(function(e){return n[f.indexOf(e)]}),c,c.exports);return null!=m&&(c.exports=m),Object.assign(u,c.exports),c.exports}))}))})))}(a).then((function(){removeEventListener(\"message\",s),t.map(dispatchEvent)})).catch((function(e){setTimeout((function(){throw e}))}))}()}}(self.Worker);";
          let blob = new Blob([polyfill], { type: 'text/javascript' });
          let blobUrl = URL.createObjectURL(blob);
          !function(e){if(!e||!0!==e._$P){if(e){var n,r=Object.defineProperty({},"type",{get:function(){n=!0;}});try{var t=URL.createObjectURL(new Blob([""],{type:"text/javascript"}));new e(t,r).terminate(),URL.revokeObjectURL(t);}catch(e){}if(!n)try{new e("data:text/javascript,",r).terminate();}catch(e){}if(n)return;(self.Worker=function(n,r){return r&&"module"==r.type&&(r={name:n+"\n"+(r.name||"")},n=blobUrl),new e(n,r)})._$P=!0;}"undefined"==typeof document&&function(){var e={},n={};function r(e,n){for(n=n.replace(/^(\.\.\/|\.\/)/,e.replace(/[^/]+$/g,"")+"$1");n!==(n=n.replace(/[^/]+\/\.\.\//g,"")););return n.replace(/\.\//g,"")}var t=[],s=t.push.bind(t);addEventListener("message",s);var a=self.name.match(/^[^\n]+/)[0];self.name=self.name.replace(/^[^\n]*\n/g,""),function t(s,a){var u,o=s;return a&&(s=r(a,s)),e[s]||(e[s]=fetch(s).then((function(a){if((o=a.url)!==s){if(null!=e[o])return e[o];e[o]=e[s];}return a.text().then((function(e){if(!a.ok)throw e;var c={exports:{}};u=n[o]||(n[o]=c.exports);var i=function(e){return t(e,o)},f=[];return e=function(e,n){n=n||[];var r,t=[],a=0;function u(e,n){for(var s,a=/(?:^|,)\s*([\w$]+)(?:\s+as\s+([\w$]+))?\s*/g,u=[];s=a.exec(e);)n?t.push((s[2]||s[1])+":"+s[1]):u.push((s[2]||s[1])+"="+r+"."+s[1]);return u}return (e=e.replace(/(^\s*|[;}\s\n]\s*)import\s*(?:(?:([\w$]+)(?:\s*\,\s*\{([^}]+)\})?|(?:\*\s*as\s+([\w$]+))|\{([^}]*)\})\s*from)?\s*(['"])(.+?)\6/g,(function(e,t,s,o,c,i,f,p){return n.push(p),t+="var "+(r="$im$"+ ++a)+"=$require("+f+p+f+")",s&&(t+=";var "+s+" = 'default' in "+r+" ? "+r+".default : "+r),c&&(t+=";var "+c+" = "+r),(o=o||i)&&(t+=";var "+u(o,!1)),t})).replace(/((?:^|[;}\s\n])\s*)export\s*(?:\s+(default)\s+|((?:async\s+)?function\s*\*?|class|const\s|let\s|var\s)\s*([a-zA-Z0-9$_{[]+))/g,(function(e,n,r,s,u){if(r){var o="$im$"+ ++a;return t.push("default:"+o),n+"var "+o+"="}return t.push(u+":"+u),n+s+" "+u})).replace(/((?:^|[;}\s\n])\s*)export\s*\{([^}]+)\}\s*;?/g,(function(e,n,r){return u(r,!0),n})).replace(/((?:^|[^a-zA-Z0-9$_@`'".])\s*)(import\s*\([\s\S]+?\))/g,"$1$$$2")).replace(/((?:^|[^a-zA-Z0-9$_@`'".])\s*)import\.meta\.url/g,"$1"+JSON.stringify(s))+"\n$module.exports={"+t.join(",")+"}"}(e,f),Promise.all(f.map((function(e){var s=r(o,e);return s in n?n[s]:t(s)}))).then((function(n){e+="\n//# sourceURL="+s;try{var r=new Function("$import","$require","$module","$exports",e);}catch(n){var t=n.line-1,a=n.column,o=e.split("\n"),p=(o[t-2]||"")+"\n"+o[t-1]+"\n"+(null==a?"":new Array(a).join("-")+"^\n")+(o[t]||""),l=new Error(n.message+"\n\n"+p,s,t);throw l.sourceURL=l.fileName=s,l.line=t,l.column=a,l}var m=r(i,(function(e){return n[f.indexOf(e)]}),c,c.exports);return null!=m&&(c.exports=m),Object.assign(u,c.exports),c.exports}))}))})))}(a).then((function(){removeEventListener("message",s),t.map(dispatchEvent);})).catch((function(e){setTimeout((function(){throw e}));}));}();}}(self.Worker);
      }
  }

  var __wbg_star1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    load_module_workers_polyfill: load_module_workers_polyfill
  });

  let wasm;

  function addToExternrefTable0(obj) {
      const idx = wasm.__externref_table_alloc();
      wasm.__wbindgen_export_2.set(idx, obj);
      return idx;
  }

  function handleError(f, args) {
      try {
          return f.apply(this, args);
      } catch (e) {
          const idx = addToExternrefTable0(e);
          wasm.__wbindgen_exn_store(idx);
      }
  }

  const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

  if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
  let cachedUint8ArrayMemory0 = null;

  function getUint8ArrayMemory0() {
      if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
          cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
      }
      return cachedUint8ArrayMemory0;
  }

  function getStringFromWasm0(ptr, len) {
      ptr = ptr >>> 0;
      return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
  }

  let WASM_VECTOR_LEN = 0;

  const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

  const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
      ? function (arg, view) {
      return cachedTextEncoder.encodeInto(arg, view);
  }
      : function (arg, view) {
      const buf = cachedTextEncoder.encode(arg);
      view.set(buf);
      return {
          read: arg.length,
          written: buf.length
      };
  });

  function passStringToWasm0(arg, malloc, realloc) {

      if (realloc === undefined) {
          const buf = cachedTextEncoder.encode(arg);
          const ptr = malloc(buf.length, 1) >>> 0;
          getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
          WASM_VECTOR_LEN = buf.length;
          return ptr;
      }

      let len = arg.length;
      let ptr = malloc(len, 1) >>> 0;

      const mem = getUint8ArrayMemory0();

      let offset = 0;

      for (; offset < len; offset++) {
          const code = arg.charCodeAt(offset);
          if (code > 0x7F) break;
          mem[ptr + offset] = code;
      }

      if (offset !== len) {
          if (offset !== 0) {
              arg = arg.slice(offset);
          }
          ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
          const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
          const ret = encodeString(arg, view);

          offset += ret.written;
          ptr = realloc(ptr, len, offset, 1) >>> 0;
      }

      WASM_VECTOR_LEN = offset;
      return ptr;
  }

  let cachedDataViewMemory0 = null;

  function getDataViewMemory0() {
      if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
          cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
      }
      return cachedDataViewMemory0;
  }

  function isLikeNone(x) {
      return x === undefined || x === null;
  }

  const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(state => {
      wasm.__wbindgen_export_6.get(state.dtor)(state.a, state.b);
  });

  function makeMutClosure(arg0, arg1, dtor, f) {
      const state = { a: arg0, b: arg1, cnt: 1, dtor };
      const real = (...args) => {
          // First up with a closure we increment the internal reference
          // count. This ensures that the Rust closure environment won't
          // be deallocated while we're invoking it.
          state.cnt++;
          const a = state.a;
          state.a = 0;
          try {
              return f(a, state.b, ...args);
          } finally {
              if (--state.cnt === 0) {
                  wasm.__wbindgen_export_6.get(state.dtor)(a, state.b);
                  CLOSURE_DTORS.unregister(state);
              } else {
                  state.a = a;
              }
          }
      };
      real.original = state;
      CLOSURE_DTORS.register(real, state, state);
      return real;
  }

  function debugString(val) {
      // primitive types
      const type = typeof val;
      if (type == 'number' || type == 'boolean' || val == null) {
          return  `${val}`;
      }
      if (type == 'string') {
          return `"${val}"`;
      }
      if (type == 'symbol') {
          const description = val.description;
          if (description == null) {
              return 'Symbol';
          } else {
              return `Symbol(${description})`;
          }
      }
      if (type == 'function') {
          const name = val.name;
          if (typeof name == 'string' && name.length > 0) {
              return `Function(${name})`;
          } else {
              return 'Function';
          }
      }
      // objects
      if (Array.isArray(val)) {
          const length = val.length;
          let debug = '[';
          if (length > 0) {
              debug += debugString(val[0]);
          }
          for(let i = 1; i < length; i++) {
              debug += ', ' + debugString(val[i]);
          }
          debug += ']';
          return debug;
      }
      // Test for built-in
      const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
      let className;
      if (builtInMatches && builtInMatches.length > 1) {
          className = builtInMatches[1];
      } else {
          // Failed to match the standard '[object ClassName]'
          return toString.call(val);
      }
      if (className == 'Object') {
          // we're a user defined class or Object
          // JSON.stringify avoids problems with cycles, and is generally much
          // easier than looping through ownProperties of `val`.
          try {
              return 'Object(' + JSON.stringify(val) + ')';
          } catch (_) {
              return 'Object';
          }
      }
      // errors
      if (val instanceof Error) {
          return `${val.name}: ${val.message}\n${val.stack}`;
      }
      // TODO we could test for more things here, like `Set`s and `Map`s.
      return className;
  }
  /**
   * Automatically run after wasm is loaded.
   */
  function main() {
      wasm.main();
  }

  /**
   * @returns {any}
   */
  function build_env() {
      const ret = wasm.build_env();
      return ret;
  }

  /**
   * @param {any} block_producer
   * @param {string | undefined} [seed_nodes_url]
   * @param {string | undefined} [genesis_config_url]
   * @returns {Promise<RpcSender>}
   */
  function run(block_producer, seed_nodes_url, genesis_config_url) {
      var ptr0 = isLikeNone(seed_nodes_url) ? 0 : passStringToWasm0(seed_nodes_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      var ptr1 = isLikeNone(genesis_config_url) ? 0 : passStringToWasm0(genesis_config_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      const ret = wasm.run(block_producer, ptr0, len0, ptr1, len1);
      return ret;
  }

  /**
   * Entry point for web workers
   * @param {number} ptr
   */
  function wasm_thread_entry_point(ptr) {
      wasm.wasm_thread_entry_point(ptr);
  }

  function __wbg_adapter_38(arg0, arg1, arg2) {
      wasm.closure182_externref_shim(arg0, arg1, arg2);
  }

  function __wbg_adapter_41(arg0, arg1) {
      wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf3ca83353bc1791d(arg0, arg1);
  }

  function __wbg_adapter_44(arg0, arg1) {
      wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hebd9022714556fe5(arg0, arg1);
  }

  function __wbg_adapter_47(arg0, arg1, arg2) {
      wasm.closure6377_externref_shim(arg0, arg1, arg2);
  }

  function __wbg_adapter_50(arg0, arg1, arg2) {
      wasm.closure6398_externref_shim(arg0, arg1, arg2);
  }

  function __wbg_adapter_246(arg0, arg1, arg2, arg3) {
      wasm.closure6419_externref_shim(arg0, arg1, arg2, arg3);
  }

  const __wbindgen_enum_RtcIceGatheringState = ["new", "gathering", "complete"];

  const __wbindgen_enum_RtcIceTransportPolicy = ["relay", "all"];

  const __wbindgen_enum_RtcPeerConnectionState = ["closed", "failed", "disconnected", "new", "connecting", "connected"];

  const __wbindgen_enum_RtcSdpType = ["offer", "pranswer", "answer", "rollback"];

  const __wbindgen_enum_WorkerType = ["classic", "module"];

  const LedgerFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_ledger_free(ptr >>> 0, 1));

  class Ledger {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(Ledger.prototype);
          obj.__wbg_ptr = ptr;
          LedgerFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          LedgerFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_ledger_free(ptr, 0);
      }
      /**
       * @returns {LedgerSelected}
       */
      latest() {
          const ret = wasm.ledger_latest(this.__wbg_ptr);
          return LedgerSelected.__wrap(ret);
      }
  }

  const LedgerAccountsFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_ledgeraccounts_free(ptr >>> 0, 1));

  class LedgerAccounts {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(LedgerAccounts.prototype);
          obj.__wbg_ptr = ptr;
          LedgerAccountsFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          LedgerAccountsFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_ledgeraccounts_free(ptr, 0);
      }
      /**
       * @returns {Promise<any>}
       */
      all() {
          const ret = wasm.ledgeraccounts_all(this.__wbg_ptr);
          return ret;
      }
  }

  const LedgerSelectedFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_ledgerselected_free(ptr >>> 0, 1));

  class LedgerSelected {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(LedgerSelected.prototype);
          obj.__wbg_ptr = ptr;
          LedgerSelectedFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          LedgerSelectedFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_ledgerselected_free(ptr, 0);
      }
      /**
       * @returns {LedgerAccounts}
       */
      accounts() {
          const ret = wasm.ledgerselected_accounts(this.__wbg_ptr);
          return LedgerAccounts.__wrap(ret);
      }
  }

  const RpcSenderFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_rpcsender_free(ptr >>> 0, 1));

  class RpcSender {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(RpcSender.prototype);
          obj.__wbg_ptr = ptr;
          RpcSenderFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          RpcSenderFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_rpcsender_free(ptr, 0);
      }
      /**
       * @returns {State}
       */
      state() {
          const ret = wasm.rpcsender_state(this.__wbg_ptr);
          return State.__wrap(ret);
      }
      /**
       * @returns {Stats}
       */
      stats() {
          const ret = wasm.rpcsender_ledger(this.__wbg_ptr);
          return Stats.__wrap(ret);
      }
      /**
       * @returns {TransactionPool}
       */
      transaction_pool() {
          const ret = wasm.rpcsender_ledger(this.__wbg_ptr);
          return TransactionPool.__wrap(ret);
      }
      /**
       * @returns {TransitionFrontier}
       */
      transition_frontier() {
          const ret = wasm.rpcsender_state(this.__wbg_ptr);
          return TransitionFrontier.__wrap(ret);
      }
      /**
       * @returns {Ledger}
       */
      ledger() {
          const ret = wasm.rpcsender_ledger(this.__wbg_ptr);
          return Ledger.__wrap(ret);
      }
      /**
       * @returns {Promise<any>}
       */
      status() {
          const ret = wasm.rpcsender_status(this.__wbg_ptr);
          return ret;
      }
      /**
       * @returns {Promise<any>}
       */
      make_heartbeat() {
          const ret = wasm.rpcsender_make_heartbeat(this.__wbg_ptr);
          return ret;
      }
  }

  const StateFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_state_free(ptr >>> 0, 1));

  class State {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(State.prototype);
          obj.__wbg_ptr = ptr;
          StateFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          StateFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_state_free(ptr, 0);
      }
      /**
       * @param {string} filter
       * @returns {Promise<any>}
       */
      get(filter) {
          const ptr0 = passStringToWasm0(filter, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len0 = WASM_VECTOR_LEN;
          const ret = wasm.state_get(this.__wbg_ptr, ptr0, len0);
          return ret;
      }
      /**
       * @returns {Promise<any>}
       */
      peers() {
          const ret = wasm.state_peers(this.__wbg_ptr);
          return ret;
      }
      /**
       * @returns {Promise<any>}
       */
      message_progress() {
          const ret = wasm.state_message_progress(this.__wbg_ptr);
          return ret;
      }
  }

  const StatsFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_stats_free(ptr >>> 0, 1));

  class Stats {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(Stats.prototype);
          obj.__wbg_ptr = ptr;
          StatsFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          StatsFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_stats_free(ptr, 0);
      }
      /**
       * @param {any} id
       * @returns {Promise<any>}
       */
      actions(id) {
          const ret = wasm.stats_actions(this.__wbg_ptr, id);
          return ret;
      }
      /**
       * @param {number | undefined} [limit]
       * @returns {Promise<any>}
       */
      sync(limit) {
          const ret = wasm.stats_sync(this.__wbg_ptr, isLikeNone(limit) ? 0x100000001 : (limit) >>> 0);
          return ret;
      }
      /**
       * @returns {Promise<any>}
       */
      block_producer() {
          const ret = wasm.stats_block_producer(this.__wbg_ptr);
          return ret;
      }
  }

  const TransactionPoolFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_transactionpool_free(ptr >>> 0, 1));

  class TransactionPool {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(TransactionPool.prototype);
          obj.__wbg_ptr = ptr;
          TransactionPoolFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          TransactionPoolFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_transactionpool_free(ptr, 0);
      }
      /**
       * @returns {TransactionPoolInject}
       */
      inject() {
          const ret = wasm.transactionpool_inject(this.__wbg_ptr);
          return TransactionPoolInject.__wrap(ret);
      }
      /**
       * @returns {Promise<any>}
       */
      get() {
          const ret = wasm.transactionpool_get(this.__wbg_ptr);
          return ret;
      }
  }

  const TransactionPoolInjectFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_transactionpoolinject_free(ptr >>> 0, 1));

  class TransactionPoolInject {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(TransactionPoolInject.prototype);
          obj.__wbg_ptr = ptr;
          TransactionPoolInjectFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          TransactionPoolInjectFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_transactionpoolinject_free(ptr, 0);
      }
      /**
       * @param {any} payments
       * @returns {Promise<any>}
       */
      payment(payments) {
          const ret = wasm.transactionpoolinject_payment(this.__wbg_ptr, payments);
          return ret;
      }
  }

  const TransitionFrontierFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_transitionfrontier_free(ptr >>> 0, 1));

  class TransitionFrontier {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(TransitionFrontier.prototype);
          obj.__wbg_ptr = ptr;
          TransitionFrontierFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          TransitionFrontierFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_transitionfrontier_free(ptr, 0);
      }
      /**
       * @returns {TransitionFrontierBestChain}
       */
      best_chain() {
          const ret = wasm.transitionfrontier_best_chain(this.__wbg_ptr);
          return TransitionFrontierBestChain.__wrap(ret);
      }
  }

  const TransitionFrontierBestChainFinalization = (typeof FinalizationRegistry === 'undefined')
      ? { register: () => {}, unregister: () => {} }
      : new FinalizationRegistry(ptr => wasm.__wbg_transitionfrontierbestchain_free(ptr >>> 0, 1));

  class TransitionFrontierBestChain {

      static __wrap(ptr) {
          ptr = ptr >>> 0;
          const obj = Object.create(TransitionFrontierBestChain.prototype);
          obj.__wbg_ptr = ptr;
          TransitionFrontierBestChainFinalization.register(obj, obj.__wbg_ptr, obj);
          return obj;
      }

      __destroy_into_raw() {
          const ptr = this.__wbg_ptr;
          this.__wbg_ptr = 0;
          TransitionFrontierBestChainFinalization.unregister(this);
          return ptr;
      }

      free() {
          const ptr = this.__destroy_into_raw();
          wasm.__wbg_transitionfrontierbestchain_free(ptr, 0);
      }
      /**
       * @returns {Promise<any>}
       */
      user_commands() {
          const ret = wasm.transitionfrontierbestchain_user_commands(this.__wbg_ptr);
          return ret;
      }
  }

  async function __wbg_load(module, imports) {
      if (typeof Response === 'function' && module instanceof Response) {
          if (typeof WebAssembly.instantiateStreaming === 'function') {
              try {
                  return await WebAssembly.instantiateStreaming(module, imports);

              } catch (e) {
                  if (module.headers.get('Content-Type') != 'application/wasm') {
                      console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                  } else {
                      throw e;
                  }
              }
          }

          const bytes = await module.arrayBuffer();
          return await WebAssembly.instantiate(bytes, imports);

      } else {
          const instance = await WebAssembly.instantiate(module, imports);

          if (instance instanceof WebAssembly.Instance) {
              return { instance, module };

          } else {
              return instance;
          }
      }
  }

  function __wbg_get_imports() {
      const imports = {};
      imports.wbg = {};
      imports.wbg.__wbg_arrayBuffer_d0ca2ad8bda0039b = function() { return handleError(function (arg0) {
          const ret = arg0.arrayBuffer();
          return ret;
      }, arguments) };
      imports.wbg.__wbg_at_479807bfddde3a33 = function(arg0, arg1) {
          const ret = arg0.at(arg1);
          return ret;
      };
      imports.wbg.__wbg_buffer_61b7ce01341d7f88 = function(arg0) {
          const ret = arg0.buffer;
          return ret;
      };
      imports.wbg.__wbg_buffer_dc5dbfa8d5fb28cf = function(arg0) {
          const ret = arg0.buffer;
          return ret;
      };
      imports.wbg.__wbg_call_500db948e69c7330 = function() { return handleError(function (arg0, arg1, arg2) {
          const ret = arg0.call(arg1, arg2);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_call_b0d8e36992d9900d = function() { return handleError(function (arg0, arg1) {
          const ret = arg0.call(arg1);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_clearTimeout_5a54f8841c30079a = function(arg0) {
          const ret = clearTimeout(arg0);
          return ret;
      };
      imports.wbg.__wbg_close_80ce50bd282db748 = function(arg0) {
          arg0.close();
      };
      imports.wbg.__wbg_close_9a6122c0c6e33079 = function(arg0) {
          arg0.close();
      };
      imports.wbg.__wbg_connectionState_c2af96f7b9c346c1 = function(arg0) {
          const ret = arg0.connectionState;
          return (__wbindgen_enum_RtcPeerConnectionState.indexOf(ret) + 1 || 7) - 1;
      };
      imports.wbg.__wbg_createAnswer_9f830cf62287290e = function(arg0) {
          const ret = arg0.createAnswer();
          return ret;
      };
      imports.wbg.__wbg_createDataChannel_b0e7ba0ee7551b66 = function(arg0, arg1, arg2, arg3) {
          const ret = arg0.createDataChannel(getStringFromWasm0(arg1, arg2), arg3);
          return ret;
      };
      imports.wbg.__wbg_createObjectURL_296ad2113ed20fe0 = function() { return handleError(function (arg0, arg1) {
          const ret = URL.createObjectURL(arg1);
          const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len1 = WASM_VECTOR_LEN;
          getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      }, arguments) };
      imports.wbg.__wbg_createOffer_77d10ea157cc1bae = function(arg0) {
          const ret = arg0.createOffer();
          return ret;
      };
      imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
          const ret = arg0.crypto;
          return ret;
      };
      imports.wbg.__wbg_data_4ce8a82394d8b110 = function(arg0) {
          const ret = arg0.data;
          return ret;
      };
      imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
          let deferred0_0;
          let deferred0_1;
          try {
              deferred0_0 = arg0;
              deferred0_1 = arg1;
              console.error(getStringFromWasm0(arg0, arg1));
          } finally {
              wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
          }
      };
      imports.wbg.__wbg_eval_cd0c386c3899dd07 = function() { return handleError(function (arg0, arg1) {
          const ret = eval(getStringFromWasm0(arg0, arg1));
          return ret;
      }, arguments) };
      imports.wbg.__wbg_fetch_6a5bc16a35f71316 = function(arg0, arg1, arg2) {
          const ret = arg0.fetch(getStringFromWasm0(arg1, arg2));
          return ret;
      };
      imports.wbg.__wbg_fetch_e26fdd92ea39f634 = function(arg0, arg1) {
          const ret = arg0.fetch(arg1);
          return ret;
      };
      imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() { return handleError(function (arg0, arg1) {
          arg0.getRandomValues(arg1);
      }, arguments) };
      imports.wbg.__wbg_get_bbccf8970793c087 = function() { return handleError(function (arg0, arg1) {
          const ret = Reflect.get(arg0, arg1);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_hardwareConcurrency_3e5ff420fa6ab679 = function(arg0) {
          const ret = arg0.hardwareConcurrency;
          return ret;
      };
      imports.wbg.__wbg_hardwareConcurrency_6845a8ede39f7371 = function(arg0) {
          const ret = arg0.hardwareConcurrency;
          return ret;
      };
      imports.wbg.__wbg_headers_786276f5fbbdb28a = function(arg0) {
          const ret = arg0.headers;
          return ret;
      };
      imports.wbg.__wbg_iceGatheringState_272d259248e39488 = function(arg0) {
          const ret = arg0.iceGatheringState;
          return (__wbindgen_enum_RtcIceGatheringState.indexOf(ret) + 1 || 4) - 1;
      };
      imports.wbg.__wbg_instanceof_ArrayBuffer_670ddde44cdb2602 = function(arg0) {
          let result;
          try {
              result = arg0 instanceof ArrayBuffer;
          } catch (_) {
              result = false;
          }
          const ret = result;
          return ret;
      };
      imports.wbg.__wbg_instanceof_DedicatedWorkerGlobalScope_8b4095b33f785a6a = function(arg0) {
          let result;
          try {
              result = arg0 instanceof DedicatedWorkerGlobalScope;
          } catch (_) {
              result = false;
          }
          const ret = result;
          return ret;
      };
      imports.wbg.__wbg_instanceof_Response_d3453657e10c4300 = function(arg0) {
          let result;
          try {
              result = arg0 instanceof Response;
          } catch (_) {
              result = false;
          }
          const ret = result;
          return ret;
      };
      imports.wbg.__wbg_instanceof_Window_d2514c6a7ee7ba60 = function(arg0) {
          let result;
          try {
              result = arg0 instanceof Window;
          } catch (_) {
              result = false;
          }
          const ret = result;
          return ret;
      };
      imports.wbg.__wbg_instanceof_WorkerGlobalScope_b32c94246142a6a7 = function(arg0) {
          let result;
          try {
              result = arg0 instanceof WorkerGlobalScope;
          } catch (_) {
              result = false;
          }
          const ret = result;
          return ret;
      };
      imports.wbg.__wbg_json_2c755d0be3f5cc5c = function() { return handleError(function (arg0) {
          const ret = arg0.json();
          return ret;
      }, arguments) };
      imports.wbg.__wbg_length_65d1cd11729ced11 = function(arg0) {
          const ret = arg0.length;
          return ret;
      };
      imports.wbg.__wbg_localDescription_ac6bdbde1834d62e = function(arg0) {
          const ret = arg0.localDescription;
          return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      };
      imports.wbg.__wbg_log_0cc1b7768397bcfe = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
          let deferred0_0;
          let deferred0_1;
          try {
              deferred0_0 = arg0;
              deferred0_1 = arg1;
              console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
          } finally {
              wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
          }
      };
      imports.wbg.__wbg_log_cb9e190acc5753fb = function(arg0, arg1) {
          let deferred0_0;
          let deferred0_1;
          try {
              deferred0_0 = arg0;
              deferred0_1 = arg1;
              console.log(getStringFromWasm0(arg0, arg1));
          } finally {
              wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
          }
      };
      imports.wbg.__wbg_mark_7438147ce31e9d4b = function(arg0, arg1) {
          performance.mark(getStringFromWasm0(arg0, arg1));
      };
      imports.wbg.__wbg_measure_fb7825c11612c823 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
          let deferred0_0;
          let deferred0_1;
          let deferred1_0;
          let deferred1_1;
          try {
              deferred0_0 = arg0;
              deferred0_1 = arg1;
              deferred1_0 = arg2;
              deferred1_1 = arg3;
              performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
          } finally {
              wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
              wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
          }
      }, arguments) };
      imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
          const ret = arg0.msCrypto;
          return ret;
      };
      imports.wbg.__wbg_navigator_0fe968937104eaa7 = function(arg0) {
          const ret = arg0.navigator;
          return ret;
      };
      imports.wbg.__wbg_navigator_d6db0fcbd7865e08 = function(arg0) {
          const ret = arg0.navigator;
          return ret;
      };
      imports.wbg.__wbg_new_254fa9eac11932ae = function() {
          const ret = new Array();
          return ret;
      };
      imports.wbg.__wbg_new_3d446df9155128ef = function(arg0, arg1) {
          try {
              var state0 = {a: arg0, b: arg1};
              var cb0 = (arg0, arg1) => {
                  const a = state0.a;
                  state0.a = 0;
                  try {
                      return __wbg_adapter_246(a, state0.b, arg0, arg1);
                  } finally {
                      state0.a = a;
                  }
              };
              const ret = new Promise(cb0);
              return ret;
          } finally {
              state0.a = state0.b = 0;
          }
      };
      imports.wbg.__wbg_new_3ff5b33b1ce712df = function(arg0) {
          const ret = new Uint8Array(arg0);
          return ret;
      };
      imports.wbg.__wbg_new_688846f374351c92 = function() {
          const ret = new Object();
          return ret;
      };
      imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
          const ret = new Error();
          return ret;
      };
      imports.wbg.__wbg_newnoargs_fd9e4bf8be2bc16d = function(arg0, arg1) {
          const ret = new Function(getStringFromWasm0(arg0, arg1));
          return ret;
      };
      imports.wbg.__wbg_newwithbyteoffsetandlength_ba35896968751d91 = function(arg0, arg1, arg2) {
          const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
          return ret;
      };
      imports.wbg.__wbg_newwithconfiguration_496479cef0f6908f = function() { return handleError(function (arg0) {
          const ret = new RTCPeerConnection(arg0);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_newwithlength_34ce8f1051e74449 = function(arg0) {
          const ret = new Uint8Array(arg0 >>> 0);
          return ret;
      };
      imports.wbg.__wbg_newwithoptions_338c6ca5006e787c = function() { return handleError(function (arg0, arg1, arg2) {
          const ret = new Worker(getStringFromWasm0(arg0, arg1), arg2);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_newwithstr_6dc08c9fc8762dbd = function() { return handleError(function (arg0, arg1) {
          const ret = new Request(getStringFromWasm0(arg0, arg1));
          return ret;
      }, arguments) };
      imports.wbg.__wbg_newwithstrsequence_fe28ae28f5a8acfc = function() { return handleError(function (arg0) {
          const ret = new Blob(arg0);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
          const ret = arg0.node;
          return ret;
      };
      imports.wbg.__wbg_now_62a101fe35b60230 = function(arg0) {
          const ret = arg0.now();
          return ret;
      };
      imports.wbg.__wbg_now_64d0bb151e5d3889 = function() {
          const ret = Date.now();
          return ret;
      };
      imports.wbg.__wbg_parse_161c68378e086ae1 = function() { return handleError(function (arg0, arg1) {
          const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
          return ret;
      }, arguments) };
      imports.wbg.__wbg_postMessage_6fd166b24db78adf = function() { return handleError(function (arg0, arg1) {
          arg0.postMessage(arg1);
      }, arguments) };
      imports.wbg.__wbg_postMessage_f648f854fd6c3f80 = function() { return handleError(function (arg0, arg1) {
          arg0.postMessage(arg1);
      }, arguments) };
      imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
          const ret = arg0.process;
          return ret;
      };
      imports.wbg.__wbg_push_6edad0df4b546b2c = function(arg0, arg1) {
          const ret = arg0.push(arg1);
          return ret;
      };
      imports.wbg.__wbg_queueMicrotask_2181040e064c0dc8 = function(arg0) {
          queueMicrotask(arg0);
      };
      imports.wbg.__wbg_queueMicrotask_ef9ac43769cbcc4f = function(arg0) {
          const ret = arg0.queueMicrotask;
          return ret;
      };
      imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() { return handleError(function (arg0, arg1) {
          arg0.randomFillSync(arg1);
      }, arguments) };
      imports.wbg.__wbg_random_a435d21390634bdf = function() {
          const ret = Math.random();
          return ret;
      };
      imports.wbg.__wbg_require_79b1e9274cde3c87 = function() { return handleError(function () {
          const ret = module.require;
          return ret;
      }, arguments) };
      imports.wbg.__wbg_resolve_0bf7c44d641804f9 = function(arg0) {
          const ret = Promise.resolve(arg0);
          return ret;
      };
      imports.wbg.__wbg_rpcsender_new = function(arg0) {
          const ret = RpcSender.__wrap(arg0);
          return ret;
      };
      imports.wbg.__wbg_sdp_b6dd8078e5da25d1 = function(arg0, arg1) {
          const ret = arg1.sdp;
          const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len1 = WASM_VECTOR_LEN;
          getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      };
      imports.wbg.__wbg_send_65168d5682ffdb7f = function() { return handleError(function (arg0, arg1) {
          arg0.send(arg1);
      }, arguments) };
      imports.wbg.__wbg_setLocalDescription_b788ec2fd0674a96 = function(arg0, arg1) {
          const ret = arg0.setLocalDescription(arg1);
          return ret;
      };
      imports.wbg.__wbg_setRemoteDescription_d669d99de7807ea2 = function(arg0, arg1) {
          const ret = arg0.setRemoteDescription(arg1);
          return ret;
      };
      imports.wbg.__wbg_setTimeout_db2dbaeefb6f39c7 = function() { return handleError(function (arg0, arg1) {
          const ret = setTimeout(arg0, arg1);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_set_1d80752d0d5f0b21 = function(arg0, arg1, arg2) {
          arg0[arg1 >>> 0] = arg2;
      };
      imports.wbg.__wbg_set_23d69db4e5c66a6e = function(arg0, arg1, arg2) {
          arg0.set(arg1, arg2 >>> 0);
      };
      imports.wbg.__wbg_set_aa8f7a765a0a2e5f = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
          arg0.set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
      }, arguments) };
      imports.wbg.__wbg_seticeservers_b00d802d70f18bf7 = function(arg0, arg1) {
          arg0.iceServers = arg1;
      };
      imports.wbg.__wbg_seticetransportpolicy_4f4a8ee26467afe4 = function(arg0, arg1) {
          arg0.iceTransportPolicy = __wbindgen_enum_RtcIceTransportPolicy[arg1];
      };
      imports.wbg.__wbg_setid_1e31ae38dd199f1e = function(arg0, arg1) {
          arg0.id = arg1;
      };
      imports.wbg.__wbg_setname_d69813d4162a910f = function(arg0, arg1, arg2) {
          arg0.name = getStringFromWasm0(arg1, arg2);
      };
      imports.wbg.__wbg_setnegotiated_adeee8a35c80b239 = function(arg0, arg1) {
          arg0.negotiated = arg1 !== 0;
      };
      imports.wbg.__wbg_setonclose_629a987007f094d6 = function(arg0, arg1) {
          arg0.onclose = arg1;
      };
      imports.wbg.__wbg_setonconnectionstatechange_802cd72c5cdf8011 = function(arg0, arg1) {
          arg0.onconnectionstatechange = arg1;
      };
      imports.wbg.__wbg_setonerror_63a911ab4d90e28b = function(arg0, arg1) {
          arg0.onerror = arg1;
      };
      imports.wbg.__wbg_setonicegatheringstatechange_6fb61f0de024221d = function(arg0, arg1) {
          arg0.onicegatheringstatechange = arg1;
      };
      imports.wbg.__wbg_setonmessage_4596c1308611382a = function(arg0, arg1) {
          arg0.onmessage = arg1;
      };
      imports.wbg.__wbg_setonmessage_b53b0e68a6823042 = function(arg0, arg1) {
          arg0.onmessage = arg1;
      };
      imports.wbg.__wbg_setonopen_be193e2f796876a6 = function(arg0, arg1) {
          arg0.onopen = arg1;
      };
      imports.wbg.__wbg_setsdp_d4eab241040f765d = function(arg0, arg1, arg2) {
          arg0.sdp = getStringFromWasm0(arg1, arg2);
      };
      imports.wbg.__wbg_settype_42fb5763bc9d9856 = function(arg0, arg1) {
          arg0.type = __wbindgen_enum_WorkerType[arg1];
      };
      imports.wbg.__wbg_settype_935b601281898749 = function(arg0, arg1) {
          arg0.type = __wbindgen_enum_RtcSdpType[arg1];
      };
      imports.wbg.__wbg_size_5ead5cc358246113 = function(arg0) {
          const ret = arg0.size;
          return ret;
      };
      imports.wbg.__wbg_slice_87d3a5400c140e92 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
          const ret = arg0.slice(arg1, arg2, getStringFromWasm0(arg3, arg4));
          return ret;
      }, arguments) };
      imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
          const ret = arg1.stack;
          const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len1 = WASM_VECTOR_LEN;
          getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      };
      imports.wbg.__wbg_static_accessor_GLOBAL_0be7472e492ad3e3 = function() {
          const ret = typeof global === 'undefined' ? null : global;
          return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      };
      imports.wbg.__wbg_static_accessor_GLOBAL_THIS_1a6eb482d12c9bfb = function() {
          const ret = typeof globalThis === 'undefined' ? null : globalThis;
          return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      };
      imports.wbg.__wbg_static_accessor_SELF_1dc398a895c82351 = function() {
          const ret = typeof self === 'undefined' ? null : self;
          return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      };
      imports.wbg.__wbg_static_accessor_WINDOW_ae1c80c7eea8d64a = function() {
          const ret = typeof window === 'undefined' ? null : window;
          return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      };
      imports.wbg.__wbg_stringify_f4f701bc34ceda61 = function() { return handleError(function (arg0) {
          const ret = JSON.stringify(arg0);
          return ret;
      }, arguments) };
      imports.wbg.__wbg_subarray_46adeb9b86949d12 = function(arg0, arg1, arg2) {
          const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
          return ret;
      };
      imports.wbg.__wbg_then_0438fad860fe38e1 = function(arg0, arg1) {
          const ret = arg0.then(arg1);
          return ret;
      };
      imports.wbg.__wbg_then_0ffafeddf0e182a4 = function(arg0, arg1, arg2) {
          const ret = arg0.then(arg1, arg2);
          return ret;
      };
      imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
          const ret = arg0.versions;
          return ret;
      };
      imports.wbg.__wbindgen_cb_drop = function(arg0) {
          const obj = arg0.original;
          if (obj.cnt-- == 1) {
              obj.a = 0;
              return true;
          }
          const ret = false;
          return ret;
      };
      imports.wbg.__wbindgen_closure_wrapper18575 = function(arg0, arg1, arg2) {
          const ret = makeMutClosure(arg0, arg1, 5761, __wbg_adapter_41);
          return ret;
      };
      imports.wbg.__wbindgen_closure_wrapper19422 = function(arg0, arg1, arg2) {
          const ret = makeMutClosure(arg0, arg1, 6065, __wbg_adapter_44);
          return ret;
      };
      imports.wbg.__wbindgen_closure_wrapper20394 = function(arg0, arg1, arg2) {
          const ret = makeMutClosure(arg0, arg1, 6378, __wbg_adapter_47);
          return ret;
      };
      imports.wbg.__wbindgen_closure_wrapper20875 = function(arg0, arg1, arg2) {
          const ret = makeMutClosure(arg0, arg1, 6399, __wbg_adapter_50);
          return ret;
      };
      imports.wbg.__wbindgen_closure_wrapper593 = function(arg0, arg1, arg2) {
          const ret = makeMutClosure(arg0, arg1, 183, __wbg_adapter_38);
          return ret;
      };
      imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
          const ret = debugString(arg1);
          const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          const len1 = WASM_VECTOR_LEN;
          getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      };
      imports.wbg.__wbindgen_init_externref_table = function() {
          const table = wasm.__wbindgen_export_2;
          const offset = table.grow(4);
          table.set(0, undefined);
          table.set(offset + 0, undefined);
          table.set(offset + 1, null);
          table.set(offset + 2, true);
          table.set(offset + 3, false);
      };
      imports.wbg.__wbindgen_is_array = function(arg0) {
          const ret = Array.isArray(arg0);
          return ret;
      };
      imports.wbg.__wbindgen_is_falsy = function(arg0) {
          const ret = !arg0;
          return ret;
      };
      imports.wbg.__wbindgen_is_function = function(arg0) {
          const ret = typeof(arg0) === 'function';
          return ret;
      };
      imports.wbg.__wbindgen_is_object = function(arg0) {
          const val = arg0;
          const ret = typeof(val) === 'object' && val !== null;
          return ret;
      };
      imports.wbg.__wbindgen_is_string = function(arg0) {
          const ret = typeof(arg0) === 'string';
          return ret;
      };
      imports.wbg.__wbindgen_is_undefined = function(arg0) {
          const ret = arg0 === undefined;
          return ret;
      };
      imports.wbg.__wbindgen_memory = function() {
          const ret = wasm.memory;
          return ret;
      };
      imports.wbg.__wbindgen_module = function() {
          const ret = __wbg_init.__wbindgen_wasm_module;
          return ret;
      };
      imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
          const obj = arg1;
          const ret = typeof(obj) === 'number' ? obj : undefined;
          getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
      };
      imports.wbg.__wbindgen_number_new = function(arg0) {
          const ret = arg0;
          return ret;
      };
      imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
          const obj = arg1;
          const ret = typeof(obj) === 'string' ? obj : undefined;
          var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          var len1 = WASM_VECTOR_LEN;
          getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
          getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      };
      imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
          const ret = getStringFromWasm0(arg0, arg1);
          return ret;
      };
      imports.wbg.__wbindgen_throw = function(arg0, arg1) {
          throw new Error(getStringFromWasm0(arg0, arg1));
      };
      imports['./snippets/p2p-d8c981af5e1bb8c5/src/service_impl/webrtc/web.js'] = __wbg_star0;
      imports['./snippets/wasm_thread-8ee53d0673203880/src/wasm32/js/module_workers_polyfill.min.js'] = __wbg_star1;

      return imports;
  }

  function __wbg_finalize_init(instance, module) {
      wasm = instance.exports;
      __wbg_init.__wbindgen_wasm_module = module;
      cachedDataViewMemory0 = null;
      cachedUint8ArrayMemory0 = null;


      wasm.__wbindgen_start();
      return wasm;
  }

  function initSync(module) {
      if (wasm !== undefined) return wasm;


      if (typeof module !== 'undefined') {
          if (Object.getPrototypeOf(module) === Object.prototype) {
              ({module} = module);
          } else {
              console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
          }
      }

      const imports = __wbg_get_imports();

      if (!(module instanceof WebAssembly.Module)) {
          module = new WebAssembly.Module(module);
      }

      const instance = new WebAssembly.Instance(module, imports);

      return __wbg_finalize_init(instance, module);
  }

  async function __wbg_init(module_or_path) {
      if (wasm !== undefined) return wasm;


      if (typeof module_or_path !== 'undefined') {
          if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
              ({module_or_path} = module_or_path);
          } else {
              console.warn('using deprecated parameters for the initialization function; pass a single object instead');
          }
      }

      if (typeof module_or_path === 'undefined') {
          // In worker context, use Chrome extension URL for WASM file
          if (typeof document === 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
              module_or_path = chrome.runtime.getURL('dist/openmina_node_web_bg.wasm');
          } else if (typeof document === 'undefined') {
              module_or_path = './dist/openmina_node_web_bg.wasm';
          } else {
              module_or_path = new URL('openmina_node_web_bg.wasm', (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || new URL('worker-bundle.js', document.baseURI).href));
          }
      }
      const imports = __wbg_get_imports();

      if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
          module_or_path = fetch(module_or_path);
      }

      const { instance, module } = await __wbg_load(await module_or_path, imports);

      return __wbg_finalize_init(instance, module);
  }

  var openmina_node_web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    main: main,
    build_env: build_env,
    run: run,
    wasm_thread_entry_point: wasm_thread_entry_point,
    Ledger: Ledger,
    LedgerAccounts: LedgerAccounts,
    LedgerSelected: LedgerSelected,
    RpcSender: RpcSender,
    State: State,
    Stats: Stats,
    TransactionPool: TransactionPool,
    TransactionPoolInject: TransactionPoolInject,
    TransitionFrontier: TransitionFrontier,
    TransitionFrontierBestChain: TransitionFrontierBestChain,
    initSync: initSync,
    'default': __wbg_init
  });

  // Log all imported WASM functions at module level
  console.log("OpenMina bundled module: Imported WASM functions:");
  console.log("- initWasm:", typeof __wbg_init);
  console.log("- run:", typeof run);
  console.log("- build_env:", typeof build_env);
  console.log("- main:", typeof main);

  async function init() {
    console.log("OpenMina bundled module: Starting initialization...");

    // First, let's try to call build_env() without full initialization
    try {
      console.log("OpenMina bundled module: Trying build_env() before full init...");
      const buildEnv = build_env();
      console.log("OpenMina bundled module: Build environment (pre-init):", buildEnv);
    } catch (buildEnvError) {
      console.log("OpenMina bundled module: build_env() failed before init:", buildEnvError.message);
    }

    // Import and log all available WASM exports
    try {
      const wasmExports = await Promise.resolve().then(function () { return openmina_node_web; });
      console.log("OpenMina bundled module: All WASM exports:", Object.keys(wasmExports));
      console.log("OpenMina bundled module: WASM exports object:", wasmExports);
    } catch (importError) {
      console.log("OpenMina bundled module: Failed to import WASM exports:", importError.message);
    }

    try {
      // Initialize the WASM module
      console.log("OpenMina bundled module: Calling initWasm()...");
      const wasmModule = await __wbg_init();
      console.log("OpenMina bundled module: WASM initialized successfully");
      console.log("OpenMina bundled module: initWasm() returned:", wasmModule);

      // Get build environment info after init
      console.log("OpenMina bundled module: Getting build environment after init...");
      const buildEnv = build_env();
      console.log("OpenMina bundled module: Build environment (post-init):", buildEnv);

      // Start the OpenMina node
      console.log("OpenMina bundled module: Starting node with run()...");
      const rpcSender = await run(null, null, null); // No block producer, default configs

      console.log("OpenMina bundled module: Node started successfully");
      console.log("OpenMina bundled module: RpcSender object:", rpcSender);
      console.log("OpenMina bundled module: RpcSender type:", typeof rpcSender);
      console.log("OpenMina bundled module: RpcSender constructor:", rpcSender.constructor.name);
      console.log("OpenMina bundled module: RpcSender own properties:", Object.getOwnPropertyNames(rpcSender));
      console.log("OpenMina bundled module: RpcSender prototype:", Object.getPrototypeOf(rpcSender));
      console.log("OpenMina bundled module: RpcSender prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(rpcSender)));

      // Check for common methods
      const commonMethods = ['status', 'send', 'call', 'request', 'query'];
      commonMethods.forEach(method => {
        if (typeof rpcSender[method] === 'function') {
          console.log(`OpenMina bundled module: ✓ ${method}() method available`);
        } else {
          console.log(`OpenMina bundled module: ✗ ${method}() method not found`);
        }
      });

      // Make the node available globally for the extension
      if (typeof window !== 'undefined') {
        window.openminaNode = rpcSender;
        console.log("OpenMina bundled module: Node attached to window.openminaNode");

        // Dispatch success event
        window.dispatchEvent(new CustomEvent('openmina-ready', {
          detail: { rpcSender, buildEnv }
        }));
        console.log("OpenMina bundled module: Success event dispatched");
      } else {
        // In worker context, store globally and make functions available
        self.openminaNode = rpcSender;
        self.build_env = build_env;
        self.run = run;
        self.main = main;
        console.log("OpenMina bundled module: Node and functions attached to self (worker context)");
      }

    } catch (error) {
      console.error("OpenMina bundled module: Initialization failed:", error);
      console.error("OpenMina bundled module: Error type:", error.constructor.name);
      console.error("OpenMina bundled module: Error message:", error.message);

      // Try to call build_env() even after error
      try {
        console.log("OpenMina bundled module: Trying build_env() after error...");
        const buildEnv = build_env();
        console.log("OpenMina bundled module: Build environment (post-error):", buildEnv);
      } catch (buildEnvError) {
        console.log("OpenMina bundled module: build_env() also failed:", buildEnvError.message);
      }

      // Dispatch error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openmina-error', {
          detail: error.message || error.toString()
        }));
      } else {
        console.log("OpenMina bundled module: Error in worker context:", error.message || error.toString());
      }
    }
  }

  // Start initialization
  init();

})();
