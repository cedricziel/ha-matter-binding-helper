function e(e,i,t,n){var r,o=arguments.length,s=o<3?i:null===n?n=Object.getOwnPropertyDescriptor(i,t):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,i,t,n);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(o<3?r(s):o>3?r(i,t,s):r(i,t))||s);return o>3&&s&&Object.defineProperty(i,t,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const i=globalThis,t=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let o=class{constructor(e,i,t){if(this._$cssResult$=!0,t!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=r.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(i,e))}return e}toString(){return this.cssText}};const s=(e,...i)=>{const t=1===e.length?e[0]:i.reduce((i,t,n)=>i+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(t)+e[n+1],e[0]);return new o(t,e,n)},a=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let i="";for(const t of e.cssRules)i+=t.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,n))(i)})(e):e,{is:d,defineProperty:c,getOwnPropertyDescriptor:l,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:u}=Object,h=globalThis,v=h.trustedTypes,m=v?v.emptyScript:"",_=h.reactiveElementPolyfillSupport,b=(e,i)=>e,f={toAttribute(e,i){switch(i){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,i){let t=e;switch(i){case Boolean:t=null!==e;break;case Number:t=null===e?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch(e){t=null}}return t}},y=(e,i)=>!d(e,i),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:y};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),h.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=x){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const t=Symbol(),n=this.getPropertyDescriptor(e,t,i);void 0!==n&&c(this.prototype,e,n)}}static getPropertyDescriptor(e,i,t){const{get:n,set:r}=l(this.prototype,e)??{get(){return this[i]},set(e){this[i]=e}};return{get:n,set(i){const o=n?.call(this);r?.call(this,i),this.requestUpdate(e,o,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,i=[...p(e),...g(e)];for(const t of i)this.createProperty(t,e[t])}const e=this[Symbol.metadata];if(null!==e){const i=litPropertyMetadata.get(e);if(void 0!==i)for(const[e,t]of i)this.elementProperties.set(e,t)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const t=this._$Eu(e,i);void 0!==t&&this._$Eh.set(t,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const t=new Set(e.flat(1/0).reverse());for(const e of t)i.unshift(a(e))}else void 0!==e&&i.push(a(e));return i}static _$Eu(e,i){const t=i.attribute;return!1===t?void 0:"string"==typeof t?t:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const t of i.keys())this.hasOwnProperty(t)&&(e.set(t,this[t]),delete this[t]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(t)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of n){const n=document.createElement("style"),r=i.litNonce;void 0!==r&&n.setAttribute("nonce",r),n.textContent=t.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,i,t){this._$AK(e,t)}_$ET(e,i){const t=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,t);if(void 0!==n&&!0===t.reflect){const r=(void 0!==t.converter?.toAttribute?t.converter:f).toAttribute(i,t.type);this._$Em=e,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,i){const t=this.constructor,n=t._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=t.getPropertyOptions(n),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=n;const o=r.fromAttribute(i,e.type);this[n]=o??this._$Ej?.get(n)??o,this._$Em=null}}requestUpdate(e,i,t){if(void 0!==e){const n=this.constructor,r=this[e];if(t??=n.getPropertyOptions(e),!((t.hasChanged??y)(r,i)||t.useDefault&&t.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,t))))return;this.C(e,i,t)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,i,{useDefault:t,reflect:n,wrapped:r},o){t&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??i??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||t||(i=void 0),this._$AL.set(e,i)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,i]of this._$Ep)this[e]=i;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[i,t]of e){const{wrapped:e}=t,n=this[i];!0!==e||this._$AL.has(i)||void 0===n||this.C(i,void 0,t,n)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(i)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(i)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,_?.({ReactiveElement:$}),(h.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,k=w.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+A,E=`<${z}>`,T=document,R=()=>T.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,N="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,M=/>/g,L=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,O=/"/g,U=/^(?:script|style|textarea|title)$/i,V=(e=>(i,...t)=>({_$litType$:e,strings:i,values:t}))(1),j=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),H=new WeakMap,q=T.createTreeWalker(T,129);function G(e,i){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(i):i}const K=(e,i)=>{const t=e.length-1,n=[];let r,o=2===i?"<svg>":3===i?"<math>":"",s=B;for(let i=0;i<t;i++){const t=e[i];let a,d,c=-1,l=0;for(;l<t.length&&(s.lastIndex=l,d=s.exec(t),null!==d);)l=s.lastIndex,s===B?"!--"===d[1]?s=I:void 0!==d[1]?s=M:void 0!==d[2]?(U.test(d[2])&&(r=RegExp("</"+d[2],"g")),s=L):void 0!==d[3]&&(s=L):s===L?">"===d[0]?(s=r??B,c=-1):void 0===d[1]?c=-2:(c=s.lastIndex-d[2].length,a=d[1],s=void 0===d[3]?L:'"'===d[3]?O:W):s===O||s===W?s=L:s===I||s===M?s=B:(s=L,r=void 0);const p=s===L&&e[i+1].startsWith("/>")?" ":"";o+=s===B?t+E:c>=0?(n.push(a),t.slice(0,c)+C+t.slice(c)+A+p):t+A+(-2===c?i:p)}return[G(e,o+(e[t]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),n]};class J{constructor({strings:e,_$litType$:i},t){let n;this.parts=[];let r=0,o=0;const s=e.length-1,a=this.parts,[d,c]=K(e,i);if(this.el=J.createElement(d,t),q.currentNode=this.el.content,2===i||3===i){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=q.nextNode())&&a.length<s;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(C)){const i=c[o++],t=n.getAttribute(e).split(A),s=/([.?@])?(.*)/.exec(i);a.push({type:1,index:r,name:s[2],strings:t,ctor:"."===s[1]?ee:"?"===s[1]?ie:"@"===s[1]?te:Y}),n.removeAttribute(e)}else e.startsWith(A)&&(a.push({type:6,index:r}),n.removeAttribute(e));if(U.test(n.tagName)){const e=n.textContent.split(A),i=e.length-1;if(i>0){n.textContent=k?k.emptyScript:"";for(let t=0;t<i;t++)n.append(e[t],R()),q.nextNode(),a.push({type:2,index:++r});n.append(e[i],R())}}}else if(8===n.nodeType)if(n.data===z)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=n.data.indexOf(A,e+1));)a.push({type:7,index:r}),e+=A.length-1}r++}}static createElement(e,i){const t=T.createElement("template");return t.innerHTML=e,t}}function Z(e,i,t=e,n){if(i===j)return i;let r=void 0!==n?t._$Co?.[n]:t._$Cl;const o=P(i)?void 0:i._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e),r._$AT(e,t,n)),void 0!==n?(t._$Co??=[])[n]=r:t._$Cl=r),void 0!==r&&(i=Z(e,r._$AS(e,i.values),r,n)),i}class Q{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:t}=this._$AD,n=(e?.creationScope??T).importNode(i,!0);q.currentNode=n;let r=q.nextNode(),o=0,s=0,a=t[0];for(;void 0!==a;){if(o===a.index){let i;2===a.type?i=new X(r,r.nextSibling,this,e):1===a.type?i=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(i=new ne(r,this,e)),this._$AV.push(i),a=t[++s]}o!==a?.index&&(r=q.nextNode(),o++)}return q.currentNode=T,n}p(e){let i=0;for(const t of this._$AV)void 0!==t&&(void 0!==t.strings?(t._$AI(e,t,i),i+=t.strings.length-2):t._$AI(e[i])),i++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,i,t,n){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=t,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===e?.nodeType&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=Z(this,e,i),P(e)?e===F||null==e||""===e?(this._$AH!==F&&this._$AR(),this._$AH=F):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==F&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:i,_$litType$:t}=e,n="number"==typeof t?this._$AC(e):(void 0===t.el&&(t.el=J.createElement(G(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===n)this._$AH.p(i);else{const e=new Q(n,this),t=e.u(this.options);e.p(i),this.T(t),this._$AH=e}}_$AC(e){let i=H.get(e.strings);return void 0===i&&H.set(e.strings,i=new J(e)),i}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let t,n=0;for(const r of e)n===i.length?i.push(t=new X(this.O(R()),this.O(R()),this,this.options)):t=i[n],t._$AI(r),n++;n<i.length&&(this._$AR(t&&t._$AB.nextSibling,n),i.length=n)}_$AR(e=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);e!==this._$AB;){const i=e.nextSibling;e.remove(),e=i}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,t,n,r){this.type=1,this._$AH=F,this._$AN=void 0,this.element=e,this.name=i,this._$AM=n,this.options=r,t.length>2||""!==t[0]||""!==t[1]?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=F}_$AI(e,i=this,t,n){const r=this.strings;let o=!1;if(void 0===r)e=Z(this,e,i,0),o=!P(e)||e!==this._$AH&&e!==j,o&&(this._$AH=e);else{const n=e;let s,a;for(e=r[0],s=0;s<r.length-1;s++)a=Z(this,n[t+s],i,s),a===j&&(a=this._$AH[s]),o||=!P(a)||a!==this._$AH[s],a===F?e=F:e!==F&&(e+=(a??"")+r[s+1]),this._$AH[s]=a}o&&!n&&this.j(e)}j(e){e===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Y{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===F?void 0:e}}class ie extends Y{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==F)}}class te extends Y{constructor(e,i,t,n,r){super(e,i,t,n,r),this.type=5}_$AI(e,i=this){if((e=Z(this,e,i,0)??F)===j)return;const t=this._$AH,n=e===F&&t!==F||e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive,r=e!==F&&(t===F||n);n&&this.element.removeEventListener(this.name,this,t),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,i,t){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const re=w.litHtmlPolyfillSupport;re?.(J,X),(w.litHtmlVersions??=[]).push("3.3.1");const oe=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class se extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,i,t)=>{const n=t?.renderBefore??i;let r=n._$litPart$;if(void 0===r){const e=t?.renderBefore??null;n._$litPart$=r=new X(i.insertBefore(R(),e),e,void 0,t??{})}return r._$AI(e),r})(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}}se._$litElement$=!0,se.finalized=!0,oe.litElementHydrateSupport?.({LitElement:se});const ae=oe.litElementPolyfillSupport;ae?.({LitElement:se}),(oe.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de=e=>(i,t)=>{void 0!==t?t.addInitializer(()=>{customElements.define(e,i)}):customElements.define(e,i)},ce={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:y},le=(e=ce,i,t)=>{const{kind:n,metadata:r}=t;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),o.set(t.name,e),"accessor"===n){const{name:n}=t;return{set(t){const r=i.get.call(this);i.set.call(this,t),this.requestUpdate(n,r,e)},init(i){return void 0!==i&&this.C(n,void 0,e,i),i}}}if("setter"===n){const{name:n}=t;return function(t){const r=this[n];i.call(this,t),this.requestUpdate(n,r,e)}}throw Error("Unsupported decorator location: "+n)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pe(e){return(i,t)=>"object"==typeof t?le(e,i,t):((e,i,t)=>{const n=i.hasOwnProperty(t);return i.constructor.createProperty(t,e),n?Object.getOwnPropertyDescriptor(i,t):void 0})(e,i,t)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return pe({...e,state:!0,attribute:!1})}const ue=319486977,he={id:ue,vendorId:4874,name:"Eve Thermo",description:"Eve thermostat proprietary cluster for schedule and valve data",attributes:[{id:319422464,name:"schedule",type:{type:"blob",parser:"eve.schedule"},access:["R"],description:"Heating schedule binary data. Contains weekly schedule with day entries and time slots.",parser:"eve.schedule"},{id:319422488,name:"valvePosition",type:"uint8",access:["R","S"],description:"Current valve opening position",unit:"%",sensor:{entityType:"sensor",stateClass:"measurement",entityCategory:"diagnostic",icon:"mdi:valve"}},{id:319422480,name:"temperatureOffset",type:"int8",access:["R","W"],description:"Temperature calibration offset. Value in 0.1°C increments.",unit:"°C",sensor:{entityType:"number",deviceClass:"temperature",entityCategory:"config",scale:.1,icon:"mdi:thermometer-plus"}}]},ve=4447,me=291503106,_e={id:me,vendorId:ve,name:"Aqara Lock Settings",description:"Aqara proprietary lock settings cluster. Attribute meanings are partially documented.",attributes:[{id:291438609,name:"setting1",type:"uint8",access:["R"],description:"Unknown setting (possibly lock mode). Observed value: 1"},{id:291438610,name:"setting2",type:"uint8",access:["R"],description:"Unknown setting (possibly sound). Observed value: 2"},{id:291438611,name:"setting3",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438612,name:"setting4",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438613,name:"setting5",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 1"}]},be={id:323746816,vendorId:ve,name:"Aqara Unknown",description:"Unknown Aqara proprietary cluster found on endpoint 0",attributes:[{id:323682304,name:"unknown",type:"bool",access:["R"],description:"Unknown boolean attribute. Observed value: true"}]},fe=[...[{id:"eve_thermo",fingerprint:{vendorId:4874,requiredClusters:[ue],requiredDeviceTypes:[769]},vendor:"Eve Systems",model:"Eve Thermo",description:"Smart radiator valve with Thread/Matter, HomeKit and weekly heating schedules",extends:[{name:"thermostatSchedule",clusters:[he],uiComponent:"eve-schedule",showInDetails:!0}],productUrl:"https://www.evehome.com/eve-thermo"}],...[{id:"aqara_u200",fingerprint:{vendorId:ve,requiredClusters:[me],requiredDeviceTypes:[10]},vendor:"Aqara",model:"Smart Lock U200",description:"Smart lock with Matter, fingerprint reader, NFC, and smartphone unlock",extends:[{name:"aqaraLockSettings",clusters:[_e,be],showInDetails:!0}],productUrl:"https://www.aqara.com/eu/product/smart-lock-u200"},{id:"aqara_w100",fingerprint:{vendorId:ve,productNamePattern:"W100",requiredDeviceTypes:[770]},vendor:"Aqara",model:"Climate Sensor W100",description:"Temperature and humidity sensor with Matter support. Uses standard clusters only.",productUrl:"https://www.aqara.com/eu/product/temperature-humidity-sensor-w100"}]],ye=[...[he],...[_e,be]];const xe={4874:"Eve",4447:"Aqara"};function $e(e){return e>=65536}function we(e){const i=function(e){return ye.find(i=>i.id===e)}(e);if(i)return i.name;if($e(e)){const i=function(e){return $e(e)?e>>16&65535:null}(e);if(i){const t=function(e){return xe[e]||`Vendor ${e}`}(i);return`${t} Proprietary (0x${e.toString(16)})`}return`Proprietary (0x${e.toString(16)})`}return`Cluster 0x${e.toString(16).padStart(4,"0")}`}function ke(e,i,t){return function(e,i,t){return fe.find(n=>{const r=n.fingerprint;return r.vendorId===e&&(!(r.requiredClusters&&i&&!r.requiredClusters.every(e=>i.includes(e)))&&!(r.requiredDeviceTypes&&t&&!r.requiredDeviceTypes.every(e=>t.includes(e))))})}(e,i,t)}const Se=3,Ce=4,Ae=5,ze=6,Ee=8,Te=29,Re=30,Pe=31,De=40,Ne=47,Be=768,Ie=513,Me=516,Le=1026,We=1027,Oe=1029,Ue=1030,Ve=59,je={[Se]:"Identify",[Ce]:"Groups",[Ae]:"Scenes",[ze]:"On/Off",[Ee]:"Level Control",[Te]:"Descriptor",[Re]:"Binding",[Pe]:"Access Control",[De]:"Basic Information",42:"OTA Update",[Ne]:"Power Source",48:"General Commissioning",49:"Network Commissioning",50:"Diagnostic Logs",51:"General Diagnostics",52:"Software Diagnostics",53:"Thread Diagnostics",56:"Ethernet Diagnostics",60:"Admin Commissioning",62:"Operational Credentials",63:"Group Key Management",70:"Time Sync",[Be]:"Color Control",[Ie]:"Thermostat",[Me]:"Thermostat UI",514:"Fan Control",[Le]:"Temperature",[We]:"Pressure",[Oe]:"Humidity",[Ue]:"Occupancy",[Ve]:"Switch"},Fe={15:"Generic Switch",17:"Power Source",18:"OTA Requestor",19:"OTA Provider",20:"Aggregator",22:"Root Node",256:"On/Off Light",257:"Dimmable Light",258:"Color Temperature Light",259:"On/Off Light Switch",260:"Dimmer Switch",261:"Color Dimmer Switch",262:"Light Sensor",263:"Occupancy Sensor",266:"On/Off Plug-in Unit",267:"Dimmable Plug-in Unit",268:"Color Temperature Light",269:"Extended Color Light",769:"Thermostat",770:"Temperature Sensor",771:"Humidity Sensor",772:"Air Quality Sensor",10:"Door Lock",11:"Door Lock Controller",514:"Window Covering",515:"Window Covering Controller",21:"Contact Sensor",38:"Flow Sensor",44:"Smoke/CO Alarm",35:"Casting Video Player",36:"Content App",40:"Basic Video Player",41:"Casting Video Client",43:"Speaker"},He={[ze]:{action:"control the on/off state of",dataType:"on/off commands"},[Ee]:{action:"control the brightness/level of",dataType:"level/dimming commands"},[Be]:{action:"control the color of",dataType:"color commands"},[Le]:{action:"read temperature data from",dataType:"temperature readings"},[We]:{action:"read pressure data from",dataType:"pressure readings"},[Oe]:{action:"read humidity data from",dataType:"humidity readings"},[Ue]:{action:"receive occupancy status from",dataType:"occupancy/presence data"},[Ie]:{action:"control thermostat settings on",dataType:"thermostat commands"},[Ae]:{action:"trigger scenes on",dataType:"scene commands"},[Ce]:{action:"manage group membership on",dataType:"group commands"},[Ve]:{action:"send button events to",dataType:"press/release events"}};function qe(e){return je[e]?je[e]:we(e)}function Ge(e){return Fe[e]||`Type ${e}`}function Ke(e){return He[e]||{action:"communicate with",dataType:`${qe(e)} data`}}const Je=[{id:"thermostat-contact-window",sourceDeviceTypes:[769],targetDeviceTypes:[21],title:"Turn off heating when window opens",description:"Automatically pause heating/cooling when a window or door is opened to save energy.",why:"This thermostat doesn't have a client cluster for Boolean State (contact sensors). Matter bindings require matching client/server clusters.",icon:"🪟"},{id:"thermostat-occupancy",sourceDeviceTypes:[769],targetDeviceTypes:[263],title:"Adjust temperature based on occupancy",description:"Lower the temperature when room is unoccupied, restore when someone enters.",why:"This thermostat doesn't have a client cluster for Occupancy Sensing. A Home Assistant automation can bridge this gap.",icon:"🚶"},{id:"light-occupancy",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[263],title:"Turn on light when motion detected",description:"Automatically turn on lights when someone enters the room.",why:"This light is a server (receives commands), not a client. The occupancy sensor reports state but can't send on/off commands to it.",icon:"💡"},{id:"light-contact-door",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[21],title:"Turn on light when door opens",description:"Automatically turn on lights when a door is opened (e.g., closet light).",why:"This contact sensor reports open/close state but doesn't have client clusters to control lights directly.",icon:"🚪"},{id:"plug-occupancy",sourceDeviceTypes:[266,267],targetDeviceTypes:[263],title:"Control device based on occupancy",description:"Turn on/off a device when room occupancy changes.",why:"This plug is a server (receives commands). The occupancy sensor can't directly control it via Matter binding.",icon:"🔌"},{id:"button-light-toggle",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[15],title:"Toggle light with button press",description:"Press the button to toggle light on/off. Long press for dimming, double-tap for scenes.",why:"Generic Switch emits button events (press/release/multi-press) rather than state changes. Home Assistant automations can respond to these events to control lights.",icon:"🔘"},{id:"button-plug-toggle",sourceDeviceTypes:[266,267],targetDeviceTypes:[15],title:"Toggle device with button press",description:"Use a physical button to control a smart plug or outlet.",why:"Generic Switch emits button events that need Home Assistant automation to translate into on/off commands for the plug.",icon:"🔘"},{id:"button-scene",sourceDeviceTypes:[256,257,258,266,267,268,269,769],targetDeviceTypes:[15],title:"Trigger scene with button",description:"Assign different scenes to single press, double press, and long press actions.",why:"Matter scenes via binding require specific cluster support. Home Assistant automations offer more flexibility for multi-press actions.",icon:"🎬"},{id:"button-thermostat-adjust",sourceDeviceTypes:[769],targetDeviceTypes:[15],title:"Adjust thermostat with buttons",description:"Use buttons to raise/lower temperature setpoint or switch heating/cooling modes.",why:"Generic Switch button events need Home Assistant automation to adjust thermostat settings. Perfect for climate sensors with built-in buttons.",icon:"🌡️"}],Ze=319486977,Qe=["sunday","monday","tuesday","wednesday","thursday","friday","saturday","away"],Xe=["monday","tuesday","wednesday","thursday","friday"],Ye=["saturday","sunday"];function ei(e){const i=e%60;return`${Math.floor(e/60).toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}const ii="matter_binding_helper";async function ti(e,i,t){return e.callWS({type:`${ii}/list_bindings`,node_id:i,endpoint_id:t})}async function ni(e,i,t,n,r,o,s=!0){return e.callWS({type:`${ii}/delete_binding`,source_node_id:i,source_endpoint_id:t,verify:s,...void 0!==n&&{target_node_id:n},...void 0!==r&&{target_endpoint_id:r},...void 0!==o&&{target_group_id:o}})}async function ri(e,i,t){return e.callWS({type:`${ii}/verify_bindings`,node_id:i,endpoint_id:t})}async function oi(e,i){return e.callWS({type:`${ii}/list_acl`,node_id:i})}async function si(e,i,t,n,r){return e.callWS({type:`${ii}/provision_acl`,target_node_id:i,target_endpoint_id:t,source_node_id:n,cluster_id:r})}const ai={sunday:"Sun",monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",away:"Away"};let di=class extends se{constructor(){super(...arguments),this._loading=!1,this._saving=!1,this._error=null,this._success=null,this._notSupported=!1,this._schedule=null,this._selectedDays=new Set(Xe),this._transitions=[],this._hasChanges=!1}connectedCallback(){super.connectedCallback(),this._loadSchedule()}async _loadSchedule(){this._loading=!0,this._error=null,this._notSupported=!1;const e=(this.endpoint.cluster_commands||{})[513];if(void 0!==e&&!(e?.accepted||[]).includes(2))return this._notSupported=!0,void(this._loading=!1);try{const e=await async function(e,i,t,n,r=!0,o=!1){return e.callWS({type:`${ii}/get_schedule`,node_id:i,endpoint_id:t,...n,heat:r,cool:o})}(this.hass,this.node.node_id,this.endpoint.endpoint_id);e.schedule&&(this._schedule=e.schedule,this._selectedDays=new Set(e.schedule.day_names),this._transitions=[...e.schedule.transitions],this._hasChanges=!1)}catch(e){console.error("Failed to load schedule - full error:",JSON.stringify(e,null,2)),console.error("Failed to load schedule - raw:",e);const i=e;if("schedule_not_supported"===i?.code)return void(this._notSupported=!0);let t;if(e instanceof Error)t=e.message;else if("object"==typeof e&&null!==e){const i=e;t=i.message||i.error||i.code||JSON.stringify(e)}else t=String(e);this._error=`Failed to load schedule: ${t}`}finally{this._loading=!1}}async _saveSchedule(){if(0!==this._selectedDays.size)if(0!==this._transitions.length){this._saving=!0,this._error=null,this._success=null;try{const e=[...this._transitions].sort((e,i)=>e.transition_time-i.transition_time);(await async function(e,i,t,n,r,o=!0,s=!1){return e.callWS({type:`${ii}/set_schedule`,node_id:i,endpoint_id:t,days:n,transitions:r,heat:o,cool:s})}(this.hass,this.node.node_id,this.endpoint.endpoint_id,Array.from(this._selectedDays),e,!0,!1)).success?(this._success="Schedule saved to device",this._hasChanges=!1,setTimeout(()=>this._loadSchedule(),1e3)):this._error="Failed to save schedule"}catch(e){console.error("Failed to save schedule:",e);const i=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to save schedule: ${i}`}finally{this._saving=!1}}else this._error="Please add at least one time slot";else this._error="Please select at least one day"}async _clearSchedule(){if(confirm("Are you sure you want to clear all schedules from this device?")){this._saving=!0,this._error=null,this._success=null;try{(await async function(e,i,t){return e.callWS({type:`${ii}/clear_schedule`,node_id:i,endpoint_id:t})}(this.hass,this.node.node_id,this.endpoint.endpoint_id)).success?(this._success="Schedule cleared",this._schedule=null,this._transitions=[],this._hasChanges=!1):this._error="Failed to clear schedule"}catch(e){console.error("Failed to clear schedule:",e);const i=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to clear schedule: ${i}`}finally{this._saving=!1}}}_toggleDay(e){const i=new Set(this._selectedDays);i.has(e)?i.delete(e):i.add(e),this._selectedDays=i,this._hasChanges=!0}_selectPreset(e){switch(e){case"weekdays":this._selectedDays=new Set(Xe);break;case"weekend":this._selectedDays=new Set(Ye);break;case"all":this._selectedDays=new Set(Qe.filter(e=>"away"!==e))}this._hasChanges=!0}_addTransition(){let e=360;if(this._transitions.length>0){const i=Math.max(...this._transitions.map(e=>e.transition_time));e=Math.min(i+60,1380)}this._transitions=[...this._transitions,{transition_time:e,heat_setpoint:20,cool_setpoint:null}],this._hasChanges=!0}_updateTransitionTime(e,i){const t=function(e){const[i,t]=e.split(":").map(Number);return 60*i+t}(i);this._transitions=this._transitions.map((i,n)=>n===e?{...i,transition_time:t}:i),this._hasChanges=!0}_updateTransitionTemp(e,i){const t=parseFloat(i);isNaN(t)||(this._transitions=this._transitions.map((i,n)=>n===e?{...i,heat_setpoint:t}:i),this._hasChanges=!0)}_deleteTransition(e){this._transitions=this._transitions.filter((i,t)=>t!==e),this._hasChanges=!0}_getTimelineSegments(){if(0===this._transitions.length)return[];const e=[...this._transitions].sort((e,i)=>e.transition_time-i.transition_time),i=[],t=e=>`hsl(${240*(1-Math.max(0,Math.min(1,(e-15)/10)))}, 70%, 50%)`;for(let n=0;n<e.length;n++){const r=e[n],o=e[n+1],s=r.heat_setpoint??20;i.push({start:r.transition_time,end:o?o.transition_time:1440,temp:s,color:t(s)})}if(e.length>0&&e[0].transition_time>0){const n=e[e.length-1].heat_setpoint??20;i.unshift({start:0,end:e[0].transition_time,temp:n,color:t(n)})}return i}render(){return this._notSupported?V`
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
      `:V`
      <div class="schedule-editor">
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            Weekly Schedule
            ${this._hasChanges?V`<span class="changes-indicator">Unsaved</span>`:F}
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

        ${this._error?V`
          <div class="message error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            ${this._error}
          </div>
        `:F}

        ${this._success?V`
          <div class="message success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            ${this._success}
          </div>
        `:F}

        ${this._loading?V`
          <div class="loading">
            <div class="spinner"></div>
            Loading schedule from device...
          </div>
        `:V`
          <!-- Day Selection -->
          <div class="section">
            <div class="section-title">Apply to days</div>
            <div class="day-selector">
              ${Qe.filter(e=>"away"!==e).map(e=>V`
                <div
                  class="day-chip ${this._selectedDays.has(e)?"selected":""}"
                  @click=${()=>this._toggleDay(e)}
                >
                  ${ai[e]}
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
              ${0===this._transitions.length?V`
                <div class="empty-state">
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                  <p>No time slots configured.<br>Add a time slot to set temperatures throughout the day.</p>
                </div>
              `:this._transitions.map((e,i)=>({...e,index:i})).sort((e,i)=>e.transition_time-i.transition_time).map(e=>V`
                  <div class="transition-row">
                    <div class="transition-time">
                      <label>Time</label>
                      <input
                        type="time"
                        .value=${ei(e.transition_time)}
                        @change=${i=>this._updateTransitionTime(e.index,i.target.value)}
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
                          @change=${i=>this._updateTransitionTemp(e.index,i.target.value)}
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

              ${this._transitions.length<10?V`
                <div class="add-transition" @click=${this._addTransition}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add time slot
                </div>
              `:F}
            </div>
          </div>

          <!-- Timeline Visualization -->
          ${this._transitions.length>0?V`
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
                  ${this._getTimelineSegments().map(e=>{const i=e.start/1440*100,t=(e.end-e.start)/1440*100;return V`
                      <div
                        class="timeline-segment"
                        style="left: ${i}%; width: ${t}%; background: ${e.color};"
                        title="${ei(e.start)} - ${ei(e.end)}: ${e.temp}°C"
                      >
                        ${t>8?`${e.temp}°`:""}
                      </div>
                    `})}
                </div>
              </div>
            </div>
          `:F}
        `}
      </div>
    `}};function ci(e){return e.filter(e=>0!==e.endpoint_id&&e.server_clusters&&e.server_clusters.length>0)}function li(e){const i=ci(e.endpoints);return i.length>0?i[0]:null}di.styles=s`
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
  `,e([pe({attribute:!1})],di.prototype,"hass",void 0),e([pe({attribute:!1})],di.prototype,"node",void 0),e([pe({attribute:!1})],di.prototype,"endpoint",void 0),e([ge()],di.prototype,"_loading",void 0),e([ge()],di.prototype,"_saving",void 0),e([ge()],di.prototype,"_error",void 0),e([ge()],di.prototype,"_success",void 0),e([ge()],di.prototype,"_notSupported",void 0),e([ge()],di.prototype,"_schedule",void 0),e([ge()],di.prototype,"_selectedDays",void 0),e([ge()],di.prototype,"_transitions",void 0),e([ge()],di.prototype,"_hasChanges",void 0),di=e([de("thermostat-schedule-editor")],di);const pi=[29,40,30,3,4,31,41,42,43,44,48,49,60,62,63,51,52,53,54,55,59];const gi=257,ui={[ze]:3,[Ee]:3,[Be]:3,[Ie]:3,[Ae]:3,[gi]:3};function hi(e){return ui[e]??3}const vi=[{value:1,label:"View",description:"Read-only access to device state"},{value:3,label:"Operate",description:"Control the device (on/off, level, etc.)"},{value:4,label:"Manage",description:"Configure device settings"}];let mi=class extends se{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="overview",this._showCreateDialog=!1,this._allBindings=[],this._recommendations=[],this._overviewLoading=!1,this._surveySubmitting=!1,this._surveyResult=null,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null,this._filterSameAreaOnly=!0,this._actionInProgress=null,this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null,this._pendingManualBinding=null,this._pendingDeleteBinding=null,this._automationRecommendations=[],this._eveSchedules=new Map,this._eveScheduleLoading=new Set,this._verificationInProgress=!1,this._lastVerificationResult=null,this._showVerificationModal=!1,this._verificationModalResult=null,this._aclLoading=!1,this._aclEntries=null,this._targetACLCache=new Map,this._aclLoadingNodes=new Set,this._bindingWizard=null,this._aclRepairInProgress=new Map,this._bulkRepairInProgress=!1,this._bulkRepairResult=null,this._showBulkRepairModal=!1}firstUpdated(){this._loadNodes().then(()=>{"overview"===this._activeTab&&this._loadOverviewData()})}async _loadNodes(){this._loading=!0,this._error=null;try{const e=await async function(e){return e.callWS({type:`${ii}/list_nodes`})}(this.hass);this._nodes=e.nodes}catch(e){this._error=`Failed to load nodes: ${e instanceof Error?e.message:String(e)}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const e=await ti(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=e.bindings;const i=new Set(e.bindings.filter(e=>null!==e.target_node_id).map(e=>e.target_node_id));Promise.all(Array.from(i).map(e=>this._loadACLForNode(e))).catch(e=>console.error("Failed to load some target ACLs:",e))}catch(e){this._error=`Failed to load bindings: ${e instanceof Error?e.message:String(e)}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const e=await async function(e){return e.callWS({type:`${ii}/list_groups`})}(this.hass);this._groups=e.groups}catch(e){this._error=`Failed to load groups: ${e instanceof Error?e.message:String(e)}`}finally{this._loading=!1}}_isEveDevice(e){return e.endpoints.some(e=>e.server_clusters.includes(Ze))}async _loadEveSchedule(e){if(this._eveSchedules.has(e.node_id)||this._eveScheduleLoading.has(e.node_id))return;const i=e.endpoints.find(e=>e.server_clusters.includes(Ze)&&e.endpoint_id>0);if(i){this._eveScheduleLoading=new Set([...this._eveScheduleLoading,e.node_id]);try{const t=await async function(e,i,t=1){return e.callWS({type:`${ii}/get_eve_schedule`,node_id:i,endpoint_id:t})}(this.hass,e.node_id,i.endpoint_id);t.schedule&&(this._eveSchedules=new Map(this._eveSchedules).set(e.node_id,t.schedule))}catch(i){console.error(`Failed to load Eve schedule for node ${e.node_id}:`,i)}finally{const i=new Set(this._eveScheduleLoading);i.delete(e.node_id),this._eveScheduleLoading=i}}}_renderEveSchedule(e){if(!this._isEveDevice(e))return F;if(this._eveScheduleLoading.has(e.node_id))return V`
        <div class="device-section">
          <div class="section-header">Heating Schedule</div>
          <div class="eve-schedule-loading">Loading Eve schedule...</div>
        </div>
      `;const i=this._eveSchedules.get(e.node_id);if(!i)return F;const t={'"':"Comfort",$:"Eco","%":"Boost","&":"Off","*":"Custom"};return V`
      <div class="device-section">
        <div class="section-header">
          Heating Schedule
          ${i.name?V`<span class="section-context">${i.name}</span>`:F}
        </div>

        ${i.day_assignments.length>0?V`
              <div class="eve-schedule-grid">
                ${i.day_assignments.map(e=>V`
                    <div class="eve-day-slot">
                      <div class="eve-day-name">${e.day.slice(0,3)}</div>
                      <div class="eve-day-profile">${t[e.profile_id]||e.profile_id}</div>
                    </div>
                  `)}
              </div>
            `:F}

        ${i.time_slots.length>0?V`
              <div class="eve-time-slots">
                ${i.time_slots.map(e=>V`
                    <div class="eve-time-slot">
                      <span class="eve-time">${e.time}</span>
                      <span class="eve-profile">${t[e.profile_id]||e.profile_id}</span>
                    </div>
                  `)}
              </div>
            `:F}
      </div>
    `}_renderThermostatSchedule(e){if(this._isEveDevice(e))return F;const i=e.endpoints.find(e=>{return(i=e).server_clusters.includes(Ie)&&i.device_types.some(e=>769===e.id);var i});return i?V`
      <thermostat-schedule-editor
        .hass=${this.hass}
        .node=${e}
        .endpoint=${i}
      ></thermostat-schedule-editor>
    `:F}async _loadOverviewData(){this._overviewLoading=!0,this._error=null;try{const e=[];for(const i of this._nodes)for(const t of i.endpoints)if(t.has_binding_cluster)try{const n=await ti(this.hass,i.node_id,t.endpoint_id);for(const r of n.bindings){const n=r.target_node_id&&this._nodes.find(e=>e.node_id===r.target_node_id)||null,o=n&&r.target_endpoint_id&&n.endpoints.find(e=>e.endpoint_id===r.target_endpoint_id)||null;e.push({binding:r,sourceNode:i,sourceEndpoint:t,targetNode:n,targetEndpoint:o})}}catch{}this._allBindings=e;const i=new Set(e.filter(e=>null!==e.binding.target_node_id).map(e=>e.binding.target_node_id));Promise.all(Array.from(i).map(e=>this._loadACLForNode(e))).catch(e=>console.error("Failed to load some target ACLs:",e)),this._recommendations=this._computeRecommendations(),this._automationRecommendations=this._computeAutomationRecommendations()}catch(e){this._error=`Failed to load overview data: ${e instanceof Error?e.message:String(e)}`}finally{this._overviewLoading=!1}}_computeAutomationRecommendations(){const e=[],i=new Set;for(const t of this._nodes)for(const n of t.endpoints){const r=n.device_types.map(e=>e.id);for(const o of this._nodes)if(!t.area_name||!o.area_name||t.area_name===o.area_name)for(const s of o.endpoints){if(t.node_id===o.node_id)continue;const a=s.device_types.map(e=>e.id);for(const d of Je){const c=d.sourceDeviceTypes.some(e=>r.includes(e)),l=d.targetDeviceTypes.some(e=>a.includes(e));if(c&&l){const r=`${d.id}-${t.node_id}-${o.node_id}`;if(i.has(r))continue;i.add(r),e.push({template:d,sourceNode:t,sourceEndpoint:n,targetNode:o,targetEndpoint:s})}}}}return e}_computeRecommendations(){return function(e,i){const t=[];for(const n of e)for(const r of n.endpoints){const o=r.client_clusters||[];if(0!==o.length&&r.has_binding_cluster)for(const s of e)for(const e of s.endpoints){if(n.node_id===s.node_id&&r.endpoint_id===e.endpoint_id)continue;const a=e.server_clusters||[],d=o.filter(e=>a.includes(e));if(0===d.length)continue;const c=d.filter(t=>!i.some(i=>i.binding.node_id===n.node_id&&i.binding.endpoint_id===r.endpoint_id&&i.binding.target_node_id===s.node_id&&i.binding.target_endpoint_id===e.endpoint_id&&i.binding.cluster_id===t));0!==c.length&&t.push({sourceNode:n,sourceEndpoint:r,targetNode:s,targetEndpoint:e,compatibleClusters:c})}}return t.sort((e,i)=>i.compatibleClusters.length-e.compatibleClusters.length),t}(this._nodes,this._allBindings)}_selectNode(e){this._lastVerificationResult=null,this._aclEntries=null,this._selectedSourceNode?.node_id===e.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=e,this._selectedSourceEndpoint=null,this._bindings=[],this._isEveDevice(e)&&this._loadEveSchedule(e))}_selectEndpoint(e,i){e.stopPropagation(),i.has_binding_cluster&&(this._lastVerificationResult=null,this._selectedSourceEndpoint=i,this._loadBindings())}async _deleteBinding(e){if(!confirm("Are you sure you want to delete this binding?"))return;const i=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=i;try{const i=await ni(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0);this._lastVerificationResult={success:i.success,verified:i.verified,message:i.message,error_type:i.error_type},await this._loadBindings()}catch(e){this._error=`Failed to delete binding: ${e instanceof Error?e.message:String(e)}`}finally{this._actionInProgress=null}}async _verifyBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._verificationInProgress=!0,this._lastVerificationResult=null;try{const e=await ri(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._lastVerificationResult={success:e.success,verified:e.verified,message:e.message,error_type:e.error_type},await this._loadBindings()}catch(e){this._lastVerificationResult={success:!1,verified:!1,message:`Failed to verify bindings: ${e instanceof Error?e.message:String(e)}`,error_type:"unknown_error"}}finally{this._verificationInProgress=!1}}}async _verifyBindingWithModal(e){const{binding:i}=e;this._verificationInProgress=!0,this._showVerificationModal=!0,this._verificationModalResult=null;try{const t=await ri(this.hass,i.node_id,i.endpoint_id);this._verificationModalResult={success:t.success,verified:t.verified,message:t.message,bindingContext:e}}catch(i){this._verificationModalResult={success:!1,verified:!1,message:`Failed to verify: ${i instanceof Error?i.message:String(i)}`,bindingContext:e}}finally{this._verificationInProgress=!1}}_closeVerificationModal(){this._showVerificationModal=!1,this._verificationModalResult=null}_openCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id);if(e.length>0){this._selectedTargetNodeId=e[0].node_id;const i=li(e[0]);this._selectedTargetEndpointId=i?.endpoint_id??null}this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null}_handleTargetNodeChange(e){const i=e.target;this._selectedTargetNodeId=parseInt(i.value,10);const t=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId);if(t){const e=li(t);this._selectedTargetEndpointId=e?.endpoint_id??null}}_handleTargetEndpointChange(e){const i=e.target;this._selectedTargetEndpointId=parseInt(i.value,10)}_getCompatibleClusters(){if(!this._selectedSourceEndpoint||!this._selectedTargetNodeId||!this._selectedTargetEndpointId)return[];const e=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),i=e?.endpoints.find(e=>e.endpoint_id===this._selectedTargetEndpointId);if(!i)return[];const t=this._selectedSourceEndpoint.client_clusters||[],n=i.server_clusters||[];return t.filter(e=>n.includes(e))}_handleReviewBinding(e){e.preventDefault();const i=e.target,t=new FormData(i),n=parseInt(t.get("targetNode"),10),r=parseInt(t.get("targetEndpoint"),10),o=parseInt(t.get("cluster"),10);if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return;const s=this._selectedSourceEndpoint.client_clusters||[],a=this._nodes.find(e=>e.node_id===n),d=a?.endpoints.find(e=>e.endpoint_id===r),c=d?.server_clusters||[];s.includes(o)?c.includes(o)?a&&d?(this._pendingManualBinding={sourceNode:this._selectedSourceNode,sourceEndpoint:this._selectedSourceEndpoint,targetNode:a,targetEndpoint:d,clusterId:o},this._showCreateDialog=!1):this._error="Invalid target selection":this._error=`Target endpoint does not have cluster ${qe(o)} as a server cluster`:this._error=`Source endpoint does not have cluster ${qe(o)} as a client cluster`}_confirmManualBinding(){if(!this._pendingManualBinding)return;const{sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n,clusterId:r}=this._pendingManualBinding;this._pendingManualBinding=null,this._startBindingWizard(e,i,t,n,r)}_closeManualBindingConfirmDialog(){this._pendingManualBinding=null}_getNodeName(e){const i=this._nodes.find(i=>i.node_id===e);return i?.name||`Node ${e}`}_getNodeDeviceId(e){const i=this._nodes.find(i=>i.node_id===e);return i?.ha_device_id}_getClusterName(e){return je[e]||`Cluster 0x${e.toString(16)}`}async _submitSurvey(){this._surveySubmitting=!0;try{await this.hass.callService("matter_binding_helper","submit_survey",{}),this._surveyResult={success:!0,message:"Survey submitted successfully! Thank you for contributing to Matter device research."}}catch(e){this._surveyResult={success:!1,message:`Failed to submit survey: ${e instanceof Error?e.message:String(e)}`}}finally{this._surveySubmitting=!1}}_closeSurveyResultDialog(){this._surveyResult=null}_renderSurveyResultDialog(){if(!this._surveyResult)return F;const{success:e,message:i}=this._surveyResult;return V`
      <div class="dialog-overlay" @click=${this._closeSurveyResultDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${e?"✓":"✗"}</span>
            ${e?"Survey Submitted":"Survey Failed"}
          </div>
          <p style="margin: 16px 0; color: var(--primary-text-color);">${i}</p>
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
    `}render(){return V`
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

        ${this._error?V`<div class="error">${this._error}</div>`:F}

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
        ${this._showCreateDialog?this._renderCreateDialog():F}
        ${this._pendingBindingRecommendation?this._renderBindingConfirmDialog():F}
        ${this._pendingManualBinding?this._renderManualBindingConfirmDialog():F}
        ${this._pendingDeleteBinding?this._renderDeleteConfirmDialog():F}
        ${this._showVerificationModal?this._renderVerificationModal():F}
        ${this._bindingWizard?this._renderBindingWizard():F}
        ${this._showBulkRepairModal?this._renderBulkRepairModal():F}
        ${this._renderSurveyResultDialog()}
      </div>
    `}_renderOverviewTab(){return V`
      <div class="overview-content">
        ${this._overviewLoading?V`<div class="loading">Loading bindings...</div>`:V`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
              ${this._renderRecommendedAutomations()}
            `}
      </div>
    `}_renderEstablishedBindings(){const e=this._allBindings.filter(e=>{if(null!==e.binding.target_group_id)return!1;return!this._checkBindingACL(e.binding,e.sourceNode.node_id).hasPermission});return V`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
          ${e.length>0?V`
            <button
              class="btn btn-small btn-repair ${this._bulkRepairInProgress?"btn-loading":""}"
              ?disabled=${this._bulkRepairInProgress}
              @click=${this._repairAllACLs}
              title="Repair ACL permissions for all bindings"
            >
              ${this._bulkRepairInProgress?"Repairing...":`🔧 Repair All (${e.length})`}
            </button>
          `:F}
        </div>
        ${0===this._allBindings.length?V`<div class="empty-state">No bindings configured yet.</div>`:V`
              <div class="binding-list">
                ${this._allBindings.map(e=>this._renderEstablishedBindingRow(e))}
              </div>
            `}
      </div>
    `}_renderEstablishedBindingRow(e){const{binding:i,sourceNode:t,sourceEndpoint:n,targetNode:r}=e,o=r?.name||`Node ${i.target_node_id}`,s=null!==i.target_group_id,a=Ke(i.cluster_id),d=s?{hasPermission:!0}:this._checkBindingACL(i,t.node_id);return V`
      <div class="overview-binding-row readable ${d.hasPermission?"":"binding-missing-acl"}">
        <div class="binding-description">
          <div class="binding-sentence">
            ${d.hasPermission?F:V`<span class="acl-warning" title="${d.reason||"Missing ACL permission"}">⚠️</span>`}
            <strong
              class="${t.ha_device_id?"device-link":""}"
              @click=${t.ha_device_id?()=>this._navigateToDevice(t.ha_device_id):F}
            >${t.name}</strong>
            <span class="binding-action">${a.action}</span>
            <strong
              class="${!s&&r?.ha_device_id?"device-link":""}"
              @click=${!s&&r?.ha_device_id?()=>this._navigateToDevice(r.ha_device_id):F}
            >${s?`Group ${i.target_group_id}`:o}</strong>
          </div>
          <div class="binding-meta">
            EP ${n.endpoint_id} → ${s?"Group":`EP ${i.target_endpoint_id}`}
            ${t.area_name?V` · ${t.area_name}`:F}
            ${d.hasPermission?F:V`<span class="acl-warning-text"> · ${d.reason}</span>`}
          </div>
        </div>
        <div class="binding-actions">
          ${d.hasPermission||s?F:V`
            <span
              class="repair-icon ${this._aclRepairInProgress.get(`${t.node_id}-${n.endpoint_id}-${i.target_node_id}-${i.cluster_id}`)?"loading":""}"
              title="Repair ACL permissions"
              @click=${()=>this._repairBindingACL(e)}
            >
              ${this._aclRepairInProgress.get(`${t.node_id}-${n.endpoint_id}-${i.target_node_id}-${i.cluster_id}`)?"⏳":"🔧"}
            </span>
          `}
          <button
            class="btn-icon verify"
            title="Verify binding on device"
            ?disabled=${this._verificationInProgress||null!==this._actionInProgress}
            @click=${()=>this._verifyBindingWithModal(e)}
          >
            ✓
          </button>
          <button
            class="btn-icon delete"
            title="Delete binding"
            ?disabled=${null!==this._actionInProgress}
            @click=${()=>this._showDeleteConfirmDialog(e)}
          >
            ✕
          </button>
        </div>
      </div>
    `}_renderRecommendedBindings(){const e=this._filterSameAreaOnly?this._recommendations.filter(e=>{const i=e.sourceNode.area_name,t=e.targetNode.area_name;return i&&t&&i===t}):this._recommendations;return V`
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
          ${this._filterSameAreaOnly&&e.length!==this._recommendations.length?V`<span class="filter-info">(${this._recommendations.length-e.length} hidden)</span>`:F}
        </div>
        ${0===e.length?V`<div class="empty-state">
              ${this._filterSameAreaOnly&&this._recommendations.length>0?"No same-area recommendations. Toggle filter to see cross-area bindings.":"No binding recommendations. All compatible endpoints are already bound."}
            </div>`:V`
              <div class="binding-list">
                ${e.map(e=>this._renderRecommendationRow(e))}
              </div>
            `}
      </div>
    `}_renderRecommendedAutomations(){return 0===this._automationRecommendations.length?F:V`
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
    `}_renderAutomationRow(e){const{template:i,sourceNode:t,targetNode:n}=e;return V`
      <div class="overview-binding-row automation readable">
        <div class="binding-description">
          <div class="automation-title">
            <span class="automation-icon">${i.icon}</span>
            <strong
              class="${t.ha_device_id?"device-link":""}"
              @click=${t.ha_device_id?()=>this._navigateToDevice(t.ha_device_id):F}
            >${t.name}</strong> + <strong
              class="${n.ha_device_id?"device-link":""}"
              @click=${n.ha_device_id?()=>this._navigateToDevice(n.ha_device_id):F}
            >${n.name}</strong>
          </div>
          <div class="automation-suggestion">${i.title}</div>
          <div class="automation-why">
            <span class="why-label">Why not a binding?</span> ${i.why}
          </div>
          ${t.area_name?V`<div class="binding-meta">${t.area_name}</div>`:F}
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
    `}_toggleAreaFilter(e){const i=e.target;this._filterSameAreaOnly=i.checked}_renderRecommendationRow(e){const{sourceNode:i,sourceEndpoint:t,targetNode:n,targetEndpoint:r,compatibleClusters:o}=e,s=o.map(e=>Ke(e).action.replace(/^(control |read |receive |trigger |manage )/,"")),a=[...new Set(s)],d=a.length>2?`${a.slice(0,2).join(", ")}...`:a.join(", ");return V`
      <div class="overview-binding-row recommendation readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${i.ha_device_id?"device-link":""}"
              @click=${i.ha_device_id?()=>this._navigateToDevice(i.ha_device_id):F}
            >${i.name}</strong>
            <span class="binding-action">can ${1===o.length?Ke(o[0]).action:`access ${d} from`}</span>
            <strong
              class="${n.ha_device_id?"device-link":""}"
              @click=${n.ha_device_id?()=>this._navigateToDevice(n.ha_device_id):F}
            >${n.name}</strong>
            <span class="cluster-badges">
              ${o.map(e=>{const i=qe(e),t=`${i}: ${Ke(e).dataType}`;return V`<span class="cluster-badge" title="${t}">${i}</span>`})}
            </span>
          </div>
          <div class="binding-meta">
            EP ${t.endpoint_id} → EP ${r.endpoint_id}
            ${i.area_name?V` · ${i.area_name}`:F}
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
    `}_showDeleteConfirmDialog(e){this._pendingDeleteBinding=e}_closeDeleteConfirmDialog(){this._pendingDeleteBinding=null}async _confirmDeleteBinding(){if(!this._pendingDeleteBinding)return;const{binding:e}=this._pendingDeleteBinding,i=`delete-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=i;try{const i=await ni(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0);this._lastVerificationResult={success:i.success,verified:i.verified,message:i.message,error_type:i.error_type},this._closeDeleteConfirmDialog(),await this._loadOverviewData()}catch(e){this._error=`Failed to delete binding: ${e instanceof Error?e.message:String(e)}`}finally{this._actionInProgress=null}}_showBindingConfirmDialog(e){this._pendingBindingRecommendation=e,this._selectedClusterForBinding=e.compatibleClusters[0]}_closeBindingConfirmDialog(){this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null}_handleClusterSelectChange(e){const i=e.target;this._selectedClusterForBinding=parseInt(i.value,10)}_confirmCreateBinding(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return;const{sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n}=this._pendingBindingRecommendation,r=this._selectedClusterForBinding;this._closeBindingConfirmDialog(),this._startBindingWizard(e,i,t,n,r)}_renderBindingsTab(){return V`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Devices</div>
          ${this._loading&&0===this._nodes.length?V`<div class="loading">Loading...</div>`:V`
                <ul class="node-list">
                  ${this._nodes.map(e=>this._renderNodeItem(e))}
                </ul>
              `}
        </div>

        <div class="card device-panel">
          ${this._selectedSourceNode?this._renderDeviceDetails(this._selectedSourceNode):V`
                <div class="empty-state">
                  Select a device to view details and manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_renderDeviceDetails(e){const i=e.device_info,t=this._getPrimaryDeviceType(e),n=e.endpoints.length;return V`
      <div class="device-details">
        <div class="device-header">
          <div class="device-title">
            <h2>${e.name}</h2>
            ${e.ha_device_id?V`<a
                  class="device-ha-link"
                  href="/config/devices/device/${e.ha_device_id}"
                  title="View in Home Assistant"
                >↗</a>`:F}
          </div>
          <div class="device-meta">
            ${t?V`<span class="device-type-tag">${t}</span>`:F}
            ${e.area_name?V`<span class="device-area-tag">${e.area_name}</span>`:F}
            ${i?.software_version?V`<span class="device-version">v${i.software_version}</span>`:F}
          </div>
        </div>

        <div class="device-section">
          <div class="section-header">Endpoints</div>
          ${n>0?V`
                <div class="endpoint-list">
                  ${e.endpoints.map(e=>this._renderEndpointItem(e))}
                </div>
              `:V`<div class="no-endpoints">No endpoints found</div>`}
        </div>

        ${this._renderACLSection(e)}

        ${this._renderEntityList(e)}
        ${this._renderDeviceRegistryInfo(e)}
        ${this._renderEveSchedule(e)}
        ${this._renderThermostatSchedule(e)}

        <div class="device-section">
          <div class="section-header">
            Bindings
            ${this._selectedSourceEndpoint?V`
                  <span class="section-context">
                    Endpoint ${this._selectedSourceEndpoint.endpoint_id}
                  </span>
                  <button
                    class="btn btn-small btn-verify ${this._verificationInProgress?"btn-loading":""}"
                    ?disabled=${this._verificationInProgress||null!==this._actionInProgress}
                    @click=${this._verifyBindings}
                    title="Re-read bindings from device to verify"
                  >
                    ${this._verificationInProgress?"":"✓ Verify on Device"}
                  </button>
                  <button
                    class="btn btn-small btn-primary"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `:F}
          </div>
          ${this._lastVerificationResult?V`
                <div class="verification-result ${this._lastVerificationResult.verified?"verified":this._lastVerificationResult.success?"warning":"error"} ${this._lastVerificationResult.error_type?this._getErrorDisplay(this._lastVerificationResult.error_type).cssClass:""}">
                  <span class="verification-icon">
                    ${this._lastVerificationResult.verified?"✓":this._lastVerificationResult.success?"⚠":this._lastVerificationResult.error_type?this._getErrorDisplay(this._lastVerificationResult.error_type).icon:"✗"}
                  </span>
                  <span class="verification-message">${this._lastVerificationResult.message}</span>
                  <button class="verification-dismiss" @click=${()=>this._lastVerificationResult=null}>×</button>
                </div>
              `:F}
          ${this._selectedSourceEndpoint?this._bindings.length>0?V`
                  <div class="binding-list">
                    ${this._bindings.map(e=>this._renderBindingCard(e))}
                  </div>
                `:V`
                  <div class="empty-state-small">
                    No bindings configured for this endpoint.
                  </div>
                `:V`
                <div class="empty-state-small">
                  Select an endpoint with binding support to manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_getPrimaryDeviceType(e){const i=e.endpoints.find(e=>1===e.endpoint_id)||e.endpoints.find(e=>e.endpoint_id>0);return i&&i.device_types.length>0?Ge(i.device_types[0].id):null}_renderNodeItem(e){const i=this._selectedSourceNode?.node_id===e.node_id,t=this._getPrimaryDeviceType(e);return V`
      <li>
        <div
          class="node-item ${i?"selected":""}"
          @click=${()=>this._selectNode(e)}
        >
          <span
            class="node-status ${e.available?"":"unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">${e.name}</span>
            <div class="node-meta">
              ${t?V`<span class="node-device-type">${t}</span>`:F}
              ${t&&e.area_name?V`<span class="node-meta-sep">·</span>`:F}
              ${e.area_name?V`<span class="node-area">${e.area_name}</span>`:F}
            </div>
          </div>
        </div>
      </li>
    `}async _loadACL(e){this._aclLoading=!0,this._aclEntries=null;try{const i=await oi(this.hass,e);i.success&&(this._aclEntries=i.entries)}catch(e){console.error("Failed to load ACL:",e)}finally{this._aclLoading=!1}}async _loadACLForNode(e){if(!this._targetACLCache.has(e)&&!this._aclLoadingNodes.has(e)){this._aclLoadingNodes=new Set([...this._aclLoadingNodes,e]);try{const i=await oi(this.hass,e);i.success&&(this._targetACLCache=new Map([...this._targetACLCache,[e,i.entries]]))}catch(i){console.error(`Failed to load ACL for node ${e}:`,i)}finally{const i=new Set(this._aclLoadingNodes);i.delete(e),this._aclLoadingNodes=i}}}_checkBindingACL(e,i){const t=e.target_node_id;if(null===t)return{hasPermission:!0,status:"ok"};if(this._aclLoadingNodes.has(t))return{hasPermission:!0,status:"loading"};const n=this._targetACLCache.get(t);if(void 0===n)return{hasPermission:!0,status:"unknown",reason:"ACL not loaded"};if(0===n.length)return{hasPermission:!1,status:"missing",reason:"No ACL entries on target"};const r=e.cluster_id,o=[6,8,768,513,514].includes(r)?3:1,s=3===o?"Operate":"View";for(const e of n)if(2===e.auth_mode&&!(e.privilege<o)&&(!(e.subjects.length>0)||e.subjects.includes(i))){if(e.targets.length>0){const i=e.targets.some(e=>null===e.cluster||e.cluster===r);if(!i)continue}return{hasPermission:!0,status:"ok"}}return{hasPermission:!1,status:"missing",reason:`Target missing ${s} permission for source node ${i}`}}_getErrorDisplay(e){switch(e){case"permission_denied":return{icon:"🔒",cssClass:"error-permission"};case"device_unavailable":return{icon:"📴",cssClass:"error-unavailable"};case"device_timeout":return{icon:"⏱️",cssClass:"error-timeout"};case"device_rejected":return{icon:"🚫",cssClass:"error-rejected"};case"invalid_request":return{icon:"⚠️",cssClass:"error-invalid"};default:return{icon:"❌",cssClass:"error-unknown"}}}_renderACLSection(e){return V`
      <div class="device-section">
        <div class="section-header">
          <span>Access Control (ACL)</span>
          <button
            class="btn btn-small"
            ?disabled=${this._aclLoading}
            @click=${()=>this._loadACL(e.node_id)}
          >
            ${this._aclLoading?"Loading...":"Load from Device"}
          </button>
        </div>
        ${null!==this._aclEntries?this._aclEntries.length>0?V`
                <div class="acl-list">
                  ${this._aclEntries.map((i,t)=>this._renderACLEntry(i,t,e))}
                </div>
              `:V`<div class="empty-state-small">No ACL entries found on device.</div>`:V`
              <div class="empty-state-small">
                Click "Load from Device" to read ACL entries.
              </div>
            `}
      </div>
    `}_renderACLEntry(e,i,t){const n=e.subjects.map(e=>{const i=this._nodes.find(i=>i.node_id===e);return i?`${i.name} (${e})`:`Node ${e}`}),r=e.targets.length>0?e.targets.map(e=>{const i=[];if(null!==e.cluster){const t=je[e.cluster]||`0x${e.cluster.toString(16).padStart(4,"0")}`;i.push(t)}return null!==e.endpoint&&i.push(`EP ${e.endpoint}`),null!==e.device_type&&i.push(`DT ${e.device_type}`),i.join(", ")}):["All resources"],o=5===e.privilege,s=3===e.privilege;return V`
      <div class="acl-entry ${o?"acl-admin":""} ${s?"acl-operate":""}">
        <div class="acl-entry-header">
          <span class="acl-index">#${i+1}</span>
          <span class="acl-privilege ${e.privilege_name.toLowerCase()}">${e.privilege_name}</span>
          <span class="acl-auth-mode">(${e.auth_mode_name})</span>
        </div>
        <div class="acl-entry-details">
          <div class="acl-row">
            <span class="acl-label">Subjects:</span>
            <span class="acl-value">
              ${n.length>0?n.join(", "):"All (any authenticated)"}
            </span>
          </div>
          <div class="acl-row">
            <span class="acl-label">Targets:</span>
            <span class="acl-value">${r.join("; ")}</span>
          </div>
        </div>
      </div>
    `}_renderEntityList(e){const i=e.entities||[];if(0===i.length)return F;const t={light:"💡",switch:"🔌",event:"🔘",sensor:"📊",binary_sensor:"⚡",climate:"🌡️",cover:"🪟",fan:"💨",lock:"🔒",button:"⏺️"};return V`
      <div class="device-section">
        <div class="section-header">Home Assistant Entities</div>
        <div class="entity-chips">
          ${i.filter(e=>!e.disabled).map(e=>V`
                <button
                  class="entity-chip"
                  @click=${i=>{i.stopPropagation(),this._openEntityMoreInfo(e.entity_id)}}
                >
                  <span class="domain-icon">${t[e.domain]||"📦"}</span>
                  <span>${e.name||e.entity_id}</span>
                </button>
              `)}
        </div>
      </div>
    `}_openEntityMoreInfo(e){const i=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(i)}_getMatchingDeviceDefinition(e){const i=e.device_info?.vendor_id;if(!i)return;const t=new Set,n=new Set;for(const i of e.endpoints){for(const e of i.server_clusters||[])t.add(e);for(const e of i.device_types)n.add(e.id)}return ke(i,Array.from(t),Array.from(n))}_renderDeviceRegistryInfo(e){const i=this._getMatchingDeviceDefinition(e);if(!i)return F;const t=i.extends&&i.extends.length>0;return V`
      <div class="device-section registry-info">
        <div class="section-header">
          Device Database
          <span class="registry-badge">Matched</span>
        </div>
        <div class="registry-details">
          <div class="registry-model">
            <strong>${i.vendor}</strong> ${i.model}
          </div>
          ${i.description?V`<div class="registry-description">${i.description}</div>`:F}
          ${t?V`
                <div class="registry-features">
                  <span class="feature-label">Features:</span>
                  ${i.extends.map(e=>V`<span class="feature-tag">${e.name}</span>`)}
                </div>
              `:F}
          ${i.productUrl?V`
                <a
                  class="registry-link"
                  href="${i.productUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  Product Page ↗
                </a>
              `:F}
        </div>
      </div>
    `}_navigateToDevice(e){e&&(history.pushState(null,"",`/config/devices/device/${e}`),window.dispatchEvent(new CustomEvent("location-changed")))}_renderEndpointItem(e){const i=this._selectedSourceEndpoint?.endpoint_id===e.endpoint_id,t=e.device_types.map(e=>Ge(e.id)).filter(i=>0!==e.endpoint_id||!i.includes("Root")),n=[29,30,31,40,42,48,49,50,51,52,53,56,60,62,63,70],r=e.cluster_commands||{},o=(e.server_clusters||[]).filter(e=>!n.includes(e)).map(e=>{const i=r[e];return{id:e,name:qe(e),isProprietary:$e(e),commands:i?.accepted||[],commandNames:i?.names||{}}}),s=(e.client_clusters||[]).filter(e=>!n.includes(e)).map(e=>{const i=r[e];return{id:e,name:qe(e),isProprietary:$e(e),commands:i?.accepted||[],commandNames:i?.names||{}}}),a=o.some(e=>e.isProprietary)||s.some(e=>e.isProprietary),d=e=>{const i=`${e.name} (0x${e.id.toString(16).toUpperCase()})`;if(0===e.commands.length)return i;return`${i}\n\nAccepted commands:\n  ${e.commands.map(i=>{const t=e.commandNames[i];return t?`${t} (${i})`:`${i}`}).join("\n  ")}`};return V`
      <div
        class="endpoint-item ${i?"selected":""} ${e.has_binding_cluster?"":"no-binding"}"
        @click=${i=>this._selectEndpoint(i,e)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${e.endpoint_id}</span>
          ${e.has_binding_cluster?V`<span class="endpoint-badge binding">Binding</span>`:F}
          ${a?V`<span class="endpoint-badge proprietary">Proprietary</span>`:F}
        </div>
        ${t.length>0?V`<div class="endpoint-device-types">${t.join(", ")}</div>`:F}
        ${o.length>0?V`<div class="endpoint-clusters">
              <span class="cluster-role">Server:</span>
              ${o.map((e,i)=>V`${i>0?" · ":""}<span
                class="${e.isProprietary?"cluster-proprietary":"cluster-name"}"
                title="${d(e)}"
              >${e.name}${e.commands.length>0?V`<span class="cluster-cmd-count">(${e.commands.length})</span>`:F}</span>`)}
            </div>`:F}
        ${s.length>0?V`<div class="endpoint-clusters">
              <span class="cluster-role">Client:</span>
              ${s.map((e,i)=>V`${i>0?" · ":""}<span
                class="${e.isProprietary?"cluster-proprietary":"cluster-name"}"
                title="${d(e)}"
              >${e.name}${e.commands.length>0?V`<span class="cluster-cmd-count">(${e.commands.length})</span>`:F}</span>`)}
            </div>`:F}
      </div>
    `}_renderBindingCard(e){const i=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`,t=this._actionInProgress===i,n=null!==e.target_group_id,r=e.node_id,o=n?{hasPermission:!0}:this._checkBindingACL(e,r);return V`
      <div class="binding-card ${o.hasPermission?"":"binding-missing-acl"}">
        ${o.hasPermission?F:V`<div class="acl-warning-banner">
              ⚠️ ${o.reason}
            </div>`}
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${n?`Group ${e.target_group_id}`:V`<span
                    class="${this._getNodeDeviceId(e.target_node_id)?"device-link":""}"
                    @click=${this._getNodeDeviceId(e.target_node_id)?i=>{i.stopPropagation(),this._navigateToDevice(this._getNodeDeviceId(e.target_node_id))}:F}
                  >${this._getNodeName(e.target_node_id)}</span> - Endpoint ${e.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">
              ${this._getClusterName(e.cluster_id)}
            </span>
          </div>
        </div>
        <button
          class="delete-btn ${t?"btn-loading":""}"
          ?disabled=${t||null!==this._actionInProgress}
          @click=${()=>this._deleteBinding(e)}
        >
          ${t?"":"Delete"}
        </button>
      </div>
    `}_renderGroupsTab(){return V`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading?V`<div class="loading">Loading...</div>`:this._groups.length>0?V`
                <div class="binding-list">
                  ${this._groups.map(e=>V`
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
              `:V`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `}_renderBindingConfirmDialog(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return F;const{sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n,compatibleClusters:r}=this._pendingBindingRecommendation,o=this._selectedClusterForBinding,s=Ke(o),a=null!==this._actionInProgress;return V`
      <div class="dialog-overlay" @click=${this._closeBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${e.name}</div>
              <div class="binding-device-endpoint">Endpoint ${i.endpoint_id}</div>
              ${e.area_name?V`<div class="binding-device-area">${e.area_name}</div>`:F}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${qe(o)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${t.name}</div>
              <div class="binding-device-endpoint">Endpoint ${n.endpoint_id}</div>
              ${t.area_name?V`<div class="binding-device-area">${t.area_name}</div>`:F}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${e.name}</strong> will ${s.action}
              <strong>${t.name}</strong> using ${s.dataType}.
            </div>
          </div>

          ${r.length>1?V`
                <div class="cluster-select-group">
                  <label>Select cluster to bind:</label>
                  <select
                    class="form-select"
                    @change=${this._handleClusterSelectChange}
                  >
                    ${r.map(e=>V`
                        <option value=${e} ?selected=${e===o}>
                          ${qe(e)} - ${Ke(e).dataType}
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
    `}_renderManualBindingConfirmDialog(){if(!this._pendingManualBinding)return F;const{sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n,clusterId:r}=this._pendingManualBinding,o=Ke(r),s=null!==this._actionInProgress;return V`
      <div class="dialog-overlay" @click=${this._closeManualBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${e.name}</div>
              <div class="binding-device-endpoint">Endpoint ${i.endpoint_id}</div>
              ${e.area_name?V`<div class="binding-device-area">${e.area_name}</div>`:F}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${qe(r)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${t.name}</div>
              <div class="binding-device-endpoint">Endpoint ${n.endpoint_id}</div>
              ${t.area_name?V`<div class="binding-device-area">${t.area_name}</div>`:F}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${e.name}</strong> will ${o.action}
              <strong>${t.name}</strong> using ${o.dataType}.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeManualBindingConfirmDialog}
              ?disabled=${s}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${s?"btn-loading":""}"
              @click=${this._confirmManualBinding}
              ?disabled=${s}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `}_renderDeleteConfirmDialog(){if(!this._pendingDeleteBinding)return F;const{binding:e,sourceNode:i,sourceEndpoint:t,targetNode:n}=this._pendingDeleteBinding,r=Ke(e.cluster_id),o=n?.name||`Node ${e.target_node_id}`,s=null!==this._actionInProgress,a=null!==e.target_group_id;return V`
      <div class="dialog-overlay" @click=${this._closeDeleteConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🗑️</span>
            Remove Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${i.name}</div>
              <div class="binding-device-endpoint">Endpoint ${t.endpoint_id}</div>
              ${i.area_name?V`<div class="binding-device-area">${i.area_name}</div>`:F}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${qe(e.cluster_id)}</span>
              <span class="binding-arrow-large" style="text-decoration: line-through; color: var(--error-color);">→</span>
            </div>
            <div class="binding-device-card target">
              ${a?V`<div class="binding-device-name">Group ${e.target_group_id}</div>`:V`
                    <div class="binding-device-name">${o}</div>
                    <div class="binding-device-endpoint">Endpoint ${e.target_endpoint_id}</div>
                    ${n?.area_name?V`<div class="binding-device-area">${n.area_name}</div>`:F}
                  `}
            </div>
          </div>

          <div class="binding-explanation" style="border-left: 3px solid var(--error-color);">
            <div class="binding-explanation-header">After removing this binding:</div>
            <div class="binding-explanation-content">
              <strong>${i.name}</strong> will stop being able to ${r.action}
              <strong>${a?`Group ${e.target_group_id}`:o}</strong>.
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
    `}_renderVerificationModal(){const e=this._verificationModalResult,i=e?.bindingContext,t=this._verificationInProgress;return V`
      <div class="dialog-overlay" @click=${this._closeVerificationModal}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${t?"⏳":e?.verified?"✅":e?.success?"⚠️":"❌"}</span>
            Binding Verification
          </div>

          ${t?V`
                <div class="verification-loading">
                  <div class="loading-spinner"></div>
                  <p>Reading bindings from device...</p>
                </div>
              `:e?V`
                  <div class="verification-modal-result ${e.verified?"verified":e.success?"warning":"error"}">
                    <div class="verification-status-icon">
                      ${e.verified?"✓":e.success?"⚠":"✗"}
                    </div>
                    <div class="verification-status-text">
                      ${e.verified?"Binding Verified":e.success?"Verification Warning":"Verification Failed"}
                    </div>
                  </div>

                  <div class="verification-details">
                    <p class="verification-message">${e.message}</p>

                    ${i?V`
                          <div class="verification-binding-info">
                            <strong>${i.sourceNode.name}</strong>
                            <span class="binding-action">${Ke(i.binding.cluster_id).action}</span>
                            <strong>${i.targetNode?.name||`Node ${i.binding.target_node_id}`}</strong>
                          </div>
                        `:F}

                    ${!e.verified&&e.success?V`
                          <div class="verification-help">
                            <strong>What this means:</strong>
                            <p>The binding data was written, but could not be confirmed on the device. This might happen if:</p>
                            <ul>
                              <li>The device rejected the binding due to ACL restrictions</li>
                              <li>The device doesn't support this binding type</li>
                              <li>The device is temporarily unavailable</li>
                            </ul>
                          </div>
                        `:F}
                  </div>
                `:F}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeVerificationModal}
              ?disabled=${t}
            >
              ${t?"Verifying...":"Close"}
            </button>
          </div>
        </div>
      </div>
    `}_renderCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id),i=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId),t=ci(i?.endpoints||[]),n=this._getCompatibleClusters(),r=this._selectedSourceEndpoint?.client_clusters||[],o=r.length>0,s=this._selectedSourceEndpoint?.device_types[0]?Ge(this._selectedSourceEndpoint.device_types[0].id):null,a=(d=r,d.filter(e=>!pi.includes(e))).map(e=>qe(e));var d;return V`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            Create Binding from ${this._selectedSourceNode?.name} EP${this._selectedSourceEndpoint?.endpoint_id}
            ${s?V`<span class="device-type-badge">${s}</span>`:F}
          </div>

          ${a.length>0?V`
                <div class="dialog-subheader">
                  Can control: ${a.join(", ")}
                </div>
              `:F}

          ${o?F:V`
                <div class="dialog-warning">
                  <strong>Note:</strong> This endpoint can't control other devices (no client clusters).
                  Try selecting a different endpoint.
                </div>
              `}

          ${n.length>0?V`
                <div style="color: var(--success-color, #4caf50); padding: 8px 0; font-size: 14px;">
                  ✓ ${n.length} compatible cluster${1!==n.length?"s":""} found
                </div>
              `:F}

          <form @submit=${this._handleReviewBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select
                name="targetNode"
                class="form-select"
                required
                @change=${this._handleTargetNodeChange}
              >
                ${e.map(e=>{const i=e.endpoints.find(e=>0!==e.endpoint_id),t=[i?.device_types[0]?Ge(i.device_types[0].id):null,e.area_name].filter(Boolean).join(" · ");return V`
                    <option
                      value=${e.node_id}
                      ?selected=${e.node_id===this._selectedTargetNodeId}
                    >
                      ${e.name}${t?` (${t})`:""}
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
                ${t.map(e=>{const i=e.device_types.map(e=>Ge(e.id)).join(", "),t=function(e,i){const t=i.server_clusters||[];return e.filter(e=>t.includes(e)).length}(r,e);return V`
                    <option
                      value=${e.endpoint_id}
                      ?selected=${e.endpoint_id===this._selectedTargetEndpointId}
                    >
                      Endpoint ${e.endpoint_id}${i?` (${i})`:""} · ${t} compatible cluster${1!==t?"s":""}
                    </option>
                  `})}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              ${n.length>0?V`
                    <select name="cluster" class="form-select" required>
                      ${n.map(e=>{const i=qe(e),t=Ke(e);return V`
                          <option value=${e} title="${i}: ${t.dataType}">
                            ${i} - ${t.dataType}
                          </option>
                        `})}
                    </select>
                  `:V`
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
    `}_startBindingWizard(e,i,t,n,r){this._bindingWizard={currentStep:"binding",sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n,clusterId:r,selectedPrivilege:hi(r),bindingInProgress:!1,aclInProgress:!1,verifyInProgress:!1}}_closeBindingWizard(){this._bindingWizard=null,this._loadOverviewData()}_goToWizardStep(e){this._bindingWizard&&(this._bindingWizard={...this._bindingWizard,currentStep:e})}_handlePrivilegeChange(e){this._bindingWizard&&(this._bindingWizard={...this._bindingWizard,selectedPrivilege:e})}async _executeBindingStep(){if(!this._bindingWizard)return;const{sourceNode:e,sourceEndpoint:i,targetNode:t,targetEndpoint:n,clusterId:r}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,bindingInProgress:!0};try{const o=await async function(e,i,t,n,r,o,s,a=!0,d=!0){return e.callWS({type:`${ii}/create_binding`,source_node_id:i,source_endpoint_id:t,cluster_id:n,verify:a,provision_acl:d,...void 0!==r&&{target_node_id:r},...void 0!==o&&{target_endpoint_id:o},...void 0!==s})}(this.hass,e.node_id,i.endpoint_id,r,t.node_id,n.endpoint_id,void 0,!0,!1);this._bindingWizard={...this._bindingWizard,bindingResult:o,bindingInProgress:!1},o.success&&this._goToWizardStep("acl")}catch(e){this._bindingWizard={...this._bindingWizard,bindingResult:{success:!1,verified:!1,message:`Failed to create binding: ${e instanceof Error?e.message:String(e)}`,bindings_found:0,error_type:"unknown_error"},bindingInProgress:!1}}}async _executeACLStep(){if(!this._bindingWizard)return;const{sourceNode:e,targetNode:i,targetEndpoint:t,clusterId:n}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,aclInProgress:!0};try{const r=await si(this.hass,i.node_id,t.endpoint_id,e.node_id,n);this._bindingWizard={...this._bindingWizard,aclResult:r,aclInProgress:!1},r.success&&this._goToWizardStep("verify")}catch(e){this._bindingWizard={...this._bindingWizard,aclResult:{success:!1,message:`Failed to provision ACL: ${e instanceof Error?e.message:String(e)}`,acl_entries_count:0},aclInProgress:!1}}}async _executeVerifyStep(){if(!this._bindingWizard)return;const{sourceNode:e,sourceEndpoint:i}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,verifyInProgress:!0};try{const t=await ri(this.hass,e.node_id,i.endpoint_id);this._bindingWizard={...this._bindingWizard,verifyResult:t,verifyInProgress:!1}}catch(e){this._bindingWizard={...this._bindingWizard,verifyResult:{success:!1,verified:!1,message:`Failed to verify bindings: ${e instanceof Error?e.message:String(e)}`,bindings_found:0,error_type:"unknown_error"},verifyInProgress:!1}}}async _repairBindingACL(e){if(null===e.binding.target_node_id||null===e.binding.target_endpoint_id)return;const i=e.binding.target_node_id,t=e.binding.target_endpoint_id,n=`${e.sourceNode.node_id}-${e.sourceEndpoint.endpoint_id}-${i}-${e.binding.cluster_id}`;this._aclRepairInProgress=new Map(this._aclRepairInProgress),this._aclRepairInProgress.set(n,!0);try{const n=await si(this.hass,i,t,e.sourceNode.node_id,e.binding.cluster_id);if(!n.success)return void(this._error=`Failed to repair ACL: ${n.message}`);this._targetACLCache=new Map(this._targetACLCache),this._targetACLCache.delete(i),await this._loadOverviewData()}catch(e){const i=e instanceof Error?e.message:String(e);this._error=`Failed to repair ACL: ${i}`}finally{this._aclRepairInProgress=new Map(this._aclRepairInProgress),this._aclRepairInProgress.delete(n)}}async _repairAllACLs(){const e=this._allBindings.filter(e=>{if(null!==e.binding.target_group_id)return!1;return!this._checkBindingACL(e.binding,e.sourceNode.node_id).hasPermission});if(0===e.length)return;this._bulkRepairInProgress=!0,this._bulkRepairResult=null;const i=[];for(const t of e){const{binding:e,sourceNode:n}=t;if(null!==e.target_node_id&&null!==e.target_endpoint_id)try{const t=await si(this.hass,e.target_node_id,e.target_endpoint_id,n.node_id,e.cluster_id);i.push({target_node_id:e.target_node_id,target_endpoint_id:e.target_endpoint_id,cluster_id:e.cluster_id,success:t.success,message:t.success?"ACL provisioned successfully":t.message})}catch(t){const n=t instanceof Error?t.message:String(t);i.push({target_node_id:e.target_node_id,target_endpoint_id:e.target_endpoint_id,cluster_id:e.cluster_id,success:!1,message:n})}}const t=i.filter(e=>e.success).length;this._bulkRepairResult={success:t>0,results:i,total:i.length,succeeded:t},this._showBulkRepairModal=!0,this._targetACLCache=new Map,await this._loadOverviewData(),this._bulkRepairInProgress=!1}_closeBulkRepairModal(){this._showBulkRepairModal=!1,this._bulkRepairResult=null}_renderBindingWizard(){if(!this._bindingWizard)return F;const e=this._bindingWizard,i=e.currentStep,t=["binding","acl","verify"],n=t.indexOf(i),r=e.bindingInProgress||e.aclInProgress||e.verifyInProgress,o=hi(e.clusterId);return V`
      <div class="dialog-overlay" @click=${this._closeBindingWizard}>
        <div class="dialog" style="max-width: 550px;" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>

          <!-- Step Indicator -->
          <div class="wizard-steps">
            ${t.map((i,t)=>{const r=t<n||t===n&&("binding"===i&&e.bindingResult?.success||"acl"===i&&e.aclResult?.success||"verify"===i&&e.verifyResult?.success);return V`
                ${t>0?V`<div class="wizard-connector ${t<=n?"completed":""}"></div>`:F}
                <div class="wizard-step ${t===n?"active":""} ${r?"completed":""}">
                  <div class="wizard-step-circle">${r?"✓":t+1}</div>
                  <div class="wizard-step-label">
                    ${"binding"===i?"Create":"acl"===i?"Permissions":"Verify"}
                  </div>
                </div>
              `})}
          </div>

          <!-- Wizard Content -->
          <div class="wizard-content">
            ${"binding"===i?this._renderBindingStepContent():F}
            ${"acl"===i?this._renderACLStepContent(o):F}
            ${"verify"===i?this._renderVerifyStepContent():F}
          </div>

          <!-- Actions -->
          <div class="wizard-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeBindingWizard}
              ?disabled=${r}
            >
              ${"verify"===i&&e.verifyResult?"Done":"Cancel"}
            </button>

            ${"binding"===i?V`
              <button
                type="button"
                class="btn btn-primary ${e.bindingInProgress?"btn-loading":""}"
                @click=${this._executeBindingStep}
                ?disabled=${r}
              >
                Create Binding
              </button>
            `:F}

            ${"acl"===i?V`
              ${e.bindingResult?.success?V`
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click=${()=>this._goToWizardStep("verify")}
                  ?disabled=${r}
                >
                  Skip
                </button>
              `:F}
              <button
                type="button"
                class="btn btn-primary ${e.aclInProgress?"btn-loading":""}"
                @click=${this._executeACLStep}
                ?disabled=${r}
              >
                Set Permissions
              </button>
            `:F}

            ${"verify"===i?V`
              ${e.verifyResult?F:V`
                <button
                  type="button"
                  class="btn btn-primary ${e.verifyInProgress?"btn-loading":""}"
                  @click=${this._executeVerifyStep}
                  ?disabled=${r}
                >
                  Verify Binding
                </button>
              `}
            `:F}
          </div>
        </div>
      </div>
    `}_renderBindingStepContent(){if(!this._bindingWizard)return F;const e=this._bindingWizard,i=Ke(e.clusterId);return V`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 1: Create Binding</div>
        <div class="wizard-step-description">
          Write the binding to <strong>${e.sourceNode.name}</strong>
        </div>
      </div>

      <div class="binding-devices" style="justify-content: center;">
        <div class="binding-device-card source">
          <div class="binding-device-name">${e.sourceNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${e.sourceEndpoint.endpoint_id}</div>
        </div>
        <div class="binding-arrow-container">
          <span class="binding-cluster-label">${qe(e.clusterId)}</span>
          <span class="binding-arrow-large">→</span>
        </div>
        <div class="binding-device-card target">
          <div class="binding-device-name">${e.targetNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${e.targetEndpoint.endpoint_id}</div>
        </div>
      </div>

      <div class="binding-explanation">
        <div class="binding-explanation-content">
          <strong>${e.sourceNode.name}</strong> will ${i.action}
          <strong>${e.targetNode.name}</strong> using ${i.dataType}.
        </div>
      </div>

      ${e.bindingInProgress?V`
        <div class="wizard-progress-note">
          Communicating with Matter device... This may take a few seconds.
        </div>
      `:F}

      ${e.bindingResult?V`
        <div class="wizard-result ${e.bindingResult.success?"success":"error"}">
          <span class="wizard-result-icon">${e.bindingResult.success?"✓":"✗"}</span>
          <span class="wizard-result-message">${e.bindingResult.message}</span>
        </div>
      `:F}
    `}_renderACLStepContent(e){if(!this._bindingWizard)return F;const i=this._bindingWizard;return V`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 2: Set Permissions</div>
        <div class="wizard-step-description">
          Allow <strong>${i.sourceNode.name}</strong> to control <strong>${i.targetNode.name}</strong>
        </div>
      </div>

      <div class="privilege-selector">
        ${vi.map(t=>V`
          <div
            class="privilege-option ${i.selectedPrivilege===t.value?"selected":""}"
            @click=${()=>this._handlePrivilegeChange(t.value)}
          >
            <div class="privilege-radio"></div>
            <div class="privilege-content">
              <div class="privilege-label">
                ${t.label}
                ${t.value===e?V`
                  <span class="privilege-badge recommended">Recommended</span>
                `:F}
              </div>
              <div class="privilege-description">${t.description}</div>
            </div>
          </div>
        `)}
      </div>

      ${i.aclInProgress?V`
        <div class="wizard-progress-note">
          Provisioning ACL on ${i.targetNode.name}... This may take a few seconds.
        </div>
      `:F}

      ${i.aclResult?V`
        <div class="wizard-result ${i.aclResult.success?"success":"error"}">
          <span class="wizard-result-icon">${i.aclResult.success?"✓":"✗"}</span>
          <span class="wizard-result-message">${i.aclResult.message}</span>
        </div>
      `:F}
    `}_renderVerifyStepContent(){if(!this._bindingWizard)return F;const e=this._bindingWizard;return V`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 3: Verify Binding</div>
        <div class="wizard-step-description">
          Read the binding back from the device to confirm it was saved correctly
        </div>
      </div>

      ${e.verifyInProgress?V`
        <div class="wizard-progress-note">
          Reading bindings from ${e.sourceNode.name}... This may take a few seconds.
        </div>
      `:F}

      ${e.verifyResult?V`
        <div class="wizard-result ${e.verifyResult.verified||e.verifyResult.success?"success":"error"}">
          <span class="wizard-result-icon">${e.verifyResult.verified?"✓":e.verifyResult.success?"⚠":"✗"}</span>
          <span class="wizard-result-message">${e.verifyResult.message}</span>
        </div>

        ${e.verifyResult.verified?V`
          <div style="text-align: center; margin-top: 16px; color: var(--success-color);">
            Binding created and verified successfully!
          </div>
        `:F}
      `:V`
        <div style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          Click "Verify Binding" to confirm the binding was saved to the device.
        </div>
      `}
    `}_renderBulkRepairModal(){if(!this._showBulkRepairModal||!this._bulkRepairResult)return F;const e=this._bulkRepairResult,i=e.total-e.succeeded;return V`
      <div class="dialog-overlay" @click=${this._closeBulkRepairModal}>
        <div class="dialog" style="max-width: 500px;" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">ACL Repair Results</div>

          <div class="bulk-repair-summary">
            <div class="bulk-repair-stat">
              <div class="bulk-repair-stat-value">${e.total}</div>
              <div class="bulk-repair-stat-label">Total</div>
            </div>
            <div class="bulk-repair-stat success">
              <div class="bulk-repair-stat-value">${e.succeeded}</div>
              <div class="bulk-repair-stat-label">Succeeded</div>
            </div>
            ${i>0?V`
              <div class="bulk-repair-stat failed">
                <div class="bulk-repair-stat-value">${i}</div>
                <div class="bulk-repair-stat-label">Failed</div>
              </div>
            `:F}
          </div>

          ${e.results.length>0?V`
            <div class="bulk-repair-results">
              ${e.results.map(e=>{const i=this._nodes.find(i=>i.node_id===e.target_node_id);return V`
                  <div class="bulk-repair-item">
                    <span class="bulk-repair-item-icon ${e.success?"success":"failed"}">
                      ${e.success?"✓":"✗"}
                    </span>
                    <span>
                      ${i?.name||`Node ${e.target_node_id}`}
                      (EP ${e.target_endpoint_id}, Cluster ${qe(e.cluster_id)})
                      ${e.success?F:V`<br><small style="color: var(--error-color);">${e.message}</small>`}
                    </span>
                  </div>
                `})}
            </div>
          `:V`
            <div style="text-align: center; padding: 16px; color: var(--secondary-text-color);">
              No bindings found to repair.
            </div>
          `}

          <div class="dialog-actions">
            <button type="button" class="btn btn-primary" @click=${this._closeBulkRepairModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    `}};mi.styles=s`
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

    /* ACL warning styles */
    .binding-missing-acl {
      border-left: 3px solid var(--warning-color, #ff9800);
      background: rgba(255, 152, 0, 0.05);
    }

    .acl-warning {
      cursor: help;
      font-size: 14px;
      margin-right: 4px;
    }

    .acl-warning-text {
      color: var(--warning-color, #ff9800);
      font-size: 11px;
    }

    .acl-warning-banner {
      background: rgba(255, 152, 0, 0.12);
      color: var(--warning-color, #ff9800);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 8px;
      width: 100%;
    }

    .binding-card.binding-missing-acl {
      flex-wrap: wrap;
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

    /* Verification Result Styles */
    .verification-result {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 13px;
    }

    .verification-result.verified {
      background: rgba(76, 175, 80, 0.15);
      border: 1px solid var(--success-color, #4caf50);
      color: var(--success-color, #4caf50);
    }

    .verification-result.warning {
      background: rgba(255, 152, 0, 0.15);
      border: 1px solid var(--warning-color, #ff9800);
      color: var(--warning-color, #ff9800);
    }

    .verification-result.error {
      background: rgba(244, 67, 54, 0.15);
      border: 1px solid var(--error-color, #f44336);
      color: var(--error-color, #f44336);
    }

    .verification-icon {
      font-size: 16px;
      font-weight: bold;
    }

    .verification-message {
      flex: 1;
    }

    .verification-dismiss {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 0 4px;
      opacity: 0.7;
      color: inherit;
    }

    .verification-dismiss:hover {
      opacity: 1;
    }

    /* Verification Modal Styles */
    .verification-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 16px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .verification-modal-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .verification-modal-result.verified {
      background: rgba(76, 175, 80, 0.15);
      border: 1px solid var(--success-color, #4caf50);
    }

    .verification-modal-result.warning {
      background: rgba(255, 152, 0, 0.15);
      border: 1px solid var(--warning-color, #ff9800);
    }

    .verification-modal-result.error {
      background: rgba(244, 67, 54, 0.15);
      border: 1px solid var(--error-color, #f44336);
    }

    .verification-status-icon {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .verification-modal-result.verified .verification-status-icon {
      color: var(--success-color, #4caf50);
    }

    .verification-modal-result.warning .verification-status-icon {
      color: var(--warning-color, #ff9800);
    }

    .verification-modal-result.error .verification-status-icon {
      color: var(--error-color, #f44336);
    }

    .verification-status-text {
      font-size: 18px;
      font-weight: 500;
    }

    .verification-details {
      padding: 16px;
    }

    .verification-message {
      font-size: 14px;
      margin: 0 0 16px 0;
      color: var(--primary-text-color);
    }

    .verification-binding-info {
      background: var(--secondary-background-color);
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .verification-help {
      background: rgba(255, 152, 0, 0.1);
      border-left: 3px solid var(--warning-color, #ff9800);
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 13px;
    }

    .verification-help ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .verification-help li {
      margin-bottom: 4px;
    }

    /* Binding Actions Container */
    .binding-actions {
      display: flex;
      gap: 4px;
    }

    .btn-icon.verify {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success-color, #4caf50);
      border: 1px solid var(--success-color, #4caf50);
    }

    .btn-icon.verify:hover:not(:disabled) {
      background: var(--success-color, #4caf50);
      color: white;
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

    .btn-verify {
      background: rgba(76, 175, 80, 0.15);
      color: var(--success-color, #4caf50);
      border: 1px solid var(--success-color, #4caf50);
      font-weight: 500;
    }

    .btn-verify:hover:not(:disabled) {
      background: var(--success-color, #4caf50);
      color: white;
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

    /* ACL Section Styles */
    .acl-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .acl-entry {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
    }

    .acl-entry.acl-admin {
      border-left: 3px solid var(--error-color, #f44336);
    }

    .acl-entry.acl-operate {
      border-left: 3px solid var(--success-color, #4caf50);
    }

    .acl-entry-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .acl-index {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .acl-privilege {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--divider-color);
    }

    .acl-privilege.administer {
      background: rgba(244, 67, 54, 0.15);
      color: var(--error-color, #f44336);
    }

    .acl-privilege.operate {
      background: rgba(76, 175, 80, 0.15);
      color: var(--success-color, #4caf50);
    }

    .acl-privilege.manage {
      background: rgba(255, 152, 0, 0.15);
      color: var(--warning-color, #ff9800);
    }

    .acl-privilege.view {
      background: rgba(33, 150, 243, 0.15);
      color: var(--info-color, #2196f3);
    }

    .acl-auth-mode {
      font-size: 11px;
      color: var(--secondary-text-color);
    }

    .acl-entry-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .acl-row {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }

    .acl-label {
      color: var(--secondary-text-color);
      min-width: 60px;
    }

    .acl-value {
      color: var(--primary-text-color);
      word-break: break-word;
    }

    /* Binding Wizard Styles */
    .wizard-steps {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
      gap: 0;
    }

    .wizard-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .wizard-step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
      transition: all 0.3s ease;
    }

    .wizard-step.active .wizard-step-circle {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .wizard-step.completed .wizard-step-circle {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .wizard-step-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 6px;
      text-align: center;
      max-width: 80px;
    }

    .wizard-step.active .wizard-step-label {
      color: var(--primary-color);
      font-weight: 500;
    }

    .wizard-step.completed .wizard-step-label {
      color: var(--success-color, #4caf50);
    }

    .wizard-connector {
      flex: 0 0 60px;
      height: 2px;
      background: var(--divider-color);
      margin: 0 8px;
      margin-bottom: 22px;
    }

    .wizard-connector.completed {
      background: var(--success-color, #4caf50);
    }

    .wizard-content {
      min-height: 120px;
    }

    .wizard-step-info {
      text-align: center;
      padding: 16px;
    }

    .wizard-step-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .wizard-step-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }

    .wizard-progress-note {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-style: italic;
      margin-top: 8px;
    }

    .wizard-result {
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
    }

    .wizard-result.success {
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--success-color, #4caf50);
    }

    .wizard-result.error {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid var(--error-color, #f44336);
    }

    .wizard-result-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    .wizard-result-message {
      font-size: 13px;
    }

    .wizard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color);
    }

    /* Privilege Selector */
    .privilege-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
    }

    .privilege-option {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .privilege-option:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
    }

    .privilege-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
    }

    .privilege-radio {
      width: 18px;
      height: 18px;
      border: 2px solid var(--divider-color);
      border-radius: 50%;
      margin-right: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .privilege-option.selected .privilege-radio {
      border-color: var(--primary-color);
    }

    .privilege-option.selected .privilege-radio::after {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary-color);
    }

    .privilege-content {
      flex: 1;
    }

    .privilege-label {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .privilege-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .privilege-badge.recommended {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .privilege-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    /* Repair Buttons */
    .btn-repair {
      background: rgba(255, 152, 0, 0.15);
      color: var(--warning-color, #ff9800);
      border: 1px solid var(--warning-color, #ff9800);
    }

    .btn-repair:hover:not(:disabled) {
      background: rgba(255, 152, 0, 0.25);
    }

    .repair-icon {
      cursor: pointer;
      color: var(--warning-color, #ff9800);
      font-size: 14px;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .repair-icon:hover {
      background: rgba(255, 152, 0, 0.15);
    }

    .repair-icon.loading {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Bulk Repair Modal */
    .bulk-repair-results {
      max-height: 300px;
      overflow-y: auto;
    }

    .bulk-repair-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .bulk-repair-stat {
      text-align: center;
    }

    .bulk-repair-stat-value {
      font-size: 24px;
      font-weight: 600;
    }

    .bulk-repair-stat-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .bulk-repair-stat.success .bulk-repair-stat-value {
      color: var(--success-color, #4caf50);
    }

    .bulk-repair-stat.failed .bulk-repair-stat-value {
      color: var(--error-color, #f44336);
    }

    .bulk-repair-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    .bulk-repair-item:last-child {
      border-bottom: none;
    }

    .bulk-repair-item-icon {
      font-size: 16px;
    }

    .bulk-repair-item-icon.success {
      color: var(--success-color, #4caf50);
    }

    .bulk-repair-item-icon.failed {
      color: var(--error-color, #f44336);
    }
  `,e([pe({attribute:!1})],mi.prototype,"hass",void 0),e([pe({type:Boolean})],mi.prototype,"narrow",void 0),e([ge()],mi.prototype,"_nodes",void 0),e([ge()],mi.prototype,"_selectedSourceNode",void 0),e([ge()],mi.prototype,"_selectedSourceEndpoint",void 0),e([ge()],mi.prototype,"_bindings",void 0),e([ge()],mi.prototype,"_groups",void 0),e([ge()],mi.prototype,"_loading",void 0),e([ge()],mi.prototype,"_error",void 0),e([ge()],mi.prototype,"_activeTab",void 0),e([ge()],mi.prototype,"_showCreateDialog",void 0),e([ge()],mi.prototype,"_allBindings",void 0),e([ge()],mi.prototype,"_recommendations",void 0),e([ge()],mi.prototype,"_overviewLoading",void 0),e([ge()],mi.prototype,"_surveySubmitting",void 0),e([ge()],mi.prototype,"_surveyResult",void 0),e([ge()],mi.prototype,"_selectedTargetNodeId",void 0),e([ge()],mi.prototype,"_selectedTargetEndpointId",void 0),e([ge()],mi.prototype,"_filterSameAreaOnly",void 0),e([ge()],mi.prototype,"_actionInProgress",void 0),e([ge()],mi.prototype,"_pendingBindingRecommendation",void 0),e([ge()],mi.prototype,"_selectedClusterForBinding",void 0),e([ge()],mi.prototype,"_pendingManualBinding",void 0),e([ge()],mi.prototype,"_pendingDeleteBinding",void 0),e([ge()],mi.prototype,"_automationRecommendations",void 0),e([ge()],mi.prototype,"_eveSchedules",void 0),e([ge()],mi.prototype,"_eveScheduleLoading",void 0),e([ge()],mi.prototype,"_verificationInProgress",void 0),e([ge()],mi.prototype,"_lastVerificationResult",void 0),e([ge()],mi.prototype,"_showVerificationModal",void 0),e([ge()],mi.prototype,"_verificationModalResult",void 0),e([ge()],mi.prototype,"_aclLoading",void 0),e([ge()],mi.prototype,"_aclEntries",void 0),e([ge()],mi.prototype,"_targetACLCache",void 0),e([ge()],mi.prototype,"_aclLoadingNodes",void 0),e([ge()],mi.prototype,"_bindingWizard",void 0),e([ge()],mi.prototype,"_aclRepairInProgress",void 0),e([ge()],mi.prototype,"_bulkRepairInProgress",void 0),e([ge()],mi.prototype,"_bulkRepairResult",void 0),e([ge()],mi.prototype,"_showBulkRepairModal",void 0),mi=e([de("matter-binding-helper-panel")],mi);export{mi as MatterBindingPanel};
