import {expect,test,type Page} from '@playwright/test';
async function menu(page:Page){await page.goto('');await page.getByRole('button',{name:'메뉴 열기'}).click();await expect(page.locator('.sidebar')).toHaveClass(/open/);await page.waitForTimeout(350);}
async function inViewport(page:Page,label:string){const r=await page.getByRole('button',{name:label,exact:true}).boundingBox();expect(r).not.toBeNull();expect(r!.y).toBeGreaterThanOrEqual(0);expect(r!.y+r!.height).toBeLessThanOrEqual(await page.evaluate(()=>innerHeight));}
for(const size of [{width:390,height:480},{width:740,height:360},{width:390,height:480,large:true}]){
 test(`메뉴 휠 입력 왕복 ${JSON.stringify(size)}`,async({page})=>{
  await page.setViewportSize(size);await menu(page);
  if(size.large)await page.addStyleTag({content:'.sidebar {font-size: 150%} .sidebar nav button {font-size: 1.2em;min-height:70px}'});
  const bar=page.locator('.sidebar');const r=(await bar.boundingBox())!;await page.mouse.move(r.x+r.width/2,Math.min(250,size.height-60));
  await page.mouse.wheel(0,1600);await expect.poll(()=>bar.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  await inViewport(page,'데이터 초기화');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'학습 기록 백업',exact:true}).click();await download;
  await page.getByRole('button',{name:'데이터 초기화',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.mouse.move(r.width/2,Math.min(220,size.height-60));await page.mouse.wheel(0,-1800);await expect.poll(()=>bar.evaluate(e=>e.scrollTop)).toBe(0);await inViewport(page,'학습 대시보드');await bar.getByRole('button',{name:'학습 대시보드',exact:true}).click();await expect(bar).not.toHaveClass(/open/);
 });
}
test('작은 세로·가로 메뉴 터치 입력 왕복',async({page,context,isMobile})=>{
 test.skip(!isMobile,'터치 가능한 모바일 에뮬레이션에서만 수행');
 const cdp=await context.newCDPSession(page);
 async function swipe(x:number,from:number,to:number){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from+(to-from)*i/12}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);}
 for(const size of [{width:390,height:480},{width:740,height:360}]){
  await page.setViewportSize(size);await menu(page);const bar=page.locator('.sidebar');const rect=(await bar.boundingBox())!;const x=rect.x+rect.width/2;
  for(let i=0;i<4;i++)await swipe(x,size.height-70,80);
  await expect.poll(()=>bar.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);await inViewport(page,'데이터 초기화');await page.getByRole('button',{name:'데이터 초기화',exact:true}).tap();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'돌아가기',exact:true}).tap();
  for(let i=0;i<4;i++)await swipe(x,80,size.height-70);
  await expect.poll(()=>bar.evaluate(e=>e.scrollTop)).toBe(0);await inViewport(page,'학습 대시보드');await bar.getByRole('button',{name:'학습 대시보드',exact:true}).tap();await expect(bar).not.toHaveClass(/open/);
 }
});
test('상단 상시 안내 배너 부재 및 저장 실패 경고 유지',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','QuotaExceededError');};});
 await page.goto('');await expect(page.locator('.criteria-note')).toHaveCount(0);await expect(page.getByRole('alert')).toContainText('기록을 저장하지 못했습니다');
});
