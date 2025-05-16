document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const applyBtn = document.getElementById('apply-btn');
  const toggleExtensionBtn = document.getElementById('toggle-extension-btn');
  const preview = document.querySelector('.preview');
  const poemLine1 = document.getElementById('poem-line1');
  const poemLine2 = document.getElementById('poem-line2');
  const poetName = document.getElementById('poet-name');
  const linkedin = document.getElementById('linkedin');
  const github = document.getElementById('github');
  const clickSound = document.getElementById('click-sound');
  const currentSiteSpan = document.getElementById('current-site');
  const excludeSiteBtn = document.getElementById('exclude-site-btn');
  const includeSiteBtn = document.getElementById('include-site-btn');
  const excludedSitesList = document.getElementById('excluded-sites-list');
  const includedSitesList = document.getElementById('included-sites-list');
  const excludedDropdownToggle = document.querySelector('.excluded-sites .dropdown-toggle');
  const includedDropdownToggle = document.querySelector('.included-sites .dropdown-toggle');
  const selectedFontDiv = document.querySelector('.selected-font');
  const fontList = document.querySelector('.font-list');
  const fontItems = document.querySelectorAll('.font-item');
  const versionNumber = document.getElementById('version-number');

  const themes = ['light', 'dark', 'blue'];
  const themeIcons = {
    light: '<i class="fas fa-sun"></i>',
    dark: '<i class="fas fa-moon"></i>',
    blue: '<i class="fas fa-water"></i>'
  };
  let currentThemeIndex = 0;
  let selectedFont = 'vazir';
  let isExtensionEnabled = true;
  let excludedSites = [];
  let includedSites = [];

  // آپدیت خودکار
  function checkForUpdates() {
    chrome.runtime.requestUpdateCheck((status) => {
      if (status === 'update_available') {
        chrome.runtime.reload();
      }
    });
  }

  // دریافت پیام انگیزشی (شعر دو خطی یا تک‌خطی)
  function fetchMotivationalMessage() {
    const today = new Date().toISOString().split('T')[0];
    const url = 'https://persianfontchanger-default-rtdb.firebaseio.com/motivational_messages.json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
          let messageData = data[today] || data['last_message'] || {
            line1: 'هر روز یه فرصت جدیده برای پیشرفت!',
            line2: '',
            poet: ''
          };

          // اگه فقط یه خط بود
          poemLine1.textContent = messageData.line1 || '';
          poemLine2.textContent = messageData.line2 || '';
          poetName.textContent = messageData.poet ? `"${messageData.poet}"` : '';

          chrome.storage.sync.set({ lastMessage: messageData });
        })
        .catch(() => {
          chrome.storage.sync.get('lastMessage', (data) => {
            const messageData = data.lastMessage || {
              line1: 'هر روز یه فرصت جدیده برای پیشرفت!',
              line2: '',
              poet: ''
            };
            poemLine1.textContent = messageData.line1 || '';
            poemLine2.textContent = messageData.line2 || '';
            poetName.textContent = messageData.poet ? `"${messageData.poet}"` : '';
          });
        });
  }

  // تنظیم تم پیش‌فرض
  document.body.className = 'light';

  // بارگذاری تنظیمات ذخیره‌شده
  chrome.storage.sync.get(['font', 'theme', 'isExtensionEnabled', 'excludedSites', 'includedSites'], (data) => {
    if (data.font) {
      selectedFont = data.font;
      selectedFontDiv.textContent = Array.from(fontItems).find(item => item.dataset.value === data.font)?.textContent || 'وزیر 📜';
      preview.style.fontFamily = `'${data.font}', sans-serif`;
      applyFont(data.font);
    }

    if (data.theme) {
      currentThemeIndex = themes.indexOf(data.theme);
      document.body.className = themes[currentThemeIndex];
      themeToggle.innerHTML = themeIcons[themes[currentThemeIndex]];
    }

    if (typeof data.isExtensionEnabled !== 'undefined') {
      isExtensionEnabled = data.isExtensionEnabled;
    }
    toggleExtensionBtn.innerHTML = isExtensionEnabled ? '✅' : '❌';
    toggleExtensionBtn.classList.toggle('off', !isExtensionEnabled);

    if (data.excludedSites) {
      excludedSites = data.excludedSites;
      updateExcludedSitesList();
    }
    if (data.includedSites) {
      includedSites = data.includedSites;
      updateIncludedSitesList();
    }

    fetchMotivationalMessage(); // پیام رو بارگذاری کن
  });

  // نمایش دامنه سایت فعلی
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    currentSiteSpan.textContent = domain;

    if (excludedSites.includes(domain)) {
      excludeSiteBtn.disabled = true;
    }
    if (includedSites.includes(domain)) {
      includeSiteBtn.disabled = true;
    }
  });

  // نمایش نسخه افزونه
  versionNumber.textContent = chrome.runtime.getManifest().version;

  // باز و بسته کردن لیست فونت‌ها
  selectedFontDiv.addEventListener('click', () => {
    fontList.classList.toggle('active');
  });

  // انتخاب فونت
  fontItems.forEach(item => {
    item.addEventListener('click', () => {
      clickSound.play();
      selectedFont = item.dataset.value;
      selectedFontDiv.textContent = item.textContent;
      preview.style.fontFamily = `'${selectedFont}', sans-serif`;
      fontList.classList.remove('active');
    });
  });

  // بستن لیست فونت‌ها اگر کاربر جای دیگه کلیک کرد
  document.addEventListener('click', (e) => {
    if (!selectedFontDiv.contains(e.target) && !fontList.contains(e.target)) {
      fontList.classList.remove('active');
    }
  });

  // تغییر تم
  themeToggle.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const theme = themes[currentThemeIndex];
    document.body.className = theme;
    themeToggle.innerHTML = themeIcons[theme];
    chrome.storage.sync.set({ theme });
  });

  // اعمال تغییرات
  applyBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ font: selectedFont });
    applyFont(selectedFont);
  });

  // فعال/غیرفعال کردن افزونه
  toggleExtensionBtn.addEventListener('click', () => {
    isExtensionEnabled = !isExtensionEnabled;
    toggleExtensionBtn.innerHTML = isExtensionEnabled ? '✅' : '❌';
    toggleExtensionBtn.classList.toggle('off', !isExtensionEnabled);
    chrome.storage.sync.set({ isExtensionEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleExtension',
        isEnabled: isExtensionEnabled,
        font: isExtensionEnabled ? selectedFont : null
      });
    });
  });

  // باز و بسته کردن دراپ‌داون Excluded
  excludedDropdownToggle.addEventListener('click', () => {
    excludedSitesList.classList.toggle('active');
  });

  // باز و بسته کردن دراپ‌داون Included
  includedDropdownToggle.addEventListener('click', () => {
    includedSitesList.classList.toggle('active');
  });

  // بستن دراپ‌داون‌ها اگر کاربر جای دیگه کلیک کرد
  document.addEventListener('click', (e) => {
    if (!excludedDropdownToggle.contains(e.target) && !excludedSitesList.contains(e.target)) {
      excludedSitesList.classList.remove('active');
    }
    if (!includedDropdownToggle.contains(e.target) && !includedSitesList.contains(e.target)) {
      includedSitesList.classList.remove('active');
    }
  });

  // مستثنی کردن سایت
  excludeSiteBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      if (!excludedSites.includes(domain)) {
        excludedSites.push(domain);
        chrome.storage.sync.set({ excludedSites });
        updateExcludedSitesList();
        excludeSiteBtn.disabled = true;
        includedSites = includedSites.filter(site => site !== domain);
        chrome.storage.sync.set({ includedSites });
        updateIncludedSitesList();
        includeSiteBtn.disabled = false;
        chrome.tabs.sendMessage(tabs[0].id, { reset: true });
      }
    });
  });

  // شامل کردن سایت
  includeSiteBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      if (!includedSites.includes(domain)) {
        includedSites.push(domain);
        chrome.storage.sync.set({ includedSites });
        updateIncludedSitesList();
        includeSiteBtn.disabled = true;
        excludedSites = excludedSites.filter(site => site !== domain);
        chrome.storage.sync.set({ excludedSites });
        updateExcludedSitesList();
        excludeSiteBtn.disabled = false;
        applyFont(selectedFont);
      }
    });
  });

  // به‌روزرسانی لیست سایت‌های مستثنی
  function updateExcludedSitesList() {
    excludedSitesList.innerHTML = '';
    excludedSites.forEach(site => {
      const div = document.createElement('div');
      const siteSpan = document.createElement('span');
      siteSpan.textContent = site;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        excludedSites = excludedSites.filter(s => s !== site);
        chrome.storage.sync.set({ excludedSites });
        updateExcludedSitesList();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = new URL(tabs[0].url);
          const domain = url.hostname;
          if (site === domain) {
            excludeSiteBtn.disabled = false;
            applyFont(selectedFont);
          }
        });
      });
      div.appendChild(siteSpan);
      div.appendChild(removeBtn);
      excludedSitesList.appendChild(div);
    });
  }

  // به‌روزرسانی لیست سایت‌های شامل
  function updateIncludedSitesList() {
    includedSitesList.innerHTML = '';
    includedSites.forEach(site => {
      const div = document.createElement('div');
      const siteSpan = document.createElement('span');
      siteSpan.textContent = site;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        includedSites = includedSites.filter(s => s !== site);
        chrome.storage.sync.set({ includedSites });
        updateIncludedSitesList();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = new URL(tabs[0].url);
          const domain = url.hostname;
          if (site === domain) {
            includeSiteBtn.disabled = false;
            chrome.tabs.sendMessage(tabs[0].id, { reset: true });
          }
        });
      });
      div.appendChild(siteSpan);
      div.appendChild(removeBtn);
      includedSitesList.appendChild(div);
    });
  }

  // انیمیشن تایپینگ برای لینک‌ها
  function startTypingAnimation() {
    linkedin.innerHTML = '<i class="fab fa-linkedin"></i> ';
    github.innerHTML = '<i class="fab fa-github"></i> ';

    typeText(linkedin, 'LinkedIn', () => {
      linkedin.innerHTML = `<i class="fab fa-linkedin"></i> <a href="https://www.linkedin.com/in/alireza-bagheri-a585b0239/" target="_blank">LinkedIn</a>`;
    });

    typeText(github, 'GitHub', () => {
      github.innerHTML = `<i class="fab fa-github"></i> <a href="https://github.com/alireza-baqeri" target="_blank">GitHub</a>`;
    });

    setTimeout(() => {
      linkedin.style.opacity = '0';
      github.style.opacity = '0';
      setTimeout(() => {
        linkedin.style.opacity = '1';
        github.style.opacity = '1';
        startTypingAnimation();
      }, 500);
    }, 7000);
  }

  startTypingAnimation();

  // فراخوانی آپدیت و پیام
  checkForUpdates();
  setInterval(fetchMotivationalMessage, 24 * 60 * 60 * 1000); // هر ۲۴ ساعت
});

function applyFont(font) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { font });
  });
}

function typeText(element, text, callback) {
  let i = 0;
  const speed = 100;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}