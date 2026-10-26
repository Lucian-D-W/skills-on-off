import { useI18n } from '../store/I18nContext'
import { uiMetrics } from '../styles/uiMetrics'
import { typography } from '../styles/typography'

export default function LanguagePicker() {
  const { locale, locales, setLocale, t } = useI18n()

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--text2)', fontSize: 12, fontWeight: typography.weight.label, fontFamily: typography.family.ui }}>
      <span>{t('language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        style={{
          minHeight: uiMetrics.controlHeight,
          padding: '6px 10px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 12,
          fontWeight: typography.weight.label,
          fontFamily: typography.family.ui,
        }}
      >
        {locales.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
