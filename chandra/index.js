
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

// AFRAME.registerComponent('mythreejsthing', {
//   schema: {
//     color: {
//       default: '#F00'
//     },
//   },

//   init: function() {
//     this.update.bind(this);
//     console.log("here is some mythreejsthing data", this.data);

//     var this.particleGroup = new SPE.Group({
//       texture: {
//         value: THREE.ImageUtils.loadTexture('./img/smokeparticle.png')
//       }
//     });

//     // General distributions.
//     for( var i = 1; i < 4; ++i ) {
//       var emitter = new SPE.Emitter({
//         type: i,
//         maxAge: {
//           value: 1
//         },
//         position: {
//           value: new THREE.Vector3(-50 + (i * 25), 40, 0),
//           radius: 5,
//           spread: new THREE.Vector3( 3, 3, 3 )
//         },

//         color: {
//           value: [ new THREE.Color('white'), new THREE.Color('red') ]
//         },

//         size: {
//           value: 1
//         },
//         isStatic: true,
//         particleCount: 250
//       });

//       this.particleGroup.addEmitter( emitter );
//     }
//   },

//   update: function() {
//     var material = new THREE.MeshBasicMaterial({
//       color: this.data.color,
//       wireframe: true
//     });

//     var geometry = new THREE.BoxGeometry(10, 10, 10);

//     this.el.setObject3D('mesh', new THREE.Mesh(geometry, material));
//   },

//   remove: function() {
//     this.el.removeObject3D('mesh');
//   }
// });


// This is a solution to provide a second side of the model for the
// Chandra object.  This is not a general solution because I obviously
// don't really understand the structure of these objects.
AFRAME.registerComponent('two-sides', {
  schema: {default: 1.0},
  init: function () {
    this.el.addEventListener('model-loaded', function (e) {
      console.log("this is what the cat dragged in:", e);
      // The children indices here were determined by examining the e argument
      // logged in the previous line and looking for the object with
      // lots of different materials.  Yes, this is an unforgivable hack.
      var mesh = e.target.object3D.children[9].children[4];
      var data = this.data;
      if (!mesh) {
        console.log("Sorry, not a mesh:");
        return;
      }
      mesh.traverse(function (node) {
        console.log("here's a child:", node, node.isMesh);
        if (node.isMesh) {
          node.material.side = THREE.DoubleSide;
          node.material.opacity = 0.98;


          // Inside a gltf file, the material is apparently an array
          // of materials.
          // if (Array.isArray(node.material)) {
          //   len = node.material.length;
          //   for (i = 0; i < len; i++) {
          //     node.material[i].side = THREE.DoubleSide;
          //   }
          // } else {
          //   node.material.side = THREE.DoubleSide;
          // }
        }
      });
      // Now do the same for the mirror.  Again, an unforgivable hack.
      var mesh = e.target.object3D.children[9].children[5];
      if (!mesh) {
        console.log("Sorry, not a mesh:");
        return;
      }
      mesh.traverse(function (node) {
        console.log("here's a child:", node, node.isMesh);
        if (node.isMesh) {
          node.material.side = THREE.DoubleSide;
        }
      });
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
  } else {
    console.log("??+++++++ oops, mesh", mesh, colorData);
  }

  mesh.traverse(function(node) {
    if (node.isMesh) {
      console.log("*** this is the material:", node.material);
      if (Array.isArray(node.material)) {
        len = node.material.length;
        for (i = 0; i < len; i++) {
          node.material[i].color = colors;
          node.material[i].flatShading = true;
        }
      } else {
        node.material.color = colors;
        node.material.flatShading = true;
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
      console.log("model loaded..................", event, "\n");
      setMeshColor(event.target.getObject3D('mesh'), colorData);
    });
  },
  update: function() {
    // Accepts an object (mesh) and a string with three numbers (0-1)
    // in it, and sets the color of the given asset accordingly.

    var colorData = this.data;
    console.log("update************", colorData, "\n");
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
  tour1a:{dur: "1000",
         next: "tour1b",
         audio: "",
         playWhile: false,
         text: "X rays are too energetic to bounce off mirrors, except when they just skim the surface. \nChandra's iridium mirrors are shaped like \nfunnels to focus X rays on the detector.",
         noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0.2, y: -0.25, z: -1},
         textRotate: {x: -10, y: -30, z: 0}
        },
  tour1b:{dur: "1000",
         next: "tour1c",
         audio: "",
         playWhile: false,
         text: "Chandra uses a cameras and spectrometers to analyze the X-rays coming from deep space.",
         noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0, y: 0, z: -1},
         textRotate: {x: 0, y: 90, z: 0}
        },
  tour1c:{dur: "1000",
         next: "tour1d",
         audio: "",
         playWhile: false,
         text: "Chandra's solar collectors are used to power the telescope's detectors and its radio contact with the earth.  The electricity is also used to provide heat to the mirrors to keep them from deforming from the cold temperatures of space.",
         noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0, y: -0.5, z: -1},
         textRotate: {x: 0, y: 0, z: 0}
        },
  tour1d:{dur: "1000",
         next: "tour1e",
         audio: "",
         playWhile: false,
         text: "Chandra's thrusters are used to control the spacecraft's orbit, and also to help stabilize the telescope after it has been aimed at a new location.  Chandra aims with high-precision gyroscopes.",
         noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0, y: -0.5, z: -1},
         textRotate: {x: 0, y: 0, z: 0}
        },
  tour1e:{dur: "1000",
         next: "tour1f",
         audio: "",
         playWhile: false,
         text: "Chandra communicates with earth via NASA's Deep Space Network, made up of listening stations all over the world.  Once on earth, the data makes its way to the Chandra X-Ray Center, in Cambridge, Massachusetts.",
          noClickText: "Chandra here!.",
         pause: 6000,
         textOffset: {x: 0, y: -0.5, z: -1},
         textRotate: {x: 0, y: 0, z: 0}
        },
  tour1f:{dur: "1000",
         next: "tour1a",
         audio: "",
         playWhile: false,
         text: "",
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

AFRAME.registerComponent('rept', {
  schema: {
    N: {type: 'vec3', default: {x: 4, y: 4, z: 4}},
    d: {type: 'vec3', default: {x: 1, y: 1, z: 1}},
  },

  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this));
  },

  update: function () {
    var mesh = this.el.getObject3D('mesh');

    var cloneMesh = this.el.getOrCreateObject3D('clones', THREE.Group);

    var parent = new THREE.Object3D();

    parent.add(mesh);

    console.log(this.data.N.x, "---", this.data.N.y, "---", this.data.N.z);
    for (i = 0; i < this.data.N.x; i++) {
      for (j = 0; j < this.data.N.y; j++) {
        for (k = 0; k < this.data.N.z; k++) {

          var child = parent.clone(true);

          child.position.copy(mesh.position);
          child.position.set(i * this.data.d.x,
                             j * this.data.d.y,
                             k * this.data.d.z);

          child.children[0].material = parent.children[0].material.clone();

          child.children[0].material.color.r +=
            (1 - child.children[0].material.color.r) * i * 1/this.data.N.x;
          child.children[0].material.color.g +=
            (1 - child.children[0].material.color.g) * j * 1/this.data.N.y;
          child.children[0].material.color.b +=
            (1 - child.children[0].material.color.b) * k * 1/this.data.N.z;


          cloneMesh.add(child);
        }
      }
    }

  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  }
});


// AFRAME.registerComponent('clone-along-curve', {


//     update: function () {
//         this.remove();


//         if (!this.el.getObject3D('clones') && this.curve && this.curve.curve) {

//             var length = this.curve.curve.getLength();
//             var start = 0;
//             var counter = start;

//             var cloneMesh = this.el.getOrCreateObject3D('clones', THREE.Group);

//             var parent = new THREE.Object3D();
//             mesh.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z);
//             mesh.rotation.set(degToRad(this.data.rotation.x), degToRad(this.data.rotation.y), degToRad(this.data.rotation.z));
//             mesh.rotation.order = 'YXZ';

//             parent.add(mesh);

//             while (counter <= length) {
//                 var child = parent.clone(true);

//                 child.position.copy(this.curve.curve.getPointAt(counter / length));

//                 tangent = this.curve.curve.getTangentAt(counter / length).normalize();

//                 child.quaternion.setFromUnitVectors(zAxis, tangent);

//                 cloneMesh.add(child);

//                 counter += this.data.spacing;
//             }
//         }
//     },

//     remove: function () {
//         this.curve = null;
//         if (this.el.getObject3D('clones')) {
//             this.el.removeObject3D('clones');
//         }
//     }

// });
