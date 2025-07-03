gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
	lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const pinnedSection = document.querySelector(".pinned");
const stickyHeader = document.querySelector(".sticky-header");
const cards = document.querySelectorAll(".card");
const progressBarContainer = document.querySelector(".progress-bar");
const progressBar = document.querySelector(".progress");
const indicesContainer = document.querySelector(".indices");
const indices = document.querySelectorAll(".index");
const cardCount = cards.length;
const pinnedHeight = window.innerHeight * (cardCount + 1);
const startRotations = [0, 5, 0, -5];
const endRotations = [10, -5, 10, 5];
const progressColors = ["#ecb74c", "#7dd8cd", "#e0ff57", "#7dd8cd"];

cards.forEach((card, index) => {
	gsap.set(card, { rotation: startRotations[index] });
});

let isProgressBarVisible = false;
let currentActiveIndex = -1;

function animateIndexOpacity(newIndex) {
	if (newIndex !== currentActiveIndex) {
		indices.forEach((index, i) => {
			gsap.to(index, {
				opacity: i === newIndex ? 1 : 0.25,
				duration: 0.5,
				ease: "power2.Out",
			});
		});

		currentActiveIndex = newIndex;
	}
}

function showProgressAndIndices() {
	gsap.to([progressBarContainer, indicesContainer], {
		opacity: 1,
		duration: 0.5,
		ease: "power2.Out",
	});
	isProgressBarVisible = true;
	animateIndexOpacity(-1);
}

function hideProgressAndIndices() {
	gsap.to([progressBarContainer, indicesContainer], {
		opacity: 0,
		duration: 0.5,
		ease: "power2.Out",
	});
	isProgressBarVisible = false;
	animateIndexOpacity(-1);
}

ScrollTrigger.create({
	trigger: pinnedSection,
	start: "top top",
	end: `+=${pinnedHeight}`,
	pin: true,
	pinSpacing: true,
	onLeave: () => {
		hideProgressAndIndices();
	},
	onEnterBack: () => {
		showProgressAndIndices();
	},
	onUpdate: (self) => {
		const progress = self.progress * (cardCount + 1);
		const currentCard = Math.floor(progress);

		if (progress <= 1) {
			gsap.to(stickyHeader, {
				opacity: 1 - progress,
				duration: 0.1,
				ease: "none",
			});
		} else {
			gsap.set(stickyHeader, {
				opacity: 0,
			});
		}

		if (progress > 1 && !isProgressBarVisible) {
			showProgressAndIndices();
		} else if (progress <= 1 && isProgressBarVisible) {
			hideProgressAndIndices();
		}

		let progressHeight = 0;
		let colorIndex = -1;
		if (progress > 1) {
			progressHeight = ((progress - 1) / cardCount) * 100;
			colorIndex = Math.min(Math.floor(progress - 1), cardCount - 1);
		}

		gsap.to(progressBar, {
			height: `${progressHeight}%`,
			backgroundColor: progressColors[colorIndex],
			ease: "power1.Out",
			duration: 0.3,
		});

		if (isProgressBarVisible) {
			animateIndexOpacity(colorIndex);
		}

		cards.forEach((card, index) => {
			if (index < currentCard) {
				gsap.set(card, {
					rotation: endRotations[index],
					top: "50%",
				});
			} else if (index === currentCard) {
				const cardProgress = progress - currentCard;
				const newTop = gsap.utils.interpolate(150, 50, cardProgress);
				const newRotation = gsap.utils.interpolate(
					startRotations[index],
					endRotations[index],
					cardProgress
				);
				gsap.set(card, {
					rotation: newRotation,
					top: `${newTop}%`,
				});
			} else {
				gsap.set(card, {
					rotation: startRotations[index],
					top: "150%",
				});
			}
		});
	},
});
