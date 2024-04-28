evaluator.plot5D = function(tree, canvas, ctx, variables){
    let newvars = structuredClone(variables);
    let func = tree.values[1];
    let xmin = tree.values[2].values;
    let xmax = tree.values[3].values;
    let ymin = tree.values[4].values;
    let ymax = tree.values[5].values;
    let zmin = tree.values[6].values;
    let zmax = tree.values[7].values;
    let threshold = tree.values[8].values;
    let stepSize = 80;
    if(isNaN(xmin+xmax+ymin+ymax+zmin+zmax+threshold) == true) return tree;
    let correctPoints = [];
    for(let x = xmin; x<=xmax; x+=(xmax-xmin)/stepSize){
        newvars['x'] = x;
        for(let y = ymin; y<=ymax; y+=(ymax - ymin)/stepSize){
            newvars['y'] = y;
            let z = zmin;
            newvars['z'] = z;
            let evaled = evaluator.evaluateEquation(func,newvars);
            while(z <= zmax && (evaled.type != 'Number' || evaled.values >= threshold)){
                z+=(zmax - zmin)/stepSize;
                newvars['z'] = z;
                evaled = evaluator.evaluateEquation(func,newvars);
            }
            if(z > zmax) continue;
            correctPoints.push({x,y,z,value:evaled.values});
            z = zmax;
            newvars['z'] = z;
            evaled = evaluator.evaluateEquation(func,newvars);
            while(z >= zmin && (evaled.type != 'Number' || evaled.values >= threshold)){
                z-=(zmax - zmin)/stepSize;
                newvars['z'] = z;
                evaled = evaluator.evaluateEquation(func,newvars);
            }
            if(z < zmin) continue;
            correctPoints.push({x,y,z,value:evaled.values});
        }
    }
    let k = correctPoints.map(i => i = pictureGen.cDist(i));
    let maxDist = Math.max(...k);
    let minDist = Math.min(...k);
    //test 3d convex hull on Plot5D(x + y + z, -10, 10, -10, 10, -10, 10, -15)
    for(let i = 0; i<correctPoints.length; i++){
            let v = pictureGen.cDist(correctPoints[i]);
            let cr = fade(v,minDist,maxDist,rArr);
            let cg = fade(v,minDist,maxDist,gArr);
            let cb = fade(v,minDist,maxDist,bArr);
            correctPoints[i].value = 'rgb('+cr+','+cg+','+cb+')';
    }

    canvas.style.display = 'inline-block'
    evaluator.generatePictureFromPoints(correctPoints, document.body.clientWidth/3,document.body.clientWidth/3, canvas, ctx,[xmin,xmax,ymin,ymax,zmin,zmax]);
    
    return tree;
}