var song;
var fft;
var particles = [];
var rotation_accel = 3;
const RAD_MOD = 225;
const COLOR_FLOOR = 100;
const R_MAX = 150;
const R_MIN = 50;
const G_MAX = 10;
const G_MIN = 50;
const B_MAX = 40;
const B_MIN = 170;
var color_mod = 0;
var temp = 1;
var screen;
var dropzone;
var pic;
var button;

function preload() {
    song = loadSound('Headline.mp3')
    pic = loadImage('city.jpg')
    button = document.getElementById("show-options");

}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    screen = document.getElementById("defaultCanvas0")

    angleMode(DEGREES)
    imageMode(CENTER)
    rectMode(CENTER)
    fft = new p5.FFT(0.3)
    canvas.mouseClicked(toggle_song)
    dropzone = select('#show-options');
    dropzone.drop(gotFile);
}

function gotFile(file){
    if(file.type==AUDIO)
    {
        song = loadSound(file.data)
        alert("New Song Detected")
    }
    else if(file.type == IMAGE){ //TODO: this probably doesnt work yet
        pic = loadImage(file.data)
        alert("New Background Detected")
    }
    else{
        alert("Try a Different File Type")
    }
}

function draw() {
    background(0);
    translate(width / 2, height / 2)
    //rotate(radians(frameCount * rotation_accel))

    fft.analyze()
    amp = fft.getEnergy(20, 220)

    //#region image and shader
    push()
    if (amp > RAD_MOD){
        rotate(random(-0.25,0.25))

    }
    image(pic,0,0,width + 100,height + 100)
    pop()

    var alpha = map(amp, 0, 255, 180, 150)
    fill(0,alpha)
    noStroke()
    rect(0,0, width, height)

    stroke(255)
    strokeWeight(2)
    noFill()
    //#endregion
    
    if(amp < RAD_MOD){
        temp = RAD_MOD / amp;
    }


    var wave = fft.waveform()

    //#region concept circle
    // //circle with just one waveform, doesnt look good
    // beginShape()
    // for(var i = 0; i <= 360; i+= 1){
    //     let angle = radians(i)
    //     var index = floor(map(i, 0, width, 0, wave.length))
    //     var r = map(wave[index], -1, 1, 150, 350)
    //     r /= temp
        
    //     var x = r * sin(i)
    //     var y = r * cos(i)
    //     vertex(x, y)
    // }
    // endShape()
    //#endregion
    
    //#region current waveform
    //right half
    beginShape()
    for(var i = 0; i <=180; i+= 0.5){
        var index = floor(map(i, 0, 180, 0, wave.length - 1))
        var r = map(wave[index], -1, 1, 150, 350)
        //r /= temp
        
        var x = r * sin(i)
        var y = r * cos(i)
        vertex(x, y)
    }
    endShape()
    // left half
    beginShape()
    for(var i = 0; i <=180; i+=0.5){
        var index = floor(map(i, 0, 180, 0, wave.length - 1))       
        var r = map(wave[index], -1, 1, 150, 350)
        //r /= temp

        var x = r * -sin(i)
        var y = r * cos(i)
        vertex(x, y)
    }
    endShape()
    //#endregion
    if(amp > 0)
    {
        color_mod = (amp - COLOR_FLOOR) / (RAD_MOD - COLOR_FLOOR)
        if(color_mod > 1){
            color_mod = 1
        }else if(color_mod<0){
            color_mod = 0
        }
        console.log(color_mod)

        var p = new Particle()
        particles.push(p)
    }

    for(i = particles.length - 1; i >= 0; i--){
        if(!particles[i].edges())
        {
            particles[i].update(amp > 225)
            particles[i].show()
        }else{
            particles.splice(i, 1)
        }

    }

}


function toggle_song() {
    if (song.isPlaying()) {
        song.pause()
        noLoop()
        button.style.display = "block";
        screen.style.cursor = "default";
    }
    else {
        song.play()
        loop()
        button.style.display = "none";
        screen.style.cursor = "none";
    }
}

class Particle {
    constructor(){
        this.pos = p5.Vector.random2D().mult(250/temp)
        this.vel = createVector(0,0)
        this.acc = this.pos.copy().mult(random(0.0001,0.00001))

        this.w = random(3,5)
        this.color = [((R_MAX - R_MIN) * color_mod) + R_MIN,((G_MAX - G_MIN) * color_mod) + G_MIN,        ((B_MAX - B_MIN) * color_mod) + B_MIN
        ]
    }
    update(cond){
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if(cond)
        {
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)

        }
    }
    edges(){
        if(this.pos.x < -width / 2 ||this.pos.x > width / 2 || this.pos.y < -height / 2 || this.pos.y > height / 2){
            return true
        }else{
            return false
        }
    }
    show(){
        //noStroke()
        stroke(this.color)

        fill(100)
        ellipse(this.pos.x, this.pos.y, this.w)
    }
}