var numParticles = 300;
var pressureForce = 100;
var movementSpeed = 50;
var gravity = 10;
var borderElasticity = 0.8;
var followingParticle = false;
var particleFountain = false;
const dx = 0.5 * terrainDetail;
var dt = 0.1;
const pw = 0.1;
let smoothingRadius = 25;
let positions = [];
let velocities = [];
let densities = [];
let parentObjects = [];
let parentObjectOffsetIndexes = []
let ids = [];
let renders = [];
let objects = [null]
function pass(){}

function createObject(x, y, z, childParticles){
    let offsetsArr = [];
    childParticles.forEach(function(i,v){
        parentObjects[i] = objects.length;
        parentObjectOffsetIndexes[i] = offsetsArr.length;
        offsetsArr.push({
            id:i,
            x:positions[i].x - x,
            y:positions[i].y - y,
            z:positions[i].z - z,
            dist:Math.sqrt((positions[i].x - x)**2 + (positions[i].y - y)**2 + (positions[i].z - z)**2)
        })
    })
    let objectProperties = {
        x:x,
        y:y,
        z:z,
        rx:0,
        ry:0,
        rz:0,
        rvx:0,
        rvy:0,
        rvz:0,
        vx:0,
        vy:0,
        vz:0,
        offsets:offsetsArr,
        id:objects.length
    }
    objects.push(objectProperties)
    return objectProperties
}

function createParticle(x, y, z, render = true) {
   // if (render == true) {
        let s = new polygon(x, -y, z, [{
            x: -pw,
            y: pw,
            z: pw
        }, {
            x: pw,
            y: pw,
            z: pw
        }, {
            x: pw,
            y: pw,
            z: -pw
        }, {
            x: -pw,
            y: pw,
            z: -pw
        }, {
            x: -pw,
            y: -pw,
            z: pw
        }, {
            x: pw,
            y: -pw,
            z: pw
        }, {
            x: pw,
            y: -pw,
            z: -pw
        }, {
            x: -pw,
            y: -pw,
            z: -pw
        }]);
        s.color = '#0000FF';
        ids.push(positions.length);
        parentObjects.push(-1)
        renders.push(true)
   /* } else {
        ids.push(-1);
    }*/

    positions.push({
        x,
        y,
        z
    });
    velocities.push({
        x: 0,
        y: 0,
        z: 0
    });
    return positions.length - 1;
}
let a = 5;
let mc = worldWidth * terrainDetail / 2;
for(let j = 0; j<numParticles; j++){
    createParticle(worldWidth*terrainDetail*Math.random(), worldHeight*terrainDetail*Math.random(),worldHeight*terrainDetail*Math.random(), true)
}
function count(x1, y1, z1, x2, y2, z2) {
    let c = 0;
    for (let i = 0; i<positions.length; i++){
        let shape = positions[i]
        if (shape.x >= x1 && shape.x <= x2 && shape.y >= y1 && shape.y <= y2 && shape.z >= z1 && shape.z <= z2) c++;
    }
    return c;
}


function step() {
    let nextpositions = positions;
    let nextvelocities = velocities;
    let nextobjects = objects;
    for (p in positions) {
        nextpositions[p].x += velocities[p].x * dt;
        nextpositions[p].y += velocities[p].y * dt;
        nextpositions[p].z += velocities[p].z * dt;

        for(let i = 0; i<positions.length; i++){
            let d = ((positions[i].x - positions[p].x) >> 0)**2 + ((positions[i].y - positions[p].y) >> 0)**2 + ((positions[i].z - positions[p].z) >> 0)**2
            if(d < smoothingRadius**2){
                let dvx = dt*pressureForce/(2*(positions[p].x - positions[i].x) + 1.00000237);
                let dvy = dt*pressureForce/(2*(positions[p].y - positions[i].y) + 1.00000237);
                let dvz = dt*pressureForce/(2*(positions[p].z - positions[i].z) + 1.00000237);
                nextvelocities[i].x += dvx; nextvelocities[p].x += -dvx;
                nextvelocities[i].y += dvy; nextvelocities[p].y += -dvy;
                nextvelocities[i].z += dvz; nextvelocities[p].z += -dvz;

            }
        }

        nextvelocities[p].y += -gravity*dt;


        if(parentObjects[p] >= 0){
            let offsetData = objects[parentObjects[p]].offsets[parentObjectOffsetIndexes[p]]
            let otherChildren = objects[parentObjects[p]].offsets.length
            /*let fx = Math.sign(offsetData.x)*nextvelocities[p].x*dt/otherChildren;
            let fy =  Math.sign(offsetData.y)*nextvelocities[p].y*dt/otherChildren;
            let fz = Math.sign(offsetData.z)*nextvelocities[p].z*dt/otherChildren;
            objects[parentObjects[p]].offets[parentObjectOffsetIndexes[p]].vectorRotVelocity = [fy + fz, fx + fz, fx + fy];*/
            nextobjects[parentObjects[p]].vx += nextvelocities[p].x/objects[parentObjects[p]].offsets.length*dt;
            nextobjects[parentObjects[p]].vy += nextvelocities[p].y/objects[parentObjects[p]].offsets.length*dt;
            nextobjects[parentObjects[p]].vz += nextvelocities[p].z/objects[parentObjects[p]].offsets.length*dt;
        } else {
            if (positions[p].x < 0 || positions[p].x > worldWidth * terrainDetail) {
                velocities[p].x *= -borderElasticity;
                nextpositions[p].x = worldWidth * terrainDetail * (Math.sign(positions[p].x) + 1)/2
            }
            if (positions[p].z < 0 || positions[p].z > worldHeight * terrainDetail) {
                velocities[p].z *= -borderElasticity;
                nextpositions[p].z = worldHeight * terrainDetail * (Math.sign(positions[p].z) + 1)/2
            }
            if (positions[p].y < 0 || positions[p].y > worldHeight * terrainDetail) {
                velocities[p].y *= -borderElasticity;
                nextpositions[p].y = worldHeight * terrainDetail * (Math.sign(positions[p].y) + 1)/2
            }
        }

    }
    for(o in nextobjects){
        if(o < 1) continue;
        nextobjects[o].vy += -gravity*dt;
        nextobjects[o].x += nextobjects[o].vx*dt;
        nextobjects[o].y += nextobjects[o].vy*dt;
        nextobjects[o].z += nextobjects[o].vz*dt;
        nextobjects[o].rx += nextobjects[o].rvx*dt;
        nextobjects[o].ry += nextobjects[o].rvy*dt;
        nextobjects[o].rz += nextobjects[o].rvz*dt;
        nextobjects[o].rvx *= 0.95;
        nextobjects[o].rvy *= 0.95;
        nextobjects[o].rvz *= 0.95;
        let rotmatrix = compute3DRotationMatrices(nextobjects[o].rx, nextobjects[o].ry, nextobjects[o].rz)
        for(p in nextobjects[o].offsets){
            let childPart = nextobjects[o].offsets[p];
            let rotatedOffset = mat3xvector3(rotmatrix[0],mat3xvector3(rotmatrix[1],mat3xvector3(rotmatrix[2], [childPart.x, childPart.y, childPart.z])))
            /*let fx = rotatedOffset[0]*nextvelocities[p].x*dt/(nextobjects[o].offsets.length);
            let fy = rotatedOffset[1]*nextvelocities[p].y*dt/(nextobjects[o].offsets.length);
            let fz = rotatedOffset[2]*nextvelocities[p].z*dt/(nextobjects[o].offsets.length);
            nextobjects[o].rvx += (fy + fz)*dt;
            nextobjects[o].rvy += (fx + fz)*dt;
            nextobjects[o].rvz += (fx + fy)*dt;*/
            nextpositions[childPart.id].x = nextobjects[o].x + rotatedOffset[0];
            nextpositions[childPart.id].y = nextobjects[o].y + rotatedOffset[1];
            nextpositions[childPart.id].z = nextobjects[o].z + rotatedOffset[2];
        }

        //COLLISIONS FOR OBJECTS
        if(nextobjects[o].x < 0 || nextobjects[o].x > worldWidth*terrainDetail){
            nextobjects[o].rvx *= -1
            nextobjects[o].vx *= -1
            nextobjects[o].x = worldWidth * terrainDetail * ((Math.sign(nextobjects[o].x) + 1)/2)
        }
        if(nextobjects[o].y < 0 || nextobjects[o].y > worldHeight*terrainDetail){
            nextobjects[o].rvy *= -1
            nextobjects[o].vy *= -1
            nextobjects[o].y = worldHeight * terrainDetail * (Math.sign(nextobjects[o].y) + 1)/2
        }
        if(nextobjects[o].z < 0 || nextobjects[o].z > worldHeight*terrainDetail){
            nextobjects[o].rvz *= -1
            nextobjects[o].vz *= -1
            nextobjects[o].z = worldHeight * terrainDetail * (Math.sign(nextobjects[o].z) + 1)/2
        }
    }
    /*
    loop over all objects
    increment rx, ry, rz, x, y, z, according to rvx, rvy, rvx, vx, vy, vz
    loop over all child elements:
            redefine nextposition[p] with offset data of child x,y,z rotated around parent object x,y,z according to parent object rx, ry, rz
    */
    objects = nextobjects
    positions = nextpositions;
    velocities = nextvelocities;
}
let frame = 0
let frameTime = Date.now();
function timeAdvance(){
    ([pass, step][Math.sign(dt)])(); //optimization of if(dt != 0) step();
    if(particleFountain == true){
        numParticles++;
        document.querySelector('.particleCount').value = numParticles;
        createParticle(worldWidth*terrainDetail/2 + Math.random()*10 - 5, (worldHeight - 1)*terrainDetail, worldHeight*terrainDetail/2 + Math.random()*10-5,true)
    }

    frame++;
    if (true) {
        frame = 0
        frameTime = Date.now();
        for (p in positions) {
            if(velocities[p].x + velocities[p].y + velocities[p].z > 2048) ids[p] = -1;
            if (ids[p] != -1) {
                shapes[ids[p]].x = positions[p].x;
                shapes[ids[p]].y = -positions[p].y;
                shapes[ids[p]].z = positions[p].z;
            }
        }
        worldDraw();
    }
    requestAnimationFrame(timeAdvance)
}
timeAdvance()
link(document.querySelector('.pressureForce'),["pressureForce"]);
link(document.querySelector('.gravity'),["gravity"]);
link(document.querySelector('.worldWidth'),['worldWidth']);
link(document.querySelector('.worldHeight'),['worldHeight']);
link(document.querySelector('.borderElasticity'),['borderElasticity']);
link(document.querySelector('.showDensity'),['showDensity']);
link(document.querySelector('.particleCount'),['numParticles']);
link(document.querySelector('.dt'),['dt']);
link(document.querySelector('.particleFountain'),['particleFountain']);
link(document.querySelector('.showDensityYZ'),['showSide']);