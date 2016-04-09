/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { TimeDuration } from 'elliptical-datetime'
import { MountedVolume } from 'lacona-phrases'
import { Command, BooleanSetting } from 'lacona-command'
import { setWifi, setDoNotDisturb, setBluetooth, setVolume, checkBluetooth, checkDoNotDisturb, checkVolume, checkWifi, setDarkMode, checkDarkMode } from 'lacona-api'

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
    this.checkEnabled((err, {enabled}) => {
      if (err) {
        return console.error(err)
      } else {
        this.setEnabled(!enabled)
      }
    })
  }
}

class BluetoothEnabledObject extends EnabledSettingObject {
  name = 'bluetooth'

  setEnabled (enabled) { setBluetooth({enabled}) }

  checkEnabled (done) { checkBluetooth(done) }
}

class DarkModeEnabledObject extends EnabledSettingObject {
  name = 'dark mode'

  setEnabled (enabled) { setDarkMode({enabled}) }

  checkEnabled (done) { checkDarkMode(done) }
}

class DoNotDisturbEnabledObject extends EnabledSettingObject {
  name = 'Do Not Disturb'

  setEnabled (enabled) { setDoNotDisturb({enabled}) }

  checkEnabled (done) { checkDoNotDisturb(done) }
}

class WifiEnabledObject extends EnabledSettingObject {
  name = 'Wifi'
  
  setEnabled (enabled) { setWifi({enabled}) }

  checkEnabled (done) { checkWifi(done) }
}

class MuteEnabledObject extends EnabledSettingObject {
  setEnabled (mute) {
    setVolume({mute})
  }

  checkEnabled (done) {
    checkVolume((err, {mute}) => {
      done(err, {enabled: mute})
    })
  }
}

function createSetting (mapResult, element) {
  return {
    extends: [BooleanSetting],
    mapResult,
    describe () {
      return <label text='setting'>{element}</label>
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

export const extensions = [BluetoothSetting, DarkModeSetting, WifiSetting, DoNotDisturbSetting, MuteSetting, DoNotDisturbCommand, MuteCommand]

// export default {
//   sentences: [OpenApp],
//   translations: [{
//     langs: ['en', 'default'],
//     information: {
//       title: 'Open Application',
//       description: 'Quickly launch applications on your computer',
//       examples: ['open Safari', 'open Contacts']
//     }
//   }]
// }
