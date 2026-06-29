/* ── Nav scroll glass effect ─────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── Side drawer ─────────────────────────────────────────────── */
const menuBtn       = document.getElementById('menu-btn');
const sideDrawer    = document.getElementById('side-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose   = document.getElementById('drawer-close');

function openDrawer() {
  sideDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
  menuBtn.classList.add('open');
  sideDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  sideDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  menuBtn.classList.remove('open');
  sideDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach(a =>
  a.addEventListener('click', closeDrawer)
);
// close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

/* ── Smooth active link highlighting ────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.classList.remove('active'));
      const match = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => io.observe(s));

/* ── Scroll-reveal observer ─────────────────────────────────── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = `${(i % 4) * 80}ms`;
      e.target.classList.add('visible');
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* ── Three.js Neural-Network Hero ───────────────────────────── */
(function () {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 28);

  /* ── Particles ── */
  const COUNT = 200;
  const pos   = new Float32Array(COUNT * 3);
  const vel   = [];

  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random() - .5) * 56;
    pos[i*3+1] = (Math.random() - .5) * 38;
    pos[i*3+2] = (Math.random() - .5) * 28;
    vel.push(
      (Math.random() - .5) * .022,
      (Math.random() - .5) * .016,
      (Math.random() - .5) * .010
    );
  }

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const ptMat = new THREE.PointsMaterial({
    color: 0x2997ff,
    size: 0.32,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  /* ── Connecting lines ── */
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x2997ff,
    transparent: true,
    opacity: 0.10,
  });
  let lineObj = null;

  function rebuildLines() {
    if (lineObj) { scene.remove(lineObj); lineObj.geometry.dispose(); }
    const lp  = [];
    const p   = ptGeo.attributes.position.array;
    const MAX = 9;                       // max connection distance
    const CAP = 320;                     // max line segments (perf)
    let count = 0;
    outer: for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (count >= CAP) break outer;
        const dx = p[i*3]   - p[j*3];
        const dy = p[i*3+1] - p[j*3+1];
        const dz = p[i*3+2] - p[j*3+2];
        if (dx*dx + dy*dy + dz*dz < MAX*MAX) {
          lp.push(p[i*3], p[i*3+1], p[i*3+2],
                  p[j*3], p[j*3+1], p[j*3+2]);
          count++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
    lineObj = new THREE.LineSegments(geo, lineMat);
    scene.add(lineObj);
  }
  rebuildLines();

  /* ── Mouse parallax ── */
  let mx = 0, my = 0;
  let targetMx = 0, targetMy = 0;
  window.addEventListener('mousemove', e => {
    targetMx = (e.clientX / window.innerWidth  - .5) * 2;
    targetMy = (e.clientY / window.innerHeight - .5) * -2;
  }, { passive: true });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  /* ── Render loop ── */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    /* move particles */
    const p = ptGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i*3]   += vel[i*3];
      p[i*3+1] += vel[i*3+1];
      p[i*3+2] += vel[i*3+2];
      if (p[i*3]   >  28) p[i*3]   = -28;
      if (p[i*3]   < -28) p[i*3]   =  28;
      if (p[i*3+1] >  19) p[i*3+1] = -19;
      if (p[i*3+1] < -19) p[i*3+1] =  19;
      if (p[i*3+2] >  14) p[i*3+2] = -14;
      if (p[i*3+2] < -14) p[i*3+2] =  14;
    }
    ptGeo.attributes.position.needsUpdate = true;

    /* rebuild lines every 4 frames */
    if (frame % 4 === 0) rebuildLines();

    /* smooth camera parallax */
    mx += (targetMx - mx) * .045;
    my += (targetMy - my) * .045;
    camera.position.x += (mx * 5   - camera.position.x) * .06;
    camera.position.y += (my * 2.5 - camera.position.y) * .06;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}());
