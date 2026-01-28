import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import App from './app/App.tsx'

describe('App', () => {
  test('renders', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })
})
