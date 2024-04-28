evaluator.contourPlot = function(tree, canvas, ctx, variables) {
    let func = tree.values[1];
    let xmin = tree.values[2];
    let xmax = tree.values[3];
    let ymin = tree.values[4];
    let ymax = tree.values[5];
    canvas.style.display = 'inline-block';
    let pts = [];
    if (xmin.type == 'Number' && xmin.type == ymin.type && ymin.type == xmax.type && xmax.type == ymax.type) {
        let newvars = structuredClone(variables);
        let minv = 2 ** 63 - 1;
        let maxv = -minv;
        let dy = (ymax.values - ymin.values);
        let dx = (xmax.values - xmin.values);
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
        canvas.width = parseInt(nw);
        canvas.height = parseInt(nh);


        for (let x = 0; x <= nw; x += 3) {
            newvars['x'] = (x / nw) * dx + xmin.values;
            for (let y = 0; y <= nh; y += 3) {
                newvars['y'] = (y / nh) * dy + ymin.values;
                let evaled = evaluator.evaluateEquation(func, newvars);
                if (evaled.type != 'Number') return tree;
                if (!isNaN(evaled.values)) {
                    pts.push([x, y, evaled.values]);
                    if (evaled.values > maxv) maxv = evaled.values;
                    if (evaled.values < minv) minv = evaled.values;
                }
            }
        }
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        for (let i = 0; i < pts.length; i++) {
            let x = pts[i][0];
            let y = pts[i][1];
            let cr = fade(pts[i][2], minv, maxv, rArr);
            let cg = fade(pts[i][2], minv, maxv, gArr);
            let cb = fade(pts[i][2], minv, maxv, bArr);
            ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
            ctx.fillRect(x, y, 3, 3)
        }
        ctx.fillStyle = '#FFF'
        let xAxis = -xmin.values * nw / dx;
        if (xAxis > 0 && xAxis < nw) {
            ctx.fillRect(xAxis - 1, 0, 3, nh);
        }
        let yAxis = -ymin.values * nh / dy;
        if (yAxis > 0 && yAxis < nh) {
            ctx.fillRect(0, yAxis - 1, nw, 3);
        }
        ctx.strokeStyle = '#000';
        ctx.textAlign = 'left'
        ctx.fillText('(' + xmin.values + ',' + ymin.values + ')', 5, nh - 5);
        ctx.fillText('(' + xmin.values + ',' + ymax.values + ')', 5, 10);
        ctx.textAlign = 'right'
        ctx.fillText('(' + xmax.values + ',' + ymin.values + ')', nw - 5, nh - 5);
        ctx.fillText('(' + xmax.values + ',' + ymax.values + ')', nw - 5, 10);
        return tree;
    } else {
        return tree;
    }
}