/**
 * Test manuel des segments multi-timeline
 * Exécuter dans la console du navigateur (F12) sur la page /editor/[id]
 */

console.log('=== Test Timeline Multi-Segments ===');

// 1. Vérifier l'état du store
const state = window.useEditorStore?.getState();
if (!state) {
  console.error('❌ Store non trouvé');
} else {
  console.log('✅ Store trouvé');
  console.log('Mode multi-segments:', state.isMultiSegmentMode);
  console.log('Segments:', state.segments);
  console.log('Segment sélectionné:', state.selectedSegmentId);
  console.log('Durée vidéo:', state.duration);
}

// 2. Vérifier qu'un segment initial existe
if (state?.segments?.length > 0) {
  console.log('✅ Segment initial créé:', state.segments[0]);
  console.log('  - Start:', state.segments[0].startTime);
  console.log('  - End:', state.segments[0].endTime);
  console.log('  - Deleted:', state.segments[0].isDeleted);
} else {
  console.error('❌ Aucun segment initial créé');
}

// 3. Test de la fonction cutSegmentAtTime
if (state && state.segments.length > 0) {
  console.log('\n=== Test Cut Segment ===');
  const firstSegment = state.segments[0];
  const cutTime = (firstSegment.startTime + firstSegment.endTime) / 2;

  console.log('Coupe au milieu:', cutTime);
  state.cutSegmentAtTime(firstSegment.id, cutTime);

  const newState = window.useEditorStore.getState();
  console.log('Segments après cut:', newState.segments.length);
  console.log('Détails:', newState.segments);
}

// 4. Test de la fonction deleteSegment
if (state && state.segments.length > 1) {
  console.log('\n=== Test Delete Segment ===');
  const segmentToDelete = state.segments[1];
  console.log('Suppression du segment:', segmentToDelete.id);

  state.deleteSegment(segmentToDelete.id);

  const newState = window.useEditorStore.getState();
  console.log('Segments actifs après delete:', newState.getActiveSegments().length);
}

// 5. Test de undo
if (state) {
  console.log('\n=== Test Undo ===');
  state.undo();

  const newState = window.useEditorStore.getState();
  console.log('Segments après undo:', newState.segments.length);
  console.log('Segments actifs:', newState.getActiveSegments().length);
}

console.log('\n=== Fin des tests ===');
console.log('Pour tester manuellement:');
console.log('1. Appuyer sur C pour couper au playhead');
console.log('2. Cliquer sur un segment pour le sélectionner');
console.log('3. Appuyer sur Del pour supprimer');
console.log('4. Appuyer sur Cmd+Z pour undo');
