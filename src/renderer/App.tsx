import { useState } from 'react'
import PairListPage from './pages/PairListPage'
import PairDetailPage from './pages/PairDetailPage'
import ToastContainer from './components/Toast'
import { I18nProvider } from './store/I18nContext'
import { ThemeProvider } from './store/ThemeContext'
import type { Pair } from '../shared/types'

export default function App() {
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null)

  return (
    <ThemeProvider>
      <I18nProvider>
        {selectedPair ? (
          <PairDetailPage pair={selectedPair} onBack={() => setSelectedPair(null)} />
        ) : (
          <PairListPage onSelect={setSelectedPair} />
        )}
        <ToastContainer />
      </I18nProvider>
    </ThemeProvider>
  )
}
