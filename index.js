const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let scores = document.getElementById("sc");
//-----------------------------------------
//--------------一些变量--------------------
//-----------------------------------------


//--------------关于棋盘--------------
//每个格子的大小
let tileSize = 20;
//一行分为几个格子 
let tileCount = canvas.width / tileSize;
//蛇部位及苹果的每个格子大小，-1来美观是为了美观
let tileSnakeSize = tileSize - 2;

//--------------关于蛇--------------
//蛇头的坐标
let headX = tileCount/2;
let headY = tileCount/2;

//构建一个蛇身
class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

//蛇身长度：初始长度为2
let tailLength = 2;

//蛇的速度，随着吃越多的苹果，速度也会变得越快
let speed = 7;
let speedPermisson = true;

//存放蛇身每一块格子的坐标，等下循环一个这个数组，就能把蛇更新起来
const snakeParts = [];

//改变蛇行动方向
let inputsXVelocity = 0;
let inputsYVelocity = 0;

//蛇的行动方向
let xVelocity = 0;
let yVelocity = 0;


//--------------关于苹果--------------
//苹果的坐标,第几个格子
let appleX = [Math.round(Math.random()*(tileCount-1))];
let appleY = [Math.round(Math.random()*(tileCount-1))];
let appleColors = ["red", "gold", "purple","blue","orange","rgb(0,255,127)","rgb(139,69,19)","rgb(255, 4, 138)"];
let appleColorIndex =[0]//苹果颜色下标
let appleNumber = 2;//定义一次产生几个苹果

// -------------关于方向控制-------------------
//用于解决方向键多次快速按下，产生反向行动，导致死亡的bug
let flag = false;//是否已经按下了一次按键
let keyReverse = false;//是否按键反向

//--------------记录分数和音效--------------
//记录分数
let score = 0;

//音效
const gulpSound = new Audio("/sounds/gulp.mp3");
const gameOver = new Audio("/sounds/game_over.wav")


//-----------------------------------------
//--------------函数：实现功能--------------
//-----------------------------------------


///////------------游戏的核心函数：运行游戏-----------/////
function drawGame() {
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;
  console.log("headX", headX)
  console.log("headY", headY)

  //更新蛇的位子：当你用按下上下左右的按键后，蛇就会动起来，因为每次蛇头的横坐标或者纵坐标都在+1，-1
  changeSnakePosition();

  //更新flag信息，使按键有效
  flag = true;

  //如果游戏结束，停止循环
  let result = isGameOver();
  if (result) {
    gameOver.play();
    return;
  }
 
  //黑色背景
  clearScreen();

  //查看是否吃到苹果
  checkAppleCollision();

  //画一个苹果
  drawApple();

  //画蛇，并且把刚吃到的苹果加到蛇的身体上，并把蛇画出来
  drawSnake();

  //画分数
  drawScore();

  //随着吃到的苹果越多，速度也越快
  if (score%10 == 0 && score != 0 && speedPermisson) {
    speed = speed + 1;
    speedPermisson = false;
  }
  console.log(speed)
  //用setTimeOut（）不停的循环游戏：每隔（1000/speed）时间就更新一下游戏页面，蛇就动起来了。1000是毫秒=1秒钟
  //setTimeOut（）用法https://www.runoob.com/w3cnote/javascript-settimeout-usage.html
  setTimeout(drawGame, 1500 / speed);
}


//在画板的右上方更新分数。分数可以用变量score。x坐标=canvas.width - 80, y坐标=20
//要求：字体样式选择 白色 20px Verdana
function drawScore() {
  console.log(scores.innerHTML)
  scores.innerHTML = "速度:"+speed+" 分数:" + score+" 长度:"+tailLength;
}
//在画板上画一个黑色背景，大小就是整个画板的大小

function clearScreen() {
  ctx.fillStyle = "rgb(0,0,0)"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//画一个苹果：x坐标为appleX * tileCount，y坐标为appleY * tileCount，宽和高为tileSize
//appleX和appleY坐标的值在之后的函数中会变的，这里不用担心
function drawApple() {
  for (var i = 0; i < appleNumber; i++){
    console.log(appleX+"apple"+appleY+"aa",appleColors[appleColorIndex])
    ctx.fillStyle = appleColors[appleColorIndex[i]];
    ctx.fillRect(appleX[i] * tileSize, appleY[i] * tileSize, tileSnakeSize, tileSnakeSize);
  }
}



//把蛇画出来：蛇身体+蛇头
function drawSnake() {

  //1.先画蛇身体：你需要把数组snakeParts里的蛇身画出来，蛇身是绿色的，蛇身坐标怎么画可以参考第3步的画蛇头
  console.log(snakeParts)
  snakeParts.forEach(function(SnakePart){
    ctx.fillStyle = "green";
    ctx.fillRect(SnakePart.x * tileSize, SnakePart.y * tileSize, tileSnakeSize, tileSnakeSize);
  })
  //2.把吃到的苹果加到蛇的身体上（以下代码不用改动和添加）
    snakeParts.push(new SnakePart(headX, headY)); //把新的蛇方块加到snakeParts数组的最后面
    while (snakeParts.length > tailLength) {
      snakeParts.shift(); // 如果超过了尾巴的长度，那就在snakeParts头去掉一个
    }
  //3.画蛇头（以下代码不用改动和添加）
  ctx.fillStyle = "rgb(178,34,34)";
  ctx.fillRect(headX * tileSize, headY * tileSize, tileSnakeSize, tileSnakeSize);
}

//改变蛇头的位置
function changeSnakePosition() {  
  headX = headX + xVelocity;
  headY = headY + yVelocity;
 
}


//查看蛇是否吃到了苹果，如果吃到苹果就随机生成新的苹果的appleX，appleY，appleColorIndex坐标
//如果吃到了苹果，长度加一，允许增加速度，调用苹果检测函数
function checkAppleCollision() {
  for (var i = 0; i < appleNumber; i++) {
    if (headX === appleX[i] && headY === appleY[i]) {
      tailLength++;
      if (appleColors[appleColorIndex[i]] != "orange") {
        speedPermisson = true;
      }
      //音乐播放
      gulpSound.play();
      checkAppleColor(appleColorIndex[i]);
      randomApple();
    }
  }
}
//随机产生苹果appleX appleY appleColorIndex
function randomApple() {
    //随机产生苹果坐标，及颜色编号
  for (var i = 0; i < appleNumber; i++) {
    appleX[i] = Math.round(Math.random() * (tileCount - 1));
    appleY[i] = Math.round(Math.random() * (tileCount - 1));
    appleColorIndex[i] = Math.round(Math.random() * (appleColors.length - 1));
    console.log(appleX[i] + "ddd" + appleY[i] + "sss" + appleColors.length)
  }
}
//检查吃了什么苹果以及对应效果"blue","yellow","white"
function checkAppleColor(index) {
  const appleColor = appleColors[index];
  if (appleColor == "red") {   
  }
  else if (appleColor == "gold") {
    score = score + 1;
  }
  else if (appleColor == "orange") {//控制最低分数为0
    if (score >=1) { 
      score = score - 2;
    } else {
      score--;
    }  
  }
  else if (appleColor == "purple") {//控制最短长度为0
    if (tailLength >= 1) {
      tailLength = tailLength - 2;
    }    
  }
  else if (appleColor == "blue") {//控制最低速度为7
    if (speed >= 8) { 
      speed=speed-1;
    }     
  }
  else if (appleColor == "rgb(0,255,127)") {
    speed=speed+2;
  }
  else if (appleColor == "rgb(255,4,138)") {
    tailLength = tailLength + 1;
  }
  else if (appleColor == "rgb(139,69,19)"){
    if (keyReverse) {
      keyReverse = false;
    }
    else {
      keyReverse = true;
    }
  }
  score++;
}

//查看游戏是否结束
function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  //蛇头撞到墙，那就把gameover变量改成true
  //你需要查看蛇头是否撞到上下左右四面墙
  if(headX < 0 || headY < 0 || headX > tileCount-1 || headY > tileCount-1){
    gameOver = true;
  }

  //查看蛇头是否撞到自己的身体，如果撞到，就把变量gameover变成true
  snakeParts.forEach(function (snakepart, index) {
    if(snakepart.x === headX && snakepart.y === headY)
    {
        console.log("die body")
        console.log("当前snake下标"+index)
        gameOver = true;
    }
  })

  //如果游戏结束，显示 “游戏结束” 四个字
  if(gameOver === true){
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "70px 华文琥珀"; 
    ctx.fillText("游戏结束!",tileCount/4*tileSize,canvas.height/2);  
  }

  return gameOver;
}


//给键盘控制加一个监听器，当按下键盘上的上下左右的时候，会改变蛇的走位
document.body.addEventListener("keydown", keyDown);
function keyDown(event) {
  //按键盘的上键 
  //event.keycode这些数字都是有固定搭配的，不同数字对应不同的方向
  console.log("onepress")
  if (flag) {
    if(!keyReverse){
      if (event.keyCode == 38 || event.keyCode == 87) {
        //87 对应w键
        //如果蛇正在向下移动，那就不能向上移动了
        if (inputsYVelocity == 1) return;
        inputsYVelocity = -1;
        inputsXVelocity = 0;
      }
    
      ///按键盘的下键
      else if (event.keyCode == 40 || event.keyCode == 83) {
        // 83 对应s键
        if (inputsYVelocity == -1) return;
        inputsYVelocity = 1;
        inputsXVelocity = 0;
      }
    
      ///按键盘的左键
      else if (event.keyCode == 37 || event.keyCode == 65) {
        // 65 对应a键
        if (inputsXVelocity == 1) return;
        inputsYVelocity = 0;
        inputsXVelocity = -1;
      }
    
      ///按键盘的右键
      else if (event.keyCode == 39 || event.keyCode == 68) {
        //68 对应d键
        if (inputsXVelocity == -1) return;
        inputsYVelocity = 0;
        inputsXVelocity = 1;
      }
      //使接下来的按键失去效果
      flag = false;
    }
    else {//按键全部反向，左-》右，右-》左 等
      if (event.keyCode == 38 || event.keyCode == 87) {
        //87 对应w键
        //如果蛇正在向下移动，那就不能向上移动了
        if (inputsYVelocity == -1) return;
        inputsYVelocity = 1;
        inputsXVelocity = 0;
      }
    
      ///按键盘的下键
      else if (event.keyCode == 40 || event.keyCode == 83) {
        // 83 对应s键
        if (inputsYVelocity == 1) return;
        inputsYVelocity = -1;
        inputsXVelocity = 0;
      }
    
      ///按键盘的左键
      else if (event.keyCode == 37 || event.keyCode == 65) {
        // 65 对应a键
        if (inputsXVelocity == -1) return;
        inputsYVelocity = 0;
        inputsXVelocity = 1;

      }
      ///按键盘的右键
      else if (event.keyCode == 39 || event.keyCode == 68) {
        //68 对应d键
        if (inputsXVelocity == 1) return;
        inputsYVelocity = 0;
        inputsXVelocity = -1;
      }
      //使接下来的按键失去效果
      flag = false;
    }
  }
}
drawGame();
