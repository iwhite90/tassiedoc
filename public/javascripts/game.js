var game = new Phaser.Game(640, 600, Phaser.AUTO, 'gameDiv');
var player;
var platforms;
var ledge1;
var ledge2;
var cursors;
var playing = true;

var stars;
var score = 0;
var counter = 100;
var scoreText;
var msgText;
var text;
var numStars = 0;
var basicGame = {};

basicGame.main = function(){};

basicGame.main.prototype = {
  preload: function() {
    this.load.image('sky', sky);
    this.load.image('ground', platform);
    this.load.image('star', star);
    this.load.spritesheet('dude', dude, 32, 48);
  },

  create: function() {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.add.sprite(0, 0, 'sky');

    platforms = this.add.group();

    platforms.enableBody = true;

    var ground = platforms.create(0, this.world.height - 64, 'ground');

    ground.scale.setTo(2, 2);

    ground.body.immovable = true;

    ledge1 = platforms.create(400, 400, 'ground');
    ledge1.body.immovable = true;
    ledge1.body.velocity.y = -40;

    ledge2 = platforms.create(-150, 250, 'ground');
    ledge2.body.immovable = true;
    ledge2.body.velocity.y = 60;

    player = this.add.sprite(32, this.world.height - 150, 'dude');

    this.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    stars = this.add.group();
    stars.enableBody = true;

    createStars(Math.random() * 13);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    msgText = this.add.text(16, 64, "Let's go! 100", { fontSize: '32px', fill: '#000' });

    cursors = this.input.keyboard.createCursorKeys();
  },

  update: function() {
  if (playing) {
          //  Collide the player and the stars with the platforms
          game.physics.arcade.collide(player, platforms);
          game.physics.arcade.collide(stars, platforms);

          //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
          game.physics.arcade.overlap(player, stars, collectStar, null, this);

          //  Reset the players velocity (movement)
          player.body.velocity.x = 0;

          if (cursors.left.isDown) {
              player.body.velocity.x = -150;
              player.animations.play('left');
          }
          else if (cursors.right.isDown) {
              player.body.velocity.x = 150;
              player.animations.play('right');
          }
          else {
              player.animations.stop();
              player.frame = 4;
          }

          //  Allow the player to jump if they are touching the ground.
          if (cursors.up.isDown && player.body.touching.down) {
              player.body.velocity.y = -350;
          }

          stars.forEachAlive(eatStar, this);

          if (numStars == 0) {
            createStars(Math.random() * 13);
          }

          checkLedges();
          checkEnd();
      }
  }
}

game.state.add('main', basicGame.main);
game.state.start('main');
/*
function preload() {

    game.load.image('sky', sky);
    game.load.image('ground', platform);
    game.load.image('star', star);
    game.load.spritesheet('dude', dude, 32, 48);

}

var player;
var platforms;
var ledge1;
var ledge2;
var cursors;
var playing = true;

var stars;
var score = 0;
var counter = 100;
var scoreText;
var msgText;
var text;
var numStars = 0;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    ledge1 = platforms.create(400, 400, 'ground');
    ledge1.body.immovable = true;
    ledge1.body.velocity.y = -40;

    ledge2 = platforms.create(-150, 250, 'ground');
    ledge2.body.immovable = true;
    ledge2.body.velocity.y = 60;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    createStars(Math.random() * 13);

    //  The score
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    msgText = game.add.text(16, 64, "Let's go! 100", { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
}

function update() {
    if (playing) {
        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(stars, platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        game.physics.arcade.overlap(player, stars, collectStar, null, this);

        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;

        if (cursors.left.isDown) {
            player.body.velocity.x = -150;
            player.animations.play('left');
        }
        else if (cursors.right.isDown) {
            player.body.velocity.x = 150;
            player.animations.play('right');
        }
        else {
            player.animations.stop();
            player.frame = 4;
        }

        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -350;
        }

        stars.forEachAlive(eatStar, this);

        if (numStars == 0) {
          createStars(Math.random() * 13);
        }

        checkLedges();
        checkEnd();
    }
}

function createStars(num) {
    for (var i = 0; i < num; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(10 + i * (640 / num), 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;
        star.still = 0;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.5 + Math.random() * 0.2;
        numStars++;
    }
}

function collectStar(player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    if (counter < 100) counter++;
    score++;
    scoreText.text = 'Score: ' + score;
    msgText.text = text + counter;
    numStars--;

}

function eatStar(star) {
    if (star.body.velocity.y < 2) {
        star.still++;
    }
    else {
        star.still = 0;
    }

    if (star.still > 100) {
        star.kill();
        numStars--;
        counter -= 5;
        scoreText.text = 'Score: ' + score;
        msgText.text = text + counter;
    }
}

function checkLedges() {
    if (ledge1.body.position.y > 400 || ledge1.body.position.y < 225) {
      ledge1.body.velocity.y = -ledge1.body.velocity.y;
    }

    if (ledge2.body.position.y > 450 || ledge2.body.position.y < 200) {
      ledge2.body.velocity.y = -ledge2.body.velocity.y;
    }
}

function checkEnd() {
    if (counter >= 80) {
      msgText.fill = '#FFF';
      text = "Let's go! ";
    }
    else if (counter >= 70) {
      msgText.fill = '#00CC00';
      text = 'Be careful! ';
    }
    else if (counter >= 60) {
      msgText.fill = '#FF9900';
      text = "You're playing with fire here! ";
    }
    else {
      msgText.fill = '#FF0000';
      text = "DON'T GO BELOW 50!!!! ";
    }

    if (counter < 50) {
      msgText.text = 'Oh no! You lose!';
      msgText.position.x = 200;
      msgText.position.y = 300;
      ledge1.body.velocity.y = 0;
      ledge2.body.velocity.y = 0;
      player.animations.stop();
      player.frame = 4;
      playing = false;
    }
}

function quitGame() {
  game.destroy();
}
*/