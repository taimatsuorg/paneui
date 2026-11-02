import { ChevronDownIcon, FolderIcon } from "@paneui/ui/icons"
import { ThreadList, ThreadListGroup, ThreadListItem } from "@paneui/ui/components/thread-list-item"

const folders = [
  { name: "web-app", threads: ["Fix the drag handle", "Hide empty panes", "Split view close"] },
  { name: "docs", threads: [] },
]

export default function ThreadListItemCompact() {
  return (
    <div className="w-64 frame-3xl frame-p-2 bg-card shadow-raised">
      <ThreadList>
        <ThreadListGroup label="Projects">
          {folders.map((f) => (
            <div key={f.name} className="flex flex-col gap-px">
              <ThreadListItem size="sm" title={f.name} icon={<FolderIcon />} trailing={<ChevronDownIcon className="size-3.5 text-muted-foreground" />} />
              {f.threads.length > 0 && (
                <div className="flex flex-col gap-px ps-4">
                  {f.threads.map((t, i) => (
                    <ThreadListItem key={t} size="sm" title={t} meta={`${i + 2}h`} active={i === 0} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </ThreadListGroup>
      </ThreadList>
    </div>
  )
}
