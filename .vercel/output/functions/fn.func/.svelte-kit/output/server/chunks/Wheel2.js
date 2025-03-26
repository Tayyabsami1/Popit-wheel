import { S as pop, Q as push } from "./index.js";
import gsap from "gsap";
import { w as wheelStore, b as playTick, c as playLoopedSound, e as playSound, f as cancelLoopingSounds } from "./Audio.js";
import { W as Wheel } from "./Wheel.js";
const createBusyStore = (initialState) => {
  let spinning = initialState;
  return {
    get spinning() {
      return spinning;
    },
    set spinning(newValue) {
      spinning = newValue;
    }
  };
};
const busyStore = createBusyStore(false);
function getDynamicY$1() {
  const pxValue = -150;
  const vwValue = -window.innerWidth * 0.1;
  return Math.min(pxValue, vwValue);
}
function animateBalloons() {
  const balloonWrapper = document.createElement("div");
  balloonWrapper.classList.add("balloonWrapper");
  document.body.appendChild(balloonWrapper);
  for (let i = 0; i < 10; i++) {
    const balloon = document.createElement("img");
    balloon.src = `/images/balloon-${i % 5 + 1}.png`;
    balloon.classList.add("balloon");
    balloonWrapper.appendChild(balloon);
  }
  const bounds = {
    width: balloonWrapper.clientWidth,
    height: balloonWrapper.clientHeight
  };
  const balloons = balloonWrapper.querySelectorAll(".balloon");
  balloons.forEach((balloon, index) => {
    function getRandomX() {
      return Math.random() * (bounds.width * 0.8);
    }
    function moveBalloon() {
      gsap.set(balloon, {
        y: getDynamicY$1(),
        x: getRandomX(),
        opacity: 1
      });
      gsap.to(balloon, {
        y: bounds.height,
        duration: Math.random() * 5 + 4,
        ease: "linear",
        delay: Math.floor(index / 1) * 1,
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          gsap.set(balloon, { y: getDynamicY$1(), x: getRandomX() });
        }
      });
    }
    moveBalloon();
  });
}
function stopAndResetBalloons() {
  const balloonWrapper = document.querySelector(".balloonWrapper");
  if (balloonWrapper) {
    const balloons = balloonWrapper.querySelectorAll(".balloon");
    balloons.forEach((balloon) => {
      gsap.killTweensOf(balloon);
      gsap.set(balloon, {
        y: getDynamicY$1(),
        opacity: 0
      });
    });
    balloonWrapper.remove();
  }
}
const mm = gsap.matchMedia();
function getDynamicY() {
  const pxValue = -150;
  const vwValue = -window.innerWidth * 0.1;
  return Math.min(pxValue, vwValue);
}
function resetAfterCollision(balloon, arrowImage) {
  gsap.set(balloon, { y: getDynamicY() });
  mm.add("(max-width: 548px)", () => {
    gsap.set(arrowImage, { x: "-100%", y: "-27%" });
  });
  mm.add("(max-width: 380px)", () => {
    gsap.set(arrowImage, { x: "-100%", y: "-30%" });
  });
  mm.add("(min-width: 549px)", () => {
    gsap.set(arrowImage, { x: "-100%", y: "-50%" });
  });
}
function isCollision(rect1, rect2) {
  return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}
async function startAnimation() {
  return new Promise((resolve) => {
    const popContainer = document.createElement("div");
    popContainer.classList.add("pop_container");
    const targetDiv = document.createElement("div");
    targetDiv.classList.add("targetDiv");
    popContainer.appendChild(targetDiv);
    const balloonImages = [
      "/images/balloon-1.png",
      "/images/balloon-2.png",
      "/images/balloon-3.png",
      "/images/balloon-4.png",
      "/images/balloon-5.png"
    ];
    const selectedBalloon = balloonImages[Math.floor(Math.random() * balloonImages.length)];
    const balloon = document.createElement("img");
    balloon.classList.add("popup-balloon");
    balloon.src = selectedBalloon;
    const arrowImage = document.createElement("img");
    arrowImage.classList.add("popup-arrow");
    arrowImage.src = "/images/arrow-img.png";
    popContainer.appendChild(balloon);
    popContainer.appendChild(arrowImage);
    document.body.appendChild(popContainer);
    gsap.set(balloon, { y: getDynamicY() });
    gsap.to(balloon, {
      y: "100vh",
      duration: 5,
      ease: "power1.inOut",
      onUpdate: () => {
        const balloonRect = balloon.getBoundingClientRect();
        const targetRect = document.querySelector(".targetDiv")?.getBoundingClientRect();
        if (targetRect && isCollision(balloonRect, targetRect)) {
          chaseBalloon(balloon, arrowImage, resolve);
        }
      }
    });
    let arrowChaseFrame = null;
    function chaseBalloon(selectedBalloon2, arrowImage2, resolve2) {
      const arrowRectInitial = arrowImage2.getBoundingClientRect();
      let arrowPos = { x: arrowRectInitial.left, y: arrowRectInitial.top };
      const chaseFactor = 0.04;
      function update() {
        const balloonRect = selectedBalloon2.getBoundingClientRect();
        const balloonCenter = {
          x: balloonRect.left + balloonRect.width / 2,
          y: balloonRect.top + balloonRect.height / 2 + 60
        };
        arrowPos.x += (balloonCenter.x - arrowPos.x) * chaseFactor;
        arrowPos.y += (balloonCenter.y - arrowPos.y) * chaseFactor;
        const translateX = arrowPos.x - arrowRectInitial.left;
        const translateY = arrowPos.y - arrowRectInitial.top;
        arrowImage2.style.transform = `translate(${translateX}px, ${translateY}px)`;
        const arrowRect = arrowImage2.getBoundingClientRect();
        if (isCollision(arrowRect, balloonRect)) {
          resetAfterCollision(balloon, arrowImage2);
          popContainer.remove();
          stopAndResetBalloons();
          if (arrowChaseFrame) {
            cancelAnimationFrame(arrowChaseFrame);
            arrowChaseFrame = null;
          }
          resolve2();
          return;
        }
        arrowChaseFrame = requestAnimationFrame(update);
      }
      if (!arrowChaseFrame) {
        update();
      }
    }
  });
}
function Wheel_1($$payload, $$props) {
  push();
  const onStarted = () => {
    busyStore.spinning = true;
    animateBalloons();
    if (wheel.config.duringSpinSound === "tick") {
      wheel.onPointerIndexChanged = () => {
        playTick(wheel.config.duringSpinSoundVolume);
      };
    } else {
      delete wheel.onPointerIndexChanged;
      if (wheel.config.duringSpinSound) {
        playLoopedSound(wheel.config.duringSpinSound, wheel.config.duringSpinSoundVolume);
      }
    }
  };
  const onStopped = async (data) => {
    cancelLoopingSounds();
    await startAnimation();
    busyStore.spinning = false;
    if (wheel.config.afterSpinSound) {
      playSound(wheel.config.afterSpinSound, wheel.config.afterSpinSoundVolume);
    }
    wheelStore.winners = [...wheelStore.winners, data.winner];
  };
  const wheel = new Wheel({ ...wheelStore, onStarted, onStopped });
  $$payload.out += `<div class="flex-1 aspect-square max-w-full"><canvas width="700" height="700" class="w-full h-auto rounded-full outline-offset-[-1rem]" aria-label="Wheel" tabindex="0"></canvas></div>`;
  pop();
}
export {
  Wheel_1 as W,
  busyStore as b
};
