'use babel';
/** @jsx etch.dom */

import etch from 'etch';
import EtchComponent from './etch-component';
import { subscribe } from './store-utils';
import { CompositeDisposable } from 'atom';

export default class GoBuildView extends EtchComponent {

  constructor(props, children) {
    //console.log("GoBuildView::constructor " + JSON.stringify(props))
    props.msan_enabled = true;
    super(props, children);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      subscribe(props.store, 'services.goconfig', this.handleGoConfigChange.bind(this))
    );
  }

  /**
   * Update UI elements which are dependant on particular goconfig vars.
   * E.g. memory sanitizer is only compatible with clang compiler.
   */
  handleGoConfigChange(state, oldState) {
    if (state !== null) {
      this.update({msan_enabled: state.CC === 'clang'}, this.children);
    }
  }

  render() {
    console.log("Render GoBuildView");

    const cpus = String(this.getNumberCPUs());
    var buildArgs = this.props.store.getState().build.build_args;
    var install_flag_checked = buildArgs.install_flag && buildArgs.install_flag === '-i' ? true : false;
    var force_flag_checked = buildArgs.force_flag && buildArgs.force_flag === '-a' ? true : false;
    var print_no_run_flag_checked = buildArgs.print_no_run_flag && buildArgs.print_no_run_flag === '-n' ? true : false;
    var print_flag_checked = buildArgs.print_flag && buildArgs.print_flag === '-x' ? true : false;
    var race_flag_checked = buildArgs.race_flag && buildArgs.race_flag === '-race' ? true : false;

    var msan_flag_checked = buildArgs.msan_flag && buildArgs.msan_flag === '-msan' && this.msan_enabled ? true : false;
    var msan_flag_disabled = this.props.msan_enabled ? {} : {'disabled': 'disabled'};
    var verbose_flag_checked = buildArgs.verbose_flag && buildArgs.verbose_flag === '-v' ? true : false;
    var work_flag_checked = buildArgs.work_flag && buildArgs.work_flag === '-work' ? true : false;

    var go_build_command_line = buildArgs ? Object.values(buildArgs).join(' ') : '';
    var output_flag = buildArgs.output_flag ? buildArgs.output_flag.substr(3) : '';
    var program_number_flag = buildArgs.program_number_flag && buildArgs.program_number_flag !== cpus ? buildArgs.program_number_flag.substr(3) : cpus;

    return <div className='go-build-panel' >
      <div id='go-build-panel-button-bar' className='go-build-panel-button-bar'>
        <div className='go-build-block'>
          <button className='btn btn-primary icon icon-zap' onclick={this.handleBuildCick} title='Run go build' >Build</button>
        </div>
        <div className='go-build-block'>
          <button className='btn btn-error icon icon-trashcan' onclick={this.handleCleanCick} title='Run go clean' >Clean</button>
        </div>
        <div className='go-build-block'>
          <button className='btn btn-primary icon icon-home' onclick={this.handleDefaultCick} title='Revert to default settings' >Reset</button>
        </div>
      </div>
      <div className='go-panel-content'>
        <div className='go-build-block'>
          <input type='text' id='go_build_command_line' className='input-text' readonly='readonly' value={go_build_command_line} style='width: 100%;' />
        </div>
        <div id='go-build-panel-settings' className='go-build-panel-settings'>
          <div className='go-build-block'>
            <label for='install_flag'><input type='checkbox' id='install_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-i'
            checked={install_flag_checked}/> Install the packages that are dependencies of the target.</label>
          </div>
          <div className='go-build-block'>
            <label for='output_flag'><input id='output_flag' type='text' className='input-text native-key-bindings' placeholder='Target file name' style='width: 50%;'
            onchange={this.handleInputChange} data-flag='-o' value={output_flag} /> Force build to write the resulting executable or object to the named output file, instead of the
             default behavior. Only allowed when compiling a single package.</label>
          </div>
          <div className='go-build-block'>
            <label for='force_flag'><input type='checkbox' id='force_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-a'
            checked={force_flag_checked} /> Force rebuilding of packages that are already up-to-date.</label>
          </div>
          <div className='go-build-block'>
            <label for='print_flag'><input type='checkbox' id='print_flag' className='input-toggle' onchange={this.handleFlagChange}  data-flag='-x'
            checked={print_flag_checked} /> Print the commands.</label>
          </div>
          <div className='go-build-block'>
            <label for='print_no_run_flag'><input type='checkbox' id='print_no_run_flag' className='input-toggle' onchange={this.handleFlagChange}  data-flag='-n'
            checked={print_no_run_flag_checked} /> Print the commands, but do not run them.</label>
          </div>
          <div className='go-build-block'>
            <label for='program_number_flag'><input type='number' id='program_number_flag' min='1' max={cpus} defaultValue={cpus} value={program_number_flag}
            placeholder={'1-' + cpus} className='input-number' oninput={this.handleInputChange} data-flag='-p' /> The number of programs, such as build
            commands or	test binaries, that can be run in parallel. Defaults to the number of CPUs available.</label>
          </div>
          <div className='go-build-block'>
            <label for='race_flag'>
            <input type='checkbox' id='race_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-race'checked={race_flag_checked} /> Enable
            data race detection. Supported only on linux/amd64, freebsd/amd64, darwin/amd64 and windows/amd64. Incompatible with msan flag.</label>
          </div>
          <div className='go-build-block'>
            <label for='msan_flag'><input type='checkbox' id='msan_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-msan'
            checked={msan_flag_checked} {...msan_flag_disabled}/> Enable interoperation with memory sanitizer. Supported only on linux/amd64, and only with Clang/LLVM as the host
            C compiler. Incompatible with race flag.</label>
          </div>
          <div className='go-build-block'>
            <label for='verbose_flag'>
            <input type='checkbox' id='verbose_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-v' checked={verbose_flag_checked} /> Print
            the names of packages as they are compiled.</label>
          </div>
          <div className='go-build-block'>
            <label for='work_flag'>
            <input type='checkbox' id='work_flag' className='input-toggle' onchange={this.handleFlagChange} data-flag='-work' checked={work_flag_checked} /> Print
            the name of the temporary work directory and do not delete it when exiting.</label>
          </div>
        </div>
      </div>
    </div>;
  }

  updateCommandLine() {
    var cmdLine = Object.values(this.props.store.getState().build.build_args).join(' ');
    document.getElementById('go_build_command_line').value = cmdLine;
  }

  getNumberCPUs() {
    const os = require('os');
    return os.cpus().length;
  }

  handleFlagChange(e) {

    if (e.target.checked) {
      this.props.store.dispatch({ type: 'SET_BUILD_ARG', arg: {[e.target.id]: e.target['data-flag']} });
    } else {
      this.props.store.dispatch({ type: 'UNSET_BUILD_ARG', arg: e.target.id });
    }

    if (e.target.id === 'msan_flag' && e.target.checked) {
      // Uncheck -race as mutually exclusive
      this.props.store.dispatch({ type: 'UNSET_BUILD_ARG', arg: 'race_flag' });
      document.getElementById('race_flag').checked = false;
    }

    if (e.target.id === 'race_flag' && e.target.checked) {
      // Uncheck -msan as mutually exclusive
      this.props.store.dispatch({ type: 'UNSET_BUILD_ARG', arg: 'msan_flag' });
      document.getElementById('msan_flag').checked = false;
    }
    this.updateCommandLine();
  }

  handleInputChange(e) {
    if (e.target.id === 'program_number_flag' && e.target.value === String(this.getNumberCPUs())) {
      // go build defaults to the number of available cores, so just remove from command line
      this.props.store.dispatch({ type: 'UNSET_BUILD_ARG', arg: e.target.id });
      //delete(this.props.store.buildArgs[e.target.id])
    } else {
      if (e.target.value) {
        this.props.store.dispatch({ type: 'SET_BUILD_ARG', arg: {[e.target.id]: e.target['data-flag'] + ' ' + e.target.value} });
      } else {
        this.props.store.dispatch({ type: 'UNSET_BUILD_ARG', arg: e.target.id });
      }
    }
    this.updateCommandLine();
  }

  handleBuildCick(e) {
    this.props.store.dispatch({ type: 'CLEAR_OUTPUT_CONTENT' });
    atom.commands.dispatch(e.target, 'go-build:' + 'start');
  }

  handleCleanCick(e) {
    this.props.store.dispatch({ type: 'CLEAR_OUTPUT_CONTENT' });
    atom.commands.dispatch(e.target, 'go-build:' + 'clean');
  }

  handleDefaultCick(e) {
    this.props.store.dispatch({ type: 'CLEAR_BUILD_ARGS' });
    //this.props.store.buildArgs = {}
    var inputs = document.getElementById('go-build-panel-settings').querySelectorAll('input');
    for (let input of inputs) {
      switch(input.type) {
        case 'checkbox':
          input.checked = false;
          break;
        case 'number':
          input.value = input.defaultValue;
          break;
        case 'text':
          input.value = '';
          break;
      }
    }
    this.updateCommandLine();
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
    //console.log('Serializing GoBuildView: ' + JSON.stringify(this.props.store.buildArgs))
    return {deserializer: 'go-build/GoBuildView', data: this.props.store.getState().build.build_args};
  }

  // Tear down any state and detach
  destroy() {
    console.log('Destroying GoBuildView');
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

}

GoBuildView.bindFns = [ 'handleBuildCick', 'handleCleanCick', 'handleFlagChange', 'handleInputChange', 'handleDefaultCick' ];
