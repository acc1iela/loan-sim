# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業するときのガイドです。
不明点がある場合は、実装に入る前に質問してください。

## Project Overview

ローン返済・繰上げ返済シミュレーション（趣味・練習用）。
React + TypeScript + Vite 構成。UI は Tailwind で最低限きれいに。

- 返済方式：まずは **元利均等** のみ実装
- 将来：元金均等などの方式追加が可能な設計にする（壊れない）
- 繰上げ返済：まずは **期間短縮型** を実装
- 繰上げ入力：毎月ちょい足し / ボーナス月上乗せ / 特定月の臨時上乗せ を扱う

## Commands

すべてのコマンドは `app/` ディレクトリで実行する:

```bash
cd app

npm run dev
npm run build
npm run lint
npm run preview
```
