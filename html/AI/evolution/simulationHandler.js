const w = document.body.clientWidth;
const h = document.body.clientHeight;
let animals = [];
let foods = [];
let startCount = 5;
let foodCount = 7;
let dt = 0.1;
let posx = [100,w-100];
let posy = [100,h-100];
let baseNetwork = new model();
baseNetwork.add(new InputLayer(4));
baseNetwork.add(new Activation({
    reg:sigmoid,
    prime:sigmoidPrimeEval
}));
baseNetwork.add(new Layer(3));
baseNetwork.add(new Activation({
    reg:sigmoid,
    prime:sigmoidPrimeEval
}));
baseNetwork.add(new Layer(4));
baseNetwork.add(new Activation({
    reg:sigmoid,
    prime:sigmoidPrimeEval
}));
baseNetwork.compile({learningRate:0.1, decay:1});

class animal {
    x;
    y;
    health;
    hunger;
    network;
    speed;
    startingHealth;
    network = [];
    index;
    id;
    constructor(x = Math.random()*w, y = Math.random()*h, health = 1, network = baseNetwork, speed = 15){
        this.network = network;
        this.x = x;
        this.y = y;
        this.health = health;
        this.startingHealth = health;
        this.hunger = 0;
        this.speed = speed;
        this.index = animals.length;
        this.id = Math.random();
        animals.push(this);
    }
    
}
class food {
    x;
    y;
    constructor(x, y){
        this.x = x;
        this.y = y;
        foods.push(this);
    }
}
new animal(100, 100);
new animal(100, 100);
new animal(100, 100);
new animal(w - 100, h - 100);
new animal(w - 100, h - 100);
new animal(w - 100, h - 100);
new food(w/2, h/2);

function processThoughts(){
    animals = animals.filter(i => i.health > 0);
    for(let i = 0; i<animals.length; i++){
        let animal = animals[i];
        animals[i].hunger+=0.25*dt;

        if(animal.hunger >= 1){
            animals[i].health -= 0.7*dt;
            animals[i].hunger = 1;
        }
        //movement network:
        let closestFood = foods.sort((a,b) => (a.x - animal.x)**2 + (a.y - animal.y)**2 - (b.x - animal.x)**2 - (b.y - animal.y)**2)[0];
        if(closestFood == undefined) continue;
        let dx = closestFood.x - animal.x;
        let dy = closestFood.y - animal.y;
        if(dx**2 + dy**2 < (foodW + animW)**2){
            animals[i].hunger -= 1;
            let ind = foods.indexOf(closestFood);
            foods = foods.filter((i,v) => v != ind)
        } else {
        let dxp = (dx + Math.abs(dx))/2;
        let dxn = (-dx + Math.abs(dx))/2;
        let dyp = (dy + Math.abs(dy))/2;
        let dyn = (-dy + Math.abs(dy))/2;
        let io = [(dxp),(dxn),(dyp),(dyn)];
        let movement = animal.network.predict(io).column;
        //console.log(movement, dx, dy)
        let totalX = movement[0]-movement[1];
        let totalY = movement[2]-movement[3];
        totalX /= Math.sqrt(totalX**2 + totalY**2);
        totalY /= Math.sqrt(totalX**2 + totalY**2);
        if(isNaN(totalX)) totalX = 0;
        if(isNaN(totalY)) totalY = 0;
        animals[i].x+=totalX*animal.speed**2*dt;
        animals[i].y+=totalY*animal.speed**2*dt;
        }
    
    }
}
let lastAnims = animals;
let count = 0;
let hd = [];
let sd = [];
let ts = [];
function generation(){
    count++;
    let step = 0;
    let lastStep = [];
    while(foods.length > 0 && animals.length > 1 && step < 1000){ lastStep = animals; processThoughts(); step++;}
    let anim;
    if(foods.length == 0) {
        anim = animals.sort((a,b) => a.hunger - b.hunger)[0];
    } else if(animals.length == 0){
        anim = lastStep.sort((a,b) => (a.x - foods[0].x)**2 + (a.y - foods[0].y)**2 - (b.x - foods[0].x)**2 - (b.y - foods[0].y)**2 )[0]
    } else {
        anim = animals.sort((a,b) => (a.x - foods[0].x)**2 + (a.y - foods[0].y)**2 - (b.x - foods[0].x)**2 - (b.y - foods[0].y)**2 )[0]
    }
    animals = []
    foods = [];
    for(let i = 0; i<1; i++) new food(w/2,h/2);

    for(let i = 0; i<2+count/1e4; i++){
        let a = new animal(Math.random()*w,Math.random()*h,anim.startingHealth + Math.random()/100 - 0.005, anim.network, anim.speed + Math.random()/10 - 0.05);
        let closestFood = foods.sort((j,b) => (a.x - j.x)**2 + (a.y - j.y)**2 - (b.x - j.x)**2 - (b.y - j.y)**2)[0];
        let dx = closestFood.x - a.x;
        let dy = closestFood.y - a.y;
        let dxp = (dx + Math.abs(dx));
        let dxn = (-dx + Math.abs(dx));
        let dyp = (dy + Math.abs(dy));
        let dyn = (-dy + Math.abs(dy));
        let io = [(dxp),(dxn),(dyp),(dyn)];
        a.network.backwardsPass(io, [sigmoid(dxp),sigmoid(dxn),sigmoid(dyp),sigmoid(dyn)], 0.001)
    }
    ts.push(step);
    hd.push(animals[0].startingHealth);
    sd.push(animals[0].speed);
    
    lastAnims = animals;
}
let lastStep = [];
function generation2(){
    let step = 0;
    while(animals.length > 1 && step < 1000){ lastStep = animals; processThoughts(); step++;}
    if(foods.length != 0){
        if(animals.length == 0){
            for(let i = 0; i<6; i++){
            let anim = lastStep[0];
            let a = new animal(Math.random()*w,Math.random()*h,anim.startingHealth + Math.random()/100 - 0.005, anim.network, anim.speed + Math.random()/10 - 0.05);
            let closestFood = foods.sort((j,b) => (a.x - j.x)**2 + (a.y - j.y)**2 - (b.x - j.x)**2 - (b.y - j.y)**2)[0];
            let dx = closestFood.x - a.x;
            let dy = closestFood.y - a.y;
            let dxp = (dx + Math.abs(dx));
            let dxn = (-dx + Math.abs(dx));
            let dyp = (dy + Math.abs(dy));
            let dyn = (-dy + Math.abs(dy));
            let io = [(dxp),(dxn),(dyp),(dyn)];
            a.network.backwardsPass(io, [sigmoid(dxp),sigmoid(dxn),sigmoid(dyp),sigmoid(dyn)], 0.001)
            }
        } else {
            for(let i = 0; i<6; i++){
            let anim = animals[0];
            let a = new animal(Math.random()*w,Math.random()*h,anim.startingHealth + Math.random()/100 - 0.005, anim.network, anim.speed + Math.random()/10 - 0.05);
            let closestFood = foods.sort((j,b) => (a.x - j.x)**2 + (a.y - j.y)**2 - (b.x - j.x)**2 - (b.y - j.y)**2)[0];
            let dx = closestFood.x - a.x;
            let dy = closestFood.y - a.y;
            let dxp = (dx + Math.abs(dx));
            let dxn = (-dx + Math.abs(dx));
            let dyp = (dy + Math.abs(dy));
            let dyn = (-dy + Math.abs(dy));
            let io = [(dxp),(dxn),(dyp),(dyn)];
            a.network.backwardsPass(io, [sigmoid(dxp),sigmoid(dxn),sigmoid(dyp),sigmoid(dyn)], 0.001)
            }
        }
        return;
    } else {
        let anim = lastStep[0];
        if(animals.length != 0) anim = animals[0];
        new food(w*Math.random(), h*Math.random());
        for(let i = 0; i<6; i++){
        let a = new animal(Math.random()*w,Math.random()*h,anim.startingHealth + Math.random()/100 - 0.005, anim.network, anim.speed + Math.random()/10 - 0.05);
        let closestFood = foods[0];
        let dx = closestFood.x - a.x;
        let dy = closestFood.y - a.y;
        let dxp = (dx + Math.abs(dx));
        let dxn = (-dx + Math.abs(dx));
        let dyp = (dy + Math.abs(dy));
        let dyn = (-dy + Math.abs(dy));
        let io = [dxp,dxn,dyp,dyn];
        //console.log(io)
        a.network.backwardsPass(io, a.network.predict(io).column, 1e-6 * step);
        for(let j = 0; j<a.network.length; j++) for(let k = 0; k<a.network[j].length; k++) for(let l = 0; l<a.network[j].rows[k].column.length; l++){
            a.network[j].rows[k].column[l] += Math.random()/100 - 0.005;
        }
        }
    }
}

function g(t){
    if(animals.length == 0) return;
    processThoughts()
    if(foods.length == 0) new food(w*Math.random(),h*Math.random())
    setTimeout(function(){
        g(t+1)
    },100/6)
}
/*
setTimeout(function(){
let t = Date.now();
for(let i = 0; i<5e4; i++) generation();
console.log(Date.now() - t,'ms to train')
g(0)
},100)*/
/*
IDEA:
START W 2 ANIMALS IN EACH CORNER, 1 FOOD IN MIDDLE
KEEP BACKWARDSPASSING TOWARDS IDEAL UNTIL FOOD IN MIDDLE IS CAPTURED DURING A GENERATION
THEN:
WHENEVER FOOD IS CAPTURED THEN MAKE A NEW FOOD, AT END OF TIMEFRAME BEST ANIMAL IS WHICHEVER CAPTURED FOOD MOST OFTEN
BACKWARDSPASS TOWARDS SELF

INCLUDE POSITION OF ANIMAL IN NETWORK INPUTS
*/