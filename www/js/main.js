//this game will have only 1 state
var GameState = {
  // variables para acelerómetro
    inicio: function(){
   
    dificultad = 0;
    velocidadX = 0;
    velocidadY = 0;
    puntuacion = 0;
    
   
    
   this.vigilaSensores();

   
  },
  //load the game assets before the game starts
  preload: function() {
    this.game.load.image('backyard', 'assets/images/fondo.png');    
    this.game.load.image('apple', 'assets/images/manzana.png');    
    this.game.load.image('candy', 'assets/images/caramelo.png');    
    this.game.load.image('rotate', 'assets/images/rotate.png');    
    this.game.load.image('toy', 'assets/images/pato.png');    
    this.game.load.image('arrow', 'assets/images/arrow.png');   
    this.load.spritesheet('pet', 'assets/images/pet.png', 97, 83, 5, 1, 1); 
    //para añadir control de acelerómetro se pasa a create
   
    

  },
  //executed after everything is loaded
  create: function() {
      
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //screen size will be set automatically
    this.scale.setScreenSize(true);
      
    this.background = this.game.add.sprite(0,0, 'backyard');
    this.background.inputEnabled = true;
    this.background.events.onInputDown.add(this.placeItem, this);

    this.pet = this.game.add.sprite(100, 400, 'pet',0);
    this.pet.animations.add('funnyfaces', [0, 1, 2, 3, 2, 1, 0], 7, false);
    this.pet.anchor.setTo(0.5);

    //custom properties of the pet
    this.pet.customParams = {health: 100, fun: 100};

    //draggable pet
       this.pet.inputEnabled = true;
       this.pet.input.enableDrag();
   
    
    //buttons
    this.apple = this.game.add.sprite(72, 570, 'apple');
    this.apple.anchor.setTo(0.5);
    this.apple.customParams = {health: 20};
    this.apple.inputEnabled = true;
    this.apple.events.onInputDown.add(this.pickItem, this);

     //para acelerómetro 
      this.game.physics.arcade.enable(this.apple);
      this.apple.body.collideWorldBounds = true;
      this.apple.body.onWorldBounds = new Phaser.Signal();

    this.candy = this.game.add.sprite(144, 570, 'candy');
    this.candy.anchor.setTo(0.5);
    this.candy.customParams = {health: -10, fun: 10};
    this.candy.inputEnabled = true;
    this.candy.events.onInputDown.add(this.pickItem, this);

    this.toy = this.game.add.sprite(216, 570, 'toy');
    this.toy.anchor.setTo(0.5);
    this.toy.customParams = {fun: 30};
    this.toy.inputEnabled = true;
    this.toy.events.onInputDown.add(this.pickItem, this);

    //para acelerómetro 
      this.game.physics.arcade.enable(this.toy);
      this.toy.body.collideWorldBounds = true;
      this.toy.body.onWorldBounds = new Phaser.Signal();

    this.rotate = this.game.add.sprite(288, 570, 'rotate');
    this.rotate.anchor.setTo(0.5);
    this.rotate.inputEnabled = true;
    this.rotate.events.onInputDown.add(this.rotatePet, this);

    this.buttons = [this.apple, this.candy, this.toy, this.rotate];

    //nothing selected
    this.selectedItem = null;

    //stats
    var style = { font: "20px Arial", fill: "#fff"};
    this.game.add.text(10, 20, "Comida:", style);
    this.game.add.text(140, 20, "Risa:", style);

    this.healthText = this.game.add.text(100, 20, "", style);
    this.funText = this.game.add.text(200, 20, "", style);
    this.refreshStats();

    //decrease health and fun every 10 seconds
    this.statsDecreaser = this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.reduceProperties, this);
    this.statsDecreaser.timer.start();
    
    this.uiBlocked = false;
  },

  //rotate the pet
  rotatePet: function(sprite, event) {

    if(!this.uiBlocked) {
      this.uiBlocked = true;

      //alpha to indicate selection
      this.clearSelection();
      sprite.alpha = 0.4;
      
      //vibrate device if present
      if(navigator.vibrate) {
        navigator.vibrate(1000);
      }
      
      var petRotation = game.add.tween(this.pet);
      petRotation.to({ angle: '+720' }, 1000);
      petRotation.onComplete.add(function(){
        this.uiBlocked = false;
        sprite.alpha = 1;
        this.pet.customParams.fun += 10;

        //show updated stats
        this.refreshStats();
      }, this);
      petRotation.start();
    }
  },

  //pick an item so that you can place it on the background
  pickItem: function(sprite, event) {
    if(!this.uiBlocked) {
      //clear other buttons
      this.clearSelection();

      //alpha to indicate selection
      sprite.alpha = 0.4;

      //save selection so we can place an item
      this.selectedItem = sprite;
    }
  },

  //place selected item on the background
  placeItem: function(sprite, event) {
    if(this.selectedItem && !this.uiBlocked) {
      //position of the user input
      var x = event.position.x;
      var y = event.position.y;

      //create element in this place
      var newItem = this.game.add.sprite(x, y, this.selectedItem.key);
      newItem.anchor.setTo(0.5);
      newItem.customParams = this.selectedItem.customParams;

      //the pet will move to grab the item
      this.uiBlocked = true;
      var petMovement = game.add.tween(this.pet);
      petMovement.to({x: x, y: y}, 700);
      petMovement.onComplete.add(function(){
        this.uiBlocked = false;

        //destroy item
        newItem.destroy();

        //animate pet
        this.pet.animations.play('funnyfaces');

        //update pet stats
        var stat;
        for(stat in newItem.customParams) {
          //make sure the property belongs to the object and not the prototype
          if(newItem.customParams.hasOwnProperty(stat)) {
            this.pet.customParams[stat] += newItem.customParams[stat];
          }
        }
        
        //show updated stats
        this.refreshStats();

        //clear selection
        this.clearSelection();
      }, this);
      petMovement.start();      
    }
  },
  //clear all buttons from selection
  clearSelection: function() {
    //set alpha to 1
    this.buttons.forEach(function(element){element.alpha = 1});

    //clear selection
    this.selectedItem = null;
  },
  //show updated stats values
  refreshStats: function() {
    this.healthText.text = this.pet.customParams.health;
    this.funText.text = this.pet.customParams.fun;
  },
  
  //the pet slowly becomes less health and bored
  reduceProperties: function() {
    this.pet.customParams.health = Math.max(0, this.pet.customParams.health - 20);
    this.pet.customParams.fun = Math.max(0, this.pet.customParams.fun - 30);
    this.refreshStats();
  },

  //game loop, executed many times per second
  update: function() {
    if(this.pet.customParams.health <= 0 || this.pet.customParams.fun <= 0) {
      this.pet.customParams.health = 0;
      this.pet.customParams.fun = 0;
      this.pet.frame = 4;
      this.uiBlocked = true;

      this.game.time.events.add(2000, this.gameOver, this);

      // choque pato y manzana
      game.physics.arcade.overlap(apple, toy, this.choqueConToy, null, this);
    }
    // cuando hay aceleración
      this.apple.body.velocity.y = velocidadY * 300;
      this.apple.body.velocity.x = velocidadX * -1 * 300;

      this.toy.body.velocity.y = velocidadY * 300;
      this.toy.body.velocity.x = velocidadX * -1 * 300;

  },
  gameOver: function() {    
    this.game.state.restart();
  },
  vigilaSensores: function(){
      
      function onError() {
          console.log('onError!');
      }
  
      function onSuccess(datosAceleracion){
  
        GameState.registraDireccion(datosAceleracion);
      }
  
      navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
    },
  
    registraDireccion: function(datosAceleracion){
      velocidadX = datosAceleracion.x ;
      velocidadY = datosAceleracion.y ;
      
    },

    choqueConToy: function{
      toy.body.x = 15;
      toy.body.y =90;
    }


};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        GameState.inicio();
    }, false);

    var game = new Phaser.Game(360, 640, Phaser.AUTO);

    game.state.add('GameState', GameState);
    game.state.start('GameState');
    
}

//initiate the Phaser framework
  