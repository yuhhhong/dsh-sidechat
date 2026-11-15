const PACKAGE = 'dsh-sidechat';
const ACTIONS = ['list', 'create', 'catalog', 'upload', 'send', 'selectModel', 'selectPermission', 'end', 'stop'];
const selectionSchema = {
  type: 'object', additionalProperties: false, required: ['provider', 'model'],
  properties: {
    provider: { type: 'string', minLength: 1, description: '模型提供方。' },
    model: { type: 'string', minLength: 1, description: '模型标识。' },
    reasoningEffort: { type: 'string', minLength: 1, description: '思考强度；省略时使用模型默认值。' },
  },
};
const fieldsByAction = {
  list: ['action'], create: ['action'],
  catalog: ['action', 'id'], upload: ['action', 'id', 'name', 'mediaType', 'data'],
  send: ['action', 'id', 'text', 'attachments', 'selection', 'delivery', 'requestId', 'clientTimeZone'],
  selectModel: ['action', 'id', 'selection'], selectPermission: ['action', 'id', 'permission'], end: ['action', 'id'], stop: ['action', 'id'],
};

export const requestSchema = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ACTIONS, description: '侧聊操作。' },
    id: { type: 'string', minLength: 1, description: '侧聊身份。' },
    text: { type: 'string', description: '用户问题，允许仅发送附件。' },
    attachments: { type: 'array', uniqueItems: true, items: { type: 'string', minLength: 1 }, description: '当前侧聊上传接口返回的附件标识。' },
    selection: { ...selectionSchema, description: '本次选择的模型及思考强度。' },
    permission: { type: 'string', minLength: 1, description: '当前侧聊选择的宿主权限预设。' },
    delivery: { type: 'string', enum: ['queue', 'steer'], description: '续聊入队或引导当前回答。' },
    requestId: { type: 'string', minLength: 1, description: '调用方生成的消息请求标识，重复提交同一内容只接纳一次。' },
    clientTimeZone: { type: 'string', minLength: 1, description: '发送消息时的浏览器时区。' },
    name: { type: 'string', minLength: 1, description: '上传文件原始名称。' },
    mediaType: { type: 'string', minLength: 1, description: '上传文件 MIME 类型。' },
    data: { type: 'string', description: '原始文件的标准 Base64 编码，不含 data URL 前缀。' },
  },
  required: ['action'],
  additionalProperties: false,
};

export function parseRequest(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || !ACTIONS.includes(value.action)) {
    throw new TypeError('侧聊请求需要有效的 action。');
  }
  for (const [key, field] of Object.entries(value)) {
    if (!fieldsByAction[value.action].includes(key)) {
      throw new TypeError('侧聊请求包含未知字段或当前操作不支持的字段。');
    }
    if (key !== 'attachments' && key !== 'selection' && typeof field !== 'string') {
      throw new TypeError('侧聊请求字段类型无效。');
    }
    if (key !== 'text' && key !== 'data' && typeof field === 'string' && field.length === 0) {
      throw new TypeError('侧聊请求字段不能为空。');
    }
  }
  if (!['list', 'create'].includes(value.action) && !value.id) {
    throw new TypeError('该侧聊操作需要 id。');
  }
  if (value.attachments !== undefined && (!Array.isArray(value.attachments) || value.attachments.some((id) => typeof id !== 'string' || id.length === 0) || new Set(value.attachments).size !== value.attachments.length)) {
    throw new TypeError('附件必须是互不重复的上传标识列表。');
  }
  if (value.selection !== undefined) {
    const selection = value.selection;
    if (selection === null || typeof selection !== 'object' || Array.isArray(selection) || typeof selection.provider !== 'string' || !selection.provider || typeof selection.model !== 'string' || !selection.model) {
      throw new TypeError('模型选择需要 provider 与 model。');
    }
    for (const [key, field] of Object.entries(selection)) {
      if (!Object.hasOwn(selectionSchema.properties, key) || typeof field !== 'string' || !field) {
        throw new TypeError('模型选择包含未知字段或无效值。');
      }
    }
  }
  if (value.action === 'selectModel' && value.selection === undefined) {
    throw new TypeError('切换模型需要 selection。');
  }
  if (value.action === 'selectPermission' && value.permission === undefined) {
    throw new TypeError('切换权限需要 permission。');
  }
  if (value.delivery !== undefined && !['queue', 'steer'].includes(value.delivery)) {
    throw new TypeError('消息投递方式需要 queue 或 steer。');
  }
  if (value.action === 'upload' && (typeof value.name !== 'string' || !value.name || typeof value.mediaType !== 'string' || !value.mediaType || typeof value.data !== 'string')) {
    throw new TypeError('上传需要 name、mediaType 与 Base64 data。');
  }
  if (value.action === 'send' && !(value.text ?? '').trim() && (value.attachments ?? []).length === 0) {
    throw new TypeError('请先输入侧聊问题或添加附件。');
  }
  return value;
}

function codec(typeSymbol, jsonSchema, parse) {
  return { mode: 'strict', typeSymbol, jsonSchema, create: () => ({ parse }) };
}

export function sidechatContribution() {
  return {
    package: PACKAGE,
    face: 'host',
    schemas: [],
    model: {
      services: [{
        key: 'sidechat',
        exportName: 'SidechatController',
        description: '侧聊管理与独立界面通信；不创建会话命令记录。',
        tags: [],
        members: [{ kind: 'method', name: 'execute', signature: 'execute(agent: Agent, input: SidechatRequest, signal?: AbortSignal): Promise<SidechatState>' }],
        types: [{ name: 'SidechatRequest', declaration: "export interface SidechatRequest { action: 'list' | 'create' | 'catalog' | 'upload' | 'send' | 'selectModel' | 'selectPermission' | 'end' | 'stop'; id?: string; text?: string; attachments?: string[]; selection?: { provider: string; model: string; reasoningEffort?: string }; permission?: string; delivery?: 'queue' | 'steer'; requestId?: string; clientTimeZone?: string; name?: string; mediaType?: string; data?: string }" }],
      }],
      events: [],
      objects: [],
    },
    invocations: [{
      id: `${PACKAGE}#sidechat/execute`,
      service: 'sidechat',
      namespace: 'sidechat',
      method: 'execute',
      invocation: { kind: 'direct' },
      scope: { context: 'agent', wire: 'agentId' },
      parameters: [
        {
          name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent',
          codec: codec('@deepseek-ai/dsh-session/types#SessionId', { type: 'string' }, (value) => {
            if (typeof value !== 'string' || value.length === 0) {
              throw new TypeError('需要主会话身份。');
            }
            return value;
          }),
        },
        { name: 'input', wire: 'input', source: 'json', codec: codec(`${PACKAGE}#SidechatRequest`, requestSchema, parseRequest) },
      ],
      cancellation: { parameter: 'signal' },
      result: codec(`${PACKAGE}#SidechatState`, { type: 'object', additionalProperties: true }, (value) => value),
    }],
  };
}

export function registerSidechatRemote(ctx, controller) {
  // 与宿主 Remote 服务采用相同的绑定身份；参数查找和资源授权由网关完成。
  controller.typertRemote = { service: controller, serviceKey: 'sidechat', namespace: 'sidechat' };
  return ctx.typert.register(sidechatContribution());
}
