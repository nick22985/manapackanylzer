import chalk from 'chalk';

const fs = require('fs').promises;
const path = require('path');
const __dirname = path.resolve();

async function loadFile(dir, basePath) {
	const filePath = path.join(__dirname, dir);
	const files = await fs.readdir(filePath);
	const textureBasePath = basePath + '/assets/minecraft/textures/';
	for (const file of files) {
		const stat = await fs.lstat(path.join(filePath, file));
		if (stat.isDirectory()) loadFile(path.join(dir, file), basePath);
		if (file.endsWith('.json')) {
			const data = await fs.readFile(path.join(filePath, file), 'utf8');
			const json = JSON.parse(data);
			const texture = json.textures;
			const overrides = json.overrides;

			if (overrides) {
				overrides.forEach(async (override) => {
					const overrideTexture = override.textures;
					if (overrideTexture) {
						const overrideTextureArray = Object.keys(overrideTexture);
						overrideTextureArray.forEach(async (overrideTextureObj) => {
							const overrideTexturePath = overrideTexture[overrideTextureObj];
							let filePath = overrideTexturePath + '.png';
							try {
								let textureExists = await fs.lstat(path.join(textureBasePath, filePath));
							} catch (e) {
								console.log(`Texture does not exist: ${textureBasePath.replace(/\//g, '\\')}${filePath.replace(/\//g, '\\')}, JSON Path: ${dir.replace(/\//g, '\\')}\\${file.replace(/\//g, '\\')}, Override: ${overrideTextureObj}`);
							}
						});
					}
				});
			}
			if (!overrides && texture) {
				const textureArray = Object.keys(texture);
				textureArray.forEach(async (textureObj) => {
					const texturePath = texture[textureObj];
					let filePath = texturePath + '.png';
					try {
						let textureExists = await fs.lstat(path.join(textureBasePath, filePath));
					} catch (e) {
						console.log(`Texture does not exist: ${textureBasePath.replace(/\//g, '\\')}${filePath.replace(/\//g, '\\')}, JSON Path: ${dir.replace(/\//g, '\\')}\\${file.replace(/\//g, '\\')}, Texture: ${textureObj}`);
					}
				});
			}
		}
	}
}

export async function mcPackAnalyzer(options) {
	console.log(`${chalk.blue('[MPA]')}${chalk.blueBright.bold('[Info]')} In progress ...`);
	// Load up the files that are responsible for assigning images to the textures
	const modelBase = options.path + '/assets/minecraft/models/item';
	// get all the files in the model folder
	const filePath = path.join(__dirname, options.path);

	loadFile(modelBase, filePath);
}
