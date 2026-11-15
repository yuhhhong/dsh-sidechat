# dsh-sidechat

[中文](<./README.md>) | English

A side chat plugin for DeepSeek Harness (DSH). It opens temporary side conversations in the right sidebar with a snapshot of the main conversation's background, so you can investigate questions, clarify details, or explore tangents without adding the discussion process to the main conversation context.

## Key Features

- **Background snapshot and context isolation**: Captures a snapshot of the main conversation up to the latest completed turn when opened. Later progress in the main conversation is not automatically synced, and side chat replies or completion notices are not sent back to the main conversation.
- **On-demand managed subagents**: Runs each side chat on a DSH-managed continuable subagent. Opening a blank tab only saves the background snapshot and settings; the subagent is started only when you send the first message. Collapsing the sidebar or switching conversations keeps active side chats running.
- **Native-style unified composer**: Uses the same composer for the first question and follow-up turns, with support for file uploads, pasted images, `/` skill search and invocation, permission presets, model selection, and reasoning effort.
- **Live permission and model switching**: Switch permission presets, models, and reasoning effort before the first message or while a response is running. Permission changes apply to subsequent tool calls in that side chat, while model and reasoning effort changes take effect on the next model execution step without interrupting in-flight work.
- **Prompt-defined execution boundaries**: Uses boundary instructions to treat inherited history as reference context only rather than active tasks. By default, the assistant performs non-mutating exploration, avoids interacting with subagents, and requires explicit user requests in the side chat before modifying state or messaging the main conversation.
- **Lifecycle cleanup and catalog filtering**: Reconnects active side chats and sent messages across page refreshes within the same DSH run, and does not reopen old side chat tabs after restarting DSH. Closing a tab with `×` stops pending work, releases subagent capacity, and hides the finished entry from the header **子智能体** (Subagents) catalog.

## Installation

Install from GitHub in the DSH web profile:

```sh
dsh plugin --profile web add github:yuhhhong/dsh-sidechat
```

You can also install this directory from **插件 → 添加插件** (Plugins → Add plugin) in DSH. After installation, restart DSH and refresh the DSH page.

To uninstall:

```sh
dsh plugin --profile web remove dsh-sidechat
```

The current plugin version is `0.1.13`. The supported DSH version range is `>=0.2.2-rc.2 <0.3.0-0`.

## Usage

1. In a main conversation, open the **开始** (Start) page in the right sidebar and click **新建侧边聊天** (New side chat).
2. Enter a question, upload files or paste images, type `/` to select a skill, or adjust the permission preset, model, and reasoning effort. A blank tab starts its managed subagent only when the first message is sent.
3. While the assistant is replying, you can queue follow-up messages, stop the current turn, or switch permissions, models, and reasoning effort.
4. When finished, click `×` on the side chat tab to close it and release subagent capacity. If cleanup fails, the tab reopens and displays the error.

## Subagent Capacity and Behavior

> **侧聊会占用子代理名额，用完请及时关闭。**
> (Side chats consume subagent capacity. Close them when finished.)

- **Per-conversation limit**: Each main conversation can keep at most **3 open side chats** (including tabs being created or closed). The area below the composer displays the capacity reminder and the current count (for example, `侧聊 2/3`).
- **Shared host quota**: Active side chats share the host's subagent quota with other tasks in the same subagent tree. Even with fewer than 3 side chats open, host capacity may already be occupied by other subagents.
- **Residency and release**: To prevent DSH from automatically delivering completion notices back to the main conversation when a turn ends, an activated side chat keeps its managed instance resident while the tab remains open. Collapsing the sidebar, switching tabs, switching main conversations, or stopping the current turn does not release subagent capacity; click `×` on the tab to close and clean it up.
- **Tab naming**: Each tab keeps its initial name **侧边聊天 n** (`n` is the number of open side chats in the main conversation plus one at creation time). Existing tabs are not renumbered, and sending messages or changing subsession titles does not rename the tab.
- **Drafts and recovery**: Refreshing the page restores the side chat identity and sent messages for the current DSH run. Unsent text and attachment drafts are kept in memory for the current page session across tab switches.
- **Logs and catalog**: The header **子智能体** (Subagents) catalog lists open side chats and hides them once they are closed and cleaned up. Host session logs are retained on disk and remain searchable under the host's default history rules.

## Local Development

Run syntax checks and tests:

```sh
npm run check
npm test
```

After changing Host or client files, exit and restart DSH to republish and reload the plugin. Restarting DSH ends temporary side chats from the previous run.

| File | Purpose |
| --- | --- |
| [index.js](<./index.js>) | Host plugin entry; registers the subagent provider, Remote endpoints, and the `sidechat_manage` tool |
| [client.js](<./client.js>) | Web client entry; manages right-sidebar tabs, history boundary clipping, the unified composer, and subagent catalog filtering |
| [src/host/controller.js](<./src/host/controller.js>) | Side chat state management, managed subagent lifecycle, model/permission switching, and context leases |
| [src/host/background.js](<./src/host/background.js>) | Main conversation background snapshot capture and boundary prompt generation |
| [src/host/input.js](<./src/host/input.js>) | Model validation, file and image upload staging, and continuation content preparation |
| [src/host/remote.js](<./src/host/remote.js>) | Typert Remote contract and request validation |
| [cordis.patch.yml](<./cordis.patch.yml>) | DSH bundle patch configuration |

## License

Licensed under the MIT License. Copyright (c) 2026 yu.
