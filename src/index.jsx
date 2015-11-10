/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import {TimeDuration} from 'lacona-phrase-datetime'
import {MountedVolume} from 'lacona-phrase-system-state'

export function execute (result) {

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
                  <list items={['sound', 'audio']} value={{setting: 'the sound'}} limit={1} />
                  <list items={['sleep', 'autosleep']} value={{setting: 'automatic sleeping'}} limit={1} />
                  <literal text='Dock magnification' value={{setting: 'Dock magnification'}} />
                  <list items={['Dock hiding', 'dock autohide', 'dock autohiding']} value={{setting: 'Dock hiding'}} limit={1} />
                </choice>
              </argument>
            </sequence>
            <list items={['caffeinate', 'do not sleep', 'do not go to sleep']} limit={1} category='action' value={{setting: 'automatic sleeping', verb: 'turn off'}} />
            <list items={['do not disturb', 'do not disturb me']} limit={1} category='action' value={{setting: 'Do Not Disturb', verb: 'turn on'}} />
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
                {text: 'restart', value: 'restart the computer'},
                {text: 'shutdown', value: 'shutdown the computer'},
                {text: 'sleep', value: 'put the computer to sleep'},
                {text: 'lock', value: 'lock the computer'}
              ]} category='action' id='verb' />
            <list items={[' computer', ' the computer', ' system', ' the system']} limit={1} optional={true} prefered={false} limited={true} category='action' />
          </sequence>
          <literal text='empty Trash' category='action' value='empty the Trash' id='verb'/>
          <sequence id='verb'>
            <literal text='turn on ' category='action' value='turn on the screensaver' merge={true} />
            <literal text='the ' optional={true} prefered={false} limited={true} category='action' />
            <list items={['screensaver', 'screen saver']} limit={1} category='action' />
          </sequence>
          <sequence id='verb'>
            <literal text='turn off ' category='action' />
            <literal text='the ' optional={true} prefered={false} limited={true} category='action' />
            <choice merge={true}>
              <list items={['display', 'screen']} limit={1} category='action' value='turn off the display' />
              <list items={['computer', 'system']} limit={1} category='action' value='shutdown the computer' />
            </choice>
          </sequence>
          <sequence>
            <list items={['eject ', 'unmount ', 'dismount ']} category='action' id='verb' value='eject' />
            <choice merge={true}>
              <list items={['all', 'everything', 'all devices']} limit={1} category='action' id='verb' value='eject every volume and drive' />
              <MountedVolume id='object' />
            </choice>
          </sequence>
        </choice>
      </choice>
    )
  }
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
