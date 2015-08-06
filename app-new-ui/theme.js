import {Styles} from 'material-ui'
import CustomTheme from './custom-theme'

let ThemeManager = new Styles.ThemeManager()

ThemeManager.setTheme(CustomTheme)

export default ThemeManager
