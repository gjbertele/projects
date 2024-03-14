/*
TO DO:

OPTIMIZE SHOWDENSITY

DIGITAL SCREEN - MAKE DYNAMIC CREATEABLE OBJECT W METHOD
=> IMAGE UPLOADER? - INTEGRATE INTO CUSTOM CANVAS API
=> TEXT W/ FONT? - INTEGRATE INTO CUSTOM CANVAS API
=> SVG FORMAT? - INTEGRATE INTO CUSTOM CANVAS API

RESIZEABLE BLOCKS

3D GUI - click and drag

FIND INVERSE OF PROJECTION FUNCTION


FOR AI: PRIMES SUM OPTIMIZATON
*/
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d', {
    alpha: false
})
const w = document.body.clientWidth;
const h = document.body.clientHeight;
const facesCube = [
    [
        [-1, -1, 1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, -1, -1]
    ],
    [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1]
    ],
    [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1]
    ],
    [
        [-1, -1, 1],
        [-1, -1, -1],
        [-1, 1, -1],
        [-1, 1, 1]
    ],
    [
        [1, -1, 1],
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1]
    ],
    [
        [-1, 1, 1],
        [1, 1, 1],  
        [1, 1, -1], 
        [-1, 1, -1]
    ]
]
const facesSquare = [
    [
        [1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [-1, 0, 1]
    ]
]
var worldWidth = 25
var worldHeight = 25
let boundaryPanning = 800
canvas.width = w;
canvas.height = h;
let shapes = []
let fov = w * 0.9
let keysdown = []
const terrainDetail = 50
const terrainDetailHalf = 25
let mousedown = false;
let mx = 0;
let my = 0;
let lmx = 0;
let lmy = 0;
let r = 2
let cameraPos = {
    x: -3410,
    y: -2738,
    z: -2995,
    rx: 15,
    ry: 0,
    rposX: 0,
    rposZ: 0,
}

//OPTIMIZATION CONSTANTS
const wwtdh = worldWidth * terrainDetail / 2
const whtdh = worldHeight * terrainDetail / 2
const MPDR = Math.PI / 180
const fovInv = 1 / fov


function heightAtPoint(x, y) {
    if (Math.floor(x / terrainDetail) + Math.floor(y / terrainDetail) * worldWidth >= worldWidth * worldHeight) return 0;
    return heightmap[Math.min(worldWidth*worldHeight - 1,Math.floor(x / terrainDetail) + Math.floor(y / terrainDetail) * worldWidth)].y;
}

function flatten(array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] instanceof Array) {
            array.splice.apply(array, [i, 1].concat(array[i]));
            i--;
        }
    };
    return array;
}
const isPointInPolygon = (latitude, longitude, polygon) => {

    let x = latitude;
    let y = longitude

    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0];
        const yi = polygon[i][1]
        const xj = polygon[j][0];
        const yj = polygon[j][1]

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }

    return inside
};

function chunkCalc(x, z) {
    return 1e6 * ((x / (4 * terrainDetail)) >> 0) + (z / (4 * terrainDetail)) >> 0
}

function lookArraysUpdate() {
    xAxis.x = Math.fround(Math.cos(cameraPos.rx * MPDR));
    xAxis.y = Math.fround(Math.sin(cameraPos.rx * MPDR));

    yAxis.x = -xAxis.y
    yAxis.y = xAxis.x


    cameraPos.rposZ = cameraPos.z + (cameraPos.x - terrainDetailHalf * worldWidth) * xAxis.x + (cameraPos.z - terrainDetailHalf * worldHeight) * yAxis.x >> 0
    cameraPos.rposX = cameraPos.x + (cameraPos.x - terrainDetailHalf * worldWidth) * xAxis.y + (cameraPos.z - terrainDetailHalf * worldHeight) * yAxis.y >> 0
}

function weightedRandom(min, max) {
    return Math.round(max / (Math.random() * max + min));
}

function terrainAtPoint(x, z) {
    let modx = (x / terrainDetail) >> 0
    let modz = (z / terrainDetail) >> 0
    return heightMap[modx + modz * worldHeight]
}

function colorMap(i) {
    let col = i.color.split('rgb(')[0].slice(0, -1).split(',')
    return 100 ** 2 * col[0] + 100 * col[1] + col[0]
}

function cfaceDist(i) {
    return (i[0].x - cameraPos.rposX) ** 2 + (i[0].y - cameraPos.y) ** 2 + (i[0].z - cameraPos.rposZ) ** 2
}
let cr = 3
let cc = 0.2

document.body.onmousedown = function(e) {
    mousedown = true;
}
document.body.onmousemove = function(e) {
    lmx = mx
    lmy = my
    mx = e.clientX;
    my = e.clientY;
}
document.body.onmouseup = function(e) {
    mousedown = false
}
document.body.onkeydown = function(e) {
    if (!keysdown.includes(e.key)) {
        keysdown.push(e.key)
    }
}
document.body.onkeyup = function(e) {
    keysdown = keysdown.filter(i => i != e.key)
}

function link(range, variables) {
    range.onchange = function() {
        if (variables[0] == 'numParticles') {
            let p = numParticles;
            if (+range.value < p) {
                parentObjects.fill(-1);
                objects = [null];
                shapes.length = +range.value;
                positions.length = +range.value;
                velocities.length = +range.value;
                shapes.length = +range.value;
                parentObjects.length = +range.value;
                parentObjectOffsetIndexes.length = +range.value;
            } else {
                while (positions.length < +range.value) createParticle(worldWidth*terrainDetail*Math.random(), worldHeight*terrainDetail*Math.random(), worldHeight*terrainDetail*Math.random(), true);
            }
            numParticles = +range.value;
        }
        for (v in variables) {
            if (range.type == "range") window[variables[v]] = +range.value;
            if (range.type == "checkbox") window[variables[v]] = range.checked;
        }
        if (variables[0] == 'worldWidth' || variables[0] == 'worldHeight') {
            terrainFaces = []
            sideFaces = []
            for (p in positions) {
                if (positions[p].x < 0 || positions[p].x > worldWidth * terrainDetail) {
                    positions[p].x = worldWidth * terrainDetail * (Math.sign(positions[p].x) + 1)/2
                }
                if (positions[p].z < 0 || positions[p].z > worldHeight * terrainDetail) {
                    positions[p].z = worldHeight * terrainDetail * (Math.sign(positions[p].z) + 1)/2
                }
                if (positions[p].y < 0 || positions[p].y > worldHeight * terrainDetail) {
                    positions[p].y = worldHeight * terrainDetail * (Math.sign(positions[p].y) + 1)/2
                }
            }
            heightmap = []
            for (let v = 0; v < worldWidth * worldHeight; v++) {
                let tx = v % worldWidth;
                let ty = (v - tx) / worldWidth
                heightmap[v] = {
                    x: tx * terrainDetail,
                    y: 0,
                    z: ty * terrainDetail,
                    index: v
                }
                heightmap[v].color = 'rgb(100,100,100)'
            }
            regenerateFaces();
        }
    }
}

function mat3xvector3(mat, vec){
    return [mat[0][0]*vec[0]+mat[0][1]*vec[1]+mat[0][2]*vec[2],mat[1][0]*vec[0]+mat[1][1]*vec[1]+mat[1][2]*vec[2],mat[2][0]*vec[0]+mat[2][1]*vec[1]+mat[2][2]*vec[2]]
}

function compute3DRotationMatrices(rx, ry, rz){
    rx*=Math.PI/180;
    ry*=Math.PI/180;
    rz*=Math.PI/180;
    let crx = Math.cos(rx);
    let cry = Math.cos(ry);
    let crz = Math.cos(rz);
    let srx = Math.sin(rx);
    let sry = Math.sin(ry);
    let srz = Math.sin(rz);
    let RZMat = [[crz, -srz, 0],[srz, crz, 0],[0, 0, 1]]
    let RYMat = [[cry, 0, sry],[0, 1, 0],[-sry, 0, cry]]
    let RXMat = [[1, 0, 0],[0, crx, -srx], [0, srx, crx]]
    return [RXMat, RYMat, RZMat]
}


/*const projectTo3D = (x, y, z) => {
    calls++;
    let ix = x - cameraPos.x
    let iy = y - cameraPos.y
    let iz = z - cameraPos.z
    let rotatedX = ix * xAxis.x + iz * yAxis.x
    let rotatedZ = ix * xAxis.y + iz * yAxis.y
    
    var size = rotatedZ * fovInv + 1
    var xp = (rotatedX / size);
    var yp = (iy / size);
    let objectReturn = {
        x: xp >> 0,
        y: yp >> 0,
        rotatedZ
    }
    return objectReturn
}*/

function projectionInverse(x, y, targetY){
    let iz = (targetY - y + y*fovInv*xAxis.y*x/(x*fovInv*xAxis.y - xAxis.x))/(y*fovInv*xAxis.y*(yAxis.x - x*fovInv*yAxis.y)/(x*fovInv*xAxis.y - xAxis.x) + y*fovInv*yAxis.y)
    let rx = (iz*(yAxis.x - x*fovInv*yAxis.y) - x)/(x*fovInv*xAxis.y - xAxis.x)
    return {x:rx, y:targetY, z:iz}
}