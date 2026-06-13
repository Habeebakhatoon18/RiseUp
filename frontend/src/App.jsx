import { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore'
import Layout from './components/Layout'
import Hero from './components/Hero'

function App() {
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Layout>
      <Hero />
    </Layout>
  )
}

export default App
