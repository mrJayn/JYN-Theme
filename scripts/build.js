const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

// Get Variants
const themesDirPath = path.join(process.cwd(), '/themes');
const THEME_VARIANTS = fs.readdirSync(themesDirPath).filter((dirent) => !['config.json5'].includes(dirent));

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

// Register file formatter
StyleDictionary.registerFormat({
	name: 'vsCodeTheme',
	formatter: (dictionary, config) => {
		// Base
		const theme = {
			name: `JYN ${config.themeType}`,
			type: config.themeType,
			colors: {},
		};

		// Colors
		dictionary.allProperties
			.filter((token) => {
				return !['color', 'theme', 'tw', 'syntax'].includes(token.path[0]);
			})
			.forEach((token) => {
				theme.colors[token.name] = token.value;
			});

		// Token Colors
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
		source: [`themes/config.json5`, `themes/${themeType}/*.json5`, `tokens/application/*.json5`, `tokens/syntax/*.json5`],
		platforms: {
			vscode: {
				buildPath: `build/`,
				themeType: ['dark', 'light'].includes(themeType) ? themeType : 'dark',
				transforms: [`vsCodeName`],
				files: [
					{
						destination: `${themeType}.color-theme.json`,
						format: `vsCodeTheme`,
					},
				],
			},
		},
	}).buildAllPlatforms();
});
