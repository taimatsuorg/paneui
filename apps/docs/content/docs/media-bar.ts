import type { ComponentDoc } from "@/lib/doc-types"

export default {
  summary: { en: "A floating bar that controls playback or reading aloud.", zh: "控制播放或朗读的悬浮横条。" },
  usage: {
    imports: `import { MediaBar, markSpeaking } from "@/components/ui/media-bar"`,
    code: `<MediaBar playing={playing} onPlayingChange={setPlaying} onStop={stop} />`,
  },
  examples: [
    {
      id: "skip",
      title: { en: "Skip and Progress", zh: "跳转与进度" },
      description: { en: "Pass `current` and `total` for parts, and skip handlers to show the skip buttons.", zh: "传入 `current` 和 `total` 显示分段进度，传入跳转回调显示跳转按钮。" },
    },
    {
      id: "states",
      title: { en: "Status Text", zh: "状态文本" },
      description: { en: "`status` replaces the text, for a chapter or track name.", zh: "`status` 可替换文本，例如显示章节或曲目名称。" },
    },
    {
      id: "speaking",
      title: { en: "Block Being Read", zh: "正在朗读的段落" },
      description: { en: "`data-speaking` marks the block; the theme paints it.", zh: "`data-speaking` 标记段落，主题负责绘制样式。" },
    },
  ],
  notes: [
    {
      title: "Playback",
      body: {
        en: "The bar holds no player: pass `playing` and the handlers, and drive speech, audio or video yourself. The play/pause button calls `onPlayingChange` with the state it asks for; stop and skip buttons appear when their handler is set.",
        zh: "横条本身不包含播放器：传入 `playing` 和回调，自行控制语音、音频或视频。播放/暂停按钮以目标状态调用 `onPlayingChange`；设置对应回调后才显示停止和跳转按钮。",
      },
    },
    {
      title: "Placement and shape",
      body: {
        en: "The bar joins the bottom stack, centred and above a consent card. Its corners follow the control radius and the buttons inside stay concentric, so radius presets reshape it with every other control. `placement=\"inline\"` renders it in place.",
        zh: "横条加入底部堆叠，居中并位于同意卡片上方。其圆角跟随控件圆角，内部按钮保持同心，因此圆角预设会与其他控件一起改变它。`placement=\"inline\"` 则在原位置渲染。",
      },
    },
    {
      title: "Highlighting the block",
      body: {
        en: "`markSpeaking(el)` sets `data-speaking` on the block being read, clears it everywhere else and scrolls the block into view (`{ scroll: false }` skips that). The theme paints `[data-speaking]` with the accent fill, a halo and a soft ring; `markSpeaking(null)` clears it.",
        zh: "`markSpeaking(el)` 给正在朗读的段落设置 `data-speaking`，清除其他位置的标记，并把段落滚动到可见区域（`{ scroll: false }` 跳过滚动）。主题用强调填充、外延光晕和柔和描边绘制 `[data-speaking]`；`markSpeaking(null)` 清除标记。",
      },
    },
    {
      title: "Accessibility",
      body: {
        en: "The bar is a region named “Playback”. The status is a polite live region, so “Paused” is announced; progress reads as “Part 2 of 8”. Every button is named from the locale. Media glyphs never flip in right-to-left layouts.",
        zh: "横条是名为“播放控制”的区域。状态是礼貌型实时区域，因此会播报“已暂停”；进度读作“第 2 部分，共 8 部分”。每个按钮的名称都来自语言设置。媒体图标在从右到左布局中不会翻转。",
      },
    },
  ],
  api: [
    {
      name: "MediaBar",
      extends: "div",
      props: [
        { name: "playing", type: "boolean", required: true, description: { en: "Playing or paused.", zh: "正在播放或已暂停。" } },
        { name: "onPlayingChange", type: "(playing: boolean) => void", description: { en: "Called by the play/pause button.", zh: "播放/暂停按钮调用。" } },
        { name: "onStop", type: "() => void", description: { en: "Shows the stop button.", zh: "显示停止按钮。" } },
        { name: "onSkipBack", type: "() => void", description: { en: "Shows the skip back button.", zh: "显示后退按钮。" } },
        { name: "onSkipForward", type: "() => void", description: { en: "Shows the skip forward button.", zh: "显示前进按钮。" } },
        { name: "activity", type: `"reading" | "playing"`, default: `"reading"`, description: { en: "Status wording while playing.", zh: "播放时的状态措辞。" } },
        { name: "status", type: "ReactNode", description: { en: "Replaces the status text.", zh: "替换状态文本。" } },
        { name: "current", type: "number", description: { en: "Current part, from 1.", zh: "当前分段，从 1 开始。" } },
        { name: "total", type: "number", description: { en: "Number of parts.", zh: "分段总数。" } },
        { name: "placement", type: `"stack" | "inline"`, default: `"stack"`, description: { en: "Bottom stack or in place.", zh: "放入底部堆叠或原位渲染。" } },
        { name: "order", type: "number", default: "0", description: { en: "Position in the bottom stack.", zh: "在底部堆叠中的位置。" } },
      ],
      dataAttributes: [{ name: "data-state", description: { en: "`playing` or `paused`.", zh: "`playing` 或 `paused`。" } }],
    },
    {
      name: "markSpeaking",
      description: { en: "Marks the block being read with `data-speaking`.", zh: "用 `data-speaking` 标记正在朗读的段落。" },
      props: [
        { name: "el", type: "Element | null", required: true, description: { en: "The block, or `null` to clear.", zh: "段落元素，传 `null` 清除。" } },
        { name: "options.scroll", type: "boolean", default: "true", description: { en: "Scrolls the block into view.", zh: "把段落滚动到可见区域。" } },
      ],
    },
  ],
} satisfies ComponentDoc
