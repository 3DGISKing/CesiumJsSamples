import { Component } from '@angular/core';

import {PolygonEditorObservable, PolylineEditorObservable, PointEditorObservable} from 'angular-cesium';
import {
  PolylinesEditorService,
  PolygonsEditorService,
  PointsEditorService,
  RectanglesEditorService
} from 'angular-cesium';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Angular Cesium Sample';
  polygonEditing$: PolygonEditorObservable | undefined;
  polylineEditing$: PolylineEditorObservable | undefined;
  constructor(private polygonEditor: PolygonsEditorService,
              private polylineEditor: PolylinesEditorService,
              private pointEditor: PointsEditorService,
              /*private rectanglesEditor = RectanglesEditorService*/) {}

  startPolygonDraw(): void {
    this.polygonEditing$ = this.polygonEditor.create({
      pointProps: {
        color: Cesium.Color.WHITE,
        pixelSize: 10,
      },
      polygonProps: {
        material: Cesium.Color.BLUE.withAlpha(0.3),
      },
      polylineProps: {
        material: () => new Cesium.PolylineDashMaterialProperty()
      }
    });
  }

  startPolylineDraw(): void {
    this.polylineEditing$ = this.polylineEditor.create();
  }

  startPointsDraw(): void {
    this.pointEditor.create();
  }

  startRectangleDraw(): void {
    //this.rectanglesEditor.create();
    alert("not fixed");
  }
}

