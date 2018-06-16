import 'phaser';
import { idle, run, jumpImages, singleKnife } from './Preload';
import { idleAnimation, runAnimation, jumpAnimation } from './Animation';
import { move, jump, stop } from './PlayerMovement';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 900,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var player;
var spacebar;
var cursor;
var destinationX;
var spacebarDown = false;
var knife;
var knifeRate = 1000;
var knifeSpeed = 400;
var nextQ = 0;
var QButton;
var scaleDown = 0.25;

// ---------------------------------------- PRELOAD ----------------------------------------

function preload() {
  idle.call(this);
  run.call(this);
  jumpImages.call(this);
  singleKnife.call(this);
}

// ---------------------------------------- CREATE ----------------------------------------

function create() {
  // ============ Player Animation ============
  idleAnimation.call(this);
  runAnimation.call(this);
  jumpAnimation.call(this);

  player = this.physics.add.sprite(200, 200, 'idle01').play('idle');
  player.scaleX = scaleDown;
  player.scaleY = scaleDown;
  player.setCollideWorldBounds(true);

  // ============ Player Keys ============
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  QButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

  // ============ Player Knife ============
  knife = this.physics.add.group();
  knife.enableBody = true;
  knife.physicsBodyType = Phaser.Physics.Arcade;
  knife.classType = Phaser.Physics.Arcade.Sprite;
  knife.createMultiple(30, 'singleKnife');

  knife.checkWorldBounds = true;
  knife.outOfBoundsKill = true;
  console.log('KNIFE', knife);
  console.log('KNIFE STUFF', knife.getFirstDead());
}

// ---------------------------------------- UPDATE ----------------------------------------

function update() {
  cursor = this.input.mousePointer;
  if (cursor.isDown) {
    destinationX = move(player, cursor, destinationX);
  }
  setAnimation();
  if (
    Math.floor(player.x) > destinationX - 2 &&
    Math.floor(player.x) < destinationX + 2
  ) {
    stop(player);
    player.anims.play('idle');
  }
  if (!spacebarDown && spacebar.isDown /*&& player.body.touching.down*/) {
    spacebarDown = true;
    jump(player, spacebar);
  } else if (spacebar.isUp) {
    spacebarDown = false;
  }
  if (QButton.isDown) {
    throwQ.call(this);
  }
}

function setAnimation() {
  if (spacebarDown) {
    player.anims.play('jump');
  } else if (player.x > destinationX) {
    player.scaleX = -scaleDown;
    knifeSpeed = knifeSpeed < 0 ? knifeSpeed : -knifeSpeed;
    player.anims.play('run', true);
  } else if (player.x < destinationX) {
    player.scaleX = scaleDown;
    knifeSpeed = knifeSpeed > 0 ? knifeSpeed : -knifeSpeed;
    player.anims.play('run', true);
  } else {
    player.anims.play('idle', true);
  }
}

function throwQ() {
  if (this.time.now > nextQ) {
    const q = knife.getFirstDead(
      true,
      player.x + 24,
      player.y + 8,
      'singleKnife'
    );
    if (q) {
      console.log('QTHROW', q);
      console.log(
        'x:',
        this.input.activePointer.x,
        '\ny:',
        this.input.activePointer.y
      );
      q.body.allowGravity = false;
      q.scaleX = knifeSpeed > 0 ? scaleDown : -scaleDown;
      q.scaleY = knifeSpeed > 0 ? scaleDown : -scaleDown;
      q.setVelocityX(knifeSpeed);
      nextQ = this.time.now + knifeRate;
    }
  }
}

function resetQ(q) {
  q.kill();
}
