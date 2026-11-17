import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const logic = source.slice(source.indexOf('    function visibleCatalog('), source.indexOf('    function sidechatHistoryStart('));
const parseAddress = (address) => {
  const url = new URL(address);
  return { id: decodeURIComponent(url.pathname.slice('/session/'.length)), bootId: url.searchParams.get('boot'), parentId: url.searchParams.get('parent') };
};
const addressOf = (boot, parent, id) => `dsh-resource://sidechat/session/${id}?boot=${boot}&parent=${parent}`;
const { Manager, insertDraftQuote, replaceDraftRange, removeDraftQuote, deleteDraftQuote, quotePreviewPosition, serializeQuoteDraft, serializeQuoteClipboard, selectQuoteTarget } = new Function('errorText', 'parseAddress', 'addressOf', 'KIND', `${logic}\nreturn { Manager, insertDraftQuote, replaceDraftRange, removeDraftQuote, deleteDraftQuote, quotePreviewPosition, serializeQuoteDraft, serializeQuoteClipboard, selectQuoteTarget };`)((error) => error.message, parseAddress, addressOf, 'sidechat');
const readQuoteEditor = new Function('QUOTE_MARKER', `${source.slice(source.indexOf('    function readQuoteEditor('), source.indexOf('    function QuoteEditor('))}\nreturn readQuoteEditor;`)('\uFFFC');
const draft = (text = '') => ({ text, quotes: [], caret: null, attachments: [], focusVersion: 0 });
const tab = (id, parent = 'parent', boot = 'boot') => ({ id, kind: 'sidechat', contentId: addressOf(boot, parent, id) });
const data = (ids) => ({ bootId: 'boot', records: ids.map((id) => ({ id, status: 'ready' })), limit: 3 });
const layout = () => ({ expanded: true, rootId: 'pane', activePaneId: 'pane', floats: [], nodes: { pane: { kind: 'pane', host: 'dock', tabs: ['b', 'file', 'a'], activeTabId: 'a' } }, tabs: { a: tab('a'), b: tab('b'), file: { id: 'file', kind: 'file' } } });

function fixture(ids = ['a', 'b']) {
  const opened = [];
  const requests = [];
  const ctx = {
    sidebarRight: { mounted: { getSnapshot: () => 'parent' }, openResource: (address) => opened.push(address) },
    sessions: { list: { getSnapshot: () => ({ projectionsBySession: {} }) }, retain: () => ({ ready: Promise.resolve(), release() {} }) },
    connection: { rpc: { async call(_path, _method, request) { requests.push(request.args.input); return { ok: true, value: data(ids) }; } } },
  };
  const manager = new Manager(ctx, (key) => key);
  manager.adopt('parent', data(ids));
  return { manager, ctx, opened, requests };
}

test('删除最后一条引用后，旧节点仍形成差异，不能误判为空编辑器', () => {
  const quoteNode = { nodeType: 1, nodeName: 'SPAN', dataset: { quoteId: 'removed' } };
  const beforeRender = readQuoteEditor({ childNodes: [quoteNode], firstChild: quoteNode }, []);
  assert.equal(beforeRender.text, '\uFFFC');
  assert.notEqual(beforeRender.text, draft().text);
  assert.deepEqual(beforeRender.quotes, []);
  const afterRender = readQuoteEditor({ childNodes: [] }, []);
  assert.deepEqual(afterRender, { text: '', quotes: [] });
});

test('删除中间引用时，旧节点占位不丢失，剩余正文与引用偏移按实际节点读取', () => {
  const children = [
    { nodeType: 3, textContent: '正文' },
    { nodeType: 1, nodeName: 'SPAN', dataset: { quoteId: 'removed' } },
    { nodeType: 3, textContent: '之后' },
    { nodeType: 1, nodeName: 'SPAN', dataset: { quoteId: 'kept' } },
  ];
  const quote = { id: 'kept', offset: 4, text: '保留的引用' };
  const value = readQuoteEditor({ childNodes: children, firstChild: children[0] }, [quote]);
  assert.equal(value.text, '正文\uFFFC之后\uFFFC');
  assert.equal(value.quotes[0].offset, 5);
  assert.notEqual(value.text, '正文之后\uFFFC');
});

test('按保存的选区末尾插入，保留正文、附件与之前的引用', () => {
  const original = { ...draft('前文后文'), caret: 2, attachments: [{ token: 'image' }] };
  const first = { ...original, ...insertDraftQuote(original, '引用一\n第二行', 'q1') };
  assert.equal(first.text, '前文\uFFFC后文');
  assert.equal(first.caret, 3);
  const second = { ...first, ...insertDraftQuote({ ...first, caret: 2 }, '引用二', 'q2') };
  assert.deepEqual(second.quotes.map((quote) => [quote.id, quote.offset]), [['q2', 2], ['q1', 3]]);
  assert.equal(second.attachments, original.attachments);
  assert.equal(original.text, '前文后文');
  assert.equal(serializeQuoteDraft(second), '前文\n\n> 引用二\n\n> 引用一\n> 第二行\n\n后文');
});

test('没有光标记录时插在末尾，单条删除不影响相邻引用', () => {
  let current = draft('正文');
  current = { ...current, ...insertDraftQuote(current, '一', 'q1') };
  current = { ...current, ...insertDraftQuote(current, '二', 'q2') };
  current = { ...current, ...replaceDraftRange(current, 2, 3, '') };
  assert.equal(current.text, '正文\uFFFC');
  assert.deepEqual(current.quotes.map((quote) => [quote.id, quote.offset]), [['q2', 2]]);
  assert.equal(serializeQuoteDraft(current), '正文\n\n> 二');
});

test('退格键整条删除光标前的引用，保留其他正文、引用和附件', () => {
  const current = { ...draft('前\uFFFC后\uFFFC'), quotes: [{ id: 'q1', offset: 1, text: '一' }, { id: 'q2', offset: 3, text: '二' }], attachments: [{ localId: 'file' }] };
  const patch = deleteDraftQuote(current, { start: 2, end: 2 }, true);
  const next = { ...current, ...patch };
  assert.equal(next.text, '前后\uFFFC');
  assert.equal(next.caret, 1);
  assert.deepEqual(next.quotes.map((quote) => [quote.id, quote.offset]), [['q2', 2]]);
  assert.equal(next.attachments, current.attachments);
  const single = { ...draft('\uFFFC'), quotes: [{ id: 'q', offset: 0, text: '只有引用' }] };
  assert.equal(deleteDraftQuote(single, { start: 1, end: 1 }, true).text, '');
});

test('引用后只有一个分隔空格时，退格和点击删除统一清理该空格', () => {
  const quote = { id: 'q1', offset: 0, text: '引用' };
  const current = { ...draft('\uFFFC  正文'), quotes: [quote] };
  const next = deleteDraftQuote(current, { start: 2, end: 2 }, true);
  assert.equal(next.text, ' 正文');
  assert.equal(next.caret, 0);
  assert.deepEqual(next, removeDraftQuote(current, quote));
  assert.equal(deleteDraftQuote(current, { start: 3, end: 3 }, true), null);
});

test('Delete 删除光标后的引用；普通字符及不包含引用的选区继续使用原编辑行为', () => {
  const current = { ...draft('前\uFFFC后'), quotes: [{ id: 'q1', offset: 1, text: '引用' }] };
  assert.equal(deleteDraftQuote(current, { start: 1, end: 1 }, false).text, '前后');
  assert.equal(deleteDraftQuote(current, { start: 1, end: 1 }, true), null);
  assert.equal(deleteDraftQuote(current, { start: 3, end: 3 }, true), null);
  assert.equal(deleteDraftQuote(current, { start: 0, end: 1 }, true), null);
  assert.equal(deleteDraftQuote(current, null, true), null);
});

test('退格删除包含引用的选区时，保留选区外的内容和后续引用偏移', () => {
  const current = { ...draft('甲乙\uFFFC丙\uFFFC丁'), quotes: [{ id: 'q1', offset: 2, text: '一' }, { id: 'q2', offset: 4, text: '二' }] };
  const next = deleteDraftQuote(current, { start: 1, end: 4 }, true);
  assert.equal(next.text, '甲\uFFFC丁');
  assert.equal(next.caret, 1);
  assert.deepEqual(next.quotes.map((quote) => [quote.id, quote.offset]), [['q2', 1]]);
});

test('悬停小窗贴近引用，靠右收回窗口内，下方空间不足时移到上方', () => {
  const size = { width: 300, height: 120 };
  const viewport = { width: 800, height: 600 };
  assert.deepEqual(quotePreviewPosition({ left: 50, top: 200, bottom: 220 }, size, viewport), { left: 50, top: 228 });
  assert.deepEqual(quotePreviewPosition({ left: 700, top: 520, bottom: 540 }, size, viewport), { left: 492, top: 392 });
  assert.deepEqual(quotePreviewPosition({ left: -10, top: 20, bottom: 40 }, size, viewport), { left: 8, top: 48 });
});

test('纯引用、多行、相邻正文按原生规则序列化，不丢空行与引号', () => {
  const current = { ...draft(), ...insertDraftQuote(draft(), '第一行\r\n\r\n> 内层引用\n', 'q1') };
  assert.equal(serializeQuoteDraft(current), '> 第一行\n> \n> > 内层引用\n> ');
  assert.equal(serializeQuoteDraft(draft('  正文\n内容  ')), '  正文\n内容  ');
});

test('剪贴板正文逐字保留缩进与空行，引用仍复制为完整 Markdown', () => {
  const plain = draft('    code\n\n  ');
  assert.equal(serializeQuoteClipboard(plain), plain.text);
  const mixed = { ...plain, ...insertDraftQuote({ ...plain, caret: 8 }, '完整引用\n第二行', 'q1') };
  assert.equal(serializeQuoteClipboard(mixed), '    code\n\n> 完整引用\n> 第二行\n\n\n\n  ');
});

test('展开时选择当前侧聊，折叠或激活其他标签时按真实标签顺序选择', () => {
  const state = { ...data(['a', 'b']), ending: {} };
  const surface = layout();
  assert.equal(selectQuoteTarget(state, surface, 'parent').id, 'a');
  assert.equal(selectQuoteTarget(state, { ...surface, expanded: false }, 'parent').id, 'b');
  surface.nodes.pane.activeTabId = 'file';
  assert.equal(selectQuoteTarget(state, surface, 'parent').id, 'b');
  surface.nodes.pane.tabs = ['a', 'file', 'b'];
  assert.equal(selectQuoteTarget(state, surface, 'parent').id, 'a');
});

test('分栏按布局左右与栏内顺序，跳过正在关闭及非本主会话的标签', () => {
  const state = { ...data(['a', 'b', 'c']), ending: { b: true } };
  const surface = layout();
  surface.rootId = 'split';
  surface.expanded = false;
  surface.nodes.split = { kind: 'split', children: ['left', 'pane'] };
  surface.nodes.left = { kind: 'pane', host: 'dock', tabs: ['foreign', 'b', 'c'], activeTabId: 'c' };
  surface.nodes.pane.tabs = ['a'];
  surface.tabs.c = tab('c');
  surface.tabs.foreign = tab('foreign', 'other');
  assert.equal(selectQuoteTarget(state, surface, 'parent').id, 'c');
  state.records[2].status = 'closing';
  assert.equal(selectQuoteTarget(state, surface, 'parent').id, 'a');
  state.ending.a = true;
  assert.equal(selectQuoteTarget(state, surface, 'parent'), undefined);
});

test('引用进入已有忙碌草稿，不发送、不创建子代理，保留附件', async () => {
  const { manager, requests, opened } = fixture();
  manager.composer('a');
  const attachments = [{ localId: 'image', status: 'uploading', preview: null }];
  manager.updateComposer('a', { text: '尚未发送', caret: 2, attachments, runtime: { pendingInteraction: true } });
  manager.publish('parent', { busy: { 'send:a': true } });
  await manager.quote('parent', '内容', layout());
  assert.equal(requests.length, 0);
  assert.equal(opened.length, 1);
  assert.equal(manager.composer('a').snapshot.text, '尚未\uFFFC发送');
  assert.equal(manager.composer('a').snapshot.attachments, attachments);
  assert.equal(manager.composer('a').snapshot.focusVersion, 1);
});

test('没有侧聊时只创建空白记录，全部关闭中时保留草稿并返回错误', async () => {
  const { manager, requests, ctx } = fixture([]);
  ctx.connection.rpc.call = async (_path, _method, request) => {
    requests.push(request.args.input);
    return { ok: true, value: { ...data(['a']), record: { id: 'a' } } };
  };
  await manager.quote('parent', '首次引用', layout());
  assert.deepEqual(requests.map((request) => request.action), ['create']);
  assert.equal(manager.composer('a').snapshot.quotes[0].text, '首次引用');
  manager.publish('parent', { ending: { a: true } });
  const before = manager.composer('a').snapshot;
  await assert.rejects(manager.quote('parent', '不能插入', layout()), /quoteUnavailable/);
  assert.equal(manager.composer('a').snapshot, before);
  assert.equal(requests.length, 1);
});

test('发送纯引用使用全文；发送期间新加的引用留在草稿中', async () => {
  const { manager, ctx, requests } = fixture();
  const sent = Promise.withResolvers();
  ctx.connection.rpc.call = async (_path, _method, request) => {
    requests.push(request.args.input);
    return sent.promise;
  };
  manager.composer('a');
  manager.updateComposer('a', insertDraftQuote(manager.composer('a').snapshot, '第一条\n完整内容', 'q1'));
  const operation = manager.submit('parent', { id: 'a' }, null);
  assert.equal(requests[0].text, '> 第一条\n> 完整内容');
  assert.equal(requests[0].action, 'send');
  await manager.quote('parent', '发送中新增', layout());
  sent.resolve({ ok: true, value: data(['a', 'b']) });
  await operation;
  const current = manager.composer('a').snapshot;
  assert.equal(current.quotes.length, 1);
  assert.equal(current.quotes[0].text, '发送中新增');
  assert.equal(serializeQuoteDraft(current), '> 发送中新增');
});

test('发送失败保留本次草稿和发送期间新增的引用', async () => {
  const { manager, ctx } = fixture();
  const sent = Promise.withResolvers();
  ctx.connection.rpc.call = () => sent.promise;
  manager.composer('a');
  manager.updateComposer('a', { text: '原正文' });
  const operation = manager.submit('parent', { id: 'a' }, null);
  await manager.quote('parent', '新引用', layout());
  sent.resolve({ ok: false, error: { code: 'failed', message: '发送失败' } });
  await operation;
  assert.equal(serializeQuoteDraft(manager.composer('a').snapshot), '原正文\n\n> 新引用');
  assert.match(manager.composer('a').snapshot.error, /发送失败/);
});
