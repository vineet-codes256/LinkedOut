# LinkedOut – LinkedIn Job Blocker Extension

LinkedOut is a Chrome extension that helps you stay focused on networking and professional content by **hiding job postings and job-related elements** across LinkedIn.

## Features

- Automatically hides job cards, job search boxes, and job-related navigation links on all LinkedIn pages.
- Works seamlessly with dynamically loaded content using a MutationObserver.
- No data is collected or sent anywhere.

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extension folder.

## Permissions

- **Host Permission:**  
  The extension requests access to `*://*.linkedin.com/*` so it can inject its content script and hide job-related elements on all LinkedIn pages. This is necessary to ensure job postings are consistently blocked, regardless of which LinkedIn subpage you visit.

## How It Works

The extension injects a content script that:
- Hides/removes job-related elements using CSS selectors.
- Observes the DOM for dynamically loaded content and hides new job elements as they appear.

## Customization

If you notice job elements not being hidden, you can update the selectors in `content.js` to match new LinkedIn DOM changes.

## License

MIT License

---

**Stay focused. Stay connected. Stay LinkedOut.**