const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
let appleX = Math.round(Math.random()*tileCount);
let appleY = Math.round(Math.random()*tileCount);
let aplleColors = ["red", "gold", "purple"]

// -------------关于方向控制-------------------
let keyPressed = false;

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

  //如果游戏结束，停止循环
  let result = isGameOver();
  if (result) {
    // gameOver.play();
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
  if (score > 5) {
    speed = 10;
  }
  else if (score > 10) {
    speed = 13;
  }


  //用setTimeOut（）不停的循环游戏：每隔（1000/speed）时间就更新一下游戏页面，蛇就动起来了。1000是毫秒=1秒钟
  //setTimeOut（）用法https://www.runoob.com/w3cnote/javascript-settimeout-usage.html
  setTimeout(drawGame, 1000 / speed);
}


//在画板的右上方更新分数。分数可以用变量score。x坐标=canvas.width - 80, y坐标=20
//要求：字体样式选择 白色 20px Verdana
//！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
function drawScore() {
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.font = "20px Verdana"; 
  ctx.fillText("分数"+score,canvas.width - 80,20);  
}

//在画板上画一个黑色背景，大小就是整个画板的大小
//！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
function clearScreen() {
  ctx.fillStyle = "rgb(0,0,0)"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//画一个苹果：x坐标为appleX * tileCount，y坐标为appleY * tileCount，宽和高为tileSize
//appleX和appleY坐标的值在之后的函数中会变的，这里不用担心
//！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
function drawApple() {
  if (((tailLength - 2) + 1) % 4 == 0) {
    ctx.fillStyle = "gold";
  }
  else {
    ctx.fillStyle = "rgb(255,0,0)"
  }
  ctx.fillRect(appleX * tileSize, appleY * tileSize, tileSnakeSize, tileSnakeSize);
}



//把蛇画出来：蛇身体+蛇头
function drawSnake() {

  //1.先画蛇身体：你需要把数组snakeParts里的蛇身画出来，蛇身是绿色的，蛇身坐标怎么画可以参考第3步的画蛇头
  //！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
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
  ctx.fillStyle = "blue";
  ctx.fillRect(headX * tileSize, headY * tileSize, tileSnakeSize, tileSnakeSize);
}

//改变蛇头的位置
function changeSnakePosition() {  
    headX = headX + xVelocity;
    headY = headY + yVelocity;
}




//查看蛇是否吃到了苹果，如果吃到苹果就随机生成新的苹果的appleX，appleY坐标
//如果吃到了苹果，蛇身体长度要加一，分数要加一
//！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
function checkAppleCollision() {
  if(headX === appleX && headY === appleY){
    tailLength++;
    //音乐播放
    gulpSound.play();
    if (((tailLength - 2)) % 4 == 0) {
      score = score + 2;
    }
    else {
      score++;
    }
    //随机产生苹果坐标，及颜色编号
    appleX = Math.round(Math.random()*tileCount);
    appleY = Math.round(Math.random()*tileCount);
    appleColor= Math.round(Math.random()*aplleColors.length);
    console.log(appleX+"ddd"+appleY)
  }
}


//查看游戏是否结束
//！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  //蛇头撞到墙，那就把gameover变量改成true
  //你需要查看蛇头是否撞到上下左右四面墙
  //！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
  if(headX < 0 || headY < 0 || headX > tileCount-1 || headY > tileCount-1){
    gameOver = true;
  }

  //查看蛇头是否撞到自己的身体，如果撞到，就把变量gameover变成true
  //！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
  snakeParts.forEach(function(snakepart){
    if(snakepart.x === headX && snakepart.y === headY)
    {
      console.log("die body")
      gameOver = true;
    }
  })

  //如果游戏结束，显示 “游戏结束” 四个字
  //！！！！！！！！！！！！《请根据上面的描述，在下方完成代码》！！！！！！！！！！！！
  if(gameOver === true){
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "70px Verdana"; 
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
  if (event.keyCode == 38 || event.keyCode == 87) {
    //87 对应w键
    //如果蛇正在向下移动，那就不能向上移动了
    if (inputsYVelocity == 1) return;
    inputsYVelocity = -1;
    inputsXVelocity = 0;
  }

  ///按键盘的下键
  if (event.keyCode == 40 || event.keyCode == 83) {
    // 83 对应s键
    if (inputsYVelocity == -1) return;
    inputsYVelocity = 1;
    inputsXVelocity = 0;
  }

  ///按键盘的左键
  if (event.keyCode == 37 || event.keyCode == 65) {
    // 65 对应a键
    if (inputsXVelocity == 1) return;
    inputsYVelocity = 0;
    inputsXVelocity = -1;
  }

  ///按键盘的右键
  if (event.keyCode == 39 || event.keyCode == 68) {
    //68 对应d键
    if (inputsXVelocity == -1) return;
    inputsYVelocity = 0;
    inputsXVelocity = 1;
  }
}
drawGame();
