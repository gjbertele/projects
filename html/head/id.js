var img;
var v;
var ctx;
var octx;
var lbgctx;
var dimg;
var bar;

//change this to true for a top down view, change it to false for general telemetry-esque stuff
var map = false;



var model = undefined;
async function finishedLoading() {
    img = document.querySelector('.bg');
    v = document.querySelector("video")
    dimg = document.querySelector('.fg')
    limg = document.querySelector('.lbg')
    octx = dimg.getContext('2d')
    ctx = img.getContext('2d')
    lbgctx = limg.getContext('2d')
    bar = document.querySelector('.bar')
    octx.strokeStyle = '10px #00ff00'
    octx.font = "30px Verdana";
    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user',
                width: document.body.clientWidth,
                height: document.documentElement.clientHeight
            }
        })
        .then(function(str) {
            v.srcObject = str;
            v.play()
            img.getContext('2d').drawImage(v, v.clientWidth, v.clientHeight)
            setTimeout(function() {
                img.width = document.body.clientWidth
                img.height = document.documentElement.clientHeight
                dimg.width = document.body.clientWidth
                dimg.height = document.documentElement.clientHeight
                limg.width = document.body.clientWidth
                limg.height = document.documentElement.clientHeight
            }, 100)
            setInterval(function() {
                octx.clearRect(0, 0, img.width, img.height)
                model.estimateFaces(v, false).then(function(k) {
                    k.forEach(function(i) {
                        var fw = i.bottomRight[0] - i.topLeft[0]
                        var fh = i.bottomRight[1] - i.topLeft[1]
                        octx.clearRect(0, 0, img.width, img.height)
                        setTimeout(function() {
                            //distance
                            octx.beginPath()
                            octx.rect(i.topLeft[0], i.topLeft[1], fw, fh)
                            octx.stroke()
                            var correctDist = true
                            var dist = ((2.54 * 152 * img.height) / (fh * 8.32))/(2.54*3)
                            octx.fillStyle = '#ffffff'
                            octx.fillText('distance: '+dist.toString().substr(0,5) + 'in', i.topLeft[0], i.topLeft[1] - 30)


                            //direction
                            var nose = undefined
                            var lr = undefined;
                            var rr = undefined;
                            var sr = undefined;
                            var chin = undefined;
                            var landmarks = []
                            i.landmarks.forEach(function(k, vk) {
                                if (vk == 2) {
                                    nose = k
                                } else if (vk == 4) {
                                    lr = k
                                } else if (vk == 5) {
                                    rr = k
                                } else if (vk == 3) {
                                    chin = k
                                }
                                landmarks.push(k)
                                octx.fillRect(k[0] - 5, k[1] - 5, 10, 10)
                            })
                            var nd = ((fw / (nose[0] - i.topLeft[0])) - 2) / 2
                            if (nd < 0) {
                                sr = lr
                            } else {
                                sr = rr
                            }
                            var noseContinuePoint = []
                            var chinContinuePoint = []
                            var prependicularContinuePoint = []
                            var rise = nose[1] - sr[1]
                            var run = nose[0] - sr[0]
                            noseContinuePoint = [nose[0] + run, nose[1] + rise]

                            var rt = chin[1] - nose[1]
                            var rr = chin[0] - nose[0]
                            chinContinuePoint = [nose[0] + rr, nose[1]+rise]
                            if(Math.abs(nd)<0.254){
                               noseContinuePoint = chinContinuePoint
                            }

                            //var ncMidPoint = [(nose[0]+chin[0])/2,(nose[1]+chin[1])/2]
                            //prependicularContinuePoint = [ncMidPoint[0]+100,ncMidPoint[1]+(100/(rise/rr))]
                            //console.log([prependicularContinuePoint,rise,rr,(1/(rise/rr)),rise/rr])

                            var overallPoint = [(chinContinuePoint[0]+noseContinuePoint[0])/2,(chinContinuePoint[1]+noseContinuePoint[1])/2]
                            octx.strokeStyle = "#00ff00";
                            if (Math.abs(nd) > 0) {
                                octx.beginPath()
                                octx.moveTo(nose[0], nose[1])
                                octx.lineTo(overallPoint[0], overallPoint[1])
                                octx.stroke()
                                octx.strokeStyle = "#ff0000";
                                octx.beginPath()
                                octx.moveTo(nose[0], nose[1])
                                octx.lineTo(noseContinuePoint[0], noseContinuePoint[1])
                                octx.stroke()
                                octx.strokeStyle = "#0000ff";
                                octx.beginPath()
                                octx.moveTo(nose[0], nose[1])
                                octx.lineTo(chinContinuePoint[0], chinContinuePoint[1])
                                octx.stroke()
                                octx.strokeStyle = "#ff0000";
                                //octx.beginPath()
                                //octx.moveTo(ncMidPoint[0], ncMidPoint[1])
                                //octx.lineTo(prependicularContinuePoint[0], prependicularContinuePoint[1])
                                //octx.stroke()
                                
                            }
                            octx.strokeStyle = "#FF0000";

                            //eye dist
                            var ppm = Math.abs(((landmarks[0][0]-landmarks[1][0])^2)+((landmarks[0][1]-landmarks[1][1])^2))/2.54;
                            var fwi = fw/ppm
                            var fhi = fh/ppm
                            octx.fillText(fwi.toString().substr(0,5)+'in x '+fhi.toString().substr(0,5)+'in',i.topLeft[0],i.topLeft[1]-45)

                            //better rotation/mapping
                            if(map == true){
                                document.querySelector('.cover').style.display = 'inline-block'
                            }
                            var brd = -((fw/2)-(nose[0]-i.topLeft[0]))/2
                            document.querySelector("body > .head").style.transform = 'translate(-50%,-50%) rotateZ('+(brd+90)+'deg)'

                            var cd = Math.sqrt((dist*dist)-((2/3)*dist)/2)
                            octx.fillText('also distance: '+cd.toString().substr(0,5)+'in',i.topLeft[0],i.topLeft[1]-15)

                            var ppi = img.height/40
                            if(map == true){
                                document.querySelector('.head').style.bottom = (cd*ppi)-(1920/4)+'px'
                            } else {
                                document.querySelector('.head').style.top = '150%'
                            }
                            document.querySelector('.head').style.left = img.width-(i.topLeft[0])+'px'
                            
                            
                        })
                    })
                })
            }, 100)

        })
}

blazeface.load().then(function(i) {
    model = i
    finishedLoading()
})