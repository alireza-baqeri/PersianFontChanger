document.addEventListener('DOMContentLoaded', () => {
  const fontSelect = document.getElementById('font-select');
  const persianNumbers = document.getElementById('persian-numbers');
  const themeSelect = document.getElementById('theme-select');
  const linkedin = document.getElementById('linkedin');
  const github = document.getElementById('github');

  // بارگذاری تنظیمات ذخیره‌شده
  chrome.storage.sync.get(['font', 'persianNumbers', 'theme'], (data) => {
    if (data.font) fontSelect.value = data.font;
    if (data.persianNumbers) persianNumbers.checked = data.persianNumbers;
    if (data.theme) {
      themeSelect.value = data.theme;
      document.body.className = `theme-${data.theme}`;
    }
  });

  // ذخیره و اعمال تغییرات فونت
  fontSelect.addEventListener('change', () => {
    const font = fontSelect.value;
    chrome.storage.sync.set({ font });
    applyFont(font, persianNumbers.checked);
  });

  // ذخیره و اعمال تغییرات اعداد پارسی
  persianNumbers.addEventListener('change', () => {
    const usePersianNumbers = persianNumbers.checked;
    chrome.storage.sync.set({ persianNumbers: usePersianNumbers });
    applyFont(fontSelect.value, usePersianNumbers);
  });

  // تغییر تم
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    chrome.storage.sync.set({ theme });
    document.body.className = `theme-${theme}`;
  });

  // انیمیشن تایپینگ برای لینک‌ها
  typeText(linkedin, 'LinkedIn', () => {
    linkedin.innerHTML = `<a href="https://www.linkedin.com/in/alireza-bagheri-a585b0239/" target="_blank">LinkedIn</a>`;
  });
  typeText(github, 'GitHub', () => {
    github.innerHTML = `<a href="https://github.com/alireza-baqeri" target="_blank">GitHub</a>`;
  });
});

function applyFont(font, persianNumbers) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { font, persianNumbers });
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