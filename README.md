# Horse Labo — SideStore Distribution Source

Autiv の iOS アプリ「**ホースラボ (Horse Labo)**」を SideStore で配布・更新するための **AltSource 互換 Source** です。

- **Source URL**: `https://autiv-admin.github.io/horse-labo-release/source.json`
- **Bundle ID**: `jp.autiv.horselabo`
- **開発者**: Autiv

> このリポジトリには **アプリのソースコードは含まれません**。公開しているのは配布メタデータ（`source.json`）・アイコン・検証スクリプトのみで、IPA は GitHub Release のアセットとして配置しています。APIキー・`.env`・利用者データは含みません。

## SideStore への追加

1. iPhone/iPad を Wi-Fi へ接続し、LocalDevVPN を ON にする
2. SideStore を開く → **Sources** → **＋**
3. 次の URL を貼り付ける:
   ```
   https://autiv-admin.github.io/horse-labo-release/source.json
   ```
4. 追加後、Source 内に「ホースラボ」が表示される
5. または Safari で次のリンクを開く:
   ```
   sidestore://source?url=https://autiv-admin.github.io/horse-labo-release/source.json
   ```

## リリース

| バージョン | ビルド | 最低iOS | IPA |
|---|---|---|---|
| 0.1.1 | 2 | 16.0 | [HorseLabo-0.1.1.ipa](https://github.com/autiv-admin/horse-labo-release/releases/download/v0.1.1/HorseLabo-0.1.1.ipa) |

各 IPA は署名なしで、SideStore がインストール時に端末の証明書で再署名します。

---

Produced by **Autiv**
