const params = new URLSearchParams(window.location.search);
const targetUrl = params.get("target");
const matches = JSON.parse(params.get("matches") || "[]");

let selectedIndex = 0;
const options = [];

function render() {
  const list = document.getElementById("options");

  matches.forEach((match, i) => {
    const li = document.createElement("li");
    li.className = "option";
    li.setAttribute("role", "option");
    li.innerHTML = `
      <span class="option-label">Switch to: ${escapeHtml(match.title || "Untitled")}</span>
      <span class="option-url">${escapeHtml(match.url)}</span>
    `;
    li.addEventListener("click", () => {
      selectedIndex = i;
      updateSelection();
      confirm();
    });
    list.appendChild(li);
    options.push({ type: "switch", match, el: li });
  });

  const openLi = document.createElement("li");
  openLi.className = "option";
  openLi.setAttribute("role", "option");
  openLi.innerHTML = `
    <span class="option-action">Open new tab for ${escapeHtml(targetUrl)}</span>
  `;
  const openIndex = matches.length;
  openLi.addEventListener("click", () => {
    selectedIndex = openIndex;
    updateSelection();
    confirm();
  });
  list.appendChild(openLi);
  options.push({ type: "open", el: openLi });

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = "↑↓ to navigate · Enter to confirm · Esc to close";
  list.parentElement.appendChild(hint);

  updateSelection();
}

function updateSelection() {
  options.forEach((opt, i) => {
    opt.el.setAttribute("aria-selected", i === selectedIndex ? "true" : "false");
  });
  options[selectedIndex].el.scrollIntoView({ block: "nearest" });
}

async function confirm() {
  const selected = options[selectedIndex];
  console.log('[Chooser] Confirming selection:', selected.type);

  if (selected.type === "switch") {
    try {
      const currentTab = await chrome.tabs.getCurrent();
      console.log('[Chooser] Switching to tab', selected.match.id, 'from tab', currentTab.id);

      const response = await chrome.runtime.sendMessage({
        type: "switchToTab",
        targetTabId: selected.match.id,
        windowId: selected.match.windowId,
        senderTabId: currentTab.id,
      });

      console.log('[Chooser] Switch response:', response);

      if (!response || !response.ok) {
        console.error('[Chooser] Tab switch failed, navigating normally');
        window.location.href = targetUrl;
      }
    } catch (error) {
      console.error('[Chooser] Error switching tabs:', error);
      window.location.href = targetUrl;
    }
  } else {
    try {
      const currentTab = await chrome.tabs.getCurrent();
      console.log('[Chooser] Opening new tab for', targetUrl);

      await chrome.runtime.sendMessage({
        type: "allowTab",
        tabId: currentTab.id,
      });

      console.log('[Chooser] Navigating to', targetUrl);
      window.location.href = targetUrl;
    } catch (error) {
      console.error('[Chooser] Error in open new:', error);
      window.location.href = targetUrl;
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
      updateSelection();
      break;
    case "ArrowUp":
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
      break;
    case "Enter":
      e.preventDefault();
      confirm();
      break;
    case "Escape":
      e.preventDefault();
      chrome.tabs.getCurrent().then((tab) => chrome.tabs.remove(tab.id));
      break;
  }
});

render();
