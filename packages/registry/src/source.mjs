/** Convert workspace source locations to stable registry installation paths. */
export function publishPath(file) {
  return file
    .replace(/^packages\/ui\/src\/components\//, "registry/web/ui/")
    .replace(/^packages\/ui\/src\/blocks\//, "registry/web/blocks/")
    .replace(/^packages\/ui\/src\/icons\/index\.tsx$/, "components/icons.tsx")
    .replace(/^packages\/ui\/src\/icons\//, "registry/web/icons/")
    .replace(/^packages\/ui\/src\/lib\//, "lib/")
    .replace(/^packages\/core\/src\//, "lib/")
    .replace(/^packages\/tokens\/styles\//, "app/")
    .replace(/^packages\/registry\/files\//, "registry/web/")
    .replace(/^apps\/docs\/registry\//, "registry/web/")
    .replace(/^\.agents\/skills\//, "skills/")
}

/** Workspace package names must never become dependencies of installed source. */
export function publishSource(source) {
  return source
    .replaceAll("@paneui/ui/components/", "@/registry/web/ui/")
    .replaceAll("@paneui/ui/blocks/", "@/registry/web/blocks/")
    .replaceAll("@paneui/ui/icons/", "@/registry/web/icons/")
    .replace(/@paneui\/ui\/icons(?=["'])/g, "@/components/icons")
    .replaceAll("@paneui/ui/lib/", "@/lib/")
    .replaceAll("@paneui/core/control-size", "@/lib/control-size")
    .replaceAll("@/registry/templates/", "@/registry/web/templates/")
    .replaceAll("@/registry/examples/", "@/registry/web/examples/")
}
