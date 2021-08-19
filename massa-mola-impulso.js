let inMotion = true; // to stop all animations when dragging
let inc = (interval[1] - interval[0]) / numberOfEvaluations; // increment in the t-axis

// ------------------update functions for moveAlong -------------------

function run(data) {
  // return a function that runs animation with pointString.moveAlong(run(...))

  return function (t) {
    if (t >= duration) {
      //turtle.clearScreen();
      //pointString.setPosition(JXG.COORDS_BY_USER, [0, 0]); // set position on the Y-line
      return NaN;
    } else {
      let tIndex = Math.floor((t / duration) * numberOfEvaluations);
      turtle.moveTo([tIndex * inc, data[tIndex][0]]); // use time to move turtle

      return [0, turtle.Y()]; // return the Y-position of the turtle to pointString.moveALong()
    }
  };
}

function externalForce(t) {
  return F0 * Math.cos(omega2 * t);
}

//-------------------ANIMATION and DIFFERENTIAL EQUATION-------------------------------------------------
function setAnimation(posInitial) {
  turtle.setPos(0, posInitial);

  friction = sliders[0].Value(); // sliders is an array that contains the sliders objects created......
  F0 = sliders[1].Value(); // sliders value are read before set animation

  let f = function (t, x) {
    return [
      x[1],
      externalForce(t) / m + (-friction / m) * x[1] - (k / m) * x[0],
    ];
  };

  let data = JXG.Math.Numerics.rungeKutta(
    "heun",
    [posInitial, 0],
    interval,
    numberOfEvaluations,
    f
  );

  pointString.moveAlong(run(data)); // the point is attached to the Y-line, therefore the velocity is discarded
}

function hook() {
  if (inMotion) {
    if (board.mode === board.BOARD_MODE_DRAG) {
      board.stopAllAnimation();
      inMotion = false;
    }
  } else {
    if (board.mode !== board.BOARD_MODE_DRAG) {
      inMotion = true;
      turtle.clearScreen();
      setAnimation(pointString.Y()); // when not dragging, start animations
    }
  }
}

board.on("update", hook);
setAnimation(0);
