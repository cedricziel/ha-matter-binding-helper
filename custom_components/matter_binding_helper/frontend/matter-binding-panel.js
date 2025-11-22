function e(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var d=e.length-1;d>=0;d--)(o=e[d])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:d,defineProperty:a,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,h=globalThis,u=h.trustedTypes,_=u?u.emptyScript:"",v=h.reactiveElementPolyfillSupport,m=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},f=(e,t)=>!d(e,t),y={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:f};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),h.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&a(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:o}=l(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const r=n?.call(this);o?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...c(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(i)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of n){const n=document.createElement("style"),o=t.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=i.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=n;const r=o.fromAttribute(t,e.type);this[n]=r??this._$Ej?.get(n)??r,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const n=this.constructor,o=this[e];if(i??=n.getPropertyOptions(e),!((i.hasChanged??f)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==o||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,v?.({ReactiveElement:$}),(h.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,w=x.trustedTypes,S=w?w.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+A,k=`<${C}>`,T=document,N=()=>T.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,P="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,R=/>/g,z=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,M=/"/g,H=/^(?:script|style|textarea|title)$/i,L=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),j=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),G=new WeakMap,W=T.createTreeWalker(T,129);function q(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const V=(e,t)=>{const i=e.length-1,n=[];let o,r=2===t?"<svg>":3===t?"<math>":"",s=O;for(let t=0;t<i;t++){const i=e[t];let d,a,l=-1,c=0;for(;c<i.length&&(s.lastIndex=c,a=s.exec(i),null!==a);)c=s.lastIndex,s===O?"!--"===a[1]?s=I:void 0!==a[1]?s=R:void 0!==a[2]?(H.test(a[2])&&(o=RegExp("</"+a[2],"g")),s=z):void 0!==a[3]&&(s=z):s===z?">"===a[0]?(s=o??O,l=-1):void 0===a[1]?l=-2:(l=s.lastIndex-a[2].length,d=a[1],s=void 0===a[3]?z:'"'===a[3]?M:U):s===M||s===U?s=z:s===I||s===R?s=O:(s=z,o=void 0);const p=s===z&&e[t+1].startsWith("/>")?" ":"";r+=s===O?i+k:l>=0?(n.push(d),i.slice(0,l)+E+i.slice(l)+A+p):i+A+(-2===l?t:p)}return[q(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class K{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let o=0,r=0;const s=e.length-1,d=this.parts,[a,l]=V(e,t);if(this.el=K.createElement(a,i),W.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=W.nextNode())&&d.length<s;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(E)){const t=l[r++],i=n.getAttribute(e).split(A),s=/([.?@])?(.*)/.exec(t);d.push({type:1,index:o,name:s[2],strings:i,ctor:"."===s[1]?Y:"?"===s[1]?ee:"@"===s[1]?te:X}),n.removeAttribute(e)}else e.startsWith(A)&&(d.push({type:6,index:o}),n.removeAttribute(e));if(H.test(n.tagName)){const e=n.textContent.split(A),t=e.length-1;if(t>0){n.textContent=w?w.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],N()),W.nextNode(),d.push({type:2,index:++o});n.append(e[t],N())}}}else if(8===n.nodeType)if(n.data===C)d.push({type:2,index:o});else{let e=-1;for(;-1!==(e=n.data.indexOf(A,e+1));)d.push({type:7,index:o}),e+=A.length-1}o++}}static createElement(e,t){const i=T.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,n){if(t===j)return t;let o=void 0!==n?i._$Co?.[n]:i._$Cl;const r=B(t)?void 0:t._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(e),o._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=o:i._$Cl=o),void 0!==o&&(t=J(e,o._$AS(e,t.values),o,n)),t}class Z{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??T).importNode(t,!0);W.currentNode=n;let o=W.nextNode(),r=0,s=0,d=i[0];for(;void 0!==d;){if(r===d.index){let t;2===d.type?t=new Q(o,o.nextSibling,this,e):1===d.type?t=new d.ctor(o,d.name,d.strings,this,e):6===d.type&&(t=new ie(o,this,e)),this._$AV.push(t),d=i[++s]}r!==d?.index&&(o=W.nextNode(),r++)}return W.currentNode=T,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),B(e)?e===F||null==e||""===e?(this._$AH!==F&&this._$AR(),this._$AH=F):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==F&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=K.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new Z(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new K(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const o of e)n===t.length?t.push(i=new Q(this.O(N()),this.O(N()),this,this.options)):i=t[n],i._$AI(o),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,o){this.type=1,this._$AH=F,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=F}_$AI(e,t=this,i,n){const o=this.strings;let r=!1;if(void 0===o)e=J(this,e,t,0),r=!B(e)||e!==this._$AH&&e!==j,r&&(this._$AH=e);else{const n=e;let s,d;for(e=o[0],s=0;s<o.length-1;s++)d=J(this,n[i+s],t,s),d===j&&(d=this._$AH[s]),r||=!B(d)||d!==this._$AH[s],d===F?e=F:e!==F&&(e+=(d??"")+o[s+1]),this._$AH[s]=d}r&&!n&&this.j(e)}j(e){e===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===F?void 0:e}}class ee extends X{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==F)}}class te extends X{constructor(e,t,i,n,o){super(e,t,i,n,o),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??F)===j)return;const i=this._$AH,n=e===F&&i!==F||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==F&&(i===F||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ie{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const ne=x.litHtmlPolyfillSupport;ne?.(K,Q),(x.litHtmlVersions??=[]).push("3.3.1");const oe=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class re extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let o=n._$litPart$;if(void 0===o){const e=i?.renderBefore??null;n._$litPart$=o=new Q(t.insertBefore(N(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}}re._$litElement$=!0,re.finalized=!0,oe.litElementHydrateSupport?.({LitElement:re});const se=oe.litElementPolyfillSupport;se?.({LitElement:re}),(oe.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:f},ae=(e=de,t,i)=>{const{kind:n,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,o,e)},init(t){return void 0!==t&&this.C(n,void 0,e,t),t}}}if("setter"===n){const{name:n}=i;return function(i){const o=this[n];t.call(this,i),this.requestUpdate(n,o,e)}}throw Error("Unsupported decorator location: "+n)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function le(e){return(t,i)=>"object"==typeof i?ae(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ce(e){return le({...e,state:!0,attribute:!1})}const pe=3,ge=4,he=5,ue=6,_e=8,ve=29,me=30,be=31,fe=40,ye=47,$e=768,xe=513,we=516,Se=1026,Ee=1027,Ae=1029,Ce=1030,ke={[pe]:"Identify",[ge]:"Groups",[he]:"Scenes",[ue]:"On/Off",[_e]:"Level Control",[ve]:"Descriptor",[me]:"Binding",[be]:"Access Control",[fe]:"Basic Information",42:"OTA Update",[ye]:"Power Source",48:"General Commissioning",49:"Network Commissioning",50:"Diagnostic Logs",51:"General Diagnostics",52:"Software Diagnostics",53:"Thread Diagnostics",56:"Ethernet Diagnostics",60:"Admin Commissioning",62:"Operational Credentials",63:"Group Key Management",70:"Time Sync",[$e]:"Color Control",[xe]:"Thermostat",[we]:"Thermostat UI",514:"Fan Control",[Se]:"Temperature",[Ee]:"Pressure",[Ae]:"Humidity",[Ce]:"Occupancy"},Te={17:"Power Source",18:"OTA Requestor",19:"OTA Provider",20:"Aggregator",22:"Root Node",256:"On/Off Light",257:"Dimmable Light",258:"Color Temperature Light",259:"On/Off Light Switch",260:"Dimmer Switch",261:"Color Dimmer Switch",262:"Light Sensor",263:"Occupancy Sensor",266:"On/Off Plug-in Unit",267:"Dimmable Plug-in Unit",268:"Color Temperature Light",269:"Extended Color Light",769:"Thermostat",770:"Temperature Sensor",771:"Humidity Sensor",772:"Air Quality Sensor",10:"Door Lock",11:"Door Lock Controller",514:"Window Covering",515:"Window Covering Controller",21:"Contact Sensor",38:"Flow Sensor",44:"Smoke/CO Alarm",35:"Casting Video Player",36:"Content App",40:"Basic Video Player",41:"Casting Video Client",43:"Speaker"},Ne={[ue]:{action:"control the on/off state of",dataType:"on/off commands"},[_e]:{action:"control the brightness/level of",dataType:"level/dimming commands"},[$e]:{action:"control the color of",dataType:"color commands"},[Se]:{action:"read temperature data from",dataType:"temperature readings"},[Ee]:{action:"read pressure data from",dataType:"pressure readings"},[Ae]:{action:"read humidity data from",dataType:"humidity readings"},[Ce]:{action:"receive occupancy status from",dataType:"occupancy/presence data"},[xe]:{action:"control thermostat settings on",dataType:"thermostat commands"},[he]:{action:"trigger scenes on",dataType:"scene commands"},[ge]:{action:"manage group membership on",dataType:"group commands"}};function Be(e){return ke[e]||`0x${e.toString(16).padStart(4,"0")}`}function De(e){return Te[e]||`Type ${e}`}function Pe(e){return Ne[e]||{action:"communicate with",dataType:`${Be(e)} data`}}const Oe="matter_binding_helper";async function Ie(e,t,i){return e.callWS({type:`${Oe}/list_bindings`,node_id:t,endpoint_id:i})}async function Re(e,t,i,n,o,r,s){return e.callWS({type:`${Oe}/create_binding`,source_node_id:t,source_endpoint_id:i,cluster_id:n,...void 0!==o&&{target_node_id:o},...void 0!==r&&{target_endpoint_id:r},...void 0!==s})}async function ze(e,t,i,n,o,r){return e.callWS({type:`${Oe}/delete_binding`,source_node_id:t,source_endpoint_id:i,...void 0!==n&&{target_node_id:n},...void 0!==o&&{target_endpoint_id:o},...void 0!==r&&{target_group_id:r}})}let Ue=class extends re{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="overview",this._showCreateDialog=!1,this._allBindings=[],this._recommendations=[],this._overviewLoading=!1,this._surveySubmitting=!1,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null,this._filterSameAreaOnly=!0,this._actionInProgress=null,this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null,this._pendingDeleteBinding=null}firstUpdated(){this._loadNodes().then(()=>{"overview"===this._activeTab&&this._loadOverviewData()})}async _loadNodes(){this._loading=!0,this._error=null;try{const e=await async function(e){return e.callWS({type:`${Oe}/list_nodes`})}(this.hass);this._nodes=e.nodes}catch(e){this._error=`Failed to load nodes: ${e}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const e=await Ie(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=e.bindings}catch(e){this._error=`Failed to load bindings: ${e}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const e=await async function(e){return e.callWS({type:`${Oe}/list_groups`})}(this.hass);this._groups=e.groups}catch(e){this._error=`Failed to load groups: ${e}`}finally{this._loading=!1}}async _loadOverviewData(){this._overviewLoading=!0,this._error=null;try{const e=[];for(const t of this._nodes)for(const i of t.endpoints)if(i.has_binding_cluster)try{const n=await Ie(this.hass,t.node_id,i.endpoint_id);for(const o of n.bindings){const n=o.target_node_id&&this._nodes.find(e=>e.node_id===o.target_node_id)||null,r=n&&o.target_endpoint_id&&n.endpoints.find(e=>e.endpoint_id===o.target_endpoint_id)||null;e.push({binding:o,sourceNode:t,sourceEndpoint:i,targetNode:n,targetEndpoint:r})}}catch{}this._allBindings=e,this._recommendations=this._computeRecommendations()}catch(e){this._error=`Failed to load overview data: ${e}`}finally{this._overviewLoading=!1}}_computeRecommendations(){const e=[];for(const t of this._nodes)for(const i of t.endpoints){const n=i.client_clusters||[];if(0!==n.length&&i.has_binding_cluster)for(const o of this._nodes)for(const r of o.endpoints){if(t.node_id===o.node_id&&i.endpoint_id===r.endpoint_id)continue;const s=r.server_clusters||[],d=n.filter(e=>s.includes(e));if(0===d.length)continue;const a=this._allBindings.some(e=>e.binding.node_id===t.node_id&&e.binding.endpoint_id===i.endpoint_id&&e.binding.target_node_id===o.node_id&&e.binding.target_endpoint_id===r.endpoint_id);a||e.push({sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:r,compatibleClusters:d})}}return e.sort((e,t)=>t.compatibleClusters.length-e.compatibleClusters.length),e}_selectNode(e){this._selectedSourceNode?.node_id===e.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=e,this._selectedSourceEndpoint=null,this._bindings=[])}_selectEndpoint(e,t){e.stopPropagation(),t.has_binding_cluster&&(this._selectedSourceEndpoint=t,this._loadBindings())}async _deleteBinding(e){if(!confirm("Are you sure you want to delete this binding?"))return;const t=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=t;try{await ze(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0),await this._loadBindings()}catch(e){this._error=`Failed to delete binding: ${e}`}finally{this._actionInProgress=null}}_openCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id);if(e.length>0){this._selectedTargetNodeId=e[0].node_id;const t=e[0],i=t.endpoints.filter(e=>e.server_clusters&&e.server_clusters.length>0);this._selectedTargetEndpointId=i.length>0?i[0].endpoint_id:t.endpoints[0]?.endpoint_id??null}this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null}_handleTargetNodeChange(e){const t=e.target;this._selectedTargetNodeId=parseInt(t.value,10);const i=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId);if(i){const e=i.endpoints.filter(e=>e.server_clusters&&e.server_clusters.length>0);this._selectedTargetEndpointId=e.length>0?e[0].endpoint_id:i.endpoints[0]?.endpoint_id??null}}_handleTargetEndpointChange(e){const t=e.target;this._selectedTargetEndpointId=parseInt(t.value,10)}_getCompatibleClusters(){if(!this._selectedSourceEndpoint||!this._selectedTargetNodeId||!this._selectedTargetEndpointId)return[];const e=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),t=e?.endpoints.find(e=>e.endpoint_id===this._selectedTargetEndpointId);if(!t)return[];const i=this._selectedSourceEndpoint.client_clusters||[],n=t.server_clusters||[];return i.filter(e=>n.includes(e))}async _handleCreateBinding(e){e.preventDefault();const t=e.target,i=new FormData(t),n=parseInt(i.get("targetNode"),10),o=parseInt(i.get("targetEndpoint"),10),r=parseInt(i.get("cluster"),10);if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return;const s=this._selectedSourceEndpoint.client_clusters||[],d=this._nodes.find(e=>e.node_id===n),a=d?.endpoints.find(e=>e.endpoint_id===o),l=a?.server_clusters||[];if(s.includes(r))if(l.includes(r))try{await Re(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id,r,n,o),this._closeCreateDialog(),await this._loadBindings()}catch(e){this._error=`Failed to create binding: ${e}`}else this._error=`Target endpoint does not have cluster ${Be(r)} as a server cluster`;else this._error=`Source endpoint does not have cluster ${Be(r)} as a client cluster`}_getNodeName(e){const t=this._nodes.find(t=>t.node_id===e);return t?.name||`Node ${e}`}_getClusterName(e){return ke[e]||`Cluster 0x${e.toString(16)}`}async _submitSurvey(){this._surveySubmitting=!0;try{await this.hass.callService("matter_binding_helper","submit_survey",{}),alert("Survey submitted successfully! Thank you for contributing.")}catch(e){this._error=`Failed to submit survey: ${e}`}finally{this._surveySubmitting=!1}}render(){return L`
      <div class="${this.narrow?"narrow":""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <div style="display: flex; gap: 8px;">
            <button
              class="btn btn-secondary"
              @click=${this._submitSurvey}
              ?disabled=${this._surveySubmitting}
              title="Submit anonymized device data to Matter Survey"
            >
              ${this._surveySubmitting?"Submitting...":"Submit Survey"}
            </button>
            <button
              class="btn btn-primary"
              @click=${this._loadNodes}
              ?disabled=${this._loading}
            >
              Refresh
            </button>
          </div>
        </div>

        ${this._error?L`<div class="error">${this._error}</div>`:F}

        <div class="tabs">
          <button
            class="tab ${"overview"===this._activeTab?"active":""}"
            @click=${()=>{this._activeTab="overview",this._loadOverviewData()}}
          >
            Overview
          </button>
          <button
            class="tab ${"bindings"===this._activeTab?"active":""}"
            @click=${()=>this._activeTab="bindings"}
          >
            Bindings
          </button>
          <button
            class="tab ${"groups"===this._activeTab?"active":""}"
            @click=${()=>{this._activeTab="groups",this._loadGroups()}}
          >
            Groups
          </button>
        </div>

        ${"overview"===this._activeTab?this._renderOverviewTab():"bindings"===this._activeTab?this._renderBindingsTab():this._renderGroupsTab()}
        ${this._showCreateDialog?this._renderCreateDialog():F}
        ${this._pendingBindingRecommendation?this._renderBindingConfirmDialog():F}
        ${this._pendingDeleteBinding?this._renderDeleteConfirmDialog():F}
      </div>
    `}_renderOverviewTab(){return L`
      <div class="overview-content">
        ${this._overviewLoading?L`<div class="loading">Loading bindings...</div>`:L`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
            `}
      </div>
    `}_renderEstablishedBindings(){return L`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
        </div>
        ${0===this._allBindings.length?L`<div class="empty-state">No bindings configured yet.</div>`:L`
              <div class="binding-list">
                ${this._allBindings.map(e=>this._renderEstablishedBindingRow(e))}
              </div>
            `}
      </div>
    `}_renderEstablishedBindingRow(e){const{binding:t,sourceNode:i,sourceEndpoint:n,targetNode:o}=e,r=o?.name||`Node ${t.target_node_id}`,s=null!==t.target_group_id,d=Pe(t.cluster_id);return L`
      <div class="overview-binding-row readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong>${i.name}</strong>
            <span class="binding-action">${d.action}</span>
            <strong>${s?`Group ${t.target_group_id}`:r}</strong>
          </div>
          <div class="binding-meta">
            EP ${n.endpoint_id} → ${s?"Group":`EP ${t.target_endpoint_id}`}
            ${i.area_name?L` · ${i.area_name}`:F}
          </div>
        </div>
        <button
          class="btn-icon delete"
          title="Delete binding"
          ?disabled=${null!==this._actionInProgress}
          @click=${()=>this._showDeleteConfirmDialog(e)}
        >
          ✕
        </button>
      </div>
    `}_renderRecommendedBindings(){const e=this._filterSameAreaOnly?this._recommendations.filter(e=>{const t=e.sourceNode.area_name,i=e.targetNode.area_name;return t&&i&&t===i}):this._recommendations;return L`
      <div class="card overview-card">
        <div class="card-header">
          Recommended Bindings
          <span class="count-badge">${e.length}</span>
        </div>
        <div class="filter-controls">
          <label>
            <span class="toggle-switch">
              <input
                type="checkbox"
                ?checked=${this._filterSameAreaOnly}
                @change=${this._toggleAreaFilter}
              />
              <span class="toggle-slider"></span>
            </span>
            Same area only
          </label>
          ${this._filterSameAreaOnly&&e.length!==this._recommendations.length?L`<span class="filter-info">(${this._recommendations.length-e.length} hidden)</span>`:F}
        </div>
        ${0===e.length?L`<div class="empty-state">
              ${this._filterSameAreaOnly&&this._recommendations.length>0?"No same-area recommendations. Toggle filter to see cross-area bindings.":"No binding recommendations. All compatible endpoints are already bound."}
            </div>`:L`
              <div class="binding-list">
                ${e.map(e=>this._renderRecommendationRow(e))}
              </div>
            `}
      </div>
    `}_toggleAreaFilter(e){const t=e.target;this._filterSameAreaOnly=t.checked}_renderRecommendationRow(e){const{sourceNode:t,sourceEndpoint:i,targetNode:n,targetEndpoint:o,compatibleClusters:r}=e,s=r.map(e=>Pe(e).action.replace(/^(control |read |receive |trigger |manage )/,"")),d=[...new Set(s)],a=d.length>2?`${d.slice(0,2).join(", ")}...`:d.join(", ");return L`
      <div class="overview-binding-row recommendation readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong>${t.name}</strong>
            <span class="binding-action">can ${1===r.length?Pe(r[0]).action:`access ${a} from`}</span>
            <strong>${n.name}</strong>
          </div>
          <div class="binding-meta">
            EP ${i.endpoint_id} → EP ${o.endpoint_id}
            ${t.area_name?L` · ${t.area_name}`:F}
          </div>
        </div>
        <button
          class="btn btn-small btn-primary"
          ?disabled=${null!==this._actionInProgress}
          @click=${()=>this._showBindingConfirmDialog(e)}
        >
          Create
        </button>
      </div>
    `}_showDeleteConfirmDialog(e){this._pendingDeleteBinding=e}_closeDeleteConfirmDialog(){this._pendingDeleteBinding=null}async _confirmDeleteBinding(){if(!this._pendingDeleteBinding)return;const{binding:e}=this._pendingDeleteBinding,t=`delete-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=t;try{await ze(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0),this._closeDeleteConfirmDialog(),await this._loadOverviewData()}catch(e){this._error=`Failed to delete binding: ${e}`}finally{this._actionInProgress=null}}_showBindingConfirmDialog(e){this._pendingBindingRecommendation=e,this._selectedClusterForBinding=e.compatibleClusters[0]}_closeBindingConfirmDialog(){this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null}_handleClusterSelectChange(e){const t=e.target;this._selectedClusterForBinding=parseInt(t.value,10)}async _confirmCreateBinding(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n}=this._pendingBindingRecommendation,o=this._selectedClusterForBinding,r=`create-${e.node_id}-${t.endpoint_id}-${i.node_id}-${n.endpoint_id}`;this._actionInProgress=r;try{await Re(this.hass,e.node_id,t.endpoint_id,o,i.node_id,n.endpoint_id),this._closeBindingConfirmDialog(),await this._loadOverviewData()}catch(e){this._error=`Failed to create binding: ${e}`}finally{this._actionInProgress=null}}_renderBindingsTab(){return L`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Nodes</div>
          ${this._loading&&0===this._nodes.length?L`<div class="loading">Loading...</div>`:L`
                <ul class="node-list">
                  ${this._nodes.map(e=>this._renderNodeItem(e))}
                </ul>
              `}
        </div>

        <div class="card bindings-panel">
          <div class="card-header">
            ${this._selectedSourceEndpoint?L`
                  Bindings for ${this._selectedSourceNode?.name} - Endpoint
                  ${this._selectedSourceEndpoint.endpoint_id}
                  <button
                    class="btn btn-primary"
                    style="float: right; margin-top: -8px;"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `:"Select a node and endpoint to view bindings"}
          </div>

          ${this._selectedSourceEndpoint?this._bindings.length>0?L`
                  <div class="binding-list">
                    ${this._bindings.map(e=>this._renderBindingCard(e))}
                  </div>
                `:L`
                  <div class="empty-state">
                    No bindings configured for this endpoint.
                  </div>
                `:L`
                <div class="empty-state">
                  Select a node with binding support to manage its bindings.
                </div>
              `}
        </div>
      </div>
    `}_getPrimaryDeviceType(e){const t=e.endpoints.find(e=>1===e.endpoint_id)||e.endpoints.find(e=>e.endpoint_id>0);return t&&t.device_types.length>0?De(t.device_types[0].id):null}_renderNodeItem(e){const t=this._selectedSourceNode?.node_id===e.node_id;e.endpoints.filter(e=>e.has_binding_cluster);const i=e.endpoints.length,n=e.device_info,o=this._getPrimaryDeviceType(e);return L`
      <li>
        <div
          class="node-item ${t?"selected":""}"
          @click=${()=>this._selectNode(e)}
        >
          <span
            class="node-status ${e.available?"":"unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">${e.name}</span>
            <div class="node-meta">
              ${o?L`<span class="node-device-type">${o}</span>`:F}
              ${o&&e.area_name?L`<span class="node-meta-sep">·</span>`:F}
              ${e.area_name?L`<span class="node-area">${e.area_name}</span>`:F}
              ${n?.software_version?L`<span class="node-version">v${n.software_version}</span>`:F}
            </div>
          </div>
        </div>
        ${t?L`
              <div class="node-details">
                ${i>0?L`
                      <div class="endpoint-list">
                        ${e.endpoints.map(e=>this._renderEndpointItem(e))}
                      </div>
                    `:L`<div class="no-endpoints">No endpoints found</div>`}
              </div>
            `:F}
      </li>
    `}_renderEndpointItem(e){const t=this._selectedSourceEndpoint?.endpoint_id===e.endpoint_id,i=e.device_types.map(e=>De(e.id)).filter(t=>0!==e.endpoint_id||!t.includes("Root")),n=[29,30,31,40,42,48,49,50,51,52,53,56,60,62,63,70],o=(e.server_clusters||[]).filter(e=>!n.includes(e)).map(e=>Be(e)),r=(e.client_clusters||[]).filter(e=>!n.includes(e)).map(e=>Be(e));return L`
      <div
        class="endpoint-item ${t?"selected":""} ${e.has_binding_cluster?"":"no-binding"}"
        @click=${t=>this._selectEndpoint(t,e)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${e.endpoint_id}</span>
          ${e.has_binding_cluster?L`<span class="endpoint-badge binding">Binding</span>`:F}
        </div>
        ${i.length>0?L`<div class="endpoint-device-types">${i.join(", ")}</div>`:F}
        ${o.length>0?L`<div class="endpoint-clusters"><span class="cluster-role">Server:</span> ${o.join(" · ")}</div>`:F}
        ${r.length>0?L`<div class="endpoint-clusters"><span class="cluster-role">Client:</span> ${r.join(" · ")}</div>`:F}
      </div>
    `}_renderBindingCard(e){const t=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`,i=this._actionInProgress===t;return L`
      <div class="binding-card">
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${null!==e.target_group_id?`Group ${e.target_group_id}`:`${this._getNodeName(e.target_node_id)} - Endpoint ${e.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">
              ${this._getClusterName(e.cluster_id)}
            </span>
          </div>
        </div>
        <button
          class="delete-btn ${i?"btn-loading":""}"
          ?disabled=${i||null!==this._actionInProgress}
          @click=${()=>this._deleteBinding(e)}
        >
          ${i?"":"Delete"}
        </button>
      </div>
    `}_renderGroupsTab(){return L`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading?L`<div class="loading">Loading...</div>`:this._groups.length>0?L`
                <div class="binding-list">
                  ${this._groups.map(e=>L`
                      <div class="binding-card">
                        <div>
                          <strong>${e.name}</strong>
                          <div style="font-size: 12px; color: var(--secondary-text-color);">
                            Group ID: ${e.group_id} |
                            ${e.members.length} member(s)
                          </div>
                        </div>
                      </div>
                    `)}
                </div>
              `:L`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `}_renderBindingConfirmDialog(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return F;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n,compatibleClusters:o}=this._pendingBindingRecommendation,r=this._selectedClusterForBinding,s=Pe(r),d=null!==this._actionInProgress;return L`
      <div class="dialog-overlay" @click=${this._closeBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${e.name}</div>
              <div class="binding-device-endpoint">Endpoint ${t.endpoint_id}</div>
              ${e.area_name?L`<div class="binding-device-area">${e.area_name}</div>`:F}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${Be(r)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${i.name}</div>
              <div class="binding-device-endpoint">Endpoint ${n.endpoint_id}</div>
              ${i.area_name?L`<div class="binding-device-area">${i.area_name}</div>`:F}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${e.name}</strong> will ${s.action}
              <strong>${i.name}</strong> using ${s.dataType}.
            </div>
          </div>

          ${o.length>1?L`
                <div class="cluster-select-group">
                  <label>Select cluster to bind:</label>
                  <select
                    class="form-select"
                    @change=${this._handleClusterSelectChange}
                  >
                    ${o.map(e=>L`
                        <option value=${e} ?selected=${e===r}>
                          ${Be(e)} - ${Pe(e).dataType}
                        </option>
                      `)}
                  </select>
                </div>
              `:F}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeBindingConfirmDialog}
              ?disabled=${d}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${d?"btn-loading":""}"
              @click=${this._confirmCreateBinding}
              ?disabled=${d}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderDeleteConfirmDialog(){if(!this._pendingDeleteBinding)return F;const{binding:e,sourceNode:t,sourceEndpoint:i,targetNode:n}=this._pendingDeleteBinding,o=Pe(e.cluster_id),r=n?.name||`Node ${e.target_node_id}`,s=null!==this._actionInProgress,d=null!==e.target_group_id;return L`
      <div class="dialog-overlay" @click=${this._closeDeleteConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🗑️</span>
            Remove Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${t.name}</div>
              <div class="binding-device-endpoint">Endpoint ${i.endpoint_id}</div>
              ${t.area_name?L`<div class="binding-device-area">${t.area_name}</div>`:F}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${Be(e.cluster_id)}</span>
              <span class="binding-arrow-large" style="text-decoration: line-through; color: var(--error-color);">→</span>
            </div>
            <div class="binding-device-card target">
              ${d?L`<div class="binding-device-name">Group ${e.target_group_id}</div>`:L`
                    <div class="binding-device-name">${r}</div>
                    <div class="binding-device-endpoint">Endpoint ${e.target_endpoint_id}</div>
                    ${n?.area_name?L`<div class="binding-device-area">${n.area_name}</div>`:F}
                  `}
            </div>
          </div>

          <div class="binding-explanation" style="border-left: 3px solid var(--error-color);">
            <div class="binding-explanation-header">After removing this binding:</div>
            <div class="binding-explanation-content">
              <strong>${t.name}</strong> will stop being able to ${o.action}
              <strong>${d?`Group ${e.target_group_id}`:r}</strong>.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeDeleteConfirmDialog}
              ?disabled=${s}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${s?"btn-loading":""}"
              style="background: var(--error-color);"
              @click=${this._confirmDeleteBinding}
              ?disabled=${s}
            >
              Remove Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id),t=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),i=t?.endpoints||[],n=this._getCompatibleClusters(),o=(this._selectedSourceEndpoint?.client_clusters||[]).length>0;return L`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>

          ${o?F:L`
                <div class="dialog-warning">
                  <strong>Note:</strong> This endpoint has no client clusters.
                  Bindings are typically used by devices with client clusters to control other devices.
                </div>
              `}

          <form @submit=${this._handleCreateBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select
                name="targetNode"
                class="form-select"
                required
                @change=${this._handleTargetNodeChange}
              >
                ${e.map(e=>L`
                    <option
                      value=${e.node_id}
                      ?selected=${e.node_id===this._selectedTargetNodeId}
                    >
                      ${e.name}
                    </option>
                  `)}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Endpoint</label>
              <select
                name="targetEndpoint"
                class="form-select"
                required
                @change=${this._handleTargetEndpointChange}
              >
                ${i.map(e=>{const t=e.device_types.map(e=>De(e.id)).join(", "),i=(e.server_clusters||[]).length>0;return L`
                    <option
                      value=${e.endpoint_id}
                      ?selected=${e.endpoint_id===this._selectedTargetEndpointId}
                    >
                      Endpoint ${e.endpoint_id}${t?` (${t})`:""}${i?"":" - no server clusters"}
                    </option>
                  `})}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              ${n.length>0?L`
                    <select name="cluster" class="form-select" required>
                      ${n.map(e=>L`
                          <option value=${e}>${Be(e)}</option>
                        `)}
                    </select>
                  `:L`
                    <div class="no-clusters-warning">
                      No compatible clusters found. The source endpoint needs a <strong>client</strong> cluster
                      that matches a <strong>server</strong> cluster on the target endpoint.
                    </div>
                    <select name="cluster" class="form-select" disabled>
                      <option>No compatible clusters</option>
                    </select>
                  `}
            </div>

            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click=${this._closeCreateDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                ?disabled=${0===n.length}
              >
                Create Binding
              </button>
            </div>
          </form>
        </div>
      </div>
    `}};Ue.styles=((e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new r(i,e,n)})`
    :host {
      display: block;
      padding: 16px;
      background: var(--primary-background-color);
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
      color: var(--primary-text-color);
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      padding: 12px 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      color: var(--secondary-text-color);
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .content {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
    }

    .narrow .content {
      grid-template-columns: 1fr;
    }

    .card {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.1));
    }

    .card-header {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--primary-text-color);
    }

    .node-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .node-item {
      padding: 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .node-item:hover {
      background: var(--secondary-background-color);
    }

    .node-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .node-item.selected .node-name,
    .node-item.selected .node-device-type,
    .node-item.selected .node-area,
    .node-item.selected .node-vendor,
    .node-item.selected .node-endpoints,
    .node-item.selected .node-meta-sep,
    .node-item.selected .node-version {
      color: var(--text-primary-color);
      opacity: 1;
    }

    .node-meta-sep {
      color: var(--secondary-text-color);
      opacity: 0.5;
    }

    .node-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success-color, #4caf50);
    }

    .node-status.unavailable {
      background: var(--error-color, #f44336);
    }

    .endpoint-list {
      margin-left: 32px;
      margin-top: 8px;
    }

    .endpoint-item {
      padding: 10px 12px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      margin-bottom: 8px;
    }

    .endpoint-item:hover {
      background: var(--secondary-background-color);
      border-color: var(--primary-color);
    }

    .endpoint-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .endpoint-item.no-binding {
      opacity: 0.6;
      cursor: not-allowed;
      border-style: dashed;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .endpoint-id {
      font-weight: 500;
    }

    .endpoint-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .endpoint-badge.binding {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .endpoint-device-types {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }

    .endpoint-item.selected .endpoint-device-types {
      color: var(--text-primary-color);
      opacity: 0.9;
    }

    .endpoint-clusters {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .endpoint-item.selected .endpoint-clusters {
      color: var(--text-primary-color);
      opacity: 0.8;
    }

    .cluster-role {
      font-weight: 500;
      opacity: 0.7;
      margin-right: 4px;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      gap: 2px;
    }

    .node-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .node-vendor {
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .node-device-type {
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .node-area {
      color: var(--primary-color);
      opacity: 0.9;
    }

    .node-endpoints {
      color: var(--secondary-text-color);
      opacity: 0.7;
    }

    .node-endpoints.has-binding {
      color: var(--success-color, #4caf50);
      opacity: 1;
    }

    .node-details {
      margin-left: 32px;
      margin-top: 8px;
    }

    .node-version {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.6;
      margin-left: auto;
    }

    .no-endpoints {
      font-size: 13px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
    }

    .bindings-panel {
      min-height: 400px;
    }

    .binding-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .binding-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .binding-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .binding-arrow {
      color: var(--primary-color);
      font-size: 20px;
    }

    .binding-target {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .binding-target-name {
      font-weight: 500;
    }

    .binding-cluster {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .delete-btn {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--secondary-text-color);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    .error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color, #f44336);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    /* Dialog styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      min-width: 400px;
      max-width: 90vw;
    }

    .dialog-header {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .form-select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .dialog-warning {
      background: var(--warning-color, #ff9800);
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .no-clusters-warning {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.4;
    }

    .form-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Overview Tab Styles */
    .overview-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .overview-card {
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .overview-card .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--divider-color);
      font-size: 16px;
      font-weight: 500;
    }

    .count-badge {
      background: var(--primary-color);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: normal;
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .binding-list {
      padding: 8px 0;
    }

    .overview-binding-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .overview-binding-row:last-child {
      border-bottom: none;
    }

    .overview-binding-row.recommendation {
      background: var(--secondary-background-color);
    }

    .binding-source,
    .binding-target {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      min-width: 180px;
      flex: 1;
    }

    .binding-source > div:first-child,
    .binding-target > div:first-child {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .binding-source .node-name,
    .binding-target .node-name {
      font-weight: 500;
    }

    .endpoint-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .area-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .binding-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .binding-arrow {
      color: var(--primary-color);
      font-size: 18px;
      flex-shrink: 0;
    }

    .binding-cluster-badge {
      background: var(--primary-color);
      color: white;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .compatible-clusters {
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 4px 8px;
      border-radius: 4px;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--secondary-text-color);
    }

    .btn-icon:hover {
      background: var(--secondary-background-color);
    }

    .btn-icon.delete {
      color: var(--error-color, #f44336);
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .group-target {
      font-style: italic;
      color: var(--secondary-text-color);
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .filter-controls label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .filter-info {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .toggle-switch {
      position: relative;
      width: 40px;
      height: 22px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--disabled-color, #ccc);
      transition: 0.3s;
      border-radius: 22px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
      background-color: var(--primary-color);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(18px);
    }

    .btn-loading {
      position: relative;
      color: transparent !important;
    }

    .btn-loading::after {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      top: 50%;
      left: 50%;
      margin-left: -7px;
      margin-top: -7px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .btn-icon.btn-loading::after,
    .delete-btn.btn-loading::after {
      border-color: rgba(244, 67, 54, 0.3);
      border-top-color: var(--error-color, #f44336);
    }

    .confirm-dialog {
      max-width: 500px;
    }

    .confirm-dialog .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .confirm-icon {
      font-size: 24px;
    }

    .binding-explanation {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .binding-explanation-header {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
    }

    .binding-explanation-content {
      font-size: 16px;
      line-height: 1.6;
    }

    .binding-explanation-content strong {
      color: var(--primary-color);
    }

    .binding-devices {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 20px 0;
    }

    .binding-device-card {
      flex: 1;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .binding-device-card.source {
      border-color: var(--primary-color);
    }

    .binding-device-card.target {
      border-color: var(--success-color, #4caf50);
    }

    .binding-device-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .binding-device-endpoint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .binding-device-area {
      font-size: 11px;
      color: var(--secondary-text-color);
      font-style: italic;
      margin-top: 4px;
    }

    .binding-arrow-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .binding-arrow-large {
      font-size: 24px;
      color: var(--primary-color);
    }

    .binding-cluster-label {
      font-size: 11px;
      background: var(--primary-color);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .cluster-select-group {
      margin-top: 16px;
    }

    .cluster-select-group label {
      display: block;
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    /* Readable binding rows */
    .overview-binding-row.readable {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
    }

    .binding-description {
      flex: 1;
      min-width: 0;
    }

    .binding-sentence {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .binding-sentence strong {
      color: var(--primary-text-color);
    }

    .binding-action {
      color: var(--secondary-text-color);
      margin: 0 4px;
    }

    .binding-meta {
      font-size: 12px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .overview-binding-row.recommendation .binding-action {
      color: var(--primary-color);
    }
  `,e([le({attribute:!1})],Ue.prototype,"hass",void 0),e([le({type:Boolean})],Ue.prototype,"narrow",void 0),e([ce()],Ue.prototype,"_nodes",void 0),e([ce()],Ue.prototype,"_selectedSourceNode",void 0),e([ce()],Ue.prototype,"_selectedSourceEndpoint",void 0),e([ce()],Ue.prototype,"_bindings",void 0),e([ce()],Ue.prototype,"_groups",void 0),e([ce()],Ue.prototype,"_loading",void 0),e([ce()],Ue.prototype,"_error",void 0),e([ce()],Ue.prototype,"_activeTab",void 0),e([ce()],Ue.prototype,"_showCreateDialog",void 0),e([ce()],Ue.prototype,"_allBindings",void 0),e([ce()],Ue.prototype,"_recommendations",void 0),e([ce()],Ue.prototype,"_overviewLoading",void 0),e([ce()],Ue.prototype,"_surveySubmitting",void 0),e([ce()],Ue.prototype,"_selectedTargetNodeId",void 0),e([ce()],Ue.prototype,"_selectedTargetEndpointId",void 0),e([ce()],Ue.prototype,"_filterSameAreaOnly",void 0),e([ce()],Ue.prototype,"_actionInProgress",void 0),e([ce()],Ue.prototype,"_pendingBindingRecommendation",void 0),e([ce()],Ue.prototype,"_selectedClusterForBinding",void 0),e([ce()],Ue.prototype,"_pendingDeleteBinding",void 0),Ue=e([(e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)})("matter-binding-helper-panel")],Ue);export{Ue as MatterBindingPanel};
