// const cursor = cursor;
const SPEED = 160;
const JUMP_SPEED = -330;

function move(player, cursor) {
  const destinationX = cursor.position.x;
  const moveToX = destinationX - player.x;
  player.setVelocityX(moveToX > 0 ? SPEED : -SPEED);
  return destinationX;
}

function stop(player) {
  player.setVelocityX(0);
  player.anims.play('idle', true);
}
function jump(player) {
  player.setVelocityY(JUMP_SPEED);
  player.anims.play('jump', true);
}

module.exports = {
  move,
  stop,
  jump,
};
