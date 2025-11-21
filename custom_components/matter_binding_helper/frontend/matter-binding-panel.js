function t(t,e,i,s){var o,n=arguments.length,r=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(n<3?o(r):n>3?o(e,i,r):o(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:d,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:h,getPrototypeOf:p}=Object,u=globalThis,g=u.trustedTypes,_=g?g.emptyScript:"",b=u.reactiveElementPolyfillSupport,$=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},m=(t,e)=>!a(t,e),f={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=f){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&d(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);o?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??f}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const t=this.properties,e=[...c(t),...h(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const n=o.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const s=this.constructor,o=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??m)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[$("elementProperties")]=new Map,y[$("finalized")]=new Map,b?.({ReactiveElement:y}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,A=x.trustedTypes,E=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+w,N=`<${C}>`,k=document,P=()=>k.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,U="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,H=/>/g,R=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,z=/"/g,j=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,G=k.createTreeWalker(k,129);function F(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=M;for(let e=0;e<i;e++){const i=t[e];let a,d,l=-1,c=0;for(;c<i.length&&(r.lastIndex=c,d=r.exec(i),null!==d);)c=r.lastIndex,r===M?"!--"===d[1]?r=D:void 0!==d[1]?r=H:void 0!==d[2]?(j.test(d[2])&&(o=RegExp("</"+d[2],"g")),r=R):void 0!==d[3]&&(r=R):r===R?">"===d[0]?(r=o??M,l=-1):void 0===d[1]?l=-2:(l=r.lastIndex-d[2].length,a=d[1],r=void 0===d[3]?R:'"'===d[3]?z:B):r===z||r===B?r=R:r===D||r===H?r=M:(r=R,o=void 0);const h=r===R&&t[e+1].startsWith("/>")?" ":"";n+=r===M?i+N:l>=0?(s.push(a),i.slice(0,l)+S+i.slice(l)+w+h):i+w+(-2===l?e:h)}return[F(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[d,l]=V(t,e);if(this.el=J.createElement(d,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=G.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=l[n++],i=s.getAttribute(t).split(w),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:r[2],strings:i,ctor:"."===r[1]?Y:"?"===r[1]?tt:"@"===r[1]?et:X}),s.removeAttribute(t)}else t.startsWith(w)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(w),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],P()),G.nextNode(),a.push({type:2,index:++o});s.append(t[e],P())}}}else if(8===s.nodeType)if(s.data===C)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(w,t+1));)a.push({type:7,index:o}),t+=w.length-1}o++}}static createElement(t,e){const i=k.createElement("template");return i.innerHTML=t,i}}function K(t,e,i=t,s){if(e===L)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const n=O(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=K(t,o._$AS(t,e.values),o,s)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??k).importNode(e,!0);G.currentNode=s;let o=G.nextNode(),n=0,r=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Q(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new it(o,this,t)),this._$AV.push(e),a=i[++r]}n!==a?.index&&(o=G.nextNode(),n++)}return G.currentNode=k,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),O(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(F(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Z(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new J(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Q(this.O(P()),this.O(P()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=K(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==L,n&&(this._$AH=t);else{const s=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=K(this,s[i+r],e,r),a===L&&(a=this._$AH[r]),n||=!O(a)||a!==this._$AH[r],a===W?t=W:t!==W&&(t+=(a??"")+o[r+1]),this._$AH[r]=a}n&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class et extends X{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??W)===L)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const st=x.litHtmlPolyfillSupport;st?.(J,Q),(x.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new Q(e.insertBefore(P(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const rt=ot.litElementPolyfillSupport;rt?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:m},dt=(t=at,e,i)=>{const{kind:s,metadata:o}=i;let n=globalThis.litPropertyMetadata.get(o);if(void 0===n&&globalThis.litPropertyMetadata.set(o,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t)}}throw Error("Unsupported decorator location: "+s)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function lt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ct(t){return lt({...t,state:!0,attribute:!1})}const ht=6,pt=8,ut=768,gt=5,_t={[ht]:"On/Off",[pt]:"Level Control",[ut]:"Color Control",[gt]:"Scenes"},bt="matter_binding_helper";let $t=class extends nt{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="bindings",this._showCreateDialog=!1}firstUpdated(){this._loadNodes()}async _loadNodes(){this._loading=!0,this._error=null;try{const t=await async function(t){return t.callWS({type:`${bt}/list_nodes`})}(this.hass);this._nodes=t.nodes}catch(t){this._error=`Failed to load nodes: ${t}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const t=await async function(t,e,i){return t.callWS({type:`${bt}/list_bindings`,node_id:e,endpoint_id:i})}(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=t.bindings}catch(t){this._error=`Failed to load bindings: ${t}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const t=await async function(t){return t.callWS({type:`${bt}/list_groups`})}(this.hass);this._groups=t.groups}catch(t){this._error=`Failed to load groups: ${t}`}finally{this._loading=!1}}_selectNode(t){this._selectedSourceNode?.node_id===t.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=t,this._selectedSourceEndpoint=null,this._bindings=[])}_selectEndpoint(t){t.has_binding_cluster&&(this._selectedSourceEndpoint=t,this._loadBindings())}async _deleteBinding(t){if(confirm("Are you sure you want to delete this binding?"))try{await async function(t,e,i,s,o,n){return t.callWS({type:`${bt}/delete_binding`,source_node_id:e,source_endpoint_id:i,...void 0!==s&&{target_node_id:s},...void 0!==o&&{target_endpoint_id:o},...void 0!==n&&{target_group_id:n}})}(this.hass,t.node_id,t.endpoint_id,t.target_node_id??void 0,t.target_endpoint_id??void 0,t.target_group_id??void 0),await this._loadBindings()}catch(t){this._error=`Failed to delete binding: ${t}`}}_openCreateDialog(){this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1}async _handleCreateBinding(t){t.preventDefault();const e=t.target,i=new FormData(e),s=parseInt(i.get("targetNode"),10),o=parseInt(i.get("targetEndpoint"),10),n=parseInt(i.get("cluster"),10);if(this._selectedSourceNode&&this._selectedSourceEndpoint)try{await async function(t,e,i,s,o,n,r){return t.callWS({type:`${bt}/create_binding`,source_node_id:e,source_endpoint_id:i,cluster_id:s,...void 0!==o&&{target_node_id:o},...void 0!==n&&{target_endpoint_id:n},...void 0!==r})}(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id,n,s,o),this._closeCreateDialog(),await this._loadBindings()}catch(t){this._error=`Failed to create binding: ${t}`}}_getNodeName(t){const e=this._nodes.find(e=>e.node_id===t);return e?.name||`Node ${t}`}_getClusterName(t){return _t[t]||`Cluster 0x${t.toString(16)}`}render(){return I`
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

        ${this._error?I`<div class="error">${this._error}</div>`:W}

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
    `}_renderBindingsTab(){return I`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Nodes</div>
          ${this._loading&&0===this._nodes.length?I`<div class="loading">Loading...</div>`:I`
                <ul class="node-list">
                  ${this._nodes.map(t=>this._renderNodeItem(t))}
                </ul>
              `}
        </div>

        <div class="card bindings-panel">
          <div class="card-header">
            ${this._selectedSourceEndpoint?I`
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

          ${this._selectedSourceEndpoint?this._bindings.length>0?I`
                  <div class="binding-list">
                    ${this._bindings.map(t=>this._renderBindingCard(t))}
                  </div>
                `:I`
                  <div class="empty-state">
                    No bindings configured for this endpoint.
                  </div>
                `:I`
                <div class="empty-state">
                  Select a node with binding support to manage its bindings.
                </div>
              `}
        </div>
      </div>
    `}_renderNodeItem(t){const e=this._selectedSourceNode?.node_id===t.node_id,i=t.endpoints.filter(t=>t.has_binding_cluster);return I`
      <li>
        <div
          class="node-item ${e?"selected":""}"
          @click=${()=>this._selectNode(t)}
        >
          <span
            class="node-status ${t.available?"":"unavailable"}"
          ></span>
          <span>${t.name}</span>
          ${i.length>0?I`<small>(${i.length} bindable)</small>`:W}
        </div>
        ${e&&i.length>0?I`
              <div class="endpoint-list">
                ${t.endpoints.map(t=>this._renderEndpointItem(t))}
              </div>
            `:W}
      </li>
    `}_renderEndpointItem(t){const e=this._selectedSourceEndpoint?.endpoint_id===t.endpoint_id;return I`
      <div
        class="endpoint-item ${e?"selected":""} ${t.has_binding_cluster?"":"no-binding"}"
        @click=${()=>this._selectEndpoint(t)}
      >
        Endpoint ${t.endpoint_id}
        ${t.has_binding_cluster?"":"(no binding support)"}
      </div>
    `}_renderBindingCard(t){return I`
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
    `}_renderGroupsTab(){return I`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading?I`<div class="loading">Loading...</div>`:this._groups.length>0?I`
                <div class="binding-list">
                  ${this._groups.map(t=>I`
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
              `:I`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `}_renderCreateDialog(){return I`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${t=>t.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>
          <form @submit=${this._handleCreateBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select name="targetNode" class="form-select" required>
                ${this._nodes.filter(t=>t.node_id!==this._selectedSourceNode?.node_id).map(t=>I`
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
                ${Object.entries(_t).map(([t,e])=>I`
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
    `}};$t.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)})`
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
      grid-template-columns: 300px 1fr;
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
      padding: 8px 12px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      border-radius: 4px;
    }

    .endpoint-item:hover {
      background: var(--secondary-background-color);
    }

    .endpoint-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .endpoint-item.no-binding {
      opacity: 0.5;
      cursor: not-allowed;
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
  `,t([lt({attribute:!1})],$t.prototype,"hass",void 0),t([lt({type:Boolean})],$t.prototype,"narrow",void 0),t([ct()],$t.prototype,"_nodes",void 0),t([ct()],$t.prototype,"_selectedSourceNode",void 0),t([ct()],$t.prototype,"_selectedSourceEndpoint",void 0),t([ct()],$t.prototype,"_bindings",void 0),t([ct()],$t.prototype,"_groups",void 0),t([ct()],$t.prototype,"_loading",void 0),t([ct()],$t.prototype,"_error",void 0),t([ct()],$t.prototype,"_activeTab",void 0),t([ct()],$t.prototype,"_showCreateDialog",void 0),$t=t([(t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("matter-binding-helper-panel")],$t);export{$t as MatterBindingPanel};
