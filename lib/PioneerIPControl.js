"use strict";

const PT = require('./PioneerTypes.js');
const PPD = require('./PioneerPropertyDefinition.js');
const EventEmitter = require('events');
const { Socket } = require('net');

/** @class */
class IPControl extends EventEmitter {
	/* eslint-disable */
	static QUERY_COMMAND_DELAY = 75;
	static EVENT_CHANGED = "changed";
	/* elint-enable */

	// Private Fields
	#client = new Socket();
	#address = { ip: "", port: 23, toString() { return "tcp://" + this.ip + ":" + this.port; } }
	#state = { 
		conn: false, 
		reconn: false, 
		reconnTimeout: 0,
		reconnRetries: 0,
		reconnRetriesCounter: 0,
		sockError: "", 
		queryTimerList: new Array(), 		
		/** @type {Map<string, PT.CustomInputNameEntry>} */
	 	customInputNames: new Map(),
		/** @type {Array<String>} */
		queryQueue: new Array(),
		/** @type {Object.<string,any>} */
	 	propertyValues: new Map(),
		/** @type {Map<number, any>} */
		options: new Map(),
		/** @type {Array<String>} */
		features: Array()
	}	

	/**
	 * @description Default Log Handler
	 * @type {PT.LogHandler}
	 */
	log = {
		info: 	(msg) => console.log("INFO:  " + msg),
		warn: 	(msg) => console.log("WARN:  " + msg),
		error:  (msg) => console.log("ERROR: " + msg),
		debug: 	(msg) => console.log("DEBUG: " + msg),
		silly: 	(msg) => console.log("SILLY: " + msg),		
	}
	// Timers
	#reconnectTimer  = setTimeout(()=>{}, 0);	
	#sabRequestTimer = setTimeout(()=>{}, 0);	
	#queryTimer 	 = setTimeout(()=>{}, 0);

	constructor() {
		super()
		this.#expandVirtualPropertiesDefinition();
		// Attach Socket Connect Handler
		this.#client.on('connect', () => {
			this.#state.conn = true;
			this.#state.reconnRetriesCounter = 0;			
			this.emit('connect');
			this.log.debug("SOCKET[" + this.#address.toString() + "] CONNECTED");
			this.log.info("Connected to " + this.#address.toString());
		});
		// Attach Socket Ready Handler
		this.#client.on('ready', () => { 
			this.log.debug("SOCKET[" + this.#address.toString() + "] READY"); 
			this.queryStatus();
		});
		// Attach Socket DataReceived Handler
		this.#client.on('data', (data) => {			
			data.toString().split("\r\n").forEach( (msg) => { 
				if( msg != "" ) {
					this.log.debug("SOCKET[" + this.#address.toString() + "] RX: " + msg);
					this.#processMessage(msg); 
				}
			});
		});
		// Attach Socket Close Handler
		this.#client.on('close', () => {
			this.#state.conn = false;
			this.emit('close');				
			this.log.debug("SOCKET[" + this.#address.toString() + "] CLOSED");				
			var logMsg = "Connection " + (this.#state.sockError == "" ? ("to "  + this.#address.toString() + " closed") : ("closed (ERROR: " + this.#state.sockError + ")"));
			if (this.#state.reconn) {
				logMsg += ". Reconnect in " + (this.#state.reconnTimeout/1000) + " Sec.";				
				this.#reconnectTimer = setTimeout(() => { this.connect(true) }, this.#state.reconnTimeout);
			}
			this.log.info(logMsg);			
		});
		// Attach Socket Error Handler
		this.#client.on('error', (err) => { 
			this.#state.sockError = err.message;
			this.log.debug("SOCKET[" + this.#address.toString() + "] ERROR: " + err.message); 
		});
		// Attach Socket Timeout Handler
		this.#client.on('timeout', () => { this.log.debug("SOCKET[" + this.#address.toString() + "] TIMEOUT"); });
	}

	// Setter for connected. v = new connection state (false = disconnect (turn of reconnect) / true = connect)
	set connected(v) { if( v ) { this.connect(); } else { this.disconnect(); } }

	/**	 
	 * @description Set TCP connection Parameters
	 * @param {String} host	IP or Hostname of AVR Device
	 * @param {number} port	TCP Port to use (Default 23)
	 * @param {number} reconnectTimeout	Reconnect timeout in Sec. (default = 0 / 0 = disabled)
	 * @param {number} keepAlive Socket KeepAlive Timeout in Sec. (default = 30 / 0 = disabled)
	 * @returns {void}
	 */
	setConfig = (host, port, reconnectTimeout, reconnRetries, keepAlive) => {	
		this.#address.ip = host;
		this.#address.port = port;
		this.#state.reconnTimeout = reconnectTimeout * 1000;
		this.#state.reconnRetries = reconnRetries;
		this.#state.reconnRetriesCounter = 0;
		this.#client.setKeepAlive(true, (keepAlive*1000));
		this.log.debug("SET_CONFIG: Address: " + this.#address.toString() + ", ReconnectTimeout: " + (this.#state.reconnTimeout / 1000));		
	}

	/**
	 * @description Connect to AVR Device
	 * @returns {void}
	 */
	connect = (reconnect = false) => {				
		if (!this.#state.conn) {
			if( !reconnect ) {
				this.log.debug("SOCKET[" + this.#address.toString() + "] CONNECTING");
				// Reset Reconn Retry Counter
				this.#state.reconnRetriesCounter = 0;
			}
			else {
				if( this.#state.reconnRetries != 0 ) {					
					if( this.#state.reconnRetriesCounter++ >= this.#state.reconnRetries ) {
						this.log.warn("SOCKET[" + this.#address.toString() + "] RECONNECTING failed. Reached max. retries");
						return;
					}
					this.log.debug("SOCKET[" + this.#address.toString() + "] RECONNECTING (" + this.#state.reconnRetriesCounter + "/" + this.#state.reconnRetries + ")");	
				} else {
					this.log.debug("SOCKET[" + this.#address.toString() + "] RECONNECTING");
				}				
			}
			this.#state.sockError = "";
			this.#state.reconn = this.#state.reconnTimeout > 0;
			this.#client.connect({ port: this.#address.port, host: this.#address.ip, family: 4 });
		}
	}

	/**
	 * @description Disconnect from AVR Device
	 * @returns {void}
	 */
	disconnect = () => {
		// Disbable Reconnects
		this.#state.reconn = false; 
		// Clear query Timeouts (if any)
		this.#state.queryTimerList.forEach((i) => {
			clearTimeout(i);			
		});
		// Clear Timeouts
		clearTimeout(this.#queryTimer);
		clearTimeout(this.#reconnectTimer);		
		clearTimeout(this.#sabRequestTimer);
		// Destroy Socket
		if (!this.#client.destroyed) {
			this.#client.destroy();
		}		
	}

	/**	 
	 * @description Set Option Value
	 * @param {number} option Option to set from {@link PT.Option}
	 * @param {any} value Value to set for given Option
	 * @returns {void}
	 */
	setOption = (option, value) => { this.#state.options.set(option, value); }
	
	/**
	 * @description Force Query of all Status Variables from AVR Device
	 * @returns {void}
	 */
	queryStatus = () => { this.#query(); }

	/**
	 * @description Send free command to AVR
	 * @param {any} cmd Command to send to device
	 * @returns {void}
	 */
	sendCommand = (cmd) => { this.#sendCommand(cmd); }

	/** 
	 * Set Enabled Features
	 * @param {Array<String>} features 
	 * @returns {void}
	 */ 	
	setFeatures = (features) => { this.#state.features = features; }

	/**
	 * Get Value for Device Property with [name]
	 * @param {string} name 
	 * @returns {any}
	 */
	getValue = (name) => { return this.#state.propertyValues.get(name);	}

	/**
	 * Set Value for Device Property with [name] to [value]
	 * @param {string} name 
	 * @param {*} value 
	 * @returns {boolean} Result (true=Success/false=Error)
	 */
	setValue = (name, value) => {	return this.#processSendProperty(name, value); }

	/**
	 * Get Channels
	 * @returns {Array<String>}
	 */
	 getChannels = () => {
		const res = new Map();
		this.getProperties().forEach(name => {
			res.set(name.substring(0, name.lastIndexOf(".")), 1);
		});	
		return Array.from(res.keys());
	}

	/**
	 * Get all available Property Names
	 * @returns {Array<String>}
	 */
	getProperties = () => {
		let result = Array();
		Object.getOwnPropertyNames(PPD).forEach(name => {
			const propDef = PPD[name];
			if( propDef && this.isPropertyEnabled(name) ) {
				let match = name.match("^([^!]*)[!]{1}\\((.+)\\)");
				if(match && match[1] != undefined && match[2] !== undefined ) {
					Array.prototype.push.apply(result, match[2].split("|").map(subName => ((match) ? match[1] : "") + subName));
				} else if( !name.startsWith("#") ) {
					result.push(name)
				}
			}			
		}); 
		return result;
	}

	/**
	 * Check if the Property with 'name' exists and is in curren feature selection
	 * @param {string} name 
	 * @returns 
	 */
	isPropertyEnabled = (name) => {
		const propDef = PPD[name];
		if( propDef ) {
			return (propDef.feature === undefined || this.#state.features.includes(propDef.feature));
		}
		return false;
	}

	/**
	 * Get Property Informations
	 * @returns {PT.PropertyInfo|undefined}
	 */
	getPropertyInfo = (name) => {
		const propDef = PPD[name];
		if( propDef ) {
			return {
				canQuery: (propDef.qy !== undefined), 
				canRead:  (propDef.rx !== undefined),
				canWrite: (propDef.tx !== undefined),				
				metadata:  propDef.meta
			}
		} 
		return undefined;
	}

	/**	 
	 * @description Get Option Value
	 * @param {number} option Option to set from {@link PT.Option}
	 * @returns {any}
	 */
	#getOption = (option) => {
		if( this.#state.options.has(option)) {
			return this.#state.options.get(option);
		}
		return undefined;
	}

	/**	 
	 * @description Check if a Option is set
	 * @param {number} option Option to set from {@link PT.Option}
	 * @returns {boolean}}
	 */
	#hasOption = (option) => {
		return this.#state.options.has(option);
	}

	/**
	 * @description Send Command to AVR
	 * @param {string} cmd Command as String without CR+LF
	 * @returns {boolean}
	 */
	#sendCommand = (cmd) => {
		if (this.#client != null && this.#client.writable && this.#state.conn) {
			this.#client.write(cmd + "\r\n", 'ascii');
			this.log.debug("SOCKET[" + this.#address.toString() + "] TX: " + cmd);
			return true;		
		}
		return false;
	}

	#expandVirtualPropertiesDefinition = () =>  {
		Object.getOwnPropertyNames(PPD).forEach(name => {
			const propDef = PPD[name];
			if( propDef ) {
				let match = name.match("^([^!]*)[!]{1}\\((.+)\\)");
				if(match && match[1] !== undefined && match[2] !== undefined ) {
					match[2].split("|").map(subName => ((match) ? match[1] : "") + subName).forEach(subProp => {						
						PPD[subProp] = {
							feature: propDef.feature,
							qy: propDef.qy,								
							rx: propDef.rx,
							meta: propDef.meta,
							virtual: true
						}
					 });
				} 
			}			
		}); 
	}

	#queryTimerRun = () => {
		this.log.debug("[QUERY_TIMER]: Process.")
		let cmd = this.#state.queryQueue.shift();
		if( cmd ) {
			this.#sendCommand(cmd);
		}
		if( this.#state.queryQueue.length > 0 ) {
			this.log.debug("[QUERY_TIMER]: Reschedule.")
			this.#queryTimer = setTimeout(this.#queryTimerRun, IPControl.QUERY_COMMAND_DELAY);
		} else {
			this.log.debug("[QUERY_TIMER]: Stop. (no more data)");
		}
	}

	/**
	 * @description 
	 * Enquee Query for single Property of Device
	 * @param {string} name
	 */
	 #queryProperty = (name) => {
		// Query Specific property
		const propDef = PPD[name];
		
		if( propDef && propDef.qy && propDef.qy.cmd && this.isPropertyEnabled(name) ) {
			// Convert String to Array with single entry			
			let cmds = ((propDef.qy.cmd instanceof Array) ? propDef.qy.cmd : [propDef.qy.cmd])
			// Stop queryTimer
			this.log.debug("[QUERY_TIMER]: Stop. (modify queue)");
			clearTimeout(this.#queryTimer);
			// Add individual commands to QueryQueue
			cmds.forEach(cmd => {
				if( !this.#state.queryQueue.includes(cmd) ) {
					this.#state.queryQueue.push(cmd);
				}
			});
			// (Re-)Start queryTimer
			this.log.debug("[QUERY_TIMER]: Start. (modify queue)")
			this.#queryTimer = setTimeout(this.#queryTimerRun, IPControl.QUERY_COMMAND_DELAY);
		}
	}

	/**
	 * Query Data from Device, if called without 'name', 
	 * all properies queried that has 'C' = 'Connect' flag set.
	 * @param {string} [name]
	 */
	#query = (name=undefined) => {
		if(name) {
			if(!name.endsWith("*")) {
				this.log.debug("[QUERY] Single Property '" + name + "'");
				// Query Specific property
				this.#queryProperty(name);					
			} else {
				this.log.debug("[QUERY] Wildcard '" + name + "'");
				for(let propQ of Object.getOwnPropertyNames(PPD))
				{				
					if( propQ.startsWith(name.replace("*","")) )
					{
						this.log.debug("[QUERY]    *  -> '" + name + "' Property '" + propQ + "'");
						this.#queryProperty(propQ);
					}
				}
			}

		} else {
			this.log.debug("[QUERY] All Properties with 'C'-Flag");
			// Query all properies that has 'C' = Connect query Flag
			Object.getOwnPropertyNames(PPD).forEach(iName => {
				const propDef = PPD[iName];
				if( propDef && propDef.qy && propDef.qy.flags && propDef.qy.flags.includes("C") ) {
					this.#queryProperty(iName);
				}
			});
		}
	}

	#processSendProperty = (name, value) => {
		/** @type {PT.PropertyHookObject} */
		let prop = { name: name, value: value, isInternal: false, propDef: PPD[name], cancel: false }
		
		if( prop.propDef && prop.propDef.tx && prop.propDef.tx.transform && this.isPropertyEnabled(name) ) {
			// Process send Hook
			this.#sendPropertyHook(prop);
			// Check if send request canceld by hook (return success to upper layer)
			if( prop.cancel ) { return true; }
			// Check Data
			let isMatch = (prop.propDef.tx.match) ? (prop.value.toString().match(prop.propDef.tx.match)) : true;
			if( isMatch ) {	
				// Send Command
				if( this.#sendCommand(prop.propDef.tx.transform(prop.value)) )
				{
					// Request Update of Property if needed
					if( prop.propDef.qy && prop.propDef.qy.flags && prop.propDef.qy.flags.includes("W") ) { 
						this.#queryProperty(prop.name);
					}
					return true;
				}
			} else {
				this.log.warn("Invalid property value. Can't set: " + prop.name + "=" + prop.value);
			}
		}
		return false;
	}

	#processReceivedProperty = (name, value, isInternal=false) => {
		/** @type {PT.PropertyHookObject} */
		let prop = { name: name, value: value, isInternal: isInternal, propDef: PPD[name], cancel: false }
		if( prop.propDef && this.isPropertyEnabled(name) ) { 
			if( isInternal ){
				// Call Hook for internal processing
				this.#receiveInternalPropertyHook(prop);
			} else {
				// Call Hook for processing
				this.#receivePropertyHook(prop);
			}
			// Update internal Variable and emit EVENT_CHANGED
			if( !isInternal ) {
				this.#state.propertyValues.set(prop.name, prop.value);			
				this.emit(IPControl.EVENT_CHANGED, prop.name);
			}
			// Request updates for depending properties
			if( prop.propDef && prop.propDef.rx && prop.propDef.rx.update ) {
				prop.propDef.rx.update.forEach(uName=>{ this.#query(uName); });
			}
		}
	}

	/**
	 * @description Decode a single Message from AVR
	 * @param {String} msg Message to decode
	 * @returns {void}
	 */
	#processMessage = (msg) => {
		Object.getOwnPropertyNames(PPD).forEach(name => {
			let propDef = PPD[name];
			let isInternal = name.startsWith("#");
			if( propDef && propDef.rx && !propDef.virtual) {				
				let match = msg.match(propDef.rx.match);
				if( match ) {
					let value = propDef.rx.transform(match.slice(1));
					if( value instanceof Object && !isInternal ) {
						Object.getOwnPropertyNames(value).forEach(subName => {					
							this.#processReceivedProperty(name.substring(0, name.lastIndexOf("!")) + subName, value[subName]);
						});						
					} else {
						this.#processReceivedProperty(name, value, isInternal);
					}					
				}
			}
		});					
	}

	/**
	 * ################################### Property Processing Hooks for special handling ###################################################
	 */

	/** 
	 * @description Hook called after data received but before data is stored
	 * @method receivePropertyHook
	 * @param {PT.PropertyHookObject} prop Property Object. Changes of .name or .value are reflected outside. 
	 */
	#receiveInternalPropertyHook = (prop) => {
		if(prop.name == '#inputNames') {
			this.#state.customInputNames.set(prop.value.id, prop.value);
		}
	}

	/** 
	 * @description Hook called before data is send to device
	 * @method sendPropertyHook
	 * @param {PT.PropertyHookObject} prop Property Object. Changes of .name or .value are reflected outside. 
	 */
	#sendPropertyHook = (prop) => {
		if(prop.name == "general.selectedInput" && this.#getOption(PT.Option.CUSTOM_INPUT_NAMES) ) {						
			for(let custIn of this.#state.customInputNames.values()) {
				if( prop.value == custIn.name ) { prop.value = custIn.id; break; }
			}			
		}
		if(prop.name == "audio.volume" ) {
			const limitMin = this.#getOption(PT.Option.VOL_LIMIT_MIN);
			const limitMax = this.#getOption(PT.Option.VOL_LIMIT_MAX);
			if( limitMin != undefined && limitMax != undefined ) {
				let vol = prop.value;
				vol = (vol > limitMax) ? limitMax : vol;
				vol = (vol < limitMin) ? limitMin : vol;
				if( prop.value != vol ) {
					this.log.warn("[VOL-LIMITER]: Requested Volume = " + prop.value + " / Set Volume = " + vol);
					prop.value = vol;
				}
			}
		}
	}

	/** 
	 * @description Hook called after data received but before data is stored
	 * @method receivePropertyHook
	 * @param {PT.PropertyHookObject} prop Property Object. Changes of .name or .value are reflected outside. 
	 */
	#receivePropertyHook = (prop) => {
		// Special handling: selectedInput with customNames
		if( prop.name == "general.selectedInput" && this.#getOption(PT.Option.CUSTOM_INPUT_NAMES)) {
			let r = this.#state.customInputNames.get(prop.value);
			if( r ) { prop.value = r.name; }						
		}
		// Special handling: sleepTimer for continues updates when running
		if( prop.name == "general.sleepTimer" ) {				
			clearTimeout(this.#sabRequestTimer);
			// If a SleepTimer is Running, request Update every 30 Sec.
			if( prop.value != "0") { this.#sabRequestTimer = setTimeout(()=>{ this.#query(prop.name); }, 30000); }								
		}			
	}

}

module.exports = IPControl;
