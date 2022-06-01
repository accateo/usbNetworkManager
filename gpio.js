var gpio=require('gpio');

var gpio29, idIntervalLed;

module.exports = {

	//inizializzazione gpio
	initGpio: function(){

		gpio29 = gpio.export(165, {
		   direction: gpio.DIRECTION.OUT,
		   ready: function() {

		   }
    	});

	},

	//blink led
	blinkStatusLed: function(){

		gpio29.set();
  		gpio29.reset();

	},

	//stoppo led per errore o pausa attesa pedalina
	stopLed: function(status){

		clearInterval(idIntervalLed);
		if(status){

		    gpio29.reset();
		}
		else{
		    gpio29.set();
		}
		gpio29.unexport();

	},

	//timer led
	intervalLed: function(){
		
		clearInterval(idIntervalLed)
		idIntervalLed = setInterval(module.exports.blinkStatusLed, 300);

	}



}

