// const music = play('theme song')
// music.loop()
const moveSpeed = 120
const enemySpeed = 30
let isJumping 
const jumpForce = 200
const bigJumpForce = 360
let currentJumpForce = jumpForce
const fallDeath = 600

layers(['ui', 'obj'], 'obj')

//original map layout
const maps =[ 
  [
  '                                            ',
  '                                            ',  
  '                                            ',
  '                                            ',
  '                                            ',
  '                                            ',
  '=    %   =*=%=                              ',
  '=                                           ',
  '=                              -+           ',
  '=                     ^   ^    ()           ',
  '=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   xxxxxxxx',
  '                                            ',
], [                                        
  '|     77777                                 |',  
  '|                         8                 |',
  '|                                           |',
  '|                                           |',
  '|                                           |',
  '|     ss8ss               s                 |',
  '|                      s  s  s              |',
  '|                   s  s  s  s  s         -+|',
  '|         !     s   s  s  s  s  s   s     ()|',
  '|zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz|',
                                                     
]]
//defining elements on the map
const levelConfig = {
  width: 20,
  height: 20,
  '$':[sprite('coin'), 'coin', scale(0.4), {timer:5}],
  '%':[sprite('question-block'),'coin-surprise', scale(0.14), solid()],
  '*':[sprite('question-block'),'mushroom-surprise', scale(0.14), solid()],
  '^':[sprite('evil-mushroom'),'dangerous', {dir: -1}, scale(0.4), solid()],
  '}':[sprite('unboxed'), scale(0.145), solid()],
  '(':[sprite('pipe-left'), scale(0.5), solid()],
  ')':[sprite('pipe-right'), scale(0.4), solid()],
  '-':[sprite('pipe-top-left'),'pipe' , scale(0.4), solid()],
  '+':[sprite('pipe-top-right'), 'pipe', scale(0.4), solid()],
  '#':[sprite('mushroom'), scale(0.1),'mushroom', body()],
  'x':[sprite('brick'), scale(0.14), solid()],
  '=':[sprite('block'), 'wall', scale(0.14), solid()],

  '|':[sprite('blue-brick'),'wall', scale(0.35), solid()],
  'z':[sprite('blue-block'), scale(0.4), solid()],
  '@':[sprite('blue-brick'), scale(), solid()],
  's':[sprite('blue-steel'), 'wall', scale(0.3), solid()],
  '!':[sprite('evil-blue-mushroom'),'dangerous',{dir: -1}, scale(0.3), solid()],
  '7':[sprite('blue-surprise'),'blue-surprise', scale(0.3), solid()],
  '{':[sprite('unboxed-blue'), scale(0.3), solid()],
  '8':[sprite('blue-surprise'),'blue-mushroom-surprise', scale(0.362), solid()],

}
const levelIndex = args.level ?? 0
const gameLevel = addLevel(maps[levelIndex], levelConfig)
const scoreGlobal = args.score ?? 0

const player = add([
  sprite('mario'), 
  pos(30, 0), 
  scale(0.3),
  body(),
  big(),
  origin('bot')
  ])
  //moving the player
  keyDown('left', ()=>{
    player.changeSprite('mario-left')
    player.move(-moveSpeed, 0)
  })
  keyDown('right', ()=>{
    player.changeSprite('mario-right')
    player.move(moveSpeed, 0)
  })
//what happens when player collides with something dangerous
player.collides('dangerous', (d) =>{
  if(isJumping){
    destroy(d)
    camShake(3)
  }
  else{
  go('lose', {score:scoreLabel.value})
  }
})

player.action(()=>{
  camPos(player.pos)
  if(player.pos.y >= fallDeath){
    go('lose', {score:scoreLabel.value})
  }
})
//keep track of score
let scoreLabel = add([
    text(scoreGlobal),
    pos(30,6),
    layer('ui'),
    {
      value: scoreGlobal,
    }
  ])
//show what level we are on 
const level = add([
  text('level ' + parseInt(levelIndex + 1)), pos(40, 6)])


//what happens when mario is big 
function big(){
  let timer = 0
  let isBig = false

  return {
    update() {
      if(isBig) {
        timer -=dt()
        if (timer <=0) {
          this.smallify()
        }
      }
    },
    isBig(){
      return isBig
    },
    smallify(){
      //makes him small 
      this.scale = vec2(0.4)
      timer = 0
      isBig = false
      currentJumpForce = jumpForce
    },
    biggify(time){
      this.scale = vec2(0.5)
      timer = time 
      isBig = true 
      currentJumpForce = bigJumpForce
    }
  }
}
//if player isn't jumping then jumping is set to false 
player.action( ()=>{
  if(player.grounded()){
    isJumping = false
  }
})
// if player is jumping jumping is set to true 
keyPress('space', ()=>{
  if(player.grounded())
  isJumping = true
  player.jump(currentJumpForce)
})

player.on('headbump', (obj)=>{
  camShake(3)
  if(obj.is('coin-surprise')){
    gameLevel.spawn('$', obj.gridPos.sub(0,1.5))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
  if(obj.is('mushroom-surprise')){
    gameLevel.spawn('#', obj.gridPos.sub(0,1.5))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
})

player.on('headbump', (obj)=>{
  camShake(3)
  if(obj.is('blue-surprise')){
    gameLevel.spawn('$', obj.gridPos.sub(0, 1.5))
    destroy(obj)
    gameLevel.spawn('{', obj.gridPos.sub(0,0))
  }
  if(obj.is('blue-mushroom-surprise')){
    gameLevel.spawn('#',obj.gridPos.sub(0, 1.5))
    destroy(obj)
    gameLevel.spawn('{', obj.gridPos.sub(0,0))
  }
})

action('mushroom', (m)=>{
  m.move(20, 0)
})

player.collides('coin', (c)=>{
  destroy(c)
  scoreLabel.value++
  scoreLabel.text = scoreLabel.value
})

//make coins disappear after 5 seconds
action('coin', (c)=>{
  c.timer -= dt()
  if(c.timer <= 0){
    destroy(c)
    scoreLabel.value++
  }
})

player.collides('mushroom',(m)=>{
  player.biggify(6)
  destroy(m)
})



action('dangerous', (d)=>{
  d.move(d.dir * enemySpeed, 0)
})

collides('dangerous','wall', (d) =>{
  d.dir = -d.dir
})


player.collides('pipe', ()=>{
  keyPress('down', ()=>{
    go('main', {
      level:(levelIndex + 1) % maps.length,
      score: scoreLabel.value,
      //music.stop()
    })
 })
} )

