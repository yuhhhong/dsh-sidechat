import test from 'node:test';
import assert from 'node:assert/strict';
import { captureBackground } from '../src/host/background.js';
import { SidechatController } from '../src/host/controller.js';

const permissionSpecs = {
  'read-only': { sandbox: 'read-only', approval: 'ask' },
  'workspace-write': { sandbox: 'workspace-write', approval: 'ask' },
  'danger-full-access': { sandbox: 'danger-full-access', approval: 'never' },
  auto: { sandbox: 'danger-full-access', approval: 'ask' },
};
const permissions = { options: Object.keys(permissionSpecs).map((value) => ({ value, name: value })), defaultOptions: Object.keys(permissionSpecs).filter((value) => value !== 'auto').map((value) => ({ value, name: value })), defaultPreset: 'workspace-write' };

function permissionKnobs(session) {
  const state = { preset: 'workspace-write', sandbox: 'workspace-write', approval: 'ask' };
  for (const event of session.snapshotEvents()) {
    if (event.type === 'permission/preset') {
      state.preset = event.data.preset;
    } else if (event.type === 'sandbox/mode') {
      state.sandbox = event.data.mode;
    } else if (event.type === 'approval/policy') {
      state.approval = event.data.policy;
    }
  }
  return state;
}

function parentFixture() {
  const events = [
    { seq: 0, time: 100, type: 'turn/start', data: { turn: 1 } },
    { seq: 1, time: 101, type: 'user/message', data: { content: [{ type: 'text', text: '已完成的问题' }] } },
    { seq: 2, time: 102, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
    { seq: 3, time: 103, type: 'turn/start', data: { turn: 2 } },
  ];
  return {
    id: 'parent',
    options: { provider: 'fixture', model: 'old' },
    model: { current: () => ({ provider: 'fixture', model: 'current' }) },
    ctx: { get: () => undefined },
    session: { header: { cwd: '/project' }, snapshotEvents: () => events },
    events,
  };
}

function harness() {
  const agents = new Map();
  const starts = [];
  const prompts = [];
  const uploads = new Map();
  const skillLookups = [];
  const validations = [];
  const permissionChanges = [];
  let disposed = 0;
  const models = { default: { provider: 'fixture', model: 'current' }, routableProviders: ['fixture'], groups: [{ id: 'fixture', name: '测试提供方', models: [{ id: 'current', name: '当前模型', reasoning: { efforts: [{ id: 'low', name: '低' }, { id: 'high', name: '高' }], defaultEffort: 'low' } }, { id: 'next', name: '另一模型' }] }], failures: [] };
  const ctx = {
    agents: { get: (id) => agents.get(id) },
    sessionController: { async modelCatalog() { return models; } },
    sandboxPolicy: { overrideOf: (session) => permissionKnobs(session).sandbox },
    approval: { overrideOf: (session) => permissionKnobs(session).approval },
    permissionPresets: {
      catalog: () => permissions,
      resolve(name) {
        if (!Object.hasOwn(permissionSpecs, name)) {
          throw new Error('权限预设不可用');
        }
        return permissionSpecs[name];
      },
      current(session) {
        const state = permissionKnobs(session);
        const matches = (name) => permissionSpecs[name]?.sandbox === state.sandbox && permissionSpecs[name]?.approval === state.approval;
        if (matches(state.preset) || (state.preset === 'auto' && state.sandbox === 'danger-full-access' && state.approval === 'never')) {
          return state.preset;
        }
        return permissions.options.find((option) => matches(option.value))?.value ?? 'custom';
      },
      set(session, permission) {
        const spec = this.resolve(permission);
        permissionChanges.push({ session, permission });
        const state = permissionKnobs(session);
        session.append('permission/preset', { preset: permission });
        if (state.sandbox !== spec.sandbox) {
          session.append('sandbox/mode', { mode: spec.sandbox });
        }
        if (state.approval !== spec.approval) {
          session.append('approval/policy', { policy: spec.approval });
        }
      },
    },
    llm: {
      listProviders: () => [{ id: 'fixture', name: '测试提供方' }],
      async listModels() { return models.groups[0].models; },
      async resolveCallConfig(selection) {
        validations.push(selection);
        if (selection.reasoningEffort !== undefined && !['low', 'high'].includes(selection.reasoningEffort)) {
          throw new Error('思考强度不可用');
        }
        return selection;
      },
      async resolveModelInfo(provider, model) { return { provider, id: model, inputModalities: model === 'current' ? ['text', 'image'] : ['text'] }; },
      fileRequestText: (ref) => `文件 ${ref.name}：/attachments/${ref.attachmentId}/${ref.name}（${ref.bytes} 字节）`,
    },
    skills: {
      async list(options) {
        skillLookups.push(options);
        return [{ name: 'review', description: '检查代码', invocation: { userInvocable: true, modelInvocable: true } }, { name: 'internal', description: '内部技能', invocation: { userInvocable: false, modelInvocable: true } }];
      },
    },
    attachments: {
      async admitEncodedFile(input) {
        const ref = { attachmentId: `file-${uploads.size}`, name: input.name, bytes: Buffer.byteLength(input.data, 'base64') };
        uploads.set(ref.attachmentId, { ref, data: Buffer.from(input.data, 'base64') });
        return ref;
      },
      async admitPromptContent(content) {
        return content.map((part) => {
          if (part.attachment !== undefined) {
            return { type: part.type, attachment: part.attachment };
          }
          const ref = { attachmentId: `image-${uploads.size}`, name: part.name, bytes: Buffer.byteLength(part.data, 'base64'), mediaType: part.mediaType, width: 1, height: 1 };
          uploads.set(ref.attachmentId, { ref, data: Buffer.from(part.data, 'base64') });
          return { type: 'image', attachment: ref };
        });
      },
      async readImage(ref) { return uploads.get(ref.attachmentId); },
    },
    subagents: {
      resolveMaxDepth: () => 1,
      interrupt() {},
      async prompt(request) { prompts.push(request); return { messageId: `message-${prompts.length}` }; },
      async startActivation(spec) {
        starts.push(spec);
        const listeners = new Map();
        let cleared = 0;
        const parentPermission = permissionKnobs(spec.parent.session);
        const childEvents = [{ type: 'sandbox/mode', data: { mode: parentPermission.sandbox, source: 'delegation' } }, { type: 'approval/policy', data: { policy: 'never', source: 'delegation' } }, { type: 'permission/preset', data: { preset: parentPermission.preset } }];
        let selected = { provider: spec.agentOptions.provider, model: spec.agentOptions.model, ...(spec.agentOptions.reasoningEffort === undefined ? {} : { reasoningEffort: spec.agentOptions.reasoningEffort }) };
        const child = {
          id: spec.childId,
          status: 'running',
          model: { current: () => selected, select(selection) { selected = { ...selection }; } },
          session: { header: { cwd: spec.cwd }, snapshotEvents: () => childEvents, append(type, data) { childEvents.push({ type, data }); } },
          inbox: { clear() { cleared += 1; } },
          inject(message) { child.lease = message; },
          cancel() { child.status = 'idle'; child.inbox.clear(); },
          ctx: {
            systemPrompt: { section: () => () => {} },
            on(name, handler) { listeners.set(name, handler); return () => listeners.delete(name); },
          },
          listeners,
          cleared: () => cleared,
        };
        agents.set(child.id, child);
        state.controller.attachAgent(child);
        return {
          childId: child.id,
          result: new Promise(() => {}),
          async dispose() { disposed += 1; agents.delete(child.id); },
        };
      },
    },
  };
  const state = { ctx, agents, starts, prompts, uploads, skillLookups, validations, models, permissions, permissionChanges, disposed: () => disposed, controller: new SidechatController(ctx) };
  return state;
}

test('背景在打开时固定，忽略正在运行的轮次，边界不会成为任务', () => {
  const parent = parentFixture();
  const background = captureBackground(parent);
  assert.equal(background.cutoffSeq, 2);
  assert.equal(background.seed.length, 4);
  assert.match(background.seed.at(-1).data.content[0].text, /reference context only/);
  parent.events[1].data.content[0].text = '随后修改';
  assert.equal(background.seed[1].data.content[0].text, '已完成的问题');
  assert.equal(background.seed.some((event) => event.data.turn === 2), false);
});

test('空白侧聊不启动模型，第四条创建被拒绝，关闭第二条后新建允许重名', async () => {
  const state = harness();
  const parent = parentFixture();
  const first = state.controller.create(parent).record;
  const second = state.controller.create(parent).record;
  const third = state.controller.create(parent).record;
  assert.deepEqual([first.title, second.title, third.title], ['侧边聊天 1', '侧边聊天 2', '侧边聊天 3']);
  assert.equal(state.starts.length, 0);
  assert.throws(() => state.controller.create(parent), /最多打开 3 个/);
  await state.controller.end(parent, second.id);
  const response = state.controller.create(parent);
  assert.equal(response.record.title, '侧边聊天 3');
  assert.deepEqual(response.records.map((record) => record.title), ['侧边聊天 1', '侧边聊天 3', '侧边聊天 3']);
});

test('新建编号只统计同一主会话，全部关闭后从一开始', async () => {
  const state = harness();
  const parent = parentFixture();
  const other = { ...parentFixture(), id: 'other' };
  const first = state.controller.create(parent).record;
  assert.equal(state.controller.create(other).record.title, '侧边聊天 1');
  assert.equal(state.controller.create(parent).record.title, '侧边聊天 2');
  assert.equal(state.controller.create(other).record.title, '侧边聊天 2');
  await state.controller.end(parent, first.id);
  await state.controller.end(parent, state.controller.list(parent.id).records[0].id);
  assert.equal(state.controller.create(parent).record.title, '侧边聊天 1');
});

test('首问采用 caller 投递和打开时的模型，空闲保留非唤醒租约', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  parent.model.current = () => ({ provider: 'fixture', model: 'later' });
  const response = await state.controller.send(parent, { id: record.id, text: '检查活动时间在哪里配置' });
  assert.equal(state.starts[0].delivery, 'caller');
  assert.equal(state.starts[0].agentOptions.model, 'current');
  assert.equal(response.record.title, '侧边聊天 1');
  const child = state.agents.get(record.id);
  assert.equal(child.cleared(), 1);
  assert.equal(child.lease, undefined);
  child.listeners.get('agent/status')({ status: 'idle' });
  assert.equal(child.lease.source.kind, 'sidechat-lease');
  await state.controller.end(parent, record.id);
  assert.equal(state.disposed(), 1);
  assert.equal(state.controller.list(parent.id).records.length, 0);
  assert.throws(() => state.controller.attachAgent(child), /已经结束/);
});

test('首问继承主会话预设，不显式请求独立预设', async () => {
  const state = harness();
  const parent = parentFixture();
  parent.ctx.get = (name) => name === 'agentPresets' ? { composedPreset: () => 'parent-preset' } : undefined;
  const record = state.controller.create(parent).record;
  await state.controller.send(parent, { id: record.id, text: '查看当前背景' });
  assert.equal(Object.hasOwn(state.starts[0], 'agentPreset'), false);
  await state.controller.end(parent, record.id);
});

test('首问启动期间的停止等待启动完成，再中断当前回答并保留侧聊', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const entered = Promise.withResolvers();
  const gate = Promise.withResolvers();
  const start = state.ctx.subagents.startActivation;
  const interrupts = [];
  state.ctx.subagents.startActivation = async (spec) => {
    entered.resolve();
    await gate.promise;
    return start(spec);
  };
  state.ctx.subagents.interrupt = (id, reason) => {
    interrupts.push({ id, reason });
    state.agents.get(id).cancel();
  };
  const sending = state.controller.send(parent, { id: record.id, text: '开始首问' });
  await entered.promise;
  assert.equal(state.controller.list(parent.id).records[0].status, 'starting');
  let stopped = false;
  const stopping = Promise.resolve(state.controller.stop(parent, record.id)).then((result) => {
    stopped = true;
    return result;
  });
  await Promise.resolve();
  assert.equal(stopped, false);
  assert.equal(interrupts.length, 0);
  gate.resolve();
  await sending;
  const response = await stopping;
  assert.deepEqual(interrupts, [{ id: record.id, reason: { kind: 'user' } }]);
  assert.equal(response.records[0].running, false);
  assert.equal(response.records[0].status, 'open');
  assert.equal(state.disposed(), 0);
  await state.controller.send(parent, { id: record.id, text: '继续讨论' });
  assert.equal(state.prompts.length, 1);
  await state.controller.end(parent, record.id);
});

test('首问启动失败时停止请求明确失败，后续首问仍可重新发送', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const entered = Promise.withResolvers();
  const gate = Promise.withResolvers();
  const start = state.ctx.subagents.startActivation;
  state.ctx.subagents.startActivation = async () => {
    entered.resolve();
    return gate.promise;
  };
  const sending = state.controller.send(parent, { id: record.id, text: '开始首问' });
  await entered.promise;
  const stopping = state.controller.stop(parent, record.id);
  const checks = Promise.all([assert.rejects(sending, /启动失败/), assert.rejects(Promise.resolve(stopping), /启动失败/)]);
  gate.reject(new Error('启动失败'));
  await checks;
  assert.equal(state.controller.list(parent.id).records[0].status, 'ready');
  state.ctx.subagents.startActivation = start;
  await state.controller.send(parent, { id: record.id, text: '重新开始' });
  assert.equal(state.controller.list(parent.id).records[0].status, 'open');
  await state.controller.end(parent, record.id);
});

test('启动期间停止与关闭并发时，不中断已关闭的侧聊且正常释放资源', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const entered = Promise.withResolvers();
  const gate = Promise.withResolvers();
  const start = state.ctx.subagents.startActivation;
  let interrupts = 0;
  state.ctx.subagents.startActivation = async (spec) => {
    const activation = await start(spec);
    entered.resolve();
    await gate.promise;
    return activation;
  };
  state.ctx.subagents.interrupt = () => { interrupts += 1; };
  const sending = state.controller.send(parent, { id: record.id, text: '开始首问' });
  const failedSend = assert.rejects(sending, /侧边聊天已结束/);
  await entered.promise;
  const stopping = state.controller.stop(parent, record.id);
  const closing = state.controller.end(parent, record.id);
  gate.resolve();
  await Promise.all([failedSend, stopping, closing]);
  assert.equal(interrupts, 0);
  assert.equal(state.disposed(), 1);
  assert.equal(state.controller.list(parent.id).records.length, 0);
});

test('其他主会话不能操作本侧聊', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  await assert.rejects(state.controller.end({ id: 'other' }, record.id), /不属于/);
  assert.throws(() => state.controller.stop({ id: 'other' }, record.id), /不属于/);
});

test('目录不启动 Agent，技能视角在首问前用主会话、启动后用侧聊', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const first = await state.controller.catalog(parent, { id: record.id });
  assert.equal(state.starts.length, 0);
  assert.equal(state.skillLookups[0].scope, parent);
  assert.equal(state.skillLookups[0].cwd, '/project');
  assert.deepEqual(first.catalog.skills.map((skill) => skill.name), ['review']);
  assert.deepEqual(first.catalog.permissions.options.map((option) => option.value), ['default', ...state.permissions.options.map((option) => option.value)]);
  assert.equal(state.permissions.options.some((option) => option.value === 'default'), false);
  assert.equal(first.record.permission, 'default');
  assert.deepEqual(first.catalog.models.groups[0].models[0].reasoning.efforts.map((effort) => effort.id), ['low', 'high']);
  await state.controller.send(parent, { id: record.id, text: '开始' });
  const child = state.agents.get(record.id);
  child.model.select({ provider: 'fixture', model: 'next' });
  const second = await state.controller.catalog(parent, { id: record.id });
  assert.equal(state.skillLookups[1].scope, child);
  assert.equal(second.record.selection.model, 'next');
  assert.equal(second.catalog.selection.model, 'next');
});

test('模型和思考强度在首问前后及回答中可选择，拒绝目录外模型和无效强度', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const selected = { provider: 'fixture', model: 'current', reasoningEffort: 'high' };
  const response = await state.controller.selectModel(parent, { id: record.id, selection: selected });
  assert.deepEqual(response.record.selection, selected);
  assert.equal(state.starts.length, 0);
  await assert.rejects(state.controller.selectModel(parent, { id: record.id, selection: { provider: 'fixture', model: 'missing' } }), /模型当前不可用/);
  await assert.rejects(state.controller.selectModel(parent, { id: record.id, selection: { ...selected, reasoningEffort: 'invalid' } }), /思考强度不可用/);
  await state.controller.send(parent, { id: record.id, text: '开始', selection: selected });
  assert.equal(state.starts[0].agentOptions.reasoningEffort, 'high');
  const child = state.agents.get(record.id);
  assert.equal(child.status, 'running');
  const next = await state.controller.selectModel(parent, { id: record.id, selection: { provider: 'fixture', model: 'next' } });
  assert.equal(next.record.selection.model, 'next');
  assert.equal(Object.hasOwn(child.model.current(), 'reasoningEffort'), false);
  assert.equal(Object.hasOwn(state.controller.records.get(record.id).agentOptions, 'reasoningEffort'), false);
});

test('打开时选中默认，启动后固定工作区内修改与 never，不继承主会话权限', async () => {
  for (const preset of ['read-only', 'workspace-write', 'danger-full-access', 'auto']) {
    const state = harness();
    const parent = parentFixture();
    const spec = permissionSpecs[preset];
    parent.events.splice(2, 0, { type: 'permission/preset', data: { preset } }, { type: 'sandbox/mode', data: { mode: spec.sandbox } }, { type: 'approval/policy', data: { policy: spec.approval } });
    const parentEvents = structuredClone(parent.events);
    const record = state.controller.create(parent).record;
    assert.equal(record.permission, 'default');
    await state.controller.send(parent, { id: record.id, text: '开始' });
    const child = state.agents.get(record.id);
    assert.equal(permissionKnobs(child.session).sandbox, 'workspace-write');
    assert.equal(permissionKnobs(child.session).approval, 'never');
    assert.equal(state.controller.list(parent.id).records[0].permission, 'default');
    assert.equal(child.session.snapshotEvents().some((event) => event.type === 'permission/preset' && event.data.preset === 'default'), false);
    assert.equal(state.permissionChanges.length, 0);
    assert.deepEqual(parent.events, parentEvents);
  }
});

test('没有已完成轮次时仍使用侧聊默认权限，不继承全局完全权限或未完成对话', async () => {
  for (const running of [false, true]) {
    const state = harness();
    state.ctx.permissionPresets.catalog = () => ({ ...permissions, defaultPreset: 'danger-full-access' });
    const parent = parentFixture();
    parent.events.splice(0, parent.events.length,
      { seq: 0, type: 'permission/preset', data: { preset: 'read-only' } },
      { seq: 1, type: 'sandbox/mode', data: { mode: 'read-only' } },
      { seq: 2, type: 'approval/policy', data: { policy: 'ask' } });
    if (running) {
      parent.events.push({ seq: 3, type: 'turn/start', data: { turn: 1 } }, { seq: 4, type: 'user/message', data: { content: [{ type: 'text', text: '尚未完成的问题' }] } });
    }
    const record = state.controller.create(parent).record;
    assert.equal(record.permission, 'default');
    assert.equal(record.cutoffSeq, -1);
    assert.equal(state.controller.records.get(record.id).seed.length, 1);
    parent.events.push({ type: 'permission/preset', data: { preset: 'danger-full-access' } }, { type: 'sandbox/mode', data: { mode: 'danger-full-access' } }, { type: 'approval/policy', data: { policy: 'never' } });
    await state.controller.send(parent, { id: record.id, text: '开始侧聊' });
    assert.equal(permissionKnobs(state.agents.get(record.id).session).sandbox, 'workspace-write');
    assert.equal(permissionKnobs(state.agents.get(record.id).session).approval, 'never');
    assert.equal(state.controller.list(parent.id).records[0].permission, 'default');
    assert.equal(state.permissionChanges.length, 0);
    assert.equal(permissionKnobs(parent.session).sandbox, 'danger-full-access');
    await state.controller.end(parent, record.id);
  }
});

test('首问前选择宿主权限只保存，启动时完整应用原生预设', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const response = await state.controller.execute(parent, { action: 'selectPermission', id: record.id, permission: 'workspace-write' });
  assert.equal(response.record.permission, 'workspace-write');
  assert.equal(state.starts.length, 0);
  assert.equal(state.permissionChanges.length, 0);
  await state.controller.send(parent, { id: record.id, text: '开始' });
  const child = state.agents.get(record.id);
  assert.deepEqual(permissionKnobs(child.session), { preset: 'workspace-write', sandbox: 'workspace-write', approval: 'ask' });
  assert.deepEqual(state.permissionChanges, [{ session: child.session, permission: 'workspace-write' }]);
});

test('首问前可从宿主预设切回默认，启动后可在默认和宿主预设之间切换', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  state.controller.selectPermission(parent, { id: record.id, permission: 'read-only' });
  assert.equal(state.controller.selectPermission(parent, { id: record.id, permission: 'default' }).record.permission, 'default');
  assert.equal(state.starts.length, 0);
  await state.controller.send(parent, { id: record.id, text: '开始' });
  const child = state.agents.get(record.id);
  for (const permission of ['workspace-write', 'read-only', 'danger-full-access', 'auto']) {
    assert.equal(state.controller.selectPermission(parent, { id: record.id, permission }).record.permission, permission);
    assert.equal(state.controller.selectPermission(parent, { id: record.id, permission: 'default' }).record.permission, 'default');
    assert.equal(permissionKnobs(child.session).sandbox, 'workspace-write');
    assert.equal(permissionKnobs(child.session).approval, 'never');
  }
  child.session.append('sandbox/mode', { mode: 'read-only' });
  assert.equal(state.controller.list(parent.id).records[0].permission, 'custom');
});

test('运行中可切换当前侧聊权限，自动审查按显式预设恢复 ask，其他会话不受影响', async () => {
  const state = harness();
  const parent = parentFixture();
  const first = state.controller.create(parent).record;
  const second = state.controller.create(parent).record;
  await state.controller.send(parent, { id: first.id, text: '开始' });
  await state.controller.send(parent, { id: second.id, text: '另一个侧聊' });
  const child = state.agents.get(first.id);
  const sibling = state.agents.get(second.id);
  assert.equal(child.status, 'running');
  const response = state.controller.selectPermission(parent, { id: first.id, permission: 'auto' });
  assert.equal(response.record.permission, 'auto');
  assert.deepEqual(permissionKnobs(child.session), { preset: 'auto', sandbox: 'danger-full-access', approval: 'ask' });
  assert.equal(permissionKnobs(sibling.session).approval, 'never');
  assert.equal(permissionKnobs(sibling.session).sandbox, 'workspace-write');
  assert.equal(parent.events.some((event) => event.type === 'approval/policy'), false);
  assert.throws(() => state.controller.selectPermission(parent, { id: first.id, permission: 'missing' }), /权限预设不可用/);
  assert.throws(() => state.controller.selectPermission({ id: 'other' }, { id: first.id, permission: 'read-only' }), /不属于/);
  assert.equal(state.permissionChanges.length, 1);
});

test('主会话自动审查不改变侧聊默认，模型与权限切换仍受短暂提交锁约束', async () => {
  const state = harness();
  const parent = parentFixture();
  parent.events.splice(2, 0, { type: 'permission/preset', data: { preset: 'auto' } }, { type: 'sandbox/mode', data: { mode: 'danger-full-access' } });
  const record = state.controller.create(parent).record;
  assert.equal(record.permission, 'default');
  await state.controller.send(parent, { id: record.id, text: '开始' });
  const child = state.agents.get(record.id);
  assert.equal(state.controller.list(parent.id).records[0].permission, 'default');
  assert.equal(permissionKnobs(child.session).approval, 'never');
  const stored = state.controller.records.get(record.id);
  stored.selecting = true;
  assert.throws(() => state.controller.selectPermission(parent, { id: record.id, permission: 'read-only' }), /请稍候/);
  await assert.rejects(state.controller.selectModel(parent, { id: record.id, selection: { provider: 'fixture', model: 'next' } }), /请稍候/);
  stored.selecting = false;
  stored.submitting = Promise.resolve();
  assert.throws(() => state.controller.selectPermission(parent, { id: record.id, permission: 'read-only' }), /请稍候/);
  stored.submitting = null;
  await assert.rejects(state.controller.execute(parent, { action: 'selectPermission', id: record.id, permission: 'read-only' }, AbortSignal.abort()));
  assert.equal(state.permissionChanges.length, 0);
});

test('文件和图片可在首问前上传，首问保留 Skill 开头并使用宿主文件句柄', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const file = (await state.controller.upload(parent, { id: record.id, name: '报告.txt', mediaType: 'text/plain', data: Buffer.from('文件内容').toString('base64') })).attachment;
  const image = (await state.controller.upload(parent, { id: record.id, name: '截图.png', mediaType: 'image/png', data: 'aW1hZ2U=' })).attachment;
  assert.equal(state.starts.length, 0);
  assert.equal(file.kind, 'file');
  assert.equal(image.kind, 'image');
  assert.equal(Object.hasOwn(file, 'attachmentId'), false);
  await state.controller.send(parent, { id: record.id, text: '/review 检查附件', attachments: [file.id, image.id] });
  const prompt = state.starts[0].prompt;
  assert.match(prompt[0].text, /^\/review 检查附件/);
  assert.match(prompt[0].text, /\/attachments\/file-0\/报告.txt/);
  assert.equal(prompt[1].type, 'image');
  assert.equal(state.controller.records.get(record.id).uploads.size, 0);
});

test('续聊统一走托管用户 prompt，通用文件适配为原生句柄，图片重新编码', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  await state.controller.send(parent, { id: record.id, text: '开始' });
  const file = (await state.controller.upload(parent, { id: record.id, name: '附件.pdf', mediaType: 'application/pdf', data: 'cGRm' })).attachment;
  const image = (await state.controller.upload(parent, { id: record.id, name: '图片.png', mediaType: 'image/png', data: 'aW1hZ2U=' })).attachment;
  await state.controller.send(parent, { id: record.id, text: '/review 继续', attachments: [file.id, image.id], delivery: 'steer', requestId: 'follow-up', clientTimeZone: 'Asia/Shanghai' });
  assert.equal(state.starts.length, 1);
  assert.equal(state.prompts.length, 1);
  const request = state.prompts[0];
  assert.equal(request.childSessionId, record.id);
  assert.equal(request.delivery, 'steer');
  assert.equal(request.requestId, 'follow-up');
  assert.equal(request.clientTimeZone, 'Asia/Shanghai');
  assert.match(request.content[0].text, /^\/review 继续/);
  assert.match(request.content[0].text, /附件.pdf/);
  assert.deepEqual(request.content[1], { type: 'image', mediaType: 'image/png', name: '图片.png', data: 'aW1hZ2U=' });
  assert.equal(request.content.some((part) => part.type === 'file'), false);
});

test('纯附件可发送，失败保留上传，成功请求重试不重复接纳', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const attachment = (await state.controller.upload(parent, { id: record.id, name: '资料.txt', mediaType: 'text/plain', data: 'ZmlsZQ==' })).attachment;
  const request = { id: record.id, text: '', attachments: [attachment.id], requestId: 'first' };
  const first = await state.controller.send(parent, request);
  assert.equal(first.record.title, '侧边聊天 1');
  await state.controller.send(parent, request);
  assert.equal(state.starts.length, 1);
  assert.throws(() => state.controller.send(parent, { ...request, text: '改变请求' }), /同一请求标识/);
  const second = (await state.controller.upload(parent, { id: record.id, name: '补充.txt', mediaType: 'text/plain', data: 'bmV4dA==' })).attachment;
  const send = { id: record.id, text: '', attachments: [second.id], requestId: 'second' };
  const prompt = state.ctx.subagents.prompt;
  state.ctx.subagents.prompt = async () => { throw new Error('投递失败'); };
  await assert.rejects(state.controller.send(parent, send), /投递失败/);
  assert.equal(state.controller.records.get(record.id).uploads.has(second.id), true);
  state.ctx.subagents.prompt = prompt;
  await state.controller.send(parent, send);
  await state.controller.send(parent, send);
  assert.equal(state.prompts.length, 1);
  assert.equal(state.controller.records.get(record.id).uploads.size, 0);
});

test('未显式选择时首问与图片能力校验使用同一个宿主默认模型', async () => {
  const state = harness();
  const parent = parentFixture();
  parent.model.current = () => undefined;
  parent.options = {};
  const record = state.controller.create(parent).record;
  const image = (await state.controller.upload(parent, { id: record.id, name: '图片.png', mediaType: 'image/png', data: 'aW1hZ2U=' })).attachment;
  const result = await state.controller.send(parent, { id: record.id, attachments: [image.id] });
  assert.equal(state.starts[0].agentOptions.model, state.models.default.model);
  assert.deepEqual(result.record.selection, state.models.default);
});

test('明确不支持图片的模型在首问前拒绝图片且保留附件', async () => {
  const state = harness();
  const parent = parentFixture();
  const record = state.controller.create(parent).record;
  const image = (await state.controller.upload(parent, { id: record.id, name: '图片.png', mediaType: 'image/png', data: 'aW1hZ2U=' })).attachment;
  await assert.rejects(state.controller.send(parent, { id: record.id, attachments: [image.id], selection: { provider: 'fixture', model: 'next' } }), /不支持图片/);
  assert.equal(state.starts.length, 0);
  assert.equal(state.controller.records.get(record.id).uploads.has(image.id), true);
});

test('附件标识仅对所属侧聊有效，释放实例后不借普通会话恢复', async () => {
  const state = harness();
  const parent = parentFixture();
  const first = state.controller.create(parent).record;
  const second = state.controller.create(parent).record;
  const attachment = (await state.controller.upload(parent, { id: first.id, name: '资料.txt', mediaType: 'text/plain', data: 'ZmlsZQ==' })).attachment;
  await assert.rejects(state.controller.send(parent, { id: second.id, attachments: [attachment.id] }), /不属于当前侧聊/);
  await state.controller.send(parent, { id: first.id, text: '开始' });
  state.agents.delete(first.id);
  await assert.rejects(state.controller.send(parent, { id: first.id, text: '继续' }), /运行实例已释放/);
  assert.equal(state.prompts.length, 0);
});
