/** @jsx createElement */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { TimeDuration } from 'lacona-phrase-datetime'
import { MountedVolume } from 'lacona-phrase-system'
import { Command, BooleanSetting } from 'lacona-command'
import { setWifi, setDoNotDisturb, setBluetooth, setVolume, checkBluetooth, checkDoNotDisturb, checkVolume, checkWifi } from 'lacona-api'

// I am distressed about the amount of OO BS that is in this file

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

class BaseSetting extends Phrase {
  static extends = [BooleanSetting]

  describe () {
    return (
      <map function={this.objectify}>
        <label text='setting'>
          {this.elements()}
        </label>
      </map>
    )
  }
}

export class BluetoothSetting extends BaseSetting {
  objectify (result) {
    return new BluetoothEnabledObject(result)
  }

  elements () {
    return <literal text='bluetooth' />
  }
}

export class DoNotDisturbSetting extends BaseSetting {
  objectify (result) {
    return new DoNotDisturbEnabledObject(result)
  }

  elements () {
    return <list limit={1} items={[
      {text: 'Do Not Disturb'},
      {text: 'notifications', value: {invert: true}},
    ]} />
  }
}

export class WifiSetting extends BaseSetting {
  objectify (result) {
    return new WifiEnabledObject(result)
  }

  elements () {
    return <literal text='wifi' />
  }
}

export class MuteSetting extends BaseSetting {
  objectify (result) {
    return new MuteEnabledObject(result)
  }

  elements () {
    return <list limit={2} items={[
      {text: 'mute'},
      {text: 'sound', value: {invert: true}},
      {text: 'the sound', value: {invert: true}},
      {text: 'audio', value: {invert: true}}
    ]} />
  }
}

class DoNotDisturbCommandObject {
  _demoExecute () {
    return [{text: 'turn on ', category: 'action'}, {text: 'Do Not Disturb', argument: 'setting'}]
  }

  execute () {
    setDoNotDisturb({enabled: true})
  }
}

export class DoNotDisturbCommand extends Phrase {
  static extends = [Command]

  describe () {
    return <list items={[
      'do not disturb',
      'do not disturb me'
    ]} value={new DoNotDisturbCommandObject()} limit={1} category='action' />
  }
}

class MuteCommandObject {
  constructor (result = true) {
    this.mute = result
  }

  _demoExecute () {
    return [{text: this.mute ? 'mute' : 'unmute', category: 'action'}, {text: ' the audio'}]
  }

  execute () {
    setVolume({mute: this.mute})
  }
}

export class MuteCommand extends Phrase {
  static extends = [Command]

  describe () {
    return (
      <map function={result => new MuteCommandObject(result)}>
        <list items={[
          {text: 'mute'},
          {text: 'unmute', value: false}
        ]} limit={1} category='action' />
      </map>
    )
  }
}

export const extensions = [BluetoothSetting, WifiSetting, DoNotDisturbSetting, MuteSetting, DoNotDisturbCommand, MuteCommand]

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
