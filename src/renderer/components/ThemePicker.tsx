import { useTheme } from '../store/ThemeContext'
import { useI18n } from '../store/I18nContext'

export default function ThemePicker() {
  const { theme, themes, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      {themes.map((item) => {
        const active = item.id === theme
        return (
          <button
            key={item.id}
            onClick={() => setTheme(item.id)}
            title={t('switchToTheme', { theme: item.label })}
            aria-label={t('switchToTheme', { theme: item.label })}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${item.previewBg} 0%, ${item.previewBg} 38%, ${item.previewAccent} 38%, ${item.previewAccent} 72%, ${item.previewAccent2} 72%, ${item.previewAccent2} 100%)`,
              border: active ? '2px solid var(--accent)' : '1px solid var(--border2)',
              boxShadow: active ? '0 0 0 2px var(--surface), 0 0 0 4px var(--accent-soft)' : 'var(--shadow)',
              transition: 'transform 0.16s, box-shadow 0.16s, border-color 0.16s',
              transform: active ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        )
      })}
    </div>
  )
}
