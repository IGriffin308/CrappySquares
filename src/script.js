window.addEventListener('load', () => {
  const canvas = canvas1;
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;
  let pipes = [];
  let score = 0;
  let highScore = 0;
  let gameOver = false;

  class InputHandler {
    constructor() {
      this.keys = [];
      this.allowSpace = true;
      // desktop support
      window.addEventListener('keydown', e => {
        if (e.key === ' ' && this.keys.indexOf(e.key) === -1 && this.allowSpace) {
          this.keys.push(e.key);
          this.allowSpace = false;
        } 
        else if (e.key === 'Enter' && gameOver) restartGame();
      });
      window.addEventListener('keyup', e => {
        if (e.key === ' ') {
          this.keys.splice(this.keys.indexOf(e.key), 1);
          this.allowSpace = true;
        }
      });
      // mobile support
      window.addEventListener('touchstart', e => {
        if (this.keys.indexOf(' ') === -1 && this.allowSpace && !gameOver) {
          this.keys.push(' ');
          this.allowSpace = false;
        } else if (gameOver) restartGame();
      });
      window.addEventListener('touchend', e => {
        this.keys.splice(this.keys.indexOf(' '), 1);
        this.allowSpace = true;
      });
    }
    reset() {
      this.keys = [];
      this.allowSpace = true;
    }
  }

  class Player {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.width = 70;
      this.height = 70;
      this.x = 100;
      this.y = 50;
      this.gravity = 0.02 + score/24000;
      this.jump = -0.034 - score/16000;
      this.velocity = 0;
    }
    controlJump(deltaTime) {
      this.velocity = this.jump * deltaTime;
    }
    update(input, deltaTime) {
      this.velocity += this.gravity;
      this.y += this.velocity * deltaTime;
      // controls
      if (input.keys.includes(' ')) {
        this.controlJump(deltaTime)
        input.keys.splice(input.keys.indexOf(' '), 1);
      };
      // handle game over
      if (this.y > canvas.height - this.height) {
        this.y = canvas.height - this.height;
        this.velocity = 0;
        gameOver = true;
      }
      // handle top of canvas
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
      }
      // handle collision with pipes
      pipes.forEach(pipe => {
        if (
          this.x < pipe.x + pipe.width &&
          this.x + this.width > pipe.x &&
          (this.y > pipe.y + pipe.height - this.height + 10||
          this.y + this.height < pipe.y + this.height - 10)
        ) {
          gameOver = true;
        }
      });
    }
    draw(context) {
      context.fillStyle = 'blue';
      context.fillRect(this.x, this.y, this.width, this.height);
    }
    reset() {
      this.velocity = 0;
      this.y = 50;
    }
  }

  class Pipe {
    constructor(canvasWidth, canvasHeight, score) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.difficulty = Math.floor(score / 5);
      this.width = 150;
      if (this.difficulty <= 10) this.height = 500 - this.difficulty * 20;
      else if (this.difficulty <= 20) this.height = 450 - (this.difficulty - 10) * 20;
      else if (this.difficulty <= 30) this.height = 400 - (this.difficulty - 20) * 20;
      else if (this.difficulty <= 40) this.height = 375 - (this.difficulty - 30) * 20;
      else this.height = Math.random() * 200 + 150 + this.difficulty;
      this.x = canvas.width;
      this.y = Math.random() * (canvasHeight - this.height);
      if (this.difficulty <= 60) this.speed = 0.2 + this.difficulty * 0.01;
      else this.speed = 0.8;
      this.angle = Math.random() * this.difficulty * 30;
      this.markedForDeletion = false;
    }
    update(deltaTime) {
      this.x -= this.speed * deltaTime;
      if (this.difficulty >= 5) this.y += Math.sin(this.angle) * this.difficulty/10;
      if (this.y < 0 || this.y + this.height > this.canvasHeight) this.angle *= -1;
      if (this.x + this.width < 0 ) {
        this.markedForDeletion = true
        score++;
      };
    }
    draw(context) {
      context.fillStyle = 'green';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'red';
      context.fillRect(this.x, 0, this.width, this.y);
      context.fillRect(this.x, this.y + this.height, this.width, this.canvasHeight - this.height);
    }
  }

  class Background {}

  const player = new Player();
  const input = new InputHandler();

  function restartGame() {
    player.reset();
    input.reset();
    pipes = [];
    score = 0;
    gameOver = false;
    animate(lastTime);
  }

  function displayText(context) {
    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    if (score > highScore) highScore = score;
    context.fillText(`High Score: ${highScore}`, 10, 60);
    if (gameOver) {
      console.log('Game Over, score:', score); 
      context.fillText('Game Over, press Enter to restart', 150, 200);
    }
  }

  let pipeTimer = 0;
  let pipeInterval = 1000;
  let randomPipeInterval = Math.random() * 1000 + 500;

  function handlePipes(deltaTime) {
    if (pipeTimer > pipeInterval + randomPipeInterval) {
      pipes.push(new Pipe(canvas.width, canvas.height, score));
      pipeTimer = 0;
      if (score < 400) randomPipeInterval = Math.random() * 2000 + 1500 - score * 5;
      else randomPipeInterval = Math.random() * 500 + 500;
    } else {
      pipeTimer += deltaTime;
    }
    pipes.forEach(pipe => {
      pipe.update(deltaTime);
      pipe.draw(ctx);
    });
    pipes = pipes.filter(pipe => !pipe.markedForDeletion);
  }

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handlePipes(deltaTime);
    player.draw(ctx);
    player.update(input, deltaTime);
    displayText(ctx);
    // console.log(deltaTime);
    if (!gameOver) requestAnimationFrame(animate);
  }
  animate(0);
});
