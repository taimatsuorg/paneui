import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { test } from "node:test"

import { checkNativeSource } from "./native-checks.mjs"

const require = createRequire(import.meta.url)
let ts
try { ts = require("typescript") } catch { /* AST tests need the optional parser. */ }
function check(source, options = {}, file = "control.tsx") {
  const findings = []
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  checkNativeSource(ts, sf, { native: true, shared: false, ...options, report: (rule) => findings.push(rule) })
  return findings
}
const run = (name, fn) => test(name, { skip: !ts && "TypeScript parser unavailable" }, fn)

run("resolves aliased primitives and local style objects", () => {
  assert.deepEqual(check('import { Pressable as P, StyleSheet as S } from "react-native"; const s = S.create({ small: { height: 24 } }); const x = <P style={s.small} accessibilityRole="button" accessibilityLabel="Open" />'), ["native-touch-target"])
})
run("keeps shadowed styles and small decorative views out of touch findings", () => {
  assert.deepEqual(check('import { Pressable, View } from "react-native"; const s={height:20}; function Render(){ const s={height:48}; return <Pressable style={s} accessibilityRole="button" accessibilityLabel="Open"><View style={{height:16}} /></Pressable> }'), [])
})
run("accepts sufficient explicit hit slop and leaves imported styles for review", () => {
  assert.deepEqual(check('import * as N from "react-native"; import { external } from "./styles"; const x = <N.Pressable style={{height:32,width:32}} hitSlop={6} accessibilityRole="button" accessibilityLabel="Open" />; const y = <N.Pressable {...external} />'), [])
})
run("rejects literal fallback colours and font scaling aliases", () => {
  assert.deepEqual(check('import {Text as Label} from "react-native"; const scale=false; const x=<Label allowFontScaling={scale} style={{color:enabled ? colors.primary : "red"}}>Hello</Label>'), ["native-font-scaling", "native-colors"])
})
run("checks exports, dynamic dependencies and browser globals in shared source", () => {
  assert.equal(check('export {View} from "react-native"; const x=import("fs"); const y=globalThis.document;', {native:false,shared:true}).filter((rule)=>rule==="platform-boundary").length, 3)
})
run("does not classify local aliases or flexible minimum widths as platform violations", () => {
  assert.deepEqual(check('import { Pressable } from "react-native"; import { styles } from "@/styles"; const x=<Pressable style={{minWidth:0}} accessibilityRole="button" accessibilityLabel="Open" />'), [])
  assert.equal(check('import "react-native-web"; import "expo-file-system";', {native:false,shared:true}).length, 2)
})
run("permits browser adapters and avoids claiming prop-spread coverage", () => {
  assert.deepEqual(check('import {createRoot} from "react-dom/client"; const x=window.location;'), ["platform-boundary", "platform-boundary"])
  assert.deepEqual(check('import {createRoot} from "react-dom/client"; const x=window.location;', {}, "link.web.tsx"), [])
})
