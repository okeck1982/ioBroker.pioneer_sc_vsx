"use strict";

/*
 * Created with @iobroker/create-adapter v2.0.2
 */

// The adapter-core module gives you access to the core ioBroker functions
const utils = require("@iobroker/adapter-core");
const pioneer = require("./lib/PioneerIPControl.js");

const DeviceToAdapterNames = [
	{ "field": "power", 				"state":	"general.power", 				"writable": true, 	"changesOnly": false },
	{ "field": "mute", 					"state":	"audio.mute",					"writable": true, 	"changesOnly": false },
	{ "field": "display", 				"state":	"general.display",				"writable": false, 	"changesOnly": false },
	{ "field": "volume", 				"state":	"audio.volume",					"writable": true, 	"changesOnly": false },
	{ "field": "selectedInput", 		"state":	"general.selectedInput",		"writable": true, 	"changesOnly": false },
	{ "field": "hdmiOutput", 			"state":	"general.hdmiOutput",			"writable": true, 	"changesOnly": false },
	{ "field": "speakerSelect", 		"state":	"general.speakerSelect",		"writable": true, 	"changesOnly": false },
	{ "field": "hdmiAudio", 			"state":	"audio.hdmiAudio",				"writable": true, 	"changesOnly": false },
	{ "field": "signalSource", 			"state":	"audio.signalSource",			"writable": true, 	"changesOnly": false },
	{ "field": "currentListeningMode", 	"state":	"audio.currentListeningMode",	"writable": false, 	"changesOnly": true	 },
	{ "field": "selectedListeningMode", "state":	"audio.selectedListeningMode",	"writable": true, 	"changesOnly": false },
	{ "field": "inputSignal", 			"state":	"audio.inputSignal",			"writable": false, 	"changesOnly": true  },
	{ "field": "channelInputFormat", 	"state":	"audio.channelInputFormat",		"writable": false, 	"changesOnly": true  },
	{ "field": "channelOutputFormat", 	"state":	"audio.channelOutputFormat",	"writable": false, 	"changesOnly": true  },
	{ "field": "sleepTimer",			"state": 	"general.sleepTimer",			"writable": true, 	"changesOnly": true	 },
	{ "field": "internetRadioStation",	"state": 	"netradio.station",				"writable": false, 	"changesOnly": true	 },
	{ "field": "internetRadioIcon",		"state": 	"netradio.icon",				"writable": false, 	"changesOnly": true	 },
	{ "field": "internetRadioBitRate",	"state": 	"netradio.bitrate",				"writable": false, 	"changesOnly": true	 },
	{ "field": "internetRadioDescription", "state":	"netradio.description",			"writable": false, 	"changesOnly": true	 },
];

class PioneerScVsx extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "pioneer_sc_vsx",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
		this.device = new pioneer.IPControl();
		// Connect Log Handlers
		this.device.log = {
			info:  (msg) => { this.log.info(msg); },
			warn:  (msg) => { this.log.warn(msg); },
			error: (msg) => { this.log.error(msg); },
			debug: (msg) => { this.log.debug(msg); },
			silly: (msg) => { this.log.silly(msg); },
		};
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// Register States
		await this.setObjectNotExistsAsync("query", { type: "state", common: { name: "Query Status", def: false, type: "boolean", role: "button", read: false, write: true, }, native: {}});
		await this.setObjectNotExistsAsync("command", {	type: "state", common: { name: "Command", def: "", type: "string", role: "text", read: false, write: true, }, native: {}});
		await this.setObjectNotExistsAsync("active", { type: "state", common: { name: "Active", def: true, type: "boolean", role: "switch", read: true, write: true, desc: "Enabled/Disable IP Connection to AVR" }, native: {}});
		await this.setObjectNotExistsAsync("general.power", { _id: "general.power",	type: "state", common: { name: "Power", type: "boolean", role: "switch", read: true, write: true, states: { "false": "OFF", "true": "ON" }}, native: {} });
		await this.setObjectNotExistsAsync("general.display", {	_id: "general.display",	type: "state", common: { name: "Display Text", type: "string", role: "variable", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("general.hdmiOutput", { _id: "general.hdmiOutput", type: "state", common: { name: "HDMI Output", type: "number", role: "remote", read: true, write: true, states: pioneer.PioneerTypes.HdmiOutput },	native: {}});
		await this.setObjectNotExistsAsync("general.selectedInput", { _id: "general.selectedInput",	type: "state", common: { name: "Selected Input", type: "string", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.SelectedInput }, native: {}});
		await this.setObjectNotExistsAsync("general.speakerSelect", {_id: "general.speakerSelect", type: "state", common: { name: "Speakers", type: "number", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.SpeakerSelect }, native: {}});
		await this.setObjectNotExistsAsync("general.sleepTimer", { _id: "general.sleepTimer", type: "state", common: { name: "Sleep Timer", type: "string", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.SleepTimer }, native: {}});
		await this.setObjectNotExistsAsync("audio.hdmiAudio", {	_id: "audio.hdmiAudio",	type: "state", common: { name: "HDMI Audio", type: "number", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.HdmiAudio }, native: {}});
		await this.setObjectNotExistsAsync("audio.signalSource", { _id: "audio.signalSource", type: "state", common: { name: "Signal Source", type: "number", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.SignalSource }, native: {}});
		await this.setObjectNotExistsAsync("audio.inputSignal", { _id: "audio.inputSignal",	type: "state", common: { name: "Input Signal", type: "string", role: "variable", read: true, write: false, desc: "Audio Codec / Frequency" }, native: {}});
		await this.setObjectNotExistsAsync("audio.mute", { _id: "audio.mute", type: "state", common: { name: "Mute", type: "boolean", role: "switch", read: true, write: true, states: { "false": "OFF", "true": "MUTED" }}, native: {}});
		await this.setObjectNotExistsAsync("audio.volume", { _id: "audio.volume", type: "state", common: { name: "Volume", type: "number", role: "variable", read: true, write: true, unit: " dB", min: -80, max: 12 },	native: {}});
		await this.setObjectNotExistsAsync("audio.buttonVolumeUp", {  _id: "audio.buttonVolumeUp", type: "state", common: { name: "turn up volume", type: "boolean", role: "button", read: false, write: true }, native: {}});
		await this.setObjectNotExistsAsync("audio.buttonVolumeDown", {  _id: "audio.buttonVolumeDown", type: "state", common: { name: "turn down volume", type: "boolean", role: "button", read: false, write: true }, native: {}});
		await this.setObjectNotExistsAsync("audio.currentListeningMode", { _id: "audio.currentListeningMode", type: "state", common: { name: "Listening Mode (current)", type: "string", role: "variable", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("audio.selectedListeningMode", {	_id: "audio.selectedListeningMode",	type: "state", common: { name: "Listening Mode (selected)", type: "string", role: "variable", read: true, write: true, states: pioneer.PioneerTypes.SelectedListeningMode }, native: {}});
		await this.setObjectNotExistsAsync("audio.channelInputFormat", { _id: "audio.channelInputFormat", type: "state", common: { name: "Channel Input Format", type: "string", role: "variable", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("audio.channelOutputFormat", { _id: "audio.channelOutputFormat", type: "state", common: { name: "Channel Output Format", type: "string", role: "variable", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("netradio.station", { type: "state", common: { name: "Name of internet radio station", type: "string", role: "variable", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("netradio.icon", { type: "state", common: { name: "Icon of internet radio station", type: "string", role: "text.url", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("netradio.bitrate", { type: "state", common: { name: "Bit rate of internet radio station", type: "string", role: "media.bitrate", read: true, write: false }, native: {}});
		await this.setObjectNotExistsAsync("netradio.description", { type: "state", common: { name: "Description of internet radio station", type: "string", role: "variable", read: true, write: false }, native: {}});

		// Subscribe to State Changes
		this.subscribeStates("*");

		// Init Device
		this.device.setConfig(this.config.host, this.config.port, this.config.autoreconnect, 30, this.config.showCustomInputNames);
		// Connect "connect" Handler
		this.device.on("connect", () => {
			this.setState("info.connection", true, true);
		});
		// Connect "close" Handler
		this.device.on("close", () => {
			if( this.config.clearOnDisconnect ) {
				DeviceToAdapterNames.forEach((i) => {
					this.setState(i.state, { val: null, ack: true});
				});
			}
			this.setState("info.connection", false, true);
		});
		// Connect "changed" Handler
		this.device.on("changed", async (name) => {
			// update connection state by each message from device
			this.setState("info.connection", true, true);
			const dtan = DeviceToAdapterNames.find(i => i.field === name);
			if( dtan ) {
				if( dtan.changesOnly ) {
					this.getState(dtan.state, async (err, state) => {
						if( state )
						{
							if( state.val != this.device[name] || state.ack == false ) {
								await this.setStateAsync(dtan.state, {val: this.device[name], ack: true});
								this.log.debug("[CHANGE_TRACK]: Updating state '" + dtan.state + "' = '" + this.device[name] + "'");
							}
							else
							{
								this.log.debug("[CHANGE_TRACK]: State '" + dtan.state + "' = 'NOT_CHANGED'");
							}
						} else {
							await this.setStateAsync(dtan.state, {val: this.device[name], ack: true});
							this.log.debug("[EMPTY_STATE|CHANGE_TRACK]: Updating state '" + dtan.state + "' = '" + this.device[name] + "'");
						}
					});
				} else {
					await this.setStateAsync(dtan.state, {val: this.device[name], ack: true});
					this.log.debug("[NONE]: Updating state '" + dtan.state + "' = '" + this.device[name] + "'");
				}
			}
		});
		// Start Connection if active
		this.getState("active", (err, state) => {
			if( state && state.val ) {
				this.device.connect();
			}
		});
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Close Connection to Device (if any). This also clears all Timeouts
			this.device.disconnect();
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if( id && state && !state.ack )
		{
			const varName = id.replace(this.name + "." + this.instance + ".", "");
			this.log.debug("[STATE_CHANGED]: '" + this.name + "." + this.instance + "' from '" + id + "'");

			if( !this.processStateChangeCommands(varName, state)) {
				this.processStateChangedDeviceVar(varName,state);
			}
		}
	}

	/**
	 * Process state changes that modifies device variables
	 * @param {string} varName Variable Name
	 * @param {ioBroker.State} state State Data
	 * @returns {boolean} True if command is processed, otherwise false
	 */
	processStateChangeCommands(varName, state) {
		let newStateVal = state.val;
		let processed = true;
		switch(varName) {
			case "active":
				this.device.connected = (state.val == true);
				break;
			case "command":
				this.device.sendCommand(state.val);
				break;
			case "audio.buttonVolumeUp":
				this.device.buttonVolumeUp();
				newStateVal = false;
				break;
			case "audio.buttonVolumeDown":
				this.device.buttonVolumeDown();
				newStateVal = false;
				break;
			case "query":
				this.device.queryStatus();
				newStateVal = false;
				break;
			default:
				processed = false;
				break;
		}
		if( processed ) {
			this.setState(varName, { val: newStateVal, ack: true});
		}
		return processed;
	}

	/**
	 * Process state changes that modifies device variables
	 * @param {string} varName Variable Name
	 * @param {ioBroker.State} state State Data
	 * @returns {void}
	 */
	processStateChangedDeviceVar(varName, state) {
		/* Get Device Variable Name from state name */
		const dtan = DeviceToAdapterNames.find(i => i.state === varName);
		if( dtan && state.val !== null )
		{
			if( dtan.writable )
			{
				let newVal = state.val;
				if( varName == "audio.volume" ) {
					newVal = (newVal > this.config.volumeMax) ? this.config.volumeMax : newVal;
					newVal = (newVal < this.config.volumeMin) ? this.config.volumeMin : newVal;
					if( state.val != newVal ) {
						this.log.warn("[LIMITER]: Req.Val. = " + state.val + " / Set Val. = " + newVal);
					}
				}
				this.log.debug("[WRITE]: Set Device Value '" + dtan.field + "' from state '" + this.name + "." + this.instance + "." + varName + "' with value: " + newVal);
				this.device[dtan.field] = newVal;
				// aknowledge setting of value (even if no result is return by device)
				this.setState(dtan.state, {val: newVal, ack: true});
			}
			else
			{
				// overwrite variable changes to readonly vars
				this.setState(dtan.state, {val: this.device[dtan.field], ack: true});
			}
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new PioneerScVsx(options);
} else {
	// otherwise start the instance directly
	new PioneerScVsx();
}