const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

const VARIANTS_FOLDER_PATH = path.join(process.cwd(), '/src/variants');

StyleDictionary.registerTransform({
	name: 'vsCodeName',
	type: 'name',
	transformer: ({ path, name }) => {
		if (path[0] !== 'syntax') return path.join('.');
		if (path[0] === 'syntax' && name === '*') return path.slice(1, -1).join('.');
		return path.slice(1).join('.');
	},
});

StyleDictionary.registerFormat({
	name: 'vsCodeTheme',
	formatter: (dictionary, { variant }) => {
		const theme = {
			name: `JYN-Theme-${variant}`,
			type: 'dark',
			colors: {},
		};

		dictionary.allProperties
			.filter((token) => !['color', 'theme', 'tw', 'syntax'].includes(token.path[0]))
			.forEach((token) => {
				theme.colors[token.name] = token.value;
			});

		theme.tokenColors = dictionary.allProperties
			.filter(({ path }) => path[0] === 'syntax')
			.map((token) => ({
				scope: token.name,
				settings: {
					foreground: token.value,
					fontStyle: token.fontStyle,
				},
			}));

		return JSON.stringify(theme, null, 2);
	},
});

fs.readdirSync(VARIANTS_FOLDER_PATH).forEach((variant) => {
	StyleDictionary.extend({
		source: [`src/jyn.theme.config.json5`, `src/variants/${variant}/*.json5`, `src/tokens/application/*.json5`, `src/tokens/syntax/*.json5`],
		platforms: {
			vscode: {
				buildPath: `build/`,
				variant: variant,
				transforms: [`vsCodeName`],
				files: [
					{
						destination: `JYN-Theme-${variant}.json`,
						format: `vsCodeTheme`,
					},
				],
			},
		},
	}).buildAllPlatforms();
});
