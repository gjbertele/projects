var numParticles = 100;
var pressureForce = 100;
var gravity = 10;
var borderElasticity = 0.8;
var followingParticle = false;
var particleFountain = false;
const dx = 0.5 * terrainDetail;
var dt = 0.1;
const pw = 0.1;
let smoothingRadius = 10;
let positions = [];
let velocities = [];
let densities = [];
let ids = [];

function createParticle(x, y, z, render) {
    if (render == true) {
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
        ids.push(shapes.length - 1);
    } else {
        ids.push(-1);
    }

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
                /*if(positions[i].x == positions[p].x) dvx+=Math.random()*dt*dt*pressureForce;
                if(positions[i].y == positions[p].y) dvy+=Math.random()*dt*dt*pressureForce;
                if(positions[i].z == positions[p].z) dvz+=Math.random()*dt*dt*pressureForce;
                if(!isNaN(dvx)) { nextvelocities[i].x += dvx; nextvelocities[p].x += -dvx; }
                if(!isNaN(dvy)) { nextvelocities[i].y += dvy; nextvelocities[p].y += -dvy; }
                if(!isNaN(dvz)) { nextvelocities[i].z += dvz; nextvelocities[p].z += -dvz; }*/
                nextvelocities[i].x += dvx; nextvelocities[p].x += -dvx;
                nextvelocities[i].y += dvy; nextvelocities[p].y += -dvy;
                nextvelocities[i].z += dvz; nextvelocities[p].z += -dvz;

            }
        }

        nextvelocities[p].y += -gravity*dt;
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
    positions = nextpositions;
    velocities = nextvelocities;
}
let frame = 0;
function pass(){}
function timeAdvance(){
    ([pass, step][Math.sign(dt)])();
    if(particleFountain == true){
        numParticles++;
        document.querySelector('.particleCount').value = numParticles;
        createParticle(worldWidth*terrainDetail/2, (worldHeight - 1)*terrainDetail, worldHeight*terrainDetail/2,true)
    }

    frame++;
    if (frame == 2) {
        frame = 0;
        for (p in positions) {
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
link(document.querySelector('.worldWidth'),['worldWidth', 'worldHeight']);
link(document.querySelector('.borderElasticity'),['borderElasticity']);
link(document.querySelector('.showDensity'),['showDensity']);
link(document.querySelector('.particleCount'),['numParticles']);
link(document.querySelector('.dt'),['dt']);
link(document.querySelector('.particleFountain'),['particleFountain']);


