const up = [0, 1, 0]
let target = [.5, .5, .5]
let lookAt = true

let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords

let attributeNormals
let uniformWorldViewProjection
let uniformWorldInverseTranspose
let uniformReverseLightDirectionLocation
let normalBuffer

const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const LETTER_F = "LETTER_F"
const STAR = "STAR"
const CIRCLE = "CIRCLE"
const CUBE = "CUBE"
const SPHERE = "SPHERE"
const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}

let camera = {
  translation: {x: 0, y: 60, z: 60},
  rotation: {x: -44, y: 0, z: 0}
}

let lightSource = [0, 1, 0]

const init = () => {
 webglUtils.selectShape(0);
  const canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl");

  document.addEventListener(
    "keydown",
    dokeydown,
    false);

  const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-3d", "#fragment-shader-3d");
  gl.useProgram(program);

  // get reference to GLSL attributes and uniforms
  attributeCoords = gl.getAttribLocation(program, "a_coords");
  const uniformResolution = gl.getUniformLocation(program, "u_resolution");
  uniformColor = gl.getUniformLocation(program, "u_color");

  uniformMatrix = gl.getUniformLocation(program, "u_matrix");

  // initialize coordinate attribute
  gl.enableVertexAttribArray(attributeCoords);

  // initialize coordinate buffer
  bufferCoords = gl.createBuffer();

  //Get normals and make buffers
  attributeNormals = gl.getAttribLocation(program, "a_normals");
  gl.enableVertexAttribArray(attributeNormals);
  normalBuffer = gl.createBuffer();

  uniformWorldViewProjection
    = gl.getUniformLocation(program, "u_worldViewProjection");
  uniformWorldInverseTranspose
    = gl.getUniformLocation(program, "u_worldInverseTranspose");
  uniformReverseLightDirectionLocation
    = gl.getUniformLocation(program, "u_reverseLightDirection");

  // configure canvas resolution
  gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  document.getElementById("dlrx").value = lightSource[0]
  document.getElementById("dlry").value = lightSource[1]
  document.getElementById("dlrz").value = lightSource[2]

  document.getElementById("dlrx").onchange = event => webglUtils.updateLightDirection(event, 0)
  document.getElementById("dlry").onchange = event => webglUtils.updateLightDirection(event, 1)
  document.getElementById("dlrz").onchange = event => webglUtils.updateLightDirection(event, 2)
    document.getElementById("color").onchange = event => webglUtils.updateColor(event)
}

let rev = 0

dokeydown = (event) => {
  if (event.key === "ArrowRight") {
    rev -= 5
  } else if (event.key === "ArrowLeft") {
    rev += 5
  }

  camera.translation.x = 60 * Math.sin(webglUtils.degToRad(rev))
  camera.translation.z = 60 * Math.cos(webglUtils.degToRad(rev))

  render()
}

const render = () => {
  renderPerspective()
  renderOrtho()
}

const renderPerspective = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(
    attributeCoords,
    3,           // size = 3 floats per vertex
    gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
    false,       // normalize = false; i.e., don't normalize the data
    0,           // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0);          // offset = 0; i.e., start at the beginning of the buffer

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(attributeNormals, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 2000;
  let cameraMatrix = m4.identity()
  let viewProjectionMatrix = m4.identity()

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);

  if (lookAt) {
    cameraMatrix = m4.translate(
      cameraMatrix,
      camera.translation.x,
      camera.translation.y,
      camera.translation.z)
    const cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]]
    cameraMatrix = m4.lookAt(
      cameraPosition,
      target,
      up)
    cameraMatrix = m4.inverse(cameraMatrix)
  } else {
    cameraMatrix = m4.zRotate(
      cameraMatrix,
      webglUtils.degToRad(camera.rotation.z));
    cameraMatrix = m4.xRotate(
      cameraMatrix,
      webglUtils.degToRad(camera.rotation.x));
    cameraMatrix = m4.yRotate(
      cameraMatrix,
      webglUtils.degToRad(camera.rotation.y));
    cameraMatrix = m4.translate(
      cameraMatrix,
      camera.translation.x,
      camera.translation.y,
      camera.translation.z);
  }

  const projectionMatrix = m4.perspective(
    fieldOfViewRadians, aspect, zNear, zFar)
  viewProjectionMatrix = m4.multiply(
    projectionMatrix, cameraMatrix)

  let worldMatrix = m4.identity()
  const worldViewProjectionMatrix
    = m4.multiply(viewProjectionMatrix, worldMatrix);
  const worldInverseMatrix
    = m4.inverse(worldMatrix);
  const worldInverseTransposeMatrix
    = m4.transpose(worldInverseMatrix);

  gl.uniformMatrix4fv(uniformWorldViewProjection, false,
    worldViewProjectionMatrix);
  gl.uniformMatrix4fv(uniformWorldInverseTranspose, false,
    worldInverseTransposeMatrix);

  gl.uniform3fv(uniformReverseLightDirectionLocation,
    m4.normalize(lightSource));

 const $shapeList = $("#object-list")
 $shapeList.empty()

  shapes.forEach((shape , index) => {
  const $li = $(`
     <li>
 <button onclick="deleteShape(${index})">
               Delete
             </button>
       <label>
        <input
            type="radio"
            id="${shape.type}-${index}"
            name="shape-index"
            ${index === selectedShapeIndex ? "checked": ""}
            onclick="webglUtils.selectShape(${index})"
            value="${index}"/>
         ${shape.type};
       </label>
     </li>
   `)
   $shapeList.append($li)

    gl.uniform4f(uniformColor,
      shape.color.red,
      shape.color.green,
      shape.color.blue, 1);

    let M = computeModelViewMatrix(shape, worldViewProjectionMatrix)
    gl.uniformMatrix4fv(uniformWorldViewProjection, false, M)

    if (shape.type === RECTANGLE) {
      webglUtils.renderRectangle(shape, gl)
    } else if (shape.type === TRIANGLE) {
      webglUtils.renderTriangle(shape, gl)
    } else if (shape.type === CUBE) {
      webglUtils.renderCube(shape, gl, normalBuffer)
    } else if (shape.type === SPHERE) {
      webglUtils.renderSphere(shape, gl, bufferCoords, normalBuffer)
    }
  })
}

//const deleteShape = (shapeIndex) => {
//selectedIndex = shapeIndex
 // const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
   // shapes.splice(shapeIndex, 1)
 //render()

 // }
//const  selectShape = (selectedIndex) => {
 //   selectedShapeIndex = selectedIndex
 //   const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
 //    document.getElementById("color").value = hexColor

 // }
//

let fieldOfViewRadians = webglUtils.degToRad(100)


const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
  M = m4.translate(viewProjectionMatrix,
    shape.translation.x,
    shape.translation.y,
    shape.translation.z)
  M = m4.xRotate(M, webglUtils.degToRad(shape.rotation.x))
  M = m4.yRotate(M, webglUtils.degToRad(shape.rotation.y))
  M = m4.zRotate(M, webglUtils.degToRad(shape.rotation.z))
  M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
  return M
}

let shapes = [
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 150, y: 10, z: 150},
    scale:       {x:   1, y:   1, z:   10},
    rotation:    {x:   180, y: 0, z: 0},
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: -180, y: 10, z: 150},
    scale:       {x:   1, y:   1, z:   10},
    rotation:    {x:   180, y: 0, z: 0},
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: {x: -180, y: 10, z: 180},
    scale:       {x:   12, y:   1, z:   1},
    rotation:    {x:   180, y: 0, z: 0},
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: {x: -180, y: 10, z: -150},
    scale:       {x:   12, y:   1, z:   1},
    rotation:    {x:   180, y: 0, z: 0},
  },
  {
	 //Bottom
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: {x: -150, y: -10, z: 150},
    scale:       {x:   10, y:   1, z: 10},
    rotation:    {x:   180, y: 0, z: 0},
  },
  {
    type: SPHERE,
    position: origin,
    dimensions: sizeOne,
    color: BLUE_RGB,
    translation: {x: 0, y: 0, z: 0},
    scale: {x: 10, y: 10, z: 10},
    rotation: {x: 0, y: 0, z: 0},
  }
]


