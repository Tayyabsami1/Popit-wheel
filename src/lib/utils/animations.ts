import gsap from 'gsap'

function getDynamicY() {
  const pxValue = -150;
  const vwValue = -window.innerWidth * 0.1;
  return Math.min(pxValue, vwValue);
}

export function animateBalloons() {

  const balloonWrapper = document.createElement("div");
  balloonWrapper.classList.add("balloonWrapper");

  document.body.appendChild(balloonWrapper);

  // Generate balloons dynamically
  for (let i = 0; i < 10; i++) {
    const balloon = document.createElement("img");
    balloon.src = `/images/balloon-${(i % 5) + 1}.png`;
    balloon.classList.add("balloon");
    balloonWrapper.appendChild(balloon);
  }

  const bounds = {
    width: balloonWrapper.clientWidth,
    height: balloonWrapper.clientHeight,
  };

  // Select all balloons after they are created
  const balloons = balloonWrapper.querySelectorAll(".balloon") as NodeListOf<HTMLImageElement>;

  balloons.forEach((balloon, index) => {
    function getRandomX() {
      return Math.random() * (bounds.width * 0.8); // 80% of the container width
    }

    function moveBalloon() {
      gsap.set(balloon, {
        y: getDynamicY(),
        x: getRandomX(),
        opacity: 1,
      });

      gsap.to(balloon, {
        y: bounds.height,
        duration: Math.random() * 5 + 4,
        ease: "linear",
        delay: Math.floor(index / 1) * 1,
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          gsap.set(balloon, { y: getDynamicY(), x: getRandomX() });
        },
      });
    }

    moveBalloon();
  });

}

export function stopAndResetBalloons() {

  const balloonWrapper = document.querySelector(".balloonWrapper");

  if (balloonWrapper) {
    const balloons = balloonWrapper.querySelectorAll(".balloon");

    // Stop all animations and reset positions
    balloons.forEach(balloon => {
      gsap.killTweensOf(balloon);
      gsap.set(balloon, {
        y: getDynamicY(), opacity: 0
      });
    });

    // Remove balloons wrapper from DOM
    balloonWrapper.remove();
  }
}
