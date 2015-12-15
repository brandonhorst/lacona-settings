/** @jsx createElement */

import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import {TimeDuration} from 'lacona-phrase-datetime'
import {MountedVolume} from 'lacona-phrase-system-state'

function setWifiEnabled (enabled) {
  global.system('/usr/sbin/networksetup', ['-setairportpower', 'en0', enabled ? 'on' : 'off'])
}

function checkWifiEnabled (callback) {
  global.system('/usr/sbin/networksetup', ['-getairportpower', 'en0'], (err, results) => {
    if (err) return callback(err)
    callback(null, _.includes(results, 'On'))
  })
}

// function setDoNotDisturbEnabled (enabled) {
//   const userHome = global.getUserHome()
//   global.getSystemUUID((err, uuid) => {
//     global.system('/usr/bin/defaults', ['write', `${userHome}/Library/Preferences/ByHost/com.apple.notificationcenterui.${uuid}.plist`, 'doNotDisturb', enabled ? '1' : '0'])
//   })
// }

function toggleDoNotDisturbEnabled () {
  const script = `
    tell application "System Events" to tell process "SystemUIServer"
      key down option
      click menu bar item 1 of menu bar 2
      key up option
    end tell
  `

  global.applescript(script)
}

function checkDoNotDisturbEnabled (callback) {
  const userHome = global.getUserHome()
  global.getSystemUUID((err, uuid) => {
    global.system('/usr/bin/defaults', ['read', `${userHome}/Library/Preferences/ByHost/com.apple.notificationcenterui.${uuid}.plist`, 'doNotDisturb'], (err, results) => {
      if (err) return callback(err)
      callback(null, _.contains(results, '1'))
    })
  })
}

function checkVolumeMuted (callback) {
  const script = `output muted of (get volume settings)`
  global.applescript(script, callback)
}

function setVolumeMuted (muted) {
  const script = `set volume ${muted ? 'with' : 'without'} output muted`
  global.applescript(script)
}

export function execute (result) {
  let verb = result.verb

  if (result.direction === -1) {
    if (result.verb === 'turn off') {
      verb = 'turn on'
    } else if (result.verb === 'turn on') {
      verb = 'turn off'
    }
  }

  if (verb === 'turn on') {
    if (result.setting === 'wifi') {
      setWifiEnabled(true)
    } else if (result.setting === 'bluetooth') {
      global.setBluetoothEnabled(true)
    } else if (result.setting === 'Do Not Disturb') {
      checkDoNotDisturbEnabled((err, enabled) => {
        if (!enabled) toggleDoNotDisturbEnabled()
      })
    } else if (result.setting === 'sound') {
      setVolumeMuted(false)
    }
  } else if (verb === 'turn off') {
    if (result.setting === 'wifi') {
      setWifiEnabled(false)
    } else if (result.setting === 'bluetooth') {
      global.setBluetoothEnabled(false)
    } else if (result.setting === 'Do Not Disturb') {
      checkDoNotDisturbEnabled((err, enabled) => {
        if (enabled) toggleDoNotDisturbEnabled()
      })
    } else if (result.setting === 'sound') {
      setVolumeMuted(true)
    }
  } else if (verb === 'toggle') {
    if (result.setting === 'wifi') {
      checkWifiEnabled((err, enabled) => {
        setWifiEnabled(!enabled)
      })
    } else if (result.setting === 'bluetooth') {
      global.checkBluetoothEnabled((err, enabled) => {
        global.setBluetoothEnabled(!enabled)
      })
    } else if (result.setting === 'Do Not Disturb') {
      toggleDoNotDisturbEnabled()
    } else if (result.setting === 'sound') {
      checkVolumeMuted((err, muted) => {
        setVolumeMuted(!muted)
      })
    }
  } else if (verb === 'shutdown') {
    global.applescript('tell application "System Events" to shutdown')
  } else if (verb === 'restart') {
    global.applescript('tell application "System Events" to restart')
  } else if (verb === 'log out') {
    global.applescript('tell application "System Events" to log out')
  } else if (verb === 'sleep') {
    global.applescript('tell application "System Events" to sleep')
  } else if (verb === 'lock') {
    global.system('/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession', ['-suspend'])
  } else if (verb === 'display-off') {
    global.system('/usr/bin/pmset', ['displaysleepnow'])
  } else if (verb === 'screensaver') {
    global.applescript('tell application "System Events" to start current screen saver')
  } else if (verb === 'empty-trash') {
    global.applescript('tell application "Finder" to empty the trash')
  } else if (verb === 'eject-all') {
    global.applescript('tell application "Finder" to eject the disks')
  } else if (verb === 'eject') {
    global.applescript(`
      tell application "Finder"
        repeat with vol in {"${result.volumes.join('", "')}"}
          eject vol
        end repeat
      end tell
    `)
  }
}

export class Sentence extends Phrase {
  describe () {
    return (
      <choice>
        <sequence>
          <choice merge={true}>
            <sequence>
              <list items={[
                  {text: 'disable ', value: 'turn off'},
                  {text: 'enable ', value: 'turn on'},
                  {text: 'toggle ', value: 'toggle'},
                  {text: 'turn off ', value: 'turn off'},
                  {text: 'turn on ', value: 'turn on'}
                ]} limit={3} category='action' id='verb' />
              <argument text='setting' merge={true}>
                <choice>
                  <list items={['wifi', 'airport']} value={{setting: 'wifi'}} limit={1} />
                  <literal text='bluetooth' value={{setting: 'bluetooth'}} />
                  <literal text='Do Not Disturb' value={{setting: 'Do Not Disturb'}} />
                  <literal text='notifications' value={{setting: 'Do Not Disturb', direction: -1}} />
                  <list items={['sound', 'audio', 'the sound']} value={{setting: 'sound'}} limit={1} />
                  <list items={['mute']} value={{setting: 'sound', direction: -1}} limit={1} />
                </choice>
              </argument>
            </sequence>
            <list items={['mute']} limit={1} category='action' value={{setting: 'sound', verb: 'turn off'}} merge={true} />
            <list items={['unmute']} limit={1} category='action' value={{setting: 'sound', verb: 'turn on'}} merge={true} />
            <list items={['do not disturb', 'do not disturb me']} limit={1} category='action' value={{setting: 'Do Not Disturb', verb: 'turn on'}} merge={true} />
          </choice>
          <sequence optional={true} id='duration'>
            <literal text=' for ' category='conjunction' />
            <argument text='amount of time' merge={true}>
              <TimeDuration />
            </argument>
          </sequence>
        </sequence>
        <choice>
          <sequence>
            <list items={[
                {text: 'restart', value: 'restart'},
                {text: 'shutdown', value: 'shutdown'},
                {text: 'sleep', value: 'sleep'},
                {text: 'lock', value: 'lock'},
                {text: 'log out', value: 'log out'},
                {text: 'logout', value: 'log out'},
                {text: 'log off', value: 'log out'},
                {text: 'logoff', value: 'log out'}
              ]} category='action' id='verb' limit={5} />
            <list items={[' computer', ' the computer', ' system', ' the system']} limit={1} optional={true} prefered={false} limited={true} category='action' />
          </sequence>
          <literal text='empty Trash' category='action' value='empty-trash' id='verb'/>
          <sequence id='verb'>
            <literal text='turn on ' category='action' value='screensaver' merge={true} />
            <literal text='the ' optional={true} prefered={false} limited={true} category='action' />
            <list items={['screensaver', 'screensaver']} limit={1} category='action' />
          </sequence>
          <sequence id='verb'>
            <literal text='turn off ' category='action' />
            <literal text='the ' optional={true} prefered={false} limited={true} category='action' />
            <choice merge={true}>
              <list items={['display', 'screen']} limit={1} category='action' value='display-off' />
              <list items={['computer', 'system']} limit={1} category='action' value='shutdown' />
            </choice>
          </sequence>
          <sequence>
            <list items={['eject ', 'unmount ', 'dismount ']} category='action' id='verb' value='eject' />
            <choice merge={true}>
              <list items={['all', 'everything', 'all devices']} limit={1} category='action' id='verb' value='eject-all' />
              <repeat id='volumes' separator={<list items={[', ', ', and ', ' and ']} limit={1} />}>
                <MountedVolume />
              </repeat>
            </choice>
          </sequence>
        </choice>
      </choice>
    )
  }
}

export default {
  sentences: [{Sentence, execute}]
}

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
