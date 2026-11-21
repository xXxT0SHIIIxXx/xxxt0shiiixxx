const slideTime = 5000;
const swipeDistance = 40;

function createButton(className, label, text){
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
}

function createDots(count, container, goTo){
    const dotBox = document.createElement("div");
    dotBox.className = "carouselDots";
    const dots = [];
    for (let index = 0; index < count; index++){
        const dot = createButton("carouselDot", "Show image " + (index + 1), "");
        dot.addEventListener("click", () => goTo(index));
        dotBox.appendChild(dot);
        dots.push(dot);
    }
    container.appendChild(dotBox);
    return dots;
}

function setupCarousel(container){
    const carousel = container.querySelector(".carousel");
    const slides = carousel.querySelectorAll(".carouselImage");
    if (slides.length < 2) return;

    let slideIndex = 0;
    let timer = 0;
    let touchStart = 0;

    const prevButton = createButton("carouselControl carouselControl--prev", "Previous image", "<");
    const nextButton = createButton("carouselControl carouselControl--next", "Next image", ">");
    container.append(prevButton, nextButton);

    function showSlide(index){
        slides[slideIndex].classList.remove("carouselImage--active");
        dots[slideIndex].classList.remove("carouselDot--active");
        slideIndex = (index + slides.length) % slides.length;
        slides[slideIndex].classList.add("carouselImage--active");
        dots[slideIndex].classList.add("carouselDot--active");
    }

    function stopTimer(){
        clearInterval(timer);
        timer = 0;
    }

    function startTimer(){
        stopTimer();
        if (document.hidden) return;
        timer = setInterval(() => showSlide(slideIndex + 1), slideTime);
    }

    function goTo(index){
        showSlide(index);
        startTimer();
    }

    const dots = createDots(slides.length, container, goTo);

    prevButton.addEventListener("click", () => goTo(slideIndex - 1));
    nextButton.addEventListener("click", () => goTo(slideIndex + 1));
    container.addEventListener("mouseenter", stopTimer);
    container.addEventListener("mouseleave", startTimer);
    document.addEventListener("visibilitychange", startTimer);
    carousel.addEventListener("touchstart", event => { touchStart = event.touches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", event => {
        const distance = event.changedTouches[0].clientX - touchStart;
        if (Math.abs(distance) > swipeDistance) goTo(slideIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    carousel.classList.add("carousel--ready");
    showSlide(0);
    startTimer();
}

document.querySelectorAll(".carouselContainer").forEach(setupCarousel);
