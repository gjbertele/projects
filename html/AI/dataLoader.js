let dataset3 = [{inputs:[0,0],outputs:[0,0]},{inputs:[1,1],outputs:[1,1]},{inputs:[1,0],outputs:[0.5,0.5]},{inputs:[0,1],outputs:[0.5,0.5]}]
let dataset2 = [{inputs:[0.1, 0.2],outputs:[0.9, 0.1]}];
let dataset = [];
for(let i = 0; i<100; i++){
    dataset.push({inputs:[i/20],outputs:[Math.sqrt(i/20)]})
}
let dataset4 = [{inputs:[0],outputs:[1]},{inputs:[1],outputs:[2]},{inputs:[2],outputs:[4]}];