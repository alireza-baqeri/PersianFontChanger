chrome.runtime.onMessage.addListener((message) => {
  const { font, persianNumbers } = message;
  const fontFaces = {
    vazir: 'url("fonts/Vazir.woff2")',
    samim: 'url("fonts/Samim.woff2")',
    shabnam: 'url("fonts/Shabnam.woff2")',
    iranyekan: 'url("fonts/IRANYekan.woff2")'
  };

  // اضافه کردن فونت به صفحه
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'CustomFont';
      src: ${fontFaces[font]};
    }
    * {
      font-family: 'CustomFont', sans-serif !important;
    }
  `;
  document.head.appendChild(style);

  // تبدیل اعداد به پارسی
  if (persianNumbers) {
    document.body.innerHTML = document.body.innerHTML.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }
});