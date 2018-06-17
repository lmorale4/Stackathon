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
// var player;
// var spacebar;
// var cursor;
// var destinationX;
// var spacebarDown = false;
var knife;
var knifeRate = 500;
var knifeSpeed = 400;
var nextQ = 0;
// var QButton;
var scaleDown = 0.25;
const PLAYER_SPEED = 160;
const PLAYER_JUMP_SPEED = -330;

// ---------------------------------------- PRELOAD ----------------------------------------

function preload() {
  idle.call(this);
  run.call(this);
  jumpImages.call(this);
  singleKnife.call(this);
}

// ---------------------------------------- CREATE ----------------------------------------

function create() {
  const self = this;
  // ============ Socket ============
  this.socket = io();

  // ============ Player Animation ============
  idleAnimation.call(this);
  runAnimation.call(this);
  jumpAnimation.call(this);

  // ============ Create Player ============
  this.otherPlayers = this.physics.add.group();
  this.otherPlayers.enableBody = true;
  this.otherPlayers.physicsBodyType = Phaser.Physics.Arcade;
  this.otherPlayers.classType = Phaser.Physics.Arcade.Sprite;
  this.otherPlayers.defaults.setCollideWorldBounds = true;
  this.socket.on('currentPlayers', function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  // ============ Disconnect Player Listener ============
  this.socket.on('disconnect', function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  // ============ Other Player movement ============

  this.socket.on('playerMoved', function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        // otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.setVelocity(playerInfo.xVel, playerInfo.yVel);
      }
    });
  });

  // ============ Player Keys ============

  this.cursor = this.input.mousePointer;
  this.cursors = this.input.keyboard.createCursorKeys();
  this.spacebar = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
  this.QButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

  this.spacebarDown = false;
  this.destinationX = null;

  // spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  // QButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

  // ============ Player Knife ============
  knife = this.physics.add.group();
  knife.enableBody = true;
  knife.physicsBodyType = Phaser.Physics.Arcade;
  knife.classType = Phaser.Physics.Arcade.Sprite;
  knife.createMultiple(30, 'singleKnife');

  knife.checkWorldBounds = true;
  knife.outOfBoundsKill = true;
}
// ---------------------------------------- CREATE HELPER FUNCTIONS ----------------------------------------
function addPlayer(self, playerInfo) {
  self.player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idle01')
    .play('idle');

  self.player.scaleX = scaleDown;
  self.player.scaleY = scaleDown;
  self.player.setCollideWorldBounds(true);
  // ============ Player Knife ============
  self.player.knives = self.physics.add.group();
  // self.player.knives.enableBody = true;
  // self.player.knives.physicsBodyType = Phaser.Physics.Arcade;
  // self.player.knives.classType = Phaser.Physics.Arcade.Sprite;
  // self.player.knives.createMultiple(30, 'singleKnife');

  // self.player.knives.checkWorldBounds = true;
  self.player.knives.defaults.setCollideWorldBounds = true;
  // self.player.knives.outOfBoundsKill = true;
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idle01')
    .play('idle');

  otherPlayer.scaleX = scaleDown;
  otherPlayer.scaleY = scaleDown;
  otherPlayer.setCollideWorldBounds(true);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

// ---------------------------------------- UPDATE ----------------------------------------

function update() {
  if (this.player) {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }
    if (this.cursors.up.isDown) this.player.setVelocityY(PLAYER_JUMP_SPEED);
    if (this.QButton.isDown) {
      throwQ.call(this);
    }

    // emit player movement
    const x = this.player.x;
    const y = this.player.y;
    const xVel = this.player.body.velocity.x;
    const yVel = this.player.body.velocity.y;
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x ||
        y !== this.player.oldPosition.y ||
        xVel !== this.player.oldPosition.xVel ||
        yVel !== this.player.oldPosition.yVel)
    ) {
      this.socket.emit('playerMovement', {
        x: x,
        y: y,
        xVel: xVel,
        yVel: yVel,
      });
    }

    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      xVel: this.player.body.velocity.x,
      yVel: this.player.body.velocity.y,
    };
    const kunai = this.player.knives.getChildren();
    if (kunai[0] && kunai[0].body.onWall()) {
      resetQ(kunai[0]);
    }
    setAnimation.call(this);
    setOtherPlayerAnimation.call(this);
  }
}

function setAnimation() {
  if (this.cursors.up.isDown) {
    this.player.anims.play('jump', true);
  } else if (this.cursors.left.isDown) {
    this.player.scaleX = -scaleDown;
    knifeSpeed = knifeSpeed < 0 ? knifeSpeed : -knifeSpeed;
    this.player.anims.play('run', true);
  } else if (this.cursors.right.isDown) {
    this.player.scaleX = scaleDown;
    knifeSpeed = knifeSpeed > 0 ? knifeSpeed : -knifeSpeed;
    this.player.anims.play('run', true);
  } else {
    this.player.anims.play('idle', true);
  }
}

function setOtherPlayerAnimation() {
  const otherPlayer = this.otherPlayers.getChildren()[0];
  if (otherPlayer) {
    if (otherPlayer.body.velocity.y) {
      otherPlayer.anims.play('jump', true);
    } else if (otherPlayer.body.velocity.x) {
      otherPlayer.anims.play('run', true);
      if (otherPlayer.body.velocity.x < 0) otherPlayer.scaleX = -scaleDown;
      else otherPlayer.scaleX = scaleDown;
    } else {
      otherPlayer.anims.play('idle', true);
    }
  }
}

function throwQ() {
  if (this.time.now > nextQ) {
    const playerQ = this.player.knives.getFirstDead(
      true,
      this.player.x + 24,
      this.player.y + 8,
      'singleKnife'
    );
    // console.log('PLAYERQ', playerQ);
    playerQ.scaleX = knifeSpeed > 0 ? scaleDown : -scaleDown;
    playerQ.scaleY = scaleDown;
    playerQ.body.allowGravity = false;
    playerQ.setVelocityX(knifeSpeed);
    // console.log('CHILDRN', this.player.knives.children);
    // console.log('QTHROW', knife);
    // const q = knife.getFirstDead(
    //   true,
    //   this.player.x + 24,
    //   this.player.y + 8,
    //   'singleKnife'
    // );
    // console.log('QTHROW', q);
    // if (q) {
    //   q.body.allowGravity = false;
    //   q.scaleX = knifeSpeed > 0 ? scaleDown : -scaleDown;
    //   q.scaleY = knifeSpeed > 0 ? scaleDown : -scaleDown;
    //   q.setVelocityX(knifeSpeed);
    nextQ = this.time.now + knifeRate;
    // }
  }
}

function resetQ(q) {
  q.destroy();
}
