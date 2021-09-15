#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

/**
 * Returns VPN of memory address. Assumes page size of 4096.
 */
function extractVPN(mem) {
	// Page size is 4096 (12 bites).
	// Mem reference is hexadecimal, so offset is 3 characters.
	const offsetLen = 3; 
	return mem.slice(0, mem.length - offsetLen);	
}

/**
 * For each memory address, prints the VPN.
 */
async function processEachLine() {
	const fileStream = fs.createReadStream('mem-refs.txt');
	const rl = readline.createInterface({
		input: fileStream
	});

	for await (const line of rl) {
		const vpn = extractVPN(line);
		const vpnDec = parseInt(vpn, 16);
		console.log(vpnDec);
	}
}

processEachLine();
