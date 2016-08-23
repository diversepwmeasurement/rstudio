/*
 * SourceWindowManager.java
 *
 * Copyright (C) 2009-15 by RStudio, Inc.
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
package org.rstudio.studio.client.workbench.views.source.editors.text;

import org.rstudio.core.client.*;
import org.rstudio.studio.client.common.satellite.SatelliteManager;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class ChunkWindowManager
{
   @Inject
   public ChunkWindowManager(
         Provider<SatelliteManager> pSatelliteManager)
   {
      pSatelliteManager_ = pSatelliteManager;
   }

   // Public methods ---------------------------------------------------------

   public void openChunkWindow(String docId, String chunkId)
   {
      Size size = new Size(800, 800);
      Point position = new Point(0, 0);
      
      pSatelliteManager_.get().openSatellite(
         NAME_PREFIX + docId + "_" + chunkId, 
         ChunkWindowParams.create(docId, chunkId), 
         size, false, position);
   }
   
   // Members -----------------------------------------------------------------
   
   private final Provider<SatelliteManager> pSatelliteManager_;
   
   public final static String NAME_PREFIX = "chunk_window_";
}
