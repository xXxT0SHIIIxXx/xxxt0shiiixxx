const sectionLinks = document.querySelectorAll(".vertical-nav a[data-section]");
const defaultSection = "music-projects";

function showSection(sectionId){
    const selectedSection = document.getElementById(sectionId);
    if (!selectedSection) return;
    document.querySelectorAll(".project-section.active").forEach(section => section.classList.remove("active"));
    selectedSection.classList.add("active");
    sectionLinks.forEach(link => link.classList.toggle("active", link.dataset.section === sectionId));
}

function getHashSection(){
    const match = [...sectionLinks].find(link => link.hash === location.hash);
    return match ? match.dataset.section : defaultSection;
}

function onNavClick(event){
    const link = event.target.closest("a[data-section]");
    if (!link) return;
    event.preventDefault();
    history.replaceState(null, "", link.hash);
    showSection(link.dataset.section);
}

document.querySelector(".vertical-nav").addEventListener("click", onNavClick);
window.addEventListener("hashchange", () => showSection(getHashSection()));
showSection(getHashSection());
