import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import GuideIndex from './GuideIndex.vue'
import './style.css'
import './institutional.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('GuideIndex', GuideIndex)
  }
} satisfies Theme
