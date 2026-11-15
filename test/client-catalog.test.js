import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 客户端由宿主加载器封装；仅执行无 React/DOM 依赖的目录逻辑。
const source = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const logic = source.slice(source.indexOf('    function visibleCatalog('), source.indexOf('    function sidechatHistoryStart('));
const { Manager, visibleCatalog, catalogSnapshot } = new Function('errorText', `${logic}\nreturn { Manager, visibleCatalog, catalogSnapshot };`)((error) => error.message);
const entries = [{ id: 'ordinary', label: '侧边聊天 1' }, { id: 'sidechat-open' }, { id: 'sidechat-old' }];
const data = (records, bootId = 'boot') => ({ bootId, records: records.map((id) => ({ id })), limit: 3 });

function fixture() {
  const snapshot = { byId: { ordinary: { title: '普通任务' } }, projectionsBySession: { parent: { state: 'ready', values: { title: '主会话', subagentCatalog: entries } } } };
  let releases = 0;
  const ctx = {
    sessions: {
      list: { getSnapshot: () => snapshot },
      retain: () => ({ ready: Promise.resolve(), release() { releases += 1; } }),
    },
    connection: { rpc: { async call() { return { ok: true, value: data(['sidechat-open']) }; } } },
    sidebarRight: { mounted: { getSnapshot: () => null } },
  };
  return { manager: new Manager(ctx, (key) => key), ctx, snapshot, releases: () => releases };
}

test('只隐藏已确认结束的侧聊，保留普通任务、打开中和未知条目', () => {
  const { manager } = fixture();
  assert.equal(visibleCatalog(entries, 'parent', manager.catalog.snapshot), entries);
  manager.updateCatalog('parent', data(['sidechat-open']), entries, 1);
  const projected = visibleCatalog(entries, 'parent', manager.catalog.snapshot);
  assert.deepEqual(projected.map((entry) => entry.id), ['ordinary', 'sidechat-open']);
  assert.equal(projected[0], entries[0]);
  assert.equal(visibleCatalog(entries, 'other', manager.catalog.snapshot), entries);
});

test('关闭失败的记录保留；关闭成功后旧响应不能让条目重新出现', () => {
  const { manager } = fixture();
  manager.updateCatalog('parent', { ...data(['sidechat-open']), records: [{ id: 'sidechat-open', status: 'closing', error: '清理失败' }] }, entries, 2);
  assert.equal(visibleCatalog(entries, 'parent', manager.catalog.snapshot).some((entry) => entry.id === 'sidechat-open'), true);
  manager.updateCatalog('parent', data([]), entries, 3, 'sidechat-open');
  manager.updateCatalog('parent', data(['sidechat-open']), entries, 1);
  assert.deepEqual(visibleCatalog(entries, 'parent', manager.catalog.snapshot).map((entry) => entry.id), ['ordinary']);
});

test('旧清单不隐藏请求期间新出现的侧聊，后续核对正常保留', () => {
  const { manager } = fixture();
  const later = [...entries, { id: 'sidechat-new' }];
  manager.updateCatalog('parent', data(['sidechat-open']), entries, 1);
  assert.equal(visibleCatalog(later, 'parent', manager.catalog.snapshot).at(-1).id, 'sidechat-new');
  manager.updateCatalog('parent', data(['sidechat-open', 'sidechat-new']), later, 2);
  assert.equal(visibleCatalog(later, 'parent', manager.catalog.snapshot).at(-1).id, 'sidechat-new');
  // 结束请求比另一条读取更早发出，但成功回执仍必须生效。
  manager.updateCatalog('parent', data(['sidechat-open']), later, 1, 'sidechat-new');
  assert.equal(visibleCatalog(later, 'parent', manager.catalog.snapshot).some((entry) => entry.id === 'sidechat-new'), false);
});

test('目录投影不修改共享状态，无变化时复用原快照', () => {
  const { manager, snapshot } = fixture();
  assert.equal(catalogSnapshot(snapshot, {}), snapshot);
  manager.updateCatalog('parent', data(['sidechat-open']), entries, 1);
  const projected = catalogSnapshot(snapshot, manager.catalog.snapshot);
  assert.equal(projected.byId, snapshot.byId);
  assert.equal(projected.projectionsBySession.parent.values.title, '主会话');
  assert.deepEqual(projected.projectionsBySession.parent.values.subagentCatalog.map((entry) => entry.id), ['ordinary', 'sidechat-open']);
  assert.equal(snapshot.projectionsBySession.parent.values.subagentCatalog, entries);
  assert.equal(entries.length, 3);
  const stable = manager.catalog.snapshot;
  manager.updateCatalog('parent', data(['sidechat-open']), entries, 2);
  assert.equal(manager.catalog.snapshot, stable);
});

test('刷新及应用重启的空清单隐藏旧侧聊，拒绝旧运行的迟到响应', async () => {
  const { manager } = fixture();
  await manager.request('parent', { action: 'list' });
  manager.updateCatalog('parent', data([], 'new-boot'), entries, 2);
  manager.updateCatalog('parent', data(['sidechat-open'], 'boot'), entries, 1);
  assert.equal(manager.catalog.snapshot.parent.bootId, 'new-boot');
  assert.deepEqual(visibleCatalog(entries, 'parent', manager.catalog.snapshot).map((entry) => entry.id), ['ordinary']);
});

test('迟到的操作清单不删除新侧聊、草稿和附件', async () => {
  const { manager, ctx } = fixture();
  const older = Promise.withResolvers();
  const created = Promise.withResolvers();
  const latest = data(['sidechat-open', 'sidechat-new']);
  let reads = 0;
  ctx.connection.rpc.call = async (_path, _method, { args: { input } }) => {
    if (input.action === 'list') {
      reads += 1;
      return { ok: true, value: latest };
    }
    return input.action === 'create' ? created.promise : older.promise;
  };
  manager.adopt('parent', data(['sidechat-open']));
  const operation = manager.act('parent', { action: 'stop', id: 'sidechat-open' });
  const creation = manager.act('parent', { action: 'create' });
  created.resolve({ ok: true, value: { ...latest, record: latest.records[1] } });
  await creation;
  const composer = manager.composer('sidechat-new');
  const attachments = [{ localId: 'image', preview: 'blob:pending-image', status: 'ready' }];
  manager.updateComposer('sidechat-new', { text: '尚未发送的草稿', attachments });
  older.resolve({ ok: true, value: data(['sidechat-open']) });
  await operation;
  assert.deepEqual(manager.parent('parent').snapshot.records, latest.records);
  assert.equal(manager.composers.get('sidechat-new'), composer);
  assert.equal(composer.snapshot.text, '尚未发送的草稿');
  assert.equal(composer.snapshot.attachments, attachments);
  assert.equal(reads, 1);
  assert.deepEqual(manager.parent('parent').snapshot.busy, {});
});

test('迟到的关闭成功回执移除旧侧聊，同时保留随后创建的侧聊', async () => {
  const { manager, ctx } = fixture();
  const ended = Promise.withResolvers();
  const latest = data(['sidechat-new']);
  ctx.connection.rpc.call = async (_path, _method, { args: { input } }) => {
    if (input.action === 'end') {
      return ended.promise;
    }
    return { ok: true, value: input.action === 'create' ? data(['sidechat-open', 'sidechat-new']) : latest };
  };
  manager.adopt('parent', data(['sidechat-open']));
  manager.composer('sidechat-open');
  const closing = manager.act('parent', { action: 'end', id: 'sidechat-open' });
  await manager.act('parent', { action: 'create' });
  const composer = manager.composer('sidechat-new');
  manager.updateComposer('sidechat-new', { text: '新侧聊草稿' });
  ended.resolve({ ok: true, value: data([]) });
  await closing;
  assert.deepEqual(manager.parent('parent').snapshot.records, latest.records);
  assert.equal(manager.composers.has('sidechat-open'), false);
  assert.equal(manager.composers.get('sidechat-new'), composer);
  assert.equal(composer.snapshot.text, '新侧聊草稿');
});

test('较早发出的新建操作晚完成时，重新读取清单保留新建结果', async () => {
  const { manager, ctx } = fixture();
  const created = Promise.withResolvers();
  const latest = data(['sidechat-open', 'sidechat-new']);
  ctx.connection.rpc.call = async (_path, _method, { args: { input } }) => {
    if (input.action === 'create') {
      return created.promise;
    }
    return { ok: true, value: input.action === 'list' ? latest : data(['sidechat-open']) };
  };
  manager.adopt('parent', data(['sidechat-open']));
  const creation = manager.act('parent', { action: 'create' });
  await manager.act('parent', { action: 'stop', id: 'sidechat-open' });
  created.resolve({ ok: true, value: { ...latest, record: latest.records[1] } });
  const result = await creation;
  assert.equal(result.record.id, 'sidechat-new');
  assert.deepEqual(manager.parent('parent').snapshot.records, latest.records);
});

test('清单读取失败不扩大隐藏集合，并释放请求持有的引用', async () => {
  const { manager, ctx, releases } = fixture();
  ctx.connection.rpc.call = async () => ({ ok: false, error: { code: 'gateway/internal', message: '读取失败' } });
  const before = manager.catalog.snapshot;
  await assert.rejects(manager.request('parent', { action: 'list' }), /读取失败/);
  assert.equal(manager.catalog.snapshot, before);
  assert.equal(visibleCatalog(entries, 'parent', manager.catalog.snapshot), entries);
  assert.equal(releases(), 1);
});
