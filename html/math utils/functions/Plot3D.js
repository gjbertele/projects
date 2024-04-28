evaluator.plot3D = function(tree, canvas, ctx, variables) {
    let func = tree.values[1];
    let xmin = tree.values[2];
    let xmax = tree.values[3];
    let ymin = tree.values[4];
    let ymax = tree.values[5];
    if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
        canvas.style.display = 'inline-block';
        let newvars = structuredClone(variables);
        let nw = document.body.clientHeight / 1.5;
        let nh = document.body.clientHeight / 1.5;
        canvas.width = nw;
        canvas.height = nh;

        let eqf = function(x, y) {
            newvars['x'] = xmin.values + (x + 25) * (xmax.values - xmin.values) / (50);
            newvars['y'] = ymin.values + (y + 25) * (ymax.values - ymin.values) / (50);
            let j = evaluator.evaluateEquation(func, newvars);
            if (j.type != 'Number') return 0;
            if (isNaN(j.values)) return 0;
            return -j.values * 50;
        }
        evaluator.generatePictureFromEquation(eqf, newvars, nw, nh, canvas, ctx)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFF';
        let vs = [eqf(0, 0), eqf(25, 25), eqf(25, -25), eqf(-25, 25)]
        let corner2 = pictureGen.projectTo3D(0, 0, 0 );
        let corner3 = pictureGen.projectTo3D(2000, 0, 0);
        let corner4 = pictureGen.projectTo3D(0, 0, 2000);
        ctx.fillText(`(${xmin.values},${-vs[3]/50},${ymax.values})`, corner4.x, corner4.y);
        ctx.textAlign = 'right';
        ctx.fillText(`(${xmax.values},${-vs[2]/50},${ymin.values})`, corner3.x, corner3.y);
        ctx.fillText(`(${xmin.values},${-vs[1]/50},${ymin.values})`, corner2.x, corner2.y);

        return tree;
    } else {
        return tree;
    }
}