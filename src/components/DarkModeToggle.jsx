import { useTheme } from '../context/ThemeContext'

function DarkModeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <span className="text-yellow-400 text-lg">☀️</span>
      ) : (
        <span className="text-gray-600 text-lg">🌙</span>
      )}
    </button>
  )
}

export default DarkModeToggle
