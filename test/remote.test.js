import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { SidechatController } from '../src/host/controller.js';
import { parseRequest, registerSidechatRemote, requestSchema, sidechatContribution } from '../src/host/remote.js';

function permissionFixture() {
  return {
    catalog: () => ({ options: [{ value: 'workspace-write', name: '工作区内修改' }], defaultOptions: [{ value: 'workspace-write', name: '工作区内修改' }], defaultPreset: 'workspace-write' }),
    resolve: () => ({ sandbox: 'workspace-write', approval: 'ask' }),
  };
}

function parentFixture(id = 'parent') {
  let appended = 0;
  return {
    id,
    ctx: { get: () => undefined },
    options: { provider: 'fixture', model: 'fixture' },
    model: { current: () => ({ provider: 'fixture', model: 'fixture' }) },
    session: {
      header: { cwd: process.cwd() },
      snapshotEvents: () => [],
      append() { appended += 1; },
    },
    appended: () => appended,
  };
}

test('专用接口按主会话查找和资源作用域调用，不借用 commands', () => {
  const descriptor = sidechatContribution().invocations[0];
  assert.equal(descriptor.namespace, 'sidechat');
  assert.equal(descriptor.service, 'sidechat');
  assert.deepEqual(descriptor.scope, { context: 'agent', wire: 'agentId' });
  assert.equal(descriptor.parameters[0].source, 'lookup');
  assert.equal(descriptor.parameters[0].lookup, 'agent');
  assert.equal(descriptor.cancellation.parameter, 'signal');
});

test('请求校验拒绝未知操作、缺失身份和无效首问', () => {
  assert.deepEqual(parseRequest({ action: 'list' }), { action: 'list' });
  assert.throws(() => parseRequest({ action: 'unknown' }), /action/);
  assert.throws(() => parseRequest({ action: 'end' }), /id/);
  assert.throws(() => parseRequest({ action: 'send', id: 'side', text: ' ' }), /问题/);
  assert.throws(() => parseRequest({ action: 'list', unrelated: 'x' }), /未知字段/);
});

test('统一输入请求接受纯附件、模型强度和续聊，拒绝伪造引用与越界字段', () => {
  const selection = { provider: 'fixture', model: 'model', reasoningEffort: 'high' };
  const send = { action: 'send', id: 'side', attachments: ['upload-1'], selection, delivery: 'queue', requestId: 'request-1' };
  assert.deepEqual(parseRequest(send), send);
  assert.deepEqual(parseRequest({ action: 'catalog', id: 'side' }), { action: 'catalog', id: 'side' });
  assert.deepEqual(parseRequest({ action: 'selectModel', id: 'side', selection }).selection, selection);
  assert.deepEqual(parseRequest({ action: 'upload', id: 'side', name: 'empty.txt', mediaType: 'text/plain', data: '' }).data, '');
  assert.throws(() => parseRequest({ ...send, attachments: [{ attachmentId: 'forged' }] }), /附件/);
  assert.throws(() => parseRequest({ ...send, attachments: ['same', 'same'] }), /附件/);
  assert.throws(() => parseRequest({ ...send, selection: { ...selection, unrelated: 'x' } }), /模型选择/);
  assert.throws(() => parseRequest({ ...send, selection: { model: 'model' } }), /provider/);
  assert.throws(() => parseRequest({ ...send, selection: { ...selection, reasoningEffort: 1 } }), /模型选择/);
  assert.throws(() => parseRequest({ ...send, delivery: 'parent' }), /queue 或 steer/);
  assert.throws(() => parseRequest({ action: 'selectModel', id: 'side' }), /selection/);
  assert.throws(() => parseRequest({ action: 'catalog', id: 'side', data: 'x' }), /不支持的字段/);
  assert.throws(() => parseRequest({ action: 'upload', id: 'side', name: 'x', mediaType: 'text/plain' }), /上传需要/);
});

test('权限选择请求的 JSON Schema、解析和反射声明保持一致', () => {
  const request = { action: 'selectPermission', id: 'side', permission: 'workspace-write' };
  assert.deepEqual(parseRequest(request), request);
  assert.ok(requestSchema.properties.action.enum.includes('selectPermission'));
  assert.deepEqual(requestSchema.properties.permission, { type: 'string', minLength: 1, description: '当前侧聊选择的宿主权限预设。' });
  const declaration = sidechatContribution().model.services[0].types[0].declaration;
  assert.match(declaration, /'selectPermission'/);
  assert.match(declaration, /permission\?: string/);
  assert.throws(() => parseRequest({ action: 'selectPermission', id: 'side' }), /需要 permission/);
  assert.throws(() => parseRequest({ ...request, permission: '' }), /不能为空/);
  assert.throws(() => parseRequest({ ...request, permission: 1 }), /字段类型/);
  assert.throws(() => parseRequest({ ...request, selection: { provider: 'fixture', model: 'model' } }), /不支持的字段/);
  assert.throws(() => parseRequest({ action: 'send', id: 'side', text: '继续', permission: 'workspace-write' }), /不支持的字段/);
});

test('状态读取、空白创建和结束不向主会话追加命令或对话事件', async () => {
  const parent = parentFixture();
  const controller = new SidechatController({ agents: { get: () => undefined }, permissionPresets: permissionFixture() });
  assert.equal((await controller.execute(parent, { action: 'list' })).records.length, 0);
  const created = await controller.execute(parent, { action: 'create' });
  assert.equal(created.records.length, 1);
  assert.equal((await controller.execute(parent, { action: 'end', id: created.record.id })).records.length, 0);
  assert.equal(parent.appended(), 0);
});

test('已取消的远程操作不改变侧聊状态', async () => {
  const controller = new SidechatController({ agents: { get: () => undefined }, permissionPresets: permissionFixture() });
  await assert.rejects(controller.execute(parentFixture(), { action: 'create' }, AbortSignal.abort()));
  assert.equal(controller.records.size, 0);
});

test('真实 Typert 网关可调专用接口，拒绝未授权调用且不写聊天事件', {
  skip: !process.versions.electron || !process.env.DSH_INSTALL_DIR,
}, async () => {
  const requireHost = createRequire(join(process.env.DSH_INSTALL_DIR, 'package.json'));
  const { Context } = requireHost('@deepseek-ai/cordis');
  const { TypertRegistry } = requireHost('@deepseek-ai/dsh-typert-registry');
  const gatewayModule = requireHost('@deepseek-ai/dsh-api-gateway');
  const Gateway = gatewayModule.default;
  const ctx = new Context();
  let resolutions = 0;
  let accessCheck;
  const parent = parentFixture();
  ctx.reflect.provide('remoteAccess', { decide(request) { accessCheck = request; return { kind: 'deny', reason: 'test-denied' }; } });
  ctx.reflect.provide('agents', { get: () => undefined });
  await ctx.plugin(TypertRegistry);
  await ctx.plugin(Gateway);
  try {
    ctx.typert.lookups.register('agent', {
      parameter: 'agent', wire: 'agentId', resource: 'session', hostTypeSymbol: '@deepseek-ai/dsh-agent#Agent', wireTypeSymbol: '@deepseek-ai/dsh-session/types#SessionId',
      resolve(id) { resolutions += 1; return id === parent.id ? parent : undefined; },
    });
    ctx.typert.contexts.registerHost('agent', { wire: 'agentId', wireTypeSymbol: '@deepseek-ai/dsh-session/types#SessionId', resource: 'session', resolve: (id) => id === parent.id ? ctx : undefined });
    const controller = new SidechatController(ctx);
    ctx.reflect.provide('sidechat', controller);
    ctx.reflect.provide('permissionPresets', permissionFixture());
    registerSidechatRemote(ctx, controller);
    const peer = { id: 'test-peer', ctx, principal: { kind: 'owner' }, signal: new AbortController().signal, interactions: 'none', dispose: async () => {} };
    const invoke = (input, actualPeer = peer) => ctx.typertGateway.invoke({ namespace: 'sidechat', method: 'execute', args: { agentId: parent.id, input }, peer: actualPeer });
    const created = await invoke({ action: 'create' });
    assert.equal(created.records.length, 1);
    assert.equal((await invoke({ action: 'end', id: created.record.id })).records.length, 0);
    const before = resolutions;
    await assert.rejects(invoke({ action: 'list' }, { ...peer, principal: { kind: 'test-guest' } }), /access denied/);
    assert.equal(resolutions, before);
    assert.equal(accessCheck.action, 'sidechat/execute');
    assert.deepEqual(accessCheck.resources, [{ kind: 'session', id: parent.id }]);
    assert.equal(parent.appended(), 0);
  } finally {
    await ctx.fiber.dispose();
  }
});
