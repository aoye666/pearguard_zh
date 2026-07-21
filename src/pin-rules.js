// Single source of truth for override-PIN length rules, shared by the RN setup
// wizard, the WebView parent UI and the bare worklet's pin:set handler.
//
// The child-side verifiers (AppBlockerModule.java, desktop pin-verify.js) do NOT
// consult these bounds: they hash whatever was entered and compare. That's
// deliberate. `policy.pinHashes` is keyed per parent and co-parents may hold
// PINs of different lengths, so a child device can't know the expected length
// and must let the user submit explicitly.
//
// Existing 4-digit PINs stay valid — only the upper bound moved.

const MIN_PIN_LENGTH = 4
const MAX_PIN_LENGTH = 10

const LENGTH_ERROR = `PIN 必须为 ${MIN_PIN_LENGTH} 到 ${MAX_PIN_LENGTH} 位数字。`
const DIGITS_ERROR = 'PIN 只能包含数字。'

// Returns null when valid, otherwise a user-facing error string.
function validatePin(pin) {
  if (typeof pin !== 'string' || pin.length < MIN_PIN_LENGTH || pin.length > MAX_PIN_LENGTH) {
    return LENGTH_ERROR
  }
  if (!/^\d+$/.test(pin)) return DIGITS_ERROR
  return null
}

module.exports = {
  MIN_PIN_LENGTH,
  MAX_PIN_LENGTH,
  LENGTH_ERROR,
  DIGITS_ERROR,
  validatePin,
}
