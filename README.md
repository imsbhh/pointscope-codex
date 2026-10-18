# PointScope for Codex

在网页上圈定前端修改范围、演示操作、连接素材，再交给当前 Codex 对话理解并修改源码。当前版本：**1.0.2**。

## 安装

本仓库可以作为 Codex 插件市场来源：

```powershell
codex plugin marketplace add imsbhh/pointscope-codex
codex plugin add pointscope@pointscope-local
```

安装后确认插件已启用，在前端项目的新对话中输入：

```text
使用 $pointscope 打开当前项目的可视编辑入口。
```

如果之前从本地目录安装了同名市场，先用 `codex plugin marketplace remove pointscope-local` 移除旧来源记录，再添加本仓库。该操作更换市场来源；不要删除自己的工作流文件。

也可下载 [1.0.2 安装包](dist/PointScope-Codex-v1.0.2.zip)，解压后运行包内的 `安装到Codex.ps1`。安装包和仓库都使用已有的 Codex；插件运行时无需另装 Node.js、Python、浏览器扩展、模型网关或配置 API Key。前端项目继续使用自己的预览环境，视觉理解使用当前 Codex 模型及账户能力。

## 功能

- 按元素或坐标点选、矩形框选、画笔不规则圈选，保留真实边界。
- 选中后自动打开设置窗口；窗口可移动、缩放，关闭后继续编辑。
- 可选的输入响应、触控笔操作记录及可见轨迹。
- 选区动态预览、唯一需求输入框和文件节点画布，支持拖入文件并通过连线指定位置及用途。
- 原生批注和只读 Site tools 交接；由使用者最终发送，缺少宿主能力时可导出完整 JSON 交接包。
- 自定义快捷键、冲突检查和按站点保存设置。`Alt + Shift + K` 打开绑定设置，`Alt + Shift + L` 默认启动画笔圈选。
- SVG 定义、引用、遮罩、裁剪、渐变和持续动画的预览支持。

完整操作和能力限制见 [使用说明](plugins/pointscope/README.zh-CN.md)。

## 开发

源码与生成的浏览器脚本一同维护。开发构建仅使用 Node.js 自带模块，不需要安装 npm 依赖；这与插件的浏览器运行环境分开。

```sh
node scripts/build.mjs
node scripts/check.mjs
```

`build` 按固定顺序合并九个源码模块；`check` 校对生成结果、JavaScript 语法、清单路径、插件市场路径和安装包校验值。修改源码后应重新构建，再进行浏览器验证。

```text
.agents/plugins/marketplace.json   Codex 插件市场
plugins/pointscope/
  plugin.json                     标准插件清单
  .codex-plugin/plugin.json        兼容清单
  skills/pointscope/               Codex 工作流程
  src/                            完整浏览器源码
  assets/pointscope.js             自包含运行脚本
  assets/demo.html                 离线演示
scripts/                          无依赖的开发构建与检查
dist/                             安装包与 SHA-256 校验值
```
