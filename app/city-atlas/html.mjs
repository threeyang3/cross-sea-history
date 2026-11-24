/** Shared pure HTML renderer for the Worker and GitHub Pages. */
export function renderCityAtlas({atlasData,siteLinks,timeline,atlasScript,atlasStyles,base='/'}) {
 if(!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(base)||base.includes('..'))throw new Error('Invalid site base');
 const titles=new Map(timeline.events.map(event=>[event.id,event.title]));
 const connections=Object.fromEntries(Object.entries(siteLinks).map(([id,link])=>[id,{...link,title:titles.get(id)}]));
 const images=atlasData.images.map(image=>({...image,url:image.url.startsWith('/')&&!image.url.startsWith('//')?base+image.url.slice(1):image.url}));
 const content=JSON.stringify({...atlasData,images,siteLinks:connections}).replace(/</g,'\\u003c');
 return `<!doctype html>
<html lang="zh-CN" data-site-root="${base}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="北京、西安双语城市专题，连接历史地点、人物、年代与史料。">
  <link rel="icon" href="${base}favicon.svg">
  <title>城市探索｜跨海的历史</title>
  <style>${atlasStyles}</style>
</head>
<body>
  <a class="skip" href="#main">跳到正文 / 本文へ</a>
  <header id="header"></header>
  <main class="main" id="main" tabindex="-1"></main>
  <footer class="footer" id="footer"></footer>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <noscript>本学习页面需要启用 JavaScript。 / JavaScript を有効にしてください。</noscript>
  <script id="content-data" type="application/json">${content}</script>
  <script>${atlasScript}</script>
</body>
</html>`;
}
