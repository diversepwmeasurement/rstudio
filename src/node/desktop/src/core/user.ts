/*
 * user.ts
 *
 * Copyright (C) 2022 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import os from 'os';
import { getenv } from './environment';

import { FilePath } from './file-path';

export function userHomePath(): FilePath {
  const user = getenv('R_USER');
  if (user !== '') 
    return new FilePath(user);
  const home = getenv('HOME');
  if (home !== '')
    return new FilePath(home);
  return new FilePath(os.homedir());
}

export function username(): string {
  try {
    return os.userInfo().username;
  } catch (err: unknown) {
    return '';
  }
}
