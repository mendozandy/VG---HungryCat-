var AMOUNT_FOOD = 30;
GamePlayManager = { // se crea el objeto con varios metodos

    init: function() { //inicializamos variables del juego
        //console.log('init');
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.flagFirstMouseDown = false;
        this.amountFoodCaught = 0;
        this.endGame = false;
        this.countHappy = -1;
    },
    preload: function() { //cargamos todos los recursos para el proyecto por medio de phaser
      //  console.log('preload');
      game.load.image('background', 'assets/images/background.png');
      game.load.spritesheet('cats', 'assets/images/cats.png', 186, 221, 2);
      game.load.spritesheet('food', 'assets/images/food.png', 81, 82, 4);

      game.load.spritesheet('explosion', 'assets/images/explosion.png');
    },
    create: function() { //se llama al metodo create al estar seguros que los recursos ya estan cargados para ser utilizados
       // console.log('create');
       game.add.sprite(0, 0, 'background');
       this.cats = game.add.sprite(0, 0, 'cats');
       this.cats.frame = 0; //muestra la primera imagen
       this.cats.x = game.width/2; //posiciona la imagen en el angulo x
       this.cats.y = game.height/2; //posiciona la imagen en el angulo y
       this.cats.anchor.setTo(0); //posiciona la imagen en el centro
       //this.cats.angle = 0; //rotar la propiedad
       //this.cats.scale.setTo(2); //escala el tamaño del objeto
       //this.cats.alpha = 0.5; //agrega efecto de invisibilidad a la imagen
       game.input.onDown.add(this.onTap, this);

       this.food = [];
       for(var i=0; i<AMOUNT_FOOD; i++){
            var food = game.add.sprite(100, 100, 'food');
            food.frame = game.rnd.integerInRange(0,3);
            food.scale.setTo( 0.30 + game.rnd.frac());
            food.anchor.setTo(0.5);
            food.x = game.rnd.integerInRange(50,1050);
            food.y = game.rnd.integerInRange(50,600);

            this.food[i] = food;
            var rectCurrenFood = this.getBoundsFood(food);
            var rectCat = this.getBoundsFood(this.cats);

            while(this.isOverlapingOtherFood(i, rectCurrenFood) || this.isRectanglesOverlapping(rectCat, rectCurrenFood)){
                food.x = game.rnd.integerInRange(50,1050);
                food.y = game.rnd.integerInRange(50,600);
                rectCurrenFood = this.getBoundsFood(food);
            }
       }

       this.explosionGroup = game.add.group();

       for(var i=0; i<10; i++){
            this.explosion = this.explosionGroup.create(100,100, 'explosion');
            // var tween = game.add.tween(this.explosion);
            //tween.to({x:500, y:100}, 1500, Phaser.Easing.Exponential.Out);
            //tween.start();
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
    
            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                    alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
    
            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
       }
       
       this.currentScore = 0;
       var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
       }

       this.scoreText = game.add.text(game.width/2, 40, '0', style);
       this.scoreText.anchor.setTo(0.5);

       this.totalTime = 10;
       this.timerText = game.add.text(980, 40, this.totalTime+'', style);
       this.timerText.anchor.setTo(0.5);

       this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
        if(this.flagFirstMouseDown){
            this.totalTime--;
            this.timerText.text = this.totalTime+'';
            if(this.totalTime<=0){
                game.time.events.remove(this.timerGameOver);
                this.endGame = true;
                this.showFinalMessage('GAME OVER');
            }
        }
        },this);
    },

    increaseScore:function() {
        this.countHappy = 0;
        this.cats.frame = 1;

        this.currentScore+=100;
        this.scoreText.text = this.currentScore;

        this.amountFoodCaught +=1;
        if(this.amountFoodCaught >= AMOUNT_FOOD){
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('CONGRATULATIONS');
        }
    },
    showFinalMessage:function(msg){
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0,0,game.width, game.height);

        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 60pt Arial',
            fill: 'FFFFFF',
            align: 'center'
        }

        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },

    onTap:function() {
        this.flagFirstMouseDown = true; //el objeto se mueve recien al clickear la pantalla
    },
    getBoundsFood:function(currentFood) {
        return new Phaser.Rectangle(currentFood.left, currentFood.top, currentFood.width, currentFood.height);
    },
    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y>rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    isOverlapingOtherFood:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsFood(this.food[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundsCat:function(){
        var x0 = this.cats.x - Math.abs(this.cats.width)/4;
        var width = Math.abs(this.cats.width)/2;
        var y0 = this.cats.y - this.cats.height/2;
        var height = this.cats.height;
        
        return new Phaser.Rectangle(x0, y0,width,height);
    },
    render:function(){
        //game.debug.spriteBounds(this.cats);
        for(var i=0; i<AMOUNT_FOOD; i++){
            //game.debug.spriteBounds(this.food[i]);
        }
    },

    update: function() { 
       // console.log('update');
       //this.cats.angle +=1; //hacer que la propiedad gire sobre su punto
        if(this.flagFirstMouseDown && !this.endGame){
            var pointerX = game.input.x; //reconoce el cursor del mouse segun el movimiento
            var pointerY = game.input.y;
    
            //console.log('x:'+pointerX);
            //console.log('y'+pointerY);
            var distX = pointerX - this.cats.x;
            var distY = pointerY - this.cats.y;
    
            if(distX>0) {
                this.cats.scale.setTo(1,1); //mueve el objeto hacia la derecha segun el cursor
            }else{
                this.cats.scale.setTo(-1,1); //mueve el objeto hacia la izquierda segun el cursor
            }

            if(this.countHappy>=0){
                this.countHappy++;
                if(this.countHappy>50){
                    this.countHappy = -1;
                    this.cats.frame = 0;
                }
            }
            
            this.cats.x += distX * 0.02;
            this.cats.y += distY * 0.02;

            for(var i=0; i<AMOUNT_FOOD; i++){
                var rectCat = this.getBoundsCat();
                var rectFood = this.getBoundsFood(this.food[i]);


                if(this.food[i].visible && this.isRectanglesOverlapping(rectCat, rectFood)){
                    //console.log("COLLISION");
                    this.increaseScore();
                    this.food[i].visible = false; //ocultar un objeto al colisionar

                    var explosion = this.explosionGroup.getFirstDead();
                    if(explosion!=null) {
                        explosion.reset(this.food[i].x, this.food[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                       explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween){
                           currentTarget.kill();
                        }, this);
                    }

                    
                }
            }
       }
      
    }
}

var game = new Phaser.Game(1000, 628, Phaser.AUTO); //se añade dimensiones del juego with y heigh, en el tercer parametro se define el render del juego (webgl es mas rapido si se cuenta con tarjeta grafica) 

game.state.add('gameplay', GamePlayManager); //añadimos estado y asignamos a un objeto
game.state.start('gameplay'); //indicamos que estado queremos ejecutar