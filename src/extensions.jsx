/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { Command, BooleanSetting } from 'lacona-phrases'
import { setWifi, setDoNotDisturb, setBluetooth, setVolume, checkBluetooth, checkDoNotDisturb, checkVolume, checkWifi, setDarkMode, checkDarkMode, openLaconaPreferences} from 'lacona-api'

class EnabledSettingObject { //Abstract
  constructor ({invert = false} = {}) {
    this.invert = !!invert
  }

  enable () {
    this.setEnabled(!this.invert)
  }

  disable () {
    this.setEnabled(this.invert)
  }

  toggle () {
    this.checkEnabled().then(({enabled}) => {
      this.setEnabled(!enabled)
    })
  }
}

class BluetoothEnabledObject extends EnabledSettingObject {
  name = 'bluetooth'

  setEnabled (enabled) { setBluetooth({enabled}) }

  checkEnabled () { return checkBluetooth() }
}

class DarkModeEnabledObject extends EnabledSettingObject {
  name = 'dark mode'

  setEnabled (enabled) { setDarkMode({enabled}) }

  checkEnabled () { return checkDarkMode() }
}

class DoNotDisturbEnabledObject extends EnabledSettingObject {
  name = 'Do Not Disturb'

  setEnabled (enabled) { setDoNotDisturb({enabled}) }

  checkEnabled () { return checkDoNotDisturb() }
}

class WifiEnabledObject extends EnabledSettingObject {
  name = 'Wifi'
  
  setEnabled (enabled) { setWifi({enabled}) }

  checkEnabled () { return checkWifi() }
}

class MuteEnabledObject extends EnabledSettingObject {
  setEnabled (mute) {
    setVolume({mute})
  }

  checkEnabled () {
    return checkVolume().then(({mute}) => {
      return {enabled: mute}
    })
  }
}

function createSetting (mapResult, element) {
  return {
    extends: [BooleanSetting],
    mapResult,
    describe ({props}) {
      return (
        <label text='setting' suppressEmpty={props.suppressEmpty}>
          {element}
        </label>
      )
    }
  }
}

export const BluetoothSetting = createSetting(
  (result) => new BluetoothEnabledObject(result),
  <literal text='bluetooth' />
)

export const DarkModeSetting = createSetting(
  (result) => new DarkModeEnabledObject(result),
  <list items={[
    {text: 'dark mode'},
    {text: 'light mode', value: {invert: true}}
  ]} />
)

export const DoNotDisturbSetting = createSetting(
  (result) => new DoNotDisturbEnabledObject(result),
  <list limit={1} items={[
    {text: 'Do Not Disturb'},
    {text: 'notifications', value: {invert: true}},
  ]} />
)

export const WifiSetting = createSetting(
  (result) => new WifiEnabledObject(result),
  <literal text='wifi' />
)

export const MuteSetting = createSetting(
  (result) => new MuteEnabledObject(result),
  <list limit={2} items={[
    {text: 'mute'},
    {text: 'sound', value: {invert: true}},
    {text: 'the sound', value: {invert: true}},
    {text: 'audio', value: {invert: true}}
  ]} />
)

export const DoNotDisturbCommand = {
  extends: [Command],

  execute () {
    setDoNotDisturb({enabled: true})
  },

  demoExecute () {
    return [{text: 'turn on ', category: 'action'}, {text: 'Do Not Disturb', argument: 'setting'}]
  },

  describe () {
    return <list items={[
      'do not disturb',
      'do not disturb me'
    ]} limit={1} category='action' />
  }
}

export const MuteCommand = {
  extends: [Command],

  demoExecute (result) {
    return [{text: result ? 'mute' : 'unmute', category: 'action'}, {text: ' the audio'}]
  },

  execute (result) {
    setVolume({mute: result})
  },

  describe () {
    return <list items={[
      {text: 'mute', value: true},
      {text: 'unmute', value: false}
    ]} limit={1} category='action' />
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
        <label text='preference pane'>
          <list items={['Lacona Preferences', 'Lacona Settings']} strategy='fuzzy' />
        </label>
      </sequence>
    )
  }
}

export default [BluetoothSetting, DarkModeSetting, WifiSetting, DoNotDisturbSetting, MuteSetting, DoNotDisturbCommand, MuteCommand, OpenLaconaPreferencesCommand]
