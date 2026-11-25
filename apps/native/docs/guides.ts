export type GuideSection = {
  id: string;
  title: [string, string];
  body: [string, string];
  code?: string;
};
export type Guide = {
  slug: string;
  title: [string, string];
  lede: [string, string];
  sections: GuideSection[];
};
export const guides: Guide[] = [
  {
    slug: "introduction",
    title: ["Introduction", "简介"],
    lede: [
      "Build apps with shared design values.",
      "用统一的设计语言构建应用。",
    ],
    sections: [
      {
        id: "overview",
        title: ["Made for your app", "为应用而建"],
        body: [
          "Compose screens with Native components that share the same colours, spacing and type hierarchy as the web library. Each example runs with the current theme.",
          "使用原生组件组合页面，与网页组件共享颜色、间距和文字层级。每个示例都跟随当前主题。",
        ],
      },
      {
        id: "start",
        title: ["Start building", "开始构建"],
        body: [
          "Install the packages, wrap your app in ThemeProvider, then choose a component from the sidebar. The component pages include live examples and their source.",
          "安装依赖，用 ThemeProvider 包裹应用，然后从侧栏选择组件。组件页面提供可操作的示例和源码。",
        ],
      },
      {
        id: "platforms",
        title: ["One system across platforms", "跨平台的设计体系"],
        body: [
          "Use the browser previews to explore components. Check touch, safe areas, keyboard behaviour and screen readers on your target device before shipping.",
          "在浏览器中探索组件。发布前，请在目标设备上检查触控、安全区域、键盘和屏幕阅读器。",
        ],
      },
    ],
  },
  {
    slug: "installation",
    title: ["Installation", "安装"],
    lede: ["Add the packages and set up your theme.", "安装依赖并配置主题。"],
    sections: [
      {
        id: "packages",
        title: ["Install packages", "安装依赖"],
        body: [
          "Add your app to this workspace, then link the Native library and shared tokens. These packages are not published separately yet.",
          "将应用加入此工作区，然后链接原生组件库与共享令牌。这些包目前尚未单独发布。",
        ],
        code: "pnpm add @paneui/ui-native@workspace:* @paneui/tokens@workspace:*\npnpm exec expo install react-native-safe-area-context",
      },
      {
        id: "provider",
        title: ["Set up the provider", "配置主题提供者"],
        body: [
          "Wrap the root of your app in ThemeProvider. Omit mode to follow the system, or pass light or dark to choose a theme.",
          "用 ThemeProvider 包裹应用根节点。省略 mode 以跟随系统，或传入 light、dark 指定主题。",
        ],
        code: 'import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"\nimport { Button, ThemeProvider } from "@paneui/ui-native"\n\nexport default function App() {\n  return (\n    <SafeAreaProvider>\n      <ThemeProvider>\n        <SafeAreaView>\n          <Button onPress={() => {}}>Continue</Button>\n        </SafeAreaView>\n      </ThemeProvider>\n    </SafeAreaProvider>\n  )\n}',
      },
      {
        id: "compose",
        title: ["Compose a screen", "组合页面"],
        body: [
          "Import components from @paneui/ui-native and spacing from @paneui/tokens. Put spacing on the parent view and choose component variants for appearance.",
          "从 @paneui/ui-native 导入组件，从 @paneui/tokens 导入间距。通过父视图设置间距，通过组件变体设置外观。",
        ],
      },
    ],
  },
  {
    slug: "theming",
    title: ["Theming", "主题"],
    lede: [
      "Keep colours and spacing consistent across screens.",
      "让页面使用一致的颜色与间距。",
    ],
    sections: [
      {
        id: "modes",
        title: ["Light and dark", "浅色与深色"],
        body: [
          "ThemeProvider follows the system when mode is omitted. Use useTheme to read the resolved scheme and semantic colours. The header preference is saved in this browser.",
          "省略 mode 时，ThemeProvider 跟随系统。使用 useTheme 读取当前模式及语义颜色。页眉中的偏好设置会保存在当前浏览器。",
        ],
        code: 'import { View } from "react-native"\nimport { Text, useTheme } from "@paneui/ui-native"\nimport { spacing } from "@paneui/tokens"\n\nexport function Screen() {\n  const { colors } = useTheme()\n  return (\n    <View style={{ backgroundColor: colors.background, padding: spacing.xl }}>\n      <Text>Your workspace</Text>\n    </View>\n  )\n}',
      },
      {
        id: "tokens",
        title: ["Design tokens", "设计令牌"],
        body: [
          "Use semantic roles such as background, foreground, primary and border. Read radius, controlRadius, headingFont and shadows from useTheme. Spacing and typography come from the token package. Keep generated colours in sync with the shared theme.",
          "使用 background、foreground、primary、border 等语义角色。通过 useTheme 读取 radius、controlRadius、headingFont 和 shadows。间距与文字规格来自令牌包。生成的颜色应与共享主题保持同步。",
        ],
      },
      {
        id: "accent",
        title: ["Accent colour", "强调色"],
        body: [
          "Primary roles carry the accent on actions and selected controls. Native currently ships the shared default accent. ThemeProvider accepts mode and headingFont; it does not expose an accent override.",
          "primary 角色为操作及选中的控件提供强调色。原生组件目前使用共享的默认强调色。ThemeProvider 支持 mode 和 headingFont，尚不提供强调色覆盖接口。",
        ],
      },
    ],
  },
  {
    slug: "platform-notes",
    title: ["Platform notes", "平台说明"],
    lede: [
      "Check the interactions that differ across devices.",
      "检查不同设备上的交互差异。",
    ],
    sections: [
      {
        id: "ios",
        title: ["iOS", "iOS"],
        body: [
          "Keep content inside safe areas and move fields above the keyboard. Check larger text sizes and screen-reader focus on a device. Native controls keep touch targets at least 44 points tall.",
          "内容应位于安全区域内，输入框应避开键盘。请在设备上检查大字号及屏幕阅读器焦点。原生控件触控目标至少为 44 点。",
        ],
      },
      {
        id: "android",
        title: ["Android", "Android"],
        body: [
          "Check the system back action when an overlay is open. Test keyboard resize, font scaling and accessibility announcements on your supported devices.",
          "浮层打开时，请检查系统返回操作。在支持的设备上测试键盘引起的布局变化、字体缩放及无障碍播报。",
        ],
      },
      {
        id: "web",
        title: ["Browser", "浏览器"],
        body: [
          "Previews render the Native components in the browser. Use Tab to check focus and test narrow layouts. Browser previews do not replace device checks of gestures, keyboards or screen readers.",
          "预览在浏览器中渲染原生组件。使用 Tab 检查焦点，并测试窄屏布局。浏览器预览不能代替设备上的手势、键盘或屏幕阅读器检查。",
        ],
      },
    ],
  },
];
