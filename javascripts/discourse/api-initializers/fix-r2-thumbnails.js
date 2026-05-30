import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {

  if (settings.bad_cloudflare_r2_url === "" || settings.s3_cdn_url == "");
    return;
  }

  const badDomain = settings.bad_cloudflare_r2_url;
  const goodDomain = settings.s3_cdn_url;

  function fixImage(img) {
    if (img.src && img.src.includes(badDomain)) {
      img.src = img.src.replace(badDomain, goodDomain);
    }
    if (img.dataset?.src && img.dataset.src.includes(badDomain)) {
      img.dataset.src = img.dataset.src.replace(badDomain, goodDomain);
    }
  }

  // 1. Safely fix images rendered in standard posts/HTML
  api.decorateCooked($elem => {
    const container = $elem[0];
    if (!container) return;
    
    container.querySelectorAll(`img[src*="${badDomain}"]`).forEach(fixImage);
  }, { id: 'fix-r2-chat-bug' });

  // 2. High-performance observer strictly for dynamically injected Chat elements
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      
      // If a new chat message or element is injected into the DOM
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if (node.tagName === 'IMG') fixImage(node);
            
            // Only search INSIDE the new node, not the whole document
            node.querySelectorAll(`img[src*="${badDomain}"]`).forEach(fixImage);
          }
        }
      } 
      // If an existing image's src attribute changes (lazy loading)
      else if (mutation.type === 'attributes') {
        if (mutation.target.tagName === 'IMG') {
          fixImage(mutation.target);
        }
      }
    }
  });

  // Start the observer immediately
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-src']
  });
});
