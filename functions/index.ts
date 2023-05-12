/*
 *  Copyright 2022 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { handleRequest } from './handler'
import Configuration from './configuration'

addEventListener('fetch', (event) => {
  const config = new Configuration(
    env.ORIGINS,
    'cf-decap-blog-auth',
    'blabla',
    false,
    '',
    env.OAUTH_CLIENT_ID,
    env._CLIENT_SECRET,
  )
  event.respondWith(handleRequest(event.request, config, fetch))
})
