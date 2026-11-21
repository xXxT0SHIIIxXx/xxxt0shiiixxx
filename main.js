const typeSelector = ".typed, .typedLeft";
const animatedSelector = ".typed, .typedLeft, .reveal";
const sectionPages = [["/Projects/", "skills.html"], ["/BlogPosts/", "blog.html"], ["/Zines/", "blog.html"]];
const charTime = 55;
const staggerTime = 90;
const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -8% 0px", threshold: 0 }) : null;

function getSitePath(){
    const homeLink = document.querySelector('.Text__nav[href$="index.html"]');
    const rootPath = homeLink ? homeLink.pathname.replace(/index\.html$/, "") : "/";
    return "/" + location.pathname.slice(rootPath.length);
}

function getPageName(){
    const sitePath = decodeURIComponent(getSitePath());
    const match = sectionPages.find(([folder]) => sitePath.startsWith(folder));
    if (match) return match[1];
    const fileName = sitePath.split("/").pop();
    return fileName || "index.html";
}

function markActiveNav(){
    const pageName = getPageName();
    document.querySelectorAll(".Text__nav").forEach(link => {
        const linkName = link.getAttribute("href").split("/").pop();
        if (linkName !== pageName) return;
        link.classList.add("Text__nav--active");
        link.setAttribute("aria-current", "page");
    });
}

function getTypeTime(element){
    const charCount = Math.max(element.textContent.trim().length, 1);
    return Math.min(Math.max(charCount * charTime, 600), 2000);
}

function prepareTyping(element){
    const charCount = Math.max(element.textContent.trim().length, 1);
    element.style.setProperty("--typeSteps", charCount);
    element.style.setProperty("--typeTime", getTypeTime(element) + "ms");
}

function showBatch(elements){
    let typeDelay = 0;
    let revealIndex = 0;
    let lastParent = null;
    elements.forEach(element => {
        if (element.matches(typeSelector)){
            if (element.parentElement !== lastParent) typeDelay = 0;
            element.style.setProperty("--typeDelay", typeDelay + "ms");
            typeDelay += getTypeTime(element) * 0.6;
            lastParent = element.parentElement;
        } else {
            element.style.setProperty("--revealDelay", Math.min(revealIndex * staggerTime, 450) + "ms");
            revealIndex++;
        }
        element.classList.add("isVisible");
    });
}

function onIntersect(entries, observer){
    const visible = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
    visible.forEach(element => observer.unobserve(element));
    showBatch(visible);
}

function observeAnimated(root){
    const elements = root.querySelectorAll(animatedSelector);
    root.querySelectorAll(typeSelector).forEach(prepareTyping);
    if (!revealObserver){
        elements.forEach(element => element.classList.add("isVisible"));
        return;
    }
    elements.forEach(element => revealObserver.observe(element));
}

markActiveNav();
observeAnimated(document);
