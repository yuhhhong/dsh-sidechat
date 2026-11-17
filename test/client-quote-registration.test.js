import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const registration = source.slice(source.indexOf('        const nativeQuote ='), source.indexOf('        function Guide(props)'));
const register = new Function('ctx', registration);

for (const priority of [undefined, 0, -10, 200]) {
  test(`引用浮层包装项优先于原生项，原生优先级为 ${priority ?? '默认值'}`, () => {
    const native = { options: { key: 'quote', ...(priority === undefined ? {} : { priority }) }, locale: 'messageQuotes', component() {} };
    const store = { spec: {} };
    const added = [];
    const ctx = {
      slots: {
        entries: (name) => name === 'conversation.chat.text-interaction' ? [native] : [{ store }],
        inject(name, effect) {
          assert.equal(name, 'conversation.chat.text-interaction');
          return effect();
        },
        register(options, component) {
          added.push({ options, component });
          return () => {};
        },
      },
    };
    register(ctx);
    assert.equal(added.length, 1);
    assert.equal(added[0].options.key, native.options.key);
    // DSH 以较小的 priority 选中同一 key 的注册项。
    assert.ok(added[0].options.priority < (priority ?? 0));
    assert.equal(added[0].options.locale, native.locale);
    assert.equal(added[0].options.store, store);
    assert.equal(typeof added[0].component, 'function');
  });
}
