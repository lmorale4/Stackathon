import 'phaser';
import {
  idleRight,
  idleLeft,
  right,
  left,
  jumpRight,
  jumpLeft,
  singleKnife,
  idleRightP2,
  idleLeftP2,
  rightP2,
  leftP2,
  jumpRightP2,
  jumpLeftP2,
  singleKnifeP2,
} from './Preload';
import {
  idleRightAnimation,
  idleLeftAnimation,
  rightAnimation,
  leftAnimation,
  jumpRightAnimation,
  jumpLeftAnimation,
  idleRightAnimationP2,
  idleLeftAnimationP2,
  rightAnimationP2,
  leftAnimationP2,
  jumpRightAnimationP2,
  jumpLeftAnimationP2,
} from './Animation';
// import { move, jump, stop } from './PlayerMovement';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 900,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 300 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    render: render,
  },
};

var game = new Phaser.Game(config);
var knifeRate = 500;
var knifeSpeed = 400;
var nextQ = 0;
var p1PrevDirection;
var p2PrevDirection;
var p1HealthText;
var p2HealthText;
var winner;
const scaleDown = 0.25;
const PLAYER_SPEED = 160;
const PLAYER_JUMP_SPEED = -330;

// ---------------------------------------- PRELOAD ----------------------------------------

function preload() {
  idleRight.call(this);
  idleLeft.call(this);
  right.call(this);
  left.call(this);
  jumpRight.call(this);
  jumpLeft.call(this);
  singleKnife.call(this);
  idleRightP2.call(this);
  idleLeftP2.call(this);
  rightP2.call(this);
  leftP2.call(this);
  jumpRightP2.call(this);
  jumpLeftP2.call(this);
  singleKnifeP2.call(this);
}

// ---------------------------------------- CREATE ----------------------------------------

function create() {
  const self = this;
  // ============ Socket ============
  this.socket = io();

  winner = this.add.text(100, 200, 'WINNER', {
    fontSize: '72px',
    fill: '#fff',
  });
  winner.visible = false;
  console.log('Winner', winner);

  // ============ Player Animation ============
  idleRightAnimation.call(this);
  idleLeftAnimation.call(this);
  rightAnimation.call(this);
  leftAnimation.call(this);
  jumpRightAnimation.call(this);
  jumpLeftAnimation.call(this);
  idleRightAnimationP2.call(this);
  idleLeftAnimationP2.call(this);
  rightAnimationP2.call(this);
  leftAnimationP2.call(this);
  jumpRightAnimationP2.call(this);
  jumpLeftAnimationP2.call(this);

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
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.setVelocity(playerInfo.xVel, playerInfo.yVel);
        otherPlayer.health = playerInfo.health;
        console.log('OtherPlayer Health', otherPlayer.health);
        if (otherPlayer.mode === 'player1')
          p1HealthText.setText(
            `${otherPlayer.mode.toUpperCase()}: ${otherPlayer.health}%`
          );
        else
          p2HealthText.setText(
            `${otherPlayer.mode.toUpperCase()}: ${otherPlayer.health}%`
          );
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

  this.jumping = false;
  this.socket.on('qThrown', function(playerInfo) {
    const otherPlayer = self.otherPlayers.getChildren()[0];
    const playerQ = otherPlayer.knives.getFirstDead(
      true,
      otherPlayer.x + (playerInfo.knife.knifeSpeed > 0 ? 50 : -50),
      otherPlayer.y + 8,
      `knife${playerInfo.knife.knifeSpeed > 0 ? 'Right' : 'Left'}P2`
    );
    playerQ.scaleX = scaleDown;
    playerQ.scaleY = scaleDown;
    playerQ.body.allowGravity = false;
    playerQ.setVelocityX(playerInfo.knife.knifeSpeed);
  });
}
// ---------------------------------------- CREATE HELPER FUNCTIONS ----------------------------------------
function addPlayer(self, playerInfo) {
  self.player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idleRight01')
    .play('idleRight');

  self.player.scaleX = scaleDown;
  self.player.scaleY = scaleDown;
  self.player.setCollideWorldBounds(true);

  // ============ Player Knife ============

  self.player.knives = self.physics.add.group();
  self.player.knives.defaults.setCollideWorldBounds = true;
  self.player.health = playerInfo.health;
  self.player.mode = playerInfo.mode;

  // ============ SCORE ============
  p1HealthText = self.add.text(16, 16, 'PLAYER 1: 100%', {
    fontSize: '32px',
    fill: playerInfo.x === 600 ? '#38a2f7' : '#ef6463',
  });

  const otherPlayer = self.otherPlayers.getChildren()[0];
  if (otherPlayer) {
    self.physics.add.collider(otherPlayer.knives, self.player, knifeHit);
    self.physics.add.collider(self.player.knives, otherPlayer, knifeHit);
    self.physics.add.collider(otherPlayer, self.player, collidePlayers);
    self.physics.add.collider(self.player, otherPlayer, collidePlayers);
  }
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'idleRightP201')
    .play('idleRightP2');

  otherPlayer.scaleX = scaleDown;
  otherPlayer.scaleY = scaleDown;
  otherPlayer.setCollideWorldBounds(true);
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.knives = self.physics.add.group();
  otherPlayer.knives.defaults.setCollideWorldBounds = true;
  otherPlayer.health = playerInfo.health;
  otherPlayer.mode = playerInfo.mode;

  // ============ SCORE ============
  p2HealthText = self.add.text(616, 16, 'PLAYER 2: 100%', {
    fontSize: '32px',
    fill: playerInfo.x === 600 ? '#38a2f7' : '#ef6463',
  });
  if (self.player) {
    self.physics.add.collider(otherPlayer.knives, self.player, knifeHit);
    self.physics.add.collider(self.player.knives, otherPlayer, knifeHit);
    self.physics.add.collider(otherPlayer, self.player, collidePlayers);
    self.physics.add.collider(self.player, otherPlayer, collidePlayers);
  }
  self.otherPlayers.add(otherPlayer);
}

function collidePlayers(player, otherPlayer) {
  // console.log('collision', player);
  player.body.checkCollision.left = true;
  player.body.checkCollision.right = true;
  player.body.checkCollision.top = true;
  player.body.checkCollision.bottom = true;
  otherPlayer.body.checkCollision.left = true;
  otherPlayer.body.checkCollision.right = true;
  otherPlayer.body.checkCollision.top = true;
  otherPlayer.body.checkCollision.bottom = true;
  // player.body.bounce.x = 0.2;
  // otherPlayer.body.bounce.x = 0.2;
  otherPlayer.setVelocityX(0);
  player.setVelocityX(0);
}

function knifeHit(aPlayer, knife) {
  knife.destroy();
  aPlayer.setVelocityX(0);
  aPlayer.health -= 10;
  if (aPlayer.mode === 'player1') {
    p1HealthText.setText(`${aPlayer.mode.toUpperCase()}: ${aPlayer.health}%`);
  } else {
    p2HealthText.setText(`${aPlayer.mode.toUpperCase()}: ${aPlayer.health}%`);
  }
}

// ---------------------------------------- UPDATE ----------------------------------------

function update() {
  if (this.player) {
    playerMoving.call(this);

    // emit player movement
    const x = this.player.x;
    const y = this.player.y;
    const xVel = this.player.body.velocity.x;
    const yVel = this.player.body.velocity.y;
    const health = this.player.health;
    // console.log('HEALTH UPDATE', health, typeof health);
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x ||
        y !== this.player.oldPosition.y ||
        xVel !== this.player.oldPosition.xVel ||
        yVel !== this.player.oldPosition.yVel ||
        health !== this.player.oldPosition.health)
    ) {
      this.socket.emit('playerMovement', {
        x: x,
        y: y,
        xVel: xVel,
        yVel: yVel,
        health: health,
      });
    }

    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      xVel: this.player.body.velocity.x,
      yVel: this.player.body.velocity.y,
      health: this.player.health,
    };
    resetQ(this.player.knives.getChildren());
    resetQ(
      this.otherPlayers.getChildren()[0] &&
        this.otherPlayers.getChildren()[0].knives.getChildren()
    );
    setAnimation.call(this);
    setOtherPlayerAnimation.call(this);
    if (
      this.player.health <= 0 ||
      (this.otherPlayers.getChildren()[0] &&
        this.otherPlayers.getChildren()[0].health <= 0)
    ) {
      console.log('Players', this.player, this.otherPlayers.getChildren()[0]);
      gameOver.call(this);
    }
  }
}

function playerMoving() {
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-PLAYER_SPEED);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(PLAYER_SPEED);
  } else {
    this.player.setVelocityX(0);
  }
  if (
    /*!this.jumping &&*/
    this.cursors.up.isDown /*&&
    this.player.body.touching.down*/
  ) {
    this.jumping = true;
    this.player.setVelocityY(PLAYER_JUMP_SPEED);
  }
  if (this.player.body.touching.bottom) {
    this.jumping = false;
  }
  if (this.QButton.isDown) {
    throwQ.call(this);
  }
}

function setAnimation() {
  const direction = this.player.body.velocity.x > 0 ? 'Right' : 'Left';
  if (this.cursors.up.isDown && this.jumping) {
    this.player.anims.play(`jump${direction}`, true);
  } else if (this.cursors.left.isDown) {
    p1PrevDirection = direction;
    this.player.anims.play('left', true);
  } else if (this.cursors.right.isDown) {
    p1PrevDirection = direction;
    this.player.anims.play('right', true);
  } else {
    this.player.anims.play(`idle${p1PrevDirection || 'Right'}`, true);
  }
}

function setOtherPlayerAnimation() {
  const otherPlayer = this.otherPlayers.getChildren()[0];
  if (otherPlayer) {
    const direction = otherPlayer.body.velocity.x > 0 ? 'Right' : 'Left';
    if (otherPlayer.body.velocity.y) {
      otherPlayer.anims.play(`jump${direction}P2`, true);
    } else if (otherPlayer.body.velocity.x) {
      p2PrevDirection = direction;
      otherPlayer.anims.play(`${direction.toLowerCase()}P2`, true);
    } else {
      otherPlayer.anims.play(`idle${p2PrevDirection || 'Right'}P2`, true);
    }
  }
}

function throwQ() {
  if (this.time.now > nextQ) {
    const playerQ = this.player.knives.getFirstDead(
      true,
      this.player.x + (p1PrevDirection === 'Right' ? 50 : -50),
      this.player.y + 8,
      `knife${p1PrevDirection || 'Right'}P2`
    );
    playerQ.scaleX = scaleDown;
    playerQ.scaleY = scaleDown;
    playerQ.body.allowGravity = false;
    playerQ.setVelocityX(
      p1PrevDirection === 'Right' ? knifeSpeed : -knifeSpeed
    );
    nextQ = this.time.now + knifeRate;
    this.socket.emit('throwingQ', {
      x: playerQ.x,
      y: playerQ.y,
      knifeSpeed: p1PrevDirection === 'Right' ? knifeSpeed : -knifeSpeed,
    });
  }
}

function resetQ(knives) {
  if (
    knives &&
    knives.length &&
    knives.some(knife => knife.body.velocity.x === 0)
  ) {
    knives.forEach(knife => {
      if (knife.body.velocity.x === 0 || knife.body.onWall) {
        knife.destroy();
      }
    });
  }
}

function gameOver() {
  this.physics.pause();
  winner.visible = true;
  const won =
    this.player.health > 0
      ? this.player.mode.toUpperCase()
      : this.otherPlayers.getChildren()[0].mode.toUpperCase();
  winner.setText('WINNER:' + won);
}

function render() {
  game.debug.spriteInfo(game.scene.scenes[0].player, 100, 100);
}
