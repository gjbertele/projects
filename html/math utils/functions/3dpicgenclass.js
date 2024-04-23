let pictureGen = {w:0,h:0,fov:0}

pictureGen.cameraPos = {
    rposX:-6800,
    rposZ:-4600,
    rx:18,
    ry:0,
    x:-1630,
    y:-1478,
    z:-3255
}
//OPTIMIZATION CONSTANTS
const MPDR = Math.PI / 180


pictureGen.lookArraysUpdate = function() {
    pictureGen.xAxis.x = Math.fround(Math.cos(pictureGen.cameraPos.rx * MPDR));
    pictureGen.xAxis.y = Math.fround(Math.sin(pictureGen.cameraPos.rx * MPDR));

    pictureGen.yAxis.x = -pictureGen.xAxis.y;
    pictureGen.yAxis.y = pictureGen.xAxis.x;


    pictureGen.cameraPos.rposZ = pictureGen.cameraPos.z + (pictureGen.cameraPos.x - 25 * 50) * pictureGen.xAxis.x + (pictureGen.cameraPos.z - 25 * 50) * pictureGen.yAxis.x
    pictureGen.cameraPos.rposX = pictureGen.cameraPos.x + (pictureGen.cameraPos.x - 25 * 50) * pictureGen.xAxis.y + (pictureGen.cameraPos.z - 25 * 50) * pictureGen.yAxis.y
}

pictureGen.xAxis = {
    x: 1,
    y: 0
}
pictureGen.yAxis = {
    x: 0,
    y: 1
}

pictureGen.projectTo3D = (x, y, z) => {
    let ix = x - 1250
    let iy = y - pictureGen.cameraPos.y
    let iz = z - 1250
    let rotatedX = ix * pictureGen.xAxis.x + iz * pictureGen.yAxis.x - pictureGen.cameraPos.x
    let rotatedZ = ix * pictureGen.xAxis.y + iz * pictureGen.yAxis.y - pictureGen.cameraPos.z
    var size = rotatedZ * pictureGen.fovInvConst + 1
    var xp = (rotatedX / size);
    var yp = (iy / size);
    let objectReturn = {
        x: xp >> 0,
        y: yp >> 0
    }
    return objectReturn
}

pictureGen.cDist = (i) => {
    return (i.x - pictureGen.cameraPos.rposX + pictureGen.cameraPos.x + 350) ** 2 + (i.y - pictureGen.cameraPos.y) ** 2 + (i.z - pictureGen.cameraPos.rposZ + pictureGen.cameraPos.z - 250) ** 2
}


pictureGen.worldDraw = (ctx) => {
    let boundaries = [pictureGen.projectTo3D(0, 0, 0), pictureGen.projectTo3D(0, -1e4, 0), pictureGen.projectTo3D(1250 * 2, 0, 1250 * 2), pictureGen.projectTo3D(1250 * 2, -1e4, 1250 * 2), pictureGen.projectTo3D(1250 * 2, 0, 0), pictureGen.projectTo3D(1250 * 2, -1e4, 0), pictureGen.projectTo3D(0, 0, 1250 * 2), pictureGen.projectTo3D(0, -1e4, 1250 * 2)]
    let boundaryXMax = Math.max(...boundaries.map(i => i = i.x))
    let boundaryXMin = Math.min(...boundaries.map(i => i = i.x))
    let boundaryYMax = Math.max(...boundaries.map(i => i = i.y))
    let boundaryYMin = Math.min(...boundaries.map(i => i = i.y))
    ctx.clearRect(boundaryXMin - 800, boundaryYMin - 800, boundaryXMax - boundaryXMin + 2 * 800, boundaryYMax - boundaryYMin + 2 * 800)
    pictureGen.lookArraysUpdate()

    terrainFaces.sort((a, b) => pictureGen.cDist(b[0]) - pictureGen.cDist(a[0])).forEach(function(i, v) {
        let ptsProjected = [pictureGen.projectTo3D(i[0].x, i[0].y, i[0].z), pictureGen.projectTo3D(i[1].x, i[1].y, i[1].z), pictureGen.projectTo3D(i[2].x, i[2].y, i[2].z), pictureGen.projectTo3D(i[3].x, i[3].y, i[3].z)]
        let ptsarrx = ptsProjected.map(i => i = i.x)
        let ptsarry = ptsProjected.map(i => i = i.y)
        if (!(Math.max(...ptsarrx) > pictureGen.w + 800 || Math.min(...ptsarrx) < -800 || Math.max(...ptsarry) > pictureGen.h + 800 || Math.min(...ptsarry) < -800 || i[0].y < pictureGen.cameraPos.y)) {
            ctx.beginPath()
            ptsProjected.forEach(function(j, v) {
                ctx.lineTo(j.x, j.y)
            })
            ctx.fillStyle = i[4];
            ctx.fill();
            //ctx.stroke()
        }
    })
}

//face gen
let heightmap = (new Array(50 * 50)).fill(0)
let terrainFaces = []
const randomC = 25 * Math.random()



pictureGen.regenerateFaces = function(eqFunc) {
    terrainFaces = []
    for (let v = 0; v < 50 * 50; v++) {
        let tx = v % 50;
        let ty = (v - tx) / 50
        heightmap[v] = {
            x: tx * 50,
            y: 0,
            z: ty * 50,
            index: v,
            connections: []
        }
        heightmap[v].y = eqFunc(tx - 50 / 2, ty - 50 / 2)
    }
    let minv = 2**63 - 1;
    let maxv = -minv;
    for(let i = 0; i<heightmap.length; i++){
        if(heightmap[i].y < minv) minv = heightmap[i].y;
        if(heightmap[i].y > maxv) maxv = heightmap[i].y;
    }
    maxv++;
    for(let i = 0; i<heightmap.length; i++){
        heightmap[i].y = (heightmap[i].y - minv)*1000/(maxv - minv)
    }
    for (let v = 0; v < 50 * 50; v++) {
        let i = heightmap[v]
        
        let a1 = heightmap.filter(j => j.x == i.x + 50 && j.z == i.z)[0] ?? i
        let a2 = heightmap.filter(j => j.x == i.x + 50 && j.z == i.z + 50)[0] ?? i
        let a3 = heightmap.filter(j => j.x == i.x && j.z == i.z + 50)[0] ?? i

        terrainFaces.push([i, a1, a2, a3])
    }
    return [minv, maxv]
}



evaluator.generatePictureFromEquation = function(eqFunc, parameters, width, height, canvas, ctx){
    pictureGen.w = width;
    pictureGen.h = height;
    canvas.width = pictureGen.w;
    canvas.height = pictureGen.h;
    pictureGen.fov = pictureGen.w*0.9;
    pictureGen.fovInvConst = 1/pictureGen.fov;
    let maxvs = pictureGen.regenerateFaces(eqFunc);
    for(let i = 0; i<terrainFaces.length; i++){
        let k = terrainFaces[i][0].y;
        let tr = fade(k,0,1000,rArr) >> 0;
        let tg = fade(k, 0, 1000, gArr) >> 0;
        let tb = fade(k, 0, 1000, bArr) >> 0;
        terrainFaces[i][4] = 'rgb('+tr+','+tg+','+tb+')';
    }
    pictureGen.worldDraw(ctx);
    return maxvs;
}