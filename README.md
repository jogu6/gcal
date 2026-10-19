# くまたんグループ 公開テスト画面

更新: 2026/10/19。このリポジトリ `jogu6/gcal` は、[公開テスト画面](https://jogu6.github.io/gcal/t/)・静的案内・Windows通知アプリの配布物を保存します。バックエンドの全ソースやDBは含みません。現在の画面配信はGitHub Pages、認証・API・ライブ更新・通知はNode/PostgreSQLです。

## VPS移行計画を作る方へ

権限のある担当者は、非公開ソース `jogu6/gcal-ci` の最新mainを取得して、次の順に読んでください。非公開資料へのリンクはアクセス権が必要です。

1. [現行構成](https://github.com/jogu6/gcal-ci/blob/main/docs/current-state.md) — 現在の構成と、移行未実施・確認済みの境界を把握する。
2. [作業条件](https://github.com/jogu6/gcal-ci/blob/main/AGENTS.md) と [共通ルール](https://github.com/jogu6/gcal-ci/blob/main/docs/current-rules.md) — 停止・公開先・試験・データの扱いを確認する。
3. [移行資料の引渡し](https://github.com/jogu6/gcal-ci/blob/main/docs/migration-handoff.md) — 設定・SQL・取得物を辿り、Git外で移送が必要なものを区別する。
4. [目的別案内](https://github.com/jogu6/gcal-ci/blob/main/docs/README.md) — 認証、通知、画像、エラー受信等の実装・運用資料を目的に応じて読む。

VPSの準備完了は、VPSへの配備・データ移行・公開切替の完了を意味しません。コンパニオン機能のプラグイン分離とAPI契約も提案段階です。

ここにあるビルド済みJavaScriptを直接編集して機能修正せず、非公開ソースで変更・検証してから正規の公開処理を使ってください。非公開の仕様書・設定・秘密値・DBをこのリポジトリへ追加しません。
