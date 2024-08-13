function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.project-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.add('active');
}

// Set default section to show on page load
document.addEventListener('DOMContentLoaded', () => {
    showSection('music-projects');
});