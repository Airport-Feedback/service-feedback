(function () {
  // Configuration object - can be customized
  const config = window.FeedbackWidgetConfig || {};

  const position = config.position || 'bottom-right';
  const primaryColor = config.primaryColor || '%23365fb8'; // URL encoded blue
  const companyName = config.companyName || 'Company';
  const baseUrl = config.baseUrl || window.location.origin;
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/widget-export?position=${position}&color=${primaryColor}&company=${encodeURIComponent(companyName)}`;
  iframe.style.cssText = `
    position: fixed !important;
    ${position.includes('bottom') ? 'bottom: 16px !important;' : 'top: 16px !important;'}
    ${position.includes('right') ? 'right: 16px !important;' : 'left: 16px !important;'}
    width: 345px !important;
    height: 400px !important;
    border: none !important;
    z-index: 999999 !important;
    pointer-events: none !important;
    background: transparent !important;
  `;
  iframe.setAttribute("scrolling", "yes");
  // Allow pointer events only on the widget area
  iframe.onload = function () {
    iframe.style.pointerEvents = 'auto';
  };

  // Append to body
  document.body.appendChild(iframe);
})();