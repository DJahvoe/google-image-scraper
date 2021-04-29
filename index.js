const puppeteer = require('puppeteer');
const fs = require('fs');
const chalk = require('chalk');
const { DELAY, CLICK_OFFSET, IMAGE_COUNT } = require('./config');

const vocabList = fs.readFileSync('./VocabList.txt', 'utf-8');
const vocabListArr = vocabList.split('\r\n');
vocabListArr.forEach((vocab, index) => {
	setTimeout(() => {
		scrape(vocab);
	}, DELAY * IMAGE_COUNT * index);
});

const scrape = async (word) => {
	console.log(chalk.blueBright.bold(`${word} scraping started.`));
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(
		`https://www.google.com/search?q=${word}&tbm=isch&hl=en&safe=strict&tbs=il:cl&sa=X&ved=0CAAQ1vwEahcKEwio_cDi7aLwAhUAAAAAHQAAAAAQAg&biw=1519&bih=763`
	);
	const imageUrls = await page.evaluate(
		({ DELAY, CLICK_OFFSET, IMAGE_COUNT }) => {
			return new Promise((resolve, reject) => {
				let urlCollection = [];
				const imageResults = document.getElementsByClassName('rg_i Q4LuWd');
				[...imageResults].forEach((imageResult, index) => {
					if (index < IMAGE_COUNT) {
						setTimeout(() => {
							imageResult.click();
						}, index * DELAY);

						let openedImage;
						setTimeout(() => {
							const blackPanel = document.getElementById('islsp');
							openedImage = blackPanel.querySelector('[src^=http]');
							console.log(openedImage.src);
							urlCollection.push(openedImage.src);
							// resolve(openedImage.src);
						}, index * DELAY + CLICK_OFFSET);
					}
				});
				setTimeout(() => {
					resolve(urlCollection);
				}, DELAY * IMAGE_COUNT + CLICK_OFFSET);
			});
		},
		{ DELAY, CLICK_OFFSET, IMAGE_COUNT }
	);

	for (let index = 0; index < imageUrls.length; index++) {
		const imageUrl = imageUrls[index];
		const viewSource = await page.goto(imageUrl);
		const dir = `./images/${word}`;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		fs.writeFileSync(`${dir}/${word}-${index}.jpg`, await viewSource.buffer());
		console.log(
			chalk.yellowBright(`[${index + 1}/${imageUrls.length}] ${word} finished.`)
		);
	}
	console.log(chalk.greenBright.bold(`${word} scraping finished.`));
	await browser.close();
};

// scrape('Агне');
