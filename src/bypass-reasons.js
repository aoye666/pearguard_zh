// Turns a bypass/enforcement-offline `reason` into the text the PARENT sees.
//
// Every reason used to render the same Android-specific sentence (" turned
// off the PearGuard Accessibility Service"), no matter what actually happened or
// which platform the child was on. That's wrong in two directions:
//
//   - It's factually incorrect for a desktop child (there is no Accessibility
//     Service on Windows or Linux).
//   - Worse, it ACCUSES. Some reasons are not the child's doing at all — an
//     unsupported Wayland compositor means PearGuard simply cannot enforce on
//     that machine. Telling a parent their kid "turned off" protection when the
//     app never worked there invites a punishment for something the child didn't
//     do. Reasons that are the app's limitation must read as the app's problem.
//
// The parent still needs to know enforcement is off in every case — that's the
// whole point of the alert — but the wording has to match the cause.

// Reasons that mean "PearGuard cannot enforce here", NOT "the child defeated it".
// Kept exported so the UI can style/prioritise them differently from real tampering.
const NON_TAMPER_REASONS = new Set([
  'linux:unsupported-compositor',
  'linux:extension-not-loaded',
  'linux:extension-out-of-date',
  'linux:extension-error',
  'linux:extension-missing',
])

// Delegate to describeBypassReason so there is exactly ONE definition of what
// counts as tampering. Deriving it from the Set instead would silently disagree
// with the wording for any reason not listed there (e.g. an unknown one, which
// the switch deliberately treats as "not the child's fault").
function isTamperReason(reason) {
  return describeBypassReason(reason, 'x').tamper
}

/**
 * @param {string} reason  as sent by the child (bypass:detected)
 * @param {string} childName  display name, already defaulted by the caller
 * @returns {{ title: string, body: string, tamper: boolean }}
 */
function describeBypassReason(reason, childName) {
  const who = childName || '你的孩子'
  const r = String(reason || '')

  switch (r) {
    // --- The child actively defeated enforcement -----------------------------
    case 'accessibility_disabled':
      return {
        title: who + '的家长控制已禁用',
        body: who + '关闭了 PearGuard 无障碍服务。',
        tamper: true,
      }
    case 'device_admin_disabled':
      return {
        title: who + '的家长控制已禁用',
        body: who + '移除了 PearGuard 的设备管理员权限。',
        tamper: true,
      }
    case 'force_stopped':
      return {
        title: 'PearGuard 在' + who + '的设备上已停止',
        body: who + '强制停止了 PearGuard。应用阻止功能未运行。',
        tamper: true,
      }

    // The accessibility/protection service is switched ON in settings but its
    // process is not currently connected — the OS reclaimed it (memory pressure,
    // etc.) rather than the child disabling it. Blocking silently no-ops while it
    // reconnects, so the parent must be told, but this is NOT the child's doing
    // (a deliberate turn-off is 'accessibility_disabled'; a force-stop is
    // 'force_stopped'). No blame.
    case 'accessibility_not_connected':
      return {
        title: '应用阻止已在' + who + '的设备上暂停',
        body: 'PearGuard 的保护服务被设备停止，正在重新启动。阻止功能在重新连接之前处于非活跃状态——这不是'
          + who + '的操作。',
        tamper: false,
      }
    case 'clock_changed':
      return {
        title: '设备时钟已更改',
        body: who + '更改了设备时钟，这可能会破坏每日限制和计划。',
        tamper: true,
      }
    case 'timezone_changed':
      return {
        title: '设备时区已更改',
        body: who + '更改了设备时区，这可能会破坏每日限制和计划。',
        tamper: true,
      }

    // --- PearGuard can't enforce here. NOT the child's fault. -----------------
    case 'linux:unsupported-compositor':
      return {
        title: '应用阻止在' + who + '的电脑上无法正常工作',
        body: 'PearGuard 无法在此 Linux 桌面上监控应用——其窗口系统不受支持。'
          + '阻止功能在此问题解决前处于非活跃状态。这是 PearGuard 的限制，不是'
          + who + '的操作。',
        tamper: false,
      }
    case 'linux:extension-not-loaded':
      return {
        title: '需要在' + who + '的电脑上操作',
        body: who + '需要注销并重新登录以完成启用应用阻止。'
          + '在此之前阻止功能处于非活跃状态。',
        tamper: false,
      }
    case 'linux:extension-out-of-date':
      return {
        title: '应用阻止已在' + who + '的电脑上关闭',
        body: 'PearGuard 的应用阻止扩展与此电脑上的 GNOME 版本不兼容，'
          + '因此阻止功能处于非活跃状态。需要更新 PearGuard——' + who + '没有进行此操作。',
        tamper: false,
      }
    case 'linux:extension-error':
      return {
        title: '应用阻止已在' + who + '的电脑上关闭',
        body: 'PearGuard 的应用阻止扩展崩溃了，因此阻止功能处于非活跃状态。'
          + '重启电脑通常可以解决此问题。这是 PearGuard 的故障，不是' + who + '的操作。',
        tamper: false,
      }
    case 'linux:extension-missing':
      // Could be a destructive child OR a failed install — we genuinely cannot
      // tell from here, so state the fact and assign no blame.
      return {
        title: '应用阻止已在' + who + '的电脑上关闭',
        body: 'PearGuard 的应用阻止扩展缺失，因此阻止功能处于非活跃状态。'
          + 'PearGuard 将尝试重新安装。',
        tamper: false,
      }

    // The one Linux extension case we CAN attribute: the switch was turned off.
    case 'linux:extension-disabled':
      return {
        title: who + '的家长控制已禁用',
        body: who + '关闭了 PearGuard 的应用阻止扩展。',
        tamper: true,
      }

    default:
      // Unknown/legacy reason: state the true, minimal thing. Do NOT guess at a
      // cause — inventing "your child disabled protection" for a reason we don't
      // recognise is exactly the false accusation this module exists to prevent.
      return {
        title: '应用阻止已关闭',
        body: '应用阻止在' + who + '的设备上未运行。',
        tamper: false,
      }
  }
}

module.exports = { describeBypassReason, isTamperReason, NON_TAMPER_REASONS }