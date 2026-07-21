// src/ui/locales/index.js
//
// Lightweight i18n for PearGuard.
// Add a locale file (e.g. zh-CN.js) and switch with setLocale().
// Falls back to en.js when a key is missing from the active locale.
//
// Usage:
//   import { t, setLocale } from '../locales/index.js';
//   t('Cancel')           // → '取消' (zh-CN) or 'Cancel' (en)
//   t('Hi, {name}', { name: 'Alice' })  // → '你好，Alice'

import en from './en.js';
import zhCN from './zh-CN.js';

const locales = { en, 'zh-CN': zhCN };

let currentLocale = 'zh-CN'; // 默认中文

export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
  }
}

export function getLocale() {
  return currentLocale;
}

export function t(key, params = {}) {
  const dict = locales[currentLocale] || locales.en;
  let text = dict[key];
  if (text === undefined) {
    text = key;
  }
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
}