(() => {
  const hero = document.getElementById("hero");
  const glows = document.getElementById("heroGlows");

  if (!hero || !glows) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let pointerX = 0.5;
  let pointerY = 0.5;
  let currentX = 0.5;
  let currentY = 0.5;
  let raf = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  const render = () => {
    currentX = lerp(currentX, pointerX, 0.06);
    currentY = lerp(currentY, pointerY, 0.06);

    const offsetX = (currentX - 0.5) * 32;
    const offsetY = (currentY - 0.5) * 32;

    glows.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

    raf = requestAnimationFrame(render);
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width;
    pointerY = (event.clientY - rect.top) / rect.height;
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0.5;
    pointerY = 0.5;
  });

  raf = requestAnimationFrame(render);

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches && raf) {
      cancelAnimationFrame(raf);
      glows.style.transform = "";
    }
  });
})();
