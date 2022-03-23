import { Component } from "react";
import {default as configs} from './widget-config.json';

type Props = {};

type State = {
  content: string;
}

// jjw: without the following, compilation error:
// jjw: 	Element implicitly has an 'any' type because expression of type 'string' 
// jjw: 	can't be used to index type '{}'. No index signature with a 
// jjw: 	parameter of type 'string' was found on type '{}'.
// jjw: https://stackoverflow.com/a/57438249
var loadedConfig : { [key: string]: any } = {};

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
export function loadConfigs() : void {

	console.log("loadConfigs(), from config json file\n", JSON.stringify(configs, null, '\t'));

	configs.map(config => {
		console.log("config key:'" + config.key + "'");
		var configKey = config.key;
		// loadedConfig = {
		// 	[config.key] : config
		// };
		loadedConfig[configKey.toUpperCase()] = config;
	})
}

export function getLoadedConfig(configKey : string) : any {
	// console.log("getConfig(), loadedConfig:\n", JSON.stringify(loadedConfig, null, '\t'));

	var config = loadedConfig[configKey.toUpperCase()];
	// console.log("getConfig() for configKey:'" + configKey + "': \n", JSON.stringify(config, null, '\t'));
	return config;
}

export function getConfigAddEditLayout(configKey : string) : string[][] {
	var config = getLoadedConfig(configKey);
	return config["addEditLayout"];
}

export function getLoadedConfigFieldsMap(configKey : string) : string[][] {
	var config = getLoadedConfig(configKey);
	return config["fieldsMap"];
}

