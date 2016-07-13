/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { Command, BooleanSetting, BooleanCommand } from 'lacona-phrases'
import { setWifi, setDoNotDisturb, setBluetooth, setVolume, checkBluetooth, checkDoNotDisturb, checkVolume, checkWifi, setDarkMode, checkDarkMode, openLaconaPreferences} from 'lacona-api'

function wrapSetting (element, props) {
  return <placeholder argument='setting' suppressEmpty={props.suppressEmpty}>{element}</placeholder>
}

export const BluetoothSetting = {
  extends: [BooleanSetting],

  setSetting (enabled) {
    setBluetooth({enabled})
  },

  getSetting () {
    return checkBluetooth().then(({enabled}) => enabled)
  },

  describe ({props}) {
    return wrapSetting(<literal text='bluetooth' />, props)
  }
}

export const DarkModeSetting = {
  extends: [BooleanSetting],

  setSetting (enabled) {
    setDarkMode({enabled})
  },

  getSetting () {
    return checkDarkMode().then(({enabled}) => enabled)
  },

  describe ({props}) {
    return wrapSetting(<list items={[
      {text: 'dark mode'},
      {text: 'light mode', value: false}
    ]} />, props)
  }
}

export const DoNotDisturbSetting = {
  extends: [BooleanSetting],
  setSetting (enabled) {
    setDoNotDisturb({enabled})
  },

  getSetting () {
    return checkDoNotDisturb().then(({enabled}) => enabled)
  },

  describe ({props}) {
    return wrapSetting(<list limit={1} items={[
      {text: 'Do Not Disturb'},
      {text: 'notifications', value: false},
    ]} />, props)
  }
}

export const WifiSetting = {
  extends: [BooleanSetting],
  setSetting (enabled) {
    setWifi({enabled})
  },

  getSetting () {
    return checkWifi().then(({enabled}) => enabled)
  },

  describe ({props}) {
    return wrapSetting(<literal text='wifi' />, props)
  }
}

export const MuteSetting = {
  extends: [BooleanSetting],
  setSetting (enabled) {
    setVolume({mute: !!enabled})
  },
  getSetting () {
    return checkVolume().then(({mute}) => mute)
  },
  describe ({props}) {
    return wrapSetting(<list limit={2} items={[
      {text: 'mute'},
      {text: 'sound', value: false},
      {text: 'the sound', value: false},
      {text: 'audio', value: false}
    ]} />, props)
  }
}

// export const MuteSetting = createSetting(
//   (result) => new MuteEnabledObject(result),
// )

export const DoNotDisturbCommand = {
  extends: [BooleanCommand],

  execute (result) {
    setDoNotDisturb({enabled: result})
  },

  demoExecute () {
    return [{text: 'turn on ', category: 'action'}, {text: 'Do Not Disturb', argument: 'setting'}]
  },

  describe () {
    return <list items={[
      'do not disturb',
      'do not disturb me'
    ]} limit={1} />
  }
}

export const MuteCommand = {
  extends: [BooleanCommand],

  demoExecute (result) {
    return [{text: result ? 'mute' : 'unmute', category: 'action'}, {text: ' the audio'}]
  },

  execute (result) {
    setVolume({mute: !!result})
  },

  describe () {
    return <list items={[
      {text: 'mute', value: true},
      {text: 'unmute', value: false}
    ]} limit={1} />
  }
}

export const OpenLaconaPreferencesCommand = {
  extends: [Command],

  demoExecute (result) {
    return [{text: 'open the Lacona Preferences'}]
  },

  execute () {
    openLaconaPreferences()
  },

  describe () {
    return (
      <sequence>
        <list items={['open ', 'show ']} />
        <placeholder argument='preference pane'>
          <list items={['Lacona Preferences', 'Lacona Settings']} strategy='fuzzy' />
        </placeholder>
      </sequence>
    )
  }
}

export default [BluetoothSetting, DarkModeSetting, WifiSetting, DoNotDisturbSetting, MuteSetting, DoNotDisturbCommand, MuteCommand, OpenLaconaPreferencesCommand]
