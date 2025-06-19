// LinkedIn Jobs Blocker Extension

/**
 * Hides or removes job-related elements from the LinkedIn page.
 */
function hideJobElements() {

    // Hide job links in navigation or lists
    document.querySelectorAll('li > a').forEach(link => {
        if (link.href && link.href.includes('linkedin.com/jobs')) {
            if (link.parentElement) {
                link.parentElement.style.display = 'none';
            }
        }
    });

    document.querySelectorAll('div').forEach(el => {
        //data-id="urn:li:aggregate:(urn:li:jobPosting:4250342568,urn:li:jobPosting:4245278145,urn:li:jobPosting:4251819261,urn:li:jobPosting:4247411928,urn:li:jobPosting:4245269712)"
        if (el.getAttribute('data-id') && el.getAttribute('data-id').includes('urn:li:jobPosting')) {
            el.parentNode.remove();
        }
    });
}

// Run once on script load
hideJobElements();

// Observe DOM changes for dynamically loaded content
const observer = new MutationObserver(() => {
    hideJobElements();
});
observer.observe(document.body, { childList: true, subtree: true });
// This will ensure that any new job-related elements added to the page are also hidden.