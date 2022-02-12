"use strict";

const PioneerTypes	= require('./PioneerTypes.js');
const EventEmitter = require('events');
const { Socket } = require('net');
const { time } = require('console');
const { send } = require('process');

/**
 * @callback IPControlLogHandlerCallback;
 * @param {string} msg Message to Log
 * @returns {void}
 */

/**
 * @typedef {Object} IPControlLogHandler
 * @property {IPControlLogHandlerCallback} info Callback for Messages with Informational LogLevel
 * @property {IPControlLogHandlerCallback} warn Callback for Messages with Warning LogLevel
 * @property {IPControlLogHandlerCallback} error Callback for Messages with Error LogLevel
 * @property {IPControlLogHandlerCallback} debug Callback for Messages with Debug LogLevel
 * @property {IPControlLogHandlerCallback} silly Callback for Messages with Silly LogLevel
 */

/**
 * @typedef {Object} IPControlASTReturnObject 
 * @property {string} codec Audio Codec Information
 * @property {string} chInFormat Input Channel Format
 * @property {string} chOutFormat Output Channel Format
 */

/**
 * @typedef {Object} IPControlRenameableInput 
 * @description Type definition for storing renamable input data
 * @property {boolean} isRenamed Value that states if Input ist renamed
 * @property {string} customName The Custom Name for the Input
 */

/**
 * @class
 */
class IPControl extends EventEmitter {
	static QUERY_COMMAND_DELAY = 75;
	
	// Private Fields
	#client = new Socket();
	#address = { ip: "", port: 23, toString() { return "tcp://" + this.ip + ":" + this.port; } }
	#state = { 
		conn: false, 
		reconn: false, 
		reconnTimeout: 0, 
		sockError: "", 
		queryTimerList: new Array(), 
		showCustomNames: false,
		/**
		 * @type Map<string,IPControlRenameableInput>
	 	 */	
	 	renameableInputList: new Map()
	}	
	/**
	 * @description Default Log Handler
	 * @type IPControlLogHandler	 
	 */
	log = {
		info: 	(msg) => { console.log("INFO:  " + msg) },
		warn: 	(msg) => { console.log("WARN:  " + msg) },
		error:  (msg) => { console.log("ERROR: " + msg) },
		debug: 	(msg) => { console.log("DEBUG: " + msg) },
		silly: 	(msg) => { console.log("SILLY: " + msg) },		
	}
	// Timers
	#reconnectTimer = setTimeout(()=>{}, 0);
	#astRequestTimer = setTimeout(()=>{}, 0);
	#sabRequestTimer = setTimeout(()=>{}, 0);	

	constructor() {
		super()		
		// Attach Socket Connect Handler
		this.#client.on('connect', () => {
			this.#state.conn = true;			
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
			this.log.debug("SOCKET[" + this.#address.toString() + "] DATA " + data);
			var reqAst = false;
			data.toString().split("\r\n").forEach( (msg) => { reqAst = this.#processMessage(msg) || reqAst; });
			// Request AST Data if needed (only if no query in Progress)
			if (reqAst && this.#state.queryTimerList.length == 0) {
				clearTimeout(this.#astRequestTimer);
				this.#astRequestTimer = setTimeout( () => { this.#sendCommand("?AST"); }, 1000);
			}
		});
		// Attach Socket Close Handler
		this.#client.on('close', () => {
			this.#state.conn = false;
			this.emit('close');				
			this.log.debug("SOCKET[" + this.#address.toString() + "] CLOSED");				
			var logMsg = "Connection " + (this.#state.sockError == "" ? ("to "  + this.#address.toString() + " closed") : ("closed (ERROR: " + this.#state.sockError + ")"));
			if (this.#state.reconn) {
				logMsg += ". Reconnect in " + (this.#state.reconnTimeout/1000) + " Sec.";				
				this.#reconnectTimer = setTimeout(this.connect, this.#state.reconnTimeout);
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

	/* Private status variables */
	#power = false					/* WRITABLE | Boolean | Boolean */
	#mute = false					/* WRITABLE | Boolean | Boolean */
	#display = ""					/* READONLY | String | String */
	#volume = 0						/* WRITABLE | Number | Number */
	#selectedInput = ""				/* WRITABLE | String | SelectedInput */
	#hdmiOutput = 0					/* WRITABLE | Number | HdmiOutput */
	#speakerSelect = 0				/* WRITABLE | Number | SpeakerSelect */
	#hdmiAudio = 0					/* WRITABLE | Number | HdmiAudio */
	#signalSource = 0				/* WRITABLE | Number | SignalSource */
	#currentListeningMode = ""		/* READONLY | String | CurrentListeningMode */
	#selectedListeningMode = ""		/* WRITABLE | String | CurrentListeningMode */
	#inputSignal = ""				/* READONLY | String | AudioInputCodec + AudioInpuFreq */
	#channelInputFormat = ""		/* READONLY | String | Comma seperated list of ChannelInputFormat entrys */
	#channelOutputFormat = ""		/* READONLY | String | Comma seperated list of ChannelOutputFormat entrys */
	#sleepTimer = ""				/* WRITABLE | String | SleepTimer */
	#InternetRadioStation = ""      /* READONLY | String | Bit rate of radio station */
	#InternetRadioIcon = ""         /* READONLY | String | Icon of radio station */
	#InternetRadioBitRate = ""      /* READONLY | String | Bit rate of radio stream */
	#InternetRadioDescription = ""  /* READONLY | String | Description of radio stream */
	
	/**
	 * Getters for status variables
	 */
	get connected() { return this.#state.conn; }
	get power() { return this.#power; }
	get mute() { return this.#mute; }
	get display() { return this.#display; }
	get volume() { return this.#volume; }
	get selectedInput() { return this.#selectedInput; }
	get hdmiOutput() { return this.#hdmiOutput; }
	get speakerSelect() { return this.#speakerSelect; }
	get hdmiAudio() { return this.#hdmiAudio; }
	get signalSource() { return this.#signalSource; }
	get currentListeningMode() { return this.#currentListeningMode; }
	get selectedListeningMode() { return this.#selectedListeningMode; }
	get inputSignal() { return this.#inputSignal; }
	get channelInputFormat() { return this.#channelInputFormat; }
	get channelOutputFormat() { return this.#channelOutputFormat; }
	get sleepTimer() { return this.#sleepTimer; }
	get internetRadioStation() { return this.#InternetRadioStation; }
	get internetRadioIcon() { return this.#InternetRadioIcon; }
	get internetRadioBitRate() { return this.#InternetRadioBitRate; }
	get internetRadioDescription() { return this.#InternetRadioDescription; }
	
	/**
	 * Setters for status variables
	 */
	// Setter for connected. v = new connection state (false = disconnect (turn of reconnect) / true = connect)
	set connected(v) { if( v ) { this.connect(); } else { this.disconnect(); } }
	// Setter for #power. v = new power state (false = off / true = on)
	set power(v) { this.#sendCommand((v == true) ? "PO" : "PF" ); }
	// Setter for #mute. v = new mute state (false = unmuted / true = muted)
	set mute(v) { this.#sendCommand( (v == true) ? "MO" : "MF" ); }
	// Setter for volume. v = new volume in dB (Range: -80.0 to +12.0dB / min. Stepsize: 0.5dB)
	set volume(v) {	this.#sendCommand( ((2*(-80-v)-1)*-1).toString().padStart(3, "0") + "VL"); }
	// Setter for #selectedInput. v = new input value to set (Numeric ID from PioneerTypes.SelectedInput / or if showCustomNames enabled, the custom input name)
	set selectedInput(v) 
	{ 	
		var cmd = "";	
		// Check if it's a predefined Input ID from PioneerTypes.SelectedInput		
		if( PioneerTypes.SelectedInput.hasOwnProperty(v) ) { 
			cmd = v + "FN";
		} else {
			// If custom names enabled, try to get id by given Name
			if( this.#state.showCustomNames ) {
				for(let [key,val] of this.#state.renameableInputList) {
					if( val.customName == v ) { cmd = key + "FN"; break; }			
				}
			}
		}
		// Send command to device (if any)
		if( cmd != "") { 
			this.#sendCommand(cmd); 
			this.#sendCommand("?F");			
		} else {
			this.log.warn("Unsupported Input ID or CustomName. Cannot set selectedInput to '" + v + "'");
		}	
	}	
	// Setter for #hdmiOutput. v = id of new output (for IDs see PioneerTypes.HdmiOutput)	
	set hdmiOutput(v) { if( PioneerTypes.HdmiOutput.hasOwnProperty(v) ) { this.#sendCommand(v + "HO"); } }
	// Setter for #speakerSelect. v = id for new speaker selection (for IDs see PioneerTypes.SpeakerSelect)
	set speakerSelect(v) { if( PioneerTypes.SpeakerSelect.hasOwnProperty(v) ) { this.#sendCommand(v + "SPK");} }
	// Setter for #hdmiAudio. v = id for new value (for IDs see PioneerTypes.HdmiAudio)
	set hdmiAudio(v) { if( PioneerTypes.HdmiAudio.hasOwnProperty(v) ) { this.#sendCommand(v + "HA"); } }
	// Setter for #signalSource. v = id for new source (for IDs see PioneerTypes.SignalSource)
	set signalSource(v) { if( PioneerTypes.SignalSource.hasOwnProperty(v) ) { this.#sendCommand(v + "SDA"); } }
	// Setter for #selectedListeningMode. v = id for new listening mode (for IDs see PioneerTypes.SelectedListeningMode)
	set selectedListeningMode(v) { if( PioneerTypes.SelectedListeningMode.hasOwnProperty(v) ) { this.#sendCommand(v + "SR"); } } 
	// Setter for #sleepTimer. v = id for new sleep timer value (for IDs see PioneerTypes.SleepTimer)
	set sleepTimer(v) { if( PioneerTypes.SleepTimer.hasOwnProperty(v) ) { this.#sendCommand(v + "SAB"); } }

	/**	 
	 * @description Set TCP connection Parameters
	 * @param {String} host	IP or Hostname of AVR Device
	 * @param {number} port	TCP Port to use (Default 23)
	 * @param {number} reconnectTimeout	Reconnect timeout in Sec. (default = 0 / 0 = disabled)
	 * @param {number} keepAlive Socket KeepAlive Timeout in Sec. (default = 30 / 0 = disabled)
	 * @param {boolean} showCustomNames Show custom input names instead of default names
	 * @returns {void}
	 */
	setConfig = (host, port, reconnectTimeout, keepAlive, showCustomNames) => {	
		this.#address.ip = host;
		this.#address.port = port;
		this.#state.reconnTimeout = reconnectTimeout * 1000;
		this.#state.showCustomNames = showCustomNames;
		this.#client.setKeepAlive(true, (keepAlive*1000));
		this.log.debug("SET_CONFIG: Address: " + this.#address.toString() + ", ReconnectTimeout: " + (this.#state.reconnTimeout / 1000));		
	}

	/**
	 * @description Connect to AVR Device
	 * @returns {void}
	 */
	connect = () => {		
		if (!this.#state.conn) {
			this.log.debug("SOCKET[" + this.#address.toString() + "] CONNECTING");			
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
		clearTimeout(this.#reconnectTimer);
		clearTimeout(this.#astRequestTimer);
		clearTimeout(this.#sabRequestTimer);
		// Destroy Socket
		if (!this.#client.destroyed) {
			this.#client.destroy();
		}		
	}
		
	/**
	 * @description Force Query of all Status Variables from AVR Device
	 * @returns {void}
	 */
	queryStatus = () => {
		this.log.info("Querying current State");		
		const queryCmdList = new Array(
			"P", 	// Request 'power'
			"V", 	// Request 'volume'
			"M", 	// Request 'mute'
			"FL", 	// Request 'display'
			"SPK", 	// Request 'speakerSelect'
			"HO", 	// Request 'hdmiOutput'
			"HA", 	// Request 'hdmiAudio'
			"SAB",	// Request 'sleepTimer'
			"F", 	// Request 'selectedInput'
			"S", 	// Request 'selectedListeningMode'
			"L", 	// Request 'currentListeningMode'
			"SDA", 	// Request 'signalSource'
			"AST" 	// Request Audio Info ('inputSignal' / 'channelInputFormat' / 'channelOutputFormat')
		);	
		// If showCustomNames, insert the query Command at head of queryCmdList
		if( this.#state.showCustomNames ) {			
			PioneerTypes.RenameableInputIDs.forEach((v) => {
				queryCmdList.unshift("RGB" + v);
			});		
		}
		// Execute query with delay between each Command
		for(var count = 0; count<queryCmdList.length; count++) {
			// Schedule Timeout for each Query Command			
			let timer = setTimeout((cmd,lastItem)=>{ 				
				// Send Command when Timeout gets Executed
				this.#sendCommand("?" + cmd);				
				// Clear #queryTimerList when last Timeout is Executed
				if( lastItem ) { this.#state.queryTimerList.splice(0, this.#state.queryTimerList.length); }
			}, (count+1)*IPControl.QUERY_COMMAND_DELAY, queryCmdList[count], (queryCmdList.length==count+1));
			// Push Timer to #queryTimerList
			this.#state.queryTimerList.push(timer);
		}
	}

	/**
	 * @description Turn volume up
	 * @returns {void}
	 */
	 buttonVolumeUp = () => {
		this.#sendCommand("VU");
	}

	/**
	 * @description Turn volume down
	 * @returns {void}
	 */
	buttonVolumeDown = () => {
		this.#sendCommand("VD");
	}

	/**
	 * @description Send free command to AVR
	 * @param {any} cmd Command to send to device
	 * @returns {void}
	 */
	sendCommand = (cmd) => {		
		this.#sendCommand(cmd);		
	}

	/**
	 * @description Send Command to AVR
	 * @param {string} cmd Command as String without CR+LF
	 * @returns {void}
	 */
	#sendCommand = (cmd) => {
		if (this.#client != null && this.#client.writable && this.#state.conn) {
			this.#client.write(cmd + "\r\n", 'ascii');
			this.log.debug("SOCKET[" + this.#address.toString() + "] TX: " + cmd);			
		}				
	}

	/**
	 * @description Decode a single Message from AVR
	 * @param {String} m Message to decode
	 * @returns {boolean} needASTReqest. (If true AST must be Updated)
	 */
	#processMessage = (m) => {
		let res = false;		
		// Drop empty messages
		if (m == "") { return res; }
		this.log.debug("SOCKET[" + this.#address.toString() + "] RX: " + m);
		
		if (m == "R") {this.emit("changed", null); }   // alive packet from device (e.g. VSX-S510)
		if (m.startsWith("RGB")) { this.#state.renameableInputList.set(m.substring(3,5), { isRenamed: (m.substring(5,6) == "1"), customName: m.substring(6).trim() }); }
		if (m.startsWith("PWR")) { this.#power = (m.substring(3, 4) == "0"); this.emit("changed", "power"); }				
		if (m.startsWith("HO") ) { this.#hdmiOutput = parseInt(m.substring(2, 3)); this.emit("changed", "hdmiOutput"); }
		if (m.startsWith("SPK")) { this.#speakerSelect = parseInt(m.substring(3, 4)); this.emit("changed", "speakerSelect"); }				
		if (m.startsWith("VOL")) { this.#volume = 12 - (0.5 * (185 - parseInt(m.substring(3)))); this.emit("changed", "volume"); }
		if (m.startsWith("MUT")) { this.#mute = (m.substring(3, 4) == "0"); this.emit("changed", "mute"); }								
		if (m.startsWith("HA") ) { this.#hdmiAudio = parseInt(m.substring(2, 3)); this.emit("changed", "hdmiAudio"); res = true; }
		if (m.startsWith("SDA")) { this.#signalSource = parseInt(m.substring(3, 4)); this.emit("changed", "signalSource"); res = true; }
		if (m.startsWith("SR") ) { this.#selectedListeningMode = m.substring(2, 6);	this.emit("changed", "selectedListeningMode"); res = true; }
		if (m.startsWith("FL") ) { this.#display = this.#decodeDisplayData(m.substring(4));	this.emit("changed", "display"); }
		if (m.startsWith("LM") ) { this.#currentListeningMode = PioneerTypes.ListeningModes[m.substring(2,6).toLowerCase()]; this.emit("changed", "currentListeningMode"); res = true; }
		if (m.startsWith("GEP02020")) { this.#InternetRadioStation = m.substring(9, m.length - 1); this.emit("changed", "internetRadioStation"); }
		if (m.startsWith("GEP06029")) { this.#InternetRadioBitRate = m.substring(9, m.length - 1); this.emit("changed", "internetRadioBitRate"); }
		if (m.startsWith("GEP01032")) { this.#InternetRadioDescription = m.substring(9, m.length - 1); this.emit("changed", "internetRadioDescription"); }
		if (m.startsWith("GIC049")) { this.#InternetRadioIcon = m.substring(7, m.length - 1); this.emit("changed", "internetRadioIcon"); }
		if (m.startsWith("FN") ) { 
			let ren = this.#state.renameableInputList.get(m.substring(2,4));
			this.#selectedInput = ( this.#state.showCustomNames && ren && ren.isRenamed ) ? ren.customName : m.substring(2,4);
			this.emit("changed", "selectedInput"); 
			res = true;
		}
		if (m.startsWith("SAB")) { 
			this.#sleepTimer = parseInt(m.substring(3, 6)).toString();					
			clearTimeout(this.#sabRequestTimer);
			// If a SleepTimer is Running, request Update every 30 Sec.
			if( this.#sleepTimer != "0") { this.#sabRequestTimer = setTimeout(()=>{ this.#sendCommand("?SAB"); }, 30000); }
			this.emit("changed", "sleepTimer"); 					
		}		
		if (m.startsWith("AST")) {
			let ast = this.#decodeAST(m.substring(3));
			this.#inputSignal = ast.codec;					
			this.#channelInputFormat = ast.chInFormat;					
			this.#channelOutputFormat = ast.chOutFormat;
			this.emit("changed", "inputSignal");										
			this.emit("changed", "channelInputFormat");
			this.emit("changed", "channelOutputFormat");									
		}		
		return res;
	}

	/**
	 * @description Decodes HexString Data from AVR into an readable ASCII String
	 * @param {String} data Data as HexString
	 * @returns {String} Decoded Data as ASCII String
	 */
	#decodeDisplayData = (data) => {
		let result = "";	
		// Decode Display Data
		for (var i = 0; i < data.length; i += 2) { 
			result += String.fromCharCode(parseInt(data.substring(i, i+2), 16)); 
		}					
		// Translate special Chars to Readable
		PioneerTypes.DisplayCharReplacements.forEach((el) => { 
			result = result.replace(el.s, el.r); 
		});
		return result;
	}

	/**
	 * @description Decodes AST Response end Returns an Object with codec,chInFormat,chOutFormat
	 * @param {String} data AST Response Data to be decoded
	 * @returns {IPControlASTReturnObject}
	 */
	#decodeAST = (data) => {
		let result = { codec: "", chInFormat: "", chOutFormat: "" };		
		if(data) {
			var cif = [], oif = [];		
			for (var i = 4; i <= 19; i++) {
				if (data[i] == "1") { cif.push("<" + PioneerTypes.ChannelInputFormat[i] + ">"); }
			}
			for (var i = 25; i <= 37; i++) {
				if (data[i] == "1") { oif.push("<" + PioneerTypes.ChannelOutputFormat[i] + ">"); }
			}
			result.codec = PioneerTypes.AudioInputCodec[parseInt(data.substring(0, 2))] + " " + PioneerTypes.AudioInputFreq[parseInt(data.substring(2, 4))];
			result.chInFormat = cif.join(",");
			result.chOutFormat = oif.join(",");
		}
		return result;		
	}
}

module.exports = {
	IPControl: IPControl,
	PioneerTypes: PioneerTypes
};

