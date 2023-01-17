/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');

const channelName = 'cursochannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUserSergio';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			//result = await contract.evaluateTransaction('ReadAsset', 'asset13');
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//console.log('\n--> Evaluate Transaction: AssetExists, function returns "true" if an asset with given assetID exist');
			//result = await contract.evaluateTransaction('AssetExists', 'asset1');
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//console.log('\n--> Submit Transaction: UpdateAsset asset1, change the appraisedValue to 350');
			//await contract.submitTransaction('UpdateAsset', 'asset1', 'blue', '5', 'Tomoko', '350');
			//console.log('*** Result: committed');

			//console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			//result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			//console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			//result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
