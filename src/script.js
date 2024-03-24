window.addEventListener('load', () => {
  const canvas = canvas1;
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;
  let pipes = [];
  let score = 0;
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
  }

  class Player {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.width = 70;
      this.height = 70;
      this.x = 100;
      this.y = 50;
      this.gravity = 0.5;
      this.jump = -10;
      this.velocity = 0;
    }
    controlJump() {
      this.velocity = this.jump;
    }
    update(input, deltaTime) {
      this.velocity += this.gravity;
      this.y += this.velocity;
      // controls
      if (input.keys.includes(' ')) {
        this.controlJump()
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
  }

  class Pipe {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.width = 150;
      this.height = 250;
      this.x = canvas.width;
      this.y = Math.random() * (canvasHeight - this.height);
      this.frameX = 0;
      this.maxFrame = 4;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 5;
      this.markedForDeletion = false;
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX > this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
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
    pipes = [];
    score = 0;
    gameOver = false;
    player.y = 50;
    player.velocity = 0;
    animate(0);
  }
  function displayText(context) {
    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    if (gameOver) {
      console.log('Game Over, score:', score); 
      context.fillText('Game Over, press Enter to restart', 150, 200);
    }
  }
  function handlePipes(deltaTime) {
    if (pipeTimer > pipeInterval + randomPipeInterval) {
      pipes.push(new Pipe(canvas.width, canvas.height));
      pipeTimer = 0;
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
  let pipeTimer = 0;
  let pipeInterval = 1000;
  let randomPipeInterval = Math.random() * 1000 + 500;

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