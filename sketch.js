var pi = 3.1415;

var DIMX = 1000;
var DIMY = 1000;
var DIMZ = 1000;

var RUNNING = true;
var AMOUNT = 100;

var control;

function PhysicsObject(x, y, z, r, c) {
  this.mass = 0.0009 * (4 / 3) * pi * r * r * r;
  this.radius = r;
  this.colorBase = c;
  this.color = color(0, 0, 0);

  this.apparantR = r;

  this.position = createVector(x, y, z);
  this.velocity = createVector(0, 0, 0);
  this.acceleration = createVector(0, 0, 0);

  this.edgeDetect = function() {
    if (this.position.x < this.radius || this.position.x > DIMX - this.radius) {
      this.velocity.x *= -1;
    }
    if (this.position.y < this.radius || this.position.y > DIMY - this.radius) {
      this.velocity.y *= -1;
    }
    if (this.position.z < this.radius || this.position.z > DIMZ - this.radius) {
      this.velocity.z *= -1;
    }
  };

  this.show = function() {
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);

    // fill(this.colorBase);
    // ellipse(this.position.x, this.position.y, this.apparantR * 2, this.apparantR * 2);
  };

  this.applyForce = function(x, y, z) {
    this.acceleration.add(createVector(x, y, z).div(this.mass));
  };

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    // this.edgeDetect();
    // print();
    this.setBrightness(map(this.position.z, 0, DIMZ, 0, 255));
    this.acceleration.mult(0);
    this.velocity.limit(10);
  };

  this.setBrightness = function(amount) {
    amount = Math.round(amount);

    // this.apparantR = map(amount, 0, 255, 0.5, 2) * this.radius;

    this.color.levels[0] = map(amount, 0, 255, 0, this.colorBase.levels[0]);
    this.color.levels[1] = map(amount, 0, 255, 0, this.colorBase.levels[1]);
    this.color.levels[2] = map(amount, 0, 255, 0, this.colorBase.levels[2]);
  };
}

var objects = [];
var planets = [];
var seed = 0;
var orderedObjects;

function gravity(object1, object2) {
  force = p5.Vector.sub(object1.position, object2.position);
  force.mult((0.1 * object1.mass * object2.mass) / (force.mag() * force.mag()));
  force.normalize();
  return force;
}

function setup() {
  control = createSelect();
  control.option('add');
  control.option('remove');
  control.option('pause');

  newSize = createInput();

  createDiv("<br>");


  createCanvas(DIMX, DIMY);
  planets.push(new PhysicsObject(DIMX / 2, DIMY / 2, DIMZ / 2, 100, color(0, 255, 0)));
  // planets[0].mass = 100000;

  // objects.push(new PhysicsObject(100,100,10,20,10,color(255,0,0)));

  for (i = 0; i < AMOUNT; i++) {
    objects.push(new PhysicsObject(random(DIMX), random(DIMY), random(DIMZ), random(30), color(255, 0, 0)));
    objects[objects.length - 1].applyForce(random(40), random(40), random(40));
  }

  // objects[1].applyForce(0,40,10);
  objects[0].update();
}

function draw() {
  if (RUNNING) {
    background(240, 240, 240, 100);
    for (i = 0; i < planets.length; i++) {
      planets[i].show();
    }

    for (i = 0; i < objects.length; i++) {
      for (planet = 0; planet < planets.length; planet++) {
        force = gravity(planets[planet], objects[i]);

        objects[i].applyForce(force.x, force.y, force.z);
        // objects[1].applyForce(map(noise(seed),0,1,-1,1),map(noise(seed+10000),0,1,-1,1),map(noise(seed+1000),0,1,-1,1));

        objects[i].update();
        seed += 0.01;

        if (p5.Vector.sub(objects[i].position, planets[planet].position).mag() < planets[planet].radius) {
          // plantets[planet].radius = Math.cbrt(4/3*pi*objects[i].radius*objects[i].radius*objects[i].radius )

          objects.splice(i, 1);
          break;
        }
      }
    }

    for (i = 0; i < objects.length; i++) {
      objects[i].show();
    }

    orderedObjects = Object.create(objects);
    Array.prototype.push.apply(orderedObjects, planets);
    orderedObjects.sort(function(a, b) {
      return parseFloat(a.position.z) - parseFloat(b.position.z);
    });
    for (i = 0; i < objects.length; i++) {
      orderedObjects[i].update();
      orderedObjects[i].show();
    }
  }
}

function mouseClicked() {
  // RUNNING = !RUNNING;

  if(mouseX < DIMX && mouseX > 0 && mouseY < DIMY && mouseY > 0){
    switch(control.value()){
      case "add":
        planets.push(new PhysicsObject(mouseX, mouseY, Math.floor(newSize.value()), 100, color(0, 255, 0)));
        break;

      case "remove":
        for(i = 0; i < planets.length; i++){
          if(dist(mouseX, mouseY, planets[i].position.x, planets[i].position.y) < planets[i].radius){
            planets.splice(i, 1);
            break;
          }
        }
        break;

      case "pause":
        RUNNING = !RUNNING;
    }
  }

  // planets.push(new PhysicsObject(mouseX, mouseY, 0, 100, color(0, 255, 0)));
  // if(mouseX < DIMX && mouseX > 0 && mouseY < DIMY && mouseY > 0){
  //   planets[0].position.x = mouseX;
  //   planets[0].position.y = mouseY;
  // }
}
