import { randomUUID } from 'node:crypto';
import { LIMIT, PROVIDER, boundaryText, captureBackground, userMessage } from './background.js';
import { continuationContent, currentSelection, prepareContent, storeUpload, validateSelection } from './input.js';

export class SidechatController {
  constructor(ctx) {
    this.ctx = ctx;
    this.bootId = randomUUID();
    this.records = new Map();
    this.closed = new Set();
    this.agentDisposers = new Map();
  }

  list(parentId) {
    return { bootId: this.bootId, limit: LIMIT, records: [...this.records.values()].filter((record) => record.parentId === parentId).map((record) => this.describe(record)) };
  }

  describe(record) {
    const child = this.ctx.agents.get(record.id);
    return {
      id: record.id,
      parentId: record.parentId,
      childId: record.started ? record.id : null,
      title: record.title,
      status: record.status,
      cutoffSeq: record.cutoffSeq,
      cutoffTime: record.cutoffTime,
      createdAt: record.createdAt,
      running: child?.status === 'running',
      model: currentSelection(record, child)?.model ?? null,
      selection: currentSelection(record, child),
      permission: child === undefined ? record.permission : this.ctx.permissionPresets.current(child.session),
      error: record.error ?? null,
    };
  }

  requireRecord(parent, id) {
    const record = this.records.get(id);
    if (record === undefined || record.parentId !== parent.id || record.status === 'closing') {
      throw new Error('侧边聊天已结束或不属于当前主会话。');
    }
    return record;
  }

  permissionSnapshot(seed) {
    const catalog = this.ctx.permissionPresets.catalog();
    const defaults = this.ctx.permissionPresets.resolve(catalog.defaultPreset);
    let preset = catalog.defaultPreset;
    let sandbox = defaults.sandbox;
    let approval = defaults.approval;
    for (const event of seed) {
      if (event.type === 'permission/preset') {
        preset = event.data.preset;
      } else if (event.type === 'sandbox/mode') {
        sandbox = event.data.mode;
      } else if (event.type === 'approval/policy') {
        approval = event.data.policy;
      }
    }
    const matches = (name) => {
      const spec = this.ctx.permissionPresets.resolve(name);
      return spec.sandbox === sandbox && spec.approval === approval;
    };
    const selected = catalog.options.find((option) => option.value === preset);
    const selectedMatches = selected !== undefined && (matches(preset) || (preset === 'auto' && approval === 'never' && this.ctx.permissionPresets.resolve(preset).sandbox === sandbox));
    const permission = selectedMatches ? preset : catalog.options.find((option) => matches(option.value))?.value ?? 'custom';
    return { permission, preset, sandbox };
  }

  create(parent) {
    const count = this.list(parent.id).records.length;
    if (count >= LIMIT) {
      throw new Error('当前主会话最多打开 3 个侧聊，请先关闭不用的侧聊。');
    }
    const number = count + 1;
    const background = captureBackground(parent);
    // 没有已完成轮次时仍继承主会话当前权限，不把未完成对话加入背景。
    const permissionSnapshot = this.permissionSnapshot(background.cutoffSeq === -1 ? parent.session.snapshotEvents() : background.seed);
    const selection = parent.model.current();
    const agentOptions = { ...parent.options, ...selection };
    if (selection !== undefined && selection.reasoningEffort === undefined) {
      delete agentOptions.reasoningEffort;
    }
    const record = {
      ...background,
      id: `sidechat-${randomUUID()}`,
      parentId: parent.id,
      title: `侧边聊天 ${number}`,
      createdAt: Date.now(),
      status: 'ready',
      started: false,
      agentOptions,
      selection: selection === undefined ? undefined : { ...selection },
      permission: permissionSnapshot.permission,
      permissionSnapshot,
      permissionExplicit: false,
      uploads: new Map(),
      requests: new Map(),
      submitting: null,
      selecting: false,
      cwd: parent.session.header.cwd,
      controller: new AbortController(),
      activation: null,
      starting: null,
      closing: null,
    };
    this.records.set(record.id, record);
    return { ...this.list(parent.id), record: this.describe(record) };
  }

  requireChild(record) {
    const child = this.ctx.agents.get(record.id);
    if (record.started && child === undefined) {
      throw new Error('侧聊运行实例已释放，请结束此标签并新建侧聊。');
    }
    return child;
  }

  async catalog(parent, input, signal) {
    const record = this.requireRecord(parent, input.id);
    const child = this.requireChild(record);
    const [models, skills] = await Promise.all([
      this.ctx.sessionController.modelCatalog(),
      this.ctx.skills.list({ scope: child ?? parent, cwd: child?.session.header.cwd ?? record.cwd, signal }),
    ]);
    return { ...this.list(parent.id), record: this.describe(record), catalog: { models, permissions: this.ctx.permissionPresets.catalog(), skills: skills.filter((skill) => skill.invocation.userInvocable), selection: currentSelection(record, child) ?? models.default } };
  }

  async upload(parent, input, signal) {
    const record = this.requireRecord(parent, input.id);
    const lifetime = signal === undefined ? record.controller.signal : AbortSignal.any([record.controller.signal, signal]);
    const attachment = await storeUpload(this.ctx, record, input, lifetime);
    return { ...this.list(parent.id), record: this.describe(record), attachment };
  }

  async applySelection(record, selection, signal) {
    const selected = await validateSelection(this.ctx, selection, signal);
    signal?.throwIfAborted();
    const child = this.requireChild(record);
    if (record.status === 'closing') {
      throw new Error('侧边聊天已结束。');
    }
    record.selection = selected;
    record.agentOptions = { ...record.agentOptions, provider: selected.provider, model: selected.model };
    delete record.agentOptions.reasoningEffort;
    if (selected.reasoningEffort !== undefined) {
      record.agentOptions.reasoningEffort = selected.reasoningEffort;
    }
    if (child !== undefined) {
      child.model.select(selected);
    }
  }

  async selectModel(parent, input, signal) {
    const record = this.requireRecord(parent, input.id);
    if (record.submitting !== null || record.selecting) {
      throw new Error('侧聊正在提交消息或切换模型，请稍候。');
    }
    record.selecting = true;
    try {
      await this.applySelection(record, input.selection, signal);
      return { ...this.list(parent.id), record: this.describe(record) };
    } finally {
      record.selecting = false;
    }
  }

  selectPermission(parent, input, signal) {
    const record = this.requireRecord(parent, input.id);
    if (record.submitting !== null || record.selecting) {
      throw new Error('侧聊正在提交消息或切换设置，请稍候。');
    }
    record.selecting = true;
    try {
      this.ctx.permissionPresets.resolve(input.permission);
      signal?.throwIfAborted();
      const child = this.requireChild(record);
      if (child !== undefined) {
        this.ctx.permissionPresets.set(child.session, input.permission);
      }
      record.permission = input.permission;
      record.permissionExplicit = true;
      return { ...this.list(parent.id), record: this.describe(record) };
    } finally {
      record.selecting = false;
    }
  }

  send(parent, input, signal) {
    const record = this.requireRecord(parent, input.id);
    const selection = input.selection;
    const fingerprint = JSON.stringify([input.text ?? '', input.attachments ?? [], selection === undefined ? null : [selection.provider, selection.model, selection.reasoningEffort ?? null], input.delivery ?? 'queue', input.clientTimeZone ?? null]);
    const previous = input.requestId === undefined ? undefined : record.requests.get(input.requestId);
    if (previous !== undefined) {
      if (previous.fingerprint !== fingerprint) {
        throw new Error('同一请求标识不能用于不同的侧聊消息。');
      }
      return previous.promise.then(() => ({ ...this.list(parent.id), record: this.describe(record) }));
    }
    if (!(input.text ?? '').trim() && (input.attachments ?? []).length === 0) {
      throw new Error('请先输入侧聊问题或添加附件。');
    }
    if (record.submitting !== null || record.selecting) {
      throw new Error('侧聊正在提交消息或切换模型，请稍候。');
    }
    const lifetime = signal === undefined ? record.controller.signal : AbortSignal.any([record.controller.signal, signal]);
    record.submitting = this.sendInput(parent, record, input, lifetime).finally(() => { record.submitting = null; });
    if (input.requestId !== undefined) {
      const pending = { fingerprint, promise: record.submitting };
      record.requests.set(input.requestId, pending);
      void pending.promise.catch(() => { record.requests.delete(input.requestId); });
    }
    return record.submitting;
  }

  async sendInput(parent, record, input, signal) {
    record.error = null;
    try {
      if (input.selection !== undefined) {
        await this.applySelection(record, input.selection, signal);
      }
      const { content, images } = await prepareContent(this.ctx, record, input, signal);
      if (record.started) {
        this.requireChild(record);
        // 用户续聊交给托管接口，保留 source.kind=user、树内授权与图片接纳语义。
        const parts = await continuationContent(this.ctx, content, signal);
        signal.throwIfAborted();
        await this.ctx.subagents.prompt({ childSessionId: record.id, requestId: input.requestId ?? randomUUID(), delivery: input.delivery ?? 'queue', content: parts, ...(input.clientTimeZone === undefined ? {} : { clientTimeZone: input.clientTimeZone }) }, signal);
      } else {
        const selection = record.selection ?? (await this.ctx.sessionController.modelCatalog()).default;
        if (record.selection === undefined) {
          await this.applySelection(record, selection, signal);
        }
        if (images.length > 0) {
          const info = await this.ctx.llm.resolveModelInfo(selection.provider, selection.model, signal);
          if (info.inputModalities !== undefined && !info.inputModalities.includes('image')) {
            throw new Error('所选模型不支持图片，请切换支持图片的模型。');
          }
        }
        signal.throwIfAborted();
        record.status = 'starting';
        record.starting = this.ctx.subagents.startActivation({ provider: PROVIDER, childId: record.id, label: record.title, parent, cwd: record.cwd, agentOptions: record.agentOptions, maxDepth: this.ctx.subagents.resolveMaxDepth(), signal: record.controller.signal, delivery: 'caller', prompt: content });
        const activation = await record.starting;
        record.activation = activation;
        record.started = true;
        if (record.status === 'closing') {
          throw new Error('侧边聊天已结束。');
        }
        record.status = 'open';
        void activation.result.then(() => {
          if (record.status !== 'closing' && this.records.has(record.id)) {
            record.error = '侧聊运行实例已释放，请结束此标签并新建侧聊。';
          }
        }, (error) => { record.error = error.message; });
      }
      for (const id of input.attachments ?? []) {
        record.uploads.delete(id);
      }
      return { ...this.list(parent.id), record: this.describe(record) };
    } catch (error) {
      if (record.status !== 'closing') {
        record.status = record.started ? 'open' : 'ready';
        record.error = error.message;
      }
      throw error;
    } finally {
      record.starting = null;
    }
  }

  attachAgent(agent) {
    if (this.closed.has(agent.id)) {
      throw new Error('该侧边聊天已经结束，不能重新启动。');
    }
    const record = this.records.get(agent.id);
    if (record === undefined) {
      return;
    }
    // 清除 seed 重放出的主会话待办，随后只接收侧聊的新输入。
    agent.inbox.clear();
    if (record.permissionExplicit) {
      this.ctx.permissionPresets.set(agent.session, record.permission);
    } else {
      // 宿主启动会覆盖 seed 的权限；恢复打开时的范围，同时保留托管子代理的 never 审批策略。
      agent.session.append('sandbox/mode', { mode: record.permissionSnapshot.sandbox, source: 'delegation' });
      agent.session.append('permission/preset', { preset: record.permissionSnapshot.preset });
    }
    const { provider, model, reasoningEffort } = record.agentOptions;
    if (provider !== undefined && model !== undefined) {
      agent.model.select({ provider, model, ...(reasoningEffort === undefined ? {} : { reasoningEffort }) });
    }
    const disposers = [];
    disposers.push(agent.ctx.systemPrompt.section({ name: 'sidechat:boundary', order: 10000, text: boundaryText(record.parentId) }));
    disposers.push(agent.ctx.on('agent/status', ({ status }) => {
      if (status !== 'idle' || record.status === 'closing' || this.closed.has(record.id)) {
        return;
      }
      // 在驱动真正进入 idle 后放入不唤醒的上下文，保留 caller 投递的 Activation。
      // 不能在 turn/end 放入，否则驱动会把它作为新轮次自动执行。
      agent.inject(userMessage('Wait for the next explicit user question in this side conversation.', { kind: 'sidechat-lease', form: 'context', summary: '等待下一条侧聊问题' }));
    }));
    const previous = this.agentDisposers.get(agent.id);
    if (previous !== undefined) {
      previous();
    }
    const dispose = () => {
      for (const disposer of disposers.reverse()) {
        disposer();
      }
    };
    this.agentDisposers.set(agent.id, dispose);
  }

  async endRecord(record) {
    if (record.closing !== null) {
      return record.closing;
    }
    record.status = 'closing';
    this.closed.add(record.id);
    record.controller.abort();
    record.closing = (async () => {
      if (record.submitting !== null) {
        await record.submitting.catch(() => undefined);
      }
      if (record.starting !== null) {
        await record.starting.catch(() => undefined);
      }
      const child = this.ctx.agents.get(record.id);
      if (child !== undefined) {
        child.cancel({ kind: 'user' });
        child.inbox.clear();
      }
      if (record.activation !== null) {
        await record.activation.dispose();
      }
      this.agentDisposers.get(record.id)?.();
      this.agentDisposers.delete(record.id);
      record.uploads.clear();
      record.requests.clear();
      this.records.delete(record.id);
    })();
    try {
      await record.closing;
    } catch (error) {
      record.closing = null;
      record.error = `结束失败：${error.message}`;
      throw error;
    }
  }

  async end(parent, id) {
    const record = this.records.get(id);
    if (record === undefined) {
      return this.list(parent.id);
    }
    if (record.parentId !== parent.id) {
      throw new Error('侧边聊天不属于当前主会话。');
    }
    await this.endRecord(record);
    return this.list(parent.id);
  }

  stop(parent, id) {
    const record = this.requireRecord(parent, id);
    if (record.status === 'starting') {
      // 启动完成后才能中断；等待实际处理，避免提前返回停止成功。
      return record.starting.then(() => {
        if (record.status !== 'closing') {
          this.ctx.subagents.interrupt(record.id, { kind: 'user' });
        }
        return this.list(parent.id);
      });
    }
    if (record.started) {
      this.ctx.subagents.interrupt(record.id, { kind: 'user' });
    }
    return this.list(parent.id);
  }

  async execute(parent, input, signal) {
    signal?.throwIfAborted();
    switch (input.action) {
      case 'list': {
        return this.list(parent.id);
      }
      case 'create': {
        return this.create(parent);
      }
      case 'send': {
        return this.send(parent, input, signal);
      }
      case 'catalog': {
        return this.catalog(parent, input, signal);
      }
      case 'upload': {
        return this.upload(parent, input, signal);
      }
      case 'selectModel': {
        return this.selectModel(parent, input, signal);
      }
      case 'selectPermission': {
        return this.selectPermission(parent, input, signal);
      }
      case 'end': {
        return this.end(parent, input.id);
      }
      case 'stop': {
        return this.stop(parent, input.id);
      }
      default: {
        throw new Error('未知侧聊操作。');
      }
    }
  }

  async dispose() {
    await Promise.all([...this.records.values()].map((record) => this.endRecord(record)));
  }
}
