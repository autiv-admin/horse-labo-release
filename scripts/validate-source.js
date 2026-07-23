#!/usr/bin/env node
/**
 * validate-source.js — SideStore(AltSource互換) source.json を検証する。
 *   使い方: node scripts/validate-source.js [source.jsonパス]（既定: source.json）
 * 依存なし（Node標準のみ）。失敗時は exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || 'source.json';
const errors = [];
const err = (m) => errors.push(m);

let raw, data;
try {
  raw = fs.readFileSync(path.resolve(file), 'utf8');
} catch (e) {
  console.error('ERROR: 読み込み失敗: ' + file + ' (' + e.message + ')');
  process.exit(1);
}

// JSONとして解析可能
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('ERROR: JSON解析不能: ' + e.message);
  process.exit(1);
}

const isHttps = (u) => typeof u === 'string' && /^https:\/\//.test(u);
const isPosInt = (n) => Number.isInteger(n) && n > 0;

// 必須トップレベル
for (const k of ['name', 'apps']) {
  if (!(k in data)) err('トップレベル必須項目が無い: ' + k);
}
if (!isHttps(data.iconURL)) err('トップレベル iconURL がHTTPSでない');

// marketplaceID / build キーの禁止（全体を文字列走査 + 構造チェック）
if (/"marketplaceID"\s*:/.test(raw)) err('禁止キー marketplaceID が存在する');

// apps
if (!Array.isArray(data.apps) || data.apps.length < 1) {
  err('apps が1件以上でない');
} else {
  const seenBundle = new Set();
  data.apps.forEach((app, ai) => {
    const tag = 'apps[' + ai + ']';
    if (!app.bundleIdentifier) err(tag + ' bundleIdentifier が無い');
    if (app.bundleIdentifier) {
      if (seenBundle.has(app.bundleIdentifier)) err('Bundle ID重複: ' + app.bundleIdentifier);
      seenBundle.add(app.bundleIdentifier);
    }
    if (!('appPermissions' in app)) err(tag + ' appPermissions が無い');
    if (!isHttps(app.iconURL)) err(tag + ' iconURL がHTTPSでない');

    if (!Array.isArray(app.versions) || app.versions.length < 1) {
      err(tag + ' versions が1件以上でない');
    } else {
      // version/buildVersion は文字列、URL/size/minOS を検査
      app.versions.forEach((v, vi) => {
        const vt = tag + '.versions[' + vi + ']';
        if (typeof v.version !== 'string') err(vt + ' version が文字列でない');
        if (typeof v.buildVersion !== 'string') err(vt + ' buildVersion が文字列でない');
        if ('build' in v) err(vt + ' に不要な build キーがある（buildVersion を使うこと）');
        if (!isHttps(v.downloadURL)) err(vt + ' downloadURL がHTTPSでない');
        if (!isPosInt(v.size)) err(vt + ' size が正の整数でない');
        if (!v.minOSVersion) err(vt + ' minOSVersion が無い');
        if (!v.date) err(vt + ' date が無い');
      });
      // 最新版が先頭（semver降順で versions[0] が最大）
      const semver = (s) => String(s || '0').split('.').map((n) => parseInt(n, 10) || 0);
      const cmp = (a, b) => {
        const A = semver(a), B = semver(b);
        for (let i = 0; i < Math.max(A.length, B.length); i++) {
          if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0);
        }
        return 0;
      };
      for (let i = 1; i < app.versions.length; i++) {
        if (cmp(app.versions[0].version, app.versions[i].version) < 0) {
          err(tag + ' 最新版が先頭でない（versions[0] より新しい版が後方にある）');
          break;
        }
      }
    }
  });
}

// Source内に秘密情報が無い
const secretPatterns = [
  [/sk-[A-Za-z0-9]{20,}/, 'OpenAIキー形式'],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, 'GitHubトークン形式'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '秘密鍵'],
  [/"[A-Za-z0-9_]*(password|secret|token|apikey)"\s*:/i, '秘密情報らしきキー'],
];
for (const [re, label] of secretPatterns) {
  if (re.test(raw)) err('秘密情報の疑い: ' + label);
}

if (errors.length) {
  console.error('== source.json 検証 FAILED ==');
  errors.forEach((e) => console.error('  NG: ' + e));
  process.exit(1);
}
console.log('== source.json 検証 PASSED ==');
console.log('  apps: ' + data.apps.length + ' / 先頭app versions: ' + (data.apps[0].versions || []).length);
process.exit(0);
