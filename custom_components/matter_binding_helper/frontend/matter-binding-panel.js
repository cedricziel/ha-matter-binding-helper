function t(t,e,i,o){var s,n=arguments.length,r=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),s=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:a,defineProperty:d,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:p,getPrototypeOf:h}=Object,u=globalThis,g=u.trustedTypes,_=g?g.emptyScript:"",v=u.reactiveElementPolyfillSupport,m=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},f=(t,e)=>!a(t,e),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:f};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:s}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const n=o?.call(this);s?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=h(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...c(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),s=e.litNonce;void 0!==s&&o.setAttribute("nonce",s),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=o;const n=s.fromAttribute(e,t.type);this[o]=n??this._$Ej?.get(o)??n,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const o=this.constructor,s=this[t];if(i??=o.getPropertyOptions(t),!((i.hasChanged??f)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:s},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==s||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[m("elementProperties")]=new Map,y[m("finalized")]=new Map,v?.({ReactiveElement:y}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,A=x.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,k=`<${C}>`,N=document,P=()=>N.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,U="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,M=/-->/g,H=/>/g,R=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,z=/"/g,j=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),I=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,q=N.createTreeWalker(N,129);function V(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const F=(t,e)=>{const i=t.length-1,o=[];let s,n=2===e?"<svg>":3===e?"<math>":"",r=D;for(let e=0;e<i;e++){const i=t[e];let a,d,l=-1,c=0;for(;c<i.length&&(r.lastIndex=c,d=r.exec(i),null!==d);)c=r.lastIndex,r===D?"!--"===d[1]?r=M:void 0!==d[1]?r=H:void 0!==d[2]?(j.test(d[2])&&(s=RegExp("</"+d[2],"g")),r=R):void 0!==d[3]&&(r=R):r===R?">"===d[0]?(r=s??D,l=-1):void 0===d[1]?l=-2:(l=r.lastIndex-d[2].length,a=d[1],r=void 0===d[3]?R:'"'===d[3]?z:B):r===z||r===B?r=R:r===M||r===H?r=D:(r=R,s=void 0);const p=r===R&&t[e+1].startsWith("/>")?" ":"";n+=r===D?i+k:l>=0?(o.push(a),i.slice(0,l)+w+i.slice(l)+E+p):i+E+(-2===l?e:p)}return[V(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]};class K{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,n=0;const r=t.length-1,a=this.parts,[d,l]=F(t,e);if(this.el=K.createElement(d,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=q.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(w)){const e=l[n++],i=o.getAttribute(t).split(E),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:r[2],strings:i,ctor:"."===r[1]?Y:"?"===r[1]?tt:"@"===r[1]?et:X}),o.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:s}),o.removeAttribute(t));if(j.test(o.tagName)){const t=o.textContent.split(E),e=t.length-1;if(e>0){o.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],P()),q.nextNode(),a.push({type:2,index:++s});o.append(t[e],P())}}}else if(8===o.nodeType)if(o.data===C)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=o.data.indexOf(E,t+1));)a.push({type:7,index:s}),t+=E.length-1}s++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){if(e===I)return e;let s=void 0!==o?i._$Co?.[o]:i._$Cl;const n=O(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(t),s._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=s:i._$Cl=s),void 0!==s&&(e=J(t,s._$AS(t,e.values),s,o)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??N).importNode(e,!0);q.currentNode=o;let s=q.nextNode(),n=0,r=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Q(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new it(s,this,t)),this._$AV.push(e),a=i[++r]}n!==a?.index&&(s=q.nextNode(),n++)}return q.currentNode=N,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),O(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==I&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Z(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new K(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const s of t)o===e.length?e.push(i=new Q(this.O(P()),this.O(P()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,o){const s=this.strings;let n=!1;if(void 0===s)t=J(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==I,n&&(this._$AH=t);else{const o=t;let r,a;for(t=s[0],r=0;r<s.length-1;r++)a=J(this,o[i+r],e,r),a===I&&(a=this._$AH[r]),n||=!O(a)||a!==this._$AH[r],a===W?t=W:t!==W&&(t+=(a??"")+s[r+1]),this._$AH[r]=a}n&&!o&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class et extends X{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??W)===I)return;const i=this._$AH,o=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==W&&(i===W||o);o&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const ot=x.litHtmlPolyfillSupport;ot?.(K,Q),(x.litHtmlVersions??=[]).push("3.3.1");const st=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let s=o._$litPart$;if(void 0===s){const t=i?.renderBefore??null;o._$litPart$=s=new Q(e.insertBefore(P(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}}nt._$litElement$=!0,nt.finalized=!0,st.litElementHydrateSupport?.({LitElement:nt});const rt=st.litElementPolyfillSupport;rt?.({LitElement:nt}),(st.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:f},dt=(t=at,e,i)=>{const{kind:o,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,s,t)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const s=this[o];e.call(this,i),this.requestUpdate(o,s,t)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function lt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ct(t){return lt({...t,state:!0,attribute:!1})}const pt=3,ht=4,ut=5,gt=6,_t=8,vt=29,mt=30,bt=31,ft=40,$t=47,yt=768,xt=513,At=516,St={[pt]:"Identify",[ht]:"Groups",[ut]:"Scenes",[gt]:"On/Off",[_t]:"Level Control",[vt]:"Descriptor",[mt]:"Binding",[bt]:"Access Control",[ft]:"Basic Information",42:"OTA Update",[$t]:"Power Source",48:"General Commissioning",49:"Network Commissioning",50:"Diagnostic Logs",51:"General Diagnostics",52:"Software Diagnostics",53:"Thread Diagnostics",56:"Ethernet Diagnostics",60:"Admin Commissioning",62:"Operational Credentials",63:"Group Key Management",70:"Time Sync",[yt]:"Color Control",[xt]:"Thermostat",[At]:"Thermostat UI",514:"Fan Control"},wt={17:"Power Source",18:"OTA Requestor",19:"OTA Provider",20:"Aggregator",22:"Root Node",256:"On/Off Light",257:"Dimmable Light",258:"Color Temperature Light",259:"On/Off Light Switch",260:"Dimmer Switch",261:"Color Dimmer Switch",262:"Light Sensor",263:"Occupancy Sensor",266:"On/Off Plug-in Unit",267:"Dimmable Plug-in Unit",268:"Color Temperature Light",269:"Extended Color Light",769:"Thermostat",770:"Temperature Sensor",771:"Humidity Sensor",772:"Air Quality Sensor",10:"Door Lock",11:"Door Lock Controller",514:"Window Covering",515:"Window Covering Controller",21:"Contact Sensor",38:"Flow Sensor",44:"Smoke/CO Alarm",35:"Casting Video Player",36:"Content App",40:"Basic Video Player",41:"Casting Video Client",43:"Speaker"};const Et="matter_binding_helper";let Ct=class extends nt{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="bindings",this._showCreateDialog=!1}firstUpdated(){this._loadNodes()}async _loadNodes(){this._loading=!0,this._error=null;try{const t=await async function(t){return t.callWS({type:`${Et}/list_nodes`})}(this.hass);this._nodes=t.nodes}catch(t){this._error=`Failed to load nodes: ${t}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const t=await async function(t,e,i){return t.callWS({type:`${Et}/list_bindings`,node_id:e,endpoint_id:i})}(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=t.bindings}catch(t){this._error=`Failed to load bindings: ${t}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const t=await async function(t){return t.callWS({type:`${Et}/list_groups`})}(this.hass);this._groups=t.groups}catch(t){this._error=`Failed to load groups: ${t}`}finally{this._loading=!1}}_selectNode(t){this._selectedSourceNode?.node_id===t.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=t,this._selectedSourceEndpoint=null,this._bindings=[])}_selectEndpoint(t){t.has_binding_cluster&&(this._selectedSourceEndpoint=t,this._loadBindings())}async _deleteBinding(t){if(confirm("Are you sure you want to delete this binding?"))try{await async function(t,e,i,o,s,n){return t.callWS({type:`${Et}/delete_binding`,source_node_id:e,source_endpoint_id:i,...void 0!==o&&{target_node_id:o},...void 0!==s&&{target_endpoint_id:s},...void 0!==n&&{target_group_id:n}})}(this.hass,t.node_id,t.endpoint_id,t.target_node_id??void 0,t.target_endpoint_id??void 0,t.target_group_id??void 0),await this._loadBindings()}catch(t){this._error=`Failed to delete binding: ${t}`}}_openCreateDialog(){this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1}async _handleCreateBinding(t){t.preventDefault();const e=t.target,i=new FormData(e),o=parseInt(i.get("targetNode"),10),s=parseInt(i.get("targetEndpoint"),10),n=parseInt(i.get("cluster"),10);if(this._selectedSourceNode&&this._selectedSourceEndpoint)try{await async function(t,e,i,o,s,n,r){return t.callWS({type:`${Et}/create_binding`,source_node_id:e,source_endpoint_id:i,cluster_id:o,...void 0!==s&&{target_node_id:s},...void 0!==n&&{target_endpoint_id:n},...void 0!==r})}(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id,n,o,s),this._closeCreateDialog(),await this._loadBindings()}catch(t){this._error=`Failed to create binding: ${t}`}}_getNodeName(t){const e=this._nodes.find(e=>e.node_id===t);return e?.name||`Node ${t}`}_getClusterName(t){return St[t]||`Cluster 0x${t.toString(16)}`}render(){return L`
      <div class="${this.narrow?"narrow":""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <button
            class="btn btn-primary"
            @click=${this._loadNodes}
            ?disabled=${this._loading}
          >
            Refresh
          </button>
        </div>

        ${this._error?L`<div class="error">${this._error}</div>`:W}

        <div class="tabs">
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

        ${"bindings"===this._activeTab?this._renderBindingsTab():this._renderGroupsTab()}
        ${this._showCreateDialog?this._renderCreateDialog():W}
      </div>
    `}_renderBindingsTab(){return L`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Nodes</div>
          ${this._loading&&0===this._nodes.length?L`<div class="loading">Loading...</div>`:L`
                <ul class="node-list">
                  ${this._nodes.map(t=>this._renderNodeItem(t))}
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
                    ${this._bindings.map(t=>this._renderBindingCard(t))}
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
    `}_renderNodeItem(t){const e=this._selectedSourceNode?.node_id===t.node_id,i=t.endpoints.filter(t=>t.has_binding_cluster),o=t.endpoints.length,s=t.device_info;return L`
      <li>
        <div
          class="node-item ${e?"selected":""}"
          @click=${()=>this._selectNode(t)}
        >
          <span
            class="node-status ${t.available?"":"unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">${t.name}</span>
            <div class="node-meta">
              ${t.area_name?L`<span class="node-area">${t.area_name}</span>`:s?.vendor_name?L`<span class="node-vendor">${s.vendor_name}</span>`:W}
              <span class="node-endpoints ${i.length>0?"has-binding":""}">
                ${o>0?i.length>0?`${i.length}/${o} bindable`:`${o} ep`:"no endpoints"}
              </span>
            </div>
          </div>
        </div>
        ${e?L`
              <div class="node-details">
                ${s?.software_version?L`<span class="node-version">v${s.software_version}</span>`:W}
                ${o>0?L`
                      <div class="endpoint-list">
                        ${t.endpoints.map(t=>this._renderEndpointItem(t))}
                      </div>
                    `:L`<div class="no-endpoints">No endpoints found</div>`}
              </div>
            `:W}
      </li>
    `}_renderEndpointItem(t){const e=this._selectedSourceEndpoint?.endpoint_id===t.endpoint_id,i=t.device_types.map(t=>{return e=t.id,wt[e]||`Type ${e}`;var e}).filter(e=>0!==t.endpoint_id||!e.includes("Root")),o=[29,31,40,42,48,49,50,51,52,53,56,60,62,63,70],s=t.clusters.filter(t=>!o.includes(t)).map(t=>{return St[e=t]||`0x${e.toString(16).padStart(4,"0")}`;var e});return L`
      <div
        class="endpoint-item ${e?"selected":""} ${t.has_binding_cluster?"":"no-binding"}"
        @click=${()=>this._selectEndpoint(t)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${t.endpoint_id}</span>
          ${t.has_binding_cluster?L`<span class="endpoint-badge binding">Binding</span>`:W}
        </div>
        ${i.length>0?L`<div class="endpoint-device-types">${i.join(", ")}</div>`:W}
        ${s.length>0?L`<div class="endpoint-clusters">${s.join(" · ")}</div>`:W}
      </div>
    `}_renderBindingCard(t){return L`
      <div class="binding-card">
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${null!==t.target_group_id?`Group ${t.target_group_id}`:`${this._getNodeName(t.target_node_id)} - Endpoint ${t.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">
              ${this._getClusterName(t.cluster_id)}
            </span>
          </div>
        </div>
        <button class="delete-btn" @click=${()=>this._deleteBinding(t)}>
          Delete
        </button>
      </div>
    `}_renderGroupsTab(){return L`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading?L`<div class="loading">Loading...</div>`:this._groups.length>0?L`
                <div class="binding-list">
                  ${this._groups.map(t=>L`
                      <div class="binding-card">
                        <div>
                          <strong>${t.name}</strong>
                          <div style="font-size: 12px; color: var(--secondary-text-color);">
                            Group ID: ${t.group_id} |
                            ${t.members.length} member(s)
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
    `}_renderCreateDialog(){return L`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${t=>t.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>
          <form @submit=${this._handleCreateBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select name="targetNode" class="form-select" required>
                ${this._nodes.filter(t=>t.node_id!==this._selectedSourceNode?.node_id).map(t=>L`
                      <option value=${t.node_id}>${t.name}</option>
                    `)}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Endpoint</label>
              <select name="targetEndpoint" class="form-select" required>
                <option value="1">Endpoint 1</option>
                <option value="2">Endpoint 2</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              <select name="cluster" class="form-select" required>
                <option value=${6}>On/Off</option>
                ${Object.entries(St).map(([t,e])=>L`
                    <option value=${t}>${e}</option>
                  `)}
              </select>
            </div>

            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click=${this._closeCreateDialog}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Binding
              </button>
            </div>
          </form>
        </div>
      </div>
    `}};Ct.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new n(i,t,o)})`
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
      background: var(--secondary-background-color);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
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
  `,t([lt({attribute:!1})],Ct.prototype,"hass",void 0),t([lt({type:Boolean})],Ct.prototype,"narrow",void 0),t([ct()],Ct.prototype,"_nodes",void 0),t([ct()],Ct.prototype,"_selectedSourceNode",void 0),t([ct()],Ct.prototype,"_selectedSourceEndpoint",void 0),t([ct()],Ct.prototype,"_bindings",void 0),t([ct()],Ct.prototype,"_groups",void 0),t([ct()],Ct.prototype,"_loading",void 0),t([ct()],Ct.prototype,"_error",void 0),t([ct()],Ct.prototype,"_activeTab",void 0),t([ct()],Ct.prototype,"_showCreateDialog",void 0),Ct=t([(t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("matter-binding-helper-panel")],Ct);export{Ct as MatterBindingPanel};
