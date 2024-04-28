evaluator.plot2D = function(tree, canvas, ctx, variables) {
    let func = tree.values[1];
    let xmin = tree.values[2];
    let xmax = tree.values[3];
    let ymin = tree.values[4];
    let ymax = tree.values[5];
    let pts = [];
    canvas.style.display = 'inline-block';
    console.log(tree,func)
    if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        let newvars = structuredClone(variables);
        let dx = xmax.values - xmin.values;
        let dy = ymax.values - ymin.values;
        let nw = document.body.clientWidth/3;
        let nh = document.body.clientWidth/3;
        canvas.width = nw;
        canvas.height = nh;
        for (let x = 0; x <= nw; x += 1) {
            newvars['x'] = (x / nw) * dx + xmin.values;
            for (let y = 0; y <= nh; y += 1) {
                newvars['y'] = (y / nh) * dy + ymin.values;
                let evaled = evaluator.evaluateEquation(func, newvars);
                if (evaled.type != 'Number') continue
                if (Math.abs(evaled.values) >= 0.0001*(xmax.values - xmin.values)*(ymax.values - ymin.values)) continue;
                pts.push([x,y])
            }
        }
        console.log(pts)
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = colorScheme[0]
        for (let i = 1; i < pts.length; i++) {
            let cp = pts[i];
            let closestPoint = pts[0];
            for(let j = i+1; j<pts.length; j++){
                if((pts[j][0] - cp[0])**2 + (pts[j][1] - cp[1])**2 > (closestPoint[0] - cp[0])**2 + (closestPoint[1] - cp[1])**2) continue;
                if(pts[j][1] > nh || pts[j][1] < 0) break;
                closestPoint = pts[j];
            
            }
            for(let j = i-1; j>-1; j--){
                if((pts[j][0] - cp[0])**2 + (pts[j][1] - cp[1])**2 > (closestPoint[0] - cp[0])**2 + (closestPoint[1] - cp[1])**2) continue;
                if(pts[j][1] > nh || pts[j][1] < 0) break;
                closestPoint = pts[j];
            
            }
            ctx.beginPath();
            ctx.moveTo(cp[0],nh-cp[1]);
            ctx.lineTo(closestPoint[0],nh-closestPoint[1]);
            ctx.stroke();
        }
        ctx.strokeStyle = '#FFF';
        let xAxisY = -ymin.values*nh/dy;
        if(xAxisY>0 && xAxisY<nh){
            ctx.beginPath();
            ctx.moveTo(0,xAxisY);
            ctx.lineTo(nw,xAxisY);
            ctx.stroke();
        }
        let yAxisX = -xmin.values*nw/dx;
        if(yAxisX>0 && yAxisX<nw){
            ctx.beginPath();
            ctx.moveTo(yAxisX,0);
            ctx.lineTo(yAxisX,nh);
            ctx.stroke();
        }
        return tree;
    } else {
        return tree;
    }
}