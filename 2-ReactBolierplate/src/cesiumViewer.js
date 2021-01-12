import React, { Component } from 'react';
import * as Cesium from 'cesium';

class CesiumViewer extends Component {
  componentDidMount() {
    this._viewer = new Cesium.Viewer(this.cesiumContainer);
  }

  componentDidUpdate(prevProps) {

  }

  viewer() {
    return this._viewer;
  }

  render() {
    return (
      <div>
        <div id="cesiumContainer" ref={(element) => (this.cesiumContainer = element)} />
      </div>
    );
  }
}

export default CesiumViewer;
