import React from 'react';
import { useTheme } from '../theme.js';
import { t } from '../locales/index.js';
import Icon from '../icons.js';

export default function LockOverlay({ parentName }) {
  const { colors, typography, spacing } = useTheme();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: colors.surface.base,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <Icon name="LockSimple" size={64} color={colors.error} />
      <h2 style={{ ...typography.heading, color: colors.text.primary, marginTop: `${spacing.xl}px` }}>
        {t("Device locked")}{parentName ? t(" by ") + parentName : ""}
      </h2>
      <p style={{ ...typography.body, color: colors.text.secondary, marginTop: `${spacing.sm}px` }}>
        {t('Contact your parent to unlock')}
      </p>
    </div>
  );
}
