"""Manual live-browser QA; requires Python Playwright and system Chromium.
This is separate from npm test (DOM tests), and never handles sign-in credentials.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get('GOODSAY_QA_URL', 'https://education-news-site.web.app')
OUT = Path(__file__).resolve().parent.parent / 'artifacts' / 'mobile-qa'
OUT.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    options = {'headless': True, 'executable_path': '/usr/bin/chromium', 'args': ['--no-sandbox']}
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
    if proxy:
        options['proxy'] = {'server': proxy}
    browser = p.chromium.launch(**options)
    for width in [360, 390, 768, 1440]:
        context = browser.new_context(viewport={'width': width, 'height': 844}, device_scale_factor=1, is_mobile=width<768, has_touch=width<768)
        page = context.new_page()
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL, wait_until='networkidle', timeout=45000)
        page.locator('.hero').wait_for()
        def no_overflow():
            return page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        row={'width':width,'home_no_overflow':no_overflow(), 'images_loaded':page.locator('.hero-photo').evaluate('(img)=>img.complete && img.naturalWidth>0')}
        page.screenshot(path=str(OUT / f'home-{width}.png'),full_page=True)
        page.locator('.hero [data-action="quiz-start"]').click()
        page.locator('dialog').wait_for(state='visible')
        row['dialog_no_overflow']=page.locator('dialog').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
        for i in range(4):
            page.locator('dialog [data-action="answer"][data-value="0"]').click()
            if i==3:
                page.locator('#remember-result').check()
            page.locator('dialog [data-action="quiz-next"]').click()
        page.locator('dialog [data-action="share-result"]').wait_for()
        page.locator('dialog [data-action="share-result"]').click()
        row['png_export']=page.locator('#share-canvas').evaluate('(c)=>c.toDataURL("image/png").startsWith("data:image/png;base64,")')
        page.screenshot(path=str(OUT / f'share-{width}.png'))
        page.locator('dialog [data-action="close"]').click()
        page.goto(URL+'/#letters', wait_until='networkidle')
        page.locator('#letter-search').fill('高不存在的字')
        row['search_empty_state']=page.locator('.empty-state').count()==1
        page.locator('[data-action="search-reset"]').click()
        page.locator('.letter-card [data-action="save"]').first.click()
        page.goto(URL+'/#saved',wait_until='networkidle')
        row['bookmark_persisted']=page.locator('.letter-card').count()==1
        row['saved_no_overflow']=no_overflow()
        page.goto(URL+'/#sample',wait_until='networkidle')
        row['sample_no_overflow']=no_overflow()
        page.screenshot(path=str(OUT / f'sample-{width}.png'),full_page=True)
        row['console_errors']=errors
        results.append(row)
        context.close()
    browser.close()
(OUT / 'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
assert all(all(v is True for k,v in r.items() if k!='width' and k!='console_errors') and not r['console_errors'] for r in results)
