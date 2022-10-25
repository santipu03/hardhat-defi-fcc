const { ethers, getNamedAccounts } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address ${lendingPool.address}`)

    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

    // Approve token!
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    // Deposit!
    console.log("Depositing WETH...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    // Get our borrow data!
    let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)

    // Get the DAI price
    const daiPrice = await getDaiPrice()

    // Get the DAI quantity to borrow
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`We can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())

    // Borrow DAI
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)

    // Get our borrow data!
    await getBorrowUserData(lendingPool, deployer)
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH.toString() / 10 ** 18} ETH deposited`)
    console.log(`You have ${totalDebtETH.toString() / 10 ** 18} ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH.toString() / 10 ** 18} ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getDaiPrice() {
    // For this contract, we don't need to connect to our wallet bc we'll be only reading from it
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString() / 10 ** 18}`)
    return price
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log(`You've borrowed!`)
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
