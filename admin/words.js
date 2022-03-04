// eslint-disable-next-line
/*global systemDictionary:true */
"use strict";

systemDictionary = {
	"pioneer_sc_vsx_adapter_settings": {
		"en": "Adapter settings for Pioneer SC/VSX",
		"de": "Adaptereinstellungen für Pioneer SC/VSX"
	},
	"tab_connection": {
		"en": "Connection",
		"de": "Verbindung"
	},
	"tab_settings": {
		"en": "Settings",
		"de": "Einstellungen"
	},
	"tab_features": {
		"en": "Features",
		"de": "Funktionen"
	},
	"settings_device": {
		"en": "Device Settings:",
		"de": "Geräte Einstellungen:"
	},
	"settings_states": {
		"en": "Statevariables:",
		"de": "Statusvariablen:"
	},
	"host": {
		"en": "Hostname/IP address",
		"de": "Hostname/IP-Adresse",
	},
	"port": {
		"en": "TCP Port",
		"de": "TCP-Port",
	},
	"port_tooltip": {
		"en": "usually port 23 (e.g. VSX-921) or 8102 (e.g. VSX-S510 or VSX-922)",
		"de": "üblicherweise 23 (z.B. für VSX-921) oder 8102 (z.B. für VSX-S510 oder VSX-922)",
	},
	"clearOnDisconnect": {
		"en": "Clear values on disconnect",
		"de": "Werte löschen, wenn getrennt"
	},
	"clearOnDisconnect_tooltip": {
		"en": "Sets all states to (null) if connection to device is lost",
		"de": "Setzt alle States auf (null), wenn die Verbindung zum Gerät unterbrochen ist"
	},
	"autoreconnect": {
		"en": "Auto reconnect (sec.)",
		"de": "Autom. neuverbinden (Sek.)",
	},
	"autoreconnect_tooltip": {
		"en": "when device is not reachable try to reconnect every xx seconds (0 = no retry)",
		"de": "wenn Gerät nicht erreichbar ist, wird alle x Sekunden eine Neuverbindung versucht (0 = keine Neuverbindung)",
	},
	"volumeMin": {
		"en": "Limit min. volume to:",
		"de": "min. Lautstärke limitieren auf:"
	},
	"volumeMin_tooltip": {
		"en": "-80dB displayed on device as 1, 0dB displayed on device as 161 and +12dB displayed on device as 185",
		"de": "-80dB am Gerät als 1 angezeigt, 0dB am Gerät als 161 angezeigt und +12dB am Gerät als 185 angezeigt"
	},
	"volumeMax": {
		"en": "Limit max. volume to:",
		"de": "max. Lautstärke limitieren auf:"
	},
	"volumeMax_tooltip": {
		"en": "-80dB displayed on device as 1, 0dB displayed on device as 161 and +12dB displayed on device as 185",
		"de": "-80dB am Gerät als 1 angezeigt, 0dB am Gerät als 161 angezeigt und +12dB am Gerät als 185 angezeigt"
	},
	"showCustomInputNames": {
		"en": "Show custom input names",
		"de": "Zeige benutzerdefinierte Namen für Eingänge"
	},
	"showCustomInputNames_tooltip": {
		"en": "Shows the name configured in device instead of the default name in 'selectedInput'",
		"de": "Zeigt den im Gerät konfigurierten Namen anstelle des standard Namen in 'selectedInput'"
	},
	"emulateStateChanges": {
		"en": "Emulate state",
		"de": "Status emulieren"
	},
	"emulateStateChanges_tooltip": {
		"en": "If set, new state values acknowledged after transmitted, without device response",
		"de": "Wenn gesetzt, werden neue Statuswerte ohne Rückmeldung des Geräts auf bestätig gesetzt."
	},
	"removeUnusedStates": {
		"en": "Remove unused state variables",
		"de": "Lösche nicht genutzte Status-Variablen"
	},
	"removeUnusedStates_tooltip": {
		"en": "Removes state variables that not been used anymore on restart",
		"de": "Entfernt Status-Variablen die nicht mehr benötigt werden bei neustart"
	},
	"FEATURE:BASE": {
		"en": "Base functions",
		"de": "Basis Funktionen"
	},
	"FEATURE:BASE_tooltip": {
		"en": "Power, Display, Input, Volume, Mute",
		"de": "Power, Anzeige, Eingang, Lautstärke, Stumm"
	},
	"FEATURE:BtnVolUpDown": {
		"en": "Buttons for Volume Up/Down",
		"de": "Knöpfe für Lautstärke +/-"
	},
	"FEATURE:NetRadio": {
		"en": "Net Radio",
		"de": "Netzwerk Radio"
	},
	"FEATURE:NetRadio_tooltip": {
		"en": "Station, Description, Bitrate, Icon",
		"de": "Sender, Beschreibung, Bitrate, Icon",
	},
	"FEATURE:ToneControl": {
		"en": "Tone Control",
		"de": "Ton Einstellungen"
	},
	"FEATURE:ToneControl_tooltip": {
		"en": "On/Off, Bass, Treble",
		"de": "An/Aus, Bässe, Höhen",
	},
	"FEATURE:AudioStatusInfo": {
		"en": "Audio Status Information",
		"de": "Audio Status Informationen"
	},
	"FEATURE:AudioStatusInfo_tooltip": {
		"en": "Signal, Channel Input-/Output-Format",
		"de": "Signal, Kanal Ein-/Ausgangsformat"
	},
	"FEATURE:DspSettings": {
		"en": "DSP Settings",
		"de": "DSP Einstellungen"
	},
	"FEATURE:DspSettings_tooltip": {
		"en": "Signal Source, EQ, DualMono, Dialog Enhancer, DNR, DRC, MCACC, PhaseControl, ...",
		"de": "Signal Quelle, EQ, DualMono, Dialog Enhancer, DNR, DRC, MCACC, PhaseControl, ..."
	},
};