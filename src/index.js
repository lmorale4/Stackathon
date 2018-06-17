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
var knifeRate = 500;
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

  // ============ Disconnect Player ============
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
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  // ============ Player Keys ============

  this.cursor = this.input.mousePointer;
  this.spacebar = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
  this.QButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

  this.spacebarDown = false;
  this.destinationX = null;

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
}
// ---------------------------------------- CREATE HELPER FUNCTIONS ----------------------------------------
function addPlayer(self, playerInfo) {
  self.player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idle01')
    .play('idle');

  self.player.scaleX = scaleDown;
  self.player.scaleY = scaleDown;
  self.player.setCollideWorldBounds(true);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idle01')
    .play('idle');

  otherPlayer.scaleX = scaleDown;
  otherPlayer.scaleY = scaleDown;
  otherPlayer.setCollideWorldBounds(true);
  otherPlayer.playerId = playerInfo.playerId;
  console.log('OTHER PLAYERS', self.otherPlayers);
  self.otherPlayers.add(otherPlayer);
}

// ---------------------------------------- UPDATE ----------------------------------------

function update() {
  if (this.player) {
    if (this.cursor.isDown) {
      this.destinationX = move(this.player, this.cursor);
    }
    setAnimation.call(this);
    if (
      Math.floor(this.player.x) > this.destinationX - 2 &&
      Math.floor(this.player.x) < this.destinationX + 2
    ) {
      stop(this.player);
      this.player.anims.play('idle');
    }
    if (
      !this.spacebarDown &&
      this.spacebar.isDown /*&& player.body.touching.down*/
    ) {
      this.pacebarDown = true;
      jump(this.player, this.spacebar);
    } else if (this.spacebar.isUp) {
      this.spacebarDown = false;
    }
    if (this.QButton.isDown) {
      throwQ.call(this);
    }

    // emit player movement
    const x = this.player.x;
    const y = this.player.y;
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)
    ) {
      this.socket.emit('playerMovement', {
        x: this.player.x,
        y: this.player.y,
      });
    }

    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation,
    };
  }
}

function setAnimation() {
  if (this.spacebarDown) {
    this.player.anims.play('jump');
  } else if (this.player.x > this.destinationX) {
    this.player.scaleX = -scaleDown;
    knifeSpeed = knifeSpeed < 0 ? knifeSpeed : -knifeSpeed;
    this.player.anims.play('run', true);
  } else if (this.player.x < this.destinationX) {
    this.player.scaleX = scaleDown;
    knifeSpeed = knifeSpeed > 0 ? knifeSpeed : -knifeSpeed;
    this.player.anims.play('run', true);
  } else {
    this.player.anims.play('idle', true);
  }
}

function throwQ() {
  if (this.time.now > nextQ) {
    const q = knife.getFirstDead(
      true,
      this.player.x + 24,
      this.player.y + 8,
      'singleKnife'
    );
    if (q) {
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
