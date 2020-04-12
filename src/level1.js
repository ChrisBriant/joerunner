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
    },

   create: function() {
      this.gallopCount = 0;
      this.jumping = false;
      this.speedLevel = 0;

      // load the map
      this.map = this.make.tilemap({key: 'map'});

      // tiles for the ground layer
      var levelTiles = this.map.addTilesetImage('joerunnertileset');

      //world layer
      this.worldLayer = this.map.createDynamicLayer('bg', levelTiles, 0, 0);
      console.log(this.worldLayer);
      // create the platforms layer
      this.platformLayer = this.map.createDynamicLayer('platforms', levelTiles, 0, 0);
      // the player will collide with this layer
      this.platformLayer.setCollisionByExclusion([-1]);

      //console.log(this.platformLayer);

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
        console.log(gem.y)
        this.gemgroup.create(gem.x, gem.y-20, 'gem');
      });
      console.log(this.gemgroup);

      // gem animation
      this.anims.create({
           key: 'gem',
           frames: this.anims.generateFrameNames('gem', {prefix: 'diamond ', suffix: '.aseprite', start: 0, end: 12}),
           frameRate: 10,
           repeat: -1
       });
       this.gemgroup.playAnimation('gem');
       //this.anims.play('gem');

      /*
      this.player.on('animationcomplete', function (anim, frame) {
        this.emit('animationcomplete_' + anim.key, anim, frame);
      }, this.player);

      this.player.on('animationcomplete_jump', function () {alert("Jump"); return false;},this.player, true);
      */


      // idle with only one frame, so repeat is not neaded
      /*
      this.anims.create({
          key: 'idle',
          frames: [{key: 'bof', frame: 'sprite_0'}],
          frameRate: 10,
      });
      */


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

      this.speed = this.add.text(60, 60, '0', {
          fontSize: '60px',
          fill: '#000000'
      });
      // fix the text to the camera
      this.speed.setScrollFactor(0);

      console.log(this.player);
  },

  // this function will be called when the player touches a coin
  collectCoin: function(sprite, tile) {
      return false;
  },

  update: function(time, delta) {
      //Update the display with the new velocity
      this.speed.setText(this.player.body.velocity.x);

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

        //this.player.once('animationcomplete', function () {
          this.player.anims.play('jump', true);
          /*
          this.player.once('animationcomplete',function () {
              this.player.body.setVelocityY(-500);
              alert(this.player.anims.currentAnim.key);
          }, this );
          */
        //}, this);
        console.log(this.anims);
        //this.player.body.setVelocityY(-500);
        /*
        this.time.addEvent({
          delay: 500, // in ms
          callback: () => {
            this.player.body.setVelocityY(-500);
          }
        });*/
      }


  },

  land: function() {
    if(this.jumping) {
      this.player.anims.play('land', true);
    }

  },

  collectGem: function (player,gem) {
      gem.disableBody(true, true);
      if(this.speedLevel < 3) {
        this.speedLevel++;
      }
  }


});
