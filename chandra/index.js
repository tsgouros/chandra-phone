
var soundList = [
  "Acceleration",
  "Infrared",
  "Iron",
  "Jets",
  "NeutronStar",
  "OuterBlastOpt",
  "OuterBlastXray"
];

var currentlyPlaying;

AFRAME.registerComponent('two-sides', {
  schema: {default: 1.0},
  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this));
  },
  update: function () {
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;
    console.log("updating mesh:", mesh, data);
    if (!mesh) {
      console.log("Sorry, not a mesh.");
      return;
    }
    mesh.traverse(function (node) {
      if (node.isMesh) {

        // Inside a gltf file, the material is apparently an array of materials.
        len = node.material.length;
        for (i = 0; i < len; i++) {
          node.material[i].side = THREE.DoubleSide;
        }
      }
    });
  }
});

/* This needs to have a "set-color" method created to take a color and apply it,
   and then the init() and update() functions can use that. There must be some
   javascript way to parseFloat() an array of strings into an array of floats,
   look into it. */

setMeshColor = function(mesh, colorData) {
  // Accepts a mesh and a color.  Checks to see if the mesh is really a mesh.
  // The color can be specified as a string (e.g. "0.3 0.2 0.1") or as an
  // array (e.g. [0.3,0.2,0.1]) or an object (e.g. {r: 0.3, g: 0.2, b: 0.1})

  var colors;
  if (typeof(colorData) == 'string') {
    var colorArray = colorData.split(" ").map(Number);
    colors = {r: colorArray[0], g: colorArray[1], b: colorArray[2] };
  } else if (Array.isArray(colorData)) {
    colors = {r: colorData[0], g: colorData[1], b: colorData[2] };
  } else {
    colors = colorData;
  }

  if (!mesh) {
    console.log("********* oops, no mesh", mesh, colorData);
    return;
  }

  mesh.traverse(function(node) {
    if (node.isMesh) {
      len = node.material.length;
      for (i = 0; i < len; i++) {
        node.material[i].color = colors;
      }
    }
  });
};

//AFRAME.registerComponent('gltf-bothsides', {
//  schema: {default: true},
//  init:


AFRAME.registerComponent('gltf-color', {
  schema: {default: {r: 0.5, g: 0.5, b: 0.6}},
  init: function() {

    // Retrieve colors. If they are specified with the gltf-color attribute,
    // they arrive here as a string such as '0.1 0.2 0.3'. Otherwise, they arrive
    // as the default value specifed in the schema attribute above.
    var colorData = this.data;

    // Listen for the model-loaded event, then adjust the color of the object.
    this.el.addEventListener('model-loaded', function(event) {
      setMeshColor(event.target.getObject3D('mesh'), colorData);
    });
  },
  update: function() {
    // Accepts an object (mesh) and a string with three numbers (0-1)
    // in it, and sets the color of the given asset accordingly.

    var colorData = this.data;
    setMeshColor(this.el.getObject3D('mesh'), colorData);
  }
});


// Here is the tour on which our users will go.  Each key in this object
// corresponds to the id of an a-curve object in the html.  Together they
// make up a linked list, with each entry identifying its curve and also
// pointing to the next curve in the list.
//
// Components of a tour segment:
//    dur -       The duration (milliseconds) of the flight time.
//    next -      The name (id) of the next curve segment on the tour.
//    audio -     Audio that is to be played *at the end* of the tour segment.
//    pause -     Time to pause at the end, *if no audio*.
//    playWhile - If true, we can start the next tour segment while the audio
//                is playing.  Note that you probably won't be able to read the
//                text in that case unless you're moving slowly.
//    text -      Text that will appear *at the end* of the tour segment.
//    noClickText Text appears if the user cannot click.
//    textOffset- The location where the text is to appear, relative to the
//                camera position.
//    textRotate- The euler angles of the text location.
var tour = {
  // This segment is junk, just testing.
  tour1:{dur: "1000",
         next: "tour1",
         audio: "",
         playWhile: false,
         text: "Hi there!",
         noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0, y: -0.5, z: -1},
         textRotate: {x: 0, y: 0, z: 0}
        },
};


AFRAME.registerComponent('alongpathevent', {
  schema: {default: 1.0},
  init: function() {
    this.update.bind(this);

    // Are we viewing on a platform where we can't really click, or a
    // desktop where we can?
    var canClick = !AFRAME.utils.device.isMobile();
    //console.log("isMobile()?:", AFRAME.utils.device.isMobile());
    //canClick = false;

    // Moves us onto the next path on the tour and begins playing.
    var advanceTourSegment = function() {

      // Get the alongpath attribute from the camera entity.
      var el = document.getElementById("mainCamera");
      var alongpath = el.getAttribute("alongpath");

      // What path are we on (without the '#')?
      var currentPath = alongpath.curve.substring(1);
      var nextPath = tour[currentPath].next;

      // Change the curve, and restart the animation to follow the new
      // curve.  The setAttribute function restarts the animation in
      // some way that simply modifying alongpath.curve does not.
      el.setAttribute("alongpath",
                      "curve: #" + nextPath +
                      "; dur: " + tour[nextPath].dur + ";");
    };

    var clickHandler = function(event) {

      // First, stop listening for this event.  We'll start listening
      // again after the next segment is completed.
      document.getElementById('mainScene')
        .removeEventListener('click', clickHandler);

      // Advance to the next part of the tour.
      advanceTourSegment();

      // Listen for the end of the next segment of the tour.
      document.getElementById("mainCamera")
        .addEventListener('movingended', moveEndHandler);
    };

    var moveEndHandler = function(event) {

      // Find the name of the path we just finished.
      var mainCamera = document.getElementById("mainCamera");
      var currentPath = mainCamera.getAttribute("alongpath").curve.substring(1)

      // Display the text for the (end of the) path.
      var textHolder = document.getElementById("textHolder");

      // Determine what text to show.  Note that if clicking is not
      // possible, there might be alternate text to display.
      var textVal = textHolder.getAttribute("text");
      textVal.value = tour[currentPath].text;
      if (!canClick && tour[currentPath].noClickText) {
        textVal.value = tour[currentPath].noClickText;
      };
      textHolder.setAttribute("text", textVal);

      // Now we determine where to display the text.
      var pos = mainCamera.getAttribute("position");
      var textPos = textHolder.getAttribute("position");
      offset = tour[currentPath].textOffset;
      textPos = {x: pos.x + offset.x,
                 y: pos.y + offset.y,
                 z: pos.z + offset.z};
      var textRot = tour[currentPath].textRotate;
      textHolder.setAttribute("position", textPos);
      textHolder.setAttribute("rotation", textRot);

      // Play the audio for the (end of the) path.
      var sound = document.getElementById(tour[currentPath].audio);

      // If there is sound currently playing, stop it.
      if (currentlyPlaying) {
        currentlyPlaying.pause();
      };

      var mainScene = document.getElementById('mainScene');

      // If there is sound, play it and set the "currently playing" pointer.
      if (sound) {
        sound.play();
        currentlyPlaying = sound;

        // Here's the listener for the end-of-sound event.
        var endedListener = function(event) {

          // If we can't click, pretend we did.
          if (!canClick) {
            clickHandler(null);
          };

          // Remove this listener.
          sound.removeEventListener("ended", endedListener);
        };

        // Set a listener for the end of the audio.
        sound.addEventListener("ended", endedListener);

        // If we can click, listen for it. If we can't, the endedListener
        // will take care of things.
        if (canClick) {
          mainScene.addEventListener('click', clickHandler);
        };

        // If it's ok to hear the sound while moving, advance the tour.
        if (tour[currentPath].playWhile) {
          advanceTourSegment();
        };

      } else {

        // There is no sound to play.  If we can click, listen for one.
        if (canClick) {
          if (tour[currentPath].playWhile) advanceTourSegment();
          mainScene.addEventListener('click', clickHandler);
        } else {
          // If we can't click, pause (if a pause is specified), then click.
          var pause = 1000;
          if (tour[currentPath].pause) pause = tour[currentPath].pause;
          setTimeout(clickHandler, pause);

        }
      };
    }

    this.el.addEventListener('movingended', moveEndHandler);

    // There isn't anything we need to do at the start of motion, but
    // if there is/was, it should be done in this function.
    // var startListener = function(event) {
    //   document.getElementById("mainCamera")
    //     .removeEventListener('movingstarted', startListener);
    // };
    // this.el.addEventListener('movingstarted', startListener);

  },

  update: function() {
    console.log("update called of alongpathevent!");
  }
});
