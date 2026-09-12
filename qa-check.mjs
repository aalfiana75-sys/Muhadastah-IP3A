export default async function run(page, ui) {
  const result = await page.evaluate(() => {
    return {
      hasEsc: typeof window.esc,
      hasSafeIcon: typeof window.safeIcon,
      hasEscJs: typeof window.escJs,
      hasDbLoadAll: typeof window.dbLoadAll,
      hasSbOn: typeof window.sbOn,
      hasSetAccessToken: typeof window.setAccessToken,
      dbSource: typeof window.DB_SOURCE !== 'undefined' ? window.DB_SOURCE : null,
      dialogsRendered: document.querySelectorAll('#dialogGrid > div').length,
      vocabRows: document.querySelectorAll('#vocabGrid tbody tr').length,
      escWorks: window.esc ? window.esc('<img src=x onerror=alert(1)>') : 'NO_ESC'
    };
  });

  // Uji XSS: suntikkan payload ke data, pastikan ter-render sebagai teks.
  await page.evaluate(() => {
    if (!window.DIALOGS) return;
    window.DIALOGS[0].title.id = '<img src=x onerror="window.__xss=1">';
    window.renderDialogs('');
  });
  const xss = await page.evaluate(() => ({
    injected: Boolean(window.__xss),
    imgTags: document.querySelectorAll('#dialogGrid img').length,
    escapedText: document.querySelector('#dialogGrid > div p.font-extrabold')?.textContent || ''
  }));

  return { ...result, xss };
}
