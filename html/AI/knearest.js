const canvas = document.querySelector('canvas');
const input = document.querySelector('input')
const ctx = canvas.getContext('2d');
let ptsCount = 50;
let pts = [];
for(let i = 0; i<ptsCount; i++){
    let tx = Math.random()*700+50;
    let ty = Math.random()*700+50;
    pts.push({x:tx,y:ty,class:classGenerate(tx,ty)});
}
let nearestNeighbours = 10;
let renderStep = 7;
function render(){
    ctx.clearRect(0,0,800,800)
    let imgd = new Uint8ClampedArray(4*800*800);
    for(let i = 0; i<800*800; i++){
        let x = i % 800;
        let y = (i - x)/800;
        let index = i*4;
        imgd[index+3] = 255;
        if(x % renderStep != 0 || y % renderStep != 0) continue;
        let closest = pts.sort((a,b) => dist(a,{x,y}) - dist(b,{x,y})).slice(0,nearestNeighbours);
        let s = 0;
        for(let j = 0; j<closest.length; j++) s+=closest[j].class/dist(closest[j],{x,y});
        if(s >= 0){
            for(let k = 0; k<renderStep**2; k++){
                let dx = k % renderStep;
                let dy = (k - dx)/renderStep;
                let nIndex = 4*((y + dy)*800 + dx + x);
                imgd[nIndex] = 200;
                imgd[nIndex+1] = 64;
                imgd[nIndex+2] = 80;
            }
        } else {
            for(let k = 0; k<renderStep**2; k++){
                let dx = k % renderStep;
                let dy = (k - dx)/renderStep;
                let nIndex = 4*((y + dy)*800 + dx + x);
                imgd[nIndex+2] = 200;
            }
        }
    }
    ctx.putImageData(new ImageData(imgd, 800, 800),0,0)
    for(let i = 0; i<pts.length; i++){
        if(pts[i].class == 1){
            ctx.fillStyle = '#FF4050';
        } else {
            ctx.fillStyle = '#0000FF'
        }
        ctx.beginPath();
        ctx.arc(pts[i].x,pts[i].y,15,0,2*Math.PI);
        ctx.fill();
    }
}
render();
function dist(a,b){
    return (a.x - b.x)**2 + (a.y - b.y)**2;
}
input.onchange = function(){
    nearestNeighbours = input.value;
    render();
}
document.querySelector('button').onclick = function(){
    let tx = Math.random()*700+50;
    let ty = Math.random()*700+50;
    pts.push({x:tx,y:ty,class:classGenerate(tx,ty)});
    render();
}

function classGenerate(x,y){
    if(800-y < 100000/x) return 1;
    return -1;
}