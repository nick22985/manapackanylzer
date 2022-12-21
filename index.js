const fs = require('fs').promises;
const path = require('path');

async function loadFile(dir) {
	const filePath = path.join(__dirname, dir);
	const files = await fs.readdir(filePath);
	const textureBasePath = './manacube/assets/minecraft/textures/';
	for (const file of files) {
		const stat = await fs.lstat(path.join(filePath, file));
		if (stat.isDirectory()) loadFile(path.join(dir, file));
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
								console.log('Texture does not exist: ' + textureBasePath + filePath);
								console.log('JSON PATH ' + dir + '\\' + file);
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
						console.log('Texture does not exist: ' + textureBasePath + filePath);
						console.log('JSON PATH ' + dir + '\\' + file);
					}
				});
			}
		}
	}
}

function main() {
	// Load up the files that are responsible for assigning images to the textures
	const basePath = './manacube/';
	const modelBase = basePath + 'assets/minecraft/models/item';
	// get all the files in the model folder
	loadFile(modelBase);
}

main();
