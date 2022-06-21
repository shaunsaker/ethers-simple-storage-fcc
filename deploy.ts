import { ethers } from "ethers"
import fs from "fs-extra"
import "dotenv/config"

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider)

  // another way to store our PRIVATE_KEY
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
  // @ts-ignore
  // let wallet = new ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD || ""
  // );
  // wallet = await wallet.connect(provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  )
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)

  console.log("Deploying, please wait...")
  const contract = await contractFactory.deploy()
  await contract.deployTransaction.wait(1)

  // another way of deploying the contract
  // console.log("Let's deploy with only transaction data!");
  // const nonce = await wallet.getTransactionCount();
  // TODO: Question: How to properly type tx?
  // const tx = {
  //   nonce,
  //   gasPrice: 20000000000,
  //   gasLimit: 6721975,
  //   to: undefined,
  //   value: 0,
  //   data: `0x${binary}`,
  //   chainId: 5777,
  // };
  // // signs and sends the transaction
  // const sentTxResponse = await wallet.sendTransaction(tx);

  // TODO: Question: How to type contract using abi? It's on any, but should be a generic generated from abi.
  const currentFavoriteNumber = await contract.retrieve()
  console.log(currentFavoriteNumber.toString())

  const transactionResponse = await contract.store("7")
  const transactionReceipt = await transactionResponse.wait(1)

  const updatedFavoriteNumber = await contract.retrieve()
  console.log(updatedFavoriteNumber.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
