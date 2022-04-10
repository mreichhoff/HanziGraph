(function () {
    'use strict';

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
     * @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
     */
    const CONSTANTS = {
        /**
         * @define {boolean} Whether this is the client Node.js SDK.
         */
        NODE_CLIENT: false,
        /**
         * @define {boolean} Whether this is the Admin Node.js SDK.
         */
        NODE_ADMIN: false,
        /**
         * Firebase SDK Version
         */
        SDK_VERSION: '${JSCORE_VERSION}'
    };

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
     * Throws an error if the provided assertion is falsy
     */
    const assert = function (assertion, message) {
        if (!assertion) {
            throw assertionError(message);
        }
    };
    /**
     * Returns an Error object suitable for throwing.
     */
    const assertionError = function (message) {
        return new Error('Firebase Database (' +
            CONSTANTS.SDK_VERSION +
            ') INTERNAL ASSERT FAILED: ' +
            message);
    };

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
    const stringToByteArray$1 = function (str) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if ((c & 0xfc00) === 0xd800 &&
                i + 1 < str.length &&
                (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Turns an array of numbers into the string given by the concatenation of the
     * characters to which the numbers correspond.
     * @param bytes Array of numbers representing characters.
     * @return Stringification of the array.
     */
    const byteArrayToString = function (bytes) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let pos = 0, c = 0;
        while (pos < bytes.length) {
            const c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                const c2 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                const c4 = bytes[pos++];
                const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                    0x10000;
                out[c++] = String.fromCharCode(0xd800 + (u >> 10));
                out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return out.join('');
    };
    // We define it as an object literal instead of a class because a class compiled down to es5 can't
    // be treeshaked. https://github.com/rollup/rollup/issues/1691
    // Static lookup maps, lazily populated by init_()
    const base64 = {
        /**
         * Maps bytes to characters.
         */
        byteToCharMap_: null,
        /**
         * Maps characters to bytes.
         */
        charToByteMap_: null,
        /**
         * Maps bytes to websafe characters.
         * @private
         */
        byteToCharMapWebSafe_: null,
        /**
         * Maps websafe characters to bytes.
         * @private
         */
        charToByteMapWebSafe_: null,
        /**
         * Our default alphabet, shared between
         * ENCODED_VALS and ENCODED_VALS_WEBSAFE
         */
        ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
        /**
         * Our default alphabet. Value 64 (=) is special; it means "nothing."
         */
        get ENCODED_VALS() {
            return this.ENCODED_VALS_BASE + '+/=';
        },
        /**
         * Our websafe alphabet.
         */
        get ENCODED_VALS_WEBSAFE() {
            return this.ENCODED_VALS_BASE + '-_.';
        },
        /**
         * Whether this browser supports the atob and btoa functions. This extension
         * started at Mozilla but is now implemented by many browsers. We use the
         * ASSUME_* variables to avoid pulling in the full useragent detection library
         * but still allowing the standard per-browser compilations.
         *
         */
        HAS_NATIVE_SUPPORT: typeof atob === 'function',
        /**
         * Base64-encode an array of bytes.
         *
         * @param input An array of bytes (numbers with
         *     value in [0, 255]) to encode.
         * @param webSafe Boolean indicating we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeByteArray(input, webSafe) {
            if (!Array.isArray(input)) {
                throw Error('encodeByteArray takes an array as a parameter');
            }
            this.init_();
            const byteToCharMap = webSafe
                ? this.byteToCharMapWebSafe_
                : this.byteToCharMap_;
            const output = [];
            for (let i = 0; i < input.length; i += 3) {
                const byte1 = input[i];
                const haveByte2 = i + 1 < input.length;
                const byte2 = haveByte2 ? input[i + 1] : 0;
                const haveByte3 = i + 2 < input.length;
                const byte3 = haveByte3 ? input[i + 2] : 0;
                const outByte1 = byte1 >> 2;
                const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
                let outByte4 = byte3 & 0x3f;
                if (!haveByte3) {
                    outByte4 = 64;
                    if (!haveByte2) {
                        outByte3 = 64;
                    }
                }
                output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join('');
        },
        /**
         * Base64-encode a string.
         *
         * @param input A string to encode.
         * @param webSafe If true, we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return btoa(input);
            }
            return this.encodeByteArray(stringToByteArray$1(input), webSafe);
        },
        /**
         * Base64-decode a string.
         *
         * @param input to decode.
         * @param webSafe True if we should use the
         *     alternative alphabet.
         * @return string representing the decoded value.
         */
        decodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return atob(input);
            }
            return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
        },
        /**
         * Base64-decode a string.
         *
         * In base-64 decoding, groups of four characters are converted into three
         * bytes.  If the encoder did not apply padding, the input length may not
         * be a multiple of 4.
         *
         * In this case, the last group will have fewer than 4 characters, and
         * padding will be inferred.  If the group has one or two characters, it decodes
         * to one byte.  If the group has three characters, it decodes to two bytes.
         *
         * @param input Input to decode.
         * @param webSafe True if we should use the web-safe alphabet.
         * @return bytes representing the decoded value.
         */
        decodeStringToByteArray(input, webSafe) {
            this.init_();
            const charToByteMap = webSafe
                ? this.charToByteMapWebSafe_
                : this.charToByteMap_;
            const output = [];
            for (let i = 0; i < input.length;) {
                const byte1 = charToByteMap[input.charAt(i++)];
                const haveByte2 = i < input.length;
                const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
                ++i;
                const haveByte3 = i < input.length;
                const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                const haveByte4 = i < input.length;
                const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                    throw Error();
                }
                const outByte1 = (byte1 << 2) | (byte2 >> 4);
                output.push(outByte1);
                if (byte3 !== 64) {
                    const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                    output.push(outByte2);
                    if (byte4 !== 64) {
                        const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                        output.push(outByte3);
                    }
                }
            }
            return output;
        },
        /**
         * Lazy static initialization function. Called before
         * accessing any of the static map variables.
         * @private
         */
        init_() {
            if (!this.byteToCharMap_) {
                this.byteToCharMap_ = {};
                this.charToByteMap_ = {};
                this.byteToCharMapWebSafe_ = {};
                this.charToByteMapWebSafe_ = {};
                // We want quick mappings back and forth, so we precompute two maps.
                for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                    this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                    this.charToByteMap_[this.byteToCharMap_[i]] = i;
                    this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                    this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                    // Be forgiving when decoding and correctly decode both encodings.
                    if (i >= this.ENCODED_VALS_BASE.length) {
                        this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                        this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                    }
                }
            }
        }
    };
    /**
     * URL-safe base64 encoding
     */
    const base64Encode = function (str) {
        const utf8Bytes = stringToByteArray$1(str);
        return base64.encodeByteArray(utf8Bytes, true);
    };
    /**
     * URL-safe base64 decoding
     *
     * NOTE: DO NOT use the global atob() function - it does NOT support the
     * base64Url variant encoding.
     *
     * @param str To be decoded
     * @return Decoded result, if possible
     */
    const base64Decode = function (str) {
        try {
            return base64.decodeString(str, true);
        }
        catch (e) {
            console.error('base64Decode failed: ', e);
        }
        return null;
    };

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
     * Do a deep-copy of basic JavaScript Objects or Arrays.
     */
    function deepCopy(value) {
        return deepExtend(undefined, value);
    }
    /**
     * Copy properties from source to target (recursively allows extension
     * of Objects and Arrays).  Scalar values in the target are over-written.
     * If target is undefined, an object of the appropriate type will be created
     * (and returned).
     *
     * We recursively copy all child properties of plain Objects in the source- so
     * that namespace- like dictionaries are merged.
     *
     * Note that the target can be a function, in which case the properties in
     * the source Object are copied onto it as static properties of the Function.
     *
     * Note: we don't merge __proto__ to prevent prototype pollution
     */
    function deepExtend(target, source) {
        if (!(source instanceof Object)) {
            return source;
        }
        switch (source.constructor) {
            case Date:
                // Treat Dates like scalars; if the target date object had any child
                // properties - they will be lost!
                const dateValue = source;
                return new Date(dateValue.getTime());
            case Object:
                if (target === undefined) {
                    target = {};
                }
                break;
            case Array:
                // Always copy the array source and overwrite the target.
                target = [];
                break;
            default:
                // Not a plain Object - treat it as a scalar.
                return source;
        }
        for (const prop in source) {
            // use isValidKey to guard against prototype pollution. See https://snyk.io/vuln/SNYK-JS-LODASH-450202
            if (!source.hasOwnProperty(prop) || !isValidKey$1(prop)) {
                continue;
            }
            target[prop] = deepExtend(target[prop], source[prop]);
        }
        return target;
    }
    function isValidKey$1(key) {
        return key !== '__proto__';
    }

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
    class Deferred {
        constructor() {
            this.reject = () => { };
            this.resolve = () => { };
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
        /**
         * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
         * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
         * and returns a node-style callback which will resolve or reject the Deferred's promise.
         */
        wrapCallback(callback) {
            return (error, value) => {
                if (error) {
                    this.reject(error);
                }
                else {
                    this.resolve(value);
                }
                if (typeof callback === 'function') {
                    // Attaching noop handler just in case developer wasn't expecting
                    // promises
                    this.promise.catch(() => { });
                    // Some of our callbacks don't expect a value and our own tests
                    // assert that the parameter length is 1
                    if (callback.length === 1) {
                        callback(error);
                    }
                    else {
                        callback(error, value);
                    }
                }
            };
        }
    }

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
     * Returns navigator.userAgent string or '' if it's not defined.
     * @return user agent string
     */
    function getUA() {
        if (typeof navigator !== 'undefined' &&
            typeof navigator['userAgent'] === 'string') {
            return navigator['userAgent'];
        }
        else {
            return '';
        }
    }
    /**
     * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
     *
     * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
     * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
     * wait for a callback.
     */
    function isMobileCordova() {
        return (typeof window !== 'undefined' &&
            // @ts-ignore Setting up an broadly applicable index signature for Window
            // just to deal with this case would probably be a bad idea.
            !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
            /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
    }
    function isBrowserExtension() {
        const runtime = typeof chrome === 'object'
            ? chrome.runtime
            : typeof browser === 'object'
                ? browser.runtime
                : undefined;
        return typeof runtime === 'object' && runtime.id !== undefined;
    }
    /**
     * Detect React Native.
     *
     * @return true if ReactNative environment is detected.
     */
    function isReactNative() {
        return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
    }
    /** Detects Internet Explorer. */
    function isIE() {
        const ua = getUA();
        return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    }
    /**
     * Detect whether the current SDK build is the Node version.
     *
     * @return true if it's the Node SDK build.
     */
    function isNodeSdk() {
        return CONSTANTS.NODE_ADMIN === true;
    }

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
     * @fileoverview Standardized Firebase Error.
     *
     * Usage:
     *
     *   // Typescript string literals for type-safe codes
     *   type Err =
     *     'unknown' |
     *     'object-not-found'
     *     ;
     *
     *   // Closure enum for type-safe error codes
     *   // at-enum {string}
     *   var Err = {
     *     UNKNOWN: 'unknown',
     *     OBJECT_NOT_FOUND: 'object-not-found',
     *   }
     *
     *   let errors: Map<Err, string> = {
     *     'generic-error': "Unknown error",
     *     'file-not-found': "Could not find file: {$file}",
     *   };
     *
     *   // Type-safe function - must pass a valid error code as param.
     *   let error = new ErrorFactory<Err>('service', 'Service', errors);
     *
     *   ...
     *   throw error.create(Err.GENERIC);
     *   ...
     *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
     *   ...
     *   // Service: Could not file file: foo.txt (service/file-not-found).
     *
     *   catch (e) {
     *     assert(e.message === "Could not find file: foo.txt.");
     *     if (e.code === 'service/file-not-found') {
     *       console.log("Could not read file: " + e['file']);
     *     }
     *   }
     */
    const ERROR_NAME = 'FirebaseError';
    // Based on code from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
    class FirebaseError extends Error {
        constructor(code, message, customData) {
            super(message);
            this.code = code;
            this.customData = customData;
            this.name = ERROR_NAME;
            // Fix For ES5
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, FirebaseError.prototype);
            // Maintains proper stack trace for where our error was thrown.
            // Only available on V8.
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, ErrorFactory.prototype.create);
            }
        }
    }
    class ErrorFactory {
        constructor(service, serviceName, errors) {
            this.service = service;
            this.serviceName = serviceName;
            this.errors = errors;
        }
        create(code, ...data) {
            const customData = data[0] || {};
            const fullCode = `${this.service}/${code}`;
            const template = this.errors[code];
            const message = template ? replaceTemplate(template, customData) : 'Error';
            // Service Name: Error message (service/code).
            const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
            const error = new FirebaseError(fullCode, fullMessage, customData);
            return error;
        }
    }
    function replaceTemplate(template, data) {
        return template.replace(PATTERN, (_, key) => {
            const value = data[key];
            return value != null ? String(value) : `<${key}?>`;
        });
    }
    const PATTERN = /\{\$([^}]+)}/g;

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
     * Evaluates a JSON string into a javascript object.
     *
     * @param {string} str A string containing JSON.
     * @return {*} The javascript object representing the specified JSON.
     */
    function jsonEval(str) {
        return JSON.parse(str);
    }
    /**
     * Returns JSON representing a javascript object.
     * @param {*} data Javascript object to be stringified.
     * @return {string} The JSON contents of the object.
     */
    function stringify(data) {
        return JSON.stringify(data);
    }

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
     * Decodes a Firebase auth. token into constituent parts.
     *
     * Notes:
     * - May return with invalid / incomplete claims if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    const decode = function (token) {
        let header = {}, claims = {}, data = {}, signature = '';
        try {
            const parts = token.split('.');
            header = jsonEval(base64Decode(parts[0]) || '');
            claims = jsonEval(base64Decode(parts[1]) || '');
            signature = parts[2];
            data = claims['d'] || {};
            delete claims['d'];
        }
        catch (e) { }
        return {
            header,
            claims,
            data,
            signature
        };
    };
    /**
     * Decodes a Firebase auth. token and checks the validity of its format. Expects a valid issued-at time.
     *
     * Notes:
     * - May return a false negative if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    const isValidFormat = function (token) {
        const decoded = decode(token), claims = decoded.claims;
        return !!claims && typeof claims === 'object' && claims.hasOwnProperty('iat');
    };
    /**
     * Attempts to peer into an auth token and determine if it's an admin auth token by looking at the claims portion.
     *
     * Notes:
     * - May return a false negative if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    const isAdmin = function (token) {
        const claims = decode(token).claims;
        return typeof claims === 'object' && claims['admin'] === true;
    };

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
    function contains(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    function safeGet(obj, key) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key];
        }
        else {
            return undefined;
        }
    }
    function isEmpty(obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    function map(obj, fn, contextObj) {
        const res = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res[key] = fn.call(contextObj, obj[key], key, obj);
            }
        }
        return res;
    }
    /**
     * Deep equal two objects. Support Arrays and Objects.
     */
    function deepEqual(a, b) {
        if (a === b) {
            return true;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        for (const k of aKeys) {
            if (!bKeys.includes(k)) {
                return false;
            }
            const aProp = a[k];
            const bProp = b[k];
            if (isObject(aProp) && isObject(bProp)) {
                if (!deepEqual(aProp, bProp)) {
                    return false;
                }
            }
            else if (aProp !== bProp) {
                return false;
            }
        }
        for (const k of bKeys) {
            if (!aKeys.includes(k)) {
                return false;
            }
        }
        return true;
    }
    function isObject(thing) {
        return thing !== null && typeof thing === 'object';
    }

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
     * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
     * params object (e.g. {arg: 'val', arg2: 'val2'})
     * Note: You must prepend it with ? when adding it to a URL.
     */
    function querystring(querystringParams) {
        const params = [];
        for (const [key, value] of Object.entries(querystringParams)) {
            if (Array.isArray(value)) {
                value.forEach(arrayVal => {
                    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
                });
            }
            else {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return params.length ? '&' + params.join('&') : '';
    }

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
     * @fileoverview SHA-1 cryptographic hash.
     * Variable names follow the notation in FIPS PUB 180-3:
     * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
     *
     * Usage:
     *   var sha1 = new sha1();
     *   sha1.update(bytes);
     *   var hash = sha1.digest();
     *
     * Performance:
     *   Chrome 23:   ~400 Mbit/s
     *   Firefox 16:  ~250 Mbit/s
     *
     */
    /**
     * SHA-1 cryptographic hash constructor.
     *
     * The properties declared here are discussed in the above algorithm document.
     * @constructor
     * @final
     * @struct
     */
    class Sha1 {
        constructor() {
            /**
             * Holds the previous values of accumulated variables a-e in the compress_
             * function.
             * @private
             */
            this.chain_ = [];
            /**
             * A buffer holding the partially computed hash result.
             * @private
             */
            this.buf_ = [];
            /**
             * An array of 80 bytes, each a part of the message to be hashed.  Referred to
             * as the message schedule in the docs.
             * @private
             */
            this.W_ = [];
            /**
             * Contains data needed to pad messages less than 64 bytes.
             * @private
             */
            this.pad_ = [];
            /**
             * @private {number}
             */
            this.inbuf_ = 0;
            /**
             * @private {number}
             */
            this.total_ = 0;
            this.blockSize = 512 / 8;
            this.pad_[0] = 128;
            for (let i = 1; i < this.blockSize; ++i) {
                this.pad_[i] = 0;
            }
            this.reset();
        }
        reset() {
            this.chain_[0] = 0x67452301;
            this.chain_[1] = 0xefcdab89;
            this.chain_[2] = 0x98badcfe;
            this.chain_[3] = 0x10325476;
            this.chain_[4] = 0xc3d2e1f0;
            this.inbuf_ = 0;
            this.total_ = 0;
        }
        /**
         * Internal compress helper function.
         * @param buf Block to compress.
         * @param offset Offset of the block in the buffer.
         * @private
         */
        compress_(buf, offset) {
            if (!offset) {
                offset = 0;
            }
            const W = this.W_;
            // get 16 big endian words
            if (typeof buf === 'string') {
                for (let i = 0; i < 16; i++) {
                    // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
                    // have a bug that turns the post-increment ++ operator into pre-increment
                    // during JIT compilation.  We have code that depends heavily on SHA-1 for
                    // correctness and which is affected by this bug, so I've removed all uses
                    // of post-increment ++ in which the result value is used.  We can revert
                    // this change once the Safari bug
                    // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
                    // most clients have been updated.
                    W[i] =
                        (buf.charCodeAt(offset) << 24) |
                            (buf.charCodeAt(offset + 1) << 16) |
                            (buf.charCodeAt(offset + 2) << 8) |
                            buf.charCodeAt(offset + 3);
                    offset += 4;
                }
            }
            else {
                for (let i = 0; i < 16; i++) {
                    W[i] =
                        (buf[offset] << 24) |
                            (buf[offset + 1] << 16) |
                            (buf[offset + 2] << 8) |
                            buf[offset + 3];
                    offset += 4;
                }
            }
            // expand to 80 words
            for (let i = 16; i < 80; i++) {
                const t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = ((t << 1) | (t >>> 31)) & 0xffffffff;
            }
            let a = this.chain_[0];
            let b = this.chain_[1];
            let c = this.chain_[2];
            let d = this.chain_[3];
            let e = this.chain_[4];
            let f, k;
            // TODO(user): Try to unroll this loop to speed up the computation.
            for (let i = 0; i < 80; i++) {
                if (i < 40) {
                    if (i < 20) {
                        f = d ^ (b & (c ^ d));
                        k = 0x5a827999;
                    }
                    else {
                        f = b ^ c ^ d;
                        k = 0x6ed9eba1;
                    }
                }
                else {
                    if (i < 60) {
                        f = (b & c) | (d & (b | c));
                        k = 0x8f1bbcdc;
                    }
                    else {
                        f = b ^ c ^ d;
                        k = 0xca62c1d6;
                    }
                }
                const t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) & 0xffffffff;
                e = d;
                d = c;
                c = ((b << 30) | (b >>> 2)) & 0xffffffff;
                b = a;
                a = t;
            }
            this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
            this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
            this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
            this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
            this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
        }
        update(bytes, length) {
            // TODO(johnlenz): tighten the function signature and remove this check
            if (bytes == null) {
                return;
            }
            if (length === undefined) {
                length = bytes.length;
            }
            const lengthMinusBlock = length - this.blockSize;
            let n = 0;
            // Using local instead of member variables gives ~5% speedup on Firefox 16.
            const buf = this.buf_;
            let inbuf = this.inbuf_;
            // The outer while loop should execute at most twice.
            while (n < length) {
                // When we have no data in the block to top up, we can directly process the
                // input buffer (assuming it contains sufficient data). This gives ~25%
                // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
                // the data is provided in large chunks (or in multiples of 64 bytes).
                if (inbuf === 0) {
                    while (n <= lengthMinusBlock) {
                        this.compress_(bytes, n);
                        n += this.blockSize;
                    }
                }
                if (typeof bytes === 'string') {
                    while (n < length) {
                        buf[inbuf] = bytes.charCodeAt(n);
                        ++inbuf;
                        ++n;
                        if (inbuf === this.blockSize) {
                            this.compress_(buf);
                            inbuf = 0;
                            // Jump to the outer loop so we use the full-block optimization.
                            break;
                        }
                    }
                }
                else {
                    while (n < length) {
                        buf[inbuf] = bytes[n];
                        ++inbuf;
                        ++n;
                        if (inbuf === this.blockSize) {
                            this.compress_(buf);
                            inbuf = 0;
                            // Jump to the outer loop so we use the full-block optimization.
                            break;
                        }
                    }
                }
            }
            this.inbuf_ = inbuf;
            this.total_ += length;
        }
        /** @override */
        digest() {
            const digest = [];
            let totalBits = this.total_ * 8;
            // Add pad 0x80 0x00*.
            if (this.inbuf_ < 56) {
                this.update(this.pad_, 56 - this.inbuf_);
            }
            else {
                this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
            }
            // Add # bits.
            for (let i = this.blockSize - 1; i >= 56; i--) {
                this.buf_[i] = totalBits & 255;
                totalBits /= 256; // Don't use bit-shifting here!
            }
            this.compress_(this.buf_);
            let n = 0;
            for (let i = 0; i < 5; i++) {
                for (let j = 24; j >= 0; j -= 8) {
                    digest[n] = (this.chain_[i] >> j) & 255;
                    ++n;
                }
            }
            return digest;
        }
    }

    /**
     * Helper to make a Subscribe function (just like Promise helps make a
     * Thenable).
     *
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function createSubscribe(executor, onNoObservers) {
        const proxy = new ObserverProxy(executor, onNoObservers);
        return proxy.subscribe.bind(proxy);
    }
    /**
     * Implement fan-out for any number of Observers attached via a subscribe
     * function.
     */
    class ObserverProxy {
        /**
         * @param executor Function which can make calls to a single Observer
         *     as a proxy.
         * @param onNoObservers Callback when count of Observers goes to zero.
         */
        constructor(executor, onNoObservers) {
            this.observers = [];
            this.unsubscribes = [];
            this.observerCount = 0;
            // Micro-task scheduling by calling task.then().
            this.task = Promise.resolve();
            this.finalized = false;
            this.onNoObservers = onNoObservers;
            // Call the executor asynchronously so subscribers that are called
            // synchronously after the creation of the subscribe function
            // can still receive the very first value generated in the executor.
            this.task
                .then(() => {
                executor(this);
            })
                .catch(e => {
                this.error(e);
            });
        }
        next(value) {
            this.forEachObserver((observer) => {
                observer.next(value);
            });
        }
        error(error) {
            this.forEachObserver((observer) => {
                observer.error(error);
            });
            this.close(error);
        }
        complete() {
            this.forEachObserver((observer) => {
                observer.complete();
            });
            this.close();
        }
        /**
         * Subscribe function that can be used to add an Observer to the fan-out list.
         *
         * - We require that no event is sent to a subscriber sychronously to their
         *   call to subscribe().
         */
        subscribe(nextOrObserver, error, complete) {
            let observer;
            if (nextOrObserver === undefined &&
                error === undefined &&
                complete === undefined) {
                throw new Error('Missing Observer.');
            }
            // Assemble an Observer object when passed as callback functions.
            if (implementsAnyMethods(nextOrObserver, [
                'next',
                'error',
                'complete'
            ])) {
                observer = nextOrObserver;
            }
            else {
                observer = {
                    next: nextOrObserver,
                    error,
                    complete
                };
            }
            if (observer.next === undefined) {
                observer.next = noop;
            }
            if (observer.error === undefined) {
                observer.error = noop;
            }
            if (observer.complete === undefined) {
                observer.complete = noop;
            }
            const unsub = this.unsubscribeOne.bind(this, this.observers.length);
            // Attempt to subscribe to a terminated Observable - we
            // just respond to the Observer with the final error or complete
            // event.
            if (this.finalized) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.task.then(() => {
                    try {
                        if (this.finalError) {
                            observer.error(this.finalError);
                        }
                        else {
                            observer.complete();
                        }
                    }
                    catch (e) {
                        // nothing
                    }
                    return;
                });
            }
            this.observers.push(observer);
            return unsub;
        }
        // Unsubscribe is synchronous - we guarantee that no events are sent to
        // any unsubscribed Observer.
        unsubscribeOne(i) {
            if (this.observers === undefined || this.observers[i] === undefined) {
                return;
            }
            delete this.observers[i];
            this.observerCount -= 1;
            if (this.observerCount === 0 && this.onNoObservers !== undefined) {
                this.onNoObservers(this);
            }
        }
        forEachObserver(fn) {
            if (this.finalized) {
                // Already closed by previous event....just eat the additional values.
                return;
            }
            // Since sendOne calls asynchronously - there is no chance that
            // this.observers will become undefined.
            for (let i = 0; i < this.observers.length; i++) {
                this.sendOne(i, fn);
            }
        }
        // Call the Observer via one of it's callback function. We are careful to
        // confirm that the observe has not been unsubscribed since this asynchronous
        // function had been queued.
        sendOne(i, fn) {
            // Execute the callback asynchronously
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(() => {
                if (this.observers !== undefined && this.observers[i] !== undefined) {
                    try {
                        fn(this.observers[i]);
                    }
                    catch (e) {
                        // Ignore exceptions raised in Observers or missing methods of an
                        // Observer.
                        // Log error to console. b/31404806
                        if (typeof console !== 'undefined' && console.error) {
                            console.error(e);
                        }
                    }
                }
            });
        }
        close(err) {
            if (this.finalized) {
                return;
            }
            this.finalized = true;
            if (err !== undefined) {
                this.finalError = err;
            }
            // Proxy is no longer needed - garbage collect references
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(() => {
                this.observers = undefined;
                this.onNoObservers = undefined;
            });
        }
    }
    /**
     * Return true if the object passed in implements any of the named methods.
     */
    function implementsAnyMethods(obj, methods) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        for (const method of methods) {
            if (method in obj && typeof obj[method] === 'function') {
                return true;
            }
        }
        return false;
    }
    function noop() {
        // do nothing
    }
    /**
     * Generates a string to prefix an error message about failed argument validation
     *
     * @param fnName The function name
     * @param argName The name of the argument
     * @return The prefix to add to the error thrown for validation.
     */
    function errorPrefix(fnName, argName) {
        return `${fnName} failed: ${argName} argument `;
    }

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
    // Code originally came from goog.crypt.stringToUtf8ByteArray, but for some reason they
    // automatically replaced '\r\n' with '\n', and they didn't handle surrogate pairs,
    // so it's been modified.
    // Note that not all Unicode characters appear as single characters in JavaScript strings.
    // fromCharCode returns the UTF-16 encoding of a character - so some Unicode characters
    // use 2 characters in Javascript.  All 4-byte UTF-8 characters begin with a first
    // character in the range 0xD800 - 0xDBFF (the first character of a so-called surrogate
    // pair).
    // See http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3
    /**
     * @param {string} str
     * @return {Array}
     */
    const stringToByteArray = function (str) {
        const out = [];
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            // Is this the lead surrogate in a surrogate pair?
            if (c >= 0xd800 && c <= 0xdbff) {
                const high = c - 0xd800; // the high 10 bits.
                i++;
                assert(i < str.length, 'Surrogate pair missing trail surrogate.');
                const low = str.charCodeAt(i) - 0xdc00; // the low 10 bits.
                c = 0x10000 + (high << 10) + low;
            }
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if (c < 65536) {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Calculate length without actually converting; useful for doing cheaper validation.
     * @param {string} str
     * @return {number}
     */
    const stringLength = function (str) {
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            if (c < 128) {
                p++;
            }
            else if (c < 2048) {
                p += 2;
            }
            else if (c >= 0xd800 && c <= 0xdbff) {
                // Lead surrogate of a surrogate pair.  The pair together will take 4 bytes to represent.
                p += 4;
                i++; // skip trail surrogate.
            }
            else {
                p += 3;
            }
        }
        return p;
    };

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
    function getModularInstance(service) {
        if (service && service._delegate) {
            return service._delegate;
        }
        else {
            return service;
        }
    }

    /**
     * Component for service name T, e.g. `auth`, `auth-internal`
     */
    class Component {
        /**
         *
         * @param name The public service name, e.g. app, auth, firestore, database
         * @param instanceFactory Service factory responsible for creating the public interface
         * @param type whether the service provided by the component is public or private
         */
        constructor(name, instanceFactory, type) {
            this.name = name;
            this.instanceFactory = instanceFactory;
            this.type = type;
            this.multipleInstances = false;
            /**
             * Properties to be added to the service namespace
             */
            this.serviceProps = {};
            this.instantiationMode = "LAZY" /* LAZY */;
            this.onInstanceCreated = null;
        }
        setInstantiationMode(mode) {
            this.instantiationMode = mode;
            return this;
        }
        setMultipleInstances(multipleInstances) {
            this.multipleInstances = multipleInstances;
            return this;
        }
        setServiceProps(props) {
            this.serviceProps = props;
            return this;
        }
        setInstanceCreatedCallback(callback) {
            this.onInstanceCreated = callback;
            return this;
        }
    }

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
    const DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

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
     * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
     * NameServiceMapping[T] is an alias for the type of the instance
     */
    class Provider {
        constructor(name, container) {
            this.name = name;
            this.container = container;
            this.component = null;
            this.instances = new Map();
            this.instancesDeferred = new Map();
            this.instancesOptions = new Map();
            this.onInitCallbacks = new Map();
        }
        /**
         * @param identifier A provider can provide mulitple instances of a service
         * if this.component.multipleInstances is true.
         */
        get(identifier) {
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            if (!this.instancesDeferred.has(normalizedIdentifier)) {
                const deferred = new Deferred();
                this.instancesDeferred.set(normalizedIdentifier, deferred);
                if (this.isInitialized(normalizedIdentifier) ||
                    this.shouldAutoInitialize()) {
                    // initialize the service if it can be auto-initialized
                    try {
                        const instance = this.getOrInitializeService({
                            instanceIdentifier: normalizedIdentifier
                        });
                        if (instance) {
                            deferred.resolve(instance);
                        }
                    }
                    catch (e) {
                        // when the instance factory throws an exception during get(), it should not cause
                        // a fatal error. We just return the unresolved promise in this case.
                    }
                }
            }
            return this.instancesDeferred.get(normalizedIdentifier).promise;
        }
        getImmediate(options) {
            var _a;
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
            const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
            if (this.isInitialized(normalizedIdentifier) ||
                this.shouldAutoInitialize()) {
                try {
                    return this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                }
                catch (e) {
                    if (optional) {
                        return null;
                    }
                    else {
                        throw e;
                    }
                }
            }
            else {
                // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
                if (optional) {
                    return null;
                }
                else {
                    throw Error(`Service ${this.name} is not available`);
                }
            }
        }
        getComponent() {
            return this.component;
        }
        setComponent(component) {
            if (component.name !== this.name) {
                throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
            }
            if (this.component) {
                throw Error(`Component for ${this.name} has already been provided`);
            }
            this.component = component;
            // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
            if (!this.shouldAutoInitialize()) {
                return;
            }
            // if the service is eager, initialize the default instance
            if (isComponentEager(component)) {
                try {
                    this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
                }
                catch (e) {
                    // when the instance factory for an eager Component throws an exception during the eager
                    // initialization, it should not cause a fatal error.
                    // TODO: Investigate if we need to make it configurable, because some component may want to cause
                    // a fatal error in this case?
                }
            }
            // Create service instances for the pending promises and resolve them
            // NOTE: if this.multipleInstances is false, only the default instance will be created
            // and all promises with resolve with it regardless of the identifier.
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                try {
                    // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                    const instance = this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                    instanceDeferred.resolve(instance);
                }
                catch (e) {
                    // when the instance factory throws an exception, it should not cause
                    // a fatal error. We just leave the promise unresolved.
                }
            }
        }
        clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
            this.instancesDeferred.delete(identifier);
            this.instancesOptions.delete(identifier);
            this.instances.delete(identifier);
        }
        // app.delete() will call this method on every provider to delete the services
        // TODO: should we mark the provider as deleted?
        async delete() {
            const services = Array.from(this.instances.values());
            await Promise.all([
                ...services
                    .filter(service => 'INTERNAL' in service) // legacy services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service.INTERNAL.delete()),
                ...services
                    .filter(service => '_delete' in service) // modularized services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service._delete())
            ]);
        }
        isComponentSet() {
            return this.component != null;
        }
        isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instances.has(identifier);
        }
        getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instancesOptions.get(identifier) || {};
        }
        initialize(opts = {}) {
            const { options = {} } = opts;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
            if (this.isInitialized(normalizedIdentifier)) {
                throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
            }
            if (!this.isComponentSet()) {
                throw Error(`Component ${this.name} has not been registered yet`);
            }
            const instance = this.getOrInitializeService({
                instanceIdentifier: normalizedIdentifier,
                options
            });
            // resolve any pending promise waiting for the service instance
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                if (normalizedIdentifier === normalizedDeferredIdentifier) {
                    instanceDeferred.resolve(instance);
                }
            }
            return instance;
        }
        /**
         *
         * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
         * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
         *
         * @param identifier An optional instance identifier
         * @returns a function to unregister the callback
         */
        onInit(callback, identifier) {
            var _a;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
            existingCallbacks.add(callback);
            this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
            const existingInstance = this.instances.get(normalizedIdentifier);
            if (existingInstance) {
                callback(existingInstance, normalizedIdentifier);
            }
            return () => {
                existingCallbacks.delete(callback);
            };
        }
        /**
         * Invoke onInit callbacks synchronously
         * @param instance the service instance`
         */
        invokeOnInitCallbacks(instance, identifier) {
            const callbacks = this.onInitCallbacks.get(identifier);
            if (!callbacks) {
                return;
            }
            for (const callback of callbacks) {
                try {
                    callback(instance, identifier);
                }
                catch (_a) {
                    // ignore errors in the onInit callback
                }
            }
        }
        getOrInitializeService({ instanceIdentifier, options = {} }) {
            let instance = this.instances.get(instanceIdentifier);
            if (!instance && this.component) {
                instance = this.component.instanceFactory(this.container, {
                    instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                    options
                });
                this.instances.set(instanceIdentifier, instance);
                this.instancesOptions.set(instanceIdentifier, options);
                /**
                 * Invoke onInit listeners.
                 * Note this.component.onInstanceCreated is different, which is used by the component creator,
                 * while onInit listeners are registered by consumers of the provider.
                 */
                this.invokeOnInitCallbacks(instance, instanceIdentifier);
                /**
                 * Order is important
                 * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
                 * makes `isInitialized()` return true.
                 */
                if (this.component.onInstanceCreated) {
                    try {
                        this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                    }
                    catch (_a) {
                        // ignore errors in the onInstanceCreatedCallback
                    }
                }
            }
            return instance || null;
        }
        normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
            if (this.component) {
                return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
            }
            else {
                return identifier; // assume multiple instances are supported before the component is provided.
            }
        }
        shouldAutoInitialize() {
            return (!!this.component &&
                this.component.instantiationMode !== "EXPLICIT" /* EXPLICIT */);
        }
    }
    // undefined should be passed to the service factory for the default instance
    function normalizeIdentifierForFactory(identifier) {
        return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
    }
    function isComponentEager(component) {
        return component.instantiationMode === "EAGER" /* EAGER */;
    }

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
     * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
     */
    class ComponentContainer {
        constructor(name) {
            this.name = name;
            this.providers = new Map();
        }
        /**
         *
         * @param component Component being added
         * @param overwrite When a component with the same name has already been registered,
         * if overwrite is true: overwrite the existing component with the new component and create a new
         * provider with the new component. It can be useful in tests where you want to use different mocks
         * for different tests.
         * if overwrite is false: throw an exception
         */
        addComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
            }
            provider.setComponent(component);
        }
        addOrOverwriteComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                // delete the existing provider from the container, so we can register the new component
                this.providers.delete(component.name);
            }
            this.addComponent(component);
        }
        /**
         * getProvider provides a type safe interface where it can only be called with a field name
         * present in NameServiceMapping interface.
         *
         * Firebase SDKs providing services should extend NameServiceMapping interface to register
         * themselves.
         */
        getProvider(name) {
            if (this.providers.has(name)) {
                return this.providers.get(name);
            }
            // create a Provider for a service that hasn't registered with Firebase
            const provider = new Provider(name, this);
            this.providers.set(name, provider);
            return provider;
        }
        getProviders() {
            return Array.from(this.providers.values());
        }
    }

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
     * The JS SDK supports 5 log levels and also allows a user the ability to
     * silence the logs altogether.
     *
     * The order is a follows:
     * DEBUG < VERBOSE < INFO < WARN < ERROR
     *
     * All of the log types above the current log level will be captured (i.e. if
     * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
     * `VERBOSE` logs will not)
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    const levelStringToEnum = {
        'debug': LogLevel.DEBUG,
        'verbose': LogLevel.VERBOSE,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'silent': LogLevel.SILENT
    };
    /**
     * The default log level
     */
    const defaultLogLevel = LogLevel.INFO;
    /**
     * By default, `console.debug` is not displayed in the developer console (in
     * chrome). To avoid forcing users to have to opt-in to these logs twice
     * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
     * logs to the `console.log` function.
     */
    const ConsoleMethod = {
        [LogLevel.DEBUG]: 'log',
        [LogLevel.VERBOSE]: 'log',
        [LogLevel.INFO]: 'info',
        [LogLevel.WARN]: 'warn',
        [LogLevel.ERROR]: 'error'
    };
    /**
     * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
     * messages on to their corresponding console counterparts (if the log method
     * is supported by the current log level)
     */
    const defaultLogHandler = (instance, logType, ...args) => {
        if (logType < instance.logLevel) {
            return;
        }
        const now = new Date().toISOString();
        const method = ConsoleMethod[logType];
        if (method) {
            console[method](`[${now}]  ${instance.name}:`, ...args);
        }
        else {
            throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
        }
    };
    class Logger {
        /**
         * Gives you an instance of a Logger to capture messages according to
         * Firebase's logging scheme.
         *
         * @param name The name that the logs will be associated with
         */
        constructor(name) {
            this.name = name;
            /**
             * The log level of the given Logger instance.
             */
            this._logLevel = defaultLogLevel;
            /**
             * The main (internal) log handler for the Logger instance.
             * Can be set to a new function in internal package code but not by user.
             */
            this._logHandler = defaultLogHandler;
            /**
             * The optional, additional, user-defined log handler for the Logger instance.
             */
            this._userLogHandler = null;
        }
        get logLevel() {
            return this._logLevel;
        }
        set logLevel(val) {
            if (!(val in LogLevel)) {
                throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
            }
            this._logLevel = val;
        }
        // Workaround for setter/getter having to be the same type.
        setLogLevel(val) {
            this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
        }
        get logHandler() {
            return this._logHandler;
        }
        set logHandler(val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        }
        get userLogHandler() {
            return this._userLogHandler;
        }
        set userLogHandler(val) {
            this._userLogHandler = val;
        }
        /**
         * The functions below are all based on the `console` interface
         */
        debug(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
            this._logHandler(this, LogLevel.DEBUG, ...args);
        }
        log(...args) {
            this._userLogHandler &&
                this._userLogHandler(this, LogLevel.VERBOSE, ...args);
            this._logHandler(this, LogLevel.VERBOSE, ...args);
        }
        info(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
            this._logHandler(this, LogLevel.INFO, ...args);
        }
        warn(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
            this._logHandler(this, LogLevel.WARN, ...args);
        }
        error(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
            this._logHandler(this, LogLevel.ERROR, ...args);
        }
    }

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
    class PlatformLoggerServiceImpl {
        constructor(container) {
            this.container = container;
        }
        // In initial implementation, this will be called by installations on
        // auth token refresh, and installations will send this string.
        getPlatformInfoString() {
            const providers = this.container.getProviders();
            // Loop through providers and get library/version pairs from any that are
            // version components.
            return providers
                .map(provider => {
                if (isVersionServiceProvider(provider)) {
                    const service = provider.getImmediate();
                    return `${service.library}/${service.version}`;
                }
                else {
                    return null;
                }
            })
                .filter(logString => logString)
                .join(' ');
        }
    }
    /**
     *
     * @param provider check if this provider provides a VersionService
     *
     * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
     * provides VersionService. The provider is not necessarily a 'app-version'
     * provider.
     */
    function isVersionServiceProvider(provider) {
        const component = provider.getComponent();
        return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* VERSION */;
    }

    const name$o = "@firebase/app";
    const version$1$1 = "0.7.11";

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
    const logger$1 = new Logger('@firebase/app');

    const name$n = "@firebase/app-compat";

    const name$m = "@firebase/analytics-compat";

    const name$l = "@firebase/analytics";

    const name$k = "@firebase/app-check-compat";

    const name$j = "@firebase/app-check";

    const name$i = "@firebase/auth";

    const name$h = "@firebase/auth-compat";

    const name$g = "@firebase/database";

    const name$f = "@firebase/database-compat";

    const name$e = "@firebase/functions";

    const name$d = "@firebase/functions-compat";

    const name$c = "@firebase/installations";

    const name$b = "@firebase/installations-compat";

    const name$a = "@firebase/messaging";

    const name$9 = "@firebase/messaging-compat";

    const name$8 = "@firebase/performance";

    const name$7 = "@firebase/performance-compat";

    const name$6 = "@firebase/remote-config";

    const name$5 = "@firebase/remote-config-compat";

    const name$4 = "@firebase/storage";

    const name$3 = "@firebase/storage-compat";

    const name$2$1 = "@firebase/firestore";

    const name$1$1 = "@firebase/firestore-compat";

    const name$p = "firebase";
    const version$3 = "9.6.1";

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
     * The default app name
     *
     * @internal
     */
    const DEFAULT_ENTRY_NAME = '[DEFAULT]';
    const PLATFORM_LOG_STRING = {
        [name$o]: 'fire-core',
        [name$n]: 'fire-core-compat',
        [name$l]: 'fire-analytics',
        [name$m]: 'fire-analytics-compat',
        [name$j]: 'fire-app-check',
        [name$k]: 'fire-app-check-compat',
        [name$i]: 'fire-auth',
        [name$h]: 'fire-auth-compat',
        [name$g]: 'fire-rtdb',
        [name$f]: 'fire-rtdb-compat',
        [name$e]: 'fire-fn',
        [name$d]: 'fire-fn-compat',
        [name$c]: 'fire-iid',
        [name$b]: 'fire-iid-compat',
        [name$a]: 'fire-fcm',
        [name$9]: 'fire-fcm-compat',
        [name$8]: 'fire-perf',
        [name$7]: 'fire-perf-compat',
        [name$6]: 'fire-rc',
        [name$5]: 'fire-rc-compat',
        [name$4]: 'fire-gcs',
        [name$3]: 'fire-gcs-compat',
        [name$2$1]: 'fire-fst',
        [name$1$1]: 'fire-fst-compat',
        'fire-js': 'fire-js',
        [name$p]: 'fire-js-all'
    };

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
     * @internal
     */
    const _apps = new Map();
    /**
     * Registered components.
     *
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _components = new Map();
    /**
     * @param component - the component being added to this app's container
     *
     * @internal
     */
    function _addComponent(app, component) {
        try {
            app.container.addComponent(component);
        }
        catch (e) {
            logger$1.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
        }
    }
    /**
     *
     * @param component - the component to register
     * @returns whether or not the component is registered successfully
     *
     * @internal
     */
    function _registerComponent(component) {
        const componentName = component.name;
        if (_components.has(componentName)) {
            logger$1.debug(`There were multiple attempts to register component ${componentName}.`);
            return false;
        }
        _components.set(componentName, component);
        // add the component to existing app instances
        for (const app of _apps.values()) {
            _addComponent(app, component);
        }
        return true;
    }
    /**
     *
     * @param app - FirebaseApp instance
     * @param name - service name
     *
     * @returns the provider for the service with the matching name
     *
     * @internal
     */
    function _getProvider(app, name) {
        return app.container.getProvider(name);
    }

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
    const ERRORS = {
        ["no-app" /* NO_APP */]: "No Firebase App '{$appName}' has been created - " +
            'call Firebase App.initializeApp()',
        ["bad-app-name" /* BAD_APP_NAME */]: "Illegal App name: '{$appName}",
        ["duplicate-app" /* DUPLICATE_APP */]: "Firebase App named '{$appName}' already exists with different options or config",
        ["app-deleted" /* APP_DELETED */]: "Firebase App named '{$appName}' already deleted",
        ["invalid-app-argument" /* INVALID_APP_ARGUMENT */]: 'firebase.{$appName}() takes either no argument or a ' +
            'Firebase App instance.',
        ["invalid-log-argument" /* INVALID_LOG_ARGUMENT */]: 'First argument to `onLog` must be null or a function.'
    };
    const ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

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
    class FirebaseAppImpl {
        constructor(options, config, container) {
            this._isDeleted = false;
            this._options = Object.assign({}, options);
            this._config = Object.assign({}, config);
            this._name = config.name;
            this._automaticDataCollectionEnabled =
                config.automaticDataCollectionEnabled;
            this._container = container;
            this.container.addComponent(new Component('app', () => this, "PUBLIC" /* PUBLIC */));
        }
        get automaticDataCollectionEnabled() {
            this.checkDestroyed();
            return this._automaticDataCollectionEnabled;
        }
        set automaticDataCollectionEnabled(val) {
            this.checkDestroyed();
            this._automaticDataCollectionEnabled = val;
        }
        get name() {
            this.checkDestroyed();
            return this._name;
        }
        get options() {
            this.checkDestroyed();
            return this._options;
        }
        get config() {
            this.checkDestroyed();
            return this._config;
        }
        get container() {
            return this._container;
        }
        get isDeleted() {
            return this._isDeleted;
        }
        set isDeleted(val) {
            this._isDeleted = val;
        }
        /**
         * This function will throw an Error if the App has already been deleted -
         * use before performing API actions on the App.
         */
        checkDestroyed() {
            if (this.isDeleted) {
                throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this._name });
            }
        }
    }

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
     * The current SDK version.
     *
     * @public
     */
    const SDK_VERSION$1 = version$3;
    function initializeApp(options, rawConfig = {}) {
        if (typeof rawConfig !== 'object') {
            const name = rawConfig;
            rawConfig = { name };
        }
        const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
        const name = config.name;
        if (typeof name !== 'string' || !name) {
            throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                appName: String(name)
            });
        }
        const existingApp = _apps.get(name);
        if (existingApp) {
            // return the existing app if options and config deep equal the ones in the existing app.
            if (deepEqual(options, existingApp.options) &&
                deepEqual(config, existingApp.config)) {
                return existingApp;
            }
            else {
                throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
            }
        }
        const container = new ComponentContainer(name);
        for (const component of _components.values()) {
            container.addComponent(component);
        }
        const newApp = new FirebaseAppImpl(options, config, container);
        _apps.set(name, newApp);
        return newApp;
    }
    /**
     * Retrieves a {@link @firebase/app#FirebaseApp} instance.
     *
     * When called with no arguments, the default app is returned. When an app name
     * is provided, the app corresponding to that name is returned.
     *
     * An exception is thrown if the app being retrieved has not yet been
     * initialized.
     *
     * @example
     * ```javascript
     * // Return the default app
     * const app = getApp();
     * ```
     *
     * @example
     * ```javascript
     * // Return a named app
     * const otherApp = getApp("otherApp");
     * ```
     *
     * @param name - Optional name of the app to return. If no name is
     *   provided, the default is `"[DEFAULT]"`.
     *
     * @returns The app corresponding to the provided app name.
     *   If no app name is provided, the default app is returned.
     *
     * @public
     */
    function getApp(name = DEFAULT_ENTRY_NAME) {
        const app = _apps.get(name);
        if (!app) {
            throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
        }
        return app;
    }
    /**
     * Registers a library's name and version for platform logging purposes.
     * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
     * @param version - Current version of that library.
     * @param variant - Bundle variant, e.g., node, rn, etc.
     *
     * @public
     */
    function registerVersion(libraryKeyOrName, version, variant) {
        var _a;
        // TODO: We can use this check to whitelist strings when/if we set up
        // a good whitelist system.
        let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
        if (variant) {
            library += `-${variant}`;
        }
        const libraryMismatch = library.match(/\s|\//);
        const versionMismatch = version.match(/\s|\//);
        if (libraryMismatch || versionMismatch) {
            const warning = [
                `Unable to register library "${library}" with version "${version}":`
            ];
            if (libraryMismatch) {
                warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
            }
            if (libraryMismatch && versionMismatch) {
                warning.push('and');
            }
            if (versionMismatch) {
                warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
            }
            logger$1.warn(warning.join(' '));
            return;
        }
        _registerComponent(new Component(`${library}-version`, () => ({ library, version }), "VERSION" /* VERSION */));
    }

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
    function registerCoreComponents(variant) {
        _registerComponent(new Component('platform-logger', container => new PlatformLoggerServiceImpl(container), "PRIVATE" /* PRIVATE */));
        // Register `app` package.
        registerVersion(name$o, version$1$1, variant);
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name$o, version$1$1, 'esm2017');
        // Register platform SDK identifier (no version).
        registerVersion('fire-js', '');
    }

    /**
     * Firebase App
     *
     * @remarks This package coordinates the communication between the different Firebase components
     * @packageDocumentation
     */
    registerCoreComponents('');

    var name$2 = "firebase";
    var version$2 = "9.6.1";

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
    registerVersion(name$2, version$2, 'app');

    const firebaseConfig = {
        apiKey: "AIzaSyAddUF68m2igTa-JmIblbZUjmx1CE3xwdQ",
        authDomain: "hanzigraph.firebaseapp.com",
        projectId: "hanzigraph",
        storageBucket: "hanzigraph.appspot.com",
        messagingSenderId: "317168591112",
        appId: "1:317168591112:web:5b4580943b370526888cbd",
        databaseURL: "https://hanzigraph.firebaseio.com"
    };

    let initialize$7 = function () {
        initializeApp(firebaseConfig);
    };

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
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function _prodErrorMap() {
        // We will include this one message in the prod error map since by the very
        // nature of this error, developers will never be able to see the message
        // using the debugErrorMap (which is installed during auth initialization).
        return {
            ["dependent-sdk-initialized-before-auth" /* DEPENDENT_SDK_INIT_BEFORE_AUTH */]: 'Another Firebase SDK was initialized and is trying to use Auth before Auth is ' +
                'initialized. Please be sure to call `initializeAuth` or `getAuth` before ' +
                'starting any other Firebase SDK.'
        };
    }
    /**
     * A minimal error map with all verbose error messages stripped.
     *
     * See discussion at {@link AuthErrorMap}
     *
     * @public
     */
    const prodErrorMap = _prodErrorMap;
    const _DEFAULT_AUTH_ERROR_FACTORY = new ErrorFactory('auth', 'Firebase', _prodErrorMap());

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
    const logClient$1 = new Logger('@firebase/auth');
    function _logError(msg, ...args) {
        if (logClient$1.logLevel <= LogLevel.ERROR) {
            logClient$1.error(`Auth (${SDK_VERSION$1}): ${msg}`, ...args);
        }
    }

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
    function _fail(authOrCode, ...rest) {
        throw createErrorInternal(authOrCode, ...rest);
    }
    function _createError(authOrCode, ...rest) {
        return createErrorInternal(authOrCode, ...rest);
    }
    function _errorWithCustomMessage(auth, code, message) {
        const errorMap = Object.assign(Object.assign({}, prodErrorMap()), { [code]: message });
        const factory = new ErrorFactory('auth', 'Firebase', errorMap);
        return factory.create(code, {
            appName: auth.name,
        });
    }
    function createErrorInternal(authOrCode, ...rest) {
        if (typeof authOrCode !== 'string') {
            const code = rest[0];
            const fullParams = [...rest.slice(1)];
            if (fullParams[0]) {
                fullParams[0].appName = authOrCode.name;
            }
            return authOrCode._errorFactory.create(code, ...fullParams);
        }
        return _DEFAULT_AUTH_ERROR_FACTORY.create(authOrCode, ...rest);
    }
    function _assert(assertion, authOrCode, ...rest) {
        if (!assertion) {
            throw createErrorInternal(authOrCode, ...rest);
        }
    }
    /**
     * Unconditionally fails, throwing an internal error with the given message.
     *
     * @param failure type of failure encountered
     * @throws Error
     */
    function debugFail(failure) {
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
        const message = `INTERNAL ASSERTION FAILED: ` + failure;
        _logError(message);
        // NOTE: We don't use FirebaseError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
        throw new Error(message);
    }
    /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * @param assertion
     * @param message
     */
    function debugAssert(assertion, message) {
        if (!assertion) {
            debugFail(message);
        }
    }

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
    const instanceCache = new Map();
    function _getInstance(cls) {
        debugAssert(cls instanceof Function, 'Expected a class definition');
        let instance = instanceCache.get(cls);
        if (instance) {
            debugAssert(instance instanceof cls, 'Instance stored in cache mismatched with class');
            return instance;
        }
        instance = new cls();
        instanceCache.set(cls, instance);
        return instance;
    }

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
     * Initializes an {@link Auth} instance with fine-grained control over
     * {@link Dependencies}.
     *
     * @remarks
     *
     * This function allows more control over the {@link Auth} instance than
     * {@link getAuth}. `getAuth` uses platform-specific defaults to supply
     * the {@link Dependencies}. In general, `getAuth` is the easiest way to
     * initialize Auth and works for most use cases. Use `initializeAuth` if you
     * need control over which persistence layer is used, or to minimize bundle
     * size if you're not using either `signInWithPopup` or `signInWithRedirect`.
     *
     * For example, if your app only uses anonymous accounts and you only want
     * accounts saved for the current session, initialize `Auth` with:
     *
     * ```js
     * const auth = initializeAuth(app, {
     *   persistence: browserSessionPersistence,
     *   popupRedirectResolver: undefined,
     * });
     * ```
     *
     * @public
     */
    function initializeAuth(app, deps) {
        const provider = _getProvider(app, 'auth');
        if (provider.isInitialized()) {
            const auth = provider.getImmediate();
            const initialOptions = provider.getOptions();
            if (deepEqual(initialOptions, deps !== null && deps !== void 0 ? deps : {})) {
                return auth;
            }
            else {
                _fail(auth, "already-initialized" /* ALREADY_INITIALIZED */);
            }
        }
        const auth = provider.initialize({ options: deps });
        return auth;
    }
    function _initializeAuthInstance(auth, deps) {
        const persistence = (deps === null || deps === void 0 ? void 0 : deps.persistence) || [];
        const hierarchy = (Array.isArray(persistence) ? persistence : [persistence]).map(_getInstance);
        if (deps === null || deps === void 0 ? void 0 : deps.errorMap) {
            auth._updateErrorMap(deps.errorMap);
        }
        // This promise is intended to float; auth initialization happens in the
        // background, meanwhile the auth object may be used by the app.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        auth._initializeWithPersistence(hierarchy, deps === null || deps === void 0 ? void 0 : deps.popupRedirectResolver);
    }

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
    function _getCurrentUrl() {
        var _a;
        return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.href)) || '';
    }
    function _isHttpOrHttps() {
        return _getCurrentScheme() === 'http:' || _getCurrentScheme() === 'https:';
    }
    function _getCurrentScheme() {
        var _a;
        return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.protocol)) || null;
    }

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
     * Determine whether the browser is working online
     */
    function _isOnline() {
        if (typeof navigator !== 'undefined' &&
            navigator &&
            'onLine' in navigator &&
            typeof navigator.onLine === 'boolean' &&
            // Apply only for traditional web apps and Chrome extensions.
            // This is especially true for Cordova apps which have unreliable
            // navigator.onLine behavior unless cordova-plugin-network-information is
            // installed which overwrites the native navigator.onLine value and
            // defines navigator.connection.
            (_isHttpOrHttps() || isBrowserExtension() || 'connection' in navigator)) {
            return navigator.onLine;
        }
        // If we can't determine the state, assume it is online.
        return true;
    }
    function _getUserLanguage() {
        if (typeof navigator === 'undefined') {
            return null;
        }
        const navigatorLanguage = navigator;
        return (
        // Most reliable, but only supported in Chrome/Firefox.
        (navigatorLanguage.languages && navigatorLanguage.languages[0]) ||
            // Supported in most browsers, but returns the language of the browser
            // UI, not the language set in browser settings.
            navigatorLanguage.language ||
            // Couldn't determine language.
            null);
    }

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
     * A structure to help pick between a range of long and short delay durations
     * depending on the current environment. In general, the long delay is used for
     * mobile environments whereas short delays are used for desktop environments.
     */
    class Delay {
        constructor(shortDelay, longDelay) {
            this.shortDelay = shortDelay;
            this.longDelay = longDelay;
            // Internal error when improperly initialized.
            debugAssert(longDelay > shortDelay, 'Short delay should be less than long delay!');
            this.isMobile = isMobileCordova() || isReactNative();
        }
        get() {
            if (!_isOnline()) {
                // Pick the shorter timeout.
                return Math.min(5000 /* OFFLINE */, this.shortDelay);
            }
            // If running in a mobile environment, return the long delay, otherwise
            // return the short delay.
            // This could be improved in the future to dynamically change based on other
            // variables instead of just reading the current environment.
            return this.isMobile ? this.longDelay : this.shortDelay;
        }
    }

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
    function _emulatorUrl(config, path) {
        debugAssert(config.emulator, 'Emulator should always be set here');
        const { url } = config.emulator;
        if (!path) {
            return url;
        }
        return `${url}${path.startsWith('/') ? path.slice(1) : path}`;
    }

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
    class FetchProvider {
        static initialize(fetchImpl, headersImpl, responseImpl) {
            this.fetchImpl = fetchImpl;
            if (headersImpl) {
                this.headersImpl = headersImpl;
            }
            if (responseImpl) {
                this.responseImpl = responseImpl;
            }
        }
        static fetch() {
            if (this.fetchImpl) {
                return this.fetchImpl;
            }
            if (typeof self !== 'undefined' && 'fetch' in self) {
                return self.fetch;
            }
            debugFail('Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
        static headers() {
            if (this.headersImpl) {
                return this.headersImpl;
            }
            if (typeof self !== 'undefined' && 'Headers' in self) {
                return self.Headers;
            }
            debugFail('Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
        static response() {
            if (this.responseImpl) {
                return this.responseImpl;
            }
            if (typeof self !== 'undefined' && 'Response' in self) {
                return self.Response;
            }
            debugFail('Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
    }

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
     * Map from errors returned by the server to errors to developer visible errors
     */
    const SERVER_ERROR_MAP = {
        // Custom token errors.
        ["CREDENTIAL_MISMATCH" /* CREDENTIAL_MISMATCH */]: "custom-token-mismatch" /* CREDENTIAL_MISMATCH */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_CUSTOM_TOKEN" /* MISSING_CUSTOM_TOKEN */]: "internal-error" /* INTERNAL_ERROR */,
        // Create Auth URI errors.
        ["INVALID_IDENTIFIER" /* INVALID_IDENTIFIER */]: "invalid-email" /* INVALID_EMAIL */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_CONTINUE_URI" /* MISSING_CONTINUE_URI */]: "internal-error" /* INTERNAL_ERROR */,
        // Sign in with email and password errors (some apply to sign up too).
        ["INVALID_PASSWORD" /* INVALID_PASSWORD */]: "wrong-password" /* INVALID_PASSWORD */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_PASSWORD" /* MISSING_PASSWORD */]: "internal-error" /* INTERNAL_ERROR */,
        // Sign up with email and password errors.
        ["EMAIL_EXISTS" /* EMAIL_EXISTS */]: "email-already-in-use" /* EMAIL_EXISTS */,
        ["PASSWORD_LOGIN_DISABLED" /* PASSWORD_LOGIN_DISABLED */]: "operation-not-allowed" /* OPERATION_NOT_ALLOWED */,
        // Verify assertion for sign in with credential errors:
        ["INVALID_IDP_RESPONSE" /* INVALID_IDP_RESPONSE */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["INVALID_PENDING_TOKEN" /* INVALID_PENDING_TOKEN */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["FEDERATED_USER_ID_ALREADY_LINKED" /* FEDERATED_USER_ID_ALREADY_LINKED */]: "credential-already-in-use" /* CREDENTIAL_ALREADY_IN_USE */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_REQ_TYPE" /* MISSING_REQ_TYPE */]: "internal-error" /* INTERNAL_ERROR */,
        // Send Password reset email errors:
        ["EMAIL_NOT_FOUND" /* EMAIL_NOT_FOUND */]: "user-not-found" /* USER_DELETED */,
        ["RESET_PASSWORD_EXCEED_LIMIT" /* RESET_PASSWORD_EXCEED_LIMIT */]: "too-many-requests" /* TOO_MANY_ATTEMPTS_TRY_LATER */,
        ["EXPIRED_OOB_CODE" /* EXPIRED_OOB_CODE */]: "expired-action-code" /* EXPIRED_OOB_CODE */,
        ["INVALID_OOB_CODE" /* INVALID_OOB_CODE */]: "invalid-action-code" /* INVALID_OOB_CODE */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_OOB_CODE" /* MISSING_OOB_CODE */]: "internal-error" /* INTERNAL_ERROR */,
        // Operations that require ID token in request:
        ["CREDENTIAL_TOO_OLD_LOGIN_AGAIN" /* CREDENTIAL_TOO_OLD_LOGIN_AGAIN */]: "requires-recent-login" /* CREDENTIAL_TOO_OLD_LOGIN_AGAIN */,
        ["INVALID_ID_TOKEN" /* INVALID_ID_TOKEN */]: "invalid-user-token" /* INVALID_AUTH */,
        ["TOKEN_EXPIRED" /* TOKEN_EXPIRED */]: "user-token-expired" /* TOKEN_EXPIRED */,
        ["USER_NOT_FOUND" /* USER_NOT_FOUND */]: "user-token-expired" /* TOKEN_EXPIRED */,
        // Other errors.
        ["TOO_MANY_ATTEMPTS_TRY_LATER" /* TOO_MANY_ATTEMPTS_TRY_LATER */]: "too-many-requests" /* TOO_MANY_ATTEMPTS_TRY_LATER */,
        // Phone Auth related errors.
        ["INVALID_CODE" /* INVALID_CODE */]: "invalid-verification-code" /* INVALID_CODE */,
        ["INVALID_SESSION_INFO" /* INVALID_SESSION_INFO */]: "invalid-verification-id" /* INVALID_SESSION_INFO */,
        ["INVALID_TEMPORARY_PROOF" /* INVALID_TEMPORARY_PROOF */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["MISSING_SESSION_INFO" /* MISSING_SESSION_INFO */]: "missing-verification-id" /* MISSING_SESSION_INFO */,
        ["SESSION_EXPIRED" /* SESSION_EXPIRED */]: "code-expired" /* CODE_EXPIRED */,
        // Other action code errors when additional settings passed.
        // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
        // This is OK as this error will be caught by client side validation.
        ["MISSING_ANDROID_PACKAGE_NAME" /* MISSING_ANDROID_PACKAGE_NAME */]: "missing-android-pkg-name" /* MISSING_ANDROID_PACKAGE_NAME */,
        ["UNAUTHORIZED_DOMAIN" /* UNAUTHORIZED_DOMAIN */]: "unauthorized-continue-uri" /* UNAUTHORIZED_DOMAIN */,
        // getProjectConfig errors when clientId is passed.
        ["INVALID_OAUTH_CLIENT_ID" /* INVALID_OAUTH_CLIENT_ID */]: "invalid-oauth-client-id" /* INVALID_OAUTH_CLIENT_ID */,
        // User actions (sign-up or deletion) disabled errors.
        ["ADMIN_ONLY_OPERATION" /* ADMIN_ONLY_OPERATION */]: "admin-restricted-operation" /* ADMIN_ONLY_OPERATION */,
        // Multi factor related errors.
        ["INVALID_MFA_PENDING_CREDENTIAL" /* INVALID_MFA_PENDING_CREDENTIAL */]: "invalid-multi-factor-session" /* INVALID_MFA_SESSION */,
        ["MFA_ENROLLMENT_NOT_FOUND" /* MFA_ENROLLMENT_NOT_FOUND */]: "multi-factor-info-not-found" /* MFA_INFO_NOT_FOUND */,
        ["MISSING_MFA_ENROLLMENT_ID" /* MISSING_MFA_ENROLLMENT_ID */]: "missing-multi-factor-info" /* MISSING_MFA_INFO */,
        ["MISSING_MFA_PENDING_CREDENTIAL" /* MISSING_MFA_PENDING_CREDENTIAL */]: "missing-multi-factor-session" /* MISSING_MFA_SESSION */,
        ["SECOND_FACTOR_EXISTS" /* SECOND_FACTOR_EXISTS */]: "second-factor-already-in-use" /* SECOND_FACTOR_ALREADY_ENROLLED */,
        ["SECOND_FACTOR_LIMIT_EXCEEDED" /* SECOND_FACTOR_LIMIT_EXCEEDED */]: "maximum-second-factor-count-exceeded" /* SECOND_FACTOR_LIMIT_EXCEEDED */,
        // Blocking functions related errors.
        ["BLOCKING_FUNCTION_ERROR_RESPONSE" /* BLOCKING_FUNCTION_ERROR_RESPONSE */]: "internal-error" /* INTERNAL_ERROR */,
    };

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
    const DEFAULT_API_TIMEOUT_MS = new Delay(30000, 60000);
    function _addTidIfNecessary(auth, request) {
        if (auth.tenantId && !request.tenantId) {
            return Object.assign(Object.assign({}, request), { tenantId: auth.tenantId });
        }
        return request;
    }
    async function _performApiRequest(auth, method, path, request, customErrorMap = {}) {
        return _performFetchWithErrorHandling(auth, customErrorMap, async () => {
            let body = {};
            let params = {};
            if (request) {
                if (method === "GET" /* GET */) {
                    params = request;
                }
                else {
                    body = {
                        body: JSON.stringify(request)
                    };
                }
            }
            const query = querystring(Object.assign({ key: auth.config.apiKey }, params)).slice(1);
            const headers = await auth._getAdditionalHeaders();
            headers["Content-Type" /* CONTENT_TYPE */] = 'application/json';
            if (auth.languageCode) {
                headers["X-Firebase-Locale" /* X_FIREBASE_LOCALE */] = auth.languageCode;
            }
            return FetchProvider.fetch()(_getFinalTarget(auth, auth.config.apiHost, path, query), Object.assign({ method,
                headers, referrerPolicy: 'no-referrer' }, body));
        });
    }
    async function _performFetchWithErrorHandling(auth, customErrorMap, fetchFn) {
        auth._canInitEmulator = false;
        const errorMap = Object.assign(Object.assign({}, SERVER_ERROR_MAP), customErrorMap);
        try {
            const networkTimeout = new NetworkTimeout(auth);
            const response = await Promise.race([
                fetchFn(),
                networkTimeout.promise
            ]);
            // If we've reached this point, the fetch succeeded and the networkTimeout
            // didn't throw; clear the network timeout delay so that Node won't hang
            networkTimeout.clearNetworkTimeout();
            const json = await response.json();
            if ('needConfirmation' in json) {
                throw _makeTaggedError(auth, "account-exists-with-different-credential" /* NEED_CONFIRMATION */, json);
            }
            if (response.ok && !('errorMessage' in json)) {
                return json;
            }
            else {
                const errorMessage = response.ok ? json.errorMessage : json.error.message;
                const [serverErrorCode, serverErrorMessage] = errorMessage.split(' : ');
                if (serverErrorCode === "FEDERATED_USER_ID_ALREADY_LINKED" /* FEDERATED_USER_ID_ALREADY_LINKED */) {
                    throw _makeTaggedError(auth, "credential-already-in-use" /* CREDENTIAL_ALREADY_IN_USE */, json);
                }
                else if (serverErrorCode === "EMAIL_EXISTS" /* EMAIL_EXISTS */) {
                    throw _makeTaggedError(auth, "email-already-in-use" /* EMAIL_EXISTS */, json);
                }
                const authError = errorMap[serverErrorCode] ||
                    serverErrorCode
                        .toLowerCase()
                        .replace(/[_\s]+/g, '-');
                if (serverErrorMessage) {
                    throw _errorWithCustomMessage(auth, authError, serverErrorMessage);
                }
                else {
                    _fail(auth, authError);
                }
            }
        }
        catch (e) {
            if (e instanceof FirebaseError) {
                throw e;
            }
            _fail(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */);
        }
    }
    async function _performSignInRequest(auth, method, path, request, customErrorMap = {}) {
        const serverResponse = (await _performApiRequest(auth, method, path, request, customErrorMap));
        if ('mfaPendingCredential' in serverResponse) {
            _fail(auth, "multi-factor-auth-required" /* MFA_REQUIRED */, {
                _serverResponse: serverResponse
            });
        }
        return serverResponse;
    }
    function _getFinalTarget(auth, host, path, query) {
        const base = `${host}${path}?${query}`;
        if (!auth.config.emulator) {
            return `${auth.config.apiScheme}://${base}`;
        }
        return _emulatorUrl(auth.config, base);
    }
    class NetworkTimeout {
        constructor(auth) {
            this.auth = auth;
            // Node timers and browser timers are fundamentally incompatible, but we
            // don't care about the value here
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.timer = null;
            this.promise = new Promise((_, reject) => {
                this.timer = setTimeout(() => {
                    return reject(_createError(this.auth, "timeout" /* TIMEOUT */));
                }, DEFAULT_API_TIMEOUT_MS.get());
            });
        }
        clearNetworkTimeout() {
            clearTimeout(this.timer);
        }
    }
    function _makeTaggedError(auth, code, response) {
        const errorParams = {
            appName: auth.name
        };
        if (response.email) {
            errorParams.email = response.email;
        }
        if (response.phoneNumber) {
            errorParams.phoneNumber = response.phoneNumber;
        }
        const error = _createError(auth, code, errorParams);
        // We know customData is defined on error because errorParams is defined
        error.customData._tokenResponse = response;
        return error;
    }

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
    async function deleteAccount(auth, request) {
        return _performApiRequest(auth, "POST" /* POST */, "/v1/accounts:delete" /* DELETE_ACCOUNT */, request);
    }
    async function getAccountInfo(auth, request) {
        return _performApiRequest(auth, "POST" /* POST */, "/v1/accounts:lookup" /* GET_ACCOUNT_INFO */, request);
    }

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
    function utcTimestampToDateString(utcTimestamp) {
        if (!utcTimestamp) {
            return undefined;
        }
        try {
            // Convert to date object.
            const date = new Date(Number(utcTimestamp));
            // Test date is valid.
            if (!isNaN(date.getTime())) {
                // Convert to UTC date string.
                return date.toUTCString();
            }
        }
        catch (e) {
            // Do nothing. undefined will be returned.
        }
        return undefined;
    }
    /**
     * Returns a deserialized JSON Web Token (JWT) used to identitfy the user to a Firebase service.
     *
     * @remarks
     * Returns the current token if it has not expired or if it will not expire in the next five
     * minutes. Otherwise, this will refresh the token and return a new one.
     *
     * @param user - The user.
     * @param forceRefresh - Force refresh regardless of token expiration.
     *
     * @public
     */
    async function getIdTokenResult(user, forceRefresh = false) {
        const userInternal = getModularInstance(user);
        const token = await userInternal.getIdToken(forceRefresh);
        const claims = _parseToken(token);
        _assert(claims && claims.exp && claims.auth_time && claims.iat, userInternal.auth, "internal-error" /* INTERNAL_ERROR */);
        const firebase = typeof claims.firebase === 'object' ? claims.firebase : undefined;
        const signInProvider = firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_provider'];
        return {
            claims,
            token,
            authTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.auth_time)),
            issuedAtTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.iat)),
            expirationTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.exp)),
            signInProvider: signInProvider || null,
            signInSecondFactor: (firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_second_factor']) || null
        };
    }
    function secondsStringToMilliseconds(seconds) {
        return Number(seconds) * 1000;
    }
    function _parseToken(token) {
        const [algorithm, payload, signature] = token.split('.');
        if (algorithm === undefined ||
            payload === undefined ||
            signature === undefined) {
            _logError('JWT malformed, contained fewer than 3 sections');
            return null;
        }
        try {
            const decoded = base64Decode(payload);
            if (!decoded) {
                _logError('Failed to decode base64 JWT payload');
                return null;
            }
            return JSON.parse(decoded);
        }
        catch (e) {
            _logError('Caught error parsing JWT payload as JSON', e);
            return null;
        }
    }
    /**
     * Extract expiresIn TTL from a token by subtracting the expiration from the issuance.
     */
    function _tokenExpiresIn(token) {
        const parsedToken = _parseToken(token);
        _assert(parsedToken, "internal-error" /* INTERNAL_ERROR */);
        _assert(typeof parsedToken.exp !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
        _assert(typeof parsedToken.iat !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
        return Number(parsedToken.exp) - Number(parsedToken.iat);
    }

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
    async function _logoutIfInvalidated(user, promise, bypassAuthState = false) {
        if (bypassAuthState) {
            return promise;
        }
        try {
            return await promise;
        }
        catch (e) {
            if (e instanceof FirebaseError && isUserInvalidated(e)) {
                if (user.auth.currentUser === user) {
                    await user.auth.signOut();
                }
            }
            throw e;
        }
    }
    function isUserInvalidated({ code }) {
        return (code === `auth/${"user-disabled" /* USER_DISABLED */}` ||
            code === `auth/${"user-token-expired" /* TOKEN_EXPIRED */}`);
    }

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
    class ProactiveRefresh {
        constructor(user) {
            this.user = user;
            this.isRunning = false;
            // Node timers and browser timers return fundamentally different types.
            // We don't actually care what the value is but TS won't accept unknown and
            // we can't cast properly in both environments.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.timerId = null;
            this.errorBackoff = 30000 /* RETRY_BACKOFF_MIN */;
        }
        _start() {
            if (this.isRunning) {
                return;
            }
            this.isRunning = true;
            this.schedule();
        }
        _stop() {
            if (!this.isRunning) {
                return;
            }
            this.isRunning = false;
            if (this.timerId !== null) {
                clearTimeout(this.timerId);
            }
        }
        getInterval(wasError) {
            var _a;
            if (wasError) {
                const interval = this.errorBackoff;
                this.errorBackoff = Math.min(this.errorBackoff * 2, 960000 /* RETRY_BACKOFF_MAX */);
                return interval;
            }
            else {
                // Reset the error backoff
                this.errorBackoff = 30000 /* RETRY_BACKOFF_MIN */;
                const expTime = (_a = this.user.stsTokenManager.expirationTime) !== null && _a !== void 0 ? _a : 0;
                const interval = expTime - Date.now() - 300000 /* OFFSET */;
                return Math.max(0, interval);
            }
        }
        schedule(wasError = false) {
            if (!this.isRunning) {
                // Just in case...
                return;
            }
            const interval = this.getInterval(wasError);
            this.timerId = setTimeout(async () => {
                await this.iteration();
            }, interval);
        }
        async iteration() {
            try {
                await this.user.getIdToken(true);
            }
            catch (e) {
                // Only retry on network errors
                if (e.code === `auth/${"network-request-failed" /* NETWORK_REQUEST_FAILED */}`) {
                    this.schedule(/* wasError */ true);
                }
                return;
            }
            this.schedule();
        }
    }

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
    class UserMetadata {
        constructor(createdAt, lastLoginAt) {
            this.createdAt = createdAt;
            this.lastLoginAt = lastLoginAt;
            this._initializeTime();
        }
        _initializeTime() {
            this.lastSignInTime = utcTimestampToDateString(this.lastLoginAt);
            this.creationTime = utcTimestampToDateString(this.createdAt);
        }
        _copy(metadata) {
            this.createdAt = metadata.createdAt;
            this.lastLoginAt = metadata.lastLoginAt;
            this._initializeTime();
        }
        toJSON() {
            return {
                createdAt: this.createdAt,
                lastLoginAt: this.lastLoginAt
            };
        }
    }

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
    async function _reloadWithoutSaving(user) {
        var _a;
        const auth = user.auth;
        const idToken = await user.getIdToken();
        const response = await _logoutIfInvalidated(user, getAccountInfo(auth, { idToken }));
        _assert(response === null || response === void 0 ? void 0 : response.users.length, auth, "internal-error" /* INTERNAL_ERROR */);
        const coreAccount = response.users[0];
        user._notifyReloadListener(coreAccount);
        const newProviderData = ((_a = coreAccount.providerUserInfo) === null || _a === void 0 ? void 0 : _a.length)
            ? extractProviderData(coreAccount.providerUserInfo)
            : [];
        const providerData = mergeProviderData(user.providerData, newProviderData);
        // Preserves the non-nonymous status of the stored user, even if no more
        // credentials (federated or email/password) are linked to the user. If
        // the user was previously anonymous, then use provider data to update.
        // On the other hand, if it was not anonymous before, it should never be
        // considered anonymous now.
        const oldIsAnonymous = user.isAnonymous;
        const newIsAnonymous = !(user.email && coreAccount.passwordHash) && !(providerData === null || providerData === void 0 ? void 0 : providerData.length);
        const isAnonymous = !oldIsAnonymous ? false : newIsAnonymous;
        const updates = {
            uid: coreAccount.localId,
            displayName: coreAccount.displayName || null,
            photoURL: coreAccount.photoUrl || null,
            email: coreAccount.email || null,
            emailVerified: coreAccount.emailVerified || false,
            phoneNumber: coreAccount.phoneNumber || null,
            tenantId: coreAccount.tenantId || null,
            providerData,
            metadata: new UserMetadata(coreAccount.createdAt, coreAccount.lastLoginAt),
            isAnonymous
        };
        Object.assign(user, updates);
    }
    /**
     * Reloads user account data, if signed in.
     *
     * @param user - The user.
     *
     * @public
     */
    async function reload(user) {
        const userInternal = getModularInstance(user);
        await _reloadWithoutSaving(userInternal);
        // Even though the current user hasn't changed, update
        // current user will trigger a persistence update w/ the
        // new info.
        await userInternal.auth._persistUserIfCurrent(userInternal);
        userInternal.auth._notifyListenersIfCurrent(userInternal);
    }
    function mergeProviderData(original, newData) {
        const deduped = original.filter(o => !newData.some(n => n.providerId === o.providerId));
        return [...deduped, ...newData];
    }
    function extractProviderData(providers) {
        return providers.map((_a) => {
            var { providerId } = _a, provider = __rest(_a, ["providerId"]);
            return {
                providerId,
                uid: provider.rawId || '',
                displayName: provider.displayName || null,
                email: provider.email || null,
                phoneNumber: provider.phoneNumber || null,
                photoURL: provider.photoUrl || null
            };
        });
    }

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
    async function requestStsToken(auth, refreshToken) {
        const response = await _performFetchWithErrorHandling(auth, {}, async () => {
            const body = querystring({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }).slice(1);
            const { tokenApiHost, apiKey } = auth.config;
            const url = _getFinalTarget(auth, tokenApiHost, "/v1/token" /* TOKEN */, `key=${apiKey}`);
            const headers = await auth._getAdditionalHeaders();
            headers["Content-Type" /* CONTENT_TYPE */] = 'application/x-www-form-urlencoded';
            return FetchProvider.fetch()(url, {
                method: "POST" /* POST */,
                headers,
                body
            });
        });
        // The response comes back in snake_case. Convert to camel:
        return {
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            refreshToken: response.refresh_token
        };
    }

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
     * We need to mark this class as internal explicitly to exclude it in the public typings, because
     * it references AuthInternal which has a circular dependency with UserInternal.
     *
     * @internal
     */
    class StsTokenManager {
        constructor() {
            this.refreshToken = null;
            this.accessToken = null;
            this.expirationTime = null;
        }
        get isExpired() {
            return (!this.expirationTime ||
                Date.now() > this.expirationTime - 30000 /* TOKEN_REFRESH */);
        }
        updateFromServerResponse(response) {
            _assert(response.idToken, "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof response.idToken !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof response.refreshToken !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
            const expiresIn = 'expiresIn' in response && typeof response.expiresIn !== 'undefined'
                ? Number(response.expiresIn)
                : _tokenExpiresIn(response.idToken);
            this.updateTokensAndExpiration(response.idToken, response.refreshToken, expiresIn);
        }
        async getToken(auth, forceRefresh = false) {
            _assert(!this.accessToken || this.refreshToken, auth, "user-token-expired" /* TOKEN_EXPIRED */);
            if (!forceRefresh && this.accessToken && !this.isExpired) {
                return this.accessToken;
            }
            if (this.refreshToken) {
                await this.refresh(auth, this.refreshToken);
                return this.accessToken;
            }
            return null;
        }
        clearRefreshToken() {
            this.refreshToken = null;
        }
        async refresh(auth, oldToken) {
            const { accessToken, refreshToken, expiresIn } = await requestStsToken(auth, oldToken);
            this.updateTokensAndExpiration(accessToken, refreshToken, Number(expiresIn));
        }
        updateTokensAndExpiration(accessToken, refreshToken, expiresInSec) {
            this.refreshToken = refreshToken || null;
            this.accessToken = accessToken || null;
            this.expirationTime = Date.now() + expiresInSec * 1000;
        }
        static fromJSON(appName, object) {
            const { refreshToken, accessToken, expirationTime } = object;
            const manager = new StsTokenManager();
            if (refreshToken) {
                _assert(typeof refreshToken === 'string', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.refreshToken = refreshToken;
            }
            if (accessToken) {
                _assert(typeof accessToken === 'string', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.accessToken = accessToken;
            }
            if (expirationTime) {
                _assert(typeof expirationTime === 'number', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.expirationTime = expirationTime;
            }
            return manager;
        }
        toJSON() {
            return {
                refreshToken: this.refreshToken,
                accessToken: this.accessToken,
                expirationTime: this.expirationTime
            };
        }
        _assign(stsTokenManager) {
            this.accessToken = stsTokenManager.accessToken;
            this.refreshToken = stsTokenManager.refreshToken;
            this.expirationTime = stsTokenManager.expirationTime;
        }
        _clone() {
            return Object.assign(new StsTokenManager(), this.toJSON());
        }
        _performRefresh() {
            return debugFail('not implemented');
        }
    }

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
    function assertStringOrUndefined(assertion, appName) {
        _assert(typeof assertion === 'string' || typeof assertion === 'undefined', "internal-error" /* INTERNAL_ERROR */, { appName });
    }
    class UserImpl {
        constructor(_a) {
            var { uid, auth, stsTokenManager } = _a, opt = __rest(_a, ["uid", "auth", "stsTokenManager"]);
            // For the user object, provider is always Firebase.
            this.providerId = "firebase" /* FIREBASE */;
            this.emailVerified = false;
            this.isAnonymous = false;
            this.tenantId = null;
            this.providerData = [];
            this.proactiveRefresh = new ProactiveRefresh(this);
            this.reloadUserInfo = null;
            this.reloadListener = null;
            this.uid = uid;
            this.auth = auth;
            this.stsTokenManager = stsTokenManager;
            this.accessToken = stsTokenManager.accessToken;
            this.displayName = opt.displayName || null;
            this.email = opt.email || null;
            this.emailVerified = opt.emailVerified || false;
            this.phoneNumber = opt.phoneNumber || null;
            this.photoURL = opt.photoURL || null;
            this.isAnonymous = opt.isAnonymous || false;
            this.tenantId = opt.tenantId || null;
            this.metadata = new UserMetadata(opt.createdAt || undefined, opt.lastLoginAt || undefined);
        }
        async getIdToken(forceRefresh) {
            const accessToken = await _logoutIfInvalidated(this, this.stsTokenManager.getToken(this.auth, forceRefresh));
            _assert(accessToken, this.auth, "internal-error" /* INTERNAL_ERROR */);
            if (this.accessToken !== accessToken) {
                this.accessToken = accessToken;
                await this.auth._persistUserIfCurrent(this);
                this.auth._notifyListenersIfCurrent(this);
            }
            return accessToken;
        }
        getIdTokenResult(forceRefresh) {
            return getIdTokenResult(this, forceRefresh);
        }
        reload() {
            return reload(this);
        }
        _assign(user) {
            if (this === user) {
                return;
            }
            _assert(this.uid === user.uid, this.auth, "internal-error" /* INTERNAL_ERROR */);
            this.displayName = user.displayName;
            this.photoURL = user.photoURL;
            this.email = user.email;
            this.emailVerified = user.emailVerified;
            this.phoneNumber = user.phoneNumber;
            this.isAnonymous = user.isAnonymous;
            this.tenantId = user.tenantId;
            this.providerData = user.providerData.map(userInfo => (Object.assign({}, userInfo)));
            this.metadata._copy(user.metadata);
            this.stsTokenManager._assign(user.stsTokenManager);
        }
        _clone(auth) {
            return new UserImpl(Object.assign(Object.assign({}, this), { auth, stsTokenManager: this.stsTokenManager._clone() }));
        }
        _onReload(callback) {
            // There should only ever be one listener, and that is a single instance of MultiFactorUser
            _assert(!this.reloadListener, this.auth, "internal-error" /* INTERNAL_ERROR */);
            this.reloadListener = callback;
            if (this.reloadUserInfo) {
                this._notifyReloadListener(this.reloadUserInfo);
                this.reloadUserInfo = null;
            }
        }
        _notifyReloadListener(userInfo) {
            if (this.reloadListener) {
                this.reloadListener(userInfo);
            }
            else {
                // If no listener is subscribed yet, save the result so it's available when they do subscribe
                this.reloadUserInfo = userInfo;
            }
        }
        _startProactiveRefresh() {
            this.proactiveRefresh._start();
        }
        _stopProactiveRefresh() {
            this.proactiveRefresh._stop();
        }
        async _updateTokensIfNecessary(response, reload = false) {
            let tokensRefreshed = false;
            if (response.idToken &&
                response.idToken !== this.stsTokenManager.accessToken) {
                this.stsTokenManager.updateFromServerResponse(response);
                tokensRefreshed = true;
            }
            if (reload) {
                await _reloadWithoutSaving(this);
            }
            await this.auth._persistUserIfCurrent(this);
            if (tokensRefreshed) {
                this.auth._notifyListenersIfCurrent(this);
            }
        }
        async delete() {
            const idToken = await this.getIdToken();
            await _logoutIfInvalidated(this, deleteAccount(this.auth, { idToken }));
            this.stsTokenManager.clearRefreshToken();
            // TODO: Determine if cancellable-promises are necessary to use in this class so that delete()
            //       cancels pending actions...
            return this.auth.signOut();
        }
        toJSON() {
            return Object.assign(Object.assign({ uid: this.uid, email: this.email || undefined, emailVerified: this.emailVerified, displayName: this.displayName || undefined, isAnonymous: this.isAnonymous, photoURL: this.photoURL || undefined, phoneNumber: this.phoneNumber || undefined, tenantId: this.tenantId || undefined, providerData: this.providerData.map(userInfo => (Object.assign({}, userInfo))), stsTokenManager: this.stsTokenManager.toJSON(), 
                // Redirect event ID must be maintained in case there is a pending
                // redirect event.
                _redirectEventId: this._redirectEventId }, this.metadata.toJSON()), { 
                // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
                apiKey: this.auth.config.apiKey, appName: this.auth.name });
        }
        get refreshToken() {
            return this.stsTokenManager.refreshToken || '';
        }
        static _fromJSON(auth, object) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const displayName = (_a = object.displayName) !== null && _a !== void 0 ? _a : undefined;
            const email = (_b = object.email) !== null && _b !== void 0 ? _b : undefined;
            const phoneNumber = (_c = object.phoneNumber) !== null && _c !== void 0 ? _c : undefined;
            const photoURL = (_d = object.photoURL) !== null && _d !== void 0 ? _d : undefined;
            const tenantId = (_e = object.tenantId) !== null && _e !== void 0 ? _e : undefined;
            const _redirectEventId = (_f = object._redirectEventId) !== null && _f !== void 0 ? _f : undefined;
            const createdAt = (_g = object.createdAt) !== null && _g !== void 0 ? _g : undefined;
            const lastLoginAt = (_h = object.lastLoginAt) !== null && _h !== void 0 ? _h : undefined;
            const { uid, emailVerified, isAnonymous, providerData, stsTokenManager: plainObjectTokenManager } = object;
            _assert(uid && plainObjectTokenManager, auth, "internal-error" /* INTERNAL_ERROR */);
            const stsTokenManager = StsTokenManager.fromJSON(this.name, plainObjectTokenManager);
            _assert(typeof uid === 'string', auth, "internal-error" /* INTERNAL_ERROR */);
            assertStringOrUndefined(displayName, auth.name);
            assertStringOrUndefined(email, auth.name);
            _assert(typeof emailVerified === 'boolean', auth, "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof isAnonymous === 'boolean', auth, "internal-error" /* INTERNAL_ERROR */);
            assertStringOrUndefined(phoneNumber, auth.name);
            assertStringOrUndefined(photoURL, auth.name);
            assertStringOrUndefined(tenantId, auth.name);
            assertStringOrUndefined(_redirectEventId, auth.name);
            assertStringOrUndefined(createdAt, auth.name);
            assertStringOrUndefined(lastLoginAt, auth.name);
            const user = new UserImpl({
                uid,
                auth,
                email,
                emailVerified,
                displayName,
                isAnonymous,
                photoURL,
                phoneNumber,
                tenantId,
                stsTokenManager,
                createdAt,
                lastLoginAt
            });
            if (providerData && Array.isArray(providerData)) {
                user.providerData = providerData.map(userInfo => (Object.assign({}, userInfo)));
            }
            if (_redirectEventId) {
                user._redirectEventId = _redirectEventId;
            }
            return user;
        }
        /**
         * Initialize a User from an idToken server response
         * @param auth
         * @param idTokenResponse
         */
        static async _fromIdTokenResponse(auth, idTokenResponse, isAnonymous = false) {
            const stsTokenManager = new StsTokenManager();
            stsTokenManager.updateFromServerResponse(idTokenResponse);
            // Initialize the Firebase Auth user.
            const user = new UserImpl({
                uid: idTokenResponse.localId,
                auth,
                stsTokenManager,
                isAnonymous
            });
            // Updates the user info and data and resolves with a user instance.
            await _reloadWithoutSaving(user);
            return user;
        }
    }

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
    class InMemoryPersistence {
        constructor() {
            this.type = "NONE" /* NONE */;
            this.storage = {};
        }
        async _isAvailable() {
            return true;
        }
        async _set(key, value) {
            this.storage[key] = value;
        }
        async _get(key) {
            const value = this.storage[key];
            return value === undefined ? null : value;
        }
        async _remove(key) {
            delete this.storage[key];
        }
        _addListener(_key, _listener) {
            // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
            return;
        }
        _removeListener(_key, _listener) {
            // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
            return;
        }
    }
    InMemoryPersistence.type = 'NONE';
    /**
     * An implementation of {@link Persistence} of type 'NONE'.
     *
     * @public
     */
    const inMemoryPersistence = InMemoryPersistence;

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
    function _persistenceKeyName(key, apiKey, appName) {
        return `${"firebase" /* PERSISTENCE */}:${key}:${apiKey}:${appName}`;
    }
    class PersistenceUserManager {
        constructor(persistence, auth, userKey) {
            this.persistence = persistence;
            this.auth = auth;
            this.userKey = userKey;
            const { config, name } = this.auth;
            this.fullUserKey = _persistenceKeyName(this.userKey, config.apiKey, name);
            this.fullPersistenceKey = _persistenceKeyName("persistence" /* PERSISTENCE_USER */, config.apiKey, name);
            this.boundEventHandler = auth._onStorageEvent.bind(auth);
            this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
        }
        setCurrentUser(user) {
            return this.persistence._set(this.fullUserKey, user.toJSON());
        }
        async getCurrentUser() {
            const blob = await this.persistence._get(this.fullUserKey);
            return blob ? UserImpl._fromJSON(this.auth, blob) : null;
        }
        removeCurrentUser() {
            return this.persistence._remove(this.fullUserKey);
        }
        savePersistenceForRedirect() {
            return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
        }
        async setPersistence(newPersistence) {
            if (this.persistence === newPersistence) {
                return;
            }
            const currentUser = await this.getCurrentUser();
            await this.removeCurrentUser();
            this.persistence = newPersistence;
            if (currentUser) {
                return this.setCurrentUser(currentUser);
            }
        }
        delete() {
            this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
        }
        static async create(auth, persistenceHierarchy, userKey = "authUser" /* AUTH_USER */) {
            if (!persistenceHierarchy.length) {
                return new PersistenceUserManager(_getInstance(inMemoryPersistence), auth, userKey);
            }
            // Eliminate any persistences that are not available
            const availablePersistences = (await Promise.all(persistenceHierarchy.map(async (persistence) => {
                if (await persistence._isAvailable()) {
                    return persistence;
                }
                return undefined;
            }))).filter(persistence => persistence);
            // Fall back to the first persistence listed, or in memory if none available
            let selectedPersistence = availablePersistences[0] ||
                _getInstance(inMemoryPersistence);
            const key = _persistenceKeyName(userKey, auth.config.apiKey, auth.name);
            // Pull out the existing user, setting the chosen persistence to that
            // persistence if the user exists.
            let userToMigrate = null;
            // Note, here we check for a user in _all_ persistences, not just the
            // ones deemed available. If we can migrate a user out of a broken
            // persistence, we will (but only if that persistence supports migration).
            for (const persistence of persistenceHierarchy) {
                try {
                    const blob = await persistence._get(key);
                    if (blob) {
                        const user = UserImpl._fromJSON(auth, blob); // throws for unparsable blob (wrong format)
                        if (persistence !== selectedPersistence) {
                            userToMigrate = user;
                        }
                        selectedPersistence = persistence;
                        break;
                    }
                }
                catch (_a) { }
            }
            // If we find the user in a persistence that does support migration, use
            // that migration path (of only persistences that support migration)
            const migrationHierarchy = availablePersistences.filter(p => p._shouldAllowMigration);
            // If the persistence does _not_ allow migration, just finish off here
            if (!selectedPersistence._shouldAllowMigration ||
                !migrationHierarchy.length) {
                return new PersistenceUserManager(selectedPersistence, auth, userKey);
            }
            selectedPersistence = migrationHierarchy[0];
            if (userToMigrate) {
                // This normally shouldn't throw since chosenPersistence.isAvailable() is true, but if it does
                // we'll just let it bubble to surface the error.
                await selectedPersistence._set(key, userToMigrate.toJSON());
            }
            // Attempt to clear the key in other persistences but ignore errors. This helps prevent issues
            // such as users getting stuck with a previous account after signing out and refreshing the tab.
            await Promise.all(persistenceHierarchy.map(async (persistence) => {
                if (persistence !== selectedPersistence) {
                    try {
                        await persistence._remove(key);
                    }
                    catch (_a) { }
                }
            }));
            return new PersistenceUserManager(selectedPersistence, auth, userKey);
        }
    }

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
     * Determine the browser for the purposes of reporting usage to the API
     */
    function _getBrowserName(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('opera/') || ua.includes('opr/') || ua.includes('opios/')) {
            return "Opera" /* OPERA */;
        }
        else if (_isIEMobile(ua)) {
            // Windows phone IEMobile browser.
            return "IEMobile" /* IEMOBILE */;
        }
        else if (ua.includes('msie') || ua.includes('trident/')) {
            return "IE" /* IE */;
        }
        else if (ua.includes('edge/')) {
            return "Edge" /* EDGE */;
        }
        else if (_isFirefox(ua)) {
            return "Firefox" /* FIREFOX */;
        }
        else if (ua.includes('silk/')) {
            return "Silk" /* SILK */;
        }
        else if (_isBlackBerry(ua)) {
            // Blackberry browser.
            return "Blackberry" /* BLACKBERRY */;
        }
        else if (_isWebOS(ua)) {
            // WebOS default browser.
            return "Webos" /* WEBOS */;
        }
        else if (_isSafari(ua)) {
            return "Safari" /* SAFARI */;
        }
        else if ((ua.includes('chrome/') || _isChromeIOS(ua)) &&
            !ua.includes('edge/')) {
            return "Chrome" /* CHROME */;
        }
        else if (_isAndroid(ua)) {
            // Android stock browser.
            return "Android" /* ANDROID */;
        }
        else {
            // Most modern browsers have name/version at end of user agent string.
            const re = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/;
            const matches = userAgent.match(re);
            if ((matches === null || matches === void 0 ? void 0 : matches.length) === 2) {
                return matches[1];
            }
        }
        return "Other" /* OTHER */;
    }
    function _isFirefox(ua = getUA()) {
        return /firefox\//i.test(ua);
    }
    function _isSafari(userAgent = getUA()) {
        const ua = userAgent.toLowerCase();
        return (ua.includes('safari/') &&
            !ua.includes('chrome/') &&
            !ua.includes('crios/') &&
            !ua.includes('android'));
    }
    function _isChromeIOS(ua = getUA()) {
        return /crios\//i.test(ua);
    }
    function _isIEMobile(ua = getUA()) {
        return /iemobile/i.test(ua);
    }
    function _isAndroid(ua = getUA()) {
        return /android/i.test(ua);
    }
    function _isBlackBerry(ua = getUA()) {
        return /blackberry/i.test(ua);
    }
    function _isWebOS(ua = getUA()) {
        return /webos/i.test(ua);
    }
    function _isIOS(ua = getUA()) {
        return /iphone|ipad|ipod/i.test(ua);
    }
    function _isIOSStandalone(ua = getUA()) {
        var _a;
        return _isIOS(ua) && !!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.standalone);
    }
    function _isIE10() {
        return isIE() && document.documentMode === 10;
    }
    function _isMobileBrowser(ua = getUA()) {
        // TODO: implement getBrowserName equivalent for OS.
        return (_isIOS(ua) ||
            _isAndroid(ua) ||
            _isWebOS(ua) ||
            _isBlackBerry(ua) ||
            /windows phone/i.test(ua) ||
            _isIEMobile(ua));
    }
    function _isIframe() {
        try {
            // Check that the current window is not the top window.
            // If so, return true.
            return !!(window && window !== window.top);
        }
        catch (e) {
            return false;
        }
    }

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
    /*
     * Determine the SDK version string
     */
    function _getClientVersion(clientPlatform, frameworks = []) {
        let reportedPlatform;
        switch (clientPlatform) {
            case "Browser" /* BROWSER */:
                // In a browser environment, report the browser name.
                reportedPlatform = _getBrowserName(getUA());
                break;
            case "Worker" /* WORKER */:
                // Technically a worker runs from a browser but we need to differentiate a
                // worker from a browser.
                // For example: Chrome-Worker/JsCore/4.9.1/FirebaseCore-web.
                reportedPlatform = `${_getBrowserName(getUA())}-${clientPlatform}`;
                break;
            default:
                reportedPlatform = clientPlatform;
        }
        const reportedFrameworks = frameworks.length
            ? frameworks.join(',')
            : 'FirebaseCore-web'; /* default value if no other framework is used */
        return `${reportedPlatform}/${"JsCore" /* CORE */}/${SDK_VERSION$1}/${reportedFrameworks}`;
    }

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
    class AuthImpl {
        constructor(app, config) {
            this.app = app;
            this.config = config;
            this.currentUser = null;
            this.emulatorConfig = null;
            this.operations = Promise.resolve();
            this.authStateSubscription = new Subscription(this);
            this.idTokenSubscription = new Subscription(this);
            this.redirectUser = null;
            this.isProactiveRefreshEnabled = false;
            // Any network calls will set this to true and prevent subsequent emulator
            // initialization
            this._canInitEmulator = true;
            this._isInitialized = false;
            this._deleted = false;
            this._initializationPromise = null;
            this._popupRedirectResolver = null;
            this._errorFactory = _DEFAULT_AUTH_ERROR_FACTORY;
            // Tracks the last notified UID for state change listeners to prevent
            // repeated calls to the callbacks. Undefined means it's never been
            // called, whereas null means it's been called with a signed out user
            this.lastNotifiedUid = undefined;
            this.languageCode = null;
            this.tenantId = null;
            this.settings = { appVerificationDisabledForTesting: false };
            this.frameworks = [];
            this.name = app.name;
            this.clientVersion = config.sdkClientVersion;
        }
        _initializeWithPersistence(persistenceHierarchy, popupRedirectResolver) {
            if (popupRedirectResolver) {
                this._popupRedirectResolver = _getInstance(popupRedirectResolver);
            }
            // Have to check for app deletion throughout initialization (after each
            // promise resolution)
            this._initializationPromise = this.queue(async () => {
                var _a, _b;
                if (this._deleted) {
                    return;
                }
                this.persistenceManager = await PersistenceUserManager.create(this, persistenceHierarchy);
                if (this._deleted) {
                    return;
                }
                // Initialize the resolver early if necessary (only applicable to web:
                // this will cause the iframe to load immediately in certain cases)
                if ((_a = this._popupRedirectResolver) === null || _a === void 0 ? void 0 : _a._shouldInitProactively) {
                    // If this fails, don't halt auth loading
                    try {
                        await this._popupRedirectResolver._initialize(this);
                    }
                    catch (e) { /* Ignore the error */ }
                }
                await this.initializeCurrentUser(popupRedirectResolver);
                this.lastNotifiedUid = ((_b = this.currentUser) === null || _b === void 0 ? void 0 : _b.uid) || null;
                if (this._deleted) {
                    return;
                }
                this._isInitialized = true;
            });
            return this._initializationPromise;
        }
        /**
         * If the persistence is changed in another window, the user manager will let us know
         */
        async _onStorageEvent() {
            if (this._deleted) {
                return;
            }
            const user = await this.assertedPersistence.getCurrentUser();
            if (!this.currentUser && !user) {
                // No change, do nothing (was signed out and remained signed out).
                return;
            }
            // If the same user is to be synchronized.
            if (this.currentUser && user && this.currentUser.uid === user.uid) {
                // Data update, simply copy data changes.
                this._currentUser._assign(user);
                // If tokens changed from previous user tokens, this will trigger
                // notifyAuthListeners_.
                await this.currentUser.getIdToken();
                return;
            }
            // Update current Auth state. Either a new login or logout.
            await this._updateCurrentUser(user);
        }
        async initializeCurrentUser(popupRedirectResolver) {
            var _a;
            // First check to see if we have a pending redirect event.
            let storedUser = (await this.assertedPersistence.getCurrentUser());
            if (popupRedirectResolver && this.config.authDomain) {
                await this.getOrInitRedirectPersistenceManager();
                const redirectUserEventId = (_a = this.redirectUser) === null || _a === void 0 ? void 0 : _a._redirectEventId;
                const storedUserEventId = storedUser === null || storedUser === void 0 ? void 0 : storedUser._redirectEventId;
                const result = await this.tryRedirectSignIn(popupRedirectResolver);
                // If the stored user (i.e. the old "currentUser") has a redirectId that
                // matches the redirect user, then we want to initially sign in with the
                // new user object from result.
                // TODO(samgho): More thoroughly test all of this
                if ((!redirectUserEventId || redirectUserEventId === storedUserEventId) &&
                    (result === null || result === void 0 ? void 0 : result.user)) {
                    storedUser = result.user;
                }
            }
            // If no user in persistence, there is no current user. Set to null.
            if (!storedUser) {
                return this.directlySetCurrentUser(null);
            }
            if (!storedUser._redirectEventId) {
                // This isn't a redirect user, we can reload and bail
                // This will also catch the redirected user, if available, as that method
                // strips the _redirectEventId
                return this.reloadAndSetCurrentUserOrClear(storedUser);
            }
            _assert(this._popupRedirectResolver, this, "argument-error" /* ARGUMENT_ERROR */);
            await this.getOrInitRedirectPersistenceManager();
            // If the redirect user's event ID matches the current user's event ID,
            // DO NOT reload the current user, otherwise they'll be cleared from storage.
            // This is important for the reauthenticateWithRedirect() flow.
            if (this.redirectUser &&
                this.redirectUser._redirectEventId === storedUser._redirectEventId) {
                return this.directlySetCurrentUser(storedUser);
            }
            return this.reloadAndSetCurrentUserOrClear(storedUser);
        }
        async tryRedirectSignIn(redirectResolver) {
            // The redirect user needs to be checked (and signed in if available)
            // during auth initialization. All of the normal sign in and link/reauth
            // flows call back into auth and push things onto the promise queue. We
            // need to await the result of the redirect sign in *inside the promise
            // queue*. This presents a problem: we run into deadlock. See:
            //    ┌> [Initialization] ─────┐
            //    ┌> [<other queue tasks>] │
            //    └─ [getRedirectResult] <─┘
            //    where [] are tasks on the queue and arrows denote awaits
            // Initialization will never complete because it's waiting on something
            // that's waiting for initialization to complete!
            //
            // Instead, this method calls getRedirectResult() (stored in
            // _completeRedirectFn) with an optional parameter that instructs all of
            // the underlying auth operations to skip anything that mutates auth state.
            let result = null;
            try {
                // We know this._popupRedirectResolver is set since redirectResolver
                // is passed in. The _completeRedirectFn expects the unwrapped extern.
                result = await this._popupRedirectResolver._completeRedirectFn(this, redirectResolver, true);
            }
            catch (e) {
                // Swallow any errors here; the code can retrieve them in
                // getRedirectResult().
                await this._setRedirectUser(null);
            }
            return result;
        }
        async reloadAndSetCurrentUserOrClear(user) {
            try {
                await _reloadWithoutSaving(user);
            }
            catch (e) {
                if (e.code !== `auth/${"network-request-failed" /* NETWORK_REQUEST_FAILED */}`) {
                    // Something's wrong with the user's token. Log them out and remove
                    // them from storage
                    return this.directlySetCurrentUser(null);
                }
            }
            return this.directlySetCurrentUser(user);
        }
        useDeviceLanguage() {
            this.languageCode = _getUserLanguage();
        }
        async _delete() {
            this._deleted = true;
        }
        async updateCurrentUser(userExtern) {
            // The public updateCurrentUser method needs to make a copy of the user,
            // and also check that the project matches
            const user = userExtern
                ? getModularInstance(userExtern)
                : null;
            if (user) {
                _assert(user.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token" /* INVALID_AUTH */);
            }
            return this._updateCurrentUser(user && user._clone(this));
        }
        async _updateCurrentUser(user) {
            if (this._deleted) {
                return;
            }
            if (user) {
                _assert(this.tenantId === user.tenantId, this, "tenant-id-mismatch" /* TENANT_ID_MISMATCH */);
            }
            return this.queue(async () => {
                await this.directlySetCurrentUser(user);
                this.notifyAuthListeners();
            });
        }
        async signOut() {
            // Clear the redirect user when signOut is called
            if (this.redirectPersistenceManager || this._popupRedirectResolver) {
                await this._setRedirectUser(null);
            }
            return this._updateCurrentUser(null);
        }
        setPersistence(persistence) {
            return this.queue(async () => {
                await this.assertedPersistence.setPersistence(_getInstance(persistence));
            });
        }
        _getPersistence() {
            return this.assertedPersistence.persistence.type;
        }
        _updateErrorMap(errorMap) {
            this._errorFactory = new ErrorFactory('auth', 'Firebase', errorMap());
        }
        onAuthStateChanged(nextOrObserver, error, completed) {
            return this.registerStateListener(this.authStateSubscription, nextOrObserver, error, completed);
        }
        onIdTokenChanged(nextOrObserver, error, completed) {
            return this.registerStateListener(this.idTokenSubscription, nextOrObserver, error, completed);
        }
        toJSON() {
            var _a;
            return {
                apiKey: this.config.apiKey,
                authDomain: this.config.authDomain,
                appName: this.name,
                currentUser: (_a = this._currentUser) === null || _a === void 0 ? void 0 : _a.toJSON()
            };
        }
        async _setRedirectUser(user, popupRedirectResolver) {
            const redirectManager = await this.getOrInitRedirectPersistenceManager(popupRedirectResolver);
            return user === null
                ? redirectManager.removeCurrentUser()
                : redirectManager.setCurrentUser(user);
        }
        async getOrInitRedirectPersistenceManager(popupRedirectResolver) {
            if (!this.redirectPersistenceManager) {
                const resolver = (popupRedirectResolver && _getInstance(popupRedirectResolver)) ||
                    this._popupRedirectResolver;
                _assert(resolver, this, "argument-error" /* ARGUMENT_ERROR */);
                this.redirectPersistenceManager = await PersistenceUserManager.create(this, [_getInstance(resolver._redirectPersistence)], "redirectUser" /* REDIRECT_USER */);
                this.redirectUser =
                    await this.redirectPersistenceManager.getCurrentUser();
            }
            return this.redirectPersistenceManager;
        }
        async _redirectUserForId(id) {
            var _a, _b;
            // Make sure we've cleared any pending persistence actions if we're not in
            // the initializer
            if (this._isInitialized) {
                await this.queue(async () => { });
            }
            if (((_a = this._currentUser) === null || _a === void 0 ? void 0 : _a._redirectEventId) === id) {
                return this._currentUser;
            }
            if (((_b = this.redirectUser) === null || _b === void 0 ? void 0 : _b._redirectEventId) === id) {
                return this.redirectUser;
            }
            return null;
        }
        async _persistUserIfCurrent(user) {
            if (user === this.currentUser) {
                return this.queue(async () => this.directlySetCurrentUser(user));
            }
        }
        /** Notifies listeners only if the user is current */
        _notifyListenersIfCurrent(user) {
            if (user === this.currentUser) {
                this.notifyAuthListeners();
            }
        }
        _key() {
            return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
        }
        _startProactiveRefresh() {
            this.isProactiveRefreshEnabled = true;
            if (this.currentUser) {
                this._currentUser._startProactiveRefresh();
            }
        }
        _stopProactiveRefresh() {
            this.isProactiveRefreshEnabled = false;
            if (this.currentUser) {
                this._currentUser._stopProactiveRefresh();
            }
        }
        /** Returns the current user cast as the internal type */
        get _currentUser() {
            return this.currentUser;
        }
        notifyAuthListeners() {
            var _a, _b;
            if (!this._isInitialized) {
                return;
            }
            this.idTokenSubscription.next(this.currentUser);
            const currentUid = (_b = (_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : null;
            if (this.lastNotifiedUid !== currentUid) {
                this.lastNotifiedUid = currentUid;
                this.authStateSubscription.next(this.currentUser);
            }
        }
        registerStateListener(subscription, nextOrObserver, error, completed) {
            if (this._deleted) {
                return () => { };
            }
            const cb = typeof nextOrObserver === 'function'
                ? nextOrObserver
                : nextOrObserver.next.bind(nextOrObserver);
            const promise = this._isInitialized
                ? Promise.resolve()
                : this._initializationPromise;
            _assert(promise, this, "internal-error" /* INTERNAL_ERROR */);
            // The callback needs to be called asynchronously per the spec.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            promise.then(() => cb(this.currentUser));
            if (typeof nextOrObserver === 'function') {
                return subscription.addObserver(nextOrObserver, error, completed);
            }
            else {
                return subscription.addObserver(nextOrObserver);
            }
        }
        /**
         * Unprotected (from race conditions) method to set the current user. This
         * should only be called from within a queued callback. This is necessary
         * because the queue shouldn't rely on another queued callback.
         */
        async directlySetCurrentUser(user) {
            if (this.currentUser && this.currentUser !== user) {
                this._currentUser._stopProactiveRefresh();
                if (user && this.isProactiveRefreshEnabled) {
                    user._startProactiveRefresh();
                }
            }
            this.currentUser = user;
            if (user) {
                await this.assertedPersistence.setCurrentUser(user);
            }
            else {
                await this.assertedPersistence.removeCurrentUser();
            }
        }
        queue(action) {
            // In case something errors, the callback still should be called in order
            // to keep the promise chain alive
            this.operations = this.operations.then(action, action);
            return this.operations;
        }
        get assertedPersistence() {
            _assert(this.persistenceManager, this, "internal-error" /* INTERNAL_ERROR */);
            return this.persistenceManager;
        }
        _logFramework(framework) {
            if (!framework || this.frameworks.includes(framework)) {
                return;
            }
            this.frameworks.push(framework);
            // Sort alphabetically so that "FirebaseCore-web,FirebaseUI-web" and
            // "FirebaseUI-web,FirebaseCore-web" aren't viewed as different.
            this.frameworks.sort();
            this.clientVersion = _getClientVersion(this.config.clientPlatform, this._getFrameworks());
        }
        _getFrameworks() {
            return this.frameworks;
        }
        async _getAdditionalHeaders() {
            // Additional headers on every request
            const headers = {
                ["X-Client-Version" /* X_CLIENT_VERSION */]: this.clientVersion,
            };
            if (this.app.options.appId) {
                headers["X-Firebase-gmpid" /* X_FIREBASE_GMPID */] = this.app.options.appId;
            }
            return headers;
        }
    }
    /**
     * Method to be used to cast down to our private implmentation of Auth.
     * It will also handle unwrapping from the compat type if necessary
     *
     * @param auth Auth object passed in from developer
     */
    function _castAuth(auth) {
        return getModularInstance(auth);
    }
    /** Helper class to wrap subscriber logic */
    class Subscription {
        constructor(auth) {
            this.auth = auth;
            this.observer = null;
            this.addObserver = createSubscribe(observer => (this.observer = observer));
        }
        get next() {
            _assert(this.observer, this.auth, "internal-error" /* INTERNAL_ERROR */);
            return this.observer.next.bind(this.observer);
        }
    }

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
     * Interface that represents the credentials returned by an {@link AuthProvider}.
     *
     * @remarks
     * Implementations specify the details about each auth provider's credential requirements.
     *
     * @public
     */
    class AuthCredential {
        /** @internal */
        constructor(
        /**
         * The authentication provider ID for the credential.
         *
         * @remarks
         * For example, 'facebook.com', or 'google.com'.
         */
        providerId, 
        /**
         * The authentication sign in method for the credential.
         *
         * @remarks
         * For example, {@link SignInMethod}.EMAIL_PASSWORD, or
         * {@link SignInMethod}.EMAIL_LINK. This corresponds to the sign-in method
         * identifier as returned in {@link fetchSignInMethodsForEmail}.
         */
        signInMethod) {
            this.providerId = providerId;
            this.signInMethod = signInMethod;
        }
        /**
         * Returns a JSON-serializable representation of this object.
         *
         * @returns a JSON-serializable representation of this object.
         */
        toJSON() {
            return debugFail('not implemented');
        }
        /** @internal */
        _getIdTokenResponse(_auth) {
            return debugFail('not implemented');
        }
        /** @internal */
        _linkToIdToken(_auth, _idToken) {
            return debugFail('not implemented');
        }
        /** @internal */
        _getReauthenticationResolver(_auth) {
            return debugFail('not implemented');
        }
    }

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
    async function signInWithIdp(auth, request) {
        return _performSignInRequest(auth, "POST" /* POST */, "/v1/accounts:signInWithIdp" /* SIGN_IN_WITH_IDP */, _addTidIfNecessary(auth, request));
    }

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
    const IDP_REQUEST_URI$1 = 'http://localhost';
    /**
     * Represents the OAuth credentials returned by an {@link OAuthProvider}.
     *
     * @remarks
     * Implementations specify the details about each auth provider's credential requirements.
     *
     * @public
     */
    class OAuthCredential extends AuthCredential {
        constructor() {
            super(...arguments);
            this.pendingToken = null;
        }
        /** @internal */
        static _fromParams(params) {
            const cred = new OAuthCredential(params.providerId, params.signInMethod);
            if (params.idToken || params.accessToken) {
                // OAuth 2 and either ID token or access token.
                if (params.idToken) {
                    cred.idToken = params.idToken;
                }
                if (params.accessToken) {
                    cred.accessToken = params.accessToken;
                }
                // Add nonce if available and no pendingToken is present.
                if (params.nonce && !params.pendingToken) {
                    cred.nonce = params.nonce;
                }
                if (params.pendingToken) {
                    cred.pendingToken = params.pendingToken;
                }
            }
            else if (params.oauthToken && params.oauthTokenSecret) {
                // OAuth 1 and OAuth token with token secret
                cred.accessToken = params.oauthToken;
                cred.secret = params.oauthTokenSecret;
            }
            else {
                _fail("argument-error" /* ARGUMENT_ERROR */);
            }
            return cred;
        }
        /** {@inheritdoc AuthCredential.toJSON}  */
        toJSON() {
            return {
                idToken: this.idToken,
                accessToken: this.accessToken,
                secret: this.secret,
                nonce: this.nonce,
                pendingToken: this.pendingToken,
                providerId: this.providerId,
                signInMethod: this.signInMethod
            };
        }
        /**
         * Static method to deserialize a JSON representation of an object into an
         * {@link  AuthCredential}.
         *
         * @param json - Input can be either Object or the stringified representation of the object.
         * When string is provided, JSON.parse would be called first.
         *
         * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
         */
        static fromJSON(json) {
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            const { providerId, signInMethod } = obj, rest = __rest(obj, ["providerId", "signInMethod"]);
            if (!providerId || !signInMethod) {
                return null;
            }
            const cred = new OAuthCredential(providerId, signInMethod);
            cred.idToken = rest.idToken || undefined;
            cred.accessToken = rest.accessToken || undefined;
            cred.secret = rest.secret;
            cred.nonce = rest.nonce;
            cred.pendingToken = rest.pendingToken || null;
            return cred;
        }
        /** @internal */
        _getIdTokenResponse(auth) {
            const request = this.buildRequest();
            return signInWithIdp(auth, request);
        }
        /** @internal */
        _linkToIdToken(auth, idToken) {
            const request = this.buildRequest();
            request.idToken = idToken;
            return signInWithIdp(auth, request);
        }
        /** @internal */
        _getReauthenticationResolver(auth) {
            const request = this.buildRequest();
            request.autoCreate = false;
            return signInWithIdp(auth, request);
        }
        buildRequest() {
            const request = {
                requestUri: IDP_REQUEST_URI$1,
                returnSecureToken: true
            };
            if (this.pendingToken) {
                request.pendingToken = this.pendingToken;
            }
            else {
                const postBody = {};
                if (this.idToken) {
                    postBody['id_token'] = this.idToken;
                }
                if (this.accessToken) {
                    postBody['access_token'] = this.accessToken;
                }
                if (this.secret) {
                    postBody['oauth_token_secret'] = this.secret;
                }
                postBody['providerId'] = this.providerId;
                if (this.nonce && !this.pendingToken) {
                    postBody['nonce'] = this.nonce;
                }
                request.postBody = querystring(postBody);
            }
            return request;
        }
    }

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
     * The base class for all Federated providers (OAuth (including OIDC), SAML).
     *
     * This class is not meant to be instantiated directly.
     *
     * @public
     */
    class FederatedAuthProvider {
        /**
         * Constructor for generic OAuth providers.
         *
         * @param providerId - Provider for which credentials should be generated.
         */
        constructor(providerId) {
            this.providerId = providerId;
            /** @internal */
            this.defaultLanguageCode = null;
            /** @internal */
            this.customParameters = {};
        }
        /**
         * Set the language gode.
         *
         * @param languageCode - language code
         */
        setDefaultLanguage(languageCode) {
            this.defaultLanguageCode = languageCode;
        }
        /**
         * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
         * operations.
         *
         * @remarks
         * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
         * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
         *
         * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
         */
        setCustomParameters(customOAuthParameters) {
            this.customParameters = customOAuthParameters;
            return this;
        }
        /**
         * Retrieve the current list of {@link CustomParameters}.
         */
        getCustomParameters() {
            return this.customParameters;
        }
    }

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
     * Common code to all OAuth providers. This is separate from the
     * {@link OAuthProvider} so that child providers (like
     * {@link GoogleAuthProvider}) don't inherit the `credential` instance method.
     * Instead, they rely on a static `credential` method.
     */
    class BaseOAuthProvider extends FederatedAuthProvider {
        constructor() {
            super(...arguments);
            /** @internal */
            this.scopes = [];
        }
        /**
         * Add an OAuth scope to the credential.
         *
         * @param scope - Provider OAuth scope to add.
         */
        addScope(scope) {
            // If not already added, add scope to list.
            if (!this.scopes.includes(scope)) {
                this.scopes.push(scope);
            }
            return this;
        }
        /**
         * Retrieve the current list of OAuth scopes.
         */
        getScopes() {
            return [...this.scopes];
        }
    }

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
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.FACEBOOK.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new FacebookAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('user_birthday');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Facebook Access Token.
     *   const credential = FacebookAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new FacebookAuthProvider();
     * provider.addScope('user_birthday');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Facebook Access Token.
     * const credential = FacebookAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     *
     * @public
     */
    class FacebookAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("facebook.com" /* FACEBOOK */);
        }
        /**
         * Creates a credential for Facebook.
         *
         * @example
         * ```javascript
         * // `event` from the Facebook auth.authResponseChange callback.
         * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
         * const result = await signInWithCredential(credential);
         * ```
         *
         * @param accessToken - Facebook access token.
         */
        static credential(accessToken) {
            return OAuthCredential._fromParams({
                providerId: FacebookAuthProvider.PROVIDER_ID,
                signInMethod: FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return FacebookAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return FacebookAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
                return null;
            }
            if (!tokenResponse.oauthAccessToken) {
                return null;
            }
            try {
                return FacebookAuthProvider.credential(tokenResponse.oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.FACEBOOK. */
    FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD = "facebook.com" /* FACEBOOK */;
    /** Always set to {@link ProviderId}.FACEBOOK. */
    FacebookAuthProvider.PROVIDER_ID = "facebook.com" /* FACEBOOK */;

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
     * Provider for generating an an {@link OAuthCredential} for {@link ProviderId}.GOOGLE.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new GoogleAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('profile');
     * provider.addScope('email');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Google Access Token.
     *   const credential = GoogleAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new GoogleAuthProvider();
     * provider.addScope('profile');
     * provider.addScope('email');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Google Access Token.
     * const credential = GoogleAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     *
     * @public
     */
    class GoogleAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("google.com" /* GOOGLE */);
            this.addScope('profile');
        }
        /**
         * Creates a credential for Google. At least one of ID token and access token is required.
         *
         * @example
         * ```javascript
         * // \`googleUser\` from the onsuccess Google Sign In callback.
         * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
         * const result = await signInWithCredential(credential);
         * ```
         *
         * @param idToken - Google ID token.
         * @param accessToken - Google access token.
         */
        static credential(idToken, accessToken) {
            return OAuthCredential._fromParams({
                providerId: GoogleAuthProvider.PROVIDER_ID,
                signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
                idToken,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return GoogleAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return GoogleAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse) {
                return null;
            }
            const { oauthIdToken, oauthAccessToken } = tokenResponse;
            if (!oauthIdToken && !oauthAccessToken) {
                // This could be an oauth 1 credential or a phone credential
                return null;
            }
            try {
                return GoogleAuthProvider.credential(oauthIdToken, oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.GOOGLE. */
    GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD = "google.com" /* GOOGLE */;
    /** Always set to {@link ProviderId}.GOOGLE. */
    GoogleAuthProvider.PROVIDER_ID = "google.com" /* GOOGLE */;

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
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.GITHUB.
     *
     * @remarks
     * GitHub requires an OAuth 2.0 redirect, so you can either handle the redirect directly, or use
     * the {@link signInWithPopup} handler:
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new GithubAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('repo');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Github Access Token.
     *   const credential = GithubAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new GithubAuthProvider();
     * provider.addScope('repo');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Github Access Token.
     * const credential = GithubAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     * @public
     */
    class GithubAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("github.com" /* GITHUB */);
        }
        /**
         * Creates a credential for Github.
         *
         * @param accessToken - Github access token.
         */
        static credential(accessToken) {
            return OAuthCredential._fromParams({
                providerId: GithubAuthProvider.PROVIDER_ID,
                signInMethod: GithubAuthProvider.GITHUB_SIGN_IN_METHOD,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return GithubAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return GithubAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
                return null;
            }
            if (!tokenResponse.oauthAccessToken) {
                return null;
            }
            try {
                return GithubAuthProvider.credential(tokenResponse.oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.GITHUB. */
    GithubAuthProvider.GITHUB_SIGN_IN_METHOD = "github.com" /* GITHUB */;
    /** Always set to {@link ProviderId}.GITHUB. */
    GithubAuthProvider.PROVIDER_ID = "github.com" /* GITHUB */;

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
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.TWITTER.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new TwitterAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Twitter Access Token and Secret.
     *   const credential = TwitterAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     *   const secret = credential.secret;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new TwitterAuthProvider();
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Twitter Access Token and Secret.
     * const credential = TwitterAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * const secret = credential.secret;
     * ```
     *
     * @public
     */
    class TwitterAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("twitter.com" /* TWITTER */);
        }
        /**
         * Creates a credential for Twitter.
         *
         * @param token - Twitter access token.
         * @param secret - Twitter secret.
         */
        static credential(token, secret) {
            return OAuthCredential._fromParams({
                providerId: TwitterAuthProvider.PROVIDER_ID,
                signInMethod: TwitterAuthProvider.TWITTER_SIGN_IN_METHOD,
                oauthToken: token,
                oauthTokenSecret: secret
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return TwitterAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return TwitterAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse) {
                return null;
            }
            const { oauthAccessToken, oauthTokenSecret } = tokenResponse;
            if (!oauthAccessToken || !oauthTokenSecret) {
                return null;
            }
            try {
                return TwitterAuthProvider.credential(oauthAccessToken, oauthTokenSecret);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.TWITTER. */
    TwitterAuthProvider.TWITTER_SIGN_IN_METHOD = "twitter.com" /* TWITTER */;
    /** Always set to {@link ProviderId}.TWITTER. */
    TwitterAuthProvider.PROVIDER_ID = "twitter.com" /* TWITTER */;

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
    class UserCredentialImpl {
        constructor(params) {
            this.user = params.user;
            this.providerId = params.providerId;
            this._tokenResponse = params._tokenResponse;
            this.operationType = params.operationType;
        }
        static async _fromIdTokenResponse(auth, operationType, idTokenResponse, isAnonymous = false) {
            const user = await UserImpl._fromIdTokenResponse(auth, idTokenResponse, isAnonymous);
            const providerId = providerIdForResponse(idTokenResponse);
            const userCred = new UserCredentialImpl({
                user,
                providerId,
                _tokenResponse: idTokenResponse,
                operationType
            });
            return userCred;
        }
        static async _forOperation(user, operationType, response) {
            await user._updateTokensIfNecessary(response, /* reload */ true);
            const providerId = providerIdForResponse(response);
            return new UserCredentialImpl({
                user,
                providerId,
                _tokenResponse: response,
                operationType
            });
        }
    }
    function providerIdForResponse(response) {
        if (response.providerId) {
            return response.providerId;
        }
        if ('phoneNumber' in response) {
            return "phone" /* PHONE */;
        }
        return null;
    }

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
    class MultiFactorError extends FirebaseError {
        constructor(auth, error, operationType, user) {
            var _a;
            super(error.code, error.message);
            this.operationType = operationType;
            this.user = user;
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, MultiFactorError.prototype);
            this.customData = {
                appName: auth.name,
                tenantId: (_a = auth.tenantId) !== null && _a !== void 0 ? _a : undefined,
                _serverResponse: error.customData._serverResponse,
                operationType,
            };
        }
        static _fromErrorAndOperation(auth, error, operationType, user) {
            return new MultiFactorError(auth, error, operationType, user);
        }
    }
    function _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user) {
        const idTokenProvider = operationType === "reauthenticate" /* REAUTHENTICATE */
            ? credential._getReauthenticationResolver(auth)
            : credential._getIdTokenResponse(auth);
        return idTokenProvider.catch(error => {
            if (error.code === `auth/${"multi-factor-auth-required" /* MFA_REQUIRED */}`) {
                throw MultiFactorError._fromErrorAndOperation(auth, error, operationType, user);
            }
            throw error;
        });
    }
    async function _link$1(user, credential, bypassAuthState = false) {
        const response = await _logoutIfInvalidated(user, credential._linkToIdToken(user.auth, await user.getIdToken()), bypassAuthState);
        return UserCredentialImpl._forOperation(user, "link" /* LINK */, response);
    }

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
    async function _reauthenticate(user, credential, bypassAuthState = false) {
        const { auth } = user;
        const operationType = "reauthenticate" /* REAUTHENTICATE */;
        try {
            const response = await _logoutIfInvalidated(user, _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user), bypassAuthState);
            _assert(response.idToken, auth, "internal-error" /* INTERNAL_ERROR */);
            const parsed = _parseToken(response.idToken);
            _assert(parsed, auth, "internal-error" /* INTERNAL_ERROR */);
            const { sub: localId } = parsed;
            _assert(user.uid === localId, auth, "user-mismatch" /* USER_MISMATCH */);
            return UserCredentialImpl._forOperation(user, operationType, response);
        }
        catch (e) {
            // Convert user deleted error into user mismatch
            if ((e === null || e === void 0 ? void 0 : e.code) === `auth/${"user-not-found" /* USER_DELETED */}`) {
                _fail(auth, "user-mismatch" /* USER_MISMATCH */);
            }
            throw e;
        }
    }

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
    async function _signInWithCredential(auth, credential, bypassAuthState = false) {
        const operationType = "signIn" /* SIGN_IN */;
        const response = await _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential);
        const userCredential = await UserCredentialImpl._fromIdTokenResponse(auth, operationType, response);
        if (!bypassAuthState) {
            await auth._updateCurrentUser(userCredential.user);
        }
        return userCredential;
    }
    /**
     * Adds an observer for changes to the user's sign-in state.
     *
     * @remarks
     * To keep the old behavior, see {@link onIdTokenChanged}.
     *
     * @param auth - The {@link Auth} instance.
     * @param nextOrObserver - callback triggered on change.
     * @param error - callback triggered on error.
     * @param completed - callback triggered when observer is removed.
     *
     * @public
     */
    function onAuthStateChanged(auth, nextOrObserver, error, completed) {
        return getModularInstance(auth).onAuthStateChanged(nextOrObserver, error, completed);
    }
    /**
     * Signs out the current user.
     *
     * @param auth - The {@link Auth} instance.
     *
     * @public
     */
    function signOut(auth) {
        return getModularInstance(auth).signOut();
    }

    const STORAGE_AVAILABLE_KEY = '__sak';

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
    // There are two different browser persistence types: local and session.
    // Both have the same implementation but use a different underlying storage
    // object.
    class BrowserPersistenceClass {
        constructor(storageRetriever, type) {
            this.storageRetriever = storageRetriever;
            this.type = type;
        }
        _isAvailable() {
            try {
                if (!this.storage) {
                    return Promise.resolve(false);
                }
                this.storage.setItem(STORAGE_AVAILABLE_KEY, '1');
                this.storage.removeItem(STORAGE_AVAILABLE_KEY);
                return Promise.resolve(true);
            }
            catch (_a) {
                return Promise.resolve(false);
            }
        }
        _set(key, value) {
            this.storage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        }
        _get(key) {
            const json = this.storage.getItem(key);
            return Promise.resolve(json ? JSON.parse(json) : null);
        }
        _remove(key) {
            this.storage.removeItem(key);
            return Promise.resolve();
        }
        get storage() {
            return this.storageRetriever();
        }
    }

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
    function _iframeCannotSyncWebStorage() {
        const ua = getUA();
        return _isSafari(ua) || _isIOS(ua);
    }
    // The polling period in case events are not supported
    const _POLLING_INTERVAL_MS$1 = 1000;
    // The IE 10 localStorage cross tab synchronization delay in milliseconds
    const IE10_LOCAL_STORAGE_SYNC_DELAY = 10;
    class BrowserLocalPersistence extends BrowserPersistenceClass {
        constructor() {
            super(() => window.localStorage, "LOCAL" /* LOCAL */);
            this.boundEventHandler = (event, poll) => this.onStorageEvent(event, poll);
            this.listeners = {};
            this.localCache = {};
            // setTimeout return value is platform specific
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.pollTimer = null;
            // Safari or iOS browser and embedded in an iframe.
            this.safariLocalStorageNotSynced = _iframeCannotSyncWebStorage() && _isIframe();
            // Whether to use polling instead of depending on window events
            this.fallbackToPolling = _isMobileBrowser();
            this._shouldAllowMigration = true;
        }
        forAllChangedKeys(cb) {
            // Check all keys with listeners on them.
            for (const key of Object.keys(this.listeners)) {
                // Get value from localStorage.
                const newValue = this.storage.getItem(key);
                const oldValue = this.localCache[key];
                // If local map value does not match, trigger listener with storage event.
                // Differentiate this simulated event from the real storage event.
                if (newValue !== oldValue) {
                    cb(key, oldValue, newValue);
                }
            }
        }
        onStorageEvent(event, poll = false) {
            // Key would be null in some situations, like when localStorage is cleared
            if (!event.key) {
                this.forAllChangedKeys((key, _oldValue, newValue) => {
                    this.notifyListeners(key, newValue);
                });
                return;
            }
            const key = event.key;
            // Check the mechanism how this event was detected.
            // The first event will dictate the mechanism to be used.
            if (poll) {
                // Environment detects storage changes via polling.
                // Remove storage event listener to prevent possible event duplication.
                this.detachListener();
            }
            else {
                // Environment detects storage changes via storage event listener.
                // Remove polling listener to prevent possible event duplication.
                this.stopPolling();
            }
            // Safari embedded iframe. Storage event will trigger with the delta
            // changes but no changes will be applied to the iframe localStorage.
            if (this.safariLocalStorageNotSynced) {
                // Get current iframe page value.
                const storedValue = this.storage.getItem(key);
                // Value not synchronized, synchronize manually.
                if (event.newValue !== storedValue) {
                    if (event.newValue !== null) {
                        // Value changed from current value.
                        this.storage.setItem(key, event.newValue);
                    }
                    else {
                        // Current value deleted.
                        this.storage.removeItem(key);
                    }
                }
                else if (this.localCache[key] === event.newValue && !poll) {
                    // Already detected and processed, do not trigger listeners again.
                    return;
                }
            }
            const triggerListeners = () => {
                // Keep local map up to date in case storage event is triggered before
                // poll.
                const storedValue = this.storage.getItem(key);
                if (!poll && this.localCache[key] === storedValue) {
                    // Real storage event which has already been detected, do nothing.
                    // This seems to trigger in some IE browsers for some reason.
                    return;
                }
                this.notifyListeners(key, storedValue);
            };
            const storedValue = this.storage.getItem(key);
            if (_isIE10() &&
                storedValue !== event.newValue &&
                event.newValue !== event.oldValue) {
                // IE 10 has this weird bug where a storage event would trigger with the
                // correct key, oldValue and newValue but localStorage.getItem(key) does
                // not yield the updated value until a few milliseconds. This ensures
                // this recovers from that situation.
                setTimeout(triggerListeners, IE10_LOCAL_STORAGE_SYNC_DELAY);
            }
            else {
                triggerListeners();
            }
        }
        notifyListeners(key, value) {
            this.localCache[key] = value;
            const listeners = this.listeners[key];
            if (listeners) {
                for (const listener of Array.from(listeners)) {
                    listener(value ? JSON.parse(value) : value);
                }
            }
        }
        startPolling() {
            this.stopPolling();
            this.pollTimer = setInterval(() => {
                this.forAllChangedKeys((key, oldValue, newValue) => {
                    this.onStorageEvent(new StorageEvent('storage', {
                        key,
                        oldValue,
                        newValue
                    }), 
                    /* poll */ true);
                });
            }, _POLLING_INTERVAL_MS$1);
        }
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }
        attachListener() {
            window.addEventListener('storage', this.boundEventHandler);
        }
        detachListener() {
            window.removeEventListener('storage', this.boundEventHandler);
        }
        _addListener(key, listener) {
            if (Object.keys(this.listeners).length === 0) {
                // Whether browser can detect storage event when it had already been pushed to the background.
                // This may happen in some mobile browsers. A localStorage change in the foreground window
                // will not be detected in the background window via the storage event.
                // This was detected in iOS 7.x mobile browsers
                if (this.fallbackToPolling) {
                    this.startPolling();
                }
                else {
                    this.attachListener();
                }
            }
            if (!this.listeners[key]) {
                this.listeners[key] = new Set();
                // Populate the cache to avoid spuriously triggering on first poll.
                this.localCache[key] = this.storage.getItem(key);
            }
            this.listeners[key].add(listener);
        }
        _removeListener(key, listener) {
            if (this.listeners[key]) {
                this.listeners[key].delete(listener);
                if (this.listeners[key].size === 0) {
                    delete this.listeners[key];
                }
            }
            if (Object.keys(this.listeners).length === 0) {
                this.detachListener();
                this.stopPolling();
            }
        }
        // Update local cache on base operations:
        async _set(key, value) {
            await super._set(key, value);
            this.localCache[key] = JSON.stringify(value);
        }
        async _get(key) {
            const value = await super._get(key);
            this.localCache[key] = JSON.stringify(value);
            return value;
        }
        async _remove(key) {
            await super._remove(key);
            delete this.localCache[key];
        }
    }
    BrowserLocalPersistence.type = 'LOCAL';
    /**
     * An implementation of {@link Persistence} of type `LOCAL` using `localStorage`
     * for the underlying storage.
     *
     * @public
     */
    const browserLocalPersistence = BrowserLocalPersistence;

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
    class BrowserSessionPersistence extends BrowserPersistenceClass {
        constructor() {
            super(() => window.sessionStorage, "SESSION" /* SESSION */);
        }
        _addListener(_key, _listener) {
            // Listeners are not supported for session storage since it cannot be shared across windows
            return;
        }
        _removeListener(_key, _listener) {
            // Listeners are not supported for session storage since it cannot be shared across windows
            return;
        }
    }
    BrowserSessionPersistence.type = 'SESSION';
    /**
     * An implementation of {@link Persistence} of `SESSION` using `sessionStorage`
     * for the underlying storage.
     *
     * @public
     */
    const browserSessionPersistence = BrowserSessionPersistence;

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
     * Shim for Promise.allSettled, note the slightly different format of `fulfilled` vs `status`.
     *
     * @param promises - Array of promises to wait on.
     */
    function _allSettled(promises) {
        return Promise.all(promises.map(async (promise) => {
            try {
                const value = await promise;
                return {
                    fulfilled: true,
                    value
                };
            }
            catch (reason) {
                return {
                    fulfilled: false,
                    reason
                };
            }
        }));
    }

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
     * Interface class for receiving messages.
     *
     */
    class Receiver {
        constructor(eventTarget) {
            this.eventTarget = eventTarget;
            this.handlersMap = {};
            this.boundEventHandler = this.handleEvent.bind(this);
        }
        /**
         * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
         *
         * @param eventTarget - An event target (such as window or self) through which the underlying
         * messages will be received.
         */
        static _getInstance(eventTarget) {
            // The results are stored in an array since objects can't be keys for other
            // objects. In addition, setting a unique property on an event target as a
            // hash map key may not be allowed due to CORS restrictions.
            const existingInstance = this.receivers.find(receiver => receiver.isListeningto(eventTarget));
            if (existingInstance) {
                return existingInstance;
            }
            const newInstance = new Receiver(eventTarget);
            this.receivers.push(newInstance);
            return newInstance;
        }
        isListeningto(eventTarget) {
            return this.eventTarget === eventTarget;
        }
        /**
         * Fans out a MessageEvent to the appropriate listeners.
         *
         * @remarks
         * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
         * finished processing.
         *
         * @param event - The MessageEvent.
         *
         */
        async handleEvent(event) {
            const messageEvent = event;
            const { eventId, eventType, data } = messageEvent.data;
            const handlers = this.handlersMap[eventType];
            if (!(handlers === null || handlers === void 0 ? void 0 : handlers.size)) {
                return;
            }
            messageEvent.ports[0].postMessage({
                status: "ack" /* ACK */,
                eventId,
                eventType
            });
            const promises = Array.from(handlers).map(async (handler) => handler(messageEvent.origin, data));
            const response = await _allSettled(promises);
            messageEvent.ports[0].postMessage({
                status: "done" /* DONE */,
                eventId,
                eventType,
                response
            });
        }
        /**
         * Subscribe an event handler for a particular event.
         *
         * @param eventType - Event name to subscribe to.
         * @param eventHandler - The event handler which should receive the events.
         *
         */
        _subscribe(eventType, eventHandler) {
            if (Object.keys(this.handlersMap).length === 0) {
                this.eventTarget.addEventListener('message', this.boundEventHandler);
            }
            if (!this.handlersMap[eventType]) {
                this.handlersMap[eventType] = new Set();
            }
            this.handlersMap[eventType].add(eventHandler);
        }
        /**
         * Unsubscribe an event handler from a particular event.
         *
         * @param eventType - Event name to unsubscribe from.
         * @param eventHandler - Optinoal event handler, if none provided, unsubscribe all handlers on this event.
         *
         */
        _unsubscribe(eventType, eventHandler) {
            if (this.handlersMap[eventType] && eventHandler) {
                this.handlersMap[eventType].delete(eventHandler);
            }
            if (!eventHandler || this.handlersMap[eventType].size === 0) {
                delete this.handlersMap[eventType];
            }
            if (Object.keys(this.handlersMap).length === 0) {
                this.eventTarget.removeEventListener('message', this.boundEventHandler);
            }
        }
    }
    Receiver.receivers = [];

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
    function _generateEventId(prefix = '', digits = 10) {
        let random = '';
        for (let i = 0; i < digits; i++) {
            random += Math.floor(Math.random() * 10);
        }
        return prefix + random;
    }

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
     * Interface for sending messages and waiting for a completion response.
     *
     */
    class Sender {
        constructor(target) {
            this.target = target;
            this.handlers = new Set();
        }
        /**
         * Unsubscribe the handler and remove it from our tracking Set.
         *
         * @param handler - The handler to unsubscribe.
         */
        removeMessageHandler(handler) {
            if (handler.messageChannel) {
                handler.messageChannel.port1.removeEventListener('message', handler.onMessage);
                handler.messageChannel.port1.close();
            }
            this.handlers.delete(handler);
        }
        /**
         * Send a message to the Receiver located at {@link target}.
         *
         * @remarks
         * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
         * receiver has had a chance to fully process the event.
         *
         * @param eventType - Type of event to send.
         * @param data - The payload of the event.
         * @param timeout - Timeout for waiting on an ACK from the receiver.
         *
         * @returns An array of settled promises from all the handlers that were listening on the receiver.
         */
        async _send(eventType, data, timeout = 50 /* ACK */) {
            const messageChannel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;
            if (!messageChannel) {
                throw new Error("connection_unavailable" /* CONNECTION_UNAVAILABLE */);
            }
            // Node timers and browser timers return fundamentally different types.
            // We don't actually care what the value is but TS won't accept unknown and
            // we can't cast properly in both environments.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let completionTimer;
            let handler;
            return new Promise((resolve, reject) => {
                const eventId = _generateEventId('', 20);
                messageChannel.port1.start();
                const ackTimer = setTimeout(() => {
                    reject(new Error("unsupported_event" /* UNSUPPORTED_EVENT */));
                }, timeout);
                handler = {
                    messageChannel,
                    onMessage(event) {
                        const messageEvent = event;
                        if (messageEvent.data.eventId !== eventId) {
                            return;
                        }
                        switch (messageEvent.data.status) {
                            case "ack" /* ACK */:
                                // The receiver should ACK first.
                                clearTimeout(ackTimer);
                                completionTimer = setTimeout(() => {
                                    reject(new Error("timeout" /* TIMEOUT */));
                                }, 3000 /* COMPLETION */);
                                break;
                            case "done" /* DONE */:
                                // Once the receiver's handlers are finished we will get the results.
                                clearTimeout(completionTimer);
                                resolve(messageEvent.data.response);
                                break;
                            default:
                                clearTimeout(ackTimer);
                                clearTimeout(completionTimer);
                                reject(new Error("invalid_response" /* INVALID_RESPONSE */));
                                break;
                        }
                    }
                };
                this.handlers.add(handler);
                messageChannel.port1.addEventListener('message', handler.onMessage);
                this.target.postMessage({
                    eventType,
                    eventId,
                    data
                }, [messageChannel.port2]);
            }).finally(() => {
                if (handler) {
                    this.removeMessageHandler(handler);
                }
            });
        }
    }

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
     * Lazy accessor for window, since the compat layer won't tree shake this out,
     * we need to make sure not to mess with window unless we have to
     */
    function _window() {
        return window;
    }
    function _setWindowLocation(url) {
        _window().location.href = url;
    }

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
    function _isWorker() {
        return (typeof _window()['WorkerGlobalScope'] !== 'undefined' &&
            typeof _window()['importScripts'] === 'function');
    }
    async function _getActiveServiceWorker() {
        if (!(navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker)) {
            return null;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            return registration.active;
        }
        catch (_a) {
            return null;
        }
    }
    function _getServiceWorkerController() {
        var _a;
        return ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) || null;
    }
    function _getWorkerGlobalScope() {
        return _isWorker() ? self : null;
    }

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
    const DB_NAME = 'firebaseLocalStorageDb';
    const DB_VERSION = 1;
    const DB_OBJECTSTORE_NAME = 'firebaseLocalStorage';
    const DB_DATA_KEYPATH = 'fbase_key';
    /**
     * Promise wrapper for IDBRequest
     *
     * Unfortunately we can't cleanly extend Promise<T> since promises are not callable in ES6
     *
     */
    class DBPromise {
        constructor(request) {
            this.request = request;
        }
        toPromise() {
            return new Promise((resolve, reject) => {
                this.request.addEventListener('success', () => {
                    resolve(this.request.result);
                });
                this.request.addEventListener('error', () => {
                    reject(this.request.error);
                });
            });
        }
    }
    function getObjectStore(db, isReadWrite) {
        return db
            .transaction([DB_OBJECTSTORE_NAME], isReadWrite ? 'readwrite' : 'readonly')
            .objectStore(DB_OBJECTSTORE_NAME);
    }
    function _deleteDatabase() {
        const request = indexedDB.deleteDatabase(DB_NAME);
        return new DBPromise(request).toPromise();
    }
    function _openDatabase() {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        return new Promise((resolve, reject) => {
            request.addEventListener('error', () => {
                reject(request.error);
            });
            request.addEventListener('upgradeneeded', () => {
                const db = request.result;
                try {
                    db.createObjectStore(DB_OBJECTSTORE_NAME, { keyPath: DB_DATA_KEYPATH });
                }
                catch (e) {
                    reject(e);
                }
            });
            request.addEventListener('success', async () => {
                const db = request.result;
                // Strange bug that occurs in Firefox when multiple tabs are opened at the
                // same time. The only way to recover seems to be deleting the database
                // and re-initializing it.
                // https://github.com/firebase/firebase-js-sdk/issues/634
                if (!db.objectStoreNames.contains(DB_OBJECTSTORE_NAME)) {
                    // Need to close the database or else you get a `blocked` event
                    db.close();
                    await _deleteDatabase();
                    resolve(await _openDatabase());
                }
                else {
                    resolve(db);
                }
            });
        });
    }
    async function _putObject(db, key, value) {
        const request = getObjectStore(db, true).put({
            [DB_DATA_KEYPATH]: key,
            value
        });
        return new DBPromise(request).toPromise();
    }
    async function getObject(db, key) {
        const request = getObjectStore(db, false).get(key);
        const data = await new DBPromise(request).toPromise();
        return data === undefined ? null : data.value;
    }
    function _deleteObject(db, key) {
        const request = getObjectStore(db, true).delete(key);
        return new DBPromise(request).toPromise();
    }
    const _POLLING_INTERVAL_MS = 800;
    const _TRANSACTION_RETRY_COUNT = 3;
    class IndexedDBLocalPersistence {
        constructor() {
            this.type = "LOCAL" /* LOCAL */;
            this._shouldAllowMigration = true;
            this.listeners = {};
            this.localCache = {};
            // setTimeout return value is platform specific
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.pollTimer = null;
            this.pendingWrites = 0;
            this.receiver = null;
            this.sender = null;
            this.serviceWorkerReceiverAvailable = false;
            this.activeServiceWorker = null;
            // Fire & forget the service worker registration as it may never resolve
            this._workerInitializationPromise =
                this.initializeServiceWorkerMessaging().then(() => { }, () => { });
        }
        async _openDb() {
            if (this.db) {
                return this.db;
            }
            this.db = await _openDatabase();
            return this.db;
        }
        async _withRetries(op) {
            let numAttempts = 0;
            while (true) {
                try {
                    const db = await this._openDb();
                    return await op(db);
                }
                catch (e) {
                    if (numAttempts++ > _TRANSACTION_RETRY_COUNT) {
                        throw e;
                    }
                    if (this.db) {
                        this.db.close();
                        this.db = undefined;
                    }
                    // TODO: consider adding exponential backoff
                }
            }
        }
        /**
         * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
         * postMessage interface to send these events to the worker ourselves.
         */
        async initializeServiceWorkerMessaging() {
            return _isWorker() ? this.initializeReceiver() : this.initializeSender();
        }
        /**
         * As the worker we should listen to events from the main window.
         */
        async initializeReceiver() {
            this.receiver = Receiver._getInstance(_getWorkerGlobalScope());
            // Refresh from persistence if we receive a KeyChanged message.
            this.receiver._subscribe("keyChanged" /* KEY_CHANGED */, async (_origin, data) => {
                const keys = await this._poll();
                return {
                    keyProcessed: keys.includes(data.key)
                };
            });
            // Let the sender know that we are listening so they give us more timeout.
            this.receiver._subscribe("ping" /* PING */, async (_origin, _data) => {
                return ["keyChanged" /* KEY_CHANGED */];
            });
        }
        /**
         * As the main window, we should let the worker know when keys change (set and remove).
         *
         * @remarks
         * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
         * may not resolve.
         */
        async initializeSender() {
            var _a, _b;
            // Check to see if there's an active service worker.
            this.activeServiceWorker = await _getActiveServiceWorker();
            if (!this.activeServiceWorker) {
                return;
            }
            this.sender = new Sender(this.activeServiceWorker);
            // Ping the service worker to check what events they can handle.
            const results = await this.sender._send("ping" /* PING */, {}, 800 /* LONG_ACK */);
            if (!results) {
                return;
            }
            if (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.fulfilled) &&
                ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.value.includes("keyChanged" /* KEY_CHANGED */))) {
                this.serviceWorkerReceiverAvailable = true;
            }
        }
        /**
         * Let the worker know about a changed key, the exact key doesn't technically matter since the
         * worker will just trigger a full sync anyway.
         *
         * @remarks
         * For now, we only support one service worker per page.
         *
         * @param key - Storage key which changed.
         */
        async notifyServiceWorker(key) {
            if (!this.sender ||
                !this.activeServiceWorker ||
                _getServiceWorkerController() !== this.activeServiceWorker) {
                return;
            }
            try {
                await this.sender._send("keyChanged" /* KEY_CHANGED */, { key }, 
                // Use long timeout if receiver has previously responded to a ping from us.
                this.serviceWorkerReceiverAvailable
                    ? 800 /* LONG_ACK */
                    : 50 /* ACK */);
            }
            catch (_a) {
                // This is a best effort approach. Ignore errors.
            }
        }
        async _isAvailable() {
            try {
                if (!indexedDB) {
                    return false;
                }
                const db = await _openDatabase();
                await _putObject(db, STORAGE_AVAILABLE_KEY, '1');
                await _deleteObject(db, STORAGE_AVAILABLE_KEY);
                return true;
            }
            catch (_a) { }
            return false;
        }
        async _withPendingWrite(write) {
            this.pendingWrites++;
            try {
                await write();
            }
            finally {
                this.pendingWrites--;
            }
        }
        async _set(key, value) {
            return this._withPendingWrite(async () => {
                await this._withRetries((db) => _putObject(db, key, value));
                this.localCache[key] = value;
                return this.notifyServiceWorker(key);
            });
        }
        async _get(key) {
            const obj = (await this._withRetries((db) => getObject(db, key)));
            this.localCache[key] = obj;
            return obj;
        }
        async _remove(key) {
            return this._withPendingWrite(async () => {
                await this._withRetries((db) => _deleteObject(db, key));
                delete this.localCache[key];
                return this.notifyServiceWorker(key);
            });
        }
        async _poll() {
            // TODO: check if we need to fallback if getAll is not supported
            const result = await this._withRetries((db) => {
                const getAllRequest = getObjectStore(db, false).getAll();
                return new DBPromise(getAllRequest).toPromise();
            });
            if (!result) {
                return [];
            }
            // If we have pending writes in progress abort, we'll get picked up on the next poll
            if (this.pendingWrites !== 0) {
                return [];
            }
            const keys = [];
            const keysInResult = new Set();
            for (const { fbase_key: key, value } of result) {
                keysInResult.add(key);
                if (JSON.stringify(this.localCache[key]) !== JSON.stringify(value)) {
                    this.notifyListeners(key, value);
                    keys.push(key);
                }
            }
            for (const localKey of Object.keys(this.localCache)) {
                if (this.localCache[localKey] && !keysInResult.has(localKey)) {
                    // Deleted
                    this.notifyListeners(localKey, null);
                    keys.push(localKey);
                }
            }
            return keys;
        }
        notifyListeners(key, newValue) {
            this.localCache[key] = newValue;
            const listeners = this.listeners[key];
            if (listeners) {
                for (const listener of Array.from(listeners)) {
                    listener(newValue);
                }
            }
        }
        startPolling() {
            this.stopPolling();
            this.pollTimer = setInterval(async () => this._poll(), _POLLING_INTERVAL_MS);
        }
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }
        _addListener(key, listener) {
            if (Object.keys(this.listeners).length === 0) {
                this.startPolling();
            }
            if (!this.listeners[key]) {
                this.listeners[key] = new Set();
                // Populate the cache to avoid spuriously triggering on first poll.
                void this._get(key); // This can happen in the background async and we can return immediately.
            }
            this.listeners[key].add(listener);
        }
        _removeListener(key, listener) {
            if (this.listeners[key]) {
                this.listeners[key].delete(listener);
                if (this.listeners[key].size === 0) {
                    delete this.listeners[key];
                }
            }
            if (Object.keys(this.listeners).length === 0) {
                this.stopPolling();
            }
        }
    }
    IndexedDBLocalPersistence.type = 'LOCAL';
    /**
     * An implementation of {@link Persistence} of type `LOCAL` using `indexedDB`
     * for the underlying storage.
     *
     * @public
     */
    const indexedDBLocalPersistence = IndexedDBLocalPersistence;

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
    function getScriptParentElement() {
        var _a, _b;
        return (_b = (_a = document.getElementsByTagName('head')) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : document;
    }
    function _loadJS(url) {
        // TODO: consider adding timeout support & cancellation
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.setAttribute('src', url);
            el.onload = resolve;
            el.onerror = e => {
                const error = _createError("internal-error" /* INTERNAL_ERROR */);
                error.customData = e;
                reject(error);
            };
            el.type = 'text/javascript';
            el.charset = 'UTF-8';
            getScriptParentElement().appendChild(el);
        });
    }
    function _generateCallbackName(prefix) {
        return `__${prefix}${Math.floor(Math.random() * 1000000)}`;
    }
    new Delay(30000, 60000);

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
    /**
     * Chooses a popup/redirect resolver to use. This prefers the override (which
     * is directly passed in), and falls back to the property set on the auth
     * object. If neither are available, this function errors w/ an argument error.
     */
    function _withDefaultResolver(auth, resolverOverride) {
        if (resolverOverride) {
            return _getInstance(resolverOverride);
        }
        _assert(auth._popupRedirectResolver, auth, "argument-error" /* ARGUMENT_ERROR */);
        return auth._popupRedirectResolver;
    }

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
    class IdpCredential extends AuthCredential {
        constructor(params) {
            super("custom" /* CUSTOM */, "custom" /* CUSTOM */);
            this.params = params;
        }
        _getIdTokenResponse(auth) {
            return signInWithIdp(auth, this._buildIdpRequest());
        }
        _linkToIdToken(auth, idToken) {
            return signInWithIdp(auth, this._buildIdpRequest(idToken));
        }
        _getReauthenticationResolver(auth) {
            return signInWithIdp(auth, this._buildIdpRequest());
        }
        _buildIdpRequest(idToken) {
            const request = {
                requestUri: this.params.requestUri,
                sessionId: this.params.sessionId,
                postBody: this.params.postBody,
                tenantId: this.params.tenantId,
                pendingToken: this.params.pendingToken,
                returnSecureToken: true,
                returnIdpCredential: true
            };
            if (idToken) {
                request.idToken = idToken;
            }
            return request;
        }
    }
    function _signIn(params) {
        return _signInWithCredential(params.auth, new IdpCredential(params), params.bypassAuthState);
    }
    function _reauth(params) {
        const { auth, user } = params;
        _assert(user, auth, "internal-error" /* INTERNAL_ERROR */);
        return _reauthenticate(user, new IdpCredential(params), params.bypassAuthState);
    }
    async function _link(params) {
        const { auth, user } = params;
        _assert(user, auth, "internal-error" /* INTERNAL_ERROR */);
        return _link$1(user, new IdpCredential(params), params.bypassAuthState);
    }

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
     * Popup event manager. Handles the popup's entire lifecycle; listens to auth
     * events
     */
    class AbstractPopupRedirectOperation {
        constructor(auth, filter, resolver, user, bypassAuthState = false) {
            this.auth = auth;
            this.resolver = resolver;
            this.user = user;
            this.bypassAuthState = bypassAuthState;
            this.pendingPromise = null;
            this.eventManager = null;
            this.filter = Array.isArray(filter) ? filter : [filter];
        }
        execute() {
            return new Promise(async (resolve, reject) => {
                this.pendingPromise = { resolve, reject };
                try {
                    this.eventManager = await this.resolver._initialize(this.auth);
                    await this.onExecution();
                    this.eventManager.registerConsumer(this);
                }
                catch (e) {
                    this.reject(e);
                }
            });
        }
        async onAuthEvent(event) {
            const { urlResponse, sessionId, postBody, tenantId, error, type } = event;
            if (error) {
                this.reject(error);
                return;
            }
            const params = {
                auth: this.auth,
                requestUri: urlResponse,
                sessionId: sessionId,
                tenantId: tenantId || undefined,
                postBody: postBody || undefined,
                user: this.user,
                bypassAuthState: this.bypassAuthState
            };
            try {
                this.resolve(await this.getIdpTask(type)(params));
            }
            catch (e) {
                this.reject(e);
            }
        }
        onError(error) {
            this.reject(error);
        }
        getIdpTask(type) {
            switch (type) {
                case "signInViaPopup" /* SIGN_IN_VIA_POPUP */:
                case "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */:
                    return _signIn;
                case "linkViaPopup" /* LINK_VIA_POPUP */:
                case "linkViaRedirect" /* LINK_VIA_REDIRECT */:
                    return _link;
                case "reauthViaPopup" /* REAUTH_VIA_POPUP */:
                case "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */:
                    return _reauth;
                default:
                    _fail(this.auth, "internal-error" /* INTERNAL_ERROR */);
            }
        }
        resolve(cred) {
            debugAssert(this.pendingPromise, 'Pending promise was never set');
            this.pendingPromise.resolve(cred);
            this.unregisterAndCleanUp();
        }
        reject(error) {
            debugAssert(this.pendingPromise, 'Pending promise was never set');
            this.pendingPromise.reject(error);
            this.unregisterAndCleanUp();
        }
        unregisterAndCleanUp() {
            if (this.eventManager) {
                this.eventManager.unregisterConsumer(this);
            }
            this.pendingPromise = null;
            this.cleanUp();
        }
    }

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
    const _POLL_WINDOW_CLOSE_TIMEOUT = new Delay(2000, 10000);
    /**
     * Popup event manager. Handles the popup's entire lifecycle; listens to auth
     * events
     *
     */
    class PopupOperation extends AbstractPopupRedirectOperation {
        constructor(auth, filter, provider, resolver, user) {
            super(auth, filter, resolver, user);
            this.provider = provider;
            this.authWindow = null;
            this.pollId = null;
            if (PopupOperation.currentPopupAction) {
                PopupOperation.currentPopupAction.cancel();
            }
            PopupOperation.currentPopupAction = this;
        }
        async executeNotNull() {
            const result = await this.execute();
            _assert(result, this.auth, "internal-error" /* INTERNAL_ERROR */);
            return result;
        }
        async onExecution() {
            debugAssert(this.filter.length === 1, 'Popup operations only handle one event');
            const eventId = _generateEventId();
            this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], // There's always one, see constructor
            eventId);
            this.authWindow.associatedEvent = eventId;
            // Check for web storage support and origin validation _after_ the popup is
            // loaded. These operations are slow (~1 second or so) Rather than
            // waiting on them before opening the window, optimistically open the popup
            // and check for storage support at the same time. If storage support is
            // not available, this will cause the whole thing to reject properly. It
            // will also close the popup, but since the promise has already rejected,
            // the popup closed by user poll will reject into the void.
            this.resolver._originValidation(this.auth).catch(e => {
                this.reject(e);
            });
            this.resolver._isIframeWebStorageSupported(this.auth, isSupported => {
                if (!isSupported) {
                    this.reject(_createError(this.auth, "web-storage-unsupported" /* WEB_STORAGE_UNSUPPORTED */));
                }
            });
            // Handle user closure. Notice this does *not* use await
            this.pollUserCancellation();
        }
        get eventId() {
            var _a;
            return ((_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.associatedEvent) || null;
        }
        cancel() {
            this.reject(_createError(this.auth, "cancelled-popup-request" /* EXPIRED_POPUP_REQUEST */));
        }
        cleanUp() {
            if (this.authWindow) {
                this.authWindow.close();
            }
            if (this.pollId) {
                window.clearTimeout(this.pollId);
            }
            this.authWindow = null;
            this.pollId = null;
            PopupOperation.currentPopupAction = null;
        }
        pollUserCancellation() {
            const poll = () => {
                var _a, _b;
                if ((_b = (_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.window) === null || _b === void 0 ? void 0 : _b.closed) {
                    // Make sure that there is sufficient time for whatever action to
                    // complete. The window could have closed but the sign in network
                    // call could still be in flight.
                    this.pollId = window.setTimeout(() => {
                        this.pollId = null;
                        this.reject(_createError(this.auth, "popup-closed-by-user" /* POPUP_CLOSED_BY_USER */));
                    }, 2000 /* AUTH_EVENT */);
                    return;
                }
                this.pollId = window.setTimeout(poll, _POLL_WINDOW_CLOSE_TIMEOUT.get());
            };
            poll();
        }
    }
    // Only one popup is ever shown at once. The lifecycle of the current popup
    // can be managed / cancelled by the constructor.
    PopupOperation.currentPopupAction = null;

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
    const PENDING_REDIRECT_KEY = 'pendingRedirect';
    // We only get one redirect outcome for any one auth, so just store it
    // in here.
    const redirectOutcomeMap = new Map();
    class RedirectAction extends AbstractPopupRedirectOperation {
        constructor(auth, resolver, bypassAuthState = false) {
            super(auth, [
                "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */,
                "linkViaRedirect" /* LINK_VIA_REDIRECT */,
                "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */,
                "unknown" /* UNKNOWN */
            ], resolver, undefined, bypassAuthState);
            this.eventId = null;
        }
        /**
         * Override the execute function; if we already have a redirect result, then
         * just return it.
         */
        async execute() {
            let readyOutcome = redirectOutcomeMap.get(this.auth._key());
            if (!readyOutcome) {
                try {
                    const hasPendingRedirect = await _getAndClearPendingRedirectStatus(this.resolver, this.auth);
                    const result = hasPendingRedirect ? await super.execute() : null;
                    readyOutcome = () => Promise.resolve(result);
                }
                catch (e) {
                    readyOutcome = () => Promise.reject(e);
                }
                redirectOutcomeMap.set(this.auth._key(), readyOutcome);
            }
            // If we're not bypassing auth state, the ready outcome should be set to
            // null.
            if (!this.bypassAuthState) {
                redirectOutcomeMap.set(this.auth._key(), () => Promise.resolve(null));
            }
            return readyOutcome();
        }
        async onAuthEvent(event) {
            if (event.type === "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */) {
                return super.onAuthEvent(event);
            }
            else if (event.type === "unknown" /* UNKNOWN */) {
                // This is a sentinel value indicating there's no pending redirect
                this.resolve(null);
                return;
            }
            if (event.eventId) {
                const user = await this.auth._redirectUserForId(event.eventId);
                if (user) {
                    this.user = user;
                    return super.onAuthEvent(event);
                }
                else {
                    this.resolve(null);
                }
            }
        }
        async onExecution() { }
        cleanUp() { }
    }
    async function _getAndClearPendingRedirectStatus(resolver, auth) {
        const key = pendingRedirectKey(auth);
        const persistence = resolverPersistence(resolver);
        if (!(await persistence._isAvailable())) {
            return false;
        }
        const hasPendingRedirect = (await persistence._get(key)) === 'true';
        await persistence._remove(key);
        return hasPendingRedirect;
    }
    function resolverPersistence(resolver) {
        return _getInstance(resolver._redirectPersistence);
    }
    function pendingRedirectKey(auth) {
        return _persistenceKeyName(PENDING_REDIRECT_KEY, auth.config.apiKey, auth.name);
    }
    async function _getRedirectResult(auth, resolverExtern, bypassAuthState = false) {
        const authInternal = _castAuth(auth);
        const resolver = _withDefaultResolver(authInternal, resolverExtern);
        const action = new RedirectAction(authInternal, resolver, bypassAuthState);
        const result = await action.execute();
        if (result && !bypassAuthState) {
            delete result.user._redirectEventId;
            await authInternal._persistUserIfCurrent(result.user);
            await authInternal._setRedirectUser(null, resolverExtern);
        }
        return result;
    }

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
    // The amount of time to store the UIDs of seen events; this is
    // set to 10 min by default
    const EVENT_DUPLICATION_CACHE_DURATION_MS = 10 * 60 * 1000;
    class AuthEventManager {
        constructor(auth) {
            this.auth = auth;
            this.cachedEventUids = new Set();
            this.consumers = new Set();
            this.queuedRedirectEvent = null;
            this.hasHandledPotentialRedirect = false;
            this.lastProcessedEventTime = Date.now();
        }
        registerConsumer(authEventConsumer) {
            this.consumers.add(authEventConsumer);
            if (this.queuedRedirectEvent &&
                this.isEventForConsumer(this.queuedRedirectEvent, authEventConsumer)) {
                this.sendToConsumer(this.queuedRedirectEvent, authEventConsumer);
                this.saveEventToCache(this.queuedRedirectEvent);
                this.queuedRedirectEvent = null;
            }
        }
        unregisterConsumer(authEventConsumer) {
            this.consumers.delete(authEventConsumer);
        }
        onEvent(event) {
            // Check if the event has already been handled
            if (this.hasEventBeenHandled(event)) {
                return false;
            }
            let handled = false;
            this.consumers.forEach(consumer => {
                if (this.isEventForConsumer(event, consumer)) {
                    handled = true;
                    this.sendToConsumer(event, consumer);
                    this.saveEventToCache(event);
                }
            });
            if (this.hasHandledPotentialRedirect || !isRedirectEvent(event)) {
                // If we've already seen a redirect before, or this is a popup event,
                // bail now
                return handled;
            }
            this.hasHandledPotentialRedirect = true;
            // If the redirect wasn't handled, hang on to it
            if (!handled) {
                this.queuedRedirectEvent = event;
                handled = true;
            }
            return handled;
        }
        sendToConsumer(event, consumer) {
            var _a;
            if (event.error && !isNullRedirectEvent(event)) {
                const code = ((_a = event.error.code) === null || _a === void 0 ? void 0 : _a.split('auth/')[1]) ||
                    "internal-error" /* INTERNAL_ERROR */;
                consumer.onError(_createError(this.auth, code));
            }
            else {
                consumer.onAuthEvent(event);
            }
        }
        isEventForConsumer(event, consumer) {
            const eventIdMatches = consumer.eventId === null ||
                (!!event.eventId && event.eventId === consumer.eventId);
            return consumer.filter.includes(event.type) && eventIdMatches;
        }
        hasEventBeenHandled(event) {
            if (Date.now() - this.lastProcessedEventTime >=
                EVENT_DUPLICATION_CACHE_DURATION_MS) {
                this.cachedEventUids.clear();
            }
            return this.cachedEventUids.has(eventUid(event));
        }
        saveEventToCache(event) {
            this.cachedEventUids.add(eventUid(event));
            this.lastProcessedEventTime = Date.now();
        }
    }
    function eventUid(e) {
        return [e.type, e.eventId, e.sessionId, e.tenantId].filter(v => v).join('-');
    }
    function isNullRedirectEvent({ type, error }) {
        return (type === "unknown" /* UNKNOWN */ &&
            (error === null || error === void 0 ? void 0 : error.code) === `auth/${"no-auth-event" /* NO_AUTH_EVENT */}`);
    }
    function isRedirectEvent(event) {
        switch (event.type) {
            case "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */:
            case "linkViaRedirect" /* LINK_VIA_REDIRECT */:
            case "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */:
                return true;
            case "unknown" /* UNKNOWN */:
                return isNullRedirectEvent(event);
            default:
                return false;
        }
    }

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
    async function _getProjectConfig(auth, request = {}) {
        return _performApiRequest(auth, "GET" /* GET */, "/v1/projects" /* GET_PROJECT_CONFIG */, request);
    }

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
    const IP_ADDRESS_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    const HTTP_REGEX = /^https?/;
    async function _validateOrigin(auth) {
        // Skip origin validation if we are in an emulated environment
        if (auth.config.emulator) {
            return;
        }
        const { authorizedDomains } = await _getProjectConfig(auth);
        for (const domain of authorizedDomains) {
            try {
                if (matchDomain(domain)) {
                    return;
                }
            }
            catch (_a) {
                // Do nothing if there's a URL error; just continue searching
            }
        }
        // In the old SDK, this error also provides helpful messages.
        _fail(auth, "unauthorized-domain" /* INVALID_ORIGIN */);
    }
    function matchDomain(expected) {
        const currentUrl = _getCurrentUrl();
        const { protocol, hostname } = new URL(currentUrl);
        if (expected.startsWith('chrome-extension://')) {
            const ceUrl = new URL(expected);
            if (ceUrl.hostname === '' && hostname === '') {
                // For some reason we're not parsing chrome URLs properly
                return (protocol === 'chrome-extension:' &&
                    expected.replace('chrome-extension://', '') ===
                        currentUrl.replace('chrome-extension://', ''));
            }
            return protocol === 'chrome-extension:' && ceUrl.hostname === hostname;
        }
        if (!HTTP_REGEX.test(protocol)) {
            return false;
        }
        if (IP_ADDRESS_REGEX.test(expected)) {
            // The domain has to be exactly equal to the pattern, as an IP domain will
            // only contain the IP, no extra character.
            return hostname === expected;
        }
        // Dots in pattern should be escaped.
        const escapedDomainPattern = expected.replace(/\./g, '\\.');
        // Non ip address domains.
        // domain.com = *.domain.com OR domain.com
        const re = new RegExp('^(.+\\.' + escapedDomainPattern + '|' + escapedDomainPattern + ')$', 'i');
        return re.test(hostname);
    }

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
    const NETWORK_TIMEOUT = new Delay(30000, 60000);
    /**
     * Reset unlaoded GApi modules. If gapi.load fails due to a network error,
     * it will stop working after a retrial. This is a hack to fix this issue.
     */
    function resetUnloadedGapiModules() {
        // Clear last failed gapi.load state to force next gapi.load to first
        // load the failed gapi.iframes module.
        // Get gapix.beacon context.
        const beacon = _window().___jsl;
        // Get current hint.
        if (beacon === null || beacon === void 0 ? void 0 : beacon.H) {
            // Get gapi hint.
            for (const hint of Object.keys(beacon.H)) {
                // Requested modules.
                beacon.H[hint].r = beacon.H[hint].r || [];
                // Loaded modules.
                beacon.H[hint].L = beacon.H[hint].L || [];
                // Set requested modules to a copy of the loaded modules.
                beacon.H[hint].r = [...beacon.H[hint].L];
                // Clear pending callbacks.
                if (beacon.CP) {
                    for (let i = 0; i < beacon.CP.length; i++) {
                        // Remove all failed pending callbacks.
                        beacon.CP[i] = null;
                    }
                }
            }
        }
    }
    function loadGapi(auth) {
        return new Promise((resolve, reject) => {
            var _a, _b, _c;
            // Function to run when gapi.load is ready.
            function loadGapiIframe() {
                // The developer may have tried to previously run gapi.load and failed.
                // Run this to fix that.
                resetUnloadedGapiModules();
                gapi.load('gapi.iframes', {
                    callback: () => {
                        resolve(gapi.iframes.getContext());
                    },
                    ontimeout: () => {
                        // The above reset may be sufficient, but having this reset after
                        // failure ensures that if the developer calls gapi.load after the
                        // connection is re-established and before another attempt to embed
                        // the iframe, it would work and would not be broken because of our
                        // failed attempt.
                        // Timeout when gapi.iframes.Iframe not loaded.
                        resetUnloadedGapiModules();
                        reject(_createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */));
                    },
                    timeout: NETWORK_TIMEOUT.get()
                });
            }
            if ((_b = (_a = _window().gapi) === null || _a === void 0 ? void 0 : _a.iframes) === null || _b === void 0 ? void 0 : _b.Iframe) {
                // If gapi.iframes.Iframe available, resolve.
                resolve(gapi.iframes.getContext());
            }
            else if (!!((_c = _window().gapi) === null || _c === void 0 ? void 0 : _c.load)) {
                // Gapi loader ready, load gapi.iframes.
                loadGapiIframe();
            }
            else {
                // Create a new iframe callback when this is called so as not to overwrite
                // any previous defined callback. This happens if this method is called
                // multiple times in parallel and could result in the later callback
                // overwriting the previous one. This would end up with a iframe
                // timeout.
                const cbName = _generateCallbackName('iframefcb');
                // GApi loader not available, dynamically load platform.js.
                _window()[cbName] = () => {
                    // GApi loader should be ready.
                    if (!!gapi.load) {
                        loadGapiIframe();
                    }
                    else {
                        // Gapi loader failed, throw error.
                        reject(_createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */));
                    }
                };
                // Load GApi loader.
                return _loadJS(`https://apis.google.com/js/api.js?onload=${cbName}`).catch(e => reject(e));
            }
        }).catch(error => {
            // Reset cached promise to allow for retrial.
            cachedGApiLoader = null;
            throw error;
        });
    }
    let cachedGApiLoader = null;
    function _loadGapi(auth) {
        cachedGApiLoader = cachedGApiLoader || loadGapi(auth);
        return cachedGApiLoader;
    }

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
    const PING_TIMEOUT = new Delay(5000, 15000);
    const IFRAME_PATH = '__/auth/iframe';
    const EMULATED_IFRAME_PATH = 'emulator/auth/iframe';
    const IFRAME_ATTRIBUTES = {
        style: {
            position: 'absolute',
            top: '-100px',
            width: '1px',
            height: '1px'
        },
        'aria-hidden': 'true',
        tabindex: '-1'
    };
    // Map from apiHost to endpoint ID for passing into iframe. In current SDK, apiHost can be set to
    // anything (not from a list of endpoints with IDs as in legacy), so this is the closest we can get.
    const EID_FROM_APIHOST = new Map([
        ["identitytoolkit.googleapis.com" /* API_HOST */, 'p'],
        ['staging-identitytoolkit.sandbox.googleapis.com', 's'],
        ['test-identitytoolkit.sandbox.googleapis.com', 't'] // test
    ]);
    function getIframeUrl(auth) {
        const config = auth.config;
        _assert(config.authDomain, auth, "auth-domain-config-required" /* MISSING_AUTH_DOMAIN */);
        const url = config.emulator
            ? _emulatorUrl(config, EMULATED_IFRAME_PATH)
            : `https://${auth.config.authDomain}/${IFRAME_PATH}`;
        const params = {
            apiKey: config.apiKey,
            appName: auth.name,
            v: SDK_VERSION$1
        };
        const eid = EID_FROM_APIHOST.get(auth.config.apiHost);
        if (eid) {
            params.eid = eid;
        }
        const frameworks = auth._getFrameworks();
        if (frameworks.length) {
            params.fw = frameworks.join(',');
        }
        return `${url}?${querystring(params).slice(1)}`;
    }
    async function _openIframe(auth) {
        const context = await _loadGapi(auth);
        const gapi = _window().gapi;
        _assert(gapi, auth, "internal-error" /* INTERNAL_ERROR */);
        return context.open({
            where: document.body,
            url: getIframeUrl(auth),
            messageHandlersFilter: gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
            attributes: IFRAME_ATTRIBUTES,
            dontclear: true
        }, (iframe) => new Promise(async (resolve, reject) => {
            await iframe.restyle({
                // Prevent iframe from closing on mouse out.
                setHideOnLeave: false
            });
            const networkError = _createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */);
            // Confirm iframe is correctly loaded.
            // To fallback on failure, set a timeout.
            const networkErrorTimer = _window().setTimeout(() => {
                reject(networkError);
            }, PING_TIMEOUT.get());
            // Clear timer and resolve pending iframe ready promise.
            function clearTimerAndResolve() {
                _window().clearTimeout(networkErrorTimer);
                resolve(iframe);
            }
            // This returns an IThenable. However the reject part does not call
            // when the iframe is not loaded.
            iframe.ping(clearTimerAndResolve).then(clearTimerAndResolve, () => {
                reject(networkError);
            });
        }));
    }

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
    const BASE_POPUP_OPTIONS = {
        location: 'yes',
        resizable: 'yes',
        statusbar: 'yes',
        toolbar: 'no'
    };
    const DEFAULT_WIDTH = 500;
    const DEFAULT_HEIGHT = 600;
    const TARGET_BLANK = '_blank';
    const FIREFOX_EMPTY_URL = 'http://localhost';
    class AuthPopup {
        constructor(window) {
            this.window = window;
            this.associatedEvent = null;
        }
        close() {
            if (this.window) {
                try {
                    this.window.close();
                }
                catch (e) { }
            }
        }
    }
    function _open(auth, url, name, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
        const top = Math.max((window.screen.availHeight - height) / 2, 0).toString();
        const left = Math.max((window.screen.availWidth - width) / 2, 0).toString();
        let target = '';
        const options = Object.assign(Object.assign({}, BASE_POPUP_OPTIONS), { width: width.toString(), height: height.toString(), top,
            left });
        // Chrome iOS 7 and 8 is returning an undefined popup win when target is
        // specified, even though the popup is not necessarily blocked.
        const ua = getUA().toLowerCase();
        if (name) {
            target = _isChromeIOS(ua) ? TARGET_BLANK : name;
        }
        if (_isFirefox(ua)) {
            // Firefox complains when invalid URLs are popped out. Hacky way to bypass.
            url = url || FIREFOX_EMPTY_URL;
            // Firefox disables by default scrolling on popup windows, which can create
            // issues when the user has many Google accounts, for instance.
            options.scrollbars = 'yes';
        }
        const optionsString = Object.entries(options).reduce((accum, [key, value]) => `${accum}${key}=${value},`, '');
        if (_isIOSStandalone(ua) && target !== '_self') {
            openAsNewWindowIOS(url || '', target);
            return new AuthPopup(null);
        }
        // about:blank getting sanitized causing browsers like IE/Edge to display
        // brief error message before redirecting to handler.
        const newWin = window.open(url || '', target, optionsString);
        _assert(newWin, auth, "popup-blocked" /* POPUP_BLOCKED */);
        // Flaky on IE edge, encapsulate with a try and catch.
        try {
            newWin.focus();
        }
        catch (e) { }
        return new AuthPopup(newWin);
    }
    function openAsNewWindowIOS(url, target) {
        const el = document.createElement('a');
        el.href = url;
        el.target = target;
        const click = document.createEvent('MouseEvent');
        click.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null);
        el.dispatchEvent(click);
    }

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
    /**
     * URL for Authentication widget which will initiate the OAuth handshake
     *
     * @internal
     */
    const WIDGET_PATH = '__/auth/handler';
    /**
     * URL for emulated environment
     *
     * @internal
     */
    const EMULATOR_WIDGET_PATH = 'emulator/auth/handler';
    function _getRedirectUrl(auth, provider, authType, redirectUrl, eventId, additionalParams) {
        _assert(auth.config.authDomain, auth, "auth-domain-config-required" /* MISSING_AUTH_DOMAIN */);
        _assert(auth.config.apiKey, auth, "invalid-api-key" /* INVALID_API_KEY */);
        const params = {
            apiKey: auth.config.apiKey,
            appName: auth.name,
            authType,
            redirectUrl,
            v: SDK_VERSION$1,
            eventId
        };
        if (provider instanceof FederatedAuthProvider) {
            provider.setDefaultLanguage(auth.languageCode);
            params.providerId = provider.providerId || '';
            if (!isEmpty(provider.getCustomParameters())) {
                params.customParameters = JSON.stringify(provider.getCustomParameters());
            }
            // TODO set additionalParams from the provider as well?
            for (const [key, value] of Object.entries(additionalParams || {})) {
                params[key] = value;
            }
        }
        if (provider instanceof BaseOAuthProvider) {
            const scopes = provider.getScopes().filter(scope => scope !== '');
            if (scopes.length > 0) {
                params.scopes = scopes.join(',');
            }
        }
        if (auth.tenantId) {
            params.tid = auth.tenantId;
        }
        // TODO: maybe set eid as endipointId
        // TODO: maybe set fw as Frameworks.join(",")
        const paramsDict = params;
        for (const key of Object.keys(paramsDict)) {
            if (paramsDict[key] === undefined) {
                delete paramsDict[key];
            }
        }
        return `${getHandlerBase(auth)}?${querystring(paramsDict).slice(1)}`;
    }
    function getHandlerBase({ config }) {
        if (!config.emulator) {
            return `https://${config.authDomain}/${WIDGET_PATH}`;
        }
        return _emulatorUrl(config, EMULATOR_WIDGET_PATH);
    }

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
     * The special web storage event
     *
     */
    const WEB_STORAGE_SUPPORT_KEY = 'webStorageSupport';
    class BrowserPopupRedirectResolver {
        constructor() {
            this.eventManagers = {};
            this.iframes = {};
            this.originValidationPromises = {};
            this._redirectPersistence = browserSessionPersistence;
            this._completeRedirectFn = _getRedirectResult;
        }
        // Wrapping in async even though we don't await anywhere in order
        // to make sure errors are raised as promise rejections
        async _openPopup(auth, provider, authType, eventId) {
            var _a;
            debugAssert((_a = this.eventManagers[auth._key()]) === null || _a === void 0 ? void 0 : _a.manager, '_initialize() not called before _openPopup()');
            const url = _getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId);
            return _open(auth, url, _generateEventId());
        }
        async _openRedirect(auth, provider, authType, eventId) {
            await this._originValidation(auth);
            _setWindowLocation(_getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId));
            return new Promise(() => { });
        }
        _initialize(auth) {
            const key = auth._key();
            if (this.eventManagers[key]) {
                const { manager, promise } = this.eventManagers[key];
                if (manager) {
                    return Promise.resolve(manager);
                }
                else {
                    debugAssert(promise, 'If manager is not set, promise should be');
                    return promise;
                }
            }
            const promise = this.initAndGetManager(auth);
            this.eventManagers[key] = { promise };
            // If the promise is rejected, the key should be removed so that the
            // operation can be retried later.
            promise.catch(() => {
                delete this.eventManagers[key];
            });
            return promise;
        }
        async initAndGetManager(auth) {
            const iframe = await _openIframe(auth);
            const manager = new AuthEventManager(auth);
            iframe.register('authEvent', (iframeEvent) => {
                _assert(iframeEvent === null || iframeEvent === void 0 ? void 0 : iframeEvent.authEvent, auth, "invalid-auth-event" /* INVALID_AUTH_EVENT */);
                // TODO: Consider splitting redirect and popup events earlier on
                const handled = manager.onEvent(iframeEvent.authEvent);
                return { status: handled ? "ACK" /* ACK */ : "ERROR" /* ERROR */ };
            }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
            this.eventManagers[auth._key()] = { manager };
            this.iframes[auth._key()] = iframe;
            return manager;
        }
        _isIframeWebStorageSupported(auth, cb) {
            const iframe = this.iframes[auth._key()];
            iframe.send(WEB_STORAGE_SUPPORT_KEY, { type: WEB_STORAGE_SUPPORT_KEY }, result => {
                var _a;
                const isSupported = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a[WEB_STORAGE_SUPPORT_KEY];
                if (isSupported !== undefined) {
                    cb(!!isSupported);
                }
                _fail(auth, "internal-error" /* INTERNAL_ERROR */);
            }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
        }
        _originValidation(auth) {
            const key = auth._key();
            if (!this.originValidationPromises[key]) {
                this.originValidationPromises[key] = _validateOrigin(auth);
            }
            return this.originValidationPromises[key];
        }
        get _shouldInitProactively() {
            // Mobile browsers and Safari need to optimistically initialize
            return _isMobileBrowser() || _isSafari() || _isIOS();
        }
    }
    /**
     * An implementation of {@link PopupRedirectResolver} suitable for browser
     * based applications.
     *
     * @public
     */
    const browserPopupRedirectResolver = BrowserPopupRedirectResolver;

    var name$1 = "@firebase/auth";
    var version$1 = "0.19.4";

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
    class AuthInterop {
        constructor(auth) {
            this.auth = auth;
            this.internalListeners = new Map();
        }
        getUid() {
            var _a;
            this.assertAuthConfigured();
            return ((_a = this.auth.currentUser) === null || _a === void 0 ? void 0 : _a.uid) || null;
        }
        async getToken(forceRefresh) {
            this.assertAuthConfigured();
            await this.auth._initializationPromise;
            if (!this.auth.currentUser) {
                return null;
            }
            const accessToken = await this.auth.currentUser.getIdToken(forceRefresh);
            return { accessToken };
        }
        addAuthTokenListener(listener) {
            this.assertAuthConfigured();
            if (this.internalListeners.has(listener)) {
                return;
            }
            const unsubscribe = this.auth.onIdTokenChanged(user => {
                var _a;
                listener(((_a = user) === null || _a === void 0 ? void 0 : _a.stsTokenManager.accessToken) || null);
            });
            this.internalListeners.set(listener, unsubscribe);
            this.updateProactiveRefresh();
        }
        removeAuthTokenListener(listener) {
            this.assertAuthConfigured();
            const unsubscribe = this.internalListeners.get(listener);
            if (!unsubscribe) {
                return;
            }
            this.internalListeners.delete(listener);
            unsubscribe();
            this.updateProactiveRefresh();
        }
        assertAuthConfigured() {
            _assert(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth" /* DEPENDENT_SDK_INIT_BEFORE_AUTH */);
        }
        updateProactiveRefresh() {
            if (this.internalListeners.size > 0) {
                this.auth._startProactiveRefresh();
            }
            else {
                this.auth._stopProactiveRefresh();
            }
        }
    }

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
    function getVersionForPlatform(clientPlatform) {
        switch (clientPlatform) {
            case "Node" /* NODE */:
                return 'node';
            case "ReactNative" /* REACT_NATIVE */:
                return 'rn';
            case "Worker" /* WORKER */:
                return 'webworker';
            case "Cordova" /* CORDOVA */:
                return 'cordova';
            default:
                return undefined;
        }
    }
    /** @internal */
    function registerAuth(clientPlatform) {
        _registerComponent(new Component("auth" /* AUTH */, (container, { options: deps }) => {
            const app = container.getProvider('app').getImmediate();
            const { apiKey, authDomain } = app.options;
            return (app => {
                _assert(apiKey && !apiKey.includes(':'), "invalid-api-key" /* INVALID_API_KEY */, { appName: app.name });
                // Auth domain is optional if IdP sign in isn't being used
                _assert(!(authDomain === null || authDomain === void 0 ? void 0 : authDomain.includes(':')), "argument-error" /* ARGUMENT_ERROR */, {
                    appName: app.name
                });
                const config = {
                    apiKey,
                    authDomain,
                    clientPlatform,
                    apiHost: "identitytoolkit.googleapis.com" /* API_HOST */,
                    tokenApiHost: "securetoken.googleapis.com" /* TOKEN_API_HOST */,
                    apiScheme: "https" /* API_SCHEME */,
                    sdkClientVersion: _getClientVersion(clientPlatform)
                };
                const authInstance = new AuthImpl(app, config);
                _initializeAuthInstance(authInstance, deps);
                return authInstance;
            })(app);
        }, "PUBLIC" /* PUBLIC */)
            /**
             * Auth can only be initialized by explicitly calling getAuth() or initializeAuth()
             * For why we do this, See go/firebase-next-auth-init
             */
            .setInstantiationMode("EXPLICIT" /* EXPLICIT */)
            /**
             * Because all firebase products that depend on auth depend on auth-internal directly,
             * we need to initialize auth-internal after auth is initialized to make it available to other firebase products.
             */
            .setInstanceCreatedCallback((container, _instanceIdentifier, _instance) => {
            const authInternalProvider = container.getProvider("auth-internal" /* AUTH_INTERNAL */);
            authInternalProvider.initialize();
        }));
        _registerComponent(new Component("auth-internal" /* AUTH_INTERNAL */, container => {
            const auth = _castAuth(container.getProvider("auth" /* AUTH */).getImmediate());
            return (auth => new AuthInterop(auth))(auth);
        }, "PRIVATE" /* PRIVATE */).setInstantiationMode("EXPLICIT" /* EXPLICIT */));
        registerVersion(name$1, version$1, getVersionForPlatform(clientPlatform));
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name$1, version$1, 'esm2017');
    }

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
    /**
     * Returns the Auth instance associated with the provided {@link @firebase/app#FirebaseApp}.
     * If no instance exists, initializes an Auth instance with platform-specific default dependencies.
     *
     * @param app - The Firebase App.
     *
     * @public
     */
    function getAuth(app = getApp()) {
        const provider = _getProvider(app, 'auth');
        if (provider.isInitialized()) {
            return provider.getImmediate();
        }
        return initializeAuth(app, {
            popupRedirectResolver: browserPopupRedirectResolver,
            persistence: [
                indexedDBLocalPersistence,
                browserLocalPersistence,
                browserSessionPersistence
            ]
        });
    }
    registerAuth("Browser" /* BROWSER */);

    const signinButton = document.getElementById('signin-button');
    const signoutButton = document.getElementById('signout-button');
    const welcomeMessageContainer = document.getElementById('welcome-message-container');
    const welcomeMessage = document.getElementById('welcome-message');

    let initialize$6 = function () {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                signinButton.style.display = 'none';
                signoutButton.style.display = 'inline-block';
                welcomeMessageContainer.removeAttribute('style');
                welcomeMessage.textContent = "你好" + user.email;
            } else {
                welcomeMessageContainer.style.display = 'none';
                signoutButton.style.display = 'none';
                signinButton.style.display = 'inline-block';
                welcomeMessage.textContent = '';
            }
        });
        signoutButton.addEventListener('click', function () {
            const auth = getAuth();
            signOut(auth).then(() => {
                localStorage.removeItem('studyList');
                localStorage.removeItem('studyListDirty');
                localStorage.removeItem('visited');
                localStorage.removeItem('studyResults');
                localStorage.removeItem('state');
                document.location.reload();
            }).catch((error) => {
                console.log(error);
            });
        });
    };

    //TODO may want to stop this and just have it stay shown, with faq over top via absolute position/z-index
    const mainContainer$2 = document.getElementById('container');
    //faq items
    const faqContainer = document.getElementById('faq-container');
    const faqSingleCharWarning = document.getElementById('faq-single-char-warning');
    const faqStudyMode = document.getElementById('faq-study-mode');
    const faqRecommendations = document.getElementById('faq-recommendations');
    const faqContext = document.getElementById('faq-context');
    const faqGeneral = document.getElementById('faq-general');
    const faqExitButton = document.getElementById('faq-exit-button');
    const showStudyFaq = document.getElementById('show-study-faq');
    const showGeneralFaq = document.getElementById('show-general-faq');

    //TODO should combine with faqTypes
    const faqTypesToElement = {
        singleCharWarning: faqSingleCharWarning,
        studyMode: faqStudyMode,
        context: faqContext,
        general: faqGeneral,
        recommendations: faqRecommendations
    };
    const faqTypes = {
        singleCharWarning: 'singleCharWarning',
        studyMode: 'studyMode',
        context: 'context',
        general: 'general',
        recommendations: 'recommendations'
    };

    let showFaq = function (faqType) {
        mainContainer$2.style.display = 'none';
        faqContainer.removeAttribute('style');
        faqTypesToElement[faqType].removeAttribute('style');
    };

    let initialize$5 = function () {
        faqExitButton.addEventListener('click', function () {
            faqContainer.style.display = 'none';
            mainContainer$2.removeAttribute('style');
            Object.values(faqTypesToElement).forEach(x => {
                x.style.display = 'none';
            });
        });
        showStudyFaq.addEventListener('click', function () {
            showFaq(faqTypes.studyMode);
        });
        showGeneralFaq.addEventListener('click', function () {
            showFaq(faqTypes.general);
        });
    };

    const name = "@firebase/database";
    const version = "0.12.4";

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
    /** The semver (www.semver.org) version of the SDK. */
    let SDK_VERSION = '';
    /**
     * SDK_VERSION should be set before any database instance is created
     * @internal
     */
    function setSDKVersion(version) {
        SDK_VERSION = version;
    }

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
     * Wraps a DOM Storage object and:
     * - automatically encode objects as JSON strings before storing them to allow us to store arbitrary types.
     * - prefixes names with "firebase:" to avoid collisions with app data.
     *
     * We automatically (see storage.js) create two such wrappers, one for sessionStorage,
     * and one for localStorage.
     *
     */
    class DOMStorageWrapper {
        /**
         * @param domStorage_ - The underlying storage object (e.g. localStorage or sessionStorage)
         */
        constructor(domStorage_) {
            this.domStorage_ = domStorage_;
            // Use a prefix to avoid collisions with other stuff saved by the app.
            this.prefix_ = 'firebase:';
        }
        /**
         * @param key - The key to save the value under
         * @param value - The value being stored, or null to remove the key.
         */
        set(key, value) {
            if (value == null) {
                this.domStorage_.removeItem(this.prefixedName_(key));
            }
            else {
                this.domStorage_.setItem(this.prefixedName_(key), stringify(value));
            }
        }
        /**
         * @returns The value that was stored under this key, or null
         */
        get(key) {
            const storedVal = this.domStorage_.getItem(this.prefixedName_(key));
            if (storedVal == null) {
                return null;
            }
            else {
                return jsonEval(storedVal);
            }
        }
        remove(key) {
            this.domStorage_.removeItem(this.prefixedName_(key));
        }
        prefixedName_(name) {
            return this.prefix_ + name;
        }
        toString() {
            return this.domStorage_.toString();
        }
    }

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
     * An in-memory storage implementation that matches the API of DOMStorageWrapper
     * (TODO: create interface for both to implement).
     */
    class MemoryStorage {
        constructor() {
            this.cache_ = {};
            this.isInMemoryStorage = true;
        }
        set(key, value) {
            if (value == null) {
                delete this.cache_[key];
            }
            else {
                this.cache_[key] = value;
            }
        }
        get(key) {
            if (contains(this.cache_, key)) {
                return this.cache_[key];
            }
            return null;
        }
        remove(key) {
            delete this.cache_[key];
        }
    }

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
     * Helper to create a DOMStorageWrapper or else fall back to MemoryStorage.
     * TODO: Once MemoryStorage and DOMStorageWrapper have a shared interface this method annotation should change
     * to reflect this type
     *
     * @param domStorageName - Name of the underlying storage object
     *   (e.g. 'localStorage' or 'sessionStorage').
     * @returns Turning off type information until a common interface is defined.
     */
    const createStoragefor = function (domStorageName) {
        try {
            // NOTE: just accessing "localStorage" or "window['localStorage']" may throw a security exception,
            // so it must be inside the try/catch.
            if (typeof window !== 'undefined' &&
                typeof window[domStorageName] !== 'undefined') {
                // Need to test cache. Just because it's here doesn't mean it works
                const domStorage = window[domStorageName];
                domStorage.setItem('firebase:sentinel', 'cache');
                domStorage.removeItem('firebase:sentinel');
                return new DOMStorageWrapper(domStorage);
            }
        }
        catch (e) { }
        // Failed to create wrapper.  Just return in-memory storage.
        // TODO: log?
        return new MemoryStorage();
    };
    /** A storage object that lasts across sessions */
    const PersistentStorage = createStoragefor('localStorage');
    /** A storage object that only lasts one session */
    const SessionStorage = createStoragefor('sessionStorage');

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
    const logClient = new Logger('@firebase/database');
    /**
     * Returns a locally-unique ID (generated by just incrementing up from 0 each time its called).
     */
    const LUIDGenerator = (function () {
        let id = 1;
        return function () {
            return id++;
        };
    })();
    /**
     * Sha1 hash of the input string
     * @param str - The string to hash
     * @returns {!string} The resulting hash
     */
    const sha1 = function (str) {
        const utf8Bytes = stringToByteArray(str);
        const sha1 = new Sha1();
        sha1.update(utf8Bytes);
        const sha1Bytes = sha1.digest();
        return base64.encodeByteArray(sha1Bytes);
    };
    const buildLogMessage_ = function (...varArgs) {
        let message = '';
        for (let i = 0; i < varArgs.length; i++) {
            const arg = varArgs[i];
            if (Array.isArray(arg) ||
                (arg &&
                    typeof arg === 'object' &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    typeof arg.length === 'number')) {
                message += buildLogMessage_.apply(null, arg);
            }
            else if (typeof arg === 'object') {
                message += stringify(arg);
            }
            else {
                message += arg;
            }
            message += ' ';
        }
        return message;
    };
    /**
     * Use this for all debug messages in Firebase.
     */
    let logger = null;
    /**
     * Flag to check for log availability on first log message
     */
    let firstLog_ = true;
    /**
     * The implementation of Firebase.enableLogging (defined here to break dependencies)
     * @param logger_ - A flag to turn on logging, or a custom logger
     * @param persistent - Whether or not to persist logging settings across refreshes
     */
    const enableLogging$1 = function (logger_, persistent) {
        assert(!persistent || logger_ === true || logger_ === false, "Can't turn on custom loggers persistently.");
        if (logger_ === true) {
            logClient.logLevel = LogLevel.VERBOSE;
            logger = logClient.log.bind(logClient);
            if (persistent) {
                SessionStorage.set('logging_enabled', true);
            }
        }
        else if (typeof logger_ === 'function') {
            logger = logger_;
        }
        else {
            logger = null;
            SessionStorage.remove('logging_enabled');
        }
    };
    const log = function (...varArgs) {
        if (firstLog_ === true) {
            firstLog_ = false;
            if (logger === null && SessionStorage.get('logging_enabled') === true) {
                enableLogging$1(true);
            }
        }
        if (logger) {
            const message = buildLogMessage_.apply(null, varArgs);
            logger(message);
        }
    };
    const logWrapper = function (prefix) {
        return function (...varArgs) {
            log(prefix, ...varArgs);
        };
    };
    const error = function (...varArgs) {
        const message = 'FIREBASE INTERNAL ERROR: ' + buildLogMessage_(...varArgs);
        logClient.error(message);
    };
    const fatal = function (...varArgs) {
        const message = `FIREBASE FATAL ERROR: ${buildLogMessage_(...varArgs)}`;
        logClient.error(message);
        throw new Error(message);
    };
    const warn = function (...varArgs) {
        const message = 'FIREBASE WARNING: ' + buildLogMessage_(...varArgs);
        logClient.warn(message);
    };
    /**
     * Logs a warning if the containing page uses https. Called when a call to new Firebase
     * does not use https.
     */
    const warnIfPageIsSecure = function () {
        // Be very careful accessing browser globals. Who knows what may or may not exist.
        if (typeof window !== 'undefined' &&
            window.location &&
            window.location.protocol &&
            window.location.protocol.indexOf('https:') !== -1) {
            warn('Insecure Firebase access from a secure page. ' +
                'Please use https in calls to new Firebase().');
        }
    };
    /**
     * Returns true if data is NaN, or +/- Infinity.
     */
    const isInvalidJSONNumber = function (data) {
        return (typeof data === 'number' &&
            (data !== data || // NaN
                data === Number.POSITIVE_INFINITY ||
                data === Number.NEGATIVE_INFINITY));
    };
    const executeWhenDOMReady = function (fn) {
        if (document.readyState === 'complete') {
            fn();
        }
        else {
            // Modeled after jQuery. Try DOMContentLoaded and onreadystatechange (which
            // fire before onload), but fall back to onload.
            let called = false;
            const wrappedFn = function () {
                if (!document.body) {
                    setTimeout(wrappedFn, Math.floor(10));
                    return;
                }
                if (!called) {
                    called = true;
                    fn();
                }
            };
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', wrappedFn, false);
                // fallback to onload.
                window.addEventListener('load', wrappedFn, false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            else if (document.attachEvent) {
                // IE.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                document.attachEvent('onreadystatechange', () => {
                    if (document.readyState === 'complete') {
                        wrappedFn();
                    }
                });
                // fallback to onload.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                window.attachEvent('onload', wrappedFn);
                // jQuery has an extra hack for IE that we could employ (based on
                // http://javascript.nwbox.com/IEContentLoaded/) But it looks really old.
                // I'm hoping we don't need it.
            }
        }
    };
    /**
     * Minimum key name. Invalid for actual data, used as a marker to sort before any valid names
     */
    const MIN_NAME = '[MIN_NAME]';
    /**
     * Maximum key name. Invalid for actual data, used as a marker to sort above any valid names
     */
    const MAX_NAME = '[MAX_NAME]';
    /**
     * Compares valid Firebase key names, plus min and max name
     */
    const nameCompare = function (a, b) {
        if (a === b) {
            return 0;
        }
        else if (a === MIN_NAME || b === MAX_NAME) {
            return -1;
        }
        else if (b === MIN_NAME || a === MAX_NAME) {
            return 1;
        }
        else {
            const aAsInt = tryParseInt(a), bAsInt = tryParseInt(b);
            if (aAsInt !== null) {
                if (bAsInt !== null) {
                    return aAsInt - bAsInt === 0 ? a.length - b.length : aAsInt - bAsInt;
                }
                else {
                    return -1;
                }
            }
            else if (bAsInt !== null) {
                return 1;
            }
            else {
                return a < b ? -1 : 1;
            }
        }
    };
    /**
     * @returns {!number} comparison result.
     */
    const stringCompare = function (a, b) {
        if (a === b) {
            return 0;
        }
        else if (a < b) {
            return -1;
        }
        else {
            return 1;
        }
    };
    const requireKey = function (key, obj) {
        if (obj && key in obj) {
            return obj[key];
        }
        else {
            throw new Error('Missing required key (' + key + ') in object: ' + stringify(obj));
        }
    };
    const ObjectToUniqueKey = function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            return stringify(obj);
        }
        const keys = [];
        // eslint-disable-next-line guard-for-in
        for (const k in obj) {
            keys.push(k);
        }
        // Export as json, but with the keys sorted.
        keys.sort();
        let key = '{';
        for (let i = 0; i < keys.length; i++) {
            if (i !== 0) {
                key += ',';
            }
            key += stringify(keys[i]);
            key += ':';
            key += ObjectToUniqueKey(obj[keys[i]]);
        }
        key += '}';
        return key;
    };
    /**
     * Splits a string into a number of smaller segments of maximum size
     * @param str - The string
     * @param segsize - The maximum number of chars in the string.
     * @returns The string, split into appropriately-sized chunks
     */
    const splitStringBySize = function (str, segsize) {
        const len = str.length;
        if (len <= segsize) {
            return [str];
        }
        const dataSegs = [];
        for (let c = 0; c < len; c += segsize) {
            if (c + segsize > len) {
                dataSegs.push(str.substring(c, len));
            }
            else {
                dataSegs.push(str.substring(c, c + segsize));
            }
        }
        return dataSegs;
    };
    /**
     * Apply a function to each (key, value) pair in an object or
     * apply a function to each (index, value) pair in an array
     * @param obj - The object or array to iterate over
     * @param fn - The function to apply
     */
    function each(obj, fn) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                fn(key, obj[key]);
            }
        }
    }
    /**
     * Borrowed from http://hg.secondlife.com/llsd/src/tip/js/typedarray.js (MIT License)
     * I made one modification at the end and removed the NaN / Infinity
     * handling (since it seemed broken [caused an overflow] and we don't need it).  See MJL comments.
     * @param v - A double
     *
     */
    const doubleToIEEE754String = function (v) {
        assert(!isInvalidJSONNumber(v), 'Invalid JSON number'); // MJL
        const ebits = 11, fbits = 52;
        const bias = (1 << (ebits - 1)) - 1;
        let s, e, f, ln, i;
        // Compute sign, exponent, fraction
        // Skip NaN / Infinity handling --MJL.
        if (v === 0) {
            e = 0;
            f = 0;
            s = 1 / v === -Infinity ? 1 : 0;
        }
        else {
            s = v < 0;
            v = Math.abs(v);
            if (v >= Math.pow(2, 1 - bias)) {
                // Normalized
                ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
                e = ln + bias;
                f = Math.round(v * Math.pow(2, fbits - ln) - Math.pow(2, fbits));
            }
            else {
                // Denormalized
                e = 0;
                f = Math.round(v / Math.pow(2, 1 - bias - fbits));
            }
        }
        // Pack sign, exponent, fraction
        const bits = [];
        for (i = fbits; i; i -= 1) {
            bits.push(f % 2 ? 1 : 0);
            f = Math.floor(f / 2);
        }
        for (i = ebits; i; i -= 1) {
            bits.push(e % 2 ? 1 : 0);
            e = Math.floor(e / 2);
        }
        bits.push(s ? 1 : 0);
        bits.reverse();
        const str = bits.join('');
        // Return the data as a hex string. --MJL
        let hexByteString = '';
        for (i = 0; i < 64; i += 8) {
            let hexByte = parseInt(str.substr(i, 8), 2).toString(16);
            if (hexByte.length === 1) {
                hexByte = '0' + hexByte;
            }
            hexByteString = hexByteString + hexByte;
        }
        return hexByteString.toLowerCase();
    };
    /**
     * Used to detect if we're in a Chrome content script (which executes in an
     * isolated environment where long-polling doesn't work).
     */
    const isChromeExtensionContentScript = function () {
        return !!(typeof window === 'object' &&
            window['chrome'] &&
            window['chrome']['extension'] &&
            !/^chrome/.test(window.location.href));
    };
    /**
     * Used to detect if we're in a Windows 8 Store app.
     */
    const isWindowsStoreApp = function () {
        // Check for the presence of a couple WinRT globals
        return typeof Windows === 'object' && typeof Windows.UI === 'object';
    };
    /**
     * Converts a server error code to a Javascript Error
     */
    function errorForServerCode(code, query) {
        let reason = 'Unknown Error';
        if (code === 'too_big') {
            reason =
                'The data requested exceeds the maximum size ' +
                    'that can be accessed with a single request.';
        }
        else if (code === 'permission_denied') {
            reason = "Client doesn't have permission to access the desired data.";
        }
        else if (code === 'unavailable') {
            reason = 'The service is unavailable';
        }
        const error = new Error(code + ' at ' + query._path.toString() + ': ' + reason);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.code = code.toUpperCase();
        return error;
    }
    /**
     * Used to test for integer-looking strings
     */
    const INTEGER_REGEXP_ = new RegExp('^-?(0*)\\d{1,10}$');
    /**
     * For use in keys, the minimum possible 32-bit integer.
     */
    const INTEGER_32_MIN = -2147483648;
    /**
     * For use in kyes, the maximum possible 32-bit integer.
     */
    const INTEGER_32_MAX = 2147483647;
    /**
     * If the string contains a 32-bit integer, return it.  Else return null.
     */
    const tryParseInt = function (str) {
        if (INTEGER_REGEXP_.test(str)) {
            const intVal = Number(str);
            if (intVal >= INTEGER_32_MIN && intVal <= INTEGER_32_MAX) {
                return intVal;
            }
        }
        return null;
    };
    /**
     * Helper to run some code but catch any exceptions and re-throw them later.
     * Useful for preventing user callbacks from breaking internal code.
     *
     * Re-throwing the exception from a setTimeout is a little evil, but it's very
     * convenient (we don't have to try to figure out when is a safe point to
     * re-throw it), and the behavior seems reasonable:
     *
     * * If you aren't pausing on exceptions, you get an error in the console with
     *   the correct stack trace.
     * * If you're pausing on all exceptions, the debugger will pause on your
     *   exception and then again when we rethrow it.
     * * If you're only pausing on uncaught exceptions, the debugger will only pause
     *   on us re-throwing it.
     *
     * @param fn - The code to guard.
     */
    const exceptionGuard = function (fn) {
        try {
            fn();
        }
        catch (e) {
            // Re-throw exception when it's safe.
            setTimeout(() => {
                // It used to be that "throw e" would result in a good console error with
                // relevant context, but as of Chrome 39, you just get the firebase.js
                // file/line number where we re-throw it, which is useless. So we log
                // e.stack explicitly.
                const stack = e.stack || '';
                warn('Exception was thrown by user callback.', stack);
                throw e;
            }, Math.floor(0));
        }
    };
    /**
     * @returns {boolean} true if we think we're currently being crawled.
     */
    const beingCrawled = function () {
        const userAgent = (typeof window === 'object' &&
            window['navigator'] &&
            window['navigator']['userAgent']) ||
            '';
        // For now we whitelist the most popular crawlers.  We should refine this to be the set of crawlers we
        // believe to support JavaScript/AJAX rendering.
        // NOTE: Google Webmaster Tools doesn't really belong, but their "This is how a visitor to your website
        // would have seen the page" is flaky if we don't treat it as a crawler.
        return (userAgent.search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i) >= 0);
    };
    /**
     * Same as setTimeout() except on Node.JS it will /not/ prevent the process from exiting.
     *
     * It is removed with clearTimeout() as normal.
     *
     * @param fn - Function to run.
     * @param time - Milliseconds to wait before running.
     * @returns The setTimeout() return value.
     */
    const setTimeoutNonBlocking = function (fn, time) {
        const timeout = setTimeout(fn, time);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof timeout === 'object' && timeout['unref']) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timeout['unref']();
        }
        return timeout;
    };

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
    /**
     * Abstraction around AppCheck's token fetching capabilities.
     */
    class AppCheckTokenProvider {
        constructor(appName_, appCheckProvider) {
            this.appName_ = appName_;
            this.appCheckProvider = appCheckProvider;
            this.appCheck = appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.getImmediate({ optional: true });
            if (!this.appCheck) {
                appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.get().then(appCheck => (this.appCheck = appCheck));
            }
        }
        getToken(forceRefresh) {
            if (!this.appCheck) {
                return new Promise((resolve, reject) => {
                    // Support delayed initialization of FirebaseAppCheck. This allows our
                    // customers to initialize the RTDB SDK before initializing Firebase
                    // AppCheck and ensures that all requests are authenticated if a token
                    // becomes available before the timoeout below expires.
                    setTimeout(() => {
                        if (this.appCheck) {
                            this.getToken(forceRefresh).then(resolve, reject);
                        }
                        else {
                            resolve(null);
                        }
                    }, 0);
                });
            }
            return this.appCheck.getToken(forceRefresh);
        }
        addTokenChangeListener(listener) {
            var _a;
            (_a = this.appCheckProvider) === null || _a === void 0 ? void 0 : _a.get().then(appCheck => appCheck.addTokenListener(listener));
        }
        notifyForInvalidToken() {
            warn(`Provided AppCheck credentials for the app named "${this.appName_}" ` +
                'are invalid. This usually indicates your app was not initialized correctly.');
        }
    }

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
     * Abstraction around FirebaseApp's token fetching capabilities.
     */
    class FirebaseAuthTokenProvider {
        constructor(appName_, firebaseOptions_, authProvider_) {
            this.appName_ = appName_;
            this.firebaseOptions_ = firebaseOptions_;
            this.authProvider_ = authProvider_;
            this.auth_ = null;
            this.auth_ = authProvider_.getImmediate({ optional: true });
            if (!this.auth_) {
                authProvider_.onInit(auth => (this.auth_ = auth));
            }
        }
        getToken(forceRefresh) {
            if (!this.auth_) {
                return new Promise((resolve, reject) => {
                    // Support delayed initialization of FirebaseAuth. This allows our
                    // customers to initialize the RTDB SDK before initializing Firebase
                    // Auth and ensures that all requests are authenticated if a token
                    // becomes available before the timoeout below expires.
                    setTimeout(() => {
                        if (this.auth_) {
                            this.getToken(forceRefresh).then(resolve, reject);
                        }
                        else {
                            resolve(null);
                        }
                    }, 0);
                });
            }
            return this.auth_.getToken(forceRefresh).catch(error => {
                // TODO: Need to figure out all the cases this is raised and whether
                // this makes sense.
                if (error && error.code === 'auth/token-not-initialized') {
                    log('Got auth/token-not-initialized error.  Treating as null token.');
                    return null;
                }
                else {
                    return Promise.reject(error);
                }
            });
        }
        addTokenChangeListener(listener) {
            // TODO: We might want to wrap the listener and call it with no args to
            // avoid a leaky abstraction, but that makes removing the listener harder.
            if (this.auth_) {
                this.auth_.addAuthTokenListener(listener);
            }
            else {
                this.authProvider_
                    .get()
                    .then(auth => auth.addAuthTokenListener(listener));
            }
        }
        removeTokenChangeListener(listener) {
            this.authProvider_
                .get()
                .then(auth => auth.removeAuthTokenListener(listener));
        }
        notifyForInvalidToken() {
            let errorMessage = 'Provided authentication credentials for the app named "' +
                this.appName_ +
                '" are invalid. This usually indicates your app was not ' +
                'initialized correctly. ';
            if ('credential' in this.firebaseOptions_) {
                errorMessage +=
                    'Make sure the "credential" property provided to initializeApp() ' +
                        'is authorized to access the specified "databaseURL" and is from the correct ' +
                        'project.';
            }
            else if ('serviceAccount' in this.firebaseOptions_) {
                errorMessage +=
                    'Make sure the "serviceAccount" property provided to initializeApp() ' +
                        'is authorized to access the specified "databaseURL" and is from the correct ' +
                        'project.';
            }
            else {
                errorMessage +=
                    'Make sure the "apiKey" and "databaseURL" properties provided to ' +
                        'initializeApp() match the values provided for your app at ' +
                        'https://console.firebase.google.com/.';
            }
            warn(errorMessage);
        }
    }
    /* AuthTokenProvider that supplies a constant token. Used by Admin SDK or mockUserToken with emulators. */
    class EmulatorTokenProvider {
        constructor(accessToken) {
            this.accessToken = accessToken;
        }
        getToken(forceRefresh) {
            return Promise.resolve({
                accessToken: this.accessToken
            });
        }
        addTokenChangeListener(listener) {
            // Invoke the listener immediately to match the behavior in Firebase Auth
            // (see packages/auth/src/auth.js#L1807)
            listener(this.accessToken);
        }
        removeTokenChangeListener(listener) { }
        notifyForInvalidToken() { }
    }
    /** A string that is treated as an admin access token by the RTDB emulator. Used by Admin SDK. */
    EmulatorTokenProvider.OWNER = 'owner';

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
    const PROTOCOL_VERSION = '5';
    const VERSION_PARAM = 'v';
    const TRANSPORT_SESSION_PARAM = 's';
    const REFERER_PARAM = 'r';
    const FORGE_REF = 'f';
    // Matches console.firebase.google.com, firebase-console-*.corp.google.com and
    // firebase.corp.google.com
    const FORGE_DOMAIN_RE = /(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/;
    const LAST_SESSION_PARAM = 'ls';
    const APPLICATION_ID_PARAM = 'p';
    const APP_CHECK_TOKEN_PARAM = 'ac';
    const WEBSOCKET = 'websocket';
    const LONG_POLLING = 'long_polling';

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
     * A class that holds metadata about a Repo object
     */
    class RepoInfo {
        /**
         * @param host - Hostname portion of the url for the repo
         * @param secure - Whether or not this repo is accessed over ssl
         * @param namespace - The namespace represented by the repo
         * @param webSocketOnly - Whether to prefer websockets over all other transports (used by Nest).
         * @param nodeAdmin - Whether this instance uses Admin SDK credentials
         * @param persistenceKey - Override the default session persistence storage key
         */
        constructor(host, secure, namespace, webSocketOnly, nodeAdmin = false, persistenceKey = '', includeNamespaceInQueryParams = false) {
            this.secure = secure;
            this.namespace = namespace;
            this.webSocketOnly = webSocketOnly;
            this.nodeAdmin = nodeAdmin;
            this.persistenceKey = persistenceKey;
            this.includeNamespaceInQueryParams = includeNamespaceInQueryParams;
            this._host = host.toLowerCase();
            this._domain = this._host.substr(this._host.indexOf('.') + 1);
            this.internalHost =
                PersistentStorage.get('host:' + host) || this._host;
        }
        isCacheableHost() {
            return this.internalHost.substr(0, 2) === 's-';
        }
        isCustomHost() {
            return (this._domain !== 'firebaseio.com' &&
                this._domain !== 'firebaseio-demo.com');
        }
        get host() {
            return this._host;
        }
        set host(newHost) {
            if (newHost !== this.internalHost) {
                this.internalHost = newHost;
                if (this.isCacheableHost()) {
                    PersistentStorage.set('host:' + this._host, this.internalHost);
                }
            }
        }
        toString() {
            let str = this.toURLString();
            if (this.persistenceKey) {
                str += '<' + this.persistenceKey + '>';
            }
            return str;
        }
        toURLString() {
            const protocol = this.secure ? 'https://' : 'http://';
            const query = this.includeNamespaceInQueryParams
                ? `?ns=${this.namespace}`
                : '';
            return `${protocol}${this.host}/${query}`;
        }
    }
    function repoInfoNeedsQueryParam(repoInfo) {
        return (repoInfo.host !== repoInfo.internalHost ||
            repoInfo.isCustomHost() ||
            repoInfo.includeNamespaceInQueryParams);
    }
    /**
     * Returns the websocket URL for this repo
     * @param repoInfo - RepoInfo object
     * @param type - of connection
     * @param params - list
     * @returns The URL for this repo
     */
    function repoInfoConnectionURL(repoInfo, type, params) {
        assert(typeof type === 'string', 'typeof type must == string');
        assert(typeof params === 'object', 'typeof params must == object');
        let connURL;
        if (type === WEBSOCKET) {
            connURL =
                (repoInfo.secure ? 'wss://' : 'ws://') + repoInfo.internalHost + '/.ws?';
        }
        else if (type === LONG_POLLING) {
            connURL =
                (repoInfo.secure ? 'https://' : 'http://') +
                    repoInfo.internalHost +
                    '/.lp?';
        }
        else {
            throw new Error('Unknown connection type: ' + type);
        }
        if (repoInfoNeedsQueryParam(repoInfo)) {
            params['ns'] = repoInfo.namespace;
        }
        const pairs = [];
        each(params, (key, value) => {
            pairs.push(key + '=' + value);
        });
        return connURL + pairs.join('&');
    }

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
     * Tracks a collection of stats.
     */
    class StatsCollection {
        constructor() {
            this.counters_ = {};
        }
        incrementCounter(name, amount = 1) {
            if (!contains(this.counters_, name)) {
                this.counters_[name] = 0;
            }
            this.counters_[name] += amount;
        }
        get() {
            return deepCopy(this.counters_);
        }
    }

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
    const collections = {};
    const reporters = {};
    function statsManagerGetCollection(repoInfo) {
        const hashString = repoInfo.toString();
        if (!collections[hashString]) {
            collections[hashString] = new StatsCollection();
        }
        return collections[hashString];
    }
    function statsManagerGetOrCreateReporter(repoInfo, creatorFunction) {
        const hashString = repoInfo.toString();
        if (!reporters[hashString]) {
            reporters[hashString] = creatorFunction();
        }
        return reporters[hashString];
    }

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
     * This class ensures the packets from the server arrive in order
     * This class takes data from the server and ensures it gets passed into the callbacks in order.
     */
    class PacketReceiver {
        /**
         * @param onMessage_
         */
        constructor(onMessage_) {
            this.onMessage_ = onMessage_;
            this.pendingResponses = [];
            this.currentResponseNum = 0;
            this.closeAfterResponse = -1;
            this.onClose = null;
        }
        closeAfter(responseNum, callback) {
            this.closeAfterResponse = responseNum;
            this.onClose = callback;
            if (this.closeAfterResponse < this.currentResponseNum) {
                this.onClose();
                this.onClose = null;
            }
        }
        /**
         * Each message from the server comes with a response number, and an array of data. The responseNumber
         * allows us to ensure that we process them in the right order, since we can't be guaranteed that all
         * browsers will respond in the same order as the requests we sent
         */
        handleResponse(requestNum, data) {
            this.pendingResponses[requestNum] = data;
            while (this.pendingResponses[this.currentResponseNum]) {
                const toProcess = this.pendingResponses[this.currentResponseNum];
                delete this.pendingResponses[this.currentResponseNum];
                for (let i = 0; i < toProcess.length; ++i) {
                    if (toProcess[i]) {
                        exceptionGuard(() => {
                            this.onMessage_(toProcess[i]);
                        });
                    }
                }
                if (this.currentResponseNum === this.closeAfterResponse) {
                    if (this.onClose) {
                        this.onClose();
                        this.onClose = null;
                    }
                    break;
                }
                this.currentResponseNum++;
            }
        }
    }

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
    // URL query parameters associated with longpolling
    const FIREBASE_LONGPOLL_START_PARAM = 'start';
    const FIREBASE_LONGPOLL_CLOSE_COMMAND = 'close';
    const FIREBASE_LONGPOLL_COMMAND_CB_NAME = 'pLPCommand';
    const FIREBASE_LONGPOLL_DATA_CB_NAME = 'pRTLPCB';
    const FIREBASE_LONGPOLL_ID_PARAM = 'id';
    const FIREBASE_LONGPOLL_PW_PARAM = 'pw';
    const FIREBASE_LONGPOLL_SERIAL_PARAM = 'ser';
    const FIREBASE_LONGPOLL_CALLBACK_ID_PARAM = 'cb';
    const FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM = 'seg';
    const FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET = 'ts';
    const FIREBASE_LONGPOLL_DATA_PARAM = 'd';
    const FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM = 'dframe';
    //Data size constants.
    //TODO: Perf: the maximum length actually differs from browser to browser.
    // We should check what browser we're on and set accordingly.
    const MAX_URL_DATA_SIZE = 1870;
    const SEG_HEADER_SIZE = 30; //ie: &seg=8299234&ts=982389123&d=
    const MAX_PAYLOAD_SIZE = MAX_URL_DATA_SIZE - SEG_HEADER_SIZE;
    /**
     * Keepalive period
     * send a fresh request at minimum every 25 seconds. Opera has a maximum request
     * length of 30 seconds that we can't exceed.
     */
    const KEEPALIVE_REQUEST_INTERVAL = 25000;
    /**
     * How long to wait before aborting a long-polling connection attempt.
     */
    const LP_CONNECT_TIMEOUT = 30000;
    /**
     * This class manages a single long-polling connection.
     */
    class BrowserPollConnection {
        /**
         * @param connId An identifier for this connection, used for logging
         * @param repoInfo The info for the endpoint to send data to.
         * @param applicationId The Firebase App ID for this project.
         * @param appCheckToken The AppCheck token for this client.
         * @param authToken The AuthToken to use for this connection.
         * @param transportSessionId Optional transportSessionid if we are
         * reconnecting for an existing transport session
         * @param lastSessionId Optional lastSessionId if the PersistentConnection has
         * already created a connection previously
         */
        constructor(connId, repoInfo, applicationId, appCheckToken, authToken, transportSessionId, lastSessionId) {
            this.connId = connId;
            this.repoInfo = repoInfo;
            this.applicationId = applicationId;
            this.appCheckToken = appCheckToken;
            this.authToken = authToken;
            this.transportSessionId = transportSessionId;
            this.lastSessionId = lastSessionId;
            this.bytesSent = 0;
            this.bytesReceived = 0;
            this.everConnected_ = false;
            this.log_ = logWrapper(connId);
            this.stats_ = statsManagerGetCollection(repoInfo);
            this.urlFn = (params) => {
                // Always add the token if we have one.
                if (this.appCheckToken) {
                    params[APP_CHECK_TOKEN_PARAM] = this.appCheckToken;
                }
                return repoInfoConnectionURL(repoInfo, LONG_POLLING, params);
            };
        }
        /**
         * @param onMessage - Callback when messages arrive
         * @param onDisconnect - Callback with connection lost.
         */
        open(onMessage, onDisconnect) {
            this.curSegmentNum = 0;
            this.onDisconnect_ = onDisconnect;
            this.myPacketOrderer = new PacketReceiver(onMessage);
            this.isClosed_ = false;
            this.connectTimeoutTimer_ = setTimeout(() => {
                this.log_('Timed out trying to connect.');
                // Make sure we clear the host cache
                this.onClosed_();
                this.connectTimeoutTimer_ = null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, Math.floor(LP_CONNECT_TIMEOUT));
            // Ensure we delay the creation of the iframe until the DOM is loaded.
            executeWhenDOMReady(() => {
                if (this.isClosed_) {
                    return;
                }
                //Set up a callback that gets triggered once a connection is set up.
                this.scriptTagHolder = new FirebaseIFrameScriptHolder((...args) => {
                    const [command, arg1, arg2, arg3, arg4] = args;
                    this.incrementIncomingBytes_(args);
                    if (!this.scriptTagHolder) {
                        return; // we closed the connection.
                    }
                    if (this.connectTimeoutTimer_) {
                        clearTimeout(this.connectTimeoutTimer_);
                        this.connectTimeoutTimer_ = null;
                    }
                    this.everConnected_ = true;
                    if (command === FIREBASE_LONGPOLL_START_PARAM) {
                        this.id = arg1;
                        this.password = arg2;
                    }
                    else if (command === FIREBASE_LONGPOLL_CLOSE_COMMAND) {
                        // Don't clear the host cache. We got a response from the server, so we know it's reachable
                        if (arg1) {
                            // We aren't expecting any more data (other than what the server's already in the process of sending us
                            // through our already open polls), so don't send any more.
                            this.scriptTagHolder.sendNewPolls = false;
                            // arg1 in this case is the last response number sent by the server. We should try to receive
                            // all of the responses up to this one before closing
                            this.myPacketOrderer.closeAfter(arg1, () => {
                                this.onClosed_();
                            });
                        }
                        else {
                            this.onClosed_();
                        }
                    }
                    else {
                        throw new Error('Unrecognized command received: ' + command);
                    }
                }, (...args) => {
                    const [pN, data] = args;
                    this.incrementIncomingBytes_(args);
                    this.myPacketOrderer.handleResponse(pN, data);
                }, () => {
                    this.onClosed_();
                }, this.urlFn);
                //Send the initial request to connect. The serial number is simply to keep the browser from pulling previous results
                //from cache.
                const urlParams = {};
                urlParams[FIREBASE_LONGPOLL_START_PARAM] = 't';
                urlParams[FIREBASE_LONGPOLL_SERIAL_PARAM] = Math.floor(Math.random() * 100000000);
                if (this.scriptTagHolder.uniqueCallbackIdentifier) {
                    urlParams[FIREBASE_LONGPOLL_CALLBACK_ID_PARAM] =
                        this.scriptTagHolder.uniqueCallbackIdentifier;
                }
                urlParams[VERSION_PARAM] = PROTOCOL_VERSION;
                if (this.transportSessionId) {
                    urlParams[TRANSPORT_SESSION_PARAM] = this.transportSessionId;
                }
                if (this.lastSessionId) {
                    urlParams[LAST_SESSION_PARAM] = this.lastSessionId;
                }
                if (this.applicationId) {
                    urlParams[APPLICATION_ID_PARAM] = this.applicationId;
                }
                if (this.appCheckToken) {
                    urlParams[APP_CHECK_TOKEN_PARAM] = this.appCheckToken;
                }
                if (typeof location !== 'undefined' &&
                    location.hostname &&
                    FORGE_DOMAIN_RE.test(location.hostname)) {
                    urlParams[REFERER_PARAM] = FORGE_REF;
                }
                const connectURL = this.urlFn(urlParams);
                this.log_('Connecting via long-poll to ' + connectURL);
                this.scriptTagHolder.addTag(connectURL, () => {
                    /* do nothing */
                });
            });
        }
        /**
         * Call this when a handshake has completed successfully and we want to consider the connection established
         */
        start() {
            this.scriptTagHolder.startLongPoll(this.id, this.password);
            this.addDisconnectPingFrame(this.id, this.password);
        }
        /**
         * Forces long polling to be considered as a potential transport
         */
        static forceAllow() {
            BrowserPollConnection.forceAllow_ = true;
        }
        /**
         * Forces longpolling to not be considered as a potential transport
         */
        static forceDisallow() {
            BrowserPollConnection.forceDisallow_ = true;
        }
        // Static method, use string literal so it can be accessed in a generic way
        static isAvailable() {
            if (BrowserPollConnection.forceAllow_) {
                return true;
            }
            else {
                // NOTE: In React-Native there's normally no 'document', but if you debug a React-Native app in
                // the Chrome debugger, 'document' is defined, but document.createElement is null (2015/06/08).
                return (!BrowserPollConnection.forceDisallow_ &&
                    typeof document !== 'undefined' &&
                    document.createElement != null &&
                    !isChromeExtensionContentScript() &&
                    !isWindowsStoreApp());
            }
        }
        /**
         * No-op for polling
         */
        markConnectionHealthy() { }
        /**
         * Stops polling and cleans up the iframe
         */
        shutdown_() {
            this.isClosed_ = true;
            if (this.scriptTagHolder) {
                this.scriptTagHolder.close();
                this.scriptTagHolder = null;
            }
            //remove the disconnect frame, which will trigger an XHR call to the server to tell it we're leaving.
            if (this.myDisconnFrame) {
                document.body.removeChild(this.myDisconnFrame);
                this.myDisconnFrame = null;
            }
            if (this.connectTimeoutTimer_) {
                clearTimeout(this.connectTimeoutTimer_);
                this.connectTimeoutTimer_ = null;
            }
        }
        /**
         * Triggered when this transport is closed
         */
        onClosed_() {
            if (!this.isClosed_) {
                this.log_('Longpoll is closing itself');
                this.shutdown_();
                if (this.onDisconnect_) {
                    this.onDisconnect_(this.everConnected_);
                    this.onDisconnect_ = null;
                }
            }
        }
        /**
         * External-facing close handler. RealTime has requested we shut down. Kill our connection and tell the server
         * that we've left.
         */
        close() {
            if (!this.isClosed_) {
                this.log_('Longpoll is being closed.');
                this.shutdown_();
            }
        }
        /**
         * Send the JSON object down to the server. It will need to be stringified, base64 encoded, and then
         * broken into chunks (since URLs have a small maximum length).
         * @param data - The JSON data to transmit.
         */
        send(data) {
            const dataStr = stringify(data);
            this.bytesSent += dataStr.length;
            this.stats_.incrementCounter('bytes_sent', dataStr.length);
            //first, lets get the base64-encoded data
            const base64data = base64Encode(dataStr);
            //We can only fit a certain amount in each URL, so we need to split this request
            //up into multiple pieces if it doesn't fit in one request.
            const dataSegs = splitStringBySize(base64data, MAX_PAYLOAD_SIZE);
            //Enqueue each segment for transmission. We assign each chunk a sequential ID and a total number
            //of segments so that we can reassemble the packet on the server.
            for (let i = 0; i < dataSegs.length; i++) {
                this.scriptTagHolder.enqueueSegment(this.curSegmentNum, dataSegs.length, dataSegs[i]);
                this.curSegmentNum++;
            }
        }
        /**
         * This is how we notify the server that we're leaving.
         * We aren't able to send requests with DHTML on a window close event, but we can
         * trigger XHR requests in some browsers (everything but Opera basically).
         */
        addDisconnectPingFrame(id, pw) {
            this.myDisconnFrame = document.createElement('iframe');
            const urlParams = {};
            urlParams[FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM] = 't';
            urlParams[FIREBASE_LONGPOLL_ID_PARAM] = id;
            urlParams[FIREBASE_LONGPOLL_PW_PARAM] = pw;
            this.myDisconnFrame.src = this.urlFn(urlParams);
            this.myDisconnFrame.style.display = 'none';
            document.body.appendChild(this.myDisconnFrame);
        }
        /**
         * Used to track the bytes received by this client
         */
        incrementIncomingBytes_(args) {
            // TODO: This is an annoying perf hit just to track the number of incoming bytes.  Maybe it should be opt-in.
            const bytesReceived = stringify(args).length;
            this.bytesReceived += bytesReceived;
            this.stats_.incrementCounter('bytes_received', bytesReceived);
        }
    }
    /*********************************************************************************************
     * A wrapper around an iframe that is used as a long-polling script holder.
     *********************************************************************************************/
    class FirebaseIFrameScriptHolder {
        /**
         * @param commandCB - The callback to be called when control commands are recevied from the server.
         * @param onMessageCB - The callback to be triggered when responses arrive from the server.
         * @param onDisconnect - The callback to be triggered when this tag holder is closed
         * @param urlFn - A function that provides the URL of the endpoint to send data to.
         */
        constructor(commandCB, onMessageCB, onDisconnect, urlFn) {
            this.onDisconnect = onDisconnect;
            this.urlFn = urlFn;
            //We maintain a count of all of the outstanding requests, because if we have too many active at once it can cause
            //problems in some browsers.
            this.outstandingRequests = new Set();
            //A queue of the pending segments waiting for transmission to the server.
            this.pendingSegs = [];
            //A serial number. We use this for two things:
            // 1) A way to ensure the browser doesn't cache responses to polls
            // 2) A way to make the server aware when long-polls arrive in a different order than we started them. The
            //    server needs to release both polls in this case or it will cause problems in Opera since Opera can only execute
            //    JSONP code in the order it was added to the iframe.
            this.currentSerial = Math.floor(Math.random() * 100000000);
            // This gets set to false when we're "closing down" the connection (e.g. we're switching transports but there's still
            // incoming data from the server that we're waiting for).
            this.sendNewPolls = true;
            {
                //Each script holder registers a couple of uniquely named callbacks with the window. These are called from the
                //iframes where we put the long-polling script tags. We have two callbacks:
                //   1) Command Callback - Triggered for control issues, like starting a connection.
                //   2) Message Callback - Triggered when new data arrives.
                this.uniqueCallbackIdentifier = LUIDGenerator();
                window[FIREBASE_LONGPOLL_COMMAND_CB_NAME + this.uniqueCallbackIdentifier] = commandCB;
                window[FIREBASE_LONGPOLL_DATA_CB_NAME + this.uniqueCallbackIdentifier] =
                    onMessageCB;
                //Create an iframe for us to add script tags to.
                this.myIFrame = FirebaseIFrameScriptHolder.createIFrame_();
                // Set the iframe's contents.
                let script = '';
                // if we set a javascript url, it's IE and we need to set the document domain. The javascript url is sufficient
                // for ie9, but ie8 needs to do it again in the document itself.
                if (this.myIFrame.src &&
                    this.myIFrame.src.substr(0, 'javascript:'.length) === 'javascript:') {
                    const currentDomain = document.domain;
                    script = '<script>document.domain="' + currentDomain + '";</script>';
                }
                const iframeContents = '<html><body>' + script + '</body></html>';
                try {
                    this.myIFrame.doc.open();
                    this.myIFrame.doc.write(iframeContents);
                    this.myIFrame.doc.close();
                }
                catch (e) {
                    log('frame writing exception');
                    if (e.stack) {
                        log(e.stack);
                    }
                    log(e);
                }
            }
        }
        /**
         * Each browser has its own funny way to handle iframes. Here we mush them all together into one object that I can
         * actually use.
         */
        static createIFrame_() {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            // This is necessary in order to initialize the document inside the iframe
            if (document.body) {
                document.body.appendChild(iframe);
                try {
                    // If document.domain has been modified in IE, this will throw an error, and we need to set the
                    // domain of the iframe's document manually. We can do this via a javascript: url as the src attribute
                    // Also note that we must do this *after* the iframe has been appended to the page. Otherwise it doesn't work.
                    const a = iframe.contentWindow.document;
                    if (!a) {
                        // Apologies for the log-spam, I need to do something to keep closure from optimizing out the assignment above.
                        log('No IE domain setting required');
                    }
                }
                catch (e) {
                    const domain = document.domain;
                    iframe.src =
                        "javascript:void((function(){document.open();document.domain='" +
                            domain +
                            "';document.close();})())";
                }
            }
            else {
                // LongPollConnection attempts to delay initialization until the document is ready, so hopefully this
                // never gets hit.
                throw 'Document body has not initialized. Wait to initialize Firebase until after the document is ready.';
            }
            // Get the document of the iframe in a browser-specific way.
            if (iframe.contentDocument) {
                iframe.doc = iframe.contentDocument; // Firefox, Opera, Safari
            }
            else if (iframe.contentWindow) {
                iframe.doc = iframe.contentWindow.document; // Internet Explorer
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            else if (iframe.document) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                iframe.doc = iframe.document; //others?
            }
            return iframe;
        }
        /**
         * Cancel all outstanding queries and remove the frame.
         */
        close() {
            //Mark this iframe as dead, so no new requests are sent.
            this.alive = false;
            if (this.myIFrame) {
                //We have to actually remove all of the html inside this iframe before removing it from the
                //window, or IE will continue loading and executing the script tags we've already added, which
                //can lead to some errors being thrown. Setting innerHTML seems to be the easiest way to do this.
                this.myIFrame.doc.body.innerHTML = '';
                setTimeout(() => {
                    if (this.myIFrame !== null) {
                        document.body.removeChild(this.myIFrame);
                        this.myIFrame = null;
                    }
                }, Math.floor(0));
            }
            // Protect from being called recursively.
            const onDisconnect = this.onDisconnect;
            if (onDisconnect) {
                this.onDisconnect = null;
                onDisconnect();
            }
        }
        /**
         * Actually start the long-polling session by adding the first script tag(s) to the iframe.
         * @param id - The ID of this connection
         * @param pw - The password for this connection
         */
        startLongPoll(id, pw) {
            this.myID = id;
            this.myPW = pw;
            this.alive = true;
            //send the initial request. If there are requests queued, make sure that we transmit as many as we are currently able to.
            while (this.newRequest_()) { }
        }
        /**
         * This is called any time someone might want a script tag to be added. It adds a script tag when there aren't
         * too many outstanding requests and we are still alive.
         *
         * If there are outstanding packet segments to send, it sends one. If there aren't, it sends a long-poll anyways if
         * needed.
         */
        newRequest_() {
            // We keep one outstanding request open all the time to receive data, but if we need to send data
            // (pendingSegs.length > 0) then we create a new request to send the data.  The server will automatically
            // close the old request.
            if (this.alive &&
                this.sendNewPolls &&
                this.outstandingRequests.size < (this.pendingSegs.length > 0 ? 2 : 1)) {
                //construct our url
                this.currentSerial++;
                const urlParams = {};
                urlParams[FIREBASE_LONGPOLL_ID_PARAM] = this.myID;
                urlParams[FIREBASE_LONGPOLL_PW_PARAM] = this.myPW;
                urlParams[FIREBASE_LONGPOLL_SERIAL_PARAM] = this.currentSerial;
                let theURL = this.urlFn(urlParams);
                //Now add as much data as we can.
                let curDataString = '';
                let i = 0;
                while (this.pendingSegs.length > 0) {
                    //first, lets see if the next segment will fit.
                    const nextSeg = this.pendingSegs[0];
                    if (nextSeg.d.length +
                        SEG_HEADER_SIZE +
                        curDataString.length <=
                        MAX_URL_DATA_SIZE) {
                        //great, the segment will fit. Lets append it.
                        const theSeg = this.pendingSegs.shift();
                        curDataString =
                            curDataString +
                                '&' +
                                FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM +
                                i +
                                '=' +
                                theSeg.seg +
                                '&' +
                                FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET +
                                i +
                                '=' +
                                theSeg.ts +
                                '&' +
                                FIREBASE_LONGPOLL_DATA_PARAM +
                                i +
                                '=' +
                                theSeg.d;
                        i++;
                    }
                    else {
                        break;
                    }
                }
                theURL = theURL + curDataString;
                this.addLongPollTag_(theURL, this.currentSerial);
                return true;
            }
            else {
                return false;
            }
        }
        /**
         * Queue a packet for transmission to the server.
         * @param segnum - A sequential id for this packet segment used for reassembly
         * @param totalsegs - The total number of segments in this packet
         * @param data - The data for this segment.
         */
        enqueueSegment(segnum, totalsegs, data) {
            //add this to the queue of segments to send.
            this.pendingSegs.push({ seg: segnum, ts: totalsegs, d: data });
            //send the data immediately if there isn't already data being transmitted, unless
            //startLongPoll hasn't been called yet.
            if (this.alive) {
                this.newRequest_();
            }
        }
        /**
         * Add a script tag for a regular long-poll request.
         * @param url - The URL of the script tag.
         * @param serial - The serial number of the request.
         */
        addLongPollTag_(url, serial) {
            //remember that we sent this request.
            this.outstandingRequests.add(serial);
            const doNewRequest = () => {
                this.outstandingRequests.delete(serial);
                this.newRequest_();
            };
            // If this request doesn't return on its own accord (by the server sending us some data), we'll
            // create a new one after the KEEPALIVE interval to make sure we always keep a fresh request open.
            const keepaliveTimeout = setTimeout(doNewRequest, Math.floor(KEEPALIVE_REQUEST_INTERVAL));
            const readyStateCB = () => {
                // Request completed.  Cancel the keepalive.
                clearTimeout(keepaliveTimeout);
                // Trigger a new request so we can continue receiving data.
                doNewRequest();
            };
            this.addTag(url, readyStateCB);
        }
        /**
         * Add an arbitrary script tag to the iframe.
         * @param url - The URL for the script tag source.
         * @param loadCB - A callback to be triggered once the script has loaded.
         */
        addTag(url, loadCB) {
            {
                setTimeout(() => {
                    try {
                        // if we're already closed, don't add this poll
                        if (!this.sendNewPolls) {
                            return;
                        }
                        const newScript = this.myIFrame.doc.createElement('script');
                        newScript.type = 'text/javascript';
                        newScript.async = true;
                        newScript.src = url;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        newScript.onload = newScript.onreadystatechange =
                            function () {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const rstate = newScript.readyState;
                                if (!rstate || rstate === 'loaded' || rstate === 'complete') {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    newScript.onload = newScript.onreadystatechange = null;
                                    if (newScript.parentNode) {
                                        newScript.parentNode.removeChild(newScript);
                                    }
                                    loadCB();
                                }
                            };
                        newScript.onerror = () => {
                            log('Long-poll script failed to load: ' + url);
                            this.sendNewPolls = false;
                            this.close();
                        };
                        this.myIFrame.doc.body.appendChild(newScript);
                    }
                    catch (e) {
                        // TODO: we should make this error visible somehow
                    }
                }, Math.floor(1));
            }
        }
    }

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
    const WEBSOCKET_MAX_FRAME_SIZE = 16384;
    const WEBSOCKET_KEEPALIVE_INTERVAL = 45000;
    let WebSocketImpl = null;
    if (typeof MozWebSocket !== 'undefined') {
        WebSocketImpl = MozWebSocket;
    }
    else if (typeof WebSocket !== 'undefined') {
        WebSocketImpl = WebSocket;
    }
    /**
     * Create a new websocket connection with the given callbacks.
     */
    class WebSocketConnection {
        /**
         * @param connId identifier for this transport
         * @param repoInfo The info for the websocket endpoint.
         * @param applicationId The Firebase App ID for this project.
         * @param appCheckToken The App Check Token for this client.
         * @param authToken The Auth Token for this client.
         * @param transportSessionId Optional transportSessionId if this is connecting
         * to an existing transport session
         * @param lastSessionId Optional lastSessionId if there was a previous
         * connection
         */
        constructor(connId, repoInfo, applicationId, appCheckToken, authToken, transportSessionId, lastSessionId) {
            this.connId = connId;
            this.applicationId = applicationId;
            this.appCheckToken = appCheckToken;
            this.authToken = authToken;
            this.keepaliveTimer = null;
            this.frames = null;
            this.totalFrames = 0;
            this.bytesSent = 0;
            this.bytesReceived = 0;
            this.log_ = logWrapper(this.connId);
            this.stats_ = statsManagerGetCollection(repoInfo);
            this.connURL = WebSocketConnection.connectionURL_(repoInfo, transportSessionId, lastSessionId, appCheckToken);
            this.nodeAdmin = repoInfo.nodeAdmin;
        }
        /**
         * @param repoInfo - The info for the websocket endpoint.
         * @param transportSessionId - Optional transportSessionId if this is connecting to an existing transport
         *                                         session
         * @param lastSessionId - Optional lastSessionId if there was a previous connection
         * @returns connection url
         */
        static connectionURL_(repoInfo, transportSessionId, lastSessionId, appCheckToken) {
            const urlParams = {};
            urlParams[VERSION_PARAM] = PROTOCOL_VERSION;
            if (typeof location !== 'undefined' &&
                location.hostname &&
                FORGE_DOMAIN_RE.test(location.hostname)) {
                urlParams[REFERER_PARAM] = FORGE_REF;
            }
            if (transportSessionId) {
                urlParams[TRANSPORT_SESSION_PARAM] = transportSessionId;
            }
            if (lastSessionId) {
                urlParams[LAST_SESSION_PARAM] = lastSessionId;
            }
            if (appCheckToken) {
                urlParams[APP_CHECK_TOKEN_PARAM] = appCheckToken;
            }
            return repoInfoConnectionURL(repoInfo, WEBSOCKET, urlParams);
        }
        /**
         * @param onMessage - Callback when messages arrive
         * @param onDisconnect - Callback with connection lost.
         */
        open(onMessage, onDisconnect) {
            this.onDisconnect = onDisconnect;
            this.onMessage = onMessage;
            this.log_('Websocket connecting to ' + this.connURL);
            this.everConnected_ = false;
            // Assume failure until proven otherwise.
            PersistentStorage.set('previous_websocket_failure', true);
            try {
                if (isNodeSdk()) ;
                else {
                    const options = {
                        headers: {
                            'X-Firebase-GMPID': this.applicationId || '',
                            'X-Firebase-AppCheck': this.appCheckToken || ''
                        }
                    };
                    this.mySock = new WebSocketImpl(this.connURL, [], options);
                }
            }
            catch (e) {
                this.log_('Error instantiating WebSocket.');
                const error = e.message || e.data;
                if (error) {
                    this.log_(error);
                }
                this.onClosed_();
                return;
            }
            this.mySock.onopen = () => {
                this.log_('Websocket connected.');
                this.everConnected_ = true;
            };
            this.mySock.onclose = () => {
                this.log_('Websocket connection was disconnected.');
                this.mySock = null;
                this.onClosed_();
            };
            this.mySock.onmessage = m => {
                this.handleIncomingFrame(m);
            };
            this.mySock.onerror = e => {
                this.log_('WebSocket error.  Closing connection.');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error = e.message || e.data;
                if (error) {
                    this.log_(error);
                }
                this.onClosed_();
            };
        }
        /**
         * No-op for websockets, we don't need to do anything once the connection is confirmed as open
         */
        start() { }
        static forceDisallow() {
            WebSocketConnection.forceDisallow_ = true;
        }
        static isAvailable() {
            let isOldAndroid = false;
            if (typeof navigator !== 'undefined' && navigator.userAgent) {
                const oldAndroidRegex = /Android ([0-9]{0,}\.[0-9]{0,})/;
                const oldAndroidMatch = navigator.userAgent.match(oldAndroidRegex);
                if (oldAndroidMatch && oldAndroidMatch.length > 1) {
                    if (parseFloat(oldAndroidMatch[1]) < 4.4) {
                        isOldAndroid = true;
                    }
                }
            }
            return (!isOldAndroid &&
                WebSocketImpl !== null &&
                !WebSocketConnection.forceDisallow_);
        }
        /**
         * Returns true if we previously failed to connect with this transport.
         */
        static previouslyFailed() {
            // If our persistent storage is actually only in-memory storage,
            // we default to assuming that it previously failed to be safe.
            return (PersistentStorage.isInMemoryStorage ||
                PersistentStorage.get('previous_websocket_failure') === true);
        }
        markConnectionHealthy() {
            PersistentStorage.remove('previous_websocket_failure');
        }
        appendFrame_(data) {
            this.frames.push(data);
            if (this.frames.length === this.totalFrames) {
                const fullMess = this.frames.join('');
                this.frames = null;
                const jsonMess = jsonEval(fullMess);
                //handle the message
                this.onMessage(jsonMess);
            }
        }
        /**
         * @param frameCount - The number of frames we are expecting from the server
         */
        handleNewFrameCount_(frameCount) {
            this.totalFrames = frameCount;
            this.frames = [];
        }
        /**
         * Attempts to parse a frame count out of some text. If it can't, assumes a value of 1
         * @returns Any remaining data to be process, or null if there is none
         */
        extractFrameCount_(data) {
            assert(this.frames === null, 'We already have a frame buffer');
            // TODO: The server is only supposed to send up to 9999 frames (i.e. length <= 4), but that isn't being enforced
            // currently.  So allowing larger frame counts (length <= 6).  See https://app.asana.com/0/search/8688598998380/8237608042508
            if (data.length <= 6) {
                const frameCount = Number(data);
                if (!isNaN(frameCount)) {
                    this.handleNewFrameCount_(frameCount);
                    return null;
                }
            }
            this.handleNewFrameCount_(1);
            return data;
        }
        /**
         * Process a websocket frame that has arrived from the server.
         * @param mess - The frame data
         */
        handleIncomingFrame(mess) {
            if (this.mySock === null) {
                return; // Chrome apparently delivers incoming packets even after we .close() the connection sometimes.
            }
            const data = mess['data'];
            this.bytesReceived += data.length;
            this.stats_.incrementCounter('bytes_received', data.length);
            this.resetKeepAlive();
            if (this.frames !== null) {
                // we're buffering
                this.appendFrame_(data);
            }
            else {
                // try to parse out a frame count, otherwise, assume 1 and process it
                const remainingData = this.extractFrameCount_(data);
                if (remainingData !== null) {
                    this.appendFrame_(remainingData);
                }
            }
        }
        /**
         * Send a message to the server
         * @param data - The JSON object to transmit
         */
        send(data) {
            this.resetKeepAlive();
            const dataStr = stringify(data);
            this.bytesSent += dataStr.length;
            this.stats_.incrementCounter('bytes_sent', dataStr.length);
            //We can only fit a certain amount in each websocket frame, so we need to split this request
            //up into multiple pieces if it doesn't fit in one request.
            const dataSegs = splitStringBySize(dataStr, WEBSOCKET_MAX_FRAME_SIZE);
            //Send the length header
            if (dataSegs.length > 1) {
                this.sendString_(String(dataSegs.length));
            }
            //Send the actual data in segments.
            for (let i = 0; i < dataSegs.length; i++) {
                this.sendString_(dataSegs[i]);
            }
        }
        shutdown_() {
            this.isClosed_ = true;
            if (this.keepaliveTimer) {
                clearInterval(this.keepaliveTimer);
                this.keepaliveTimer = null;
            }
            if (this.mySock) {
                this.mySock.close();
                this.mySock = null;
            }
        }
        onClosed_() {
            if (!this.isClosed_) {
                this.log_('WebSocket is closing itself');
                this.shutdown_();
                // since this is an internal close, trigger the close listener
                if (this.onDisconnect) {
                    this.onDisconnect(this.everConnected_);
                    this.onDisconnect = null;
                }
            }
        }
        /**
         * External-facing close handler.
         * Close the websocket and kill the connection.
         */
        close() {
            if (!this.isClosed_) {
                this.log_('WebSocket is being closed');
                this.shutdown_();
            }
        }
        /**
         * Kill the current keepalive timer and start a new one, to ensure that it always fires N seconds after
         * the last activity.
         */
        resetKeepAlive() {
            clearInterval(this.keepaliveTimer);
            this.keepaliveTimer = setInterval(() => {
                //If there has been no websocket activity for a while, send a no-op
                if (this.mySock) {
                    this.sendString_('0');
                }
                this.resetKeepAlive();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, Math.floor(WEBSOCKET_KEEPALIVE_INTERVAL));
        }
        /**
         * Send a string over the websocket.
         *
         * @param str - String to send.
         */
        sendString_(str) {
            // Firefox seems to sometimes throw exceptions (NS_ERROR_UNEXPECTED) from websocket .send()
            // calls for some unknown reason.  We treat these as an error and disconnect.
            // See https://app.asana.com/0/58926111402292/68021340250410
            try {
                this.mySock.send(str);
            }
            catch (e) {
                this.log_('Exception thrown from WebSocket.send():', e.message || e.data, 'Closing connection.');
                setTimeout(this.onClosed_.bind(this), 0);
            }
        }
    }
    /**
     * Number of response before we consider the connection "healthy."
     */
    WebSocketConnection.responsesRequiredToBeHealthy = 2;
    /**
     * Time to wait for the connection te become healthy before giving up.
     */
    WebSocketConnection.healthyTimeout = 30000;

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
     * Currently simplistic, this class manages what transport a Connection should use at various stages of its
     * lifecycle.
     *
     * It starts with longpolling in a browser, and httppolling on node. It then upgrades to websockets if
     * they are available.
     */
    class TransportManager {
        /**
         * @param repoInfo - Metadata around the namespace we're connecting to
         */
        constructor(repoInfo) {
            this.initTransports_(repoInfo);
        }
        static get ALL_TRANSPORTS() {
            return [BrowserPollConnection, WebSocketConnection];
        }
        initTransports_(repoInfo) {
            const isWebSocketsAvailable = WebSocketConnection && WebSocketConnection['isAvailable']();
            let isSkipPollConnection = isWebSocketsAvailable && !WebSocketConnection.previouslyFailed();
            if (repoInfo.webSocketOnly) {
                if (!isWebSocketsAvailable) {
                    warn("wss:// URL used, but browser isn't known to support websockets.  Trying anyway.");
                }
                isSkipPollConnection = true;
            }
            if (isSkipPollConnection) {
                this.transports_ = [WebSocketConnection];
            }
            else {
                const transports = (this.transports_ = []);
                for (const transport of TransportManager.ALL_TRANSPORTS) {
                    if (transport && transport['isAvailable']()) {
                        transports.push(transport);
                    }
                }
            }
        }
        /**
         * @returns The constructor for the initial transport to use
         */
        initialTransport() {
            if (this.transports_.length > 0) {
                return this.transports_[0];
            }
            else {
                throw new Error('No transports available');
            }
        }
        /**
         * @returns The constructor for the next transport, or null
         */
        upgradeTransport() {
            if (this.transports_.length > 1) {
                return this.transports_[1];
            }
            else {
                return null;
            }
        }
    }

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
    // Abort upgrade attempt if it takes longer than 60s.
    const UPGRADE_TIMEOUT = 60000;
    // For some transports (WebSockets), we need to "validate" the transport by exchanging a few requests and responses.
    // If we haven't sent enough requests within 5s, we'll start sending noop ping requests.
    const DELAY_BEFORE_SENDING_EXTRA_REQUESTS = 5000;
    // If the initial data sent triggers a lot of bandwidth (i.e. it's a large put or a listen for a large amount of data)
    // then we may not be able to exchange our ping/pong requests within the healthy timeout.  So if we reach the timeout
    // but we've sent/received enough bytes, we don't cancel the connection.
    const BYTES_SENT_HEALTHY_OVERRIDE = 10 * 1024;
    const BYTES_RECEIVED_HEALTHY_OVERRIDE = 100 * 1024;
    const MESSAGE_TYPE = 't';
    const MESSAGE_DATA = 'd';
    const CONTROL_SHUTDOWN = 's';
    const CONTROL_RESET = 'r';
    const CONTROL_ERROR = 'e';
    const CONTROL_PONG = 'o';
    const SWITCH_ACK = 'a';
    const END_TRANSMISSION = 'n';
    const PING = 'p';
    const SERVER_HELLO = 'h';
    /**
     * Creates a new real-time connection to the server using whichever method works
     * best in the current browser.
     */
    class Connection {
        /**
         * @param id - an id for this connection
         * @param repoInfo_ - the info for the endpoint to connect to
         * @param applicationId_ - the Firebase App ID for this project
         * @param appCheckToken_ - The App Check Token for this device.
         * @param authToken_ - The auth token for this session.
         * @param onMessage_ - the callback to be triggered when a server-push message arrives
         * @param onReady_ - the callback to be triggered when this connection is ready to send messages.
         * @param onDisconnect_ - the callback to be triggered when a connection was lost
         * @param onKill_ - the callback to be triggered when this connection has permanently shut down.
         * @param lastSessionId - last session id in persistent connection. is used to clean up old session in real-time server
         */
        constructor(id, repoInfo_, applicationId_, appCheckToken_, authToken_, onMessage_, onReady_, onDisconnect_, onKill_, lastSessionId) {
            this.id = id;
            this.repoInfo_ = repoInfo_;
            this.applicationId_ = applicationId_;
            this.appCheckToken_ = appCheckToken_;
            this.authToken_ = authToken_;
            this.onMessage_ = onMessage_;
            this.onReady_ = onReady_;
            this.onDisconnect_ = onDisconnect_;
            this.onKill_ = onKill_;
            this.lastSessionId = lastSessionId;
            this.connectionCount = 0;
            this.pendingDataMessages = [];
            this.state_ = 0 /* CONNECTING */;
            this.log_ = logWrapper('c:' + this.id + ':');
            this.transportManager_ = new TransportManager(repoInfo_);
            this.log_('Connection created');
            this.start_();
        }
        /**
         * Starts a connection attempt
         */
        start_() {
            const conn = this.transportManager_.initialTransport();
            this.conn_ = new conn(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, null, this.lastSessionId);
            // For certain transports (WebSockets), we need to send and receive several messages back and forth before we
            // can consider the transport healthy.
            this.primaryResponsesRequired_ = conn['responsesRequiredToBeHealthy'] || 0;
            const onMessageReceived = this.connReceiver_(this.conn_);
            const onConnectionLost = this.disconnReceiver_(this.conn_);
            this.tx_ = this.conn_;
            this.rx_ = this.conn_;
            this.secondaryConn_ = null;
            this.isHealthy_ = false;
            /*
             * Firefox doesn't like when code from one iframe tries to create another iframe by way of the parent frame.
             * This can occur in the case of a redirect, i.e. we guessed wrong on what server to connect to and received a reset.
             * Somehow, setTimeout seems to make this ok. That doesn't make sense from a security perspective, since you should
             * still have the context of your originating frame.
             */
            setTimeout(() => {
                // this.conn_ gets set to null in some of the tests. Check to make sure it still exists before using it
                this.conn_ && this.conn_.open(onMessageReceived, onConnectionLost);
            }, Math.floor(0));
            const healthyTimeoutMS = conn['healthyTimeout'] || 0;
            if (healthyTimeoutMS > 0) {
                this.healthyTimeout_ = setTimeoutNonBlocking(() => {
                    this.healthyTimeout_ = null;
                    if (!this.isHealthy_) {
                        if (this.conn_ &&
                            this.conn_.bytesReceived > BYTES_RECEIVED_HEALTHY_OVERRIDE) {
                            this.log_('Connection exceeded healthy timeout but has received ' +
                                this.conn_.bytesReceived +
                                ' bytes.  Marking connection healthy.');
                            this.isHealthy_ = true;
                            this.conn_.markConnectionHealthy();
                        }
                        else if (this.conn_ &&
                            this.conn_.bytesSent > BYTES_SENT_HEALTHY_OVERRIDE) {
                            this.log_('Connection exceeded healthy timeout but has sent ' +
                                this.conn_.bytesSent +
                                ' bytes.  Leaving connection alive.');
                            // NOTE: We don't want to mark it healthy, since we have no guarantee that the bytes have made it to
                            // the server.
                        }
                        else {
                            this.log_('Closing unhealthy connection after timeout.');
                            this.close();
                        }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }, Math.floor(healthyTimeoutMS));
            }
        }
        nextTransportId_() {
            return 'c:' + this.id + ':' + this.connectionCount++;
        }
        disconnReceiver_(conn) {
            return everConnected => {
                if (conn === this.conn_) {
                    this.onConnectionLost_(everConnected);
                }
                else if (conn === this.secondaryConn_) {
                    this.log_('Secondary connection lost.');
                    this.onSecondaryConnectionLost_();
                }
                else {
                    this.log_('closing an old connection');
                }
            };
        }
        connReceiver_(conn) {
            return (message) => {
                if (this.state_ !== 2 /* DISCONNECTED */) {
                    if (conn === this.rx_) {
                        this.onPrimaryMessageReceived_(message);
                    }
                    else if (conn === this.secondaryConn_) {
                        this.onSecondaryMessageReceived_(message);
                    }
                    else {
                        this.log_('message on old connection');
                    }
                }
            };
        }
        /**
         * @param dataMsg - An arbitrary data message to be sent to the server
         */
        sendRequest(dataMsg) {
            // wrap in a data message envelope and send it on
            const msg = { t: 'd', d: dataMsg };
            this.sendData_(msg);
        }
        tryCleanupConnection() {
            if (this.tx_ === this.secondaryConn_ && this.rx_ === this.secondaryConn_) {
                this.log_('cleaning up and promoting a connection: ' + this.secondaryConn_.connId);
                this.conn_ = this.secondaryConn_;
                this.secondaryConn_ = null;
                // the server will shutdown the old connection
            }
        }
        onSecondaryControl_(controlData) {
            if (MESSAGE_TYPE in controlData) {
                const cmd = controlData[MESSAGE_TYPE];
                if (cmd === SWITCH_ACK) {
                    this.upgradeIfSecondaryHealthy_();
                }
                else if (cmd === CONTROL_RESET) {
                    // Most likely the session wasn't valid. Abandon the switch attempt
                    this.log_('Got a reset on secondary, closing it');
                    this.secondaryConn_.close();
                    // If we were already using this connection for something, than we need to fully close
                    if (this.tx_ === this.secondaryConn_ ||
                        this.rx_ === this.secondaryConn_) {
                        this.close();
                    }
                }
                else if (cmd === CONTROL_PONG) {
                    this.log_('got pong on secondary.');
                    this.secondaryResponsesRequired_--;
                    this.upgradeIfSecondaryHealthy_();
                }
            }
        }
        onSecondaryMessageReceived_(parsedData) {
            const layer = requireKey('t', parsedData);
            const data = requireKey('d', parsedData);
            if (layer === 'c') {
                this.onSecondaryControl_(data);
            }
            else if (layer === 'd') {
                // got a data message, but we're still second connection. Need to buffer it up
                this.pendingDataMessages.push(data);
            }
            else {
                throw new Error('Unknown protocol layer: ' + layer);
            }
        }
        upgradeIfSecondaryHealthy_() {
            if (this.secondaryResponsesRequired_ <= 0) {
                this.log_('Secondary connection is healthy.');
                this.isHealthy_ = true;
                this.secondaryConn_.markConnectionHealthy();
                this.proceedWithUpgrade_();
            }
            else {
                // Send a ping to make sure the connection is healthy.
                this.log_('sending ping on secondary.');
                this.secondaryConn_.send({ t: 'c', d: { t: PING, d: {} } });
            }
        }
        proceedWithUpgrade_() {
            // tell this connection to consider itself open
            this.secondaryConn_.start();
            // send ack
            this.log_('sending client ack on secondary');
            this.secondaryConn_.send({ t: 'c', d: { t: SWITCH_ACK, d: {} } });
            // send end packet on primary transport, switch to sending on this one
            // can receive on this one, buffer responses until end received on primary transport
            this.log_('Ending transmission on primary');
            this.conn_.send({ t: 'c', d: { t: END_TRANSMISSION, d: {} } });
            this.tx_ = this.secondaryConn_;
            this.tryCleanupConnection();
        }
        onPrimaryMessageReceived_(parsedData) {
            // Must refer to parsedData properties in quotes, so closure doesn't touch them.
            const layer = requireKey('t', parsedData);
            const data = requireKey('d', parsedData);
            if (layer === 'c') {
                this.onControl_(data);
            }
            else if (layer === 'd') {
                this.onDataMessage_(data);
            }
        }
        onDataMessage_(message) {
            this.onPrimaryResponse_();
            // We don't do anything with data messages, just kick them up a level
            this.onMessage_(message);
        }
        onPrimaryResponse_() {
            if (!this.isHealthy_) {
                this.primaryResponsesRequired_--;
                if (this.primaryResponsesRequired_ <= 0) {
                    this.log_('Primary connection is healthy.');
                    this.isHealthy_ = true;
                    this.conn_.markConnectionHealthy();
                }
            }
        }
        onControl_(controlData) {
            const cmd = requireKey(MESSAGE_TYPE, controlData);
            if (MESSAGE_DATA in controlData) {
                const payload = controlData[MESSAGE_DATA];
                if (cmd === SERVER_HELLO) {
                    this.onHandshake_(payload);
                }
                else if (cmd === END_TRANSMISSION) {
                    this.log_('recvd end transmission on primary');
                    this.rx_ = this.secondaryConn_;
                    for (let i = 0; i < this.pendingDataMessages.length; ++i) {
                        this.onDataMessage_(this.pendingDataMessages[i]);
                    }
                    this.pendingDataMessages = [];
                    this.tryCleanupConnection();
                }
                else if (cmd === CONTROL_SHUTDOWN) {
                    // This was previously the 'onKill' callback passed to the lower-level connection
                    // payload in this case is the reason for the shutdown. Generally a human-readable error
                    this.onConnectionShutdown_(payload);
                }
                else if (cmd === CONTROL_RESET) {
                    // payload in this case is the host we should contact
                    this.onReset_(payload);
                }
                else if (cmd === CONTROL_ERROR) {
                    error('Server Error: ' + payload);
                }
                else if (cmd === CONTROL_PONG) {
                    this.log_('got pong on primary.');
                    this.onPrimaryResponse_();
                    this.sendPingOnPrimaryIfNecessary_();
                }
                else {
                    error('Unknown control packet command: ' + cmd);
                }
            }
        }
        /**
         * @param handshake - The handshake data returned from the server
         */
        onHandshake_(handshake) {
            const timestamp = handshake.ts;
            const version = handshake.v;
            const host = handshake.h;
            this.sessionId = handshake.s;
            this.repoInfo_.host = host;
            // if we've already closed the connection, then don't bother trying to progress further
            if (this.state_ === 0 /* CONNECTING */) {
                this.conn_.start();
                this.onConnectionEstablished_(this.conn_, timestamp);
                if (PROTOCOL_VERSION !== version) {
                    warn('Protocol version mismatch detected');
                }
                // TODO: do we want to upgrade? when? maybe a delay?
                this.tryStartUpgrade_();
            }
        }
        tryStartUpgrade_() {
            const conn = this.transportManager_.upgradeTransport();
            if (conn) {
                this.startUpgrade_(conn);
            }
        }
        startUpgrade_(conn) {
            this.secondaryConn_ = new conn(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, this.sessionId);
            // For certain transports (WebSockets), we need to send and receive several messages back and forth before we
            // can consider the transport healthy.
            this.secondaryResponsesRequired_ =
                conn['responsesRequiredToBeHealthy'] || 0;
            const onMessage = this.connReceiver_(this.secondaryConn_);
            const onDisconnect = this.disconnReceiver_(this.secondaryConn_);
            this.secondaryConn_.open(onMessage, onDisconnect);
            // If we haven't successfully upgraded after UPGRADE_TIMEOUT, give up and kill the secondary.
            setTimeoutNonBlocking(() => {
                if (this.secondaryConn_) {
                    this.log_('Timed out trying to upgrade.');
                    this.secondaryConn_.close();
                }
            }, Math.floor(UPGRADE_TIMEOUT));
        }
        onReset_(host) {
            this.log_('Reset packet received.  New host: ' + host);
            this.repoInfo_.host = host;
            // TODO: if we're already "connected", we need to trigger a disconnect at the next layer up.
            // We don't currently support resets after the connection has already been established
            if (this.state_ === 1 /* CONNECTED */) {
                this.close();
            }
            else {
                // Close whatever connections we have open and start again.
                this.closeConnections_();
                this.start_();
            }
        }
        onConnectionEstablished_(conn, timestamp) {
            this.log_('Realtime connection established.');
            this.conn_ = conn;
            this.state_ = 1 /* CONNECTED */;
            if (this.onReady_) {
                this.onReady_(timestamp, this.sessionId);
                this.onReady_ = null;
            }
            // If after 5 seconds we haven't sent enough requests to the server to get the connection healthy,
            // send some pings.
            if (this.primaryResponsesRequired_ === 0) {
                this.log_('Primary connection is healthy.');
                this.isHealthy_ = true;
            }
            else {
                setTimeoutNonBlocking(() => {
                    this.sendPingOnPrimaryIfNecessary_();
                }, Math.floor(DELAY_BEFORE_SENDING_EXTRA_REQUESTS));
            }
        }
        sendPingOnPrimaryIfNecessary_() {
            // If the connection isn't considered healthy yet, we'll send a noop ping packet request.
            if (!this.isHealthy_ && this.state_ === 1 /* CONNECTED */) {
                this.log_('sending ping on primary.');
                this.sendData_({ t: 'c', d: { t: PING, d: {} } });
            }
        }
        onSecondaryConnectionLost_() {
            const conn = this.secondaryConn_;
            this.secondaryConn_ = null;
            if (this.tx_ === conn || this.rx_ === conn) {
                // we are relying on this connection already in some capacity. Therefore, a failure is real
                this.close();
            }
        }
        /**
         * @param everConnected - Whether or not the connection ever reached a server. Used to determine if
         * we should flush the host cache
         */
        onConnectionLost_(everConnected) {
            this.conn_ = null;
            // NOTE: IF you're seeing a Firefox error for this line, I think it might be because it's getting
            // called on window close and RealtimeState.CONNECTING is no longer defined.  Just a guess.
            if (!everConnected && this.state_ === 0 /* CONNECTING */) {
                this.log_('Realtime connection failed.');
                // Since we failed to connect at all, clear any cached entry for this namespace in case the machine went away
                if (this.repoInfo_.isCacheableHost()) {
                    PersistentStorage.remove('host:' + this.repoInfo_.host);
                    // reset the internal host to what we would show the user, i.e. <ns>.firebaseio.com
                    this.repoInfo_.internalHost = this.repoInfo_.host;
                }
            }
            else if (this.state_ === 1 /* CONNECTED */) {
                this.log_('Realtime connection lost.');
            }
            this.close();
        }
        onConnectionShutdown_(reason) {
            this.log_('Connection shutdown command received. Shutting down...');
            if (this.onKill_) {
                this.onKill_(reason);
                this.onKill_ = null;
            }
            // We intentionally don't want to fire onDisconnect (kill is a different case),
            // so clear the callback.
            this.onDisconnect_ = null;
            this.close();
        }
        sendData_(data) {
            if (this.state_ !== 1 /* CONNECTED */) {
                throw 'Connection is not connected';
            }
            else {
                this.tx_.send(data);
            }
        }
        /**
         * Cleans up this connection, calling the appropriate callbacks
         */
        close() {
            if (this.state_ !== 2 /* DISCONNECTED */) {
                this.log_('Closing realtime connection.');
                this.state_ = 2 /* DISCONNECTED */;
                this.closeConnections_();
                if (this.onDisconnect_) {
                    this.onDisconnect_();
                    this.onDisconnect_ = null;
                }
            }
        }
        closeConnections_() {
            this.log_('Shutting down all connections');
            if (this.conn_) {
                this.conn_.close();
                this.conn_ = null;
            }
            if (this.secondaryConn_) {
                this.secondaryConn_.close();
                this.secondaryConn_ = null;
            }
            if (this.healthyTimeout_) {
                clearTimeout(this.healthyTimeout_);
                this.healthyTimeout_ = null;
            }
        }
    }

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
     * Interface defining the set of actions that can be performed against the Firebase server
     * (basically corresponds to our wire protocol).
     *
     * @interface
     */
    class ServerActions {
        put(pathString, data, onComplete, hash) { }
        merge(pathString, data, onComplete, hash) { }
        /**
         * Refreshes the auth token for the current connection.
         * @param token - The authentication token
         */
        refreshAuthToken(token) { }
        /**
         * Refreshes the app check token for the current connection.
         * @param token The app check token
         */
        refreshAppCheckToken(token) { }
        onDisconnectPut(pathString, data, onComplete) { }
        onDisconnectMerge(pathString, data, onComplete) { }
        onDisconnectCancel(pathString, onComplete) { }
        reportStats(stats) { }
    }

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
     * Base class to be used if you want to emit events. Call the constructor with
     * the set of allowed event names.
     */
    class EventEmitter {
        constructor(allowedEvents_) {
            this.allowedEvents_ = allowedEvents_;
            this.listeners_ = {};
            assert(Array.isArray(allowedEvents_) && allowedEvents_.length > 0, 'Requires a non-empty array');
        }
        /**
         * To be called by derived classes to trigger events.
         */
        trigger(eventType, ...varArgs) {
            if (Array.isArray(this.listeners_[eventType])) {
                // Clone the list, since callbacks could add/remove listeners.
                const listeners = [...this.listeners_[eventType]];
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i].callback.apply(listeners[i].context, varArgs);
                }
            }
        }
        on(eventType, callback, context) {
            this.validateEventType_(eventType);
            this.listeners_[eventType] = this.listeners_[eventType] || [];
            this.listeners_[eventType].push({ callback, context });
            const eventData = this.getInitialEvent(eventType);
            if (eventData) {
                callback.apply(context, eventData);
            }
        }
        off(eventType, callback, context) {
            this.validateEventType_(eventType);
            const listeners = this.listeners_[eventType] || [];
            for (let i = 0; i < listeners.length; i++) {
                if (listeners[i].callback === callback &&
                    (!context || context === listeners[i].context)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
        validateEventType_(eventType) {
            assert(this.allowedEvents_.find(et => {
                return et === eventType;
            }), 'Unknown event: ' + eventType);
        }
    }

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
     * Monitors online state (as reported by window.online/offline events).
     *
     * The expectation is that this could have many false positives (thinks we are online
     * when we're not), but no false negatives.  So we can safely use it to determine when
     * we definitely cannot reach the internet.
     */
    class OnlineMonitor extends EventEmitter {
        constructor() {
            super(['online']);
            this.online_ = true;
            // We've had repeated complaints that Cordova apps can get stuck "offline", e.g.
            // https://forum.ionicframework.com/t/firebase-connection-is-lost-and-never-come-back/43810
            // It would seem that the 'online' event does not always fire consistently. So we disable it
            // for Cordova.
            if (typeof window !== 'undefined' &&
                typeof window.addEventListener !== 'undefined' &&
                !isMobileCordova()) {
                window.addEventListener('online', () => {
                    if (!this.online_) {
                        this.online_ = true;
                        this.trigger('online', true);
                    }
                }, false);
                window.addEventListener('offline', () => {
                    if (this.online_) {
                        this.online_ = false;
                        this.trigger('online', false);
                    }
                }, false);
            }
        }
        static getInstance() {
            return new OnlineMonitor();
        }
        getInitialEvent(eventType) {
            assert(eventType === 'online', 'Unknown event type: ' + eventType);
            return [this.online_];
        }
        currentlyOnline() {
            return this.online_;
        }
    }

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
    /** Maximum key depth. */
    const MAX_PATH_DEPTH = 32;
    /** Maximum number of (UTF8) bytes in a Firebase path. */
    const MAX_PATH_LENGTH_BYTES = 768;
    /**
     * An immutable object representing a parsed path.  It's immutable so that you
     * can pass them around to other functions without worrying about them changing
     * it.
     */
    class Path {
        /**
         * @param pathOrString - Path string to parse, or another path, or the raw
         * tokens array
         */
        constructor(pathOrString, pieceNum) {
            if (pieceNum === void 0) {
                this.pieces_ = pathOrString.split('/');
                // Remove empty pieces.
                let copyTo = 0;
                for (let i = 0; i < this.pieces_.length; i++) {
                    if (this.pieces_[i].length > 0) {
                        this.pieces_[copyTo] = this.pieces_[i];
                        copyTo++;
                    }
                }
                this.pieces_.length = copyTo;
                this.pieceNum_ = 0;
            }
            else {
                this.pieces_ = pathOrString;
                this.pieceNum_ = pieceNum;
            }
        }
        toString() {
            let pathString = '';
            for (let i = this.pieceNum_; i < this.pieces_.length; i++) {
                if (this.pieces_[i] !== '') {
                    pathString += '/' + this.pieces_[i];
                }
            }
            return pathString || '/';
        }
    }
    function newEmptyPath() {
        return new Path('');
    }
    function pathGetFront(path) {
        if (path.pieceNum_ >= path.pieces_.length) {
            return null;
        }
        return path.pieces_[path.pieceNum_];
    }
    /**
     * @returns The number of segments in this path
     */
    function pathGetLength(path) {
        return path.pieces_.length - path.pieceNum_;
    }
    function pathPopFront(path) {
        let pieceNum = path.pieceNum_;
        if (pieceNum < path.pieces_.length) {
            pieceNum++;
        }
        return new Path(path.pieces_, pieceNum);
    }
    function pathGetBack(path) {
        if (path.pieceNum_ < path.pieces_.length) {
            return path.pieces_[path.pieces_.length - 1];
        }
        return null;
    }
    function pathToUrlEncodedString(path) {
        let pathString = '';
        for (let i = path.pieceNum_; i < path.pieces_.length; i++) {
            if (path.pieces_[i] !== '') {
                pathString += '/' + encodeURIComponent(String(path.pieces_[i]));
            }
        }
        return pathString || '/';
    }
    /**
     * Shallow copy of the parts of the path.
     *
     */
    function pathSlice(path, begin = 0) {
        return path.pieces_.slice(path.pieceNum_ + begin);
    }
    function pathParent(path) {
        if (path.pieceNum_ >= path.pieces_.length) {
            return null;
        }
        const pieces = [];
        for (let i = path.pieceNum_; i < path.pieces_.length - 1; i++) {
            pieces.push(path.pieces_[i]);
        }
        return new Path(pieces, 0);
    }
    function pathChild(path, childPathObj) {
        const pieces = [];
        for (let i = path.pieceNum_; i < path.pieces_.length; i++) {
            pieces.push(path.pieces_[i]);
        }
        if (childPathObj instanceof Path) {
            for (let i = childPathObj.pieceNum_; i < childPathObj.pieces_.length; i++) {
                pieces.push(childPathObj.pieces_[i]);
            }
        }
        else {
            const childPieces = childPathObj.split('/');
            for (let i = 0; i < childPieces.length; i++) {
                if (childPieces[i].length > 0) {
                    pieces.push(childPieces[i]);
                }
            }
        }
        return new Path(pieces, 0);
    }
    /**
     * @returns True if there are no segments in this path
     */
    function pathIsEmpty(path) {
        return path.pieceNum_ >= path.pieces_.length;
    }
    /**
     * @returns The path from outerPath to innerPath
     */
    function newRelativePath(outerPath, innerPath) {
        const outer = pathGetFront(outerPath), inner = pathGetFront(innerPath);
        if (outer === null) {
            return innerPath;
        }
        else if (outer === inner) {
            return newRelativePath(pathPopFront(outerPath), pathPopFront(innerPath));
        }
        else {
            throw new Error('INTERNAL ERROR: innerPath (' +
                innerPath +
                ') is not within ' +
                'outerPath (' +
                outerPath +
                ')');
        }
    }
    /**
     * @returns -1, 0, 1 if left is less, equal, or greater than the right.
     */
    function pathCompare(left, right) {
        const leftKeys = pathSlice(left, 0);
        const rightKeys = pathSlice(right, 0);
        for (let i = 0; i < leftKeys.length && i < rightKeys.length; i++) {
            const cmp = nameCompare(leftKeys[i], rightKeys[i]);
            if (cmp !== 0) {
                return cmp;
            }
        }
        if (leftKeys.length === rightKeys.length) {
            return 0;
        }
        return leftKeys.length < rightKeys.length ? -1 : 1;
    }
    /**
     * @returns true if paths are the same.
     */
    function pathEquals(path, other) {
        if (pathGetLength(path) !== pathGetLength(other)) {
            return false;
        }
        for (let i = path.pieceNum_, j = other.pieceNum_; i <= path.pieces_.length; i++, j++) {
            if (path.pieces_[i] !== other.pieces_[j]) {
                return false;
            }
        }
        return true;
    }
    /**
     * @returns True if this path is a parent (or the same as) other
     */
    function pathContains(path, other) {
        let i = path.pieceNum_;
        let j = other.pieceNum_;
        if (pathGetLength(path) > pathGetLength(other)) {
            return false;
        }
        while (i < path.pieces_.length) {
            if (path.pieces_[i] !== other.pieces_[j]) {
                return false;
            }
            ++i;
            ++j;
        }
        return true;
    }
    /**
     * Dynamic (mutable) path used to count path lengths.
     *
     * This class is used to efficiently check paths for valid
     * length (in UTF8 bytes) and depth (used in path validation).
     *
     * Throws Error exception if path is ever invalid.
     *
     * The definition of a path always begins with '/'.
     */
    class ValidationPath {
        /**
         * @param path - Initial Path.
         * @param errorPrefix_ - Prefix for any error messages.
         */
        constructor(path, errorPrefix_) {
            this.errorPrefix_ = errorPrefix_;
            this.parts_ = pathSlice(path, 0);
            /** Initialize to number of '/' chars needed in path. */
            this.byteLength_ = Math.max(1, this.parts_.length);
            for (let i = 0; i < this.parts_.length; i++) {
                this.byteLength_ += stringLength(this.parts_[i]);
            }
            validationPathCheckValid(this);
        }
    }
    function validationPathPush(validationPath, child) {
        // Count the needed '/'
        if (validationPath.parts_.length > 0) {
            validationPath.byteLength_ += 1;
        }
        validationPath.parts_.push(child);
        validationPath.byteLength_ += stringLength(child);
        validationPathCheckValid(validationPath);
    }
    function validationPathPop(validationPath) {
        const last = validationPath.parts_.pop();
        validationPath.byteLength_ -= stringLength(last);
        // Un-count the previous '/'
        if (validationPath.parts_.length > 0) {
            validationPath.byteLength_ -= 1;
        }
    }
    function validationPathCheckValid(validationPath) {
        if (validationPath.byteLength_ > MAX_PATH_LENGTH_BYTES) {
            throw new Error(validationPath.errorPrefix_ +
                'has a key path longer than ' +
                MAX_PATH_LENGTH_BYTES +
                ' bytes (' +
                validationPath.byteLength_ +
                ').');
        }
        if (validationPath.parts_.length > MAX_PATH_DEPTH) {
            throw new Error(validationPath.errorPrefix_ +
                'path specified exceeds the maximum depth that can be written (' +
                MAX_PATH_DEPTH +
                ') or object contains a cycle ' +
                validationPathToErrorString(validationPath));
        }
    }
    /**
     * String for use in error messages - uses '.' notation for path.
     */
    function validationPathToErrorString(validationPath) {
        if (validationPath.parts_.length === 0) {
            return '';
        }
        return "in property '" + validationPath.parts_.join('.') + "'";
    }

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
    class VisibilityMonitor extends EventEmitter {
        constructor() {
            super(['visible']);
            let hidden;
            let visibilityChange;
            if (typeof document !== 'undefined' &&
                typeof document.addEventListener !== 'undefined') {
                if (typeof document['hidden'] !== 'undefined') {
                    // Opera 12.10 and Firefox 18 and later support
                    visibilityChange = 'visibilitychange';
                    hidden = 'hidden';
                }
                else if (typeof document['mozHidden'] !== 'undefined') {
                    visibilityChange = 'mozvisibilitychange';
                    hidden = 'mozHidden';
                }
                else if (typeof document['msHidden'] !== 'undefined') {
                    visibilityChange = 'msvisibilitychange';
                    hidden = 'msHidden';
                }
                else if (typeof document['webkitHidden'] !== 'undefined') {
                    visibilityChange = 'webkitvisibilitychange';
                    hidden = 'webkitHidden';
                }
            }
            // Initially, we always assume we are visible. This ensures that in browsers
            // without page visibility support or in cases where we are never visible
            // (e.g. chrome extension), we act as if we are visible, i.e. don't delay
            // reconnects
            this.visible_ = true;
            if (visibilityChange) {
                document.addEventListener(visibilityChange, () => {
                    const visible = !document[hidden];
                    if (visible !== this.visible_) {
                        this.visible_ = visible;
                        this.trigger('visible', visible);
                    }
                }, false);
            }
        }
        static getInstance() {
            return new VisibilityMonitor();
        }
        getInitialEvent(eventType) {
            assert(eventType === 'visible', 'Unknown event type: ' + eventType);
            return [this.visible_];
        }
    }

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
    const RECONNECT_MIN_DELAY = 1000;
    const RECONNECT_MAX_DELAY_DEFAULT = 60 * 5 * 1000; // 5 minutes in milliseconds (Case: 1858)
    const GET_CONNECT_TIMEOUT = 3 * 1000;
    const RECONNECT_MAX_DELAY_FOR_ADMINS = 30 * 1000; // 30 seconds for admin clients (likely to be a backend server)
    const RECONNECT_DELAY_MULTIPLIER = 1.3;
    const RECONNECT_DELAY_RESET_TIMEOUT = 30000; // Reset delay back to MIN_DELAY after being connected for 30sec.
    const SERVER_KILL_INTERRUPT_REASON = 'server_kill';
    // If auth fails repeatedly, we'll assume something is wrong and log a warning / back off.
    const INVALID_TOKEN_THRESHOLD = 3;
    /**
     * Firebase connection.  Abstracts wire protocol and handles reconnecting.
     *
     * NOTE: All JSON objects sent to the realtime connection must have property names enclosed
     * in quotes to make sure the closure compiler does not minify them.
     */
    class PersistentConnection extends ServerActions {
        /**
         * @param repoInfo_ - Data about the namespace we are connecting to
         * @param applicationId_ - The Firebase App ID for this project
         * @param onDataUpdate_ - A callback for new data from the server
         */
        constructor(repoInfo_, applicationId_, onDataUpdate_, onConnectStatus_, onServerInfoUpdate_, authTokenProvider_, appCheckTokenProvider_, authOverride_) {
            super();
            this.repoInfo_ = repoInfo_;
            this.applicationId_ = applicationId_;
            this.onDataUpdate_ = onDataUpdate_;
            this.onConnectStatus_ = onConnectStatus_;
            this.onServerInfoUpdate_ = onServerInfoUpdate_;
            this.authTokenProvider_ = authTokenProvider_;
            this.appCheckTokenProvider_ = appCheckTokenProvider_;
            this.authOverride_ = authOverride_;
            // Used for diagnostic logging.
            this.id = PersistentConnection.nextPersistentConnectionId_++;
            this.log_ = logWrapper('p:' + this.id + ':');
            this.interruptReasons_ = {};
            this.listens = new Map();
            this.outstandingPuts_ = [];
            this.outstandingGets_ = [];
            this.outstandingPutCount_ = 0;
            this.outstandingGetCount_ = 0;
            this.onDisconnectRequestQueue_ = [];
            this.connected_ = false;
            this.reconnectDelay_ = RECONNECT_MIN_DELAY;
            this.maxReconnectDelay_ = RECONNECT_MAX_DELAY_DEFAULT;
            this.securityDebugCallback_ = null;
            this.lastSessionId = null;
            this.establishConnectionTimer_ = null;
            this.visible_ = false;
            // Before we get connected, we keep a queue of pending messages to send.
            this.requestCBHash_ = {};
            this.requestNumber_ = 0;
            this.realtime_ = null;
            this.authToken_ = null;
            this.appCheckToken_ = null;
            this.forceTokenRefresh_ = false;
            this.invalidAuthTokenCount_ = 0;
            this.invalidAppCheckTokenCount_ = 0;
            this.firstConnection_ = true;
            this.lastConnectionAttemptTime_ = null;
            this.lastConnectionEstablishedTime_ = null;
            if (authOverride_ && !isNodeSdk()) {
                throw new Error('Auth override specified in options, but not supported on non Node.js platforms');
            }
            VisibilityMonitor.getInstance().on('visible', this.onVisible_, this);
            if (repoInfo_.host.indexOf('fblocal') === -1) {
                OnlineMonitor.getInstance().on('online', this.onOnline_, this);
            }
        }
        sendRequest(action, body, onResponse) {
            const curReqNum = ++this.requestNumber_;
            const msg = { r: curReqNum, a: action, b: body };
            this.log_(stringify(msg));
            assert(this.connected_, "sendRequest call when we're not connected not allowed.");
            this.realtime_.sendRequest(msg);
            if (onResponse) {
                this.requestCBHash_[curReqNum] = onResponse;
            }
        }
        get(query) {
            this.initConnection_();
            const deferred = new Deferred();
            const request = {
                p: query._path.toString(),
                q: query._queryObject
            };
            const outstandingGet = {
                action: 'g',
                request,
                onComplete: (message) => {
                    const payload = message['d'];
                    if (message['s'] === 'ok') {
                        this.onDataUpdate_(request['p'], payload, 
                        /*isMerge*/ false, 
                        /*tag*/ null);
                        deferred.resolve(payload);
                    }
                    else {
                        deferred.reject(payload);
                    }
                }
            };
            this.outstandingGets_.push(outstandingGet);
            this.outstandingGetCount_++;
            const index = this.outstandingGets_.length - 1;
            if (!this.connected_) {
                setTimeout(() => {
                    const get = this.outstandingGets_[index];
                    if (get === undefined || outstandingGet !== get) {
                        return;
                    }
                    delete this.outstandingGets_[index];
                    this.outstandingGetCount_--;
                    if (this.outstandingGetCount_ === 0) {
                        this.outstandingGets_ = [];
                    }
                    this.log_('get ' + index + ' timed out on connection');
                    deferred.reject(new Error('Client is offline.'));
                }, GET_CONNECT_TIMEOUT);
            }
            if (this.connected_) {
                this.sendGet_(index);
            }
            return deferred.promise;
        }
        listen(query, currentHashFn, tag, onComplete) {
            this.initConnection_();
            const queryId = query._queryIdentifier;
            const pathString = query._path.toString();
            this.log_('Listen called for ' + pathString + ' ' + queryId);
            if (!this.listens.has(pathString)) {
                this.listens.set(pathString, new Map());
            }
            assert(query._queryParams.isDefault() || !query._queryParams.loadsAllData(), 'listen() called for non-default but complete query');
            assert(!this.listens.get(pathString).has(queryId), 'listen() called twice for same path/queryId.');
            const listenSpec = {
                onComplete,
                hashFn: currentHashFn,
                query,
                tag
            };
            this.listens.get(pathString).set(queryId, listenSpec);
            if (this.connected_) {
                this.sendListen_(listenSpec);
            }
        }
        sendGet_(index) {
            const get = this.outstandingGets_[index];
            this.sendRequest('g', get.request, (message) => {
                delete this.outstandingGets_[index];
                this.outstandingGetCount_--;
                if (this.outstandingGetCount_ === 0) {
                    this.outstandingGets_ = [];
                }
                if (get.onComplete) {
                    get.onComplete(message);
                }
            });
        }
        sendListen_(listenSpec) {
            const query = listenSpec.query;
            const pathString = query._path.toString();
            const queryId = query._queryIdentifier;
            this.log_('Listen on ' + pathString + ' for ' + queryId);
            const req = { /*path*/ p: pathString };
            const action = 'q';
            // Only bother to send query if it's non-default.
            if (listenSpec.tag) {
                req['q'] = query._queryObject;
                req['t'] = listenSpec.tag;
            }
            req[ /*hash*/'h'] = listenSpec.hashFn();
            this.sendRequest(action, req, (message) => {
                const payload = message[ /*data*/'d'];
                const status = message[ /*status*/'s'];
                // print warnings in any case...
                PersistentConnection.warnOnListenWarnings_(payload, query);
                const currentListenSpec = this.listens.get(pathString) &&
                    this.listens.get(pathString).get(queryId);
                // only trigger actions if the listen hasn't been removed and readded
                if (currentListenSpec === listenSpec) {
                    this.log_('listen response', message);
                    if (status !== 'ok') {
                        this.removeListen_(pathString, queryId);
                    }
                    if (listenSpec.onComplete) {
                        listenSpec.onComplete(status, payload);
                    }
                }
            });
        }
        static warnOnListenWarnings_(payload, query) {
            if (payload && typeof payload === 'object' && contains(payload, 'w')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const warnings = safeGet(payload, 'w');
                if (Array.isArray(warnings) && ~warnings.indexOf('no_index')) {
                    const indexSpec = '".indexOn": "' + query._queryParams.getIndex().toString() + '"';
                    const indexPath = query._path.toString();
                    warn(`Using an unspecified index. Your data will be downloaded and ` +
                        `filtered on the client. Consider adding ${indexSpec} at ` +
                        `${indexPath} to your security rules for better performance.`);
                }
            }
        }
        refreshAuthToken(token) {
            this.authToken_ = token;
            this.log_('Auth token refreshed');
            if (this.authToken_) {
                this.tryAuth();
            }
            else {
                //If we're connected we want to let the server know to unauthenticate us. If we're not connected, simply delete
                //the credential so we dont become authenticated next time we connect.
                if (this.connected_) {
                    this.sendRequest('unauth', {}, () => { });
                }
            }
            this.reduceReconnectDelayIfAdminCredential_(token);
        }
        reduceReconnectDelayIfAdminCredential_(credential) {
            // NOTE: This isn't intended to be bulletproof (a malicious developer can always just modify the client).
            // Additionally, we don't bother resetting the max delay back to the default if auth fails / expires.
            const isFirebaseSecret = credential && credential.length === 40;
            if (isFirebaseSecret || isAdmin(credential)) {
                this.log_('Admin auth credential detected.  Reducing max reconnect time.');
                this.maxReconnectDelay_ = RECONNECT_MAX_DELAY_FOR_ADMINS;
            }
        }
        refreshAppCheckToken(token) {
            this.appCheckToken_ = token;
            this.log_('App check token refreshed');
            if (this.appCheckToken_) {
                this.tryAppCheck();
            }
            else {
                //If we're connected we want to let the server know to unauthenticate us.
                //If we're not connected, simply delete the credential so we dont become
                // authenticated next time we connect.
                if (this.connected_) {
                    this.sendRequest('unappeck', {}, () => { });
                }
            }
        }
        /**
         * Attempts to authenticate with the given credentials. If the authentication attempt fails, it's triggered like
         * a auth revoked (the connection is closed).
         */
        tryAuth() {
            if (this.connected_ && this.authToken_) {
                const token = this.authToken_;
                const authMethod = isValidFormat(token) ? 'auth' : 'gauth';
                const requestData = { cred: token };
                if (this.authOverride_ === null) {
                    requestData['noauth'] = true;
                }
                else if (typeof this.authOverride_ === 'object') {
                    requestData['authvar'] = this.authOverride_;
                }
                this.sendRequest(authMethod, requestData, (res) => {
                    const status = res[ /*status*/'s'];
                    const data = res[ /*data*/'d'] || 'error';
                    if (this.authToken_ === token) {
                        if (status === 'ok') {
                            this.invalidAuthTokenCount_ = 0;
                        }
                        else {
                            // Triggers reconnect and force refresh for auth token
                            this.onAuthRevoked_(status, data);
                        }
                    }
                });
            }
        }
        /**
         * Attempts to authenticate with the given token. If the authentication
         * attempt fails, it's triggered like the token was revoked (the connection is
         * closed).
         */
        tryAppCheck() {
            if (this.connected_ && this.appCheckToken_) {
                this.sendRequest('appcheck', { 'token': this.appCheckToken_ }, (res) => {
                    const status = res[ /*status*/'s'];
                    const data = res[ /*data*/'d'] || 'error';
                    if (status === 'ok') {
                        this.invalidAppCheckTokenCount_ = 0;
                    }
                    else {
                        this.onAppCheckRevoked_(status, data);
                    }
                });
            }
        }
        /**
         * @inheritDoc
         */
        unlisten(query, tag) {
            const pathString = query._path.toString();
            const queryId = query._queryIdentifier;
            this.log_('Unlisten called for ' + pathString + ' ' + queryId);
            assert(query._queryParams.isDefault() || !query._queryParams.loadsAllData(), 'unlisten() called for non-default but complete query');
            const listen = this.removeListen_(pathString, queryId);
            if (listen && this.connected_) {
                this.sendUnlisten_(pathString, queryId, query._queryObject, tag);
            }
        }
        sendUnlisten_(pathString, queryId, queryObj, tag) {
            this.log_('Unlisten on ' + pathString + ' for ' + queryId);
            const req = { /*path*/ p: pathString };
            const action = 'n';
            // Only bother sending queryId if it's non-default.
            if (tag) {
                req['q'] = queryObj;
                req['t'] = tag;
            }
            this.sendRequest(action, req);
        }
        onDisconnectPut(pathString, data, onComplete) {
            this.initConnection_();
            if (this.connected_) {
                this.sendOnDisconnect_('o', pathString, data, onComplete);
            }
            else {
                this.onDisconnectRequestQueue_.push({
                    pathString,
                    action: 'o',
                    data,
                    onComplete
                });
            }
        }
        onDisconnectMerge(pathString, data, onComplete) {
            this.initConnection_();
            if (this.connected_) {
                this.sendOnDisconnect_('om', pathString, data, onComplete);
            }
            else {
                this.onDisconnectRequestQueue_.push({
                    pathString,
                    action: 'om',
                    data,
                    onComplete
                });
            }
        }
        onDisconnectCancel(pathString, onComplete) {
            this.initConnection_();
            if (this.connected_) {
                this.sendOnDisconnect_('oc', pathString, null, onComplete);
            }
            else {
                this.onDisconnectRequestQueue_.push({
                    pathString,
                    action: 'oc',
                    data: null,
                    onComplete
                });
            }
        }
        sendOnDisconnect_(action, pathString, data, onComplete) {
            const request = { /*path*/ p: pathString, /*data*/ d: data };
            this.log_('onDisconnect ' + action, request);
            this.sendRequest(action, request, (response) => {
                if (onComplete) {
                    setTimeout(() => {
                        onComplete(response[ /*status*/'s'], response[ /* data */'d']);
                    }, Math.floor(0));
                }
            });
        }
        put(pathString, data, onComplete, hash) {
            this.putInternal('p', pathString, data, onComplete, hash);
        }
        merge(pathString, data, onComplete, hash) {
            this.putInternal('m', pathString, data, onComplete, hash);
        }
        putInternal(action, pathString, data, onComplete, hash) {
            this.initConnection_();
            const request = {
                /*path*/ p: pathString,
                /*data*/ d: data
            };
            if (hash !== undefined) {
                request[ /*hash*/'h'] = hash;
            }
            // TODO: Only keep track of the most recent put for a given path?
            this.outstandingPuts_.push({
                action,
                request,
                onComplete
            });
            this.outstandingPutCount_++;
            const index = this.outstandingPuts_.length - 1;
            if (this.connected_) {
                this.sendPut_(index);
            }
            else {
                this.log_('Buffering put: ' + pathString);
            }
        }
        sendPut_(index) {
            const action = this.outstandingPuts_[index].action;
            const request = this.outstandingPuts_[index].request;
            const onComplete = this.outstandingPuts_[index].onComplete;
            this.outstandingPuts_[index].queued = this.connected_;
            this.sendRequest(action, request, (message) => {
                this.log_(action + ' response', message);
                delete this.outstandingPuts_[index];
                this.outstandingPutCount_--;
                // Clean up array occasionally.
                if (this.outstandingPutCount_ === 0) {
                    this.outstandingPuts_ = [];
                }
                if (onComplete) {
                    onComplete(message[ /*status*/'s'], message[ /* data */'d']);
                }
            });
        }
        reportStats(stats) {
            // If we're not connected, we just drop the stats.
            if (this.connected_) {
                const request = { /*counters*/ c: stats };
                this.log_('reportStats', request);
                this.sendRequest(/*stats*/ 's', request, result => {
                    const status = result[ /*status*/'s'];
                    if (status !== 'ok') {
                        const errorReason = result[ /* data */'d'];
                        this.log_('reportStats', 'Error sending stats: ' + errorReason);
                    }
                });
            }
        }
        onDataMessage_(message) {
            if ('r' in message) {
                // this is a response
                this.log_('from server: ' + stringify(message));
                const reqNum = message['r'];
                const onResponse = this.requestCBHash_[reqNum];
                if (onResponse) {
                    delete this.requestCBHash_[reqNum];
                    onResponse(message[ /*body*/'b']);
                }
            }
            else if ('error' in message) {
                throw 'A server-side error has occurred: ' + message['error'];
            }
            else if ('a' in message) {
                // a and b are action and body, respectively
                this.onDataPush_(message['a'], message['b']);
            }
        }
        onDataPush_(action, body) {
            this.log_('handleServerMessage', action, body);
            if (action === 'd') {
                this.onDataUpdate_(body[ /*path*/'p'], body[ /*data*/'d'], 
                /*isMerge*/ false, body['t']);
            }
            else if (action === 'm') {
                this.onDataUpdate_(body[ /*path*/'p'], body[ /*data*/'d'], 
                /*isMerge=*/ true, body['t']);
            }
            else if (action === 'c') {
                this.onListenRevoked_(body[ /*path*/'p'], body[ /*query*/'q']);
            }
            else if (action === 'ac') {
                this.onAuthRevoked_(body[ /*status code*/'s'], body[ /* explanation */'d']);
            }
            else if (action === 'apc') {
                this.onAppCheckRevoked_(body[ /*status code*/'s'], body[ /* explanation */'d']);
            }
            else if (action === 'sd') {
                this.onSecurityDebugPacket_(body);
            }
            else {
                error('Unrecognized action received from server: ' +
                    stringify(action) +
                    '\nAre you using the latest client?');
            }
        }
        onReady_(timestamp, sessionId) {
            this.log_('connection ready');
            this.connected_ = true;
            this.lastConnectionEstablishedTime_ = new Date().getTime();
            this.handleTimestamp_(timestamp);
            this.lastSessionId = sessionId;
            if (this.firstConnection_) {
                this.sendConnectStats_();
            }
            this.restoreState_();
            this.firstConnection_ = false;
            this.onConnectStatus_(true);
        }
        scheduleConnect_(timeout) {
            assert(!this.realtime_, "Scheduling a connect when we're already connected/ing?");
            if (this.establishConnectionTimer_) {
                clearTimeout(this.establishConnectionTimer_);
            }
            // NOTE: Even when timeout is 0, it's important to do a setTimeout to work around an infuriating "Security Error" in
            // Firefox when trying to write to our long-polling iframe in some scenarios (e.g. Forge or our unit tests).
            this.establishConnectionTimer_ = setTimeout(() => {
                this.establishConnectionTimer_ = null;
                this.establishConnection_();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, Math.floor(timeout));
        }
        initConnection_() {
            if (!this.realtime_ && this.firstConnection_) {
                this.scheduleConnect_(0);
            }
        }
        onVisible_(visible) {
            // NOTE: Tabbing away and back to a window will defeat our reconnect backoff, but I think that's fine.
            if (visible &&
                !this.visible_ &&
                this.reconnectDelay_ === this.maxReconnectDelay_) {
                this.log_('Window became visible.  Reducing delay.');
                this.reconnectDelay_ = RECONNECT_MIN_DELAY;
                if (!this.realtime_) {
                    this.scheduleConnect_(0);
                }
            }
            this.visible_ = visible;
        }
        onOnline_(online) {
            if (online) {
                this.log_('Browser went online.');
                this.reconnectDelay_ = RECONNECT_MIN_DELAY;
                if (!this.realtime_) {
                    this.scheduleConnect_(0);
                }
            }
            else {
                this.log_('Browser went offline.  Killing connection.');
                if (this.realtime_) {
                    this.realtime_.close();
                }
            }
        }
        onRealtimeDisconnect_() {
            this.log_('data client disconnected');
            this.connected_ = false;
            this.realtime_ = null;
            // Since we don't know if our sent transactions succeeded or not, we need to cancel them.
            this.cancelSentTransactions_();
            // Clear out the pending requests.
            this.requestCBHash_ = {};
            if (this.shouldReconnect_()) {
                if (!this.visible_) {
                    this.log_("Window isn't visible.  Delaying reconnect.");
                    this.reconnectDelay_ = this.maxReconnectDelay_;
                    this.lastConnectionAttemptTime_ = new Date().getTime();
                }
                else if (this.lastConnectionEstablishedTime_) {
                    // If we've been connected long enough, reset reconnect delay to minimum.
                    const timeSinceLastConnectSucceeded = new Date().getTime() - this.lastConnectionEstablishedTime_;
                    if (timeSinceLastConnectSucceeded > RECONNECT_DELAY_RESET_TIMEOUT) {
                        this.reconnectDelay_ = RECONNECT_MIN_DELAY;
                    }
                    this.lastConnectionEstablishedTime_ = null;
                }
                const timeSinceLastConnectAttempt = new Date().getTime() - this.lastConnectionAttemptTime_;
                let reconnectDelay = Math.max(0, this.reconnectDelay_ - timeSinceLastConnectAttempt);
                reconnectDelay = Math.random() * reconnectDelay;
                this.log_('Trying to reconnect in ' + reconnectDelay + 'ms');
                this.scheduleConnect_(reconnectDelay);
                // Adjust reconnect delay for next time.
                this.reconnectDelay_ = Math.min(this.maxReconnectDelay_, this.reconnectDelay_ * RECONNECT_DELAY_MULTIPLIER);
            }
            this.onConnectStatus_(false);
        }
        async establishConnection_() {
            if (this.shouldReconnect_()) {
                this.log_('Making a connection attempt');
                this.lastConnectionAttemptTime_ = new Date().getTime();
                this.lastConnectionEstablishedTime_ = null;
                const onDataMessage = this.onDataMessage_.bind(this);
                const onReady = this.onReady_.bind(this);
                const onDisconnect = this.onRealtimeDisconnect_.bind(this);
                const connId = this.id + ':' + PersistentConnection.nextConnectionId_++;
                const lastSessionId = this.lastSessionId;
                let canceled = false;
                let connection = null;
                const closeFn = function () {
                    if (connection) {
                        connection.close();
                    }
                    else {
                        canceled = true;
                        onDisconnect();
                    }
                };
                const sendRequestFn = function (msg) {
                    assert(connection, "sendRequest call when we're not connected not allowed.");
                    connection.sendRequest(msg);
                };
                this.realtime_ = {
                    close: closeFn,
                    sendRequest: sendRequestFn
                };
                const forceRefresh = this.forceTokenRefresh_;
                this.forceTokenRefresh_ = false;
                try {
                    // First fetch auth and app check token, and establish connection after
                    // fetching the token was successful
                    const [authToken, appCheckToken] = await Promise.all([
                        this.authTokenProvider_.getToken(forceRefresh),
                        this.appCheckTokenProvider_.getToken(forceRefresh)
                    ]);
                    if (!canceled) {
                        log('getToken() completed. Creating connection.');
                        this.authToken_ = authToken && authToken.accessToken;
                        this.appCheckToken_ = appCheckToken && appCheckToken.token;
                        connection = new Connection(connId, this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, onDataMessage, onReady, onDisconnect, 
                        /* onKill= */ reason => {
                            warn(reason + ' (' + this.repoInfo_.toString() + ')');
                            this.interrupt(SERVER_KILL_INTERRUPT_REASON);
                        }, lastSessionId);
                    }
                    else {
                        log('getToken() completed but was canceled');
                    }
                }
                catch (error) {
                    this.log_('Failed to get token: ' + error);
                    if (!canceled) {
                        if (this.repoInfo_.nodeAdmin) {
                            // This may be a critical error for the Admin Node.js SDK, so log a warning.
                            // But getToken() may also just have temporarily failed, so we still want to
                            // continue retrying.
                            warn(error);
                        }
                        closeFn();
                    }
                }
            }
        }
        interrupt(reason) {
            log('Interrupting connection for reason: ' + reason);
            this.interruptReasons_[reason] = true;
            if (this.realtime_) {
                this.realtime_.close();
            }
            else {
                if (this.establishConnectionTimer_) {
                    clearTimeout(this.establishConnectionTimer_);
                    this.establishConnectionTimer_ = null;
                }
                if (this.connected_) {
                    this.onRealtimeDisconnect_();
                }
            }
        }
        resume(reason) {
            log('Resuming connection for reason: ' + reason);
            delete this.interruptReasons_[reason];
            if (isEmpty(this.interruptReasons_)) {
                this.reconnectDelay_ = RECONNECT_MIN_DELAY;
                if (!this.realtime_) {
                    this.scheduleConnect_(0);
                }
            }
        }
        handleTimestamp_(timestamp) {
            const delta = timestamp - new Date().getTime();
            this.onServerInfoUpdate_({ serverTimeOffset: delta });
        }
        cancelSentTransactions_() {
            for (let i = 0; i < this.outstandingPuts_.length; i++) {
                const put = this.outstandingPuts_[i];
                if (put && /*hash*/ 'h' in put.request && put.queued) {
                    if (put.onComplete) {
                        put.onComplete('disconnect');
                    }
                    delete this.outstandingPuts_[i];
                    this.outstandingPutCount_--;
                }
            }
            // Clean up array occasionally.
            if (this.outstandingPutCount_ === 0) {
                this.outstandingPuts_ = [];
            }
        }
        onListenRevoked_(pathString, query) {
            // Remove the listen and manufacture a "permission_denied" error for the failed listen.
            let queryId;
            if (!query) {
                queryId = 'default';
            }
            else {
                queryId = query.map(q => ObjectToUniqueKey(q)).join('$');
            }
            const listen = this.removeListen_(pathString, queryId);
            if (listen && listen.onComplete) {
                listen.onComplete('permission_denied');
            }
        }
        removeListen_(pathString, queryId) {
            const normalizedPathString = new Path(pathString).toString(); // normalize path.
            let listen;
            if (this.listens.has(normalizedPathString)) {
                const map = this.listens.get(normalizedPathString);
                listen = map.get(queryId);
                map.delete(queryId);
                if (map.size === 0) {
                    this.listens.delete(normalizedPathString);
                }
            }
            else {
                // all listens for this path has already been removed
                listen = undefined;
            }
            return listen;
        }
        onAuthRevoked_(statusCode, explanation) {
            log('Auth token revoked: ' + statusCode + '/' + explanation);
            this.authToken_ = null;
            this.forceTokenRefresh_ = true;
            this.realtime_.close();
            if (statusCode === 'invalid_token' || statusCode === 'permission_denied') {
                // We'll wait a couple times before logging the warning / increasing the
                // retry period since oauth tokens will report as "invalid" if they're
                // just expired. Plus there may be transient issues that resolve themselves.
                this.invalidAuthTokenCount_++;
                if (this.invalidAuthTokenCount_ >= INVALID_TOKEN_THRESHOLD) {
                    // Set a long reconnect delay because recovery is unlikely
                    this.reconnectDelay_ = RECONNECT_MAX_DELAY_FOR_ADMINS;
                    // Notify the auth token provider that the token is invalid, which will log
                    // a warning
                    this.authTokenProvider_.notifyForInvalidToken();
                }
            }
        }
        onAppCheckRevoked_(statusCode, explanation) {
            log('App check token revoked: ' + statusCode + '/' + explanation);
            this.appCheckToken_ = null;
            this.forceTokenRefresh_ = true;
            // Note: We don't close the connection as the developer may not have
            // enforcement enabled. The backend closes connections with enforcements.
            if (statusCode === 'invalid_token' || statusCode === 'permission_denied') {
                // We'll wait a couple times before logging the warning / increasing the
                // retry period since oauth tokens will report as "invalid" if they're
                // just expired. Plus there may be transient issues that resolve themselves.
                this.invalidAppCheckTokenCount_++;
                if (this.invalidAppCheckTokenCount_ >= INVALID_TOKEN_THRESHOLD) {
                    this.appCheckTokenProvider_.notifyForInvalidToken();
                }
            }
        }
        onSecurityDebugPacket_(body) {
            if (this.securityDebugCallback_) {
                this.securityDebugCallback_(body);
            }
            else {
                if ('msg' in body) {
                    console.log('FIREBASE: ' + body['msg'].replace('\n', '\nFIREBASE: '));
                }
            }
        }
        restoreState_() {
            //Re-authenticate ourselves if we have a credential stored.
            this.tryAuth();
            this.tryAppCheck();
            // Puts depend on having received the corresponding data update from the server before they complete, so we must
            // make sure to send listens before puts.
            for (const queries of this.listens.values()) {
                for (const listenSpec of queries.values()) {
                    this.sendListen_(listenSpec);
                }
            }
            for (let i = 0; i < this.outstandingPuts_.length; i++) {
                if (this.outstandingPuts_[i]) {
                    this.sendPut_(i);
                }
            }
            while (this.onDisconnectRequestQueue_.length) {
                const request = this.onDisconnectRequestQueue_.shift();
                this.sendOnDisconnect_(request.action, request.pathString, request.data, request.onComplete);
            }
            for (let i = 0; i < this.outstandingGets_.length; i++) {
                if (this.outstandingGets_[i]) {
                    this.sendGet_(i);
                }
            }
        }
        /**
         * Sends client stats for first connection
         */
        sendConnectStats_() {
            const stats = {};
            let clientName = 'js';
            stats['sdk.' + clientName + '.' + SDK_VERSION.replace(/\./g, '-')] = 1;
            if (isMobileCordova()) {
                stats['framework.cordova'] = 1;
            }
            else if (isReactNative()) {
                stats['framework.reactnative'] = 1;
            }
            this.reportStats(stats);
        }
        shouldReconnect_() {
            const online = OnlineMonitor.getInstance().currentlyOnline();
            return isEmpty(this.interruptReasons_) && online;
        }
    }
    PersistentConnection.nextPersistentConnectionId_ = 0;
    /**
     * Counter for number of connections created. Mainly used for tagging in the logs
     */
    PersistentConnection.nextConnectionId_ = 0;

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
    class NamedNode {
        constructor(name, node) {
            this.name = name;
            this.node = node;
        }
        static Wrap(name, node) {
            return new NamedNode(name, node);
        }
    }

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
    class Index {
        /**
         * @returns A standalone comparison function for
         * this index
         */
        getCompare() {
            return this.compare.bind(this);
        }
        /**
         * Given a before and after value for a node, determine if the indexed value has changed. Even if they are different,
         * it's possible that the changes are isolated to parts of the snapshot that are not indexed.
         *
         *
         * @returns True if the portion of the snapshot being indexed changed between oldNode and newNode
         */
        indexedValueChanged(oldNode, newNode) {
            const oldWrapped = new NamedNode(MIN_NAME, oldNode);
            const newWrapped = new NamedNode(MIN_NAME, newNode);
            return this.compare(oldWrapped, newWrapped) !== 0;
        }
        /**
         * @returns a node wrapper that will sort equal to or less than
         * any other node wrapper, using this index
         */
        minPost() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return NamedNode.MIN;
        }
    }

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
    let __EMPTY_NODE;
    class KeyIndex extends Index {
        static get __EMPTY_NODE() {
            return __EMPTY_NODE;
        }
        static set __EMPTY_NODE(val) {
            __EMPTY_NODE = val;
        }
        compare(a, b) {
            return nameCompare(a.name, b.name);
        }
        isDefinedOn(node) {
            // We could probably return true here (since every node has a key), but it's never called
            // so just leaving unimplemented for now.
            throw assertionError('KeyIndex.isDefinedOn not expected to be called.');
        }
        indexedValueChanged(oldNode, newNode) {
            return false; // The key for a node never changes.
        }
        minPost() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return NamedNode.MIN;
        }
        maxPost() {
            // TODO: This should really be created once and cached in a static property, but
            // NamedNode isn't defined yet, so I can't use it in a static.  Bleh.
            return new NamedNode(MAX_NAME, __EMPTY_NODE);
        }
        makePost(indexValue, name) {
            assert(typeof indexValue === 'string', 'KeyIndex indexValue must always be a string.');
            // We just use empty node, but it'll never be compared, since our comparator only looks at name.
            return new NamedNode(indexValue, __EMPTY_NODE);
        }
        /**
         * @returns String representation for inclusion in a query spec
         */
        toString() {
            return '.key';
        }
    }
    const KEY_INDEX = new KeyIndex();

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
     * An iterator over an LLRBNode.
     */
    class SortedMapIterator {
        /**
         * @param node - Node to iterate.
         * @param isReverse_ - Whether or not to iterate in reverse
         */
        constructor(node, startKey, comparator, isReverse_, resultGenerator_ = null) {
            this.isReverse_ = isReverse_;
            this.resultGenerator_ = resultGenerator_;
            this.nodeStack_ = [];
            let cmp = 1;
            while (!node.isEmpty()) {
                node = node;
                cmp = startKey ? comparator(node.key, startKey) : 1;
                // flip the comparison if we're going in reverse
                if (isReverse_) {
                    cmp *= -1;
                }
                if (cmp < 0) {
                    // This node is less than our start key. ignore it
                    if (this.isReverse_) {
                        node = node.left;
                    }
                    else {
                        node = node.right;
                    }
                }
                else if (cmp === 0) {
                    // This node is exactly equal to our start key. Push it on the stack, but stop iterating;
                    this.nodeStack_.push(node);
                    break;
                }
                else {
                    // This node is greater than our start key, add it to the stack and move to the next one
                    this.nodeStack_.push(node);
                    if (this.isReverse_) {
                        node = node.right;
                    }
                    else {
                        node = node.left;
                    }
                }
            }
        }
        getNext() {
            if (this.nodeStack_.length === 0) {
                return null;
            }
            let node = this.nodeStack_.pop();
            let result;
            if (this.resultGenerator_) {
                result = this.resultGenerator_(node.key, node.value);
            }
            else {
                result = { key: node.key, value: node.value };
            }
            if (this.isReverse_) {
                node = node.left;
                while (!node.isEmpty()) {
                    this.nodeStack_.push(node);
                    node = node.right;
                }
            }
            else {
                node = node.right;
                while (!node.isEmpty()) {
                    this.nodeStack_.push(node);
                    node = node.left;
                }
            }
            return result;
        }
        hasNext() {
            return this.nodeStack_.length > 0;
        }
        peek() {
            if (this.nodeStack_.length === 0) {
                return null;
            }
            const node = this.nodeStack_[this.nodeStack_.length - 1];
            if (this.resultGenerator_) {
                return this.resultGenerator_(node.key, node.value);
            }
            else {
                return { key: node.key, value: node.value };
            }
        }
    }
    /**
     * Represents a node in a Left-leaning Red-Black tree.
     */
    class LLRBNode {
        /**
         * @param key - Key associated with this node.
         * @param value - Value associated with this node.
         * @param color - Whether this node is red.
         * @param left - Left child.
         * @param right - Right child.
         */
        constructor(key, value, color, left, right) {
            this.key = key;
            this.value = value;
            this.color = color != null ? color : LLRBNode.RED;
            this.left =
                left != null ? left : SortedMap.EMPTY_NODE;
            this.right =
                right != null ? right : SortedMap.EMPTY_NODE;
        }
        /**
         * Returns a copy of the current node, optionally replacing pieces of it.
         *
         * @param key - New key for the node, or null.
         * @param value - New value for the node, or null.
         * @param color - New color for the node, or null.
         * @param left - New left child for the node, or null.
         * @param right - New right child for the node, or null.
         * @returns The node copy.
         */
        copy(key, value, color, left, right) {
            return new LLRBNode(key != null ? key : this.key, value != null ? value : this.value, color != null ? color : this.color, left != null ? left : this.left, right != null ? right : this.right);
        }
        /**
         * @returns The total number of nodes in the tree.
         */
        count() {
            return this.left.count() + 1 + this.right.count();
        }
        /**
         * @returns True if the tree is empty.
         */
        isEmpty() {
            return false;
        }
        /**
         * Traverses the tree in key order and calls the specified action function
         * for each node.
         *
         * @param action - Callback function to be called for each
         *   node.  If it returns true, traversal is aborted.
         * @returns The first truthy value returned by action, or the last falsey
         *   value returned by action
         */
        inorderTraversal(action) {
            return (this.left.inorderTraversal(action) ||
                !!action(this.key, this.value) ||
                this.right.inorderTraversal(action));
        }
        /**
         * Traverses the tree in reverse key order and calls the specified action function
         * for each node.
         *
         * @param action - Callback function to be called for each
         * node.  If it returns true, traversal is aborted.
         * @returns True if traversal was aborted.
         */
        reverseTraversal(action) {
            return (this.right.reverseTraversal(action) ||
                action(this.key, this.value) ||
                this.left.reverseTraversal(action));
        }
        /**
         * @returns The minimum node in the tree.
         */
        min_() {
            if (this.left.isEmpty()) {
                return this;
            }
            else {
                return this.left.min_();
            }
        }
        /**
         * @returns The maximum key in the tree.
         */
        minKey() {
            return this.min_().key;
        }
        /**
         * @returns The maximum key in the tree.
         */
        maxKey() {
            if (this.right.isEmpty()) {
                return this.key;
            }
            else {
                return this.right.maxKey();
            }
        }
        /**
         * @param key - Key to insert.
         * @param value - Value to insert.
         * @param comparator - Comparator.
         * @returns New tree, with the key/value added.
         */
        insert(key, value, comparator) {
            let n = this;
            const cmp = comparator(key, n.key);
            if (cmp < 0) {
                n = n.copy(null, null, null, n.left.insert(key, value, comparator), null);
            }
            else if (cmp === 0) {
                n = n.copy(null, value, null, null, null);
            }
            else {
                n = n.copy(null, null, null, null, n.right.insert(key, value, comparator));
            }
            return n.fixUp_();
        }
        /**
         * @returns New tree, with the minimum key removed.
         */
        removeMin_() {
            if (this.left.isEmpty()) {
                return SortedMap.EMPTY_NODE;
            }
            let n = this;
            if (!n.left.isRed_() && !n.left.left.isRed_()) {
                n = n.moveRedLeft_();
            }
            n = n.copy(null, null, null, n.left.removeMin_(), null);
            return n.fixUp_();
        }
        /**
         * @param key - The key of the item to remove.
         * @param comparator - Comparator.
         * @returns New tree, with the specified item removed.
         */
        remove(key, comparator) {
            let n, smallest;
            n = this;
            if (comparator(key, n.key) < 0) {
                if (!n.left.isEmpty() && !n.left.isRed_() && !n.left.left.isRed_()) {
                    n = n.moveRedLeft_();
                }
                n = n.copy(null, null, null, n.left.remove(key, comparator), null);
            }
            else {
                if (n.left.isRed_()) {
                    n = n.rotateRight_();
                }
                if (!n.right.isEmpty() && !n.right.isRed_() && !n.right.left.isRed_()) {
                    n = n.moveRedRight_();
                }
                if (comparator(key, n.key) === 0) {
                    if (n.right.isEmpty()) {
                        return SortedMap.EMPTY_NODE;
                    }
                    else {
                        smallest = n.right.min_();
                        n = n.copy(smallest.key, smallest.value, null, null, n.right.removeMin_());
                    }
                }
                n = n.copy(null, null, null, null, n.right.remove(key, comparator));
            }
            return n.fixUp_();
        }
        /**
         * @returns Whether this is a RED node.
         */
        isRed_() {
            return this.color;
        }
        /**
         * @returns New tree after performing any needed rotations.
         */
        fixUp_() {
            let n = this;
            if (n.right.isRed_() && !n.left.isRed_()) {
                n = n.rotateLeft_();
            }
            if (n.left.isRed_() && n.left.left.isRed_()) {
                n = n.rotateRight_();
            }
            if (n.left.isRed_() && n.right.isRed_()) {
                n = n.colorFlip_();
            }
            return n;
        }
        /**
         * @returns New tree, after moveRedLeft.
         */
        moveRedLeft_() {
            let n = this.colorFlip_();
            if (n.right.left.isRed_()) {
                n = n.copy(null, null, null, null, n.right.rotateRight_());
                n = n.rotateLeft_();
                n = n.colorFlip_();
            }
            return n;
        }
        /**
         * @returns New tree, after moveRedRight.
         */
        moveRedRight_() {
            let n = this.colorFlip_();
            if (n.left.left.isRed_()) {
                n = n.rotateRight_();
                n = n.colorFlip_();
            }
            return n;
        }
        /**
         * @returns New tree, after rotateLeft.
         */
        rotateLeft_() {
            const nl = this.copy(null, null, LLRBNode.RED, null, this.right.left);
            return this.right.copy(null, null, this.color, nl, null);
        }
        /**
         * @returns New tree, after rotateRight.
         */
        rotateRight_() {
            const nr = this.copy(null, null, LLRBNode.RED, this.left.right, null);
            return this.left.copy(null, null, this.color, null, nr);
        }
        /**
         * @returns Newt ree, after colorFlip.
         */
        colorFlip_() {
            const left = this.left.copy(null, null, !this.left.color, null, null);
            const right = this.right.copy(null, null, !this.right.color, null, null);
            return this.copy(null, null, !this.color, left, right);
        }
        /**
         * For testing.
         *
         * @returns True if all is well.
         */
        checkMaxDepth_() {
            const blackDepth = this.check_();
            return Math.pow(2.0, blackDepth) <= this.count() + 1;
        }
        check_() {
            if (this.isRed_() && this.left.isRed_()) {
                throw new Error('Red node has red child(' + this.key + ',' + this.value + ')');
            }
            if (this.right.isRed_()) {
                throw new Error('Right child of (' + this.key + ',' + this.value + ') is red');
            }
            const blackDepth = this.left.check_();
            if (blackDepth !== this.right.check_()) {
                throw new Error('Black depths differ');
            }
            else {
                return blackDepth + (this.isRed_() ? 0 : 1);
            }
        }
    }
    LLRBNode.RED = true;
    LLRBNode.BLACK = false;
    /**
     * Represents an empty node (a leaf node in the Red-Black Tree).
     */
    class LLRBEmptyNode {
        /**
         * Returns a copy of the current node.
         *
         * @returns The node copy.
         */
        copy(key, value, color, left, right) {
            return this;
        }
        /**
         * Returns a copy of the tree, with the specified key/value added.
         *
         * @param key - Key to be added.
         * @param value - Value to be added.
         * @param comparator - Comparator.
         * @returns New tree, with item added.
         */
        insert(key, value, comparator) {
            return new LLRBNode(key, value, null);
        }
        /**
         * Returns a copy of the tree, with the specified key removed.
         *
         * @param key - The key to remove.
         * @param comparator - Comparator.
         * @returns New tree, with item removed.
         */
        remove(key, comparator) {
            return this;
        }
        /**
         * @returns The total number of nodes in the tree.
         */
        count() {
            return 0;
        }
        /**
         * @returns True if the tree is empty.
         */
        isEmpty() {
            return true;
        }
        /**
         * Traverses the tree in key order and calls the specified action function
         * for each node.
         *
         * @param action - Callback function to be called for each
         * node.  If it returns true, traversal is aborted.
         * @returns True if traversal was aborted.
         */
        inorderTraversal(action) {
            return false;
        }
        /**
         * Traverses the tree in reverse key order and calls the specified action function
         * for each node.
         *
         * @param action - Callback function to be called for each
         * node.  If it returns true, traversal is aborted.
         * @returns True if traversal was aborted.
         */
        reverseTraversal(action) {
            return false;
        }
        minKey() {
            return null;
        }
        maxKey() {
            return null;
        }
        check_() {
            return 0;
        }
        /**
         * @returns Whether this node is red.
         */
        isRed_() {
            return false;
        }
    }
    /**
     * An immutable sorted map implementation, based on a Left-leaning Red-Black
     * tree.
     */
    class SortedMap {
        /**
         * @param comparator_ - Key comparator.
         * @param root_ - Optional root node for the map.
         */
        constructor(comparator_, root_ = SortedMap.EMPTY_NODE) {
            this.comparator_ = comparator_;
            this.root_ = root_;
        }
        /**
         * Returns a copy of the map, with the specified key/value added or replaced.
         * (TODO: We should perhaps rename this method to 'put')
         *
         * @param key - Key to be added.
         * @param value - Value to be added.
         * @returns New map, with item added.
         */
        insert(key, value) {
            return new SortedMap(this.comparator_, this.root_
                .insert(key, value, this.comparator_)
                .copy(null, null, LLRBNode.BLACK, null, null));
        }
        /**
         * Returns a copy of the map, with the specified key removed.
         *
         * @param key - The key to remove.
         * @returns New map, with item removed.
         */
        remove(key) {
            return new SortedMap(this.comparator_, this.root_
                .remove(key, this.comparator_)
                .copy(null, null, LLRBNode.BLACK, null, null));
        }
        /**
         * Returns the value of the node with the given key, or null.
         *
         * @param key - The key to look up.
         * @returns The value of the node with the given key, or null if the
         * key doesn't exist.
         */
        get(key) {
            let cmp;
            let node = this.root_;
            while (!node.isEmpty()) {
                cmp = this.comparator_(key, node.key);
                if (cmp === 0) {
                    return node.value;
                }
                else if (cmp < 0) {
                    node = node.left;
                }
                else if (cmp > 0) {
                    node = node.right;
                }
            }
            return null;
        }
        /**
         * Returns the key of the item *before* the specified key, or null if key is the first item.
         * @param key - The key to find the predecessor of
         * @returns The predecessor key.
         */
        getPredecessorKey(key) {
            let cmp, node = this.root_, rightParent = null;
            while (!node.isEmpty()) {
                cmp = this.comparator_(key, node.key);
                if (cmp === 0) {
                    if (!node.left.isEmpty()) {
                        node = node.left;
                        while (!node.right.isEmpty()) {
                            node = node.right;
                        }
                        return node.key;
                    }
                    else if (rightParent) {
                        return rightParent.key;
                    }
                    else {
                        return null; // first item.
                    }
                }
                else if (cmp < 0) {
                    node = node.left;
                }
                else if (cmp > 0) {
                    rightParent = node;
                    node = node.right;
                }
            }
            throw new Error('Attempted to find predecessor key for a nonexistent key.  What gives?');
        }
        /**
         * @returns True if the map is empty.
         */
        isEmpty() {
            return this.root_.isEmpty();
        }
        /**
         * @returns The total number of nodes in the map.
         */
        count() {
            return this.root_.count();
        }
        /**
         * @returns The minimum key in the map.
         */
        minKey() {
            return this.root_.minKey();
        }
        /**
         * @returns The maximum key in the map.
         */
        maxKey() {
            return this.root_.maxKey();
        }
        /**
         * Traverses the map in key order and calls the specified action function
         * for each key/value pair.
         *
         * @param action - Callback function to be called
         * for each key/value pair.  If action returns true, traversal is aborted.
         * @returns The first truthy value returned by action, or the last falsey
         *   value returned by action
         */
        inorderTraversal(action) {
            return this.root_.inorderTraversal(action);
        }
        /**
         * Traverses the map in reverse key order and calls the specified action function
         * for each key/value pair.
         *
         * @param action - Callback function to be called
         * for each key/value pair.  If action returns true, traversal is aborted.
         * @returns True if the traversal was aborted.
         */
        reverseTraversal(action) {
            return this.root_.reverseTraversal(action);
        }
        /**
         * Returns an iterator over the SortedMap.
         * @returns The iterator.
         */
        getIterator(resultGenerator) {
            return new SortedMapIterator(this.root_, null, this.comparator_, false, resultGenerator);
        }
        getIteratorFrom(key, resultGenerator) {
            return new SortedMapIterator(this.root_, key, this.comparator_, false, resultGenerator);
        }
        getReverseIteratorFrom(key, resultGenerator) {
            return new SortedMapIterator(this.root_, key, this.comparator_, true, resultGenerator);
        }
        getReverseIterator(resultGenerator) {
            return new SortedMapIterator(this.root_, null, this.comparator_, true, resultGenerator);
        }
    }
    /**
     * Always use the same empty node, to reduce memory.
     */
    SortedMap.EMPTY_NODE = new LLRBEmptyNode();

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
    function NAME_ONLY_COMPARATOR(left, right) {
        return nameCompare(left.name, right.name);
    }
    function NAME_COMPARATOR(left, right) {
        return nameCompare(left, right);
    }

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
    let MAX_NODE$2;
    function setMaxNode$1(val) {
        MAX_NODE$2 = val;
    }
    const priorityHashText = function (priority) {
        if (typeof priority === 'number') {
            return 'number:' + doubleToIEEE754String(priority);
        }
        else {
            return 'string:' + priority;
        }
    };
    /**
     * Validates that a priority snapshot Node is valid.
     */
    const validatePriorityNode = function (priorityNode) {
        if (priorityNode.isLeafNode()) {
            const val = priorityNode.val();
            assert(typeof val === 'string' ||
                typeof val === 'number' ||
                (typeof val === 'object' && contains(val, '.sv')), 'Priority must be a string or number.');
        }
        else {
            assert(priorityNode === MAX_NODE$2 || priorityNode.isEmpty(), 'priority of unexpected type.');
        }
        // Don't call getPriority() on MAX_NODE to avoid hitting assertion.
        assert(priorityNode === MAX_NODE$2 || priorityNode.getPriority().isEmpty(), "Priority nodes can't have a priority of their own.");
    };

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
    let __childrenNodeConstructor;
    /**
     * LeafNode is a class for storing leaf nodes in a DataSnapshot.  It
     * implements Node and stores the value of the node (a string,
     * number, or boolean) accessible via getValue().
     */
    class LeafNode {
        /**
         * @param value_ - The value to store in this leaf node. The object type is
         * possible in the event of a deferred value
         * @param priorityNode_ - The priority of this node.
         */
        constructor(value_, priorityNode_ = LeafNode.__childrenNodeConstructor.EMPTY_NODE) {
            this.value_ = value_;
            this.priorityNode_ = priorityNode_;
            this.lazyHash_ = null;
            assert(this.value_ !== undefined && this.value_ !== null, "LeafNode shouldn't be created with null/undefined value.");
            validatePriorityNode(this.priorityNode_);
        }
        static set __childrenNodeConstructor(val) {
            __childrenNodeConstructor = val;
        }
        static get __childrenNodeConstructor() {
            return __childrenNodeConstructor;
        }
        /** @inheritDoc */
        isLeafNode() {
            return true;
        }
        /** @inheritDoc */
        getPriority() {
            return this.priorityNode_;
        }
        /** @inheritDoc */
        updatePriority(newPriorityNode) {
            return new LeafNode(this.value_, newPriorityNode);
        }
        /** @inheritDoc */
        getImmediateChild(childName) {
            // Hack to treat priority as a regular child
            if (childName === '.priority') {
                return this.priorityNode_;
            }
            else {
                return LeafNode.__childrenNodeConstructor.EMPTY_NODE;
            }
        }
        /** @inheritDoc */
        getChild(path) {
            if (pathIsEmpty(path)) {
                return this;
            }
            else if (pathGetFront(path) === '.priority') {
                return this.priorityNode_;
            }
            else {
                return LeafNode.__childrenNodeConstructor.EMPTY_NODE;
            }
        }
        hasChild() {
            return false;
        }
        /** @inheritDoc */
        getPredecessorChildName(childName, childNode) {
            return null;
        }
        /** @inheritDoc */
        updateImmediateChild(childName, newChildNode) {
            if (childName === '.priority') {
                return this.updatePriority(newChildNode);
            }
            else if (newChildNode.isEmpty() && childName !== '.priority') {
                return this;
            }
            else {
                return LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(childName, newChildNode).updatePriority(this.priorityNode_);
            }
        }
        /** @inheritDoc */
        updateChild(path, newChildNode) {
            const front = pathGetFront(path);
            if (front === null) {
                return newChildNode;
            }
            else if (newChildNode.isEmpty() && front !== '.priority') {
                return this;
            }
            else {
                assert(front !== '.priority' || pathGetLength(path) === 1, '.priority must be the last token in a path');
                return this.updateImmediateChild(front, LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateChild(pathPopFront(path), newChildNode));
            }
        }
        /** @inheritDoc */
        isEmpty() {
            return false;
        }
        /** @inheritDoc */
        numChildren() {
            return 0;
        }
        /** @inheritDoc */
        forEachChild(index, action) {
            return false;
        }
        val(exportFormat) {
            if (exportFormat && !this.getPriority().isEmpty()) {
                return {
                    '.value': this.getValue(),
                    '.priority': this.getPriority().val()
                };
            }
            else {
                return this.getValue();
            }
        }
        /** @inheritDoc */
        hash() {
            if (this.lazyHash_ === null) {
                let toHash = '';
                if (!this.priorityNode_.isEmpty()) {
                    toHash +=
                        'priority:' +
                            priorityHashText(this.priorityNode_.val()) +
                            ':';
                }
                const type = typeof this.value_;
                toHash += type + ':';
                if (type === 'number') {
                    toHash += doubleToIEEE754String(this.value_);
                }
                else {
                    toHash += this.value_;
                }
                this.lazyHash_ = sha1(toHash);
            }
            return this.lazyHash_;
        }
        /**
         * Returns the value of the leaf node.
         * @returns The value of the node.
         */
        getValue() {
            return this.value_;
        }
        compareTo(other) {
            if (other === LeafNode.__childrenNodeConstructor.EMPTY_NODE) {
                return 1;
            }
            else if (other instanceof LeafNode.__childrenNodeConstructor) {
                return -1;
            }
            else {
                assert(other.isLeafNode(), 'Unknown node type');
                return this.compareToLeafNode_(other);
            }
        }
        /**
         * Comparison specifically for two leaf nodes
         */
        compareToLeafNode_(otherLeaf) {
            const otherLeafType = typeof otherLeaf.value_;
            const thisLeafType = typeof this.value_;
            const otherIndex = LeafNode.VALUE_TYPE_ORDER.indexOf(otherLeafType);
            const thisIndex = LeafNode.VALUE_TYPE_ORDER.indexOf(thisLeafType);
            assert(otherIndex >= 0, 'Unknown leaf type: ' + otherLeafType);
            assert(thisIndex >= 0, 'Unknown leaf type: ' + thisLeafType);
            if (otherIndex === thisIndex) {
                // Same type, compare values
                if (thisLeafType === 'object') {
                    // Deferred value nodes are all equal, but we should also never get to this point...
                    return 0;
                }
                else {
                    // Note that this works because true > false, all others are number or string comparisons
                    if (this.value_ < otherLeaf.value_) {
                        return -1;
                    }
                    else if (this.value_ === otherLeaf.value_) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                }
            }
            else {
                return thisIndex - otherIndex;
            }
        }
        withIndex() {
            return this;
        }
        isIndexed() {
            return true;
        }
        equals(other) {
            if (other === this) {
                return true;
            }
            else if (other.isLeafNode()) {
                const otherLeaf = other;
                return (this.value_ === otherLeaf.value_ &&
                    this.priorityNode_.equals(otherLeaf.priorityNode_));
            }
            else {
                return false;
            }
        }
    }
    /**
     * The sort order for comparing leaf nodes of different types. If two leaf nodes have
     * the same type, the comparison falls back to their value
     */
    LeafNode.VALUE_TYPE_ORDER = ['object', 'boolean', 'number', 'string'];

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
    let nodeFromJSON$1;
    let MAX_NODE$1;
    function setNodeFromJSON(val) {
        nodeFromJSON$1 = val;
    }
    function setMaxNode(val) {
        MAX_NODE$1 = val;
    }
    class PriorityIndex extends Index {
        compare(a, b) {
            const aPriority = a.node.getPriority();
            const bPriority = b.node.getPriority();
            const indexCmp = aPriority.compareTo(bPriority);
            if (indexCmp === 0) {
                return nameCompare(a.name, b.name);
            }
            else {
                return indexCmp;
            }
        }
        isDefinedOn(node) {
            return !node.getPriority().isEmpty();
        }
        indexedValueChanged(oldNode, newNode) {
            return !oldNode.getPriority().equals(newNode.getPriority());
        }
        minPost() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return NamedNode.MIN;
        }
        maxPost() {
            return new NamedNode(MAX_NAME, new LeafNode('[PRIORITY-POST]', MAX_NODE$1));
        }
        makePost(indexValue, name) {
            const priorityNode = nodeFromJSON$1(indexValue);
            return new NamedNode(name, new LeafNode('[PRIORITY-POST]', priorityNode));
        }
        /**
         * @returns String representation for inclusion in a query spec
         */
        toString() {
            return '.priority';
        }
    }
    const PRIORITY_INDEX = new PriorityIndex();

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
    const LOG_2 = Math.log(2);
    class Base12Num {
        constructor(length) {
            const logBase2 = (num) => 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parseInt((Math.log(num) / LOG_2), 10);
            const bitMask = (bits) => parseInt(Array(bits + 1).join('1'), 2);
            this.count = logBase2(length + 1);
            this.current_ = this.count - 1;
            const mask = bitMask(this.count);
            this.bits_ = (length + 1) & mask;
        }
        nextBitIsOne() {
            //noinspection JSBitwiseOperatorUsage
            const result = !(this.bits_ & (0x1 << this.current_));
            this.current_--;
            return result;
        }
    }
    /**
     * Takes a list of child nodes and constructs a SortedSet using the given comparison
     * function
     *
     * Uses the algorithm described in the paper linked here:
     * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.46.1458
     *
     * @param childList - Unsorted list of children
     * @param cmp - The comparison method to be used
     * @param keyFn - An optional function to extract K from a node wrapper, if K's
     * type is not NamedNode
     * @param mapSortFn - An optional override for comparator used by the generated sorted map
     */
    const buildChildSet = function (childList, cmp, keyFn, mapSortFn) {
        childList.sort(cmp);
        const buildBalancedTree = function (low, high) {
            const length = high - low;
            let namedNode;
            let key;
            if (length === 0) {
                return null;
            }
            else if (length === 1) {
                namedNode = childList[low];
                key = keyFn ? keyFn(namedNode) : namedNode;
                return new LLRBNode(key, namedNode.node, LLRBNode.BLACK, null, null);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const middle = parseInt((length / 2), 10) + low;
                const left = buildBalancedTree(low, middle);
                const right = buildBalancedTree(middle + 1, high);
                namedNode = childList[middle];
                key = keyFn ? keyFn(namedNode) : namedNode;
                return new LLRBNode(key, namedNode.node, LLRBNode.BLACK, left, right);
            }
        };
        const buildFrom12Array = function (base12) {
            let node = null;
            let root = null;
            let index = childList.length;
            const buildPennant = function (chunkSize, color) {
                const low = index - chunkSize;
                const high = index;
                index -= chunkSize;
                const childTree = buildBalancedTree(low + 1, high);
                const namedNode = childList[low];
                const key = keyFn ? keyFn(namedNode) : namedNode;
                attachPennant(new LLRBNode(key, namedNode.node, color, null, childTree));
            };
            const attachPennant = function (pennant) {
                if (node) {
                    node.left = pennant;
                    node = pennant;
                }
                else {
                    root = pennant;
                    node = pennant;
                }
            };
            for (let i = 0; i < base12.count; ++i) {
                const isOne = base12.nextBitIsOne();
                // The number of nodes taken in each slice is 2^(arr.length - (i + 1))
                const chunkSize = Math.pow(2, base12.count - (i + 1));
                if (isOne) {
                    buildPennant(chunkSize, LLRBNode.BLACK);
                }
                else {
                    // current == 2
                    buildPennant(chunkSize, LLRBNode.BLACK);
                    buildPennant(chunkSize, LLRBNode.RED);
                }
            }
            return root;
        };
        const base12 = new Base12Num(childList.length);
        const root = buildFrom12Array(base12);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new SortedMap(mapSortFn || cmp, root);
    };

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
    let _defaultIndexMap;
    const fallbackObject = {};
    class IndexMap {
        constructor(indexes_, indexSet_) {
            this.indexes_ = indexes_;
            this.indexSet_ = indexSet_;
        }
        /**
         * The default IndexMap for nodes without a priority
         */
        static get Default() {
            assert(fallbackObject && PRIORITY_INDEX, 'ChildrenNode.ts has not been loaded');
            _defaultIndexMap =
                _defaultIndexMap ||
                    new IndexMap({ '.priority': fallbackObject }, { '.priority': PRIORITY_INDEX });
            return _defaultIndexMap;
        }
        get(indexKey) {
            const sortedMap = safeGet(this.indexes_, indexKey);
            if (!sortedMap) {
                throw new Error('No index defined for ' + indexKey);
            }
            if (sortedMap instanceof SortedMap) {
                return sortedMap;
            }
            else {
                // The index exists, but it falls back to just name comparison. Return null so that the calling code uses the
                // regular child map
                return null;
            }
        }
        hasIndex(indexDefinition) {
            return contains(this.indexSet_, indexDefinition.toString());
        }
        addIndex(indexDefinition, existingChildren) {
            assert(indexDefinition !== KEY_INDEX, "KeyIndex always exists and isn't meant to be added to the IndexMap.");
            const childList = [];
            let sawIndexedValue = false;
            const iter = existingChildren.getIterator(NamedNode.Wrap);
            let next = iter.getNext();
            while (next) {
                sawIndexedValue =
                    sawIndexedValue || indexDefinition.isDefinedOn(next.node);
                childList.push(next);
                next = iter.getNext();
            }
            let newIndex;
            if (sawIndexedValue) {
                newIndex = buildChildSet(childList, indexDefinition.getCompare());
            }
            else {
                newIndex = fallbackObject;
            }
            const indexName = indexDefinition.toString();
            const newIndexSet = Object.assign({}, this.indexSet_);
            newIndexSet[indexName] = indexDefinition;
            const newIndexes = Object.assign({}, this.indexes_);
            newIndexes[indexName] = newIndex;
            return new IndexMap(newIndexes, newIndexSet);
        }
        /**
         * Ensure that this node is properly tracked in any indexes that we're maintaining
         */
        addToIndexes(namedNode, existingChildren) {
            const newIndexes = map(this.indexes_, (indexedChildren, indexName) => {
                const index = safeGet(this.indexSet_, indexName);
                assert(index, 'Missing index implementation for ' + indexName);
                if (indexedChildren === fallbackObject) {
                    // Check to see if we need to index everything
                    if (index.isDefinedOn(namedNode.node)) {
                        // We need to build this index
                        const childList = [];
                        const iter = existingChildren.getIterator(NamedNode.Wrap);
                        let next = iter.getNext();
                        while (next) {
                            if (next.name !== namedNode.name) {
                                childList.push(next);
                            }
                            next = iter.getNext();
                        }
                        childList.push(namedNode);
                        return buildChildSet(childList, index.getCompare());
                    }
                    else {
                        // No change, this remains a fallback
                        return fallbackObject;
                    }
                }
                else {
                    const existingSnap = existingChildren.get(namedNode.name);
                    let newChildren = indexedChildren;
                    if (existingSnap) {
                        newChildren = newChildren.remove(new NamedNode(namedNode.name, existingSnap));
                    }
                    return newChildren.insert(namedNode, namedNode.node);
                }
            });
            return new IndexMap(newIndexes, this.indexSet_);
        }
        /**
         * Create a new IndexMap instance with the given value removed
         */
        removeFromIndexes(namedNode, existingChildren) {
            const newIndexes = map(this.indexes_, (indexedChildren) => {
                if (indexedChildren === fallbackObject) {
                    // This is the fallback. Just return it, nothing to do in this case
                    return indexedChildren;
                }
                else {
                    const existingSnap = existingChildren.get(namedNode.name);
                    if (existingSnap) {
                        return indexedChildren.remove(new NamedNode(namedNode.name, existingSnap));
                    }
                    else {
                        // No record of this child
                        return indexedChildren;
                    }
                }
            });
            return new IndexMap(newIndexes, this.indexSet_);
        }
    }

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
    // TODO: For memory savings, don't store priorityNode_ if it's empty.
    let EMPTY_NODE;
    /**
     * ChildrenNode is a class for storing internal nodes in a DataSnapshot
     * (i.e. nodes with children).  It implements Node and stores the
     * list of children in the children property, sorted by child name.
     */
    class ChildrenNode {
        /**
         * @param children_ - List of children of this node..
         * @param priorityNode_ - The priority of this node (as a snapshot node).
         */
        constructor(children_, priorityNode_, indexMap_) {
            this.children_ = children_;
            this.priorityNode_ = priorityNode_;
            this.indexMap_ = indexMap_;
            this.lazyHash_ = null;
            /**
             * Note: The only reason we allow null priority is for EMPTY_NODE, since we can't use
             * EMPTY_NODE as the priority of EMPTY_NODE.  We might want to consider making EMPTY_NODE its own
             * class instead of an empty ChildrenNode.
             */
            if (this.priorityNode_) {
                validatePriorityNode(this.priorityNode_);
            }
            if (this.children_.isEmpty()) {
                assert(!this.priorityNode_ || this.priorityNode_.isEmpty(), 'An empty node cannot have a priority');
            }
        }
        static get EMPTY_NODE() {
            return (EMPTY_NODE ||
                (EMPTY_NODE = new ChildrenNode(new SortedMap(NAME_COMPARATOR), null, IndexMap.Default)));
        }
        /** @inheritDoc */
        isLeafNode() {
            return false;
        }
        /** @inheritDoc */
        getPriority() {
            return this.priorityNode_ || EMPTY_NODE;
        }
        /** @inheritDoc */
        updatePriority(newPriorityNode) {
            if (this.children_.isEmpty()) {
                // Don't allow priorities on empty nodes
                return this;
            }
            else {
                return new ChildrenNode(this.children_, newPriorityNode, this.indexMap_);
            }
        }
        /** @inheritDoc */
        getImmediateChild(childName) {
            // Hack to treat priority as a regular child
            if (childName === '.priority') {
                return this.getPriority();
            }
            else {
                const child = this.children_.get(childName);
                return child === null ? EMPTY_NODE : child;
            }
        }
        /** @inheritDoc */
        getChild(path) {
            const front = pathGetFront(path);
            if (front === null) {
                return this;
            }
            return this.getImmediateChild(front).getChild(pathPopFront(path));
        }
        /** @inheritDoc */
        hasChild(childName) {
            return this.children_.get(childName) !== null;
        }
        /** @inheritDoc */
        updateImmediateChild(childName, newChildNode) {
            assert(newChildNode, 'We should always be passing snapshot nodes');
            if (childName === '.priority') {
                return this.updatePriority(newChildNode);
            }
            else {
                const namedNode = new NamedNode(childName, newChildNode);
                let newChildren, newIndexMap;
                if (newChildNode.isEmpty()) {
                    newChildren = this.children_.remove(childName);
                    newIndexMap = this.indexMap_.removeFromIndexes(namedNode, this.children_);
                }
                else {
                    newChildren = this.children_.insert(childName, newChildNode);
                    newIndexMap = this.indexMap_.addToIndexes(namedNode, this.children_);
                }
                const newPriority = newChildren.isEmpty()
                    ? EMPTY_NODE
                    : this.priorityNode_;
                return new ChildrenNode(newChildren, newPriority, newIndexMap);
            }
        }
        /** @inheritDoc */
        updateChild(path, newChildNode) {
            const front = pathGetFront(path);
            if (front === null) {
                return newChildNode;
            }
            else {
                assert(pathGetFront(path) !== '.priority' || pathGetLength(path) === 1, '.priority must be the last token in a path');
                const newImmediateChild = this.getImmediateChild(front).updateChild(pathPopFront(path), newChildNode);
                return this.updateImmediateChild(front, newImmediateChild);
            }
        }
        /** @inheritDoc */
        isEmpty() {
            return this.children_.isEmpty();
        }
        /** @inheritDoc */
        numChildren() {
            return this.children_.count();
        }
        /** @inheritDoc */
        val(exportFormat) {
            if (this.isEmpty()) {
                return null;
            }
            const obj = {};
            let numKeys = 0, maxKey = 0, allIntegerKeys = true;
            this.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                obj[key] = childNode.val(exportFormat);
                numKeys++;
                if (allIntegerKeys && ChildrenNode.INTEGER_REGEXP_.test(key)) {
                    maxKey = Math.max(maxKey, Number(key));
                }
                else {
                    allIntegerKeys = false;
                }
            });
            if (!exportFormat && allIntegerKeys && maxKey < 2 * numKeys) {
                // convert to array.
                const array = [];
                // eslint-disable-next-line guard-for-in
                for (const key in obj) {
                    array[key] = obj[key];
                }
                return array;
            }
            else {
                if (exportFormat && !this.getPriority().isEmpty()) {
                    obj['.priority'] = this.getPriority().val();
                }
                return obj;
            }
        }
        /** @inheritDoc */
        hash() {
            if (this.lazyHash_ === null) {
                let toHash = '';
                if (!this.getPriority().isEmpty()) {
                    toHash +=
                        'priority:' +
                            priorityHashText(this.getPriority().val()) +
                            ':';
                }
                this.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                    const childHash = childNode.hash();
                    if (childHash !== '') {
                        toHash += ':' + key + ':' + childHash;
                    }
                });
                this.lazyHash_ = toHash === '' ? '' : sha1(toHash);
            }
            return this.lazyHash_;
        }
        /** @inheritDoc */
        getPredecessorChildName(childName, childNode, index) {
            const idx = this.resolveIndex_(index);
            if (idx) {
                const predecessor = idx.getPredecessorKey(new NamedNode(childName, childNode));
                return predecessor ? predecessor.name : null;
            }
            else {
                return this.children_.getPredecessorKey(childName);
            }
        }
        getFirstChildName(indexDefinition) {
            const idx = this.resolveIndex_(indexDefinition);
            if (idx) {
                const minKey = idx.minKey();
                return minKey && minKey.name;
            }
            else {
                return this.children_.minKey();
            }
        }
        getFirstChild(indexDefinition) {
            const minKey = this.getFirstChildName(indexDefinition);
            if (minKey) {
                return new NamedNode(minKey, this.children_.get(minKey));
            }
            else {
                return null;
            }
        }
        /**
         * Given an index, return the key name of the largest value we have, according to that index
         */
        getLastChildName(indexDefinition) {
            const idx = this.resolveIndex_(indexDefinition);
            if (idx) {
                const maxKey = idx.maxKey();
                return maxKey && maxKey.name;
            }
            else {
                return this.children_.maxKey();
            }
        }
        getLastChild(indexDefinition) {
            const maxKey = this.getLastChildName(indexDefinition);
            if (maxKey) {
                return new NamedNode(maxKey, this.children_.get(maxKey));
            }
            else {
                return null;
            }
        }
        forEachChild(index, action) {
            const idx = this.resolveIndex_(index);
            if (idx) {
                return idx.inorderTraversal(wrappedNode => {
                    return action(wrappedNode.name, wrappedNode.node);
                });
            }
            else {
                return this.children_.inorderTraversal(action);
            }
        }
        getIterator(indexDefinition) {
            return this.getIteratorFrom(indexDefinition.minPost(), indexDefinition);
        }
        getIteratorFrom(startPost, indexDefinition) {
            const idx = this.resolveIndex_(indexDefinition);
            if (idx) {
                return idx.getIteratorFrom(startPost, key => key);
            }
            else {
                const iterator = this.children_.getIteratorFrom(startPost.name, NamedNode.Wrap);
                let next = iterator.peek();
                while (next != null && indexDefinition.compare(next, startPost) < 0) {
                    iterator.getNext();
                    next = iterator.peek();
                }
                return iterator;
            }
        }
        getReverseIterator(indexDefinition) {
            return this.getReverseIteratorFrom(indexDefinition.maxPost(), indexDefinition);
        }
        getReverseIteratorFrom(endPost, indexDefinition) {
            const idx = this.resolveIndex_(indexDefinition);
            if (idx) {
                return idx.getReverseIteratorFrom(endPost, key => {
                    return key;
                });
            }
            else {
                const iterator = this.children_.getReverseIteratorFrom(endPost.name, NamedNode.Wrap);
                let next = iterator.peek();
                while (next != null && indexDefinition.compare(next, endPost) > 0) {
                    iterator.getNext();
                    next = iterator.peek();
                }
                return iterator;
            }
        }
        compareTo(other) {
            if (this.isEmpty()) {
                if (other.isEmpty()) {
                    return 0;
                }
                else {
                    return -1;
                }
            }
            else if (other.isLeafNode() || other.isEmpty()) {
                return 1;
            }
            else if (other === MAX_NODE) {
                return -1;
            }
            else {
                // Must be another node with children.
                return 0;
            }
        }
        withIndex(indexDefinition) {
            if (indexDefinition === KEY_INDEX ||
                this.indexMap_.hasIndex(indexDefinition)) {
                return this;
            }
            else {
                const newIndexMap = this.indexMap_.addIndex(indexDefinition, this.children_);
                return new ChildrenNode(this.children_, this.priorityNode_, newIndexMap);
            }
        }
        isIndexed(index) {
            return index === KEY_INDEX || this.indexMap_.hasIndex(index);
        }
        equals(other) {
            if (other === this) {
                return true;
            }
            else if (other.isLeafNode()) {
                return false;
            }
            else {
                const otherChildrenNode = other;
                if (!this.getPriority().equals(otherChildrenNode.getPriority())) {
                    return false;
                }
                else if (this.children_.count() === otherChildrenNode.children_.count()) {
                    const thisIter = this.getIterator(PRIORITY_INDEX);
                    const otherIter = otherChildrenNode.getIterator(PRIORITY_INDEX);
                    let thisCurrent = thisIter.getNext();
                    let otherCurrent = otherIter.getNext();
                    while (thisCurrent && otherCurrent) {
                        if (thisCurrent.name !== otherCurrent.name ||
                            !thisCurrent.node.equals(otherCurrent.node)) {
                            return false;
                        }
                        thisCurrent = thisIter.getNext();
                        otherCurrent = otherIter.getNext();
                    }
                    return thisCurrent === null && otherCurrent === null;
                }
                else {
                    return false;
                }
            }
        }
        /**
         * Returns a SortedMap ordered by index, or null if the default (by-key) ordering can be used
         * instead.
         *
         */
        resolveIndex_(indexDefinition) {
            if (indexDefinition === KEY_INDEX) {
                return null;
            }
            else {
                return this.indexMap_.get(indexDefinition.toString());
            }
        }
    }
    ChildrenNode.INTEGER_REGEXP_ = /^(0|[1-9]\d*)$/;
    class MaxNode extends ChildrenNode {
        constructor() {
            super(new SortedMap(NAME_COMPARATOR), ChildrenNode.EMPTY_NODE, IndexMap.Default);
        }
        compareTo(other) {
            if (other === this) {
                return 0;
            }
            else {
                return 1;
            }
        }
        equals(other) {
            // Not that we every compare it, but MAX_NODE is only ever equal to itself
            return other === this;
        }
        getPriority() {
            return this;
        }
        getImmediateChild(childName) {
            return ChildrenNode.EMPTY_NODE;
        }
        isEmpty() {
            return false;
        }
    }
    /**
     * Marker that will sort higher than any other snapshot.
     */
    const MAX_NODE = new MaxNode();
    Object.defineProperties(NamedNode, {
        MIN: {
            value: new NamedNode(MIN_NAME, ChildrenNode.EMPTY_NODE)
        },
        MAX: {
            value: new NamedNode(MAX_NAME, MAX_NODE)
        }
    });
    /**
     * Reference Extensions
     */
    KeyIndex.__EMPTY_NODE = ChildrenNode.EMPTY_NODE;
    LeafNode.__childrenNodeConstructor = ChildrenNode;
    setMaxNode$1(MAX_NODE);
    setMaxNode(MAX_NODE);

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
    const USE_HINZE = true;
    /**
     * Constructs a snapshot node representing the passed JSON and returns it.
     * @param json - JSON to create a node for.
     * @param priority - Optional priority to use.  This will be ignored if the
     * passed JSON contains a .priority property.
     */
    function nodeFromJSON(json, priority = null) {
        if (json === null) {
            return ChildrenNode.EMPTY_NODE;
        }
        if (typeof json === 'object' && '.priority' in json) {
            priority = json['.priority'];
        }
        assert(priority === null ||
            typeof priority === 'string' ||
            typeof priority === 'number' ||
            (typeof priority === 'object' && '.sv' in priority), 'Invalid priority type found: ' + typeof priority);
        if (typeof json === 'object' && '.value' in json && json['.value'] !== null) {
            json = json['.value'];
        }
        // Valid leaf nodes include non-objects or server-value wrapper objects
        if (typeof json !== 'object' || '.sv' in json) {
            const jsonLeaf = json;
            return new LeafNode(jsonLeaf, nodeFromJSON(priority));
        }
        if (!(json instanceof Array) && USE_HINZE) {
            const children = [];
            let childrenHavePriority = false;
            const hinzeJsonObj = json;
            each(hinzeJsonObj, (key, child) => {
                if (key.substring(0, 1) !== '.') {
                    // Ignore metadata nodes
                    const childNode = nodeFromJSON(child);
                    if (!childNode.isEmpty()) {
                        childrenHavePriority =
                            childrenHavePriority || !childNode.getPriority().isEmpty();
                        children.push(new NamedNode(key, childNode));
                    }
                }
            });
            if (children.length === 0) {
                return ChildrenNode.EMPTY_NODE;
            }
            const childSet = buildChildSet(children, NAME_ONLY_COMPARATOR, namedNode => namedNode.name, NAME_COMPARATOR);
            if (childrenHavePriority) {
                const sortedChildSet = buildChildSet(children, PRIORITY_INDEX.getCompare());
                return new ChildrenNode(childSet, nodeFromJSON(priority), new IndexMap({ '.priority': sortedChildSet }, { '.priority': PRIORITY_INDEX }));
            }
            else {
                return new ChildrenNode(childSet, nodeFromJSON(priority), IndexMap.Default);
            }
        }
        else {
            let node = ChildrenNode.EMPTY_NODE;
            each(json, (key, childData) => {
                if (contains(json, key)) {
                    if (key.substring(0, 1) !== '.') {
                        // ignore metadata nodes.
                        const childNode = nodeFromJSON(childData);
                        if (childNode.isLeafNode() || !childNode.isEmpty()) {
                            node = node.updateImmediateChild(key, childNode);
                        }
                    }
                }
            });
            return node.updatePriority(nodeFromJSON(priority));
        }
    }
    setNodeFromJSON(nodeFromJSON);

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
    class PathIndex extends Index {
        constructor(indexPath_) {
            super();
            this.indexPath_ = indexPath_;
            assert(!pathIsEmpty(indexPath_) && pathGetFront(indexPath_) !== '.priority', "Can't create PathIndex with empty path or .priority key");
        }
        extractChild(snap) {
            return snap.getChild(this.indexPath_);
        }
        isDefinedOn(node) {
            return !node.getChild(this.indexPath_).isEmpty();
        }
        compare(a, b) {
            const aChild = this.extractChild(a.node);
            const bChild = this.extractChild(b.node);
            const indexCmp = aChild.compareTo(bChild);
            if (indexCmp === 0) {
                return nameCompare(a.name, b.name);
            }
            else {
                return indexCmp;
            }
        }
        makePost(indexValue, name) {
            const valueNode = nodeFromJSON(indexValue);
            const node = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, valueNode);
            return new NamedNode(name, node);
        }
        maxPost() {
            const node = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, MAX_NODE);
            return new NamedNode(MAX_NAME, node);
        }
        toString() {
            return pathSlice(this.indexPath_, 0).join('/');
        }
    }

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
    class ValueIndex extends Index {
        compare(a, b) {
            const indexCmp = a.node.compareTo(b.node);
            if (indexCmp === 0) {
                return nameCompare(a.name, b.name);
            }
            else {
                return indexCmp;
            }
        }
        isDefinedOn(node) {
            return true;
        }
        indexedValueChanged(oldNode, newNode) {
            return !oldNode.equals(newNode);
        }
        minPost() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return NamedNode.MIN;
        }
        maxPost() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return NamedNode.MAX;
        }
        makePost(indexValue, name) {
            const valueNode = nodeFromJSON(indexValue);
            return new NamedNode(name, valueNode);
        }
        /**
         * @returns String representation for inclusion in a query spec
         */
        toString() {
            return '.value';
        }
    }
    const VALUE_INDEX = new ValueIndex();

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
    function changeValue(snapshotNode) {
        return { type: "value" /* VALUE */, snapshotNode };
    }
    function changeChildAdded(childName, snapshotNode) {
        return { type: "child_added" /* CHILD_ADDED */, snapshotNode, childName };
    }
    function changeChildRemoved(childName, snapshotNode) {
        return { type: "child_removed" /* CHILD_REMOVED */, snapshotNode, childName };
    }
    function changeChildChanged(childName, snapshotNode, oldSnap) {
        return {
            type: "child_changed" /* CHILD_CHANGED */,
            snapshotNode,
            childName,
            oldSnap
        };
    }
    function changeChildMoved(childName, snapshotNode) {
        return { type: "child_moved" /* CHILD_MOVED */, snapshotNode, childName };
    }

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
     * Doesn't really filter nodes but applies an index to the node and keeps track of any changes
     */
    class IndexedFilter {
        constructor(index_) {
            this.index_ = index_;
        }
        updateChild(snap, key, newChild, affectedPath, source, optChangeAccumulator) {
            assert(snap.isIndexed(this.index_), 'A node must be indexed if only a child is updated');
            const oldChild = snap.getImmediateChild(key);
            // Check if anything actually changed.
            if (oldChild.getChild(affectedPath).equals(newChild.getChild(affectedPath))) {
                // There's an edge case where a child can enter or leave the view because affectedPath was set to null.
                // In this case, affectedPath will appear null in both the old and new snapshots.  So we need
                // to avoid treating these cases as "nothing changed."
                if (oldChild.isEmpty() === newChild.isEmpty()) {
                    // Nothing changed.
                    // This assert should be valid, but it's expensive (can dominate perf testing) so don't actually do it.
                    //assert(oldChild.equals(newChild), 'Old and new snapshots should be equal.');
                    return snap;
                }
            }
            if (optChangeAccumulator != null) {
                if (newChild.isEmpty()) {
                    if (snap.hasChild(key)) {
                        optChangeAccumulator.trackChildChange(changeChildRemoved(key, oldChild));
                    }
                    else {
                        assert(snap.isLeafNode(), 'A child remove without an old child only makes sense on a leaf node');
                    }
                }
                else if (oldChild.isEmpty()) {
                    optChangeAccumulator.trackChildChange(changeChildAdded(key, newChild));
                }
                else {
                    optChangeAccumulator.trackChildChange(changeChildChanged(key, newChild, oldChild));
                }
            }
            if (snap.isLeafNode() && newChild.isEmpty()) {
                return snap;
            }
            else {
                // Make sure the node is indexed
                return snap.updateImmediateChild(key, newChild).withIndex(this.index_);
            }
        }
        updateFullNode(oldSnap, newSnap, optChangeAccumulator) {
            if (optChangeAccumulator != null) {
                if (!oldSnap.isLeafNode()) {
                    oldSnap.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                        if (!newSnap.hasChild(key)) {
                            optChangeAccumulator.trackChildChange(changeChildRemoved(key, childNode));
                        }
                    });
                }
                if (!newSnap.isLeafNode()) {
                    newSnap.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                        if (oldSnap.hasChild(key)) {
                            const oldChild = oldSnap.getImmediateChild(key);
                            if (!oldChild.equals(childNode)) {
                                optChangeAccumulator.trackChildChange(changeChildChanged(key, childNode, oldChild));
                            }
                        }
                        else {
                            optChangeAccumulator.trackChildChange(changeChildAdded(key, childNode));
                        }
                    });
                }
            }
            return newSnap.withIndex(this.index_);
        }
        updatePriority(oldSnap, newPriority) {
            if (oldSnap.isEmpty()) {
                return ChildrenNode.EMPTY_NODE;
            }
            else {
                return oldSnap.updatePriority(newPriority);
            }
        }
        filtersNodes() {
            return false;
        }
        getIndexedFilter() {
            return this;
        }
        getIndex() {
            return this.index_;
        }
    }

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
     * Filters nodes by range and uses an IndexFilter to track any changes after filtering the node
     */
    class RangedFilter {
        constructor(params) {
            this.indexedFilter_ = new IndexedFilter(params.getIndex());
            this.index_ = params.getIndex();
            this.startPost_ = RangedFilter.getStartPost_(params);
            this.endPost_ = RangedFilter.getEndPost_(params);
        }
        getStartPost() {
            return this.startPost_;
        }
        getEndPost() {
            return this.endPost_;
        }
        matches(node) {
            return (this.index_.compare(this.getStartPost(), node) <= 0 &&
                this.index_.compare(node, this.getEndPost()) <= 0);
        }
        updateChild(snap, key, newChild, affectedPath, source, optChangeAccumulator) {
            if (!this.matches(new NamedNode(key, newChild))) {
                newChild = ChildrenNode.EMPTY_NODE;
            }
            return this.indexedFilter_.updateChild(snap, key, newChild, affectedPath, source, optChangeAccumulator);
        }
        updateFullNode(oldSnap, newSnap, optChangeAccumulator) {
            if (newSnap.isLeafNode()) {
                // Make sure we have a children node with the correct index, not a leaf node;
                newSnap = ChildrenNode.EMPTY_NODE;
            }
            let filtered = newSnap.withIndex(this.index_);
            // Don't support priorities on queries
            filtered = filtered.updatePriority(ChildrenNode.EMPTY_NODE);
            const self = this;
            newSnap.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                if (!self.matches(new NamedNode(key, childNode))) {
                    filtered = filtered.updateImmediateChild(key, ChildrenNode.EMPTY_NODE);
                }
            });
            return this.indexedFilter_.updateFullNode(oldSnap, filtered, optChangeAccumulator);
        }
        updatePriority(oldSnap, newPriority) {
            // Don't support priorities on queries
            return oldSnap;
        }
        filtersNodes() {
            return true;
        }
        getIndexedFilter() {
            return this.indexedFilter_;
        }
        getIndex() {
            return this.index_;
        }
        static getStartPost_(params) {
            if (params.hasStart()) {
                const startName = params.getIndexStartName();
                return params.getIndex().makePost(params.getIndexStartValue(), startName);
            }
            else {
                return params.getIndex().minPost();
            }
        }
        static getEndPost_(params) {
            if (params.hasEnd()) {
                const endName = params.getIndexEndName();
                return params.getIndex().makePost(params.getIndexEndValue(), endName);
            }
            else {
                return params.getIndex().maxPost();
            }
        }
    }

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
     * Applies a limit and a range to a node and uses RangedFilter to do the heavy lifting where possible
     */
    class LimitedFilter {
        constructor(params) {
            this.rangedFilter_ = new RangedFilter(params);
            this.index_ = params.getIndex();
            this.limit_ = params.getLimit();
            this.reverse_ = !params.isViewFromLeft();
        }
        updateChild(snap, key, newChild, affectedPath, source, optChangeAccumulator) {
            if (!this.rangedFilter_.matches(new NamedNode(key, newChild))) {
                newChild = ChildrenNode.EMPTY_NODE;
            }
            if (snap.getImmediateChild(key).equals(newChild)) {
                // No change
                return snap;
            }
            else if (snap.numChildren() < this.limit_) {
                return this.rangedFilter_
                    .getIndexedFilter()
                    .updateChild(snap, key, newChild, affectedPath, source, optChangeAccumulator);
            }
            else {
                return this.fullLimitUpdateChild_(snap, key, newChild, source, optChangeAccumulator);
            }
        }
        updateFullNode(oldSnap, newSnap, optChangeAccumulator) {
            let filtered;
            if (newSnap.isLeafNode() || newSnap.isEmpty()) {
                // Make sure we have a children node with the correct index, not a leaf node;
                filtered = ChildrenNode.EMPTY_NODE.withIndex(this.index_);
            }
            else {
                if (this.limit_ * 2 < newSnap.numChildren() &&
                    newSnap.isIndexed(this.index_)) {
                    // Easier to build up a snapshot, since what we're given has more than twice the elements we want
                    filtered = ChildrenNode.EMPTY_NODE.withIndex(this.index_);
                    // anchor to the startPost, endPost, or last element as appropriate
                    let iterator;
                    if (this.reverse_) {
                        iterator = newSnap.getReverseIteratorFrom(this.rangedFilter_.getEndPost(), this.index_);
                    }
                    else {
                        iterator = newSnap.getIteratorFrom(this.rangedFilter_.getStartPost(), this.index_);
                    }
                    let count = 0;
                    while (iterator.hasNext() && count < this.limit_) {
                        const next = iterator.getNext();
                        let inRange;
                        if (this.reverse_) {
                            inRange =
                                this.index_.compare(this.rangedFilter_.getStartPost(), next) <= 0;
                        }
                        else {
                            inRange =
                                this.index_.compare(next, this.rangedFilter_.getEndPost()) <= 0;
                        }
                        if (inRange) {
                            filtered = filtered.updateImmediateChild(next.name, next.node);
                            count++;
                        }
                        else {
                            // if we have reached the end post, we cannot keep adding elemments
                            break;
                        }
                    }
                }
                else {
                    // The snap contains less than twice the limit. Faster to delete from the snap than build up a new one
                    filtered = newSnap.withIndex(this.index_);
                    // Don't support priorities on queries
                    filtered = filtered.updatePriority(ChildrenNode.EMPTY_NODE);
                    let startPost;
                    let endPost;
                    let cmp;
                    let iterator;
                    if (this.reverse_) {
                        iterator = filtered.getReverseIterator(this.index_);
                        startPost = this.rangedFilter_.getEndPost();
                        endPost = this.rangedFilter_.getStartPost();
                        const indexCompare = this.index_.getCompare();
                        cmp = (a, b) => indexCompare(b, a);
                    }
                    else {
                        iterator = filtered.getIterator(this.index_);
                        startPost = this.rangedFilter_.getStartPost();
                        endPost = this.rangedFilter_.getEndPost();
                        cmp = this.index_.getCompare();
                    }
                    let count = 0;
                    let foundStartPost = false;
                    while (iterator.hasNext()) {
                        const next = iterator.getNext();
                        if (!foundStartPost && cmp(startPost, next) <= 0) {
                            // start adding
                            foundStartPost = true;
                        }
                        const inRange = foundStartPost && count < this.limit_ && cmp(next, endPost) <= 0;
                        if (inRange) {
                            count++;
                        }
                        else {
                            filtered = filtered.updateImmediateChild(next.name, ChildrenNode.EMPTY_NODE);
                        }
                    }
                }
            }
            return this.rangedFilter_
                .getIndexedFilter()
                .updateFullNode(oldSnap, filtered, optChangeAccumulator);
        }
        updatePriority(oldSnap, newPriority) {
            // Don't support priorities on queries
            return oldSnap;
        }
        filtersNodes() {
            return true;
        }
        getIndexedFilter() {
            return this.rangedFilter_.getIndexedFilter();
        }
        getIndex() {
            return this.index_;
        }
        fullLimitUpdateChild_(snap, childKey, childSnap, source, changeAccumulator) {
            // TODO: rename all cache stuff etc to general snap terminology
            let cmp;
            if (this.reverse_) {
                const indexCmp = this.index_.getCompare();
                cmp = (a, b) => indexCmp(b, a);
            }
            else {
                cmp = this.index_.getCompare();
            }
            const oldEventCache = snap;
            assert(oldEventCache.numChildren() === this.limit_, '');
            const newChildNamedNode = new NamedNode(childKey, childSnap);
            const windowBoundary = this.reverse_
                ? oldEventCache.getFirstChild(this.index_)
                : oldEventCache.getLastChild(this.index_);
            const inRange = this.rangedFilter_.matches(newChildNamedNode);
            if (oldEventCache.hasChild(childKey)) {
                const oldChildSnap = oldEventCache.getImmediateChild(childKey);
                let nextChild = source.getChildAfterChild(this.index_, windowBoundary, this.reverse_);
                while (nextChild != null &&
                    (nextChild.name === childKey || oldEventCache.hasChild(nextChild.name))) {
                    // There is a weird edge case where a node is updated as part of a merge in the write tree, but hasn't
                    // been applied to the limited filter yet. Ignore this next child which will be updated later in
                    // the limited filter...
                    nextChild = source.getChildAfterChild(this.index_, nextChild, this.reverse_);
                }
                const compareNext = nextChild == null ? 1 : cmp(nextChild, newChildNamedNode);
                const remainsInWindow = inRange && !childSnap.isEmpty() && compareNext >= 0;
                if (remainsInWindow) {
                    if (changeAccumulator != null) {
                        changeAccumulator.trackChildChange(changeChildChanged(childKey, childSnap, oldChildSnap));
                    }
                    return oldEventCache.updateImmediateChild(childKey, childSnap);
                }
                else {
                    if (changeAccumulator != null) {
                        changeAccumulator.trackChildChange(changeChildRemoved(childKey, oldChildSnap));
                    }
                    const newEventCache = oldEventCache.updateImmediateChild(childKey, ChildrenNode.EMPTY_NODE);
                    const nextChildInRange = nextChild != null && this.rangedFilter_.matches(nextChild);
                    if (nextChildInRange) {
                        if (changeAccumulator != null) {
                            changeAccumulator.trackChildChange(changeChildAdded(nextChild.name, nextChild.node));
                        }
                        return newEventCache.updateImmediateChild(nextChild.name, nextChild.node);
                    }
                    else {
                        return newEventCache;
                    }
                }
            }
            else if (childSnap.isEmpty()) {
                // we're deleting a node, but it was not in the window, so ignore it
                return snap;
            }
            else if (inRange) {
                if (cmp(windowBoundary, newChildNamedNode) >= 0) {
                    if (changeAccumulator != null) {
                        changeAccumulator.trackChildChange(changeChildRemoved(windowBoundary.name, windowBoundary.node));
                        changeAccumulator.trackChildChange(changeChildAdded(childKey, childSnap));
                    }
                    return oldEventCache
                        .updateImmediateChild(childKey, childSnap)
                        .updateImmediateChild(windowBoundary.name, ChildrenNode.EMPTY_NODE);
                }
                else {
                    return snap;
                }
            }
            else {
                return snap;
            }
        }
    }

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
     * This class is an immutable-from-the-public-api struct containing a set of query parameters defining a
     * range to be returned for a particular location. It is assumed that validation of parameters is done at the
     * user-facing API level, so it is not done here.
     *
     * @internal
     */
    class QueryParams {
        constructor() {
            this.limitSet_ = false;
            this.startSet_ = false;
            this.startNameSet_ = false;
            this.startAfterSet_ = false;
            this.endSet_ = false;
            this.endNameSet_ = false;
            this.endBeforeSet_ = false;
            this.limit_ = 0;
            this.viewFrom_ = '';
            this.indexStartValue_ = null;
            this.indexStartName_ = '';
            this.indexEndValue_ = null;
            this.indexEndName_ = '';
            this.index_ = PRIORITY_INDEX;
        }
        hasStart() {
            return this.startSet_;
        }
        hasStartAfter() {
            return this.startAfterSet_;
        }
        hasEndBefore() {
            return this.endBeforeSet_;
        }
        /**
         * @returns True if it would return from left.
         */
        isViewFromLeft() {
            if (this.viewFrom_ === '') {
                // limit(), rather than limitToFirst or limitToLast was called.
                // This means that only one of startSet_ and endSet_ is true. Use them
                // to calculate which side of the view to anchor to. If neither is set,
                // anchor to the end.
                return this.startSet_;
            }
            else {
                return this.viewFrom_ === "l" /* VIEW_FROM_LEFT */;
            }
        }
        /**
         * Only valid to call if hasStart() returns true
         */
        getIndexStartValue() {
            assert(this.startSet_, 'Only valid if start has been set');
            return this.indexStartValue_;
        }
        /**
         * Only valid to call if hasStart() returns true.
         * Returns the starting key name for the range defined by these query parameters
         */
        getIndexStartName() {
            assert(this.startSet_, 'Only valid if start has been set');
            if (this.startNameSet_) {
                return this.indexStartName_;
            }
            else {
                return MIN_NAME;
            }
        }
        hasEnd() {
            return this.endSet_;
        }
        /**
         * Only valid to call if hasEnd() returns true.
         */
        getIndexEndValue() {
            assert(this.endSet_, 'Only valid if end has been set');
            return this.indexEndValue_;
        }
        /**
         * Only valid to call if hasEnd() returns true.
         * Returns the end key name for the range defined by these query parameters
         */
        getIndexEndName() {
            assert(this.endSet_, 'Only valid if end has been set');
            if (this.endNameSet_) {
                return this.indexEndName_;
            }
            else {
                return MAX_NAME;
            }
        }
        hasLimit() {
            return this.limitSet_;
        }
        /**
         * @returns True if a limit has been set and it has been explicitly anchored
         */
        hasAnchoredLimit() {
            return this.limitSet_ && this.viewFrom_ !== '';
        }
        /**
         * Only valid to call if hasLimit() returns true
         */
        getLimit() {
            assert(this.limitSet_, 'Only valid if limit has been set');
            return this.limit_;
        }
        getIndex() {
            return this.index_;
        }
        loadsAllData() {
            return !(this.startSet_ || this.endSet_ || this.limitSet_);
        }
        isDefault() {
            return this.loadsAllData() && this.index_ === PRIORITY_INDEX;
        }
        copy() {
            const copy = new QueryParams();
            copy.limitSet_ = this.limitSet_;
            copy.limit_ = this.limit_;
            copy.startSet_ = this.startSet_;
            copy.indexStartValue_ = this.indexStartValue_;
            copy.startNameSet_ = this.startNameSet_;
            copy.indexStartName_ = this.indexStartName_;
            copy.endSet_ = this.endSet_;
            copy.indexEndValue_ = this.indexEndValue_;
            copy.endNameSet_ = this.endNameSet_;
            copy.indexEndName_ = this.indexEndName_;
            copy.index_ = this.index_;
            copy.viewFrom_ = this.viewFrom_;
            return copy;
        }
    }
    function queryParamsGetNodeFilter(queryParams) {
        if (queryParams.loadsAllData()) {
            return new IndexedFilter(queryParams.getIndex());
        }
        else if (queryParams.hasLimit()) {
            return new LimitedFilter(queryParams);
        }
        else {
            return new RangedFilter(queryParams);
        }
    }
    /**
     * Returns a set of REST query string parameters representing this query.
     *
     * @returns query string parameters
     */
    function queryParamsToRestQueryStringParameters(queryParams) {
        const qs = {};
        if (queryParams.isDefault()) {
            return qs;
        }
        let orderBy;
        if (queryParams.index_ === PRIORITY_INDEX) {
            orderBy = "$priority" /* PRIORITY_INDEX */;
        }
        else if (queryParams.index_ === VALUE_INDEX) {
            orderBy = "$value" /* VALUE_INDEX */;
        }
        else if (queryParams.index_ === KEY_INDEX) {
            orderBy = "$key" /* KEY_INDEX */;
        }
        else {
            assert(queryParams.index_ instanceof PathIndex, 'Unrecognized index type!');
            orderBy = queryParams.index_.toString();
        }
        qs["orderBy" /* ORDER_BY */] = stringify(orderBy);
        if (queryParams.startSet_) {
            qs["startAt" /* START_AT */] = stringify(queryParams.indexStartValue_);
            if (queryParams.startNameSet_) {
                qs["startAt" /* START_AT */] +=
                    ',' + stringify(queryParams.indexStartName_);
            }
        }
        if (queryParams.endSet_) {
            qs["endAt" /* END_AT */] = stringify(queryParams.indexEndValue_);
            if (queryParams.endNameSet_) {
                qs["endAt" /* END_AT */] +=
                    ',' + stringify(queryParams.indexEndName_);
            }
        }
        if (queryParams.limitSet_) {
            if (queryParams.isViewFromLeft()) {
                qs["limitToFirst" /* LIMIT_TO_FIRST */] = queryParams.limit_;
            }
            else {
                qs["limitToLast" /* LIMIT_TO_LAST */] = queryParams.limit_;
            }
        }
        return qs;
    }
    function queryParamsGetQueryObject(queryParams) {
        const obj = {};
        if (queryParams.startSet_) {
            obj["sp" /* INDEX_START_VALUE */] =
                queryParams.indexStartValue_;
            if (queryParams.startNameSet_) {
                obj["sn" /* INDEX_START_NAME */] =
                    queryParams.indexStartName_;
            }
        }
        if (queryParams.endSet_) {
            obj["ep" /* INDEX_END_VALUE */] = queryParams.indexEndValue_;
            if (queryParams.endNameSet_) {
                obj["en" /* INDEX_END_NAME */] = queryParams.indexEndName_;
            }
        }
        if (queryParams.limitSet_) {
            obj["l" /* LIMIT */] = queryParams.limit_;
            let viewFrom = queryParams.viewFrom_;
            if (viewFrom === '') {
                if (queryParams.isViewFromLeft()) {
                    viewFrom = "l" /* VIEW_FROM_LEFT */;
                }
                else {
                    viewFrom = "r" /* VIEW_FROM_RIGHT */;
                }
            }
            obj["vf" /* VIEW_FROM */] = viewFrom;
        }
        // For now, priority index is the default, so we only specify if it's some other index
        if (queryParams.index_ !== PRIORITY_INDEX) {
            obj["i" /* INDEX */] = queryParams.index_.toString();
        }
        return obj;
    }

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
     * An implementation of ServerActions that communicates with the server via REST requests.
     * This is mostly useful for compatibility with crawlers, where we don't want to spin up a full
     * persistent connection (using WebSockets or long-polling)
     */
    class ReadonlyRestClient extends ServerActions {
        /**
         * @param repoInfo_ - Data about the namespace we are connecting to
         * @param onDataUpdate_ - A callback for new data from the server
         */
        constructor(repoInfo_, onDataUpdate_, authTokenProvider_, appCheckTokenProvider_) {
            super();
            this.repoInfo_ = repoInfo_;
            this.onDataUpdate_ = onDataUpdate_;
            this.authTokenProvider_ = authTokenProvider_;
            this.appCheckTokenProvider_ = appCheckTokenProvider_;
            /** @private {function(...[*])} */
            this.log_ = logWrapper('p:rest:');
            /**
             * We don't actually need to track listens, except to prevent us calling an onComplete for a listen
             * that's been removed. :-/
             */
            this.listens_ = {};
        }
        reportStats(stats) {
            throw new Error('Method not implemented.');
        }
        static getListenId_(query, tag) {
            if (tag !== undefined) {
                return 'tag$' + tag;
            }
            else {
                assert(query._queryParams.isDefault(), "should have a tag if it's not a default query.");
                return query._path.toString();
            }
        }
        /** @inheritDoc */
        listen(query, currentHashFn, tag, onComplete) {
            const pathString = query._path.toString();
            this.log_('Listen called for ' + pathString + ' ' + query._queryIdentifier);
            // Mark this listener so we can tell if it's removed.
            const listenId = ReadonlyRestClient.getListenId_(query, tag);
            const thisListen = {};
            this.listens_[listenId] = thisListen;
            const queryStringParameters = queryParamsToRestQueryStringParameters(query._queryParams);
            this.restRequest_(pathString + '.json', queryStringParameters, (error, result) => {
                let data = result;
                if (error === 404) {
                    data = null;
                    error = null;
                }
                if (error === null) {
                    this.onDataUpdate_(pathString, data, /*isMerge=*/ false, tag);
                }
                if (safeGet(this.listens_, listenId) === thisListen) {
                    let status;
                    if (!error) {
                        status = 'ok';
                    }
                    else if (error === 401) {
                        status = 'permission_denied';
                    }
                    else {
                        status = 'rest_error:' + error;
                    }
                    onComplete(status, null);
                }
            });
        }
        /** @inheritDoc */
        unlisten(query, tag) {
            const listenId = ReadonlyRestClient.getListenId_(query, tag);
            delete this.listens_[listenId];
        }
        get(query) {
            const queryStringParameters = queryParamsToRestQueryStringParameters(query._queryParams);
            const pathString = query._path.toString();
            const deferred = new Deferred();
            this.restRequest_(pathString + '.json', queryStringParameters, (error, result) => {
                let data = result;
                if (error === 404) {
                    data = null;
                    error = null;
                }
                if (error === null) {
                    this.onDataUpdate_(pathString, data, 
                    /*isMerge=*/ false, 
                    /*tag=*/ null);
                    deferred.resolve(data);
                }
                else {
                    deferred.reject(new Error(data));
                }
            });
            return deferred.promise;
        }
        /** @inheritDoc */
        refreshAuthToken(token) {
            // no-op since we just always call getToken.
        }
        /**
         * Performs a REST request to the given path, with the provided query string parameters,
         * and any auth credentials we have.
         */
        restRequest_(pathString, queryStringParameters = {}, callback) {
            queryStringParameters['format'] = 'export';
            return Promise.all([
                this.authTokenProvider_.getToken(/*forceRefresh=*/ false),
                this.appCheckTokenProvider_.getToken(/*forceRefresh=*/ false)
            ]).then(([authToken, appCheckToken]) => {
                if (authToken && authToken.accessToken) {
                    queryStringParameters['auth'] = authToken.accessToken;
                }
                if (appCheckToken && appCheckToken.token) {
                    queryStringParameters['ac'] = appCheckToken.token;
                }
                const url = (this.repoInfo_.secure ? 'https://' : 'http://') +
                    this.repoInfo_.host +
                    pathString +
                    '?' +
                    'ns=' +
                    this.repoInfo_.namespace +
                    querystring(queryStringParameters);
                this.log_('Sending REST request for ' + url);
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (callback && xhr.readyState === 4) {
                        this.log_('REST Response for ' + url + ' received. status:', xhr.status, 'response:', xhr.responseText);
                        let res = null;
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                res = jsonEval(xhr.responseText);
                            }
                            catch (e) {
                                warn('Failed to parse JSON response for ' +
                                    url +
                                    ': ' +
                                    xhr.responseText);
                            }
                            callback(null, res);
                        }
                        else {
                            // 401 and 404 are expected.
                            if (xhr.status !== 401 && xhr.status !== 404) {
                                warn('Got unsuccessful REST response for ' +
                                    url +
                                    ' Status: ' +
                                    xhr.status);
                            }
                            callback(xhr.status);
                        }
                        callback = null;
                    }
                };
                xhr.open('GET', url, /*asynchronous=*/ true);
                xhr.send();
            });
        }
    }

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
     * Mutable object which basically just stores a reference to the "latest" immutable snapshot.
     */
    class SnapshotHolder {
        constructor() {
            this.rootNode_ = ChildrenNode.EMPTY_NODE;
        }
        getNode(path) {
            return this.rootNode_.getChild(path);
        }
        updateSnapshot(path, newSnapshotNode) {
            this.rootNode_ = this.rootNode_.updateChild(path, newSnapshotNode);
        }
    }

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
    function newSparseSnapshotTree() {
        return {
            value: null,
            children: new Map()
        };
    }
    /**
     * Stores the given node at the specified path. If there is already a node
     * at a shallower path, it merges the new data into that snapshot node.
     *
     * @param path - Path to look up snapshot for.
     * @param data - The new data, or null.
     */
    function sparseSnapshotTreeRemember(sparseSnapshotTree, path, data) {
        if (pathIsEmpty(path)) {
            sparseSnapshotTree.value = data;
            sparseSnapshotTree.children.clear();
        }
        else if (sparseSnapshotTree.value !== null) {
            sparseSnapshotTree.value = sparseSnapshotTree.value.updateChild(path, data);
        }
        else {
            const childKey = pathGetFront(path);
            if (!sparseSnapshotTree.children.has(childKey)) {
                sparseSnapshotTree.children.set(childKey, newSparseSnapshotTree());
            }
            const child = sparseSnapshotTree.children.get(childKey);
            path = pathPopFront(path);
            sparseSnapshotTreeRemember(child, path, data);
        }
    }
    /**
     * Recursively iterates through all of the stored tree and calls the
     * callback on each one.
     *
     * @param prefixPath - Path to look up node for.
     * @param func - The function to invoke for each tree.
     */
    function sparseSnapshotTreeForEachTree(sparseSnapshotTree, prefixPath, func) {
        if (sparseSnapshotTree.value !== null) {
            func(prefixPath, sparseSnapshotTree.value);
        }
        else {
            sparseSnapshotTreeForEachChild(sparseSnapshotTree, (key, tree) => {
                const path = new Path(prefixPath.toString() + '/' + key);
                sparseSnapshotTreeForEachTree(tree, path, func);
            });
        }
    }
    /**
     * Iterates through each immediate child and triggers the callback.
     * Only seems to be used in tests.
     *
     * @param func - The function to invoke for each child.
     */
    function sparseSnapshotTreeForEachChild(sparseSnapshotTree, func) {
        sparseSnapshotTree.children.forEach((tree, key) => {
            func(key, tree);
        });
    }

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
     * Returns the delta from the previous call to get stats.
     *
     * @param collection_ - The collection to "listen" to.
     */
    class StatsListener {
        constructor(collection_) {
            this.collection_ = collection_;
            this.last_ = null;
        }
        get() {
            const newStats = this.collection_.get();
            const delta = Object.assign({}, newStats);
            if (this.last_) {
                each(this.last_, (stat, value) => {
                    delta[stat] = delta[stat] - value;
                });
            }
            this.last_ = newStats;
            return delta;
        }
    }

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
    // Assuming some apps may have a short amount of time on page, and a bulk of firebase operations probably
    // happen on page load, we try to report our first set of stats pretty quickly, but we wait at least 10
    // seconds to try to ensure the Firebase connection is established / settled.
    const FIRST_STATS_MIN_TIME = 10 * 1000;
    const FIRST_STATS_MAX_TIME = 30 * 1000;
    // We'll continue to report stats on average every 5 minutes.
    const REPORT_STATS_INTERVAL = 5 * 60 * 1000;
    class StatsReporter {
        constructor(collection, server_) {
            this.server_ = server_;
            this.statsToReport_ = {};
            this.statsListener_ = new StatsListener(collection);
            const timeout = FIRST_STATS_MIN_TIME +
                (FIRST_STATS_MAX_TIME - FIRST_STATS_MIN_TIME) * Math.random();
            setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(timeout));
        }
        reportStats_() {
            const stats = this.statsListener_.get();
            const reportedStats = {};
            let haveStatsToReport = false;
            each(stats, (stat, value) => {
                if (value > 0 && contains(this.statsToReport_, stat)) {
                    reportedStats[stat] = value;
                    haveStatsToReport = true;
                }
            });
            if (haveStatsToReport) {
                this.server_.reportStats(reportedStats);
            }
            // queue our next run.
            setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(Math.random() * 2 * REPORT_STATS_INTERVAL));
        }
    }

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
     *
     * @enum
     */
    var OperationType;
    (function (OperationType) {
        OperationType[OperationType["OVERWRITE"] = 0] = "OVERWRITE";
        OperationType[OperationType["MERGE"] = 1] = "MERGE";
        OperationType[OperationType["ACK_USER_WRITE"] = 2] = "ACK_USER_WRITE";
        OperationType[OperationType["LISTEN_COMPLETE"] = 3] = "LISTEN_COMPLETE";
    })(OperationType || (OperationType = {}));
    function newOperationSourceUser() {
        return {
            fromUser: true,
            fromServer: false,
            queryId: null,
            tagged: false
        };
    }
    function newOperationSourceServer() {
        return {
            fromUser: false,
            fromServer: true,
            queryId: null,
            tagged: false
        };
    }
    function newOperationSourceServerTaggedQuery(queryId) {
        return {
            fromUser: false,
            fromServer: true,
            queryId,
            tagged: true
        };
    }

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
    class AckUserWrite {
        /**
         * @param affectedTree - A tree containing true for each affected path. Affected paths can't overlap.
         */
        constructor(
        /** @inheritDoc */ path, 
        /** @inheritDoc */ affectedTree, 
        /** @inheritDoc */ revert) {
            this.path = path;
            this.affectedTree = affectedTree;
            this.revert = revert;
            /** @inheritDoc */
            this.type = OperationType.ACK_USER_WRITE;
            /** @inheritDoc */
            this.source = newOperationSourceUser();
        }
        operationForChild(childName) {
            if (!pathIsEmpty(this.path)) {
                assert(pathGetFront(this.path) === childName, 'operationForChild called for unrelated child.');
                return new AckUserWrite(pathPopFront(this.path), this.affectedTree, this.revert);
            }
            else if (this.affectedTree.value != null) {
                assert(this.affectedTree.children.isEmpty(), 'affectedTree should not have overlapping affected paths.');
                // All child locations are affected as well; just return same operation.
                return this;
            }
            else {
                const childTree = this.affectedTree.subtree(new Path(childName));
                return new AckUserWrite(newEmptyPath(), childTree, this.revert);
            }
        }
    }

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
    class ListenComplete {
        constructor(source, path) {
            this.source = source;
            this.path = path;
            /** @inheritDoc */
            this.type = OperationType.LISTEN_COMPLETE;
        }
        operationForChild(childName) {
            if (pathIsEmpty(this.path)) {
                return new ListenComplete(this.source, newEmptyPath());
            }
            else {
                return new ListenComplete(this.source, pathPopFront(this.path));
            }
        }
    }

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
    class Overwrite {
        constructor(source, path, snap) {
            this.source = source;
            this.path = path;
            this.snap = snap;
            /** @inheritDoc */
            this.type = OperationType.OVERWRITE;
        }
        operationForChild(childName) {
            if (pathIsEmpty(this.path)) {
                return new Overwrite(this.source, newEmptyPath(), this.snap.getImmediateChild(childName));
            }
            else {
                return new Overwrite(this.source, pathPopFront(this.path), this.snap);
            }
        }
    }

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
    class Merge {
        constructor(
        /** @inheritDoc */ source, 
        /** @inheritDoc */ path, 
        /** @inheritDoc */ children) {
            this.source = source;
            this.path = path;
            this.children = children;
            /** @inheritDoc */
            this.type = OperationType.MERGE;
        }
        operationForChild(childName) {
            if (pathIsEmpty(this.path)) {
                const childTree = this.children.subtree(new Path(childName));
                if (childTree.isEmpty()) {
                    // This child is unaffected
                    return null;
                }
                else if (childTree.value) {
                    // We have a snapshot for the child in question.  This becomes an overwrite of the child.
                    return new Overwrite(this.source, newEmptyPath(), childTree.value);
                }
                else {
                    // This is a merge at a deeper level
                    return new Merge(this.source, newEmptyPath(), childTree);
                }
            }
            else {
                assert(pathGetFront(this.path) === childName, "Can't get a merge for a child not on the path of the operation");
                return new Merge(this.source, pathPopFront(this.path), this.children);
            }
        }
        toString() {
            return ('Operation(' +
                this.path +
                ': ' +
                this.source.toString() +
                ' merge: ' +
                this.children.toString() +
                ')');
        }
    }

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
     * A cache node only stores complete children. Additionally it holds a flag whether the node can be considered fully
     * initialized in the sense that we know at one point in time this represented a valid state of the world, e.g.
     * initialized with data from the server, or a complete overwrite by the client. The filtered flag also tracks
     * whether a node potentially had children removed due to a filter.
     */
    class CacheNode {
        constructor(node_, fullyInitialized_, filtered_) {
            this.node_ = node_;
            this.fullyInitialized_ = fullyInitialized_;
            this.filtered_ = filtered_;
        }
        /**
         * Returns whether this node was fully initialized with either server data or a complete overwrite by the client
         */
        isFullyInitialized() {
            return this.fullyInitialized_;
        }
        /**
         * Returns whether this node is potentially missing children due to a filter applied to the node
         */
        isFiltered() {
            return this.filtered_;
        }
        isCompleteForPath(path) {
            if (pathIsEmpty(path)) {
                return this.isFullyInitialized() && !this.filtered_;
            }
            const childKey = pathGetFront(path);
            return this.isCompleteForChild(childKey);
        }
        isCompleteForChild(key) {
            return ((this.isFullyInitialized() && !this.filtered_) || this.node_.hasChild(key));
        }
        getNode() {
            return this.node_;
        }
    }

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
     * An EventGenerator is used to convert "raw" changes (Change) as computed by the
     * CacheDiffer into actual events (Event) that can be raised.  See generateEventsForChanges()
     * for details.
     *
     */
    class EventGenerator {
        constructor(query_) {
            this.query_ = query_;
            this.index_ = this.query_._queryParams.getIndex();
        }
    }
    /**
     * Given a set of raw changes (no moved events and prevName not specified yet), and a set of
     * EventRegistrations that should be notified of these changes, generate the actual events to be raised.
     *
     * Notes:
     *  - child_moved events will be synthesized at this time for any child_changed events that affect
     *    our index.
     *  - prevName will be calculated based on the index ordering.
     */
    function eventGeneratorGenerateEventsForChanges(eventGenerator, changes, eventCache, eventRegistrations) {
        const events = [];
        const moves = [];
        changes.forEach(change => {
            if (change.type === "child_changed" /* CHILD_CHANGED */ &&
                eventGenerator.index_.indexedValueChanged(change.oldSnap, change.snapshotNode)) {
                moves.push(changeChildMoved(change.childName, change.snapshotNode));
            }
        });
        eventGeneratorGenerateEventsForType(eventGenerator, events, "child_removed" /* CHILD_REMOVED */, changes, eventRegistrations, eventCache);
        eventGeneratorGenerateEventsForType(eventGenerator, events, "child_added" /* CHILD_ADDED */, changes, eventRegistrations, eventCache);
        eventGeneratorGenerateEventsForType(eventGenerator, events, "child_moved" /* CHILD_MOVED */, moves, eventRegistrations, eventCache);
        eventGeneratorGenerateEventsForType(eventGenerator, events, "child_changed" /* CHILD_CHANGED */, changes, eventRegistrations, eventCache);
        eventGeneratorGenerateEventsForType(eventGenerator, events, "value" /* VALUE */, changes, eventRegistrations, eventCache);
        return events;
    }
    /**
     * Given changes of a single change type, generate the corresponding events.
     */
    function eventGeneratorGenerateEventsForType(eventGenerator, events, eventType, changes, registrations, eventCache) {
        const filteredChanges = changes.filter(change => change.type === eventType);
        filteredChanges.sort((a, b) => eventGeneratorCompareChanges(eventGenerator, a, b));
        filteredChanges.forEach(change => {
            const materializedChange = eventGeneratorMaterializeSingleChange(eventGenerator, change, eventCache);
            registrations.forEach(registration => {
                if (registration.respondsTo(change.type)) {
                    events.push(registration.createEvent(materializedChange, eventGenerator.query_));
                }
            });
        });
    }
    function eventGeneratorMaterializeSingleChange(eventGenerator, change, eventCache) {
        if (change.type === 'value' || change.type === 'child_removed') {
            return change;
        }
        else {
            change.prevName = eventCache.getPredecessorChildName(change.childName, change.snapshotNode, eventGenerator.index_);
            return change;
        }
    }
    function eventGeneratorCompareChanges(eventGenerator, a, b) {
        if (a.childName == null || b.childName == null) {
            throw assertionError('Should only compare child_ events.');
        }
        const aWrapped = new NamedNode(a.childName, a.snapshotNode);
        const bWrapped = new NamedNode(b.childName, b.snapshotNode);
        return eventGenerator.index_.compare(aWrapped, bWrapped);
    }

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
    function newViewCache(eventCache, serverCache) {
        return { eventCache, serverCache };
    }
    function viewCacheUpdateEventSnap(viewCache, eventSnap, complete, filtered) {
        return newViewCache(new CacheNode(eventSnap, complete, filtered), viewCache.serverCache);
    }
    function viewCacheUpdateServerSnap(viewCache, serverSnap, complete, filtered) {
        return newViewCache(viewCache.eventCache, new CacheNode(serverSnap, complete, filtered));
    }
    function viewCacheGetCompleteEventSnap(viewCache) {
        return viewCache.eventCache.isFullyInitialized()
            ? viewCache.eventCache.getNode()
            : null;
    }
    function viewCacheGetCompleteServerSnap(viewCache) {
        return viewCache.serverCache.isFullyInitialized()
            ? viewCache.serverCache.getNode()
            : null;
    }

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
    let emptyChildrenSingleton;
    /**
     * Singleton empty children collection.
     *
     */
    const EmptyChildren = () => {
        if (!emptyChildrenSingleton) {
            emptyChildrenSingleton = new SortedMap(stringCompare);
        }
        return emptyChildrenSingleton;
    };
    /**
     * A tree with immutable elements.
     */
    class ImmutableTree {
        constructor(value, children = EmptyChildren()) {
            this.value = value;
            this.children = children;
        }
        static fromObject(obj) {
            let tree = new ImmutableTree(null);
            each(obj, (childPath, childSnap) => {
                tree = tree.set(new Path(childPath), childSnap);
            });
            return tree;
        }
        /**
         * True if the value is empty and there are no children
         */
        isEmpty() {
            return this.value === null && this.children.isEmpty();
        }
        /**
         * Given a path and predicate, return the first node and the path to that node
         * where the predicate returns true.
         *
         * TODO Do a perf test -- If we're creating a bunch of `{path: value:}`
         * objects on the way back out, it may be better to pass down a pathSoFar obj.
         *
         * @param relativePath - The remainder of the path
         * @param predicate - The predicate to satisfy to return a node
         */
        findRootMostMatchingPathAndValue(relativePath, predicate) {
            if (this.value != null && predicate(this.value)) {
                return { path: newEmptyPath(), value: this.value };
            }
            else {
                if (pathIsEmpty(relativePath)) {
                    return null;
                }
                else {
                    const front = pathGetFront(relativePath);
                    const child = this.children.get(front);
                    if (child !== null) {
                        const childExistingPathAndValue = child.findRootMostMatchingPathAndValue(pathPopFront(relativePath), predicate);
                        if (childExistingPathAndValue != null) {
                            const fullPath = pathChild(new Path(front), childExistingPathAndValue.path);
                            return { path: fullPath, value: childExistingPathAndValue.value };
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        /**
         * Find, if it exists, the shortest subpath of the given path that points a defined
         * value in the tree
         */
        findRootMostValueAndPath(relativePath) {
            return this.findRootMostMatchingPathAndValue(relativePath, () => true);
        }
        /**
         * @returns The subtree at the given path
         */
        subtree(relativePath) {
            if (pathIsEmpty(relativePath)) {
                return this;
            }
            else {
                const front = pathGetFront(relativePath);
                const childTree = this.children.get(front);
                if (childTree !== null) {
                    return childTree.subtree(pathPopFront(relativePath));
                }
                else {
                    return new ImmutableTree(null);
                }
            }
        }
        /**
         * Sets a value at the specified path.
         *
         * @param relativePath - Path to set value at.
         * @param toSet - Value to set.
         * @returns Resulting tree.
         */
        set(relativePath, toSet) {
            if (pathIsEmpty(relativePath)) {
                return new ImmutableTree(toSet, this.children);
            }
            else {
                const front = pathGetFront(relativePath);
                const child = this.children.get(front) || new ImmutableTree(null);
                const newChild = child.set(pathPopFront(relativePath), toSet);
                const newChildren = this.children.insert(front, newChild);
                return new ImmutableTree(this.value, newChildren);
            }
        }
        /**
         * Removes the value at the specified path.
         *
         * @param relativePath - Path to value to remove.
         * @returns Resulting tree.
         */
        remove(relativePath) {
            if (pathIsEmpty(relativePath)) {
                if (this.children.isEmpty()) {
                    return new ImmutableTree(null);
                }
                else {
                    return new ImmutableTree(null, this.children);
                }
            }
            else {
                const front = pathGetFront(relativePath);
                const child = this.children.get(front);
                if (child) {
                    const newChild = child.remove(pathPopFront(relativePath));
                    let newChildren;
                    if (newChild.isEmpty()) {
                        newChildren = this.children.remove(front);
                    }
                    else {
                        newChildren = this.children.insert(front, newChild);
                    }
                    if (this.value === null && newChildren.isEmpty()) {
                        return new ImmutableTree(null);
                    }
                    else {
                        return new ImmutableTree(this.value, newChildren);
                    }
                }
                else {
                    return this;
                }
            }
        }
        /**
         * Gets a value from the tree.
         *
         * @param relativePath - Path to get value for.
         * @returns Value at path, or null.
         */
        get(relativePath) {
            if (pathIsEmpty(relativePath)) {
                return this.value;
            }
            else {
                const front = pathGetFront(relativePath);
                const child = this.children.get(front);
                if (child) {
                    return child.get(pathPopFront(relativePath));
                }
                else {
                    return null;
                }
            }
        }
        /**
         * Replace the subtree at the specified path with the given new tree.
         *
         * @param relativePath - Path to replace subtree for.
         * @param newTree - New tree.
         * @returns Resulting tree.
         */
        setTree(relativePath, newTree) {
            if (pathIsEmpty(relativePath)) {
                return newTree;
            }
            else {
                const front = pathGetFront(relativePath);
                const child = this.children.get(front) || new ImmutableTree(null);
                const newChild = child.setTree(pathPopFront(relativePath), newTree);
                let newChildren;
                if (newChild.isEmpty()) {
                    newChildren = this.children.remove(front);
                }
                else {
                    newChildren = this.children.insert(front, newChild);
                }
                return new ImmutableTree(this.value, newChildren);
            }
        }
        /**
         * Performs a depth first fold on this tree. Transforms a tree into a single
         * value, given a function that operates on the path to a node, an optional
         * current value, and a map of child names to folded subtrees
         */
        fold(fn) {
            return this.fold_(newEmptyPath(), fn);
        }
        /**
         * Recursive helper for public-facing fold() method
         */
        fold_(pathSoFar, fn) {
            const accum = {};
            this.children.inorderTraversal((childKey, childTree) => {
                accum[childKey] = childTree.fold_(pathChild(pathSoFar, childKey), fn);
            });
            return fn(pathSoFar, this.value, accum);
        }
        /**
         * Find the first matching value on the given path. Return the result of applying f to it.
         */
        findOnPath(path, f) {
            return this.findOnPath_(path, newEmptyPath(), f);
        }
        findOnPath_(pathToFollow, pathSoFar, f) {
            const result = this.value ? f(pathSoFar, this.value) : false;
            if (result) {
                return result;
            }
            else {
                if (pathIsEmpty(pathToFollow)) {
                    return null;
                }
                else {
                    const front = pathGetFront(pathToFollow);
                    const nextChild = this.children.get(front);
                    if (nextChild) {
                        return nextChild.findOnPath_(pathPopFront(pathToFollow), pathChild(pathSoFar, front), f);
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        foreachOnPath(path, f) {
            return this.foreachOnPath_(path, newEmptyPath(), f);
        }
        foreachOnPath_(pathToFollow, currentRelativePath, f) {
            if (pathIsEmpty(pathToFollow)) {
                return this;
            }
            else {
                if (this.value) {
                    f(currentRelativePath, this.value);
                }
                const front = pathGetFront(pathToFollow);
                const nextChild = this.children.get(front);
                if (nextChild) {
                    return nextChild.foreachOnPath_(pathPopFront(pathToFollow), pathChild(currentRelativePath, front), f);
                }
                else {
                    return new ImmutableTree(null);
                }
            }
        }
        /**
         * Calls the given function for each node in the tree that has a value.
         *
         * @param f - A function to be called with the path from the root of the tree to
         * a node, and the value at that node. Called in depth-first order.
         */
        foreach(f) {
            this.foreach_(newEmptyPath(), f);
        }
        foreach_(currentRelativePath, f) {
            this.children.inorderTraversal((childName, childTree) => {
                childTree.foreach_(pathChild(currentRelativePath, childName), f);
            });
            if (this.value) {
                f(currentRelativePath, this.value);
            }
        }
        foreachChild(f) {
            this.children.inorderTraversal((childName, childTree) => {
                if (childTree.value) {
                    f(childName, childTree.value);
                }
            });
        }
    }

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
     * This class holds a collection of writes that can be applied to nodes in unison. It abstracts away the logic with
     * dealing with priority writes and multiple nested writes. At any given path there is only allowed to be one write
     * modifying that path. Any write to an existing path or shadowing an existing path will modify that existing write
     * to reflect the write added.
     */
    class CompoundWrite {
        constructor(writeTree_) {
            this.writeTree_ = writeTree_;
        }
        static empty() {
            return new CompoundWrite(new ImmutableTree(null));
        }
    }
    function compoundWriteAddWrite(compoundWrite, path, node) {
        if (pathIsEmpty(path)) {
            return new CompoundWrite(new ImmutableTree(node));
        }
        else {
            const rootmost = compoundWrite.writeTree_.findRootMostValueAndPath(path);
            if (rootmost != null) {
                const rootMostPath = rootmost.path;
                let value = rootmost.value;
                const relativePath = newRelativePath(rootMostPath, path);
                value = value.updateChild(relativePath, node);
                return new CompoundWrite(compoundWrite.writeTree_.set(rootMostPath, value));
            }
            else {
                const subtree = new ImmutableTree(node);
                const newWriteTree = compoundWrite.writeTree_.setTree(path, subtree);
                return new CompoundWrite(newWriteTree);
            }
        }
    }
    function compoundWriteAddWrites(compoundWrite, path, updates) {
        let newWrite = compoundWrite;
        each(updates, (childKey, node) => {
            newWrite = compoundWriteAddWrite(newWrite, pathChild(path, childKey), node);
        });
        return newWrite;
    }
    /**
     * Will remove a write at the given path and deeper paths. This will <em>not</em> modify a write at a higher
     * location, which must be removed by calling this method with that path.
     *
     * @param compoundWrite - The CompoundWrite to remove.
     * @param path - The path at which a write and all deeper writes should be removed
     * @returns The new CompoundWrite with the removed path
     */
    function compoundWriteRemoveWrite(compoundWrite, path) {
        if (pathIsEmpty(path)) {
            return CompoundWrite.empty();
        }
        else {
            const newWriteTree = compoundWrite.writeTree_.setTree(path, new ImmutableTree(null));
            return new CompoundWrite(newWriteTree);
        }
    }
    /**
     * Returns whether this CompoundWrite will fully overwrite a node at a given location and can therefore be
     * considered "complete".
     *
     * @param compoundWrite - The CompoundWrite to check.
     * @param path - The path to check for
     * @returns Whether there is a complete write at that path
     */
    function compoundWriteHasCompleteWrite(compoundWrite, path) {
        return compoundWriteGetCompleteNode(compoundWrite, path) != null;
    }
    /**
     * Returns a node for a path if and only if the node is a "complete" overwrite at that path. This will not aggregate
     * writes from deeper paths, but will return child nodes from a more shallow path.
     *
     * @param compoundWrite - The CompoundWrite to get the node from.
     * @param path - The path to get a complete write
     * @returns The node if complete at that path, or null otherwise.
     */
    function compoundWriteGetCompleteNode(compoundWrite, path) {
        const rootmost = compoundWrite.writeTree_.findRootMostValueAndPath(path);
        if (rootmost != null) {
            return compoundWrite.writeTree_
                .get(rootmost.path)
                .getChild(newRelativePath(rootmost.path, path));
        }
        else {
            return null;
        }
    }
    /**
     * Returns all children that are guaranteed to be a complete overwrite.
     *
     * @param compoundWrite - The CompoundWrite to get children from.
     * @returns A list of all complete children.
     */
    function compoundWriteGetCompleteChildren(compoundWrite) {
        const children = [];
        const node = compoundWrite.writeTree_.value;
        if (node != null) {
            // If it's a leaf node, it has no children; so nothing to do.
            if (!node.isLeafNode()) {
                node.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
                    children.push(new NamedNode(childName, childNode));
                });
            }
        }
        else {
            compoundWrite.writeTree_.children.inorderTraversal((childName, childTree) => {
                if (childTree.value != null) {
                    children.push(new NamedNode(childName, childTree.value));
                }
            });
        }
        return children;
    }
    function compoundWriteChildCompoundWrite(compoundWrite, path) {
        if (pathIsEmpty(path)) {
            return compoundWrite;
        }
        else {
            const shadowingNode = compoundWriteGetCompleteNode(compoundWrite, path);
            if (shadowingNode != null) {
                return new CompoundWrite(new ImmutableTree(shadowingNode));
            }
            else {
                return new CompoundWrite(compoundWrite.writeTree_.subtree(path));
            }
        }
    }
    /**
     * Returns true if this CompoundWrite is empty and therefore does not modify any nodes.
     * @returns Whether this CompoundWrite is empty
     */
    function compoundWriteIsEmpty(compoundWrite) {
        return compoundWrite.writeTree_.isEmpty();
    }
    /**
     * Applies this CompoundWrite to a node. The node is returned with all writes from this CompoundWrite applied to the
     * node
     * @param node - The node to apply this CompoundWrite to
     * @returns The node with all writes applied
     */
    function compoundWriteApply(compoundWrite, node) {
        return applySubtreeWrite(newEmptyPath(), compoundWrite.writeTree_, node);
    }
    function applySubtreeWrite(relativePath, writeTree, node) {
        if (writeTree.value != null) {
            // Since there a write is always a leaf, we're done here
            return node.updateChild(relativePath, writeTree.value);
        }
        else {
            let priorityWrite = null;
            writeTree.children.inorderTraversal((childKey, childTree) => {
                if (childKey === '.priority') {
                    // Apply priorities at the end so we don't update priorities for either empty nodes or forget
                    // to apply priorities to empty nodes that are later filled
                    assert(childTree.value !== null, 'Priority writes must always be leaf nodes');
                    priorityWrite = childTree.value;
                }
                else {
                    node = applySubtreeWrite(pathChild(relativePath, childKey), childTree, node);
                }
            });
            // If there was a priority write, we only apply it if the node is not empty
            if (!node.getChild(relativePath).isEmpty() && priorityWrite !== null) {
                node = node.updateChild(pathChild(relativePath, '.priority'), priorityWrite);
            }
            return node;
        }
    }

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
     * Create a new WriteTreeRef for the given path. For use with a new sync point at the given path.
     *
     */
    function writeTreeChildWrites(writeTree, path) {
        return newWriteTreeRef(path, writeTree);
    }
    /**
     * Record a new overwrite from user code.
     *
     * @param visible - This is set to false by some transactions. It should be excluded from event caches
     */
    function writeTreeAddOverwrite(writeTree, path, snap, writeId, visible) {
        assert(writeId > writeTree.lastWriteId, 'Stacking an older write on top of newer ones');
        if (visible === undefined) {
            visible = true;
        }
        writeTree.allWrites.push({
            path,
            snap,
            writeId,
            visible
        });
        if (visible) {
            writeTree.visibleWrites = compoundWriteAddWrite(writeTree.visibleWrites, path, snap);
        }
        writeTree.lastWriteId = writeId;
    }
    /**
     * Record a new merge from user code.
     */
    function writeTreeAddMerge(writeTree, path, changedChildren, writeId) {
        assert(writeId > writeTree.lastWriteId, 'Stacking an older merge on top of newer ones');
        writeTree.allWrites.push({
            path,
            children: changedChildren,
            writeId,
            visible: true
        });
        writeTree.visibleWrites = compoundWriteAddWrites(writeTree.visibleWrites, path, changedChildren);
        writeTree.lastWriteId = writeId;
    }
    function writeTreeGetWrite(writeTree, writeId) {
        for (let i = 0; i < writeTree.allWrites.length; i++) {
            const record = writeTree.allWrites[i];
            if (record.writeId === writeId) {
                return record;
            }
        }
        return null;
    }
    /**
     * Remove a write (either an overwrite or merge) that has been successfully acknowledge by the server. Recalculates
     * the tree if necessary.  We return true if it may have been visible, meaning views need to reevaluate.
     *
     * @returns true if the write may have been visible (meaning we'll need to reevaluate / raise
     * events as a result).
     */
    function writeTreeRemoveWrite(writeTree, writeId) {
        // Note: disabling this check. It could be a transaction that preempted another transaction, and thus was applied
        // out of order.
        //const validClear = revert || this.allWrites_.length === 0 || writeId <= this.allWrites_[0].writeId;
        //assert(validClear, "Either we don't have this write, or it's the first one in the queue");
        const idx = writeTree.allWrites.findIndex(s => {
            return s.writeId === writeId;
        });
        assert(idx >= 0, 'removeWrite called with nonexistent writeId.');
        const writeToRemove = writeTree.allWrites[idx];
        writeTree.allWrites.splice(idx, 1);
        let removedWriteWasVisible = writeToRemove.visible;
        let removedWriteOverlapsWithOtherWrites = false;
        let i = writeTree.allWrites.length - 1;
        while (removedWriteWasVisible && i >= 0) {
            const currentWrite = writeTree.allWrites[i];
            if (currentWrite.visible) {
                if (i >= idx &&
                    writeTreeRecordContainsPath_(currentWrite, writeToRemove.path)) {
                    // The removed write was completely shadowed by a subsequent write.
                    removedWriteWasVisible = false;
                }
                else if (pathContains(writeToRemove.path, currentWrite.path)) {
                    // Either we're covering some writes or they're covering part of us (depending on which came first).
                    removedWriteOverlapsWithOtherWrites = true;
                }
            }
            i--;
        }
        if (!removedWriteWasVisible) {
            return false;
        }
        else if (removedWriteOverlapsWithOtherWrites) {
            // There's some shadowing going on. Just rebuild the visible writes from scratch.
            writeTreeResetTree_(writeTree);
            return true;
        }
        else {
            // There's no shadowing.  We can safely just remove the write(s) from visibleWrites.
            if (writeToRemove.snap) {
                writeTree.visibleWrites = compoundWriteRemoveWrite(writeTree.visibleWrites, writeToRemove.path);
            }
            else {
                const children = writeToRemove.children;
                each(children, (childName) => {
                    writeTree.visibleWrites = compoundWriteRemoveWrite(writeTree.visibleWrites, pathChild(writeToRemove.path, childName));
                });
            }
            return true;
        }
    }
    function writeTreeRecordContainsPath_(writeRecord, path) {
        if (writeRecord.snap) {
            return pathContains(writeRecord.path, path);
        }
        else {
            for (const childName in writeRecord.children) {
                if (writeRecord.children.hasOwnProperty(childName) &&
                    pathContains(pathChild(writeRecord.path, childName), path)) {
                    return true;
                }
            }
            return false;
        }
    }
    /**
     * Re-layer the writes and merges into a tree so we can efficiently calculate event snapshots
     */
    function writeTreeResetTree_(writeTree) {
        writeTree.visibleWrites = writeTreeLayerTree_(writeTree.allWrites, writeTreeDefaultFilter_, newEmptyPath());
        if (writeTree.allWrites.length > 0) {
            writeTree.lastWriteId =
                writeTree.allWrites[writeTree.allWrites.length - 1].writeId;
        }
        else {
            writeTree.lastWriteId = -1;
        }
    }
    /**
     * The default filter used when constructing the tree. Keep everything that's visible.
     */
    function writeTreeDefaultFilter_(write) {
        return write.visible;
    }
    /**
     * Static method. Given an array of WriteRecords, a filter for which ones to include, and a path, construct the tree of
     * event data at that path.
     */
    function writeTreeLayerTree_(writes, filter, treeRoot) {
        let compoundWrite = CompoundWrite.empty();
        for (let i = 0; i < writes.length; ++i) {
            const write = writes[i];
            // Theory, a later set will either:
            // a) abort a relevant transaction, so no need to worry about excluding it from calculating that transaction
            // b) not be relevant to a transaction (separate branch), so again will not affect the data for that transaction
            if (filter(write)) {
                const writePath = write.path;
                let relativePath;
                if (write.snap) {
                    if (pathContains(treeRoot, writePath)) {
                        relativePath = newRelativePath(treeRoot, writePath);
                        compoundWrite = compoundWriteAddWrite(compoundWrite, relativePath, write.snap);
                    }
                    else if (pathContains(writePath, treeRoot)) {
                        relativePath = newRelativePath(writePath, treeRoot);
                        compoundWrite = compoundWriteAddWrite(compoundWrite, newEmptyPath(), write.snap.getChild(relativePath));
                    }
                    else ;
                }
                else if (write.children) {
                    if (pathContains(treeRoot, writePath)) {
                        relativePath = newRelativePath(treeRoot, writePath);
                        compoundWrite = compoundWriteAddWrites(compoundWrite, relativePath, write.children);
                    }
                    else if (pathContains(writePath, treeRoot)) {
                        relativePath = newRelativePath(writePath, treeRoot);
                        if (pathIsEmpty(relativePath)) {
                            compoundWrite = compoundWriteAddWrites(compoundWrite, newEmptyPath(), write.children);
                        }
                        else {
                            const child = safeGet(write.children, pathGetFront(relativePath));
                            if (child) {
                                // There exists a child in this node that matches the root path
                                const deepNode = child.getChild(pathPopFront(relativePath));
                                compoundWrite = compoundWriteAddWrite(compoundWrite, newEmptyPath(), deepNode);
                            }
                        }
                    }
                    else ;
                }
                else {
                    throw assertionError('WriteRecord should have .snap or .children');
                }
            }
        }
        return compoundWrite;
    }
    /**
     * Given optional, underlying server data, and an optional set of constraints (exclude some sets, include hidden
     * writes), attempt to calculate a complete snapshot for the given path
     *
     * @param writeIdsToExclude - An optional set to be excluded
     * @param includeHiddenWrites - Defaults to false, whether or not to layer on writes with visible set to false
     */
    function writeTreeCalcCompleteEventCache(writeTree, treePath, completeServerCache, writeIdsToExclude, includeHiddenWrites) {
        if (!writeIdsToExclude && !includeHiddenWrites) {
            const shadowingNode = compoundWriteGetCompleteNode(writeTree.visibleWrites, treePath);
            if (shadowingNode != null) {
                return shadowingNode;
            }
            else {
                const subMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
                if (compoundWriteIsEmpty(subMerge)) {
                    return completeServerCache;
                }
                else if (completeServerCache == null &&
                    !compoundWriteHasCompleteWrite(subMerge, newEmptyPath())) {
                    // We wouldn't have a complete snapshot, since there's no underlying data and no complete shadow
                    return null;
                }
                else {
                    const layeredCache = completeServerCache || ChildrenNode.EMPTY_NODE;
                    return compoundWriteApply(subMerge, layeredCache);
                }
            }
        }
        else {
            const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
            if (!includeHiddenWrites && compoundWriteIsEmpty(merge)) {
                return completeServerCache;
            }
            else {
                // If the server cache is null, and we don't have a complete cache, we need to return null
                if (!includeHiddenWrites &&
                    completeServerCache == null &&
                    !compoundWriteHasCompleteWrite(merge, newEmptyPath())) {
                    return null;
                }
                else {
                    const filter = function (write) {
                        return ((write.visible || includeHiddenWrites) &&
                            (!writeIdsToExclude ||
                                !~writeIdsToExclude.indexOf(write.writeId)) &&
                            (pathContains(write.path, treePath) ||
                                pathContains(treePath, write.path)));
                    };
                    const mergeAtPath = writeTreeLayerTree_(writeTree.allWrites, filter, treePath);
                    const layeredCache = completeServerCache || ChildrenNode.EMPTY_NODE;
                    return compoundWriteApply(mergeAtPath, layeredCache);
                }
            }
        }
    }
    /**
     * With optional, underlying server data, attempt to return a children node of children that we have complete data for.
     * Used when creating new views, to pre-fill their complete event children snapshot.
     */
    function writeTreeCalcCompleteEventChildren(writeTree, treePath, completeServerChildren) {
        let completeChildren = ChildrenNode.EMPTY_NODE;
        const topLevelSet = compoundWriteGetCompleteNode(writeTree.visibleWrites, treePath);
        if (topLevelSet) {
            if (!topLevelSet.isLeafNode()) {
                // we're shadowing everything. Return the children.
                topLevelSet.forEachChild(PRIORITY_INDEX, (childName, childSnap) => {
                    completeChildren = completeChildren.updateImmediateChild(childName, childSnap);
                });
            }
            return completeChildren;
        }
        else if (completeServerChildren) {
            // Layer any children we have on top of this
            // We know we don't have a top-level set, so just enumerate existing children
            const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
            completeServerChildren.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
                const node = compoundWriteApply(compoundWriteChildCompoundWrite(merge, new Path(childName)), childNode);
                completeChildren = completeChildren.updateImmediateChild(childName, node);
            });
            // Add any complete children we have from the set
            compoundWriteGetCompleteChildren(merge).forEach(namedNode => {
                completeChildren = completeChildren.updateImmediateChild(namedNode.name, namedNode.node);
            });
            return completeChildren;
        }
        else {
            // We don't have anything to layer on top of. Layer on any children we have
            // Note that we can return an empty snap if we have a defined delete
            const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
            compoundWriteGetCompleteChildren(merge).forEach(namedNode => {
                completeChildren = completeChildren.updateImmediateChild(namedNode.name, namedNode.node);
            });
            return completeChildren;
        }
    }
    /**
     * Given that the underlying server data has updated, determine what, if anything, needs to be
     * applied to the event cache.
     *
     * Possibilities:
     *
     * 1. No writes are shadowing. Events should be raised, the snap to be applied comes from the server data
     *
     * 2. Some write is completely shadowing. No events to be raised
     *
     * 3. Is partially shadowed. Events
     *
     * Either existingEventSnap or existingServerSnap must exist
     */
    function writeTreeCalcEventCacheAfterServerOverwrite(writeTree, treePath, childPath, existingEventSnap, existingServerSnap) {
        assert(existingEventSnap || existingServerSnap, 'Either existingEventSnap or existingServerSnap must exist');
        const path = pathChild(treePath, childPath);
        if (compoundWriteHasCompleteWrite(writeTree.visibleWrites, path)) {
            // At this point we can probably guarantee that we're in case 2, meaning no events
            // May need to check visibility while doing the findRootMostValueAndPath call
            return null;
        }
        else {
            // No complete shadowing. We're either partially shadowing or not shadowing at all.
            const childMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, path);
            if (compoundWriteIsEmpty(childMerge)) {
                // We're not shadowing at all. Case 1
                return existingServerSnap.getChild(childPath);
            }
            else {
                // This could be more efficient if the serverNode + updates doesn't change the eventSnap
                // However this is tricky to find out, since user updates don't necessary change the server
                // snap, e.g. priority updates on empty nodes, or deep deletes. Another special case is if the server
                // adds nodes, but doesn't change any existing writes. It is therefore not enough to
                // only check if the updates change the serverNode.
                // Maybe check if the merge tree contains these special cases and only do a full overwrite in that case?
                return compoundWriteApply(childMerge, existingServerSnap.getChild(childPath));
            }
        }
    }
    /**
     * Returns a complete child for a given server snap after applying all user writes or null if there is no
     * complete child for this ChildKey.
     */
    function writeTreeCalcCompleteChild(writeTree, treePath, childKey, existingServerSnap) {
        const path = pathChild(treePath, childKey);
        const shadowingNode = compoundWriteGetCompleteNode(writeTree.visibleWrites, path);
        if (shadowingNode != null) {
            return shadowingNode;
        }
        else {
            if (existingServerSnap.isCompleteForChild(childKey)) {
                const childMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, path);
                return compoundWriteApply(childMerge, existingServerSnap.getNode().getImmediateChild(childKey));
            }
            else {
                return null;
            }
        }
    }
    /**
     * Returns a node if there is a complete overwrite for this path. More specifically, if there is a write at
     * a higher path, this will return the child of that write relative to the write and this path.
     * Returns null if there is no write at this path.
     */
    function writeTreeShadowingWrite(writeTree, path) {
        return compoundWriteGetCompleteNode(writeTree.visibleWrites, path);
    }
    /**
     * This method is used when processing child remove events on a query. If we can, we pull in children that were outside
     * the window, but may now be in the window.
     */
    function writeTreeCalcIndexedSlice(writeTree, treePath, completeServerData, startPost, count, reverse, index) {
        let toIterate;
        const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
        const shadowingNode = compoundWriteGetCompleteNode(merge, newEmptyPath());
        if (shadowingNode != null) {
            toIterate = shadowingNode;
        }
        else if (completeServerData != null) {
            toIterate = compoundWriteApply(merge, completeServerData);
        }
        else {
            // no children to iterate on
            return [];
        }
        toIterate = toIterate.withIndex(index);
        if (!toIterate.isEmpty() && !toIterate.isLeafNode()) {
            const nodes = [];
            const cmp = index.getCompare();
            const iter = reverse
                ? toIterate.getReverseIteratorFrom(startPost, index)
                : toIterate.getIteratorFrom(startPost, index);
            let next = iter.getNext();
            while (next && nodes.length < count) {
                if (cmp(next, startPost) !== 0) {
                    nodes.push(next);
                }
                next = iter.getNext();
            }
            return nodes;
        }
        else {
            return [];
        }
    }
    function newWriteTree() {
        return {
            visibleWrites: CompoundWrite.empty(),
            allWrites: [],
            lastWriteId: -1
        };
    }
    /**
     * If possible, returns a complete event cache, using the underlying server data if possible. In addition, can be used
     * to get a cache that includes hidden writes, and excludes arbitrary writes. Note that customizing the returned node
     * can lead to a more expensive calculation.
     *
     * @param writeIdsToExclude - Optional writes to exclude.
     * @param includeHiddenWrites - Defaults to false, whether or not to layer on writes with visible set to false
     */
    function writeTreeRefCalcCompleteEventCache(writeTreeRef, completeServerCache, writeIdsToExclude, includeHiddenWrites) {
        return writeTreeCalcCompleteEventCache(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerCache, writeIdsToExclude, includeHiddenWrites);
    }
    /**
     * If possible, returns a children node containing all of the complete children we have data for. The returned data is a
     * mix of the given server data and write data.
     *
     */
    function writeTreeRefCalcCompleteEventChildren(writeTreeRef, completeServerChildren) {
        return writeTreeCalcCompleteEventChildren(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerChildren);
    }
    /**
     * Given that either the underlying server data has updated or the outstanding writes have updated, determine what,
     * if anything, needs to be applied to the event cache.
     *
     * Possibilities:
     *
     * 1. No writes are shadowing. Events should be raised, the snap to be applied comes from the server data
     *
     * 2. Some write is completely shadowing. No events to be raised
     *
     * 3. Is partially shadowed. Events should be raised
     *
     * Either existingEventSnap or existingServerSnap must exist, this is validated via an assert
     *
     *
     */
    function writeTreeRefCalcEventCacheAfterServerOverwrite(writeTreeRef, path, existingEventSnap, existingServerSnap) {
        return writeTreeCalcEventCacheAfterServerOverwrite(writeTreeRef.writeTree, writeTreeRef.treePath, path, existingEventSnap, existingServerSnap);
    }
    /**
     * Returns a node if there is a complete overwrite for this path. More specifically, if there is a write at
     * a higher path, this will return the child of that write relative to the write and this path.
     * Returns null if there is no write at this path.
     *
     */
    function writeTreeRefShadowingWrite(writeTreeRef, path) {
        return writeTreeShadowingWrite(writeTreeRef.writeTree, pathChild(writeTreeRef.treePath, path));
    }
    /**
     * This method is used when processing child remove events on a query. If we can, we pull in children that were outside
     * the window, but may now be in the window
     */
    function writeTreeRefCalcIndexedSlice(writeTreeRef, completeServerData, startPost, count, reverse, index) {
        return writeTreeCalcIndexedSlice(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerData, startPost, count, reverse, index);
    }
    /**
     * Returns a complete child for a given server snap after applying all user writes or null if there is no
     * complete child for this ChildKey.
     */
    function writeTreeRefCalcCompleteChild(writeTreeRef, childKey, existingServerCache) {
        return writeTreeCalcCompleteChild(writeTreeRef.writeTree, writeTreeRef.treePath, childKey, existingServerCache);
    }
    /**
     * Return a WriteTreeRef for a child.
     */
    function writeTreeRefChild(writeTreeRef, childName) {
        return newWriteTreeRef(pathChild(writeTreeRef.treePath, childName), writeTreeRef.writeTree);
    }
    function newWriteTreeRef(path, writeTree) {
        return {
            treePath: path,
            writeTree
        };
    }

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
    class ChildChangeAccumulator {
        constructor() {
            this.changeMap = new Map();
        }
        trackChildChange(change) {
            const type = change.type;
            const childKey = change.childName;
            assert(type === "child_added" /* CHILD_ADDED */ ||
                type === "child_changed" /* CHILD_CHANGED */ ||
                type === "child_removed" /* CHILD_REMOVED */, 'Only child changes supported for tracking');
            assert(childKey !== '.priority', 'Only non-priority child changes can be tracked.');
            const oldChange = this.changeMap.get(childKey);
            if (oldChange) {
                const oldType = oldChange.type;
                if (type === "child_added" /* CHILD_ADDED */ &&
                    oldType === "child_removed" /* CHILD_REMOVED */) {
                    this.changeMap.set(childKey, changeChildChanged(childKey, change.snapshotNode, oldChange.snapshotNode));
                }
                else if (type === "child_removed" /* CHILD_REMOVED */ &&
                    oldType === "child_added" /* CHILD_ADDED */) {
                    this.changeMap.delete(childKey);
                }
                else if (type === "child_removed" /* CHILD_REMOVED */ &&
                    oldType === "child_changed" /* CHILD_CHANGED */) {
                    this.changeMap.set(childKey, changeChildRemoved(childKey, oldChange.oldSnap));
                }
                else if (type === "child_changed" /* CHILD_CHANGED */ &&
                    oldType === "child_added" /* CHILD_ADDED */) {
                    this.changeMap.set(childKey, changeChildAdded(childKey, change.snapshotNode));
                }
                else if (type === "child_changed" /* CHILD_CHANGED */ &&
                    oldType === "child_changed" /* CHILD_CHANGED */) {
                    this.changeMap.set(childKey, changeChildChanged(childKey, change.snapshotNode, oldChange.oldSnap));
                }
                else {
                    throw assertionError('Illegal combination of changes: ' +
                        change +
                        ' occurred after ' +
                        oldChange);
                }
            }
            else {
                this.changeMap.set(childKey, change);
            }
        }
        getChanges() {
            return Array.from(this.changeMap.values());
        }
    }

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
     * An implementation of CompleteChildSource that never returns any additional children
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    class NoCompleteChildSource_ {
        getCompleteChild(childKey) {
            return null;
        }
        getChildAfterChild(index, child, reverse) {
            return null;
        }
    }
    /**
     * Singleton instance.
     */
    const NO_COMPLETE_CHILD_SOURCE = new NoCompleteChildSource_();
    /**
     * An implementation of CompleteChildSource that uses a WriteTree in addition to any other server data or
     * old event caches available to calculate complete children.
     */
    class WriteTreeCompleteChildSource {
        constructor(writes_, viewCache_, optCompleteServerCache_ = null) {
            this.writes_ = writes_;
            this.viewCache_ = viewCache_;
            this.optCompleteServerCache_ = optCompleteServerCache_;
        }
        getCompleteChild(childKey) {
            const node = this.viewCache_.eventCache;
            if (node.isCompleteForChild(childKey)) {
                return node.getNode().getImmediateChild(childKey);
            }
            else {
                const serverNode = this.optCompleteServerCache_ != null
                    ? new CacheNode(this.optCompleteServerCache_, true, false)
                    : this.viewCache_.serverCache;
                return writeTreeRefCalcCompleteChild(this.writes_, childKey, serverNode);
            }
        }
        getChildAfterChild(index, child, reverse) {
            const completeServerData = this.optCompleteServerCache_ != null
                ? this.optCompleteServerCache_
                : viewCacheGetCompleteServerSnap(this.viewCache_);
            const nodes = writeTreeRefCalcIndexedSlice(this.writes_, completeServerData, child, 1, reverse, index);
            if (nodes.length === 0) {
                return null;
            }
            else {
                return nodes[0];
            }
        }
    }

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
    function newViewProcessor(filter) {
        return { filter };
    }
    function viewProcessorAssertIndexed(viewProcessor, viewCache) {
        assert(viewCache.eventCache.getNode().isIndexed(viewProcessor.filter.getIndex()), 'Event snap not indexed');
        assert(viewCache.serverCache.getNode().isIndexed(viewProcessor.filter.getIndex()), 'Server snap not indexed');
    }
    function viewProcessorApplyOperation(viewProcessor, oldViewCache, operation, writesCache, completeCache) {
        const accumulator = new ChildChangeAccumulator();
        let newViewCache, filterServerNode;
        if (operation.type === OperationType.OVERWRITE) {
            const overwrite = operation;
            if (overwrite.source.fromUser) {
                newViewCache = viewProcessorApplyUserOverwrite(viewProcessor, oldViewCache, overwrite.path, overwrite.snap, writesCache, completeCache, accumulator);
            }
            else {
                assert(overwrite.source.fromServer, 'Unknown source.');
                // We filter the node if it's a tagged update or the node has been previously filtered  and the
                // update is not at the root in which case it is ok (and necessary) to mark the node unfiltered
                // again
                filterServerNode =
                    overwrite.source.tagged ||
                        (oldViewCache.serverCache.isFiltered() && !pathIsEmpty(overwrite.path));
                newViewCache = viewProcessorApplyServerOverwrite(viewProcessor, oldViewCache, overwrite.path, overwrite.snap, writesCache, completeCache, filterServerNode, accumulator);
            }
        }
        else if (operation.type === OperationType.MERGE) {
            const merge = operation;
            if (merge.source.fromUser) {
                newViewCache = viewProcessorApplyUserMerge(viewProcessor, oldViewCache, merge.path, merge.children, writesCache, completeCache, accumulator);
            }
            else {
                assert(merge.source.fromServer, 'Unknown source.');
                // We filter the node if it's a tagged update or the node has been previously filtered
                filterServerNode =
                    merge.source.tagged || oldViewCache.serverCache.isFiltered();
                newViewCache = viewProcessorApplyServerMerge(viewProcessor, oldViewCache, merge.path, merge.children, writesCache, completeCache, filterServerNode, accumulator);
            }
        }
        else if (operation.type === OperationType.ACK_USER_WRITE) {
            const ackUserWrite = operation;
            if (!ackUserWrite.revert) {
                newViewCache = viewProcessorAckUserWrite(viewProcessor, oldViewCache, ackUserWrite.path, ackUserWrite.affectedTree, writesCache, completeCache, accumulator);
            }
            else {
                newViewCache = viewProcessorRevertUserWrite(viewProcessor, oldViewCache, ackUserWrite.path, writesCache, completeCache, accumulator);
            }
        }
        else if (operation.type === OperationType.LISTEN_COMPLETE) {
            newViewCache = viewProcessorListenComplete(viewProcessor, oldViewCache, operation.path, writesCache, accumulator);
        }
        else {
            throw assertionError('Unknown operation type: ' + operation.type);
        }
        const changes = accumulator.getChanges();
        viewProcessorMaybeAddValueEvent(oldViewCache, newViewCache, changes);
        return { viewCache: newViewCache, changes };
    }
    function viewProcessorMaybeAddValueEvent(oldViewCache, newViewCache, accumulator) {
        const eventSnap = newViewCache.eventCache;
        if (eventSnap.isFullyInitialized()) {
            const isLeafOrEmpty = eventSnap.getNode().isLeafNode() || eventSnap.getNode().isEmpty();
            const oldCompleteSnap = viewCacheGetCompleteEventSnap(oldViewCache);
            if (accumulator.length > 0 ||
                !oldViewCache.eventCache.isFullyInitialized() ||
                (isLeafOrEmpty && !eventSnap.getNode().equals(oldCompleteSnap)) ||
                !eventSnap.getNode().getPriority().equals(oldCompleteSnap.getPriority())) {
                accumulator.push(changeValue(viewCacheGetCompleteEventSnap(newViewCache)));
            }
        }
    }
    function viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, viewCache, changePath, writesCache, source, accumulator) {
        const oldEventSnap = viewCache.eventCache;
        if (writeTreeRefShadowingWrite(writesCache, changePath) != null) {
            // we have a shadowing write, ignore changes
            return viewCache;
        }
        else {
            let newEventCache, serverNode;
            if (pathIsEmpty(changePath)) {
                // TODO: figure out how this plays with "sliding ack windows"
                assert(viewCache.serverCache.isFullyInitialized(), 'If change path is empty, we must have complete server data');
                if (viewCache.serverCache.isFiltered()) {
                    // We need to special case this, because we need to only apply writes to complete children, or
                    // we might end up raising events for incomplete children. If the server data is filtered deep
                    // writes cannot be guaranteed to be complete
                    const serverCache = viewCacheGetCompleteServerSnap(viewCache);
                    const completeChildren = serverCache instanceof ChildrenNode
                        ? serverCache
                        : ChildrenNode.EMPTY_NODE;
                    const completeEventChildren = writeTreeRefCalcCompleteEventChildren(writesCache, completeChildren);
                    newEventCache = viewProcessor.filter.updateFullNode(viewCache.eventCache.getNode(), completeEventChildren, accumulator);
                }
                else {
                    const completeNode = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
                    newEventCache = viewProcessor.filter.updateFullNode(viewCache.eventCache.getNode(), completeNode, accumulator);
                }
            }
            else {
                const childKey = pathGetFront(changePath);
                if (childKey === '.priority') {
                    assert(pathGetLength(changePath) === 1, "Can't have a priority with additional path components");
                    const oldEventNode = oldEventSnap.getNode();
                    serverNode = viewCache.serverCache.getNode();
                    // we might have overwrites for this priority
                    const updatedPriority = writeTreeRefCalcEventCacheAfterServerOverwrite(writesCache, changePath, oldEventNode, serverNode);
                    if (updatedPriority != null) {
                        newEventCache = viewProcessor.filter.updatePriority(oldEventNode, updatedPriority);
                    }
                    else {
                        // priority didn't change, keep old node
                        newEventCache = oldEventSnap.getNode();
                    }
                }
                else {
                    const childChangePath = pathPopFront(changePath);
                    // update child
                    let newEventChild;
                    if (oldEventSnap.isCompleteForChild(childKey)) {
                        serverNode = viewCache.serverCache.getNode();
                        const eventChildUpdate = writeTreeRefCalcEventCacheAfterServerOverwrite(writesCache, changePath, oldEventSnap.getNode(), serverNode);
                        if (eventChildUpdate != null) {
                            newEventChild = oldEventSnap
                                .getNode()
                                .getImmediateChild(childKey)
                                .updateChild(childChangePath, eventChildUpdate);
                        }
                        else {
                            // Nothing changed, just keep the old child
                            newEventChild = oldEventSnap.getNode().getImmediateChild(childKey);
                        }
                    }
                    else {
                        newEventChild = writeTreeRefCalcCompleteChild(writesCache, childKey, viewCache.serverCache);
                    }
                    if (newEventChild != null) {
                        newEventCache = viewProcessor.filter.updateChild(oldEventSnap.getNode(), childKey, newEventChild, childChangePath, source, accumulator);
                    }
                    else {
                        // no complete child available or no change
                        newEventCache = oldEventSnap.getNode();
                    }
                }
            }
            return viewCacheUpdateEventSnap(viewCache, newEventCache, oldEventSnap.isFullyInitialized() || pathIsEmpty(changePath), viewProcessor.filter.filtersNodes());
        }
    }
    function viewProcessorApplyServerOverwrite(viewProcessor, oldViewCache, changePath, changedSnap, writesCache, completeCache, filterServerNode, accumulator) {
        const oldServerSnap = oldViewCache.serverCache;
        let newServerCache;
        const serverFilter = filterServerNode
            ? viewProcessor.filter
            : viewProcessor.filter.getIndexedFilter();
        if (pathIsEmpty(changePath)) {
            newServerCache = serverFilter.updateFullNode(oldServerSnap.getNode(), changedSnap, null);
        }
        else if (serverFilter.filtersNodes() && !oldServerSnap.isFiltered()) {
            // we want to filter the server node, but we didn't filter the server node yet, so simulate a full update
            const newServerNode = oldServerSnap
                .getNode()
                .updateChild(changePath, changedSnap);
            newServerCache = serverFilter.updateFullNode(oldServerSnap.getNode(), newServerNode, null);
        }
        else {
            const childKey = pathGetFront(changePath);
            if (!oldServerSnap.isCompleteForPath(changePath) &&
                pathGetLength(changePath) > 1) {
                // We don't update incomplete nodes with updates intended for other listeners
                return oldViewCache;
            }
            const childChangePath = pathPopFront(changePath);
            const childNode = oldServerSnap.getNode().getImmediateChild(childKey);
            const newChildNode = childNode.updateChild(childChangePath, changedSnap);
            if (childKey === '.priority') {
                newServerCache = serverFilter.updatePriority(oldServerSnap.getNode(), newChildNode);
            }
            else {
                newServerCache = serverFilter.updateChild(oldServerSnap.getNode(), childKey, newChildNode, childChangePath, NO_COMPLETE_CHILD_SOURCE, null);
            }
        }
        const newViewCache = viewCacheUpdateServerSnap(oldViewCache, newServerCache, oldServerSnap.isFullyInitialized() || pathIsEmpty(changePath), serverFilter.filtersNodes());
        const source = new WriteTreeCompleteChildSource(writesCache, newViewCache, completeCache);
        return viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, newViewCache, changePath, writesCache, source, accumulator);
    }
    function viewProcessorApplyUserOverwrite(viewProcessor, oldViewCache, changePath, changedSnap, writesCache, completeCache, accumulator) {
        const oldEventSnap = oldViewCache.eventCache;
        let newViewCache, newEventCache;
        const source = new WriteTreeCompleteChildSource(writesCache, oldViewCache, completeCache);
        if (pathIsEmpty(changePath)) {
            newEventCache = viewProcessor.filter.updateFullNode(oldViewCache.eventCache.getNode(), changedSnap, accumulator);
            newViewCache = viewCacheUpdateEventSnap(oldViewCache, newEventCache, true, viewProcessor.filter.filtersNodes());
        }
        else {
            const childKey = pathGetFront(changePath);
            if (childKey === '.priority') {
                newEventCache = viewProcessor.filter.updatePriority(oldViewCache.eventCache.getNode(), changedSnap);
                newViewCache = viewCacheUpdateEventSnap(oldViewCache, newEventCache, oldEventSnap.isFullyInitialized(), oldEventSnap.isFiltered());
            }
            else {
                const childChangePath = pathPopFront(changePath);
                const oldChild = oldEventSnap.getNode().getImmediateChild(childKey);
                let newChild;
                if (pathIsEmpty(childChangePath)) {
                    // Child overwrite, we can replace the child
                    newChild = changedSnap;
                }
                else {
                    const childNode = source.getCompleteChild(childKey);
                    if (childNode != null) {
                        if (pathGetBack(childChangePath) === '.priority' &&
                            childNode.getChild(pathParent(childChangePath)).isEmpty()) {
                            // This is a priority update on an empty node. If this node exists on the server, the
                            // server will send down the priority in the update, so ignore for now
                            newChild = childNode;
                        }
                        else {
                            newChild = childNode.updateChild(childChangePath, changedSnap);
                        }
                    }
                    else {
                        // There is no complete child node available
                        newChild = ChildrenNode.EMPTY_NODE;
                    }
                }
                if (!oldChild.equals(newChild)) {
                    const newEventSnap = viewProcessor.filter.updateChild(oldEventSnap.getNode(), childKey, newChild, childChangePath, source, accumulator);
                    newViewCache = viewCacheUpdateEventSnap(oldViewCache, newEventSnap, oldEventSnap.isFullyInitialized(), viewProcessor.filter.filtersNodes());
                }
                else {
                    newViewCache = oldViewCache;
                }
            }
        }
        return newViewCache;
    }
    function viewProcessorCacheHasChild(viewCache, childKey) {
        return viewCache.eventCache.isCompleteForChild(childKey);
    }
    function viewProcessorApplyUserMerge(viewProcessor, viewCache, path, changedChildren, writesCache, serverCache, accumulator) {
        // HACK: In the case of a limit query, there may be some changes that bump things out of the
        // window leaving room for new items.  It's important we process these changes first, so we
        // iterate the changes twice, first processing any that affect items currently in view.
        // TODO: I consider an item "in view" if cacheHasChild is true, which checks both the server
        // and event snap.  I'm not sure if this will result in edge cases when a child is in one but
        // not the other.
        let curViewCache = viewCache;
        changedChildren.foreach((relativePath, childNode) => {
            const writePath = pathChild(path, relativePath);
            if (viewProcessorCacheHasChild(viewCache, pathGetFront(writePath))) {
                curViewCache = viewProcessorApplyUserOverwrite(viewProcessor, curViewCache, writePath, childNode, writesCache, serverCache, accumulator);
            }
        });
        changedChildren.foreach((relativePath, childNode) => {
            const writePath = pathChild(path, relativePath);
            if (!viewProcessorCacheHasChild(viewCache, pathGetFront(writePath))) {
                curViewCache = viewProcessorApplyUserOverwrite(viewProcessor, curViewCache, writePath, childNode, writesCache, serverCache, accumulator);
            }
        });
        return curViewCache;
    }
    function viewProcessorApplyMerge(viewProcessor, node, merge) {
        merge.foreach((relativePath, childNode) => {
            node = node.updateChild(relativePath, childNode);
        });
        return node;
    }
    function viewProcessorApplyServerMerge(viewProcessor, viewCache, path, changedChildren, writesCache, serverCache, filterServerNode, accumulator) {
        // If we don't have a cache yet, this merge was intended for a previously listen in the same location. Ignore it and
        // wait for the complete data update coming soon.
        if (viewCache.serverCache.getNode().isEmpty() &&
            !viewCache.serverCache.isFullyInitialized()) {
            return viewCache;
        }
        // HACK: In the case of a limit query, there may be some changes that bump things out of the
        // window leaving room for new items.  It's important we process these changes first, so we
        // iterate the changes twice, first processing any that affect items currently in view.
        // TODO: I consider an item "in view" if cacheHasChild is true, which checks both the server
        // and event snap.  I'm not sure if this will result in edge cases when a child is in one but
        // not the other.
        let curViewCache = viewCache;
        let viewMergeTree;
        if (pathIsEmpty(path)) {
            viewMergeTree = changedChildren;
        }
        else {
            viewMergeTree = new ImmutableTree(null).setTree(path, changedChildren);
        }
        const serverNode = viewCache.serverCache.getNode();
        viewMergeTree.children.inorderTraversal((childKey, childTree) => {
            if (serverNode.hasChild(childKey)) {
                const serverChild = viewCache.serverCache
                    .getNode()
                    .getImmediateChild(childKey);
                const newChild = viewProcessorApplyMerge(viewProcessor, serverChild, childTree);
                curViewCache = viewProcessorApplyServerOverwrite(viewProcessor, curViewCache, new Path(childKey), newChild, writesCache, serverCache, filterServerNode, accumulator);
            }
        });
        viewMergeTree.children.inorderTraversal((childKey, childMergeTree) => {
            const isUnknownDeepMerge = !viewCache.serverCache.isCompleteForChild(childKey) &&
                childMergeTree.value === undefined;
            if (!serverNode.hasChild(childKey) && !isUnknownDeepMerge) {
                const serverChild = viewCache.serverCache
                    .getNode()
                    .getImmediateChild(childKey);
                const newChild = viewProcessorApplyMerge(viewProcessor, serverChild, childMergeTree);
                curViewCache = viewProcessorApplyServerOverwrite(viewProcessor, curViewCache, new Path(childKey), newChild, writesCache, serverCache, filterServerNode, accumulator);
            }
        });
        return curViewCache;
    }
    function viewProcessorAckUserWrite(viewProcessor, viewCache, ackPath, affectedTree, writesCache, completeCache, accumulator) {
        if (writeTreeRefShadowingWrite(writesCache, ackPath) != null) {
            return viewCache;
        }
        // Only filter server node if it is currently filtered
        const filterServerNode = viewCache.serverCache.isFiltered();
        // Essentially we'll just get our existing server cache for the affected paths and re-apply it as a server update
        // now that it won't be shadowed.
        const serverCache = viewCache.serverCache;
        if (affectedTree.value != null) {
            // This is an overwrite.
            if ((pathIsEmpty(ackPath) && serverCache.isFullyInitialized()) ||
                serverCache.isCompleteForPath(ackPath)) {
                return viewProcessorApplyServerOverwrite(viewProcessor, viewCache, ackPath, serverCache.getNode().getChild(ackPath), writesCache, completeCache, filterServerNode, accumulator);
            }
            else if (pathIsEmpty(ackPath)) {
                // This is a goofy edge case where we are acking data at this location but don't have full data.  We
                // should just re-apply whatever we have in our cache as a merge.
                let changedChildren = new ImmutableTree(null);
                serverCache.getNode().forEachChild(KEY_INDEX, (name, node) => {
                    changedChildren = changedChildren.set(new Path(name), node);
                });
                return viewProcessorApplyServerMerge(viewProcessor, viewCache, ackPath, changedChildren, writesCache, completeCache, filterServerNode, accumulator);
            }
            else {
                return viewCache;
            }
        }
        else {
            // This is a merge.
            let changedChildren = new ImmutableTree(null);
            affectedTree.foreach((mergePath, value) => {
                const serverCachePath = pathChild(ackPath, mergePath);
                if (serverCache.isCompleteForPath(serverCachePath)) {
                    changedChildren = changedChildren.set(mergePath, serverCache.getNode().getChild(serverCachePath));
                }
            });
            return viewProcessorApplyServerMerge(viewProcessor, viewCache, ackPath, changedChildren, writesCache, completeCache, filterServerNode, accumulator);
        }
    }
    function viewProcessorListenComplete(viewProcessor, viewCache, path, writesCache, accumulator) {
        const oldServerNode = viewCache.serverCache;
        const newViewCache = viewCacheUpdateServerSnap(viewCache, oldServerNode.getNode(), oldServerNode.isFullyInitialized() || pathIsEmpty(path), oldServerNode.isFiltered());
        return viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, newViewCache, path, writesCache, NO_COMPLETE_CHILD_SOURCE, accumulator);
    }
    function viewProcessorRevertUserWrite(viewProcessor, viewCache, path, writesCache, completeServerCache, accumulator) {
        let complete;
        if (writeTreeRefShadowingWrite(writesCache, path) != null) {
            return viewCache;
        }
        else {
            const source = new WriteTreeCompleteChildSource(writesCache, viewCache, completeServerCache);
            const oldEventCache = viewCache.eventCache.getNode();
            let newEventCache;
            if (pathIsEmpty(path) || pathGetFront(path) === '.priority') {
                let newNode;
                if (viewCache.serverCache.isFullyInitialized()) {
                    newNode = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
                }
                else {
                    const serverChildren = viewCache.serverCache.getNode();
                    assert(serverChildren instanceof ChildrenNode, 'serverChildren would be complete if leaf node');
                    newNode = writeTreeRefCalcCompleteEventChildren(writesCache, serverChildren);
                }
                newNode = newNode;
                newEventCache = viewProcessor.filter.updateFullNode(oldEventCache, newNode, accumulator);
            }
            else {
                const childKey = pathGetFront(path);
                let newChild = writeTreeRefCalcCompleteChild(writesCache, childKey, viewCache.serverCache);
                if (newChild == null &&
                    viewCache.serverCache.isCompleteForChild(childKey)) {
                    newChild = oldEventCache.getImmediateChild(childKey);
                }
                if (newChild != null) {
                    newEventCache = viewProcessor.filter.updateChild(oldEventCache, childKey, newChild, pathPopFront(path), source, accumulator);
                }
                else if (viewCache.eventCache.getNode().hasChild(childKey)) {
                    // No complete child available, delete the existing one, if any
                    newEventCache = viewProcessor.filter.updateChild(oldEventCache, childKey, ChildrenNode.EMPTY_NODE, pathPopFront(path), source, accumulator);
                }
                else {
                    newEventCache = oldEventCache;
                }
                if (newEventCache.isEmpty() &&
                    viewCache.serverCache.isFullyInitialized()) {
                    // We might have reverted all child writes. Maybe the old event was a leaf node
                    complete = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
                    if (complete.isLeafNode()) {
                        newEventCache = viewProcessor.filter.updateFullNode(newEventCache, complete, accumulator);
                    }
                }
            }
            complete =
                viewCache.serverCache.isFullyInitialized() ||
                    writeTreeRefShadowingWrite(writesCache, newEmptyPath()) != null;
            return viewCacheUpdateEventSnap(viewCache, newEventCache, complete, viewProcessor.filter.filtersNodes());
        }
    }

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
     * A view represents a specific location and query that has 1 or more event registrations.
     *
     * It does several things:
     *  - Maintains the list of event registrations for this location/query.
     *  - Maintains a cache of the data visible for this location/query.
     *  - Applies new operations (via applyOperation), updates the cache, and based on the event
     *    registrations returns the set of events to be raised.
     */
    class View {
        constructor(query_, initialViewCache) {
            this.query_ = query_;
            this.eventRegistrations_ = [];
            const params = this.query_._queryParams;
            const indexFilter = new IndexedFilter(params.getIndex());
            const filter = queryParamsGetNodeFilter(params);
            this.processor_ = newViewProcessor(filter);
            const initialServerCache = initialViewCache.serverCache;
            const initialEventCache = initialViewCache.eventCache;
            // Don't filter server node with other filter than index, wait for tagged listen
            const serverSnap = indexFilter.updateFullNode(ChildrenNode.EMPTY_NODE, initialServerCache.getNode(), null);
            const eventSnap = filter.updateFullNode(ChildrenNode.EMPTY_NODE, initialEventCache.getNode(), null);
            const newServerCache = new CacheNode(serverSnap, initialServerCache.isFullyInitialized(), indexFilter.filtersNodes());
            const newEventCache = new CacheNode(eventSnap, initialEventCache.isFullyInitialized(), filter.filtersNodes());
            this.viewCache_ = newViewCache(newEventCache, newServerCache);
            this.eventGenerator_ = new EventGenerator(this.query_);
        }
        get query() {
            return this.query_;
        }
    }
    function viewGetServerCache(view) {
        return view.viewCache_.serverCache.getNode();
    }
    function viewGetCompleteNode(view) {
        return viewCacheGetCompleteEventSnap(view.viewCache_);
    }
    function viewGetCompleteServerCache(view, path) {
        const cache = viewCacheGetCompleteServerSnap(view.viewCache_);
        if (cache) {
            // If this isn't a "loadsAllData" view, then cache isn't actually a complete cache and
            // we need to see if it contains the child we're interested in.
            if (view.query._queryParams.loadsAllData() ||
                (!pathIsEmpty(path) &&
                    !cache.getImmediateChild(pathGetFront(path)).isEmpty())) {
                return cache.getChild(path);
            }
        }
        return null;
    }
    function viewIsEmpty(view) {
        return view.eventRegistrations_.length === 0;
    }
    function viewAddEventRegistration(view, eventRegistration) {
        view.eventRegistrations_.push(eventRegistration);
    }
    /**
     * @param eventRegistration - If null, remove all callbacks.
     * @param cancelError - If a cancelError is provided, appropriate cancel events will be returned.
     * @returns Cancel events, if cancelError was provided.
     */
    function viewRemoveEventRegistration(view, eventRegistration, cancelError) {
        const cancelEvents = [];
        if (cancelError) {
            assert(eventRegistration == null, 'A cancel should cancel all event registrations.');
            const path = view.query._path;
            view.eventRegistrations_.forEach(registration => {
                const maybeEvent = registration.createCancelEvent(cancelError, path);
                if (maybeEvent) {
                    cancelEvents.push(maybeEvent);
                }
            });
        }
        if (eventRegistration) {
            let remaining = [];
            for (let i = 0; i < view.eventRegistrations_.length; ++i) {
                const existing = view.eventRegistrations_[i];
                if (!existing.matches(eventRegistration)) {
                    remaining.push(existing);
                }
                else if (eventRegistration.hasAnyCallback()) {
                    // We're removing just this one
                    remaining = remaining.concat(view.eventRegistrations_.slice(i + 1));
                    break;
                }
            }
            view.eventRegistrations_ = remaining;
        }
        else {
            view.eventRegistrations_ = [];
        }
        return cancelEvents;
    }
    /**
     * Applies the given Operation, updates our cache, and returns the appropriate events.
     */
    function viewApplyOperation(view, operation, writesCache, completeServerCache) {
        if (operation.type === OperationType.MERGE &&
            operation.source.queryId !== null) {
            assert(viewCacheGetCompleteServerSnap(view.viewCache_), 'We should always have a full cache before handling merges');
            assert(viewCacheGetCompleteEventSnap(view.viewCache_), 'Missing event cache, even though we have a server cache');
        }
        const oldViewCache = view.viewCache_;
        const result = viewProcessorApplyOperation(view.processor_, oldViewCache, operation, writesCache, completeServerCache);
        viewProcessorAssertIndexed(view.processor_, result.viewCache);
        assert(result.viewCache.serverCache.isFullyInitialized() ||
            !oldViewCache.serverCache.isFullyInitialized(), 'Once a server snap is complete, it should never go back');
        view.viewCache_ = result.viewCache;
        return viewGenerateEventsForChanges_(view, result.changes, result.viewCache.eventCache.getNode(), null);
    }
    function viewGetInitialEvents(view, registration) {
        const eventSnap = view.viewCache_.eventCache;
        const initialChanges = [];
        if (!eventSnap.getNode().isLeafNode()) {
            const eventNode = eventSnap.getNode();
            eventNode.forEachChild(PRIORITY_INDEX, (key, childNode) => {
                initialChanges.push(changeChildAdded(key, childNode));
            });
        }
        if (eventSnap.isFullyInitialized()) {
            initialChanges.push(changeValue(eventSnap.getNode()));
        }
        return viewGenerateEventsForChanges_(view, initialChanges, eventSnap.getNode(), registration);
    }
    function viewGenerateEventsForChanges_(view, changes, eventCache, eventRegistration) {
        const registrations = eventRegistration
            ? [eventRegistration]
            : view.eventRegistrations_;
        return eventGeneratorGenerateEventsForChanges(view.eventGenerator_, changes, eventCache, registrations);
    }

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
    let referenceConstructor$1;
    /**
     * SyncPoint represents a single location in a SyncTree with 1 or more event registrations, meaning we need to
     * maintain 1 or more Views at this location to cache server data and raise appropriate events for server changes
     * and user writes (set, transaction, update).
     *
     * It's responsible for:
     *  - Maintaining the set of 1 or more views necessary at this location (a SyncPoint with 0 views should be removed).
     *  - Proxying user / server operations to the views as appropriate (i.e. applyServerOverwrite,
     *    applyUserOverwrite, etc.)
     */
    class SyncPoint {
        constructor() {
            /**
             * The Views being tracked at this location in the tree, stored as a map where the key is a
             * queryId and the value is the View for that query.
             *
             * NOTE: This list will be quite small (usually 1, but perhaps 2 or 3; any more is an odd use case).
             */
            this.views = new Map();
        }
    }
    function syncPointSetReferenceConstructor(val) {
        assert(!referenceConstructor$1, '__referenceConstructor has already been defined');
        referenceConstructor$1 = val;
    }
    function syncPointGetReferenceConstructor() {
        assert(referenceConstructor$1, 'Reference.ts has not been loaded');
        return referenceConstructor$1;
    }
    function syncPointIsEmpty(syncPoint) {
        return syncPoint.views.size === 0;
    }
    function syncPointApplyOperation(syncPoint, operation, writesCache, optCompleteServerCache) {
        const queryId = operation.source.queryId;
        if (queryId !== null) {
            const view = syncPoint.views.get(queryId);
            assert(view != null, 'SyncTree gave us an op for an invalid query.');
            return viewApplyOperation(view, operation, writesCache, optCompleteServerCache);
        }
        else {
            let events = [];
            for (const view of syncPoint.views.values()) {
                events = events.concat(viewApplyOperation(view, operation, writesCache, optCompleteServerCache));
            }
            return events;
        }
    }
    /**
     * Get a view for the specified query.
     *
     * @param query - The query to return a view for
     * @param writesCache
     * @param serverCache
     * @param serverCacheComplete
     * @returns Events to raise.
     */
    function syncPointGetView(syncPoint, query, writesCache, serverCache, serverCacheComplete) {
        const queryId = query._queryIdentifier;
        const view = syncPoint.views.get(queryId);
        if (!view) {
            // TODO: make writesCache take flag for complete server node
            let eventCache = writeTreeRefCalcCompleteEventCache(writesCache, serverCacheComplete ? serverCache : null);
            let eventCacheComplete = false;
            if (eventCache) {
                eventCacheComplete = true;
            }
            else if (serverCache instanceof ChildrenNode) {
                eventCache = writeTreeRefCalcCompleteEventChildren(writesCache, serverCache);
                eventCacheComplete = false;
            }
            else {
                eventCache = ChildrenNode.EMPTY_NODE;
                eventCacheComplete = false;
            }
            const viewCache = newViewCache(new CacheNode(eventCache, eventCacheComplete, false), new CacheNode(serverCache, serverCacheComplete, false));
            return new View(query, viewCache);
        }
        return view;
    }
    /**
     * Add an event callback for the specified query.
     *
     * @param query
     * @param eventRegistration
     * @param writesCache
     * @param serverCache - Complete server cache, if we have it.
     * @param serverCacheComplete
     * @returns Events to raise.
     */
    function syncPointAddEventRegistration(syncPoint, query, eventRegistration, writesCache, serverCache, serverCacheComplete) {
        const view = syncPointGetView(syncPoint, query, writesCache, serverCache, serverCacheComplete);
        if (!syncPoint.views.has(query._queryIdentifier)) {
            syncPoint.views.set(query._queryIdentifier, view);
        }
        // This is guaranteed to exist now, we just created anything that was missing
        viewAddEventRegistration(view, eventRegistration);
        return viewGetInitialEvents(view, eventRegistration);
    }
    /**
     * Remove event callback(s).  Return cancelEvents if a cancelError is specified.
     *
     * If query is the default query, we'll check all views for the specified eventRegistration.
     * If eventRegistration is null, we'll remove all callbacks for the specified view(s).
     *
     * @param eventRegistration - If null, remove all callbacks.
     * @param cancelError - If a cancelError is provided, appropriate cancel events will be returned.
     * @returns removed queries and any cancel events
     */
    function syncPointRemoveEventRegistration(syncPoint, query, eventRegistration, cancelError) {
        const queryId = query._queryIdentifier;
        const removed = [];
        let cancelEvents = [];
        const hadCompleteView = syncPointHasCompleteView(syncPoint);
        if (queryId === 'default') {
            // When you do ref.off(...), we search all views for the registration to remove.
            for (const [viewQueryId, view] of syncPoint.views.entries()) {
                cancelEvents = cancelEvents.concat(viewRemoveEventRegistration(view, eventRegistration, cancelError));
                if (viewIsEmpty(view)) {
                    syncPoint.views.delete(viewQueryId);
                    // We'll deal with complete views later.
                    if (!view.query._queryParams.loadsAllData()) {
                        removed.push(view.query);
                    }
                }
            }
        }
        else {
            // remove the callback from the specific view.
            const view = syncPoint.views.get(queryId);
            if (view) {
                cancelEvents = cancelEvents.concat(viewRemoveEventRegistration(view, eventRegistration, cancelError));
                if (viewIsEmpty(view)) {
                    syncPoint.views.delete(queryId);
                    // We'll deal with complete views later.
                    if (!view.query._queryParams.loadsAllData()) {
                        removed.push(view.query);
                    }
                }
            }
        }
        if (hadCompleteView && !syncPointHasCompleteView(syncPoint)) {
            // We removed our last complete view.
            removed.push(new (syncPointGetReferenceConstructor())(query._repo, query._path));
        }
        return { removed, events: cancelEvents };
    }
    function syncPointGetQueryViews(syncPoint) {
        const result = [];
        for (const view of syncPoint.views.values()) {
            if (!view.query._queryParams.loadsAllData()) {
                result.push(view);
            }
        }
        return result;
    }
    /**
     * @param path - The path to the desired complete snapshot
     * @returns A complete cache, if it exists
     */
    function syncPointGetCompleteServerCache(syncPoint, path) {
        let serverCache = null;
        for (const view of syncPoint.views.values()) {
            serverCache = serverCache || viewGetCompleteServerCache(view, path);
        }
        return serverCache;
    }
    function syncPointViewForQuery(syncPoint, query) {
        const params = query._queryParams;
        if (params.loadsAllData()) {
            return syncPointGetCompleteView(syncPoint);
        }
        else {
            const queryId = query._queryIdentifier;
            return syncPoint.views.get(queryId);
        }
    }
    function syncPointViewExistsForQuery(syncPoint, query) {
        return syncPointViewForQuery(syncPoint, query) != null;
    }
    function syncPointHasCompleteView(syncPoint) {
        return syncPointGetCompleteView(syncPoint) != null;
    }
    function syncPointGetCompleteView(syncPoint) {
        for (const view of syncPoint.views.values()) {
            if (view.query._queryParams.loadsAllData()) {
                return view;
            }
        }
        return null;
    }

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
    let referenceConstructor;
    function syncTreeSetReferenceConstructor(val) {
        assert(!referenceConstructor, '__referenceConstructor has already been defined');
        referenceConstructor = val;
    }
    function syncTreeGetReferenceConstructor() {
        assert(referenceConstructor, 'Reference.ts has not been loaded');
        return referenceConstructor;
    }
    /**
     * Static tracker for next query tag.
     */
    let syncTreeNextQueryTag_ = 1;
    /**
     * SyncTree is the central class for managing event callback registration, data caching, views
     * (query processing), and event generation.  There are typically two SyncTree instances for
     * each Repo, one for the normal Firebase data, and one for the .info data.
     *
     * It has a number of responsibilities, including:
     *  - Tracking all user event callbacks (registered via addEventRegistration() and removeEventRegistration()).
     *  - Applying and caching data changes for user set(), transaction(), and update() calls
     *    (applyUserOverwrite(), applyUserMerge()).
     *  - Applying and caching data changes for server data changes (applyServerOverwrite(),
     *    applyServerMerge()).
     *  - Generating user-facing events for server and user changes (all of the apply* methods
     *    return the set of events that need to be raised as a result).
     *  - Maintaining the appropriate set of server listens to ensure we are always subscribed
     *    to the correct set of paths and queries to satisfy the current set of user event
     *    callbacks (listens are started/stopped using the provided listenProvider).
     *
     * NOTE: Although SyncTree tracks event callbacks and calculates events to raise, the actual
     * events are returned to the caller rather than raised synchronously.
     *
     */
    class SyncTree {
        /**
         * @param listenProvider_ - Used by SyncTree to start / stop listening
         *   to server data.
         */
        constructor(listenProvider_) {
            this.listenProvider_ = listenProvider_;
            /**
             * Tree of SyncPoints.  There's a SyncPoint at any location that has 1 or more views.
             */
            this.syncPointTree_ = new ImmutableTree(null);
            /**
             * A tree of all pending user writes (user-initiated set()'s, transaction()'s, update()'s, etc.).
             */
            this.pendingWriteTree_ = newWriteTree();
            this.tagToQueryMap = new Map();
            this.queryToTagMap = new Map();
        }
    }
    /**
     * Apply the data changes for a user-generated set() or transaction() call.
     *
     * @returns Events to raise.
     */
    function syncTreeApplyUserOverwrite(syncTree, path, newData, writeId, visible) {
        // Record pending write.
        writeTreeAddOverwrite(syncTree.pendingWriteTree_, path, newData, writeId, visible);
        if (!visible) {
            return [];
        }
        else {
            return syncTreeApplyOperationToSyncPoints_(syncTree, new Overwrite(newOperationSourceUser(), path, newData));
        }
    }
    /**
     * Apply the data from a user-generated update() call
     *
     * @returns Events to raise.
     */
    function syncTreeApplyUserMerge(syncTree, path, changedChildren, writeId) {
        // Record pending merge.
        writeTreeAddMerge(syncTree.pendingWriteTree_, path, changedChildren, writeId);
        const changeTree = ImmutableTree.fromObject(changedChildren);
        return syncTreeApplyOperationToSyncPoints_(syncTree, new Merge(newOperationSourceUser(), path, changeTree));
    }
    /**
     * Acknowledge a pending user write that was previously registered with applyUserOverwrite() or applyUserMerge().
     *
     * @param revert - True if the given write failed and needs to be reverted
     * @returns Events to raise.
     */
    function syncTreeAckUserWrite(syncTree, writeId, revert = false) {
        const write = writeTreeGetWrite(syncTree.pendingWriteTree_, writeId);
        const needToReevaluate = writeTreeRemoveWrite(syncTree.pendingWriteTree_, writeId);
        if (!needToReevaluate) {
            return [];
        }
        else {
            let affectedTree = new ImmutableTree(null);
            if (write.snap != null) {
                // overwrite
                affectedTree = affectedTree.set(newEmptyPath(), true);
            }
            else {
                each(write.children, (pathString) => {
                    affectedTree = affectedTree.set(new Path(pathString), true);
                });
            }
            return syncTreeApplyOperationToSyncPoints_(syncTree, new AckUserWrite(write.path, affectedTree, revert));
        }
    }
    /**
     * Apply new server data for the specified path..
     *
     * @returns Events to raise.
     */
    function syncTreeApplyServerOverwrite(syncTree, path, newData) {
        return syncTreeApplyOperationToSyncPoints_(syncTree, new Overwrite(newOperationSourceServer(), path, newData));
    }
    /**
     * Apply new server data to be merged in at the specified path.
     *
     * @returns Events to raise.
     */
    function syncTreeApplyServerMerge(syncTree, path, changedChildren) {
        const changeTree = ImmutableTree.fromObject(changedChildren);
        return syncTreeApplyOperationToSyncPoints_(syncTree, new Merge(newOperationSourceServer(), path, changeTree));
    }
    /**
     * Apply a listen complete for a query
     *
     * @returns Events to raise.
     */
    function syncTreeApplyListenComplete(syncTree, path) {
        return syncTreeApplyOperationToSyncPoints_(syncTree, new ListenComplete(newOperationSourceServer(), path));
    }
    /**
     * Apply a listen complete for a tagged query
     *
     * @returns Events to raise.
     */
    function syncTreeApplyTaggedListenComplete(syncTree, path, tag) {
        const queryKey = syncTreeQueryKeyForTag_(syncTree, tag);
        if (queryKey) {
            const r = syncTreeParseQueryKey_(queryKey);
            const queryPath = r.path, queryId = r.queryId;
            const relativePath = newRelativePath(queryPath, path);
            const op = new ListenComplete(newOperationSourceServerTaggedQuery(queryId), relativePath);
            return syncTreeApplyTaggedOperation_(syncTree, queryPath, op);
        }
        else {
            // We've already removed the query. No big deal, ignore the update
            return [];
        }
    }
    /**
     * Remove event callback(s).
     *
     * If query is the default query, we'll check all queries for the specified eventRegistration.
     * If eventRegistration is null, we'll remove all callbacks for the specified query/queries.
     *
     * @param eventRegistration - If null, all callbacks are removed.
     * @param cancelError - If a cancelError is provided, appropriate cancel events will be returned.
     * @returns Cancel events, if cancelError was provided.
     */
    function syncTreeRemoveEventRegistration(syncTree, query, eventRegistration, cancelError) {
        // Find the syncPoint first. Then deal with whether or not it has matching listeners
        const path = query._path;
        const maybeSyncPoint = syncTree.syncPointTree_.get(path);
        let cancelEvents = [];
        // A removal on a default query affects all queries at that location. A removal on an indexed query, even one without
        // other query constraints, does *not* affect all queries at that location. So this check must be for 'default', and
        // not loadsAllData().
        if (maybeSyncPoint &&
            (query._queryIdentifier === 'default' ||
                syncPointViewExistsForQuery(maybeSyncPoint, query))) {
            const removedAndEvents = syncPointRemoveEventRegistration(maybeSyncPoint, query, eventRegistration, cancelError);
            if (syncPointIsEmpty(maybeSyncPoint)) {
                syncTree.syncPointTree_ = syncTree.syncPointTree_.remove(path);
            }
            const removed = removedAndEvents.removed;
            cancelEvents = removedAndEvents.events;
            // We may have just removed one of many listeners and can short-circuit this whole process
            // We may also not have removed a default listener, in which case all of the descendant listeners should already be
            // properly set up.
            //
            // Since indexed queries can shadow if they don't have other query constraints, check for loadsAllData(), instead of
            // queryId === 'default'
            const removingDefault = -1 !==
                removed.findIndex(query => {
                    return query._queryParams.loadsAllData();
                });
            const covered = syncTree.syncPointTree_.findOnPath(path, (relativePath, parentSyncPoint) => syncPointHasCompleteView(parentSyncPoint));
            if (removingDefault && !covered) {
                const subtree = syncTree.syncPointTree_.subtree(path);
                // There are potentially child listeners. Determine what if any listens we need to send before executing the
                // removal
                if (!subtree.isEmpty()) {
                    // We need to fold over our subtree and collect the listeners to send
                    const newViews = syncTreeCollectDistinctViewsForSubTree_(subtree);
                    // Ok, we've collected all the listens we need. Set them up.
                    for (let i = 0; i < newViews.length; ++i) {
                        const view = newViews[i], newQuery = view.query;
                        const listener = syncTreeCreateListenerForView_(syncTree, view);
                        syncTree.listenProvider_.startListening(syncTreeQueryForListening_(newQuery), syncTreeTagForQuery_(syncTree, newQuery), listener.hashFn, listener.onComplete);
                    }
                }
            }
            // If we removed anything and we're not covered by a higher up listen, we need to stop listening on this query
            // The above block has us covered in terms of making sure we're set up on listens lower in the tree.
            // Also, note that if we have a cancelError, it's already been removed at the provider level.
            if (!covered && removed.length > 0 && !cancelError) {
                // If we removed a default, then we weren't listening on any of the other queries here. Just cancel the one
                // default. Otherwise, we need to iterate through and cancel each individual query
                if (removingDefault) {
                    // We don't tag default listeners
                    const defaultTag = null;
                    syncTree.listenProvider_.stopListening(syncTreeQueryForListening_(query), defaultTag);
                }
                else {
                    removed.forEach((queryToRemove) => {
                        const tagToRemove = syncTree.queryToTagMap.get(syncTreeMakeQueryKey_(queryToRemove));
                        syncTree.listenProvider_.stopListening(syncTreeQueryForListening_(queryToRemove), tagToRemove);
                    });
                }
            }
            // Now, clear all of the tags we're tracking for the removed listens
            syncTreeRemoveTags_(syncTree, removed);
        }
        return cancelEvents;
    }
    /**
     * Apply new server data for the specified tagged query.
     *
     * @returns Events to raise.
     */
    function syncTreeApplyTaggedQueryOverwrite(syncTree, path, snap, tag) {
        const queryKey = syncTreeQueryKeyForTag_(syncTree, tag);
        if (queryKey != null) {
            const r = syncTreeParseQueryKey_(queryKey);
            const queryPath = r.path, queryId = r.queryId;
            const relativePath = newRelativePath(queryPath, path);
            const op = new Overwrite(newOperationSourceServerTaggedQuery(queryId), relativePath, snap);
            return syncTreeApplyTaggedOperation_(syncTree, queryPath, op);
        }
        else {
            // Query must have been removed already
            return [];
        }
    }
    /**
     * Apply server data to be merged in for the specified tagged query.
     *
     * @returns Events to raise.
     */
    function syncTreeApplyTaggedQueryMerge(syncTree, path, changedChildren, tag) {
        const queryKey = syncTreeQueryKeyForTag_(syncTree, tag);
        if (queryKey) {
            const r = syncTreeParseQueryKey_(queryKey);
            const queryPath = r.path, queryId = r.queryId;
            const relativePath = newRelativePath(queryPath, path);
            const changeTree = ImmutableTree.fromObject(changedChildren);
            const op = new Merge(newOperationSourceServerTaggedQuery(queryId), relativePath, changeTree);
            return syncTreeApplyTaggedOperation_(syncTree, queryPath, op);
        }
        else {
            // We've already removed the query. No big deal, ignore the update
            return [];
        }
    }
    /**
     * Add an event callback for the specified query.
     *
     * @returns Events to raise.
     */
    function syncTreeAddEventRegistration(syncTree, query, eventRegistration) {
        const path = query._path;
        let serverCache = null;
        let foundAncestorDefaultView = false;
        // Any covering writes will necessarily be at the root, so really all we need to find is the server cache.
        // Consider optimizing this once there's a better understanding of what actual behavior will be.
        syncTree.syncPointTree_.foreachOnPath(path, (pathToSyncPoint, sp) => {
            const relativePath = newRelativePath(pathToSyncPoint, path);
            serverCache =
                serverCache || syncPointGetCompleteServerCache(sp, relativePath);
            foundAncestorDefaultView =
                foundAncestorDefaultView || syncPointHasCompleteView(sp);
        });
        let syncPoint = syncTree.syncPointTree_.get(path);
        if (!syncPoint) {
            syncPoint = new SyncPoint();
            syncTree.syncPointTree_ = syncTree.syncPointTree_.set(path, syncPoint);
        }
        else {
            foundAncestorDefaultView =
                foundAncestorDefaultView || syncPointHasCompleteView(syncPoint);
            serverCache =
                serverCache || syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
        }
        let serverCacheComplete;
        if (serverCache != null) {
            serverCacheComplete = true;
        }
        else {
            serverCacheComplete = false;
            serverCache = ChildrenNode.EMPTY_NODE;
            const subtree = syncTree.syncPointTree_.subtree(path);
            subtree.foreachChild((childName, childSyncPoint) => {
                const completeCache = syncPointGetCompleteServerCache(childSyncPoint, newEmptyPath());
                if (completeCache) {
                    serverCache = serverCache.updateImmediateChild(childName, completeCache);
                }
            });
        }
        const viewAlreadyExists = syncPointViewExistsForQuery(syncPoint, query);
        if (!viewAlreadyExists && !query._queryParams.loadsAllData()) {
            // We need to track a tag for this query
            const queryKey = syncTreeMakeQueryKey_(query);
            assert(!syncTree.queryToTagMap.has(queryKey), 'View does not exist, but we have a tag');
            const tag = syncTreeGetNextQueryTag_();
            syncTree.queryToTagMap.set(queryKey, tag);
            syncTree.tagToQueryMap.set(tag, queryKey);
        }
        const writesCache = writeTreeChildWrites(syncTree.pendingWriteTree_, path);
        let events = syncPointAddEventRegistration(syncPoint, query, eventRegistration, writesCache, serverCache, serverCacheComplete);
        if (!viewAlreadyExists && !foundAncestorDefaultView) {
            const view = syncPointViewForQuery(syncPoint, query);
            events = events.concat(syncTreeSetupListener_(syncTree, query, view));
        }
        return events;
    }
    /**
     * Returns a complete cache, if we have one, of the data at a particular path. If the location does not have a
     * listener above it, we will get a false "null". This shouldn't be a problem because transactions will always
     * have a listener above, and atomic operations would correctly show a jitter of <increment value> ->
     *     <incremented total> as the write is applied locally and then acknowledged at the server.
     *
     * Note: this method will *include* hidden writes from transaction with applyLocally set to false.
     *
     * @param path - The path to the data we want
     * @param writeIdsToExclude - A specific set to be excluded
     */
    function syncTreeCalcCompleteEventCache(syncTree, path, writeIdsToExclude) {
        const includeHiddenSets = true;
        const writeTree = syncTree.pendingWriteTree_;
        const serverCache = syncTree.syncPointTree_.findOnPath(path, (pathSoFar, syncPoint) => {
            const relativePath = newRelativePath(pathSoFar, path);
            const serverCache = syncPointGetCompleteServerCache(syncPoint, relativePath);
            if (serverCache) {
                return serverCache;
            }
        });
        return writeTreeCalcCompleteEventCache(writeTree, path, serverCache, writeIdsToExclude, includeHiddenSets);
    }
    function syncTreeGetServerValue(syncTree, query) {
        const path = query._path;
        let serverCache = null;
        // Any covering writes will necessarily be at the root, so really all we need to find is the server cache.
        // Consider optimizing this once there's a better understanding of what actual behavior will be.
        syncTree.syncPointTree_.foreachOnPath(path, (pathToSyncPoint, sp) => {
            const relativePath = newRelativePath(pathToSyncPoint, path);
            serverCache =
                serverCache || syncPointGetCompleteServerCache(sp, relativePath);
        });
        let syncPoint = syncTree.syncPointTree_.get(path);
        if (!syncPoint) {
            syncPoint = new SyncPoint();
            syncTree.syncPointTree_ = syncTree.syncPointTree_.set(path, syncPoint);
        }
        else {
            serverCache =
                serverCache || syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
        }
        const serverCacheComplete = serverCache != null;
        const serverCacheNode = serverCacheComplete
            ? new CacheNode(serverCache, true, false)
            : null;
        const writesCache = writeTreeChildWrites(syncTree.pendingWriteTree_, query._path);
        const view = syncPointGetView(syncPoint, query, writesCache, serverCacheComplete ? serverCacheNode.getNode() : ChildrenNode.EMPTY_NODE, serverCacheComplete);
        return viewGetCompleteNode(view);
    }
    /**
     * A helper method that visits all descendant and ancestor SyncPoints, applying the operation.
     *
     * NOTES:
     * - Descendant SyncPoints will be visited first (since we raise events depth-first).
     *
     * - We call applyOperation() on each SyncPoint passing three things:
     *   1. A version of the Operation that has been made relative to the SyncPoint location.
     *   2. A WriteTreeRef of any writes we have cached at the SyncPoint location.
     *   3. A snapshot Node with cached server data, if we have it.
     *
     * - We concatenate all of the events returned by each SyncPoint and return the result.
     */
    function syncTreeApplyOperationToSyncPoints_(syncTree, operation) {
        return syncTreeApplyOperationHelper_(operation, syncTree.syncPointTree_, 
        /*serverCache=*/ null, writeTreeChildWrites(syncTree.pendingWriteTree_, newEmptyPath()));
    }
    /**
     * Recursive helper for applyOperationToSyncPoints_
     */
    function syncTreeApplyOperationHelper_(operation, syncPointTree, serverCache, writesCache) {
        if (pathIsEmpty(operation.path)) {
            return syncTreeApplyOperationDescendantsHelper_(operation, syncPointTree, serverCache, writesCache);
        }
        else {
            const syncPoint = syncPointTree.get(newEmptyPath());
            // If we don't have cached server data, see if we can get it from this SyncPoint.
            if (serverCache == null && syncPoint != null) {
                serverCache = syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
            }
            let events = [];
            const childName = pathGetFront(operation.path);
            const childOperation = operation.operationForChild(childName);
            const childTree = syncPointTree.children.get(childName);
            if (childTree && childOperation) {
                const childServerCache = serverCache
                    ? serverCache.getImmediateChild(childName)
                    : null;
                const childWritesCache = writeTreeRefChild(writesCache, childName);
                events = events.concat(syncTreeApplyOperationHelper_(childOperation, childTree, childServerCache, childWritesCache));
            }
            if (syncPoint) {
                events = events.concat(syncPointApplyOperation(syncPoint, operation, writesCache, serverCache));
            }
            return events;
        }
    }
    /**
     * Recursive helper for applyOperationToSyncPoints_
     */
    function syncTreeApplyOperationDescendantsHelper_(operation, syncPointTree, serverCache, writesCache) {
        const syncPoint = syncPointTree.get(newEmptyPath());
        // If we don't have cached server data, see if we can get it from this SyncPoint.
        if (serverCache == null && syncPoint != null) {
            serverCache = syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
        }
        let events = [];
        syncPointTree.children.inorderTraversal((childName, childTree) => {
            const childServerCache = serverCache
                ? serverCache.getImmediateChild(childName)
                : null;
            const childWritesCache = writeTreeRefChild(writesCache, childName);
            const childOperation = operation.operationForChild(childName);
            if (childOperation) {
                events = events.concat(syncTreeApplyOperationDescendantsHelper_(childOperation, childTree, childServerCache, childWritesCache));
            }
        });
        if (syncPoint) {
            events = events.concat(syncPointApplyOperation(syncPoint, operation, writesCache, serverCache));
        }
        return events;
    }
    function syncTreeCreateListenerForView_(syncTree, view) {
        const query = view.query;
        const tag = syncTreeTagForQuery_(syncTree, query);
        return {
            hashFn: () => {
                const cache = viewGetServerCache(view) || ChildrenNode.EMPTY_NODE;
                return cache.hash();
            },
            onComplete: (status) => {
                if (status === 'ok') {
                    if (tag) {
                        return syncTreeApplyTaggedListenComplete(syncTree, query._path, tag);
                    }
                    else {
                        return syncTreeApplyListenComplete(syncTree, query._path);
                    }
                }
                else {
                    // If a listen failed, kill all of the listeners here, not just the one that triggered the error.
                    // Note that this may need to be scoped to just this listener if we change permissions on filtered children
                    const error = errorForServerCode(status, query);
                    return syncTreeRemoveEventRegistration(syncTree, query, 
                    /*eventRegistration*/ null, error);
                }
            }
        };
    }
    /**
     * Return the tag associated with the given query.
     */
    function syncTreeTagForQuery_(syncTree, query) {
        const queryKey = syncTreeMakeQueryKey_(query);
        return syncTree.queryToTagMap.get(queryKey);
    }
    /**
     * Given a query, computes a "queryKey" suitable for use in our queryToTagMap_.
     */
    function syncTreeMakeQueryKey_(query) {
        return query._path.toString() + '$' + query._queryIdentifier;
    }
    /**
     * Return the query associated with the given tag, if we have one
     */
    function syncTreeQueryKeyForTag_(syncTree, tag) {
        return syncTree.tagToQueryMap.get(tag);
    }
    /**
     * Given a queryKey (created by makeQueryKey), parse it back into a path and queryId.
     */
    function syncTreeParseQueryKey_(queryKey) {
        const splitIndex = queryKey.indexOf('$');
        assert(splitIndex !== -1 && splitIndex < queryKey.length - 1, 'Bad queryKey.');
        return {
            queryId: queryKey.substr(splitIndex + 1),
            path: new Path(queryKey.substr(0, splitIndex))
        };
    }
    /**
     * A helper method to apply tagged operations
     */
    function syncTreeApplyTaggedOperation_(syncTree, queryPath, operation) {
        const syncPoint = syncTree.syncPointTree_.get(queryPath);
        assert(syncPoint, "Missing sync point for query tag that we're tracking");
        const writesCache = writeTreeChildWrites(syncTree.pendingWriteTree_, queryPath);
        return syncPointApplyOperation(syncPoint, operation, writesCache, null);
    }
    /**
     * This collapses multiple unfiltered views into a single view, since we only need a single
     * listener for them.
     */
    function syncTreeCollectDistinctViewsForSubTree_(subtree) {
        return subtree.fold((relativePath, maybeChildSyncPoint, childMap) => {
            if (maybeChildSyncPoint && syncPointHasCompleteView(maybeChildSyncPoint)) {
                const completeView = syncPointGetCompleteView(maybeChildSyncPoint);
                return [completeView];
            }
            else {
                // No complete view here, flatten any deeper listens into an array
                let views = [];
                if (maybeChildSyncPoint) {
                    views = syncPointGetQueryViews(maybeChildSyncPoint);
                }
                each(childMap, (_key, childViews) => {
                    views = views.concat(childViews);
                });
                return views;
            }
        });
    }
    /**
     * Normalizes a query to a query we send the server for listening
     *
     * @returns The normalized query
     */
    function syncTreeQueryForListening_(query) {
        if (query._queryParams.loadsAllData() && !query._queryParams.isDefault()) {
            // We treat queries that load all data as default queries
            // Cast is necessary because ref() technically returns Firebase which is actually fb.api.Firebase which inherits
            // from Query
            return new (syncTreeGetReferenceConstructor())(query._repo, query._path);
        }
        else {
            return query;
        }
    }
    function syncTreeRemoveTags_(syncTree, queries) {
        for (let j = 0; j < queries.length; ++j) {
            const removedQuery = queries[j];
            if (!removedQuery._queryParams.loadsAllData()) {
                // We should have a tag for this
                const removedQueryKey = syncTreeMakeQueryKey_(removedQuery);
                const removedQueryTag = syncTree.queryToTagMap.get(removedQueryKey);
                syncTree.queryToTagMap.delete(removedQueryKey);
                syncTree.tagToQueryMap.delete(removedQueryTag);
            }
        }
    }
    /**
     * Static accessor for query tags.
     */
    function syncTreeGetNextQueryTag_() {
        return syncTreeNextQueryTag_++;
    }
    /**
     * For a given new listen, manage the de-duplication of outstanding subscriptions.
     *
     * @returns This method can return events to support synchronous data sources
     */
    function syncTreeSetupListener_(syncTree, query, view) {
        const path = query._path;
        const tag = syncTreeTagForQuery_(syncTree, query);
        const listener = syncTreeCreateListenerForView_(syncTree, view);
        const events = syncTree.listenProvider_.startListening(syncTreeQueryForListening_(query), tag, listener.hashFn, listener.onComplete);
        const subtree = syncTree.syncPointTree_.subtree(path);
        // The root of this subtree has our query. We're here because we definitely need to send a listen for that, but we
        // may need to shadow other listens as well.
        if (tag) {
            assert(!syncPointHasCompleteView(subtree.value), "If we're adding a query, it shouldn't be shadowed");
        }
        else {
            // Shadow everything at or below this location, this is a default listener.
            const queriesToStop = subtree.fold((relativePath, maybeChildSyncPoint, childMap) => {
                if (!pathIsEmpty(relativePath) &&
                    maybeChildSyncPoint &&
                    syncPointHasCompleteView(maybeChildSyncPoint)) {
                    return [syncPointGetCompleteView(maybeChildSyncPoint).query];
                }
                else {
                    // No default listener here, flatten any deeper queries into an array
                    let queries = [];
                    if (maybeChildSyncPoint) {
                        queries = queries.concat(syncPointGetQueryViews(maybeChildSyncPoint).map(view => view.query));
                    }
                    each(childMap, (_key, childQueries) => {
                        queries = queries.concat(childQueries);
                    });
                    return queries;
                }
            });
            for (let i = 0; i < queriesToStop.length; ++i) {
                const queryToStop = queriesToStop[i];
                syncTree.listenProvider_.stopListening(syncTreeQueryForListening_(queryToStop), syncTreeTagForQuery_(syncTree, queryToStop));
            }
        }
        return events;
    }

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
    class ExistingValueProvider {
        constructor(node_) {
            this.node_ = node_;
        }
        getImmediateChild(childName) {
            const child = this.node_.getImmediateChild(childName);
            return new ExistingValueProvider(child);
        }
        node() {
            return this.node_;
        }
    }
    class DeferredValueProvider {
        constructor(syncTree, path) {
            this.syncTree_ = syncTree;
            this.path_ = path;
        }
        getImmediateChild(childName) {
            const childPath = pathChild(this.path_, childName);
            return new DeferredValueProvider(this.syncTree_, childPath);
        }
        node() {
            return syncTreeCalcCompleteEventCache(this.syncTree_, this.path_);
        }
    }
    /**
     * Generate placeholders for deferred values.
     */
    const generateWithValues = function (values) {
        values = values || {};
        values['timestamp'] = values['timestamp'] || new Date().getTime();
        return values;
    };
    /**
     * Value to use when firing local events. When writing server values, fire
     * local events with an approximate value, otherwise return value as-is.
     */
    const resolveDeferredLeafValue = function (value, existingVal, serverValues) {
        if (!value || typeof value !== 'object') {
            return value;
        }
        assert('.sv' in value, 'Unexpected leaf node or priority contents');
        if (typeof value['.sv'] === 'string') {
            return resolveScalarDeferredValue(value['.sv'], existingVal, serverValues);
        }
        else if (typeof value['.sv'] === 'object') {
            return resolveComplexDeferredValue(value['.sv'], existingVal);
        }
        else {
            assert(false, 'Unexpected server value: ' + JSON.stringify(value, null, 2));
        }
    };
    const resolveScalarDeferredValue = function (op, existing, serverValues) {
        switch (op) {
            case 'timestamp':
                return serverValues['timestamp'];
            default:
                assert(false, 'Unexpected server value: ' + op);
        }
    };
    const resolveComplexDeferredValue = function (op, existing, unused) {
        if (!op.hasOwnProperty('increment')) {
            assert(false, 'Unexpected server value: ' + JSON.stringify(op, null, 2));
        }
        const delta = op['increment'];
        if (typeof delta !== 'number') {
            assert(false, 'Unexpected increment value: ' + delta);
        }
        const existingNode = existing.node();
        assert(existingNode !== null && typeof existingNode !== 'undefined', 'Expected ChildrenNode.EMPTY_NODE for nulls');
        // Incrementing a non-number sets the value to the incremented amount
        if (!existingNode.isLeafNode()) {
            return delta;
        }
        const leaf = existingNode;
        const existingVal = leaf.getValue();
        if (typeof existingVal !== 'number') {
            return delta;
        }
        // No need to do over/underflow arithmetic here because JS only handles floats under the covers
        return existingVal + delta;
    };
    /**
     * Recursively replace all deferred values and priorities in the tree with the
     * specified generated replacement values.
     * @param path - path to which write is relative
     * @param node - new data written at path
     * @param syncTree - current data
     */
    const resolveDeferredValueTree = function (path, node, syncTree, serverValues) {
        return resolveDeferredValue(node, new DeferredValueProvider(syncTree, path), serverValues);
    };
    /**
     * Recursively replace all deferred values and priorities in the node with the
     * specified generated replacement values.  If there are no server values in the node,
     * it'll be returned as-is.
     */
    const resolveDeferredValueSnapshot = function (node, existing, serverValues) {
        return resolveDeferredValue(node, new ExistingValueProvider(existing), serverValues);
    };
    function resolveDeferredValue(node, existingVal, serverValues) {
        const rawPri = node.getPriority().val();
        const priority = resolveDeferredLeafValue(rawPri, existingVal.getImmediateChild('.priority'), serverValues);
        let newNode;
        if (node.isLeafNode()) {
            const leafNode = node;
            const value = resolveDeferredLeafValue(leafNode.getValue(), existingVal, serverValues);
            if (value !== leafNode.getValue() ||
                priority !== leafNode.getPriority().val()) {
                return new LeafNode(value, nodeFromJSON(priority));
            }
            else {
                return node;
            }
        }
        else {
            const childrenNode = node;
            newNode = childrenNode;
            if (priority !== childrenNode.getPriority().val()) {
                newNode = newNode.updatePriority(new LeafNode(priority));
            }
            childrenNode.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
                const newChildNode = resolveDeferredValue(childNode, existingVal.getImmediateChild(childName), serverValues);
                if (newChildNode !== childNode) {
                    newNode = newNode.updateImmediateChild(childName, newChildNode);
                }
            });
            return newNode;
        }
    }

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
     * A light-weight tree, traversable by path.  Nodes can have both values and children.
     * Nodes are not enumerated (by forEachChild) unless they have a value or non-empty
     * children.
     */
    class Tree {
        /**
         * @param name - Optional name of the node.
         * @param parent - Optional parent node.
         * @param node - Optional node to wrap.
         */
        constructor(name = '', parent = null, node = { children: {}, childCount: 0 }) {
            this.name = name;
            this.parent = parent;
            this.node = node;
        }
    }
    /**
     * Returns a sub-Tree for the given path.
     *
     * @param pathObj - Path to look up.
     * @returns Tree for path.
     */
    function treeSubTree(tree, pathObj) {
        // TODO: Require pathObj to be Path?
        let path = pathObj instanceof Path ? pathObj : new Path(pathObj);
        let child = tree, next = pathGetFront(path);
        while (next !== null) {
            const childNode = safeGet(child.node.children, next) || {
                children: {},
                childCount: 0
            };
            child = new Tree(next, child, childNode);
            path = pathPopFront(path);
            next = pathGetFront(path);
        }
        return child;
    }
    /**
     * Returns the data associated with this tree node.
     *
     * @returns The data or null if no data exists.
     */
    function treeGetValue(tree) {
        return tree.node.value;
    }
    /**
     * Sets data to this tree node.
     *
     * @param value - Value to set.
     */
    function treeSetValue(tree, value) {
        tree.node.value = value;
        treeUpdateParents(tree);
    }
    /**
     * @returns Whether the tree has any children.
     */
    function treeHasChildren(tree) {
        return tree.node.childCount > 0;
    }
    /**
     * @returns Whethe rthe tree is empty (no value or children).
     */
    function treeIsEmpty(tree) {
        return treeGetValue(tree) === undefined && !treeHasChildren(tree);
    }
    /**
     * Calls action for each child of this tree node.
     *
     * @param action - Action to be called for each child.
     */
    function treeForEachChild(tree, action) {
        each(tree.node.children, (child, childTree) => {
            action(new Tree(child, tree, childTree));
        });
    }
    /**
     * Does a depth-first traversal of this node's descendants, calling action for each one.
     *
     * @param action - Action to be called for each child.
     * @param includeSelf - Whether to call action on this node as well. Defaults to
     *   false.
     * @param childrenFirst - Whether to call action on children before calling it on
     *   parent.
     */
    function treeForEachDescendant(tree, action, includeSelf, childrenFirst) {
        if (includeSelf && !childrenFirst) {
            action(tree);
        }
        treeForEachChild(tree, child => {
            treeForEachDescendant(child, action, true, childrenFirst);
        });
        if (includeSelf && childrenFirst) {
            action(tree);
        }
    }
    /**
     * Calls action on each ancestor node.
     *
     * @param action - Action to be called on each parent; return
     *   true to abort.
     * @param includeSelf - Whether to call action on this node as well.
     * @returns true if the action callback returned true.
     */
    function treeForEachAncestor(tree, action, includeSelf) {
        let node = includeSelf ? tree : tree.parent;
        while (node !== null) {
            if (action(node)) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }
    /**
     * @returns The path of this tree node, as a Path.
     */
    function treeGetPath(tree) {
        return new Path(tree.parent === null
            ? tree.name
            : treeGetPath(tree.parent) + '/' + tree.name);
    }
    /**
     * Adds or removes this child from its parent based on whether it's empty or not.
     */
    function treeUpdateParents(tree) {
        if (tree.parent !== null) {
            treeUpdateChild(tree.parent, tree.name, tree);
        }
    }
    /**
     * Adds or removes the passed child to this tree node, depending on whether it's empty.
     *
     * @param childName - The name of the child to update.
     * @param child - The child to update.
     */
    function treeUpdateChild(tree, childName, child) {
        const childEmpty = treeIsEmpty(child);
        const childExists = contains(tree.node.children, childName);
        if (childEmpty && childExists) {
            delete tree.node.children[childName];
            tree.node.childCount--;
            treeUpdateParents(tree);
        }
        else if (!childEmpty && !childExists) {
            tree.node.children[childName] = child.node;
            tree.node.childCount++;
            treeUpdateParents(tree);
        }
    }

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
     * True for invalid Firebase keys
     */
    const INVALID_KEY_REGEX_ = /[\[\].#$\/\u0000-\u001F\u007F]/;
    /**
     * True for invalid Firebase paths.
     * Allows '/' in paths.
     */
    const INVALID_PATH_REGEX_ = /[\[\].#$\u0000-\u001F\u007F]/;
    /**
     * Maximum number of characters to allow in leaf value
     */
    const MAX_LEAF_SIZE_ = 10 * 1024 * 1024;
    const isValidKey = function (key) {
        return (typeof key === 'string' && key.length !== 0 && !INVALID_KEY_REGEX_.test(key));
    };
    const isValidPathString = function (pathString) {
        return (typeof pathString === 'string' &&
            pathString.length !== 0 &&
            !INVALID_PATH_REGEX_.test(pathString));
    };
    const isValidRootPathString = function (pathString) {
        if (pathString) {
            // Allow '/.info/' at the beginning.
            pathString = pathString.replace(/^\/*\.info(\/|$)/, '/');
        }
        return isValidPathString(pathString);
    };
    const isValidPriority = function (priority) {
        return (priority === null ||
            typeof priority === 'string' ||
            (typeof priority === 'number' && !isInvalidJSONNumber(priority)) ||
            (priority &&
                typeof priority === 'object' &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                contains(priority, '.sv')));
    };
    /**
     * Validate a data object client-side before sending to server.
     */
    const validateFirebaseData = function (errorPrefix, data, path_) {
        const path = path_ instanceof Path ? new ValidationPath(path_, errorPrefix) : path_;
        if (data === undefined) {
            throw new Error(errorPrefix + 'contains undefined ' + validationPathToErrorString(path));
        }
        if (typeof data === 'function') {
            throw new Error(errorPrefix +
                'contains a function ' +
                validationPathToErrorString(path) +
                ' with contents = ' +
                data.toString());
        }
        if (isInvalidJSONNumber(data)) {
            throw new Error(errorPrefix +
                'contains ' +
                data.toString() +
                ' ' +
                validationPathToErrorString(path));
        }
        // Check max leaf size, but try to avoid the utf8 conversion if we can.
        if (typeof data === 'string' &&
            data.length > MAX_LEAF_SIZE_ / 3 &&
            stringLength(data) > MAX_LEAF_SIZE_) {
            throw new Error(errorPrefix +
                'contains a string greater than ' +
                MAX_LEAF_SIZE_ +
                ' utf8 bytes ' +
                validationPathToErrorString(path) +
                " ('" +
                data.substring(0, 50) +
                "...')");
        }
        // TODO = Perf = Consider combining the recursive validation of keys into NodeFromJSON
        // to save extra walking of large objects.
        if (data && typeof data === 'object') {
            let hasDotValue = false;
            let hasActualChild = false;
            each(data, (key, value) => {
                if (key === '.value') {
                    hasDotValue = true;
                }
                else if (key !== '.priority' && key !== '.sv') {
                    hasActualChild = true;
                    if (!isValidKey(key)) {
                        throw new Error(errorPrefix +
                            ' contains an invalid key (' +
                            key +
                            ') ' +
                            validationPathToErrorString(path) +
                            '.  Keys must be non-empty strings ' +
                            'and can\'t contain ".", "#", "$", "/", "[", or "]"');
                    }
                }
                validationPathPush(path, key);
                validateFirebaseData(errorPrefix, value, path);
                validationPathPop(path);
            });
            if (hasDotValue && hasActualChild) {
                throw new Error(errorPrefix +
                    ' contains ".value" child ' +
                    validationPathToErrorString(path) +
                    ' in addition to actual children.');
            }
        }
    };
    /**
     * Pre-validate paths passed in the firebase function.
     */
    const validateFirebaseMergePaths = function (errorPrefix, mergePaths) {
        let i, curPath;
        for (i = 0; i < mergePaths.length; i++) {
            curPath = mergePaths[i];
            const keys = pathSlice(curPath);
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] === '.priority' && j === keys.length - 1) ;
                else if (!isValidKey(keys[j])) {
                    throw new Error(errorPrefix +
                        'contains an invalid key (' +
                        keys[j] +
                        ') in path ' +
                        curPath.toString() +
                        '. Keys must be non-empty strings ' +
                        'and can\'t contain ".", "#", "$", "/", "[", or "]"');
                }
            }
        }
        // Check that update keys are not descendants of each other.
        // We rely on the property that sorting guarantees that ancestors come
        // right before descendants.
        mergePaths.sort(pathCompare);
        let prevPath = null;
        for (i = 0; i < mergePaths.length; i++) {
            curPath = mergePaths[i];
            if (prevPath !== null && pathContains(prevPath, curPath)) {
                throw new Error(errorPrefix +
                    'contains a path ' +
                    prevPath.toString() +
                    ' that is ancestor of another path ' +
                    curPath.toString());
            }
            prevPath = curPath;
        }
    };
    /**
     * pre-validate an object passed as an argument to firebase function (
     * must be an object - e.g. for firebase.update()).
     */
    const validateFirebaseMergeDataArg = function (fnName, data, path, optional) {
        if (optional && data === undefined) {
            return;
        }
        const errorPrefix$1 = errorPrefix(fnName, 'values');
        if (!(data && typeof data === 'object') || Array.isArray(data)) {
            throw new Error(errorPrefix$1 + ' must be an object containing the children to replace.');
        }
        const mergePaths = [];
        each(data, (key, value) => {
            const curPath = new Path(key);
            validateFirebaseData(errorPrefix$1, value, pathChild(path, curPath));
            if (pathGetBack(curPath) === '.priority') {
                if (!isValidPriority(value)) {
                    throw new Error(errorPrefix$1 +
                        "contains an invalid value for '" +
                        curPath.toString() +
                        "', which must be a valid " +
                        'Firebase priority (a string, finite number, server value, or null).');
                }
            }
            mergePaths.push(curPath);
        });
        validateFirebaseMergePaths(errorPrefix$1, mergePaths);
    };
    /**
     * @internal
     */
    const validatePathString = function (fnName, argumentName, pathString, optional) {
        if (optional && pathString === undefined) {
            return;
        }
        if (!isValidPathString(pathString)) {
            throw new Error(errorPrefix(fnName, argumentName) +
                'was an invalid path = "' +
                pathString +
                '". Paths must be non-empty strings and ' +
                'can\'t contain ".", "#", "$", "[", or "]"');
        }
    };
    const validateRootPathString = function (fnName, argumentName, pathString, optional) {
        if (pathString) {
            // Allow '/.info/' at the beginning.
            pathString = pathString.replace(/^\/*\.info(\/|$)/, '/');
        }
        validatePathString(fnName, argumentName, pathString, optional);
    };
    const validateUrl = function (fnName, parsedUrl) {
        // TODO = Validate server better.
        const pathString = parsedUrl.path.toString();
        if (!(typeof parsedUrl.repoInfo.host === 'string') ||
            parsedUrl.repoInfo.host.length === 0 ||
            (!isValidKey(parsedUrl.repoInfo.namespace) &&
                parsedUrl.repoInfo.host.split(':')[0] !== 'localhost') ||
            (pathString.length !== 0 && !isValidRootPathString(pathString))) {
            throw new Error(errorPrefix(fnName, 'url') +
                'must be a valid firebase URL and ' +
                'the path can\'t contain ".", "#", "$", "[", or "]".');
        }
    };

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
     * The event queue serves a few purposes:
     * 1. It ensures we maintain event order in the face of event callbacks doing operations that result in more
     *    events being queued.
     * 2. raiseQueuedEvents() handles being called reentrantly nicely.  That is, if in the course of raising events,
     *    raiseQueuedEvents() is called again, the "inner" call will pick up raising events where the "outer" call
     *    left off, ensuring that the events are still raised synchronously and in order.
     * 3. You can use raiseEventsAtPath and raiseEventsForChangedPath to ensure only relevant previously-queued
     *    events are raised synchronously.
     *
     * NOTE: This can all go away if/when we move to async events.
     *
     */
    class EventQueue {
        constructor() {
            this.eventLists_ = [];
            /**
             * Tracks recursion depth of raiseQueuedEvents_, for debugging purposes.
             */
            this.recursionDepth_ = 0;
        }
    }
    /**
     * @param eventDataList - The new events to queue.
     */
    function eventQueueQueueEvents(eventQueue, eventDataList) {
        // We group events by path, storing them in a single EventList, to make it easier to skip over them quickly.
        let currList = null;
        for (let i = 0; i < eventDataList.length; i++) {
            const data = eventDataList[i];
            const path = data.getPath();
            if (currList !== null && !pathEquals(path, currList.path)) {
                eventQueue.eventLists_.push(currList);
                currList = null;
            }
            if (currList === null) {
                currList = { events: [], path };
            }
            currList.events.push(data);
        }
        if (currList) {
            eventQueue.eventLists_.push(currList);
        }
    }
    /**
     * Queues the specified events and synchronously raises all events (including previously queued ones)
     * for the specified path.
     *
     * It is assumed that the new events are all for the specified path.
     *
     * @param path - The path to raise events for.
     * @param eventDataList - The new events to raise.
     */
    function eventQueueRaiseEventsAtPath(eventQueue, path, eventDataList) {
        eventQueueQueueEvents(eventQueue, eventDataList);
        eventQueueRaiseQueuedEventsMatchingPredicate(eventQueue, eventPath => pathEquals(eventPath, path));
    }
    /**
     * Queues the specified events and synchronously raises all events (including previously queued ones) for
     * locations related to the specified change path (i.e. all ancestors and descendants).
     *
     * It is assumed that the new events are all related (ancestor or descendant) to the specified path.
     *
     * @param changedPath - The path to raise events for.
     * @param eventDataList - The events to raise
     */
    function eventQueueRaiseEventsForChangedPath(eventQueue, changedPath, eventDataList) {
        eventQueueQueueEvents(eventQueue, eventDataList);
        eventQueueRaiseQueuedEventsMatchingPredicate(eventQueue, eventPath => pathContains(eventPath, changedPath) ||
            pathContains(changedPath, eventPath));
    }
    function eventQueueRaiseQueuedEventsMatchingPredicate(eventQueue, predicate) {
        eventQueue.recursionDepth_++;
        let sentAll = true;
        for (let i = 0; i < eventQueue.eventLists_.length; i++) {
            const eventList = eventQueue.eventLists_[i];
            if (eventList) {
                const eventPath = eventList.path;
                if (predicate(eventPath)) {
                    eventListRaise(eventQueue.eventLists_[i]);
                    eventQueue.eventLists_[i] = null;
                }
                else {
                    sentAll = false;
                }
            }
        }
        if (sentAll) {
            eventQueue.eventLists_ = [];
        }
        eventQueue.recursionDepth_--;
    }
    /**
     * Iterates through the list and raises each event
     */
    function eventListRaise(eventList) {
        for (let i = 0; i < eventList.events.length; i++) {
            const eventData = eventList.events[i];
            if (eventData !== null) {
                eventList.events[i] = null;
                const eventFn = eventData.getEventRunner();
                if (logger) {
                    log('event: ' + eventData.toString());
                }
                exceptionGuard(eventFn);
            }
        }
    }

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
    const INTERRUPT_REASON = 'repo_interrupt';
    /**
     * If a transaction does not succeed after 25 retries, we abort it. Among other
     * things this ensure that if there's ever a bug causing a mismatch between
     * client / server hashes for some data, we won't retry indefinitely.
     */
    const MAX_TRANSACTION_RETRIES = 25;
    /**
     * A connection to a single data repository.
     */
    class Repo {
        constructor(repoInfo_, forceRestClient_, authTokenProvider_, appCheckProvider_) {
            this.repoInfo_ = repoInfo_;
            this.forceRestClient_ = forceRestClient_;
            this.authTokenProvider_ = authTokenProvider_;
            this.appCheckProvider_ = appCheckProvider_;
            this.dataUpdateCount = 0;
            this.statsListener_ = null;
            this.eventQueue_ = new EventQueue();
            this.nextWriteId_ = 1;
            this.interceptServerDataCallback_ = null;
            /** A list of data pieces and paths to be set when this client disconnects. */
            this.onDisconnect_ = newSparseSnapshotTree();
            /** Stores queues of outstanding transactions for Firebase locations. */
            this.transactionQueueTree_ = new Tree();
            // TODO: This should be @private but it's used by test_access.js and internal.js
            this.persistentConnection_ = null;
            // This key is intentionally not updated if RepoInfo is later changed or replaced
            this.key = this.repoInfo_.toURLString();
        }
        /**
         * @returns The URL corresponding to the root of this Firebase.
         */
        toString() {
            return ((this.repoInfo_.secure ? 'https://' : 'http://') + this.repoInfo_.host);
        }
    }
    function repoStart(repo, appId, authOverride) {
        repo.stats_ = statsManagerGetCollection(repo.repoInfo_);
        if (repo.forceRestClient_ || beingCrawled()) {
            repo.server_ = new ReadonlyRestClient(repo.repoInfo_, (pathString, data, isMerge, tag) => {
                repoOnDataUpdate(repo, pathString, data, isMerge, tag);
            }, repo.authTokenProvider_, repo.appCheckProvider_);
            // Minor hack: Fire onConnect immediately, since there's no actual connection.
            setTimeout(() => repoOnConnectStatus(repo, /* connectStatus= */ true), 0);
        }
        else {
            // Validate authOverride
            if (typeof authOverride !== 'undefined' && authOverride !== null) {
                if (typeof authOverride !== 'object') {
                    throw new Error('Only objects are supported for option databaseAuthVariableOverride');
                }
                try {
                    stringify(authOverride);
                }
                catch (e) {
                    throw new Error('Invalid authOverride provided: ' + e);
                }
            }
            repo.persistentConnection_ = new PersistentConnection(repo.repoInfo_, appId, (pathString, data, isMerge, tag) => {
                repoOnDataUpdate(repo, pathString, data, isMerge, tag);
            }, (connectStatus) => {
                repoOnConnectStatus(repo, connectStatus);
            }, (updates) => {
                repoOnServerInfoUpdate(repo, updates);
            }, repo.authTokenProvider_, repo.appCheckProvider_, authOverride);
            repo.server_ = repo.persistentConnection_;
        }
        repo.authTokenProvider_.addTokenChangeListener(token => {
            repo.server_.refreshAuthToken(token);
        });
        repo.appCheckProvider_.addTokenChangeListener(result => {
            repo.server_.refreshAppCheckToken(result.token);
        });
        // In the case of multiple Repos for the same repoInfo (i.e. there are multiple Firebase.Contexts being used),
        // we only want to create one StatsReporter.  As such, we'll report stats over the first Repo created.
        repo.statsReporter_ = statsManagerGetOrCreateReporter(repo.repoInfo_, () => new StatsReporter(repo.stats_, repo.server_));
        // Used for .info.
        repo.infoData_ = new SnapshotHolder();
        repo.infoSyncTree_ = new SyncTree({
            startListening: (query, tag, currentHashFn, onComplete) => {
                let infoEvents = [];
                const node = repo.infoData_.getNode(query._path);
                // This is possibly a hack, but we have different semantics for .info endpoints. We don't raise null events
                // on initial data...
                if (!node.isEmpty()) {
                    infoEvents = syncTreeApplyServerOverwrite(repo.infoSyncTree_, query._path, node);
                    setTimeout(() => {
                        onComplete('ok');
                    }, 0);
                }
                return infoEvents;
            },
            stopListening: () => { }
        });
        repoUpdateInfo(repo, 'connected', false);
        repo.serverSyncTree_ = new SyncTree({
            startListening: (query, tag, currentHashFn, onComplete) => {
                repo.server_.listen(query, currentHashFn, tag, (status, data) => {
                    const events = onComplete(status, data);
                    eventQueueRaiseEventsForChangedPath(repo.eventQueue_, query._path, events);
                });
                // No synchronous events for network-backed sync trees
                return [];
            },
            stopListening: (query, tag) => {
                repo.server_.unlisten(query, tag);
            }
        });
    }
    /**
     * @returns The time in milliseconds, taking the server offset into account if we have one.
     */
    function repoServerTime(repo) {
        const offsetNode = repo.infoData_.getNode(new Path('.info/serverTimeOffset'));
        const offset = offsetNode.val() || 0;
        return new Date().getTime() + offset;
    }
    /**
     * Generate ServerValues using some variables from the repo object.
     */
    function repoGenerateServerValues(repo) {
        return generateWithValues({
            timestamp: repoServerTime(repo)
        });
    }
    /**
     * Called by realtime when we get new messages from the server.
     */
    function repoOnDataUpdate(repo, pathString, data, isMerge, tag) {
        // For testing.
        repo.dataUpdateCount++;
        const path = new Path(pathString);
        data = repo.interceptServerDataCallback_
            ? repo.interceptServerDataCallback_(pathString, data)
            : data;
        let events = [];
        if (tag) {
            if (isMerge) {
                const taggedChildren = map(data, (raw) => nodeFromJSON(raw));
                events = syncTreeApplyTaggedQueryMerge(repo.serverSyncTree_, path, taggedChildren, tag);
            }
            else {
                const taggedSnap = nodeFromJSON(data);
                events = syncTreeApplyTaggedQueryOverwrite(repo.serverSyncTree_, path, taggedSnap, tag);
            }
        }
        else if (isMerge) {
            const changedChildren = map(data, (raw) => nodeFromJSON(raw));
            events = syncTreeApplyServerMerge(repo.serverSyncTree_, path, changedChildren);
        }
        else {
            const snap = nodeFromJSON(data);
            events = syncTreeApplyServerOverwrite(repo.serverSyncTree_, path, snap);
        }
        let affectedPath = path;
        if (events.length > 0) {
            // Since we have a listener outstanding for each transaction, receiving any events
            // is a proxy for some change having occurred.
            affectedPath = repoRerunTransactions(repo, path);
        }
        eventQueueRaiseEventsForChangedPath(repo.eventQueue_, affectedPath, events);
    }
    function repoOnConnectStatus(repo, connectStatus) {
        repoUpdateInfo(repo, 'connected', connectStatus);
        if (connectStatus === false) {
            repoRunOnDisconnectEvents(repo);
        }
    }
    function repoOnServerInfoUpdate(repo, updates) {
        each(updates, (key, value) => {
            repoUpdateInfo(repo, key, value);
        });
    }
    function repoUpdateInfo(repo, pathString, value) {
        const path = new Path('/.info/' + pathString);
        const newNode = nodeFromJSON(value);
        repo.infoData_.updateSnapshot(path, newNode);
        const events = syncTreeApplyServerOverwrite(repo.infoSyncTree_, path, newNode);
        eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
    }
    function repoGetNextWriteId(repo) {
        return repo.nextWriteId_++;
    }
    /**
     * The purpose of `getValue` is to return the latest known value
     * satisfying `query`.
     *
     * This method will first check for in-memory cached values
     * belonging to active listeners. If they are found, such values
     * are considered to be the most up-to-date.
     *
     * If the client is not connected, this method will try to
     * establish a connection and request the value for `query`. If
     * the client is not able to retrieve the query result, it reports
     * an error.
     *
     * @param query - The query to surface a value for.
     */
    function repoGetValue(repo, query) {
        // Only active queries are cached. There is no persisted cache.
        const cached = syncTreeGetServerValue(repo.serverSyncTree_, query);
        if (cached != null) {
            return Promise.resolve(cached);
        }
        return repo.server_.get(query).then(payload => {
            const node = nodeFromJSON(payload).withIndex(query._queryParams.getIndex());
            const events = syncTreeApplyServerOverwrite(repo.serverSyncTree_, query._path, node);
            eventQueueRaiseEventsAtPath(repo.eventQueue_, query._path, events);
            return Promise.resolve(node);
        }, err => {
            repoLog(repo, 'get for query ' + stringify(query) + ' failed: ' + err);
            return Promise.reject(new Error(err));
        });
    }
    function repoUpdate(repo, path, childrenToMerge, onComplete) {
        repoLog(repo, 'update', { path: path.toString(), value: childrenToMerge });
        // Start with our existing data and merge each child into it.
        let empty = true;
        const serverValues = repoGenerateServerValues(repo);
        const changedChildren = {};
        each(childrenToMerge, (changedKey, changedValue) => {
            empty = false;
            changedChildren[changedKey] = resolveDeferredValueTree(pathChild(path, changedKey), nodeFromJSON(changedValue), repo.serverSyncTree_, serverValues);
        });
        if (!empty) {
            const writeId = repoGetNextWriteId(repo);
            const events = syncTreeApplyUserMerge(repo.serverSyncTree_, path, changedChildren, writeId);
            eventQueueQueueEvents(repo.eventQueue_, events);
            repo.server_.merge(path.toString(), childrenToMerge, (status, errorReason) => {
                const success = status === 'ok';
                if (!success) {
                    warn('update at ' + path + ' failed: ' + status);
                }
                const clearEvents = syncTreeAckUserWrite(repo.serverSyncTree_, writeId, !success);
                const affectedPath = clearEvents.length > 0 ? repoRerunTransactions(repo, path) : path;
                eventQueueRaiseEventsForChangedPath(repo.eventQueue_, affectedPath, clearEvents);
                repoCallOnCompleteCallback(repo, onComplete, status, errorReason);
            });
            each(childrenToMerge, (changedPath) => {
                const affectedPath = repoAbortTransactions(repo, pathChild(path, changedPath));
                repoRerunTransactions(repo, affectedPath);
            });
            // We queued the events above, so just flush the queue here
            eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, []);
        }
        else {
            log("update() called with empty data.  Don't do anything.");
            repoCallOnCompleteCallback(repo, onComplete, 'ok', undefined);
        }
    }
    /**
     * Applies all of the changes stored up in the onDisconnect_ tree.
     */
    function repoRunOnDisconnectEvents(repo) {
        repoLog(repo, 'onDisconnectEvents');
        const serverValues = repoGenerateServerValues(repo);
        const resolvedOnDisconnectTree = newSparseSnapshotTree();
        sparseSnapshotTreeForEachTree(repo.onDisconnect_, newEmptyPath(), (path, node) => {
            const resolved = resolveDeferredValueTree(path, node, repo.serverSyncTree_, serverValues);
            sparseSnapshotTreeRemember(resolvedOnDisconnectTree, path, resolved);
        });
        let events = [];
        sparseSnapshotTreeForEachTree(resolvedOnDisconnectTree, newEmptyPath(), (path, snap) => {
            events = events.concat(syncTreeApplyServerOverwrite(repo.serverSyncTree_, path, snap));
            const affectedPath = repoAbortTransactions(repo, path);
            repoRerunTransactions(repo, affectedPath);
        });
        repo.onDisconnect_ = newSparseSnapshotTree();
        eventQueueRaiseEventsForChangedPath(repo.eventQueue_, newEmptyPath(), events);
    }
    function repoAddEventCallbackForQuery(repo, query, eventRegistration) {
        let events;
        if (pathGetFront(query._path) === '.info') {
            events = syncTreeAddEventRegistration(repo.infoSyncTree_, query, eventRegistration);
        }
        else {
            events = syncTreeAddEventRegistration(repo.serverSyncTree_, query, eventRegistration);
        }
        eventQueueRaiseEventsAtPath(repo.eventQueue_, query._path, events);
    }
    function repoRemoveEventCallbackForQuery(repo, query, eventRegistration) {
        // These are guaranteed not to raise events, since we're not passing in a cancelError. However, we can future-proof
        // a little bit by handling the return values anyways.
        let events;
        if (pathGetFront(query._path) === '.info') {
            events = syncTreeRemoveEventRegistration(repo.infoSyncTree_, query, eventRegistration);
        }
        else {
            events = syncTreeRemoveEventRegistration(repo.serverSyncTree_, query, eventRegistration);
        }
        eventQueueRaiseEventsAtPath(repo.eventQueue_, query._path, events);
    }
    function repoInterrupt(repo) {
        if (repo.persistentConnection_) {
            repo.persistentConnection_.interrupt(INTERRUPT_REASON);
        }
    }
    function repoLog(repo, ...varArgs) {
        let prefix = '';
        if (repo.persistentConnection_) {
            prefix = repo.persistentConnection_.id + ':';
        }
        log(prefix, ...varArgs);
    }
    function repoCallOnCompleteCallback(repo, callback, status, errorReason) {
        if (callback) {
            exceptionGuard(() => {
                if (status === 'ok') {
                    callback(null);
                }
                else {
                    const code = (status || 'error').toUpperCase();
                    let message = code;
                    if (errorReason) {
                        message += ': ' + errorReason;
                    }
                    const error = new Error(message);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error.code = code;
                    callback(error);
                }
            });
        }
    }
    /**
     * @param excludeSets - A specific set to exclude
     */
    function repoGetLatestState(repo, path, excludeSets) {
        return (syncTreeCalcCompleteEventCache(repo.serverSyncTree_, path, excludeSets) ||
            ChildrenNode.EMPTY_NODE);
    }
    /**
     * Sends any already-run transactions that aren't waiting for outstanding
     * transactions to complete.
     *
     * Externally it's called with no arguments, but it calls itself recursively
     * with a particular transactionQueueTree node to recurse through the tree.
     *
     * @param node - transactionQueueTree node to start at.
     */
    function repoSendReadyTransactions(repo, node = repo.transactionQueueTree_) {
        // Before recursing, make sure any completed transactions are removed.
        if (!node) {
            repoPruneCompletedTransactionsBelowNode(repo, node);
        }
        if (treeGetValue(node)) {
            const queue = repoBuildTransactionQueue(repo, node);
            assert(queue.length > 0, 'Sending zero length transaction queue');
            const allRun = queue.every((transaction) => transaction.status === 0 /* RUN */);
            // If they're all run (and not sent), we can send them.  Else, we must wait.
            if (allRun) {
                repoSendTransactionQueue(repo, treeGetPath(node), queue);
            }
        }
        else if (treeHasChildren(node)) {
            treeForEachChild(node, childNode => {
                repoSendReadyTransactions(repo, childNode);
            });
        }
    }
    /**
     * Given a list of run transactions, send them to the server and then handle
     * the result (success or failure).
     *
     * @param path - The location of the queue.
     * @param queue - Queue of transactions under the specified location.
     */
    function repoSendTransactionQueue(repo, path, queue) {
        // Mark transactions as sent and increment retry count!
        const setsToIgnore = queue.map(txn => {
            return txn.currentWriteId;
        });
        const latestState = repoGetLatestState(repo, path, setsToIgnore);
        let snapToSend = latestState;
        const latestHash = latestState.hash();
        for (let i = 0; i < queue.length; i++) {
            const txn = queue[i];
            assert(txn.status === 0 /* RUN */, 'tryToSendTransactionQueue_: items in queue should all be run.');
            txn.status = 1 /* SENT */;
            txn.retryCount++;
            const relativePath = newRelativePath(path, txn.path);
            // If we've gotten to this point, the output snapshot must be defined.
            snapToSend = snapToSend.updateChild(relativePath /** @type {!Node} */, txn.currentOutputSnapshotRaw);
        }
        const dataToSend = snapToSend.val(true);
        const pathToSend = path;
        // Send the put.
        repo.server_.put(pathToSend.toString(), dataToSend, (status) => {
            repoLog(repo, 'transaction put response', {
                path: pathToSend.toString(),
                status
            });
            let events = [];
            if (status === 'ok') {
                // Queue up the callbacks and fire them after cleaning up all of our
                // transaction state, since the callback could trigger more
                // transactions or sets.
                const callbacks = [];
                for (let i = 0; i < queue.length; i++) {
                    queue[i].status = 2 /* COMPLETED */;
                    events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, queue[i].currentWriteId));
                    if (queue[i].onComplete) {
                        // We never unset the output snapshot, and given that this
                        // transaction is complete, it should be set
                        callbacks.push(() => queue[i].onComplete(null, true, queue[i].currentOutputSnapshotResolved));
                    }
                    queue[i].unwatcher();
                }
                // Now remove the completed transactions.
                repoPruneCompletedTransactionsBelowNode(repo, treeSubTree(repo.transactionQueueTree_, path));
                // There may be pending transactions that we can now send.
                repoSendReadyTransactions(repo, repo.transactionQueueTree_);
                eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
                // Finally, trigger onComplete callbacks.
                for (let i = 0; i < callbacks.length; i++) {
                    exceptionGuard(callbacks[i]);
                }
            }
            else {
                // transactions are no longer sent.  Update their status appropriately.
                if (status === 'datastale') {
                    for (let i = 0; i < queue.length; i++) {
                        if (queue[i].status === 3 /* SENT_NEEDS_ABORT */) {
                            queue[i].status = 4 /* NEEDS_ABORT */;
                        }
                        else {
                            queue[i].status = 0 /* RUN */;
                        }
                    }
                }
                else {
                    warn('transaction at ' + pathToSend.toString() + ' failed: ' + status);
                    for (let i = 0; i < queue.length; i++) {
                        queue[i].status = 4 /* NEEDS_ABORT */;
                        queue[i].abortReason = status;
                    }
                }
                repoRerunTransactions(repo, path);
            }
        }, latestHash);
    }
    /**
     * Finds all transactions dependent on the data at changedPath and reruns them.
     *
     * Should be called any time cached data changes.
     *
     * Return the highest path that was affected by rerunning transactions. This
     * is the path at which events need to be raised for.
     *
     * @param changedPath - The path in mergedData that changed.
     * @returns The rootmost path that was affected by rerunning transactions.
     */
    function repoRerunTransactions(repo, changedPath) {
        const rootMostTransactionNode = repoGetAncestorTransactionNode(repo, changedPath);
        const path = treeGetPath(rootMostTransactionNode);
        const queue = repoBuildTransactionQueue(repo, rootMostTransactionNode);
        repoRerunTransactionQueue(repo, queue, path);
        return path;
    }
    /**
     * Does all the work of rerunning transactions (as well as cleans up aborted
     * transactions and whatnot).
     *
     * @param queue - The queue of transactions to run.
     * @param path - The path the queue is for.
     */
    function repoRerunTransactionQueue(repo, queue, path) {
        if (queue.length === 0) {
            return; // Nothing to do!
        }
        // Queue up the callbacks and fire them after cleaning up all of our
        // transaction state, since the callback could trigger more transactions or
        // sets.
        const callbacks = [];
        let events = [];
        // Ignore all of the sets we're going to re-run.
        const txnsToRerun = queue.filter(q => {
            return q.status === 0 /* RUN */;
        });
        const setsToIgnore = txnsToRerun.map(q => {
            return q.currentWriteId;
        });
        for (let i = 0; i < queue.length; i++) {
            const transaction = queue[i];
            const relativePath = newRelativePath(path, transaction.path);
            let abortTransaction = false, abortReason;
            assert(relativePath !== null, 'rerunTransactionsUnderNode_: relativePath should not be null.');
            if (transaction.status === 4 /* NEEDS_ABORT */) {
                abortTransaction = true;
                abortReason = transaction.abortReason;
                events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
            }
            else if (transaction.status === 0 /* RUN */) {
                if (transaction.retryCount >= MAX_TRANSACTION_RETRIES) {
                    abortTransaction = true;
                    abortReason = 'maxretry';
                    events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
                }
                else {
                    // This code reruns a transaction
                    const currentNode = repoGetLatestState(repo, transaction.path, setsToIgnore);
                    transaction.currentInputSnapshot = currentNode;
                    const newData = queue[i].update(currentNode.val());
                    if (newData !== undefined) {
                        validateFirebaseData('transaction failed: Data returned ', newData, transaction.path);
                        let newDataNode = nodeFromJSON(newData);
                        const hasExplicitPriority = typeof newData === 'object' &&
                            newData != null &&
                            contains(newData, '.priority');
                        if (!hasExplicitPriority) {
                            // Keep the old priority if there wasn't a priority explicitly specified.
                            newDataNode = newDataNode.updatePriority(currentNode.getPriority());
                        }
                        const oldWriteId = transaction.currentWriteId;
                        const serverValues = repoGenerateServerValues(repo);
                        const newNodeResolved = resolveDeferredValueSnapshot(newDataNode, currentNode, serverValues);
                        transaction.currentOutputSnapshotRaw = newDataNode;
                        transaction.currentOutputSnapshotResolved = newNodeResolved;
                        transaction.currentWriteId = repoGetNextWriteId(repo);
                        // Mutates setsToIgnore in place
                        setsToIgnore.splice(setsToIgnore.indexOf(oldWriteId), 1);
                        events = events.concat(syncTreeApplyUserOverwrite(repo.serverSyncTree_, transaction.path, newNodeResolved, transaction.currentWriteId, transaction.applyLocally));
                        events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, oldWriteId, true));
                    }
                    else {
                        abortTransaction = true;
                        abortReason = 'nodata';
                        events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
                    }
                }
            }
            eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
            events = [];
            if (abortTransaction) {
                // Abort.
                queue[i].status = 2 /* COMPLETED */;
                // Removing a listener can trigger pruning which can muck with
                // mergedData/visibleData (as it prunes data). So defer the unwatcher
                // until we're done.
                (function (unwatcher) {
                    setTimeout(unwatcher, Math.floor(0));
                })(queue[i].unwatcher);
                if (queue[i].onComplete) {
                    if (abortReason === 'nodata') {
                        callbacks.push(() => queue[i].onComplete(null, false, queue[i].currentInputSnapshot));
                    }
                    else {
                        callbacks.push(() => queue[i].onComplete(new Error(abortReason), false, null));
                    }
                }
            }
        }
        // Clean up completed transactions.
        repoPruneCompletedTransactionsBelowNode(repo, repo.transactionQueueTree_);
        // Now fire callbacks, now that we're in a good, known state.
        for (let i = 0; i < callbacks.length; i++) {
            exceptionGuard(callbacks[i]);
        }
        // Try to send the transaction result to the server.
        repoSendReadyTransactions(repo, repo.transactionQueueTree_);
    }
    /**
     * Returns the rootmost ancestor node of the specified path that has a pending
     * transaction on it, or just returns the node for the given path if there are
     * no pending transactions on any ancestor.
     *
     * @param path - The location to start at.
     * @returns The rootmost node with a transaction.
     */
    function repoGetAncestorTransactionNode(repo, path) {
        let front;
        // Start at the root and walk deeper into the tree towards path until we
        // find a node with pending transactions.
        let transactionNode = repo.transactionQueueTree_;
        front = pathGetFront(path);
        while (front !== null && treeGetValue(transactionNode) === undefined) {
            transactionNode = treeSubTree(transactionNode, front);
            path = pathPopFront(path);
            front = pathGetFront(path);
        }
        return transactionNode;
    }
    /**
     * Builds the queue of all transactions at or below the specified
     * transactionNode.
     *
     * @param transactionNode
     * @returns The generated queue.
     */
    function repoBuildTransactionQueue(repo, transactionNode) {
        // Walk any child transaction queues and aggregate them into a single queue.
        const transactionQueue = [];
        repoAggregateTransactionQueuesForNode(repo, transactionNode, transactionQueue);
        // Sort them by the order the transactions were created.
        transactionQueue.sort((a, b) => a.order - b.order);
        return transactionQueue;
    }
    function repoAggregateTransactionQueuesForNode(repo, node, queue) {
        const nodeQueue = treeGetValue(node);
        if (nodeQueue) {
            for (let i = 0; i < nodeQueue.length; i++) {
                queue.push(nodeQueue[i]);
            }
        }
        treeForEachChild(node, child => {
            repoAggregateTransactionQueuesForNode(repo, child, queue);
        });
    }
    /**
     * Remove COMPLETED transactions at or below this node in the transactionQueueTree_.
     */
    function repoPruneCompletedTransactionsBelowNode(repo, node) {
        const queue = treeGetValue(node);
        if (queue) {
            let to = 0;
            for (let from = 0; from < queue.length; from++) {
                if (queue[from].status !== 2 /* COMPLETED */) {
                    queue[to] = queue[from];
                    to++;
                }
            }
            queue.length = to;
            treeSetValue(node, queue.length > 0 ? queue : undefined);
        }
        treeForEachChild(node, childNode => {
            repoPruneCompletedTransactionsBelowNode(repo, childNode);
        });
    }
    /**
     * Aborts all transactions on ancestors or descendants of the specified path.
     * Called when doing a set() or update() since we consider them incompatible
     * with transactions.
     *
     * @param path - Path for which we want to abort related transactions.
     */
    function repoAbortTransactions(repo, path) {
        const affectedPath = treeGetPath(repoGetAncestorTransactionNode(repo, path));
        const transactionNode = treeSubTree(repo.transactionQueueTree_, path);
        treeForEachAncestor(transactionNode, (node) => {
            repoAbortTransactionsOnNode(repo, node);
        });
        repoAbortTransactionsOnNode(repo, transactionNode);
        treeForEachDescendant(transactionNode, (node) => {
            repoAbortTransactionsOnNode(repo, node);
        });
        return affectedPath;
    }
    /**
     * Abort transactions stored in this transaction queue node.
     *
     * @param node - Node to abort transactions for.
     */
    function repoAbortTransactionsOnNode(repo, node) {
        const queue = treeGetValue(node);
        if (queue) {
            // Queue up the callbacks and fire them after cleaning up all of our
            // transaction state, since the callback could trigger more transactions
            // or sets.
            const callbacks = [];
            // Go through queue.  Any already-sent transactions must be marked for
            // abort, while the unsent ones can be immediately aborted and removed.
            let events = [];
            let lastSent = -1;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].status === 3 /* SENT_NEEDS_ABORT */) ;
                else if (queue[i].status === 1 /* SENT */) {
                    assert(lastSent === i - 1, 'All SENT items should be at beginning of queue.');
                    lastSent = i;
                    // Mark transaction for abort when it comes back.
                    queue[i].status = 3 /* SENT_NEEDS_ABORT */;
                    queue[i].abortReason = 'set';
                }
                else {
                    assert(queue[i].status === 0 /* RUN */, 'Unexpected transaction status in abort');
                    // We can abort it immediately.
                    queue[i].unwatcher();
                    events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, queue[i].currentWriteId, true));
                    if (queue[i].onComplete) {
                        callbacks.push(queue[i].onComplete.bind(null, new Error('set'), false, null));
                    }
                }
            }
            if (lastSent === -1) {
                // We're not waiting for any sent transactions.  We can clear the queue.
                treeSetValue(node, undefined);
            }
            else {
                // Remove the transactions we aborted.
                queue.length = lastSent + 1;
            }
            // Now fire the callbacks.
            eventQueueRaiseEventsForChangedPath(repo.eventQueue_, treeGetPath(node), events);
            for (let i = 0; i < callbacks.length; i++) {
                exceptionGuard(callbacks[i]);
            }
        }
    }

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
    function decodePath(pathString) {
        let pathStringDecoded = '';
        const pieces = pathString.split('/');
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].length > 0) {
                let piece = pieces[i];
                try {
                    piece = decodeURIComponent(piece.replace(/\+/g, ' '));
                }
                catch (e) { }
                pathStringDecoded += '/' + piece;
            }
        }
        return pathStringDecoded;
    }
    /**
     * @returns key value hash
     */
    function decodeQuery(queryString) {
        const results = {};
        if (queryString.charAt(0) === '?') {
            queryString = queryString.substring(1);
        }
        for (const segment of queryString.split('&')) {
            if (segment.length === 0) {
                continue;
            }
            const kv = segment.split('=');
            if (kv.length === 2) {
                results[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
            }
            else {
                warn(`Invalid query segment '${segment}' in query '${queryString}'`);
            }
        }
        return results;
    }
    const parseRepoInfo = function (dataURL, nodeAdmin) {
        const parsedUrl = parseDatabaseURL(dataURL), namespace = parsedUrl.namespace;
        if (parsedUrl.domain === 'firebase.com') {
            fatal(parsedUrl.host +
                ' is no longer supported. ' +
                'Please use <YOUR FIREBASE>.firebaseio.com instead');
        }
        // Catch common error of uninitialized namespace value.
        if ((!namespace || namespace === 'undefined') &&
            parsedUrl.domain !== 'localhost') {
            fatal('Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com');
        }
        if (!parsedUrl.secure) {
            warnIfPageIsSecure();
        }
        const webSocketOnly = parsedUrl.scheme === 'ws' || parsedUrl.scheme === 'wss';
        return {
            repoInfo: new RepoInfo(parsedUrl.host, parsedUrl.secure, namespace, nodeAdmin, webSocketOnly, 
            /*persistenceKey=*/ '', 
            /*includeNamespaceInQueryParams=*/ namespace !== parsedUrl.subdomain),
            path: new Path(parsedUrl.pathString)
        };
    };
    const parseDatabaseURL = function (dataURL) {
        // Default to empty strings in the event of a malformed string.
        let host = '', domain = '', subdomain = '', pathString = '', namespace = '';
        // Always default to SSL, unless otherwise specified.
        let secure = true, scheme = 'https', port = 443;
        // Don't do any validation here. The caller is responsible for validating the result of parsing.
        if (typeof dataURL === 'string') {
            // Parse scheme.
            let colonInd = dataURL.indexOf('//');
            if (colonInd >= 0) {
                scheme = dataURL.substring(0, colonInd - 1);
                dataURL = dataURL.substring(colonInd + 2);
            }
            // Parse host, path, and query string.
            let slashInd = dataURL.indexOf('/');
            if (slashInd === -1) {
                slashInd = dataURL.length;
            }
            let questionMarkInd = dataURL.indexOf('?');
            if (questionMarkInd === -1) {
                questionMarkInd = dataURL.length;
            }
            host = dataURL.substring(0, Math.min(slashInd, questionMarkInd));
            if (slashInd < questionMarkInd) {
                // For pathString, questionMarkInd will always come after slashInd
                pathString = decodePath(dataURL.substring(slashInd, questionMarkInd));
            }
            const queryParams = decodeQuery(dataURL.substring(Math.min(dataURL.length, questionMarkInd)));
            // If we have a port, use scheme for determining if it's secure.
            colonInd = host.indexOf(':');
            if (colonInd >= 0) {
                secure = scheme === 'https' || scheme === 'wss';
                port = parseInt(host.substring(colonInd + 1), 10);
            }
            else {
                colonInd = host.length;
            }
            const hostWithoutPort = host.slice(0, colonInd);
            if (hostWithoutPort.toLowerCase() === 'localhost') {
                domain = 'localhost';
            }
            else if (hostWithoutPort.split('.').length <= 2) {
                domain = hostWithoutPort;
            }
            else {
                // Interpret the subdomain of a 3 or more component URL as the namespace name.
                const dotInd = host.indexOf('.');
                subdomain = host.substring(0, dotInd).toLowerCase();
                domain = host.substring(dotInd + 1);
                // Normalize namespaces to lowercase to share storage / connection.
                namespace = subdomain;
            }
            // Always treat the value of the `ns` as the namespace name if it is present.
            if ('ns' in queryParams) {
                namespace = queryParams['ns'];
            }
        }
        return {
            host,
            port,
            domain,
            subdomain,
            secure,
            scheme,
            pathString,
            namespace
        };
    };

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
     * Encapsulates the data needed to raise an event
     */
    class DataEvent {
        /**
         * @param eventType - One of: value, child_added, child_changed, child_moved, child_removed
         * @param eventRegistration - The function to call to with the event data. User provided
         * @param snapshot - The data backing the event
         * @param prevName - Optional, the name of the previous child for child_* events.
         */
        constructor(eventType, eventRegistration, snapshot, prevName) {
            this.eventType = eventType;
            this.eventRegistration = eventRegistration;
            this.snapshot = snapshot;
            this.prevName = prevName;
        }
        getPath() {
            const ref = this.snapshot.ref;
            if (this.eventType === 'value') {
                return ref._path;
            }
            else {
                return ref.parent._path;
            }
        }
        getEventType() {
            return this.eventType;
        }
        getEventRunner() {
            return this.eventRegistration.getEventRunner(this);
        }
        toString() {
            return (this.getPath().toString() +
                ':' +
                this.eventType +
                ':' +
                stringify(this.snapshot.exportVal()));
        }
    }
    class CancelEvent {
        constructor(eventRegistration, error, path) {
            this.eventRegistration = eventRegistration;
            this.error = error;
            this.path = path;
        }
        getPath() {
            return this.path;
        }
        getEventType() {
            return 'cancel';
        }
        getEventRunner() {
            return this.eventRegistration.getEventRunner(this);
        }
        toString() {
            return this.path.toString() + ':cancel';
        }
    }

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
     * A wrapper class that converts events from the database@exp SDK to the legacy
     * Database SDK. Events are not converted directly as event registration relies
     * on reference comparison of the original user callback (see `matches()`) and
     * relies on equality of the legacy SDK's `context` object.
     */
    class CallbackContext {
        constructor(snapshotCallback, cancelCallback) {
            this.snapshotCallback = snapshotCallback;
            this.cancelCallback = cancelCallback;
        }
        onValue(expDataSnapshot, previousChildName) {
            this.snapshotCallback.call(null, expDataSnapshot, previousChildName);
        }
        onCancel(error) {
            assert(this.hasCancelCallback, 'Raising a cancel event on a listener with no cancel callback');
            return this.cancelCallback.call(null, error);
        }
        get hasCancelCallback() {
            return !!this.cancelCallback;
        }
        matches(other) {
            return (this.snapshotCallback === other.snapshotCallback ||
                (this.snapshotCallback.userCallback !== undefined &&
                    this.snapshotCallback.userCallback ===
                        other.snapshotCallback.userCallback &&
                    this.snapshotCallback.context === other.snapshotCallback.context));
        }
    }

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
     * @internal
     */
    class QueryImpl {
        /**
         * @hideconstructor
         */
        constructor(_repo, _path, _queryParams, _orderByCalled) {
            this._repo = _repo;
            this._path = _path;
            this._queryParams = _queryParams;
            this._orderByCalled = _orderByCalled;
        }
        get key() {
            if (pathIsEmpty(this._path)) {
                return null;
            }
            else {
                return pathGetBack(this._path);
            }
        }
        get ref() {
            return new ReferenceImpl(this._repo, this._path);
        }
        get _queryIdentifier() {
            const obj = queryParamsGetQueryObject(this._queryParams);
            const id = ObjectToUniqueKey(obj);
            return id === '{}' ? 'default' : id;
        }
        /**
         * An object representation of the query parameters used by this Query.
         */
        get _queryObject() {
            return queryParamsGetQueryObject(this._queryParams);
        }
        isEqual(other) {
            other = getModularInstance(other);
            if (!(other instanceof QueryImpl)) {
                return false;
            }
            const sameRepo = this._repo === other._repo;
            const samePath = pathEquals(this._path, other._path);
            const sameQueryIdentifier = this._queryIdentifier === other._queryIdentifier;
            return sameRepo && samePath && sameQueryIdentifier;
        }
        toJSON() {
            return this.toString();
        }
        toString() {
            return this._repo.toString() + pathToUrlEncodedString(this._path);
        }
    }
    /**
     * @internal
     */
    class ReferenceImpl extends QueryImpl {
        /** @hideconstructor */
        constructor(repo, path) {
            super(repo, path, new QueryParams(), false);
        }
        get parent() {
            const parentPath = pathParent(this._path);
            return parentPath === null
                ? null
                : new ReferenceImpl(this._repo, parentPath);
        }
        get root() {
            let ref = this;
            while (ref.parent !== null) {
                ref = ref.parent;
            }
            return ref;
        }
    }
    /**
     * A `DataSnapshot` contains data from a Database location.
     *
     * Any time you read data from the Database, you receive the data as a
     * `DataSnapshot`. A `DataSnapshot` is passed to the event callbacks you attach
     * with `on()` or `once()`. You can extract the contents of the snapshot as a
     * JavaScript object by calling the `val()` method. Alternatively, you can
     * traverse into the snapshot by calling `child()` to return child snapshots
     * (which you could then call `val()` on).
     *
     * A `DataSnapshot` is an efficiently generated, immutable copy of the data at
     * a Database location. It cannot be modified and will never change (to modify
     * data, you always call the `set()` method on a `Reference` directly).
     */
    class DataSnapshot {
        /**
         * @param _node - A SnapshotNode to wrap.
         * @param ref - The location this snapshot came from.
         * @param _index - The iteration order for this snapshot
         * @hideconstructor
         */
        constructor(_node, 
        /**
         * The location of this DataSnapshot.
         */
        ref, _index) {
            this._node = _node;
            this.ref = ref;
            this._index = _index;
        }
        /**
         * Gets the priority value of the data in this `DataSnapshot`.
         *
         * Applications need not use priority but can order collections by
         * ordinary properties (see
         * {@link https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data |Sorting and filtering data}
         * ).
         */
        get priority() {
            // typecast here because we never return deferred values or internal priorities (MAX_PRIORITY)
            return this._node.getPriority().val();
        }
        /**
         * The key (last part of the path) of the location of this `DataSnapshot`.
         *
         * The last token in a Database location is considered its key. For example,
         * "ada" is the key for the /users/ada/ node. Accessing the key on any
         * `DataSnapshot` will return the key for the location that generated it.
         * However, accessing the key on the root URL of a Database will return
         * `null`.
         */
        get key() {
            return this.ref.key;
        }
        /** Returns the number of child properties of this `DataSnapshot`. */
        get size() {
            return this._node.numChildren();
        }
        /**
         * Gets another `DataSnapshot` for the location at the specified relative path.
         *
         * Passing a relative path to the `child()` method of a DataSnapshot returns
         * another `DataSnapshot` for the location at the specified relative path. The
         * relative path can either be a simple child name (for example, "ada") or a
         * deeper, slash-separated path (for example, "ada/name/first"). If the child
         * location has no data, an empty `DataSnapshot` (that is, a `DataSnapshot`
         * whose value is `null`) is returned.
         *
         * @param path - A relative path to the location of child data.
         */
        child(path) {
            const childPath = new Path(path);
            const childRef = child(this.ref, path);
            return new DataSnapshot(this._node.getChild(childPath), childRef, PRIORITY_INDEX);
        }
        /**
         * Returns true if this `DataSnapshot` contains any data. It is slightly more
         * efficient than using `snapshot.val() !== null`.
         */
        exists() {
            return !this._node.isEmpty();
        }
        /**
         * Exports the entire contents of the DataSnapshot as a JavaScript object.
         *
         * The `exportVal()` method is similar to `val()`, except priority information
         * is included (if available), making it suitable for backing up your data.
         *
         * @returns The DataSnapshot's contents as a JavaScript value (Object,
         *   Array, string, number, boolean, or `null`).
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exportVal() {
            return this._node.val(true);
        }
        /**
         * Enumerates the top-level children in the `DataSnapshot`.
         *
         * Because of the way JavaScript objects work, the ordering of data in the
         * JavaScript object returned by `val()` is not guaranteed to match the
         * ordering on the server nor the ordering of `onChildAdded()` events. That is
         * where `forEach()` comes in handy. It guarantees the children of a
         * `DataSnapshot` will be iterated in their query order.
         *
         * If no explicit `orderBy*()` method is used, results are returned
         * ordered by key (unless priorities are used, in which case, results are
         * returned by priority).
         *
         * @param action - A function that will be called for each child DataSnapshot.
         * The callback can return true to cancel further enumeration.
         * @returns true if enumeration was canceled due to your callback returning
         * true.
         */
        forEach(action) {
            if (this._node.isLeafNode()) {
                return false;
            }
            const childrenNode = this._node;
            // Sanitize the return value to a boolean. ChildrenNode.forEachChild has a weird return type...
            return !!childrenNode.forEachChild(this._index, (key, node) => {
                return action(new DataSnapshot(node, child(this.ref, key), PRIORITY_INDEX));
            });
        }
        /**
         * Returns true if the specified child path has (non-null) data.
         *
         * @param path - A relative path to the location of a potential child.
         * @returns `true` if data exists at the specified child path; else
         *  `false`.
         */
        hasChild(path) {
            const childPath = new Path(path);
            return !this._node.getChild(childPath).isEmpty();
        }
        /**
         * Returns whether or not the `DataSnapshot` has any non-`null` child
         * properties.
         *
         * You can use `hasChildren()` to determine if a `DataSnapshot` has any
         * children. If it does, you can enumerate them using `forEach()`. If it
         * doesn't, then either this snapshot contains a primitive value (which can be
         * retrieved with `val()`) or it is empty (in which case, `val()` will return
         * `null`).
         *
         * @returns true if this snapshot has any children; else false.
         */
        hasChildren() {
            if (this._node.isLeafNode()) {
                return false;
            }
            else {
                return !this._node.isEmpty();
            }
        }
        /**
         * Returns a JSON-serializable representation of this object.
         */
        toJSON() {
            return this.exportVal();
        }
        /**
         * Extracts a JavaScript value from a `DataSnapshot`.
         *
         * Depending on the data in a `DataSnapshot`, the `val()` method may return a
         * scalar type (string, number, or boolean), an array, or an object. It may
         * also return null, indicating that the `DataSnapshot` is empty (contains no
         * data).
         *
         * @returns The DataSnapshot's contents as a JavaScript value (Object,
         *   Array, string, number, boolean, or `null`).
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        val() {
            return this._node.val();
        }
    }
    /**
     *
     * Returns a `Reference` representing the location in the Database
     * corresponding to the provided path. If no path is provided, the `Reference`
     * will point to the root of the Database.
     *
     * @param db - The database instance to obtain a reference for.
     * @param path - Optional path representing the location the returned
     *   `Reference` will point. If not provided, the returned `Reference` will
     *   point to the root of the Database.
     * @returns If a path is provided, a `Reference`
     *   pointing to the provided path. Otherwise, a `Reference` pointing to the
     *   root of the Database.
     */
    function ref(db, path) {
        db = getModularInstance(db);
        db._checkNotDeleted('ref');
        return path !== undefined ? child(db._root, path) : db._root;
    }
    /**
     * Gets a `Reference` for the location at the specified relative path.
     *
     * The relative path can either be a simple child name (for example, "ada") or
     * a deeper slash-separated path (for example, "ada/name/first").
     *
     * @param parent - The parent location.
     * @param path - A relative path from this location to the desired child
     *   location.
     * @returns The specified child location.
     */
    function child(parent, path) {
        parent = getModularInstance(parent);
        if (pathGetFront(parent._path) === null) {
            validateRootPathString('child', 'path', path, false);
        }
        else {
            validatePathString('child', 'path', path, false);
        }
        return new ReferenceImpl(parent._repo, pathChild(parent._path, path));
    }
    /**
     * Writes multiple values to the Database at once.
     *
     * The `values` argument contains multiple property-value pairs that will be
     * written to the Database together. Each child property can either be a simple
     * property (for example, "name") or a relative path (for example,
     * "name/first") from the current location to the data to update.
     *
     * As opposed to the `set()` method, `update()` can be use to selectively update
     * only the referenced properties at the current location (instead of replacing
     * all the child properties at the current location).
     *
     * The effect of the write will be visible immediately, and the corresponding
     * events ('value', 'child_added', etc.) will be triggered. Synchronization of
     * the data to the Firebase servers will also be started, and the returned
     * Promise will resolve when complete. If provided, the `onComplete` callback
     * will be called asynchronously after synchronization has finished.
     *
     * A single `update()` will generate a single "value" event at the location
     * where the `update()` was performed, regardless of how many children were
     * modified.
     *
     * Note that modifying data with `update()` will cancel any pending
     * transactions at that location, so extreme care should be taken if mixing
     * `update()` and `transaction()` to modify the same data.
     *
     * Passing `null` to `update()` will remove the data at this location.
     *
     * See
     * {@link https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html | Introducing multi-location updates and more}.
     *
     * @param ref - The location to write to.
     * @param values - Object containing multiple values.
     * @returns Resolves when update on server is complete.
     */
    function update(ref, values) {
        validateFirebaseMergeDataArg('update', values, ref._path, false);
        const deferred = new Deferred();
        repoUpdate(ref._repo, ref._path, values, deferred.wrapCallback(() => { }));
        return deferred.promise;
    }
    /**
     * Gets the most up-to-date result for this query.
     *
     * @param query - The query to run.
     * @returns A `Promise` which resolves to the resulting DataSnapshot if a value is
     * available, or rejects if the client is unable to return a value (e.g., if the
     * server is unreachable and there is nothing cached).
     */
    function get(query) {
        query = getModularInstance(query);
        return repoGetValue(query._repo, query).then(node => {
            return new DataSnapshot(node, new ReferenceImpl(query._repo, query._path), query._queryParams.getIndex());
        });
    }
    /**
     * Represents registration for 'value' events.
     */
    class ValueEventRegistration {
        constructor(callbackContext) {
            this.callbackContext = callbackContext;
        }
        respondsTo(eventType) {
            return eventType === 'value';
        }
        createEvent(change, query) {
            const index = query._queryParams.getIndex();
            return new DataEvent('value', this, new DataSnapshot(change.snapshotNode, new ReferenceImpl(query._repo, query._path), index));
        }
        getEventRunner(eventData) {
            if (eventData.getEventType() === 'cancel') {
                return () => this.callbackContext.onCancel(eventData.error);
            }
            else {
                return () => this.callbackContext.onValue(eventData.snapshot, null);
            }
        }
        createCancelEvent(error, path) {
            if (this.callbackContext.hasCancelCallback) {
                return new CancelEvent(this, error, path);
            }
            else {
                return null;
            }
        }
        matches(other) {
            if (!(other instanceof ValueEventRegistration)) {
                return false;
            }
            else if (!other.callbackContext || !this.callbackContext) {
                // If no callback specified, we consider it to match any callback.
                return true;
            }
            else {
                return other.callbackContext.matches(this.callbackContext);
            }
        }
        hasAnyCallback() {
            return this.callbackContext !== null;
        }
    }
    /**
     * Represents the registration of a child_x event.
     */
    class ChildEventRegistration {
        constructor(eventType, callbackContext) {
            this.eventType = eventType;
            this.callbackContext = callbackContext;
        }
        respondsTo(eventType) {
            let eventToCheck = eventType === 'children_added' ? 'child_added' : eventType;
            eventToCheck =
                eventToCheck === 'children_removed' ? 'child_removed' : eventToCheck;
            return this.eventType === eventToCheck;
        }
        createCancelEvent(error, path) {
            if (this.callbackContext.hasCancelCallback) {
                return new CancelEvent(this, error, path);
            }
            else {
                return null;
            }
        }
        createEvent(change, query) {
            assert(change.childName != null, 'Child events should have a childName.');
            const childRef = child(new ReferenceImpl(query._repo, query._path), change.childName);
            const index = query._queryParams.getIndex();
            return new DataEvent(change.type, this, new DataSnapshot(change.snapshotNode, childRef, index), change.prevName);
        }
        getEventRunner(eventData) {
            if (eventData.getEventType() === 'cancel') {
                return () => this.callbackContext.onCancel(eventData.error);
            }
            else {
                return () => this.callbackContext.onValue(eventData.snapshot, eventData.prevName);
            }
        }
        matches(other) {
            if (other instanceof ChildEventRegistration) {
                return (this.eventType === other.eventType &&
                    (!this.callbackContext ||
                        !other.callbackContext ||
                        this.callbackContext.matches(other.callbackContext)));
            }
            return false;
        }
        hasAnyCallback() {
            return !!this.callbackContext;
        }
    }
    function addEventListener(query, eventType, callback, cancelCallbackOrListenOptions, options) {
        let cancelCallback;
        if (typeof cancelCallbackOrListenOptions === 'object') {
            cancelCallback = undefined;
            options = cancelCallbackOrListenOptions;
        }
        if (typeof cancelCallbackOrListenOptions === 'function') {
            cancelCallback = cancelCallbackOrListenOptions;
        }
        if (options && options.onlyOnce) {
            const userCallback = callback;
            const onceCallback = (dataSnapshot, previousChildName) => {
                repoRemoveEventCallbackForQuery(query._repo, query, container);
                userCallback(dataSnapshot, previousChildName);
            };
            onceCallback.userCallback = callback.userCallback;
            onceCallback.context = callback.context;
            callback = onceCallback;
        }
        const callbackContext = new CallbackContext(callback, cancelCallback || undefined);
        const container = eventType === 'value'
            ? new ValueEventRegistration(callbackContext)
            : new ChildEventRegistration(eventType, callbackContext);
        repoAddEventCallbackForQuery(query._repo, query, container);
        return () => repoRemoveEventCallbackForQuery(query._repo, query, container);
    }
    function onValue(query, callback, cancelCallbackOrListenOptions, options) {
        return addEventListener(query, 'value', callback, cancelCallbackOrListenOptions, options);
    }
    /**
     * Define reference constructor in various modules
     *
     * We are doing this here to avoid several circular
     * dependency issues
     */
    syncPointSetReferenceConstructor(ReferenceImpl);
    syncTreeSetReferenceConstructor(ReferenceImpl);

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
     * This variable is also defined in the firebase Node.js Admin SDK. Before
     * modifying this definition, consult the definition in:
     *
     * https://github.com/firebase/firebase-admin-node
     *
     * and make sure the two are consistent.
     */
    const FIREBASE_DATABASE_EMULATOR_HOST_VAR = 'FIREBASE_DATABASE_EMULATOR_HOST';
    /**
     * Creates and caches `Repo` instances.
     */
    const repos = {};
    /**
     * If true, any new `Repo` will be created to use `ReadonlyRestClient` (for testing purposes).
     */
    let useRestClient = false;
    /**
     * This function should only ever be called to CREATE a new database instance.
     * @internal
     */
    function repoManagerDatabaseFromApp(app, authProvider, appCheckProvider, url, nodeAdmin) {
        let dbUrl = url || app.options.databaseURL;
        if (dbUrl === undefined) {
            if (!app.options.projectId) {
                fatal("Can't determine Firebase Database URL. Be sure to include " +
                    ' a Project ID when calling firebase.initializeApp().');
            }
            log('Using default host for project ', app.options.projectId);
            dbUrl = `${app.options.projectId}-default-rtdb.firebaseio.com`;
        }
        let parsedUrl = parseRepoInfo(dbUrl, nodeAdmin);
        let repoInfo = parsedUrl.repoInfo;
        let isEmulator;
        let dbEmulatorHost = undefined;
        if (typeof process !== 'undefined') {
            dbEmulatorHost = process.env[FIREBASE_DATABASE_EMULATOR_HOST_VAR];
        }
        if (dbEmulatorHost) {
            isEmulator = true;
            dbUrl = `http://${dbEmulatorHost}?ns=${repoInfo.namespace}`;
            parsedUrl = parseRepoInfo(dbUrl, nodeAdmin);
            repoInfo = parsedUrl.repoInfo;
        }
        else {
            isEmulator = !parsedUrl.repoInfo.secure;
        }
        const authTokenProvider = nodeAdmin && isEmulator
            ? new EmulatorTokenProvider(EmulatorTokenProvider.OWNER)
            : new FirebaseAuthTokenProvider(app.name, app.options, authProvider);
        validateUrl('Invalid Firebase Database URL', parsedUrl);
        if (!pathIsEmpty(parsedUrl.path)) {
            fatal('Database URL must point to the root of a Firebase Database ' +
                '(not including a child path).');
        }
        const repo = repoManagerCreateRepo(repoInfo, app, authTokenProvider, new AppCheckTokenProvider(app.name, appCheckProvider));
        return new Database(repo, app);
    }
    /**
     * Remove the repo and make sure it is disconnected.
     *
     */
    function repoManagerDeleteRepo(repo, appName) {
        const appRepos = repos[appName];
        // This should never happen...
        if (!appRepos || appRepos[repo.key] !== repo) {
            fatal(`Database ${appName}(${repo.repoInfo_}) has already been deleted.`);
        }
        repoInterrupt(repo);
        delete appRepos[repo.key];
    }
    /**
     * Ensures a repo doesn't already exist and then creates one using the
     * provided app.
     *
     * @param repoInfo - The metadata about the Repo
     * @returns The Repo object for the specified server / repoName.
     */
    function repoManagerCreateRepo(repoInfo, app, authTokenProvider, appCheckProvider) {
        let appRepos = repos[app.name];
        if (!appRepos) {
            appRepos = {};
            repos[app.name] = appRepos;
        }
        let repo = appRepos[repoInfo.toURLString()];
        if (repo) {
            fatal('Database initialized multiple times. Please make sure the format of the database URL matches with each database() call.');
        }
        repo = new Repo(repoInfo, useRestClient, authTokenProvider, appCheckProvider);
        appRepos[repoInfo.toURLString()] = repo;
        return repo;
    }
    /**
     * Class representing a Firebase Realtime Database.
     */
    class Database {
        /** @hideconstructor */
        constructor(_repoInternal, 
        /** The {@link @firebase/app#FirebaseApp} associated with this Realtime Database instance. */
        app) {
            this._repoInternal = _repoInternal;
            this.app = app;
            /** Represents a `Database` instance. */
            this['type'] = 'database';
            /** Track if the instance has been used (root or repo accessed) */
            this._instanceStarted = false;
        }
        get _repo() {
            if (!this._instanceStarted) {
                repoStart(this._repoInternal, this.app.options.appId, this.app.options['databaseAuthVariableOverride']);
                this._instanceStarted = true;
            }
            return this._repoInternal;
        }
        get _root() {
            if (!this._rootInternal) {
                this._rootInternal = new ReferenceImpl(this._repo, newEmptyPath());
            }
            return this._rootInternal;
        }
        _delete() {
            if (this._rootInternal !== null) {
                repoManagerDeleteRepo(this._repo, this.app.name);
                this._repoInternal = null;
                this._rootInternal = null;
            }
            return Promise.resolve();
        }
        _checkNotDeleted(apiName) {
            if (this._rootInternal === null) {
                fatal('Cannot call ' + apiName + ' on a deleted database.');
            }
        }
    }
    /**
     * Returns the instance of the Realtime Database SDK that is associated
     * with the provided {@link @firebase/app#FirebaseApp}. Initializes a new instance with
     * with default settings if no instance exists or if the existing instance uses
     * a custom database URL.
     *
     * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned Realtime
     * Database instance is associated with.
     * @param url - The URL of the Realtime Database instance to connect to. If not
     * provided, the SDK connects to the default instance of the Firebase App.
     * @returns The `Database` instance of the provided app.
     */
    function getDatabase(app = getApp(), url) {
        return _getProvider(app, 'database').getImmediate({
            identifier: url
        });
    }

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
    function registerDatabase(variant) {
        setSDKVersion(SDK_VERSION$1);
        _registerComponent(new Component('database', (container, { instanceIdentifier: url }) => {
            const app = container.getProvider('app').getImmediate();
            const authProvider = container.getProvider('auth-internal');
            const appCheckProvider = container.getProvider('app-check-internal');
            return repoManagerDatabaseFromApp(app, authProvider, appCheckProvider, url);
        }, "PUBLIC" /* PUBLIC */).setMultipleInstances(true));
        registerVersion(name, version, variant);
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name, version, 'esm2017');
    }
    /**
     * Returns a placeholder value that can be used to atomically increment the
     * current database value by the provided delta.
     *
     * @param delta - the amount to modify the current value atomically.
     * @returns A placeholder value for modifying data atomically server-side.
     */
    function increment(delta) {
        return {
            '.sv': {
                'increment': delta
            }
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PersistentConnection.prototype.simpleListen = function (pathString, onComplete) {
        this.sendRequest('q', { p: pathString }, onComplete);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PersistentConnection.prototype.echo = function (data, onEcho) {
        this.sendRequest('echo', { d: data }, onEcho);
    };

    /**
     * Firebase Realtime Database
     *
     * @packageDocumentation
     */
    registerDatabase();

    const dataTypes = {
        visited: 'visited',
        studyList: 'studyList',
        studyResults: 'studyResults'
    };
    let callbacks = {
        visited: [],
        studyList: [],
        studyResults: []
    };
    const studyResult = {
        CORRECT: 'correct',
        INCORRECT: 'incorrect'
    };
    const cardTypes = {
        RECOGNITION: 'recognition',
        RECALL: 'recall',
        CLOZE: 'cloze'
    };
    const MAX_RECALL = 2;
    const MAX_CLOZE = 2;

    let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
    let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');
    let visited = JSON.parse(localStorage.getItem('visited') || '{}');

    let authenticatedUser = null;

    let studyResultsLastUpdated = null;
    let visitedLastUpdated = null;

    //TODO
    let canUpdateNonCriticalData = function (user, lastUpdate) {
        return (user && (!lastUpdate || (Date.now() - lastUpdate) >= (60 * 60 * 1000)));
    };

    let getStudyResults = function () {
        return studyResults;
    };
    let getVisited = function () {
        return visited;
    };
    //note: nodes will be marked visited when the user searches for or taps a node in the graph
    //for now, avoiding marking nodes visited via clicking a hanzi in an example or card
    //because in those cases no examples are shown
    let updateVisited = function (nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (!visited[nodes[i]]) {
                visited[nodes[i]] = 0;
            }
            visited[nodes[i]]++;
        }
        if (authenticatedUser) {
            const db = getDatabase();
            const nodeRef = ref(db, 'users/' + authenticatedUser.uid + '/visited/zh-CN/');
            let updates = {};
            for (let i = 0; i < nodes.length; i++) {
                updates[nodes[i]] = increment(1);
            }
            update(nodeRef, updates).then(() => {
                fetchVisited();
                fetchStudyResults();
            }).catch((error) => {
                console.log(error);
            });
        }
        localStorage.setItem('visited', JSON.stringify(visited));
        callbacks[dataTypes.visited].forEach(x => x(visited));
    };

    let registerCallback = function (dataType, callback) {
        callbacks[dataType].push(callback);
    };

    //keeping keys/localStudyList for parity with current hacked together firebase version
    let saveStudyList = function (keys, localStudyList, isAddition) {
        if (authenticatedUser) {
            localStudyList = localStudyList || studyList;
            const db = getDatabase();
            const nodeRef = ref(db, `users/${authenticatedUser.uid}`);
            let updates = {};
            for (let i = 0; i < keys.length; i++) {
                //setting to null will delete if not present
                updates[`decks/zh-CN/${sanitizeKey(keys[i])}`] = localStudyList[keys[i]] || null;
                if (isAddition) {
                    //the user could've previously deleted the card...this addition should win out
                    updates[`deleted/zh-CN/${sanitizeKey(keys[i])}`] = null;
                }
            }
            update(nodeRef, updates).then(() => {
                //regardless of how we ended up here, the localStorage part has been incorporated, so clear it out
                localStorage.setItem('studyListDirty', false);
            }).catch(() => {
                localStorage.setItem('studyListDirty', true);
            });
        } else {
            localStorage.setItem('studyListDirty', true);
        }
        localStorage.setItem('studyList', JSON.stringify(studyList));
    };
    let updateCard = function (result, key) {
        let now = new Date();
        if (result === studyResult.INCORRECT) {
            studyList[key].nextJump = 0.5;
            studyList[key].wrongCount++;
            studyList[key].due = now.valueOf();
        } else {
            let nextJump = studyList[key].nextJump || 0.5;
            studyList[key].nextJump = nextJump * 2;
            studyList[key].rightCount++;
            studyList[key].due = now.valueOf() + (nextJump * 24 * 60 * 60 * 1000);
        }
        saveStudyList([key]);
    };
    let addRecallCards = function (newCards, text, newKeys) {
        let total = Math.min(MAX_RECALL, newCards.length);
        for (let i = 0; i < total; i++) {
            let key = newCards[i].zh.join('') + cardTypes.RECALL;
            if (!studyList[key] && newCards[i].en) {
                newKeys.push(key);
                studyList[key] = {
                    en: newCards[i].en,
                    due: Date.now() + newCards.length + i,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.RECALL,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
    };
    // TODO: may be better combined with addRecallCards...
    let addClozeCards = function (newCards, text, newKeys) {
        let added = 0;
        for (let i = 0; i < newCards.length; i++) {
            if (added == MAX_CLOZE) {
                return;
            }
            // don't make cloze cards with the exact text
            if (newCards[i].zh.join('').length <= text.length) {
                continue;
            }
            let key = newCards[i].zh.join('') + cardTypes.CLOZE;
            if (!studyList[key] && newCards[i].en) {
                added++;
                newKeys.push(key);
                studyList[key] = {
                    en: newCards[i].en,
                    // due after the recognition cards, for some reason
                    due: Date.now() + newCards.length + i,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.CLOZE,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
    };
    let addCards = function (currentExamples, text) {
        let newCards = currentExamples[text].map((x, i) => ({ ...x, due: Date.now() + i }));
        let newKeys = [];
        for (let i = 0; i < newCards.length; i++) {
            let zhJoined = newCards[i].zh.join('');
            if (!studyList[zhJoined] && newCards[i].en) {
                newKeys.push(zhJoined);
                studyList[zhJoined] = {
                    en: newCards[i].en,
                    due: newCards[i].due,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.RECOGNITION,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
        addRecallCards(newCards, text, newKeys);
        addClozeCards(newCards, text, newKeys);
        //TODO: remove these keys from /deleted/ to allow re-add
        //update it whenever it changes
        saveStudyList(newKeys, null, true);
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
    };

    let inStudyList = function (text) {
        return studyList[text];
    };

    let getCardPerformance = function (character) {
        let count = 0;
        let correct = 0;
        let incorrect = 0;
        //TODO: if performance becomes an issue, we can pre-compute this
        //as-is, it performs fine even with larger flashcard decks
        Object.keys(studyList || {}).forEach(x => {
            if (x.indexOf(character) >= 0) {
                count++;
                correct += studyList[x].rightCount;
                incorrect += studyList[x].wrongCount;
            }
        });
        return { count: count, performance: Math.round(100 * correct / ((correct + incorrect) || 1)) };
    };

    let getStudyList = function () {
        return studyList;
    };
    let findOtherCards = function (seeking, currentKey) {
        let cards = Object.keys(studyList);
        let candidates = cards.filter(x => x !== currentKey && (!studyList[x].type || studyList[x].type === cardTypes.RECOGNITION) && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
        return candidates;
    };

    let removeFromStudyList = function (key) {
        delete studyList[key];
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
        addDeletedKey(key);
    };

    let getISODate = function (date) {
        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        return (
            date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()));
    };

    let recordEvent = function (result) {
        let currentDate = new Date();
        let hour = currentDate.getHours();
        let day = getISODate(currentDate);
        if (!studyResults.hourly[hour]) {
            studyResults.hourly[hour] = {};
            studyResults.hourly[hour][studyResult.CORRECT] = 0;
            studyResults.hourly[hour][studyResult.INCORRECT] = 0;
        }
        //fix up potential response from backend that doesn't include one of correct or incorrect
        //i.e., check above sets it, then we get a response when reading from backend that has the given hour but
        //no correct or incorrect property, which can happen if you get X wrong/right in a row to start an hour
        //we can be confident we'll still have hourly and daily as those are written in the same operation
        //TODO check firebase docs
        if (!studyResults.hourly[hour][result]) {
            studyResults.hourly[hour][result] = 0;
        }
        studyResults.hourly[hour][result]++;
        if (!studyResults.daily[day]) {
            studyResults.daily[day] = {};
            studyResults.daily[day][studyResult.CORRECT] = 0;
            studyResults.daily[day][studyResult.INCORRECT] = 0;
        }
        //fix up potential response from backend that doesn't include one of correct or incorrect
        //i.e., check above sets it, then we get a response when reading from backend that has the given day but
        //no correct or incorrect property, which can happen if you get X wrong/right in a row to start a day
        if (!studyResults.daily[day][result]) {
            studyResults.daily[day][result] = 0;
        }
        studyResults.daily[day][result]++;

        if (authenticatedUser) {
            const db = getDatabase();
            const resultRef = ref(db, 'users/' + authenticatedUser.uid + '/results/zh-CN/');
            let updates = {};
            //using client side date since offline mode is possible (which means a batch could come in well after it happened),
            //plus I prefer the user's perception of the time to win out, and their machine being incorrect should be rare
            updates['hourly/' + (hour + '/' + result)] = increment(1);
            updates['daily/' + (day + '/' + result)] = increment(1);

            update(resultRef, updates).then(() => {
                fetchStudyResults();
                fetchVisited();
            }).catch((error) => {
                console.log(error);
            });
        }
        localStorage.setItem('studyResults', JSON.stringify(studyResults));
        callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
    };

    let addDeletedKey = function (key) {
        //if there's no user, the key will have been pulled out of localStorage; no further action
        //if there is a user, write this key to the set of deleted keys, and let the corresponding
        //update handler clear the key on any other devices
        if (authenticatedUser) {
            const db = getDatabase();
            const flashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/deleted/zh-CN');
            let updates = {};
            updates[sanitizeKey(key)] = true;
            update(flashcardRef, updates);
        }
    };

    let mergeStudyLists = function (baseStudyList, targetStudyList) {
        let madeChanges = false;
        baseStudyList = baseStudyList || {};
        for (const key in targetStudyList) {
            if (!baseStudyList[key] ||
                (baseStudyList[key].rightCount + baseStudyList[key].wrongCount) <
                (targetStudyList[key].rightCount + targetStudyList[key].wrongCount)) {
                madeChanges = true;
                baseStudyList[key] = targetStudyList[key];
            } else if ((baseStudyList[key].rightCount + baseStudyList[key].wrongCount) ===
                (targetStudyList[key].rightCount + targetStudyList[key].wrongCount)) {
                if (targetStudyList[key].due !== baseStudyList[key].due) {
                    baseStudyList[key].due = Math.min(baseStudyList[key].due, targetStudyList[key].due);
                    madeChanges = true;
                }
            }
        }
        studyList = baseStudyList;
        localStorage.setItem('studyList', JSON.stringify(studyList));
        return madeChanges;
    };
    let sanitizeKey = function (key) {
        return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
    };

    let fetchStudyResults = function () {
        if (canUpdateNonCriticalData(authenticatedUser, studyResultsLastUpdated)) {
            //potentially could still get in here twice, but not super concerned about an extra read or two in rare cases
            studyResultsLastUpdated = Date.now();
            const dbRef = ref(getDatabase());
            get(child(dbRef, `users/${authenticatedUser.uid}/results/zh-CN`)).then((snapshot) => {
                studyResults = snapshot.val() || studyResults;
                localStorage.setItem('studyResults', JSON.stringify(studyResults));
                callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
            }).catch((error) => {
                studyResultsLastUpdated = null;
                console.error(error);
            });
        }
    };
    let fetchVisited = function () {
        if (canUpdateNonCriticalData(authenticatedUser, visitedLastUpdated)) {
            visitedLastUpdated = Date.now();
            const dbRef = ref(getDatabase());
            get(child(dbRef, `users/${authenticatedUser.uid}/visited/zh-CN`)).then((snapshot) => {
                visited = snapshot.val() || visited;
                localStorage.setItem('visited', JSON.stringify(visited));
                callbacks[dataTypes.visited].forEach(x => x(visited));
            }).catch((error) => {
                visitedLastUpdated = null;
                console.error(error);
            });
        }
    };

    let initialize$4 = function () {
        let auth = getAuth();
        // TODO cancel callback?
        onAuthStateChanged(auth, (user) => {
            if (user) {
                authenticatedUser = user;
                //TODO get study results here, too
                const db = getDatabase();
                const flashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/decks/zh-CN');
                onValue(flashcardRef, (snapshot) => {
                    const data = snapshot.val();
                    let studyListDirty = JSON.parse(localStorage.getItem('studyListDirty') || "false");
                    if (studyListDirty) {
                        //TODO: it gets reset to true if the write fails, but is this actually the right spot?
                        localStorage.setItem('studyListDirty', false);
                        //TODO: should we use the in-memory studyList variable?
                        //this is an artifact of a prior implementation where it wasn't necessarily loaded
                        //immediately...
                        let localStudyList = JSON.parse(localStorage.getItem('studyList') || '{}');
                        let updates = [];
                        for (const key in localStudyList) {
                            if (!data || !data[key] ||
                                (data[key].rightCount + data[key].wrongCount) <
                                (localStudyList[key].rightCount + localStudyList[key].wrongCount)) {
                                updates.push(key);
                            }
                        }
                        if (updates.length > 0) {
                            saveStudyList(updates, localStudyList);
                            //break out and let the save re-trigger this
                            return;
                        }
                    }
                    if (data) {
                        if (mergeStudyLists(studyList, data)) {
                            callbacks[dataTypes.studyList].forEach(x => x(studyList));
                        }
                    }
                });
                const deletedFlashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/deleted/zh-CN');
                onValue(deletedFlashcardRef, (snapshot) => {
                    const data = snapshot.val() || {};
                    let madeChanges = false;
                    for (const key in data) {
                        if (studyList[key]) {
                            delete studyList[key];
                            madeChanges = true;
                        }
                    }
                    if (madeChanges) {
                        callbacks[dataTypes.studyList].forEach(x => x(studyList));
                    }
                });
                fetchStudyResults();
                fetchVisited();
            }
        });
    };

    let cy = null;

    let dfs = function (start, elements, maxDepth, visited, maxLevel) {
        if (maxDepth < 0) {
            return;
        }
        let curr = hanzi[start];
        //todo does javascript have a set?
        visited[start] = true;
        for (const [key, value] of Object.entries(curr.edges)) {
            //don't add outgoing edges when we won't process the next layer
            if (maxDepth > 0 && value.level <= maxLevel) {
                if (!visited[key]) {
                    elements.edges.push({ data: { id: Array.from(start + key).sort().toString(), source: start, target: key, level: value.level, words: value.words } });
                }
            }
        }
        elements.nodes.push({ data: { id: start, level: curr.node.level } });
        for (const [key, value] of Object.entries(curr.edges)) {
            if (!visited[key] && value.level <= maxLevel) {
                dfs(key, elements, maxDepth - 1, visited, maxLevel);
            }
        }
    };
    //this file meant to hold all cytoscape-related code
    let levelColor = function (element) {
        let level = element.data('level');
        switch (level) {
            case 6:
                return '#68aaee';
            case 5:
                return '#de68ee';
            case 4:
                return '#6de200';
            case 3:
                return '#fff249';
            case 2:
                return '#ff9b35';
            case 1:
                return '#ff635f';
        }
    };

    let layout = function (root, numNodes) {
        //very scientifically chosen 95 (不 was slow to load)
        //the grid layout appears to be far faster than cose
        //keeping root around in case we want to switch back to bfs
        if (numNodes > 95) {
            return {
                name: 'grid'
            };
        }
        return {
            name: 'cose',
            animate: false
        };
    };
    let getStylesheet = function () {
        //TODO make this injectable
        let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        return [
            {
                selector: 'node',
                style: {
                    'background-color': levelColor,
                    'label': 'data(id)',
                    'color': 'black',
                    'font-size': '16px',
                    'text-valign': 'center',
                    'text-halign': 'center'
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color': levelColor,
                    'target-arrow-shape': 'none',
                    'curve-style': 'straight',
                    'label': 'data(words)',
                    'color': (_ => prefersLight ? 'black' : '#eee'),
                    'font-size': '10px',
                    'text-background-color': (_ => prefersLight ? '#f9f9f9' : 'black'),
                    'text-background-opacity': '1',
                    'text-background-shape': 'round-rectangle',
                    'text-events': 'yes'
                }
            }
        ];
    };
    let setupCytoscape = function (root, elements, graphContainer, nodeEventHandler, edgeEventHandler) {
        cy = cytoscape({
            container: graphContainer,
            elements: elements,
            layout: layout(root, elements.nodes.length),
            style: getStylesheet(),
            maxZoom: 10,
            minZoom: 0.5
        });
        cy.on('tap', 'node', nodeEventHandler);
        cy.on('tap', 'edge', edgeEventHandler);
    };
    let initializeGraph = function (value, maxLevel, containerElement, nodeEventHandler, edgeEventHandler) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(value, result, maxDepth, {}, maxLevel);
        setupCytoscape(value, result, containerElement, nodeEventHandler, edgeEventHandler);
    };
    let addToGraph = function (character, maxLevel) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(character, result, maxDepth, {}, maxLevel);
        let preNodeCount = cy.nodes().length;
        let preEdgeCount = cy.edges().length;
        cy.add(result);
        if (cy.nodes().length !== preNodeCount || cy.edges().length !== preEdgeCount) {
            //if we've actually added to the graph, re-render it; else just let it be
            cy.layout(layout(character, cy.nodes().length)).run();
        }
    };
    let isInGraph = function (node) {
        return cy && cy.getElementById(node).length;
    };
    let updateColorScheme = function () {
        if (!cy) {
            return;
        }
        cy.style(getStylesheet());
    };

    //TODO: like in other files, remove these dups
    const recommendationsContainer = document.getElementById('recommendations-container');
    const hanziBox$1 = document.getElementById('hanzi-box');
    let recommendationsWorker = null;

    let initialize$3 = function () {
        recommendationsWorker = new Worker('js/modules/recommendations-worker.js');
        recommendationsWorker.postMessage({
            type: 'graph',
            payload: window.hanzi
        });
        recommendationsWorker.postMessage({
            type: 'visited',
            payload: getVisited()
        });
        registerCallback(dataTypes.visited, function (visited) {
            recommendationsWorker.postMessage({
                type: 'visited',
                payload: visited
            });
        });
        recommendationsWorker.onmessage = function (e) {
            //this whole function could really use a refactor
            if (e.data.recommendations && e.data.recommendations.length) {
                recommendationsContainer.innerHTML = '';
                let recommendationMessage = document.createElement('span');
                recommendationMessage.style.display = 'none';
                recommendationMessage.innerText = "Recommended:";
                recommendationMessage.className = "recommendation-message";
                recommendationsContainer.appendChild(recommendationMessage);
                recommendationsContainer.removeAttribute('style');
                let usedRecommendation = false;
                for (let i = 0; i < e.data.recommendations.length; i++) {
                    //don't bother recommending items already being shown in the graph
                    if (isInGraph(e.data.recommendations[i])) {
                        continue;
                    }
                    recommendationMessage.removeAttribute('style');
                    let curr = document.createElement('a');
                    curr.innerText = e.data.recommendations[i];
                    curr.className = 'recommendation';
                    curr.addEventListener('click', function (event) {
                        //can I do this?
                        hanziBox$1.value = event.target.innerText;
                        document.querySelector('#hanzi-choose input[type=submit]').click();
                        event.target.style.display = 'none';
                        let otherRecs = document.querySelectorAll('.recommendation');
                        let stillShown = false;
                        for (let i = 0; i < otherRecs.length; i++) {
                            if (!otherRecs[i].style.display || otherRecs[i].style.display !== 'none') {
                                stillShown = true;
                                break;
                            }
                        }
                        if (!stillShown) {
                            recommendationsContainer.style.display = 'none';
                        }
                    });
                    recommendationsContainer.appendChild(curr);
                    usedRecommendation = true;
                }
                let recommendationsFaqLink = document.createElement('a');
                recommendationsFaqLink.className = 'faq-link';
                recommendationsFaqLink.innerText = "Why?";
                recommendationsFaqLink.addEventListener('click', function () {
                    showFaq(faqTypes.recommendations);
                });
                if (usedRecommendation) {
                    recommendationsContainer.appendChild(recommendationsFaqLink);
                }
            } else {
                recommendationsContainer.style.display = 'none';
            }
        };
    };
    let graphChanged = function () {
        recommendationsWorker.postMessage({
            type: 'graph',
            payload: window.hanzi
        });
    };
    let preferencesChanged = function (val) {
        let minLevel = 1;
        let maxLevel = 6;
        if (val === 'easy') {
            maxLevel = 3;
        } else if (val === 'hard') {
            minLevel = 4;
        }
        recommendationsWorker.postMessage({
            type: 'levelPreferences',
            payload: {
                minLevel: minLevel,
                maxLevel: maxLevel
            }
        });
    };

    //TODO break this down further
    //refactor badly needed...hacks on top of hacks at this point
    let maxExamples = 5;
    let currentExamples = {};
    let currentHanzi = null;
    let currentWord = null;
    let undoChain = [];
    let tabs = {
        explore: 'explore',
        study: 'study'
    };
    let activeTab = tabs.explore;

    let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
    let freqLegend = ['Top500', 'Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k'];
    let legendElements = document.querySelectorAll('div.circle');
    let graphOptions = {
        newHsk: {
            display: 'New HSK', prefix: 'new-hsk-', legend: hskLegend
        },
        oldHsk: {
            display: 'Old HSK', prefix: '', legend: hskLegend
        },
        top10k: {
            display: 'Top 10k words', prefix: 'top-10k-', legend: freqLegend
        },
        traditional: {
            display: 'Top 10k traditional', prefix: 'trad-', legend: freqLegend
        }
    };
    let activeGraph = graphOptions.oldHsk;
    let getActiveGraph = function () {
        return activeGraph;
    };

    //top-level section container
    const mainContainer$1 = document.getElementById('container');

    const exploreTab = document.getElementById('show-explore');
    const studyTab$1 = document.getElementById('show-study');

    const mainHeader = document.getElementById('main-header');

    //study items...these may not belong in this file
    const studyContainer = document.getElementById('study-container');

    //explore tab items
    const examplesList = document.getElementById('examples');
    const exampleContainer = document.getElementById('example-container');
    //explore tab navigation controls
    const hanziBox = document.getElementById('hanzi-box');
    const hanziSearchForm = document.getElementById('hanzi-choose');
    const previousHanziButton = document.getElementById('previousHanziButton');
    //recommendations
    const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

    //menu items
    const graphSelector = document.getElementById('graph-selector');
    const levelSelector = document.getElementById('level-selector');
    const menuButton = document.getElementById('menu-button');
    const menuContainer = document.getElementById('menu-container');
    const menuExitButton = document.getElementById('menu-exit-button');
    const showPinyinCheckbox = document.getElementById('show-pinyin');
    const togglePinyinLabel = document.getElementById('toggle-pinyin-label');

    let getZhTts = function () {
        //use the first-encountered zh-CN voice for now
        return speechSynthesis.getVoices().find(voice => voice.lang === "zh-CN");
    };
    let zhTts = getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    speechSynthesis.onvoiceschanged = function () {
        if (!zhTts) {
            zhTts = getZhTts();
        }
    };

    let runTextToSpeech = function (text, anchors) {
        zhTts = zhTts || getZhTts();
        //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
        if (zhTts) {
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "zh-CN";
            utterance.voice = zhTts;
            utterance.addEventListener('boundary', function (event) {
                if (event.charIndex == null || event.charLength == null) {
                    return false;
                }
                anchors.forEach((character, index) => {
                    if (index >= event.charIndex && index < (event.charIndex + (event.charLength || 1))) {
                        character.style.fontWeight = 'bold';
                    } else {
                        character.style.fontWeight = 'normal';
                    }
                });
            });
            utterance.addEventListener('end', function () {
                anchors.forEach(character => {
                    character.removeAttribute('style');
                });
            });
            speechSynthesis.speak(utterance);
        }
    };

    let addTextToSpeech = function (holder, text, aList) {
        let textToSpeechButton = document.createElement('span');
        textToSpeechButton.className = 'text-button listen';
        textToSpeechButton.textContent = 'Listen';
        textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
        holder.appendChild(textToSpeechButton);
    };
    let addSaveToListButton = function (holder, text) {
        let buttonTexts = ['In your study list!', 'Add to study list'];
        let saveToListButton = document.createElement('span');
        saveToListButton.className = 'text-button';
        saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
        saveToListButton.addEventListener('click', function () {
            addCards(currentExamples, text);
            saveToListButton.textContent = buttonTexts[0];
        });
        holder.appendChild(saveToListButton);
    };

    let persistState = function () {
        let localUndoChain = undoChain.length > 5 ? undoChain.slice(0, 5) : undoChain;
        localStorage.setItem('state', JSON.stringify({
            hanzi: currentHanzi,
            word: currentWord,
            level: levelSelector.value,
            undoChain: localUndoChain,
            activeTab: activeTab,
            currentGraph: activeGraph.display,
            graphPrefix: activeGraph.prefix
        }));
    };
    let setupDefinitions = function (definitionList, definitionHolder) {
        for (let i = 0; i < definitionList.length; i++) {
            let definitionItem = document.createElement('li');
            let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
            definitionItem.textContent = definitionContent;
            definitionHolder.appendChild(definitionItem);
        }
    };
    let findExamples = function (word) {
        let examples = [];
        //used for e.g., missing translation
        let lessDesirableExamples = [];
        //TODO consider indexing up front
        //can also reuse inner loop...consider inverting
        for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].zh.includes(word)) {
                if (sentences[i].en && sentences[i].pinyin) {
                    examples.push(sentences[i]);
                    if (examples.length === maxExamples) {
                        break;
                    }
                } else if (lessDesirableExamples.length < maxExamples) {
                    lessDesirableExamples.push(sentences[i]);
                }
            }
        }
        if (examples.length < maxExamples && lessDesirableExamples.length > 0) {
            examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (maxExamples - examples.length)));
        }
        //TODO...improve
        examples.sort((a, b) => {
            if (a.en && !b.en) {
                return -1;
            } else if (!a.en && b.en) {
                return 1;
            } else {
                return a.zh.length - b.zh.length;
            }
        });
        return examples;
    };
    let setupExampleElements = function (examples, exampleList) {
        for (let i = 0; i < examples.length; i++) {
            let exampleHolder = document.createElement('li');
            let zhHolder = document.createElement('p');
            let exampleText = examples[i].zh.join('');
            let aList = makeSentenceNavigable(exampleText, zhHolder, true);
            zhHolder.className = 'zh-example example-line';
            addTextToSpeech(zhHolder, exampleText, aList);
            exampleHolder.appendChild(zhHolder);
            if (examples[i].pinyin) {
                let pinyinHolder = document.createElement('p');
                pinyinHolder.textContent = examples[i].pinyin;
                pinyinHolder.className = 'pinyin-example example-line';
                exampleHolder.appendChild(pinyinHolder);
            }
            let enHolder = document.createElement('p');
            enHolder.textContent = examples[i].en;
            enHolder.className = 'example-line';
            exampleHolder.appendChild(enHolder);
            exampleList.appendChild(exampleHolder);
        }
    };
    let setupExamples = function (words) {
        currentExamples = {};
        //TODO this mixes markup modification and example finding
        //refactor needed
        while (examplesList.firstChild) {
            examplesList.firstChild.remove();
        }
        for (let i = 0; i < words.length; i++) {
            let examples = findExamples(words[i]);
            currentExamples[words[i]] = [];

            let item = document.createElement('li');
            let wordHolder = document.createElement('h2');
            wordHolder.textContent = words[i];
            addTextToSpeech(wordHolder, words[i], []);
            addSaveToListButton(wordHolder, words[i]);
            item.appendChild(wordHolder);

            let definitionHolder = document.createElement('ul');
            definitionHolder.className = 'definition';
            let definitionList = definitions[words[i]] || [];
            setupDefinitions(definitionList, definitionHolder);
            item.appendChild(definitionHolder);

            let contextHolder = document.createElement('p');
            //TODO not so thrilled with 'context' as the name here
            contextHolder.className = 'context';
            contextHolder.innerText += "Previously: ";
            [...words[i]].forEach(x => {
                let cardData = getCardPerformance(x);
                contextHolder.innerText += `${x} seen ${getVisited()[x] || 0} times; in ${cardData.count} flash cards (${cardData.performance}% correct). `;
            });
            let contextFaqLink = document.createElement('a');
            contextFaqLink.className = 'faq-link';
            contextFaqLink.textContent = "Learn more.";
            contextFaqLink.addEventListener('click', function () {
                showFaq(faqTypes.context);
            });
            contextHolder.appendChild(contextFaqLink);
            item.appendChild(contextHolder);

            //TODO: definition list doesn't have the same interface (missing zh field)
            currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
            //setup current examples for potential future export
            currentExamples[words[i]].push(...examples);

            if (words[i].length === 1 && !singleCharacterWords.has(words[i])) {
                let exampleWarning = document.createElement('p');
                exampleWarning.className = 'example-warning';
                //I know I shouldn't do this, but I'll refactor any day now
                exampleWarning.textContent = `This character does not appear alone in the ${activeGraph.display}. It appears only as part of other words. Examples seen by clicking the connecting lines may be of higher quality. `;
                let warningFaqLink = document.createElement('a');
                warningFaqLink.textContent = "Learn more.";
                warningFaqLink.className = 'faq-link';
                warningFaqLink.addEventListener('click', function () {
                    showFaq(faqTypes.singleCharWarning);
                });
                exampleWarning.appendChild(warningFaqLink);
                item.appendChild(exampleWarning);
            }
            let exampleList = document.createElement('ul');
            item.appendChild(exampleList);
            setupExampleElements(examples, exampleList);

            examplesList.append(item);
        }
        currentWord = words;
    };
    let updateUndoChain = function () {
        //push clones onto the stack
        undoChain.push({ hanzi: [...currentHanzi], word: (currentWord ? [...currentWord] : currentWord) });
    };

    //TODO can this be combined with the definition rendering part?
    let getCardFromDefinitions = function (text, definitionList) {
        //this assumes definitionList non null
        let result = { zh: [text] };
        let answer = '';
        for (let i = 0; i < definitionList.length; i++) {
            answer += definitionList[i].pinyin + ': ' + definitionList[i].en;
            answer += i == definitionList.length - 1 ? '' : ', ';
        }
        result['en'] = answer;
        return result;
    };

    let nodeTapHandler = function (evt) {
        let id = evt.target.id();
        let maxLevel = levelSelector.value;
        updateUndoChain();
        //not needed if currentHanzi contains id, which would mean the nodes have already been added
        //includes O(N) but currentHanzi almost always < 10 elements
        if (currentHanzi && !currentHanzi.includes(id)) {
            addToExistingGraph(id, maxLevel);
        }
        setupExamples([id]);
        persistState();
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([id]);
    };
    let edgeTapHandler = function (evt) {
        let words = evt.target.data('words');
        updateUndoChain();
        setupExamples(words);
        persistState();
        //TODO toggle functions
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([evt.target.source().id(), evt.target.target().id()]);
    };
    let addToExistingGraph = function (character, maxLevel) {
        addToGraph(character, maxLevel);
        //currentHanzi must be set up before this call
        currentHanzi.push(character);
    };
    let updateGraph = function (value, maxLevel) {
        document.getElementById('graph').remove();
        let nextGraph = document.createElement("div");
        nextGraph.id = 'graph';
        //TODO: makes assumption about markup order
        mainContainer$1.append(nextGraph);

        if (value && hanzi[value]) {
            initializeGraph(value, maxLevel, nextGraph, nodeTapHandler, edgeTapHandler);
            currentHanzi = [value];
            persistState();
        }
    };

    let initialize$2 = function () {
        let oldState = JSON.parse(localStorage.getItem('state'));
        if (!oldState) {
            //graph chosen is default, no need to modify legend or dropdown
            //add a default graph on page load to illustrate the concept
            let defaultHanzi = ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"];
            updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], levelSelector.value);
        } else {
            if (state.currentGraph) {
                let activeGraphKey = Object.keys(graphOptions).find(x => graphOptions[x].display === state.currentGraph);
                activeGraph = graphOptions[activeGraphKey];
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                graphSelector.value = state.currentGraph;
            }
            levelSelector.value = oldState.level;
            //oldState.hanzi should always have length >= 1
            updateGraph(oldState.hanzi[0], oldState.level);
            for (let i = 1; i < oldState.hanzi.length; i++) {
                addToExistingGraph(oldState.hanzi[i], oldState.level);
            }
            if (oldState.word) {
                setupExamples(oldState.word);
            }
            undoChain = oldState.undoChain;
            if (oldState.activeTab === tabs.study) {
                //reallllllly need a toggle method
                //this does set up the current card, etc.
                studyTab$1.click();
            }
            persistState();
        }
        matchMedia("(prefers-color-scheme: light)").addEventListener("change", updateColorScheme);
    };

    let makeSentenceNavigable = function (text, container, noExampleChange) {
        let sentenceContainer = document.createElement('span');
        sentenceContainer.className = "sentence-container";

        let anchorList = [];
        for (let i = 0; i < text.length; i++) {
            (function (character) {
                let a = document.createElement('a');
                a.textContent = character;
                if (hanzi[character]) {
                    a.className = 'navigable';
                }
                a.addEventListener('click', function () {
                    if (hanzi[character]) {
                        let updated = false;
                        if (currentHanzi && !currentHanzi.includes(character)) {
                            updateUndoChain();
                            updated = true;
                            updateGraph(character, levelSelector.value);
                        }
                        //enable seamless switching, but don't update if we're already showing examples for character
                        if (!noExampleChange && (!currentWord || (currentWord.length !== 1 || currentWord[0] !== character))) {
                            if (!updated) {
                                updateUndoChain();
                            }
                            setupExamples([character]);
                        }
                        persistState();
                    }
                });
                anchorList.push(a);
                sentenceContainer.appendChild(a);
            }(text[i]));
        }
        container.appendChild(sentenceContainer);
        return anchorList;
    };

    hanziSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let value = hanziBox.value;
        let maxLevel = levelSelector.value;
        if (value && hanzi[value]) {
            updateUndoChain();
            updateGraph(value, maxLevel);
            setupExamples([value]);
            persistState();
            updateVisited([value]);
        }
    });

    levelSelector.addEventListener('change', function () {
        //TODO hide edges in existing graph rather than rebuilding
        //TODO refresh after level change can be weird
        updateGraph(currentHanzi[currentHanzi.length - 1], levelSelector.value);
    });

    previousHanziButton.addEventListener('click', function () {
        if (!undoChain.length) {
            return;
        }
        let next = undoChain.pop();
        let maxLevel = levelSelector.value;
        updateGraph(next.hanzi[0], maxLevel);
        for (let i = 1; i < next.hanzi.length; i++) {
            addToExistingGraph(next.hanzi[i], maxLevel);
        }
        if (next.word) {
            setupExamples(next.word);
        }
        persistState();
    });
    showPinyinCheckbox.addEventListener('change', function () {
        let toggleLabel = togglePinyinLabel;
        if (showPinyinCheckbox.checked) {
            toggleLabel.innerText = 'Turn off pinyin in examples';
        } else {
            toggleLabel.innerText = 'Turn on pinyin in examples';
        }
    });
    exploreTab.addEventListener('click', function () {
        exampleContainer.removeAttribute('style');
        studyContainer.style.display = 'none';
        //TODO could likely do all of this with CSS
        exploreTab.classList.add('active');
        studyTab$1.classList.remove('active');
        activeTab = tabs.explore;
        persistState();
    });

    studyTab$1.addEventListener('click', function () {
        exampleContainer.style.display = 'none';
        studyContainer.removeAttribute('style');
        studyTab$1.classList.add('active');
        exploreTab.classList.remove('active');
        activeTab = tabs.study;
        persistState();
    });

    recommendationsDifficultySelector.addEventListener('change', function () {
        let val = recommendationsDifficultySelector.value;
        preferencesChanged(val);
    });

    menuButton.addEventListener('click', function () {
        mainContainer$1.style.display = 'none';
        menuContainer.removeAttribute('style');
    });
    menuExitButton.addEventListener('click', function () {
        menuContainer.style.display = 'none';
        mainContainer$1.removeAttribute('style');
    });

    let switchGraph = function () {
        let value = graphSelector.value;
        if (value !== activeGraph.display) {
            let key = Object.keys(graphOptions).find(x => graphOptions[x].display === value);
            activeGraph = graphOptions[key];
            let prefix = activeGraph.prefix;
            //fetch regardless...allow service worker and/or browser cache to optimize
            fetch(`./data/${prefix}graph.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.hanzi = data;
                    graphChanged();
                    legendElements.forEach((x, index) => {
                        x.innerText = activeGraph.legend[index];
                    });
                });
            fetch(`./data/${prefix}sentences.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.sentences = data;
                });
            fetch(`./data/${prefix}single-char-words.json`)
                .then(response => response.json())
                .then(function (data) {
                    singleCharacterWords = new Set(data);
                });
            persistState();
        }
    };

    graphSelector.addEventListener('change', switchGraph);

    //TODO probably doesn't belong here and should instead be indirected (could also just export from base)
    const studyTab = document.getElementById('show-study');

    const exportStudyListButton = document.getElementById('exportStudyListButton');
    const cardQuestionContainer = document.getElementById('card-question-container');
    const cardAnswerContainer = document.getElementById('card-answer-container');
    const showAnswerButton = document.getElementById('show-answer-button');
    const taskCompleteElement = document.getElementById('task-complete');
    const cardsDueElement = document.getElementById('cards-due');
    const cardsDueCounter = document.getElementById('card-due-count');
    const taskDescriptionElement = document.getElementById('task-description');
    const cardAnswerElement = document.getElementById('card-answer');
    const wrongButton = document.getElementById('wrong-button');
    const rightButton = document.getElementById('right-button');
    const deleteCardButton = document.getElementById('delete-card-button');

    const relatedCardsContainer = document.getElementById('related-cards-container');
    const relatedCardsElement = document.getElementById('related-cards');
    const relatedCardQueryElement = document.getElementById('related-card-query');
    const cardOldMessageElement = document.getElementById('card-old-message');
    const cardNewMessageElement = document.getElementById('card-new-message');
    const cardRightCountElement = document.getElementById('card-right-count');
    const cardWrongCountElement = document.getElementById('card-wrong-count');
    const cardPercentageElement = document.getElementById('card-percentage');
    const clozePlaceholderCharacter = "*";
    const clozePlaceholder = clozePlaceholderCharacter + clozePlaceholderCharacter + clozePlaceholderCharacter;

    let currentKey = null;

    // TODO: must match cardTypes, which sucks
    // why can't you do: {cardTypes.RECOGNITION: function(){...}}?
    const cardRenderers = {
        'recognition': function (currentCard) {
            taskDescriptionElement.innerText = 'What does the text below mean?';
            let question = currentCard.zh.join('');
            let aList = makeSentenceNavigable(question, cardQuestionContainer);
            for (let i = 0; i < aList.length; i++) {
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            cardQuestionContainer.style.flexDirection = 'row';
            addTextToSpeech(cardQuestionContainer, question, aList);
            cardAnswerElement.textContent = currentCard.en;

        },
        'recall': function (currentCard) {
            let question = currentCard.en;
            let answer = currentCard.zh.join('');
            // so clean, so clean
            if (answer === currentCard.vocabOrigin) {
                taskDescriptionElement.innerText = `Can you match the definitions below to a Chinese word?`;
            } else {
                taskDescriptionElement.innerText = `Can you translate the text below to Chinese?`;
            }
            cardAnswerElement.innerHTML = '';
            let aList = makeSentenceNavigable(answer, cardAnswerElement);
            for (let i = 0; i < aList.length; i++) {
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            addTextToSpeech(cardAnswerElement, answer, aList);
            cardQuestionContainer.innerText = question;
        },
        'cloze': function (currentCard) {
            taskDescriptionElement.innerText = `Can you replace ${clozePlaceholder} to match the translation?`;
            let clozedSentence = currentCard.zh.map(x => x === currentCard.vocabOrigin ? clozePlaceholder : x).join('');
            let clozeContainer = document.createElement('p');
            clozeContainer.className = 'cloze-container';
            let aList = makeSentenceNavigable(clozedSentence, clozeContainer);
            for (let i = 0; i < aList.length; i++) {
                // TODO yuck
                if (i >= 2 && aList[i].innerText === clozePlaceholderCharacter && aList[i - 1].innerText === clozePlaceholderCharacter && aList[i - 2].innerText === clozePlaceholderCharacter) {
                    aList[i].classList.add('cloze-placeholder');
                    aList[i - 1].classList.add('cloze-placeholder');
                    aList[i - 2].classList.add('cloze-placeholder');
                }
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            cardQuestionContainer.style.flexDirection = 'column';
            cardQuestionContainer.appendChild(clozeContainer);
            let clozeAnswerContainer = document.createElement('p');
            clozeAnswerContainer.className = 'cloze-container';
            clozeAnswerContainer.innerText = currentCard.en;
            cardQuestionContainer.appendChild(clozeAnswerContainer);
            cardAnswerElement.innerHTML = '';
            let answerAList = makeSentenceNavigable(currentCard.vocabOrigin, cardAnswerElement);
            for (let i = 0; i < answerAList.length; i++) {
                answerAList[i].addEventListener('click', displayRelatedCards.bind(this, answerAList[i]));
            }
            addTextToSpeech(cardAnswerElement, currentCard.vocabOrigin, answerAList);
        }
    };

    let displayRelatedCards = function (anchor) {
        let MAX_RELATED_CARDS = 3;
        let related = findOtherCards(anchor.textContent, currentKey);
        let studyList = getStudyList();
        relatedCardQueryElement.innerText = anchor.textContent;
        if (!related || !related.length) {
            relatedCardsContainer.style.display = 'none';
            return;
        }
        relatedCardsElement.innerHTML = '';
        for (let i = 0; i < Math.min(MAX_RELATED_CARDS, related.length); i++) {
            let item = document.createElement('p');
            item.className = 'related-card';
            item.innerText = related[i];
            let relatedPerf = document.createElement('p');
            relatedPerf.className = 'related-card-performance';
            relatedPerf.innerText = `(right ${studyList[related[i]].rightCount || 0}, wrong ${studyList[related[i]].wrongCount || 0})`;
            item.appendChild(relatedPerf);
            relatedCardsElement.appendChild(item);
        }
        relatedCardsContainer.removeAttribute('style');
    };

    let setupStudyMode = function () {
        let studyList = getStudyList();
        currentKey = null;
        let currentCard = null;
        cardAnswerContainer.style.display = 'none';
        showAnswerButton.innerText = "Show Answer";
        let counter = 0;
        for (const [key, value] of Object.entries(studyList)) {
            if (value.due <= Date.now()) {
                if (!currentCard || currentCard.due > value.due ||
                    (currentCard.due == value.due && value.zh.length < currentCard.zh.length)) {
                    currentCard = value;
                    currentKey = key;
                }
                counter++;
            }
        }
        cardsDueCounter.textContent = counter;
        cardQuestionContainer.innerHTML = '';
        if (counter === 0) {
            taskCompleteElement.style.display = 'inline';
            taskDescriptionElement.style.display = 'none';
            showAnswerButton.style.display = 'none';
            return;
        }

        taskCompleteElement.style.display = 'none';
        showAnswerButton.style.display = 'block';
        // Old cards have no type property, but all are recognition
        cardRenderers[currentCard.type || cardTypes.RECOGNITION](currentCard);
        taskDescriptionElement.style.display = 'inline';

        if (currentCard.wrongCount + currentCard.rightCount != 0) {
            cardOldMessageElement.removeAttribute('style');
            cardNewMessageElement.style.display = 'none';
            cardPercentageElement.textContent = Math.round(100 * currentCard.rightCount / ((currentCard.rightCount + currentCard.wrongCount) || 1));
            cardRightCountElement.textContent = `${currentCard.rightCount || 0} time${currentCard.rightCount != 1 ? 's' : ''}`;
            cardWrongCountElement.textContent = `${currentCard.wrongCount || 0} time${currentCard.wrongCount != 1 ? 's' : ''}`;
        } else {
            cardNewMessageElement.removeAttribute('style');
            cardOldMessageElement.style.display = 'none';
        }
        relatedCardsContainer.style.display = 'none';
    };

    let initialize$1 = function () {
        showAnswerButton.addEventListener('click', function () {
            showAnswerButton.innerText = "Answer:";
            cardAnswerContainer.style.display = 'block';
            showAnswerButton.scrollIntoView();
        });
        wrongButton.addEventListener('click', function () {
            updateCard(studyResult.INCORRECT, currentKey);
            setupStudyMode();
            cardsDueElement.scrollIntoView();
            cardsDueElement.classList.add('result-indicator-wrong');
            setTimeout(function () {
                cardsDueElement.classList.remove('result-indicator-wrong');
            }, 750);
            recordEvent(studyResult.INCORRECT);
        });
        rightButton.addEventListener('click', function () {
            updateCard(studyResult.CORRECT, currentKey);
            setupStudyMode();
            cardsDueElement.scrollIntoView();
            cardsDueElement.classList.add('result-indicator-right');
            setTimeout(function () {
                cardsDueElement.classList.remove('result-indicator-right');
            }, 750);
            recordEvent(studyResult.CORRECT);
        });
        deleteCardButton.addEventListener('click', function () {
            let deletedKey = currentKey;
            removeFromStudyList(deletedKey);
            //use deletedKey rather than currentKey since saveStudyList can end up modifying what we have
            //same with addDeletedKey
            saveStudyList([deletedKey]);
            setupStudyMode();
        });
        exportStudyListButton.addEventListener('click', function () {
            let studyList = getStudyList();
            let content = "data:text/plain;charset=utf-8,";
            for (const [key, value] of Object.entries(studyList)) {
                // TODO: figure out cloze/recall exports
                if (!value.type || value.type === cardTypes.RECOGNITION) {
                    //replace is a hack for flashcard field separator...TODO could escape
                    content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
                    content += '\n';
                }
            }
            //wow, surely it can't be this absurd
            let encodedUri = encodeURI(content);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "hanzi-graph-export-" + Date.now() + ".txt");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        if (Object.keys(getStudyList() || {}).length > 0) {
            exportStudyListButton.removeAttribute('style');
        }
        //TODO: may want to consider separate callback types for add/delete and also updated
        registerCallback(dataTypes.studyList, function (studyList) {
            if (studyList && Object.keys(studyList).length > 0) {
                exportStudyListButton.removeAttribute('style');
            } else {
                exportStudyListButton.style.display = 'none';
            }
            setupStudyMode();
        });
        studyTab.addEventListener('click', function () {
            setupStudyMode();
        });
    };

    //TODO move these to a central spot
    const mainContainer = document.getElementById('container');
    const statsContainer = document.getElementById('stats-container');

    const statsShow = document.getElementById('stats-show');
    const statsExitButton = document.getElementById('exit-button');

    const hourlyGraphDetail = document.getElementById('hourly-graph-detail');
    const addedCalendarDetail = document.getElementById('added-calendar-detail');
    const studyCalendarDetail = document.getElementById('study-calendar-detail');
    const studyGraphDetail = document.getElementById('studied-graph-detail');
    const visitedGraphDetail = document.getElementById('visited-graph-detail');

    let lastLevelUpdatePrefix = '';

    function sameDay(d1, d2) {
        return d1.getUTCFullYear() == d2.getUTCFullYear() &&
            d1.getUTCMonth() == d2.getUTCMonth() &&
            d1.getUTCDate() == d2.getUTCDate();
    }
    function Calendar(data, {
        id,
        clickHandler = () => { },
        getIntensity = () => { return '' }
    } = {}) {
        let now = new Date();
        let root = document.createElement('div');
        root.id = `${id}-calendar`;
        root.className = 'calendar';
        for (let i = 0; i < data[0].date.getUTCDay(); i++) {
            if (i === 0) {
                let monthIndicator = document.createElement('div');
                monthIndicator.style.gridRow = '1';
                monthIndicator.className = 'month-indicator';
                root.appendChild(monthIndicator);
            }
            let currentDay = document.createElement('div');
            currentDay.className = 'calendar-day-dummy';
            currentDay.style.gridRow = `${i + 2}`;
            root.appendChild(currentDay);
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].date.getUTCDay() === 0) {
                let monthIndicator = document.createElement('div');
                monthIndicator.style.gridRow = '1';
                monthIndicator.className = 'month-indicator';
                if (data[i].date.getUTCDate() < 8) {
                    monthIndicator.innerText = data[i].date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
                }
                root.appendChild(monthIndicator);
            }
            let currentDay = document.createElement('div');
            if (sameDay(now, data[i].date)) {
                currentDay.id = `${id}-today`;
                currentDay.classList.add('today');
            } else if (now.valueOf() < data[i].date.valueOf()) {
                currentDay.classList.add('future');
            }
            currentDay.style.gridRow = `${data[i].date.getUTCDay() + 2}`;
            //currentDay.style.gridColumn = `${12 - i}`;
            currentDay.classList.add('calendar-day');
            currentDay.classList.add(getIntensity(data[i].total));
            currentDay.addEventListener('click', clickHandler.bind(this, 0, i));
            root.appendChild(currentDay);
        }
        return root;
    }
    function BarChart(data, {
        labelText = () => { return '' },
        color = () => { return '' },
        clickHandler = () => { },
        includeYLabel = true,
        customClass,
        scaleToFit
    } = {}) {
        let root = document.createElement('div');
        root.classList.add('bar-chart');
        if (customClass) {
            root.classList.add(customClass);
        }
        if (includeYLabel) {
            root.style.gridTemplateColumns = `50px repeat(${data.length}, 1fr)`;
            for (let i = 10; i >= 1; i--) {
                let yLabel = document.createElement('div');
                yLabel.style.gridRow = `${100 - (10 * i)}`;
                yLabel.innerText = `${10 * i}% -`;
                yLabel.className = 'bar-chart-y-label';
                root.appendChild(yLabel);
            }
        } else {
            root.style.gridTemplateColumns = `repeat(${data.length}, 1fr)`;
        }
        let scaleMultiplier = 1;
        if (scaleToFit) {
            scaleMultiplier = 100;
            //TODO if you ever get really serious, you could determine the number of rows
            //in the grid for scaling purposes instead of scaling across 100 total
            for (let i = 0; i < data.length; i++) {
                let curr = Math.floor(1 / ((data[i].count || 1) / (data[i].total || 100)));
                scaleMultiplier = Math.min(curr || 1, scaleMultiplier);
            }
        }
        for (let i = 0; i < data.length; i++) {
            let bar = document.createElement('div');
            bar.className = 'bar-chart-bar';
            bar.style.gridColumn = `${i + (includeYLabel ? 2 : 1)}`;
            bar.style.backgroundColor = color(i);
            //how many `|| 1` is too many?
            //you know what, don't answer
            bar.style.gridRow = `${(100 - (Math.floor(100 * (data[i].count * scaleMultiplier) / (data[i].total || 1)) || 1)) || 1} / 101`;
            bar.addEventListener('click', clickHandler.bind(this, i));
            root.appendChild(bar);
        }
        let hr = document.createElement('div');
        hr.style.gridRow = '101';
        //don't try this at home
        hr.style.gridColumn = `${includeYLabel ? 2 : 1}/max`;
        hr.className = 'bar-chart-separator';
        root.appendChild(hr);
        for (let i = 0; i < data.length; i++) {
            let xLabel = document.createElement('div');
            xLabel.className = 'bar-chart-x-label';
            xLabel.style.gridColumn = `${i + (includeYLabel ? 2 : 1)}`;
            xLabel.style.gridRow = '102';
            xLabel.innerText = labelText(i);
            root.appendChild(xLabel);
        }
        return root;
    }

    //TODO: combine with the one in data-layer.js
    let getUTCISODate = function (date) {
        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        return (
            date.getUTCFullYear() +
            '-' +
            pad(date.getUTCMonth() + 1) +
            '-' +
            pad(date.getUTCDate()));
    };
    let getLocalISODate = function (date) {
        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        return (
            date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()));
    };
    let fillGapDays = function (daysWithData, originalData, defaultEntry) {
        let firstDayStudied = daysWithData.length ? daysWithData[0].date : new Date();
        //TODO add trollface ascii art to this insanity
        let today = new Date(getLocalISODate(new Date()));

        //always show at least the last 365 days
        let floorDate = new Date(today.valueOf() - 365 * 24 * 60 * 60 * 1000);
        if (firstDayStudied.valueOf() < floorDate.valueOf()) {
            floorDate = firstDayStudied;
        }

        let start = new Date(getLocalISODate(floorDate));
        let end = new Date(today.valueOf() + (7 * 24 * 60 * 60 * 1000));
        let curr = start.valueOf();
        while (curr <= end.valueOf()) {
            let next = new Date(curr);
            if (!(getUTCISODate(next) in originalData)) {
                daysWithData.push({
                    date: next,
                    ...defaultEntry
                });
            }
            curr += (24 * 60 * 60 * 1000);
        }
    };
    let BarChartClickHandler = function (detail, totalsByLevel, prop, index, message) {
        detail.innerHTML = '';
        //TODO: why no built-in difference method?
        let missingHanzi = new Set([...totalsByLevel[index + 1].characters].filter(x => !totalsByLevel[index + 1][prop].has(x)));
        missingHanzi.forEach(x => message += x);
        detail.innerHTML = message;
    };
    //could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
    let totalsByLevel = {};
    let updateTotalsByLevel = function () {
        totalsByLevel = {};
        Object.keys(hanzi).forEach(x => {
            let level = hanzi[x].node.level;
            if (!(level in totalsByLevel)) {
                totalsByLevel[level] = { seen: new Set(), total: 0, visited: new Set(), characters: new Set() };
            }
            totalsByLevel[level].total++;
            totalsByLevel[level].characters.add(x);
        });
    };
    let createCardGraphs = function (studyList, legend) {
        let studyListCharacters = new Set();
        Object.keys(studyList).forEach(x => {
            for (let i = 0; i < x.length; i++) {
                studyListCharacters.add(x[i]);
            }
        });
        studyListCharacters.forEach(x => {
            if (hanzi[x]) {
                let level = hanzi[x].node.level;
                totalsByLevel[level].seen.add(x);
            }
        });
        let levelData = [];
        //safe since we don't add keys in the read of /decks/
        Object.keys(totalsByLevel).sort().forEach(x => {
            levelData.push({
                count: totalsByLevel[x].seen.size || 0,
                total: totalsByLevel[x].total
            });
        });
        const studiedGraph = document.getElementById('studied-graph');
        studiedGraph.innerHTML = '';
        studiedGraph.appendChild(
            BarChart(levelData, {
                labelText: (i) => legend[i],
                color: () => "#68aaee",
                clickHandler: function (i) {
                    BarChartClickHandler(
                        studyGraphDetail,
                        totalsByLevel,
                        'seen',
                        i,
                        `In ${legend[i]}, your study list doesn't yet contain:<br>`
                    );
                }
            })
        );


        let addedByDay = {};
        let sortedCards = Object.values(studyList).sort((x, y) => {
            return (x.added || 0) - (y.added || 0);
        });
        let seenCharacters = new Set();
        for (const card of sortedCards) {
            //hacky, but truncate to day granularity this way
            if (card.added) {
                let day = getLocalISODate(new Date(card.added));
                if (!(day in addedByDay)) {
                    addedByDay[day] = {
                        chars: new Set(),
                        total: 0
                    };
                }
                addedByDay[day].total++;
                [...card.zh.join('')].forEach(character => {
                    if (hanzi[character] && !seenCharacters.has(character)) {
                        addedByDay[day].chars.add(character);
                        seenCharacters.add(character);
                    }
                });
            } else {
                //cards are sorted with unknown add date at front, so safe to add all at the start
                [...card.zh.join('')].forEach(character => {
                    if (hanzi[character]) {
                        seenCharacters.add(character);
                    }
                });
            }
        }
        let dailyAdds = [];
        for (const [date, result] of Object.entries(addedByDay)) {
            dailyAdds.push({
                date: new Date(date),
                chars: result.chars,
                total: result.total
            });
        }

        fillGapDays(dailyAdds, addedByDay, { chars: new Set(), total: 0 });
        dailyAdds.sort((x, y) => x.date - y.date);

        const addedCalendar = document.getElementById('added-calendar');
        addedCalendar.innerHTML = '';
        addedCalendar.appendChild(
            Calendar(dailyAdds, {
                id: 'added-calendar',
                getIntensity: function (total) {
                    if (total == 0) {
                        return 'empty';
                    } else if (total < 6) {
                        return 's';
                    } else if (total < 12) {
                        return 'm';
                    } else if (total < 18) {
                        return 'l';
                    } else if (total < 24) {
                        return 'xl';
                    } else if (total < 30) {
                        return 'xxl';
                    } else {
                        return 'epic';
                    }
                },
                clickHandler: function (_, i) {
                    addedCalendarDetail.innerHTML = '';

                    let data = dailyAdds[i];
                    let characters = '';
                    data.chars.forEach(x => characters += x);
                    if (data.total && data.chars.size) {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with these new characters: ${characters}`;
                    } else if (data.total) {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with no new characters.`;
                    } else {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added no new cards.`;
                    }
                }
            })
        );
        document.getElementById('added-calendar-calendar').scrollTo({
            top: 0,
            left: document.getElementById('added-calendar-today').offsetLeft
        });
    };
    let createVisitedGraphs = function (visitedCharacters, legend) {
        if (!visitedCharacters) {
            return;
        }
        Object.keys(visitedCharacters).forEach(x => {
            if (hanzi[x]) {
                const level = hanzi[x].node.level;
                totalsByLevel[level].visited.add(x);
            }
        });
        let levelData = [];
        //safe since we don't add keys in the read of /decks/
        Object.keys(totalsByLevel).sort().forEach(x => {
            levelData.push({
                count: totalsByLevel[x].visited.size || 0,
                total: totalsByLevel[x].total
            });
        });
        const visitedGraph = document.getElementById('visited-graph');
        visitedGraph.innerHTML = '';
        visitedGraph.appendChild(
            BarChart(levelData, {
                labelText: (i) => legend[i],
                color: () => "#68aaee",
                clickHandler: function (i) {
                    BarChartClickHandler(
                        visitedGraphDetail,
                        totalsByLevel,
                        'visited',
                        i,
                        `In ${legend[i]}, you haven't yet visited:<br>`
                    );
                }
            })
        );
        document.getElementById('visited-container').removeAttribute('style');
    };

    let createStudyResultGraphs = function (results) {
        let hourlyData = [];
        let dailyData = [];
        for (let i = 0; i < 24; i++) {
            hourlyData.push({
                hour: i,
                correct: (i.toString() in results.hourly) ? (results.hourly[i.toString()].correct || 0) : 0,
                incorrect: (i.toString() in results.hourly) ? (results.hourly[i.toString()].incorrect || 0) : 0
            });
        }
        let total = 0;
        for (let i = 0; i < hourlyData.length; i++) {
            total += hourlyData[i].correct + hourlyData[i].incorrect;
        }
        for (let i = 0; i < 24; i++) {
            hourlyData[i]['count'] = hourlyData[i].correct + hourlyData[i].incorrect;
            hourlyData[i]['total'] = total;
        }
        let daysStudied = Object.keys(results.daily);
        //ISO 8601 lexicographically sortable
        daysStudied.sort((x, y) => x.localeCompare(y));
        for (let i = 0; i < daysStudied.length; i++) {
            let correct = results.daily[daysStudied[i]].correct || 0;
            let incorrect = results.daily[daysStudied[i]].incorrect || 0;
            let total = correct + incorrect;
            dailyData.push({
                date: new Date(daysStudied[i]),
                total: total,
                result: correct - incorrect,
                correct: correct,
                incorrect: incorrect
            });
        }
        fillGapDays(dailyData, results.daily, {
            total: 0,
            result: 0,
            correct: 0,
            incorrect: 0
        });
        dailyData.sort((x, y) => x.date - y.date);
        const studyCalendar = document.getElementById('study-calendar');
        studyCalendar.innerHTML = '';
        studyCalendar.appendChild(
            Calendar(dailyData, {
                id: 'study-calendar',
                getIntensity: function (total) {
                    if (total == 0) {
                        return 'empty';
                    } else if (total < 10) {
                        return 's';
                    } else if (total < 25) {
                        return 'm';
                    } else if (total < 50) {
                        return 'l';
                    } else if (total < 100) {
                        return 'xl';
                    } else if (total < 150) {
                        return 'xxl';
                    } else {
                        return 'epic';
                    }
                },
                clickHandler: function (_, i) {
                    studyCalendarDetail.innerHTML = '';

                    let data = dailyData[i];
                    studyCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you studied ${data.total || 0} cards. You got ${data.correct} right and ${data.incorrect} wrong.`;
                }
            })
        );
        document.getElementById('study-calendar-container').removeAttribute('style');
        document.getElementById('study-calendar-calendar').scrollTo({
            top: 0,
            left: document.getElementById('study-calendar-today').offsetLeft
        });
        //why, you ask? I don't know
        let getHour = function (hour) { return hour == 0 ? '12am' : (hour < 12 ? `${hour}am` : hour == 12 ? '12pm' : `${hour % 12}pm`) };
        let hourlyClickHandler = function (i) {
            if ((hourlyData[i].correct + hourlyData[i].incorrect) !== 0) {
                hourlyGraphDetail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've gotten ${hourlyData[i].correct} correct and ${hourlyData[i].incorrect} incorrect, or ${Math.round((hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100)}% correct.`;
            } else {
                hourlyGraphDetail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've not studied.`;
            }
        };
        let hourlyColor = i => {
            let percentage = (hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100;
            if (percentage <= 100 && percentage >= 75) {
                return '#6de200';
            }
            if (percentage < 75 && percentage >= 50) {
                return '#68aaee';
            }
            if (percentage < 50 && percentage >= 25) {
                return '#ff9b35';
            }
            if (percentage < 25) {
                return '#ff635f';
            }
        };
        const hourlyGraph = document.getElementById('hourly-graph');
        hourlyGraph.innerHTML = '';
        hourlyGraph.appendChild(
            BarChart(hourlyData, {
                labelText: (i) => getHour(i),
                color: hourlyColor,
                clickHandler: hourlyClickHandler,
                includeYLabel: false,
                customClass: 'hours',
                scaleToFit: true
            })
        );
        document.getElementById('hourly-container').removeAttribute('style');
    };

    let initialize = function () {
        lastLevelUpdatePrefix = getActiveGraph().prefix;
        updateTotalsByLevel();
        statsShow.addEventListener('click', function () {
            let activeGraph = getActiveGraph();
            if (activeGraph.prefix !== lastLevelUpdatePrefix) {
                lastLevelUpdatePrefix = activeGraph.prefix;
                updateTotalsByLevel();
            }
            mainContainer.style.display = 'none';
            statsContainer.removeAttribute('style');
            createVisitedGraphs(getVisited(), activeGraph.legend);
            createCardGraphs(getStudyList(), activeGraph.legend);
            createStudyResultGraphs(getStudyResults(), activeGraph.legend);
        });

        statsExitButton.addEventListener('click', function () {
            statsContainer.style.display = 'none';
            mainContainer.removeAttribute('style');
            //TODO this is silly
            studyGraphDetail.innerText = '';
            addedCalendarDetail.innerText = '';
            visitedGraphDetail.innerText = '';
            studyCalendarDetail.innerText = '';
            hourlyGraphDetail.innerText = '';
        });
    };

    Promise.all(
        [
            window.graphFetch
                .then(response => response.json())
                .then(data => window.hanzi = data),
            window.sentencesFetch
                .then(response => response.json())
                .then(data => window.sentences = data),
            window.singleCharacterWordsFetch
                .then(response => response.json())
                .then(data => window.singleCharacterWords = new Set(data))
        ]
    ).then(_ => {
        initialize$7();
        initialize$6();
        initialize$4();
        initialize$1();
        initialize$2();
        initialize();
        initialize$5();
        initialize$3();
    });
    //ideally we'll continue adding to this

})();
