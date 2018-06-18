const idleRightAnimationP2 = function() {
  this.anims.create({
    key: 'idleRightP2',
    frames: [
      { key: 'idleRightP201' },
      { key: 'idleRightP202' },
      { key: 'idleRightP203' },
      { key: 'idleRightP204' },
      { key: 'idleRightP205' },
      { key: 'idleRightP206' },
      { key: 'idleRightP207' },
      { key: 'idleRightP208' },
      { key: 'idleRightP209' },
      { key: 'idleRightP210', duration: 50 },
    ],
    frameRate: 20,
    repeat: -1,
  });
};

const idleLeftAnimationP2 = function() {
  this.anims.create({
    key: 'idleLeftP2',
    frames: [
      { key: 'idleLeftP201' },
      { key: 'idleLeftP202' },
      { key: 'idleLeftP203' },
      { key: 'idleLeftP204' },
      { key: 'idleLeftP205' },
      { key: 'idleLeftP206' },
      { key: 'idleLeftP207' },
      { key: 'idleLeftP208' },
      { key: 'idleLeftP209' },
      { key: 'idleLeftP210', duration: 50 },
    ],
    frameRate: 20,
    repeat: -1,
  });
};

const rightAnimationP2 = function() {
  this.anims.create({
    key: 'rightP2',
    frames: [
      { key: 'rightP201' },
      { key: 'rightP202' },
      { key: 'rightP203' },
      { key: 'rightP204' },
      { key: 'rightP205' },
      { key: 'rightP206' },
      { key: 'rightP207' },
      { key: 'rightP208' },
      { key: 'rightP209' },
      { key: 'rightP210' },
    ],
    frameRate: 25,
    repeat: -1,
  });
};

const leftAnimationP2 = function() {
  this.anims.create({
    key: 'leftP2',
    frames: [
      { key: 'leftP201' },
      { key: 'leftP202' },
      { key: 'leftP203' },
      { key: 'leftP204' },
      { key: 'leftP205' },
      { key: 'leftP206' },
      { key: 'leftP207' },
      { key: 'leftP208' },
      { key: 'leftP209' },
      { key: 'leftP210' },
    ],
    frameRate: 25,
    repeat: -1,
  });
};

const jumpRightAnimationP2 = function() {
  this.anims.create({
    key: 'jumpRightP2',
    frames: [
      { key: 'jumpRightP201' },
      { key: 'jumpRightP202' },
      { key: 'jumpRightP203' },
      { key: 'jumpRightP204' },
      { key: 'jumpRightP205' },
      { key: 'jumpRightP206' },
      { key: 'jumpRightP207' },
      { key: 'jumpRightP208' },
      { key: 'jumpRightP209' },
      { key: 'jumpRightP210' },
    ],
    frameRate: 15,
    repeat: -1,
  });
};

const jumpLeftAnimationP2 = function() {
  this.anims.create({
    key: 'jumpLeftP2',
    frames: [
      { key: 'jumpLeftP201' },
      { key: 'jumpLeftP202' },
      { key: 'jumpLeftP203' },
      { key: 'jumpLeftP204' },
      { key: 'jumpLeftP205' },
      { key: 'jumpLeftP206' },
      { key: 'jumpLeftP207' },
      { key: 'jumpLeftP208' },
      { key: 'jumpLeftP209' },
      { key: 'jumpLeftP210' },
    ],
    frameRate: 15,
    repeat: -1,
  });
};

module.exports = {
  idleRightAnimationP2,
  idleLeftAnimationP2,
  rightAnimationP2,
  leftAnimationP2,
  jumpRightAnimationP2,
  jumpLeftAnimationP2,
};
