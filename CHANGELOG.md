# 更新日志

本文件记录各版本的发布内容。GitHub Release 的正文由 [scripts/release-notes.mjs](<./scripts/release-notes.mjs>) 按 [package.json](<./package.json>) 的版本号从对应段落提取，工作流见 [.github/workflows/release.yml](<./.github/workflows/release.yml>)。

发布新版本时，先写入该版本的段落，再推送 `v` 前缀标签。

## 0.1.13

- 在主会话右侧栏提供临时侧聊，使用主会话背景快照与 DSH 托管子代理，侧聊过程不自动写回主会话。
- 首问与续聊共用输入区，支持文件、图片、技能选择，以及运行中切换权限、模型和思考强度。
- 支持同次 DSH 运行内刷新恢复侧聊，关闭标签后释放子代理资源并更新子智能体目录。
- 修复主会话尚无已完成轮次时的权限继承：侧聊使用打开时的主会话权限，不误用全局默认权限，且不将未完成对话加入背景。
- 新增分支推送和 PR 的 CI 检查，以及按版本标签自动创建 GitHub Release 的发布流程。
