import { randomUUID } from 'node:crypto';

export function currentSelection(record, child) {
  const selection = child?.model.current() ?? record.selection;
  return selection === undefined ? null : { ...selection };
}

export async function validateSelection(ctx, selection, signal) {
  if (!ctx.llm.listProviders().some((provider) => provider.id === selection.provider)) {
    throw new Error('所选模型提供方当前不可用。');
  }
  const models = await ctx.llm.listModels(selection.provider);
  if (!models.some((model) => model.id === selection.model)) {
    throw new Error('所选模型当前不可用。');
  }
  await ctx.llm.resolveCallConfig(selection, signal);
  return { ...selection };
}

export function sameSelection(left, right) {
  return left?.provider === right?.provider && left?.model === right?.model && left?.reasoningEffort === right?.reasoningEffort;
}

export async function storeUpload(ctx, record, input, signal) {
  signal.throwIfAborted();
  let stored;
  if (input.mediaType.startsWith('image/')) {
    const [part] = await ctx.attachments.admitPromptContent([{ type: 'image', data: input.data, mediaType: input.mediaType, name: input.name }]);
    stored = { kind: 'image', ref: part.attachment, encodedBytes: Buffer.byteLength(input.data, 'base64') };
  } else {
    const ref = await ctx.attachments.admitEncodedFile({ data: input.data, name: input.name });
    stored = { kind: 'file', ref };
  }
  signal.throwIfAborted();
  const id = randomUUID();
  record.uploads.set(id, stored);
  const { name, bytes, mediaType, width, height } = stored.ref;
  return { id, kind: stored.kind, name, bytes, ...(mediaType === undefined ? {} : { mediaType, width, height }) };
}

export async function prepareContent(ctx, record, input, signal) {
  const uploads = (input.attachments ?? []).map((id) => {
    const upload = record.uploads.get(id);
    if (upload === undefined) {
      throw new Error('附件已失效或不属于当前侧聊，请重新上传。');
    }
    return upload;
  });
  const text = [input.text ?? '', ...uploads.filter((upload) => upload.kind === 'file').map((upload) => ctx.llm.fileRequestText(upload.ref))].filter((part) => part !== '').join('\n\n');
  const images = uploads.filter((upload) => upload.kind === 'image');
  const admitted = await ctx.attachments.admitPromptContent(images.map((upload) => ({ type: 'image', attachment: upload.ref, encodedBytes: upload.encodedBytes })));
  signal.throwIfAborted();
  const content = [...(text === '' ? [] : [{ type: 'text', text }]), ...admitted];
  return { content, images };
}

export async function continuationContent(ctx, content, signal) {
  return Promise.all(content.map(async (part) => {
    if (part.type !== 'image') {
      return part;
    }
    const stored = await ctx.attachments.readImage(part.attachment, signal);
    return { type: 'image', mediaType: stored.ref.mediaType, data: Buffer.from(stored.data).toString('base64'), ...(stored.ref.name === undefined ? {} : { name: stored.ref.name }) };
  }));
}
