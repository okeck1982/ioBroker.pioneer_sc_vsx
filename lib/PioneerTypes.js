"use strict";

//********************** JSDoc Typedefs *************************
/**
 * @typedef Property
 * @property {string} [feature]
 * @property {PropertyEntryQueryAttributes} [qy] (OPTIONAL) Config for quering this property from the Device
 * @property {PropertyEntryTxAttributes} [tx] (OPTIONAL) Config for sending this property to device
 * @property {PropertyEntryRxAttributes} [rx] (OPTIONAL) Config for receiving this property from device
 * @property {Object.<string, any>} [meta] (OPTIONAL) Metadata
 * @property {boolean} [virtual]
 */

/**
 * @typedef PropertyEntryRxAttributes
 * @property {string} match RegEx to match incomming messages
 * @property {function(Array<any>):string|number|boolean|object} transform Expression executed to transform DATA on receiving (DEVICE -> INSTANCE)
 * @property {Array<string>} [update] Property names to query status, when data is received for this property
 */

/**
 * @typedef PropertyEntryTxAttributes
 * @property {string} [match] (OPTIONAL) RegEx to match outgoing values
 * @property {(function(any):string)|undefined} [transform] Expression executed to Transform DATA befor sending (INSTANCE -> DEVICE)
 * @property {boolean} [requery]
 */

/**
 * @typedef PropertyEntryQueryAttributes
 * @property {'C'|'W'|'P'|'CW'|'WP'|'CP'|'CWP'|''} [flags] A combination of: C = Query after Connect / W = Query after Write / P = Poll value
 * @property {string|Array<string>} cmd	Query Command(s) for query Device
 */

/**
 * @typedef PropertyHookObject
 * @property {string} name Property Name [as reference]
 * @property {any} value Property Value [as reference]
 * @property {boolean} isInternal
 * @property {boolean} cancel
 * @property {Property} propDef
 */

/**
 * @typedef PropertyInfo
 * @property {boolean} canQuery
 * @property {boolean} canRead
 * @property {boolean} canWrite
 * @property {Object<String,any>} metadata
 */

/**
 * @typedef CustomInputNameEntry
 * @property {number} id
 * @property {boolean} isRenamed
 * @property {string} name
 */

/**
 * @callback LogHandlerCallback;
 * @param {string} msg Message to Log
 * @returns {void}
 */

/**
 * @typedef {Object} LogHandler
 * @property {LogHandlerCallback} info Callback for Messages with Informational LogLevel
 * @property {LogHandlerCallback} warn Callback for Messages with Warning LogLevel
 * @property {LogHandlerCallback} error Callback for Messages with Error LogLevel
 * @property {LogHandlerCallback} debug Callback for Messages with Debug LogLevel
 * @property {LogHandlerCallback} silly Callback for Messages with Silly LogLevel
 */

module.exports = {
	/** @type {Map<string, string>} */
	CharMap: new Map([
		["\x05", "[)"],
		["\x06", "(]"],
		["\x07", "I" ],
		["\x08", "II"],
		["\x09", "<" ],
		["\x0A", ">" ],
	]),


	/**
	 * Enum for Option Settings
	 * @readonly
	 * @enum {number}
	 */
	Option: {
		FEATURES: 1,
		CUSTOM_INPUT_NAMES: 2,
		VOL_LIMIT_MIN: 3,
		VOL_LIMIT_MAX: 4
	},

	HdmiAudio: {
		0: "AMP",
		1: "THROUGH",
		9: "NEXT"
	},

	HdmiOutput: {
		0: "ALL",
		1: "OUT1",
		2: "OUT2",
		9: "NEXT"
	},

	SelectedInput: {
		0: "PHONO",
		1: "CD",
		2: "TUNER",
		3: "CD-R/TAPE",
		4: "DVD",
		5: "TV/SAT",
		10: "VIDEO1",
		12: "MULTI-CH-IN",
		14: "VIDEO2",
		15: "DVR/BDR",
		17: "iPod/USB",
		19: "HDMI1",
		20: "HDMI2",
		21: "HDMI3",
		22: "HDMI4",
		23: "HDMI5",
		24: "HDMI6",
		25: "BD",
		26: "HOME-MEDIA-GALLERY",
		27: "SIRIUS",
		31: "NEXT-INPUT",
		33: "ADAPTER-PORT",
		38: "INTERNET RADIO"
	},

	RenameableInputIDs: [
		0, 1, 2, 3, 4, 5, 6, 10, 12, 13, 15, 17, 19, 20, 21, 22, 23, 24, 25, 33, 34, 38, 40, 41, 44, 45
	],

	SleepTimer: {
		"000": "Off",
		"030": "30 Min.",
		"060": "60 Min.",
		"090": "90 Min.",
		"999": "NEXT"
	},

	SignalSource: {
		0: "AUTO",
		1: "ANALOG",
		2: "DIGITAL",
		3: "HDMI",
		9: "NEXT"
	},

	SpeakerSelect: {
		0: "OFF",
		1: "A ON",
		2: "B ON",
		3: "A+B ON",
		9: "NEXT"
	},

	AudioInputCodec: {
		0: "ANALOG",
		1: "ANALOG",
		2: "ANALOG",
		3: "PCM",
		4: "PCM",
		5: "DOLBY DIGITAL",
		6: "DTS",
		7: "DTS-ES Matrix",
		8: "DTS-ES Discrete",
		9: "DTS 96/24",
		10: "DTS 96/24 ES Matrix",
		11: "DTS 96/24 ES Discrete",
		12: "MPEG-2 AAC",
		13: "WMA9 Pro",
		14: "DSD->PCM",
		15: "HDMI THROUGH",
		16: "DOLBY DIGITAL PLUS",
		17: "DOLBY TrueHD",
		18: "DTS Express",
		19: "DTS-HD Master Audio",
		20: "DTS-HD High Resolution",
		21: "DTS-HD High Resolution",
		22: "DTS-HD High Resolution",
		23: "DTS-HD High Resolution",
		24: "DTS-HD High Resolution",
		25: "DTS-HD High Resolution",
		26: "DTS-HD High Resolution",
		27: "DTS-HD Master Audio"
	},

	AudioInputFreq: {
		0: "(32 kHz)",
		1: "(44.1 kHz)",
		2: "(48 kHz)",
		3: "(88.2 kHz)",
		4: "(96 kHz)",
		5: "(176.4 kHz)",
		6: "(192 kHz)"
	},

	ChannelInputFormat: {
		4: "L",
		5: "C",
		6: "R",
		7: "SL",
		8: "SR",
		9: "SBL",
		10: "SB",
		11: "SBR",
		12: "LFE",
		13: "FHL",
		14: "FHR",
		15: "FWL",
		16: "FWR",
		17: "XL",
		18: "XC",
		19: "XR"
	},

	ChannelOutputFormat: {
		25: "L",
		26: "C",
		27: "R",
		28: "SL",
		29: "SR",
		30: "SBL",
		31: "SB",
		32: "SBR",
		33: "SW",
		34: "FHL",
		35: "FHR",
		36: "FWL",
		37: "FWR"
	},

	MCACCMemory: {
		0: "NEXT",
		1: "MEMORY 1",
		2: "MEMORY 2",
		3: "MEMORY 3",
		4: "MEMORY 4",
		5: "MEMORY 5",
		6: "MEMORY 6",
		9: "PREVIOUS"
	},

	PhaseControl: {
		0: "Phase Control OFF",
		1: "Phase Control ON",
		2: "Full Band Phase Control ON",
		3: "NEXT"
	},

	VirtualDepth: {
		0: "OFF",
		1: "MIN",
		2: "MID",
		3: "MAX",
		8: "PREVIOUS",
		9: "NEXT"
	},

	SoundRetriever: {
		0: "Sound Retriever Off",
		1: "Sound Retriever On",
		8: "PREVIOUS",
		9: "NEXT"
	},

	DialogEnhancement: {
		0: "OFF",
		1: "FLAT",
		2: "UP1",
		3: "UP2",
		4: "UP3",
		5: "UP4",
		8: "DOWN",
		9: "UP"
	},

	DualMono: {
		0: "CH1 + CH2",
		1: "CH1",
		2: "CH2",
		8: "DOWN",
		9: "UP"
	},

	DynamicRangeControl: {
		0: "OFF",
		1: "AUTO",
		2: "MID",
		3: "MAX",
		8: "DOWN",
		9: "UP"
	},

	Dimmer: {
		0: "Brightness",
		1: "Bright",
		2: "Dark",
		3: "FL OFF",
		9: "NEXT"
	},

	ListeningModes: {
		"0101": "[)(]PLIIx MOVIE",
		"0102": "[)(]PLII MOVIE",
		"0103": "[)(]PLIIx MUSIC",
		"0104": "[)(]PLII MUSIC",
		"0105": "[)(]PLIIx GAME",
		"0106": "[)(]PLII GAME",
		"0107": "[)(]PROLOGIC",
		"0108": "Neo:6 CINEMA",
		"0109": "Neo:6 MUSIC",
		"010a": "XM HD Surround",
		"010b": "NEURAL SURR",
		"010c": "2ch Straight Decode",
		"010d": "[)(]PLIIz HEIGHT",
		"010e": "WIDE SURR MOVIE",
		"010f": "WIDE SURR MUSIC",
		"0110": "STEREO",
		"0111": "Neo:X CINEMA",
		"0112": "Neo:X MUSIC",
		"0113": "Neo:X GAME",
		"0114": "NEURAL SURROUND+Neo:X CINEMA",
		"0115": "NEURAL SURROUND+Neo:X MUSIC",
		"0116": "NEURAL SURROUND+Neo:X GAMES",
		"1101": "[)(]PLIIx MOVIE",
		"1102": "[)(]PLIIx MUSIC",
		"1103": "[)(]DIGITAL EX",
		"1104": "DTS +Neo:6 / DTS-HD +Neo:6",
		"1105": "ES MATRIX",
		"1106": "ES DISCRETE",
		"1107": "DTS-ES 8ch",
		"1108": "multi ch Straight Decode",
		"1109": "[)(]PLIIz HEIGHT",
		"110a": "WIDE SURR MOVIE",
		"110b": "WIDE SURR MUSIC",
		"110c": "ES Neo:X",
		"0201": "ACTION",
		"0202": "DRAMA",
		"0203": "SCI-FI",
		"0204": "MONOFILM",
		"0205": "ENT.SHOW",
		"0206": "EXPANDED",
		"0207": "TV SURROUND",
		"0208": "ADVANCEDGAME",
		"0209": "SPORTS",
		"020a": "CLASSICAL",
		"020b": "ROCK/POP",
		"020c": "UNPLUGGED",
		"020d": "EXT.STEREO",
		"020e": "PHONES SURR.",
		"020f": "FRONT STAGE SURROUND ADVANCE FOCUS",
		"0210": "FRONT STAGE SURROUND ADVANCE WIDE",
		"0211": "SOUND RETRIEVER AIR",
		"0301": "[)(]PLIIx MOVIE +THX",
		"0302": "[)(]PLII MOVIE +THX",
		"0303": "[)(]PL +THX CINEMA",
		"0304": "Neo:6 CINEMA +THX",
		"0305": "THX CINEMA",
		"0306": "[)(]PLIIx MUSIC +THX",
		"0307": "[)(]PLII MUSIC +THX",
		"0308": "[)(]PL +THX MUSIC",
		"0309": "Neo:6 MUSIC +THX",
		"030a": "THX MUSIC",
		"030b": "[)(]PLIIx GAME +THX",
		"030c": "[)(]PLII GAME +THX",
		"030d": "[)(]PL +THX GAMES",
		"030e": "THX ULTRA2 GAMES",
		"030f": "THX SELECT2 GAMES",
		"0310": "THX GAMES",
		"0311": "[)(]PLIIz +THX CINEMA",
		"0312": "[)(]PLIIz +THX MUSIC",
		"0313": "[)(]PLIIz +THX GAMES",
		"0314": "Neo:X CINEMA + THX CINEMA",
		"0315": "Neo:X MUSIC + THX MUSIC",
		"0316": "Neo:X GAMES + THX GAMES",
		"1301": "THX Surr EX",
		"1302": "Neo:6 +THX CINEMA",
		"1303": "ES MTRX +THX CINEMA",
		"1304": "ES DISC +THX CINEMA",
		"1305": "ES 8ch +THX CINEMA",
		"1306": "[)(]PLIIx MOVIE +THX",
		"1307": "THX ULTRA2 CINEMA",
		"1308": "THX SELECT2 CINEMA",
		"1309": "THX CINEMA",
		"130a": "Neo:6 +THX MUSIC",
		"130b": "ES MTRX +THX MUSIC",
		"130c": "ES DISC +THX MUSIC",
		"130d": "ES 8ch +THX MUSIC",
		"130e": "[)(]PLIIx MUSIC +THX",
		"130f": "THX ULTRA2 MUSIC",
		"1310": "THX SELECT2 MUSIC",
		"1311": "THX MUSIC",
		"1312": "Neo:6 +THX GAMES",
		"1313": "ES MTRX +THX GAMES",
		"1314": "ES DISC +THX GAMES",
		"1315": "ES 8ch +THX GAMES",
		"1316": "[)(]EX +THX GAMES",
		"1317": "THX ULTRA2 GAMES",
		"1318": "THX SELECT2 GAMES",
		"1319": "THX GAMES",
		"131a": "[)(]PLIIz +THX CINEMA",
		"131b": "[)(]PLIIz +THX MUSIC",
		"131c": "[)(]PLIIz +THX GAMES",
		"131d": "Neo:X + THX CINEMA",
		"131e": "Neo:X + THX MUSIC",
		"131f": "Neo:X + THX GAMES",
		"0401": "STEREO",
		"0402": "[)(]PLII MOVIE",
		"0403": "[)(]PLIIx MOVIE",
		"0404": "Neo:6 CINEMA",
		"0405": "AUTO SURROUND Straight Decode",
		"0406": "[)(]DIGITAL EX",
		"0407": "[)(]PLIIx MOVIE",
		"0408": "DTS +Neo:6",
		"0409": "ES MATRIX",
		"040a": "ES DISCRETE",
		"040b": "DTS-ES 8ch",
		"040c": "XM HD Surround",
		"040d": "NEURAL SURR",
		"040e": "RETRIEVER AIR",
		"040f": "Neo:X CINEMA",
		"0410": "ES Neo:X",
		"0501": "STEREO",
		"0502": "[)(]PLII MOVIE",
		"0503": "[)(]PLIIx MOVIE",
		"0504": "Neo:6 CINEMA",
		"0505": "ALC Straight Decode",
		"0506": "[)(]DIGITAL EX",
		"0507": "[)(]PLIIx MOVIE",
		"0508": "DTS +Neo:6",
		"0509": "ES MATRIX",
		"050a": "ES DISCRETE",
		"050b": "DTS-ES 8ch",
		"050c": "XM HD Surround",
		"050d": "NEURAL SURR",
		"050e": "RETRIEVER AIR",
		"050f": "Neo:X CINEMA",
		"0510": "ES Neo:X",
		"0601": "STEREO",
		"0602": "[)(]PLII MOVIE",
		"0603": "[)(]PLIIx MOVIE",
		"0604": "Neo:6 CINEMA",
		"0605": "STREAM DIRECT NORMAL Straight Decode",
		"0606": "[)(]DIGITAL EX",
		"0607": "[)(]PLIIx MOVIE",
		"0608": "(nothing)",
		"0609": "ES MATRIX",
		"060a": "ES DISCRETE",
		"060b": "DTS-ES 8ch",
		"060c": "Neo:X CINEMA",
		"060d": "ES Neo:X",
		"0701": "STREAM DIRECT PURE 2ch",
		"0702": "[)(]PLII MOVIE",
		"0703": "[)(]PLIIx MOVIE",
		"0704": "Neo:6 CINEMA",
		"0705": "STREAM DIRECT PURE Straight Decode",
		"0706": "[)(]DIGITAL EX",
		"0707": "[)(]PLIIx MOVIE",
		"0708": "(nothing)",
		"0709": "ES MATRIX",
		"070a": "ES DISCRETE",
		"070b": "DTS-ES 8ch",
		"070c": "Neo:X CINEMA",
		"070d": "ES Neo:X",
		"0881": "OPTIMUM",
		"0e01": "HDMI THROUGH",
		"0f01": "MULTI CH IN"
	},

	SelectedListeningMode: {
		"0001": "STEREO (cyclic)",
		"0010": "STANDARD",
		"0009": "STEREO (direct set)",
		"0011": "(2ch source)",
		"0013": "PRO LOGIC2 MOVIE",
		"0018": "PRO LOGIC2x MOVIE",
		"0014": "PRO LOGIC2 MUSIC",
		"0019": "PRO LOGIC2x MUSIC",
		"0015": "PRO LOGIC2 GAME",
		"0020": "PRO LOGIC2x GAME",
		"0031": "PRO LOGIC2z HEIGHT",
		"0032": "WIDE SURROUND MOVIE",
		"0033": "WIDE SURROUND MUSIC",
		"0012": "PRO LOGIC",
		"0016": "Neo:6 CINEMA",
		"0017": "Neo:6 MUSIC",
		"0028": "XM HD SURROUND",
		"0029": "NEURAL SURROUND",
		"0037": "Neo:X CINEMA",
		"0038": "Neo:X MUSIC",
		"0039": "Neo:X GAME",
		"0040": "NEURAL SURROUND+Neo:X CINEMA",
		"0041": "NEURAL SURROUND+Neo:X MUSIC",
		"0042": "NEURAL SURROUND+Neo:X GAME",
		"0021": "(Multi-ch source)",
		"0022": "(Multi-ch source)+DOLBY EX",
		"0023": "(Multi-ch source)+PRO LOGIC2x MOVIE",
		"0024": "(Multi-ch source)+PRO LOGIC2x MUSIC",
		"0034": "(Multi-ch Source)+PRO LOGIC2z HEIGHT",
		"0035": "(Multi-ch Source)+WIDE SURROUND MOVIE",
		"0036": "(Multi-ch Source)+WIDE SURROUND MUSIC",
		"0025": "(Multi-ch source)DTS-ES Neo:6",
		"0026": "(Multi-ch source)DTS-ES matrix",
		"0027": "(Multi-ch source)DTS-ES discrete",
		"0030": "(Multi-ch source)DTS-ES 8ch discrete",
		"0043": "(Multi-ch source)DTS-ES Neo:X",
		"0100": "ADVANCED SURROUND (cyclic)",
		"0101": "ACTION",
		"0103": "DRAMA",
		"0102": "SCI-FI",
		"0105": "MONO FILM",
		"0104": "ENTERTAINMENT SHOW",
		"0106": "EXPANDED THEATER",
		"0116": "TV SURROUND",
		"0118": "ADVANCED GAME",
		"0117": "SPORTS",
		"0107": "CLASSICAL",
		"0110": "ROCK/POP",
		"0109": "UNPLUGGED",
		"0112": "EXTENDED STEREO",
		"0003": "Front Stage Surround Advance Focus",
		"0004": "Front Stage Surround Advance Wide",
		"0153": "RETRIEVER AIR",
		"0113": "PHONES SURROUND",
		"0050": "THX (cyclic)",
		"0051": "PROLOGIC + THX CINEMA",
		"0052": "PL2 MOVIE + THX CINEMA",
		"0053": "Neo:6 CINEMA + THX CINEMA",
		"0054": "PL2x MOVIE + THX CINEMA",
		"0092": "PL2z HEIGHT + THX CINEMA",
		"0055": "THX SELECT2 GAMES",
		"0068": "THX CINEMA (for 2ch)",
		"0069": "THX MUSIC (for 2ch)",
		"0070": "THX GAMES (for 2ch)",
		"0071": "PL2 MUSIC + THX MUSIC",
		"0072": "PL2x MUSIC + THX MUSIC",
		"0093": "PL2z HEIGHT + THX MUSIC",
		"0073": "Neo:6 MUSIC + THX MUSIC",
		"0074": "PL2 GAME + THX GAMES",
		"0075": "PL2x GAME + THX GAMES",
		"0094": "PL2z HEIGHT + THX GAMES",
		"0076": "THX ULTRA2 GAMES",
		"0077": "PROLOGIC + THX MUSIC",
		"0078": "PROLOGIC + THX GAMES",
		"0201": "Neo:X CINEMA + THX CINEMA",
		"0202": "Neo:X MUSIC + THX MUSIC",
		"0203": "Neo:X GAME + THX GAMES",
		"0056": "THX CINEMA (for multi ch)",
		"0057": "THX SURROUND EX (for multi ch)",
		"0058": "PL2x MOVIE + THX CINEMA (for multi ch)",
		"0095": "PL2z HEIGHT + THX CINEMA (for multi ch)",
		"0059": "ES Neo:6 + THX CINEMA (for multi ch)",
		"0060": "ES MATRIX + THX CINEMA (for multi ch)",
		"0061": "ES DISCRETE + THX CINEMA (for multi ch)",
		"0067": "ES 8ch DISCRETE + THX CINEMA (for multi ch)",
		"0062": "THX SELECT2 CINEMA (for multi ch)",
		"0063": "THX SELECT2 MUSIC (for multi ch)",
		"0064": "THX SELECT2 GAMES (for multi ch)",
		"0065": "THX ULTRA2 CINEMA (for multi ch)",
		"0066": "THX ULTRA2 MUSIC (for multi ch)",
		"0079": "THX ULTRA2 GAMES (for multi ch)",
		"0080": "THX MUSIC (for multi ch)",
		"0081": "THX GAMES (for multi ch)",
		"0082": "PL2x MUSIC + THX MUSIC (for multi ch)",
		"0096": "PL2z HEIGHT + THX MUSIC (for multi ch)",
		"0083": "EX + THX GAMES (for multi ch)",
		"0097": "PL2z HEIGHT + THX GAMES (for multi ch)",
		"0084": "Neo:6 + THX MUSIC (for multi ch)",
		"0085": "Neo:6 + THX GAMES (for multi ch)",
		"0086": "ES MATRIX + THX MUSIC (for multi ch)",
		"0087": "ES MATRIX + THX GAMES (for multi ch)",
		"0088": "ES DISCRETE + THX MUSIC (for multi ch)",
		"0089": "ES DISCRETE + THX GAMES (for multi ch)",
		"0090": "ES 8CH DISCRETE + THX MUSIC (for multi ch)",
		"0091": "ES 8CH DISCRETE + THX GAMES (for multi ch)",
		"0204": "Neo:X + THX CINEMA (for multi ch)",
		"0205": "Neo:X + THX MUSIC (for multi ch)",
		"0206": "Neo:X + THX GAMES (for multi ch)",
		"0005": "AUTO SURR/STREAM DIRECT (cyclic)",
		"0006": "AUTO SURROUND",
		"0151": "Auto Level Control (A.L.C.)",
		"0007": "DIRECT",
		"0008": "PURE DIRECT",
		"0152": "OPTIMUM SURROUND"
	}
};