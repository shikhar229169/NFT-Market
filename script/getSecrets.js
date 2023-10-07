const { ethers } = require("hardhat")
const {
    SubscriptionManager,
    SecretsManager,
    simulateScript,
    ResponseListener,
    ReturnType,
    decodeResult,
    createGist,
    deleteGist,
    FulfillmentCode,
} = require("@chainlink/functions-toolkit");
require("dotenv").config()

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const signer = wallet.connect(provider);

    const secrets = { GC_API_KEY: process.env.GC_API_KEY }
    const secretsManager = new SecretsManager({
        signer: signer,
        functionsRouterAddress: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
        donId: "fun-polygon-mumbai-1",
    });

    await secretsManager.initialize();

    // Encrypt secrets
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);
    

    console.log(`Creating gist...`);
    const githubApiToken = process.env.GITHUB_API_TOKEN;
    if (!githubApiToken)
        throw new Error(
            "githubApiToken not provided - check your environment variables"
        );

    // Create a new GitHub Gist to store the encrypted secrets
    const gistURL = await createGist(
        githubApiToken,
        JSON.stringify(encryptedSecretsObj)
    );
    console.log(`\n✅Gist created ${gistURL} . Encrypt the URLs..`);
    const encryptedSecretsUrls = await secretsManager.encryptSecretsUrls([
        gistURL,
    ]);
    console.log();
    console.log();
    console.log(encryptedSecretsUrls);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })