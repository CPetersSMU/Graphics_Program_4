var canvas;
var gl;
var theta = [0, 0, 0]

var flag = true;
var axis = 0;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;

var texture;
function generateFace(ctx, faceColor, textColor, text) {
    const {width, height} = ctx.canvas;
    ctx.fillStyle = faceColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${width * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);
}

init();

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    var vertices = [
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, -0.5, 0.5),

        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(-0.5, -0.5, -0.5),
        
    ]
    var indices = new Uint8Array ( [
        0,4,5,//pos x
        0,5,1,

        2,3,7,//neg x
        2,7,6,

        0,2,6,//pos y
        0,6,4,

        1,7,3,//neg y
        1,5,7,

        0,1,2,//pos z
        3,2,1,

        4,5,6,
        7,6,5
    ])
    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0'},
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F' },
    ];
    const texCoord = [
        // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Back
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Top
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Bottom
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Right
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Left
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
      ];
    // var texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    program1 = initShaders(gl, "vertex-shader1", "fragment-shader1"); //move box left
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader2"); //move box right
    gl.useProgram(program1);
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    var buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Initialize the vertex position attribute from the vertex shader

    var positionLoc1 = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc1);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT );

    thetaLoc1 = gl.getUniformLocation(program1, "uTheta");
    thetaLoc2 = gl.getUniformLocation(program2, "uTheta");
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

   // Initialize a texture from local image 
   gl.useProgram(program2);
   var image = new Image(); 
   image.src = "http://localhost:8003/Stone_Texture04.png" 
   image.crossOrigin = ""; 
   image.onload = function() { 
        texture = gl.createTexture(); 
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP); 
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR); 
        //gl.texParameteri(gl.TEXTURE_CUBE_MAPv, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
        gl.uniform1i(gl.getUniformLocation(program2, "uTexMap"), 0); 
    }
    gl.activeTexture(gl.TEXTURE0);

    //gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    var buffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new flatten(vertices), gl.STATIC_DRAW);

    var positionLoc2 = gl.getAttribLocation( program2, "aPosition" );
    gl.vertexAttribPointer( positionLoc2, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc2 );

    var buffer3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer3);
    gl.bufferData( gl.ARRAY_BUFFER,   flatten(texCoord), gl.STATIC_DRAW);


    var texCoordLoc = gl.getAttribLocation( program2, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( texCoordLoc );

    gl.uniform1i( gl.getUniformLocation(program2, "uTextureMap"), 0);

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.viewport(0, 0, 512, 512);

    render();
}

function render() {
    gl.useProgram(program1);
    if(flag) theta[axis] += 0.5;
    gl.uniform3fv(thetaLoc1, theta);
    drawCube();
    gl.useProgram(program2);
    
    gl.uniform3fv(thetaLoc2, theta);
    drawCube();
    requestAnimationFrame(render);
}
function drawCube() {
    for(var i = 0; i < 36; i = i+3){
        gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_BYTE, i)
    }
}
//questions:
//How can I switch between programs without wiping?
//General confusion about cube mapping, why is it special
//How do i generate an image