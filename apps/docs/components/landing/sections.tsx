"use client"

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@paneui/ui/components/accordion"
import { useT, type Localized } from "@/lib/site-locale"

import { FRAME } from "./landing-chrome"

const FAQ: { q: Localized; a: Localized }[] = [
  {
    q: { en: "Is it a package I install?", zh: "它是一个需要安装的包吗？" },
    a: { en: "No. The CLI copies each component's source into your project.", zh: "不是。CLI 会把每个组件的源码复制进你的项目。" },
  },
  {
    q: { en: "What do I need?", zh: "需要什么环境？" },
    a: { en: "A React 19 project with Tailwind CSS 4.", zh: "一个使用 Tailwind CSS 4 的 React 19 项目。" },
  },
  {
    q: { en: "Can I change the theme?", zh: "可以修改主题吗？" },
    a: { en: "Yes. Accent, radius and every colour are CSS variables in one theme file.", zh: "可以。主题色、圆角和所有颜色都是同一个主题文件里的 CSS 变量。" },
  },
  {
    q: { en: "Is it accessible?", zh: "支持无障碍吗？" },
    a: { en: "Roles, states, labels and keyboard support come with every interactive component.", zh: "每个交互组件都带有角色、状态、标签和键盘支持。" },
  },
  {
    q: { en: "What does it cost?", zh: "需要付费吗？" },
    a: { en: "Nothing. It is MIT licensed.", zh: "免费，MIT 许可。" },
  },
]

/** Questions as a two-part row: the heading holds its place on the left while the answers run on the right. */
export function Faq() {
  const t = useT()
  return (
    <section aria-labelledby="faq-title" className={`${FRAME} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10`}>
      <div className="lg:col-span-5">
        <h2 id="faq-title" className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:sticky lg:top-24">
          {t({ en: "Frequently asked questions", zh: "常见问题" })}
        </h2>
      </div>
      <Accordion variant="ghost" className="lg:col-span-7">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{t(f.q)}</AccordionTrigger>
            <AccordionPanel>{t(f.a)}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
