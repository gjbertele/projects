ctx.strokeStyle = '#FFFFFF'
var showDensity = false;
var showSide = false;
var screenPixels = (new Array(30000)).fill(255)

const worldDraw = () => {
    regenerateFaces()
    //CHANGE REGENERATEFACES TO ONLY CHANGE COLORS
    //loop over all particles once and add to color value at corresponding terrain face -> o(N) instaed of O(N^2)
    let boundaries = [projectTo3D(0, 0, 0), projectTo3D(0, -1e4, 0), projectTo3D(wwtdh * 2, 0, whtdh * 2), projectTo3D(wwtdh * 2, -1e4, whtdh * 2), projectTo3D(wwtdh * 2, 0, 0), projectTo3D(wwtdh * 2, -1e4, 0), projectTo3D(0, 0, whtdh * 2), projectTo3D(0, -1e4, whtdh * 2)]
    let boundaryXMax = Math.max(...boundaries.map(i => i = i.x))
    let boundaryXMin = Math.min(...boundaries.map(i => i = i.x))
    let boundaryYMax = Math.max(...boundaries.map(i => i = i.y))
    let boundaryYMin = Math.min(...boundaries.map(i => i = i.y))
    ctx.clearRect(boundaryXMin - boundaryPanning, boundaryYMin - boundaryPanning, boundaryXMax - boundaryXMin + 2 * boundaryPanning, boundaryYMax - boundaryYMin + 2 * boundaryPanning)
    lookArraysUpdate()
    let p1 = projectTo3D(0, 0, 0);
    let p2 = projectTo3D(worldWidth * terrainDetail, 0, 0);
    let p3 = projectTo3D(worldWidth * terrainDetail, 0, worldHeight * terrainDetail);
    let p4 = projectTo3D(0, 0, worldHeight * terrainDetail);
    let p5 = projectTo3D(worldWidth * terrainDetail, -worldHeight*terrainDetail, 0);
    let p6 = projectTo3D(worldWidth * terrainDetail, -worldHeight*terrainDetail, worldHeight*terrainDetail);
    if(showSide == false){
        p5 = p2;
        p6 = p2;
    }
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath()
    ctx.stroke();
    let processedShapes = [];
    shapes.forEach(function(i, v) {
        i.faces.forEach(function(j, k) {
            let f = []
            j.forEach(function(h, m) {
                f.push({
                    x: (i.x + h[0] * terrainDetail),
                    y: (i.y + h[1] * terrainDetail),
                    z: (i.z + h[2] * terrainDetail)
                })
            })
            if (i.y > cameraPos.y) {
                processedShapes.push([...f, i.color])
            }
        })
    });
    let lc = '#0000FF';
    if (terrainFaces[0] != undefined) lc = terrainFaces[0][4];
    ctx.fillStyle = lc
    terrainFaces.concat(sideFaces).forEach(function(i, v) {
        if(i[5] == false) return;
        let ptsProjected = [projectTo3D(i[0].x, i[0].y, i[0].z), projectTo3D(i[1].x, i[1].y, i[1].z), projectTo3D(i[2].x, i[2].y, i[2].z), projectTo3D(i[3].x, i[3].y, i[3].z)]
        if (!(ptsProjected[0].x > w + boundaryPanning || ptsProjected[0].x < -boundaryPanning || ptsProjected[0].y > h + boundaryPanning || ptsProjected[0].y < -boundaryPanning || i[0].y < cameraPos.y)) {
            ctx.beginPath()
            ctx.moveTo(ptsProjected[0].x, ptsProjected[0].y)
            ctx.lineTo(ptsProjected[1].x, ptsProjected[1].y)
            ctx.lineTo(ptsProjected[2].x, ptsProjected[2].y)
            ctx.lineTo(ptsProjected[3].x, ptsProjected[3].y)
            if (i[4] != lc) {
                ctx.fillStyle = i[4];
                lc = i[4]
            }
            ctx.fill();
        }
    })
    processedShapes.sort((a, b) => cfaceDist(a) - cfaceDist(b)).reverse().forEach(function(i, v) {
        let ptsProjected = [projectTo3D(i[0].x, i[0].y, i[0].z), projectTo3D(i[1].x, i[1].y, i[1].z), projectTo3D(i[2].x, i[2].y, i[2].z), projectTo3D(i[3].x, i[3].y, i[3].z)]
        if (!(ptsProjected[0].x > w + boundaryPanning || ptsProjected[0].x < -boundaryPanning || ptsProjected[0].y > h + boundaryPanning || ptsProjected[0].y < -boundaryPanning || i[0].y < cameraPos.y)) {
            ctx.beginPath()
            ctx.moveTo(ptsProjected[0].x, ptsProjected[0].y)
            ctx.lineTo(ptsProjected[1].x, ptsProjected[1].y)
            ctx.lineTo(ptsProjected[2].x, ptsProjected[2].y)
            ctx.lineTo(ptsProjected[3].x, ptsProjected[3].y)
            if (i[4] != lc) {
                ctx.fillStyle = i[4];
                lc = i[4]
            }
            ctx.fill();
        }
    })
    ctx.fillStyle = '#fff';
}
//OPTIMIZE THIS
setInterval(function() {
    for(let v = 0; v<keysdown.length; v++){
        if(keysdown[v] == "ArrowLeft") cameraPos.rx += -1;
        if(keysdown[v] == "ArrowRight") cameraPos.rx += 1;
        if(keysdown[v] == "w"){ cameraPos.z += movementSpeed*Math.cos(cameraPos.rx*Math.PI/180 + Math.PI/7); cameraPos.x += movementSpeed*Math.sin(cameraPos.rx*Math.PI/180 + Math.PI/7) }
        if(keysdown[v] == "s"){ cameraPos.z += -movementSpeed*Math.cos(cameraPos.rx*Math.PI/180 + Math.PI/7); cameraPos.x += -movementSpeed*Math.sin(cameraPos.rx*Math.PI/180 + Math.PI/7) }
        if(keysdown[v] == "a"){ cameraPos.z += movementSpeed*Math.sin(cameraPos.rx*Math.PI/180 + Math.PI/7); cameraPos.x += -movementSpeed*Math.cos(cameraPos.rx*Math.PI/180 + Math.PI/7) }
        if(keysdown[v] == "d"){ cameraPos.z += -movementSpeed*Math.sin(cameraPos.rx*Math.PI/180 + Math.PI/7); cameraPos.x += movementSpeed*Math.cos(cameraPos.rx*Math.PI/180 + Math.PI/7) }
        if(keysdown[v] == "e") cameraPos.y += -movementSpeed/2;
        if(keysdown[v] == "q") cameraPos.y += movementSpeed/2;

    }
}, 10)

//world gen
var heightmap = []
let terrainFaces = []
let sideFaces = []
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


function regenerateFaces() {
    let colorarr = (new Array(worldWidth*worldHeight)).fill(0);
    let colorarrside = (new Array(worldWidth*worldHeight)).fill(0);
    for(index in positions){
        let i = positions[index];
        let tx = Math.floor(i.x/terrainDetail);
        let ty = Math.floor(i.y/terrainDetail);
        let tz = Math.floor(i.z/terrainDetail);
        colorarr[tx+tz*worldWidth]+=25.5;
        colorarrside[tz+ty*worldWidth]+=25.5;
    }
    if(showDensity == false){
        terrainFaces = []
    } else {
    for(let v = 0; v<worldWidth*worldHeight; v++){
        let i = heightmap[v]
        if(i == undefined) break;
        let a1 = {x: i.x + terrainDetail, y:i.y, z: i.z};
        let a2 = {x: i.x + terrainDetail, y:i.y, z: i.z+terrainDetail};
        let a3 = {x: i.x, y:i.y, z: i.z+terrainDetail};
        let tval = colorarr[v];
        let tcolor = `rgb(${tval},${tval},${tval})`
        terrainFaces[v] = [i,a1,a2,a3,tcolor, true];

        
    }
    }
    if(showSide == true){

    for(let v = 0; v<worldWidth*worldHeight; v++){
        let tx = v % worldWidth
        let ty = (v - tx)/worldWidth;
        sideFaces[v] = [
            {x: worldWidth*terrainDetail, y:-ty*terrainDetail, z:tx*terrainDetail},
            {x: worldWidth*terrainDetail, y:-ty*terrainDetail - terrainDetail, z:tx*terrainDetail},
            {x: worldWidth*terrainDetail, y:-ty*terrainDetail - terrainDetail, z:tx*terrainDetail + terrainDetail},
            {x: worldWidth*terrainDetail, y:-ty*terrainDetail, z:tx*terrainDetail + terrainDetail},
            `rgb(${colorarrside[v]},${colorarrside[v]},${colorarrside[v]})`,true]

        
    }
    } else{
        if(sideFaces.length > 0 && sideFaces[0][5] == true) for(let v = 0; v<worldWidth*worldHeight; v++){
            sideFaces = []
            
        }
        
    }
}