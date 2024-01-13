!function(){"use strict";
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const t={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let e=0;e<t.length;e+=3){const i=t[e],s=e+1<t.length,o=s?t[e+1]:0,a=e+2<t.length,c=a?t[e+2]:0,l=i>>2,u=(3&i)<<4|o>>4;let h=(15&o)<<2|c>>6,d=63&c;a||(d=64,s||(h=64)),r.push(n[l],n[u],n[h],n[d])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=63&i|128):55296==(64512&i)&&r+1<t.length&&56320==(64512&t.charCodeAt(r+1))?(i=65536+((1023&i)<<10)+(1023&t.charCodeAt(++r)),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=63&i|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=63&i|128)}return e}(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((31&i)<<6|63&s)}else if(i>239&&i<365){const s=((7&i)<<18|(63&t[n++])<<12|(63&t[n++])<<6|63&t[n++])-65536;e[r++]=String.fromCharCode(55296+(s>>10)),e[r++]=String.fromCharCode(56320+(1023&s))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((15&i)<<12|(63&s)<<6|63&o)}}return e.join("")}(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let e=0;e<t.length;){const i=n[t.charAt(e++)],s=e<t.length?n[t.charAt(e)]:0;++e;const o=e<t.length?n[t.charAt(e)]:64;++e;const a=e<t.length?n[t.charAt(e)]:64;if(++e,null==i||null==s||null==o||null==a)throw Error();const c=i<<2|s>>4;if(r.push(c),64!==o){const t=s<<4&240|o>>2;if(r.push(t),64!==a){const t=o<<6&192|a;r.push(t)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},e=function(e){try{return t.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class n{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),"function"==typeof t&&(this.promise.catch((()=>{})),1===t.length?t(e):t(e,n))}}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function r(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function i(){return"undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(r())}function s(){const t="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof t&&void 0!==t.id}function o(){return"object"==typeof navigator&&"ReactNative"===navigator.product}function a(){const t=r();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}class c extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,c.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,l.prototype.create)}}class l{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},r=`${this.service}/${t}`,i=this.errors[t],s=i?function(t,e){return t.replace(u,((t,n)=>{const r=e[n];return null!=r?String(r):`<${n}?>`}))}(i,n):"Error",o=`${this.serviceName}: ${s} (${r}).`;return new c(r,o,n)}}const u=/\{\$([^}]+)}/g;function h(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const n=t[i],s=e[i];if(d(n)&&d(s)){if(!h(n,s))return!1}else if(n!==s)return!1}for(const t of r)if(!n.includes(t))return!1;return!0}function d(t){return null!==t&&"object"==typeof t}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function f(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach((t=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(t))})):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}class p{constructor(t,e){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then((()=>{t(this)})).catch((t=>{this.error(t)}))}next(t){this.forEachObserver((e=>{e.next(t)}))}error(t){this.forEachObserver((e=>{e.error(t)})),this.close(t)}complete(){this.forEachObserver((t=>{t.complete()})),this.close()}subscribe(t,e,n){let r;if(void 0===t&&void 0===e&&void 0===n)throw new Error("Missing Observer.");r=function(t,e){if("object"!=typeof t||null===t)return!1;for(const n of e)if(n in t&&"function"==typeof t[n])return!0;return!1}(t,["next","error","complete"])?t:{next:t,error:e,complete:n},void 0===r.next&&(r.next=g),void 0===r.error&&(r.error=g),void 0===r.complete&&(r.complete=g);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then((()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch(t){}})),this.observers.push(r),i}unsubscribeOne(t){void 0!==this.observers&&void 0!==this.observers[t]&&(delete this.observers[t],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let e=0;e<this.observers.length;e++)this.sendOne(e,t)}sendOne(t,e){this.task.then((()=>{if(void 0!==this.observers&&void 0!==this.observers[t])try{e(this.observers[t])}catch(t){"undefined"!=typeof console&&console.error&&console.error(t)}}))}close(t){this.finalized||(this.finalized=!0,void 0!==t&&(this.finalError=t),this.task.then((()=>{this.observers=void 0,this.onNoObservers=void 0})))}}function g(){}
/**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function m(t){return t&&t._delegate?t._delegate:t}class y{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const v="[DEFAULT]";
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class w{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const t=new n;if(this.instancesDeferred.set(e,t),this.isInitialized(e)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:e});n&&t.resolve(n)}catch(t){}}return this.instancesDeferred.get(e).promise}getImmediate(t){var e;const n=this.normalizeInstanceIdentifier(null==t?void 0:t.identifier),r=null!==(e=null==t?void 0:t.optional)&&void 0!==e&&e;if(!this.isInitialized(n)&&!this.shouldAutoInitialize()){if(r)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:n})}catch(t){if(r)return null;throw t}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,this.shouldAutoInitialize()){if(function(t){return"EAGER"===t.instantiationMode}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t))try{this.getOrInitializeService({instanceIdentifier:v})}catch(t){}for(const[t,e]of this.instancesDeferred.entries()){const n=this.normalizeInstanceIdentifier(t);try{const t=this.getOrInitializeService({instanceIdentifier:n});e.resolve(t)}catch(t){}}}}clearInstance(t=v){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter((t=>"INTERNAL"in t)).map((t=>t.INTERNAL.delete())),...t.filter((t=>"_delete"in t)).map((t=>t._delete()))])}isComponentSet(){return null!=this.component}isInitialized(t=v){return this.instances.has(t)}getOptions(t=v){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[t,e]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(t)&&e.resolve(r)}return r}onInit(t,e){var n;const r=this.normalizeInstanceIdentifier(e),i=null!==(n=this.onInitCallbacks.get(r))&&void 0!==n?n:new Set;i.add(t),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&t(s,r),()=>{i.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const r of n)try{r(t,e)}catch(t){}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=t,r===v?void 0:r),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch(t){}var r;return n||null}normalizeInstanceIdentifier(t=v){return this.component?this.component.multipleInstances?t:v:t}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class E{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new w(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */var _;!function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"}(_||(_={}));const b={debug:_.DEBUG,verbose:_.VERBOSE,info:_.INFO,warn:_.WARN,error:_.ERROR,silent:_.SILENT},T=_.INFO,I={[_.DEBUG]:"log",[_.VERBOSE]:"log",[_.INFO]:"info",[_.WARN]:"warn",[_.ERROR]:"error"},k=(t,e,...n)=>{if(e<t.logLevel)return;const r=(new Date).toISOString(),i=I[e];if(!i)throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);console[i](`[${r}]  ${t.name}:`,...n)};class S{constructor(t){this.name=t,this._logLevel=T,this._logHandler=k,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in _))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel="string"==typeof t?b[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if("function"!=typeof t)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,_.DEBUG,...t),this._logHandler(this,_.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,_.VERBOSE,...t),this._logHandler(this,_.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,_.INFO,...t),this._logHandler(this,_.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,_.WARN,...t),this._logHandler(this,_.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,_.ERROR,...t),this._logHandler(this,_.ERROR,...t)}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class C{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map((t=>{if(function(t){const e=t.getComponent();return"VERSION"===(null==e?void 0:e.type)}(t)){const e=t.getImmediate();return`${e.library}/${e.version}`}return null})).filter((t=>t)).join(" ")}}const A="@firebase/app",x="0.7.11",N=new S("@firebase/app"),L="[DEFAULT]",R={[A]:"fire-core","@firebase/app-compat":"fire-core-compat","@firebase/analytics":"fire-analytics","@firebase/analytics-compat":"fire-analytics-compat","@firebase/app-check":"fire-app-check","@firebase/app-check-compat":"fire-app-check-compat","@firebase/auth":"fire-auth","@firebase/auth-compat":"fire-auth-compat","@firebase/database":"fire-rtdb","@firebase/database-compat":"fire-rtdb-compat","@firebase/functions":"fire-fn","@firebase/functions-compat":"fire-fn-compat","@firebase/installations":"fire-iid","@firebase/installations-compat":"fire-iid-compat","@firebase/messaging":"fire-fcm","@firebase/messaging-compat":"fire-fcm-compat","@firebase/performance":"fire-perf","@firebase/performance-compat":"fire-perf-compat","@firebase/remote-config":"fire-rc","@firebase/remote-config-compat":"fire-rc-compat","@firebase/storage":"fire-gcs","@firebase/storage-compat":"fire-gcs-compat","@firebase/firestore":"fire-fst","@firebase/firestore-compat":"fire-fst-compat","fire-js":"fire-js",firebase:"fire-js-all"},D=new Map,M=new Map;function O(t,e){try{t.container.addComponent(e)}catch(n){N.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function P(t){const e=t.name;if(M.has(e))return N.debug(`There were multiple attempts to register component ${e}.`),!1;M.set(e,t);for(const e of D.values())O(e,t);return!0}function U(t,e){return t.container.getProvider(e)}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const F=new l("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()","bad-app-name":"Illegal App name: '{$appName}","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function."});
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class V{constructor(t,e,n){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},e),this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new y("app",(()=>this),"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw F.create("app-deleted",{appName:this._name})}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const $="9.6.1";function j(t=L){const e=D.get(t);if(!e)throw F.create("no-app",{appName:t});return e}function B(t,e,n){var r;let i=null!==(r=R[t])&&void 0!==r?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const t=[`Unable to register library "${i}" with version "${e}":`];return s&&t.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&t.push("and"),o&&t.push(`version name "${e}" contains illegal characters (whitespace or "/")`),void N.warn(t.join(" "))}P(new y(`${i}-version`,(()=>({library:i,version:e})),"VERSION"))}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */var q;q="",P(new y("platform-logger",(t=>new C(t)),"PRIVATE")),B(A,x,q),B(A,x,"esm2017"),B("fire-js","");
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
B("firebase","9.6.1","app");const z={apiKey:"AIzaSyAddUF68m2igTa-JmIblbZUjmx1CE3xwdQ",authDomain:"hanzigraph.com",projectId:"hanzigraph",storageBucket:"hanzigraph.appspot.com",messagingSenderId:"317168591112",appId:"1:317168591112:web:5b4580943b370526888cbd",databaseURL:"https://hanzigraph.firebaseio.com"};let H=function(){!function(t,e={}){"object"!=typeof e&&(e={name:e});const n=Object.assign({name:L,automaticDataCollectionEnabled:!1},e),r=n.name;if("string"!=typeof r||!r)throw F.create("bad-app-name",{appName:String(r)});const i=D.get(r);if(i){if(h(t,i.options)&&h(n,i.config))return i;throw F.create("duplicate-app",{appName:r})}const s=new E(r);for(const t of M.values())s.addComponent(t);const o=new V(t,n,s);D.set(r,o)}(z)};
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */function K(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]])}return n}function W(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const G=W,J=new l("auth","Firebase",{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}),X=new S("@firebase/auth");function Y(t,...e){X.logLevel<=_.ERROR&&X.error(`Auth (${$}): ${t}`,...e)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Q(t,...e){throw tt(t,...e)}function Z(t,...e){return tt(t,...e)}function tt(t,...e){if("string"!=typeof t){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return J.create(t,...e)}function et(t,e,...n){if(!t)throw tt(e,...n)}function nt(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Y(e),new Error(e)}function rt(t,e){t||nt(e)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const it=new Map;function st(t){rt(t instanceof Function,"Expected a class definition");let e=it.get(t);return e?(rt(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,it.set(t,e),e)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function ot(){var t;return"undefined"!=typeof self&&(null===(t=self.location)||void 0===t?void 0:t.href)||""}function at(){var t;return"undefined"!=typeof self&&(null===(t=self.location)||void 0===t?void 0:t.protocol)||null}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function ct(){return"undefined"==typeof navigator||!navigator||!("onLine"in navigator)||"boolean"!=typeof navigator.onLine||"http:"!==at()&&"https:"!==at()&&!s()&&!("connection"in navigator)||navigator.onLine}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class lt{constructor(t,e){this.shortDelay=t,this.longDelay=e,rt(e>t,"Short delay should be less than long delay!"),this.isMobile=i()||o()}get(){return ct()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function ut(t,e){rt(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ht{static initialize(t,e,n){this.fetchImpl=t,e&&(this.headersImpl=e),n&&(this.responseImpl=n)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:void nt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:void nt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:void nt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const dt={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error"},ft=new lt(3e4,6e4);
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */async function pt(t,e,n,r,i={}){return gt(t,i,(async()=>{let i={},s={};r&&("GET"===e?s=r:i={body:JSON.stringify(r)});const o=f(Object.assign({key:t.config.apiKey},s)).slice(1),a=await t._getAdditionalHeaders();return a["Content-Type"]="application/json",t.languageCode&&(a["X-Firebase-Locale"]=t.languageCode),ht.fetch()(mt(t,t.config.apiHost,n,o),Object.assign({method:e,headers:a,referrerPolicy:"no-referrer"},i))}))}async function gt(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},dt),e);try{const e=new yt(t),i=await Promise.race([n(),e.promise]);e.clearNetworkTimeout();const s=await i.json();if("needConfirmation"in s)throw vt(t,"account-exists-with-different-credential",s);if(i.ok&&!("errorMessage"in s))return s;{const e=i.ok?s.errorMessage:s.error.message,[n,o]=e.split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===n)throw vt(t,"credential-already-in-use",s);if("EMAIL_EXISTS"===n)throw vt(t,"email-already-in-use",s);const a=r[n]||n.toLowerCase().replace(/[_\s]+/g,"-");if(o)throw function(t,e,n){const r=Object.assign(Object.assign({},G()),{[e]:n});return new l("auth","Firebase",r).create(e,{appName:t.name})}(t,a,o);Q(t,a)}}catch(e){if(e instanceof c)throw e;Q(t,"network-request-failed")}}function mt(t,e,n,r){const i=`${e}${n}?${r}`;return t.config.emulator?ut(t.config,i):`${t.config.apiScheme}://${i}`}class yt{constructor(t){this.auth=t,this.timer=null,this.promise=new Promise(((t,e)=>{this.timer=setTimeout((()=>e(Z(this.auth,"timeout"))),ft.get())}))}clearNetworkTimeout(){clearTimeout(this.timer)}}function vt(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=Z(t,e,r);return i.customData._tokenResponse=n,i}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function wt(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch(t){}}function Et(t){return 1e3*Number(t)}function _t(t){const[n,r,i]=t.split(".");if(void 0===n||void 0===r||void 0===i)return Y("JWT malformed, contained fewer than 3 sections"),null;try{const t=e(r);return t?JSON.parse(t):(Y("Failed to decode base64 JWT payload"),null)}catch(t){return Y("Caught error parsing JWT payload as JSON",t),null}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
async function bt(t,e,n=!1){if(n)return e;try{return await e}catch(e){throw e instanceof c&&function({code:t}){return"auth/user-disabled"===t||"auth/user-token-expired"===t}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(e)&&t.auth.currentUser===t&&await t.auth.signOut(),e}}class Tt{constructor(t){this.user=t,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(t){var e;if(t){const t=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),t}{this.errorBackoff=3e4;const t=(null!==(e=this.user.stsTokenManager.expirationTime)&&void 0!==e?e:0)-Date.now()-3e5;return Math.max(0,t)}}schedule(t=!1){if(!this.isRunning)return;const e=this.getInterval(t);this.timerId=setTimeout((async()=>{await this.iteration()}),e)}async iteration(){try{await this.user.getIdToken(!0)}catch(t){return void("auth/network-request-failed"===t.code&&this.schedule(!0))}this.schedule()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class It{constructor(t,e){this.createdAt=t,this.lastLoginAt=e,this._initializeTime()}_initializeTime(){this.lastSignInTime=wt(this.lastLoginAt),this.creationTime=wt(this.createdAt)}_copy(t){this.createdAt=t.createdAt,this.lastLoginAt=t.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */async function kt(t){var e;const n=t.auth,r=await t.getIdToken(),i=await bt(t,async function(t,e){return pt(t,"POST","/v1/accounts:lookup",e)}(n,{idToken:r}));et(null==i?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=(null===(e=s.providerUserInfo)||void 0===e?void 0:e.length)?s.providerUserInfo.map((t=>{var{providerId:e}=t,n=K(t,["providerId"]);return{providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}})):[];const a=(c=t.providerData,l=o,[...c.filter((t=>!l.some((e=>e.providerId===t.providerId)))),...l]);var c,l;const u=t.isAnonymous,h=!(t.email&&s.passwordHash||(null==a?void 0:a.length)),d=!!u&&h,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new It(s.createdAt,s.lastLoginAt),isAnonymous:d};Object.assign(t,f)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class St{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(t){et(t.idToken,"internal-error"),et(void 0!==t.idToken,"internal-error"),et(void 0!==t.refreshToken,"internal-error");const e="expiresIn"in t&&void 0!==t.expiresIn?Number(t.expiresIn):function(t){const e=_t(t);return et(e,"internal-error"),et(void 0!==e.exp,"internal-error"),et(void 0!==e.iat,"internal-error"),Number(e.exp)-Number(e.iat)}(t.idToken);this.updateTokensAndExpiration(t.idToken,t.refreshToken,e)}async getToken(t,e=!1){return et(!this.accessToken||this.refreshToken,t,"user-token-expired"),e||!this.accessToken||this.isExpired?this.refreshToken?(await this.refresh(t,this.refreshToken),this.accessToken):null:this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(t,e){const{accessToken:n,refreshToken:r,expiresIn:i}=
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */await async function(t,e){const n=await gt(t,{},(async()=>{const n=f({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,s=mt(t,r,"/v1/token",`key=${i}`),o=await t._getAdditionalHeaders();return o["Content-Type"]="application/x-www-form-urlencoded",ht.fetch()(s,{method:"POST",headers:o,body:n})}));return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}(t,e);this.updateTokensAndExpiration(n,r,Number(i))}updateTokensAndExpiration(t,e,n){this.refreshToken=e||null,this.accessToken=t||null,this.expirationTime=Date.now()+1e3*n}static fromJSON(t,e){const{refreshToken:n,accessToken:r,expirationTime:i}=e,s=new St;return n&&(et("string"==typeof n,"internal-error",{appName:t}),s.refreshToken=n),r&&(et("string"==typeof r,"internal-error",{appName:t}),s.accessToken=r),i&&(et("number"==typeof i,"internal-error",{appName:t}),s.expirationTime=i),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(t){this.accessToken=t.accessToken,this.refreshToken=t.refreshToken,this.expirationTime=t.expirationTime}_clone(){return Object.assign(new St,this.toJSON())}_performRefresh(){return nt("not implemented")}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ct(t,e){et("string"==typeof t||void 0===t,"internal-error",{appName:e})}class At{constructor(t){var{uid:e,auth:n,stsTokenManager:r}=t,i=K(t,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.emailVerified=!1,this.isAnonymous=!1,this.tenantId=null,this.providerData=[],this.proactiveRefresh=new Tt(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.metadata=new It(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(t){const e=await bt(this,this.stsTokenManager.getToken(this.auth,t));return et(e,this.auth,"internal-error"),this.accessToken!==e&&(this.accessToken=e,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),e}getIdTokenResult(t){return async function(t,e=!1){const n=m(t),r=await n.getIdToken(e),i=_t(r);et(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s="object"==typeof i.firebase?i.firebase:void 0,o=null==s?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:wt(Et(i.auth_time)),issuedAtTime:wt(Et(i.iat)),expirationTime:wt(Et(i.exp)),signInProvider:o||null,signInSecondFactor:(null==s?void 0:s.sign_in_second_factor)||null}}(this,t)}reload(){return async function(t){const e=m(t);await kt(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}(this)}_assign(t){this!==t&&(et(this.uid===t.uid,this.auth,"internal-error"),this.displayName=t.displayName,this.photoURL=t.photoURL,this.email=t.email,this.emailVerified=t.emailVerified,this.phoneNumber=t.phoneNumber,this.isAnonymous=t.isAnonymous,this.tenantId=t.tenantId,this.providerData=t.providerData.map((t=>Object.assign({},t))),this.metadata._copy(t.metadata),this.stsTokenManager._assign(t.stsTokenManager))}_clone(t){return new At(Object.assign(Object.assign({},this),{auth:t,stsTokenManager:this.stsTokenManager._clone()}))}_onReload(t){et(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=t,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(t){this.reloadListener?this.reloadListener(t):this.reloadUserInfo=t}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(t,e=!1){let n=!1;t.idToken&&t.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(t),n=!0),e&&await kt(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){const t=await this.getIdToken();return await bt(this,async function(t,e){return pt(t,"POST","/v1/accounts:delete",e)}(this.auth,{idToken:t})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map((t=>Object.assign({},t))),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(t,e){var n,r,i,s,o,a,c,l;const u=null!==(n=e.displayName)&&void 0!==n?n:void 0,h=null!==(r=e.email)&&void 0!==r?r:void 0,d=null!==(i=e.phoneNumber)&&void 0!==i?i:void 0,f=null!==(s=e.photoURL)&&void 0!==s?s:void 0,p=null!==(o=e.tenantId)&&void 0!==o?o:void 0,g=null!==(a=e._redirectEventId)&&void 0!==a?a:void 0,m=null!==(c=e.createdAt)&&void 0!==c?c:void 0,y=null!==(l=e.lastLoginAt)&&void 0!==l?l:void 0,{uid:v,emailVerified:w,isAnonymous:E,providerData:_,stsTokenManager:b}=e;et(v&&b,t,"internal-error");const T=St.fromJSON(this.name,b);et("string"==typeof v,t,"internal-error"),Ct(u,t.name),Ct(h,t.name),et("boolean"==typeof w,t,"internal-error"),et("boolean"==typeof E,t,"internal-error"),Ct(d,t.name),Ct(f,t.name),Ct(p,t.name),Ct(g,t.name),Ct(m,t.name),Ct(y,t.name);const I=new At({uid:v,auth:t,email:h,emailVerified:w,displayName:u,isAnonymous:E,photoURL:f,phoneNumber:d,tenantId:p,stsTokenManager:T,createdAt:m,lastLoginAt:y});return _&&Array.isArray(_)&&(I.providerData=_.map((t=>Object.assign({},t)))),g&&(I._redirectEventId=g),I}static async _fromIdTokenResponse(t,e,n=!1){const r=new St;r.updateFromServerResponse(e);const i=new At({uid:e.localId,auth:t,stsTokenManager:r,isAnonymous:n});return await kt(i),i}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class xt{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(t,e){this.storage[t]=e}async _get(t){const e=this.storage[t];return void 0===e?null:e}async _remove(t){delete this.storage[t]}_addListener(t,e){}_removeListener(t,e){}}xt.type="NONE";const Nt=xt;
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Lt(t,e,n){return`firebase:${t}:${e}:${n}`}class Rt{constructor(t,e,n){this.persistence=t,this.auth=e,this.userKey=n;const{config:r,name:i}=this.auth;this.fullUserKey=Lt(this.userKey,r.apiKey,i),this.fullPersistenceKey=Lt("persistence",r.apiKey,i),this.boundEventHandler=e._onStorageEvent.bind(e),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(t){return this.persistence._set(this.fullUserKey,t.toJSON())}async getCurrentUser(){const t=await this.persistence._get(this.fullUserKey);return t?At._fromJSON(this.auth,t):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(t){if(this.persistence===t)return;const e=await this.getCurrentUser();return await this.removeCurrentUser(),this.persistence=t,e?this.setCurrentUser(e):void 0}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(t,e,n="authUser"){if(!e.length)return new Rt(st(Nt),t,n);const r=(await Promise.all(e.map((async t=>{if(await t._isAvailable())return t})))).filter((t=>t));let i=r[0]||st(Nt);const s=Lt(n,t.config.apiKey,t.name);let o=null;for(const n of e)try{const e=await n._get(s);if(e){const r=At._fromJSON(t,e);n!==i&&(o=r),i=n;break}}catch(t){}const a=r.filter((t=>t._shouldAllowMigration));return i._shouldAllowMigration&&a.length?(i=a[0],o&&await i._set(s,o.toJSON()),await Promise.all(e.map((async t=>{if(t!==i)try{await t._remove(s)}catch(t){}}))),new Rt(i,t,n)):new Rt(i,t,n)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Dt(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ut(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Mt(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Vt(e))return"Blackberry";if($t(e))return"Webos";if(Ot(e))return"Safari";if((e.includes("chrome/")||Pt(e))&&!e.includes("edge/"))return"Chrome";if(Ft(e))return"Android";{const e=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(e);if(2===(null==n?void 0:n.length))return n[1]}return"Other"}function Mt(t=r()){return/firefox\//i.test(t)}function Ot(t=r()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Pt(t=r()){return/crios\//i.test(t)}function Ut(t=r()){return/iemobile/i.test(t)}function Ft(t=r()){return/android/i.test(t)}function Vt(t=r()){return/blackberry/i.test(t)}function $t(t=r()){return/webos/i.test(t)}function jt(t=r()){return/iphone|ipad|ipod/i.test(t)}function Bt(t=r()){return jt(t)||Ft(t)||$t(t)||Vt(t)||/windows phone/i.test(t)||Ut(t)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function qt(t,e=[]){let n;switch(t){case"Browser":n=Dt(r());break;case"Worker":n=`${Dt(r())}-${t}`;break;default:n=t}const i=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${$}/${i}`}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class zt{constructor(t,e){this.app=t,this.config=e,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Kt(this),this.idTokenSubscription=new Kt(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=J,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=t.name,this.clientVersion=e.sdkClientVersion}_initializeWithPersistence(t,e){return e&&(this._popupRedirectResolver=st(e)),this._initializationPromise=this.queue((async()=>{var n,r;if(!this._deleted&&(this.persistenceManager=await Rt.create(this,t),!this._deleted)){if(null===(n=this._popupRedirectResolver)||void 0===n?void 0:n._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(t){}await this.initializeCurrentUser(e),this.lastNotifiedUid=(null===(r=this.currentUser)||void 0===r?void 0:r.uid)||null,this._deleted||(this._isInitialized=!0)}})),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const t=await this.assertedPersistence.getCurrentUser();return this.currentUser||t?this.currentUser&&t&&this.currentUser.uid===t.uid?(this._currentUser._assign(t),void await this.currentUser.getIdToken()):void await this._updateCurrentUser(t):void 0}async initializeCurrentUser(t){var e;let n=await this.assertedPersistence.getCurrentUser();if(t&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const r=null===(e=this.redirectUser)||void 0===e?void 0:e._redirectEventId,i=null==n?void 0:n._redirectEventId,s=await this.tryRedirectSignIn(t);r&&r!==i||!(null==s?void 0:s.user)||(n=s.user)}return n?n._redirectEventId?(et(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)):this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}async tryRedirectSignIn(t){let e=null;try{e=await this._popupRedirectResolver._completeRedirectFn(this,t,!0)}catch(t){await this._setRedirectUser(null)}return e}async reloadAndSetCurrentUserOrClear(t){try{await kt(t)}catch(t){if("auth/network-request-failed"!==t.code)return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(t)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(t){const e=t?m(t):null;return e&&et(e.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(e&&e._clone(this))}async _updateCurrentUser(t){if(!this._deleted)return t&&et(this.tenantId===t.tenantId,this,"tenant-id-mismatch"),this.queue((async()=>{await this.directlySetCurrentUser(t),this.notifyAuthListeners()}))}async signOut(){return(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null)}setPersistence(t){return this.queue((async()=>{await this.assertedPersistence.setPersistence(st(t))}))}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(t){this._errorFactory=new l("auth","Firebase",t())}onAuthStateChanged(t,e,n){return this.registerStateListener(this.authStateSubscription,t,e,n)}onIdTokenChanged(t,e,n){return this.registerStateListener(this.idTokenSubscription,t,e,n)}toJSON(){var t;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:null===(t=this._currentUser)||void 0===t?void 0:t.toJSON()}}async _setRedirectUser(t,e){const n=await this.getOrInitRedirectPersistenceManager(e);return null===t?n.removeCurrentUser():n.setCurrentUser(t)}async getOrInitRedirectPersistenceManager(t){if(!this.redirectPersistenceManager){const e=t&&st(t)||this._popupRedirectResolver;et(e,this,"argument-error"),this.redirectPersistenceManager=await Rt.create(this,[st(e._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(t){var e,n;return this._isInitialized&&await this.queue((async()=>{})),(null===(e=this._currentUser)||void 0===e?void 0:e._redirectEventId)===t?this._currentUser:(null===(n=this.redirectUser)||void 0===n?void 0:n._redirectEventId)===t?this.redirectUser:null}async _persistUserIfCurrent(t){if(t===this.currentUser)return this.queue((async()=>this.directlySetCurrentUser(t)))}_notifyListenersIfCurrent(t){t===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t,e;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const n=null!==(e=null===(t=this.currentUser)||void 0===t?void 0:t.uid)&&void 0!==e?e:null;this.lastNotifiedUid!==n&&(this.lastNotifiedUid=n,this.authStateSubscription.next(this.currentUser))}registerStateListener(t,e,n,r){if(this._deleted)return()=>{};const i="function"==typeof e?e:e.next.bind(e),s=this._isInitialized?Promise.resolve():this._initializationPromise;return et(s,this,"internal-error"),s.then((()=>i(this.currentUser))),"function"==typeof e?t.addObserver(e,n,r):t.addObserver(e)}async directlySetCurrentUser(t){this.currentUser&&this.currentUser!==t&&(this._currentUser._stopProactiveRefresh(),t&&this.isProactiveRefreshEnabled&&t._startProactiveRefresh()),this.currentUser=t,t?await this.assertedPersistence.setCurrentUser(t):await this.assertedPersistence.removeCurrentUser()}queue(t){return this.operations=this.operations.then(t,t),this.operations}get assertedPersistence(){return et(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(t){t&&!this.frameworks.includes(t)&&(this.frameworks.push(t),this.frameworks.sort(),this.clientVersion=qt(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const t={"X-Client-Version":this.clientVersion};return this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId),t}}function Ht(t){return m(t)}class Kt{constructor(t){this.auth=t,this.observer=null,this.addObserver=function(t,e){const n=new p(t,e);return n.subscribe.bind(n)}((t=>this.observer=t))}get next(){return et(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Wt{constructor(t,e){this.providerId=t,this.signInMethod=e}toJSON(){return nt("not implemented")}_getIdTokenResponse(t){return nt("not implemented")}_linkToIdToken(t,e){return nt("not implemented")}_getReauthenticationResolver(t){return nt("not implemented")}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */async function Gt(t,e){return async function(t,e,n,r,i={}){const s=await pt(t,e,n,r,i);return"mfaPendingCredential"in s&&Q(t,"multi-factor-auth-required",{_serverResponse:s}),s}(t,"POST","/v1/accounts:signInWithIdp",function(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}(t,e))}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Jt extends Wt{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(t){const e=new Jt(t.providerId,t.signInMethod);return t.idToken||t.accessToken?(t.idToken&&(e.idToken=t.idToken),t.accessToken&&(e.accessToken=t.accessToken),t.nonce&&!t.pendingToken&&(e.nonce=t.nonce),t.pendingToken&&(e.pendingToken=t.pendingToken)):t.oauthToken&&t.oauthTokenSecret?(e.accessToken=t.oauthToken,e.secret=t.oauthTokenSecret):Q("argument-error"),e}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(t){const e="string"==typeof t?JSON.parse(t):t,{providerId:n,signInMethod:r}=e,i=K(e,["providerId","signInMethod"]);if(!n||!r)return null;const s=new Jt(n,r);return s.idToken=i.idToken||void 0,s.accessToken=i.accessToken||void 0,s.secret=i.secret,s.nonce=i.nonce,s.pendingToken=i.pendingToken||null,s}_getIdTokenResponse(t){return Gt(t,this.buildRequest())}_linkToIdToken(t,e){const n=this.buildRequest();return n.idToken=e,Gt(t,n)}_getReauthenticationResolver(t){const e=this.buildRequest();return e.autoCreate=!1,Gt(t,e)}buildRequest(){const t={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)t.pendingToken=this.pendingToken;else{const e={};this.idToken&&(e.id_token=this.idToken),this.accessToken&&(e.access_token=this.accessToken),this.secret&&(e.oauth_token_secret=this.secret),e.providerId=this.providerId,this.nonce&&!this.pendingToken&&(e.nonce=this.nonce),t.postBody=f(e)}return t}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Xt{constructor(t){this.providerId=t,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(t){this.defaultLanguageCode=t}setCustomParameters(t){return this.customParameters=t,this}getCustomParameters(){return this.customParameters}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Yt extends Xt{constructor(){super(...arguments),this.scopes=[]}addScope(t){return this.scopes.includes(t)||this.scopes.push(t),this}getScopes(){return[...this.scopes]}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Qt extends Yt{constructor(){super("facebook.com")}static credential(t){return Jt._fromParams({providerId:Qt.PROVIDER_ID,signInMethod:Qt.FACEBOOK_SIGN_IN_METHOD,accessToken:t})}static credentialFromResult(t){return Qt.credentialFromTaggedObject(t)}static credentialFromError(t){return Qt.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t||!("oauthAccessToken"in t))return null;if(!t.oauthAccessToken)return null;try{return Qt.credential(t.oauthAccessToken)}catch(t){return null}}}Qt.FACEBOOK_SIGN_IN_METHOD="facebook.com",Qt.PROVIDER_ID="facebook.com";
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class Zt extends Yt{constructor(){super("google.com"),this.addScope("profile")}static credential(t,e){return Jt._fromParams({providerId:Zt.PROVIDER_ID,signInMethod:Zt.GOOGLE_SIGN_IN_METHOD,idToken:t,accessToken:e})}static credentialFromResult(t){return Zt.credentialFromTaggedObject(t)}static credentialFromError(t){return Zt.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t)return null;const{oauthIdToken:e,oauthAccessToken:n}=t;if(!e&&!n)return null;try{return Zt.credential(e,n)}catch(t){return null}}}Zt.GOOGLE_SIGN_IN_METHOD="google.com",Zt.PROVIDER_ID="google.com";
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class te extends Yt{constructor(){super("github.com")}static credential(t){return Jt._fromParams({providerId:te.PROVIDER_ID,signInMethod:te.GITHUB_SIGN_IN_METHOD,accessToken:t})}static credentialFromResult(t){return te.credentialFromTaggedObject(t)}static credentialFromError(t){return te.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t||!("oauthAccessToken"in t))return null;if(!t.oauthAccessToken)return null;try{return te.credential(t.oauthAccessToken)}catch(t){return null}}}te.GITHUB_SIGN_IN_METHOD="github.com",te.PROVIDER_ID="github.com";
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class ee extends Yt{constructor(){super("twitter.com")}static credential(t,e){return Jt._fromParams({providerId:ee.PROVIDER_ID,signInMethod:ee.TWITTER_SIGN_IN_METHOD,oauthToken:t,oauthTokenSecret:e})}static credentialFromResult(t){return ee.credentialFromTaggedObject(t)}static credentialFromError(t){return ee.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t)return null;const{oauthAccessToken:e,oauthTokenSecret:n}=t;if(!e||!n)return null;try{return ee.credential(e,n)}catch(t){return null}}}ee.TWITTER_SIGN_IN_METHOD="twitter.com",ee.PROVIDER_ID="twitter.com";
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class ne{constructor(t){this.user=t.user,this.providerId=t.providerId,this._tokenResponse=t._tokenResponse,this.operationType=t.operationType}static async _fromIdTokenResponse(t,e,n,r=!1){const i=await At._fromIdTokenResponse(t,n,r),s=re(n);return new ne({user:i,providerId:s,_tokenResponse:n,operationType:e})}static async _forOperation(t,e,n){await t._updateTokensIfNecessary(n,!0);const r=re(n);return new ne({user:t,providerId:r,_tokenResponse:n,operationType:e})}}function re(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ie extends c{constructor(t,e,n,r){var i;super(e.code,e.message),this.operationType=n,this.user=r,Object.setPrototypeOf(this,ie.prototype),this.customData={appName:t.name,tenantId:null!==(i=t.tenantId)&&void 0!==i?i:void 0,_serverResponse:e.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(t,e,n,r){return new ie(t,e,n,r)}}function se(t,e,n,r){return("reauthenticate"===e?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch((n=>{if("auth/multi-factor-auth-required"===n.code)throw ie._fromErrorAndOperation(t,n,e,r);throw n}))}function oe(t,e,n,r){return m(t).onAuthStateChanged(e,n,r)}const ae="__sak";
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ce{constructor(t,e){this.storageRetriever=t,this.type=e}_isAvailable(){try{return this.storage?(this.storage.setItem(ae,"1"),this.storage.removeItem(ae),Promise.resolve(!0)):Promise.resolve(!1)}catch(t){return Promise.resolve(!1)}}_set(t,e){return this.storage.setItem(t,JSON.stringify(e)),Promise.resolve()}_get(t){const e=this.storage.getItem(t);return Promise.resolve(e?JSON.parse(e):null)}_remove(t){return this.storage.removeItem(t),Promise.resolve()}get storage(){return this.storageRetriever()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class le extends ce{constructor(){super((()=>window.localStorage),"LOCAL"),this.boundEventHandler=(t,e)=>this.onStorageEvent(t,e),this.listeners={},this.localCache={},this.pollTimer=null,this.safariLocalStorageNotSynced=function(){const t=r();return Ot(t)||jt(t)}()&&function(){try{return!(!window||window===window.top)}catch(t){return!1}}(),this.fallbackToPolling=Bt(),this._shouldAllowMigration=!0}forAllChangedKeys(t){for(const e of Object.keys(this.listeners)){const n=this.storage.getItem(e),r=this.localCache[e];n!==r&&t(e,r,n)}}onStorageEvent(t,e=!1){if(!t.key)return void this.forAllChangedKeys(((t,e,n)=>{this.notifyListeners(t,n)}));const n=t.key;if(e?this.detachListener():this.stopPolling(),this.safariLocalStorageNotSynced){const r=this.storage.getItem(n);if(t.newValue!==r)null!==t.newValue?this.storage.setItem(n,t.newValue):this.storage.removeItem(n);else if(this.localCache[n]===t.newValue&&!e)return}const r=()=>{const t=this.storage.getItem(n);(e||this.localCache[n]!==t)&&this.notifyListeners(n,t)},i=this.storage.getItem(n);a()&&10===document.documentMode&&i!==t.newValue&&t.newValue!==t.oldValue?setTimeout(r,10):r()}notifyListeners(t,e){this.localCache[t]=e;const n=this.listeners[t];if(n)for(const t of Array.from(n))t(e?JSON.parse(e):e)}startPolling(){this.stopPolling(),this.pollTimer=setInterval((()=>{this.forAllChangedKeys(((t,e,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:t,oldValue:e,newValue:n}),!0)}))}),1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(t,e){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[t]||(this.listeners[t]=new Set,this.localCache[t]=this.storage.getItem(t)),this.listeners[t].add(e)}_removeListener(t,e){this.listeners[t]&&(this.listeners[t].delete(e),0===this.listeners[t].size&&delete this.listeners[t]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(t,e){await super._set(t,e),this.localCache[t]=JSON.stringify(e)}async _get(t){const e=await super._get(t);return this.localCache[t]=JSON.stringify(e),e}async _remove(t){await super._remove(t),delete this.localCache[t]}}le.type="LOCAL";const ue=le;
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class he extends ce{constructor(){super((()=>window.sessionStorage),"SESSION")}_addListener(t,e){}_removeListener(t,e){}}he.type="SESSION";const de=he;
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class fe{constructor(t){this.eventTarget=t,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(t){const e=this.receivers.find((e=>e.isListeningto(t)));if(e)return e;const n=new fe(t);return this.receivers.push(n),n}isListeningto(t){return this.eventTarget===t}async handleEvent(t){const e=t,{eventId:n,eventType:r,data:i}=e.data,s=this.handlersMap[r];if(!(null==s?void 0:s.size))return;e.ports[0].postMessage({status:"ack",eventId:n,eventType:r});const o=Array.from(s).map((async t=>t(e.origin,i))),a=await function(t){return Promise.all(t.map((async t=>{try{return{fulfilled:!0,value:await t}}catch(t){return{fulfilled:!1,reason:t}}})))}(o);e.ports[0].postMessage({status:"done",eventId:n,eventType:r,response:a})}_subscribe(t,e){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[t]||(this.handlersMap[t]=new Set),this.handlersMap[t].add(e)}_unsubscribe(t,e){this.handlersMap[t]&&e&&this.handlersMap[t].delete(e),e&&0!==this.handlersMap[t].size||delete this.handlersMap[t],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function pe(t="",e=10){let n="";for(let t=0;t<e;t++)n+=Math.floor(10*Math.random());return t+n}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */fe.receivers=[];class ge{constructor(t){this.target=t,this.handlers=new Set}removeMessageHandler(t){t.messageChannel&&(t.messageChannel.port1.removeEventListener("message",t.onMessage),t.messageChannel.port1.close()),this.handlers.delete(t)}async _send(t,e,n=50){const r="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,s;return new Promise(((o,a)=>{const c=pe("",20);r.port1.start();const l=setTimeout((()=>{a(new Error("unsupported_event"))}),n);s={messageChannel:r,onMessage(t){const e=t;if(e.data.eventId===c)switch(e.data.status){case"ack":clearTimeout(l),i=setTimeout((()=>{a(new Error("timeout"))}),3e3);break;case"done":clearTimeout(i),o(e.data.response);break;default:clearTimeout(l),clearTimeout(i),a(new Error("invalid_response"))}}},this.handlers.add(s),r.port1.addEventListener("message",s.onMessage),this.target.postMessage({eventType:t,eventId:c,data:e},[r.port2])})).finally((()=>{s&&this.removeMessageHandler(s)}))}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function me(){return window}
/**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function ye(){return void 0!==me().WorkerGlobalScope&&"function"==typeof me().importScripts}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
const ve="firebaseLocalStorageDb",we="firebaseLocalStorage",Ee="fbase_key";class _e{constructor(t){this.request=t}toPromise(){return new Promise(((t,e)=>{this.request.addEventListener("success",(()=>{t(this.request.result)})),this.request.addEventListener("error",(()=>{e(this.request.error)}))}))}}function be(t,e){return t.transaction([we],e?"readwrite":"readonly").objectStore(we)}function Te(){const t=indexedDB.open(ve,1);return new Promise(((e,n)=>{t.addEventListener("error",(()=>{n(t.error)})),t.addEventListener("upgradeneeded",(()=>{const e=t.result;try{e.createObjectStore(we,{keyPath:Ee})}catch(t){n(t)}})),t.addEventListener("success",(async()=>{const n=t.result;n.objectStoreNames.contains(we)?e(n):(n.close(),await function(){const t=indexedDB.deleteDatabase(ve);return new _e(t).toPromise()}(),e(await Te()))}))}))}async function Ie(t,e,n){const r=be(t,!0).put({[Ee]:e,value:n});return new _e(r).toPromise()}function ke(t,e){const n=be(t,!0).delete(e);return new _e(n).toPromise()}class Se{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then((()=>{}),(()=>{}))}async _openDb(){return this.db||(this.db=await Te()),this.db}async _withRetries(t){let e=0;for(;;)try{const e=await this._openDb();return await t(e)}catch(t){if(e++>3)throw t;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ye()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=fe._getInstance(ye()?self:null),this.receiver._subscribe("keyChanged",(async(t,e)=>({keyProcessed:(await this._poll()).includes(e.key)}))),this.receiver._subscribe("ping",(async(t,e)=>["keyChanged"]))}async initializeSender(){var t,e;if(this.activeServiceWorker=await async function(){if(!(null===navigator||void 0===navigator?void 0:navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch(t){return null}}(),!this.activeServiceWorker)return;this.sender=new ge(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&(null===(t=n[0])||void 0===t?void 0:t.fulfilled)&&(null===(e=n[0])||void 0===e?void 0:e.value.includes("keyChanged"))&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(t){if(this.sender&&this.activeServiceWorker&&function(){var t;return(null===(t=null===navigator||void 0===navigator?void 0:navigator.serviceWorker)||void 0===t?void 0:t.controller)||null}()===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:t},this.serviceWorkerReceiverAvailable?800:50)}catch(t){}}async _isAvailable(){try{if(!indexedDB)return!1;const t=await Te();return await Ie(t,ae,"1"),await ke(t,ae),!0}catch(t){}return!1}async _withPendingWrite(t){this.pendingWrites++;try{await t()}finally{this.pendingWrites--}}async _set(t,e){return this._withPendingWrite((async()=>(await this._withRetries((n=>Ie(n,t,e))),this.localCache[t]=e,this.notifyServiceWorker(t))))}async _get(t){const e=await this._withRetries((e=>async function(t,e){const n=be(t,!1).get(e),r=await new _e(n).toPromise();return void 0===r?null:r.value}(e,t)));return this.localCache[t]=e,e}async _remove(t){return this._withPendingWrite((async()=>(await this._withRetries((e=>ke(e,t))),delete this.localCache[t],this.notifyServiceWorker(t))))}async _poll(){const t=await this._withRetries((t=>{const e=be(t,!1).getAll();return new _e(e).toPromise()}));if(!t)return[];if(0!==this.pendingWrites)return[];const e=[],n=new Set;for(const{fbase_key:r,value:i}of t)n.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),e.push(r));for(const t of Object.keys(this.localCache))this.localCache[t]&&!n.has(t)&&(this.notifyListeners(t,null),e.push(t));return e}notifyListeners(t,e){this.localCache[t]=e;const n=this.listeners[t];if(n)for(const t of Array.from(n))t(e)}startPolling(){this.stopPolling(),this.pollTimer=setInterval((async()=>this._poll()),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(t,e){0===Object.keys(this.listeners).length&&this.startPolling(),this.listeners[t]||(this.listeners[t]=new Set,this._get(t)),this.listeners[t].add(e)}_removeListener(t,e){this.listeners[t]&&(this.listeners[t].delete(e),0===this.listeners[t].size&&delete this.listeners[t]),0===Object.keys(this.listeners).length&&this.stopPolling()}}Se.type="LOCAL";const Ce=Se;
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ae(t){return new Promise(((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=t=>{const e=Z("internal-error");e.customData=t,n(e)},r.type="text/javascript",r.charset="UTF-8",function(){var t,e;return null!==(e=null===(t=document.getElementsByTagName("head"))||void 0===t?void 0:t[0])&&void 0!==e?e:document}().appendChild(r)}))}new lt(3e4,6e4);
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class xe extends Wt{constructor(t){super("custom","custom"),this.params=t}_getIdTokenResponse(t){return Gt(t,this._buildIdpRequest())}_linkToIdToken(t,e){return Gt(t,this._buildIdpRequest(e))}_getReauthenticationResolver(t){return Gt(t,this._buildIdpRequest())}_buildIdpRequest(t){const e={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return t&&(e.idToken=t),e}}function Ne(t){
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
return async function(t,e,n=!1){const r="signIn",i=await se(t,r,e),s=await ne._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}(t.auth,new xe(t),t.bypassAuthState)}function Le(t){const{auth:e,user:n}=t;return et(n,e,"internal-error"),
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
async function(t,e,n=!1){const{auth:r}=t,i="reauthenticate";try{const s=await bt(t,se(r,i,e,t),n);et(s.idToken,r,"internal-error");const o=_t(s.idToken);et(o,r,"internal-error");const{sub:a}=o;return et(t.uid===a,r,"user-mismatch"),ne._forOperation(t,i,s)}catch(t){throw"auth/user-not-found"===(null==t?void 0:t.code)&&Q(r,"user-mismatch"),t}}(n,new xe(t),t.bypassAuthState)}async function Re(t){const{auth:e,user:n}=t;return et(n,e,"internal-error"),async function(t,e,n=!1){const r=await bt(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ne._forOperation(t,"link",r)}(n,new xe(t),t.bypassAuthState)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class De{constructor(t,e,n,r,i=!1){this.auth=t,this.resolver=n,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(e)?e:[e]}execute(){return new Promise((async(t,e)=>{this.pendingPromise={resolve:t,reject:e};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(t){this.reject(t)}}))}async onAuthEvent(t){const{urlResponse:e,sessionId:n,postBody:r,tenantId:i,error:s,type:o}=t;if(s)return void this.reject(s);const a={auth:this.auth,requestUri:e,sessionId:n,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(o)(a))}catch(t){this.reject(t)}}onError(t){this.reject(t)}getIdpTask(t){switch(t){case"signInViaPopup":case"signInViaRedirect":return Ne;case"linkViaPopup":case"linkViaRedirect":return Re;case"reauthViaPopup":case"reauthViaRedirect":return Le;default:Q(this.auth,"internal-error")}}resolve(t){rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(t),this.unregisterAndCleanUp()}reject(t){rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(t),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const Me=new lt(2e3,1e4);class Oe extends De{constructor(t,e,n,r,i){super(t,e,r,i),this.provider=n,this.authWindow=null,this.pollId=null,Oe.currentPopupAction&&Oe.currentPopupAction.cancel(),Oe.currentPopupAction=this}async executeNotNull(){const t=await this.execute();return et(t,this.auth,"internal-error"),t}async onExecution(){rt(1===this.filter.length,"Popup operations only handle one event");const t=pe();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],t),this.authWindow.associatedEvent=t,this.resolver._originValidation(this.auth).catch((t=>{this.reject(t)})),this.resolver._isIframeWebStorageSupported(this.auth,(t=>{t||this.reject(Z(this.auth,"web-storage-unsupported"))})),this.pollUserCancellation()}get eventId(){var t;return(null===(t=this.authWindow)||void 0===t?void 0:t.associatedEvent)||null}cancel(){this.reject(Z(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Oe.currentPopupAction=null}pollUserCancellation(){const t=()=>{var e,n;(null===(n=null===(e=this.authWindow)||void 0===e?void 0:e.window)||void 0===n?void 0:n.closed)?this.pollId=window.setTimeout((()=>{this.pollId=null,this.reject(Z(this.auth,"popup-closed-by-user"))}),2e3):this.pollId=window.setTimeout(t,Me.get())};t()}}Oe.currentPopupAction=null;
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
const Pe="pendingRedirect",Ue=new Map;class Fe extends De{constructor(t,e,n=!1){super(t,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],e,void 0,n),this.eventId=null}async execute(){let t=Ue.get(this.auth._key());if(!t){try{const e=await async function(t,e){const n=function(t){return Lt(Pe,t.config.apiKey,t.name)}(e),r=function(t){return st(t._redirectPersistence)}(t);if(!await r._isAvailable())return!1;const i="true"===await r._get(n);return await r._remove(n),i}(this.resolver,this.auth)?await super.execute():null;t=()=>Promise.resolve(e)}catch(e){t=()=>Promise.reject(e)}Ue.set(this.auth._key(),t)}return this.bypassAuthState||Ue.set(this.auth._key(),(()=>Promise.resolve(null))),t()}async onAuthEvent(t){if("signInViaRedirect"===t.type)return super.onAuthEvent(t);if("unknown"!==t.type){if(t.eventId){const e=await this.auth._redirectUserForId(t.eventId);if(e)return this.user=e,super.onAuthEvent(t);this.resolve(null)}}else this.resolve(null)}async onExecution(){}cleanUp(){}}async function Ve(t,e,n=!1){const r=Ht(t),i=
/**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function(t,e){return e?st(e):(et(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}(r,e),s=new Fe(r,i,n),o=await s.execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class $e{constructor(t){this.auth=t,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(t){this.consumers.add(t),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,t)&&(this.sendToConsumer(this.queuedRedirectEvent,t),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(t){this.consumers.delete(t)}onEvent(t){if(this.hasEventBeenHandled(t))return!1;let e=!1;return this.consumers.forEach((n=>{this.isEventForConsumer(t,n)&&(e=!0,this.sendToConsumer(t,n),this.saveEventToCache(t))})),this.hasHandledPotentialRedirect||!function(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Be(t);default:return!1}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t)||(this.hasHandledPotentialRedirect=!0,e||(this.queuedRedirectEvent=t,e=!0)),e}sendToConsumer(t,e){var n;if(t.error&&!Be(t)){const r=(null===(n=t.error.code)||void 0===n?void 0:n.split("auth/")[1])||"internal-error";e.onError(Z(this.auth,r))}else e.onAuthEvent(t)}isEventForConsumer(t,e){const n=null===e.eventId||!!t.eventId&&t.eventId===e.eventId;return e.filter.includes(t.type)&&n}hasEventBeenHandled(t){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(je(t))}saveEventToCache(t){this.cachedEventUids.add(je(t)),this.lastProcessedEventTime=Date.now()}}function je(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter((t=>t)).join("-")}function Be({type:t,error:e}){return"unknown"===t&&"auth/no-auth-event"===(null==e?void 0:e.code)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
const qe=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,ze=/^https?/;async function He(t){if(t.config.emulator)return;const{authorizedDomains:e}=await async function(t,e={}){return pt(t,"GET","/v1/projects",e)}(t);for(const t of e)try{if(Ke(t))return}catch(t){}Q(t,"unauthorized-domain")}function Ke(t){const e=ot(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const i=new URL(t);return""===i.hostname&&""===r?"chrome-extension:"===n&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):"chrome-extension:"===n&&i.hostname===r}if(!ze.test(n))return!1;if(qe.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}
/**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const We=new lt(3e4,6e4);function Ge(){const t=me().___jsl;if(null==t?void 0:t.H)for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let e=0;e<t.CP.length;e++)t.CP[e]=null}function Je(t){return new Promise(((e,n)=>{var r,i,s;function o(){Ge(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Ge(),n(Z(t,"network-request-failed"))},timeout:We.get()})}if(null===(i=null===(r=me().gapi)||void 0===r?void 0:r.iframes)||void 0===i?void 0:i.Iframe)e(gapi.iframes.getContext());else{if(!(null===(s=me().gapi)||void 0===s?void 0:s.load)){const e=`__${"iframefcb"}${Math.floor(1e6*Math.random())}`;return me()[e]=()=>{gapi.load?o():n(Z(t,"network-request-failed"))},Ae(`https://apis.google.com/js/api.js?onload=${e}`).catch((t=>n(t)))}o()}})).catch((t=>{throw Xe=null,t}))}let Xe=null;
/**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
const Ye=new lt(5e3,15e3),Qe="__/auth/iframe",Ze="emulator/auth/iframe",tn={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},en=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function nn(t){const e=t.config;et(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?ut(e,Ze):`https://${t.config.authDomain}/${Qe}`,r={apiKey:e.apiKey,appName:t.name,v:$},i=en.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${f(r).slice(1)}`}async function rn(t){const e=await function(t){return Xe=Xe||Je(t),Xe}(t),n=me().gapi;return et(n,t,"internal-error"),e.open({where:document.body,url:nn(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:tn,dontclear:!0},(e=>new Promise((async(n,r)=>{await e.restyle({setHideOnLeave:!1});const i=Z(t,"network-request-failed"),s=me().setTimeout((()=>{r(i)}),Ye.get());function o(){me().clearTimeout(s),n(e)}e.ping(o).then(o,(()=>{r(i)}))}))))}
/**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const sn={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class on{constructor(t){this.window=t,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(t){}}}function an(t,e,n,i=500,s=600){const o=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-i)/2,0).toString();let c="";const l=Object.assign(Object.assign({},sn),{width:i.toString(),height:s.toString(),top:o,left:a}),u=r().toLowerCase();n&&(c=Pt(u)?"_blank":n),Mt(u)&&(e=e||"http://localhost",l.scrollbars="yes");const h=Object.entries(l).reduce(((t,[e,n])=>`${t}${e}=${n},`),"");if(function(t=r()){var e;return jt(t)&&!!(null===(e=window.navigator)||void 0===e?void 0:e.standalone)}(u)&&"_self"!==c)return function(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}
/**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(e||"",c),new on(null);const d=window.open(e||"",c,h);et(d,t,"popup-blocked");try{d.focus()}catch(t){}return new on(d)}const cn="__/auth/handler",ln="emulator/auth/handler";function un(t,e,n,r,i,s){et(t.config.authDomain,t,"auth-domain-config-required"),et(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:$,eventId:i};if(e instanceof Xt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",function(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[t,e]of Object.entries(s||{}))o[t]=e}if(e instanceof Yt){const t=e.getScopes().filter((t=>""!==t));t.length>0&&(o.scopes=t.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const t of Object.keys(a))void 0===a[t]&&delete a[t];return`${function({config:t}){if(!t.emulator)return`https://${t.authDomain}/${cn}`;return ut(t,ln)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t)}?${f(a).slice(1)}`}const hn="webStorageSupport";const dn=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=de,this._completeRedirectFn=Ve}async _openPopup(t,e,n,r){var i;rt(null===(i=this.eventManagers[t._key()])||void 0===i?void 0:i.manager,"_initialize() not called before _openPopup()");return an(t,un(t,e,n,ot(),r),pe())}async _openRedirect(t,e,n,r){var i;return await this._originValidation(t),i=un(t,e,n,ot(),r),me().location.href=i,new Promise((()=>{}))}_initialize(t){const e=t._key();if(this.eventManagers[e]){const{manager:t,promise:n}=this.eventManagers[e];return t?Promise.resolve(t):(rt(n,"If manager is not set, promise should be"),n)}const n=this.initAndGetManager(t);return this.eventManagers[e]={promise:n},n.catch((()=>{delete this.eventManagers[e]})),n}async initAndGetManager(t){const e=await rn(t),n=new $e(t);return e.register("authEvent",(e=>{et(null==e?void 0:e.authEvent,t,"invalid-auth-event");return{status:n.onEvent(e.authEvent)?"ACK":"ERROR"}}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[t._key()]={manager:n},this.iframes[t._key()]=e,n}_isIframeWebStorageSupported(t,e){this.iframes[t._key()].send(hn,{type:hn},(n=>{var r;const i=null===(r=null==n?void 0:n[0])||void 0===r?void 0:r[hn];void 0!==i&&e(!!i),Q(t,"internal-error")}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(t){const e=t._key();return this.originValidationPromises[e]||(this.originValidationPromises[e]=He(t)),this.originValidationPromises[e]}get _shouldInitProactively(){return Bt()||Ot()||jt()}};var fn,pn="@firebase/auth",gn="0.19.4";
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class mn{constructor(t){this.auth=t,this.internalListeners=new Map}getUid(){var t;return this.assertAuthConfigured(),(null===(t=this.auth.currentUser)||void 0===t?void 0:t.uid)||null}async getToken(t){if(this.assertAuthConfigured(),await this.auth._initializationPromise,!this.auth.currentUser)return null;return{accessToken:await this.auth.currentUser.getIdToken(t)}}addAuthTokenListener(t){if(this.assertAuthConfigured(),this.internalListeners.has(t))return;const e=this.auth.onIdTokenChanged((e=>{var n;t((null===(n=e)||void 0===n?void 0:n.stsTokenManager.accessToken)||null)}));this.internalListeners.set(t,e),this.updateProactiveRefresh()}removeAuthTokenListener(t){this.assertAuthConfigured();const e=this.internalListeners.get(t);e&&(this.internalListeners.delete(t),e(),this.updateProactiveRefresh())}assertAuthConfigured(){et(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function yn(t=j()){const e=U(t,"auth");return e.isInitialized()?e.getImmediate():function(t,e){const n=U(t,"auth");if(n.isInitialized()){const t=n.getImmediate();if(h(n.getOptions(),null!=e?e:{}))return t;Q(t,"already-initialized")}return n.initialize({options:e})}(t,{popupRedirectResolver:dn,persistence:[Ce,ue,de]})}fn="Browser",P(new y("auth",((t,{options:e})=>{const n=t.getProvider("app").getImmediate(),{apiKey:r,authDomain:i}=n.options;return(t=>{et(r&&!r.includes(":"),"invalid-api-key",{appName:t.name}),et(!(null==i?void 0:i.includes(":")),"argument-error",{appName:t.name});const n={apiKey:r,authDomain:i,clientPlatform:fn,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:qt(fn)},s=new zt(t,n);return function(t,e){const n=(null==e?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(st);(null==e?void 0:e.errorMap)&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,null==e?void 0:e.popupRedirectResolver)}(s,e),s})(n)}),"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback(((t,e,n)=>{t.getProvider("auth-internal").initialize()}))),P(new y("auth-internal",(t=>(t=>new mn(t))(Ht(t.getProvider("auth").getImmediate()))),"PRIVATE").setInstantiationMode("EXPLICIT")),B(pn,gn,function(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";default:return}}(fn)),B(pn,gn,"esm2017");const vn=document.getElementById("signin-button"),wn=document.getElementById("signout-button"),En=document.getElementById("welcome-message-container"),_n=document.getElementById("welcome-message");let bn=function(){oe(yn(),(t=>{t?(vn.style.display="none",wn.style.display="inline-block",En.removeAttribute("style"),_n.textContent="你好"+t.email):(En.style.display="none",wn.style.display="none",vn.style.display="inline-block",_n.textContent="")})),wn.addEventListener("click",(function(){(function(t){return m(t).signOut()})(yn()).then((()=>{localStorage.removeItem("studyList"),localStorage.removeItem("studyListDirty"),localStorage.removeItem("dailyDirty"),localStorage.removeItem("hourlyDirty"),localStorage.removeItem("studyResults"),localStorage.removeItem("state"),localStorage.removeItem("options"),localStorage.removeItem("exploreState"),document.location.reload()})).catch((t=>{console.log(t)}))}))};const Tn=document.getElementById("left-menu-button-container"),In=document.getElementById("right-menu-button-container"),kn=document.getElementById("left-menu-button"),Sn=document.getElementById("right-menu-button"),Cn=document.getElementById("main-app-container"),An=document.getElementById("stats-container"),xn=document.getElementById("faq-container"),Nn=document.getElementById("menu-container"),Ln=document.getElementById("explore-container"),Rn=document.getElementById("study-container"),Dn=[Cn,An,xn,Nn],Mn=[Ln,Rn],On={main:"main",study:"study",faq:"faq",stats:"stats",menu:"menu"},Pn={main:{leftButtonClass:"menu-button",rightButtonClass:"study-button",activeContainer:Cn,activePane:Ln,leftState:"menu",rightState:"study",paneAnimation:"slide-in"},study:{leftButtonClass:"menu-button",rightButtonClass:"explore-button",activeContainer:Cn,activePane:Rn,leftState:"menu",rightState:"main",paneAnimation:"slide-in"},faq:{leftButtonClass:"exit-button",activeContainer:xn,statePreserving:!0,leftState:"previous",animation:"slide-in"},stats:{leftButtonClass:"exit-button",activeContainer:An,statePreserving:!0,leftState:"main",animation:"slide-in"},menu:{leftButtonClass:"exit-button",activeContainer:Nn,statePreserving:!0,leftState:"previous",animation:"slide-in"}};let Un=null,Fn=On.main;function Vn(t){if(t===Fn)return;const e=Pn[t]||Pn[Un];for(const t of Dn)t.id!==e.activeContainer.id&&(t.style.display="none",t.dispatchEvent(new Event("hidden")));if(e.activeContainer.removeAttribute("style"),e.activeContainer.dispatchEvent(new Event("shown")),e.animation&&(e.activeContainer.classList.add(e.animation),e.activeContainer.addEventListener("animationend",(function(){e.activeContainer.classList.remove(e.animation)}),{once:!0})),e.activePane){for(const t of Mn)t.id!==e.activePane.id&&(t.style.display="none",t.dispatchEvent(new Event("hidden")));e.activePane.removeAttribute("style"),e.activePane.dispatchEvent(new Event("shown")),e.paneAnimation&&(e.activePane.classList.add(e.paneAnimation),e.activePane.addEventListener("animationend",(function(){e.activePane.classList.remove(e.paneAnimation)}),{once:!0}))}e.leftButtonClass?(kn.className=e.leftButtonClass,kn.removeAttribute("style")):kn.style.display="none",e.rightButtonClass?(Sn.className=e.rightButtonClass,Sn.removeAttribute("style")):Sn.style.display="none";let n=Un;Un=e.statePreserving?Fn:null,Fn="previous"===t?n:t}const $n={main:{element:document.getElementById("graph-container"),animation:"slide-from-right"},flow:{element:document.getElementById("flow-diagram-container"),animation:"slide-from-right"}},jn="main",Bn="flow";let qn=jn;function zn(t){if(t!==qn){for(const[e,n]of Object.entries($n))e!==t?(n.element.style.display="none",n.element.dispatchEvent(new Event("hidden"))):(n.element.removeAttribute("style"),n.element.classList.add(n.animation),n.element.addEventListener("animationend",(function(){n.element.dispatchEvent(new Event("shown-animationend")),n.element.classList.remove(n.animation)}),{once:!0}),n.element.dispatchEvent(new Event("shown")));qn=t}}var Hn,Kn="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},Wn=Wn||{},Gn=Kn||self;function Jn(){}function Xn(t){var e=typeof t;return"array"==(e="object"!=e?e:t?Array.isArray(t)?"array":e:"null")||"object"==e&&"number"==typeof t.length}function Yn(t){var e=typeof t;return"object"==e&&null!=t||"function"==e}var Qn="closure_uid_"+(1e9*Math.random()>>>0),Zn=0;function tr(t,e,n){return t.call.apply(t.bind,arguments)}function er(t,e,n){if(!t)throw Error();if(2<arguments.length){var r=Array.prototype.slice.call(arguments,2);return function(){var n=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(n,r),t.apply(e,n)}}return function(){return t.apply(e,arguments)}}function nr(t,e,n){return(nr=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?tr:er).apply(null,arguments)}function rr(t,e){var n=Array.prototype.slice.call(arguments,1);return function(){var e=n.slice();return e.push.apply(e,arguments),t.apply(this,e)}}function ir(t,e){function n(){}n.prototype=e.prototype,t.Z=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.Vb=function(t,n,r){for(var i=Array(arguments.length-2),s=2;s<arguments.length;s++)i[s-2]=arguments[s];return e.prototype[n].apply(t,i)}}function sr(){this.s=this.s,this.o=this.o}sr.prototype.s=!1,sr.prototype.na=function(){var t;!this.s&&(this.s=!0,this.M(),0)&&(t=this,Object.prototype.hasOwnProperty.call(t,Qn)&&t[Qn]||(t[Qn]=++Zn))},sr.prototype.M=function(){if(this.o)for(;this.o.length;)this.o.shift()()};const or=Array.prototype.indexOf?function(t,e){return Array.prototype.indexOf.call(t,e,void 0)}:function(t,e){if("string"==typeof t)return"string"!=typeof e||1!=e.length?-1:t.indexOf(e,0);for(let n=0;n<t.length;n++)if(n in t&&t[n]===e)return n;return-1},ar=Array.prototype.forEach?function(t,e,n){Array.prototype.forEach.call(t,e,n)}:function(t,e,n){const r=t.length,i="string"==typeof t?t.split(""):t;for(let s=0;s<r;s++)s in i&&e.call(n,i[s],s,t)};function cr(t){return Array.prototype.concat.apply([],arguments)}function lr(t){const e=t.length;if(0<e){const n=Array(e);for(let r=0;r<e;r++)n[r]=t[r];return n}return[]}function ur(t){return/^[\s\xa0]*$/.test(t)}var hr,dr=String.prototype.trim?function(t){return t.trim()}:function(t){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(t)[1]};function fr(t,e){return-1!=t.indexOf(e)}function pr(t,e){return t<e?-1:t>e?1:0}t:{var gr=Gn.navigator;if(gr){var mr=gr.userAgent;if(mr){hr=mr;break t}}hr=""}function yr(t,e,n){for(const r in t)e.call(n,t[r],r,t)}function vr(t){const e={};for(const n in t)e[n]=t[n];return e}var wr="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Er(t,e){let n,r;for(let e=1;e<arguments.length;e++){for(n in r=arguments[e],r)t[n]=r[n];for(let e=0;e<wr.length;e++)n=wr[e],Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n])}}function _r(t){return _r[" "](t),t}_r[" "]=Jn;var br,Tr,Ir=fr(hr,"Opera"),kr=fr(hr,"Trident")||fr(hr,"MSIE"),Sr=fr(hr,"Edge"),Cr=Sr||kr,Ar=fr(hr,"Gecko")&&!(fr(hr.toLowerCase(),"webkit")&&!fr(hr,"Edge"))&&!(fr(hr,"Trident")||fr(hr,"MSIE"))&&!fr(hr,"Edge"),xr=fr(hr.toLowerCase(),"webkit")&&!fr(hr,"Edge");function Nr(){var t=Gn.document;return t?t.documentMode:void 0}t:{var Lr="",Rr=(Tr=hr,Ar?/rv:([^\);]+)(\)|;)/.exec(Tr):Sr?/Edge\/([\d\.]+)/.exec(Tr):kr?/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(Tr):xr?/WebKit\/(\S+)/.exec(Tr):Ir?/(?:Version)[ \/]?(\S+)/.exec(Tr):void 0);if(Rr&&(Lr=Rr?Rr[1]:""),kr){var Dr=Nr();if(null!=Dr&&Dr>parseFloat(Lr)){br=String(Dr);break t}}br=Lr}var Mr,Or={};function Pr(){return function(t){var e=Or;return Object.prototype.hasOwnProperty.call(e,9)?e[9]:e[9]=t(9)}((function(){let t=0;const e=dr(String(br)).split("."),n=dr("9").split("."),r=Math.max(e.length,n.length);for(let o=0;0==t&&o<r;o++){var i=e[o]||"",s=n[o]||"";do{if(i=/(\d*)(\D*)(.*)/.exec(i)||["","","",""],s=/(\d*)(\D*)(.*)/.exec(s)||["","","",""],0==i[0].length&&0==s[0].length)break;t=pr(0==i[1].length?0:parseInt(i[1],10),0==s[1].length?0:parseInt(s[1],10))||pr(0==i[2].length,0==s[2].length)||pr(i[2],s[2]),i=i[3],s=s[3]}while(0==t)}return 0<=t}))}if(Gn.document&&kr){var Ur=Nr();Mr=Ur||(parseInt(br,10)||void 0)}else Mr=void 0;var Fr=Mr,Vr=function(){if(!Gn.addEventListener||!Object.defineProperty)return!1;var t=!1,e=Object.defineProperty({},"passive",{get:function(){t=!0}});try{Gn.addEventListener("test",Jn,e),Gn.removeEventListener("test",Jn,e)}catch(t){}return t}();function $r(t,e){this.type=t,this.g=this.target=e,this.defaultPrevented=!1}function jr(t,e){if($r.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var n=this.type=t.type,r=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=e,e=t.relatedTarget){if(Ar){t:{try{_r(e.nodeName);var i=!0;break t}catch(t){}i=!1}i||(e=null)}}else"mouseover"==n?e=t.fromElement:"mouseout"==n&&(e=t.toElement);this.relatedTarget=e,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==t.clientX?t.clientX:t.pageX,this.clientY=void 0!==t.clientY?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType="string"==typeof t.pointerType?t.pointerType:Br[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&jr.Z.h.call(this)}}$r.prototype.h=function(){this.defaultPrevented=!0},ir(jr,$r);var Br={2:"touch",3:"pen",4:"mouse"};jr.prototype.h=function(){jr.Z.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var qr="closure_listenable_"+(1e6*Math.random()|0),zr=0;function Hr(t,e,n,r,i){this.listener=t,this.proxy=null,this.src=e,this.type=n,this.capture=!!r,this.ia=i,this.key=++zr,this.ca=this.fa=!1}function Kr(t){t.ca=!0,t.listener=null,t.proxy=null,t.src=null,t.ia=null}function Wr(t){this.src=t,this.g={},this.h=0}function Gr(t,e){var n=e.type;if(n in t.g){var r,i=t.g[n],s=or(i,e);(r=0<=s)&&Array.prototype.splice.call(i,s,1),r&&(Kr(e),0==t.g[n].length&&(delete t.g[n],t.h--))}}function Jr(t,e,n,r){for(var i=0;i<t.length;++i){var s=t[i];if(!s.ca&&s.listener==e&&s.capture==!!n&&s.ia==r)return i}return-1}Wr.prototype.add=function(t,e,n,r,i){var s=t.toString();(t=this.g[s])||(t=this.g[s]=[],this.h++);var o=Jr(t,e,r,i);return-1<o?(e=t[o],n||(e.fa=!1)):((e=new Hr(e,this.src,s,!!r,i)).fa=n,t.push(e)),e};var Xr="closure_lm_"+(1e6*Math.random()|0),Yr={};function Qr(t,e,n,r,i){if(r&&r.once)return ti(t,e,n,r,i);if(Array.isArray(e)){for(var s=0;s<e.length;s++)Qr(t,e[s],n,r,i);return null}return n=ai(n),t&&t[qr]?t.N(e,n,Yn(r)?!!r.capture:!!r,i):Zr(t,e,n,!1,r,i)}function Zr(t,e,n,r,i,s){if(!e)throw Error("Invalid event type");var o=Yn(i)?!!i.capture:!!i,a=si(t);if(a||(t[Xr]=a=new Wr(t)),(n=a.add(e,n,r,o,s)).proxy)return n;if(r=function(){function t(n){return e.call(t.src,t.listener,n)}var e=ii;return t}(),n.proxy=r,r.src=t,r.listener=n,t.addEventListener)Vr||(i=o),void 0===i&&(i=!1),t.addEventListener(e.toString(),r,i);else if(t.attachEvent)t.attachEvent(ri(e.toString()),r);else{if(!t.addListener||!t.removeListener)throw Error("addEventListener and attachEvent are unavailable.");t.addListener(r)}return n}function ti(t,e,n,r,i){if(Array.isArray(e)){for(var s=0;s<e.length;s++)ti(t,e[s],n,r,i);return null}return n=ai(n),t&&t[qr]?t.O(e,n,Yn(r)?!!r.capture:!!r,i):Zr(t,e,n,!0,r,i)}function ei(t,e,n,r,i){if(Array.isArray(e))for(var s=0;s<e.length;s++)ei(t,e[s],n,r,i);else r=Yn(r)?!!r.capture:!!r,n=ai(n),t&&t[qr]?(t=t.i,(e=String(e).toString())in t.g&&(-1<(n=Jr(s=t.g[e],n,r,i))&&(Kr(s[n]),Array.prototype.splice.call(s,n,1),0==s.length&&(delete t.g[e],t.h--)))):t&&(t=si(t))&&(e=t.g[e.toString()],t=-1,e&&(t=Jr(e,n,r,i)),(n=-1<t?e[t]:null)&&ni(n))}function ni(t){if("number"!=typeof t&&t&&!t.ca){var e=t.src;if(e&&e[qr])Gr(e.i,t);else{var n=t.type,r=t.proxy;e.removeEventListener?e.removeEventListener(n,r,t.capture):e.detachEvent?e.detachEvent(ri(n),r):e.addListener&&e.removeListener&&e.removeListener(r),(n=si(e))?(Gr(n,t),0==n.h&&(n.src=null,e[Xr]=null)):Kr(t)}}}function ri(t){return t in Yr?Yr[t]:Yr[t]="on"+t}function ii(t,e){if(t.ca)t=!0;else{e=new jr(e,this);var n=t.listener,r=t.ia||t.src;t.fa&&ni(t),t=n.call(r,e)}return t}function si(t){return(t=t[Xr])instanceof Wr?t:null}var oi="__closure_events_fn_"+(1e9*Math.random()>>>0);function ai(t){return"function"==typeof t?t:(t[oi]||(t[oi]=function(e){return t.handleEvent(e)}),t[oi])}function ci(){sr.call(this),this.i=new Wr(this),this.P=this,this.I=null}function li(t,e){var n,r=t.I;if(r)for(n=[];r;r=r.I)n.push(r);if(t=t.P,r=e.type||e,"string"==typeof e)e=new $r(e,t);else if(e instanceof $r)e.target=e.target||t;else{var i=e;Er(e=new $r(r,t),i)}if(i=!0,n)for(var s=n.length-1;0<=s;s--){var o=e.g=n[s];i=ui(o,r,!0,e)&&i}if(i=ui(o=e.g=t,r,!0,e)&&i,i=ui(o,r,!1,e)&&i,n)for(s=0;s<n.length;s++)i=ui(o=e.g=n[s],r,!1,e)&&i}function ui(t,e,n,r){if(!(e=t.i.g[String(e)]))return!0;e=e.concat();for(var i=!0,s=0;s<e.length;++s){var o=e[s];if(o&&!o.ca&&o.capture==n){var a=o.listener,c=o.ia||o.src;o.fa&&Gr(t.i,o),i=!1!==a.call(c,r)&&i}}return i&&!r.defaultPrevented}ir(ci,sr),ci.prototype[qr]=!0,ci.prototype.removeEventListener=function(t,e,n,r){ei(this,t,e,n,r)},ci.prototype.M=function(){if(ci.Z.M.call(this),this.i){var t,e=this.i;for(t in e.g){for(var n=e.g[t],r=0;r<n.length;r++)Kr(n[r]);delete e.g[t],e.h--}}this.I=null},ci.prototype.N=function(t,e,n,r){return this.i.add(String(t),e,!1,n,r)},ci.prototype.O=function(t,e,n,r){return this.i.add(String(t),e,!0,n,r)};var hi=Gn.JSON.stringify;function di(){var t=wi;let e=null;return t.g&&(e=t.g,t.g=t.g.next,t.g||(t.h=null),e.next=null),e}var fi,pi=new class{constructor(t,e){this.i=t,this.j=e,this.h=0,this.g=null}get(){let t;return 0<this.h?(this.h--,t=this.g,this.g=t.next,t.next=null):t=this.i(),t}}((()=>new gi),(t=>t.reset()));class gi{constructor(){this.next=this.g=this.h=null}set(t,e){this.h=t,this.g=e,this.next=null}reset(){this.next=this.g=this.h=null}}function mi(t){Gn.setTimeout((()=>{throw t}),0)}function yi(t,e){fi||function(){var t=Gn.Promise.resolve(void 0);fi=function(){t.then(Ei)}}(),vi||(fi(),vi=!0),wi.add(t,e)}var vi=!1,wi=new class{constructor(){this.h=this.g=null}add(t,e){const n=pi.get();n.set(t,e),this.h?this.h.next=n:this.g=n,this.h=n}};function Ei(){for(var t;t=di();){try{t.h.call(t.g)}catch(t){mi(t)}var e=pi;e.j(t),100>e.h&&(e.h++,t.next=e.g,e.g=t)}vi=!1}function _i(t,e){ci.call(this),this.h=t||1,this.g=e||Gn,this.j=nr(this.kb,this),this.l=Date.now()}function bi(t){t.da=!1,t.S&&(t.g.clearTimeout(t.S),t.S=null)}function Ti(t,e,n){if("function"==typeof t)n&&(t=nr(t,n));else{if(!t||"function"!=typeof t.handleEvent)throw Error("Invalid listener argument");t=nr(t.handleEvent,t)}return 2147483647<Number(e)?-1:Gn.setTimeout(t,e||0)}function Ii(t){t.g=Ti((()=>{t.g=null,t.i&&(t.i=!1,Ii(t))}),t.j);const e=t.h;t.h=null,t.m.apply(null,e)}ir(_i,ci),(Hn=_i.prototype).da=!1,Hn.S=null,Hn.kb=function(){if(this.da){var t=Date.now()-this.l;0<t&&t<.8*this.h?this.S=this.g.setTimeout(this.j,this.h-t):(this.S&&(this.g.clearTimeout(this.S),this.S=null),li(this,"tick"),this.da&&(bi(this),this.start()))}},Hn.start=function(){this.da=!0,this.S||(this.S=this.g.setTimeout(this.j,this.h),this.l=Date.now())},Hn.M=function(){_i.Z.M.call(this),bi(this),delete this.g};class ki extends sr{constructor(t,e){super(),this.m=t,this.j=e,this.h=null,this.i=!1,this.g=null}l(t){this.h=arguments,this.g?this.i=!0:Ii(this)}M(){super.M(),this.g&&(Gn.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Si(t){sr.call(this),this.h=t,this.g={}}ir(Si,sr);var Ci=[];function Ai(t,e,n,r){Array.isArray(n)||(n&&(Ci[0]=n.toString()),n=Ci);for(var i=0;i<n.length;i++){var s=Qr(e,n[i],r||t.handleEvent,!1,t.h||t);if(!s)break;t.g[s.key]=s}}function xi(t){yr(t.g,(function(t,e){this.g.hasOwnProperty(e)&&ni(t)}),t),t.g={}}function Ni(){this.g=!0}function Li(t,e,n,r){t.info((function(){return"XMLHTTP TEXT ("+e+"): "+function(t,e){if(!t.g)return e;if(!e)return null;try{var n=JSON.parse(e);if(n)for(t=0;t<n.length;t++)if(Array.isArray(n[t])){var r=n[t];if(!(2>r.length)){var i=r[1];if(Array.isArray(i)&&!(1>i.length)){var s=i[0];if("noop"!=s&&"stop"!=s&&"close"!=s)for(var o=1;o<i.length;o++)i[o]=""}}}return hi(n)}catch(t){return e}}(t,n)+(r?" "+r:"")}))}Si.prototype.M=function(){Si.Z.M.call(this),xi(this)},Si.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")},Ni.prototype.Aa=function(){this.g=!1},Ni.prototype.info=function(){};var Ri={},Di=null;function Mi(){return Di=Di||new ci}function Oi(t){$r.call(this,Ri.Ma,t)}function Pi(t){const e=Mi();li(e,new Oi(e))}function Ui(t,e){$r.call(this,Ri.STAT_EVENT,t),this.stat=e}function Fi(t){const e=Mi();li(e,new Ui(e,t))}function Vi(t,e){$r.call(this,Ri.Na,t),this.size=e}function $i(t,e){if("function"!=typeof t)throw Error("Fn must not be null and must be a function");return Gn.setTimeout((function(){t()}),e)}Ri.Ma="serverreachability",ir(Oi,$r),Ri.STAT_EVENT="statevent",ir(Ui,$r),Ri.Na="timingevent",ir(Vi,$r);var ji={NO_ERROR:0,lb:1,yb:2,xb:3,sb:4,wb:5,zb:6,Ja:7,TIMEOUT:8,Cb:9},Bi={qb:"complete",Mb:"success",Ka:"error",Ja:"abort",Eb:"ready",Fb:"readystatechange",TIMEOUT:"timeout",Ab:"incrementaldata",Db:"progress",tb:"downloadprogress",Ub:"uploadprogress"};function qi(){}function zi(t){return t.h||(t.h=t.i())}function Hi(){}qi.prototype.h=null;var Ki,Wi={OPEN:"a",pb:"b",Ka:"c",Bb:"d"};function Gi(){$r.call(this,"d")}function Ji(){$r.call(this,"c")}function Xi(){}function Yi(t,e,n,r){this.l=t,this.j=e,this.m=n,this.X=r||1,this.V=new Si(this),this.P=Zi,t=Cr?125:void 0,this.W=new _i(t),this.H=null,this.i=!1,this.s=this.A=this.v=this.K=this.F=this.Y=this.B=null,this.D=[],this.g=null,this.C=0,this.o=this.u=null,this.N=-1,this.I=!1,this.O=0,this.L=null,this.aa=this.J=this.$=this.U=!1,this.h=new Qi}function Qi(){this.i=null,this.g="",this.h=!1}ir(Gi,$r),ir(Ji,$r),ir(Xi,qi),Xi.prototype.g=function(){return new XMLHttpRequest},Xi.prototype.i=function(){return{}},Ki=new Xi;var Zi=45e3,ts={},es={};function ns(t,e,n){t.K=1,t.v=ks(ws(e)),t.s=n,t.U=!0,rs(t,null)}function rs(t,e){t.F=Date.now(),as(t),t.A=ws(t.v);var n=t.A,r=t.X;Array.isArray(r)||(r=[String(r)]),Fs(n.h,"t",r),t.C=0,n=t.l.H,t.h=new Qi,t.g=$o(t.l,n?e:null,!t.s),0<t.O&&(t.L=new ki(nr(t.Ia,t,t.g),t.O)),Ai(t.V,t.g,"readystatechange",t.gb),e=t.H?vr(t.H):{},t.s?(t.u||(t.u="POST"),e["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.A,t.u,t.s,e)):(t.u="GET",t.g.ea(t.A,t.u,null,e)),Pi(),function(t,e,n,r,i,s){t.info((function(){if(t.g)if(s)for(var o="",a=s.split("&"),c=0;c<a.length;c++){var l=a[c].split("=");if(1<l.length){var u=l[0];l=l[1];var h=u.split("_");o=2<=h.length&&"type"==h[1]?o+(u+"=")+l+"&":o+(u+"=redacted&")}}else o=null;else o=s;return"XMLHTTP REQ ("+r+") [attempt "+i+"]: "+e+"\n"+n+"\n"+o}))}(t.j,t.u,t.A,t.m,t.X,t.s)}function is(t){return!!t.g&&("GET"==t.u&&2!=t.K&&t.l.Ba)}function ss(t,e,n){let r,i=!0;for(;!t.I&&t.C<n.length;){if(r=os(t,n),r==es){4==e&&(t.o=4,Fi(14),i=!1),Li(t.j,t.m,null,"[Incomplete Response]");break}if(r==ts){t.o=4,Fi(15),Li(t.j,t.m,n,"[Invalid Chunk]"),i=!1;break}Li(t.j,t.m,r,null),ds(t,r)}is(t)&&r!=es&&r!=ts&&(t.h.g="",t.C=0),4!=e||0!=n.length||t.h.h||(t.o=1,Fi(16),i=!1),t.i=t.i&&i,i?0<n.length&&!t.aa&&(t.aa=!0,(e=t.l).g==t&&e.$&&!e.L&&(e.h.info("Great, no buffering proxy detected. Bytes received: "+n.length),Ro(e),e.L=!0,Fi(11))):(Li(t.j,t.m,n,"[Invalid Chunked Response]"),hs(t),us(t))}function os(t,e){var n=t.C,r=e.indexOf("\n",n);return-1==r?es:(n=Number(e.substring(n,r)),isNaN(n)?ts:(r+=1)+n>e.length?es:(e=e.substr(r,n),t.C=r+n,e))}function as(t){t.Y=Date.now()+t.P,cs(t,t.P)}function cs(t,e){if(null!=t.B)throw Error("WatchDog timer not null");t.B=$i(nr(t.eb,t),e)}function ls(t){t.B&&(Gn.clearTimeout(t.B),t.B=null)}function us(t){0==t.l.G||t.I||Oo(t.l,t)}function hs(t){ls(t);var e=t.L;e&&"function"==typeof e.na&&e.na(),t.L=null,bi(t.W),xi(t.V),t.g&&(e=t.g,t.g=null,e.abort(),e.na())}function ds(t,e){try{var n=t.l;if(0!=n.G&&(n.g==t||Hs(n.i,t)))if(n.I=t.N,!t.J&&Hs(n.i,t)&&3==n.G){try{var r=n.Ca.g.parse(e)}catch(t){r=null}if(Array.isArray(r)&&3==r.length){var i=r;if(0==i[0]){t:if(!n.u){if(n.g){if(!(n.g.F+3e3<t.F))break t;Mo(n),To(n)}Lo(n),Fi(18)}}else n.ta=i[1],0<n.ta-n.U&&37500>i[2]&&n.N&&0==n.A&&!n.v&&(n.v=$i(nr(n.ab,n),6e3));if(1>=zs(n.i)&&n.ka){try{n.ka()}catch(t){}n.ka=void 0}}else Uo(n,11)}else if((t.J||n.g==t)&&Mo(n),!ur(e))for(i=n.Ca.g.parse(e),e=0;e<i.length;e++){let l=i[e];if(n.U=l[0],l=l[1],2==n.G)if("c"==l[0]){n.J=l[1],n.la=l[2];const e=l[3];null!=e&&(n.ma=e,n.h.info("VER="+n.ma));const i=l[4];null!=i&&(n.za=i,n.h.info("SVER="+n.za));const u=l[5];null!=u&&"number"==typeof u&&0<u&&(r=1.5*u,n.K=r,n.h.info("backChannelRequestTimeoutMs_="+r)),r=n;const h=t.g;if(h){const t=h.g?h.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(t){var s=r.i;!s.g&&(fr(t,"spdy")||fr(t,"quic")||fr(t,"h2"))&&(s.j=s.l,s.g=new Set,s.h&&(Ks(s,s.h),s.h=null))}if(r.D){const t=h.g?h.g.getResponseHeader("X-HTTP-Session-Id"):null;t&&(r.sa=t,Is(r.F,r.D,t))}}n.G=3,n.j&&n.j.xa(),n.$&&(n.O=Date.now()-t.F,n.h.info("Handshake RTT: "+n.O+"ms"));var o=t;if((r=n).oa=Vo(r,r.H?r.la:null,r.W),o.J){Ws(r.i,o);var a=o,c=r.K;c&&a.setTimeout(c),a.B&&(ls(a),as(a)),r.g=o}else No(r);0<n.l.length&&So(n)}else"stop"!=l[0]&&"close"!=l[0]||Uo(n,7);else 3==n.G&&("stop"==l[0]||"close"==l[0]?"stop"==l[0]?Uo(n,7):bo(n):"noop"!=l[0]&&n.j&&n.j.wa(l),n.A=0)}Pi()}catch(t){}}function fs(t,e){if(t.forEach&&"function"==typeof t.forEach)t.forEach(e,void 0);else if(Xn(t)||"string"==typeof t)ar(t,e,void 0);else{if(t.T&&"function"==typeof t.T)var n=t.T();else if(t.R&&"function"==typeof t.R)n=void 0;else if(Xn(t)||"string"==typeof t){n=[];for(var r=t.length,i=0;i<r;i++)n.push(i)}else for(i in n=[],r=0,t)n[r++]=i;r=function(t){if(t.R&&"function"==typeof t.R)return t.R();if("string"==typeof t)return t.split("");if(Xn(t)){for(var e=[],n=t.length,r=0;r<n;r++)e.push(t[r]);return e}for(r in e=[],n=0,t)e[n++]=t[r];return e}(t),i=r.length;for(var s=0;s<i;s++)e.call(void 0,r[s],n&&n[s],t)}}function ps(t,e){this.h={},this.g=[],this.i=0;var n=arguments.length;if(1<n){if(n%2)throw Error("Uneven number of arguments");for(var r=0;r<n;r+=2)this.set(arguments[r],arguments[r+1])}else if(t)if(t instanceof ps)for(n=t.T(),r=0;r<n.length;r++)this.set(n[r],t.get(n[r]));else for(r in t)this.set(r,t[r])}function gs(t){if(t.i!=t.g.length){for(var e=0,n=0;e<t.g.length;){var r=t.g[e];ms(t.h,r)&&(t.g[n++]=r),e++}t.g.length=n}if(t.i!=t.g.length){var i={};for(n=e=0;e<t.g.length;)ms(i,r=t.g[e])||(t.g[n++]=r,i[r]=1),e++;t.g.length=n}}function ms(t,e){return Object.prototype.hasOwnProperty.call(t,e)}(Hn=Yi.prototype).setTimeout=function(t){this.P=t},Hn.gb=function(t){t=t.target;const e=this.L;e&&3==yo(t)?e.l():this.Ia(t)},Hn.Ia=function(t){try{if(t==this.g)t:{const u=yo(this.g);var e=this.g.Da();this.g.ba();if(!(3>u)&&(3!=u||Cr||this.g&&(this.h.h||this.g.ga()||vo(this.g)))){this.I||4!=u||7==e||Pi(),ls(this);var n=this.g.ba();this.N=n;e:if(is(this)){var r=vo(this.g);t="";var i=r.length,s=4==yo(this.g);if(!this.h.i){if("undefined"==typeof TextDecoder){hs(this),us(this);var o="";break e}this.h.i=new Gn.TextDecoder}for(e=0;e<i;e++)this.h.h=!0,t+=this.h.i.decode(r[e],{stream:s&&e==i-1});r.splice(0,i),this.h.g+=t,this.C=0,o=this.h.g}else o=this.g.ga();if(this.i=200==n,function(t,e,n,r,i,s,o){t.info((function(){return"XMLHTTP RESP ("+r+") [ attempt "+i+"]: "+e+"\n"+n+"\n"+s+" "+o}))}(this.j,this.u,this.A,this.m,this.X,u,n),this.i){if(this.$&&!this.J){e:{if(this.g){var a,c=this.g;if((a=c.g?c.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!ur(a)){var l=a;break e}}l=null}if(!(n=l)){this.i=!1,this.o=3,Fi(12),hs(this),us(this);break t}Li(this.j,this.m,n,"Initial handshake response via X-HTTP-Initial-Response"),this.J=!0,ds(this,n)}this.U?(ss(this,u,o),Cr&&this.i&&3==u&&(Ai(this.V,this.W,"tick",this.fb),this.W.start())):(Li(this.j,this.m,o,null),ds(this,o)),4==u&&hs(this),this.i&&!this.I&&(4==u?Oo(this.l,this):(this.i=!1,as(this)))}else 400==n&&0<o.indexOf("Unknown SID")?(this.o=3,Fi(12)):(this.o=0,Fi(13)),hs(this),us(this)}}}catch(t){}},Hn.fb=function(){if(this.g){var t=yo(this.g),e=this.g.ga();this.C<e.length&&(ls(this),ss(this,t,e),this.i&&4!=t&&as(this))}},Hn.cancel=function(){this.I=!0,hs(this)},Hn.eb=function(){this.B=null;const t=Date.now();0<=t-this.Y?(function(t,e){t.info((function(){return"TIMEOUT: "+e}))}(this.j,this.A),2!=this.K&&(Pi(),Fi(17)),hs(this),this.o=2,us(this)):cs(this,this.Y-t)},(Hn=ps.prototype).R=function(){gs(this);for(var t=[],e=0;e<this.g.length;e++)t.push(this.h[this.g[e]]);return t},Hn.T=function(){return gs(this),this.g.concat()},Hn.get=function(t,e){return ms(this.h,t)?this.h[t]:e},Hn.set=function(t,e){ms(this.h,t)||(this.i++,this.g.push(t)),this.h[t]=e},Hn.forEach=function(t,e){for(var n=this.T(),r=0;r<n.length;r++){var i=n[r],s=this.get(i);t.call(e,s,i,this)}};var ys=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function vs(t,e){if(this.i=this.s=this.j="",this.m=null,this.o=this.l="",this.g=!1,t instanceof vs){this.g=void 0!==e?e:t.g,Es(this,t.j),this.s=t.s,_s(this,t.i),bs(this,t.m),this.l=t.l,e=t.h;var n=new Ms;n.i=e.i,e.g&&(n.g=new ps(e.g),n.h=e.h),Ts(this,n),this.o=t.o}else t&&(n=String(t).match(ys))?(this.g=!!e,Es(this,n[1]||"",!0),this.s=Ss(n[2]||""),_s(this,n[3]||"",!0),bs(this,n[4]),this.l=Ss(n[5]||"",!0),Ts(this,n[6]||"",!0),this.o=Ss(n[7]||"")):(this.g=!!e,this.h=new Ms(null,this.g))}function ws(t){return new vs(t)}function Es(t,e,n){t.j=n?Ss(e,!0):e,t.j&&(t.j=t.j.replace(/:$/,""))}function _s(t,e,n){t.i=n?Ss(e,!0):e}function bs(t,e){if(e){if(e=Number(e),isNaN(e)||0>e)throw Error("Bad port number "+e);t.m=e}else t.m=null}function Ts(t,e,n){e instanceof Ms?(t.h=e,function(t,e){e&&!t.j&&(Os(t),t.i=null,t.g.forEach((function(t,e){var n=e.toLowerCase();e!=n&&(Ps(this,e),Fs(this,n,t))}),t)),t.j=e}(t.h,t.g)):(n||(e=Cs(e,Rs)),t.h=new Ms(e,t.g))}function Is(t,e,n){t.h.set(e,n)}function ks(t){return Is(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function Ss(t,e){return t?e?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Cs(t,e,n){return"string"==typeof t?(t=encodeURI(t).replace(e,As),n&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function As(t){return"%"+((t=t.charCodeAt(0))>>4&15).toString(16)+(15&t).toString(16)}vs.prototype.toString=function(){var t=[],e=this.j;e&&t.push(Cs(e,xs,!0),":");var n=this.i;return(n||"file"==e)&&(t.push("//"),(e=this.s)&&t.push(Cs(e,xs,!0),"@"),t.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.m)&&t.push(":",String(n))),(n=this.l)&&(this.i&&"/"!=n.charAt(0)&&t.push("/"),t.push(Cs(n,"/"==n.charAt(0)?Ls:Ns,!0))),(n=this.h.toString())&&t.push("?",n),(n=this.o)&&t.push("#",Cs(n,Ds)),t.join("")};var xs=/[#\/\?@]/g,Ns=/[#\?:]/g,Ls=/[#\?]/g,Rs=/[#\?@]/g,Ds=/#/g;function Ms(t,e){this.h=this.g=null,this.i=t||null,this.j=!!e}function Os(t){t.g||(t.g=new ps,t.h=0,t.i&&function(t,e){if(t){t=t.split("&");for(var n=0;n<t.length;n++){var r=t[n].indexOf("="),i=null;if(0<=r){var s=t[n].substring(0,r);i=t[n].substring(r+1)}else s=t[n];e(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}(t.i,(function(e,n){t.add(decodeURIComponent(e.replace(/\+/g," ")),n)})))}function Ps(t,e){Os(t),e=Vs(t,e),ms(t.g.h,e)&&(t.i=null,t.h-=t.g.get(e).length,ms((t=t.g).h,e)&&(delete t.h[e],t.i--,t.g.length>2*t.i&&gs(t)))}function Us(t,e){return Os(t),e=Vs(t,e),ms(t.g.h,e)}function Fs(t,e,n){Ps(t,e),0<n.length&&(t.i=null,t.g.set(Vs(t,e),lr(n)),t.h+=n.length)}function Vs(t,e){return e=String(e),t.j&&(e=e.toLowerCase()),e}(Hn=Ms.prototype).add=function(t,e){Os(this),this.i=null,t=Vs(this,t);var n=this.g.get(t);return n||this.g.set(t,n=[]),n.push(e),this.h+=1,this},Hn.forEach=function(t,e){Os(this),this.g.forEach((function(n,r){ar(n,(function(n){t.call(e,n,r,this)}),this)}),this)},Hn.T=function(){Os(this);for(var t=this.g.R(),e=this.g.T(),n=[],r=0;r<e.length;r++)for(var i=t[r],s=0;s<i.length;s++)n.push(e[r]);return n},Hn.R=function(t){Os(this);var e=[];if("string"==typeof t)Us(this,t)&&(e=cr(e,this.g.get(Vs(this,t))));else{t=this.g.R();for(var n=0;n<t.length;n++)e=cr(e,t[n])}return e},Hn.set=function(t,e){return Os(this),this.i=null,Us(this,t=Vs(this,t))&&(this.h-=this.g.get(t).length),this.g.set(t,[e]),this.h+=1,this},Hn.get=function(t,e){return t&&0<(t=this.R(t)).length?String(t[0]):e},Hn.toString=function(){if(this.i)return this.i;if(!this.g)return"";for(var t=[],e=this.g.T(),n=0;n<e.length;n++){var r=e[n],i=encodeURIComponent(String(r));r=this.R(r);for(var s=0;s<r.length;s++){var o=i;""!==r[s]&&(o+="="+encodeURIComponent(String(r[s]))),t.push(o)}}return this.i=t.join("&")};var $s=class{constructor(t,e){this.h=t,this.g=e}};function js(t){this.l=t||Bs,Gn.PerformanceNavigationTiming?t=0<(t=Gn.performance.getEntriesByType("navigation")).length&&("hq"==t[0].nextHopProtocol||"h2"==t[0].nextHopProtocol):t=!!(Gn.g&&Gn.g.Ea&&Gn.g.Ea()&&Gn.g.Ea().Zb),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}var Bs=10;function qs(t){return!!t.h||!!t.g&&t.g.size>=t.j}function zs(t){return t.h?1:t.g?t.g.size:0}function Hs(t,e){return t.h?t.h==e:!!t.g&&t.g.has(e)}function Ks(t,e){t.g?t.g.add(e):t.h=e}function Ws(t,e){t.h&&t.h==e?t.h=null:t.g&&t.g.has(e)&&t.g.delete(e)}function Gs(t){if(null!=t.h)return t.i.concat(t.h.D);if(null!=t.g&&0!==t.g.size){let e=t.i;for(const n of t.g.values())e=e.concat(n.D);return e}return lr(t.i)}function Js(){}function Xs(){this.g=new Js}function Ys(t,e,n){const r=n||"";try{fs(t,(function(t,n){let i=t;Yn(t)&&(i=hi(t)),e.push(r+n+"="+encodeURIComponent(i))}))}catch(t){throw e.push(r+"type="+encodeURIComponent("_badmap")),t}}function Qs(t,e,n,r,i){try{e.onload=null,e.onerror=null,e.onabort=null,e.ontimeout=null,i(r)}catch(t){}}function Zs(t){this.l=t.$b||null,this.j=t.ib||!1}function to(t,e){ci.call(this),this.D=t,this.u=e,this.m=void 0,this.readyState=eo,this.status=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.v=new Headers,this.h=null,this.C="GET",this.B="",this.g=!1,this.A=this.j=this.l=null}js.prototype.cancel=function(){if(this.i=Gs(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const t of this.g.values())t.cancel();this.g.clear()}},Js.prototype.stringify=function(t){return Gn.JSON.stringify(t,void 0)},Js.prototype.parse=function(t){return Gn.JSON.parse(t,void 0)},ir(Zs,qi),Zs.prototype.g=function(){return new to(this.l,this.j)},Zs.prototype.i=function(t){return function(){return t}}({}),ir(to,ci);var eo=0;function no(t){t.j.read().then(t.Sa.bind(t)).catch(t.ha.bind(t))}function ro(t){t.readyState=4,t.l=null,t.j=null,t.A=null,io(t)}function io(t){t.onreadystatechange&&t.onreadystatechange.call(t)}(Hn=to.prototype).open=function(t,e){if(this.readyState!=eo)throw this.abort(),Error("Error reopening a connection");this.C=t,this.B=e,this.readyState=1,io(this)},Hn.send=function(t){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const e={headers:this.v,method:this.C,credentials:this.m,cache:void 0};t&&(e.body=t),(this.D||Gn).fetch(new Request(this.B,e)).then(this.Va.bind(this),this.ha.bind(this))},Hn.abort=function(){this.response=this.responseText="",this.v=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted."),1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,ro(this)),this.readyState=eo},Hn.Va=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,io(this)),this.g&&(this.readyState=3,io(this),this.g)))if("arraybuffer"===this.responseType)t.arrayBuffer().then(this.Ta.bind(this),this.ha.bind(this));else if(void 0!==Gn.ReadableStream&&"body"in t){if(this.j=t.body.getReader(),this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.A=new TextDecoder;no(this)}else t.text().then(this.Ua.bind(this),this.ha.bind(this))},Hn.Sa=function(t){if(this.g){if(this.u&&t.value)this.response.push(t.value);else if(!this.u){var e=t.value?t.value:new Uint8Array(0);(e=this.A.decode(e,{stream:!t.done}))&&(this.response=this.responseText+=e)}t.done?ro(this):io(this),3==this.readyState&&no(this)}},Hn.Ua=function(t){this.g&&(this.response=this.responseText=t,ro(this))},Hn.Ta=function(t){this.g&&(this.response=t,ro(this))},Hn.ha=function(){this.g&&ro(this)},Hn.setRequestHeader=function(t,e){this.v.append(t,e)},Hn.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},Hn.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],e=this.h.entries();for(var n=e.next();!n.done;)n=n.value,t.push(n[0]+": "+n[1]),n=e.next();return t.join("\r\n")},Object.defineProperty(to.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(t){this.m=t?"include":"same-origin"}});var so=Gn.JSON.parse;function oo(t){ci.call(this),this.headers=new ps,this.u=t||null,this.h=!1,this.C=this.g=null,this.H="",this.m=0,this.j="",this.l=this.F=this.v=this.D=!1,this.B=0,this.A=null,this.J=ao,this.K=this.L=!1}ir(oo,ci);var ao="",co=/^https?$/i,lo=["POST","PUT"];function uo(t){return"content-type"==t.toLowerCase()}function ho(t,e){t.h=!1,t.g&&(t.l=!0,t.g.abort(),t.l=!1),t.j=e,t.m=5,fo(t),go(t)}function fo(t){t.D||(t.D=!0,li(t,"complete"),li(t,"error"))}function po(t){if(t.h&&void 0!==Wn&&(!t.C[1]||4!=yo(t)||2!=t.ba()))if(t.v&&4==yo(t))Ti(t.Fa,0,t);else if(li(t,"readystatechange"),4==yo(t)){t.h=!1;try{const a=t.ba();t:switch(a){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break t;default:e=!1}var n;if(!(n=e)){var r;if(r=0===a){var i=String(t.H).match(ys)[1]||null;if(!i&&Gn.self&&Gn.self.location){var s=Gn.self.location.protocol;i=s.substr(0,s.length-1)}r=!co.test(i?i.toLowerCase():"")}n=r}if(n)li(t,"complete"),li(t,"success");else{t.m=6;try{var o=2<yo(t)?t.g.statusText:""}catch(t){o=""}t.j=o+" ["+t.ba()+"]",fo(t)}}finally{go(t)}}}function go(t,e){if(t.g){mo(t);const n=t.g,r=t.C[0]?Jn:null;t.g=null,t.C=null,e||li(t,"ready");try{n.onreadystatechange=r}catch(t){}}}function mo(t){t.g&&t.K&&(t.g.ontimeout=null),t.A&&(Gn.clearTimeout(t.A),t.A=null)}function yo(t){return t.g?t.g.readyState:0}function vo(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.J){case ao:case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch(t){return null}}function wo(t,e,n){t:{for(r in n){var r=!1;break t}r=!0}r||(n=function(t){let e="";return yr(t,(function(t,n){e+=n,e+=":",e+=t,e+="\r\n"})),e}(n),"string"==typeof t?null!=n&&encodeURIComponent(String(n)):Is(t,e,n))}function Eo(t,e,n){return n&&n.internalChannelParams&&n.internalChannelParams[t]||e}function _o(t){this.za=0,this.l=[],this.h=new Ni,this.la=this.oa=this.F=this.W=this.g=this.sa=this.D=this.aa=this.o=this.P=this.s=null,this.Za=this.V=0,this.Xa=Eo("failFast",!1,t),this.N=this.v=this.u=this.m=this.j=null,this.X=!0,this.I=this.ta=this.U=-1,this.Y=this.A=this.C=0,this.Pa=Eo("baseRetryDelayMs",5e3,t),this.$a=Eo("retryDelaySeedMs",1e4,t),this.Ya=Eo("forwardChannelMaxRetries",2,t),this.ra=Eo("forwardChannelRequestTimeoutMs",2e4,t),this.qa=t&&t.xmlHttpFactory||void 0,this.Ba=t&&t.Yb||!1,this.K=void 0,this.H=t&&t.supportsCrossDomainXhr||!1,this.J="",this.i=new js(t&&t.concurrentRequestLimit),this.Ca=new Xs,this.ja=t&&t.fastHandshake||!1,this.Ra=t&&t.Wb||!1,t&&t.Aa&&this.h.Aa(),t&&t.forceLongPolling&&(this.X=!1),this.$=!this.ja&&this.X&&t&&t.detectBufferingProxy||!1,this.ka=void 0,this.O=0,this.L=!1,this.B=null,this.Wa=!t||!1!==t.Xb}function bo(t){if(Io(t),3==t.G){var e=t.V++,n=ws(t.F);Is(n,"SID",t.J),Is(n,"RID",e),Is(n,"TYPE","terminate"),Ao(t,n),(e=new Yi(t,t.h,e,void 0)).K=2,e.v=ks(ws(n)),n=!1,Gn.navigator&&Gn.navigator.sendBeacon&&(n=Gn.navigator.sendBeacon(e.v.toString(),"")),!n&&Gn.Image&&((new Image).src=e.v,n=!0),n||(e.g=$o(e.l,null),e.g.ea(e.v)),e.F=Date.now(),as(e)}Fo(t)}function To(t){t.g&&(Ro(t),t.g.cancel(),t.g=null)}function Io(t){To(t),t.u&&(Gn.clearTimeout(t.u),t.u=null),Mo(t),t.i.cancel(),t.m&&("number"==typeof t.m&&Gn.clearTimeout(t.m),t.m=null)}function ko(t,e){t.l.push(new $s(t.Za++,e)),3==t.G&&So(t)}function So(t){qs(t.i)||t.m||(t.m=!0,yi(t.Ha,t),t.C=0)}function Co(t,e){var n;n=e?e.m:t.V++;const r=ws(t.F);Is(r,"SID",t.J),Is(r,"RID",n),Is(r,"AID",t.U),Ao(t,r),t.o&&t.s&&wo(r,t.o,t.s),n=new Yi(t,t.h,n,t.C+1),null===t.o&&(n.H=t.s),e&&(t.l=e.D.concat(t.l)),e=xo(t,n,1e3),n.setTimeout(Math.round(.5*t.ra)+Math.round(.5*t.ra*Math.random())),Ks(t.i,n),ns(n,r,e)}function Ao(t,e){t.j&&fs({},(function(t,n){Is(e,n,t)}))}function xo(t,e,n){n=Math.min(t.l.length,n);var r=t.j?nr(t.j.Oa,t.j,t):null;t:{var i=t.l;let e=-1;for(;;){const t=["count="+n];-1==e?0<n?(e=i[0].h,t.push("ofs="+e)):e=0:t.push("ofs="+e);let s=!0;for(let o=0;o<n;o++){let n=i[o].h;const a=i[o].g;if(n-=e,0>n)e=Math.max(0,i[o].h-100),s=!1;else try{Ys(a,t,"req"+n+"_")}catch(t){r&&r(a)}}if(s){r=t.join("&");break t}}}return t=t.l.splice(0,n),e.D=t,r}function No(t){t.g||t.u||(t.Y=1,yi(t.Ga,t),t.A=0)}function Lo(t){return!(t.g||t.u||3<=t.A)&&(t.Y++,t.u=$i(nr(t.Ga,t),Po(t,t.A)),t.A++,!0)}function Ro(t){null!=t.B&&(Gn.clearTimeout(t.B),t.B=null)}function Do(t){t.g=new Yi(t,t.h,"rpc",t.Y),null===t.o&&(t.g.H=t.s),t.g.O=0;var e=ws(t.oa);Is(e,"RID","rpc"),Is(e,"SID",t.J),Is(e,"CI",t.N?"0":"1"),Is(e,"AID",t.U),Ao(t,e),Is(e,"TYPE","xmlhttp"),t.o&&t.s&&wo(e,t.o,t.s),t.K&&t.g.setTimeout(t.K);var n=t.g;t=t.la,n.K=1,n.v=ks(ws(e)),n.s=null,n.U=!0,rs(n,t)}function Mo(t){null!=t.v&&(Gn.clearTimeout(t.v),t.v=null)}function Oo(t,e){var n=null;if(t.g==e){Mo(t),Ro(t),t.g=null;var r=2}else{if(!Hs(t.i,e))return;n=e.D,Ws(t.i,e),r=1}if(t.I=e.N,0!=t.G)if(e.i)if(1==r){n=e.s?e.s.length:0,e=Date.now()-e.F;var i=t.C;li(r=Mi(),new Vi(r,n)),So(t)}else No(t);else if(3==(i=e.o)||0==i&&0<t.I||!(1==r&&function(t,e){return!(zs(t.i)>=t.i.j-(t.m?1:0)||(t.m?(t.l=e.D.concat(t.l),0):1==t.G||2==t.G||t.C>=(t.Xa?0:t.Ya)||(t.m=$i(nr(t.Ha,t,e),Po(t,t.C)),t.C++,0)))}(t,e)||2==r&&Lo(t)))switch(n&&0<n.length&&(e=t.i,e.i=e.i.concat(n)),i){case 1:Uo(t,5);break;case 4:Uo(t,10);break;case 3:Uo(t,6);break;default:Uo(t,2)}}function Po(t,e){let n=t.Pa+Math.floor(Math.random()*t.$a);return t.j||(n*=2),n*e}function Uo(t,e){if(t.h.info("Error code "+e),2==e){var n=null;t.j&&(n=null);var r=nr(t.jb,t);n||(n=new vs("//www.google.com/images/cleardot.gif"),Gn.location&&"http"==Gn.location.protocol||Es(n,"https"),ks(n)),function(t,e){const n=new Ni;if(Gn.Image){const r=new Image;r.onload=rr(Qs,n,r,"TestLoadImage: loaded",!0,e),r.onerror=rr(Qs,n,r,"TestLoadImage: error",!1,e),r.onabort=rr(Qs,n,r,"TestLoadImage: abort",!1,e),r.ontimeout=rr(Qs,n,r,"TestLoadImage: timeout",!1,e),Gn.setTimeout((function(){r.ontimeout&&r.ontimeout()}),1e4),r.src=t}else e(!1)}(n.toString(),r)}else Fi(2);t.G=0,t.j&&t.j.va(e),Fo(t),Io(t)}function Fo(t){t.G=0,t.I=-1,t.j&&(0==Gs(t.i).length&&0==t.l.length||(t.i.i.length=0,lr(t.l),t.l.length=0),t.j.ua())}function Vo(t,e,n){let r=function(t){return t instanceof vs?ws(t):new vs(t,void 0)}(n);if(""!=r.i)e&&_s(r,e+"."+r.i),bs(r,r.m);else{const t=Gn.location;r=function(t,e,n,r){var i=new vs(null,void 0);return t&&Es(i,t),e&&_s(i,e),n&&bs(i,n),r&&(i.l=r),i}(t.protocol,e?e+"."+t.hostname:t.hostname,+t.port,n)}return t.aa&&yr(t.aa,(function(t,e){Is(r,e,t)})),e=t.D,n=t.sa,e&&n&&Is(r,e,n),Is(r,"VER",t.ma),Ao(t,r),r}function $o(t,e,n){if(e&&!t.H)throw Error("Can't create secondary domain capable XhrIo object.");return(e=n&&t.Ba&&!t.qa?new oo(new Zs({ib:!0})):new oo(t.qa)).L=t.H,e}function jo(){}function Bo(){if(kr&&!(10<=Number(Fr)))throw Error("Environmental error: no available transport.")}function qo(t,e){ci.call(this),this.g=new _o(e),this.l=t,this.h=e&&e.messageUrlParams||null,t=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.s=t,t=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(t?t["X-WebChannel-Content-Type"]=e.messageContentType:t={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.ya&&(t?t["X-WebChannel-Client-Profile"]=e.ya:t={"X-WebChannel-Client-Profile":e.ya}),this.g.P=t,(t=e&&e.httpHeadersOverwriteParam)&&!ur(t)&&(this.g.o=t),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!ur(e)&&(this.g.D=e,null!==(t=this.h)&&e in t&&(e in(t=this.h)&&delete t[e])),this.j=new Ko(this)}function zo(t){Gi.call(this);var e=t.__sm__;if(e){t:{for(const n in e){t=n;break t}t=void 0}(this.i=t)&&(t=this.i,e=null!==e&&t in e?e[t]:void 0),this.data=e}else this.data=t}function Ho(){Ji.call(this),this.status=1}function Ko(t){this.g=t}(Hn=oo.prototype).ea=function(t,e,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.H+"; newUri="+t);e=e?e.toUpperCase():"GET",this.H=t,this.j="",this.m=0,this.D=!1,this.h=!0,this.g=this.u?this.u.g():Ki.g(),this.C=this.u?zi(this.u):zi(Ki),this.g.onreadystatechange=nr(this.Fa,this);try{this.F=!0,this.g.open(e,String(t),!0),this.F=!1}catch(t){return void ho(this,t)}t=n||"";const i=new ps(this.headers);r&&fs(r,(function(t,e){i.set(e,t)})),r=function(t){t:{var e=uo;const n=t.length,r="string"==typeof t?t.split(""):t;for(let i=0;i<n;i++)if(i in r&&e.call(void 0,r[i],i,t)){e=i;break t}e=-1}return 0>e?null:"string"==typeof t?t.charAt(e):t[e]}(i.T()),n=Gn.FormData&&t instanceof Gn.FormData,!(0<=or(lo,e))||r||n||i.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8"),i.forEach((function(t,e){this.g.setRequestHeader(e,t)}),this),this.J&&(this.g.responseType=this.J),"withCredentials"in this.g&&this.g.withCredentials!==this.L&&(this.g.withCredentials=this.L);try{mo(this),0<this.B&&((this.K=function(t){return kr&&Pr()&&"number"==typeof t.timeout&&void 0!==t.ontimeout}(this.g))?(this.g.timeout=this.B,this.g.ontimeout=nr(this.pa,this)):this.A=Ti(this.pa,this.B,this)),this.v=!0,this.g.send(t),this.v=!1}catch(t){ho(this,t)}},Hn.pa=function(){void 0!==Wn&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,li(this,"timeout"),this.abort(8))},Hn.abort=function(t){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=t||7,li(this,"complete"),li(this,"abort"),go(this))},Hn.M=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),go(this,!0)),oo.Z.M.call(this)},Hn.Fa=function(){this.s||(this.F||this.v||this.l?po(this):this.cb())},Hn.cb=function(){po(this)},Hn.ba=function(){try{return 2<yo(this)?this.g.status:-1}catch(t){return-1}},Hn.ga=function(){try{return this.g?this.g.responseText:""}catch(t){return""}},Hn.Qa=function(t){if(this.g){var e=this.g.responseText;return t&&0==e.indexOf(t)&&(e=e.substring(t.length)),so(e)}},Hn.Da=function(){return this.m},Hn.La=function(){return"string"==typeof this.j?this.j:String(this.j)},(Hn=_o.prototype).ma=8,Hn.G=1,Hn.hb=function(t){try{this.h.info("Origin Trials invoked: "+t)}catch(t){}},Hn.Ha=function(t){if(this.m)if(this.m=null,1==this.G){if(!t){this.V=Math.floor(1e5*Math.random()),t=this.V++;const i=new Yi(this,this.h,t,void 0);let s=this.s;if(this.P&&(s?(s=vr(s),Er(s,this.P)):s=this.P),null===this.o&&(i.H=s),this.ja)t:{for(var e=0,n=0;n<this.l.length;n++){var r=this.l[n];if(void 0===(r="__data__"in r.g&&"string"==typeof(r=r.g.__data__)?r.length:void 0))break;if(4096<(e+=r)){e=n;break t}if(4096===e||n===this.l.length-1){e=n+1;break t}}e=1e3}else e=1e3;e=xo(this,i,e),Is(n=ws(this.F),"RID",t),Is(n,"CVER",22),this.D&&Is(n,"X-HTTP-Session-Id",this.D),Ao(this,n),this.o&&s&&wo(n,this.o,s),Ks(this.i,i),this.Ra&&Is(n,"TYPE","init"),this.ja?(Is(n,"$req",e),Is(n,"SID","null"),i.$=!0,ns(i,n,null)):ns(i,n,e),this.G=2}}else 3==this.G&&(t?Co(this,t):0==this.l.length||qs(this.i)||Co(this))},Hn.Ga=function(){if(this.u=null,Do(this),this.$&&!(this.L||null==this.g||0>=this.O)){var t=2*this.O;this.h.info("BP detection timer enabled: "+t),this.B=$i(nr(this.bb,this),t)}},Hn.bb=function(){this.B&&(this.B=null,this.h.info("BP detection timeout reached."),this.h.info("Buffering proxy detected and switch to long-polling!"),this.N=!1,this.L=!0,Fi(10),To(this),Do(this))},Hn.ab=function(){null!=this.v&&(this.v=null,To(this),Lo(this),Fi(19))},Hn.jb=function(t){t?(this.h.info("Successfully pinged google.com"),Fi(2)):(this.h.info("Failed to ping google.com"),Fi(1))},(Hn=jo.prototype).xa=function(){},Hn.wa=function(){},Hn.va=function(){},Hn.ua=function(){},Hn.Oa=function(){},Bo.prototype.g=function(t,e){return new qo(t,e)},ir(qo,ci),qo.prototype.m=function(){this.g.j=this.j,this.A&&(this.g.H=!0);var t=this.g,e=this.l,n=this.h||void 0;t.Wa&&(t.h.info("Origin Trials enabled."),yi(nr(t.hb,t,e))),Fi(0),t.W=e,t.aa=n||{},t.N=t.X,t.F=Vo(t,null,t.W),So(t)},qo.prototype.close=function(){bo(this.g)},qo.prototype.u=function(t){if("string"==typeof t){var e={};e.__data__=t,ko(this.g,e)}else this.v?((e={}).__data__=hi(t),ko(this.g,e)):ko(this.g,t)},qo.prototype.M=function(){this.g.j=null,delete this.j,bo(this.g),delete this.g,qo.Z.M.call(this)},ir(zo,Gi),ir(Ho,Ji),ir(Ko,jo),Ko.prototype.xa=function(){li(this.g,"a")},Ko.prototype.wa=function(t){li(this.g,new zo(t))},Ko.prototype.va=function(t){li(this.g,new Ho)},Ko.prototype.ua=function(){li(this.g,"b")},Bo.prototype.createWebChannel=Bo.prototype.g,qo.prototype.send=qo.prototype.u,qo.prototype.open=qo.prototype.m,qo.prototype.close=qo.prototype.close,ji.NO_ERROR=0,ji.TIMEOUT=8,ji.HTTP_ERROR=6,Bi.COMPLETE="complete",Hi.EventType=Wi,Wi.OPEN="a",Wi.CLOSE="b",Wi.ERROR="c",Wi.MESSAGE="d",ci.prototype.listen=ci.prototype.N,oo.prototype.listenOnce=oo.prototype.O,oo.prototype.getLastError=oo.prototype.La,oo.prototype.getLastErrorCode=oo.prototype.Da,oo.prototype.getStatus=oo.prototype.ba,oo.prototype.getResponseJson=oo.prototype.Qa,oo.prototype.getResponseText=oo.prototype.ga,oo.prototype.send=oo.prototype.ea;var Wo=ji,Go=Bi,Jo=Ri,Xo=10,Yo=11,Qo=Zs,Zo=Hi,ta=oo;const ea="@firebase/firestore";
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class na{constructor(t){this.uid=t}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}na.UNAUTHENTICATED=new na(null),na.GOOGLE_CREDENTIALS=new na("google-credentials-uid"),na.FIRST_PARTY=new na("first-party-uid"),na.MOCK_USER=new na("mock-user");
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
let ra="9.6.1";
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const ia=new S("@firebase/firestore");function sa(){return ia.logLevel}function oa(t,...e){if(ia.logLevel<=_.DEBUG){const n=e.map(la);ia.debug(`Firestore (${ra}): ${t}`,...n)}}function aa(t,...e){if(ia.logLevel<=_.ERROR){const n=e.map(la);ia.error(`Firestore (${ra}): ${t}`,...n)}}function ca(t,...e){if(ia.logLevel<=_.WARN){const n=e.map(la);ia.warn(`Firestore (${ra}): ${t}`,...n)}}function la(t){if("string"==typeof t)return t;try{return e=t,JSON.stringify(e)}catch(e){return t}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */var e}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function ua(t="Unexpected state"){const e=`FIRESTORE (${ra}) INTERNAL ASSERTION FAILED: `+t;throw aa(e),new Error(e)}function ha(t,e){t||ua()}function da(t,e){return t}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const fa={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class pa extends Error{constructor(t,e){super(e),this.code=t,this.message=e,this.name="FirebaseError",this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ga{constructor(){this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ma{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class ya{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable((()=>e(na.UNAUTHENTICATED)))}shutdown(){}}class va{constructor(t){this.t=t,this.currentUser=na.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){let n=this.i;const r=t=>this.i!==n?(n=this.i,e(t)):Promise.resolve();let i=new ga;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new ga,t.enqueueRetryable((()=>r(this.currentUser)))};const s=()=>{const e=i;t.enqueueRetryable((async()=>{await e.promise,await r(this.currentUser)}))},o=t=>{oa("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=t,this.auth.addAuthTokenListener(this.o),s()};this.t.onInit((t=>o(t))),setTimeout((()=>{if(!this.auth){const t=this.t.getImmediate({optional:!0});t?o(t):(oa("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new ga)}}),0),s()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then((e=>this.i!==t?(oa("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):e?(ha("string"==typeof e.accessToken),new ma(e.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.auth.removeAuthTokenListener(this.o)}u(){const t=this.auth&&this.auth.getUid();return ha(null===t||"string"==typeof t),new na(t)}}class wa{constructor(t,e,n){this.type="FirstParty",this.user=na.FIRST_PARTY,this.headers=new Map,this.headers.set("X-Goog-AuthUser",e);const r=t.auth.getAuthHeaderValueForFirstParty([]);r&&this.headers.set("Authorization",r),n&&this.headers.set("X-Goog-Iam-Authorization-Token",n)}}class Ea{constructor(t,e,n){this.h=t,this.l=e,this.m=n}getToken(){return Promise.resolve(new wa(this.h,this.l,this.m))}start(t,e){t.enqueueRetryable((()=>e(na.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class _a{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ba{constructor(t){this.g=t,this.forceRefresh=!1,this.appCheck=null}start(t,e){this.o=n=>{t.enqueueRetryable((()=>(t=>(null!=t.error&&oa("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`),e(t.token)))(n)))};const n=t=>{oa("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=t,this.appCheck.addTokenListener(this.o)};this.g.onInit((t=>n(t))),setTimeout((()=>{if(!this.appCheck){const t=this.g.getImmediate({optional:!0});t?n(t):oa("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then((t=>t?(ha("string"==typeof t.token),new _a(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.appCheck.removeTokenListener(this.o)}}
/**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Ta{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=t=>this.p(t),this.T=t=>e.writeSequenceNumber(t))}p(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.T&&this.T(t),t}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ia(t){const e="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&"function"==typeof e.getRandomValues)e.getRandomValues(n);else for(let e=0;e<t;e++)n[e]=Math.floor(256*Math.random());return n}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */Ta.I=-1;class ka{static A(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(256/62);let n="";for(;n.length<20;){const r=Ia(40);for(let i=0;i<r.length;++i)n.length<20&&r[i]<e&&(n+=t.charAt(r[i]%62))}return n}}function Sa(t,e){return t<e?-1:t>e?1:0}function Ca(t,e,n){return t.length===e.length&&t.every(((t,r)=>n(t,e[r])))}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Aa{constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new pa(fa.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new pa(fa.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<-62135596800)throw new pa(fa.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new pa(fa.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}static now(){return Aa.fromMillis(Date.now())}static fromDate(t){return Aa.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor(1e6*(t-1e3*e));return new Aa(e,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(t){return this.seconds===t.seconds?Sa(this.nanoseconds,t.nanoseconds):Sa(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const t=this.seconds- -62135596800;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class xa{constructor(t){this.timestamp=t}static fromTimestamp(t){return new xa(t)}static min(){return new xa(new Aa(0,0))}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Na(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function La(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Ra(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Da{constructor(t,e,n){void 0===e?e=0:e>t.length&&ua(),void 0===n?n=t.length-e:n>t.length-e&&ua(),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return 0===Da.comparator(this,t)}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Da?t.forEach((t=>{e.push(t)})):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=void 0===t?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return 0===this.length}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const n=t.get(r),i=e.get(r);if(n<i)return-1;if(n>i)return 1}return t.length<e.length?-1:t.length>e.length?1:0}}class Ma extends Da{construct(t,e,n){return new Ma(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new pa(fa.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter((t=>t.length>0)))}return new Ma(e)}static emptyPath(){return new Ma([])}}const Oa=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Pa extends Da{construct(t,e,n){return new Pa(t,e,n)}static isValidIdentifier(t){return Oa.test(t)}canonicalString(){return this.toArray().map((t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Pa.isValidIdentifier(t)||(t="`"+t+"`"),t))).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&"__name__"===this.get(0)}static keyField(){return new Pa(["__name__"])}static fromServerFormat(t){const e=[];let n="",r=0;const i=()=>{if(0===n.length)throw new pa(fa.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let s=!1;for(;r<t.length;){const e=t[r];if("\\"===e){if(r+1===t.length)throw new pa(fa.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const e=t[r+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new pa(fa.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=e,r+=2}else"`"===e?(s=!s,r++):"."!==e||s?(n+=e,r++):(i(),r++)}if(i(),s)throw new pa(fa.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new Pa(e)}static emptyPath(){return new Pa([])}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Ua{constructor(t){this.fields=t,t.sort(Pa.comparator)}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Ca(this.fields,t.fields,((t,e)=>t.isEqual(e)))}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Fa{constructor(t){this.binaryString=t}static fromBase64String(t){const e=atob(t);return new Fa(e)}static fromUint8Array(t){const e=function(t){let e="";for(let n=0;n<t.length;++n)e+=String.fromCharCode(t[n]);return e}(t);return new Fa(e)}toBase64(){return t=this.binaryString,btoa(t);var t}toUint8Array(){return function(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return Sa(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Fa.EMPTY_BYTE_STRING=new Fa("");const Va=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function $a(t){if(ha(!!t),"string"==typeof t){let e=0;const n=Va.exec(t);if(ha(!!n),n[1]){let t=n[1];t=(t+"000000000").substr(0,9),e=Number(t)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ja(t.seconds),nanos:ja(t.nanos)}}function ja(t){return"number"==typeof t?t:"string"==typeof t?Number(t):0}function Ba(t){return"string"==typeof t?Fa.fromBase64String(t):Fa.fromUint8Array(t)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function qa(t){var e,n;return"server_timestamp"===(null===(n=((null===(e=null==t?void 0:t.mapValue)||void 0===e?void 0:e.fields)||{}).__type__)||void 0===n?void 0:n.stringValue)}function za(t){const e=t.mapValue.fields.__previous_value__;return qa(e)?za(e):e}function Ha(t){const e=$a(t.mapValue.fields.__local_write_time__.timestampValue);return new Aa(e.seconds,e.nanos)}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ka(t){return null==t}function Wa(t){return 0===t&&1/t==-1/0}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class Ga{constructor(t){this.path=t}static fromPath(t){return new Ga(Ma.fromString(t))}static fromName(t){return new Ga(Ma.fromString(t).popFirst(5))}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}isEqual(t){return null!==t&&0===Ma.comparator(this.path,t.path)}toString(){return this.path.toString()}static comparator(t,e){return Ma.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new Ga(new Ma(t.slice()))}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ja(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?qa(t)?4:10:ua()}function Xa(t,e){const n=Ja(t);if(n!==Ja(e))return!1;switch(n){case 0:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Ha(t).isEqual(Ha(e));case 3:return function(t,e){if("string"==typeof t.timestampValue&&"string"==typeof e.timestampValue&&t.timestampValue.length===e.timestampValue.length)return t.timestampValue===e.timestampValue;const n=$a(t.timestampValue),r=$a(e.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(t,e){return Ba(t.bytesValue).isEqual(Ba(e.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(t,e){return ja(t.geoPointValue.latitude)===ja(e.geoPointValue.latitude)&&ja(t.geoPointValue.longitude)===ja(e.geoPointValue.longitude)}(t,e);case 2:return function(t,e){if("integerValue"in t&&"integerValue"in e)return ja(t.integerValue)===ja(e.integerValue);if("doubleValue"in t&&"doubleValue"in e){const n=ja(t.doubleValue),r=ja(e.doubleValue);return n===r?Wa(n)===Wa(r):isNaN(n)&&isNaN(r)}return!1}(t,e);case 9:return Ca(t.arrayValue.values||[],e.arrayValue.values||[],Xa);case 10:return function(t,e){const n=t.mapValue.fields||{},r=e.mapValue.fields||{};if(Na(n)!==Na(r))return!1;for(const t in n)if(n.hasOwnProperty(t)&&(void 0===r[t]||!Xa(n[t],r[t])))return!1;return!0}(t,e);default:return ua()}}function Ya(t,e){return void 0!==(t.values||[]).find((t=>Xa(t,e)))}function Qa(t,e){const n=Ja(t),r=Ja(e);if(n!==r)return Sa(n,r);switch(n){case 0:return 0;case 1:return Sa(t.booleanValue,e.booleanValue);case 2:return function(t,e){const n=ja(t.integerValue||t.doubleValue),r=ja(e.integerValue||e.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(t,e);case 3:return Za(t.timestampValue,e.timestampValue);case 4:return Za(Ha(t),Ha(e));case 5:return Sa(t.stringValue,e.stringValue);case 6:return function(t,e){const n=Ba(t),r=Ba(e);return n.compareTo(r)}(t.bytesValue,e.bytesValue);case 7:return function(t,e){const n=t.split("/"),r=e.split("/");for(let t=0;t<n.length&&t<r.length;t++){const e=Sa(n[t],r[t]);if(0!==e)return e}return Sa(n.length,r.length)}(t.referenceValue,e.referenceValue);case 8:return function(t,e){const n=Sa(ja(t.latitude),ja(e.latitude));return 0!==n?n:Sa(ja(t.longitude),ja(e.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return function(t,e){const n=t.values||[],r=e.values||[];for(let t=0;t<n.length&&t<r.length;++t){const e=Qa(n[t],r[t]);if(e)return e}return Sa(n.length,r.length)}(t.arrayValue,e.arrayValue);case 10:return function(t,e){const n=t.fields||{},r=Object.keys(n),i=e.fields||{},s=Object.keys(i);r.sort(),s.sort();for(let t=0;t<r.length&&t<s.length;++t){const e=Sa(r[t],s[t]);if(0!==e)return e;const o=Qa(n[r[t]],i[s[t]]);if(0!==o)return o}return Sa(r.length,s.length)}(t.mapValue,e.mapValue);default:throw ua()}}function Za(t,e){if("string"==typeof t&&"string"==typeof e&&t.length===e.length)return Sa(t,e);const n=$a(t),r=$a(e),i=Sa(n.seconds,r.seconds);return 0!==i?i:Sa(n.nanos,r.nanos)}function tc(t){return ec(t)}function ec(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(t){const e=$a(t);return`time(${e.seconds},${e.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?Ba(t.bytesValue).toBase64():"referenceValue"in t?(n=t.referenceValue,Ga.fromName(n).toString()):"geoPointValue"in t?`geo(${(e=t.geoPointValue).latitude},${e.longitude})`:"arrayValue"in t?function(t){let e="[",n=!0;for(const r of t.values||[])n?n=!1:e+=",",e+=ec(r);return e+"]"}(t.arrayValue):"mapValue"in t?function(t){const e=Object.keys(t.fields||{}).sort();let n="{",r=!0;for(const i of e)r?r=!1:n+=",",n+=`${i}:${ec(t.fields[i])}`;return n+"}"}(t.mapValue):ua();var e,n}function nc(t){return!!t&&"integerValue"in t}function rc(t){return!!t&&"arrayValue"in t}function ic(t){return!!t&&"nullValue"in t}function sc(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function oc(t){return!!t&&"mapValue"in t}function ac(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&"object"==typeof t.timestampValue)return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return La(t.mapValue.fields,((t,n)=>e.mapValue.fields[t]=ac(n))),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=ac(t.arrayValue.values[n]);return e}return Object.assign({},t)}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class cc{constructor(t){this.value=t}static empty(){return new cc({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!oc(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=ac(e)}setAll(t){let e=Pa.emptyPath(),n={},r=[];t.forEach(((t,i)=>{if(!e.isImmediateParentOf(i)){const t=this.getFieldsMap(e);this.applyChanges(t,n,r),n={},r=[],e=i.popLast()}t?n[i.lastSegment()]=ac(t):r.push(i.lastSegment())}));const i=this.getFieldsMap(e);this.applyChanges(i,n,r)}delete(t){const e=this.field(t.popLast());oc(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Xa(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let r=e.mapValue.fields[t.get(n)];oc(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=r),e=r}return e.mapValue.fields}applyChanges(t,e,n){La(e,((e,n)=>t[e]=n));for(const e of n)delete t[e]}clone(){return new cc(ac(this.value))}}function lc(t){const e=[];return La(t.fields,((t,n)=>{const r=new Pa([t]);if(oc(n)){const t=lc(n.mapValue).fields;if(0===t.length)e.push(r);else for(const n of t)e.push(r.child(n))}else e.push(r)})),new Ua(e)
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */}class uc{constructor(t,e,n,r,i){this.key=t,this.documentType=e,this.version=n,this.data=r,this.documentState=i}static newInvalidDocument(t){return new uc(t,0,xa.min(),cc.empty(),0)}static newFoundDocument(t,e,n){return new uc(t,1,e,n,0)}static newNoDocument(t,e){return new uc(t,2,e,cc.empty(),0)}static newUnknownDocument(t,e){return new uc(t,3,e,cc.empty(),2)}convertToFoundDocument(t,e){return this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=cc.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=cc.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(t){return t instanceof uc&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}clone(){return new uc(this.key,this.documentType,this.version,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class hc{constructor(t,e=null,n=[],r=[],i=null,s=null,o=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=r,this.limit=i,this.startAt=s,this.endAt=o,this.R=null}}function dc(t,e=null,n=[],r=[],i=null,s=null,o=null){return new hc(t,e,n,r,i,s,o)}function fc(t){const e=da(t);if(null===e.R){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((t=>function(t){return t.field.canonicalString()+t.op.toString()+tc(t.value)}(t))).join(","),t+="|ob:",t+=e.orderBy.map((t=>function(t){return t.field.canonicalString()+t.dir}(t))).join(","),Ka(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=Sc(e.startAt)),e.endAt&&(t+="|ub:",t+=Sc(e.endAt)),e.R=t}return e.R}function pc(t,e){if(t.limit!==e.limit)return!1;if(t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Ac(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let i=0;i<t.filters.length;i++)if(n=t.filters[i],r=e.filters[i],n.op!==r.op||!n.field.isEqual(r.field)||!Xa(n.value,r.value))return!1;var n,r;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Nc(t.startAt,e.startAt)&&Nc(t.endAt,e.endAt)}function gc(t){return Ga.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length}class mc extends class{}{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?"in"===e||"not-in"===e?this.P(t,e,n):new yc(t,e,n):"array-contains"===e?new _c(t,n):"in"===e?new bc(t,n):"not-in"===e?new Tc(t,n):"array-contains-any"===e?new Ic(t,n):new mc(t,e,n)}static P(t,e,n){return"in"===e?new vc(t,n):new wc(t,n)}matches(t){const e=t.data.field(this.field);return"!="===this.op?null!==e&&this.v(Qa(e,this.value)):null!==e&&Ja(this.value)===Ja(e)&&this.v(Qa(e,this.value))}v(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return 0===t;case"!=":return 0!==t;case">":return t>0;case">=":return t>=0;default:return ua()}}V(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}}class yc extends mc{constructor(t,e,n){super(t,e,n),this.key=Ga.fromName(n.referenceValue)}matches(t){const e=Ga.comparator(t.key,this.key);return this.v(e)}}class vc extends mc{constructor(t,e){super(t,"in",e),this.keys=Ec("in",e)}matches(t){return this.keys.some((e=>e.isEqual(t.key)))}}class wc extends mc{constructor(t,e){super(t,"not-in",e),this.keys=Ec("not-in",e)}matches(t){return!this.keys.some((e=>e.isEqual(t.key)))}}function Ec(t,e){var n;return((null===(n=e.arrayValue)||void 0===n?void 0:n.values)||[]).map((t=>Ga.fromName(t.referenceValue)))}class _c extends mc{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return rc(e)&&Ya(e.arrayValue,this.value)}}class bc extends mc{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return null!==e&&Ya(this.value.arrayValue,e)}}class Tc extends mc{constructor(t,e){super(t,"not-in",e)}matches(t){if(Ya(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return null!==e&&!Ya(this.value.arrayValue,e)}}class Ic extends mc{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!rc(e)||!e.arrayValue.values)&&e.arrayValue.values.some((t=>Ya(this.value.arrayValue,t)))}}class kc{constructor(t,e){this.position=t,this.before=e}}function Sc(t){return`${t.before?"b":"a"}:${t.position.map((t=>tc(t))).join(",")}`}class Cc{constructor(t,e="asc"){this.field=t,this.dir=e}}function Ac(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}function xc(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(r=s.field.isKeyField()?Ga.comparator(Ga.fromName(o.referenceValue),n.key):Qa(o,n.data.field(s.field)),"desc"===s.dir&&(r*=-1),0!==r)break}return t.before?r<=0:r<0}function Nc(t,e){if(null===t)return null===e;if(null===e)return!1;if(t.before!==e.before||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Xa(t.position[n],e.position[n]))return!1;return!0}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Lc{constructor(t,e=null,n=[],r=[],i=null,s="F",o=null,a=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=r,this.limit=i,this.limitType=s,this.startAt=o,this.endAt=a,this.S=null,this.D=null,this.startAt,this.endAt}}function Rc(t){return new Lc(t)}function Dc(t){return!Ka(t.limit)&&"F"===t.limitType}function Mc(t){return!Ka(t.limit)&&"L"===t.limitType}function Oc(t){const e=da(t);if(null===e.S){e.S=[];const t=function(t){for(const e of t.filters)if(e.V())return e.field;return null}(e),n=function(t){return t.explicitOrderBy.length>0?t.explicitOrderBy[0].field:null}(e);if(null!==t&&null===n)t.isKeyField()||e.S.push(new Cc(t)),e.S.push(new Cc(Pa.keyField(),"asc"));else{let t=!1;for(const n of e.explicitOrderBy)e.S.push(n),n.field.isKeyField()&&(t=!0);if(!t){const t=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";e.S.push(new Cc(Pa.keyField(),t))}}}return e.S}function Pc(t){const e=da(t);if(!e.D)if("F"===e.limitType)e.D=dc(e.path,e.collectionGroup,Oc(e),e.filters,e.limit,e.startAt,e.endAt);else{const t=[];for(const n of Oc(e)){const e="desc"===n.dir?"asc":"desc";t.push(new Cc(n.field,e))}const n=e.endAt?new kc(e.endAt.position,!e.endAt.before):null,r=e.startAt?new kc(e.startAt.position,!e.startAt.before):null;e.D=dc(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}return e.D}function Uc(t,e){return pc(Pc(t),Pc(e))&&t.limitType===e.limitType}function Fc(t){return`${fc(Pc(t))}|lt:${t.limitType}`}function Vc(t){return`Query(target=${function(t){let e=t.path.canonicalString();return null!==t.collectionGroup&&(e+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(e+=`, filters: [${t.filters.map((t=>{return`${(e=t).field.canonicalString()} ${e.op} ${tc(e.value)}`;var e})).join(", ")}]`),Ka(t.limit)||(e+=", limit: "+t.limit),t.orderBy.length>0&&(e+=`, orderBy: [${t.orderBy.map((t=>function(t){return`${t.field.canonicalString()} (${t.dir})`}(t))).join(", ")}]`),t.startAt&&(e+=", startAt: "+Sc(t.startAt)),t.endAt&&(e+=", endAt: "+Sc(t.endAt)),`Target(${e})`}(Pc(t))}; limitType=${t.limitType})`}function $c(t,e){return e.isFoundDocument()&&function(t,e){const n=e.key.path;return null!==t.collectionGroup?e.key.hasCollectionId(t.collectionGroup)&&t.path.isPrefixOf(n):Ga.isDocumentKey(t.path)?t.path.isEqual(n):t.path.isImmediateParentOf(n)}(t,e)&&function(t,e){for(const n of t.explicitOrderBy)if(!n.field.isKeyField()&&null===e.data.field(n.field))return!1;return!0}(t,e)&&function(t,e){for(const n of t.filters)if(!n.matches(e))return!1;return!0}(t,e)&&function(t,e){return!(t.startAt&&!xc(t.startAt,Oc(t),e))&&(!t.endAt||!xc(t.endAt,Oc(t),e))}(t,e)}function jc(t){return(e,n)=>{let r=!1;for(const i of Oc(t)){const t=Bc(i,e,n);if(0!==t)return t;r=r||i.field.isKeyField()}return 0}}function Bc(t,e,n){const r=t.field.isKeyField()?Ga.comparator(e.key,n.key):function(t,e,n){const r=e.data.field(t),i=n.data.field(t);return null!==r&&null!==i?Qa(r,i):ua()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return ua()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function qc(t,e){if(t.C){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Wa(e)?"-0":e}}function zc(t){return{integerValue:""+t}}function Hc(t,e){return function(t){return"number"==typeof t&&Number.isInteger(t)&&!Wa(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}(e)?zc(e):qc(t,e)}
/**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Kc{constructor(){this._=void 0}}function Wc(t,e,n){return t instanceof Xc?function(t,e){const n={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:t.seconds,nanos:t.nanoseconds}}}};return e&&(n.fields.__previous_value__=e),{mapValue:n}}(n,e):t instanceof Yc?Qc(t,e):t instanceof Zc?tl(t,e):function(t,e){const n=Jc(t,e),r=nl(n)+nl(t.N);return nc(n)&&nc(t.N)?zc(r):qc(t.k,r)}(t,e)}function Gc(t,e,n){return t instanceof Yc?Qc(t,e):t instanceof Zc?tl(t,e):n}function Jc(t,e){return t instanceof el?nc(n=e)||function(t){return!!t&&"doubleValue"in t}(n)?e:{integerValue:0}:null;var n}class Xc extends Kc{}class Yc extends Kc{constructor(t){super(),this.elements=t}}function Qc(t,e){const n=rl(e);for(const e of t.elements)n.some((t=>Xa(t,e)))||n.push(e);return{arrayValue:{values:n}}}class Zc extends Kc{constructor(t){super(),this.elements=t}}function tl(t,e){let n=rl(e);for(const e of t.elements)n=n.filter((t=>!Xa(t,e)));return{arrayValue:{values:n}}}class el extends Kc{constructor(t,e){super(),this.k=t,this.N=e}}function nl(t){return ja(t.integerValue||t.doubleValue)}function rl(t){return rc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class il{constructor(t,e){this.field=t,this.transform=e}}class sl{constructor(t,e){this.version=t,this.transformResults=e}}class ol{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new ol}static exists(t){return new ol(void 0,t)}static updateTime(t){return new ol(t)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function al(t,e){return void 0!==t.updateTime?e.isFoundDocument()&&e.version.isEqual(t.updateTime):void 0===t.exists||t.exists===e.isFoundDocument()}class cl{}function ll(t,e,n){t instanceof pl?function(t,e,n){const r=t.value.clone(),i=yl(t.fieldTransforms,e,n.transformResults);r.setAll(i),e.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(t,e,n):t instanceof gl?function(t,e,n){if(!al(t.precondition,e))return void e.convertToUnknownDocument(n.version);const r=yl(t.fieldTransforms,e,n.transformResults),i=e.data;i.setAll(ml(t)),i.setAll(r),e.convertToFoundDocument(n.version,i).setHasCommittedMutations()}(t,e,n):function(t,e,n){e.convertToNoDocument(n.version).setHasCommittedMutations()}(0,e,n)}function ul(t,e,n){t instanceof pl?function(t,e,n){if(!al(t.precondition,e))return;const r=t.value.clone(),i=vl(t.fieldTransforms,n,e);r.setAll(i),e.convertToFoundDocument(fl(e),r).setHasLocalMutations()}(t,e,n):t instanceof gl?function(t,e,n){if(!al(t.precondition,e))return;const r=vl(t.fieldTransforms,n,e),i=e.data;i.setAll(ml(t)),i.setAll(r),e.convertToFoundDocument(fl(e),i).setHasLocalMutations()}(t,e,n):function(t,e){al(t.precondition,e)&&e.convertToNoDocument(xa.min())}(t,e)}function hl(t,e){let n=null;for(const r of t.fieldTransforms){const t=e.data.field(r.field),i=Jc(r.transform,t||null);null!=i&&(null==n&&(n=cc.empty()),n.set(r.field,i))}return n||null}function dl(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(t,e){return void 0===t&&void 0===e||!(!t||!e)&&Ca(t,e,((t,e)=>function(t,e){return t.field.isEqual(e.field)&&function(t,e){return t instanceof Yc&&e instanceof Yc||t instanceof Zc&&e instanceof Zc?Ca(t.elements,e.elements,Xa):t instanceof el&&e instanceof el?Xa(t.N,e.N):t instanceof Xc&&e instanceof Xc}(t.transform,e.transform)}(t,e)))}(t.fieldTransforms,e.fieldTransforms)&&(0===t.type?t.value.isEqual(e.value):1!==t.type||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}function fl(t){return t.isFoundDocument()?t.version:xa.min()}class pl extends cl{constructor(t,e,n,r=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=r,this.type=0}}class gl extends cl{constructor(t,e,n,r,i=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=r,this.fieldTransforms=i,this.type=1}}function ml(t){const e=new Map;return t.fieldMask.fields.forEach((n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}})),e}function yl(t,e,n){const r=new Map;ha(t.length===n.length);for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,a=e.data.field(s.field);r.set(s.field,Gc(o,a,n[i]))}return r}function vl(t,e,n){const r=new Map;for(const i of t){const t=i.transform,s=n.data.field(i.field);r.set(i.field,Wc(t,s,e))}return r}class wl extends cl{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}}class El extends cl{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class _l{constructor(t){this.count=t}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */var bl,Tl;function Il(t){if(void 0===t)return aa("GRPC error has no .code"),fa.UNKNOWN;switch(t){case bl.OK:return fa.OK;case bl.CANCELLED:return fa.CANCELLED;case bl.UNKNOWN:return fa.UNKNOWN;case bl.DEADLINE_EXCEEDED:return fa.DEADLINE_EXCEEDED;case bl.RESOURCE_EXHAUSTED:return fa.RESOURCE_EXHAUSTED;case bl.INTERNAL:return fa.INTERNAL;case bl.UNAVAILABLE:return fa.UNAVAILABLE;case bl.UNAUTHENTICATED:return fa.UNAUTHENTICATED;case bl.INVALID_ARGUMENT:return fa.INVALID_ARGUMENT;case bl.NOT_FOUND:return fa.NOT_FOUND;case bl.ALREADY_EXISTS:return fa.ALREADY_EXISTS;case bl.PERMISSION_DENIED:return fa.PERMISSION_DENIED;case bl.FAILED_PRECONDITION:return fa.FAILED_PRECONDITION;case bl.ABORTED:return fa.ABORTED;case bl.OUT_OF_RANGE:return fa.OUT_OF_RANGE;case bl.UNIMPLEMENTED:return fa.UNIMPLEMENTED;case bl.DATA_LOSS:return fa.DATA_LOSS;default:return ua()}}(Tl=bl||(bl={}))[Tl.OK=0]="OK",Tl[Tl.CANCELLED=1]="CANCELLED",Tl[Tl.UNKNOWN=2]="UNKNOWN",Tl[Tl.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Tl[Tl.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Tl[Tl.NOT_FOUND=5]="NOT_FOUND",Tl[Tl.ALREADY_EXISTS=6]="ALREADY_EXISTS",Tl[Tl.PERMISSION_DENIED=7]="PERMISSION_DENIED",Tl[Tl.UNAUTHENTICATED=16]="UNAUTHENTICATED",Tl[Tl.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Tl[Tl.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Tl[Tl.ABORTED=10]="ABORTED",Tl[Tl.OUT_OF_RANGE=11]="OUT_OF_RANGE",Tl[Tl.UNIMPLEMENTED=12]="UNIMPLEMENTED",Tl[Tl.INTERNAL=13]="INTERNAL",Tl[Tl.UNAVAILABLE=14]="UNAVAILABLE",Tl[Tl.DATA_LOSS=15]="DATA_LOSS";
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class kl{constructor(t,e){this.comparator=t,this.root=e||Cl.EMPTY}insert(t,e){return new kl(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,Cl.BLACK,null,null))}remove(t){return new kl(this.comparator,this.root.remove(t,this.comparator).copy(null,null,Cl.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(0===n)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(t,n.key);if(0===r)return e+n.left.size;r<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal(((e,n)=>(t(e,n),!1)))}toString(){const t=[];return this.inorderTraversal(((e,n)=>(t.push(`${e}:${n}`),!1))),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Sl(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Sl(this.root,t,this.comparator,!1)}getReverseIterator(){return new Sl(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Sl(this.root,t,this.comparator,!0)}}class Sl{constructor(t,e,n,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!t.isEmpty();)if(i=e?n(t.key,e):1,r&&(i*=-1),i<0)t=this.isReverse?t.left:t.right;else{if(0===i){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class Cl{constructor(t,e,n,r,i){this.key=t,this.value=e,this.color=null!=n?n:Cl.RED,this.left=null!=r?r:Cl.EMPTY,this.right=null!=i?i:Cl.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,r,i){return new Cl(null!=t?t:this.key,null!=e?e:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=i?i:this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let r=this;const i=n(t,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(t,e,n),null):0===i?r.copy(null,e,null,null,null):r.copy(null,null,null,null,r.right.insert(t,e,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return Cl.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,r=this;if(e(t,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(t,e),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===e(t,r.key)){if(r.right.isEmpty())return Cl.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(t,e))}return r.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,Cl.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,Cl.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw ua();if(this.right.isRed())throw ua();const t=this.left.check();if(t!==this.right.check())throw ua();return t+(this.isRed()?0:1)}}Cl.EMPTY=null,Cl.RED=!0,Cl.BLACK=!1,Cl.EMPTY=new class{constructor(){this.size=0}get key(){throw ua()}get value(){throw ua()}get color(){throw ua()}get left(){throw ua()}get right(){throw ua()}copy(t,e,n,r,i){return this}insert(t,e,n){return new Cl(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class Al{constructor(t){this.comparator=t,this.data=new kl(this.comparator)}has(t){return null!==this.data.get(t)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal(((e,n)=>(t(e),!1)))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,t[1])>=0)return;e(r.key)}}forEachWhile(t,e){let n;for(n=void 0!==e?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new xl(this.data.getIterator())}getIteratorFrom(t){return new xl(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach((t=>{e=e.add(t)})),e}isEqual(t){if(!(t instanceof Al))return!1;if(this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(0!==this.comparator(t,r))return!1}return!0}toArray(){const t=[];return this.forEach((e=>{t.push(e)})),t}toString(){const t=[];return this.forEach((e=>t.push(e))),"SortedSet("+t.toString()+")"}copy(t){const e=new Al(this.comparator);return e.data=t,e}}class xl{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const Nl=new kl(Ga.comparator);function Ll(){return Nl}const Rl=new kl(Ga.comparator);function Dl(){return Rl}const Ml=new kl(Ga.comparator);const Ol=new Al(Ga.comparator);function Pl(...t){let e=Ol;for(const n of t)e=e.add(n);return e}const Ul=new Al(Sa);function Fl(){return Ul}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Vl{constructor(t,e,n,r,i){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(t,e){const n=new Map;return n.set(t,$l.createSynthesizedTargetChangeForCurrentChange(t,e)),new Vl(xa.min(),n,Fl(),Ll(),Pl())}}class $l{constructor(t,e,n,r,i){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(t,e){return new $l(Fa.EMPTY_BYTE_STRING,e,Pl(),Pl(),Pl())}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class jl{constructor(t,e,n,r){this.$=t,this.removedTargetIds=e,this.key=n,this.F=r}}class Bl{constructor(t,e){this.targetId=t,this.O=e}}class ql{constructor(t,e,n=Fa.EMPTY_BYTE_STRING,r=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=r}}class zl{constructor(){this.M=0,this.L=Wl(),this.B=Fa.EMPTY_BYTE_STRING,this.U=!1,this.q=!0}get current(){return this.U}get resumeToken(){return this.B}get K(){return 0!==this.M}get j(){return this.q}W(t){t.approximateByteSize()>0&&(this.q=!0,this.B=t)}G(){let t=Pl(),e=Pl(),n=Pl();return this.L.forEach(((r,i)=>{switch(i){case 0:t=t.add(r);break;case 2:e=e.add(r);break;case 1:n=n.add(r);break;default:ua()}})),new $l(this.B,this.U,t,e,n)}H(){this.q=!1,this.L=Wl()}J(t,e){this.q=!0,this.L=this.L.insert(t,e)}Y(t){this.q=!0,this.L=this.L.remove(t)}X(){this.M+=1}Z(){this.M-=1}tt(){this.q=!0,this.U=!0}}class Hl{constructor(t){this.et=t,this.nt=new Map,this.st=Ll(),this.it=Kl(),this.rt=new Al(Sa)}ot(t){for(const e of t.$)t.F&&t.F.isFoundDocument()?this.at(e,t.F):this.ct(e,t.key,t.F);for(const e of t.removedTargetIds)this.ct(e,t.key,t.F)}ut(t){this.forEachTarget(t,(e=>{const n=this.ht(e);switch(t.state){case 0:this.lt(e)&&n.W(t.resumeToken);break;case 1:n.Z(),n.K||n.H(),n.W(t.resumeToken);break;case 2:n.Z(),n.K||this.removeTarget(e);break;case 3:this.lt(e)&&(n.tt(),n.W(t.resumeToken));break;case 4:this.lt(e)&&(this.ft(e),n.W(t.resumeToken));break;default:ua()}}))}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.nt.forEach(((t,n)=>{this.lt(n)&&e(n)}))}dt(t){const e=t.targetId,n=t.O.count,r=this.wt(e);if(r){const t=r.target;if(gc(t))if(0===n){const n=new Ga(t.path);this.ct(e,n,uc.newNoDocument(n,xa.min()))}else ha(1===n);else this._t(e)!==n&&(this.ft(e),this.rt=this.rt.add(e))}}gt(t){const e=new Map;this.nt.forEach(((n,r)=>{const i=this.wt(r);if(i){if(n.current&&gc(i.target)){const e=new Ga(i.target.path);null!==this.st.get(e)||this.yt(r,e)||this.ct(r,e,uc.newNoDocument(e,t))}n.j&&(e.set(r,n.G()),n.H())}}));let n=Pl();this.it.forEach(((t,e)=>{let r=!0;e.forEachWhile((t=>{const e=this.wt(t);return!e||2===e.purpose||(r=!1,!1)})),r&&(n=n.add(t))}));const r=new Vl(t,e,this.rt,this.st,n);return this.st=Ll(),this.it=Kl(),this.rt=new Al(Sa),r}at(t,e){if(!this.lt(t))return;const n=this.yt(t,e.key)?2:0;this.ht(t).J(e.key,n),this.st=this.st.insert(e.key,e),this.it=this.it.insert(e.key,this.Tt(e.key).add(t))}ct(t,e,n){if(!this.lt(t))return;const r=this.ht(t);this.yt(t,e)?r.J(e,1):r.Y(e),this.it=this.it.insert(e,this.Tt(e).delete(t)),n&&(this.st=this.st.insert(e,n))}removeTarget(t){this.nt.delete(t)}_t(t){const e=this.ht(t).G();return this.et.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}X(t){this.ht(t).X()}ht(t){let e=this.nt.get(t);return e||(e=new zl,this.nt.set(t,e)),e}Tt(t){let e=this.it.get(t);return e||(e=new Al(Sa),this.it=this.it.insert(t,e)),e}lt(t){const e=null!==this.wt(t);return e||oa("WatchChangeAggregator","Detected inactive target",t),e}wt(t){const e=this.nt.get(t);return e&&e.K?null:this.et.Et(t)}ft(t){this.nt.set(t,new zl),this.et.getRemoteKeysForTarget(t).forEach((e=>{this.ct(t,e,null)}))}yt(t,e){return this.et.getRemoteKeysForTarget(t).has(e)}}function Kl(){return new kl(Ga.comparator)}function Wl(){return new kl(Ga.comparator)}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const Gl={asc:"ASCENDING",desc:"DESCENDING"},Jl={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"};class Xl{constructor(t,e){this.databaseId=t,this.C=e}}function Yl(t,e){return t.C?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Ql(t,e){return t.C?e.toBase64():e.toUint8Array()}function Zl(t,e){return Yl(t,e.toTimestamp())}function tu(t){return ha(!!t),xa.fromTimestamp(function(t){const e=$a(t);return new Aa(e.seconds,e.nanos)}(t))}function eu(t,e){return function(t){return new Ma(["projects",t.projectId,"databases",t.database])}(t).child("documents").child(e).canonicalString()}function nu(t){const e=Ma.fromString(t);return ha(bu(e)),e}function ru(t,e){return eu(t.databaseId,e.path)}function iu(t,e){const n=nu(e);if(n.get(1)!==t.databaseId.projectId)throw new pa(fa.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new pa(fa.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new Ga(au(n))}function su(t,e){return eu(t.databaseId,e)}function ou(t){return new Ma(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function au(t){return ha(t.length>4&&"documents"===t.get(4)),t.popFirst(5)}function cu(t,e,n){return{name:ru(t,e),fields:n.value.mapValue.fields}}function lu(t,e){return{documents:[su(t,e.path)]}}function uu(t,e){const n={structuredQuery:{}},r=e.path;null!==e.collectionGroup?(n.parent=su(t,r),n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(n.parent=su(t,r.popLast()),n.structuredQuery.from=[{collectionId:r.lastSegment()}]);const i=function(t){if(0===t.length)return;const e=t.map((t=>function(t){if("=="===t.op){if(sc(t.value))return{unaryFilter:{field:yu(t.field),op:"IS_NAN"}};if(ic(t.value))return{unaryFilter:{field:yu(t.field),op:"IS_NULL"}}}else if("!="===t.op){if(sc(t.value))return{unaryFilter:{field:yu(t.field),op:"IS_NOT_NAN"}};if(ic(t.value))return{unaryFilter:{field:yu(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:yu(t.field),op:mu(t.op),value:t.value}}}(t)));return 1===e.length?e[0]:{compositeFilter:{op:"AND",filters:e}}}(e.filters);i&&(n.structuredQuery.where=i);const s=function(t){if(0!==t.length)return t.map((t=>function(t){return{field:yu(t.field),direction:gu(t.dir)}}(t)))}(e.orderBy);s&&(n.structuredQuery.orderBy=s);const o=function(t,e){return t.C||Ka(e)?e:{value:e}}(t,e.limit);return null!==o&&(n.structuredQuery.limit=o),e.startAt&&(n.structuredQuery.startAt=fu(e.startAt)),e.endAt&&(n.structuredQuery.endAt=fu(e.endAt)),n}function hu(t){let e=function(t){const e=nu(t);return 4===e.length?Ma.emptyPath():au(e)}(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){ha(1===r);const t=n.from[0];t.allDescendants?i=t.collectionId:e=e.child(t.collectionId)}let s=[];n.where&&(s=du(n.where));let o=[];n.orderBy&&(o=n.orderBy.map((t=>function(t){return new Cc(vu(t.field),function(t){switch(t){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction))}(t))));let a=null;n.limit&&(a=function(t){let e;return e="object"==typeof t?t.value:t,Ka(e)?null:e}(n.limit));let c=null;n.startAt&&(c=pu(n.startAt));let l=null;return n.endAt&&(l=pu(n.endAt)),function(t,e,n,r,i,s,o,a){return new Lc(t,e,n,r,i,s,o,a)}(e,i,o,s,a,"F",c,l)}function du(t){return t?void 0!==t.unaryFilter?[Eu(t)]:void 0!==t.fieldFilter?[wu(t)]:void 0!==t.compositeFilter?t.compositeFilter.filters.map((t=>du(t))).reduce(((t,e)=>t.concat(e))):ua():[]}function fu(t){return{before:t.before,values:t.position}}function pu(t){const e=!!t.before,n=t.values||[];return new kc(n,e)}function gu(t){return Gl[t]}function mu(t){return Jl[t]}function yu(t){return{fieldPath:t.canonicalString()}}function vu(t){return Pa.fromServerFormat(t.fieldPath)}function wu(t){return mc.create(vu(t.fieldFilter.field),function(t){switch(t){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return ua()}}(t.fieldFilter.op),t.fieldFilter.value)}function Eu(t){switch(t.unaryFilter.op){case"IS_NAN":const e=vu(t.unaryFilter.field);return mc.create(e,"==",{doubleValue:NaN});case"IS_NULL":const n=vu(t.unaryFilter.field);return mc.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=vu(t.unaryFilter.field);return mc.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const i=vu(t.unaryFilter.field);return mc.create(i,"!=",{nullValue:"NULL_VALUE"});default:return ua()}}function _u(t){const e=[];return t.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function bu(t){return t.length>=4&&"projects"===t.get(0)&&"databases"===t.get(2)}const Tu="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Iu{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((t=>t()))}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ku{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&ua(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new ku(((n,r)=>{this.nextCallback=e=>{this.wrapSuccess(t,e).next(n,r)},this.catchCallback=t=>{this.wrapFailure(e,t).next(n,r)}}))}toPromise(){return new Promise(((t,e)=>{this.next(t,e)}))}wrapUserFunction(t){try{const e=t();return e instanceof ku?e:ku.resolve(e)}catch(t){return ku.reject(t)}}wrapSuccess(t,e){return t?this.wrapUserFunction((()=>t(e))):ku.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction((()=>t(e))):ku.reject(e)}static resolve(t){return new ku(((e,n)=>{e(t)}))}static reject(t){return new ku(((e,n)=>{n(t)}))}static waitFor(t){return new ku(((e,n)=>{let r=0,i=0,s=!1;t.forEach((t=>{++r,t.next((()=>{++i,s&&i===r&&e()}),(t=>n(t)))})),s=!0,i===r&&e()}))}static or(t){let e=ku.resolve(!1);for(const n of t)e=e.next((t=>t?ku.resolve(t):n()));return e}static forEach(t,e){const n=[];return t.forEach(((t,r)=>{n.push(e.call(this,t,r))})),this.waitFor(n)}}function Su(t){return"IndexedDbTransactionError"===t.name}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Cu{constructor(t,e,n,r){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let e=0;e<this.mutations.length;e++){const r=this.mutations[e];r.key.isEqual(t.key)&&ll(r,t,n[e])}}applyToLocalView(t){for(const e of this.baseMutations)e.key.isEqual(t.key)&&ul(e,t,this.localWriteTime);for(const e of this.mutations)e.key.isEqual(t.key)&&ul(e,t,this.localWriteTime)}applyToLocalDocumentSet(t){this.mutations.forEach((e=>{const n=t.get(e.key),r=n;this.applyToLocalView(r),n.isValidDocument()||r.convertToNoDocument(xa.min())}))}keys(){return this.mutations.reduce(((t,e)=>t.add(e.key)),Pl())}isEqual(t){return this.batchId===t.batchId&&Ca(this.mutations,t.mutations,((t,e)=>dl(t,e)))&&Ca(this.baseMutations,t.baseMutations,((t,e)=>dl(t,e)))}}class Au{constructor(t,e,n,r){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=r}static from(t,e,n){ha(t.mutations.length===n.length);let r=Ml;const i=t.mutations;for(let t=0;t<i.length;t++)r=r.insert(i[t].key,n[t].version);return new Au(t,e,n,r)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class xu{constructor(t,e,n,r,i=xa.min(),s=xa.min(),o=Fa.EMPTY_BYTE_STRING){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=s,this.resumeToken=o}withSequenceNumber(t){return new xu(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken)}withResumeToken(t,e){return new xu(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t)}withLastLimboFreeSnapshotVersion(t){return new xu(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Nu{constructor(t){this.Gt=t}}function Lu(t){const e=hu({parent:t.parent,structuredQuery:t.structuredQuery});return"LAST"===t.limitType?function(t,e,n){return new Lc(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}(e,e.limit,"L"):e}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Ru{constructor(){this.zt=new Du}addToCollectionParentIndex(t,e){return this.zt.add(e),ku.resolve()}getCollectionParents(t,e){return ku.resolve(this.zt.getEntries(e))}}class Du{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e]||new Al(Ma.comparator),i=!r.has(n);return this.index[e]=r.add(n),i}has(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e];return r&&r.has(n)}getEntries(t){return(this.index[t]||new Al(Ma.comparator)).toArray()}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Mu{constructor(t){this.se=t}next(){return this.se+=2,this.se}static ie(){return new Mu(0)}static re(){return new Mu(-1)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */async function Ou(t){if(t.code!==fa.FAILED_PRECONDITION||t.message!==Tu)throw t;oa("LocalStore","Unexpectedly lost primary lease")}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Pu{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={}}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0!==n)for(const[e,r]of n)if(this.equalsFn(e,t))return r}has(t){return void 0!==this.get(t)}set(t,e){const n=this.mapKeyFn(t),r=this.inner[n];if(void 0!==r){for(let n=0;n<r.length;n++)if(this.equalsFn(r[n][0],t))return void(r[n]=[t,e]);r.push([t,e])}else this.inner[n]=[[t,e]]}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],t))return 1===n.length?delete this.inner[e]:n.splice(r,1),!0;return!1}forEach(t){La(this.inner,((e,n)=>{for(const[e,r]of n)t(e,r)}))}isEmpty(){return Ra(this.inner)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Uu{constructor(){this.changes=new Pu((t=>t.toString()),((t,e)=>t.isEqual(e))),this.changesApplied=!1}getReadTime(t){const e=this.changes.get(t);return e?e.readTime:xa.min()}addEntry(t,e){this.assertNotApplied(),this.changes.set(t.key,{document:t,readTime:e})}removeEntry(t,e=null){this.assertNotApplied(),this.changes.set(t,{document:uc.newInvalidDocument(t),readTime:e})}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return void 0!==n?ku.resolve(n.document):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Fu{constructor(t,e,n){this.Je=t,this.An=e,this.Jt=n}Rn(t,e){return this.An.getAllMutationBatchesAffectingDocumentKey(t,e).next((n=>this.Pn(t,e,n)))}Pn(t,e,n){return this.Je.getEntry(t,e).next((t=>{for(const e of n)e.applyToLocalView(t);return t}))}bn(t,e){t.forEach(((t,n)=>{for(const t of e)t.applyToLocalView(n)}))}vn(t,e){return this.Je.getEntries(t,e).next((e=>this.Vn(t,e).next((()=>e))))}Vn(t,e){return this.An.getAllMutationBatchesAffectingDocumentKeys(t,e).next((t=>this.bn(e,t)))}getDocumentsMatchingQuery(t,e,n){return function(t){return Ga.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length}(e)?this.Sn(t,e.path):function(t){return null!==t.collectionGroup}(e)?this.Dn(t,e,n):this.Cn(t,e,n)}Sn(t,e){return this.Rn(t,new Ga(e)).next((t=>{let e=Dl();return t.isFoundDocument()&&(e=e.insert(t.key,t)),e}))}Dn(t,e,n){const r=e.collectionGroup;let i=Dl();return this.Jt.getCollectionParents(t,r).next((s=>ku.forEach(s,(s=>{const o=function(t,e){return new Lc(e,null,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}(e,s.child(r));return this.Cn(t,o,n).next((t=>{t.forEach(((t,e)=>{i=i.insert(t,e)}))}))})).next((()=>i))))}Cn(t,e,n){let r,i;return this.Je.getDocumentsMatchingQuery(t,e,n).next((n=>(r=n,this.An.getAllMutationBatchesAffectingQuery(t,e)))).next((e=>(i=e,this.Nn(t,i,r).next((t=>{r=t;for(const t of i)for(const e of t.mutations){const n=e.key;let i=r.get(n);null==i&&(i=uc.newInvalidDocument(n),r=r.insert(n,i)),ul(e,i,t.localWriteTime),i.isFoundDocument()||(r=r.remove(n))}}))))).next((()=>(r.forEach(((t,n)=>{$c(e,n)||(r=r.remove(t))})),r)))}Nn(t,e,n){let r=Pl();for(const t of e)for(const e of t.mutations)e instanceof gl&&null===n.get(e.key)&&(r=r.add(e.key));let i=n;return this.Je.getEntries(t,r).next((t=>(t.forEach(((t,e)=>{e.isFoundDocument()&&(i=i.insert(t,e))})),i)))}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Vu{constructor(t,e,n,r){this.targetId=t,this.fromCache=e,this.kn=n,this.xn=r}static $n(t,e){let n=Pl(),r=Pl();for(const t of e.docChanges)switch(t.type){case 0:n=n.add(t.doc.key);break;case 1:r=r.add(t.doc.key)}return new Vu(t,e.fromCache,n,r)}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class $u{Fn(t){this.On=t}getDocumentsMatchingQuery(t,e,n,r){return function(t){return 0===t.filters.length&&null===t.limit&&null==t.startAt&&null==t.endAt&&(0===t.explicitOrderBy.length||1===t.explicitOrderBy.length&&t.explicitOrderBy[0].field.isKeyField())}(e)||n.isEqual(xa.min())?this.Mn(t,e):this.On.vn(t,r).next((i=>{const s=this.Ln(e,i);return(Dc(e)||Mc(e))&&this.Bn(e.limitType,s,r,n)?this.Mn(t,e):(sa()<=_.DEBUG&&oa("QueryEngine","Re-using previous result from %s to execute query: %s",n.toString(),Vc(e)),this.On.getDocumentsMatchingQuery(t,e,n).next((t=>(s.forEach((e=>{t=t.insert(e.key,e)})),t))))}))}Ln(t,e){let n=new Al(jc(t));return e.forEach(((e,r)=>{$c(t,r)&&(n=n.add(r))})),n}Bn(t,e,n,r){if(n.size!==e.size)return!0;const i="F"===t?e.last():e.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}Mn(t,e){return sa()<=_.DEBUG&&oa("QueryEngine","Using full collection scan to execute query:",Vc(e)),this.On.getDocumentsMatchingQuery(t,e,xa.min())}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ju{constructor(t,e,n,r){this.persistence=t,this.Un=e,this.k=r,this.qn=new kl(Sa),this.Kn=new Pu((t=>fc(t)),pc),this.jn=xa.min(),this.An=t.getMutationQueue(n),this.Qn=t.getRemoteDocumentCache(),this.He=t.getTargetCache(),this.Wn=new Fu(this.Qn,this.An,this.persistence.getIndexManager()),this.Ye=t.getBundleCache(),this.Un.Fn(this.Wn)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(e=>t.collect(e,this.qn)))}}async function Bu(t,e){const n=da(t);let r=n.An,i=n.Wn;const s=await n.persistence.runTransaction("Handle user change","readonly",(t=>{let s;return n.An.getAllMutationBatches(t).next((o=>(s=o,r=n.persistence.getMutationQueue(e),i=new Fu(n.Qn,r,n.persistence.getIndexManager()),r.getAllMutationBatches(t)))).next((e=>{const n=[],r=[];let o=Pl();for(const t of s){n.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}for(const t of e){r.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}return i.vn(t,o).next((t=>({Gn:t,removedBatchIds:n,addedBatchIds:r})))}))}));return n.An=r,n.Wn=i,n.Un.Fn(n.Wn),s}function qu(t){const e=da(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.He.getLastRemoteSnapshotVersion(t)))}function zu(t,e){const n=da(t),r=e.snapshotVersion;let i=n.qn;return n.persistence.runTransaction("Apply remote event","readwrite-primary",(t=>{const s=n.Qn.newChangeBuffer({trackRemovals:!0});i=n.qn;const o=[];e.targetChanges.forEach(((e,s)=>{const a=i.get(s);if(!a)return;o.push(n.He.removeMatchingKeys(t,e.removedDocuments,s).next((()=>n.He.addMatchingKeys(t,e.addedDocuments,s))));const c=e.resumeToken;if(c.approximateByteSize()>0){const l=a.withResumeToken(c,r).withSequenceNumber(t.currentSequenceNumber);i=i.insert(s,l),function(t,e,n){return ha(e.resumeToken.approximateByteSize()>0),0===t.resumeToken.approximateByteSize()||(e.snapshotVersion.toMicroseconds()-t.snapshotVersion.toMicroseconds()>=3e8||n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0)}(a,l,e)&&o.push(n.He.updateTargetData(t,l))}}));let a=Ll();if(e.documentUpdates.forEach(((r,i)=>{e.resolvedLimboDocuments.has(r)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(t,r))})),o.push(function(t,e,n,r,i){let s=Pl();return n.forEach((t=>s=s.add(t))),e.getEntries(t,s).next((t=>{let s=Ll();return n.forEach(((n,o)=>{const a=t.get(n),c=(null==i?void 0:i.get(n))||r;o.isNoDocument()&&o.version.isEqual(xa.min())?(e.removeEntry(n,c),s=s.insert(n,o)):!a.isValidDocument()||o.version.compareTo(a.version)>0||0===o.version.compareTo(a.version)&&a.hasPendingWrites?(e.addEntry(o,c),s=s.insert(n,o)):oa("LocalStore","Ignoring outdated watch update for ",n,". Current version:",a.version," Watch version:",o.version)})),s}))}(t,s,e.documentUpdates,r,void 0).next((t=>{a=t}))),!r.isEqual(xa.min())){const e=n.He.getLastRemoteSnapshotVersion(t).next((e=>n.He.setTargetsMetadata(t,t.currentSequenceNumber,r)));o.push(e)}return ku.waitFor(o).next((()=>s.apply(t))).next((()=>n.Wn.Vn(t,a))).next((()=>a))})).then((t=>(n.qn=i,t)))}function Hu(t,e){const n=da(t);return n.persistence.runTransaction("Get next mutation batch","readonly",(t=>(void 0===e&&(e=-1),n.An.getNextMutationBatchAfterBatchId(t,e))))}async function Ku(t,e,n){const r=da(t),i=r.qn.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,(t=>r.persistence.referenceDelegate.removeTarget(t,i)))}catch(t){if(!Su(t))throw t;oa("LocalStore",`Failed to update sequence numbers for target ${e}: ${t}`)}r.qn=r.qn.remove(e),r.Kn.delete(i.target)}function Wu(t,e,n){const r=da(t);let i=xa.min(),s=Pl();return r.persistence.runTransaction("Execute query","readonly",(t=>function(t,e,n){const r=da(t),i=r.Kn.get(n);return void 0!==i?ku.resolve(r.qn.get(i)):r.He.getTargetData(e,n)}(r,t,Pc(e)).next((e=>{if(e)return i=e.lastLimboFreeSnapshotVersion,r.He.getMatchingKeysForTargetId(t,e.targetId).next((t=>{s=t}))})).next((()=>r.Un.getDocumentsMatchingQuery(t,e,n?i:xa.min(),n?s:Pl()))).next((t=>({documents:t,zn:s})))))}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Gu{constructor(t){this.k=t,this.Xn=new Map,this.Zn=new Map}getBundleMetadata(t,e){return ku.resolve(this.Xn.get(e))}saveBundleMetadata(t,e){var n;return this.Xn.set(e.id,{id:(n=e).id,version:n.version,createTime:tu(n.createTime)}),ku.resolve()}getNamedQuery(t,e){return ku.resolve(this.Zn.get(e))}saveNamedQuery(t,e){return this.Zn.set(e.name,function(t){return{name:t.name,query:Lu(t.bundledQuery),readTime:tu(t.readTime)}}(e)),ku.resolve()}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Ju{constructor(){this.ts=new Al(Xu.es),this.ns=new Al(Xu.ss)}isEmpty(){return this.ts.isEmpty()}addReference(t,e){const n=new Xu(t,e);this.ts=this.ts.add(n),this.ns=this.ns.add(n)}rs(t,e){t.forEach((t=>this.addReference(t,e)))}removeReference(t,e){this.os(new Xu(t,e))}cs(t,e){t.forEach((t=>this.removeReference(t,e)))}us(t){const e=new Ga(new Ma([])),n=new Xu(e,t),r=new Xu(e,t+1),i=[];return this.ns.forEachInRange([n,r],(t=>{this.os(t),i.push(t.key)})),i}hs(){this.ts.forEach((t=>this.os(t)))}os(t){this.ts=this.ts.delete(t),this.ns=this.ns.delete(t)}ls(t){const e=new Ga(new Ma([])),n=new Xu(e,t),r=new Xu(e,t+1);let i=Pl();return this.ns.forEachInRange([n,r],(t=>{i=i.add(t.key)})),i}containsKey(t){const e=new Xu(t,0),n=this.ts.firstAfterOrEqual(e);return null!==n&&t.isEqual(n.key)}}class Xu{constructor(t,e){this.key=t,this.fs=e}static es(t,e){return Ga.comparator(t.key,e.key)||Sa(t.fs,e.fs)}static ss(t,e){return Sa(t.fs,e.fs)||Ga.comparator(t.key,e.key)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Yu{constructor(t,e){this.Jt=t,this.referenceDelegate=e,this.An=[],this.ds=1,this.ws=new Al(Xu.es)}checkEmpty(t){return ku.resolve(0===this.An.length)}addMutationBatch(t,e,n,r){const i=this.ds;this.ds++,this.An.length>0&&this.An[this.An.length-1];const s=new Cu(i,e,n,r);this.An.push(s);for(const e of r)this.ws=this.ws.add(new Xu(e.key,i)),this.Jt.addToCollectionParentIndex(t,e.key.path.popLast());return ku.resolve(s)}lookupMutationBatch(t,e){return ku.resolve(this._s(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,r=this.gs(n),i=r<0?0:r;return ku.resolve(this.An.length>i?this.An[i]:null)}getHighestUnacknowledgedBatchId(){return ku.resolve(0===this.An.length?-1:this.ds-1)}getAllMutationBatches(t){return ku.resolve(this.An.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new Xu(e,0),r=new Xu(e,Number.POSITIVE_INFINITY),i=[];return this.ws.forEachInRange([n,r],(t=>{const e=this._s(t.fs);i.push(e)})),ku.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Al(Sa);return e.forEach((t=>{const e=new Xu(t,0),r=new Xu(t,Number.POSITIVE_INFINITY);this.ws.forEachInRange([e,r],(t=>{n=n.add(t.fs)}))})),ku.resolve(this.ys(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,r=n.length+1;let i=n;Ga.isDocumentKey(i)||(i=i.child(""));const s=new Xu(new Ga(i),0);let o=new Al(Sa);return this.ws.forEachWhile((t=>{const e=t.key.path;return!!n.isPrefixOf(e)&&(e.length===r&&(o=o.add(t.fs)),!0)}),s),ku.resolve(this.ys(o))}ys(t){const e=[];return t.forEach((t=>{const n=this._s(t);null!==n&&e.push(n)})),e}removeMutationBatch(t,e){ha(0===this.ps(e.batchId,"removed")),this.An.shift();let n=this.ws;return ku.forEach(e.mutations,(r=>{const i=new Xu(r.key,e.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(t,r.key)})).next((()=>{this.ws=n}))}ee(t){}containsKey(t,e){const n=new Xu(e,0),r=this.ws.firstAfterOrEqual(n);return ku.resolve(e.isEqual(r&&r.key))}performConsistencyCheck(t){return this.An.length,ku.resolve()}ps(t,e){return this.gs(t)}gs(t){return 0===this.An.length?0:t-this.An[0].batchId}_s(t){const e=this.gs(t);return e<0||e>=this.An.length?null:this.An[e]}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Qu{constructor(t,e){this.Jt=t,this.Ts=e,this.docs=new kl(Ga.comparator),this.size=0}addEntry(t,e,n){const r=e.key,i=this.docs.get(r),s=i?i.size:0,o=this.Ts(e);return this.docs=this.docs.insert(r,{document:e.clone(),size:o,readTime:n}),this.size+=o-s,this.Jt.addToCollectionParentIndex(t,r.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return ku.resolve(n?n.document.clone():uc.newInvalidDocument(e))}getEntries(t,e){let n=Ll();return e.forEach((t=>{const e=this.docs.get(t);n=n.insert(t,e?e.document.clone():uc.newInvalidDocument(t))})),ku.resolve(n)}getDocumentsMatchingQuery(t,e,n){let r=Ll();const i=new Ga(e.path.child("")),s=this.docs.getIteratorFrom(i);for(;s.hasNext();){const{key:t,value:{document:i,readTime:o}}=s.getNext();if(!e.path.isPrefixOf(t.path))break;o.compareTo(n)<=0||$c(e,i)&&(r=r.insert(i.key,i.clone()))}return ku.resolve(r)}Es(t,e){return ku.forEach(this.docs,(t=>e(t)))}newChangeBuffer(t){return new Zu(this)}getSize(t){return ku.resolve(this.size)}}class Zu extends Uu{constructor(t){super(),this.De=t}applyChanges(t){const e=[];return this.changes.forEach(((n,r)=>{r.document.isValidDocument()?e.push(this.De.addEntry(t,r.document,this.getReadTime(n))):this.De.removeEntry(n)})),ku.waitFor(e)}getFromCache(t,e){return this.De.getEntry(t,e)}getAllFromCache(t,e){return this.De.getEntries(t,e)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class th{constructor(t){this.persistence=t,this.Is=new Pu((t=>fc(t)),pc),this.lastRemoteSnapshotVersion=xa.min(),this.highestTargetId=0,this.As=0,this.Rs=new Ju,this.targetCount=0,this.Ps=Mu.ie()}forEachTarget(t,e){return this.Is.forEach(((t,n)=>e(n))),ku.resolve()}getLastRemoteSnapshotVersion(t){return ku.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return ku.resolve(this.As)}allocateTargetId(t){return this.highestTargetId=this.Ps.next(),ku.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.As&&(this.As=e),ku.resolve()}ce(t){this.Is.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.Ps=new Mu(e),this.highestTargetId=e),t.sequenceNumber>this.As&&(this.As=t.sequenceNumber)}addTargetData(t,e){return this.ce(e),this.targetCount+=1,ku.resolve()}updateTargetData(t,e){return this.ce(e),ku.resolve()}removeTargetData(t,e){return this.Is.delete(e.target),this.Rs.us(e.targetId),this.targetCount-=1,ku.resolve()}removeTargets(t,e,n){let r=0;const i=[];return this.Is.forEach(((s,o)=>{o.sequenceNumber<=e&&null===n.get(o.targetId)&&(this.Is.delete(s),i.push(this.removeMatchingKeysForTargetId(t,o.targetId)),r++)})),ku.waitFor(i).next((()=>r))}getTargetCount(t){return ku.resolve(this.targetCount)}getTargetData(t,e){const n=this.Is.get(e)||null;return ku.resolve(n)}addMatchingKeys(t,e,n){return this.Rs.rs(e,n),ku.resolve()}removeMatchingKeys(t,e,n){this.Rs.cs(e,n);const r=this.persistence.referenceDelegate,i=[];return r&&e.forEach((e=>{i.push(r.markPotentiallyOrphaned(t,e))})),ku.waitFor(i)}removeMatchingKeysForTargetId(t,e){return this.Rs.us(e),ku.resolve()}getMatchingKeysForTargetId(t,e){const n=this.Rs.ls(e);return ku.resolve(n)}containsKey(t,e){return ku.resolve(this.Rs.containsKey(e))}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class eh{constructor(t,e){this.bs={},this.Be=new Ta(0),this.Ue=!1,this.Ue=!0,this.referenceDelegate=t(this),this.He=new th(this),this.Jt=new Ru,this.Je=function(t,e){return new Qu(t,e)}(this.Jt,(t=>this.referenceDelegate.vs(t))),this.k=new Nu(e),this.Ye=new Gu(this.k)}start(){return Promise.resolve()}shutdown(){return this.Ue=!1,Promise.resolve()}get started(){return this.Ue}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(){return this.Jt}getMutationQueue(t){let e=this.bs[t.toKey()];return e||(e=new Yu(this.Jt,this.referenceDelegate),this.bs[t.toKey()]=e),e}getTargetCache(){return this.He}getRemoteDocumentCache(){return this.Je}getBundleCache(){return this.Ye}runTransaction(t,e,n){oa("MemoryPersistence","Starting transaction:",t);const r=new nh(this.Be.next());return this.referenceDelegate.Vs(),n(r).next((t=>this.referenceDelegate.Ss(r).next((()=>t)))).toPromise().then((t=>(r.raiseOnCommittedEvent(),t)))}Ds(t,e){return ku.or(Object.values(this.bs).map((n=>()=>n.containsKey(t,e))))}}class nh extends Iu{constructor(t){super(),this.currentSequenceNumber=t}}class rh{constructor(t){this.persistence=t,this.Cs=new Ju,this.Ns=null}static ks(t){return new rh(t)}get xs(){if(this.Ns)return this.Ns;throw ua()}addReference(t,e,n){return this.Cs.addReference(n,e),this.xs.delete(n.toString()),ku.resolve()}removeReference(t,e,n){return this.Cs.removeReference(n,e),this.xs.add(n.toString()),ku.resolve()}markPotentiallyOrphaned(t,e){return this.xs.add(e.toString()),ku.resolve()}removeTarget(t,e){this.Cs.us(e.targetId).forEach((t=>this.xs.add(t.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next((t=>{t.forEach((t=>this.xs.add(t.toString())))})).next((()=>n.removeTargetData(t,e)))}Vs(){this.Ns=new Set}Ss(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return ku.forEach(this.xs,(n=>{const r=Ga.fromPath(n);return this.$s(t,r).next((t=>{t||e.removeEntry(r)}))})).next((()=>(this.Ns=null,e.apply(t))))}updateLimboDocument(t,e){return this.$s(t,e).next((t=>{t?this.xs.delete(e.toString()):this.xs.add(e.toString())}))}vs(t){return 0}$s(t,e){return ku.or([()=>ku.resolve(this.Cs.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ds(t,e)])}}class ih{constructor(){this.activeTargetIds=Fl()}Ms(t){this.activeTargetIds=this.activeTargetIds.add(t)}Ls(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Os(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class sh{constructor(){this.pi=new ih,this.Ti={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t){return this.pi.Ms(t),this.Ti[t]||"not-current"}updateQueryState(t,e,n){this.Ti[t]=e}removeLocalQueryTarget(t){this.pi.Ls(t)}isLocalQueryTarget(t){return this.pi.activeTargetIds.has(t)}clearQueryState(t){delete this.Ti[t]}getAllActiveQueryTargets(){return this.pi.activeTargetIds}isActiveQueryTarget(t){return this.pi.activeTargetIds.has(t)}start(){return this.pi=new ih,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(){}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class oh{Ei(t){}shutdown(){}}
/**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ah{constructor(){this.Ii=()=>this.Ai(),this.Ri=()=>this.Pi(),this.bi=[],this.vi()}Ei(t){this.bi.push(t)}shutdown(){window.removeEventListener("online",this.Ii),window.removeEventListener("offline",this.Ri)}vi(){window.addEventListener("online",this.Ii),window.addEventListener("offline",this.Ri)}Ai(){oa("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const t of this.bi)t(0)}Pi(){oa("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const t of this.bi)t(1)}static bt(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const ch={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery"};
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class lh{constructor(t){this.Vi=t.Vi,this.Si=t.Si}Di(t){this.Ci=t}Ni(t){this.ki=t}onMessage(t){this.xi=t}close(){this.Si()}send(t){this.Vi(t)}$i(){this.Ci()}Fi(t){this.ki(t)}Oi(t){this.xi(t)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class uh extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http";this.Mi=e+"://"+t.host,this.Li="projects/"+this.databaseId.projectId+"/databases/"+this.databaseId.database+"/documents"}Bi(t,e,n,r,i){const s=this.Ui(t,e);oa("RestConnection","Sending: ",s,n);const o={};return this.qi(o,r,i),this.Ki(t,s,o,n).then((t=>(oa("RestConnection","Received: ",t),t)),(e=>{throw ca("RestConnection",`${t} failed with error: `,e,"url: ",s,"request:",n),e}))}ji(t,e,n,r,i){return this.Bi(t,e,n,r,i)}qi(t,e,n){t["X-Goog-Api-Client"]="gl-js/ fire/"+ra,t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach(((e,n)=>t[n]=e)),n&&n.headers.forEach(((e,n)=>t[n]=e))}Ui(t,e){const n=ch[t];return`${this.Mi}/v1/${e}:${n}`}}{constructor(t){super(t),this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams}Ki(t,e,n,r){return new Promise(((i,s)=>{const o=new ta;o.listenOnce(Go.COMPLETE,(()=>{try{switch(o.getLastErrorCode()){case Wo.NO_ERROR:const e=o.getResponseJson();oa("Connection","XHR received:",JSON.stringify(e)),i(e);break;case Wo.TIMEOUT:oa("Connection",'RPC "'+t+'" timed out'),s(new pa(fa.DEADLINE_EXCEEDED,"Request time out"));break;case Wo.HTTP_ERROR:const n=o.getStatus();if(oa("Connection",'RPC "'+t+'" failed with status:',n,"response text:",o.getResponseText()),n>0){const t=o.getResponseJson().error;if(t&&t.status&&t.message){const e=function(t){const e=t.toLowerCase().replace(/_/g,"-");return Object.values(fa).indexOf(e)>=0?e:fa.UNKNOWN}(t.status);s(new pa(e,t.message))}else s(new pa(fa.UNKNOWN,"Server responded with status "+o.getStatus()))}else s(new pa(fa.UNAVAILABLE,"Connection failed."));break;default:ua()}}finally{oa("Connection",'RPC "'+t+'" completed.')}}));const a=JSON.stringify(r);o.send(e,"POST",a,n,15)}))}Qi(t,e,n){const c=[this.Mi,"/","google.firestore.v1.Firestore","/",t,"/channel"],l=new Bo,u=Mi(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling};this.useFetchStreams&&(h.xmlHttpFactory=new Qo({})),this.qi(h.initMessageHeaders,e,n),i()||o()||r().indexOf("Electron/")>=0||a()||r().indexOf("MSAppHost/")>=0||s()||(h.httpHeadersOverwriteParam="$httpHeaders");const d=c.join("");oa("Connection","Creating WebChannel: "+d,h);const f=l.createWebChannel(d,h);let p=!1,g=!1;const m=new lh({Vi:t=>{g?oa("Connection","Not sending because WebChannel is closed:",t):(p||(oa("Connection","Opening WebChannel transport."),f.open(),p=!0),oa("Connection","WebChannel sending:",t),f.send(t))},Si:()=>f.close()}),y=(t,e,n)=>{t.listen(e,(t=>{try{n(t)}catch(t){setTimeout((()=>{throw t}),0)}}))};return y(f,Zo.EventType.OPEN,(()=>{g||oa("Connection","WebChannel transport opened.")})),y(f,Zo.EventType.CLOSE,(()=>{g||(g=!0,oa("Connection","WebChannel transport closed"),m.Fi())})),y(f,Zo.EventType.ERROR,(t=>{g||(g=!0,ca("Connection","WebChannel transport errored:",t),m.Fi(new pa(fa.UNAVAILABLE,"The operation could not be completed")))})),y(f,Zo.EventType.MESSAGE,(t=>{var e;if(!g){const n=t.data[0];ha(!!n);const r=n,i=r.error||(null===(e=r[0])||void 0===e?void 0:e.error);if(i){oa("Connection","WebChannel received error:",i);const t=i.status;let e=function(t){const e=bl[t];if(void 0!==e)return Il(e)}(t),n=i.message;void 0===e&&(e=fa.INTERNAL,n="Unknown error status: "+t+" with message "+i.message),g=!0,m.Fi(new pa(e,n)),f.close()}else oa("Connection","WebChannel received:",n),m.Oi(n)}})),y(u,Jo.STAT_EVENT,(t=>{t.stat===Xo?oa("Connection","Detected buffering proxy"):t.stat===Yo&&oa("Connection","Detected no buffering proxy")})),setTimeout((()=>{m.$i()}),0),m}}function hh(){return"undefined"!=typeof document?document:null}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function dh(t){return new Xl(t,!0)}class fh{constructor(t,e,n=1e3,r=1.5,i=6e4){this.Oe=t,this.timerId=e,this.Wi=n,this.Gi=r,this.zi=i,this.Hi=0,this.Ji=null,this.Yi=Date.now(),this.reset()}reset(){this.Hi=0}Xi(){this.Hi=this.zi}Zi(t){this.cancel();const e=Math.floor(this.Hi+this.tr()),n=Math.max(0,Date.now()-this.Yi),r=Math.max(0,e-n);r>0&&oa("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Hi} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.Ji=this.Oe.enqueueAfterDelay(this.timerId,r,(()=>(this.Yi=Date.now(),t()))),this.Hi*=this.Gi,this.Hi<this.Wi&&(this.Hi=this.Wi),this.Hi>this.zi&&(this.Hi=this.zi)}er(){null!==this.Ji&&(this.Ji.skipDelay(),this.Ji=null)}cancel(){null!==this.Ji&&(this.Ji.cancel(),this.Ji=null)}tr(){return(Math.random()-.5)*this.Hi}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ph{constructor(t,e,n,r,i,s,o,a){this.Oe=t,this.nr=n,this.sr=r,this.ir=i,this.authCredentialsProvider=s,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.rr=0,this.ar=null,this.cr=null,this.stream=null,this.ur=new fh(t,e)}hr(){return 1===this.state||5===this.state||this.lr()}lr(){return 2===this.state||3===this.state}start(){4!==this.state?this.auth():this.dr()}async stop(){this.hr()&&await this.close(0)}wr(){this.state=0,this.ur.reset()}_r(){this.lr()&&null===this.ar&&(this.ar=this.Oe.enqueueAfterDelay(this.nr,6e4,(()=>this.mr())))}gr(t){this.yr(),this.stream.send(t)}async mr(){if(this.lr())return this.close(0)}yr(){this.ar&&(this.ar.cancel(),this.ar=null)}pr(){this.cr&&(this.cr.cancel(),this.cr=null)}async close(t,e){this.yr(),this.pr(),this.ur.cancel(),this.rr++,4!==t?this.ur.reset():e&&e.code===fa.RESOURCE_EXHAUSTED?(aa(e.toString()),aa("Using maximum backoff delay to prevent overloading the backend."),this.ur.Xi()):e&&e.code===fa.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.Tr(),this.stream.close(),this.stream=null),this.state=t,await this.listener.Ni(e)}Tr(){}auth(){this.state=1;const t=this.Er(this.rr),e=this.rr;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([t,n])=>{this.rr===e&&this.Ir(t,n)}),(e=>{t((()=>{const t=new pa(fa.UNKNOWN,"Fetching auth token failed: "+e.message);return this.Ar(t)}))}))}Ir(t,e){const n=this.Er(this.rr);this.stream=this.Rr(t,e),this.stream.Di((()=>{n((()=>(this.state=2,this.cr=this.Oe.enqueueAfterDelay(this.sr,1e4,(()=>(this.lr()&&(this.state=3),Promise.resolve()))),this.listener.Di())))})),this.stream.Ni((t=>{n((()=>this.Ar(t)))})),this.stream.onMessage((t=>{n((()=>this.onMessage(t)))}))}dr(){this.state=5,this.ur.Zi((async()=>{this.state=0,this.start()}))}Ar(t){return oa("PersistentStream",`close with error: ${t}`),this.stream=null,this.close(4,t)}Er(t){return e=>{this.Oe.enqueueAndForget((()=>this.rr===t?e():(oa("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class gh extends ph{constructor(t,e,n,r,i,s){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,r,s),this.k=i}Rr(t,e){return this.ir.Qi("Listen",t,e)}onMessage(t){this.ur.reset();const e=function(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(t){return"NO_CHANGE"===t?0:"ADD"===t?1:"REMOVE"===t?2:"CURRENT"===t?3:"RESET"===t?4:ua()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(t,e){return t.C?(ha(void 0===e||"string"==typeof e),Fa.fromBase64String(e||"")):(ha(void 0===e||e instanceof Uint8Array),Fa.fromUint8Array(e||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(t){const e=void 0===t.code?fa.UNKNOWN:Il(t.code);return new pa(e,t.message||"")}(o);n=new ql(r,i,s,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=iu(t,r.document.name),s=tu(r.document.updateTime),o=new cc({mapValue:{fields:r.document.fields}}),a=uc.newFoundDocument(i,s,o),c=r.targetIds||[],l=r.removedTargetIds||[];n=new jl(c,l,a.key,a)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=iu(t,r.document),s=r.readTime?tu(r.readTime):xa.min(),o=uc.newNoDocument(i,s),a=r.removedTargetIds||[];n=new jl([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=iu(t,r.document),s=r.removedTargetIds||[];n=new jl([],s,i,null)}else{if(!("filter"in e))return ua();{e.filter;const t=e.filter;t.targetId;const r=t.count||0,i=new _l(r),s=t.targetId;n=new Bl(s,i)}}return n}(this.k,t),n=function(t){if(!("targetChange"in t))return xa.min();const e=t.targetChange;return e.targetIds&&e.targetIds.length?xa.min():e.readTime?tu(e.readTime):xa.min()}(t);return this.listener.Pr(e,n)}br(t){const e={};e.database=ou(this.k),e.addTarget=function(t,e){let n;const r=e.target;return n=gc(r)?{documents:lu(t,r)}:{query:uu(t,r)},n.targetId=e.targetId,e.resumeToken.approximateByteSize()>0?n.resumeToken=Ql(t,e.resumeToken):e.snapshotVersion.compareTo(xa.min())>0&&(n.readTime=Yl(t,e.snapshotVersion.toTimestamp())),n}(this.k,t);const n=function(t,e){const n=function(t,e){switch(e){case 0:return null;case 1:return"existence-filter-mismatch";case 2:return"limbo-document";default:return ua()}}(0,e.purpose);return null==n?null:{"goog-listen-tags":n}}(this.k,t);n&&(e.labels=n),this.gr(e)}vr(t){const e={};e.database=ou(this.k),e.removeTarget=t,this.gr(e)}}class mh extends ph{constructor(t,e,n,r,i,s){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,r,s),this.k=i,this.Vr=!1}get Sr(){return this.Vr}start(){this.Vr=!1,this.lastStreamToken=void 0,super.start()}Tr(){this.Vr&&this.Dr([])}Rr(t,e){return this.ir.Qi("Write",t,e)}onMessage(t){if(ha(!!t.streamToken),this.lastStreamToken=t.streamToken,this.Vr){this.ur.reset();const e=function(t,e){return t&&t.length>0?(ha(void 0!==e),t.map((t=>function(t,e){let n=t.updateTime?tu(t.updateTime):tu(e);return n.isEqual(xa.min())&&(n=tu(e)),new sl(n,t.transformResults||[])}(t,e)))):[]}(t.writeResults,t.commitTime),n=tu(t.commitTime);return this.listener.Cr(n,e)}return ha(!t.writeResults||0===t.writeResults.length),this.Vr=!0,this.listener.Nr()}kr(){const t={};t.database=ou(this.k),this.gr(t)}Dr(t){const e={streamToken:this.lastStreamToken,writes:t.map((t=>function(t,e){let n;if(e instanceof pl)n={update:cu(t,e.key,e.value)};else if(e instanceof wl)n={delete:ru(t,e.key)};else if(e instanceof gl)n={update:cu(t,e.key,e.data),updateMask:_u(e.fieldMask)};else{if(!(e instanceof El))return ua();n={verify:ru(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map((t=>function(t,e){const n=e.transform;if(n instanceof Xc)return{fieldPath:e.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof Yc)return{fieldPath:e.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof Zc)return{fieldPath:e.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof el)return{fieldPath:e.field.canonicalString(),increment:n.N};throw ua()}(0,t)))),e.precondition.isNone||(n.currentDocument=function(t,e){return void 0!==e.updateTime?{updateTime:Zl(t,e.updateTime)}:void 0!==e.exists?{exists:e.exists}:ua()}(t,e.precondition)),n}(this.k,t)))};this.gr(e)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class yh extends class{}{constructor(t,e,n,r){super(),this.authCredentials=t,this.appCheckCredentials=e,this.ir=n,this.k=r,this.$r=!1}Fr(){if(this.$r)throw new pa(fa.FAILED_PRECONDITION,"The client has already been terminated.")}Bi(t,e,n){return this.Fr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([r,i])=>this.ir.Bi(t,e,n,r,i))).catch((t=>{throw"FirebaseError"===t.name?(t.code===fa.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new pa(fa.UNKNOWN,t.toString())}))}ji(t,e,n){return this.Fr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([r,i])=>this.ir.ji(t,e,n,r,i))).catch((t=>{throw"FirebaseError"===t.name?(t.code===fa.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new pa(fa.UNKNOWN,t.toString())}))}terminate(){this.$r=!0}}class vh{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.Or=0,this.Mr=null,this.Lr=!0}Br(){0===this.Or&&(this.Ur("Unknown"),this.Mr=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Mr=null,this.qr("Backend didn't respond within 10 seconds."),this.Ur("Offline"),Promise.resolve()))))}Kr(t){"Online"===this.state?this.Ur("Unknown"):(this.Or++,this.Or>=1&&(this.jr(),this.qr(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.Ur("Offline")))}set(t){this.jr(),this.Or=0,"Online"===t&&(this.Lr=!1),this.Ur(t)}Ur(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}qr(t){const e=`Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Lr?(aa(e),this.Lr=!1):oa("OnlineStateTracker",e)}jr(){null!==this.Mr&&(this.Mr.cancel(),this.Mr=null)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class wh{constructor(t,e,n,r,i){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.Qr=[],this.Wr=new Map,this.Gr=new Set,this.zr=[],this.Hr=i,this.Hr.Ei((t=>{n.enqueueAndForget((async()=>{Ah(this)&&(oa("RemoteStore","Restarting streams for network reachability change."),await async function(t){const e=da(t);e.Gr.add(4),await _h(e),e.Jr.set("Unknown"),e.Gr.delete(4),await Eh(e)}(this))}))})),this.Jr=new vh(n,r)}}async function Eh(t){if(Ah(t))for(const e of t.zr)await e(!0)}async function _h(t){for(const e of t.zr)await e(!1)}function bh(t,e){const n=da(t);n.Wr.has(e.targetId)||(n.Wr.set(e.targetId,e),Ch(n)?Sh(n):zh(n).lr()&&Ih(n,e))}function Th(t,e){const n=da(t),r=zh(n);n.Wr.delete(e),r.lr()&&kh(n,e),0===n.Wr.size&&(r.lr()?r._r():Ah(n)&&n.Jr.set("Unknown"))}function Ih(t,e){t.Yr.X(e.targetId),zh(t).br(e)}function kh(t,e){t.Yr.X(e),zh(t).vr(e)}function Sh(t){t.Yr=new Hl({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>t.Wr.get(e)||null}),zh(t).start(),t.Jr.Br()}function Ch(t){return Ah(t)&&!zh(t).hr()&&t.Wr.size>0}function Ah(t){return 0===da(t).Gr.size}function xh(t){t.Yr=void 0}async function Nh(t){t.Wr.forEach(((e,n)=>{Ih(t,e)}))}async function Lh(t,e){xh(t),Ch(t)?(t.Jr.Kr(e),Sh(t)):t.Jr.set("Unknown")}async function Rh(t,e,n){if(t.Jr.set("Online"),e instanceof ql&&2===e.state&&e.cause)try{await async function(t,e){const n=e.cause;for(const r of e.targetIds)t.Wr.has(r)&&(await t.remoteSyncer.rejectListen(r,n),t.Wr.delete(r),t.Yr.removeTarget(r))}(t,e)}catch(n){oa("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Dh(t,n)}else if(e instanceof jl?t.Yr.ot(e):e instanceof Bl?t.Yr.dt(e):t.Yr.ut(e),!n.isEqual(xa.min()))try{const e=await qu(t.localStore);n.compareTo(e)>=0&&await function(t,e){const n=t.Yr.gt(e);return n.targetChanges.forEach(((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const i=t.Wr.get(r);i&&t.Wr.set(r,i.withResumeToken(n.resumeToken,e))}})),n.targetMismatches.forEach((e=>{const n=t.Wr.get(e);if(!n)return;t.Wr.set(e,n.withResumeToken(Fa.EMPTY_BYTE_STRING,n.snapshotVersion)),kh(t,e);const r=new xu(n.target,e,1,n.sequenceNumber);Ih(t,r)})),t.remoteSyncer.applyRemoteEvent(n)}(t,n)}catch(e){oa("RemoteStore","Failed to raise snapshot:",e),await Dh(t,e)}}async function Dh(t,e,n){if(!Su(e))throw e;t.Gr.add(1),await _h(t),t.Jr.set("Offline"),n||(n=()=>qu(t.localStore)),t.asyncQueue.enqueueRetryable((async()=>{oa("RemoteStore","Retrying IndexedDB access"),await n(),t.Gr.delete(1),await Eh(t)}))}function Mh(t,e){return e().catch((n=>Dh(t,n,e)))}async function Oh(t){const e=da(t),n=Hh(e);let r=e.Qr.length>0?e.Qr[e.Qr.length-1].batchId:-1;for(;Ph(e);)try{const t=await Hu(e.localStore,r);if(null===t){0===e.Qr.length&&n._r();break}r=t.batchId,Uh(e,t)}catch(t){await Dh(e,t)}Fh(e)&&Vh(e)}function Ph(t){return Ah(t)&&t.Qr.length<10}function Uh(t,e){t.Qr.push(e);const n=Hh(t);n.lr()&&n.Sr&&n.Dr(e.mutations)}function Fh(t){return Ah(t)&&!Hh(t).hr()&&t.Qr.length>0}function Vh(t){Hh(t).start()}async function $h(t){Hh(t).kr()}async function jh(t){const e=Hh(t);for(const n of t.Qr)e.Dr(n.mutations)}async function Bh(t,e,n){const r=t.Qr.shift(),i=Au.from(r,e,n);await Mh(t,(()=>t.remoteSyncer.applySuccessfulWrite(i))),await Oh(t)}async function qh(t,e){e&&Hh(t).Sr&&await async function(t,e){if(function(t){switch(t){default:return ua();case fa.CANCELLED:case fa.UNKNOWN:case fa.DEADLINE_EXCEEDED:case fa.RESOURCE_EXHAUSTED:case fa.INTERNAL:case fa.UNAVAILABLE:case fa.UNAUTHENTICATED:return!1;case fa.INVALID_ARGUMENT:case fa.NOT_FOUND:case fa.ALREADY_EXISTS:case fa.PERMISSION_DENIED:case fa.FAILED_PRECONDITION:case fa.ABORTED:case fa.OUT_OF_RANGE:case fa.UNIMPLEMENTED:case fa.DATA_LOSS:return!0}}(n=e.code)&&n!==fa.ABORTED){const n=t.Qr.shift();Hh(t).wr(),await Mh(t,(()=>t.remoteSyncer.rejectFailedWrite(n.batchId,e))),await Oh(t)}var n}(t,e),Fh(t)&&Vh(t)}function zh(t){return t.Xr||(t.Xr=function(t,e,n){const r=da(t);return r.Fr(),new gh(e,r.ir,r.authCredentials,r.appCheckCredentials,r.k,n)
/**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */}(t.datastore,t.asyncQueue,{Di:Nh.bind(null,t),Ni:Lh.bind(null,t),Pr:Rh.bind(null,t)}),t.zr.push((async e=>{e?(t.Xr.wr(),Ch(t)?Sh(t):t.Jr.set("Unknown")):(await t.Xr.stop(),xh(t))}))),t.Xr}function Hh(t){return t.Zr||(t.Zr=function(t,e,n){const r=da(t);return r.Fr(),new mh(e,r.ir,r.authCredentials,r.appCheckCredentials,r.k,n)}(t.datastore,t.asyncQueue,{Di:$h.bind(null,t),Ni:qh.bind(null,t),Nr:jh.bind(null,t),Cr:Bh.bind(null,t)}),t.zr.push((async e=>{e?(t.Zr.wr(),await Oh(t)):(await t.Zr.stop(),t.Qr.length>0&&(oa("RemoteStore",`Stopping write stream with ${t.Qr.length} pending writes`),t.Qr=[]))}))),t.Zr
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */}class Kh{constructor(t,e,n,r,i){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=r,this.removalCallback=i,this.deferred=new ga,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((t=>{}))}static createAndSchedule(t,e,n,r,i){const s=Date.now()+n,o=new Kh(t,e,s,r,i);return o.start(n),o}start(t){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new pa(fa.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then((t=>this.deferred.resolve(t)))):Promise.resolve()))}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wh(t,e){if(aa("AsyncQueue",`${e}: ${t}`),Su(t))return new pa(fa.UNAVAILABLE,`${e}: ${t}`);throw t}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Gh{constructor(t){this.comparator=t?(e,n)=>t(e,n)||Ga.comparator(e.key,n.key):(t,e)=>Ga.comparator(t.key,e.key),this.keyedMap=Dl(),this.sortedSet=new kl(this.comparator)}static emptySet(t){return new Gh(t.comparator)}has(t){return null!=this.keyedMap.get(t)}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal(((e,n)=>(t(e),!1)))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Gh))return!1;if(this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(!t.isEqual(r))return!1}return!0}toString(){const t=[];return this.forEach((e=>{t.push(e.toString())})),0===t.length?"DocumentSet ()":"DocumentSet (\n  "+t.join("  \n")+"\n)"}copy(t,e){const n=new Gh;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Jh{constructor(){this.eo=new kl(Ga.comparator)}track(t){const e=t.doc.key,n=this.eo.get(e);n?0!==t.type&&3===n.type?this.eo=this.eo.insert(e,t):3===t.type&&1!==n.type?this.eo=this.eo.insert(e,{type:n.type,doc:t.doc}):2===t.type&&2===n.type?this.eo=this.eo.insert(e,{type:2,doc:t.doc}):2===t.type&&0===n.type?this.eo=this.eo.insert(e,{type:0,doc:t.doc}):1===t.type&&0===n.type?this.eo=this.eo.remove(e):1===t.type&&2===n.type?this.eo=this.eo.insert(e,{type:1,doc:n.doc}):0===t.type&&1===n.type?this.eo=this.eo.insert(e,{type:2,doc:t.doc}):ua():this.eo=this.eo.insert(e,t)}no(){const t=[];return this.eo.inorderTraversal(((e,n)=>{t.push(n)})),t}}class Xh{constructor(t,e,n,r,i,s,o,a){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=i,this.fromCache=s,this.syncStateChanged=o,this.excludesMetadataChanges=a}static fromInitialDocuments(t,e,n,r){const i=[];return e.forEach((t=>{i.push({type:0,doc:t})})),new Xh(t,e,Gh.emptySet(e),i,n,r,!0,!1)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Uc(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let t=0;t<e.length;t++)if(e[t].type!==n[t].type||!e[t].doc.isEqual(n[t].doc))return!1;return!0}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Yh{constructor(){this.so=void 0,this.listeners=[]}}class Qh{constructor(){this.queries=new Pu((t=>Fc(t)),Uc),this.onlineState="Unknown",this.io=new Set}}function Zh(t,e){const n=da(t);let r=!1;for(const t of e){const e=t.query,i=n.queries.get(e);if(i){for(const e of i.listeners)e.oo(t)&&(r=!0);i.so=t}}r&&ed(n)}function td(t,e,n){const r=da(t),i=r.queries.get(e);if(i)for(const t of i.listeners)t.onError(n);r.queries.delete(e)}function ed(t){t.io.forEach((t=>{t.next()}))}class nd{constructor(t,e,n){this.query=t,this.ao=e,this.co=!1,this.uo=null,this.onlineState="Unknown",this.options=n||{}}oo(t){if(!this.options.includeMetadataChanges){const e=[];for(const n of t.docChanges)3!==n.type&&e.push(n);t=new Xh(t.query,t.docs,t.oldDocs,e,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0)}let e=!1;return this.co?this.ho(t)&&(this.ao.next(t),e=!0):this.lo(t,this.onlineState)&&(this.fo(t),e=!0),this.uo=t,e}onError(t){this.ao.error(t)}ro(t){this.onlineState=t;let e=!1;return this.uo&&!this.co&&this.lo(this.uo,t)&&(this.fo(this.uo),e=!0),e}lo(t,e){if(!t.fromCache)return!0;const n="Offline"!==e;return!(this.options.wo&&n||t.docs.isEmpty()&&"Offline"!==e)}ho(t){if(t.docChanges.length>0)return!0;const e=this.uo&&this.uo.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&!0===this.options.includeMetadataChanges}fo(t){t=Xh.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache),this.co=!0,this.ao.next(t)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class rd{constructor(t){this.key=t}}class id{constructor(t){this.key=t}}class sd{constructor(t,e){this.query=t,this.To=e,this.Eo=null,this.current=!1,this.Io=Pl(),this.mutatedKeys=Pl(),this.Ao=jc(t),this.Ro=new Gh(this.Ao)}get Po(){return this.To}bo(t,e){const n=e?e.vo:new Jh,r=e?e.Ro:this.Ro;let i=e?e.mutatedKeys:this.mutatedKeys,s=r,o=!1;const a=Dc(this.query)&&r.size===this.query.limit?r.last():null,c=Mc(this.query)&&r.size===this.query.limit?r.first():null;if(t.inorderTraversal(((t,e)=>{const l=r.get(t),u=$c(this.query,e)?e:null,h=!!l&&this.mutatedKeys.has(l.key),d=!!u&&(u.hasLocalMutations||this.mutatedKeys.has(u.key)&&u.hasCommittedMutations);let f=!1;l&&u?l.data.isEqual(u.data)?h!==d&&(n.track({type:3,doc:u}),f=!0):this.Vo(l,u)||(n.track({type:2,doc:u}),f=!0,(a&&this.Ao(u,a)>0||c&&this.Ao(u,c)<0)&&(o=!0)):!l&&u?(n.track({type:0,doc:u}),f=!0):l&&!u&&(n.track({type:1,doc:l}),f=!0,(a||c)&&(o=!0)),f&&(u?(s=s.add(u),i=d?i.add(t):i.delete(t)):(s=s.delete(t),i=i.delete(t)))})),Dc(this.query)||Mc(this.query))for(;s.size>this.query.limit;){const t=Dc(this.query)?s.last():s.first();s=s.delete(t.key),i=i.delete(t.key),n.track({type:1,doc:t})}return{Ro:s,vo:n,Bn:o,mutatedKeys:i}}Vo(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n){const r=this.Ro;this.Ro=t.Ro,this.mutatedKeys=t.mutatedKeys;const i=t.vo.no();i.sort(((t,e)=>function(t,e){const n=t=>{switch(t){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ua()}};return n(t)-n(e)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t.type,e.type)||this.Ao(t.doc,e.doc))),this.So(n);const s=e?this.Do():[],o=0===this.Io.size&&this.current?1:0,a=o!==this.Eo;return this.Eo=o,0!==i.length||a?{snapshot:new Xh(this.query,t.Ro,r,i,t.mutatedKeys,0===o,a,!1),Co:s}:{Co:s}}ro(t){return this.current&&"Offline"===t?(this.current=!1,this.applyChanges({Ro:this.Ro,vo:new Jh,mutatedKeys:this.mutatedKeys,Bn:!1},!1)):{Co:[]}}No(t){return!this.To.has(t)&&!!this.Ro.has(t)&&!this.Ro.get(t).hasLocalMutations}So(t){t&&(t.addedDocuments.forEach((t=>this.To=this.To.add(t))),t.modifiedDocuments.forEach((t=>{})),t.removedDocuments.forEach((t=>this.To=this.To.delete(t))),this.current=t.current)}Do(){if(!this.current)return[];const t=this.Io;this.Io=Pl(),this.Ro.forEach((t=>{this.No(t.key)&&(this.Io=this.Io.add(t.key))}));const e=[];return t.forEach((t=>{this.Io.has(t)||e.push(new id(t))})),this.Io.forEach((n=>{t.has(n)||e.push(new rd(n))})),e}ko(t){this.To=t.zn,this.Io=Pl();const e=this.bo(t.documents);return this.applyChanges(e,!0)}xo(){return Xh.fromInitialDocuments(this.query,this.Ro,this.mutatedKeys,0===this.Eo)}}class od{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class ad{constructor(t){this.key=t,this.$o=!1}}class cd{constructor(t,e,n,r,i,s){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=s,this.Fo={},this.Oo=new Pu((t=>Fc(t)),Uc),this.Mo=new Map,this.Lo=new Set,this.Bo=new kl(Ga.comparator),this.Uo=new Map,this.qo=new Ju,this.Ko={},this.jo=new Map,this.Qo=Mu.re(),this.onlineState="Unknown",this.Wo=void 0}get isPrimaryClient(){return!0===this.Wo}}async function ld(t,e){const n=function(t){const e=da(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=dd.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Sd.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=pd.bind(null,e),e.Fo.Pr=Zh.bind(null,e.eventManager),e.Fo.zo=td.bind(null,e.eventManager),e}(t);let r,i;const s=n.Oo.get(e);if(s)r=s.targetId,n.sharedClientState.addLocalQueryTarget(r),i=s.view.xo();else{const t=await function(t,e){const n=da(t);return n.persistence.runTransaction("Allocate target","readwrite",(t=>{let r;return n.He.getTargetData(t,e).next((i=>i?(r=i,ku.resolve(r)):n.He.allocateTargetId(t).next((i=>(r=new xu(e,i,0,t.currentSequenceNumber),n.He.addTargetData(t,r).next((()=>r)))))))})).then((t=>{const r=n.qn.get(t.targetId);return(null===r||t.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.qn=n.qn.insert(t.targetId,t),n.Kn.set(e,t.targetId)),t}))}(n.localStore,Pc(e)),s=n.sharedClientState.addLocalQueryTarget(t.targetId);r=t.targetId,i=await async function(t,e,n,r){t.Go=(e,n,r)=>async function(t,e,n,r){let i=e.view.bo(n);i.Bn&&(i=await Wu(t.localStore,e.query,!1).then((({documents:t})=>e.view.bo(t,i))));const s=r&&r.targetChanges.get(e.targetId),o=e.view.applyChanges(i,t.isPrimaryClient,s);return _d(t,e.targetId,o.Co),o.snapshot}(t,e,n,r);const i=await Wu(t.localStore,e,!0),s=new sd(e,i.zn),o=s.bo(i.documents),a=$l.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==t.onlineState),c=s.applyChanges(o,t.isPrimaryClient,a);_d(t,n,c.Co);const l=new od(e,n,s);return t.Oo.set(e,l),t.Mo.has(n)?t.Mo.get(n).push(e):t.Mo.set(n,[e]),c.snapshot}(n,e,r,"current"===s),n.isPrimaryClient&&bh(n.remoteStore,t)}return i}async function ud(t,e){const n=da(t),r=n.Oo.get(e),i=n.Mo.get(r.targetId);if(i.length>1)return n.Mo.set(r.targetId,i.filter((t=>!Uc(t,e)))),void n.Oo.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(r.targetId),n.sharedClientState.isActiveQueryTarget(r.targetId)||await Ku(n.localStore,r.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(r.targetId),Th(n.remoteStore,r.targetId),wd(n,r.targetId)})).catch(Ou)):(wd(n,r.targetId),await Ku(n.localStore,r.targetId,!0))}async function hd(t,e,n){const r=function(t){const e=da(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=gd.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=md.bind(null,e),e}(t);try{const t=await function(t,e){const n=da(t),r=Aa.now(),i=e.reduce(((t,e)=>t.add(e.key)),Pl());let s;return n.persistence.runTransaction("Locally write mutations","readwrite",(t=>n.Wn.vn(t,i).next((i=>{s=i;const o=[];for(const t of e){const e=hl(t,s.get(t.key));null!=e&&o.push(new gl(t.key,e,lc(e.value.mapValue),ol.exists(!0)))}return n.An.addMutationBatch(t,r,o,e)})))).then((t=>(t.applyToLocalDocumentSet(s),{batchId:t.batchId,changes:s})))}(r.localStore,e);r.sharedClientState.addPendingMutation(t.batchId),function(t,e,n){let r=t.Ko[t.currentUser.toKey()];r||(r=new kl(Sa)),r=r.insert(e,n),t.Ko[t.currentUser.toKey()]=r}(r,t.batchId,n),await Id(r,t.changes),await Oh(r.remoteStore)}catch(t){const e=Wh(t,"Failed to persist write");n.reject(e)}}async function dd(t,e){const n=da(t);try{const t=await zu(n.localStore,e);e.targetChanges.forEach(((t,e)=>{const r=n.Uo.get(e);r&&(ha(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1),t.addedDocuments.size>0?r.$o=!0:t.modifiedDocuments.size>0?ha(r.$o):t.removedDocuments.size>0&&(ha(r.$o),r.$o=!1))})),await Id(n,t,e)}catch(t){await Ou(t)}}function fd(t,e,n){const r=da(t);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const t=[];r.Oo.forEach(((n,r)=>{const i=r.view.ro(e);i.snapshot&&t.push(i.snapshot)})),function(t,e){const n=da(t);n.onlineState=e;let r=!1;n.queries.forEach(((t,n)=>{for(const t of n.listeners)t.ro(e)&&(r=!0)})),r&&ed(n)}(r.eventManager,e),t.length&&r.Fo.Pr(t),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function pd(t,e,n){const r=da(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Uo.get(e),s=i&&i.key;if(s){let t=new kl(Ga.comparator);t=t.insert(s,uc.newNoDocument(s,xa.min()));const n=Pl().add(s),i=new Vl(xa.min(),new Map,new Al(Sa),t,n);await dd(r,i),r.Bo=r.Bo.remove(s),r.Uo.delete(e),Td(r)}else await Ku(r.localStore,e,!1).then((()=>wd(r,e,n))).catch(Ou)}async function gd(t,e){const n=da(t),r=e.batch.batchId;try{const t=await function(t,e){const n=da(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",(t=>{const r=e.batch.keys(),i=n.Qn.newChangeBuffer({trackRemovals:!0});return function(t,e,n,r){const i=n.batch,s=i.keys();let o=ku.resolve();return s.forEach((t=>{o=o.next((()=>r.getEntry(e,t))).next((e=>{const s=n.docVersions.get(t);ha(null!==s),e.version.compareTo(s)<0&&(i.applyToRemoteDocument(e,n),e.isValidDocument()&&r.addEntry(e,n.commitVersion))}))})),o.next((()=>t.An.removeMutationBatch(e,i)))}(n,t,e,i).next((()=>i.apply(t))).next((()=>n.An.performConsistencyCheck(t))).next((()=>n.Wn.vn(t,r)))}))}(n.localStore,e);vd(n,r,null),yd(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await Id(n,t)}catch(t){await Ou(t)}}async function md(t,e,n){const r=da(t);try{const t=await function(t,e){const n=da(t);return n.persistence.runTransaction("Reject batch","readwrite-primary",(t=>{let r;return n.An.lookupMutationBatch(t,e).next((e=>(ha(null!==e),r=e.keys(),n.An.removeMutationBatch(t,e)))).next((()=>n.An.performConsistencyCheck(t))).next((()=>n.Wn.vn(t,r)))}))}(r.localStore,e);vd(r,e,n),yd(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await Id(r,t)}catch(n){await Ou(n)}}function yd(t,e){(t.jo.get(e)||[]).forEach((t=>{t.resolve()})),t.jo.delete(e)}function vd(t,e,n){const r=da(t);let i=r.Ko[r.currentUser.toKey()];if(i){const t=i.get(e);t&&(n?t.reject(n):t.resolve(),i=i.remove(e)),r.Ko[r.currentUser.toKey()]=i}}function wd(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Mo.get(e))t.Oo.delete(r),n&&t.Fo.zo(r,n);t.Mo.delete(e),t.isPrimaryClient&&t.qo.us(e).forEach((e=>{t.qo.containsKey(e)||Ed(t,e)}))}function Ed(t,e){t.Lo.delete(e.path.canonicalString());const n=t.Bo.get(e);null!==n&&(Th(t.remoteStore,n),t.Bo=t.Bo.remove(e),t.Uo.delete(n),Td(t))}function _d(t,e,n){for(const r of n)r instanceof rd?(t.qo.addReference(r.key,e),bd(t,r)):r instanceof id?(oa("SyncEngine","Document no longer in limbo: "+r.key),t.qo.removeReference(r.key,e),t.qo.containsKey(r.key)||Ed(t,r.key)):ua()}function bd(t,e){const n=e.key,r=n.path.canonicalString();t.Bo.get(n)||t.Lo.has(r)||(oa("SyncEngine","New document in limbo: "+n),t.Lo.add(r),Td(t))}function Td(t){for(;t.Lo.size>0&&t.Bo.size<t.maxConcurrentLimboResolutions;){const e=t.Lo.values().next().value;t.Lo.delete(e);const n=new Ga(Ma.fromString(e)),r=t.Qo.next();t.Uo.set(r,new ad(n)),t.Bo=t.Bo.insert(n,r),bh(t.remoteStore,new xu(Pc(Rc(n.path)),r,2,Ta.I))}}async function Id(t,e,n){const r=da(t),i=[],s=[],o=[];r.Oo.isEmpty()||(r.Oo.forEach(((t,a)=>{o.push(r.Go(a,e,n).then((t=>{if(t){r.isPrimaryClient&&r.sharedClientState.updateQueryState(a.targetId,t.fromCache?"not-current":"current"),i.push(t);const e=Vu.$n(a.targetId,t);s.push(e)}})))})),await Promise.all(o),r.Fo.Pr(i),await async function(t,e){const n=da(t);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",(t=>ku.forEach(e,(e=>ku.forEach(e.kn,(r=>n.persistence.referenceDelegate.addReference(t,e.targetId,r))).next((()=>ku.forEach(e.xn,(r=>n.persistence.referenceDelegate.removeReference(t,e.targetId,r)))))))))}catch(t){if(!Su(t))throw t;oa("LocalStore","Failed to update sequence numbers: "+t)}for(const t of e){const e=t.targetId;if(!t.fromCache){const t=n.qn.get(e),r=t.snapshotVersion,i=t.withLastLimboFreeSnapshotVersion(r);n.qn=n.qn.insert(e,i)}}}(r.localStore,s))}async function kd(t,e){const n=da(t);if(!n.currentUser.isEqual(e)){oa("SyncEngine","User change. New user:",e.toKey());const t=await Bu(n.localStore,e);n.currentUser=e,function(t,e){t.jo.forEach((t=>{t.forEach((t=>{t.reject(new pa(fa.CANCELLED,"'waitForPendingWrites' promise is rejected due to a user change."))}))})),t.jo.clear()}(n),n.sharedClientState.handleUserChange(e,t.removedBatchIds,t.addedBatchIds),await Id(n,t.Gn)}}function Sd(t,e){const n=da(t),r=n.Uo.get(e);if(r&&r.$o)return Pl().add(r.key);{let t=Pl();const r=n.Mo.get(e);if(!r)return t;for(const e of r){const r=n.Oo.get(e);t=t.unionWith(r.view.Po)}return t}}class Cd{constructor(){this.synchronizeTabs=!1}async initialize(t){this.k=dh(t.databaseInfo.databaseId),this.sharedClientState=this.Jo(t),this.persistence=this.Yo(t),await this.persistence.start(),this.gcScheduler=this.Xo(t),this.localStore=this.Zo(t)}Xo(t){return null}Zo(t){return function(t,e,n,r){return new ju(t,e,n,r)}(this.persistence,new $u,t.initialUser,this.k)}Yo(t){return new eh(rh.ks,this.k)}Jo(t){return new sh}async terminate(){this.gcScheduler&&this.gcScheduler.stop(),await this.sharedClientState.shutdown(),await this.persistence.shutdown()}}class Ad{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=t=>fd(this.syncEngine,t,1),this.remoteStore.remoteSyncer.handleCredentialChange=kd.bind(null,this.syncEngine),await async function(t,e){const n=da(t);e?(n.Gr.delete(2),await Eh(n)):e||(n.Gr.add(2),await _h(n),n.Jr.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return new Qh}createDatastore(t){const e=dh(t.databaseInfo.databaseId),n=(r=t.databaseInfo,new uh(r));var r;return function(t,e,n,r){return new yh(t,e,n,r)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return e=this.localStore,n=this.datastore,r=t.asyncQueue,i=t=>fd(this.syncEngine,t,0),s=ah.bt()?new ah:new oh,new wh(e,n,r,i,s);var e,n,r,i,s}createSyncEngine(t,e){return function(t,e,n,r,i,s,o){const a=new cd(t,e,n,r,i,s);return o&&(a.Wo=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}terminate(){return async function(t){const e=da(t);oa("RemoteStore","RemoteStore shutting down."),e.Gr.add(5),await _h(e),e.Hr.shutdown(),e.Jr.set("Unknown")}(this.remoteStore)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class xd{constructor(t){this.observer=t,this.muted=!1}next(t){this.observer.next&&this.ea(this.observer.next,t)}error(t){this.observer.error?this.ea(this.observer.error,t):console.error("Uncaught Error in snapshot listener:",t)}na(){this.muted=!0}ea(t,e){this.muted||setTimeout((()=>{this.muted||t(e)}),0)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Nd{constructor(t,e,n,r){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=r,this.user=na.UNAUTHENTICATED,this.clientId=ka.A(),this.authCredentialListener=()=>Promise.resolve(),this.authCredentials.start(n,(async t=>{oa("FirestoreClient","Received user=",t.uid),await this.authCredentialListener(t),this.user=t})),this.appCheckCredentials.start(n,(()=>Promise.resolve()))}async getConfiguration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}verifyNotTerminated(){if(this.asyncQueue.isShuttingDown)throw new pa(fa.FAILED_PRECONDITION,"The client has already been terminated.")}terminate(){this.asyncQueue.enterRestrictedMode();const t=new ga;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this.onlineComponents&&await this.onlineComponents.terminate(),this.offlineComponents&&await this.offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Wh(e,"Failed to shutdown persistence");t.reject(n)}})),t.promise}}async function Ld(t,e){t.asyncQueue.verifyOperationInProgress();const n=await async function(t){return t.offlineComponents||(oa("FirestoreClient","Using default OfflineComponentProvider"),await async function(t,e){t.asyncQueue.verifyOperationInProgress(),oa("FirestoreClient","Initializing OfflineComponentProvider");const n=await t.getConfiguration();await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener((async t=>{r.isEqual(t)||(await Bu(e.localStore,t),r=t)})),e.persistence.setDatabaseDeletedListener((()=>t.terminate())),t.offlineComponents=e}(t,new Cd)),t.offlineComponents}(t);oa("FirestoreClient","Initializing OnlineComponentProvider");const r=await t.getConfiguration();await e.initialize(n,r),t.setCredentialChangeListener((t=>async function(t,e){const n=da(t);n.asyncQueue.verifyOperationInProgress(),oa("RemoteStore","RemoteStore received new credentials");const r=Ah(n);n.Gr.add(3),await _h(n),r&&n.Jr.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Gr.delete(3),await Eh(n)}(e.remoteStore,t))),t.onlineComponents=e}async function Rd(t){return t.onlineComponents||(oa("FirestoreClient","Using default OnlineComponentProvider"),await Ld(t,new Ad)),t.onlineComponents}async function Dd(t){const e=await Rd(t),n=e.eventManager;return n.onListen=ld.bind(null,e.syncEngine),n.onUnlisten=ud.bind(null,e.syncEngine),n}class Md{constructor(t,e,n,r,i,s,o,a){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=r,this.ssl=i,this.forceLongPolling=s,this.autoDetectLongPolling=o,this.useFetchStreams=a}}class Od{constructor(t,e){this.projectId=t,this.database=e||"(default)"}get isDefaultDatabase(){return"(default)"===this.database}isEqual(t){return t instanceof Od&&t.projectId===this.projectId&&t.database===this.database}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const Pd=new Map;
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */function Ud(t,e,n){if(!n)throw new pa(fa.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Fd(t){if(!Ga.isDocumentKey(t))throw new pa(fa.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Vd(t){if(Ga.isDocumentKey(t))throw new pa(fa.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function $d(t){if(void 0===t)return"undefined";if(null===t)return"null";if("string"==typeof t)return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if("number"==typeof t||"boolean"==typeof t)return""+t;if("object"==typeof t){if(t instanceof Array)return"an array";{const e=function(t){return t.constructor?t.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return"function"==typeof t?"a function":ua()}function jd(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new pa(fa.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=$d(t);throw new pa(fa.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Bd{constructor(t){var e;if(void 0===t.host){if(void 0!==t.ssl)throw new pa(fa.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=t.host,this.ssl=null===(e=t.ssl)||void 0===e||e;if(this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,void 0===t.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==t.cacheSizeBytes&&t.cacheSizeBytes<1048576)throw new pa(fa.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.useFetchStreams=!!t.useFetchStreams,function(t,e,n,r){if(!0===e&&!0===r)throw new pa(fa.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling)}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class qd{constructor(t,e,n){this._authCredentials=e,this._appCheckCredentials=n,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Bd({}),this._settingsFrozen=!1,t instanceof Od?this._databaseId=t:(this._app=t,this._databaseId=function(t){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new pa(fa.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Od(t.options.projectId)}(t))}get app(){if(!this._app)throw new pa(fa.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return void 0!==this._terminateTask}_setSettings(t){if(this._settingsFrozen)throw new pa(fa.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Bd(t),void 0!==t.credentials&&(this._authCredentials=function(t){if(!t)return new ya;switch(t.type){case"gapi":const e=t.client;return ha(!("object"!=typeof e||null===e||!e.auth||!e.auth.getAuthHeaderValueForFirstParty)),new Ea(e,t.sessionIndex||"0",t.iamToken||null);case"provider":return t.client;default:throw new pa(fa.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const e=Pd.get(t);e&&(oa("ComponentProvider","Removing Datastore"),Pd.delete(t),e.terminate())}(this),Promise.resolve()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class zd{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Kd(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new zd(this.firestore,t,this._key)}}class Hd{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Hd(this.firestore,t,this._query)}}class Kd extends Hd{constructor(t,e,n){super(t,e,Rc(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new zd(this.firestore,null,new Ga(t))}withConverter(t){return new Kd(this.firestore,t,this._path)}}function Wd(t,e,...n){if(t=m(t),Ud("collection","path",e),t instanceof qd){const r=Ma.fromString(e,...n);return Vd(r),new Kd(t,null,r)}{if(!(t instanceof zd||t instanceof Kd))throw new pa(fa.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ma.fromString(e,...n));return Vd(r),new Kd(t.firestore,null,r)}}function Gd(t,e,...n){if(t=m(t),1===arguments.length&&(e=ka.A()),Ud("doc","path",e),t instanceof qd){const r=Ma.fromString(e,...n);return Fd(r),new zd(t,null,new Ga(r))}{if(!(t instanceof zd||t instanceof Kd))throw new pa(fa.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ma.fromString(e,...n));return Fd(r),new zd(t.firestore,t instanceof Kd?t.converter:null,new Ga(r))}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Jd{constructor(){this.ma=Promise.resolve(),this.ga=[],this.ya=!1,this.pa=[],this.Ta=null,this.Ea=!1,this.Ia=!1,this.Aa=[],this.ur=new fh(this,"async_queue_retry"),this.Ra=()=>{const t=hh();t&&oa("AsyncQueue","Visibility state changed to "+t.visibilityState),this.ur.er()};const t=hh();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.Ra)}get isShuttingDown(){return this.ya}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.Pa(),this.ba(t)}enterRestrictedMode(t){if(!this.ya){this.ya=!0,this.Ia=t||!1;const e=hh();e&&"function"==typeof e.removeEventListener&&e.removeEventListener("visibilitychange",this.Ra)}}enqueue(t){if(this.Pa(),this.ya)return new Promise((()=>{}));const e=new ga;return this.ba((()=>this.ya&&this.Ia?Promise.resolve():(t().then(e.resolve,e.reject),e.promise))).then((()=>e.promise))}enqueueRetryable(t){this.enqueueAndForget((()=>(this.ga.push(t),this.va())))}async va(){if(0!==this.ga.length){try{await this.ga[0](),this.ga.shift(),this.ur.reset()}catch(t){if(!Su(t))throw t;oa("AsyncQueue","Operation failed with retryable error: "+t)}this.ga.length>0&&this.ur.Zi((()=>this.va()))}}ba(t){const e=this.ma.then((()=>(this.Ea=!0,t().catch((t=>{this.Ta=t,this.Ea=!1;const e=function(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+"\n"+t.stack),e}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t);throw aa("INTERNAL UNHANDLED ERROR: ",e),t})).then((t=>(this.Ea=!1,t))))));return this.ma=e,e}enqueueAfterDelay(t,e,n){this.Pa(),this.Aa.indexOf(t)>-1&&(e=0);const r=Kh.createAndSchedule(this,t,e,n,(t=>this.Va(t)));return this.pa.push(r),r}Pa(){this.Ta&&ua()}verifyOperationInProgress(){}async Sa(){let t;do{t=this.ma,await t}while(t!==this.ma)}Da(t){for(const e of this.pa)if(e.timerId===t)return!0;return!1}Ca(t){return this.Sa().then((()=>{this.pa.sort(((t,e)=>t.targetTimeMs-e.targetTimeMs));for(const e of this.pa)if(e.skipDelay(),"all"!==t&&e.timerId===t)break;return this.Sa()}))}Na(t){this.Aa.push(t)}Va(t){const e=this.pa.indexOf(t);this.pa.splice(e,1)}}function Xd(t){return function(t,e){if("object"!=typeof t||null===t)return!1;const n=t;for(const t of["next","error","complete"])if(t in n&&"function"==typeof n[t])return!0;return!1}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */(t)}class Yd extends qd{constructor(t,e,n){super(t,e,n),this.type="firestore",this._queue=new Jd,this._persistenceKey="name"in t?t.name:"[DEFAULT]"}_terminate(){return this._firestoreClient||tf(this),this._firestoreClient.terminate()}}function Qd(t=j()){return U(t,"firestore").getImmediate()}function Zd(t){return t._firestoreClient||tf(t),t._firestoreClient.verifyNotTerminated(),t._firestoreClient}function tf(t){var e;const n=t._freezeSettings(),r=function(t,e,n,r){return new Md(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,r.useFetchStreams)}(t._databaseId,(null===(e=t._app)||void 0===e?void 0:e.options.appId)||"",t._persistenceKey,n);t._firestoreClient=new Nd(t._authCredentials,t._appCheckCredentials,t._queue,r)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class ef{constructor(...t){for(let e=0;e<t.length;++e)if(0===t[e].length)throw new pa(fa.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Pa(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class nf{constructor(t){this._byteString=t}static fromBase64String(t){try{return new nf(Fa.fromBase64String(t))}catch(t){throw new pa(fa.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(t){return new nf(Fa.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class rf{constructor(t){this._methodName=t}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class sf{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new pa(fa.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new pa(fa.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(t){return Sa(this._lat,t._lat)||Sa(this._long,t._long)}}
/**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */const of=/^__.*__$/;class af{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return null!==this.fieldMask?new gl(t,this.data,this.fieldMask,e,this.fieldTransforms):new pl(t,this.data,e,this.fieldTransforms)}}class cf{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new gl(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function lf(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ua()}}class uf{constructor(t,e,n,r,i,s){this.settings=t,this.databaseId=e,this.k=n,this.ignoreUndefinedProperties=r,void 0===i&&this.ka(),this.fieldTransforms=i||[],this.fieldMask=s||[]}get path(){return this.settings.path}get xa(){return this.settings.xa}$a(t){return new uf(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.k,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Fa(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.$a({path:n,Oa:!1});return r.Ma(t),r}La(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.$a({path:n,Oa:!1});return r.ka(),r}Ba(t){return this.$a({path:void 0,Oa:!0})}Ua(t){return _f(t,this.settings.methodName,this.settings.qa||!1,this.path,this.settings.Ka)}contains(t){return void 0!==this.fieldMask.find((e=>t.isPrefixOf(e)))||void 0!==this.fieldTransforms.find((e=>t.isPrefixOf(e.field)))}ka(){if(this.path)for(let t=0;t<this.path.length;t++)this.Ma(this.path.get(t))}Ma(t){if(0===t.length)throw this.Ua("Document fields must not be empty");if(lf(this.xa)&&of.test(t))throw this.Ua('Document fields cannot begin and end with "__"')}}class hf{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.k=n||dh(t)}ja(t,e,n,r=!1){return new uf({xa:t,methodName:e,Ka:n,path:Pa.emptyPath(),Oa:!1,qa:r},this.databaseId,this.k,this.ignoreUndefinedProperties)}}class df extends rf{_toFieldTransform(t){if(2!==t.xa)throw 1===t.xa?t.Ua(`${this._methodName}() can only appear at the top level of your update data`):t.Ua(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof df}}class ff extends rf{constructor(t,e){super(t),this.Wa=e}_toFieldTransform(t){const e=new el(t.k,Hc(t.k,this.Wa));return new il(t.path,e)}isEqual(t){return this===t}}function pf(t,e){if(mf(t=m(t)))return yf("Unsupported field value:",e,t),gf(t,e);if(t instanceof rf)return function(t,e){if(!lf(e.xa))throw e.Ua(`${t._methodName}() can only be used with update() and set()`);if(!e.path)throw e.Ua(`${t._methodName}() is not currently supported inside arrays`);const n=t._toFieldTransform(e);n&&e.fieldTransforms.push(n)}(t,e),null;if(void 0===t&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.Oa&&4!==e.xa)throw e.Ua("Nested arrays are not supported");return function(t,e){const n=[];let r=0;for(const i of t){let t=pf(i,e.Ba(r));null==t&&(t={nullValue:"NULL_VALUE"}),n.push(t),r++}return{arrayValue:{values:n}}}(t,e)}return function(t,e){if(null===(t=m(t)))return{nullValue:"NULL_VALUE"};if("number"==typeof t)return Hc(e.k,t);if("boolean"==typeof t)return{booleanValue:t};if("string"==typeof t)return{stringValue:t};if(t instanceof Date){const n=Aa.fromDate(t);return{timestampValue:Yl(e.k,n)}}if(t instanceof Aa){const n=new Aa(t.seconds,1e3*Math.floor(t.nanoseconds/1e3));return{timestampValue:Yl(e.k,n)}}if(t instanceof sf)return{geoPointValue:{latitude:t.latitude,longitude:t.longitude}};if(t instanceof nf)return{bytesValue:Ql(e.k,t._byteString)};if(t instanceof zd){const n=e.databaseId,r=t.firestore._databaseId;if(!r.isEqual(n))throw e.Ua(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:eu(t.firestore._databaseId||e.databaseId,t._key.path)}}throw e.Ua(`Unsupported field value: ${$d(t)}`)}(t,e)}function gf(t,e){const n={};return Ra(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):La(t,((t,r)=>{const i=pf(r,e.Fa(t));null!=i&&(n[t]=i)})),{mapValue:{fields:n}}}function mf(t){return!("object"!=typeof t||null===t||t instanceof Array||t instanceof Date||t instanceof Aa||t instanceof sf||t instanceof nf||t instanceof zd||t instanceof rf)}function yf(t,e,n){if(!mf(n)||!function(t){return"object"==typeof t&&null!==t&&(Object.getPrototypeOf(t)===Object.prototype||null===Object.getPrototypeOf(t))}(n)){const r=$d(n);throw"an object"===r?e.Ua(t+" a custom object"):e.Ua(t+" "+r)}}function vf(t,e,n){if((e=m(e))instanceof ef)return e._internalPath;if("string"==typeof e)return Ef(t,e);throw _f("Field path arguments must be of type string or FieldPath.",t,!1,void 0,n)}const wf=new RegExp("[~\\*/\\[\\]]");function Ef(t,e,n){if(e.search(wf)>=0)throw _f(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new ef(...e.split("."))._internalPath}catch(r){throw _f(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function _f(t,e,n,r,i){const s=r&&!r.isEmpty(),o=void 0!==i;let a=`Function ${e}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(s||o)&&(c+=" (found",s&&(c+=` in field ${r}`),o&&(c+=` in document ${i}`),c+=")"),new pa(fa.INVALID_ARGUMENT,a+t+c)}function bf(t,e){return t.some((t=>t.isEqual(e)))}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Tf{constructor(t,e,n,r,i){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new zd(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const t=new If(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(kf("DocumentSnapshot.get",t));if(null!==e)return this._userDataWriter.convertValue(e)}}}class If extends Tf{data(){return super.data()}}function kf(t,e){return"string"==typeof e?Ef(t,e):e instanceof ef?e._internalPath:e._delegate._internalPath}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */class Sf{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Cf extends Tf{constructor(t,e,n,r,i,s){super(t,e,n,r,s),this._firestore=t,this._firestoreImpl=t,this.metadata=i}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Af(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(kf("DocumentSnapshot.get",t));if(null!==n)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}}class Af extends Cf{data(t={}){return super.data(t)}}class xf{constructor(t,e,n,r){this._firestore=t,this._userDataWriter=e,this._snapshot=r,this.metadata=new Sf(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const t=[];return this.forEach((e=>t.push(e))),t}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(t,e){this._snapshot.docs.forEach((n=>{t.call(e,new Af(this._firestore,this._userDataWriter,n.key,n,new Sf(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new pa(fa.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(t,e){if(t._snapshot.oldDocs.isEmpty()){let e=0;return t._snapshot.docChanges.map((n=>({type:"added",doc:new Af(t._firestore,t._userDataWriter,n.doc.key,n.doc,new Sf(t._snapshot.mutatedKeys.has(n.doc.key),t._snapshot.fromCache),t.query.converter),oldIndex:-1,newIndex:e++})))}{let n=t._snapshot.oldDocs;return t._snapshot.docChanges.filter((t=>e||3!==t.type)).map((e=>{const r=new Af(t._firestore,t._userDataWriter,e.doc.key,e.doc,new Sf(t._snapshot.mutatedKeys.has(e.doc.key),t._snapshot.fromCache),t.query.converter);let i=-1,s=-1;return 0!==e.type&&(i=n.indexOf(e.doc.key),n=n.delete(e.doc.key)),1!==e.type&&(n=n.add(e.doc),s=n.indexOf(e.doc.key)),{type:Nf(e.type),doc:r,oldIndex:i,newIndex:s}}))}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}}function Nf(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ua()}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class Lf{convertValue(t,e="none"){switch(Ja(t)){case 0:return null;case 1:return t.booleanValue;case 2:return ja(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Ba(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 10:return this.convertObject(t.mapValue,e);default:throw ua()}}convertObject(t,e){const n={};return La(t.fields,((t,r)=>{n[t]=this.convertValue(r,e)})),n}convertGeoPoint(t){return new sf(ja(t.latitude),ja(t.longitude))}convertArray(t,e){return(t.values||[]).map((t=>this.convertValue(t,e)))}convertServerTimestamp(t,e){switch(e){case"previous":const n=za(t);return null==n?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(Ha(t));default:return null}}convertTimestamp(t){const e=$a(t);return new Aa(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=Ma.fromString(t);ha(bu(n));const r=new Od(n.get(1),n.get(3)),i=new Ga(n.popFirst(5));return r.isEqual(e)||aa(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),i}}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
class Rf{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=function(t){const e=t._freezeSettings(),n=dh(t._databaseId);return new hf(t._databaseId,!!e.ignoreUndefinedProperties,n)}(t)}set(t,e,n){this._verifyNotCommitted();const r=Df(t,this._firestore),i=function(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}(r.converter,e,n),s=function(t,e,n,r,i,s={}){const o=t.ja(s.merge||s.mergeFields?2:0,e,n,i);yf("Data must be an object, but it was:",o,r);const a=gf(r,o);let c,l;if(s.merge)c=new Ua(o.fieldMask),l=o.fieldTransforms;else if(s.mergeFields){const t=[];for(const r of s.mergeFields){const i=vf(e,r,n);if(!o.contains(i))throw new pa(fa.INVALID_ARGUMENT,`Field '${i}' is specified in your field mask but missing from your input data.`);bf(t,i)||t.push(i)}c=new Ua(t),l=o.fieldTransforms.filter((t=>c.covers(t.field)))}else c=null,l=o.fieldTransforms;return new af(new cc(a),c,l)}(this._dataReader,"WriteBatch.set",r._key,i,null!==r.converter,n);return this._mutations.push(s.toMutation(r._key,ol.none())),this}update(t,e,n,...r){this._verifyNotCommitted();const i=Df(t,this._firestore);let s;return s="string"==typeof(e=m(e))||e instanceof ef?function(t,e,n,r,i,s){const o=t.ja(1,e,n),a=[vf(e,r,n)],c=[i];if(s.length%2!=0)throw new pa(fa.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let t=0;t<s.length;t+=2)a.push(vf(e,s[t])),c.push(s[t+1]);const l=[],u=cc.empty();for(let t=a.length-1;t>=0;--t)if(!bf(l,a[t])){const e=a[t];let n=c[t];n=m(n);const r=o.La(e);if(n instanceof df)l.push(e);else{const t=pf(n,r);null!=t&&(l.push(e),u.set(e,t))}}const h=new Ua(l);return new cf(u,h,o.fieldTransforms)}(this._dataReader,"WriteBatch.update",i._key,e,n,r):function(t,e,n,r){const i=t.ja(1,e,n);yf("Data must be an object, but it was:",i,r);const s=[],o=cc.empty();La(r,((t,r)=>{const a=Ef(e,t,n);r=m(r);const c=i.La(a);if(r instanceof df)s.push(a);else{const t=pf(r,c);null!=t&&(s.push(a),o.set(a,t))}}));const a=new Ua(s);return new cf(o,a,i.fieldTransforms)}(this._dataReader,"WriteBatch.update",i._key,e),this._mutations.push(s.toMutation(i._key,ol.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=Df(t,this._firestore);return this._mutations=this._mutations.concat(new wl(e._key,ol.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new pa(fa.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Df(t,e){if((t=m(t)).firestore!==e)throw new pa(fa.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}class Mf extends Lf{constructor(t){super(),this.firestore=t}convertBytes(t){return new nf(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new zd(this.firestore,null,e)}}function Of(t,...e){var n,r,i;t=m(t);let s={includeMetadataChanges:!1},o=0;"object"!=typeof e[o]||Xd(e[o])||(s=e[o],o++);const a={includeMetadataChanges:s.includeMetadataChanges};if(Xd(e[o])){const t=e[o];e[o]=null===(n=t.next)||void 0===n?void 0:n.bind(t),e[o+1]=null===(r=t.error)||void 0===r?void 0:r.bind(t),e[o+2]=null===(i=t.complete)||void 0===i?void 0:i.bind(t)}let c,l,u;if(t instanceof zd)l=jd(t.firestore,Yd),u=Rc(t._key.path),c={next:n=>{e[o]&&e[o](function(t,e,n){const r=n.docs.get(e._key),i=new Mf(t);return new Cf(t,i,e._key,r,new Sf(n.hasPendingWrites,n.fromCache),e.converter)}(l,t,n))},error:e[o+1],complete:e[o+2]};else{const n=jd(t,Hd);l=jd(n.firestore,Yd),u=n._query;const r=new Mf(l);c={next:t=>{e[o]&&e[o](new xf(l,r,n,t))},error:e[o+1],complete:e[o+2]},function(t){if(Mc(t)&&0===t.explicitOrderBy.length)throw new pa(fa.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}(t._query)}return function(t,e,n,r){const i=new xd(r),s=new nd(e,i,n);return t.asyncQueue.enqueueAndForget((async()=>async function(t,e){const n=da(t),r=e.query;let i=!1,s=n.queries.get(r);if(s||(i=!0,s=new Yh),i)try{s.so=await n.onListen(r)}catch(t){const n=Wh(t,`Initialization of query '${Vc(e.query)}' failed`);return void e.onError(n)}n.queries.set(r,s),s.listeners.push(e),e.ro(n.onlineState),s.so&&e.oo(s.so)&&ed(n)}(await Dd(t),s))),()=>{i.na(),t.asyncQueue.enqueueAndForget((async()=>async function(t,e){const n=da(t),r=e.query;let i=!1;const s=n.queries.get(r);if(s){const t=s.listeners.indexOf(e);t>=0&&(s.listeners.splice(t,1),i=0===s.listeners.length)}if(i)return n.queries.delete(r),n.onUnlisten(r)}(await Dd(t),s)))}}(Zd(l),u,a,c)}function Pf(t,e){return function(t,e){const n=new ga;return t.asyncQueue.enqueueAndForget((async()=>hd(await function(t){return Rd(t).then((t=>t.syncEngine))}(t),e,n))),n.promise}(Zd(t),e)}
/**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
function Uf(t){return Zd(t=jd(t,Yd)),new Rf(t,(e=>Pf(t,e)))}!function(t,e=!0){!function(t){ra=t}($),P(new y("firestore",((t,{options:n})=>{const r=t.getProvider("app").getImmediate(),i=new Yd(r,new va(t.getProvider("auth-internal")),new ba(t.getProvider("app-check-internal")));return n=Object.assign({useFetchStreams:e},n),i._setSettings(n),i}),"PUBLIC")),B(ea,"3.4.1",t),B(ea,"3.4.1","esm2017")}();const Ff="studyList",Vf="studyResults";let $f={studyList:[],studyResults:[]};const jf="correct",Bf="incorrect",qf="recognition";let zf=JSON.parse(localStorage.getItem("studyList")||"{}"),Hf=JSON.parse(localStorage.getItem("studyResults")||'{"hourly":{},"daily":{}}'),Kf=!0,Wf=!0,Gf=!0,Jf=null,Xf=function(t,e){if(Jf){e=e||zf;const n=Qd();let r=Uf(n),i=0;for(let s=0;s<t.length;s++){const o=ep(t[s]);i++,e[t[s]]?r.set(Gd(n,`users/${Jf.uid}/studyList/${o}`),e[t[s]],{merge:!0}):r.delete(Gd(n,`users/${Jf.uid}/studyList/${o}`)),500==i&&(r.commit().then((()=>{localStorage.setItem("studyListDirty",!1)})).catch((()=>{localStorage.setItem("studyListDirty",!0)})),r=Uf(n),i=0)}t&&t.length>0&&r.commit().then((()=>{localStorage.setItem("studyListDirty",!1)})).catch((()=>{localStorage.setItem("studyListDirty",!0)}))}else localStorage.setItem("studyListDirty",!0);localStorage.setItem("studyList",JSON.stringify(zf))},Yf=function(t,e){let n=new Date;if(t===Bf)zf[e].nextJump=.5,zf[e].wrongCount++,zf[e].due=n.valueOf();else{let t=zf[e].nextJump||.5;zf[e].nextJump=2*t,zf[e].rightCount++,zf[e].due=n.valueOf()+24*t*60*60*1e3}Xf([e])},Qf=function(){return zf},Zf=function(t,e){let n=Object.keys(zf).filter((n=>n!==e&&(!zf[n].type||zf[n].type===qf)&&n.includes(t))).sort(((t,e)=>zf[e].rightCount-zf[t].rightCount));return n},tp=function(t){let e=new Date,n=e.getHours(),r=function(t){function e(t){return t<10?"0"+t:t}return t.getFullYear()+"-"+e(t.getMonth()+1)+"-"+e(t.getDate())}(e);if(Hf.hourly[n]||(Hf.hourly[n]={},Hf.hourly[n][jf]=0,Hf.hourly[n][Bf]=0),Hf.hourly[n][t]||(Hf.hourly[n][t]=0),Hf.hourly[n][t]++,Hf.daily[r]||(Hf.daily[r]={},Hf.daily[r][jf]=0,Hf.daily[r][Bf]=0),Hf.daily[r][t]||(Hf.daily[r][t]=0),Hf.daily[r][t]++,Jf){const e=Qd(),i=Uf(e),s={};s[t]=function(t){return new ff("increment",t)}(1),i.set(Gd(e,`users/${Jf.uid}/hourly/${n}`),s,{merge:!0}),i.set(Gd(e,`users/${Jf.uid}/daily/${r}`),s,{merge:!0}),i.commit().then((()=>{localStorage.setItem("dailyDirty",!1),localStorage.setItem("hourlyDirty",!1)})).catch((t=>{localStorage.setItem("dailyDirty",!0),localStorage.setItem("hourlyDirty",!0)}))}else localStorage.setItem("dailyDirty",!0),localStorage.setItem("hourlyDirty",!0);localStorage.setItem("studyResults",JSON.stringify(Hf)),$f[Vf].forEach((t=>t(Hf)))},ep=function(t){return t.replaceAll(".","。").replaceAll("#","").replaceAll("$","USD").replaceAll("/","").replaceAll("[","").replaceAll("]","")},np=function(t){return(t[jf]||0)+(t[Bf]||0)},rp=function(){oe(yn(),(t=>{if(t){Jf=t;const e=Qd();Of(Wd(e,`users/${Jf.uid}/studyList`),(t=>{let e=JSON.parse(localStorage.getItem("studyListDirty")||"false");if(!t.metadata.hasPendingWrites){let n=!1;Kf&&(Kf=!1,n=!0);let r=!1,i={},s=[];for(const e of t.docChanges())"added"===e.type||"modified"===e.type?i[e.doc.id]=e.doc.data():"removed"===e.type&&s.push(e.doc.id);if(e){for(const t of s)delete zf[t],r=!0;let t=[];for(const[e,n]of Object.entries(i)){const i=zf[e];i&&i.rightCount+i.wrongCount>n.rightCount+n.wrongCount?t.push(e):(zf[e]=n,r=!0)}if(n)for(const e of Object.keys(zf))i[e]||t.push(e);Xf(t)}else{for(const[t,e]of Object.entries(i))zf[t]&&zf[t].due===e.due||(zf[t]=e,r=!0);for(const t of s)delete zf[t],r=!0;Xf([])}r&&$f[Ff].forEach((t=>t(zf)))}})),Of(Wd(e,`users/${Jf.uid}/hourly`),(t=>{if(!t.metadata.hasPendingWrites){let e=JSON.parse(localStorage.getItem("hourlyDirty")||"false"),n=!1;Gf&&(Gf=!1,n=!0);let r={};for(const e of t.docChanges())"added"!==e.type&&"modified"!==e.type||(r[e.doc.id]=e.doc.data());if(e){let t=[];if(n)for(const[e,n]of Object.entries(Hf.hourly))(!r[e]||np(r[e])<np(n))&&n&&t.push(e);for(const[e,n]of Object.entries(r))!Hf.hourly[e]||np(Hf.hourly[e])<=np(n)?Hf.hourly[e]=n:t.push(e);!function(t){const e=Qd(),n=Uf(e);for(let r=0;r<t.length;r++)n.set(Gd(e,`users/${Jf.uid}/hourly/${ep(t[r])}`),Hf.hourly[t[r]],{merge:!0});n.commit().then((()=>{localStorage.setItem("hourlyDirty",!1)})).catch((t=>{localStorage.setItem("hourlyDirty",!0)})),localStorage.setItem("studyResults",JSON.stringify(Hf))}(t)}else for(const[t,e]of Object.entries(r))Hf.hourly[t]=e}})),Of(Wd(e,`users/${Jf.uid}/daily`),(t=>{if(!t.metadata.hasPendingWrites){let e=JSON.parse(localStorage.getItem("dailyDirty")||"false"),n=!1;Wf&&(Wf=!1,n=!0);let r={};for(const e of t.docChanges())"added"!==e.type&&"modified"!==e.type||(r[e.doc.id]=e.doc.data());if(e){let t=[];if(n)for(const[e,n]of Object.entries(Hf.daily))(!r[e]||np(r[e])<np(n))&&t.push(e);for(const[e,n]of Object.entries(r))!Hf.daily[e]||np(Hf.daily[e])<=np(n)?Hf.daily[e]=n:t.push(e);!function(t){const e=Qd(),n=Uf(e);for(let r=0;r<t.length;r++)n.set(Gd(e,`users/${Jf.uid}/daily/${ep(t[r])}`),Hf.daily[t[r]],{merge:!0});n.commit().then((()=>{localStorage.setItem("dailyDirty",!1)})).catch((t=>{localStorage.setItem("dailyDirty",!0)})),localStorage.setItem("studyResults",JSON.stringify(Hf))}(t)}else for(const[t,e]of Object.entries(r))Hf.daily[t]=e}}))}}))};const ip=document.getElementById("hanzi-box"),sp=document.getElementById("not-found-message"),op=document.getElementById("walkthrough"),ap=document.getElementById("examples");const cp=document.getElementById("graph-selector"),lp=document.getElementById("show-pinyin"),up=document.getElementById("toggle-pinyin-label"),hp=document.getElementById("offline-item"),dp=document.getElementById("offline-button");let fp=["Top1k","Top2k","Top4k","Top7k","Top10k",">10k"],pp=[1e3,2e3,4e3,7e3,1e4,Number.MAX_SAFE_INTEGER];const gp={hsk:{display:"HSK Wordlist",prefix:"hsk",legend:["HSK1","HSK2","HSK3","HSK4","HSK5","HSK6"],defaultHanzi:["围","须","按","冲","店","课","右","怕","舞","跳"],type:"test",locale:"zh-CN"},simplified:{display:"Simplified",prefix:"simplified",legend:fp,ranks:pp,augmentPath:"data/simplified",definitionsAugmentPath:"data/simplified/definitions",partitionCount:100,defaultHanzi:["围","须","按","冲","店","课","右","怕","舞","跳"],locale:"zh-CN",type:"frequency",hasCoverage:"all",collocationsPath:"data/simplified/collocations",englishPath:"data/simplified/english"},traditional:{display:"Traditional",prefix:"traditional",legend:fp,ranks:pp,augmentPath:"data/traditional",definitionsAugmentPath:"data/traditional/definitions",partitionCount:100,locale:"zh-TW",defaultHanzi:["按","店","右","怕","舞","跳","動"],type:"frequency",hasCoverage:"all",collocationsPath:"data/traditional/collocations",englishPath:"data/traditional/english"},cantonese:{display:"Cantonese",prefix:"cantonese",legend:fp,ranks:pp,definitionsAugmentPath:"data/cantonese/definitions",partitionCount:100,ttsKey:"zh-HK",locale:"zh-HK",defaultHanzi:["我","哥","路","細"],transcriptionName:"jyutping",type:"frequency",disableToneColors:!0}};let mp="simplified";function yp(t,e){let n=0;for(let e=0;e<t.length;e++)n+=t.charCodeAt(e);return n%e}function vp(){return gp[mp]}function wp(){let t=cp.value;if(t!==mp){mp=t;let e=gp[mp].prefix;document.location.href=`/${e}`}}function Ep(){lp.checked?up.innerText=`Turn off ${gp[mp].transcriptionName||"pinyin"} in examples`:up.innerText=`Turn on ${gp[mp].transcriptionName||"pinyin"} in examples`}const _p=document.getElementById("walkthrough-character-set");function bp(){cp.addEventListener("change",wp),lp.addEventListener("change",(function(){var t,e;Ep(),t=lp.checked,e=mp,localStorage.setItem("options",JSON.stringify({transcriptions:t,selectedCharacterSet:e}))}));let t=JSON.parse(localStorage.getItem("options"));const e=function(t,e){if(e&&e.graph)return e.graph;if(t&&t.selectedCharacterSet)return t.selectedCharacterSet;return null}(t,Cp(document.location.pathname));e&&(cp.value=e,mp=e),t&&(lp.checked=t.transcriptions,lp.dispatchEvent(new Event("change"))),"frequency"===gp[mp].type?(window.wordSet=function(t){let e={};for(let n=0;n<t.length;n++)e[t[n]]=n+1;return e}(window.freqs),window.hanzi=function(t,e){let n={},r=0,i=e[r];for(let s=0;s<t.length;s++){s>i&&(r++,i=e[r]);const o=t[s];for(let t=0;t<o.length;t++){const e=o[t];e in n||(n[e]={node:{level:r+1},edges:{}})}for(let t=0;t<o.length;t++){const e=o[t];for(let i=0;i<o.length;i++){const a=o[i];t!==i&&(!(e in n[a].edges)&&Object.keys(n[a].edges).length<8&&(n[a].edges[e]={level:r+1,words:[]}),n[a].edges[e]&&n[a].edges[e].words.length<2&&!n[a].edges[e].words.includes(o)&&(s<1e4||0===n[a].edges[e].words.length)&&n[a].edges[e].words.push(o))}}}return n}(window.freqs,gp[mp].ranks)):window.wordSet=function(t){let e={};return Object.keys(t).forEach((n=>{e[n]=t[n].node.level,Object.keys(t[n].edges||{}).forEach((r=>{t[n].edges[r].words.forEach((i=>{e[i]=t[n].edges[r].level}))}))})),e}(window.hanzi),Ep(),_p.innerText=gp[mp].display,async function(){if(!("serviceWorker"in navigator))return void(hp.style.display="none");if(!gp[mp].partitionCount)return void(hp.style.display="none");navigator.serviceWorker.ready.then((t=>{navigator.serviceWorker.addEventListener("message",(e=>"checkHasPathsResponse"===e.data.type?(hp.removeAttribute("style"),void(e.data.result?dp.innerText="✅ Dictionary cached":kp(dp,t))):"getPathsResponse"===e.data.type?(clearInterval(Tp),void(e.data.result?dp.innerText="✅ Dictionary cached":(dp.innerText="Sorry, there was an error. Click to retry.",kp(dp,t)))):void 0)),t.active.postMessage({type:"checkHasPaths",paths:Sp()})}))}()}let Tp=null,Ip=0;function kp(t,e){t.addEventListener("click",(function(){t.innerText="Loading...",Ip=0,Tp=setInterval((()=>{t.innerText+=".",Ip++,Ip>100&&clearInterval(Tp)}),1e3),e.active.postMessage({type:"getPaths",paths:Sp()})}),{once:!0})}function Sp(){const t=vp();let e=[];e.push(`/data/${t.prefix}/sentences.json`),e.push(`/data/${t.prefix}/definitions.json`),e.push("/data/components/components.json"),e.push(`/data/${t.prefix}/wordlist.json`),"all"===t.hasCoverage&&(e.push(`/data/${t.prefix}/coverage_stats.json`),e.push(`/data/${t.prefix}/character_freq_list.json`));for(let n=0;n<t.partitionCount;n++)e.push(`/${t.definitionsAugmentPath}/${n}.json`),e.push(`/${t.englishPath}/${n}.json`);return e}function Cp(t){"/"===t[0]&&(t=t.substring(1));const e=t.split("/");return 1===e.length?e[0]in gp?{graph:e[0]}:{word:decodeURIComponent(e[0])}:2===e.length?{graph:e[0],word:decodeURIComponent(e[1])}:3===e.length?{graph:e[0],word:decodeURIComponent(e[1]),mode:e[2]}:{}}function Ap(t,e){return null==t||null==e?NaN:t<e?-1:t>e?1:t>=e?0:NaN}function xp(t,e){return null==t||null==e?NaN:e<t?-1:e>t?1:e>=t?0:NaN}function Np(t){let e,n,r;function i(t,r,i=0,s=t.length){if(i<s){if(0!==e(r,r))return s;do{const e=i+s>>>1;n(t[e],r)<0?i=e+1:s=e}while(i<s)}return i}return 2!==t.length?(e=Ap,n=(e,n)=>Ap(t(e),n),r=(e,n)=>t(e)-n):(e=t===Ap||t===xp?t:Lp,n=t,r=t),{left:i,center:function(t,e,n=0,s=t.length){const o=i(t,e,n,s-1);return o>n&&r(t[o-1],e)>-r(t[o],e)?o-1:o},right:function(t,r,i=0,s=t.length){if(i<s){if(0!==e(r,r))return s;do{const e=i+s>>>1;n(t[e],r)<=0?i=e+1:s=e}while(i<s)}return i}}}function Lp(){return 0}const Rp=Np(Ap).right;Np((function(t){return null===t?NaN:+t})).center;var Dp=Rp;class Mp extends Map{constructor(t,e=Vp){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:e}}),null!=t)for(const[e,n]of t)this.set(e,n)}get(t){return super.get(Pp(this,t))}has(t){return super.has(Pp(this,t))}set(t,e){return super.set(Up(this,t),e)}delete(t){return super.delete(Fp(this,t))}}class Op extends Set{constructor(t,e=Vp){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:e}}),null!=t)for(const e of t)this.add(e)}has(t){return super.has(Pp(this,t))}add(t){return super.add(Up(this,t))}delete(t){return super.delete(Fp(this,t))}}function Pp({_intern:t,_key:e},n){const r=e(n);return t.has(r)?t.get(r):n}function Up({_intern:t,_key:e},n){const r=e(n);return t.has(r)?t.get(r):(t.set(r,n),n)}function Fp({_intern:t,_key:e},n){const r=e(n);return t.has(r)&&(n=t.get(r),t.delete(r)),n}function Vp(t){return null!==t&&"object"==typeof t?t.valueOf():t}const $p=Math.sqrt(50),jp=Math.sqrt(10),Bp=Math.sqrt(2);function qp(t,e,n){const r=(e-t)/Math.max(0,n),i=Math.floor(Math.log10(r)),s=r/Math.pow(10,i),o=s>=$p?10:s>=jp?5:s>=Bp?2:1;let a,c,l;return i<0?(l=Math.pow(10,-i)/o,a=Math.round(t*l),c=Math.round(e*l),a/l<t&&++a,c/l>e&&--c,l=-l):(l=Math.pow(10,i)*o,a=Math.round(t/l),c=Math.round(e/l),a*l<t&&++a,c*l>e&&--c),c<a&&.5<=n&&n<2?qp(t,e,2*n):[a,c,l]}function zp(t,e,n){return qp(t=+t,e=+e,n=+n)[2]}function Hp(t,e){let n;if(void 0===e)for(const e of t)null!=e&&(n<e||void 0===n&&e>=e)&&(n=e);else{let r=-1;for(let i of t)null!=(i=e(i,++r,t))&&(n<i||void 0===n&&i>=i)&&(n=i)}return n}function Kp(t,e){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");if("function"!=typeof e)throw new TypeError("mapper is not a function");return Array.from(t,((n,r)=>e(n,r,t)))}function Wp(t){return t}var Gp=1,Jp=2,Xp=3,Yp=4,Qp=1e-6;function Zp(t){return"translate("+t+",0)"}function tg(t){return"translate(0,"+t+")"}function eg(t){return e=>+t(e)}function ng(t,e){return e=Math.max(0,t.bandwidth()-2*e)/2,t.round()&&(e=Math.round(e)),n=>+t(n)+e}function rg(){return!this.__axis}function ig(t,e){var n=[],r=null,i=null,s=6,o=6,a=3,c="undefined"!=typeof window&&window.devicePixelRatio>1?0:.5,l=t===Gp||t===Yp?-1:1,u=t===Yp||t===Jp?"x":"y",h=t===Gp||t===Xp?Zp:tg;function d(d){var f=null==r?e.ticks?e.ticks.apply(e,n):e.domain():r,p=null==i?e.tickFormat?e.tickFormat.apply(e,n):Wp:i,g=Math.max(s,0)+a,m=e.range(),y=+m[0]+c,v=+m[m.length-1]+c,w=(e.bandwidth?ng:eg)(e.copy(),c),E=d.selection?d.selection():d,_=E.selectAll(".domain").data([null]),b=E.selectAll(".tick").data(f,e).order(),T=b.exit(),I=b.enter().append("g").attr("class","tick"),k=b.select("line"),S=b.select("text");_=_.merge(_.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),b=b.merge(I),k=k.merge(I.append("line").attr("stroke","currentColor").attr(u+"2",l*s)),S=S.merge(I.append("text").attr("fill","currentColor").attr(u,l*g).attr("dy",t===Gp?"0em":t===Xp?"0.71em":"0.32em")),d!==E&&(_=_.transition(d),b=b.transition(d),k=k.transition(d),S=S.transition(d),T=T.transition(d).attr("opacity",Qp).attr("transform",(function(t){return isFinite(t=w(t))?h(t+c):this.getAttribute("transform")})),I.attr("opacity",Qp).attr("transform",(function(t){var e=this.parentNode.__axis;return h((e&&isFinite(e=e(t))?e:w(t))+c)}))),T.remove(),_.attr("d",t===Yp||t===Jp?o?"M"+l*o+","+y+"H"+c+"V"+v+"H"+l*o:"M"+c+","+y+"V"+v:o?"M"+y+","+l*o+"V"+c+"H"+v+"V"+l*o:"M"+y+","+c+"H"+v),b.attr("opacity",1).attr("transform",(function(t){return h(w(t)+c)})),k.attr(u+"2",l*s),S.attr(u,l*g).text(p),E.filter(rg).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===Jp?"start":t===Yp?"end":"middle"),E.each((function(){this.__axis=w}))}return d.scale=function(t){return arguments.length?(e=t,d):e},d.ticks=function(){return n=Array.from(arguments),d},d.tickArguments=function(t){return arguments.length?(n=null==t?[]:Array.from(t),d):n.slice()},d.tickValues=function(t){return arguments.length?(r=null==t?null:Array.from(t),d):r&&r.slice()},d.tickFormat=function(t){return arguments.length?(i=t,d):i},d.tickSize=function(t){return arguments.length?(s=o=+t,d):s},d.tickSizeInner=function(t){return arguments.length?(s=+t,d):s},d.tickSizeOuter=function(t){return arguments.length?(o=+t,d):o},d.tickPadding=function(t){return arguments.length?(a=+t,d):a},d.offset=function(t){return arguments.length?(c=+t,d):c},d}var sg={value:()=>{}};function og(){for(var t,e=0,n=arguments.length,r={};e<n;++e){if(!(t=arguments[e]+"")||t in r||/[\s.]/.test(t))throw new Error("illegal type: "+t);r[t]=[]}return new ag(r)}function ag(t){this._=t}function cg(t,e){for(var n,r=0,i=t.length;r<i;++r)if((n=t[r]).name===e)return n.value}function lg(t,e,n){for(var r=0,i=t.length;r<i;++r)if(t[r].name===e){t[r]=sg,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=n&&t.push({name:e,value:n}),t}ag.prototype=og.prototype={constructor:ag,on:function(t,e){var n,r,i=this._,s=(r=i,(t+"").trim().split(/^|\s+/).map((function(t){var e="",n=t.indexOf(".");if(n>=0&&(e=t.slice(n+1),t=t.slice(0,n)),t&&!r.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:e}}))),o=-1,a=s.length;if(!(arguments.length<2)){if(null!=e&&"function"!=typeof e)throw new Error("invalid callback: "+e);for(;++o<a;)if(n=(t=s[o]).type)i[n]=lg(i[n],t.name,e);else if(null==e)for(n in i)i[n]=lg(i[n],t.name,null);return this}for(;++o<a;)if((n=(t=s[o]).type)&&(n=cg(i[n],t.name)))return n},copy:function(){var t={},e=this._;for(var n in e)t[n]=e[n].slice();return new ag(t)},call:function(t,e){if((n=arguments.length-2)>0)for(var n,r,i=new Array(n),s=0;s<n;++s)i[s]=arguments[s+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(s=0,n=(r=this._[t]).length;s<n;++s)r[s].value.apply(e,i)},apply:function(t,e,n){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,s=r.length;i<s;++i)r[i].value.apply(e,n)}};var ug="http://www.w3.org/1999/xhtml",hg={svg:"http://www.w3.org/2000/svg",xhtml:ug,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function dg(t){var e=t+="",n=e.indexOf(":");return n>=0&&"xmlns"!==(e=t.slice(0,n))&&(t=t.slice(n+1)),hg.hasOwnProperty(e)?{space:hg[e],local:t}:t}function fg(t){return function(){var e=this.ownerDocument,n=this.namespaceURI;return n===ug&&e.documentElement.namespaceURI===ug?e.createElement(t):e.createElementNS(n,t)}}function pg(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function gg(t){var e=dg(t);return(e.local?pg:fg)(e)}function mg(){}function yg(t){return null==t?mg:function(){return this.querySelector(t)}}function vg(){return[]}function wg(t){return null==t?vg:function(){return this.querySelectorAll(t)}}function Eg(t){return function(){return function(t){return null==t?[]:Array.isArray(t)?t:Array.from(t)}(t.apply(this,arguments))}}function _g(t){return function(){return this.matches(t)}}function bg(t){return function(e){return e.matches(t)}}var Tg=Array.prototype.find;function Ig(){return this.firstElementChild}var kg=Array.prototype.filter;function Sg(){return Array.from(this.children)}function Cg(t){return new Array(t.length)}function Ag(t,e){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=e}function xg(t,e,n,r,i,s){for(var o,a=0,c=e.length,l=s.length;a<l;++a)(o=e[a])?(o.__data__=s[a],r[a]=o):n[a]=new Ag(t,s[a]);for(;a<c;++a)(o=e[a])&&(i[a]=o)}function Ng(t,e,n,r,i,s,o){var a,c,l,u=new Map,h=e.length,d=s.length,f=new Array(h);for(a=0;a<h;++a)(c=e[a])&&(f[a]=l=o.call(c,c.__data__,a,e)+"",u.has(l)?i[a]=c:u.set(l,c));for(a=0;a<d;++a)l=o.call(t,s[a],a,s)+"",(c=u.get(l))?(r[a]=c,c.__data__=s[a],u.delete(l)):n[a]=new Ag(t,s[a]);for(a=0;a<h;++a)(c=e[a])&&u.get(f[a])===c&&(i[a]=c)}function Lg(t){return t.__data__}function Rg(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function Dg(t,e){return t<e?-1:t>e?1:t>=e?0:NaN}function Mg(t){return function(){this.removeAttribute(t)}}function Og(t){return function(){this.removeAttributeNS(t.space,t.local)}}function Pg(t,e){return function(){this.setAttribute(t,e)}}function Ug(t,e){return function(){this.setAttributeNS(t.space,t.local,e)}}function Fg(t,e){return function(){var n=e.apply(this,arguments);null==n?this.removeAttribute(t):this.setAttribute(t,n)}}function Vg(t,e){return function(){var n=e.apply(this,arguments);null==n?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,n)}}function $g(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function jg(t){return function(){this.style.removeProperty(t)}}function Bg(t,e,n){return function(){this.style.setProperty(t,e,n)}}function qg(t,e,n){return function(){var r=e.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,n)}}function zg(t,e){return t.style.getPropertyValue(e)||$g(t).getComputedStyle(t,null).getPropertyValue(e)}function Hg(t){return function(){delete this[t]}}function Kg(t,e){return function(){this[t]=e}}function Wg(t,e){return function(){var n=e.apply(this,arguments);null==n?delete this[t]:this[t]=n}}function Gg(t){return t.trim().split(/^|\s+/)}function Jg(t){return t.classList||new Xg(t)}function Xg(t){this._node=t,this._names=Gg(t.getAttribute("class")||"")}function Yg(t,e){for(var n=Jg(t),r=-1,i=e.length;++r<i;)n.add(e[r])}function Qg(t,e){for(var n=Jg(t),r=-1,i=e.length;++r<i;)n.remove(e[r])}function Zg(t){return function(){Yg(this,t)}}function tm(t){return function(){Qg(this,t)}}function em(t,e){return function(){(e.apply(this,arguments)?Yg:Qg)(this,t)}}function nm(){this.textContent=""}function rm(t){return function(){this.textContent=t}}function im(t){return function(){var e=t.apply(this,arguments);this.textContent=null==e?"":e}}function sm(){this.innerHTML=""}function om(t){return function(){this.innerHTML=t}}function am(t){return function(){var e=t.apply(this,arguments);this.innerHTML=null==e?"":e}}function cm(){this.nextSibling&&this.parentNode.appendChild(this)}function lm(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function um(){return null}function hm(){var t=this.parentNode;t&&t.removeChild(this)}function dm(){var t=this.cloneNode(!1),e=this.parentNode;return e?e.insertBefore(t,this.nextSibling):t}function fm(){var t=this.cloneNode(!0),e=this.parentNode;return e?e.insertBefore(t,this.nextSibling):t}function pm(t){return function(){var e=this.__on;if(e){for(var n,r=0,i=-1,s=e.length;r<s;++r)n=e[r],t.type&&n.type!==t.type||n.name!==t.name?e[++i]=n:this.removeEventListener(n.type,n.listener,n.options);++i?e.length=i:delete this.__on}}}function gm(t,e,n){return function(){var r,i=this.__on,s=function(t){return function(e){t.call(this,e,this.__data__)}}(e);if(i)for(var o=0,a=i.length;o<a;++o)if((r=i[o]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=s,r.options=n),void(r.value=e);this.addEventListener(t.type,s,n),r={type:t.type,name:t.name,value:e,listener:s,options:n},i?i.push(r):this.__on=[r]}}function mm(t,e,n){var r=$g(t),i=r.CustomEvent;"function"==typeof i?i=new i(e,n):(i=r.document.createEvent("Event"),n?(i.initEvent(e,n.bubbles,n.cancelable),i.detail=n.detail):i.initEvent(e,!1,!1)),t.dispatchEvent(i)}function ym(t,e){return function(){return mm(this,t,e)}}function vm(t,e){return function(){return mm(this,t,e.apply(this,arguments))}}Ag.prototype={constructor:Ag,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,e){return this._parent.insertBefore(t,e)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},Xg.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var e=this._names.indexOf(t);e>=0&&(this._names.splice(e,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var wm=[null];function Em(t,e){this._groups=t,this._parents=e}function _m(){return new Em([[document.documentElement]],wm)}function bm(t){return function(t){return"string"==typeof t?new Em([[document.querySelector(t)]],[document.documentElement]):new Em([[t]],wm)}(gg(t).call(document.documentElement))}function Tm(t,e,n){t.prototype=e.prototype=n,n.constructor=t}function Im(t,e){var n=Object.create(t.prototype);for(var r in e)n[r]=e[r];return n}function km(){}Em.prototype=_m.prototype={constructor:Em,select:function(t){"function"!=typeof t&&(t=yg(t));for(var e=this._groups,n=e.length,r=new Array(n),i=0;i<n;++i)for(var s,o,a=e[i],c=a.length,l=r[i]=new Array(c),u=0;u<c;++u)(s=a[u])&&(o=t.call(s,s.__data__,u,a))&&("__data__"in s&&(o.__data__=s.__data__),l[u]=o);return new Em(r,this._parents)},selectAll:function(t){t="function"==typeof t?Eg(t):wg(t);for(var e=this._groups,n=e.length,r=[],i=[],s=0;s<n;++s)for(var o,a=e[s],c=a.length,l=0;l<c;++l)(o=a[l])&&(r.push(t.call(o,o.__data__,l,a)),i.push(o));return new Em(r,i)},selectChild:function(t){return this.select(null==t?Ig:function(t){return function(){return Tg.call(this.children,t)}}("function"==typeof t?t:bg(t)))},selectChildren:function(t){return this.selectAll(null==t?Sg:function(t){return function(){return kg.call(this.children,t)}}("function"==typeof t?t:bg(t)))},filter:function(t){"function"!=typeof t&&(t=_g(t));for(var e=this._groups,n=e.length,r=new Array(n),i=0;i<n;++i)for(var s,o=e[i],a=o.length,c=r[i]=[],l=0;l<a;++l)(s=o[l])&&t.call(s,s.__data__,l,o)&&c.push(s);return new Em(r,this._parents)},data:function(t,e){if(!arguments.length)return Array.from(this,Lg);var n=e?Ng:xg,r=this._parents,i=this._groups;"function"!=typeof t&&(t=function(t){return function(){return t}}(t));for(var s=i.length,o=new Array(s),a=new Array(s),c=new Array(s),l=0;l<s;++l){var u=r[l],h=i[l],d=h.length,f=Rg(t.call(u,u&&u.__data__,l,r)),p=f.length,g=a[l]=new Array(p),m=o[l]=new Array(p);n(u,h,g,m,c[l]=new Array(d),f,e);for(var y,v,w=0,E=0;w<p;++w)if(y=g[w]){for(w>=E&&(E=w+1);!(v=m[E])&&++E<p;);y._next=v||null}}return(o=new Em(o,r))._enter=a,o._exit=c,o},enter:function(){return new Em(this._enter||this._groups.map(Cg),this._parents)},exit:function(){return new Em(this._exit||this._groups.map(Cg),this._parents)},join:function(t,e,n){var r=this.enter(),i=this,s=this.exit();return"function"==typeof t?(r=t(r))&&(r=r.selection()):r=r.append(t+""),null!=e&&(i=e(i))&&(i=i.selection()),null==n?s.remove():n(s),r&&i?r.merge(i).order():i},merge:function(t){for(var e=t.selection?t.selection():t,n=this._groups,r=e._groups,i=n.length,s=r.length,o=Math.min(i,s),a=new Array(i),c=0;c<o;++c)for(var l,u=n[c],h=r[c],d=u.length,f=a[c]=new Array(d),p=0;p<d;++p)(l=u[p]||h[p])&&(f[p]=l);for(;c<i;++c)a[c]=n[c];return new Em(a,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,e=-1,n=t.length;++e<n;)for(var r,i=t[e],s=i.length-1,o=i[s];--s>=0;)(r=i[s])&&(o&&4^r.compareDocumentPosition(o)&&o.parentNode.insertBefore(r,o),o=r);return this},sort:function(t){function e(e,n){return e&&n?t(e.__data__,n.__data__):!e-!n}t||(t=Dg);for(var n=this._groups,r=n.length,i=new Array(r),s=0;s<r;++s){for(var o,a=n[s],c=a.length,l=i[s]=new Array(c),u=0;u<c;++u)(o=a[u])&&(l[u]=o);l.sort(e)}return new Em(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,e=0,n=t.length;e<n;++e)for(var r=t[e],i=0,s=r.length;i<s;++i){var o=r[i];if(o)return o}return null},size:function(){let t=0;for(const e of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var e=this._groups,n=0,r=e.length;n<r;++n)for(var i,s=e[n],o=0,a=s.length;o<a;++o)(i=s[o])&&t.call(i,i.__data__,o,s);return this},attr:function(t,e){var n=dg(t);if(arguments.length<2){var r=this.node();return n.local?r.getAttributeNS(n.space,n.local):r.getAttribute(n)}return this.each((null==e?n.local?Og:Mg:"function"==typeof e?n.local?Vg:Fg:n.local?Ug:Pg)(n,e))},style:function(t,e,n){return arguments.length>1?this.each((null==e?jg:"function"==typeof e?qg:Bg)(t,e,null==n?"":n)):zg(this.node(),t)},property:function(t,e){return arguments.length>1?this.each((null==e?Hg:"function"==typeof e?Wg:Kg)(t,e)):this.node()[t]},classed:function(t,e){var n=Gg(t+"");if(arguments.length<2){for(var r=Jg(this.node()),i=-1,s=n.length;++i<s;)if(!r.contains(n[i]))return!1;return!0}return this.each(("function"==typeof e?em:e?Zg:tm)(n,e))},text:function(t){return arguments.length?this.each(null==t?nm:("function"==typeof t?im:rm)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?sm:("function"==typeof t?am:om)(t)):this.node().innerHTML},raise:function(){return this.each(cm)},lower:function(){return this.each(lm)},append:function(t){var e="function"==typeof t?t:gg(t);return this.select((function(){return this.appendChild(e.apply(this,arguments))}))},insert:function(t,e){var n="function"==typeof t?t:gg(t),r=null==e?um:"function"==typeof e?e:yg(e);return this.select((function(){return this.insertBefore(n.apply(this,arguments),r.apply(this,arguments)||null)}))},remove:function(){return this.each(hm)},clone:function(t){return this.select(t?fm:dm)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,e,n){var r,i,s=function(t){return t.trim().split(/^|\s+/).map((function(t){var e="",n=t.indexOf(".");return n>=0&&(e=t.slice(n+1),t=t.slice(0,n)),{type:t,name:e}}))}(t+""),o=s.length;if(!(arguments.length<2)){for(a=e?gm:pm,r=0;r<o;++r)this.each(a(s[r],e,n));return this}var a=this.node().__on;if(a)for(var c,l=0,u=a.length;l<u;++l)for(r=0,c=a[l];r<o;++r)if((i=s[r]).type===c.type&&i.name===c.name)return c.value},dispatch:function(t,e){return this.each(("function"==typeof e?vm:ym)(t,e))},[Symbol.iterator]:function*(){for(var t=this._groups,e=0,n=t.length;e<n;++e)for(var r,i=t[e],s=0,o=i.length;s<o;++s)(r=i[s])&&(yield r)}};var Sm=.7,Cm=1/Sm,Am="\\s*([+-]?\\d+)\\s*",xm="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",Nm="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",Lm=/^#([0-9a-f]{3,8})$/,Rm=new RegExp(`^rgb\\(${Am},${Am},${Am}\\)$`),Dm=new RegExp(`^rgb\\(${Nm},${Nm},${Nm}\\)$`),Mm=new RegExp(`^rgba\\(${Am},${Am},${Am},${xm}\\)$`),Om=new RegExp(`^rgba\\(${Nm},${Nm},${Nm},${xm}\\)$`),Pm=new RegExp(`^hsl\\(${xm},${Nm},${Nm}\\)$`),Um=new RegExp(`^hsla\\(${xm},${Nm},${Nm},${xm}\\)$`),Fm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function Vm(){return this.rgb().formatHex()}function $m(){return this.rgb().formatRgb()}function jm(t){var e,n;return t=(t+"").trim().toLowerCase(),(e=Lm.exec(t))?(n=e[1].length,e=parseInt(e[1],16),6===n?Bm(e):3===n?new Hm(e>>8&15|e>>4&240,e>>4&15|240&e,(15&e)<<4|15&e,1):8===n?qm(e>>24&255,e>>16&255,e>>8&255,(255&e)/255):4===n?qm(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|240&e,((15&e)<<4|15&e)/255):null):(e=Rm.exec(t))?new Hm(e[1],e[2],e[3],1):(e=Dm.exec(t))?new Hm(255*e[1]/100,255*e[2]/100,255*e[3]/100,1):(e=Mm.exec(t))?qm(e[1],e[2],e[3],e[4]):(e=Om.exec(t))?qm(255*e[1]/100,255*e[2]/100,255*e[3]/100,e[4]):(e=Pm.exec(t))?Ym(e[1],e[2]/100,e[3]/100,1):(e=Um.exec(t))?Ym(e[1],e[2]/100,e[3]/100,e[4]):Fm.hasOwnProperty(t)?Bm(Fm[t]):"transparent"===t?new Hm(NaN,NaN,NaN,0):null}function Bm(t){return new Hm(t>>16&255,t>>8&255,255&t,1)}function qm(t,e,n,r){return r<=0&&(t=e=n=NaN),new Hm(t,e,n,r)}function zm(t,e,n,r){return 1===arguments.length?((i=t)instanceof km||(i=jm(i)),i?new Hm((i=i.rgb()).r,i.g,i.b,i.opacity):new Hm):new Hm(t,e,n,null==r?1:r);var i}function Hm(t,e,n,r){this.r=+t,this.g=+e,this.b=+n,this.opacity=+r}function Km(){return`#${Xm(this.r)}${Xm(this.g)}${Xm(this.b)}`}function Wm(){const t=Gm(this.opacity);return`${1===t?"rgb(":"rgba("}${Jm(this.r)}, ${Jm(this.g)}, ${Jm(this.b)}${1===t?")":`, ${t})`}`}function Gm(t){return isNaN(t)?1:Math.max(0,Math.min(1,t))}function Jm(t){return Math.max(0,Math.min(255,Math.round(t)||0))}function Xm(t){return((t=Jm(t))<16?"0":"")+t.toString(16)}function Ym(t,e,n,r){return r<=0?t=e=n=NaN:n<=0||n>=1?t=e=NaN:e<=0&&(t=NaN),new Zm(t,e,n,r)}function Qm(t){if(t instanceof Zm)return new Zm(t.h,t.s,t.l,t.opacity);if(t instanceof km||(t=jm(t)),!t)return new Zm;if(t instanceof Zm)return t;var e=(t=t.rgb()).r/255,n=t.g/255,r=t.b/255,i=Math.min(e,n,r),s=Math.max(e,n,r),o=NaN,a=s-i,c=(s+i)/2;return a?(o=e===s?(n-r)/a+6*(n<r):n===s?(r-e)/a+2:(e-n)/a+4,a/=c<.5?s+i:2-s-i,o*=60):a=c>0&&c<1?0:o,new Zm(o,a,c,t.opacity)}function Zm(t,e,n,r){this.h=+t,this.s=+e,this.l=+n,this.opacity=+r}function ty(t){return(t=(t||0)%360)<0?t+360:t}function ey(t){return Math.max(0,Math.min(1,t||0))}function ny(t,e,n){return 255*(t<60?e+(n-e)*t/60:t<180?n:t<240?e+(n-e)*(240-t)/60:e)}Tm(km,jm,{copy(t){return Object.assign(new this.constructor,this,t)},displayable(){return this.rgb().displayable()},hex:Vm,formatHex:Vm,formatHex8:function(){return this.rgb().formatHex8()},formatHsl:function(){return Qm(this).formatHsl()},formatRgb:$m,toString:$m}),Tm(Hm,zm,Im(km,{brighter(t){return t=null==t?Cm:Math.pow(Cm,t),new Hm(this.r*t,this.g*t,this.b*t,this.opacity)},darker(t){return t=null==t?Sm:Math.pow(Sm,t),new Hm(this.r*t,this.g*t,this.b*t,this.opacity)},rgb(){return this},clamp(){return new Hm(Jm(this.r),Jm(this.g),Jm(this.b),Gm(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:Km,formatHex:Km,formatHex8:function(){return`#${Xm(this.r)}${Xm(this.g)}${Xm(this.b)}${Xm(255*(isNaN(this.opacity)?1:this.opacity))}`},formatRgb:Wm,toString:Wm})),Tm(Zm,(function(t,e,n,r){return 1===arguments.length?Qm(t):new Zm(t,e,n,null==r?1:r)}),Im(km,{brighter(t){return t=null==t?Cm:Math.pow(Cm,t),new Zm(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?Sm:Math.pow(Sm,t),new Zm(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=this.h%360+360*(this.h<0),e=isNaN(t)||isNaN(this.s)?0:this.s,n=this.l,r=n+(n<.5?n:1-n)*e,i=2*n-r;return new Hm(ny(t>=240?t-240:t+120,i,r),ny(t,i,r),ny(t<120?t+240:t-120,i,r),this.opacity)},clamp(){return new Zm(ty(this.h),ey(this.s),ey(this.l),Gm(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){const t=Gm(this.opacity);return`${1===t?"hsl(":"hsla("}${ty(this.h)}, ${100*ey(this.s)}%, ${100*ey(this.l)}%${1===t?")":`, ${t})`}`}}));var ry=t=>()=>t;function iy(t){return 1==(t=+t)?sy:function(e,n){return n-e?function(t,e,n){return t=Math.pow(t,n),e=Math.pow(e,n)-t,n=1/n,function(r){return Math.pow(t+r*e,n)}}(e,n,t):ry(isNaN(e)?n:e)}}function sy(t,e){var n=e-t;return n?function(t,e){return function(n){return t+n*e}}(t,n):ry(isNaN(t)?e:t)}var oy=function t(e){var n=iy(e);function r(t,e){var r=n((t=zm(t)).r,(e=zm(e)).r),i=n(t.g,e.g),s=n(t.b,e.b),o=sy(t.opacity,e.opacity);return function(e){return t.r=r(e),t.g=i(e),t.b=s(e),t.opacity=o(e),t+""}}return r.gamma=t,r}(1);function ay(t,e){e||(e=[]);var n,r=t?Math.min(e.length,t.length):0,i=e.slice();return function(s){for(n=0;n<r;++n)i[n]=t[n]*(1-s)+e[n]*s;return i}}function cy(t,e){var n,r=e?e.length:0,i=t?Math.min(r,t.length):0,s=new Array(i),o=new Array(r);for(n=0;n<i;++n)s[n]=gy(t[n],e[n]);for(;n<r;++n)o[n]=e[n];return function(t){for(n=0;n<i;++n)o[n]=s[n](t);return o}}function ly(t,e){var n=new Date;return t=+t,e=+e,function(r){return n.setTime(t*(1-r)+e*r),n}}function uy(t,e){return t=+t,e=+e,function(n){return t*(1-n)+e*n}}function hy(t,e){var n,r={},i={};for(n in null!==t&&"object"==typeof t||(t={}),null!==e&&"object"==typeof e||(e={}),e)n in t?r[n]=gy(t[n],e[n]):i[n]=e[n];return function(t){for(n in r)i[n]=r[n](t);return i}}var dy=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,fy=new RegExp(dy.source,"g");function py(t,e){var n,r,i,s=dy.lastIndex=fy.lastIndex=0,o=-1,a=[],c=[];for(t+="",e+="";(n=dy.exec(t))&&(r=fy.exec(e));)(i=r.index)>s&&(i=e.slice(s,i),a[o]?a[o]+=i:a[++o]=i),(n=n[0])===(r=r[0])?a[o]?a[o]+=r:a[++o]=r:(a[++o]=null,c.push({i:o,x:uy(n,r)})),s=fy.lastIndex;return s<e.length&&(i=e.slice(s),a[o]?a[o]+=i:a[++o]=i),a.length<2?c[0]?function(t){return function(e){return t(e)+""}}(c[0].x):function(t){return function(){return t}}(e):(e=c.length,function(t){for(var n,r=0;r<e;++r)a[(n=c[r]).i]=n.x(t);return a.join("")})}function gy(t,e){var n,r=typeof e;return null==e||"boolean"===r?ry(e):("number"===r?uy:"string"===r?(n=jm(e))?(e=n,oy):py:e instanceof jm?oy:e instanceof Date?ly:function(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}(e)?ay:Array.isArray(e)?cy:"function"!=typeof e.valueOf&&"function"!=typeof e.toString||isNaN(e)?hy:uy)(t,e)}function my(t,e){return t=+t,e=+e,function(n){return Math.round(t*(1-n)+e*n)}}var yy,vy=180/Math.PI,wy={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Ey(t,e,n,r,i,s){var o,a,c;return(o=Math.sqrt(t*t+e*e))&&(t/=o,e/=o),(c=t*n+e*r)&&(n-=t*c,r-=e*c),(a=Math.sqrt(n*n+r*r))&&(n/=a,r/=a,c/=a),t*r<e*n&&(t=-t,e=-e,c=-c,o=-o),{translateX:i,translateY:s,rotate:Math.atan2(e,t)*vy,skewX:Math.atan(c)*vy,scaleX:o,scaleY:a}}function _y(t,e,n,r){function i(t){return t.length?t.pop()+" ":""}return function(s,o){var a=[],c=[];return s=t(s),o=t(o),function(t,r,i,s,o,a){if(t!==i||r!==s){var c=o.push("translate(",null,e,null,n);a.push({i:c-4,x:uy(t,i)},{i:c-2,x:uy(r,s)})}else(i||s)&&o.push("translate("+i+e+s+n)}(s.translateX,s.translateY,o.translateX,o.translateY,a,c),function(t,e,n,s){t!==e?(t-e>180?e+=360:e-t>180&&(t+=360),s.push({i:n.push(i(n)+"rotate(",null,r)-2,x:uy(t,e)})):e&&n.push(i(n)+"rotate("+e+r)}(s.rotate,o.rotate,a,c),function(t,e,n,s){t!==e?s.push({i:n.push(i(n)+"skewX(",null,r)-2,x:uy(t,e)}):e&&n.push(i(n)+"skewX("+e+r)}(s.skewX,o.skewX,a,c),function(t,e,n,r,s,o){if(t!==n||e!==r){var a=s.push(i(s)+"scale(",null,",",null,")");o.push({i:a-4,x:uy(t,n)},{i:a-2,x:uy(e,r)})}else 1===n&&1===r||s.push(i(s)+"scale("+n+","+r+")")}(s.scaleX,s.scaleY,o.scaleX,o.scaleY,a,c),s=o=null,function(t){for(var e,n=-1,r=c.length;++n<r;)a[(e=c[n]).i]=e.x(t);return a.join("")}}}var by,Ty,Iy=_y((function(t){const e=new("function"==typeof DOMMatrix?DOMMatrix:WebKitCSSMatrix)(t+"");return e.isIdentity?wy:Ey(e.a,e.b,e.c,e.d,e.e,e.f)}),"px, ","px)","deg)"),ky=_y((function(t){return null==t?wy:(yy||(yy=document.createElementNS("http://www.w3.org/2000/svg","g")),yy.setAttribute("transform",t),(t=yy.transform.baseVal.consolidate())?Ey((t=t.matrix).a,t.b,t.c,t.d,t.e,t.f):wy)}),", ",")",")"),Sy=0,Cy=0,Ay=0,xy=1e3,Ny=0,Ly=0,Ry=0,Dy="object"==typeof performance&&performance.now?performance:Date,My="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function Oy(){return Ly||(My(Py),Ly=Dy.now()+Ry)}function Py(){Ly=0}function Uy(){this._call=this._time=this._next=null}function Fy(t,e,n){var r=new Uy;return r.restart(t,e,n),r}function Vy(){Ly=(Ny=Dy.now())+Ry,Sy=Cy=0;try{!function(){Oy(),++Sy;for(var t,e=by;e;)(t=Ly-e._time)>=0&&e._call.call(void 0,t),e=e._next;--Sy}()}finally{Sy=0,function(){var t,e,n=by,r=1/0;for(;n;)n._call?(r>n._time&&(r=n._time),t=n,n=n._next):(e=n._next,n._next=null,n=t?t._next=e:by=e);Ty=t,jy(r)}(),Ly=0}}function $y(){var t=Dy.now(),e=t-Ny;e>xy&&(Ry-=e,Ny=t)}function jy(t){Sy||(Cy&&(Cy=clearTimeout(Cy)),t-Ly>24?(t<1/0&&(Cy=setTimeout(Vy,t-Dy.now()-Ry)),Ay&&(Ay=clearInterval(Ay))):(Ay||(Ny=Dy.now(),Ay=setInterval($y,xy)),Sy=1,My(Vy)))}function By(t,e,n){var r=new Uy;return e=null==e?0:+e,r.restart((n=>{r.stop(),t(n+e)}),e,n),r}Uy.prototype=Fy.prototype={constructor:Uy,restart:function(t,e,n){if("function"!=typeof t)throw new TypeError("callback is not a function");n=(null==n?Oy():+n)+(null==e?0:+e),this._next||Ty===this||(Ty?Ty._next=this:by=this,Ty=this),this._call=t,this._time=n,jy()},stop:function(){this._call&&(this._call=null,this._time=1/0,jy())}};var qy=og("start","end","cancel","interrupt"),zy=[],Hy=0,Ky=1,Wy=2,Gy=3,Jy=4,Xy=5,Yy=6;function Qy(t,e,n,r,i,s){var o=t.__transition;if(o){if(n in o)return}else t.__transition={};!function(t,e,n){var r,i=t.__transition;function s(t){n.state=Ky,n.timer.restart(o,n.delay,n.time),n.delay<=t&&o(t-n.delay)}function o(s){var l,u,h,d;if(n.state!==Ky)return c();for(l in i)if((d=i[l]).name===n.name){if(d.state===Gy)return By(o);d.state===Jy?(d.state=Yy,d.timer.stop(),d.on.call("interrupt",t,t.__data__,d.index,d.group),delete i[l]):+l<e&&(d.state=Yy,d.timer.stop(),d.on.call("cancel",t,t.__data__,d.index,d.group),delete i[l])}if(By((function(){n.state===Gy&&(n.state=Jy,n.timer.restart(a,n.delay,n.time),a(s))})),n.state=Wy,n.on.call("start",t,t.__data__,n.index,n.group),n.state===Wy){for(n.state=Gy,r=new Array(h=n.tween.length),l=0,u=-1;l<h;++l)(d=n.tween[l].value.call(t,t.__data__,n.index,n.group))&&(r[++u]=d);r.length=u+1}}function a(e){for(var i=e<n.duration?n.ease.call(null,e/n.duration):(n.timer.restart(c),n.state=Xy,1),s=-1,o=r.length;++s<o;)r[s].call(t,i);n.state===Xy&&(n.on.call("end",t,t.__data__,n.index,n.group),c())}function c(){for(var r in n.state=Yy,n.timer.stop(),delete i[e],i)return;delete t.__transition}i[e]=n,n.timer=Fy(s,0,n.time)}(t,n,{name:e,index:r,group:i,on:qy,tween:zy,time:s.time,delay:s.delay,duration:s.duration,ease:s.ease,timer:null,state:Hy})}function Zy(t,e){var n=ev(t,e);if(n.state>Hy)throw new Error("too late; already scheduled");return n}function tv(t,e){var n=ev(t,e);if(n.state>Gy)throw new Error("too late; already running");return n}function ev(t,e){var n=t.__transition;if(!n||!(n=n[e]))throw new Error("transition not found");return n}function nv(t,e){var n,r;return function(){var i=tv(this,t),s=i.tween;if(s!==n)for(var o=0,a=(r=n=s).length;o<a;++o)if(r[o].name===e){(r=r.slice()).splice(o,1);break}i.tween=r}}function rv(t,e,n){var r,i;if("function"!=typeof n)throw new Error;return function(){var s=tv(this,t),o=s.tween;if(o!==r){i=(r=o).slice();for(var a={name:e,value:n},c=0,l=i.length;c<l;++c)if(i[c].name===e){i[c]=a;break}c===l&&i.push(a)}s.tween=i}}function iv(t,e,n){var r=t._id;return t.each((function(){var t=tv(this,r);(t.value||(t.value={}))[e]=n.apply(this,arguments)})),function(t){return ev(t,r).value[e]}}function sv(t,e){var n;return("number"==typeof e?uy:e instanceof jm?oy:(n=jm(e))?(e=n,oy):py)(t,e)}function ov(t){return function(){this.removeAttribute(t)}}function av(t){return function(){this.removeAttributeNS(t.space,t.local)}}function cv(t,e,n){var r,i,s=n+"";return function(){var o=this.getAttribute(t);return o===s?null:o===r?i:i=e(r=o,n)}}function lv(t,e,n){var r,i,s=n+"";return function(){var o=this.getAttributeNS(t.space,t.local);return o===s?null:o===r?i:i=e(r=o,n)}}function uv(t,e,n){var r,i,s;return function(){var o,a,c=n(this);if(null!=c)return(o=this.getAttribute(t))===(a=c+"")?null:o===r&&a===i?s:(i=a,s=e(r=o,c));this.removeAttribute(t)}}function hv(t,e,n){var r,i,s;return function(){var o,a,c=n(this);if(null!=c)return(o=this.getAttributeNS(t.space,t.local))===(a=c+"")?null:o===r&&a===i?s:(i=a,s=e(r=o,c));this.removeAttributeNS(t.space,t.local)}}function dv(t,e){var n,r;function i(){var i=e.apply(this,arguments);return i!==r&&(n=(r=i)&&function(t,e){return function(n){this.setAttributeNS(t.space,t.local,e.call(this,n))}}(t,i)),n}return i._value=e,i}function fv(t,e){var n,r;function i(){var i=e.apply(this,arguments);return i!==r&&(n=(r=i)&&function(t,e){return function(n){this.setAttribute(t,e.call(this,n))}}(t,i)),n}return i._value=e,i}function pv(t,e){return function(){Zy(this,t).delay=+e.apply(this,arguments)}}function gv(t,e){return e=+e,function(){Zy(this,t).delay=e}}function mv(t,e){return function(){tv(this,t).duration=+e.apply(this,arguments)}}function yv(t,e){return e=+e,function(){tv(this,t).duration=e}}var vv=_m.prototype.constructor;function wv(t){return function(){this.style.removeProperty(t)}}var Ev=0;function _v(t,e,n,r){this._groups=t,this._parents=e,this._name=n,this._id=r}function bv(){return++Ev}var Tv=_m.prototype;_v.prototype={constructor:_v,select:function(t){var e=this._name,n=this._id;"function"!=typeof t&&(t=yg(t));for(var r=this._groups,i=r.length,s=new Array(i),o=0;o<i;++o)for(var a,c,l=r[o],u=l.length,h=s[o]=new Array(u),d=0;d<u;++d)(a=l[d])&&(c=t.call(a,a.__data__,d,l))&&("__data__"in a&&(c.__data__=a.__data__),h[d]=c,Qy(h[d],e,n,d,h,ev(a,n)));return new _v(s,this._parents,e,n)},selectAll:function(t){var e=this._name,n=this._id;"function"!=typeof t&&(t=wg(t));for(var r=this._groups,i=r.length,s=[],o=[],a=0;a<i;++a)for(var c,l=r[a],u=l.length,h=0;h<u;++h)if(c=l[h]){for(var d,f=t.call(c,c.__data__,h,l),p=ev(c,n),g=0,m=f.length;g<m;++g)(d=f[g])&&Qy(d,e,n,g,f,p);s.push(f),o.push(c)}return new _v(s,o,e,n)},selectChild:Tv.selectChild,selectChildren:Tv.selectChildren,filter:function(t){"function"!=typeof t&&(t=_g(t));for(var e=this._groups,n=e.length,r=new Array(n),i=0;i<n;++i)for(var s,o=e[i],a=o.length,c=r[i]=[],l=0;l<a;++l)(s=o[l])&&t.call(s,s.__data__,l,o)&&c.push(s);return new _v(r,this._parents,this._name,this._id)},merge:function(t){if(t._id!==this._id)throw new Error;for(var e=this._groups,n=t._groups,r=e.length,i=n.length,s=Math.min(r,i),o=new Array(r),a=0;a<s;++a)for(var c,l=e[a],u=n[a],h=l.length,d=o[a]=new Array(h),f=0;f<h;++f)(c=l[f]||u[f])&&(d[f]=c);for(;a<r;++a)o[a]=e[a];return new _v(o,this._parents,this._name,this._id)},selection:function(){return new vv(this._groups,this._parents)},transition:function(){for(var t=this._name,e=this._id,n=bv(),r=this._groups,i=r.length,s=0;s<i;++s)for(var o,a=r[s],c=a.length,l=0;l<c;++l)if(o=a[l]){var u=ev(o,e);Qy(o,t,n,l,a,{time:u.time+u.delay+u.duration,delay:0,duration:u.duration,ease:u.ease})}return new _v(r,this._parents,t,n)},call:Tv.call,nodes:Tv.nodes,node:Tv.node,size:Tv.size,empty:Tv.empty,each:Tv.each,on:function(t,e){var n=this._id;return arguments.length<2?ev(this.node(),n).on.on(t):this.each(function(t,e,n){var r,i,s=function(t){return(t+"").trim().split(/^|\s+/).every((function(t){var e=t.indexOf(".");return e>=0&&(t=t.slice(0,e)),!t||"start"===t}))}(e)?Zy:tv;return function(){var o=s(this,t),a=o.on;a!==r&&(i=(r=a).copy()).on(e,n),o.on=i}}(n,t,e))},attr:function(t,e){var n=dg(t),r="transform"===n?ky:sv;return this.attrTween(t,"function"==typeof e?(n.local?hv:uv)(n,r,iv(this,"attr."+t,e)):null==e?(n.local?av:ov)(n):(n.local?lv:cv)(n,r,e))},attrTween:function(t,e){var n="attr."+t;if(arguments.length<2)return(n=this.tween(n))&&n._value;if(null==e)return this.tween(n,null);if("function"!=typeof e)throw new Error;var r=dg(t);return this.tween(n,(r.local?dv:fv)(r,e))},style:function(t,e,n){var r="transform"==(t+="")?Iy:sv;return null==e?this.styleTween(t,function(t,e){var n,r,i;return function(){var s=zg(this,t),o=(this.style.removeProperty(t),zg(this,t));return s===o?null:s===n&&o===r?i:i=e(n=s,r=o)}}(t,r)).on("end.style."+t,wv(t)):"function"==typeof e?this.styleTween(t,function(t,e,n){var r,i,s;return function(){var o=zg(this,t),a=n(this),c=a+"";return null==a&&(this.style.removeProperty(t),c=a=zg(this,t)),o===c?null:o===r&&c===i?s:(i=c,s=e(r=o,a))}}(t,r,iv(this,"style."+t,e))).each(function(t,e){var n,r,i,s,o="style."+e,a="end."+o;return function(){var c=tv(this,t),l=c.on,u=null==c.value[o]?s||(s=wv(e)):void 0;l===n&&i===u||(r=(n=l).copy()).on(a,i=u),c.on=r}}(this._id,t)):this.styleTween(t,function(t,e,n){var r,i,s=n+"";return function(){var o=zg(this,t);return o===s?null:o===r?i:i=e(r=o,n)}}(t,r,e),n).on("end.style."+t,null)},styleTween:function(t,e,n){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==e)return this.tween(r,null);if("function"!=typeof e)throw new Error;return this.tween(r,function(t,e,n){var r,i;function s(){var s=e.apply(this,arguments);return s!==i&&(r=(i=s)&&function(t,e,n){return function(r){this.style.setProperty(t,e.call(this,r),n)}}(t,s,n)),r}return s._value=e,s}(t,e,null==n?"":n))},text:function(t){return this.tween("text","function"==typeof t?function(t){return function(){var e=t(this);this.textContent=null==e?"":e}}(iv(this,"text",t)):function(t){return function(){this.textContent=t}}(null==t?"":t+""))},textTween:function(t){var e="text";if(arguments.length<1)return(e=this.tween(e))&&e._value;if(null==t)return this.tween(e,null);if("function"!=typeof t)throw new Error;return this.tween(e,function(t){var e,n;function r(){var r=t.apply(this,arguments);return r!==n&&(e=(n=r)&&function(t){return function(e){this.textContent=t.call(this,e)}}(r)),e}return r._value=t,r}(t))},remove:function(){return this.on("end.remove",function(t){return function(){var e=this.parentNode;for(var n in this.__transition)if(+n!==t)return;e&&e.removeChild(this)}}(this._id))},tween:function(t,e){var n=this._id;if(t+="",arguments.length<2){for(var r,i=ev(this.node(),n).tween,s=0,o=i.length;s<o;++s)if((r=i[s]).name===t)return r.value;return null}return this.each((null==e?nv:rv)(n,t,e))},delay:function(t){var e=this._id;return arguments.length?this.each(("function"==typeof t?pv:gv)(e,t)):ev(this.node(),e).delay},duration:function(t){var e=this._id;return arguments.length?this.each(("function"==typeof t?mv:yv)(e,t)):ev(this.node(),e).duration},ease:function(t){var e=this._id;return arguments.length?this.each(function(t,e){if("function"!=typeof e)throw new Error;return function(){tv(this,t).ease=e}}(e,t)):ev(this.node(),e).ease},easeVarying:function(t){if("function"!=typeof t)throw new Error;return this.each(function(t,e){return function(){var n=e.apply(this,arguments);if("function"!=typeof n)throw new Error;tv(this,t).ease=n}}(this._id,t))},end:function(){var t,e,n=this,r=n._id,i=n.size();return new Promise((function(s,o){var a={value:o},c={value:function(){0==--i&&s()}};n.each((function(){var n=tv(this,r),i=n.on;i!==t&&((e=(t=i).copy())._.cancel.push(a),e._.interrupt.push(a),e._.end.push(c)),n.on=e})),0===i&&s()}))},[Symbol.iterator]:Tv[Symbol.iterator]};var Iv={time:null,delay:0,duration:250,ease:function(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}};function kv(t,e){for(var n;!(n=t.__transition)||!(n=n[e]);)if(!(t=t.parentNode))throw new Error(`transition ${e} not found`);return n}_m.prototype.interrupt=function(t){return this.each((function(){!function(t,e){var n,r,i,s=t.__transition,o=!0;if(s){for(i in e=null==e?null:e+"",s)(n=s[i]).name===e?(r=n.state>Wy&&n.state<Xy,n.state=Yy,n.timer.stop(),n.on.call(r?"interrupt":"cancel",t,t.__data__,n.index,n.group),delete s[i]):o=!1;o&&delete t.__transition}}(this,t)}))},_m.prototype.transition=function(t){var e,n;t instanceof _v?(e=t._id,t=t._name):(e=bv(),(n=Iv).time=Oy(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,s=0;s<i;++s)for(var o,a=r[s],c=a.length,l=0;l<c;++l)(o=a[l])&&Qy(o,t,e,l,a,n||kv(o,e));return new _v(r,this._parents,t,e)};const Sv=Math.PI,Cv=2*Sv,Av=1e-6,xv=Cv-Av;function Nv(t){this._+=t[0];for(let e=1,n=t.length;e<n;++e)this._+=arguments[e]+t[e]}class Lv{constructor(t){this._x0=this._y0=this._x1=this._y1=null,this._="",this._append=null==t?Nv:function(t){let e=Math.floor(t);if(!(e>=0))throw new Error(`invalid digits: ${t}`);if(e>15)return Nv;const n=10**e;return function(t){this._+=t[0];for(let e=1,r=t.length;e<r;++e)this._+=Math.round(arguments[e]*n)/n+t[e]}}(t)}moveTo(t,e){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+e}`}closePath(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._append`Z`)}lineTo(t,e){this._append`L${this._x1=+t},${this._y1=+e}`}quadraticCurveTo(t,e,n,r){this._append`Q${+t},${+e},${this._x1=+n},${this._y1=+r}`}bezierCurveTo(t,e,n,r,i,s){this._append`C${+t},${+e},${+n},${+r},${this._x1=+i},${this._y1=+s}`}arcTo(t,e,n,r,i){if(t=+t,e=+e,n=+n,r=+r,(i=+i)<0)throw new Error(`negative radius: ${i}`);let s=this._x1,o=this._y1,a=n-t,c=r-e,l=s-t,u=o-e,h=l*l+u*u;if(null===this._x1)this._append`M${this._x1=t},${this._y1=e}`;else if(h>Av)if(Math.abs(u*a-c*l)>Av&&i){let d=n-s,f=r-o,p=a*a+c*c,g=d*d+f*f,m=Math.sqrt(p),y=Math.sqrt(h),v=i*Math.tan((Sv-Math.acos((p+h-g)/(2*m*y)))/2),w=v/y,E=v/m;Math.abs(w-1)>Av&&this._append`L${t+w*l},${e+w*u}`,this._append`A${i},${i},0,0,${+(u*d>l*f)},${this._x1=t+E*a},${this._y1=e+E*c}`}else this._append`L${this._x1=t},${this._y1=e}`;else;}arc(t,e,n,r,i,s){if(t=+t,e=+e,s=!!s,(n=+n)<0)throw new Error(`negative radius: ${n}`);let o=n*Math.cos(r),a=n*Math.sin(r),c=t+o,l=e+a,u=1^s,h=s?r-i:i-r;null===this._x1?this._append`M${c},${l}`:(Math.abs(this._x1-c)>Av||Math.abs(this._y1-l)>Av)&&this._append`L${c},${l}`,n&&(h<0&&(h=h%Cv+Cv),h>xv?this._append`A${n},${n},0,1,${u},${t-o},${e-a}A${n},${n},0,1,${u},${this._x1=c},${this._y1=l}`:h>Av&&this._append`A${n},${n},0,${+(h>=Sv)},${u},${this._x1=t+n*Math.cos(i)},${this._y1=e+n*Math.sin(i)}`)}rect(t,e,n,r){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+e}h${n=+n}v${+r}h${-n}Z`}toString(){return this._}}function Rv(t,e){if((n=(t=e?t.toExponential(e-1):t.toExponential()).indexOf("e"))<0)return null;var n,r=t.slice(0,n);return[r.length>1?r[0]+r.slice(2):r,+t.slice(n+1)]}function Dv(t){return(t=Rv(Math.abs(t)))?t[1]:NaN}var Mv,Ov=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function Pv(t){if(!(e=Ov.exec(t)))throw new Error("invalid format: "+t);var e;return new Uv({fill:e[1],align:e[2],sign:e[3],symbol:e[4],zero:e[5],width:e[6],comma:e[7],precision:e[8]&&e[8].slice(1),trim:e[9],type:e[10]})}function Uv(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function Fv(t,e){var n=Rv(t,e);if(!n)return t+"";var r=n[0],i=n[1];return i<0?"0."+new Array(-i).join("0")+r:r.length>i+1?r.slice(0,i+1)+"."+r.slice(i+1):r+new Array(i-r.length+2).join("0")}Pv.prototype=Uv.prototype,Uv.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var Vv={"%":(t,e)=>(100*t).toFixed(e),b:t=>Math.round(t).toString(2),c:t=>t+"",d:function(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)},e:(t,e)=>t.toExponential(e),f:(t,e)=>t.toFixed(e),g:(t,e)=>t.toPrecision(e),o:t=>Math.round(t).toString(8),p:(t,e)=>Fv(100*t,e),r:Fv,s:function(t,e){var n=Rv(t,e);if(!n)return t+"";var r=n[0],i=n[1],s=i-(Mv=3*Math.max(-8,Math.min(8,Math.floor(i/3))))+1,o=r.length;return s===o?r:s>o?r+new Array(s-o+1).join("0"):s>0?r.slice(0,s)+"."+r.slice(s):"0."+new Array(1-s).join("0")+Rv(t,Math.max(0,e+s-1))[0]},X:t=>Math.round(t).toString(16).toUpperCase(),x:t=>Math.round(t).toString(16)};function $v(t){return t}var jv,Bv,qv,zv=Array.prototype.map,Hv=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function Kv(t){var e,n,r=void 0===t.grouping||void 0===t.thousands?$v:(e=zv.call(t.grouping,Number),n=t.thousands+"",function(t,r){for(var i=t.length,s=[],o=0,a=e[0],c=0;i>0&&a>0&&(c+a+1>r&&(a=Math.max(1,r-c)),s.push(t.substring(i-=a,i+a)),!((c+=a+1)>r));)a=e[o=(o+1)%e.length];return s.reverse().join(n)}),i=void 0===t.currency?"":t.currency[0]+"",s=void 0===t.currency?"":t.currency[1]+"",o=void 0===t.decimal?".":t.decimal+"",a=void 0===t.numerals?$v:function(t){return function(e){return e.replace(/[0-9]/g,(function(e){return t[+e]}))}}(zv.call(t.numerals,String)),c=void 0===t.percent?"%":t.percent+"",l=void 0===t.minus?"−":t.minus+"",u=void 0===t.nan?"NaN":t.nan+"";function h(t){var e=(t=Pv(t)).fill,n=t.align,h=t.sign,d=t.symbol,f=t.zero,p=t.width,g=t.comma,m=t.precision,y=t.trim,v=t.type;"n"===v?(g=!0,v="g"):Vv[v]||(void 0===m&&(m=12),y=!0,v="g"),(f||"0"===e&&"="===n)&&(f=!0,e="0",n="=");var w="$"===d?i:"#"===d&&/[boxX]/.test(v)?"0"+v.toLowerCase():"",E="$"===d?s:/[%p]/.test(v)?c:"",_=Vv[v],b=/[defgprs%]/.test(v);function T(t){var i,s,c,d=w,T=E;if("c"===v)T=_(t)+T,t="";else{var I=(t=+t)<0||1/t<0;if(t=isNaN(t)?u:_(Math.abs(t),m),y&&(t=function(t){t:for(var e,n=t.length,r=1,i=-1;r<n;++r)switch(t[r]){case".":i=e=r;break;case"0":0===i&&(i=r),e=r;break;default:if(!+t[r])break t;i>0&&(i=0)}return i>0?t.slice(0,i)+t.slice(e+1):t}(t)),I&&0==+t&&"+"!==h&&(I=!1),d=(I?"("===h?h:l:"-"===h||"("===h?"":h)+d,T=("s"===v?Hv[8+Mv/3]:"")+T+(I&&"("===h?")":""),b)for(i=-1,s=t.length;++i<s;)if(48>(c=t.charCodeAt(i))||c>57){T=(46===c?o+t.slice(i+1):t.slice(i))+T,t=t.slice(0,i);break}}g&&!f&&(t=r(t,1/0));var k=d.length+t.length+T.length,S=k<p?new Array(p-k+1).join(e):"";switch(g&&f&&(t=r(S+t,S.length?p-T.length:1/0),S=""),n){case"<":t=d+t+T+S;break;case"=":t=d+S+t+T;break;case"^":t=S.slice(0,k=S.length>>1)+d+t+T+S.slice(k);break;default:t=S+d+t+T}return a(t)}return m=void 0===m?6:/[gprs]/.test(v)?Math.max(1,Math.min(21,m)):Math.max(0,Math.min(20,m)),T.toString=function(){return t+""},T}return{format:h,formatPrefix:function(t,e){var n=h(((t=Pv(t)).type="f",t)),r=3*Math.max(-8,Math.min(8,Math.floor(Dv(e)/3))),i=Math.pow(10,-r),s=Hv[8+r/3];return function(t){return n(i*t)+s}}}}function Wv(t,e){switch(arguments.length){case 0:break;case 1:this.range(t);break;default:this.range(e).domain(t)}return this}function Gv(t,e){switch(arguments.length){case 0:break;case 1:"function"==typeof t?this.interpolator(t):this.range(t);break;default:this.domain(t),"function"==typeof e?this.interpolator(e):this.range(e)}return this}jv=Kv({thousands:",",grouping:[3],currency:["$",""]}),Bv=jv.format,qv=jv.formatPrefix;const Jv=Symbol("implicit");function Xv(){var t=new Mp,e=[],n=[],r=Jv;function i(i){let s=t.get(i);if(void 0===s){if(r!==Jv)return r;t.set(i,s=e.push(i)-1)}return n[s%n.length]}return i.domain=function(n){if(!arguments.length)return e.slice();e=[],t=new Mp;for(const r of n)t.has(r)||t.set(r,e.push(r)-1);return i},i.range=function(t){return arguments.length?(n=Array.from(t),i):n.slice()},i.unknown=function(t){return arguments.length?(r=t,i):r},i.copy=function(){return Xv(e,n).unknown(r)},Wv.apply(i,arguments),i}function Yv(t){return+t}var Qv=[0,1];function Zv(t){return t}function tw(t,e){return(e-=t=+t)?function(n){return(n-t)/e}:function(t){return function(){return t}}(isNaN(e)?NaN:.5)}function ew(t,e,n){var r=t[0],i=t[1],s=e[0],o=e[1];return i<r?(r=tw(i,r),s=n(o,s)):(r=tw(r,i),s=n(s,o)),function(t){return s(r(t))}}function nw(t,e,n){var r=Math.min(t.length,e.length)-1,i=new Array(r),s=new Array(r),o=-1;for(t[r]<t[0]&&(t=t.slice().reverse(),e=e.slice().reverse());++o<r;)i[o]=tw(t[o],t[o+1]),s[o]=n(e[o],e[o+1]);return function(e){var n=Dp(t,e,1,r)-1;return s[n](i[n](e))}}function rw(){var t,e,n,r,i,s,o=Qv,a=Qv,c=gy,l=Zv;function u(){var t=Math.min(o.length,a.length);return l!==Zv&&(l=function(t,e){var n;return t>e&&(n=t,t=e,e=n),function(n){return Math.max(t,Math.min(e,n))}}(o[0],o[t-1])),r=t>2?nw:ew,i=s=null,h}function h(e){return null==e||isNaN(e=+e)?n:(i||(i=r(o.map(t),a,c)))(t(l(e)))}return h.invert=function(n){return l(e((s||(s=r(a,o.map(t),uy)))(n)))},h.domain=function(t){return arguments.length?(o=Array.from(t,Yv),u()):o.slice()},h.range=function(t){return arguments.length?(a=Array.from(t),u()):a.slice()},h.rangeRound=function(t){return a=Array.from(t),c=my,u()},h.clamp=function(t){return arguments.length?(l=!!t||Zv,u()):l!==Zv},h.interpolate=function(t){return arguments.length?(c=t,u()):c},h.unknown=function(t){return arguments.length?(n=t,h):n},function(n,r){return t=n,e=r,u()}}function iw(t,e,n,r){var i,s=function(t,e,n){n=+n;const r=(e=+e)<(t=+t),i=r?zp(e,t,n):zp(t,e,n);return(r?-1:1)*(i<0?1/-i:i)}(t,e,n);switch((r=Pv(null==r?",f":r)).type){case"s":var o=Math.max(Math.abs(t),Math.abs(e));return null!=r.precision||isNaN(i=function(t,e){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(Dv(e)/3)))-Dv(Math.abs(t)))}(s,o))||(r.precision=i),qv(r,o);case"":case"e":case"g":case"p":case"r":null!=r.precision||isNaN(i=function(t,e){return t=Math.abs(t),e=Math.abs(e)-t,Math.max(0,Dv(e)-Dv(t))+1}(s,Math.max(Math.abs(t),Math.abs(e))))||(r.precision=i-("e"===r.type));break;case"f":case"%":null!=r.precision||isNaN(i=function(t){return Math.max(0,-Dv(Math.abs(t)))}(s))||(r.precision=i-2*("%"===r.type))}return Bv(r)}function sw(t){var e=t.domain;return t.ticks=function(t){var n=e();return function(t,e,n){if(!((n=+n)>0))return[];if((t=+t)==(e=+e))return[t];const r=e<t,[i,s,o]=r?qp(e,t,n):qp(t,e,n);if(!(s>=i))return[];const a=s-i+1,c=new Array(a);if(r)if(o<0)for(let t=0;t<a;++t)c[t]=(s-t)/-o;else for(let t=0;t<a;++t)c[t]=(s-t)*o;else if(o<0)for(let t=0;t<a;++t)c[t]=(i+t)/-o;else for(let t=0;t<a;++t)c[t]=(i+t)*o;return c}(n[0],n[n.length-1],null==t?10:t)},t.tickFormat=function(t,n){var r=e();return iw(r[0],r[r.length-1],null==t?10:t,n)},t.nice=function(n){null==n&&(n=10);var r,i,s=e(),o=0,a=s.length-1,c=s[o],l=s[a],u=10;for(l<c&&(i=c,c=l,l=i,i=o,o=a,a=i);u-- >0;){if((i=zp(c,l,n))===r)return s[o]=c,s[a]=l,e(s);if(i>0)c=Math.floor(c/i)*i,l=Math.ceil(l/i)*i;else{if(!(i<0))break;c=Math.ceil(c*i)/i,l=Math.floor(l*i)/i}r=i}return t},t}function ow(){var t=rw()(Zv,Zv);return t.copy=function(){return e=t,ow().domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());var e},Wv.apply(t,arguments),sw(t)}function aw(){var t=sw(function(){var t,e,n,r,i,s=0,o=1,a=Zv,c=!1;function l(e){return null==e||isNaN(e=+e)?i:a(0===n?.5:(e=(r(e)-t)*n,c?Math.max(0,Math.min(1,e)):e))}function u(t){return function(e){var n,r;return arguments.length?([n,r]=e,a=t(n,r),l):[a(0),a(1)]}}return l.domain=function(i){return arguments.length?([s,o]=i,t=r(s=+s),e=r(o=+o),n=t===e?0:1/(e-t),l):[s,o]},l.clamp=function(t){return arguments.length?(c=!!t,l):c},l.interpolator=function(t){return arguments.length?(a=t,l):a},l.range=u(gy),l.rangeRound=u(my),l.unknown=function(t){return arguments.length?(i=t,l):i},function(i){return r=i,t=i(s),e=i(o),n=t===e?0:1/(e-t),l}}()(Zv));return t.copy=function(){return e=t,aw().domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());var e},Gv.apply(t,arguments)}var cw=function(t){for(var e=t.length/6|0,n=new Array(e),r=0;r<e;)n[r]="#"+t.slice(6*r,6*++r);return n}("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");function lw(t){return function(){return t}}function uw(t){this._context=t}function hw(t){return new uw(t)}function dw(t){return t[0]}function fw(t){return t[1]}function pw(t,e){var n=lw(!0),r=null,i=hw,s=null,o=function(t){let e=3;return t.digits=function(n){if(!arguments.length)return e;if(null==n)e=null;else{const t=Math.floor(n);if(!(t>=0))throw new RangeError(`invalid digits: ${n}`);e=t}return t},()=>new Lv(e)}(a);function a(a){var c,l,u,h=(a=function(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}(a)).length,d=!1;for(null==r&&(s=i(u=o())),c=0;c<=h;++c)!(c<h&&n(l=a[c],c,a))===d&&((d=!d)?s.lineStart():s.lineEnd()),d&&s.point(+t(l,c,a),+e(l,c,a));if(u)return s=null,u+""||null}return t="function"==typeof t?t:void 0===t?dw:lw(t),e="function"==typeof e?e:void 0===e?fw:lw(e),a.x=function(e){return arguments.length?(t="function"==typeof e?e:lw(+e),a):t},a.y=function(t){return arguments.length?(e="function"==typeof t?t:lw(+t),a):e},a.defined=function(t){return arguments.length?(n="function"==typeof t?t:lw(!!t),a):n},a.curve=function(t){return arguments.length?(i=t,null!=r&&(s=i(r)),a):i},a.context=function(t){return arguments.length?(null==t?r=s=null:s=i(r=t),a):r},a}function gw(t,e,n){this.k=t,this.x=e,this.y=n}function mw(t,e,n,r,i){let s=[];s.push({x:0,y:0});for(const[e,n]of Object.entries(t))s.push({x:parseInt(e)+1,y:n});const o=function(t,e){let n=0,r=t.length-1,i=Math.round((n+r)/2);for(;n<r;){if(t[i].x==e)return t[i].y;t[i].x<e?n=i+1:r=i-1,i=Math.round((n+r)/2)}return t[i].y}(s,n);let a=function(t,{x:e=(([t])=>t),y:n=(([,t])=>t),defined:r,curve:i=hw,marginTop:s=20,marginRight:o=30,marginBottom:a=30,marginLeft:c=40,width:l=640,height:u=400,xType:h=aw,xDomain:d,xLabel:f="",xRange:p=[c,l-o],yType:g=ow,yDomain:m,yRange:y=[u-a,s],yFormat:v,yLabel:w,color:E="currentColor",strokeLinecap:_="round",strokeLinejoin:b="round",strokeWidth:T=1.5,strokeOpacity:I=1,horizontalLine:k,verticalLine:S,horizontalLabel:C,verticalLabel:A}={}){const x=Kp(t,e),N=Kp(t,n),L=function(t,e,n){t=+t,e=+e,n=(i=arguments.length)<2?(e=t,t=0,1):i<3?1:+n;for(var r=-1,i=0|Math.max(0,Math.ceil((e-t)/n)),s=new Array(i);++r<i;)s[r]=t+r*n;return s}(x.length);void 0===r&&(r=(t,e)=>!isNaN(x[e])&&!isNaN(N[e]));const R=Kp(t,r);void 0===d&&(d=function(t,e){let n,r;if(void 0===e)for(const e of t)null!=e&&(void 0===n?e>=e&&(n=r=e):(n>e&&(n=e),r<e&&(r=e)));else{let i=-1;for(let s of t)null!=(s=e(s,++i,t))&&(void 0===n?s>=s&&(n=r=s):(n>s&&(n=s),r<s&&(r=s)))}return[n,r]}(x));void 0===m&&(m=[0,Hp(N)]);const D=h(d,p),M=g(m,y),O=(V=D,ig(Xp,V)).ticks(l/80).tickSizeOuter(0),P=function(t){return ig(Yp,t)}(M).ticks(u/40,v),U=pw().defined((t=>R[t])).curve(i).x((t=>D(x[t]))).y((t=>M(N[t]))),F=bm("svg").attr("width",l).attr("height",u).attr("viewBox",[0,0,l,u]).attr("style","max-width: 100%; height: auto; height: intrinsic;");var V;F.append("g").attr("transform",`translate(0,${u-a})`).call(O).call((t=>t.append("text").attr("x",l/2-c).attr("y",28).attr("fill","currentColor").attr("text-anchor","start").text(f))),F.append("g").attr("transform",`translate(${c},0)`).call(P).call((t=>t.select(".domain").remove())).call((t=>t.selectAll(".tick line").clone().attr("x2",l-c-o).attr("stroke-opacity",.1))).call((t=>t.append("text").attr("x",-c).attr("y",10).attr("fill","currentColor").attr("text-anchor","start").text(w))),F.append("path").attr("fill","none").attr("stroke",E).attr("stroke-width",T).attr("stroke-linecap",_).attr("stroke-linejoin",b).attr("stroke-opacity",I).attr("d",U(L)),k&&F.append("line").attr("x1",D(0)).attr("y1",M(k.y)).attr("x2",D(d[1])).attr("y2",M(k.y)).attr("stroke",k.color).attr("stroke-opacity",k.opacity).attr("stroke-width",k.width).attr("stroke-dasharray",4);S&&F.append("line").attr("x1",D(S.x)).attr("y1",M(0)).attr("x2",D(S.x)).attr("y2",M(k?k.y:N[N.length-1])).attr("stroke",S.color).attr("stroke-opacity",S.opacity).attr("stroke-width",S.width).attr("stroke-dasharray",4);C&&F.append("text").attr("x",D(C.x)).attr("y",M(C.y)-6).attr("fill",C.color).attr("font-weight",C.weight).attr("font-size",C.fontSize).attr("font-family",C.font).text(C.text);A&&F.append("text").attr("x",D(A.x)-40).attr("y",M(A.y)).attr("fill",A.color).attr("font-weight",A.weight).attr("font-size",A.fontSize).attr("font-family",A.font).text(A.text);return F.node()}(s,{x:t=>t.x,y:t=>t.y,yLabel:`Percentage of ${r}s recognized`,xLabel:`Number of ${r}s learned`,xDomain:[0,n],yDomain:[0,1],width:i.offsetWidth,height:i.offsetWidth/1.6,color:"#68aaee",strokeWidth:2.5,yFormat:"%",horizontalLine:{y:o,color:"#de68ee",width:1.5,opacity:.8},verticalLine:{x:n,color:"#de68ee",width:1.5,opacity:.8},horizontalLabel:{x:n/2,y:o,color:"#de68ee",text:e,weight:"bold",font:"sans-serif",fontSize:"16px"}});!function(t,e,n,r,i){let s=document.createElement("p");s.classList.add("coverage-explanation"),s.innerText=`${t} is the ${r}${function(t){if(t%100==11||t%100==12||t%100==13)return"th";return t%=10,1===t?"st":2===t?"nd":3===t?"rd":"th"}(r)} most common ${n}.`,i.appendChild(s);let o=document.createElement("p");o.classList.add("coverage-explanation"),o.innerText=`If you learned each ${n} in order of frequency up to "${t}", you'd know approximately ${(100*e).toFixed(1)}% of all ${n}s encountered in speech.`,i.appendChild(o)}(e,o,r,n,i),i.appendChild(a)}uw.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,e){switch(t=+t,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,e):this._context.moveTo(t,e);break;case 1:this._point=2;default:this._context.lineTo(t,e)}}},gw.prototype={constructor:gw,scale:function(t){return 1===t?this:new gw(this.k*t,this.x,this.y)},translate:function(t,e){return 0===t&0===e?this:new gw(this.k,this.x+this.k*t,this.y+this.k*e)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}},new gw(1,0,0),gw.prototype;let yw={},vw={},ww={},Ew=[];const _w="explore",bw="components";let Tw=_w,Iw=null,kw=function(){return"speechSynthesis"in window?speechSynthesis.getVoices().find((t=>t.lang.replace("_","-")===(vp().ttsKey||"zh-CN"))):null};window.activeUtterances=[];let Sw=kw();"speechSynthesis"in window&&(speechSynthesis.onvoiceschanged=function(){Sw||(Sw=kw())});let Cw=function(t,e){if(Sw=Sw||kw(),Sw){let n=new SpeechSynthesisUtterance(t);activeUtterances.push(n),n.lang=Sw.lang,n.voice=Sw,n.addEventListener("boundary",(function(t){if(null==t.charIndex||null==t.charLength)return!1;e.forEach(((e,n)=>{n>=t.charIndex&&n<t.charIndex+(t.charLength||1)?e.style.backgroundColor="#6de200":e.removeAttribute("style")}))})),n.addEventListener("end",(function(){e.forEach((t=>{t.removeAttribute("style")})),0!==activeUtterances.length&&activeUtterances.shift()})),speechSynthesis.speak(n)}},Aw=function(t,e,n){let r=document.createElement("span");r.className="speak-button",r.addEventListener("click",Cw.bind(this,e,n),!1),t.appendChild(r)},xw=function(t,e){let n=["✔️","+"],r=document.createElement("span");r.className="add-button",r.textContent=function(t){return zf[t]}(e)?n[0]:n[1],r.addEventListener("click",(function(){!function(t,e,n){let r=t[e].map(((t,e)=>({...t,due:Date.now()+e}))),i=[];for(let t=0;t<r.length;t++){let s=r[t].zh.join("");!zf[s]&&r[t].en&&(i.push(s),zf[s]={en:r[t].en,due:r[t].due,zh:r[t].zh,wrongCount:0,rightCount:0,type:qf,vocabOrigin:e,language:n||"zh-CN",added:Date.now()})}Xf(i,null),$f[Ff].forEach((t=>t(zf)))}(ww,e),r.textContent=n[0]})),t.appendChild(r)},Nw=function(t,e){const n=t.split(" ");for(const t of n){let n=document.createElement("span");vp().disableToneColors||n.classList.add(`tone${t[t.length-1]}`),n.innerText=t,e.appendChild(n)}};let Lw=function(t,e){if(t)for(let n=0;n<t.length;n++){let r=document.createElement("li");r.classList.add("definition"),Nw(t[n].pinyin,r);let i=document.createElement("span");i.innerText=`: ${t[n].en}`,r.appendChild(i),e.appendChild(r)}},Rw=function(t,e,n){n=n||5;let r=[],i=[];for(let s=0;s<e.length;s++)if(e[s].zh.includes(t)||1===t.length&&e[s].zh.join("").includes(t))if(e[s].en&&e[s].pinyin){if(r.push(e[s]),r.length===n)break}else i.length<n&&i.push(e[s]);return r.length<n&&i.length>0&&r.splice(r.length,0,...i.slice(0,n-r.length)),r.sort(((t,e)=>t.en&&!e.en?-1:!t.en&&e.en?1:t.zh.length-e.zh.length)),r},Dw=function(t,e){for(let n=0;n<t.length;n++){let r=document.createElement("li");r.classList.add("example");let i=document.createElement("p"),s=t[n].zh.join(""),o=Ww(s,i,!0);if(i.className="target",Aw(i,s,o),r.appendChild(i),t[n].pinyin){let e=document.createElement("p");e.textContent=t[n].pinyin,e.className="transcription",r.appendChild(e)}let a=document.createElement("p");a.textContent=t[n].en,a.className="base",r.appendChild(a),e.appendChild(r)}},Mw=function(t,e){const n=vp();fetch(`/${n.definitionsAugmentPath}/${yp(t,n.partitionCount)}.json`).then((t=>t.json())).then((function(n){if(!e)return!1;let r=n[t]||[];Lw(r,e),function(t,e){if(!t||t.length<=0||vp().disableToneColors)return;const n=document.getElementById(`${e}-header`),r=t[0].pinyin.split(" "),i=n.querySelectorAll(".word-header-character");if(r.length===i.length)for(let t=0;t<i.length;t++){const e=r[t];i[t].classList.add(`tone${e[e.length-1]}`)}}(r,t),ww[t].push(Hw(t,r))}))},Ow=function(t,e){let n=document.createElement("h2");n.classList.add("character-header");let r=document.createElement("span");r.textContent=t,r.classList.add("clickable"),vp().disableToneColors||r.classList.add(`tone${function(t){return t in definitions&&definitions[t].length?definitions[t][0].pinyin[definitions[t][0].pinyin.length-1]:"5"}(t)}`),n.appendChild(r),r.addEventListener("click",(function(){n.classList.contains("active")||(document.querySelectorAll(".character-header").forEach((t=>t.classList.remove("active"))),n.classList.add("active")),document.dispatchEvent(new CustomEvent("components-update",{detail:t}))})),e.appendChild(n)},Pw=function(t,e,n){let r=document.createElement("h2");r.classList.add("word-header");let i=document.createElement("span");!function(t,e){const n=definitions[t];let r=null;n&&n[0].pinyin&&(r=n[0].pinyin.split(" "),r.length!==t.length&&(r=null));for(let n=0;n<t.length;n++){const i=t[n],s=document.createElement("span");if(s.innerText=i,s.classList.add("word-header-character"),r&&!vp().disableToneColors){const t=r[n];s.classList.add(`tone${t[t.length-1]}`)}e.appendChild(s)}}(t,i),i.id=`${t}-header`,i.classList.add("clickable"),r.appendChild(i),Aw(r,t,[]),xw(r,t),n&&r.classList.add("active"),i.addEventListener("click",(function(){r.classList.contains("active")||(document.querySelectorAll(".word-header").forEach((t=>t.classList.remove("active"))),r.classList.add("active")),zn(jn),document.dispatchEvent(new CustomEvent("graph-update",{detail:t}))})),e.appendChild(r)},Uw=function(t,e,n,r){let i=document.createElement("ul");i.classList.add("examples"),r.appendChild(i),e.length>0?Dw(e,i):vp().augmentPath&&function(t,e,n){const r=vp();fetch(`/${r.augmentPath}/${yp(t,r.partitionCount)}.json`).then((t=>t.json())).then((function(r){if(!e)return!1;let i=Rw(t,r,n||2);Dw(i,e),ww[t].push(...i)}))}(t,i,n)},Fw=function(t,e,n,r,i){t in wordSet?(!function(t,e,n){let r=document.createElement("ul");r.className="definitions",n.appendChild(r),e&&e.length>0?Lw(e,r):vp().definitionsAugmentPath&&Mw(t,r)}(t,e,i),Uw(t,n,r,i)):i.innerText="No definitions found. This may indicate a component without its own meaning."};function Vw(t,e){for(const[n,r]of Object.entries(e)){const e=r.tab.querySelector(".separator");t===n?(r.tab.classList.add("active"),e.classList.add("expand"),r.panel.removeAttribute("style"),r.panel.classList.add(r.transitionClass),r.callback()):(r.tab.classList.remove("active"),e.classList.remove("expand"),r.panel.classList.remove(r.transitionClass),r.panel.style.display="none")}}function $w(t){let e=document.createElement("span");return e.classList.add("separator"),t.appendChild(e),e}function jw(t,e){if(!(t in definitions))return;let n=document.createElement("ul");n.className="pronunciations";const r=[...new Set(definitions[t].map((t=>t.pinyin.toLowerCase())))];for(let t=0;t<r.length;t++){let e=document.createElement("li");e.classList.add("pronunciation"),vp().disableToneColors||e.classList.add(`tone${r[t][r[t].length-1]}`),e.textContent=r[t].toLowerCase(),n.appendChild(e)}e.appendChild(n)}function Bw(t,e,n,r,i,s){let o=document.createElement("div");Pw(t,e,s),o.classList.add("explore-tabs"),e.appendChild(o);let a=document.createElement("div");a.classList.add("explore-subpane");let c=document.createElement("div");c.classList.add("explore-subpane"),c.style.display="none";let l=document.createElement("div");l.classList.add("explore-subpane"),l.style.display="none",Iw=function(t,e,n,r,i){let s={};for(let o=0;o<e.length;o++){let a=document.createElement("span");a.classList.add("explore-tab"),a.id=`tab-${e[o].toLowerCase()}`,0===o&&a.classList.add("active"),a.innerText=e[o],$w(a),t.appendChild(a),s[a.id]={tab:a,panel:n[o],callback:r[o],transitionClass:i[o]},a.addEventListener("click",(function(t){Vw(t.target.id,s)}))}return s}(o,["Meaning","Components","Stats"],[a,c,l],[()=>{},()=>{document.dispatchEvent(new CustomEvent("components-update",{detail:t[0]}))},function(){l.innerHTML="",function(t,e){let n=document.createElement("h3");n.classList.add("explore-stat-header"),n.innerText="Word Frequency Stats",yw&&"words"in yw&&t in wordSet&&(e.appendChild(n),mw(yw.words,t,wordSet[t],"word",e));let r=document.createElement("h3");r.classList.add("explore-stat-header"),r.innerText="Character Frequency Stats",e.appendChild(r);let i=!1;for(const n of t)vw&&n in vw&&yw&&"chars"in yw&&(mw(yw.chars,n,vw[n],"character",e),i=!0);i||(r.style.display="none")}(t,l)}],["slide-in","slide-in","slide-in"]),e.appendChild(a),Fw(t,n,r,i,a),function(t,e){let n=!0;for(const r of t){if(!(r in components))continue;let t=document.createElement("div");if(t.classList.add("character-data"),n){let e=document.createElement("p");e.classList.add("explanation"),e.innerText="Click any character to update the diagram.",t.appendChild(e)}Ow(r,t),jw(r,t),n=!1;let i=document.createElement("h3");i.innerText="Components",t.appendChild(i);let s=document.createElement("div");const o=components[r].components.join("");o?(s.className="target",Gw(o,s)):s.innerText="No components found. Maybe we can't break this down any more.",t.appendChild(s);let a=document.createElement("h3");a.innerText="Compounds",t.appendChild(a);let c=document.createElement("div");const l=components[r].componentOf.filter((t=>t in hanzi)).sort(((t,e)=>hanzi[t].node.level-hanzi[e].node.level)).join("");l?(c.className="target",Gw(l,c)):c.innerText="This character is not a component of others.",t.appendChild(c),e.appendChild(t)}}(t,c),e.appendChild(c),e.appendChild(l)}let qw=function(t,e,n){for(ww={},op.style.display="none",sp.style.display="none";ap.firstChild;)ap.firstChild.remove();let r=5;if(t.length>1){r=3,"english"===e&&(r=1);let t=document.createElement("p");t.classList.add("explanation"),t.innerText="There are multiple words.",ap.appendChild(t)}let i=!1;for(let e=0;e<t.length;e++){let n=Rw(t[e],sentences,r),s=definitions[t[e]]||[];ww[t[e]]=[],ww[t[e]].push(Hw(t[e],s)),ww[t[e]].push(...n);let o=document.createElement("div");if(o.classList.add("word-data"),t[e].ignore){let n=document.createElement("h2");n.innerText=t[e].word,n.classList.add("word-header"),o.appendChild(n),ap.append(o)}else Bw(t[e],o,s,n,r,!i),i=!0,ap.append(o)}Ew=t,n||(zw(ip.value),function(t){localStorage.setItem("exploreState",JSON.stringify({words:t}))}(Ew))},zw=function(t){const e=vp(),n=`/${e.prefix}/${t}`;document.title=`${t} | ${e.display}`,history.pushState({word:t},"",n)},Hw=function(t,e){let n={zh:[t]},r="";for(let t=0;t<e.length;t++)r+=e[t].pinyin+": "+e[t].en,r+=t==e.length-1?"":", ";return n.en=r,n},Kw=function(){const t=vp();"all"===t.hasCoverage?(fetch(`/data/${t.prefix}/coverage_stats.json`).then((t=>t.json())).then((t=>yw=t)),fetch(`/data/${t.prefix}/character_freq_list.json`).then((t=>t.json())).then((t=>{vw={};for(let e=0;e<t.length;e++)vw[t[e]]=e+1}))):(vw=null,yw=null)},Ww=function(t,e,n){let r=document.createElement("span");r.className="sentence-container";let i=[];for(let e=0;e<t.length;e++)!function(t){let e=document.createElement("a");e.textContent=t,hanzi[t]&&(e.className="navigable"),e.addEventListener("click",(function(){hanzi[t]&&(t in hanzi&&(zn(jn),document.dispatchEvent(new CustomEvent("graph-update",{detail:t}))),n||Ew&&1===Ew.length&&Ew[0]===t||qw([t],"chinese"))})),i.push(e),r.appendChild(e)}(t[e]);return e.appendChild(r),i};function Gw(t,e){let n=document.createElement("span");n.className="sentence-container";let r=[];for(let e=0;e<t.length;e++)!function(t){let e=document.createElement("a");e.textContent=t,t in components&&(e.className="navigable"),e.addEventListener("click",(function(){t in components&&document.dispatchEvent(new CustomEvent("components-update",{detail:t}))})),r.push(e),n.appendChild(e)}(t[e]);return e.appendChild(n),r}const Jw=document.getElementById("faq-container"),Xw=document.getElementById("faq-study-mode"),Yw=document.getElementById("faq-flow"),Qw=document.getElementById("faq-context"),Zw=document.getElementById("faq-general"),tE=document.getElementById("show-study-faq"),eE=document.getElementById("show-general-faq"),nE={studyMode:Xw,context:Qw,general:Zw,flow:Yw},rE={studyMode:"studyMode",context:"context",general:"general",flow:"flow"};let iE=function(t){Vn(On.faq),nE[t].removeAttribute("style")};const sE=document.getElementById("study-container"),oE=document.getElementById("exportStudyListButton"),aE=document.getElementById("card-question-container"),cE=document.getElementById("card-answer-container"),lE=document.getElementById("show-answer-button"),uE=document.getElementById("task-complete"),hE=document.getElementById("cards-due"),dE=document.getElementById("card-due-count"),fE=document.getElementById("task-description"),pE=document.getElementById("card-answer"),gE=document.getElementById("wrong-button"),mE=document.getElementById("right-button"),yE=document.getElementById("delete-card-button"),vE=document.getElementById("related-cards-container"),wE=document.getElementById("related-cards"),EE=document.getElementById("related-card-query"),_E=document.getElementById("card-old-message"),bE=document.getElementById("card-new-message"),TE=document.getElementById("card-right-count"),IE=document.getElementById("card-wrong-count"),kE=document.getElementById("card-percentage"),SE="_",CE="___",AE=document.getElementById("study-explain-container"),xE=document.getElementById("hide-study-explanation");let NE=null;const LE={recognition:function(t){fE.innerText="What does the text below mean?";let e=t.zh.join(""),n=Ww(e,aE);for(let t=0;t<n.length;t++)n[t].addEventListener("click",RE.bind(this,n[t]));aE.classList.add("target"),Aw(aE,e,n),pE.textContent=t.en},recall:function(t){let e=t.en,n=t.zh.join("");n===t.vocabOrigin?fE.innerText="Can you match the definitions below to a Chinese word?":fE.innerText="Can you translate the text below to Chinese?",pE.innerHTML="",aE.classList.remove("target");let r=Ww(n,pE);for(let t=0;t<r.length;t++)r[t].addEventListener("click",RE.bind(this,r[t]));Aw(pE,n,r),aE.innerText=e},cloze:function(t){let e;fE.innerText=`Can you replace ${CE} to match the translation?`,1===t.vocabOrigin.length?(e=t.zh.join(""),e=e.replaceAll(t.vocabOrigin,(t=>CE))):e=t.zh.map((e=>e===t.vocabOrigin?CE:e)).join("");let n=document.createElement("p");n.className="cloze-container",aE.classList.remove("target");let r=Ww(e,n);for(let t=0;t<r.length;t++)t>=2&&r[t].innerText===SE&&r[t-1].innerText===SE&&r[t-2].innerText===SE&&(r[t].classList.add("cloze-placeholder"),r[t-1].classList.add("cloze-placeholder"),r[t-2].classList.add("cloze-placeholder")),r[t].addEventListener("click",RE.bind(this,r[t]));aE.appendChild(n);let i=document.createElement("p");i.className="cloze-container",i.innerText=t.en,aE.appendChild(i),pE.innerHTML="";let s=Ww(t.vocabOrigin,pE);for(let t=0;t<s.length;t++)s[t].addEventListener("click",RE.bind(this,s[t]));Aw(pE,t.vocabOrigin,s)}};let RE=function(t){let e=Zf(t.textContent,NE),n=Qf();if(EE.innerText=t.textContent,e&&e.length){wE.innerHTML="";for(let t=0;t<Math.min(3,e.length);t++){let r=document.createElement("p");r.className="related-card",r.innerText=e[t];let i=document.createElement("p");i.className="related-card-performance",i.innerText=`(right ${n[e[t]].rightCount||0}, wrong ${n[e[t]].wrongCount||0})`,r.appendChild(i),wE.appendChild(r)}vE.removeAttribute("style")}else vE.style.display="none"},DE=function(){let t=Qf();NE=null;let e=null;cE.style.display="none",lE.innerText="Show Answer";let n=0;for(const[r,i]of Object.entries(t))i.due<=Date.now()&&((!e||e.due>i.due||e.due==i.due&&i.zh.length<e.zh.length)&&(e=i,NE=r),n++);if(dE.textContent=n,aE.innerHTML="",0===n)return uE.removeAttribute("style"),fE.style.display="none",void(lE.style.display="none");uE.style.display="none",lE.removeAttribute("style"),LE[e.type||qf](e),fE.removeAttribute("style"),e.wrongCount+e.rightCount!=0?(_E.removeAttribute("style"),bE.style.display="none",kE.textContent=Math.round(100*e.rightCount/(e.rightCount+e.wrongCount||1)),TE.textContent=`${e.rightCount||0} time${1!=e.rightCount?"s":""}`,IE.textContent=`${e.wrongCount||0} time${1!=e.wrongCount?"s":""}`):(bE.removeAttribute("style"),_E.style.display="none"),vE.style.display="none"},ME=function(){var t;lE.addEventListener("click",(function(){lE.innerText="Answer:",cE.removeAttribute("style"),lE.scrollIntoView()})),gE.addEventListener("click",(function(){Yf(Bf,NE),DE(),hE.scrollIntoView(),hE.classList.add("result-indicator-wrong"),setTimeout((function(){hE.classList.remove("result-indicator-wrong")}),750),tp(Bf)})),mE.addEventListener("click",(function(){Yf(jf,NE),DE(),hE.scrollIntoView(),hE.classList.add("result-indicator-right"),setTimeout((function(){hE.classList.remove("result-indicator-right")}),750),tp(jf)})),yE.addEventListener("click",(function(){let t=NE;var e;delete zf[e=t],$f[Ff].forEach((t=>t(zf))),Xf([e]),Xf([t]),DE()})),oE.addEventListener("click",(function(){let t=Qf(),e="data:text/plain;charset=utf-8,";for(const[n,r]of Object.entries(t))r.type&&r.type!==qf||(e+=[n.replace(";",""),r.en.replace(";","")].join(";"),e+="\n");let n=encodeURI(e),r=document.createElement("a");r.setAttribute("href",n),r.setAttribute("download","hanzi-graph-export-"+Date.now()+".txt"),document.body.appendChild(r),r.click(),document.body.removeChild(r)})),Object.keys(Qf()||{}).length>0&&oE.removeAttribute("style"),t=function(t){t&&Object.keys(t).length>0?oE.removeAttribute("style"):oE.style.display="none",DE()},$f[Ff].push(t),sE.addEventListener("shown",(function(){DE()})),xE.addEventListener("click",(function(){AE.addEventListener("animationend",(function(){AE.style.display="none",AE.classList.remove("fade")})),AE.classList.add("fade")}))};const OE=document.getElementById("stats-container"),PE=document.getElementById("stats-link"),UE=document.getElementById("hourly-graph-detail"),FE=document.getElementById("added-calendar-detail"),VE=document.getElementById("study-calendar-detail"),$E=document.getElementById("studied-graph-detail");let jE="",BE=!1;function qE(t,{id:e,clickHandler:n=(()=>{}),getIntensity:r=(()=>"")}={}){let i=new Date,s=document.createElement("div");s.id=`${e}-calendar`,s.className="calendar";for(let e=0;e<t[0].date.getUTCDay();e++){if(0===e){let t=document.createElement("div");t.style.gridRow="1",t.className="month-indicator",s.appendChild(t)}let t=document.createElement("div");t.className="calendar-day-dummy",t.style.gridRow=`${e+2}`,s.appendChild(t)}for(let c=0;c<t.length;c++){if(0===t[c].date.getUTCDay()){let e=document.createElement("div");e.style.gridRow="1",e.className="month-indicator",t[c].date.getUTCDate()<8&&(e.innerText=t[c].date.toLocaleString("default",{month:"short",timeZone:"UTC"})),s.appendChild(e)}let l=document.createElement("div");o=i,a=t[c].date,o.getUTCFullYear()==a.getUTCFullYear()&&o.getUTCMonth()==a.getUTCMonth()&&o.getUTCDate()==a.getUTCDate()?(l.id=`${e}-today`,l.classList.add("today")):i.valueOf()<t[c].date.valueOf()&&l.classList.add("future"),l.style.gridRow=`${t[c].date.getUTCDay()+2}`,l.classList.add("calendar-day"),l.classList.add(r(t[c].total)),l.addEventListener("click",n.bind(this,0,c)),s.appendChild(l)}var o,a;return s}function zE(t,{labelText:e=(()=>""),color:n=(()=>""),clickHandler:r=(()=>{}),includeYLabel:i=!0,customClass:s,scaleToFit:o}={}){let a=document.createElement("div");if(a.classList.add("bar-chart"),s&&a.classList.add(s),i){a.style.gridTemplateColumns=`50px repeat(${t.length}, 1fr)`;for(let t=10;t>=1;t--){let e=document.createElement("div");e.style.gridRow=""+(100-10*t),e.innerText=10*t+"% -",e.className="bar-chart-y-label",a.appendChild(e)}}else a.style.gridTemplateColumns=`repeat(${t.length}, 1fr)`;let c=1;if(o){c=100;for(let e=0;e<t.length;e++){let n=Math.floor(1/((t[e].count||1)/(t[e].total||100)));c=Math.min(n||1,c)}}for(let e=0;e<t.length;e++){let s=document.createElement("div");s.className="bar-chart-bar",s.style.gridColumn=`${e+(i?2:1)}`,s.style.backgroundColor=n(e),s.style.gridRow=`${100-(Math.floor(t[e].count*c*100/(t[e].total||1))||1)||1} / 101`,s.addEventListener("click",r.bind(this,e)),a.appendChild(s)}let l=document.createElement("div");l.style.gridRow="101",l.style.gridColumn=(i?2:1)+"/max",l.className="bar-chart-separator",a.appendChild(l);for(let n=0;n<t.length;n++){let t=document.createElement("div");t.className="bar-chart-x-label",t.style.gridColumn=`${n+(i?2:1)}`,t.style.gridRow="102",t.innerText=e(n),a.appendChild(t)}return a}let HE=function(t){function e(t){return t<10?"0"+t:t}return t.getUTCFullYear()+"-"+e(t.getUTCMonth()+1)+"-"+e(t.getUTCDate())},KE=function(t){function e(t){return t<10?"0"+t:t}return t.getFullYear()+"-"+e(t.getMonth()+1)+"-"+e(t.getDate())},WE=function(t,e,n){let r=t.length?t[0].date:new Date,i=new Date(KE(new Date)),s=new Date(i.valueOf()-31536e6);r.valueOf()<s.valueOf()&&(s=r);let o=new Date(KE(s)),a=new Date(i.valueOf()+6048e5),c=o.valueOf();for(;c<=a.valueOf();){let r=new Date(c);HE(r)in e||t.push({date:r,...n}),c+=864e5}},GE={},JE=function(){GE={},Object.keys(hanzi).forEach((t=>{let e=hanzi[t].node.level;e in GE||(GE[e]={seen:new Set,total:0,characters:new Set}),GE[e].total++,GE[e].characters.add(t)}))},XE=function(t,e){let n=new Set;Object.keys(t).forEach((t=>{for(let e=0;e<t.length;e++)n.add(t[e])})),n.forEach((t=>{if(hanzi[t]){let e=hanzi[t].node.level;GE[e].seen.add(t)}}));let r=[];Object.keys(GE).sort().forEach((t=>{r.push({count:GE[t].seen.size||0,total:GE[t].total})}));const i=document.getElementById("studied-graph");i.innerHTML="",i.appendChild(zE(r,{labelText:t=>e[t],color:()=>"#68aaee",clickHandler:function(t){!function(t,e,n,r,i){t.innerHTML="";let s=new Set([...e[r+1].characters].filter((t=>!e[r+1][n].has(t))));s.forEach((t=>i+=t)),t.innerHTML=i}($E,GE,"seen",t,`In ${e[t]}, your study list doesn't yet contain:<br>`)}}));let s={},o=Object.values(t).sort(((t,e)=>(t.added||0)-(e.added||0))),a=new Set;for(const t of o)if(t.added){let e=KE(new Date(t.added));e in s||(s[e]={chars:new Set,total:0}),s[e].total++,[...t.zh.join("")].forEach((t=>{hanzi[t]&&!a.has(t)&&(s[e].chars.add(t),a.add(t))}))}else[...t.zh.join("")].forEach((t=>{hanzi[t]&&a.add(t)}));let c=[];for(const[t,e]of Object.entries(s))c.push({date:new Date(t),chars:e.chars,total:e.total});WE(c,s,{chars:new Set,total:0}),c.sort(((t,e)=>t.date-e.date));const l=document.getElementById("added-calendar");l.innerHTML="",l.appendChild(qE(c,{id:"added-calendar",getIntensity:function(t){return 0==t?"empty":t<6?"s":t<12?"m":t<18?"l":t<24?"xl":t<30?"xxl":"epic"},clickHandler:function(t,e){FE.innerHTML="";let n=c[e],r="";n.chars.forEach((t=>r+=t)),n.total&&n.chars.size?FE.innerText=`On ${HE(n.date)}, you added ${n.total} cards, with these new characters: ${r}`:n.total?FE.innerText=`On ${HE(n.date)}, you added ${n.total} cards, with no new characters.`:FE.innerText=`On ${HE(n.date)}, you added no new cards.`}})),document.getElementById("added-calendar-calendar").scrollTo({top:0,left:document.getElementById("added-calendar-today").offsetLeft})},YE=function(){jE=vp().prefix,JE(),PE.addEventListener("click",(function(){let t=vp();t.prefix!==jE&&(jE=t.prefix,JE()),Vn(On.stats),BE=!0,XE(Qf(),t.legend),function(t){let e=[],n=[];for(let n=0;n<24;n++)e.push({hour:n,correct:t.hourly[n.toString()]&&t.hourly[n.toString()].correct||0,incorrect:t.hourly[n.toString()]&&t.hourly[n.toString()].incorrect||0});let r=0;for(let t=0;t<e.length;t++)r+=e[t].correct+e[t].incorrect;for(let t=0;t<24;t++)e[t].count=e[t].correct+e[t].incorrect,e[t].total=r;let i=Object.keys(t.daily);i.sort(((t,e)=>t.localeCompare(e)));for(let e=0;e<i.length;e++){let r=t.daily[i[e]].correct||0,s=t.daily[i[e]].incorrect||0,o=r+s;n.push({date:new Date(i[e]),total:o,result:r-s,correct:r,incorrect:s})}WE(n,t.daily,{total:0,result:0,correct:0,incorrect:0}),n.sort(((t,e)=>t.date-e.date));const s=document.getElementById("study-calendar");s.innerHTML="",s.appendChild(qE(n,{id:"study-calendar",getIntensity:function(t){return 0==t?"empty":t<10?"s":t<25?"m":t<50?"l":t<100?"xl":t<150?"xxl":"epic"},clickHandler:function(t,e){VE.innerHTML="";let r=n[e];VE.innerText=`On ${HE(r.date)}, you studied ${r.total||0} cards. You got ${r.correct} right and ${r.incorrect} wrong.`}})),document.getElementById("study-calendar-container").removeAttribute("style"),document.getElementById("study-calendar-calendar").scrollTo({top:0,left:document.getElementById("study-calendar-today").offsetLeft});let o=function(t){return 0==t?"12am":t<12?`${t}am`:12==t?"12pm":t%12+"pm"};const a=document.getElementById("hourly-graph");a.innerHTML="",a.appendChild(zE(e,{labelText:t=>o(t),color:t=>{let n=e[t].correct/(e[t].correct+e[t].incorrect)*100;return n<=100&&n>=75?"#6de200":n<75&&n>=50?"#68aaee":n<50&&n>=25?"#ff9b35":n<25?"#ff635f":void 0},clickHandler:function(t){e[t].correct+e[t].incorrect!==0?UE.innerText=`In the ${o(e[t].hour)} hour, you've gotten ${e[t].correct} correct and ${e[t].incorrect} incorrect, or ${Math.round(e[t].correct/(e[t].correct+e[t].incorrect)*100)}% correct.`:UE.innerText=`In the ${o(e[t].hour)} hour, you've not studied.`},includeYLabel:!1,customClass:"hours",scaleToFit:!0})),document.getElementById("hourly-container").removeAttribute("style")}(Hf,t.legend)})),OE.addEventListener("hidden",(function(){BE&&($E.innerText="",FE.innerText="",VE.innerText="",UE.innerText="")}))};function QE(t){return t.substring(0,t.length-1)}const ZE=["b","p","m","f","d","t","n","l","g","k","h","z","c","s","zh","ch","sh","r","j","q","x"].sort(((t,e)=>e.length-t.length)),t_=["a","o","e","ai","ei","ao","ou","an","ang","en","eng","ong","u","ua","uo","uai","ui","uan","uang","un","ueng","i","ia","ie","iao","iu","ian","iang","in","ing","iong","ü","üe","üan","ün"].sort(((t,e)=>e.length-t.length)),e_={wu:[null,"u"],wa:[null,"ua"],wo:[null,"uo"],wai:[null,"uai"],wei:[null,"ui"],wan:[null,"uan"],wang:[null,"uang"],wen:[null,"un"],weng:[null,"ueng"],yi:[null,"i"],ya:[null,"ia"],ye:[null,"ie"],yao:[null,"iao"],you:[null,"iu"],yan:[null,"ian"],yang:[null,"iang"],yin:[null,"in"],ying:[null,"ing"],yong:[null,"iong"],yu:[null,"ü"],yue:[null,"üe"],yuan:[null,"üan"],yun:[null,"ün"],ju:["j","ü"],jue:["j","üe"],juan:["j","üan"],jun:["j","ün"],qu:["q","ü"],que:["q","üe"],quan:["q","üan"],qun:["q","ün"],xu:["x","ü"],xue:["x","üe"],xuan:["x","üan"],xun:["x","ün"]};function n_(t){if("xx"===t)return[null,null];let e,n;if((t=t.replace("u:","ü"))in e_)return e_[t];for(const n of ZE)if(t.startsWith(n)){e=n;break}for(const e of t_)if(t.endsWith(e)){n=e;break}return[e,n]}const r_=document.getElementById("graph-container"),i_=document.getElementById("graph"),s_=document.getElementById("color-code-switch"),o_=document.getElementById("freq-legend"),a_=document.getElementById("tone-legend");let c_=null,l_=[],u_=[1e3,2e3,4e3,7e3,1e4,Number.MAX_SAFE_INTEGER];const h_={graph:"graph",components:"components"};let d_=h_.graph,f_=null;const p_={frequency:"frequency",tones:"tones"};let g_=p_.tones;function m_(t){if(!window.wordSet||!(t in wordSet))return u_.length;let e=wordSet[t];for(let t=0;t<u_.length;t++)if(e<u_[t])return t+1;return u_.length}function y_(t,e,n,r){hanzi[t]&&hanzi[e]&&t!==e&&(function(t,e,n){for(const r of n.edges)if(r.data.source===t&&r.data.target===e)return!0;return!1}(t,e,r)||r.edges.push({data:{id:Array.from(t+e).sort().toString(),source:t,target:e,level:m_(n),words:[n],displayWord:n}}))}function v_(t){let e={nodes:[],edges:[]},n=[{word:t,path:[t]}];for(;n.length>0;){let t=n.shift();e.nodes.push({data:{id:t.path.join(""),word:t.word,depth:t.path.length-1,path:t.path,level:t.word in hanzi?hanzi[t.word].node.level:6}});for(const r of window.components[t.word].components)e.edges.push({data:{id:"_edge"+t.path.join("")+r,source:t.path.join(""),target:t.path.join("")+r}}),n.push({word:r,path:[...t.path,r]})}return e}function w_(t,e,n,r,i){if(n<0)return;let s=hanzi[t];r[t]=!0;let o=[];for(const[a,c]of Object.entries(s.edges)){if(o.length==i)break;n>0&&(r[a]||(e.edges.push({data:{id:Array.from(t+a).sort().toString(),source:t,target:a,level:c.level,words:c.words,displayWord:c.words[0]}}),o.push(a)))}e.nodes.push({data:{id:t,level:s.node.level}});for(const t of o)r[t]||w_(t,e,n-1,r,i)}const E_=["#fc5c7d","#ea6596","#d56eaf","#bb75c8","#9b7ce1","#6a82fb"];function __(t){let e=t.data("level");return E_[e-1]}function b_(t){return t in definitions&&definitions[t].length?definitions[t][0].pinyin[definitions[t][0].pinyin.length-1]:"5"}function T_(t){const e=window.matchMedia("(prefers-color-scheme: dark)").matches,n=b_(d_===h_.components?t.data("word"):t.data("id"));return"1"===n?"#ff635f":"2"===n?"#7aeb34":"3"===n?"#de68ee":"4"===n?"#68aaee":e?"#888":"#000"}function I_(t){const e=window.matchMedia("(prefers-color-scheme: dark)").matches;return"5"!==b_(d_===h_.components?t.data("word"):t.data("id"))||e||vp().disableToneColors?"black":"white"}function k_(t){return t>95?{name:"grid"}:{name:"cose",animate:!1}}function S_(t){if("jyutping"===vp().transcriptionName)return"";const e=t.data("source")[t.data("source").length-1],n=t.data("target")[t.data("source").length],r=definitions[e],i=definitions[n];if(!r||!i)return"";for(const t of r.filter((t=>t.pinyin))){const e=QE(t.pinyin.toLowerCase()),[n,r]=n_(e),s=i.filter((t=>t.pinyin));for(const t of s){const n=QE(t.pinyin.toLowerCase());if(n===e)return n}for(const t of s){const e=QE(t.pinyin.toLowerCase()),[i,s]=n_(e);if(i&&i===n)return`${i}-`;if(s&&s===r)return`-${s}`}}return""}function C_(){const t=d_===h_.components,e=g_===p_.tones;let n=window.matchMedia("(prefers-color-scheme: dark)").matches,r=[{selector:"node",style:{"background-color":e?T_:__,label:t?"data(word)":"data(id)",color:e?I_:"black","font-size":t?"20px":"18px","text-valign":"center","text-halign":"center"}},{selector:"edge",style:{"line-color":e||t?n?"#666":"#121212":__,"target-arrow-shape":t?"triangle":"none","curve-style":"straight",label:t?S_:"data(displayWord)",color:t=>n?"#eee":"#000","font-size":t?"12px":"10px","text-background-color":t=>n?"#121212":"#fff","text-background-opacity":"1","text-background-shape":"round-rectangle","text-background-padding":"1px","text-events":"yes"}}];return t&&(r[1].style.width="3px",r[1].style.color="#fff",r[1].style["text-background-color"]="#000",r[1].style["text-background-padding"]="2px",r[1].style["arrow-scale"]="0.65",r[1].style["text-background-shape"]="rectangle",r[1].style["target-arrow-color"]=n?"#aaa":"#121212"),r}function A_(t){let e=t.target.id();l_&&!l_.includes(e)&&function(t){let e={nodes:[],edges:[]};w_(t,e,1,{},8);let n=c_.nodes().length,r=c_.edges().length;c_.add(e),(c_.nodes().length!==n||c_.edges().length!==r)&&c_.layout(k_(c_.nodes().length)).run();l_.push(t)}(e),document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:[t.target.id()]}})),document.dispatchEvent(new CustomEvent("graph-interaction",{detail:t.target.id()})),Vn(On.main)}function x_(t){document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:t.target.data("words")}})),document.dispatchEvent(new CustomEvent("graph-interaction",{detail:t.target.data("words")[0]})),Vn(On.main)}function N_(t,e){c_=cytoscape({container:e,elements:t,layout:k_(t.nodes.length),style:C_(),maxZoom:10,minZoom:.5}),c_.on("tap","node",A_),c_.on("tap","edge",x_)}function L_(){c_&&c_.style(C_())}function R_(t){let e=new Set;for(const n of t)e.add(n);return e.size<3?8:e.size<4?6:e.size<5?5:4}function D_(t){return{name:"breadthfirst",roots:[t],padding:6,spacingFactor:.85,directed:!0}}function M_(t){i_.innerHTML="",i_.className="",d_=h_.graph;let e={nodes:[],edges:[]};for(const n of t)w_(n,e,1,{},R_(t));!function(t,e){for(let n=0;n<t.length-1;n++)y_(t[n],t[n+1],t,e);t.length>1&&y_(t[t.length-1],t[0],t,e)}(t,e),O_?N_(e,i_):U_=e,l_=[...t]}let O_=!0,P_=null,U_=null;function F_(){vp().disableToneColors?(g_=p_.frequency,o_.removeAttribute("style"),a_.style.display="none",s_.style.display="none"):s_.removeAttribute("style")}function V_(){F_(),s_.addEventListener("click",(function(){g_===p_.frequency?(s_.innerText="Tones",g_=p_.tones,a_.removeAttribute("style"),o_.style.display="none"):(s_.innerText="Frequency",g_=p_.frequency,o_.removeAttribute("style"),a_.style.display="none"),L_()})),document.addEventListener("graph-update",(function(t){M_(t.detail)})),document.addEventListener("components-update",(function(t){zn(jn),function(t){i_.innerHTML="",i_.className="",f_=t,d_=h_.components,c_=cytoscape({container:i_,elements:v_(t),layout:D_(t),style:C_(),maxZoom:10,minZoom:.5}),c_.on("tap","node",(function(t){document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:[t.target.data("word")]}})),document.dispatchEvent(new CustomEvent("graph-interaction",{detail:t.target.data("word")}))}))}(t.detail)})),r_.addEventListener("hidden",(function(){O_=!1})),r_.addEventListener("shown-animationend",(function(){O_=!0,U_&&(N_(U_,i_),U_=null)})),window.addEventListener("resize",(function(){clearTimeout(P_),P_=setTimeout((()=>{c_&&O_&&c_.layout(d_===h_.graph?k_(c_.nodes().length):D_(f_)).run()}),1e3)})),matchMedia("(prefers-color-scheme: dark)").addEventListener("change",L_),document.addEventListener("character-set-changed",(function(t){t.detail.ranks&&(u_=t.detail.ranks),F_()}))}function $_(t,e){let n;if(void 0===e)for(const e of t)null!=e&&(n<e||void 0===n&&e>=e)&&(n=e);else{let r=-1;for(let i of t)null!=(i=e(i,++r,t))&&(n<i||void 0===n&&i>=i)&&(n=i)}return n}function j_(t,e){let n;if(void 0===e)for(const e of t)null!=e&&(n>e||void 0===n&&e>=e)&&(n=e);else{let r=-1;for(let i of t)null!=(i=e(i,++r,t))&&(n>i||void 0===n&&i>=i)&&(n=i)}return n}function B_(t,e){let n=0;if(void 0===e)for(let e of t)(e=+e)&&(n+=e);else{let r=-1;for(let i of t)(i=+e(i,++r,t))&&(n+=i)}return n}function q_(t){return t.target.depth}function z_(t){return t.depth}function H_(t,e){return e-1-t.height}function K_(t,e){return t.sourceLinks.length?t.depth:e-1}function W_(t){return t.targetLinks.length?t.depth:t.sourceLinks.length?j_(t.sourceLinks,q_)-1:0}function G_(t){return function(){return t}}function J_(t,e){return Y_(t.source,e.source)||t.index-e.index}function X_(t,e){return Y_(t.target,e.target)||t.index-e.index}function Y_(t,e){return t.y0-e.y0}function Q_(t){return t.value}function Z_(t){return t.index}function tb(t){return t.nodes}function eb(t){return t.links}function nb(t,e){const n=t.get(e);if(!n)throw new Error("missing: "+e);return n}function rb({nodes:t}){for(const e of t){let t=e.y0,n=t;for(const n of e.sourceLinks)n.y0=t+n.width/2,t+=n.width;for(const t of e.targetLinks)t.y1=n+t.width/2,n+=t.width}}function ib(){let t,e,n,r=0,i=0,s=1,o=1,a=24,c=8,l=Z_,u=K_,h=tb,d=eb,f=6;function p(){const p={nodes:h.apply(null,arguments),links:d.apply(null,arguments)};return function({nodes:t,links:e}){for(const[e,n]of t.entries())n.index=e,n.sourceLinks=[],n.targetLinks=[];const r=new Map(t.map(((e,n)=>[l(e,n,t),e])));for(const[t,n]of e.entries()){n.index=t;let{source:e,target:i}=n;"object"!=typeof e&&(e=n.source=nb(r,e)),"object"!=typeof i&&(i=n.target=nb(r,i)),e.sourceLinks.push(n),i.targetLinks.push(n)}if(null!=n)for(const{sourceLinks:e,targetLinks:r}of t)e.sort(n),r.sort(n)}(p),function({nodes:t}){for(const e of t)e.value=void 0===e.fixedValue?Math.max(B_(e.sourceLinks,Q_),B_(e.targetLinks,Q_)):e.fixedValue}(p),function({nodes:t}){const e=t.length;let n=new Set(t),r=new Set,i=0;for(;n.size;){for(const t of n){t.depth=i;for(const{target:e}of t.sourceLinks)r.add(e)}if(++i>e)throw new Error("circular link");n=r,r=new Set}}(p),function({nodes:t}){const e=t.length;let n=new Set(t),r=new Set,i=0;for(;n.size;){for(const t of n){t.height=i;for(const{source:e}of t.targetLinks)r.add(e)}if(++i>e)throw new Error("circular link");n=r,r=new Set}}(p),function(n){const l=function({nodes:t}){const n=$_(t,(t=>t.depth))+1,i=(s-r-a)/(n-1),o=new Array(n);for(const e of t){const t=Math.max(0,Math.min(n-1,Math.floor(u.call(null,e,n))));e.layer=t,e.x0=r+t*i,e.x1=e.x0+a,o[t]?o[t].push(e):o[t]=[e]}if(e)for(const t of o)t.sort(e);return o}(n);t=Math.min(c,(o-i)/($_(l,(t=>t.length))-1)),function(e){const n=j_(e,(e=>(o-i-(e.length-1)*t)/B_(e,Q_)));for(const r of e){let e=i;for(const i of r){i.y0=e,i.y1=e+i.value*n,e=i.y1+t;for(const t of i.sourceLinks)t.width=t.value*n}e=(o-e+t)/(r.length+1);for(let t=0;t<r.length;++t){const n=r[t];n.y0+=e*(t+1),n.y1+=e*(t+1)}_(r)}}(l);for(let t=0;t<f;++t){const e=Math.pow(.99,t),n=Math.max(1-e,(t+1)/f);m(l,e,n),g(l,e,n)}}(p),rb(p),p}function g(t,n,r){for(let i=1,s=t.length;i<s;++i){const s=t[i];for(const t of s){let e=0,r=0;for(const{source:n,value:i}of t.targetLinks){let s=i*(t.layer-n.layer);e+=b(n,t)*s,r+=s}if(!(r>0))continue;let i=(e/r-t.y0)*n;t.y0+=i,t.y1+=i,E(t)}void 0===e&&s.sort(Y_),y(s,r)}}function m(t,n,r){for(let i=t.length-2;i>=0;--i){const s=t[i];for(const t of s){let e=0,r=0;for(const{target:n,value:i}of t.sourceLinks){let s=i*(n.layer-t.layer);e+=T(t,n)*s,r+=s}if(!(r>0))continue;let i=(e/r-t.y0)*n;t.y0+=i,t.y1+=i,E(t)}void 0===e&&s.sort(Y_),y(s,r)}}function y(e,n){const r=e.length>>1,s=e[r];w(e,s.y0-t,r-1,n),v(e,s.y1+t,r+1,n),w(e,o,e.length-1,n),v(e,i,0,n)}function v(e,n,r,i){for(;r<e.length;++r){const s=e[r],o=(n-s.y0)*i;o>1e-6&&(s.y0+=o,s.y1+=o),n=s.y1+t}}function w(e,n,r,i){for(;r>=0;--r){const s=e[r],o=(s.y1-n)*i;o>1e-6&&(s.y0-=o,s.y1-=o),n=s.y0-t}}function E({sourceLinks:t,targetLinks:e}){if(void 0===n){for(const{source:{sourceLinks:t}}of e)t.sort(X_);for(const{target:{targetLinks:e}}of t)e.sort(J_)}}function _(t){if(void 0===n)for(const{sourceLinks:e,targetLinks:n}of t)e.sort(X_),n.sort(J_)}function b(e,n){let r=e.y0-(e.sourceLinks.length-1)*t/2;for(const{target:i,width:s}of e.sourceLinks){if(i===n)break;r+=s+t}for(const{source:t,width:i}of n.targetLinks){if(t===e)break;r-=i}return r}function T(e,n){let r=n.y0-(n.targetLinks.length-1)*t/2;for(const{source:i,width:s}of n.targetLinks){if(i===e)break;r+=s+t}for(const{target:t,width:i}of e.sourceLinks){if(t===n)break;r-=i}return r}return p.update=function(t){return rb(t),t},p.nodeId=function(t){return arguments.length?(l="function"==typeof t?t:G_(t),p):l},p.nodeAlign=function(t){return arguments.length?(u="function"==typeof t?t:G_(t),p):u},p.nodeSort=function(t){return arguments.length?(e=t,p):e},p.nodeWidth=function(t){return arguments.length?(a=+t,p):a},p.nodePadding=function(e){return arguments.length?(c=t=+e,p):c},p.nodes=function(t){return arguments.length?(h="function"==typeof t?t:G_(t),p):h},p.links=function(t){return arguments.length?(d="function"==typeof t?t:G_(t),p):d},p.linkSort=function(t){return arguments.length?(n=t,p):n},p.size=function(t){return arguments.length?(r=i=0,s=+t[0],o=+t[1],p):[s-r,o-i]},p.extent=function(t){return arguments.length?(r=+t[0][0],s=+t[1][0],i=+t[0][1],o=+t[1][1],p):[[r,i],[s,o]]},p.iterations=function(t){return arguments.length?(f=+t,p):f},p}var sb=Math.PI,ob=2*sb,ab=1e-6,cb=ob-ab;function lb(){this._x0=this._y0=this._x1=this._y1=null,this._=""}function ub(){return new lb}function hb(t){return function(){return t}}function db(t){return t[0]}function fb(t){return t[1]}lb.prototype=ub.prototype={constructor:lb,moveTo:function(t,e){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+e)},closePath:function(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")},lineTo:function(t,e){this._+="L"+(this._x1=+t)+","+(this._y1=+e)},quadraticCurveTo:function(t,e,n,r){this._+="Q"+ +t+","+ +e+","+(this._x1=+n)+","+(this._y1=+r)},bezierCurveTo:function(t,e,n,r,i,s){this._+="C"+ +t+","+ +e+","+ +n+","+ +r+","+(this._x1=+i)+","+(this._y1=+s)},arcTo:function(t,e,n,r,i){t=+t,e=+e,n=+n,r=+r,i=+i;var s=this._x1,o=this._y1,a=n-t,c=r-e,l=s-t,u=o-e,h=l*l+u*u;if(i<0)throw new Error("negative radius: "+i);if(null===this._x1)this._+="M"+(this._x1=t)+","+(this._y1=e);else if(h>ab)if(Math.abs(u*a-c*l)>ab&&i){var d=n-s,f=r-o,p=a*a+c*c,g=d*d+f*f,m=Math.sqrt(p),y=Math.sqrt(h),v=i*Math.tan((sb-Math.acos((p+h-g)/(2*m*y)))/2),w=v/y,E=v/m;Math.abs(w-1)>ab&&(this._+="L"+(t+w*l)+","+(e+w*u)),this._+="A"+i+","+i+",0,0,"+ +(u*d>l*f)+","+(this._x1=t+E*a)+","+(this._y1=e+E*c)}else this._+="L"+(this._x1=t)+","+(this._y1=e);else;},arc:function(t,e,n,r,i,s){t=+t,e=+e,s=!!s;var o=(n=+n)*Math.cos(r),a=n*Math.sin(r),c=t+o,l=e+a,u=1^s,h=s?r-i:i-r;if(n<0)throw new Error("negative radius: "+n);null===this._x1?this._+="M"+c+","+l:(Math.abs(this._x1-c)>ab||Math.abs(this._y1-l)>ab)&&(this._+="L"+c+","+l),n&&(h<0&&(h=h%ob+ob),h>cb?this._+="A"+n+","+n+",0,1,"+u+","+(t-o)+","+(e-a)+"A"+n+","+n+",0,1,"+u+","+(this._x1=c)+","+(this._y1=l):h>ab&&(this._+="A"+n+","+n+",0,"+ +(h>=sb)+","+u+","+(this._x1=t+n*Math.cos(i))+","+(this._y1=e+n*Math.sin(i))))},rect:function(t,e,n,r){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+e)+"h"+ +n+"v"+ +r+"h"+-n+"Z"},toString:function(){return this._}};var pb=Array.prototype.slice;function gb(t){return t.source}function mb(t){return t.target}function yb(t,e,n,r,i){t.moveTo(e,n),t.bezierCurveTo(e=(e+r)/2,n,e,i,r,i)}function vb(){return function(t){var e=gb,n=mb,r=db,i=fb,s=null;function o(){var o,a=pb.call(arguments),c=e.apply(this,a),l=n.apply(this,a);if(s||(s=o=ub()),t(s,+r.apply(this,(a[0]=c,a)),+i.apply(this,a),+r.apply(this,(a[0]=l,a)),+i.apply(this,a)),o)return s=null,o+""||null}return o.source=function(t){return arguments.length?(e=t,o):e},o.target=function(t){return arguments.length?(n=t,o):n},o.x=function(t){return arguments.length?(r="function"==typeof t?t:hb(+t),o):r},o.y=function(t){return arguments.length?(i="function"==typeof t?t:hb(+t),o):i},o.context=function(t){return arguments.length?(s=null==t?null:t,o):s},o}(yb)}function wb(t){return[t.source.x1,t.y0]}function Eb(t){return[t.target.x0,t.y1]}function _b(){return vb().source(wb).target(Eb)}const bb=document.getElementById("flow-diagram-container"),Tb=document.getElementById("graph-switch-container"),Ib=document.getElementById("graph-switch");function kb(t,e,n,r,i){let s=e.split(" ");if(s.length>i)return i;if(s.some((t=>!(t in window.wordSet))))return i;let o=0;for(t[0]||(t[0]={},t[0][r]={edges:{},collocations:new Set}),o=0;o<s.length&&s[o]!==r;o++);for(let r=o+1;r<s.length;r++){t[r-o]||(t[r-o]={}),t[r-o][s[r]]||(t[r-o][s[r]]={edges:{},collocations:new Set}),t[r-o][s[r]].collocations.add(e),t[r-o-1][s[r-1]].edges[s[r]]||(t[r-o-1][s[r-1]].edges[s[r]]=0);let i=t[r-o-1][s[r-1]].edges[s[r]];t[r-o-1][s[r-1]].edges[s[r]]=Math.max(n,i),t[r-o-1][s[r-1]].collocations.add(e)}for(let r=o-1;r>=0;r--){t[r-o]||(t[r-o]={}),t[r-o][s[r]]||(t[r-o][s[r]]={edges:{},collocations:new Set}),t[r-o][s[r]].collocations.add(e),t[r-o][s[r]].edges[s[r+1]]||(t[r-o][s[r]].edges[s[r+1]]=0);let i=t[r-o][s[r]].edges[s[r+1]]||0;t[r-o][s[r]].edges[s[r+1]]=Math.max(n,i),t[r-o][s[r]].collocations.add(e)}return-o}function Sb(t,e,n){n.innerHTML="";let r=document.createElement("p");if(r.classList.add("flow-explanation"),n.appendChild(r),!e)return void(r.innerText=`Sorry, we found no data for ${t}`);r.innerText="Click any word for examples. ";let i=document.createElement("a");i.className="active-link",i.textContent="Learn more.",i.addEventListener("click",(function(){iE(rE.flow)})),r.appendChild(i);let s={},o=0;for(const[r,i]of Object.entries(e))o=Math.min(o,kb(s,r,i,t,(n.offsetWidth,3)));let a=function(t,e){let n={nodes:[],edges:[],labels:{},collocations:{}},r={};r[e]=new Set;for(let i=e;i in t;i++){const e=t[i];for(const[t,s]of Object.entries(e)){n.nodes.push({id:`${t}-${i}`}),n.labels[`${t}-${i}`]=t,n.collocations[`${t}-${i}`]=s.collocations;for(const e of Object.keys(s.edges))r[i+1]||(r[i+1]=new Set),r[i+1].add(e),n.edges.push({source:`${t}-${i}`,target:`${e}-${parseInt(i)+1}`,value:s.edges[e]})}}return n}(s,o),c=function({nodes:t,links:e},{format:n=",",align:r="justify",fontColor:i="black",fontSize:s=16,nodeId:o=(t=>t.id),nodeGroup:a,nodeGroups:c,nodeLabel:l,nodeTitle:u=(t=>""),nodeAlign:h=r,nodeWidth:d=25,nodePadding:f=10,nodeLabelPadding:p=2,nodeStroke:g="currentColor",nodeStrokeWidth:m,nodeStrokeOpacity:y,nodeStrokeLinejoin:v,linkSource:w=(({source:t})=>t),linkTarget:E=(({target:t})=>t),linkValue:_=(({value:t})=>t),linkPath:b=_b(),linkTitle:T=(t=>`${t.source.id}  ${t.target.id}: ${t.value}`),linkClickHandler:I=function(t,e){},linkColor:k="source-target",linkStrokeOpacity:S=.4,colors:C=cw,width:A=640,height:x=400,marginTop:N=5,marginRight:L=1,marginBottom:R=5,marginLeft:D=1}={}){"function"!=typeof h&&(h={left:z_,right:H_,center:W_}[h]??K_);const M=Kp(e,w).map(W),O=Kp(e,E).map(W),P=Kp(e,_);void 0===t&&(t=Array.from(function(...t){const e=new Op;for(const n of t)for(const t of n)e.add(t);return e}(M,O),(t=>({id:t}))));const U=Kp(t,o).map(W),F=null==a?null:Kp(t,a).map(W);t=Kp(t,((t,e)=>({id:U[e]}))),e=Kp(e,((t,e)=>({source:M[e],target:O[e],value:P[e]}))),!F&&["source","target","source-target"].includes(k)&&(k="currentColor");F&&void 0===c&&(c=F);const V=null==a?null:Xv(c,C);ib().nodeId((({index:t})=>U[t])).nodeAlign(h).nodeWidth(d).nodePadding(f).extent([[D,N],[A-L,x-R]])({nodes:t,links:e}),"function"!=typeof n&&(n=Bv(n));const $=void 0===l?U:null==l?null:Kp(t,l),j=null==u?null:Kp(t,u),B=null==T?null:Kp(e,T),q=`O-${Math.random().toString(16).slice(2)}`,z=bm("svg").attr("width",A).attr("height",x).attr("viewBox",[0,0,A,x]).attr("style","max-width: 100%; height: auto; height: intrinsic;"),H=z.append("g").attr("stroke",g).attr("stroke-width",m).attr("stroke-opacity",y).attr("stroke-linejoin",v).selectAll("rect").data(t).join("rect").attr("x",(t=>t.x0)).attr("y",(t=>t.y0)).attr("height",(t=>t.y1-t.y0)).attr("width",(t=>t.x1-t.x0));F&&H.attr("fill",(({index:t})=>V(F[t])));j&&H.append("title").text((({index:t})=>j[t]));const K=z.append("g").attr("fill","none").attr("stroke-opacity",S).selectAll("g").data(e).join("g");"source-target"===k&&K.append("linearGradient").attr("id",(t=>`${q}-link-${t.index}`)).attr("gradientUnits","userSpaceOnUse").attr("x1",(t=>t.source.x1)).attr("x2",(t=>t.target.x0)).call((t=>t.append("stop").attr("offset","0%").attr("stop-color",(({source:{index:t}})=>V(F[t]))))).call((t=>t.append("stop").attr("offset","100%").attr("stop-color",(({target:{index:t}})=>V(F[t])))));K.append("path").attr("d",b).attr("stroke","source-target"===k?({index:t})=>`url(#${q}-link-${t})`:"source"===k?({source:{index:t}})=>V(F[t]):"target"===k?({target:{index:t}})=>V(F[t]):k).attr("stroke-width",(({width:t})=>Math.max(1,t))).call(B?t=>t.append("title").text((({index:t})=>B[t])):()=>{}),$&&z.append("g").attr("font-family","sans-serif").attr("font-weight","bold").attr("fill",i).attr("font-size",s).attr("cursor","pointer").selectAll("text").data(t).join("text").attr("x",(t=>t.x0<A/2?t.x1+p:t.x0-p)).attr("y",(t=>(t.y1+t.y0)/2)).attr("dy","0.35em").attr("text-anchor",(t=>t.x0<A/2?"start":"end")).text((({index:t})=>$[t])).on("click",I);function W(t){return null!==t&&"object"==typeof t?t.valueOf():t}return Object.assign(z.node(),{scales:{color:V}})}({nodes:a.nodes,links:a.edges},{nodeGroup:t=>t.id.split("-")[0],width:Math.min(n.offsetWidth,1e3),height:(u=n.offsetHeight,Math.min(500,u-40)),nodeLabel:t=>a.labels[t.id],nodeAlign:"center",linkTitle:t=>`${a.labels[t.source.id]} ${a.labels[t.target.id]}: ${t.value}`,linkClickHandler:(t,e)=>{Lb(a.labels[e.id]),document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:[a.labels[e.id]]}}))},fontColor:"currentColor",fontSize:(l=n.offsetWidth,l>=600?16:14),nodeStroke:null});var l,u;n.appendChild(c)}let Cb=null,Ab=null,xb=!1;function Nb(){vp().collocationsPath?Tb.removeAttribute("style"):Tb.style.visibility="hidden"}function Lb(t){Cb=t;const e=vp();fetch(`/${e.collocationsPath}/${yp(t,e.partitionCount)}.json`).then((t=>t.json())).then((e=>{t==Cb&&(Ab=e[t],xb&&Sb(Cb,Ab,bb))}))}let Rb=null;let Db=null,Mb=null;const Ob=document.getElementById("search-suggestions-container");function Pb(t){return/^[\x00-\xFF]*$/.test(t)}function Ub(t){if(!(t in wordSet)){if(!isNaN(t))return[{word:t,ignore:!0}];if(Pb(t))return[{word:t,ignore:!0}];if(2===t.length){if(t[0]in wordSet&&t[1]in wordSet)return[t[0],t[1]]}else if(3===t.length){let e=t[0],n=t.substring(1);if(e in wordSet&&n in wordSet)return[e,n];if(e=t.substring(0,2),n=t.substring(2),e in wordSet&&n in wordSet)return[e,n];if(t[0]in wordSet&&t[1]in wordSet&&t[2]in wordSet)return[t[0],t[1],t[2]]}else if(4===t.length){let e=t.substring(0,2),n=t.substring(2);if(e in wordSet&&n in wordSet)return[e,n];if(t[0]in wordSet&&t[1]in wordSet&&t[2]in wordSet&&t[3]in wordSet)return[t[0],t[1],t[2],t[3]]}return[{word:t,ignore:!0}]}return[t]}function Fb(t,e){if(e=e||vp().locale,!(Db||Intl&&Intl.Segmenter))return[t];t=t.replace(/[？。！，·【】；：、?,'!]/g,"");let n=[],r=[];if(Db)n=Db(t,!0);else{const r=new Intl.Segmenter(e,{granularity:"word"});n=Array.from(r.segment(t)).map((t=>t.segment))}for(const t of n)r.push(...Ub(t));return r}function Vb(){const t=ip.value;t&&!Pb(t)||Bb();let e=Fb(t,vp().locale);Mb.postMessage({type:"query",payload:{query:t,tokens:e}})}function $b(t){t.data&&t.data.query&&t.data.query===ip.value&&function(t,e,n,r){r.innerHTML="";const i=n.length>1;if(!e||!e[t].length&&!e.tokenized.length)return void function(t,e){let n=document.createElement("li");n.classList.add("suggestions-explanation"),n.innerText=t,e.appendChild(n)}(`No suggestions found for ${t}.`,r);let s="",o=[];i&&(o=n.slice(0,-1),s=o.map((t=>t.ignore?t.word:t)).join(""));for(const n of e[t]){let t=document.createElement("li");t.classList.add("search-suggestion"),jb("",n,t),r.appendChild(t),t.addEventListener("mousedown",(function(){sp.style.display="none",document.dispatchEvent(new CustomEvent("graph-update",{detail:n})),document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:[n]}})),Bb()}))}for(const t of e.tokenized){let e=document.createElement("li");e.classList.add("search-suggestion"),jb(s,t,e),r.appendChild(e),e.addEventListener("mousedown",(function(){Hb(s+t,o.concat(t)),Bb()}))}r.removeAttribute("style")}(t.data.query,t.data.suggestions,t.data.tokens,Ob)}function jb(t,e,n){let r=document.createElement("span");r.innerText=t,r.classList.add("search-suggestion-stem");let i=document.createElement("span");i.innerText=e,i.classList.add("search-suggestion-current"),n.appendChild(r),n.appendChild(i)}function Bb(){Ob.style.display="none"}function qb(){Mb.postMessage({type:"wordset",payload:window.wordSet})}async function zb(t,e){Mb=new Worker("/js/modules/search-suggestions-worker.js"),qb(),document.addEventListener("character-set-changed",qb),Mb.addEventListener("message",$b),ip.addEventListener("input",Vb),ip.addEventListener("blur",Bb);const{default:n,cut:r}=await import("../../../../../../../js/external/jieba_rs_wasm.js");await n(),Db=r,t&&Kb(t,vp().locale,e||"explore")}function Hb(t,e,n){let r=!1,i="";for(const t of e)if(!t.ignore&&t in wordSet){i=t,r=!0;break}r?(sp.style.display="none",document.dispatchEvent(new CustomEvent("graph-update",{detail:i})),document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:e,display:t,mode:n||"explore"}}))):sp.removeAttribute("style")}function Kb(t,e,n){return Bb(),t&&(definitions[t]||t in wordSet)?(sp.style.display="none",document.dispatchEvent(new CustomEvent("graph-update",{detail:t})),void document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:[t],mode:n||"explore"}}))):t&&Pb(t)&&vp().englishPath?(t=t.toLowerCase(),void fetch(`/${vp().englishPath}/${yp(t,vp().partitionCount)}.json`).then((t=>t.json())).then((function(e){if(t!==ip.value.toLowerCase())return!1;!function(t,e){e?(sp.style.display="none",document.dispatchEvent(new CustomEvent("graph-update",{detail:e[0]})),document.dispatchEvent(new CustomEvent("explore-update",{detail:{words:e,display:t,type:"english"}}))):sp.removeAttribute("style")}(t,e[t])}))):void Hb(t,Fb(t,e),n)}const Wb=document.getElementById("hanzi-choose");let Gb;window.onpopstate=t=>{const e=t.state;if(!e||!e.word)return op.removeAttribute("style"),ap.innerHTML="",void(ip.value="");!function(t){const e=decodeURIComponent(t.word||"");ip.value=e,Kb(e,!0)}(e)},Gb=window.graphFetch?[window.graphFetch.then((t=>t.json())).then((t=>{window.hanzi=t})),window.sentencesFetch.then((t=>t.json())).then((t=>window.sentences=t)),window.definitionsFetch.then((t=>t.json())).then((t=>window.definitions=t)),window.componentsFetch.then((t=>t.json())).then((t=>window.components=t))]:[window.freqsFetch.then((t=>t.json())).then((t=>{window.freqs=t})),window.sentencesFetch.then((t=>t.json())).then((t=>window.sentences=t)),window.definitionsFetch.then((t=>t.json())).then((t=>window.definitions=t)),window.componentsFetch.then((t=>t.json())).then((t=>window.components=t))],Promise.all(Gb).then((t=>{let e=Cp(document.location.pathname);H(),bn(),rp(),Tn.addEventListener("click",(function(){Pn[Fn].leftState&&Vn(Pn[Fn].leftState)})),In.addEventListener("click",(function(){Pn[Fn].rightState&&Vn(Pn[Fn].rightState)})),bp(),V_(),ME(),document.addEventListener("explore-update",(function(t){Tw=t.detail.mode===bw?bw:_w,ip.value=t.detail.display||t.detail.words[0],qw(t.detail.words,t.detail.type||"chinese",t.detail.skipState),Tw===bw&&Vw("tab-components",Iw)})),document.addEventListener("character-set-changed",(function(){Sw=kw(),Kw()})),Sw=kw(),Kw(),Nb(),document.addEventListener("character-set-changed",Nb),document.addEventListener("graph-update",(function(t){Lb(t.detail)})),document.addEventListener("graph-interaction",(function(t){Lb(t.detail)})),bb.addEventListener("shown",(function(){Ib.innerText="Flow",xb=!0,Sb(Cb,Ab,bb)})),window.addEventListener("resize",(function(){clearTimeout(Rb),Rb=setTimeout((()=>{xb&&Sb(Cb,Ab,bb)}),1e3)})),bb.addEventListener("hidden",(function(){xb=!1,Ib.innerText="Graph"})),Tb.addEventListener("click",(function(){xb?zn(jn):(Cb||Lb("中文"),zn(Bn))})),Wb.addEventListener("submit",(function(t){t.preventDefault(),Kb(ip.value),Vn(On.main)}));let n=JSON.parse(localStorage.getItem("exploreState")),r=!1;if(function(t,e){let n=document.createElement("meta");n.setAttribute("property","og:url"),n.setAttribute("content",document.location.href),document.head.appendChild(n);let r=document.createElement("meta");r.setAttribute("property","og:type"),r.setAttribute("content","website"),document.head.appendChild(r);let i=document.createElement("meta");i.setAttribute("property","og:image"),i.setAttribute("content",`${document.location.origin}/images/hanzigraph-192x192.png`),document.head.appendChild(i);let s=document.createElement("meta");if(s.setAttribute("property","og:title"),s.setAttribute("content",t&&t.word?`${t.word} | ${e}`:t&&t.graph?`${e}`:"HanziGraph"),document.head.appendChild(s),t&&t.graph&&!t.word){let t=document.createElement("link");t.setAttribute("rel","canonical"),t.setAttribute("href",document.location.href),document.head.appendChild(t)}}(e,vp().display),e&&e.word)ip.value=e.word,e.word in wordSet||Pb(e.word)?Kb(e.word,vp().locale,e.mode):r=!0;else if(history.state&&history.state.word)Kb(history.state.word);else if(n&&n.words&&n.selectedCharacterSet===vp().prefix)Kb(n.words.join(""));else{e&&e.graph&&(document.title=`${vp().display} | HanziGraph`),op.removeAttribute("style");const t=vp().defaultHanzi;document.dispatchEvent(new CustomEvent("graph-update",{detail:t[Math.floor(Math.random()*t.length)]}))}r&&zb(e.word,e.mode),"flow"===e.mode&&vp().collocationsPath&&zn(Bn),YE(),Jw.addEventListener("hidden",(function(){Object.values(nE).forEach((t=>{t.style.display="none"}))})),tE.addEventListener("click",(function(){iE(rE.studyMode)})),eE.addEventListener("click",(function(){iE(rE.general)})),r||zb()}))}();
