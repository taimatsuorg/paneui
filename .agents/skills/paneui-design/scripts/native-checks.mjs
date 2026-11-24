import { isBuiltin } from "node:module"

// AST checks for Native styles, primitive props and shared source boundaries.
// Imported styles and prop spreads remain a rendered or device review responsibility.
export function checkNativeSource(ts, sf, { native, shared, report }) {
  const imports = new Map()
  const namespaces = new Set()
  const locals = new Map()
  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
  const emit = (rule, node, message) => report(rule, sf.fileName, line(node), message)
  const visitAll = (node, visit) => { visit(node); ts.forEachChild(node, (child) => visitAll(child, visit)) }
  const name = (node) => node && (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) ? node.text : node?.getText(sf)

  const webAdapter = /\.web\.[cm]?[jt]sx?$/.test(sf.fileName)
  const scope = (node) => {
    for (let p = node.parent; p; p = p.parent) if (ts.isBlock(p) || ts.isSourceFile(p) || ts.isFunctionLike(p)) return p
    return sf
  }
  function dependency(spec, node) {
    if (shared && (isBuiltin(spec) || /^(?:react-native(?:[-/]|$)|react-dom(?:\/|$)|next(?:\/|$)|expo(?:[-/]|$)|electron(?:\/|$)|@paneui\/ui(?:-native)?(?:\/|$)|@paneui\/(?:docs|native-showcase|desktop)(?:\/|$)|.*\/apps\/)/.test(spec)))
      emit("platform-boundary", node, "Shared source cannot import a platform runtime, UI implementation or application.")
    if (native && !webAdapter && (isBuiltin(spec) || /^(?:react-native-web(?:\/|$)|react-dom(?:\/|$)|next(?:\/|$)|electron(?:\/|$)|@paneui\/ui(?:\/|$))/.test(spec)))
      emit("platform-boundary", node, "Native source cannot import a Web or server runtime; use an explicit platform adapter.")
  }
  visitAll(sf, (node) => {
    if ((ts.isVariableDeclaration(node) || ts.isParameter(node)) && ts.isIdentifier(node.name)) {
      const declarations = locals.get(node.name.text) ?? []
      declarations.push({ initializer: node.initializer, scope: scope(node) })
      locals.set(node.name.text, declarations)
    }
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) dependency(node.moduleSpecifier.text, node)
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(sf) === "require") && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) dependency(node.arguments[0].text, node)
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier) || node.moduleSpecifier.text !== "react-native") return
    const bindings = node.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) imports.set(item.name.text, (item.propertyName ?? item.name).text)
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text)
  })
  function binding(identifier) {
    const candidates = locals.get(identifier.text) ?? []
    for (let p = identifier.parent; p; p = p.parent) {
      const candidate = candidates.findLast((candidate) => candidate.scope === p)
      if (candidate) return candidate
    }
    return null
  }
  if (!native && !shared) return
  const primitive = (text) => imports.get(text) ?? (namespaces.has(text.split(".")[0]) ? text.split(".")[1] : null)
  function resolve(node, seen = new Set()) {
    if (!node || seen.has(node)) return node
    seen.add(node)
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return resolve(node.expression, seen)
    if (ts.isIdentifier(node)) { const local = binding(node); if (local) return local.initializer ? resolve(local.initializer, seen) : node }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "create" && primitive(node.expression.expression.getText(sf)) === "StyleSheet") return resolve(node.arguments[0], seen)
    if (ts.isPropertyAccessExpression(node)) {
      const object = resolve(node.expression, seen)
      if (object && ts.isObjectLiteralExpression(object)) {
        const property = object.properties.find((p) => ts.isPropertyAssignment(p) && name(p.name) === node.name.text)
        if (property) return resolve(property.initializer, seen)
      }
    }
    return node
  }
  const number = (node) => { const value = resolve(node); return value && ts.isNumericLiteral(value) ? Number(value.text) : null }
  const colorProperties = new Set(["color", "backgroundColor", "borderColor", "borderTopColor", "borderBottomColor", "borderStartColor", "borderEndColor", "shadowColor", "tintColor", "placeholderTextColor", "selectionColor", "fill", "stroke"])
  function literalColor(node) {
    const value = resolve(node)
    if (!value) return false
    if (ts.isConditionalExpression(value)) return literalColor(value.whenTrue) || literalColor(value.whenFalse)
    if (ts.isBinaryExpression(value) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(value.operatorToken.kind)) return literalColor(value.left) || literalColor(value.right)
    return ts.isStringLiteralLike(value) && value.text !== "transparent"
  }
  function expression(attribute) {
    return attribute?.initializer && ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : attribute?.initializer
  }
  function validAttribute(attribute) {
    const value = resolve(expression(attribute))
    return !!attribute && (!value || !(ts.isStringLiteralLike(value) && !value.text.trim()) && value.kind !== ts.SyntaxKind.FalseKeyword && value.kind !== ts.SyntaxKind.NullKeyword && value.getText(sf) !== "undefined")
  }
  visitAll(sf, (node) => {
    if ((shared || native && !webAdapter) && ts.isIdentifier(node) && ["window", "document", "localStorage", "sessionStorage"].includes(node.text)) {
      if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node && node.parent.expression.getText(sf) !== "globalThis" || ts.isPropertyAssignment(node.parent) && node.parent.name === node || binding(node)) return
      if (ts.isImportSpecifier(node.parent) || ts.isVariableDeclaration(node.parent) && node.parent.name === node) return
      emit("platform-boundary", node, "Browser globals belong in an explicit Web adapter, outside shared and Native source.")
    }
    if (!native) return
    if (ts.isPropertyAssignment(node)) {
      const property = name(node.name)
      if (colorProperties.has(property) && literalColor(node.initializer)) emit("native-colors", node, "Read Native colours from semantic theme tokens; only transparent stays literal.")
      if (/^border.*Radius$/.test(property ?? "")) {
        const value = number(node.initializer)
        if (value !== null && value > 16) emit("native-radius", node, "Native radius exceeds 16px; use a shared radius token or a component's circle treatment.")
      }
    }
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return
    const tag = primitive(node.tagName.getText(sf))
    const attributes = node.attributes.properties
    const attr = (key) => attributes.find((a) => ts.isJsxAttribute(a) && name(a.name) === key)
    const spread = attributes.some(ts.isJsxSpreadAttribute)
    for (const property of colorProperties) if (attr(property) && literalColor(expression(attr(property)))) emit("native-colors", attr(property), "Use a semantic theme colour for this Native prop.")
    if (["Text", "TextInput"].includes(tag)) {
      const scale = resolve(expression(attr("allowFontScaling")))
      if (scale?.kind === ts.SyntaxKind.FalseKeyword) emit("native-font-scaling", attr("allowFontScaling"), "Keep system font scaling enabled and let the layout grow.")
    }
    if (!["Pressable", "TouchableOpacity", "TouchableHighlight", "TouchableWithoutFeedback", "TextInput"].includes(tag)) return
    const labelled = ["accessibilityLabel", "accessibilityLabelledBy", "aria-label", "aria-labelledby"].some((key) => validAttribute(attr(key)))
    if (!spread && tag === "TextInput" && !labelled) emit("native-accessibility", node, "A Native field needs an accessible name.")
    if (!spread && tag !== "TextInput") {
      if (!["accessibilityRole", "role"].some((key) => validAttribute(attr(key)))) emit("native-accessibility", node, "An interactive Native primitive needs an accessibility role.")
      const children = ts.isJsxOpeningElement(node) ? node.parent.children : []
      const text = children.some((child) => ts.isJsxText(child) ? child.text.trim() : ts.isJsxExpression(child) ? !!child.expression : ts.isJsxElement(child) && primitive(child.openingElement.tagName.getText(sf)) === "Text")
      if (!labelled && !text) emit("native-accessibility", node, "An icon-only Native control needs an accessible name.")
    }
    const style = resolve(expression(attr("style")))
    if (!style) return
    const hitSlop = resolve(expression(attr("hitSlop")))
    const extent = (axis) => {
      if (!hitSlop) return 0
      const all = number(hitSlop)
      if (all !== null) return all * 2
      if (!ts.isObjectLiteralExpression(hitSlop)) return 0
      return (axis === "height" ? ["top", "bottom"] : ["left", "right"]).reduce((sum, key) => {
        const p = hitSlop.properties.find((p) => ts.isPropertyAssignment(p) && name(p.name) === key)
        return sum + (p ? number(p.initializer) ?? 0 : 0)
      }, 0)
    }
    const seen = new Set()
    function inspectStyle(value) {
      value = resolve(value)
      if (!value || seen.has(value)) return
      seen.add(value)
      if (ts.isPropertyAssignment(value) && ["height", "width"].includes(name(value.name))) {
        const size = number(value.initializer)
        const axis = /Height|height/.test(name(value.name)) ? "height" : "width"
        if (size !== null && size + extent(axis) < 44) emit("native-touch-target", value, "Native controls need a 44px minimum effective target; verify hit slop and neighbouring bounds.")
      }
      ts.forEachChild(value, inspectStyle)
    }
    inspectStyle(style)
  })
}
