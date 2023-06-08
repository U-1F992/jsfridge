#!/usr/bin/env node

import fs from "fs";
import path from "path";
import url from "url";

import puppeteer from "puppeteer";

function parseArgumentValue(args: string[], optionName: string) {
    const option = args.find(arg => arg.startsWith(`${optionName}=`));
    return option ? option.split("=")[1] : null;
}

function parseArguments() {
    const args = process.argv.slice(2);
    const input = parseArgumentValue(args, "--input");
    const output = parseArgumentValue(args, "--output");
    return { input, output };
}

async function stabilizeScripts(input: url.URL) {
    const browser = await puppeteer.launch({ headless: "new" });
    try {
        const page = await browser.newPage();
        await page.goto(input.href);
        await page.evaluate(`document.querySelectorAll("script").forEach(tag => tag.remove());`);
        return await page.content();

    } finally {
        await browser.close();
    }
}

const { input, output } = parseArguments();
if (input === null) {
    throw new Error("No input file specified.");
}
const inputFile = path.resolve(input);
if (!(fs.existsSync(inputFile) && fs.lstatSync(inputFile).isFile())) {
    throw new Error(`Input file "${inputFile}" is missing.`);
}

const inputURL = url.pathToFileURL(inputFile);
const html = await stabilizeScripts(inputURL);

if (output === null) {
    console.log(html);
} else {
    const outputFile = path.resolve(output);
    fs.writeFileSync(outputFile, html);
}
