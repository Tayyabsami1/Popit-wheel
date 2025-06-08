import { gsap } from 'gsap/dist/gsap.js'
import { stopAndResetBalloons } from '$lib/utils/animations'

// Use smaller, specific import for matchMedia
const mm = gsap.matchMedia();

// Limit active animations
let isAnimating = false;

function getDynamicY() {
    const pxValue = -150;
    const vwValue = -window.innerWidth * 0.1;
    return Math.min(pxValue, vwValue);
}

function resetAfterCollision(
    balloon: HTMLImageElement,
    arrowImage: HTMLImageElement
): void {
    // Reset balloon and arrow positions without restarting the entire animation
    gsap.set(balloon, { y: getDynamicY() }); // Reset balloon position to initial state

    mm.add("(max-width: 548px)", () => {
        gsap.set(arrowImage, { x: "-100%", y: "-27%" }); // Adjust position
    });

    mm.add("(max-width: 380px)", () => {
        gsap.set(arrowImage, { x: "-100%", y: "-30%" }); // Adjust position
    });

    mm.add("(min-width: 549px)", () => {
        // For screens 769px and larger (desktop)
        gsap.set(arrowImage, { x: "-100%", y: "-50%" }); // Default position
    });

}

function isCollision(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}


export async function startAnimation(): Promise<void> {
    // Prevent multiple animations from running simultaneously
    if (isAnimating) {
        return Promise.resolve();
    }
    
    isAnimating = true;
    
    return new Promise((resolve) => {
        // Create pop container
        const popContainer = document.createElement("div");
        popContainer.classList.add("pop_container");

        const targetDiv = document.createElement("div")
        targetDiv.classList.add('targetDiv')
        popContainer.appendChild(targetDiv)

        const balloonImages = [
            "/images/balloon-1.png",
            "/images/balloon-2.png",
            "/images/balloon-3.png",
            "/images/balloon-4.png",
            "/images/balloon-5.png"
        ];

        // Select a random balloon image
        const selectedBalloon = balloonImages[Math.floor(Math.random() * balloonImages.length)];

        // Create balloon image
        const balloon = document.createElement("img");
        balloon.classList.add("popup-balloon");
        balloon.src = selectedBalloon; // Replace with actual image path

        // Create arrow image
        const arrowImage = document.createElement("img");
        arrowImage.classList.add("popup-arrow");
        arrowImage.src = "/images/arrow-img.png"; // Replace with actual image path

        // Append elements
        popContainer.appendChild(balloon);
        popContainer.appendChild(arrowImage);
        document.body.appendChild(popContainer);

        // Animate balloon
        gsap.set(balloon, { y: getDynamicY() });

        gsap.to(balloon, {
            y: "100vh",
            duration: 5,
            ease: "power1.inOut",
            onUpdate: () => {
                const balloonRect = balloon.getBoundingClientRect();
                // const targetRect = document.getElementById("targetDiv")?.getBoundingClientRect();
                const targetRect = document.querySelector(".targetDiv")?.getBoundingClientRect();

                if (targetRect && isCollision(balloonRect, targetRect)) {
                    chaseBalloon(balloon, arrowImage, resolve);
                }
            }
        });

        // Arrow Chasing Function
        let arrowChaseFrame: number | null = null;

        function chaseBalloon(
            selectedBalloon: HTMLImageElement,
            arrowImage: HTMLImageElement,
            resolve: () => void
        ): void {
            const arrowRectInitial = arrowImage.getBoundingClientRect();
            let arrowPos = { x: arrowRectInitial.left, y: arrowRectInitial.top };
            const chaseFactor = 0.04;

            function update() {
                const balloonRect = selectedBalloon.getBoundingClientRect();
                const balloonCenter = {
                    x: balloonRect.left + balloonRect.width / 2,
                    y: balloonRect.top + balloonRect.height / 2 + 60,
                };

                arrowPos.x += (balloonCenter.x - arrowPos.x) * chaseFactor;
                arrowPos.y += (balloonCenter.y - arrowPos.y) * chaseFactor;

                const translateX = arrowPos.x - arrowRectInitial.left;
                const translateY = arrowPos.y - arrowRectInitial.top;
                arrowImage.style.transform = `translate(${translateX}px, ${translateY}px)`;                const arrowRect = arrowImage.getBoundingClientRect();
                if (isCollision(arrowRect, balloonRect)) {
                    resetAfterCollision(balloon, arrowImage);
                    popContainer.remove();
                    stopAndResetBalloons();
                    
                    if (arrowChaseFrame) {
                        cancelAnimationFrame(arrowChaseFrame);
                        arrowChaseFrame = null;
                    }
                    
                    // Mark animation as complete
                    isAnimating = false;

                    resolve(); // Resolve the Promise when collision occurs
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
