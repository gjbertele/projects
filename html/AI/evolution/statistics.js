const newwindowCode = `<style>
 body {
    position:absolute; 
    left:0; 
    top:0; 
    width:100%; 
    height:100%: 
    margin:0; 
}</style>
<canvas></canvas>
<script>
const data = `
const newwindowcodehalf = `;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const w = document.body.clientWidth;
const h = document.body.clientHeight;
canvas.width = w;
canvas.height = h;
let s = [10,10,100];
let j = 0;
let range = 100;
let rangevals = [];
for(let i = 0; i<2*range; i++){
    rangevals.push(data[0][i]);
}
let smoothen = [Math.max(...rangevals)];
for(let i = 2*range; i<data[0].length - range; i++){
    rangevals.shift();
    rangevals.push(data[0][i]);
    smoothen.push(Math.max(...rangevals));
}
data[0] = smoothen;
let col = ['rgb(255,0,0)','rgb(0,0,0)','rgb(0,0,255)'];
for(let j = 0; j<3; j++){
    ctx.strokeStyle = col[j];
    ctx.beginPath();
    for(let i = 0; i<data[j].length; i++){
        ctx.lineTo(i*w/data[j].length,h-(data[j][i]*s[j]));
    }
    ctx.stroke();
}</script>`