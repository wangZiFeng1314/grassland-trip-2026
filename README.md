# 草原环线 · 2026 国庆七日自驾

2026年9月30日—10月6日，天津出发，经张北、正蓝旗、达里湖、西乌旗、热水塘和赤峰返回天津。

## 网页

- `public/index.html`：两套方案入口
- `public/relaxed.html`：舒适观景版
- `public/active.html`：早出晚归活动版

页面为静态HTML，支持电脑与手机。保存文件后文字可离线阅读；交互地图需联网。骑马、滑沙、冲沙项目与新增地点的道路距离均需按页面标记在出发前确认，未代订。

## GitHub Pages

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。

`.github/workflows/pages.yml` 仅发布 `public` 目录。推送到 `main` 后自动部署；部署结束可在仓库 Settings → Pages 或 Actions 运行记录中取得实际链接。公开仓库中的源码也可被查看，页面数据不应包含个人证件、订单或密钥。

## 本地生成

需要 Node.js，无需安装 npm 依赖：

```sh
node build.cjs
node build-active.cjs
```

首页 `public/index.html` 为独立入口，生成命令更新两套行程页面。`researchData.json` 为基础数据，`build-active.cjs` 定义活动版调整，`page-template.html` 提供页面模板。

本地预览：

```sh
node serve.cjs
```

访问 `http://127.0.0.1:8787`。`serve.cjs` 只用于本地预览，GitHub Pages 不运行 Node 服务。

## 资料与预算

来源与数据口径保留在各行程页面底部。整理日期2026年9月15日，门票、活动、餐馆与天气信息可能变化；预算为参考，不代表实时售价。
