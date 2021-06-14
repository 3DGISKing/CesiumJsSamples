import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AngularCesiumModule, PointsEditorService} from 'angular-cesium';
import { AngularCesiumWidgetsModule } from 'angular-cesium';
import {PolygonsEditorService, PolylinesEditorService, RectanglesEditorService } from 'angular-cesium';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularCesiumModule.forRoot(),
    AngularCesiumWidgetsModule
  ],
  providers: [
    PolygonsEditorService,
    PolylinesEditorService,
    PointsEditorService,
    RectanglesEditorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
