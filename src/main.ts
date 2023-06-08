#!/usr/bin/env node

import fs from "fs";
import path from "path";
import url from "url";

import puppeteer from "puppeteer";

function parseArguments() {
    const args = process.argv.slice(2);
    return { input: args.at(0), output: args.at(1) };
}

function fileExists(path: string) {
    return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

async function freezeScripts(input: url.URL) {
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
if (typeof input === "undefined") {
    throw new Error("No input file specified.");
}
const inputFile = path.resolve(input);
if (!fileExists(inputFile)) {
    throw new Error(`Input file "${inputFile}" is missing.`);
}

const inputURL = url.pathToFileURL(inputFile);
const html = await freezeScripts(inputURL);

if (typeof output === "undefined") {
    console.log(html);
} else {
    const outputFile = path.resolve(output);
    fs.writeFileSync(outputFile, html);
}
