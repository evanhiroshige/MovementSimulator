
let orthoGl
let o_attributeCoords
let o_uniformMatrix
let o_uniformColor

let o_bufferCoords
let o_normalBuffer

let o_attributeNormals
let o_uniformWorldViewProjection
let o_uniformWorldInverseTranspose
let o_uniformReverseLightDirectionLocation

let orthoCamera = {
  translation: {x:250, y: 100, z: 250},
  rotation: {x: -90, y: 0, z: 0}
}

const initOrtho = () => {

  const canvas = document.querySelector("#orthographic-canvas");
  orthoGl = canvas.getContext("webgl");

  document.addEventListener(
    "keydown",
    dokeydown,
    false);

  const program = webglUtils.createProgramFromScripts(orthoGl, "#vertex-shader-3d", "#fragment-shader-3d");
  orthoGl.useProgram(program);

  // get reference to GLSL attributes and uniforms
  o_attributeCoords = orthoGl.getAttribLocation(program, "a_coords");
  const uniformResolution = orthoGl.getUniformLocation(program, "u_resolution");
  o_uniformColor = orthoGl.getUniformLocation(program, "u_color");

  o_uniformMatrix = orthoGl.getUniformLocation(program, "u_matrix");

  // initialize coordinate attribute
  orthoGl.enableVertexAttribArray(o_attributeCoords);

  // initialize coordinate buffer
  o_bufferCoords = orthoGl.createBuffer();

  //Get normals and make buffers
  o_attributeNormals = orthoGl.getAttribLocation(program, "a_normals");
  orthoGl.enableVertexAttribArray(o_attributeNormals);
  o_normalBuffer = orthoGl.createBuffer();

  o_uniformWorldViewProjection
    = orthoGl.getUniformLocation(program, "u_worldViewProjection");
  o_uniformWorldInverseTranspose
    = orthoGl.getUniformLocation(program, "u_worldInverseTranspose");
  o_uniformReverseLightDirectionLocation
    = orthoGl.getUniformLocation(program, "u_reverseLightDirection");

  // configure canvas resolution
  orthoGl.uniform2f(uniformResolution, orthoGl.canvas.width, orthoGl.canvas.height);
  orthoGl.clearColor(0, 0, 0, 0);
  orthoGl.clear(orthoGl.COLOR_BUFFER_BIT | orthoGl.DEPTH_BUFFER_BIT);
}

const renderOrtho = () => {
  orthoGl.bindBuffer(orthoGl.ARRAY_BUFFER, o_bufferCoords);
  orthoGl.vertexAttribPointer(
    o_attributeCoords,
    3,           // size = 3 floats per vertex
    orthoGl.FLOAT,    // type = orthoGl.FLOAT; i.e., the data is 32bit floats
    false,       // normalize = false; i.e., don't normalize the data
    0,           // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0);          // offset = 0; i.e., start at the beginning of the buffer

  orthoGl.bindBuffer(orthoGl.ARRAY_BUFFER, o_normalBuffer);
  orthoGl.vertexAttribPointer(o_attributeNormals, 3, orthoGl.FLOAT, false, 0, 0);

  orthoGl.enable(orthoGl.CULL_FACE);
  orthoGl.enable(orthoGl.DEPTH_TEST);
  let cameraMatrix = m4.identity()
  let viewProjectionMatrix = m4.identity()
  orthoGl.bindBuffer(orthoGl.ARRAY_BUFFER, o_bufferCoords);

  cameraMatrix = m4.zRotate(
    cameraMatrix,
    webglUtils.degToRad(orthoCamera.rotation.z));
  cameraMatrix = m4.xRotate(
    cameraMatrix,
    webglUtils.degToRad(orthoCamera.rotation.x));
  cameraMatrix = m4.yRotate(
    cameraMatrix,
    webglUtils.degToRad(orthoCamera.rotation.y));
  cameraMatrix = m4.translate(
    cameraMatrix,
    orthoCamera.translation.x,
    orthoCamera.translation.y,
    orthoCamera.translation.z);

  const projectionMatrix = m4.projection(orthoGl.canvas.clientWidth, orthoGl.canvas.clientHeight, 400);
  viewProjectionMatrix = m4.multiply(projectionMatrix, cameraMatrix)

  let worldMatrix = m4.identity()
  const worldViewProjectionMatrix
    = m4.multiply(viewProjectionMatrix, worldMatrix);
  const worldInverseMatrix
    = m4.inverse(worldMatrix);
  const worldInverseTransposeMatrix
    = m4.transpose(worldInverseMatrix);

  orthoGl.uniformMatrix4fv(o_uniformWorldViewProjection, false,
    worldViewProjectionMatrix);
  orthoGl.uniformMatrix4fv(o_uniformWorldInverseTranspose, false,
    worldInverseTransposeMatrix);

  orthoGl.uniform3fv(o_uniformReverseLightDirectionLocation,
    m4.normalize(lightSource));

  shapes.forEach(shape => {
    orthoGl.uniform4f(o_uniformColor,
      shape.color.red,
      shape.color.green,
      shape.color.blue, 1);
    let M = computeModelViewMatrix(shape, worldViewProjectionMatrix)
    orthoGl.uniformMatrix4fv(o_uniformWorldViewProjection, false, M)
    if (shape.type === RECTANGLE) {
      webglUtils.renderRectangle(shape, orthoGl)
    } else if (shape.type === TRIANGLE) {
      webglUtils.renderTriangle(shape, orthoGl)
    } else if (shape.type === CUBE) {
      webglUtils.renderCube(shape, orthoGl, o_normalBuffer)
    } else if (shape.type === SPHERE) {
      webglUtils.renderSphere(shape, orthoGl, o_normalBuffer, o_bufferCoords)
    } else if (shape.type === ARROW) {
      webglUtils.renderArrow(orthoGl, o_normalBuffer, o_bufferCoords)
    } else if (shape.type === HERSHEY) {
      webglUtils.renderHershey(orthoGl, bufferCoords, normalBuffer)
    }
  })
}
