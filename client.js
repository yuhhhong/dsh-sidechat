window.__ModuleLoader__.load({
  id: 'dsh-sidechat',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const PACKAGE = 'dsh-sidechat';
    const NS = 'dshSidechat';
    const KIND = 'sidechat';
    const PREFIX = 'dsh-resource://sidechat/session/';
    const PANEL = 'dshSidechat.conversation';
    const originalRoot = 'conversation.session';
    const nativeSlot = (name) => `dshSidechat.native.${name}`;
    const catalogActionsSlot = 'conversation.session.header.actions';
    const catalogLineageSlot = 'conversation.session.header.lineage';
    const catalogFooterSlot = 'conversation.session.header.actions.subagent.footer';
    const catalogSlot = (name) => `dshSidechat.catalog.${name}`;
    const SidechatContext = React.createContext(null);
    const dictionaries = {
      zh: {
        quoteToSidechat: '引用到侧聊', quotePreview: '查看引用全文', quoteRemove: '移除引用', quoteUnavailable: '当前侧聊正在关闭，暂时无法引用。',
        create: '新建侧边聊天', prefix: '侧边聊天', count: '侧聊',
        hint: '侧聊会占用子代理名额，用完请及时关闭。', limit: '当前主会话最多打开 3 个侧聊，请先关闭不用的侧聊。',
        loading: '正在读取侧聊……', opening: '正在连接原生会话……', creating: '正在保存背景……', starting: '正在启动侧聊……',
        closing: '正在结束侧聊，清理完成后归还名额。', closeFailed: '结束失败，侧聊仍计入上限。请再次关闭以重试。',
        question: '发消息或创建任务',
        attach: '上传文件或图片', skills: '技能', noSkills: '没有匹配的 Skill', userOnly: '仅用户',
        model: '模型', reasoning: '推理等级', modelSearch: '搜索模型', noModels: '没有匹配的模型', back: '返回', defaultEffort: '默认', catalogLoading: '正在加载权限、模型和 Skill……', catalogRetry: '重新加载权限、模型和 Skill',
        permission: '权限', permissionSelecting: '正在切换权限……', permissionCustom: '自定义', permissionDefault: '默认', permissionReadOnly: '仅可查看', permissionWorkspaceWrite: '工作区内修改', permissionFullAccess: '完全权限', permissionAuto: '自动审查', cancel: '取消',
        permissionFullTitle: '确认启用完全权限？', permissionFullDescription: '启用完全权限后，智能体将减少确认步骤，并且可以直接执行更多操作，包括敏感操作、文件修改或外部命令。仅建议在你信任当前任务时使用。', permissionAcknowledge: '我已了解风险，并愿意继续', permissionFullEnable: '启用完全权限',
        permissionAutoTitle: '确认启用自动审查（实验）？', permissionAutoDescription: '自动审查不使用沙箱。每次原生工具调用和 PTC 内层调用前，都会由与当前智能体相同的模型进行审查；审查拒绝的调用由你批准或拒绝。此功能仍属实验性，可能误放行或误拒绝，并会消耗额外 token。', permissionAutoEnable: '启用自动审查',
        uploading: '正在上传', uploadFailed: '上传失败', uploadReady: '上传完成', retryUpload: '重试上传', removeAttachment: '移除附件', openImage: '查看大图', closePreview: '关闭图片预览', fileLabel: '文件',
        dropFiles: '松开以添加文件或图片', send: '发送', queue: '排队发送', selecting: '正在切换模型……',
        modelUnavailable: '当前模型暂不在可用列表中，请重新选择。', chooseModel: '选择模型', fileReadFailed: '无法读取文件。', waitingInteraction: '请先处理聊天区中的确认或提问。',
        empty: '请输入消息或添加附件。', uploadPending: '请等待附件上传完成，或移除上传失败的附件。',
        retry: '重试', stop: '停止本轮', expired: '本次应用运行已结束，旧侧聊不会恢复。', ended: '侧聊已结束。',
        error: '读取失败，请重试。', unavailable: '无法读取侧聊。', commandFailed: '侧聊命令执行失败。', busy: '操作正在进行，请稍候。', disposed: '侧聊界面已卸载。',
      },
      en: {
        quoteToSidechat: 'Quote in side chat', quotePreview: 'View full quote', quoteRemove: 'Remove quote', quoteUnavailable: 'The side chats are closing. Unable to quote right now.',
        create: 'New side chat', prefix: 'Side chat', count: 'Side chats',
        hint: 'Side chats use subagent capacity. Close them when finished.', limit: 'Up to 3 side chats per conversation. Close an unused one first.',
        loading: 'Loading side chat…', opening: 'Connecting to the native conversation…', creating: 'Saving background…', starting: 'Starting side chat…',
        closing: 'Ending side chat. Capacity is returned after cleanup.', closeFailed: 'Cleanup failed. This chat still counts toward the limit. Close it again to retry.',
        question: 'Send a message or create a task',
        attach: 'Upload files or images', skills: 'Skills', noSkills: 'No matching Skills', userOnly: 'User only',
        model: 'Model', reasoning: 'Reasoning effort', modelSearch: 'Search models', noModels: 'No matching models', back: 'Back', defaultEffort: 'Default', catalogLoading: 'Loading permissions, models and Skills…', catalogRetry: 'Reload permissions, models and Skills',
        permission: 'Permissions', permissionSelecting: 'Switching permissions…', permissionCustom: 'Custom', permissionDefault: 'Default', permissionReadOnly: 'Read Only', permissionWorkspaceWrite: 'Workspace Write', permissionFullAccess: 'Full access', permissionAuto: 'Auto review', cancel: 'Cancel',
        permissionFullTitle: 'Enable Full access?', permissionFullDescription: 'Full access reduces confirmation steps and lets the agent perform more actions directly, including sensitive operations, file changes, or external commands. Only use it when you trust the current task.', permissionAcknowledge: 'I understand the risks and want to continue', permissionFullEnable: 'Enable Full access',
        permissionAutoTitle: 'Enable Auto review (experimental)?', permissionAutoDescription: 'Auto review runs without a sandbox. Before every native tool call and PTC inner call, the same model as the current agent reviews whether to allow it; you approve or reject each call it denies. This feature is experimental, can falsely allow or deny actions, and uses additional tokens.', permissionAutoEnable: 'Enable Auto review',
        uploading: 'Uploading', uploadFailed: 'Upload failed', uploadReady: 'Upload complete', retryUpload: 'Retry upload', removeAttachment: 'Remove attachment', openImage: 'View full image', closePreview: 'Close image preview', fileLabel: 'File',
        dropFiles: 'Drop to add files or images', send: 'Send', queue: 'Queue message', selecting: 'Switching model…',
        modelUnavailable: 'The current model is absent from the available list. Choose a model.', chooseModel: 'Choose a model', fileReadFailed: 'Unable to read this file.', waitingInteraction: 'Resolve the confirmation or question in the conversation first.',
        empty: 'Enter a message or add an attachment.', uploadPending: 'Wait for uploads to finish, or remove failed attachments.',
        retry: 'Retry', stop: 'Stop this turn', expired: 'This application run has ended. The old side chat will not reopen.', ended: 'Side chat ended.',
        error: 'Loading failed. Try again.', unavailable: 'Unable to read this side chat.', commandFailed: 'The side chat command failed.', busy: 'This operation is in progress.', disposed: 'The side chat UI was unloaded.',
      },
    };
    const styles = {
      root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0, color: 'var(--dsw-alias-label-primary)' },
      body: { display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0, minWidth: 0 },
      header: { flex: '0 0 auto', padding: '10px 16px', borderBottom: '1px solid var(--dsw-alias-border-l1)', fontSize: 12, lineHeight: 1.6, overflowWrap: 'anywhere' },
      muted: { color: 'var(--dsw-alias-label-secondary)' },
      footer: { display: 'flex', flex: '0 0 auto', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, padding: '8px 16px 12px', color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: 1.5 },
      button: { padding: '7px 12px', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, background: 'var(--dsw-alias-bg-layer-1)', color: 'inherit', font: 'inherit', cursor: 'pointer' },
      message: { padding: 16, fontSize: 13, lineHeight: 1.6, overflowWrap: 'anywhere' },
      error: { marginTop: 8, color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, overflowWrap: 'anywhere' },
    };
    const uiStyles = `
      .dsh-sidechat-content { position: relative; display: flex; flex: 1; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; --dsh-chat-content-width: min(calc(100% - 32px), 920px); --dsh-composer-card-max-width: min(calc(100% - 16px), 952px); --dsh-composer-side-clearance: 8px; --dsh-composer-dock-inset: 8px; }
      .dsh-sidechat-scroll { display: flex; flex: 1; flex-direction: column; min-height: 0; margin-right: 2px; overflow-y: auto; scrollbar-gutter: stable; }
      .dsh-sidechat-scroll::-webkit-scrollbar-track { margin: 2px; }
      .dsh-sidechat-transcript { display: flex; flex: 1 0 auto; flex-direction: column; min-height: auto; }
      .dsh-sidechat-composer-stack { display: flex; flex-direction: column; gap: 6px; --dsh-composer-stack-gap: 6px; }
      .dsh-sidechat-composer-seat { position: sticky; bottom: 0; z-index: 9; display: flex; flex: none; flex-direction: column; margin-top: auto; will-change: transform; overflow-anchor: none; background: linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-bg-base) 0%, transparent) 0px, var(--dsw-alias-bg-base) 36px); --dsh-composer-text-max-height: 336px; }
      .dsh-sidechat-guide { width: 380px; max-width: 100%; }
      .dsh-sidechat-guide-button { display: flex; gap: 14px; align-items: center; box-sizing: border-box; width: 100%; min-height: 56px; padding: 14px 20px; border: .5px solid var(--dsw-alias-border-l3); border-radius: var(--dsw-radius-xl); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; text-align: left; cursor: pointer; }
      .dsh-sidechat-guide-button:disabled { opacity: .55; cursor: default; }
      .dsh-sidechat-guide-icon { display: flex; flex: none; align-items: center; justify-content: center; width: 26px; height: 26px; color: var(--dsw-alias-label-secondary); }
      .dsh-sidechat-guide-title { min-width: 0; overflow: hidden; font-size: 14px; font-weight: 400; line-height: 1.4; white-space: nowrap; text-overflow: ellipsis; }
      .dsh-sidechat-launch { display: flex; flex: 1 1 auto; flex-direction: column; box-sizing: border-box; min-height: 0; min-width: 0; overflow-y: auto; margin: 0; padding: 12px 16px 4px; }
      .dsh-sidechat-launch-card { display: flex; flex: none; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; margin-top: auto; padding-top: 8px; border: 0; border-radius: var(--dsw-radius-panel); background: var(--dsw-specific-input-major); box-shadow: var(--dsw-elevation-soft); --dsw-elevation-stroke-color: var(--dsw-alias-border-l2); font-size: var(--dsh-content-font-size, 14px); line-height: calc(24px + var(--dsh-content-font-delta, 0px)); }
      .dsh-sidechat-launch-input { display: block; box-sizing: border-box; width: calc(100% - 4px); min-height: 36px; max-height: calc(14 * (24px + var(--dsh-content-font-delta, 0px))); padding: 4px 8px 0 14px; border: 0; outline: none; resize: none; overflow-y: auto; background: transparent; color: var(--dsw-alias-label-primary); caret-color: var(--dsw-alias-state-business-primary); font: inherit; line-height: inherit; overflow-wrap: anywhere; }
      .dsh-sidechat-rich-input { white-space: pre-wrap; }
      .dsh-sidechat-rich-input[data-empty="true"]::before { content: attr(data-placeholder); color: var(--dsw-alias-label-caption); pointer-events: none; }
      .dsh-sidechat-rich-input[aria-disabled="true"] { color: var(--dsw-alias-label-tertiary); }
      .dsh-sidechat-quote { display: inline-flex; align-items: baseline; gap: 4px; box-sizing: border-box; max-width: min(80%, 300px); margin: 0; padding: 0; vertical-align: baseline; color: var(--dsw-alias-state-business-primary); font-size: var(--dsh-content-font-size, 14px); line-height: calc(20px + var(--dsh-content-font-delta, 0px)); }
      .dsh-sidechat-quote-body { min-width: 0; padding: 0; border: none; outline: none; background: none; color: inherit; font: inherit; line-height: inherit; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dsh-sidechat-quote-remove { display: grid; place-items: center; align-self: center; flex: none; width: 16px; height: 16px; padding: 0; color: inherit; user-select: none; border: none; border-radius: 50%; corner-shape: round; background: transparent; cursor: pointer; }
      .dsh-sidechat-quote-remove:disabled { cursor: default; }
      .dsh-sidechat-quote-mark, .dsh-sidechat-quote-close { grid-area: 1 / 1; transition: opacity .12s ease; }
      .dsh-sidechat-quote-close { opacity: 0; }
      .dsh-sidechat-quote[data-removable]:focus-within .dsh-sidechat-quote-mark { opacity: 0; }
      .dsh-sidechat-quote[data-removable]:focus-within .dsh-sidechat-quote-close { opacity: 1; }
      @media (hover: hover) { .dsh-sidechat-quote[data-removable]:hover .dsh-sidechat-quote-mark { opacity: 0; } .dsh-sidechat-quote[data-removable]:hover .dsh-sidechat-quote-close { opacity: 1; } }
      @media (hover: none) { .dsh-sidechat-quote[data-removable] .dsh-sidechat-quote-mark { opacity: 0; } .dsh-sidechat-quote[data-removable] .dsh-sidechat-quote-close { opacity: 1; } }
      .dsh-sidechat-quote-preview { position: fixed; inset: auto; z-index: 100; box-sizing: border-box; width: max-content; max-width: min(420px, calc(100vw - 16px)); max-height: calc(100vh - 16px); overflow: auto; margin: 0; padding: 8px; border: 0; border-radius: var(--dsw-radius-lg); color: var(--dsw-alias-label-primary); background: var(--dsw-specific-menu); backdrop-filter: var(--dsw-menu-backdrop-filter); box-shadow: var(--dsw-elevation-panel); }
      .dsh-sidechat-quote-full { display: block; padding: 8px 10px; color: var(--dsw-alias-label-primary); white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 20px; }
      .dsh-sidechat-quote-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
      .dsh-sidechat-quote-action { padding: 5px 10px; border: none; border-radius: 999px; corner-shape: round; background: var(--dsw-alias-button-floating-fill); --dsw-elevation-stroke-color: var(--dsw-alias-border-l3); box-shadow: var(--dsw-elevation-panel); color: var(--dsw-alias-label-primary); font: var(--dsw-font-xs-13); cursor: pointer; }
      .dsh-sidechat-quote-action:focus-visible { background: var(--dsw-alias-button-floating-hover); }
      @media (hover: hover) { .dsh-sidechat-quote-action:hover { background: var(--dsw-alias-button-floating-hover); } }
      .dsh-sidechat-quote-action:disabled { opacity: .5; cursor: progress; }
      .dsh-sidechat-quote-actions [role="alert"] { flex-basis: 100%; max-width: 320px; }
      .dsh-sidechat-launch-input::placeholder { color: var(--dsw-alias-label-caption); }
      .dsh-sidechat-launch-input:disabled { color: var(--dsw-alias-label-tertiary); }
      .dsh-sidechat-launch-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 12px; min-width: 0; padding: 2px 8px 6px; }
      .dsh-sidechat-launch-model { min-width: 0; margin-left: auto; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; }
      .dsh-sidechat-send { display: grid; place-items: center; flex: none; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 999px; background: var(--dsw-alias-button-info-fill); color: var(--dsw-alias-label-on-color); cursor: pointer; transform: translateY(-2px); }
      .dsh-sidechat-send:disabled { opacity: .4; cursor: default; }
      .dsh-sidechat-send[aria-busy="true"] { opacity: 1; cursor: progress; }
      .dsh-sidechat-launch-dock { flex: none; min-height: calc(22px + var(--dsh-content-font-delta-secondary, 0px)); padding-top: 4px; }
      .dsh-sidechat-spinner { animation: dsh-sidechat-sending 800ms linear infinite; }
      @keyframes dsh-sidechat-sending { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .dsh-sidechat-spinner { animation-duration: 2400ms; } }
      .dsh-sidechat-unified { position: relative; flex: none; padding: 8px 12px 4px; }
      .dsh-sidechat-unified .dsh-sidechat-launch-card { position: relative; }
      .dsh-sidechat-toolbar { display: flex; flex-wrap: nowrap; align-items: center; gap: 6px; padding: 2px 8px 6px; min-width: 0; container-type: inline-size; }
      .dsh-sidechat-permission-seat { flex: 0 1 auto; min-width: 0; max-width: 220px; }
      .dsh-sidechat-permission-trigger { display: inline-flex; align-items: center; gap: 4px; min-width: 0; max-width: 100%; height: 28px; padding: 0 4px 0 8px; border: 0; border-radius: var(--dsw-radius-sm); background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; line-height: 20px; font-weight: 500; cursor: pointer; }
      .dsh-sidechat-permission-trigger:disabled { color: var(--dsw-alias-label-dimmed); cursor: default; }
      .dsh-sidechat-permission-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dsh-sidechat-permission-icon { display: inline-flex; flex: none; }
      .dsh-sidechat-permission-trigger .dsh-sidechat-permission-icon svg { width: 14px; height: 14px; }
      .dsh-sidechat-permission-trigger[aria-expanded="true"] > .dsh-sidechat-chevron { transform: rotate(180deg); }
      .dsh-sidechat-permission-menu { position: fixed; inset: auto; box-sizing: border-box; width: max-content; min-width: 144px; max-width: calc(100vw - 16px); max-height: min(360px, calc(100vh - 16px)); overflow-y: auto; margin: 0; padding: 4px; border: .5px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-specific-menu); color: var(--dsw-alias-label-primary); box-shadow: var(--dsw-elevation-prominent); font-size: 13px; line-height: 20px; }
      .dsh-sidechat-permission-option { display: flex; align-items: center; gap: 6px; box-sizing: border-box; width: 100%; min-height: 34px; padding: 7px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
      .dsh-sidechat-permission-option:focus-visible { outline: none; background: var(--dsw-alias-interactive-bg-hover); }
      .dsh-sidechat-permission-option-label { display: inline-flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
      .dsh-sidechat-permission-badge { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 8px; line-height: 10px; font-weight: 500; letter-spacing: .2px; }
      .dsh-sidechat-permission-trigger:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
      .dsh-sidechat-permission-confirm { box-sizing: border-box; width: min(440px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow-y: auto; padding: 24px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-panel); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: var(--dsw-elevation-prominent); font: inherit; }
      .dsh-sidechat-permission-confirm::backdrop { background: var(--dsw-alias-bg-mask-photo); }
      .dsh-sidechat-permission-confirm h2 { margin: 0 0 12px; font-size: 18px; line-height: 26px; font-weight: 600; }
      .dsh-sidechat-permission-confirm p { margin: 0 0 20px; color: var(--dsw-alias-label-secondary); font-size: 14px; line-height: 22px; }
      .dsh-sidechat-permission-acknowledge { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 20px; cursor: pointer; }
      .dsh-sidechat-permission-acknowledge input { flex: none; margin: 3px 0 0; accent-color: var(--dsw-alias-state-business-primary); }
      .dsh-sidechat-permission-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
      .dsh-sidechat-permission-actions button { min-height: 34px; padding: 7px 12px; border: .5px solid var(--dsw-alias-border-l2); border-radius: 10px; background: transparent; color: inherit; font: inherit; font-size: 13px; cursor: pointer; }
      .dsh-sidechat-permission-actions .dsh-sidechat-permission-enable { border-color: transparent; background: var(--dsw-alias-button-info-fill); color: var(--dsw-alias-label-on-color); }
      .dsh-sidechat-permission-enable:disabled { opacity: .4; cursor: default; }
      @container (max-width: 460px) { .dsh-sidechat-permission-trigger:has(.dsh-sidechat-permission-icon) .dsh-sidechat-permission-label { display: none; } }
      @media (hover: hover) { .dsh-sidechat-permission-trigger:hover:not(:disabled), .dsh-sidechat-permission-option:hover { background: var(--dsw-alias-interactive-bg-hover); } }
      .dsh-sidechat-control { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-height: 30px; min-width: 30px; box-sizing: border-box; padding: 4px 7px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer; }
      .dsh-sidechat-control:disabled { opacity: .45; cursor: default; }
      .dsh-sidechat-control:focus-visible, .dsh-sidechat-skill-option:focus-visible, .dsh-sidechat-search:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .dsh-sidechat-model-seat { flex: 0 1 auto; min-width: 0; max-width: calc(100% - 76px); margin-left: auto; }
      .dsh-sidechat-model-trigger { display: flex; align-items: center; gap: 4px; width: 100%; min-width: 0; max-width: 360px; height: 28px; padding: 0 4px 0 8px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; line-height: 20px; cursor: pointer; }
      .dsh-sidechat-model-trigger:disabled { opacity: .45; cursor: default; }
      .dsh-sidechat-model-label { flex: 0 1 auto; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .dsh-sidechat-model-effort { flex: 0 1000 auto; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--dsw-alias-label-caption); }
      .dsh-sidechat-chevron { flex: none; width: 12px; height: 12px; color: var(--dsw-alias-label-caption); }
      .dsh-sidechat-model-trigger[aria-expanded="true"] > .dsh-sidechat-chevron { transform: rotate(180deg); }
      .dsh-sidechat-model-menu { position: absolute; bottom: calc(100% + 6px); right: 0; z-index: 21; box-sizing: border-box; width: max-content; min-width: min(240px, 100%); max-width: min(420px, 100%); max-height: min(360px, 50vh); overflow-y: auto; padding: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-specific-menu); box-shadow: var(--dsw-elevation-prominent); color: var(--dsw-alias-label-primary); }
      .dsh-sidechat-model-row { display: flex; align-items: center; gap: 6px; box-sizing: border-box; width: 100%; min-height: 34px; padding: 5px 8px; border: 0; border-radius: 8px; background: transparent; color: inherit; font: inherit; font-size: 13px; line-height: 20px; text-align: left; cursor: pointer; }
      .dsh-sidechat-model-row:focus-visible { outline: none; background: var(--dsw-alias-interactive-bg-hover); }
      .dsh-sidechat-model-row:disabled { opacity: .45; cursor: default; }
      .dsh-sidechat-model-row-label { flex: 0 0 auto; white-space: nowrap; }
      .dsh-sidechat-model-row-value { flex: 1 1 auto; min-width: 0; margin-left: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: right; color: var(--dsw-alias-label-tertiary); }
      .dsh-sidechat-model-name { flex: 1 1 auto; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .dsh-sidechat-model-heading { padding: 7px 8px 3px; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 18px; }
      .dsh-sidechat-model-back { border-bottom: 1px solid var(--dsw-alias-border-l1); border-radius: 0; margin-bottom: 4px; }
      .dsh-sidechat-model-check { flex: 0 0 14px; width: 14px; height: 14px; }
      .dsh-sidechat-model-trigger:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .dsh-sidechat-attachment-rail { display: flex; align-items: flex-start; gap: 10px; min-width: 0; overflow-x: auto; padding: 2px 10px 0; margin-bottom: -6px; scrollbar-width: thin; }
      .dsh-sidechat-image-item { position: relative; flex: 0 0 64px; width: 64px; height: 64px; }
      .dsh-sidechat-thumbnail { display: block; width: 64px; height: 64px; box-sizing: border-box; padding: 0; overflow: hidden; border: .5px solid var(--dsw-alias-border-l2-darkmode-thin); border-radius: var(--dsw-radius-xl); background: var(--dsw-alias-interactive-bg-hover); cursor: zoom-in; }
      .dsh-sidechat-thumbnail img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .dsh-sidechat-thumbnail[data-failed="true"] { border-color: var(--dsw-alias-state-error-primary); }
      .dsh-sidechat-thumbnail[data-failed="true"] img { opacity: .4; }
      .dsh-sidechat-image-failure { position: absolute; inset: 0; display: grid; place-items: center; color: var(--dsw-alias-state-error-primary); pointer-events: none; }
      .dsh-sidechat-file-item { position: relative; display: flex; flex: 0 0 240px; align-items: center; gap: 10px; box-sizing: border-box; height: 64px; max-width: 100%; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-lg); background: var(--dsw-specific-input-major); }
      .dsh-sidechat-file-item[data-failed="true"] { border-color: var(--dsw-alias-state-error-primary); }
      .dsh-sidechat-file-icon { display: grid; place-items: center; flex: 0 0 28px; width: 28px; height: 28px; color: var(--dsw-alias-label-secondary); }
      .dsh-sidechat-file-body { flex: 1; min-width: 0; padding: 8px 0; }
      .dsh-sidechat-file-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--dsw-alias-label-primary); font-size: 14px; font-weight: 500; line-height: 22px; }
      .dsh-sidechat-file-meta { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 15px; }
      .dsh-sidechat-file-item[data-failed="true"] .dsh-sidechat-file-meta { color: var(--dsw-alias-state-error-primary); }
      .dsh-sidechat-attachment-remove { position: absolute; top: 4px; right: 4px; z-index: 1; display: grid; place-items: center; width: 18px; height: 18px; padding: 0; border: 0; border-radius: 50%; background: var(--dsw-alias-button-contrast-fill); color: var(--dsw-alias-label-primary-inverted); font-size: 14px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .2s ease-in-out; }
      .dsh-sidechat-attachment-remove:focus-visible { opacity: 1; outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .dsh-sidechat-attachment-remove:disabled { cursor: default; }
      .dsh-sidechat-file-item[data-failed="true"] .dsh-sidechat-attachment-remove, .dsh-sidechat-image-item[data-failed="true"] .dsh-sidechat-attachment-remove { opacity: 1; background: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-label-on-color); }
      .dsh-sidechat-upload-track { position: absolute; left: 8px; right: 8px; bottom: 6px; height: 2px; overflow: hidden; border-radius: 1px; background: var(--dsw-specific-file-upload-track); pointer-events: none; }
      .dsh-sidechat-upload-bar { display: block; width: 35%; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); animation: dsh-sidechat-upload-progress 1.2s ease-in-out infinite alternate; }
      .dsh-sidechat-upload-spinner { width: 20px; height: 20px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: dsh-sidechat-sending .8s linear infinite; }
      .dsh-sidechat-attachment-errors { display: flex; flex-direction: column; gap: 4px; padding: 0 10px; }
      .dsh-sidechat-attachment-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
      .dsh-sidechat-attachment-retry { margin-left: 6px; padding: 0; border: 0; border-radius: 3px; background: transparent; color: inherit; font: inherit; text-decoration: underline; cursor: pointer; }
      .dsh-sidechat-thumbnail:focus-visible, .dsh-sidechat-attachment-retry:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .dsh-sidechat-image-preview { box-sizing: border-box; max-width: min(92vw, 1000px); max-height: 90vh; padding: 36px 12px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 16px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: var(--dsw-elevation-prominent); }
      .dsh-sidechat-image-preview::backdrop { background: var(--dsw-alias-bg-mask-photo); }
      .dsh-sidechat-image-preview img { display: block; max-width: 100%; max-height: calc(90vh - 60px); object-fit: contain; }
      .dsh-sidechat-preview-close { position: absolute; top: 3px; right: 4px; }
      @keyframes dsh-sidechat-upload-progress { from { transform: translateX(-70%); } to { transform: translateX(220%); } }
      @media (hover: hover) { .dsh-sidechat-image-item:hover .dsh-sidechat-attachment-remove, .dsh-sidechat-file-item:hover .dsh-sidechat-attachment-remove { opacity: 1; } .dsh-sidechat-file-item:hover .dsh-sidechat-file-name { padding-right: 18px; } }
      .dsh-sidechat-file-item:focus-within .dsh-sidechat-file-name { padding-right: 18px; }
      @media (hover: none), (pointer: coarse) { .dsh-sidechat-attachment-remove { opacity: 1; } .dsh-sidechat-file-name { padding-right: 18px; } }
      @media (prefers-reduced-motion: reduce) { .dsh-sidechat-upload-bar, .dsh-sidechat-upload-spinner { animation: none; } .dsh-sidechat-attachment-remove { transition: none; } }
      .dsh-sidechat-skill-menu { position: absolute; bottom: calc(100% + 6px); left: 0; z-index: 20; box-sizing: border-box; width: 100%; max-height: min(400px, 50vh); overflow-y: auto; padding: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-specific-menu); box-shadow: var(--dsw-elevation-prominent); }
      .dsh-sidechat-skill-heading { padding: 8px 8px 4px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
      .dsh-sidechat-search { box-sizing: border-box; width: 100%; padding: 7px 8px; border: 0; border-radius: 8px; outline: none; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; }
      .dsh-sidechat-skill-option { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 34px; box-sizing: border-box; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-primary); text-align: left; font: inherit; font-size: 13px; line-height: 20px; cursor: pointer; }
      .dsh-sidechat-skill-option[aria-selected="true"] { background: var(--dsw-alias-interactive-bg-hover); }
      .dsh-sidechat-skill-name { flex: 0 1 auto; max-width: 55%; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .dsh-sidechat-skill-description { flex: 1 1 0; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: right; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
      .dsh-sidechat-composer-notice { margin: 4px 8px 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
      .dsh-sidechat-composer-error { color: var(--dsw-alias-state-error-primary); }
      .dsh-sidechat-drop-target { position: absolute; inset: 0; z-index: 25; display: grid; place-items: center; border: 2px dashed var(--dsw-alias-brand-primary); border-radius: 16px; background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); pointer-events: none; }
      .dsh-sidechat-unified[data-dragging="true"] .dsh-sidechat-launch-card { outline: 2px dashed var(--dsw-alias-brand-primary); }
      .dsh-sidechat-send-row { display: flex; flex: none; align-items: center; }
      .dsh-sidechat-stop { width: 34px; height: 34px; border: 0; border-radius: 999px; background: var(--dsw-alias-button-info-fill); color: var(--dsw-alias-label-on-color); transform: translateY(-2px); }
      @media (hover: hover) { .dsh-sidechat-control:hover:not(:disabled), .dsh-sidechat-skill-option:hover, .dsh-sidechat-model-trigger:hover:not(:disabled), .dsh-sidechat-model-row:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); } .dsh-sidechat-stop:hover:not(:disabled) { background: var(--dsw-alias-button-info-hover); } }
      .dsh-sidechat-guide-button:focus-visible, .dsh-sidechat-send:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
      @media (hover: hover) { .dsh-sidechat-guide-button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); } .dsh-sidechat-send:hover:not(:disabled) { background: var(--dsw-alias-button-info-hover); } }
      @media (pointer: coarse) { .dsh-sidechat-launch-card { font-size: max(16px, var(--dsh-content-font-size, 14px)); } }
    `;
    function ChatIcon() {
      return h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: 'M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V7.5A4.5 4.5 0 0 1 7.5 3h5a7.5 7.5 0 0 1 7.5 8.5Z' }), h('path', { d: 'M7 8h8M7 12h5' }));
    }
    const errorText = (error) => error instanceof Error ? error.message : String(error);
    const addressOf = (boot, parent, id) => `${PREFIX}${encodeURIComponent(id)}?${new URLSearchParams({ boot, parent })}`;
    function parseAddress(address) {
      const url = new URL(address);
      if (url.protocol !== 'dsh-resource:' || url.hostname !== KIND || !url.pathname.startsWith('/session/')) {
        return null;
      }
      return { bootId: url.searchParams.get('boot'), parentId: url.searchParams.get('parent'), id: decodeURIComponent(url.pathname.slice('/session/'.length)) };
    }
    function useParent(manager, id) {
      const model = manager.parent(id);
      return React.useSyncExternalStore(model.subscribe, model.getSnapshot, model.getSnapshot);
    }
    function isNewNode(node, boundary) {
      return node !== undefined && node.anchorSeq > boundary && node.data?.source?.kind !== 'sidechat-lease';
    }

    // 只投影目录视图；宿主会话、日志与共享投影保持原样。
    function visibleCatalog(entries, parentId, parents) {
      const closed = parents[parentId]?.closed;
      if (closed === undefined) {
        return entries;
      }
      const visible = entries.filter((entry) => !closed.has(entry.id));
      return visible.length === entries.length ? entries : visible;
    }

    function catalogSnapshot(snapshot, parents) {
      let changed = false;
      const projectionsBySession = Object.fromEntries(Object.entries(snapshot.projectionsBySession).map(([parentId, projection]) => {
        const entries = projection.values.subagentCatalog;
        const visible = entries === undefined ? entries : visibleCatalog(entries, parentId, parents);
        if (visible === entries) {
          return [parentId, projection];
        }
        changed = true;
        return [parentId, { ...projection, values: { ...projection.values, subagentCatalog: visible } }];
      }));
      return changed ? { ...snapshot, projectionsBySession } : snapshot;
    }

    const QUOTE_MARKER = '\uFFFC';
    function insertDraftQuote(draft, text, id) {
      const offset = draft.caret ?? draft.text.length;
      return { text: draft.text.slice(0, offset) + QUOTE_MARKER + draft.text.slice(offset), quotes: [...draft.quotes.map((quote) => quote.offset >= offset ? { ...quote, offset: quote.offset + 1 } : quote), { id, offset, text }].sort((a, b) => a.offset - b.offset), caret: offset + 1, requestId: null, error: null };
    }
    function replaceDraftRange(draft, start, end, text) {
      return { text: draft.text.slice(0, start) + text + draft.text.slice(end), quotes: draft.quotes.filter((quote) => quote.offset < start || quote.offset >= end).map((quote) => quote.offset >= end ? { ...quote, offset: quote.offset + text.length - (end - start) } : quote), caret: start + text.length, requestId: null, error: null };
    }
    function removeDraftQuote(draft, quote) {
      const end = quote.offset + 1 + Number(draft.text[quote.offset + 1] === ' ');
      return replaceDraftRange(draft, quote.offset, end, '');
    }
    function deleteDraftQuote(draft, selection, backward) {
      if (selection === null) {
        return null;
      }
      if (selection.start !== selection.end) {
        return draft.quotes.some((quote) => quote.offset >= selection.start && quote.offset < selection.end) ? replaceDraftRange(draft, selection.start, selection.end, '') : null;
      }
      const offset = backward ? selection.start - 1 : selection.start;
      const quote = draft.quotes.find((item) => item.offset === offset || (backward && draft.text[offset] === ' ' && item.offset === offset - 1));
      return quote === undefined ? null : removeDraftQuote(draft, quote);
    }
    function quotePreviewPosition(anchor, size, viewport) {
      const left = Math.max(8, Math.min(anchor.left, viewport.width - size.width - 8));
      const below = anchor.bottom + 8;
      const top = below + size.height <= viewport.height - 8 ? below : Math.max(8, anchor.top - size.height - 8);
      return { left, top };
    }
    function serializeQuoteDraft(draft) {
      if (draft.quotes.length === 0) {
        return draft.text;
      }
      const tokens = [];
      let cursor = 0;
      for (const quote of draft.quotes) {
        tokens.push({ kind: 'text', text: draft.text.slice(cursor, quote.offset) }, { kind: 'quote', text: quote.text });
        cursor = quote.offset + 1;
      }
      tokens.push({ kind: 'text', text: draft.text.slice(cursor) });
      return tokens.map((token, index) => {
        if (token.kind === 'quote') {
          return token.text.replace(/\r\n?/gu, '\n').split('\n').map((line) => `> ${line}`).join('\n');
        }
        let text = token.text;
        if (index === 0 || tokens[index - 1]?.kind === 'quote') {
          text = text.trimStart();
        }
        if (index === tokens.length - 1 || tokens[index + 1]?.kind === 'quote') {
          text = text.trimEnd();
        }
        if (text === '') {
          return index > 0 && index < tokens.length - 1 ? '\n\n' : '';
        }
        return `${index > 0 ? '\n\n' : ''}${text}${index < tokens.length - 1 ? '\n\n' : ''}`;
      }).join('');
    }
    function serializeQuoteClipboard(draft) {
      let result = '';
      let cursor = 0;
      for (const quote of draft.quotes) {
        result += draft.text.slice(cursor, quote.offset);
        if (quote.offset > 0 && !result.endsWith('\n\n')) {
          result += '\n\n';
        }
        result += serializeQuoteDraft({ text: QUOTE_MARKER, quotes: [{ ...quote, offset: 0 }] });
        cursor = quote.offset + 1;
        if (cursor < draft.text.length) {
          result += '\n\n';
        }
      }
      return result + draft.text.slice(cursor);
    }
    function orderedSidechatTabs(layout) {
      const tabs = [];
      const visit = (id) => {
        const node = layout.nodes[id];
        if (node.kind === 'split') {
          node.children.forEach(visit);
        } else {
          tabs.push(...node.tabs.map((tabId) => layout.tabs[tabId]).filter((tab) => tab.kind === KIND));
        }
      };
      visit(layout.rootId);
      layout.floats.forEach(visit);
      return tabs;
    }
    function selectQuoteTarget(state, layout, parentId) {
      const available = (tab) => {
        const target = parseAddress(tab.contentId);
        const record = state.records.find((item) => item.id === target?.id);
        return target?.parentId === parentId && target.bootId === state.bootId && record !== undefined && record.status !== 'closing' && !state.ending[record.id];
      };
      const tabs = orderedSidechatTabs(layout).filter(available);
      const pane = layout.nodes[layout.activePaneId];
      const active = layout.tabs[pane?.activeTabId];
      return (layout.expanded || pane?.host === 'float') && active?.kind === KIND && available(active) ? active : tabs[0];
    }

    class Manager {
      constructor(ctx, t) {
        this.ctx = ctx;
        this.t = t;
        this.catalog = { snapshot: {}, listeners: new Set() };
        this.catalog.getSnapshot = () => this.catalog.snapshot;
        this.catalog.subscribe = (fn) => { this.catalog.listeners.add(fn); return () => this.catalog.listeners.delete(fn); };
        this.parents = new Map();
        this.composers = new Map();
        this.cleanups = new Map();
        this.retired = new Set();
        this.blocked = new Set();
        this.references = new Set();
        this.lifetime = new AbortController();
        this.disposed = false;
      }
      parent(id) {
        if (!this.parents.has(id)) {
          const model = { snapshot: { bootId: null, limit: 3, records: [], loading: false, creating: false, busy: {}, ending: {}, errors: {}, error: null, readError: false }, listeners: new Set(), ended: new Set(), version: 0, catalogVersion: 0, catalogApplied: 0 };
          model.getSnapshot = () => model.snapshot;
          model.subscribe = (fn) => { model.listeners.add(fn); return () => model.listeners.delete(fn); };
          this.parents.set(id, model);
        }
        return this.parents.get(id);
      }
      composer(id) {
        if (!this.composers.has(id)) {
          const model = { snapshot: { text: '', quotes: [], caret: null, focusVersion: 0, attachments: [], catalog: null, catalogLoading: false, catalogError: null, selectionBusy: false, permissionBusy: false, error: null, runtime: null, requestId: null }, listeners: new Set(), catalogVersion: 0 };
          model.getSnapshot = () => model.snapshot;
          model.subscribe = (fn) => { model.listeners.add(fn); return () => model.listeners.delete(fn); };
          this.composers.set(id, model);
        }
        return this.composers.get(id);
      }
      updateComposer(id, patch) {
        if (this.disposed || !this.composers.has(id)) {
          return;
        }
        const model = this.composers.get(id);
        model.snapshot = { ...model.snapshot, ...patch };
        for (const fn of model.listeners) {
          fn();
        }
      }
      releaseComposer(id) {
        const model = this.composers.get(id);
        if (model === undefined) {
          return;
        }
        for (const attachment of model.snapshot.attachments) {
          if (attachment.preview !== null) {
            URL.revokeObjectURL(attachment.preview);
          }
        }
        model.listeners.clear();
        this.composers.delete(id);
      }
      async loadCatalog(parentId, id) {
        const model = this.composer(id);
        const version = ++model.catalogVersion;
        this.updateComposer(id, { catalogLoading: true, catalogError: null });
        try {
          const result = await this.request(parentId, { action: 'catalog', id });
          if (this.composers.get(id) === model && model.catalogVersion === version) {
            this.updateComposer(id, { catalog: result.catalog, catalogLoading: false });
          }
        } catch (error) {
          if (this.composers.get(id) === model && model.catalogVersion === version) {
            this.updateComposer(id, { catalogError: errorText(error), catalogLoading: false });
          }
        }
      }
      async selectModel(parentId, id, selection) {
        const model = this.composer(id);
        if (model.snapshot.selectionBusy || model.snapshot.permissionBusy) {
          return;
        }
        this.updateComposer(id, { selectionBusy: true, error: null });
        try {
          await this.act(parentId, { action: 'selectModel', id, selection });
        } catch (error) {
          this.updateComposer(id, { error: errorText(error) });
        } finally {
          this.updateComposer(id, { selectionBusy: false });
        }
      }
      async selectPermission(parentId, id, permission) {
        const model = this.composer(id);
        if (model.snapshot.permissionBusy || model.snapshot.selectionBusy) {
          return;
        }
        this.updateComposer(id, { permissionBusy: true, error: null });
        try {
          await this.act(parentId, { action: 'selectPermission', id, permission });
        } catch (error) {
          this.updateComposer(id, { error: errorText(error) });
        } finally {
          this.updateComposer(id, { permissionBusy: false });
        }
      }
      async upload(parentId, id, localId) {
        const model = this.composer(id);
        const current = () => this.composers.get(id) === model ? model.snapshot.attachments.find((item) => item.localId === localId) : undefined;
        const attachment = current();
        if (attachment === undefined) {
          return;
        }
        const patch = (value) => {
          if (current() !== undefined) {
            this.updateComposer(id, { attachments: model.snapshot.attachments.map((item) => item.localId === localId ? { ...item, ...value } : item) });
          }
        };
        patch({ status: 'uploading', error: null });
        try {
          const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = () => reject(new Error(this.t('fileReadFailed')));
            reader.onabort = () => reject(new Error(this.t('fileReadFailed')));
            reader.readAsDataURL(attachment.file);
          });
          if (current() === undefined || this.disposed) {
            return;
          }
          const result = await this.request(parentId, { action: 'upload', id, name: attachment.file.name, mediaType: attachment.file.type || 'application/octet-stream', data });
          patch({ status: 'ready', token: result.attachment.id, error: null });
        } catch (error) {
          patch({ status: 'error', error: errorText(error) });
        }
      }
      async addFiles(parentId, id, files) {
        const model = this.composer(id);
        const added = Array.from(files, (file) => ({ localId: crypto.randomUUID(), file, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null, token: null, status: 'uploading', error: null }));
        this.updateComposer(id, { attachments: [...model.snapshot.attachments, ...added], requestId: null, error: null });
        // 同一批顺序上传，避免大文件同时编码占用额外内存。
        for (const attachment of added) {
          if (this.disposed || this.composers.get(id) !== model) {
            return;
          }
          await this.upload(parentId, id, attachment.localId);
        }
      }
      removeAttachment(id, localId) {
        const model = this.composer(id);
        const attachment = model.snapshot.attachments.find((item) => item.localId === localId);
        if (attachment?.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
        this.updateComposer(id, { attachments: model.snapshot.attachments.filter((item) => item.localId !== localId), requestId: null, error: null });
      }
      async quote(parentId, text, layout) {
        const model = this.parent(parentId);
        if (model.snapshot.bootId === null || model.snapshot.readError) {
          const data = await this.refresh(parentId);
          if (data === undefined) {
            throw new Error(model.snapshot.error ?? this.t('unavailable'));
          }
        }
        let record;
        let address;
        if (model.snapshot.records.length === 0) {
          const result = await this.act(parentId, { action: 'create' });
          record = result.record;
          address = addressOf(result.bootId, parentId, record.id);
        } else {
          const tab = selectQuoteTarget(model.snapshot, layout, parentId);
          if (tab === undefined) {
            throw new Error(this.t('quoteUnavailable'));
          }
          address = tab.contentId;
          record = model.snapshot.records.find((item) => item.id === parseAddress(address).id);
        }
        if (this.disposed || this.ctx.sidebarRight.mounted.getSnapshot() !== parentId) {
          throw new Error(this.t('quoteUnavailable'));
        }
        this.ctx.sidebarRight.openResource(address);
        const draft = this.composer(record.id).snapshot;
        this.updateComposer(record.id, { ...insertDraftQuote(draft, text, crypto.randomUUID()), focusVersion: draft.focusVersion + 1 });
        return record.id;
      }
      async submit(parentId, record, selection) {
        const model = this.composer(record.id);
        const submitted = model.snapshot;
        const { attachments } = submitted;
        const text = serializeQuoteDraft(submitted);
        if (text.trim() === '' && attachments.length === 0) {
          this.updateComposer(record.id, { error: this.t('empty') });
          return;
        }
        if (attachments.some((item) => item.status !== 'ready')) {
          this.updateComposer(record.id, { error: this.t('uploadPending') });
          return;
        }
        const requestId = model.snapshot.requestId ?? crypto.randomUUID();
        this.updateComposer(record.id, { requestId, error: null });
        try {
          await this.act(parentId, { action: 'send', id: record.id, text, attachments: attachments.map((item) => item.token), ...(selection == null ? {} : { selection }), delivery: 'queue', requestId, clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
          for (const attachment of attachments) {
            if (attachment.preview !== null) {
              URL.revokeObjectURL(attachment.preview);
            }
          }
          // 发送期间仍能加入引用；回执只消费本次提交的草稿。
          const quotes = model.snapshot.quotes.filter((quote) => !submitted.quotes.some((sent) => sent.id === quote.id)).map((quote, offset) => ({ ...quote, offset }));
          this.updateComposer(record.id, { text: QUOTE_MARKER.repeat(quotes.length), quotes, caret: quotes.length, attachments: model.snapshot.attachments.filter((item) => !attachments.includes(item)), requestId: null });
        } catch (error) {
          this.updateComposer(record.id, { error: errorText(error) });
        }
      }
      publish(id, patch) {
        if (this.disposed) {
          return;
        }
        const model = this.parent(id);
        model.snapshot = { ...model.snapshot, ...patch };
        for (const fn of model.listeners) {
          fn();
        }
      }
      catalogEntries(parentId) {
        return this.ctx.sessions.list.getSnapshot().projectionsBySession[parentId]?.values.subagentCatalog ?? [];
      }
      updateCatalog(parentId, data, observed, version, endedId) {
        const model = this.parent(parentId);
        const previous = this.catalog.snapshot[parentId];
        if (version < model.catalogApplied && (endedId === undefined || previous?.bootId !== data.bootId)) {
          return;
        }
        model.catalogApplied = Math.max(model.catalogApplied, version);
        const sameBoot = previous?.bootId === data.bootId;
        const known = new Set(sameBoot ? previous.known : []);
        const closed = new Set(sameBoot ? previous.closed : []);
        const active = new Set(data.records.map((record) => record.id));
        for (const record of data.records) {
          known.add(record.id);
        }
        // 仅判定发请求前已观察到的条目；请求期间新出现的侧聊先保持可见。
        for (const entry of observed) {
          if (entry.id.startsWith('sidechat-')) {
            known.add(entry.id);
            if (!active.has(entry.id)) {
              closed.add(entry.id);
            }
          }
        }
        if (endedId !== undefined) {
          known.add(endedId);
          closed.add(endedId);
        }
        if (sameBoot && known.size === previous.known.size && closed.size === previous.closed.size) {
          return;
        }
        this.catalog.snapshot = { ...this.catalog.snapshot, [parentId]: { bootId: data.bootId, known, closed } };
        for (const fn of this.catalog.listeners) {
          fn();
        }
      }
      ensureCatalog(parentId) {
        const known = this.catalog.snapshot[parentId]?.known;
        const state = this.parent(parentId).snapshot;
        if (!state.loading && !state.readError && this.catalogEntries(parentId).some((entry) => entry.id.startsWith('sidechat-') && !known?.has(entry.id))) {
          void this.refresh(parentId);
        }
      }
      async request(parentId, input) {
        const observed = this.catalogEntries(parentId);
        const version = ++this.parent(parentId).catalogVersion;
        const reference = this.ctx.sessions.retain(parentId, { source: 'sidebarChat', signal: this.lifetime.signal });
        this.references.add(reference);
        void reference.ready.catch(() => undefined);
        try {
          const result = await this.ctx.connection.rpc.call('/api', 'sidechat/execute', { args: { agentId: parentId, input } }, this.lifetime.signal);
          if (!result.ok) {
            throw new Error(`${result.error.code}: ${result.error.message}`);
          }
          if (!this.disposed) {
            this.updateCatalog(parentId, result.value, observed, version, input.action === 'end' ? input.id : undefined);
          }
          return result.value;
        } finally {
          this.references.delete(reference);
          reference.release();
        }
      }
      adopt(id, data) {
        const model = this.parent(id);
        if (model.snapshot.bootId !== data.bootId) {
          model.ended.clear();
        }
        const active = new Set(data.records.map((record) => record.id));
        for (const record of model.snapshot.records) {
          if (!active.has(record.id)) {
            this.releaseComposer(record.id);
          }
        }
        this.publish(id, { bootId: data.bootId, records: data.records.filter((record) => !model.ended.has(record.id)), limit: data.limit, loading: false, error: null, readError: false });
      }
      async refresh(id) {
        if (this.disposed) {
          return;
        }
        const model = this.parent(id);
        const version = ++model.version;
        this.publish(id, { loading: true });
        try {
          const data = await this.request(id, { action: 'list' });
          if (version === model.version) {
            this.adopt(id, data);
            this.reconcile(id);
          }
          return data;
        } catch (error) {
          if (version === model.version) {
            this.publish(id, { loading: false, error: errorText(error), readError: true });
          }
        }
      }
      ensure(id) {
        const state = this.parent(id).snapshot;
        if (state.bootId === null && !state.loading) {
          void this.refresh(id);
        }
      }
      async act(id, input) {
        const model = this.parent(id);
        const key = `${input.action}:${input.id ?? ''}`;
        if (model.snapshot.busy[key]) {
          throw new Error(this.t('busy'));
        }
        const version = ++model.version;
        this.publish(id, { busy: { ...model.snapshot.busy, [key]: true }, ...(input.action === 'create' ? { creating: true } : {}), error: null, readError: false });
        try {
          const data = await this.request(id, input);
          if (input.action === 'end' && model.snapshot.bootId === data.bootId) {
            model.ended.add(input.id);
          }
          if (version === model.version) {
            this.adopt(id, data);
          } else {
            // 并发操作可能改变清单；重新读取，避免旧响应删除新标签和草稿。
            await this.refresh(id);
          }
          const errors = { ...model.snapshot.errors };
          delete errors[input.id];
          this.publish(id, { errors });
          return data;
        } catch (error) {
          if (input.id === undefined) {
            this.publish(id, { error: errorText(error) });
          } else {
            this.publish(id, { errors: { ...model.snapshot.errors, [input.id]: errorText(error) } });
          }
          throw error;
        } finally {
          const busy = { ...model.snapshot.busy };
          delete busy[key];
          this.publish(id, { busy, ...(input.action === 'create' ? { creating: false } : {}) });
        }
      }
      close(target, address, reopen) {
        if (this.retired.has(address) || this.cleanups.has(address) || this.disposed) {
          return;
        }
        const model = this.parent(target.parentId);
        if (model.snapshot.bootId !== null && model.snapshot.bootId !== target.bootId) {
          return;
        }
        this.publish(target.parentId, { ending: { ...model.snapshot.ending, [target.id]: true } });
        const record = model.snapshot.records.find((item) => item.id === target.id);
        const blockedId = record?.childId ?? target.id;
        this.ctx.conversation.blocks.set(blockedId, { reason: this.t('closing') });
        this.blocked.add(blockedId);
        // 原生 close handler 是同步的：后台清理持有命令引用，失败时重开标签显示错误。
        let failed = false;
        const task = (async () => {
          if (model.snapshot.bootId === null) {
            const data = await this.refresh(target.parentId);
            if (data === undefined) {
              throw new Error(model.snapshot.error ?? this.t('unavailable'));
            }
          }
          if (model.snapshot.bootId === target.bootId) {
            await this.act(target.parentId, { action: 'end', id: target.id });
          }
        })().catch((error) => {
          failed = true;
          if (!this.disposed) {
            this.publish(target.parentId, {
              records: model.snapshot.records.map((item) => item.id === target.id ? { ...item, status: 'closing', error: errorText(error) } : item),
              errors: { ...model.snapshot.errors, [target.id]: errorText(error) },
            });
            reopen();
          }
        }).finally(() => {
          this.cleanups.delete(address);
          if (!failed) {
            const ending = { ...model.snapshot.ending };
            delete ending[target.id];
            this.publish(target.parentId, { ending });
            this.ctx.conversation.blocks.set(blockedId, undefined);
            this.blocked.delete(blockedId);
          }
        });
        this.cleanups.set(address, task);
      }
      reconcile(id) {
        if (this.disposed || this.ctx.sidebarRight.mounted.getSnapshot() !== id) {
          return;
        }
        const state = this.parent(id).snapshot;
        const tabs = () => this.ctx.sidebarRight.openTabs.getSnapshot().filter((tab) => tab.sessionId === id && tab.kind === KIND);
        const ids = new Set(state.records.map((record) => record.id));
        for (const tab of tabs()) {
          const target = parseAddress(tab.contentId);
          if (target?.bootId !== state.bootId || !ids.has(target.id)) {
            this.retired.add(tab.contentId);
            this.ctx.sidebarRight.close(tab.tabId);
          }
        }
        for (const record of state.records) {
          const address = addressOf(state.bootId, id, record.id);
          if (!this.cleanups.has(address) && !tabs().some((tab) => tab.contentId === address)) {
            this.ctx.sidebarRight.openResource(address);
          }
        }
      }
      watchParent(id) {
        const reference = this.ctx.sessions.retain(id, { source: 'sidebarChat', signal: this.lifetime.signal });
        this.references.add(reference);
        const source = reference.binding.eventSource;
        const calls = new Set();
        let cursor = -1;
        let released = false;
        let scheduled = false;
        const update = () => {
          const window = source.getSnapshot();
          const entries = window.change?.kind === 'append' ? window.change.entries : window.entries;
          let changed = false;
          for (const entry of entries) {
            if (entry.type !== 'event' || entry.event.seq <= cursor) {
              continue;
            }
            const event = entry.event;
            cursor = Math.max(cursor, event.seq);
            if (event.type === 'tool/call' && event.data.name === 'sidechat_manage') {
              calls.add(event.data.callId);
            }
            if (event.type === 'tool/result' && calls.delete(event.data.message.toolCallId)) {
              changed = true;
            }
          }
          if (changed && !scheduled) {
            scheduled = true;
            queueMicrotask(() => {
              scheduled = false;
              if (!released && !this.disposed) {
                void this.refresh(id);
              }
            });
          }
        };
        const unsubscribe = source.subscribe(update);
        void reference.ready.then(() => {
          if (!released) {
            update();
          }
        }, () => undefined);
        return () => {
          released = true;
          unsubscribe();
          this.references.delete(reference);
          reference.release();
        };
      }
      dispose() {
        this.disposed = true;
        this.lifetime.abort();
        for (const reference of this.references) {
          reference.release();
        }
        for (const id of this.blocked) {
          this.ctx.conversation.blocks.set(id, undefined);
        }
        this.references.clear();
        for (const id of this.composers.keys()) {
          this.releaseComposer(id);
        }
        for (const model of this.parents.values()) {
          model.listeners.clear();
        }
        this.catalog.listeners.clear();
      }
    }

    function sidechatHistoryStart(source, boundary) {
      let observed = null;
      let reached = false;
      return {
        subscribe: (listener) => source.subscribe(listener),
        getSnapshot: () => {
          const window = source.getSnapshot();
          if (window !== observed) {
            // 连续追加与流式结算不改变起点；分页、替换或跳过修订时按完整窗口判断。
            if (observed === null || window.revision !== observed.revision + 1 || window.change.kind === 'replace' || window.change.kind === 'prepend') {
              const first = window.entries.find((entry) => entry.type === 'event');
              reached = !window.hasMore || (first !== undefined && first.event.seq <= boundary + 1);
            }
            observed = window;
          }
          return reached;
        },
      };
    }
    function FilteredChat({ component: Component, nativeProps }) {
      const { record, historySource } = React.useContext(SidechatContext);
      const boundary = record.cutoffSeq + 1;
      const historyStart = React.useMemo(() => sidechatHistoryStart(historySource, boundary), [historySource, boundary]);
      const reachedStart = React.useSyncExternalStore(historyStart.subscribe, historyStart.getSnapshot, historyStart.getSnapshot);
      const sessionCache = React.useMemo(() => new WeakMap(), [reachedStart]);
      const projectSession = React.useCallback((snapshot) => {
        if (!reachedStart) {
          return snapshot;
        }
        if (!sessionCache.has(snapshot)) {
          sessionCache.set(snapshot, { ...snapshot, hasMore: false, historyWasPartial: false });
        }
        return sessionCache.get(snapshot);
      }, [reachedStart, sessionCache]);
      const useSession = React.useCallback((selector, equality) => nativeProps.useSession((snapshot) => selector(projectSession(snapshot)), equality), [nativeProps.useSession, projectSession]);
      const loadOlder = React.useCallback(() => {
        if (!historyStart.getSnapshot()) {
          return nativeProps.loadOlder();
        }
      }, [historyStart, nativeProps.loadOlder]);
      const cache = React.useMemo(() => new WeakMap(), [boundary]);
      const project = React.useCallback((snapshot) => {
        if (!cache.has(snapshot)) {
          cache.set(snapshot, { ...snapshot, order: snapshot.order.filter((key) => isNewNode(snapshot.nodes.get(key), boundary)), navigation: { ...snapshot.navigation, items: () => snapshot.navigation.items().filter((item) => isNewNode(snapshot.nodes.get(item.anchorKey), boundary)) } });
        }
        return cache.get(snapshot);
      }, [boundary, cache]);
      const useChat = React.useCallback((selector, equality) => nativeProps.useChat((snapshot) => selector(project(snapshot)), equality), [nativeProps.useChat, project]);
      const useProjection = React.useCallback((key) => {
        const value = nativeProps.useProjection(key);
        return React.useMemo(() => key === 'turnOutline' && Array.isArray(value) ? value.filter((item) => item.seq > boundary) : value, [key, value, boundary]);
      }, [nativeProps.useProjection, boundary]);
      return h(Component, { ...nativeProps, useChat, useProjection, useSession, loadOlder });
    }
    function FilteredFlow({ component: Component, nativeProps }) {
      const { record } = React.useContext(SidechatContext);
      const boundary = record.cutoffSeq + 1;
      const chat = nativeProps.useChat((snapshot) => snapshot);
      const conversation = nativeProps.useConversation((snapshot) => snapshot);
      const groups = conversation.views.grouped('chat');
      const cache = React.useMemo(() => new WeakMap(), [boundary, chat]);
      const filterGroup = React.useCallback((group) => {
        if (group === undefined) {
          return undefined;
        }
        if (!cache.has(group)) {
          cache.set(group, { ...group, members: group.members.filter((member) => isNewNode(chat.nodes.get(member.key), boundary)) });
        }
        return cache.get(group);
      }, [cache, boundary, chat]);
      const useChatGroup = React.useCallback((key, selector, equality) => nativeProps.useChatGroup(key, (group) => selector(filterGroup(group)), equality), [nativeProps.useChatGroup, filterGroup]);
      const entries = nativeProps.entries.filter((entry) => {
        if (entry.kind === 'node') {
          return isNewNode(chat.nodes.get(entry.key), boundary);
        }
        return (filterGroup(groups?.groupSource(entry.key).getSnapshot())?.members.length ?? 0) > 0;
      });
      return h(Component, { ...nativeProps, entries, useChatGroup, pendingInputs: nativeProps.pendingInputs.filter((item) => item.source?.kind !== 'sidechat-lease') });
    }

    function registerCatalogFilter(ctx, manager, name, id) {
      const entry = ctx.slots.entries(name).find((candidate) => id === undefined || candidate.options.id === id);
      // 宿主按 priority 升序选择，同 ID 的包装项必须排在原生项前面。
      const options = { ...entry.options, name, priority: (entry.options.priority ?? 0) - 1 };
      for (const key of ['store', 'locale', 'inject', 'select']) {
        if (Object.hasOwn(entry, key)) {
          options[key] = entry[key];
        }
      }
      // 原生子槽位已有声明，包装组件只声明自己的别名。
      if (entry.children !== undefined) {
        options.children = Object.fromEntries(Object.entries(entry.children).map(([child, spec]) => [catalogSlot(child), spec]));
      }
      const Component = entry.component;
      function FilteredCatalog(props) {
        const renderSlot = React.useMemo(() => props.renderSlot === undefined ? undefined : (child, owner, settings) => props.renderSlot(catalogSlot(child), owner, settings), [props.renderSlot]);
        const parents = React.useSyncExternalStore(manager.catalog.subscribe, manager.catalog.getSnapshot, manager.catalog.getSnapshot);
        const projections = props.useSessions((state) => state.projectionsBySession);
        const parentId = props.lineageSessionId ?? props.sessionId;
        React.useEffect(() => { manager.ensureCatalog(parentId); }, [parentId, projections, parents]);
        const useSessions = React.useMemo(() => {
          const cache = new WeakMap();
          return (selector, equal) => props.useSessions((snapshot) => {
            if (!cache.has(snapshot)) {
              cache.set(snapshot, catalogSnapshot(snapshot, parents));
            }
            return selector(cache.get(snapshot));
          }, equal);
        }, [props.useSessions, parents]);
        const prepareCatalog = React.useCallback(async (sessionId) => {
          await ctx.sessions.refreshProjections(sessionId);
          if (manager.catalogEntries(sessionId).some((child) => child.id.startsWith('sidechat-'))) {
            await manager.refresh(sessionId);
          }
          const state = ctx.sessions.list.getSnapshot();
          const parent = state.projectionsBySession[sessionId];
          if (parent?.state !== 'ready') {
            return;
          }
          for (const child of visibleCatalog(parent.values.subagentCatalog ?? [], sessionId, manager.catalog.getSnapshot())) {
            if (child.mode === 'external') {
              continue;
            }
            const current = ctx.sessions.list.getSnapshot();
            if (current.byId[child.id]?.formatStatus === 'migration-required' || current.projectionsBySession[child.id]?.state === 'migration-required' || current.projectionsBySession[child.id]?.state === 'error') {
              continue;
            }
            await ctx.sessions.refreshProjections(child.id);
          }
        }, []);
        return h(Component, { ...props, useSessions, prepareCatalog, ...(renderSlot === undefined ? {} : { renderSlot }) });
      }
      return ctx.slots.register(options, FilteredCatalog);
    }

    function mirrorNativeSession(ctx, roots = [originalRoot, 'conversation.composer'], slotName = nativeSlot) {
      let disposed = false;
      let scheduled = false;
      let registrations = [];
      let subscriptions = [];
      const clear = () => {
        for (const unsubscribe of subscriptions.splice(0)) {
          unsubscribe();
        }
        for (const unregister of registrations.splice(0).reverse()) {
          unregister();
        }
      };
      const schedule = () => {
        if (disposed || scheduled) {
          return;
        }
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          if (!disposed) {
            rebuild();
          }
        });
      };
      const rebuild = () => {
        clear();
        const childrenOf = (children) => Object.fromEntries(Object.entries(children).map(([child, spec]) => [slotName(child), spec]));
        const visited = new Set();
        const copy = (name) => {
          if (visited.has(name)) {
            return;
          }
          visited.add(name);
          // 只在侧聊私有子树中省略当前远程子会话无法执行的会话命令控件。
          if (name === 'conversation.input.permission' || name === 'conversation.input.plan') {
            return;
          }
          const entries = ctx.slots.entries(name).filter((entry) => name !== 'conversation.view' || entry.options.id === 'chat');
          for (const entry of entries) {
            const options = { ...entry.options, name: slotName(name) };
            for (const key of ['store', 'locale', 'inject', 'select']) {
              if (Object.hasOwn(entry, key)) {
                options[key] = entry[key];
              }
            }
            if (entry.children !== undefined) {
              options.children = childrenOf(entry.children);
            }
            const Component = entry.component;
            function NativeEntry(props) {
              const renderSlot = React.useMemo(() => props.renderSlot === undefined ? undefined : (child, owner, settings) => props.renderSlot(slotName(child), owner, settings), [props.renderSlot]);
              const renderSlotChain = React.useMemo(() => props.renderSlotChain === undefined ? undefined : (child, owner, settings) => props.renderSlotChain(slotName(child), owner, settings), [props.renderSlotChain]);
              const forwarded = { ...props, ...(renderSlot === undefined ? {} : { renderSlot }), ...(renderSlotChain === undefined ? {} : { renderSlotChain }) };
              if (name === 'conversation.chat.flow') {
                return h(FilteredFlow, { component: Component, nativeProps: forwarded });
              }
              if (name === 'conversation.view') {
                return h(FilteredChat, { component: Component, nativeProps: forwarded });
              }
              return h(Component, forwarded);
            }
            registrations.push(ctx.slots.register(options, NativeEntry));
            for (const child of Object.keys(entry.children ?? {})) {
              copy(child);
            }
          }
        };
        for (const name of roots) {
          copy(name);
        }
        for (const name of visited) {
          subscriptions.push(ctx.slots.subscribe(name, schedule));
        }
      };
      rebuild();
      return () => { disposed = true; clear(); };
    }

    function resourceProvider(ctx, manager) {
      return {
        protocol: KIND,
        async *open(address, { signal }) {
          const target = parseAddress(address);
          const model = manager.parent(target.parentId);
          let dirty = true;
          let notify;
          let reference = null;
          let childId = null;
          const wake = () => { dirty = true; notify?.(); notify = undefined; };
          const unsubscribe = model.subscribe(wake);
          signal.addEventListener('abort', wake, { once: true });
          manager.ensure(target.parentId);
          try {
            while (!signal.aborted) {
              if (!dirty) {
                await new Promise((resolve) => { notify = resolve; });
              }
              if (signal.aborted) {
                break;
              }
              dirty = false;
              const state = model.snapshot;
              const record = state.records.find((item) => item.id === target.id);
              const phase = state.bootId === null ? (state.error ? 'error' : 'loading') : state.bootId !== target.bootId ? 'expired' : record === undefined ? 'ended' : 'ready';
              const nextChild = phase === 'ready' ? record.childId : null;
              if (reference !== null && childId !== nextChild) {
                reference.release(); reference = null; childId = null;
              }
              if (nextChild !== null && reference === null) {
                yield { ok: true, value: { phase: 'opening', record, reference: null } };
                reference = ctx.sessions.retain({ parentSessionId: target.parentId, childSessionId: nextChild, mode: 'continuable' }, { source: 'sidebarChat', signal });
                childId = nextChild;
                try {
                  await reference.ready;
                } catch (error) {
                  reference.release(); reference = null; childId = null;
                  if (signal.aborted) {
                    break;
                  }
                  yield { ok: false, error: { code: 'gateway/internal', message: errorText(error), details: {} } };
                  continue;
                }
                if (signal.aborted) {
                  break;
                }
                if (dirty) {
                  continue;
                }
              }
              yield { ok: true, value: { phase, record: record ?? null, reference, error: state.error } };
            }
          } finally {
            unsubscribe(); signal.removeEventListener('abort', wake); reference?.release();
          }
        },
      };
    }
    // 引用在编辑器中占一个字符；DOM 只由这个组件维护，完整内容留在草稿模型中。
    function readQuoteEditor(root, known, point) {
      let text = '';
      let caret = null;
      const quotes = [];
      const visit = (node) => {
        if (node.nodeType === 3) {
          if (point?.container === node) {
            caret = text.length + point.offset;
          }
          text += node.textContent;
          return;
        }
        const id = node.dataset?.quoteId;
        if (id !== undefined) {
          const quote = known.find((item) => item.id === id);
          if (quote !== undefined) {
            quotes.push({ ...quote, offset: text.length });
          }
          // 引用记录被删除后，旧 DOM 节点仍占位，保证同步时能识别并移除它。
          text += QUOTE_MARKER;
          return;
        }
        if (node.nodeName === 'BR') {
          if (node.nextSibling !== null) {
            text += '\n';
          }
          return;
        }
        if ((node.nodeName === 'DIV' || node.nodeName === 'P') && node.previousSibling !== null) {
          text += '\n';
        }
        node.childNodes.forEach((child, index) => {
          if (point?.container === node && point.offset === index) {
            caret = text.length;
          }
          visit(child);
        });
        if (point?.container === node && point.offset === node.childNodes.length) {
          caret = text.length;
        }
      };
      root.childNodes.forEach((node, index) => {
        if (point?.container === root && point.offset === index) {
          caret = text.length;
        }
        visit(node);
      });
      if (point?.container === root && point.offset === root.childNodes.length) {
        caret = text.length;
      }
      if (root.childNodes.length === 1 && root.firstChild.nodeName === 'BR') {
        text = '';
      }
      return { text, quotes, ...(point === undefined ? {} : { caret }) };
    }
    function QuoteEditor({ draft, manager, recordId, editorRef, disabled, placeholder, onTextChange, onCursorChange, t, ...handlers }) {
      const root = React.useRef(null);
      const latest = React.useRef(draft);
      const knownQuotes = React.useRef(new Map());
      for (const quote of draft.quotes) {
        knownQuotes.current.set(quote.id, quote);
      }
      latest.current = draft;
      const [preview, setPreview] = React.useState(null);
      const previewCard = React.useRef(null);
      const previewLeave = React.useRef(null);
      const composing = React.useRef(false);
      const keepPreview = () => {
        window.clearTimeout(previewLeave.current);
        previewLeave.current = null;
      };
      const closePreview = () => {
        keepPreview();
        setPreview(null);
      };
      const leavePreview = () => {
        keepPreview();
        previewLeave.current = window.setTimeout(() => { previewLeave.current = null; setPreview(null); }, 100);
      };
      const showPreview = (chip) => {
        if (chip === null) {
          return;
        }
        keepPreview();
        const body = chip.querySelector('[data-quote-preview]');
        if (body.scrollWidth <= body.clientWidth) {
          setPreview(null);
          return;
        }
        const quote = latest.current.quotes.find((item) => item.id === chip.dataset.quoteId);
        setPreview((current) => current?.anchor === chip ? current : { id: quote.id, text: quote.text, anchor: chip });
      };
      const selectionRange = () => {
        const selection = window.getSelection();
        if (selection === null || selection.rangeCount === 0) {
          return null;
        }
        const range = selection.getRangeAt(0);
        if (!root.current.contains(range.startContainer) || !root.current.contains(range.endContainer)) {
          return null;
        }
        const offset = (container, position) => readQuoteEditor(root.current, [...knownQuotes.current.values()], { container, offset: position }).caret;
        return { start: offset(range.startContainer, range.startOffset), end: offset(range.endContainer, range.endOffset) };
      };
      const restore = (start, end = start) => {
        const locate = (offset) => {
          let left = offset;
          const visit = (node) => {
            if (node.nodeType === 3) {
              if (left <= node.textContent.length) {
                return [node, left];
              }
              left -= node.textContent.length;
            } else if (node.dataset?.quoteId !== undefined || node.nodeName === 'BR') {
              const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
              if (left <= 1) {
                return [node.parentNode, index + left];
              }
              left -= 1;
            } else {
              for (const child of node.childNodes) {
                const found = visit(child);
                if (found !== undefined) {
                  return found;
                }
              }
            }
          };
          return visit(root.current) ?? [root.current, root.current.childNodes.length];
        };
        const range = document.createRange();
        range.setStart(...locate(start));
        range.setEnd(...locate(end));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      };
      const sync = () => {
        const value = readQuoteEditor(root.current, [...knownQuotes.current.values()]);
        const caret = selectionRange()?.end ?? value.text.length;
        manager.updateComposer(recordId, { ...value, caret, requestId: null, error: null });
        onTextChange(value.text, caret);
      };
      const applyDraftEdit = (next) => {
        closePreview();
        manager.updateComposer(recordId, { ...next, focusVersion: latest.current.focusVersion + 1 });
        onTextChange(next.text, next.caret);
      };
      React.useLayoutEffect(() => {
        const element = root.current;
        element.setSelectionRange = restore;
        editorRef.current = element;
        const current = readQuoteEditor(element, draft.quotes);
        if (!composing.current && (current.text !== draft.text || current.quotes.length !== draft.quotes.length || current.quotes.some((quote, index) => quote.id !== draft.quotes[index]?.id || quote.text !== draft.quotes[index]?.text))) {
          const focused = document.activeElement === element;
          const nodes = [];
          let cursor = 0;
          for (const quote of draft.quotes) {
            nodes.push(document.createTextNode(draft.text.slice(cursor, quote.offset)));
            const chip = document.createElement('span');
            chip.contentEditable = 'false';
            chip.dataset.quoteId = quote.id;
            chip.className = 'dsh-sidechat-quote';
            chip.toggleAttribute('data-removable', !disabled);
            const body = document.createElement('span');
            body.dataset.quotePreview = quote.id;
            body.className = 'dsh-sidechat-quote-body';
            body.textContent = quote.text;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.dataset.quoteRemove = quote.id;
            remove.className = 'dsh-sidechat-quote-remove';
            remove.innerHTML = `<svg width="16" height="16" class="dsh-sidechat-quote-mark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><g transform="translate(6.8 2.4)">
              <path d="M2.8125 0.583008L3.2002 1.16602C2.43912 1.6713 1.88491 2.41238 1.60547 3.25684H2.98926V6.70605H0V4.52148C1.96593e-05 2.70313 0.9109 1.00575 2.42578 0L2.8125 0.583008Z" fill="currentColor"/>
              <path d="M7.50781 0.583008L7.89551 1.16602C7.13443 1.6713 6.58022 2.41238 6.30078 3.25684H7.68457V6.70605H4.69531V4.52148C4.69533 2.70313 5.60621 1.00575 7.12109 0L7.50781 0.583008Z" fill="currentColor"/>
              </g></svg><svg width="12" height="12" class="dsh-sidechat-quote-close" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
            remove.disabled = disabled;
            remove.setAttribute('aria-label', t('quoteRemove'));
            chip.append(remove, body);
            nodes.push(chip);
            cursor = quote.offset + 1;
          }
          nodes.push(document.createTextNode(draft.text.slice(cursor)));
          element.replaceChildren(...nodes);
          if (focused) {
            restore(draft.caret ?? draft.text.length);
          }
        }
        for (const button of element.querySelectorAll('[data-quote-remove]')) {
          button.disabled = disabled;
          button.parentElement.toggleAttribute('data-removable', !disabled);
        }
      }, [draft.text, draft.quotes, disabled]);
      React.useLayoutEffect(() => {
        if (draft.focusVersion > 0) {
          root.current.focus({ preventScroll: true });
          restore(draft.caret ?? draft.text.length);
        }
      }, [draft.focusVersion]);
      React.useEffect(() => {
        const changed = () => {
          const range = selectionRange();
          if (range !== null && latest.current.caret !== range.end) {
            manager.updateComposer(recordId, { caret: range.end });
            onCursorChange(range.end);
          }
        };
        document.addEventListener('selectionchange', changed);
        return () => { document.removeEventListener('selectionchange', changed); editorRef.current = null; };
      }, []);
      React.useEffect(() => () => window.clearTimeout(previewLeave.current), []);
      React.useLayoutEffect(() => {
        const element = previewCard.current;
        if (preview === null) {
          return;
        }
        if (!preview.anchor.isConnected || !draft.quotes.some((quote) => quote.id === preview.id)) {
          closePreview();
          return;
        }
        element.showPopover();
        const position = quotePreviewPosition(preview.anchor.getBoundingClientRect(), { width: element.offsetWidth, height: element.offsetHeight }, { width: window.innerWidth, height: window.innerHeight });
        element.style.left = `${position.left}px`;
        element.style.top = `${position.top}px`;
        const escape = (event) => {
          if (event.key === 'Escape') {
            closePreview();
          }
        };
        const scroll = (event) => {
          if (!element.contains(event.target)) {
            closePreview();
          }
        };
        window.addEventListener('resize', closePreview);
        document.addEventListener('scroll', scroll, true);
        document.addEventListener('keydown', escape);
        return () => {
          window.removeEventListener('resize', closePreview);
          document.removeEventListener('scroll', scroll, true);
          document.removeEventListener('keydown', escape);
          if (element.matches(':popover-open')) {
            element.hidePopover();
          }
        };
      }, [preview, draft.text, draft.quotes]);
      const selectedDraft = () => {
        const range = selectionRange();
        if (range === null || range.start === range.end) {
          return null;
        }
        return { ...latest.current, text: latest.current.text.slice(range.start, range.end), quotes: latest.current.quotes.filter((quote) => quote.offset >= range.start && quote.offset < range.end).map((quote) => ({ ...quote, offset: quote.offset - range.start })) };
      };
      return h(React.Fragment, null,
        h('div', { ...handlers, ref: root, className: 'dsh-sidechat-launch-input dsh-sidechat-rich-input', contentEditable: !disabled, suppressContentEditableWarning: true, role: 'textbox', tabIndex: 0, 'aria-multiline': true, 'aria-disabled': disabled, 'aria-label': placeholder, 'data-placeholder': placeholder, 'data-empty': draft.text === '', onKeyDown: (event) => {
          if (event.target.closest('[data-quote-id]')) {
            event.stopPropagation();
            return;
          }
          if (!disabled && !composing.current && !event.nativeEvent.isComposing && event.keyCode !== 229 && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && (event.key === 'Backspace' || event.key === 'Delete')) {
            const next = deleteDraftQuote(latest.current, selectionRange(), event.key === 'Backspace');
            if (next !== null) {
              event.preventDefault();
              event.stopPropagation();
              applyDraftEdit(next);
              return;
            }
          }
          handlers.onKeyDown?.(event);
        }, onInput: sync, onBlur: () => {
          const range = selectionRange();
          if (range !== null) {
            manager.updateComposer(recordId, { caret: range.end });
          }
        }, onCompositionStart: (event) => { composing.current = true; handlers.onCompositionStart?.(event); }, onCompositionEnd: (event) => { composing.current = false; sync(); handlers.onCompositionEnd?.(event); }, onPaste: (event) => {
          handlers.onPaste?.(event);
          if (!event.defaultPrevented && !disabled) {
            event.preventDefault();
            document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
          }
        }, onCopy: (event) => {
          const selected = selectedDraft();
          if (selected !== null) {
            event.preventDefault();
            event.clipboardData.setData('text/plain', serializeQuoteClipboard(selected));
          }
        }, onCut: (event) => {
          const selected = selectedDraft();
          if (selected !== null && !disabled) {
            event.preventDefault();
            event.clipboardData.setData('text/plain', serializeQuoteClipboard(selected));
            document.execCommand('delete');
          }
        }, onPointerDown: (event) => {
          if (event.target.closest('[data-quote-id]')) {
            event.preventDefault();
            event.stopPropagation();
          }
        }, onPointerOver: (event) => {
          if (event.pointerType !== 'touch') {
            showPreview(event.target.closest('[data-quote-id]'));
          }
        }, onPointerOut: (event) => {
          const chip = event.target.closest('[data-quote-id]');
          if (chip !== null && !chip.contains(event.relatedTarget) && !previewCard.current.contains(event.relatedTarget)) {
            leavePreview();
          }
        }, onFocus: (event) => {
          if (event.target.matches(':focus-visible')) {
            showPreview(event.target.closest('[data-quote-id]'));
          }
        }, onClick: (event) => {
          const remove = event.target.closest('[data-quote-remove]');
          if (remove !== null && !disabled) {
            event.preventDefault();
            event.stopPropagation();
            const quote = latest.current.quotes.find((item) => item.id === remove.dataset.quoteRemove);
            applyDraftEdit(removeDraftQuote(latest.current, quote));
          }
        } }),
        h('div', { ref: previewCard, popover: 'manual', className: 'dsh-sidechat-quote-preview', role: 'tooltip', 'aria-label': t('quotePreview'), onPointerEnter: keepPreview, onPointerLeave: leavePreview }, h('div', { className: 'dsh-sidechat-quote-full' }, preview?.text)));
    }

    function NativeConversation(props) {
      const session = props.useSession((snapshot) => snapshot);
      const pendingInteraction = props.useSessionStatus((snapshot) => snapshot.get(props.sessionId)?.pendingInteraction);
      const block = props.useComposerBlock((snapshot) => snapshot);
      const value = React.useMemo(() => ({ record: props.record, historySource: props.historySource }), [props.record, props.historySource]);
      React.useEffect(() => {
        props.onRuntime({ running: Boolean(session?.running), open: session?.openState === 'open', removed: Boolean(session?.removed), blocked: block?.reason ?? null, pendingInteraction: pendingInteraction !== undefined && pendingInteraction !== null });
      }, [session?.running, session?.openState, session?.removed, block?.reason, pendingInteraction, props.onRuntime]);
      // 审批和计划确认继续交给宿主接管链；普通输入由外层统一输入框负责。
      const interaction = props.renderSlotChain(nativeSlot('conversation.composer'), { sessionId: props.sessionId, session, pendingInteraction }, { fallback: null, overlay: true });
      return h(SidechatContext.Provider, { value }, h('div', { className: 'dsh-sidechat-content', 'data-conversation-content': '', 'data-conversation-session': props.sessionId, 'data-conversation-region': 'chat', 'data-content-phase': 'active' },
        h('style', null, uiStyles),
        h('div', { className: 'dsh-sidechat-scroll', 'data-conversation-scroll': '' },
          h('div', { className: 'dsh-sidechat-transcript' }, props.renderSlot(nativeSlot(originalRoot), { view: 'chat' }))), interaction));
    }

    return {
      inject: ['slots', 'locale', 'resources', 'sessions', 'connection', 'sidebarRight', 'sidebarRightTabs', 'conversation'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, dictionaries));
        const t = ctx.locale.bind(NS);
        const nativeText = ctx.locale.bind('conversation');
        const manager = new Manager(ctx, t);
        ctx.effect(() => () => manager.dispose());
        function QuoteActions(props) {
          const layout = props.useStore((snapshot) => snapshot.bySession[props.sessionId]?.layout);
          const [pending, setPending] = React.useState(false);
          const [error, setError] = React.useState(null);
          const quote = async () => {
            const text = props.readText();
            if (text === null) {
              props.dismiss();
              return;
            }
            setPending(true);
            setError(null);
            try {
              const id = await manager.quote(props.sessionId, text, layout);
              props.clearSelection();
              props.dismiss();
              const draft = manager.composer(id).snapshot;
              manager.updateComposer(id, { focusVersion: draft.focusVersion + 1 });
            } catch (failure) {
              setError(errorText(failure));
              setPending(false);
            }
          };
          return h('div', { className: 'dsh-sidechat-quote-actions' }, h('style', null, uiStyles),
            h(nativeQuote.component, props),
            h('button', { type: 'button', className: 'dsh-sidechat-quote-action', disabled: pending || layout === undefined, 'aria-busy': pending, onPointerDown: (event) => event.preventDefault(), onClick: () => { void quote(); } }, t('quoteToSidechat')),
            error ? h('div', { role: 'alert', style: styles.error }, error) : null);
        }
        const nativeQuote = ctx.slots.entries('conversation.chat.text-interaction').find((entry) => entry.options.key === 'quote');
        const sidebarStore = ctx.slots.entries('rightbar.session').find((entry) => entry.store !== undefined)?.store;
        if (nativeQuote !== undefined && sidebarStore !== undefined) {
          function SelectionActions(props) {
            const sidechat = React.useContext(SidechatContext);
            const main = props.useSession((session) => !session.removed && session.subagent === null);
            return sidechat !== null || !main || ctx.sidebarRight.mounted.getSnapshot() !== props.sessionId ? h(nativeQuote.component, props) : h(QuoteActions, props);
          }
          // 宿主按 priority 升序选择，包装项必须排在原生引用前面。
          ctx.slots.inject('conversation.chat.text-interaction', () => ctx.slots.register({ ...nativeQuote.options, name: 'conversation.chat.text-interaction', key: 'quote', priority: (nativeQuote.options.priority ?? 0) - 1, locale: nativeQuote.locale, store: sidebarStore }, SelectionActions));
        }
        function Guide(props) {
          const state = useParent(manager, props.sessionId);
          const { tab } = props.useTabInfo();
          const count = state.records.length + Number(state.creating);
          const full = count >= state.limit;
          React.useEffect(() => { manager.ensure(props.sessionId); }, [props.sessionId]);
          const create = async () => {
            try {
              const result = await manager.act(props.sessionId, { action: 'create' });
              tab.actions.openResource(addressOf(result.bootId, props.sessionId, result.record.id), { replaceTab: true });
              if (!tab.signal.aborted) {
                tab.actions.close();
              }
            } catch {
              // 错误由共享状态在入口就地显示。
            }
          };
          return h('div', { className: 'dsh-sidechat-guide' },
            h('style', null, uiStyles),
            h('button', { type: 'button', className: 'dsh-sidechat-guide-button', 'data-sidebar-right-guide-entry': KIND, disabled: full || state.creating || state.bootId === null, title: full ? t('limit') : undefined, 'aria-busy': state.loading || state.creating, onClick: () => { void create(); } },
              h('span', { className: 'dsh-sidechat-guide-icon' }, h(ChatIcon)),
              h('span', { className: 'dsh-sidechat-guide-title', role: 'status', 'aria-live': 'polite' }, state.loading && state.bootId === null ? t('loading') : state.creating ? t('creating') : t('create'))),
            full ? h('p', { style: styles.error }, t('limit')) : null,
            state.error ? h('div', null, h('p', { role: 'alert', style: styles.error }, state.error), state.readError ? h('button', { type: 'button', style: styles.button, disabled: state.loading, onClick: () => { void manager.refresh(props.sessionId); } }, t('retry')) : null) : null);
        }
        function Title(props) {
          const { tab } = props.useTabInfo();
          const state = useParent(manager, props.sessionId);
          const target = parseAddress(tab.contentId);
          const record = target?.bootId === state.bootId ? state.records.find((item) => item.id === target.id) : undefined;
          const title = record?.title ?? tab.title ?? t('prefix');
          return h('span', { title }, title);
        }
        function PendingAttachments({ attachments, disabled, onRemove, onRetry }) {
          const [previewId, setPreviewId] = React.useState(null);
          const dialog = React.useRef(null);
          const preview = attachments.find((attachment) => attachment.localId === previewId);
          React.useEffect(() => {
            if (preview !== undefined && !dialog.current.open) {
              dialog.current.showModal();
            } else if (preview === undefined && dialog.current.open) {
              dialog.current.close();
            }
          }, [preview?.localId]);
          const fileSize = (bytes) => {
            const unit = bytes < 1024 ? 'B' : bytes < 1048576 ? 'KB' : bytes < 1073741824 ? 'MB' : 'GB';
            const scale = unit === 'B' ? 1 : unit === 'KB' ? 1024 : unit === 'MB' ? 1048576 : 1073741824;
            return `${(bytes / scale).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
          };
          const fileIcon = h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: 'M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6' }));
          const warning = h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: 'm12 3 10 18H2zM12 9v5M12 17v.2' }));
          return h(React.Fragment, null,
            h('div', { className: 'dsh-sidechat-attachment-rail', role: 'list', 'aria-label': t('attach'), tabIndex: 0 }, attachments.map((attachment) => {
              const failed = attachment.status === 'error';
              const uploading = attachment.status === 'uploading';
              const image = attachment.preview !== null;
              const name = attachment.file.name;
              const extension = name.includes('.') ? name.split('.').at(-1).toUpperCase() : t('fileLabel');
              const meta = `${extension} · ${fileSize(attachment.file.size)}`;
              return h('div', { key: attachment.localId, className: image ? 'dsh-sidechat-image-item' : 'dsh-sidechat-file-item', role: 'listitem', 'data-failed': failed, title: name },
                image ? h(React.Fragment, null,
                  h('button', { type: 'button', className: 'dsh-sidechat-thumbnail', 'data-failed': failed, 'aria-label': `${t('openImage')} ${name}`, 'aria-busy': uploading, onClick: () => setPreviewId(attachment.localId) }, h('img', { src: attachment.preview, alt: name })),
                  failed ? h('span', { className: 'dsh-sidechat-image-failure' }, warning) : null) : h(React.Fragment, null,
                  h('span', { className: 'dsh-sidechat-file-icon' }, uploading ? h('span', { className: 'dsh-sidechat-upload-spinner', role: 'status', 'aria-label': t('uploading') }) : failed ? warning : fileIcon),
                  h('div', { className: 'dsh-sidechat-file-body' }, h('div', { className: 'dsh-sidechat-file-name' }, name), h('div', { className: 'dsh-sidechat-file-meta', role: 'status' }, uploading ? t('uploading') : failed ? t('uploadFailed') : meta))),
                uploading ? h('span', { className: 'dsh-sidechat-upload-track', role: 'status', 'aria-label': `${name} · ${t('uploading')}` }, h('span', { className: 'dsh-sidechat-upload-bar' })) : null,
                h('button', { type: 'button', className: 'dsh-sidechat-attachment-remove', disabled, title: t('removeAttachment'), 'aria-label': `${t('removeAttachment')} ${name}`, onClick: () => onRemove(attachment.localId) }, '×'));
            })),
            attachments.some((attachment) => attachment.status === 'error') ? h('div', { className: 'dsh-sidechat-attachment-errors' }, attachments.filter((attachment) => attachment.status === 'error').map((attachment) => h('div', { key: attachment.localId, className: 'dsh-sidechat-attachment-error', role: 'alert' },
              h('span', null, `${attachment.file.name}: ${attachment.error}`), h('button', { type: 'button', className: 'dsh-sidechat-attachment-retry', disabled, onClick: () => onRetry(attachment.localId) }, t('retryUpload'))))) : null,
            h('dialog', { ref: dialog, className: 'dsh-sidechat-image-preview', 'aria-label': `${t('openImage')} ${preview?.file.name ?? ''}`, onKeyDown: (event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
              }
            }, onClose: () => setPreviewId(null), onClick: (event) => {
              if (event.target === event.currentTarget) {
                dialog.current.close();
              }
            } }, h('button', { type: 'button', className: 'dsh-sidechat-control dsh-sidechat-preview-close', autoFocus: true, 'aria-label': t('closePreview'), onClick: () => dialog.current.close() }, '×'), preview === undefined ? null : h('img', { src: preview.preview, alt: preview.file.name })));
        }
        function PermissionMenu({ value, options, started, locked, pending, suspended, onOpen, onSelect }) {
          const [open, setOpen] = React.useState(false);
          const [confirmation, setConfirmation] = React.useState(null);
          const [acknowledged, setAcknowledged] = React.useState(false);
          const root = React.useRef(null);
          const trigger = React.useRef(null);
          const menu = React.useRef(null);
          const dialog = React.useRef(null);
          const restoreSelectionFocus = React.useRef(false);
          const menuId = React.useId();
          const titleId = React.useId();
          const descriptionId = React.useId();
          const labels = { default: 'permissionDefault', 'read-only': 'permissionReadOnly', 'workspace-write': 'permissionWorkspaceWrite', 'danger-full-access': 'permissionFullAccess', auto: 'permissionAuto', custom: 'permissionCustom' };
          const labelOf = (option) => labels[option.value] === undefined ? option.name : t(labels[option.value]);
          const current = options.find((option) => option.value === value);
          const label = labelOf(current ?? { value, name: value ?? t('permission') });
          const glyph = (permission) => {
            const paths = { 'read-only': 'M8 1.5 13 3.5v4c0 3-2.5 5.5-5 7-2.5-1.5-5-4-5-7v-4Z M5.5 8l1.5 1.5 3.5-3.5', 'workspace-write': 'M3 5V3h4l1 1h5v3M3 9v4h5M1.5 7.5l1.5 1.5 1.5-1.5M10.5 9.5l2 2M9 13l1.5-.5 3-3-1-1-3 3Z', 'danger-full-access': 'M8 1.5 13 3.5v4c0 3-2.5 5.5-5 7-2.5-1.5-5-4-5-7v-4Z M8 4v7', auto: 'M5 2h6l3 6-3 6H5L2 8Z M5.5 10.5 8 5l2.5 5.5M6.5 8.5h3' };
            const path = paths[permission === 'default' ? 'workspace-write' : permission];
            return path === undefined ? null : h('span', { className: 'dsh-sidechat-permission-icon' }, h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: path })));
          };
          const chevron = h('svg', { className: `dsh-sidechat-chevron${pending ? ' dsh-sidechat-spinner' : ''}`, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: pending ? 'M8 2a6 6 0 1 1-6 6' : 'm4 6 4 4 4-4' }));
          const close = (restoreFocus = false) => {
            setOpen(false);
            if (restoreFocus) {
              trigger.current?.focus({ preventScroll: true });
            }
          };
          const closeConfirmation = () => {
            restoreSelectionFocus.current = true;
            setConfirmation(null);
            setAcknowledged(false);
          };
          const select = (permission) => {
            close();
            restoreSelectionFocus.current = true;
            onSelect(permission);
          };
          const choose = (permission) => {
            close();
            if (permission === value && started) {
              trigger.current?.focus({ preventScroll: true });
              return;
            }
            if (permission === 'danger-full-access' || permission === 'auto') {
              setAcknowledged(false);
              setConfirmation(permission);
            } else {
              select(permission);
            }
          };
          React.useEffect(() => {
            if (!pending && confirmation === null && restoreSelectionFocus.current) {
              restoreSelectionFocus.current = false;
              trigger.current?.focus({ preventScroll: true });
            }
          }, [pending, confirmation]);
          React.useEffect(() => {
            if (locked || suspended) {
              setOpen(false);
              setConfirmation(null);
              setAcknowledged(false);
            }
          }, [locked, suspended]);
          React.useLayoutEffect(() => {
            const element = menu.current;
            if (!open || locked || suspended) {
              if (element.matches(':popover-open')) {
                element.hidePopover();
              }
              return;
            }
            // 使用浏览器顶层浮层，避免侧栏和停靠输入区裁切菜单。
            element.showPopover();
            const position = () => {
              const anchor = trigger.current.getBoundingClientRect();
              const bounds = element.getBoundingClientRect();
              const spaceAbove = anchor.top - 14;
              const spaceBelow = window.innerHeight - anchor.bottom - 14;
              const above = spaceAbove >= Math.min(bounds.height, 360) || spaceAbove >= spaceBelow;
              element.style.maxHeight = `${Math.max(0, Math.min(360, above ? spaceAbove : spaceBelow))}px`;
              element.style.left = `${Math.max(8, Math.min(anchor.left, window.innerWidth - bounds.width - 8))}px`;
              element.style.top = `${above ? Math.max(8, anchor.top - element.getBoundingClientRect().height - 6) : anchor.bottom + 6}px`;
            };
            const outside = (event) => {
              if (!root.current.contains(event.target)) {
                close();
              }
            };
            position();
            const selected = element.querySelector('[aria-checked="true"]') ?? element.querySelector('button');
            selected?.focus({ preventScroll: true });
            selected?.scrollIntoView({ block: 'nearest' });
            window.addEventListener('resize', position);
            window.addEventListener('scroll', position, true);
            document.addEventListener('pointerdown', outside);
            return () => {
              window.removeEventListener('resize', position);
              window.removeEventListener('scroll', position, true);
              document.removeEventListener('pointerdown', outside);
              if (element.matches(':popover-open')) {
                element.hidePopover();
              }
            };
          }, [open, locked, suspended, options]);
          React.useLayoutEffect(() => {
            const element = dialog.current;
            if (confirmation !== null && !locked && !suspended) {
              element.showModal();
            } else if (element.open) {
              element.close();
            }
          }, [confirmation, locked, suspended]);
          const keyDown = (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              const items = Array.from(menu.current.querySelectorAll('button'));
              const index = items.indexOf(document.activeElement);
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
              items[next]?.focus({ preventScroll: true });
              items[next]?.scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Tab') {
              close();
            }
          };
          const auto = confirmation === 'auto';
          return h('div', { ref: root, className: 'dsh-sidechat-permission-seat', onBlur: (event) => {
            if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget)) {
              close();
            }
          } },
            h('button', { ref: trigger, type: 'button', className: 'dsh-sidechat-permission-trigger', disabled: locked || options.length === 0 || confirmation !== null, 'aria-label': `${t('permission')}: ${label}`, 'aria-haspopup': 'menu', 'aria-expanded': open && !suspended, 'aria-controls': open ? menuId : undefined, 'aria-busy': pending, title: pending ? t('permissionSelecting') : label, onClick: () => {
              onOpen();
              setOpen(!open);
            }, onKeyDown: (event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                onOpen();
                setOpen(true);
              }
            } }, glyph(value), h('span', { className: 'dsh-sidechat-permission-label' }, label), chevron),
            h('div', { ref: menu, id: menuId, popover: 'manual', className: 'dsh-sidechat-permission-menu', role: 'menu', 'aria-label': t('permission'), onKeyDown: keyDown }, options.map((option) => h('button', { key: option.value, type: 'button', className: 'dsh-sidechat-permission-option', role: 'menuitemradio', 'aria-checked': option.value === value, title: option.description, onClick: () => choose(option.value) }, glyph(option.value), h('span', { className: 'dsh-sidechat-permission-option-label' }, labelOf(option), option.value === 'auto' ? h('span', { className: 'dsh-sidechat-permission-badge' }, 'EXP') : null), h('svg', { className: 'dsh-sidechat-model-check', viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, 'aria-hidden': true }, option.value === value ? h('path', { d: 'm3 7 2.5 2.5L11 4' }) : null)))),
            h('dialog', { ref: dialog, className: 'dsh-sidechat-permission-confirm', 'aria-labelledby': titleId, 'aria-describedby': descriptionId, onCancel: (event) => { event.preventDefault(); event.stopPropagation(); closeConfirmation(); }, onKeyDown: (event) => {
              event.stopPropagation();
              if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
                event.preventDefault();
              }
            } },
              h('h2', { id: titleId }, t(auto ? 'permissionAutoTitle' : 'permissionFullTitle')),
              h('p', { id: descriptionId }, t(auto ? 'permissionAutoDescription' : 'permissionFullDescription')),
              h('label', { className: 'dsh-sidechat-permission-acknowledge' }, h('input', { type: 'checkbox', checked: acknowledged, onChange: (event) => setAcknowledged(event.target.checked) }), t('permissionAcknowledge')),
              h('div', { className: 'dsh-sidechat-permission-actions' }, h('button', { type: 'button', autoFocus: true, onClick: closeConfirmation }, t('cancel')), h('button', { type: 'button', className: 'dsh-sidechat-permission-enable', disabled: !acknowledged || locked || confirmation === null, onClick: () => {
                const permission = confirmation;
                setConfirmation(null);
                setAcknowledged(false);
                select(permission);
              } }, t(auto ? 'permissionAutoEnable' : 'permissionFullEnable')))));
        }
        function ModelMenu({ selection, groups, currentModel, locked, pending, suspended, onOpen, onSelect }) {
          const [pane, setPane] = React.useState(null);
          const [query, setQuery] = React.useState('');
          const root = React.useRef(null);
          const trigger = React.useRef(null);
          const menu = React.useRef(null);
          const search = React.useRef(null);
          const composing = React.useRef(false);
          const rootFocus = React.useRef('model');
          const restoreSelectionFocus = React.useRef(false);
          const menuId = React.useId();
          const open = pane !== null && !locked && !suspended;
          const efforts = currentModel?.reasoning?.efforts ?? [];
          const effectiveEffort = selection?.reasoningEffort ?? currentModel?.reasoning?.defaultEffort;
          const effortLabel = efforts.find((effort) => effort.id === effectiveEffort)?.name ?? effectiveEffort ?? t('defaultEffort');
          const modelLabel = currentModel?.name ?? selection?.model ?? t('chooseModel');
          const filteredGroups = groups.map((group) => ({ ...group, models: group.models.filter((model) => `${model.name} ${group.name}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) })).filter((group) => group.models.length > 0);
          const showSearch = groups.reduce((count, group) => count + group.models.length, 0) > 4;
          const chevron = (direction) => h('svg', { className: 'dsh-sidechat-chevron', viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: direction === 'right' ? 'M4 3l3 3-3 3' : direction === 'left' ? 'M8 3 5 6l3 3' : 'M3 4.5l3 3 3-3' }));
          const check = (selected) => h('svg', { className: 'dsh-sidechat-model-check', viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true }, selected ? h('path', { d: 'm3 7 2.5 2.5L11 4' }) : null);
          const close = (restoreFocus = false) => {
            setPane(null);
            setQuery('');
            if (restoreFocus) {
              trigger.current?.focus({ preventScroll: true });
            }
          };
          const drill = (next) => {
            if (next !== 'root') {
              rootFocus.current = next;
            }
            setQuery('');
            setPane(next);
          };
          const choose = (next) => {
            restoreSelectionFocus.current = true;
            close();
            onSelect(next);
          };
          React.useEffect(() => {
            if (!pending && restoreSelectionFocus.current) {
              restoreSelectionFocus.current = false;
              trigger.current?.focus({ preventScroll: true });
            }
          }, [pending, pane]);
          React.useEffect(() => {
            if (locked || suspended) {
              setPane(null);
            }
          }, [locked, suspended]);
          React.useEffect(() => {
            if (!open) {
              return;
            }
            const outside = (event) => {
              if (!root.current?.contains(event.target)) {
                setPane(null);
              }
            };
            document.addEventListener('pointerdown', outside);
            return () => document.removeEventListener('pointerdown', outside);
          }, [open]);
          React.useLayoutEffect(() => {
            if (!open) {
              return;
            }
            if (pane === 'model' && showSearch && !window.matchMedia('(pointer: coarse)').matches) {
              search.current?.focus({ preventScroll: true });
            } else {
              const selected = pane === 'root' ? menu.current?.querySelector(`[data-pane="${rootFocus.current}"]`) : menu.current?.querySelector('[aria-checked="true"]');
              const target = selected ?? menu.current?.querySelector('[role="menuitemradio"]:not(:disabled), [role="menuitem"]:not(:disabled)');
              target?.focus({ preventScroll: true });
              target?.scrollIntoView({ block: 'nearest' });
            }
          }, [pane, open, showSearch]);
          const keyDown = (event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229 || composing.current) {
              return;
            }
            if (event.key === 'Escape' || (event.key === 'ArrowLeft' && pane !== 'root' && event.target !== search.current)) {
              event.preventDefault();
              event.stopPropagation();
              if (pane === 'root') {
                close(true);
              } else {
                drill('root');
              }
              return;
            }
            if (event.key === 'Enter' && event.target === search.current) {
              event.preventDefault();
              menu.current.querySelector('[role="menuitemradio"]:not(:disabled)')?.click();
              return;
            }
            if (event.key === 'ArrowRight' && pane === 'root' && event.target.matches('[data-pane]')) {
              event.preventDefault();
              event.target.click();
              return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || ((event.key === 'Home' || event.key === 'End') && event.target !== search.current)) {
              event.preventDefault();
              const items = Array.from(menu.current.querySelectorAll(event.target === search.current ? '[role="menuitemradio"]:not(:disabled)' : '[role="menuitem"]:not(:disabled), [role="menuitemradio"]:not(:disabled)'));
              const current = items.indexOf(document.activeElement);
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : current < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
              items[next]?.focus({ preventScroll: true });
              items[next]?.scrollIntoView({ block: 'nearest' });
            }
          };
          const effortChoices = [...(currentModel?.reasoning?.defaultEffort === undefined ? [{ id: '', name: t('defaultEffort') }] : []), ...efforts];
          return h('div', { ref: root, className: 'dsh-sidechat-model-seat', onBlur: (event) => {
            if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget)) {
              setPane(null);
            }
          } },
            h('button', { ref: trigger, type: 'button', className: 'dsh-sidechat-model-trigger', disabled: locked, 'aria-label': `${t('model')}: ${modelLabel}${efforts.length > 0 ? ` · ${t('reasoning')}: ${effortLabel}` : ''}`, 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined, title: pending ? t('selecting') : `${modelLabel}${efforts.length > 0 ? ` · ${effortLabel}` : ''}`, onClick: () => {
              if (open) {
                close();
              } else {
                onOpen();
                rootFocus.current = 'model';
                setQuery('');
                setPane(currentModel === undefined ? 'model' : 'root');
              }
            }, onKeyDown: (event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                onOpen();
                setQuery('');
                setPane('root');
              }
            } }, h('span', { className: 'dsh-sidechat-model-label' }, modelLabel), efforts.length > 0 ? h('span', { className: 'dsh-sidechat-model-effort' }, effortLabel) : null, pending ? h('svg', { className: 'dsh-sidechat-chevron dsh-sidechat-spinner', viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'aria-hidden': true }, h('path', { d: 'M8 2a6 6 0 1 1-6 6' })) : chevron('down')),
            open ? h('div', { ref: menu, id: menuId, className: 'dsh-sidechat-model-menu', role: 'menu', 'aria-label': t(pane === 'effort' ? 'reasoning' : 'model'), onKeyDown: keyDown },
              pane === 'root' ? h(React.Fragment, null,
                h('button', { type: 'button', className: 'dsh-sidechat-model-row', role: 'menuitem', 'data-pane': 'model', 'aria-haspopup': 'menu', onClick: () => drill('model') }, h('span', { className: 'dsh-sidechat-model-row-label' }, t('model')), h('span', { className: 'dsh-sidechat-model-row-value' }, modelLabel), chevron('right')),
                efforts.length > 0 ? h('button', { type: 'button', className: 'dsh-sidechat-model-row', role: 'menuitem', 'data-pane': 'effort', 'aria-haspopup': 'menu', onClick: () => drill('effort') }, h('span', { className: 'dsh-sidechat-model-row-label' }, t('reasoning')), h('span', { className: 'dsh-sidechat-model-row-value' }, effortLabel), chevron('right')) : null) : h(React.Fragment, null,
                h('button', { type: 'button', className: 'dsh-sidechat-model-row dsh-sidechat-model-back', role: 'menuitem', 'aria-label': t('back'), onClick: () => drill('root') }, chevron('left'), t(pane === 'model' ? 'model' : 'reasoning')),
                pane === 'model' ? h(React.Fragment, null,
                  showSearch ? h('input', { ref: search, className: 'dsh-sidechat-search', value: query, placeholder: t('modelSearch'), 'aria-label': t('modelSearch'), onChange: (event) => setQuery(event.target.value), onCompositionStart: () => { composing.current = true; }, onCompositionEnd: () => { composing.current = false; } }) : null,
                  filteredGroups.length === 0 ? h('div', { className: 'dsh-sidechat-model-heading', role: 'status' }, t('noModels')) : filteredGroups.map((group) => h('div', { key: group.id, role: 'group', 'aria-label': group.name }, h('div', { className: 'dsh-sidechat-model-heading' }, group.name), group.models.map((model) => {
                    const selected = selection?.provider === group.id && selection?.model === model.id;
                    return h('button', { key: model.id, type: 'button', className: 'dsh-sidechat-model-row', role: 'menuitemradio', 'aria-checked': selected, title: model.description ?? model.name, onClick: () => choose(selected ? selection : { provider: group.id, model: model.id, ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }) }) }, h('span', { className: 'dsh-sidechat-model-name' }, model.name), check(selected));
                  })))) : effortChoices.map((effort) => {
                    const selected = effort.id === (effectiveEffort ?? '');
                    return h('button', { key: effort.id, type: 'button', className: 'dsh-sidechat-model-row', role: 'menuitemradio', 'aria-checked': selected, title: effort.description ?? effort.name, onClick: () => choose({ provider: selection.provider, model: selection.model, ...(effort.id === '' ? {} : { reasoningEffort: effort.id }) }) }, h('span', { className: 'dsh-sidechat-model-name' }, effort.name), check(selected));
                  }))) : null);
        }
        function UnifiedComposer({ parentId, record, state, connecting }) {
          const source = manager.composer(record.id);
          const draft = React.useSyncExternalStore(source.subscribe, source.getSnapshot, source.getSnapshot);
          const editor = React.useRef(null);
          const filePicker = React.useRef(null);
          const menu = React.useRef(null);
          const composition = React.useRef({ active: false, until: 0 });
          const caretAfterEdit = React.useRef(null);
          const dragDepth = React.useRef(0);
          const [dragging, setDragging] = React.useState(false);
          const [cursor, setCursor] = React.useState(draft.text.length);
          const [dismissedSkills, setDismissedSkills] = React.useState(false);
          const [activeSkill, setActiveSkill] = React.useState(0);
          const [activeMenu, setActiveMenu] = React.useState(null);
          const skillListId = React.useId();
          const sending = Boolean(state.busy[`send:${record.id}`]);
          const stopping = Boolean(state.busy[`stop:${record.id}`]);
          const closing = Boolean(state.ending[record.id]) || record.status === 'closing';
          const disabled = closing || record.status === 'starting' || sending || connecting || Boolean(draft.runtime?.removed) || Boolean(draft.runtime?.pendingInteraction);
          const running = draft.runtime?.running ?? record.running;
          const selectionLocked = disabled || draft.selectionBusy || draft.permissionBusy;
          const selection = record.selection ?? draft.catalog?.selection ?? null;
          const groups = draft.catalog?.models.groups ?? [];
          const currentModel = groups.find((group) => group.id === selection?.provider)?.models.find((model) => model.id === selection?.model);
          const token = /^\/([^\s/\uFFFC]*)$/u.exec(draft.text.slice(0, cursor));
          const showSkills = !disabled && !dismissedSkills && token !== null;
          const query = (token?.[1] ?? '').toLocaleLowerCase();
          const skills = (draft.catalog?.skills ?? []).filter((skill) => skill.name.toLocaleLowerCase().includes(query) || skill.description.toLocaleLowerCase().includes(query));
          const index = Math.min(activeSkill, Math.max(0, skills.length - 1));
          const uploadPending = draft.attachments.some((item) => item.status !== 'ready');
          const empty = draft.text.trim() === '' && draft.attachments.length === 0;
          React.useEffect(() => {
            void manager.loadCatalog(parentId, record.id);
          }, [parentId, record.id, Boolean(record.childId)]);
          React.useEffect(() => {
            if (!window.matchMedia('(pointer: coarse)').matches) {
              editor.current.focus({ preventScroll: true });
            }
          }, []);
          React.useLayoutEffect(() => {
            const element = editor.current;
            if (caretAfterEdit.current !== null) {
              element.focus({ preventScroll: true });
              element.setSelectionRange(caretAfterEdit.current, caretAfterEdit.current);
              caretAfterEdit.current = null;
            }
          }, [draft.text]);
          React.useEffect(() => {
            setActiveSkill(0);
          }, [query]);
          React.useEffect(() => {
            menu.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
          }, [index, showSkills]);
          const changeText = (text, nextCursor) => {
            setCursor(nextCursor);
            setDismissedSkills(false);
            manager.updateComposer(record.id, { text, requestId: null, error: null });
          };
          const closeSkills = () => {
            setDismissedSkills(true);
          };
          const chooseSkill = (skill) => {
            const leading = /^\/[^\s/]*/u.exec(draft.text.slice(0, draft.quotes[0]?.offset ?? draft.text.length));
            const end = leading === null ? 0 : leading[0].length + (/^\s*/u.exec(draft.text.slice(leading[0].length))?.[0].length ?? 0);
            const prefix = `/${skill.name} `;
            const next = replaceDraftRange(draft, 0, end, prefix);
            manager.updateComposer(record.id, next);
            caretAfterEdit.current = prefix.length;
            changeText(next.text, prefix.length);
            closeSkills();
          };
          const skillKey = (event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229 || composition.current.active || Date.now() < composition.current.until) {
              return true;
            }
            if (!showSkills || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
              return false;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              closeSkills();
              editor.current.focus({ preventScroll: true });
              return true;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveSkill(skills.length === 0 ? 0 : (index + (event.key === 'ArrowDown' ? 1 : skills.length - 1)) % skills.length);
              return true;
            }
            if (event.key === 'Enter' || (event.key === 'Tab' && skills.length > 0)) {
              event.preventDefault();
              if (skills[index] !== undefined) {
                chooseSkill(skills[index]);
              }
              return true;
            }
            return false;
          };
          const send = () => {
            if (composition.current.active || Date.now() < composition.current.until || disabled || draft.selectionBusy || draft.permissionBusy || empty || uploadPending || draft.runtime?.blocked) {
              return;
            }
            closeSkills();
            void manager.submit(parentId, record, selection).then(() => {
              if (!window.matchMedia('(pointer: coarse)').matches) {
                editor.current?.focus({ preventScroll: true });
              }
            });
          };
          const addFiles = (files) => {
            if (!disabled && files.length > 0) {
              void manager.addFiles(parentId, record.id, files);
            }
          };
          const primaryStops = running && empty && !sending;
          const label = primaryStops ? t('stop') : sending ? nativeText('input.sending') : t(running ? 'queue' : 'send');
          const icon = (name) => {
            const paths = { attach: 'M12 4v16M4 12h16', file: 'M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6', stop: 'M7 7h10v10H7z' };
            return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: name === 'stop' ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] }));
          };
          return h('form', { className: 'dsh-sidechat-unified', 'data-conversation-region': 'composer', 'data-dragging': dragging, onSubmit: (event) => { event.preventDefault(); send(); }, onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeSkills();
            }
          }, onDragEnter: (event) => {
            if (!disabled && Array.from(event.dataTransfer.types).includes('Files')) {
              event.preventDefault();
              dragDepth.current += 1;
              setDragging(true);
            }
          }, onDragOver: (event) => {
            if (Array.from(event.dataTransfer.types).includes('Files')) {
              event.preventDefault();
              event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
            }
          }, onDragLeave: (event) => {
            event.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) {
              setDragging(false);
            }
          }, onDrop: (event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            addFiles(event.dataTransfer.files);
          } },
            h('style', null, uiStyles),
            h('input', { ref: filePicker, type: 'file', multiple: true, hidden: true, onChange: (event) => { addFiles(event.target.files); event.target.value = ''; } }),
            h('div', { className: 'dsh-sidechat-launch-card' },
              showSkills ? h('div', { className: 'dsh-sidechat-skill-menu' },
                h('div', { className: 'dsh-sidechat-skill-heading' }, t('skills')),
                h('div', { id: skillListId, ref: menu, role: 'listbox', 'aria-label': t('skills') },
                  skills.length === 0 ? h('div', { className: 'dsh-sidechat-composer-notice', role: 'status' }, t(draft.catalogLoading ? 'catalogLoading' : 'noSkills')) : skills.map((skill, itemIndex) => {
                    const description = `${skill.invocation.modelInvocable ? '' : `${t('userOnly')} · `}${skill.description}`;
                    return h('button', { key: skill.name, id: `${skillListId}-${itemIndex}`, type: 'button', role: 'option', tabIndex: -1, 'aria-selected': itemIndex === index, className: 'dsh-sidechat-skill-option', title: description, onMouseDown: (event) => event.preventDefault(), onMouseEnter: () => setActiveSkill(itemIndex), onClick: () => chooseSkill(skill) }, h('span', { className: 'dsh-sidechat-skill-name' }, skill.name), h('span', { className: 'dsh-sidechat-skill-description' }, description));
                  }))) : null,
              draft.attachments.length > 0 ? h(PendingAttachments, { attachments: draft.attachments, disabled, onRemove: (localId) => manager.removeAttachment(record.id, localId), onRetry: (localId) => { void manager.upload(parentId, record.id, localId); } }) : null,
              h(QuoteEditor, { draft, manager, recordId: record.id, editorRef: editor, disabled, placeholder: t('question'), onTextChange: changeText, onCursorChange: setCursor, t, 'aria-expanded': showSkills, 'aria-controls': showSkills ? skillListId : undefined, 'aria-activedescendant': showSkills && skills.length > 0 ? `${skillListId}-${index}` : undefined, onPaste: (event) => {
                if (event.clipboardData.files.length > 0) {
                  event.preventDefault();
                  addFiles(event.clipboardData.files);
                }
              }, onCompositionStart: () => { composition.current.active = true; }, onCompositionEnd: () => { composition.current.active = false; composition.current.until = Date.now() + 10; }, onKeyDown: (event) => {
                if (event.nativeEvent.isComposing || event.keyCode === 229 || composition.current.active || Date.now() < composition.current.until) {
                  return;
                }
                if (skillKey(event)) {
                  return;
                }
                if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.getModifierState('AltGraph') && !(event.ctrlKey && event.metaKey)) {
                  event.preventDefault();
                  if (!event.repeat) {
                    send();
                  }
                }
              } }),
              h('div', { className: 'dsh-sidechat-toolbar' },
                h('button', { type: 'button', className: 'dsh-sidechat-control', disabled, title: t('attach'), 'aria-label': t('attach'), onClick: () => filePicker.current.click() }, icon('attach')),
                h(PermissionMenu, { value: record.permission, options: draft.catalog?.permissions.options ?? [], started: record.childId !== null, locked: selectionLocked, pending: draft.permissionBusy, suspended: showSkills || activeMenu === 'model', onOpen: () => { closeSkills(); setActiveMenu('permission'); }, onSelect: (permission) => { void manager.selectPermission(parentId, record.id, permission); } }),
                h(ModelMenu, { selection, groups, currentModel, locked: selectionLocked || draft.catalog === null || groups.length === 0, pending: draft.selectionBusy, suspended: showSkills || activeMenu === 'permission', onOpen: () => { closeSkills(); setActiveMenu('model'); }, onSelect: (next) => {
                  manager.updateComposer(record.id, { requestId: null });
                  void manager.selectModel(parentId, record.id, next);
                } }),
                h('div', { className: 'dsh-sidechat-send-row' },
                  h('button', { type: primaryStops ? 'button' : 'submit', className: primaryStops ? 'dsh-sidechat-control dsh-sidechat-stop' : 'dsh-sidechat-send', disabled: primaryStops ? closing || stopping : disabled || draft.selectionBusy || draft.permissionBusy || empty || uploadPending || Boolean(draft.runtime?.blocked), 'aria-label': label, 'aria-busy': sending || stopping, title: label, onMouseDown: (event) => event.preventDefault(), onClick: primaryStops ? () => { void manager.act(parentId, { action: 'stop', id: record.id }).catch(() => {}); } : undefined },
                    primaryStops ? icon('stop') : sending ? h('svg', { className: 'dsh-sidechat-spinner', width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true }, h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeOpacity: .35, strokeWidth: 2 }), h('path', { d: 'M8 2a6 6 0 0 1 6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })) : h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true }, h('path', { d: 'M8 15V2M2 8l6-6 6 6' }))))),
              dragging ? h('div', { className: 'dsh-sidechat-drop-target' }, t('dropFiles')) : null),
            draft.error ? h('div', { className: 'dsh-sidechat-composer-notice dsh-sidechat-composer-error', role: 'alert' }, draft.error) : null,
            draft.runtime?.pendingInteraction ? h('div', { className: 'dsh-sidechat-composer-notice', role: 'status' }, t('waitingInteraction')) : null,
            draft.runtime?.blocked ? h('div', { className: 'dsh-sidechat-composer-notice', role: 'status' }, draft.runtime.blocked) : null,
            draft.catalogLoading || draft.selectionBusy || draft.permissionBusy ? h('div', { className: 'dsh-sidechat-composer-notice', role: 'status' }, t(draft.permissionBusy ? 'permissionSelecting' : draft.selectionBusy ? 'selecting' : 'catalogLoading')) : null,
            draft.catalogError || (draft.catalog !== null && currentModel === undefined) || (draft.catalog?.models.failures.length ?? 0) > 0 ? h('div', { className: 'dsh-sidechat-composer-notice' },
              h('span', { role: draft.catalogError ? 'alert' : 'status' }, draft.catalogError ?? (currentModel === undefined ? t('modelUnavailable') : draft.catalog.models.failures.map((failure) => `${failure.name}: ${failure.message}`).join(' · '))),
              h('button', { type: 'button', className: 'dsh-sidechat-control', disabled: draft.catalogLoading || disabled, onClick: () => { void manager.loadCatalog(parentId, record.id); } }, t('catalogRetry'))) : null);
        }
        function Tab(props) {
          const { tab } = props.useTabInfo();
          const state = useParent(manager, props.sessionId);
          const target = parseAddress(tab.contentId);
          const resource = props.useResource(tab.contentId);
          const value = resource.value;
          const onRuntime = React.useCallback((runtime) => {
            if (target === null || !manager.composers.has(target.id)) {
              return;
            }
            const previous = manager.composer(target.id).snapshot.runtime;
            if (previous === null || Object.keys(runtime).some((key) => previous[key] !== runtime[key])) {
              manager.updateComposer(target.id, { runtime });
            }
          }, [target?.id]);
          React.useEffect(() => tab.actions.bindCommands({ refresh: () => { void manager.refresh(props.sessionId); } }), [tab.actions, props.sessionId]);
          React.useEffect(() => {
            if (target !== null && (value?.phase === 'expired' || value?.phase === 'ended')) {
              manager.retired.add(tab.contentId); tab.actions.close();
            }
          }, [value?.phase, tab.actions, tab.contentId]);
          if (target === null) {
            return h('div', { style: { ...styles.root, justifyContent: 'center', alignItems: 'center', padding: 24, boxSizing: 'border-box' } }, h(Guide, props));
          }
          const record = state.records.find((item) => item.id === target.id) ?? value?.record;
          const error = resource.failure?.message ?? state.errors[target.id] ?? record?.error ?? value?.error ?? state.error;
          const closing = state.ending[target.id] || record?.status === 'closing';
          const retryable = resource.status === 'failed' || value?.phase === 'error' || state.readError;
          const canCompose = record !== undefined && record !== null && state.bootId === target.bootId && state.records.some((item) => item.id === target.id);
          const connecting = record?.childId !== null && (value?.phase !== 'ready' || value?.reference == null);
          let content;
          if (resource.status === 'failed') {
            content = h('p', { role: 'alert', style: { ...styles.message, ...styles.error } }, error ?? t('unavailable'));
          } else if (value?.phase === 'ready') {
            content = value.reference === null ? null : h(props.SessionProvider, { session: value.reference }, props.renderSlot(PANEL, { record, onRuntime, historySource: value.reference.binding.eventSource }));
          } else {
            content = h('p', { style: styles.message }, t(value?.phase ?? 'loading'));
          }
          return h('section', { style: styles.root },
            closing || error || retryable ? h('header', { style: styles.header },
              closing ? h('div', { role: 'status' }, t('closing')) : null,
              error ? h('div', { role: 'alert', style: styles.error }, error, closing ? ` ${t('closeFailed')}` : '') : null,
              retryable ? h('button', { type: 'button', style: { ...styles.button, marginTop: 6 }, disabled: state.loading, onClick: () => { void manager.refresh(props.sessionId); } }, t('retry')) : null) : null,
            h('div', { style: styles.body }, content),
            canCompose ? h(UnifiedComposer, { key: record.id, parentId: props.sessionId, record, state, connecting }) : null,
            h('footer', { style: styles.footer }, h('span', null, t('hint')), h('span', null, `${t('count')} ${state.records.length + Number(state.creating)}/${state.limit}`)));
        }
        ctx.effect(() => ctx.resources.register(resourceProvider(ctx, manager)));
        ctx.effect(() => ctx.sidebarRightTabs.register({ id: PACKAGE, kind: KIND, multiple: true, keepMounted: true, patterns: [`${PREFIX}**`], priority: 'extension', canOpen: (address) => parseAddress(address) !== null, title: (address) => {
          const target = parseAddress(address);
          return target === null ? t('create') : manager.parent(target.parentId).snapshot.records.find((record) => record.id === target.id)?.title ?? t('prefix');
        }, guide: [{ id: 'create', order: 40, title: () => t('create'), icon: ChatIcon }] }));
        ctx.slots.inject('sidebar.right.tab.guide.entry', () => ctx.slots.register({ name: 'sidebar.right.tab.guide.entry', key: PACKAGE, locale: NS }, Guide));
        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: PACKAGE, locale: NS }, Title));
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: PACKAGE, locale: NS, children: { [PANEL]: { kind: 'single', scope: 'session' } } }, Tab));
        ctx.slots.inject(PANEL, () => ctx.slots.register({ name: PANEL, children: {
          [nativeSlot(originalRoot)]: { kind: 'single', scope: 'session' },
          [nativeSlot('conversation.composer')]: { kind: 'chain', scope: 'session' },
        }, inject: (sessionId) => ({ hooks: { composerBlock: ctx.conversation.blocks.storeFor(sessionId) } }) }, NativeConversation));
        ctx.slots.inject(catalogSlot(catalogFooterSlot), () => mirrorNativeSession(ctx, [catalogFooterSlot], catalogSlot));
        ctx.slots.inject(catalogActionsSlot, () => registerCatalogFilter(ctx, manager, catalogActionsSlot, 'subagent-catalog'));
        ctx.slots.inject(catalogLineageSlot, () => registerCatalogFilter(ctx, manager, catalogLineageSlot));
        ctx.slots.inject(originalRoot, () => mirrorNativeSession(ctx));
        ctx.effect(() => ctx.sidebarRight.registerCloseHandler(KIND, (parentId, tab) => {
          const target = parseAddress(tab.contentId);
          if (target === null || target.parentId !== parentId) {
            return;
          }
          const actions = ctx.sidebarRight.tabDomain.occurrence(parentId, tab).tabActions;
          manager.close(target, tab.contentId, () => { actions.openResource(tab.contentId, { destination: 'sidebar' }); });
        }));
        ctx.effect(() => {
          let watched;
          let unwatch = () => {};
          const refresh = () => {
            const parentId = ctx.sidebarRight.mounted.getSnapshot();
            if (parentId !== watched) {
              unwatch();
              watched = parentId;
              unwatch = parentId === undefined ? () => {} : manager.watchParent(parentId);
            }
            if (parentId !== undefined) {
              void manager.refresh(parentId);
            }
          };
          const unsubscribe = ctx.sidebarRight.mounted.subscribe(refresh);
          window.addEventListener('focus', refresh);
          refresh();
          return () => { unsubscribe(); unwatch(); window.removeEventListener('focus', refresh); };
        });
      },
    };
  },
});
