/*
 * @license
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

// init project
const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const auth = require('./auth');
const app = express();
const cors = require('cors');

app.use(cors());
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', './views');
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  if (req.get('x-forwarded-proto') &&
    (req.get('x-forwarded-proto')).split(',')[0] !== 'http') {
    return res.redirect(301, `http://${process.env.HOSTNAME}`);
  }
  req.schema = 'http';
  next();
});
app.get('/.well-known/assetlinks.json', (req, res) => {
  const assetlinks = [];
  const relation = [
    'delegate_permission/common.handle_all_urls',
    'delegate_permission/common.get_login_creds'
  ];
    assetlinks.push({
      relation: relation,
      target: {
        namespace: 'web',
        site: `http://${process.env.HOSTNAME}`
      }
    });

    assetlinks.push({
      relation: relation,
      target: {
        namespace: 'android_app',
        package_name: process.env.ANDROID_PACKAGENAME,
        sha256_cert_fingerprints: [process.env.ANDROID_SHA256HASH]
      }
    });

  res.json(assetlinks);
});

app.use('/auth', auth);

// listen for req :)
const port = process.env.GLITCH_DEBUGGER ? null : 8080;
const listener = app.listen(9999 || process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
