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
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("tz").value = shapes[selectedIndex].translation.z
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("sz").value = shapes[selectedIndex].scale.z
    document.getElementById("rx").value = shapes[selectedIndex].rotation.x
    document.getElementById("ry").value = shapes[selectedIndex].rotation.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z
    document.getElementById("fv").value = webglUtils.radToDeg(fieldOfViewRadians)
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
  renderLetterF: (letterF, webGlContext) => {
    const geometry = [
      // left column front [ok]
      0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0,
      30, 150, 0, 30, 0, 0,

      // top rung front
      30, 0, 0, 30, 30, 0, 100, 0, 0,
      30, 30, 0, 100, 30, 0, 100, 0, 0,

      // middle rung front
      30, 60, 0, 30, 90, 0, 67, 60, 0,
      30, 90, 0, 67, 90, 0, 67, 60, 0,

      // left column back [ok]
      0, 0, 30, 30, 0, 30, 0, 150, 30,
      0, 150, 30, 30, 0, 30, 30, 150, 30,

      // top rung back
      30, 0, 30, 100, 0, 30, 30, 30, 30,
      30, 30, 30, 100, 0, 30, 100, 30, 30,

      // middle rung back
      30, 60, 30, 67, 60, 30, 30, 90, 30,
      30, 90, 30, 67, 60, 30, 67, 90, 30,

      // top [ok]
      0, 0, 0, 100, 0, 0, 100, 0, 30,
      0, 0, 0, 100, 0, 30, 0, 0, 30,

      // top rung right
      100, 0, 0, 100, 30, 0, 100, 30, 30,
      100, 0, 0, 100, 30, 30, 100, 0, 30,

      // under top rung
      30, 30, 0, 30, 30, 30, 100, 30, 30,
      30, 30, 0, 100, 30, 30, 100, 30, 0,

      // between top rung and middle
      30, 30, 0, 30, 60, 30, 30, 30, 30,
      30, 30, 0, 30, 60, 0, 30, 60, 30,

      // top of middle rung
      30, 60, 0, 67, 60, 30, 30, 60, 30,
      30, 60, 0, 67, 60, 0, 67, 60, 30,

      // right of middle rung
      67, 60, 0, 67, 90, 30, 67, 60, 30,
      67, 60, 0, 67, 90, 0, 67, 90, 30,

      // bottom of middle rung.
      30, 90, 0, 30, 90, 30, 67, 90, 30,
      30, 90, 0, 67, 90, 30, 67, 90, 0,

      // right of bottom
      30, 90, 0, 30, 150, 30, 30, 90, 30,
      30, 90, 0, 30, 150, 0, 30, 150, 30,

      // bottom [ok]
      0, 150, 0, 0, 150, 30, 30, 150, 30,
      0, 150, 0, 30, 150, 30, 30, 150, 0,

      // left side [ok]
      0, 0, 0, 0, 0, 30, 0, 150, 30,
      0, 0, 0, 0, 150, 30, 0, 150, 0
    ]
    const float32Array = new Float32Array(geometry)
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, 16 * 6);
  },
  getSemicirclePoints: (circle, steps) => {
    const centerX = circle.position.x
    const centerY = circle.position.y

    let p1X = centerX
    let p1Y = centerY - circle.dimensions.width //get rid of times 2
    const buffer = []
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
    const float32Array = new Float32Array(buffer)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, bufferCoords);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, float32Array, webGlContext.STATIC_DRAW)
    webGlContext.bindBuffer(webGlContext.ARRAY_BUFFER, normalBuffer);
    webGlContext.bufferData(webGlContext.ARRAY_BUFFER, new Float32Array(normals), webGlContext.STATIC_DRAW);
    webGlContext.drawArrays(webGlContext.TRIANGLES, 0, buffer.length / 3)
  }
}