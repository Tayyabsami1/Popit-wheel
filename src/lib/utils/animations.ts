import gsap from 'gsap'

function getDynamicY() {
  const pxValue = -150;
  const vwValue = -window.innerWidth * 0.1;
  return Math.min(pxValue, vwValue);
}

// Cache balloon images to prevent repeated loading
const balloonImageCache: { [key: string]: HTMLImageElement } = {};

// Clean up existing animations before starting new ones
function cleanupExistingBalloons() {
  const existingWrapper = document.querySelector(".balloonWrapper");
  if (existingWrapper) {
    stopAndResetBalloons();
  }
}

export function animateBalloons() {
  // Cleanup first to prevent multiple instances
  cleanupExistingBalloons();

  const balloonWrapper = document.createElement("div");
  balloonWrapper.classList.add("balloonWrapper");

  document.body.appendChild(balloonWrapper);

  // Generate fewer balloons for better performance
  const balloonCount = 6; // Reduced from 10 for better performance
  
  // Generate balloons dynamically
  for (let i = 0; i < balloonCount; i++) {
    const balloonIndex = (i % 5) + 1;
    const balloonPath = `/images/balloon-${balloonIndex}.png`;
    
    // Use cached image or create new one
    let balloon: HTMLImageElement;
    
    if (!balloonImageCache[balloonPath]) {
      balloon = document.createElement("img");
      balloon.src = balloonPath;
      balloonImageCache[balloonPath] = balloon;
    } else {
      balloon = balloonImageCache[balloonPath].cloneNode() as HTMLImageElement;
    }
    
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
