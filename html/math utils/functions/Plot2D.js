evaluator.plot2D = function(tree, canvas, ctx, variables) {
    let func = tree.values[1];
    let xmin = tree.values[2];
    let xmax = tree.values[3];
    let ymin = tree.values[4];
    let ymax = tree.values[5];
    let pts = [];
    canvas.style.display = 'inline-block';
    if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        let newvars = structuredClone(variables);
        let dx = xmax.values - xmin.values;
        let dy = ymax.values - ymin.values;
        let ratio = dx / dy;
        let nw = 0;
        let nh = 0;
        if (ratio < 1) {
            nw = document.body.clientHeight / 2;
            nh = nw * ratio;
        } else {
            nh = document.body.clientHeight / 2;
            nw = nh / ratio;
        }
        canvas.width = nw;
        canvas.height = nh;
        for (let x = 0; x <= nw; x += 3) {
            newvars['x'] = (x / nw) * dx + xmin.values;
            for (let y = 0; y <= nh; y += 3) {
                newvars['y'] = (y / nh) * dy + ymin.values;
                let evaled = evaluator.evaluateEquation(func, newvars);
                if (evaled.type != 'Number') return tree;
                if (Math.abs(evaled.values) < 0.001 * (xmax.values - xmin.values) * (ymax.values - ymin.values)) pts.push([x, y]);
            }
        }
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = colorScheme[0];
        for (let i = 0; i < pts.length; i++) {
            let cp = pts[i];
            ctx.fillRect(cp[0], nh - cp[1], 3, 3);
        }
        return tree;
    } else {
        return tree;
    }
}