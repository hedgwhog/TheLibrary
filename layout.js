/* ==========================================================================
   layout.js — SHELF HITBOXES
   --------------------------------------------------------------------------
   Every point is in *image pixels* of commisions/library.jpg (1920 x 1080),
   so the shapes scale with the drawing automatically.

   A shelf only becomes clickable once a project in projects.js points at its
   id (`shelf: 'bigBooksRight'`). Unused shelves stay invisible and inert.

   Want to nudge / reshape / add a shelf?  Open index.html?edit  (or press E),
   drag the corner points, then press "Copy layout.js" and paste it back here.
   ========================================================================== */

const SHELVES = [
  // ---- back wall, top row -------------------------------------------------
  { id: 'topLeftBooks',   points: [[635,168],[768,168],[768,272],[635,272]] },
  { id: 'topMiddleBooks', points: [[941,168],[1140,168],[1140,287],[941,287]] },
  { id: 'topStack',       points: [[1182,183],[1283,183],[1283,210],[1278,214],[1278,242],[1282,244],[1282,274],[1292,275],[1292,297],[1166,297],[1166,275],[1178,274],[1178,244],[1168,242],[1168,214],[1182,210]] },
  { id: 'topRightBooks',  points: [[1339,168],[1499,168],[1499,264],[1339,264]] },

  // ---- back wall, tall centre bookcase (rows, top to bottom) --------------
  { id: 'centerRow1', points: [[773,168],[935,168],[935,189],[773,189]] },
  { id: 'centerRow2', points: [[773,191],[935,191],[935,219],[773,219]] },
  { id: 'centerRow3', points: [[773,225],[941,225],[941,286],[773,286]] },
  { id: 'centerRow4', points: [[773,292],[941,292],[941,341],[773,341]] },
  { id: 'centerRow5', points: [[770,351],[898,351],[898,423],[770,423]] },
  { id: 'centerRow6', points: [[770,431],[898,431],[898,499],[770,499]] },
  { id: 'centerRow7', points: [[770,507],[898,507],[898,599],[770,599]] },

  // ---- back wall, big books on the left -----------------------------------
  { id: 'bigBooksLeft',  points: [[419,364],[489,364],[489,602],[419,602]] },
  { id: 'leaningBook',   points: [[619,376],[645,399],[515,600],[491,574]] },
  { id: 'globe',         points: [[568,555],[578,530],[600,522],[625,530],[632,555],[625,580],[600,590],[578,582]] },
  { id: 'bigBooksRight', points: [[643,366],[757,366],[757,600],[643,600]] },

  // ---- back wall, books beside the ladder ---------------------------------
  { id: 'ladderBooks', points: [[1385,459],[1500,461],[1500,632],[1350,630],[1350,513],[1385,513]] },

  // ---- back wall, lower shelves under the balcony -------------------------
  { id: 'lowerLeftBooks',  points: [[419,651],[517,651],[517,748],[419,748]] },
  { id: 'lowerThinBooks',  points: [[519,651],[798,651],[798,704],[519,704]] },
  { id: 'lowerDrawers',    points: [[801,651],[899,651],[899,748],[801,748]] },
  { id: 'lowerBigBooks',   points: [[901,654],[988,654],[988,748],[901,748]] },
  { id: 'lowerSmallShelf', points: [[988,651],[1056,651],[1056,748],[988,748]] },

  // ---- right wall (in perspective) ----------------------------------------
  { id: 'rightWallTop',    points: [[1518,160],[1745,4],[1920,0],[1920,66],[1518,216]] },
  { id: 'rightWallCases',  points: [[1518,228],[1562,228],[1562,407],[1518,407]] },
  { id: 'rightWallMid',    points: [[1570,323],[1920,259],[1920,396],[1570,404]] },
  { id: 'rightWallLowA',   points: [[1520,413],[1772,409],[1772,497],[1520,457]] },
  { id: 'rightWallLowB',   points: [[1787,408],[1920,405],[1920,514],[1787,504]] },
  { id: 'rightWallBigA',   points: [[1537,490],[1770,502],[1770,797],[1537,650]] },
  { id: 'rightWallBigB',   points: [[1787,507],[1920,525],[1920,892],[1787,804]] },
  { id: 'rightWallCrates', points: [[1519,662],[1650,740],[1650,900],[1520,765]] },

  // ---- books lying on the floor -------------------------------------------
  { id: 'floorOpenBook',   points: [[403,855],[427,822],[460,812],[500,823],[480,853],[447,858]] },
  { id: 'floorStackLeft',  points: [[487,855],[558,850],[553,880],[537,903],[537,927],[593,933],[593,957],[572,1020],[480,1020],[480,1003],[460,1017],[393,1017],[393,993],[423,950],[422,923],[447,900],[463,873]] },
  { id: 'floorStackRight', points: [[1462,942],[1570,941],[1600,974],[1601,1036],[1582,1037],[1582,1065],[1507,1067],[1495,1038],[1484,1036],[1462,999]] },

  // ---- the small flag/rug icon above the "Animations" label ---------------
  // Not a project shelf — this one is wired up to the language toggle
  // instead (see index.html). Hovering it shows the word "language" in the
  // language you're currently viewing the site in; clicking cycles languages.
  { id: 'languageToggle', points: [[575,770],[733,762],[744,796],[706,833],[579,823]] },
];
