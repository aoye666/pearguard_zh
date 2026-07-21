// Packages that are ALWAYS exempt from the device-wide screen-time cap,
// regardless of what the parent selects in the UI. QQ and WeChat are essential
// communication tools that should never be blocked by a screen-time limit.
//
// This file is safe for both bare (Node) and UI (browser) bundles.
// Do NOT add sodium-native or other native imports here.
module.exports = [
  'com.tencent.mm',       // 微信
  'com.tencent.mobileqq', // QQ
]
