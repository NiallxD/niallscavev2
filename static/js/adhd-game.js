// §1 CONSTANTS & GAME DATA
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const C = {
  BG: '#0a0a0a',
  PRIMARY: '#39ff14',
  PRIMARY_DIM: 'rgba(57,255,20,0.6)',
  PRIMARY_FAINT: 'rgba(57,255,20,0.08)',
  AMBER: '#ffb000',
  AMBER_DIM: 'rgba(255,176,0,0.7)',
  RED: '#ff3131',
  BORDER: 'rgba(57,255,20,0.3)',
};

const PHYSICS = {
  DRIFT_STRENGTH: 1.5,
  BASE_REPULSION: 6000,
  ATTRACT_BASE: 2800,
  SNAP_THRESHOLD: 20,
  DECAY_TIME_BASE: 8000,
  TASK_DRIFT_IN_BOX: 0.32,
  SPAWN_INTERVAL_BASE: 22000,
  DAMPING: 0.88,
  BOX_BASE_W: 620,
  BOX_BASE_H: 420,
  GAME_TIME_MULT: 60,
};

const morningTasks = [
  { id: 'brush_teeth', label: 'BRUSH TEETH', duration: 25, urgency: 'daily', reward: 8, interest: 0.1, initiationCost: 0.95, canHyperfocus: false, isExclusive: true },
  { id: 'shower', label: 'SHOWER', duration: 55, urgency: 'daily', reward: 14, interest: 0.15, initiationCost: 0.85, canHyperfocus: false, isExclusive: true },
  { id: 'eat_breakfast', label: 'EAT BREAKFAST', duration: 80, urgency: 'health', reward: 16, interest: 0.3, initiationCost: 0.7, canHyperfocus: false },
  { id: 'bins_out', label: 'PUT BINS OUT', duration: 55, urgency: 'weekly', reward: 7, interest: 0.05, initiationCost: 0.98, canHyperfocus: false },
  { id: 'meet_volunteer', label: 'MEET NEW VOLUNTEER', duration: 90, canHyperfocus: true, hyperfocusProbability: 0.55, urgency: 'medium', reward: 30, interest: 0.6, initiationCost: 0.4,
    conversationEvent: true,
    conversationData: {
      npcName: 'Jamie Reeves',
      text: "Hi, I'm Jamie Reeves. Really glad to be joining. Quick thing — I mentioned in my signup that I'm better reached by email than phone, and my preferred name in any comms is Jamie. Looking forward to working with you!",
      keyWords: ['Jamie', 'Reeves', 'email', 'preferred'],
      wrongNames: ['James Reid', 'Jake Rivers', 'Jordan Reed', 'Jamie Ross', 'Jay Richards'],
      subtaskId: 'email_volunteer',
      memoryFadeMultiplier: 2.5,
    }
  },
  { id: 'email_volunteer', label: 'EMAIL NEW VOLUNTEER', duration: 35, urgency: 'medium', reward: 10, interest: 0.2, initiationCost: 0.75, lockedUntil: 'meet_volunteer', canHyperfocus: false },
  { id: 'hang_keys', label: 'HANG UP CAR KEYS', duration: 12, urgency: 'low', reward: 5, interest: 0.05, initiationCost: 0.9, canHyperfocus: false,
    locationEvent: true, itemId: 'car_keys', intendedLocation: 'hook by door', failureWindow: 0.85, subtaskId: 'tell_partner_keys'
  },
  { id: 'tell_partner_keys', label: 'TELL PARTNER: KEYS', duration: 12, urgency: 'low', reward: 4, interest: 0.1, initiationCost: 0.6, lockedUntil: 'hang_keys', canHyperfocus: false },
  { id: 'empty_dishwash', label: 'EMPTY DISHWASHER', duration: 65, urgency: 'daily', reward: 7, interest: 0.1, initiationCost: 0.88, canHyperfocus: false },
  { id: 'take_meds', label: 'TAKE MEDICATION', duration: 8, urgency: 'critical', reward: 30, interest: 0.2, initiationCost: 0.6, canHyperfocus: false, isExclusive: true },
  { id: 'order_shopping', label: 'ORDER SHOPPING', duration: 120, urgency: 'medium', reward: 12, interest: 0.35, initiationCost: 0.8, canHyperfocus: true, hyperfocusProbability: 0.7 },
  { id: 'make_bed', label: 'MAKE BED', duration: 35, urgency: 'low', reward: 6, interest: 0.1, initiationCost: 0.92, canHyperfocus: false },
  { id: 'feed_cat', label: 'FEED THE CAT', duration: 20, urgency: 'daily', reward: 9, interest: 0.2, initiationCost: 0.75, canHyperfocus: false },
  { id: 'water_plants', label: 'WATER HOUSEPLANTS', duration: 40, urgency: 'weekly', reward: 8, interest: 0.15, initiationCost: 0.88, canHyperfocus: false },
  { id: 'make_coffee', label: 'BREW COFFEE', duration: 30, urgency: 'daily', reward: 15, interest: 0.5, initiationCost: 0.5, canHyperfocus: true, hyperfocusProbability: 0.25 },
  { id: 'unpack_backpack', label: 'UNPACK BACKPACK', duration: 35, urgency: 'daily', reward: 6, interest: 0.1, initiationCost: 0.9, canHyperfocus: false },
  { id: 'sort_washing', label: 'SORT WASHING', duration: 45, urgency: 'weekly', reward: 8, interest: 0.08, initiationCost: 0.94, canHyperfocus: false },
  { id: 'clean_bathroom', label: 'CLEAN BATHROOM', duration: 100, urgency: 'weekly', reward: 18, interest: 0.05, initiationCost: 0.97, canHyperfocus: false, isExclusive: true },
  { id: 'tidy_kitchen', label: 'TIDY KITCHEN', duration: 70, urgency: 'daily', reward: 12, interest: 0.12, initiationCost: 0.88, canHyperfocus: true, hyperfocusProbability: 0.4 },
  { id: 'feed_dog', label: 'FEED THE DOG', duration: 25, urgency: 'daily', reward: 9, interest: 0.25, initiationCost: 0.72, canHyperfocus: false },
  { id: 'take_out_recycling', label: 'SORT RECYCLING', duration: 40, urgency: 'weekly', reward: 7, interest: 0.08, initiationCost: 0.93, canHyperfocus: false },
  { id: 'prep_lunch', label: 'PREP WORK LUNCH', duration: 60, urgency: 'daily', reward: 12, interest: 0.35, initiationCost: 0.82, canHyperfocus: false },
  { id: 'check_calendar', label: 'CHECK CALENDAR', duration: 15, urgency: 'daily', reward: 10, interest: 0.45, initiationCost: 0.65, canHyperfocus: true, hyperfocusProbability: 0.35 },
  { id: 'put_on_shoes', label: 'FIND & PUT ON SHOES', duration: 20, urgency: 'daily', reward: 8, interest: 0.1, initiationCost: 0.85, canHyperfocus: false, isExclusive: true },
  { id: 'reply_to_landlord', label: 'REPLY TO LANDLORD', duration: 45, urgency: 'medium', reward: 15, interest: 0.15, initiationCost: 0.95, canHyperfocus: false },
  { id: 'research_special_interest', label: 'RESEARCH SPECIAL INTEREST', duration: 140, urgency: 'low', reward: 25, interest: 0.95, initiationCost: 0.1, canHyperfocus: true, hyperfocusProbability: 0.9 },
  { id: 'wash_dishes', label: 'WASH CRUSTY DISHES', duration: 75, urgency: 'daily', reward: 9, interest: 0.05, initiationCost: 0.96, canHyperfocus: false },
  { id: 'plan_day', label: "PLAN TODAY'S SCHEDULE", duration: 40, urgency: 'medium', reward: 15, interest: 0.3, initiationCost: 0.8, canHyperfocus: true, hyperfocusProbability: 0.4 },
  { id: 'fold_laundry', label: 'FOLD THE FLOORDROBE', duration: 80, urgency: 'weekly', reward: 8, interest: 0.08, initiationCost: 0.97, canHyperfocus: false },
  { id: 'find_wallet', label: 'FIND WALLET & KEYS', duration: 30, urgency: 'critical', reward: 12, interest: 0.1, initiationCost: 0.85, canHyperfocus: false, isExclusive: true },
  { id: 'pay_utility_bill', label: 'PAY POWER BILL', duration: 25, urgency: 'critical', reward: 18, interest: 0.1, initiationCost: 0.9, canHyperfocus: false },
];

const intrusiveThoughtPool = [
  { label: '~ that email from 3 years ago ~', stickiness: 0.7, rewarding: false },
  { label: '~ what if i left the oven on ~', stickiness: 0.8, rewarding: false },
  { label: '~ that song stuck in my head ~', stickiness: 0.6, rewarding: false },
  { label: '~ i should reorganise my files ~', stickiness: 0.75, rewarding: true },
  { label: '~ check social media real quick ~', stickiness: 0.9, rewarding: true },
  { label: '~ what will i have for lunch ~', stickiness: 0.5, rewarding: false },
  { label: '~ did i reply to that message ~', stickiness: 0.65, rewarding: false },
  { label: '~ i should learn guitar someday ~', stickiness: 0.4, rewarding: true },
  { label: '~ that awkward thing i said in 2017 ~', stickiness: 0.85, rewarding: false },
  { label: '~ look up that random fact ~', stickiness: 0.7, rewarding: true },
  { label: '~ what does my horoscope say ~', stickiness: 0.6, rewarding: true },
  { label: '~ i need to call my parents ~', stickiness: 0.55, rewarding: false },
  { label: "~ ooh, what's that bird on the feeder? ~", stickiness: 0.85, rewarding: true },
  { label: '~ need to clean the keyboard with a toothpick ~', stickiness: 0.9, rewarding: true },
  { label: '~ check the fridge for the 4th time ~', stickiness: 0.7, rewarding: false },
  { label: '~ did i leave the window open in the rain? ~', stickiness: 0.78, rewarding: false },
  { label: '~ look up the lifespan of a squirrel ~', stickiness: 0.8, rewarding: true },
  { label: '~ maybe i should paint a mural here ~', stickiness: 0.82, rewarding: true },
  { label: '~ check the tracking for my parcel ~', stickiness: 0.88, rewarding: true },
  { label: '~ did i pay the electricity bill? ~', stickiness: 0.85, rewarding: false },
  { label: '~ what if humans had wings ~', stickiness: 0.72, rewarding: true },
  { label: '~ read the wikipedia page for obsidian ~', stickiness: 0.9, rewarding: true },
  { label: '~ is that a spider on the ceiling? ~', stickiness: 0.78, rewarding: false },
  { label: '~ that strange noise from the radiator ~', stickiness: 0.65, rewarding: false },
  { label: '~ i should build a custom shelf ~', stickiness: 0.85, rewarding: true },
  { label: '~ is my plant dying or overwatered ~', stickiness: 0.65, rewarding: false },
  { label: '~ read the entire history of forks ~', stickiness: 0.9, rewarding: true },
  { label: '~ what if i started a podcast ~', stickiness: 0.8, rewarding: true },
  { label: '~ clean the window tracks with a brush ~', stickiness: 0.85, rewarding: true },
  { label: '~ did i lock the back door ~', stickiness: 0.75, rewarding: false },
  { label: '~ check if the dog is breathing ~', stickiness: 0.7, rewarding: false },
  { label: '~ how does a locks mechanism work ~', stickiness: 0.8, rewarding: true },
  { label: '~ reorganise bookshelf by colour ~', stickiness: 0.9, rewarding: true },
  { label: '~ what was that actor in... ~', stickiness: 0.75, rewarding: true },
];

const URGENCY_COLORS = {
  critical: '#ff3131',
  health: '#ff8c00',
  daily: '#39ff14',
  weekly: '#00cfff',
  medium: '#39ff14',
  low: 'rgba(57,255,20,0.5)',
};

const STATUS_ICONS = {
  pending: '✗',
  active: '→',
  complete: '✓',
  abandoned: '~',
  forgotten: '?',
};

// Things that nag at the back of the mind during hyperfocus — spawned urgent on exit
const HYPERFOCUS_NAGGING = [
  { id: 'nag_toilet',  label: 'NEED THE TOILET',      duration: 8,  urgency: 'critical', reward: 2, interest: 0.1, initiationCost: 0.05, isBodyTask: true, bodyKey: 'bladder', meterRestore: 80 },
  { id: 'nag_call',    label: 'CALL MUM BACK',         duration: 25, urgency: 'medium',   reward: 8, interest: 0.4, initiationCost: 0.55 },
  { id: 'nag_dishes',  label: 'WASH THE DISHES',       duration: 35, urgency: 'daily',    reward: 5, interest: 0.1, initiationCost: 0.88 },
  { id: 'nag_locked',  label: 'DID YOU LOCK UP?',      duration: 8,  urgency: 'critical', reward: 3, interest: 0.2, initiationCost: 0.25 },
  { id: 'nag_laundry', label: 'PUT LAUNDRY ON',        duration: 12, urgency: 'weekly',   reward: 5, interest: 0.1, initiationCost: 0.9 },
  { id: 'nag_reply',   label: 'REPLY TO THAT TEXT',    duration: 10, urgency: 'medium',   reward: 6, interest: 0.3, initiationCost: 0.5 },
  { id: 'nag_water',   label: 'HAVE YOU DRUNK WATER?', duration: 5,  urgency: 'health',   reward: 4, interest: 0.2, initiationCost: 0.1, isBodyTask: true, bodyKey: 'thirst', meterRestore: 70 },
  { id: 'nag_thirst_critical', label: 'MOUTH IS LIKE SAND', duration: 6, urgency: 'critical', reward: 3, interest: 0.1, initiationCost: 0.05, isBodyTask: true, bodyKey: 'thirst', meterRestore: 80 },
  { id: 'nag_hungry_growl', label: 'STOMACH IS GROWLING', duration: 15, urgency: 'health', reward: 5, interest: 0.2, initiationCost: 0.1, isBodyTask: true, bodyKey: 'hunger', meterRestore: 80 },
  { id: 'nag_posture', label: 'FIX SLOUCHED POSTURE', duration: 5, urgency: 'low', reward: 4, interest: 0.15, initiationCost: 0.3 },
  { id: 'nag_feet_cold', label: 'MY FEET ARE FREEZING', duration: 10, urgency: 'low', reward: 3, interest: 0.1, initiationCost: 0.4 },
  { id: 'nag_stove', label: 'DID I SHUT THE STOVE?', duration: 8, urgency: 'critical', reward: 5, interest: 0.1, initiationCost: 0.15 },
  { id: 'nag_car_window', label: 'CAR WINDOW LEFT OPEN?', duration: 12, urgency: 'critical', reward: 6, interest: 0.15, initiationCost: 0.2 },
];

const BODY_TASKS = {
  bladder: { id: 'body_task_bladder', label: 'USE BATHROOM', duration: 8,  urgency: 'critical', reward: 4, interest: 0.2, initiationCost: 0.1, isBodyTask: true, bodyKey: 'bladder', meterRestore: 92 },
  hunger:  { id: 'body_task_hunger',  label: 'EAT SOMETHING', duration: 18, urgency: 'health',  reward: 6, interest: 0.4, initiationCost: 0.2, isBodyTask: true, bodyKey: 'hunger',  meterRestore: 85 },
  thirst:  { id: 'body_task_thirst',  label: 'DRINK WATER',   duration: 5,  urgency: 'health',  reward: 4, interest: 0.2, initiationCost: 0.1, isBodyTask: true, bodyKey: 'thirst',  meterRestore: 88 },
  fatigue: { id: 'body_task_fatigue', label: 'REST / SIT DOWN', duration: 22, urgency: 'health', reward: 8, interest: 0.5, initiationCost: 0.1, isBodyTask: true, bodyKey: 'fatigue', meterRestore: 72 },
};

const LOCATION_OPTIONS = ['By the door', 'On the counter', 'In your coat', 'On the desk'];
const SEARCH_GRID_LABELS = [
  'Kitchen counter', 'Kitchen table', 'Kitchen drawer', 'Living room sofa',
  'Living room shelf', 'Living room floor', 'Hallway hook', 'Hallway table',
  'Bedroom dresser', 'Bedroom floor', 'Bathroom shelf', 'Coat pocket',
];

function pickSessionTasks() {
  const mandatory = ['meet_volunteer', 'hang_keys', 'take_meds'];
  const optional = [
    'brush_teeth', 'shower', 'eat_breakfast', 'bins_out', 'empty_dishwash', 
    'order_shopping', 'make_bed', 'feed_cat', 'water_plants', 'make_coffee', 
    'unpack_backpack', 'sort_washing', 'clean_bathroom', 'tidy_kitchen',
    'feed_dog', 'take_out_recycling', 'prep_lunch', 'check_calendar',
    'put_on_shoes', 'reply_to_landlord',
    'research_special_interest', 'wash_dishes', 'plan_day', 'fold_laundry',
    'find_wallet', 'pay_utility_bill'
  ];
  const shuffled = [...optional].sort(() => Math.random() - 0.5);
  // Pick 7 optional tasks to provide a slightly more varied experience with the larger pool
  const chosen = mandatory.concat(shuffled.slice(0, 7));
  return morningTasks.filter(t => chosen.includes(t.id));
}

// §2 PHYSICS UTILITIES
// ═══════════════════════════════════════════════════════════════

function computeBoxSize(profile, drive) {
  let w = PHYSICS.BOX_BASE_W * (0.6 + profile.focusLevel * 0.8);
  let h = PHYSICS.BOX_BASE_H * (0.6 + profile.focusLevel * 0.8);
  if (profile.medicated) { w *= 1.3; h *= 1.3; }
  if (drive < 30) { w *= 0.85; h *= 0.85; }
  if (drive > 80) { w *= 1.12; h *= 1.12; }
  return { w: Math.round(w), h: Math.round(h) };
}

function spawnFromEdge(canvasW, canvasH) {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: Math.random() * canvasW, y: -30 };
    case 1: return { x: canvasW + 30, y: Math.random() * canvasH };
    case 2: return { x: Math.random() * canvasW, y: canvasH + 30 };
    case 3: return { x: -30, y: Math.random() * canvasH };
    default: return { x: canvasW / 2, y: -30 };
  }
}

function nodeHitTest(node, x, y) {
  return (
    x >= node.x - node.w / 2 &&
    x <= node.x + node.w / 2 &&
    y >= node.y - node.h / 2 &&
    y <= node.y + node.h / 2
  );
}

function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function isExclusiveNode(node) {
  return !!(node.isExclusive || node.isBodyTask);
}

function spawnBetweenBoxAndEdge(focusBox, canvasW, canvasH) {
  const boxW = focusBox ? focusBox.w : PHYSICS.BOX_BASE_W;
  const boxH = focusBox ? focusBox.h : PHYSICS.BOX_BASE_H;
  const bx = focusBox ? focusBox.x : canvasW / 2;
  const by = focusBox ? focusBox.y : canvasH / 2;
  
  // Choose a random angle and place it just outside the focus box boundary (closer to center)
  const angle = Math.random() * Math.PI * 2;
  const rx = boxW / 2 + 25 + Math.random() * 35;
  const ry = boxH / 2 + 25 + Math.random() * 35;
  
  return {
    x: clamp(bx + Math.cos(angle) * rx, 80, canvasW - 80),
    y: clamp(by + Math.sin(angle) * ry, 80, canvasH - 80)
  };
}

function physicsUpdate(physicsRef, profileRef, driveRef, metersRef, dt, canvasW, canvasH) {
  const phys = physicsRef.current;
  const profile = profileRef.current;
  const dtS = dt / 1000;
  const events = [];
  const frame = phys.frameCount;
  phys.frameCount++;

  // ── Focus box drift ──────────────────────────────────────────
  const noiseX = Math.sin(frame * 0.018) * Math.cos(frame * 0.011);
  const noiseY = Math.cos(frame * 0.013) * Math.sin(frame * 0.017);
  const mag = (1 - profile.focusLevel) * PHYSICS.DRIFT_STRENGTH;
  phys.focusBox.vx = (phys.focusBox.vx + noiseX * mag * dtS) * PHYSICS.DAMPING;
  phys.focusBox.vy = (phys.focusBox.vy + noiseY * mag * dtS) * PHYSICS.DAMPING;
  if (profile.medicated) {
    phys.focusBox.vx *= 0.92;
    phys.focusBox.vy *= 0.92;
  }

  const { w: bw, h: bh } = computeBoxSize(profile, driveRef.current);
  phys.focusBox.w = bw;
  phys.focusBox.h = bh;

  // Soft boundary walls
  const margin = 40;
  if (phys.focusBox.x - bw / 2 < margin) phys.focusBox.vx += (margin - (phys.focusBox.x - bw / 2)) * 0.3;
  if (phys.focusBox.x + bw / 2 > canvasW - margin) phys.focusBox.vx -= ((phys.focusBox.x + bw / 2) - (canvasW - margin)) * 0.3;
  if (phys.focusBox.y - bh / 2 < margin) phys.focusBox.vy += (margin - (phys.focusBox.y - bh / 2)) * 0.3;
  if (phys.focusBox.y + bh / 2 > canvasH - margin) phys.focusBox.vy -= ((phys.focusBox.y + bh / 2) - (canvasH - margin)) * 0.3;

  phys.focusBox.x += phys.focusBox.vx;
  phys.focusBox.y += phys.focusBox.vy;
  phys.focusBox.x = clamp(phys.focusBox.x, bw / 2 + 10, canvasW - bw / 2 - 10);
  phys.focusBox.y = clamp(phys.focusBox.y, bh / 2 + 10, canvasH - bh / 2 - 10);

  // ── Hyperfocus nagging thought animation ────────────────────
  if (phys.hyperfocus && phys.nagThoughts) {
    const t = Date.now() / 1000;
    phys.nagThoughts.forEach((n, i) => {
      n.alpha = 0.15 + 0.55 * Math.abs(Math.sin(t * n.speed + n.phase));
    });
  }

  // During hyperfocus: suppress intrusive thought spawning and attraction
  if (phys.hyperfocus) {
    phys.spawnTimer = Math.max(phys.spawnTimer, 5000); // keep timer high
    phys.intrusiveNodes.forEach(n => { n.attractSuppressed = true; });
  } else {
    phys.intrusiveNodes.forEach(n => { n.attractSuppressed = false; });
  }

  // ── Task nodes ──────────────────────────────────────────────
  let anyInBox = false;
  for (const node of phys.taskNodes) {
    if (node.status === 'complete' || node.status === 'forgotten') continue;

    // Decrement reappear timer if active (hidden train of thought)
    if (node.reappearTimer > 0) {
      node.reappearTimer -= dt;
      if (node.reappearTimer <= 0) {
        node.reappearTimer = 0;
        // Reappear! Place at a random safe spot outside the box
        const pos = spawnBetweenBoxAndEdge(phys.focusBox, canvasW, canvasH);
        node.x = pos.x;
        node.y = pos.y;
        node.vx = (Math.random() - 0.5) * 2;
        node.vy = (Math.random() - 0.5) * 2;
        node.snapFlash = 400; // brief flash
        events.push({ type: 'train_of_thought_recovered', nodeId: node.id });
      }
      continue; // Skip normal update when hidden
    }

    // Continuous push out for non-exclusive tasks if an exclusive task is active in the box
    if (phys.exclusiveTaskActive && phys.exclusiveTaskActive !== node.id && node.isInBox) {
      node.isInBox = false;
      const pdx = node.x - phys.focusBox.x;
      const pdy = node.y - phys.focusBox.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
      node.vx = (pdx / pdist) * 12 + (Math.random() - 0.5) * 5;
      node.vy = (pdy / pdist) * 12 + (Math.random() - 0.5) * 5;
      node.decayTimer = 0;
      node.decaying = true;
      node.status = 'pending';
      continue;
    }

    // Track urgency pending time
    if (node.status === 'pending') node.pendingTime = (node.pendingTime || 0) + dt;

    if (node.isInBox) {
      anyInBox = true;
      node.status = 'active';
      const isHyperfocusNode = phys.hyperfocus && node.id === phys.hyperfocusTaskId;

      // Advance progress — hyperfocus runs at 3× speed
      const speedMult = isHyperfocusNode ? 3 : 1;
      node.progress = Math.min(1, node.progress + (dtS * speedMult) / node.duration);

      // location event trigger at failureWindow
      if (node.locationEvent && node.progress >= node.failureWindow && !phys.forcedEventFired['loc_' + node.id]) {
        phys.forcedEventFired['loc_' + node.id] = true;
        events.push({ type: 'location_event_trigger', nodeId: node.id });
      }

      if (node.progress >= 1) {
        node.progress = 1;
        node.status = 'complete';
        node.isInBox = false;
        if (isExclusiveNode(node)) {
          phys.exclusiveTaskActive = null;
        }
        if (isHyperfocusNode) {
          phys.hyperfocus = false;
          phys.hyperfocusTaskId = null;
          events.push({ type: 'hyperfocus_end' });
        }
        if (node.isBodyTask) {
          phys.bodyTaskActive = null;
          events.push({ type: 'body_task_complete', bodyKey: node.bodyKey, restore: node.meterRestore });
        }
        events.push({ type: 'task_complete', nodeId: node.id, reward: node.reward });
      } else {
        if (isHyperfocusNode) {
          // Hyperfocus: pull toward centre, resist exit
          node.vx += (phys.focusBox.x - node.x) * 0.08;
          node.vy += (phys.focusBox.y - node.y) * 0.08;
          node.vx *= 0.8; node.vy *= 0.8;
        } else {
          // Normal: directed outward drift
          const driftMag = (2 - profile.focusLevel) * PHYSICS.TASK_DRIFT_IN_BOX * (driveRef.current < 30 ? 1.4 : 1);
          const odx = node.x - phys.focusBox.x;
          const ody = node.y - phys.focusBox.y;
          const odist = Math.sqrt(odx * odx + ody * ody) || 5;
          node.vx += (odx / odist) * driftMag * dtS + (Math.random() - 0.5) * driftMag * 0.3 * dtS;
          node.vy += (ody / odist) * driftMag * dtS + (Math.random() - 0.5) * driftMag * 0.3 * dtS;
          node.vx *= 0.92; node.vy *= 0.92;
        }

        if (!node.dragging) { node.x += node.vx; node.y += node.vy; }

        // Check if still in box — hyperfocus nodes cannot exit
        const dx = node.x - phys.focusBox.x;
        const dy = node.y - phys.focusBox.y;
        if (!isHyperfocusNode && (Math.abs(dx) > phys.focusBox.w / 2 || Math.abs(dy) > phys.focusBox.h / 2)) {
          node.isInBox = false;
          if (isExclusiveNode(node)) phys.exclusiveTaskActive = null;
          if (node.isBodyTask) phys.bodyTaskActive = null;
          if (node.timeInBox > 5000) {
            driveRef.current = clamp(driveRef.current - 3, 0, 100);
            events.push({ type: 'task_exit_fail', nodeId: node.id });
          }
          node.decayTimer = 0; node.decaying = true;
        }
        node.timeInBox = (node.timeInBox || 0) + dt;
      }
    } else {
      // Outside box
      if (node.status === 'active') node.status = 'pending';

      // Decay after leaving box
      if (node.decaying) {
        const decayWindow = PHYSICS.DECAY_TIME_BASE * (0.5 + profile.workingMemory);
        node.decayTimer = (node.decayTimer || 0) + dt;
        if (node.decayTimer > decayWindow && node.progress > 0 && node.status !== 'complete') {
          const decayRate = (1 - profile.workingMemory) * 0.05;
          node.progress = Math.max(0, node.progress - decayRate * dtS);
          if (node.progress <= 0) {
            node.status = 'forgotten';
            events.push({ type: 'task_forgotten', nodeId: node.id });
          }
        }
      }

      // Slowly drift toward the screen boundaries (away from focus box centre)
      const dx = node.x - phys.focusBox.x;
      const dy = node.y - phys.focusBox.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      // Drift strength: worse focusLevel (less attention) makes them drift faster
      const driftSpeed = (1.4 - profile.focusLevel) * 0.25 * dtS;
      node.vx += (dx / dist) * driftSpeed;
      node.vy += (dy / dist) * driftSpeed;

      // Free drift damping
      node.vx *= 0.95;
      node.vy *= 0.95;
    }

    if (!node.dragging && !node.isInBox) {
      node.x += node.vx;
      node.y += node.vy;
      
      // Check if task node crossed the 5% forget boundary box
      const forgetMarginX = canvasW * 0.05;
      const forgetMarginY = canvasH * 0.05;
      const hitForgetZone = (
        node.x <= forgetMarginX ||
        node.x >= canvasW - forgetMarginX ||
        node.y <= forgetMarginY ||
        node.y >= canvasH - forgetMarginY
      );
      if (hitForgetZone) {
        node.status = 'forgotten';
        events.push({ type: 'task_forgotten', nodeId: node.id });
      } else {
        node.x = clamp(node.x, node.w / 2 + 5, canvasW - node.w / 2 - 5);
        node.y = clamp(node.y, node.h / 2 + 5, canvasH - node.h / 2 - 5);
      }
    }

    // Snap flash decay
    if (node.snapFlash > 0) node.snapFlash -= dt;
  }

  // Drive idle drain
  const currentlyActiveTask = phys.taskNodes.find(n => n.isInBox && n.status !== 'complete' && n.status !== 'forgotten');
  if (!currentlyActiveTask) {
    driveRef.current = clamp(driveRef.current - 1 * dtS, 0, 100);
  }

  // Near-complete milestone
  for (const node of phys.taskNodes) {
    if (node.isInBox && node.progress > 0.9 && !node.nearCompleteBonusGiven) {
      node.nearCompleteBonusGiven = true;
      driveRef.current = clamp(driveRef.current + 2, 0, 100);
    }
  }

  // ── Intrusive thoughts ──────────────────────────────────────
  // Spawn timer
  let spawnInterval = PHYSICS.SPAWN_INTERVAL_BASE / Math.max(0.1, profile.impulsivity);
  if (driveRef.current < 30) spawnInterval *= 0.5;
  phys.spawnTimer -= dt;
  if (phys.spawnTimer <= 0 && phys.intrusiveNodes.filter(n => !n.ejected).length < 1) {
    phys.spawnTimer = spawnInterval + Math.random() * 4000;
    const pos = spawnFromEdge(canvasW, canvasH);
    const thought = intrusiveThoughtPool[Math.floor(Math.random() * intrusiveThoughtPool.length)];
    const maxDrags = 3 + Math.floor(Math.random() * 3); // 3 to 5
    const newNode = {
      id: 'int_' + Date.now() + '_' + Math.random(),
      label: thought.label,
      stickiness: thought.stickiness,
      rewarding: thought.rewarding,
      reward: 35, // High reward
      maxDrags: maxDrags,
      dragsLeft: maxDrags,
      progress: 1.0,
      isMemo: false,
      x: pos.x, y: pos.y,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      w: 220, h: 72,
      ejected: false, isInBox: false, opacity: 1,
      dragOffX: 0, dragOffY: 0,
    };
    phys.intrusiveNodes.push(newNode);
    console.log(`[Telemetry] Spawning new distraction node. ID: ${newNode.id}, Label: "${newNode.label}", maxDrags/dragsLeft: ${newNode.maxDrags}`);
  }

  // Update intrusive nodes
  for (let i = phys.intrusiveNodes.length - 1; i >= 0; i--) {
    const node = phys.intrusiveNodes[i];
    if (node.ejected) {
      node.x += node.vx;
      node.y += node.vy;
      node.opacity -= 0.02;
      if (node.opacity <= 0 || node.x < -200 || node.x > canvasW + 200 || node.y < -200 || node.y > canvasH + 200) {
        console.log(`[Telemetry] Distraction node boundary/opacity trigger (defeated). Splicing ID: ${node.id}`);
        phys.intrusiveNodes.splice(i, 1);
      }
      continue;
    }

    if (!node.dragging) {
      if (node.isInBox) {
        // Stuck inside — slow random walk, bounces off box walls
        node.vx += (Math.random() - 0.5) * 1.5 * dtS * 60;
        node.vy += (Math.random() - 0.5) * 1.5 * dtS * 60;
        node.vx *= 0.90;
        node.vy *= 0.90;
        node.x += node.vx;
        node.y += node.vy;
        // Soft bounce off box inner walls
        const hw = phys.focusBox.w / 2 - node.w / 2 - 4;
        const hh = phys.focusBox.h / 2 - node.h / 2 - 4;
        if (node.x < phys.focusBox.x - hw) { node.x = phys.focusBox.x - hw; node.vx *= -0.5; }
        if (node.x > phys.focusBox.x + hw) { node.x = phys.focusBox.x + hw; node.vx *= -0.5; }
        if (node.y < phys.focusBox.y - hh) { node.y = phys.focusBox.y - hh; node.vy *= -0.5; }
        if (node.y > phys.focusBox.y + hh) { node.y = phys.focusBox.y + hh; node.vy *= -0.5; }
      } else if (!node.attractSuppressed) {
        // Drifting toward box - moderate speed
        const dx = phys.focusBox.x - node.x;
        const dy = phys.focusBox.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Balanced attraction strength and cap so they move in a bit slower.
        // Stickier/stronger distractions (higher maxDrags) are pulled in faster.
        const dragFactor = (node.maxDrags || 3) / 3;
        const F = (PHYSICS.ATTRACT_BASE * 1.1 * profile.impulsivity * node.stickiness * dragFactor) / (dist * 0.75);
        const fCapped = Math.min(F, 280 * dragFactor);
        node.vx += (dx / dist) * fCapped * dtS;
        node.vy += (dy / dist) * fCapped * dtS;
        node.vx *= 0.95;
        node.vy *= 0.95;
        node.x += node.vx;
        node.y += node.vy;
      } else {
        // Suppressed during hyperfocus — drift away from box
        const sdx = node.x - phys.focusBox.x;
        const sdy = node.y - phys.focusBox.y;
        const sDist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
        node.vx += (sdx / sDist) * 40 * dtS;
        node.vy += (sdy / sDist) * 40 * dtS;
        node.vx *= 0.95; node.vy *= 0.95;
        node.x += node.vx; node.y += node.vy;
      }
    }

    // Check if intrusive node entered box
    const idx_dx = node.x - phys.focusBox.x;
    const idx_dy = node.y - phys.focusBox.y;
    if (Math.abs(idx_dx) < phys.focusBox.w / 2 && Math.abs(idx_dy) < phys.focusBox.h / 2 && !node.isInBox) {
      node.isInBox = true;
      if (node.rewarding) {
        driveRef.current = clamp(driveRef.current + 8, 0, 100);
        events.push({ type: 'distraction_rewarding', nodeId: node.id });
      } else {
        events.push({ type: 'distraction_nonrewarding', nodeId: node.id });
      }

      // 40% chance to lose train of thought (active task disappears and reappears later)
      const activeTask = phys.taskNodes.find(t => t.isInBox && t.status === 'active' && !t.reappearTimer);
      if (activeTask) {
        const CHANCE_TO_LOSE = 0.40;
        if (Math.random() < CHANCE_TO_LOSE) {
          activeTask.isInBox = false;
          activeTask.status = 'pending';
          // If the lost task held the exclusive lock, release it so other tasks aren't blocked
          if (phys.exclusiveTaskActive === activeTask.id) {
            phys.exclusiveTaskActive = null;
          }
          // Random timer between 20s and 45s (20000ms to 45000ms)
          activeTask.reappearTimer = 20000 + Math.random() * 25000;
          events.push({ type: 'train_of_thought_lost', nodeId: activeTask.id });
        }
      }
    }
  }

  // Continuous push: in-box intrusive thoughts shove in-box task nodes outward
  for (const intNode of phys.intrusiveNodes) {
    if (!intNode.isInBox || intNode.ejected) continue;
    for (const t of phys.taskNodes) {
      if (!t.isInBox) continue;
      const pushDx = t.x - intNode.x;
      const pushDy = t.y - intNode.y;
      const pushDist = Math.sqrt(pushDx * pushDx + pushDy * pushDy) || 1;
      const pushF = (profile.distractability || 0.6) * 80 * dtS;
      t.vx += (pushDx / pushDist) * pushF;
      t.vy += (pushDy / pushDist) * pushF;
    }
  }

  // Meter drains
  const m = metersRef.current;
  m.bladder = clamp(m.bladder - 0.8 * dtS, 0, 100);
  m.hunger = clamp(m.hunger - 0.4 * dtS, 0, 100);
  m.thirst = clamp(m.thirst - 0.6 * dtS, 0, 100);
  m.fatigue = clamp(m.fatigue - 0.3 * dtS, 0, 100);

  // Body meter intrusive thoughts — warning at 35%, critical at 12%
  const warningLabels = {
    bladder: '~ could use the bathroom ~',
    hunger: '~ starting to get hungry ~',
    thirst: '~ a bit thirsty ~',
    fatigue: '~ feeling a bit tired ~',
  };
  const criticalLabels = {
    bladder: '~ urgent: need the bathroom ~',
    hunger: '~ stomach growling... ~',
    thirst: '~ really need water ~',
    fatigue: '~ so tired right now ~',
  };
  ['bladder', 'hunger', 'thirst', 'fatigue'].forEach((key, idx) => {
    // Stagger spawns: each meter has a frame offset so they don't all fire at once
    const staggerOk = (frame % 60) === (idx * 15);

    if (m[key] < 35 && !phys.meterWarning[key] && staggerOk) {
      phys.meterWarning[key] = true;
      if (!phys.intrusiveNodes.find(n => n.id === 'body_warn_' + key)) {
        const pos = spawnFromEdge(canvasW, canvasH);
        const maxDrags = 3 + Math.floor(Math.random() * 3);
        phys.intrusiveNodes.push({
          id: 'body_warn_' + key, label: warningLabels[key],
          stickiness: 0.55, rewarding: false, reward: 35,
          maxDrags: maxDrags, dragsLeft: maxDrags, progress: 1.0,
          isMemo: false,
          x: pos.x, y: pos.y, vx: 0, vy: 0, w: 220, h: 72,
          ejected: false, isInBox: false, opacity: 1,
        });
      }
    }
    if (m[key] > 40) phys.meterWarning[key] = false;

    if (m[key] < 12 && !phys.meterCritical[key] && staggerOk) {
      phys.meterCritical[key] = true;
      // Intrusive thought
      if (!phys.intrusiveNodes.find(n => n.id === 'body_' + key)) {
        const pos = spawnFromEdge(canvasW, canvasH);
        const maxDrags = 3 + Math.floor(Math.random() * 3);
        phys.intrusiveNodes.push({
          id: 'body_' + key, label: criticalLabels[key],
          stickiness: 0.95, rewarding: false, reward: 35,
          maxDrags: maxDrags, dragsLeft: maxDrags, progress: 1.0,
          isMemo: false,
          x: pos.x, y: pos.y, vx: 0, vy: 0, w: 220, h: 72,
          ejected: false, isInBox: false, opacity: 1,
        });
      }
      // Task node — spawn between attention box and edge so player can drag it in
      if (!phys.taskNodes.find(n => n.id === BODY_TASKS[key].id)) {
        const taskDef = BODY_TASKS[key];
        const pos2 = spawnBetweenBoxAndEdge(phys.focusBox, canvasW, canvasH);
        phys.taskNodes.push({
          ...taskDef,
          x: pos2.x, y: pos2.y,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
          w: 220, h: 72,
          progress: 0, status: 'pending',
          isInBox: false, dragging: false,
          decaying: false, decayTimer: 0,
          snapFlash: 0, snapProgress: 0,
          timeInBox: 0, pendingTime: 0,
          nearCompleteBonusGiven: false,
        });
      }
    }
    if (m[key] > 18) phys.meterCritical[key] = false;
  });

  return events;
}

// §3 CANVAS RENDER
// ═══════════════════════════════════════════════════════════════

function renderCanvas(ctx, phys, profile, drive) {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = C.BG;
  ctx.fillRect(0, 0, W, H);

  // Forget Zone (5% boundary box)
  ctx.save();
  ctx.strokeStyle = 'rgba(57,255,20,0.18)'; // light primary green
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  const fX = W * 0.05;
  const fY = H * 0.05;
  const fW = W * 0.9;
  const fH = H * 0.9;
  ctx.strokeRect(fX, fY, fW, fH);
  
  // Repeating diagonal warning text stamps in the Forget Zone margins
  ctx.font = 'bold 16px VT323, monospace';
  ctx.fillStyle = 'rgba(255, 155, 0, 0.12)'; // faded orange
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const rotateAngle = -Math.PI / 6; // -30 degrees
  const stepH = 80; // horizontal repeat step (closer spacing)
  const stepV = 45;  // vertical repeat step (closer spacing)

  // Top border repeating stamps
  for (let x = stepH / 2; x < W; x += stepH) {
    ctx.save();
    ctx.translate(x, H * 0.025);
    ctx.rotate(rotateAngle);
    ctx.fillText('forget zone', 0, 0);
    ctx.restore();
  }

  // Bottom border repeating stamps
  for (let x = stepH / 2; x < W; x += stepH) {
    ctx.save();
    ctx.translate(x, H * 0.975);
    ctx.rotate(rotateAngle);
    ctx.fillText('forget zone', 0, 0);
    ctx.restore();
  }

  // Left border repeating stamps
  for (let y = stepV / 2; y < H; y += stepV) {
    // Avoid drawing directly on corners to prevent overlap
    if (y < H * 0.05 || y > H * 0.95) continue;
    ctx.save();
    ctx.translate(W * 0.025, y);
    ctx.rotate(rotateAngle);
    ctx.fillText('forget zone', 0, 0);
    ctx.restore();
  }

  // Right border repeating stamps
  for (let y = stepV / 2; y < H; y += stepV) {
    if (y < H * 0.05 || y > H * 0.95) continue;
    ctx.save();
    ctx.translate(W * 0.975, y);
    ctx.rotate(rotateAngle);
    ctx.fillText('forget zone', 0, 0);
    ctx.restore();
  }

  ctx.restore();

  // Connection lines between related tasks
  ctx.save();
  ctx.setLineDash([4, 8]);
  ctx.strokeStyle = 'rgba(57,255,20,0.12)';
  ctx.lineWidth = 1;
  const now = Date.now();
  const pulse = 0.08 + 0.06 * Math.sin(now * 0.002);
  ctx.strokeStyle = `rgba(57,255,20,${pulse})`;
  for (const node of phys.taskNodes) {
    if (node.lockedUntil) {
      const parent = phys.taskNodes.find(n => n.id === node.lockedUntil);
      if (parent && parent.status !== 'complete' && node.status !== 'complete' && node.status !== 'forgotten') {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(parent.x, parent.y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Intrusive thought nodes (drawn to look like tasks, but orange/amber)
  for (const node of phys.intrusiveNodes) {
    if (node.ejected && node.opacity <= 0) continue;
    ctx.save();

    // Only visible when they get near to the attention box (unless already dragged)
    let drawOpacity = node.opacity;
    const hasBeenDragged = node.dragsLeft < node.maxDrags;
    if (!node.ejected && !node.isInBox && !node.dragging && !hasBeenDragged) {
      const dx = Math.max(0, Math.abs(node.x - phys.focusBox.x) - phys.focusBox.w / 2);
      const dy = Math.max(0, Math.abs(node.y - phys.focusBox.y) - phys.focusBox.h / 2);
      const distToBoxEdge = Math.sqrt(dx * dx + dy * dy);
      const FADE_START = 60; // starts appearing when within 60px of box edge
      const FADE_END = 15;    // fully visible when within 15px of box edge
      if (distToBoxEdge >= FADE_START) {
        drawOpacity = 0;
      } else {
        drawOpacity = Math.max(0, Math.min(1, (FADE_START - distToBoxEdge) / (FADE_START - FADE_END)));
      }
    }
    if (drawOpacity <= 0) { ctx.restore(); continue; }
    ctx.globalAlpha = drawOpacity;

    // Snap progress: amber glow + thicker border while holding cursor inside/at boundary to snap out
    const sp = node.snapProgress || 0;
    if (sp > 0) {
      ctx.shadowBlur = 8 + sp * 24;
      ctx.shadowColor = C.AMBER;
    }

    // Solid border line (looks like task) in amber
    ctx.strokeStyle = C.AMBER;
    ctx.lineWidth = sp > 0 ? 1 + sp * 3 : (node.dragging ? 2 : 1);
    ctx.setLineDash([]);
    ctx.strokeRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);

    // Fill with orange background
    ctx.fillStyle = node.isInBox ? `rgba(255,155,0,${0.12 + sp * 0.12})` : (sp > 0 ? `rgba(255,155,0,${0.05 + sp * 0.12})` : 'rgba(255,155,0,0.04)');
    ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);

    // Snap progress bar along top edge of node
    if (sp > 0) {
      ctx.fillStyle = C.AMBER;
      ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w * sp, 3);
    }

    // Reset shadow blur
    ctx.shadowBlur = 0;

    // Label (cleaned up uppercase text)
    ctx.font = '22px VT323, monospace';
    ctx.fillStyle = C.AMBER;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const statusIcon = node.isInBox ? STATUS_ICONS['active'] : STATUS_ICONS['pending'];
    const cleanLabel = (node.label || '').replace(/^~\s*|\s*~$/g, '').toUpperCase();
    ctx.fillText(statusIcon + ' ' + cleanLabel, node.x, node.y - 14);

    // Reward indicator (usually always has high reward, default to 35)
    const REWARD_MAX = 40;
    const filled = Math.round(((node.reward || 35) / REWARD_MAX) * 5);
    ctx.font = '16px VT323, monospace';
    let diamonds = '';
    for (let d = 0; d < 5; d++) diamonds += d < filled ? '◆' : '◇';
    ctx.fillText(diamonds, node.x, node.y + 2);

    // Progress bar (empty orange bar matching task design)
    const barW = node.w - 16;
    const barH = 4;
    const barX = node.x - barW / 2;
    const barY = node.y + 14;
    ctx.fillStyle = 'rgba(255, 155, 0, 0.2)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = C.AMBER;
    ctx.fillRect(barX, barY, barW * (node.progress || 0), barH);

    ctx.restore();
  }

  // Task nodes
  for (const node of phys.taskNodes) {
    if (node.status === 'complete' || node.status === 'forgotten') continue;
    if (node.reappearTimer > 0) continue;
    ctx.save();
    const isSelected = node.id === phys.selectedTaskId;
    const isHyperfocusNode = phys.hyperfocus && node.id === phys.hyperfocusTaskId;

    // During hyperfocus: non-hyperfocus tasks fade to near-invisible
    let alpha = node.status === 'complete' ? 0.4 : 1;
    if (phys.hyperfocus && !isHyperfocusNode) alpha = 0.07;
    ctx.globalAlpha = alpha;

    // Urgent task flashing: critical urgency or pending too long
    const isUrgent = node.urgency === 'critical' || (node.pendingTime || 0) > 90000;
    const isBodyUrgent = node.isBodyTask;
    let borderColor;
    if (isHyperfocusNode) {
      borderColor = '#a855f7'; // purple
    } else if (isBodyUrgent) {
      const flashT = Math.sin(now / 250);
      borderColor = flashT > 0 ? '#ff3131' : '#ffb000';
    } else if (isUrgent) {
      const flashAlpha = 0.6 + 0.4 * Math.abs(Math.sin(now / 300));
      borderColor = `rgba(255,49,49,${flashAlpha})`;
    } else {
      borderColor = isSelected ? '#fff' : (URGENCY_COLORS[node.urgency] || C.PRIMARY);
    }

    // Snap flash
    if (node.snapFlash > 0) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = C.PRIMARY;
    }

    // Blocked by exclusive visual glow
    const isBlocked = !!(phys.exclusiveTaskActive && phys.exclusiveTaskActive !== node.id);
    if (isBlocked) {
      ctx.shadowBlur = 12 + Math.abs(Math.sin(now / 150)) * 8;
      ctx.shadowColor = '#ff3131'; // glowing red
    }

    // Snap progress: amber glow + thicker border while holding cursor in box
    const sp = node.snapProgress || 0;
    if (sp > 0 && !isBlocked) {
      ctx.shadowBlur = 8 + sp * 24;
      ctx.shadowColor = C.AMBER;
    }

    ctx.strokeStyle = isBlocked ? '#ff3131' : (sp > 0 ? C.AMBER : borderColor);
    ctx.lineWidth = isBlocked ? 2 : (sp > 0 ? 1 + sp * 3 : (isSelected ? 2 : 1));
    ctx.setLineDash([]);
    ctx.strokeRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);
    
    ctx.fillStyle = node.isInBox ? 'rgba(57,255,20,0.12)' : (isBlocked ? 'rgba(255,49,49,0.06)' : (sp > 0 ? `rgba(255,176,0,${0.05 + sp * 0.12})` : 'rgba(57,255,20,0.04)'));
    ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);

    // Snap progress bar along top edge of node
    if (sp > 0 && !isBlocked) {
      ctx.fillStyle = C.AMBER;
      ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w * sp, 3);
    }

    // Label
    ctx.font = '22px VT323, monospace';
    ctx.fillStyle = isBlocked ? '#ff3131' : (node.status === 'complete' ? C.PRIMARY_DIM : C.PRIMARY);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const statusIcon = STATUS_ICONS[node.status] || '';
    ctx.fillText(statusIcon + ' ' + node.label, node.x, node.y - 14);

    // Reward indicator: 5 diamonds, amber = rewarding, dim = chore
    const REWARD_MAX = 40;
    const filled = Math.round((node.reward / REWARD_MAX) * 5);
    const isHighReward = node.reward >= 25;
    const rewardColor = isBlocked ? '#ff3131' : (isHighReward ? C.AMBER : 'rgba(57,255,20,0.5)');
    if (isHighReward && node.status !== 'complete' && !isBlocked) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = C.AMBER;
    }
    ctx.font = '16px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let diamonds = '';
    for (let d = 0; d < 5; d++) diamonds += d < filled ? '◆' : '◇';
    ctx.fillStyle = rewardColor;
    ctx.fillText(diamonds, node.x, node.y + 2);
    ctx.shadowBlur = 0;

    // Progress bar
    if (node.status !== 'complete') {
      if (isBlocked) {
        ctx.font = '16px VT323, monospace';
        ctx.fillStyle = '#ff3131';
        ctx.fillText('PREOCCUPIED', node.x, node.y + 14);
      } else {
        const barW = node.w - 16;
        const barH = 4;
        const barX = node.x - barW / 2;
        const barY = node.y + 14;
        ctx.fillStyle = 'rgba(57,255,20,0.2)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = C.PRIMARY;
        ctx.fillRect(barX, barY, barW * node.progress, barH);
      }
    } else {
      ctx.font = '18px VT323, monospace';
      ctx.fillStyle = C.PRIMARY_DIM;
      ctx.fillText('COMPLETE', node.x, node.y + 14);
    }

    ctx.restore();
  }

  // Focus box
  ctx.save();
  const box = phys.focusBox;
  const dashOffset = (now / 50) % 16;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -dashOffset;
  const boxColor = phys.hyperfocus ? '#a855f7' : C.PRIMARY;
  const boxFill = phys.hyperfocus ? 'rgba(168,85,247,0.08)' : 'rgba(57,255,20,0.03)';
  const boxLabelColor = phys.hyperfocus ? 'rgba(168,85,247,0.9)' : 'rgba(57,255,20,0.6)';
  ctx.strokeStyle = boxColor;
  ctx.lineWidth = phys.hyperfocus ? 3 : 2;
  ctx.shadowBlur = phys.hyperfocus ? 20 : 8;
  ctx.shadowColor = boxColor;
  ctx.strokeRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h);
  ctx.fillStyle = boxFill;
  ctx.fillRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h);
  ctx.font = '18px VT323, monospace';
  ctx.fillStyle = boxLabelColor;
  ctx.textAlign = 'center';
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  const boxLabel = phys.hyperfocus ? '[ HYPERFOCUS ]' : '[ FOREFRONT OF MIND ]';
  ctx.fillText(boxLabel, box.x, box.y - box.h / 2 - 12);
  ctx.restore();

  // Nagging thoughts ghosted on canvas during hyperfocus
  if (phys.hyperfocus && phys.nagThoughts) {
    ctx.save();
    for (const nag of phys.nagThoughts) {
      if (!nag.alpha || nag.alpha <= 0) continue;
      ctx.globalAlpha = nag.alpha;
      ctx.font = 'italic 21px VT323, monospace';
      ctx.fillStyle = '#ffb000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('! ' + nag.label + ' !', nag.x, nag.y);
    }
    ctx.restore();
  }
}

// §4 WEB AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════

function initAudio(audioRef) {
  if (audioRef.current) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = ctx;
    // Ambient 60Hz hum
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 60;
    osc.type = 'sine';
    gain.gain.value = 0.008;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  } catch (e) { /* audio unavailable */ }
}

function playSnap(audioRef) {
  const ctx = audioRef.current;
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

function playError(audioRef) {
  const ctx = audioRef.current;
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 150;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

function playDriveSpike(audioRef) {
  const ctx = audioRef.current;
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function playEject(audioRef) {
  const ctx = audioRef.current;
  if (!ctx) return;
  try {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (e) {}
}

// §5 REACT COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ── MeterBar ──────────────────────────────────────────────────
function MeterBar({ label, value, isMeds, medicated }) {
  if (isMeds) {
    const taken = medicated;
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, marginBottom: 2 }}>
          <span>MEDS</span>
          <span style={{ color: taken ? '#39ff14' : '#ffb000' }}>
            {taken ? '[ TAKEN ]' : '[ NOT TAKEN ]'}
          </span>
        </div>
      </div>
    );
  }

  const pct = clamp(value, 0, 100);
  const segments = 12;
  const filled = Math.round((pct / 100) * segments);
  const bar = '█'.repeat(filled) + '░'.repeat(segments - filled);
  const flashClass = pct < 10 ? 'flash-red' : pct < 25 ? 'flash-amber' : '';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, marginBottom: 2 }}>
        <span className={flashClass}>{label}</span>
        <span className={flashClass} style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{bar}</span>
      </div>
    </div>
  );
}

// ── LeftPanel ─────────────────────────────────────────────────
function LeftPanel({ meters, medicated }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(57,255,20,0.3)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 20, marginBottom: 12, borderBottom: '1px solid rgba(57,255,20,0.2)', paddingBottom: 6, letterSpacing: 2 }}>
        [ BODY SYS ]
      </div>
      <MeterBar label="BLADDER" value={meters.bladder} />
      <MeterBar label="HUNGER" value={meters.hunger} />
      <MeterBar label="THIRST" value={meters.thirst} />
      <MeterBar label="FATIGUE" value={meters.fatigue} />
      <MeterBar label="MEDS" isMeds={true} medicated={medicated} />
    </div>
  );
}

// ── TemporalClock ─────────────────────────────────────────────
function TemporalClock({ gameTime, drive, hyperfocus }) {
  const SESSION_START_HOUR = 7 * 3600000; // 07:00 in ms
  const actualMs = SESSION_START_HOUR + gameTime;
  const perceivedMs = hyperfocus
    ? SESSION_START_HOUR + gameTime * 3.5
    : drive > 70
    ? SESSION_START_HOUR + gameTime * 0.5
    : drive < 20
    ? SESSION_START_HOUR + gameTime * 2
    : SESSION_START_HOUR + gameTime;

  function msToTime(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600) % 24;
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return { h, m, s };
  }

  const { h: ah, m: am, s: as } = msToTime(actualMs);
  const { h: ph, m: pm, s: ps } = msToTime(perceivedMs);
  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ marginBottom: 10, fontSize: 15 }}>
      <div style={{ opacity: 0.6, fontSize: 21, marginBottom: 3 }}>CLOCK</div>
      <div>ACTUAL  <span>{pad(ah)}</span><span className="blink">:</span><span>{pad(am)}</span><span className="blink">:</span><span>{pad(as)}</span></div>
      <div style={{ color: hyperfocus ? '#a855f7' : drive > 70 ? '#00cfff' : drive < 20 ? '#ff8c00' : '#39ff14' }}>
        PERCEIVED <span>{pad(ph)}</span><span className="blink">:</span><span>{pad(pm)}</span><span className="blink">:</span><span>{pad(ps)}</span>
      </div>
    </div>
  );
}

// ── DriveBar ──────────────────────────────────────────────────
function DriveBar({ drive, lastEvent }) {
  const segments = 20;
  const filled = Math.round((drive / 100) * segments);
  const bar = '▓'.repeat(filled) + '░'.repeat(segments - filled);
  const driveColor = drive < 20 ? '#ff3131' : drive < 40 ? '#ffb000' : '#39ff14';

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ opacity: 0.6, fontSize: 21, marginBottom: 3 }}>EXECUTIVE DRIVE</div>
      <div style={{ fontFamily: 'monospace', letterSpacing: 1, color: driveColor, fontSize: 14 }}>{bar}</div>
      <div style={{ fontSize: 20, opacity: 0.5, marginTop: 2 }}>{Math.round(drive)}%</div>
      {lastEvent && <div style={{ fontSize: 20, color: '#ffb000', marginTop: 3, opacity: 0.8 }}>{lastEvent}</div>}
    </div>
  );
}

// ── TaskListItem ──────────────────────────────────────────────
function TaskListItem({ task, isSelected, onClick }) {
  const icon = STATUS_ICONS[task.status] || '✗';
  const iconColor = task.status === 'complete' ? '#39ff14'
    : task.status === 'forgotten' ? '#ff3131'
    : task.status === 'active' ? '#00cfff'
    : 'rgba(57,255,20,0.6)';
  const progSegments = 10;
  const filled = Math.round(task.progress * progSegments);
  const bar = '[' + '░'.repeat(filled) + ' '.repeat(progSegments - filled) + ']';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 4px',
        marginBottom: 3,
        cursor: 'pointer',
        background: isSelected ? 'rgba(57,255,20,0.1)' : 'transparent',
        border: isSelected ? '1px solid rgba(57,255,20,0.4)' : '1px solid transparent',
        fontSize: 18,
      }}
    >
      <span style={{ color: iconColor, minWidth: 14 }}>{icon}</span>
      <span style={{
        flex: 1,
        opacity: task.status === 'complete' ? 0.5 : task.status === 'forgotten' ? 0.3 : 1,
        textDecoration: task.status === 'forgotten' ? 'line-through' : 'none',
        fontSize: 21,
      }}>{task.label}</span>
      {task.status !== 'complete' && task.status !== 'forgotten' && (
        <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.5 }}>{bar}</span>
      )}
    </div>
  );
}

// ── TaskList ──────────────────────────────────────────────────
function TaskList({ tasks, selectedTaskId, onSelectTask, hyperfocus }) {
  const dimStyle = { opacity: hyperfocus ? 0.12 : 1, transition: 'opacity 1.2s ease' };
  return (
    <div style={{ ...dimStyle, marginBottom: 10, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ opacity: 0.6, fontSize: 21, marginBottom: 5 }}>TASK QUEUE</div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        {tasks.map(t => (
          <TaskListItem
            key={t.id}
            task={t}
            isSelected={selectedTaskId === t.id}
            onClick={() => onSelectTask(t.id === selectedTaskId ? null : t.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── SessionScore ──────────────────────────────────────────────
function SessionScore({ score, tasks, elapsedMs }) {
  const done = tasks.filter(t => t.status === 'complete').length;
  const total = tasks.length;
  const mm = String(Math.floor(elapsedMs / 60000)).padStart(2, '0');
  const ss = String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0');

  return (
    <div style={{ fontSize: 21, borderTop: '1px solid rgba(57,255,20,0.2)', paddingTop: 8 }}>
      <div style={{ opacity: 0.6, fontSize: 21, marginBottom: 4 }}>SESSION SCORE</div>
      <div>WELLBEING    <span style={{ float: 'right' }}>{Math.round(score.wellbeing)}</span></div>
      <div>EXEC FUNC    <span style={{ float: 'right' }}>{Math.round(score.execFunction)}</span></div>
      <div>TASKS DONE   <span style={{ float: 'right' }}>{done}/{total}</span></div>
      <div>ELAPSED      <span style={{ float: 'right' }}>{mm}:{ss}</span></div>
    </div>
  );
}

// ── EventLog ──────────────────────────────────────────────────
function EventLog({ events }) {
  if (!events || events.length === 0) return null;
  const latest = events[events.length - 1];
  return (
    <div style={{ marginBottom: 8, padding: '6px 8px', border: '1px solid rgba(255,176,0,0.4)', background: 'rgba(255,176,0,0.05)', fontSize: 13 }}>
      <div style={{ color: '#ffb000', fontSize: 20, marginBottom: 3 }}>[ EVENT LOG ]</div>
      <div style={{ opacity: 0.9, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{latest.summary}</div>
    </div>
  );
}

// ── RightPanel ────────────────────────────────────────────────
function RightPanel({ gameTime, drive, tasks, selectedTaskId, onSelectTask, score, elapsedMs, lastDriveEvent, eventLog, mood, hyperfocus }) {
  const dimStyle = { opacity: hyperfocus ? 0.12 : 1, transition: 'opacity 1.2s ease' };
  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(57,255,20,0.3)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ ...dimStyle, fontSize: 20, marginBottom: 12, borderBottom: '1px solid rgba(57,255,20,0.2)', paddingBottom: 6, letterSpacing: 2 }}>
        [ STATUS ]
      </div>
      {mood < 100 && (
        <div style={{ ...dimStyle, marginBottom: 8, fontSize: 13 }}>
          MOOD <span style={{ color: mood < 80 ? '#ff3131' : '#ffb000' }}>{mood < 0 ? mood : '+0'}/{100}</span>
          <span style={{ float: 'right' }}>{mood}</span>
        </div>
      )}
      <TemporalClock gameTime={gameTime} drive={drive} hyperfocus={hyperfocus} />
      <div style={dimStyle}>
        <DriveBar drive={drive} lastEvent={lastDriveEvent} />
      </div>
      <TaskList tasks={tasks} selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} hyperfocus={hyperfocus} />
      <div style={dimStyle}>
        <EventLog events={eventLog} />
        <SessionScore score={score} tasks={tasks} elapsedMs={elapsedMs} />
      </div>
    </div>
  );
}

// ── ConversationOverlay ───────────────────────────────────────
function ConversationOverlay({ data, taskInBox, onComplete, onImpulsiveResponse }) {
  const words = data.text.split(' ');
  const [shownCount, setShownCount] = useState(0);
  const [impulsiveClicked, setImpulsiveClicked] = useState(false);
  const timerRef = useRef(null);
  const taskLostRef = useRef(false);

  useEffect(() => {
    if (!taskInBox && shownCount > 0) taskLostRef.current = true;
  }, [taskInBox, shownCount]);

  useEffect(() => {
    if (shownCount < words.length && !impulsiveClicked) {
      timerRef.current = setTimeout(() => {
        setShownCount(c => c + 1);
      }, 80);
    }
    return () => clearTimeout(timerRef.current);
  }, [shownCount, impulsiveClicked]);

  const handleImpulsive = () => {
    setImpulsiveClicked(true);
    onImpulsiveResponse && onImpulsiveResponse();
    setTimeout(() => onComplete && onComplete(), 400);
  };

  const showImpulsiveBtn = shownCount >= Math.floor(words.length * 0.4);
  const keyWordSet = new Set(data.keyWords || []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    }}>
      <div style={{
        maxWidth: 560,
        border: '1px solid rgba(57,255,20,0.5)',
        background: 'rgba(0,0,0,0.7)',
        padding: '24px 28px',
      }}>
        <div style={{ color: '#ffb000', fontSize: 20, marginBottom: 12, letterSpacing: 2 }}>
          [ {data.npcName} ]
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.7, minHeight: 80 }}>
          {words.slice(0, shownCount).map((word, i) => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            const isKey = keyWordSet.has(cleanWord);
            const isLost = taskLostRef.current && i >= Math.floor(shownCount * 0.7);
            if (isLost) {
              return <span key={i} style={{ color: 'rgba(57,255,20,0.3)' }}>[...] </span>;
            }
            return (
              <span key={i} style={{
                color: isKey ? '#ffb000' : '#39ff14',
                textShadow: isKey ? '0 0 6px #ffb000' : 'none',
                transition: 'color 0.6s ease',
              }}>{word} </span>
            );
          })}
          {shownCount < words.length && <span className="blink" style={{ color: '#39ff14' }}>_</span>}
        </div>
        {showImpulsiveBtn && !impulsiveClicked && (
          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleImpulsive}
              style={{
                background: 'transparent',
                border: '1px solid #ffb000',
                color: '#ffb000',
                fontFamily: 'VT323, monospace',
                fontSize: 20,
                padding: '6px 16px',
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >[ RESPOND NOW ]</button>
            <span style={{ marginLeft: 12, fontSize: 21, opacity: 0.5 }}>— interrupts conversation</span>
          </div>
        )}
        {!taskInBox && (
          <div style={{ marginTop: 8, color: '#ffb000', fontSize: 21, opacity: 0.7 }}>
            [ ATTENTION DRIFTED — information may be lost ]
          </div>
        )}
        {shownCount >= words.length && !impulsiveClicked && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => onComplete && onComplete()}
              style={{
                background: 'transparent',
                border: '1px solid #39ff14',
                color: '#39ff14',
                fontFamily: 'VT323, monospace',
                fontSize: 22,
                padding: '6px 20px',
                cursor: 'pointer',
                letterSpacing: 2,
              }}
            >[ CONTINUE ]</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NameSelectOverlay ─────────────────────────────────────────
function NameSelectOverlay({ data, onSelect }) {
  const [chosen, setChosen] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handlePick = (name) => {
    setChosen(name);
    setShowResult(true);
    setTimeout(() => onSelect(name), 3000);
  };

  if (showResult) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}>
        <div style={{ maxWidth: 500, border: '1px solid rgba(57,255,20,0.5)', padding: '24px 28px', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ color: '#39ff14', marginBottom: 10, fontSize: 15 }}>[ EMAIL SENT — {chosen} ]</div>
          <div style={{ opacity: 0.7, fontSize: 18, marginBottom: 12, lineHeight: 1.6 }}>
            Reply: "Hi! Just to let you know, my name is actually Jamie.<br/>
            No worries at all, happens all the time :)"
          </div>
          <div style={{ color: '#ffb000', fontSize: 14 }}>[ RELATIONSHIP: volunteer — awkward start ]</div>
          <div style={{ fontSize: 21, marginTop: 6, opacity: 0.7 }}>[ MOOD: -4 ]  [ EXEC FUNCTION: -8 ]</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    }}>
      <div style={{ maxWidth: 500, border: '1px solid rgba(57,255,20,0.5)', padding: '24px 28px', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ color: '#39ff14', marginBottom: 8, letterSpacing: 2, fontSize: 16 }}>
          [ COMPOSE EMAIL — NEW VOLUNTEER ]
        </div>
        <div style={{ marginBottom: 16, fontSize: 18, opacity: 0.7 }}>Name:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.wrongNames.map(name => (
            <button
              key={name}
              onClick={() => handlePick(name)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(57,255,20,0.4)',
                color: '#39ff14',
                fontFamily: 'VT323, monospace',
                fontSize: 20,
                padding: '8px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: 1,
              }}
              onMouseOver={e => e.target.style.background = 'rgba(57,255,20,0.1)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LocationSelectOverlay ─────────────────────────────────────
function LocationSelectOverlay({ correctLocation, onWrong, onFinish }) {
  const [showReply, setShowReply] = useState(false);

  const handleSelect = (option) => {
    if (option === correctLocation) {
      onFinish(0);
    } else {
      setShowReply(true);
      setTimeout(() => {
        onWrong();
      }, 2000);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    }}>
      <div style={{ maxWidth: 480, border: '1px solid rgba(57,255,20,0.5)', padding: '24px 28px', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ color: '#ffb000', marginBottom: 4, letterSpacing: 2, fontSize: 20 }}>
          [ PARTNER: WHERE DID YOU PUT THE KEYS? ]
        </div>
        <div style={{ color: 'rgba(57,255,20,0.45)', fontSize: 18, marginBottom: 12 }}>
          Location not saved to memory — you're guessing
        </div>
        {showReply ? (
          <div style={{ color: '#ffb000', fontSize: 21, marginBottom: 8 }}>
            Partner: "They're not there. I already checked."
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {LOCATION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(57,255,20,0.4)',
                  color: '#39ff14',
                  fontFamily: 'VT323, monospace',
                  fontSize: 20,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  letterSpacing: 1,
                }}
                onMouseOver={e => e.target.style.background = 'rgba(57,255,20,0.1)'}
                onMouseOut={e => e.target.style.background = 'transparent'}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── LocationSearchGrid ────────────────────────────────────────
function LocationSearchGrid({ correctCellIndex, onFound }) {
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [partnerMsg, setPartnerMsg] = useState('');
  const [found, setFound] = useState(false);

  const handleCell = (i) => {
    if (found) return;
    if (i === correctCellIndex) {
      setFound(true);
      onFound(wrongGuesses);
    } else {
      const newCount = wrongGuesses + 1;
      setWrongGuesses(newCount);
      setPartnerMsg('Still looking...');
      setTimeout(() => setPartnerMsg(''), 1500);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 11,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ maxWidth: 560, width: '100%', border: '1px solid rgba(57,255,20,0.5)', padding: '24px 20px', background: 'rgba(0,0,0,0.85)' }}>
        <div style={{ color: '#ffb000', letterSpacing: 2, fontSize: 20, marginBottom: 12 }}>
          [ SEARCHING FOR KEYS... ]
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
          {SEARCH_GRID_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => handleCell(i)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(57,255,20,0.3)',
                color: '#39ff14',
                fontFamily: 'VT323, monospace',
                fontSize: 21,
                padding: '8px 4px',
                cursor: found ? 'default' : 'pointer',
                textAlign: 'center',
                opacity: found && i === correctCellIndex ? 1 : found ? 0.4 : 1,
                background: found && i === correctCellIndex ? 'rgba(57,255,20,0.2)' : 'transparent',
              }}
              onMouseOver={e => { if (!found) e.target.style.background = 'rgba(57,255,20,0.08)'; }}
              onMouseOut={e => { if (!found) e.target.style.background = 'transparent'; }}
            >
              {label}
            </button>
          ))}
        </div>
        {partnerMsg && (
          <div style={{ color: '#ffb000', fontSize: 18, marginBottom: 8 }}>
            Partner: "{partnerMsg}" (+1 min)
          </div>
        )}
        {wrongGuesses > 0 && !found && (
          <div style={{ fontSize: 21, opacity: 0.6 }}>
            Searched {wrongGuesses} location{wrongGuesses !== 1 ? 's' : ''}...
          </div>
        )}
        {found && (
          <div style={{ color: '#39ff14', fontSize: 15 }}>
            [ KEYS FOUND ]<br/>
            <span style={{ color: '#ffb000', fontSize: 13 }}>
              Time lost: {wrongGuesses} min{wrongGuesses !== 1 ? 's' : ''}<br/>
              Partner mood: -{wrongGuesses * 2}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ActivityMap ───────────────────────────────────────────────
function ActivityMap({
  physicsRef,
  profileRef,
  driveRef,
  audioRef,
  activeOverlay,
  overlayData,
  onOverlayEvent,
  pendingInitRef,
  initPhysics,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragStateRef = useRef({ type: null, nodeId: null, offsetX: 0, offsetY: 0, lastX: 0, lastY: 0, velX: 0, velY: 0, holdStart: null });

  // ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const dpr = window.devicePixelRatio || 1;
      const newW = Math.round(width * dpr);
      const newH = Math.round(height * dpr);
      if (!newW || !newH) return;
      if (canvas.width !== newW || canvas.height !== newH) {
        if (physicsRef.current) {
          // Re-scatter proportionally on resize
          const scaleX = newW / (canvas.width || newW);
          const scaleY = newH / (canvas.height || newH);
          physicsRef.current.taskNodes.forEach(n => {
            n.x = clamp(n.x * scaleX, n.w / 2 + 5, newW - n.w / 2 - 5);
            n.y = clamp(n.y * scaleY, n.h / 2 + 5, newH - n.h / 2 - 5);
          });
          physicsRef.current.intrusiveNodes.forEach(n => {
            n.x *= scaleX; n.y *= scaleY;
          });
          physicsRef.current.focusBox.x = clamp(physicsRef.current.focusBox.x * scaleX, 30, newW - 30);
          physicsRef.current.focusBox.y = clamp(physicsRef.current.focusBox.y * scaleY, 30, newH - 30);
        } else if (pendingInitRef.current) {
          // First observation after game start — canvas now has real dimensions, init physics
          initPhysics(pendingInitRef.current, newW, newH);
          pendingInitRef.current = null;
        }
        canvas.width = newW;
        canvas.height = newH;
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;
    initAudio(audioRef);
    const pos = getCanvasPos(e, canvas);
    const phys = physicsRef.current;
    const ds = dragStateRef.current;

    // Task nodes (reverse order)
    for (let i = phys.taskNodes.length - 1; i >= 0; i--) {
      const node = phys.taskNodes[i];
      if (node.status === 'complete' || node.status === 'forgotten') continue;
      // Cannot drag the hyperfocus-locked node
      if (phys.hyperfocus && node.id === phys.hyperfocusTaskId) continue;
      if (nodeHitTest(node, pos.x, pos.y)) {
        node.dragging = true;
        ds.type = 'task';
        ds.nodeId = node.id;
        ds.offsetX = pos.x - node.x;
        ds.offsetY = pos.y - node.y;
        ds.lastX = pos.x;
        ds.lastY = pos.y;
        ds.velX = 0;
        ds.velY = 0;
        ds.holdStart = null;
        node.snapProgress = 0;
        return;
      }
    }

    // Intrusive nodes (reverse order)
    for (let i = phys.intrusiveNodes.length - 1; i >= 0; i--) {
      const node = phys.intrusiveNodes[i];
      if (node.ejected) continue;
      if (nodeHitTest(node, pos.x, pos.y)) {
        node.dragging = true;
        ds.type = 'intrusive';
        ds.nodeId = node.id;
        ds.offsetX = pos.x - node.x;
        ds.offsetY = pos.y - node.y;
        ds.lastX = pos.x;
        ds.lastY = pos.y;
        ds.velX = 0;
        ds.velY = 0;
        return;
      }
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;
    const pos = getCanvasPos(e, canvas);
    const phys = physicsRef.current;
    const ds = dragStateRef.current;
    const profile = profileRef.current;

    if (ds.type === 'box') {
      phys.focusBox.x = pos.x - ds.offsetX;
      phys.focusBox.y = pos.y - ds.offsetY;
    } else if (ds.type === 'task') {
      const node = phys.taskNodes.find(n => n.id === ds.nodeId);
      if (!node) return;

      const desiredX = pos.x - ds.offsetX;
      const desiredY = pos.y - ds.offsetY;

      const effectiveCost = node.initiationCost !== undefined ? node.initiationCost : profile.initiationCost;
      let costMod = effectiveCost;
      if (driveRef.current > 80) costMod *= 0.75;

      // In-box tasks: free drag, no snap logic (physics update handles box-exit)
      if (node.isInBox) {
        node.x = desiredX;
        node.y = desiredY;
        ds.velX = pos.x - ds.lastX;
        ds.velY = pos.y - ds.lastY;
        ds.lastX = pos.x;
        ds.lastY = pos.y;
        return;
      }

      // Tasks that have been in the box before bypass the initiation barrier
      const alreadyStarted = node.decaying || node.timeInBox > 0;

      // Hold-to-snap: cursor must stay inside box for this long before node pops in
      // If an exclusive task is currently active in the box, initiation energy is infinite!
      const isBlockedByExclusive = phys.exclusiveTaskActive && phys.exclusiveTaskActive !== node.id;

      const HOLD_REQUIRED_MS = isBlockedByExclusive ? Infinity : (alreadyStarted ? 0 : costMod * 3200);
      const REPULSION_RADIUS = isBlockedByExclusive ? 450 : (alreadyStarted ? 0 : 300);

      // Vector from box centre to desired node position
      const bdx = desiredX - phys.focusBox.x;
      const bdy = desiredY - phys.focusBox.y;
      const bDist = Math.sqrt(bdx * bdx + bdy * bdy) || 1;

      const halfW = phys.focusBox.w / 2;
      const halfH = phys.focusBox.h / 2;
      const cursorInBox = Math.abs(bdx) < halfW && Math.abs(bdy) < halfH;

      if (isBlockedByExclusive) {
        let dirX = bdx / bDist;
        let dirY = bdy / bDist;
        if (bdx === 0 && bdy === 0) {
          dirX = 1;
          dirY = 0;
        }

        let push = 0;
        if (bDist < REPULSION_RADIUS) {
          const proximity = 1 - (bDist / REPULSION_RADIUS);
          const pushFactor = 40.0;
          push = proximity * proximity * pushFactor * 260;
        }

        // Check if the node at this push distance would intersect/touch the box
        const testX = desiredX + dirX * push;
        const testY = desiredY + dirY * push;
        const intersectX = testX + node.w / 2 >= phys.focusBox.x - halfW && testX - node.w / 2 <= phys.focusBox.x + halfW;
        const intersectY = testY + node.h / 2 >= phys.focusBox.y - halfH && testY - node.h / 2 <= phys.focusBox.y + halfH;
        const touchesBox = intersectX && intersectY;

        if (touchesBox || cursorInBox) {
          // Force it to remain outside the box by keeping a minimum push distance
          const minPush = Math.max(halfW + node.w / 2, halfH + node.h / 2) + 30;
          push = Math.max(push, minPush);
        }

        node.x = desiredX + dirX * push;
        node.y = desiredY + dirY * push;
        node.snapProgress = 0;
        node.blockedByExclusive = true;

        ds.velX = pos.x - ds.lastX;
        ds.velY = pos.y - ds.lastY;
        ds.lastX = pos.x;
        ds.lastY = pos.y;
        return;
      }

      if (cursorInBox) {
        // Cursor inside box — hold timer runs, node pinned to box edge
        if (isBlockedByExclusive) {
          node.blockedByExclusive = true;
          node.snapProgress = 0;
          ds.holdStart = null;
        } else {
          node.blockedByExclusive = false;
          if (!ds.holdStart) ds.holdStart = Date.now();
          const held = Date.now() - ds.holdStart;
          node.snapProgress = Math.min(1, held / HOLD_REQUIRED_MS);

          if (held >= HOLD_REQUIRED_MS) {
            // ── SNAP IN ──
            node.x = phys.focusBox.x;
            node.y = phys.focusBox.y;
            node.vx = 0;
            node.vy = 0;
            node.isInBox = true;
            node.dragging = false;
            node.timeInBox = 0;
            node.decaying = false;
            node.decayTimer = 0;
            node.snapFlash = 500;
            // Exclusive/Body task: eject everything else from box and claim exclusivity
            if (isExclusiveNode(node)) {
              phys.exclusiveTaskActive = node.id;
              if (node.isBodyTask) {
                phys.bodyTaskActive = node.bodyKey;
              }
              phys.taskNodes.forEach(n => {
                if (n.isInBox && n.id !== node.id) {
                  n.isInBox = false;
                  n.vx = (Math.random() - 0.5) * 10;
                  n.vy = (Math.random() - 0.5) * 10;
                  n.decaying = true; n.decayTimer = 0;
                }
              });
            }
            node.snapProgress = 0;
            ds.type = null;
            ds.holdStart = null;
            playSnap(audioRef);
            // Hyperfocus trigger — only on eligible tasks, only once per session
            if (node.canHyperfocus && !phys.hyperfocus && !phys.forcedEventFired['hyperfocus_' + node.id] && Math.random() < (node.hyperfocusProbability || 0)) {
              phys.forcedEventFired['hyperfocus_' + node.id] = true;
              phys.hyperfocus = true;
              phys.hyperfocusTaskId = node.id;
              // Eject all other in-box tasks
              phys.taskNodes.forEach(n => {
                if (n.isInBox && n.id !== node.id) {
                  n.isInBox = false;
                  n.vx = (Math.random() - 0.5) * 10;
                  n.vy = (Math.random() - 0.5) * 10;
                  n.decaying = true; n.decayTimer = 0;
                }
              });
              // Pick 4 nagging thoughts, spread across canvas
              const cw = canvas ? canvas.width : 800;
              const ch = canvas ? canvas.height : 600;
              const shuffled = [...HYPERFOCUS_NAGGING].sort(() => Math.random() - 0.5).slice(0, 4);
              phys.nagThoughts = shuffled.map((n, i) => {
                const margin = 80;
                return {
                  ...n,
                  x: margin + Math.random() * (cw - margin * 2),
                  y: margin + Math.random() * (ch - margin * 2),
                  alpha: 0,
                  speed: 0.25 + Math.random() * 0.5,
                  phase: Math.random() * Math.PI * 2,
                };
              });
            }
            if (node.conversationEvent && !phys.forcedEventFired['conv_' + node.id]) {
              phys.forcedEventFired['conv_' + node.id] = true;
              phys.pendingOverlay = { type: 'conversation', nodeId: node.id, data: node.conversationData };
            }
            if (node.id === 'email_volunteer' && !phys.forcedEventFired['email_select']) {
              phys.forcedEventFired['email_select'] = true;
              phys.pendingOverlay = { type: 'name_select', nodeId: node.id, data: node.conversationData || morningTasks.find(t => t.id === 'meet_volunteer').conversationData };
            }
            if (node.id === 'tell_partner_keys' && !phys.forcedEventFired['location_tell']) {
              phys.forcedEventFired['location_tell'] = true;
              phys.pendingOverlay = { type: 'location_tell', nodeId: node.id, data: { correctLocation: phys.keysActualLocation } };
            }
            return;
          }
        }

        // Pin node to box boundary in the approach direction
        // Find point on box edge along the vector from box centre to cursor
        const scaleX = halfW / (Math.abs(bdx) || 0.001);
        const scaleY = halfH / (Math.abs(bdy) || 0.001);
        const scale = Math.min(scaleX, scaleY);
        node.x = phys.focusBox.x + bdx * scale;
        node.y = phys.focusBox.y + bdy * scale;

      } else {
        // Cursor outside box — reset hold timer, apply repulsion
        ds.holdStart = null;
        node.snapProgress = 0;
        node.blockedByExclusive = false;

        if (bDist < REPULSION_RADIUS) {
          // Exponential repulsion: strongest near box edge, fades to zero at radius
          const proximity = 1 - (bDist / REPULSION_RADIUS);
          // push magnitude: strong repulsion if blocked by exclusive
          const pushFactor = isBlockedByExclusive ? 40.0 : costMod;
          const push = proximity * proximity * pushFactor * 260;
          node.x = desiredX + (bdx / bDist) * push;
          node.y = desiredY + (bdy / bDist) * push;
        } else {
          node.x = desiredX;
          node.y = desiredY;
        }
      }

      ds.velX = pos.x - ds.lastX;
      ds.velY = pos.y - ds.lastY;
      ds.lastX = pos.x;
      ds.lastY = pos.y;
    } else if (ds.type === 'intrusive') {
      const node = phys.intrusiveNodes.find(n => n.id === ds.nodeId);
      if (!node) return;

      const desiredX = pos.x - ds.offsetX;
      const desiredY = pos.y - ds.offsetY;

      if (node.isInBox) {
        // Trapped inside — cannot be dragged out without holding to snap out
        const hw = phys.focusBox.w / 2 - node.w / 2 - 4;
        const hh = phys.focusBox.h / 2 - node.h / 2 - 4;
        
        // Are we dragging it towards the outside?
        const bdx = desiredX - phys.focusBox.x;
        const bdy = desiredY - phys.focusBox.y;
        const outside = Math.abs(bdx) > hw || Math.abs(bdy) > hh;

        if (outside) {
          // Pin to inner boundary
          node.x = clamp(desiredX, phys.focusBox.x - hw, phys.focusBox.x + hw);
          node.y = clamp(desiredY, phys.focusBox.y - hh, phys.focusBox.y + hh);

          // Reverse initiation energy hold
          if (!ds.holdStart) ds.holdStart = Date.now();
          const held = Date.now() - ds.holdStart;
          const costMod = node.stickiness || 0.75;
          const HOLD_REQUIRED_MS = costMod * 2200; // time required to snap out (e.g. ~1.65 seconds)
          node.snapProgress = Math.min(1, held / HOLD_REQUIRED_MS);

          if (held >= HOLD_REQUIRED_MS) {
            // SNAP OUT!
            node.isInBox = false;
            node.x = desiredX;
            node.y = desiredY;
            node.snapProgress = 0;
            node.justSnappedOut = true;
            ds.holdStart = null;
            playSnap(audioRef);
          }
        } else {
          // Dragging freely inside
          node.x = desiredX;
          node.y = desiredY;
          node.snapProgress = 0;
          ds.holdStart = null;
        }
      } else {
        // Already outside: drag freely
        node.x = desiredX;
        node.y = desiredY;
        node.snapProgress = 0;
        ds.holdStart = null;
      }

      ds.velX = pos.x - ds.lastX;
      ds.velY = pos.y - ds.lastY;
      ds.lastX = pos.x;
      ds.lastY = pos.y;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const phys = physicsRef.current;
    if (!phys) return;
    const ds = dragStateRef.current;

    if (ds.type === 'intrusive') {
      const node = phys.intrusiveNodes.find(n => n.id === ds.nodeId);
      if (node) {
        node.dragging = false;
        node.snapProgress = 0; // Reset hold progress on release
        
        console.log(`[Telemetry] handleMouseUp for intrusive node. ID: ${node.id}, isInBox: ${node.isInBox}, dragsLeft: ${node.dragsLeft}`);
        // Dragging a distraction away (so it is outside the box) and releasing it always counts as a drag-away!
        if (!node.isInBox) {
          if (node.dragsLeft > 1) {
            node.dragsLeft -= 1;
            node.progress = node.dragsLeft / (node.maxDrags || 3);
            console.log(`[Telemetry] Distraction drag-away. ID: ${node.id}, Remaining dragsLeft: ${node.dragsLeft}`);
            
            // Push away velocity: a gentle push away from the box so it starts drifting back in
            const dx = node.x - phys.focusBox.x;
            const dy = node.y - phys.focusBox.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            node.vx = (dx / dist) * 6;
            node.vy = (dy / dist) * 6;
            
            playSnap(audioRef);
          } else {
            // Defeated! Fly away quickly off-screen
            node.dragsLeft = 0;
            node.progress = 0;
            const dx = node.x - phys.focusBox.x;
            const dy = node.y - phys.focusBox.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            node.vx = (dx / dist) * 18;
            node.vy = (dy / dist) * 18;
            node.ejected = true;
            console.log(`[Telemetry] Distraction DEFEATED. ID: ${node.id}, flying off-screen.`);
            
            if (node.rewarding) {
              driveRef.current = clamp(driveRef.current - 5, 0, 100);
            }
            playEject(audioRef);
          }
        }
      }
    } else if (ds.type === 'task') {
      const node = phys.taskNodes.find(n => n.id === ds.nodeId);
      if (node) {
        node.dragging = false;
        node.snapProgress = 0;
      }
    }
    ds.holdStart = null;
    ds.type = null;
  }, []);

  const canvasPointerEvents = activeOverlay ? 'none' : 'auto';

  return (
    <div ref={containerRef} style={{
      background: '#080808',
      border: '1px solid rgba(57,255,20,0.3)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{ position: 'absolute', top: 6, left: 10, fontSize: 21, opacity: 0.4, zIndex: 2, letterSpacing: 2, pointerEvents: 'none' }}>
        [ ACTIVITY MAP ]
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', pointerEvents: canvasPointerEvents }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {activeOverlay === 'conversation' && overlayData && (
        <ConversationOverlay
          data={overlayData.data}
          taskInBox={overlayData.taskInBox}
          onComplete={() => onOverlayEvent({ type: 'conversation_complete' })}
          onImpulsiveResponse={() => onOverlayEvent({ type: 'impulsive_response' })}
        />
      )}
      {activeOverlay === 'name_select' && overlayData && (
        <NameSelectOverlay
          data={overlayData.data}
          onSelect={(name) => onOverlayEvent({ type: 'name_selected', name })}
        />
      )}
      {activeOverlay === 'location_tell' && overlayData && (
        <LocationSelectOverlay
          correctLocation={overlayData.data.correctLocation}
          onWrong={() => onOverlayEvent({ type: 'location_wrong_first' })}
          onFinish={(wrongCount) => onOverlayEvent({ type: 'location_tell_done', wrongCount })}
        />
      )}
      {activeOverlay === 'location_search' && overlayData && (
        <LocationSearchGrid
          correctCellIndex={overlayData.data.correctCellIndex}
          onFound={(wrongGuesses) => onOverlayEvent({ type: 'location_found', wrongGuesses })}
        />
      )}
    </div>
  );
}

// ── ConfigScreen ──────────────────────────────────────────────
function ConfigScreen({ onBegin }) {
  const [profile, setProfile] = useState({
    focusLevel: 0.4,
    impulsivity: 0.7,
    workingMemory: 0.3,
    rewardSensitivity: 0.6,
    medicated: false,
    initiationCost: 0.8,
    distractability: 0.6,
  });

  const sliders = [
    { key: 'focusLevel', label: 'FOCUS LEVEL', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'impulsivity', label: 'IMPULSIVITY', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'workingMemory', label: 'WORKING MEMORY', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'rewardSensitivity', label: 'REWARD SENSITIVITY', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'initiationCost', label: 'INITIATION COST', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'distractability', label: 'DISTRACTABILITY', min: 0.1, max: 1.0, step: 0.05 },
  ];

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
    }}>
      <div style={{
        width: '100%', maxWidth: 600,
        border: '1px solid rgba(57,255,20,0.4)',
        background: 'rgba(0,0,0,0.8)',
        padding: '32px 36px',
        fontFamily: 'VT323, monospace',
        color: '#39ff14',
      }}>
        <div style={{ fontSize: 28, letterSpacing: 4, marginBottom: 4 }}>ADHD MIND SIMULATOR</div>
        <div style={{ fontSize: 20, opacity: 0.5, marginBottom: 4, letterSpacing: 2 }}>v1.0 — MORNING SESSION</div>
        <div style={{ borderBottom: '1px solid rgba(57,255,20,0.2)', marginBottom: 24, paddingBottom: 8, fontSize: 18, opacity: 0.6, lineHeight: 1.5 }}>
          A physics simulation of ADHD cognition. Drag tasks into the Focus Box to work on them. Keep them there to make progress.
        </div>

        {sliders.map(({ key, label, min, max, step }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 16 }}>
              <span>{label}</span>
              <span style={{ opacity: 0.7 }}>{profile[key].toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={min} max={max} step={step}
              value={profile[key]}
              onChange={e => setProfile(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
            />
          </div>
        ))}

        <div style={{ marginBottom: 24, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 16 }}>
            <div
              onClick={() => setProfile(p => ({ ...p, medicated: !p.medicated }))}
              style={{
                width: 20, height: 20,
                border: '1px solid #39ff14',
                background: profile.medicated ? '#39ff14' : 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#0a0a0a',
              }}
            >{profile.medicated ? '✓' : ' '}</div>
            <span onClick={() => setProfile(p => ({ ...p, medicated: !p.medicated }))}>[ MEDICATED ]</span>
            {profile.medicated && <span style={{ opacity: 0.5, fontSize: 13 }}>— reduced drift, improved focus</span>}
          </label>
        </div>

        <button
          onClick={() => onBegin(profile)}
          style={{
            display: 'block',
            width: '100%',
            background: 'transparent',
            border: '1px solid #39ff14',
            color: '#39ff14',
            fontFamily: 'VT323, monospace',
            fontSize: 22,
            padding: '12px 24px',
            cursor: 'pointer',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
          onMouseOver={e => { e.target.style.background = 'rgba(57,255,20,0.1)'; e.target.style.boxShadow = '0 0 12px rgba(57,255,20,0.3)'; }}
          onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
        >
          [ BEGIN SESSION ]
        </button>
      </div>
    </div>
  );
}

// ── GameLayout ────────────────────────────────────────────────
function GameLayout({
  meters, drive, tasks, gameTime, score, elapsedMs,
  selectedTaskId, onSelectTask, lastDriveEvent, eventLog, mood,
  physicsRef, profileRef, driveRef, audioRef, medicated,
  activeOverlay, overlayData, onOverlayEvent,
  pendingInitRef, initPhysics, hyperfocus,
}) {
  const panelOpacity = hyperfocus ? 0.12 : 1;
  const panelTransition = 'opacity 1.2s ease';
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'grid',
      gridTemplateColumns: '240px 1fr 260px',
      gridGap: 4,
      padding: 8,
      background: '#0a0a0a',
      boxSizing: 'border-box',
    }}>
      <div style={{ opacity: panelOpacity, transition: panelTransition }}>
        <LeftPanel meters={meters} medicated={medicated} />
      </div>
      <ActivityMap
        physicsRef={physicsRef}
        profileRef={profileRef}
        driveRef={driveRef}
        audioRef={audioRef}
        activeOverlay={activeOverlay}
        overlayData={overlayData}
        onOverlayEvent={onOverlayEvent}
        pendingInitRef={pendingInitRef}
        initPhysics={initPhysics}
      />
      <RightPanel
        gameTime={gameTime}
        drive={drive}
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={onSelectTask}
        score={score}
        elapsedMs={elapsedMs}
        lastDriveEvent={lastDriveEvent}
        eventLog={eventLog}
        mood={mood}
        hyperfocus={hyperfocus}
      />
    </div>
  );
}

// §6 APP ROOT
// ═══════════════════════════════════════════════════════════════

function App() {
  const [state, setState] = useState({
    phase: 'config',
    profile: { focusLevel: 0.4, impulsivity: 0.7, workingMemory: 0.3, rewardSensitivity: 0.6, medicated: false, initiationCost: 0.8, distractability: 0.6 },
    meters: { bladder: 80, hunger: 70, thirst: 75, fatigue: 60 },
    drive: 60,
    tasks: [],
    score: { wellbeing: 0, execFunction: 0, tasksDone: 0 },
    gameTime: 0,
    selectedTaskId: null,
    hyperfocus: false,
    activeOverlay: null,
    overlayData: null,
    eventLog: [],
    mood: 100,
    itemLocations: {},
    relationships: {},
    lastDriveEvent: '',
    elapsedMs: 0,
  });

  const physicsRef = useRef(null);
  const pendingInitRef = useRef(null);
  const driveRef = useRef(60);
  const metersRef = useRef({ bladder: 80, hunger: 70, thirst: 75, fatigue: 60 });
  const profileRef = useRef({ focusLevel: 0.4, impulsivity: 0.7, workingMemory: 0.3, rewardSensitivity: 0.6, medicated: false, initiationCost: 0.8, distractability: 0.6 });
  const rAFRef = useRef(null);
  const audioRef = useRef(null);
  const gameTimeRef = useRef(0);
  const lastFrameRef = useRef(null);
  const lastSyncRef = useRef(0);
  const driveIntegralRef = useRef(0);
  const realElapsedRef = useRef(0);
  const sessionTasksRef = useRef([]);

  // Remove boot message on mount
  useEffect(() => {
    const msg = document.getElementById('boot-msg');
    if (msg) msg.style.display = 'none';
  }, []);

  const initPhysics = useCallback((profile, canvasW, canvasH) => {
    const sessionTasks = pickSessionTasks();
    sessionTasksRef.current = sessionTasks;

    // Scatter task nodes — place with overlap avoidance
    const NODE_W = 220, NODE_H = 60, MIN_GAP = 24;
    const placed = [];
    const forgetMarginX = canvasW * 0.05;
    const forgetMarginY = canvasH * 0.05;
    const spawnBuffer = 30; // buffer inside the forget zone boundary
    const minX = forgetMarginX + NODE_W / 2 + spawnBuffer;
    const maxX = canvasW - forgetMarginX - NODE_W / 2 - spawnBuffer;
    const minY = forgetMarginY + NODE_H / 2 + spawnBuffer;
    const maxY = canvasH - forgetMarginY - NODE_H / 2 - spawnBuffer;

    const tryPlace = () => {
      for (let attempt = 0; attempt < 120; attempt++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        // Reject only if inside the starting focus box area (near the middle)
        const cx = canvasW / 2, cy = canvasH / 2;
        if (Math.abs(x - cx) < 290 && Math.abs(y - cy) < 200) continue;
        // Reject if overlapping another placed node
        const clash = placed.some(p =>
          Math.abs(p.x - x) < NODE_W + MIN_GAP && Math.abs(p.y - y) < NODE_H + MIN_GAP
        );
        if (!clash) { placed.push({ x, y }); return { x, y }; }
      }
      // Fallback: place in safe range
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      placed.push({ x, y });
      return { x, y };
    };
    const taskNodes = sessionTasks.filter(t => !t.lockedUntil).map((t) => {
      const { x, y } = tryPlace();
      return {
        ...t,
        x, y,
        vx: 0, vy: 0,
        w: 220, h: 72,
        progress: 0,
        status: 'pending',
        isInBox: false,
        dragging: false,
        decaying: false,
        decayTimer: 0,
        snapFlash: 0,
        snapProgress: 0,
        timeInBox: 0,
        nearCompleteBonusGiven: false,
      };
    });

    // Pre-spawn a couple of intrusive thoughts right at start-up
    const initialIntrusive = [];
    for (let i = 0; i < 1; i++) {
      const pos = spawnFromEdge(canvasW, canvasH);
      const thought = intrusiveThoughtPool[Math.floor(Math.random() * intrusiveThoughtPool.length)];
      const maxDrags = 3 + Math.floor(Math.random() * 3); // 3 to 5
      const initNode = {
        id: 'int_init_' + i + '_' + Date.now(),
        label: thought.label,
        stickiness: thought.stickiness,
        rewarding: thought.rewarding,
        reward: 35, // High reward
        maxDrags: maxDrags,
        dragsLeft: maxDrags,
        progress: 1.0,
        isMemo: false,
        x: pos.x, y: pos.y,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        w: 220, h: 72,
        ejected: false, isInBox: false, opacity: 1,
        dragOffX: 0, dragOffY: 0,
      };
      initialIntrusive.push(initNode);
      console.log(`[Telemetry] Pre-spawning startup distraction node. ID: ${initNode.id}, Label: "${initNode.label}", maxDrags/dragsLeft: ${initNode.maxDrags}`);
    }

    physicsRef.current = {
      focusBox: { x: canvasW / 2, y: canvasH / 2, w: PHYSICS.BOX_BASE_W, h: PHYSICS.BOX_BASE_H, vx: 0, vy: 0 },
      taskNodes,
      intrusiveNodes: initialIntrusive,
      frameCount: 0,
      spawnTimer: 8000,
      draggingBox: false,
      forcedEventFired: {},
      meterCritical: {},
      meterWarning: {},
      bodyTaskActive: null,
      exclusiveTaskActive: null,
      hyperfocus: false,
      hyperfocusTaskId: null,
      hyperfocusTimer: 50000 + Math.random() * 30000,
      pendingOverlay: null,
      selectedTaskId: null,
      keysActualLocation: null,
    };
  }, []);

  const handleBegin = useCallback((profile) => {
    profileRef.current = profile;
    driveRef.current = 60;
    metersRef.current = { bladder: 80, hunger: 70, thirst: 75, fatigue: 60 };

    // Canvas isn't mounted yet (phase was 'config') — store profile and let
    // the ResizeObserver call initPhysics once it has real dimensions.
    physicsRef.current = null;
    pendingInitRef.current = profile;

    setState(prev => ({
      ...prev,
      phase: 'playing',
      profile,
      drive: 60,
      meters: { bladder: 80, hunger: 70, thirst: 75, fatigue: 60 },
      tasks: [],
    }));
  }, [initPhysics]);

  // rAF loop
  useEffect(() => {
    if (state.phase !== 'playing') return;

    const tick = (timestamp) => {
      if (lastFrameRef.current === null) lastFrameRef.current = timestamp;
      const dt = Math.min(timestamp - lastFrameRef.current, 100);
      lastFrameRef.current = timestamp;

      const phys = physicsRef.current;
      if (!phys) {
        rAFRef.current = requestAnimationFrame(tick);
        return;
      }

      // Get canvas dimensions from canvas element
      const canvasEl = document.querySelector('#app canvas');
      const canvasW = canvasEl ? canvasEl.width : 800;
      const canvasH = canvasEl ? canvasEl.height : 600;

      // Physics update
      const events = physicsUpdate(physicsRef, profileRef, driveRef, metersRef, dt, canvasW, canvasH);

      // Process physics events
      for (const ev of events) {
        if (ev.type === 'body_task_complete') {
          const m = metersRef.current;
          if (ev.bodyKey && m[ev.bodyKey] !== undefined) {
            m[ev.bodyKey] = clamp((ev.restore || 80), 0, 100);
          }
        }
        if (ev.type === 'hyperfocus_end') {
          // Spawn the nagging thoughts that built up as urgent task nodes
          if (phys.nagThoughts && phys.nagThoughts.length > 0) {
            phys.nagThoughts.forEach(nag => {
              if (!phys.taskNodes.find(n => n.id === nag.id)) {
                const pos = spawnBetweenBoxAndEdge(phys.focusBox, canvasW, canvasH);
                phys.taskNodes.push({
                  ...nag,
                  x: pos.x, y: pos.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  w: 220, h: 72,
                  progress: 0,
                  status: 'pending',
                  isInBox: false,
                  dragging: false,
                  decaying: false,
                  decayTimer: 0,
                  snapFlash: 300,
                  snapProgress: 0,
                  timeInBox: 0,
                  pendingTime: 90001, // start as urgent immediately
                  nearCompleteBonusGiven: false,
                  urgency: nag.urgency === 'critical' ? 'critical' : 'health',
                });
              }
            });
            phys.nagThoughts = null;
          }
          setState(prev => ({ ...prev, hyperfocus: false }));
        }
        if (ev.type === 'task_complete') {
          driveRef.current = clamp(driveRef.current + (ev.reward || 10), 0, 100);
          playDriveSpike(audioRef);

          // Check for locked task unlocks
          const completedTask = morningTasks.find(t => t.id === ev.nodeId);
          if (completedTask) {
            morningTasks
              .filter(t => t.lockedUntil === ev.nodeId)
              .forEach(lockedTask => {
                if (!phys.taskNodes.find(n => n.id === lockedTask.id)) {
                  const pos = spawnBetweenBoxAndEdge(phys.focusBox, canvasW, canvasH);
                  phys.taskNodes.push({
                    ...lockedTask,
                    x: pos.x, y: pos.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    w: 220, h: 72,
                    progress: 0,
                    status: 'pending',
                    isInBox: false,
                    dragging: false,
                    decaying: false,
                    decayTimer: 0,
                    snapFlash: 0,
                    snapProgress: 0,
                    timeInBox: 0,
                    nearCompleteBonusGiven: false,
                  });
                }
              });
          }

          // take_meds → medicated
          if (ev.nodeId === 'take_meds') {
            profileRef.current = { ...profileRef.current, medicated: true };
          }
        }
        if (ev.type === 'location_event_trigger') {
          // Spawn forced intrusive thought
          const pos = spawnFromEdge(canvasW, canvasH);
          const maxDrags = 3 + Math.floor(Math.random() * 3); // 3 to 5
          phys.intrusiveNodes.push({
            id: 'forced_int_' + Date.now(),
            label: '~ wait, what was i doing ~',
            stickiness: 0.95, rewarding: false, reward: 35,
            maxDrags: maxDrags, dragsLeft: maxDrags, progress: 1.0,
            isMemo: false,
            x: pos.x, y: pos.y, vx: 0, vy: 0,
            w: 220, h: 72,
            ejected: false, isInBox: false, opacity: 1,
          });
          // Keys location NOT committed
          phys.keysActualLocation = null;
          // Pick a random wrong location for the search grid
          phys.keysCorrectCell = Math.floor(Math.random() * 12);
          // Keys actual location answer (wrong from user's perspective)
          const wrongFirst = LOCATION_OPTIONS[Math.floor(Math.random() * LOCATION_OPTIONS.length)];
          phys.keysFirstGuessAnswer = wrongFirst === 'By the door' ? 'On the counter' : wrongFirst;
        }
        if (ev.type === 'distraction_rewarding') {
          playDriveSpike(audioRef);
        }
        if (ev.type === 'task_forgotten') {
          playError(audioRef);
        }
        if (ev.type === 'train_of_thought_lost') {
          playError(audioRef);
          const task = morningTasks.find(t => t.id === ev.nodeId);
          const taskLabel = task ? task.label : 'TASK';
          setState(prev => ({
            ...prev,
            eventLog: [...prev.eventLog, {
              type: 'thought_lost',
              summary: `[ TRAIN OF THOUGHT LOST ]\nDistraction blocked focus!\nForgot about: "${taskLabel}"`,
              timestamp: Date.now(),
            }],
          }));
        }
        if (ev.type === 'train_of_thought_recovered') {
          playDriveSpike(audioRef);
          const task = morningTasks.find(t => t.id === ev.nodeId);
          const taskLabel = task ? task.label : 'TASK';
          setState(prev => ({
            ...prev,
            eventLog: [...prev.eventLog, {
              type: 'thought_recovered',
              summary: `[ TRAIN OF THOUGHT RECOVERED ]\nRemembered: "${taskLabel}"!`,
              timestamp: Date.now(),
            }],
          }));
        }
      }

      // Handle pending overlays from canvas snap events
      if (phys.pendingOverlay) {
        const ov = phys.pendingOverlay;
        phys.pendingOverlay = null;
        const taskNode = phys.taskNodes.find(n => n.id === ov.nodeId);
        setState(prev => ({
          ...prev,
          activeOverlay: ov.type,
          overlayData: {
            ...ov,
            taskInBox: taskNode ? taskNode.isInBox : false,
          },
        }));
      }

      // Memory node for volunteer
      if (phys.forcedEventFired['conv_meet_volunteer'] && !phys.forcedEventFired['memo_spawned']) {
        phys.forcedEventFired['memo_spawned'] = true;
        const pos = spawnFromEdge(canvasW, canvasH);
        const maxDrags = 3 + Math.floor(Math.random() * 3); // 3 to 5
        phys.intrusiveNodes.push({
          id: 'memo_volunteer',
          label: '~ volunteer name: Jamie Reeves ~',
          stickiness: 0.9, rewarding: false, reward: 35,
          maxDrags: maxDrags, dragsLeft: maxDrags, progress: 1.0,
          isMemo: true,
          fadeMultiplier: 2.5,
          x: pos.x, y: pos.y, vx: 0, vy: 0,
          w: 220, h: 72,
          ejected: false, isInBox: false, opacity: 1,
        });
      }

      // Render canvas
      const ctx = canvasEl ? canvasEl.getContext('2d') : null;
      if (ctx) renderCanvas(ctx, phys, profileRef.current, driveRef.current);

      // Update game time and real elapsed
      gameTimeRef.current += dt * PHYSICS.GAME_TIME_MULT;
      realElapsedRef.current += dt;

      // Drive integral for wellbeing
      driveIntegralRef.current += driveRef.current * dt;

      // 200ms React sync
      if (timestamp - lastSyncRef.current > 200) {
        lastSyncRef.current = timestamp;
        const currentPhys = physicsRef.current;
        const taskMirror = currentPhys
          ? currentPhys.taskNodes
              .filter(n => !n.reappearTimer || n.reappearTimer <= 0)
              .map(n => ({
                  id: n.id, label: n.label, status: n.status,
                  progress: n.progress, urgency: n.urgency,
              }))
          : [];

        // Count done tasks for exec function score
        const doneTasks = currentPhys ? currentPhys.taskNodes.filter(n => n.status === 'complete') : [];
        const execScore = doneTasks.reduce((acc, t) => {
          const taskData = morningTasks.find(m => m.id === t.id);
          return acc + (taskData ? taskData.reward : 10);
        }, 0);

        setState(prev => {
          // Keep overlayData.taskInBox live for conversation overlay
          let overlayData = prev.overlayData;
          if (prev.activeOverlay === 'conversation' && overlayData && overlayData.nodeId && currentPhys) {
            const convNode = currentPhys.taskNodes.find(n => n.id === overlayData.nodeId);
            if (convNode && overlayData.taskInBox !== convNode.isInBox) {
              overlayData = { ...overlayData, taskInBox: convNode.isInBox };
            }
          }
          return {
            ...prev,
            drive: driveRef.current,
            meters: { ...metersRef.current },
            gameTime: gameTimeRef.current,
            elapsedMs: realElapsedRef.current,
            tasks: taskMirror,
            profile: profileRef.current,
            overlayData,
            hyperfocus: currentPhys ? currentPhys.hyperfocus : false,
            score: {
              wellbeing: Math.round(driveIntegralRef.current / 100000),
              execFunction: execScore,
              tasksDone: doneTasks.length,
            },
          };
        });
      }

      rAFRef.current = requestAnimationFrame(tick);
    };

    rAFRef.current = requestAnimationFrame(tick);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      lastFrameRef.current = null;
    };
  }, [state.phase]);

  const handleOverlayEvent = useCallback((ev) => {
    const phys = physicsRef.current;
    if (ev.type === 'conversation_complete' || ev.type === 'impulsive_response') {
      const penalty = ev.type === 'impulsive_response' ? -3 : 0;
      if (penalty < 0) driveRef.current = clamp(driveRef.current + penalty, 0, 100);
      setState(prev => ({
        ...prev,
        activeOverlay: null,
        overlayData: null,
        eventLog: [...prev.eventLog, {
          type: 'conversation',
          summary: ev.type === 'impulsive_response'
            ? '[ CONVERSATION: responded early ]\nPenalty: exec function -3'
            : '[ CONVERSATION: meet_volunteer complete ]\nMemory node spawned.',
          timestamp: Date.now(),
        }],
      }));
    } else if (ev.type === 'name_selected') {
      // Email volunteer outcome
      const execPenalty = 8;
      const moodPenalty = 4;
      if (phys) {
        const emailNode = phys.taskNodes.find(n => n.id === 'email_volunteer');
        if (emailNode) {
          emailNode.status = 'complete';
          emailNode.progress = 1;
          emailNode.isInBox = false;
        }
      }
      setState(prev => ({
        ...prev,
        activeOverlay: null,
        overlayData: null,
        mood: prev.mood - moodPenalty,
        eventLog: [...prev.eventLog, {
          type: 'name_error',
          summary: `[ EMAIL SENT — ${ev.name} ]\nReply: "Hi! Just to let you know, my name is actually Jamie. No worries at all, happens all the time :)"\n[ RELATIONSHIP: volunteer — awkward start ]\n[ MOOD: -${moodPenalty} ]  [ EXEC FUNCTION: -${execPenalty} ]`,
          timestamp: Date.now(),
        }],
        score: prev.score,
      }));
    } else if (ev.type === 'location_wrong_first') {
      // Show location search grid
      setState(prev => ({
        ...prev,
        activeOverlay: 'location_search',
        overlayData: {
          data: { correctCellIndex: phys ? phys.keysCorrectCell : 5 },
        },
      }));
    } else if (ev.type === 'location_tell_done') {
      setState(prev => ({
        ...prev,
        activeOverlay: null,
        overlayData: null,
      }));
    } else if (ev.type === 'location_found') {
      const { wrongGuesses } = ev;
      const moodPenalty = wrongGuesses * 2;
      setState(prev => ({
        ...prev,
        activeOverlay: null,
        overlayData: null,
        eventLog: [...prev.eventLog, {
          type: 'keys_lost',
          summary: `[ EVENT LOG ]\nKEYS: task marked complete — location not committed to memory\nCause: attention redirected during completion window\nResult: item location unknown — ${wrongGuesses} min${wrongGuesses !== 1 ? 's' : ''} lost searching\nPartner mood: -${moodPenalty}`,
          timestamp: Date.now(),
        }],
      }));
    }
  }, []);

  const handleSelectTask = useCallback((id) => {
    if (physicsRef.current) physicsRef.current.selectedTaskId = id;
    setState(prev => ({ ...prev, selectedTaskId: id }));
  }, []);

  if (state.phase === 'config') {
    return <ConfigScreen onBegin={handleBegin} />;
  }

  return (
    <GameLayout
      meters={state.meters}
      drive={state.drive}
      tasks={state.tasks}
      gameTime={state.gameTime}
      score={state.score}
      elapsedMs={state.elapsedMs}
      selectedTaskId={state.selectedTaskId}
      onSelectTask={handleSelectTask}
      lastDriveEvent={state.lastDriveEvent}
      eventLog={state.eventLog}
      mood={state.mood}
      physicsRef={physicsRef}
      profileRef={profileRef}
      driveRef={driveRef}
      audioRef={audioRef}
      medicated={state.profile ? state.profile.medicated : false}
      activeOverlay={state.activeOverlay}
      overlayData={state.overlayData}
      onOverlayEvent={handleOverlayEvent}
      pendingInitRef={pendingInitRef}
      initPhysics={initPhysics}
      hyperfocus={state.hyperfocus}
    />
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('app')).render(<App />);
