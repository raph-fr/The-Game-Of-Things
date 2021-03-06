var socket; //socket.io (live engine)

//Variable is set by server later on
var position = {
    x: 1,
    y: 1
};

var heading; // direction of player

var nameSize = 18; // size of the name label

var playerImages = []; // will contain all the player skins

//Variable is set by server later on
var worldDimensions = {
    x: 1,
    y: 1
};

var inPlay = false; //whether you have started playing

function setup() {
    createCanvas(windowWidth, windowHeight);

    //Names of the skins
    var playerImageOptions = ['Blue.png', 'Green.png', 'Orange.png', 'Purple.png', 'Red.png', 'Turq.png'];

    //Load the skins into the array
    for (path in playerImageOptions) {
        playerImages.push(loadImage("sprites/players/" + playerImageOptions[path]))
    }

    imageMode(CENTER)
}

//receive world dimensions from the server
function setWorldDimensions(wd) {
    worldDimensions = wd;
}

//reload the page when you die
function iDied() {
    location.reload();
}

//draw the grid background
function drawGrid(sqrWidth, border) {
    noStroke();
    fill(30);
    for (x = 0; x < worldDimensions.x - 1; x += (sqrWidth + border)) {
        for (y = 0; y < worldDimensions.y - 1; y += (sqrWidth + border)) {
            rect(x, y, sqrWidth, sqrWidth)
        }
    }
}

//Display the world
function worldUpdate(bodies) {
    background(25);

    //translate to the players location
    translate(-position.x + width / 2, -position.y + height / 2);

    drawGrid(60, 20);

    displayBodies(bodies);
}

function displayBodies(bodies) {
    //Loop through all the bodies in the world
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        //Check if the body is a player
        if (body.label === 'player') {
            //Draw the player image
            push();
            translate(body.position.x, body.position.y);
            rotate(body.angle);
            image(playerImages[body.skinID], 0, 0);
            pop();

            //Write number of bullets if it is the current player
            var bodyColor = color(body.render.fillStyle);
            fill(color(255 - red(bodyColor), 255 - green(bodyColor), 255 - blue(bodyColor)));
            textSize(nameSize);
            if (body.socketID === socket.id) {
                position = body.position;
                text(body.numOfBullets, body.position.x - textWidth(body.numOfBullets) / 2, body.position.y - 60)
            } else {
                text(body.name, body.position.x - textWidth(body.name) / 2, body.position.y)
            }

            //Draw the health bar
            var barSize = body.maxHealth / 2;
            fill(255, 0, 0);
            rect(body.position.x - barSize / 2, body.position.y - 45, barSize, 10);
            fill(0, 255, 0);
            rect(body.position.x - barSize / 2, body.position.y - 45, barSize * body.health / body.maxHealth, 10)
        } else {
            //Draw shape from its vertices
            strokeWeight(body.render.lineWidth);
            fill(body.render.fillStyle);
            stroke(body.render.strokeStyle);
            beginShape();
            for (var j = 0; j < body.vertices.length; j++) {
                var v = body.vertices[j];
                vertex(v.x, v.y)
            }
            endShape(CLOSE);
        }
    }
}

function draw() {
    if (inPlay) {
        heading = {
            x: (mouseX - width / 2),
            y: (mouseY - height / 2)
        };
        heading = getUnitVector(heading);
        socket.emit('heading', heading)
    }
}

function getUnitVector(v) {
    var scale = Math.sqrt(v.x * v.x + v.y * v.y);
    if (scale !== 0) {
        v.x = v.x / scale;
        v.y = v.y / scale
    }
    return v;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function keyReleased() {
    if (key === ' ') {
        socket.emit('newBullet')
    }
    if (key === 'B') {
        var bombParams = getBombParams();
        try {
            if ((bombParams.bullets > 0)) {
                socket.emit('newBomb', bombParams.bullets, bombParams.trigger, bombParams.visible)
            }
        } catch (e) {
        }
    }
    if (key === 'S') {
        toggleBombSelector();
    }
}