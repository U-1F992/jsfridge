#!/usr/bin/env node

import assert from "assert";
import fs from "fs";
import path from "path";
import url from "url";

import { JSDOM } from "jsdom";
import puppeteer from "puppeteer";

function parseArgumentValue(args, optionName) {
    const option = args.find(arg => arg.startsWith(`${optionName}=`));
    return option ? option.split('=')[1] : null;
}

function removeScriptTags(html) {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    document.querySelectorAll("script").forEach(tag => tag.remove());
    return dom.serialize();
}

const args = process.argv.slice(2);

const input = parseArgumentValue(args, '--input');
assert.notStrictEqual(input, null, "No input file specified.");
const inputFile = path.resolve(input);
assert.ok(fs.existsSync(inputFile) && fs.lstatSync(inputFile).isFile(), "Input file is missing.");

const output = parseArgumentValue(args, '--output');

const browser = await puppeteer.launch({ headless: "new" });
try {
    const page = await browser.newPage();
    await page.goto(url.pathToFileURL(inputFile));
    const html = removeScriptTags(await page.content());

    if (output === null) {
        console.log(html);
    } else {
        const outputFile = path.resolve(output);
        fs.writeFileSync(outputFile, html);
    }
} finally {
    await browser.close();
}
