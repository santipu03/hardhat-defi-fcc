const { getNamedAccounts, ethers } = require("hardhat")
const getWeth = require("./getWeth")

async function main() {
    await getWeth()
    const { deployer } = getNamedAccounts()

    // lending pool addresses provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // lending pool: ^

    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address ${lendingPool.address}`)

    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool
}

async function approveErc20(
    contractAddress,
    spenderAddress,
    amountToSpend,
    account
) {}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
