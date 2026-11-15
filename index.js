import { SidechatController } from './src/host/controller.js';
import { PROVIDER } from './src/host/background.js';
import { registerSidechatRemote } from './src/host/remote.js';

export const name = 'dsh-sidechat';
export const inject = ['subagents', 'agents', 'tools', 'typert', 'typertGateway', 'sessionController', 'skills', 'attachments', 'llm', 'permissionPresets'];

export function apply(ctx) {
  const controller = new SidechatController(ctx);
  ctx.effect(() => ctx.reflect.provide('sidechat', controller));
  ctx.effect(() => ctx.subagents.registerProvider({
    name: PROVIDER,
    inheritsParentContext: true,
    capabilities: { agentOptions: true, agentPreset: false, outputSchema: false, depthLimit: true },
    async prepareContinuable({ sessionId, signal }) {
      signal.throwIfAborted();
      const record = controller.records.get(sessionId);
      if (record === undefined || record.status === 'closing') {
        throw new Error('侧边聊天已结束。');
      }
      return { seed: record.seed };
    },
  }));
  ctx.on('agent/created', ({ agent }) => {
    controller.attachAgent(agent);
  });
  ctx.effect(() => registerSidechatRemote(ctx, controller));
  ctx.effect(() => ctx.tools.register({
    name: 'sidechat_manage',
    description: '列出、创建或结束当前主会话的临时侧边聊天，也可停止某条侧聊本轮执行。每个主会话最多 3 条；不发送聊天消息。',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'create', 'end', 'stop'], description: '要执行的侧聊管理操作。' },
        id: { type: 'string', description: 'end、stop 使用 list 或 create 返回的侧聊 ID。' },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute(args, exec) {
      exec.signal.throwIfAborted();
      if (!['list', 'create', 'end', 'stop'].includes(args.action)) {
        throw new Error('不支持的侧聊管理操作。');
      }
      return controller.execute(exec.agent, args);
    },
  }));
  ctx.effect(() => () => controller.dispose());
}
