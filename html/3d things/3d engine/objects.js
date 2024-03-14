let xAxis = {
    x: 1,
    y: 0
}
let yAxis = {
    x: 0,
    y: 1
}
let calls = 0;
const projectTo3D = (x, y, z) => {
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
}
const shapeFromPoint = (x, y) => {
    var answer = {
        x: 1e6,
        y: 1e6,
        z: 1e6
    }
    shapes.forEach(function(i, v) {
        if (i.type == 0 || i.type == 2) {
            i.screenBBoxes.forEach(function(k, t) {
                if (isPointInPolygon(x, y, k.map(i => i = [i.x, i.y])) == true && cDist(i) < cDist(answer)) {
                    answer = i
                }
            })
        }
    })
    return answer
}
const terrainFaceFromPoint = (x, y) => {
    var answer = [1e6, 1e6, 1e6]
    terrainFaces.forEach(function(i, v) {
        let ptsProjected = [projectTo3D(i[0].x, i[0].y, i[0].z), projectTo3D(i[1].x, i[1].y, i[1].z), projectTo3D(i[2].x, i[2].y, i[2].z), projectTo3D(i[3].x, i[3].y, i[3].z)].map(j => j = [j.x, j.y])
        if (isPointInPolygon(x, y, ptsProjected) == true) {
            answer = i
        }
    })
    return answer
}
const cDist = (i) => {
    return (i.x - cameraPos.rposX + cameraPos.x + 350) ** 2 + (i.y - cameraPos.y) ** 2 + (i.z - cameraPos.rposZ + cameraPos.z - 250) ** 2
}
//OBJECT TYPES
class polygon {
    constructor(x, y, z, points) {
        let newObject = {
            points,
            color: 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')',
            type: 3,
            transparency: 1,
            x,
            y,
            z,
            render:true,
            draw: function() {
                let i = this
                var pts = []
                for (let kv = 0; kv < i.faces.length; kv++) {
                    var tpts = []
                    let kt = i.faces[kv]
                    for (let kvv = 0; kvv < kt.length; kvv++) {
                        let k = kt[kvv]
                        var p1x = i.x + (terrainDetailHalf * k[0])
                        var p1y = i.y + (terrainDetailHalf * k[1])
                        var p1z = i.z + (terrainDetailHalf * k[2])
                        var p1 = projectTo3D(p1x, p1y, p1z)
                        tpts.push(p1)
                    }
                    pts.push(tpts)
                }
                i.screenBBoxes = pts
                return pts
            },
            chunk: chunkCalc(x, z),
            faces: [
                [
                    [points[0].x, points[0].y, points[0].z],
                    [points[1].x, points[1].y, points[1].z],
                    [points[2].x, points[2].y, points[2].z],
                    [points[3].x, points[3].y, points[3].z]
                ], //top
                [
                    [points[4].x, points[4].y, points[4].z],
                    [points[5].x, points[5].y, points[5].z],
                    [points[6].x, points[6].y, points[6].z],
                    [points[7].x, points[7].y, points[7].z]
                ], //bottom
                [
                    [points[0].x, points[0].y, points[0].z],
                    [points[3].x, points[3].y, points[3].z],
                    [points[7].x, points[7].y, points[7].z],
                    [points[4].x, points[4].y, points[4].z]
                ], //left
                [
                    [points[1].x, points[1].y, points[1].z],
                    [points[2].x, points[2].y, points[2].z],
                    [points[6].x, points[6].y, points[6].z],
                    [points[5].x, points[5].y, points[5].z]
                ], //right
                [
                    [points[0].x, points[0].y, points[0].z],
                    [points[1].x, points[1].y, points[1].z],
                    [points[5].x, points[5].y, points[5].z],
                    [points[4].x, points[4].y, points[4].z]
                ], //back
                [
                    [points[2].x, points[2].y, points[2].z],
                    [points[3].x, points[3].y, points[3].z],
                    [points[7].x, points[7].y, points[7].z],
                    [points[6].x, points[6].y, points[6].z]
                ] //front
            ],
            screenBBoxes: [],
            id: 1e15 * Math.random()
        }
        shapes.push(newObject)
        return newObject
    }
}
//end object types