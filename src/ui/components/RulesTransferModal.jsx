import React, { useState } from 'react';
import { useTheme } from '../theme.js';
import { t } from '../locales/index.js';
import Button from './primitives/Button.jsx';
import Modal from './primitives/Modal.jsx';

// Unified modal for exporting and importing a child's rules via clipboard.
// mode: 'export' | 'import'
export default function RulesTransferModal({ visible, mode, child, onClose }) {
  const { colors, spacing, typography } = useTheme();
  const [stage, setStage] = useState('idle'); // idle | working | preview | applied | error
  const [json, setJson] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!visible) {
      setStage('idle'); setJson(''); setPreview(null); setError('');
    }
  }, [visible]);

  async function handleExport() {
    window.callBare('haptic:tap');
    setStage('working'); setError('');
    try {
      const res = await window.callBare('rules:export', { childPubKey: child.publicKey });
      const safeName = (child.displayName || 'child').replace(/[^a-z0-9_-]+/gi, '_');
      const filename = `pearguard-rules-${safeName}-${Date.now()}.json`;
      await window.callBare('file:save', { filename, content: res.json });
      setStage('applied');
    } catch (e) {
      setError(String(e?.message || e));
      setStage('error');
    }
  }

  async function handlePickAndPreview() {
    window.callBare('haptic:tap');
    setStage('working'); setError('');
    try {
      const picked = await window.callBare('file:pick');
      if (!picked || picked.canceled) { setStage('idle'); return; }
      const text = picked.content || '';
      if (!text.trim()) throw new Error('Selected file is empty.');
      const prev = await window.callBare('rules:import:preview', {
        jsonString: text,
        targetChildPubKey: child.publicKey,
      });
      setJson(text);
      setPreview(prev);
      setStage('preview');
    } catch (e) {
      setError(String(e?.message || e));
      setStage('error');
    }
  }

  async function handleApply() {
    window.callBare('haptic:tap');
    setStage('working'); setError('');
    try {
      await window.callBare('rules:import:apply', {
        jsonString: json,
        targetChildPubKey: child.publicKey,
      });
      setStage('applied');
    } catch (e) {
      setError(String(e?.message || e));
      setStage('error');
    }
  }

  const isExport = mode === 'export';
  const title = isExport ? `Export ${child.displayName}'s rules` : `Import rules into ${child.displayName}`;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      footer={renderFooter()}
    >
      {renderBody()}
    </Modal>
  );

  function renderBody() {
    if (stage === 'working') {
      return <div style={{ textAlign: 'center', color: colors.text.muted }}>{t('Working...')}</div>;
    }
    if (stage === 'error') {
      return <div style={{ color: colors.error, ...typography.body }}>{error}</div>;
    }
    if (isExport) {
      if (stage === 'applied') {
        return (
          <div style={{ ...typography.body, color: colors.text.primary }}>
            {t('Rules file saved. Share it to another device and use Import Rules there.')}
          </div>
        );
      }
      return (
        <div style={{ ...typography.body, color: colors.text.primary }}>
          {t('Save {name}\'s apps and schedules to a signed JSON file. No PIN or lock state is included.', { name: child.displayName })}
        </div>
      );
    }
    // Import mode
    if (stage === 'applied') {
      return (
        <div style={{ ...typography.body, color: colors.text.primary }}>
          {t('Rules imported. {name} will receive the update on next sync.', { name: child.displayName })}
        </div>
      );
    }
    if (stage === 'preview' && preview) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px`, ...typography.body, color: colors.text.primary }}>
          <div>{t('Importing from {source} into {name}.', { source: short(preview.sourceChildPubKey), name: child.displayName })}</div>
          <Row color={colors.success} label={t('Apps added')} count={preview.appsAdded.length} items={preview.appsAdded} />
          <Row color={colors.error}   label={t('Apps removed')} count={preview.appsRemoved.length} items={preview.appsRemoved} />
          <Row color={colors.primary} label={t('Apps changed')} count={preview.appsChanged.length} items={preview.appsChanged} />
          <Row color={colors.text.muted} label={t('Skipped (not installed on target)')} count={(preview.appsSkipped || []).length} items={preview.appsSkipped || []} />
          <div>{t('Schedules: {val}', { val: preview.schedulesChanged ? t('will be replaced') : t('unchanged') })}</div>
          <div style={{ color: colors.text.muted, marginTop: `${spacing.sm}px` }}>
            {t('PIN, lock state, and device-specific settings are preserved.')}
          </div>
        </div>
      );
    }
    return (
      <div style={{ ...typography.body, color: colors.text.primary }}>
        {t('Pick a rules JSON file exported from another device to preview the changes before applying.')}
      </div>
    );
  }

  function renderFooter() {
    if (stage === 'working') return null;
    if (isExport) {
      if (stage === 'applied') {
        return <Button onClick={onClose} style={{ flex: 1 }}>{t('Done')}</Button>;
      }
      return (
        <>
          <Button variant="secondary" onClick={() => { window.callBare('haptic:tap'); onClose(); }} style={{ flex: 1 }}>{t('Cancel')}</Button>
          <Button icon="Export" onClick={handleExport} style={{ flex: 1 }}>{t('Save file')}</Button>
        </>
      );
    }
    // Import
    if (stage === 'applied') {
      return <Button onClick={onClose} style={{ flex: 1 }}>{t('Done')}</Button>;
    }
    if (stage === 'preview') {
      return (
        <>
          <Button variant="secondary" onClick={() => { window.callBare('haptic:tap'); onClose(); }} style={{ flex: 1 }}>{t('Cancel')}</Button>
          <Button icon="Check" onClick={handleApply} style={{ flex: 1 }}>{t('Apply')}</Button>
        </>
      );
    }
    return (
      <>
        <Button variant="secondary" onClick={() => { window.callBare('haptic:tap'); onClose(); }} style={{ flex: 1 }}>{t('Cancel')}</Button>
        <Button icon="ClipboardText" onClick={handlePickAndPreview} style={{ flex: 1 }}>{t('Import file')}</Button>
      </>
    );
  }
}

function Row({ color, label, count, items }) {
  if (count === 0) return <div style={{ color: 'inherit', opacity: 0.6 }}>{label}: 0</div>;
  const names = items.map(i => i.appName || i.packageName);
  return (
    <div>
      <span style={{ color, fontWeight: 600 }}>{label}: {count}</span>
      <span style={{ opacity: 0.7, marginLeft: 8 }}>{names.slice(0, 3).join(', ')}{names.length > 3 ? ` +${names.length - 3} more` : ''}</span>
    </div>
  );
}

function short(k) { return (k || '').slice(0, 8); }
