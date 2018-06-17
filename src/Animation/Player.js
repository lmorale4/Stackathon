const idleAnimation = function() {
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle01' },
      { key: 'idle02' },
      { key: 'idle03' },
      { key: 'idle04' },
      { key: 'idle05' },
      { key: 'idle06' },
      { key: 'idle07' },
      { key: 'idle08' },
      { key: 'idle09' },
      { key: 'idle10', duration: 50 },
    ],
    frameRate: 20,
    repeat: -1,
  });
};

const runAnimation = function() {
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run01' },
      { key: 'run02' },
      { key: 'run03' },
      { key: 'run04' },
      { key: 'run05' },
      { key: 'run06' },
      { key: 'run07' },
      { key: 'run08' },
      { key: 'run09' },
      { key: 'run10' },
    ],
    frameRate: 25,
    repeat: -1,
  });
};

const jumpAnimation = function() {
  this.anims.create({
    key: 'jump',
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

module.exports = { idleAnimation, runAnimation, jumpAnimation };
