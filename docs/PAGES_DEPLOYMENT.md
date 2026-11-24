# GitHub Pages 部署

此项目保留原 vinext/Cloudflare Worker 构建与 Sites 路由，同时增加纯静态构建。Pages 使用同一套历史正文、教学图、诗词、城市专题和学习记录组件；不会发布 D1、Worker、认证或连接器代码。

## 本地构建

```sh
npm run install:ci
python -m pip install Pillow
python scripts/import-museum-images.py
npm run check:ui -- --require-local
npm run build:pages
```

输出 `dist-pages/`，默认资源基路径为 `/cross-sea-history/`。测试使用这一子路径（不能只用根路径预览）。主站 hash 深链接、城市专题 `city-atlas/`、正文 JSON 与本地图像均必须经过子路径测试。

## GitHub 发布

1. 在 [Settings → Pages](https://github.com/threeyang3/cross-sea-history/settings/pages) 的 Build and deployment → Source 选择 **GitHub Actions**。首次启用 Pages 是仓库管理设置，普通 Actions GITHUB_TOKEN 无法代替管理员启用。
2. `.github/workflows/deploy-pages.yml` 仅在默认分支相关文件发生变化或手动运行时发布；PR 不直接部署。发布前验证已入库图片及构建产物。
3. 成功部署后访问 https://threeyang3.github.io/cross-sea-history/ 。若首次运行因 Pages 尚未启用而失败，在启用后重新运行失败的部署任务即可；以实际部署状态为准。

## 个人数据

原 Sites 与 GitHub Pages 不同源，浏览器 localStorage 不会自动迁移。发布前从原站导出个人摘记；本站的源代码与构建均不包含个人本地记录。部署新的静态站不会修改原 Sites。
