class HandController {
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.rollAngle = 0;
	}
	updateRollAngle(x1, y1, x2, y2){
		// Calculate the slope using two points as a reference
		var slope =  (y1 - y2) / (x1 -x2);
		var theta = Math.atan(slope) * -1;
		// Converting tetha from radians to degrees
		this.rollAngle = theta * 180 / Math.PI;
	}
	updateCoordinates(x,y){
		this.x = x;
		this.y = y;
	}
}

// SCALING OPTIONS
// scaling can have values as follows with full being the default
// "fit"	sets canvas and stage to dimensions and scales to fit inside window size
// "outside"	sets canvas and stage to dimensions and scales to fit outside window size
// "full"	sets stage to window size with no scaling
// "tagID"	add canvas to HTML tag of ID - set to dimensions if provided - no scaling

var scaling = "fit"; // this will resize to fit inside the screen dimensions
var width = 1000;
var height = 800;
var color = dark; // or any HTML color such as "violet" or "#333333"
var outerColor = light;
var paddleControl = new HandController(300,300);

var frame = new Frame(scaling, width, height, color, outerColor);
frame.on("ready", function() {
	zog("ready from ZIM Frame");

	var stage = frame.stage;
	var stageW = frame.width;
	var stageH = frame.height;

	// ZIM BITS - Physics with Box2D (2016)

	// ZIM can be used with 2D physics engines such as Box2D
	// Box2D is rediculously verbose - but that gives it flexibility
	// the ZIM Physics module offers some welcome abstraction
	// (this code would be about 10 times as many lines)
	// you can still use traditional Box2D as well
	// currently there are a couple ZIM Bits on Physics
	// this one shows basic shapes, mapping and mouse interaction
	// the second one shows forces, buoyancy, and sensors

	// OVERVIEW
	// in general, we set up virtual Box2D shapes
	// and then Box2D calculates forces, positons, rotation, collisions
	// we can see these if we set the debug to true
	// we then map our own ZIM and CreateJS assets onto the Box2D ones
	// you are not supposed to directly influence positions
	// but rather use forces and let Box2D move things

	// STEPS
	// 1. make borders for the world
	// 2. make a new Physics object passing in the frame and borders
	// 3. alternatively remove any of the borders
	// 4. create Box2D body assets specifying dynamic and other properties
	// 5. position and rotate the bodies (only at start)
	// 6. set optional mouse dragging
	// 7. set optional debug canvas showing Box2D shapes
	// 8. create ZIM assets to match physics world
	// 9. map the ZIM assets to the Box2D assets


	// 1. make borders for the world
	// this stops stuff from going off the screen
	// but also could stop things from falling in through the top of the screen
	var borders = {x:0, y:0, width:stageW, height:stageH-120};

	// 2. make a new Physics object passing in the ZIM frame and borders
	// it needs a frame so it can get scale to match the debug canvas
	var physics = new zim.Physics(frame, borders);

	// EXTRA
	// for custom Box2D you may want access to the b2World
	// and scale that is used
	// var world = physics.world;
	// var scale = physics.scale;

	// 3. alternatively remove any of the borders
	// also borderTop, borderLeft, borderRight
	// physics.remove(physics.borderBottom);

	// INITIAL VARS
	// here we specify width, height, radius
	// so we can use both for Box2D shapes and ZIM shapes
	var barW = 400;
	var barH = 20;
	var circleR = 30;
	var boxW = 150;
	var boxH = 150;
	var tri1 = 200;
	var tri2 = 150;
	var tri3 = 132;

	// ANGLED BAR
	// 4. create Box2D body assets specifying dynamic and other properties
	// dynamic defaults to true and means the body will move
	// here we set the bar to not be dynamic so it is fixed
	// width, height, dynamic, friction, angular, density, restitution, maskBits, categoryBits
	var paddleBody = physics.makeRectangle(barW, barH, true, .2,'',100000);

	// 5. position and rotate the bodies (only at start)
	paddleBody.x = 300;
	paddleBody.y = 300;
	// paddleBody.rotation = 30;

	// CIRCLE
	// 4. create Box2D body assets specifying dynamic and other properties
	// can use ZIM DUO for these parameters too
	// angular is how much it will stop turning with 0 being not at all and 1 being hardly turning
	// restitution is how bouncy with 0 being not bouncy and 1 being fully bouncy
	// radius, dynamic, friction, angular, density, restitution, maskBits, categoryBits
	var circleBody = physics.makeCircle({
		radius:circleR,
		angular:.75,
		restitution:1,
		density: 100000
	});

	// 5. position and rotate the bodies (only at start)
	circleBody.x = 400;
	circleBody.y = 200;

	// BOX
	// 4. create Box2D body assets specifying dynamic and other properties
	// friction means how much the body will slow down sliding
	// with 0 meaning very little slowdown and 1 being lots of slowdown (Sticky)
	// width, height, dynamic, friction, angular, density, restitution, maskBits, categoryBits
	// var boxBody = physics.makeRectangle(boxW, boxH, true, .2);

	// 5. position and rotate the bodies (only at start)
	// boxBody.x = 200;
	// boxBody.y = 40;

	// TRIANGLE
	// 4. create Box2D body assets specifying dynamic and other properties
	// triangles match the ZIM triangle with the length of three sides
	// unlike the ZIM triangle, all sides must be specified
	// a, b, c, dynamic, friction, angular, density, restitution, maskBits, categoryBits
	// var triBody = physics.makeTriangle(tri1, tri2, tri3, true, .2);

	// 5. position and rotate the bodies (only at start)
	// triBody.x = 616;
	// triBody.y = 100;

	// MOUSE
	// 6. set optional mouse dragging
	// optionally pass in a list of bodies to receive mouse movement
	// otherwise defaults to all moveable bodies
	// physics.drag([boxBody, triangleBody]); // would not drag circleBody
	physics.drag(paddleBody, circleBody);

	// 7. set optional debug canvas showing Box2D shapes
	// DEBUG
	// optionally see the BOX 2D debug canvas - uncomment below
	physics.debug();
	frame.on("resize", function() {
		physics.updateDebug();
	});

	// 8. create ZIM assets to match physics world
	// Box2D bodies (made by physics.js) have centered positions
	// so center the registration points for ZIM assets
	var bar = new Rectangle(barW, barH, frame.silver);
    bar.centerReg();
    bar.cursor = "pointer";

	var circle = new Circle(circleR, frame.pink)
		.center();
	circle.cursor = "pointer";
		// add a little inner circle to see it spin
		var inner = new Circle(circleR/2, frame.green);
		inner.x = circleR/4;
		circle.addChild(inner);

	// var tri = new Triangle(tri1, tri2, tri3, frame.yellow)
	// 	.centerReg();
	// tri.cursor = "pointer";

	// var box = new Rectangle(boxW, boxH, frame.orange)
	// 	.centerReg();
	// box.cursor = "pointer";

	// MAPPING
	// 9. map the ZIM assets to the Box2D assets
	// this puts the ZIM assets on the Box2D assets
	// and rotates them to the same rotation
	physics.addMap(paddleBody, bar);
	physics.addMap(circleBody, circle);
	// physics.addMap(triBody, tri);
	// physics.addMap(boxBody, box);

	// you can also remove maps and shapes:
	// physics.removeMap(circleBody);
	// physics.remove(circleBody);
	// stage.removeChild(circle);

	// EXTRA
	// you can also access the update function and add your own calls
	// after defaults to true to add your function after the world step
	// set after to false to add your function before the world step
	// physics.Ticker.add(function, after);
	// physics.Ticker.remove(function);
	// this is required for forces and torque which get applied each step
	// unless it is an impulse force which gets applied all at once

    // ZIM BITS footer - you will not need this
    // makeFooter(stage, stageW, stageH); 
    
    // LEAP MOTION HAND CONTROLLER

    // Loop uses browser's requestanimationFrame
    var options = { enableGestures: true };

    // Main Loop Loop
    Leap.loop(options, function(frameLeap) {
		var motionScaleRate = 2.5;
        if (frameLeap.hands.length > 0){
            // console.log('Mano detectada');
            // Leyendo la posición X y Y del dedo ìndice de la primera mano detectada
            var indexFingerX = frameLeap.hands[0].fingers[1].dipPosition[0];
            var indexFingerY = frameLeap.hands[0].fingers[1].dipPosition[1];
			// console.log('Coordenada X', handX, 'Coordenada Y', handY);
			var pinkyFingerX = frameLeap.hands[0].fingers[4].dipPosition[0];
            var pinkyFingerY = frameLeap.hands[0].fingers[4].dipPosition[1];
			
			// Calculate the slope using two points as a reference
			paddleControl.updateRollAngle(indexFingerX,indexFingerY, pinkyFingerX, pinkyFingerY);

			paddleControl.X = indexFingerX * motionScaleRate + (width / 2);
			paddleControl.y = (height - indexFingerY * motionScaleRate);

			// Read the actual X and Y of the index finger and assign it to the X and X of the paddle 
			// I suspect this was causing problems with the collisions, since it's skipping the pixels where the collisions must take place at
            // paddleBody.y = handYOnCanvas;
			// paddleBody.x = handXOnCanvas;
			paddleBody.x = paddleControl.X;
			paddleBody.y = paddleControl.y;
			paddleBody.rotation = paddleControl.rollAngle;
			
			console.log('X:',paddleBody.x, 'Y:', paddleBody.y)
			// paddleBody.rotation = 0;
        }

    });

}); // end of ready

function calculateMotion(oldValue, newValue, interval = 1) {
	var delta = Math.abs(oldValue - newValue)
	if (oldValue < newValue) {
		// Value is increasing: increment newValue by the interval until it matches the destination newValue
		newValue += interval;
	} else if (oldValue > newValue) {
		// Value is increasing: increment newValue by the interval until it matches the destination newValue
		newValue += interval;
	}
}