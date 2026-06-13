import { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore'
import Layout from './components/Layout'
import Hero from './components/Hero'
import PackageScanner from './components/PackageScanner'
import ScanResults from './components/ScanResults'
import AnalyticsDashboard from './components/AnalyticsDashboard'

function App() {
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Layout>
      <Hero />
      <PackageScanner />
      <ScanResults />
      <AnalyticsDashboard />
    </Layout>
  )
}

export default App
