
(function(modelEl) {
  if (!window['AFRAME'] && !modelEl) {
    return;
  }

  modelEl.addEventListener('model-loaded', function(evt) {
    var model = evt.detail.model;

    traverse(model);
  });
})(document.getElementById('chandra'));

function traverse(node) {
  node.children.forEach(function(child) {
    if (child.children) {
      traverse(child);
    }

    updateMaterial(child['material'], THREE.DoubleSide);
  });
}

function updateMaterialSide(material, side) {
  if (!material) {
    return;
  }

  if (material instanceof THREE.Material) {
    material.side = side;
    material.needsUpdate = true
  } else if (material instanceof THREE.MultiMaterial) {
    material.materials.forEach(function(childMaterial) {
      updateMaterial(childMaterial, side);
    });
  }
}
