document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.navigation-links a, footer p a');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const searchIcon = document.querySelector('.search-icon');
    const searchBar = document.querySelector('.search-bar');
    const navigation = document.querySelector('.navigation');

    function handleClick(event) {
        event.preventDefault();

        if (event.target.classList.contains('hamburger-menu') || event.target.closest('.hamburger-menu')) {
            navigation.classList.toggle('active');
        } else if (event.target.classList.contains('search-icon') || event.target.closest('.search-icon')) {
            searchBar.classList.toggle('active');
        } else {
            const page = event.target.getAttribute('data-page') || event.target.href;

            // Fetch and inject content
            fetch(page)
                .then(response => response.text())
                .then(htmlContent => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');
                    const mainContent = doc.querySelector('main#content-container');
                    const contentContainer = document.getElementById('content-container');
                    contentContainer.innerHTML = mainContent?.outerHTML || '';
                })
                .catch(error => {
                    console.error('Error fetching content:', error);
                });
        }
    }

    links.forEach(link => link.addEventListener('click', handleClick));
    hamburgerMenu.addEventListener('click', handleClick);
    searchIcon?.addEventListener('click', handleClick); // Handle potential null searchIcon
});
