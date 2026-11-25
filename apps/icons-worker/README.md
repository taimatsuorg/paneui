# PaneUI Icons Web & MCP Worker

Cloudflare Worker serving the standalone public Web UI (`https://icons.paneui.dev/`) via Worker Static Assets, alongside the live icon catalog REST API (`/api/icons`) and Streamable HTTP MCP server (`/mcp`) backed by Cloudflare D1.

## Architecture

- **100% Cloud D1 Storage**: All icons (`icons` table) and mutation logs (`icon_events` table) reside in Cloudflare D1 (`paneui-icons`, `e10f6316-80d7-49f1-9973-aaacf9463aa6`). Neither the Worker bundle nor the static web bundle embeds the icon catalog JSON.
- **Standalone Gallery UI**: Served from Cloudflare Worker Static Assets (`web/`) on `https://icons.paneui.dev/`, fetching `/api/icons` live from D1.

## Endpoints

| Method & Path | Auth | Description |
| --- | --- | --- |
| `GET /` | Public | Standalone public Icons Web UI (Static Assets) |
| `GET /health` | Public | Worker status, live cloud D1 icon count, D1 binding state |
| `GET /api/icons?q=&category=&variant=` | Public | Cloud D1 icon list with categories, stats, and recent events |
| `GET /api/feed` | Public | Recent `add` / `update` / `delete` activity and catalog stats |
| `GET /api/icons/:name` | Public | Single icon metadata, SVG, and JSX from D1 |
| `POST /api/icons` | Bearer token | Add or update a sanitized 24×24 SVG icon in D1 |
| `DELETE /api/icons/:name` | Bearer token | Remove an icon from D1 |
| `POST /mcp` | Public read / Bearer write | Streamable HTTP JSON-RPC 2.0 MCP endpoint (`2025-03-26`) |

### MCP Tools

- **Public read tools**: `search_icons`, `get_icon`, `list_categories`
- **Bearer write tools** (`Authorization: Bearer <ICON_MCP_WRITE_TOKEN>`): `add_icon`, `update_icon`, `delete_icon`

All uploaded SVGs pass `src/svg-sanitize.ts`, allowing safe 24×24 primitives (`path`, `circle`, `rect`, `ellipse`, `line`, `polyline`, `polygon`) with `currentColor` or `none` fills/strokes and blocking scripts, event attributes, filters, masks, or raw colour hex codes.

## Deployment (`cf` CLI)

1. Refresh the built-in seed catalog from `packages/ui/src/icons/index.tsx`:

   ```bash
   pnpm icons:catalog
   ```

2. Apply D1 migrations and seed the cloud catalog (D1 database `paneui-icons`: `e10f6316-80d7-49f1-9973-aaacf9463aa6`):

   ```bash
   cd apps/icons-worker
   CLOUDFLARE_ACCOUNT_ID=74550e1c7a5a36e9cb05c5ad681add98 cf d1 migrations apply e10f6316-80d7-49f1-9973-aaacf9463aa6 --dir ./migrations
   CLOUDFLARE_ACCOUNT_ID=74550e1c7a5a36e9cb05c5ad681add98 node scripts/seed-d1.mjs
   ```

3. Build and deploy the Worker (configured for custom domain `icons.paneui.dev`):

   ```bash
   cd apps/icons-worker
   CLOUDFLARE_ACCOUNT_ID=74550e1c7a5a36e9cb05c5ad681add98 node scripts/build-cf.mjs
   CLOUDFLARE_ACCOUNT_ID=74550e1c7a5a36e9cb05c5ad681add98 cf deploy --prebuilt
   ```

4. Set or rotate the write token secret:

   ```bash
   CLOUDFLARE_ACCOUNT_ID=74550e1c7a5a36e9cb05c5ad681add98 cf workers secrets update ICON_MCP_WRITE_TOKEN --worker paneui-icons-mcp --type secret_text --text "<TOKEN>"
   ```

## MCP Client Configuration

```json
{
  "mcpServers": {
    "paneui-icons": {
      "url": "https://icons.paneui.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ICON_MCP_WRITE_TOKEN"
      }
    }
  }
}
```
