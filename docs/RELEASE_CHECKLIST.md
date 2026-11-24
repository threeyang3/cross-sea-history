# 发布与预览检查清单

本仓库是原 Sites 项目的源代码备份和开发入口。不要把 GitHub 提交、构建成功、本地预览与原站发布混为一谈。当前 PR 不更改 hosting manifest、Worker 入口和既有个人摘记存储键；不自动部署。

## 1. 一次性依赖安装

使用 Node.js 22.13+。在可信、可联网的开发设备执行：

```sh
git clone https://github.com/threeyang3/cross-sea-history.git
cd cross-sea-history
git switch ui/editorial-gallery-20261124
npm run install:ci
```

若已经有此仓库，不必重新 clone：先检查工作区与当前分支，使用 `git fetch origin` 获取 PR 分支；不要覆盖未提交的修改。

## 2. 本地图像导入（可选但正式发布建议完成）

```sh
python -m pip install Pillow
python scripts/import-museum-images.py
python scripts/import-museum-images.py --check
```

也可以重复使用 `--id` 指定一批资产。导入必须重新核验馆藏号和 Public Domain 标记。若现有文件与登记不匹配，默认保留并报告；检查后才允许 `--refresh`。提交 `public/images/museum/` 与 `app/data/museum-local.json` 的配对变更。未导入的图片保留官方地址及加载失败回退，不阻断正文。

## 3. 构建检查

```sh
npm run verify:release
npm run verify:release -- --require-local
```

第二条命令适合正式全本地图像发布，会拒绝尚未本地化的注册图像。无需重复跑两条：根据目标选一条。可按需追加 `--typecheck`，或用 `--skip-build` 做快速检查。成功仅代表已运行的步骤通过，不代表真实浏览器验证。

## 4. 浏览器人工回归（dev 或构建预览）

```sh
npm run dev
# 或构建通过后 npm start，使用控制台实际显示的 loopback 地址。
```

| 场景 | 验收项 |
|---|---|
| 390×844 / 320×667 | 全屏正文无横向溢出；返回、目录、语言、引用返回都可触达 |
| 768×1024 | 目录不占据首屏；流程图与矩阵适应正文实际宽度 |
| 1440×900 | 固定目录跟随滚动、高亮当前章节；图文分栏保持可读 |
| 阅读跳转 | 目录跳到标题下方；引用到参考资料再回到原按钮；页面背景保持位置 |
| 语言切换 | 中、日、对照正确；历史文本和源链接不丢失 |
| 时间线 | 选择时期、拖动、缩放、键盘操作、打开事件与返回浏览范围 |
| 图解 | 点击图中或键盘可达的节点；图注、图解依据及历史边界可访问 |
| 图像 | 本地优先；本地加载失败转官网；再次失败仍有标题及来源 |
| 诗词 | 原文、日文词注、选篇搜索及赏析；手机端不被图像阻塞 |
| 摘记 | 在同一来源下保留既有 localStorage 记录；测试时用专用浏览器配置，不清空真实记录 |
| 深链接 | #timeline/exchange/<event-id>、#poetry/<poem-id>、城市入口可正常打开 |

## 5. 发布

完成上述检查后审查 PR 并决定合并。原 Sites 线上项目需要独立的授权发布通道，不能凭 GitHub 合并断言同步。若另建站点，先验证 vinext/Cloudflare Worker 所需的托管配置及路由；不同域名的浏览器存储相互隔离，发布前先使用已有导出功能保存个人笔记。
