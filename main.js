#!/usr/bin/env node

import assert from "assert";
import fs from "fs";
import path from "path";
import url from "url";

import { JSDOM } from "jsdom";
import puppeteer from "puppeteer";

function parseArgumentValue(args, optionName) {
    const option = args.find(arg => arg.startsWith(`${optionName}=`));
    return option ? option.split('=')[1] : "";
}

function removeScriptTags(html) {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    document.querySelectorAll("script").forEach(tag => tag.remove());
    return dom.serialize();
}

const args = process.argv.slice(2);

const input = path.resolve(parseArgumentValue(args, '--input'));
assert(fs.existsSync(input), "Input file is missing.");

const rawOutput = parseArgumentValue(args, '--output');
const output = path.resolve(rawOutput);

const browser = await puppeteer.launch({ headless: "new" });
try {
    const page = await browser.newPage();
    await page.goto(url.pathToFileURL(input));
    const html = removeScriptTags(await page.content());

    if (rawOutput === "") {
        console.log(html);
    } else {
        fs.writeFileSync(output, html);
    }
} finally {
    await browser.close();
}
