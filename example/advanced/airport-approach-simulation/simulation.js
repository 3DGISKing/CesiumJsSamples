(function () {
    var fixedFrameTransform = Transforms.eastNorthUpToFixedFrame;
    var speedVector = new Cartesian3();
    var currentPosition = new Cartesian3();

    var SPEED = 10;
    var DISPLAY_LIMIT = 500000;
    var isShow;

    viewer.scene.preUpdate.addEventListener(function (scene, time) {
        if (!g_enableAnimation) return;

        for (var i = 0; i < g_approachPathDataArr.length; i++) {
            var newPlanePrimitivePosition = new Cartesian3();

            var approachPathData = g_approachPathDataArr[i];
            var planePrimitive = approachPathData.planePrimitive;
            var pathPositions = approachPathData.pathPositions;

            var startPosition = approachPathData.startPosition;
            currentPosition = Matrix4.getTranslation(planePrimitive.modelMatrix, currentPosition);
            var distance = Cartesian3.distance(startPosition, currentPosition);

            if (distance > approachPathData.distance) {
                // we need to restart simulation
                planePrimitive.modelMatrix = Transforms.headingPitchRollToFixedFrame(
                    approachPathData.startPosition,
                    approachPathData.hpr,
                    Ellipsoid.WGS84,
                    fixedFrameTransform
                );

                pathPositions.splice(0, pathPositions.length);
                pathPositions.push(startPosition);
            }

            speedVector = Cartesian3.multiplyByScalar(Cartesian3.UNIT_X, SPEED, speedVector);

            newPlanePrimitivePosition = Matrix4.multiplyByPoint(
                planePrimitive.modelMatrix,
                speedVector,
                newPlanePrimitivePosition
            );

            pathPositions.push(newPlanePrimitivePosition);

            Transforms.headingPitchRollToFixedFrame(
                newPlanePrimitivePosition,
                approachPathData.hpr,
                Ellipsoid.WGS84,
                fixedFrameTransform,
                planePrimitive.modelMatrix
            );

            distance = Cartesian3.distance(newPlanePrimitivePosition, viewer.camera.position);

            isShow = distance < DISPLAY_LIMIT;

            planePrimitive.show = isShow;
            approachPathData.approachPathEntity.show = isShow;
            approachPathData.wall.show = isShow;

            if (approachPathData.axisPrimitiveForDebug)
                approachPathData.axisPrimitiveForDebug.modelMatrix = planePrimitive.modelMatrix;
        }
    });
})();
