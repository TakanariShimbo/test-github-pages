# Vite + React + TypeScript を GitHub Pages へ

このリポジトリは、Vite + React + TypeScript で作成したアプリを GitHub Pages に自動デプロイするための最小構成です。

## 概要

- ツール: Vite 7 / React 19 / TypeScript 5 / `@vitejs/plugin-react-swc`
- 公開先: GitHub Pages（このリポジトリのプロジェクトサイト）
- デプロイ: GitHub Actions（`.github/workflows/pages.yml`）で `main` への push をトリガーに自動公開

## 1) プロジェクト初期化（Vite）

まだ未作成の場合は次で初期化します（このリポジトリは実施済み）。

```bash
npm create vite@latest . -- --template react-swc-ts
```

## 2) 依存インストール

```bash
npm install
```

## 3) GitHub Pages を有効化（初回のみ）

- GitHub のリポジトリ画面 → Settings → Pages
- Build and deployment の Source を「GitHub Actions」に設定して保存

## 4) ローカル開発

```bash
npm run dev
```

表示された URL にアクセス（デフォルトのポートは Vite の表示に従ってください）。

## 5) デプロイ（自動）

`main` ブランチへ push すると GitHub Actions がビルドして Pages に公開します。

```bash
git add -A
git commit -m "feat: update"
git push -u origin main
```

- Actions タブのワークフロー名: `Deploy to GitHub Pages`
- 成功後、`deploy` ステップの出力に公開 URL（`page_url`）が表示されます
- 例: `https://<ユーザー名>.github.io/test-github-pages/`

## 6) 設定のポイント

### Vite の `base`（Pages 用パス調整）

`vite.config.ts` では、GitHub Actions の本番ビルド時に自動で `base` を設定します。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const repo = ((globalThis as any).process?.env?.GITHUB_REPOSITORY as string | undefined)?.split("/")?.[1] ?? "";
  const isUserSite = repo ? repo.endsWith(".github.io") : false;
  const base = mode === "production" ? (isUserSite ? "/" : repo ? `/${repo}/` : "/") : "/";
  return { plugins: [react()], base };
});
```

- ローカル開発時（`dev`）は `/` のまま
- GitHub Actions（`mode: production`）では `/<repo>/` に切り替え（ユーザー/組織サイト `<user>.github.io` の場合は `/`）

### SPA フォールバック（直リンク 404 回避）

Pages は SPA のルーティングを解釈しないため、直リンク/リロードで 404 になります。ワークフローで `dist/index.html` → `dist/404.html` をコピーしてフォールバックさせています。

### GitHub Actions ワークフロー

`.github/workflows/pages.yml`（要点のみ）

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: SPA fallback
        run: cp dist/index.html dist/404.html
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## 7) よくあるハマりと対処

- デプロイで `404 Not Found` エラー（`deploy-pages`）
  - Pages が未有効化。Settings → Pages で「GitHub Actions」を選択し保存（初回のみ）
- 白画面/アセット 404
  - `base` が誤り。`vite.config.ts` で `/<repo>/` になっているか確認
- ルータの直リンク/リロードで 404
  - `404.html` フォールバック（ワークフローの `SPA fallback` ステップ）を確認
- TypeScript: `TS2580: Cannot find name 'process'`
  - 本リポジトリでは `globalThis.process?.env` を参照して `@types/node` なしで回避
  - 代替案: `npm i -D @types/node` + `tsconfig.node.json` に `types: ["node"]`
- TypeScript: `TS18003: No inputs were found`
  - `tsconfig.node.json` の `include` を空にしない（本リポジトリは `["vite.config.ts"]`）

## 8) カスタマイズ

- デプロイ対象ブランチを変更したい
  - ワークフロー内の `branches: [ main ]` を希望のブランチへ変更
- ユーザー/組織サイト（`<user>.github.io`）として公開したい
  - リポジトリ名を `<user>.github.io` にすると `base: '/'` が自動適用
- 独自ドメイン（CNAME）
  - 例: 以下のステップを `build` 後に追加
    ```yaml
    - name: Add CNAME
      run: echo example.com > dist/CNAME
    ```

## 9) コマンド早見表

- 開発: `npm run dev`
- ビルド: `npm run build`
- Lint: `npm run lint`

---

問題があれば Issue や PR で知らせてください。
