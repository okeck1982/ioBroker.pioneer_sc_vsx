"use strict";

const PioneerTypes = require("./PioneerTypes");

/**
 * @type {Object.<string, PioneerTypes.Property>}
 * NOTE:
 * ===========================================================================================
 * Internal-Properties:
 * --------------------
 * Property Names that start with a '#' are marked as internal and NOT accessible (read/write) outside the IPControl class
 *
 * Sub-Properties:
 * ---------------
 * You can define sub properties, with <prop-base>.!(<name1>|<name2>|<name3>) for returning more than one value,
 * EXAMPLE:
 * 	'test.!(a|b|c) is translatet to 'test.a', 'test.b', 'test.c'
 * 	Make sure that the rx tranform returns an object containing properties 'a','b' and 'c'
 *
 */
const propertyDefinition = {
	"#inputNames": {
		qy: { flags: "C", cmd: PioneerTypes.RenameableInputIDs.map((v) => "?RGB" + v.toString().padStart(2, "0")) },
		rx: { match: "^RGB([0-9]{2})([0-9])(.+)$", transform: (v) => {  return { id: parseInt(v[0]), isRenamed: v[1], name: v[2].trim() }; } }
	},
	"general.power": {
		qy: { flags: "C", cmd: "?P" },
		tx: { transform: (v) => ((v==true) ? "PO" : "PF") },
		rx: { match: "^PWR([0-1])$", transform: (v) => v[0] == "0" },
		meta: { type: "boolean", role: "switch" }
	},
	"general.selectedInput": {
		qy: { flags: "C", cmd: "?F" },
		tx: { match: "^[0-9]{1,2}$", transform: (v) => (v.toString().padStart(2, "0") + "FN") },
		rx: { match: "^FN([0-9]{2})$", transform: (v) => parseInt(v[0]), update: ["audio.status.inputSignal", "audio.dsp.*", "audio.toneControl.*"] },
		meta: { type: "string", role: "variable", states: PioneerTypes.SelectedInput }
	},
	"general.display": {
		qy: { flags: "C", cmd: "?FL" },
		rx: {
			match: "^FL[0-9a-fA-F]{2}([0-9a-fA-F]+)$",
			transform: (v) => {
				let r = "";
				// Decode Display Data
				for (let i = 0; i < v[0].length; i += 2) {
					r += String.fromCharCode(parseInt(v[0].substring(i, i+2), 16));
				}
				// Translate special Chars to Readable
				PioneerTypes.CharMap.forEach((val,key) => r = r.replace(key,val));
				return r;
			}
		},
		meta: { type: "string", role: "variable" }
	},
	"audio.volume": {
		qy: { flags: "C", cmd: "?V" },
		tx: { transform: (v) => (((2*(-80-v)-1)*-1).toString().padStart(3, "0") + "VL") },
		rx: { match: "^VOL([0-9]{3})$", transform: (v) => (12 - (0.5 * (185 - parseInt(v[0])))) },
		meta: { type: "number", role: "variable", unit: " dB" }
	},
	"audio.buttonVolumeUp": {
		feature: "BtnVolUpDown",
		tx: { transform: () => "VU" },
		meta: { type: "boolean", role: "button" }
	},
	"audio.buttonVolumeDown": {
		feature: "BtnVolUpDown",
		tx: { transform: () => "VD" },
		meta: { type: "boolean", role: "button" }
	},
	"audio.mute": {
		qy: { flags: "C", cmd: "?M" },
		tx: { transform: (v) => ((v) ? "MO" : "MF") },
		rx: { match: "^MUT([0-1])$", transform: (v) => (v[0] == "0") },
		meta: { type: "boolean", role: "switch" }
	},
	"amp.speakerSelect": {
		qy: { flags: "C", cmd: "?SPK" },
		tx: { match: "^[0-3,9]$", transform: (v) => v.toString() + "SPK" },
		rx: { match: "^SPK([0-3])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.SpeakerSelect }
	},
	"amp.hdmiOutput": {
		qy: { flags: "C", cmd: "?HO" },
		tx: { match: "^[0-29]", transform: (v) => v.toString() + "HO" },
		rx: { match: "^HO([0-2])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.HdmiOutput }
	},
	"amp.hdmiAudio": {
		qy: { flags: "C", cmd: "?HA" },
		tx: { match: "^[019]{1}$", transform: (v) => v.toString() + "HA" },
		rx: { match: "^HA([019])$", transform: (v) => parseInt(v[0]), update: ["audio.status.inputSignal"] },
		meta: { type: "number", role: "variable", states: PioneerTypes.HdmiAudio }
	},
	"amp.dimmer": {
		tx: { match: "^[0-39]{1}$", transform: (v) => v.toString() + "SAA" },
		rx: { match: "^SAA([0-3])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.Dimmer }
	},
	"amp.sleepTimer": {
		qy: { flags: "C", cmd: "?SAB" },
		tx: { match: "^(0|30|60|90|999){1}$", transform: (v) => v.toString().padStart(3,"0") + "SAB" },
		rx: { match: "^SAB([0-9]{3})$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.SleepTimer }
	},
	"audio.dsp.signalSource": {
		feature: "DspSettings",
		qy: { flags: "C", cmd: "?SDA" },
		tx: { match: "^[0-39]{1}$", transform: (v) => v.toString() + "SDA" },
		rx: { match: "^SDA([0-39])$", transform: (v) => parseInt(v[0]), update: ["audio.status.inputSignal"] },
		meta: { type: "number", role: "variable", states: PioneerTypes.SignalSource }
	},

	"audio.dsp.mcaccMemory": {
		feature: "DspSettings",
		qy: { flags: "C", cmd: "?MC" },
		tx: { match: "^[0-69]{1}$", transform: (v) => v.toString() + "MC" },
		rx: { match: "^MC([0-6])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.MCACCMemory }
	},

	"audio.dsp.phaseControl": {
		feature: "DspSettings",
		qy: { flags: "C", cmd: "?IS" },
		tx: { match: "^[0-29]{1}$", transform: (v) => v.toString() + "IS" },
		rx: { match: "^IS([0-2])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "variable", states: PioneerTypes.PhaseControl }
	},

	"audio.dsp.virtualSurroundBack": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?VSB" },
		tx: { transform: (v) => ((v == true) ? "1" : "0") + "VSB" },
		rx: { match: "^VSB([0-1])$", transform: (v) => v[0] == "1", update: ["audio.status.inputSignal"] },
		meta: { type: "boolean", role: "switch" }
	},

	"audio.dsp.virtualHeight": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?VHT" },
		tx: { transform: (v) => ((v == true) ? "1" : "0") + "VHT" },
		rx: { match: "^VHT([0-1])$", transform: (v) => v[0] == "1", update: ["audio.status.inputSignal"] },
		meta: { type: "boolean", role: "switch" }
	},

	"audio.dsp.virtualDepth": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?VDP" },
		tx: { match: "^[0-389]{1}$", transform: (v) => v + "VDP" },
		rx: { match: "^VDP([0-3])$", transform: (v) => parseInt(v[0]), update: ["audio.status.inputSignal"] },
		meta: { type: "number", role: "switch", states: PioneerTypes.VirtualDepth }
	},

	"audio.dsp.digitalNoiseReduction": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATG" },
		tx: { transform: (v) => ((v == true) ? "1" : "0") + "ATG" },
		rx: { match: "^ATG([0-1])$", transform: (v) => v[0] == "1" },
		meta: { type: "boolean", role: "switch" }
	},

	"audio.dsp.standingWaveCorrection": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATD" },
		tx: { transform: (v) => ((v == true) ? "1" : "0") + "ATD" },
		rx: { match: "^ATD([0-1])$", transform: (v) => v[0] == "1" },
		meta: { type: "boolean", role: "switch" }
	},

	"audio.dsp.EQ": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATC" },
		tx: { transform: (v) => ((v == true) ? "1" : "0") + "ATC" },
		rx: { match: "^ATC([0-1])$", transform: (v) => v[0] == "1" },
		meta: { type: "boolean", role: "switch" }
	},


	"audio.dsp.soundRetriever": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATA" },
		tx: { match: "^[0-189]{1}$", transform: (v) => v + "ATA" },
		rx: { match: "^ATA([0-1])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "switch", states: PioneerTypes.SoundRetriever }
	},

	"audio.dsp.dialogEnhancement": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATH" },
		tx: { match: "^[0-589]{1}$", transform: (v) => v + "ATH" },
		rx: { match: "^ATH([0-5])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "switch", states: PioneerTypes.DialogEnhancement }
	},

	"audio.dsp.DualMono": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATJ" },
		tx: { match: "^[0-289]{1}$", transform: (v) => v + "ATJ" },
		rx: { match: "^ATJ([0-2])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "switch", states: PioneerTypes.DualMono }
	},

	"audio.dsp.dynamicRangeControl": {
		feature: "DspSettings",
		qy: { flags: "CW", cmd: "?ATL" },
		tx: { match: "^[0-389]{1}$", transform: (v) => v + "ATL" },
		rx: { match: "^ATL([0-3])$", transform: (v) => parseInt(v[0]) },
		meta: { type: "number", role: "switch", states: PioneerTypes.DynamicRangeControl }
	},

	"audio.listeningMode.selected": {
		qy: { flags: "C", cmd: "?S" },
		tx: { match: "^[0-9]{4}$", transform: (v) => v + "SR" },
		rx: { match: "^SR([0-9]{4})$", transform: (v) => v[0], update: ["audio.status.inputSignal"] },
		meta: { type: "string", role: "variable", states: PioneerTypes.SelectedListeningMode }
	},
	"audio.listeningMode.current": {
		qy: { flags: "C", cmd: "?L" },
		rx: { match: "^LM([0-9a-fA-F]{4})$", transform: (v) => PioneerTypes.ListeningModes[v[0]], update: ["audio.status.inputSignal"] },
		meta: { type: "string", role: "variable" }
	},
	"audio.status.!(signal|channelInFormat|channelOutFormat)": {
		feature: "AudioStatusInfo",
		qy: { flags: "C", cmd: "?AST" },
		rx: {
			match: "^AST([0-9]{2})([0-9]{2})([0-1]{21})([0-1]{18})$",
			transform: (v) => {
				const cIn =  ["L", "C", "R", "SL", "SR", "SBL", "SB", "SBR", "LFE", "FHL", "FHR", "FWL", "FWR", "XL", "XC", "XR"];
				const cOut = ["L", "C", "R", "SL", "SR", "SBL", "SB", "SBR",  "SW", "FHL", "FHR", "FWL", "FWR"];

				const ci = Array(), co = Array();
				for(let i=0; i<v[2].length; i++) {
					if(v[2][i] == "1") { ci.push(cIn[i]); }
					if(i < cOut.length && v[3][i] == "1" ) { co.push(cOut[i]); }
				}

				return {
					signal: PioneerTypes.AudioInputCodec[parseInt(v[0])] + " " + PioneerTypes.AudioInputFreq[parseInt(v[1])],
					channelInFormat: ci.join(","),
					channelOutFormat: co.join(",")
				};
			}
		},
		meta: { type: "string", role: "variable" }
	},
	"audio.toneControl.enabled": {
		feature: "ToneControl",
		qy: { flags: "C", cmd: "?TO" },
		tx: { transform: (v) => (v ? "1" : "0") + "TO" },
		rx: { match: "^TO([0-1])$", transform: (v) => v[0] == "1" },
		meta: { type: "boolean", role: "switch" }
	},
	"audio.toneControl.bass": {
		feature: "ToneControl",
		qy: { flags: "C", cmd: "?BA" },
		tx: { transform: (v) => ((((v*-1)<-6)?-6:(((v*-1)>6)?6:(v*-1)))+6).toString().padStart(2,"0") + "BA" },
		rx: { match: "^BA([0-9]{2})$", transform: (v) => (parseInt(v[0]) - 6) *-1 },
		meta: { type: "number", role: "variable", unit: " dB" }
	},
	"audio.toneControl.treble": {
		feature: "ToneControl",
		qy: { flags: "C", cmd: "?TR" },
		tx: { transform: (v) => ((((v*-1)<-6)?-6:(((v*-1)>6)?6:(v*-1)))+6).toString().padStart(2,"0") + "TR" },
		rx: { match: "^TR([0-9]{2})$", transform: (v) => (parseInt(v[0]) - 6) *-1 },
		meta: { type: "number", role: "variable", unit: " dB" }
	},
	"netradio.station": {
		feature: "NetRadio",
		rx: { match: "^GEP02020(.+)$", transform: (v) => v[0] },
		meta: { type: "string", role: "variable" }
	},
	"netradio.bitrate": {
		feature: "NetRadio",
		rx: { match: "^GEP06029(.+)$", transform: (v) => v[0] },
		meta: { type: "string", role: "media.bitrate" }
	},
	"netradio.description": {
		feature: "NetRadio",
		rx: { match: "^GEP01032(.+)$", transform: (v) => v[0] },
		meta: { type: "string", role: "variable" }
	},
	"netradio.icon": {
		feature: "NetRadio",
		rx: { match: "^GIC049(.+)$", transform: (v) => v[0] },
		meta: { type: "string", role: "text.url" }
	}
};



module.exports = propertyDefinition;