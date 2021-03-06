import Phaser from "phaser";

export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function Level1() {
        Phaser.Scene.call(this, { key: 'Level1' , active: true  })
    },

    preload: function () {
        // map made with Tiled in JSON format
        this.load.tilemapTiledJSON('map', 'assets/runner2.json');
        // tiles in spritesheet
        this.load.spritesheet('joerunnertileset', 'assets/joerunnertileset.png', {frameWidth: 30, frameHeight: 30});
        // player animations
        this.load.atlas('player', 'assets/player.png', 'assets/player.json');
        this.load.atlas('gem', 'assets/diamondsheet.png', 'assets/diamond.json');
        this.load.atlas('joe', 'assets/joetowler.png', 'assets/joetowler.json');

        //Load guage
        this.load.image('guage0', 'assets/guage0.png');
        this.load.image('guage1', 'assets/guage1.png');
        this.load.image('guage2', 'assets/guage2.png');
        this.load.image('guage3', 'assets/guage3.png');
    },

   create: function() {
      this.gallopCount = 0;
      this.jumping = false;
      this.speedLevel = 0;
      this.speedTimer = 0;

      // load the map
      this.map = this.make.tilemap({key: 'map'});

      // tiles for the ground layer
      var levelTiles = this.map.addTilesetImage('joerunnertileset');

      //world layer
      this.worldLayer = this.map.createDynamicLayer('bg', levelTiles, 0, 0);
      // create the platforms layer
      this.platformLayer = this.map.createDynamicLayer('platforms', levelTiles, 0, 0);
      // the player will collide with this layer
      this.platformLayer.setCollisionByExclusion([-1]);


      // set the boundaries of our game world
      this.physics.world.bounds.width = this.worldLayer.width;
      this.physics.world.bounds.height = this.worldLayer.height;

      // create the player sprite
      this.player = this.physics.add.sprite(200, 552, 'player',0);
      this.player.setBounce(0.2); // our player will bounce from items
      this.player.setCollideWorldBounds(true); // don't go out of the map


      // small fix to our player images, we resize the physics body object slightly
      this.player.body.setSize(this.player.width, this.player.height);

      // player will collide with the level tiles
      this.physics.add.collider(this.platformLayer, this.player,this.land,null,this);


      // create the joe towler sprite
      this.joe = this.physics.add.sprite(32, 552, 'joe',0);
      //this.player.setBounce(0.2); // our player will bounce from items
      this.joe.setCollideWorldBounds(true); // don't go out of the map


      // small fix to our player images, we resize the physics body object slightly
      this.joe.body.setSize(this.joe.width, this.joe.height);
      this.joe.setVelocityX(0);
      //Control when Joe starts
      this.joestarted = false;

      this.anims.create({
          key: 'joewalk',
          frames: this.anims.generateFrameNames('joe', {prefix: 'joetowler ',suffix: '.aseprite', start: 0, end: 22}),
          frameRate: 10,
          repeat: -1
      });
      this.joe.anims.play('joewalk');


      this.physics.add.collider(this.platformLayer, this.joe);

      //this.physics.add.collider(this.player, this.gemgroup,null,this);
      // when the player overlaps with a tile with index 17, collectCoin
      // will be called


      // player animations
      this.anims.create({
          key: 'walk',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 0, end: 11}),
          frameRate: 10,
          repeat: -1
      });

      this.anims.create({
          key: 'idle',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 0, end: 0}),
          frameRate: 10,
          repeat: -1
      });

      this.anims.create({
          key: 'gallop',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 12, end: 29}),
          frameRate: 10,
          repeat: -1
      });

      this.anims.create({
          key: 'jump',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 30, end: 33}),
          frameRate: 10,
          repeat: 0
      });

      this.anims.create({
          key: 'air',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 34, end: 34}),
          frameRate: 10,
          repeat: 0
      });

      this.anims.create({
          key: 'land',
          frames: this.anims.generateFrameNames('player', {prefix: 'joerunnercat ',suffix: '.ase', start: 34, end: 37}),
          frameRate: 10,
          repeat: 0
      });

      this.player.on('animationcomplete',function () {
          if(this.player.anims.currentAnim.key == 'jump' && !this.jumping) {
            this.jumping = true;
            this.player.setVelocityY(-360);
            //alert(this.player.anims.currentAnim.key);
          } else if (this.player.anims.currentAnim.key == 'land' && this.jumping){
            this.jumping = false;
          }
          //this.player.body.setVelocityY(-500);

      }, this );

      //Load Gems

      var gems = this.map.getObjectLayer('gems')['objects'];
      this.gemgroup = this.physics.add.group();
      this.physics.add.collider(this.platformLayer, this.gemgroup);
      //this.physics.add.collider(this.player, this.gemgroup);
      this.physics.add.overlap(this.player, this.gemgroup, this.collectGem, null, this);

      // Gems
      gems.forEach(gem => {
        //Add sprite
        this.gemgroup.create(gem.x, gem.y-20, 'gem');
      });

      // gem animation
      this.anims.create({
           key: 'gem',
           frames: this.anims.generateFrameNames('gem', {prefix: 'diamond ', suffix: '.aseprite', start: 0, end: 12}),
           frameRate: 10,
           repeat: -1
       });
       this.gemgroup.playAnimation('gem');

       /*
       this.timer = this.time.addEvent({
          delay: 500,
          callback: this.slowPlayer,
          callbackScope: this,
          loop: true
        });*/

      this.cursors = this.input.keyboard.createCursorKeys();

      // set bounds so the camera won't go outside the game world
      this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      // make the camera follow the player
      this.cameras.main.startFollow(this.player);

      // set background color, so the sky is not black
      this.cameras.main.setBackgroundColor('#ccccff');

      // this text will show the score
      this.text = this.add.text(20, 570, '0', {
          fontSize: '20px',
          fill: '#ffffff'
      });
      this.text.setScrollFactor(0);

      /*
      this.speed = this.add.text(100, 100, '0', {
          fontSize: '60px',
          fill: '#000000',
          alpha: 1
      });*/
      // fix the text to the camera
      //this.speed.setScrollFactor(0);

      this.guage = this.add.image(120, 60, 'guage0');
      this.guage.setScrollFactor(0);
  },

  // this function will be called when the player touches a coin
  collectCoin: function(sprite, tile) {
      return false;
  },

  update: function(time, delta) {
      //Update the display with the new velocity
      //this.speed.setText(this.player.body.velocity.x);

      this.guage.setTexture('guage'+this.speedLevel);
      //Check timer and reduce speed level if 0
      if(this.speedTimer <=0) {
        if(this.speedLevel > 0) {
          this.speedLevel--;
        }
      } else {
        this.speedTimer--;
      }

      if(!this.player.body.onFloor()) {
        this.jumping = true;
      }
      /*
      if (this.cursors.left.isDown)
      {
          this.player.body.setVelocityX(-200);
          this.player.anims.play('walk', true); // walk left
          this.player.flipX = true; // flip the sprite to the left
      }*/
      if (this.cursors.right.isDown)
      {
          //Start joe running, if he isn't already
          if(!this.joestarted) {
            this.joe.setVelocityX(310);
            this.joestarted = true;
          }

          if(this.gallopCount >= 20) {
            this.player.body.setVelocityX(300 + 60*this.speedLevel);
            this.player.anims.play('gallop', true);
            this.player.flipX = false;
          } else {
            this.gallopCount++;
            this.player.body.setVelocityX(200 + 60*this.speedLevel);
            this.player.anims.play('walk', true);
            this.player.flipX = false; // use the original sprite looking to the right
          }
      } else {
          this.gallopCount = 0;
          if(!this.player.body.onFloor()) {
            this.player.anims.play('air', true);
          } else {
            //this.player.once('animationcomplete',function () {this.player.body.setVelocityX(0);}, this );
            if(!this.jumping) {
              this.player.body.setVelocityX(0);
              //Doesn't allow the jump part of the animation to run when this played
              this.player.anims.play('idle', true);
              //this.player.anims.play('idle', true);
            }
            //this.player.anims.stop(null,true);
            //
          }
      }
      // jump
      if (this.cursors.up.isDown && this.player.body.onFloor())
      {
        this.player.anims.play('jump', true);
      }


  },

  land: function() {
    if(this.jumping) {
      this.player.anims.play('land', true);
    }

  },

  collectGem: function (player,gem) {
      gem.disableBody(true, true);
      //Reset the speed timer so that the player gets more time at speed
      this.speedTimer = 30;
      if(this.speedLevel < 3) {
        this.speedLevel++;
      }
  },

  //Slow down the player
  slowPlayer: function () {
    console.log(this.timer.getProgress());
    if(this.speedLevel > 0) {
      this.speedLevel--;
    }
  }


});
