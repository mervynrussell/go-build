'use babel'
/** @jsx etch.dom */

const etch = require('etch')
import EtchComponent from './etch-component'

const contentTypes = {
  'message': ({ message }) => <span innerHTML={message} />
}

export default class OutputPanel extends EtchComponent {
  constructor(props, children) {
    super(props, children);
  }

  init () {
    if (this.props.model) {
      this.props.model.view = this
    }
    super.init()
  }

  shouldUpdate () {
    return true
  }

  render () {
    const { model } = this.props
    /*if (!model || !model.ready()) {
      return <div>The debugger is not ready ...</div>
    }*/

    const elements = model.props.content.map((o) => {
      const fn = contentTypes[o.type]
      return fn ? fn(o) : null
    }).filter(Boolean)

    return <div className='go-debug-output' tabIndex={-1}>
      <div className='go-debug-output-sidebar'>
        <button type='button' className='btn go-debug-btn-flat icon icon-trashcan'
          onclick={model.handleClickClean} title='Clean' />
      </div>
      <div className='go-debug-output-content'>
        <div ref='content' className='output' scrollTop={this.scrollHeight}>
          {elements}
        </div>
      </div>
    </div>
  }

  readAfterUpdate () {
    let content = this.refs.content
    if (!content) {
      return
    }

    let scrollHeight = content.scrollHeight
    if (scrollHeight && this.scrollHeight !== scrollHeight) {
      this.scrollHeight = scrollHeight
      content.scrollTop = this.scrollHeight
      this.update()
    }
  }
}
