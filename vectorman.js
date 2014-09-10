
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles-1', 'assets/tiles-1.png');
  game.load.spritesheet('vectorman', 'assets/vectorman.png', 100, 100);
  game.load.spritesheet('droid', 'assets/droid.png', 32, 32);
  game.load.image('starSmall', 'assets/star.png');
  game.load.image('starBig', 'assets/star2.png');
  game.load.image('background', 'assets/background2.png');

}

var map;
var tileset;
var layer;
var player;
var mode = 'right';
var facing = 'right';
var runTimer = 0;
var cursors;
var jumpButton;
var bg;

// 60 FPS
var spriteSpeed = 60;

// 1 based frame numbers of animations
var animations = {
  'idle': [1, 31, false],
  'run-start': [32, 57, false],
  'run': [58, 91, true],
  'jump': [92, 120, false],
  'boost': [121, 156, false],
  'fall': [120, 120, false],
  'land': [157, 173, false]
};

function spriteMap(start, end) {
  var map = [];
  for (var i = start; i <= end; i++) {
  map.push(i);
  }
  return map;
}

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.stage.backgroundColor = '#000000';

  bg = game.add.tileSprite(0, 0, 800, 600, 'background');
  bg.fixedToCamera = true;

  map = game.add.tilemap('level1');

  map.addTilesetImage('tiles-1');

  map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

  layer = map.createLayer('Tile Layer 1');

  //  Un-comment this on to see the collision tiles
  layer.debug = true;

  layer.resizeWorld();

  game.physics.arcade.gravity.y = 500;

  player = game.add.sprite(100, 100, 'vectorman');
  player.anchor.setTo(0.5, 0); //so it flips around its middle

  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.bounce.y = 0.1;
  player.body.collideWorldBounds = true;
  player.body.setSize(50, 50, 0, 40);

  for (var animationName in animations) {
    var animationFrames = animations[animationName];
    console.log('Animation %s runs from %d to %d', animationName, animationFrames[0]-1, animationFrames[1]-1);
    player.animations.add(animationName, spriteMap(animationFrames[0]-1, animationFrames[1]-1), spriteSpeed, animationFrames[2]);
  }

  game.camera.follow(player);

  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

// The time it takes to start running full speed
var timeToRun = 26/60 * 1000; // The number of frames in the start running animation

var landStart = 0;
var timeToLand = 16/60 * 1000;

// The time between jumps
var jumpTime = 250;
var jumpVelocity = 275;
var boostVelocity = 250;
var maxBoosts = 2;

// The number of boosts the player has used in flight
var boostCount = 0;

// The speed of running
var runStartSpeed = 180;
var runFullSpeed = 300;

var fullSpeed = false;

// The time when we can next boost
var jumpStart = 0;
var lastBoostTime = 0;
var jumpReleased = true;

function run(direction) {
  var additionalRunVelocity = 0;

  if (direction === 'right') {
    player.scale.x = -1;
  }
  else {
    player.scale.x = 1;
  }

  // If they switch direction or just start running
  if (mode !== 'running') {
    // Start a timer where we'll run at full speed
    runTimer = game.time.now + timeToRun;

    fullSpeed = false;
    mode = 'running';
    facing = direction;
  }
  else {
    if (!fullSpeed && game.time.now > runTimer) {
      // We're now running at full speed
      fullSpeed = true;
    }
  }

  if (!fullSpeed) {
    // Accerate to full speed
    additionalRunVelocity = (1 - (runTimer - game.time.now) / timeToRun) * (runFullSpeed - runStartSpeed);
  }

  if (player.body.onFloor()) {
    // Switch the animation
    var animation = 'run' + (fullSpeed ? '' : '-start');

    player.animations.play(animation);
  }

  // Set speed
  player.body.velocity.x = (direction === 'left' ? -1 : 1) * ((fullSpeed ? runFullSpeed : runStartSpeed) + additionalRunVelocity);
}

function update() {

  game.physics.arcade.collide(player, layer);

  player.body.velocity.x = 0;

  var onFloor = player.body.onFloor();
  
  // When we touch the ground, reset boost count
  if (onFloor) {
    boostCount = 0;
    if (mode === 'jump') {
      mode = 'land';
      player.animations.play('land');
      landStart = game.time.now;
    }
  }

  if (cursors.left.isDown) {
    run('left');
  }
  else if (cursors.right.isDown) {
    run('right');
  }
  else if (mode != 'land' || game.time.now > landStart + timeToLand) {
    if (onFloor) {
      player.animations.play('idle');
      mode = 'idle';
    }
    else if (mode !== 'jump') {
      mode = 'jump';
      player.animations.play('fall');
    }
  }

  // If we're:
    // not on the floor
    // not pressing jump
    // not over boost count
  var canBoost = false;
  if (jumpReleased && !onFloor && boostCount < maxBoosts) {
    canBoost = true;
  }

  if (jumpButton.isDown) {
    if (onFloor && jumpReleased) {
      player.body.velocity.y = -1 * jumpVelocity;
      jumpStart = game.time.now;
      mode = 'jump';
      player.animations.play('jump');
    }
    else if (jumpButton.isDown && canBoost) {
      player.body.velocity.y = -1 * boostVelocity;
      boostCount++;
      player.animations.stop();
      player.animations.play('boost');
    }

    jumpReleased = false;
  }
  else {
    jumpReleased = true;
  }

}

function render () {
  // game.debug.text(game.time.physicsElapsed, 32, 32);
  // game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);
}