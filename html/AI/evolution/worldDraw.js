const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const animW = 50;
const foodW = 40;
canvas.width = w;
canvas.height = h;

function frame(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#FF0000';
    for(let i = 0; i<animals.length; i++){
        ctx.fillRect(animals[i].x - animW/2,animals[i].y-animW/2, animW, animW);
    }
    ctx.fillStyle = '#000000';
    for(let i = 0; i<foods.length; i++){
        ctx.fillRect(foods[i].x - foodW/2,foods[i].y-foodW/2, foodW, foodW);
    }
    requestAnimationFrame(frame);
}
frame();