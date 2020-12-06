const webglUtils = {
  hexToRgb: (hex) => {
    let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let rgb = {
      red: parseInt(parseRgb[1], 16),
      green: parseInt(parseRgb[2], 16),
      blue: parseInt(parseRgb[3], 16)
    }
    rgb.red /= 256
    rgb.green /= 256
    rgb.blue /= 256
    return rgb
  },

  radToDeg: (radians) => radians * 180 / Math.PI,

  degToRad: (degrees) => degrees * Math.PI / 180,

  componentToHex: (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex: (rgb) => {
    const redHex = webglUtils.componentToHex(rgb.red * 256)
    const greenHex = webglUtils.componentToHex(rgb.green * 256)
    const blueHex = webglUtils.componentToHex(rgb.blue * 256)
    return `#${redHex}${greenHex}${blueHex}`
  },
  createProgramFromScripts: (webGlContext, vertexShaderElementId, fragmentShaderElementId) => {
    // Get the strings for our GLSL shaders
    const vertexShaderElement = document.querySelector(vertexShaderElementId)
    const fragmentShaderElement = document.querySelector(fragmentShaderElementId)


    const vertexShaderSource = vertexShaderElement.text;
    const fragmentShaderSource = fragmentShaderElement.text;

    // Create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = webGlContext.createShader(webGlContext.VERTEX_SHADER);
    webGlContext.shaderSource(vertexShader, vertexShaderSource);
    webGlContext.compileShader(vertexShader);

    const fragmentShader = webGlContext.createShader(webGlContext.FRAGMENT_SHADER);
    webGlContext.shaderSource(fragmentShader, fragmentShaderSource);
    webGlContext.compileShader(fragmentShader);

    // Link the two shaders into a program
    const program = webGlContext.createProgram();
    webGlContext.attachShader(program, vertexShader);
    webGlContext.attachShader(program, fragmentShader);
    webGlContext.linkProgram(program);

    return program
  },

  toggleLookAt: (event) => {
    lookAt = event.target.checked
    render()
  },

  updateCameraAngle: (event) => {
    cameraAngleRadians = webglUtils.degToRad(event.target.value);
    render();
  },
  updateLookUp: (event) => {
    lookAt = event.target.checked
    render();
  },
  updateFieldOfView: (event) => {
    fieldOfViewRadians = webglUtils.degToRad(event.target.value);
    render();
  },
  updateTranslation: (event, axis) => {
    shapes[selectedShapeIndex].translation[axis] = event.target.value
    render()
  },
  updateRotation: (event, axis) => {
    shapes[selectedShapeIndex].rotation[axis] = event.target.value
    render();
  },
  updateScale: (event, axis) => {
    shapes[selectedShapeIndex].scale[axis] = event.target.value
    render()
  },
  updateColor: (event) => {
    const hex = event.target.value
    const rgb = webglUtils.hexToRgb(hex)
    shapes[selectedShapeIndex].color = rgb
    render()
  },
  updateCameraTranslation: (camera, event, axis) => {
    camera.translation[axis] = event.target.value
    render()
  },
  updateCameraRotation: (camera, event, axis) => {
    camera.rotation[axis] = event.target.value
    render();
  },
  updateLookAtTranslation: (event, index) => {
    target[index] = event.target.value
    render();
  },
  updateLightDirection: (event, index) => {
    lightSource[index] = parseFloat(event.target.value)
    render()

  },
  addShape: (newShape, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    let tz = 0
    let shape = {
      type: type,
      position: origin,
      dimensions: sizeOne,
      color: colorRgb,
      translation: {x: tx, y: ty, z: tz},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 20, y: 20, z: 20}
    }
    if (newShape) {
      Object.assign(shape, newShape)
    }
    shapes.push(shape)
    render()
  },
  deleteShape: (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    if (shapes.length > 0) {
      webglUtils.selectShape(0)
      render()
    } else {
      selectedShapeIndex = -1
    }
  },
  selectShape: (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
  },
  doMouseDown: (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - boundingRectangle.left - boundingRectangle.width / 2);
    const y = -Math.round(event.clientY - boundingRectangle.top - boundingRectangle.height / 2);
    const translation = {x, y, z: -150}
    const rotation = {x: 0, y: 0, z: 180}
    const shapeType = document.querySelector("input[name='shape']:checked").value
    const shape = {
      translation, rotation, type: shapeType
    }

    webglUtils.addShape(shape, shapeType)
  },
  renderCube: (cube, webGlContext, normalBuffer) => {
    const geometry = [
      0, 0, 0, 0, 30, 0, 30, 0, 0,
      0, 30, 0, 30, 30, 0, 30, 0, 0,
      0, 0, 30, 30, 0, 30, 0, 30, 30,
      0, 30, 30, 30, 0, 30, 30, 30, 30,
      0, 30, 0, 0, 30, 30, 30, 30, 30,
      0, 30, 0, 30, 30, 30, 30, 30, 0,
      0, 0, 0, 30, 0, 0, 30, 0, 30,
      0, 0, 0, 30, 0, 30, 0, 0, 30,
      0, 0, 0, 0, 0, 30, 0, 30, 30,
      0, 0, 0, 0, 30, 30, 0, 30, 0,
      30, 0, 30, 30, 0, 0, 30, 30, 30,
      30, 30, 30, 30, 0, 0, 30, 30, 0,
    ]
    const float32Array = new Float32Array(geometry)
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)

    var normals = new Float32Array([
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    ]);
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, normalBuffer);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, normals, webGlContext.STATIC_DRAW);
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, 6 * 6);
  },
  renderRectangle: (rectangle, webGlContext) => {
    const x1 = rectangle.position.x
      - rectangle.dimensions.width / 2;
    const y1 = rectangle.position.y
      - rectangle.dimensions.height / 2;
    const x2 = rectangle.position.x
      + rectangle.dimensions.width / 2;
    const y2 = rectangle.position.y
      + rectangle.dimensions.height / 2;

    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, new Float32Array([
      x1, y1, 0, x2, y1, 0, x1, y2, 0,
      x1, y2, 0, x2, y1, 0, x2, y2, 0,
    ]), webGlContext.STATIC_DRAW);

    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, 6);
  },
  renderTriangle: (triangle, webGlContext) => {
    const x1 = triangle.position.x
      - triangle.dimensions.width / 2
    const y1 = triangle.position.y
      + triangle.dimensions.height / 2
    const x2 = triangle.position.x
      + triangle.dimensions.width / 2
    const y2 = triangle.position.y
      + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
      - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
      x1, y1, 0, x3, y3, 0, x2, y2, 0])

    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW);

    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, 3);
  },
  getSemicirclePoints: (circle, steps) => {
    const centerX = circle.position.x
    const centerY = circle.position.y

    let p1X = centerX
    let p1Y = centerY - circle.dimensions.width
    let buffer = []
    const rotationConstant = Math.PI / steps
    const cos = Math.cos(rotationConstant)
    const sin = Math.sin(rotationConstant)
    for (let i = 0; i <= steps; i++) {
      buffer.push([
        p1X, 0, 0, 0,
        0, p1Y, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 1
      ])
      const p2X = cos * p1X - sin * p1Y
      const p2Y = sin * p1X + cos * p1Y
      p1X = p2X
      p1Y = p2Y
    }
    return buffer
  },
  renderHershey: (webGlContext, bufferCoords, normalBuffer) => {
    const buffer = hersheyMesh
    let normals = []
    for (let i = 0; i < buffer.length; i+=9) {
      const p1 = [buffer[i], buffer[i + 1], buffer[i + 2]]
      const p2 = [buffer[i + 3], buffer[i + 4], buffer[i + 5]]
      const p3 = [buffer[i + 6], buffer[i + 7], buffer[i + 8]]
      const v3 = [p1[0] - p2[0], p1[1]- p2[1], p1[2] - p2[2]]
      const v4 = [p3[0] - p2[0], p3[1]- p2[1], p3[2] - p2[2]]
      const n1 = webglUtils.cross(v3, v4)
      normals = normals.concat(m4.normalize(p1),m4.normalize(p2), m4.normalize(p3))

    }
    const float32Array = new Float32Array(buffer)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, bufferCoords);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, normalBuffer);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, new Float32Array(normals), webGlContext.STATIC_DRAW);
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, buffer.length / 3)
  },
  renderArrow: (webGlContext, bufferCoords, normalBuffer) => {
    const buffer = arrowMesh
    let normals = []
    for (let i = 0; i < buffer.length; i+=9) {
      const p1 = [buffer[i], buffer[i + 1], buffer[i + 2]]
      const p2 = [buffer[i + 3], buffer[i + 4], buffer[i + 5]]
      const p3 = [buffer[i + 6], buffer[i + 7], buffer[i + 8]]
      // const v1 = [p2[0] - p1[0], p2[1]- p1[1], p2[2] - p1[2]]
      // const v2 = [p3[0] - p1[0], p3[1]- p1[1], p3[2] - p1[2]]
      const v3 = [p1[0] - p2[0], p1[1]- p2[1], p1[2] - p2[2]]
      const v4 = [p3[0] - p2[0], p3[1]- p2[1], p3[2] - p2[2]]
      // const v5 = [p1[0] - p3[0], p1[1]- p3[1], p1[2] - p3[2]]
      // const v6 = [p2[0] - p3[0], p2[1]- p3[1], p2[2] - p3[2]]
      const n1 = webglUtils.cross(v3, v4)
      // const n2 = webglUtils.cross(p, v4)
      // const n3 = webglUtils.cross(v6, v5)
      // console.log(p1, webglUtils.cross(v3, v4), m4.normalize(n1))
      const n = [0,1,0]
      normals = normals.concat(m4.normalize(p1),m4.normalize(p2), m4.normalize(p3))
    }
    // console.log(normals)
    const float32Array = new Float32Array(buffer)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, bufferCoords);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, normalBuffer);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, new Float32Array(normals), webGlContext.STATIC_DRAW);
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, buffer.length / 3)
  },

  renderSphere: (sphere, webGlContext, bufferCoords, normalBuffer) => {
    const steps = 30
    let semicirclePoints = webglUtils.getSemicirclePoints(sphere, steps)
    let buffer = []
    let normals = []
    const getPoints = (m) => {
      return [m[0], m[5], m[8]]
    }
    for (let k = 0; k < 36; k++) {
      const rotatedSemiCirclePoints = semicirclePoints.map(m => m4.yRotate(m, webglUtils.degToRad(10)))
      for (let i = 0; i < semicirclePoints.length - 1; i++) {
        if (i === 0) {
          const p1 = getPoints(semicirclePoints[0])
          const p2 = getPoints(semicirclePoints[i + 1])
          const p3 = getPoints(rotatedSemiCirclePoints[i + 1])
          buffer = buffer.concat(p1, p2, p3)
          normals = normals.concat(m4.normalize(p1), m4.normalize(p2), m4.normalize(p3))
        } else if (i === semicirclePoints.length - 2) {
          const p1 = getPoints(semicirclePoints[i])
          const p2 = getPoints(semicirclePoints[i + 1])
          const p3 = getPoints(rotatedSemiCirclePoints[i])
          buffer = buffer.concat(p1, p2, p3)
          normals = normals.concat(m4.normalize(p1), m4.normalize(p2), m4.normalize(p3))
        } else {
          const p1 = getPoints(semicirclePoints[i])
          const p2 = getPoints(semicirclePoints[i + 1])
          const p3 = getPoints(rotatedSemiCirclePoints[i + 1])
          const p4 = getPoints(rotatedSemiCirclePoints[i])
          buffer = buffer.concat(p1, p2, p3)
          buffer = buffer.concat(p1, p3, p4)
          normals = normals.concat(m4.normalize(p1), m4.normalize(p2), m4.normalize(p3),
            m4.normalize(p1), m4.normalize(p3), m4.normalize(p4))
        }
      }
      semicirclePoints = rotatedSemiCirclePoints
    }
    console.log(JSON.stringify(buffer))
    const float32Array = new Float32Array(buffer)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, bufferCoords);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, normalBuffer);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, new Float32Array(normals), webGlContext.STATIC_DRAW);
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, buffer.length / 3)
  },
  cross(a, b) {
    const ax = a[0],
      ay = a[1],
      az = a[2];
    const bx = b[0],
      by = b[1],
      bz = b[2];
    return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
  },
   getPointOnBezierCurve(points, offset, t) {
    const invT = (1 - t);
     // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
     const x = invT * invT * invT * points[0][0] + 3 * t * invT * invT * points[1][0] + t * t * t * points[2][0]
     const y = invT * invT * invT * points[0][1] + 3 * t * invT * invT * points[1][1] + t * t * t * points[2][1]
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 1
    ]
  },
  getPointsOnBezierCurve(points, offset, numPoints) {
    const cpoints = [];
    for (let i = 0; i < numPoints; ++i) {
      const t = i / (numPoints - 1);
      cpoints.push(webglUtils.getPointOnBezierCurve(points, offset, t));
    }
    return cpoints;
}

}