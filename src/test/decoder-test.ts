/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../typings/chai.d.ts" />

import bolt = require('../bolt');
import fileio = require('../file-io');
import helper = require('./test-helper');
import decoder = require('../rules-decoder');

import chai = require('chai');
chai.config.truncateThreshold = 1000;
var assert = chai.assert;


suite("JSON Rules Decoder", function() {
  suite("Basic Samples", function() {
    var tests = [
      { data: { rules: {".read": "true", ".write": "true"} },
        expect: decoder.PREAMBLE + "path / {\n  read() = true;\n  write() = true;\n}",
      },

      { data: { rules: { "a": { ".read": "true", ".write": "true"}} },
        expect: decoder.PREAMBLE + "path /a {\n  read() = true;\n  write() = true;\n}",
      },

      { data: { rules: { "a": { ".validate": "newData.isString()"}} },
        expect: decoder.PREAMBLE + "path /a is String;",
      },
    ];

    helper.dataDrivenTest(tests, function(data, expect) {
      var result = decoder.decodeJSON(data);
      assert.equal(result, expect);
    });
  });

  suite("Decode Sample JSON", function() {
    var files = ["all_access",
                 "userdoc",
                 "mail",
                 "type-extension",
                 "children",
                 "functional",
                 "user-security",
                 "generics",
                 "groups",
                 "multi-update",
                 "chat",
                 "serialized",
                 "map-scalar",
                 "regexp",
                 "decoded"
                ];

    helper.dataDrivenTest(files, function(filename) {
      filename = 'samples/' + filename + '.json';
      return fileio.readFile(filename)
        .then(function(response) {
          let json = JSON.parse(decoder.cleanJSONString(response.content));
          let boltString = decoder.decodeJSON(json);
          let generatedJSON = bolt.generate(boltString);
          assert.deepEqual(generatedJSON, json);
        })
        .catch(function(error) {
          assert.ok(false, error.message);
        });
    });
  });
});