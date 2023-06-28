const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

// Stringify the token object paths
StyleDictionary.registerTransform({
	name: 'vsCodeName',
	type: 'name',
	transformer: ({ path, name }) => {
		if (path[0] !== 'syntax') return path.join('.');
		if (path[0] === 'syntax' && name === '*') return path.slice(1, -1).join('.');
		return path.slice(1).join('.');
	},
});

// Register file formatter
StyleDictionary.registerFormat({
	name: 'vsCodeTheme',
	formatter: (dictionary, { variant }) => {
		const main = variant === 'jyn';

		const theme = {
			name: `JYN ${main ? '' : ` - ${variant}`}`,
			type: main ? 'dark' : variant,
			colors: {},
		};

		dictionary.allProperties
			.filter((token) => {
				return !['color', 'theme', 'tw', 'syntax'].includes(token.path[0]);
			})
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

// Get Variants & Build each one
const themesDirPath = path.join(process.cwd(), '/themes');

fs.readdirSync(themesDirPath)
	.filter((dirent) => !['application', 'syntax', 'config.json5'].includes(dirent))
	.forEach((theme) => {
		StyleDictionary.extend({
			source: [`themes/config.json5`, `themes/${theme}/*.json5`, `tokens/application/*.json5`, `tokens/syntax/*.json5`],
			platforms: {
				vscode: {
					buildPath: `build/`,
					variant: theme,
					transforms: [`vsCodeName`],
					files: [
						{
							destination: `${theme}.color-theme.json`,
							format: `vsCodeTheme`,
						},
					],
				},
			},
		}).buildAllPlatforms();
	});
