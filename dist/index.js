/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(186));
const child_process_1 = __nccwpck_require__(129);
const SIGNAL_NAME_TO_NUMBER_MAP = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGQUIT': 3,
    'SIGILL': 4,
    'SIGTRAP': 5,
    'SIGABRT': 6,
    'SIGIOT': 6,
    'SIGBUS': 7,
    'SIGFPE': 8,
    'SIGKILL': 9,
    'SIGUSR1': 10,
    'SIGSEGV': 11,
    'SIGUSR2': 12,
    'SIGPIPE': 13,
    'SIGALRM': 14,
    'SIGTERM': 15,
    'SIGSTKFLT': 16,
    'SIGCHLD': 17,
    'SIGCONT': 18,
    'SIGSTOP': 19,
    'SIGTSTP': 20,
    'SIGTTIN': 21,
    'SIGTTOU': 22,
    'SIGURG': 23,
    'SIGXCPU': 24,
    'SIGXFSZ': 25,
    'SIGVTALRM': 26,
    'SIGPROF': 27,
    'SIGWINCH': 28,
    'SIGIO': 29,
    'SIGPOLL': 29,
    'SIGPWR': 30,
    'SIGSYS': 31,
    'SIGUNUSED': 31,
    // there isn't actually a number here.
    'SIGBREAK': 97,
    'SIGINFO': 98,
    'SIGLOST': 99,
};
async function runXcodebuild(args, useXcpretty, arch) {
    var _a;
    const xcodebuildOut = useXcpretty ? 'pipe' : process.stdout;
    var xcodebuildCommand = 'xcodebuild';
    var xcodebuildArgs = args;
    if (arch !== undefined) {
        xcodebuildArgs = [arch, xcodebuildCommand, ...xcodebuildArgs];
        xcodebuildCommand = 'arch';
    }
    const xcodebuild = child_process_1.spawn(xcodebuildCommand, xcodebuildArgs, { stdio: ['inherit', xcodebuildOut, process.stderr] });
    let finishedPromise = new Promise((resolve, reject) => {
        xcodebuild.on('error', reject);
        xcodebuild.on('exit', (exitCode, signal) => {
            if (exitCode) {
                resolve(exitCode);
            }
            else if (signal) {
                resolve(SIGNAL_NAME_TO_NUMBER_MAP[signal]);
            }
        });
    });
    if (useXcpretty) {
        var xcprettyCommand = 'xcpretty';
        var xcprettyArgs = [];
        if (arch !== undefined) {
            xcprettyArgs = [arch, xcprettyCommand, ...xcprettyArgs];
            xcprettyCommand = 'arch';
        }
        const xcpretty = child_process_1.spawn(xcprettyCommand, xcprettyArgs, { stdio: ['pipe', process.stdout, process.stderr] });
        (_a = xcodebuild.stdout) === null || _a === void 0 ? void 0 : _a.pipe(xcpretty.stdin);
        finishedPromise = finishedPromise.then((xcodeCode) => new Promise((resolve, reject) => {
            xcpretty.on('error', reject);
            xcpretty.on('exit', (xcprettyCode, xcprettySignal) => {
                if (xcodeCode == 0) {
                    if (xcprettyCode) {
                        resolve(xcprettyCode);
                    }
                    else if (xcprettySignal) {
                        resolve(SIGNAL_NAME_TO_NUMBER_MAP[xcprettySignal]);
                    }
                }
                else {
                    resolve(xcodeCode);
                }
            });
        }));
    }
    const exitCode = await finishedPromise;
    if (exitCode != 0) {
        throw new Error(`Xcodebuild action failed (${exitCode})!`);
    }
}
async function main() {
    let xcodebuildArgs = [];
    core.startGroup('Validating input');
    const workspace = core.getInput('workspace');
    const project = core.getInput('project');
    const spmPackage = core.getInput('spm-package');
    if ((!workspace && !project && !spmPackage)
        || (workspace && project && spmPackage)
        || (workspace && project)
        || (workspace && spmPackage)
        || (project && spmPackage)) {
        throw new Error("Either `project`, `workspace` or `spm-package-path` must be set, but they are mutually exclusive!");
    }
    else if (workspace) {
        xcodebuildArgs.push('-workspace', workspace);
    }
    else if (project) {
        xcodebuildArgs.push('-project', project);
    }
    const scheme = core.getInput('scheme', { required: !!workspace || !!spmPackage });
    if (scheme) {
        xcodebuildArgs.push('-scheme', scheme);
    }
    function addInputArg(inputName, argName) {
        const value = core.getInput(inputName);
        if (value) {
            xcodebuildArgs.push(`-${argName !== null && argName !== void 0 ? argName : inputName}`, value);
        }
    }
    function addBoolArg(inputName, argName) {
        const value = core.getInput(inputName);
        if (value) {
            xcodebuildArgs.push(`-${argName !== null && argName !== void 0 ? argName : inputName}`, value == 'true' ? 'YES' : 'NO');
        }
    }
    function addFlagArg(inputName, argName) {
        if (core.getInput(inputName) == 'true') {
            xcodebuildArgs.push(`-${argName !== null && argName !== void 0 ? argName : inputName}`);
        }
    }
    addInputArg('target');
    addInputArg('destination');
    addInputArg('configuration');
    addInputArg('sdk');
    addInputArg('arch');
    addInputArg('xcconfig');
    addInputArg('jobs');
    addFlagArg('parallelize-targets', 'parallelizeTargets');
    addBoolArg('enable-code-coverage', 'enableCodeCoverage');
    addBoolArg('parallel-testing-enabled');
    addFlagArg('quiet');
    addFlagArg('hide-shell-script-environment', 'hideShellScriptEnvironment');
    addBoolArg('enable-address-sanitizer', 'enableAddressSanitizer');
    addBoolArg('enable-thread-sanitizer', 'enableThreadSanitizer');
    addBoolArg('enable-undefined-behavior-sanitizer', 'enableUndefinedBehaviorSanitizer');
    addInputArg('result-bundle-path', 'resultBundlePath');
    addInputArg('result-bundle-version', 'resultBundleVersion');
    addInputArg('derived-data-path', 'derivedDataPath');
    addInputArg('xcroot');
    addInputArg('xctestrun');
    addInputArg('test-plan', 'testPlan');
    addInputArg('skip-testing');
    addFlagArg('skip-unavailable-actions', 'skipUnavailableActions');
    addFlagArg('allow-provisioning-updates', 'allowProvisioningUpdates');
    addFlagArg('allow-provisioning-device-registration', 'allowProvisioningDeviceRegistration');
    const buildSettings = core.getInput('build-settings');
    if (buildSettings) {
        xcodebuildArgs.push(...buildSettings.split(' '));
    }
    const action = core.getInput('action', { required: true });
    xcodebuildArgs.push(...action.split(' '));
    const useXcpretty = core.getInput('use-xcpretty', { required: true }) == 'true';
    const runWithArch = core.getInput('run-with-arch', { required: false });
    const dryRun = core.isDebug() && core.getInput('dry-run') == 'true';
    // We allow other platforms for dry-runs since this speeds up tests (more parallel builds).
    if (!dryRun && process.platform != "darwin") {
        throw new Error("This action only supports macOS!");
    }
    core.endGroup();
    core.startGroup('Running xcodebuild');
    if (!dryRun) {
        const cwd = process.cwd();
        if (spmPackage) {
            process.chdir(spmPackage);
        }
        try {
            await runXcodebuild(xcodebuildArgs, useXcpretty, runWithArch);
        }
        finally {
            if (spmPackage) {
                process.chdir(cwd);
            }
        }
    }
    else {
        let executedCommand = ['xcodebuild'].concat(xcodebuildArgs);
        if (useXcpretty) {
            executedCommand.push('|', 'xcpretty');
        }
        if (spmPackage) {
            executedCommand = ['pushd', spmPackage, '&&', ...executedCommand, ';', 'popd'];
        }
        core.setOutput('executed-command', executedCommand.join(' '));
    }
    core.endGroup();
}
try {
    main().catch(error => core.setFailed(error.message));
}
catch (error) {
    core.setFailed(error.message);
}


/***/ }),

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {


// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 129:
/***/ ((module) => {

module.exports = require("child_process");;

/***/ }),

/***/ 747:
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(109);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;