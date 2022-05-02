import {RunState} from '../runTwoslashRequests'
import {createCommentText} from '../updatesIssue'

describe('updatesIssue', () => {
  test('makeMessageForMainRun', () => {
    const request = {block: {content: 'foo', lang: 'ts', tags: ['repro']}, description: 'Request'}
    const text = createCommentText(
      [
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 922,
          label: '4.2.2',
          state: 1
        },
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 797,
          label: '4.3.2',
          state: 1
        },
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 848,
          label: '4.4.2',
          state: 1
        },
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 898,
          label: '4.5.2',
          state: 1
        },
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 125918,
          label: '4.6.2',
          state: 1
        },
        {
          fails: [
            "'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.",
            "Binding element 'value1' implicitly has an 'any' type."
          ],
          assertions: [],
          time: 173988,
          label: 'Nightly',
          state: 1
        }
      ],
      request
    )

    expect(text).toMatchInlineSnapshot(`
      ":wave: Hi, I'm the [Repro bot](https://github.com/microsoft/TypeScript-Twoslash-Repro-Action/tree/master/docs/user-facing.md). I can help narrow down and track compiler bugs across releases! This comment reflects the current state of the repro in the issue body running against the nightly TypeScript.<hr />

      Request

      <p>:x: Failed: 
       - <ul><li><code>'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.</code></li><li><code>Binding element 'value1' implicitly has an 'any' type.</code></li></ul></p>

      ⚠️ Way slower than historical runs

      <details>
        <summary>Historical Information</summary>

        <table role=\\"table\\">
          <thead>
            <tr>
              <th width=\\"250\\">Version</th>
              <th width=\\"80%\\">Reproduction Outputs</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            
      <tr>
      <td>4.6.2</td>
      <td>
        <p><p>:x: Failed: 
       - <ul><li><code>'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.</code></li><li><code>Binding element 'value1' implicitly has an 'any' type.</code></li></ul></p></p>
      </td>
      <td>⚠️ Way slower</td>
      </tr>

      <tr>
      <td>4.2.2, 4.3.2, 4.4.2, 4.5.2</td>
      <td>
        <p><p>:x: Failed: 
       - <ul><li><code>'value1' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.</code></li><li><code>Binding element 'value1' implicitly has an 'any' type.</code></li></ul></p></p>
      </td>
      <td></td>
      </tr>
          </tbody>
        </table>

        </detail>
        "
    `)
  })
})
