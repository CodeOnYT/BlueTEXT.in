const footerLinks = document.querySelectorAll('footer a');

footerLinks.forEach(link => {
  link.addEventListener('click', handleLinkClick);
});

function handleLinkClick(event) {
  event.preventDefault();

  const clickedLink = event.target;
  const targetUrl = clickedLink.href;

  fetch(targetUrl)
    .then(response => response.text())
    .then(htmlContent => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Option 1: Extract entire `<main>` content
      const mainContent = doc.querySelector('main#content-container');

      // Option 2: Extract specific content (modify selector as needed)
      // const specificContent = doc.querySelector('#some-specific-element');

      // Inject content into existing page
      const contentContainer = document.getElementById('content-container');
      contentContainer.innerHTML = mainContent?.outerHTML || '';

      // Handle potential errors (e.g., missing element)
    })
    .catch(error => {
      console.error('Error fetching content:', error);
      // Display error message to user (optional)
    });
}