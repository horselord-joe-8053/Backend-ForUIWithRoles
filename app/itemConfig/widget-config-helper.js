// import {default as configs} from './widget-config.json'; // error 'Cannot use import statement outside a module'; jjw: TODO: why???
// const {configs} = require('./widget-config.json'); // jjw: this {} won't work as ur JSON file contains an array; https://stackoverflow.com/a/54261375
const configs = require('./widget-config.json'); 

const logger = require("../utils/logger");



var loadedConfig = {};

// export class ConfigHelper extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);

//     this.state = {
//       content: ""
//     };
//   }

//   componentDidMount() { 
//     this.setState({
//       content: "[SectionResidents] componentDidMount"
//     });

//   }
// }


loadConfigs(); 

console.log("after loadConfigs(), loadedConfig:\n", JSON.stringify(loadedConfig, null, '\t'));

// function AddEdit ({match} : RouteComponentProps<IItemId>) {
// export function loadConfigs() { // got error [SyntaxError: Unexpected token 'export'] jjw: TODO: why???

function loadConfigs() {	

	configs.map(config => {
		console.log("config key:'" + config.key + "'");
		var configKey = config.key;
		// loadedConfig = {
		// 	[config.key] : config
		// };
		loadedConfig[configKey.toUpperCase()] = config;
	})
}

// jjw: TODO: how to get the function usable locally and externally ???
// export function getLoadedConfig(configKey) {
var getLoadedConfig = (configKey) => { 
	// console.log("getConfig(), loadedConfig:\n", JSON.stringify(loadedConfig, null, '\t'));

	var config = loadedConfig[configKey.toUpperCase()];
	// console.log("getConfig() for configKey:'" + configKey + "': \n", JSON.stringify(config, null, '\t'));
	return config;
}

exports.getConfigMsgLabel = (configKey) => {
	var config = getLoadedConfig(configKey);
	let itemLabel = config["itemMsgLabel"] ? config["itemMsgLabel"] : "item";
	logger.logAsStr("getConfigMsgLabel", "configKey", configKey);
	logger.logAsStr("getConfigMsgLabel", "itemLabel", itemLabel);

	return itemLabel;
}

// export function getConfigAddEditLayout(configKey) {
exports.getConfigAddEditLayout = (configKey) => {
	var config = getLoadedConfig(configKey);
	return config["addEditLayout"];
}

// export function getLoadedConfigFieldsMap(configKey) {
exports.getLoadedConfigFieldsMap = (configKey) => {
	var config = getLoadedConfig(configKey);
	return config["fieldsMap"];
}

