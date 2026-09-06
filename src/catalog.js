/* Original copy and schematic illustrations. External references open on request. */
(function(root) {
  const general = 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046031';
  const exercise = (name,group,equipment,pose,steps,mistakes,extra={}) => ({name,group,equipment,pose,steps,mistakes,unit:'reps',rest:90,range:[8,12],source:general,sourceLabel:'Mayo Clinic · technique video library',...extra});
  const EXERCISES = {
    squat: exercise('Bodyweight squat','Legs',[],'squat',[
      'Stand with feet about shoulder-width apart. Brace your middle and keep your whole foot on the floor.',
      'Bend your knees and hips together. Sit down between your feet, as low as you can control comfortably.',
      'Push through the whole foot to stand. Finish tall and repeat without bouncing.'
    ],'Avoid heels lifting, knees collapsing inward, or forcing a depth you cannot control.',{range:[10,15],rest:75}),
    pushup: exercise('Incline push-up','Chest',['bench'],'pushup',[
      'Secure the bench against movement. Place hands just outside shoulder-width and walk your feet back into a straight body line.',
      'Bend your elbows back at a comfortable angle and lower your chest toward the bench. Keep hips in line with shoulders.',
      'Press the bench away and return to straight arms. Exhale as you press; keep the movement controlled.'
    ],'Avoid sagging hips, shrugging shoulders, or letting your elbows flare directly sideways.',{solo:'Use a wall instead if the bench moves or the incline is too difficult.'}),
    row: exercise('Barbell row','Back',['barbell'],'row',[
      'Use an overhand grip and a light load. Hinge at the hips with softly bent knees and a steady, neutral back.',
      'Pull toward your lower ribs with elbows moving behind you. Keep your torso still.',
      'Lower until your arms straighten under control. Reset your brace before the next rep.'
    ],'Avoid jerking your torso upright or rounding your lower back.',{source:'https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/',sourceLabel:'ACE · barbell row guide',rest:120}),
    bbrdl: exercise('Romanian deadlift','Legs',['barbell'],'bbrdl',[
      'Begin standing with the bar in front of your thighs. Set your brace and soften your knees. Use a load you can safely bring to this position.',
      'Send your hips backward while keeping the bar close. Stop at your controlled hamstring stretch; reaching the floor is not the goal.',
      'Drive through your feet and bring your hips forward to stand tall. Do not lean backward at the top.'
    ],'Avoid squatting the movement, reaching for the floor, or continuing as your back rounds.',{rest:120,solo:'If getting the bar to the starting position is unfamiliar, practise an unloaded hip hinge and learn the setup with a trainer first.'}),
    preach: exercise('Preacher curl','Arms',['barbell','preacher'],'preach',[
      'Adjust the pad so the backs of your upper arms stay supported. Hold a light bar with palms up and wrists comfortable.',
      'Curl the bar toward you by bending your elbows. Keep your upper arms on the pad and your torso still.',
      'Lower slowly until your elbows are nearly straight. Keep tension; do not snap into a locked elbow.'
    ],'Avoid lifting your arms off the pad, bending your wrists backward, or bouncing at the bottom.',{range:[10,15],rest:75,solo:'Check the attachment is locked in and follow its load limit. A straight bar should feel comfortable at your wrists.'}),
    legext: exercise('Leg extension','Legs',['legExtension'],'legext',[
      'Adjust the seat and roller for your bench model. Align the knee joint with the attachment pivot and place the roller just above your ankles.',
      'Hold the seat, keep your hips down, and extend your knees in a smooth arc. Stop short of snapping into lockout.',
      'Lower slowly to the starting bend. Keep the plates from crashing and repeat within a comfortable range.'
    ],'Avoid swinging the load, lifting your hips, or continuing through knee pain.',{range:[10,15],rest:75,solo:'Use the attachment manufacturer’s setup and load rating. Its leverage is different from a gym machine, so compare only your own setup.'}),
    split: exercise('Split squat','Legs',[],'split',[
      'Stand in a staggered stance with both feet on the floor. Use a stable support for balance if needed.',
      'Bend both knees and lower vertically. Keep the front foot planted and the knee tracking with your toes.',
      'Press through the front foot to rise. Complete the target reps, then switch sides.'
    ],'Avoid a tightrope stance, bouncing the back knee, or twisting your hips.',{side:true,range:[8,12]}),
    bridge: exercise('Glute bridge','Glutes',[],'bridge',[
      'Lie on your back with feet flat and knees bent. Rest your arms beside you and brace gently.',
      'Push through your feet to raise your hips until shoulders, hips, and knees form a line.',
      'Pause briefly, then lower your hips slowly. Keep your ribs down throughout.'
    ],'Avoid pushing into a large lower-back arch or driving through your neck.',{range:[10,15],rest:60}),
    plank: exercise('Forearm plank','Core',[],'plank',[
      'Place elbows under shoulders and step your feet back. Start from your knees if you need an easier version.',
      'Hold a straight line from head to heels while gently bracing your abs and glutes. Keep breathing.',
      'End the hold before your hips sag or your back arches. Lower your knees, rest, and repeat.'
    ],'Avoid holding your breath or extending the hold after you lose position.',{unit:'seconds',range:[20,40],rest:60}),
    deadbug: exercise('Dead bug','Core',[],'deadbug',[
      'Lie on your back with arms above shoulders and knees bent over hips. Gently brace your midsection.',
      'Reach one arm and the opposite leg away, only as far as you can keep your trunk still.',
      'Return smoothly and switch sides. Breathe throughout; count reps on each side.'
    ],'Avoid rushing or extending so far that your lower back arches.',{side:true,range:[6,10],rest:60}),
    calfBW: exercise('Standing calf raise','Legs',[],'calf',[
      'Stand on a level floor with feet hip-width apart. Lightly hold a stable surface for balance.',
      'Rise onto the balls of your feet without rolling your ankles outward. Pause at the top.',
      'Lower your heels slowly to the floor and repeat. Keep your knees softly extended.'
    ],'Avoid bouncing, rolling your ankles, or using an unstable object as a step.',{range:[12,20],rest:60}),
    bench: exercise('Barbell bench press','Chest',['barbell','bench','safeties'],'bench',[
      'Set rated safety arms to catch the bar while still allowing your controlled range. Test with an empty bar. Plant your feet and set your shoulder blades on the bench.',
      'Unrack with a full grip. Lower toward the lower chest with wrists above elbows and a controlled path.',
      'Press up smoothly while keeping your hips on the bench. Finish the set with clean reps remaining and rack the bar securely.'
    ],'Avoid bouncing off your chest, flaring elbows straight out, or grinding a failed rep alone.',{rest:150,solo:'A weight rack alone is not a safety system. Without properly rated and positioned safety arms, choose incline push-ups for solo sessions.',source:'https://www.acefitness.org/resources/everyone/exercise-library/5/chest-press/',sourceLabel:'ACE · chest press guide'}),
    curl: exercise('Barbell curl','Arms',['barbell'],'hammer',[
      'Stand tall holding a light bar with palms forward. Keep upper arms close to your sides and wrists steady.',
      'Bend your elbows to curl upward without leaning back.',
      'Lower the bar slowly until your arms are almost straight. Reset before repeating.'
    ],'Avoid swinging from your hips or bending your wrists to finish a rep.',{range:[10,15],rest:75,source:'https://www.acefitness.org/resources/everyone/exercise-library/70/bicep-curl/',sourceLabel:'ACE · barbell curl guide'}),
    onerow: exercise('One-arm dumbbell row','Back',['dumbbells','bench'],'onerow',[
      'Support one hand and knee on a stable bench. Keep your back neutral and let the dumbbell hang under your shoulder.',
      'Pull toward your hip while keeping your shoulders and hips level.',
      'Lower with control to a straight arm. Complete both sides with the same technique.'
    ],'Avoid rotating your torso or shrugging the weight upward.',{side:true}),
    goblet: exercise('Goblet squat','Legs',['dumbbells'],'goblet',[
      'Hold one dumbbell securely against your chest and stand about shoulder-width apart.',
      'Bend knees and hips together, lowering between your feet through a comfortable range.',
      'Push through the whole foot to stand. Keep the weight close and avoid bouncing.'
    ],'Avoid letting the weight drift forward or your heels lift.',{range:[10,15]}),
    dbrdl: exercise('Dumbbell Romanian deadlift','Legs',['dumbbells'],'dbrdl',[
      'Stand tall with one dumbbell in each hand. Soften your knees and brace your trunk.',
      'Push your hips back with the weights close to your legs. Stop at a controlled hamstring stretch.',
      'Bring your hips forward to return to standing. Keep your spine steady throughout.'
    ],'Avoid rounding your back or lowering farther than your hip mobility allows.',{rest:120}),
    lat: exercise('Dumbbell lateral raise','Shoulders',['dumbbells'],'lat',[
      'Stand with light dumbbells by your sides, elbows slightly bent and wrists neutral.',
      'Raise your arms out and slightly forward to a comfortable height up to shoulder level.',
      'Lower slowly without shrugging. Keep your torso still and repeat.'
    ],'Avoid swinging, forcing the arms above shoulder level, or rotating thumbs sharply downward.',{range:[10,15],rest:60}),
    hammer: exercise('Hammer curl','Arms',['dumbbells'],'hammer',[
      'Stand with palms facing inward and upper arms by your sides.',
      'Curl the dumbbells up without moving your elbows forward or leaning back.',
      'Lower slowly to nearly straight arms and repeat.'
    ],'Avoid swinging your hips or letting wrists bend.',{range:[10,15],rest:75}),
    pike: exercise('Pike push-up','Shoulders',[],'pike',[
      'Place your hands on the floor slightly wider than shoulders. Raise your hips into an inverted V and keep a comfortable knee bend.',
      'Bend your elbows and lower your head toward a point just ahead of your hands, only through a controlled range.',
      'Press away from the floor to return to straight arms. Keep hips raised throughout.'
    ],'Avoid dropping onto your head or forcing depth. Substitute an incline push-up if control is difficult.',{range:[6,10],solo:'This is a more demanding bodyweight movement. Practise a short range first; use incline push-ups if it feels too difficult.'})
  };
  const EXTRA_POSES = {
    squat:{a:[50,16,50,28,38,38,28,38,50,54,52,76,52,96],b:[46,34,46,46,34,46,22,46,60,65,38,78,52,96],gear:'none'},
    pushup:{a:[26,36,38,40,40,57,42,74,64,55,85,71,104,92],b:[26,52,38,55,27,67,42,74,64,65,85,79,104,92],bench:5,gear:'none'},
    split:{a:[44,17,44,29,44,43,44,57,44,55,33,76,26,96],b:[44,31,44,43,44,57,44,71,44,69,28,81,26,96],a2:[64,75,82,96],b2:[65,92,82,96],gear:'none'},
    bridge:{a:[24,82,37,84,44,91,54,94,65,89,82,64,99,94],b:[24,82,37,80,44,88,54,94,65,65,82,64,99,94],gear:'none'},
    legext:{a:[38,20,42,32,42,48,52,56,45,60,68,62,70,93],b:[38,20,42,32,42,48,52,56,45,60,68,62,98,64],bench:8,gear:'leg'},
    pike:{a:[36,48,46,43,34,68,22,94,67,30,84,62,102,94],b:[26,72,36,63,18,73,22,94,67,36,84,65,102,94],gear:'none'}
  };
  const EQUIPMENT = {barbell:'Barbell & plates',bench:'Weight bench',preacher:'Preacher attachment',legExtension:'Leg extension',dumbbells:'Dumbbells',safeties:'Rated bench safety arms'};
  const value={EXERCISES,EXTRA_POSES,EQUIPMENT};
  if(typeof module !== 'undefined') module.exports=value; else Object.assign(root,value);
})(typeof window !== 'undefined' ? window : globalThis);
