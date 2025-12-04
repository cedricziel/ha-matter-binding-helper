function e(e,t,i,n){var o,s=arguments.length,r=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(r=(s<3?o(r):s>3?o(t,i,r):o(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new s(i,e,n)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:d,defineProperty:c,getOwnPropertyDescriptor:l,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:h}=Object,u=globalThis,v=u.trustedTypes,m=v?v.emptyScript:"",_=u.reactiveElementPolyfillSupport,b=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},f=(e,t)=>!d(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:f};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&c(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:o}=l(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const s=n?.call(this);o?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(i)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of n){const n=document.createElement("style"),o=t.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=i.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=n;const s=o.fromAttribute(t,e.type);this[n]=s??this._$Ej?.get(n)??s,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const n=this.constructor,o=this[e];if(i??=n.getPropertyOptions(e),!((i.hasChanged??f)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:o},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==o||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,_?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,S=w.trustedTypes,k=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+E,T=`<${A}>`,D=document,N=()=>D.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,B=Array.isArray,z="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,M=/-->/g,O=/>/g,I=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,H=/"/g,L=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),W=new WeakMap,G=D.createTreeWalker(D,129);function V(e,t){if(!B(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}const K=(e,t)=>{const i=e.length-1,n=[];let o,s=2===t?"<svg>":3===t?"<math>":"",r=R;for(let t=0;t<i;t++){const i=e[t];let a,d,c=-1,l=0;for(;l<i.length&&(r.lastIndex=l,d=r.exec(i),null!==d);)l=r.lastIndex,r===R?"!--"===d[1]?r=M:void 0!==d[1]?r=O:void 0!==d[2]?(L.test(d[2])&&(o=RegExp("</"+d[2],"g")),r=I):void 0!==d[3]&&(r=I):r===I?">"===d[0]?(r=o??R,c=-1):void 0===d[1]?c=-2:(c=r.lastIndex-d[2].length,a=d[1],r=void 0===d[3]?I:'"'===d[3]?H:U):r===H||r===U?r=I:r===M||r===O?r=R:(r=I,o=void 0);const p=r===I&&e[t+1].startsWith("/>")?" ":"";s+=r===R?i+T:c>=0?(n.push(a),i.slice(0,c)+C+i.slice(c)+E+p):i+E+(-2===c?t:p)}return[V(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class J{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let o=0,s=0;const r=e.length-1,a=this.parts,[d,c]=K(e,t);if(this.el=J.createElement(d,i),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=G.nextNode())&&a.length<r;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(C)){const t=c[s++],i=n.getAttribute(e).split(E),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:o,name:r[2],strings:i,ctor:"."===r[1]?ee:"?"===r[1]?te:"@"===r[1]?ie:Y}),n.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:o}),n.removeAttribute(e));if(L.test(n.tagName)){const e=n.textContent.split(E),t=e.length-1;if(t>0){n.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],N()),G.nextNode(),a.push({type:2,index:++o});n.append(e[t],N())}}}else if(8===n.nodeType)if(n.data===A)a.push({type:2,index:o});else{let e=-1;for(;-1!==(e=n.data.indexOf(E,e+1));)a.push({type:7,index:o}),e+=E.length-1}o++}}static createElement(e,t){const i=D.createElement("template");return i.innerHTML=e,i}}function Z(e,t,i=e,n){if(t===F)return t;let o=void 0!==n?i._$Co?.[n]:i._$Cl;const s=P(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),void 0===s?o=void 0:(o=new s(e),o._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=o:i._$Cl=o),void 0!==o&&(t=Z(e,o._$AS(e,t.values),o,n)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??D).importNode(t,!0);G.currentNode=n;let o=G.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new X(o,o.nextSibling,this,e):1===a.type?t=new a.ctor(o,a.name,a.strings,this,e):6===a.type&&(t=new ne(o,this,e)),this._$AV.push(t),a=i[++r]}s!==a?.index&&(o=G.nextNode(),s++)}return G.currentNode=D,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),P(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>B(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(D.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new Q(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new J(e)),t}k(e){B(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const o of e)n===t.length?t.push(i=new X(this.O(N()),this.O(N()),this,this.options)):i=t[n],i._$AI(o),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,o){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,n){const o=this.strings;let s=!1;if(void 0===o)e=Z(this,e,t,0),s=!P(e)||e!==this._$AH&&e!==F,s&&(this._$AH=e);else{const n=e;let r,a;for(e=o[0],r=0;r<o.length-1;r++)a=Z(this,n[i+r],t,r),a===F&&(a=this._$AH[r]),s||=!P(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+o[r+1]),this._$AH[r]=a}s&&!n&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Y{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class te extends Y{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class ie extends Y{constructor(e,t,i,n,o){super(e,t,i,n,o),this.type=5}_$AI(e,t=this){if((e=Z(this,e,t,0)??q)===F)return;const i=this._$AH,n=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==q&&(i===q||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const oe=w.litHtmlPolyfillSupport;oe?.(J,X),(w.litHtmlVersions??=[]).push("3.3.1");const se=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class re extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let o=n._$litPart$;if(void 0===o){const e=i?.renderBefore??null;n._$litPart$=o=new X(t.insertBefore(N(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}re._$litElement$=!0,re.finalized=!0,se.litElementHydrateSupport?.({LitElement:re});const ae=se.litElementPolyfillSupport;ae?.({LitElement:re}),(se.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:f},le=(e=ce,t,i)=>{const{kind:n,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,o,e)},init(t){return void 0!==t&&this.C(n,void 0,e,t),t}}}if("setter"===n){const{name:n}=i;return function(i){const o=this[n];t.call(this,i),this.requestUpdate(n,o,e)}}throw Error("Unsupported decorator location: "+n)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pe(e){return(t,i)=>"object"==typeof i?le(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return pe({...e,state:!0,attribute:!1})}const he=319486977,ue={id:he,vendorId:4874,name:"Eve Thermo",description:"Eve thermostat proprietary cluster for schedule and valve data",attributes:[{id:319422464,name:"schedule",type:{type:"blob",parser:"eve.schedule"},access:["R"],description:"Heating schedule binary data. Contains weekly schedule with day entries and time slots.",parser:"eve.schedule"},{id:319422488,name:"valvePosition",type:"uint8",access:["R","S"],description:"Current valve opening position",unit:"%",sensor:{entityType:"sensor",stateClass:"measurement",entityCategory:"diagnostic",icon:"mdi:valve"}},{id:319422480,name:"temperatureOffset",type:"int8",access:["R","W"],description:"Temperature calibration offset. Value in 0.1°C increments.",unit:"°C",sensor:{entityType:"number",deviceClass:"temperature",entityCategory:"config",scale:.1,icon:"mdi:thermometer-plus"}}]},ve=4447,me=291503106,_e={id:me,vendorId:ve,name:"Aqara Lock Settings",description:"Aqara proprietary lock settings cluster. Attribute meanings are partially documented.",attributes:[{id:291438609,name:"setting1",type:"uint8",access:["R"],description:"Unknown setting (possibly lock mode). Observed value: 1"},{id:291438610,name:"setting2",type:"uint8",access:["R"],description:"Unknown setting (possibly sound). Observed value: 2"},{id:291438611,name:"setting3",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438612,name:"setting4",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438613,name:"setting5",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 1"}]},be={id:323746816,vendorId:ve,name:"Aqara Unknown",description:"Unknown Aqara proprietary cluster found on endpoint 0",attributes:[{id:323682304,name:"unknown",type:"bool",access:["R"],description:"Unknown boolean attribute. Observed value: true"}]},ye=[...[{id:"eve_thermo",fingerprint:{vendorId:4874,requiredClusters:[he],requiredDeviceTypes:[769]},vendor:"Eve Systems",model:"Eve Thermo",description:"Smart radiator valve with Thread/Matter, HomeKit and weekly heating schedules",extends:[{name:"thermostatSchedule",clusters:[ue],uiComponent:"eve-schedule",showInDetails:!0}],productUrl:"https://www.evehome.com/eve-thermo"}],...[{id:"aqara_u200",fingerprint:{vendorId:ve,requiredClusters:[me],requiredDeviceTypes:[10]},vendor:"Aqara",model:"Smart Lock U200",description:"Smart lock with Matter, fingerprint reader, NFC, and smartphone unlock",extends:[{name:"aqaraLockSettings",clusters:[_e,be],showInDetails:!0}],productUrl:"https://www.aqara.com/eu/product/smart-lock-u200"},{id:"aqara_w100",fingerprint:{vendorId:ve,productNamePattern:"W100",requiredDeviceTypes:[770]},vendor:"Aqara",model:"Climate Sensor W100",description:"Temperature and humidity sensor with Matter support. Uses standard clusters only.",productUrl:"https://www.aqara.com/eu/product/temperature-humidity-sensor-w100"}]],fe=[...[ue],...[_e,be]];const xe={4874:"Eve",4447:"Aqara"};function $e(e){return e>=65536}function we(e){const t=function(e){return fe.find(t=>t.id===e)}(e);if(t)return t.name;if($e(e)){const t=function(e){return $e(e)?e>>16&65535:null}(e);if(t){const i=function(e){return xe[e]||`Vendor ${e}`}(t);return`${i} Proprietary (0x${e.toString(16)})`}return`Proprietary (0x${e.toString(16)})`}return`Cluster 0x${e.toString(16).padStart(4,"0")}`}function Se(e,t,i){return function(e,t,i){return ye.find(n=>{const o=n.fingerprint;return o.vendorId===e&&(!(o.requiredClusters&&t&&!o.requiredClusters.every(e=>t.includes(e)))&&!(o.requiredDeviceTypes&&i&&!o.requiredDeviceTypes.every(e=>i.includes(e))))})}(e,t,i)}const ke=3,Ce=4,Ee=5,Ae=6,Te=8,De=29,Ne=30,Pe=31,Be=40,ze=47,Re=768,Me=513,Oe=516,Ie=1026,Ue=1027,He=1029,Le=1030,je=59,Fe={[ke]:"Identify",[Ce]:"Groups",[Ee]:"Scenes",[Ae]:"On/Off",[Te]:"Level Control",[De]:"Descriptor",[Ne]:"Binding",[Pe]:"Access Control",[Be]:"Basic Information",42:"OTA Update",[ze]:"Power Source",48:"General Commissioning",49:"Network Commissioning",50:"Diagnostic Logs",51:"General Diagnostics",52:"Software Diagnostics",53:"Thread Diagnostics",56:"Ethernet Diagnostics",60:"Admin Commissioning",62:"Operational Credentials",63:"Group Key Management",70:"Time Sync",[Re]:"Color Control",[Me]:"Thermostat",[Oe]:"Thermostat UI",514:"Fan Control",[Ie]:"Temperature",[Ue]:"Pressure",[He]:"Humidity",[Le]:"Occupancy",[je]:"Switch"},qe={15:"Generic Switch",17:"Power Source",18:"OTA Requestor",19:"OTA Provider",20:"Aggregator",22:"Root Node",256:"On/Off Light",257:"Dimmable Light",258:"Color Temperature Light",259:"On/Off Light Switch",260:"Dimmer Switch",261:"Color Dimmer Switch",262:"Light Sensor",263:"Occupancy Sensor",266:"On/Off Plug-in Unit",267:"Dimmable Plug-in Unit",268:"Color Temperature Light",269:"Extended Color Light",769:"Thermostat",770:"Temperature Sensor",771:"Humidity Sensor",772:"Air Quality Sensor",10:"Door Lock",11:"Door Lock Controller",514:"Window Covering",515:"Window Covering Controller",21:"Contact Sensor",38:"Flow Sensor",44:"Smoke/CO Alarm",35:"Casting Video Player",36:"Content App",40:"Basic Video Player",41:"Casting Video Client",43:"Speaker"},We={[Ae]:{action:"control the on/off state of",dataType:"on/off commands"},[Te]:{action:"control the brightness/level of",dataType:"level/dimming commands"},[Re]:{action:"control the color of",dataType:"color commands"},[Ie]:{action:"read temperature data from",dataType:"temperature readings"},[Ue]:{action:"read pressure data from",dataType:"pressure readings"},[He]:{action:"read humidity data from",dataType:"humidity readings"},[Le]:{action:"receive occupancy status from",dataType:"occupancy/presence data"},[Me]:{action:"control thermostat settings on",dataType:"thermostat commands"},[Ee]:{action:"trigger scenes on",dataType:"scene commands"},[Ce]:{action:"manage group membership on",dataType:"group commands"},[je]:{action:"send button events to",dataType:"press/release events"}};function Ge(e){return Fe[e]?Fe[e]:we(e)}function Ve(e){return qe[e]||`Type ${e}`}function Ke(e){return We[e]||{action:"communicate with",dataType:`${Ge(e)} data`}}const Je=[{id:"thermostat-contact-window",sourceDeviceTypes:[769],targetDeviceTypes:[21],title:"Turn off heating when window opens",description:"Automatically pause heating/cooling when a window or door is opened to save energy.",why:"This thermostat doesn't have a client cluster for Boolean State (contact sensors). Matter bindings require matching client/server clusters.",icon:"🪟"},{id:"thermostat-occupancy",sourceDeviceTypes:[769],targetDeviceTypes:[263],title:"Adjust temperature based on occupancy",description:"Lower the temperature when room is unoccupied, restore when someone enters.",why:"This thermostat doesn't have a client cluster for Occupancy Sensing. A Home Assistant automation can bridge this gap.",icon:"🚶"},{id:"light-occupancy",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[263],title:"Turn on light when motion detected",description:"Automatically turn on lights when someone enters the room.",why:"This light is a server (receives commands), not a client. The occupancy sensor reports state but can't send on/off commands to it.",icon:"💡"},{id:"light-contact-door",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[21],title:"Turn on light when door opens",description:"Automatically turn on lights when a door is opened (e.g., closet light).",why:"This contact sensor reports open/close state but doesn't have client clusters to control lights directly.",icon:"🚪"},{id:"plug-occupancy",sourceDeviceTypes:[266,267],targetDeviceTypes:[263],title:"Control device based on occupancy",description:"Turn on/off a device when room occupancy changes.",why:"This plug is a server (receives commands). The occupancy sensor can't directly control it via Matter binding.",icon:"🔌"},{id:"button-light-toggle",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[15],title:"Toggle light with button press",description:"Press the button to toggle light on/off. Long press for dimming, double-tap for scenes.",why:"Generic Switch emits button events (press/release/multi-press) rather than state changes. Home Assistant automations can respond to these events to control lights.",icon:"🔘"},{id:"button-plug-toggle",sourceDeviceTypes:[266,267],targetDeviceTypes:[15],title:"Toggle device with button press",description:"Use a physical button to control a smart plug or outlet.",why:"Generic Switch emits button events that need Home Assistant automation to translate into on/off commands for the plug.",icon:"🔘"},{id:"button-scene",sourceDeviceTypes:[256,257,258,266,267,268,269,769],targetDeviceTypes:[15],title:"Trigger scene with button",description:"Assign different scenes to single press, double press, and long press actions.",why:"Matter scenes via binding require specific cluster support. Home Assistant automations offer more flexibility for multi-press actions.",icon:"🎬"},{id:"button-thermostat-adjust",sourceDeviceTypes:[769],targetDeviceTypes:[15],title:"Adjust thermostat with buttons",description:"Use buttons to raise/lower temperature setpoint or switch heating/cooling modes.",why:"Generic Switch button events need Home Assistant automation to adjust thermostat settings. Perfect for climate sensors with built-in buttons.",icon:"🌡️"}],Ze=319486977,Qe=["sunday","monday","tuesday","wednesday","thursday","friday","saturday","away"],Xe=["monday","tuesday","wednesday","thursday","friday"],Ye=["saturday","sunday"];function et(e){const t=e%60;return`${Math.floor(e/60).toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}const tt="matter_binding_helper";async function it(e,t,i){return e.callWS({type:`${tt}/list_bindings`,node_id:t,endpoint_id:i})}async function nt(e,t,i,n,o,s,r){return e.callWS({type:`${tt}/create_binding`,source_node_id:t,source_endpoint_id:i,cluster_id:n,...void 0!==o&&{target_node_id:o},...void 0!==s&&{target_endpoint_id:s},...void 0!==r})}async function ot(e,t,i,n,o,s){return e.callWS({type:`${tt}/delete_binding`,source_node_id:t,source_endpoint_id:i,...void 0!==n&&{target_node_id:n},...void 0!==o&&{target_endpoint_id:o},...void 0!==s&&{target_group_id:s}})}const st={sunday:"Sun",monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",away:"Away"};let rt=class extends re{constructor(){super(...arguments),this._loading=!1,this._saving=!1,this._error=null,this._success=null,this._notSupported=!1,this._schedule=null,this._selectedDays=new Set(Xe),this._transitions=[],this._hasChanges=!1}connectedCallback(){super.connectedCallback(),this._loadSchedule()}async _loadSchedule(){this._loading=!0,this._error=null,this._notSupported=!1;const e=(this.endpoint.cluster_commands||{})[513];if(void 0!==e&&!(e?.accepted||[]).includes(2))return this._notSupported=!0,void(this._loading=!1);try{const e=await async function(e,t,i,n,o=!0,s=!1){return e.callWS({type:`${tt}/get_schedule`,node_id:t,endpoint_id:i,...n,heat:o,cool:s})}(this.hass,this.node.node_id,this.endpoint.endpoint_id);e.schedule&&(this._schedule=e.schedule,this._selectedDays=new Set(e.schedule.day_names),this._transitions=[...e.schedule.transitions],this._hasChanges=!1)}catch(e){console.error("Failed to load schedule - full error:",JSON.stringify(e,null,2)),console.error("Failed to load schedule - raw:",e);const t=e;if("schedule_not_supported"===t?.code)return void(this._notSupported=!0);let i;if(e instanceof Error)i=e.message;else if("object"==typeof e&&null!==e){const t=e;i=t.message||t.error||t.code||JSON.stringify(e)}else i=String(e);this._error=`Failed to load schedule: ${i}`}finally{this._loading=!1}}async _saveSchedule(){if(0!==this._selectedDays.size)if(0!==this._transitions.length){this._saving=!0,this._error=null,this._success=null;try{const e=[...this._transitions].sort((e,t)=>e.transition_time-t.transition_time);(await async function(e,t,i,n,o,s=!0,r=!1){return e.callWS({type:`${tt}/set_schedule`,node_id:t,endpoint_id:i,days:n,transitions:o,heat:s,cool:r})}(this.hass,this.node.node_id,this.endpoint.endpoint_id,Array.from(this._selectedDays),e,!0,!1)).success?(this._success="Schedule saved to device",this._hasChanges=!1,setTimeout(()=>this._loadSchedule(),1e3)):this._error="Failed to save schedule"}catch(e){console.error("Failed to save schedule:",e);const t=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to save schedule: ${t}`}finally{this._saving=!1}}else this._error="Please add at least one time slot";else this._error="Please select at least one day"}async _clearSchedule(){if(confirm("Are you sure you want to clear all schedules from this device?")){this._saving=!0,this._error=null,this._success=null;try{(await async function(e,t,i){return e.callWS({type:`${tt}/clear_schedule`,node_id:t,endpoint_id:i})}(this.hass,this.node.node_id,this.endpoint.endpoint_id)).success?(this._success="Schedule cleared",this._schedule=null,this._transitions=[],this._hasChanges=!1):this._error="Failed to clear schedule"}catch(e){console.error("Failed to clear schedule:",e);const t=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to clear schedule: ${t}`}finally{this._saving=!1}}}_toggleDay(e){const t=new Set(this._selectedDays);t.has(e)?t.delete(e):t.add(e),this._selectedDays=t,this._hasChanges=!0}_selectPreset(e){switch(e){case"weekdays":this._selectedDays=new Set(Xe);break;case"weekend":this._selectedDays=new Set(Ye);break;case"all":this._selectedDays=new Set(Qe.filter(e=>"away"!==e))}this._hasChanges=!0}_addTransition(){let e=360;if(this._transitions.length>0){const t=Math.max(...this._transitions.map(e=>e.transition_time));e=Math.min(t+60,1380)}this._transitions=[...this._transitions,{transition_time:e,heat_setpoint:20,cool_setpoint:null}],this._hasChanges=!0}_updateTransitionTime(e,t){const i=function(e){const[t,i]=e.split(":").map(Number);return 60*t+i}(t);this._transitions=this._transitions.map((t,n)=>n===e?{...t,transition_time:i}:t),this._hasChanges=!0}_updateTransitionTemp(e,t){const i=parseFloat(t);isNaN(i)||(this._transitions=this._transitions.map((t,n)=>n===e?{...t,heat_setpoint:i}:t),this._hasChanges=!0)}_deleteTransition(e){this._transitions=this._transitions.filter((t,i)=>i!==e),this._hasChanges=!0}_getTimelineSegments(){if(0===this._transitions.length)return[];const e=[...this._transitions].sort((e,t)=>e.transition_time-t.transition_time),t=[],i=e=>`hsl(${240*(1-Math.max(0,Math.min(1,(e-15)/10)))}, 70%, 50%)`;for(let n=0;n<e.length;n++){const o=e[n],s=e[n+1],r=o.heat_setpoint??20;t.push({start:o.transition_time,end:s?s.transition_time:1440,temp:r,color:i(r)})}if(e.length>0&&e[0].transition_time>0){const n=e[e.length-1].heat_setpoint??20;t.unshift({start:0,end:e[0].transition_time,temp:n,color:i(n)})}return t}render(){return this._notSupported?j`
        <div class="not-supported-card">
          <div class="header">
            <ha-icon icon="mdi:calendar-remove"></ha-icon>
            <span class="title">Weekly Schedule Not Supported</span>
          </div>
          <div class="description">
            This thermostat does not support the standard Matter weekly schedule commands.
            The manufacturer may use a proprietary scheduling method or the device may not
            support programmable schedules through Matter.
          </div>
        </div>
      `:j`
      <div class="schedule-editor">
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            Weekly Schedule
            ${this._hasChanges?j`<span class="changes-indicator">Unsaved</span>`:q}
          </div>
          <div class="actions">
            <button
              class="btn btn-secondary"
              @click=${this._loadSchedule}
              ?disabled=${this._loading||this._saving}
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
              Reload
            </button>
            <button
              class="btn btn-danger"
              @click=${this._clearSchedule}
              ?disabled=${this._loading||this._saving}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
              Clear
            </button>
            <button
              class="btn btn-primary"
              @click=${this._saveSchedule}
              ?disabled=${this._loading||this._saving||!this._hasChanges}
            >
              <ha-icon icon="mdi:content-save"></ha-icon>
              ${this._saving?"Saving...":"Save"}
            </button>
          </div>
        </div>

        ${this._error?j`
          <div class="message error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            ${this._error}
          </div>
        `:q}

        ${this._success?j`
          <div class="message success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            ${this._success}
          </div>
        `:q}

        ${this._loading?j`
          <div class="loading">
            <div class="spinner"></div>
            Loading schedule from device...
          </div>
        `:j`
          <!-- Day Selection -->
          <div class="section">
            <div class="section-title">Apply to days</div>
            <div class="day-selector">
              ${Qe.filter(e=>"away"!==e).map(e=>j`
                <div
                  class="day-chip ${this._selectedDays.has(e)?"selected":""}"
                  @click=${()=>this._toggleDay(e)}
                >
                  ${st[e]}
                </div>
              `)}
            </div>
            <div class="day-presets">
              <button class="preset-btn" @click=${()=>this._selectPreset("weekdays")}>
                Weekdays
              </button>
              <button class="preset-btn" @click=${()=>this._selectPreset("weekend")}>
                Weekend
              </button>
              <button class="preset-btn" @click=${()=>this._selectPreset("all")}>
                Every day
              </button>
            </div>
          </div>

          <!-- Time Slots -->
          <div class="section">
            <div class="section-title">Time slots (max 10)</div>
            <div class="transitions-list">
              ${0===this._transitions.length?j`
                <div class="empty-state">
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                  <p>No time slots configured.<br>Add a time slot to set temperatures throughout the day.</p>
                </div>
              `:this._transitions.map((e,t)=>({...e,index:t})).sort((e,t)=>e.transition_time-t.transition_time).map(e=>j`
                  <div class="transition-row">
                    <div class="transition-time">
                      <label>Time</label>
                      <input
                        type="time"
                        .value=${et(e.transition_time)}
                        @change=${t=>this._updateTransitionTime(e.index,t.target.value)}
                      />
                    </div>
                    <div class="transition-temp">
                      <label>Heat setpoint</label>
                      <div class="temp-input-group">
                        <input
                          type="number"
                          min="5"
                          max="35"
                          step="0.5"
                          .value=${e.heat_setpoint?.toString()??"20"}
                          @change=${t=>this._updateTransitionTemp(e.index,t.target.value)}
                        />
                        <span class="temp-unit">°C</span>
                      </div>
                    </div>
                    <button
                      class="transition-delete"
                      @click=${()=>this._deleteTransition(e.index)}
                      title="Remove time slot"
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                `)}

              ${this._transitions.length<10?j`
                <div class="add-transition" @click=${this._addTransition}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add time slot
                </div>
              `:q}
            </div>
          </div>

          <!-- Timeline Visualization -->
          ${this._transitions.length>0?j`
            <div class="section">
              <div class="section-title">Preview</div>
              <div class="timeline">
                <div class="timeline-labels">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>12 AM</span>
                </div>
                <div class="timeline-bar">
                  ${this._getTimelineSegments().map(e=>{const t=e.start/1440*100,i=(e.end-e.start)/1440*100;return j`
                      <div
                        class="timeline-segment"
                        style="left: ${t}%; width: ${i}%; background: ${e.color};"
                        title="${et(e.start)} - ${et(e.end)}: ${e.temp}°C"
                      >
                        ${i>8?`${e.temp}°`:""}
                      </div>
                    `})}
                </div>
              </div>
            </div>
          `:q}
        `}
      </div>
    `}};function at(e){return e.filter(e=>0!==e.endpoint_id&&e.server_clusters&&e.server_clusters.length>0)}function dt(e){const t=at(e.endpoints);return t.length>0?t[0]:null}rt.styles=r`
    :host {
      display: block;
    }

    .schedule-editor {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title ha-icon {
      color: var(--primary-color);
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--divider-color);
    }

    .btn-danger {
      background: var(--error-color);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      padding: 8px;
      min-width: 36px;
      justify-content: center;
    }

    /* Day Selection */
    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .day-chip {
      padding: 8px 16px;
      border-radius: 20px;
      border: 2px solid var(--divider-color);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }

    .day-chip:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .day-chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .day-presets {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .preset-btn {
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .preset-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Transitions */
    .transitions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transition-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .transition-time {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-time label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .transition-time input {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: monospace;
    }

    .transition-temp {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-temp label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .temp-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .temp-input-group input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      text-align: center;
    }

    .temp-unit {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .transition-delete {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 50%;
      transition: all 0.2s;
    }

    .transition-delete:hover {
      background: var(--error-color);
      color: white;
    }

    .add-transition {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 14px;
      transition: all 0.2s;
    }

    .add-transition:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Timeline visualization */
    .timeline {
      position: relative;
      height: 60px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      margin-top: 16px;
      overflow: hidden;
    }

    .timeline-labels {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }

    .timeline-bar {
      position: absolute;
      top: 20px;
      left: 8px;
      right: 8px;
      height: 24px;
      background: var(--divider-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .timeline-segment {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 4px;
    }

    .timeline-markers {
      position: absolute;
      bottom: 4px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
    }

    .timeline-marker {
      font-size: 9px;
      color: var(--secondary-text-color);
    }

    /* Messages */
    .message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message.error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color);
    }

    .message.success {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success-color);
    }

    .message.info {
      background: rgba(33, 150, 243, 0.1);
      color: var(--info-color);
    }

    /* Not Supported Card */
    .not-supported-card {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .not-supported-card .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .not-supported-card .header ha-icon {
      color: var(--warning-color);
      font-size: 24px;
    }

    .not-supported-card .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .not-supported-card .description {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.5;
    }

    /* Loading */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Changes indicator */
    .changes-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--warning-color);
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
  `,e([pe({attribute:!1})],rt.prototype,"hass",void 0),e([pe({attribute:!1})],rt.prototype,"node",void 0),e([pe({attribute:!1})],rt.prototype,"endpoint",void 0),e([ge()],rt.prototype,"_loading",void 0),e([ge()],rt.prototype,"_saving",void 0),e([ge()],rt.prototype,"_error",void 0),e([ge()],rt.prototype,"_success",void 0),e([ge()],rt.prototype,"_notSupported",void 0),e([ge()],rt.prototype,"_schedule",void 0),e([ge()],rt.prototype,"_selectedDays",void 0),e([ge()],rt.prototype,"_transitions",void 0),e([ge()],rt.prototype,"_hasChanges",void 0),rt=e([de("thermostat-schedule-editor")],rt);const ct=[29,40,30,3,4,31,41,42,43,44,48,49,60,62,63,51,52,53,54,55,59];let lt=class extends re{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="overview",this._showCreateDialog=!1,this._allBindings=[],this._recommendations=[],this._overviewLoading=!1,this._surveySubmitting=!1,this._surveyResult=null,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null,this._filterSameAreaOnly=!0,this._actionInProgress=null,this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null,this._pendingManualBinding=null,this._pendingDeleteBinding=null,this._automationRecommendations=[],this._eveSchedules=new Map,this._eveScheduleLoading=new Set}firstUpdated(){this._loadNodes().then(()=>{"overview"===this._activeTab&&this._loadOverviewData()})}async _loadNodes(){this._loading=!0,this._error=null;try{const e=await async function(e){return e.callWS({type:`${tt}/list_nodes`})}(this.hass);this._nodes=e.nodes}catch(e){this._error=`Failed to load nodes: ${e}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const e=await it(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=e.bindings}catch(e){this._error=`Failed to load bindings: ${e}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const e=await async function(e){return e.callWS({type:`${tt}/list_groups`})}(this.hass);this._groups=e.groups}catch(e){this._error=`Failed to load groups: ${e}`}finally{this._loading=!1}}_isEveDevice(e){return e.endpoints.some(e=>e.server_clusters.includes(Ze))}async _loadEveSchedule(e){if(this._eveSchedules.has(e.node_id)||this._eveScheduleLoading.has(e.node_id))return;const t=e.endpoints.find(e=>e.server_clusters.includes(Ze)&&e.endpoint_id>0);if(t){this._eveScheduleLoading=new Set([...this._eveScheduleLoading,e.node_id]);try{const i=await async function(e,t,i=1){return e.callWS({type:`${tt}/get_eve_schedule`,node_id:t,endpoint_id:i})}(this.hass,e.node_id,t.endpoint_id);i.schedule&&(this._eveSchedules=new Map(this._eveSchedules).set(e.node_id,i.schedule))}catch(t){console.error(`Failed to load Eve schedule for node ${e.node_id}:`,t)}finally{const t=new Set(this._eveScheduleLoading);t.delete(e.node_id),this._eveScheduleLoading=t}}}_renderEveSchedule(e){if(!this._isEveDevice(e))return q;if(this._eveScheduleLoading.has(e.node_id))return j`
        <div class="device-section">
          <div class="section-header">Heating Schedule</div>
          <div class="eve-schedule-loading">Loading Eve schedule...</div>
        </div>
      `;const t=this._eveSchedules.get(e.node_id);if(!t)return q;const i={'"':"Comfort",$:"Eco","%":"Boost","&":"Off","*":"Custom"};return j`
      <div class="device-section">
        <div class="section-header">
          Heating Schedule
          ${t.name?j`<span class="section-context">${t.name}</span>`:q}
        </div>

        ${t.day_assignments.length>0?j`
              <div class="eve-schedule-grid">
                ${t.day_assignments.map(e=>j`
                    <div class="eve-day-slot">
                      <div class="eve-day-name">${e.day.slice(0,3)}</div>
                      <div class="eve-day-profile">${i[e.profile_id]||e.profile_id}</div>
                    </div>
                  `)}
              </div>
            `:q}

        ${t.time_slots.length>0?j`
              <div class="eve-time-slots">
                ${t.time_slots.map(e=>j`
                    <div class="eve-time-slot">
                      <span class="eve-time">${e.time}</span>
                      <span class="eve-profile">${i[e.profile_id]||e.profile_id}</span>
                    </div>
                  `)}
              </div>
            `:q}
      </div>
    `}_renderThermostatSchedule(e){if(this._isEveDevice(e))return q;const t=e.endpoints.find(e=>{return(t=e).server_clusters.includes(513)&&t.device_types.some(e=>769===e.id);var t});return t?j`
      <thermostat-schedule-editor
        .hass=${this.hass}
        .node=${e}
        .endpoint=${t}
      ></thermostat-schedule-editor>
    `:q}async _loadOverviewData(){this._overviewLoading=!0,this._error=null;try{const e=[];for(const t of this._nodes)for(const i of t.endpoints)if(i.has_binding_cluster)try{const n=await it(this.hass,t.node_id,i.endpoint_id);for(const o of n.bindings){const n=o.target_node_id&&this._nodes.find(e=>e.node_id===o.target_node_id)||null,s=n&&o.target_endpoint_id&&n.endpoints.find(e=>e.endpoint_id===o.target_endpoint_id)||null;e.push({binding:o,sourceNode:t,sourceEndpoint:i,targetNode:n,targetEndpoint:s})}}catch{}this._allBindings=e,this._recommendations=this._computeRecommendations(),this._automationRecommendations=this._computeAutomationRecommendations()}catch(e){this._error=`Failed to load overview data: ${e}`}finally{this._overviewLoading=!1}}_computeAutomationRecommendations(){const e=[],t=new Set;for(const i of this._nodes)for(const n of i.endpoints){const o=n.device_types.map(e=>e.id);for(const s of this._nodes)if(!i.area_name||!s.area_name||i.area_name===s.area_name)for(const r of s.endpoints){if(i.node_id===s.node_id)continue;const a=r.device_types.map(e=>e.id);for(const d of Je){const c=d.sourceDeviceTypes.some(e=>o.includes(e)),l=d.targetDeviceTypes.some(e=>a.includes(e));if(c&&l){const o=`${d.id}-${i.node_id}-${s.node_id}`;if(t.has(o))continue;t.add(o),e.push({template:d,sourceNode:i,sourceEndpoint:n,targetNode:s,targetEndpoint:r})}}}}return e}_computeRecommendations(){return function(e,t){const i=[];for(const n of e)for(const o of n.endpoints){const s=o.client_clusters||[];if(0!==s.length&&o.has_binding_cluster)for(const r of e)for(const e of r.endpoints){if(n.node_id===r.node_id&&o.endpoint_id===e.endpoint_id)continue;const a=e.server_clusters||[],d=s.filter(e=>a.includes(e));if(0===d.length)continue;const c=d.filter(i=>!t.some(t=>t.binding.node_id===n.node_id&&t.binding.endpoint_id===o.endpoint_id&&t.binding.target_node_id===r.node_id&&t.binding.target_endpoint_id===e.endpoint_id&&t.binding.cluster_id===i));0!==c.length&&i.push({sourceNode:n,sourceEndpoint:o,targetNode:r,targetEndpoint:e,compatibleClusters:c})}}return i.sort((e,t)=>t.compatibleClusters.length-e.compatibleClusters.length),i}(this._nodes,this._allBindings)}_selectNode(e){this._selectedSourceNode?.node_id===e.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=e,this._selectedSourceEndpoint=null,this._bindings=[],this._isEveDevice(e)&&this._loadEveSchedule(e))}_selectEndpoint(e,t){e.stopPropagation(),t.has_binding_cluster&&(this._selectedSourceEndpoint=t,this._loadBindings())}async _deleteBinding(e){if(!confirm("Are you sure you want to delete this binding?"))return;const t=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=t;try{await ot(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0),await this._loadBindings()}catch(e){this._error=`Failed to delete binding: ${e}`}finally{this._actionInProgress=null}}_openCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id);if(e.length>0){this._selectedTargetNodeId=e[0].node_id;const t=dt(e[0]);this._selectedTargetEndpointId=t?.endpoint_id??null}this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null}_handleTargetNodeChange(e){const t=e.target;this._selectedTargetNodeId=parseInt(t.value,10);const i=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId);if(i){const e=dt(i);this._selectedTargetEndpointId=e?.endpoint_id??null}}_handleTargetEndpointChange(e){const t=e.target;this._selectedTargetEndpointId=parseInt(t.value,10)}_getCompatibleClusters(){if(!this._selectedSourceEndpoint||!this._selectedTargetNodeId||!this._selectedTargetEndpointId)return[];const e=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),t=e?.endpoints.find(e=>e.endpoint_id===this._selectedTargetEndpointId);if(!t)return[];const i=this._selectedSourceEndpoint.client_clusters||[],n=t.server_clusters||[];return i.filter(e=>n.includes(e))}_handleReviewBinding(e){e.preventDefault();const t=e.target,i=new FormData(t),n=parseInt(i.get("targetNode"),10),o=parseInt(i.get("targetEndpoint"),10),s=parseInt(i.get("cluster"),10);if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return;const r=this._selectedSourceEndpoint.client_clusters||[],a=this._nodes.find(e=>e.node_id===n),d=a?.endpoints.find(e=>e.endpoint_id===o),c=d?.server_clusters||[];r.includes(s)?c.includes(s)?a&&d?(this._pendingManualBinding={sourceNode:this._selectedSourceNode,sourceEndpoint:this._selectedSourceEndpoint,targetNode:a,targetEndpoint:d,clusterId:s},this._showCreateDialog=!1):this._error="Invalid target selection":this._error=`Target endpoint does not have cluster ${Ge(s)} as a server cluster`:this._error=`Source endpoint does not have cluster ${Ge(s)} as a client cluster`}async _confirmManualBinding(){if(!this._pendingManualBinding)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n,clusterId:o}=this._pendingManualBinding,s=`create-${e.node_id}-${t.endpoint_id}-${i.node_id}-${n.endpoint_id}-${o}`;this._actionInProgress=s;try{await nt(this.hass,e.node_id,t.endpoint_id,o,i.node_id,n.endpoint_id),this._pendingManualBinding=null,await this._loadBindings()}catch(e){this._error=`Failed to create binding: ${e}`}finally{this._actionInProgress=null}}_closeManualBindingConfirmDialog(){this._pendingManualBinding=null}_getNodeName(e){const t=this._nodes.find(t=>t.node_id===e);return t?.name||`Node ${e}`}_getNodeDeviceId(e){const t=this._nodes.find(t=>t.node_id===e);return t?.ha_device_id}_getClusterName(e){return Fe[e]||`Cluster 0x${e.toString(16)}`}async _submitSurvey(){this._surveySubmitting=!0;try{await this.hass.callService("matter_binding_helper","submit_survey",{}),this._surveyResult={success:!0,message:"Survey submitted successfully! Thank you for contributing to Matter device research."}}catch(e){this._surveyResult={success:!1,message:`Failed to submit survey: ${e}`}}finally{this._surveySubmitting=!1}}_closeSurveyResultDialog(){this._surveyResult=null}_renderSurveyResultDialog(){if(!this._surveyResult)return q;const{success:e,message:t}=this._surveyResult;return j`
      <div class="dialog-overlay" @click=${this._closeSurveyResultDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${e?"✓":"✗"}</span>
            ${e?"Survey Submitted":"Survey Failed"}
          </div>
          <p style="margin: 16px 0; color: var(--primary-text-color);">${t}</p>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeSurveyResultDialog}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `}render(){return j`
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

        ${this._error?j`<div class="error">${this._error}</div>`:q}

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
            Devices
          </button>
          <button
            class="tab ${"groups"===this._activeTab?"active":""}"
            @click=${()=>{this._activeTab="groups",this._loadGroups()}}
          >
            Groups
          </button>
        </div>

        ${"overview"===this._activeTab?this._renderOverviewTab():"bindings"===this._activeTab?this._renderBindingsTab():this._renderGroupsTab()}
        ${this._showCreateDialog?this._renderCreateDialog():q}
        ${this._pendingBindingRecommendation?this._renderBindingConfirmDialog():q}
        ${this._pendingManualBinding?this._renderManualBindingConfirmDialog():q}
        ${this._pendingDeleteBinding?this._renderDeleteConfirmDialog():q}
        ${this._renderSurveyResultDialog()}
      </div>
    `}_renderOverviewTab(){return j`
      <div class="overview-content">
        ${this._overviewLoading?j`<div class="loading">Loading bindings...</div>`:j`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
              ${this._renderRecommendedAutomations()}
            `}
      </div>
    `}_renderEstablishedBindings(){return j`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
        </div>
        ${0===this._allBindings.length?j`<div class="empty-state">No bindings configured yet.</div>`:j`
              <div class="binding-list">
                ${this._allBindings.map(e=>this._renderEstablishedBindingRow(e))}
              </div>
            `}
      </div>
    `}_renderEstablishedBindingRow(e){const{binding:t,sourceNode:i,sourceEndpoint:n,targetNode:o}=e,s=o?.name||`Node ${t.target_node_id}`,r=null!==t.target_group_id,a=Ke(t.cluster_id);return j`
      <div class="overview-binding-row readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${i.ha_device_id?"device-link":""}"
              @click=${i.ha_device_id?()=>this._navigateToDevice(i.ha_device_id):q}
            >${i.name}</strong>
            <span class="binding-action">${a.action}</span>
            <strong
              class="${!r&&o?.ha_device_id?"device-link":""}"
              @click=${!r&&o?.ha_device_id?()=>this._navigateToDevice(o.ha_device_id):q}
            >${r?`Group ${t.target_group_id}`:s}</strong>
          </div>
          <div class="binding-meta">
            EP ${n.endpoint_id} → ${r?"Group":`EP ${t.target_endpoint_id}`}
            ${i.area_name?j` · ${i.area_name}`:q}
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
    `}_renderRecommendedBindings(){const e=this._filterSameAreaOnly?this._recommendations.filter(e=>{const t=e.sourceNode.area_name,i=e.targetNode.area_name;return t&&i&&t===i}):this._recommendations;return j`
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
          ${this._filterSameAreaOnly&&e.length!==this._recommendations.length?j`<span class="filter-info">(${this._recommendations.length-e.length} hidden)</span>`:q}
        </div>
        ${0===e.length?j`<div class="empty-state">
              ${this._filterSameAreaOnly&&this._recommendations.length>0?"No same-area recommendations. Toggle filter to see cross-area bindings.":"No binding recommendations. All compatible endpoints are already bound."}
            </div>`:j`
              <div class="binding-list">
                ${e.map(e=>this._renderRecommendationRow(e))}
              </div>
            `}
      </div>
    `}_renderRecommendedAutomations(){return 0===this._automationRecommendations.length?q:j`
      <div class="card overview-card automation-card">
        <div class="card-header">
          <span>💡 Recommended Automations</span>
          <span class="count-badge">${this._automationRecommendations.length}</span>
        </div>
        <div class="automation-intro">
          These device combinations can't use Matter bindings directly, but Home Assistant automations can achieve the same result.
        </div>
        <div class="binding-list">
          ${this._automationRecommendations.map(e=>this._renderAutomationRow(e))}
        </div>
      </div>
    `}_renderAutomationRow(e){const{template:t,sourceNode:i,targetNode:n}=e;return j`
      <div class="overview-binding-row automation readable">
        <div class="binding-description">
          <div class="automation-title">
            <span class="automation-icon">${t.icon}</span>
            <strong
              class="${i.ha_device_id?"device-link":""}"
              @click=${i.ha_device_id?()=>this._navigateToDevice(i.ha_device_id):q}
            >${i.name}</strong> + <strong
              class="${n.ha_device_id?"device-link":""}"
              @click=${n.ha_device_id?()=>this._navigateToDevice(n.ha_device_id):q}
            >${n.name}</strong>
          </div>
          <div class="automation-suggestion">${t.title}</div>
          <div class="automation-why">
            <span class="why-label">Why not a binding?</span> ${t.why}
          </div>
          ${i.area_name?j`<div class="binding-meta">${i.area_name}</div>`:q}
        </div>
        <a
          class="btn btn-small btn-secondary"
          href="/config/automation/new"
          target="_blank"
          title="Create this automation in Home Assistant"
        >
          Create in HA →
        </a>
      </div>
    `}_toggleAreaFilter(e){const t=e.target;this._filterSameAreaOnly=t.checked}_renderRecommendationRow(e){const{sourceNode:t,sourceEndpoint:i,targetNode:n,targetEndpoint:o,compatibleClusters:s}=e,r=s.map(e=>Ke(e).action.replace(/^(control |read |receive |trigger |manage )/,"")),a=[...new Set(r)],d=a.length>2?`${a.slice(0,2).join(", ")}...`:a.join(", ");return j`
      <div class="overview-binding-row recommendation readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${t.ha_device_id?"device-link":""}"
              @click=${t.ha_device_id?()=>this._navigateToDevice(t.ha_device_id):q}
            >${t.name}</strong>
            <span class="binding-action">can ${1===s.length?Ke(s[0]).action:`access ${d} from`}</span>
            <strong
              class="${n.ha_device_id?"device-link":""}"
              @click=${n.ha_device_id?()=>this._navigateToDevice(n.ha_device_id):q}
            >${n.name}</strong>
            <span class="cluster-badges">
              ${s.map(e=>{const t=Ge(e),i=`${t}: ${Ke(e).dataType}`;return j`<span class="cluster-badge" title="${i}">${t}</span>`})}
            </span>
          </div>
          <div class="binding-meta">
            EP ${i.endpoint_id} → EP ${o.endpoint_id}
            ${t.area_name?j` · ${t.area_name}`:q}
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
    `}_showDeleteConfirmDialog(e){this._pendingDeleteBinding=e}_closeDeleteConfirmDialog(){this._pendingDeleteBinding=null}async _confirmDeleteBinding(){if(!this._pendingDeleteBinding)return;const{binding:e}=this._pendingDeleteBinding,t=`delete-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=t;try{await ot(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0),this._closeDeleteConfirmDialog(),await this._loadOverviewData()}catch(e){this._error=`Failed to delete binding: ${e}`}finally{this._actionInProgress=null}}_showBindingConfirmDialog(e){this._pendingBindingRecommendation=e,this._selectedClusterForBinding=e.compatibleClusters[0]}_closeBindingConfirmDialog(){this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null}_handleClusterSelectChange(e){const t=e.target;this._selectedClusterForBinding=parseInt(t.value,10)}async _confirmCreateBinding(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n}=this._pendingBindingRecommendation,o=this._selectedClusterForBinding,s=`create-${e.node_id}-${t.endpoint_id}-${i.node_id}-${n.endpoint_id}`;this._actionInProgress=s;try{await nt(this.hass,e.node_id,t.endpoint_id,o,i.node_id,n.endpoint_id),this._closeBindingConfirmDialog(),await this._loadOverviewData()}catch(e){this._error=`Failed to create binding: ${e}`}finally{this._actionInProgress=null}}_renderBindingsTab(){return j`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Devices</div>
          ${this._loading&&0===this._nodes.length?j`<div class="loading">Loading...</div>`:j`
                <ul class="node-list">
                  ${this._nodes.map(e=>this._renderNodeItem(e))}
                </ul>
              `}
        </div>

        <div class="card device-panel">
          ${this._selectedSourceNode?this._renderDeviceDetails(this._selectedSourceNode):j`
                <div class="empty-state">
                  Select a device to view details and manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_renderDeviceDetails(e){const t=e.device_info,i=this._getPrimaryDeviceType(e),n=e.endpoints.length;return j`
      <div class="device-details">
        <div class="device-header">
          <div class="device-title">
            <h2>${e.name}</h2>
            ${e.ha_device_id?j`<a
                  class="device-ha-link"
                  href="/config/devices/device/${e.ha_device_id}"
                  title="View in Home Assistant"
                >↗</a>`:q}
          </div>
          <div class="device-meta">
            ${i?j`<span class="device-type-tag">${i}</span>`:q}
            ${e.area_name?j`<span class="device-area-tag">${e.area_name}</span>`:q}
            ${t?.software_version?j`<span class="device-version">v${t.software_version}</span>`:q}
          </div>
        </div>

        <div class="device-section">
          <div class="section-header">Endpoints</div>
          ${n>0?j`
                <div class="endpoint-list">
                  ${e.endpoints.map(e=>this._renderEndpointItem(e))}
                </div>
              `:j`<div class="no-endpoints">No endpoints found</div>`}
        </div>

        ${this._renderEntityList(e)}
        ${this._renderDeviceRegistryInfo(e)}
        ${this._renderEveSchedule(e)}
        ${this._renderThermostatSchedule(e)}

        <div class="device-section">
          <div class="section-header">
            Bindings
            ${this._selectedSourceEndpoint?j`
                  <span class="section-context">
                    Endpoint ${this._selectedSourceEndpoint.endpoint_id}
                  </span>
                  <button
                    class="btn btn-small btn-primary"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `:q}
          </div>
          ${this._selectedSourceEndpoint?this._bindings.length>0?j`
                  <div class="binding-list">
                    ${this._bindings.map(e=>this._renderBindingCard(e))}
                  </div>
                `:j`
                  <div class="empty-state-small">
                    No bindings configured for this endpoint.
                  </div>
                `:j`
                <div class="empty-state-small">
                  Select an endpoint with binding support to manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_getPrimaryDeviceType(e){const t=e.endpoints.find(e=>1===e.endpoint_id)||e.endpoints.find(e=>e.endpoint_id>0);return t&&t.device_types.length>0?Ve(t.device_types[0].id):null}_renderNodeItem(e){const t=this._selectedSourceNode?.node_id===e.node_id,i=this._getPrimaryDeviceType(e);return j`
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
              ${i?j`<span class="node-device-type">${i}</span>`:q}
              ${i&&e.area_name?j`<span class="node-meta-sep">·</span>`:q}
              ${e.area_name?j`<span class="node-area">${e.area_name}</span>`:q}
            </div>
          </div>
        </div>
      </li>
    `}_renderEntityList(e){const t=e.entities||[];if(0===t.length)return q;const i={light:"💡",switch:"🔌",event:"🔘",sensor:"📊",binary_sensor:"⚡",climate:"🌡️",cover:"🪟",fan:"💨",lock:"🔒",button:"⏺️"};return j`
      <div class="device-section">
        <div class="section-header">Home Assistant Entities</div>
        <div class="entity-chips">
          ${t.filter(e=>!e.disabled).map(e=>j`
                <button
                  class="entity-chip"
                  @click=${t=>{t.stopPropagation(),this._openEntityMoreInfo(e.entity_id)}}
                >
                  <span class="domain-icon">${i[e.domain]||"📦"}</span>
                  <span>${e.name||e.entity_id}</span>
                </button>
              `)}
        </div>
      </div>
    `}_openEntityMoreInfo(e){const t=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_getMatchingDeviceDefinition(e){const t=e.device_info?.vendor_id;if(!t)return;const i=new Set,n=new Set;for(const t of e.endpoints){for(const e of t.server_clusters||[])i.add(e);for(const e of t.device_types)n.add(e.id)}return Se(t,Array.from(i),Array.from(n))}_renderDeviceRegistryInfo(e){const t=this._getMatchingDeviceDefinition(e);if(!t)return q;const i=t.extends&&t.extends.length>0;return j`
      <div class="device-section registry-info">
        <div class="section-header">
          Device Database
          <span class="registry-badge">Matched</span>
        </div>
        <div class="registry-details">
          <div class="registry-model">
            <strong>${t.vendor}</strong> ${t.model}
          </div>
          ${t.description?j`<div class="registry-description">${t.description}</div>`:q}
          ${i?j`
                <div class="registry-features">
                  <span class="feature-label">Features:</span>
                  ${t.extends.map(e=>j`<span class="feature-tag">${e.name}</span>`)}
                </div>
              `:q}
          ${t.productUrl?j`
                <a
                  class="registry-link"
                  href="${t.productUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  Product Page ↗
                </a>
              `:q}
        </div>
      </div>
    `}_navigateToDevice(e){e&&(history.pushState(null,"",`/config/devices/device/${e}`),window.dispatchEvent(new CustomEvent("location-changed")))}_renderEndpointItem(e){const t=this._selectedSourceEndpoint?.endpoint_id===e.endpoint_id,i=e.device_types.map(e=>Ve(e.id)).filter(t=>0!==e.endpoint_id||!t.includes("Root")),n=[29,30,31,40,42,48,49,50,51,52,53,56,60,62,63,70],o=e.cluster_commands||{},s=(e.server_clusters||[]).filter(e=>!n.includes(e)).map(e=>{const t=o[e];return{id:e,name:Ge(e),isProprietary:$e(e),commands:t?.accepted||[],commandNames:t?.names||{}}}),r=(e.client_clusters||[]).filter(e=>!n.includes(e)).map(e=>{const t=o[e];return{id:e,name:Ge(e),isProprietary:$e(e),commands:t?.accepted||[],commandNames:t?.names||{}}}),a=s.some(e=>e.isProprietary)||r.some(e=>e.isProprietary),d=e=>{const t=`${e.name} (0x${e.id.toString(16).toUpperCase()})`;if(0===e.commands.length)return t;return`${t}\n\nAccepted commands:\n  ${e.commands.map(t=>{const i=e.commandNames[t];return i?`${i} (${t})`:`${t}`}).join("\n  ")}`};return j`
      <div
        class="endpoint-item ${t?"selected":""} ${e.has_binding_cluster?"":"no-binding"}"
        @click=${t=>this._selectEndpoint(t,e)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${e.endpoint_id}</span>
          ${e.has_binding_cluster?j`<span class="endpoint-badge binding">Binding</span>`:q}
          ${a?j`<span class="endpoint-badge proprietary">Proprietary</span>`:q}
        </div>
        ${i.length>0?j`<div class="endpoint-device-types">${i.join(", ")}</div>`:q}
        ${s.length>0?j`<div class="endpoint-clusters">
              <span class="cluster-role">Server:</span>
              ${s.map((e,t)=>j`${t>0?" · ":""}<span
                class="${e.isProprietary?"cluster-proprietary":"cluster-name"}"
                title="${d(e)}"
              >${e.name}${e.commands.length>0?j`<span class="cluster-cmd-count">(${e.commands.length})</span>`:q}</span>`)}
            </div>`:q}
        ${r.length>0?j`<div class="endpoint-clusters">
              <span class="cluster-role">Client:</span>
              ${r.map((e,t)=>j`${t>0?" · ":""}<span
                class="${e.isProprietary?"cluster-proprietary":"cluster-name"}"
                title="${d(e)}"
              >${e.name}${e.commands.length>0?j`<span class="cluster-cmd-count">(${e.commands.length})</span>`:q}</span>`)}
            </div>`:q}
      </div>
    `}_renderBindingCard(e){const t=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`,i=this._actionInProgress===t;return j`
      <div class="binding-card">
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${null!==e.target_group_id?`Group ${e.target_group_id}`:j`<span
                    class="${this._getNodeDeviceId(e.target_node_id)?"device-link":""}"
                    @click=${this._getNodeDeviceId(e.target_node_id)?t=>{t.stopPropagation(),this._navigateToDevice(this._getNodeDeviceId(e.target_node_id))}:q}
                  >${this._getNodeName(e.target_node_id)}</span> - Endpoint ${e.target_endpoint_id}`}
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
    `}_renderGroupsTab(){return j`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading?j`<div class="loading">Loading...</div>`:this._groups.length>0?j`
                <div class="binding-list">
                  ${this._groups.map(e=>j`
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
              `:j`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `}_renderBindingConfirmDialog(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return q;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n,compatibleClusters:o}=this._pendingBindingRecommendation,s=this._selectedClusterForBinding,r=Ke(s),a=null!==this._actionInProgress;return j`
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
              ${e.area_name?j`<div class="binding-device-area">${e.area_name}</div>`:q}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${Ge(s)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${i.name}</div>
              <div class="binding-device-endpoint">Endpoint ${n.endpoint_id}</div>
              ${i.area_name?j`<div class="binding-device-area">${i.area_name}</div>`:q}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${e.name}</strong> will ${r.action}
              <strong>${i.name}</strong> using ${r.dataType}.
            </div>
          </div>

          ${o.length>1?j`
                <div class="cluster-select-group">
                  <label>Select cluster to bind:</label>
                  <select
                    class="form-select"
                    @change=${this._handleClusterSelectChange}
                  >
                    ${o.map(e=>j`
                        <option value=${e} ?selected=${e===s}>
                          ${Ge(e)} - ${Ke(e).dataType}
                        </option>
                      `)}
                  </select>
                </div>
              `:q}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeBindingConfirmDialog}
              ?disabled=${a}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${a?"btn-loading":""}"
              @click=${this._confirmCreateBinding}
              ?disabled=${a}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderManualBindingConfirmDialog(){if(!this._pendingManualBinding)return q;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:n,clusterId:o}=this._pendingManualBinding,s=Ke(o),r=null!==this._actionInProgress;return j`
      <div class="dialog-overlay" @click=${this._closeManualBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${e.name}</div>
              <div class="binding-device-endpoint">Endpoint ${t.endpoint_id}</div>
              ${e.area_name?j`<div class="binding-device-area">${e.area_name}</div>`:q}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${Ge(o)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${i.name}</div>
              <div class="binding-device-endpoint">Endpoint ${n.endpoint_id}</div>
              ${i.area_name?j`<div class="binding-device-area">${i.area_name}</div>`:q}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${e.name}</strong> will ${s.action}
              <strong>${i.name}</strong> using ${s.dataType}.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeManualBindingConfirmDialog}
              ?disabled=${r}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${r?"btn-loading":""}"
              @click=${this._confirmManualBinding}
              ?disabled=${r}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderDeleteConfirmDialog(){if(!this._pendingDeleteBinding)return q;const{binding:e,sourceNode:t,sourceEndpoint:i,targetNode:n}=this._pendingDeleteBinding,o=Ke(e.cluster_id),s=n?.name||`Node ${e.target_node_id}`,r=null!==this._actionInProgress,a=null!==e.target_group_id;return j`
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
              ${t.area_name?j`<div class="binding-device-area">${t.area_name}</div>`:q}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${Ge(e.cluster_id)}</span>
              <span class="binding-arrow-large" style="text-decoration: line-through; color: var(--error-color);">→</span>
            </div>
            <div class="binding-device-card target">
              ${a?j`<div class="binding-device-name">Group ${e.target_group_id}</div>`:j`
                    <div class="binding-device-name">${s}</div>
                    <div class="binding-device-endpoint">Endpoint ${e.target_endpoint_id}</div>
                    ${n?.area_name?j`<div class="binding-device-area">${n.area_name}</div>`:q}
                  `}
            </div>
          </div>

          <div class="binding-explanation" style="border-left: 3px solid var(--error-color);">
            <div class="binding-explanation-header">After removing this binding:</div>
            <div class="binding-explanation-content">
              <strong>${t.name}</strong> will stop being able to ${o.action}
              <strong>${a?`Group ${e.target_group_id}`:s}</strong>.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeDeleteConfirmDialog}
              ?disabled=${r}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${r?"btn-loading":""}"
              style="background: var(--error-color);"
              @click=${this._confirmDeleteBinding}
              ?disabled=${r}
            >
              Remove Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id),t=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),i=at(t?.endpoints||[]),n=this._getCompatibleClusters(),o=this._selectedSourceEndpoint?.client_clusters||[],s=o.length>0,r=this._selectedSourceEndpoint?.device_types[0]?Ve(this._selectedSourceEndpoint.device_types[0].id):null,a=(d=o,d.filter(e=>!ct.includes(e))).map(e=>Ge(e));var d;return j`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            Create Binding from ${this._selectedSourceNode?.name} EP${this._selectedSourceEndpoint?.endpoint_id}
            ${r?j`<span class="device-type-badge">${r}</span>`:q}
          </div>

          ${a.length>0?j`
                <div class="dialog-subheader">
                  Can control: ${a.join(", ")}
                </div>
              `:q}

          ${s?q:j`
                <div class="dialog-warning">
                  <strong>Note:</strong> This endpoint can't control other devices (no client clusters).
                  Try selecting a different endpoint.
                </div>
              `}

          ${n.length>0?j`
                <div style="color: var(--success-color, #4caf50); padding: 8px 0; font-size: 14px;">
                  ✓ ${n.length} compatible cluster${1!==n.length?"s":""} found
                </div>
              `:q}

          <form @submit=${this._handleReviewBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select
                name="targetNode"
                class="form-select"
                required
                @change=${this._handleTargetNodeChange}
              >
                ${e.map(e=>{const t=e.endpoints.find(e=>0!==e.endpoint_id),i=[t?.device_types[0]?Ve(t.device_types[0].id):null,e.area_name].filter(Boolean).join(" · ");return j`
                    <option
                      value=${e.node_id}
                      ?selected=${e.node_id===this._selectedTargetNodeId}
                    >
                      ${e.name}${i?` (${i})`:""}
                    </option>
                  `})}
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
                ${i.map(e=>{const t=e.device_types.map(e=>Ve(e.id)).join(", "),i=function(e,t){const i=t.server_clusters||[];return e.filter(e=>i.includes(e)).length}(o,e);return j`
                    <option
                      value=${e.endpoint_id}
                      ?selected=${e.endpoint_id===this._selectedTargetEndpointId}
                    >
                      Endpoint ${e.endpoint_id}${t?` (${t})`:""} · ${i} compatible cluster${1!==i?"s":""}
                    </option>
                  `})}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              ${n.length>0?j`
                    <select name="cluster" class="form-select" required>
                      ${n.map(e=>{const t=Ge(e),i=Ke(e);return j`
                          <option value=${e} title="${t}: ${i.dataType}">
                            ${t} - ${i.dataType}
                          </option>
                        `})}
                    </select>
                  `:j`
                    <div class="no-clusters-warning">
                      No compatible clusters found. These devices can't communicate.
                      Try selecting a different target endpoint.
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
                Review Binding
              </button>
            </div>
          </form>
        </div>
      </div>
    `}};lt.styles=r`
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

    .endpoint-badge.proprietary {
      background: var(--warning-color, #ff9800);
      color: white;
    }

    .cluster-proprietary {
      color: var(--warning-color, #ff9800);
      font-weight: 500;
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

    .cluster-name {
      cursor: help;
    }

    .cluster-cmd-count {
      font-size: 10px;
      opacity: 0.7;
      margin-left: 2px;
    }

    .entity-list {
      margin-top: 12px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 6px;
    }

    .entity-list-header {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    .entity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .entity-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      font-size: 11px;
      font-family: inherit;
      color: var(--primary-text-color);
      cursor: pointer;
      transition: all 0.2s;
    }

    .entity-chip:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .entity-chip .domain-icon {
      font-size: 12px;
    }

    .entity-chip.disabled {
      opacity: 0.5;
      text-decoration: line-through;
    }

    /* Device Registry Info */
    .registry-info {
      background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.05), transparent);
      border-left: 3px solid var(--primary-color);
      padding-left: 12px;
    }

    .registry-badge {
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
      margin-left: 8px;
    }

    .registry-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .registry-model {
      font-size: 14px;
    }

    .registry-description {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .registry-features {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }

    .feature-label {
      font-size: 11px;
      color: var(--secondary-text-color);
    }

    .feature-tag {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--warning-color, #ff9800);
      color: white;
      border-radius: 4px;
      font-weight: 500;
    }

    .registry-link {
      font-size: 12px;
      color: var(--primary-color);
      text-decoration: none;
    }

    .registry-link:hover {
      text-decoration: underline;
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

    .device-link {
      cursor: pointer;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 2px;
    }

    .device-link:hover {
      color: var(--primary-color);
      text-decoration-style: solid;
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

    .device-panel {
      min-height: 400px;
    }

    .device-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .device-header {
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 16px;
    }

    .device-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .device-title h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .device-ha-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 16px;
      opacity: 0.7;
    }

    .device-ha-link:hover {
      opacity: 1;
    }

    .device-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .device-type-tag {
      background: var(--primary-color);
      color: white;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 500;
    }

    .device-area-tag {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 12px;
    }

    .device-version {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .device-section {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 12px;
    }

    .section-context {
      font-size: 12px;
      font-weight: normal;
      color: var(--secondary-text-color);
      background: var(--card-background-color);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .section-header .btn {
      margin-left: auto;
    }

    .empty-state-small {
      font-size: 13px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
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

    .cluster-badges {
      display: inline-flex;
      gap: 6px;
      margin-left: 8px;
      vertical-align: middle;
    }

    .cluster-badge {
      background: var(--primary-color);
      color: white;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 8px;
      font-weight: 500;
      cursor: help;
      white-space: nowrap;
    }

    .cluster-badge:hover {
      filter: brightness(1.15);
    }

    .device-type-badge {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 8px;
      vertical-align: middle;
    }

    .dialog-subheader {
      padding: 0 16px 12px 16px;
      color: var(--secondary-text-color);
      font-size: 14px;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 16px;
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

    /* Automation recommendations */
    .automation-card {
      border-left: 3px solid var(--warning-color, #ff9800);
    }

    .automation-intro {
      padding: 12px 16px;
      font-size: 13px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }

    .overview-binding-row.automation {
      background: rgba(255, 152, 0, 0.05);
    }

    .automation-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .automation-icon {
      font-size: 18px;
    }

    .automation-suggestion {
      font-size: 14px;
      color: var(--primary-color);
      font-weight: 500;
      margin-bottom: 6px;
    }

    .automation-why {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .why-label {
      font-weight: 500;
      color: var(--warning-color, #ff9800);
    }

    .btn-secondary {
      text-decoration: none;
      display: inline-block;
    }

    /* Eve Schedule Styles */
    .eve-schedule {
      margin-top: 12px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      border-left: 3px solid var(--primary-color);
    }

    .eve-schedule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .eve-schedule-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .eve-schedule-name {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .eve-schedule-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 6px;
      margin-bottom: 10px;
    }

    .eve-day-slot {
      background: var(--card-background-color);
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
      font-size: 11px;
    }

    .eve-day-name {
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 2px;
    }

    .eve-day-profile {
      color: var(--secondary-text-color);
      font-size: 10px;
    }

    .eve-time-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .eve-time-slot {
      background: var(--card-background-color);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .eve-time {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .eve-profile {
      color: var(--primary-color);
      font-weight: 500;
    }

    .eve-schedule-loading {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
    }
  `,e([pe({attribute:!1})],lt.prototype,"hass",void 0),e([pe({type:Boolean})],lt.prototype,"narrow",void 0),e([ge()],lt.prototype,"_nodes",void 0),e([ge()],lt.prototype,"_selectedSourceNode",void 0),e([ge()],lt.prototype,"_selectedSourceEndpoint",void 0),e([ge()],lt.prototype,"_bindings",void 0),e([ge()],lt.prototype,"_groups",void 0),e([ge()],lt.prototype,"_loading",void 0),e([ge()],lt.prototype,"_error",void 0),e([ge()],lt.prototype,"_activeTab",void 0),e([ge()],lt.prototype,"_showCreateDialog",void 0),e([ge()],lt.prototype,"_allBindings",void 0),e([ge()],lt.prototype,"_recommendations",void 0),e([ge()],lt.prototype,"_overviewLoading",void 0),e([ge()],lt.prototype,"_surveySubmitting",void 0),e([ge()],lt.prototype,"_surveyResult",void 0),e([ge()],lt.prototype,"_selectedTargetNodeId",void 0),e([ge()],lt.prototype,"_selectedTargetEndpointId",void 0),e([ge()],lt.prototype,"_filterSameAreaOnly",void 0),e([ge()],lt.prototype,"_actionInProgress",void 0),e([ge()],lt.prototype,"_pendingBindingRecommendation",void 0),e([ge()],lt.prototype,"_selectedClusterForBinding",void 0),e([ge()],lt.prototype,"_pendingManualBinding",void 0),e([ge()],lt.prototype,"_pendingDeleteBinding",void 0),e([ge()],lt.prototype,"_automationRecommendations",void 0),e([ge()],lt.prototype,"_eveSchedules",void 0),e([ge()],lt.prototype,"_eveScheduleLoading",void 0),lt=e([de("matter-binding-helper-panel")],lt);export{lt as MatterBindingPanel};
