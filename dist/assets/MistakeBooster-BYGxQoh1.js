import{c as ce,r as w,j as c,S as F,n as pe,T as me}from"./index-CXdTeXh3.js";import{C as Y}from"./circle-check-B7fJ9-KM.js";import{E as Ee,R as Ce}from"./rotate-ccw-B1ju2q80.js";/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=ce("Hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=ce("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);var K;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(K||(K={}));/**
 * @license
 * Copyright 2024 Google LLC
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
 */var B;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(B||(B={}));var P;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(P||(P={}));/**
 * @license
 * Copyright 2024 Google LLC
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
 */const V=["user","model","function","system"];var J;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(J||(J={}));var W;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(W||(W={}));var X;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(X||(X={}));var z;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(z||(z={}));var j;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(j||(j={}));var Q;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(Q||(Q={}));var Z;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(Z||(Z={}));var ee;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(ee||(ee={}));/**
 * @license
 * Copyright 2024 Google LLC
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
 */class E extends Error{constructor(n){super(`[GoogleGenerativeAI Error]: ${n}`)}}class A extends E{constructor(n,t){super(n),this.response=t}}class le extends E{constructor(n,t,s,o){super(n),this.status=t,this.statusText=s,this.errorDetails=o}}class I extends E{}class de extends E{}/**
 * @license
 * Copyright 2024 Google LLC
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
 */const ye="https://generativelanguage.googleapis.com",_e="v1beta",we="0.24.1",be="genai-js";var O;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(O||(O={}));class Ie{constructor(n,t,s,o,i){this.model=n,this.task=t,this.apiKey=s,this.stream=o,this.requestOptions=i}toString(){var n,t;const s=((n=this.requestOptions)===null||n===void 0?void 0:n.apiVersion)||_e;let i=`${((t=this.requestOptions)===null||t===void 0?void 0:t.baseUrl)||ye}/${s}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}function Oe(e){const n=[];return e!=null&&e.apiClient&&n.push(e.apiClient),n.push(`${be}/${we}`),n.join(" ")}async function Ne(e){var n;const t=new Headers;t.append("Content-Type","application/json"),t.append("x-goog-api-client",Oe(e.requestOptions)),t.append("x-goog-api-key",e.apiKey);let s=(n=e.requestOptions)===null||n===void 0?void 0:n.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(o){throw new I(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${o.message}`)}for(const[o,i]of s.entries()){if(o==="x-goog-api-key")throw new I(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new I(`Header name ${o} can only be set using the apiClient field`);t.append(o,i)}}return t}async function Re(e,n,t,s,o,i){const r=new Ie(e,n,t,s,i);return{url:r.toString(),fetchOptions:Object.assign(Object.assign({},Me(i)),{method:"POST",headers:await Ne(r),body:o})}}async function G(e,n,t,s,o,i={},r=fetch){const{url:a,fetchOptions:u}=await Re(e,n,t,s,o,i);return Ae(a,u,r)}async function Ae(e,n,t=fetch){let s;try{s=await t(e,n)}catch(o){Te(o,e)}return s.ok||await Se(s,e),s}function Te(e,n){let t=e;throw t.name==="AbortError"?(t=new de(`Request aborted when fetching ${n.toString()}: ${e.message}`),t.stack=e.stack):e instanceof le||e instanceof I||(t=new E(`Error fetching from ${n.toString()}: ${e.message}`),t.stack=e.stack),t}async function Se(e,n){let t="",s;try{const o=await e.json();t=o.error.message,o.error.details&&(t+=` ${JSON.stringify(o.error.details)}`,s=o.error.details)}catch{}throw new le(`Error fetching from ${n.toString()}: [${e.status} ${e.statusText}] ${t}`,e.status,e.statusText,s)}function Me(e){const n={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const t=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>t.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{t.abort()}),n.signal=t.signal}return n}/**
 * @license
 * Copyright 2024 Google LLC
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
 */function q(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),k(e.candidates[0]))throw new A(`${b(e)}`,e);return je(e)}else if(e.promptFeedback)throw new A(`Text not available. ${b(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),k(e.candidates[0]))throw new A(`${b(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),te(e)[0]}else if(e.promptFeedback)throw new A(`Function call not available. ${b(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),k(e.candidates[0]))throw new A(`${b(e)}`,e);return te(e)}else if(e.promptFeedback)throw new A(`Function call not available. ${b(e)}`,e)},e}function je(e){var n,t,s,o;const i=[];if(!((t=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||t===void 0)&&t.parts)for(const r of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)r.text&&i.push(r.text),r.executableCode&&i.push("\n```"+r.executableCode.language+`
`+r.executableCode.code+"\n```\n"),r.codeExecutionResult&&i.push("\n```\n"+r.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function te(e){var n,t,s,o;const i=[];if(!((t=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||t===void 0)&&t.parts)for(const r of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)r.functionCall&&i.push(r.functionCall);if(i.length>0)return i}const Le=[j.RECITATION,j.SAFETY,j.LANGUAGE];function k(e){return!!e.finishReason&&Le.includes(e.finishReason)}function b(e){var n,t,s;let o="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)o+="Response was blocked",!((n=e.promptFeedback)===null||n===void 0)&&n.blockReason&&(o+=` due to ${e.promptFeedback.blockReason}`),!((t=e.promptFeedback)===null||t===void 0)&&t.blockReasonMessage&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((s=e.candidates)===null||s===void 0)&&s[0]){const i=e.candidates[0];k(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function L(e){return this instanceof L?(this.v=e,this):new L(e)}function De(e,n,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=t.apply(e,n||[]),o,i=[];return o={},r("next"),r("throw"),r("return"),o[Symbol.asyncIterator]=function(){return this},o;function r(d){s[d]&&(o[d]=function(l){return new Promise(function(f,v){i.push([d,l,f,v])>1||a(d,l)})})}function a(d,l){try{u(s[d](l))}catch(f){g(i[0][3],f)}}function u(d){d.value instanceof L?Promise.resolve(d.value.v).then(p,m):g(i[0][2],d)}function p(d){a("next",d)}function m(d){a("throw",d)}function g(d,l){d(l),i.shift(),i.length&&a(i[0][0],i[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */const ne=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function Ge(e){const n=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),t=$e(n),[s,o]=t.tee();return{stream:Ue(s),response:ke(o)}}async function ke(e){const n=[],t=e.getReader();for(;;){const{done:s,value:o}=await t.read();if(s)return q(qe(n));n.push(o)}}function Ue(e){return De(this,arguments,function*(){const t=e.getReader();for(;;){const{value:s,done:o}=yield L(t.read());if(o)break;yield yield L(q(s))}})}function $e(e){const n=e.getReader();return new ReadableStream({start(s){let o="";return i();function i(){return n.read().then(({value:r,done:a})=>{if(a){if(o.trim()){s.error(new E("Failed to parse stream"));return}s.close();return}o+=r;let u=o.match(ne),p;for(;u;){try{p=JSON.parse(u[1])}catch{s.error(new E(`Error parsing JSON response: "${u[1]}"`));return}s.enqueue(p),o=o.substring(u[0].length),u=o.match(ne)}return i()}).catch(r=>{let a=r;throw a.stack=r.stack,a.name==="AbortError"?a=new de("Request aborted when reading from the stream"):a=new E("Error reading from the stream"),a})}}})}function qe(e){const n=e[e.length-1],t={promptFeedback:n==null?void 0:n.promptFeedback};for(const s of e){if(s.candidates){let o=0;for(const i of s.candidates)if(t.candidates||(t.candidates=[]),t.candidates[o]||(t.candidates[o]={index:o}),t.candidates[o].citationMetadata=i.citationMetadata,t.candidates[o].groundingMetadata=i.groundingMetadata,t.candidates[o].finishReason=i.finishReason,t.candidates[o].finishMessage=i.finishMessage,t.candidates[o].safetyRatings=i.safetyRatings,i.content&&i.content.parts){t.candidates[o].content||(t.candidates[o].content={role:i.content.role||"user",parts:[]});const r={};for(const a of i.content.parts)a.text&&(r.text=a.text),a.functionCall&&(r.functionCall=a.functionCall),a.executableCode&&(r.executableCode=a.executableCode),a.codeExecutionResult&&(r.codeExecutionResult=a.codeExecutionResult),Object.keys(r).length===0&&(r.text=""),t.candidates[o].content.parts.push(r)}o++}s.usageMetadata&&(t.usageMetadata=s.usageMetadata)}return t}/**
 * @license
 * Copyright 2024 Google LLC
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
 */async function ue(e,n,t,s){const o=await G(n,O.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(t),s);return Ge(o)}async function fe(e,n,t,s){const i=await(await G(n,O.GENERATE_CONTENT,e,!1,JSON.stringify(t),s)).json();return{response:q(i)}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */function he(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function D(e){let n=[];if(typeof e=="string")n=[{text:e}];else for(const t of e)typeof t=="string"?n.push({text:t}):n.push(t);return He(n)}function He(e){const n={role:"user",parts:[]},t={role:"function",parts:[]};let s=!1,o=!1;for(const i of e)"functionResponse"in i?(t.parts.push(i),o=!0):(n.parts.push(i),s=!0);if(s&&o)throw new E("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new E("No content is provided for sending chat message.");return s?n:t}function Fe(e,n){var t;let s={model:n==null?void 0:n.model,generationConfig:n==null?void 0:n.generationConfig,safetySettings:n==null?void 0:n.safetySettings,tools:n==null?void 0:n.tools,toolConfig:n==null?void 0:n.toolConfig,systemInstruction:n==null?void 0:n.systemInstruction,cachedContent:(t=n==null?void 0:n.cachedContent)===null||t===void 0?void 0:t.name,contents:[]};const o=e.generateContentRequest!=null;if(e.contents){if(o)throw new I("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(o)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{const i=D(e);s.contents=[i]}return{generateContentRequest:s}}function se(e){let n;return e.contents?n=e:n={contents:[D(e)]},e.systemInstruction&&(n.systemInstruction=he(e.systemInstruction)),n}function Ye(e){return typeof e=="string"||Array.isArray(e)?{content:D(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
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
 */const oe=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],Ke={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function Be(e){let n=!1;for(const t of e){const{role:s,parts:o}=t;if(!n&&s!=="user")throw new E(`First content should be with role 'user', got ${s}`);if(!V.includes(s))throw new E(`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(V)}`);if(!Array.isArray(o))throw new E("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new E("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const a of o)for(const u of oe)u in a&&(i[u]+=1);const r=Ke[s];for(const a of oe)if(!r.includes(a)&&i[a]>0)throw new E(`Content with role '${s}' can't contain '${a}' part`);n=!0}}function ie(e){var n;if(e.candidates===void 0||e.candidates.length===0)return!1;const t=(n=e.candidates[0])===null||n===void 0?void 0:n.content;if(t===void 0||t.parts===void 0||t.parts.length===0)return!1;for(const s of t.parts)if(s===void 0||Object.keys(s).length===0||s.text!==void 0&&s.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
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
 */const re="SILENT_ERROR";class Pe{constructor(n,t,s,o={}){this.model=t,this.params=s,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=n,s!=null&&s.history&&(Be(s.history),this._history=s.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(n,t={}){var s,o,i,r,a,u;await this._sendPromise;const p=D(n),m={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(a=this.params)===null||a===void 0?void 0:a.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,p]},g=Object.assign(Object.assign({},this._requestOptions),t);let d;return this._sendPromise=this._sendPromise.then(()=>fe(this._apiKey,this.model,m,g)).then(l=>{var f;if(ie(l.response)){this._history.push(p);const v=Object.assign({parts:[],role:"model"},(f=l.response.candidates)===null||f===void 0?void 0:f[0].content);this._history.push(v)}else{const v=b(l.response);v&&console.warn(`sendMessage() was unsuccessful. ${v}. Inspect response object for details.`)}d=l}).catch(l=>{throw this._sendPromise=Promise.resolve(),l}),await this._sendPromise,d}async sendMessageStream(n,t={}){var s,o,i,r,a,u;await this._sendPromise;const p=D(n),m={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(a=this.params)===null||a===void 0?void 0:a.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,p]},g=Object.assign(Object.assign({},this._requestOptions),t),d=ue(this._apiKey,this.model,m,g);return this._sendPromise=this._sendPromise.then(()=>d).catch(l=>{throw new Error(re)}).then(l=>l.response).then(l=>{if(ie(l)){this._history.push(p);const f=Object.assign({},l.candidates[0].content);f.role||(f.role="model"),this._history.push(f)}else{const f=b(l);f&&console.warn(`sendMessageStream() was unsuccessful. ${f}. Inspect response object for details.`)}}).catch(l=>{l.message!==re&&console.error(l)}),d}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */async function Ve(e,n,t,s){return(await G(n,O.COUNT_TOKENS,e,!1,JSON.stringify(t),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
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
 */async function Je(e,n,t,s){return(await G(n,O.EMBED_CONTENT,e,!1,JSON.stringify(t),s)).json()}async function We(e,n,t,s){const o=t.requests.map(r=>Object.assign(Object.assign({},r),{model:n}));return(await G(n,O.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class ae{constructor(n,t,s={}){this.apiKey=n,this._requestOptions=s,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=he(t.systemInstruction),this.cachedContent=t.cachedContent}async generateContent(n,t={}){var s;const o=se(n),i=Object.assign(Object.assign({},this._requestOptions),t);return fe(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}async generateContentStream(n,t={}){var s;const o=se(n),i=Object.assign(Object.assign({},this._requestOptions),t);return ue(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}startChat(n){var t;return new Pe(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(t=this.cachedContent)===null||t===void 0?void 0:t.name},n),this._requestOptions)}async countTokens(n,t={}){const s=Fe(n,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),t);return Ve(this.apiKey,this.model,s,o)}async embedContent(n,t={}){const s=Ye(n),o=Object.assign(Object.assign({},this._requestOptions),t);return Je(this.apiKey,this.model,s,o)}async batchEmbedContents(n,t={}){const s=Object.assign(Object.assign({},this._requestOptions),t);return We(this.apiKey,this.model,n,s)}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class Xe{constructor(n){this.apiKey=n}getGenerativeModel(n,t){if(!n.model)throw new E("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ae(this.apiKey,n,t)}getGenerativeModelFromCachedContent(n,t,s){if(!n.name)throw new I("Cached content must contain a `name` field.");if(!n.model)throw new I("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const r of o)if(t!=null&&t[r]&&n[r]&&(t==null?void 0:t[r])!==n[r]){if(r==="model"){const a=t.model.startsWith("models/")?t.model.replace("models/",""):t.model,u=n.model.startsWith("models/")?n.model.replace("models/",""):n.model;if(a===u)continue}throw new I(`Different value for "${r}" specified in modelParams (${t[r]}) and cachedContent (${n[r]})`)}const i=Object.assign(Object.assign({},t),{model:n.model,tools:n.tools,toolConfig:n.toolConfig,systemInstruction:n.systemInstruction,cachedContent:n});return new ae(this.apiKey,i,s)}}const ze=async(e,n=1)=>{const{subject:t,type:s,questionType:o,marks:i,negativeMarks:r,difficulty:a,topic:u}=e,p="AIzaSyAwPpAc9EEuvP1sK7Yur0Tp4Weynoy9JEAYeh";try{const g=new Xe(p).getGenerativeModel({model:"gemini-2.5-flash"}),d=(t==null?void 0:t.toLowerCase().includes("english"))||(t==null?void 0:t.toLowerCase().includes("general ability"))||(t==null?void 0:t.toLowerCase().includes("nda")),l=(t==null?void 0:t.toLowerCase().includes("math"))||(t==null?void 0:t.toLowerCase().includes("physics"))||(t==null?void 0:t.toLowerCase().includes("chemistry"));let f="";l?f=`
      - TARGET EXAM LEVEL: JEE Main and JEE Advanced.
      - The new questions MUST be MORE DIFFICULT and TRICKIER than the original.
      - DO NOT just change the numbers. Twist the concepts, introduce edge cases, or add multi-step logical deductions similar to real JEE Advanced questions (like the Black Book for Mathematics).
      - Ensure the core topic is identical, but the application requires deep thinking.
      `:d?f=`
      - TARGET EXAM LEVEL: NDA / General Ability.
      - The new questions MUST be highly realistic and based on CURRENT DATA (current affairs, recent historical context, or modern english usage).
      - Do not give identical questions. Test the same underlying concept/vocabulary/grammar rule but in a completely different, realistic context.
      - The questions should be tricky, mimicking the examiner's mindset.
      `:f=`
      - The new questions MUST be TRICKIER and SLIGHTLY MORE DIFFICULT than the original.
      - Twist the context to make the student think deeply about the underlying concept.
      `;const v=`
      You are an expert ${t||"academic"} examiner creating highly challenging test questions for students.
      
      I have a question that the student got wrong or skipped. I want you to create ${n} NEW question(s) that test the exact same concept.
      
      Original Question:
      ${e.questionText||e.question||""}
      
      Options:
      ${(e.options||[]).map((x,S)=>`${String.fromCharCode(65+S)}. ${x}`).join(`
`)}
      
      Original Solution/Explanation:
      ${e.explanation||e.solution||""}
      
      Difficulty: ${a||"Moderate"}
      Topic: ${u||"General"}
      
      REQUIREMENTS:
      1. ${f}
      2. Provide 4 options for each question (if the original was multiple choice).
      3. Provide the correct option index (0 for A, 1 for B, 2 for C, 3 for D).
      4. Provide a HIGH-QUALITY, very detailed, step-by-step teacher-level solution/explanation for EACH new question.
      5. Output the result ONLY as a valid JSON ARRAY of objects, no markdown formatting outside the JSON. The array must contain exactly ${n} objects.
      
      Structure for each object in the JSON array:
      {
        "questionText": "The new challenging question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctOption": 2,
        "explanation": "Extremely detailed step-by-step solution"
      }
    `,y=(await(await g.generateContent(v)).response).text().replace(/```json/gi,"").replace(/```/g,"").trim();let C=JSON.parse(y);if(!Array.isArray(C))if(C.questionText)C=[C];else throw new Error("Invalid AI response format");return C.map((x,S)=>({...e,id:`similar_${Date.now()}_${S}`,isSimilarGenerated:!0,questionText:x.questionText,question:x.questionText,options:x.options||[],correctOption:x.correctOption,correctAnswer:x.correctAnswer,explanation:x.explanation,solution:x.explanation,subject:t,type:s,questionType:o,marks:i,negativeMarks:r,difficulty:a,topic:u}))}catch(m){return console.error("Error generating similar question with Gemini:",m),Qe(e,n)}},Qe=async(e,n=1)=>{const t=Math.floor(Math.random()*1e3)+1500;await new Promise(g=>setTimeout(g,t));const{subject:s,type:o,questionType:i,marks:r,negativeMarks:a,difficulty:u,topic:p}=e,m=[];for(let g=0;g<n;g++){let d=e.questionText||e.question||"",l=[...e.options||[]],f=e.correctOption,v=e.correctAnswer,T="This is a highly detailed mock step-by-step solution demonstrating the trick involved. (Fallback Mode)";s!=null&&s.toLowerCase().includes("math")?(d=`[TRICKY VARIATION ${g+1}]: `+d.replace(/[0-9]+/g,N=>(parseInt(N)+Math.floor(Math.random()*5)+1).toString()),l.length>0&&(l=l.map(N=>N+" (Similar)"),f=Math.floor(Math.random()*l.length))):(d=`[TRICKY VARIATION ${g+1}]: `+d,l.length>0&&(f=Math.floor(Math.random()*l.length))),m.push({...e,id:`similar_${Date.now()}_${g}`,isSimilarGenerated:!0,questionText:d,question:d,options:l,correctOption:f,correctAnswer:v,explanation:T,solution:T,subject:s,type:o,questionType:i,marks:r,negativeMarks:a,difficulty:u,topic:p})}return m};function nt({originalQuestion:e}){const[n,t]=w.useState(!1),[s,o]=w.useState(3),[i,r]=w.useState([]),[a,u]=w.useState(0),[p,m]=w.useState({}),[g,d]=w.useState({}),[l,f]=w.useState("idle");w.useEffect(()=>{var h;i.length>0&&((h=window.MathJax)!=null&&h.typesetPromise)&&window.MathJax.typesetPromise().catch(_=>console.log(_))},[i,a,l]);const v=async()=>{t(!0),f("loading");const h=await ze(e,s);r(h),m({}),d({}),u(0),t(!1),f("practicing")},T=()=>{d(h=>({...h,[a]:!0}))},N=()=>{a<i.length-1?u(h=>h+1):f("finished")},U=()=>{f("idle"),r([]),m({}),d({}),u(0)};if(!e)return null;const y=i[a],C=g[a],x=p[a],S=()=>{let h=0;return i.forEach((_,R)=>{g[R]&&p[R]===_.correctOption&&h++}),h};return c.jsxs("div",{className:"mt-8 border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 relative overflow-hidden shadow-sm",children:[l==="idle"&&c.jsxs("div",{className:"flex flex-col gap-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx(F,{className:"w-6 h-6 text-indigo-600 shrink-0"}),c.jsxs("div",{children:[c.jsx("h4",{className:"font-bold text-indigo-900 text-lg",children:"Mistake Booster AI"}),c.jsx("p",{className:"text-sm text-indigo-700 mt-1 font-medium",children:"Challenge yourself with trickier, realistic variations of this concept."})]})]}),c.jsxs("div",{className:"flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-indigo-100",children:[c.jsxs("div",{className:"flex items-center gap-2 text-sm font-bold text-indigo-800",children:[c.jsx(xe,{className:"w-4 h-4"})," Questions to generate:"]}),c.jsx("div",{className:"flex items-center gap-2",children:[1,2,3,5].map(h=>c.jsx("button",{onClick:()=>o(h),className:`w-10 h-10 rounded-full font-bold transition-all border-2 flex items-center justify-center ${s===h?"bg-indigo-600 border-indigo-600 text-white":"bg-indigo-50 border-indigo-200 text-indigo-600 hover:border-indigo-400"}`,children:h},h))}),c.jsx("button",{onClick:v,className:"ml-auto w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2",children:"Generate Practice"})]})]}),l==="loading"&&c.jsxs("div",{className:"flex flex-col items-center justify-center py-8",children:[c.jsx(ve,{className:"w-10 h-10 text-indigo-600 animate-spin mb-4"}),c.jsx("p",{className:"text-sm font-bold text-indigo-800 animate-pulse tracking-wide uppercase",children:"AI is crafting tricky questions..."})]}),l==="practicing"&&y&&c.jsxs("div",{className:"animate-fade-in space-y-6",children:[c.jsxs("div",{className:"flex items-center justify-between border-b border-indigo-200/50 pb-4",children:[c.jsxs("h4",{className:"font-bold text-indigo-900 flex items-center gap-2 text-lg",children:[c.jsx(F,{className:"w-5 h-5 text-indigo-600"})," Challenge ",a+1," of ",i.length]}),C&&c.jsxs("span",{className:"bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-300",children:[c.jsx(Y,{className:"w-4 h-4"})," Evaluated"]})]}),c.jsx("div",{className:"text-slate-800 font-medium tex2jax_process text-base leading-relaxed",dangerouslySetInnerHTML:{__html:y.questionText||y.question}}),y.options&&y.options.length>0?c.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:y.options.map((h,_)=>{const R=x===_,$=C&&y.correctOption===_,H=C&&R&&!$;let M="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ";return C?$?M+="border-emerald-500 bg-emerald-50/50":H?M+="border-red-400 bg-red-50/50":M+="border-slate-200 bg-white opacity-50":M+=R?"border-indigo-500 bg-white ring-4 ring-indigo-50":"border-slate-200 hover:border-indigo-300 bg-white",c.jsxs("button",{disabled:C,onClick:()=>m(ge=>({...ge,[a]:_})),className:M,children:[c.jsx("div",{className:`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 ${!C&&R?"bg-indigo-600 text-white border-indigo-600":$?"bg-emerald-500 text-white border-emerald-500":H?"bg-red-500 text-white border-red-500":"border-slate-300 text-slate-500"}`,children:String.fromCharCode(65+_)}),c.jsx("div",{className:"tex2jax_process text-sm text-slate-700 pt-0.5",dangerouslySetInnerHTML:{__html:h}})]},_)})}):c.jsx("div",{className:"flex items-center gap-4",children:c.jsx("input",{type:"text",disabled:C,className:"px-4 py-3 border-2 border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-mono text-lg w-full max-w-sm shadow-inner",placeholder:"Type your answer",value:x||"",onChange:h=>m(_=>({..._,[a]:h.target.value}))})}),c.jsx("div",{className:"flex items-center justify-between mt-6 pt-4 border-t border-indigo-100",children:C?c.jsxs("button",{onClick:N,className:"bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2 ml-auto",children:[a<i.length-1?"Next Question":"Finish Practice"," ",c.jsx(pe,{className:"w-5 h-5"})]}):c.jsxs("button",{onClick:T,disabled:x===void 0||x==="",className:"bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2",children:[c.jsx(Y,{className:"w-5 h-5"})," Check Answer"]})}),C&&c.jsxs("div",{className:"mt-6 p-6 bg-white border border-indigo-100 rounded-2xl space-y-4 shadow-sm relative",children:[c.jsx("div",{className:"absolute top-0 left-0 w-2 h-full bg-indigo-400 rounded-l-2xl"}),c.jsxs("h5",{className:"font-bold text-indigo-900 text-lg flex items-center gap-2",children:[c.jsx(Ee,{className:"w-5 h-5 text-indigo-500"})," Detailed Solution"]}),c.jsx("div",{className:"text-slate-700 tex2jax_process leading-relaxed text-sm md:text-base bg-indigo-50/30 p-4 rounded-xl border border-indigo-50",dangerouslySetInnerHTML:{__html:y.explanation||y.solution}})]})]}),l==="finished"&&c.jsxs("div",{className:"text-center py-8 animate-fade-in space-y-6",children:[c.jsx("div",{className:"w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-200",children:c.jsx(me,{className:"w-10 h-10 text-indigo-600"})}),c.jsx("h3",{className:"text-2xl font-bold text-indigo-900",children:"Practice Completed!"}),c.jsxs("p",{className:"text-indigo-700 font-medium text-lg",children:["You scored ",c.jsx("span",{className:"font-bold text-indigo-900",children:S()})," out of ",c.jsx("span",{className:"font-bold text-indigo-900",children:i.length}),"."]}),c.jsxs("button",{onClick:U,className:"mt-4 px-6 py-3 bg-indigo-100 text-indigo-800 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center gap-2 mx-auto",children:[c.jsx(Ce,{className:"w-5 h-5"})," Try Another Concept"]})]})]})}export{nt as M};
