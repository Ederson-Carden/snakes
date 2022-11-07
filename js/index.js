const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let scores = document.getElementById("sc");
let stopGameInnertxt = document.getElementById("stopgame");
let modeInnertxt = document.getElementById("mode");
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
let headX = tileCount / 2;
let headY = tileCount / 2;

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
let snakeParts = [];

//改变蛇行动方向
let inputsXVelocity = 0;
let inputsYVelocity = 0;

//蛇的行动方向
let xVelocity = 0;
let yVelocity = 0;


//--------------关于苹果--------------
//苹果的坐标,第几个格子
let appleX = [Math.round(Math.random() * (tileCount - 1))];
let appleY = [Math.round(Math.random() * (tileCount - 1))];
let appleColors = ["red", "yellow", "purple", "blue", "rgb(2,200,255)", "rgb(0,255,127)", "rgb(139,69,19)", "rgb(255,4,138)"];
let appleColorIndex = [0]//苹果颜色下标
let appleNumber = 2;//定义一次产生几个苹果

// -------------关于方向控制-------------------
//用于解决方向键多次快速按下，产生反向行动，导致死亡的bug
let flag = false;//是否已经按下了一次按键
let keyReverse = false;//是否按键反向

//--------------关于胜利--------------
let winElementX = Math.round(Math.random() * (tileCount - 1));
let winElementY = Math.round(Math.random() * (tileCount - 1));
let winElementIndex = 0;//该生成的特殊果实下标
let winElement = ["1", "0", "2", "4"];//元素
let gatherWinElement = [false, false, false, false];//是否已经收集了该元素
let gameOverText = "游戏结束！"
let checkWinGameFlag = false;

//--------------关于暂停--------------
let stopGameFlag = false;//停止游戏
let gameovers = true;
//--------------关于模式选择--------------
//模式切换，闯关与无尽模式,默认闯关模式
let modeFlag = true;
let roundS = 1;

//--------------记录分数和音效--------------
//记录分数
let score = 0;
//记录增加速度的回合数
let speedPermisson = 1;

//音效
const gulpSound = new Audio("../sounds/gulp.mp3");
const gameOver = new Audio("../sounds/game_over.wav")
const eatJewel = new Audio("../sounds/eatJewel.mp3");
const winGame = new Audio("../sounds/winGame.mp3")
const backmusic = new Audio("../sounds/backmusic.mp3")


//-----------------------------------------
//--------------函数：实现功能--------------
//-----------------------------------------


///////------------游戏的核心函数：运行游戏-----------/////
function drawGame() {
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;
  console.log("headX", headX)
  console.log("headY", headY)
  if (stopGameFlag == true) {
    console.log("当前已暂停！！！！" + stopGameFlag)
    return;
  }
  //更新蛇的位子：当你用按下上下左右的按键后，蛇就会动起来，因为每次蛇头的横坐标或者纵坐标都在+1，-1
  changeSnakePosition();

  //更新flag信息，使按键有效
  flag = true;

  //如果游戏结束，停止循环
  let result = isGameOver();
  if (result) {
    if (checkWinGameFlag) {
      if (roundS == 2) {
        backmusic.pause();
        winGame.play();
      }
    }
    else {
      gameOver.play();
    }
    gameovers = true;
    console.log(checkWinGameFlag)
    return;
  }

  //黑色背景
  clearScreen();

  //画一个苹果
  drawApple();

  //画蛇，并且把刚吃到的苹果加到蛇的身体上，并把蛇画出来
  drawSnake();

  //查看是否吃到苹果
  checkAppleCollision();

  //模式切换，闯关与无尽模式
  if (modeFlag) {
    console.log("闯关模式！！！！当前第"+roundS)
    //画特殊果实
    drawWinElements();

    //查看是否吃到特殊果实
    checkWinElementCollision();
  }

  //用setTimeOut（）不停的循环游戏：每隔（1500/speed）时间就更新一下游戏页面，蛇就动起来了。1500是毫秒=1秒钟
  //setTimeOut（）用法https://www.runoob.com/w3cnote/javascript-settimeout-usage.html
  setTimeout(drawGame, 1500 / speed);
}

//在画板上画一个黑色背景，大小就是整个画板的大小
function clearScreen() {
  ctx.fillStyle = "rgb(0,0,0)"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//更新infamation
function drawInformation() {
  console.log(scores.innerHTML)
  if (roundS < 0) {
    scores.innerHTML = "速度:" + speed + " 分数:" + score + " 长度:" + tailLength;
  }
  else if (roundS > 0) {
    scores.innerHTML = "第"+roundS+"关  速度:" + speed + " 分数:" + score + " 长度:" + tailLength;
  }
  
}

//画一个苹果：x坐标为appleX * tileCount，y坐标为appleY * tileCount，宽和高为tileSize
//appleX和appleY坐标的值在之后的函数中会变的，这里不用担心
function drawApple() {
  for (var i = 0; i < appleNumber; i++) {
    console.log(appleX + "apple" + appleY + "aa" + appleColors[appleColorIndex])
    ctx.fillStyle = appleColors[appleColorIndex[i]];
    ctx.fillRect(appleX[i] * tileSize, appleY[i] * tileSize, tileSnakeSize, tileSnakeSize);
  }
}

//不同回合画出特殊果实的不同条件
function drawWinElements() {
  if (roundS == 1) {
    if (score >= 17 && gatherWinElement[0] == false) {
    winElementIndex = 0;
    drawWinElement(winElementIndex);
  }
  else if (speed >= 16 && gatherWinElement[1] == false) {
    winElementIndex = 1;
    drawWinElement(winElementIndex);
  }
  else if (tailLength >= 18 && gatherWinElement[2] == false) {
    winElementIndex = 2;
    drawWinElement(winElementIndex);
  }
  else if (score >= 26 && speed >= 22 && tailLength >= 24 && gatherWinElement[3] == false) {
    winElementIndex = 3;
    drawWinElement(winElementIndex);
    }
  }
  else if (roundS == 2) {
    if (score >= 17 && gatherWinElement[0] == false) {
      winElementIndex = 0;
      drawWinElement(winElementIndex);
    }
    else if (speed >= 16 && gatherWinElement[1] == false) {
      winElementIndex = 1;
      drawWinElement(winElementIndex);
    }
    else if (tailLength >= 18 && gatherWinElement[2] == false) {
      winElementIndex = 2;
      drawWinElement(winElementIndex);
    }
    else if (score >= 28 && speed <= 13 && tailLength <= 10 && gatherWinElement[3] == false) {
      winElementIndex = 3;
      drawWinElement(winElementIndex);
    }
  }

  console.log(gatherWinElement)
}

//画游戏胜利元素(特殊果实)
function drawWinElement(e) {
  ctx.fillStyle = "white";
  ctx.fillRect(winElementX * tileSize, winElementY * tileSize, tileSnakeSize, tileSnakeSize);
  ctx.fillStyle = "black";
  ctx.font = "15px Arial";
  ctx.fillText(winElement[e], winElementX * tileSize + tileSize / 4, winElementY * tileSize + 3 * tileSize / 4);
  console.log(winElementX + "winElementX" + winElementY + "winElementY")
}

//把蛇画出来：蛇身体+蛇头
function drawSnake() {
  //1.先画蛇身体：你需要把数组snakeParts里的蛇身画出来，蛇身是绿色的，蛇身坐标怎么画可以参考第3步的画蛇头
  console.log(snakeParts)
  snakeParts.forEach(function (SnakePart) {
    ctx.fillStyle = "rgb(252,174,108)";
    ctx.fillRect(SnakePart.x * tileSize, SnakePart.y * tileSize, tileSnakeSize, tileSnakeSize);
  })

  //2.把吃到的苹果加到蛇的身体上
  snakeParts.push(new SnakePart(headX, headY)); //把新的蛇方块加到snakeParts数组的最后面
  while (snakeParts.length > tailLength) {
    snakeParts.shift(); // 如果超过了尾巴的长度，那就在snakeParts头去掉一个
  }
  //3.画蛇头
  ctx.fillStyle = "rgb(116,122,179)";
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
      //音乐播放
      gulpSound.play();
      checkAppleColor(appleColorIndex[i]);
      randomApple();
      
      //随着吃到的苹果越多，速度也越快,加速
      if (Math.floor((score) / 10) == speedPermisson && score != 0 ) {
        speed = speed + 3;
        speedPermisson++;
      }
      console.log(speed);
      //画分数
      drawInformation();
    }
  }
}

//查看蛇是否吃到了特殊果实，如果吃到特殊果实就随机生成新的特殊果实的winElementX，winElementY,将该元素已收集
function checkWinElementCollision() {
  if (headX === winElementX && headY === winElementY) {
    gatherWinElement[winElementIndex] = true;
    // //音乐播放
    eatJewel.play();
    //判断游戏是否结束
    checkWinGame();
    // checkAppleColor(appleColorIndex[i]);
    winElementX = Math.round(Math.random() * (tileCount - 1));
    winElementY = Math.round(Math.random() * (tileCount - 1));
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
  else if (appleColor == "yellow") {
    score = score + 1;
  }
  else if (appleColor == "rgb(2,200,255)") {//控制最低分数为0
    if (score >= 1) {
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
      speed = speed - 1;
    }
  }
  else if (appleColor == "rgb(0,255,127)") {
    speed = speed + 1;
  }
  else if (appleColor == "rgb(255,4,138)") {
    tailLength = tailLength + 1;
  }
  else if (appleColor == "rgb(139,69,19)") {
    if (keyReverse) {
      keyReverse = false;
    }
    else {
      keyReverse = true;
    }
  }
  score++;
}

//检查游戏是否胜利
function checkWinGame() {
  let winss = gatherWinElement.includes(false);
  if (winss) {
    gameOverText = "游戏结束！";
    checkWinGameFlag = false;
  }
  else {
    if (roundS == 1) {
      gameOverText = "回车下一关";
    }
    else if (roundS == 2) {
      gameOverText = "获得胜利！";
    }
    checkWinGameFlag = true;
  }
}

//查看游戏是否结束
function isGameOver() {
  let gameOver = false;
  if (yVelocity === 0 && xVelocity === 0) {//未开始
    return false;
  }
  if (checkWinGameFlag) {//胜利了
    gameOver = true;
  } else {
    //蛇头撞到墙，那就把gameover变量改成true
    //你需要查看蛇头是否撞到上下左右四面墙
    if (headX < 0 || headY < 0 || headX > tileCount - 1 || headY > tileCount - 1) {
      gameOver = true;
    }

    //查看蛇头是否撞到自己的身体，如果撞到，就把变量gameover变成true
    snakeParts.forEach(function (snakepart, index) {
      if (snakepart.x === headX && snakepart.y === headY) {
        console.log("die body")
        console.log("当前snake下标" + index)
        gameOver = true;
      }
    })
  }

  //如果游戏结束，显示 “游戏结束” 四个字
  if (gameOver === true) {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "70px 华文琥珀";
    ctx.fillText(gameOverText, tileCount / 4 * tileSize, canvas.height / 2);
  }
  return gameOver;
}


//给键盘控制加一个监听器，当按下键盘上的上下左右的时候，会改变蛇的走位
document.body.addEventListener("keydown", keyDown);
function keyDown(event) {
  event.preventDefault(); //屏蔽默认事件
  //按键盘的上键 
  //event.keycode这些数字都是有固定搭配的，不同数字对应不同的方向
  console.log("onepress")
  if (flag) {
    if (!keyReverse) {
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
      else if (event.keyCode == 13 && checkWinGameFlag) { //闯关模式从第一关切换到第二关
        if (roundS == 1)
        {
          roundS = 2
        }
        else {
          roundS = 1;
        }
        rePlayGame();
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
      else if(event.keyCode == 13 && checkWinGameFlag){ 
        if (roundS == 1)
        {
          roundS = 2
        }
        else {
          roundS = 1;
        }
        rePlayGame();
      }
      //使接下来的按键失去效果
      flag = false;
    }
  }
}

//--------------遮罩层(规则弹窗)--------------
function ShowDiv(show_div, bg_div) {
  document.getElementById(show_div).style.display = 'block';
  document.getElementById(bg_div).style.display = 'block';
  var bgdiv = document.getElementById(bg_div);
  bgdiv.style.width = document.body.scrollWidth;
  bgdiv.style.height = document.body.height;;
};
//关闭弹出层
function CloseDiv(show_div, bg_div) {
  document.getElementById(show_div).style.display = 'none';
  document.getElementById(bg_div).style.display = 'none';
}

function init() {
  //--------------关于蛇--------------
  //蛇头的坐标
  headX = tileCount / 2;
  headY = tileCount / 2;

  //蛇身长度：初始长度为2
  tailLength = 2;

  //蛇的速度，随着吃越多的苹果，速度也会变得越快
  speed = 7;

  //存放蛇身每一块格子的坐标，等下循环一个这个数组，就能把蛇更新起来
  snakeParts = [];

  //改变蛇行动方向
  inputsXVelocity = 0;
  inputsYVelocity = 0;

  //蛇的行动方向
  xVelocity = 0;
  yVelocity = 0;

  //--------------关于苹果--------------
  //苹果的坐标,第几个格子
  appleX = [Math.round(Math.random() * (tileCount - 1))];
  appleY = [Math.round(Math.random() * (tileCount - 1))];
  appleColorIndex = [0]//苹果颜色下标

  // -------------关于方向控制-------------------
  //用于解决方向键多次快速按下，产生反向行动，导致死亡的bug
  flag = false;//是否已经按下了一次按键
  keyReverse = false;//是否按键反向

  //--------------关于胜利--------------
  winElementX = Math.round(Math.random() * (tileCount - 1));
  winElementY = Math.round(Math.random() * (tileCount - 1));
  winElementIndex = 0;//该生成的特殊果实下标
  gatherWinElement = [false, false, false, false];//是否已经收集了该元素
  gameOverText = "游戏结束！"
  checkWinGameFlag = false;//是否胜利了

  //--------------记录分数和音效--------------
  //记录分数
  score = 0;
  //记录增加速度的回合数
  speedPermisson = 1;

  //--------------暂停按钮--------------
  stopGameFlag = false;
  stopGameInnertxt.innerHTML = "暂停";
}

//------------------重玩(初始化)----------------
function rePlayGame() {
if (stopGameFlag || gameovers) {
    console.log("执行中");
    init();
    gameovers = false;
    drawInformation();
    backmusic.play();
    drawGame();
  }
}

//暂停
function stopGame() {
  if (stopGameFlag == false) {
    stopGameFlag = true;
    stopGameInnertxt.innerHTML = "开始";
  }
  else if (stopGameFlag == true) {
    stopGameFlag = false;
    stopGameInnertxt.innerHTML = "暂停";
    drawGame();
  }
}

//模式切换，闯关与无尽模式,默认闯关模式
function changeMode() {
  if (stopGameFlag) {
    if (modeFlag){
      modeFlag = false;
      modeInnertxt.innerHTML = "无尽模式";
      roundS = -1;
    }
    else if (modeFlag == false) {
      modeFlag = true;
      modeInnertxt.innerHTML = "闯关模式";
      roundS = 1;
    }
  }
}
//黑色背景
clearScreen();

//画蛇，并且把刚吃到的苹果加到蛇的身体上，并把蛇画出来
drawSnake();