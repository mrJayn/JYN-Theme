const StyleDictionary = require('style-dictionary');

const THEME_VARIANTS = [`dark`, `light`];

// Stringify the token object paths
StyleDictionary.registerTransform({
	name: 'vsCodeName',
	type: 'name',
	transformer: (token) => {
		if (token.path[0] === 'syntax') {
			if (token.name === '*') {
				return token.path.slice(1, -1).join('.');
			} else {
				return token.path.slice(1).join('.');
			}
		} else {
			return token.path.join('.');
		}
	},
});

// Create a formatter for VSCode Theme JSONs
StyleDictionary.registerFormat({
	name: 'vsCodeTheme',
	formatter: (dictionary, config) => {
		const theme = {
			name: `JYN ${config.themeType}`,
			type: config.themeType,
			colors: {},
		};

		dictionary.allProperties
			.filter((token) => {
				return !['color', 'tw', 'syntax'].includes(token.path[0]);
			})
			.forEach((token) => {
				theme.colors[token.name] = token.value;
			});

		theme.tokenColors = dictionary.allProperties
			.filter((token) => {
				return token.path[0] === 'syntax';
			})
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

//  Build each of the theme variants
THEME_VARIANTS.forEach((themeType) => {
	StyleDictionary.extend({
		source: [`tokens/core.json5`, `tokens/${themeType}/*.json5`, `tokens/application/*.json5`, `tokens/syntax/*.json5`],
		platforms: {
			vscode: {
				buildPath: `build/`,
				themeType: themeType,
				transforms: [`vsCodeName`],
				files: [
					{
						destination: `jyn-${themeType}.color-theme.json`,
						format: `vsCodeTheme`,
					},
				],
			},
		},
	}).buildAllPlatforms();
});
