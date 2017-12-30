'use babel';
/** @jsx etch.dom */

import etch from 'etch'
import EtchComponent from './etch-component'

export default class GoBuildView extends EtchComponent {

  constructor(props, children) {
    console.log("Creating GoBuildView: " + JSON.stringify(props))
    if (!props.store.buildArgs) {
      props.store.buildArgs = {}
    }
    super(props, children);
  }

  render() {
    console.log("Render GoBuildView")

    const cpus = String(this.getNumberCPUs())
    var buildArgs = this.props.store.buildArgs
    var install_flag_checked = buildArgs.install_flag && buildArgs.install_flag == '-i' ? true : false
    var force_flag_checked = buildArgs.force_flag && buildArgs.force_flag == '-a' ? true : false
    var print_flag_checked = buildArgs.print_flag && buildArgs.print_flag == '-n' ? true : false
    var race_flag_checked = buildArgs.race_flag && buildArgs.race_flag == '-race' ? true : false
    var msan_flag_checked = buildArgs.msan_flag && buildArgs.msan_flag == '-msan' ? true : false
    var verbose_flag_checked = buildArgs.verbose_flag && buildArgs.verbose_flag == '-v' ? true : false
    var work_flag_checked = buildArgs.work_flag && buildArgs.work_flag == '-work' ? true : false

    var go_build_command_line = buildArgs ? Object.values(buildArgs).join(' ') : ''
    var output_flag = buildArgs.output_flag ? buildArgs.output_flag.substr(3) : ''
    var program_number_flag = buildArgs.program_number_flag ? buildArgs.program_number_flag.substr(3) : cpus

    return <div className='go-build-panel' >
      <br/>
      <div>
        <button className='btn btn-primary icon icon-zap inline-block-tight' onclick={this.handleBuildCick} >Build</button>
        <button className='btn btn-error icon icon-trashcan inline-block-tight' onclick={this.handleCleanCick} >Clean</button>
      </div>
      <br/>
      <div className='go-build-panel-content'>
      <div className='block'>
        <input type='text' id='go_build_command_line' className='input-text' readonly='readonly' value={go_build_command_line} />
      </div>
      <div className='block'>
        <label for='install_flag'><input type='checkbox' id='install_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-i'
        checked={install_flag_checked}/>
        -i : installs the packages that are dependencies of the target.</label>
      </div>
      <div className='block'>
        <label for='output_flag'><input id='output_flag' type='text' className='input-text native-key-bindings' placeholder='Text' width='25%'
        onchange={this.handleInputChange} data-flag='-o' value={output_flag} />
         -o : only allowed when compiling a single package. Forces build to write the resulting executable or object to the named output file, instead of the
         default behavior.</label>
      </div>
      <div className='block'>
        <label for='force_flag'><input type='checkbox' id='force_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-a'
        checked={force_flag_checked} /> -a : force rebuilding of packages that are already up-to-date.</label>
      </div>
      <div className='block'>
        <label for='print_flag'><input type='checkbox' id='print_flag' className='input-toggle' onchange={this.handleFlagChange}  data-flag='-n'
        checked={print_flag_checked} /> -n : print the commands but do not run them.</label>
      </div>
      <div className='block'>
        <label for='program_number_flag'><input type='number' id='program_number_flag' min='1' max={cpus} defaultValue={cpus} value={program_number_flag}
        placeholder={'1-' + cpus} className='input-number' oninput={this.handleInputChange} data-flag='-n' /> -n p : the number of programs, such as build
        commands or	test binaries, that can be run in parallel. The default is the number of CPUs available.</label>
      </div>
      <div className='block'>
        <label for='race_flag'><input type='checkbox' id='race_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-race'checked={race_flag_checked} /> -race :
        Enable data race detection. Supported only on linux/amd64, freebsd/amd64, darwin/amd64 and windows/amd64.</label>
      </div>
      <div className='block'>
        <label for='msan_flag'><input type='checkbox' id='msan_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-msan' checked={msan_flag_checked} /> -msan :
        Enable interoperation with memory sanitizer. Supported only on linux/amd64, and only with Clang/LLVM as the host C compiler.</label>
      </div>
      <div className='block'>
        <label for='verbose_flag'><input type='checkbox' id='verbose_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-v' checked={verbose_flag_checked} /> -v :
        print the names of packages as they are compiled.</label>
      </div>
      <div className='block'>
        <label for='work_flag'><input type='checkbox' id='work_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-work' checked={work_flag_checked} />
        -work : Print the name of the temporary work directory and do not delete it when exiting.</label>
      </div>
      </div>
    </div>
  }

  updateCommandLine() {
    var cmdLine = Object.values(this.props.store.buildArgs).join(' ')
    document.getElementById('go_build_command_line').value = cmdLine
  }

  getNumberCPUs() {
    const os = require('os')
    return os.cpus().length
  }

  handleFlagChange(e) {
    console.log(e.target.id + ' changed to ' + e.target.checked)
    this.props.store.buildArgs[e.target.id] = e.target.checked ? e.target['data-flag'] : ''
    console.log('buildArgs: ' + JSON.stringify(this.props.store.buildArgs))
    this.updateCommandLine()
  }

  handleInputChange(e) {
    console.log(e.target.id + ' changed to ' + e.target.value)
    this.props.store.buildArgs[e.target.id] = e.target.value ? e.target['data-flag'] + ' ' + e.target.value : ''
    console.log('buildArgs: ' + JSON.stringify(this.props.store.buildArgs))
    this.updateCommandLine()
  }

  handleBuildCick(e) {
    this.props.store.dispatch({ type: 'CLEAR_OUTPUT_CONTENT' })
    atom.commands.dispatch(e.target, 'go-build:' + 'start')
  }

  handleCleanCick(e) {
    this.props.store.dispatch({ type: 'CLEAR_OUTPUT_CONTENT' })
    atom.commands.dispatch(e.target, 'go-build:' + 'clean')
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Go Build';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://go-build';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'bottom';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    console.log('Serializing GoBuildView: ' + JSON.stringify(this.props.store.buildArgs))
    return {deserializer: 'go-build/GoBuildView', data: this.props.store.buildArgs}
  }

  // Tear down any state and detach
  destroy() {
    console.log('Destroying GoBuildView')
  }

}

GoBuildView.bindFns = [ 'handleBuildCick', 'handleCleanCick', 'handleFlagChange', 'handleInputChange' ]
