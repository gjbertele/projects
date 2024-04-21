const canvasGen = document.querySelector('canvas')
const ctxGen = canvasGen.getContext('2d')
let w = document.body.clientWidth;
let h = document.body.clientHeight;
let worldWidth = 50
let worldHeight = 50
let boundaryPanning = 800;
let fov = w * 0.9;
const terrainDetail = 50
const terrainDetailHalf = 25
let cameraPos = {
    rposX:-6800,
    rposZ:-4600,
    rx:18,
    ry:0,
    x:-1630,
    y:-1478,
    z:-3255
}
//OPTIMIZATION CONSTANTS
const wwtdh = worldWidth * terrainDetail / 2
const whtdh = worldHeight * terrainDetail / 2
const MPDR = Math.PI / 180
let fovInvConst = 1 / fov

function basicEquation(x, y) {
    return 0;
}

function lookArraysUpdate() {
    xAxis.x = Math.fround(Math.cos(cameraPos.rx * MPDR));
    xAxis.y = Math.fround(Math.sin(cameraPos.rx * MPDR));

    yAxis.x = -xAxis.y //Math.cos(cameraPos.rx*Math.PI/180 + Math.PI/2);
    yAxis.y = xAxis.x //Math.sin(cameraPos.rx*Math.PI/180 + Math.PI/2);


    cameraPos.rposZ = cameraPos.z + (cameraPos.x - terrainDetailHalf * worldWidth) * xAxis.x + (cameraPos.z - terrainDetailHalf * worldHeight) * yAxis.x
    cameraPos.rposX = cameraPos.x + (cameraPos.x - terrainDetailHalf * worldWidth) * xAxis.y + (cameraPos.z - terrainDetailHalf * worldHeight) * yAxis.y
}

function cfaceDist(i) {
    return Math.sqrt((i[0].x - cameraPos.rposX) ** 2 + (i[0].y - cameraPos.y) ** 2 + (i[0].z - cameraPos.rposZ) ** 2)
}

let xAxis = {
    x: 1,
    y: 0
}
let yAxis = {
    x: 0,
    y: 1
}

const projectTo3D = (x, y, z) => {
    let ix = x - wwtdh
    let iy = y - cameraPos.y
    let iz = z - whtdh
    let rotatedX = ix * xAxis.x + iz * yAxis.x - cameraPos.x
    let rotatedZ = ix * xAxis.y + iz * yAxis.y - cameraPos.z
    var size = rotatedZ * fovInvConst + 1
    var xp = (rotatedX / size);
    var yp = (iy / size);
    let objectReturn = {
        x: xp >> 0,
        y: yp >> 0
    }
    return objectReturn
}

const cDist = (i) => {
    return (i.x - cameraPos.rposX + cameraPos.x + 350) ** 2 + (i.y - cameraPos.y) ** 2 + (i.z - cameraPos.rposZ + cameraPos.z - 250) ** 2
}


const worldDraw = () => {
    let boundaries = [projectTo3D(0, 0, 0), projectTo3D(0, -1e4, 0), projectTo3D(wwtdh * 2, 0, whtdh * 2), projectTo3D(wwtdh * 2, -1e4, whtdh * 2), projectTo3D(wwtdh * 2, 0, 0), projectTo3D(wwtdh * 2, -1e4, 0), projectTo3D(0, 0, whtdh * 2), projectTo3D(0, -1e4, whtdh * 2)]
    let boundaryXMax = Math.max(...boundaries.map(i => i = i.x))
    let boundaryXMin = Math.min(...boundaries.map(i => i = i.x))
    let boundaryYMax = Math.max(...boundaries.map(i => i = i.y))
    let boundaryYMin = Math.min(...boundaries.map(i => i = i.y))
    ctxGen.clearRect(boundaryXMin - boundaryPanning, boundaryYMin - boundaryPanning, boundaryXMax - boundaryXMin + 2 * boundaryPanning, boundaryYMax - boundaryYMin + 2 * boundaryPanning)
    lookArraysUpdate()

    terrainFaces.sort((a, b) => cDist(b[0]) - cDist(a[0])).forEach(function(i, v) {
        let ptsProjected = [projectTo3D(i[0].x, i[0].y, i[0].z), projectTo3D(i[1].x, i[1].y, i[1].z), projectTo3D(i[2].x, i[2].y, i[2].z), projectTo3D(i[3].x, i[3].y, i[3].z)]
        let ptsarrx = ptsProjected.map(i => i = i.x)
        let ptsarry = ptsProjected.map(i => i = i.y)
        if (!(Math.max(...ptsarrx) > w + boundaryPanning || Math.min(...ptsarrx) < -boundaryPanning || Math.max(...ptsarry) > h + boundaryPanning || Math.min(...ptsarry) < -boundaryPanning || i[0].y < cameraPos.y)) {
            ctxGen.beginPath()
            ptsProjected.forEach(function(j, v) {
                ctxGen.lineTo(j.x, j.y)
            })
            ctxGen.fillStyle = i[4];
            ctxGen.fill();
            //ctx.stroke()
        }
    })
}

//face gen
let heightmap = (new Array(worldWidth * worldHeight)).fill(0)
let terrainFaces = []
const randomC = 25 * Math.random()
//seeded random
function genColor(v) {
    let ra = ((v % 3) * v * randomC % 1) * 10 >> 0
    let ga = ((v % 3) * v * randomC % 2) * 10 >> 0
    let ba = ((v % 3) * v * randomC % 3) * 10 >> 0
    return 'rgb(' + (65 + ra) + ',' + (220 + ga) + ',' + (65 + ba) + ')'
}
let minv = 2**63 - 1;
let maxv = -minv;

function regenerateFaces() {
    terrainFaces = []
    for (let v = 0; v < worldWidth * worldHeight; v++) {
        let tx = v % worldWidth;
        let ty = (v - tx) / worldWidth
        heightmap[v] = {
            x: tx * terrainDetail,
            y: 0,
            z: ty * terrainDetail,
            index: v,
            connections: []
        }
        heightmap[v].y = basicEquation(tx - worldWidth / 2, ty - worldWidth / 2)
        heightmap[v].color = genColor(v)
    }
    minv = 2**63 - 1;
    maxv = -minv;
    for(let i = 0; i<heightmap.length; i++){
        if(heightmap[i].y < minv) minv = heightmap[i].y;
        if(heightmap[i].y > maxv) maxv = heightmap[i].y;
    }
    maxv++;
    for(let i = 0; i<heightmap.length; i++){
        heightmap[i].y = (heightmap[i].y - minv)*1000/(maxv - minv)
    }
    for (let v = 0; v < worldWidth * worldHeight; v++) {
        let i = heightmap[v]
        
        let a1 = heightmap.filter(j => j.x == i.x + terrainDetail && j.z == i.z)[0] ?? i
        let a2 = heightmap.filter(j => j.x == i.x + terrainDetail && j.z == i.z + terrainDetail)[0] ?? i
        let a3 = heightmap.filter(j => j.x == i.x && j.z == i.z + terrainDetail)[0] ?? i

        terrainFaces.push([i, a1, a2, a3])
    }
}



function generatePictureFromEquation(eqFunc, parameters, width, height){
    w = width;
    h = height;
    canvasGen.width = w;
    canvasGen.hieght = h;
    fov = w*0.9;
    fovInvConst = 1/fov;
    basicEquation = eqFunc;
    regenerateFaces();
    for(let i = 0; i<terrainFaces.length; i++){
        let k = terrainFaces[i][0].y;
        let tr = fade(k,0,1000,rArr) >> 0;
        let tg = fade(k, 0, 1000, gArr) >> 0;
        let tb = fade(k, 0, 1000, bArr) >> 0;
        terrainFaces[i][4] = 'rgb('+tr+','+tg+','+tb+')';
    }
    worldDraw();

}