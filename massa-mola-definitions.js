//let oldWidth = document.documentElement.clientWidth;
//let oldHeight = document.documentElement.clientHeight; // keep old values of width and height for reactivity below
//basicWidth will be used to setup the size of points, lines, etc

//console.log("Width =", oldWidth, "basicWidth =", basicWidth);

var basicWidth = calculateBasicWidth();
const length = 36;
const duration = 36e3;

const numberOfEvaluations = 5e3;

const interval = [0, 6 * length];

let friction = 0.0,
  m = 0.9, // mass
  k = 4 * m, // string constant, the natural frequency = 2
  F0 = 1.2;

let omega2 = Math.sqrt(k / m) - 0.1;
omega = Math.sqrt(k / m);

//------------------CHECK INPUT -----------------------------------------------------------
const inputOmega2 = document.getElementById("inputOmega2");

inputOmega2.onchange = function () {
  omega2 = Number(inputOmega2.value);
  if (isNaN(omega2)) {
    // inMotion = true;
    // board.suspendUpdate();
    alert("DIGITE UM NÚMERO REAL!\nPonto indica separação de decimais");
    // turtle.clearScreen();
    // board.unsuspendUpdate();
    // inMotion = false;
    // return;
    omega2 = 1.9;
    inputOmega2.value = "1.9";
  }

  inMotion = true;
  board.stopAllAnimation();
  inMotion = false; // important set false before setAnimation()
  turtle.clearScreen();
  setAnimation(0);
};

//-------------DEFINE BOARD, SLIDERS, POINTS, STRINGS, TURTLES  ----------------------------------
const board = JXG.JSXGraph.initBoard("jxgbox", {
  boundingbox: [-10, 100, 6 * length, -100],
  // maxboundingbox: [-15, 45, endInterval + 5, -55],  // comenting this line is important for reactivity in ipad
  keepaspectratio: false, // aspect ratio relative to the jxgbox dimensions?
  showNavigation: false,
  showCopyright: false,
  showFullscreen: true,
  axis: false,
  grid: false,
  zoom: {
    wheel: true,
    enabled: false,
  },
  pan: {
    needTwoFingers: false,
    enabled: true,
  },

  // defaultAxes: {
  //   x: {
  //     name: "t",
  //     ticks: {
  //       label: {
  //         visible: true,
  //         anchorX: "middle",
  //         anchorY: "top",
  //         fontSize: 12,
  //         offset: [0, -3],
  //       },
  //       drawZero: true,
  //       visible: false,
  //     },
  //   },
  //   y: {
  //     visible: false,
  //   },
  // },
});

board.renderer.container.style.backgroundColor = backgroundColor; // this can be obtained changing jxgbox background color
// "#EAFAF1"; //#7BCCB5"; // none = transparent

let xaxis = board.create(
  "axis",
  [
    [0, 0],
    [1, 0],
  ],
  {
    name: "<math><mi>t</mi></math>", //  Tempo
    withLabel: true,
    ticks: { visible: true },
    strokeWidth: basicWidth,

    label: {
      position: "rt", // possible values are 'lft', 'rt', 'top', 'bot'
      offset: [-6 * basicWidth, -12 * basicWidth], // (in pixels)
      fontUnit: "vw",
      fontSize: 2,
      // strokeColor: "RED",
    },
  }
);

xaxis.removeTicks(xaxis.defaultTicks); // remove ticks

// create new ticks

let step = interval[1] / length;
let ticksArray = [...Array(20 * length).keys()].map((i) => step * i);
let ticksLabels = ticksArray.map((i) => (i / step).toString());

let ticks = board.create("ticks", [xaxis, ticksArray], {
  labels: ticksLabels,
  strokeColor: "black",
  majorHeight: 5,
  drawlabels: true,
  label: {
    fontUnit: "vw",
    offset: [0, -5],
    anchorX: "middle",
    anchorY: "top",
    fontSize: 1,
  },
});

//--------------------------------INPUT OF OMEGA2---------------------------------
// const input = board.create(
//   "input",
//   [75, -20, omega - incOmega, "\\( \\omega =\\, \\)"],
//   {
//     cssStyle: "width: 60px",
//     useMathJax: true,
//   }
// );
// const txtOmega2 = board.create(
//   "text",
//   [75, -23, "Frequência da força externa"],
//   {
//     fixed: true,
//   }
// );
// board.create("text", [
//   95,
//   -20,
//   '<button onclick="omega2 = setAnimation(0.2)">Submeter</button>',
// ]);
//----------------------------TITULO --------------------------
// board.create("text", [0, -46, "O Sistema Massa-Mola com Impulso"], {
//   color: "blue",
//   fontsize: 20,
// });
//--------------------------END OF INPUT OMEGA 2 --------------------------------------
board.create(
  // FORMULA
  "text",
  [
    80,
    90,
    function () {
      return "$$ \\color{black}{m} \\, u'' + \\color{black}{\\gamma}\\, u' + \\color{black}{k}\\, u = \\color{black}{F_0}\\, \\cos( \\color{black}{\\omega} t) $$";
    },
  ],
  {
    fontSize: 2,
    fontUnit: "vw",
    color: texColor,
    useMathJax: true,
  }
);
// board.create(
//   "text",
//   [
//     70,
//     16,
//     function () {
//       return `$$ \\color{blue}{\\omega_0} = \\sqrt{k / m} = ${Math.sqrt(
//         slHooke.Value() / m
//       ).toFixed(2)} $$`;
//     },
//   ],
//   {
//     fontSize: 18,
//     color: "olive",
//     useMathJax: true,
//   }
// );
//----------------------------SLIDERS and TEXTS------------------------------------------------------

const line = board.create(
  "line",
  [
    [0, 60],
    [0, -60],
  ],
  { visible: false, straightFirst: false, straightLast: false }
);
const pointString = board.create("glider", [0, 0, line], {
  name: "", //<strong>P</strong>",
  size: 3 * basicWidth,
  needsRegularUpdate: true,
  fillColor: myRed,
  label: {
    autoPosition: true,
    offset: [basicWidth, basicWidth],
    fontUnit: "vw",
    fontSize: 2,
  },
});

const turtle = board
  .create("turtle", [0, 0], {
    lastArrow: false,
    strokeWidth: Math.max(0.5 * basicWidth, 2),
    strokeColor: "olive",
    strokeOpacity: 1,
    name: "<math>  <mi>u(t)</mi>  </math>",
    withLabel: false, // no label
    label: { fontUnit: "vw", fontSize: 1.5 },
  })
  .hideTurtle();

const springHangup = board.create("point", [0, 70], {
  color: "black",
  name: "<math><mstyle mathcolor=black><mtext>Mola 1</mtext></mstyle></math>",
  fixed: true,
  label: { fontUnit: "vw", fontSize: 1.4 },
});
const springHangup2 = board.create("point", [0, -70], {
  color: "black",
  name: "<math><mstyle mathcolor=black><mtext>Mola 2,Força Externa</mtext></mstyle></math>",
  // label: { position: "bot", offset: [-15, -20] },
  fixed: true,
  label: { fontUnit: "vw", fontSize: 1.4 },
});

const numberOfSpringRings = 16;

let spring1 = [];

spring1 = createSpringPoints(
  springHangup,
  pointString,
  numberOfSpringRings,
  "black",
  0.8
); //----------------------create points of first string

for (let i = 0; i < spring1.length - 1; i++) {
  board.create("segment", [spring1[i], spring1[i + 1]], {
    color: "black",
    strokeWidth: basicWidth,
  });
}

let spring2 = [];

spring2 = createSpringPoints(
  springHangup2,
  pointString,
  numberOfSpringRings,
  "blue",
  0.1
); //----------------create points of second string

for (let i = 0; i < spring2.length - 1; i++) {
  board.create("segment", [spring2[i], spring2[i + 1]], {
    color: "blue",
    strokeWidth: basicWidth,
    strokeOpacity: 0.2, // -----make the chain
  });
}

//-------------END DEFINING OBJECTS ----------------------------------

// -----------------------------------CREATE SLIDERS -----------------------------------

let ySliders = -70; // positions of sliders depending on wrapper width
let xSliders = 80;
let sliderLength = 40;
const slidersInfo = [
  {
    name: "&gamma;",
    xpos: xSliders,
    ypos: ySliders,
    values: [0, 0.0, 0.3],
    label: "Coeficiente de atrito",
  },
  {
    name: "F_0",
    xpos: xSliders + sliderLength + 20,
    ypos: ySliders,
    values: [0, 2.5, 4],
    label: "Coeficiente da força externa",
  },
  // {
  //   name: " k ",
  //   xpos: xSliders + 40,
  //   ypos: ySliders,
  //   values: [0, 4, 6],
  //   label: "Coeficiente da mola",
  // },
  // {name:, xpos, ypos, values: }
];

let sliders = []; // an object that contains the sliders of gamma and F0

slidersInfo.forEach((sl, index) => {
  sliders[index] = board.create(
    "slider",
    [[sl.xpos, sl.ypos], [sl.xpos + sliderLength, sl.ypos], sl.values],
    {
      name: sl.name,
      size: 3 * basicWidth,
      baseline: { strokeColor: myBlue, strokeWidth: 10, fontUnit: "vw" },
      highline: { strokeColor: "olive" },
      fillColor: myYellow,
      label: { fontUnit: "vw", fontSize: 1.2, strokeColor: "black" },
      // point1: { fixed: false },
      // point2: { fixed: false },   // draggable
      // baseline: { fixed: false, needsRegularUpdate: true },
    }
  );
  board.create("text", [sl.xpos, sl.ypos - 15, sl.label], {
    strokeColor: "black",
    fillColor: "olive",
    fixed: true,
    fontSize: 1.4,
    fontUnit: "vw",
  });
});

// ---------------------------END SLIDERS -------------------------------------------
//----------------REACTIVITY----------------------------------------------------
window.addEventListener("resize", handleResize, false);

function handleResize() {
  basicWidth = calculateBasicWidth();
  pointString.fullUpdate();
  board.fullUpdate();
}

function calculateBasicWidth() {
  let theWidth = document.documentElement.clientWidth;

  let basicWidth = 1;

  if (theWidth <= 360) {
    basicWidth = 2;
  } else if (theWidth <= 640) {
    basicWidth = 3;
  } else if (theWidth <= 940) {
    basicWidth = 4;
  } else {
    basicWidth = 5; //Math.floor(0.002 * Math.max(theWidth)); // 0.2% of width
  }

  let pixelRatio = window.devicePixelRatio;

  pixelRatio = Math.max(Math.round(pixelRatio), 1);
  if (pixelRatio > 1) {
    basicWidth = basicWidth / pixelRatio;
  }

  return basicWidth;
}

//---------------------------------END REACTIVITY ----------------------------------------------

// ----------------------FUNCTION THAT CREATES STRING POINTS

function createSpringPoints(p1, p2, n, color, opacity) {
  let p = [];
  let length = n;
  p[0] = p1;
  p[length - 1] = p2;
  let direction = Math.sign(p2.Y() - p1.Y());

  for (let i = 1; i < length - 1; i++) {
    p[i] = board.create(
      "point",
      [
        -direction * 2 + 4 * direction * (i % 2),
        ((i) => {
          return function () {
            return (
              p[0].Y() +
              direction *
                (i + 1) *
                Math.abs((p[0].Y() - p[length - 1].Y()) / (length + 1))
            );
          };
        })(i),
      ],
      { withLabel: false, color: color, size: 1, opacity }
    );
  }

  return p;
}
