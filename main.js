"use strict";

/*
 * Created with @iobroker/create-adapter v2.0.2
 */

// The adapter-core module gives you access to the core ioBroker functions
const utils = require("@iobroker/adapter-core");
const PioneerTypes = require("./lib/PioneerTypes.js");
const PioneerDevice = require("./lib/PioneerIPControl.js");

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
		this.device = new PioneerDevice();
		// Connect Log Handlers
		this.device.log = {
			info:  (msg) => { this.log.info(msg); },
			warn:  (msg) => { this.log.warn(msg); },
			error: (msg) => { this.log.error(msg); },
			debug: (msg) => { this.log.debug(msg); },
			silly: (msg) => { this.log.silly(msg); },
		};
	}

	async removeUnusedDeviceStates(reportOnly=true) {
		const devProps = this.device.getProperties();
		const states = await this.getStatesAsync("*");
		for(const st in states) {
			const stShortName = st.replace(this.name + "." + this.instance + ".", "");
			if( !devProps.includes(stShortName) && !["query", "command", "active", "info.connection"].includes(stShortName) ) {
				if( !reportOnly ) {
					await this.delObjectAsync(st);
					this.log.warn("Unused State '" + st + "' deleted");
				} else {
					this.log.warn("Unused State '" + st + "' is not processed by this Adapter");
				}
			}
		}
	}

	async removeUnusedDeviceChannels(reportOnly=true) {
		const devChans = this.device.getChannels();
		const channels = await this.getChannelsAsync();
		for(const ch of channels) {
			const chShortName = ch._id.replace(this.name + "." + this.instance + ".", "");
			if( !devChans.includes(chShortName) && chShortName != "info" ) {
				if( !reportOnly ) {
					await this.delObjectAsync(ch._id);
					this.log.warn("Unused Channel '" + ch._id + "' deleted");
				} else {
					this.log.warn("Unused Channel '" + ch._id + "'");
				}
			}
		}
	}

	async stateAndChannelCleanup(remove=false)
	{
		const devProps = this.device.getProperties();
		const devChans = this.device.getChannels();
		const states = await this.getStatesAsync("*");
		const channels = await this.getChannelsAsync();

		for(const st in states) {
			const stShortName = st.replace(this.name + "." + this.instance + ".", "");
			if( !devProps.includes(stShortName) && !["query", "command", "active", "info.connection"].includes(stShortName) ) {
				if( remove ) {
					await this.delObjectAsync(st);
					this.log.warn("Unused State '" + st + "' deleted");
				} else {
					this.log.warn("Unused State '" + st + "' is not processed by this Adapter");
				}
			}
		}
		for(const ch of channels) {
			const chShortName = ch._id.replace(this.name + "." + this.instance + ".", "");
			if( !devChans.includes(chShortName) && chShortName != "info" ) {
				if( remove ) {
					await this.delObjectAsync(ch._id);
					this.log.warn("Unused Channel '" + ch._id + "' deleted");
				} else {
					this.log.warn("Unused Channel '" + ch._id + "'");
				}
			}
		}
	}

	/**
	 * Create Device Channels from available Channels in Device
	 * @returns {Promise<void>}
	 */
	async createDeviceChannels() {
		// Create Channels
		for(const ch of this.device.getChannels()) {
			await this.setObjectNotExistsAsync(ch, {
				_id: ch,
				type: "channel",
				common: { name: ch },
				native: {}
			});
		}
	}

	/**
	 * Create Device States from available States in Device
	 * @returns {Promise<void>}
	 */
	async createDeviceStates() {
		// Create Device States
		for(const st of this.device.getProperties()) {
			const propInfo = this.device.getPropertyInfo(st);
			if( propInfo && propInfo.metadata ) {
				/** @type {ioBroker.StateObject} */
				const stateObject = {
					_id: st,
					type: "state",
					common: {
						name: st,
						type: (propInfo.metadata.type) ? propInfo.metadata.type : "string",
						role: (propInfo.metadata.role) ? propInfo.metadata.role : "variable",
						unit: (propInfo.metadata.unit) ? propInfo.metadata.unit : undefined,
						read: propInfo.canRead,
						write: propInfo.canWrite,
						states: (propInfo.metadata.states) ? propInfo.metadata.states : undefined
					},
					native: {}
				};
				await this.setObjectNotExistsAsync(st, stateObject);
			}
		}
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// Init Device
		this.device.setConfig(this.config.host, this.config.port, this.config.autoreconnect, this.config.autoreconnectRetries, 30);
		this.device.setOption(PioneerTypes.Option.CUSTOM_INPUT_NAMES, this.config.showCustomInputNames);
		this.device.setOption(PioneerTypes.Option.VOL_LIMIT_MIN, this.config.volumeMin);
		this.device.setOption(PioneerTypes.Option.VOL_LIMIT_MAX, this.config.volumeMax);

		// Set Device Features
		this.device.setFeatures(this.config.features);
		this.log.info("Selected Features: " + this.config.features.join(","));

		// Register internal States
		await this.setObjectNotExistsAsync("query", { type: "state", common: { name: "Query Status", def: false, type: "boolean", role: "button", read: false, write: true, }, native: {}});
		await this.setObjectNotExistsAsync("command", {	type: "state", common: { name: "Command", def: "", type: "string", role: "text", read: false, write: true, }, native: {}});
		await this.setObjectNotExistsAsync("active", { type: "state", common: { name: "Active", def: true, type: "boolean", role: "switch", read: true, write: true, desc: "Enabled/Disable IP Connection to AVR" }, native: {}});

		// Remove(/Report) Unused States and Channels
		await this.removeUnusedDeviceStates(!this.config.removeUnusedStates);
		await this.removeUnusedDeviceChannels(!this.config.removeUnusedStates);

		// Create missing Channels and States
		await this.createDeviceChannels();
		await this.createDeviceStates();

		// Subscribe to all State Changes
		this.subscribeStates("*");

		// Connect "connect" Handler
		this.device.on("connect", () => {
			this.setState("info.connection", true, true);
		});
		// Connect "close" Handler
		this.device.on("close", () => {
			if( this.config.clearOnDisconnect ) {
				this.device.getProperties().forEach((name) => {
					this.setState(name, { val: null, ack: true});
				});
			}
			this.setState("info.connection", false, true);
		});
		// Connect "changed" Handler
		this.device.on("changed", async (name) => {
			// update connection state by each message from device
			this.setState("info.connection", true, true);
			await this.setStateAsync(name, { val: this.device.getValue(name), ack: true});
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
		const propInfo = this.device.getPropertyInfo(varName);
		if( propInfo) {
			if( propInfo.canWrite ) {
				// Write to Device
				if( this.device.setValue(varName, state.val) ) {
					this.log.debug("[WRITE_SUCCESS]: Set Device Value '" + varName + "' from state '" + this.name + "." + this.instance + "." + varName + "' with value: " + state.val);
					// Auto Clear buttons
					if( propInfo.metadata ) {
						if( propInfo.metadata.role == "button" ) {
							this.setState(varName, {val: false, ack: true});
						}
					}
					// aknowledge setting of value (even if no result is return by device)
					if( this.config.emulateStateChanges ) {
						this.setState(varName, {val: state.val, ack: true});
					}
				} else {
					this.log.debug("[WRITE_ERR_NO_CONNECTION]: Set Device Value '" + varName + "' from state '" + this.name + "." + this.instance + "." + varName + "' with value: " + state.val);
					// reset State if write failed
					this.setState(varName, {val: this.device.getValue(varName), ack: true});
				}
			} else {
				this.log.debug("[WRITE_ERR_NOT_WRITABLE]: Set Device Value '" + varName + "' from state '" + this.name + "." + this.instance + "." + varName + "' with value: " + state.val);
				// overwrite variable changes to readonly vars
				this.setState(varName, {val: this.device.getValue(varName), ack: true});
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