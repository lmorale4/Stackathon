const idleRightAnimation = function() {
  this.anims.create({
    key: 'idleRight',
    frames: [
      { key: 'idleRight01' },
      { key: 'idleRight02' },
      { key: 'idleRight03' },
      { key: 'idleRight04' },
      { key: 'idleRight05' },
      { key: 'idleRight06' },
      { key: 'idleRight07' },
      { key: 'idleRight08' },
      { key: 'idleRight09' },
      { key: 'idleRight10', duration: 50 },
    ],
    frameRate: 20,
    repeat: -1,
  });
};

const idleLeftAnimation = function() {
  this.anims.create({
    key: 'idleLeft',
    frames: [
      { key: 'idleLeft01' },
      { key: 'idleLeft02' },
      { key: 'idleLeft03' },
      { key: 'idleLeft04' },
      { key: 'idleLeft05' },
      { key: 'idleLeft06' },
      { key: 'idleLeft07' },
      { key: 'idleLeft08' },
      { key: 'idleLeft09' },
      { key: 'idleLeft10', duration: 50 },
    ],
    frameRate: 20,
    repeat: -1,
  });
};

const rightAnimation = function() {
  this.anims.create({
    key: 'right',
    frames: [
      { key: 'right01' },
      { key: 'right02' },
      { key: 'right03' },
      { key: 'right04' },
      { key: 'right05' },
      { key: 'right06' },
      { key: 'right07' },
      { key: 'right08' },
      { key: 'right09' },
      { key: 'right10' },
    ],
    frameRate: 25,
    repeat: -1,
  });
};

const leftAnimation = function() {
  this.anims.create({
    key: 'left',
    frames: [
      { key: 'left01' },
      { key: 'left02' },
      { key: 'left03' },
      { key: 'left04' },
      { key: 'left05' },
      { key: 'left06' },
      { key: 'left07' },
      { key: 'left08' },
      { key: 'left09' },
      { key: 'left10' },
    ],
    frameRate: 25,
    repeat: -1,
  });
};

const jumpRightAnimation = function() {
  this.anims.create({
    key: 'jumpRight',
    frames: [
      { key: 'jump01' },
      { key: 'jump02' },
      { key: 'jump03' },
      { key: 'jump04' },
      { key: 'jump05' },
      { key: 'jump06' },
      { key: 'jump07' },
      { key: 'jump08' },
      { key: 'jump09' },
      { key: 'jump10' },
    ],
    frameRate: 15,
    repeat: -1,
  });
};

const jumpLeftAnimation = function() {
  this.anims.create({
    key: 'jumpLeft',
    frames: [
      { key: 'jumpLeft01' },
      { key: 'jumpLeft02' },
      { key: 'jumpLeft03' },
      { key: 'jumpLeft04' },
      { key: 'jumpLeft05' },
      { key: 'jumpLeft06' },
      { key: 'jumpLeft07' },
      { key: 'jumpLeft08' },
      { key: 'jumpLeft09' },
      { key: 'jumpLeft10' },
    ],
    frameRate: 15,
    repeat: -1,
  });
};

module.exports = {
  idleRightAnimation,
  idleLeftAnimation,
  rightAnimation,
  leftAnimation,
  jumpRightAnimation,
  jumpLeftAnimation,
};
